import React from 'react';
import { TOKENS } from '../../styles/tokens';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { User } from '../../types';

interface AppShellProps {
  title: string;
  subtitle?: string;
  user: User;
  alertCount: number;
  headerRight?: React.ReactNode;
  onLogout: () => void;
  children: React.ReactNode;
  search?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
}

export function AppShell({
  title, subtitle, user, alertCount, headerRight, onLogout, children,
  search, onSearchChange, searchPlaceholder,
}: AppShellProps) {
  return (
    <div style={{
      width: '100%',
      height: '100vh',
      background: TOKENS.bg,
      display: 'flex',
      overflow: 'hidden',
    }}>
      <Sidebar
        user={user}
        alertCount={alertCount}
        search={search}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header title={title} subtitle={subtitle} user={user} alertCount={alertCount} right={headerRight} onLogout={onLogout} />
        <main className="leap-main" style={{
          flex: 1,
          padding: '28px 32px',
          overflow: 'auto',
          background: TOKENS.bg,
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}
