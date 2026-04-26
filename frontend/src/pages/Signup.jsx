import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function Signup() {
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password) { setError("All fields are required."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }
    try {
      setLoading(true);
      await api.post("/signup", { name: form.name, email: form.email, password: form.password });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "48px 24px",
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Logo */}
        <div className="fade-up" style={{ textAlign: "center", marginBottom: 36 }}>
          <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: 9, textDecoration: "none", marginBottom: 28 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 7, background: "var(--gold)",
              display: "flex", alignItems: "center", justifyContent: "center",
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
          </Link>

          <h1 style={{
            fontFamily: "var(--font-display)", fontStyle: "italic",
            fontSize: "2rem", color: "var(--ink)", marginBottom: 6, fontWeight: 400,
          }}>
            Create your account.
          </h1>
          <p style={{ color: "var(--ink-3)", fontSize: "0.875rem" }}>
            Join and start studying smarter from day one.
          </p>
        </div>

        {/* Card */}
        <div className="fade-up glass" style={{ padding: "32px 28px" }}>
          <form onSubmit={handleSubmit}>

            {[
              { name: "name",            type: "text",     label: "Full Name",        placeholder: "Your full name" },
              { name: "email",           type: "email",    label: "Email Address",    placeholder: "you@university.edu" },
              { name: "password",        type: "password", label: "Password",         placeholder: "Min. 6 characters" },
              { name: "confirmPassword", type: "password", label: "Confirm Password", placeholder: "••••••••" },
            ].map((f, idx) => (
              <div key={f.name} style={{ marginBottom: idx === 3 ? 24 : 16 }}>
                <label style={{
                  display: "block", fontSize: "0.7rem", fontWeight: 600,
                  color: "var(--ink-4)", textTransform: "uppercase",
                  letterSpacing: "0.1em", marginBottom: 8,
                }}>{f.label}</label>
                <input
                  type={f.type} name={f.name}
                  className="glow-input"
                  placeholder={f.placeholder}
                  value={form[f.name]}
                  onChange={handleChange}
                />
              </div>
            ))}

            {error && (
              <div style={{
                padding: "10px 14px", borderRadius: 8, marginBottom: 20,
                background: "var(--ruby-dim)", border: "1px solid var(--ruby-border)",
                color: "var(--ruby)", fontSize: "0.84rem",
              }}>{error}</div>
            )}

            <button type="submit" className="btn-glow" disabled={loading}
              style={{ width: "100%", padding: 13, fontSize: "0.9rem" }}>
              {loading ? "Creating account…" : "Create Account →"}
            </button>
          </form>
        </div>

        {/* Sign in link */}
        <p className="fade-up" style={{
          textAlign: "center", marginTop: 20,
          color: "var(--ink-3)", fontSize: "0.855rem",
        }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--gold)", fontWeight: 600, textDecoration: "none" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
