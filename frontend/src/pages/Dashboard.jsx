import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getDashboardStats, getPersonalDashboard } from "../services/api";
import { SkeletonStats } from "../components/SkeletonCard";

const CARDS = [
  { path:"/subjects",       label:"My Subjects",    desc:"Track syllabus coverage",       accent:"var(--gold)",     badge:"STUDY"  },
  { path:"/generate-note",  label:"Generate Note",  desc:"AI-written exam notes",         accent:"var(--sapphire)", badge:"AI"     },
  { path:"/generate-quiz",  label:"Generate Quiz",  desc:"Adaptive MCQs with timer",      accent:"var(--lavender)", badge:"AI"     },
  { path:"/my-quizzes",     label:"Quiz History",   desc:"Review & retry past quizzes",   accent:"var(--jade)",     badge:null     },
  { path:"/analytics",      label:"Analytics",      desc:"Performance insights & trends", accent:"var(--ruby)",     badge:null     },
  { path:"/chat",           label:"AI Tutor",       desc:"Ask anything about MCA",        accent:"var(--sapphire)", badge:"AI"     },
  { path:"/fyp-guide",      label:"FYP Guide",      desc:"Final year project roadmap",    accent:"var(--lavender)", badge:"TOOLS"  },
  { path:"/resume-builder", label:"Resume Builder", desc:"ATS-optimized LaTeX resume",    accent:"var(--ruby)",     badge:"TOOLS"  },
  { path:"/notes",          label:"My Notes",       desc:"Browse all generated notes",    accent:"var(--gold)",     badge:null     },
];

function ScorePill({ pct }) {
  const c  = pct >= 80 ? "var(--jade)"  : pct >= 50 ? "var(--gold)"  : "var(--ruby)";
  const bg = pct >= 80 ? "var(--jade-dim)" : pct >= 50 ? "var(--gold-dim)" : "var(--ruby-dim)";
  return (
    <span style={{ padding:"2px 9px", borderRadius:99, fontSize:".73rem", fontWeight:700, background:bg, color:c }}>
      {pct}%
    </span>
  );
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

  return (
    <div>
      <style>{`
        .dash-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
        .dash-layout{display:grid;grid-template-columns:1fr 290px;gap:20px;align-items:start;}
        .stats-row{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:10px;}
        @media(max-width:1060px){.dash-cards{grid-template-columns:repeat(2,1fr);}}
        @media(max-width:860px){.dash-layout{grid-template-columns:1fr;}.stats-row{grid-template-columns:1fr 1fr;}}
        @media(max-width:540px){.dash-cards{grid-template-columns:1fr 1fr;}.stats-row{grid-template-columns:1fr 1fr;}}
        @media(max-width:380px){.dash-cards{grid-template-columns:1fr;}}
      `}</style>

      {/* Header */}
      <div className="fade-up" style={{ marginBottom:28 }}>
        <p style={{ fontSize:".7rem", color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:".1em", fontWeight:600, marginBottom:5 }}>{greeting()}</p>
        <h1 style={{ fontFamily:"var(--font-display)", fontStyle:"italic", fontSize:"clamp(1.8rem,5vw,2.8rem)", lineHeight:1.1, color:"var(--ink)", fontWeight:400, marginBottom:8 }}>
          {personal?.name?.split(" ")[0] || "Scholar"}.
        </h1>
        <p style={{ color:"var(--ink-3)", fontSize:".875rem", maxWidth:380, lineHeight:1.7 }}>
          Ready to pick up where you stopped?
        </p>
      </div>

      {/* Stats */}
      <div className="fade-up stats-row" style={{ marginBottom:24 }}>
        {loading ? <SkeletonStats count={4}/> : <>
          {/* Featured */}
          <div className="glass" style={{ padding:"22px 24px", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", bottom:0, right:0, width:"55%", height:"110%", background:`radial-gradient(ellipse at bottom right,color-mix(in srgb,${avgColor} 8%,transparent) 0%,transparent 70%)`, pointerEvents:"none" }}/>
            <div style={{ fontSize:".67rem", color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:".1em", fontWeight:600, marginBottom:8 }}>Average Score</div>
            <div style={{ fontFamily:"var(--font-display)", fontStyle:"italic", fontSize:"2.8rem", color:avgColor, lineHeight:1, marginBottom:5 }}>
              {avg > 0 ? `${avg}%` : "—"}
            </div>
            <div style={{ fontSize:".77rem", color:"var(--ink-3)" }}>
              {avg >= 80 ? "Excellent" : avg >= 50 ? "Keep practicing" : avg > 0 ? "Needs work" : "No quizzes yet"}
            </div>
          </div>
          {[
            { label:"Quizzes",  value:personal?.my_quizzes,      color:"var(--lavender)" },
            { label:"Notes",    value:personal?.my_notes,        color:"var(--sapphire)" },
            { label:"Subjects", value:personal?.active_subjects, color:"var(--gold)"     },
          ].map(s => (
            <div key={s.label} className="glass" style={{ padding:"20px 18px" }}>
              <div style={{ fontSize:".67rem", color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:".1em", fontWeight:600, marginBottom:10 }}>{s.label}</div>
              <div style={{ fontFamily:"var(--font-display)", fontStyle:"italic", fontSize:"2rem", color:s.color, lineHeight:1 }}>
                {s.value ?? "—"}
              </div>
            </div>
          ))}
        </>}
      </div>

      {/* Cards + Activity */}
      <div className="dash-layout" style={{ marginBottom:20 }}>
        <div>
          <p style={{ fontSize:".67rem", color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:".1em", fontWeight:600, marginBottom:12 }}>Quick Access</p>
          <div className="dash-cards">
            {CARDS.map((card) => (
              <div key={card.path} onClick={() => navigate(card.path)} style={{
                padding:"16px 15px", borderRadius:11,
                background:"var(--bg-2)", border:"1px solid var(--border)",
                cursor:"pointer", transition:"border-color .18s,transform .18s,box-shadow .18s",
                position:"relative", overflow:"hidden",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=`color-mix(in srgb,${card.accent} 40%,transparent)`; e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 28px rgba(0,0,0,.3)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}>
                <div style={{ position:"absolute", top:0, left:0, right:0, height:1.5, background:`linear-gradient(90deg,${card.accent},transparent)`, opacity:.5 }}/>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                  <div style={{ fontWeight:600, fontSize:".84rem", color:"var(--ink)", lineHeight:1.3 }}>{card.label}</div>
                  {card.badge && <span style={{ fontSize:".57rem", fontWeight:700, letterSpacing:".07em", color:card.accent, background:`color-mix(in srgb,${card.accent} 12%,transparent)`, padding:"2px 5px", borderRadius:4 }}>{card.badge}</span>}
                </div>
                <div style={{ color:"var(--ink-3)", fontSize:".76rem", lineHeight:1.45 }}>{card.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity panel */}
        <div>
          <p style={{ fontSize:".67rem", color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:".1em", fontWeight:600, marginBottom:12 }}>Recent Activity</p>
          <div className="glass" style={{ padding:"16px" }}>
            {loading && <div style={{ padding:"32px 0", textAlign:"center" }}><div className="loader" style={{ width:20, height:20 }}/></div>}
            {!loading && !personal?.recent_activity?.length && (
              <div style={{ textAlign:"center", padding:"28px 12px" }}>
                <div style={{ width:44,height:44,borderRadius:"50%",border:"1.5px dashed var(--border-med)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px" }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="var(--ink-4)" strokeWidth="1.3"/><path d="M8 5v3l2 1.5" stroke="var(--ink-4)" strokeWidth="1.3" strokeLinecap="round"/></svg>
                </div>
                <p style={{ fontSize:".82rem", color:"var(--ink-3)", marginBottom:14 }}>No activity yet.</p>
                <button onClick={() => navigate("/generate-quiz")} className="btn-glow" style={{ padding:"7px 16px", fontSize:".78rem" }}>Take a Quiz</button>
              </div>
            )}
            <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
              {personal?.recent_activity?.map((a, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 11px", borderRadius:8, background:"var(--bg-3)", border:"1px solid var(--border)" }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:".8rem", fontWeight:600, color:"var(--ink)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.subject}</div>
                    <div style={{ fontSize:".68rem", color:"var(--ink-4)", marginTop:1 }}>{a.date}</div>
                  </div>
                  <ScorePill pct={a.pct}/>
                </div>
              ))}
            </div>
            {personal?.recent_activity?.length > 0 && (
              <button onClick={() => navigate("/analytics")} style={{
                marginTop:12, width:"100%", padding:8, borderRadius:8,
                border:"1px solid var(--border)", background:"transparent",
                color:"var(--ink-4)", fontFamily:"var(--font-body)", fontSize:".77rem", cursor:"pointer", transition:"all .15s",
              }}
                onMouseEnter={e=>{e.currentTarget.style.color="var(--gold)";e.currentTarget.style.borderColor="var(--gold-border)";}}
                onMouseLeave={e=>{e.currentTarget.style.color="var(--ink-4)";e.currentTarget.style.borderColor="var(--border)";}}>
                Full analytics →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Platform stats footer */}
      <div style={{ padding:"14px 20px", borderRadius:10, border:"1px solid var(--border)", display:"flex", gap:24, alignItems:"center", flexWrap:"wrap" }}>
        <span style={{ fontSize:".64rem", color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:".1em", fontWeight:700, flexShrink:0 }}>Platform</span>
        {[
          { label:"subjects", v:global?.total_subjects },
          { label:"notes",    v:global?.total_notes    },
          { label:"quizzes",  v:global?.total_quizzes  },
          { label:"learners", v:global?.total_users    },
        ].map(s => (
          <div key={s.label} style={{ display:"flex", alignItems:"baseline", gap:5 }}>
            <span style={{ fontFamily:"var(--font-display)", fontStyle:"italic", fontSize:"1.2rem", color:"var(--ink-2)" }}>{loading ? "—" : (s.v ?? "—")}</span>
            <span style={{ color:"var(--ink-4)", fontSize:".77rem" }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}