import { useEffect, useState } from "react";
import api from "../services/api";
import { toast } from "../components/Toast";

export default function Notes() {
  const [notes, setNotes]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch]   = useState("");

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
    const blob = new Blob([note.content], { type: "text/plain" });
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
      <div className="fade-up" style={{ marginBottom:32 }}>
        <h1 className="title-font" style={{ fontSize:"2.4rem", letterSpacing:"-0.03em", marginBottom:8 }}>
          My{" "}
          <span style={{ background:"linear-gradient(135deg,#fbbf24,#f97316)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Notes</span>
        </h1>
        <p style={{ color:"#64748b", fontSize:"0.95rem" }}>
          {notes.length} note{notes.length!==1?"s":""} generated
        </p>
      </div>

      {notes.length > 0 && (
        <div className="fade-up" style={{ marginBottom:22 }}>
          <input className="glow-input" type="text" placeholder="🔍 Search notes by subject or topic..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ maxWidth:400 }} />
        </div>
      )}

      {loading && (
        <div style={{ padding:"80px 0", textAlign:"center" }}>
          <div className="loader" style={{ marginBottom:14 }} />
          <p style={{ color:"#475569", fontSize:"0.9rem" }}>Loading notes...</p>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="glass" style={{ padding:64, textAlign:"center" }}>
          <div style={{ fontSize:"3rem", marginBottom:14 }}>📝</div>
          <p style={{ color:"#475569" }}>{search ? "No notes match your search." : "No notes yet. Generate your first note!"}</p>
        </div>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {filtered.map((note, idx) => {
          const isExp = expanded === note.id;
          const wordCount = note.content?.trim().split(/\s+/).length || 0;
          const preview = note.content?.slice(0, 160) + (note.content?.length > 160 ? "..." : "");
          return (
            <div key={note.id} className="glass fade-up"
              style={{ overflow:"hidden", animationDelay:`${idx*0.04}s` }}>
              <div style={{ padding:"16px 22px",
                borderBottom: isExp ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:16 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                      <span style={{ fontWeight:700, color:"#fbbf24", fontSize:"0.88rem",
                        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:200 }}>
                        {note.subject}
                      </span>
                      <span style={{ color:"#334155" }}>›</span>
                      <span style={{ color:"#e2e8f0", fontSize:"0.88rem", fontWeight:600,
                        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>
                        {note.topic}
                      </span>
                    </div>
                    <div style={{ display:"flex", gap:12, fontSize:"0.73rem", color:"#475569" }}>
                      <span>{new Date(note.created_at).toLocaleString()}</span>
                      <span style={{ color:"#6366f1" }}>· {wordCount} words</span>
                    </div>
                    {!isExp && (
                      <p style={{ color:"#475569", fontSize:"0.82rem", marginTop:8, lineHeight:1.55 }}>
                        {preview}
                      </p>
                    )}
                  </div>
                  <div style={{ display:"flex", gap:7, flexShrink:0 }}>
                    <button onClick={() => setExpanded(isExp ? null : note.id)} style={{
                      padding:"6px 12px", borderRadius:8, cursor:"pointer",
                      border:"1px solid rgba(251,191,36,0.3)", background:"rgba(251,191,36,0.08)",
                      color:"#fbbf24", fontFamily:"'Space Grotesk',sans-serif",
                      fontSize:"0.78rem", fontWeight:600,
                    }}>{isExp ? "▲" : "▼ Read"}</button>
                    <button onClick={() => handleCopy(note.content)} style={{
                      padding:"6px 12px", borderRadius:8, cursor:"pointer",
                      border:"1px solid rgba(99,102,241,0.3)", background:"rgba(99,102,241,0.08)",
                      color:"#818cf8", fontFamily:"'Space Grotesk',sans-serif",
                      fontSize:"0.78rem", fontWeight:600,
                    }}>Copy</button>
                    <button onClick={() => handleDownload(note)} style={{
                      padding:"6px 12px", borderRadius:8, cursor:"pointer",
                      border:"1px solid rgba(6,182,212,0.3)", background:"rgba(6,182,212,0.08)",
                      color:"#22d3ee", fontFamily:"'Space Grotesk',sans-serif",
                      fontSize:"0.78rem", fontWeight:600,
                    }}>↓</button>
                    <button onClick={() => handleDelete(note.id)} style={{
                      padding:"6px 10px", borderRadius:8, cursor:"pointer",
                      border:"1px solid rgba(239,68,68,0.3)", background:"rgba(239,68,68,0.08)",
                      color:"#f87171", fontFamily:"'Space Grotesk',sans-serif",
                      fontSize:"0.78rem", fontWeight:600,
                    }}>✕</button>
                  </div>
                </div>
              </div>
              {isExp && (
                <div style={{ padding:"20px 24px", whiteSpace:"pre-line",
                  color:"#cbd5e1", lineHeight:1.9, fontSize:"0.9rem" }}>
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
