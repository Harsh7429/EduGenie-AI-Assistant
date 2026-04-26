import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getDashboardStats, getPersonalDashboard } from "../services/api";

const CARDS = [
  { path: "/subjects",       label: "My Subjects",    desc: "Track syllabus coverage",      accent: "var(--gold)",     badge: "STUDY" },
  { path: "/generate-note",  label: "Generate Note",  desc: "AI-written exam notes",        accent: "var(--sapphire)", badge: "AI"    },
  { path: "/generate-quiz",  label: "Generate Quiz",  desc: "Adaptive MCQs with timer",     accent: "var(--lavender)", badge: "AI"    },
  { path: "/my-quizzes",     label: "Quiz History",   desc: "Review & retry past quizzes",  accent: "var(--jade)",     badge: null    },
  { path: "/analytics",      label: "Analytics",      desc: "Performance insights & trends",accent: "var(--ruby)",     badge: null    },
  { path: "/chat",           label: "AI Tutor",       desc: "Ask anything about MCA",       accent: "var(--sapphire)", badge: "AI"    },
  { path: "/fyp-guide",      label: "FYP Guide",      desc: "Final year project roadmap",   accent: "var(--lavender)", badge: "TOOLS" },
  { path: "/resume-builder", label: "Resume Builder", desc: "ATS-optimized LaTeX resume",   accent: "var(--ruby)",     badge: "TOOLS" },
  { path: "/notes",          label: "My Notes",       desc: "Browse all generated notes",   accent: "var(--gold)",     badge: null    },
];

function ScorePill({ pct }) {
  const c = pct >= 80 ? "var(--jade)" : pct >= 50 ? "var(--gold)" : "var(--ruby)";
  const bg = pct >= 80 ? "var(--jade-dim)" : pct >= 50 ? "var(--gold-dim)" : "var(--ruby-dim)";
  return (
    <span style={{
      padding: "2px 9px", borderRadius: 99, fontSize: "0.73rem", fontWeight: 700,
      background: bg, color: c,
    }}>{pct}%</span>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [global,   setGlobal]   = useState(null);
  const [personal, setPersonal] = useState(null);
  const [loading,  setLoading]  = useState(true);

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

  const avg = personal?.avg_score ?? 0;
  const avgColor = avg >= 80 ? "var(--jade)" : avg >= 50 ? "var(--gold)" : "var(--ruby)";

  return (
    <div>
      <style>{`
        .dash-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; }
        .dash-main { display:grid; grid-template-columns:1fr 300px; gap:20px; align-items:start; }
        @media(max-width:1060px){ .dash-grid{ grid-template-columns:1fr 1fr; } }
        @media(max-width:820px) { .dash-main{ grid-template-columns:1fr; } }
        @media(max-width:560px) { .dash-grid{ grid-template-columns:1fr; } }
      `}</style>

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="fade-up" style={{ marginBottom: 32 }}>
        <p style={{
          fontSize: "0.72rem", color: "var(--ink-4)", textTransform: "uppercase",
          letterSpacing: "0.1em", fontWeight: 600, marginBottom: 6,
        }}>{greeting()}</p>
        <h1 style={{
          fontFamily: "var(--font-display)", fontStyle: "italic",
          fontSize: "clamp(1.9rem, 4vw, 2.8rem)", lineHeight: 1.1,
          color: "var(--ink)", fontWeight: 400, marginBottom: 10,
        }}>
          {personal?.name?.split(" ")[0] || "Scholar"}.
        </h1>
        <p style={{ color: "var(--ink-3)", fontSize: "0.9rem", maxWidth: 400, lineHeight: 1.7 }}>
          Here's where you left off. Ready to pick up where you stopped?
        </p>
      </div>

      {/* ── Stats strip ──────────────────────────────────────────────── */}
      <div className="fade-up" style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr 1fr 1fr",
        gap: 10, marginBottom: 28,
      }}>
        {/* Featured — avg score */}
        <div className="glass" style={{ padding: "22px 24px", position: "relative", overflow: "hidden" }}>
          <div style={{
            position: "absolute", bottom: 0, right: 0, width: "55%", height: "110%",
            background: `radial-gradient(ellipse at bottom right, color-mix(in srgb, ${avgColor} 8%, transparent) 0%, transparent 70%)`,
            pointerEvents: "none",
          }} />
          <div style={{ fontSize: "0.68rem", color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: 8 }}>
            Average Score
          </div>
          <div style={{
            fontFamily: "var(--font-display)", fontStyle: "italic",
            fontSize: "3rem", color: avgColor, lineHeight: 1, marginBottom: 6,
          }}>
            {loading ? "—" : avg > 0 ? `${avg}%` : "—"}
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--ink-3)" }}>
            {avg >= 80 ? "Excellent performance" : avg >= 50 ? "Keep practicing" : avg > 0 ? "Needs improvement" : "No quizzes yet"}
          </div>
        </div>

        {/* 3 compact stats */}
        {[
          { label: "Quizzes",  value: personal?.my_quizzes,      color: "var(--lavender)" },
          { label: "Notes",    value: personal?.my_notes,        color: "var(--sapphire)" },
          { label: "Subjects", value: personal?.active_subjects, color: "var(--gold)"     },
        ].map(s => (
          <div key={s.label} className="glass" style={{ padding: "20px 18px" }}>
            <div style={{ fontSize: "0.68rem", color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: 10 }}>
              {s.label}
            </div>
            <div style={{
              fontFamily: "var(--font-display)", fontStyle: "italic",
              fontSize: "2rem", color: s.color, lineHeight: 1,
            }}>
              {loading ? "—" : (s.value ?? "—")}
            </div>
          </div>
        ))}
      </div>

      {/* ── Main: cards + activity ────────────────────────────────────── */}
      <div className="dash-main" style={{ marginBottom: 24 }}>

        {/* Quick access cards */}
        <div>
          <p style={{
            fontSize: "0.68rem", color: "var(--ink-4)", textTransform: "uppercase",
            letterSpacing: "0.1em", fontWeight: 600, marginBottom: 12,
          }}>Quick Access</p>
          <div className="dash-grid">
            {CARDS.map((card, i) => (
              <div
                key={card.path}
                onClick={() => navigate(card.path)}
                style={{
                  padding: "18px 16px", borderRadius: 11,
                  background: "var(--bg-2)", border: "1px solid var(--border)",
                  cursor: "pointer", transition: "all 0.18s",
                  position: "relative", overflow: "hidden",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = card.accent.replace("var(", "").replace(")", "") === card.accent
                    ? "rgba(200,164,90,0.3)"
                    : `color-mix(in srgb, ${card.accent} 40%, transparent)`;
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = `0 8px 28px rgba(0,0,0,0.3)`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Top accent line */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 1.5,
                  background: `linear-gradient(90deg, ${card.accent}, transparent)`,
                  opacity: 0.5,
                }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{
                    fontWeight: 600, fontSize: "0.86rem", color: "var(--ink)", lineHeight: 1.3,
                  }}>{card.label}</div>
                  {card.badge && (
                    <span style={{
                      fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.08em",
                      color: card.accent, background: `color-mix(in srgb, ${card.accent} 12%, transparent)`,
                      padding: "2px 6px", borderRadius: 4,
                    }}>{card.badge}</span>
                  )}
                </div>
                <div style={{ color: "var(--ink-3)", fontSize: "0.77rem", lineHeight: 1.45 }}>
                  {card.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div>
          <p style={{
            fontSize: "0.68rem", color: "var(--ink-4)", textTransform: "uppercase",
            letterSpacing: "0.1em", fontWeight: 600, marginBottom: 12,
          }}>Recent Activity</p>
          <div className="glass" style={{ padding: "18px 16px" }}>
            {loading && (
              <div style={{ padding: "36px 0", textAlign: "center" }}>
                <div className="loader" style={{ width: 20, height: 20 }} />
              </div>
            )}
            {!loading && !personal?.recent_activity?.length && (
              <div style={{ textAlign: "center", padding: "32px 12px" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  border: "1.5px dashed var(--border-med)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 14px",
                }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="var(--ink-4)" strokeWidth="1.3"/>
                    <path d="M8 5v3l2 1.5" stroke="var(--ink-4)" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                </div>
                <p style={{ fontSize: "0.82rem", color: "var(--ink-3)", marginBottom: 14 }}>
                  No activity yet.
                </p>
                <button onClick={() => navigate("/generate-quiz")} className="btn-glow"
                  style={{ padding: "7px 16px", fontSize: "0.78rem" }}>
                  Take a Quiz
                </button>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {personal?.recent_activity?.map((a, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 11px", borderRadius: 8,
                  background: "var(--bg-3)", border: "1px solid var(--border)",
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: "0.8rem", fontWeight: 600, color: "var(--ink)",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>{a.subject}</div>
                    <div style={{ fontSize: "0.68rem", color: "var(--ink-4)", marginTop: 1 }}>{a.date}</div>
                  </div>
                  <ScorePill pct={a.pct} />
                </div>
              ))}
            </div>
            {personal?.recent_activity?.length > 0 && (
              <button onClick={() => navigate("/analytics")} style={{
                marginTop: 12, width: "100%", padding: "8px", borderRadius: 8,
                border: "1px solid var(--border)", background: "transparent",
                color: "var(--ink-4)", fontFamily: "var(--font-body)",
                fontSize: "0.77rem", cursor: "pointer", transition: "all 0.15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.color = "var(--gold)"; e.currentTarget.style.borderColor = "var(--gold-border)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "var(--ink-4)"; e.currentTarget.style.borderColor = "var(--border)"; }}>
                Full analytics →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Platform footer stats ──────────────────────────────────── */}
      <div style={{
        padding: "14px 20px", borderRadius: 10,
        border: "1px solid var(--border)", background: "transparent",
        display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap",
      }}>
        <span style={{
          fontSize: "0.65rem", color: "var(--ink-4)", textTransform: "uppercase",
          letterSpacing: "0.1em", fontWeight: 700, flexShrink: 0,
        }}>Platform stats</span>
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
          {[
            { label: "subjects", value: global?.total_subjects },
            { label: "notes",    value: global?.total_notes    },
            { label: "quizzes",  value: global?.total_quizzes  },
            { label: "learners", value: global?.total_users    },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
              <span style={{
                fontFamily: "var(--font-display)", fontStyle: "italic",
                fontSize: "1.2rem", color: "var(--ink-2)",
              }}>{loading ? "—" : (s.value ?? "—")}</span>
              <span style={{ color: "var(--ink-4)", fontSize: "0.77rem" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
