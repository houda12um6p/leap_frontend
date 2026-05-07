import React from 'react';
import { CardShell } from '../dashboard/CardShell';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { DeveloperScore, scoreBand, avgScore } from '../../lib/types';

interface Props {
  developers: DeveloperScore[];
}

export function TeamRoster({ developers }: Props) {
  if (developers.length === 0) {
    return (
      <CardShell interactive={false} style={{ padding: 22 }}>
        <div style={{
          fontFamily: "'Geist Mono', monospace",
          fontSize: 10, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: 'var(--leap-text-faint)',
          marginBottom: 12,
        }}>
          Team roster
        </div>
        <div style={{ color: 'var(--leap-text-dim)', fontSize: 13.5, lineHeight: 1.5 }}>
          No developer activity yet on this project. Sync GitHub to populate the roster.
        </div>
      </CardShell>
    );
  }

  const sorted = [...developers].sort((a, b) => b.total_score - a.total_score);

  return (
    <CardShell interactive={false} style={{ padding: 22 }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        fontFamily: "'Geist Mono', monospace",
        fontSize: 10, letterSpacing: '0.22em',
        textTransform: 'uppercase', color: 'var(--leap-text-faint)',
        marginBottom: 14,
      }}>
        Team roster
        <span style={{ marginLeft: 'auto', color: 'var(--leap-text-dim)' }}>
          {sorted.length} engineers
        </span>
      </div>

      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sorted.map((d) => {
          const avg = avgScore(d);              // tone band uses per-MR average (0..1000)
          const tone = scoreBand(avg);
          const initials = d.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
          const pct = Math.max(2, Math.min(100, (avg / 1000) * 100));
          return (
            <li key={d.user_id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                width: 36, height: 36, borderRadius: 999,
                display: 'grid', placeItems: 'center',
                background: `linear-gradient(135deg, ${tone.soft}, ${tone.faint})`,
                color: tone.tone,
                fontFamily: "'Geist Mono', monospace",
                fontSize: 12, fontWeight: 600,
                border: `1px solid ${tone.soft}`,
                flex: '0 0 auto',
              }}>
                {initials}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13.5, fontWeight: 500,
                  color: 'var(--leap-text)',
                  letterSpacing: '-0.005em',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {d.name}
                </div>
                <div style={{
                  marginTop: 4,
                  height: 4, borderRadius: 4,
                  background: 'var(--leap-surface-wash)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${pct}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${tone.tone}, ${tone.soft})`,
                  }} />
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <AnimatedNumber
                  value={Math.round(d.total_score)}
                  style={{
                    fontFamily: "'Geist', system-ui",
                    fontSize: 16, fontWeight: 500,
                    color: tone.tone,
                    letterSpacing: '-0.02em',
                  }}
                />
                <div style={{
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: 9.5, color: 'var(--leap-text-faint)',
                  letterSpacing: '0.10em',
                }}>
                  {d.merge_request_count} MRs · avg {Math.round(avg)}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </CardShell>
  );
}
