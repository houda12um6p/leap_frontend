import React from 'react';
import { TOKENS, FONT_MONO } from '../../styles/tokens';

const SEVERITY_MAP = {
  low:      { c: TOKENS.low,    bg: TOKENS.lowSoft,    label: 'Low' },
  medium:   { c: TOKENS.med,    bg: TOKENS.medSoft,    label: 'Medium' },
  high:     { c: TOKENS.warn,   bg: TOKENS.warnSoft,   label: 'High' },
  critical: { c: TOKENS.danger, bg: TOKENS.dangerSoft, label: 'Critical' },
} as const;

type SeverityLevel = keyof typeof SEVERITY_MAP;

export function SeverityPill({ level }: { level: string }) {
  const s = SEVERITY_MAP[level as SeverityLevel] ?? SEVERITY_MAP.low;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 9px',
      background: s.bg,
      color: s.c,
      border: `1px solid ${s.c}33`,
      borderRadius: 999,
      fontSize: 10.5,
      fontWeight: 600,
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      fontFamily: FONT_MONO,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.c, flexShrink: 0 }} />
      {s.label}
    </span>
  );
}
