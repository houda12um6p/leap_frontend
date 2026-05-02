import React from 'react';
import { TOKENS, FONT_MONO } from '../../styles/tokens';

const SEVERITY_MAP = {
  low:      { c: TOKENS.low,    bg: TOKENS.lowSoft,    label: 'Low',      icon: '·' },
  medium:   { c: TOKENS.med,    bg: TOKENS.medSoft,    label: 'Medium',   icon: '!' },
  high:     { c: TOKENS.warn,   bg: TOKENS.warnSoft,   label: 'High',     icon: '!!' },
  critical: { c: TOKENS.danger, bg: TOKENS.dangerSoft, label: 'Critical', icon: '✕' },
} as const;

type SeverityLevel = keyof typeof SEVERITY_MAP;

export function SeverityPill({ level }: { level: string }) {
  const s = SEVERITY_MAP[level as SeverityLevel] ?? SEVERITY_MAP.low;
  return (
    <span
      role="status"
      aria-label={`Severity: ${s.label}`}
      style={{
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
      }}
    >
      <span aria-hidden style={{
        minWidth: 10, height: 14, borderRadius: 3,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: `${s.c}28`,
        fontSize: 10, fontWeight: 700,
        padding: '0 3px',
      }}>{s.icon}</span>
      {s.label}
    </span>
  );
}
