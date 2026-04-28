import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSemesters, getSubjectsBySemester, getTopicsBySubject } from "../services/api";
import api from "../services/api";
import { toast } from "../components/Toast";
import PageHeader from "../components/PageHeader";

export default function GenerateNote() {
  const navigate=useNavigate();
  const [semesters,setSemesters]=useState([]);
  const [subjects,setSubjects]=useState([]);
  const [topics,setTopics]=useState([]);
  const [semId,setSemId]=useState("");
  const [subjectId,setSubjectId]=useState("");
  const [topicId,setTopicId]=useState("");
  const [loading,setLoading]=useState(false);
  const [note,setNote]=useState("");

  useEffect(()=>{ getSemesters().then(r=>setSemesters(r.data)).catch(()=>{}); },[]);
  useEffect(()=>{ if(semId){ getSubjectsBySemester(semId).then(r=>{ setSubjects(r.data); setSubjectId(""); setTopics([]); setTopicId(""); }).catch(()=>{}); } },[semId]);
  useEffect(()=>{ if(subjectId){ getTopicsBySubject(subjectId).then(r=>{ setTopics(r.data); setTopicId(""); }).catch(()=>{}); } },[subjectId]);

  const handleGenerate=async()=>{
    if(!subjectId||!topicId){ toast.error("Please select a subject and topic."); return; }
    try{
      setLoading(true); setNote("");
      const r=await api.post("/ai/generate-note",{ subject_id:subjectId, topic_id:topicId });
      setNote(r.data.content); toast.success("Note generated and saved!");
    } catch(err){ toast.error(err.response?.data?.error||"Failed to generate note."); }
    finally{ setLoading(false); }
  };

  const handleCopy=()=>{ navigator.clipboard.writeText(note); toast.success("Copied!"); };
  const handlePDF=()=>{
    const selSub=subjects.find(s=>String(s.id)===String(subjectId));
    const selTop=topics.find(t=>String(t.id)===String(topicId));
    const win=window.open("","_blank");
    win.document.write(`<!DOCTYPE html><html><head><title>${selTop?.name||"Note"}</title><style>body{font-family:Georgia,serif;font-size:12pt;line-height:1.9;color:#111;margin:2cm;}h1{font-size:18pt;border-bottom:1px solid #ccc;padding-bottom:6pt;margin-bottom:4pt;}.meta{font-size:9pt;color:#666;margin-bottom:18pt;}</style></head><body><h1>${selTop?.name||"Note"}</h1><p class="meta">${selSub?.name||""} · ${new Date().toLocaleDateString()}</p><div>${note.replace(/\n/g,"<br/>")}</div></body></html>`);
    win.document.close(); win.print(); toast.success("PDF dialog opened!");
  };

  return (
    <div>
      <PageHeader title="Generate" accent="Note" accentColor="var(--sapphire)" sub="AI-written study notes on any MCA topic, saved automatically"/>
      <div style={{ display:"grid", gap:20, alignItems:"start" }} className="note-layout">
        <style>{`.note-layout{grid-template-columns:320px 1fr!important;}@media(max-width:860px){.note-layout{grid-template-columns:1fr!important;}}`}</style>

        <div className="glass fade-up" style={{ padding:"22px 20px" }}>
          <h3 style={{ fontWeight:600, color:"var(--ink)", fontSize:".92rem", marginBottom:18 }}>Select Topic</h3>
          {[
            { label:"Semester", value:semId,     set:setSemId,     items:semesters, disabled:false,     ph:"Select semester…" },
            { label:"Subject",  value:subjectId, set:setSubjectId, items:subjects,  disabled:!semId,    ph:"Select subject…"  },
            { label:"Topic",    value:topicId,   set:setTopicId,   items:topics,    disabled:!subjectId,ph:"Select topic…"    },
          ].map(f=>(
            <div key={f.label} style={{ marginBottom:14 }}>
              <label style={{ display:"block", fontSize:".68rem", fontWeight:700, color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:".12em", marginBottom:7 }}>{f.label}</label>
              <select className="glow-input" value={f.value} onChange={e=>f.set(e.target.value)} disabled={f.disabled}>
                <option value="">{f.ph}</option>
                {f.items.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </div>
          ))}
          <button className="btn-glow" onClick={handleGenerate} disabled={loading||!subjectId||!topicId}
            style={{ width:"100%", padding:12, marginTop:8, background:"var(--sapphire)", color:"#fff" }}>
            {loading?"Generating…":"Generate Note →"}
          </button>
        </div>

        <div className="fade-up">
          {loading && <div className="glass" style={{ padding:"56px 24px", textAlign:"center" }}><div className="loader" style={{ marginBottom:16 }}/><p style={{ color:"var(--ink-3)", fontSize:".85rem" }}>Crafting your study note…</p></div>}
          {!loading&&!note && <div className="glass" style={{ padding:"56px 24px", textAlign:"center" }}><div style={{ width:52,height:52,borderRadius:"50%",border:"1.5px dashed var(--border-med)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px" }}><svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M13 3H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" stroke="var(--ink-4)" strokeWidth="1.4"/><path d="M13 3v5h5M8 12h6M8 15h4" stroke="var(--ink-4)" strokeWidth="1.4" strokeLinecap="round"/></svg></div><p style={{ color:"var(--ink-3)", fontSize:".88rem" }}>Your generated note will appear here.</p></div>}
          {!loading&&note && (
            <div className="glass" style={{ padding:"24px 22px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18, flexWrap:"wrap", gap:10 }}>
                <h3 style={{ fontFamily:"var(--font-display)", fontStyle:"italic", fontSize:"1.3rem", color:"var(--sapphire)" }}>{topics.find(t=>String(t.id)===String(topicId))?.name||"Note"}</h3>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={handleCopy} style={{ padding:"6px 13px", borderRadius:7, border:"1px solid var(--border-med)", background:"transparent", color:"var(--ink-2)", fontFamily:"var(--font-body)", fontSize:".78rem", cursor:"pointer" }}>Copy</button>
                  <button onClick={handlePDF} style={{ padding:"6px 13px", borderRadius:7, border:"1px solid var(--border-med)", background:"transparent", color:"var(--ink-2)", fontFamily:"var(--font-body)", fontSize:".78rem", cursor:"pointer" }}>PDF</button>
                  <button onClick={()=>navigate("/notes")} className="btn-glow" style={{ padding:"6px 14px", fontSize:".78rem" }}>View in Notes →</button>
                </div>
              </div>
              <div style={{ color:"var(--ink-2)", lineHeight:1.9, fontSize:".9rem", whiteSpace:"pre-line", borderTop:"1px solid var(--border)", paddingTop:18 }}>{note}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}