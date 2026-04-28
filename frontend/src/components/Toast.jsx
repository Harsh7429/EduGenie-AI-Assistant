import { useState, useEffect, useCallback } from "react";

let toastFn = null;
export const toast = {
  success: msg => toastFn?.("success", msg),
  error:   msg => toastFn?.("error",   msg),
  info:    msg => toastFn?.("info",    msg),
};

const ICONS = {
  success: <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1.5 5.5l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  error:   <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 2l7 7M9 2l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  info:    <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.2"/><path d="M5.5 5v3M5.5 3.5h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
};
const CFG = {
  success: { color:"var(--jade)", border:"var(--jade-border)" },
  error:   { color:"var(--ruby)", border:"var(--ruby-border)" },
  info:    { color:"var(--gold)", border:"var(--gold-border)" },
};

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((type, message) => {
    const id = Date.now();
    setToasts(p => [...p, { id, type, message }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3800);
  }, []);
  useEffect(() => { toastFn = add; return () => { toastFn = null; }; }, [add]);
  if (!toasts.length) return null;
  return (
    <div style={{ position:"fixed", bottom:72, right:16, zIndex:9999, display:"flex", flexDirection:"column", gap:8, maxWidth:"calc(100vw - 32px)" }}>
      {toasts.map(t => {
        const c = CFG[t.type];
        return (
          <div key={t.id} style={{
            display:"flex", alignItems:"center", gap:11, padding:"11px 16px",
            borderRadius:10, background:"var(--bg-3)", border:`1px solid ${c.border}`,
            boxShadow:"0 8px 32px rgba(0,0,0,.55)",
            animation:"fadeUp .3s var(--ease-out) both",
            fontFamily:"var(--font-body)", maxWidth:340,
          }}>
            <div style={{ width:22, height:22, borderRadius:"50%", flexShrink:0, background:`color-mix(in srgb, ${c.color} 12%, transparent)`, color:c.color, display:"flex", alignItems:"center", justifyContent:"center" }}>
              {ICONS[t.type]}
            </div>
            <span style={{ color:"var(--ink-2)", fontSize:".85rem", lineHeight:1.45 }}>{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}