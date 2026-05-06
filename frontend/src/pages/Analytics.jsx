import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPersonalAnalytics } from "../services/api";
import PageHeader from "../components/PageHeader";
import { SkeletonAnalytics } from "../components/SkeletonCard";
import { EmptyState, ErrorState } from "../components/EmptyState";

const sc = s => s>=80?"var(--teal)":s>=50?"var(--amber)":"var(--coral)";

/* ── Trend chart (unchanged) ─────────────────────────────────────── */
function TrendChart({ data }) {
  if (!data||data.length<2) return <div style={{ textAlign:"center",padding:"36px 0",color:"var(--ink-4)",fontSize:12 }}>Complete more quizzes to see your trend.</div>;
  const W=100,H=56;
  const pts=data.map((d,i)=>({ x:(i/(data.length-1))*W, y:H-(d.score/100)*H, score:d.score, date:d.date }));
  const path=pts.map((p,i)=>`${i===0?"M":"L"}${p.x},${p.y}`).join(" ");
  const area=`${path} L${pts[pts.length-1].x},${H} L0,${H} Z`;
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%",height:120,overflow:"visible" }}>
        <defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--amber)" stopOpacity=".18"/><stop offset="100%" stopColor="var(--amber)" stopOpacity="0"/></linearGradient></defs>
        {[25,50,75].map(y=><line key={y} x1={0} y1={H-(y/100)*H} x2={W} y2={H-(y/100)*H} stroke="rgba(255,255,255,.04)" strokeWidth=".5" strokeDasharray="2,3"/>)}
        <path d={area} fill="url(#tg)"/>
        <path d={path} fill="none" stroke="var(--amber)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        {pts.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="2" fill={sc(p.score)}/>)}
      </svg>
      <div style={{ display:"flex",justifyContent:"space-between",marginTop:4 }}>
        {pts.map((p,i)=><span key={i} style={{ fontSize:10,color:"var(--ink-4)" }}>{p.date}</span>)}
      </div>
    </div>
  );
}

/* ── Activity heatmap (unchanged) ────────────────────────────────── */
function ActivityHeatmap({ trend }) {
  const weeks=14; const today=new Date(); const cells=[];
  for(let w=weeks-1;w>=0;w--) for(let d=0;d<7;d++){ const dt=new Date(today); dt.setDate(today.getDate()-(w*7+(6-d))); cells.push(dt.toISOString().split("T")[0]); }
  const countMap={}; (trend||[]).forEach(a=>{ const day=(a.date||"").split(" ").pop(); if(day) countMap[day]=(countMap[day]||0)+1; });
  const gc=date=>{ const c=countMap[date]||0; if(!c) return "var(--bg-4)"; if(c===1) return "rgba(239,159,39,.22)"; if(c===2) return "rgba(239,159,39,.48)"; if(c===3) return "rgba(239,159,39,.72)"; return "var(--amber)"; };
  return (
    <div>
      <div style={{ display:"grid",gridTemplateColumns:`repeat(${weeks},1fr)`,gap:3 }}>
        {Array.from({length:weeks}).map((_,wi)=>(
          <div key={wi} style={{ display:"grid",gridTemplateRows:"repeat(7,1fr)",gap:3 }}>
            {cells.slice(wi*7,wi*7+7).map(date=>(
              <div key={date} className="heat-cell" style={{ background:gc(date) }} title={`${date}: ${countMap[date]||0} quizzes`}/>
            ))}
          </div>
        ))}
      </div>
      <div style={{ display:"flex",alignItems:"center",gap:5,marginTop:9,justifyContent:"flex-end" }}>
        <span style={{ fontSize:10,color:"var(--ink-4)" }}>Less</span>
        {["var(--bg-4)","rgba(239,159,39,.22)","rgba(239,159,39,.48)","rgba(239,159,39,.72)","var(--amber)"].map(c=><div key={c} style={{ width:8,height:8,borderRadius:2,background:c }}/>)}
        <span style={{ fontSize:10,color:"var(--ink-4)" }}>More</span>
      </div>
    </div>
  );
}

/* ── NEW: Learning Streak Banner ─────────────────────────────────── */
function StreakBanner({ streak }) {
  if (!streak) return null;
  const { current, longest } = streak;
  const intensity = current >= 7 ? "var(--coral)" : current >= 3 ? "var(--amber)" : "var(--ink-4)";
  return (
    <div className="glass fade-up" style={{ padding:"14px 20px", marginBottom:12, display:"flex", alignItems:"center", gap:20, flexWrap:"wrap", border:`0.5px solid ${current >= 3 ? "var(--amber-border)" : "var(--border)"}` }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <span style={{ fontSize:28 }}>🔥</span>
        <div>
          <div style={{ fontSize:26, fontWeight:600, color:intensity, lineHeight:1, letterSpacing:"-.02em" }}>{current} <span style={{ fontSize:14, fontWeight:400, color:"var(--ink-3)" }}>day streak</span></div>
          <div style={{ fontSize:11, color:"var(--ink-4)", marginTop:3 }}>
            {current === 0 ? "Study today to start a streak!" : current === 1 ? "Great start — come back tomorrow!" : `Keep it going!`}
          </div>
        </div>
      </div>
      <div style={{ marginLeft:"auto", textAlign:"right" }}>
        <div style={{ fontSize:11, color:"var(--ink-4)", marginBottom:2 }}>Longest streak</div>
        <div style={{ fontSize:20, fontWeight:500, color:"var(--ink-2)" }}>{longest}d</div>
      </div>
      {/* Streak progress bar */}
      <div style={{ width:"100%", marginTop:4 }}>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"var(--ink-4)", marginBottom:4 }}>
          <span>Current: {current} days</span>
          <span>Goal: 7 days</span>
        </div>
        <div className="prog-track">
          <div className="prog-fill" style={{ width:`${Math.min((current/7)*100, 100)}%`, background: current >= 7 ? "var(--teal)" : "var(--amber)" }}/>
        </div>
      </div>
    </div>
  );
}

/* ── NEW: Performance Classification Card ────────────────────────── */
function PerformanceCard({ level, avg, recommended_difficulty }) {
  if (!level) return null;
  const levelMap = {
    Advanced:     { color:"var(--teal)",   bg:"var(--teal-dim)",   icon:"🏆", msg:"You're at the top. Challenge yourself with Hard quizzes." },
    Intermediate: { color:"var(--amber)",  bg:"var(--amber-dim)",  icon:"📈", msg:"Solid progress. Keep pushing to reach Advanced." },
    Beginner:     { color:"var(--coral)",  bg:"var(--coral-dim)",  icon:"🌱", msg:"Build your foundation. Focus on weak topics first." },
  };
  const { color, bg, icon, msg } = levelMap[level] || levelMap.Beginner;
  const diffColor = recommended_difficulty === "hard" ? "var(--teal)" : recommended_difficulty === "medium" ? "var(--amber)" : "var(--coral)";
  return (
    <div className="glass" style={{ padding:"18px 20px", border:`0.5px solid ${bg.replace("dim", "border")}` }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
        <div style={{ width:40, height:40, borderRadius:10, background:bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{icon}</div>
        <div>
          <div style={{ fontSize:11, color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:".08em", marginBottom:3 }}>Performance Level</div>
          <div style={{ fontSize:20, fontWeight:600, color, letterSpacing:"-.01em" }}>{level}</div>
        </div>
        <div style={{ marginLeft:"auto", textAlign:"right" }}>
          <div style={{ fontSize:11, color:"var(--ink-4)", marginBottom:3 }}>Overall avg</div>
          <div style={{ fontSize:24, fontWeight:500, color: sc(avg) }}>{avg}%</div>
        </div>
      </div>
      <p style={{ fontSize:12, color:"var(--ink-3)", lineHeight:1.55, marginBottom:12 }}>{msg}</p>
      <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", borderRadius:8, background:"var(--bg-3)", border:"0.5px solid var(--border)" }}>
        <span style={{ fontSize:11, color:"var(--ink-4)" }}>Recommended next difficulty</span>
        <span style={{ marginLeft:"auto", fontSize:12, fontWeight:600, color:diffColor, textTransform:"capitalize" }}>{recommended_difficulty || "medium"}</span>
      </div>
    </div>
  );
}

/* ── NEW: AI Insights Panel ──────────────────────────────────────── */
function InsightsPanel({ insights }) {
  if (!insights?.length) return null;
  const icons = ["↑","★","⚠","✓","🔥","◎"];
  return (
    <div className="glass fade-up" style={{ padding:"18px 20px", marginBottom:12 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
        <div style={{ width:26, height:26, borderRadius:7, background:"var(--purple-dim)", color:"var(--purple)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>✦</div>
        <div style={{ fontSize:13, fontWeight:500, color:"var(--ink)" }}>AI Insights</div>
        <span style={{ fontSize:11, color:"var(--purple)", background:"var(--purple-dim)", padding:"1px 8px", borderRadius:99, marginLeft:"auto" }}>Personalized</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(270px, 1fr))", gap:8 }}>
        {insights.map((text, i) => (
          <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", padding:"10px 12px", borderRadius:8, background:"var(--bg-3)", border:"0.5px solid var(--border)" }}>
            <span style={{ fontSize:13, color:"var(--purple)", flexShrink:0 }}>{icons[i % icons.length]}</span>
            <span style={{ fontSize:12, color:"var(--ink-2)", lineHeight:1.55 }}>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── NEW: Weak / Strong Topic Grid ───────────────────────────────── */
function TopicGrid({ weakTopics, strongTopics, navigate }) {
  const hasWeak   = weakTopics?.length > 0;
  const hasStrong = strongTopics?.length > 0;
  if (!hasWeak && !hasStrong) return null;

  const TopicRow = ({ topic, color, dimColor, borderColor, action, actionColor, onAction }) => (
    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:8, background:"var(--bg-3)", border:`0.5px solid ${borderColor}`, marginBottom:6 }}>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:12, fontWeight:500, color:"var(--ink)" }}>{topic.topic}</div>
        <div style={{ fontSize:11, color:"var(--ink-4)", marginTop:1 }}>{topic.subject} · {topic.attempts} attempt{topic.attempts !== 1 ? "s" : ""}</div>
      </div>
      <span style={{ fontSize:13, fontWeight:600, color, flexShrink:0 }}>{topic.avg}%</span>
      <button onClick={onAction}
        style={{ padding:"4px 10px", borderRadius:6, border:`0.5px solid ${borderColor}`, background:dimColor, color:actionColor, fontFamily:"var(--font-body)", fontSize:11, cursor:"pointer", flexShrink:0, transition:"opacity .15s" }}
        onMouseEnter={e => e.currentTarget.style.opacity=".7"}
        onMouseLeave={e => e.currentTarget.style.opacity="1"}>
        {action}
      </button>
    </div>
  );

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }} className="fade-up">
      {hasWeak && (
        <div className="glass" style={{ padding:"18px", border:"0.5px solid var(--coral-border)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:12 }}>
            <span style={{ fontSize:13 }}>⚠</span>
            <span style={{ fontSize:13, fontWeight:500, color:"var(--coral)" }}>Weak Topics</span>
            <span style={{ marginLeft:"auto", fontSize:10, color:"var(--ink-4)" }}>&lt;50% avg</span>
          </div>
          {weakTopics.map((t, i) => (
            <TopicRow key={i} topic={t}
              color="var(--coral)" dimColor="var(--coral-dim)" borderColor="var(--coral-border)" actionColor="var(--coral)"
              action="Improve →" onAction={() => navigate("/generate-quiz")}/>
          ))}
        </div>
      )}
      {hasStrong && (
        <div className="glass" style={{ padding:"18px", border:"0.5px solid var(--teal-border)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:12 }}>
            <span style={{ fontSize:13 }}>✓</span>
            <span style={{ fontSize:13, fontWeight:500, color:"var(--teal)" }}>Strong Topics</span>
            <span style={{ marginLeft:"auto", fontSize:10, color:"var(--ink-4)" }}>≥80% avg</span>
          </div>
          {strongTopics.map((t, i) => (
            <TopicRow key={i} topic={t}
              color="var(--teal)" dimColor="var(--teal-dim)" borderColor="var(--teal-border)" actionColor="var(--teal)"
              action="Challenge →" onAction={() => navigate("/generate-quiz")}/>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── NEW: Study Plan Section ─────────────────────────────────────── */
function StudyPlanSection({ plan, navigate }) {
  if (!plan?.length) return null;
  return (
    <div className="glass fade-up" style={{ padding:"18px 20px", marginBottom:12 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div style={{ fontSize:13, fontWeight:500, color:"var(--ink)" }}>🎯 Personalized Study Plan</div>
        <span style={{ fontSize:11, color:"var(--ink-4)" }}>{plan.length} item{plan.length !== 1 ? "s" : ""}</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:9 }}>
        {plan.map((item, i) => {
          const color  = item.priority === "high" ? "var(--coral)" : item.priority === "medium" ? "var(--amber)" : "var(--blue)";
          const dim    = item.priority === "high" ? "var(--coral-dim)" : item.priority === "medium" ? "var(--amber-dim)" : "var(--blue-dim)";
          const border = item.priority === "high" ? "var(--coral-border)" : item.priority === "medium" ? "var(--amber-border)" : "var(--border-med)";
          return (
            <div key={i} style={{ padding:"13px 14px", borderRadius:10, background:"var(--bg-3)", border:`0.5px solid ${border}`, position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:color }}/>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:7 }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:500, color:"var(--ink)", marginBottom:2 }}>{item.topic}</div>
                  <div style={{ fontSize:10, color:"var(--ink-4)" }}>{item.subject}</div>
                </div>
                <span style={{ padding:"2px 7px", borderRadius:99, fontSize:10, fontWeight:600, background:dim, color, textTransform:"uppercase", letterSpacing:".06em", flexShrink:0, marginLeft:6 }}>{item.priority}</span>
              </div>
              <p style={{ fontSize:11, color:"var(--ink-3)", lineHeight:1.45, marginBottom:9 }}>{item.reason}</p>
              <button onClick={() => navigate("/generate-quiz")}
                style={{ width:"100%", padding:"6px 0", borderRadius:6, border:`0.5px solid ${border}`, background:"transparent", color, fontFamily:"var(--font-body)", fontSize:11, cursor:"pointer", transition:"background .15s" }}
                onMouseEnter={e => e.currentTarget.style.background = dim}
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

/* ── Main Analytics Page ─────────────────────────────────────────── */
export default function Analytics() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getPersonalAnalytics()
      .then(r => setData(r.data))
      .catch(() => setError("Could not load analytics. Check your connection and try again."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div>
      <PageHeader title="Performance" accent="Analytics" accentColor="var(--coral)" sub="Your personal learning intelligence dashboard"/>
      <SkeletonAnalytics/>
    </div>
  );

  if (error) return (
    <div>
      <PageHeader title="Performance" accent="Analytics" accentColor="var(--coral)"/>
      <ErrorState message={error} onRetry={load}/>
    </div>
  );

  if (!data || data.total_attempts === 0) return (
    <div>
      <PageHeader title="Performance" accent="Analytics" accentColor="var(--coral)" sub="Your personal learning intelligence dashboard"/>
      <div className="glass">
        <EmptyState
          icon="📊"
          title="No quiz data yet"
          sub="Complete your first quiz to unlock your personal analytics, insights, and study plan."
          action={{ label:"Generate First Quiz", onClick:() => navigate("/generate-quiz") }}
        />
      </div>
    </div>
  );

  const {
    total_attempts, overall_avg, total_notes,
    best_subject, best_subject_score,
    trend, subject_performance, difficulty_breakdown,
    // new fields (gracefully absent for older backends)
    weak_topics, strong_topics, improvement_trend,
    learning_streak, study_plan, performance_level,
    recommended_difficulty, insights,
  } = data;

  const total = (difficulty_breakdown.strong + difficulty_breakdown.average + difficulty_breakdown.weak) || 1;

  const trendBadge = improvement_trend
    ? { improving:["↑ Improving","var(--teal)","var(--teal-dim)"], declining:["↓ Declining","var(--coral)","var(--coral-dim)"], neutral:["→ Stable","var(--ink-4)","var(--bg-4)"] }[improvement_trend]
    : null;

  return (
    <div>
      <style>{`
        .ag2{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
        .kpi4{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;}
        @media(max-width:860px){.kpi4{grid-template-columns:1fr 1fr!important;}.ag2{grid-template-columns:1fr!important;}}
      `}</style>

      <PageHeader title="Performance" accent="Analytics" accentColor="var(--coral)" sub="Your personal learning intelligence dashboard"/>

      {/* ── KPI strip (existing — unchanged) ─────────────────────── */}
      <div className="kpi4 fade-up" style={{ marginBottom:14 }}>
        {[
          { label:"Total Attempts",  v:total_attempts,           c:"var(--amber)"  },
          { label:"Overall Average", v:`${overall_avg}%`,        c:sc(overall_avg) },
          { label:"Notes Created",   v:total_notes,              c:"var(--blue)"   },
          { label:"Best Score",      v:`${best_subject_score}%`, c:"var(--teal)",  sub:best_subject?.split(" ").slice(0,2).join(" ") },
        ].map((k,i)=>(
          <div key={i} className="glass glass-hover card-stripe" style={{ padding:"16px 15px", cursor:"default", [`--stripe-color`]:k.c }}>
            <style>{`.glass.card-stripe[style*="--stripe-color:${k.c}"]::before{background:${k.c};}`}</style>
            <div className="count-reveal" style={{ fontFamily:"var(--font-body)",fontSize:28,fontWeight:500,color:k.c,lineHeight:1,marginBottom:k.sub?3:6,letterSpacing:"-.02em",animationDelay:`${i*.08}s` }}>{k.v}</div>
            {k.sub&&<div style={{ fontSize:11,color:"var(--ink-3)",marginBottom:5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{k.sub}</div>}
            <div style={{ color:"var(--ink-4)",fontSize:10,textTransform:"uppercase",letterSpacing:".08em",fontWeight:500 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* ── NEW: Streak banner ───────────────────────────────────── */}
      <StreakBanner streak={learning_streak}/>

      {/* ── NEW: Performance classification ─────────────────────── */}
      {performance_level && (
        <div className="fade-up" style={{ marginBottom:12 }}>
          <PerformanceCard level={performance_level} avg={overall_avg} recommended_difficulty={recommended_difficulty}/>
        </div>
      )}

      {/* ── NEW: AI Insights ─────────────────────────────────────── */}
      <InsightsPanel insights={insights}/>

      {/* ── Trend + breakdown (existing layout, trend badge added) ── */}
      <div className="ag2 fade-up" style={{ marginBottom:12 }}>
        <div className="glass" style={{ padding:"18px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
            <div style={{ fontWeight:500,fontSize:13,color:"var(--ink)" }}>Score Trend</div>
            {trendBadge && (
              <span style={{ fontSize:10, padding:"1px 7px", borderRadius:99, fontWeight:500, background:trendBadge[2], color:trendBadge[1] }}>{trendBadge[0]}</span>
            )}
          </div>
          <p style={{ color:"var(--ink-3)",fontSize:12,marginBottom:14 }}>Last {trend.length} attempts</p>
          <TrendChart data={trend}/>
        </div>
        <div className="glass" style={{ padding:"18px" }}>
          <div style={{ fontWeight:500,fontSize:13,color:"var(--ink)",marginBottom:3 }}>Result Breakdown</div>
          <p style={{ color:"var(--ink-3)",fontSize:12,marginBottom:16 }}>Quiz performance distribution</p>
          {[
            { label:"Strong (≥80%)",    count:difficulty_breakdown.strong,  color:"var(--teal)"  },
            { label:"Average (50–79%)", count:difficulty_breakdown.average, color:"var(--amber)" },
            { label:"Weak (<50%)",      count:difficulty_breakdown.weak,    color:"var(--coral)" },
          ].map(d=>(
            <div key={d.label} style={{ marginBottom:14 }}>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
                <span style={{ fontSize:12,color:"var(--ink-2)" }}>{d.label}</span>
                <span style={{ fontSize:16,fontWeight:500,color:d.color }}>{d.count}</span>
              </div>
              <div className="prog-track"><div className="prog-fill" style={{ width:`${d.count/total*100}%`,background:d.color }}/></div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Activity heatmap (existing — unchanged) ──────────────── */}
      <div className="glass fade-up" style={{ padding:"18px",marginBottom:12 }}>
        <div style={{ fontWeight:500,fontSize:13,color:"var(--ink)",marginBottom:3 }}>Study Activity</div>
        <p style={{ color:"var(--ink-3)",fontSize:12,marginBottom:14 }}>Last 14 weeks</p>
        <ActivityHeatmap trend={trend}/>
      </div>

      {/* ── NEW: Weak / strong topic grids ───────────────────────── */}
      <TopicGrid
        weakTopics={weak_topics}
        strongTopics={strong_topics}
        navigate={navigate}
      />

      {/* ── Subject performance (existing — unchanged) ───────────── */}
      {subject_performance.length > 0 && (
        <div className="glass fade-up" style={{ padding:"18px", marginBottom:12 }}>
          <div style={{ fontWeight:500,fontSize:13,color:"var(--ink)",marginBottom:3 }}>Subject Performance</div>
          <p style={{ color:"var(--ink-3)",fontSize:12,marginBottom:16 }}>Ranked by average score</p>
          {subject_performance.map((s,i)=>{
            const isWeak   = weak_topics?.some(w => w.subject === s.subject);
            const isStrong = strong_topics?.some(w => w.subject === s.subject);
            return (
              <div key={i} style={{ marginBottom:13 }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5,flexWrap:"wrap",gap:4 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:7 }}>
                    <span style={{ fontSize:10,color:"var(--ink-4)",fontWeight:600,background:"var(--bg-overlay)",borderRadius:4,padding:"1px 6px",fontFamily:"var(--font-mono)" }}>#{i+1}</span>
                    <span style={{ fontSize:13,color:"var(--ink)",fontWeight:500,maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{s.subject}</span>
                    {isWeak   && <span style={{ fontSize:9,color:"var(--coral)",background:"var(--coral-dim)",padding:"1px 5px",borderRadius:99,fontWeight:600 }}>WEAK</span>}
                    {isStrong && <span style={{ fontSize:9,color:"var(--teal)",background:"var(--teal-dim)",padding:"1px 5px",borderRadius:99,fontWeight:600 }}>STRONG</span>}
                  </div>
                  <div style={{ display:"flex",alignItems:"center",gap:9 }}>
                    <span style={{ fontSize:11,color:"var(--ink-4)" }}>{s.attempts} quiz{s.attempts!==1?"zes":""}</span>
                    <span style={{ fontSize:16,fontWeight:500,color:sc(s.avg) }}>{s.avg}%</span>
                  </div>
                </div>
                <div className="prog-track"><div className="prog-fill" style={{ width:`${s.avg}%`,background:sc(s.avg) }}/></div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── NEW: Study plan ──────────────────────────────────────── */}
      <StudyPlanSection plan={study_plan} navigate={navigate}/>

    </div>
  );
}
