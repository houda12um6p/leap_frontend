import type {
  Project,
  DeveloperScore,
  MergeRequestSummary,
  MergeRequestDetail,
  JiraTask,
  ProjectOverview,
} from './types';
import { computeScore } from './score';

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p-core',
    name: 'OCPS LEAP — Core',
    repo_url: 'https://github.com/ocps/leap-core',
    status: 'active',
    created_at: '2025-12-08T10:00:00Z',
  },
  {
    id: 'p-ingest',
    name: 'Ingest Pipeline',
    repo_url: 'https://github.com/ocps/leap-ingest',
    status: 'active',
    created_at: '2026-01-22T09:30:00Z',
  },
  {
    id: 'p-insights',
    name: 'Insights Web',
    repo_url: 'https://github.com/ocps/leap-insights',
    status: 'active',
    created_at: '2026-02-14T14:15:00Z',
  },
  {
    id: 'p-archive',
    name: 'Legacy Reporter',
    repo_url: 'https://github.com/ocps/legacy-reporter',
    status: 'archived',
    created_at: '2025-08-04T11:00:00Z',
  },
];

const USERS = {
  amelie: { user_id: 'u-1', name: 'Amélie Laurent',     email: 'amelie@ocps.io'  },
  daichi: { user_id: 'u-2', name: 'Daichi Tanaka',      email: 'daichi@ocps.io'  },
  priya:  { user_id: 'u-3', name: 'Priya Subramanian',  email: 'priya@ocps.io'   },
  liam:   { user_id: 'u-4', name: 'Liam O’Connor',      email: 'liam@ocps.io'    },
  sara:   { user_id: 'u-5', name: 'Sara Khoury',        email: 'sara@ocps.io'    },
  marco:  { user_id: 'u-6', name: 'Marco Vidal',        email: 'marco@ocps.io'   },
  noor:   { user_id: 'u-7', name: 'Noor Hassan',        email: 'noor@ocps.io'    },
};

/* ---------- merge requests with rich detail per project ---------- */

interface MRSeed {
  id: string;
  github_id: number;
  title: string;
  status: 'open' | 'merged' | 'closed' | 'review';
  story_points: number;
  lines_modified: number;
  refactored_lines: number;
  author: keyof typeof USERS;
  jira_key: string | null;
  severities: Array<0 | 1 | 3 | 5>;     // one per review comment
  commit_count: number;
  created_at: string;
  updated_at: string;
}

const MR_SEEDS: Record<string, MRSeed[]> = {
  'p-core': [
    {
      id: 'pr-c-101', github_id: 4821, title: 'Refactor auth middleware to signed cookies',
      status: 'open', story_points: 5, lines_modified: 412, refactored_lines: 320,
      author: 'amelie', jira_key: 'OCPS-214',
      severities: [1, 1, 0, 0, 1], commit_count: 7,
      created_at: '2026-04-28T09:12:00Z', updated_at: '2026-05-02T16:40:00Z',
    },
    {
      id: 'pr-c-102', github_id: 4822, title: 'Stream merge-request events into scoring',
      status: 'open', story_points: 3, lines_modified: 906, refactored_lines: 40,
      author: 'priya', jira_key: 'OCPS-225',
      severities: [3, 3, 1, 5, 0, 0], commit_count: 11,
      created_at: '2026-05-01T08:55:00Z', updated_at: '2026-05-04T10:00:00Z',
    },
    {
      id: 'pr-c-103', github_id: 4823, title: 'Tighten PR comment severity weighting',
      status: 'review', story_points: 2, lines_modified: 110, refactored_lines: 60,
      author: 'amelie', jira_key: 'OCPS-231',
      severities: [0, 0, 1], commit_count: 3,
      created_at: '2026-05-04T08:30:00Z', updated_at: '2026-05-05T13:00:00Z',
    },
    {
      id: 'pr-c-104', github_id: 4824, title: 'Hotfix: dashboard 500 when no scores',
      status: 'merged', story_points: 1, lines_modified: 68, refactored_lines: 12,
      author: 'liam', jira_key: null,
      severities: [3, 5, 1], commit_count: 2,
      created_at: '2026-05-03T17:00:00Z', updated_at: '2026-05-03T19:30:00Z',
    },
  ],
  'p-ingest': [
    {
      id: 'pr-i-201', github_id: 902, title: 'Move ingest worker pool to async runtime',
      status: 'open', story_points: 13, lines_modified: 1820, refactored_lines: 540,
      author: 'sara', jira_key: 'OCPS-228',
      severities: [1, 1, 0, 1, 1, 0, 1], commit_count: 18,
      created_at: '2026-04-30T12:00:00Z', updated_at: '2026-05-05T08:15:00Z',
    },
    {
      id: 'pr-i-202', github_id: 903, title: 'Add ingest retry queue + dead-letter table',
      status: 'merged', story_points: 8, lines_modified: 218, refactored_lines: 90,
      author: 'daichi', jira_key: 'OCPS-220',
      severities: [0, 0, 1, 0], commit_count: 6,
      created_at: '2026-04-26T11:00:00Z', updated_at: '2026-04-29T14:20:00Z',
    },
    {
      id: 'pr-i-203', github_id: 904, title: 'Backfill commit-author mapping',
      status: 'open', story_points: 5, lines_modified: 312, refactored_lines: 110,
      author: 'noor', jira_key: 'OCPS-238',
      severities: [3, 1, 0, 0], commit_count: 4,
      created_at: '2026-05-02T10:10:00Z', updated_at: '2026-05-04T18:00:00Z',
    },
  ],
  'p-insights': [
    {
      id: 'pr-w-301', github_id: 211, title: 'Cosmos-style masonry → bento refactor',
      status: 'review', story_points: 8, lines_modified: 1240, refactored_lines: 880,
      author: 'marco', jira_key: 'OCPS-242',
      severities: [0, 0, 1, 0, 0], commit_count: 14,
      created_at: '2026-05-02T16:00:00Z', updated_at: '2026-05-06T09:00:00Z',
    },
    {
      id: 'pr-w-302', github_id: 212, title: '3D background — instanced graph + parallax',
      status: 'merged', story_points: 5, lines_modified: 480, refactored_lines: 0,
      author: 'amelie', jira_key: 'OCPS-243',
      severities: [0, 1, 0], commit_count: 9,
      created_at: '2026-05-01T11:00:00Z', updated_at: '2026-05-04T20:30:00Z',
    },
    {
      id: 'pr-w-303', github_id: 213, title: 'Animate score counter from useMotionValue',
      status: 'open', story_points: 2, lines_modified: 84, refactored_lines: 0,
      author: 'sara', jira_key: 'OCPS-251',
      severities: [0, 0, 1, 1], commit_count: 3,
      created_at: '2026-05-05T08:00:00Z', updated_at: '2026-05-06T07:30:00Z',
    },
  ],
  'p-archive': [
    {
      id: 'pr-a-401', github_id: 14, title: 'Disable nightly export job',
      status: 'merged', story_points: 1, lines_modified: 18, refactored_lines: 0,
      author: 'liam', jira_key: null,
      severities: [], commit_count: 1,
      created_at: '2025-12-19T10:00:00Z', updated_at: '2025-12-19T10:30:00Z',
    },
  ],
};

/* ---------- compute summaries + details from seeds ---------- */

function makeSummary(s: MRSeed, projectId: string): MergeRequestSummary {
  const u = USERS[s.author];
  const score = computeScore({
    severity_weights: s.severities,
    lines_modified:   s.lines_modified,
    story_points:     s.story_points,
  }).score;
  return {
    id: s.id,
    github_id: s.github_id,
    title: s.title,
    status: s.status,
    score: Math.round(score * 100) / 100,
    story_points: s.story_points,
    lines_modified: s.lines_modified,
    refactored_lines: s.refactored_lines,
    author_id: u.user_id,
    author_name: u.name,
    author_email: u.email,
    project_id: projectId,
    jira_task_id: s.jira_key ? `jt-${s.jira_key}` : null,
    jira_key: s.jira_key,
    created_at: s.created_at,
    updated_at: s.updated_at,
  };
}

function makeDetail(s: MRSeed, projectId: string): MergeRequestDetail {
  const summary = makeSummary(s, projectId);
  const reviewer = s.author === 'amelie' ? USERS.priya : USERS.amelie;
  return {
    ...summary,
    commits: Array.from({ length: s.commit_count }).map((_, i) => {
      const messages = [
        'feat: scaffold module',
        'fix: edge case in retry path',
        'refactor: extract auth helper',
        'chore: bump deps',
        'feat: wire new endpoint',
        'fix: race condition on close',
        'refactor: simplify reducer',
      ];
      const msg = messages[i % messages.length];
      const date = new Date(new Date(s.created_at).getTime() + i * 3600_000 * 18).toISOString();
      const author = i % 3 === 0 ? reviewer : USERS[s.author];
      return {
        sha: `${s.id}-${(i + 1).toString().padStart(3, '0')}`,
        message: msg,
        date,
        author_id: author.user_id,
        author_name: author.name,
        commit_type: msg.startsWith('feat') ? 'feature' :
                     msg.startsWith('fix') ? 'bugfix' :
                     msg.startsWith('refactor') ? 'refactor' : 'other',
      };
    }),
    review_comments: s.severities.map((sev, i) => ({
      id: `${s.id}-rc-${i + 1}`,
      body: sev === 5 ? 'Critical: this can deadlock under load.' :
            sev === 3 ? 'This is a correctness bug — see line 142.' :
            sev === 1 ? 'Minor: prefer the existing helper here.' :
                        'Suggestion: nicer-to-read with destructuring.',
      severity_weight: sev,
      author_id: reviewer.user_id,
      author_name: reviewer.name,
      created_at: new Date(new Date(s.created_at).getTime() + (i + 1) * 7200_000).toISOString(),
    })),
  };
}

/* ---------- public mock data ---------- */

export const mockMergeRequests: Record<string, MergeRequestSummary[]> = Object.fromEntries(
  Object.entries(MR_SEEDS).map(([pid, seeds]) => [pid, seeds.map((s) => makeSummary(s, pid))]),
);

export const mockMergeRequestDetails: Record<string, MergeRequestDetail> = Object.fromEntries(
  Object.entries(MR_SEEDS).flatMap(([pid, seeds]) =>
    seeds.map((s) => [s.id, makeDetail(s, pid)]),
  ),
);

export const mockJira: Record<string, JiraTask[]> = {
  'p-core': [
    { jira_key: 'OCPS-214', summary: 'Replace JWT cookie strategy',           status: 'In Progress', story_points: 5  },
    { jira_key: 'OCPS-225', summary: 'Stream MR events into scoring',          status: 'In Review',   story_points: 3  },
    { jira_key: 'OCPS-231', summary: 'Refine PR comment severity weighting',   status: 'To Do',       story_points: 2  },
  ],
  'p-ingest': [
    { jira_key: 'OCPS-220', summary: 'Webhook retry queue + dead-letter',      status: 'Done',        story_points: 8  },
    { jira_key: 'OCPS-228', summary: 'Move ingest pool to async runtime',      status: 'In Progress', story_points: 13 },
    { jira_key: 'OCPS-238', summary: 'Index commit-author mapping',            status: 'Backlog',     story_points: 5  },
  ],
  'p-insights': [
    { jira_key: 'OCPS-242', summary: 'Bento refactor of dashboard',            status: 'In Review',   story_points: 8  },
    { jira_key: 'OCPS-243', summary: 'Animated 3D code-graph background',      status: 'Done',        story_points: 5  },
    { jira_key: 'OCPS-251', summary: 'Animated score counter on tiles',        status: 'In Progress', story_points: 2  },
  ],
  'p-archive': [],
};

export const mockDevelopersByProject: Record<string, DeveloperScore[]> = Object.fromEntries(
  Object.entries(MR_SEEDS).map(([pid, seeds]) => {
    const acc: Record<string, { user: typeof USERS[keyof typeof USERS]; scores: number[] }> = {};
    seeds.forEach((s) => {
      const score = computeScore({
        severity_weights: s.severities,
        lines_modified:   s.lines_modified,
        story_points:     s.story_points,
      }).score;
      const u = USERS[s.author];
      acc[u.user_id] = acc[u.user_id] ?? { user: u, scores: [] };
      acc[u.user_id].scores.push(score);
    });
    return [pid, Object.values(acc).map(({ user, scores }) => ({
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      total_score: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100,
      min_score: Math.round(Math.min(...scores) * 100) / 100,
      max_score: Math.round(Math.max(...scores) * 100) / 100,
      merge_request_count: scores.length,
    }))];
  }),
);

export const mockOverview: Record<string, ProjectOverview> = Object.fromEntries(
  MOCK_PROJECTS.map((p) => {
    const mrs = mockMergeRequests[p.id] ?? [];
    const open = mrs.filter((m) => m.status === 'open' || m.status === 'review').length;
    const scored = mrs.filter((m) => m.score > 0);
    const ranked = [...scored].sort((a, b) => a.score - b.score).slice(0, 3);
    const total = scored.length ? Math.round((scored.reduce((s, m) => s + m.score, 0) / scored.length) * 100) / 100 : 0;
    const min   = scored.length ? Math.round(Math.min(...scored.map((m) => m.score)) * 100) / 100 : 0;
    const max   = scored.length ? Math.round(Math.max(...scored.map((m) => m.score)) * 100) / 100 : 0;
    return [p.id, {
      project_id: p.id,
      project_name: p.name,
      total_merge_requests: mrs.length,
      open_merge_requests: open,
      total_commits: mrs.reduce((s, m) => s + (mockMergeRequestDetails[m.id]?.commits.length ?? 0), 0),
      unresolved_alerts: p.id === 'p-ingest' ? 3 : p.id === 'p-core' ? 1 : 0,
      total_contributors: new Set(mrs.map((m) => m.author_id).filter(Boolean)).size,
      project_score: total,
      score_breakdown: {
        scored_mr_count: scored.length,
        min_mr_score: min,
        max_mr_score: max,
        jira_linked_count: mrs.filter((m) => m.jira_task_id).length,
        lowest_mrs: ranked.map((m) => ({
          id: m.id, title: m.title, score: m.score,
          lines_modified: m.lines_modified, jira_linked: !!m.jira_task_id,
        })),
      },
    }];
  }),
);
