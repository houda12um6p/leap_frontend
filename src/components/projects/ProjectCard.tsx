import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Pill } from '../ui/Pill';
import { ExternalLinkIcon } from '../ui/Icon';
import { Project, scoreBand } from '../../lib/types';

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

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
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
            marginLeft: 'auto',
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
