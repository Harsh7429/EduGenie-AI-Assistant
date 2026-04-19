import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getDashboardStats, getPersonalDashboard } from "../services/api";

const NAV_CARDS = [
  { path: "/subjects",       label: "My Subjects",    desc: "Track syllabus coverage",       accent: "#f59e0b", icon: "◈" },
  { path: "/generate-note",  label: "Generate Note",  desc: "AI-written exam notes",         accent: "#2dd4bf", icon: "✎" },
  { path: "/generate-quiz",  label: "Generate Quiz",  desc: "MCQs with difficulty levels",   accent: "#a78bfa", icon: "◉" },
  { path: "/my-quizzes",     label: "Quiz History",   desc: "Review past attempts",          accent: "#34d399", icon: "≡" },
  { path: "/analytics",      label: "Analytics",      desc: "Performance insights",          accent: "#fb7185", icon: "∿" },
  { path: "/fyp-guide",      label: "FYP Guide",      desc: "Final year project roadmap",    accent: "#34d399", icon: "✦" },
  { path: "/resume-builder", label: "Resume Builder", desc: "ATS-optimized LaTeX resume",    accent: "#fb7185", icon: "⊞" },
  { path: "/notes",          label: "My Notes",       desc: "All generated notes",           accent: "#fbbf24", icon: "📚" },
];

function ScoreBadge({ pct }) {
  const color = pct >= 80 ? "var(--emerald)" : pct >= 50 ? "var(--amber)" : "var(--rose)";
  return (
    <span style={{
      padding: "2px 10px", borderRadius: 99, fontSize: "0.75rem", fontWeight: 700,
      background: pct >= 80 ? "var(--emerald-dim)" : pct >= 50 ? "var(--amber-dim)" : "var(--rose-dim)",
      border: `1px solid ${pct >= 80 ? "rgba(52,211,153,0.25)" : pct >= 50 ? "rgba(245,158,11,0.25)" : "rgba(251,113,133,0.25)"}`,
      color, whiteSpace: "nowrap",
    }}>
      {pct}%
    </span>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [global, setGlobal]     = useState(null);
  const [personal, setPersonal] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([getDashboardStats(), getPersonalDashboard()])
      .then(([g, p]) => { setGlobal(g.data); setPersonal(p.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const stats = [
    { label: "Quizzes Taken",   value: personal?.my_quizzes,                                          color: "var(--amber)" },
    { label: "Notes Generated", value: personal?.my_notes,                                            color: "var(--teal)" },
    { label: "Average Score",   value: personal?.avg_score != null ? `${personal.avg_score}%` : null, color: personal?.avg_score >= 80 ? "var(--emerald)" : personal?.avg_score >= 50 ? "var(--amber)" : "var(--rose)" },
    { label: "Active Subjects", value: personal?.active_subjects,                                     color: "var(--violet)" },
  ];

  return (
    <div>
      <style>{`
        .dash-stats  { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:32px; }
        .dash-main   { display:grid; grid-template-columns:1fr 292px; gap:20px; margin-bottom:28px; }
        .dash-cards  { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; }
        @media(max-width:1050px){ .dash-cards { grid-template-columns:repeat(2,1fr); } }
        @media(max-width:900px) { .dash-main  { grid-template-columns:1fr; } }
        @media(max-width:600px) { .dash-stats { grid-template-columns:repeat(2,1fr); } .dash-cards { grid-template-columns:repeat(2,1fr); } }
      `}</style>

      {/* Hero */}
      <div className="fade-up" style={{ marginBottom: 28 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          padding: "4px 12px", borderRadius: 99,
          background: "var(--amber-dim)", border: "1px solid rgba(245,158,11,0.25)",
          marginBottom: 16,
        }}>
          <span className="dot-pulse" />
          <span style={{ fontSize: "0.7rem", color: "var(--amber)", fontWeight: 700, letterSpacing: "0.07em" }}>
            AI-POWERED LEARNING PLATFORM
          </span>
        </div>
        <h1 style={{
          fontFamily: "var(--font-display)", fontStyle: "italic",
          fontSize: "clamp(1.7rem,4vw,2.8rem)", lineHeight: 1.1,
          marginBottom: 10,
        }}>
          {greeting()},{" "}
          <span style={{ color: "var(--amber)" }}>
            {personal?.name?.split(" ")[0] || "Scholar"}
          </span>
        </h1>
        <p style={{ color: "var(--ink-3)", fontSize: "0.92rem", maxWidth: 460, lineHeight: 1.7 }}>
          Your AI-powered MCA study companion. Master every topic with smart notes, adaptive quizzes, and real-time progress tracking.
        </p>
      </div>

      {/* Stat strip */}
      <div className="dash-stats fade-up">
        {stats.map((s, i) => (
          <div key={i} className="glass pulse-glow" style={{
            padding: "18px 16px",
            borderRadius: 14,
            position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 2,
              background: s.color, opacity: 0.6,
            }} />
            <div style={{
              fontFamily: "var(--font-display)", fontStyle: "italic",
              fontSize: "1.7rem", color: s.color, lineHeight: 1, marginBottom: 6,
            }}>
              {loading ? "—" : (s.value ?? "—")}
            </div>
            <div style={{ color: "var(--ink-3)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="dash-main">
        <div>
          <div style={{
            fontSize: "0.7rem", color: "var(--ink-4)", textTransform: "uppercase",
            letterSpacing: "0.09em", fontWeight: 700, marginBottom: 12,
          }}>Quick Access</div>
          <div className="dash-cards">
            {NAV_CARDS.map((card, i) => (
              <div
                key={card.path}
                className="fade-up"
                onClick={() => navigate(card.path)}
                style={{
                  background: "var(--bg-raised)",
                  border: "1px solid var(--border)",
                  borderRadius: 12, padding: "16px 14px",
                  cursor: "pointer", transition: "all 0.2s",
                  animationDelay: `${0.05 + i * 0.05}s`,
                  position: "relative", overflow: "hidden",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = `${card.accent}40`;
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = `0 8px 28px ${card.accent}15`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{
                  position: "absolute", top: 0, left: 0, width: 3, bottom: 0,
                  background: card.accent, borderRadius: "12px 0 0 12px", opacity: 0.6,
                }} />
                <div style={{
                  fontSize: "1.1rem", marginBottom: 7, color: card.accent,
                  fontFamily: card.icon.length > 2 ? undefined : "monospace",
                }}>{card.icon}</div>
                <div style={{ fontWeight: 600, fontSize: "0.82rem", color: "var(--ink)", marginBottom: 3 }}>
                  {card.label}
                </div>
                <div style={{ color: "var(--ink-3)", fontSize: "0.72rem", lineHeight: 1.4 }}>
                  {card.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="glass" style={{ padding: 20, height: "fit-content" }}>
          <div style={{
            fontSize: "0.7rem", color: "var(--ink-4)", textTransform: "uppercase",
            letterSpacing: "0.09em", fontWeight: 700, marginBottom: 14,
          }}>Recent Activity</div>

          {loading && (
            <div style={{ padding: "32px 0", textAlign: "center" }}>
              <div className="loader" style={{ width: 22, height: 22, borderWidth: 2 }} />
            </div>
          )}

          {!loading && !personal?.recent_activity?.length && (
            <div style={{ textAlign: "center", padding: "28px 0" }}>
              <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>◎</div>
              <p style={{ fontSize: "0.82rem", color: "var(--ink-3)", marginBottom: 14 }}>No quiz attempts yet.</p>
              <button onClick={() => navigate("/generate-quiz")}
                className="btn-glow" style={{ padding: "7px 16px", fontSize: "0.78rem" }}>
                Take First Quiz
              </button>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {personal?.recent_activity?.map((a, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 11px", borderRadius: 9,
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: "0.8rem", fontWeight: 600, color: "var(--ink)",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{a.subject}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--ink-3)", marginTop: 2 }}>{a.date}</div>
                </div>
                <ScoreBadge pct={a.pct} />
              </div>
            ))}
          </div>

          {personal?.recent_activity?.length > 0 && (
            <button onClick={() => navigate("/analytics")} style={{
              marginTop: 12, width: "100%", padding: "8px", borderRadius: 8, cursor: "pointer",
              border: "1px solid var(--border-med)", background: "transparent",
              color: "var(--ink-3)", fontFamily: "var(--font-body)", fontSize: "0.78rem", fontWeight: 500,
              transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.color = "var(--amber)"; e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "var(--ink-3)"; e.currentTarget.style.borderColor = "var(--border-med)"; }}>
              View Analytics →
            </button>
          )}
        </div>
      </div>

      {/* Platform stats */}
      <div className="glass fade-up" style={{ padding: "14px 20px" }}>
        <div style={{ display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ color: "var(--ink-4)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", flexShrink: 0 }}>
            Platform
          </span>
          {[
            { label: "Subjects", value: global?.total_subjects },
            { label: "Notes",    value: global?.total_notes },
            { label: "Quizzes",  value: global?.total_quizzes },
            { label: "Learners", value: global?.total_users },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{
                fontFamily: "var(--font-display)", fontStyle: "italic",
                fontSize: "1.3rem", color: "var(--ink)",
              }}>{loading ? "—" : (s.value ?? "—")}</span>
              <span style={{ color: "var(--ink-3)", fontSize: "0.78rem" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
