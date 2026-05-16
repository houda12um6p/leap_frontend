import React from 'react';
import { Link } from 'react-router-dom';
import { CardShell } from './CardShell';
import { GitBranchIcon } from '../ui/Icon';
import { MergeRequestSummary } from '../../lib/types';

type SeverityLevel = 0 | 1 | 3 | 5;

const severityFromScore = (score: number): SeverityLevel => {
  if (score >= 700) return 0;
  if (score >= 500) return 1;
  if (score >= 250) return 3;
  return 5;
};

const dotColor = (sev: SeverityLevel): string => {
  if (sev === 0) return 'var(--leap-accent-cyan)';
  if (sev === 1) return 'var(--leap-accent-amber)';
  if (sev === 3) return 'var(--leap-accent-warn)';
  return '#ff4d6d';
};

const dotShadow = (sev: SeverityLevel): string => {
  if (sev === 0) return '0 0 6px rgba(94, 234, 212, 0.50)';
  if (sev === 1) return '0 0 6px rgba(251, 191, 36, 0.50)';
  if (sev === 3) return '0 0 6px rgba(248, 113, 113, 0.50)';
  return '0 0 6px rgba(255, 77, 109, 0.60)';
};

interface Props {
  prs: Array<MergeRequestSummary & { project_name?: string }>;
}

export function CriticalFeedTile({ prs }: Props) {
  // Show the lowest-scoring 5 across projects — those most need attention.
  const ranked = [...prs].sort((a, b) => a.score - b.score).slice(0, 5);

  return (
    <CardShell tone="hero" interactive={false} style={{ padding: 24, height: '100%' }}>
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: "'Geist Mono', monospace",
          fontSize: 10, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: 'var(--leap-text-faint)',
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: 999, background: '#f87171', boxShadow: '0 0 10px #f8717177' }} />
        Critical feed · attention needed
      </div>

      <ul style={{ margin: '18px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {ranked.map((pr) => {
          const sev = severityFromScore(pr.score);
          return (
            <li key={pr.id}>
              <Link
                to={`/projects/${pr.project_id}#mr-${pr.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: '1px solid var(--leap-border-soft)',
                  background: 'var(--leap-surface-soft)',
                  transition: 'background 200ms ease, border-color 200ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--leap-surface-wash)';
                  e.currentTarget.style.borderColor = 'var(--leap-border)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--leap-surface-soft)';
                  e.currentTarget.style.borderColor = 'var(--leap-border-soft)';
                }}
              >
                <span style={{
                    width: 8, height: 8, borderRadius: 999, flexShrink: 0,
                    background: dotColor(sev),
                    boxShadow: dotShadow(sev),
                  }} />
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span style={{
                    display: 'block',
                    fontSize: 13, color: 'var(--leap-text)',
                    fontWeight: 500, letterSpacing: '-0.005em',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {pr.title}
                  </span>
                  <span style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: 10, color: 'var(--leap-text-faint)',
                    letterSpacing: '0.08em',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    flexWrap: 'wrap',
                  }}>
                    <span>
                      <GitBranchIcon size={10} style={{ verticalAlign: '-1px', marginRight: 6 }} />
                      {pr.project_name ?? pr.project_id} · {pr.author_name ?? 'unknown'}
                    </span>
                    {pr.jira_key && (
                      <span style={{
                        padding: '1px 6px',
                        borderRadius: 4,
                        border: '1px solid var(--leap-border)',
                        background: 'rgba(94, 234, 212, 0.08)',
                        color: 'var(--leap-accent-cyan)',
                        letterSpacing: '0.10em',
                      }}>
                        {pr.jira_key}
                      </span>
                    )}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </CardShell>
  );
}
