import React from 'react';
import { TOKENS, FONT } from '../../styles/tokens';

export function Avatar({ name, size = 30 }: { name: string; size?: number }) {
  const initials = name
    .split(' ')
    .map(s => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: size / 2,
      background: TOKENS.accentSoft,
      color: TOKENS.accent,
      display: 'grid', placeItems: 'center',
      fontFamily: FONT, fontWeight: 600, fontSize: size * 0.38,
      border: `1px solid rgba(0,168,107,0.3)`,
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}
