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
