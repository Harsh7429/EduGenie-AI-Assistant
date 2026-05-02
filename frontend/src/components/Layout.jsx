import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const I = {
  dash:    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="1.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><rect x="1.5" y="9" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="9" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/></svg>,
  subs:    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2.5 3.5A1 1 0 013.5 2.5h9a1 1 0 011 1v9a1 1 0 01-1 1h-9a1 1 0 01-1-1v-9z" stroke="currentColor" strokeWidth="1.3"/><path d="M5 5.5h6M5 8h6M5 10.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  note:    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M9.5 2H4.5A1.5 1.5 0 003 3.5v9A1.5 1.5 0 004.5 14h7A1.5 1.5 0 0013 12.5V6L9.5 2z" stroke="currentColor" strokeWidth="1.3"/><path d="M9.5 2V6H13M6 9h4M6 11h2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  quiz:    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3"/><path d="M8 11v-2c1.3-.3 2.2-1.1 2.2-2.1C10.2 5.8 9.2 5.2 8 5.2S5.8 5.8 5.8 6.9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="8" cy="12.5" r=".65" fill="currentColor"/></svg>,
  hist:    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3"/><path d="M8 5v3l2.5 1.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  ana:     <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2.5 13l4-5 3 2.5 4.5-7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  mynotes: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3.5 3h7l3 3v7a.5.5 0 01-.5.5h-10a.5.5 0 01-.5-.5V3.5a.5.5 0 01.5-.5z" stroke="currentColor" strokeWidth="1.3"/><path d="M10.5 3v3h3M5.5 9h5M5.5 11h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  chat:    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2.5 3.5A1.5 1.5 0 014 2h8a1.5 1.5 0 011.5 1.5v6A1.5 1.5 0 0112 11H5.5L2.5 13.5V3.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  fyp:     <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5l2 4L14.5 6l-3.2 3.2.8 4.5L8 11.5 4.2 13.7l.8-4.5L1.5 6l4.5-.5L8 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  resume:  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="1.5" width="10" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="8" cy="6" r="1.8" stroke="currentColor" strokeWidth="1.3"/><path d="M5 11c0-1.7 1.3-2.8 3-2.8s3 1.1 3 2.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  logout:  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5h2A1.5 1.5 0 0113 4v6a1.5 1.5 0 01-1.5 1.5h-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M6 4.5L2.5 7 6 9.5M2.5 7H9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  menu:    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 5.5h12M3 9h12M3 12.5h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  close:   <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  sun:     <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="2.8" stroke="currentColor" strokeWidth="1.2"/><path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.7 2.7l1 1M10.3 10.3l1 1M10.3 3.7l1-1M2.7 11.3l1-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  moon:    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M11.5 9A5 5 0 014.5 2a5 5 0 000 10 5 5 0 007-3z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>,
};

const NAV = [
  { path:"/dashboard",     label:"Dashboard",    icon:I.dash    },
  { path:"/subjects",      label:"Subjects",     icon:I.subs    },
  { path:"/generate-note", label:"Generate Note",icon:I.note    },
  { path:"/generate-quiz", label:"Generate Quiz",icon:I.quiz    },
  { path:"/my-quizzes",    label:"History",      icon:I.hist    },
  { path:"/analytics",     label:"Analytics",    icon:I.ana     },
  { path:"/notes",         label:"My Notes",     icon:I.mynotes },
];
const TOOLS = [
  { path:"/chat",           label:"AI Tutor",  icon:I.chat,   color:"var(--blue)"   },
  { path:"/fyp-guide",      label:"FYP Guide", icon:I.fyp,    color:"var(--purple)" },
  { path:"/resume-builder", label:"Resume",    icon:I.resume, color:"var(--coral)"  },
];
const BOTTOM = [
  { path:"/dashboard",     label:"Home",    icon:I.dash  },
  { path:"/generate-quiz", label:"Quiz",    icon:I.quiz  },
  { path:"/chat",          label:"Tutor",   icon:I.chat  },
  { path:"/analytics",     label:"Stats",   icon:I.ana   },
  { path:"/my-quizzes",    label:"History", icon:I.hist  },
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
  const [s, setS] = useState(0);
  useEffect(() => { const v = parseInt(localStorage.getItem("eg_streak")||"0",10); setS(isNaN(v)?0:v); }, []);
  return s;
}

function LogoMark({ size=28 }) {
  return (
    <div style={{ width:size, height:size, borderRadius:Math.round(size*.27), background:"var(--amber)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <svg width={size*.46} height={size*.46} viewBox="0 0 13 13" fill="none">
        <path d="M2 2h4.5v4.5H2V2z" fill="#0a0806" opacity=".9"/>
        <path d="M6.5 6.5H11V11H6.5V6.5z" fill="#0a0806" opacity=".9"/>
        <circle cx="9" cy="3.5" r="2" stroke="#0a0806" strokeWidth="1.3" opacity=".9"/>
        <circle cx="3.5" cy="9.5" r="2" stroke="#0a0806" strokeWidth="1.3" opacity=".9"/>
      </svg>
    </div>
  );
}

export default function Layout({ children }) {
  const navigate = useNavigate();
  const loc      = useLocation();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useTheme();
  const streak = useStreak();
  const logout = () => { localStorage.removeItem("token"); navigate("/login"); };
  const active = p => loc.pathname === p;
  const go = p => { navigate(p); setOpen(false); };

  const NavBtn = ({ path, label, icon, color }) => {
    const ac = color || "var(--amber)";
    const on = active(path);
    return (
      <button onClick={() => go(path)} title={label} style={{
        display:"flex", alignItems:"center", gap:9, width:"100%",
        padding:"8px 11px", borderRadius:"var(--r-md)", border:"none", cursor:"pointer",
        background: on ? `color-mix(in srgb, ${ac} 12%, transparent)` : "transparent",
        color: on ? ac : "var(--ink-3)",
        fontFamily:"var(--font-body)", fontSize:13, fontWeight: on ? 500 : 400,
        transition:"all .13s", WebkitTapHighlightColor:"transparent", textAlign:"left",
      }}
        onMouseEnter={e => { if (!on) { e.currentTarget.style.background="rgba(255,255,255,.04)"; e.currentTarget.style.color="var(--ink-2)"; }}}
        onMouseLeave={e => { if (!on) { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="var(--ink-3)"; }}}
      >
        <span style={{ flexShrink:0, opacity:on?1:.55, display:"flex" }}>{icon}</span>
        <span style={{ flex:1 }}>{label}</span>
        {on && <span style={{ width:4, height:4, borderRadius:"50%", background:ac, flexShrink:0 }}/>}
      </button>
    );
  };

  const SidebarInner = () => (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", padding:"16px 9px" }}>
      <div onClick={() => go("/dashboard")} style={{ display:"flex", alignItems:"center", gap:9, padding:"4px 9px", marginBottom:20, cursor:"pointer" }}>
        <LogoMark size={27}/>
        <span style={{ fontSize:14, fontWeight:500, color:"var(--ink)", letterSpacing:"-.01em" }}>
          Edu<span style={{ color:"var(--amber)" }}>Genie</span>
        </span>
      </div>

      {streak > 0 && (
        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 11px", borderRadius:"var(--r-md)", background:"rgba(239,159,39,.07)", border:"0.5px solid var(--amber-border)", marginBottom:12 }}>
          <span className="streak-flame" style={{ fontSize:14 }}>🔥</span>
          <div><div style={{ fontSize:11, color:"var(--amber)", fontWeight:500 }}>{streak} day streak</div><div style={{ fontSize:10, color:"var(--ink-4)" }}>Keep it up!</div></div>
        </div>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
        {NAV.map(n => <NavBtn key={n.path} {...n}/>)}
      </div>

      <div style={{ margin:"12px 9px", borderTop:"0.5px solid var(--border)" }}/>
      <div style={{ fontSize:10, color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:".1em", fontWeight:500, padding:"0 11px", marginBottom:5 }}>Tools</div>
      <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
        {TOOLS.map(n => <NavBtn key={n.path} {...n}/>)}
      </div>

      <div style={{ flex:1 }}/>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"7px 11px", marginBottom:5 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"var(--ink-3)" }}>
          <span style={{ display:"flex", opacity:.6 }}>{dark ? I.moon : I.sun}</span>
          <span>{dark ? "Dark" : "Light"}</span>
        </div>
        <div className="theme-toggle" data-on={String(!dark)} onClick={() => setDark(d => !d)}/>
      </div>

      <button onClick={logout} style={{
        display:"flex", alignItems:"center", gap:9, width:"100%",
        padding:"8px 11px", borderRadius:"var(--r-md)", border:"none", cursor:"pointer",
        background:"transparent", color:"var(--ink-4)",
        fontFamily:"var(--font-body)", fontSize:13, transition:"all .13s",
        WebkitTapHighlightColor:"transparent",
      }}
        onMouseEnter={e => { e.currentTarget.style.color="var(--coral)"; e.currentTarget.style.background="var(--coral-dim)"; }}
        onMouseLeave={e => { e.currentTarget.style.color="var(--ink-4)"; e.currentTarget.style.background="transparent"; }}>
        <span style={{ display:"flex" }}>{I.logout}</span> Sign out
      </button>
    </div>
  );

  return (
    <div style={{ display:"flex", minHeight:"100vh" }}>
      <aside className="sidebar-desktop" style={{ width:"var(--sidebar-w)", flexShrink:0, position:"fixed", top:0, left:0, bottom:0, zIndex:50, background:"var(--bg-2)", borderRight:"0.5px solid var(--border)", overflowY:"auto" }}>
        <SidebarInner/>
      </aside>

      <div className="mobile-topbar" style={{ display:"none", position:"fixed", top:0, left:0, right:0, zIndex:100, background:"rgba(13,13,18,.96)", backdropFilter:"blur(20px)", borderBottom:"0.5px solid var(--border)", height:"var(--topbar-h)", padding:"0 14px", alignItems:"center", justifyContent:"space-between" }}>
        <div onClick={() => go("/dashboard")} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
          <LogoMark size={24}/>
          <span style={{ fontSize:13, fontWeight:500, color:"var(--ink)" }}>Edu<span style={{ color:"var(--amber)" }}>Genie</span></span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          {streak > 0 && <span style={{ fontSize:12, color:"var(--amber)", fontWeight:500 }}>🔥{streak}</span>}
          <div className="theme-toggle" data-on={String(!dark)} onClick={() => setDark(d => !d)} style={{ display:"block" }}/>
          <button onClick={() => setOpen(o => !o)} style={{ background:"transparent", border:"none", cursor:"pointer", color:"var(--ink-2)", padding:3, display:"flex", WebkitTapHighlightColor:"transparent" }}>
            {open ? I.close : I.menu}
          </button>
        </div>
      </div>

      {open && <>
        <div onClick={() => setOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.6)", zIndex:98, backdropFilter:"blur(3px)" }}/>
        <div style={{ position:"fixed", top:"var(--topbar-h)", left:0, bottom:0, width:250, zIndex:99, background:"var(--bg-2)", borderRight:"0.5px solid var(--border)", overflowY:"auto" }}>
          <SidebarInner/>
        </div>
      </>}

      <nav className="bottom-nav-bar" style={{ display:"none", position:"fixed", bottom:0, left:0, right:0, zIndex:100, background:"rgba(13,13,18,.97)", backdropFilter:"blur(20px)", borderTop:"0.5px solid var(--border)", height:"var(--bottomnav-h)", padding:"0 2px", alignItems:"center", justifyContent:"space-around" }}>
        {BOTTOM.map(item => {
          const on = active(item.path);
          return (
            <button key={item.path} onClick={() => go(item.path)} style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:3, flex:1, padding:"6px 0", border:"none", background:"transparent", cursor:"pointer", color:on?"var(--amber)":"var(--ink-4)", transition:"color .13s", WebkitTapHighlightColor:"transparent" }}>
              <span style={{ display:"flex", opacity:on?1:.45 }}>{item.icon}</span>
              <span style={{ fontSize:10, fontWeight:on?500:400 }}>{item.label}</span>
              {on && <div style={{ width:16, height:"1.5px", borderRadius:99, background:"var(--amber)", marginTop:1 }}/>}
            </button>
          );
        })}
      </nav>

      <main className="main-content" style={{ flex:1, marginLeft:"var(--sidebar-w)", minHeight:"100vh", zIndex:1 }}>
        <div className="page-container has-bottom-nav" style={{ maxWidth:1100, margin:"0 auto", padding:"32px 28px 68px" }}>
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
        [data-theme="light"] .mobile-topbar{background:rgba(244,242,237,.97);}
        [data-theme="light"] .bottom-nav-bar{background:rgba(255,255,255,.97);}
      `}</style>
    </div>
  );
}