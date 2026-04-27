import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
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
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"stretch", position:"relative", overflow:"hidden" }}>
      {/* Left panel */}
      <div className="auth-panel" style={{
        flex:"0 0 42%", position:"relative", overflow:"hidden",
        borderRight:"1px solid var(--border)",
        display:"flex", flexDirection:"column", justifyContent:"space-between",
        padding:"52px 52px 44px",
      }}>
        <div style={{
          position:"absolute", inset:0, opacity:.025,
          backgroundImage:"repeating-linear-gradient(135deg,var(--gold) 0px,var(--gold) 1px,transparent 1px,transparent 40px)",
          pointerEvents:"none",
        }}/>
        <div style={{
          position:"absolute", bottom:0, right:0, width:"70%", height:"55%",
          background:"radial-gradient(ellipse at bottom right,rgba(200,164,90,.09) 0%,transparent 70%)",
          pointerEvents:"none",
        }}/>
        <div style={{ display:"flex", alignItems:"center", gap:10, position:"relative", zIndex:1 }}>
          <div style={{ width:30, height:30, borderRadius:7, background:"var(--gold)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2h4.5v4.5H2V2z" fill="#07070d" opacity=".9"/><path d="M6.5 6.5H11V11H6.5V6.5z" fill="#07070d" opacity=".9"/><circle cx="9" cy="3.5" r="2" stroke="#07070d" strokeWidth="1.3" opacity=".9"/><circle cx="3.5" cy="9.5" r="2" stroke="#07070d" strokeWidth="1.3" opacity=".9"/></svg>
          </div>
          <span style={{ fontFamily:"var(--font-display)", fontStyle:"italic", fontSize:"1.1rem", color:"var(--ink)" }}>Edu<span style={{ color:"var(--gold)" }}>Genie</span></span>
        </div>
        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ width:32, height:1.5, background:"var(--gold)", borderRadius:99, marginBottom:28, opacity:.6 }}/>
          <h2 style={{
            fontFamily:"var(--font-display)", fontStyle:"italic",
            fontSize:"clamp(2rem,4vw,3.2rem)", lineHeight:1.1, color:"var(--ink)", marginBottom:18, fontWeight:400,
          }}>
            Your MCA study<br/>companion,<br/><span style={{ color:"var(--gold)" }}>reimagined.</span>
          </h2>
          <p style={{ color:"var(--ink-3)", fontSize:".88rem", lineHeight:1.75, maxWidth:300 }}>
            AI notes, adaptive quizzes, performance analytics — built for the MCA syllabus.
          </p>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10, position:"relative", zIndex:1 }}>
          {[
            ["var(--gold)",    "AI-generated topic notes"],
            ["var(--sapphire)","Adaptive MCQ quizzes with timer"],
            ["var(--jade)",    "Performance analytics & streaks"],
            ["var(--lavender)","24/7 AI chat tutor"],
          ].map(([dot,label]) => (
            <div key={label} style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:5, height:5, borderRadius:"50%", background:dot, flexShrink:0 }}/>
              <span style={{ fontSize:".84rem", color:"var(--ink-3)" }}>{label}</span>
            </div>
          ))}
        </div>
        <p style={{ color:"var(--ink-4)", fontSize:".7rem", position:"relative", zIndex:1 }}>MCA Final Year Project · 2025</p>
      </div>

      {/* Right: form */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"48px 24px" }}>
        <div style={{ width:"100%", maxWidth:380 }} className="fade-up">
          <div style={{ marginBottom:34 }}>
            <h1 style={{ fontFamily:"var(--font-display)", fontStyle:"italic", fontSize:"2rem", color:"var(--ink)", marginBottom:6, fontWeight:400 }}>Welcome back.</h1>
            <p style={{ color:"var(--ink-3)", fontSize:".875rem" }}>Sign in to continue your learning journey.</p>
          </div>
          <form onSubmit={handleLogin}>
            {[
              { label:"Email address", type:"email",    value:email,    set:setEmail,    ph:"you@university.edu" },
              { label:"Password",      type:"password", value:password, set:setPassword, ph:"••••••••"            },
            ].map(f => (
              <div key={f.label} style={{ marginBottom:16 }}>
                <label style={{ display:"block", fontSize:".7rem", fontWeight:600, color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:".1em", marginBottom:8 }}>{f.label}</label>
                <input type={f.type} className="glow-input" placeholder={f.ph} value={f.value} onChange={e=>f.set(e.target.value)}/>
              </div>
            ))}
            {error && <div style={{ padding:"10px 14px", borderRadius:8, marginBottom:18, background:"var(--ruby-dim)", border:"1px solid var(--ruby-border)", color:"var(--ruby)", fontSize:".84rem" }}>{error}</div>}
            <button type="submit" className="btn-glow" disabled={loading} style={{ width:"100%", padding:13, fontSize:".9rem", marginTop:8 }}>
              {loading ? "Signing in…" : "Continue →"}
            </button>
          </form>
          <div style={{ margin:"24px 0", display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ flex:1, height:1, background:"var(--border)" }}/>
            <span style={{ fontSize:".72rem", color:"var(--ink-4)" }}>New here?</span>
            <div style={{ flex:1, height:1, background:"var(--border)" }}/>
          </div>
          <Link to="/signup" style={{
            display:"block", textAlign:"center", padding:11,
            border:"1px solid var(--border-med)", borderRadius:9,
            color:"var(--ink-2)", fontSize:".875rem", fontWeight:500, textDecoration:"none",
            transition:"all .18s", fontFamily:"var(--font-body)",
          }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--gold-border)";e.currentTarget.style.color="var(--gold)";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border-med)";e.currentTarget.style.color="var(--ink-2)";}}>
            Create an account
          </Link>
        </div>
      </div>
      <style>{`@media(max-width:700px){.auth-panel{display:none!important;}}`}</style>
    </div>
  );
}