import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

const ALL_LINKS = [
  { path: "/dashboard",      label: "Dashboard", icon: "⚡" },
  { path: "/subjects",       label: "Subjects",  icon: "📊" },
  { path: "/generate-note",  label: "Notes",     icon: "📝" },
  { path: "/generate-quiz",  label: "Quiz",      icon: "🧠" },
  { path: "/my-quizzes",     label: "History",   icon: "📋" },
  { path: "/analytics",      label: "Analytics", icon: "📈" },
  { path: "/chat",           label: "AI Tutor",  icon: "🤖" },
  { path: "/fyp-guide",      label: "FYP Guide", icon: "🎓" },
  { path: "/resume-builder", label: "Resume",    icon: "📄" },
];

const NAV_LINKS = ALL_LINKS.slice(0, 6);
const MORE_LINKS = [
  { path: "/chat",           label: "AI Tutor",       icon: "🤖", color: "#22d3ee" },
  { path: "/fyp-guide",      label: "FYP Guide",      icon: "🎓", color: "#34d399" },
  { path: "/resume-builder", label: "Resume Builder", icon: "📄", color: "#f472b6" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = () => { localStorage.removeItem("token"); navigate("/login"); };
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav style={{
        background: "rgba(8,11,20,0.92)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(99,102,241,0.2)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{
          maxWidth: 1320, margin: "0 auto", padding: "0 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between", height: 56,
        }}>
          {/* Logo */}
          <div onClick={() => navigate("/dashboard")}
            style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9,
              background: "linear-gradient(135deg, #6366f1, #06b6d4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, boxShadow: "0 0 14px rgba(99,102,241,0.5)",
            }}>✦</div>
            <span className="title-font" style={{ fontSize: "1.1rem", letterSpacing: "-0.02em" }}>
              Edu<span style={{ color: "#6366f1" }}>Genie</span>
            </span>
          </div>

          {/* Desktop nav links */}
          <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {NAV_LINKS.map(link => {
              const active = isActive(link.path);
              return (
                <button key={link.path} onClick={() => navigate(link.path)} style={{
                  padding: "5px 10px", borderRadius: 8, border: "none", cursor: "pointer",
                  fontSize: "0.78rem", fontWeight: active ? 700 : 400,
                  fontFamily: "'Space Grotesk', sans-serif",
                  background: active ? "rgba(99,102,241,0.18)" : "transparent",
                  color: active ? "#818cf8" : "#64748b",
                  borderBottom: active ? "2px solid #6366f1" : "2px solid transparent",
                  transition: "all 0.2s ease",
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  <span>{link.icon}</span>
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
                  padding: "5px 10px", borderRadius: 8, border: "none", cursor: "pointer",
                  fontSize: "0.78rem", fontWeight: 400,
                  fontFamily: "'Space Grotesk', sans-serif",
                  background: MORE_LINKS.some(l => isActive(l.path)) ? "rgba(244,114,182,0.18)" : "transparent",
                  color: MORE_LINKS.some(l => isActive(l.path)) ? "#f472b6" : "#64748b",
                  borderBottom: MORE_LINKS.some(l => isActive(l.path)) ? "2px solid #f472b6" : "2px solid transparent",
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                <span>✨</span><span>Tools</span>
                <span style={{ fontSize: "0.6rem" }}>{moreOpen ? "▲" : "▼"}</span>
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
                        fontFamily: "'Space Grotesk', sans-serif", textAlign: "left",
                      }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                        background: `${link.color}18`, border: `1px solid ${link.color}33`,
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem",
                      }}>{link.icon}</div>
                      <span style={{ fontSize: "0.84rem", fontWeight: 600, color: "#e2e8f0" }}>{link.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Sign out + hamburger */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={logout} className="desktop-nav" style={{
              padding: "5px 14px", borderRadius: 8,
              border: "1px solid rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.08)",
              color: "#f87171", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600,
              fontFamily: "'Space Grotesk', sans-serif",
            }}>Sign Out</button>

            {/* Hamburger — mobile only */}
            <button className="mobile-menu-btn" onClick={() => setMenuOpen(o => !o)} style={{
              background: "transparent", border: "none", cursor: "pointer",
              color: "#94a3b8", fontSize: "1.3rem", padding: "4px 8px",
              display: "none",
            }}>☰</button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="mobile-menu" style={{
            background: "rgba(8,11,20,0.98)", borderTop: "1px solid rgba(99,102,241,0.15)",
            padding: "8px 0", display: "none",
          }}>
            {ALL_LINKS.map(link => {
              const active = isActive(link.path);
              return (
                <button key={link.path} onClick={() => { navigate(link.path); setMenuOpen(false); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 20px", border: "none", cursor: "pointer", textAlign: "left",
                    background: active ? "rgba(99,102,241,0.12)" : "transparent",
                    color: active ? "#818cf8" : "#94a3b8",
                    fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.9rem",
                    fontWeight: active ? 700 : 400,
                    borderLeft: active ? "3px solid #6366f1" : "3px solid transparent",
                  }}>
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </button>
              );
            })}
            <div style={{ padding: "8px 20px 12px" }}>
              <button onClick={logout} style={{
                width: "100%", padding: "10px", borderRadius: 8,
                border: "1px solid rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.08)",
                color: "#f87171", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600,
                fontFamily: "'Space Grotesk', sans-serif",
              }}>Sign Out</button>
            </div>
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 767px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
          .mobile-menu { display: block !important; }
        }
      `}</style>
    </>
  );
}
