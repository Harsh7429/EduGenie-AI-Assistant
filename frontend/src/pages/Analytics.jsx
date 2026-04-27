import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPersonalAnalytics } from "../services/api";
import PageHeader from "../components/PageHeader";
import { SkeletonStats } from "../components/SkeletonCard";

const scoreColor = s => s >= 80 ? "var(--jade)" : s >= 50 ? "var(--gold)" : "var(--ruby)";

function TrendChart({ data }) {
  if (!data || data.length < 2) return (
    <div style={{ textAlign:"center", padding:"40px 0", color:"var(--ink-4)" }}>
      <p style={{ fontSize:".82rem" }}>Complete more quizzes to see your trend.</p>
    </div>
  );
  const max = 100, W = 100, H = 60;
  const pts = data.map((d, i) => ({ x:(i/(data.length-1))*W, y:H-(d.score/max)*H, score:d.score, date:d.date }));
  const path = pts.map((p,i) => `${i===0?"M":"L"}${p.x},${p.y}`).join(" ");
  const area = `${path} L${pts[pts.length-1].x},${H} L0,${H} Z`;
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:130, overflow:"visible" }}>
        <defs>
          <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity=".22"/>
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0"/>
          </linearGradient>
        </defs>
        {[25,50,75].map(y => (
          <line key={y} x1={0} y1={H-(y/max)*H} x2={W} y2={H-(y/max)*H}
            stroke="rgba(255,255,255,.04)" strokeWidth=".5" strokeDasharray="2,3"/>
        ))}
        <path d={area} fill="url(#tg)"/>
        <path d={path} fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        {pts.map((p,i) => <circle key={i} cx={p.x} cy={p.y} r="2" fill={scoreColor(p.score)}/>)}
      </svg>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
        {pts.map((p,i) => <span key={i} style={{ fontSize:".6rem", color:"var(--ink-4)" }}>{p.date}</span>)}
      </div>
    </div>
  );
}

function SubjectBar({ name, avg, attempts, rank }) {
  const color = scoreColor(avg);
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5, alignItems:"center", flexWrap:"wrap", gap:4 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:".67rem", color:"var(--ink-4)", fontWeight:700, background:"var(--bg-overlay)", borderRadius:5, padding:"1px 6px", fontFamily:"var(--font-mono)" }}>#{rank}</span>
          <span style={{ fontSize:".84rem", color:"var(--ink)", fontWeight:500, maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{name}</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:".7rem", color:"var(--ink-3)" }}>{attempts} quiz{attempts !== 1 ? "zes" : ""}</span>
          <span style={{ fontFamily:"var(--font-display)", fontStyle:"italic", color, fontSize:"1.05rem" }}>{avg}%</span>
        </div>
      </div>
      <div style={{ height:3, background:"var(--bg-overlay)", borderRadius:99, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${avg}%`, borderRadius:99, background:color, transition:"width 1.2s cubic-bezier(0.16,1,0.3,1)" }}/>
      </div>
    </div>
  );
}

/* Simple GitHub-style activity heatmap using quiz attempt dates */
function ActivityHeatmap({ attempts }) {
  const weeks = 14;
  const today = new Date();
  const cells = [];
  for (let w = weeks - 1; w >= 0; w--) {
    for (let d = 0; d < 7; d++) {
      const dt = new Date(today);
      dt.setDate(today.getDate() - (w * 7 + (6 - d)));
      cells.push(dt.toISOString().split("T")[0]);
    }
  }
  const countMap = {};
  (attempts || []).forEach(a => {
    const day = (a.attempt_date || "").split("T")[0];
    if (day) countMap[day] = (countMap[day] || 0) + 1;
  });
  const getColor = (date) => {
    const c = countMap[date] || 0;
    if (c === 0) return "var(--bg-4)";
    if (c === 1) return "rgba(200,164,90,.25)";
    if (c === 2) return "rgba(200,164,90,.50)";
    if (c === 3) return "rgba(200,164,90,.75)";
    return "var(--gold)";
  };
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:`repeat(${weeks},1fr)`, gap:3 }}>
        {Array.from({ length: weeks }).map((_, wi) => (
          <div key={wi} style={{ display:"grid", gridTemplateRows:"repeat(7,1fr)", gap:3 }}>
            {cells.slice(wi * 7, wi * 7 + 7).map((date) => (
              <div key={date} className="heat-cell" style={{ background:getColor(date) }} title={`${date}: ${countMap[date] || 0} quiz${countMap[date] !== 1 ? "zes" : ""}`}/>
            ))}
          </div>
        ))}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:10, justifyContent:"flex-end" }}>
        <span style={{ fontSize:".63rem", color:"var(--ink-4)" }}>Less</span>
        {["var(--bg-4)","rgba(200,164,90,.25)","rgba(200,164,90,.5)","rgba(200,164,90,.75)","var(--gold)"].map(c => (
          <div key={c} style={{ width:9, height:9, borderRadius:2, background:c }}/>
        ))}
        <span style={{ fontSize:".63rem", color:"var(--ink-4)" }}>More</span>
      </div>
    </div>
  );
}

export default function Analytics() {
  const navigate = useNavigate();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPersonalAnalytics()
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div>
      <PageHeader title="Performance" accent="Analytics" accentColor="var(--ruby)" sub="Your personal learning intelligence dashboard"/>
      <SkeletonStats count={4}/>
    </div>
  );

  if (!data || data.total_attempts === 0) return (
    <div>
      <PageHeader title="Performance" accent="Analytics" accentColor="var(--ruby)" sub="Your personal learning intelligence dashboard"/>
      <div className="glass" style={{ padding:"56px 24px", textAlign:"center" }}>
        <p style={{ color:"var(--ink-3)", marginBottom:20, fontSize:".9rem" }}>No quiz data yet. Take some quizzes to unlock your analytics!</p>
        <button className="btn-glow" onClick={() => navigate("/generate-quiz")}>Generate First Quiz</button>
      </div>
    </div>
  );

  const { total_attempts, overall_avg, total_notes, best_subject, best_subject_score,
          trend, subject_performance, difficulty_breakdown } = data;
  const totalDiff = (difficulty_breakdown.strong + difficulty_breakdown.average + difficulty_breakdown.weak) || 1;
  const breakdown = [
    { label:"Strong (≥80%)",    count:difficulty_breakdown.strong,  color:"var(--jade)"     },
    { label:"Average (50–79%)", count:difficulty_breakdown.average, color:"var(--gold)"     },
    { label:"Weak (<50%)",      count:difficulty_breakdown.weak,    color:"var(--ruby)"     },
  ];

  return (
    <div>
      <style>{`
        .analytics-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
        @media(max-width:767px){.analytics-grid{grid-template-columns:1fr;}.kpi-row{grid-template-columns:repeat(2,1fr)!important;}}
        @media(max-width:400px){.kpi-row{grid-template-columns:1fr 1fr!important;}}
      `}</style>

      <PageHeader title="Performance" accent="Analytics" accentColor="var(--ruby)" sub="Your personal learning intelligence dashboard"/>

      {/* KPIs */}
      <div className="kpi-row fade-up" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
        {[
          { label:"Total Attempts", value:total_attempts,           color:"var(--gold)"     },
          { label:"Overall Average",value:`${overall_avg}%`,        color:scoreColor(overall_avg) },
          { label:"Notes Created",  value:total_notes,              color:"var(--sapphire)" },
          { label:"Best Score",     value:`${best_subject_score}%`, color:"var(--jade)", sub: best_subject ? best_subject.split(" ").slice(0,3).join(" ") : "—" },
        ].map((k, i) => (
          <div key={i} className="glass" style={{ padding:"18px 16px", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:1.5, background:k.color, opacity:.7 }}/>
            <div style={{ fontFamily:"var(--font-display)", fontStyle:"italic", fontSize:"1.9rem", color:k.color, lineHeight:1, marginBottom:k.sub?4:7 }}>{k.value}</div>
            {k.sub && <div style={{ fontSize:".7rem", color:"var(--ink-3)", marginBottom:5, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{k.sub}</div>}
            <div style={{ color:"var(--ink-4)", fontSize:".65rem", textTransform:"uppercase", letterSpacing:".07em", fontWeight:700 }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div className="analytics-grid" style={{ marginBottom:16 }}>
        {/* Trend */}
        <div className="glass fade-up" style={{ padding:"22px" }}>
          <div style={{ marginBottom:16 }}>
            <h3 style={{ fontWeight:600, color:"var(--ink)", fontSize:".93rem", marginBottom:2 }}>Score Trend</h3>
            <p style={{ color:"var(--ink-3)", fontSize:".76rem" }}>Last {trend.length} quiz attempts</p>
          </div>
          <TrendChart data={trend}/>
        </div>

        {/* Breakdown */}
        <div className="glass fade-up" style={{ padding:"22px" }}>
          <div style={{ marginBottom:18 }}>
            <h3 style={{ fontWeight:600, color:"var(--ink)", fontSize:".93rem", marginBottom:2 }}>Result Breakdown</h3>
            <p style={{ color:"var(--ink-3)", fontSize:".76rem" }}>How your quizzes scored</p>
          </div>
          {breakdown.map(d => (
            <div key={d.label} style={{ marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontSize:".81rem", color:"var(--ink-2)" }}>{d.label}</span>
                <span style={{ fontFamily:"var(--font-display)", fontStyle:"italic", color:d.color, fontSize:"1.05rem" }}>{d.count}</span>
              </div>
              <div style={{ height:3, background:"var(--bg-overlay)", borderRadius:99, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${d.count/totalDiff*100}%`, borderRadius:99, background:d.color, transition:"width 1.2s cubic-bezier(0.16,1,0.3,1)" }}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity heatmap */}
      <div className="glass fade-up" style={{ padding:"22px", marginBottom:16 }}>
        <div style={{ marginBottom:16 }}>
          <h3 style={{ fontWeight:600, color:"var(--ink)", fontSize:".93rem", marginBottom:2 }}>Study Activity</h3>
          <p style={{ color:"var(--ink-3)", fontSize:".76rem" }}>Last 14 weeks of quiz activity</p>
        </div>
        <ActivityHeatmap attempts={data.trend}/>
      </div>

      {/* Subject performance */}
      {subject_performance.length > 0 && (
        <div className="glass fade-up" style={{ padding:"22px" }}>
          <div style={{ marginBottom:18 }}>
            <h3 style={{ fontWeight:600, color:"var(--ink)", fontSize:".93rem", marginBottom:2 }}>Subject Performance</h3>
            <p style={{ color:"var(--ink-3)", fontSize:".76rem" }}>Ranked by average score</p>
          </div>
          {subject_performance.map((s, i) => (
            <SubjectBar key={i} name={s.subject} avg={s.avg} attempts={s.attempts} rank={i+1}/>
          ))}
        </div>
      )}
    </div>
  );
}