import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getSemesters, getSubjectsBySemester, getTopicsBySubject, generateQuiz, submitQuizWithAnswers } from "../services/api";
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

/* ── NEW: Smart Result Screen ────────────────────────────────────── */
function SmartResultBanner({ results, serverData, isPractice, onViewAnalytics, onNewQuiz, onRetry }) {
  const pct      = serverData?.percentage  ?? results.pct;
  const perfLevel= serverData?.performance_level;
  const feedback = serverData?.feedback;
  const nextDiff = serverData?.recommended_difficulty ?? serverData?.feedback?.next_difficulty;
  const isWeak   = serverData?.is_weak;

  const scoreColor = pct>=80?"var(--teal)":pct>=50?"var(--amber)":"var(--coral)";
  const bgColor    = pct>=80?"var(--teal-dim)":pct>=50?"var(--amber-dim)":"var(--coral-dim)";
  const borderColor= pct>=80?"var(--teal-border)":pct>=50?"var(--amber-border)":"var(--coral-border)";

  const levelColors = { Advanced:["var(--teal)","var(--teal-dim)"], Intermediate:["var(--amber)","var(--amber-dim)"], Beginner:["var(--coral)","var(--coral-dim)"] };
  const [lc, lb] = levelColors[perfLevel] || ["var(--ink-3)","var(--bg-4)"];

  const diffColor = nextDiff==="hard"?"var(--teal)":nextDiff==="medium"?"var(--amber)":"var(--coral)";

  return (
    <div style={{ borderRadius:"var(--r-lg)", marginBottom:20, overflow:"hidden", border:`0.5px solid ${borderColor}` }}>
      {/* Score header */}
      <div style={{ padding:"20px 22px", background:bgColor, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div>
          <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:4 }}>
            <span style={{ fontSize:36, fontWeight:600, color:scoreColor, lineHeight:1, letterSpacing:"-.03em" }}>{results.score}/{results.total}</span>
            <span style={{ fontSize:16, fontWeight:500, color:scoreColor }}>{pct}%</span>
          </div>
          <div style={{ fontSize:12, color:"var(--ink-3)" }}>
            {results.auto ? "Time ran out" : "Submitted"} · {isPractice ? "Practice mode" : "Score saved"}
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
          {perfLevel && (
            <span style={{ padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:600, background:lb, color:lc }}>
              {perfLevel}
            </span>
          )}
          {nextDiff && (
            <span style={{ fontSize:11, color:"var(--ink-4)" }}>
              Next: <span style={{ color:diffColor, fontWeight:500 }}>{nextDiff}</span> difficulty
            </span>
          )}
        </div>
      </div>

      {/* Feedback message */}
      {feedback && (
        <div style={{ padding:"14px 22px", borderTop:`0.5px solid ${borderColor}`, background:"var(--bg-2)" }}>
          <div style={{ display:"flex", gap:12, alignItems:"flex-start", flexWrap:"wrap" }}>
            <div style={{ flex:1, minWidth:200 }}>
              <div style={{ fontSize:13, fontWeight:500, color:"var(--ink)", marginBottom:4 }}>{feedback.message}</div>
              <div style={{ fontSize:12, color:"var(--ink-3)", lineHeight:1.5 }}>{feedback.action}</div>
            </div>
            {feedback.confidence_level && (
              <div style={{ textAlign:"right", flexShrink:0 }}>
                <div style={{ fontSize:10, color:"var(--ink-4)", marginBottom:3, textTransform:"uppercase", letterSpacing:".06em" }}>Confidence</div>
                <span style={{
                  fontSize:11, fontWeight:600, padding:"3px 9px", borderRadius:99,
                  background: feedback.confidence_level==="high"?"var(--teal-dim)":feedback.confidence_level==="medium"?"var(--amber-dim)":"var(--coral-dim)",
                  color:      feedback.confidence_level==="high"?"var(--teal)":feedback.confidence_level==="medium"?"var(--amber)":"var(--coral)",
                }}>
                  {feedback.confidence_level.replace("_"," ")}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ padding:"12px 22px", borderTop:`0.5px solid ${borderColor}`, background:"var(--bg-2)", display:"flex", gap:8, flexWrap:"wrap" }}>
        {isWeak && (
          <button className="btn-glow" onClick={onRetry}
            style={{ padding:"7px 16px", fontSize:12, background:"var(--coral)", color:"#fff", display:"flex", alignItems:"center", gap:6 }}>
            ↺ Retry Quiz
          </button>
        )}
        {nextDiff && nextDiff !== "easy" && (
          <button className="btn-glow" onClick={() => onNewQuiz(nextDiff)}
            style={{ padding:"7px 16px", fontSize:12, background: nextDiff==="hard"?"var(--teal)":"var(--purple)", color:"#fff" }}>
            ↑ Try {nextDiff.charAt(0).toUpperCase() + nextDiff.slice(1)}
          </button>
        )}
        {!isPractice && (
          <button className="btn-glow" onClick={onViewAnalytics}
            style={{ padding:"7px 16px", fontSize:12 }}>View Analytics</button>
        )}
        <button onClick={() => onNewQuiz(null)}
          style={{ padding:"7px 14px", borderRadius:"var(--r-md)", border:"0.5px solid var(--border-med)", background:"transparent", color:"var(--ink-2)", fontFamily:"var(--font-body)", fontSize:12, cursor:"pointer" }}>
          New Quiz
        </button>
      </div>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────────── */
export default function GenerateQuiz() {
  const navigate     = useNavigate();
  const [searchParams] = useSearchParams();
  const isRetake     = searchParams.get("retake") === "1";

  const [step,       setStep]       = useState("config");
  const [semesters,  setSemesters]  = useState([]);
  const [subjects,   setSubjects]   = useState([]);
  const [topics,     setTopics]     = useState([]);
  const [semId,      setSemId]      = useState("");
  const [subjectId,  setSubjectId]  = useState("");
  const [topicId,    setTopicId]    = useState("");

  // Pre-fill difficulty from backend recommendation if available
  const [difficulty, setDifficulty] = useState(
    () => localStorage.getItem("eg_rec_difficulty") || "medium"
  );
  const [numQ,       setNumQ]       = useState(5);
  const [generating, setGenerating] = useState(false);
  const [quiz,       setQuiz]       = useState(null);
  const [quizId,     setQuizId]     = useState(null);
  const [answers,    setAnswers]    = useState({});
  const [submitted,  setSubmitted]  = useState(false);
  const [results,    setResults]    = useState(null);
  const [serverData, setServerData] = useState(null);  // NEW: backend evaluation
  const [timeLeft,   setTimeLeft]   = useState(0);
  const [isPractice, setIsPractice] = useState(false);
  const timerRef = useRef(null);

  // Whether the difficulty was auto-suggested by the backend
  const recDiff = localStorage.getItem("eg_rec_difficulty");
  const isAutoSuggested = recDiff && recDiff !== "medium";

  useEffect(() => { getSemesters().then(r => setSemesters(r.data)).catch(() => {}); }, []);

  useEffect(() => {
    if (isRetake) {
      try {
        const d = JSON.parse(sessionStorage.getItem("eg_retake") || "null");
        if (d?.questions) {
          setQuiz({ questions:d.questions }); setQuizId(d.quiz_id);
          setIsPractice(true); setTimeLeft(d.questions.length*45);
          setStep("quiz"); sessionStorage.removeItem("eg_retake");
        }
      } catch {}
    }
  }, [isRetake]);

  useEffect(() => {
    if (semId) {
      getSubjectsBySemester(semId).then(r => { setSubjects(r.data); setSubjectId(""); setTopics([]); setTopicId(""); }).catch(() => {});
    }
  }, [semId]);

  useEffect(() => {
    if (subjectId) { getTopicsBySubject(subjectId).then(r => { setTopics(r.data); setTopicId(""); }).catch(() => {}); }
  }, [subjectId]);

  useEffect(() => {
    if (step === "quiz" && timeLeft > 0 && !submitted) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0; } return t-1; });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [step, submitted]);

  const handleGenerate = async () => {
    if (!subjectId || !topicId) { toast.error("Select subject and topic."); return; }
    try {
      setGenerating(true);
      const r = await generateQuiz(subjectId, topicId, difficulty, numQ);
      const q = r.data.quiz;
      setQuiz(q); setQuizId(r.data.quiz_id); setAnswers({});
      setSubmitted(false); setResults(null); setServerData(null);
      setIsPractice(false); setTimeLeft(q.questions.length * 45); setStep("quiz");
    } catch(err) {
      toast.error(err.response?.data?.error || "Failed to generate quiz.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (auto = false) => {
    if (submitted) return;
    clearInterval(timerRef.current);
    const qs = quiz.questions;
    let score = 0;
    qs.forEach((q, i) => { if (answers[i] === q.correct_answer) score++; });
    const total = qs.length, pct = Math.round((score/total)*100);
    setResults({ score, total, pct, auto });
    setSubmitted(true);
    updateStreak();

    if (!isPractice && quizId) {
      try {
        // Send answers array for server-side evaluation (new API)
        const answersArr = qs.map((_, i) => answers[i] ?? null);
        const resp = await submitQuizWithAnswers(quizId, score, total, answersArr);
        setServerData(resp.data);
        // Update cached recommended difficulty for future visits
        if (resp.data?.recommended_difficulty) {
          localStorage.setItem("eg_rec_difficulty", resp.data.recommended_difficulty);
        }
      } catch {}
    }
    toast.success(`${auto ? "Time up!" : "Submitted!"} Score: ${score}/${total}`);
  };

  const handleRetry = () => {
    if (quiz) {
      sessionStorage.setItem("eg_retake", JSON.stringify({ questions: quiz.questions, quiz_id: quizId }));
      setStep("config"); setSubmitted(false); setAnswers({}); setResults(null); setServerData(null);
      setTimeout(() => { navigate("/generate-quiz?retake=1"); }, 50);
    }
  };

  const handleNewQuiz = (prefillDiff = null) => {
    if (prefillDiff) setDifficulty(prefillDiff);
    setStep("config"); setSubmitted(false); setAnswers({}); setQuiz(null); setResults(null); setServerData(null);
  };

  const mins = Math.floor(timeLeft/60), secs = String(timeLeft%60).padStart(2,"0");
  const timerColor = timeLeft<30?"var(--coral)":timeLeft<60?"var(--amber)":"var(--ink-2)";

  const Sel = ({ label, value, onChange, items, disabled, placeholder, badge }) => (
    <div style={{ marginBottom:12 }}>
      <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, fontWeight:500, color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:".1em", marginBottom:6 }}>
        {label}
        {badge && <span style={{ fontSize:10, color:badge.color, background:badge.bg, padding:"0px 6px", borderRadius:99, fontWeight:600, textTransform:"none", letterSpacing:0 }}>{badge.text}</span>}
      </label>
      <select className="glow-input" value={value} onChange={e => onChange(e.target.value)} disabled={disabled}>
        <option value="">{placeholder}</option>
        {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
      </select>
    </div>
  );

  return (
    <div>
      <PageHeader title="Generate" accent="Quiz" accentColor="var(--purple)" sub="AI-generated MCQs with difficulty levels, timer & progress tracking"/>

      {step === "config" && (
        <div className="glass fade-up" style={{ padding:"22px 20px", maxWidth:540 }}>
          {/* Auto-suggested difficulty notice */}
          {isAutoSuggested && (
            <div style={{ padding:"9px 12px", borderRadius:8, background:"var(--amber-dim)", border:"0.5px solid var(--amber-border)", marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:13 }}>🎯</span>
              <span style={{ fontSize:12, color:"var(--amber)" }}>
                Difficulty pre-set to <strong>{recDiff}</strong> based on your performance
              </span>
              <button onClick={() => localStorage.removeItem("eg_rec_difficulty")}
                style={{ marginLeft:"auto", fontSize:11, color:"var(--ink-4)", background:"transparent", border:"none", cursor:"pointer", padding:0, fontFamily:"var(--font-body)" }}>
                Reset
              </button>
            </div>
          )}

          <Sel label="Semester" value={semId} onChange={setSemId} items={semesters} disabled={false} placeholder="Select semester…"/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Sel label="Subject"    value={subjectId} onChange={setSubjectId} items={subjects}  disabled={!semId}     placeholder="Select subject…"/>
            <Sel label="Topic"      value={topicId}   onChange={setTopicId}   items={topics}    disabled={!subjectId} placeholder="Select topic…"/>
            <Sel
              label="Difficulty"
              value={difficulty}
              onChange={setDifficulty}
              items={[{id:"easy",name:"Easy"},{id:"medium",name:"Medium"},{id:"hard",name:"Hard"}]}
              disabled={false}
              placeholder=""
              badge={isAutoSuggested ? { text:"AI Suggested", color:"var(--amber)", bg:"var(--amber-dim)" } : null}
            />
            <div>
              <label style={{ display:"block", fontSize:11, fontWeight:500, color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:".1em", marginBottom:6 }}>Questions: {numQ}</label>
              <input type="range" min={3} max={15} value={numQ} onChange={e => setNumQ(Number(e.target.value))} style={{ width:"100%", accentColor:"var(--purple)", cursor:"pointer", marginTop:4 }}/>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"var(--ink-4)", marginTop:2 }}><span>3</span><span>15</span></div>
            </div>
          </div>
          <button className="btn-glow" onClick={handleGenerate} disabled={generating||!subjectId||!topicId}
            style={{ marginTop:16, width:"100%", padding:11, fontSize:13, background:"var(--purple)", color:"#fff" }}>
            {generating ? "Generating…" : `Generate ${numQ} Questions →`}
          </button>
        </div>
      )}

      {step === "quiz" && quiz && (
        <div className="fade-up">
          {/* Quiz progress header */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:9 }}>
            <div style={{ display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
              <span style={{ fontSize:12, color:"var(--ink-3)" }}>{Object.keys(answers).length}/{quiz.questions.length} answered</span>
              {isPractice && <span style={{ fontSize:11, padding:"2px 8px", borderRadius:99, background:"var(--blue-dim)", color:"var(--blue)", fontWeight:500 }}>Practice Mode</span>}
            </div>
            {!submitted && (
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontFamily:"var(--font-mono)", fontSize:15, color:timerColor, fontWeight:500, letterSpacing:".04em" }}>{mins}:{secs}</span>
                <button className="btn-glow" onClick={() => handleSubmit(false)} style={{ padding:"7px 16px", fontSize:13, background:"var(--purple)" }}>Submit</button>
              </div>
            )}
          </div>

          {/* Progress bar */}
          {!submitted && (
            <div style={{ height:"1.5px", background:"var(--border)", borderRadius:99, marginBottom:20, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${(Object.keys(answers).length/quiz.questions.length)*100}%`, background:"var(--purple)", borderRadius:99, transition:"width .3s" }}/>
            </div>
          )}

          {/* NEW: Smart result banner — replaces old basic banner */}
          {submitted && results && (
            <SmartResultBanner
              results={results}
              serverData={serverData}
              isPractice={isPractice}
              onViewAnalytics={() => navigate("/analytics")}
              onRetry={handleRetry}
              onNewQuiz={handleNewQuiz}
            />
          )}

          {/* Question cards (unchanged) */}
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {quiz.questions.map((q,qi) => {
              const chosen = answers[qi], correct = q.correct_answer;
              return (
                <div key={qi} className="glass" style={{ padding:"16px 18px", border:submitted?(chosen===correct?"0.5px solid var(--teal-border)":chosen!==undefined&&chosen!==correct?"0.5px solid var(--coral-border)":"0.5px solid var(--border-med)"):"0.5px solid var(--border)" }}>
                  <p style={{ fontWeight:500, color:"var(--ink)", marginBottom:12, fontSize:13, lineHeight:1.6 }}>
                    <span style={{ color:"var(--ink-4)", marginRight:7, fontFamily:"var(--font-mono)", fontSize:11 }}>Q{qi+1}</span>{q.question}
                  </p>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
                    {q.options.map((opt,oi) => {
                      let bg="var(--bg-elevated)",border="0.5px solid var(--border)",color="var(--ink-2)";
                      if(!submitted&&chosen===oi){ bg="var(--purple-dim)"; border="0.5px solid var(--purple-border)"; color="var(--purple)"; }
                      if(submitted&&oi===correct){ bg="var(--teal-dim)"; border="0.5px solid var(--teal-border)"; color="var(--teal)"; }
                      if(submitted&&oi===chosen&&oi!==correct){ bg="var(--coral-dim)"; border="0.5px solid var(--coral-border)"; color="var(--coral)"; }
                      return (
                        <button key={oi} onClick={() => { if(!submitted) setAnswers(a=>({...a,[qi]:oi})); }}
                          style={{ padding:"9px 12px", borderRadius:8, border, background:bg, color, fontFamily:"var(--font-body)", fontSize:13, cursor:submitted?"default":"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:8, transition:"all .13s", WebkitTapHighlightColor:"transparent" }}>
                          <span style={{ fontFamily:"var(--font-mono)", fontSize:10, color:"var(--ink-4)", flexShrink:0 }}>{optLabel(oi)}</span>
                          <span style={{ flex:1, lineHeight:1.45 }}>{opt}</span>
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
