import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPersonalAnalytics } from "../services/api";
import PageHeader from "../components/PageHeader";
import { SkeletonStats } from "../components/SkeletonCard";

const sc = s => s>=80?"var(--teal)":s>=50?"var(--amber)":"var(--coral)";

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

export default function Analytics() {
  const navigate=useNavigate();
  const [data,setData]=useState(null); const [loading,setLoading]=useState(true);
  useEffect(()=>{ getPersonalAnalytics().then(r=>setData(r.data)).catch(()=>{}).finally(()=>setLoading(false)); },[]);
  if(loading) return <div><PageHeader title="Performance" accent="Analytics" accentColor="var(--coral)"/><SkeletonStats count={4}/></div>;
  if(!data||data.total_attempts===0) return (
    <div>
      <PageHeader title="Performance" accent="Analytics" accentColor="var(--coral)" sub="Your personal learning intelligence dashboard"/>
      <div className="glass" style={{ padding:"48px 24px",textAlign:"center" }}><p style={{ color:"var(--ink-3)",marginBottom:18,fontSize:13 }}>No quiz data yet.</p><button className="btn-glow" onClick={()=>navigate("/generate-quiz")}>Generate First Quiz</button></div>
    </div>
  );
  const { total_attempts,overall_avg,total_notes,best_subject,best_subject_score,trend,subject_performance,difficulty_breakdown } = data;
  const total=(difficulty_breakdown.strong+difficulty_breakdown.average+difficulty_breakdown.weak)||1;
  return (
    <div>
      <style>{`.ag2{display:grid;grid-template-columns:1fr 1fr;gap:14px;}.kpi4{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;}@media(max-width:860px){.kpi4{grid-template-columns:1fr 1fr!important;}}.@media(max-width:767px){.ag2{grid-template-columns:1fr!important;}}`}</style>
      <PageHeader title="Performance" accent="Analytics" accentColor="var(--coral)" sub="Your personal learning intelligence dashboard"/>
      <div className="kpi4 fade-up" style={{ marginBottom:14 }}>
        {[
          { label:"Total Attempts",  v:total_attempts,           c:"var(--amber)"  },
          { label:"Overall Average", v:`${overall_avg}%`,        c:sc(overall_avg) },
          { label:"Notes Created",   v:total_notes,              c:"var(--blue)"   },
          { label:"Best Score",      v:`${best_subject_score}%`, c:"var(--teal)",  sub:best_subject?.split(" ").slice(0,2).join(" ") },
        ].map((k,i)=>(
          <div key={i} className="glass card-stripe" style={{ padding:"16px 15px", [`--stripe-color`]:k.c }}>
            <style>{`.glass.card-stripe[style*="--stripe-color:${k.c}"]::before{background:${k.c};}`}</style>
            <div style={{ fontFamily:"var(--font-body)",fontSize:28,fontWeight:500,color:k.c,lineHeight:1,marginBottom:k.sub?3:6,letterSpacing:"-.02em" }}>{k.v}</div>
            {k.sub&&<div style={{ fontSize:11,color:"var(--ink-3)",marginBottom:5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{k.sub}</div>}
            <div style={{ color:"var(--ink-4)",fontSize:10,textTransform:"uppercase",letterSpacing:".08em",fontWeight:500 }}>{k.label}</div>
          </div>
        ))}
      </div>
      <div className="ag2 fade-up" style={{ marginBottom:12 }}>
        <div className="glass" style={{ padding:"18px" }}>
          <div style={{ fontWeight:500,fontSize:13,color:"var(--ink)",marginBottom:3 }}>Score Trend</div>
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
      <div className="glass fade-up" style={{ padding:"18px",marginBottom:12 }}>
        <div style={{ fontWeight:500,fontSize:13,color:"var(--ink)",marginBottom:3 }}>Study Activity</div>
        <p style={{ color:"var(--ink-3)",fontSize:12,marginBottom:14 }}>Last 14 weeks</p>
        <ActivityHeatmap trend={trend}/>
      </div>
      {subject_performance.length>0&&(
        <div className="glass fade-up" style={{ padding:"18px" }}>
          <div style={{ fontWeight:500,fontSize:13,color:"var(--ink)",marginBottom:3 }}>Subject Performance</div>
          <p style={{ color:"var(--ink-3)",fontSize:12,marginBottom:16 }}>Ranked by average score</p>
          {subject_performance.map((s,i)=>(
            <div key={i} style={{ marginBottom:13 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5,flexWrap:"wrap",gap:4 }}>
                <div style={{ display:"flex",alignItems:"center",gap:7 }}>
                  <span style={{ fontSize:10,color:"var(--ink-4)",fontWeight:600,background:"var(--bg-overlay)",borderRadius:4,padding:"1px 6px",fontFamily:"var(--font-mono)" }}>#{i+1}</span>
                  <span style={{ fontSize:13,color:"var(--ink)",fontWeight:500,maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{s.subject}</span>
                </div>
                <div style={{ display:"flex",alignItems:"center",gap:9 }}>
                  <span style={{ fontSize:11,color:"var(--ink-4)" }}>{s.attempts} quiz{s.attempts!==1?"zes":""}</span>
                  <span style={{ fontSize:16,fontWeight:500,color:sc(s.avg) }}>{s.avg}%</span>
                </div>
              </div>
              <div className="prog-track"><div className="prog-fill" style={{ width:`${s.avg}%`,background:sc(s.avg) }}/></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}