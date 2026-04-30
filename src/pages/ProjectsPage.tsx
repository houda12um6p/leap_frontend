import React, { useEffect, useState } from 'react';
import { TOKENS, FONT, FONT_MONO } from '../styles/tokens';
import { AppShell } from '../components/layout/AppShell';
import { Field } from '../components/ui/Field';
import { PrimaryButton, GhostButton } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { getProjects, createProject, getAlerts, getScores, syncGitHub, calculateProjectScores, syncJiraTasks } from '../services/api';
import { Project, Alert, DeveloperScore } from '../types';

const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

function StatusCell({ status }: { status: string }) {
  const color = status === 'active' ? TOKENS.accent : status === 'paused' ? TOKENS.warn : TOKENS.textFaint;
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: status === 'active' ? TOKENS.accent : TOKENS.textDim, fontSize: 13, fontFamily: FONT, fontWeight: status === 'active' ? 500 : 400 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: status === 'active' ? `0 0 8px ${TOKENS.accent}` : 'none' }} />
      {label}
    </span>
  );
}

function ScoreBar({ score }: { score: number }) {
  const pct = (score || 0) / 1000;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 140 }}>
      <div style={{ flex: 1, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct * 100}%`, background: TOKENS.accent, borderRadius: 3, boxShadow: `0 0 8px ${TOKENS.accent}80` }} />
      </div>
      <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: TOKENS.accent, fontWeight: 600, minWidth: 32, textAlign: 'right' }}>
        {score || '—'}
      </span>
    </div>
  );
}

function ProjectRow({ p, alt, score, onSync }: { p: Project; alt: boolean; score: number; onSync: (p: Project) => void }) {
  const [hover, setHover] = useState(false);
  const initials = p.name.split(' ').map(s => s[0]).slice(0, 2).join('');
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'grid', gridTemplateColumns: '2fr 1fr 1.4fr 2fr 80px',
        padding: '14px 22px',
        background: hover ? 'rgba(0,168,107,0.05)' : (alt ? TOKENS.bgElev2 : TOKENS.bgElev),
        borderTop: `1px solid ${TOKENS.border}`,
        alignItems: 'center', transition: 'background 0.12s', cursor: 'pointer',
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
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
      <div><ScoreBar score={score} /></div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: TOKENS.textDim, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        <span style={{ color: TOKENS.textFaint }}>↗</span> {p.repo_url}
      </div>
      <div style={{ textAlign: 'right', display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
        <button
          onClick={(e) => { e.stopPropagation(); onSync(p); }}
          style={{ padding: '4px 10px', background: TOKENS.accentSoft, color: TOKENS.accent, border: `1px solid ${TOKENS.accent}40`, borderRadius: 6, fontFamily: FONT_MONO, fontSize: 10, cursor: 'pointer' }}
        >
          Sync
        </button>
        <span style={{ fontFamily: FONT_MONO, fontSize: 16, color: hover ? TOKENS.accent : TOKENS.textFaint }}>→</span>
      </div>
    </div>
  );
}

function AddProjectModal({ onCancel, onSubmit }: { onCancel: () => void; onSubmit: (name: string, url: string) => void }) {
  const [name, setName] = useState('');
  const [repo, setRepo] = useState('');
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(8,20,38,0.72)', backdropFilter: 'blur(4px)',
      display: 'grid', placeItems: 'center', zIndex: 100,
    }}>
      <div style={{ width: 440, background: TOKENS.bgElev, border: `1px solid ${TOKENS.borderStrong}`, borderRadius: 14, padding: 28, boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: TOKENS.accent, letterSpacing: 1.5, marginBottom: 10, textTransform: 'uppercase' }}>◆ New project</div>
        <h2 style={{ margin: '0 0 6px', fontFamily: FONT, fontSize: 20, color: TOKENS.text, fontWeight: 600 }}>Add a project</h2>
        <p style={{ margin: '0 0 22px', fontFamily: FONT, fontSize: 13, color: TOKENS.textDim }}>
          Connect a repository to start tracking its engineering health.
        </p>
        <div style={{ display: 'grid', gap: 14, marginBottom: 22 }}>
          <Field label="Project name" value={name} onChange={setName} placeholder="Phosphate Logistics API" autoFocus />
          <Field label="Repository URL" value={repo} onChange={setRepo} placeholder="github.com/ocp/repo-name" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <GhostButton onClick={onCancel}>Cancel</GhostButton>
          <PrimaryButton onClick={() => name.trim() && repo.trim() && onSubmit(name.trim(), repo.trim())}>Create Project</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

export function ProjectsPage() {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectScores, setProjectScores] = useState<Record<string, number>>({});
  const [alertCount, setAlertCount] = useState(0);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const projs = await getProjects();
        setProjects(projs);
        if (projs.length > 0) {
          const [alrts, ...scoreResults] = await Promise.all([
            getAlerts(projs[0].id),
            ...projs.map(p => getScores(p.id).catch(() => [])),
          ]);
          setAlertCount((alrts as Alert[] || []).filter(a => !a.is_resolved).length);
          const scores: Record<string, number> = {};
          projs.forEach((p, i) => {
            const devs = scoreResults[i] as DeveloperScore[];
            scores[p.id] = Array.isArray(devs)
              ? Math.round(devs.reduce((s, d) => s + (d.total_score || 0), 0) / (devs.length || 1))
              : 0;
          });
          setProjectScores(scores);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const handleAdd = async (name: string, repo_url: string) => {
    try {
      const p = await createProject(name, repo_url, 'active');
      setProjects(prev => [p, ...prev]);
      setShowModal(false);
    } catch (e) { console.error('create project error', e); }
  };

  const handleSync = async (p: Project) => {
    try {
      // parse owner and repo name from the repo URL
      const parts = p.repo_url.replace(/https?:\/\//, '').split('/').filter(Boolean);
      if (parts.length < 3) { alert('Repo URL must be: github.com/owner/repo'); return; }
      const [, owner, repo] = parts;
      await syncGitHub(owner, repo, p.id);
      await syncJiraTasks(p.id);
      await calculateProjectScores(p.id);
      alert(`✅ ${p.name} synced! Refresh the dashboard to see scores.`);
    } catch (e) {
      console.error('sync error', e);
      alert('❌ Sync failed. Check the console for details.');
    }
  };

  const filtered = filter === 'all' ? projects : projects.filter(p => p.status === filter);

  if (loading) return (
    <div style={{ width: '100%', height: '100vh', background: TOKENS.bg, display: 'grid', placeItems: 'center', color: TOKENS.accent, fontFamily: FONT, fontSize: 14, letterSpacing: 1 }}>
      LOADING…
    </div>
  );

  return (
    <AppShell
      title="Projects"
      subtitle={`${projects.length} repositories tracked`}
      user={user!}
      alertCount={alertCount}
      onLogout={logout}
      headerRight={(
        <button onClick={() => setShowModal(true)} style={{
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
      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        {[['all', 'All'], ['active', 'Active'], ['archived', 'Archived']].map(([val, label]) => {
          const isActive = filter === val;
          return (
            <button key={val} onClick={() => setFilter(val)} style={{
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
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1.4fr 2fr 80px',
          padding: '12px 22px', borderBottom: `1px solid ${TOKENS.border}`,
          fontFamily: FONT_MONO, fontSize: 10, color: TOKENS.textFaint,
          letterSpacing: 1, textTransform: 'uppercase', background: 'rgba(0,0,0,0.18)',
        }}>
          <div>Name</div><div>Status</div><div>Score</div><div>Repo URL</div><div />
        </div>
        {filtered.map((p, i) => <ProjectRow key={p.id} p={p} alt={i % 2 === 1} score={projectScores[p.id] || 0} onSync={handleSync} />)}
        {filtered.length === 0 && (
          <div style={{ padding: 60, textAlign: 'center', color: TOKENS.textDim, fontSize: 13 }}>
            No projects in this view.
          </div>
        )}
      </div>

      {showModal && <AddProjectModal onCancel={() => setShowModal(false)} onSubmit={handleAdd} />}
    </AppShell>
  );
}
