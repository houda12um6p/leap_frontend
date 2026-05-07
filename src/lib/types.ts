/* Shape of the LEAP backend at localhost:8000/api/v1.
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
  total_score: number;        // 0–1000, mean of merge-request scores for this project
  min_score?: number;
  max_score?: number;
  merge_request_count: number;
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

/** Map a score value back into a severity-feel band for tone-coding the UI. */
export function scoreBand(score: number): { tone: string; label: string } {
  if (score >= 850) return { tone: '#5eead4', label: 'Exceptional'   };
  if (score >= 700) return { tone: '#a7f3d0', label: 'Strong'        };
  if (score >= 500) return { tone: '#fbbf24', label: 'Steady'        };
  return                  { tone: '#f87171', label: 'Needs review'  };
}
