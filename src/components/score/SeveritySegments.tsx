import React from 'react';
import { Severity, severityColor, severityLabel } from '../../lib/types';

interface Props {
  counts: Record<Severity, number>;
  size?: 'sm' | 'md';
}

const ORDER: Severity[] = [5, 3, 1, 0];

/**
 * Segmented bar of review-comment severity counts.
 * Each colored block scales with its count; blocks of zero render as a thin
 * dim sliver so the categories remain visible.
 */
export function SeveritySegments({ counts, size = 'md' }: Props) {
  const total = ORDER.reduce<number>((s, k) => s + counts[k], 0);

  const h = size === 'sm' ? 6 : 10;
  return (
    <div>
      <div style={{
        display: 'flex',
        height: h,
        borderRadius: h,
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--leap-border-soft)',
      }}>
        {ORDER.map((sev) => {
          const c = counts[sev];
          const pct = total > 0 ? (c / total) * 100 : 0;
          const minSliver = c === 0 ? 2 : Math.max(8, pct);
          const color = severityColor(sev);
          return (
            <div
              key={sev}
              title={`${c} × ${severityLabel(sev)}`}
              style={{
                flex: c > 0 ? `${minSliver} 0 0%` : `${minSliver}px 0 0`,
                background: c > 0
                  ? `linear-gradient(180deg, ${color}cc 0%, ${color}55 100%)`
                  : `${color}11`,
                borderRight: '1px solid rgba(0,0,0,0.35)',
              }}
            />
          );
        })}
      </div>

      {/* legend */}
      {size === 'md' && (
        <div style={{
          marginTop: 8,
          display: 'flex',
          gap: 14,
          flexWrap: 'wrap',
          fontFamily: "'Geist Mono', monospace",
          fontSize: 10,
          letterSpacing: '0.12em',
          color: 'var(--leap-text-faint)',
          textTransform: 'uppercase',
        }}>
          {ORDER.map((sev) => (
            <span key={sev} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: severityColor(sev) }} />
              {severityLabel(sev)} · w{sev} · {counts[sev]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
