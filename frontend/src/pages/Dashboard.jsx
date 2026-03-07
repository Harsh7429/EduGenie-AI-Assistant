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

function MiniBar({ pct, color }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 99, height: 4, flex: 1 }}>
      <div style={{ height: "100%", width: `${Math.min(pct,100)}%`, borderRadius: 99,
        background: color, boxShadow: `0 0 6px ${color}88`, transition: "width 1s ease" }} />
    </div>
  );
}

function ScoreBadge({ pct }) {
  const color = pct >= 80 ? "#34d399" : pct >= 50 ? "#fbbf24" : "#f87171";
  return (
    <span style={{ padding: "2px 10px", borderRadius: 99, background: `${color}18`,
      border: `1px solid ${color}44`, color, fontWeight: 700, fontSize: "0.78rem" }}>
      {pct}%
    </span>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [global, setGlobal]     = useState(null);
  const [personal, setPersonal] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      {/* Hero */}
      <div className="fade-up" style={{ marginBottom: 32 }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"5px 14px",
          borderRadius:99, background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.25)",
          marginBottom:16, fontSize:"0.78rem", color:"#818cf8", fontWeight:600, letterSpacing:"0.06em" }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:"#22d3ee", display:"inline-block" }}/>
          AI-POWERED LEARNING PLATFORM
        </div>
        <h1 className="title-font" style={{ fontSize:"clamp(1.6rem,5vw,3rem)", lineHeight:1.1,
          letterSpacing:"-0.03em", marginBottom:12 }}>
          {greeting()},{" "}
          <span style={{ background:"linear-gradient(135deg,#6366f1,#06b6d4)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            {personal?.name?.split(" ")[0] || "Scholar"}
          </span> ✦
        </h1>
        <p style={{ color:"#64748b", fontSize:"0.95rem", maxWidth:480, lineHeight:1.6 }}>
          Your AI-powered MCA study companion. Master every topic with smart notes, adaptive quizzes, and real-time progress tracking.
        </p>
      </div>

      {/* Personal stat strip */}
      <div className="fade-up" style={{ display:"grid",
        gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)",
        gap:12, marginBottom:32 }}>
        {[
          { label:"Quizzes Taken",   value: personal?.my_quizzes    ?? "—", icon:"🧠", color:"#818cf8" },
          { label:"Notes Generated", value: personal?.my_notes      ?? "—", icon:"📝", color:"#22d3ee" },
          { label:"Overall Avg",     value: personal?.avg_score != null ? `${personal.avg_score}%` : "—", icon:"📊", color:"#a78bfa" },
          { label:"Active Subjects", value: personal?.active_subjects ?? "—", icon:"📘", color:"#34d399" },
        ].map((s,i) => (
          <div key={i} className="glass pulse-glow" style={{ padding:"16px", textAlign:"center" }}>
            <div style={{ fontSize:"1.4rem", marginBottom:4 }}>{s.icon}</div>
            <div className="title-font" style={{ fontSize:"1.6rem", color:s.color, lineHeight:1 }}>
              {loading ? "—" : s.value}
            </div>
            <div style={{ color:"#475569", fontSize:"0.68rem", marginTop:4, textTransform:"uppercase", letterSpacing:"0.06em" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Main grid — stacks on mobile */}
      <div style={{ display:"grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 300px",
        gap:24, marginBottom:32 }}>

        {/* Feature nav grid */}
        <div>
          <h2 style={{ color:"#64748b", fontSize:"0.78rem", fontWeight:700, textTransform:"uppercase",
            letterSpacing:"0.08em", marginBottom:14 }}>Quick Access</h2>
          <div style={{ display:"grid",
            gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)",
            gap:12 }}>
            {NAV_CARDS.map((card,i) => (
              <div key={card.path} className="fade-up" onClick={() => navigate(card.path)}
                style={{ background:`linear-gradient(135deg,${card.accent}18,${card.accent}06)`,
                  border:`1px solid ${card.accent}25`, borderRadius:14,
                  padding: isMobile ? "16px 14px" : "22px 18px",
                  cursor:"pointer", transition:"all 0.3s ease", animationDelay:`${0.05+i*0.06}s` }}
                onMouseEnter={e => { e.currentTarget.style.transform="translateY(-5px)";
                  e.currentTarget.style.boxShadow=`0 14px 36px ${card.glow}`;
                  e.currentTarget.style.borderColor=`${card.accent}55`; }}
                onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)";
                  e.currentTarget.style.boxShadow="none";
                  e.currentTarget.style.borderColor=`${card.accent}25`; }}>
                <div style={{ fontSize: isMobile ? "1.4rem" : "1.8rem", marginBottom:8 }}>{card.icon}</div>
                <div style={{ fontWeight:700, fontSize:"0.85rem", color:"#f1f5f9", marginBottom:4 }}>{card.label}</div>
                <div style={{ color:"#475569", fontSize:"0.72rem", lineHeight:1.5 }}>{card.desc}</div>
                <div style={{ marginTop:10, color:card.accent, fontSize:"0.75rem", fontWeight:700 }}>Open →</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="glass" style={{ padding:20 }}>
          <h2 style={{ color:"#64748b", fontSize:"0.78rem", fontWeight:700, textTransform:"uppercase",
            letterSpacing:"0.08em", marginBottom:16 }}>Recent Activity</h2>

          {loading && <div style={{ textAlign:"center", padding:"24px 0" }}><div className="loader"/></div>}

          {!loading && (!personal?.recent_activity?.length) && (
            <div style={{ textAlign:"center", padding:"32px 0", color:"#334155" }}>
              <div style={{ fontSize:"2rem", marginBottom:8 }}>🎯</div>
              <p style={{ fontSize:"0.85rem" }}>No quiz attempts yet.</p>
              <button onClick={() => navigate("/generate-quiz")}
                className="btn-glow" style={{ marginTop:12, padding:"8px 18px", fontSize:"0.8rem" }}>
                Take First Quiz
              </button>
            </div>
          )}

          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {personal?.recent_activity?.map((a,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:12,
                padding:"10px 12px", borderRadius:10,
                background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:"0.82rem", fontWeight:600, color:"#e2e8f0",
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {a.subject}
                  </div>
                  <div style={{ fontSize:"0.72rem", color:"#475569", marginTop:2 }}>{a.date}</div>
                </div>
                <ScoreBadge pct={a.pct} />
              </div>
            ))}
          </div>

          {personal?.recent_activity?.length > 0 && (
            <button onClick={() => navigate("/analytics")}
              style={{ marginTop:16, width:"100%", padding:"8px", borderRadius:9, cursor:"pointer",
                border:"1px solid rgba(99,102,241,0.25)", background:"rgba(99,102,241,0.08)",
                color:"#818cf8", fontFamily:"'Space Grotesk',sans-serif", fontSize:"0.8rem", fontWeight:600 }}>
              View Full Analytics →
            </button>
          )}
        </div>
      </div>

      {/* Global platform stats */}
      <div className="glass fade-up" style={{ padding:"16px 20px",
        display:"flex", gap: isMobile ? 16 : 32,
        alignItems:"center", flexWrap:"wrap" }}>
        <span style={{ color:"#334155", fontSize:"0.78rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em" }}>
          Platform
        </span>
        {[
          { label:"Subjects", value: global?.total_subjects ?? "—" },
          { label:"Notes",    value: global?.total_notes    ?? "—" },
          { label:"Quizzes",  value: global?.total_quizzes  ?? "—" },
          { label:"Learners", value: global?.total_users    ?? "—" },
        ].map(s => (
          <div key={s.label} style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span className="title-font" style={{ fontSize:"1.3rem", color:"#6366f1" }}>{loading ? "—" : s.value}</span>
            <span style={{ color:"#475569", fontSize:"0.8rem" }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
