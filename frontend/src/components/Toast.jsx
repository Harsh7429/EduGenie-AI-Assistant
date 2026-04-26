import { useState, useEffect, useCallback } from "react";

let toastFn = null;
export const toast = {
  success: (msg) => toastFn?.("success", msg),
  error:   (msg) => toastFn?.("error",   msg),
  info:    (msg) => toastFn?.("info",    msg),
};

const ICONS = {
  success: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  error: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  info: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M6 5.5V8.5M6 4h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
};

const CONFIG = {
  success: { color: "var(--jade)",     bg: "var(--jade-dim)",  border: "var(--jade-border)"  },
  error:   { color: "var(--ruby)",     bg: "var(--ruby-dim)",  border: "var(--ruby-border)"  },
  info:    { color: "var(--gold)",     bg: "var(--gold-dim)",  border: "var(--gold-border)"  },
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
    <div style={{
      position: "fixed", bottom: 20, right: 20, zIndex: 9999,
      display: "flex", flexDirection: "column", gap: 8,
    }}>
      {toasts.map(t => {
        const c = CONFIG[t.type];
        return (
          <div key={t.id} style={{
            display: "flex", alignItems: "center", gap: 11,
            padding: "11px 16px", borderRadius: 10,
            background: "var(--bg-3)", border: `1px solid ${c.border}`,
            backdropFilter: "blur(20px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.55)",
            animation: "fadeUp 0.3s var(--ease-out) both",
            fontFamily: "var(--font-body)", maxWidth: 340, minWidth: 200,
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
              background: c.bg, color: c.color,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {ICONS[t.type]}
            </div>
            <span style={{ color: "var(--ink-2)", fontSize: "0.85rem", lineHeight: 1.45 }}>
              {t.message}
            </span>
          </div>
        );
      })}
    </div>
  );
}
