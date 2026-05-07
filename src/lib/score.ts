/* LEAP scoring formula — pure, side-effect free, single source of truth.
   Used by both the dashboard tiles and the per-PR breakdown panel so they
   always agree to the last decimal.

   Per the LLM scoring contract:
     X_norm = Σ severity_weight / √(1 + lines_modified)
     score  = 1000 · e^(-0.07 · max(0, X_norm − story_points))

   Severity weights (assigned by the LLM classifier on each review comment):
     0 — suggestion      (no penalty)
     1 — minor issue
     3 — correctness bug
     5 — critical issue
*/

import type { ReviewCommentInfo, Severity } from './types';

export const DECAY = 0.07;
export const MAX_SCORE = 1000;

export interface ScoreInputs {
  severity_weights: number[];   // raw weights, one per review comment
  lines_modified: number;
  story_points: number;
}

export interface ScoreBreakdown {
  severity_sum: number;         // Σ severity_weight
  severity_count: Record<Severity, number>;
  lines_modified: number;
  story_points: number;
  x_norm: number;               // Σ severity / √(1 + lines)
  delta: number;                // max(0, x_norm − story_points)
  exponent: number;             // -0.07 · delta
  score: number;                // 1000 · e^exponent — clamped to [0, 1000]
}

export function computeScore(inputs: ScoreInputs): ScoreBreakdown {
  const severity_sum  = inputs.severity_weights.reduce((a, b) => a + b, 0);
  const x_norm  = severity_sum / Math.sqrt(1 + Math.max(0, inputs.lines_modified));
  const delta   = Math.max(0, x_norm - inputs.story_points);
  const exponent = -DECAY * delta;
  const raw     = MAX_SCORE * Math.exp(exponent);
  const score   = Math.max(0, Math.min(MAX_SCORE, raw));

  const severity_count: Record<Severity, number> = { 0: 0, 1: 0, 3: 0, 5: 0 };
  for (const w of inputs.severity_weights) {
    if (w === 0 || w === 1 || w === 3 || w === 5) severity_count[w as Severity]++;
  }

  return {
    severity_sum,
    severity_count,
    lines_modified: inputs.lines_modified,
    story_points:   inputs.story_points,
    x_norm,
    delta,
    exponent,
    score,
  };
}

/** Convenience: derive the breakdown straight from an MR detail. */
export function scoreFromMRDetail(mr: {
  review_comments: ReviewCommentInfo[];
  lines_modified: number;
  story_points: number;
}): ScoreBreakdown {
  return computeScore({
    severity_weights: mr.review_comments.map((c) => c.severity_weight),
    lines_modified:   mr.lines_modified,
    story_points:     mr.story_points,
  });
}

/** Render a numeric value with a fixed precision but trimming trailing zeros. */
export function fmt(v: number, p = 2): string {
  if (!Number.isFinite(v)) return '—';
  return v.toFixed(p).replace(/\.?0+$/, '') || '0';
}
