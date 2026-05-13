/* Shape of the LEAP backend at localhost:8011/api/v1.
   Verified against leap_backend/app/models + routers. */

/* ---------- entities ---------- */

export interface Project {
  id: string;
  name: string;
  repo_url: string;
  status: 'active' | 'archived';
  created_at: string;
}

export interface DeveloperScore {
  user_id: string;
  name: string;
  email: string;
  /**
   * SUM of this developer's merge-request scores within the project (0..1000 per MR,
   * so total_score can exceed 1000 for high-volume contributors). The mean is
   * derived as total_score / merge_request_count for tone-coding.
   */
  total_score: number;
  min_score?: number;
  max_score?: number;
  merge_request_count: number;
}

/** Average MR score for tone-banding when total_score is a sum. */
export function avgScore(d: { total_score: number; merge_request_count: number }): number {
  return d.merge_request_count > 0 ? d.total_score / d.merge_request_count : 0;
}

export interface MergeRequestSummary {
  id: string;
  github_id: number | null;
  title: string;
  status: string;             // 'open' | 'closed' | 'merged' (free-form to match server)
  score: number;              // 0–1000
  story_points: number;
  refactored_lines: number;
  lines_modified: number;
  author_id: string | null;
  author_name: string | null;
  author_email: string | null;
  project_id: string;
  jira_task_id: string | null;
  jira_key: string | null;    // human-readable key (e.g. "OCPS-214"), surfaced inline by the backend
  created_at: string | null;
  updated_at: string | null;
}

export type CommitType = 'feature' | 'bugfix' | 'refactor' | 'other';

export interface CommitInfo {
  sha: string;
  message: string;
  date: string | null;
  author_id: string | null;
  author_name: string | null;
  commit_type: CommitType;
}

export interface ReviewCommentInfo {
  id: string;
  body: string;
  severity_weight: 0 | 1 | 3 | 5;
  author_id: string | null;
  author_name: string | null;
  created_at: string | null;
}

export interface MergeRequestDetail extends MergeRequestSummary {
  commits: CommitInfo[];
  review_comments: ReviewCommentInfo[];
}

export interface JiraTask {
  jira_key: string;
  summary: string;
  status: string;
  story_points: number;
  sprint_id?: string | null;
  sprint_name?: string | null;
}

export interface JiraSprint {
  id: string;
  name: string;
  state?: 'active' | 'closed' | 'future' | string;
}

export interface TimelinePoint {
  week: string;
  total_score: number;
  merge_request_count: number;
}

export interface Alert {
  id: string;
  project_id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical' | string;
  message: string;
  is_resolved: boolean;
  created_at: string;
  resolved_by?: string | null;
  resolved_at?: string | null;
}

export interface ScoreBreakdownMR {
  id: string;
  title: string;
  score: number;
  lines_modified: number;
  jira_linked: boolean;
}

export interface ScoreBreakdown {
  scored_mr_count: number;
  min_mr_score: number;
  max_mr_score: number;
  jira_linked_count: number;
  lowest_mrs: ScoreBreakdownMR[];
}

export interface ProjectOverview {
  project_id: string;
  project_name: string;
  total_merge_requests: number;
  open_merge_requests: number;
  total_commits: number;
  unresolved_alerts: number;
  total_contributors: number;
  project_score: number;
  score_breakdown: ScoreBreakdown;
}

/* ---------- view-model derivations ---------- */

export type Severity = 0 | 1 | 3 | 5;

export function severityLabel(s: Severity): string {
  return s === 0 ? 'Suggestion' : s === 1 ? 'Minor' : s === 3 ? 'Bug' : 'Critical';
}

export function severityColor(s: Severity): string {
  return s === 0 ? '#94a3b8' : s === 1 ? '#facc15' : s === 3 ? '#fb923c' : '#f87171';
}

/** Tone bundle for a score band — tone for solid text, soft (~20%) for backgrounds,
 *  faint (~10%) for the most subtle washes. All driven through CSS variables so
 *  switching theme automatically switches the palette. */
export interface ScoreTone {
  tone:  string;
  soft:  string;
  faint: string;
  label: string;
}

export interface Action {
  action: string;
  responsible: string;
  deadline: string | null;
}

export interface CompteRendu {
  id: string;
  project_id: string;
  raw_text: string;
  language: string;
  decisions: string[];
  actions: Action[];
  blocages: string[];
  resume: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
  days_remaining: number;
}

export function scoreBand(score: number): ScoreTone {
  if (score >= 850) return {
    tone:  'var(--leap-band-exceptional)',
    soft:  'var(--leap-band-exceptional-soft)',
    faint: 'var(--leap-band-exceptional-faint)',
    label: 'Exceptional',
  };
  if (score >= 700) return {
    tone:  'var(--leap-band-strong)',
    soft:  'var(--leap-band-strong-soft)',
    faint: 'var(--leap-band-strong-faint)',
    label: 'Strong',
  };
  if (score >= 500) return {
    tone:  'var(--leap-band-steady)',
    soft:  'var(--leap-band-steady-soft)',
    faint: 'var(--leap-band-steady-faint)',
    label: 'Steady',
  };
  return {
    tone:  'var(--leap-band-warn)',
    soft:  'var(--leap-band-warn-soft)',
    faint: 'var(--leap-band-warn-faint)',
    label: 'Needs review',
  };
}
