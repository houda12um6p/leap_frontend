import { proxy, subscribe } from 'valtio';

export type Theme = 'dark' | 'light';

const KEY = 'leap.theme';

function readInitial(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const v = localStorage.getItem(KEY);
  if (v === 'light' || v === 'dark') return v;
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export const themeState = proxy<{ theme: Theme }>({
  theme: typeof window === 'undefined' ? 'dark' : readInitial(),
});

export function applyThemeToDocument(theme: Theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function setTheme(theme: Theme) {
  themeState.theme = theme;
  try { localStorage.setItem(KEY, theme); } catch {}
  applyThemeToDocument(theme);
}

export function toggleTheme() {
  setTheme(themeState.theme === 'dark' ? 'light' : 'dark');
}

/** Run once at boot (from index.tsx) to mirror state into the DOM. */
export function initTheme() {
  applyThemeToDocument(themeState.theme);
  subscribe(themeState, () => applyThemeToDocument(themeState.theme));
}

/* ---------- palettes consumed by the 3D background ---------- */

export interface BackgroundPalette {
  bg:           [number, number, number];   // rgb 0..1
  fog:          [number, number, number];
  star:         [number, number, number];
  edge:         [number, number, number];
  commit:       [number, number, number];   // cool gray
  jira:         [number, number, number];   // primary accent
  jiraWarm:     [number, number, number];   // secondary accent
  haloA:        [number, number, number];
  haloB:        [number, number, number];
  starOpacity:  number;
  edgeOpacity:  number;
  commitOpacity: number;
}

const hex = (h: string): [number, number, number] => {
  const x = h.replace('#', '');
  return [
    parseInt(x.slice(0, 2), 16) / 255,
    parseInt(x.slice(2, 4), 16) / 255,
    parseInt(x.slice(4, 6), 16) / 255,
  ];
};

export const PALETTES: Record<Theme, BackgroundPalette> = {
  dark: {
    bg:           hex('02040a'),
    fog:          hex('02040a'),
    star:         hex('94a3b8'),
    edge:         hex('1f2937'),
    commit:       hex('6b7280'),
    jira:         hex('5eead4'),
    jiraWarm:     hex('fbbf24'),
    haloA:        hex('5eead4'),
    haloB:        hex('fbbf24'),
    starOpacity:  0.55,
    edgeOpacity:  0.42,
    commitOpacity: 0.78,
  },
  light: {
    bg:           hex('f6f5f0'),
    fog:          hex('f6f5f0'),
    star:         hex('64748b'),
    edge:         hex('cbd5e1'),
    commit:       hex('334155'),
    jira:         hex('0d8050'),
    jiraWarm:     hex('c2410c'),
    haloA:        hex('0d8050'),
    haloB:        hex('c2410c'),
    starOpacity:  0.45,
    edgeOpacity:  0.30,
    commitOpacity: 0.85,
  },
};
