import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface HelmLogoProps {
  width?: number;
  layoutId?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function HelmLogo({
  width = 120,
  layoutId = 'helm-logo-small',
  onClick,
  style,
}: HelmLogoProps) {
  const height = width * (120 / 450);

  const [isDark, setIsDark] = useState(
    document.documentElement.getAttribute('data-theme') !== 'light'
  );

  useEffect(() => {
    const obs = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute('data-theme') !== 'light');
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  const wordStart   = isDark ? '#5eead4' : '#0a8a6b';
  const wordEnd     = isDark ? '#fbbf24' : '#b8530a';
  const innerStroke = isDark ? 'rgba(244,244,245,0.42)' : 'rgba(13,27,42,0.55)';

  return (
    <motion.div
      layoutId={layoutId}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        display: 'inline-block',
        lineHeight: 0,
        ...style,
      }}
      transition={{ type: 'spring', stiffness: 200, damping: 30 }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        viewBox="0 0 450 120"
        fill="none"
        aria-label="Helm"
      >
        <defs>
          <linearGradient id="helm-apex-logo" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5eead4" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
          <linearGradient id="helm-word-logo" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={wordStart} />
            <stop offset="100%" stopColor={wordEnd} />
          </linearGradient>
        </defs>

        <g transform="translate(10 10)">
          <path
            d="M14 76 L50 24 L86 76"
            stroke="url(#helm-apex-logo)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M30 78 L50 52 L70 78"
            stroke={innerStroke}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        <text
          x="138"
          y="84"
          fontFamily="Instrument Serif, Georgia, serif"
          fontStyle="italic"
          fontWeight="400"
          fontSize="84"
          letterSpacing="-1.5"
          fill="url(#helm-word-logo)"
        >
          helm.
        </text>
      </svg>
    </motion.div>
  );
}
