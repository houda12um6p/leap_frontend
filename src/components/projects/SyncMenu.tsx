import React, { useState } from 'react';
import { motion, AnimatePresence as APRaw } from 'framer-motion';
import { Button } from '../ui/Button';
import { SyncIcon, ChevronDownIcon } from '../ui/Icon';
import { useSyncProject, SyncProjectKind } from '../../lib/api';

const AnimatePresence = APRaw as unknown as React.FC<{
  children?: React.ReactNode;
  mode?: 'wait' | 'sync' | 'popLayout';
  initial?: boolean;
}>;

interface Props {
  projectId: string;
  repoUrl?: string;
}

function parseRepo(url: string): { owner: string; repo: string } | null {
  if (!url) return null;
  const m = url.match(/[/:]([^/:]+)\/([^/]+?)(?:\.git)?(?:\/)?$/);
  return m ? { owner: m[1], repo: m[2] } : null;
}

export function SyncMenu({ projectId, repoUrl }: Props) {
  const [open, setOpen] = useState(false);
  const sync = useSyncProject();
  const repo = parseRepo(repoUrl ?? '');
  const [last, setLast] = useState<string | null>(null);

  async function run(kind: SyncProjectKind['kind']) {
    setOpen(false);
    setLast(null);
    const input: SyncProjectKind = {
      kind,
      projectId,
      repo_owner: repo?.owner,
      repo_name: repo?.repo,
    };
    try {
      await sync.mutateAsync(input);
      setLast(`Synced · ${labelFor(kind)}`);
    } catch (e: any) {
      const detail =
        (e as any)?.response?.data?.detail ??
        (e as any)?.data?.detail ??
        (e as Error)?.message ??
        'unknown error';
      setLast(`Sync failed · ${detail}`);
      console.error('Sync error:', e?.response?.data?.detail || e?.message || e);
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <Button
        variant="glass"
        size="md"
        onClick={() => setOpen((o) => !o)}
        icon={<SyncIcon size={14} className={sync.isPending ? 'leap-spin' : undefined} />}
        trailing={<ChevronDownIcon size={12} />}
      >
        {sync.isPending ? 'Syncing…' : 'Sync'}
      </Button>
      <AnimatePresence>
        {open && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: -6, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              minWidth: 260,
              padding: 6,
              borderRadius: 14,
              border: '1px solid var(--leap-border)',
              background: 'var(--leap-card-bg)',
              backdropFilter: 'blur(28px) saturate(160%)',
              WebkitBackdropFilter: 'blur(28px) saturate(160%)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
              zIndex: 60,
            }}
          >
            <MenuItem label="GitHub · pull requests"     desc="POST /github/sync/pull-requests"     onClick={() => run('github-prs')}             />
            <MenuItem label="GitHub · commits"           desc="POST /github/sync/commits"           onClick={() => run('github-commits')}         />
            <MenuItem label="GitHub · review comments"   desc="POST /github/sync/review-comments"   onClick={() => run('github-review-comments')} />
            <MenuItem label="Jira · tasks"               desc="POST /jira/sync/tasks"               onClick={() => run('jira-tasks')}             />
            <MenuItem label="Recalculate scores"         desc="POST /scores/project/{id}/calculate"      onClick={() => run('recalc-scores')}           highlight />
          </motion.div>
        )}
      </AnimatePresence>

      {last && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          padding: '8px 12px',
          borderRadius: 8,
          background: 'rgba(94, 234, 212, 0.1)',
          color: '#5eead4',
          fontFamily: "'Geist Mono', monospace",
          fontSize: 10.5,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          zIndex: 20,
        }}>
          {last}
        </div>
      )}
    </div>
  );
}

function MenuItem({
  label, desc, onClick, highlight,
}: { label: string; desc: string; onClick: () => void; highlight?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '10px 12px',
        borderRadius: 10,
        background: 'transparent',
        border: '1px solid transparent',
        transition: 'background 180ms ease, border-color 180ms ease',
        cursor: 'pointer',
        color: highlight ? '#5eead4' : 'var(--leap-text)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'color-mix(in srgb, var(--leap-text) 6%, transparent)';
        e.currentTarget.style.borderColor = 'var(--leap-border)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.borderColor = 'transparent';
      }}
    >
      <div style={{
        fontSize: 13, fontWeight: 500,
        letterSpacing: '-0.005em',
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: "'Geist Mono', monospace",
        fontSize: 10, color: 'var(--leap-text-faint)',
        letterSpacing: '0.06em',
        marginTop: 2,
      }}>
        {desc}
      </div>
    </button>
  );
}

function labelFor(kind: SyncProjectKind['kind']): string {
  return kind === 'github-prs'             ? 'GitHub PRs' :
         kind === 'github-commits'         ? 'GitHub commits' :
         kind === 'github-review-comments' ? 'GitHub review comments' :
         kind === 'jira-tasks'             ? 'Jira tasks' :
                                             'Score recalculation';
}
