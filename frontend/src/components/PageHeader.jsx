export default function PageHeader({ title, accent, accentColor, sub, actions, tag }) {
  const color = accentColor || "var(--gold)";
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:26, flexWrap:"wrap", gap:12 }}>
      <div>
        {tag && <p style={{ fontSize:".65rem", color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:".12em", fontWeight:700, marginBottom:5 }}>{tag}</p>}
        <h1 style={{ fontFamily:"var(--font-display)", fontStyle:"italic", fontSize:"clamp(1.7rem,4vw,2.4rem)", color:"var(--ink)", marginBottom:sub?5:0, fontWeight:400, lineHeight:1.1 }}>
          {title}{accent && <> <span style={{ color }}>{accent}</span></>}
        </h1>
        {sub && <p style={{ color:"var(--ink-3)", fontSize:".875rem", lineHeight:1.6 }}>{sub}</p>}
      </div>
      {actions && <div style={{ display:"flex", gap:8, alignItems:"center", flexShrink:0 }}>{actions}</div>}
    </div>
  );
}