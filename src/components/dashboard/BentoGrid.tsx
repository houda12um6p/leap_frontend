import React from 'react';

/**
 * Strict 12-col bento grid. Each child controls its own span via
 * `style={{ gridColumn: 'span N', gridRow: 'span M' }}`. The grid auto-flows
 * dense so wide tiles pack with smaller ones cleanly.
 */
export function BentoGrid({ children }: { children: React.ReactNode }) {
  return <div className="leap-bento">{children}</div>;
}

interface CellProps {
  col?: number;          // span (1–12)
  row?: number;          // span
  colMd?: number;        // override at md breakpoint
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function BentoCell({ col = 4, row = 1, colMd, children, style }: CellProps) {
  return (
    <div
      className="leap-bento-cell"
      data-col={col}
      data-col-md={colMd ?? col}
      data-row={row}
      style={{
        gridColumn: `span ${col}`,
        gridRow: `span ${row}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
