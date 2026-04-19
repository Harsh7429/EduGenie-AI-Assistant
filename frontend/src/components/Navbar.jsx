import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

const ALL_LINKS = [
  { path: "/dashboard",      label: "Dashboard",  icon: "⊞" },
  { path: "/subjects",       label: "Subjects",   icon: "◈" },
  { path: "/generate-note",  label: "Notes",      icon: "✎" },
  { path: "/generate-quiz",  label: "Quiz",       icon: "◉" },
  { path: "/my-quizzes",     label: "History",    icon: "≡" },
  { path: "/analytics",      label: "Analytics",  icon: "∿" },
];
const TOOL_LINKS = [
  { path: "/chat",           label: "AI Tutor",      color: "#2dd4bf" },
  { path: "/fyp-guide",      label: "FYP Guide",     color: "#a78bfa" },
  { path: "/resume-builder", label: "Resume Builder",color: "#fb7185" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = () => { localStorage.removeItem("token"); navigate("/login"); };
  const isActive = (path) => location.pathname === path;
  const toolActive = TOOL_LINKS.some(l => isActive(l.path));

  return (
    <>
      <nav style={{
        background: "rgba(9,9,11,0.88)",
        backdropFilter: "blur(20px) saturate(1.6)",
        WebkitBackdropFilter: "blur(20px) saturate(1.6)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{
          maxWidth: 1320, margin: "0 auto", padding: "0 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between", height: 54,
        }}>

          {/* Logo */}
          <div onClick={() => navigate("/dashboard")} style={{
            cursor: "pointer", display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: "linear-gradient(135deg, #f59e0b, #2dd4bf)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, color: "#000", fontWeight: 900,
              flexShrink: 0,
            }}>E</div>
            <span style={{
              fontFamily: "var(--font-display)", fontStyle: "italic",
              fontSize: "1.15rem", letterSpacing: "-0.02em", color: "var(--ink)",
            }}>
              Edu<span style={{ color: "var(--amber)" }}>Genie</span>
            </span>
          </div>

          {/* Desktop nav */}
          <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 1 }}>
            {ALL_LINKS.map(link => {
              const active = isActive(link.path);
              return (
                <button key={link.path} onClick={() => navigate(link.path)} style={{
                  padding: "5px 12px", borderRadius: 7, border: "none", cursor: "pointer",
                  fontSize: "0.82rem", fontWeight: active ? 600 : 400,
                  fontFamily: "var(--font-body)",
                  background: active ? "rgba(245,158,11,0.12)" : "transparent",
                  color: active ? "var(--amber)" : "var(--ink-3)",
                  transition: "all 0.15s",
                }}>
                  {link.label}
                </button>
              );
            })}

            {/* Tools dropdown */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setMoreOpen(o => !o)}
                onBlur={() => setTimeout(() => setMoreOpen(false), 150)}
                style={{
                  padding: "5px 12px", borderRadius: 7, border: "none", cursor: "pointer",
                  fontSize: "0.82rem", fontWeight: toolActive ? 600 : 400,
                  fontFamily: "var(--font-body)",
                  background: toolActive ? "rgba(167,139,250,0.12)" : "transparent",
                  color: toolActive ? "var(--violet)" : "var(--ink-3)",
                  display: "flex", alignItems: "center", gap: 5, transition: "all 0.15s",
                }}>
                Tools
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d={moreOpen ? "M2 7L5 4L8 7" : "M2 4L5 7L8 4"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
              {moreOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0,
                  background: "rgba(9,9,11,0.97)", backdropFilter: "blur(24px)",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12,
                  padding: "6px", minWidth: 190, zIndex: 200,
                  boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                }}>
                  {TOOL_LINKS.map(link => (
                    <button key={link.path} onClick={() => { navigate(link.path); setMoreOpen(false); }}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 10,
                        padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                        background: isActive(link.path) ? `${link.color}12` : "transparent",
                        fontFamily: "var(--font-body)", textAlign: "left",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = `${link.color}10`}
                      onMouseLeave={e => e.currentTarget.style.background = isActive(link.path) ? `${link.color}12` : "transparent"}
                    >
                      <div style={{
                        width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                        background: link.color, opacity: isActive(link.path) ? 1 : 0.5,
                      }}/>
                      <span style={{ fontSize: "0.84rem", fontWeight: 500, color: "var(--ink-2)" }}>{link.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={logout} className="desktop-nav" style={{
              padding: "5px 14px", borderRadius: 7,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "transparent",
              color: "var(--ink-3)", cursor: "pointer", fontSize: "0.8rem", fontWeight: 500,
              fontFamily: "var(--font-body)", transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.color = "var(--rose)"; e.currentTarget.style.borderColor = "rgba(251,113,133,0.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "var(--ink-3)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}>
              Sign out
            </button>

            <button className="mobile-menu-btn" onClick={() => setMenuOpen(o => !o)} style={{
              background: "transparent", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer",
              color: "var(--ink-2)", fontSize: "1.1rem", padding: "4px 8px", borderRadius: 7,
              display: "none",
            }}>☰</button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="mobile-menu" style={{
            background: "rgba(9,9,11,0.98)", borderTop: "1px solid rgba(255,255,255,0.07)",
            padding: "8px 12px 12px", display: "none",
          }}>
            {[...ALL_LINKS, ...TOOL_LINKS].map(link => {
              const active = isActive(link.path);
              return (
                <button key={link.path} onClick={() => { navigate(link.path); setMenuOpen(false); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: "11px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                    background: active ? "rgba(245,158,11,0.08)" : "transparent",
                    color: active ? "var(--amber)" : "var(--ink-2)",
                    fontFamily: "var(--font-body)", fontSize: "0.9rem",
                    fontWeight: active ? 600 : 400, textAlign: "left",
                  }}>
                  {link.label}
                </button>
              );
            })}
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <button onClick={logout} style={{
                width: "100%", padding: "10px", borderRadius: 8,
                border: "1px solid rgba(251,113,133,0.25)", background: "rgba(251,113,133,0.06)",
                color: "var(--rose)", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600,
                fontFamily: "var(--font-body)",
              }}>Sign Out</button>
            </div>
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 767px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .mobile-menu { display: block !important; }
        }
      `}</style>
    </>
  );
}
