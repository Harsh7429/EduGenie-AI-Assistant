import { useState, useEffect } from "react";
import api, { getSubjects, generateQuiz, generateTopics } from "../services/api";
import { toast } from "../components/Toast";

const L = ({ children }) => (
  <label style={{ display:"block", fontSize:"0.7rem", color:"var(--ink-3)", marginBottom:7,
    fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em" }}>{children}</label>
);
const optLabel = (i) => ["A","B","C","D"][i] ?? i;

const DIFFICULTY_OPTIONS = [
  { value:"easy",   label:"Easy",   desc:"Basic recall", color:"var(--emerald)" },
  { value:"medium", label:"Medium", desc:"Conceptual",   color:"var(--amber)" },
  { value:"hard",   label:"Hard",   desc:"Advanced",     color:"var(--rose)" },
];

export default function GenerateQuiz() {
  const [mode, setMode]             = useState("structured");
  const [subjects, setSubjects]     = useState([]);
  const [topics, setTopics]         = useState([]);
  const [selSubject, setSelSubject] = useState("");
  const [selTopic, setSelTopic]     = useState("");
  const [customSubj, setCustomSubj] = useState("");
  const [genTopics, setGenTopics]   = useState([]);
  const [difficulty, setDifficulty] = useState("medium");
  const [numQ, setNumQ]             = useState(5);
  const [quizData, setQuizData]     = useState(null);
  const [quizId, setQuizId]         = useState(null);
  const [answers, setAnswers]       = useState({});
  const [score, setScore]           = useState(null);
  const [submitted, setSubmitted]   = useState(false);
  const [loading, setLoading]       = useState(false);
  const [topicLoading, setTopicLoading] = useState(false);
  const [timeLeft, setTimeLeft]     = useState(null);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    if (mode === "structured") getSubjects().then(r => setSubjects(r.data)).catch(() => {});
  }, [mode]);

  useEffect(() => {
    if (!timerActive || timeLeft === null) return;
    if (timeLeft <= 0) { handleAutoSubmit(); return; }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timerActive, timeLeft]);

  const fetchTopics = (subjectId) => {
    setTopics([]);
    api.get(`/topics/subject/${subjectId}`).then(r => setTopics(r.data)).catch(() => {});
  };

  const handleGenerateQuiz = async (isCustom = false) => {
    try {
      setLoading(true); setQuizData(null); setScore(null);
      setAnswers({}); setSubmitted(false); setTimerActive(false); setTimeLeft(null);
      const r = await generateQuiz(isCustom ? customSubj : selSubject, selTopic, difficulty, numQ);
      setQuizData(r.data.quiz);
      setQuizId(r.data.quiz_id);
      setTimeLeft(numQ * 90);
      setTimerActive(true);
      toast.success("Quiz ready! Good luck");
    } catch { toast.error("Failed to generate quiz. Try again."); }
    finally { setLoading(false); }
  };

  const handleGenerateTopics = async () => {
    if (!customSubj.trim()) { toast.info("Enter a subject first."); return; }
    setTopicLoading(true);
    try {
      const r = await generateTopics(customSubj);
      setGenTopics(r.data.topics);
    } catch { toast.error("Failed to suggest topics."); }
    finally { setTopicLoading(false); }
  };

  const calcScore = () => {
    let correct = 0;
    quizData.questions.forEach((q, i) => {
      if (answers[i] !== undefined && answers[i] === q.correct_answer) correct++;
    });
    setScore(correct);
    setTimerActive(false);
  };

  const handleAutoSubmit = () => {
    if (score === null) calcScore();
    toast.info("Time's up! Quiz auto-submitted.");
  };

  const handleSave = async () => {
    if (!quizId) { toast.error("No quiz ID."); return; }
    try {
      await api.post(`/quizzes/${quizId}/submit`, { score, total_marks: quizData.questions.length });
      setSubmitted(true);
      toast.success("Progress saved!");
    } catch (err) {
      toast.error("Save failed: " + (err?.response?.data?.error || err.message));
    }
  };

  const handleRetry = () => {
    setQuizData(null); setScore(null); setAnswers({});
    setSubmitted(false); setTimerActive(false); setTimeLeft(null);
    handleGenerateQuiz(mode === "custom");
  };

  const switchMode = (m) => {
    setMode(m); setSelSubject(""); setSelTopic(""); setCustomSubj("");
    setGenTopics([]); setTopics([]); setQuizData(null); setAnswers({});
    setScore(null); setSubmitted(false); setTimerActive(false); setTimeLeft(null);
  };

  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const timerColor = timeLeft < 60 ? "var(--rose)" : timeLeft < 180 ? "var(--amber)" : "var(--emerald)";
  const answeredCount = Object.keys(answers).length;
  const canSubmit = answeredCount > 0;
  const diffColor = DIFFICULTY_OPTIONS.find(d => d.value === difficulty)?.color ?? "var(--amber)";

  return (
    <div>
      {/* Header */}
      <div className="fade-up" style={{ marginBottom:28 }}>
        <h1 style={{
          fontFamily:"var(--font-display)", fontStyle:"italic",
          fontSize:"2.4rem", color:"var(--ink)", marginBottom:8,
        }}>
          Generate <span style={{ color:"var(--amber)" }}>Quiz</span>
        </h1>
        <p style={{ color:"var(--ink-3)", fontSize:"0.92rem" }}>
          AI-generated MCQs with difficulty levels, timer & progress tracking
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="fade-up" style={{
        display:"inline-flex", gap:3, padding:3,
        background:"var(--bg-elevated)", borderRadius:10,
        border:"1px solid var(--border)", marginBottom:24,
      }}>
        {[["structured","Structured"],["custom","Custom"]].map(([m,lbl]) => (
          <button key={m} onClick={() => switchMode(m)} style={{
            padding:"7px 18px", borderRadius:8, border:"none", cursor:"pointer",
            fontFamily:"var(--font-body)", fontWeight:600, fontSize:"0.83rem",
            background: mode===m ? "var(--amber)" : "transparent",
            color: mode===m ? "#000" : "var(--ink-3)",
            transition:"all 0.18s",
          }}>{lbl}</button>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"340px 1fr", gap:20, alignItems:"start" }}>
        {/* Config panel */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

          {/* Subject/Topic */}
          <div className="glass fade-up" style={{ padding:22 }}>
            <div style={{ fontSize:"0.7rem", color:"var(--ink-4)", fontWeight:700,
              textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:16 }}>
              {mode==="structured" ? "Syllabus" : "Custom Topic"}
            </div>

            {mode === "structured" ? (
              <>
                <div style={{ marginBottom:14 }}>
                  <L>Subject</L>
                  <select className="glow-input" value={selSubject}
                    onChange={e => { setSelSubject(e.target.value); setSelTopic(""); fetchTopics(e.target.value); }}>
                    <option value="">— Select Subject —</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <L>Topic</L>
                  <select className="glow-input" value={selTopic}
                    onChange={e => setSelTopic(e.target.value)}
                    disabled={!topics.length} style={{ opacity:topics.length?1:0.4 }}>
                    <option value="">— Select Topic —</option>
                    {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div style={{ marginBottom:12 }}>
                  <L>Subject Name</L>
                  <input className="glow-input" type="text" placeholder="e.g. Machine Learning"
                    value={customSubj} onChange={e => setCustomSubj(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleGenerateTopics()} />
                </div>
                <button onClick={handleGenerateTopics} disabled={!customSubj.trim() || topicLoading}
                  style={{
                    padding:"7px 14px", borderRadius:8, cursor:"pointer",
                    border:"1px solid var(--border-med)", background:"var(--bg-elevated)",
                    color:"var(--teal)", fontFamily:"var(--font-body)", fontWeight:600, fontSize:"0.82rem",
                    marginBottom:14, opacity:customSubj.trim()?1:0.4, transition:"all 0.15s",
                  }}>
                  {topicLoading ? "Thinking…" : "Suggest Topics →"}
                </button>
                {genTopics.length > 0 && (
                  <div>
                    <L>Pick a Topic</L>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                      {genTopics.map((t,i) => {
                        const name = t.name || t;
                        const sel = selTopic === name;
                        return (
                          <button key={i} onClick={() => setSelTopic(name)} style={{
                            padding:"5px 11px", borderRadius:99, cursor:"pointer",
                            fontFamily:"var(--font-body)", fontSize:"0.78rem", fontWeight:500,
                            border: sel ? "1px solid rgba(245,158,11,0.5)" : "1px solid var(--border)",
                            background: sel ? "var(--amber-dim)" : "var(--bg-elevated)",
                            color: sel ? "var(--amber)" : "var(--ink-2)",
                            transition:"all 0.15s",
                          }}>{name}</button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Difficulty */}
          <div className="glass fade-up" style={{ padding:20 }}>
            <L>Difficulty Level</L>
            <div style={{ display:"flex", gap:7 }}>
              {DIFFICULTY_OPTIONS.map(d => (
                <button key={d.value} onClick={() => setDifficulty(d.value)} style={{
                  flex:1, padding:"10px 4px", borderRadius:9, cursor:"pointer", textAlign:"center",
                  border: difficulty===d.value ? `1px solid ${d.color}` : "1px solid var(--border)",
                  background: difficulty===d.value ? `color-mix(in srgb, ${d.color} 12%, transparent)` : "var(--bg-elevated)",
                  fontFamily:"var(--font-body)", transition:"all 0.18s",
                }}>
                  <div style={{
                    width:7, height:7, borderRadius:"50%", background:d.color,
                    margin:"0 auto 6px", opacity: difficulty===d.value ? 1 : 0.3,
                  }}/>
                  <div style={{ fontSize:"0.75rem", fontWeight:700,
                    color: difficulty===d.value ? d.color : "var(--ink-3)" }}>{d.label}</div>
                  <div style={{ fontSize:"0.62rem", color:"var(--ink-4)", marginTop:2 }}>{d.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Question count */}
          <div className="glass fade-up" style={{ padding:20 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
              <L>Questions</L>
              <span style={{
                fontFamily:"var(--font-display)", fontStyle:"italic",
                color:"var(--amber)", fontSize:"1.1rem",
              }}>{numQ}</span>
            </div>
            <input type="range" min={3} max={15} step={1} value={numQ}
              onChange={e => setNumQ(Number(e.target.value))}
              style={{ width:"100%", accentColor:"#f59e0b", cursor:"pointer" }} />
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:"0.68rem",
              color:"var(--ink-4)", marginTop:4 }}>
              <span>3 min</span><span>15 max</span>
            </div>
          </div>

          {/* Generate button */}
          <button className="btn-glow" disabled={loading ||
            (mode==="structured" ? (!selSubject||!selTopic) : (!customSubj.trim()||!selTopic))}
            onClick={() => handleGenerateQuiz(mode === "custom")}
            style={{ padding:13, fontSize:"0.92rem", width:"100%" }}>
            {loading ? "Generating…" : `Generate ${numQ} Questions`}
          </button>
        </div>

        {/* Quiz area */}
        <div>
          {loading && (
            <div className="glass fade-up" style={{ padding:60, textAlign:"center" }}>
              <div className="loader" style={{ marginBottom:16 }} />
              <p style={{ color:"var(--ink-3)", fontSize:"0.9rem" }}>
                Crafting your {numQ} {difficulty} questions…
              </p>
            </div>
          )}

          {quizData?.questions && !loading && (
            <div className="glass fade-up" style={{ padding:26 }}>
              {/* Quiz header */}
              <div style={{
                display:"flex", justifyContent:"space-between", alignItems:"center",
                marginBottom:20, paddingBottom:16, borderBottom:"1px solid var(--border)",
              }}>
                <div>
                  <div style={{ fontWeight:600, color:"var(--ink)", fontSize:"0.95rem", marginBottom:3 }}>
                    {quizData.questions.length} Questions
                    <span style={{ color:diffColor, marginLeft:8, fontSize:"0.82rem" }}>
                      · {difficulty.charAt(0).toUpperCase()+difficulty.slice(1)}
                    </span>
                  </div>
                  <p style={{ color:"var(--ink-3)", fontSize:"0.78rem" }}>
                    {answeredCount}/{quizData.questions.length} answered
                    {score===null && ` · ${quizData.questions.length-answeredCount} remaining`}
                  </p>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  {timerActive && timeLeft !== null && (
                    <div style={{
                      padding:"5px 12px", borderRadius:99,
                      background:`color-mix(in srgb, ${timerColor} 10%, transparent)`,
                      border:`1px solid color-mix(in srgb, ${timerColor} 30%, transparent)`,
                      color:timerColor, fontWeight:700, fontSize:"0.88rem",
                      fontFamily:"var(--font-mono)",
                    }}>{formatTime(timeLeft)}</div>
                  )}
                  {score !== null && (
                    <div style={{
                      padding:"5px 14px", borderRadius:99,
                      background:`color-mix(in srgb, ${score/quizData.questions.length>=0.8?"#34d399":score/quizData.questions.length>=0.5?"#f59e0b":"#fb7185"} 10%, transparent)`,
                      color:score/quizData.questions.length>=0.8?"var(--emerald)":score/quizData.questions.length>=0.5?"var(--amber)":"var(--rose)",
                      fontWeight:700, fontSize:"0.88rem",
                    }}>
                      {score}/{quizData.questions.length} correct
                    </div>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              {score===null && (
                <div style={{ height:3, background:"var(--bg-overlay)", borderRadius:99, marginBottom:22, overflow:"hidden" }}>
                  <div style={{
                    height:"100%", borderRadius:99, background:"var(--amber)",
                    width:`${(answeredCount/quizData.questions.length)*100}%`,
                    transition:"width 0.3s",
                  }} />
                </div>
              )}

              {/* Questions */}
              {quizData.questions.map((q, qi) => {
                const answered = score !== null;
                const isRight = answered && answers[qi] === q.correct_answer;
                return (
                  <div key={qi} style={{
                    marginBottom:18, padding:18, borderRadius:12,
                    background: answered ? (isRight?"rgba(52,211,153,0.04)":"rgba(251,113,133,0.04)") : "var(--bg-elevated)",
                    border: answered ? (isRight?"1px solid rgba(52,211,153,0.2)":"1px solid rgba(251,113,133,0.15)") : "1px solid var(--border)",
                    transition:"all 0.25s",
                  }}>
                    <p style={{ fontWeight:600, color:"var(--ink)", marginBottom:12, fontSize:"0.9rem", lineHeight:1.55 }}>
                      <span style={{ color:"var(--ink-3)", marginRight:8, fontFamily:"var(--font-mono)", fontSize:"0.78rem" }}>
                        Q{qi+1}
                      </span>
                      {q.question}
                      {answered && (
                        <span style={{ marginLeft:8, color:isRight?"var(--emerald)":"var(--rose)", fontSize:"0.85rem" }}>
                          {isRight ? "✓" : "✗"}
                        </span>
                      )}
                    </p>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                      {q.options.map((opt, oi) => {
                        const isSel = answers[qi] === oi;
                        const isCorr = q.correct_answer === oi;
                        let bg="transparent", bdr="var(--border)", clr="var(--ink-2)";
                        if (answered) {
                          if (isCorr)       { bg="rgba(52,211,153,0.08)";   bdr="rgba(52,211,153,0.35)";  clr="var(--emerald)"; }
                          else if (isSel)   { bg="rgba(251,113,133,0.07)"; bdr="rgba(251,113,133,0.3)";  clr="var(--rose)"; }
                        } else if (isSel)   { bg="var(--amber-dim)";         bdr="rgba(245,158,11,0.45)"; clr="var(--amber)"; }
                        return (
                          <label key={oi} style={{
                            display:"flex", alignItems:"center", gap:9,
                            padding:"9px 13px", borderRadius:8,
                            background:bg, border:`1px solid ${bdr}`, color:clr,
                            cursor: answered?"default":"pointer", fontSize:"0.85rem",
                            fontWeight: (isSel||(answered&&isCorr)) ? 600 : 400,
                            transition:"all 0.18s",
                          }}>
                            <input type="radio" name={`q${qi}`} value={oi}
                              checked={isSel} disabled={answered}
                              onChange={() => setAnswers({...answers,[qi]:oi})}
                              style={{ accentColor:"#f59e0b", flexShrink:0 }} />
                            <span style={{ color:"var(--ink-4)", fontFamily:"var(--font-mono)", fontSize:"0.75rem", minWidth:16 }}>
                              {optLabel(oi)}
                            </span>
                            <span style={{ flex:1 }}>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Submit / Result */}
              {score===null ? (
                <button className="btn-glow" onClick={calcScore} disabled={!canSubmit}
                  style={{ width:"100%", padding:12, marginTop:8, opacity:canSubmit?1:0.4 }}>
                  Submit Quiz ({answeredCount}/{quizData.questions.length} answered)
                </button>
              ) : (
                <div style={{
                  marginTop:20, padding:24, borderRadius:14, textAlign:"center",
                  background:"var(--bg-elevated)", border:"1px solid var(--border-med)",
                }}>
                  <div style={{ position:"relative", width:96, height:96, margin:"0 auto 16px" }}>
                    <svg viewBox="0 0 36 36" style={{ width:96, height:96, transform:"rotate(-90deg)" }}>
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--bg-overlay)" strokeWidth="2.5"/>
                      <circle cx="18" cy="18" r="15.9" fill="none"
                        stroke={score/quizData.questions.length>=0.8?"#34d399":score/quizData.questions.length>=0.5?"#f59e0b":"#fb7185"}
                        strokeWidth="2.5" strokeLinecap="round"
                        strokeDasharray={`${(score/quizData.questions.length)*100} 100`}
                        style={{ transition:"stroke-dasharray 1s cubic-bezier(0.16,1,0.3,1)" }}/>
                    </svg>
                    <div style={{
                      position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center",
                      fontFamily:"var(--font-display)", fontStyle:"italic",
                      fontSize:"1.3rem",
                      color:score/quizData.questions.length>=0.8?"var(--emerald)":score/quizData.questions.length>=0.5?"var(--amber)":"var(--rose)",
                    }}>
                      {Math.round(score/quizData.questions.length*100)}%
                    </div>
                  </div>

                  <p style={{ color:"var(--ink-2)", marginBottom:4, fontSize:"0.9rem", fontWeight:600 }}>
                    {score} correct out of {quizData.questions.length}
                  </p>
                  <p style={{ color:"var(--ink-3)", fontSize:"0.8rem", marginBottom:20 }}>
                    {score/quizData.questions.length>=0.8 ? "Excellent! You've mastered this topic." :
                     score/quizData.questions.length>=0.5 ? "Good effort! Keep practicing." :
                     "Keep going! Review the topic and try again."}
                  </p>

                  <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
                    {!submitted ? (
                      <button className="btn-glow" onClick={handleSave} style={{ padding:"9px 22px" }}>
                        Save to Progress
                      </button>
                    ) : (
                      <div style={{ color:"var(--emerald)", fontWeight:700, padding:"9px 0", fontSize:"0.9rem" }}>
                        ✓ Progress saved!
                      </div>
                    )}
                    <button onClick={handleRetry} style={{
                      padding:"9px 22px", borderRadius:9, cursor:"pointer",
                      border:"1px solid var(--border-med)", background:"var(--bg-elevated)",
                      color:"var(--ink-2)", fontFamily:"var(--font-body)", fontWeight:600, fontSize:"0.88rem",
                      transition:"all 0.15s",
                    }}
                      onMouseEnter={e => e.currentTarget.style.color="var(--ink)"}
                      onMouseLeave={e => e.currentTarget.style.color="var(--ink-2)"}>
                      Retry Quiz
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {!quizData && !loading && (
            <div className="glass" style={{ padding:60, textAlign:"center" }}>
              <div style={{ fontSize:"2.5rem", marginBottom:16, opacity:0.3 }}>◉</div>
              <p style={{ color:"var(--ink-3)", fontSize:"0.9rem" }}>Configure your quiz and click Generate</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
