import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Pill } from '../ui/Pill';
import { ExternalLinkIcon, TrashIcon } from '../ui/Icon';
import { Project, scoreBand } from '../../lib/types';
import { useDeleteProject } from '../../lib/api';

interface Props {
  project: Project;
  contributors: number;
  open_mrs: number;
  pending_tasks: number;
  project_score: number;
}

export function ProjectCard({
  project, contributors, open_mrs, pending_tasks, project_score,
}: Props) {
  const tone = scoreBand(project_score);
  const archived = project.status === 'archived';
  const [armed, setArmed] = useState(false);
  const del = useDeleteProject();

  useEffect(() => {
    if (!armed) return;
    const t = window.setTimeout(() => setArmed(false), 4000);
    return () => window.clearTimeout(t);
  }, [armed]);

  const onDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!armed) { setArmed(true); return; }
    del.mutateAsync(project.id)
      .then(() => { toast.success(`Deleted ${project.name}`); })
      .catch((err: unknown) => {
        toast.error('Could not delete project.', {
          description: (err as Error).message ?? 'Network error.',
        });
        setArmed(false);
      });
  };

  return (
    <motion.div
      layoutId={`project-${project.id}`}
      whileHover={{ y: -3, scale: 1.012 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="leap-card"
      style={{
        padding: 24,
        opacity: archived ? 0.55 : 1,
        boxShadow: `0 0 0 1px ${tone.soft}, 0 18px 48px ${tone.faint}`,
      }}
    >
      <Link
        to={`/projects/${project.id}`}
        style={{
          position: 'absolute', inset: 0,
          borderRadius: 'inherit',
          zIndex: 1,
        }}
        aria-label={`Open ${project.name}`}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: -1,
          borderRadius: 'inherit',
          background: `radial-gradient(220px 160px at 12% 0%, ${tone.faint}, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10, zIndex: 2 }}>
        <span
          style={{
            display: 'inline-block',
            width: 8, height: 8, borderRadius: 2,
            background: `linear-gradient(135deg, ${tone.tone}, var(--leap-accent-amber))`,
            boxShadow: `0 0 12px ${tone.soft}`,
          }}
        />
        <Pill color={archived ? '#94a3b8' : tone.tone} tone="soft">
          {archived ? 'Archived' : 'Active'}
        </Pill>
        <span
          style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: 10.5,
            color: 'var(--leap-text-faint)',
            letterSpacing: '0.10em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <ExternalLinkIcon size={10} />
          repo
        </span>

        <motion.button
          type="button"
          onClick={onDelete}
          disabled={del.isPending}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 400, damping: 24 }}
          aria-label={armed ? 'Click again to confirm delete' : 'Delete project'}
          title={armed ? 'Click again to confirm' : 'Delete project'}
          className="leap-card-delete"
          style={{
            marginLeft: 'auto',
            position: 'relative',
            zIndex: 2,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 30, height: 30,
            borderRadius: 999,
            cursor: del.isPending ? 'wait' : 'pointer',
            border: `1px solid ${armed ? '#f87171' : 'transparent'}`,
            background: armed ? 'color-mix(in srgb, #f87171 14%, transparent)' : 'transparent',
            color: armed ? '#f87171' : 'var(--leap-text-faint)',
            transition: 'background 200ms ease, border-color 200ms ease, color 200ms ease',
          }}
        >
          <TrashIcon size={13} />
        </motion.button>
      </div>

      <h3 style={{
        position: 'relative',
        margin: '14px 0 4px',
        fontSize: 20, fontWeight: 500,
        color: 'var(--leap-text)',
        letterSpacing: '-0.025em',
        lineHeight: 1.2,
      }}>
        {project.name}
      </h3>

      <div style={{
        position: 'relative',
        fontFamily: "'Geist Mono', monospace",
        fontSize: 10.5, color: 'var(--leap-text-faint)',
        letterSpacing: '0.06em',
        marginBottom: 18,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {project.repo_url.replace(/^https?:\/\//, '')}
      </div>

      {/* metrics row */}
      <div style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        borderTop: '1px solid var(--leap-border-soft)',
        paddingTop: 14,
      }}>
        <Metric label="Engineers" value={contributors} />
        <Metric label="Open MRs"  value={open_mrs} />
        <Metric label="Tasks"     value={pending_tasks} />
      </div>

      {/* score band */}
      <div style={{
        position: 'relative',
        marginTop: 14,
        display: 'flex',
        alignItems: 'baseline',
        gap: 8,
      }}>
        <div style={{
          fontFamily: "'Geist Mono', monospace",
          fontSize: 10, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: 'var(--leap-text-faint)',
        }}>
          Project score
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{
            fontFamily: "'Geist', system-ui",
            fontSize: 26, fontWeight: 500,
            letterSpacing: '-0.025em',
            background: `linear-gradient(180deg, var(--leap-text) 0%, ${tone.tone} 130%)`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}>
            {Math.round(project_score)}
          </span>
          <span style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: 10, color: 'var(--leap-text-faint)',
            letterSpacing: '0.16em',
          }}>
            / 1000
          </span>
        </div>
      </div>

    </motion.div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div style={{
        fontFamily: "'Geist Mono', monospace",
        fontSize: 9.5, letterSpacing: '0.22em',
        textTransform: 'uppercase', color: 'var(--leap-text-faint)',
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 18, fontWeight: 500,
        color: 'var(--leap-text)',
        letterSpacing: '-0.02em',
        marginTop: 4,
      }}>
        {value}
      </div>
    </div>
  );
}
