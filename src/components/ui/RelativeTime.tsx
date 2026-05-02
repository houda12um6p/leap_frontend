import React from 'react';
import { TOKENS, FONT_MONO } from '../../styles/tokens';

function relative(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const diff = (Date.now() - d.getTime()) / 1000;
  const future = diff < 0;
  const a = Math.abs(diff);
  const fmt = (n: number, unit: string) => `${Math.round(n)}${unit}`;
  let label: string;
  if (a < 45) label = 'just now';
  else if (a < 60 * 60) label = fmt(a / 60, 'm');
  else if (a < 60 * 60 * 24) label = fmt(a / 3600, 'h');
  else if (a < 60 * 60 * 24 * 30) label = fmt(a / 86400, 'd');
  else if (a < 60 * 60 * 24 * 365) label = fmt(a / (86400 * 30), 'mo');
  else label = fmt(a / (86400 * 365), 'y');
  if (label === 'just now') return label;
  return future ? `in ${label}` : `${label} ago`;
}

export function RelativeTime({ iso, style }: { iso: string | null | undefined; style?: React.CSSProperties }) {
  if (!iso) return null;
  const full = new Date(iso).toLocaleString();
  return (
    <time
      dateTime={iso}
      title={full}
      style={{
        fontFamily: FONT_MONO, fontSize: 10.5, color: TOKENS.textFaint,
        letterSpacing: 0.3, ...style,
      }}
    >
      {relative(iso)}
    </time>
  );
}
