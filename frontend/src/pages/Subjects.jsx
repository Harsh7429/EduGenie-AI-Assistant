import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import PageHeader from "../components/PageHeader";
import { SkeletonCard } from "../components/SkeletonCard";

const sc = s => s>=80?"var(--teal)":s>=50?"var(--amber)":s>0?"var(--coral)":"var(--ink-4)";
const sl = s => s>=80?"Mastered":s>=50?"In Progress":s>0?"Needs Work":"Not Started";

function MiniRing({ pct, size=40, color }) {
  const r=( size-6)/2, circ=2*Math.PI*r, dash=circ*(pct/100);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform:"rotate(-90deg)",flexShrink:0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg-4)" strokeWidth="4"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="4"
        strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
        style={{ transition:"stroke-dasharray 1.2s cubic-bezier(0.16,1,0.3,1)" }}/>
    </svg>
  );
}

export default function Subjects() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("all");

  useEffect(()=>{ api.get("/progress/subjects").then(r=>setSubjects(r.data)).catch(()=>{}).finally(()=>setLoading(false)); },[]);

  const mastered   = subjects.filter(s=>s.average_score>=80).length;
  const inProgress = subjects.filter(s=>s.average_score>=50&&s.average_score<80).length;
  const needsWork  = subjects.filter(s=>s.average_score>0&&s.average_score<50).length;
  const notStarted = subjects.filter(s=>s.average_score===0).length;
  const overallAvg = subjects.length ? Math.round(subjects.reduce((a,s)=>a+s.average_score,0)/subjects.length) : 0;

  const filtered = subjects.filter(s => {
    const matchSearch = !search||s.subject_name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter==="all"?true:filter==="mastered"?s.average_score>=80:filter==="inprogress"?(s.average_score>=50&&s.average_score<80):filter==="needswork"?(s.average_score>0&&s.average_score<50):s.average_score===0;
    return matchSearch&&matchFilter;
  });

  return (
    <div>
      <style>{`.sub-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:9px;}.kpi-strip{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;}@media(max-width:600px){.kpi-strip{grid-template-columns:1fr 1fr!important;}}`}</style>
      <PageHeader title="My" accent="Subjects" accentColor="var(--blue)" sub="Track your syllabus coverage and average score"/>

      {!loading&&subjects.length>0&&(
        <div className="kpi-strip fade-up" style={{ marginBottom:16 }}>
          {[
            { label:"Mastered",    count:mastered,   color:"var(--teal)"  },
            { label:"In Progress", count:inProgress, color:"var(--amber)" },
            { label:"Needs Work",  count:needsWork,  color:"var(--coral)" },
            { label:"Not Started", count:notStarted, color:"var(--ink-4)" },
          ].map(p=>(
            <div key={p.label} className="glass" style={{ padding:"13px 14px" }}>
              <div style={{ fontSize:22,fontWeight:500,color:p.color,lineHeight:1,marginBottom:4,letterSpacing:"-.02em" }}>{p.count}</div>
              <div style={{ fontSize:10,color:"var(--ink-4)",textTransform:"uppercase",letterSpacing:".08em",fontWeight:500 }}>{p.label}</div>
            </div>
          ))}
        </div>
      )}

      {!loading&&subjects.length>0&&(
        <div className="fade-up" style={{ display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"center" }}>
          <input className="glow-input" type="text" placeholder="Search subjects…" value={search} onChange={e=>setSearch(e.target.value)} style={{ maxWidth:260,flex:1 }}/>
          <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
            {[["all","All"],["mastered","Mastered"],["inprogress","In Progress"],["needswork","Needs Work"],["notstarted","Not Started"]].map(([id,lbl])=>(
              <button key={id} onClick={()=>setFilter(id)} style={{ padding:"5px 12px",borderRadius:99,cursor:"pointer",border:`0.5px solid ${filter===id?"var(--blue-border)":"var(--border-med)"}`,background:filter===id?"var(--blue-dim)":"transparent",color:filter===id?"var(--blue)":"var(--ink-3)",fontFamily:"var(--font-body)",fontSize:12,fontWeight:filter===id?500:400,transition:"all .13s",WebkitTapHighlightColor:"transparent" }}>{lbl}</button>
            ))}
          </div>
        </div>
      )}

      {loading&&<div className="sub-grid">{Array.from({length:8}).map((_,i)=><SkeletonCard key={i} rows={3} height={115}/>)}</div>}
      {!loading&&filtered.length===0&&(
        <div className="glass" style={{ padding:"48px 24px",textAlign:"center" }}>
          <p style={{ color:"var(--ink-3)",fontSize:13,marginBottom:18 }}>{search||filter!=="all"?"No subjects match.":"No subjects found."}</p>
          <button onClick={()=>navigate("/generate-quiz")} className="btn-glow">Generate a Quiz to Begin</button>
        </div>
      )}

      <div className="sub-grid">
        {filtered.map((s,i)=>{
          const score=s.average_score??0, pct=Math.round(s.progress_percentage??0), color=sc(score);
          return (
            <div key={s.subject_id} className="glass fade-up" style={{ padding:"16px 17px",animationDelay:`${i*.04}s`,position:"relative",overflow:"hidden",cursor:"pointer",transition:"border-color .13s,transform .13s,box-shadow .13s" }}
              onClick={()=>navigate("/generate-quiz")}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=`color-mix(in srgb,${color} 35%,transparent)`;e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,.28)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}>
              <div style={{ position:"absolute",top:0,left:0,right:0,height:"1.5px",background:color }}/>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12,gap:8 }}>
                <h3 style={{ fontSize:13,fontWeight:500,color:"var(--ink)",lineHeight:1.35,flex:1 }}>{s.subject_name}</h3>
                <MiniRing pct={pct} size={38} color={color}/>
              </div>
              <div style={{ marginBottom:10 }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                  <span style={{ fontSize:10,color:"var(--ink-4)",textTransform:"uppercase",letterSpacing:".08em",fontWeight:500 }}>Coverage</span>
                  <span style={{ fontSize:11,fontWeight:500,color:"var(--ink-2)",fontFamily:"var(--font-mono)" }}>{pct}%</span>
                </div>
                <div className="prog-track"><div className="prog-fill" style={{ width:`${pct}%`,background:color }}/></div>
              </div>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <div style={{ fontSize:20,fontWeight:500,color,lineHeight:1,letterSpacing:"-.02em" }}>{score>0?score.toFixed(1):"—"}<span style={{ fontSize:11,color:"var(--ink-3)",marginLeft:2,fontWeight:400 }}>avg</span></div>
                <span style={{ fontSize:10,fontWeight:600,letterSpacing:".05em",padding:"2px 8px",borderRadius:99,background:`color-mix(in srgb,${color} 12%,transparent)`,color }}>{sl(score)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {!loading&&subjects.length>0&&(
        <div className="fade-up" style={{ marginTop:16,padding:"12px 18px",borderRadius:10,border:"0.5px solid var(--border)",display:"flex",gap:22,alignItems:"center",flexWrap:"wrap" }}>
          <span style={{ fontSize:10,color:"var(--ink-4)",textTransform:"uppercase",letterSpacing:".1em",fontWeight:500 }}>Overall</span>
          <div style={{ display:"flex",alignItems:"baseline",gap:5 }}>
            <span style={{ fontSize:18,fontWeight:500,color:sc(overallAvg) }}>{overallAvg}%</span>
            <span style={{ color:"var(--ink-4)",fontSize:11 }}>average</span>
          </div>
          <div style={{ display:"flex",alignItems:"baseline",gap:5 }}>
            <span style={{ fontSize:18,fontWeight:500,color:"var(--blue)" }}>{subjects.length}</span>
            <span style={{ color:"var(--ink-4)",fontSize:11 }}>subjects</span>
          </div>
        </div>
      )}
    </div>
  );
}