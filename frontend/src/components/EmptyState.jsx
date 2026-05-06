/**
 * EmptyState.jsx — Friendly zero-data placeholders
 *
 * Usage:
 *   <EmptyState icon="📊" title="No analytics yet"
 *     sub="Take your first quiz to start tracking progress."
 *     action={{ label:"Generate Quiz", onClick:() => navigate("/generate-quiz") }}/>
 *
 *   <ErrorState message="Failed to load data." onRetry={fetchData}/>
 */

export function EmptyState({ icon = "✦", title, sub, action, compact = false }) {
  return (
    <div
      className="empty-state scale-pop"
      style={{ padding: compact ? "28px 20px" : "48px 24px" }}
      role="status"
    >
      <div className="empty-state-icon" style={{ fontSize: compact ? 18 : 22 }}>
        {icon}
      </div>
      {title && (
        <p className="empty-state-title" style={{ fontSize: compact ? 13 : 15 }}>
          {title}
        </p>
      )}
      {sub && (
        <p className="empty-state-sub" style={{ fontSize: compact ? 12 : 13 }}>
          {sub}
        </p>
      )}
      {action && (
        <button
          className="btn-glow"
          onClick={action.onClick}
          style={{ marginTop:4, padding:"8px 18px", fontSize:13 }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export function ErrorState({ message = "Something went wrong.", onRetry, compact = false }) {
  return (
    <div
      className="error-state scale-pop"
      style={{ padding: compact ? "20px 16px" : "40px 24px" }}
      role="alert"
    >
      <div className="error-state-icon">⚠</div>
      <p className="error-state-title">Error</p>
      <p className="error-state-sub">{message}</p>
      {onRetry && (
        <button
          className="btn-ghost"
          onClick={onRetry}
          style={{ marginTop:8, borderColor:"var(--coral-border)", color:"var(--coral)" }}
        >
          ↺ Try again
        </button>
      )}
    </div>
  );
}

export default EmptyState;
