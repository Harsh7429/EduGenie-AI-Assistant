import { useEffect, useState } from "react";
import api from "../services/api";
import { toast } from "../components/Toast";

export default function Notes() {
  const [notes, setNotes]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch]     = useState("");

  useEffect(() => {
    api.get("/notes").then(r => setNotes(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      await api.delete(`/notes/${id}`);
      setNotes(prev => prev.filter(n => n.id !== id));
      toast.success("Note deleted.");
    } catch { toast.error("Failed to delete note."); }
  };

  const handleDownload = (note) => {
    const blob = new Blob([note.content], { type:"text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${note.subject}_${note.topic}_note.txt`.replace(/\s+/g,"_");
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded!");
  };

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard!");
  };

  const filtered = notes.filter(n => {
    if (!search) return true;
    const s = search.toLowerCase();
    return n.subject?.toLowerCase().includes(s) || n.topic?.toLowerCase().includes(s);
  });

  return (
    <div>
      <div className="fade-up" style={{ marginBottom:28 }}>
        <h1 style={{
          fontFamily:"var(--font-display)", fontStyle:"italic",
          fontSize:"2.4rem", color:"var(--ink)", marginBottom:8,
        }}>
          My <span style={{ color:"var(--amber)" }}>Notes</span>
        </h1>
        <p style={{ color:"var(--ink-3)", fontSize:"0.92rem" }}>
          {notes.length} note{notes.length!==1?"s":""} generated
        </p>
      </div>

      {notes.length > 0 && (
        <div className="fade-up" style={{ marginBottom:20 }}>
          <input className="glow-input" type="text" placeholder="Search notes by subject or topic…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ maxWidth:380 }} />
        </div>
      )}

      {loading && (
        <div style={{ padding:"80px 0", textAlign:"center" }}>
          <div className="loader" style={{ marginBottom:14 }} />
          <p style={{ color:"var(--ink-3)", fontSize:"0.9rem" }}>Loading notes…</p>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="glass" style={{ padding:64, textAlign:"center" }}>
          <div style={{ fontSize:"2.5rem", marginBottom:14, opacity:0.25 }}>✎</div>
          <p style={{ color:"var(--ink-3)", fontSize:"0.9rem" }}>
            {search ? "No notes match your search." : "No notes yet. Generate your first note!"}
          </p>
        </div>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {filtered.map((note, idx) => {
          const isExp = expanded === note.id;
          const wordCount = note.content?.trim().split(/\s+/).length || 0;
          const preview = note.content?.slice(0,180) + (note.content?.length > 180 ? "…" : "");
          return (
            <div key={note.id} className="glass fade-up"
              style={{ overflow:"hidden", animationDelay:`${idx*0.04}s` }}>
              <div style={{
                padding:"14px 20px",
                borderBottom: isExp ? "1px solid var(--border)" : "none",
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:14 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                      <span style={{
                        fontWeight:600, color:"var(--ink)", fontSize:"0.88rem",
                        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:200,
                      }}>{note.subject}</span>
                      <span style={{ color:"var(--ink-4)", fontSize:"0.78rem" }}>›</span>
                      <span style={{
                        color:"var(--ink-2)", fontSize:"0.85rem",
                        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1,
                      }}>{note.topic}</span>
                    </div>
                    <div style={{ display:"flex", gap:12, fontSize:"0.72rem", color:"var(--ink-3)" }}>
                      <span>{new Date(note.created_at).toLocaleString()}</span>
                      <span>· {wordCount} words</span>
                    </div>
                    {!isExp && (
                      <p style={{ color:"var(--ink-3)", fontSize:"0.82rem", marginTop:8, lineHeight:1.55 }}>
                        {preview}
                      </p>
                    )}
                  </div>
                  <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                    <button onClick={() => setExpanded(isExp?null:note.id)} style={{
                      padding:"5px 12px", borderRadius:7, cursor:"pointer",
                      border:"1px solid var(--border-med)", background:"var(--bg-elevated)",
                      color:"var(--ink-2)", fontFamily:"var(--font-body)",
                      fontSize:"0.78rem", fontWeight:500, transition:"all 0.15s",
                    }}
                      onMouseEnter={e => e.currentTarget.style.color="var(--amber)"}
                      onMouseLeave={e => e.currentTarget.style.color="var(--ink-2)"}>
                      {isExp ? "Collapse" : "Read"}
                    </button>
                    <button onClick={() => handleCopy(note.content)} style={{
                      padding:"5px 10px", borderRadius:7, cursor:"pointer",
                      border:"1px solid var(--border)", background:"transparent",
                      color:"var(--ink-3)", fontFamily:"var(--font-body)",
                      fontSize:"0.78rem", transition:"all 0.15s",
                    }}
                      onMouseEnter={e => e.currentTarget.style.color="var(--ink)"}
                      onMouseLeave={e => e.currentTarget.style.color="var(--ink-3)"}>Copy</button>
                    <button onClick={() => handleDownload(note)} style={{
                      padding:"5px 10px", borderRadius:7, cursor:"pointer",
                      border:"1px solid var(--border)", background:"transparent",
                      color:"var(--ink-3)", fontFamily:"var(--font-body)",
                      fontSize:"0.78rem", transition:"all 0.15s",
                    }}
                      onMouseEnter={e => e.currentTarget.style.color="var(--teal)"}
                      onMouseLeave={e => e.currentTarget.style.color="var(--ink-3)"}>↓</button>
                    <button onClick={() => handleDelete(note.id)} style={{
                      padding:"5px 8px", borderRadius:7, cursor:"pointer",
                      border:"1px solid transparent", background:"transparent",
                      color:"var(--ink-4)", fontFamily:"var(--font-body)",
                      fontSize:"0.78rem", transition:"all 0.15s",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.color="var(--rose)"; e.currentTarget.style.borderColor="rgba(251,113,133,0.25)"; }}
                      onMouseLeave={e => { e.currentTarget.style.color="var(--ink-4)"; e.currentTarget.style.borderColor="transparent"; }}>
                      ✕
                    </button>
                  </div>
                </div>
              </div>
              {isExp && (
                <div style={{
                  padding:"18px 22px",
                  color:"var(--ink-2)", lineHeight:1.9, fontSize:"0.9rem",
                  whiteSpace:"pre-line", background:"var(--bg-elevated)",
                }}>
                  {note.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
