import { proxy } from 'valtio';

export type ExpandedTarget =
  | { kind: 'mr'; id: string }
  | { kind: 'developer'; id: string }
  | null;

export const dashboardState = proxy<{
  expanded: ExpandedTarget;
  isCommandOpen: boolean;
  isAddProjectOpen: boolean;
}>({
  expanded: null,
  isCommandOpen: false,
  isAddProjectOpen: false,
});

export const sessionState = proxy<{
  hasEnteredApp: boolean;
}>({
  hasEnteredApp: false,
});

export function openExpansion(target: NonNullable<ExpandedTarget>) {
  dashboardState.expanded = target;
}

export function closeExpansion() {
  dashboardState.expanded = null;
}

export function openAddProject() { dashboardState.isAddProjectOpen = true; }
export function closeAddProject() { dashboardState.isAddProjectOpen = false; }
