import { useEffect, useState } from "react";
import api from "../services/api";

const scoreColor = (score) => {
  if (score >= 80) return "var(--emerald)";
  if (score >= 50) return "var(--amber)";
  return "var(--rose)";
};

const statusLabel = (score) => {
  if (score >= 80) return { text:"Mastered",    dot:"var(--emerald)" };
  if (score >= 50) return { text:"In Progress", dot:"var(--amber)" };
  return              { text:"Needs Work",   dot:"var(--rose)" };
};

function SubjectCard({ subject, index }) {
  const pct    = Math.round(subject.progress_percentage);
  const score  = subject.average_score;
  const color  = scoreColor(score);
  const status = statusLabel(score);

  return (
    <div
      className="glass fade-up"
      style={{ padding:"20px", animationDelay:`${0.04+index*0.04}s`, transition:"all 0.2s", cursor:"default" }}
      onMouseEnter={e => {
        e.currentTarget.style.transform="translateY(-3px)";
        e.currentTarget.style.borderColor=`${color === "var(--emerald)" ? "rgba(52,211,153,0.3)" : color === "var(--amber)" ? "rgba(245,158,11,0.3)" : "rgba(251,113,133,0.3)"}`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform="translateY(0)";
        e.currentTarget.style.borderColor="var(--border)";
      }}
    >
      {/* Top accent */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
        <h2 style={{ fontSize:"0.88rem", fontWeight:600, color:"var(--ink)", lineHeight:1.35, flex:1, marginRight:10 }}>
          {subject.subject_name}
        </h2>
        <div style={{
          display:"flex", alignItems:"center", gap:5,
          padding:"3px 9px", borderRadius:99, flexShrink:0,
          background: color==="var(--emerald)"?"var(--emerald-dim)":color==="var(--amber)"?"var(--amber-dim)":"var(--rose-dim)",
          border: `1px solid ${color==="var(--emerald)"?"rgba(52,211,153,0.25)":color==="var(--amber)"?"rgba(245,158,11,0.25)":"rgba(251,113,133,0.25)"}`,
        }}>
          <div style={{ width:5, height:5, borderRadius:"50%", background:status.dot }}/>
          <span style={{ fontSize:"0.68rem", fontWeight:700, color, letterSpacing:"0.04em" }}>{status.text}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom:14 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
          <span style={{ fontSize:"0.68rem", color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:600 }}>
            Coverage
          </span>
          <span style={{ fontSize:"0.78rem", fontWeight:700, color:"var(--ink-2)", fontFamily:"var(--font-mono)" }}>{pct}%</span>
        </div>
        <div style={{ background:"var(--bg-overlay)", borderRadius:"99px", height:"3px", overflow:"hidden" }}>
          <div style={{
            height:"100%", width:`${pct}%`, borderRadius:"99px",
            background: color,
            transition:"width 1s cubic-bezier(0.16,1,0.3,1)",
          }} />
        </div>
      </div>

      {/* Score */}
      <div style={{
        fontFamily:"var(--font-display)", fontStyle:"italic",
        fontSize:"1.6rem", color,
      }}>
        {score.toFixed(1)}<span style={{ fontSize:"0.9rem", color:"var(--ink-3)", marginLeft:2 }}>avg</span>
      </div>
    </div>
  );
}

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get("/progress/subjects")
      .then(r => setSubjects(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const mastered   = subjects.filter(s => s.average_score >= 80).length;
  const inProgress = subjects.filter(s => s.average_score >= 50 && s.average_score < 80).length;
  const needsWork  = subjects.filter(s => s.average_score < 50).length;

  return (
    <div>
      <div className="fade-up" style={{ marginBottom:28 }}>
        <h1 style={{
          fontFamily:"var(--font-display)", fontStyle:"italic",
          fontSize:"2.4rem", color:"var(--ink)", marginBottom:8,
        }}>
          My <span style={{ color:"var(--teal)" }}>Subjects</span>
        </h1>
        <p style={{ color:"var(--ink-3)", fontSize:"0.92rem" }}>Track your progress across the full MCA syllabus</p>
      </div>

      {!loading && subjects.length > 0 && (
        <div className="fade-up" style={{ display:"flex", gap:10, marginBottom:28, flexWrap:"wrap" }}>
          {[
            { label:"Mastered",    count:mastered,   color:"var(--emerald)", dimColor:"rgba(52,211,153,0.12)",  border:"rgba(52,211,153,0.25)" },
            { label:"In Progress", count:inProgress, color:"var(--amber)",   dimColor:"var(--amber-dim)",       border:"rgba(245,158,11,0.25)" },
            { label:"Needs Work",  count:needsWork,  color:"var(--rose)",    dimColor:"var(--rose-dim)",        border:"rgba(251,113,133,0.25)" },
          ].map(p => (
            <div key={p.label} style={{
              padding:"5px 14px", borderRadius:99,
              background:p.dimColor, border:`1px solid ${p.border}`,
              fontSize:"0.8rem", fontWeight:600, color:p.color,
              display:"flex", gap:8, alignItems:"center",
            }}>
              <span style={{
                background:p.color, color:"#09090b",
                borderRadius:99, padding:"0px 7px",
                fontSize:"0.72rem", fontWeight:800,
              }}>{p.count}</span>
              {p.label}
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div style={{ padding:"80px 0", textAlign:"center" }}>
          <div className="loader" />
          <p style={{ color:"var(--ink-3)", marginTop:16, fontSize:"0.9rem" }}>Loading subjects…</p>
        </div>
      )}

      {!loading && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))", gap:14 }}>
          {subjects.map((s,i) => <SubjectCard key={s.subject_id} subject={s} index={i} />)}
        </div>
      )}
    </div>
  );
}

export default Subjects;
