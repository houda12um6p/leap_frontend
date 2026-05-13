import React, { useMemo, useState } from 'react';
import { CardShell } from '../dashboard/CardShell';
import { ChevronDownIcon } from '../ui/Icon';
import type { JiraTask, JiraSprint } from '../../lib/types';

const COLUMNS: Array<{ key: string; label: string; match: (s: string) => boolean; color: string }> = [
  { key: 'todo',     label: 'Backlog · To do',  match: (s) => /to ?do|backlog/i.test(s),    color: '#94a3b8' },
  { key: 'progress', label: 'In progress',       match: (s) => /progress/i.test(s),          color: '#60a5fa' },
  { key: 'review',   label: 'In review',         match: (s) => /review/i.test(s),            color: '#a78bfa' },
  { key: 'done',     label: 'Done',              match: (s) => /done|closed/i.test(s),       color: '#5eead4' },
];

interface Props {
  tasks: JiraTask[];
  sprints: JiraSprint[];
}

const ALL_SPRINTS = '__all__';

export function JiraPanel({ tasks, sprints }: Props) {
  const [sprintId, setSprintId] = useState<string>(ALL_SPRINTS);

  const derivedSprints = useMemo<JiraSprint[]>(() => {
    if (sprints.length > 0) return sprints;
    const map = new Map<string, JiraSprint>();
    tasks.forEach((t) => {
      if (t.sprint_id) {
        map.set(t.sprint_id, {
          id: t.sprint_id,
          name: t.sprint_name ?? t.sprint_id,
        });
      }
    });
    return Array.from(map.values());
  }, [sprints, tasks]);

  const filteredTasks = useMemo(() => {
    if (sprintId === ALL_SPRINTS) return tasks;
    return tasks.filter((t) => t.sprint_id === sprintId);
  }, [tasks, sprintId]);

  const buckets = COLUMNS.map((col) => ({
    ...col,
    items: filteredTasks.filter((t) => col.match(t.status)),
  }));

  const matched = new Set(buckets.flatMap((b) => b.items.map((t) => t.jira_key)));
  const orphaned = filteredTasks.filter((t) => !matched.has(t.jira_key));
  if (orphaned.length) buckets[0].items.push(...orphaned);

  return (
    <CardShell interactive={false} style={{ padding: 22 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        flexWrap: 'wrap',
        fontFamily: "'Geist Mono', monospace",
        fontSize: 10, letterSpacing: '0.22em',
        textTransform: 'uppercase', color: 'var(--leap-text-faint)',
        marginBottom: 14,
      }}>
        Jira tasks

        <div style={{
          marginLeft: 'auto',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          flexWrap: 'wrap',
        }}>
          <SprintSelect
            value={sprintId}
            sprints={derivedSprints}
            onChange={setSprintId}
          />
          <span style={{ color: 'var(--leap-text-dim)', whiteSpace: 'nowrap' }}>
            {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
              background: 'var(--leap-surface-soft)',
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
                  background: 'var(--leap-surface-soft)',
                  border: '1px solid var(--leap-border-soft)',
                  display: 'flex', flexDirection: 'column', gap: 6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: 10, letterSpacing: '0.10em',
                    color: 'var(--leap-text-dim)',
                    background: 'var(--leap-surface-wash)',
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

function SprintSelect({
  value, sprints, onChange,
}: { value: string; sprints: JiraSprint[]; onChange: (v: string) => void }) {
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Filter by sprint"
        style={{
          appearance: 'none',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          padding: '6px 28px 6px 12px',
          borderRadius: 999,
          border: '1px solid var(--leap-border)',
          background: 'var(--leap-card-bg)',
          color: 'var(--leap-text-dim)',
          fontFamily: "'Geist Mono', monospace",
          fontSize: 10.5,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          cursor: 'pointer',
        }}
      >
        <option value={ALL_SPRINTS}>All sprints</option>
        {sprints.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
      <span style={{
        position: 'absolute',
        right: 10, top: '50%',
        transform: 'translateY(-50%)',
        pointerEvents: 'none',
        color: 'var(--leap-text-faint)',
        display: 'inline-flex',
      }}>
        <ChevronDownIcon size={12} />
      </span>
    </div>
  );
}
