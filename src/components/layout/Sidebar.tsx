import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TOKENS, FONT, FONT_MONO } from '../../styles/tokens';
import { Logo } from '../ui/Logo';
import { Avatar } from '../ui/Avatar';
import { User } from '../../types';

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false">
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
      aria-current={active ? 'page' : undefined}
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
        <div aria-hidden style={{
          position: 'absolute', left: -16, top: 8, bottom: 8, width: 2,
          background: TOKENS.accent, borderRadius: 2,
        }} />
      )}
      <span style={{ flex: 1 }}>{label}</span>
      {badge != null && (
        <span aria-label={`${badge} open`} style={{
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
  search?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
}

export function Sidebar({ user, alertCount, search, onSearchChange, searchPlaceholder }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const active = location.pathname.startsWith('/projects') ? 'projects'
    : location.pathname.startsWith('/alerts') ? 'alerts'
    : location.pathname.startsWith('/merge-requests') ? 'projects'
    : 'dashboard';

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (onSearchChange) inputRef.current?.focus();
        else navigate('/projects');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onSearchChange, navigate]);

  const searchActive = !!onSearchChange;

  return (
    <aside className="leap-sidebar" aria-label="Primary navigation" style={{
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
        padding: '4px 11px',
        background: '#081832',
        border: `1px solid ${searchActive ? TOKENS.borderStrong : TOKENS.border}`,
        borderRadius: 7,
        color: TOKENS.textFaint,
        fontFamily: FONT, fontSize: 12.5,
        marginBottom: 18,
        cursor: searchActive ? 'text' : 'default',
        opacity: searchActive ? 1 : 0.55,
      }}
        onClick={() => searchActive && inputRef.current?.focus()}
      >
        <SearchIcon />
        <input
          ref={inputRef}
          type="search"
          aria-label="Search this page"
          placeholder={searchPlaceholder || (searchActive ? 'Search…' : 'Search not available here')}
          value={search ?? ''}
          onChange={(e) => onSearchChange?.(e.target.value)}
          disabled={!searchActive}
          style={{
            flex: 1, minWidth: 0,
            padding: '4px 0',
            background: 'transparent', border: 'none', outline: 'none',
            color: TOKENS.text, fontFamily: FONT, fontSize: 12.5,
          }}
        />
        <span aria-hidden style={{ fontFamily: FONT_MONO, fontSize: 10, padding: '1px 5px', borderRadius: 4, background: 'rgba(255,255,255,0.06)' }}>⌘K</span>
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
          {user.role && (
            <div style={{ fontFamily: FONT_MONO, fontSize: 9.5, color: TOKENS.textFaint, letterSpacing: 0.6, marginTop: 2, textTransform: 'uppercase' }}>
              {user.role}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
