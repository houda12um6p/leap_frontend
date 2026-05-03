import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { TOKENS, FONT, FONT_MONO } from '../styles/tokens';
import { AppShell } from '../components/layout/AppShell';
import { Field } from '../components/ui/Field';
import { PrimaryButton, GhostButton } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  getProjects, createProject, getAlerts, getScores,
  syncGitHub, calculateProjectScores, syncJiraTasks,
  parseRepoUrl,
} from '../services/api';
import { Project, Alert, DeveloperScore } from '../types';

const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

function StatusCell({ status }: { status: string }) {
  const isActive = status === 'active';
  const color = isActive ? TOKENS.accent : TOKENS.textFaint;
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : '—';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: isActive ? TOKENS.accent : TOKENS.textDim, fontSize: 13, fontFamily: FONT, fontWeight: isActive ? 500 : 400 }}>
      <span aria-hidden style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: isActive ? `0 0 8px ${TOKENS.accent}` : 'none' }} />
      {label}
    </span>
  );
}

function ScoreBar({ score }: { score: number }) {
  const pct = (score || 0) / 1000;
  return (
    <div role="img" aria-label={`Average score ${score} of 1000`} style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 140 }}>
      <div style={{ flex: 1, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct * 100}%`, background: TOKENS.accent, borderRadius: 3, boxShadow: `0 0 8px ${TOKENS.accent}80` }} />
      </div>
      <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: TOKENS.accent, fontWeight: 600, minWidth: 32, textAlign: 'right' }}>
        {score || '—'}
      </span>
    </div>
  );
}

function ProjectRow({ p, alt, score, onSync, syncBusy }: {
  p: Project; alt: boolean; score: number;
  onSync: (p: Project) => void; syncBusy: boolean;
}) {
  const [hover, setHover] = useState(false);
  const initials = (p.name.split(' ').map(s => s[0]).filter(Boolean).slice(0, 2).join('') || '?').toUpperCase();
  return (
    <Link
      to={`/projects/${p.id}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="leap-projects-row"
      style={{
        display: 'grid', gridTemplateColumns: '2fr 1fr 1.4fr 2fr 160px',
        padding: '14px 22px',
        background: hover ? 'rgba(0,168,107,0.05)' : (alt ? TOKENS.bgElev2 : TOKENS.bgElev),
        borderTop: `1px solid ${TOKENS.border}`,
        alignItems: 'center', transition: 'background 0.12s', cursor: 'pointer',
        textDecoration: 'none', color: 'inherit',
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div aria-hidden style={{
          width: 30, height: 30, borderRadius: 7,
          background: p.status === 'active' ? TOKENS.accentSoft : 'rgba(255,255,255,0.06)',
          color: p.status === 'active' ? TOKENS.accent : TOKENS.textDim,
          display: 'grid', placeItems: 'center',
          fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700,
          border: `1px solid ${p.status === 'active' ? 'rgba(0,168,107,0.3)' : TOKENS.border}`,
        }}>{initials}</div>
        <div style={{ fontFamily: FONT, fontSize: 13.5, color: TOKENS.text, fontWeight: 500 }}>{p.name}</div>
      </div>
      <div><StatusCell status={p.status} /></div>
      <div className="leap-col-score"><ScoreBar score={score} /></div>
      <div className="leap-col-repo" style={{ fontFamily: FONT_MONO, fontSize: 12, color: TOKENS.textDim, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        <span aria-hidden style={{ color: TOKENS.textFaint }}>↗</span> {p.repo_url}
      </div>
      <div style={{ textAlign: 'right', display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSync(p); }}
          disabled={syncBusy}
          aria-busy={syncBusy || undefined}
          aria-label={`Sync ${p.name} from GitHub and Jira`}
          style={{
            padding: '4px 10px',
            background: syncBusy ? 'rgba(0,168,107,0.18)' : TOKENS.accentSoft,
            color: TOKENS.accent,
            border: `1px solid ${TOKENS.accent}40`, borderRadius: 6,
            fontFamily: FONT_MONO, fontSize: 10,
            cursor: syncBusy ? 'wait' : 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}
        >
          {syncBusy && <span className="leap-spinner" aria-hidden style={{ color: TOKENS.accent }} />}
          {syncBusy ? 'Syncing…' : 'Sync'}
        </button>
        <span style={{
          padding: '4px 10px',
          background: hover ? TOKENS.accent : 'transparent',
          color: hover ? '#03130A' : TOKENS.accent,
          border: `1px solid ${TOKENS.accent}`, borderRadius: 6,
          fontFamily: FONT_MONO, fontSize: 10, fontWeight: 600,
          letterSpacing: 0.6, textTransform: 'uppercase',
          transition: 'all 0.12s',
        }}>Open →</span>
      </div>
    </Link>
  );
}

function AddProjectModal({ onCancel, onSubmit, busy }: { onCancel: () => void; onSubmit: (name: string, url: string) => void; busy: boolean }) {
  const [name, setName] = useState('');
  const [repo, setRepo] = useState('');
  const [touched, setTouched] = useState({ name: false, repo: false });
  const repoErr = touched.repo && repo && !parseRepoUrl(repo)
    ? "Use a format like github.com/owner/repo."
    : touched.repo && !repo ? 'Repository URL is required.' : '';
  const nameErr = touched.name && !name ? 'Project name is required.' : '';
  const valid = !!name.trim() && !!parseRepoUrl(repo);

  return (
    <div role="dialog" aria-modal="true" aria-label="Add project" style={{
      position: 'fixed', inset: 0,
      background: 'rgba(8,20,38,0.72)', backdropFilter: 'blur(4px)',
      display: 'grid', placeItems: 'center', zIndex: 100, padding: 14,
    }}>
      <div style={{ width: 440, maxWidth: '100%', background: TOKENS.bgElev, border: `1px solid ${TOKENS.borderStrong}`, borderRadius: 14, padding: 28, boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: TOKENS.accent, letterSpacing: 1.5, marginBottom: 10, textTransform: 'uppercase' }}>◆ New project</div>
        <h2 style={{ margin: '0 0 6px', fontFamily: FONT, fontSize: 20, color: TOKENS.text, fontWeight: 600 }}>Add a project</h2>
        <p style={{ margin: '0 0 22px', fontFamily: FONT, fontSize: 13, color: TOKENS.textDim }}>
          Connect a repository to start tracking its engineering health.
        </p>
        <div style={{ display: 'grid', gap: 14, marginBottom: 22 }}>
          <Field label="Project name"
            value={name}
            onChange={(v) => { setName(v); if (!touched.name) setTouched(t => ({ ...t, name: true })); }}
            placeholder="Phosphate Logistics API" autoFocus
            error={nameErr} required
          />
          <Field label="Repository URL"
            value={repo}
            onChange={(v) => { setRepo(v); if (!touched.repo) setTouched(t => ({ ...t, repo: true })); }}
            placeholder="github.com/ocp/repo-name"
            hint="Accepts github.com/owner/repo, https://github.com/owner/repo(.git), or git@github.com:owner/repo.git"
            error={repoErr}
            required
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <GhostButton onClick={onCancel}>Cancel</GhostButton>
          <PrimaryButton
            loading={busy}
            disabled={!valid}
            onClick={() => valid && onSubmit(name.trim(), repo.trim())}
          >Create Project</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

export function ProjectsPage() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectScores, setProjectScores] = useState<Record<string, number>>({});
  const [alertCount, setAlertCount] = useState(0);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const projs = await getProjects();
        if (cancelled) return;
        setProjects(projs);
        if (projs.length > 0) {
          const [alertsRes, ...scoreResults] = await Promise.all([
            getAlerts(projs[0].id).catch(() => [] as Alert[]),
            ...projs.map(p => getScores(p.id).catch(() => [] as DeveloperScore[])),
          ]);
          if (cancelled) return;
          setAlertCount(((alertsRes as Alert[]) || []).filter(a => !a.is_resolved).length);
          const scores: Record<string, number> = {};
          projs.forEach((p, i) => {
            const devs = scoreResults[i] as DeveloperScore[];
            scores[p.id] = Array.isArray(devs) && devs.length > 0
              ? Math.round(devs.reduce((s, d) => s + (d.total_score || 0), 0) / devs.length)
              : 0;
          });
          setProjectScores(scores);
        }
      } catch (e) {
        toast.error('Could not load projects', 'Check your connection and try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = async (name: string, repo_url: string) => {
    setCreating(true);
    try {
      const p = await createProject(name, repo_url, 'active');
      setProjects(prev => [p, ...prev]);
      setShowModal(false);
      toast.success('Project created', `${name} is now being tracked.`);
    } catch (e: any) {
      toast.error('Could not create project', e?.response?.data?.detail || 'Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleSync = async (p: Project) => {
    const parsed = parseRepoUrl(p.repo_url);
    if (!parsed) {
      toast.error('Invalid repository URL', 'Use github.com/owner/repo.');
      return;
    }
    setSyncingId(p.id);
    try {
      await syncGitHub(parsed.owner, parsed.repo, p.id);
      try { await syncJiraTasks(p.id); } catch (jiraErr) { console.warn('Jira sync failed', jiraErr); }
      try {
        await calculateProjectScores(p.id);
        const devs = await getScores(p.id).catch(() => [] as DeveloperScore[]);
        const avg = devs.length > 0
          ? Math.round(devs.reduce((s, d) => s + (d.total_score || 0), 0) / devs.length)
          : 0;
        setProjectScores(prev => ({ ...prev, [p.id]: avg }));
      } catch (scoreErr) {
        console.warn('Score recalc failed', scoreErr);
      }
      toast.success(`${p.name} synced`, 'Scores have been refreshed.');
    } catch (e: any) {
      toast.error('Sync failed', e?.response?.data?.detail || 'Check that the repo is reachable.');
    } finally {
      setSyncingId(null);
    }
  };

  const filtered = useMemo(() => {
    const base = filter === 'all' ? projects : projects.filter(p => p.status === filter);
    const q = search.trim().toLowerCase();
    if (!q) return base;
    return base.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.repo_url || '').toLowerCase().includes(q)
    );
  }, [projects, filter, search]);

  const tabs: [string, string][] = [['all', 'All'], ['active', 'Active'], ['archived', 'Archived']];

  return (
    <AppShell
      title="Projects"
      subtitle={`${projects.length} repositories tracked`}
      user={user!}
      alertCount={alertCount}
      onLogout={logout}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search projects…"
      headerRight={(
        <button
          onClick={() => setShowModal(true)}
          aria-label="Add a new project"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '8px 14px',
            background: TOKENS.accent, color: '#03130A',
            border: 'none', borderRadius: 8,
            fontFamily: FONT, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 1px 0 rgba(255,255,255,0.12) inset',
          }}>
          <PlusIcon /> Add Project
        </button>
      )}
    >
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
        {tabs.map(([val, label]) => {
          const isActive = filter === val;
          return (
            <button key={val} onClick={() => setFilter(val)} aria-pressed={isActive} style={{
              padding: '6px 12px',
              background: isActive ? TOKENS.accentSoft : 'transparent',
              border: `1px solid ${isActive ? 'rgba(0,168,107,0.4)' : TOKENS.border}`,
              borderRadius: 7,
              color: isActive ? TOKENS.accent : TOKENS.textDim,
              fontFamily: FONT, fontSize: 12, fontWeight: isActive ? 600 : 400,
              cursor: 'pointer', transition: 'all 0.12s',
            }}>
              {label}
              <span style={{ marginLeft: 7, fontFamily: FONT_MONO, fontSize: 10, color: isActive ? TOKENS.accent : TOKENS.textFaint }}>
                {val === 'all' ? projects.length : projects.filter(p => p.status === val).length}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ background: TOKENS.bgElev, border: `1px solid ${TOKENS.border}`, borderRadius: 12, overflow: 'hidden' }}>
        <div className="leap-projects-head" style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1.4fr 2fr 160px',
          padding: '12px 22px', borderBottom: `1px solid ${TOKENS.border}`,
          fontFamily: FONT_MONO, fontSize: 10, color: TOKENS.textFaint,
          letterSpacing: 1, textTransform: 'uppercase', background: 'rgba(0,0,0,0.18)',
        }}>
          <div>Name</div>
          <div>Status</div>
          <div className="leap-col-score">Score</div>
          <div className="leap-col-repo">Repo URL</div>
          <div />
        </div>
        {loading ? (
          <div style={{ padding: 16, display: 'grid', gap: 8 }}>
            <Skeleton height={56} />
            <Skeleton height={56} />
            <Skeleton height={56} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: TOKENS.textDim, fontSize: 13 }}>
            {projects.length === 0 ? (
              <div>
                <div style={{ marginBottom: 8 }}>No projects yet.</div>
                <PrimaryButton onClick={() => setShowModal(true)}>Add your first project</PrimaryButton>
              </div>
            ) : 'No projects match your filters.'}
          </div>
        ) : (
          filtered.map((p, i) => (
            <ProjectRow
              key={p.id} p={p} alt={i % 2 === 1}
              score={projectScores[p.id] || 0}
              onSync={handleSync}
              syncBusy={syncingId === p.id}
            />
          ))
        )}
      </div>

      {showModal && <AddProjectModal onCancel={() => setShowModal(false)} onSubmit={handleAdd} busy={creating} />}
    </AppShell>
  );
}
