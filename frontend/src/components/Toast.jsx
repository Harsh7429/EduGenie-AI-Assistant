import { useState, useEffect, useCallback } from "react";

let toastFn = null;
export const toast = {
  success: (msg) => toastFn?.("success", msg),
  error:   (msg) => toastFn?.("error",   msg),
  info:    (msg) => toastFn?.("info",    msg),
};

const CONFIG = {
  success: { icon: "✓", color: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.2)" },
  error:   { icon: "✕", color: "#fb7185", bg: "rgba(251,113,133,0.08)", border: "rgba(251,113,133,0.2)" },
  info:    { icon: "◎", color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)" },
};

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  useEffect(() => { toastFn = addToast; return () => { toastFn = null; }; }, [addToast]);

  if (!toasts.length) return null;

  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      display: "flex", flexDirection: "column", gap: 8,
    }}>
      {toasts.map(t => {
        const c = CONFIG[t.type];
        return (
          <div key={t.id} style={{
            background: c.bg,
            border: `1px solid ${c.border}`,
            borderRadius: 10, padding: "11px 16px",
            display: "flex", alignItems: "center", gap: 10,
            backdropFilter: "blur(20px)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
            animation: "fadeUp 0.3s cubic-bezier(0.16,1,0.3,1) both",
            fontFamily: "var(--font-body)",
            maxWidth: 340, minWidth: 220,
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
              background: `${c.color}18`, border: `1px solid ${c.color}33`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.78rem", color: c.color, fontWeight: 700,
            }}>{c.icon}</div>
            <span style={{ color: "var(--ink-2)", fontSize: "0.86rem", lineHeight: 1.4 }}>{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}
