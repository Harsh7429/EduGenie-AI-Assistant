import { useState, useRef } from "react";
import { generateResume, improveResume, compileResume } from "../services/api";
import { toast } from "../components/Toast";
import PageHeader from "../components/PageHeader";

const L = ({ children }) => (
  <label style={{ display:"block", fontSize:".68rem", color:"var(--ink-4)", marginBottom:6, fontWeight:700, textTransform:"uppercase", letterSpacing:".1em" }}>{children}</label>
);
const GInput = props => <input className="glow-input" style={{ marginBottom:0 }} {...props}/>;

const TARGET_ROLES = [
  "Data Analyst","Software Developer","Full Stack Developer","Frontend Developer",
  "Backend Developer","ML Engineer","Android Developer","Cloud Engineer",
  "DevOps Engineer","Cybersecurity Analyst","Database Administrator","Business Analyst",
];

const EMPTY_FORM = {
  name:"", phone:"", email:"", linkedin:"", target_role:"", summary:"",
  skills:[{ category:"", items:"" }],
  experience:[{ title:"", duration:"", company:"", tools:"", bullets:["","",""] }],
  projects:[{ title:"", tech:"", bullets:["",""] }],
  certifications:[""],
  education:[
    { degree:"", status:"", institution:"", detail:"" },
    { degree:"", status:"", institution:"", detail:"" },
  ],
};

const STEPS = ["Basics","Skills","Experience","Projects","Education & Certs"];

function BulletList({ values, onChange, placeholder }) {
  return (
    <div>
      {values.map((v, i) => (
        <div key={i} style={{ display:"flex", gap:6, marginBottom:6 }}>
          <span style={{ color:"var(--lavender)", marginTop:11, flexShrink:0, fontSize:"1rem" }}>▸</span>
          <GInput value={v} placeholder={placeholder} style={{ flex:1 }}
            onChange={e => { const n=[...values]; n[i]=e.target.value; onChange(n); }}/>
          {values.length > 1 && (
            <button onClick={() => onChange(values.filter((_,j)=>j!==i))}
              style={{ background:"transparent", border:"none", color:"var(--ruby)", cursor:"pointer", fontSize:".9rem", flexShrink:0 }}>✕</button>
          )}
        </div>
      ))}
      <button onClick={() => onChange([...values,""])} style={{
        background:"transparent", border:"1px dashed var(--lavender-border)",
        borderRadius:7, color:"var(--lavender)", cursor:"pointer",
        padding:"4px 12px", fontSize:".75rem", fontFamily:"var(--font-body)", marginTop:4,
      }}>+ Add bullet</button>
    </div>
  );
}

function LatexResult({ latex, onCompile, compiling }) {
  const [tab,    setTab]    = useState("preview");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(latex); setCopied(true);
    toast.success("LaTeX copied!"); setTimeout(() => setCopied(false), 2000);
  };
  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([latex], { type:"text/plain" }));
    a.download = "resume.tex"; a.click();
    toast.success("resume.tex downloaded!");
  };
  const handleOverleaf = () => {
    handleCopy();
    setTimeout(() => window.open("https://www.overleaf.com/project","_blank"), 500);
    toast.info("LaTeX copied — paste it in Overleaf as a new project!");
  };

  return (
    <div className="glass fade-up" style={{ overflow:"hidden" }}>
      {/* Tab bar */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 20px", borderBottom:"1px solid var(--border)", flexWrap:"wrap", gap:8 }}>
        <div style={{ display:"flex", gap:4, background:"var(--bg-3)", borderRadius:8, padding:3 }}>
          {[["preview","Preview"],["code","LaTeX Code"]].map(([t,lbl]) => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding:"5px 13px", borderRadius:7, border:"none", cursor:"pointer",
              fontFamily:"var(--font-body)", fontSize:".78rem", fontWeight:600,
              background: tab===t ? "var(--lavender)" : "transparent",
              color:      tab===t ? "#fff"            : "var(--ink-3)",
              transition:"all .2s",
            }}>{lbl}</button>
          ))}
        </div>
        <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
          <button onClick={handleDownload} style={{ padding:"6px 12px", borderRadius:7, cursor:"pointer", border:"1px solid var(--sapphire-border)", background:"var(--sapphire-dim)", color:"var(--sapphire)", fontFamily:"var(--font-body)", fontSize:".76rem", fontWeight:600 }}>↓ .tex</button>
          <button onClick={handleCopy} style={{ padding:"6px 12px", borderRadius:7, cursor:"pointer", border:"1px solid var(--lavender-border)", background:"var(--lavender-dim)", color:"var(--lavender)", fontFamily:"var(--font-body)", fontSize:".76rem", fontWeight:600 }}>{copied?"✓ Copied":"Copy"}</button>
          <button onClick={handleOverleaf} style={{ padding:"6px 14px", borderRadius:7, cursor:"pointer", background:"#4f9e4c", border:"none", color:"#fff", fontFamily:"var(--font-body)", fontSize:".76rem", fontWeight:700 }}>🍃 Overleaf</button>
          <button onClick={onCompile} disabled={compiling} style={{ padding:"6px 14px", borderRadius:7, cursor:"pointer", background:"var(--lavender)", border:"none", color:"#fff", fontFamily:"var(--font-body)", fontSize:".76rem", fontWeight:700, opacity:compiling?.6:1 }}>{compiling?"Compiling…":"⚡ PDF"}</button>
        </div>
      </div>

      {/* ATS badge row */}
      <div style={{ padding:"9px 20px", background:"var(--jade-dim)", borderBottom:"1px solid var(--jade-border)", display:"flex", gap:16, fontSize:".72rem", color:"var(--jade)", flexWrap:"wrap" }}>
        {["ATS-Optimized","Single Page","No Tables/Graphics","Keyword-Rich Bullets","Standard Sections"].map(t => (
          <span key={t}>✦ {t}</span>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding:"18px 20px" }}>
        {tab === "code" ? (
          <pre style={{ fontFamily:"var(--font-mono)", fontSize:".74rem", lineHeight:1.6, color:"var(--ink-2)", whiteSpace:"pre-wrap", wordBreak:"break-word", background:"var(--bg-3)", padding:16, borderRadius:10, maxHeight:520, overflowY:"auto" }}>{latex}</pre>
        ) : (
          <div style={{ background:"var(--bg-3)", borderRadius:10, padding:18, maxHeight:580, overflowY:"auto" }}>
            <p style={{ color:"var(--ink-4)", fontSize:".73rem", marginBottom:14, textAlign:"center" }}>Approximate preview — use Overleaf or Compile PDF for exact output.</p>
            <div style={{ fontFamily:"Georgia,serif", fontSize:".82rem", lineHeight:1.75, color:"var(--ink-2)", whiteSpace:"pre-wrap" }}>
              {latex
                .replace(/\\documentclass.*?\\begin\{document\}/s, "")
                .replace(/\\end\{document\}/, "")
                .replace(/\\[a-zA-Z]+(\[.*?\])?(\{.*?\})?/g, " ")
                .replace(/\s{2,}/g, "\n").trim()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResumeBuilder() {
  const [mode,       setMode]       = useState("build");
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [uploadText, setUploadText] = useState("");
  const [improveRole,setImproveRole]= useState("");
  const [latex,      setLatex]      = useState("");
  const [loading,    setLoading]    = useState(false);
  const [compiling,  setCompiling]  = useState(false);
  const [step,       setStep]       = useState(0);

  const upd = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleCompile = async (code) => {
    setCompiling(true);
    try {
      const r = await compileResume(code);
      if (r.data.pdf_base64) {
        const blob = new Blob([Uint8Array.from(atob(r.data.pdf_base64), c => c.charCodeAt(0))], { type:"application/pdf" });
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "resume.pdf"; a.click();
        toast.success("PDF downloaded!");
      } else { toast.info("pdflatex not on server — use Overleaf to compile!"); }
    } catch { toast.info("Compilation unavailable on server — use Overleaf!"); }
    finally { setCompiling(false); }
  };

  const handleGenerate = async () => {
    if (!form.name || !form.target_role) { toast.info("Name and target role are required."); return; }
    setLoading(true); setLatex("");
    try {
      const payload = {
        ...form,
        skills:         form.skills.filter(s => s.category && s.items),
        experience:     form.experience.filter(e => e.company || e.title).map(e => ({ ...e, bullets:e.bullets.filter(Boolean) })),
        projects:       form.projects.filter(p => p.title).map(p => ({ ...p, bullets:p.bullets.filter(Boolean) })),
        certifications: form.certifications.filter(Boolean),
        education:      form.education.filter(e => e.degree || e.institution),
      };
      const r = await generateResume(payload);
      setLatex(r.data.latex);
      toast.success("Resume generated!");
      await handleCompile(r.data.latex);
    } catch { toast.error("Generation failed. Try again."); }
    finally { setLoading(false); }
  };

  const handleImprove = async () => {
    if (!uploadText.trim() || !improveRole) { toast.info("Paste your resume and select a role."); return; }
    setLoading(true); setLatex("");
    try {
      const r = await improveResume(uploadText, improveRole);
      setLatex(r.data.latex);
      toast.success("Resume improved!");
      await handleCompile(r.data.latex);
    } catch { toast.error("Improvement failed. Try again."); }
    finally { setLoading(false); }
  };

  const renderStep = () => {
    switch(step) {
      case 0: return (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div><L>Full Name *</L><GInput placeholder="e.g. Ravi Kumar" value={form.name} onChange={e=>upd("name",e.target.value)}/></div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div><L>Phone</L><GInput placeholder="+91-9XXXXXXXXX" value={form.phone} onChange={e=>upd("phone",e.target.value)}/></div>
            <div><L>Email</L><GInput placeholder="you@email.com" value={form.email} onChange={e=>upd("email",e.target.value)}/></div>
          </div>
          <div><L>LinkedIn URL</L><GInput placeholder="linkedin.com/in/yourname" value={form.linkedin} onChange={e=>upd("linkedin",e.target.value)}/></div>
          <div>
            <L>Target Role *</L>
            <select className="glow-input" value={form.target_role} onChange={e=>upd("target_role",e.target.value)}>
              <option value="">— Select Target Role —</option>
              {TARGET_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <L>Professional Summary</L>
            <textarea className="glow-input" rows={3} value={form.summary} placeholder="Brief summary highlighting your skills and goals…"
              onChange={e=>upd("summary",e.target.value)} style={{ resize:"vertical", lineHeight:1.6 }}/>
          </div>
        </div>
      );
      case 1: return (
        <div>
          {form.skills.map((s,i) => (
            <div key={i} className="glass" style={{ padding:16, marginBottom:12, position:"relative" }}>
              {form.skills.length > 1 && <button onClick={() => upd("skills",form.skills.filter((_,j)=>j!==i))} style={{ position:"absolute", top:10, right:10, background:"transparent", border:"none", color:"var(--ruby)", cursor:"pointer" }}>✕</button>}
              <div style={{ marginBottom:10 }}><L>Skill Category</L><GInput placeholder="e.g. Programming & Querying" value={s.category} onChange={e=>{const n=[...form.skills];n[i]={...n[i],category:e.target.value};upd("skills",n);}}/></div>
              <div><L>Skills (comma-separated)</L><GInput placeholder="Python, SQL, Excel, Power BI" value={s.items} onChange={e=>{const n=[...form.skills];n[i]={...n[i],items:e.target.value};upd("skills",n);}}/></div>
            </div>
          ))}
          <button onClick={() => upd("skills",[...form.skills,{category:"",items:""}])} style={{ width:"100%", padding:"10px", borderRadius:9, cursor:"pointer", border:"1px dashed var(--lavender-border)", background:"transparent", color:"var(--lavender)", fontFamily:"var(--font-body)", fontWeight:600, fontSize:".85rem" }}>+ Add Skill Category</button>
        </div>
      );
      case 2: return (
        <div>
          {form.experience.map((exp,i) => (
            <div key={i} className="glass" style={{ padding:16, marginBottom:14, position:"relative" }}>
              {form.experience.length > 1 && <button onClick={() => upd("experience",form.experience.filter((_,j)=>j!==i))} style={{ position:"absolute", top:10, right:10, background:"transparent", border:"none", color:"var(--ruby)", cursor:"pointer" }}>✕</button>}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
                <div><L>Job Title</L><GInput placeholder="Data Analyst Intern" value={exp.title} onChange={e=>{const n=[...form.experience];n[i]={...n[i],title:e.target.value};upd("experience",n);}}/></div>
                <div><L>Duration</L><GInput placeholder="April 2025 – June 2025" value={exp.duration} onChange={e=>{const n=[...form.experience];n[i]={...n[i],duration:e.target.value};upd("experience",n);}}/></div>
              </div>
              <div style={{ marginBottom:10 }}><L>Company</L><GInput placeholder="Company Name (Location)" value={exp.company} onChange={e=>{const n=[...form.experience];n[i]={...n[i],company:e.target.value};upd("experience",n);}}/></div>
              <div style={{ marginBottom:12 }}><L>Tools Used</L><GInput placeholder="Excel, SQL, Power BI" value={exp.tools} onChange={e=>{const n=[...form.experience];n[i]={...n[i],tools:e.target.value};upd("experience",n);}}/></div>
              <L>Responsibilities / Achievements</L>
              <BulletList values={exp.bullets} placeholder="Describe what you did and its impact…" onChange={bullets=>{const n=[...form.experience];n[i]={...n[i],bullets};upd("experience",n);}}/>
            </div>
          ))}
          <button onClick={() => upd("experience",[...form.experience,{title:"",duration:"",company:"",tools:"",bullets:[""]}])} style={{ width:"100%", padding:"10px", borderRadius:9, cursor:"pointer", border:"1px dashed var(--lavender-border)", background:"transparent", color:"var(--lavender)", fontFamily:"var(--font-body)", fontWeight:600, fontSize:".85rem" }}>+ Add Experience</button>
          <p style={{ color:"var(--ink-4)", fontSize:".75rem", marginTop:8 }}>No experience? Add internships, freelance work, or college projects here.</p>
        </div>
      );
      case 3: return (
        <div>
          {form.projects.map((proj,i) => (
            <div key={i} className="glass" style={{ padding:16, marginBottom:14, position:"relative" }}>
              {form.projects.length > 1 && <button onClick={() => upd("projects",form.projects.filter((_,j)=>j!==i))} style={{ position:"absolute", top:10, right:10, background:"transparent", border:"none", color:"var(--ruby)", cursor:"pointer" }}>✕</button>}
              <div style={{ marginBottom:10 }}><L>Project Title</L><GInput placeholder="e.g. Customer Churn Analysis" value={proj.title} onChange={e=>{const n=[...form.projects];n[i]={...n[i],title:e.target.value};upd("projects",n);}}/></div>
              <div style={{ marginBottom:12 }}><L>Tech Stack</L><GInput placeholder="Python, Pandas, Matplotlib" value={proj.tech} onChange={e=>{const n=[...form.projects];n[i]={...n[i],tech:e.target.value};upd("projects",n);}}/></div>
              <L>Key Points / Outcomes</L>
              <BulletList values={proj.bullets} placeholder="What you built and the impact it had…" onChange={bullets=>{const n=[...form.projects];n[i]={...n[i],bullets};upd("projects",n);}}/>
            </div>
          ))}
          <button onClick={() => upd("projects",[...form.projects,{title:"",tech:"",bullets:[""]}])} style={{ width:"100%", padding:"10px", borderRadius:9, cursor:"pointer", border:"1px dashed var(--lavender-border)", background:"transparent", color:"var(--lavender)", fontFamily:"var(--font-body)", fontWeight:600, fontSize:".85rem" }}>+ Add Project</button>
        </div>
      );
      case 4: return (
        <div>
          <p style={{ fontSize:".72rem", color:"var(--lavender)", fontWeight:700, textTransform:"uppercase", letterSpacing:".1em", marginBottom:12 }}>Education</p>
          {form.education.map((ed,i) => (
            <div key={i} className="glass" style={{ padding:16, marginBottom:12 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
                <div><L>Degree</L><GInput placeholder="MCA / BCA / B.Sc. IT" value={ed.degree} onChange={e=>{const n=[...form.education];n[i]={...n[i],degree:e.target.value};upd("education",n);}}/></div>
                <div><L>Status / Year</L><GInput placeholder="Pursuing / Graduated: 2025" value={ed.status} onChange={e=>{const n=[...form.education];n[i]={...n[i],status:e.target.value};upd("education",n);}}/></div>
              </div>
              <div style={{ marginBottom:10 }}><L>Institution</L><GInput placeholder="College Name, City" value={ed.institution} onChange={e=>{const n=[...form.education];n[i]={...n[i],institution:e.target.value};upd("education",n);}}/></div>
              <div><L>CGPA / Details (optional)</L><GInput placeholder="CGPA: 8.2 / 10" value={ed.detail} onChange={e=>{const n=[...form.education];n[i]={...n[i],detail:e.target.value};upd("education",n);}}/></div>
            </div>
          ))}
          <p style={{ fontSize:".72rem", color:"var(--lavender)", fontWeight:700, textTransform:"uppercase", letterSpacing:".1em", margin:"20px 0 12px" }}>Certifications & Awards</p>
          {form.certifications.map((c,i) => (
            <div key={i} style={{ display:"flex", gap:6, marginBottom:8 }}>
              <GInput value={c} placeholder="e.g. Google Data Analytics Certificate – Coursera (2024)" style={{ flex:1 }}
                onChange={e=>{const n=[...form.certifications];n[i]=e.target.value;upd("certifications",n);}}/>
              {form.certifications.length > 1 && <button onClick={() => upd("certifications",form.certifications.filter((_,j)=>j!==i))} style={{ background:"transparent", border:"none", color:"var(--ruby)", cursor:"pointer" }}>✕</button>}
            </div>
          ))}
          <button onClick={() => upd("certifications",[...form.certifications,""])} style={{ padding:"7px 14px", borderRadius:8, cursor:"pointer", border:"1px dashed var(--lavender-border)", background:"transparent", color:"var(--lavender)", fontFamily:"var(--font-body)", fontWeight:600, fontSize:".8rem" }}>+ Add Certificate</button>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div>
      <PageHeader title="Resume" accent="Builder" accentColor="var(--lavender)"
        sub="Generate ATS-optimized LaTeX resumes tailored to your target role"/>

      {/* Mode toggle */}
      <div style={{ display:"inline-flex", gap:4, padding:4, background:"var(--bg-3)", borderRadius:11, border:"1px solid var(--border)", marginBottom:24 }}>
        {[["build","📝 Build from Scratch"],["improve","⬆️ Improve Existing"]].map(([m,lbl]) => (
          <button key={m} onClick={() => { setMode(m); setLatex(""); }} style={{
            padding:"7px 18px", borderRadius:8, border:"none", cursor:"pointer",
            fontFamily:"var(--font-body)", fontWeight:600, fontSize:".82rem",
            background: mode===m ? "var(--lavender)" : "transparent",
            color:      mode===m ? "#fff"            : "var(--ink-3)",
            transition:"all .2s",
          }}>{lbl}</button>
        ))}
      </div>

      <div style={{ display:"grid", gap:22, alignItems:"start" }} className="resume-layout">
        <style>{`.resume-layout{grid-template-columns:380px 1fr!important;}@media(max-width:1000px){.resume-layout{grid-template-columns:1fr!important;}}`}</style>

        {/* Left panel */}
        <div>
          {mode === "build" ? (
            <>
              {/* Step tabs */}
              <div style={{ display:"flex", gap:0, marginBottom:18, borderRadius:10, overflow:"hidden", border:"1px solid var(--border)" }}>
                {STEPS.map((s,i) => (
                  <button key={i} onClick={() => setStep(i)} style={{
                    flex:1, padding:"8px 4px", border:"none", cursor:"pointer",
                    fontFamily:"var(--font-body)", fontSize:".65rem", fontWeight:600,
                    background: step===i ? "var(--lavender-dim)" : "transparent",
                    color:      step===i ? "var(--lavender)" : step>i ? "var(--jade)" : "var(--ink-4)",
                    borderRight: i<STEPS.length-1 ? "1px solid var(--border)" : "none",
                    transition:"all .2s",
                  }}>
                    {step>i ? "✓" : i+1}<br/>
                    <span style={{ fontWeight:400 }}>{s}</span>
                  </button>
                ))}
              </div>

              <div className="glass" style={{ padding:"20px 18px", marginBottom:14 }}>{renderStep()}</div>

              <div style={{ display:"flex", gap:10 }}>
                {step > 0 && <button onClick={() => setStep(s=>s-1)} style={{ flex:1, padding:"10px", borderRadius:9, cursor:"pointer", border:"1px solid var(--border-med)", background:"transparent", color:"var(--ink-3)", fontFamily:"var(--font-body)", fontWeight:600, fontSize:".85rem" }}>← Back</button>}
                {step < STEPS.length-1
                  ? <button onClick={() => setStep(s=>s+1)} style={{ flex:1, padding:"10px", borderRadius:9, cursor:"pointer", background:"var(--lavender)", border:"none", color:"#fff", fontFamily:"var(--font-body)", fontWeight:700, fontSize:".85rem" }}>Next →</button>
                  : <button onClick={handleGenerate} disabled={loading} style={{ flex:1, padding:"11px", borderRadius:9, cursor:"pointer", background:"var(--lavender)", border:"none", color:"#fff", fontFamily:"var(--font-body)", fontWeight:700, fontSize:".9rem", opacity:loading?.7:1 }}>{loading?"Generating…":"✨ Generate Resume"}</button>
                }
              </div>
            </>
          ) : (
            <div className="glass" style={{ padding:"22px 20px" }}>
              <div style={{ marginBottom:14 }}>
                <L>Target Role *</L>
                <select className="glow-input" value={improveRole} onChange={e=>setImproveRole(e.target.value)}>
                  <option value="">— Select Target Role —</option>
                  {TARGET_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div style={{ marginBottom:14 }}>
                <L>Paste Your Resume Text *</L>
                <textarea className="glow-input" rows={12}
                  placeholder="Paste your existing resume text here. The AI will rewrite it for your target role…"
                  value={uploadText} onChange={e=>setUploadText(e.target.value)}
                  style={{ resize:"vertical", lineHeight:1.6, fontSize:".82rem" }}/>
              </div>
              <div style={{ marginBottom:18, padding:12, borderRadius:9, background:"var(--gold-dim)", border:"1px solid var(--gold-border)" }}>
                <p style={{ fontSize:".77rem", color:"var(--ink-3)", lineHeight:1.6 }}>
                  💡 <strong style={{ color:"var(--gold)" }}>Tip:</strong> Open your PDF, select all text (Ctrl+A), copy (Ctrl+C) and paste here. The AI keeps your real data and only improves the wording.
                </p>
              </div>
              <button onClick={handleImprove} disabled={loading || !uploadText.trim() || !improveRole}
                style={{ width:"100%", padding:13, borderRadius:9, cursor:"pointer", background:"var(--lavender)", border:"none", color:"#fff", fontFamily:"var(--font-body)", fontWeight:700, fontSize:".9rem", opacity:(!uploadText.trim()||!improveRole||loading)?.6:1 }}>
                {loading?"Improving…":"✨ Improve Resume"}
              </button>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div>
          {loading && (
            <div className="glass" style={{ padding:"72px 24px", textAlign:"center" }}>
              <div className="loader" style={{ marginBottom:16 }}/>
              <p style={{ color:"var(--ink-3)" }}>Crafting your ATS-optimized resume…</p>
              <p style={{ color:"var(--ink-4)", fontSize:".8rem", marginTop:8 }}>Optimising keywords, action verbs &amp; results for your target role</p>
            </div>
          )}
          {latex && !loading && (
            <LatexResult latex={latex} onCompile={() => handleCompile(latex)} compiling={compiling}/>
          )}
          {!latex && !loading && (
            <div className="glass" style={{ padding:"72px 24px", textAlign:"center", opacity:.5 }}>
              <div style={{ fontSize:"2.5rem", marginBottom:14 }}>📄</div>
              <p style={{ color:"var(--ink-3)", fontSize:".9rem" }}>Fill in your details and generate your professional resume.</p>
              <p style={{ color:"var(--ink-4)", fontSize:".8rem", marginTop:8 }}>LaTeX code appears here • Copy to Overleaf or compile to PDF</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}