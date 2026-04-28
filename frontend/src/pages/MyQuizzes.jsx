import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getQuizzes, deleteQuiz } from "../services/api";
import { toast } from "../components/Toast";
import PageHeader from "../components/PageHeader";
import { SkeletonList } from "../components/SkeletonCard";

const optLabel=i=>["A","B","C","D"][i]??i;

export default function MyQuizzes() {
  const navigate=useNavigate();
  const [quizzes,setQuizzes]=useState([]);
  const [loading,setLoading]=useState(true);
  const [expanded,setExpanded]=useState(null);
  const [search,setSearch]=useState("");
  const [sortBy,setSortBy]=useState("newest");

  useEffect(()=>{ getQuizzes().then(r=>setQuizzes(r.data)).catch(()=>toast.error("Failed to load quizzes.")).finally(()=>setLoading(false)); },[]);

  const handleDelete=async id=>{ if(!window.confirm("Delete this quiz?")) return; try{ await deleteQuiz(id); setQuizzes(p=>p.filter(q=>q.id!==id)); toast.success("Quiz deleted."); } catch{ toast.error("Failed to delete."); } };
  const handleRetry=quiz=>{
    let parsed=null; try{ parsed=typeof quiz.content==="string"?JSON.parse(quiz.content):quiz.content; } catch{}
    if(!parsed?.questions?.length){ toast.error("Quiz data unavailable."); return; }
    sessionStorage.setItem("eg_retake",JSON.stringify({ quiz_id:quiz.id, subject:quiz.subject, topic:quiz.topic, questions:parsed.questions }));
    navigate("/generate-quiz?retake=1");
  };

  const filtered=quizzes
    .filter(q=>{ if(!search) return true; const s=search.toLowerCase(); return q.subject?.toLowerCase().includes(s)||q.topic?.toLowerCase().includes(s); })
    .sort((a,b)=>{ if(sortBy==="newest") return new Date(b.created_at)-new Date(a.created_at); if(sortBy==="oldest") return new Date(a.created_at)-new Date(b.created_at); return (a.subject||"").localeCompare(b.subject||""); });

  return (
    <div>
      <PageHeader title="Quiz" accent="History" accentColor="var(--jade)" sub={`${quizzes.length} quiz${quizzes.length!==1?"zes":""} generated`}/>

      {quizzes.length>0 && (
        <div className="fade-up" style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap" }}>
          <input className="glow-input" type="text" placeholder="Search by subject or topic…" value={search} onChange={e=>setSearch(e.target.value)} style={{ flex:1, minWidth:180, maxWidth:320 }}/>
          <select className="glow-input" value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ width:160, flexShrink:0 }}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="subject">By Subject</option>
          </select>
        </div>
      )}

      {loading && <SkeletonList count={4}/>}
      {!loading && filtered.length===0 && (
        <div className="glass" style={{ padding:"56px 24px", textAlign:"center" }}>
          <p style={{ color:"var(--ink-3)", fontSize:".9rem", marginBottom:20 }}>{search?"No quizzes match your search.":"No quizzes yet."}</p>
          {!search && <button className="btn-glow" onClick={()=>navigate("/generate-quiz")}>Generate Quiz</button>}
        </div>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {filtered.map((quiz,idx)=>{
          let parsed=null; try{ parsed=typeof quiz.content==="string"?JSON.parse(quiz.content):quiz.content; } catch{}
          const isExp=expanded===quiz.id, qCount=parsed?.questions?.length||0;
          return (
            <div key={quiz.id} className="glass fade-up" style={{ overflow:"hidden", animationDelay:`${idx*.04}s` }}>
              <div style={{ padding:"14px 18px", display:"flex", alignItems:"center", gap:12, flexWrap:"wrap", borderBottom:isExp?"1px solid var(--border)":"none" }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3, flexWrap:"wrap" }}>
                    <span style={{ fontWeight:600, color:"var(--ink)", fontSize:".88rem", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:180 }}>{quiz.subject||"Custom"}</span>
                    <span style={{ color:"var(--ink-4)", fontSize:".78rem" }}>›</span>
                    <span style={{ color:"var(--ink-2)", fontSize:".84rem", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1, maxWidth:200 }}>{quiz.topic||"—"}</span>
                  </div>
                  <div style={{ display:"flex", gap:10, fontSize:".7rem", color:"var(--ink-3)", flexWrap:"wrap" }}>
                    <span>{new Date(quiz.created_at).toLocaleDateString()}</span>
                    {qCount>0 && <span>· {qCount} questions</span>}
                  </div>
                </div>
                <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                  <button onClick={()=>handleRetry(quiz)} style={{ padding:"5px 12px", borderRadius:7, cursor:"pointer", border:"1px solid var(--jade-border)", background:"var(--jade-dim)", color:"var(--jade)", fontFamily:"var(--font-body)", fontSize:".77rem", fontWeight:600, transition:"all .15s" }}>Retry</button>
                  <button onClick={()=>setExpanded(isExp?null:quiz.id)} style={{ padding:"5px 12px", borderRadius:7, cursor:"pointer", border:"1px solid var(--border-med)", background:"var(--bg-elevated)", color:"var(--ink-2)", fontFamily:"var(--font-body)", fontSize:".77rem", fontWeight:500, transition:"all .15s" }}>{isExp?"Collapse":"Review"}</button>
                  <button onClick={()=>handleDelete(quiz.id)} style={{ padding:"5px 10px", borderRadius:7, cursor:"pointer", border:"1px solid transparent", background:"transparent", color:"var(--ink-4)", fontFamily:"var(--font-body)", fontSize:".77rem", transition:"all .15s" }}
                    onMouseEnter={e=>{e.currentTarget.style.color="var(--ruby)";e.currentTarget.style.borderColor="var(--ruby-border)";}}
                    onMouseLeave={e=>{e.currentTarget.style.color="var(--ink-4)";e.currentTarget.style.borderColor="transparent";}}>✕</button>
                </div>
              </div>
              {isExp && parsed?.questions && (
                <div style={{ padding:"16px 18px" }}>
                  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    {parsed.questions.map((q,qi)=>(
                      <div key={qi} style={{ padding:14, borderRadius:10, background:"var(--bg-elevated)", border:"1px solid var(--border)" }}>
                        <p style={{ fontWeight:600, color:"var(--ink)", marginBottom:10, fontSize:".87rem", lineHeight:1.55 }}>
                          <span style={{ color:"var(--ink-3)", marginRight:8, fontFamily:"var(--font-mono)", fontSize:".72rem" }}>Q{qi+1}</span>{q.question}
                        </p>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5 }}>
                          {q.options.map((opt,oi)=>(
                            <div key={oi} style={{ padding:"7px 11px", borderRadius:7, fontSize:".82rem", background:oi===q.correct_answer?"var(--jade-dim)":"var(--bg-overlay)", border:oi===q.correct_answer?"1px solid var(--jade-border)":"1px solid var(--border)", color:oi===q.correct_answer?"var(--jade)":"var(--ink-3)", fontWeight:oi===q.correct_answer?600:400, display:"flex", alignItems:"center", gap:8 }}>
                              <span style={{ color:"var(--ink-4)", fontFamily:"var(--font-mono)", fontSize:".7rem", flexShrink:0 }}>{optLabel(oi)}</span>
                              <span style={{ flex:1 }}>{opt}</span>
                              {oi===q.correct_answer && <span>✓</span>}
                            </div>
                          ))}
                        </div>
                        {q.explanation && <div className="explanation-box"><strong>Why:</strong> {q.explanation}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}