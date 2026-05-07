import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useProjects, usePerProjectBundles } from '../lib/api';
import { BentoGrid, BentoCell } from '../components/dashboard/BentoGrid';
import { StatTile } from '../components/dashboard/StatTile';
import { TopDevelopersTile } from '../components/dashboard/TopDevelopersTile';
import { CriticalFeedTile } from '../components/dashboard/CriticalFeedTile';
import { ProjectsSummaryTile } from '../components/dashboard/ProjectsSummaryTile';
import { BentoSkeleton } from '../components/dashboard/CardSkeleton';
import type { DeveloperScore, MergeRequestSummary } from '../lib/types';

export default function DashboardShell() {
  const projectsQ = useProjects();
  const projects = useMemo(() => projectsQ.data ?? [], [projectsQ.data]);

  // Fan out per-project queries from the live project list.
  const bundles = usePerProjectBundles(projects.map((p) => p.id));

  useEffect(() => {
    if (projectsQ.isError) {
      toast.error('Could not load projects.', {
        description: (projectsQ.error as Error)?.message ?? 'Network error.',
      });
    }
  }, [projectsQ.isError, projectsQ.error]);

  const aggregates = useMemo(() => {
    const activeProjects = projects.filter((p) => p.status === 'active');
    const activeIds = new Set(activeProjects.map((p) => p.id));
    const activeBundles = bundles.filter((b) => activeIds.has(b.projectId));

    const byProject = activeProjects.map((p) => {
      const b = activeBundles.find((x) => x.projectId === p.id);
      const open = (b?.mrs ?? []).filter((m) => m.status === 'open' || m.status === 'review').length;
      return {
        project: p,
        contributors: new Set((b?.mrs ?? []).map((m) => m.author_id).filter(Boolean)).size,
        open_mrs: open,
        pending_tasks: (b?.jira ?? []).filter((t) => t.status !== 'Done').length,
        project_score: b?.overview?.project_score ?? 0,
      };
    });

    // merge developers across projects
    const devMap = new Map<string, { d: DeveloperScore; scores: number[]; mrs: number }>();
    activeBundles.forEach(({ scores }) => {
      scores.forEach((d) => {
        const e = devMap.get(d.user_id) ?? { d, scores: [], mrs: 0 };
        e.scores.push(d.total_score);
        e.mrs += d.merge_request_count;
        e.d = d;
        devMap.set(d.user_id, e);
      });
    });
    const globalDevs: DeveloperScore[] = Array.from(devMap.values()).map(({ d, scores, mrs }) => ({
      ...d,
      total_score: scores.reduce((a, b) => a + b, 0) / scores.length,
      merge_request_count: mrs,
    }));

    const criticalPRs: Array<MergeRequestSummary & { project_name: string }> =
      activeBundles.flatMap(({ projectId, mrs }) => {
        const name = activeProjects.find((p) => p.id === projectId)?.name ?? projectId;
        return mrs.map((m) => ({ ...m, project_name: name }));
      });

    const totalMRs       = activeBundles.reduce((s, x) => s + x.mrs.length, 0);
    const totalOpenMRs   = byProject.reduce((s, x) => s + x.open_mrs, 0);
    const totalAlerts    = activeBundles.reduce((s, x) => s + (x.overview?.unresolved_alerts ?? 0), 0);
    const totalEngineers = new Set(activeBundles.flatMap((x) => x.scores.map((d) => d.user_id))).size;

    return { activeProjects, byProject, globalDevs, criticalPRs, totalMRs, totalOpenMRs, totalAlerts, totalEngineers };
  }, [projects, bundles]);

  const isInitialLoad = projectsQ.isLoading || (projects.length > 0 && bundles.every((b) => b.isLoading));

  return (
    <main className="dashboard-shell">
      <motion.header
        className="dashboard-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{ paddingBottom: 20, marginBottom: 24 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            fontFamily: "'Geist Mono', monospace",
            fontSize: 10.5, letterSpacing: '0.32em',
            textTransform: 'uppercase', color: 'var(--leap-text-faint)',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: 999,
              background: 'var(--leap-accent-cyan)',
              boxShadow: '0 0 12px rgba(94, 234, 212, 0.6)',
              animation: 'pulse 2.6s ease-in-out infinite',
            }} />
            Engineering intelligence · live
          </div>
          <h1 style={{
            margin: 0,
            fontSize: 'clamp(36px, 4.4vw, 56px)',
            fontWeight: 600,
            letterSpacing: '-0.04em',
            lineHeight: 1.0,
            background: 'linear-gradient(180deg, var(--leap-text) 0%, var(--leap-text-dim) 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}>
            Today’s <em style={{
              fontFamily: "'Instrument Serif', serif",
              fontStyle: 'italic',
              fontWeight: 400,
              background: 'linear-gradient(180deg, var(--leap-accent-cyan) 0%, var(--leap-accent-amber) 130%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}>signal</em>.
          </h1>
        </div>
      </motion.header>

      <BentoGrid>
        {isInitialLoad ? (
          <BentoSkeleton />
        ) : (
          <>
            <BentoCell col={3} colMd={6}>
              <StatTile
                label="Active projects"
                value={aggregates.activeProjects.length}
                unit="repos"
                accent="#5eead4"
                hint={`${aggregates.totalMRs} merge requests across active projects`}
              />
            </BentoCell>
            <BentoCell col={3} colMd={6}>
              <StatTile
                label="Engineers"
                value={aggregates.totalEngineers}
                unit="contributing"
                accent="#a78bfa"
                hint="Developers with at least one MR in this project set."
              />
            </BentoCell>
            <BentoCell col={3} colMd={6}>
              <StatTile
                label="Open MRs"
                value={aggregates.totalOpenMRs}
                unit="in-flight"
                accent="#fbbf24"
              />
            </BentoCell>
            <BentoCell col={3} colMd={6}>
              <StatTile
                label="Alerts"
                value={aggregates.totalAlerts}
                unit="unresolved"
                accent={aggregates.totalAlerts > 0 ? '#f87171' : '#5eead4'}
                hint={aggregates.totalAlerts > 0 ? 'Inspect each project to triage.' : 'No critical alerts.'}
              />
            </BentoCell>

            <BentoCell col={6} row={2} colMd={12}>
              <TopDevelopersTile developers={aggregates.globalDevs} />
            </BentoCell>
            <BentoCell col={6} row={2} colMd={12}>
              <CriticalFeedTile prs={aggregates.criticalPRs} />
            </BentoCell>

            <BentoCell col={12}>
              <ProjectsSummaryTile rows={aggregates.byProject} />
            </BentoCell>
          </>
        )}
      </BentoGrid>
    </main>
  );
}
