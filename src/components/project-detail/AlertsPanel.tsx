import React from 'react';
import { CardShell } from '../dashboard/CardShell';
import { Pill } from '../ui/Pill';
import type { Alert } from '../../lib/types';

interface Props {
  alerts: Alert[];
  isLoading?: boolean;
}

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#f87171',
  high:     '#fb923c',
  medium:   '#facc15',
  low:      '#94a3b8',
};

export function AlertsPanel({ alerts, isLoading }: Props) {
  const sorted = [...alerts].sort((a, b) => {
    if (a.is_resolved !== b.is_resolved) return a.is_resolved ? 1 : -1;
    return (b.created_at ?? '').localeCompare(a.created_at ?? '');
  });

  const unresolved = sorted.filter((a) => !a.is_resolved).length;

  return (
    <CardShell interactive={false} style={{ padding: 22 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        fontFamily: "'Geist Mono', monospace",
        fontSize: 10, letterSpacing: '0.22em',
        textTransform: 'uppercase', color: 'var(--leap-text-faint)',
        marginBottom: 14,
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: 999,
          background: unresolved > 0 ? '#f87171' : '#5eead4',
          boxShadow: `0 0 8px ${unresolved > 0 ? '#f8717177' : '#5eead477'}`,
        }} />
        Alerts
        <span style={{ marginLeft: 'auto', color: 'var(--leap-text-dim)' }}>
          {unresolved} unresolved · {sorted.length} total
        </span>
      </div>

      {isLoading ? (
        <Placeholder text="Loading alerts…" />
      ) : sorted.length === 0 ? (
        <Placeholder text="No alerts recorded for this project." />
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sorted.map((a) => (
            <AlertRow key={a.id} alert={a} />
          ))}
        </ul>
      )}
    </CardShell>
  );
}

function AlertRow({ alert }: { alert: Alert }) {
  const tone = SEVERITY_COLOR[alert.severity] ?? '#94a3b8';
  return (
    <li
      style={{
        padding: '12px 14px',
        borderRadius: 12,
        border: '1px solid var(--leap-border-soft)',
        background: 'var(--leap-surface-soft)',
        display: 'flex', flexDirection: 'column', gap: 8,
        opacity: alert.is_resolved ? 0.72 : 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <Pill color={tone} tone="soft">
          {alert.severity}
        </Pill>
        <span style={{
          fontFamily: "'Geist Mono', monospace",
          fontSize: 10.5, color: 'var(--leap-text-dim)',
          letterSpacing: '0.10em',
        }}>
          {alert.type}
        </span>
        {alert.is_resolved && <ResolvedBadge alert={alert} />}
      </div>

      <div style={{
        fontSize: 13, color: 'var(--leap-text)',
        lineHeight: 1.45,
        letterSpacing: '-0.005em',
      }}>
        {alert.message}
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        fontFamily: "'Geist Mono', monospace",
        fontSize: 10, color: 'var(--leap-text-faint)',
        letterSpacing: '0.08em',
      }}>
        Created {formatDate(alert.created_at)}
      </div>
    </li>
  );
}

function ResolvedBadge({ alert }: { alert: Alert }) {
  const who = alert.resolved_by?.trim();
  const when = alert.resolved_at ? formatDate(alert.resolved_at, true) : null;
  const label = who && when
    ? `Resolved by ${who} on ${when}`
    : who
      ? `Resolved by ${who}`
      : when
        ? `Resolved on ${when}`
        : 'Resolved';

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 9px',
      borderRadius: 999,
      border: '1px solid rgba(94, 234, 212, 0.45)',
      background: 'rgba(94, 234, 212, 0.10)',
      color: 'var(--leap-accent-cyan)',
      fontFamily: "'Geist Mono', monospace",
      fontSize: 10,
      letterSpacing: '0.08em',
    }}>
      <CheckIcon size={10} />
      {label}
    </span>
  );
}

function CheckIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
         aria-hidden>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function Placeholder({ text }: { text: string }) {
  return (
    <div style={{
      padding: '32px 12px',
      textAlign: 'center',
      borderRadius: 12,
      border: '1px dashed var(--leap-border-soft)',
      color: 'var(--leap-text-faint)',
      fontFamily: "'Geist Mono', monospace",
      fontSize: 11,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
    }}>
      {text}
    </div>
  );
}

function formatDate(iso: string | null | undefined, shortForBadge = false): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  if (shortForBadge) return `${dd}/${mm}`;
  const yyyy = String(d.getFullYear());
  return `${dd}/${mm}/${yyyy}`;
}
