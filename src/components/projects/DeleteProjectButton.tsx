import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence as APRaw } from 'framer-motion';
import { toast } from 'sonner';
import { useDeleteProject } from '../../lib/api';
import { TrashIcon } from '../ui/Icon';

const AnimatePresence = APRaw as unknown as React.FC<{
  children?: React.ReactNode;
  mode?: 'wait' | 'sync' | 'popLayout';
  initial?: boolean;
}>;

interface Props {
  projectId: string;
  projectName: string;
}

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
