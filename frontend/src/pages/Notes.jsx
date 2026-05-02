import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { toast } from "../components/Toast";
import PageHeader from "../components/PageHeader";
import { SkeletonList } from "../components/SkeletonCard";

const SUBJECT_COLORS = ["var(--amber)","var(--teal)","var(--purple)","var(--coral)","var(--blue)"];
function subjectColor(name="") {
  let h = 0; for (let i=0;i<name.length;i++) h = (h*31+name.charCodeAt(i))%5;
  return SUBJECT_COLORS[h];
}

export default function Notes() {
  const navigate = useNavigate();
  const [notes,    setNotes]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [search,   setSearch]   = useState("");

  useEffect(() => { api.get("/notes").then(r=>setNotes(r.data)).catch(()=>{}).finally(()=>setLoading(false)); }, []);

  const handleDelete = async id => {
    if (!window.confirm("Delete this note?")) return;
    try { await api.delete(`/notes/${id}`); setNotes(p=>p.filter(n=>n.id!==id)); toast.success("Note deleted."); }
    catch { toast.error("Failed to delete."); }
  };
  const handleCopy = content => { navigator.clipboard.writeText(content); toast.success("Copied!"); };
  const handlePDF = note => {
    const win = window.open("","_blank");
    win.document.write(`<!DOCTYPE html><html><head><title>${note.topic}</title><style>body{font-family:Georgia,serif;font-size:12pt;line-height:1.9;color:#111;margin:2cm;}h1{font-size:18pt;border-bottom:1px solid #ccc;padding-bottom:6pt;margin-bottom:4pt;}.meta{font-size:9pt;color:#666;margin-bottom:18pt;}</style></head><body><h1>${note.topic}</h1><p class="meta">${note.subject} · ${new Date(note.created_at).toLocaleDateString()}</p><div>${note.content.replace(/\n/g,"<br/>")}</div></body></html>`);
    win.document.close(); win.print();
  };

  const filtered = notes.filter(n => {
    if (!search) return true;
    const s = search.toLowerCase();
    return n.subject?.toLowerCase().includes(s) || n.topic?.toLowerCase().includes(s);
  });

  return (
    <div>
      <PageHeader title="My" accent="Notes" accentColor="var(--amber)"
        sub={`${notes.length} note${notes.length!==1?"s":""} generated`}
        actions={<button className="btn-glow" onClick={()=>navigate("/generate-note")} style={{ padding:"7px 14px", fontSize:13 }}>+ New Note</button>}/>

      {notes.length > 0 && (
        <div className="fade-up" style={{ marginBottom:16 }}>
          <input className="glow-input" type="text" placeholder="Search by subject or topic…"
            value={search} onChange={e=>setSearch(e.target.value)} style={{ maxWidth:340 }}/>
        </div>
      )}

      {loading && <SkeletonList count={4}/>}
      {!loading && filtered.length === 0 && (
        <div className="glass" style={{ padding:"48px 24px", textAlign:"center" }}>
          <p style={{ color:"var(--ink-3)", fontSize:13, marginBottom:18 }}>
            {search ? "No notes match your search." : "No notes yet. Generate your first note!"}
          </p>
          {!search && <button className="btn-glow" onClick={()=>navigate("/generate-note")}>Generate Note</button>}
        </div>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {filtered.map((note, idx) => {
          const isExp  = expanded === note.id;
          const wc     = note.content?.trim().split(/\s+/).length || 0;
          const preview= note.content?.slice(0,160) + (note.content?.length > 160 ? "…" : "");
          const color  = subjectColor(note.subject);
          return (
            <div key={note.id} className="fade-up" style={{ background:"var(--bg-2)", border:"0.5px solid var(--border)", borderRadius:"var(--r-lg)", overflow:"hidden", animationDelay:`${idx*.04}s` }}>
              {/* Colour dot header */}
              <div style={{ padding:"13px 16px", borderBottom: isExp ? "0.5px solid var(--border)" : "none" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                      <div style={{ width:6, height:6, borderRadius:"50%", background:color, flexShrink:0 }}/>
                      <span style={{ fontSize:13, fontWeight:500, color:"var(--ink)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:160 }}>{note.subject}</span>
                      <span style={{ color:"var(--ink-4)", fontSize:12 }}>›</span>
                      <span style={{ fontSize:13, color:"var(--ink-2)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1, maxWidth:200 }}>{note.topic}</span>
                    </div>
                    <div style={{ display:"flex", gap:10, fontSize:11, color:"var(--ink-4)" }}>
                      <span>{new Date(note.created_at).toLocaleDateString()}</span>
                      <span>· {wc} words</span>
                    </div>
                    {!isExp && <p style={{ color:"var(--ink-3)", fontSize:12, marginTop:7, lineHeight:1.6 }}>{preview}</p>}
                  </div>
                  <div style={{ display:"flex", gap:5, flexShrink:0, flexWrap:"wrap", justifyContent:"flex-end" }}>
                    <button onClick={()=>setExpanded(isExp?null:note.id)} style={{ padding:"4px 10px", borderRadius:6, cursor:"pointer", border:"0.5px solid var(--border-med)", background:"var(--bg-elevated)", color:"var(--ink-2)", fontFamily:"var(--font-body)", fontSize:12, transition:"all .13s" }}>{isExp?"Collapse":"Read"}</button>
                    <button onClick={()=>handleCopy(note.content)} style={{ padding:"4px 9px", borderRadius:6, cursor:"pointer", border:"0.5px solid var(--border)", background:"transparent", color:"var(--ink-3)", fontFamily:"var(--font-body)", fontSize:12 }}>Copy</button>
                    <button onClick={()=>handlePDF(note)} style={{ padding:"4px 9px", borderRadius:6, cursor:"pointer", border:"0.5px solid var(--border)", background:"transparent", color:"var(--ink-3)", fontFamily:"var(--font-body)", fontSize:12 }}>PDF</button>
                    <button onClick={()=>handleDelete(note.id)} style={{ padding:"4px 8px", borderRadius:6, cursor:"pointer", border:"0.5px solid transparent", background:"transparent", color:"var(--ink-4)", fontFamily:"var(--font-body)", fontSize:12, transition:"all .13s" }}
                      onMouseEnter={e=>{e.currentTarget.style.color="var(--coral)";e.currentTarget.style.borderColor="var(--coral-border)";}}
                      onMouseLeave={e=>{e.currentTarget.style.color="var(--ink-4)";e.currentTarget.style.borderColor="transparent";}}>✕</button>
                  </div>
                </div>
              </div>
              {isExp && (
                <div style={{ padding:"16px 18px", color:"var(--ink-2)", lineHeight:1.9, fontSize:13, whiteSpace:"pre-line", background:"var(--bg-elevated)" }}>
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