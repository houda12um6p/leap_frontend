import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence as APRaw } from 'framer-motion';
import { toast } from 'sonner';
import { useDeleteProject } from '../../lib/api';

const AnimatePresence = APRaw as unknown as React.FC<{
  children?: React.ReactNode;
  mode?: 'wait' | 'sync' | 'popLayout';
  initial?: boolean;
}>;

interface Props {
  projectId: string;
  projectName: string;
}

const TrashIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

export function DeleteProjectButton({ projectId, projectName }: Props) {
  const [armed, setArmed] = useState(false);
  const del = useDeleteProject();
  const navigate = useNavigate();

  useEffect(() => {
    if (!armed) return;
    const t = window.setTimeout(() => setArmed(false), 4000);
    return () => window.clearTimeout(t);
  }, [armed]);

  const handle = async () => {
    if (!armed) {
      setArmed(true);
      return;
    }
    try {
      await del.mutateAsync(projectId);
      toast.success(`Deleted ${projectName}`);
      navigate('/projects', { replace: true });
    } catch (e) {
      toast.error('Could not delete project.', {
        description: (e as Error).message ?? 'Network error.',
      });
      setArmed(false);
    }
  };

  const danger = '#f87171';

  return (
    <motion.button
      type="button"
      onClick={handle}
      disabled={del.isPending}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 24 }}
      title={armed ? 'Click again to confirm' : 'Delete project'}
      aria-label="Delete project"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '11px 16px',
        borderRadius: 999,
        fontFamily: "'Geist', system-ui",
        fontSize: 13,
        fontWeight: 500,
        letterSpacing: '-0.005em',
        cursor: del.isPending ? 'wait' : 'pointer',
        border: `1px solid ${armed ? danger : 'var(--leap-border)'}`,
        background: armed ? 'color-mix(in srgb, var(--leap-accent-warn) 14%, transparent)' : 'var(--leap-card-bg)',
        color: armed ? danger : 'var(--leap-text-dim)',
        backdropFilter: 'blur(14px) saturate(140%)',
        WebkitBackdropFilter: 'blur(14px) saturate(140%)',
        transition: 'background 220ms ease, border-color 220ms ease, color 220ms ease',
      }}
      onMouseEnter={(e) => {
        if (armed) return;
        e.currentTarget.style.color = 'var(--leap-accent-warn)';
        e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--leap-accent-warn) 40%, transparent)';
      }}
      onMouseLeave={(e) => {
        if (armed) return;
        e.currentTarget.style.color = 'var(--leap-text-dim)';
        e.currentTarget.style.borderColor = 'var(--leap-border)';
      }}
    >
      <TrashIcon size={14} />
      <AnimatePresence mode="wait">
        <motion.span
          key={del.isPending ? 'pending' : armed ? 'confirm' : 'idle'}
          initial={{ opacity: 0, x: 4 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -4 }}
          transition={{ duration: 0.18 }}
        >
          {del.isPending ? 'Deleting…' : armed ? 'Click to confirm' : 'Delete'}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
