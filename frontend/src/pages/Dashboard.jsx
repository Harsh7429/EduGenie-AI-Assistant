import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getDashboardStats, getPersonalDashboard, getSubjectProgress } from "../services/api";

/* Circular score ring */
function ScoreRing({ pct, size = 80 }) {
  const r    = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (Math.min(pct, 100) / 100);
  const color = pct >= 80 ? "var(--teal)" : pct >= 50 ? "var(--amber)" : pct > 0 ? "var(--coral)" : "var(--border-med)";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform:"rotate(-90deg)", flexShrink:0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg-4)" strokeWidth="5"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5"
        strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
        style={{ transition:"stroke-dasharray 1.3s cubic-bezier(0.16,1,0.3,1)" }}/>
    </svg>
  );
}

/* Spark bars */
function SparkBars({ data = [] }) {
  const max = Math.max(...data, 1);
  const COLORS = ["rgba(127,119,221,.4)","rgba(127,119,221,.4)","rgba(127,119,221,.4)","rgba(127,119,221,.55)","rgba(127,119,221,.55)","rgba(127,119,221,.7)","rgba(127,119,221,.7)","var(--purple)","var(--purple)","var(--purple)"];
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:3, height:44 }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex:1, borderRadius:"3px 3px 0 0", background: COLORS[i] || "var(--purple)", height:`${Math.max((v/max)*100, 6)}%`, minHeight:4, transition:"height .6s" }}/>
      ))}
    </div>
  );
}

/* Score pill */
function SPill({ pct }) {
  const c  = pct >= 80 ? "var(--teal)"  : pct >= 50 ? "var(--amber)"  : "var(--coral)";
  const bg = pct >= 80 ? "var(--teal-dim)" : pct >= 50 ? "var(--amber-dim)" : "var(--coral-dim)";
  return <span style={{ padding:"2px 8px", borderRadius:99, fontSize:11, fontWeight:500, background:bg, color:c }}>{pct}%</span>;
}

const QA = [
  { path:"/generate-quiz",  label:"Generate Quiz",  desc:"AI MCQs",       color:"var(--amber)",  bg:"var(--amber-dim)",  icon:<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M7.5 10.5V9c1.1-.25 1.8-1 1.8-1.9 0-1-.8-1.6-1.8-1.6s-1.8.6-1.8 1.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="7.5" cy="12" r=".6" fill="currentColor"/></svg> },
  { path:"/generate-note",  label:"Generate Note",  desc:"Study notes",   color:"var(--purple)", bg:"var(--purple-dim)", icon:<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M9 2H4.5A1.5 1.5 0 003 3.5v8A1.5 1.5 0 004.5 13h6A1.5 1.5 0 0012 11.5V5L9 2z" stroke="currentColor" strokeWidth="1.3"/><path d="M9 2v3h3M5.5 8.5h4M5.5 10.5h2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
  { path:"/chat",           label:"AI Tutor",       desc:"Ask anything",  color:"var(--blue)",   bg:"var(--blue-dim)",   icon:<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2.5 3A1.5 1.5 0 014 1.5h7A1.5 1.5 0 0112.5 3v6A1.5 1.5 0 0111 10.5H5.5L2.5 13V3z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg> },
  { path:"/analytics",      label:"Analytics",      desc:"My progress",   color:"var(--coral)",  bg:"var(--coral-dim)",  icon:<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2.5 12l3.5-4.5 3 2.5 4-7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { path:"/my-quizzes",     label:"History",        desc:"Past quizzes",  color:"var(--teal)",   bg:"var(--teal-dim)",   icon:<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M7.5 4.5V7.5l2.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
  { path:"/notes",          label:"My Notes",       desc:"Saved notes",   color:"var(--amber)",  bg:"var(--amber-dim)",  icon:<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3.5 2.5h6l3 3v7a.5.5 0 01-.5.5h-9a.5.5 0 01-.5-.5v-10a.5.5 0 01.5-.5z" stroke="currentColor" strokeWidth="1.3"/><path d="M9.5 2.5v3h3M5 8h5M5 10h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
  { path:"/subjects",       label:"Subjects",       desc:"Track syllabus",color:"var(--purple)", bg:"var(--purple-dim)", icon:<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2.5 3.5A1 1 0 013.5 2.5h8A1 1 0 0112.5 3.5v8a1 1 0 01-1 1h-8a1 1 0 01-1-1v-8z" stroke="currentColor" strokeWidth="1.3"/><path d="M5 5.5h5M5 7.5h5M5 9.5h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
  { path:"/fyp-guide",      label:"FYP Guide",      desc:"Project roadmap",color:"var(--blue)",   bg:"var(--blue-dim)",   icon:<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1.5l2 4 4.5.6-3.2 3.2.8 4.5L7.5 11.5l-4 2.3.8-4.5L1 6.1l4.5-.6L7.5 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg> },
  { path:"/resume-builder", label:"Resume",         desc:"LaTeX builder",  color:"var(--coral)",  bg:"var(--coral-dim)",  icon:<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="3" y="1.5" width="9" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="7.5" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M4.5 10c0-1.6 1.3-2.5 3-2.5s3 .9 3 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [global,   setGlobal]   = useState(null);
  const [personal, setPersonal] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([getDashboardStats(), getPersonalDashboard(), getSubjectProgress()])
      .then(([g, p, s]) => { setGlobal(g.data); setPersonal(p.data); setSubjects(s.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const avg = personal?.avg_score ?? 0;
  const avgColor = avg >= 80 ? "var(--teal)" : avg >= 50 ? "var(--amber)" : avg > 0 ? "var(--coral)" : "var(--ink-3)";
  const avgLabel = avg >= 80 ? "Excellent" : avg >= 50 ? "Keep practicing" : avg > 0 ? "Needs work" : "No quizzes yet";

  // Build spark data from recent activity
  const sparkData = (personal?.recent_activity || []).slice(0,10).map(a => a.pct).reverse();
  while (sparkData.length < 8) sparkData.unshift(0);

  // Subject progress — top 4
  const topSubs = subjects.filter(s => s.average_score > 0).slice(0, 4);

  return (
    <div>
      <style>{`
        .bento{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;}
        .qa-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;}
        @media(max-width:1100px){.bento{grid-template-columns:repeat(3,1fr);}}
        @media(max-width:860px){.bento{grid-template-columns:repeat(2,1fr);}.qa-grid{grid-template-columns:repeat(3,1fr);}}
        @media(max-width:520px){.bento{grid-template-columns:1fr 1fr;}.qa-grid{grid-template-columns:repeat(2,1fr);}}
      `}</style>

      {/* Header */}
      <div className="fade-up" style={{ marginBottom:20 }}>
        <p style={{ fontSize:11, color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:".1em", fontWeight:500, marginBottom:4 }}>{greeting()}</p>
        <h1 style={{ fontSize:"clamp(1.7rem,4vw,2.4rem)", color:"var(--ink)", fontWeight:500, lineHeight:1.1, marginBottom:6, letterSpacing:"-.025em" }}>
          {loading ? "…" : personal?.name?.split(" ")[0] || "Scholar"}.
        </h1>
        <p style={{ color:"var(--ink-3)", fontSize:13 }}>Here's your study overview.</p>
      </div>

      {/* ─── BENTO GRID ─────────────────────────────────────── */}
      <div className="bento fade-up" style={{ marginBottom:9 }}>

        {/* [1] Score hero — 2×2 */}
        <div className="glass card-stripe stripe-amber" style={{ gridColumn:"span 2", gridRow:"span 2", padding:"18px 20px", display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
          <span className="section-label">Average Score</span>
          <div style={{ display:"flex", alignItems:"center", gap:18 }}>
            <div style={{ position:"relative", flexShrink:0 }}>
              <ScoreRing pct={avg} size={84}/>
              <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ fontSize:16, fontWeight:500, color:avgColor, letterSpacing:"-.02em" }}>{avg > 0 ? `${avg}%` : "—"}</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize:32, fontWeight:500, color:avgColor, lineHeight:1, letterSpacing:"-.03em" }}>{avg > 0 ? `${avg}%` : "—"}</div>
              <div style={{ fontSize:12, color:"var(--ink-3)", marginTop:5 }}>{avgLabel}</div>
              <span className="pill pill-amber" style={{ marginTop:10, display:"inline-block" }}>
                {avg >= 80 ? "Mastered" : avg >= 50 ? "In Progress" : avg > 0 ? "Needs Work" : "Get Started"}
              </span>
            </div>
          </div>
          {/* Sub-stats row */}
          <div style={{ display:"flex", gap:20, paddingTop:14, borderTop:"0.5px solid var(--border)" }}>
            {[
              { label:"Quizzes",  v:personal?.my_quizzes      },
              { label:"Notes",    v:personal?.my_notes        },
              { label:"🔥 Streak",v:localStorage.getItem("eg_streak") || 0 },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize:11, color:"var(--ink-4)", marginBottom:3 }}>{s.label}</div>
                <div style={{ fontSize:18, fontWeight:500, color:"var(--ink)", lineHeight:1 }}>{loading ? "—" : (s.v ?? "—")}</div>
              </div>
            ))}
          </div>
        </div>

        {/* [2] Streak */}
        <div className="glass card-stripe stripe-coral" style={{ padding:"16px 16px" }}>
          <span className="section-label">Today</span>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:24 }} className="streak-flame">🔥</span>
            <div>
              <div style={{ fontSize:24, fontWeight:500, color:"var(--coral)", lineHeight:1 }}>{localStorage.getItem("eg_streak") || 0}</div>
              <div style={{ fontSize:11, color:"var(--ink-3)", marginTop:3 }}>day streak</div>
            </div>
          </div>
        </div>

        {/* [3] Best subject */}
        <div className="glass card-stripe stripe-teal" style={{ padding:"16px 16px" }}>
          <span className="section-label">Best Subject</span>
          {subjects.length > 0 ? (() => {
            const best = [...subjects].sort((a,b) => b.average_score - a.average_score)[0];
            return (
              <>
                <div style={{ fontSize:12, fontWeight:500, color:"var(--ink)", marginBottom:6, lineHeight:1.35, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>{best.subject_name}</div>
                <div style={{ fontSize:22, fontWeight:500, color:"var(--teal)", lineHeight:1 }}>{best.average_score.toFixed(0)}%</div>
                <div className="prog-track" style={{ marginTop:7 }}><div className="prog-fill" style={{ width:`${best.average_score}%`, background:"var(--teal)" }}/></div>
              </>
            );
          })() : <div style={{ fontSize:12, color:"var(--ink-3)" }}>Take quizzes to track</div>}
        </div>

        {/* [4] Trend spark — 2×1 */}
        <div className="glass card-stripe stripe-purple" style={{ gridColumn:"span 2", padding:"16px 16px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <span className="section-label" style={{ marginBottom:0 }}>Score Trend</span>
            {sparkData.some(v => v > 0) && <span className="pill pill-purple">{sparkData.length} attempts</span>}
          </div>
          {sparkData.some(v => v > 0)
            ? <SparkBars data={sparkData}/>
            : <div style={{ fontSize:12, color:"var(--ink-3)", paddingTop:8 }}>Complete quizzes to see your trend</div>
          }
        </div>

        {/* [5] Subject progress — 2×2 */}
        <div className="glass card-stripe stripe-teal" style={{ gridColumn:"span 2", gridRow:"span 2", padding:"16px 18px", display:"flex", flexDirection:"column" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <span className="section-label" style={{ marginBottom:0 }}>Subject Progress</span>
            <button onClick={() => navigate("/subjects")} style={{ fontSize:11, color:"var(--ink-4)", background:"transparent", border:"none", cursor:"pointer", padding:0 }}>All →</button>
          </div>
          {topSubs.length === 0 ? (
            <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:12, color:"var(--ink-3)", marginBottom:12 }}>No progress data yet</div>
                <button className="btn-glow" style={{ padding:"6px 14px", fontSize:12 }} onClick={() => navigate("/generate-quiz")}>Take a Quiz</button>
              </div>
            </div>
          ) : (
            <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
              {topSubs.map((s, i) => {
                const score = s.average_score ?? 0;
                const pct   = s.progress_percentage ?? 0;
                const color = score >= 80 ? "var(--teal)" : score >= 50 ? "var(--amber)" : "var(--coral)";
                return (
                  <div key={i}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                      <span style={{ fontSize:12, fontWeight:500, color:"var(--ink)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:140 }}>{s.subject_name}</span>
                      <span style={{ fontSize:12, fontWeight:500, color, flexShrink:0, marginLeft:8 }}>{score.toFixed(0)}%</span>
                    </div>
                    <div className="prog-track"><div className="prog-fill" style={{ width:`${score}%`, background:color }}/></div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* [6] Recent activity — 2×2 */}
        <div className="glass card-stripe stripe-blue" style={{ gridColumn:"span 2", gridRow:"span 2", padding:"16px 18px", display:"flex", flexDirection:"column" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <span className="section-label" style={{ marginBottom:0 }}>Recent Activity</span>
            <button onClick={() => navigate("/analytics")} style={{ fontSize:11, color:"var(--ink-4)", background:"transparent", border:"none", cursor:"pointer", padding:0 }}>All →</button>
          </div>
          {!personal?.recent_activity?.length ? (
            <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10 }}>
              <div style={{ fontSize:12, color:"var(--ink-3)" }}>No activity yet</div>
              <button className="btn-glow" style={{ padding:"6px 14px", fontSize:12 }} onClick={() => navigate("/generate-quiz")}>Take a Quiz</button>
            </div>
          ) : (
            <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"space-around" }}>
              {personal.recent_activity.slice(0,5).map((a, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:9, paddingBottom: i < 4 ? 9 : 0, borderBottom: i < 4 ? "0.5px solid var(--border)" : "none" }}>
                  <div style={{ width:7, height:7, borderRadius:"50%", flexShrink:0, background: a.pct >= 80 ? "var(--teal)" : a.pct >= 50 ? "var(--amber)" : "var(--coral)" }}/>
                  <div style={{ flex:1, fontSize:12, color:"var(--ink)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.subject}</div>
                  <div style={{ fontSize:11, color:"var(--ink-4)", flexShrink:0, marginRight:8 }}>{a.date}</div>
                  <SPill pct={a.pct}/>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>{/* end bento */}

      {/* ─── QUICK ACCESS ─────────────────────────────────────── */}
      <div style={{ marginTop:16 }}>
        <span className="section-label">Quick Access</span>
        <div className="qa-grid">
          {QA.map(card => (
            <div key={card.path} onClick={() => navigate(card.path)}
              style={{
                padding:"13px 14px", borderRadius:"var(--r-lg)",
                background:"var(--bg-2)", border:"0.5px solid var(--border)",
                cursor:"pointer", transition:"border-color .15s,transform .15s,box-shadow .15s",
                position:"relative", overflow:"hidden",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = card.color.replace("var(","").replace(")","") === card.color ? "rgba(239,159,39,.35)" : `color-mix(in srgb, ${card.color} 40%, transparent)`; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
              {/* top stripe */}
              <div style={{ position:"absolute", top:0, left:0, right:0, height:"1.5px", background:card.color }}/>
              <div style={{ width:28, height:28, borderRadius:7, background:card.bg, color:card.color, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:9 }}>{card.icon}</div>
              <div style={{ fontSize:13, fontWeight:500, color:"var(--ink)", marginBottom:3 }}>{card.label}</div>
              <div style={{ fontSize:11, color:"var(--ink-3)" }}>{card.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── PLATFORM FOOTER ─────────────────────────────────────── */}
      <div style={{ marginTop:14, padding:"11px 16px", borderRadius:10, border:"0.5px solid var(--border)", display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
        <span style={{ fontSize:10, color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:".1em", fontWeight:500, marginRight:14 }}>Platform</span>
        {[
          { label:"subjects", v:global?.total_subjects },
          { label:"notes",    v:global?.total_notes    },
          { label:"quizzes",  v:global?.total_quizzes  },
          { label:"learners", v:global?.total_users    },
        ].map(s => (
          <div key={s.label} style={{ display:"flex", alignItems:"baseline", gap:4, marginRight:14 }}>
            <span style={{ fontSize:16, fontWeight:500, color:"var(--ink-2)" }}>{loading ? "—" : (s.v ?? "—")}</span>
            <span style={{ color:"var(--ink-4)", fontSize:11 }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}