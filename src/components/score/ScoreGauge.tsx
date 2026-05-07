import React from 'react';
import { motion } from 'framer-motion';
import { scoreBand } from '../../lib/types';

interface Props {
  score: number;             // 0–1000
  size?: number;
  strokeWidth?: number;
}

/**
 * Arc gauge from 0–1000. Animates the foreground arc length with framer-motion's
 * SVG support so it eases in when the value first appears.
 */
export function ScoreGauge({ score, size = 220, strokeWidth = 12 }: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius;             // half circle
  const pct = Math.max(0, Math.min(1, score / 1000));
  const arcLen = circumference * pct;
  const tone = scoreBand(score);

  const cx = size / 2;
  const cy = size - strokeWidth;          // anchor at bottom of square box
  // Half-arc path from left to right via top
  const start = { x: cx - radius, y: cy };
  const end   = { x: cx + radius, y: cy };

  return (
    <svg width={size} height={size / 2 + strokeWidth} viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`}>
      <defs>
        <linearGradient id="gauge-grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%"  stopColor={tone.tone} stopOpacity="0.5" />
          <stop offset="100%" stopColor={tone.tone} stopOpacity="1"   />
        </linearGradient>
      </defs>

      {/* track */}
      <path
        d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`}
        fill="none"
        stroke="var(--leap-surface-wash)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* foreground */}
      <motion.path
        d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`}
        fill="none"
        stroke="url(#gauge-grad)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference - arcLen }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* tick marks at 0 / 500 / 1000 */}
      {[0, 0.5, 1].map((t) => {
        const angle = Math.PI - t * Math.PI;        // 180° → 0°
        const x = cx + radius * Math.cos(angle);
        const y = cy - radius * Math.sin(angle);
        return (
          <circle
            key={t}
            cx={x} cy={y} r={2}
            fill="rgba(255,255,255,0.35)"
          />
        );
      })}
    </svg>
  );
}
