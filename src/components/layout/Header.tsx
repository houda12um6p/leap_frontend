import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TOKENS, FONT, FONT_MONO } from '../../styles/tokens';
import { Avatar } from '../ui/Avatar';
import { GhostButton } from '../ui/Button';
import { User } from '../../types';

const BellIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false">
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.7 21a2 2 0 0 1-3.4 0" />
  </svg>
);

interface HeaderProps {
  title: string;
  subtitle?: string;
  user: User;
  alertCount: number;
  right?: React.ReactNode;
  onLogout: () => void;
}

export function Header({ title, subtitle, user, alertCount, right, onLogout }: HeaderProps) {
  const navigate = useNavigate();
  const hasAlerts = alertCount > 0;

  return (
    <header className="leap-header" style={{
      height: 64,
      borderBottom: `1px solid ${TOKENS.border}`,
      padding: '0 28px',
      display: 'flex', alignItems: 'center', gap: 16,
      flexShrink: 0,
      background: TOKENS.bg,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ margin: 0, color: TOKENS.text, fontFamily: FONT, fontSize: 18, fontWeight: 600, letterSpacing: -0.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </h1>
        {subtitle && (
          <div style={{ fontSize: 12, color: TOKENS.textDim, marginTop: 2, fontFamily: FONT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{subtitle}</div>
        )}
      </div>

      {right}

      <button
        onClick={() => navigate('/alerts')}
        aria-label={hasAlerts ? `${alertCount} open alerts. Open alerts page.` : 'No open alerts. Open alerts page.'}
        title={hasAlerts ? `${alertCount} open alert${alertCount === 1 ? '' : 's'}` : 'No open alerts'}
        style={{
          width: 32, height: 32, display: 'grid', placeItems: 'center',
          borderRadius: 7, color: TOKENS.textDim, cursor: 'pointer',
          background: 'transparent',
          border: `1px solid ${TOKENS.border}`,
          position: 'relative',
        }}
      >
        <BellIcon />
        {hasAlerts && (
          <span aria-hidden style={{
            position: 'absolute',
            top: alertCount > 9 ? 2 : 6,
            right: alertCount > 9 ? 0 : 6,
            minWidth: alertCount > 9 ? 16 : 8,
            height: alertCount > 9 ? 14 : 8,
            padding: alertCount > 9 ? '0 3px' : 0,
            borderRadius: 8,
            background: TOKENS.danger,
            color: '#fff',
            fontSize: 9, fontWeight: 700, fontFamily: FONT_MONO,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            border: `1.5px solid ${TOKENS.bg}`,
          }}>{alertCount > 9 ? alertCount : ''}</span>
        )}
      </button>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 9,
        padding: '4px 4px 4px 10px',
        border: `1px solid ${TOKENS.border}`, borderRadius: 999,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.1 }}>
          <span style={{ fontFamily: FONT, fontSize: 12.5, color: TOKENS.textDim }}>{user.email}</span>
          {user.role && (
            <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: TOKENS.textFaint, letterSpacing: 0.6, textTransform: 'uppercase', marginTop: 2 }}>
              {user.role}
            </span>
          )}
        </div>
        <Avatar name={user.name} size={26} />
      </div>

      <GhostButton onClick={onLogout} ariaLabel="Sign out">Logout</GhostButton>
    </header>
  );
}
