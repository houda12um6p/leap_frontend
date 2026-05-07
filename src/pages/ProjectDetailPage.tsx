import React, { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  useProject,
  useProjectOverview,
  useDeveloperScores,
  useProjectMergeRequests,
  useJiraTasks,
} from '../lib/api';
import { ProjectHeader } from '../components/project-detail/ProjectHeader';
import { TeamRoster } from '../components/project-detail/TeamRoster';
import { JiraPanel } from '../components/project-detail/JiraPanel';
import { PRLedger } from '../components/project-detail/PRLedger';
import { CardShell } from '../components/dashboard/CardShell';
import { CardSkeleton } from '../components/dashboard/CardSkeleton';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const projectQ = useProject(id);
  const overviewQ = useProjectOverview(id);
  const devsQ = useDeveloperScores(id);
  const prsQ = useProjectMergeRequests(id);
  const jiraQ = useJiraTasks(id);

  // Surface backend errors as toasts.
  useEffect(() => {
    const errors: Array<[string, boolean, unknown]> = [
      ['project',         projectQ.isError,  projectQ.error    ],
      ['overview',        overviewQ.isError, overviewQ.error   ],
      ['developers',      devsQ.isError,     devsQ.error       ],
      ['merge requests',  prsQ.isError,      prsQ.error        ],
      ['jira tasks',      jiraQ.isError,     jiraQ.error       ],
    ];
    errors.filter(([, e]) => e).forEach(([label, , err]) => {
      toast.error(`Could not load ${label}.`, {
        description: (err as Error)?.message ?? 'Network error.',
      });
    });
  }, [projectQ.isError, overviewQ.isError, devsQ.isError, prsQ.isError, jiraQ.isError,
      projectQ.error, overviewQ.error, devsQ.error, prsQ.error, jiraQ.error]);

  if (!id) return <Navigate to="/projects" replace />;
  const project = projectQ.data;
  if (projectQ.isLoading) return <Loading />;
  if (!project) return <Navigate to="/projects" replace />;

  return (
    <main className="dashboard-shell">
      <ProjectHeader project={project} overview={overviewQ.data ?? null} />

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        className="leap-detail-grid"
      >
        {/* left column — team only */}
        <div className="leap-detail-col-left">
          <TeamRoster developers={devsQ.data ?? []} />
        </div>

        {/* right column — PR ledger then Jira (matching width) */}
        <div className="leap-detail-col-right">
          <CardShell interactive={false} style={{ padding: 22 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: "'Geist Mono', monospace",
              fontSize: 10, letterSpacing: '0.22em',
              textTransform: 'uppercase', color: 'var(--leap-text-faint)',
              marginBottom: 14,
            }}>
              PR &amp; commit ledger
              <span style={{ marginLeft: 'auto', color: 'var(--leap-text-dim)' }}>
                {prsQ.data?.length ?? 0} pull requests · sorted by score
              </span>
            </div>
            {prsQ.isLoading
              ? <Loading inline />
              : <PRLedger prs={prsQ.data ?? []} />
            }
          </CardShell>

          <div style={{ height: 18 }} />

          <JiraPanel tasks={jiraQ.data ?? []} />
        </div>
      </motion.section>
    </main>
  );
}

function Loading({ inline }: { inline?: boolean }) {
  return (
    <div style={{
      padding: inline ? 0 : 80,
      display: 'grid',
      placeItems: 'center',
      fontFamily: "'Geist Mono', monospace",
      fontSize: 11,
      letterSpacing: '0.32em',
      textTransform: 'uppercase',
      color: 'var(--leap-text-faint)',
    }}>
      Loading…
    </div>
  );
}
