import { useState, useEffect, useCallback } from "react";
let fn = null;
export const toast = { success:m=>fn?.("success",m), error:m=>fn?.("error",m), info:m=>fn?.("info",m) };
const ICONS = {
  success:<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  error:  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  info:   <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.2"/><path d="M5 4.5V7M5 3.2h.01" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
};
const CFG = { success:{c:"var(--teal)",b:"var(--teal-border)"}, error:{c:"var(--coral)",b:"var(--coral-border)"}, info:{c:"var(--amber)",b:"var(--amber-border)"} };
export function ToastContainer() {
  const [toasts,setToasts]=useState([]);
  const add=useCallback((type,message)=>{ const id=Date.now(); setToasts(p=>[...p,{id,type,message}]); setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),3600); },[]);
  useEffect(()=>{ fn=add; return()=>{fn=null;}; },[add]);
  if(!toasts.length) return null;
  return (
    <div style={{ position:"fixed",bottom:68,right:14,zIndex:9999,display:"flex",flexDirection:"column",gap:7,maxWidth:"calc(100vw - 28px)" }}>
      {toasts.map(t=>{ const c=CFG[t.type]; return (
        <div key={t.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:10,background:"var(--bg-3)",border:`0.5px solid ${c.b}`,boxShadow:"0 8px 32px rgba(0,0,0,.55)",fontFamily:"var(--font-body)",maxWidth:340 }} className="toast-enter" role="alert" aria-live="polite">
          <div style={{ width:20,height:20,borderRadius:"50%",flexShrink:0,background:`color-mix(in srgb,${c.c} 12%,transparent)`,color:c.c,display:"flex",alignItems:"center",justifyContent:"center" }}>{ICONS[t.type]}</div>
          <span style={{ color:"var(--ink-2)",fontSize:13,lineHeight:1.4 }}>{t.message}</span>
        </div>
      );})}
    </div>
  );
}