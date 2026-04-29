import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16, padding:24, textAlign:"center" }}>
      <div style={{ fontFamily:"var(--font-display)", fontStyle:"italic", fontSize:"clamp(5rem,15vw,10rem)", color:"var(--bg-4)", lineHeight:1, userSelect:"none" }}>404</div>
      <h1 style={{ fontFamily:"var(--font-display)", fontStyle:"italic", fontSize:"1.8rem", color:"var(--ink)", fontWeight:400 }}>Page not found.</h1>
      <p style={{ color:"var(--ink-3)", fontSize:".9rem", maxWidth:320, lineHeight:1.7 }}>The page you're looking for doesn't exist or has moved.</p>
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", justifyContent:"center" }}>
        <button className="btn-glow" onClick={() => navigate("/dashboard")}>Go to Dashboard</button>
        <button onClick={() => navigate(-1)} style={{ padding:"10px 22px", borderRadius:9, border:"1px solid var(--border-med)", background:"transparent", color:"var(--ink-2)", fontFamily:"var(--font-body)", fontSize:".875rem", cursor:"pointer" }}>Go Back</button>
      </div>
    </div>
  );
}