import React from 'react';
import { Link } from 'react-router-dom';
import { CardShell } from './CardShell';
import { Pill } from '../ui/Pill';
import { GitBranchIcon } from '../ui/Icon';
import { MergeRequestSummary, scoreBand } from '../../lib/types';

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
          const tone = scoreBand(pr.score);
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
                  background: 'rgba(255,255,255,0.02)',
                  transition: 'background 200ms ease, border-color 200ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.borderColor = 'var(--leap-border)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  e.currentTarget.style.borderColor = 'var(--leap-border-soft)';
                }}
              >
                <Pill color={tone.tone}>{Math.round(pr.score)}</Pill>
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
                  }}>
                    <GitBranchIcon size={10} style={{ verticalAlign: '-1px', marginRight: 6 }} />
                    {pr.project_name ?? pr.project_id} · {pr.author_name ?? 'unknown'}
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
