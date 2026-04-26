/**
 * PageHeader — consistent premium page headers across all inner pages.
 *
 * Usage:
 *   <PageHeader
 *     title="Generate"
 *     accent="Quiz"
 *     accentColor="var(--lavender)"  // optional, defaults to var(--gold)
 *     sub="AI-generated MCQs with difficulty levels, timer & progress tracking"
 *     actions={<button ...>...</button>}  // optional right-side slot
 *   />
 */
export default function PageHeader({ title, accent, accentColor, sub, actions, tag }) {
  const color = accentColor || "var(--gold)";
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "flex-start",
      marginBottom: 28, flexWrap: "wrap", gap: 12,
    }}>
      <div>
        {tag && (
          <p style={{
            fontSize: "0.67rem", color: "var(--ink-4)", textTransform: "uppercase",
            letterSpacing: "0.1em", fontWeight: 600, marginBottom: 6,
          }}>{tag}</p>
        )}
        <h1 style={{
          fontFamily: "var(--font-display)", fontStyle: "italic",
          fontSize: "clamp(1.8rem, 4vw, 2.6rem)", color: "var(--ink)",
          marginBottom: sub ? 6 : 0, fontWeight: 400, lineHeight: 1.1,
        }}>
          {title}{accent && <> <span style={{ color }}>{accent}</span></>}
        </h1>
        {sub && (
          <p style={{ color: "var(--ink-3)", fontSize: "0.875rem", lineHeight: 1.6 }}>{sub}</p>
        )}
      </div>
      {actions && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          {actions}
        </div>
      )}
    </div>
  );
}
