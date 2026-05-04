import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { TOKENS, FONT, FONT_MONO } from '../styles/tokens';
import { AppShell } from '../components/layout/AppShell';
import { Avatar } from '../components/ui/Avatar';
import { SeverityPill } from '../components/ui/SeverityPill';
import { OutlineGreenButton } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { RelativeTime } from '../components/ui/RelativeTime';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  getProjects, getScores, getAlerts, getOverview,
  resolveAlert as apiResolveAlert, getJiraTasks,
} from '../services/api';
import { Project, DeveloperScore, Alert, ProjectOverview, JiraTask } from '../types';

function ScoreRing({ score, size = 64 }: { score: number; size?: number }) {
  const pct = Math.min(1, (score || 0) / 1000);
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - pct);
  return (
    <svg
      width={size} height={size}
      role="img" aria-label={`Score ${Math.round(score)} of 1000`}
      style={{ transform: 'rotate(-90deg)' }}
    >
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
  const hasRange = dev.min_score != null && dev.max_score != null && dev.merge_request_count > 1;
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: TOKENS.bgElev,
        border: `1px solid ${hover ? TOKENS.borderStrong : TOKENS.border}`,
        borderRadius: 12, padding: 18, transition: 'all 0.15s',
      }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 18 }}>
        <Avatar name={dev.name || 'Unknown'} size={38} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, color: TOKENS.text, fontWeight: 600, letterSpacing: -0.2 }}>{dev.name}</div>
          <div style={{ fontSize: 11.5, color: TOKENS.textDim, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dev.email}</div>
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
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
            <div style={{ textAlign: 'center', lineHeight: 1 }}>
              <div style={{ fontFamily: FONT, fontSize: 18, color: TOKENS.accent, fontWeight: 700, letterSpacing: -0.5 }}>{score}</div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 8, color: TOKENS.textFaint, marginTop: 2, letterSpacing: 0.5 }}>/ 1000</div>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, display: 'grid', gap: 8 }}>
          <Stat label="Avg score" value={score} />
          <Stat label="PRs"       value={dev.merge_request_count || 0} />
          {hasRange && (
            <Stat label="Range"   value={`${Math.round(dev.min_score!)}–${Math.round(dev.max_score!)}`} />
          )}
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

function MetricSkeleton() {
  return (
    <div style={{ flex: 1, background: TOKENS.bgElev, border: `1px solid ${TOKENS.border}`, borderRadius: 10, padding: '14px 18px' }}>
      <Skeleton width={80} height={10} />
      <Skeleton width={60} height={24} style={{ marginTop: 10 }} />
      <Skeleton width={100} height={11} style={{ marginTop: 6 }} />
    </div>
  );
}

function DeveloperCardSkeleton() {
  return (
    <div style={{ background: TOKENS.bgElev, border: `1px solid ${TOKENS.border}`, borderRadius: 12, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <Skeleton width={38} height={38} radius={19} />
        <div style={{ flex: 1 }}>
          <Skeleton width="60%" height={14} />
          <Skeleton width="80%" height={11} style={{ marginTop: 6 }} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Skeleton width={64} height={64} radius={32} />
        <div style={{ flex: 1, display: 'grid', gap: 10 }}>
          <Skeleton height={11} />
          <Skeleton height={11} />
        </div>
      </div>
    </div>
  );
}

function AlertRow({ alert, onResolve, busyId }: { alert: Alert; onResolve: (id: string) => void; busyId: string | null }) {
  const busy = busyId === alert.id;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderTop: `1px solid ${TOKENS.border}` }}>
      <SeverityPill level={alert.severity} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FONT, fontSize: 13.5, color: TOKENS.text, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {alert.message}
        </div>
        <div style={{ marginTop: 3 }}>
          <RelativeTime iso={alert.created_at} />
        </div>
      </div>
      {!alert.is_resolved
        ? <OutlineGreenButton onClick={() => onResolve(alert.id)} loading={busy}>Resolve</OutlineGreenButton>
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
  const toast = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [devs, setDevs] = useState<DeveloperScore[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [overview, setOverview] = useState<ProjectOverview | null>(null);
  const [jiraTasks, setJiraTasks] = useState<JiraTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const projs = await getProjects();
        if (cancelled) return;
        setProjects(projs);
        if (projs.length > 0) {
          const pid = projs[0].id;
          const [scoresRes, alertsRes, overviewRes, jiraRes] = await Promise.allSettled([
            getScores(pid),
            getAlerts(pid),
            getOverview(pid),
            getJiraTasks(pid),
          ]);
          if (cancelled) return;
          if (scoresRes.status === 'fulfilled') setDevs(Array.isArray(scoresRes.value) ? scoresRes.value : []);
          if (alertsRes.status === 'fulfilled') setAlerts(Array.isArray(alertsRes.value) ? alertsRes.value : []);
          if (overviewRes.status === 'fulfilled') setOverview(overviewRes.value);
          if (jiraRes.status === 'fulfilled') setJiraTasks(Array.isArray(jiraRes.value) ? jiraRes.value : []);
          if (jiraRes.status === 'rejected') {
            // don't toast on the very first load — Jira is optional
            console.warn('Jira tasks unavailable', jiraRes.reason);
          }
        }
      } catch (e) {
        toast.error('Could not load dashboard', 'Check your connection and try again.');
        console.error('Dashboard load error', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resolveAlert = async (id: string) => {
    setResolvingId(id);
    try {
      await apiResolveAlert(id);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_resolved: true } : a));
      toast.success('Alert resolved');
    } catch (e) {
      toast.error('Could not resolve alert', 'Please try again.');
    } finally {
      setResolvingId(null);
    }
  };

  const unresolved = useMemo(() => alerts.filter(a => !a.is_resolved), [alerts]);
  const criticalCount = unresolved.filter(a => a.severity === 'critical').length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const avgScore = devs.length > 0
    ? Math.round(devs.reduce((s, d) => s + (d.total_score || 0), 0) / devs.length)
    : 0;

  return (
    <AppShell
      title="Dashboard"
      subtitle="Engineering performance · last 30 days"
      user={user!}
      alertCount={unresolved.length}
      onLogout={logout}
    >
      <div className="leap-metric-row" style={{ display: 'flex', gap: 14, marginBottom: 28 }}>
        {loading ? (
          <>
            <MetricSkeleton /><MetricSkeleton /><MetricSkeleton /><MetricSkeleton />
          </>
        ) : (
          <>
            <MetricTile label="Avg dev score"       value={avgScore || '—'} sub={`across ${devs.length} engineers`} accent={TOKENS.accent} />
            <MetricTile label="Active projects"     value={activeProjects} sub={`of ${projects.length} total`} />
            <MetricTile label="Open alerts"         value={unresolved.length} sub={`${criticalCount} critical`} accent={unresolved.length > 0 ? TOKENS.warn : TOKENS.text} />
            <MetricTile label="Total contributors"  value={overview?.total_contributors ?? '—'} sub="across all projects" accent={TOKENS.accent} />
          </>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontFamily: FONT, fontSize: 14, color: TOKENS.text, fontWeight: 600, letterSpacing: -0.2 }}>Projects</h2>
        <div style={{ flex: 1 }} />
        <Link to="/projects" style={{ fontFamily: FONT_MONO, fontSize: 11, color: TOKENS.accent, textDecoration: 'none', letterSpacing: 0.4 }}>
          All projects →
        </Link>
      </div>
      {loading ? (
        <div className="leap-dev-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 32 }}>
          <Skeleton height={92} /><Skeleton height={92} /><Skeleton height={92} />
        </div>
      ) : projects.length === 0 ? (
        <div style={{
          padding: 32, textAlign: 'center',
          background: TOKENS.bgElev, border: `1px solid ${TOKENS.border}`, borderRadius: 12,
          color: TOKENS.textDim, fontFamily: FONT, fontSize: 13, marginBottom: 32,
        }}>
          No projects yet. <Link to="/projects" style={{ color: TOKENS.accent }}>Add one →</Link>
        </div>
      ) : (
        <div className="leap-dev-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 32 }}>
          {projects.slice(0, 6).map(p => {
            const initials = (p.name.split(' ').map(s => s[0]).filter(Boolean).slice(0, 2).join('') || '?').toUpperCase();
            const isActive = p.status === 'active';
            return (
              <Link
                key={p.id}
                to={`/projects/${p.id}`}
                style={{
                  background: TOKENS.bgElev,
                  border: `1px solid ${TOKENS.border}`,
                  borderRadius: 12, padding: 16,
                  textDecoration: 'none', color: 'inherit',
                  display: 'flex', alignItems: 'center', gap: 12,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = TOKENS.accent; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = TOKENS.border; }}
              >
                <div aria-hidden style={{
                  width: 38, height: 38, borderRadius: 8,
                  background: isActive ? TOKENS.accentSoft : 'rgba(255,255,255,0.06)',
                  color: isActive ? TOKENS.accent : TOKENS.textDim,
                  display: 'grid', placeItems: 'center',
                  fontFamily: FONT_MONO, fontSize: 13, fontWeight: 700,
                  border: `1px solid ${isActive ? 'rgba(0,168,107,0.3)' : TOKENS.border}`,
                  flexShrink: 0,
                }}>{initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, color: TOKENS.text, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.name}
                  </div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: TOKENS.textDim, marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.repo_url}
                  </div>
                </div>
                <span aria-hidden style={{ fontFamily: FONT_MONO, fontSize: 16, color: TOKENS.accent, flexShrink: 0 }}>→</span>
              </Link>
            );
          })}
        </div>
      )}

      <SectionHeader title="Developer Scores" />
      {loading ? (
        <div className="leap-dev-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 32 }}>
          <DeveloperCardSkeleton /><DeveloperCardSkeleton /><DeveloperCardSkeleton />
        </div>
      ) : devs.length === 0 ? (
        <div style={{
          padding: 32, textAlign: 'center',
          background: TOKENS.bgElev, border: `1px solid ${TOKENS.border}`, borderRadius: 12,
          color: TOKENS.textDim, fontFamily: FONT, fontSize: 13, marginBottom: 32,
        }}>
          <div style={{ marginBottom: 6 }}>No developer scores yet.</div>
          <div style={{ fontSize: 12, color: TOKENS.textFaint }}>
            Open Projects → Sync to pull commits and pull requests.
          </div>
        </div>
      ) : (
        <div className="leap-dev-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 32 }}>
          {devs.map(d => <DeveloperCard key={d.user_id} dev={d} />)}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontFamily: FONT, fontSize: 14, color: TOKENS.text, fontWeight: 600, letterSpacing: -0.2 }}>Recent Alerts</h2>
        {!loading && (
          <div style={{ fontSize: 11.5, color: TOKENS.textFaint, fontFamily: FONT_MONO, letterSpacing: 0.3 }}>
            {unresolved.length} open · sorted by severity
          </div>
        )}
        <div style={{ flex: 1 }} />
        <Link to="/alerts" style={{ fontFamily: FONT_MONO, fontSize: 11, color: TOKENS.accent, textDecoration: 'none', letterSpacing: 0.4 }}>
          View all alerts →
        </Link>
      </div>
      <div style={{ background: TOKENS.bgElev, border: `1px solid ${TOKENS.border}`, borderRadius: 12, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 16 }}>
            <Skeleton height={48} style={{ marginBottom: 8 }} />
            <Skeleton height={48} style={{ marginBottom: 8 }} />
            <Skeleton height={48} />
          </div>
        ) : alerts.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: TOKENS.textDim, fontSize: 13 }}>
            No alerts for this project.
          </div>
        ) : (
          alerts.slice(0, 5).map((a, i) => (
            <div key={a.id} style={{ marginTop: i === 0 ? -1 : 0 }}>
              <AlertRow alert={a} onResolve={resolveAlert} busyId={resolvingId} />
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: 32 }}>
        <h2 style={{ color: TOKENS.text, fontFamily: FONT_MONO, fontSize: 14, marginBottom: 12 }}>
          JIRA TASKS
        </h2>
        {loading ? (
          <Skeleton height={48} />
        ) : jiraTasks.length === 0 ? (
          <p style={{ color: TOKENS.textFaint, fontSize: 13 }}>No Jira tasks synced yet. Click Sync on a project.</p>
        ) : (
          jiraTasks.map((t) => (
            <div key={t.jira_key} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 16px', marginBottom: 8,
              background: TOKENS.bgElev, borderRadius: 8,
              border: `1px solid ${TOKENS.border}`,
              gap: 12, flexWrap: 'wrap',
            }}>
              <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: TOKENS.accent }}>{t.jira_key}</span>
              <span style={{ color: TOKENS.text, fontSize: 13, flex: 1, minWidth: 120 }}>{t.summary}</span>
              <span style={{ color: TOKENS.textFaint, fontSize: 12 }}>{t.status}</span>
              <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: TOKENS.accent }}>SP: {t.story_points ?? 0}</span>
            </div>
          ))
        )}
      </div>
    </AppShell>
  );
}
