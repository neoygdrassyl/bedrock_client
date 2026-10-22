import { toast } from 'sonner';
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

/**
 * True when the backend could not be reached: an axios error without a response
 * (connection refused, DNS, CORS, offline) or a 502/503/504 from the proxy. A
 * timeout is excluded: the server answered nothing in time but may be up.
 */
export function isServerUnreachable(error) {
  if (!error || typeof error !== 'object') return false;
  if (error.code === 'ERR_CANCELED' || error.__CANCEL__) return false;
  const status = error.response?.status;
  if (status) return UNAVAILABLE_STATUSES.has(status);
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') return false;
  return Boolean(error.isAxiosError || error.request || error.code === 'ERR_NETWORK');
}

/**
 * Reloads the page once to pick up a new build. A sessionStorage timestamp
 * prevents a loop when the chunk keeps failing: within one minute of the last
 * automatic reload it returns false and the caller shows the `chunk` screen.
 */
export function tryChunkAutoReload({ storage = globalThis.sessionStorage, reload } = {}) {
  try {
    const now = Date.now();
    const last = Number(storage?.getItem(CHUNK_RELOAD_STORAGE_KEY) || 0);
    if (last && now - last < CHUNK_RELOAD_WINDOW_MS) return false;
    storage?.setItem(CHUNK_RELOAD_STORAGE_KEY, String(now));
    (reload || (() => globalThis.location.reload()))();
    return true;
  } catch {
    return false;
  }
}

export const NEW_VERSION_TOAST_ID = 'dovela-new-version';

/**
 * Handles Vite's `vite:preloadError` (a lazy chunk or its CSS failed to load,
 * usually because a deploy replaced the hashed files). It logs the failure and
 * offers "Actualizar" in a toast instead of reloading on the spot: the import
 * may come from a button handler and an instant reload would discard unsaved
 * work. The error still propagates, so a failed lazy route reaches
 * RouteErrorBoundary, which reloads once and then shows the `chunk` screen.
 */
export function installChunkPreloadHandler(target = globalThis.window) {
  if (!target?.addEventListener || target.__dovelaChunkHandler) return;
  target.__dovelaChunkHandler = true;
  target.addEventListener('vite:preloadError', (event) => {
    const reason = event?.payload;
    logEvent('warn', 'chunk_load_failed', { message: reason?.message || String(reason || 'vite:preloadError') });
    try {
      toast.warning('Hay una versión nueva de Dovela', {
        id: NEW_VERSION_TOAST_ID,
        description: 'Actualice la página para seguir trabajando con la versión más reciente.',
        duration: Infinity,
        action: { label: 'Actualizar', onClick: () => globalThis.location.reload() },
      });
    } catch {}
  });
}
