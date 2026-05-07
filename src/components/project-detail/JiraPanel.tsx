import React from 'react';
import { CardShell } from '../dashboard/CardShell';
import type { JiraTask } from '../../lib/types';

const COLUMNS: Array<{ key: string; label: string; match: (s: string) => boolean; color: string }> = [
  { key: 'todo',     label: 'Backlog · To do',  match: (s) => /to ?do|backlog/i.test(s),    color: '#94a3b8' },
  { key: 'progress', label: 'In progress',       match: (s) => /progress/i.test(s),          color: '#60a5fa' },
  { key: 'review',   label: 'In review',         match: (s) => /review/i.test(s),            color: '#a78bfa' },
  { key: 'done',     label: 'Done',              match: (s) => /done|closed/i.test(s),       color: '#5eead4' },
];

interface Props { tasks: JiraTask[]; }

export function JiraPanel({ tasks }: Props) {
  const buckets = COLUMNS.map((col) => ({
    ...col,
    items: tasks.filter((t) => col.match(t.status)),
  }));

  // unmatched fall into "Backlog"
  const matched = new Set(buckets.flatMap((b) => b.items.map((t) => t.jira_key)));
  const orphaned = tasks.filter((t) => !matched.has(t.jira_key));
  if (orphaned.length) buckets[0].items.push(...orphaned);

  return (
    <CardShell interactive={false} style={{ padding: 22 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        fontFamily: "'Geist Mono', monospace",
        fontSize: 10, letterSpacing: '0.22em',
        textTransform: 'uppercase', color: 'var(--leap-text-faint)',
        marginBottom: 14,
      }}>
        Jira tasks
        <span style={{ marginLeft: 'auto', color: 'var(--leap-text-dim)' }}>
          {tasks.length} total
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: 12,
      }}>
        {buckets.map((b) => (
          <div
            key={b.key}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              padding: 12,
              borderRadius: 12,
              border: '1px solid var(--leap-border-soft)',
              background: 'rgba(255,255,255,0.018)',
              minHeight: 120,
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: "'Geist Mono', monospace",
              fontSize: 10, letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--leap-text-faint)',
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: 999,
                background: b.color, boxShadow: `0 0 8px ${b.color}77`,
              }} />
              {b.label}
              <span style={{ marginLeft: 'auto', color: 'var(--leap-text-dim)' }}>
                {b.items.length}
              </span>
            </div>

            {b.items.map((t) => (
              <div
                key={t.jira_key}
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--leap-border-soft)',
                  display: 'flex', flexDirection: 'column', gap: 6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: 10, letterSpacing: '0.10em',
                    color: 'var(--leap-text-dim)',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--leap-border)',
                    padding: '1px 6px',
                    borderRadius: 3,
                  }}>
                    {t.jira_key}
                  </span>
                  <span style={{
                    marginLeft: 'auto',
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: 10, color: b.color,
                    letterSpacing: '0.10em',
                  }}>
                    {t.story_points}p
                  </span>
                </div>
                <div style={{
                  fontSize: 12.5, color: 'var(--leap-text)',
                  lineHeight: 1.35,
                  letterSpacing: '-0.005em',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {t.summary}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </CardShell>
  );
}
