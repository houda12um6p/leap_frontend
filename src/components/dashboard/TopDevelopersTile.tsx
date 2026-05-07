import React from 'react';
import { CardShell } from './CardShell';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { TrendUpIcon } from '../ui/Icon';
import { scoreBand, DeveloperScore, avgScore } from '../../lib/types';

interface Props {
  developers: DeveloperScore[];
}

export function TopDevelopersTile({ developers }: Props) {
  // total_score is a SUM of MR scores. Sort by total (volume × quality);
  // tone-color from the per-MR average so the band still maps to 0..1000.
  const top = [...developers].sort((a, b) => b.total_score - a.total_score).slice(0, 6);

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
        <TrendUpIcon size={12} />
        Top developers · all projects
      </div>

      <ul style={{ margin: '20px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {top.map((d, i) => {
          const avg = avgScore(d);
          const tone = scoreBand(avg);
          const initials = d.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
          return (
            <li
              key={d.user_id}
              style={{
                display: 'grid',
                gridTemplateColumns: '24px 36px 1fr auto',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span
                style={{
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: 10.5,
                  color: 'var(--leap-text-faint)',
                  letterSpacing: '0.12em',
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span
                style={{
                  width: 32, height: 32, borderRadius: 999,
                  display: 'grid', placeItems: 'center',
                  background: `linear-gradient(135deg, ${tone.soft}, ${tone.faint})`,
                  color: tone.tone,
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: 11, fontWeight: 600,
                  border: `1px solid ${tone.soft}`,
                }}
              >
                {initials}
              </span>
              <span style={{ minWidth: 0 }}>
                <span style={{
                  display: 'block',
                  fontSize: 13.5, fontWeight: 500,
                  color: 'var(--leap-text)',
                  letterSpacing: '-0.005em',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {d.name}
                </span>
                <span style={{
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: 10, color: 'var(--leap-text-faint)',
                  letterSpacing: '0.06em',
                }}>
                  {d.merge_request_count} MRs · avg {Math.round(avg)}
                </span>
              </span>
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0 }}>
                <AnimatedNumber
                  value={Math.round(d.total_score)}
                  style={{
                    fontFamily: "'Geist', system-ui",
                    fontSize: 18, fontWeight: 500,
                    letterSpacing: '-0.02em',
                    color: tone.tone,
                  }}
                />
                <span style={{
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: 9, color: 'var(--leap-text-faint)',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  marginTop: -2,
                }}>
                  Σ score
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </CardShell>
  );
}
