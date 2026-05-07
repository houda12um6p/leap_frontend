import { useMutation, useQuery, useQueries, useQueryClient } from '@tanstack/react-query';
import type {
  Project,
  DeveloperScore,
  MergeRequestSummary,
  MergeRequestDetail,
  JiraTask,
  ProjectOverview,
} from './types';

const API_BASE =
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) ||
  '/api/v1';     // proxied to localhost:8000 by setupProxy.js

function authHeaders(): HeadersInit {
  const t = typeof localStorage !== 'undefined' ? localStorage.getItem('leap.token') : null;
  const base: Record<string, string> = { 'Content-Type': 'application/json' };
  if (t) base.Authorization = `Bearer ${t}`;
  return base;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init?.headers ?? {}) },
  });
  if (res.status === 401) {
    // Token has expired or is invalid — wipe local auth and bounce to /login.
    try { localStorage.removeItem('leap.token'); localStorage.removeItem('leap.user'); } catch {}
    window.dispatchEvent(new Event('leap:logout'));
    throw new Error('Session expired. Please sign in again.');
  }
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      detail = (j && (j.detail || j.message)) || detail;
    } catch {}
    throw new Error(detail);
  }
  return (await res.json()) as T;
}

/* ----------------------------- queries ------------------------------- */

export function useProjects() {
  return useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => request<Project[]>('/projects'),
  });
}

export function useProject(projectId: string | undefined) {
  return useQuery<Project>({
    queryKey: ['project', projectId],
    enabled: !!projectId,
    queryFn: () => request<Project>(`/projects/${projectId}`),
  });
}

export function useProjectOverview(projectId: string | undefined) {
  return useQuery<ProjectOverview>({
    queryKey: ['overview', projectId],
    enabled: !!projectId,
    queryFn: () => request<ProjectOverview>(`/dashboard/${projectId}/overview`),
  });
}

export function useDeveloperScores(projectId: string | undefined) {
  return useQuery<DeveloperScore[]>({
    queryKey: ['scores', projectId],
    enabled: !!projectId,
    queryFn: () => request<DeveloperScore[]>(`/dashboard/${projectId}/scores`),
  });
}

export function useProjectMergeRequests(projectId: string | undefined) {
  return useQuery<MergeRequestSummary[]>({
    queryKey: ['merge-requests', projectId],
    enabled: !!projectId,
    queryFn: () => request<MergeRequestSummary[]>(`/projects/${projectId}/merge-requests`),
  });
}

export function useMergeRequest(mrId: string | undefined) {
  return useQuery<MergeRequestDetail>({
    queryKey: ['merge-request', mrId],
    enabled: !!mrId,
    queryFn: () => request<MergeRequestDetail>(`/merge-requests/${mrId}`),
  });
}

export function useJiraTasks(projectId: string | undefined) {
  return useQuery<JiraTask[]>({
    queryKey: ['jira', projectId],
    enabled: !!projectId,
    queryFn: () => request<JiraTask[]>(`/jira/tasks/${projectId}`),
  });
}

/* ----------------------------- fan-out queries ----------------------- */

/**
 * For each project, pull overview + scores + MRs + jira in parallel.
 * Returns a list aligned with `projectIds` so callers can zip easily.
 */
export interface PerProjectBundle {
  projectId: string;
  overview: ProjectOverview | null;
  scores: DeveloperScore[];
  mrs: MergeRequestSummary[];
  jira: JiraTask[];
  isLoading: boolean;
  isError: boolean;
}

export function usePerProjectBundles(projectIds: string[]): PerProjectBundle[] {
  const overviews = useQueries({
    queries: projectIds.map((id) => ({
      queryKey: ['overview', id],
      queryFn: () => request<ProjectOverview>(`/dashboard/${id}/overview`),
      enabled: projectIds.length > 0,
    })),
  });
  const scores = useQueries({
    queries: projectIds.map((id) => ({
      queryKey: ['scores', id],
      queryFn: () => request<DeveloperScore[]>(`/dashboard/${id}/scores`),
      enabled: projectIds.length > 0,
    })),
  });
  const mrs = useQueries({
    queries: projectIds.map((id) => ({
      queryKey: ['merge-requests', id],
      queryFn: () => request<MergeRequestSummary[]>(`/projects/${id}/merge-requests`),
      enabled: projectIds.length > 0,
    })),
  });
  const jira = useQueries({
    queries: projectIds.map((id) => ({
      queryKey: ['jira', id],
      queryFn: () => request<JiraTask[]>(`/jira/tasks/${id}`),
      enabled: projectIds.length > 0,
    })),
  });

  return projectIds.map((id, i) => ({
    projectId: id,
    overview:  overviews[i].data ?? null,
    scores:    scores[i].data ?? [],
    mrs:       mrs[i].data ?? [],
    jira:      jira[i].data ?? [],
    isLoading: overviews[i].isLoading || scores[i].isLoading || mrs[i].isLoading || jira[i].isLoading,
    isError:   overviews[i].isError   || scores[i].isError   || mrs[i].isError   || jira[i].isError,
  }));
}

/* ----------------------------- mutations ----------------------------- */

export interface CreateProjectInput {
  name: string;
  repo_url: string;
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProjectInput) =>
      request<Project>('/projects', {
        method: 'POST',
        body: JSON.stringify({ ...input, status: 'active' }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: string) => {
      await fetch(`${API_BASE}/projects/${projectId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      }).then((res) => {
        if (res.status === 401) {
          try { localStorage.removeItem('leap.token'); localStorage.removeItem('leap.user'); } catch {}
          window.dispatchEvent(new Event('leap:logout'));
          throw new Error('Session expired. Please sign in again.');
        }
        if (!res.ok && res.status !== 204) {
          throw new Error(`HTTP ${res.status}`);
        }
      });
      return projectId;
    },
    onSuccess: (projectId) => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.removeQueries({ queryKey: ['project', projectId] });
      qc.removeQueries({ queryKey: ['overview', projectId] });
      qc.removeQueries({ queryKey: ['scores', projectId] });
      qc.removeQueries({ queryKey: ['merge-requests', projectId] });
      qc.removeQueries({ queryKey: ['jira', projectId] });
    },
  });
}

export interface SyncProjectKind {
  kind:
    | 'github-prs'
    | 'github-commits'
    | 'github-review-comments'
    | 'jira-tasks'
    | 'recalc-scores';
  projectId: string;
  repo_owner?: string;
  repo_name?: string;
}

export function useSyncProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SyncProjectKind) => {
      const path = (() => {
        switch (input.kind) {
          case 'github-prs':             return '/github/sync/pull-requests';
          case 'github-commits':         return '/github/sync/commits';
          case 'github-review-comments': return '/github/sync/review-comments';
          case 'jira-tasks':             return '/jira/sync/tasks';
          case 'recalc-scores':          return `/scores/project/${input.projectId}/calculate`;
        }
      })();
      const body =
        input.kind === 'recalc-scores'
          ? null
          : input.kind === 'jira-tasks'
          ? { project_id: input.projectId }
          : { repo_owner: input.repo_owner, repo_name: input.repo_name, project_id: input.projectId };
      return request(path, {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      });
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['merge-requests', vars.projectId] });
      qc.invalidateQueries({ queryKey: ['scores', vars.projectId] });
      qc.invalidateQueries({ queryKey: ['jira', vars.projectId] });
      qc.invalidateQueries({ queryKey: ['overview', vars.projectId] });
    },
  });
}
