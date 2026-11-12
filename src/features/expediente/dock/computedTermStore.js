import { useSyncExternalStore } from 'react';

/**
 * Session store of the legal term computed by the Tiempos engine for each radicado
 * (`workspace/expedienteTerm` view-model). Published by the workspace (its expediente, live)
 * and by the quick windows (on open), read by the dock chips and "Expedientes abiertos",
 * so a docked expediente never shows a term that contradicts the one its workspace shows.
 *
 * Only terms computed from the clocks are stored; nothing here comes from the backend
 * summary. Values are never persisted.
 */
const terms = new Map();
const listeners = new Set();

function emit() {
  listeners.forEach((listener) => listener());
}

/** Stores the computed term of `radicado`; loading/unknown view-models are ignored. */
export function publishComputedTerm(radicado, term) {
  const key = String(radicado ?? '').trim();
  if (!key || key === 'Sin radicado' || !term || term.kind === 'loading' || term.kind === 'unknown') return;
  if (terms.get(key) === term) return;
  terms.set(key, term);
  emit();
}

export function getComputedTerm(radicado) {
  return terms.get(String(radicado ?? '').trim()) ?? null;
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Computed term of `radicado`, or `null` while it has not been computed in this session. */
export function useComputedTerm(radicado) {
  return useSyncExternalStore(subscribe, () => getComputedTerm(radicado), () => null);
}

/** Test helper. */
export function __clearComputedTerms() {
  terms.clear();
  emit();
}
