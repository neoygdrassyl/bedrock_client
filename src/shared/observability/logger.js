/**
 * Client traceability logger.
 *
 * Events are echoed to the console in development and, when a session exists,
 * sent in small batches to `POST /api/client-events`, where the backend writes
 * them to its logs next to the request that caused them (`relatedRequestId`).
 *
 * Guarantees:
 * - never throws: every public function swallows its own failures;
 * - never loops: the transport request opts out of HTTP error logging and a
 *   failed batch is dropped, not retried or logged;
 * - bounded: identical event+message pairs are deduplicated for 30 s and at
 *   most 50 events are queued per page load.
 *
 * The transport is registered by the main HTTP client (`setLogTransport`) so this
 * module has no import cycle with the API layer.
 */

const LEVELS = new Set(['error', 'warn', 'info']);
const FLUSH_DELAY_MS = 5000;
const FLUSH_AT_EVENTS = 10;
const DEDUPE_WINDOW_MS = 30 * 1000;
const MAX_EVENTS_PER_PAGE = 50;
// Backend limits: <= 20 events and <= 32 KB per request, `data` <= 4 KB.
const MAX_EVENTS_PER_REQUEST = 20;
const MAX_REQUEST_BYTES = 28 * 1024;
const MAX_DATA_BYTES = 4000;
const MAX_EVENT_NAME = 80;
const MAX_MESSAGE = 1000;
const MAX_STACK = 3000;

export const REQUEST_ID_HEADER = 'x-dovela-request-id';
export const REQUEST_ID_PATTERN = /^[A-Za-z0-9_.:-]{8,80}$/;
const SESSION_TOKEN_KEY = 'dovela_token';

const SENSITIVE_KEY_PATTERN = /(password|passwd|contrase|token|authorization|cookie|secret|api[-_]?key|jwt|session|credential|credencial)/i;
const SENSITIVE_QUERY_PATTERN = /((?:password|passwd|token|authorization|secret|api[-_]?key|jwt|session|cookie)=)[^&\s]+/gi;

const state = {
  queue: [],
  accepted: 0,
  recent: new Map(),
  timer: null,
  transport: null,
  transportDisabled: false,
  listenersInstalled: false,
};

// ── Redaction helpers ────────────────────────────────────────────────

export function safeText(value, maxLength = 420) {
  if (value == null) return '';
  return String(value)
    .replace(SENSITIVE_QUERY_PATTERN, '$1[REDACTED]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

export function redactObject(value, depth = 0, seen = new WeakSet()) {
  if (value == null) return value;
  if (depth > 4) return '[TRUNCATED]';
  if (typeof value === 'string') return safeText(value, 1200);
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (Array.isArray(value)) return value.slice(0, 20).map((item) => redactObject(item, depth + 1, seen));

  if (typeof value === 'object') {
    if (seen.has(value)) return '[CIRCULAR]';
    seen.add(value);
    return Object.entries(value).slice(0, 50).reduce((acc, [key, item]) => {
      acc[key] = SENSITIVE_KEY_PATTERN.test(key) ? '[REDACTED]' : redactObject(item, depth + 1, seen);
      return acc;
    }, {});
  }

  return safeText(value, 1200);
}

// Stacks keep their line breaks (they are read, not grepped) but lose secrets.
function safeStack(value) {
  if (!value) return undefined;
  return String(value).replace(SENSITIVE_QUERY_PATTERN, '$1[REDACTED]').slice(0, MAX_STACK);
}

// ── Ids ──────────────────────────────────────────────────────────────

function randomToken(length = 8) {
  try {
    const bytes = new Uint8Array(length);
    globalThis.crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => (byte % 36).toString(36)).join('');
  } catch {
    return Math.random().toString(36).slice(2, 2 + length).padEnd(length, '0');
  }
}

/** `req_<ts36>_<random>`; matches the backend's request-id pattern. */
export function newRequestId() {
  return `req_${Date.now().toString(36)}_${randomToken(8)}`;
}

/** Id of one client event; shown to users as the "Código de referencia". */
export function newClientEventId() {
  return `evt_${Date.now().toString(36)}_${randomToken(8)}`;
}

function validRequestId(value) {
  return typeof value === 'string' && REQUEST_ID_PATTERN.test(value) ? value : null;
}

function readHeader(headers, name) {
  if (!headers) return null;
  try {
    if (typeof headers.get === 'function') {
      const value = headers.get(name);
      if (value) return value;
    }
    const match = Object.keys(headers).find((key) => key.toLowerCase() === name);
    return match ? headers[match] : null;
  } catch {
    return null;
  }
}

/**
 * Request id that ties a failed request to the backend logs: the id the server
 * echoed, then the one in the error body, then the one the client sent.
 */
export function getRequestIdFromError(error) {
  try {
    if (!error || typeof error !== 'object') return null;
    const response = error.response;
    const body = response?.data && typeof response.data === 'object' ? response.data : null;
    return validRequestId(readHeader(response?.headers, REQUEST_ID_HEADER))
      || validRequestId(body?.requestId)
      || validRequestId(body?.error?.requestId)
      || validRequestId(error.config?.dovelaRequestId)
      || validRequestId(readHeader(error.config?.headers, REQUEST_ID_HEADER))
      || validRequestId(error.requestId)
      || (error.cause && error.cause !== error ? getRequestIdFromError(error.cause) : null);
  } catch {
    return null;
  }
}

// ── Queue and transport ──────────────────────────────────────────────

/**
 * Registers the function that sends a batch (`events => Promise`). The main HTTP
 * client registers itself; tests can register a fake.
 */
export function setLogTransport(transport) {
  state.transport = typeof transport === 'function' ? transport : null;
}

function hasSession() {
  try {
    return Boolean(globalThis.localStorage?.getItem(SESSION_TOKEN_KEY));
  } catch {
    return false;
  }
}

function currentPath() {
  try {
    return globalThis.location?.pathname || undefined;
  } catch {
    return undefined;
  }
}

function moduleFromPath(path) {
  return path ? path.split('/').filter(Boolean)[0] || 'dashboard' : undefined;
}

function shouldEcho() {
  return Boolean(import.meta.env?.DEV) && import.meta.env?.MODE !== 'test';
}

function echo(level, entry) {
  if (!shouldEcho()) return;
  try {
    // eslint-disable-next-line no-console
    console[level](`[dovela:${entry.event}]`, entry.message || '', entry);
  } catch {}
}

function boundedData(data) {
  if (data == null) return undefined;
  const redacted = redactObject(data);
  try {
    const json = JSON.stringify(redacted);
    if (json.length <= MAX_DATA_BYTES) return redacted;
    return { truncated: true, preview: json.slice(0, MAX_DATA_BYTES - 200) };
  } catch {
    return undefined;
  }
}

function scheduleFlush() {
  if (state.queue.length >= FLUSH_AT_EVENTS) {
    flushLogs();
    return;
  }
  if (state.timer) return;
  state.timer = setTimeout(() => {
    state.timer = null;
    flushLogs();
  }, FLUSH_DELAY_MS);
}

function takeBatch() {
  const batch = [];
  let bytes = 16;
  while (state.queue.length && batch.length < MAX_EVENTS_PER_REQUEST) {
    const next = state.queue[0];
    const size = JSON.stringify(next).length + 1;
    if (batch.length && bytes + size > MAX_REQUEST_BYTES) break;
    batch.push(state.queue.shift());
    bytes += size;
  }
  return batch;
}

function isEndpointMissing(error) {
  const status = error?.response?.status;
  return status === 404 || status === 405 || status === 501;
}

/** Sends every queued event. Without a session or transport the queue waits. */
export function flushLogs() {
  try {
    if (state.timer) {
      clearTimeout(state.timer);
      state.timer = null;
    }
    if (state.transportDisabled) {
      state.queue = [];
      return;
    }
    if (!state.transport || !state.queue.length || !hasSession()) return;

    while (state.queue.length) {
      const batch = takeBatch();
      Promise.resolve()
        .then(() => state.transport(batch))
        .catch((error) => {
          // An older backend without the endpoint: stop trying for this page load.
          if (isEndpointMissing(error)) {
            state.transportDisabled = true;
            state.queue = [];
          }
          // Any other failure drops the batch on purpose: retrying or logging it
          // could turn a backend outage into a request loop.
        });
    }
  } catch {}
}

// ── Public API ───────────────────────────────────────────────────────

/**
 * Records one event. Returns its `clientEventId` (the earlier one when it was
 * deduplicated), or null when it was dropped (over the per-page cap) or invalid.
 *
 * @param {'error'|'warn'|'info'} level
 * @param {string} event short snake_case name, e.g. `http_error`
 * @param {object} [fields] message, stack, componentStack, path, module,
 *   relatedRequestId, data, clientEventId
 */
export function logEvent(level, event, fields = {}) {
  try {
    const safeLevel = LEVELS.has(level) ? level : 'info';
    const name = safeText(event, MAX_EVENT_NAME);
    if (!name) return null;

    const path = fields.path || currentPath();
    const entry = {
      level: safeLevel,
      event: name,
      message: safeText(fields.message, MAX_MESSAGE) || undefined,
      stack: safeStack(fields.stack),
      componentStack: safeStack(fields.componentStack),
      path: path ? safeText(path, 300) : undefined,
      module: fields.module || moduleFromPath(path),
      relatedRequestId: validRequestId(fields.relatedRequestId) || undefined,
      clientEventId: validRequestId(fields.clientEventId) || newClientEventId(),
      ts: new Date().toISOString(),
      data: boundedData(fields.data),
    };
    Object.keys(entry).forEach((key) => entry[key] === undefined && delete entry[key]);

    echo(safeLevel, entry);

    // A duplicate answers with the id of the event that was actually queued, so
    // a reference shown to the user always matches something in the logs.
    const now = Date.now();
    const dedupeKey = `${entry.event}|${entry.message || ''}`;
    const seen = state.recent.get(dedupeKey);
    if (seen && now - seen.at < DEDUPE_WINDOW_MS) return seen.id;
    if (state.recent.size > 200) {
      state.recent.forEach((item, key) => { if (now - item.at >= DEDUPE_WINDOW_MS) state.recent.delete(key); });
    }

    if (state.accepted >= MAX_EVENTS_PER_PAGE || state.transportDisabled) return null;
    state.recent.set(dedupeKey, { at: now, id: entry.clientEventId });
    state.accepted += 1;
    state.queue.push(entry);
    scheduleFlush();
    return entry.clientEventId;
  } catch {
    return null;
  }
}

function describeError(error) {
  if (error == null) return { message: 'Unknown error' };
  if (typeof error === 'string') return { message: error };
  if (typeof error === 'object') {
    const name = error.name && error.name !== 'Error' ? `${error.name}: ` : '';
    return {
      message: `${name}${error.message || error.reason || String(error)}`,
      stack: error.stack,
    };
  }
  return { message: String(error) };
}

/** Records an error (Error, string or rejection reason). Level defaults to `error`. */
export function logError(event, error, fields = {}) {
  try {
    const { level = 'error', ...rest } = fields;
    const described = describeError(error);
    return logEvent(level, event, {
      relatedRequestId: getRequestIdFromError(error) || undefined,
      ...rest,
      message: rest.message || described.message,
      stack: rest.stack || described.stack,
    });
  } catch {
    return null;
  }
}

function requestPath(config) {
  const raw = String(config?.url || '');
  try {
    return new URL(raw, 'http://relative.invalid').pathname;
  } catch {
    return raw.split(/[?#]/)[0];
  }
}

/**
 * Records a failed HTTP request as `http_error`: `warn` for 4xx and network
 * failures, `error` for 5xx. Canceled requests and 401 (handled by logout) are
 * skipped. Returns the client event id, or null when nothing was logged.
 */
export function logHttpError(error, fields = {}) {
  try {
    if (!error || error.code === 'ERR_CANCELED' || error.__CANCEL__) return null;
    const status = error.response?.status ?? null;
    if (status === 401) return null;
    const method = String(error.config?.method || 'get').toUpperCase();
    const path = requestPath(error.config);
    return logEvent(status >= 500 ? 'error' : 'warn', fields.event || 'http_error', {
      message: `${method} ${path} -> ${status ?? error.code ?? 'network'}`,
      relatedRequestId: getRequestIdFromError(error) || undefined,
      ...fields,
      data: { method, url: path, status, code: error.code || undefined, ...(fields.data || {}) },
    });
  } catch {
    return null;
  }
}

// ── Recent HTTP failure ──────────────────────────────────────────────

let lastHttpFailure = null;

/**
 * Remembers the last failed request (method, request id, time), whether or not
 * it was logged, so a generic error message shown right after it can be tied to
 * it (see swalAdapter's load-failure classification).
 */
export function rememberHttpFailure(error) {
  try {
    if (!error || error.code === 'ERR_CANCELED' || error.__CANCEL__) return;
    lastHttpFailure = {
      method: String(error.config?.method || 'get').toUpperCase(),
      status: error.response?.status ?? null,
      requestId: getRequestIdFromError(error),
      at: Date.now(),
    };
  } catch {}
}

/** The last failed request if it happened within `maxAgeMs`, else null. */
export function getRecentHttpFailure(maxAgeMs = 2000) {
  if (!lastHttpFailure || Date.now() - lastHttpFailure.at > maxAgeMs) return null;
  return lastHttpFailure;
}

// ── Global listeners ─────────────────────────────────────────────────

function isAxiosError(reason) {
  return Boolean(reason && typeof reason === 'object' && (reason.isAxiosError || (reason.config && reason.request)));
}

/**
 * Logs uncaught errors and unhandled rejections once per page. No UI: a failed
 * calculation or component that does not break the page is a symptom, not an
 * error screen.
 */
export function installGlobalErrorListeners(target = globalThis.window) {
  if (state.listenersInstalled || !target?.addEventListener) return;
  state.listenersInstalled = true;

  target.addEventListener('error', (event) => {
    logError('js_error', event?.error || event?.message, {
      data: { source: event?.filename, line: event?.lineno, column: event?.colno },
    });
  });

  target.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason;
    // Failed requests were already logged by the HTTP client.
    if (isAxiosError(reason)) return;
    logError('unhandled_rejection', reason);
  });

  try {
    globalThis.document?.addEventListener('visibilitychange', () => {
      if (globalThis.document.visibilityState === 'hidden') flushLogs();
    });
  } catch {}
}

/** Test helper: clears queue, counters and transport. */
export function __resetLoggerForTests() {
  if (state.timer) clearTimeout(state.timer);
  state.queue = [];
  state.accepted = 0;
  state.recent = new Map();
  state.timer = null;
  state.transport = null;
  state.transportDisabled = false;
  lastHttpFailure = null;
}

/** Test helper: events waiting to be sent. */
export function __getQueuedEventsForTests() {
  return state.queue.slice();
}
