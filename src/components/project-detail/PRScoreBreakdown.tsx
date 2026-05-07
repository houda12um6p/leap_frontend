import React from 'react';
import { motion } from 'framer-motion';
import { useMergeRequest } from '../../lib/api';
import { scoreFromMRDetail, fmt } from '../../lib/score';
import { ScoreGauge } from '../score/ScoreGauge';
import { SeveritySegments } from '../score/SeveritySegments';
import { FormulaPill } from '../score/FormulaPill';
import { Pill } from '../ui/Pill';
import {
  HashIcon, FileDiffIcon, MessageSquareIcon, GitBranchIcon, SparkleIcon,
} from '../ui/Icon';
import type { Severity } from '../../lib/types';
import { severityColor, severityLabel, scoreBand } from '../../lib/types';

interface Props {
  mrId: string;
}

/** Crown jewel — full transparent breakdown of one PR's score. */
export function PRScoreBreakdown({ mrId }: Props) {
  const q = useMergeRequest(mrId);
  if (q.isLoading) {
    return <SkeletonBreakdown />;
  }
  const mr = q.data;
  if (!mr) return null;

  const breakdown = scoreFromMRDetail(mr);
  const tone = scoreBand(breakdown.score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{
        marginTop: 14,
        padding: 22,
        borderRadius: 16,
        border: '1px solid var(--leap-border)',
        background: 'rgba(8, 12, 22, 0.55)',
        boxShadow: `0 0 0 1px ${tone.tone}11, 0 18px 48px ${tone.tone}10`,
      }}
    >
      {/* header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <Pill color={tone.tone}>{tone.label}</Pill>
        <span style={{
          fontFamily: "'Geist Mono', monospace",
          fontSize: 10.5, color: 'var(--leap-text-faint)',
          letterSpacing: '0.10em',
        }}>
          <GitBranchIcon size={11} style={{ verticalAlign: '-1px', marginRight: 6 }} />
          {mr.author_name ?? 'unknown'} · {mr.status} · #{mr.github_id ?? mr.id.slice(0, 6)}
        </span>
      </div>

      {/* main content: stats + gauge */}
      <div style={{
        marginTop: 18,
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 240px',
        gap: 24,
        alignItems: 'start',
      }}>
        <div>
          {/* numeric stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 10,
          }}>
            <Stat icon={<HashIcon size={11} />}      label="Commits"     value={mr.commits.length} />
            <Stat icon={<FileDiffIcon size={11} />}  label="Lines"       value={mr.lines_modified.toLocaleString()} />
            <Stat icon={<MessageSquareIcon size={11} />} label="Comments" value={mr.review_comments.length} />
            <Stat icon={<SparkleIcon size={11} />}   label="Story pts"   value={mr.story_points} />
          </div>

          {/* severity segments */}
          <div style={{
            marginTop: 18,
            padding: 16,
            borderRadius: 12,
            border: '1px solid var(--leap-border-soft)',
            background: 'rgba(255,255,255,0.02)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: "'Geist Mono', monospace",
              fontSize: 10, letterSpacing: '0.22em',
              textTransform: 'uppercase', color: 'var(--leap-text-faint)',
              marginBottom: 12,
            }}>
              Review-comment severity
              <span style={{ marginLeft: 'auto', color: 'var(--leap-text-dim)' }}>
                Σ = {breakdown.severity_sum}
              </span>
            </div>
            <SeveritySegments counts={breakdown.severity_count} />
          </div>

          {/* formula */}
          <div style={{ marginTop: 18 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: "'Geist Mono', monospace",
              fontSize: 10, letterSpacing: '0.22em',
              textTransform: 'uppercase', color: 'var(--leap-text-faint)',
              marginBottom: 10,
            }}>
              <SparkleIcon size={11} />
              Formula · plugged in
            </div>
            <FormulaPill values={{
              severity_sum:   breakdown.severity_sum,
              lines_modified: breakdown.lines_modified,
              x_norm:         breakdown.x_norm,
              story_points:   breakdown.story_points,
              delta:          breakdown.delta,
              score:          breakdown.score,
            }} />
          </div>
        </div>

        {/* gauge column */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <ScoreGauge score={breakdown.score} size={220} />
          <div style={{
            fontSize: 36, fontWeight: 600,
            letterSpacing: '-0.04em',
            background: `linear-gradient(180deg, #ffffff 0%, ${tone.tone} 130%)`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            marginTop: -10,
          }}>
            {fmt(breakdown.score, 0)}
          </div>
          <div style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: 10.5, color: 'var(--leap-text-faint)',
            letterSpacing: '0.18em', textTransform: 'uppercase',
          }}>
            of 1000
          </div>
        </div>
      </div>

      {/* recent review comments — surface the inputs */}
      {mr.review_comments.length > 0 && (
        <div style={{ marginTop: 22 }}>
          <div style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: 10, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: 'var(--leap-text-faint)',
            marginBottom: 10,
          }}>
            Comments fed into the formula
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {mr.review_comments.map((c) => (
              <li
                key={c.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid var(--leap-border-soft)',
                  background: 'rgba(255,255,255,0.02)',
                }}
              >
                <Pill color={severityColor(c.severity_weight as Severity)}>
                  w{c.severity_weight} · {severityLabel(c.severity_weight as Severity)}
                </Pill>
                <span style={{
                  fontSize: 13, color: 'var(--leap-text-dim)',
                  lineHeight: 1.4, flex: 1,
                }}>
                  {c.body}
                </span>
                <span style={{
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: 10, color: 'var(--leap-text-faint)',
                  letterSpacing: '0.06em',
                }}>
                  {c.author_name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div style={{
      padding: 14,
      borderRadius: 10,
      border: '1px solid var(--leap-border-soft)',
      background: 'rgba(255,255,255,0.02)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontFamily: "'Geist Mono', monospace",
        fontSize: 9.5, letterSpacing: '0.22em',
        textTransform: 'uppercase', color: 'var(--leap-text-faint)',
      }}>
        {icon} {label}
      </div>
      <div style={{
        fontSize: 18, fontWeight: 500,
        color: 'var(--leap-text)',
        letterSpacing: '-0.02em',
        marginTop: 4,
      }}>
        {value}
      </div>
    </div>
  );
}

function SkeletonBreakdown() {
  return (
    <div style={{
      marginTop: 14,
      padding: 22, height: 280,
      borderRadius: 16,
      border: '1px solid var(--leap-border-soft)',
      background: 'rgba(255,255,255,0.02)',
    }}>
      <div className="leap-skel" style={{ width: 120, height: 12, marginBottom: 14 }} />
      <div className="leap-skel" style={{ width: '60%',  height: 22 }} />
    </div>
  );
}
