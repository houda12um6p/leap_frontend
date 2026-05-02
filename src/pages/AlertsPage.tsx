import React, { useEffect, useMemo, useState } from 'react';
import { TOKENS, FONT, FONT_MONO } from '../styles/tokens';
import { AppShell } from '../components/layout/AppShell';
import { SeverityPill } from '../components/ui/SeverityPill';
import { OutlineGreenButton } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { RelativeTime } from '../components/ui/RelativeTime';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getProjects, getAlerts, resolveAlert as apiResolveAlert } from '../services/api';
import { Alert } from '../types';

function AlertCard({ alert, onResolve, busy }: { alert: Alert; onResolve: (id: string) => void; busy: boolean }) {
  const [hover, setHover] = useState(false);
  const isResolved = alert.is_resolved;
  const severityColor = isResolved ? 'rgba(255,255,255,0.18)' : (
    alert.severity === 'critical' ? TOKENS.danger :
    alert.severity === 'high'     ? TOKENS.warn :
    alert.severity === 'medium'   ? TOKENS.med :
    TOKENS.low
  );

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: TOKENS.bgElev,
        border: `2px solid ${severityColor}`,
        boxShadow: hover && !isResolved ? `0 0 0 2px ${severityColor}55, 0 8px 24px rgba(0,0,0,0.25)` : 'none',
        borderRadius: 12, padding: '18px 20px',
        display: 'flex', alignItems: 'flex-start', gap: 18,
        opacity: isResolved ? 0.55 : 1,
        transition: 'all 0.15s',
        flexWrap: 'wrap',
      }}>
      <div style={{ flex: 1, minWidth: 220 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
          <SeverityPill level={alert.severity} />
          {isResolved && (
            <span style={{
              padding: '3px 9px', background: 'rgba(255,255,255,0.06)', color: TOKENS.textDim,
              border: `1px solid ${TOKENS.border}`, borderRadius: 999, fontSize: 10.5,
              fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase',
              fontFamily: FONT_MONO, display: 'inline-flex', alignItems: 'center', gap: 5,
            }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Resolved
            </span>
          )}
          <span style={{ marginLeft: 'auto' }}>
            <RelativeTime iso={alert.created_at} />
          </span>
        </div>
        <div style={{ fontFamily: FONT, fontSize: 14.5, color: TOKENS.text, fontWeight: 500, letterSpacing: -0.2, marginBottom: 5 }}>
          {alert.message}
        </div>
        <div style={{ fontFamily: FONT, fontSize: 12.5, color: TOKENS.textDim, lineHeight: 1.5 }}>
          {alert.type}
        </div>
      </div>
      <div style={{ flexShrink: 0 }}>
        {!isResolved
          ? <OutlineGreenButton onClick={() => onResolve(alert.id)} loading={busy}>Resolve</OutlineGreenButton>
          : <OutlineGreenButton disabled>Resolved</OutlineGreenButton>}
      </div>
    </div>
  );
}

function SeveritySummary({ level, count }: { level: string; count: number }) {
  const map: Record<string, { c: string; label: string }> = {
    low:      { c: TOKENS.low,    label: 'Low' },
    medium:   { c: TOKENS.med,    label: 'Medium' },
    high:     { c: TOKENS.warn,   label: 'High' },
    critical: { c: TOKENS.danger, label: 'Critical' },
  };
  const s = map[level];
  return (
    <div style={{ flex: 1, background: TOKENS.bgElev, border: `2px solid ${s.c}`, borderRadius: 10, padding: '14px 16px', boxShadow: `0 0 0 1px ${s.c}33` }}>
      <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: s.c, textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
        <div style={{ fontFamily: FONT, fontSize: 26, color: TOKENS.text, fontWeight: 700, letterSpacing: -0.8 }}>{count}</div>
        <div style={{ fontSize: 11, color: TOKENS.textFaint }}>open</div>
      </div>
    </div>
  );
}

type TabKey = 'open' | 'resolved' | 'all';

export function AlertsPage() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [tab, setTab] = useState<TabKey>('open');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const projs = await getProjects();
        if (cancelled) return;
        if (projs.length > 0) {
          const lists = await Promise.all(projs.map(p => getAlerts(p.id).catch(() => [] as Alert[])));
          if (cancelled) return;
          setAlerts(lists.flat());
        } else {
          setAlerts([]);
        }
      } catch (e) {
        toast.error('Could not load alerts', 'Check your connection and try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resolveAlert = async (id: string) => {
    setResolvingId(id);
    try {
      await apiResolveAlert(id);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_resolved: true } : a));
      toast.success('Alert resolved');
    } catch (e) {
      toast.error('Could not resolve alert', 'Please try again.');
    } finally {
      setResolvingId(null);
    }
  };

  const unresolved = alerts.filter(a => !a.is_resolved);
  const counts = { all: alerts.length, open: unresolved.length, resolved: alerts.length - unresolved.length };
  const filteredByTab = tab === 'open' ? unresolved : tab === 'resolved' ? alerts.filter(a => a.is_resolved) : alerts;
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return filteredByTab;
    return filteredByTab.filter(a =>
      a.message.toLowerCase().includes(q) || (a.type || '').toLowerCase().includes(q)
    );
  }, [filteredByTab, search]);

  return (
    <AppShell
      title="Alerts"
      subtitle="Engineering health signals across all repositories"
      user={user!}
      alertCount={unresolved.length}
      onLogout={logout}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search alerts…"
    >
      <div className="leap-metric-row" style={{ display: 'flex', gap: 14, marginBottom: 22 }}>
        {(['critical', 'high', 'medium', 'low'] as const).map(level => (
          <SeveritySummary
            key={level} level={level}
            count={loading ? 0 : alerts.filter(a => a.severity === level && !a.is_resolved).length}
          />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 18, borderBottom: `1px solid ${TOKENS.border}`, flexWrap: 'wrap' }}>
        {([['open', 'Open', counts.open], ['resolved', 'Resolved', counts.resolved], ['all', 'All', counts.all]] as [TabKey, string, number][]).map(([k, label, n]) => {
          const isActive = tab === k;
          return (
            <button key={k} onClick={() => setTab(k)} aria-pressed={isActive} style={{
              padding: '9px 14px', background: 'transparent', border: 'none',
              borderBottom: `2px solid ${isActive ? TOKENS.accent : 'transparent'}`,
              color: isActive ? TOKENS.text : TOKENS.textDim,
              fontFamily: FONT, fontSize: 13, fontWeight: isActive ? 600 : 400,
              cursor: 'pointer', marginBottom: -1,
              display: 'inline-flex', alignItems: 'center', gap: 7,
            }}>
              {label}
              <span style={{
                fontFamily: FONT_MONO, fontSize: 10.5, padding: '1px 6px', borderRadius: 4,
                background: isActive ? TOKENS.accentSoft : 'rgba(255,255,255,0.06)',
                color: isActive ? TOKENS.accent : TOKENS.textFaint,
              }}>{n}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {loading ? (
          <>
            <Skeleton height={92} />
            <Skeleton height={92} />
            <Skeleton height={92} />
          </>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', background: TOKENS.bgElev, border: `1px solid ${TOKENS.border}`, borderRadius: 12, color: TOKENS.textDim, fontSize: 13 }}>
            <div aria-hidden style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
            No alerts in this view.
          </div>
        ) : (
          filtered.map(a => (
            <AlertCard key={a.id} alert={a} onResolve={resolveAlert} busy={resolvingId === a.id} />
          ))
        )}
      </div>
    </AppShell>
  );
}
