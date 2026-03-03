import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
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
    { name: "name",            type: "text",     label: "Full Name",       placeholder: "Your full name" },
    { name: "email",           type: "email",    label: "Email",           placeholder: "you@university.edu" },
    { name: "password",        type: "password", label: "Password",        placeholder: "••••••••" },
    { name: "confirmPassword", type: "password", label: "Confirm Password",placeholder: "••••••••" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px", position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        <div className="orb1" style={{
          position: "absolute", top: "5%", right: "15%",
          width: "450px", height: "450px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)",
        }} />
        <div className="orb2" style={{
          position: "absolute", bottom: "15%", left: "5%",
          width: "350px", height: "350px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)",
        }} />
      </div>

      <div className="glass fade-up" style={{ width: "100%", maxWidth: "440px", padding: "48px 40px", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{
            width: "52px", height: "52px", borderRadius: "16px",
            background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "22px", margin: "0 auto 16px",
            boxShadow: "0 0 30px rgba(124,58,237,0.5)",
          }}>✦</div>
          <h1 className="title-font" style={{ fontSize: "1.9rem", letterSpacing: "-0.03em", marginBottom: "6px" }}>
            Create account
          </h1>
          <p style={{ color: "#475569", fontSize: "0.88rem" }}>Join EduGenie and start learning smarter</p>
        </div>

        <form onSubmit={handleSubmit}>
          {fields.map(f => (
            <div key={f.name} style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "0.8rem", color: "#64748b", marginBottom: "7px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {f.label}
              </label>
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
              padding: "10px 14px", borderRadius: "8px",
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              color: "#f87171", fontSize: "0.84rem", marginBottom: "20px",
            }}>{error}</div>
          )}

          <button type="submit" className="btn-glow" disabled={loading} style={{ width: "100%", padding: "13px", fontSize: "0.95rem", marginTop: "8px" }}>
            {loading ? "Creating account..." : "Create Account →"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "24px", color: "#475569", fontSize: "0.85rem" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#818cf8", fontWeight: "600", textDecoration: "none" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
