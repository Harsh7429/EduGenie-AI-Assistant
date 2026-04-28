import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPersonalAnalytics } from "../services/api";
import PageHeader from "../components/PageHeader";
import { SkeletonStats } from "../components/SkeletonCard";

const sc = s => s >= 80 ? "var(--jade)" : s >= 50 ? "var(--gold)" : "var(--ruby)";

function TrendChart({ data }) {
  if (!data || data.length < 2) return (
    <div style={{ textAlign:"center", padding:"40px 0", color:"var(--ink-4)", fontSize:".83rem" }}>Complete more quizzes to see your trend.</div>
  );
  const W=100, H=60;
  const pts = data.map((d,i) => ({ x:(i/(data.length-1))*W, y:H-(d.score/100)*H, score:d.score, date:d.date }));
  const path = pts.map((p,i) => `${i===0?"M":"L"}${p.x},${p.y}`).join(" ");
  const area = `${path} L${pts[pts.length-1].x},${H} L0,${H} Z`;
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:130, overflow:"visible" }}>
        <defs>
          <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity=".20"/>
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0"/>
          </linearGradient>
        </defs>
        {[25,50,75].map(y=><line key={y} x1={0} y1={H-(y/100)*H} x2={W} y2={H-(y/100)*H} stroke="rgba(255,255,255,.04)" strokeWidth=".5" strokeDasharray="2,3"/>)}
        <path d={area} fill="url(#tg)"/>
        <path d={path} fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        {pts.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="2" fill={sc(p.score)}/>)}
      </svg>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
        {pts.map((p,i)=><span key={i} style={{ fontSize:".58rem", color:"var(--ink-4)" }}>{p.date}</span>)}
      </div>
    </div>
  );
}

function ActivityHeatmap({ trend }) {
  const weeks=14;
  const today=new Date();
  const cells=[];
  for (let w=weeks-1;w>=0;w--) for (let d=0;d<7;d++) {
    const dt=new Date(today); dt.setDate(today.getDate()-(w*7+(6-d)));
    cells.push(dt.toISOString().split("T")[0]);
  }
  const countMap={};
  (trend||[]).forEach(a=>{ const day=(a.date||"").split(" ").pop(); if(day) countMap[day]=(countMap[day]||0)+1; });
  const gc=date=>{ const c=countMap[date]||0; if(!c) return "var(--bg-4)"; if(c===1) return "rgba(212,146,42,.25)"; if(c===2) return "rgba(212,146,42,.50)"; if(c===3) return "rgba(212,146,42,.75)"; return "var(--gold)"; };
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:`repeat(${weeks},1fr)`, gap:3 }}>
        {Array.from({length:weeks}).map((_,wi)=>(
          <div key={wi} style={{ display:"grid", gridTemplateRows:"repeat(7,1fr)", gap:3 }}>
            {cells.slice(wi*7,wi*7+7).map(date=>(
              <div key={date} className="heat-cell" style={{ background:gc(date) }} title={`${date}: ${countMap[date]||0} quizzes`}/>
            ))}
          </div>
        ))}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:10, justifyContent:"flex-end" }}>
        <span style={{ fontSize:".6rem", color:"var(--ink-4)" }}>Less</span>
        {["var(--bg-4)","rgba(212,146,42,.25)","rgba(212,146,42,.5)","rgba(212,146,42,.75)","var(--gold)"].map(c=>(
          <div key={c} style={{ width:9, height:9, borderRadius:2, background:c }}/>
        ))}
        <span style={{ fontSize:".6rem", color:"var(--ink-4)" }}>More</span>
      </div>
    </div>
  );
}

export default function Analytics() {
  const navigate=useNavigate();
  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{ getPersonalAnalytics().then(r=>setData(r.data)).catch(()=>{}).finally(()=>setLoading(false)); },[]);

  if (loading) return <div><PageHeader title="Performance" accent="Analytics" accentColor="var(--ruby)"/><SkeletonStats count={4}/></div>;

  if (!data || data.total_attempts===0) return (
    <div>
      <PageHeader title="Performance" accent="Analytics" accentColor="var(--ruby)" sub="Your personal learning intelligence dashboard"/>
      <div className="glass" style={{ padding:"56px 24px", textAlign:"center" }}>
        <p style={{ color:"var(--ink-3)", marginBottom:20, fontSize:".9rem" }}>No quiz data yet. Take some quizzes to unlock your analytics!</p>
        <button className="btn-glow" onClick={()=>navigate("/generate-quiz")}>Generate First Quiz</button>
      </div>
    </div>
  );

  const { total_attempts, overall_avg, total_notes, best_subject, best_subject_score, trend, subject_performance, difficulty_breakdown } = data;
  const total = (difficulty_breakdown.strong+difficulty_breakdown.average+difficulty_breakdown.weak)||1;

  return (
    <div>
      <style>{`.ag{display:grid;grid-template-columns:1fr 1fr;gap:16px;} .kpi{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;} @media(max-width:767px){.ag{grid-template-columns:1fr!important;}.kpi{grid-template-columns:1fr 1fr!important;}}`}</style>
      <PageHeader title="Performance" accent="Analytics" accentColor="var(--ruby)" sub="Your personal learning intelligence dashboard"/>

      <div className="kpi fade-up" style={{ marginBottom:18 }}>
        {[
          { label:"Total Attempts",  v:total_attempts,           c:"var(--gold)"     },
          { label:"Overall Average", v:`${overall_avg}%`,        c:sc(overall_avg)   },
          { label:"Notes Created",   v:total_notes,              c:"var(--sapphire)" },
          { label:"Best Score",      v:`${best_subject_score}%`, c:"var(--jade)", sub:best_subject?.split(" ").slice(0,2).join(" ") },
        ].map((k,i)=>(
          <div key={i} className="glass" style={{ padding:"18px 16px", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:k.c, opacity:.7 }}/>
            <div style={{ fontFamily:"var(--font-display)", fontStyle:"italic", fontSize:"1.9rem", color:k.c, lineHeight:1, marginBottom:k.sub?4:7 }}>{k.v}</div>
            {k.sub && <div style={{ fontSize:".68rem", color:"var(--ink-3)", marginBottom:5, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{k.sub}</div>}
            <div style={{ color:"var(--ink-4)", fontSize:".63rem", textTransform:"uppercase", letterSpacing:".08em", fontWeight:700 }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div className="ag" style={{ marginBottom:16 }}>
        <div className="glass fade-up" style={{ padding:"22px" }}>
          <h3 style={{ fontWeight:600, fontSize:".9rem", color:"var(--ink)", marginBottom:3 }}>Score Trend</h3>
          <p style={{ color:"var(--ink-3)", fontSize:".75rem", marginBottom:16 }}>Last {trend.length} attempts</p>
          <TrendChart data={trend}/>
        </div>
        <div className="glass fade-up" style={{ padding:"22px" }}>
          <h3 style={{ fontWeight:600, fontSize:".9rem", color:"var(--ink)", marginBottom:3 }}>Result Breakdown</h3>
          <p style={{ color:"var(--ink-3)", fontSize:".75rem", marginBottom:18 }}>Quiz performance distribution</p>
          {[
            { label:"Strong (≥80%)",    count:difficulty_breakdown.strong,  color:"var(--jade)" },
            { label:"Average (50–79%)", count:difficulty_breakdown.average, color:"var(--gold)" },
            { label:"Weak (<50%)",      count:difficulty_breakdown.weak,    color:"var(--ruby)" },
          ].map(d=>(
            <div key={d.label} style={{ marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontSize:".82rem", color:"var(--ink-2)" }}>{d.label}</span>
                <span style={{ fontFamily:"var(--font-display)", fontStyle:"italic", color:d.color, fontSize:"1.05rem" }}>{d.count}</span>
              </div>
              <div style={{ height:3, background:"var(--bg-overlay)", borderRadius:99, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${d.count/total*100}%`, borderRadius:99, background:d.color, transition:"width 1.2s cubic-bezier(0.16,1,0.3,1)" }}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass fade-up" style={{ padding:"22px", marginBottom:16 }}>
        <h3 style={{ fontWeight:600, fontSize:".9rem", color:"var(--ink)", marginBottom:3 }}>Study Activity</h3>
        <p style={{ color:"var(--ink-3)", fontSize:".75rem", marginBottom:16 }}>Last 14 weeks</p>
        <ActivityHeatmap trend={trend}/>
      </div>

      {subject_performance.length > 0 && (
        <div className="glass fade-up" style={{ padding:"22px" }}>
          <h3 style={{ fontWeight:600, fontSize:".9rem", color:"var(--ink)", marginBottom:3 }}>Subject Performance</h3>
          <p style={{ color:"var(--ink-3)", fontSize:".75rem", marginBottom:18 }}>Ranked by average score</p>
          {subject_performance.map((s,i)=>(
            <div key={i} style={{ marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5, flexWrap:"wrap", gap:4 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:".65rem", color:"var(--ink-4)", fontWeight:800, background:"var(--bg-overlay)", borderRadius:5, padding:"1px 6px", fontFamily:"var(--font-mono)" }}>#{i+1}</span>
                  <span style={{ fontSize:".84rem", color:"var(--ink)", fontWeight:500, maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.subject}</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:".7rem", color:"var(--ink-3)" }}>{s.attempts} quiz{s.attempts!==1?"zes":""}</span>
                  <span style={{ fontFamily:"var(--font-display)", fontStyle:"italic", color:sc(s.avg), fontSize:"1.05rem" }}>{s.avg}%</span>
                </div>
              </div>
              <div style={{ height:3, background:"var(--bg-overlay)", borderRadius:99, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${s.avg}%`, borderRadius:99, background:sc(s.avg), transition:"width 1.2s cubic-bezier(0.16,1,0.3,1)" }}/>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}