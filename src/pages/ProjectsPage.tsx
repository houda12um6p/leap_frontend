import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useProjects, usePerProjectBundles } from '../lib/api';
import { ProjectCard } from '../components/projects/ProjectCard';
import { AddProjectModal } from '../components/projects/AddProjectModal';
import { CardSkeleton } from '../components/dashboard/CardSkeleton';
import { Button } from '../components/ui/Button';
import { PlusIcon } from '../components/ui/Icon';
import { openAddProject } from '../store';

export default function ProjectsPage() {
  const projectsQ = useProjects();
  const projects = useMemo(() => projectsQ.data ?? [], [projectsQ.data]);
  const bundles = usePerProjectBundles(projects.map((p) => p.id));

  useEffect(() => {
    if (projectsQ.isError) {
      toast.error('Could not load projects.', {
        description: (projectsQ.error as Error)?.message ?? 'Network error.',
      });
    }
  }, [projectsQ.isError, projectsQ.error]);

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
          <h1 style={{
            margin: 0,
            fontSize: 'clamp(28px, 3.6vw, 40px)',
            fontWeight: 600,
            letterSpacing: '-0.035em',
            lineHeight: 1,
            background: 'linear-gradient(180deg, var(--leap-text) 0%, var(--leap-text-dim) 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}>
            All projects
          </h1>
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
        margin: '0 0 28px',
        color: 'var(--leap-text-dim)',
        fontSize: 14, lineHeight: 1.5, maxWidth: 560,
      }}>
        Each card aggregates engineer count, in-flight pull requests and pending Jira tasks.
        Click into a project to drill into team, tasks and the per-PR score ledger.
      </p>

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
          <div style={{
            gridColumn: '1 / -1',
            padding: 60,
            textAlign: 'center',
            border: '1px dashed var(--leap-border)',
            borderRadius: 18,
            color: 'var(--leap-text-dim)',
          }}>
            No projects yet. Click <strong>Add project</strong> to start.
          </div>
        ) : (
          projects.map((p) => {
            const b = bundles.find((x) => x.projectId === p.id);
            const open = (b?.mrs ?? []).filter((m) => m.status === 'open' || m.status === 'review').length;
            const tasks = (b?.jira ?? []).filter((t) => t.status !== 'Done').length;
            const contributors = new Set((b?.mrs ?? []).map((m) => m.author_id).filter(Boolean)).size;
            const score = b?.overview?.project_score ?? 0;
            return (
              <ProjectCard
                key={p.id}
                project={p}
                contributors={contributors}
                open_mrs={open}
                pending_tasks={tasks}
                project_score={score}
              />
            );
          })
        )}
      </motion.section>

      <AddProjectModal />
    </main>
  );
}
