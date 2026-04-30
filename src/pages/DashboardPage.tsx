import React, { useEffect, useState } from 'react';
import { TOKENS, FONT, FONT_MONO } from '../styles/tokens';
import { AppShell } from '../components/layout/AppShell';
import { Avatar } from '../components/ui/Avatar';
import { SeverityPill } from '../components/ui/SeverityPill';
import { OutlineGreenButton } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { getProjects, getScores, getAlerts, getOverview, resolveAlert as apiResolveAlert, api } from '../services/api';
import { Project, DeveloperScore, Alert, ProjectOverview } from '../types';

function ScoreRing({ score, size = 64 }: { score: number; size?: number }) {
  const pct = Math.min(1, (score || 0) / 1000);
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - pct);
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={TOKENS.accent} strokeWidth="4"
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s' }} />
    </svg>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: TOKENS.textFaint, textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 14, color: TOKENS.text, fontWeight: 500 }}>{value}</div>
    </div>
  );
}

function DeveloperCard({ dev }: { dev: DeveloperScore }) {
  const [hover, setHover] = useState(false);
  const score = Math.round(dev.total_score || 0);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: TOKENS.bgElev,
        border: `1px solid ${hover ? TOKENS.borderStrong : TOKENS.border}`,
        borderRadius: 12, padding: 18, transition: 'all 0.15s', cursor: 'pointer',
      }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 18 }}>
        <Avatar name={dev.name || 'Unknown'} size={38} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, color: TOKENS.text, fontWeight: 600, letterSpacing: -0.2 }}>{dev.name}</div>
          <div style={{ fontSize: 11.5, color: TOKENS.textDim, marginTop: 2 }}>{dev.email}</div>
        </div>
        <div style={{
          padding: '2px 7px', background: TOKENS.accentSoft, color: TOKENS.accent,
          borderRadius: 999, fontSize: 10.5, fontWeight: 600, fontFamily: FONT_MONO,
        }}>
          {dev.merge_request_count || 0} MRs
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ position: 'relative' }}>
          <ScoreRing score={score} />
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
            <div style={{ textAlign: 'center', lineHeight: 1 }}>
              <div style={{ fontFamily: FONT, fontSize: 18, color: TOKENS.accent, fontWeight: 700, letterSpacing: -0.5 }}>{score}</div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 8, color: TOKENS.textFaint, marginTop: 2, letterSpacing: 0.5 }}>/ 1000</div>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, display: 'grid', gap: 8 }}>
          <Stat label="Score" value={score} />
          <Stat label="PRs"   value={dev.merge_request_count || 0} />
        </div>
      </div>
    </div>
  );
}

function MetricTile({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div style={{ flex: 1, background: TOKENS.bgElev, border: `1px solid ${TOKENS.border}`, borderRadius: 10, padding: '14px 18px' }}>
      <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: TOKENS.textFaint, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</div>
      <div style={{ fontFamily: FONT, fontSize: 26, color: accent || TOKENS.text, fontWeight: 700, letterSpacing: -0.8, marginTop: 6 }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: TOKENS.textDim, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function AlertRow({ alert, onResolve }: { alert: Alert; onResolve: (id: string) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderTop: `1px solid ${TOKENS.border}` }}>
      <SeverityPill level={alert.severity} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FONT, fontSize: 13.5, color: TOKENS.text, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {alert.message}
        </div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 10.5, color: TOKENS.textFaint, marginTop: 3, letterSpacing: 0.3 }}>
          {new Date(alert.created_at).toLocaleString()}
        </div>
      </div>
      {!alert.is_resolved
        ? <OutlineGreenButton onClick={() => onResolve(alert.id)}>Resolve</OutlineGreenButton>
        : <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: TOKENS.textFaint }}>Resolved</span>}
    </div>
  );
}

function SectionHeader({ title, caption }: { title: string; caption?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 14 }}>
      <h2 style={{ margin: 0, fontFamily: FONT, fontSize: 14, color: TOKENS.text, fontWeight: 600, letterSpacing: -0.2 }}>{title}</h2>
      {caption && <div style={{ fontSize: 11.5, color: TOKENS.textFaint, fontFamily: FONT_MONO, letterSpacing: 0.3 }}>{caption}</div>}
      <div style={{ flex: 1 }} />
    </div>
  );
}

export function DashboardPage() {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [devs, setDevs] = useState<DeveloperScore[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [overview, setOverview] = useState<ProjectOverview | null>(null);
  const [jiraTasks, setJiraTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const projs = await getProjects();
        setProjects(projs);
        if (projs.length > 0) {
          const pid = projs[0].id;
          const [scores, alrts, ov] = await Promise.all([
            getScores(pid),
            getAlerts(pid),
            getOverview(pid),
          ]);
          setDevs(Array.isArray(scores) ? scores : []);
          setAlerts(Array.isArray(alrts) ? alrts : []);
          setOverview(ov);
          // fetch jira tasks for this project
          try {
            const jiraRes = await api.get('/jira/tasks/' + pid);
            setJiraTasks(jiraRes.data);
          } catch (e) {
            console.log('no jira tasks yet', e);
          }
        }
      } catch (e) {
        console.error('Dashboard load error', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const resolveAlert = async (id: string) => {
    try {
      await apiResolveAlert(id);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_resolved: true } : a));
    } catch (e) { console.error('resolve error', e); }
  };

  const unresolved = alerts.filter(a => !a.is_resolved);
  const criticalCount = unresolved.filter(a => a.severity === 'critical').length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const avgScore = devs.length > 0
    ? Math.round(devs.reduce((s, d) => s + (d.total_score || 0), 0) / devs.length)
    : 0;

  if (loading) {
    return (
      <div style={{ width: '100%', height: '100vh', background: TOKENS.bg, display: 'grid', placeItems: 'center', color: TOKENS.accent, fontFamily: FONT, fontSize: 14, letterSpacing: 1 }}>
        LOADING…
      </div>
    );
  }

  return (
    <AppShell title="Dashboard" subtitle="Engineering performance · last 30 days" user={user!} alertCount={unresolved.length} onLogout={logout}>
      <div style={{ display: 'flex', gap: 14, marginBottom: 28 }}>
        <MetricTile label="Avg dev score"       value={avgScore || '—'} sub={`across ${devs.length} engineers`} accent={TOKENS.accent} />
        <MetricTile label="Active projects"     value={activeProjects} sub={`of ${projects.length} total`} />
        <MetricTile label="Open alerts"         value={unresolved.length} sub={`${criticalCount} critical`} accent={unresolved.length > 0 ? TOKENS.warn : TOKENS.text} />
        <MetricTile label="Total contributors"  value={overview?.total_contributors ?? '—'} sub="across all projects" accent={TOKENS.accent} />
      </div>

      <SectionHeader title="Developer Scores" />
      {devs.length === 0 ? (
        <div style={{ padding: '40px 0', textAlign: 'center', color: TOKENS.textDim, fontFamily: FONT, fontSize: 13, marginBottom: 32 }}>
          No developer scores yet. Sync a GitHub repository to start tracking.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 32 }}>
          {devs.map(d => <DeveloperCard key={d.user_id} dev={d} />)}
        </div>
      )}

      <SectionHeader title="Recent Alerts" caption={`${unresolved.length} open · sorted by severity`} />
      <div style={{ background: TOKENS.bgElev, border: `1px solid ${TOKENS.border}`, borderRadius: 12, overflow: 'hidden' }}>
        {alerts.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: TOKENS.textDim, fontSize: 13 }}>
            No alerts for this project.
          </div>
        ) : (
          alerts.slice(0, 5).map((a, i) => (
            <div key={a.id} style={{ marginTop: i === 0 ? -1 : 0 }}>
              <AlertRow alert={a} onResolve={resolveAlert} />
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: 32 }}>
        <h2 style={{ color: TOKENS.text, fontFamily: FONT_MONO, fontSize: 14, marginBottom: 12 }}>
          JIRA TASKS
        </h2>
        {jiraTasks.length === 0 ? (
          <p style={{ color: TOKENS.textFaint, fontSize: 13 }}>No Jira tasks synced yet. Click Sync on a project.</p>
        ) : (
          jiraTasks.map((t: any) => (
            <div key={t.jira_key} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 16px', marginBottom: 8,
              background: TOKENS.bgElev, borderRadius: 8,
              border: `1px solid ${TOKENS.border}`
            }}>
              <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: TOKENS.accent }}>{t.jira_key}</span>
              <span style={{ color: TOKENS.text, fontSize: 13, flex: 1, marginLeft: 16 }}>{t.summary}</span>
              <span style={{ color: TOKENS.textFaint, fontSize: 12, marginLeft: 16 }}>{t.status}</span>
              <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: TOKENS.accent, marginLeft: 16 }}>SP: {t.story_points}</span>
            </div>
          ))
        )}
      </div>
    </AppShell>
  );
}
