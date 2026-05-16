import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, LayoutGroup } from 'framer-motion';
import { ThemeToggle } from '../ui/ThemeToggle';
import { UserMenu } from '../auth/UserMenu';
import { HelmLogo } from '../HelmLogo';
import type { Project } from '../../lib/types';

interface Item {
  to: string;
  label: string;
  match: (path: string) => boolean;
}

const items: Item[] = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    match: (p) => p === '/' || p.startsWith('/dashboard'),
  },
  {
    to: '/projects',
    label: 'Projects',
    match: (p) => p.startsWith('/projects'),
  },
];

export function SectionBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // ── Command palette state ────────────────────────────────────────────────
  const [cmdOpen, setCmdOpen]           = useState<boolean>(false);
  const [query, setQuery]               = useState<string>('');
  const [debouncedQuery, setDebounced]  = useState<string>('');
  const [allProjects, setAllProjects]   = useState<Project[]>([]);
  const [projectsLoaded, setProjectsLoaded] = useState<boolean>(false);
  const [results, setResults]           = useState<Project[]>([]);
  const [loading, setLoading]           = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // Global ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Debounce the raw query input by 200 ms
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 200);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch projects ONCE per palette session (cached until modal unmounts)
  useEffect(() => {
    if (!cmdOpen || projectsLoaded) return;
    let cancelled = false;
    const run = async (): Promise<void> => {
      setLoading(true);
      try {
        const token = localStorage.getItem('leap.token');
        const res = await fetch('/api/v1/projects', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Project[];
        if (!cancelled) {
          setAllProjects(data);
          setProjectsLoaded(true);
        }
      } catch {
        if (!cancelled) setAllProjects([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [cmdOpen, projectsLoaded]);

  // Filter client-side from cached list — no network on every keystroke
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    const q = debouncedQuery.toLowerCase();
    setResults(
      allProjects.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.repo_url.toLowerCase().includes(q),
      ),
    );
  }, [debouncedQuery, allProjects]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  const closeCmd = useCallback((): void => {
    setCmdOpen(false);
    setQuery('');
    setDebounced('');
    setResults([]);
  }, []);

  const selectResult = useCallback(
    (project: Project): void => {
      navigate(`/projects/${project.id}`);
      closeCmd();
    },
    [navigate, closeCmd],
  );

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Escape') {
      closeCmd();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results.length > 0) {
      selectResult(results[selectedIndex]);
    }
  };

  return (
    <>
      <motion.header
        className="leap-masthead"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        aria-label="Primary navigation"
      >
        {/* No layoutId — navbar logo does not participate in shared animations */}
        <HelmLogo
          width={130}
          onClick={() => navigate('/dashboard')}
        />

        <nav className="leap-masthead-nav" aria-label="Primary">
          <LayoutGroup id="masthead-nav">
            {items.map((it) => {
              const active = it.match(pathname);
              return (
                <NavLink
                  key={it.to}
                  to={it.to}
                  className={`leap-masthead-nav-item${active ? ' active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  {it.label}
                  {active && (
                    <motion.div
                      layoutId="nav-underline"
                      className="leap-nav-underline"
                      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    />
                  )}
                </NavLink>
              );
            })}
          </LayoutGroup>
        </nav>

        <div className="leap-masthead-controls">
          <button
            type="button"
            className="leap-cmd-trigger"
            onClick={() => setCmdOpen(true)}
            aria-label="Open command palette"
          >
            <span className="leap-cmd-icon">⌘K</span>
            <span className="leap-cmd-label">Search…</span>
          </button>
          <ThemeToggle />
          <UserMenu />
        </div>
      </motion.header>

      {cmdOpen && (
        <div className="leap-cmd-overlay" onClick={closeCmd}>
          <div
            className="leap-cmd-modal"
            onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
          >
            <input
              className="leap-cmd-input"
              placeholder="Search projects…"
              autoFocus
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              onKeyDown={handleInputKeyDown}
            />
            <div className="leap-cmd-results">
              {loading && <div className="leap-cmd-empty">Loading projects…</div>}
              {!loading && debouncedQuery.trim() !== '' && results.length === 0 && (
                <div className="leap-cmd-empty">No projects found</div>
              )}
              {results.map((project, i) => (
                <div
                  key={project.id}
                  className={`leap-cmd-result${i === selectedIndex ? ' selected' : ''}`}
                  onClick={() => selectResult(project)}
                  onMouseEnter={() => setSelectedIndex(i)}
                >
                  <span className="leap-cmd-result-name">{project.name}</span>
                  <span className="leap-cmd-result-repo">{project.repo_url}</span>
                </div>
              ))}
            </div>
            {!loading && debouncedQuery.trim() === '' && (
              <div className="leap-cmd-hint">
                Navigate with ↑↓ · Select with ↵ · Close with Esc
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
