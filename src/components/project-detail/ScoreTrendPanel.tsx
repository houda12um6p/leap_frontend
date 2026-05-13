import React, { useMemo, useState } from 'react';
import { CardShell } from '../dashboard/CardShell';
import { TrendUpIcon } from '../ui/Icon';
import type { TimelinePoint } from '../../lib/types';

interface Props {
  points: TimelinePoint[];
  isLoading?: boolean;
}

type Metric = 'avg' | 'total';

const PAD_X = 36;
const PAD_Y = 24;
const VIEW_W = 800;
const VIEW_H = 220;

export function ScoreTrendPanel({ points, isLoading }: Props) {
  const [metric, setMetric] = useState<Metric>('avg');

  const series = useMemo(() => {
    const ordered = [...points].sort((a, b) => a.week.localeCompare(b.week));
    return ordered.map((p) => {
      const avg = p.merge_request_count > 0 ? p.total_score / p.merge_request_count : 0;
      return { week: p.week, total: p.total_score, count: p.merge_request_count, avg };
    });
  }, [points]);

  const values = series.map((s) => (metric === 'avg' ? s.avg : s.total));
  const max = values.length > 0 ? Math.max(...values) : 0;
  const min = values.length > 0 ? Math.min(...values) : 0;
  const range = max - min || 1;

  const xFor = (i: number) =>
    series.length <= 1
      ? VIEW_W / 2
      : PAD_X + (i * (VIEW_W - PAD_X * 2)) / (series.length - 1);

  const yFor = (v: number) =>
    VIEW_H - PAD_Y - ((v - min) / range) * (VIEW_H - PAD_Y * 2);

  const linePath = series
    .map((s, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i).toFixed(1)} ${yFor(metric === 'avg' ? s.avg : s.total).toFixed(1)}`)
    .join(' ');

  const areaPath = series.length > 0
    ? `${linePath} L ${xFor(series.length - 1).toFixed(1)} ${VIEW_H - PAD_Y} L ${xFor(0).toFixed(1)} ${VIEW_H - PAD_Y} Z`
    : '';

  return (
    <CardShell interactive={false} style={{ padding: 22 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        fontFamily: "'Geist Mono', monospace",
        fontSize: 10, letterSpacing: '0.22em',
        textTransform: 'uppercase', color: 'var(--leap-text-faint)',
        marginBottom: 14,
      }}>
        <TrendUpIcon size={12} />
        Score evolution · weekly

        <div style={{ marginLeft: 'auto', display: 'inline-flex', gap: 4 }}>
          <ToggleChip selected={metric === 'avg'}   onClick={() => setMetric('avg')}>Avg PR score</ToggleChip>
          <ToggleChip selected={metric === 'total'} onClick={() => setMetric('total')}>Total points</ToggleChip>
        </div>
      </div>

      {isLoading ? (
        <Placeholder text="Loading timeline…" />
      ) : series.length === 0 ? (
        <Placeholder text="No merge requests in range yet." />
      ) : (
        <>
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            preserveAspectRatio="none"
            style={{ width: '100%', height: 220, display: 'block' }}
            role="img"
            aria-label={`Weekly ${metric === 'avg' ? 'average PR score' : 'total score'} trend`}
          >
            <defs>
              <linearGradient id="leap-trend-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--leap-accent-cyan)" stopOpacity="0.32" />
                <stop offset="100%" stopColor="var(--leap-accent-cyan)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {[0, 0.25, 0.5, 0.75, 1].map((t) => {
              const y = PAD_Y + t * (VIEW_H - PAD_Y * 2);
              return (
                <line
                  key={t}
                  x1={PAD_X} x2={VIEW_W - PAD_X}
                  y1={y} y2={y}
                  stroke="var(--leap-border-soft)"
                  strokeDasharray="2 4"
                />
              );
            })}

            <path d={areaPath} fill="url(#leap-trend-fill)" />
            <path
              d={linePath}
              fill="none"
              stroke="var(--leap-accent-cyan)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {series.map((s, i) => {
              const v = metric === 'avg' ? s.avg : s.total;
              return (
                <g key={s.week}>
                  <circle
                    cx={xFor(i)} cy={yFor(v)} r={3.2}
                    fill="var(--leap-card-bg)"
                    stroke="var(--leap-accent-cyan)"
                    strokeWidth="1.6"
                  />
                  <title>{`${s.week} · ${Math.round(v)} (${s.count} MR${s.count === 1 ? '' : 's'})`}</title>
                </g>
              );
            })}
          </svg>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 8,
            fontFamily: "'Geist Mono', monospace",
            fontSize: 10,
            color: 'var(--leap-text-faint)',
            letterSpacing: '0.10em',
          }}>
            <span>{series[0]?.week}</span>
            {series.length > 2 && (
              <span>{series[Math.floor(series.length / 2)]?.week}</span>
            )}
            <span>{series[series.length - 1]?.week}</span>
          </div>
        </>
      )}
    </CardShell>
  );
}

function ToggleChip({
  selected, onClick, children,
}: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      style={{
        padding: '5px 10px',
        borderRadius: 999,
        border: `1px solid ${selected ? 'rgba(94, 234, 212, 0.55)' : 'var(--leap-border)'}`,
        background: selected ? 'rgba(94, 234, 212, 0.10)' : 'var(--leap-card-bg)',
        color: selected ? 'var(--leap-text)' : 'var(--leap-text-dim)',
        fontFamily: "'Geist Mono', monospace",
        fontSize: 9.5,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

function Placeholder({ text }: { text: string }) {
  return (
    <div style={{
      padding: '40px 12px',
      textAlign: 'center',
      borderRadius: 12,
      border: '1px dashed var(--leap-border-soft)',
      color: 'var(--leap-text-faint)',
      fontFamily: "'Geist Mono', monospace",
      fontSize: 11,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
    }}>
      {text}
    </div>
  );
}
