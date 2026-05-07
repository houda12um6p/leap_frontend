import React from 'react';
import { fmt } from '../../lib/score';

interface Props {
  /**
   * Render the formula with the supplied values plugged in. Pass nothing to
   * render the symbolic form.
   */
  values?: {
    severity_sum: number;
    lines_modified: number;
    x_norm: number;
    story_points: number;
    delta: number;
    score: number;
  };
}

const wrap: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  fontFamily: "'Geist Mono', monospace",
  fontSize: 12.5,
  lineHeight: 1.6,
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid var(--leap-border)',
  padding: '14px 16px',
  borderRadius: 10,
  letterSpacing: '0.01em',
  color: 'var(--leap-text)',
  overflow: 'hidden',
};

const row: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'baseline',
  gap: 6,
};

const num: React.CSSProperties = { color: '#5eead4' };
const dim: React.CSSProperties = { color: 'var(--leap-text-faint)' };

export function FormulaPill({ values }: Props) {
  if (!values) {
    return (
      <div style={wrap}>
        <div style={row}>
          <span style={dim}>X_norm</span>
          <span style={dim}>=</span>
          <span style={dim}>Σ severity / √(1 + lines)</span>
        </div>
        <div style={row}>
          <span style={dim}>score = 1000 · e</span>
          <span style={{ ...dim, fontSize: 10 }}>−0.07 · max(0, X_norm − points)</span>
        </div>
      </div>
    );
  }
  const { severity_sum, lines_modified, x_norm, story_points, delta, score } = values;
  return (
    <div style={wrap}>
      {/* X_norm = Σ / √(1 + lines) */}
      <div style={row}>
        <span style={dim}>X_norm</span>
        <span style={dim}>=</span>
        <span style={num}>{severity_sum}</span>
        <span style={dim}>/ √(1 +</span>
        <span style={num}>{lines_modified.toLocaleString()}</span>
        <span style={dim}>)</span>
        <span style={dim}>=</span>
        <span style={num}>{fmt(x_norm, 3)}</span>
      </div>

      {/* delta */}
      <div style={row}>
        <span style={dim}>Δ</span>
        <span style={dim}>=</span>
        <span style={dim}>max(0,</span>
        <span style={num}>{fmt(x_norm, 3)}</span>
        <span style={dim}>−</span>
        <span style={num}>{story_points}</span>
        <span style={dim}>)</span>
        <span style={dim}>=</span>
        <span style={num}>{fmt(delta, 3)}</span>
      </div>

      {/* final score */}
      <div style={{ ...row, paddingTop: 6, borderTop: '1px solid var(--leap-border-soft)', marginTop: 2 }}>
        <span style={dim}>score</span>
        <span style={dim}>=</span>
        <span style={dim}>1000 · e</span>
        <span style={{ ...dim, fontSize: 10.5 }}>(−0.07 · {fmt(delta, 3)})</span>
        <span style={dim}>=</span>
        <span style={{ ...num, fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em' }}>
          {fmt(score, 1)}
        </span>
      </div>
    </div>
  );
}
