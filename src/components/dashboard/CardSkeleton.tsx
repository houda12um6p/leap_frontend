import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  height?: number;
  rows?: number;
  hero?: boolean;
}

export function CardSkeleton({ height, rows = 3, hero = false }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="leap-card"
      style={{
        height: height ?? (hero ? 320 : 180),
        padding: 22,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        background: 'var(--leap-card-bg-muted)',
      }}
      aria-busy="true"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="leap-skel" style={{ width: 36, height: 36, borderRadius: 999 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="leap-skel" style={{ width: '50%', height: 10 }} />
          <div className="leap-skel" style={{ width: '30%', height: 8 }} />
        </div>
      </div>

      {hero && <div className="leap-skel" style={{ width: 140, height: 56, marginTop: 6 }} />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="leap-skel"
            style={{ width: `${90 - i * 12}%`, height: 10 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} hero={i === 0} rows={2 + (i % 3)} />
      ))}
    </>
  );
}

export function BentoSkeleton() {
  return (
    <>
      {[3, 3, 3, 3].map((col, i) => (
        <div key={`s1-${i}`} style={{ gridColumn: `span ${col}` }}>
          <CardSkeleton rows={2} />
        </div>
      ))}
      <div style={{ gridColumn: 'span 6', gridRow: 'span 2' }}>
        <CardSkeleton hero rows={5} />
      </div>
      <div style={{ gridColumn: 'span 6', gridRow: 'span 2' }}>
        <CardSkeleton hero rows={4} />
      </div>
      <div style={{ gridColumn: 'span 12' }}>
        <CardSkeleton rows={4} />
      </div>
    </>
  );
}
