import Link from 'next/link';

export default function Home() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #0a0a0f;
          --surface: #111118;
          --surface2: #1a1a24;
          --border: rgba(255,255,255,0.07);
          --accent: #e8c97e;
          --accent2: #7e9ce8;
          --text: #f0eee8;
          --muted: #7a7980;
          --green: #6edba0;
        }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: 'DM Sans', sans-serif;
          overflow-x: hidden;
        }

        /* NAV */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.25rem 3rem;
          background: rgba(10,10,15,0.85);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border);
        }
        .nav-logo {
          font-family: 'DM Serif Display', serif;
          font-size: 1.3rem;
          color: var(--accent);
          letter-spacing: 0.01em;
        }
        .nav-links { display: flex; gap: 2rem; }
        .nav-links a {
          color: var(--muted); font-size: 0.875rem; text-decoration: none;
          letter-spacing: 0.04em; text-transform: uppercase;
          transition: color 0.2s;
        }
        .nav-links a:hover { color: var(--text); }
        .nav-cta {
          padding: 0.55rem 1.25rem;
          background: var(--accent);
          color: #0a0a0f;
          border: none; border-radius: 2rem;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600; font-size: 0.85rem;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          text-decoration: none;
        }
        .nav-cta:hover { opacity: 0.88; transform: translateY(-1px); }

        /* HERO */
        .hero {
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center;
          padding: 8rem 2rem 5rem;
          position: relative;
          overflow: hidden;
        }
        .hero-bg {
          position: absolute; inset: 0; z-index: 0;
          background:
            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(232,201,126,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 60% 50% at 80% 80%, rgba(126,156,232,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 10% 60%, rgba(110,219,160,0.05) 0%, transparent 60%);
        }
        .hero-grid {
          position: absolute; inset: 0; z-index: 0;
          background-image:
            linear-gradient(var(--border) 1px, transparent 1px),
            linear-gradient(90deg, var(--border) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 70%);
        }
        .hero-tag {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.35rem 1rem;
          background: rgba(232,201,126,0.1);
          border: 1px solid rgba(232,201,126,0.25);
          border-radius: 2rem;
          color: var(--accent);
          font-size: 0.78rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 2rem;
          position: relative; z-index: 1;
          animation: fadeUp 0.6s ease both;
        }
        .hero-tag-dot {
          width: 6px; height: 6px;
          background: var(--green);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }
        .hero h1 {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(3rem, 7vw, 6rem);
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin-bottom: 1.5rem;
          position: relative; z-index: 1;
          animation: fadeUp 0.7s 0.1s ease both;
        }
        .hero h1 em {
          font-style: italic;
          color: var(--accent);
        }
        .hero-sub {
          font-size: 1.15rem;
          color: var(--muted);
          max-width: 520px;
          line-height: 1.7;
          margin-bottom: 3rem;
          position: relative; z-index: 1;
          animation: fadeUp 0.7s 0.2s ease both;
        }
        .hero-actions {
          display: flex; align-items: center; gap: 1rem;
          position: relative; z-index: 1;
          animation: fadeUp 0.7s 0.3s ease both;
        }
        .btn-primary {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.9rem 2rem;
          background: var(--accent);
          color: #0a0a0f;
          border: none; border-radius: 0.5rem;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600; font-size: 1rem;
          cursor: pointer; text-decoration: none;
          transition: all 0.2s;
          box-shadow: 0 0 40px rgba(232,201,126,0.2);
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 60px rgba(232,201,126,0.35);
        }
        .btn-secondary {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.9rem 2rem;
          background: transparent;
          color: var(--text);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 1rem;
          cursor: pointer; text-decoration: none;
          transition: all 0.2s;
        }
        .btn-secondary:hover {
          background: var(--surface);
          border-color: rgba(255,255,255,0.15);
        }
        .hero-stats {
          display: flex; align-items: center; gap: 2.5rem;
          margin-top: 4rem;
          position: relative; z-index: 1;
          animation: fadeUp 0.7s 0.4s ease both;
        }
        .stat { text-align: center; }
        .stat-num {
          font-family: 'DM Serif Display', serif;
          font-size: 2.2rem;
          color: var(--text);
        }
        .stat-num span { color: var(--accent); }
        .stat-label { font-size: 0.8rem; color: var(--muted); margin-top: 0.2rem; }
        .stat-divider { width: 1px; height: 40px; background: var(--border); }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* INTERVIEW CTA BANNER */
        .interview-banner {
          margin: 0 3rem;
          padding: 2.5rem 3rem;
          background: linear-gradient(135deg, rgba(126,156,232,0.12) 0%, rgba(232,201,126,0.08) 100%);
          border: 1px solid rgba(126,156,232,0.2);
          border-radius: 1.25rem;
          display: flex; align-items: center; justify-content: space-between;
          gap: 2rem;
          position: relative; overflow: hidden;
        }
        .interview-banner::before {
          content: '';
          position: absolute; top: -50%; right: -10%;
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(126,156,232,0.1), transparent 70%);
          border-radius: 50%;
        }
        .interview-banner-text h2 {
          font-family: 'DM Serif Display', serif;
          font-size: 1.7rem;
          margin-bottom: 0.5rem;
        }
        .interview-banner-text p { color: var(--muted); font-size: 0.95rem; }
        .interview-banner-text p strong { color: var(--accent2); }
        .btn-interview {
          display: inline-flex; align-items: center; gap: 0.6rem;
          padding: 0.85rem 1.75rem;
          background: var(--accent2);
          color: #fff;
          border: none; border-radius: 0.5rem;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600; font-size: 0.95rem;
          cursor: pointer; text-decoration: none;
          transition: all 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
          box-shadow: 0 0 30px rgba(126,156,232,0.25);
        }
        .btn-interview:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 50px rgba(126,156,232,0.4);
        }
        .btn-interview svg { transition: transform 0.2s; }
        .btn-interview:hover svg { transform: translateX(3px); }

        /* SECTIONS */
        .section { padding: 6rem 3rem; }
        .section-tag {
          font-size: 0.75rem; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--accent);
          margin-bottom: 0.75rem;
        }
        .section-title {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(2rem, 3.5vw, 3rem);
          line-height: 1.15;
          margin-bottom: 1rem;
        }
        .section-sub { color: var(--muted); font-size: 1rem; max-width: 480px; line-height: 1.7; }

        /* HOW IT WORKS */
        .how-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
          max-width: 1100px;
          margin: 0 auto;
        }
        .steps { display: flex; flex-direction: column; gap: 2rem; margin-top: 3rem; }
        .step { display: flex; gap: 1.25rem; align-items: flex-start; }
        .step-num {
          font-family: 'DM Serif Display', serif;
          font-size: 2.5rem;
          color: rgba(232,201,126,0.2);
          line-height: 1;
          min-width: 48px;
        }
        .step-body h3 { font-size: 1.05rem; font-weight: 600; margin-bottom: 0.3rem; }
        .step-body p { color: var(--muted); font-size: 0.9rem; line-height: 1.6; }

        .how-visual {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 1.25rem;
          padding: 2.5rem;
          position: relative;
        }
        .profile-card {
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 1rem;
          padding: 1.5rem;
          display: flex; align-items: center; gap: 1.25rem;
          margin-bottom: 1rem;
        }
        .avatar {
          width: 52px; height: 52px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.4rem;
          flex-shrink: 0;
        }
        .profile-info h4 { font-size: 0.95rem; font-weight: 600; }
        .profile-info p { font-size: 0.8rem; color: var(--muted); margin-top: 0.15rem; }
        .profile-tags { display: flex; gap: 0.4rem; margin-top: 0.5rem; flex-wrap: wrap; }
        .tag {
          padding: 0.2rem 0.6rem;
          background: rgba(232,201,126,0.1);
          border: 1px solid rgba(232,201,126,0.2);
          border-radius: 1rem;
          font-size: 0.72rem;
          color: var(--accent);
        }
        .tag.blue {
          background: rgba(126,156,232,0.1);
          border-color: rgba(126,156,232,0.2);
          color: var(--accent2);
        }
        .tag.green {
          background: rgba(110,219,160,0.1);
          border-color: rgba(110,219,160,0.2);
          color: var(--green);
        }
        .match-badge {
          position: absolute; top: 1.5rem; right: 1.5rem;
          background: rgba(110,219,160,0.15);
          border: 1px solid rgba(110,219,160,0.3);
          border-radius: 2rem;
          padding: 0.3rem 0.8rem;
          font-size: 0.78rem; color: var(--green); font-weight: 600;
        }

        /* FEATURES */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          max-width: 1100px;
          margin: 3rem auto 0;
        }
        .feature-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 1rem;
          padding: 2rem;
          transition: border-color 0.2s, transform 0.2s;
        }
        .feature-card:hover {
          border-color: rgba(232,201,126,0.2);
          transform: translateY(-3px);
        }
        .feature-icon {
          font-size: 2rem; margin-bottom: 1.25rem;
          display: block;
        }
        .feature-card h3 { font-size: 1.05rem; font-weight: 600; margin-bottom: 0.5rem; }
        .feature-card p { font-size: 0.875rem; color: var(--muted); line-height: 1.65; }

        /* TESTIMONIALS */
        .test-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem; max-width: 1100px; margin: 3rem auto 0;
        }
        .test-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 1rem;
          padding: 1.75rem;
        }
        .test-stars { color: var(--accent); font-size: 0.9rem; margin-bottom: 1rem; }
        .test-quote { font-size: 0.9rem; color: var(--muted); line-height: 1.7; margin-bottom: 1.5rem; font-style: italic; }
        .test-author { display: flex; align-items: center; gap: 0.75rem; }
        .test-avatar {
          width: 38px; height: 38px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem;
          background: var(--surface2);
        }
        .test-name { font-size: 0.875rem; font-weight: 600; }
        .test-role { font-size: 0.78rem; color: var(--muted); }

        /* BOTTOM CTA */
        .bottom-cta {
          margin: 0 3rem 6rem;
          background: linear-gradient(135deg, var(--surface) 0%, var(--surface2) 100%);
          border: 1px solid var(--border);
          border-radius: 1.5rem;
          padding: 5rem 3rem;
          text-align: center;
          position: relative; overflow: hidden;
        }
        .bottom-cta::before {
          content: '';
          position: absolute; top: -100px; left: 50%;
          transform: translateX(-50%);
          width: 600px; height: 300px;
          background: radial-gradient(ellipse, rgba(232,201,126,0.07), transparent 70%);
        }
        .bottom-cta h2 {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(2rem, 4vw, 3.5rem);
          margin-bottom: 1rem;
          position: relative;
        }
        .bottom-cta p {
          color: var(--muted); font-size: 1rem; margin-bottom: 2.5rem;
          position: relative;
        }
        .bottom-actions { display: flex; gap: 1rem; justify-content: center; position: relative; }

        /* FOOTER */
        .footer {
          border-top: 1px solid var(--border);
          padding: 2rem 3rem;
          display: flex; align-items: center; justify-content: space-between;
        }
        .footer-brand {
          font-family: 'DM Serif Display', serif;
          font-size: 1.1rem; color: var(--accent);
        }
        .footer-copy { font-size: 0.8rem; color: var(--muted); text-align: center; }
        .footer-copy a { color: var(--accent2); text-decoration: none; }
        .footer-links { display: flex; gap: 1.5rem; }
        .footer-links a { font-size: 0.8rem; color: var(--muted); text-decoration: none; }
        .footer-links a:hover { color: var(--text); }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo">EduHire</div>
        <div className="nav-links">
          <a href="#how">How it Works</a>
          <a href="#features">Features</a>
          <a href="#testimonials">Reviews</a>
        </div>
        <Link href="/interview" className="nav-cta">Start Interview →</Link>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="hero-tag">
          <span className="hero-tag-dot" />
          Now live — AI-Powered Teacher Hiring
        </div>
        <h1>Hire <em>exceptional</em><br />educators, faster.</h1>
        <p className="hero-sub">
          EduHire connects schools and institutions with vetted, qualified teachers — from screening to interview, all in one intelligent platform.
        </p>
        <div className="hero-actions">
          <a href="/interview" className="btn-primary">Start Interview Now →</a>
          <a href="#features" className="btn-secondary">See How It Works</a>
        </div>
        <div className="hero-stats">
          <div className="stat">
            <div className="stat-num">12<span>K+</span></div>
            <div className="stat-label">Qualified Teachers</div>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <div className="stat-num">840<span>+</span></div>
            <div className="stat-label">Schools Hiring</div>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <div className="stat-num">98<span>%</span></div>
            <div className="stat-label">Placement Rate</div>
          </div>
        </div>
      </section>

      {/* INTERVIEW CTA BANNER */}
      <div className="interview-banner">
        <div className="interview-banner-text">
          <h2>Ready to screen candidates?</h2>
          <p>Launch an <strong>AI-assisted interview</strong> right now — evaluate teaching skills, communication, and subject expertise in minutes.</p>
        </div>
        <Link href="/interview" className="btn-interview">
          Go to Interview Page
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </Link>
      </div>

      {/* HOW IT WORKS */}
      <section className="section" id="how">
        <div className="how-grid">
          <div>
            <div className="section-tag">Process</div>
            <h2 className="section-title">From posting to placement<br />in days, not months.</h2>
            <p className="section-sub">Our streamlined pipeline removes the friction from teacher recruitment so you can focus on building great learning environments.</p>
            <div className="steps">
              <div className="step">
                <div className="step-num">01</div>
                <div className="step-body">
                  <h3>Post Your Requirements</h3>
                  <p>Describe the role, subject, grade level, and qualifications. Our AI refines your listing for maximum reach.</p>
                </div>
              </div>
              <div className="step">
                <div className="step-num">02</div>
                <div className="step-body">
                  <h3>AI-Matched Candidates</h3>
                  <p>Our algorithm surfaces the most relevant profiles from thousands of verified educators instantly.</p>
                </div>
              </div>
              <div className="step">
                <div className="step-num">03</div>
                <div className="step-body">
                  <h3>Interview & Decide</h3>
                  <p>Run structured AI-assisted interviews, review scores, and make confident hiring decisions.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="how-visual">
            <div className="match-badge">✦ 94% Match</div>
            <div className="profile-card">
              <div className="avatar" style={{ background: 'rgba(232,201,126,0.15)' }}>👩‍🏫</div>
              <div className="profile-info">
                <h4>Priya Sharma</h4>
                <p>Mathematics · 7 yrs experience</p>
                <div className="profile-tags">
                  <span className="tag">Class XI–XII</span>
                  <span className="tag blue">IIT Coaching</span>
                  <span className="tag green">Available</span>
                </div>
              </div>
            </div>
            <div className="profile-card">
              <div className="avatar" style={{ background: 'rgba(126,156,232,0.15)' }}>👨‍🔬</div>
              <div className="profile-info">
                <h4>Arjun Mehta</h4>
                <p>Physics & Chemistry · 5 yrs</p>
                <div className="profile-tags">
                  <span className="tag">CBSE</span>
                  <span className="tag blue">NEET Prep</span>
                  <span className="tag green">Available</span>
                </div>
              </div>
            </div>
            <div className="profile-card" style={{ marginBottom: 0 }}>
              <div className="avatar" style={{ background: 'rgba(110,219,160,0.15)' }}>👩‍💻</div>
              <div className="profile-info">
                <h4>Neha Gupta</h4>
                <p>Computer Science · 4 yrs</p>
                <div className="profile-tags">
                  <span className="tag">Python</span>
                  <span className="tag blue">AI/ML</span>
                  <span className="tag green">Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section" id="features" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <div className="section-tag">Features</div>
          <h2 className="section-title">Everything you need to<br />build a great teaching team</h2>
        </div>
        <div className="features-grid">
          {[
            { icon: '🎯', title: 'Smart Matching', desc: 'AI pairs your requirements with the right candidate profiles — subject expertise, certifications, teaching level, and availability.' },
            { icon: '🤖', title: 'AI Interviews', desc: 'Conduct structured video interviews scored by AI. Evaluate pedagogy, subject depth, and communication skills objectively.' },
            { icon: '✅', title: 'Verified Profiles', desc: 'Every educator is background-checked and credential-verified before appearing in your search results.' },
            { icon: '📊', title: 'Analytics Dashboard', desc: 'Track pipeline health, time-to-hire, candidate quality scores, and diversity metrics in real time.' },
            { icon: '🔔', title: 'Instant Alerts', desc: 'Get notified the moment a perfect match applies. Never lose a great candidate to slow response times.' },
            { icon: '📁', title: 'Offer Management', desc: 'Generate, send, and track offer letters directly from the platform. Onboarding docs included.' },
          ].map((f, i) => (
            <div className="feature-card" key={i}>
              <span className="feature-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section" id="testimonials">
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <div className="section-tag">Testimonials</div>
          <h2 className="section-title">Trusted by schools across India</h2>
        </div>
        <div className="test-grid">
          {[
            { stars: '★★★★★', quote: 'We filled 6 teaching positions in under two weeks. The AI interview feature saved our panel countless hours.', name: 'Ravi Kapoor', role: 'Principal, DPS Lucknow', emoji: '🏫' },
            { stars: '★★★★★', quote: 'The candidate quality is exceptional. Every profile we reviewed was genuinely qualified — no time wasted.', name: 'Sunita Rao', role: 'HR Head, Narayana Group', emoji: '🎓' },
            { stars: '★★★★☆', quote: 'From posting the job to making an offer took just 9 days. The platform is intuitive and the support team is responsive.', name: 'Amit Joshi', role: 'Director, Vidyarth Academy', emoji: '📚' },
          ].map((t, i) => (
            <div className="test-card" key={i}>
              <div className="test-stars">{t.stars}</div>
              <p className="test-quote">"{t.quote}"</p>
              <div className="test-author">
                <div className="test-avatar">{t.emoji}</div>
                <div>
                  <div className="test-name">{t.name}</div>
                  <div className="test-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <div className="bottom-cta">
        <h2>Start hiring great teachers<br />today.</h2>
        <p>Join 840+ institutions that trust EduHire to build their academic teams.</p>
        <div className="bottom-actions">
          <Link href="/interview" className="btn-primary">Launch Interview Platform →</Link>
          <a href="#how" className="btn-secondary">Learn More</a>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-brand">EduHire</div>
        <div className="footer-copy">
          Built by <a href="#">Monish Solanki</a> (23BCS13553) &nbsp;·&nbsp; Teacher's Recruiter Platform
        </div>
        <div className="footer-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Contact</a>
        </div>
      </footer>
    </>
  );
}