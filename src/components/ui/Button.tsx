import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

type Variant = 'primary' | 'ghost' | 'glass' | 'sharp';
type Size    = 'sm' | 'md' | 'lg';

interface Props extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant;
  size?: Size;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
  children?: React.ReactNode;
  block?: boolean;
}

const sizes: Record<Size, React.CSSProperties> = {
  sm: { padding: '8px 14px',  fontSize: 12, gap: 8  },
  md: { padding: '11px 18px', fontSize: 13, gap: 10 },
  lg: { padding: '14px 22px', fontSize: 14, gap: 12 },
};

const baseStyle: React.CSSProperties = {
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: "'Geist', system-ui, sans-serif",
  fontWeight: 500,
  letterSpacing: '-0.005em',
  cursor: 'pointer',
  border: '1px solid transparent',
  whiteSpace: 'nowrap',
  userSelect: 'none',
  overflow: 'hidden',
  transition:
    'border-color 240ms ease, background 240ms ease, color 200ms ease, box-shadow 280ms ease',
};

function variantStyle(v: Variant): React.CSSProperties {
  switch (v) {
    case 'primary':
      return {
        background:
          'linear-gradient(180deg, var(--leap-accent-cyan) 0%, color-mix(in srgb, var(--leap-accent-cyan) 80%, black) 100%)',
        color: 'var(--leap-bg-deep)',
        borderRadius: 999,
        borderColor: 'color-mix(in srgb, var(--leap-accent-cyan) 60%, transparent)',
        boxShadow:
          '0 1px 0 rgba(255, 255, 255, 0.25) inset, 0 8px 26px color-mix(in srgb, var(--leap-accent-cyan) 22%, transparent)',
      };
    case 'ghost':
      return {
        background: 'transparent',
        color: 'var(--leap-text-dim)',
        borderRadius: 999,
        borderColor: 'transparent',
      };
    case 'glass':
      return {
        background: 'var(--leap-card-bg)',
        color: 'var(--leap-text)',
        borderRadius: 999,
        borderColor: 'var(--leap-border)',
        backdropFilter: 'blur(14px) saturate(140%)',
        WebkitBackdropFilter: 'blur(14px) saturate(140%)',
      };
    case 'sharp':
      return {
        background: 'var(--leap-card-bg-muted)',
        color: 'var(--leap-text)',
        borderRadius: 6,
        borderColor: 'var(--leap-border)',
      };
  }
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'glass', size = 'md', icon, trailing, children, block, style, ...rest },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 380, damping: 24 }}
      style={{
        ...baseStyle,
        ...sizes[size],
        ...variantStyle(variant),
        width: block ? '100%' : undefined,
        ...style,
      }}
      {...rest}
    >
      {icon && <span style={{ display: 'inline-flex' }}>{icon}</span>}
      {children}
      {trailing && <span style={{ display: 'inline-flex' }}>{trailing}</span>}
    </motion.button>
  );
});
