import { useState, useEffect } from "react";
import { getQuizzes, deleteQuiz } from "../services/api";
import { toast } from "../components/Toast";

const optLabel = (i) => ["A","B","C","D"][i] ?? i;
const scoreColor = (s,t) => { const p=s/t*100; return p>=80?"#34d399":p>=50?"#fbbf24":"#f87171"; };

export default function MyQuizzes() {
  const [quizzes, setQuizzes]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch]     = useState("");
  const [sortBy, setSortBy]     = useState("newest");

  useEffect(() => { fetchQuizzes(); }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const r = await getQuizzes();
      setQuizzes(r.data);
    } catch { toast.error("Failed to load quizzes."); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this quiz?")) return;
    try {
      await deleteQuiz(id);
      setQuizzes(prev => prev.filter(q => q.id !== id));
      toast.success("Quiz deleted.");
    } catch { toast.error("Failed to delete quiz."); }
  };

  const filtered = quizzes
    .filter(q => {
      if (!search) return true;
      const s = search.toLowerCase();
      return q.subject?.toLowerCase().includes(s) || q.topic?.toLowerCase().includes(s);
    })
    .sort((a,b) => {
      if (sortBy === "newest") return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === "oldest") return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === "subject") return (a.subject||"").localeCompare(b.subject||"");
      return 0;
    });

  return (
    <div>
      <div className="fade-up" style={{ marginBottom:32 }}>
        <h1 className="title-font" style={{ fontSize:"2.4rem", letterSpacing:"-0.03em", marginBottom:8 }}>
          Quiz{" "}
          <span style={{ background:"linear-gradient(135deg,#34d399,#06b6d4)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>History</span>
        </h1>
        <p style={{ color:"#64748b", fontSize:"0.95rem" }}>
          {quizzes.length} quiz{quizzes.length!==1?"zes":""} generated
        </p>
      </div>

      {/* Search + Sort */}
      {quizzes.length > 0 && (
        <div className="fade-up" style={{ display:"flex", gap:12, marginBottom:24 }}>
          <input className="glow-input" type="text" placeholder="🔍 Search by subject or topic..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex:1, maxWidth:360 }} />
          <select className="glow-input" value={sortBy} onChange={e => setSortBy(e.target.value)}
            style={{ width:160 }}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="subject">By Subject</option>
          </select>
        </div>
      )}

      {loading && (
        <div style={{ padding:"80px 0", textAlign:"center" }}>
          <div className="loader" style={{ marginBottom:14 }}/>
          <p style={{ color:"#475569", fontSize:"0.9rem" }}>Loading quizzes...</p>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="glass" style={{ padding:64, textAlign:"center" }}>
          <div style={{ fontSize:"3rem", marginBottom:14 }}>🧠</div>
          <p style={{ color:"#475569" }}>{search ? "No quizzes match your search." : "No quizzes yet. Generate one to get started!"}</p>
        </div>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {filtered.map((quiz, idx) => {
          let parsed = null;
          try { parsed = typeof quiz.content === "string" ? JSON.parse(quiz.content) : quiz.content; } catch {}
          const isExp = expanded === quiz.id;
          const qCount = parsed?.questions?.length || 0;

          return (
            <div key={quiz.id} className="glass fade-up"
              style={{ overflow:"hidden", animationDelay:`${idx*0.04}s` }}>
              {/* Header */}
              <div style={{ padding:"16px 22px", display:"flex", alignItems:"center", gap:16,
                borderBottom: isExp ? "1px solid rgba(99,102,241,0.12)" : "none" }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                    <span style={{ fontWeight:700, color:"#818cf8", fontSize:"0.88rem",
                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:200 }}>
                      {quiz.subject || "Custom"}
                    </span>
                    <span style={{ color:"#334155" }}>›</span>
                    <span style={{ color:"#e2e8f0", fontSize:"0.88rem", fontWeight:600,
                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>
                      {quiz.topic || "—"}
                    </span>
                  </div>
                  <div style={{ display:"flex", gap:12, fontSize:"0.73rem", color:"#475569" }}>
                    <span>{new Date(quiz.created_at).toLocaleString()}</span>
                    {qCount > 0 && <span style={{ color:"#6366f1" }}>· {qCount} questions</span>}
                  </div>
                </div>

                <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                  <button onClick={() => setExpanded(isExp ? null : quiz.id)} style={{
                    padding:"6px 14px", borderRadius:8, cursor:"pointer",
                    border:"1px solid rgba(99,102,241,0.3)", background:"rgba(99,102,241,0.1)",
                    color:"#818cf8", fontFamily:"'Space Grotesk',sans-serif",
                    fontSize:"0.78rem", fontWeight:600,
                  }}>{isExp ? "▲ Hide" : "▼ View"}</button>
                  <button onClick={() => handleDelete(quiz.id)} style={{
                    padding:"6px 12px", borderRadius:8, cursor:"pointer",
                    border:"1px solid rgba(239,68,68,0.3)", background:"rgba(239,68,68,0.08)",
                    color:"#f87171", fontFamily:"'Space Grotesk',sans-serif",
                    fontSize:"0.78rem", fontWeight:600,
                  }}>✕</button>
                </div>
              </div>

              {/* Expanded questions */}
              {isExp && parsed?.questions && (
                <div style={{ padding:"18px 22px" }}>
                  <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                    {parsed.questions.map((q, qi) => (
                      <div key={qi} style={{ padding:16, borderRadius:10,
                        background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)" }}>
                        <p style={{ fontWeight:600, color:"#e2e8f0", marginBottom:10, fontSize:"0.88rem", lineHeight:1.5 }}>
                          <span style={{ color:"#6366f1", marginRight:8 }}>Q{qi+1}.</span>{q.question}
                        </p>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                          {q.options.map((opt,oi) => (
                            <div key={oi} style={{ padding:"7px 12px", borderRadius:8, fontSize:"0.82rem",
                              background: oi===q.correct_answer ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.02)",
                              border: oi===q.correct_answer ? "1px solid rgba(52,211,153,0.35)" : "1px solid rgba(255,255,255,0.05)",
                              color: oi===q.correct_answer ? "#34d399" : "#64748b",
                              fontWeight: oi===q.correct_answer ? 700 : 400,
                              display:"flex", alignItems:"center", gap:8,
                            }}>
                              <span style={{ color:"#334155", fontWeight:700 }}>{optLabel(oi)}.</span>
                              {opt}
                              {oi===q.correct_answer && <span style={{ marginLeft:"auto" }}>✓</span>}
                            </div>
                          ))}
                        </div>
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
