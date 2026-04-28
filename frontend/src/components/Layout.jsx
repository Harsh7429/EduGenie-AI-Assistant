import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const Ico = {
  dashboard: <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><rect x="2" y="2" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.35"/><rect x="9.5" y="2" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.35"/><rect x="2" y="9.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.35"/><rect x="9.5" y="9.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.35"/></svg>,
  subjects:  <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M3 4a1.5 1.5 0 011.5-1.5h8A1.5 1.5 0 0114 4v9a1.5 1.5 0 01-1.5 1.5h-8A1.5 1.5 0 013 13V4z" stroke="currentColor" strokeWidth="1.35"/><path d="M5.5 6h6M5.5 8.5h6M5.5 11h4" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round"/></svg>,
  note:      <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M10 2.5H5a1.5 1.5 0 00-1.5 1.5v9A1.5 1.5 0 005 14.5h7a1.5 1.5 0 001.5-1.5V6L10 2.5z" stroke="currentColor" strokeWidth="1.35"/><path d="M10 2.5V6H13.5M6 9.5h5M6 12h3.5" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round"/></svg>,
  quiz:      <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><circle cx="8.5" cy="8.5" r="6.5" stroke="currentColor" strokeWidth="1.35"/><path d="M8.5 11.5V9.5c1.3-.3 2.2-1.1 2.2-2.2C10.7 6.1 9.7 5.5 8.5 5.5S6.3 6.1 6.3 7.3" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round"/><circle cx="8.5" cy="13" r=".7" fill="currentColor"/></svg>,
  history:   <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><circle cx="8.5" cy="8.5" r="6.5" stroke="currentColor" strokeWidth="1.35"/><path d="M8.5 5.5V8.5l2.5 1.8" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  analytics: <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M3 13.5l4-5 3.2 2.8 4-6.5" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"/><circle cx="3" cy="13.5" r="1.1" fill="currentColor"/><circle cx="7" cy="8.5" r="1.1" fill="currentColor"/><circle cx="10.2" cy="11.3" r="1.1" fill="currentColor"/><circle cx="14.2" cy="4.8" r="1.1" fill="currentColor"/></svg>,
  notes:     <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M4 3.5h6.5L14 7v7.5a.5.5 0 01-.5.5H4a.5.5 0 01-.5-.5v-11A.5.5 0 014 3.5z" stroke="currentColor" strokeWidth="1.35"/><path d="M10.5 3.5V7H14M6 9.5h5M6 12h3.5" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round"/></svg>,
  chat:      <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M3 4a1.5 1.5 0 011.5-1.5h8A1.5 1.5 0 0114 4v6.5a1.5 1.5 0 01-1.5 1.5H6L3 14V4z" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round"/><path d="M6 7h5M6 9.5h3.5" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round"/></svg>,
  fyp:       <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M8.5 2l2 4 4.5.6-3.2 3.2.8 4.5L8.5 12 4.4 14.3l.8-4.5L2 6.6l4.5-.6L8.5 2z" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round"/></svg>,
  resume:    <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><rect x="3.5" y="2" width="10" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.35"/><circle cx="8.5" cy="6.5" r="1.8" stroke="currentColor" strokeWidth="1.35"/><path d="M5.5 11.5c0-1.6 1.3-2.8 3-2.8s3 1.2 3 2.8" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round"/></svg>,
  logout:    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M10 3h2.5A1.5 1.5 0 0114 4.5v6A1.5 1.5 0 0112.5 12H10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M6.5 5L3 7.5 6.5 10M3 7.5H10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  menu:      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 6.5h12M4 10h12M4 13.5h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  close:     <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  sun:       <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="3" stroke="currentColor" strokeWidth="1.2"/><path d="M7.5 1v2M7.5 12v2M1 7.5h2M12 7.5h2M2.9 2.9l1.4 1.4M10.7 10.7l1.4 1.4M10.7 4.3l1.4-1.4M2.9 12.1l1.4-1.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  moon:      <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M12.5 9.5A5.5 5.5 0 015.5 2.5a5.5 5.5 0 000 10 5.5 5.5 0 007-3z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>,
};

const NAV = [
  { path:"/dashboard",     label:"Dashboard",    icon:Ico.dashboard },
  { path:"/subjects",      label:"Subjects",     icon:Ico.subjects  },
  { path:"/generate-note", label:"Generate Note",icon:Ico.note      },
  { path:"/generate-quiz", label:"Generate Quiz",icon:Ico.quiz      },
  { path:"/my-quizzes",    label:"History",      icon:Ico.history   },
  { path:"/analytics",     label:"Analytics",    icon:Ico.analytics },
  { path:"/notes",         label:"My Notes",     icon:Ico.notes     },
];
const TOOLS = [
  { path:"/chat",           label:"AI Tutor",  icon:Ico.chat,   color:"var(--sapphire)" },
  { path:"/fyp-guide",      label:"FYP Guide", icon:Ico.fyp,    color:"var(--lavender)" },
  { path:"/resume-builder", label:"Resume",    icon:Ico.resume, color:"var(--ruby)"     },
];
const BOTTOM = [
  { path:"/dashboard",     label:"Home",    icon:Ico.dashboard },
  { path:"/generate-quiz", label:"Quiz",    icon:Ico.quiz      },
  { path:"/chat",          label:"Tutor",   icon:Ico.chat      },
  { path:"/analytics",     label:"Stats",   icon:Ico.analytics },
  { path:"/my-quizzes",    label:"History", icon:Ico.history   },
];

function useTheme() {
  const [dark, setDark] = useState(() => {
    const s = localStorage.getItem("eg_theme");
    return s ? s === "dark" : !window.matchMedia("(prefers-color-scheme: light)").matches;
  });
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("eg_theme", dark ? "dark" : "light");
  }, [dark]);
  return [dark, setDark];
}

function useStreak() {
  const [streak, setStreak] = useState(0);
  useEffect(() => { const s = parseInt(localStorage.getItem("eg_streak") || "0", 10); setStreak(isNaN(s) ? 0 : s); }, []);
  return streak;
}

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open,  setOpen]  = useState(false);
  const [dark,  setDark]  = useTheme();
  const streak = useStreak();
  const logout = () => { localStorage.removeItem("token"); navigate("/login"); };
  const isActive = p => location.pathname === p;
  const go = path => { navigate(path); setOpen(false); };

  const LogoMark = ({ size = 28 }) => (
    <div style={{ width:size, height:size, borderRadius:Math.round(size * 0.26), background:"var(--gold)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <svg width={size * 0.46} height={size * 0.46} viewBox="0 0 14 14" fill="none">
        <path d="M2 2h5v5H2V2z" fill="#0a0806" opacity=".9"/>
        <path d="M7 7h5v5H7V7z" fill="#0a0806" opacity=".9"/>
        <circle cx="9.5" cy="4" r="2.2" stroke="#0a0806" strokeWidth="1.3" opacity=".9"/>
        <circle cx="4" cy="10" r="2.2" stroke="#0a0806" strokeWidth="1.3" opacity=".9"/>
      </svg>
    </div>
  );

  const NavBtn = ({ path, label, icon, color }) => {
    const active = isActive(path);
    const ac = color || "var(--gold)";
    return (
      <button onClick={() => go(path)} title={label} style={{
        display:"flex", alignItems:"center", gap:10, width:"100%",
        padding:"8px 12px", borderRadius:8, border:"none", cursor:"pointer",
        background: active ? `color-mix(in srgb, ${ac} 13%, transparent)` : "transparent",
        color: active ? ac : "var(--ink-3)",
        fontFamily:"var(--font-body)", fontSize:".845rem", fontWeight: active ? 600 : 400,
        transition:"all .15s", WebkitTapHighlightColor:"transparent", textAlign:"left",
      }}
        onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,.04)"; e.currentTarget.style.color = "var(--ink-2)"; }}}
        onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--ink-3)"; }}}
      >
        <span style={{ flexShrink:0, opacity: active ? 1 : .6, display:"flex" }}>{icon}</span>
        <span style={{ flex:1 }}>{label}</span>
        {active && <span style={{ width:5, height:5, borderRadius:"50%", background:ac, flexShrink:0 }}/>}
      </button>
    );
  };

  const SidebarInner = () => (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", padding:"18px 10px" }}>
      {/* Logo */}
      <div onClick={() => go("/dashboard")} style={{ display:"flex", alignItems:"center", gap:9, padding:"4px 10px", marginBottom:22, cursor:"pointer" }}>
        <LogoMark size={28}/>
        <span style={{ fontFamily:"var(--font-display)", fontStyle:"italic", fontSize:"1.08rem", color:"var(--ink)" }}>
          Edu<span style={{ color:"var(--gold)" }}>Genie</span>
        </span>
      </div>

      {/* Streak */}
      {streak > 0 && (
        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", borderRadius:9, background:"rgba(212,146,42,.07)", border:"1px solid var(--gold-border)", marginBottom:14 }}>
          <span className="streak-flame" style={{ fontSize:".95rem" }}>🔥</span>
          <div>
            <div style={{ fontSize:".72rem", color:"var(--gold)", fontWeight:700 }}>{streak} day streak</div>
            <div style={{ fontSize:".62rem", color:"var(--ink-4)" }}>Keep it up!</div>
          </div>
        </div>
      )}

      {/* Nav */}
      <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
        {NAV.map(i => <NavBtn key={i.path} {...i}/>)}
      </div>

      {/* Tools divider */}
      <div style={{ margin:"14px 10px", borderTop:"1px solid var(--border)" }}/>
      <div style={{ fontSize:".6rem", color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:".12em", fontWeight:800, padding:"0 12px", marginBottom:6 }}>Tools</div>
      <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
        {TOOLS.map(i => <NavBtn key={i.path} {...i}/>)}
      </div>

      <div style={{ flex:1 }}/>

      {/* Theme toggle */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 12px", marginBottom:6 }}>
        <div style={{ display:"flex", alignItems:"center", gap:7, fontSize:".78rem", color:"var(--ink-3)" }}>
          <span style={{ display:"flex", opacity:.7 }}>{dark ? Ico.moon : Ico.sun}</span>
          <span>{dark ? "Dark" : "Light"}</span>
        </div>
        <div className="theme-toggle" data-on={String(!dark)} onClick={() => setDark(d => !d)}/>
      </div>

      {/* Logout */}
      <button onClick={logout} style={{
        display:"flex", alignItems:"center", gap:10, width:"100%",
        padding:"8px 12px", borderRadius:8, border:"none", cursor:"pointer",
        background:"transparent", color:"var(--ink-4)",
        fontFamily:"var(--font-body)", fontSize:".82rem", transition:"all .15s",
        WebkitTapHighlightColor:"transparent",
      }}
        onMouseEnter={e => { e.currentTarget.style.color = "var(--ruby)"; e.currentTarget.style.background = "var(--ruby-dim)"; }}
        onMouseLeave={e => { e.currentTarget.style.color = "var(--ink-4)"; e.currentTarget.style.background = "transparent"; }}>
        <span style={{ display:"flex" }}>{Ico.logout}</span> Sign out
      </button>
    </div>
  );

  return (
    <div style={{ display:"flex", minHeight:"100vh" }}>
      {/* Desktop sidebar */}
      <aside className="sidebar-desktop" style={{
        width:"var(--sidebar-w)", flexShrink:0, position:"fixed",
        top:0, left:0, bottom:0, zIndex:50,
        background:"var(--bg-2)", borderRight:"1px solid var(--border)", overflowY:"auto",
      }}>
        <SidebarInner/>
      </aside>

      {/* Mobile top bar */}
      <div className="mobile-topbar" style={{
        display:"none", position:"fixed", top:0, left:0, right:0, zIndex:100,
        background:"rgba(11,11,15,.96)", backdropFilter:"blur(20px)",
        borderBottom:"1px solid var(--border)",
        height:"var(--topbar-h)", padding:"0 16px",
        alignItems:"center", justifyContent:"space-between",
      }}>
        <div onClick={() => go("/dashboard")} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
          <LogoMark size={26}/>
          <span style={{ fontFamily:"var(--font-display)", fontStyle:"italic", fontSize:"1rem", color:"var(--ink)" }}>
            Edu<span style={{ color:"var(--gold)" }}>Genie</span>
          </span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {streak > 0 && <span style={{ fontSize:".78rem", color:"var(--gold)", fontWeight:700 }}>🔥{streak}</span>}
          <div className="theme-toggle" data-on={String(!dark)} onClick={() => setDark(d => !d)} style={{ display:"block" }}/>
          <button onClick={() => setOpen(o => !o)} style={{ background:"transparent", border:"none", cursor:"pointer", color:"var(--ink-2)", padding:4, display:"flex", WebkitTapHighlightColor:"transparent" }}>
            {open ? Ico.close : Ico.menu}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && <>
        <div onClick={() => setOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.6)", zIndex:98, backdropFilter:"blur(3px)" }}/>
        <div style={{ position:"fixed", top:"var(--topbar-h)", left:0, bottom:0, width:260, zIndex:99, background:"var(--bg-2)", borderRight:"1px solid var(--border)", overflowY:"auto" }}>
          <SidebarInner/>
        </div>
      </>}

      {/* Bottom nav */}
      <nav className="bottom-nav-bar" style={{
        display:"none", position:"fixed", bottom:0, left:0, right:0, zIndex:100,
        background:"rgba(11,11,15,.97)", backdropFilter:"blur(20px)",
        borderTop:"1px solid var(--border)",
        height:"var(--bottomnav-h)", padding:"0 4px",
        alignItems:"center", justifyContent:"space-around",
      }}>
        {BOTTOM.map(item => {
          const active = isActive(item.path);
          return (
            <button key={item.path} onClick={() => go(item.path)} style={{
              display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
              gap:3, flex:1, padding:"6px 0", border:"none", background:"transparent",
              cursor:"pointer", color: active ? "var(--gold)" : "var(--ink-4)",
              transition:"color .15s", WebkitTapHighlightColor:"transparent",
            }}>
              <span style={{ display:"flex", opacity: active ? 1 : .5 }}>{item.icon}</span>
              <span style={{ fontSize:".58rem", fontWeight: active ? 700 : 400 }}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Main */}
      <main className="main-content" style={{ flex:1, marginLeft:"var(--sidebar-w)", minHeight:"100vh", position:"relative", zIndex:1 }}>
        <div className="page-container has-bottom-nav" style={{ maxWidth:1120, margin:"0 auto", padding:"36px 32px 72px" }}>
          {children}
        </div>
      </main>

      <style>{`
        @media(max-width:860px){
          .sidebar-desktop{display:none!important;}
          .mobile-topbar{display:flex!important;}
          .bottom-nav-bar{display:flex!important;}
          .main-content{margin-left:0!important;padding-top:var(--topbar-h);}
        }
        [data-theme="light"] .mobile-topbar{background:rgba(241,239,233,.97);}
        [data-theme="light"] .bottom-nav-bar{background:rgba(255,255,255,.97);}
      `}</style>
    </div>
  );
}