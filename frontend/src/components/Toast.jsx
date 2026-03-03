import { useState, useEffect, useCallback } from "react";

let toastFn = null;
export const toast = {
  success: (msg) => toastFn?.("success", msg),
  error:   (msg) => toastFn?.("error",   msg),
  info:    (msg) => toastFn?.("info",    msg),
};

const COLORS = {
  success: { bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.4)",  icon: "✦", color: "#34d399" },
  error:   { bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.4)", icon: "✗", color: "#f87171" },
  info:    { bg: "rgba(99,102,241,0.12)",  border: "rgba(99,102,241,0.4)",  icon: "◎", color: "#818cf8" },
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
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:9999, display:"flex", flexDirection:"column", gap:10 }}>
      {toasts.map(t => {
        const c = COLORS[t.type];
        return (
          <div key={t.id} style={{
            background: c.bg, border: `1px solid ${c.border}`,
            borderRadius: 12, padding: "12px 18px",
            display: "flex", alignItems: "center", gap: 10,
            backdropFilter: "blur(20px)",
            boxShadow: `0 8px 32px rgba(0,0,0,0.4)`,
            animation: "fadeUp 0.3s ease forwards",
            fontFamily: "'Space Grotesk', sans-serif",
            maxWidth: 340, minWidth: 240,
          }}>
            <span style={{ color: c.color, fontSize: "1rem", fontWeight: 700 }}>{c.icon}</span>
            <span style={{ color: "#e2e8f0", fontSize: "0.88rem", lineHeight: 1.4 }}>{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}
