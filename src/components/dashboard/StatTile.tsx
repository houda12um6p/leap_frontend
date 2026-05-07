import React from 'react';
import { CardShell } from './CardShell';
import { AnimatedNumber } from '../ui/AnimatedNumber';

interface Props {
  label: string;
  value: number;
  unit?: string;
  hint?: string;
  accent?: string;
  format?: (n: number) => string;
}

export function StatTile({
  label, value, unit, hint, accent = '#5eead4', format,
}: Props) {
  return (
    <CardShell interactive={false} style={{ padding: 22, height: '100%' }}>
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: "'Geist Mono', monospace",
          fontSize: 10, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: 'var(--leap-text-faint)',
        }}
      >
        <span
          style={{
            width: 6, height: 6, borderRadius: 999,
            background: accent, boxShadow: `0 0 10px ${accent}66`,
          }}
        />
        {label}
      </div>
      <div style={{ marginTop: 14, display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <AnimatedNumber
          value={value}
          format={format}
          style={{
            fontFamily: "'Geist', system-ui",
            fontSize: 44,
            fontWeight: 600,
            letterSpacing: '-0.04em',
            lineHeight: 0.95,
            background: `linear-gradient(180deg, #ffffff 0%, ${accent} 130%)`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        />
        {unit && (
          <span
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: 11,
              color: 'var(--leap-text-faint)',
              letterSpacing: '0.16em',
            }}
          >
            {unit}
          </span>
        )}
      </div>
      {hint && (
        <div
          style={{
            marginTop: 10,
            fontSize: 12,
            color: 'var(--leap-text-dim)',
            lineHeight: 1.45,
          }}
        >
          {hint}
        </div>
      )}
    </CardShell>
  );
}
