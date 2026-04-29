import { useState, useEffect } from "react";
import { generateFYPGuide } from "../services/api";
import ReactMarkdown from "react-markdown";
import { toast } from "../components/Toast";
import PageHeader from "../components/PageHeader";

const DOMAINS = [
  "Machine Learning & AI","Web Development","Mobile App Development",
  "Cybersecurity","Cloud Computing","Data Science","IoT & Embedded Systems",
  "Blockchain","AR/VR","Natural Language Processing",
];

const DOMAIN_ICONS = {
  "Machine Learning & AI":"🤖","Web Development":"🌐","Mobile App Development":"📱",
  "Cybersecurity":"🔒","Cloud Computing":"☁️","Data Science":"📊",
  "IoT & Embedded Systems":"🔧","Blockchain":"⛓️","AR/VR":"🥽",
  "Natural Language Processing":"💬",
};

const mdStyles = `
  .fyp-md p  { margin:0 0 10px; color:var(--ink-2); font-size:.9rem; line-height:1.8; }
  .fyp-md h1 { font-family:var(--font-display); font-style:italic; color:var(--ink); font-size:1.3rem; margin:24px 0 10px; }
  .fyp-md h2 { color:var(--lavender); font-size:1rem; font-weight:700; margin:20px 0 8px; }
  .fyp-md h3 { color:var(--ink); font-size:.92rem; font-weight:700; margin:16px 0 6px; }
  .fyp-md ul,.fyp-md ol { padding-left:20px; margin:6px 0 10px; }
  .fyp-md li { color:var(--ink-2); margin-bottom:5px; font-size:.9rem; line-height:1.7; }
  .fyp-md strong { color:var(--ink); font-weight:700; }
  .fyp-md code { background:var(--lavender-dim); border:1px solid var(--lavender-border); border-radius:4px; padding:1px 6px; font-family:var(--font-mono); font-size:.82em; color:var(--lavender); }
  .fyp-md blockquote { border-left:2px solid var(--lavender); margin:10px 0; padding:6px 14px; background:var(--lavender-dim); border-radius:0 8px 8px 0; }
`;

export default function FYPGuide() {
  const [domain,   setDomain]   = useState("");
  const [interest, setInterest] = useState("");
  const [teamSize, setTeamSize] = useState(4);
  const [guide,    setGuide]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [history,  setHistory]  = useState([]);
  const [activeTab,setActiveTab]= useState("generate"); // "generate" | "history"

  // Load saved guides from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("eg_fyp_history") || "[]");
      setHistory(saved);
    } catch {}
  }, []);

  const saveToHistory = (domain, guide) => {
    const entry = { domain, guide, date: new Date().toLocaleDateString(), id: Date.now() };
    const updated = [entry, ...history].slice(0, 5); // keep last 5
    setHistory(updated);
    localStorage.setItem("eg_fyp_history", JSON.stringify(updated));
  };

  const handleGenerate = async () => {
    if (!domain || !interest.trim()) { toast.info("Fill in all fields first."); return; }
    setLoading(true); setGuide("");
    try {
      const r = await generateFYPGuide(domain, interest, teamSize);
      setGuide(r.data.guide);
      saveToHistory(domain, r.data.guide);
      toast.success("FYP Guide generated!");
    } catch { toast.error("Failed to generate guide. Try again."); }
    finally { setLoading(false); }
  };

  const handleCopy = () => { navigator.clipboard.writeText(guide); toast.success("Guide copied!"); };

  const handleExport = () => {
    const blob = new Blob([guide], { type:"text/markdown" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `FYP-Guide-${domain.replace(/\s+/g,"-")}.md`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Guide exported as .md!");
  };

  return (
    <div>
      <style>{mdStyles}</style>
      <PageHeader title="FYP" accent="Guide" accentColor="var(--lavender)"
        sub="AI-generated final year project roadmap tailored to your domain and interests"/>

      {/* Tab bar */}
      <div style={{ display:"flex", gap:4, padding:4, background:"var(--bg-3)", borderRadius:11, border:"1px solid var(--border)", marginBottom:22, width:"fit-content" }}>
        {[["generate","Generate New"],["history",`Saved (${history.length})`]].map(([t,lbl]) => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            padding:"7px 18px", borderRadius:8, border:"none", cursor:"pointer",
            fontFamily:"var(--font-body)", fontSize:".82rem", fontWeight:600,
            background: activeTab === t ? "var(--lavender)" : "transparent",
            color:      activeTab === t ? "#fff"            : "var(--ink-3)",
            transition:"all .2s",
          }}>{lbl}</button>
        ))}
      </div>

      {activeTab === "history" && (
        <div>
          {history.length === 0 ? (
            <div className="glass" style={{ padding:"48px 24px", textAlign:"center" }}>
              <p style={{ color:"var(--ink-3)", fontSize:".9rem", marginBottom:16 }}>No saved guides yet.</p>
              <button className="btn-glow" onClick={() => setActiveTab("generate")} style={{ background:"var(--lavender)", color:"#fff" }}>Generate First Guide</button>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {history.map((h, i) => (
                <div key={h.id} className="glass" style={{ overflow:"hidden" }}>
                  <div style={{ padding:"13px 18px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ fontSize:"1.1rem" }}>{DOMAIN_ICONS[h.domain] || "✦"}</span>
                      <div>
                        <div style={{ fontWeight:600, color:"var(--ink)", fontSize:".88rem" }}>{h.domain}</div>
                        <div style={{ fontSize:".7rem", color:"var(--ink-4)" }}>{h.date}</div>
                      </div>
                    </div>
                    <button onClick={() => { setGuide(h.guide); setDomain(h.domain); setActiveTab("generate"); }}
                      style={{ padding:"5px 12px", borderRadius:7, border:"1px solid var(--lavender-border)", background:"var(--lavender-dim)", color:"var(--lavender)", fontFamily:"var(--font-body)", fontSize:".77rem", fontWeight:600, cursor:"pointer" }}>
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "generate" && (
        <div style={{ display:"grid", gap:20, alignItems:"start" }} className="fyp-layout">
          <style>{`.fyp-layout{grid-template-columns:300px 1fr!important;}@media(max-width:860px){.fyp-layout{grid-template-columns:1fr!important;}}`}</style>

          {/* Config */}
          <div className="glass fade-up" style={{ padding:"22px 20px" }}>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:"block", fontSize:".68rem", fontWeight:700, color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:".12em", marginBottom:7 }}>Domain</label>
              <select className="glow-input" value={domain} onChange={e => setDomain(e.target.value)}>
                <option value="">Select domain…</option>
                {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:"block", fontSize:".68rem", fontWeight:700, color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:".12em", marginBottom:7 }}>Your Interest / Idea</label>
              <textarea className="glow-input"
                placeholder="e.g. I want to build a recommendation system for e-commerce using collaborative filtering…"
                value={interest} onChange={e => setInterest(e.target.value)}
                rows={4} style={{ resize:"none", lineHeight:1.6 }}/>
            </div>
            <div style={{ marginBottom:22 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
                <label style={{ fontSize:".68rem", fontWeight:700, color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:".12em" }}>Team Size</label>
                <span style={{ fontFamily:"var(--font-display)", fontStyle:"italic", color:"var(--lavender)", fontSize:"1.1rem" }}>{teamSize}</span>
              </div>
              <input type="range" min={1} max={6} value={teamSize} onChange={e => setTeamSize(Number(e.target.value))}
                style={{ width:"100%", accentColor:"var(--lavender)", cursor:"pointer" }}/>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:".65rem", color:"var(--ink-4)", marginTop:3 }}>
                <span>Solo</span><span>6 members</span>
              </div>
            </div>
            <button className="btn-glow" onClick={handleGenerate}
              disabled={loading || !domain || !interest.trim()}
              style={{ width:"100%", padding:12, background:"var(--lavender)", color:"#fff" }}>
              {loading ? "Generating…" : "Generate FYP Guide →"}
            </button>
          </div>

          {/* Output */}
          <div className="fade-up">
            {loading && (
              <div className="glass" style={{ padding:"60px 24px", textAlign:"center" }}>
                <div className="loader" style={{ marginBottom:16 }}/>
                <p style={{ color:"var(--ink-3)" }}>Building your personalised FYP roadmap…</p>
              </div>
            )}
            {guide && !loading && (
              <div className="glass" style={{ padding:"24px 22px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18, paddingBottom:16, borderBottom:"1px solid var(--border)", flexWrap:"wrap", gap:10 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:"1.4rem" }}>{DOMAIN_ICONS[domain] || "✦"}</span>
                    <div>
                      <div style={{ fontWeight:600, color:"var(--ink)", fontSize:".95rem" }}>Your FYP Roadmap</div>
                      <div style={{ padding:"2px 10px", borderRadius:99, background:"var(--lavender-dim)", border:"1px solid var(--lavender-border)", fontSize:".72rem", color:"var(--lavender)", fontWeight:700, display:"inline-block", marginTop:3 }}>{domain}</div>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={handleCopy} style={{ padding:"6px 13px", borderRadius:7, border:"1px solid var(--border-med)", background:"transparent", color:"var(--ink-2)", fontFamily:"var(--font-body)", fontSize:".78rem", cursor:"pointer" }}>Copy</button>
                    <button onClick={handleExport} style={{ padding:"6px 13px", borderRadius:7, border:"1px solid var(--border-med)", background:"transparent", color:"var(--ink-2)", fontFamily:"var(--font-body)", fontSize:".78rem", cursor:"pointer" }}>Export .md</button>
                  </div>
                </div>
                <div className="fyp-md"><ReactMarkdown>{guide}</ReactMarkdown></div>
              </div>
            )}
            {!guide && !loading && (
              <div className="glass" style={{ padding:"60px 24px", textAlign:"center" }}>
                <div style={{ fontSize:"2.5rem", marginBottom:14, opacity:.2 }}>✦</div>
                <p style={{ color:"var(--ink-3)", fontSize:".9rem" }}>Fill in your project details and generate a personalised roadmap.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}