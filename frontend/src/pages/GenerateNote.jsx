import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSemesters, getSubjectsBySemester, getTopicsBySubject } from "../services/api";
import api from "../services/api";
import { toast } from "../components/Toast";
import PageHeader from "../components/PageHeader";

export default function GenerateNote() {
  const navigate = useNavigate();
  const [semesters,  setSemesters]  = useState([]);
  const [subjects,   setSubjects]   = useState([]);
  const [topics,     setTopics]     = useState([]);
  const [semId,      setSemId]      = useState("");
  const [subjectId,  setSubjectId]  = useState("");
  const [topicId,    setTopicId]    = useState("");
  const [loading,    setLoading]    = useState(false);
  const [note,       setNote]       = useState("");

  useEffect(() => { getSemesters().then(r => setSemesters(r.data)).catch(() => {}); }, []);
  useEffect(() => {
    if (semId) { getSubjectsBySemester(semId).then(r => { setSubjects(r.data); setSubjectId(""); setTopics([]); setTopicId(""); }).catch(() => {}); }
  }, [semId]);
  useEffect(() => {
    if (subjectId) { getTopicsBySubject(subjectId).then(r => { setTopics(r.data); setTopicId(""); }).catch(() => {}); }
  }, [subjectId]);

  const handleGenerate = async () => {
    if (!subjectId || !topicId) { toast.error("Please select a subject and topic."); return; }
    try {
      setLoading(true); setNote("");
      const r = await api.post("/ai/generate-note", { subject_id: subjectId, topic_id: topicId });
      setNote(r.data.content); toast.success("Note generated and saved!");
    } catch (err) { toast.error(err.response?.data?.error || "Failed to generate note."); }
    finally { setLoading(false); }
  };

  const handleCopy = () => { navigator.clipboard.writeText(note); toast.success("Copied!"); };
  const handlePDF  = () => {
    const selSub = subjects.find(s => String(s.id) === String(subjectId));
    const selTop = topics.find(t => String(t.id) === String(topicId));
    const win = window.open("", "_blank");
    win.document.write(`<!DOCTYPE html><html><head><title>${selTop?.name||"Note"}</title><style>body{font-family:Georgia,serif;font-size:12pt;line-height:1.9;color:#111;margin:2cm;}h1{font-size:18pt;border-bottom:1px solid #ccc;padding-bottom:6pt;margin-bottom:4pt;}.meta{font-size:9pt;color:#666;margin-bottom:18pt;}</style></head><body><h1>${selTop?.name||"Note"}</h1><p class="meta">${selSub?.name||""} · ${new Date().toLocaleDateString()}</p><div>${note.replace(/\n/g,"<br/>")}</div></body></html>`);
    win.document.close(); win.print(); toast.success("PDF dialog opened!");
  };

  const Sel = ({ label, value, onChange, items, disabled, placeholder }) => (
    <div style={{ marginBottom:12 }}>
      <label style={{ display:"block", fontSize:11, fontWeight:500, color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:".1em", marginBottom:6 }}>{label}</label>
      <select className="glow-input" value={value} onChange={e => onChange(e.target.value)} disabled={disabled}>
        <option value="">{placeholder}</option>
        {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
      </select>
    </div>
  );

  return (
    <div>
      <PageHeader title="Generate" accent="Note" accentColor="var(--blue)"
        sub="AI-written study notes on any MCA topic, saved automatically"/>
      <div style={{ display:"grid", gap:18, alignItems:"start" }} className="note-layout">
        <style>{`.note-layout{grid-template-columns:300px 1fr!important;}@media(max-width:860px){.note-layout{grid-template-columns:1fr!important;}}`}</style>

        <div className="glass fade-up" style={{ padding:"20px 18px" }}>
          <p style={{ fontSize:13, fontWeight:500, color:"var(--ink)", marginBottom:16 }}>Select Topic</p>
          <Sel label="Semester" value={semId}     onChange={setSemId}     items={semesters} disabled={false}      placeholder="Select semester…"/>
          <Sel label="Subject"  value={subjectId} onChange={setSubjectId} items={subjects}  disabled={!semId}     placeholder="Select subject…"/>
          <Sel label="Topic"    value={topicId}   onChange={setTopicId}   items={topics}    disabled={!subjectId} placeholder="Select topic…"/>
          <button className="btn-glow" onClick={handleGenerate} disabled={loading || !subjectId || !topicId}
            style={{ width:"100%", padding:11, marginTop:8, background:"var(--blue)", color:"#fff", fontSize:13 }}>
            {loading ? "Generating…" : "Generate Note →"}
          </button>
        </div>

        <div className="fade-up">
          {loading && (
            <div className="glass" style={{ padding:"52px 24px", textAlign:"center" }}>
              <div className="loader" style={{ marginBottom:14 }}/>
              <p style={{ color:"var(--ink-3)", fontSize:13 }}>Crafting your study note…</p>
            </div>
          )}
          {!loading && !note && (
            <div className="glass" style={{ padding:"52px 24px", textAlign:"center" }}>
              <div style={{ width:48, height:48, borderRadius:"50%", border:"0.5px dashed var(--border-med)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12 3H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7l-4-4z" stroke="var(--ink-4)" strokeWidth="1.4"/><path d="M12 3v4h4M7 11h6M7 13.5h4" stroke="var(--ink-4)" strokeWidth="1.4" strokeLinecap="round"/></svg>
              </div>
              <p style={{ color:"var(--ink-3)", fontSize:13 }}>Your generated note will appear here.</p>
            </div>
          )}
          {!loading && note && (
            <div className="glass" style={{ padding:"20px 20px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:9 }}>
                <div>
                  <div style={{ fontSize:15, fontWeight:500, color:"var(--blue)", letterSpacing:"-.01em" }}>
                    {topics.find(t => String(t.id) === String(topicId))?.name || "Note"}
                  </div>
                  <div style={{ fontSize:11, color:"var(--ink-4)", marginTop:2 }}>
                    {subjects.find(s => String(s.id) === String(subjectId))?.name} · {note.trim().split(/\s+/).length} words
                  </div>
                </div>
                <div style={{ display:"flex", gap:7 }}>
                  <button onClick={handleCopy} style={{ padding:"5px 11px", borderRadius:6, border:"0.5px solid var(--border-med)", background:"transparent", color:"var(--ink-2)", fontFamily:"var(--font-body)", fontSize:12, cursor:"pointer" }}>Copy</button>
                  <button onClick={handlePDF}  style={{ padding:"5px 11px", borderRadius:6, border:"0.5px solid var(--border-med)", background:"transparent", color:"var(--ink-2)", fontFamily:"var(--font-body)", fontSize:12, cursor:"pointer" }}>PDF</button>
                  <button onClick={() => navigate("/notes")} className="btn-glow" style={{ padding:"5px 12px", fontSize:12 }}>View in Notes →</button>
                </div>
              </div>
              <div style={{ borderTop:"0.5px solid var(--border)", paddingTop:16, color:"var(--ink-2)", lineHeight:1.9, fontSize:13, whiteSpace:"pre-line" }}>{note}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}