import React, { useState } from 'react';
import { motion, AnimatePresence as APRaw } from 'framer-motion';
import { Pill } from '../ui/Pill';
import { ChevronDownIcon, GitBranchIcon, FileDiffIcon, HashIcon } from '../ui/Icon';
import { MergeRequestSummary, scoreBand } from '../../lib/types';
import { PRScoreBreakdown } from './PRScoreBreakdown';

const AnimatePresence = APRaw as unknown as React.FC<{
  children?: React.ReactNode;
  mode?: 'wait' | 'sync' | 'popLayout';
  initial?: boolean;
}>;

interface Props {
  prs: MergeRequestSummary[];
}

export function PRLedger({ prs }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const sorted = [...prs].sort((a, b) => a.score - b.score); // worst-first

  return (
    <ul style={{
      listStyle: 'none',
      margin: 0, padding: 0,
      display: 'flex', flexDirection: 'column',
      gap: 8,
    }}>
      {sorted.map((pr) => {
        const tone = scoreBand(pr.score);
        const open = openId === pr.id;
        return (
          <li key={pr.id}>
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              style={{
                borderRadius: 14,
                border: `1px solid ${open ? 'var(--leap-border)' : 'var(--leap-border-soft)'}`,
                background: open ? 'var(--leap-card-bg)' : 'var(--leap-surface-soft)',
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => setOpenId(open ? null : pr.id)}
                aria-expanded={open}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  display: 'grid',
                  gridTemplateColumns: 'auto auto 1fr auto auto auto',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 16px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'inherit',
                  transition: 'background 200ms',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--leap-surface-soft)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                {/* score chip */}
                <span style={{
                  display: 'inline-flex', alignItems: 'baseline',
                  gap: 4,
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: tone.faint,
                  border: `1px solid ${tone.soft}`,
                  color: tone.tone,
                }}>
                  <span style={{
                    fontFamily: "'Geist', system-ui",
                    fontSize: 14, fontWeight: 600,
                    letterSpacing: '-0.02em',
                  }}>
                    {Math.round(pr.score)}
                  </span>
                  <span style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: 9.5, letterSpacing: '0.16em',
                    color: tone.tone,
                    opacity: 0.75,
                  }}>
                    /1k
                  </span>
                </span>

                {/* mr id + jira key */}
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: 11, color: 'var(--leap-text-faint)',
                  letterSpacing: '0.10em',
                  whiteSpace: 'nowrap',
                }}>
                  #{pr.github_id ?? pr.id.slice(0, 5)}
                  {pr.jira_key && (
                    <span style={{
                      padding: '1px 6px',
                      borderRadius: 4,
                      border: '1px solid var(--leap-border)',
                      background: 'rgba(94, 234, 212, 0.08)',
                      color: 'var(--leap-accent-cyan)',
                      letterSpacing: '0.10em',
                    }}>
                      {pr.jira_key}
                    </span>
                  )}
                </span>

                {/* title */}
                <span style={{
                  minWidth: 0,
                  fontSize: 14, color: 'var(--leap-text)',
                  fontWeight: 500, letterSpacing: '-0.005em',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {pr.title}
                </span>

                {/* meta */}
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center', gap: 12,
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: 10.5, color: 'var(--leap-text-faint)',
                  letterSpacing: '0.06em',
                  whiteSpace: 'nowrap',
                }}>
                  <span><GitBranchIcon size={10} style={{ verticalAlign: '-1px', marginRight: 5 }} />
                    {pr.author_name ?? 'unknown'}
                  </span>
                  <span><FileDiffIcon size={10} style={{ verticalAlign: '-1px', marginRight: 5 }} />
                    {pr.lines_modified.toLocaleString()}
                  </span>
                  <span><HashIcon size={10} style={{ verticalAlign: '-1px', marginRight: 5 }} />
                    {pr.story_points}p
                  </span>
                </span>

                {/* status */}
                <Pill color={pr.status === 'merged' ? '#5eead4' : pr.status === 'review' ? '#a78bfa' : '#fbbf24'}>
                  {pr.status}
                </Pill>

                {/* chevron */}
                <span style={{
                  display: 'inline-flex',
                  width: 28, height: 28,
                  alignItems: 'center', justifyContent: 'center',
                  borderRadius: 999,
                  color: 'var(--leap-text-faint)',
                  transition: 'transform 240ms cubic-bezier(0.22,1,0.36,1), color 200ms',
                  transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                }}>
                  <ChevronDownIcon size={14} />
                </span>
              </button>

              <AnimatePresence>
                {open && (
                  <motion.div
                    key="body"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{    opacity: 0, height: 0 }}
                    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    style={{ padding: '0 16px 16px' }}
                  >
                    <PRScoreBreakdown mrId={pr.id} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </li>
        );
      })}
    </ul>
  );
}
