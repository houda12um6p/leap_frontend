import React from 'react';
import { CardShell } from './CardShell';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { TrendUpIcon } from '../ui/Icon';
import { scoreBand, DeveloperScore } from '../../lib/types';

interface Props {
  developers: DeveloperScore[];
}

export function TopDevelopersTile({ developers }: Props) {
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
          const tone = scoreBand(d.total_score);
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
                  background: `linear-gradient(135deg, ${tone.tone}33, ${tone.tone}11)`,
                  color: tone.tone,
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: 11, fontWeight: 600,
                  border: `1px solid ${tone.tone}33`,
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
                  {d.merge_request_count} MRs
                </span>
              </span>
              <AnimatedNumber
                value={Math.round(d.total_score)}
                style={{
                  fontFamily: "'Geist', system-ui",
                  fontSize: 18, fontWeight: 500,
                  letterSpacing: '-0.02em',
                  color: tone.tone,
                }}
              />
            </li>
          );
        })}
      </ul>
    </CardShell>
  );
}
