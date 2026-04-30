import axios from 'axios';
import { User, Project, Alert, DeveloperScore, ProjectOverview } from '../types';

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

export async function createProject(name: string, repo_url: string, status: string = 'Active'): Promise<Project> {
  const res = await api.post('/projects', { name, repo_url, status });
  return res.data;
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
  // sync pull requests from GitHub into the DB
  const res = await api.post('/github/sync/pull-requests', {
    repo_owner: repoOwner,
    repo_name: repoName,
    project_id: projectId,
  });
  return res.data;
}

export async function calculateProjectScores(projectId: string) {
  // recalculate scores for all developers in this project
  const res = await api.post(`/scores/project/${projectId}/calculate`);
  return res.data;
}

export async function syncJiraTasks(projectId: string) {
  // sync Jira tasks for this project into the DB
  const res = await api.post('/jira/sync/tasks', { project_id: projectId });
  return res.data;
}
