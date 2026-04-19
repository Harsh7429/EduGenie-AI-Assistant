import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password) { setError("All fields are required."); return; }
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

  const fields = [
    { name: "name",            type: "text",     label: "Full Name",        placeholder: "Your full name" },
    { name: "email",           type: "email",    label: "Email Address",    placeholder: "you@university.edu" },
    { name: "password",        type: "password", label: "Password",         placeholder: "••••••••" },
    { name: "confirmPassword", type: "password", label: "Confirm Password", placeholder: "••••••••" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "48px 24px",
    }}>
      <div style={{ width: "100%", maxWidth: 460 }}>
        {/* Header */}
        <div className="fade-up" style={{ textAlign: "center", marginBottom: 40 }}>
          <div onClick={() => navigate("/login")} style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            cursor: "pointer", marginBottom: 28,
          }}>
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

          <h1 style={{
            fontFamily: "var(--font-display)", fontStyle: "italic",
            fontSize: "2rem", color: "var(--ink)", marginBottom: 8,
          }}>Create your account</h1>
          <p style={{ color: "var(--ink-3)", fontSize: "0.88rem" }}>
            Join thousands of MCA students learning smarter
          </p>
        </div>

        {/* Form card */}
        <div className="fade-up glass" style={{ padding: "32px" }}>
          <form onSubmit={handleSubmit}>
            {fields.map(f => (
              <div key={f.name} style={{ marginBottom: 16 }}>
                <label style={{
                  display: "block", fontSize: "0.72rem", fontWeight: 600,
                  color: "var(--ink-3)", textTransform: "uppercase",
                  letterSpacing: "0.08em", marginBottom: 7,
                }}>{f.label}</label>
                <input
                  type={f.type}
                  name={f.name}
                  className="glow-input"
                  placeholder={f.placeholder}
                  value={form[f.name]}
                  onChange={handleChange}
                />
              </div>
            ))}

            {error && (
              <div style={{
                padding: "10px 14px", borderRadius: 8, marginBottom: 16,
                background: "rgba(251,113,133,0.08)",
                border: "1px solid rgba(251,113,133,0.2)",
                color: "var(--rose)", fontSize: "0.84rem",
              }}>{error}</div>
            )}

            <button type="submit" className="btn-glow" disabled={loading}
              style={{ width: "100%", padding: "12px", fontSize: "0.92rem", marginTop: 8 }}>
              {loading ? "Creating account…" : "Create Account →"}
            </button>
          </form>
        </div>

        <p className="fade-up" style={{ textAlign: "center", marginTop: 20, color: "var(--ink-3)", fontSize: "0.85rem" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--amber)", fontWeight: 600, textDecoration: "none" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
