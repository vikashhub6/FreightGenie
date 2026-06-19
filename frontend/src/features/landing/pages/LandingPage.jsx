import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────
   Inline styles reuse existing CSS vars
   from index.css — no extra imports needed
───────────────────────────────────────── */

const FEATURES = [
  {
    icon: "🤖",
    color: "rgba(56,189,248,0.1)",
    title: "AI Compliance Analysis",
    desc: "Upload shipping docs and let AI instantly analyze compliance, flag missing items, and score each shipment out of 100 — with detailed recommendations.",
  },
  {
    icon: "📡",
    color: "rgba(167,139,250,0.1)",
    title: "Real-time Shipment Tracking",
    desc: "Live status updates via WebSocket. Every state change — docs uploaded to compliance done — streams instantly to your dashboard.",
  },
  {
    icon: "💰",
    color: "rgba(52,211,153,0.1)",
    title: "Instant Cost Estimates",
    desc: "Auto-generated cost breakdowns for customs, freight, insurance, and handling — broken down by line item so exporters know what to expect.",
  },
  {
    icon: "✉️",
    color: "rgba(251,191,36,0.1)",
    title: "Auto Email Drafts",
    desc: "AI writes professional compliance summary emails automatically. One click to review and send — no copy-pasting reports ever again.",
  },
  {
    icon: "📊",
    color: "rgba(251,113,133,0.1)",
    title: "Business Analytics",
    desc: "Server-side charts via Pandas & Seaborn — route analysis, cargo type breakdown, monthly trends, and compliance score distributions.",
  },
  {
    icon: "🔗",
    color: "rgba(56,189,248,0.08)",
    title: "Exporter Self-Upload",
    desc: "Send exporters a secure token link. They upload docs directly — no account needed. You get notified the moment files arrive.",
  },
];

const STEPS = [
  { n: 1, title: "Create Shipment", desc: "Enter origin, destination, cargo type, and shipping mode. A unique PIN is generated for tracking." },
  { n: 2, title: "Exporter Uploads Docs", desc: "Exporter receives a secure link and uploads all required shipping documents directly." },
  { n: 3, title: "AI Runs Analysis", desc: "AI reads every document, checks compliance rules, scores the shipment, and flags missing items — in seconds." },
  { n: 4, title: "Review & Dispatch", desc: "Your team reviews the AI report, approves compliance, and sends the summary email — all from one screen." },
];

const TESTIMONIALS = [
  {
    text: '"We cut compliance review time from 2 hours to under 10 minutes per shipment. The AI catches things our team used to miss entirely."',
    name: "Ravi Mehta", role: "Logistics Head, ExportCorp India", initial: "R",
    grad: "linear-gradient(135deg,#0ea5e9,#6366f1)",
  },
  {
    text: '"The exporter upload link feature is genius. No more chasing documents over WhatsApp. They upload, we get notified, done."',
    name: "Sara Krishnan", role: "Freight Manager, TradeLink Co.", initial: "S",
    grad: "linear-gradient(135deg,#a78bfa,#ec4899)",
  },
  {
    text: '"Real-time tracking via WebSockets is buttery smooth. The moment status changes, our entire team knows. No manual refreshes."',
    name: "Arjun Patel", role: "CTO, ShipSwift Logistics", initial: "A",
    grad: "linear-gradient(135deg,#34d399,#0ea5e9)",
  },
];

const DEMO_TABS = ["📦 Shipments", "✅ Compliance", "📊 Analytics", "✉️ Email Draft"];

/* ── tiny hook for scroll reveal ── */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.12 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

/* ── counter animation hook ── */
function useCounter(target, trigger) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let cur = 0;
    const step = target / 60;
    const id = setInterval(() => {
      cur = Math.min(cur + step, target);
      setVal(Math.floor(cur));
      if (cur >= target) { setVal(target); clearInterval(id); }
    }, 24);
    return () => clearInterval(id);
  }, [trigger, target]);
  return val;
}

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // stats counters
  const statsRef = useRef(null);
  const [statsTrigger, setStatsTrigger] = useState(false);
  const c1 = useCounter(98,  statsTrigger);
  const c2 = useCounter(3,   statsTrigger);
  const c3 = useCounter(6,   statsTrigger);
  const c4 = useCounter(100, statsTrigger);

  // bar chart animation
  const [barsAnim, setBarsAnim] = useState(false);
  useEffect(() => {
    if (activeTab === 2) setTimeout(() => setBarsAnim(true), 120);
    else setBarsAnim(false);
  }, [activeTab]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStatsTrigger(true); obs.disconnect(); } }, { threshold: 0.5 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <div style={{ background: "var(--bg-primary)", color: "var(--text-primary)", fontFamily: "'Outfit',sans-serif", overflowX: "hidden" }}>

      {/* ── GLOBAL STYLE INJECTION ── */}
      <style>{`
        @keyframes lgPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
        @keyframes lgFadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes lgBlink  { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .lg-reveal { opacity:0; transform:translateY(28px); transition:opacity .7s ease,transform .7s ease; }
        .lg-reveal.lg-visible { opacity:1; transform:translateY(0); }
        .lg-fade-1 { animation: lgFadeUp .6s .0s ease both; }
        .lg-fade-2 { animation: lgFadeUp .6s .1s ease both; }
        .lg-fade-3 { animation: lgFadeUp .6s .2s ease both; }
        .lg-fade-4 { animation: lgFadeUp .6s .3s ease both; }
        .lg-feat-card:hover { border-color:rgba(99,179,237,0.25)!important; transform:translateY(-4px); box-shadow:0 20px 60px rgba(0,0,0,0.4); }
        .lg-feat-card:hover::before { opacity:1!important; }
        .lg-step-card:hover { border-color:rgba(99,179,237,0.25)!important; transform:translateY(-4px); }
        .lg-testi-card:hover { border-color:rgba(99,179,237,0.25)!important; transform:translateY(-4px); }
        .lg-ship-row:hover { border-color:rgba(56,189,248,0.3)!important; background:rgba(56,189,248,0.07)!important; cursor:pointer; }
        .lg-nav-link { color:var(--text-secondary); text-decoration:none; font-size:.9rem; font-weight:500; transition:color .2s; }
        .lg-nav-link:hover { color:var(--text-primary); }
        .lg-btn-primary { background:linear-gradient(135deg,#0ea5e9,#6366f1); color:#fff; border:none; padding:.875rem 2rem; border-radius:12px; font-family:'Outfit',sans-serif; font-weight:600; font-size:1rem; cursor:pointer; box-shadow:0 4px 24px rgba(14,165,233,.35); transition:all .2s; display:inline-flex; align-items:center; gap:.5rem; text-decoration:none; }
        .lg-btn-primary:hover { transform:translateY(-2px); box-shadow:0 8px 32px rgba(14,165,233,.5); }
        .lg-btn-outline { background:rgba(255,255,255,.04); color:var(--text-primary); border:1px solid rgba(255,255,255,.07); padding:.875rem 2rem; border-radius:12px; font-family:'Outfit',sans-serif; font-weight:600; font-size:1rem; cursor:pointer; transition:all .2s; display:inline-flex; align-items:center; gap:.5rem; text-decoration:none; }
        .lg-btn-outline:hover { border-color:rgba(99,179,237,.25); background:rgba(56,189,248,.06); transform:translateY(-2px); }
        .lg-nav-cta { background:linear-gradient(135deg,#0ea5e9,#6366f1); color:#fff; border:none; padding:.5rem 1.2rem; border-radius:10px; font-family:'Outfit',sans-serif; font-weight:600; font-size:.875rem; cursor:pointer; box-shadow:0 4px 20px rgba(14,165,233,.3); transition:all .2s; }
        .lg-nav-cta:hover { transform:translateY(-1px); box-shadow:0 6px 28px rgba(14,165,233,.5); }
        .lg-demo-tab { padding:.875rem 1.2rem; font-size:.8rem; font-weight:500; color:var(--text-muted); border:none; background:none; cursor:pointer; border-bottom:2px solid transparent; transition:all .2s; white-space:nowrap; font-family:'Outfit',sans-serif; }
        .lg-demo-tab.active { color:var(--accent-cyan,#38bdf8); border-bottom-color:var(--accent-cyan,#38bdf8); }
        .lg-demo-tab:hover { color:var(--text-secondary); }
        .lg-bar { height:8px; border-radius:99px; transition:width 1.2s ease; }
        @media(max-width:768px){
          .lg-nav-links{display:none!important;}
          .lg-hamburger{display:flex!important;}
          .lg-analytics-grid{grid-template-columns:1fr!important;}
          .lg-hide-mobile{display:none!important;}
          .lg-steps{grid-template-columns:1fr 1fr!important;}
          .lg-testi{grid-template-columns:1fr!important;}
        }
        @media(max-width:480px){
          .lg-steps{grid-template-columns:1fr!important;}
          .lg-features-grid{grid-template-columns:1fr!important;}
        }
      `}</style>

      {/* ─── NAV ─── */}
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:100,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 5%", height:64,
        background:"rgba(10,12,16,0.85)", backdropFilter:"blur(20px)",
        borderBottom: scrolled ? "1px solid rgba(99,179,237,0.15)" : "1px solid rgba(255,255,255,0.07)",
        boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.4)" : "none",
        transition:"all .3s",
      }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.4rem", background:"linear-gradient(135deg,#38bdf8,#a78bfa)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", cursor:"pointer" }}
          onClick={() => scrollTo("hero")}>
          FreightGenie ✦
        </div>

        <ul className="lg-nav-links" style={{ display:"flex", gap:"2rem", listStyle:"none" }}>
          {["features","how","demo","testimonials"].map(id => (
            <li key={id}><a className="lg-nav-link" href={`#${id}`} onClick={e=>{e.preventDefault();scrollTo(id)}} style={{textTransform:"capitalize"}}>{id === "how" ? "How it works" : id.charAt(0).toUpperCase()+id.slice(1)}</a></li>
          ))}
        </ul>

        <div style={{ display:"flex", alignItems:"center", gap:"1rem" }}>
          <a href="/login" className="lg-nav-link lg-hide-mobile" style={{ fontSize:".875rem" }}>Login</a>
          <button className="lg-nav-cta" onClick={() => navigate("/register")}>Get Started →</button>
          <div className="lg-hamburger" onClick={() => setMenuOpen(o => !o)}
            style={{ display:"none", flexDirection:"column", gap:5, cursor:"pointer", padding:4 }}>
            {[0,1,2].map(i => <span key={i} style={{ width:22, height:2, background:"var(--text-secondary)", borderRadius:2, display:"block", transition:"all .3s" }} />)}
          </div>
        </div>
      </nav>

      {/* ─── MOBILE MENU ─── */}
      {menuOpen && (
        <div style={{
          position:"fixed", top:64, left:0, right:0, zIndex:99,
          background:"rgba(10,12,16,0.97)", backdropFilter:"blur(20px)",
          borderBottom:"1px solid rgba(255,255,255,0.07)",
          padding:"1.5rem 5%", display:"flex", flexDirection:"column", gap:"1.2rem",
        }}>
          {[["features","Features"],["how","How it works"],["demo","Demo"],["testimonials","Reviews"]].map(([id,label]) => (
            <a key={id} className="lg-nav-link" href={`#${id}`} onClick={e=>{e.preventDefault();scrollTo(id)}} style={{fontSize:"1rem"}}>{label}</a>
          ))}
          <a href="/login" className="lg-nav-link" style={{fontSize:"1rem"}}>Login</a>
        </div>
      )}

      {/* ─── HERO ─── */}
      <section id="hero" style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"80px 5% 60px", position:"relative", overflow:"hidden" }}>
        {/* orbs */}
        <div style={{ position:"absolute", width:700, height:700, borderRadius:"50%", background:"radial-gradient(circle,rgba(56,189,248,.07) 0%,transparent 70%)", top:-200, left:-200, pointerEvents:"none", animation:"lgPulse 8s ease-in-out infinite" }} />
        <div style={{ position:"absolute", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle,rgba(167,139,250,.07) 0%,transparent 70%)", bottom:-100, right:-100, pointerEvents:"none", animation:"lgPulse 10s ease-in-out infinite reverse" }} />

        {/* badge */}
        <div className="lg-fade-1" style={{ display:"inline-flex", alignItems:"center", gap:".5rem", background:"rgba(56,189,248,.08)", border:"1px solid rgba(56,189,248,.2)", borderRadius:99, padding:".35rem 1rem", fontSize:".8rem", color:"var(--accent-cyan,#38bdf8)", fontWeight:500, marginBottom:"1.5rem" }}>
          <span style={{ width:6, height:6, background:"var(--accent-cyan,#38bdf8)", borderRadius:"50%", animation:"lgBlink 1.5s ease-in-out infinite", display:"inline-block" }} />
          AI-Powered · Real-time · Compliant
        </div>

        <h1 className="lg-fade-2" style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(2.8rem,7vw,5rem)", fontWeight:800, lineHeight:1.1, maxWidth:800, marginBottom:"1.5rem" }}>
          Freight management,{" "}
          <span style={{ background:"linear-gradient(135deg,#38bdf8,#a78bfa,#34d399)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            reimagined with AI
          </span>
        </h1>

        <p className="lg-fade-3" style={{ fontSize:"clamp(1rem,2vw,1.2rem)", color:"var(--text-secondary)", maxWidth:560, lineHeight:1.7, marginBottom:"2.5rem" }}>
          FreightGenie automates compliance checks, generates instant cost estimates, and gives real-time visibility across every shipment — so your team moves faster with confidence.
        </p>

        <div className="lg-fade-4" style={{ display:"flex", gap:"1rem", flexWrap:"wrap", justifyContent:"center" }}>
          <button className="lg-btn-primary" onClick={() => scrollTo("demo")}>See it live ↓</button>
          <button className="lg-btn-outline" onClick={() => scrollTo("features")}>Explore features</button>
        </div>
      </section>

      {/* ─── STATS STRIP ─── */}
      <div ref={statsRef} style={{ display:"flex", justifyContent:"center", gap:"3rem", flexWrap:"wrap", padding:"2.5rem 5%", borderTop:"1px solid rgba(255,255,255,0.07)", borderBottom:"1px solid rgba(255,255,255,0.07)", background:"rgba(255,255,255,0.01)" }}>
        {[
          [c1, "Compliance accuracy %"],
          [c2, "Sec AI analysis time"],
          [c3, "Analytics charts auto-generated"],
          [c4, "% real-time tracking"],
        ].map(([val, label]) => (
          <div key={label} style={{ textAlign:"center" }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"2rem", fontWeight:800, background:"linear-gradient(135deg,#38bdf8,#a78bfa)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{val}</div>
            <div style={{ fontSize:".8rem", color:"var(--text-muted)", marginTop:".25rem" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ─── FEATURES ─── */}
      <section id="features" style={{ padding:"100px 5%" }}>
        <RevealBox style={{ textAlign:"center", maxWidth:640, margin:"0 auto" }}>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:".72rem", letterSpacing:".15em", color:"var(--accent-cyan,#38bdf8)", textTransform:"uppercase", marginBottom:"1rem" }}>// What it does</div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(1.8rem,4vw,2.8rem)", fontWeight:800, lineHeight:1.2, marginBottom:"1rem" }}>Everything a freight team needs, in one place</h2>
          <p style={{ color:"var(--text-secondary)", lineHeight:1.7 }}>From document uploads to AI-generated compliance reports — FreightGenie handles the heavy lifting.</p>
        </RevealBox>

        <div className="lg-features-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:"1.5rem", marginTop:"4rem" }}>
          {FEATURES.map(f => (
            <RevealBox key={f.title}>
              <div className="lg-feat-card" style={{ background:"var(--bg-card)", border:"1px solid rgba(255,255,255,.07)", borderRadius:16, padding:"1.8rem", transition:"all .3s", cursor:"pointer", position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,rgba(56,189,248,.04),rgba(167,139,250,.04))", opacity:0, transition:"opacity .3s", pointerEvents:"none" }} />
                <div style={{ width:48, height:48, borderRadius:12, background:f.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.4rem", marginBottom:"1.2rem" }}>{f.icon}</div>
                <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:"1.1rem", fontWeight:700, marginBottom:".6rem" }}>{f.title}</h3>
                <p style={{ color:"var(--text-secondary)", fontSize:".875rem", lineHeight:1.7 }}>{f.desc}</p>
              </div>
            </RevealBox>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how" style={{ padding:"100px 5%", background:"var(--bg-secondary)" }}>
        <RevealBox style={{ textAlign:"center", maxWidth:640, margin:"0 auto" }}>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:".72rem", letterSpacing:".15em", color:"var(--accent-cyan,#38bdf8)", textTransform:"uppercase", marginBottom:"1rem" }}>// Process</div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(1.8rem,4vw,2.8rem)", fontWeight:800, lineHeight:1.2, marginBottom:"1rem" }}>From shipment to cleared — in minutes</h2>
          <p style={{ color:"var(--text-secondary)", lineHeight:1.7 }}>A streamlined workflow designed to eliminate manual back-and-forth between freight teams and exporters.</p>
        </RevealBox>
        <div className="lg-steps" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"2rem", marginTop:"4rem" }}>
          {STEPS.map(s => (
            <RevealBox key={s.n}>
              <div className="lg-step-card" style={{ textAlign:"center", padding:"2rem 1.5rem", background:"var(--bg-card)", border:"1px solid rgba(255,255,255,.07)", borderRadius:16, transition:"all .3s", height:"100%" }}>
                <div style={{ width:52, height:52, borderRadius:"50%", background:"linear-gradient(135deg,#0ea5e9,#6366f1)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.1rem", color:"#fff", margin:"0 auto 1.2rem", boxShadow:"0 4px 20px rgba(14,165,233,.3)" }}>{s.n}</div>
                <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, marginBottom:".6rem" }}>{s.title}</h3>
                <p style={{ color:"var(--text-secondary)", fontSize:".875rem", lineHeight:1.6 }}>{s.desc}</p>
              </div>
            </RevealBox>
          ))}
        </div>
      </section>

      {/* ─── INTERACTIVE DEMO ─── */}
      <section id="demo" style={{ padding:"100px 5%", background:"var(--bg-primary)" }}>
        <RevealBox>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:".72rem", letterSpacing:".15em", color:"var(--accent-cyan,#38bdf8)", textTransform:"uppercase", marginBottom:"1rem" }}>// Live preview</div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(1.8rem,4vw,2.8rem)", fontWeight:800, lineHeight:1.2, marginBottom:".75rem" }}>See FreightGenie in action</h2>
          <p style={{ color:"var(--text-secondary)", lineHeight:1.7 }}>Click through the tabs to explore each part of the product.</p>
        </RevealBox>

        <RevealBox style={{ marginTop:"2.5rem" }}>
          <div style={{ background:"var(--bg-card)", border:"1px solid rgba(255,255,255,.07)", borderRadius:20, overflow:"hidden", boxShadow:"0 30px 80px rgba(0,0,0,.5)" }}>
            {/* topbar */}
            <div style={{ display:"flex", alignItems:"center", gap:".5rem", padding:".875rem 1.2rem", background:"rgba(255,255,255,.03)", borderBottom:"1px solid rgba(255,255,255,.07)" }}>
              {["#fb7185","#fbbf24","#34d399"].map(c => <div key={c} style={{ width:10, height:10, borderRadius:"50%", background:c }} />)}
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:".7rem", color:"var(--text-muted)", marginLeft:".75rem" }}>freightgenie.app/dashboard</span>
            </div>
            {/* tabs */}
            <div style={{ display:"flex", overflowX:"auto", padding:"0 1.5rem", background:"rgba(255,255,255,.02)", borderBottom:"1px solid rgba(255,255,255,.07)" }}>
              {DEMO_TABS.map((t, i) => (
                <button key={t} className={`lg-demo-tab${activeTab === i ? " active" : ""}`} onClick={() => setActiveTab(i)}>{t}</button>
              ))}
            </div>
            {/* content */}
            <div style={{ padding:"2rem", minHeight:320 }}>
              {activeTab === 0 && <ShipmentsPanel onSelect={() => setActiveTab(1)} />}
              {activeTab === 1 && <CompliancePanel />}
              {activeTab === 2 && <AnalyticsPanel barsAnim={barsAnim} />}
              {activeTab === 3 && <EmailPanel />}
            </div>
          </div>
        </RevealBox>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section id="testimonials" style={{ padding:"100px 5%", background:"var(--bg-secondary)" }}>
        <RevealBox style={{ textAlign:"center", maxWidth:640, margin:"0 auto" }}>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:".72rem", letterSpacing:".15em", color:"var(--accent-cyan,#38bdf8)", textTransform:"uppercase", marginBottom:"1rem" }}>// Trusted by teams</div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(1.8rem,4vw,2.8rem)", fontWeight:800, marginBottom:"1rem" }}>What freight teams say</h2>
        </RevealBox>
        <div className="lg-testi" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1.5rem", marginTop:"4rem" }}>
          {TESTIMONIALS.map(t => (
            <RevealBox key={t.name}>
              <div className="lg-testi-card" style={{ background:"var(--bg-card)", border:"1px solid rgba(255,255,255,.07)", borderRadius:16, padding:"1.8rem", transition:"all .3s", height:"100%" }}>
                <div style={{ color:"var(--accent-amber,#fbbf24)", marginBottom:"1rem", letterSpacing:2 }}>★★★★★</div>
                <p style={{ color:"var(--text-secondary)", fontSize:".875rem", lineHeight:1.7, marginBottom:"1.2rem" }}>{t.text}</p>
                <div style={{ display:"flex", alignItems:"center", gap:".75rem" }}>
                  <div style={{ width:38, height:38, borderRadius:"50%", background:t.grad, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:"#fff", fontSize:"1rem" }}>{t.initial}</div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:".875rem" }}>{t.name}</div>
                    <div style={{ fontSize:".75rem", color:"var(--text-muted)" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            </RevealBox>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{ textAlign:"center", padding:"120px 5%", background:"radial-gradient(ellipse 80% 50% at 50% 50%,rgba(56,189,248,.06) 0%,transparent 70%)", borderTop:"1px solid rgba(255,255,255,.07)" }}>
        <RevealBox>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(2rem,5vw,3.5rem)", fontWeight:800, marginBottom:"1rem" }}>Ready to ship smarter?</h2>
          <p style={{ color:"var(--text-secondary)", maxWidth:500, margin:"0 auto 2.5rem", lineHeight:1.7 }}>Join freight teams already using FreightGenie to eliminate compliance errors and move shipments faster than ever.</p>
          <div style={{ display:"flex", gap:"1rem", flexWrap:"wrap", justifyContent:"center" }}>
            <button className="lg-btn-primary" onClick={() => navigate("/register")}>Start for free →</button>
            <button className="lg-btn-outline" onClick={() => scrollTo("features")}>Learn more</button>
          </div>
        </RevealBox>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ borderTop:"1px solid rgba(255,255,255,.07)", padding:"3rem 5%", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"1.5rem" }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.2rem", background:"linear-gradient(135deg,#38bdf8,#a78bfa)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>FreightGenie ✦</div>
        <div style={{ display:"flex", gap:"1.5rem", flexWrap:"wrap" }}>
          {["Features","How it works","Demo","Contact"].map(l => (
            <a key={l} href="#" style={{ color:"var(--text-muted)", fontSize:".875rem", textDecoration:"none", transition:"color .2s" }}
              onMouseEnter={e => e.target.style.color="var(--text-secondary)"}
              onMouseLeave={e => e.target.style.color="var(--text-muted)"}>{l}</a>
          ))}
        </div>
        <div style={{ fontSize:".8rem", color:"var(--text-muted)" }}>Built with FastAPI · MongoDB · Cloudinary · AI</div>
      </footer>

    </div>
  );
}

/* ── Reusable reveal wrapper ── */
function RevealBox({ children, style = {} }) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} className={`lg-reveal${visible ? " lg-visible" : ""}`} style={style}>
      {children}
    </div>
  );
}

/* ── Demo panels ── */
function ShipmentsPanel({ onSelect }) {
  const rows = [
    { pin:"FG-A7K9M", route:"Mumbai → Rotterdam · Sea Freight", score:"87/100", scoreColor:"var(--accent-emerald,#34d399)", badgeClass:"done", badgeLabel:"Compliance Done" },
    { pin:"FG-B2P4Q", route:"Delhi → Dubai · Air Freight",      score:"54/100", scoreColor:"var(--accent-amber,#fbbf24)",   badgeClass:"review", badgeLabel:"Awaiting Review" },
    { pin:"FG-C6R1S", route:"Chennai → Singapore · Sea Freight",score:"—",      scoreColor:"var(--accent-cyan,#38bdf8)",    badgeClass:"uploaded", badgeLabel:"Docs Uploaded" },
  ];
  const badgeStyles = {
    done:     { background:"rgba(52,211,153,.1)",  color:"var(--accent-emerald,#34d399)", border:"1px solid rgba(52,211,153,.2)" },
    review:   { background:"rgba(251,191,36,.1)",  color:"var(--accent-amber,#fbbf24)",   border:"1px solid rgba(251,191,36,.2)" },
    uploaded: { background:"rgba(56,189,248,.1)",  color:"var(--accent-cyan,#38bdf8)",    border:"1px solid rgba(56,189,248,.2)" },
  };
  return (
    <div>
      <p style={{ fontSize:".8rem", color:"var(--text-muted)", marginBottom:"1.2rem" }}>3 active shipments — click any to explore</p>
      {rows.map(r => (
        <div key={r.pin} className="lg-ship-row" onClick={onSelect}
          style={{ background:"rgba(56,189,248,.04)", border:"1px solid rgba(56,189,248,.15)", borderRadius:12, padding:"1.2rem", marginBottom:"1rem", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:".8rem", transition:"all .2s" }}>
          <div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:".95rem", fontWeight:600, color:"var(--accent-cyan,#38bdf8)" }}>{r.pin}</div>
            <div style={{ fontSize:".85rem", color:"var(--text-secondary)" }}>{r.route}</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:"1rem" }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:".875rem", color:r.scoreColor }}>{r.score}</span>
            <span style={{ padding:".25rem .75rem", borderRadius:99, fontSize:".75rem", fontWeight:600, ...badgeStyles[r.badgeClass] }}>{r.badgeLabel}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function CompliancePanel() {
  const items = [
    { icon:"✓", type:"done",   label:"Bill of Lading — present & valid" },
    { icon:"✓", type:"done",   label:"Commercial Invoice — verified" },
    { icon:"✓", type:"done",   label:"Packing List — complete" },
    { icon:"!",  type:"warn",   label:"Certificate of Origin — minor discrepancy" },
    { icon:"✗", type:"fail",   label:"Phytosanitary Certificate — missing" },
  ];
  const iconStyles = {
    done: { background:"rgba(52,211,153,.15)", color:"var(--accent-emerald,#34d399)" },
    warn: { background:"rgba(251,191,36,.15)", color:"var(--accent-amber,#fbbf24)" },
    fail: { background:"rgba(251,113,133,.15)", color:"var(--accent-rose,#fb7185)" },
  };
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.2rem", flexWrap:"wrap", gap:".8rem" }}>
        <div>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:".9rem", fontWeight:600, color:"var(--accent-cyan,#38bdf8)" }}>FG-A7K9M</div>
          <div style={{ fontSize:".8rem", color:"var(--text-muted)" }}>AI Compliance Report</div>
        </div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"2rem", fontWeight:800, color:"var(--accent-emerald,#34d399)" }}>
          87<span style={{ fontSize:"1rem", color:"var(--text-muted)" }}>/100</span>
        </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:".75rem" }}>
        {items.map(item => (
          <div key={item.label} style={{ display:"flex", alignItems:"center", gap:".75rem", padding:".75rem 1rem", borderRadius:10, background:"rgba(255,255,255,.02)", border:"1px solid rgba(255,255,255,.07)" }}>
            <div style={{ width:22, height:22, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:".7rem", flexShrink:0, ...iconStyles[item.type] }}>{item.icon}</div>
            <span style={{ fontSize:".875rem", color:"var(--text-secondary)" }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsPanel({ barsAnim }) {
  const bars = [
    { label:"MUM → Rotterdam", w:"82%", grad:"linear-gradient(90deg,#38bdf8,#6366f1)", count:34 },
    { label:"DEL → Dubai",     w:"60%", grad:"linear-gradient(90deg,#a78bfa,#ec4899)", count:25 },
    { label:"CHN → Singapore", w:"48%", grad:"linear-gradient(90deg,#34d399,#0ea5e9)", count:20 },
    { label:"BLR → London",    w:"34%", grad:"linear-gradient(90deg,#fbbf24,#f97316)", count:14 },
  ];
  return (
    <div className="lg-analytics-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
      <div style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", borderRadius:12, padding:"1.2rem" }}>
        <h4 style={{ fontSize:".75rem", color:"var(--text-muted)", marginBottom:".5rem", textTransform:"uppercase", letterSpacing:".08em" }}>Total Shipments</h4>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"2rem", fontWeight:800, color:"var(--accent-cyan,#38bdf8)" }}>142</div>
      </div>
      <div style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", borderRadius:12, padding:"1.2rem" }}>
        <h4 style={{ fontSize:".75rem", color:"var(--text-muted)", marginBottom:".5rem", textTransform:"uppercase", letterSpacing:".08em" }}>Avg Compliance Score</h4>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"2rem", fontWeight:800, color:"var(--accent-emerald,#34d399)" }}>81<span style={{ fontSize:"1rem", color:"var(--text-muted)" }}>/100</span></div>
      </div>
      <div style={{ gridColumn:"1/-1", background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", borderRadius:12, padding:"1.2rem" }}>
        <h4 style={{ fontSize:".75rem", color:"var(--text-muted)", marginBottom:"1rem", textTransform:"uppercase", letterSpacing:".08em" }}>Top Routes by Volume</h4>
        <div style={{ display:"flex", flexDirection:"column", gap:".5rem" }}>
          {bars.map(b => (
            <div key={b.label} style={{ display:"flex", alignItems:"center", gap:".75rem" }}>
              <span style={{ fontSize:".75rem", color:"var(--text-secondary)", width:120, flexShrink:0 }}>{b.label}</span>
              <div style={{ flex:1, height:8, background:"rgba(255,255,255,.05)", borderRadius:99, overflow:"hidden" }}>
                <div className="lg-bar" style={{ width: barsAnim ? b.w : "0%", background:b.grad }} />
              </div>
              <span style={{ fontSize:".75rem", color:"var(--text-muted)" }}>{b.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmailPanel() {
  return (
    <div style={{ background:"rgba(255,255,255,.02)", border:"1px solid rgba(255,255,255,.07)", borderRadius:12, padding:"1.5rem" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.2rem" }}>
        <div style={{ fontSize:".8rem", color:"var(--text-muted)" }}>AI-drafted compliance summary email</div>
        <span style={{ background:"rgba(52,211,153,.1)", color:"var(--accent-emerald,#34d399)", border:"1px solid rgba(52,211,153,.2)", padding:".2rem .6rem", borderRadius:99, fontSize:".7rem" }}>Auto-generated</span>
      </div>
      <div style={{ fontSize:".85rem", color:"var(--text-secondary)", lineHeight:1.8 }}>
        <div style={{ marginBottom:".5rem" }}><span style={{ color:"var(--text-muted)" }}>To:</span> exporter@globaltrade.com</div>
        <div style={{ marginBottom:"1rem" }}><span style={{ color:"var(--text-muted)" }}>Subject:</span> Compliance Report — Shipment FG-A7K9M</div>
        <div style={{ borderTop:"1px solid rgba(255,255,255,.07)", paddingTop:"1rem" }}>
          Dear Exporter,<br /><br />
          Your shipment <strong style={{ color:"var(--accent-cyan,#38bdf8)" }}>FG-A7K9M</strong> (Mumbai → Rotterdam) has been reviewed.<br /><br />
          Compliance Score: <strong style={{ color:"var(--accent-emerald,#34d399)" }}>87/100</strong> — Status: <strong>Cleared with minor remarks</strong><br /><br />
          Action Required: Please provide a valid <strong style={{ color:"var(--accent-rose,#fb7185)" }}>Phytosanitary Certificate</strong> and clarify the origin discrepancy on the Certificate of Origin before dispatch.<br /><br />
          Regards,<br />FreightGenie Compliance Team
        </div>
      </div>
    </div>
  );
}
