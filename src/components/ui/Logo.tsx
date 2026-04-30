import React from 'react';
import { TOKENS, FONT } from '../../styles/tokens';

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: size, height: size, borderRadius: 8,
        background: TOKENS.accent,
        display: 'grid', placeItems: 'center',
        boxShadow: '0 0 0 1px rgba(0,168,107,0.4), inset 0 1px 0 rgba(255,255,255,0.18)',
      }}>
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
          <path d="M4 18 L9 12 L13 15 L20 6" stroke="#0B1F3A" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="20" cy="6" r="1.8" fill="#0B1F3A" />
        </svg>
      </div>
      <div style={{ fontFamily: FONT, color: TOKENS.text, lineHeight: 1 }}>
        <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 0.5 }}>LEAP</div>
      </div>
    </div>
  );
}
