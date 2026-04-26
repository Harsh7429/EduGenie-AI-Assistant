import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

/* ── Inline SVG icon set — no external dependency needed ──────────── */
const Icon = {
  dashboard: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  ),
  subjects: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 3.5A1.5 1.5 0 013.5 2h9A1.5 1.5 0 0114 3.5v9a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 012 12.5v-9z" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M5 5.5h6M5 8h6M5 10.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  note: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M9.5 2H4a1.5 1.5 0 00-1.5 1.5v9A1.5 1.5 0 004 14h8a1.5 1.5 0 001.5-1.5V6L9.5 2z" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M9.5 2v3.5H13M5.5 8.5h5M5.5 11h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  quiz: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M8 11V9.5c1.2-.3 2-1 2-2C10 6.1 9.1 5.5 8 5.5S6 6.1 6 7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="8" cy="12.5" r="0.6" fill="currentColor"/>
    </svg>
  ),
  history: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13z" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M8 4.5V8l2.5 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  analytics: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 13l3.5-4 3 2.5L12 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="2" cy="13" r="1" fill="currentColor"/>
      <circle cx="5.5" cy="9" r="1" fill="currentColor"/>
      <circle cx="8.5" cy="11.5" r="1" fill="currentColor"/>
      <circle cx="12" cy="5.5" r="1" fill="currentColor"/>
    </svg>
  ),
  notes: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 2.5h7l3 3V13a.5.5 0 01-.5.5H3a.5.5 0 01-.5-.5V3a.5.5 0 01.5-.5z" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M10 2.5v3h3" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M5 8h6M5 10.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  chat: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 3.5A1.5 1.5 0 013.5 2h9A1.5 1.5 0 0114 3.5v7a1.5 1.5 0 01-1.5 1.5H5L2 14V3.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M5.5 7h5M5.5 9h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  fyp: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10l-3 1.5.5-3.5L3 5.5l3.5-.5L8 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  ),
  resume: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="3" y="1.5" width="10" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <circle cx="8" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M5 9.5c0-1.1 1.3-2 3-2s3 .9 3 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M5 12h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  logout: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M9.5 2.5h2A1.5 1.5 0 0113 4v7a1.5 1.5 0 01-1.5 1.5h-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M6 5.5L2.5 9l3.5 3.5M2.5 9h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  menu: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  close: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
};

const NAV = [
  { path: "/dashboard",      label: "Dashboard",  icon: Icon.dashboard },
  { path: "/subjects",       label: "Subjects",   icon: Icon.subjects  },
  { path: "/generate-note",  label: "Generate Note", icon: Icon.note  },
  { path: "/generate-quiz",  label: "Quiz",       icon: Icon.quiz      },
  { path: "/my-quizzes",     label: "History",    icon: Icon.history   },
  { path: "/analytics",      label: "Analytics",  icon: Icon.analytics },
  { path: "/notes",          label: "My Notes",   icon: Icon.notes     },
];

const TOOLS = [
  { path: "/chat",           label: "AI Tutor",      icon: Icon.chat,   color: "var(--sapphire)"  },
  { path: "/fyp-guide",      label: "FYP Guide",     icon: Icon.fyp,    color: "var(--lavender)"  },
  { path: "/resume-builder", label: "Resume",        icon: Icon.resume, color: "var(--ruby)"      },
];

export default function Layout({ children }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [open, setOpen] = useState(false);

  const logout = () => { localStorage.removeItem("token"); navigate("/login"); };
  const isActive = (p) => location.pathname === p;
  const go = (path) => { navigate(path); setOpen(false); };

  const NavItem = ({ path, label, icon, color }) => {
    const active = isActive(path);
    const ac = color || "var(--gold)";
    return (
      <button
        onClick={() => go(path)}
        title={label}
        style={{
          display: "flex", alignItems: "center", gap: 11,
          width: "100%", padding: "9px 12px", borderRadius: 8,
          border: "none", cursor: "pointer", textAlign: "left",
          background: active ? `color-mix(in srgb, ${ac} 10%, transparent)` : "transparent",
          color: active ? ac : "var(--ink-3)",
          fontFamily: "var(--font-body)", fontSize: "0.845rem", fontWeight: active ? 600 : 400,
          transition: "all 0.15s",
        }}
        onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "var(--ink-2)"; }}}
        onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--ink-3)"; }}}
      >
        <span style={{ flexShrink: 0, opacity: active ? 1 : 0.6 }}>{icon}</span>
        <span className="nav-label">{label}</span>
        {active && (
          <span style={{
            marginLeft: "auto", width: 4, height: 4, borderRadius: "50%",
            background: ac, flexShrink: 0, opacity: 0.8,
          }} className="nav-label" />
        )}
      </button>
    );
  };

  const SidebarContent = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "20px 12px" }}>
      {/* Logo */}
      <div
        onClick={() => go("/dashboard")}
        style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 10px", marginBottom: 28, cursor: "pointer" }}
      >
        <div style={{
          width: 28, height: 28, borderRadius: 7, flexShrink: 0,
          background: "var(--gold)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M2 2h4.5v4.5H2V2z" fill="#07070d" opacity="0.9"/>
            <path d="M6.5 6.5H11V11H6.5V6.5z" fill="#07070d" opacity="0.9"/>
            <circle cx="9" cy="3.5" r="2" stroke="#07070d" strokeWidth="1.3" opacity="0.9"/>
            <circle cx="3.5" cy="9.5" r="2" stroke="#07070d" strokeWidth="1.3" opacity="0.9"/>
          </svg>
        </div>
        <span className="nav-label" style={{
          fontFamily: "var(--font-display)", fontStyle: "italic",
          fontSize: "1.1rem", color: "var(--ink)", letterSpacing: "-0.01em",
        }}>
          Edu<span style={{ color: "var(--gold)" }}>Genie</span>
        </span>
      </div>

      {/* Primary nav */}
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {NAV.map(item => <NavItem key={item.path} {...item} />)}
      </div>

      {/* Divider + Tools */}
      <div style={{ margin: "16px 10px", borderTop: "1px solid var(--border)" }} />
      <div style={{
        fontSize: "0.62rem", color: "var(--ink-4)", textTransform: "uppercase",
        letterSpacing: "0.1em", fontWeight: 700, padding: "0 12px", marginBottom: 6,
      }} className="nav-label">Tools</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {TOOLS.map(item => <NavItem key={item.path} {...item} />)}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Logout */}
      <button
        onClick={logout}
        title="Sign out"
        style={{
          display: "flex", alignItems: "center", gap: 10,
          width: "100%", padding: "9px 12px", borderRadius: 8,
          border: "none", cursor: "pointer", background: "transparent",
          color: "var(--ink-4)", fontFamily: "var(--font-body)",
          fontSize: "0.82rem", fontWeight: 400, transition: "all 0.15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.color = "var(--ruby)"; e.currentTarget.style.background = "var(--ruby-dim)"; }}
        onMouseLeave={e => { e.currentTarget.style.color = "var(--ink-4)"; e.currentTarget.style.background = "transparent"; }}
      >
        <span style={{ flexShrink: 0 }}>{Icon.logout}</span>
        <span className="nav-label">Sign out</span>
      </button>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", position: "relative" }}>
      {/* ── Desktop sidebar ── */}
      <aside style={{
        width: 220, flexShrink: 0, position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50,
        borderRight: "1px solid var(--border)",
        background: "var(--bg-2)",
      }} className="sidebar-desktop">
        <SidebarContent />
      </aside>

      {/* ── Mobile top bar ── */}
      <div style={{
        display: "none", position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(7,7,13,0.95)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
        padding: "0 16px", height: 52, alignItems: "center", justifyContent: "space-between",
      }} className="mobile-topbar">
        <div
          onClick={() => go("/dashboard")}
          style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
        >
          <div style={{
            width: 26, height: 26, borderRadius: 6, background: "var(--gold)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="11" height="11" viewBox="0 0 13 13" fill="none">
              <path d="M2 2h4.5v4.5H2V2z" fill="#07070d" opacity="0.9"/>
              <path d="M6.5 6.5H11V11H6.5V6.5z" fill="#07070d" opacity="0.9"/>
            </svg>
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "1rem", color: "var(--ink)" }}>
            Edu<span style={{ color: "var(--gold)" }}>Genie</span>
          </span>
        </div>
        <button
          onClick={() => setOpen(o => !o)}
          style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--ink-2)", padding: 4 }}
        >
          {open ? Icon.close : Icon.menu}
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 98 }}
          />
          <div style={{
            position: "fixed", top: 52, left: 0, bottom: 0, width: 240, zIndex: 99,
            background: "var(--bg-2)", borderRight: "1px solid var(--border)",
            overflowY: "auto",
          }}>
            <SidebarContent />
          </div>
        </>
      )}

      {/* ── Main content ── */}
      <main style={{
        flex: 1, marginLeft: 220, minHeight: "100vh", position: "relative", zIndex: 1,
      }} className="main-content">
        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "36px 32px 72px" }} className="page-container">
          {children}
        </div>
      </main>

      <style>{`
        @media (max-width: 860px) {
          .sidebar-desktop { display: none !important; }
          .mobile-topbar    { display: flex !important; }
          .main-content     { margin-left: 0 !important; padding-top: 52px; }
        }
      `}</style>
    </div>
  );
}
