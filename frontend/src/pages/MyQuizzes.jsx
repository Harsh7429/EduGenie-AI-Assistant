import { useState, useEffect } from "react";
import { getQuizzes, deleteQuiz } from "../services/api";
import { toast } from "../components/Toast";

const optLabel = (i) => ["A","B","C","D"][i] ?? i;
const scoreColor = (s,t) => { const p=s/t*100; return p>=80?"var(--emerald)":p>=50?"var(--amber)":"var(--rose)"; };

export default function MyQuizzes() {
  const [quizzes, setQuizzes]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch]     = useState("");
  const [sortBy, setSortBy]     = useState("newest");

  useEffect(() => { fetchQuizzes(); }, []);

  const fetchQuizzes = async () => {
    try { setLoading(true); const r = await getQuizzes(); setQuizzes(r.data); }
    catch { toast.error("Failed to load quizzes."); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this quiz?")) return;
    try { await deleteQuiz(id); setQuizzes(prev => prev.filter(q => q.id !== id)); toast.success("Quiz deleted."); }
    catch { toast.error("Failed to delete quiz."); }
  };

  const filtered = quizzes
    .filter(q => {
      if (!search) return true;
      const s = search.toLowerCase();
      return q.subject?.toLowerCase().includes(s) || q.topic?.toLowerCase().includes(s);
    })
    .sort((a,b) => {
      if (sortBy==="newest") return new Date(b.created_at)-new Date(a.created_at);
      if (sortBy==="oldest") return new Date(a.created_at)-new Date(b.created_at);
      if (sortBy==="subject") return (a.subject||"").localeCompare(b.subject||"");
      return 0;
    });

  return (
    <div>
      <div className="fade-up" style={{ marginBottom:28 }}>
        <h1 style={{
          fontFamily:"var(--font-display)", fontStyle:"italic",
          fontSize:"2.4rem", color:"var(--ink)", marginBottom:8,
        }}>
          Quiz <span style={{ color:"var(--emerald)" }}>History</span>
        </h1>
        <p style={{ color:"var(--ink-3)", fontSize:"0.92rem" }}>
          {quizzes.length} quiz{quizzes.length!==1?"zes":""} generated
        </p>
      </div>

      {quizzes.length > 0 && (
        <div className="fade-up" style={{ display:"flex", gap:10, marginBottom:22 }}>
          <input className="glow-input" type="text" placeholder="Search by subject or topic…"
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
          <p style={{ color:"var(--ink-3)", fontSize:"0.9rem" }}>Loading quizzes…</p>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="glass" style={{ padding:64, textAlign:"center" }}>
          <div style={{ fontSize:"2.5rem", marginBottom:14, opacity:0.25 }}>◉</div>
          <p style={{ color:"var(--ink-3)", fontSize:"0.9rem" }}>
            {search ? "No quizzes match your search." : "No quizzes yet. Generate one to get started!"}
          </p>
        </div>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {filtered.map((quiz, idx) => {
          let parsed = null;
          try { parsed = typeof quiz.content==="string" ? JSON.parse(quiz.content) : quiz.content; } catch {}
          const isExp = expanded === quiz.id;
          const qCount = parsed?.questions?.length || 0;

          return (
            <div key={quiz.id} className="glass fade-up"
              style={{ overflow:"hidden", animationDelay:`${idx*0.04}s` }}>
              <div style={{
                padding:"14px 20px", display:"flex", alignItems:"center", gap:14,
                borderBottom: isExp ? "1px solid var(--border)" : "none",
              }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                    <span style={{
                      fontWeight:600, color:"var(--ink)", fontSize:"0.88rem",
                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:220,
                    }}>{quiz.subject || "Custom"}</span>
                    <span style={{ color:"var(--ink-4)", fontSize:"0.78rem" }}>›</span>
                    <span style={{
                      color:"var(--ink-2)", fontSize:"0.85rem",
                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1,
                    }}>{quiz.topic || "—"}</span>
                  </div>
                  <div style={{ display:"flex", gap:12, fontSize:"0.72rem", color:"var(--ink-3)" }}>
                    <span>{new Date(quiz.created_at).toLocaleString()}</span>
                    {qCount > 0 && <span style={{ color:"var(--ink-3)" }}>· {qCount} questions</span>}
                  </div>
                </div>

                <div style={{ display:"flex", gap:7, flexShrink:0 }}>
                  <button onClick={() => setExpanded(isExp ? null : quiz.id)} style={{
                    padding:"5px 13px", borderRadius:7, cursor:"pointer",
                    border:"1px solid var(--border-med)", background:"var(--bg-elevated)",
                    color:"var(--ink-2)", fontFamily:"var(--font-body)",
                    fontSize:"0.78rem", fontWeight:500, transition:"all 0.15s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.color="var(--ink)"}
                    onMouseLeave={e => e.currentTarget.style.color="var(--ink-2)"}>
                    {isExp ? "Collapse" : "Review"}
                  </button>
                  <button onClick={() => handleDelete(quiz.id)} style={{
                    padding:"5px 10px", borderRadius:7, cursor:"pointer",
                    border:"1px solid rgba(251,113,133,0.2)", background:"transparent",
                    color:"var(--rose)", fontFamily:"var(--font-body)",
                    fontSize:"0.78rem", fontWeight:500, transition:"all 0.15s",
                  }}>✕</button>
                </div>
              </div>

              {isExp && parsed?.questions && (
                <div style={{ padding:"16px 20px" }}>
                  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    {parsed.questions.map((q, qi) => (
                      <div key={qi} style={{
                        padding:14, borderRadius:10,
                        background:"var(--bg-elevated)", border:"1px solid var(--border)",
                      }}>
                        <p style={{ fontWeight:600, color:"var(--ink)", marginBottom:10, fontSize:"0.88rem", lineHeight:1.5 }}>
                          <span style={{ color:"var(--ink-3)", marginRight:8, fontFamily:"var(--font-mono)", fontSize:"0.75rem" }}>Q{qi+1}</span>
                          {q.question}
                        </p>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5 }}>
                          {q.options.map((opt,oi) => (
                            <div key={oi} style={{
                              padding:"7px 11px", borderRadius:7, fontSize:"0.82rem",
                              background: oi===q.correct_answer ? "rgba(52,211,153,0.07)" : "var(--bg-overlay)",
                              border: oi===q.correct_answer ? "1px solid rgba(52,211,153,0.3)" : "1px solid var(--border)",
                              color: oi===q.correct_answer ? "var(--emerald)" : "var(--ink-3)",
                              fontWeight: oi===q.correct_answer ? 600 : 400,
                              display:"flex", alignItems:"center", gap:8,
                            }}>
                              <span style={{ color:"var(--ink-4)", fontFamily:"var(--font-mono)", fontSize:"0.72rem" }}>{optLabel(oi)}</span>
                              <span style={{ flex:1 }}>{opt}</span>
                              {oi===q.correct_answer && <span style={{ fontSize:"0.78rem" }}>✓</span>}
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
