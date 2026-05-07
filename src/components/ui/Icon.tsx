import React from 'react';

/* Inline SVG icon set — keeps us independent of icon-library version drift.
   Stroke-based, lucide-style. Sized via the `size` prop, color via `currentColor`. */

interface IconProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}

function svgProps({ size = 16, strokeWidth = 1.6, className, style }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    style,
    'aria-hidden': true,
  };
}

export const CompassIcon = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <circle cx="12" cy="12" r="9" />
    <polygon points="14.5,9.5 9.5,14.5 9,9 14.5,9.5" fill="currentColor" stroke="none" />
  </svg>
);

export const UsersIcon = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <path d="M16 19v-1.5A3.5 3.5 0 0 0 12.5 14h-5A3.5 3.5 0 0 0 4 17.5V19" />
    <circle cx="10" cy="8" r="3" />
    <path d="M19 18.5v-1A3 3 0 0 0 16.5 14.5" />
    <circle cx="17.5" cy="9" r="2" />
  </svg>
);

export const PullRequestIcon = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <circle cx="6" cy="6" r="2.5" />
    <circle cx="6" cy="18" r="2.5" />
    <circle cx="18" cy="18" r="2.5" />
    <line x1="6" y1="8.5" x2="6" y2="15.5" />
    <path d="M11 6h4a3 3 0 0 1 3 3v6" />
  </svg>
);

export const ArrowRightIcon = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <line x1="4" y1="12" x2="20" y2="12" />
    <polyline points="14 6 20 12 14 18" />
  </svg>
);

export const CloseIcon = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </svg>
);

export const SparkleIcon = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
  </svg>
);

export const TrendUpIcon = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <polyline points="3 17 9 11 13 15 21 7" />
    <polyline points="14 7 21 7 21 14" />
  </svg>
);

export const GitBranchIcon = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <line x1="6" y1="3" x2="6" y2="15" />
    <circle cx="18" cy="6" r="2.5" />
    <circle cx="6" cy="18" r="2.5" />
    <path d="M18 8.5a6 6 0 0 1-6 6H6" />
  </svg>
);

export const TargetIcon = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.4" fill="currentColor" />
  </svg>
);

export const PlusIcon = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const SyncIcon = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <polyline points="21 4 21 10 15 10" />
    <polyline points="3 20 3 14 9 14" />
    <path d="M3.5 10a8 8 0 0 1 13.5-4l4 4M20.5 14a8 8 0 0 1-13.5 4l-4-4" />
  </svg>
);

export const ArrowLeftIcon = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <line x1="20" y1="12" x2="4" y2="12" />
    <polyline points="10 18 4 12 10 6" />
  </svg>
);

export const FolderIcon = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
  </svg>
);

export const HashIcon = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <line x1="4"  y1="9" x2="20" y2="9" />
    <line x1="4"  y1="15" x2="20" y2="15" />
    <line x1="10" y1="3" x2="8"  y2="21" />
    <line x1="16" y1="3" x2="14" y2="21" />
  </svg>
);

export const FileDiffIcon = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <polyline points="14 3 14 8 19 8" />
    <line x1="9"  y1="13" x2="15" y2="13" />
    <line x1="12" y1="10" x2="12" y2="16" />
  </svg>
);

export const MessageSquareIcon = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export const ExternalLinkIcon = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <path d="M14 4h6v6" />
    <path d="M20 4l-9 9" />
    <path d="M19 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6" />
  </svg>
);

export const ChevronDownIcon = (p: IconProps) => (
  <svg {...svgProps(p)}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
