import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useProjects, usePerProjectBundles } from '../lib/api';
import { ProjectCard } from '../components/projects/ProjectCard';
import { AddProjectModal } from '../components/projects/AddProjectModal';
import { CardSkeleton } from '../components/dashboard/CardSkeleton';
import { Button } from '../components/ui/Button';
import { PlusIcon } from '../components/ui/Icon';
import { openAddProject } from '../store';

type StatusFilter = 'all' | 'active' | 'archived';
type ScoreSort = 'none' | 'best' | 'worst';

export default function ProjectsPage() {
  const projectsQ = useProjects();
  const projects = useMemo(() => projectsQ.data ?? [], [projectsQ.data]);
  const bundles = usePerProjectBundles(projects.map((p) => p.id));

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [scoreSort, setScoreSort] = useState<ScoreSort>('none');

  useEffect(() => {
    if (projectsQ.isError) {
      toast.error('Could not load projects.', {
        description: (projectsQ.error as Error)?.message ?? 'Network error.',
      });
    }
  }, [projectsQ.isError, projectsQ.error]);

  const cards = useMemo(() => {
    return projects.map((p) => {
      const b = bundles.find((x) => x.projectId === p.id);
      const open = (b?.mrs ?? []).filter((m) => m.status === 'open' || m.status === 'review').length;
      const tasks = (b?.jira ?? []).filter((t) => t.status !== 'Done').length;
      const contributors = new Set((b?.mrs ?? []).map((m) => m.author_id).filter(Boolean)).size;
      const score = b?.overview?.project_score ?? 0;
      return { project: p, open, tasks, contributors, score };
    });
  }, [projects, bundles]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    let filtered = cards;
    if (q) filtered = filtered.filter((c) => c.project.name.toLowerCase().includes(q));
    if (statusFilter !== 'all') filtered = filtered.filter((c) => c.project.status === statusFilter);
    if (scoreSort !== 'none') {
      filtered = [...filtered].sort((a, b) =>
        scoreSort === 'best' ? b.score - a.score : a.score - b.score
      );
    }
    return filtered;
  }, [cards, search, statusFilter, scoreSort]);

  return (
    <main className="dashboard-shell">
      <motion.header
        className="dashboard-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{ paddingBottom: 16, marginBottom: 18 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: 10.5, letterSpacing: '0.32em',
            textTransform: 'uppercase', color: 'var(--leap-text-faint)',
          }}>
            Projects · workspace
          </div>
          <h1 className="page-title">All projects</h1>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          <Button
            variant="primary"
            size="md"
            icon={<PlusIcon size={14} />}
            onClick={openAddProject}
          >
            Add project
          </Button>
        </div>
      </motion.header>

      <p style={{
        margin: '0 0 20px',
        color: 'var(--leap-text-dim)',
        fontSize: 14, lineHeight: 1.5, maxWidth: 560,
      }}>
        Each card aggregates engineer count, in-flight pull requests and pending Jira tasks.
        Click into a project to drill into team, tasks and the per-PR score ledger.
      </p>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 12,
        marginBottom: 22,
      }}>
        <div style={{ position: 'relative', flex: '1 1 280px', minWidth: 220, maxWidth: 360 }}>
          <SearchIcon />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name…"
            aria-label="Search projects"
            style={{
              width: '100%',
              padding: '10px 34px 10px 36px',
              borderRadius: 10,
              border: '1px solid var(--leap-border)',
              background: 'var(--leap-card-bg)',
              color: 'var(--leap-text)',
              fontFamily: "'Geist', system-ui",
              fontSize: 13,
              outline: 'none',
              transition: 'border-color 200ms ease',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(94, 234, 212, 0.55)'; }}
            onBlur={(e)  => { e.currentTarget.style.borderColor = 'var(--leap-border)'; }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute', right: 8, top: '50%',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none',
                cursor: 'pointer', fontSize: 14,
                color: 'var(--color-text-secondary)',
                padding: '2px 6px',
              }}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <FilterGroup label="Status">
          {(['all', 'active', 'archived'] as const).map((s) => (
            <FilterChip
              key={s}
              selected={statusFilter === s}
              onClick={() => setStatusFilter(s)}
            >
              {s === 'all' ? 'All' : s === 'active' ? 'Active' : 'Archived'}
            </FilterChip>
          ))}
        </FilterGroup>

        <FilterGroup label="Score">
          <FilterChip
            selected={scoreSort === 'none'}
            onClick={() => setScoreSort('none')}
          >
            Most recent
          </FilterChip>
          <FilterChip
            selected={scoreSort === 'best'}
            onClick={() => setScoreSort('best')}
          >
            Best score
          </FilterChip>
          <FilterChip
            selected={scoreSort === 'worst'}
            onClick={() => setScoreSort('worst')}
          >
            Worst score
          </FilterChip>
        </FilterGroup>
      </div>

      <motion.section
        className="leap-projects-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        {projectsQ.isLoading ? (
          <>
            <CardSkeleton rows={3} />
            <CardSkeleton rows={3} />
            <CardSkeleton rows={3} />
            <CardSkeleton rows={3} />
          </>
        ) : projects.length === 0 ? (
          <div style={emptyStyle}>
            No projects yet. Click <strong>Add project</strong> to start.
          </div>
        ) : visible.length === 0 ? (
          <div style={emptyStyle}>
            No projects match the search or filters.
          </div>
        ) : (
          visible.map(({ project, contributors, open, tasks, score }) => (
            <ProjectCard
              key={project.id}
              project={project}
              contributors={contributors}
              open_mrs={open}
              pending_tasks={tasks}
              project_score={score}
            />
          ))
        )}
      </motion.section>

      <AddProjectModal />
    </main>
  );
}

const emptyStyle: React.CSSProperties = {
  gridColumn: '1 / -1',
  padding: 60,
  textAlign: 'center',
  border: '1px dashed var(--leap-border)',
  borderRadius: 18,
  color: 'var(--leap-text-dim)',
};

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span style={{
        fontFamily: "'Geist Mono', monospace",
        fontSize: 10, letterSpacing: '0.22em',
        textTransform: 'uppercase', color: 'var(--leap-text-faint)',
      }}>
        {label}
      </span>
      <div style={{ display: 'inline-flex', gap: 4 }}>
        {children}
      </div>
    </div>
  );
}

function FilterChip({
  selected, onClick, children,
}: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      style={{
        padding: '7px 12px',
        borderRadius: 999,
        border: `1px solid ${selected ? 'rgba(94, 234, 212, 0.55)' : 'var(--leap-border)'}`,
        background: selected ? 'rgba(94, 234, 212, 0.10)' : 'var(--leap-card-bg)',
        color: selected ? 'var(--leap-text)' : 'var(--leap-text-dim)',
        fontFamily: "'Geist Mono', monospace",
        fontSize: 10.5,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        transition: 'background 180ms ease, border-color 180ms ease, color 180ms ease',
      }}
    >
      {children}
    </button>
  );
}

function SearchIcon() {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
      style={{
        position: 'absolute',
        left: 12, top: '50%', transform: 'translateY(-50%)',
        color: 'var(--leap-text-faint)',
        pointerEvents: 'none',
      }}
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
