import React, { useEffect, useState } from 'react';
import { animate, useMotionValue } from 'framer-motion';

interface Props {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Smoothly counts from 0 → value when `value` changes.
 * Uses framer-motion's animate() to drive a motion value, then
 * mirrors it into local state so the formatter can render it.
 */
export function AnimatedNumber({
  value,
  duration = 1.6,
  format = (n) => Math.round(n).toLocaleString(),
  className,
  style,
}: Props) {
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(mv, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [value, duration, mv]);

  return (
    <span className={className} style={style}>
      {format(display)}
    </span>
  );
}
