import React, { useEffect } from 'react';
import { motion, AnimatePresence as APRaw } from 'framer-motion';
import { CloseIcon } from './Icon';

const AnimatePresence = APRaw as unknown as React.FC<{
  children?: React.ReactNode;
  mode?: 'wait' | 'sync' | 'popLayout';
  initial?: boolean;
}>;

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: number;
}

export function Modal({ open, onClose, title, children, width = 520 }: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="m-backdrop"
            className="leap-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={onClose}
          />
          <div key="m-wrap" className="leap-modal-wrap">
            <motion.div
              key="m-panel"
              className="leap-modal"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0,  scale: 1    }}
              exit={{    opacity: 0, y: 24, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              style={{ width }}
              role="dialog"
              aria-modal="true"
            >
              <header
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  paddingBottom: 18, marginBottom: 18,
                  borderBottom: '1px solid var(--leap-border-soft)',
                }}
              >
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 500, letterSpacing: '-0.015em' }}>
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  style={{
                    marginLeft: 'auto',
                    width: 32, height: 32, borderRadius: 999,
                    display: 'inline-grid', placeItems: 'center',
                    color: 'var(--leap-text-dim)',
                    background: 'transparent',
                    border: '1px solid transparent',
                    transition: 'background 200ms ease, border-color 200ms ease, color 200ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--leap-surface-wash)';
                    e.currentTarget.style.borderColor = 'var(--leap-border)';
                    e.currentTarget.style.color = 'var(--leap-text)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.color = 'var(--leap-text-dim)';
                  }}
                >
                  <CloseIcon size={14} />
                </button>
              </header>
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
