import { useState, useRef } from "react";
import { generateResume, improveResume, compileResume } from "../services/api";
import { toast } from "../components/Toast";

const L = ({ children }) => (
  <label style={{ display:"block", fontSize:"0.72rem", color:"#64748b",
    marginBottom:6, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em" }}>
    {children}
  </label>
);

const GInput = (props) => (
  <input className="glow-input" style={{ marginBottom:0 }} {...props} />
);

const TARGET_ROLES = [
  "Data Analyst", "Software Developer", "Full Stack Developer",
  "Frontend Developer", "Backend Developer", "ML Engineer",
  "Android Developer", "Cloud Engineer", "DevOps Engineer",
  "Cybersecurity Analyst", "Database Administrator", "Business Analyst"
];

const EMPTY_FORM = {
  name:"", phone:"", email:"", linkedin:"",
  target_role:"", summary:"",
  skills:[{ category:"", items:"" }],
  experience:[{ title:"", duration:"", company:"", tools:"", bullets:["","",""] }],
  projects:[{ title:"", tech:"", bullets:["",""] }],
  certifications:[""],
  education:[
    { degree:"", status:"", institution:"", detail:"" },
    { degree:"", status:"", institution:"", detail:"" },
  ],
};

// ── LaTeX display + actions ──────────────────────────────────────────
function LatexResult({ latex, onRecompile, compiling }) {
  const [copied, setCopied]   = useState(false);
  const [tab, setTab]         = useState("preview"); // "preview" | "code"

  const handleCopy = () => {
    navigator.clipboard.writeText(latex);
    setCopied(true); toast.success("LaTeX copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOverleaf = () => {
    // Overleaf "create from clipboard" — user copies first then clicks
    handleCopy();
    setTimeout(() => window.open("https://www.overleaf.com/project", "_blank"), 500);
    toast.info("LaTeX copied — paste it in Overleaf as a new project!");
  };

  const handleDownloadTex = () => {
    const blob = new Blob([latex], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "resume.tex"; a.click();
    URL.revokeObjectURL(url);
    toast.success("resume.tex downloaded!");
  };

  return (
    <div className="glass fade-up" style={{ padding:0, overflow:"hidden" }}>
      {/* Tab bar */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"14px 22px", borderBottom:"1px solid rgba(99,102,241,0.15)" }}>
        <div style={{ display:"flex", gap:4 }}>
          {[["preview","👁 Preview"],["code","</> LaTeX Code"]].map(([t,lbl]) => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding:"6px 14px", borderRadius:8, border:"none", cursor:"pointer",
              fontFamily:"'Space Grotesk',sans-serif", fontSize:"0.8rem", fontWeight:600,
              background: tab===t ? "rgba(99,102,241,0.2)" : "transparent",
              color: tab===t ? "#818cf8" : "#64748b",
            }}>{lbl}</button>
          ))}
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={handleDownloadTex} style={{
            padding:"6px 12px", borderRadius:8, cursor:"pointer",
            border:"1px solid rgba(6,182,212,0.3)", background:"rgba(6,182,212,0.08)",
            color:"#22d3ee", fontFamily:"'Space Grotesk',sans-serif", fontSize:"0.78rem", fontWeight:600,
          }}>↓ .tex</button>
          <button onClick={handleCopy} style={{
            padding:"6px 12px", borderRadius:8, cursor:"pointer",
            border:"1px solid rgba(99,102,241,0.3)", background:"rgba(99,102,241,0.08)",
            color:"#818cf8", fontFamily:"'Space Grotesk',sans-serif", fontSize:"0.78rem", fontWeight:600,
          }}>{copied ? "✓ Copied" : "Copy"}</button>
          <button onClick={handleOverleaf} style={{
            padding:"6px 14px", borderRadius:8, cursor:"pointer",
            background:"linear-gradient(135deg,#4f9e4c,#45a049)",
            border:"none", color:"#fff",
            fontFamily:"'Space Grotesk',sans-serif", fontSize:"0.78rem", fontWeight:700,
            boxShadow:"0 0 12px rgba(79,158,76,0.4)",
          }}>🍃 Open in Overleaf</button>
          {onRecompile && (
            <button onClick={onRecompile} disabled={compiling} style={{
              padding:"6px 14px", borderRadius:8, cursor:"pointer",
              background:"linear-gradient(135deg,#6366f1,#7c3aed)", border:"none", color:"#fff",
              fontFamily:"'Space Grotesk',sans-serif", fontSize:"0.78rem", fontWeight:700,
              opacity: compiling ? 0.6 : 1,
            }}>{compiling ? "Compiling..." : "⚡ Compile PDF"}</button>
          )}
        </div>
      </div>

      {/* ATS tips banner */}
      <div style={{ padding:"10px 22px",
        background:"rgba(52,211,153,0.06)", borderBottom:"1px solid rgba(52,211,153,0.12)",
        display:"flex", gap:16, fontSize:"0.75rem", color:"#34d399", flexWrap:"wrap" }}>
        <span>✦ ATS-Optimized</span>
        <span>✦ Single Page</span>
        <span>✦ No Tables/Graphics</span>
        <span>✦ Keyword-Rich Bullets</span>
        <span>✦ Standard Sections</span>
      </div>

      {/* Content */}
      <div style={{ padding:22 }}>
        {tab === "code" ? (
          <pre style={{
            fontFamily:"'Courier New',monospace", fontSize:"0.75rem", lineHeight:1.6,
            color:"#94a3b8", whiteSpace:"pre-wrap", wordBreak:"break-word",
            background:"rgba(0,0,0,0.2)", padding:16, borderRadius:10,
            maxHeight:520, overflowY:"auto",
          }}>{latex}</pre>
        ) : (
          <div style={{
            fontFamily:"Georgia, serif", fontSize:"0.82rem", lineHeight:1.7,
            color:"#cbd5e1", maxHeight:600, overflowY:"auto",
            padding:16, background:"rgba(0,0,0,0.15)", borderRadius:10,
          }}>
            <p style={{ color:"#64748b", fontSize:"0.75rem", marginBottom:16, textAlign:"center" }}>
              LaTeX preview (approximate). Use "Open in Overleaf" or "Compile PDF" for exact rendering.
            </p>
            <div style={{ whiteSpace:"pre-wrap" }}>{
              latex
                .replace(/\\documentclass.*?\\begin\{document\}/s, "")
                .replace(/\\end\{document\}/, "")
                .replace(/\\[a-zA-Z]+(\[.*?\])?(\{.*?\})?/g, " ")
                .replace(/\s{2,}/g, "\n")
                .trim()
            }</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Dynamic list field ───────────────────────────────────────────────
function BulletList({ values, onChange, placeholder }) {
  return (
    <div>
      {values.map((v,i) => (
        <div key={i} style={{ display:"flex", gap:6, marginBottom:6 }}>
          <span style={{ color:"#6366f1", marginTop:10, flexShrink:0 }}>▸</span>
          <GInput value={v} placeholder={placeholder}
            onChange={e => { const n=[...values]; n[i]=e.target.value; onChange(n); }}
            style={{ flex:1 }} />
          {values.length > 1 && (
            <button onClick={() => onChange(values.filter((_,j)=>j!==i))}
              style={{ background:"transparent", border:"none", color:"#f87171", cursor:"pointer", fontSize:"1rem" }}>✕</button>
          )}
        </div>
      ))}
      <button onClick={() => onChange([...values,""])}
        style={{ background:"transparent", border:"1px dashed rgba(99,102,241,0.3)",
          borderRadius:7, color:"#6366f1", cursor:"pointer", padding:"4px 12px",
          fontSize:"0.75rem", fontFamily:"'Space Grotesk',sans-serif", marginTop:4 }}>
        + Add bullet
      </button>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────
export default function ResumeBuilder() {
  const [mode, setMode]         = useState("build"); // "build" | "improve"
  const [form, setForm]         = useState(EMPTY_FORM);
  const [uploadText, setUploadText] = useState("");
  const [improveRole, setImproveRole] = useState("");
  const [latex, setLatex]       = useState("");
  const [pdfUrl, setPdfUrl]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [compiling, setCompiling] = useState(false);
  const [step, setStep]         = useState(0); // 0=basics 1=skills 2=exp 3=projects 4=certs/edu
  const fileRef = useRef(null);

  const STEPS = ["Basics", "Skills", "Experience", "Projects", "Education & Certs"];

  const upd = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // ── Handle resume file upload (text extraction) ──────────────────
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // For PDF: read as text (basic extraction)
    const reader = new FileReader();
    reader.onload = (ev) => setUploadText(ev.target.result);
    reader.readAsText(file);
    toast.info("Resume loaded. If garbled, paste text manually.");
  };

  // ── Compile current latex to PDF ────────────────────────────────
  const handleCompile = async (code) => {
    setCompiling(true); setPdfUrl(null);
    try {
      const r = await compileResume(code);
      if (r.data.pdf_base64) {
        const blob = new Blob(
          [Uint8Array.from(atob(r.data.pdf_base64), c => c.charCodeAt(0))],
          { type:"application/pdf" }
        );
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        // Trigger download
        const a = document.createElement("a"); a.href=url; a.download="resume.pdf"; a.click();
        toast.success("PDF downloaded! 🎉");
      } else if (r.data.overleaf_url) {
        toast.info("pdflatex not found on server. Use Overleaf to compile!");
      }
    } catch (err) {
      const d = err?.response?.data;
      if (d?.overleaf_url) {
        toast.info("pdflatex not installed on server — use Overleaf!");
      } else {
        toast.error("Compilation failed. Check LaTeX code.");
      }
    }
    setCompiling(false);
  };

  // ── Generate from form ────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!form.name || !form.target_role) {
      toast.info("Name and target role are required."); return;
    }
    setLoading(true); setLatex(""); setPdfUrl(null);
    try {
      const payload = {
        ...form,
        skills: form.skills.filter(s => s.category && s.items),
        experience: form.experience.filter(e => e.company || e.title).map(e => ({
          ...e, bullets: e.bullets.filter(Boolean)
        })),
        projects: form.projects.filter(p => p.title).map(p => ({
          ...p, bullets: p.bullets.filter(Boolean)
        })),
        certifications: form.certifications.filter(Boolean),
        education: form.education.filter(e => e.degree || e.institution),
      };
      const r = await generateResume(payload);
      setLatex(r.data.latex);
      toast.success("Resume generated! 🎉");
      // Auto-compile
      await handleCompile(r.data.latex);
    } catch { toast.error("Generation failed. Try again."); }
    setLoading(false);
  };

  // ── Improve uploaded resume ───────────────────────────────────────
  const handleImprove = async () => {
    if (!uploadText.trim() || !improveRole) {
      toast.info("Paste your resume text and select a target role."); return;
    }
    setLoading(true); setLatex(""); setPdfUrl(null);
    try {
      const r = await improveResume(uploadText, improveRole);
      setLatex(r.data.latex);
      toast.success("Resume improved! 🎉");
      await handleCompile(r.data.latex);
    } catch { toast.error("Improvement failed. Try again."); }
    setLoading(false);
  };

  // ── Render form steps ─────────────────────────────────────────────
  const renderStep = () => {
    switch(step) {
      case 0: return ( // Basics
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div><L>Full Name *</L><GInput placeholder="e.g. Ravi Kumar" value={form.name} onChange={e=>upd("name",e.target.value)}/></div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div><L>Phone *</L><GInput placeholder="+91-9XXXXXXXXX" value={form.phone} onChange={e=>upd("phone",e.target.value)}/></div>
            <div><L>Email *</L><GInput placeholder="you@email.com" value={form.email} onChange={e=>upd("email",e.target.value)}/></div>
          </div>
          <div><L>LinkedIn URL</L><GInput placeholder="linkedin.com/in/yourname" value={form.linkedin} onChange={e=>upd("linkedin",e.target.value)}/></div>
          <div>
            <L>Target Role *</L>
            <select className="glow-input" value={form.target_role} onChange={e=>upd("target_role",e.target.value)}>
              <option value="">-- Select Target Role --</option>
              {TARGET_ROLES.map(r=><option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <L>Professional Summary</L>
            <textarea className="glow-input" rows={3} value={form.summary}
              placeholder="Brief summary highlighting your skills and goals for this role..."
              onChange={e=>upd("summary",e.target.value)}
              style={{ resize:"vertical", fontFamily:"'Space Grotesk',sans-serif", lineHeight:1.6 }}/>
          </div>
        </div>
      );

      case 1: return ( // Skills
        <div>
          {form.skills.map((s,i) => (
            <div key={i} className="glass" style={{ padding:16, marginBottom:12, position:"relative" }}>
              {form.skills.length > 1 && (
                <button onClick={() => upd("skills",form.skills.filter((_,j)=>j!==i))}
                  style={{ position:"absolute", top:10, right:10, background:"transparent",
                    border:"none", color:"#f87171", cursor:"pointer", fontSize:"1rem" }}>✕</button>
              )}
              <div style={{ marginBottom:10 }}>
                <L>Skill Category</L>
                <GInput placeholder="e.g. Programming & Querying"
                  value={s.category} onChange={e => { const n=[...form.skills]; n[i]={...n[i],category:e.target.value}; upd("skills",n); }}/>
              </div>
              <div>
                <L>Skills (comma-separated)</L>
                <GInput placeholder="e.g. Python, SQL, Excel, Power BI"
                  value={s.items} onChange={e => { const n=[...form.skills]; n[i]={...n[i],items:e.target.value}; upd("skills",n); }}/>
              </div>
            </div>
          ))}
          <button onClick={() => upd("skills",[...form.skills,{category:"",items:""}])}
            style={{ width:"100%", padding:"10px", borderRadius:9, cursor:"pointer",
              border:"1px dashed rgba(99,102,241,0.3)", background:"transparent",
              color:"#6366f1", fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, fontSize:"0.85rem" }}>
            + Add Skill Category
          </button>
        </div>
      );

      case 2: return ( // Experience
        <div>
          {form.experience.map((exp,i) => (
            <div key={i} className="glass" style={{ padding:16, marginBottom:14, position:"relative" }}>
              {form.experience.length > 1 && (
                <button onClick={() => upd("experience",form.experience.filter((_,j)=>j!==i))}
                  style={{ position:"absolute", top:10, right:10, background:"transparent",
                    border:"none", color:"#f87171", cursor:"pointer", fontSize:"1rem" }}>✕</button>
              )}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
                <div><L>Job Title</L><GInput placeholder="Data Analyst Intern" value={exp.title}
                  onChange={e=>{const n=[...form.experience];n[i]={...n[i],title:e.target.value};upd("experience",n);}}/></div>
                <div><L>Duration</L><GInput placeholder="April 2025 – June 2025" value={exp.duration}
                  onChange={e=>{const n=[...form.experience];n[i]={...n[i],duration:e.target.value};upd("experience",n);}}/></div>
              </div>
              <div style={{ marginBottom:10 }}>
                <L>Company</L>
                <GInput placeholder="Company Name (Location)" value={exp.company}
                  onChange={e=>{const n=[...form.experience];n[i]={...n[i],company:e.target.value};upd("experience",n);}}/>
              </div>
              <div style={{ marginBottom:12 }}>
                <L>Tools Used</L>
                <GInput placeholder="Excel, SQL, Power BI" value={exp.tools}
                  onChange={e=>{const n=[...form.experience];n[i]={...n[i],tools:e.target.value};upd("experience",n);}}/>
              </div>
              <L>Responsibilities / Achievements</L>
              <BulletList values={exp.bullets}
                placeholder="Describe what you did and its impact..."
                onChange={bullets=>{const n=[...form.experience];n[i]={...n[i],bullets};upd("experience",n);}}/>
            </div>
          ))}
          <button onClick={() => upd("experience",[...form.experience,{title:"",duration:"",company:"",tools:"",bullets:[""]}])}
            style={{ width:"100%", padding:"10px", borderRadius:9, cursor:"pointer",
              border:"1px dashed rgba(99,102,241,0.3)", background:"transparent",
              color:"#6366f1", fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, fontSize:"0.85rem" }}>
            + Add Experience
          </button>
          <p style={{ color:"#334155", fontSize:"0.75rem", marginTop:8 }}>
            No experience? That's fine — add internships, freelance work, or college projects here.
          </p>
        </div>
      );

      case 3: return ( // Projects
        <div>
          {form.projects.map((proj,i) => (
            <div key={i} className="glass" style={{ padding:16, marginBottom:14, position:"relative" }}>
              {form.projects.length > 1 && (
                <button onClick={() => upd("projects",form.projects.filter((_,j)=>j!==i))}
                  style={{ position:"absolute", top:10, right:10, background:"transparent",
                    border:"none", color:"#f87171", cursor:"pointer", fontSize:"1rem" }}>✕</button>
              )}
              <div style={{ marginBottom:10 }}>
                <L>Project Title</L>
                <GInput placeholder="e.g. Customer Churn Analysis" value={proj.title}
                  onChange={e=>{const n=[...form.projects];n[i]={...n[i],title:e.target.value};upd("projects",n);}}/>
              </div>
              <div style={{ marginBottom:12 }}>
                <L>Tech Stack</L>
                <GInput placeholder="Python, Pandas, Matplotlib" value={proj.tech}
                  onChange={e=>{const n=[...form.projects];n[i]={...n[i],tech:e.target.value};upd("projects",n);}}/>
              </div>
              <L>Key Points / Outcomes</L>
              <BulletList values={proj.bullets}
                placeholder="What you built and what impact it had..."
                onChange={bullets=>{const n=[...form.projects];n[i]={...n[i],bullets};upd("projects",n);}}/>
            </div>
          ))}
          <button onClick={() => upd("projects",[...form.projects,{title:"",tech:"",bullets:[""]}])}
            style={{ width:"100%", padding:"10px", borderRadius:9, cursor:"pointer",
              border:"1px dashed rgba(99,102,241,0.3)", background:"transparent",
              color:"#6366f1", fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, fontSize:"0.85rem" }}>
            + Add Project
          </button>
        </div>
      );

      case 4: return ( // Education + Certs
        <div>
          <h3 style={{ fontWeight:700, color:"#818cf8", marginBottom:14, fontSize:"0.9rem" }}>Education</h3>
          {form.education.map((ed,i) => (
            <div key={i} className="glass" style={{ padding:16, marginBottom:12 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
                <div><L>Degree</L><GInput placeholder="MCA / BCA / B.Sc. IT" value={ed.degree}
                  onChange={e=>{const n=[...form.education];n[i]={...n[i],degree:e.target.value};upd("education",n);}}/></div>
                <div><L>Status / Year</L><GInput placeholder="Pursuing / Graduated: 2025" value={ed.status}
                  onChange={e=>{const n=[...form.education];n[i]={...n[i],status:e.target.value};upd("education",n);}}/></div>
              </div>
              <div style={{ marginBottom:10 }}>
                <L>Institution</L>
                <GInput placeholder="College Name, City" value={ed.institution}
                  onChange={e=>{const n=[...form.education];n[i]={...n[i],institution:e.target.value};upd("education",n);}}/>
              </div>
              <div><L>CGPA / Details (optional)</L>
                <GInput placeholder="CGPA: 8.2 / 10" value={ed.detail}
                  onChange={e=>{const n=[...form.education];n[i]={...n[i],detail:e.target.value};upd("education",n);}}/>
              </div>
            </div>
          ))}

          <h3 style={{ fontWeight:700, color:"#818cf8", margin:"20px 0 12px", fontSize:"0.9rem" }}>
            Certifications & Awards
          </h3>
          {form.certifications.map((c,i) => (
            <div key={i} style={{ display:"flex", gap:6, marginBottom:8 }}>
              <GInput value={c} placeholder="e.g. Google Data Analytics Certificate – Coursera (2024)"
                onChange={e=>{const n=[...form.certifications];n[i]=e.target.value;upd("certifications",n);}}
                style={{ flex:1 }}/>
              {form.certifications.length>1 && (
                <button onClick={()=>upd("certifications",form.certifications.filter((_,j)=>j!==i))}
                  style={{ background:"transparent", border:"none", color:"#f87171", cursor:"pointer" }}>✕</button>
              )}
            </div>
          ))}
          <button onClick={()=>upd("certifications",[...form.certifications,""])}
            style={{ padding:"8px 14px", borderRadius:8, cursor:"pointer",
              border:"1px dashed rgba(99,102,241,0.3)", background:"transparent",
              color:"#6366f1", fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, fontSize:"0.8rem" }}>
            + Add Certificate
          </button>
        </div>
      );

      default: return null;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="fade-up" style={{ marginBottom:28 }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"5px 14px",
          borderRadius:99, background:"rgba(244,114,182,0.1)", border:"1px solid rgba(244,114,182,0.25)",
          marginBottom:14, fontSize:"0.75rem", color:"#f472b6", fontWeight:700, letterSpacing:"0.06em" }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:"#f472b6", display:"inline-block" }}/>
          ATS-FRIENDLY RESUME
        </div>
        <h1 className="title-font" style={{ fontSize:"2.4rem", letterSpacing:"-0.03em", marginBottom:8 }}>
          Resume{" "}
          <span style={{ background:"linear-gradient(135deg,#f472b6,#818cf8)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Builder</span>
        </h1>
        <p style={{ color:"#64748b", fontSize:"0.95rem" }}>
          Generate ATS-optimized resumes in LaTeX — same professional template, tailored to your target role
        </p>
      </div>

      {/* Mode toggle */}
      <div style={{ display:"inline-flex", gap:4, padding:4,
        background:"rgba(255,255,255,0.04)", borderRadius:12,
        border:"1px solid rgba(244,114,182,0.15)", marginBottom:24 }}>
        {[["build","📝 Build from Scratch"],["improve","⬆️ Improve Existing"]].map(([m,lbl]) => (
          <button key={m} onClick={() => { setMode(m); setLatex(""); setPdfUrl(null); }} style={{
            padding:"7px 18px", borderRadius:9, border:"none", cursor:"pointer",
            fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, fontSize:"0.83rem",
            background: mode===m ? "linear-gradient(135deg,#db2777,#9333ea)" : "transparent",
            color: mode===m ? "#fff" : "#64748b",
            boxShadow: mode===m ? "0 0 14px rgba(219,39,119,0.4)" : "none",
            transition:"all 0.2s ease",
          }}>{lbl}</button>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"400px 1fr", gap:24, alignItems:"start" }}>
        {/* Left panel */}
        <div>
          {mode === "build" ? (
            <div>
              {/* Step indicator */}
              <div style={{ display:"flex", gap:0, marginBottom:20, borderRadius:10, overflow:"hidden",
                border:"1px solid rgba(244,114,182,0.2)" }}>
                {STEPS.map((s,i) => (
                  <button key={i} onClick={() => setStep(i)} style={{
                    flex:1, padding:"8px 4px", border:"none", cursor:"pointer",
                    fontFamily:"'Space Grotesk',sans-serif", fontSize:"0.68rem", fontWeight:600,
                    background: step===i ? "rgba(244,114,182,0.2)" : "transparent",
                    color: step===i ? "#f472b6" : step>i ? "#34d399" : "#475569",
                    borderRight: i<STEPS.length-1 ? "1px solid rgba(244,114,182,0.15)" : "none",
                    transition:"all 0.2s",
                  }}>
                    {step>i ? "✓" : i+1}<br/>
                    <span style={{ fontWeight:400 }}>{s}</span>
                  </button>
                ))}
              </div>

              <div className="glass fade-up" style={{ padding:22, marginBottom:14 }}>
                {renderStep()}
              </div>

              {/* Step navigation */}
              <div style={{ display:"flex", gap:10 }}>
                {step > 0 && (
                  <button onClick={() => setStep(s=>s-1)} style={{
                    flex:1, padding:"10px", borderRadius:9, cursor:"pointer",
                    border:"1px solid rgba(255,255,255,0.1)", background:"transparent",
                    color:"#64748b", fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, fontSize:"0.85rem",
                  }}>← Back</button>
                )}
                {step < STEPS.length-1 ? (
                  <button onClick={() => setStep(s=>s+1)} style={{
                    flex:1, padding:"10px", borderRadius:9, cursor:"pointer",
                    background:"linear-gradient(135deg,#db2777,#9333ea)", border:"none", color:"#fff",
                    fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:"0.85rem",
                    boxShadow:"0 0 14px rgba(219,39,119,0.35)",
                  }}>Next →</button>
                ) : (
                  <button onClick={handleGenerate} disabled={loading} style={{
                    flex:1, padding:"11px", borderRadius:9, cursor:"pointer",
                    background:"linear-gradient(135deg,#db2777,#9333ea)", border:"none", color:"#fff",
                    fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:"0.9rem",
                    boxShadow:"0 0 20px rgba(219,39,119,0.5)", opacity: loading ? 0.7 : 1,
                  }}>{loading ? "⏳ Generating..." : "✨ Generate Resume"}</button>
                )}
              </div>
            </div>
          ) : (
            // Improve mode
            <div className="glass fade-up" style={{ padding:24 }}>
              <h3 style={{ fontWeight:700, color:"#f472b6", marginBottom:16, fontSize:"0.95rem" }}>
                ⬆️ Improve Existing Resume
              </h3>

              <div style={{ marginBottom:14 }}>
                <L>Target Role *</L>
                <select className="glow-input" value={improveRole} onChange={e=>setImproveRole(e.target.value)}>
                  <option value="">-- Select Target Role --</option>
                  {TARGET_ROLES.map(r=><option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div style={{ marginBottom:14 }}>
                <L>Paste Resume Text *</L>
                <textarea className="glow-input" rows={12}
                  placeholder="Paste your existing resume text here. The AI will rewrite bullet points, optimize summary, and restructure skills for your target role..."
                  value={uploadText} onChange={e=>setUploadText(e.target.value)}
                  style={{ resize:"vertical", fontFamily:"'Space Grotesk',sans-serif",
                    lineHeight:1.6, fontSize:"0.82rem" }}/>
              </div>

              <div style={{ marginBottom:16, padding:14, borderRadius:10,
                background:"rgba(251,191,36,0.06)", border:"1px solid rgba(251,191,36,0.15)" }}>
                <p style={{ fontSize:"0.78rem", color:"#64748b", lineHeight:1.6 }}>
                  💡 <strong style={{ color:"#fbbf24" }}>Tip:</strong> Open your PDF resume, select all text (Ctrl+A), copy (Ctrl+C), and paste here. 
                  The AI will keep all your real data and only improve the wording.
                </p>
              </div>

              <button onClick={handleImprove} disabled={loading || !uploadText.trim() || !improveRole}
                style={{ width:"100%", padding:13, borderRadius:9, cursor:"pointer",
                  background:"linear-gradient(135deg,#db2777,#9333ea)", border:"none", color:"#fff",
                  fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:"0.9rem",
                  boxShadow:"0 0 20px rgba(219,39,119,0.5)",
                  opacity: (!uploadText.trim() || !improveRole || loading) ? 0.6 : 1 }}>
                {loading ? "⏳ Improving Resume..." : "✨ Improve Resume"}
              </button>
            </div>
          )}
        </div>

        {/* Right panel — result */}
        <div>
          {loading && (
            <div className="glass fade-up" style={{ padding:80, textAlign:"center" }}>
              <div className="loader" style={{ marginBottom:16,
                borderTopColor:"#f472b6", borderColor:"rgba(244,114,182,0.2)" }} />
              <p style={{ color:"#64748b" }}>AI is crafting your ATS-optimized resume...</p>
              <p style={{ color:"#334155", fontSize:"0.8rem", marginTop:8 }}>
                Optimizing keywords, action verbs & quantified results for your target role
              </p>
            </div>
          )}

          {latex && !loading && (
            <LatexResult latex={latex}
              onRecompile={() => handleCompile(latex)}
              compiling={compiling} />
          )}

          {!latex && !loading && (
            <div className="glass" style={{ padding:80, textAlign:"center", opacity:0.5 }}>
              <div style={{ fontSize:"3.5rem", marginBottom:16 }}>📄</div>
              <p style={{ color:"#475569", fontSize:"0.95rem" }}>
                Fill in your details and generate your professional resume
              </p>
              <p style={{ color:"#334155", fontSize:"0.8rem", marginTop:8 }}>
                LaTeX code will appear here • Copy to Overleaf or compile to PDF
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
