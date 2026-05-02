import axios from 'axios';
import {
  User, Project, Alert, DeveloperScore, ProjectOverview,
  JiraTask, MergeRequestSummary, MergeRequestDetail,
} from '../types';

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8011/api/v1',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function login(email: string, password: string): Promise<{ access_token: string; token_type: string }> {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
}

export async function register(name: string, email: string, password: string): Promise<User> {
  const res = await api.post('/auth/register', { name, email, password, role: 'developer' });
  return res.data;
}

export async function getMe(): Promise<User> {
  const res = await api.get('/auth/me');
  return res.data;
}

export async function getProjects(): Promise<Project[]> {
  const res = await api.get('/projects');
  return res.data;
}

export async function getProject(projectId: string): Promise<Project> {
  const res = await api.get(`/projects/${projectId}`);
  return res.data;
}

export async function createProject(name: string, repo_url: string, status: string = 'active'): Promise<Project> {
  const res = await api.post('/projects', { name, repo_url, status });
  return res.data;
}

export async function updateProject(
  projectId: string,
  changes: Partial<Pick<Project, 'name' | 'repo_url' | 'status'>>,
): Promise<Project> {
  const res = await api.patch(`/projects/${projectId}`, changes);
  return res.data;
}

export async function deleteProject(projectId: string): Promise<void> {
  await api.delete(`/projects/${projectId}`);
}

export async function getScores(projectId: string): Promise<DeveloperScore[]> {
  const res = await api.get(`/dashboard/${projectId}/scores`);
  return res.data;
}

export async function getAlerts(projectId: string): Promise<Alert[]> {
  const res = await api.get(`/projects/${projectId}/alerts`);
  return res.data;
}

export async function resolveAlert(alertId: string): Promise<Alert> {
  const res = await api.post(`/alerts/${alertId}/resolve`);
  return res.data;
}

export async function getOverview(projectId: string): Promise<ProjectOverview> {
  const res = await api.get(`/dashboard/${projectId}/overview`);
  return res.data;
}

export async function syncGitHub(repoOwner: string, repoName: string, projectId: string) {
  const res = await api.post('/github/sync/pull-requests', {
    repo_owner: repoOwner,
    repo_name: repoName,
    project_id: projectId,
  });
  return res.data;
}

export async function calculateProjectScores(projectId: string) {
  const res = await api.post(`/scores/project/${projectId}/calculate`);
  return res.data;
}

export async function syncJiraTasks(projectId: string) {
  const res = await api.post('/jira/sync/tasks', { project_id: projectId });
  return res.data;
}

export async function getJiraTasks(projectId: string): Promise<JiraTask[]> {
  const res = await api.get(`/jira/tasks/${projectId}`);
  return res.data;
}

export async function getProjectMergeRequests(projectId: string): Promise<MergeRequestSummary[]> {
  const res = await api.get(`/projects/${projectId}/merge-requests`);
  return res.data;
}

export async function getMergeRequest(mrId: string): Promise<MergeRequestDetail> {
  const res = await api.get(`/merge-requests/${mrId}`);
  return res.data;
}

export function parseRepoUrl(input: string): { owner: string; repo: string } | null {
  if (!input) return null;
  let s = input.trim();
  if (!s) return null;
  if (!/^https?:\/\//i.test(s) && !s.startsWith('git@')) {
    s = 'https://' + s;
  }
  if (s.startsWith('git@')) {
    // git@github.com:owner/repo.git
    const m = s.match(/^git@[^:]+:([^/]+)\/(.+?)(?:\.git)?\/?$/);
    if (m) return { owner: m[1], repo: m[2] };
    return null;
  }
  try {
    const url = new URL(s);
    const parts = url.pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
    if (parts.length < 2) return null;
    const owner = parts[0];
    let repo = parts[1];
    repo = repo.replace(/\.git$/i, '');
    if (!owner || !repo) return null;
    return { owner, repo };
  } catch {
    return null;
  }
}
