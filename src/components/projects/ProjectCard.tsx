import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Pill } from '../ui/Pill';
import { ExternalLinkIcon } from '../ui/Icon';
import { Project, scoreBand } from '../../lib/types';
import { useDeleteProject } from '../../lib/api';
import { EditProjectModal } from './EditProjectModal';

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
  const [editOpen, setEditOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const del = useDeleteProject();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const onEdit = () => { setEditOpen(true); };

  const onDelete = () => {
    del.mutateAsync(project.id)
      .then(() => { toast.success(`Deleted ${project.name}`); })
      .catch((err: unknown) => {
        toast.error('Could not delete project.', {
          description: (err as Error).message ?? 'Network error.',
        });
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

        <div ref={menuRef} style={{ marginLeft: 'auto', position: 'relative' }}>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
            aria-label="Project options"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--leap-text-faint)',
              fontSize: '1.2rem',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.375rem',
            }}
          >
            ⋯
          </button>

          {menuOpen && (
            <div style={{
              position: 'absolute',
              top: '2rem',
              right: 0,
              background: 'var(--leap-card-bg)',
              border: '1px solid var(--leap-border)',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 16px rgba(0,0,0,0.20)',
              minWidth: '160px',
              zIndex: 50,
              overflow: 'hidden',
              backdropFilter: 'blur(12px)',
            }}>
              <button
                type="button"
                onClick={() => { setMenuOpen(false); onEdit(); }}
                style={menuItemStyle('var(--leap-text)')}
              >
                ✏️ Edit project
              </button>
              <button
                type="button"
                onClick={() => { setMenuOpen(false); onDelete(); }}
                disabled={del.isPending}
                style={menuItemStyle('var(--leap-accent-warn)')}
              >
                🗑 Delete project
              </button>
            </div>
          )}
        </div>
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

      <EditProjectModal
        open={editOpen}
        project={project}
        onClose={() => setEditOpen(false)}
      />
    </motion.div>
  );
}

function menuItemStyle(color: string): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '0.625rem 1rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontFamily: 'var(--font-geist-mono, monospace)',
    color,
    textAlign: 'left',
  };
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
