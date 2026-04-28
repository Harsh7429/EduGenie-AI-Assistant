export function SkeletonCard({ rows = 2, height = 80 }) {
  return (
    <div className="glass" style={{ padding:"18px 20px", height }}>
      <div className="skeleton sk-title" style={{ width:"55%", marginBottom:12 }}/>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton sk-text" style={{ width: i === rows - 1 ? "38%" : "88%", marginBottom:8 }}/>
      ))}
    </div>
  );
}
export function SkeletonList({ count = 3 }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} rows={2} height={72}/>)}
    </div>
  );
}
export function SkeletonStats({ count = 4 }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:`repeat(${count},1fr)`, gap:12 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass" style={{ padding:"20px 18px" }}>
          <div className="skeleton sk-text" style={{ width:"60%", marginBottom:14 }}/>
          <div className="skeleton sk-title" style={{ width:"42%" }}/>
        </div>
      ))}
    </div>
  );
}