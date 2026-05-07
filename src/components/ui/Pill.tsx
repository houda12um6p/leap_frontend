import React from 'react';

interface Props {
  color?: string;
  tone?: 'solid' | 'soft' | 'outline';
  children: React.ReactNode;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
}

export function Pill({ color = '#5eead4', tone = 'soft', children, icon, style }: Props) {
  const styles: React.CSSProperties =
    tone === 'solid' ? {
      background: color,
      color: '#03241f',
      borderColor: color,
    } : tone === 'outline' ? {
      background: 'transparent',
      color,
      borderColor: `${color}55`,
    } : {
      background: `${color}1a`,
      color,
      borderColor: `${color}33`,
    };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 9px',
        borderRadius: 999,
        border: '1px solid',
        fontFamily: "'Geist Mono', monospace",
        fontSize: 10,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        ...styles,
        ...style,
      }}
    >
      {icon}
      {children}
    </span>
  );
}
