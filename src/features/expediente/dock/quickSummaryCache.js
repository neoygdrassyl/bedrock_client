import { useCallback, useEffect, useState } from 'react';
import FUNService from '../api/fun.service';
import { logError } from '@/shared/observability/logger';

/**
 * Session cache for the legal summary shown by dock chips and quick windows.
 * Only `GET /fun/get/summary/:id_public` is used. Concurrent consumers share one
 * request; it is aborted when the last consumer unmounts before it settles.
 */
const cache = new Map();
const inflight = new Map();

function extractSummary(response) {
  return response?.data?.data ?? response?.data ?? null;
}

export function getCachedQuickSummary(radicado) {
  return cache.get(radicado) ?? null;
}

function acquire(radicado) {
  let entry = inflight.get(radicado);
  if (!entry) {
    const controller = new AbortController();
    entry = { controller, consumers: 0, promise: null };
    // FUNService dedupes GETs by key, so a request aborted by a previous consumer can be
    // handed back still pending; when the abort was not ours, ask again once it settles.
    const request = () => FUNService.getSummaryByIdPublic(radicado, { signal: controller.signal, skipErrorLog: true });
    entry.promise = request()
      .catch((error) => {
        if (isAbort(error) && !controller.signal.aborted) return request();
        throw error;
      })
      .then((response) => {
        const data = extractSummary(response);
        if (data) cache.set(radicado, data);
        return data;
      })
      .finally(() => {
        if (inflight.get(radicado) === entry) inflight.delete(radicado);
      });
    inflight.set(radicado, entry);
  }
  entry.consumers += 1;

  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    entry.consumers -= 1;
    if (entry.consumers <= 0 && inflight.get(radicado) === entry) {
      inflight.delete(radicado);
      entry.controller.abort();
    }
  };
  return { promise: entry.promise, release };
}

function isAbort(error) {
  return error?.name === 'AbortError' || error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED';
}

/**
 * @param {string} radicado
 * @param {{ enabled?: boolean }} [options]
 * @returns {{ status: 'idle'|'loading'|'done'|'error', data: object|null, retry: () => void }}
 */
export function useQuickSummary(radicado, { enabled = true } = {}) {
  const cached = radicado ? getCachedQuickSummary(radicado) : null;
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(() => (cached
    ? { radicado, status: 'done', data: cached }
    : { radicado, status: enabled ? 'loading' : 'idle', data: null }));

  useEffect(() => {
    if (!radicado || !enabled) return undefined;
    const hit = getCachedQuickSummary(radicado);
    if (hit && attempt === 0) {
      setResult({ radicado, status: 'done', data: hit });
      return undefined;
    }

    let active = true;
    setResult({ radicado, status: 'loading', data: null });
    const { promise, release } = acquire(radicado);
    promise
      .then((data) => {
        if (!active) return;
        setResult(data ? { radicado, status: 'done', data } : { radicado, status: 'error', data: null });
      })
      .catch((error) => {
        if (!active || isAbort(error)) return;
        if (error?.response?.status !== 404) {
          logError('ui_load_failed', error, { level: 'warn', component: 'ExpedienteDock', radicado });
        }
        setResult({ radicado, status: 'error', data: null, notFound: error?.response?.status === 404 });
      });

    return () => {
      active = false;
      release();
    };
  }, [attempt, enabled, radicado]);

  const retry = useCallback(() => {
    cache.delete(radicado);
    setAttempt((value) => value + 1);
  }, [radicado]);

  const current = result.radicado === radicado ? result : { radicado, status: enabled ? 'loading' : 'idle', data: null };
  return { ...current, retry };
}

/** Test helper. */
export function __clearQuickSummaryCache() {
  cache.clear();
  inflight.clear();
}
