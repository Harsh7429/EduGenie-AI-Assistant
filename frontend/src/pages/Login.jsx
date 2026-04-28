import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

/* Decorative subject chips that float in the hero panel */
const CHIPS = [
  { label:"Data Structures",   color:"#5b82e8", bg:"rgba(91,130,232,.12)"  },
  { label:"Operating Systems", color:"#d4922a", bg:"rgba(212,146,42,.12)"  },
  { label:"DBMS",              color:"#3db88a", bg:"rgba(61,184,138,.12)"  },
  { label:"Networks",          color:"#9580e8", bg:"rgba(149,128,232,.12)" },
  { label:"Software Eng.",     color:"#e05c5c", bg:"rgba(224,92,92,.12)"   },
  { label:"AI & ML",           color:"#d4922a", bg:"rgba(212,146,42,.12)"  },
];

export default function Login() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
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
      {/* ── LEFT HERO PANEL ─────────────────────────────────────────── */}
      <div className="login-hero" style={{
        flex:"0 0 58%", position:"relative", overflow:"hidden",
        background:"#080810",
        display:"flex", flexDirection:"column", justifyContent:"space-between",
        padding:"52px 56px 48px",
      }}>
        {/* Background texture — diagonal fine lines */}
        <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:.04 }} preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="diag" width="32" height="32" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="32" stroke="#d4922a" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diag)"/>
        </svg>

        {/* Ambient glow blobs */}
        <div style={{ position:"absolute", top:"-10%", left:"-5%", width:"50%", height:"50%",
          background:"radial-gradient(circle, rgba(212,146,42,.10) 0%, transparent 65%)",
          pointerEvents:"none" }}/>
        <div style={{ position:"absolute", bottom:"5%", right:"5%", width:"40%", height:"40%",
          background:"radial-gradient(circle, rgba(91,130,232,.08) 0%, transparent 65%)",
          pointerEvents:"none" }}/>

        {/* Logo */}
        <div className="float-in" style={{ display:"flex", alignItems:"center", gap:11, position:"relative", zIndex:1 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:"var(--gold)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2h5v5H2V2z" fill="#0a0806" opacity=".9"/>
              <path d="M7 7h5v5H7V7z" fill="#0a0806" opacity=".9"/>
              <circle cx="9.5" cy="4" r="2.2" stroke="#0a0806" strokeWidth="1.3" opacity=".9"/>
              <circle cx="4" cy="10" r="2.2" stroke="#0a0806" strokeWidth="1.3" opacity=".9"/>
            </svg>
          </div>
          <span style={{ fontFamily:"var(--font-display)", fontStyle:"italic", fontSize:"1.15rem", color:"#f0ece6" }}>
            Edu<span style={{ color:"var(--gold)" }}>Genie</span>
          </span>
        </div>

        {/* Big editorial headline */}
        <div style={{ position:"relative", zIndex:1 }} className="float-in" >
          <p style={{ fontSize:".68rem", color:"rgba(212,146,42,.7)", textTransform:"uppercase", letterSpacing:".18em", fontWeight:700, marginBottom:20 }}>
            MCA STUDY COMPANION
          </p>
          <h1 style={{
            fontFamily:"var(--font-display)", fontStyle:"italic",
            fontSize:"clamp(2.8rem, 5.5vw, 5rem)", lineHeight:1.05,
            color:"#f0ece6", fontWeight:400, marginBottom:28,
            letterSpacing:"-.02em",
          }}>
            Every exam starts<br/>
            with a single<br/>
            <span style={{
              background:"linear-gradient(90deg, #d4922a 0%, #e8bc6a 60%, #d4922a 100%)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
              backgroundClip:"text",
            }}>note.</span>
          </h1>
          <p style={{ color:"rgba(240,236,230,.45)", fontSize:".9rem", lineHeight:1.8, maxWidth:360 }}>
            AI-generated notes, adaptive quizzes, performance analytics — built specifically for the MCA syllabus.
          </p>
        </div>

        {/* Floating subject chips */}
        <div style={{ position:"relative", zIndex:1 }} className="float-in">
          <p style={{ fontSize:".68rem", color:"rgba(240,236,230,.3)", letterSpacing:".1em", textTransform:"uppercase", marginBottom:14 }}>Topics you'll master</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {CHIPS.map((c, i) => (
              <div key={c.label} className="float-loop" style={{
                padding:"6px 14px", borderRadius:99,
                background:c.bg, border:`1px solid ${c.color}30`,
                color:c.color, fontSize:".78rem", fontWeight:500,
                animationDelay:`${i * 0.4}s`, animationDuration:`${4 + i * 0.5}s`,
              }}>{c.label}</div>
            ))}
          </div>
        </div>

        {/* Bottom footnote */}
        <p style={{ color:"rgba(240,236,230,.2)", fontSize:".68rem", position:"relative", zIndex:1 }}>
          MCA Final Year Project · 2025
        </p>
      </div>

      {/* ── RIGHT FORM PANEL ────────────────────────────────────────── */}
      <div style={{
        flex:1, display:"flex", alignItems:"center", justifyContent:"center",
        padding:"48px 32px",
      }}>
        <div style={{ width:"100%", maxWidth:360 }}>
          <div className="fade-up" style={{ marginBottom:36 }}>
            <h2 style={{
              fontFamily:"var(--font-display)", fontStyle:"italic",
              fontSize:"2.2rem", color:"var(--ink)", fontWeight:400, marginBottom:6,
            }}>Welcome back.</h2>
            <p style={{ color:"var(--ink-3)", fontSize:".875rem" }}>
              Sign in to continue your learning journey.
            </p>
          </div>

          <form className="fade-up" onSubmit={handleLogin} style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div>
              <label style={{ display:"block", fontSize:".68rem", fontWeight:700, color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:".12em", marginBottom:8 }}>Email</label>
              <input type="email" className="glow-input" placeholder="you@university.edu"
                value={email} onChange={e => setEmail(e.target.value)}/>
            </div>
            <div>
              <label style={{ display:"block", fontSize:".68rem", fontWeight:700, color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:".12em", marginBottom:8 }}>Password</label>
              <input type="password" className="glow-input" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}/>
            </div>

            {error && (
              <div style={{ padding:"10px 14px", borderRadius:8, background:"var(--ruby-dim)", border:"1px solid var(--ruby-border)", color:"var(--ruby)", fontSize:".84rem" }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn-glow" disabled={loading}
              style={{ width:"100%", padding:"13px", fontSize:".92rem", marginTop:4 }}>
              {loading ? "Signing in…" : "Continue →"}
            </button>
          </form>

          <div className="fade-up" style={{ margin:"28px 0 20px", display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ flex:1, height:1, background:"var(--border)" }}/>
            <span style={{ fontSize:".71rem", color:"var(--ink-4)" }}>No account yet?</span>
            <div style={{ flex:1, height:1, background:"var(--border)" }}/>
          </div>

          <Link className="fade-up" to="/signup" style={{
            display:"block", textAlign:"center", padding:12,
            border:"1px solid var(--border-med)", borderRadius:10,
            color:"var(--ink-2)", fontSize:".875rem", fontWeight:500,
            textDecoration:"none", transition:"all .18s", fontFamily:"var(--font-body)",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor="var(--gold-border)"; e.currentTarget.style.color="var(--gold)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor="var(--border-med)"; e.currentTarget.style.color="var(--ink-2)"; }}>
            Create an account
          </Link>
        </div>
      </div>

      <style>{`
        @media(max-width:720px){ .login-hero{ display:none!important; } }
      `}</style>
    </div>
  );
}