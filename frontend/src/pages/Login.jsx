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
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        <div className="orb1" style={{
          position: "absolute", top: "15%", left: "10%",
          width: "500px", height: "500px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
        }} />
        <div className="orb2" style={{
          position: "absolute", bottom: "10%", right: "10%",
          width: "400px", height: "400px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)",
        }} />
      </div>

      {/* Card */}
      <div className="glass fade-up" style={{
        width: "100%",
        maxWidth: "420px",
        padding: "48px 40px",
        position: "relative",
        zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{
            width: "52px", height: "52px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #6366f1, #06b6d4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "22px",
            margin: "0 auto 16px",
            boxShadow: "0 0 30px rgba(99,102,241,0.5)",
          }}>✦</div>

          <h1 className="title-font" style={{ fontSize: "1.9rem", letterSpacing: "-0.03em", marginBottom: "6px" }}>
            Welcome back
          </h1>
          <p style={{ color: "#475569", fontSize: "0.88rem" }}>
            Sign in to continue your learning journey
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "0.8rem", color: "#64748b", marginBottom: "7px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Email
            </label>
            <input
              type="email"
              className="glow-input"
              placeholder="you@university.edu"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: "28px" }}>
            <label style={{ display: "block", fontSize: "0.8rem", color: "#64748b", marginBottom: "7px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Password
            </label>
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
              padding: "10px 14px",
              borderRadius: "8px",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#f87171",
              fontSize: "0.84rem",
              marginBottom: "20px",
            }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn-glow" disabled={loading} style={{ width: "100%", padding: "13px", fontSize: "0.95rem" }}>
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "24px", color: "#475569", fontSize: "0.85rem" }}>
          New to EduGenie?{" "}
          <Link to="/signup" style={{ color: "#818cf8", fontWeight: "600", textDecoration: "none" }}>
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
