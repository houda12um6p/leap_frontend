import React from 'react';
import { TOKENS, FONT } from '../../styles/tokens';
import { Avatar } from '../ui/Avatar';
import { GhostButton } from '../ui/Button';
import { User } from '../../types';

const BellIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.7 21a2 2 0 0 1-3.4 0" />
  </svg>
);

interface HeaderProps {
  title: string;
  subtitle?: string;
  user: User;
  right?: React.ReactNode;
  onLogout: () => void;
}

export function Header({ title, subtitle, user, right, onLogout }: HeaderProps) {
  return (
    <header style={{
      height: 64,
      borderBottom: `1px solid ${TOKENS.border}`,
      padding: '0 28px',
      display: 'flex', alignItems: 'center', gap: 16,
      flexShrink: 0,
      background: TOKENS.bg,
    }}>
      <div style={{ flex: 1 }}>
        <h1 style={{ margin: 0, color: TOKENS.text, fontFamily: FONT, fontSize: 18, fontWeight: 600, letterSpacing: -0.3 }}>
          {title}
        </h1>
        {subtitle && (
          <div style={{ fontSize: 12, color: TOKENS.textDim, marginTop: 2, fontFamily: FONT }}>{subtitle}</div>
        )}
      </div>

      {right}

      <div style={{
        width: 32, height: 32, display: 'grid', placeItems: 'center',
        borderRadius: 7, color: TOKENS.textDim, cursor: 'pointer',
        border: `1px solid ${TOKENS.border}`,
        position: 'relative',
      }}>
        <BellIcon />
        <span style={{
          position: 'absolute', top: 6, right: 6,
          width: 6, height: 6, borderRadius: '50%', background: TOKENS.danger,
          border: `1.5px solid ${TOKENS.bg}`,
        }} />
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 9,
        padding: '4px 4px 4px 10px',
        border: `1px solid ${TOKENS.border}`, borderRadius: 999,
      }}>
        <span style={{ fontFamily: FONT, fontSize: 12.5, color: TOKENS.textDim }}>{user.email}</span>
        <Avatar name={user.name} size={26} />
      </div>

      <GhostButton onClick={onLogout}>Logout</GhostButton>
    </header>
  );
}
