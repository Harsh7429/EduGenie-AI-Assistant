import { useState } from "react";
import { generateFYPGuide } from "../services/api";
import ReactMarkdown from "react-markdown";
import { toast } from "../components/Toast";

const DOMAINS = [
  "Machine Learning & AI","Web Development","Mobile App Development",
  "Cybersecurity","Cloud Computing","Data Science","IoT & Embedded Systems",
  "Blockchain","AR/VR","Natural Language Processing",
];

const mdStyles = `
  .fyp-md p { margin:0 0 10px; color:var(--ink-2); font-size:0.9rem; line-height:1.8; }
  .fyp-md h1 { font-family:var(--font-display); font-style:italic; color:var(--ink); font-size:1.3rem; margin:24px 0 10px; }
  .fyp-md h2 { color:var(--amber); font-size:1rem; font-weight:700; margin:20px 0 8px; }
  .fyp-md h3 { color:var(--ink); font-size:0.92rem; font-weight:700; margin:16px 0 6px; }
  .fyp-md ul,.fyp-md ol { padding-left:20px; margin:6px 0 10px; }
  .fyp-md li { color:var(--ink-2); margin-bottom:5px; font-size:0.9rem; line-height:1.7; }
  .fyp-md strong { color:var(--ink); font-weight:700; }
  .fyp-md code { background:var(--amber-dim); border:1px solid rgba(245,158,11,0.2); border-radius:4px; padding:1px 6px; font-family:var(--font-mono); font-size:0.82em; color:var(--amber); }
  .fyp-md blockquote { border-left:2px solid var(--amber); margin:10px 0; padding:6px 14px; background:var(--amber-dim); border-radius:0 8px 8px 0; }
`;

export default function FYPGuide() {
  const [domain, setDomain]     = useState("");
  const [interest, setInterest] = useState("");
  const [teamSize, setTeamSize] = useState(4);
  const [guide, setGuide]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleGenerate = async () => {
    if (!domain || !interest.trim()) { toast.info("Fill in all fields first."); return; }
    setLoading(true); setGuide("");
    try {
      const r = await generateFYPGuide(domain, interest, teamSize);
      setGuide(r.data.guide);
      toast.success("FYP Guide generated!");
    } catch { toast.error("Failed to generate guide. Try again."); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <style>{mdStyles}</style>
      <div className="fade-up" style={{ marginBottom:28 }}>
        <h1 style={{
          fontFamily:"var(--font-display)", fontStyle:"italic",
          fontSize:"2.4rem", color:"var(--ink)", marginBottom:8,
        }}>
          FYP <span style={{ color:"var(--violet)" }}>Guide</span>
        </h1>
        <p style={{ color:"var(--ink-3)", fontSize:"0.92rem" }}>
          AI-generated final year project roadmap tailored to your domain and interests
        </p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"320px 1fr", gap:20, alignItems:"start" }}>
        {/* Config */}
        <div className="glass fade-up" style={{ padding:22 }}>
          <div style={{ fontSize:"0.7rem", color:"var(--ink-4)", fontWeight:700,
            textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:18 }}>
            Project Details
          </div>

          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontSize:"0.7rem", color:"var(--ink-3)", marginBottom:7,
              fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em" }}>Domain</label>
            <select className="glow-input" value={domain} onChange={e => setDomain(e.target.value)}>
              <option value="">— Select Domain —</option>
              {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontSize:"0.7rem", color:"var(--ink-3)", marginBottom:7,
              fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em" }}>Your Interest</label>
            <textarea className="glow-input"
              placeholder="e.g. I want to build a recommendation system for e-commerce…"
              value={interest} onChange={e => setInterest(e.target.value)}
              rows={4} style={{ resize:"none", lineHeight:1.6 }}
            />
          </div>

          <div style={{ marginBottom:22 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
              <label style={{ display:"block", fontSize:"0.7rem", color:"var(--ink-3)",
                fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em" }}>Team Size</label>
              <span style={{ fontFamily:"var(--font-display)", fontStyle:"italic", color:"var(--amber)", fontSize:"1.1rem" }}>{teamSize}</span>
            </div>
            <input type="range" min={1} max={6} value={teamSize} onChange={e => setTeamSize(Number(e.target.value))}
              style={{ width:"100%", accentColor:"#f59e0b", cursor:"pointer" }}/>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:"0.68rem", color:"var(--ink-4)", marginTop:4 }}>
              <span>Solo</span><span>6 members</span>
            </div>
          </div>

          <button className="btn-glow" onClick={handleGenerate}
            disabled={loading || !domain || !interest.trim()}
            style={{ width:"100%", padding:12, fontSize:"0.92rem" }}>
            {loading ? "Generating…" : "Generate FYP Guide"}
          </button>
        </div>

        {/* Output */}
        <div>
          {loading && (
            <div className="glass fade-up" style={{ padding:60, textAlign:"center" }}>
              <div className="loader" style={{ marginBottom:16 }}/>
              <p style={{ color:"var(--ink-3)" }}>Building your personalized FYP roadmap…</p>
            </div>
          )}

          {guide && !loading && (
            <div className="glass fade-up" style={{ padding:26 }}>
              <div style={{
                display:"flex", justifyContent:"space-between", alignItems:"center",
                marginBottom:20, paddingBottom:16, borderBottom:"1px solid var(--border)",
              }}>
                <div style={{ fontWeight:600, color:"var(--ink)", fontSize:"0.95rem" }}>Your FYP Roadmap</div>
                <div style={{
                  padding:"3px 12px", borderRadius:99,
                  background:"var(--violet-dim)", border:"1px solid rgba(167,139,250,0.3)",
                  fontSize:"0.75rem", color:"var(--violet)", fontWeight:600,
                }}>{domain}</div>
              </div>
              <div className="fyp-md">
                <ReactMarkdown>{guide}</ReactMarkdown>
              </div>
            </div>
          )}

          {!guide && !loading && (
            <div className="glass" style={{ padding:64, textAlign:"center" }}>
              <div style={{ fontSize:"2.5rem", marginBottom:14, opacity:0.25 }}>✦</div>
              <p style={{ color:"var(--ink-3)", fontSize:"0.9rem" }}>
                Fill in your project details and generate a personalized roadmap
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
