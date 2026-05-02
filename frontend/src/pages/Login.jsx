import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const CHIPS = [
  { label:"Data Structures", color:"#EF9F27", bg:"rgba(239,159,39,.12)" },
  { label:"DBMS",            color:"#1D9E75", bg:"rgba(29,158,117,.12)" },
  { label:"OS",              color:"#7F77DD", bg:"rgba(127,119,221,.12)"},
  { label:"Networks",        color:"#D85A30", bg:"rgba(216,90,48,.12)"  },
  { label:"AI & ML",         color:"#378ADD", bg:"rgba(55,138,221,.12)" },
  { label:"Compiler Design", color:"#EF9F27", bg:"rgba(239,159,39,.12)" },
  { label:"Web Tech",        color:"#1D9E75", bg:"rgba(29,158,117,.12)" },
  { label:"Software Eng.",   color:"#7F77DD", bg:"rgba(127,119,221,.12)"},
];

export default function Login() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();

  const handleLogin = async e => {
    e.preventDefault(); setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    try {
      setLoading(true);
      const r = await api.post("/login", { email, password });
      localStorage.setItem("token", r.data.access_token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.status === 401 ? "Invalid email or password." : "Something went wrong. Try again.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", background:"var(--bg)" }}>
      {/* ── HERO PANEL ─────────────────────────────────── */}
      <div className="login-hero" style={{
        flex:"0 0 55%", background:"#0d1810", position:"relative", overflow:"hidden",
        display:"flex", flexDirection:"column", justifyContent:"space-between",
        padding:"44px 52px 40px",
      }}>
        {/* diagonal line texture */}
        <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:.045 }} preserveAspectRatio="xMidYMid slice">
          <defs><pattern id="diag" width="30" height="30" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="30" stroke="#EF9F27" strokeWidth="1"/>
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#diag)"/>
        </svg>
        {/* glow blobs */}
        <div style={{ position:"absolute", top:"-15%", left:"-10%", width:"55%", height:"55%", background:"radial-gradient(circle,rgba(239,159,39,.09) 0%,transparent 65%)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", bottom:"5%", right:"5%", width:"40%", height:"40%", background:"radial-gradient(circle,rgba(55,138,221,.06) 0%,transparent 65%)", pointerEvents:"none" }}/>

        {/* Logo */}
        <div style={{ position:"relative", zIndex:1, display:"flex", alignItems:"center", gap:10 }} className="fade-up">
          <div style={{ width:30, height:30, borderRadius:7, background:"#EF9F27", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M2 2h4.5v4.5H2V2z" fill="#0a0806" opacity=".9"/>
              <path d="M6.5 6.5H11V11H6.5V6.5z" fill="#0a0806" opacity=".9"/>
              <circle cx="9" cy="3.5" r="2" stroke="#0a0806" strokeWidth="1.3" opacity=".9"/>
              <circle cx="3.5" cy="9.5" r="2" stroke="#0a0806" strokeWidth="1.3" opacity=".9"/>
            </svg>
          </div>
          <span style={{ fontFamily:"var(--font-body)", fontSize:14, fontWeight:500, color:"#F0ECE6", letterSpacing:"-.01em" }}>EduGenie</span>
        </div>

        {/* Headline */}
        <div style={{ position:"relative", zIndex:1 }} className="fade-up">
          <p style={{ fontSize:11, color:"rgba(239,159,39,.7)", textTransform:"uppercase", letterSpacing:".18em", fontWeight:500, marginBottom:18 }}>MCA STUDY COMPANION</p>
          <h1 style={{
            fontSize:"clamp(2.4rem,5vw,4.2rem)", fontWeight:300, lineHeight:1.06,
            color:"#F0ECE6", letterSpacing:"-.03em", marginBottom:20,
          }}>
            Every exam<br/>starts with a<br/>
            <span style={{ background:"linear-gradient(90deg,#EF9F27 0%,#F7C96A 60%,#EF9F27 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", fontWeight:500 }}>
              single note.
            </span>
          </h1>
          <p style={{ color:"rgba(240,236,230,.4)", fontSize:13, lineHeight:1.75, maxWidth:340 }}>
            AI-generated notes, adaptive quizzes, performance analytics — built for the MCA syllabus.
          </p>
        </div>

        {/* Subject chips */}
        <div style={{ position:"relative", zIndex:1 }} className="fade-up">
          <p style={{ fontSize:10, color:"rgba(240,236,230,.28)", letterSpacing:".12em", textTransform:"uppercase", marginBottom:12 }}>Topics you'll master</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
            {CHIPS.map((c, i) => (
              <div key={c.label} style={{
                padding:"5px 12px", borderRadius:99,
                background:c.bg, border:`0.5px solid ${c.color}30`,
                color:c.color, fontSize:12, fontWeight:500,
              }}>{c.label}</div>
            ))}
          </div>
        </div>

        <p style={{ color:"rgba(240,236,230,.18)", fontSize:11, position:"relative", zIndex:1 }}>MCA Final Year Project · 2025</p>
      </div>

      {/* ── FORM PANEL ─────────────────────────────────── */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"48px 28px" }}>
        <div style={{ width:"100%", maxWidth:340 }}>
          <div className="fade-up" style={{ marginBottom:30 }}>
            <h2 style={{ fontSize:24, fontWeight:500, color:"var(--ink)", letterSpacing:"-.02em", marginBottom:5 }}>Welcome back.</h2>
            <p style={{ color:"var(--ink-3)", fontSize:13 }}>Sign in to continue your learning journey.</p>
          </div>

          <form className="fade-up" onSubmit={handleLogin}>
            {[
              { label:"Email",    type:"email",    v:email,    s:setEmail,    ph:"you@university.edu" },
              { label:"Password", type:"password", v:password, s:setPassword, ph:"••••••••"            },
            ].map(f => (
              <div key={f.label} style={{ marginBottom:13 }}>
                <label style={{ display:"block", fontSize:11, fontWeight:500, color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:".1em", marginBottom:7 }}>{f.label}</label>
                <input type={f.type} className="glow-input" placeholder={f.ph} value={f.v} onChange={e => f.s(e.target.value)}/>
              </div>
            ))}

            {error && (
              <div style={{ padding:"9px 13px", borderRadius:7, marginBottom:14, background:"var(--coral-dim)", border:"0.5px solid var(--coral-border)", color:"var(--coral)", fontSize:13 }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn-glow" disabled={loading}
              style={{ width:"100%", padding:"11px", fontSize:14, marginTop:4 }}>
              {loading ? "Signing in…" : "Continue →"}
            </button>
          </form>

          <div className="fade-up" style={{ margin:"22px 0 18px", display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ flex:1, height:"0.5px", background:"var(--border)" }}/>
            <span style={{ fontSize:11, color:"var(--ink-4)" }}>New here?</span>
            <div style={{ flex:1, height:"0.5px", background:"var(--border)" }}/>
          </div>

          <Link className="fade-up" to="/signup" style={{
            display:"block", textAlign:"center", padding:"10px",
            border:"0.5px solid var(--border-med)", borderRadius:"var(--r-md)",
            color:"var(--ink-2)", fontSize:13, fontWeight:500,
            textDecoration:"none", transition:"all .15s", fontFamily:"var(--font-body)",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor="var(--amber-border)"; e.currentTarget.style.color="var(--amber)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor="var(--border-med)"; e.currentTarget.style.color="var(--ink-2)"; }}>
            Create an account
          </Link>
        </div>
      </div>

      <style>{`@media(max-width:700px){.login-hero{display:none!important;}}`}</style>
    </div>
  );
}