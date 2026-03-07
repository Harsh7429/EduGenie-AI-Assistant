import { useEffect, useState } from "react";
import api from "../services/api";
import { toast } from "../components/Toast";

// Simple markdown renderer — handles bold, headings, bullets, line breaks
function RenderMarkdown({ text }) {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^### (.+)/.test(line)) {
      elements.push(<h3 key={i} style={{ color:'#a78bfa', fontSize:'1rem', fontWeight:700, marginTop:18, marginBottom:6 }}>{line.replace(/^### /,'')}</h3>);
    } else if (/^## (.+)/.test(line)) {
      elements.push(<h2 key={i} style={{ color:'#818cf8', fontSize:'1.1rem', fontWeight:700, marginTop:22, marginBottom:8 }}>{line.replace(/^## /,'')}</h2>);
    } else if (/^# (.+)/.test(line)) {
      elements.push(<h1 key={i} style={{ color:'#c4b5fd', fontSize:'1.2rem', fontWeight:800, marginTop:24, marginBottom:10 }}>{line.replace(/^# /,'')}</h1>);
    } else if (/^\* (.+)/.test(line) || /^- (.+)/.test(line)) {
      elements.push(<div key={i} style={{ display:'flex', gap:8, marginBottom:4, paddingLeft:8 }}><span style={{color:'#818cf8', flexShrink:0}}>•</span><span style={{color:'#cbd5e1', lineHeight:1.7}}>{renderInline(line.replace(/^\*\s|^-\s/,''))}</span></div>);
    } else if (line.trim() === '') {
      elements.push(<div key={i} style={{ height:8 }} />);
    } else {
      elements.push(<p key={i} style={{ color:'#cbd5e1', lineHeight:1.85, marginBottom:6, fontSize:'0.91rem' }}>{renderInline(line)}</p>);
    }
    i++;
  }
  return <div>{elements}</div>;
}

function renderInline(text) {
  // Handle **bold** and *italic*
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={i} style={{color:'#e2e8f0', fontWeight:700}}>{part.slice(2,-2)}</strong>;
    if (/^\*[^*]+\*$/.test(part)) return <em key={i} style={{color:'#a5b4fc'}}>{part.slice(1,-1)}</em>;
    return part;
  });
}

const L = ({ children }) => (
  <label style={{ display:"block", fontSize:"0.75rem", color:"#64748b", marginBottom:7,
    fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em" }}>{children}</label>
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
      toast.success("Note generated successfully!");
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
      onChange: v => { setSelSem(v); fetchSubjects(v); }, placeholder:"-- Choose Semester --" },
    { label:"Subject",  value:selSub, disabled:!subjects.length, options:subjects,
      onChange: (v,name) => { setSelSub(v); fetchUnits(v, name); }, placeholder:"-- Choose Subject --" },
    { label:"Unit",     value:selUnit, disabled:!units.length, options:units,
      onChange: v => { setSelUnit(v); fetchTopics(v); }, placeholder:"-- Choose Unit --" },
    { label:"Topic",    value:selTopic, disabled:!topics.length, options:topics,
      onChange: (v,name) => { setSelTopic(v); setTopicName(name); }, placeholder:"-- Choose Topic --" },
  ];

  return (
    <div>
      <div className="fade-up" style={{ marginBottom:32 }}>
        <h1 className="title-font" style={{ fontSize:"2.4rem", letterSpacing:"-0.03em", marginBottom:8 }}>
          Generate{" "}
          <span style={{ background:"linear-gradient(135deg,#22d3ee,#6366f1)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>AI Note</span>
        </h1>
        <p style={{ color:"#64748b", fontSize:"0.95rem" }}>
          Structured exam-ready notes for any topic in your syllabus
        </p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"340px 1fr", gap:24, alignItems:"start" }}>
        {/* Selector */}
        <div className="glass fade-up" style={{ padding:24 }}>
          {steps.map((step, i) => (
            <div key={step.label} style={{ marginBottom: i < steps.length-1 ? 18 : 0 }}>
              <L>{step.label}</L>
              <select className="glow-input" value={step.value} disabled={step.disabled}
                style={{ opacity: step.disabled ? 0.4 : 1 }}
                onChange={e => {
                  const opt = e.target.options[e.target.selectedIndex];
                  step.onChange(e.target.value, opt.text);
                }}>
                <option value="">{step.placeholder}</option>
                {step.options.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
          ))}

          {/* Progress indicator */}
          <div style={{ margin:"20px 0 18px", display:"flex", gap:6 }}>
            {steps.map((s,i) => (
              <div key={i} style={{ flex:1, height:3, borderRadius:99,
                background: s.value ? "#6366f1" : "rgba(255,255,255,0.08)",
                transition:"background 0.3s", boxShadow: s.value ? "0 0 6px rgba(99,102,241,0.5)" : "none" }}/>
            ))}
          </div>

          <button className="btn-glow" onClick={handleGenerate}
            disabled={!allSelected || loading}
            style={{ width:"100%", padding:13, fontSize:"0.93rem" }}>
            {loading ? "⏳ Generating..." : "✦ Generate Note"}
          </button>
        </div>

        {/* Note display */}
        <div>
          {loading && (
            <div className="glass fade-up" style={{ padding:60, textAlign:"center" }}>
              <div className="loader" style={{ marginBottom:16 }} />
              <p style={{ color:"#64748b" }}>AI is writing your notes...</p>
              <p style={{ color:"#334155", fontSize:"0.8rem", marginTop:8 }}>
                Structuring key concepts, examples, and exam tips
              </p>
            </div>
          )}

          {note && !loading && (
            <div className="glass fade-up" style={{ padding:28 }}>
              {/* Toolbar */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                marginBottom:20, paddingBottom:16,
                borderBottom:"1px solid rgba(99,102,241,0.15)" }}>
                <div>
                  <h2 style={{ fontSize:"1rem", fontWeight:700, color:"#818cf8", marginBottom:4 }}>
                    ✦ {topicName || "Generated Note"}
                  </h2>
                  <span style={{ fontSize:"0.75rem", color:"#475569" }}>
                    {wordCount.toLocaleString()} words · {Math.ceil(wordCount/200)} min read
                  </span>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={handleCopy} style={{
                    padding:"6px 14px", borderRadius:8, cursor:"pointer",
                    background: copied ? "rgba(52,211,153,0.15)" : "rgba(99,102,241,0.1)",
                    border: copied ? "1px solid rgba(52,211,153,0.4)" : "1px solid rgba(99,102,241,0.3)",
                    color: copied ? "#34d399" : "#818cf8",
                    fontFamily:"'Space Grotesk',sans-serif", fontSize:"0.78rem", fontWeight:600,
                    transition:"all 0.2s",
                  }}>
                    {copied ? "✓ Copied" : "Copy"}
                  </button>
                  <button onClick={handleDownload} style={{
                    padding:"6px 14px", borderRadius:8, cursor:"pointer",
                    background:"rgba(6,182,212,0.1)", border:"1px solid rgba(6,182,212,0.3)",
                    color:"#22d3ee", fontFamily:"'Space Grotesk',sans-serif",
                    fontSize:"0.78rem", fontWeight:600,
                  }}>
                    ↓ Download
                  </button>
                </div>
              </div>

              {/* Note content */}
              <div style={{ lineHeight:1.9, fontSize:"0.91rem" }}>
                <RenderMarkdown text={note} />
              </div>
            </div>
          )}

          {!note && !loading && (
            <div className="glass" style={{ padding:64, textAlign:"center", opacity:0.5 }}>
              <div style={{ fontSize:"3rem", marginBottom:14 }}>📝</div>
              <p style={{ color:"#475569" }}>Select a topic and generate your AI note</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
