import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

const NAV_GROUPS = [
  {
    links: [
      { path: "/dashboard",     label: "Dashboard", icon: "⚡" },
      { path: "/subjects",      label: "Subjects",  icon: "📊" },
      { path: "/generate-note", label: "Notes",     icon: "📝" },
      { path: "/generate-quiz", label: "Quiz",      icon: "🧠" },
      { path: "/my-quizzes",    label: "History",   icon: "📋" },
      { path: "/analytics",     label: "Analytics", icon: "📈" },
    ]
  }
];

const MORE_LINKS = [
  { path: "/fyp-guide",      label: "FYP Guide",       icon: "🎓", color: "#34d399" },
  { path: "/resume-builder", label: "Resume Builder",  icon: "📄", color: "#f472b6" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const logout = () => { localStorage.removeItem("token"); navigate("/login"); };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      background: "rgba(8,11,20,0.92)", backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(99,102,241,0.2)",
      position: "sticky", top: 0, zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1320, margin: "0 auto", padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between", height: 60,
      }}>
        {/* Logo */}
        <div onClick={() => navigate("/dashboard")}
          style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: "linear-gradient(135deg, #6366f1, #06b6d4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, boxShadow: "0 0 14px rgba(99,102,241,0.5)",
          }}>✦</div>
          <span className="title-font" style={{ fontSize: "1.15rem", letterSpacing: "-0.02em" }}>
            Edu<span style={{ color: "#6366f1" }}>Genie</span>
          </span>
        </div>

        {/* Main nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {NAV_GROUPS[0].links.map(link => {
            const active = isActive(link.path);
            return (
              <button key={link.path} onClick={() => navigate(link.path)} style={{
                padding: "5px 11px", borderRadius: 8, border: "none", cursor: "pointer",
                fontSize: "0.8rem", fontWeight: active ? 700 : 400,
                fontFamily: "'Space Grotesk', sans-serif",
                background: active ? "rgba(99,102,241,0.18)" : "transparent",
                color: active ? "#818cf8" : "#64748b",
                borderBottom: active ? "2px solid #6366f1" : "2px solid transparent",
                transition: "all 0.2s ease",
                display: "flex", alignItems: "center", gap: 5,
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = "#e2e8f0"; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = "#64748b"; }}>
                <span style={{ fontSize: "0.82rem" }}>{link.icon}</span>
                <span>{link.label}</span>
              </button>
            );
          })}

          {/* More dropdown */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setMoreOpen(o => !o)}
              onBlur={() => setTimeout(() => setMoreOpen(false), 150)}
              style={{
                padding: "5px 11px", borderRadius: 8, border: "none", cursor: "pointer",
                fontSize: "0.8rem", fontWeight: 400,
                fontFamily: "'Space Grotesk', sans-serif",
                background: MORE_LINKS.some(l => isActive(l.path)) ? "rgba(244,114,182,0.18)" : "transparent",
                color: MORE_LINKS.some(l => isActive(l.path)) ? "#f472b6" : "#64748b",
                borderBottom: MORE_LINKS.some(l => isActive(l.path)) ? "2px solid #f472b6" : "2px solid transparent",
                transition: "all 0.2s ease",
                display: "flex", alignItems: "center", gap: 5,
              }}
              onMouseEnter={e => { if (!MORE_LINKS.some(l => isActive(l.path))) e.currentTarget.style.color = "#e2e8f0"; }}
              onMouseLeave={e => { if (!MORE_LINKS.some(l => isActive(l.path))) e.currentTarget.style.color = "#64748b"; }}>
              <span style={{ fontSize: "0.82rem" }}>✨</span>
              <span>Tools</span>
              <span style={{ fontSize: "0.65rem", marginLeft: 2 }}>{moreOpen ? "▲" : "▼"}</span>
            </button>

            {moreOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0,
                background: "rgba(8,11,20,0.98)", backdropFilter: "blur(20px)",
                border: "1px solid rgba(99,102,241,0.2)", borderRadius: 12,
                padding: 8, minWidth: 200, zIndex: 200,
                boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
              }}>
                {MORE_LINKS.map(link => (
                  <button key={link.path} onClick={() => { navigate(link.path); setMoreOpen(false); }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 14px", borderRadius: 9, border: "none", cursor: "pointer",
                      background: isActive(link.path) ? `${link.color}15` : "transparent",
                      fontFamily: "'Space Grotesk', sans-serif",
                      transition: "all 0.15s ease", textAlign: "left",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = `${link.color}12`}
                    onMouseLeave={e => e.currentTarget.style.background = isActive(link.path) ? `${link.color}15` : "transparent"}>
                    <div style={{
                      width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                      background: `${link.color}18`, border: `1px solid ${link.color}33`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.9rem",
                    }}>{link.icon}</div>
                    <div>
                      <div style={{ fontSize: "0.84rem", fontWeight: 600, color: "#e2e8f0" }}>
                        {link.label}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "#475569", marginTop: 1 }}>
                        {link.path === "/fyp-guide" ? "MCA 4th semester" : "ATS-optimized PDF"}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sign out */}
        <button onClick={logout} style={{
          padding: "6px 16px", borderRadius: 8,
          border: "1px solid rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.08)",
          color: "#f87171", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600,
          fontFamily: "'Space Grotesk', sans-serif", transition: "all 0.2s ease",
          flexShrink: 0,
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.2)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}>
          Sign Out
        </button>
      </div>
    </nav>
  );
}
