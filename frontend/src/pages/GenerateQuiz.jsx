import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getSemesters, getSubjectsBySemester, getTopicsBySubject, generateQuiz, submitQuiz } from "../services/api";
import { toast } from "../components/Toast";
import PageHeader from "../components/PageHeader";

const optLabel=i=>["A","B","C","D"][i]??i;
function updateStreak(){ const today=new Date().toISOString().split("T")[0]; const last=localStorage.getItem("eg_streak_day"); const s=parseInt(localStorage.getItem("eg_streak")||"0",10); if(last===today) return; const y=new Date(); y.setDate(y.getDate()-1); const ys=y.toISOString().split("T")[0]; const n=last===ys?s+1:1; localStorage.setItem("eg_streak",String(n)); localStorage.setItem("eg_streak_day",today); }

export default function GenerateQuiz() {
  const navigate=useNavigate();
  const [searchParams]=useSearchParams();
  const isRetake=searchParams.get("retake")==="1";
  const [step,setStep]=useState("config");
  const [semesters,setSemesters]=useState([]);
  const [subjects,setSubjects]=useState([]);
  const [topics,setTopics]=useState([]);
  const [semId,setSemId]=useState("");
  const [subjectId,setSubjectId]=useState("");
  const [topicId,setTopicId]=useState("");
  const [difficulty,setDifficulty]=useState("medium");
  const [numQ,setNumQ]=useState(5);
  const [generating,setGenerating]=useState(false);
  const [quiz,setQuiz]=useState(null);
  const [quizId,setQuizId]=useState(null);
  const [answers,setAnswers]=useState({});
  const [submitted,setSubmitted]=useState(false);
  const [results,setResults]=useState(null);
  const [timeLeft,setTimeLeft]=useState(0);
  const [isPractice,setIsPractice]=useState(false);
  const timerRef=useRef(null);

  useEffect(()=>{ getSemesters().then(r=>setSemesters(r.data)).catch(()=>{}); },[]);
  useEffect(()=>{
    if(isRetake){ try{ const d=JSON.parse(sessionStorage.getItem("eg_retake")||"null"); if(d?.questions){ setQuiz({questions:d.questions}); setQuizId(d.quiz_id); setIsPractice(true); setTimeLeft(d.questions.length*45); setStep("quiz"); sessionStorage.removeItem("eg_retake"); } } catch{} }
  },[isRetake]);
  useEffect(()=>{ if(semId){ getSubjectsBySemester(semId).then(r=>{ setSubjects(r.data); setSubjectId(""); setTopics([]); setTopicId(""); }).catch(()=>{}); } },[semId]);
  useEffect(()=>{ if(subjectId){ getTopicsBySubject(subjectId).then(r=>{ setTopics(r.data); setTopicId(""); }).catch(()=>{}); } },[subjectId]);
  useEffect(()=>{
    if(step==="quiz"&&timeLeft>0&&!submitted){ timerRef.current=setInterval(()=>{ setTimeLeft(t=>{ if(t<=1){ clearInterval(timerRef.current); handleSubmit(true); return 0; } return t-1; }); },1000); }
    return()=>clearInterval(timerRef.current);
  },[step,submitted]);

  const handleGenerate=async()=>{
    if(!subjectId||!topicId){ toast.error("Please select a subject and topic."); return; }
    try{ setGenerating(true); const r=await generateQuiz(subjectId,topicId,difficulty,numQ); const q=r.data.quiz; setQuiz(q); setQuizId(r.data.quiz_id); setAnswers({}); setSubmitted(false); setResults(null); setIsPractice(false); setTimeLeft(q.questions.length*45); setStep("quiz"); }
    catch(err){ toast.error(err.response?.data?.error||"Failed to generate quiz."); }
    finally{ setGenerating(false); }
  };

  const handleSubmit=async(auto=false)=>{
    if(submitted) return; clearInterval(timerRef.current);
    const qs=quiz.questions; let score=0; qs.forEach((q,i)=>{ if(answers[i]===q.correct_answer) score++; });
    const total=qs.length, pct=Math.round((score/total)*100);
    setResults({ score,total,pct,auto }); setSubmitted(true); updateStreak();
    if(!isPractice&&quizId){ try{ await submitQuiz(quizId,score,total); } catch{} }
    toast.success(`${auto?"Time up!":"Submitted!"} Score: ${score}/${total}`);
  };

  const mins=Math.floor(timeLeft/60), secs=String(timeLeft%60).padStart(2,"0");
  const timerColor=timeLeft<30?"var(--ruby)":timeLeft<60?"var(--gold)":"var(--ink-2)";

  return (
    <div>
      <PageHeader title="Generate" accent="Quiz" accentColor="var(--lavender)" sub="AI-generated MCQs with difficulty levels, timer & progress tracking"/>

      {step==="config" && (
        <div className="glass fade-up" style={{ padding:"28px 24px", maxWidth:580 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div style={{ gridColumn:"1/-1" }}>
              <label style={{ display:"block", fontSize:".68rem", fontWeight:700, color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:".12em", marginBottom:7 }}>Semester</label>
              <select className="glow-input" value={semId} onChange={e=>setSemId(e.target.value)}><option value="">Select semester…</option>{semesters.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>
            </div>
            <div>
              <label style={{ display:"block", fontSize:".68rem", fontWeight:700, color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:".12em", marginBottom:7 }}>Subject</label>
              <select className="glow-input" value={subjectId} onChange={e=>setSubjectId(e.target.value)} disabled={!semId}><option value="">Select subject…</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>
            </div>
            <div>
              <label style={{ display:"block", fontSize:".68rem", fontWeight:700, color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:".12em", marginBottom:7 }}>Topic</label>
              <select className="glow-input" value={topicId} onChange={e=>setTopicId(e.target.value)} disabled={!subjectId}><option value="">Select topic…</option>{topics.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select>
            </div>
            <div>
              <label style={{ display:"block", fontSize:".68rem", fontWeight:700, color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:".12em", marginBottom:7 }}>Difficulty</label>
              <select className="glow-input" value={difficulty} onChange={e=>setDifficulty(e.target.value)}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select>
            </div>
            <div style={{ gridColumn:"1/-1" }}>
              <label style={{ display:"block", fontSize:".68rem", fontWeight:700, color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:".12em", marginBottom:7 }}>Questions: {numQ}</label>
              <input type="range" min={3} max={15} value={numQ} onChange={e=>setNumQ(Number(e.target.value))} style={{ width:"100%", accentColor:"var(--lavender)", cursor:"pointer" }}/>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:".65rem", color:"var(--ink-4)", marginTop:3 }}><span>3</span><span>15</span></div>
            </div>
          </div>
          <button className="btn-glow" onClick={handleGenerate} disabled={generating||!subjectId||!topicId}
            style={{ marginTop:22, width:"100%", padding:13, fontSize:".9rem", background:"var(--lavender)", color:"#fff" }}>
            {generating?`Generating…`:`Generate ${numQ} Questions →`}
          </button>
        </div>
      )}

      {step==="quiz"&&quiz && (
        <div className="fade-up">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18, flexWrap:"wrap", gap:10 }}>
            <div style={{ display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
              <span style={{ fontSize:".82rem", color:"var(--ink-3)" }}>{Object.keys(answers).length}/{quiz.questions.length} answered</span>
              {isPractice && <span style={{ fontSize:".72rem", padding:"3px 9px", borderRadius:99, background:"var(--sapphire-dim)", color:"var(--sapphire)", fontWeight:600 }}>Practice Mode</span>}
            </div>
            {!submitted && (
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:"1rem", color:timerColor, fontWeight:500, letterSpacing:".05em" }}>{mins}:{secs}</div>
                <button className="btn-glow" onClick={()=>handleSubmit(false)} style={{ padding:"8px 18px", fontSize:".82rem", background:"var(--lavender)" }}>Submit</button>
              </div>
            )}
          </div>
          {!submitted && <div style={{ height:2, background:"var(--border-med)", borderRadius:99, marginBottom:22, overflow:"hidden" }}><div style={{ height:"100%", width:`${(Object.keys(answers).length/quiz.questions.length)*100}%`, background:"var(--lavender)", borderRadius:99, transition:"width .3s" }}/></div>}

          {submitted&&results && (
            <div style={{ padding:"18px 22px", borderRadius:12, marginBottom:22, background:results.pct>=80?"var(--jade-dim)":results.pct>=50?"var(--gold-dim)":"var(--ruby-dim)", border:`1px solid ${results.pct>=80?"var(--jade-border)":results.pct>=50?"var(--gold-border)":"var(--ruby-border)"}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
              <div>
                <div style={{ fontFamily:"var(--font-display)", fontStyle:"italic", fontSize:"2rem", color:results.pct>=80?"var(--jade)":results.pct>=50?"var(--gold)":"var(--ruby)", lineHeight:1 }}>{results.score}/{results.total}</div>
                <div style={{ color:"var(--ink-3)", fontSize:".82rem", marginTop:4 }}>{results.pct}% · {results.auto?"Time ran out":"Submitted"} · {isPractice?"Practice (not saved)":"Score saved"}</div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                {!isPractice && <button className="btn-glow" onClick={()=>navigate("/analytics")} style={{ padding:"8px 16px", fontSize:".8rem" }}>View Analytics</button>}
                <button onClick={()=>{ setStep("config"); setSubmitted(false); setAnswers({}); setQuiz(null); }} style={{ padding:"8px 16px", borderRadius:8, border:"1px solid var(--border-med)", background:"transparent", color:"var(--ink-2)", fontFamily:"var(--font-body)", fontSize:".8rem", cursor:"pointer" }}>New Quiz</button>
              </div>
            </div>
          )}

          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {quiz.questions.map((q,qi)=>{
              const chosen=answers[qi], correct=q.correct_answer;
              const isRight=submitted&&chosen===correct, isWrong=submitted&&chosen!==undefined&&chosen!==correct;
              return (
                <div key={qi} className="glass" style={{ padding:"18px 20px", border:submitted?(isRight?"1px solid var(--jade-border)":isWrong?"1px solid var(--ruby-border)":"1px solid var(--border-med)"):"1px solid var(--border)" }}>
                  <p style={{ fontWeight:600, color:"var(--ink)", marginBottom:14, fontSize:".9rem", lineHeight:1.6 }}>
                    <span style={{ color:"var(--ink-4)", marginRight:8, fontFamily:"var(--font-mono)", fontSize:".72rem" }}>Q{qi+1}</span>{q.question}
                  </p>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    {q.options.map((opt,oi)=>{
                      let bg="var(--bg-elevated)",border="1px solid var(--border)",color="var(--ink-2)";
                      if(!submitted&&chosen===oi){ bg="var(--lavender-dim)"; border="1px solid var(--lavender-border)"; color="var(--lavender)"; }
                      if(submitted&&oi===correct){ bg="var(--jade-dim)"; border="1px solid var(--jade-border)"; color="var(--jade)"; }
                      if(submitted&&oi===chosen&&oi!==correct){ bg="var(--ruby-dim)"; border="1px solid var(--ruby-border)"; color="var(--ruby)"; }
                      return (
                        <button key={oi} onClick={()=>{ if(!submitted) setAnswers(a=>({...a,[qi]:oi})); }}
                          style={{ padding:"10px 13px", borderRadius:9, border, background:bg, color, fontFamily:"var(--font-body)", fontSize:".84rem", cursor:submitted?"default":"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:9, transition:"all .15s", WebkitTapHighlightColor:"transparent" }}>
                          <span style={{ fontFamily:"var(--font-mono)", fontSize:".72rem", color:"var(--ink-4)", flexShrink:0 }}>{optLabel(oi)}</span>
                          <span style={{ flex:1, lineHeight:1.45 }}>{opt}</span>
                          {submitted&&oi===correct && <span>✓</span>}
                          {submitted&&oi===chosen&&oi!==correct && <span>✗</span>}
                        </button>
                      );
                    })}
                  </div>
                  {submitted&&q.explanation && <div className="explanation-box"><strong>Explanation:</strong> {q.explanation}</div>}
                  {submitted&&!q.explanation&&chosen!==correct && <div className="explanation-box" style={{ background:"var(--jade-dim)", borderColor:"var(--jade-border)" }}><strong style={{ color:"var(--jade)" }}>Correct answer:</strong> {q.options[correct]}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}