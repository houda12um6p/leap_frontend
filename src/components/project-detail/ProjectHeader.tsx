import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Pill } from '../ui/Pill';
import { Button } from '../ui/Button';
import { ArrowLeftIcon, ExternalLinkIcon } from '../ui/Icon';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { SyncMenu } from '../projects/SyncMenu';
import { DeleteProjectButton } from '../projects/DeleteProjectButton';
import { EditProjectModal } from '../projects/EditProjectModal';
import { Project, ProjectOverview, scoreBand } from '../../lib/types';

const PencilIcon = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
);

interface Props {
  project: Project;
  overview: ProjectOverview | null;
  isFetching?: boolean;
}

export function ProjectHeader({ project, overview, isFetching = false }: Props) {
  const tone = scoreBand(overview?.project_score ?? 0);
  const [editOpen, setEditOpen] = useState(false);

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
        background: 'var(--leap-card-bg)',
        backdropFilter: 'blur(18px) saturate(140%)',
        WebkitBackdropFilter: 'blur(18px) saturate(140%)',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: -1,
            background: `radial-gradient(360px 200px at 0% 0%, ${tone.faint}, transparent 65%)`,
          }}
        />
      </div>

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
            background: 'var(--leap-surface-soft)',
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

        {isFetching && (
          <span className="leap-sync-pulse" aria-live="polite">
            <span className="leap-sync-pulse__dot" />
            Syncing
          </span>
        )}

        <div style={{ marginLeft: 'auto', display: 'inline-flex', gap: 8, flexWrap: 'wrap' }}>
          <Button
            variant="glass"
            size="sm"
            icon={<PencilIcon size={13} />}
            onClick={() => setEditOpen(true)}
          >
            Edit project
          </Button>
          <DeleteProjectButton projectId={project.id} projectName={project.name} />
          <SyncMenu projectId={project.id} repoUrl={project.repo_url} />
        </div>
      </div>

      <EditProjectModal
        open={editOpen}
        project={project}
        onClose={() => setEditOpen(false)}
      />

      <h1
        className="page-title"
        style={{ position: 'relative', margin: '18px 0 6px' }}
      >
        {project.name}
      </h1>

      <div style={{
        position: 'relative',
        marginTop: 22,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 18,
        borderTop: '1px solid var(--leap-border-soft)',
        paddingTop: 18,
      }}>
        <Stat label="Project score" value={Math.round(overview?.project_score ?? 0)} accent={tone.tone} />
        <Stat label="Engineers"     value={overview?.total_contributors ?? 0} />
        <Stat label="Open MRs"      value={overview?.open_merge_requests ?? 0} />
        <Stat label="Total commits" value={overview?.total_commits ?? 0} />
        <Stat label="Alerts"        value={overview?.unresolved_alerts ?? 0} accent={(overview?.unresolved_alerts ?? 0) > 0 ? 'var(--leap-accent-warn)' : undefined} />
      </div>
    </motion.header>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: string }) {
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
          color: accent ?? 'var(--leap-text)',
        }}
      />
    </div>
  );
}
