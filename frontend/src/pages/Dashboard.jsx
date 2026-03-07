import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getDashboardStats, getPersonalDashboard } from "../services/api";

const NAV_CARDS = [
  { path: "/subjects",       icon: "📊", label: "My Subjects",    desc: "Track syllabus coverage",       accent: "#818cf8", glow: "rgba(99,102,241,0.3)"  },
  { path: "/generate-note",  icon: "📝", label: "Generate Note",  desc: "AI-written exam notes",         accent: "#22d3ee", glow: "rgba(6,182,212,0.3)"   },
  { path: "/generate-quiz",  icon: "🧠", label: "Generate Quiz",  desc: "MCQs with difficulty levels",   accent: "#a78bfa", glow: "rgba(124,58,237,0.3)"  },
  { path: "/my-quizzes",     icon: "📋", label: "Quiz History",   desc: "Review past attempts",          accent: "#34d399", glow: "rgba(16,185,129,0.3)"  },
  { path: "/analytics",      icon: "📈", label: "Analytics",      desc: "Performance insights & trends", accent: "#f472b6", glow: "rgba(244,114,182,0.3)" },
  { path: "/fyp-guide",      icon: "🎓", label: "FYP Guide",      desc: "Final year project roadmap",    accent: "#34d399", glow: "rgba(52,211,153,0.3)"  },
  { path: "/resume-builder", icon: "📄", label: "Resume Builder", desc: "ATS-optimized LaTeX resume",    accent: "#f472b6", glow: "rgba(244,114,182,0.3)" },
  { path: "/notes",          icon: "📚", label: "My Notes",       desc: "All generated notes",           accent: "#fbbf24", glow: "rgba(245,158,11,0.3)"  },
];

function ScoreBadge({ pct }) {
  const color = pct >= 80 ? "#34d399" : pct >= 50 ? "#fbbf24" : "#f87171";
  return (
    <span style={{ padding: "2px 10px", borderRadius: 99, background: `${color}18`,
      border: `1px solid ${color}44`, color, fontWeight: 700, fontSize: "0.78rem", whiteSpace: "nowrap" }}>
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

  return (
    <div>
      <style>{`
        .dash-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 32px; }
        .dash-main  { display: grid; grid-template-columns: 1fr 300px; gap: 24px; margin-bottom: 32px; }
        .dash-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .dash-platform { display: flex; gap: 32px; align-items: center; flex-wrap: wrap; }
        @media (max-width: 900px) {
          .dash-main { grid-template-columns: 1fr; }
        }
        @media (max-width: 767px) {
          .dash-stats { grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px; }
          .dash-cards { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .dash-platform { gap: 16px; }
        }
      `}</style>

      {/* Hero */}
      <div className="fade-up" style={{ marginBottom: 24 }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"5px 14px",
          borderRadius:99, background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.25)",
          marginBottom:14, fontSize:"0.75rem", color:"#818cf8", fontWeight:600, letterSpacing:"0.06em" }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:"#22d3ee", display:"inline-block" }}/>
          AI-POWERED LEARNING PLATFORM
        </div>
        <h1 className="title-font" style={{ fontSize:"clamp(1.5rem,5vw,2.8rem)", lineHeight:1.1,
          letterSpacing:"-0.03em", marginBottom:10 }}>
          {greeting()},{" "}
          <span style={{ background:"linear-gradient(135deg,#6366f1,#06b6d4)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            {personal?.name?.split(" ")[0] || "Scholar"}
          </span> ✦
        </h1>
        <p style={{ color:"#64748b", fontSize:"0.9rem", maxWidth:480, lineHeight:1.6 }}>
          Your AI-powered MCA study companion. Master every topic with smart notes, adaptive quizzes, and real-time progress tracking.
        </p>
      </div>

      {/* Stat strip */}
      <div className="dash-stats fade-up">
        {[
          { label:"Quizzes Taken",   value: personal?.my_quizzes ?? "—",    icon:"🧠", color:"#818cf8" },
          { label:"Notes Generated", value: personal?.my_notes ?? "—",      icon:"📝", color:"#22d3ee" },
          { label:"Overall Avg",     value: personal?.avg_score != null ? `${personal.avg_score}%` : "—", icon:"📊", color:"#a78bfa" },
          { label:"Active Subjects", value: personal?.active_subjects ?? "—", icon:"📘", color:"#34d399" },
        ].map((s,i) => (
          <div key={i} className="glass pulse-glow" style={{ padding:"14px 10px", textAlign:"center" }}>
            <div style={{ fontSize:"1.3rem", marginBottom:4 }}>{s.icon}</div>
            <div className="title-font" style={{ fontSize:"1.4rem", color:s.color, lineHeight:1 }}>
              {loading ? "—" : s.value}
            </div>
            <div style={{ color:"#475569", fontSize:"0.62rem", marginTop:4, textTransform:"uppercase", letterSpacing:"0.05em" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="dash-main">
        <div>
          <h2 style={{ color:"#64748b", fontSize:"0.73rem", fontWeight:700, textTransform:"uppercase",
            letterSpacing:"0.08em", marginBottom:12 }}>Quick Access</h2>
          <div className="dash-cards">
            {NAV_CARDS.map((card,i) => (
              <div key={card.path} className="fade-up" onClick={() => navigate(card.path)}
                style={{ background:`linear-gradient(135deg,${card.accent}18,${card.accent}06)`,
                  border:`1px solid ${card.accent}25`, borderRadius:14, padding:"14px 12px",
                  cursor:"pointer", transition:"all 0.3s ease", animationDelay:`${0.05+i*0.06}s` }}
                onMouseEnter={e => { e.currentTarget.style.transform="translateY(-4px)";
                  e.currentTarget.style.boxShadow=`0 12px 32px ${card.glow}`; }}
                onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)";
                  e.currentTarget.style.boxShadow="none"; }}>
                <div style={{ fontSize:"1.3rem", marginBottom:7 }}>{card.icon}</div>
                <div style={{ fontWeight:700, fontSize:"0.8rem", color:"#f1f5f9", marginBottom:3 }}>{card.label}</div>
                <div style={{ color:"#475569", fontSize:"0.68rem", lineHeight:1.4 }}>{card.desc}</div>
                <div style={{ marginTop:9, color:card.accent, fontSize:"0.7rem", fontWeight:700 }}>Open →</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="glass" style={{ padding:18 }}>
          <h2 style={{ color:"#64748b", fontSize:"0.73rem", fontWeight:700, textTransform:"uppercase",
            letterSpacing:"0.08em", marginBottom:14 }}>Recent Activity</h2>
          {loading && <div style={{ textAlign:"center", padding:"24px 0" }}><div className="loader"/></div>}
          {!loading && (!personal?.recent_activity?.length) && (
            <div style={{ textAlign:"center", padding:"24px 0", color:"#334155" }}>
              <div style={{ fontSize:"2rem", marginBottom:8 }}>🎯</div>
              <p style={{ fontSize:"0.82rem" }}>No quiz attempts yet.</p>
              <button onClick={() => navigate("/generate-quiz")}
                className="btn-glow" style={{ marginTop:12, padding:"8px 18px", fontSize:"0.78rem" }}>
                Take First Quiz
              </button>
            </div>
          )}
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {personal?.recent_activity?.map((a,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10,
                padding:"10px 12px", borderRadius:10,
                background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:"0.8rem", fontWeight:600, color:"#e2e8f0",
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.subject}</div>
                  <div style={{ fontSize:"0.7rem", color:"#475569", marginTop:2 }}>{a.date}</div>
                </div>
                <ScoreBadge pct={a.pct} />
              </div>
            ))}
          </div>
          {personal?.recent_activity?.length > 0 && (
            <button onClick={() => navigate("/analytics")}
              style={{ marginTop:14, width:"100%", padding:"8px", borderRadius:9, cursor:"pointer",
                border:"1px solid rgba(99,102,241,0.25)", background:"rgba(99,102,241,0.08)",
                color:"#818cf8", fontFamily:"'Space Grotesk',sans-serif", fontSize:"0.78rem", fontWeight:600 }}>
              View Full Analytics →
            </button>
          )}
        </div>
      </div>

      {/* Platform stats */}
      <div className="glass fade-up" style={{ padding:"14px 18px" }}>
        <div className="dash-platform">
          <span style={{ color:"#334155", fontSize:"0.73rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em" }}>
            Platform
          </span>
          {[
            { label:"Subjects", value: global?.total_subjects ?? "—" },
            { label:"Notes",    value: global?.total_notes    ?? "—" },
            { label:"Quizzes",  value: global?.total_quizzes  ?? "—" },
            { label:"Learners", value: global?.total_users    ?? "—" },
          ].map(s => (
            <div key={s.label} style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span className="title-font" style={{ fontSize:"1.2rem", color:"#6366f1" }}>{loading ? "—" : s.value}</span>
              <span style={{ color:"#475569", fontSize:"0.78rem" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
