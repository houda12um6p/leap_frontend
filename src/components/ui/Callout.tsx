import React from 'react';

type Tone = 'info' | 'warning';

interface Props {
  tone?: Tone;
  title?: string;
  children: React.ReactNode;
}

const accents: Record<Tone, { ring: string; soft: string; icon: string; text: string }> = {
  info:    {
    ring: 'rgba(94, 234, 212, 0.45)',
    soft: 'rgba(94, 234, 212, 0.08)',
    icon: 'var(--leap-accent-cyan)',
    text: 'var(--leap-text)',
  },
  warning: {
    ring: 'rgba(251, 191, 36, 0.55)',
    soft: 'rgba(251, 191, 36, 0.10)',
    icon: 'var(--leap-accent-amber)',
    text: 'var(--leap-text)',
  },
};

const InfoIcon = ({ color }: { color: string }) => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8h.01M11 12h1v5h1" />
  </svg>
);

const WarnIcon = ({ color }: { color: string }) => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export function Callout({ tone = 'info', title, children }: Props) {
  const a = accents[tone];
  const Icon = tone === 'warning' ? WarnIcon : InfoIcon;
  return (
    <div
      role="note"
      style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: 12,
        padding: '12px 14px',
        borderRadius: 12,
        border: `1px solid ${a.ring}`,
        background: a.soft,
        color: a.text,
        fontFamily: "'Geist', system-ui",
      }}
    >
      <div
        aria-hidden
        style={{
          width: 28, height: 28, borderRadius: 8,
          display: 'inline-grid', placeItems: 'center',
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${a.ring}`,
          flexShrink: 0,
        }}
      >
        <Icon color={a.icon} />
      </div>
      <div style={{ minWidth: 0 }}>
        {title && (
          <div style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: 10,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: a.icon,
            marginBottom: 4,
          }}>
            {title}
          </div>
        )}
        <div style={{
          fontSize: 13,
          lineHeight: 1.5,
          color: 'var(--leap-text-dim)',
          wordBreak: 'break-word',
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}
