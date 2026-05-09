import { proxy } from 'valtio';

const TOKEN_KEY = 'leap.token';
const USER_KEY  = 'leap.user';

export interface User {
  id?: string;
  name: string;
  email: string;
  role?: string;
  total_score?: number;
}

export const authState = proxy<{
  token: string | null;
  user: User | null;
  status: 'idle' | 'loading' | 'error';
  error: string | null;
}>({
  token: typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null,
  user:  readUser(),
  status: 'idle',
  error: null,
});

function readUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch { return null; }
}

function persistUser(u: User | null) {
  if (typeof window === 'undefined') return;
  if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
  else   localStorage.removeItem(USER_KEY);
}

function persistToken(t: string | null) {
  if (typeof window === 'undefined') return;
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else   localStorage.removeItem(TOKEN_KEY);
}

/* ------------------------- API calls (real backend) ------------------- */

const API_BASE =
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) ||
  '/api/v1';   // proxied to localhost:8011 by setupProxy.js

async function postJson<T>(path: string, body: unknown, token?: string | null): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
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

async function getJson<T>(path: string, token?: string | null): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

interface LoginResponse { access_token: string; token_type: string; }

export async function login(email: string, password: string): Promise<User> {
  authState.status = 'loading';
  authState.error  = null;
  try {
    const t = await postJson<LoginResponse>('/auth/login', { email, password });
    persistToken(t.access_token);
    authState.token = t.access_token;
    const me = await getJson<User>('/auth/me', t.access_token);
    persistUser(me);
    authState.user = me;
    authState.status = 'idle';
    return me;
  } catch (e) {
    authState.status = 'error';
    authState.error  = (e as Error).message || 'Login failed';
    throw e;
  }
}

export async function register(name: string, email: string, password: string): Promise<User> {
  authState.status = 'loading';
  authState.error = null;
  try {
    await postJson<User>('/auth/register', { name, email, password, role: 'developer' });
    return login(email, password);
  } catch (e) {
    authState.status = 'error';
    authState.error  = (e as Error).message || 'Registration failed';
    throw e;
  }
}

export function logout() {
  persistToken(null);
  persistUser(null);
  authState.token = null;
  authState.user  = null;
  authState.status = 'idle';
  authState.error  = null;
}

/** Re-validate the persisted token on app boot. */
export async function bootstrapAuth() {
  if (!authState.token) return;
  try {
    const me = await getJson<User>('/auth/me', authState.token);
    persistUser(me);
    authState.user = me;
  } catch {
    // token rejected — clear silently so the user lands on /login
    logout();
  }
}
