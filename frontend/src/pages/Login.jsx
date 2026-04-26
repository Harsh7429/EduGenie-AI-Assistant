import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
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
      setError(err.response?.status === 401
        ? "Invalid email or password."
        : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "stretch",
      position: "relative", overflow: "hidden",
    }}>
      {/* Left decorative panel */}
      <div style={{
        flex: "0 0 42%", position: "relative", overflow: "hidden",
        borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: "52px 52px 44px",
      }} className="auth-panel">
        {/* Fine diagonal lines as texture */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.025,
          backgroundImage: "repeating-linear-gradient(135deg, var(--gold) 0px, var(--gold) 1px, transparent 1px, transparent 40px)",
          pointerEvents: "none",
        }} />
        {/* Gold gradient wash */}
        <div style={{
          position: "absolute", bottom: 0, right: 0, width: "70%", height: "55%",
          background: "radial-gradient(ellipse at bottom right, rgba(200,164,90,0.09) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative", zIndex: 1 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 7, background: "var(--gold)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M2 2h4.5v4.5H2V2z" fill="#07070d" opacity="0.9"/>
              <path d="M6.5 6.5H11V11H6.5V6.5z" fill="#07070d" opacity="0.9"/>
              <circle cx="9" cy="3.5" r="2" stroke="#07070d" strokeWidth="1.3" opacity="0.9"/>
              <circle cx="3.5" cy="9.5" r="2" stroke="#07070d" strokeWidth="1.3" opacity="0.9"/>
            </svg>
          </div>
          <span style={{
            fontFamily: "var(--font-display)", fontStyle: "italic",
            fontSize: "1.1rem", color: "var(--ink)",
          }}>Edu<span style={{ color: "var(--gold)" }}>Genie</span></span>
        </div>

        {/* Headline */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            width: 32, height: 1.5, background: "var(--gold)", borderRadius: 99, marginBottom: 28, opacity: 0.6,
          }} />
          <h2 style={{
            fontFamily: "var(--font-display)", fontStyle: "italic",
            fontSize: "clamp(2.2rem, 4vw, 3.4rem)", lineHeight: 1.1,
            color: "var(--ink)", marginBottom: 20, fontWeight: 400,
          }}>
            Your MCA study<br />
            companion,<br />
            <span style={{ color: "var(--gold)" }}>reimagined.</span>
          </h2>
          <p style={{ color: "var(--ink-3)", fontSize: "0.9rem", lineHeight: 1.75, maxWidth: 310 }}>
            Generate notes, build quizzes, track your progress — powered by AI and built for the MCA syllabus.
          </p>
        </div>

        {/* Feature list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 11, position: "relative", zIndex: 1 }}>
          {[
            { label: "AI-generated topic notes",       dot: "var(--gold)"      },
            { label: "Adaptive MCQ quizzes with timer", dot: "var(--sapphire)"  },
            { label: "Performance analytics",           dot: "var(--jade)"      },
            { label: "24/7 AI chat tutor",              dot: "var(--lavender)"  },
          ].map(f => (
            <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: f.dot, flexShrink: 0 }} />
              <span style={{ fontSize: "0.85rem", color: "var(--ink-3)" }}>{f.label}</span>
            </div>
          ))}
        </div>

        <p style={{ color: "var(--ink-4)", fontSize: "0.72rem", position: "relative", zIndex: 1 }}>
          MCA Final Year Project · 2025
        </p>
      </div>

      {/* Right: form */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "48px 32px",
      }}>
        <div style={{ width: "100%", maxWidth: 380 }} className="fade-up">
          <div style={{ marginBottom: 36 }}>
            <h1 style={{
              fontFamily: "var(--font-display)", fontStyle: "italic",
              fontSize: "2rem", color: "var(--ink)", marginBottom: 6, fontWeight: 400,
            }}>
              Welcome back.
            </h1>
            <p style={{ color: "var(--ink-3)", fontSize: "0.875rem" }}>
              Sign in to continue your learning journey.
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: "block", fontSize: "0.7rem", fontWeight: 600,
                color: "var(--ink-4)", textTransform: "uppercase",
                letterSpacing: "0.1em", marginBottom: 8,
              }}>Email address</label>
              <input
                type="email" className="glow-input"
                placeholder="you@university.edu"
                value={email} onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{
                display: "block", fontSize: "0.7rem", fontWeight: 600,
                color: "var(--ink-4)", textTransform: "uppercase",
                letterSpacing: "0.1em", marginBottom: 8,
              }}>Password</label>
              <input
                type="password" className="glow-input"
                placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div style={{
                padding: "10px 14px", borderRadius: 8, marginBottom: 20,
                background: "var(--ruby-dim)", border: "1px solid var(--ruby-border)",
                color: "var(--ruby)", fontSize: "0.84rem",
              }}>{error}</div>
            )}

            <button type="submit" className="btn-glow" disabled={loading}
              style={{ width: "100%", padding: 13, fontSize: "0.9rem", letterSpacing: "-0.01em" }}>
              {loading ? "Signing in…" : "Continue →"}
            </button>
          </form>

          <div style={{ margin: "28px 0", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ fontSize: "0.72rem", color: "var(--ink-4)" }}>New here?</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          <Link
            to="/signup"
            style={{
              display: "block", textAlign: "center", padding: "11px",
              border: "1px solid var(--border-med)", borderRadius: 9,
              color: "var(--ink-2)", fontSize: "0.875rem", fontWeight: 500,
              textDecoration: "none", transition: "all 0.18s",
              fontFamily: "var(--font-body)",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--gold-border)"; e.currentTarget.style.color = "var(--gold)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-med)"; e.currentTarget.style.color = "var(--ink-2)"; }}
          >
            Create an account
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) { .auth-panel { display: none; } }
      `}</style>
    </div>
  );
}
