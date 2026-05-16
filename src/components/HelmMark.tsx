import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface HelmMarkProps {
  size?: number;
  layoutId?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function HelmMark({
  size = 280,
  layoutId = 'helm-mark',
  onClick,
  style,
}: HelmMarkProps) {
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

  const innerStroke = isDark ? 'rgba(244,244,245,0.42)' : 'rgba(13,27,42,0.55)';

  return (
    <motion.div
      layoutId={layoutId}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        display: 'inline-block',
        width: size,
        height: size,
        lineHeight: 0,
        ...style,
      }}
      transition={{ type: 'spring', stiffness: 200, damping: 30 }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="helm-mark-apex" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5eead4" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>

        <path
          d="M14 76 L50 24 L86 76"
          stroke="url(#helm-mark-apex)"
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
      </svg>
    </motion.div>
  );
}
