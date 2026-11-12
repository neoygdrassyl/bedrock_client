import { useSyncExternalStore } from 'react';

/**
 * Bridge between the app shell and a full-height "workspace" surface (the expediente
 * detail). The shell owns the geometry; the workspace only asks for the room.
 *
 *   - The shell registers a content slot (a flex child between its header and footer)
 *     and two header slots (breadcrumb area and actions area).
 *   - A workspace calls `enterWorkspaceMode()` while mounted and portals into the slots.
 *     The shell keeps its sidebar, header card and footer exactly where they are and
 *     hides only the page scroller. While a workspace is active the header shows only
 *     identity, search and window controls: it hands its breadcrumb area over to the
 *     workspace (which must render the full trail there) and puts the actions slot at
 *     the far end, after the search, for the workspace's window controls.
 *
 * Without a shell (unit tests, isolated renders) every slot stays null and the workspace
 * falls back to a fixed overlay on <body> with its own self-contained bar.
 */
const EMPTY_STATE = Object.freeze({ slot: null, headerBreadcrumbSlot: null, headerActionsSlot: null, active: false });

let state = EMPTY_STATE;
let activeCount = 0;
const listeners = new Set();

function setState(patch) {
  state = Object.freeze({ ...state, ...patch });
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

/** Shell side: ref callback for the element workspaces render into (null on unmount). */
export function registerWorkspaceSlot(node) {
  const slot = node || null;
  if (state.slot !== slot) setState({ slot });
}

/** Shell side: ref callback for the header area that holds the workspace breadcrumb. */
export function registerHeaderBreadcrumbSlot(node) {
  const headerBreadcrumbSlot = node || null;
  if (state.headerBreadcrumbSlot !== headerBreadcrumbSlot) setState({ headerBreadcrumbSlot });
}

/** Shell side: ref callback for the header area that holds the workspace actions. */
export function registerHeaderActionsSlot(node) {
  const headerActionsSlot = node || null;
  if (state.headerActionsSlot !== headerActionsSlot) setState({ headerActionsSlot });
}

/** Workspace side: turns workspace mode on; call the returned function to leave it. */
export function enterWorkspaceMode() {
  activeCount += 1;
  if (!state.active) setState({ active: true });
  let released = false;
  return () => {
    if (released) return;
    released = true;
    activeCount = Math.max(0, activeCount - 1);
    if (!activeCount && state.active) setState({ active: false });
  };
}

const selectAll = (snapshot) => snapshot;
const selectActive = (snapshot) => snapshot.active;
const selectSlot = (snapshot) => snapshot.slot;
const selectHeaderBreadcrumbSlot = (snapshot) => snapshot.headerBreadcrumbSlot;
const selectHeaderActionsSlot = (snapshot) => snapshot.headerActionsSlot;

/**
 * Subscribes to the shell store. Pass a selector that returns a primitive or a stable
 * reference (a slot node, the `active` flag) so the component re-renders only when that
 * value changes; without one the whole state object is returned and every slot
 * registration re-renders the caller. Prefer the field hooks below.
 * @returns {{ slot: HTMLElement|null, headerBreadcrumbSlot: HTMLElement|null, headerActionsSlot: HTMLElement|null, active: boolean }}
 */
export function useShellWorkspace(selector = selectAll) {
  const getSelected = () => selector(state);
  return useSyncExternalStore(subscribe, getSelected, getSelected);
}

/** True while a workspace is mounted. */
export const useShellWorkspaceActive = () => useShellWorkspace(selectActive);
/** Shell content slot (null without a shell). */
export const useShellWorkspaceSlot = () => useShellWorkspace(selectSlot);
/** Header breadcrumb slot (null while no workspace is active). */
export const useShellHeaderBreadcrumbSlot = () => useShellWorkspace(selectHeaderBreadcrumbSlot);
/** Header actions slot (null while no workspace is active). */
export const useShellHeaderActionsSlot = () => useShellWorkspace(selectHeaderActionsSlot);

/** Test helper. */
export function __resetShellWorkspaceForTests() {
  state = EMPTY_STATE;
  activeCount = 0;
  listeners.clear();
}
