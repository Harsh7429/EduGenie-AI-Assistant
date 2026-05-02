import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getQuizzes, deleteQuiz } from "../services/api";
import { toast } from "../components/Toast";
import PageHeader from "../components/PageHeader";
import { SkeletonList } from "../components/SkeletonCard";

const optLabel = i => ["A","B","C","D"][i] ?? i;

export default function MyQuizzes() {
  const navigate = useNavigate();
  const [quizzes,  setQuizzes]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [search,   setSearch]   = useState("");
  const [sortBy,   setSortBy]   = useState("newest");

  useEffect(()=>{ getQuizzes().then(r=>setQuizzes(r.data)).catch(()=>toast.error("Failed to load.")).finally(()=>setLoading(false)); },[]);

  const handleDelete = async id => {
    if (!window.confirm("Delete this quiz?")) return;
    try { await deleteQuiz(id); setQuizzes(p=>p.filter(q=>q.id!==id)); toast.success("Quiz deleted."); }
    catch { toast.error("Failed to delete."); }
  };
  const handleRetry = quiz => {
    let parsed=null; try{ parsed=typeof quiz.content==="string"?JSON.parse(quiz.content):quiz.content; }catch{}
    if (!parsed?.questions?.length){ toast.error("Quiz data unavailable."); return; }
    sessionStorage.setItem("eg_retake", JSON.stringify({ quiz_id:quiz.id, subject:quiz.subject, topic:quiz.topic, questions:parsed.questions }));
    navigate("/generate-quiz?retake=1");
  };

  const filtered = quizzes
    .filter(q => { if(!search) return true; const s=search.toLowerCase(); return q.subject?.toLowerCase().includes(s)||q.topic?.toLowerCase().includes(s); })
    .sort((a,b) => sortBy==="newest"?new Date(b.created_at)-new Date(a.created_at):sortBy==="oldest"?new Date(a.created_at)-new Date(b.created_at):(a.subject||"").localeCompare(b.subject||""));

  return (
    <div>
      <PageHeader title="Quiz" accent="History" accentColor="var(--teal)"
        sub={`${quizzes.length} quiz${quizzes.length!==1?"zes":""} generated`}/>

      {quizzes.length > 0 && (
        <div className="fade-up" style={{ display:"flex", gap:8, marginBottom:18, flexWrap:"wrap" }}>
          <input className="glow-input" type="text" placeholder="Search by subject or topic…" value={search} onChange={e=>setSearch(e.target.value)} style={{ flex:1, minWidth:160, maxWidth:300 }}/>
          <select className="glow-input" value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ width:155, flexShrink:0 }}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="subject">By Subject</option>
          </select>
        </div>
      )}

      {loading && <SkeletonList count={4}/>}
      {!loading && filtered.length === 0 && (
        <div className="glass" style={{ padding:"48px 24px", textAlign:"center" }}>
          <p style={{ color:"var(--ink-3)", fontSize:13, marginBottom:18 }}>{search?"No quizzes match.":"No quizzes yet."}</p>
          {!search && <button className="btn-glow" onClick={()=>navigate("/generate-quiz")}>Generate Quiz</button>}
        </div>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {filtered.map((quiz, idx) => {
          let parsed=null; try{ parsed=typeof quiz.content==="string"?JSON.parse(quiz.content):quiz.content; }catch{}
          const isExp  = expanded === quiz.id;
          const qCount = parsed?.questions?.length || 0;
          return (
            <div key={quiz.id} className="fade-up" style={{ background:"var(--bg-2)", border:"0.5px solid var(--border)", borderRadius:"var(--r-lg)", overflow:"hidden", animationDelay:`${idx*.04}s` }}>
              <div style={{ padding:"13px 16px", display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", borderBottom:isExp?"0.5px solid var(--border)":"none" }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:3, flexWrap:"wrap" }}>
                    <span style={{ fontSize:13, fontWeight:500, color:"var(--ink)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:170 }}>{quiz.subject||"Custom"}</span>
                    <span style={{ color:"var(--ink-4)", fontSize:12 }}>›</span>
                    <span style={{ fontSize:13, color:"var(--ink-2)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1, maxWidth:190 }}>{quiz.topic||"—"}</span>
                  </div>
                  <div style={{ display:"flex", gap:10, fontSize:11, color:"var(--ink-4)", flexWrap:"wrap" }}>
                    <span>{new Date(quiz.created_at).toLocaleDateString()}</span>
                    {qCount>0&&<span>· {qCount} questions</span>}
                  </div>
                </div>
                <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                  <button onClick={()=>handleRetry(quiz)} style={{ padding:"4px 11px", borderRadius:6, cursor:"pointer", border:"0.5px solid var(--teal-border)", background:"var(--teal-dim)", color:"var(--teal)", fontFamily:"var(--font-body)", fontSize:12, fontWeight:500 }}>Retry</button>
                  <button onClick={()=>setExpanded(isExp?null:quiz.id)} style={{ padding:"4px 11px", borderRadius:6, cursor:"pointer", border:"0.5px solid var(--border-med)", background:"var(--bg-elevated)", color:"var(--ink-2)", fontFamily:"var(--font-body)", fontSize:12, fontWeight:500 }}>{isExp?"Collapse":"Review"}</button>
                  <button onClick={()=>handleDelete(quiz.id)} style={{ padding:"4px 9px", borderRadius:6, cursor:"pointer", border:"0.5px solid transparent", background:"transparent", color:"var(--ink-4)", fontFamily:"var(--font-body)", fontSize:12, transition:"all .13s" }}
                    onMouseEnter={e=>{e.currentTarget.style.color="var(--coral)";e.currentTarget.style.borderColor="var(--coral-border)";}}
                    onMouseLeave={e=>{e.currentTarget.style.color="var(--ink-4)";e.currentTarget.style.borderColor="transparent";}}>✕</button>
                </div>
              </div>
              {isExp && parsed?.questions && (
                <div style={{ padding:"14px 16px", display:"flex", flexDirection:"column", gap:10 }}>
                  {parsed.questions.map((q,qi)=>(
                    <div key={qi} style={{ padding:13, borderRadius:9, background:"var(--bg-elevated)", border:"0.5px solid var(--border)" }}>
                      <p style={{ fontWeight:500, color:"var(--ink)", marginBottom:10, fontSize:13, lineHeight:1.55 }}>
                        <span style={{ color:"var(--ink-4)", marginRight:7, fontFamily:"var(--font-mono)", fontSize:11 }}>Q{qi+1}</span>{q.question}
                      </p>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5 }}>
                        {q.options.map((opt,oi)=>(
                          <div key={oi} style={{ padding:"7px 10px", borderRadius:7, fontSize:12, background:oi===q.correct_answer?"var(--teal-dim)":"var(--bg-overlay)", border:oi===q.correct_answer?"0.5px solid var(--teal-border)":"0.5px solid var(--border)", color:oi===q.correct_answer?"var(--teal)":"var(--ink-3)", fontWeight:oi===q.correct_answer?500:400, display:"flex", alignItems:"center", gap:7 }}>
                            <span style={{ color:"var(--ink-4)", fontFamily:"var(--font-mono)", fontSize:10, flexShrink:0 }}>{optLabel(oi)}</span>
                            <span style={{ flex:1 }}>{opt}</span>
                            {oi===q.correct_answer&&<span>✓</span>}
                          </div>
                        ))}
                      </div>
                      {q.explanation&&<div className="explanation-box"><strong>Why:</strong> {q.explanation}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}