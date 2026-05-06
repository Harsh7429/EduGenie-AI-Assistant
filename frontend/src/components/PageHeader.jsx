/**
 * PageHeader.jsx — Premium section header
 *
 * Props (all optional except title):
 *   title        — first word(s) of the heading (plain colour)
 *   accent       — highlighted word(s) after title
 *   accentColor  — CSS colour for accent (default var(--amber))
 *   sub          — subtitle / description line
 *   tag          — small uppercase label above the heading
 *   actions      — ReactNode: right-side CTA buttons
 *   badge        — { text, color, bg } — pill shown next to the title
 *   back         — string: if given, shows a ← Back link with this label
 *   onBack       — function: callback for ← Back
 */
export default function PageHeader({
  title,
  accent,
  accentColor,
  sub,
  tag,
  actions,
  badge,
  back,
  onBack,
}) {
  const ac = accentColor || "var(--amber)";

  return (
    <div
      style={{
        display:"flex", justifyContent:"space-between", alignItems:"flex-start",
        marginBottom:22, flexWrap:"wrap", gap:10,
      }}
      className="fade-up"
    >
      <div>
        {/* Optional back link */}
        {back && (
          <button
            onClick={onBack}
            aria-label={`Back to ${back}`}
            style={{
              display:"inline-flex", alignItems:"center", gap:5,
              fontSize:12, color:"var(--ink-4)", background:"transparent",
              border:"none", cursor:"pointer", padding:"0 0 10px 0",
              fontFamily:"var(--font-body)", transition:"color .13s",
            }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--ink-2)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--ink-4)"}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M7.5 2L3.5 6l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {back}
          </button>
        )}

        {/* Tag line */}
        {tag && (
          <p style={{
            fontSize:10, color:"var(--ink-4)", textTransform:"uppercase",
            letterSpacing:".1em", fontWeight:500, marginBottom:5,
          }}>
            {tag}
          </p>
        )}

        {/* Main heading */}
        <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
          <h1 style={{
            fontSize:"clamp(1.5rem,3.5vw,2.1rem)", color:"var(--ink)",
            marginBottom:0, fontWeight:500, lineHeight:1.1, letterSpacing:"-.025em",
          }}>
            {title}
            {accent && (
              <> <span style={{ color:ac }}>{accent}</span></>
            )}
          </h1>

          {/* Optional badge next to title */}
          {badge && (
            <span style={{
              padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:500,
              background: badge.bg  || `color-mix(in srgb, ${badge.color || ac} 12%, transparent)`,
              color:      badge.color || ac,
              flexShrink:0,
            }}>
              {badge.text}
            </span>
          )}
        </div>

        {/* Subtitle */}
        {sub && (
          <p style={{ color:"var(--ink-3)", fontSize:13, lineHeight:1.55, marginTop:5 }}>
            {sub}
          </p>
        )}
      </div>

      {/* Right-side actions */}
      {actions && (
        <div style={{ display:"flex", gap:7, alignItems:"center", flexShrink:0 }}>
          {actions}
        </div>
      )}
    </div>
  );
}
