export function SkeletonCard({ rows=2,height=76 }) {
  return (
    <div className="glass" style={{ padding:"16px 18px",height }}>
      <div className="skeleton sk-title" style={{ width:"52%",marginBottom:10 }}/>
      {Array.from({length:rows}).map((_,i)=><div key={i} className="skeleton sk-text" style={{ width:i===rows-1?"35%":"85%",marginBottom:7 }}/>)}
    </div>
  );
}
export function SkeletonList({ count=3 }) {
  return <div style={{ display:"flex",flexDirection:"column",gap:9 }}>{Array.from({length:count}).map((_,i)=><SkeletonCard key={i} rows={2} height={70}/>)}</div>;
}
export function SkeletonStats({ count=4 }) {
  return (
    <div style={{ display:"grid",gridTemplateColumns:`repeat(${count},1fr)`,gap:9 }}>
      {Array.from({length:count}).map((_,i)=>(
        <div key={i} className="glass" style={{ padding:"18px 16px" }}>
          <div className="skeleton sk-text" style={{ width:"55%",marginBottom:12 }}/>
          <div className="skeleton sk-title" style={{ width:"40%" }}/>
        </div>
      ))}
    </div>
  );
}