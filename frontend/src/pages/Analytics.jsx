import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPersonalAnalytics } from "../services/api";

const scoreColor = (s) => s >= 80 ? "#34d399" : s >= 50 ? "#fbbf24" : "#f87171";

function TrendChart({ data }) {
  if (!data || data.length < 2) return (
    <div style={{ textAlign:"center", padding:"40px 0", color:"#334155" }}>
      <p>Complete more quizzes to see your trend.</p>
    </div>
  );

  const max = 100;
  const W = 100, H = 60;
  const pts = data.map((d,i) => ({
    x: (i / (data.length-1)) * W,
    y: H - (d.score / max) * H,
    score: d.score,
    date: d.date,
    subject: d.subject,
  }));
  const path = pts.map((p,i) => `${i===0?"M":"L"}${p.x},${p.y}`).join(" ");
  const area = `${path} L${pts[pts.length-1].x},${H} L0,${H} Z`;

  return (
    <div style={{ position:"relative" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:160, overflow:"visible" }}>
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[25,50,75].map(y => (
          <line key={y} x1={0} y1={H-(y/max)*H} x2={W} y2={H-(y/max)*H}
            stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>
        ))}
        {/* Area */}
        <path d={area} fill="url(#trendGrad)"/>
        {/* Line */}
        <path d={path} fill="none" stroke="#6366f1" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round"/>
        {/* Dots */}
        {pts.map((p,i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="1.5" fill={scoreColor(p.score)}
              style={{ filter:`drop-shadow(0 0 3px ${scoreColor(p.score)})` }}/>
          </g>
        ))}
      </svg>
      {/* X labels */}
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
        {pts.map((p,i) => (
          <span key={i} style={{ fontSize:"0.65rem", color:"#334155" }}>{p.date}</span>
        ))}
      </div>
    </div>
  );
}

function SubjectBar({ name, avg, attempts, rank }) {
  const color = scoreColor(avg);
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5, alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:"0.7rem", color:"#334155", fontWeight:700, width:18, textAlign:"center",
            background:"rgba(255,255,255,0.05)", borderRadius:4, padding:"1px 4px" }}>#{rank}</span>
          <span style={{ fontSize:"0.85rem", color:"#e2e8f0", fontWeight:600,
            maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {name}
          </span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:"0.72rem", color:"#475569" }}>{attempts} attempts</span>
          <span style={{ fontWeight:800, color, fontSize:"0.88rem" }}>{avg}%</span>
        </div>
      </div>
      <div style={{ height:6, background:"rgba(255,255,255,0.06)", borderRadius:99, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${avg}%`, borderRadius:99,
          background:`linear-gradient(90deg,${color}88,${color})`,
          boxShadow:`0 0 8px ${color}66`, transition:"width 1.2s ease" }}/>
      </div>
    </div>
  );
}

export default function Analytics() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getPersonalAnalytics()
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ padding:"100px 0", textAlign:"center" }}>
      <div className="loader" style={{ marginBottom:16 }}/>
      <p style={{ color:"#475569" }}>Analysing your performance...</p>
    </div>
  );

  if (!data || data.total_attempts === 0) return (
    <div>
      <h1 className="title-font" style={{ fontSize:"2.4rem", letterSpacing:"-0.03em", marginBottom:8 }}>
        Performance <span style={{ background:"linear-gradient(135deg,#f472b6,#818cf8)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Analytics</span>
      </h1>
      <div className="glass" style={{ padding:64, textAlign:"center", marginTop:40 }}>
        <div style={{ fontSize:"3rem", marginBottom:16 }}>📊</div>
        <p style={{ color:"#475569", marginBottom:24 }}>
          No quiz data yet. Take some quizzes to unlock your analytics!
        </p>
        <button className="btn-glow" onClick={() => navigate("/generate-quiz")}
          style={{ padding:"10px 28px" }}>
          Generate First Quiz
        </button>
      </div>
    </div>
  );

  const { total_attempts, overall_avg, total_notes, best_subject, best_subject_score,
          trend, subject_performance, difficulty_breakdown } = data;
  const totalDiff = (difficulty_breakdown.strong + difficulty_breakdown.average + difficulty_breakdown.weak) || 1;

  return (
    <div>
      {/* Header */}
      <div className="fade-up" style={{ marginBottom:36 }}>
        <h1 className="title-font" style={{ fontSize:"2.4rem", letterSpacing:"-0.03em", marginBottom:8 }}>
          Performance <span style={{ background:"linear-gradient(135deg,#f472b6,#818cf8)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Analytics</span>
        </h1>
        <p style={{ color:"#64748b", fontSize:"0.95rem" }}>Your personal learning intelligence dashboard</p>
      </div>

      {/* KPI row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:28 }}>
        {[
          { label:"Total Attempts", value: total_attempts,        icon:"🧠", color:"#818cf8" },
          { label:"Overall Average",value: `${overall_avg}%`,     icon:"📊", color: scoreColor(overall_avg) },
          { label:"Notes Created",  value: total_notes,           icon:"📝", color:"#22d3ee" },
          { label:"Best Subject",   value: best_subject_score+"%", icon:"🏆", color:"#fbbf24",
            sub: best_subject ? best_subject.split(" ").slice(0,2).join(" ") : "—" },
        ].map((k,i) => (
          <div key={i} className="glass fade-up pulse-glow" style={{ padding:22, animationDelay:`${i*0.07}s` }}>
            <div style={{ fontSize:"1.5rem", marginBottom:8 }}>{k.icon}</div>
            <div className="title-font" style={{ fontSize:"1.9rem", color:k.color, lineHeight:1 }}>{k.value}</div>
            {k.sub && <div style={{ fontSize:"0.72rem", color:"#64748b", marginTop:2 }}>{k.sub}</div>}
            <div style={{ color:"#475569", fontSize:"0.72rem", marginTop:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>
              {k.label}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
        {/* Trend chart */}
        <div className="glass fade-up" style={{ padding:24 }}>
          <h3 style={{ fontWeight:700, marginBottom:4, fontSize:"1rem" }}>Score Trend</h3>
          <p style={{ color:"#475569", fontSize:"0.78rem", marginBottom:20 }}>Last {trend.length} quiz attempts</p>
          <TrendChart data={trend} />
        </div>

        {/* Difficulty breakdown */}
        <div className="glass fade-up" style={{ padding:24 }}>
          <h3 style={{ fontWeight:700, marginBottom:4, fontSize:"1rem" }}>Result Breakdown</h3>
          <p style={{ color:"#475569", fontSize:"0.78rem", marginBottom:24 }}>How your quizzes scored</p>

          {[
            { label:"Strong (≥80%)",   count: difficulty_breakdown.strong,  color:"#34d399" },
            { label:"Average (50–79%)",count: difficulty_breakdown.average, color:"#fbbf24" },
            { label:"Weak (<50%)",     count: difficulty_breakdown.weak,    color:"#f87171" },
          ].map(d => (
            <div key={d.label} style={{ marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontSize:"0.83rem", color:"#94a3b8" }}>{d.label}</span>
                <span style={{ fontWeight:700, color:d.color, fontSize:"0.83rem" }}>
                  {d.count} ({Math.round(d.count/totalDiff*100)}%)
                </span>
              </div>
              <div style={{ height:8, background:"rgba(255,255,255,0.06)", borderRadius:99, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${d.count/totalDiff*100}%`, borderRadius:99,
                  background:d.color, boxShadow:`0 0 8px ${d.color}66`, transition:"width 1.2s ease" }}/>
              </div>
            </div>
          ))}

          {/* Donut summary */}
          <div style={{ display:"flex", gap:16, marginTop:20, justifyContent:"center" }}>
            {[
              { label:"Strong",  color:"#34d399", pct: Math.round(difficulty_breakdown.strong/totalDiff*100) },
              { label:"Average", color:"#fbbf24", pct: Math.round(difficulty_breakdown.average/totalDiff*100) },
              { label:"Weak",    color:"#f87171", pct: Math.round(difficulty_breakdown.weak/totalDiff*100) },
            ].map(d => (
              <div key={d.label} style={{ textAlign:"center" }}>
                <div style={{ width:56, height:56, borderRadius:"50%", margin:"0 auto 6px",
                  background:`conic-gradient(${d.color} ${d.pct*3.6}deg, rgba(255,255,255,0.05) 0deg)`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  boxShadow:`0 0 12px ${d.color}44` }}>
                  <div style={{ width:38, height:38, borderRadius:"50%", background:"#080b14",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontWeight:800, fontSize:"0.72rem", color:d.color }}>
                    {d.pct}%
                  </div>
                </div>
                <div style={{ fontSize:"0.7rem", color:"#475569" }}>{d.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subject performance */}
      {subject_performance.length > 0 && (
        <div className="glass fade-up" style={{ padding:28 }}>
          <h3 style={{ fontWeight:700, marginBottom:4, fontSize:"1rem" }}>Subject Performance</h3>
          <p style={{ color:"#475569", fontSize:"0.78rem", marginBottom:24 }}>Ranked by average score</p>
          {subject_performance.map((s,i) => (
            <SubjectBar key={i} name={s.subject} avg={s.avg} attempts={s.attempts} rank={i+1} />
          ))}
        </div>
      )}
    </div>
  );
}
