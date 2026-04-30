import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TOKENS, FONT, FONT_MONO } from '../../styles/tokens';
import { Logo } from '../ui/Logo';
import { Avatar } from '../ui/Avatar';
import { User } from '../../types';

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" /><line x1="20" y1="20" x2="16.5" y2="16.5" />
  </svg>
);

function NavItem({ label, to, active, badge }: { label: string; to: string; active: boolean; badge?: number }) {
  const [hover, setHover] = useState(false);
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%',
        display: 'flex', alignItems: 'center', gap: 11,
        padding: '9px 12px',
        background: active ? TOKENS.accentSoft : (hover ? 'rgba(255,255,255,0.04)' : 'transparent'),
        border: 'none',
        borderRadius: 8,
        color: active ? TOKENS.accent : (hover ? TOKENS.text : TOKENS.textDim),
        fontFamily: FONT,
        fontSize: 13.5,
        fontWeight: active ? 500 : 400,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.12s',
        position: 'relative',
      }}
    >
      {active && (
        <div style={{
          position: 'absolute', left: -16, top: 8, bottom: 8, width: 2,
          background: TOKENS.accent, borderRadius: 2,
        }} />
      )}
      <span style={{ flex: 1 }}>{label}</span>
      {badge != null && (
        <span style={{
          minWidth: 18, height: 18, padding: '0 5px',
          background: badge > 0 ? TOKENS.danger : 'rgba(255,255,255,0.08)',
          color: badge > 0 ? '#fff' : TOKENS.textDim,
          borderRadius: 9, fontSize: 10.5, fontWeight: 600,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: FONT_MONO,
        }}>{badge}</span>
      )}
    </button>
  );
}

interface SidebarProps {
  user: User;
  alertCount: number;
}

export function Sidebar({ user, alertCount }: SidebarProps) {
  const location = useLocation();
  const active = location.pathname.startsWith('/projects') ? 'projects'
    : location.pathname.startsWith('/alerts') ? 'alerts'
    : 'dashboard';

  return (
    <aside style={{
      width: 256,
      background: TOKENS.bg,
      borderRight: `1px solid ${TOKENS.border}`,
      display: 'flex', flexDirection: 'column',
      padding: '20px 16px',
      flexShrink: 0,
    }}>
      <div style={{ padding: '4px 4px 18px' }}>
        <Logo />
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 11px',
        background: '#081832',
        border: `1px solid ${TOKENS.border}`,
        borderRadius: 7,
        color: TOKENS.textFaint,
        fontFamily: FONT, fontSize: 12.5,
        marginBottom: 18,
      }}>
        <SearchIcon />
        <span style={{ flex: 1 }}>Search…</span>
        <span style={{ fontFamily: FONT_MONO, fontSize: 10, padding: '1px 5px', borderRadius: 4, background: 'rgba(255,255,255,0.06)' }}>⌘K</span>
      </div>

      <div style={{ fontFamily: FONT_MONO, fontSize: 9.5, color: TOKENS.textFaint, letterSpacing: 1.5, padding: '0 4px 8px' }}>
        WORKSPACE
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <NavItem label="Dashboard" to="/"         active={active === 'dashboard'} />
        <NavItem label="Projects"  to="/projects" active={active === 'projects'} />
        <NavItem label="Alerts"    to="/alerts"   active={active === 'alerts'} badge={alertCount} />
      </nav>

      <div style={{ flex: 1 }} />

      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: 10,
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${TOKENS.border}`,
        borderRadius: 10,
      }}>
        <Avatar name={user.name} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: FONT, fontSize: 12.5, color: TOKENS.text, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user.name}
          </div>
        </div>
      </div>
    </aside>
  );
}
