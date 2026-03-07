import { useState, useEffect } from "react";
import api, { getSubjects, generateQuiz, generateTopics } from "../services/api";
import { toast } from "../components/Toast";

const L = ({ children }) => (
  <label style={{ display:"block", fontSize:"0.75rem", color:"#64748b", marginBottom:7,
    fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em" }}>{children}</label>
);
const optLabel = (i) => ["A","B","C","D"][i] ?? i;

const DIFFICULTY_OPTIONS = [
  { value:"easy",   label:"Easy",   desc:"Basic recall", color:"#34d399", icon:"🟢" },
  { value:"medium", label:"Medium", desc:"Conceptual",   color:"#fbbf24", icon:"🟡" },
  { value:"hard",   label:"Hard",   desc:"Advanced",     color:"#f87171", icon:"🔴" },
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

  // Countdown timer
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
      const r = await generateQuiz(
        isCustom ? customSubj : selSubject,
        selTopic,
        difficulty,
        numQ
      );
      setQuizData(r.data.quiz);
      setQuizId(r.data.quiz_id);
      // Start timer: 1.5 min per question
      setTimeLeft(numQ * 90);
      setTimerActive(true);
      toast.success("Quiz ready! Good luck 🎯");
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
    toast.info("⏰ Time's up! Quiz auto-submitted.");
  };

  const handleSave = async () => {
    if (!quizId) { toast.error("No quiz ID."); return; }
    try {
      await api.post(`/quizzes/${quizId}/submit`, { score, total_marks: quizData.questions.length });
      setSubmitted(true);
      toast.success("Progress saved! 🎉");
    } catch (err) {
      toast.error("Save failed: " + (err?.response?.data?.error || err.message));
    }
  };

  const handleRetry = () => {
    setQuizData(null); setScore(null); setAnswers({});
    setSubmitted(false); setTimerActive(false); setTimeLeft(null);
    // Re-generate same quiz
    handleGenerateQuiz(mode === "custom");
  };

  const switchMode = (m) => {
    setMode(m); setSelSubject(""); setSelTopic(""); setCustomSubj("");
    setGenTopics([]); setTopics([]); setQuizData(null); setAnswers({});
    setScore(null); setSubmitted(false); setTimerActive(false); setTimeLeft(null);
  };

  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const timerColor = timeLeft < 60 ? "#f87171" : timeLeft < 180 ? "#fbbf24" : "#34d399";
  const answeredCount = Object.keys(answers).length;
  const totalQ = quizData?.questions?.length || numQ;
  const canSubmit = answeredCount > 0;

  return (
    <div>
      {/* Header */}
      <div className="fade-up" style={{ marginBottom:32 }}>
        <h1 className="title-font" style={{ fontSize:"2.4rem", letterSpacing:"-0.03em", marginBottom:8 }}>
          Generate{" "}
          <span style={{ background:"linear-gradient(135deg,#a78bfa,#06b6d4)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Quiz</span>
        </h1>
        <p style={{ color:"#64748b", fontSize:"0.95rem" }}>
          AI-generated MCQs with difficulty levels, timer & progress tracking
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="fade-up" style={{ display:"inline-flex", gap:4, padding:4,
        background:"rgba(255,255,255,0.04)", borderRadius:12,
        border:"1px solid rgba(99,102,241,0.15)", marginBottom:24 }}>
        {[["structured","📚 Structured"],["custom","🧪 Custom"]].map(([m,lbl]) => (
          <button key={m} onClick={() => switchMode(m)} style={{
            padding:"7px 18px", borderRadius:9, border:"none", cursor:"pointer",
            fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, fontSize:"0.83rem",
            background: mode===m ? "linear-gradient(135deg,#6366f1,#7c3aed)" : "transparent",
            color: mode===m ? "#fff" : "#64748b",
            boxShadow: mode===m ? "0 0 14px rgba(99,102,241,0.4)" : "none",
            transition:"all 0.2s ease",
          }}>{lbl}</button>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"360px 1fr", gap:24, alignItems:"start" }}>
        {/* Config panel */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {/* Subject/Topic selector */}
          <div className="glass fade-up" style={{ padding:24 }}>
            {mode === "structured" ? (
              <>
                <div style={{ marginBottom:16 }}>
                  <L>Subject</L>
                  <select className="glow-input" value={selSubject}
                    onChange={e => { setSelSubject(e.target.value); setSelTopic(""); fetchTopics(e.target.value); }}>
                    <option value="">-- Select Subject --</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <L>Topic</L>
                  <select className="glow-input" value={selTopic}
                    onChange={e => setSelTopic(e.target.value)}
                    disabled={!topics.length} style={{ opacity: topics.length ? 1 : 0.4 }}>
                    <option value="">-- Select Topic --</option>
                    {topics.map(t => <option key={t.id} value={t.id}>
                      {t.name}
                    </option>)}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div style={{ marginBottom:14 }}>
                  <L>Custom Subject</L>
                  <input className="glow-input" type="text" placeholder="e.g. Machine Learning"
                    value={customSubj} onChange={e => setCustomSubj(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleGenerateTopics()} />
                </div>
                <button onClick={handleGenerateTopics} disabled={!customSubj.trim() || topicLoading}
                  style={{ padding:"7px 16px", borderRadius:8, border:"1px solid rgba(6,182,212,0.35)",
                    background:"rgba(6,182,212,0.1)", color:"#22d3ee", cursor:"pointer",
                    fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, fontSize:"0.82rem",
                    marginBottom:14, opacity: customSubj.trim() ? 1 : 0.4 }}>
                  {topicLoading ? "Thinking..." : "Suggest Topics"}
                </button>
                {genTopics.length > 0 && (
                  <div>
                    <L>Pick a Topic</L>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                      {genTopics.map((t,i) => {
                        const name = t.name || t;
                        const sel = selTopic === name;
                        return (
                          <button key={i} onClick={() => setSelTopic(name)} style={{
                            padding:"5px 12px", borderRadius:99, cursor:"pointer",
                            fontFamily:"'Space Grotesk',sans-serif", fontSize:"0.78rem", fontWeight:600,
                            border: sel ? "1px solid #818cf8" : "1px solid rgba(99,102,241,0.2)",
                            background: sel ? "rgba(99,102,241,0.25)" : "rgba(99,102,241,0.06)",
                            color: sel ? "#818cf8" : "#64748b", transition:"all 0.2s",
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
          <div className="glass fade-up" style={{ padding:22 }}>
            <L>Difficulty</L>
            <div style={{ display:"flex", gap:8 }}>
              {DIFFICULTY_OPTIONS.map(d => (
                <button key={d.value} onClick={() => setDifficulty(d.value)} style={{
                  flex:1, padding:"10px 6px", borderRadius:10, cursor:"pointer", textAlign:"center",
                  border: difficulty===d.value ? `1px solid ${d.color}66` : "1px solid rgba(255,255,255,0.06)",
                  background: difficulty===d.value ? `${d.color}15` : "rgba(255,255,255,0.02)",
                  fontFamily:"'Space Grotesk',sans-serif", transition:"all 0.2s",
                }}>
                  <div style={{ fontSize:"1.1rem", marginBottom:4 }}>{d.icon}</div>
                  <div style={{ fontSize:"0.75rem", fontWeight:700, color: difficulty===d.value ? d.color : "#64748b" }}>
                    {d.label}
                  </div>
                  <div style={{ fontSize:"0.65rem", color:"#334155", marginTop:2 }}>{d.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Question count */}
          <div className="glass fade-up" style={{ padding:22 }}>
            <L>Number of Questions: <span style={{ color:"#818cf8" }}>{numQ}</span></L>
            <input type="range" min={3} max={15} step={1} value={numQ}
              onChange={e => setNumQ(Number(e.target.value))}
              style={{ width:"100%", accentColor:"#6366f1", cursor:"pointer", margin:"8px 0" }} />
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:"0.7rem", color:"#334155" }}>
              <span>3</span><span>15</span>
            </div>
          </div>

          {/* Generate button */}
          <button className="btn-glow" disabled={loading ||
            (mode==="structured" ? (!selSubject||!selTopic) : (!customSubj.trim()||!selTopic))}
            onClick={() => handleGenerateQuiz(mode === "custom")}
            style={{ padding:13, fontSize:"0.95rem", width:"100%" }}>
            {loading ? "⏳ Generating..." : `✦ Generate ${numQ} Questions`}
          </button>
        </div>

        {/* Quiz area */}
        <div>
          {loading && (
            <div className="glass fade-up" style={{ padding:60, textAlign:"center" }}>
              <div className="loader" style={{ marginBottom:16 }} />
              <p style={{ color:"#64748b" }}>AI is crafting your {numQ} {difficulty} questions...</p>
            </div>
          )}

          {quizData?.questions && !loading && (
            <div className="glass fade-up" style={{ padding:28 }}>
              {/* Quiz header */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                marginBottom:24, paddingBottom:16,
                borderBottom:"1px solid rgba(99,102,241,0.15)" }}>
                <div>
                  <h3 className="title-font" style={{ fontSize:"1.1rem", marginBottom:4 }}>
                    {quizData.questions.length} Questions ·{" "}
                    <span style={{ color: DIFFICULTY_OPTIONS.find(d=>d.value===difficulty)?.color ?? "#818cf8", fontSize:"0.9rem" }}>
                      {difficulty.charAt(0).toUpperCase()+difficulty.slice(1)}
                    </span>
                  </h3>
                  <p style={{ color:"#475569", fontSize:"0.78rem" }}>
                    {answeredCount}/{quizData.questions.length} answered
                    {score === null && ` · ${quizData.questions.length - answeredCount} remaining`}
                  </p>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  {/* Timer */}
                  {timerActive && timeLeft !== null && (
                    <div style={{ padding:"6px 14px", borderRadius:99,
                      background:`${timerColor}15`, border:`1px solid ${timerColor}44`,
                      color:timerColor, fontWeight:700, fontSize:"0.9rem",
                      fontFamily:"'Syne',sans-serif" }}>
                      ⏱ {formatTime(timeLeft)}
                    </div>
                  )}
                  {score !== null && (
                    <div style={{ padding:"6px 16px", borderRadius:99,
                      background:"rgba(99,102,241,0.15)", border:"1px solid rgba(99,102,241,0.3)",
                      color:"#818cf8", fontWeight:700, fontSize:"0.9rem" }}>
                      🎯 {score}/{quizData.questions.length}
                    </div>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              {score === null && (
                <div style={{ height:4, background:"rgba(255,255,255,0.06)", borderRadius:99,
                  marginBottom:24, overflow:"hidden" }}>
                  <div style={{ height:"100%", borderRadius:99, background:"#6366f1",
                    width:`${(answeredCount/quizData.questions.length)*100}%`,
                    transition:"width 0.3s ease", boxShadow:"0 0 8px rgba(99,102,241,0.6)" }} />
                </div>
              )}

              {/* Questions */}
              {quizData.questions.map((q, qi) => {
                const answered = score !== null;
                const isRight = answered && answers[qi] === q.correct_answer;
                return (
                  <div key={qi} style={{
                    marginBottom:20, padding:18, borderRadius:12,
                    background: answered ? (isRight ? "rgba(52,211,153,0.05)" : "rgba(248,113,113,0.05)") : "rgba(255,255,255,0.02)",
                    border: answered ? (isRight ? "1px solid rgba(52,211,153,0.25)" : "1px solid rgba(248,113,113,0.2)") : "1px solid rgba(255,255,255,0.05)",
                    transition:"all 0.3s",
                  }}>
                    <p style={{ fontWeight:600, color:"#e2e8f0", marginBottom:12,
                      fontSize:"0.92rem", lineHeight:1.55 }}>
                      <span style={{ color:"#6366f1", marginRight:8, fontWeight:700 }}>Q{qi+1}.</span>
                      {q.question}
                      {answered && <span style={{ marginLeft:10, fontSize:"0.8rem" }}>
                        {isRight ? "✅" : "❌"}
                      </span>}
                    </p>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
                      {q.options.map((opt, oi) => {
                        const isSel = answers[qi] === oi;
                        const isCorr = q.correct_answer === oi;
                        let bg="rgba(255,255,255,0.03)", bdr="1px solid rgba(255,255,255,0.07)", clr="#94a3b8";
                        if (answered) {
                          if (isCorr) { bg="rgba(52,211,153,0.13)"; bdr="1px solid rgba(52,211,153,0.4)"; clr="#34d399"; }
                          else if (isSel) { bg="rgba(248,113,113,0.1)"; bdr="1px solid rgba(248,113,113,0.35)"; clr="#f87171"; }
                        } else if (isSel) {
                          bg="rgba(99,102,241,0.18)"; bdr="1px solid rgba(99,102,241,0.5)"; clr="#818cf8";
                        }
                        return (
                          <label key={oi} style={{
                            display:"flex", alignItems:"center", gap:9,
                            padding:"9px 13px", borderRadius:9,
                            background:bg, border:bdr, color:clr,
                            cursor: answered ? "default" : "pointer",
                            fontSize:"0.85rem",
                            fontWeight: (isSel || (answered&&isCorr)) ? 600 : 400,
                            transition:"all 0.2s ease",
                          }}>
                            <input type="radio" name={`q${qi}`} value={oi}
                              checked={isSel} disabled={answered}
                              onChange={() => setAnswers({...answers,[qi]:oi})}
                              style={{ accentColor:"#6366f1", flexShrink:0 }} />
                            <span style={{ color:"#334155", fontWeight:700, minWidth:18 }}>{optLabel(oi)}.</span>
                            <span style={{ flex:1 }}>{opt}</span>
                            {answered && isCorr && <span>✓</span>}
                            {answered && isSel && !isCorr && <span>✗</span>}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Submit / Result */}
              {score === null ? (
                <button className="btn-glow" onClick={calcScore} disabled={!canSubmit}
                  style={{ width:"100%", padding:13, marginTop:8, opacity: canSubmit ? 1 : 0.5 }}>
                  Submit Quiz ({answeredCount}/{quizData.questions.length} answered)
                </button>
              ) : (
                <div style={{ marginTop:20, padding:24, borderRadius:14, textAlign:"center",
                  background:"rgba(99,102,241,0.07)", border:"1px solid rgba(99,102,241,0.18)" }}>
                  {/* Score ring */}
                  <div style={{ position:"relative", width:100, height:100, margin:"0 auto 16px" }}>
                    <svg viewBox="0 0 36 36" style={{ width:100, height:100, transform:"rotate(-90deg)" }}>
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3"/>
                      <circle cx="18" cy="18" r="15.9" fill="none"
                        stroke={score/quizData.questions.length >= 0.8 ? "#34d399" : score/quizData.questions.length >= 0.5 ? "#fbbf24" : "#f87171"}
                        strokeWidth="3" strokeLinecap="round"
                        strokeDasharray={`${(score/quizData.questions.length)*100} 100`}
                        style={{ transition:"stroke-dasharray 1s ease" }}/>
                    </svg>
                    <div className="title-font" style={{
                      position:"absolute", inset:0, display:"flex",
                      alignItems:"center", justifyContent:"center",
                      fontSize:"1.4rem",
                      color: score/quizData.questions.length >= 0.8 ? "#34d399" : score/quizData.questions.length >= 0.5 ? "#fbbf24" : "#f87171",
                    }}>
                      {Math.round(score/quizData.questions.length*100)}%
                    </div>
                  </div>

                  <p style={{ color:"#64748b", marginBottom:4, fontSize:"0.85rem" }}>
                    {score} correct out of {quizData.questions.length}
                  </p>
                  <p style={{ color:"#475569", fontSize:"0.78rem", marginBottom:20 }}>
                    {score/quizData.questions.length >= 0.8 ? "🏆 Excellent! You've mastered this topic." :
                     score/quizData.questions.length >= 0.5 ? "📈 Good effort! Keep practicing." :
                     "💪 Keep going! Review the topic and retry."}
                  </p>

                  <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
                    {!submitted ? (
                      <button className="btn-glow" onClick={handleSave} style={{ padding:"9px 22px" }}>
                        💾 Save to Progress
                      </button>
                    ) : (
                      <div style={{ color:"#34d399", fontWeight:700, padding:"9px 0" }}>✦ Progress saved!</div>
                    )}
                    <button onClick={handleRetry} style={{
                      padding:"9px 22px", borderRadius:10, cursor:"pointer",
                      border:"1px solid rgba(6,182,212,0.35)", background:"rgba(6,182,212,0.1)",
                      color:"#22d3ee", fontFamily:"'Space Grotesk',sans-serif",
                      fontWeight:600, fontSize:"0.88rem",
                    }}>
                      🔄 Retry Quiz
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {!quizData && !loading && (
            <div className="glass" style={{ padding:64, textAlign:"center", opacity:0.6 }}>
              <div style={{ fontSize:"3rem", marginBottom:16 }}>🧠</div>
              <p style={{ color:"#475569" }}>Configure your quiz and click Generate</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
