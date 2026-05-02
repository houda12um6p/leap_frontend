import React, { useState } from 'react';
import { TOKENS, FONT } from '../../styles/tokens';

function Spinner({ color }: { color?: string }) {
  return (
    <span
      className="leap-spinner"
      aria-hidden
      style={{ color: color ?? 'currentColor', marginRight: 8 }}
    />
  );
}

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  full?: boolean;
  ariaLabel?: string;
}

export function PrimaryButton({ children, onClick, type = 'button', disabled, loading, full, ariaLabel }: PrimaryButtonProps) {
  const [hover, setHover] = useState(false);
  const isDisabled = disabled || loading;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      aria-label={ariaLabel}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: full ? '100%' : 'auto',
        padding: '11px 18px',
        background: isDisabled ? 'rgba(0,168,107,0.4)' : (hover ? '#00C27C' : TOKENS.accent),
        color: '#03130A',
        border: 'none',
        borderRadius: 8,
        fontFamily: FONT,
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: -0.1,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s',
        boxShadow: hover && !isDisabled ? '0 4px 14px rgba(0,168,107,0.35)' : '0 1px 0 rgba(255,255,255,0.12) inset',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

interface GhostButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  ariaLabel?: string;
}

export function GhostButton({ children, onClick, danger, ariaLabel }: GhostButtonProps) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
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
  loading?: boolean;
  ariaLabel?: string;
}

export function OutlineGreenButton({ children, onClick, disabled, loading, ariaLabel }: OutlineGreenButtonProps) {
  const [hover, setHover] = useState(false);
  const isDisabled = disabled || loading;
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      aria-label={ariaLabel}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '7px 14px',
        background: isDisabled ? 'transparent' : (hover ? TOKENS.accentSoft : 'transparent'),
        color: isDisabled ? TOKENS.textFaint : TOKENS.accent,
        border: `1px solid ${isDisabled ? TOKENS.border : 'rgba(0,168,107,0.5)'}`,
        borderRadius: 6,
        fontFamily: FONT,
        fontSize: 12,
        fontWeight: 600,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}
