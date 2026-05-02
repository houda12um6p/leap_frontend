import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TOKENS, FONT, FONT_MONO } from '../styles/tokens';
import { AppShell } from '../components/layout/AppShell';
import { GhostButton } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { Avatar } from '../components/ui/Avatar';
import { RelativeTime } from '../components/ui/RelativeTime';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getMergeRequest, getProjects } from '../services/api';
import { MergeRequestDetail } from '../types';

const SEVERITY_LABEL: Record<number, { label: string; c: string }> = {
  0: { label: 'Suggestion',  c: TOKENS.low },
  1: { label: 'Minor issue', c: TOKENS.med },
  3: { label: 'Correctness', c: TOKENS.warn },
  5: { label: 'Critical',    c: TOKENS.danger },
};

const COMMIT_TYPE_COLOR: Record<string, string> = {
  feature:  TOKENS.accent,
  bugfix:   TOKENS.warn,
  refactor: '#A87CFF',
  other:    TOKENS.textFaint,
};

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { c: string; bg: string }> = {
    open:   { c: TOKENS.accent, bg: TOKENS.accentSoft },
    merged: { c: '#A87CFF',     bg: 'rgba(168,124,255,0.14)' },
    closed: { c: TOKENS.textFaint, bg: TOKENS.lowSoft },
  };
  const s = map[status] || map.closed;
  return (
    <span style={{
      padding: '3px 9px', background: s.bg, color: s.c,
      border: `1px solid ${s.c}40`, borderRadius: 999,
      fontSize: 10.5, fontWeight: 600, letterSpacing: 0.5,
      textTransform: 'uppercase', fontFamily: FONT_MONO,
    }}>{status}</span>
  );
}

function MetaTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{
      flex: 1, minWidth: 120,
      background: TOKENS.bgElev, border: `1px solid ${TOKENS.border}`,
      borderRadius: 10, padding: '12px 14px',
    }}>
      <div style={{ fontFamily: FONT_MONO, fontSize: 9.5, color: TOKENS.textFaint, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</div>
      <div style={{ fontFamily: FONT, fontSize: 18, color: TOKENS.text, fontWeight: 600, marginTop: 4 }}>{value}</div>
    </div>
  );
}

export function MergeRequestDetailPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { id } = useParams<{ id: string }>();
  const [mr, setMr] = useState<MergeRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await getMergeRequest(id!);
        if (cancelled) return;
        setMr(data);
        // light fetch for sidebar badge — best effort
        try {
          const projs = await getProjects();
          // not critical to fetch alerts; leave at 0
          if (!cancelled && projs.length > 0) setAlertCount(0);
        } catch { /* noop */ }
      } catch (e: any) {
        toast.error('Could not load merge request', e?.response?.data?.detail || 'It may have been deleted.');
        navigate(-1);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <AppShell
      title={loading ? 'Loading…' : (mr?.title || 'Merge request')}
      subtitle={mr ? (mr.github_id ? `#${mr.github_id}` : undefined) : undefined}
      user={user!}
      alertCount={alertCount}
      onLogout={logout}
      headerRight={(
        <div style={{ display: 'flex', gap: 8 }}>
          <GhostButton onClick={() => navigate(mr ? `/projects/${mr.project_id}` : '/projects')}>
            ← Project
          </GhostButton>
        </div>
      )}
    >
      {loading ? (
        <div style={{ display: 'grid', gap: 14 }}>
          <Skeleton height={28} width={300} />
          <Skeleton height={120} />
          <Skeleton height={200} />
        </div>
      ) : !mr ? null : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
            <StatusPill status={mr.status} />
            {mr.author_name && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar name={mr.author_name} size={22} />
                <span style={{ fontSize: 13, color: TOKENS.textDim }}>{mr.author_name}</span>
              </div>
            )}
            <span style={{ color: TOKENS.textFaint }}>·</span>
            <RelativeTime iso={mr.created_at} />
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            <MetaTile label="Score"            value={Math.round(mr.score || 0)} />
            <MetaTile label="Story points"     value={mr.story_points || 0} />
            <MetaTile label="Lines modified"   value={mr.lines_modified || 0} />
            <MetaTile label="Refactored lines" value={mr.refactored_lines || 0} />
            <MetaTile label="Commits"          value={mr.commits.length} />
            <MetaTile label="Review comments"  value={mr.review_comments.length} />
          </div>

          <h2 style={{ fontFamily: FONT, fontSize: 14, color: TOKENS.text, fontWeight: 600, margin: '0 0 12px' }}>Commits</h2>
          <div style={{ background: TOKENS.bgElev, border: `1px solid ${TOKENS.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 28 }}>
            {mr.commits.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: TOKENS.textDim, fontSize: 13 }}>
                No commits recorded.
              </div>
            ) : mr.commits.map((c, i) => (
              <div key={c.sha} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '12px 16px',
                borderTop: i === 0 ? 'none' : `1px solid ${TOKENS.border}`,
              }}>
                <span style={{
                  padding: '2px 7px', borderRadius: 4,
                  background: `${COMMIT_TYPE_COLOR[c.commit_type]}20`,
                  color: COMMIT_TYPE_COLOR[c.commit_type],
                  fontFamily: FONT_MONO, fontSize: 9.5, fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: 0.6,
                  flexShrink: 0,
                }}>{c.commit_type}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: FONT, fontSize: 13, color: TOKENS.text, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {c.message}
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: FONT_MONO, fontSize: 10.5, color: TOKENS.textFaint }}>
                      {c.sha.slice(0, 7)}
                    </span>
                    {c.author_name && <span style={{ fontSize: 11.5, color: TOKENS.textDim }}>{c.author_name}</span>}
                    <RelativeTime iso={c.date} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h2 style={{ fontFamily: FONT, fontSize: 14, color: TOKENS.text, fontWeight: 600, margin: '0 0 12px' }}>Review comments</h2>
          <div style={{ background: TOKENS.bgElev, border: `1px solid ${TOKENS.border}`, borderRadius: 12, overflow: 'hidden' }}>
            {mr.review_comments.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: TOKENS.textDim, fontSize: 13 }}>
                No review comments yet.
              </div>
            ) : mr.review_comments.map((r, i) => {
              const sev = SEVERITY_LABEL[r.severity_weight] || SEVERITY_LABEL[0];
              return (
                <div key={r.id} style={{
                  padding: '14px 16px',
                  borderTop: i === 0 ? 'none' : `1px solid ${TOKENS.border}`,
                  borderLeft: `3px solid ${sev.c}`,
                }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{
                      padding: '2px 8px', background: `${sev.c}20`, color: sev.c,
                      border: `1px solid ${sev.c}40`, borderRadius: 999,
                      fontSize: 10.5, fontWeight: 600, fontFamily: FONT_MONO,
                      textTransform: 'uppercase', letterSpacing: 0.4,
                    }}>{sev.label} · {r.severity_weight}</span>
                    {r.author_name && <span style={{ fontSize: 12, color: TOKENS.textDim }}>{r.author_name}</span>}
                    <RelativeTime iso={r.created_at} />
                  </div>
                  <div style={{ fontFamily: FONT, fontSize: 13, color: TOKENS.text, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {r.body}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </AppShell>
  );
}
