import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
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
      setError(err.response?.status === 401 ? "Invalid email or password." : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Left panel — brand */}
      <div className="auth-left" style={{
        flex: "0 0 44%", padding: "48px", display: "flex", flexDirection: "column",
        justifyContent: "space-between",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: "linear-gradient(135deg, #f59e0b, #2dd4bf)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, color: "#000", fontWeight: 900,
          }}>E</div>
          <span style={{
            fontFamily: "var(--font-display)", fontStyle: "italic",
            fontSize: "1.15rem", color: "var(--ink)",
          }}>Edu<span style={{ color: "var(--amber)" }}>Genie</span></span>
        </div>

        <div>
          <div style={{ marginBottom: 24 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 7, padding: "4px 12px",
              borderRadius: 99, background: "var(--amber-dim)", border: "1px solid rgba(245,158,11,0.25)",
              marginBottom: 20,
            }}>
              <span className="dot-pulse" />
              <span style={{ fontSize: "0.72rem", color: "var(--amber)", fontWeight: 600, letterSpacing: "0.06em" }}>
                AI-POWERED LEARNING
              </span>
            </div>
            <h1 style={{
              fontFamily: "var(--font-display)", fontStyle: "italic",
              fontSize: "clamp(2rem,4vw,3.2rem)", lineHeight: 1.1,
              color: "var(--ink)", marginBottom: 16,
            }}>
              Study smarter,<br />
              <span style={{ color: "var(--amber)" }}>not harder.</span>
            </h1>
            <p style={{ color: "var(--ink-3)", fontSize: "0.95rem", lineHeight: 1.7, maxWidth: 340 }}>
              Your intelligent MCA companion. Generate notes, ace quizzes, and track your progress — all in one place.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { icon: "✎", label: "AI-generated topic notes" },
              { icon: "◉", label: "Adaptive MCQ quizzes" },
              { icon: "∿", label: "Real-time performance analytics" },
              { icon: "🤖", label: "24/7 AI chat tutor" },
            ].map(f => (
              <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                  background: "var(--bg-elevated)", border: "1px solid var(--border-med)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.85rem", color: "var(--amber)",
                }}>{f.icon}</div>
                <span style={{ fontSize: "0.88rem", color: "var(--ink-2)" }}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ color: "var(--ink-4)", fontSize: "0.75rem" }}>
          © 2025 EduGenie — Final Year Project
        </p>
      </div>

      {/* Right panel — form */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 32px",
      }}>
        <div className="fade-up" style={{ width: "100%", maxWidth: 400 }}>
          <div style={{ marginBottom: 36 }}>
            <h2 style={{
              fontFamily: "var(--font-display)", fontStyle: "italic",
              fontSize: "1.9rem", color: "var(--ink)", marginBottom: 6,
            }}>Welcome back</h2>
            <p style={{ color: "var(--ink-3)", fontSize: "0.88rem" }}>
              Sign in to continue your learning journey
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label className="field-label" style={{
                display: "block", fontSize: "0.72rem", fontWeight: 600,
                color: "var(--ink-3)", textTransform: "uppercase",
                letterSpacing: "0.08em", marginBottom: 7,
              }}>Email address</label>
              <input
                type="email"
                className="glow-input"
                placeholder="you@university.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{
                display: "block", fontSize: "0.72rem", fontWeight: 600,
                color: "var(--ink-3)", textTransform: "uppercase",
                letterSpacing: "0.08em", marginBottom: 7,
              }}>Password</label>
              <input
                type="password"
                className="glow-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div style={{
                padding: "10px 14px", borderRadius: 8, marginBottom: 20,
                background: "rgba(251,113,133,0.08)",
                border: "1px solid rgba(251,113,133,0.2)",
                color: "var(--rose)", fontSize: "0.84rem",
              }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn-glow" disabled={loading}
              style={{ width: "100%", padding: "12px", fontSize: "0.92rem" }}>
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 24, color: "var(--ink-3)", fontSize: "0.85rem" }}>
            New to EduGenie?{" "}
            <Link to="/signup" style={{ color: "var(--amber)", fontWeight: 600, textDecoration: "none" }}>
              Create account
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .auth-left { display: none; } }
      `}</style>
    </div>
  );
}

export default Login;
