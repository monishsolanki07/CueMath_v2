import os
import uuid
import base64
import asyncio
import re
import random
import io
import pdfplumber
import edge_tts
from gtts import gTTS
from fastapi import FastAPI, WebSocket, UploadFile, File, Form, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Optional
import urllib.request
from dotenv import load_dotenv

# --- SDK IMPORTS ---
from google import genai
from google.genai import types

# --- CONFIGURATION ---
load_dotenv()
API_KEY = os.getenv("API_KEY")

# Timeout for any single LLM call (seconds)
LLM_TIMEOUT = 90

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- IN-MEMORY SESSION STORE ---
sessions: Dict[str, "InterviewSession"] = {}


# ─────────────────────────────────────────────
#  HARDCODED FALLBACK QUESTIONS
#  (used when ALL LLM tiers fail)
# ─────────────────────────────────────────────
HARDCODED_QUESTIONS = [
    "Seems like our servers are a bit busy, till then can you please share your past teaching experiences? We will use this response for current evaluation and reschedule the interview soon. Inconvinience caused is deeply regretted.",
    "Our system is having trouble generating the next question at the moment. Could you please tell me about a time you had to explain a complex topic to someone? This will help us evaluate your teaching approach. Inconvinience caused is deeply regretted.",
    "Apologies, I'm having some trouble coming up with the next question right now. In the meantime, could you share how you would handle a situation where a student is struggling to understand a concept? This will help us assess your communication and teaching skills. Inconvinience caused is deeply regretted.",
    "I'm experiencing a slight delay in my connection. While I resolve this, could you describe your preferred teaching style or philosophy? This will help us understand your classroom approach. Inconvinience caused is deeply regretted.",
    "It seems I'm having a momentary technical glitch. To keep things moving, could you tell me about a time you successfully motivated a student who was disinterested in the subject? Inconvinience caused is deeply regretted.",
    
]

SILENCE_NUDGES = [
    "Take your time — I'm still here. Could you share your thoughts on that?",
    "No rush at all! Even a partial answer is perfectly fine. What comes to mind first?",
    "It's okay to think out loud. What would you say to start?",
]


def clean_text_for_tts(text: str) -> str:
    text = re.sub(r'\*', '', text)
    text = re.sub(r'#', '', text)
    return text.strip()


# ─────────────────────────────────────────────
#  MULTI-TIER LLM CALLER
#  Tier 1 → gemini-2.5-flash-lite   (fastest, lowest traffic)
#  Tier 2 → gemini-3.1-flash-lite-preview  (high-volume lite)
#  Tier 3 → gemini-2.5-flash        (full flash)
#  Tier 4 → gemini-2.5-pro          (heaviest, last resort)
#  Final  → None  (caller uses hardcoded fallback)
# ─────────────────────────────────────────────
GEMINI_MODEL_CHAIN = [
    "gemini-2.5-flash-lite",           # Fastest/cheapest — try first
    "gemini-3.1-flash-lite-preview",   # High-volume lite model
    "gemini-2.5-flash",                # Full flash (higher capacity)
    "gemini-2.5-pro",                  # Heaviest, last resort
]


async def call_llm_with_fallback(
    client: genai.Client,
    system_instruction: str,
    history: list,          # list of {"role": "user"/"model", "parts": [str]}
    prompt: str,
    timeout: int = LLM_TIMEOUT,
) -> Optional[str]:
    """
    Try each Gemini model in GEMINI_MODEL_CHAIN.
    Returns the text response, or None if all fail / timeout.
    """
    for model_name in GEMINI_MODEL_CHAIN:
        try:
            print(f"🔄 Trying model: {model_name}")

            # Rebuild a fresh chat with the correct history for each attempt
            chat = client.aio.chats.create(
                model=model_name,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.7,
                ),
                history=history,
            )

            response = await asyncio.wait_for(
                chat.send_message(prompt),
                timeout=timeout,
            )

            print(f"✅ Success with model: {model_name}")
            return clean_text_for_tts(response.text)

        except asyncio.TimeoutError:
            print(f"⏱️ Timeout ({timeout}s) on model: {model_name}")
        except Exception as e:
            print(f"⚠️ Error on model {model_name}: {e}")

    print("❌ ALL LLM TIERS FAILED — falling back to hardcoded questions.")
    return None


# ─────────────────────────────────────────────
#  SESSION CLASS
# ─────────────────────────────────────────────
class InterviewSession:
    def __init__(self, resume_text: str, jd_text: str):
        self.resume_text = resume_text
        self.jd_text = jd_text
        self.transcript = []
        self.question_count = 0
        self.max_questions = 10

        self.voice_id = "en-US-AriaNeural"
        self.backup_tld = "us"

        # Tracks how many hardcoded questions have been used
        self.hardcoded_index = 0

        self.client = genai.Client(api_key=API_KEY)

        self.system_instruction = f"""
        You are an expert Educational Recruiter, Donna/Alice/Rose/Lucy. Your role is to test the candidate's (the user's) ability to teach, explain complex topics, and simplify them so effectively that a small child could understand. You are also strictly evaluating their communication clarity, patience, and English fluency.
        
        CONTEXT:
        RESUME: {self.resume_text[:3000]}
        SUBJECT/ROLE CONTEXT: {self.jd_text[:1500]}
        
        INTERVIEW STRUCTURE:
        0. Introduction: Welcome the candidate, introduce yourself as the recruiter, and ask them for a brief introduction.
        1. The Simplification Test: Pick a complex topic from their resume or the provided context and ask them to explain it as if you were a 7-year-old child.
        2. Roleplay / Cross-Questioning: Act like the confused 7-year-old student. Ask a naive or silly follow-up question based on their explanation to test their patience, analogies, and ability to pivot their teaching style.
        3. Teaching Methodology: Ask how they assess if a student has actually internalized a concept versus just rote memorizing it.
        4. Fluency & Scenario: Present a brief classroom scenario (e.g., a student not paying attention or a difficult parent) and ask how they would handle the communication.
        5. Conclusion: End the interview politely.
        
        RULES:
        - ONE question at a time.
        - Be concise and conversational (spoken style).
        - Do not break character.
        - If user says "TIME_IS_UP_SIGNAL", conclude immediately.
        """

        # We now manage history manually so we can replay it across model retries
        self.history = []   # list of genai history dicts

    def _get_next_hardcoded(self) -> Optional[str]:
        """Return next hardcoded question, or None if exhausted."""
        if self.hardcoded_index < len(HARDCODED_QUESTIONS):
            q = HARDCODED_QUESTIONS[self.hardcoded_index]
            self.hardcoded_index += 1
            return q
        return "Thank you so much for your time. The interview has now concluded. Please wait for your feedback."

    def _append_history(self, role: str, text: str):
        """Append a turn to our manual history tracker."""
        self.history.append({
            "role": role,
            "parts": [{"text": text}],
        })

    async def get_next_response(
        self,
        user_input: str = None,
        is_silence_trigger: bool = False,
        is_time_up: bool = False,
    ):
        # ── Build the prompt ──────────────────────────────────────────
        if is_time_up:
            prompt = "Time is up. Briefly thank the candidate and end the interview."
        elif is_silence_trigger:
            prompt = "The candidate is silent. As the recruiter, politely nudge them to answer."
        elif self.question_count == 0 and not user_input:
            prompt = "Start the interview. Introduce yourself briefly."
        else:
            prompt = (
                f'Candidate Answer: "{user_input}"\n'
                "Instructions: Evaluate the answer. Cross-question if needed, acting as a student if appropriate. "
                "Otherwise ask the next question. Keep your response short and conversational."
            )

        # ── If max questions hit, wrap up ─────────────────────────────
        if self.question_count >= self.max_questions:
            return "The interview is now over. I will generate your feedback.", True

        # ── Call LLM chain with full history ──────────────────────────
        ai_text = await call_llm_with_fallback(
            client=self.client,
            system_instruction=self.system_instruction,
            history=list(self.history),   # pass a copy
            prompt=prompt,
            timeout=LLM_TIMEOUT,
        )

        # ── Fallback: use hardcoded question ──────────────────────────
        used_fallback = False
        if ai_text is None:
            if is_silence_trigger:
                ai_text = random.choice(SILENCE_NUDGES)
            elif is_time_up:
                ai_text = "Time is up. Thank you so much for your time today. The interview has concluded."
            else:
                ai_text = self._get_next_hardcoded()
            used_fallback = True
            print(f"🆘 Using hardcoded fallback: {ai_text[:60]}...")

        # ── Update manual history (only real turns, not silence nudges)
        if not is_silence_trigger:
            if user_input:
                self._append_history("user", user_input)
            self._append_history("model", ai_text)

        self.question_count += 1

        self.transcript.append(f"User: {user_input if user_input else '[SILENCE]'}")
        self.transcript.append(f"AI (Recruiter): {ai_text}")

        is_finished = (
            "interview is now over" in ai_text.lower()
            or "time is up" in ai_text.lower()
            or self.question_count >= self.max_questions
        )

        return ai_text, is_finished

    async def generate_feedback(self):
        transcript_text = "\n".join(self.transcript)
        prompt = f"""
        Here is the full interview transcript:
        {transcript_text}
        
        Based on this transcript, provide detailed feedback as a Lead Educator evaluating this teaching candidate.
        Structure:
        1. **Ability to Simplify Concepts**: Did they use good analogies? Could a child understand them?
        2. **Communication & English Fluency**: Assess their grammar, tone, clarity, and pacing.
        3. **Teaching Methodology**: How well did they handle cross-questions and assess understanding?
        4. **Areas for Improvement**: Specific constructive criticism.
        5. **Overall Teaching Score (0-100%)**
        6. **FINAL REMARKS**
        """

        # For feedback, try LLM chain directly (no chat history needed)
        ai_text = await call_llm_with_fallback(
            client=self.client,
            system_instruction="You are an expert educational evaluator. Be honest, structured, and constructive.",
            history=[],
            prompt=prompt,
            timeout=LLM_TIMEOUT,
        )

        if ai_text is None:
            # Minimal hardcoded feedback
            ai_text = (
                "Thank you for completing the interview.\n\n"
                "**Feedback Summary**\n"
                "Our system encountered a technical issue generating detailed feedback at this time. "
                "However, based on your responses, here are some general pointers:\n\n"
                "1. **Simplification**: Focus on using everyday analogies when explaining complex topics.\n"
                "2. **Communication**: Speak slowly and clearly; pause between ideas.\n"
                "3. **Teaching Methodology**: Always check for understanding by asking the student to repeat back in their own words.\n"
                "4. **Areas for Improvement**: Practice patience when students ask repetitive questions.\n"
                "5. **Overall Score**: Unable to compute — please contact support.\n"
                "6. **Final Remarks**: Thank you for your time. We'll be in touch soon."
            )

        return clean_text_for_tts(ai_text)


# ─────────────────────────────────────────────
#  3-LAYER AUDIO GENERATION
# ─────────────────────────────────────────────
async def generate_audio_stream(text: str, voice_id: str, backup_tld: str) -> str:
    # Layer 1: EdgeTTS
    try:
        communicate = edge_tts.Communicate(text, voice_id)
        mp3_data = b""

        async def run_edge():
            nonlocal mp3_data
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    mp3_data += chunk["data"]

        await asyncio.wait_for(run_edge(), timeout=5.0)

        if len(mp3_data) > 0:
            print("✅ EdgeTTS Success")
            return base64.b64encode(mp3_data).decode("utf-8")

    except asyncio.TimeoutError:
        print("⚠️ Layer 1 (EdgeTTS) TIMEOUT")
    except Exception as e:
        print(f"⚠️ Layer 1 (EdgeTTS) Error: {e}")

    # Layer 2: gTTS Standard US (Failsafe)
    try:
        print("🔄 Falling back to Standard US gTTS...")

        def run_gtts_std():
            fp = io.BytesIO()
            tts = gTTS(text=text, lang='en', tld='us')
            tts.write_to_fp(fp)
            fp.seek(0)
            return fp.read()

        gtts_data = await asyncio.to_thread(run_gtts_std)
        return base64.b64encode(gtts_data).decode("utf-8")

    except Exception as e:
        print(f"❌ ALL AUDIO LAYERS FAILED: {e}")
        return ""


# ─────────────────────────────────────────────
#  API ENDPOINTS
# ─────────────────────────────────────────────
@app.get("/")
def health_check():
    return {"status": "active"}


@app.post("/upload-context")
async def upload_context(
    resume: UploadFile = File(None),
    resume_text: str = Form(None),
    jd: str = Form(...),
):
    final_resume_text = ""
    if resume:
        with pdfplumber.open(resume.file) as pdf:
            for page in pdf.pages:
                final_resume_text += page.extract_text() or ""
    elif resume_text:
        final_resume_text = resume_text

    session_id = str(uuid.uuid4())
    sessions[session_id] = InterviewSession(final_resume_text, jd)
    return {"session_id": session_id}


@app.websocket("/ws/interview/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()

    if session_id not in sessions:
        await websocket.close(code=4004, reason="Session not found")
        return

    session = sessions[session_id]

    # Keep-alive pinger to prevent server sleep
    async def keep_alive_ping():
        while True:
            await asyncio.sleep(60)
            try:
                port = int(os.getenv("PORT", 8000))
                reader, writer = await asyncio.open_connection("127.0.0.1", port)
                writer.write(b"GET / HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n")
                await writer.drain()
                writer.close()
                await writer.wait_closed()
            except Exception:
                pass

    ping_task = asyncio.create_task(keep_alive_ping())

    try:
        # ── Initial question ─────────────────────────────────────────
        ai_text, _ = await session.get_next_response(user_input=None)
        audio_b64 = await generate_audio_stream(ai_text, session.voice_id, session.backup_tld)
        await websocket.send_json({"type": "audio", "data": audio_b64, "text": ai_text})

        # ── Main loop ────────────────────────────────────────────────
        while True:
            data = await websocket.receive_json()
            user_text = data.get("text")
            msg_type = data.get("type")

            is_silence = (msg_type == "silence_timeout")
            is_time_up = (msg_type == "time_up")
            is_end = (msg_type == "end_interview")  # Frontend END button pressed

            # ── Handle END button immediately — no AI call needed ────
            if is_end:
                farewell = (
                    "Thank you so much for your time today! "
                    "It was a pleasure speaking with you. "
                    "We will be in touch with your feedback shortly. Have a wonderful day!"
                )
                audio_b64 = await generate_audio_stream(farewell, session.voice_id, session.backup_tld)
                await websocket.send_json({"type": "audio", "data": audio_b64, "text": farewell})

                feedback_text = await session.generate_feedback()
                full_transcript = "\n".join(session.transcript)
                await websocket.send_json({
                    "type": "feedback",
                    "text": feedback_text,
                    "transcript": full_transcript,
                    "is_finished": True,
                })
                # Clean close — frontend receives the close event
                await websocket.close(code=1000, reason="Interview ended by user")
                break

            # Notify frontend that we're processing (prevents "dead" feeling)
            await websocket.send_json({"type": "thinking"})

            ai_text, is_finished = await session.get_next_response(
                user_text,
                is_silence_trigger=is_silence,
                is_time_up=is_time_up,
            )

            audio_b64 = await generate_audio_stream(ai_text, session.voice_id, session.backup_tld)

            if is_finished:
                await websocket.send_json({"type": "audio", "data": audio_b64, "text": ai_text})
                feedback_text = await session.generate_feedback()
                full_transcript = "\n".join(session.transcript)
                await websocket.send_json({
                    "type": "feedback",
                    "text": feedback_text,
                    "transcript": full_transcript,
                    "is_finished": True,
                })
                # Clean close after natural interview completion
                await websocket.close(code=1000, reason="Interview complete")
                break
            else:
                await websocket.send_json({"type": "audio", "data": audio_b64, "text": ai_text})

    except WebSocketDisconnect:
        if session_id in sessions:
            del sessions[session_id]
        print(f"Session {session_id} disconnected cleanly")
    except Exception as e:
        print(f"❌ WebSocket error in session {session_id}: {e}")
        try:
            await websocket.send_json({"type": "error", "message": "A server error occurred. Please try again."})
        except Exception:
            pass
    finally:
        if session_id in sessions:
            del sessions[session_id]
        ping_task.cancel()
        print(f"Session {session_id} cleaned up")