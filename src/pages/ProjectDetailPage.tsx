import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TOKENS, FONT, FONT_MONO } from '../styles/tokens';
import { AppShell } from '../components/layout/AppShell';
import { GhostButton, OutlineGreenButton, PrimaryButton } from '../components/ui/Button';
import { SeverityPill } from '../components/ui/SeverityPill';
import { Skeleton } from '../components/ui/Skeleton';
import { RelativeTime } from '../components/ui/RelativeTime';
import { Field } from '../components/ui/Field';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  getProject, getOverview, getProjectMergeRequests, getAlerts,
  resolveAlert as apiResolveAlert,
  syncGitHub, syncJiraTasks, calculateProjectScores,
  updateProject, deleteProject,
  parseRepoUrl,
} from '../services/api';
import {
  Project, ProjectOverview, MergeRequestSummary, Alert,
} from '../types';

function MetricTile({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div style={{ flex: 1, background: TOKENS.bgElev, border: `1px solid ${TOKENS.border}`, borderRadius: 10, padding: '14px 18px' }}>
      <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: TOKENS.textFaint, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</div>
      <div style={{ fontFamily: FONT, fontSize: 26, color: accent || TOKENS.text, fontWeight: 700, letterSpacing: -0.8, marginTop: 6 }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: TOKENS.textDim, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function ScoreBreakdownPanel({
  overview, mrs, navigate,
}: {
  overview: ProjectOverview;
  mrs: MergeRequestSummary[];
  navigate: (to: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const bd = overview.score_breakdown;
  const scored = bd?.scored_mr_count || 0;
  const score = Math.round(overview.project_score || 0);
  const total = overview.total_merge_requests || 0;
  const linkedById = new Map(mrs.map(m => [m.id, m]));

  return (
    <div style={{
      background: TOKENS.bgElev, border: `1px solid ${TOKENS.border}`,
      borderRadius: 12, padding: '14px 18px', marginBottom: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div style={{
          fontFamily: FONT_MONO, fontSize: 10, color: TOKENS.textFaint,
          textTransform: 'uppercase', letterSpacing: 0.8, minWidth: 110,
        }}>
          Project score
        </div>
        <div style={{
          fontFamily: FONT, fontSize: 22, color: TOKENS.accent,
          fontWeight: 700, letterSpacing: -0.5,
        }}>
          {scored ? score : '—'}
          <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: TOKENS.textFaint, fontWeight: 500, marginLeft: 6 }}>/ 1000</span>
        </div>
        <div style={{ flex: 1, fontSize: 12, color: TOKENS.textDim }}>
          {scored
            ? <>mean of {scored} MR score{scored === 1 ? '' : 's'}{scored < total ? ` (${total - scored} not yet scored)` : ''}{bd && bd.jira_linked_count > 0 ? ` · ${bd.jira_linked_count} linked to Jira` : ''}</>
            : <>no MR scores yet — click <em>Sync now</em> to populate</>}
        </div>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          style={{
            background: 'transparent', border: `1px solid ${TOKENS.border}`,
            color: TOKENS.textDim, borderRadius: 8, padding: '6px 12px',
            fontFamily: FONT_MONO, fontSize: 11, cursor: 'pointer',
          }}
        >
          {open ? 'Hide breakdown' : 'How is this calculated?'}
        </button>
      </div>

      {open && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${TOKENS.border}`, display: 'grid', gap: 12 }}>
          <div style={{ fontSize: 12.5, color: TOKENS.textDim, lineHeight: 1.55 }}>
            <strong style={{ color: TOKENS.text }}>Project score = mean of every MR's score</strong>, where each MR is scored
            on a 0–1000 scale. Each MR starts at 1000 and is penalized by review-comment severity, normalized for PR size, with an
            allowance from its linked Jira story points.
          </div>
          <div style={{
            fontFamily: FONT_MONO, fontSize: 12, color: TOKENS.text,
            background: TOKENS.bg, border: `1px solid ${TOKENS.border}`,
            borderRadius: 8, padding: '10px 14px', overflowX: 'auto',
          }}>
            score = 1000 · exp(-0.07 · max(0, X / √(1+L) − Δ))
            <div style={{ fontSize: 11, color: TOKENS.textFaint, marginTop: 4, lineHeight: 1.5 }}>
              X = Σ severity_weight of review comments · L = lines modified · Δ = Jira story points
            </div>
          </div>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 110 }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: TOKENS.textFaint, letterSpacing: 0.6 }}>SCORED MRs</div>
              <div style={{ fontFamily: FONT, fontSize: 18, color: TOKENS.text, fontWeight: 600, marginTop: 3 }}>{scored} / {total}</div>
            </div>
            <div style={{ flex: 1, minWidth: 110 }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: TOKENS.textFaint, letterSpacing: 0.6 }}>HIGHEST MR</div>
              <div style={{ fontFamily: FONT, fontSize: 18, color: TOKENS.accent, fontWeight: 600, marginTop: 3 }}>
                {scored ? Math.round(bd!.max_mr_score) : '—'}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 110 }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: TOKENS.textFaint, letterSpacing: 0.6 }}>LOWEST MR</div>
              <div style={{ fontFamily: FONT, fontSize: 18, color: TOKENS.warn, fontWeight: 600, marginTop: 3 }}>
                {scored ? Math.round(bd!.min_mr_score) : '—'}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 110 }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: TOKENS.textFaint, letterSpacing: 0.6 }}>JIRA-LINKED</div>
              <div style={{ fontFamily: FONT, fontSize: 18, color: TOKENS.text, fontWeight: 600, marginTop: 3 }}>
                {bd?.jira_linked_count ?? 0} / {total}
              </div>
            </div>
          </div>

          {bd && bd.lowest_mrs.length > 0 && (
            <div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: TOKENS.textFaint, letterSpacing: 0.6, marginBottom: 8 }}>
                LOWEST-SCORING MRs (drag the project average down most)
              </div>
              <div style={{ display: 'grid', gap: 6 }}>
                {bd.lowest_mrs.map(m => {
                  const summary = linkedById.get(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => navigate(`/merge-requests/${m.id}`)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        background: TOKENS.bg, border: `1px solid ${TOKENS.border}`,
                        borderRadius: 8, padding: '8px 12px', textAlign: 'left',
                        cursor: 'pointer', color: TOKENS.text, fontFamily: FONT,
                      }}
                    >
                      <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: TOKENS.warn, fontWeight: 600, minWidth: 40 }}>
                        {Math.round(m.score)}
                      </span>
                      <span style={{ flex: 1, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {m.title}
                      </span>
                      <span style={{ fontFamily: FONT_MONO, fontSize: 10.5, color: TOKENS.textFaint }}>
                        {m.lines_modified} lines
                      </span>
                      {m.jira_linked
                        ? <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TOKENS.accent, padding: '1px 6px', border: `1px solid ${TOKENS.accent}40`, borderRadius: 4 }}>JIRA</span>
                        : <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: TOKENS.textFaint, padding: '1px 6px', border: `1px solid ${TOKENS.border}`, borderRadius: 4 }}>NO JIRA</span>}
                      {summary && (
                        <MRStatusPill status={summary.status} />
                      )}
                      <span aria-hidden style={{ color: TOKENS.textFaint, fontFamily: FONT_MONO }}>→</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MRStatusPill({ status }: { status: string }) {
  const map: Record<string, { c: string; bg: string }> = {
    open:   { c: TOKENS.accent, bg: TOKENS.accentSoft },
    merged: { c: '#A87CFF', bg: 'rgba(168,124,255,0.14)' },
    closed: { c: TOKENS.textFaint, bg: TOKENS.lowSoft },
  };
  const s = map[status] || map.closed;
  return (
    <span style={{
      padding: '2px 8px', background: s.bg, color: s.c,
      border: `1px solid ${s.c}40`, borderRadius: 999,
      fontSize: 10.5, fontWeight: 600, letterSpacing: 0.4,
      textTransform: 'uppercase', fontFamily: FONT_MONO,
    }}>{status}</span>
  );
}

function EditProjectModal({ project, onCancel, onSave, busy }: {
  project: Project;
  onCancel: () => void;
  onSave: (changes: Partial<Pick<Project, 'name' | 'repo_url' | 'status'>>) => void;
  busy: boolean;
}) {
  const [name, setName] = useState(project.name);
  const [repoUrl, setRepoUrl] = useState(project.repo_url);
  const [status, setStatus] = useState(project.status);
  const repoErr = repoUrl && !parseRepoUrl(repoUrl) ? 'Use github.com/owner/repo.' : '';
  const valid = !!name.trim() && !!parseRepoUrl(repoUrl) && (status === 'active' || status === 'archived');

  return (
    <div role="dialog" aria-modal="true" aria-label="Edit project" style={{
      position: 'fixed', inset: 0,
      background: 'rgba(8,20,38,0.72)', backdropFilter: 'blur(4px)',
      display: 'grid', placeItems: 'center', zIndex: 100, padding: 14,
    }}>
      <div style={{ width: 460, maxWidth: '100%', background: TOKENS.bgElev, border: `1px solid ${TOKENS.borderStrong}`, borderRadius: 14, padding: 28 }}>
        <h2 style={{ margin: '0 0 18px', fontFamily: FONT, fontSize: 20, color: TOKENS.text, fontWeight: 600 }}>Edit project</h2>
        <div style={{ display: 'grid', gap: 14, marginBottom: 18 }}>
          <Field label="Name" value={name} onChange={setName} required />
          <Field label="Repository URL" value={repoUrl} onChange={setRepoUrl} error={repoErr} required />
          <div>
            <div style={{ fontSize: 11, color: TOKENS.textDim, marginBottom: 7, fontWeight: 500, letterSpacing: 0.3, textTransform: 'uppercase', fontFamily: FONT_MONO }}>
              Status
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['active', 'archived'] as const).map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setStatus(opt)}
                  aria-pressed={status === opt}
                  style={{
                    flex: 1, padding: '9px 12px',
                    background: status === opt ? TOKENS.accentSoft : 'transparent',
                    border: `1px solid ${status === opt ? 'rgba(0,168,107,0.45)' : TOKENS.border}`,
                    color: status === opt ? TOKENS.accent : TOKENS.textDim,
                    borderRadius: 8, fontFamily: FONT, fontSize: 13,
                    fontWeight: status === opt ? 600 : 400, cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >{opt}</button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <GhostButton onClick={onCancel}>Cancel</GhostButton>
          <PrimaryButton
            loading={busy}
            disabled={!valid}
            onClick={() => valid && onSave({ name: name.trim(), repo_url: repoUrl.trim(), status })}
          >Save changes</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function ConfirmDeleteModal({ projectName, onCancel, onConfirm, busy }: {
  projectName: string;
  onCancel: () => void;
  onConfirm: () => void;
  busy: boolean;
}) {
  const [text, setText] = useState('');
  const matches = text.trim() === projectName;
  return (
    <div role="dialog" aria-modal="true" aria-label="Delete project" style={{
      position: 'fixed', inset: 0,
      background: 'rgba(8,20,38,0.72)', backdropFilter: 'blur(4px)',
      display: 'grid', placeItems: 'center', zIndex: 100, padding: 14,
    }}>
      <div style={{ width: 460, maxWidth: '100%', background: TOKENS.bgElev, border: `1px solid ${TOKENS.danger}55`, borderLeft: `4px solid ${TOKENS.danger}`, borderRadius: 14, padding: 28 }}>
        <h2 style={{ margin: '0 0 8px', fontFamily: FONT, fontSize: 20, color: TOKENS.text, fontWeight: 600 }}>Delete this project?</h2>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: TOKENS.textDim, lineHeight: 1.5 }}>
          This will remove the project and all of its merge requests, alerts, commits and review comments. This cannot be undone.
        </p>
        <Field
          label={`Type "${projectName}" to confirm`}
          value={text}
          onChange={setText}
          placeholder={projectName}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
          <GhostButton onClick={onCancel}>Cancel</GhostButton>
          <button
            type="button"
            disabled={!matches || busy}
            onClick={onConfirm}
            style={{
              padding: '9px 16px',
              background: matches ? TOKENS.danger : 'rgba(255,59,59,0.4)',
              color: '#fff', border: 'none', borderRadius: 8,
              fontFamily: FONT, fontSize: 13, fontWeight: 600,
              cursor: matches && !busy ? 'pointer' : 'not-allowed',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
          >
            {busy && <span className="leap-spinner" aria-hidden />}
            Delete project
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProjectDetailPage() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [overview, setOverview] = useState<ProjectOverview | null>(null);
  const [mrs, setMrs] = useState<MergeRequestSummary[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [tab, setTab] = useState<'mrs' | 'alerts'>('mrs');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [pRes, ovRes, mrsRes, alertsRes] = await Promise.allSettled([
          getProject(id!),
          getOverview(id!),
          getProjectMergeRequests(id!),
          getAlerts(id!),
        ]);
        if (cancelled) return;
        if (pRes.status === 'fulfilled') setProject(pRes.value);
        else throw pRes.reason;
        if (ovRes.status === 'fulfilled') setOverview(ovRes.value);
        if (mrsRes.status === 'fulfilled') setMrs(mrsRes.value);
        if (alertsRes.status === 'fulfilled') setAlerts(alertsRes.value);
      } catch (e: any) {
        toast.error('Could not load project', e?.response?.data?.detail || 'It may have been deleted.');
        navigate('/projects');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const unresolved = alerts.filter(a => !a.is_resolved);

  const handleSync = async () => {
    if (!project) return;
    const parsed = parseRepoUrl(project.repo_url);
    if (!parsed) {
      toast.error('Invalid repository URL', 'Edit the project to fix the URL first.');
      return;
    }
    setSyncing(true);
    try {
      // Jira FIRST: github_service matches PR titles like "LEAP-101" against
      // existing JiraTask rows. If we sync GitHub first on a fresh project,
      // no JiraTask rows exist yet and the link is silently skipped.
      try { await syncJiraTasks(project.id); } catch (e) { console.warn('Jira sync failed (continuing)', e); }
      await syncGitHub(parsed.owner, parsed.repo, project.id);
      try { await calculateProjectScores(project.id); } catch (e) { console.warn('Score recalc failed', e); }
      const [ovRes, mrsRes] = await Promise.allSettled([
        getOverview(project.id),
        getProjectMergeRequests(project.id),
      ]);
      if (ovRes.status === 'fulfilled') setOverview(ovRes.value);
      if (mrsRes.status === 'fulfilled') setMrs(mrsRes.value);
      toast.success(`${project.name} synced`);
    } catch (e: any) {
      toast.error('Sync failed', e?.response?.data?.detail || 'Check that the repo is reachable.');
    } finally {
      setSyncing(false);
    }
  };

  const handleResolve = async (alertId: string) => {
    setResolvingId(alertId);
    try {
      await apiResolveAlert(alertId);
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, is_resolved: true } : a));
      toast.success('Alert resolved');
    } catch (e) {
      toast.error('Could not resolve alert');
    } finally {
      setResolvingId(null);
    }
  };

  const handleSaveEdit = async (changes: Partial<Pick<Project, 'name' | 'repo_url' | 'status'>>) => {
    if (!project) return;
    setSavingEdit(true);
    try {
      const updated = await updateProject(project.id, changes);
      setProject(updated);
      setShowEdit(false);
      toast.success('Project updated');
    } catch (e: any) {
      toast.error('Could not update project', e?.response?.data?.detail || 'Please try again.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!project) return;
    setDeleting(true);
    try {
      await deleteProject(project.id);
      toast.success('Project deleted');
      navigate('/projects');
    } catch (e: any) {
      toast.error('Could not delete project', e?.response?.data?.detail || 'Please try again.');
      setDeleting(false);
    }
  };

  const filteredMrs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return mrs;
    return mrs.filter(m =>
      m.title.toLowerCase().includes(q) ||
      (m.author_name || '').toLowerCase().includes(q)
    );
  }, [mrs, search]);

  const filteredAlerts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return alerts;
    return alerts.filter(a =>
      a.message.toLowerCase().includes(q) || (a.type || '').toLowerCase().includes(q)
    );
  }, [alerts, search]);

  return (
    <AppShell
      title={project?.name || (loading ? 'Loading…' : 'Project')}
      subtitle={project?.repo_url}
      user={user!}
      alertCount={unresolved.length}
      onLogout={logout}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder={tab === 'mrs' ? 'Search merge requests…' : 'Search alerts…'}
      headerRight={(
        <div style={{ display: 'flex', gap: 8 }}>
          <GhostButton onClick={() => navigate('/projects')}>← Projects</GhostButton>
          <GhostButton onClick={() => setShowEdit(true)}>Edit</GhostButton>
          <GhostButton onClick={() => setShowDelete(true)} danger>Delete</GhostButton>
          <button
            onClick={handleSync}
            disabled={syncing || !project}
            aria-busy={syncing || undefined}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '8px 14px',
              background: TOKENS.accent, color: '#03130A',
              border: 'none', borderRadius: 8,
              fontFamily: FONT, fontSize: 13, fontWeight: 600,
              cursor: syncing ? 'wait' : 'pointer',
              boxShadow: '0 1px 0 rgba(255,255,255,0.12) inset',
              opacity: syncing || !project ? 0.7 : 1,
            }}
          >
            {syncing && <span className="leap-spinner" aria-hidden style={{ color: '#03130A' }} />}
            {syncing ? 'Syncing…' : 'Sync now'}
          </button>
        </div>
      )}
    >
      <div className="leap-metric-row" style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
        <MetricTile
          label="Project score"
          value={loading ? '—' : (overview?.project_score != null ? Math.round(overview.project_score) : '—')}
          sub={overview && overview.score_breakdown.scored_mr_count > 0
            ? `mean of ${overview.score_breakdown.scored_mr_count} MR${overview.score_breakdown.scored_mr_count === 1 ? '' : 's'} · /1000`
            : 'no MR scores yet'}
          accent={TOKENS.accent}
        />
        <MetricTile label="Total MRs"        value={loading ? '—' : (overview?.total_merge_requests ?? mrs.length)} />
        <MetricTile label="Open MRs"         value={loading ? '—' : (overview?.open_merge_requests ?? mrs.filter(m => m.status === 'open').length)} accent={TOKENS.accent} />
        <MetricTile label="Total commits"    value={loading ? '—' : (overview?.total_commits ?? '—')} />
        <MetricTile label="Open alerts"      value={loading ? '—' : unresolved.length} accent={unresolved.length > 0 ? TOKENS.warn : TOKENS.text} />
        <MetricTile label="Contributors"     value={loading ? '—' : (overview?.total_contributors ?? '—')} accent={TOKENS.accent} />
      </div>

      {!loading && overview && (
        <ScoreBreakdownPanel overview={overview} mrs={mrs} navigate={navigate} />
      )}

      <div style={{ display: 'flex', gap: 4, marginBottom: 18, borderBottom: `1px solid ${TOKENS.border}` }}>
        {(['mrs', 'alerts'] as const).map(k => {
          const isActive = tab === k;
          const count = k === 'mrs' ? mrs.length : alerts.length;
          return (
            <button key={k} onClick={() => setTab(k)} aria-pressed={isActive} style={{
              padding: '9px 14px', background: 'transparent', border: 'none',
              borderBottom: `2px solid ${isActive ? TOKENS.accent : 'transparent'}`,
              color: isActive ? TOKENS.text : TOKENS.textDim,
              fontFamily: FONT, fontSize: 13, fontWeight: isActive ? 600 : 400,
              cursor: 'pointer', marginBottom: -1,
              display: 'inline-flex', alignItems: 'center', gap: 7,
            }}>
              {k === 'mrs' ? 'Merge Requests' : 'Alerts'}
              <span style={{
                fontFamily: FONT_MONO, fontSize: 10.5, padding: '1px 6px', borderRadius: 4,
                background: isActive ? TOKENS.accentSoft : 'rgba(255,255,255,0.06)',
                color: isActive ? TOKENS.accent : TOKENS.textFaint,
              }}>{count}</span>
            </button>
          );
        })}
      </div>

      {tab === 'mrs' ? (
        <div style={{ background: TOKENS.bgElev, border: `1px solid ${TOKENS.border}`, borderRadius: 12, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 16, display: 'grid', gap: 8 }}>
              <Skeleton height={56} /><Skeleton height={56} /><Skeleton height={56} />
            </div>
          ) : filteredMrs.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: TOKENS.textDim, fontSize: 13 }}>
              {mrs.length === 0
                ? 'No merge requests synced yet. Click Sync now to pull from GitHub.'
                : 'No merge requests match your search.'}
            </div>
          ) : filteredMrs.map((m, i) => (
            <button
              key={m.id}
              onClick={() => navigate(`/merge-requests/${m.id}`)}
              style={{
                width: '100%', textAlign: 'left',
                background: i % 2 === 1 ? TOKENS.bgElev2 : TOKENS.bgElev,
                border: 'none', borderTop: `1px solid ${TOKENS.border}`,
                padding: '14px 22px', cursor: 'pointer', color: TOKENS.text,
                display: 'flex', alignItems: 'center', gap: 14,
                fontFamily: FONT,
              }}
            >
              <MRStatusPill status={m.status} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {m.title}
                </div>
                <div style={{ fontSize: 11.5, color: TOKENS.textDim, marginTop: 3, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {m.author_name && <span>{m.author_name}</span>}
                  <RelativeTime iso={m.updated_at || m.created_at} />
                  <span style={{ fontFamily: FONT_MONO }}>+{m.lines_modified || 0} lines</span>
                  {m.refactored_lines > 0 && (
                    <span style={{ fontFamily: FONT_MONO, color: TOKENS.accent }}>↻ {m.refactored_lines}</span>
                  )}
                </div>
              </div>
              <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: TOKENS.accent, fontWeight: 600 }}>
                {Math.round(m.score || 0)}
              </span>
              <span aria-hidden style={{ color: TOKENS.textFaint, fontFamily: FONT_MONO }}>→</span>
            </button>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {loading ? (
            <>
              <Skeleton height={92} /><Skeleton height={92} /><Skeleton height={92} />
            </>
          ) : filteredAlerts.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', background: TOKENS.bgElev, border: `1px solid ${TOKENS.border}`, borderRadius: 12, color: TOKENS.textDim, fontSize: 13 }}>
              No alerts match.
            </div>
          ) : filteredAlerts.map(a => (
            <div key={a.id} style={{
              background: TOKENS.bgElev, border: `1px solid ${TOKENS.border}`,
              borderRadius: 12, padding: '14px 18px',
              display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
            }}>
              <SeverityPill level={a.severity} />
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ fontSize: 13.5, color: TOKENS.text, fontWeight: 500 }}>{a.message}</div>
                <div style={{ fontSize: 11.5, color: TOKENS.textDim, marginTop: 4, display: 'flex', gap: 10 }}>
                  <span>{a.type}</span>
                  <RelativeTime iso={a.created_at} />
                </div>
              </div>
              {a.is_resolved
                ? <OutlineGreenButton disabled>Resolved</OutlineGreenButton>
                : <OutlineGreenButton onClick={() => handleResolve(a.id)} loading={resolvingId === a.id}>Resolve</OutlineGreenButton>}
            </div>
          ))}
        </div>
      )}

      {showEdit && project && (
        <EditProjectModal
          project={project}
          onCancel={() => setShowEdit(false)}
          onSave={handleSaveEdit}
          busy={savingEdit}
        />
      )}
      {showDelete && project && (
        <ConfirmDeleteModal
          projectName={project.name}
          onCancel={() => setShowDelete(false)}
          onConfirm={handleDelete}
          busy={deleting}
        />
      )}
    </AppShell>
  );
}
