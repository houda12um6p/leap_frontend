import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Pill } from '../ui/Pill';
import { ArrowLeftIcon, ExternalLinkIcon } from '../ui/Icon';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { SyncMenu } from '../projects/SyncMenu';
import { Project, ProjectOverview, scoreBand } from '../../lib/types';

interface Props {
  project: Project;
  overview: ProjectOverview | null;
}

export function ProjectHeader({ project, overview }: Props) {
  const tone = scoreBand(overview?.project_score ?? 0);

  return (
    <motion.header
      layoutId={`project-${project.id}`}
      transition={{ type: 'spring', stiffness: 240, damping: 30 }}
      style={{
        position: 'relative',
        padding: '24px 26px',
        marginBottom: 24,
        borderRadius: 22,
        border: '1px solid var(--leap-border)',
        background: 'rgba(10, 14, 26, 0.62)',
        backdropFilter: 'blur(18px) saturate(140%)',
        WebkitBackdropFilter: 'blur(18px) saturate(140%)',
        overflow: 'hidden',
      }}
    >
      {/* corner glow */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: -1,
          borderRadius: 'inherit',
          background: `radial-gradient(360px 200px at 0% 0%, ${tone.tone}1a, transparent 65%)`,
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <Link
          to="/projects"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 999,
            border: '1px solid var(--leap-border)',
            background: 'rgba(255,255,255,0.025)',
            color: 'var(--leap-text-dim)',
            fontFamily: "'Geist Mono', monospace",
            fontSize: 10.5,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
          }}
        >
          <ArrowLeftIcon size={11} />
          All projects
        </Link>

        <Pill color={project.status === 'archived' ? '#94a3b8' : tone.tone} tone="soft">
          {project.status}
        </Pill>

        <a
          href={project.repo_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: 10.5,
            letterSpacing: '0.10em',
            color: 'var(--leap-text-dim)',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}
        >
          {project.repo_url.replace(/^https?:\/\//, '')}
          <ExternalLinkIcon size={11} />
        </a>

        <div style={{ marginLeft: 'auto' }}>
          <SyncMenu projectId={project.id} repoUrl={project.repo_url} />
        </div>
      </div>

      <h1
        style={{
          position: 'relative',
          margin: '18px 0 6px',
          fontSize: 'clamp(32px, 4.4vw, 52px)',
          fontWeight: 600,
          letterSpacing: '-0.04em',
          lineHeight: 1.0,
          background: 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.55) 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        }}
      >
        {project.name}
      </h1>

      <div style={{
        position: 'relative',
        marginTop: 22,
        display: 'grid',
        gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
        gap: 18,
        borderTop: '1px solid var(--leap-border-soft)',
        paddingTop: 18,
      }}>
        <Stat label="Project score" value={Math.round(overview?.project_score ?? 0)} accent={tone.tone} />
        <Stat label="Engineers"     value={overview?.total_contributors ?? 0} />
        <Stat label="Open MRs"      value={overview?.open_merge_requests ?? 0} />
        <Stat label="Total commits" value={overview?.total_commits ?? 0} />
        <Stat label="Alerts"        value={overview?.unresolved_alerts ?? 0} accent={(overview?.unresolved_alerts ?? 0) > 0 ? '#f87171' : undefined} />
      </div>
    </motion.header>
  );
}

function Stat({ label, value, accent = '#ffffff' }: { label: string; value: number; accent?: string }) {
  return (
    <div>
      <div style={{
        fontFamily: "'Geist Mono', monospace",
        fontSize: 10, letterSpacing: '0.22em',
        textTransform: 'uppercase', color: 'var(--leap-text-faint)',
      }}>
        {label}
      </div>
      <AnimatedNumber
        value={value}
        style={{
          display: 'block',
          marginTop: 4,
          fontSize: 26, fontWeight: 500,
          letterSpacing: '-0.025em',
          color: accent === '#ffffff' ? 'var(--leap-text)' : accent,
        }}
      />
    </div>
  );
}
