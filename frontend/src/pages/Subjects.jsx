import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import PageHeader from "../components/PageHeader";
import { SkeletonCard } from "../components/SkeletonCard";

const sc = s => s >= 80 ? "var(--jade)" : s >= 50 ? "var(--gold)" : s > 0 ? "var(--ruby)" : "var(--ink-4)";
const sl = s => s >= 80 ? "Mastered" : s >= 50 ? "In Progress" : s > 0 ? "Needs Work" : "Not Started";

function MiniRing({ pct, size = 44, color }) {
  const r    = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (pct / 100);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform:"rotate(-90deg)", flexShrink:0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg-4)" strokeWidth="4"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition:"stroke-dasharray 1.2s cubic-bezier(0.16,1,0.3,1)" }}/>
    </svg>
  );
}

export default function Subjects() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("all");

  useEffect(() => {
    api.get("/progress/subjects")
      .then(r => setSubjects(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const mastered    = subjects.filter(s => s.average_score >= 80).length;
  const inProgress  = subjects.filter(s => s.average_score >= 50 && s.average_score < 80).length;
  const needsWork   = subjects.filter(s => s.average_score > 0 && s.average_score < 50).length;
  const notStarted  = subjects.filter(s => s.average_score === 0).length;

  const filtered = subjects.filter(s => {
    const matchSearch = !search || s.subject_name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all"         ? true :
      filter === "mastered"    ? s.average_score >= 80 :
      filter === "inprogress"  ? (s.average_score >= 50 && s.average_score < 80) :
      filter === "needswork"   ? (s.average_score > 0 && s.average_score < 50) :
      s.average_score === 0;
    return matchSearch && matchFilter;
  });

  const overallAvg = subjects.length
    ? Math.round(subjects.reduce((a, s) => a + s.average_score, 0) / subjects.length)
    : 0;

  return (
    <div>
      <style>{`
        .sub-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;}
        .filter-chips{display:flex;gap:8px;flex-wrap:wrap;}
        @media(max-width:480px){.sub-grid{grid-template-columns:1fr;}}
      `}</style>

      <PageHeader
        title="My" accent="Subjects" accentColor="var(--sapphire)"
        sub="Track your syllabus coverage and average score per subject"
      />

      {/* Top stats */}
      {!loading && subjects.length > 0 && (
        <div className="fade-up" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:22 }}>
          {[
            { label:"Mastered",    count:mastered,   color:"var(--jade)"     },
            { label:"In Progress", count:inProgress, color:"var(--gold)"     },
            { label:"Needs Work",  count:needsWork,  color:"var(--ruby)"     },
            { label:"Not Started", count:notStarted, color:"var(--ink-4)"   },
          ].map(p => (
            <div key={p.label} className="glass" style={{ padding:"14px 16px" }}>
              <div style={{ fontFamily:"var(--font-display)", fontStyle:"italic", fontSize:"1.7rem", color:p.color, lineHeight:1, marginBottom:4 }}>{p.count}</div>
              <div style={{ fontSize:".67rem", color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:".08em", fontWeight:700 }}>{p.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Search + filter */}
      {!loading && subjects.length > 0 && (
        <div className="fade-up" style={{ display:"flex", gap:10, marginBottom:18, flexWrap:"wrap", alignItems:"center" }}>
          <input
            className="glow-input" type="text"
            placeholder="Search subjects…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ maxWidth:280, flex:1 }}
          />
          <div className="filter-chips">
            {[
              { id:"all",        label:"All"         },
              { id:"mastered",   label:"Mastered"    },
              { id:"inprogress", label:"In Progress" },
              { id:"needswork",  label:"Needs Work"  },
              { id:"notstarted", label:"Not Started" },
            ].map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)} style={{
                padding:"6px 13px", borderRadius:99, cursor:"pointer",
                border: filter === f.id ? "1px solid var(--sapphire-border)" : "1px solid var(--border-med)",
                background: filter === f.id ? "var(--sapphire-dim)" : "transparent",
                color: filter === f.id ? "var(--sapphire)" : "var(--ink-3)",
                fontFamily:"var(--font-body)", fontSize:".78rem", fontWeight: filter === f.id ? 700 : 400,
                transition:"all .15s", WebkitTapHighlightColor:"transparent",
              }}>{f.label}</button>
            ))}
          </div>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="sub-grid">
          {Array.from({length:8}).map((_,i) => <SkeletonCard key={i} rows={3} height={120}/>)}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="glass" style={{ padding:"56px 24px", textAlign:"center" }}>
          <p style={{ color:"var(--ink-3)", fontSize:".9rem", marginBottom:20 }}>
            {search || filter !== "all" ? "No subjects match your filter." : "No subjects found."}
          </p>
          <button onClick={() => navigate("/generate-quiz")} className="btn-glow">Generate a Quiz to Begin</button>
        </div>
      )}

      {/* Subject cards */}
      <div className="sub-grid">
        {filtered.map((s, i) => {
          const score = s.average_score ?? 0;
          const pct   = Math.round(s.progress_percentage ?? 0);
          const color = sc(score);
          const label = sl(score);
          return (
            <div key={s.subject_id}
              className="glass fade-up hover-card"
              style={{ padding:"18px 20px", animationDelay:`${i * 0.04}s`, position:"relative", overflow:"hidden" }}
              onClick={() => navigate("/generate-quiz")}
            >
              {/* Top accent */}
              <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:color, opacity:.6 }}/>

              {/* Header */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14, gap:10 }}>
                <h3 style={{ fontSize:".88rem", fontWeight:600, color:"var(--ink)", lineHeight:1.35, flex:1 }}>
                  {s.subject_name}
                </h3>
                <MiniRing pct={pct} size={40} color={color}/>
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontSize:".66rem", color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:".08em", fontWeight:700 }}>Coverage</span>
                  <span style={{ fontSize:".76rem", fontWeight:700, color:"var(--ink-2)", fontFamily:"var(--font-mono)" }}>{pct}%</span>
                </div>
                <div style={{ background:"var(--bg-overlay)", borderRadius:99, height:3, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${pct}%`, borderRadius:99, background:color, transition:"width 1.2s cubic-bezier(0.16,1,0.3,1)" }}/>
                </div>
              </div>

              {/* Score + status */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ fontFamily:"var(--font-display)", fontStyle:"italic", fontSize:"1.55rem", color, lineHeight:1 }}>
                  {score > 0 ? score.toFixed(1) : "—"}
                  <span style={{ fontSize:".78rem", color:"var(--ink-3)", marginLeft:3, fontFamily:"var(--font-body)", fontStyle:"normal" }}>avg</span>
                </div>
                <span style={{
                  fontSize:".65rem", fontWeight:700, letterSpacing:".06em",
                  padding:"3px 9px", borderRadius:99,
                  background:`color-mix(in srgb, ${color} 12%, transparent)`,
                  color,
                }}>{label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall footer */}
      {!loading && subjects.length > 0 && (
        <div className="fade-up" style={{ marginTop:20, padding:"14px 20px", borderRadius:11, border:"1px solid var(--border)", display:"flex", gap:24, alignItems:"center", flexWrap:"wrap" }}>
          <span style={{ fontSize:".64rem", color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:".1em", fontWeight:700 }}>Overall</span>
          <div style={{ display:"flex", alignItems:"baseline", gap:5 }}>
            <span style={{ fontFamily:"var(--font-display)", fontStyle:"italic", fontSize:"1.3rem", color:sc(overallAvg) }}>{overallAvg}%</span>
            <span style={{ color:"var(--ink-4)", fontSize:".77rem" }}>average across all subjects</span>
          </div>
          <div style={{ display:"flex", alignItems:"baseline", gap:5 }}>
            <span style={{ fontFamily:"var(--font-display)", fontStyle:"italic", fontSize:"1.3rem", color:"var(--sapphire)" }}>{subjects.length}</span>
            <span style={{ color:"var(--ink-4)", fontSize:".77rem" }}>total subjects</span>
          </div>
        </div>
      )}
    </div>
  );
}