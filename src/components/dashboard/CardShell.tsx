import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface Props extends Omit<HTMLMotionProps<'div'>, 'children'> {
  layoutId?: string;
  interactive?: boolean;
  tone?: 'default' | 'hero' | 'muted';
  glow?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Shared card container. Spring-animated hover lift + subtle lighting shift.
 * Used by every dashboard tile so motion feels consistent.
 */
export function CardShell({
  layoutId,
  interactive = true,
  tone = 'default',
  glow,
  children,
  className,
  style,
  ...rest
}: Props) {
  const toneStyle: React.CSSProperties =
    tone === 'hero'
      ? { background: 'var(--leap-card-bg-hero)'  }
      : tone === 'muted'
      ? { background: 'var(--leap-card-bg-muted)' }
      : { background: 'var(--leap-card-bg)'       };

  return (
    <motion.div
      layoutId={layoutId}
      className={`leap-card${className ? ' ' + className : ''}`}
      whileHover={
        interactive
          ? { y: -3, scale: 1.012 }
          : undefined
      }
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      style={{
        ...toneStyle,
        boxShadow: glow ? `0 0 0 1px ${glow}22, 0 18px 48px ${glow}18` : undefined,
        ...style,
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
