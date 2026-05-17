import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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

const FOCUSABLE = [
  'a[href]', 'button:not([disabled])', 'input:not([disabled])',
  'select:not([disabled])', 'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function Modal({ open, onClose, title, children, width = 520 }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;

    triggerRef.current = document.activeElement;

    const prevOverflow = document.body.style.overflow;
    const prevPadRight = document.body.style.paddingRight;
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarW > 0) {
      document.body.style.paddingRight = `${scrollbarW}px`;
    }

    // Focus the first interactive element inside the panel.
    requestAnimationFrame(() => {
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      const first = focusables && focusables.length > 0 ? focusables[0] : panelRef.current;
      first?.focus();
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab' || !panelRef.current) return;

      const items = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => !el.hasAttribute('aria-hidden') && el.offsetParent !== null);
      if (items.length === 0) {
        e.preventDefault();
        panelRef.current.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault(); first.focus();
      } else if (active && !panelRef.current.contains(active)) {
        e.preventDefault(); first.focus();
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPadRight;
      window.removeEventListener('keydown', onKey);
      const trigger = triggerRef.current as HTMLElement | null;
      if (trigger && typeof trigger.focus === 'function') {
        trigger.focus();
      }
    };
  }, [open, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
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
              ref={panelRef}
              tabIndex={-1}
              className="leap-modal"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0,  scale: 1    }}
              exit={{    opacity: 0, y: 24, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              style={{ width }}
              role="dialog"
              aria-modal="true"
              aria-label={title}
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
                  className="leap-modal-close"
                  style={{
                    marginLeft: 'auto',
                    width: 32, height: 32, borderRadius: 999,
                    display: 'inline-grid', placeItems: 'center',
                    color: 'var(--leap-text-dim)',
                    background: 'transparent',
                    border: '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'background 200ms ease, border-color 200ms ease, color 200ms ease',
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
    </AnimatePresence>,
    document.body,
  );
}
