import React from 'react';
import { motion, AnimatePresence as APRaw } from 'framer-motion';
import { useSnapshot } from 'valtio';
import { themeState, toggleTheme } from '../../lib/theme';

const AnimatePresence = APRaw as unknown as React.FC<{
  children?: React.ReactNode;
  mode?: 'wait' | 'sync' | 'popLayout';
  initial?: boolean;
}>;

interface Props {
  size?: number;
}

const SunIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M5.6 18.4l-1.4 1.4M19.8 4.2l-1.4 1.4" />
  </svg>
);

const MoonIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);

export function ThemeToggle({ size = 14 }: Props) {
  const { theme } = useSnapshot(themeState);
  const isLight = theme === 'light';

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isLight ? 'dark' : 'light'} mode`}
      title={`Switch to ${isLight ? 'dark' : 'light'} mode`}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      style={{
        position: 'relative',
        width: 36, height: 36,
        display: 'inline-grid', placeItems: 'center',
        borderRadius: 999,
        border: '1px solid var(--leap-border)',
        background: 'var(--leap-card-bg-muted)',
        color: 'var(--leap-text-dim)',
        cursor: 'pointer',
        overflow: 'hidden',
      }}
    >
      <AnimatePresence mode="wait">
        {isLight ? (
          <motion.span
            key="sun"
            initial={{ opacity: 0, rotate: -60, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0,   scale: 1   }}
            exit={{    opacity: 0, rotate: 60,  scale: 0.6 }}
            transition={{ type: 'spring', stiffness: 360, damping: 22 }}
            style={{ display: 'inline-grid', placeItems: 'center', color: '#c2410c' }}
          >
            <SunIcon size={size} />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ opacity: 0, rotate: 60,  scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0,   scale: 1   }}
            exit={{    opacity: 0, rotate: -60, scale: 0.6 }}
            transition={{ type: 'spring', stiffness: 360, damping: 22 }}
            style={{ display: 'inline-grid', placeItems: 'center', color: '#c4b5fd' }}
          >
            <MoonIcon size={size} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
