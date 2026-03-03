import { useState } from "react";
import { generateFYPGuide } from "../services/api";
import { toast } from "../components/Toast";

const L = ({ children }) => (
  <label style={{ display:"block", fontSize:"0.75rem", color:"#64748b",
    marginBottom:7, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em" }}>
    {children}
  </label>
);

const DOMAINS = [
  "Web Development", "Mobile App Development", "Machine Learning / AI",
  "Data Science & Analytics", "Cybersecurity", "Cloud Computing",
  "IoT (Internet of Things)", "Blockchain", "Database Management", "Other"
];

const MCA_ROLES = [
  "Full Stack Developer", "Data Analyst", "ML Engineer",
  "Android Developer", "Cloud Engineer", "DevOps", "Cybersecurity Analyst"
];

// Renders the guide text with section highlighting
function GuideRenderer({ text }) {
  if (!text) return null;

  const lines = text.split("\n");
  return (
    <div style={{ lineHeight: 1.8, color: "#cbd5e1", fontSize: "0.91rem" }}>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} style={{ height: 8 }} />;

        // Section headers: lines starting with a number and a dot (1. 2. etc.)
        if (/^\d+\.\s+[A-Z]/.test(trimmed)) {
          return (
            <div key={i} style={{
              marginTop: 24, marginBottom: 10, padding: "10px 16px",
              background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)",
              borderRadius: 10, fontWeight: 700, color: "#818cf8", fontSize: "0.95rem",
            }}>
              {trimmed}
            </div>
          );
        }

        // Sub-bullets: lines starting with -
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <div key={i} style={{ display:"flex", gap:10, paddingLeft:16, marginBottom:4 }}>
              <span style={{ color:"#6366f1", flexShrink:0, marginTop:2 }}>▸</span>
              <span>{trimmed.slice(2)}</span>
            </div>
          );
        }

        // Month headers
        if (/^Month \d/i.test(trimmed)) {
          return (
            <div key={i} style={{
              marginTop:12, marginBottom:6, fontWeight:700,
              color:"#22d3ee", fontSize:"0.88rem",
            }}>
              📅 {trimmed}
            </div>
          );
        }

        // Normal paragraph
        return <p key={i} style={{ marginBottom:4, color:"#94a3b8" }}>{trimmed}</p>;
      })}
    </div>
  );
}

export default function FYPGuide() {
  const [domain, setDomain]     = useState("");
  const [interest, setInterest] = useState("");
  const [teamSize, setTeamSize] = useState(1);
  const [guide, setGuide]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [copied, setCopied]     = useState(false);

  const handleGenerate = async () => {
    if (!domain || !interest.trim()) {
      toast.info("Please select a domain and describe your interest.");
      return;
    }
    setLoading(true); setGuide("");
    try {
      const r = await generateFYPGuide(domain, interest, teamSize);
      setGuide(r.data.guide);
      toast.success("FYP Guide generated! 🎓");
    } catch { toast.error("Failed to generate guide. Try again."); }
    finally { setLoading(false); }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(guide);
    setCopied(true); toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([guide], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FYP_Guide_${domain.replace(/\s+/g,"_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded!");
  };

  return (
    <div>
      {/* Header */}
      <div className="fade-up" style={{ marginBottom:32 }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"5px 14px",
          borderRadius:99, background:"rgba(52,211,153,0.1)", border:"1px solid rgba(52,211,153,0.25)",
          marginBottom:16, fontSize:"0.75rem", color:"#34d399", fontWeight:700, letterSpacing:"0.06em" }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:"#34d399", display:"inline-block" }}/>
          MCA 4TH SEMESTER
        </div>
        <h1 className="title-font" style={{ fontSize:"2.4rem", letterSpacing:"-0.03em", marginBottom:8 }}>
          Final Year{" "}
          <span style={{ background:"linear-gradient(135deg,#34d399,#06b6d4)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            Project Guide
          </span>
        </h1>
        <p style={{ color:"#64748b", fontSize:"0.95rem", maxWidth:560 }}>
          AI-powered complete FYP roadmap — topic suggestions, tech stack, timeline, database design, GitHub structure, and viva preparation.
        </p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"340px 1fr", gap:24, alignItems:"start" }}>
        {/* Config panel */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div className="glass fade-up" style={{ padding:24 }}>
            <div style={{ marginBottom:18 }}>
              <L>Domain / Area</L>
              <select className="glow-input" value={domain} onChange={e => setDomain(e.target.value)}>
                <option value="">-- Select Domain --</option>
                {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div style={{ marginBottom:18 }}>
              <L>Your Project Idea / Interest</L>
              <textarea className="glow-input" rows={4}
                placeholder="e.g. I want to build an online exam portal with proctoring features for colleges..."
                value={interest} onChange={e => setInterest(e.target.value)}
                style={{ resize:"vertical", fontFamily:"'Space Grotesk',sans-serif", lineHeight:1.6 }}
              />
            </div>

            <div style={{ marginBottom:20 }}>
              <L>Team Size: <span style={{ color:"#34d399" }}>{teamSize} member{teamSize>1?"s":""}</span></L>
              <input type="range" min={1} max={4} step={1} value={teamSize}
                onChange={e => setTeamSize(Number(e.target.value))}
                style={{ width:"100%", accentColor:"#34d399", cursor:"pointer", margin:"8px 0" }} />
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:"0.7rem", color:"#334155" }}>
                <span>Solo</span><span>2</span><span>3</span><span>4</span>
              </div>
            </div>

            <button className="btn-glow" onClick={handleGenerate}
              disabled={!domain || !interest.trim() || loading}
              style={{ width:"100%", padding:13, fontSize:"0.93rem",
                background:"linear-gradient(135deg,#059669,#06b6d4)",
                boxShadow:"0 0 20px rgba(5,150,105,0.4)" }}>
              {loading ? "⏳ Generating Guide..." : "🎓 Generate FYP Guide"}
            </button>
          </div>

          {/* Quick tips card */}
          <div className="glass fade-up" style={{ padding:20 }}>
            <h3 style={{ fontWeight:700, color:"#34d399", marginBottom:12, fontSize:"0.88rem" }}>
              💡 Quick Tips
            </h3>
            {[
              "Choose a domain you're genuinely interested in",
              "Prefer projects with a real-world use case",
              "Aim for 5–7 core features — quality over quantity",
              "Start documentation from month 1",
              "Keep a GitHub repo from day one",
            ].map((t,i) => (
              <div key={i} style={{ display:"flex", gap:8, marginBottom:8,
                fontSize:"0.8rem", color:"#64748b", alignItems:"flex-start" }}>
                <span style={{ color:"#34d399", flexShrink:0 }}>▸</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Guide output */}
        <div>
          {loading && (
            <div className="glass fade-up" style={{ padding:72, textAlign:"center" }}>
              <div className="loader" style={{ marginBottom:16,
                borderTopColor:"#34d399", borderColor:"rgba(52,211,153,0.2)" }} />
              <p style={{ color:"#64748b" }}>AI is crafting your complete FYP roadmap...</p>
              <p style={{ color:"#334155", fontSize:"0.8rem", marginTop:8 }}>
                This includes topic ideas, tech stack, timeline, database design & more
              </p>
            </div>
          )}

          {guide && !loading && (
            <div className="glass fade-up" style={{ padding:28 }}>
              {/* Toolbar */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                marginBottom:20, paddingBottom:14,
                borderBottom:"1px solid rgba(52,211,153,0.15)" }}>
                <div>
                  <h2 style={{ fontWeight:700, color:"#34d399", fontSize:"1rem", marginBottom:4 }}>
                    🎓 Your FYP Guide
                  </h2>
                  <span style={{ fontSize:"0.75rem", color:"#475569" }}>
                    {domain} · Team of {teamSize}
                  </span>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={handleCopy} style={{
                    padding:"6px 14px", borderRadius:8, cursor:"pointer",
                    background: copied ? "rgba(52,211,153,0.15)" : "rgba(52,211,153,0.08)",
                    border: `1px solid rgba(52,211,153,${copied?0.5:0.25})`,
                    color:"#34d399", fontFamily:"'Space Grotesk',sans-serif",
                    fontSize:"0.78rem", fontWeight:600,
                  }}>{copied ? "✓ Copied" : "Copy"}</button>
                  <button onClick={handleDownload} style={{
                    padding:"6px 14px", borderRadius:8, cursor:"pointer",
                    background:"rgba(6,182,212,0.08)", border:"1px solid rgba(6,182,212,0.25)",
                    color:"#22d3ee", fontFamily:"'Space Grotesk',sans-serif",
                    fontSize:"0.78rem", fontWeight:600,
                  }}>↓ Download</button>
                </div>
              </div>
              <GuideRenderer text={guide} />
            </div>
          )}

          {!guide && !loading && (
            <div className="glass" style={{ padding:72, textAlign:"center", opacity:0.5 }}>
              <div style={{ fontSize:"3.5rem", marginBottom:16 }}>🎓</div>
              <p style={{ color:"#475569", fontSize:"0.95rem" }}>
                Select your domain and describe your idea to generate a complete FYP guide
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
