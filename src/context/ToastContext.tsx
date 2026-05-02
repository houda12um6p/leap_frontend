import React, { createContext, useCallback, useContext, useRef, useState, ReactNode } from 'react';
import { TOKENS, FONT, FONT_MONO } from '../styles/tokens';

type ToastKind = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  message?: string;
}

interface ToastContextValue {
  show: (kind: ToastKind, title: string, message?: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const KIND_STYLES: Record<ToastKind, { color: string; bg: string; label: string }> = {
  success: { color: TOKENS.accent, bg: TOKENS.accentSoft, label: 'OK' },
  error:   { color: TOKENS.danger, bg: TOKENS.dangerSoft, label: '!' },
  info:    { color: '#7CB7FF',     bg: 'rgba(124,183,255,0.14)', label: 'i' },
};

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const s = KIND_STYLES[toast.kind];
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        minWidth: 280, maxWidth: 380,
        background: TOKENS.bgElev,
        border: `1px solid ${s.color}55`,
        borderLeft: `4px solid ${s.color}`,
        borderRadius: 10,
        padding: '12px 14px',
        display: 'flex', alignItems: 'flex-start', gap: 10,
        fontFamily: FONT,
        boxShadow: '0 12px 28px rgba(0,0,0,0.35)',
        animation: 'leap-toast-in 0.18s ease-out',
      }}
    >
      <span style={{
        width: 20, height: 20, borderRadius: 5,
        background: s.bg, color: s.color,
        display: 'grid', placeItems: 'center',
        fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700,
        flexShrink: 0,
      }}>{s.label}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: TOKENS.text, fontWeight: 600, letterSpacing: -0.1 }}>
          {toast.title}
        </div>
        {toast.message && (
          <div style={{ fontSize: 12, color: TOKENS.textDim, marginTop: 3, lineHeight: 1.4 }}>
            {toast.message}
          </div>
        )}
      </div>
      <button
        onClick={onClose}
        aria-label="Dismiss notification"
        style={{
          background: 'transparent', border: 'none',
          color: TOKENS.textFaint, cursor: 'pointer',
          fontSize: 16, lineHeight: 1, padding: 2,
        }}
      >×</button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const remove = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const show = useCallback((kind: ToastKind, title: string, message?: string) => {
    const id = ++idRef.current;
    setToasts(prev => [...prev, { id, kind, title, message }]);
    setTimeout(() => remove(id), 5000);
  }, [remove]);

  const value: ToastContextValue = {
    show,
    success: (t, m) => show('success', t, m),
    error:   (t, m) => show('error',   t, m),
    info:    (t, m) => show('info',    t, m),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        style={{
          position: 'fixed', top: 16, right: 16, zIndex: 1000,
          display: 'flex', flexDirection: 'column', gap: 10,
          pointerEvents: 'none',
        }}
      >
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: 'auto' }}>
            <ToastItem toast={t} onClose={() => remove(t.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
