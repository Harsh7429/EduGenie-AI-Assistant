import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPersonalAnalytics } from "../services/api";

const scoreColor = (s) => s >= 80 ? "var(--emerald)" : s >= 50 ? "var(--amber)" : "var(--rose)";
const scoreBg    = (s) => s >= 80 ? "var(--emerald-dim)" : s >= 50 ? "var(--amber-dim)" : "var(--rose-dim)";

function TrendChart({ data }) {
  if (!data || data.length < 2) return (
    <div style={{ textAlign:"center", padding:"40px 0", color:"var(--ink-4)" }}>
      <div style={{ fontSize:"1.5rem", marginBottom:8 }}>∿</div>
      <p style={{ fontSize:"0.82rem" }}>Complete more quizzes to see your trend.</p>
    </div>
  );

  const max = 100;
  const W = 100, H = 60;
  const pts = data.map((d,i) => ({
    x: (i / (data.length-1)) * W,
    y: H - (d.score / max) * H,
    score: d.score,
    date: d.date,
  }));
  const path = pts.map((p,i) => `${i===0?"M":"L"}${p.x},${p.y}`).join(" ");
  const area = `${path} L${pts[pts.length-1].x},${H} L0,${H} Z`;

  return (
    <div style={{ position:"relative" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:150, overflow:"visible" }}>
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25"/>
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/>
          </linearGradient>
        </defs>
        {[25,50,75].map(y => (
          <line key={y} x1={0} y1={H-(y/max)*H} x2={W} y2={H-(y/max)*H}
            stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" strokeDasharray="2,3"/>
        ))}
        <path d={area} fill="url(#trendGrad)"/>
        <path d={path} fill="none" stroke="#f59e0b" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round"/>
        {pts.map((p,i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2" fill={scoreColor(p.score)}
            style={{ filter:`drop-shadow(0 0 3px ${p.score>=80?"#34d399":p.score>=50?"#f59e0b":"#fb7185"})` }}/>
        ))}
      </svg>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
        {pts.map((p,i) => (
          <span key={i} style={{ fontSize:"0.62rem", color:"var(--ink-4)" }}>{p.date}</span>
        ))}
      </div>
    </div>
  );
}

function SubjectBar({ name, avg, attempts, rank }) {
  const color = scoreColor(avg);
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{
            fontSize:"0.68rem", color:"var(--ink-4)", fontWeight:700,
            background:"var(--bg-overlay)", borderRadius:5, padding:"1px 6px",
            fontFamily:"var(--font-mono)",
          }}>#{rank}</span>
          <span style={{
            fontSize:"0.85rem", color:"var(--ink)", fontWeight:500,
            maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
          }}>{name}</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
          <span style={{ fontSize:"0.72rem", color:"var(--ink-3)" }}>{attempts} quiz{attempts!==1?"zes":""}</span>
          <span style={{
            fontFamily:"var(--font-display)", fontStyle:"italic",
            fontWeight:400, color, fontSize:"1.05rem",
          }}>{avg}%</span>
        </div>
      </div>
      <div style={{ height:3, background:"var(--bg-overlay)", borderRadius:99, overflow:"hidden" }}>
        <div style={{
          height:"100%", width:`${avg}%`, borderRadius:99,
          background:color,
          boxShadow:`0 0 8px ${avg>=80?"rgba(52,211,153,0.4)":avg>=50?"rgba(245,158,11,0.4)":"rgba(251,113,133,0.4)"}`,
          transition:"width 1.2s cubic-bezier(0.16,1,0.3,1)",
        }}/>
      </div>
    </div>
  );
}

export default function Analytics() {
  const [data, setData]       = useState(null);
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
      <p style={{ color:"var(--ink-3)", fontSize:"0.88rem" }}>Analysing your performance…</p>
    </div>
  );

  if (!data || data.total_attempts === 0) return (
    <div>
      <div style={{ marginBottom:36 }}>
        <h1 style={{
          fontFamily:"var(--font-display)", fontStyle:"italic",
          fontSize:"2.4rem", color:"var(--ink)", marginBottom:8,
        }}>
          Performance <span style={{ color:"var(--amber)" }}>Analytics</span>
        </h1>
        <p style={{ color:"var(--ink-3)", fontSize:"0.92rem" }}>Your personal learning intelligence dashboard</p>
      </div>
      <div className="glass" style={{ padding:64, textAlign:"center" }}>
        <div style={{ fontSize:"2.5rem", marginBottom:16, opacity:0.5 }}>∿</div>
        <p style={{ color:"var(--ink-3)", marginBottom:24, fontSize:"0.92rem" }}>
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

  const kpis = [
    { label:"Total Attempts",  value:total_attempts,          color:"var(--amber)" },
    { label:"Overall Average", value:`${overall_avg}%`,       color:scoreColor(overall_avg) },
    { label:"Notes Created",   value:total_notes,             color:"var(--teal)" },
    { label:"Best Score",      value:`${best_subject_score}%`,color:"var(--emerald)",
      sub: best_subject ? best_subject.split(" ").slice(0,3).join(" ") : "—" },
  ];

  const breakdown = [
    { label:"Strong (≥80%)",   count:difficulty_breakdown.strong,  color:"var(--emerald)" },
    { label:"Average (50–79%)",count:difficulty_breakdown.average, color:"var(--amber)" },
    { label:"Weak (<50%)",     count:difficulty_breakdown.weak,    color:"var(--rose)" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="fade-up" style={{ marginBottom:36 }}>
        <h1 style={{
          fontFamily:"var(--font-display)", fontStyle:"italic",
          fontSize:"2.4rem", color:"var(--ink)", marginBottom:8,
        }}>
          Performance <span style={{ color:"var(--amber)" }}>Analytics</span>
        </h1>
        <p style={{ color:"var(--ink-3)", fontSize:"0.92rem" }}>Your personal learning intelligence dashboard</p>
      </div>

      {/* KPI row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
        {kpis.map((k,i) => (
          <div key={i} className="glass fade-up pulse-glow" style={{ padding:22, animationDelay:`${i*0.07}s`, position:"relative", overflow:"hidden" }}>
            <div style={{
              position:"absolute", top:0, left:0, right:0, height:2,
              background:k.color, opacity:0.7,
            }}/>
            <div style={{
              fontFamily:"var(--font-display)", fontStyle:"italic",
              fontSize:"2rem", color:k.color, lineHeight:1, marginBottom:k.sub?4:8,
            }}>{k.value}</div>
            {k.sub && <div style={{ fontSize:"0.72rem", color:"var(--ink-3)", marginBottom:6 }}>{k.sub}</div>}
            <div style={{ color:"var(--ink-4)", fontSize:"0.68rem", textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:700 }}>
              {k.label}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:18 }}>
        {/* Trend chart */}
        <div className="glass fade-up" style={{ padding:24 }}>
          <div style={{ marginBottom:18 }}>
            <h3 style={{ fontWeight:600, color:"var(--ink)", fontSize:"0.95rem", marginBottom:3 }}>Score Trend</h3>
            <p style={{ color:"var(--ink-3)", fontSize:"0.78rem" }}>Last {trend.length} quiz attempts</p>
          </div>
          <TrendChart data={trend} />
        </div>

        {/* Breakdown */}
        <div className="glass fade-up" style={{ padding:24 }}>
          <div style={{ marginBottom:20 }}>
            <h3 style={{ fontWeight:600, color:"var(--ink)", fontSize:"0.95rem", marginBottom:3 }}>Result Breakdown</h3>
            <p style={{ color:"var(--ink-3)", fontSize:"0.78rem" }}>How your quizzes scored</p>
          </div>

          {breakdown.map(d => (
            <div key={d.label} style={{ marginBottom:18 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7, alignItems:"center" }}>
                <span style={{ fontSize:"0.82rem", color:"var(--ink-2)" }}>{d.label}</span>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{
                    fontFamily:"var(--font-display)", fontStyle:"italic",
                    color:d.color, fontSize:"1.1rem",
                  }}>{d.count}</span>
                  <span style={{ fontSize:"0.72rem", color:"var(--ink-3)" }}>
                    ({Math.round(d.count/totalDiff*100)}%)
                  </span>
                </div>
              </div>
              <div style={{ height:3, background:"var(--bg-overlay)", borderRadius:99, overflow:"hidden" }}>
                <div style={{
                  height:"100%", width:`${d.count/totalDiff*100}%`, borderRadius:99,
                  background:d.color, transition:"width 1.2s cubic-bezier(0.16,1,0.3,1)",
                }}/>
              </div>
            </div>
          ))}

          {/* Mini donuts */}
          <div style={{ display:"flex", gap:20, marginTop:24, justifyContent:"center" }}>
            {breakdown.map(d => {
              const pct = Math.round(d.count/totalDiff*100);
              return (
                <div key={d.label} style={{ textAlign:"center" }}>
                  <div style={{
                    width:52, height:52, borderRadius:"50%", margin:"0 auto 6px",
                    background:`conic-gradient(${d.color} ${pct*3.6}deg, var(--bg-overlay) 0deg)`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                  }}>
                    <div style={{
                      width:36, height:36, borderRadius:"50%", background:"var(--bg-raised)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontFamily:"var(--font-display)", fontStyle:"italic",
                      fontWeight:400, fontSize:"0.78rem", color:d.color,
                    }}>{pct}%</div>
                  </div>
                  <div style={{ fontSize:"0.68rem", color:"var(--ink-4)" }}>
                    {d.label.split(" ")[0]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Subject performance */}
      {subject_performance.length > 0 && (
        <div className="glass fade-up" style={{ padding:28 }}>
          <div style={{ marginBottom:22 }}>
            <h3 style={{ fontWeight:600, color:"var(--ink)", fontSize:"0.95rem", marginBottom:3 }}>Subject Performance</h3>
            <p style={{ color:"var(--ink-3)", fontSize:"0.78rem" }}>Ranked by average score</p>
          </div>
          {subject_performance.map((s,i) => (
            <SubjectBar key={i} name={s.subject} avg={s.avg} attempts={s.attempts} rank={i+1} />
          ))}
        </div>
      )}

      <style>{`
        @media(max-width:767px){
          [style*="repeat(4,1fr)"]{grid-template-columns:repeat(2,1fr)!important;}
          [style*="1fr 1fr"]{grid-template-columns:1fr!important;}
        }
      `}</style>
    </div>
  );
}
