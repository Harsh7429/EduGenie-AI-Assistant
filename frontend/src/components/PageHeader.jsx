export default function PageHeader({ title, accent, accentColor, sub, actions, tag }) {
  return (
    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22,flexWrap:"wrap",gap:10 }}>
      <div>
        {tag && <p style={{ fontSize:10,color:"var(--ink-4)",textTransform:"uppercase",letterSpacing:".1em",fontWeight:500,marginBottom:4 }}>{tag}</p>}
        <h1 style={{ fontSize:"clamp(1.5rem,3.5vw,2.1rem)",color:"var(--ink)",marginBottom:sub?4:0,fontWeight:500,lineHeight:1.1,letterSpacing:"-.025em" }}>
          {title}{accent&&<> <span style={{ color:accentColor||"var(--amber)" }}>{accent}</span></>}
        </h1>
        {sub&&<p style={{ color:"var(--ink-3)",fontSize:13,lineHeight:1.55 }}>{sub}</p>}
      </div>
      {actions&&<div style={{ display:"flex",gap:7,alignItems:"center",flexShrink:0 }}>{actions}</div>}
    </div>
  );
}