import { useEffect, useState } from "react";
import api from "../services/api";

const scoreColor = (score) => {
  if (score >= 80) return "#34d399";
  if (score >= 50) return "#fbbf24";
  return "#f87171";
};

const statusLabel = (score) => {
  if (score >= 80) return { text: "Mastered", icon: "✦" };
  if (score >= 50) return { text: "In Progress", icon: "◈" };
  return { text: "Needs Work", icon: "◎" };
};

function SubjectCard({ subject, index }) {
  const pct   = Math.round(subject.progress_percentage);
  const score = subject.average_score;
  const color = scoreColor(score);
  const status = statusLabel(score);

  return (
    <div
      className="glass fade-up"
      style={{
        padding: "24px",
        animationDelay: `${0.05 + index * 0.04}s`,
        transition: "all 0.3s ease",
        cursor: "default",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.borderColor = `${color}55`;
        e.currentTarget.style.boxShadow = `0 12px 32px ${color}22`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Subject name */}
      <h2 style={{ fontSize: "1rem", fontWeight: "700", color: "#f1f5f9", marginBottom: "16px", lineHeight: 1.3 }}>
        {subject.subject_name}
      </h2>

      {/* Progress bar */}
      <div style={{ marginBottom: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
          <span style={{ fontSize: "0.75rem", color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Coverage
          </span>
          <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#94a3b8" }}>{pct}%</span>
        </div>
        <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: "99px", height: "6px", overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${pct}%`,
            borderRadius: "99px",
            background: pct > 0
              ? `linear-gradient(90deg, ${color}88, ${color})`
              : "transparent",
            transition: "width 1s ease",
            boxShadow: pct > 0 ? `0 0 8px ${color}66` : "none",
          }} />
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: "0.72rem", color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Avg Score
          </div>
          <div style={{ fontSize: "1.4rem", fontWeight: "800", fontFamily: "'Syne', sans-serif", color: "#f1f5f9" }}>
            {score.toFixed(1)}
          </div>
        </div>

        <div style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: "5px 12px",
          borderRadius: "99px",
          background: `${color}18`,
          border: `1px solid ${color}44`,
          fontSize: "0.75rem",
          fontWeight: "700",
          color: color,
        }}>
          <span>{status.icon}</span>
          <span>{status.text}</span>
        </div>
      </div>
    </div>
  );
}

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

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
      {/* Header */}
      <div className="fade-up" style={{ marginBottom: "36px" }}>
        <h1 className="title-font" style={{ fontSize: "2.4rem", letterSpacing: "-0.03em", marginBottom: "8px" }}>
          My <span style={{ background: "linear-gradient(135deg, #6366f1, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Subjects</span>
        </h1>
        <p style={{ color: "#64748b", fontSize: "0.95rem" }}>Track your progress across the full MCA syllabus</p>
      </div>

      {/* Summary pills */}
      {!loading && subjects.length > 0 && (
        <div className="fade-up" style={{ display: "flex", gap: "12px", marginBottom: "32px", flexWrap: "wrap" }}>
          {[
            { label: "Mastered",    count: mastered,   color: "#34d399" },
            { label: "In Progress", count: inProgress, color: "#fbbf24" },
            { label: "Needs Work",  count: needsWork,  color: "#f87171" },
          ].map(p => (
            <div key={p.label} style={{
              padding: "6px 16px",
              borderRadius: "99px",
              background: `${p.color}12`,
              border: `1px solid ${p.color}33`,
              fontSize: "0.82rem",
              fontWeight: "600",
              color: p.color,
              display: "flex", gap: "8px", alignItems: "center",
            }}>
              <span style={{
                background: p.color,
                color: "#0a0e1a",
                borderRadius: "99px",
                padding: "1px 8px",
                fontSize: "0.75rem",
                fontWeight: "800",
              }}>{p.count}</span>
              {p.label}
            </div>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ padding: "80px 0", textAlign: "center" }}>
          <div className="loader" />
          <p style={{ color: "#475569", marginTop: "16px", fontSize: "0.9rem" }}>Loading subjects...</p>
        </div>
      )}

      {/* Grid */}
      {!loading && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "16px",
        }}>
          {subjects.map((s, i) => (
            <SubjectCard key={s.subject_id} subject={s} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Subjects;
