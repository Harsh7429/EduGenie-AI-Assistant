import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { toast } from "../components/Toast";
import PageHeader from "../components/PageHeader";
import { SkeletonList } from "../components/SkeletonCard";

export default function Notes() {
  const navigate=useNavigate();
  const [notes,setNotes]=useState([]);
  const [loading,setLoading]=useState(true);
  const [expanded,setExpanded]=useState(null);
  const [search,setSearch]=useState("");

  useEffect(()=>{ api.get("/notes").then(r=>setNotes(r.data)).catch(()=>{}).finally(()=>setLoading(false)); },[]);

  const handleDelete=async id=>{ if(!window.confirm("Delete this note?")) return; try{ await api.delete(`/notes/${id}`); setNotes(p=>p.filter(n=>n.id!==id)); toast.success("Note deleted."); } catch{ toast.error("Failed to delete."); } };
  const handleCopy=content=>{ navigator.clipboard.writeText(content); toast.success("Copied!"); };
  const handlePDF=note=>{
    const win=window.open("","_blank");
    win.document.write(`<!DOCTYPE html><html><head><title>${note.topic}</title><style>body{font-family:Georgia,serif;font-size:12pt;line-height:1.9;color:#111;margin:2cm;}h1{font-size:18pt;border-bottom:1px solid #ccc;padding-bottom:6pt;margin-bottom:4pt;}.meta{font-size:9pt;color:#666;margin-bottom:18pt;}p{margin:0 0 10pt;}</style></head><body><h1>${note.topic}</h1><p class="meta">${note.subject} &nbsp;·&nbsp; ${new Date(note.created_at).toLocaleDateString()}</p><div>${note.content.replace(/\n/g,"<br/>")}</div></body></html>`);
    win.document.close(); win.print();
  };

  const filtered=notes.filter(n=>{ if(!search) return true; const s=search.toLowerCase(); return n.subject?.toLowerCase().includes(s)||n.topic?.toLowerCase().includes(s); });

  return (
    <div>
      <PageHeader title="My" accent="Notes" accentColor="var(--gold)"
        sub={`${notes.length} note${notes.length!==1?"s":""} generated`}
        actions={<button className="btn-glow" onClick={()=>navigate("/generate-note")} style={{ padding:"8px 16px", fontSize:".82rem" }}>+ New Note</button>}/>

      {notes.length>0 && <div className="fade-up" style={{ marginBottom:18 }}><input className="glow-input" type="text" placeholder="Search by subject or topic…" value={search} onChange={e=>setSearch(e.target.value)} style={{ maxWidth:360 }}/></div>}

      {loading && <SkeletonList count={4}/>}
      {!loading && filtered.length===0 && (
        <div className="glass" style={{ padding:"56px 24px", textAlign:"center" }}>
          <p style={{ color:"var(--ink-3)", fontSize:".9rem", marginBottom:20 }}>{search?"No notes match your search.":"No notes yet. Generate your first note!"}</p>
          {!search && <button className="btn-glow" onClick={()=>navigate("/generate-note")}>Generate Note</button>}
        </div>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {filtered.map((note,idx)=>{
          const isExp=expanded===note.id;
          const wc=note.content?.trim().split(/\s+/).length||0;
          const preview=note.content?.slice(0,160)+(note.content?.length>160?"…":"");
          return (
            <div key={note.id} className="glass fade-up" style={{ overflow:"hidden", animationDelay:`${idx*.04}s` }}>
              <div style={{ padding:"14px 18px", borderBottom:isExp?"1px solid var(--border)":"none" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:3, flexWrap:"wrap" }}>
                      <span style={{ fontWeight:600, color:"var(--ink)", fontSize:".88rem", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:160 }}>{note.subject}</span>
                      <span style={{ color:"var(--ink-4)", fontSize:".78rem" }}>›</span>
                      <span style={{ color:"var(--ink-2)", fontSize:".84rem", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1, maxWidth:180 }}>{note.topic}</span>
                    </div>
                    <div style={{ display:"flex", gap:10, fontSize:".7rem", color:"var(--ink-3)" }}>
                      <span>{new Date(note.created_at).toLocaleDateString()}</span>
                      <span>· {wc} words</span>
                    </div>
                    {!isExp && <p style={{ color:"var(--ink-3)", fontSize:".81rem", marginTop:8, lineHeight:1.55 }}>{preview}</p>}
                  </div>
                  <div style={{ display:"flex", gap:5, flexShrink:0, flexWrap:"wrap", justifyContent:"flex-end" }}>
                    <button onClick={()=>setExpanded(isExp?null:note.id)} style={{ padding:"5px 11px", borderRadius:7, cursor:"pointer", border:"1px solid var(--border-med)", background:"var(--bg-elevated)", color:"var(--ink-2)", fontFamily:"var(--font-body)", fontSize:".77rem", fontWeight:500, transition:"all .15s" }}>{isExp?"Collapse":"Read"}</button>
                    <button onClick={()=>handleCopy(note.content)} style={{ padding:"5px 9px", borderRadius:7, cursor:"pointer", border:"1px solid var(--border)", background:"transparent", color:"var(--ink-3)", fontFamily:"var(--font-body)", fontSize:".77rem", transition:"all .15s" }} title="Copy">Copy</button>
                    <button onClick={()=>handlePDF(note)} style={{ padding:"5px 9px", borderRadius:7, cursor:"pointer", border:"1px solid var(--border)", background:"transparent", color:"var(--ink-3)", fontFamily:"var(--font-body)", fontSize:".77rem", transition:"all .15s" }} title="PDF">PDF</button>
                    <button onClick={()=>handleDelete(note.id)} style={{ padding:"5px 8px", borderRadius:7, cursor:"pointer", border:"1px solid transparent", background:"transparent", color:"var(--ink-4)", fontFamily:"var(--font-body)", fontSize:".77rem", transition:"all .15s" }}
                      onMouseEnter={e=>{e.currentTarget.style.color="var(--ruby)";e.currentTarget.style.borderColor="var(--ruby-border)";}}
                      onMouseLeave={e=>{e.currentTarget.style.color="var(--ink-4)";e.currentTarget.style.borderColor="transparent";}}>✕</button>
                  </div>
                </div>
              </div>
              {isExp && <div style={{ padding:"18px 20px", color:"var(--ink-2)", lineHeight:1.9, fontSize:".89rem", whiteSpace:"pre-line", background:"var(--bg-elevated)" }}>{note.content}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}