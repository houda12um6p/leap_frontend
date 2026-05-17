import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useProjects, usePerProjectBundles } from '../lib/api';
import { BentoGrid, BentoCell } from '../components/dashboard/BentoGrid';
import { StatTile } from '../components/dashboard/StatTile';
import { TopDevelopersTile } from '../components/dashboard/TopDevelopersTile';
import { CriticalFeedTile } from '../components/dashboard/CriticalFeedTile';
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

    // Merge developers across projects.
    // Backend returns total_score as the SUM of MR scores within a project,
    // so combining across projects = sum of per-project sums. merge_request_count
    // also adds. The per-MR average (used downstream for tone-coding) is then
    // total / mrs regardless of how many projects contributed.
    const devMap = new Map<string, { d: DeveloperScore; total: number; mrs: number }>();
    activeBundles.forEach(({ scores }) => {
      scores.forEach((d) => {
        const e = devMap.get(d.user_id) ?? { d, total: 0, mrs: 0 };
        e.total += d.total_score;
        e.mrs   += d.merge_request_count;
        e.d = d;
        devMap.set(d.user_id, e);
      });
    });
    const globalDevs: DeveloperScore[] = Array.from(devMap.values()).map(({ d, total, mrs }) => ({
      ...d,
      total_score: total,
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

    return { activeProjects, globalDevs, criticalPRs, totalMRs, totalOpenMRs, totalAlerts, totalEngineers };
  }, [projects, bundles]);

  const isInitialLoad = projectsQ.isLoading || (projects.length > 0 && bundles.every((b) => b.isLoading));

  const plural = (n: number, word: string): string =>
    n === 1 ? `1 ${word}` : `${n} ${word}s`;

  const getWeekNumber = (d: Date): number => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };
  const now = new Date();
  const days: string[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const months: string[] = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const dateStrip = `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]} · ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} · W${getWeekNumber(now)}`;

  return (
    <main className="dashboard-shell">
      <div className="leap-date-bar">{dateStrip}</div>
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
             
          </div>
          <h1 style={{
            margin: 0,
            fontSize: 'clamp(36px, 4.4vw, 56px)',
            fontWeight: 600,
            letterSpacing: '-0.04em',
            lineHeight: 1.3,
            padding: '0.15em 0.2em 0.18em 0',
            background: 'linear-gradient(180deg, var(--leap-text) 0%, var(--leap-text-dim) 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            overflow: 'visible',
          }}>
            Today’s <em style={{
              fontFamily: "'Instrument Serif', serif",
              fontStyle: 'italic',
              fontWeight: 400,
              display: 'inline-block',
              padding: '0 0.1em 0.05em 0.05em',
              background: 'linear-gradient(180deg, var(--leap-accent-cyan) 0%, var(--leap-accent-amber) 130%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}>signal.</em>
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
                unit={aggregates.activeProjects.length === 1 ? 'repo' : 'repos'}
                accent="var(--leap-accent-cyan)"
                hint={plural(aggregates.totalMRs, 'merge request') + ' across active projects'}
              />
            </BentoCell>
            <BentoCell col={3} colMd={6}>
              <StatTile
                label="Engineers"
                value={aggregates.totalEngineers}
                unit={aggregates.totalEngineers === 1 ? 'engineer' : 'engineers'}
                accent="var(--leap-accent-purple)"
                hint="Developers with at least one MR in this project set."
              />
            </BentoCell>
            <BentoCell col={3} colMd={6}>
              <StatTile
                label="Open MRs"
                value={aggregates.totalOpenMRs}
                unit="in-flight"
                accent="var(--leap-accent-amber)"
              />
            </BentoCell>
            <BentoCell col={3} colMd={6}>
              <StatTile
                label="Alerts"
                value={aggregates.totalAlerts}
                unit="unresolved"
                accent={aggregates.totalAlerts > 0 ? 'var(--leap-accent-warn)' : 'var(--leap-accent-cyan)'}
                hint={aggregates.totalAlerts > 0 ? 'Inspect each project to triage.' : 'No critical alerts.'}
              />
            </BentoCell>

            <BentoCell col={6} row={2} colMd={12}>
              <TopDevelopersTile developers={aggregates.globalDevs} />
            </BentoCell>
            <BentoCell col={6} row={2} colMd={12}>
              <CriticalFeedTile prs={aggregates.criticalPRs} />
            </BentoCell>

          </>
        )}
      </BentoGrid>
    </main>
  );
}
