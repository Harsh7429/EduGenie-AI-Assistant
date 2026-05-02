import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getSemesters, getSubjectsBySemester, getTopicsBySubject, generateQuiz, submitQuiz } from "../services/api";
import { toast } from "../components/Toast";
import PageHeader from "../components/PageHeader";

const optLabel = i => ["A","B","C","D"][i] ?? i;
function updateStreak() {
  const today=new Date().toISOString().split("T")[0],last=localStorage.getItem("eg_streak_day"),s=parseInt(localStorage.getItem("eg_streak")||"0",10);
  if(last===today) return;
  const y=new Date(); y.setDate(y.getDate()-1);
  const n=last===y.toISOString().split("T")[0]?s+1:1;
  localStorage.setItem("eg_streak",String(n)); localStorage.setItem("eg_streak_day",today);
}

export default function GenerateQuiz() {
  const navigate=useNavigate();
  const [searchParams]=useSearchParams();
  const isRetake=searchParams.get("retake")==="1";
  const [step,setStep]=useState("config");
  const [semesters,setSemesters]=useState([]); const [subjects,setSubjects]=useState([]); const [topics,setTopics]=useState([]);
  const [semId,setSemId]=useState(""); const [subjectId,setSubjectId]=useState(""); const [topicId,setTopicId]=useState("");
  const [difficulty,setDifficulty]=useState("medium"); const [numQ,setNumQ]=useState(5);
  const [generating,setGenerating]=useState(false); const [quiz,setQuiz]=useState(null); const [quizId,setQuizId]=useState(null);
  const [answers,setAnswers]=useState({}); const [submitted,setSubmitted]=useState(false); const [results,setResults]=useState(null);
  const [timeLeft,setTimeLeft]=useState(0); const [isPractice,setIsPractice]=useState(false);
  const timerRef=useRef(null);

  useEffect(()=>{ getSemesters().then(r=>setSemesters(r.data)).catch(()=>{}); },[]);
  useEffect(()=>{
    if(isRetake){ try{ const d=JSON.parse(sessionStorage.getItem("eg_retake")||"null"); if(d?.questions){ setQuiz({questions:d.questions}); setQuizId(d.quiz_id); setIsPractice(true); setTimeLeft(d.questions.length*45); setStep("quiz"); sessionStorage.removeItem("eg_retake"); } }catch{} }
  },[isRetake]);
  useEffect(()=>{ if(semId){ getSubjectsBySemester(semId).then(r=>{ setSubjects(r.data); setSubjectId(""); setTopics([]); setTopicId(""); }).catch(()=>{}); } },[semId]);
  useEffect(()=>{ if(subjectId){ getTopicsBySubject(subjectId).then(r=>{ setTopics(r.data); setTopicId(""); }).catch(()=>{}); } },[subjectId]);
  useEffect(()=>{
    if(step==="quiz"&&timeLeft>0&&!submitted){ timerRef.current=setInterval(()=>{ setTimeLeft(t=>{ if(t<=1){ clearInterval(timerRef.current); handleSubmit(true); return 0; } return t-1; }); },1000); }
    return()=>clearInterval(timerRef.current);
  },[step,submitted]);

  const handleGenerate=async()=>{
    if(!subjectId||!topicId){ toast.error("Select subject and topic."); return; }
    try{ setGenerating(true); const r=await generateQuiz(subjectId,topicId,difficulty,numQ); const q=r.data.quiz; setQuiz(q); setQuizId(r.data.quiz_id); setAnswers({}); setSubmitted(false); setResults(null); setIsPractice(false); setTimeLeft(q.questions.length*45); setStep("quiz"); }
    catch(err){ toast.error(err.response?.data?.error||"Failed to generate quiz."); }
    finally{ setGenerating(false); }
  };

  const handleSubmit=async(auto=false)=>{
    if(submitted) return; clearInterval(timerRef.current);
    const qs=quiz.questions; let score=0; qs.forEach((q,i)=>{ if(answers[i]===q.correct_answer) score++; });
    const total=qs.length,pct=Math.round((score/total)*100);
    setResults({score,total,pct,auto}); setSubmitted(true); updateStreak();
    if(!isPractice&&quizId){ try{ await submitQuiz(quizId,score,total); }catch{} }
    toast.success(`${auto?"Time up!":"Submitted!"} Score: ${score}/${total}`);
  };

  const mins=Math.floor(timeLeft/60),secs=String(timeLeft%60).padStart(2,"0");
  const timerColor=timeLeft<30?"var(--coral)":timeLeft<60?"var(--amber)":"var(--ink-2)";

  const Sel=({label,value,onChange,items,disabled,placeholder})=>(
    <div style={{ marginBottom:12 }}>
      <label style={{ display:"block",fontSize:11,fontWeight:500,color:"var(--ink-4)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:6 }}>{label}</label>
      <select className="glow-input" value={value} onChange={e=>onChange(e.target.value)} disabled={disabled}>
        <option value="">{placeholder}</option>
        {items.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}
      </select>
    </div>
  );

  return (
    <div>
      <PageHeader title="Generate" accent="Quiz" accentColor="var(--purple)" sub="AI-generated MCQs with difficulty levels, timer & progress tracking"/>

      {step==="config"&&(
        <div className="glass fade-up" style={{ padding:"22px 20px",maxWidth:540 }}>
          <Sel label="Semester" value={semId}     onChange={setSemId}     items={semesters} disabled={false}      placeholder="Select semester…"/>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            <Sel label="Subject"    value={subjectId} onChange={setSubjectId} items={subjects}  disabled={!semId}     placeholder="Select subject…"/>
            <Sel label="Topic"      value={topicId}   onChange={setTopicId}   items={topics}    disabled={!subjectId} placeholder="Select topic…"/>
            <Sel label="Difficulty" value={difficulty} onChange={setDifficulty} items={[{id:"easy",name:"Easy"},{id:"medium",name:"Medium"},{id:"hard",name:"Hard"}]} disabled={false} placeholder=""/>
            <div>
              <label style={{ display:"block",fontSize:11,fontWeight:500,color:"var(--ink-4)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:6 }}>Questions: {numQ}</label>
              <input type="range" min={3} max={15} value={numQ} onChange={e=>setNumQ(Number(e.target.value))} style={{ width:"100%",accentColor:"var(--purple)",cursor:"pointer",marginTop:4 }}/>
              <div style={{ display:"flex",justifyContent:"space-between",fontSize:10,color:"var(--ink-4)",marginTop:2 }}><span>3</span><span>15</span></div>
            </div>
          </div>
          <button className="btn-glow" onClick={handleGenerate} disabled={generating||!subjectId||!topicId}
            style={{ marginTop:16,width:"100%",padding:11,fontSize:13,background:"var(--purple)",color:"#fff" }}>
            {generating?`Generating…`:`Generate ${numQ} Questions →`}
          </button>
        </div>
      )}

      {step==="quiz"&&quiz&&(
        <div className="fade-up">
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:9 }}>
            <div style={{ display:"flex",gap:12,alignItems:"center",flexWrap:"wrap" }}>
              <span style={{ fontSize:12,color:"var(--ink-3)" }}>{Object.keys(answers).length}/{quiz.questions.length} answered</span>
              {isPractice&&<span style={{ fontSize:11,padding:"2px 8px",borderRadius:99,background:"var(--blue-dim)",color:"var(--blue)",fontWeight:500 }}>Practice Mode</span>}
            </div>
            {!submitted&&(
              <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                <span style={{ fontFamily:"var(--font-mono)",fontSize:15,color:timerColor,fontWeight:500,letterSpacing:".04em" }}>{mins}:{secs}</span>
                <button className="btn-glow" onClick={()=>handleSubmit(false)} style={{ padding:"7px 16px",fontSize:13,background:"var(--purple)" }}>Submit</button>
              </div>
            )}
          </div>

          {!submitted&&(
            <div style={{ height:"1.5px",background:"var(--border)",borderRadius:99,marginBottom:20,overflow:"hidden" }}>
              <div style={{ height:"100%",width:`${(Object.keys(answers).length/quiz.questions.length)*100}%`,background:"var(--purple)",borderRadius:99,transition:"width .3s" }}/>
            </div>
          )}

          {submitted&&results&&(
            <div style={{ padding:"16px 20px",borderRadius:"var(--r-lg)",marginBottom:20,background:results.pct>=80?"var(--teal-dim)":results.pct>=50?"var(--amber-dim)":"var(--coral-dim)",border:`0.5px solid ${results.pct>=80?"var(--teal-border)":results.pct>=50?"var(--amber-border)":"var(--coral-border)"}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10 }}>
              <div>
                <div style={{ fontSize:28,fontWeight:500,color:results.pct>=80?"var(--teal)":results.pct>=50?"var(--amber)":"var(--coral)",lineHeight:1,letterSpacing:"-.02em" }}>{results.score}/{results.total}</div>
                <div style={{ color:"var(--ink-3)",fontSize:12,marginTop:4 }}>{results.pct}% · {results.auto?"Time ran out":"Submitted"} · {isPractice?"Practice":"Score saved"}</div>
              </div>
              <div style={{ display:"flex",gap:7 }}>
                {!isPractice&&<button className="btn-glow" onClick={()=>navigate("/analytics")} style={{ padding:"7px 14px",fontSize:12 }}>View Analytics</button>}
                <button onClick={()=>{setStep("config");setSubmitted(false);setAnswers({});setQuiz(null);}} style={{ padding:"7px 14px",borderRadius:"var(--r-md)",border:"0.5px solid var(--border-med)",background:"transparent",color:"var(--ink-2)",fontFamily:"var(--font-body)",fontSize:12,cursor:"pointer" }}>New Quiz</button>
              </div>
            </div>
          )}

          <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
            {quiz.questions.map((q,qi)=>{
              const chosen=answers[qi],correct=q.correct_answer;
              return (
                <div key={qi} className="glass" style={{ padding:"16px 18px",border:submitted?(chosen===correct?"0.5px solid var(--teal-border)":chosen!==undefined&&chosen!==correct?"0.5px solid var(--coral-border)":"0.5px solid var(--border-med)"):"0.5px solid var(--border)" }}>
                  <p style={{ fontWeight:500,color:"var(--ink)",marginBottom:12,fontSize:13,lineHeight:1.6 }}>
                    <span style={{ color:"var(--ink-4)",marginRight:7,fontFamily:"var(--font-mono)",fontSize:11 }}>Q{qi+1}</span>{q.question}
                  </p>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:7 }}>
                    {q.options.map((opt,oi)=>{
                      let bg="var(--bg-elevated)",border="0.5px solid var(--border)",color="var(--ink-2)";
                      if(!submitted&&chosen===oi){ bg="var(--purple-dim)"; border="0.5px solid var(--purple-border)"; color="var(--purple)"; }
                      if(submitted&&oi===correct){ bg="var(--teal-dim)"; border="0.5px solid var(--teal-border)"; color="var(--teal)"; }
                      if(submitted&&oi===chosen&&oi!==correct){ bg="var(--coral-dim)"; border="0.5px solid var(--coral-border)"; color="var(--coral)"; }
                      return (
                        <button key={oi} onClick={()=>{ if(!submitted) setAnswers(a=>({...a,[qi]:oi})); }}
                          style={{ padding:"9px 12px",borderRadius:8,border,background:bg,color,fontFamily:"var(--font-body)",fontSize:13,cursor:submitted?"default":"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:8,transition:"all .13s",WebkitTapHighlightColor:"transparent" }}>
                          <span style={{ fontFamily:"var(--font-mono)",fontSize:10,color:"var(--ink-4)",flexShrink:0 }}>{optLabel(oi)}</span>
                          <span style={{ flex:1,lineHeight:1.45 }}>{opt}</span>
                          {submitted&&oi===correct&&<span>✓</span>}
                          {submitted&&oi===chosen&&oi!==correct&&<span>✗</span>}
                        </button>
                      );
                    })}
                  </div>
                  {submitted&&q.explanation&&<div className="explanation-box"><strong>Explanation:</strong> {q.explanation}</div>}
                  {submitted&&!q.explanation&&chosen!==correct&&<div className="explanation-box" style={{ background:"var(--teal-dim)",borderColor:"var(--teal-border)" }}><strong style={{ color:"var(--teal)" }}>Correct answer:</strong> {q.options[correct]}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}