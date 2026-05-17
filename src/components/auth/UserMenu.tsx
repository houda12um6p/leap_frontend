import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence as APRaw } from 'framer-motion';
import { useSnapshot } from 'valtio';
import { authState, logout } from '../../lib/auth';
import { LogOutIcon } from '../ui/Icon';

const AnimatePresence = APRaw as unknown as React.FC<{
  children?: React.ReactNode;
  mode?: 'wait' | 'sync' | 'popLayout';
  initial?: boolean;
}>;

function initialsFor(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '·';
}

export function UserMenu() {
  const snap = useSnapshot(authState);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!snap.user) return null;
  const user = snap.user;
  const initials = initialsFor(user.name || user.email);

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div
      ref={ref}
      style={{ position: 'relative' }}
    >
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        whileTap={{ scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 400, damping: 24 }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Signed in as ${user.email}`}
        className="leap-user-pill"
      >
        <span className="leap-user-avatar">{initials}</span>
        <span className="leap-user-name">{user.name || user.email}</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="usermenu-panel"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: -6, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            role="menu"
            className="leap-user-menu"
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              minWidth: 240,
              padding: 6,
              borderRadius: 14,
              border: '1px solid var(--leap-border)',
              background: 'var(--leap-card-bg)',
              backdropFilter: 'blur(28px) saturate(160%)',
              WebkitBackdropFilter: 'blur(28px) saturate(160%)',
              boxShadow: '0 24px 60px var(--leap-menu-shadow)',
            }}
          >
            <div style={{
              padding: '10px 12px 12px',
              borderBottom: '1px solid var(--leap-border-soft)',
            }}>
              <div style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: 9.5, letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--leap-text-faint)',
              }}>
                Signed in as
              </div>
              <div style={{
                marginTop: 6,
                fontSize: 13.5, fontWeight: 500,
                letterSpacing: '-0.005em',
                color: 'var(--leap-text)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {user.name || user.email}
              </div>
              <div style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: 11,
                letterSpacing: '0.04em',
                color: 'var(--leap-text-dim)',
                marginTop: 2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {user.email}
              </div>
              {user.role && (
                <div style={{
                  marginTop: 8,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '2px 8px',
                  borderRadius: 999,
                  border: '1px solid color-mix(in srgb, var(--leap-accent-cyan) 35%, transparent)',
                  background: 'color-mix(in srgb, var(--leap-accent-cyan) 10%, transparent)',
                  color: 'var(--leap-accent-cyan)',
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: 9.5,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                }}>
                  {user.role}
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              role="menuitem"
              className="leap-user-menu__signout"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                marginTop: 4,
                borderRadius: 10,
                background: 'transparent',
                border: '1px solid transparent',
                color: 'var(--leap-text)',
                cursor: 'pointer',
                fontFamily: "'Geist', system-ui",
                fontSize: 13, fontWeight: 500,
                letterSpacing: '-0.005em',
                transition: 'background 180ms ease, border-color 180ms ease, color 180ms ease',
                textAlign: 'left',
              }}
            >
              <LogOutIcon size={14} />
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
