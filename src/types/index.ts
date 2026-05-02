export interface User {
  id?: string;
  name: string;
  email: string;
  role?: string;
  total_score?: number;
  created_at?: string;
}

export interface Project {
  id: string;
  name: string;
  repo_url: string;
  status: string;
  created_at: string;
}

export interface Alert {
  id: string;
  type: string;
  severity: string;
  message: string;
  is_resolved: boolean;
  project_id: string;
  created_at: string;
}

export interface DeveloperScore {
  user_id: string;
  name: string;
  email: string;
  total_score: number;
  merge_request_count: number;
}

export interface ProjectOverview {
  project_id: string;
  project_name: string;
  total_merge_requests: number;
  open_merge_requests: number;
  total_commits: number;
  unresolved_alerts: number;
  total_contributors: number;
}

export interface JiraTask {
  jira_key: string;
  summary: string;
  status: string;
  story_points: number;
}

export interface MergeRequestSummary {
  id: string;
  github_id: number | null;
  title: string;
  status: string;
  score: number;
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

export interface CommitInfo {
  sha: string;
  message: string;
  date: string | null;
  author_id: string | null;
  author_name: string | null;
  commit_type: 'feature' | 'bugfix' | 'refactor' | 'other';
}

export interface ReviewCommentInfo {
  id: string;
  body: string;
  severity_weight: number;
  author_id: string | null;
  author_name: string | null;
  created_at: string | null;
}

export interface MergeRequestDetail extends MergeRequestSummary {
  commits: CommitInfo[];
  review_comments: ReviewCommentInfo[];
}
