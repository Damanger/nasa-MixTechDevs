import { useEffect, useRef, useState } from 'react';

let idSeq = 1;

export default function GlobalToaster() {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  useEffect(() => {
    const handler = (e) => {
      const detail = e?.detail || {};
      const id = idSeq++;
      const toast = {
        id,
        message: String(detail.message ?? ''),
        type: detail.type ?? 'info',
        ttl: Math.max(1200, Math.min(6000, detail.ttl ?? 2400)),
      };
      setToasts((prev) => prev.concat(toast));
      const t = setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== id));
        timers.current.delete(id);
      }, toast.ttl);
      timers.current.set(id, t);
    };
    window.addEventListener('app:toast', handler);
    return () => {
      window.removeEventListener('app:toast', handler);
      timers.current.forEach((t) => clearTimeout(t));
      timers.current.clear();
    };
  }, []);

  return (
    <div className="toaster" aria-live="polite" aria-atomic="true">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span>{t.message}</span>
        </div>
      ))}
      <style>{`
        .toaster{ position: fixed; right: 16px; bottom: 16px; display: flex; flex-direction: column; gap: 8px; z-index: 9999; pointer-events: none; }
        .toast{ pointer-events: auto; border:1px solid rgba(255,255,255,0.2); background: rgba(12,16,34,0.75); color: #e6eaff; backdrop-filter: blur(12px) saturate(120%); -webkit-backdrop-filter: blur(12px) saturate(120%); border-radius: 12px; padding: 10px 12px; box-shadow: 0 8px 22px rgba(0,0,0,0.35); font-size: 0.95rem; animation: toast-in .18s ease-out; }
        .toast.success{ border-color: rgba(137,180,255,0.55); }
        .toast.error{ border-color: rgba(255,120,120,0.6); }
        @keyframes toast-in{ from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 640px){ .toaster{ left: 12px; right: 12px; bottom: 12px; } .toast{ width: 100%; } }
      `}</style>
    </div>
  );
}

