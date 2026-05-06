import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getDashboardStats, getPersonalDashboard, getSubjectProgress, getPersonalAnalytics } from "../services/api";
import { SkeletonDashboard } from "../components/SkeletonCard";

/* ── Shared micro-components ─────────────────────────────────────── */

function ScoreRing({ pct, size = 80 }) {
  const r = (size - 8) / 2, circ = 2 * Math.PI * r, dash = circ * (Math.min(pct, 100) / 100);
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

function SPill({ pct }) {
  const c  = pct >= 80 ? "var(--teal)"  : pct >= 50 ? "var(--amber)"  : "var(--coral)";
  const bg = pct >= 80 ? "var(--teal-dim)" : pct >= 50 ? "var(--amber-dim)" : "var(--coral-dim)";
  return <span style={{ padding:"2px 8px", borderRadius:99, fontSize:11, fontWeight:500, background:bg, color:c }}>{pct}%</span>;
}

function PriorityBadge({ priority }) {
  const map = { high:["var(--coral)","var(--coral-dim)"], medium:["var(--amber)","var(--amber-dim)"], low:["var(--blue)","var(--blue-dim)"] };
  const [c, bg] = map[priority] || map.low;
  return <span style={{ padding:"2px 7px", borderRadius:99, fontSize:10, fontWeight:600, background:bg, color:c, textTransform:"uppercase", letterSpacing:".06em" }}>{priority}</span>;
}

function PerfBadge({ level }) {
  const map = { Advanced:["var(--teal)","var(--teal-dim)"], Intermediate:["var(--amber)","var(--amber-dim)"], Beginner:["var(--coral)","var(--coral-dim)"] };
  const [c, bg] = map[level] || map.Beginner;
  return <span style={{ padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:600, background:bg, color:c }}>{level}</span>;
}

/* ── Quick Access grid ───────────────────────────────────────────── */
const QA = [
  { path:"/generate-quiz",  label:"Generate Quiz",  desc:"AI MCQs",       color:"var(--amber)",  bg:"var(--amber-dim)",  icon:<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M7.5 10.5V9c1.1-.25 1.8-1 1.8-1.9 0-1-.8-1.6-1.8-1.6s-1.8.6-1.8 1.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="7.5" cy="12" r=".6" fill="currentColor"/></svg> },
  { path:"/generate-note",  label:"Generate Note",  desc:"Study notes",   color:"var(--purple)", bg:"var(--purple-dim)", icon:<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M9 2H4.5A1.5 1.5 0 003 3.5v8A1.5 1.5 0 004.5 13h6A1.5 1.5 0 0012 11.5V5L9 2z" stroke="currentColor" strokeWidth="1.3"/><path d="M9 2v3h3M5.5 8.5h4M5.5 10.5h2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
  { path:"/chat",           label:"AI Tutor",       desc:"Ask anything",  color:"var(--blue)",   bg:"var(--blue-dim)",   icon:<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2.5 3A1.5 1.5 0 014 1.5h7A1.5 1.5 0 0112.5 3v6A1.5 1.5 0 0111 10.5H5.5L2.5 13V3z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg> },
  { path:"/analytics",      label:"Analytics",      desc:"My progress",   color:"var(--coral)",  bg:"var(--coral-dim)",  icon:<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2.5 12l3.5-4.5 3 2.5 4-7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { path:"/my-quizzes",     label:"History",        desc:"Past quizzes",  color:"var(--teal)",   bg:"var(--teal-dim)",   icon:<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M7.5 4.5V7.5l2.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
  { path:"/notes",          label:"My Notes",       desc:"Saved notes",   color:"var(--amber)",  bg:"var(--amber-dim)",  icon:<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3.5 2.5h6l3 3v7a.5.5 0 01-.5.5h-9a.5.5 0 01-.5-.5v-10a.5.5 0 01.5-.5z" stroke="currentColor" strokeWidth="1.3"/><path d="M9.5 2.5v3h3M5 8h5M5 10h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
  { path:"/subjects",       label:"Subjects",       desc:"Track syllabus",color:"var(--purple)", bg:"var(--purple-dim)", icon:<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2.5 3.5A1 1 0 013.5 2.5h8A1 1 0 0112.5 3.5v8a1 1 0 01-1 1h-8a1 1 0 01-1-1v-8z" stroke="currentColor" strokeWidth="1.3"/><path d="M5 5.5h5M5 7.5h5M5 9.5h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
  { path:"/fyp-guide",      label:"FYP Guide",      desc:"Project roadmap",color:"var(--blue)",  bg:"var(--blue-dim)",   icon:<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1.5l2 4 4.5.6-3.2 3.2.8 4.5L7.5 11.5l-4 2.3.8-4.5L1 6.1l4.5-.6L7.5 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg> },
  { path:"/resume-builder", label:"Resume",         desc:"LaTeX builder",  color:"var(--coral)", bg:"var(--coral-dim)",  icon:<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="3" y="1.5" width="9" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="7.5" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M4.5 10c0-1.6 1.3-2.5 3-2.5s3 .9 3 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

/* ── AI Insights Panel ───────────────────────────────────────────── */
function InsightsPanel({ insights }) {
  if (!insights?.length) return null;
  const icons = ["↑","★","⚠","✓","🔥","◎"];
  return (
    <div className="glass fade-up" style={{ padding:"18px 20px", marginBottom:9 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
        <div style={{ width:26, height:26, borderRadius:7, background:"var(--purple-dim)", color:"var(--purple)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>✦</div>
        <span style={{ fontSize:13, fontWeight:500, color:"var(--ink)" }}>AI Insights</span>
        <span style={{ fontSize:11, color:"var(--purple)", background:"var(--purple-dim)", padding:"1px 8px", borderRadius:99, marginLeft:"auto" }}>Personalized</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:8 }}>
        {insights.map((text, i) => (
          <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", padding:"10px 12px", borderRadius:8, background:"var(--bg-3)", border:"0.5px solid var(--border)" }}>
            <span style={{ fontSize:12, color:"var(--purple)", flexShrink:0, marginTop:1 }}>{icons[i % icons.length]}</span>
            <span style={{ fontSize:12, color:"var(--ink-2)", lineHeight:1.55 }}>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Study Plan Cards ────────────────────────────────────────────── */
function StudyPlanSection({ plan, navigate }) {
  if (!plan?.length) return null;
  return (
    <div className="fade-up" style={{ marginBottom:9 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <span className="section-label" style={{ marginBottom:0 }}>🎯 Your Study Plan</span>
        <button onClick={() => navigate("/generate-quiz")} style={{ fontSize:11, color:"var(--amber)", background:"transparent", border:"none", cursor:"pointer", padding:0, fontFamily:"var(--font-body)" }}>Start studying →</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:9 }}>
        {plan.map((item, i) => {
          const borderColor = item.priority === "high" ? "var(--coral-border)" : item.priority === "medium" ? "var(--amber-border)" : "var(--border-med)";
          const accentColor = item.priority === "high" ? "var(--coral)" : item.priority === "medium" ? "var(--amber)" : "var(--blue)";
          return (
            <div key={i} className="glass" style={{ padding:"14px 16px", border:`0.5px solid ${borderColor}`, position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:accentColor }}/>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:500, color:"var(--ink)", marginBottom:2 }}>{item.topic}</div>
                  <div style={{ fontSize:11, color:"var(--ink-3)" }}>{item.subject}</div>
                </div>
                <PriorityBadge priority={item.priority}/>
              </div>
              <p style={{ fontSize:11, color:"var(--ink-3)", lineHeight:1.5, marginBottom:10 }}>{item.reason}</p>
              <button onClick={() => {
                sessionStorage.setItem("eg_study_topic", item.topic);
                sessionStorage.setItem("eg_study_subject", item.subject);
                navigate("/generate-quiz");
              }} style={{ width:"100%", padding:"7px 0", borderRadius:6, border:"0.5px solid " + borderColor, background:"transparent", color:accentColor, fontFamily:"var(--font-body)", fontSize:12, cursor:"pointer", transition:"background .15s" }}
                onMouseEnter={e => e.currentTarget.style.background = accentColor === "var(--coral)" ? "var(--coral-dim)" : accentColor === "var(--amber)" ? "var(--amber-dim)" : "var(--blue-dim)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                {item.action} →
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Weak Topics Strip ───────────────────────────────────────────── */
function WeakTopicsStrip({ weakTopics, navigate }) {
  if (!weakTopics?.length) return null;
  return (
    <div className="glass fade-up" style={{ padding:"14px 18px", marginBottom:9, border:"0.5px solid var(--coral-border)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <span style={{ fontSize:12, fontWeight:500, color:"var(--coral)", display:"flex", alignItems:"center", gap:6 }}>
          <span>⚠</span> Weak Topics — need attention
        </span>
        <span style={{ fontSize:10, color:"var(--ink-4)" }}>{weakTopics.length} topic{weakTopics.length !== 1 ? "s" : ""} below 50%</span>
      </div>
      <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
        {weakTopics.slice(0, 6).map((t, i) => (
          <button key={i} onClick={() => navigate("/generate-quiz")}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 11px", borderRadius:99, background:"var(--coral-dim)", border:"0.5px solid var(--coral-border)", cursor:"pointer", fontFamily:"var(--font-body)", transition:"opacity .15s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = ".75"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            <span style={{ fontSize:11, color:"var(--coral)", fontWeight:500 }}>{t.topic}</span>
            <span style={{ fontSize:10, color:"var(--coral)", opacity:.7 }}>{t.avg}%</span>
          </button>
        ))}
        {weakTopics.length > 6 && (
          <span style={{ padding:"6px 11px", fontSize:11, color:"var(--ink-4)" }}>+{weakTopics.length - 6} more</span>
        )}
      </div>
    </div>
  );
}

/* ── Main Dashboard ──────────────────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate();
  const [global,    setGlobal]    = useState(null);
  const [personal,  setPersonal]  = useState(null);
  const [subjects,  setSubjects]  = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getPersonalDashboard(),
      getSubjectProgress(),
      getPersonalAnalytics(),
    ])
      .then(([g, p, s, a]) => {
        setGlobal(g.data);
        setPersonal(p.data);
        setSubjects(s.data || []);
        setAnalytics(a.data || null);
        // Persist recommended_difficulty for quiz page pre-fill
        if (a.data?.recommended_difficulty) {
          localStorage.setItem("eg_rec_difficulty", a.data.recommended_difficulty);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const avg        = personal?.avg_score ?? 0;
  const avgColor   = avg >= 80 ? "var(--teal)" : avg >= 50 ? "var(--amber)" : avg > 0 ? "var(--coral)" : "var(--ink-3)";
  const avgLabel   = avg >= 80 ? "Excellent" : avg >= 50 ? "Keep practicing" : avg > 0 ? "Needs work" : "No quizzes yet";
  const perfLevel  = analytics?.performance_level;
  const streak     = analytics?.learning_streak ?? { current: 0, longest: 0 };
  const sparkData  = (personal?.recent_activity || []).slice(0,10).map(a => a.pct).reverse();
  while (sparkData.length < 8) sparkData.unshift(0);
  const topSubs    = subjects.filter(s => s.average_score > 0).slice(0, 4);

  if (loading) return <SkeletonDashboard/>;

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
        <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap", marginBottom:6 }}>
          <h1 style={{ fontSize:"clamp(1.7rem,4vw,2.4rem)", color:"var(--ink)", fontWeight:500, lineHeight:1.1, letterSpacing:"-.025em" }}>
            {loading ? "…" : personal?.name?.split(" ")[0] || "Scholar"}.
          </h1>
          {perfLevel && !loading && <PerfBadge level={perfLevel}/>}
        </div>
        <p style={{ color:"var(--ink-3)", fontSize:13 }}>Here's your study overview.</p>
      </div>

      {/* ─── BENTO GRID ──────────────────────────────────────────── */}
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
              {perfLevel
                ? <PerfBadge level={perfLevel}/>
                : <span className="pill pill-amber" style={{ marginTop:10, display:"inline-block" }}>
                    {avg >= 80 ? "Mastered" : avg >= 50 ? "In Progress" : avg > 0 ? "Needs Work" : "Get Started"}
                  </span>
              }
            </div>
          </div>
          {/* Sub-stats row */}
          <div style={{ display:"flex", gap:20, paddingTop:14, borderTop:"0.5px solid var(--border)" }}>
            {[
              { label:"Quizzes",    v: personal?.my_quizzes },
              { label:"Notes",      v: personal?.my_notes   },
              { label:"🔥 Streak",  v: streak.current > 0 ? `${streak.current}d` : 0 },
              ...(analytics?.recommended_difficulty ? [{ label:"Next Level", v: analytics.recommended_difficulty }] : []),
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize:11, color:"var(--ink-4)", marginBottom:3 }}>{s.label}</div>
                <div style={{ fontSize:18, fontWeight:500, color:"var(--ink)", lineHeight:1 }}>{loading ? "—" : (s.v ?? "—")}</div>
              </div>
            ))}
          </div>
        </div>

        {/* [2] Streak — uses real backend data */}
        <div className="glass card-stripe stripe-coral" style={{ padding:"16px 16px" }}>
          <span className="section-label">Streak</span>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:24 }} className="streak-flame">🔥</span>
            <div>
              <div style={{ fontSize:24, fontWeight:500, color:"var(--coral)", lineHeight:1 }}>
                {loading ? "—" : streak.current}
              </div>
              <div style={{ fontSize:11, color:"var(--ink-3)", marginTop:3 }}>day streak</div>
            </div>
          </div>
          {streak.longest > 0 && !loading && (
            <div style={{ marginTop:8, fontSize:11, color:"var(--ink-4)" }}>Best: {streak.longest}d</div>
          )}
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
            <div>
              <span className="section-label" style={{ marginBottom:0 }}>Score Trend</span>
              {analytics?.improvement_trend && !loading && (
                <span style={{ marginLeft:8, fontSize:10, padding:"1px 7px", borderRadius:99, fontWeight:500,
                  background: analytics.improvement_trend === "improving" ? "var(--teal-dim)" : analytics.improvement_trend === "declining" ? "var(--coral-dim)" : "var(--bg-4)",
                  color:      analytics.improvement_trend === "improving" ? "var(--teal)" : analytics.improvement_trend === "declining" ? "var(--coral)" : "var(--ink-4)",
                }}>
                  {analytics.improvement_trend === "improving" ? "↑ Improving" : analytics.improvement_trend === "declining" ? "↓ Declining" : "→ Neutral"}
                </span>
              )}
            </div>
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
                const color = score >= 80 ? "var(--teal)" : score >= 50 ? "var(--amber)" : "var(--coral)";
                const isWeak = analytics?.weak_topics?.some(w => w.subject === s.subject_name);
                return (
                  <div key={i}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                      <span style={{ fontSize:12, fontWeight:500, color:"var(--ink)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:130 }}>{s.subject_name}</span>
                      <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0, marginLeft:8 }}>
                        {isWeak && <span style={{ fontSize:9, color:"var(--coral)", background:"var(--coral-dim)", padding:"1px 5px", borderRadius:99 }}>WEAK</span>}
                        <span style={{ fontSize:12, fontWeight:500, color }}>{score.toFixed(0)}%</span>
                      </div>
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

      {/* ─── SMART SECTIONS (NEW — additive) ─────────────────────── */}

      {/* Weak topics strip */}
      <WeakTopicsStrip weakTopics={analytics?.weak_topics} navigate={navigate}/>

      {/* AI Insights */}
      <InsightsPanel insights={analytics?.insights}/>

      {/* Study Plan */}
      <StudyPlanSection plan={analytics?.study_plan} navigate={navigate}/>

      {/* ─── QUICK ACCESS ─────────────────────────────────────────── */}
      <div style={{ marginTop:16 }}>
        <span className="section-label">Quick Access</span>
        <div className="qa-grid">
          {QA.map(card => (
            <div key={card.path}
              onClick={() => navigate(card.path)}
              className="glass-hover"
              role="button"
              tabIndex={0}
              aria-label={`Go to ${card.label} — ${card.desc}`}
              onKeyDown={e => e.key === "Enter" && navigate(card.path)}
              style={{ padding:"13px 14px", borderRadius:"var(--r-lg)", background:"var(--bg-2)", border:"0.5px solid var(--border)", cursor:"pointer", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:"1.5px", background:card.color }}/>
              <div style={{ width:28, height:28, borderRadius:7, background:card.bg, color:card.color, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:9 }}>{card.icon}</div>
              <div style={{ fontSize:13, fontWeight:500, color:"var(--ink)", marginBottom:3 }}>{card.label}</div>
              <div style={{ fontSize:11, color:"var(--ink-3)" }}>{card.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── PLATFORM FOOTER ──────────────────────────────────────── */}
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
