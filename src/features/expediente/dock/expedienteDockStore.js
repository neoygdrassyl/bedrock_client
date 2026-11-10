import { useSyncExternalStore } from 'react';

/**
 * Expediente dock: a small global list of expedientes pinned to the bottom-right
 * corner, each one either minimized (chip only) or open as a quick-view window.
 *
 * Persisted shape (localStorage `dovela.expedienteDock:v1`):
 *   [{ radicado: string, open: boolean, addedAt: number, openedAt?: number }]
 * `searchOpen` and `activeWorkspace` are session-only UI state and never persisted.
 */
export const DOCK_STORAGE_KEY = 'dovela.expedienteDock:v1';
export const DOCK_MAX_ITEMS = 8;
export const DOCK_MAX_OPEN = 3;

const EMPTY_STATE = Object.freeze({ items: Object.freeze([]), searchOpen: false, activeWorkspace: null });

let state = EMPTY_STATE;
let hydrated = false;
const listeners = new Set();
let now = () => Date.now();

function normalizeRadicado(value) {
  if (value == null) return '';
  return String(value).trim();
}

function isValidItem(item) {
  return Boolean(
    item
    && typeof item === 'object'
    && typeof item.radicado === 'string'
    && item.radicado.trim()
    && typeof item.open === 'boolean'
    && Number.isFinite(item.addedAt)
    && (item.openedAt === undefined || Number.isFinite(item.openedAt))
  );
}

/** Validates and repairs a persisted payload; anything unexpected yields an empty dock. */
export function sanitizeDockItems(raw) {
  if (!Array.isArray(raw)) return [];
  const seen = new Set();
  const items = [];
  raw.forEach((item) => {
    if (!isValidItem(item)) return;
    const radicado = item.radicado.trim();
    if (seen.has(radicado)) return;
    seen.add(radicado);
    items.push({
      radicado,
      open: item.open,
      addedAt: item.addedAt,
      ...(item.openedAt !== undefined ? { openedAt: item.openedAt } : {}),
    });
  });
  return enforceOpenLimit(items.slice(-DOCK_MAX_ITEMS));
}

function readStorage() {
  try {
    const payload = window.localStorage.getItem(DOCK_STORAGE_KEY);
    return payload ? sanitizeDockItems(JSON.parse(payload)) : [];
  } catch {
    return [];
  }
}

function writeStorage(items) {
  try {
    if (items.length) window.localStorage.setItem(DOCK_STORAGE_KEY, JSON.stringify(items));
    else window.localStorage.removeItem(DOCK_STORAGE_KEY);
  } catch {
    // Storage unavailable: the dock keeps working for this session only.
  }
}

function ensureHydrated() {
  if (hydrated || typeof window === 'undefined') return;
  hydrated = true;
  const items = readStorage();
  if (items.length) state = { ...state, items };
}

function emit() {
  listeners.forEach((listener) => listener());
}

function setState(patch, { persist = true } = {}) {
  ensureHydrated();
  const next = { ...state, ...patch };
  if (persist && patch.items) writeStorage(patch.items);
  state = next;
  emit();
}

/** Keeps at most DOCK_MAX_OPEN windows open, minimizing the ones opened longest ago. */
function enforceOpenLimit(items, keepRadicado) {
  const open = items.filter((item) => item.open);
  if (open.length <= DOCK_MAX_OPEN) return items;
  const toMinimize = new Set(
    open
      .filter((item) => item.radicado !== keepRadicado)
      .sort((a, b) => (a.openedAt ?? a.addedAt) - (b.openedAt ?? b.addedAt))
      .slice(0, open.length - DOCK_MAX_OPEN)
      .map((item) => item.radicado)
  );
  return items.map((item) => (toMinimize.has(item.radicado) ? { ...item, open: false } : item));
}

/** Drops the oldest minimized items (never the one just added) above DOCK_MAX_ITEMS. */
function enforceItemLimit(items, keepRadicado) {
  let next = items;
  while (next.length > DOCK_MAX_ITEMS) {
    const candidates = next.filter((item) => item.radicado !== keepRadicado);
    const minimized = candidates.filter((item) => !item.open);
    const pool = minimized.length ? minimized : candidates;
    const oldest = pool.reduce((acc, item) => (item.addedAt < acc.addedAt ? item : acc), pool[0]);
    next = next.filter((item) => item !== oldest);
  }
  return next;
}

export function getDockSnapshot() {
  ensureHydrated();
  return state;
}

// Keeps several tabs in sync: another tab writing the dock updates this one.
function handleStorage(event) {
  if (event.key !== DOCK_STORAGE_KEY) return;
  state = { ...state, items: readStorage() };
  emit();
}

export function subscribeDock(listener) {
  ensureHydrated();
  if (!listeners.size && typeof window !== 'undefined') window.addEventListener('storage', handleStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (!listeners.size && typeof window !== 'undefined') window.removeEventListener('storage', handleStorage);
  };
}

/**
 * Adds an expediente to the dock (or updates it when already there).
 * @param {string} radicado
 * @param {{ open?: boolean }} [options] open=true shows its quick window
 */
export function addToDock(radicado, { open = true } = {}) {
  const key = normalizeRadicado(radicado);
  if (!key || key === 'Sin radicado') return getDockSnapshot();
  ensureHydrated();
  const timestamp = now();
  const exists = state.items.some((item) => item.radicado === key);
  let items = exists
    ? state.items.map((item) => (item.radicado === key
      ? { ...item, open, ...(open ? { openedAt: timestamp } : {}) }
      : item))
    : [...state.items, { radicado: key, open, addedAt: timestamp, ...(open ? { openedAt: timestamp } : {}) }];
  items = enforceItemLimit(enforceOpenLimit(items, key), key);
  setState({ items, searchOpen: false });
  return state;
}

export function toggleWindow(radicado) {
  const key = normalizeRadicado(radicado);
  const item = getDockSnapshot().items.find((candidate) => candidate.radicado === key);
  if (!item) return state;
  return item.open ? minimize(key) : addToDock(key, { open: true });
}

export function minimize(radicado) {
  const key = normalizeRadicado(radicado);
  ensureHydrated();
  if (!state.items.some((item) => item.radicado === key && item.open)) return state;
  setState({ items: state.items.map((item) => (item.radicado === key ? { ...item, open: false } : item)) });
  return state;
}

export function closeItem(radicado) {
  const key = normalizeRadicado(radicado);
  ensureHydrated();
  if (!state.items.some((item) => item.radicado === key)) return state;
  setState({ items: state.items.filter((item) => item.radicado !== key) });
  return state;
}

export function setDockSearchOpen(open) {
  ensureHydrated();
  if (state.searchOpen === Boolean(open)) return;
  setState({ searchOpen: Boolean(open) }, { persist: false });
}

/** Registers the radicado shown in the fullscreen workspace (null when it closes). */
export function setActiveWorkspace(radicado) {
  const key = normalizeRadicado(radicado) || null;
  ensureHydrated();
  if (state.activeWorkspace === key) return;
  setState({ activeWorkspace: key }, { persist: false });
}

export function useExpedienteDock() {
  return useSyncExternalStore(subscribeDock, getDockSnapshot, getDockSnapshot);
}

/** Test helper: resets memory state and re-reads storage on next access. */
export function __resetDockStoreForTests({ clock } = {}) {
  state = EMPTY_STATE;
  hydrated = false;
  if (typeof window !== 'undefined') window.removeEventListener('storage', handleStorage);
  listeners.clear();
  now = clock || (() => Date.now());
}
