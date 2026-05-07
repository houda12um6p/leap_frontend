import React from 'react';
import { Link } from 'react-router-dom';
import { CardShell } from './CardShell';
import { Pill } from '../ui/Pill';
import { Project, scoreBand } from '../../lib/types';

interface Row {
  project: Project;
  contributors: number;
  open_mrs: number;
  pending_tasks: number;
  project_score: number;
}

interface Props {
  rows: Row[];
}

export function ProjectsSummaryTile({ rows }: Props) {
  return (
    <CardShell tone="hero" interactive={false} style={{ padding: 24, height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          fontFamily: "'Geist Mono', monospace",
          fontSize: 10, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: 'var(--leap-text-faint)',
        }}>
          Projects
        </div>
        <Link
          to="/projects"
          style={{
            marginLeft: 'auto',
            fontFamily: "'Geist Mono', monospace",
            fontSize: 10.5, letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--leap-text-dim)',
          }}
        >
          See all →
        </Link>
      </div>

      <div style={{
        marginTop: 16,
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 12,
      }}>
        {rows.slice(0, 4).map(({ project, contributors, open_mrs, pending_tasks, project_score }) => {
          const tone = scoreBand(project_score);
          return (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                padding: 14,
                borderRadius: 12,
                border: '1px solid var(--leap-border-soft)',
                background: 'var(--leap-surface-soft)',
                transition: 'background 200ms, border-color 200ms, transform 240ms',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontSize: 13, fontWeight: 500,
                  color: 'var(--leap-text)',
                  letterSpacing: '-0.005em',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  flex: 1, minWidth: 0,
                }}>
                  {project.name}
                </span>
                <Pill color={tone.tone}>{Math.round(project_score)}</Pill>
              </div>
              <div style={{
                display: 'flex',
                gap: 14,
                fontFamily: "'Geist Mono', monospace",
                fontSize: 10.5,
                color: 'var(--leap-text-faint)',
                letterSpacing: '0.08em',
              }}>
                <span>{contributors} eng</span>
                <span>{open_mrs} open</span>
                <span>{pending_tasks} tasks</span>
              </div>
            </Link>
          );
        })}
      </div>
    </CardShell>
  );
}
