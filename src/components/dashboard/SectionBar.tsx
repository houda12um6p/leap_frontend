import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, LayoutGroup } from 'framer-motion';
import { CompassIcon, FolderIcon } from '../ui/Icon';
import { ThemeToggle } from '../ui/ThemeToggle';

interface Item {
  to: string;
  label: string;
  match: (path: string) => boolean;
  icon: React.ReactNode;
}

const items: Item[] = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    match: (p) => p === '/' || p.startsWith('/dashboard'),
    icon: <CompassIcon size={15} />,
  },
  {
    to: '/projects',
    label: 'Projects',
    match: (p) => p.startsWith('/projects'),
    icon: <FolderIcon size={15} />,
  },
];

/**
 * Floating bottom-center pill — same glass aesthetic and layoutId animation
 * as before, but each tab is now a route, not an in-page view.
 */
export function SectionBar() {
  const { pathname } = useLocation();

  return (
    <motion.nav
      className="section-bar"
      initial={{ opacity: 0, y: 36 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Primary"
    >
      <LayoutGroup id="section-bar">
        {items.map((it) => {
          const active = it.match(pathname);
          return (
            <NavLink
              key={it.to}
              to={it.to}
              className={`section-bar-item${active ? ' is-active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              {active && (
                <motion.span
                  layoutId="section-bar-pill"
                  className="section-bar-pill"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="section-bar-content">
                {it.icon}
                <span>{it.label}</span>
              </span>
            </NavLink>
          );
        })}
      </LayoutGroup>
      <span style={{ display: 'inline-flex', paddingLeft: 4, paddingRight: 2 }}>
        <ThemeToggle />
      </span>
    </motion.nav>
  );
}
