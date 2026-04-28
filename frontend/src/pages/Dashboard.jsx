import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getDashboardStats, getPersonalDashboard } from "../services/api";

/* Per-card icon SVGs — inline, no external deps */
const Icons = {
  subjects:  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5a2 2 0 012-2h10a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" stroke="currentColor" strokeWidth="1.5"/><path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  note:      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12 2.5H6a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V8l-4-5.5z" stroke="currentColor" strokeWidth="1.5"/><path d="M12 2.5V8H18M7 11h6M7 14h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  quiz:      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/><path d="M10 14v-2.5c1.7-.4 3-1.5 3-3C13 6.8 11.7 6 10 6S7 6.8 7 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="10" cy="15.5" r=".9" fill="currentColor"/></svg>,
  history:   <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/><path d="M10 6v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  analytics: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 16l5-6 4 3.5 5-8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  mynotes:   <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 4h9l4 4v9a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5"/><path d="M13 4v4h4M6 11h8M6 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  chat:      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7l-4 3V5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M7 9h6M7 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  fyp:       <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2l2.5 5 5.5.7-4 3.9 1 5.4L10 14.5l-5 2.5 1-5.4-4-3.9 5.5-.7L10 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  resume:    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="4" y="2" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/><circle cx="10" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/><path d="M6.5 14c0-2 1.6-3.5 3.5-3.5s3.5 1.5 3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
};

const CARDS = [
  { path:"/subjects",       label:"My Subjects",    desc:"Track syllabus coverage",       color:"#d4922a", bg:"rgba(212,146,42,.12)",  icon:"subjects",  badge:"STUDY"  },
  { path:"/generate-note",  label:"Generate Note",  desc:"AI-written exam notes",         color:"#5b82e8", bg:"rgba(91,130,232,.12)",  icon:"note",      badge:"AI"     },
  { path:"/generate-quiz",  label:"Generate Quiz",  desc:"Adaptive MCQs with timer",      color:"#9580e8", bg:"rgba(149,128,232,.12)", icon:"quiz",      badge:"AI"     },
  { path:"/my-quizzes",     label:"Quiz History",   desc:"Review & retry past quizzes",   color:"#3db88a", bg:"rgba(61,184,138,.12)",  icon:"history",   badge:null     },
  { path:"/analytics",      label:"Analytics",      desc:"Performance insights & trends", color:"#e05c5c", bg:"rgba(224,92,92,.12)",   icon:"analytics", badge:null     },
  { path:"/chat",           label:"AI Tutor",       desc:"Ask anything about MCA",        color:"#5b82e8", bg:"rgba(91,130,232,.12)",  icon:"chat",      badge:"AI"     },
  { path:"/fyp-guide",      label:"FYP Guide",      desc:"Final year project roadmap",    color:"#9580e8", bg:"rgba(149,128,232,.12)", icon:"fyp",       badge:"TOOLS"  },
  { path:"/resume-builder", label:"Resume Builder", desc:"ATS-optimized LaTeX resume",    color:"#e05c5c", bg:"rgba(224,92,92,.12)",   icon:"resume",    badge:"TOOLS"  },
  { path:"/notes",          label:"My Notes",       desc:"Browse all generated notes",    color:"#d4922a", bg:"rgba(212,146,42,.12)",  icon:"mynotes",   badge:null     },
];

/* Circular score ring */
function ScoreRing({ pct, size = 88 }) {
  const radius = (size - 12) / 2;
  const circ   = 2 * Math.PI * radius;
  const dash   = circ * (pct / 100);
  const color  = pct >= 80 ? "#3db88a" : pct >= 50 ? "#d4922a" : "#e05c5c";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform:"rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--bg-4)" strokeWidth="5"/>
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth="5"
        strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
        style={{ transition:"stroke-dasharray 1.2s cubic-bezier(0.16,1,0.3,1)" }}/>
    </svg>
  );
}

function ScorePill({ pct }) {
  const c  = pct >= 80 ? "var(--jade)"  : pct >= 50 ? "var(--gold)"  : "var(--ruby)";
  const bg = pct >= 80 ? "var(--jade-dim)" : pct >= 50 ? "var(--gold-dim)" : "var(--ruby-dim)";
  return <span style={{ padding:"2px 9px", borderRadius:99, fontSize:".73rem", fontWeight:700, background:bg, color:c }}>{pct}%</span>;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [global,   setGlobal]   = useState(null);
  const [personal, setPersonal] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([getDashboardStats(), getPersonalDashboard()])
      .then(([g, p]) => { setGlobal(g.data); setPersonal(p.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  };

  const avg = personal?.avg_score ?? 0;
  const avgColor = avg >= 80 ? "var(--jade)" : avg >= 50 ? "var(--gold)" : "var(--ruby)";
  const avgLabel = avg >= 80 ? "Excellent" : avg >= 50 ? "Keep practicing" : avg > 0 ? "Needs work" : "No quizzes yet";

  return (
    <div>
      <style>{`
        .dash-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}
        .dash-layout{display:grid;grid-template-columns:1fr 300px;gap:22px;align-items:start;}
        .stats-strip{display:grid;grid-template-columns:auto 1fr 1fr 1fr;gap:14px;}
        @media(max-width:1060px){.dash-cards{grid-template-columns:1fr 1fr;}.stats-strip{grid-template-columns:auto 1fr 1fr;}}
        @media(max-width:860px){.dash-layout{grid-template-columns:1fr;}.stats-strip{grid-template-columns:auto 1fr 1fr;}}
        @media(max-width:560px){.dash-cards{grid-template-columns:1fr 1fr;}.stats-strip{grid-template-columns:1fr 1fr;}}
        @media(max-width:380px){.dash-cards{grid-template-columns:1fr;}}
      `}</style>

      {/* Header */}
      <div className="fade-up" style={{ marginBottom:28 }}>
        <p style={{ fontSize:".68rem", color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:".12em", fontWeight:700, marginBottom:5 }}>{greeting()}</p>
        <h1 style={{ fontFamily:"var(--font-display)", fontStyle:"italic", fontSize:"clamp(2rem,5vw,3rem)", lineHeight:1.05, color:"var(--ink)", fontWeight:400, marginBottom:8 }}>
          {personal?.name?.split(" ")[0] || "Scholar"}.
        </h1>
        <p style={{ color:"var(--ink-3)", fontSize:".875rem", maxWidth:360, lineHeight:1.7 }}>
          Ready to pick up where you stopped?
        </p>
      </div>

      {/* Stats strip */}
      <div className="stats-strip fade-up" style={{ marginBottom:26 }}>
        {/* Score ring card */}
        <div className="glass" style={{ padding:"18px 22px", display:"flex", alignItems:"center", gap:18, minWidth:0 }}>
          <div style={{ position:"relative", flexShrink:0 }}>
            <ScoreRing pct={avg} size={80}/>
            <div style={{
              position:"absolute", inset:0, display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"center", gap:0,
            }}>
              <span style={{ fontFamily:"var(--font-display)", fontStyle:"italic", fontSize:"1.15rem", color:avgColor, lineHeight:1 }}>{avg > 0 ? `${avg}%` : "—"}</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize:".67rem", color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:".1em", fontWeight:700, marginBottom:5 }}>Average Score</div>
            <div style={{ fontSize:".83rem", color:"var(--ink-3)" }}>{avgLabel}</div>
          </div>
        </div>

        {/* 3 compact stats */}
        {[
          { label:"Quizzes Taken", value:personal?.my_quizzes, color:"#9580e8", bg:"rgba(149,128,232,.08)" },
          { label:"Notes Created", value:personal?.my_notes,   color:"#5b82e8", bg:"rgba(91,130,232,.08)"  },
          { label:"Active Subjects",value:personal?.active_subjects, color:"#d4922a", bg:"rgba(212,146,42,.08)" },
        ].map(s => (
          <div key={s.label} className="glass" style={{ padding:"18px 18px", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:s.color, opacity:.7 }}/>
            <div style={{ fontSize:".67rem", color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:".1em", fontWeight:700, marginBottom:10 }}>{s.label}</div>
            <div style={{ fontFamily:"var(--font-display)", fontStyle:"italic", fontSize:"2rem", color:s.color, lineHeight:1 }}>
              {loading ? <div className="skeleton sk-title" style={{ width:40 }}/> : (s.value ?? "—")}
            </div>
          </div>
        ))}
      </div>

      {/* Cards + Activity */}
      <div className="dash-layout" style={{ marginBottom:22 }}>

        {/* Quick Access with icons */}
        <div>
          <p style={{ fontSize:".67rem", color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:".12em", fontWeight:700, marginBottom:14 }}>Quick Access</p>
          <div className="dash-cards">
            {CARDS.map(card => (
              <div key={card.path} onClick={() => navigate(card.path)} className="glass hover-card"
                style={{ padding:"16px 15px", position:"relative", overflow:"hidden" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=`${card.color}50`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor="var(--border)"; }}>
                {/* Top accent stripe */}
                <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:card.color, opacity:.6 }}/>

                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                  {/* Icon block */}
                  <div className="icon-block" style={{ background:card.bg, color:card.color }}>
                    {Icons[card.icon]}
                  </div>
                  {card.badge && (
                    <span style={{
                      fontSize:".58rem", fontWeight:800, letterSpacing:".08em",
                      color:card.color, background:card.bg,
                      padding:"2px 7px", borderRadius:4,
                    }}>{card.badge}</span>
                  )}
                </div>

                <div style={{ fontWeight:600, fontSize:".88rem", color:"var(--ink)", marginBottom:4, lineHeight:1.3 }}>{card.label}</div>
                <div style={{ color:"var(--ink-3)", fontSize:".76rem", lineHeight:1.5 }}>{card.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <p style={{ fontSize:".67rem", color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:".12em", fontWeight:700, marginBottom:14 }}>Recent Activity</p>
          <div className="glass" style={{ padding:"16px" }}>
            {loading && <div style={{ padding:"32px 0", textAlign:"center" }}><div className="loader" style={{ width:20, height:20 }}/></div>}

            {!loading && !personal?.recent_activity?.length && (
              <div style={{ textAlign:"center", padding:"30px 12px" }}>
                <div style={{ width:48, height:48, borderRadius:"50%", border:"1.5px dashed var(--border-med)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="var(--ink-4)" strokeWidth="1.3"/><path d="M9 5.5V9l2.5 2" stroke="var(--ink-4)" strokeWidth="1.3" strokeLinecap="round"/></svg>
                </div>
                <p style={{ fontSize:".83rem", color:"var(--ink-3)", marginBottom:16 }}>No activity yet.</p>
                <button className="btn-glow" onClick={() => navigate("/generate-quiz")} style={{ padding:"7px 18px", fontSize:".8rem" }}>Take a Quiz</button>
              </div>
            )}

            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {personal?.recent_activity?.map((a, i) => (
                <div key={i} style={{
                  display:"flex", alignItems:"center", gap:10, padding:"9px 11px",
                  borderRadius:9, background:"var(--bg-3)", border:"1px solid var(--border)",
                }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:".82rem", fontWeight:600, color:"var(--ink)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.subject}</div>
                    <div style={{ fontSize:".68rem", color:"var(--ink-4)", marginTop:1 }}>{a.date}</div>
                  </div>
                  <ScorePill pct={a.pct}/>
                </div>
              ))}
            </div>

            {personal?.recent_activity?.length > 0 && (
              <button onClick={() => navigate("/analytics")} style={{
                marginTop:12, width:"100%", padding:"8px", borderRadius:8,
                border:"1px solid var(--border)", background:"transparent",
                color:"var(--ink-4)", fontFamily:"var(--font-body)", fontSize:".77rem",
                cursor:"pointer", transition:"all .15s",
              }}
                onMouseEnter={e=>{e.currentTarget.style.color="var(--gold)";e.currentTarget.style.borderColor="var(--gold-border)";}}
                onMouseLeave={e=>{e.currentTarget.style.color="var(--ink-4)";e.currentTarget.style.borderColor="var(--border)";}}>
                Full analytics →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Platform footer bar */}
      <div style={{
        padding:"14px 20px", borderRadius:11, border:"1px solid var(--border)",
        display:"flex", gap:6, alignItems:"center", flexWrap:"wrap",
      }}>
        <span style={{ fontSize:".63rem", color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:".12em", fontWeight:700, marginRight:18 }}>Platform</span>
        {[
          { label:"subjects", v:global?.total_subjects },
          { label:"notes",    v:global?.total_notes    },
          { label:"quizzes",  v:global?.total_quizzes  },
          { label:"learners", v:global?.total_users    },
        ].map((s, i) => (
          <div key={s.label} style={{ display:"flex", alignItems:"baseline", gap:5, marginRight:18 }}>
            <span style={{ fontFamily:"var(--font-display)", fontStyle:"italic", fontSize:"1.25rem", color:"var(--ink-2)" }}>
              {loading ? "—" : (s.v ?? "—")}
            </span>
            <span style={{ color:"var(--ink-4)", fontSize:".75rem" }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}