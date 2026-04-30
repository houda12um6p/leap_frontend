import React, { useState } from 'react';
import { TOKENS, FONT } from '../../styles/tokens';

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  full?: boolean;
}

export function PrimaryButton({ children, onClick, type = 'button', disabled, full }: PrimaryButtonProps) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: full ? '100%' : 'auto',
        padding: '11px 18px',
        background: disabled ? 'rgba(0,168,107,0.4)' : (hover ? '#00C27C' : TOKENS.accent),
        color: '#03130A',
        border: 'none',
        borderRadius: 8,
        fontFamily: FONT,
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: -0.1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s',
        boxShadow: hover ? '0 4px 14px rgba(0,168,107,0.35)' : '0 1px 0 rgba(255,255,255,0.12) inset',
      }}
    >
      {children}
    </button>
  );
}

interface GhostButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}

export function GhostButton({ children, onClick, danger }: GhostButtonProps) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '7px 13px',
        background: hover ? 'rgba(255,255,255,0.06)' : 'transparent',
        color: danger ? TOKENS.danger : TOKENS.textDim,
        border: `1px solid ${danger ? 'rgba(229,72,77,0.4)' : TOKENS.border}`,
        borderRadius: 7,
        fontFamily: FONT,
        fontSize: 12,
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  );
}

interface OutlineGreenButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function OutlineGreenButton({ children, onClick, disabled }: OutlineGreenButtonProps) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '7px 14px',
        background: disabled ? 'transparent' : (hover ? TOKENS.accentSoft : 'transparent'),
        color: disabled ? TOKENS.textFaint : TOKENS.accent,
        border: `1px solid ${disabled ? TOKENS.border : 'rgba(0,168,107,0.5)'}`,
        borderRadius: 6,
        fontFamily: FONT,
        fontSize: 12,
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  );
}
