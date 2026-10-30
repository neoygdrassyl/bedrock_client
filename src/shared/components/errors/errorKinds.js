import { logEvent } from '@/shared/observability/logger';

/**
 * Classification of fatal errors into ErrorScreen kinds.
 *
 * Fatal means the page cannot render at all (crash, missing route, outdated
 * build, backend unreachable). A component or calculation that fails while the
 * page still shows data is a symptom: log it, do not replace the page.
 */

const CHUNK_ERROR_PATTERN = /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS|ChunkLoadError|Loading (?:CSS )?chunk [\w-]+ failed/i;
const UNAVAILABLE_STATUSES = new Set([502, 503, 504]);
const CHUNK_RELOAD_STORAGE_KEY = 'dovela-chunk-reload-at';
const CHUNK_RELOAD_WINDOW_MS = 60 * 1000;

/** True for a lazy chunk/module that failed to load (usually a new deploy). */
export function isChunkLoadError(error) {
  if (!error) return false;
  if (error.name === 'ChunkLoadError') return true;
  const text = typeof error === 'string' ? error : `${error.name || ''} ${error.message || ''}`;
  return CHUNK_ERROR_PATTERN.test(text);
}

/** True when a response carries the request id that every Dovela backend response sets. */
function hasDovelaRequestId(response) {
  const headers = response?.headers;
  if (!headers) return false;
  try {
    const value = typeof headers.get === 'function' ? headers.get('x-dovela-request-id') : headers['x-dovela-request-id'];
    return Boolean(value);
  } catch {
    return false;
  }
}

/** True for a response body with nothing in it: '', null, undefined, {} or [] (or an empty binary). */
function isEmptyBody(data) {
  if (data === undefined || data === null) return true;
  if (typeof data === 'string') return data.trim() === '';
  if (Array.isArray(data)) return data.length === 0;
  if (typeof Blob !== 'undefined' && data instanceof Blob) return data.size === 0;
  if (data instanceof ArrayBuffer) return data.byteLength === 0;
  if (typeof data === 'object') return Object.keys(data).length === 0;
  return false;
}

/**
 * True when the backend could not be reached:
 * - an axios error without a response (connection refused, DNS, CORS, offline);
 * - a 502/503/504 from the proxy or gateway;
 * - another 5xx only when it has neither the X-Dovela-Request-Id header nor a
 *   body. That is a gateway answer, such as Vite's dev proxy (an empty 500 when
 *   the backend is down) or a stopped Passenger app. A real backend 500 always
 *   has a JSON body, old backends included, so a cross-origin deployment that
 *   does not expose the header is not mistaken for an outage.
 * A timeout is excluded: the server answered nothing in time but may be up.
 */
export function isServerUnreachable(error) {
  if (!error || typeof error !== 'object') return false;
  if (error.code === 'ERR_CANCELED' || error.__CANCEL__) return false;
  const response = error.response;
  const status = response?.status;
  if (status) {
    if (UNAVAILABLE_STATUSES.has(status)) return true;
    return status >= 500 && !hasDovelaRequestId(response) && isEmptyBody(response.data);
  }
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') return false;
  return Boolean(error.isAxiosError || error.request || error.code === 'ERR_NETWORK');
}

/**
 * Reloads the page once to pick up a new build. A sessionStorage timestamp
 * prevents a loop when the chunk keeps failing: within one minute of the last
 * automatic reload it returns false and the caller shows the `chunk` screen.
 * Without a working sessionStorage (missing, blocked, or not keeping what is
 * written) the loop guard cannot work, so it never reloads and returns false.
 */
export function tryChunkAutoReload({ storage = globalThis.sessionStorage, reload } = {}) {
  try {
    if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function') return false;
    const now = Date.now();
    const last = Number(storage.getItem(CHUNK_RELOAD_STORAGE_KEY) || 0);
    if (last && now - last < CHUNK_RELOAD_WINDOW_MS) return false;
    storage.setItem(CHUNK_RELOAD_STORAGE_KEY, String(now));
    if (storage.getItem(CHUNK_RELOAD_STORAGE_KEY) !== String(now)) return false;
    (reload || (() => globalThis.location.reload()))();
    return true;
  } catch {
    return false;
  }
}

/**
 * Handles Vite's `vite:preloadError` (a lazy chunk or its CSS failed to load,
 * usually because a deploy replaced the hashed files). It only logs a `chunk`
 * entry: no toast. Reloading on the spot could discard unsaved work when the
 * import comes from a button handler. The error still propagates, so a failed
 * lazy route reaches RouteErrorBoundary, which reloads once and then shows the
 * illustrated "Recargar" state.
 */
export function installChunkPreloadHandler(target = globalThis.window) {
  if (!target?.addEventListener || target.__dovelaChunkHandler) return;
  target.__dovelaChunkHandler = true;
  target.addEventListener('vite:preloadError', (event) => {
    const reason = event?.payload;
    logEvent('warn', 'chunk_load_failed', {
      kind: 'chunk',
      message: reason?.message || String(reason || 'vite:preloadError'),
    });
  });
}
