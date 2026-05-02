import { useNavigate } from "react-router-dom";
export default function NotFound() {
  const navigate=useNavigate();
  return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:14,padding:24,textAlign:"center" }}>
      <div style={{ fontSize:"clamp(5rem,15vw,9rem)",fontWeight:600,color:"var(--bg-4)",lineHeight:1,letterSpacing:"-.05em",userSelect:"none" }}>404</div>
      <h1 style={{ fontSize:20,fontWeight:500,color:"var(--ink)",letterSpacing:"-.02em" }}>Page not found.</h1>
      <p style={{ color:"var(--ink-3)",fontSize:13,maxWidth:300,lineHeight:1.65 }}>The page you're looking for doesn't exist or has been moved.</p>
      <div style={{ display:"flex",gap:9,flexWrap:"wrap",justifyContent:"center" }}>
        <button className="btn-glow" onClick={()=>navigate("/dashboard")}>Go to Dashboard</button>
        <button onClick={()=>navigate(-1)} style={{ padding:"9px 20px",borderRadius:"var(--r-md)",border:"0.5px solid var(--border-med)",background:"transparent",color:"var(--ink-2)",fontFamily:"var(--font-body)",fontSize:13,cursor:"pointer" }}>Go Back</button>
      </div>
    </div>
  );
}