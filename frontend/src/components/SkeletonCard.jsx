/* SkeletonCard.jsx — enriched shimmer placeholders */

function SkeletonBase({ style = {} }) {
  return <div className="skeleton" style={{ borderRadius:5, ...style }} />;
}

export function SkeletonCard({ rows = 2, height = 76 }) {
  return (
    <div
      className="glass"
      style={{ padding:"16px 18px", height, overflow:"hidden" }}
      aria-hidden="true"
      role="presentation"
    >
      <SkeletonBase style={{ width:"52%", height:14, marginBottom:11 }}/>
      {Array.from({ length:rows }).map((_, i) => (
        <SkeletonBase
          key={i}
          style={{ width: i === rows - 1 ? "35%" : "85%", height:10, marginBottom:7 }}
        />
      ))}
    </div>
  );
}

export function SkeletonList({ count = 3 }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:9 }} aria-hidden="true">
      {Array.from({ length:count }).map((_, i) => (
        <SkeletonCard key={i} rows={2} height={70}/>
      ))}
    </div>
  );
}

export function SkeletonStats({ count = 4 }) {
  return (
    <div
      style={{ display:"grid", gridTemplateColumns:`repeat(${count},1fr)`, gap:9 }}
      aria-hidden="true"
    >
      {Array.from({ length:count }).map((_, i) => (
        <div key={i} className="glass" style={{ padding:"18px 16px", overflow:"hidden" }}>
          <SkeletonBase style={{ width:"55%", height:10, marginBottom:13 }}/>
          <SkeletonBase style={{ width:"40%", height:26, marginBottom:8 }}/>
          <SkeletonBase style={{ width:"70%", height:6 }}/>
        </div>
      ))}
    </div>
  );
}

/* Full bento grid skeleton — matches the Dashboard layout */
export function SkeletonDashboard() {
  return (
    <div aria-hidden="true">
      {/* Header skeleton */}
      <div style={{ marginBottom:20 }}>
        <SkeletonBase style={{ width:80, height:9, marginBottom:8 }}/>
        <SkeletonBase style={{ width:220, height:32, marginBottom:6 }}/>
        <SkeletonBase style={{ width:160, height:11 }}/>
      </div>
      {/* Bento grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:9, marginBottom:9 }}>
        <div className="glass" style={{ gridColumn:"span 2", gridRow:"span 2", padding:"18px 20px", height:220 }}>
          <SkeletonBase style={{ width:"40%", height:9, marginBottom:16 }}/>
          <div style={{ display:"flex", alignItems:"center", gap:18 }}>
            <SkeletonBase className="sk-circle" style={{ width:84, height:84, borderRadius:"50%", flexShrink:0 }}/>
            <div style={{ flex:1 }}>
              <SkeletonBase style={{ width:"60%", height:28, marginBottom:9 }}/>
              <SkeletonBase style={{ width:"80%", height:10, marginBottom:6 }}/>
              <SkeletonBase style={{ width:"50%", height:10 }}/>
            </div>
          </div>
        </div>
        {[84, 84, 60, 60, 60, 60].map((h, i) => (
          <div key={i} className="glass" style={{ padding:"16px", height:h, overflow:"hidden" }}>
            <SkeletonBase style={{ width:"55%", height:9, marginBottom:10 }}/>
            <SkeletonBase style={{ width:"35%", height:20 }}/>
          </div>
        ))}
      </div>
      {/* Insights skeleton */}
      <div className="glass" style={{ padding:"18px 20px", marginBottom:9 }}>
        <SkeletonBase style={{ width:120, height:9, marginBottom:14 }}/>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {[85, 70, 90, 65].map((w, i) => (
            <div key={i} style={{ padding:"10px 12px", borderRadius:8, background:"var(--bg-3)" }}>
              <SkeletonBase style={{ width:`${w}%`, height:10, marginBottom:5 }}/>
              <SkeletonBase style={{ width:`${w - 20}%`, height:10 }}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Analytics-specific skeleton */
export function SkeletonAnalytics() {
  return (
    <div aria-hidden="true">
      <SkeletonStats count={4}/>
      <div style={{ marginTop:12, display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        {[160, 140].map((h, i) => (
          <div key={i} className="glass" style={{ padding:"18px", height:h }}>
            <SkeletonBase style={{ width:"45%", height:13, marginBottom:10 }}/>
            <SkeletonBase style={{ width:"75%", height:9, marginBottom:18 }}/>
            <SkeletonBase style={{ width:"100%", height:h - 80 }}/>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Inline loading state — replaces blank spots during data fetch */
export function LoadingDots({ color = "var(--amber)" }) {
  return (
    <span className="loading-dots" style={{ color }} aria-label="Loading…" role="status">
      <span/><span/><span/>
    </span>
  );
}

/* Full-page centered loader */
export function PageLoader({ message = "Loading…" }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"40vh", gap:14 }}>
      <div className="loader"/>
      <p style={{ fontSize:13, color:"var(--ink-4)" }}>{message}</p>
    </div>
  );
}
