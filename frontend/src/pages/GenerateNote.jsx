import { useEffect, useState } from "react";
import api from "../services/api";
import { toast } from "../components/Toast";

function RenderMarkdown({ text }) {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^### (.+)/.test(line)) {
      elements.push(<h3 key={i} style={{ color:'var(--amber)', fontSize:'0.95rem', fontWeight:700, marginTop:18, marginBottom:6 }}>{line.replace(/^### /,'')}</h3>);
    } else if (/^## (.+)/.test(line)) {
      elements.push(<h2 key={i} style={{ color:'var(--ink)', fontSize:'1.05rem', fontWeight:600, marginTop:22, marginBottom:8 }}>{line.replace(/^## /,'')}</h2>);
    } else if (/^# (.+)/.test(line)) {
      elements.push(<h1 key={i} style={{ color:'var(--ink)', fontSize:'1.15rem', fontWeight:700, marginTop:24, marginBottom:10, fontFamily:'var(--font-display)', fontStyle:'italic' }}>{line.replace(/^# /,'')}</h1>);
    } else if (/^\* (.+)/.test(line) || /^- (.+)/.test(line)) {
      elements.push(<div key={i} style={{ display:'flex', gap:10, marginBottom:5, paddingLeft:6 }}>
        <span style={{color:'var(--amber)', flexShrink:0, marginTop:2, fontSize:'0.7rem'}}>◆</span>
        <span style={{color:'var(--ink-2)', lineHeight:1.75}}>{renderInline(line.replace(/^\*\s|^-\s/,''))}</span>
      </div>);
    } else if (line.trim() === '') {
      elements.push(<div key={i} style={{ height:8 }} />);
    } else {
      elements.push(<p key={i} style={{ color:'var(--ink-2)', lineHeight:1.85, marginBottom:6, fontSize:'0.9rem' }}>{renderInline(line)}</p>);
    }
    i++;
  }
  return <div>{elements}</div>;
}

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={i} style={{color:'var(--ink)', fontWeight:700}}>{part.slice(2,-2)}</strong>;
    if (/^\*[^*]+\*$/.test(part)) return <em key={i} style={{color:'var(--amber)'}}>{part.slice(1,-1)}</em>;
    return part;
  });
}

const L = ({ children }) => (
  <label style={{ display:"block", fontSize:"0.7rem", color:"var(--ink-3)", marginBottom:7,
    fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em" }}>{children}</label>
);

export default function GenerateNote() {
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects]   = useState([]);
  const [units, setUnits]         = useState([]);
  const [topics, setTopics]       = useState([]);
  const [selSem, setSelSem]       = useState("");
  const [selSub, setSelSub]       = useState("");
  const [selUnit, setSelUnit]     = useState("");
  const [selTopic, setSelTopic]   = useState("");
  const [note, setNote]           = useState("");
  const [loading, setLoading]     = useState(false);
  const [copied, setCopied]       = useState(false);
  const [subjectName, setSubjectName] = useState("");
  const [topicName, setTopicName]     = useState("");

  useEffect(() => { api.get("/semesters").then(r => setSemesters(r.data)).catch(() => {}); }, []);

  const fetchSubjects = async (semId) => {
    const r = await api.get(`/subjects/semester/${semId}`);
    setSubjects(r.data); setUnits([]); setTopics([]);
    setSelSub(""); setSelUnit(""); setSelTopic("");
    setSubjectName(""); setTopicName("");
  };
  const fetchUnits = async (subId, subName) => {
    const r = await api.get(`/units/${subId}`);
    setUnits(r.data); setTopics([]);
    setSelUnit(""); setSelTopic(""); setTopicName("");
    setSubjectName(subName);
  };
  const fetchTopics = async (unitId) => {
    const r = await api.get(`/topics/${unitId}`);
    setTopics(r.data); setSelTopic(""); setTopicName("");
  };

  const handleGenerate = async () => {
    if (!selSem || !selSub || !selUnit || !selTopic) {
      toast.info("Please complete all selections first."); return;
    }
    setLoading(true); setNote("");
    try {
      const r = await api.post("/ai/generate-note", { subject_id: selSub, topic_id: selTopic });
      setNote(r.data.content);
      toast.success("Note generated!");
    } catch { toast.error("Failed to generate note. Try again."); }
    finally { setLoading(false); }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(note);
    setCopied(true); toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([note], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${subjectName}_${topicName}_note.txt`.replace(/\s+/g,"_");
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded!");
  };

  const wordCount = note ? note.trim().split(/\s+/).length : 0;
  const allSelected = selSem && selSub && selUnit && selTopic;

  const steps = [
    { label:"Semester", value:selSem, disabled:false, options:semesters,
      onChange: v => { setSelSem(v); fetchSubjects(v); }, placeholder:"— Choose Semester —" },
    { label:"Subject",  value:selSub, disabled:!subjects.length, options:subjects,
      onChange: (v,name) => { setSelSub(v); fetchUnits(v,name); }, placeholder:"— Choose Subject —" },
    { label:"Unit",     value:selUnit, disabled:!units.length, options:units,
      onChange: v => { setSelUnit(v); fetchTopics(v); }, placeholder:"— Choose Unit —" },
    { label:"Topic",    value:selTopic, disabled:!topics.length, options:topics,
      onChange: (v,name) => { setSelTopic(v); setTopicName(name); }, placeholder:"— Choose Topic —" },
  ];

  const completedSteps = [selSem,selSub,selUnit,selTopic].filter(Boolean).length;

  return (
    <div>
      <div className="fade-up" style={{ marginBottom:28 }}>
        <h1 style={{
          fontFamily:"var(--font-display)", fontStyle:"italic",
          fontSize:"2.4rem", color:"var(--ink)", marginBottom:8,
        }}>
          Generate <span style={{ color:"var(--teal)" }}>AI Note</span>
        </h1>
        <p style={{ color:"var(--ink-3)", fontSize:"0.92rem" }}>
          Structured exam-ready notes for any topic in your syllabus
        </p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"320px 1fr", gap:20, alignItems:"start" }}>
        {/* Selector */}
        <div className="glass fade-up" style={{ padding:22 }}>
          <div style={{ fontSize:"0.7rem", color:"var(--ink-4)", fontWeight:700,
            textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:18 }}>
            Select Topic
          </div>

          {steps.map((step, i) => (
            <div key={step.label} style={{ marginBottom: i < steps.length-1 ? 16 : 0 }}>
              <L>{step.label}</L>
              <select className="glow-input" value={step.value} disabled={step.disabled}
                style={{ opacity: step.disabled ? 0.35 : 1 }}
                onChange={e => {
                  const opt = e.target.options[e.target.selectedIndex];
                  step.onChange(e.target.value, opt.text);
                }}>
                <option value="">{step.placeholder}</option>
                {step.options.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
          ))}

          {/* Progress dots */}
          <div style={{ margin:"18px 0 16px", display:"flex", gap:5 }}>
            {steps.map((s,i) => (
              <div key={i} style={{
                flex:1, height:2, borderRadius:99,
                background: i < completedSteps ? "var(--amber)" : "var(--bg-overlay)",
                transition:"background 0.3s",
              }}/>
            ))}
          </div>

          <button className="btn-glow" onClick={handleGenerate}
            disabled={!allSelected || loading}
            style={{ width:"100%", padding:12, fontSize:"0.92rem" }}>
            {loading ? "Generating…" : "Generate Note"}
          </button>
        </div>

        {/* Note display */}
        <div>
          {loading && (
            <div className="glass fade-up" style={{ padding:60, textAlign:"center" }}>
              <div className="loader" style={{ marginBottom:16 }} />
              <p style={{ color:"var(--ink-3)", fontSize:"0.9rem" }}>AI is writing your notes…</p>
              <p style={{ color:"var(--ink-4)", fontSize:"0.8rem", marginTop:6 }}>
                Structuring key concepts, examples, and exam tips
              </p>
            </div>
          )}

          {note && !loading && (
            <div className="glass fade-up" style={{ padding:26 }}>
              {/* Toolbar */}
              <div style={{
                display:"flex", justifyContent:"space-between", alignItems:"center",
                marginBottom:20, paddingBottom:16, borderBottom:"1px solid var(--border)",
              }}>
                <div>
                  <div style={{ fontWeight:600, color:"var(--ink)", fontSize:"0.95rem", marginBottom:3 }}>
                    {topicName || "Generated Note"}
                  </div>
                  <span style={{ fontSize:"0.75rem", color:"var(--ink-3)" }}>
                    {wordCount.toLocaleString()} words · {Math.ceil(wordCount/200)} min read
                  </span>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={handleCopy} style={{
                    padding:"6px 14px", borderRadius:8, cursor:"pointer",
                    background: copied ? "rgba(52,211,153,0.08)" : "var(--bg-elevated)",
                    border: copied ? "1px solid rgba(52,211,153,0.3)" : "1px solid var(--border-med)",
                    color: copied ? "var(--emerald)" : "var(--ink-2)",
                    fontFamily:"var(--font-body)", fontSize:"0.78rem", fontWeight:600,
                    transition:"all 0.18s",
                  }}>
                    {copied ? "✓ Copied" : "Copy"}
                  </button>
                  <button onClick={handleDownload} style={{
                    padding:"6px 14px", borderRadius:8, cursor:"pointer",
                    background:"var(--bg-elevated)", border:"1px solid var(--border-med)",
                    color:"var(--ink-2)", fontFamily:"var(--font-body)",
                    fontSize:"0.78rem", fontWeight:600, transition:"all 0.18s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.color="var(--teal)"}
                    onMouseLeave={e => e.currentTarget.style.color="var(--ink-2)"}>
                    ↓ Download
                  </button>
                </div>
              </div>

              <div style={{ lineHeight:1.9, fontSize:"0.9rem" }}>
                <RenderMarkdown text={note} />
              </div>
            </div>
          )}

          {!note && !loading && (
            <div className="glass" style={{ padding:64, textAlign:"center" }}>
              <div style={{ fontSize:"2.5rem", marginBottom:14, opacity:0.25 }}>✎</div>
              <p style={{ color:"var(--ink-3)", fontSize:"0.9rem" }}>Select a topic and generate your AI note</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
