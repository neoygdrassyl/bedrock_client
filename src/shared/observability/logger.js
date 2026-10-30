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
 * - bounded: identical event+message+relatedRequestId triples are deduplicated
 *   for 30 s and at most 50 events are accepted per rolling 10-minute window;
 * - per session: each event remembers the session it was recorded in and is only
 *   sent with that same session. Events recorded before login, or by a user who
 *   has since logged out, are dropped, never sent under another user's token.
 *   `clearLogQueue()` runs when the session is torn down.
 *
 * The transport is registered by the main HTTP client (`setLogTransport`) so this
 * module has no import cycle with the API layer.
 *
 * Local consumption: every accepted call is also kept in an in-memory ring
 * buffer (last 200 entries, mirrored to sessionStorage) in a compact shape
 * `{ ts, lastTs, level, kind, event, message, url, status, route, requestId,
 * count }`, deduplicated by content inside the dedupe window (`count` grows).
 * Support reads it from the console through `window.__dovelaLogs`
 * (`list(filter)`, `clear()`, `export()`, `flush()`). The buffer never holds
 * tokens, headers or request bodies: only redacted messages and request paths.
 */

const LEVELS = new Set(['error', 'warn', 'info']);
const FLUSH_DELAY_MS = 5000;
const FLUSH_AT_EVENTS = 10;
const DEDUPE_WINDOW_MS = 30 * 1000;
const RATE_LIMIT_EVENTS = 50;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
// Backend limits: <= 20 events and <= 32 KB per request, `data` <= 4096 bytes
// (UTF-8). Sizes below are measured in UTF-8 bytes with a safety margin.
const MAX_EVENTS_PER_REQUEST = 20;
const MAX_REQUEST_BYTES = 28 * 1024;
const MAX_DATA_BYTES = 4000;
const MAX_EVENT_NAME = 80;
const MAX_MESSAGE = 1000;
const MAX_STACK = 3000;

export const REQUEST_ID_HEADER = 'x-dovela-request-id';
export const REQUEST_ID_PATTERN = /^[A-Za-z0-9_.:-]{8,80}$/;
const SESSION_TOKEN_KEY = 'dovela_token';
const BUFFER_LIMIT = 200;
const BUFFER_STORAGE_KEY = 'dovela-client-logs';
const BUFFER_PERSIST_DELAY_MS = 1000;
const LOG_KINDS = new Set(['http', 'runtime', 'resource', 'chunk', 'render']);
// Event name -> kind, for callers that do not pass `kind` explicitly.
const EVENT_KINDS = {
  http_error: 'http',
  js_error: 'runtime',
  unhandled_rejection: 'runtime',
  chunk_load_failed: 'chunk',
  ui_crash: 'render',
  chart_render_failed: 'render',
  resource_load_failed: 'resource',
};

const SENSITIVE_KEY_PATTERN = /(password|passwd|contrase|token|authorization|cookie|secret|api[-_]?key|jwt|session|credential|credencial)/i;
const SENSITIVE_QUERY_PATTERN = /((?:password|passwd|token|authorization|secret|api[-_]?key|jwt|session|cookie)=)[^&\s]+/gi;

const state = {
  // Items are `{ entry, session }`: the event and the token it was recorded under.
  queue: [],
  acceptedAt: [],
  recent: new Map(),
  timer: null,
  transport: null,
  transportDisabled: false,
  listenersInstalled: false,
  // Local ring buffer for support (see the header comment).
  buffer: null,
  persistTimer: null,
  unloading: false,
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
      || validRequestId(readHeader(response?.headers, 'x-request-id'))
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

function currentSession() {
  try {
    return globalThis.localStorage?.getItem(SESSION_TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

let encoder = null;
function utf8Bytes(text) {
  try {
    encoder = encoder || new TextEncoder();
    return encoder.encode(text).length;
  } catch {
    let bytes = 0;
    for (const char of text) {
      const code = char.codePointAt(0);
      bytes += code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4;
    }
    return bytes;
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

// Only `error` level reaches the red console channel; warnings and info go to
// `console.debug` (hidden unless "Verbose" is enabled) so expected failures
// such as an optional 404 or an aborted poll do not look like app errors.
function echo(level, entry) {
  if (!shouldEcho()) return;
  try {
    const method = level === 'error' ? 'error' : 'debug';
    // eslint-disable-next-line no-console
    console[method](`[dovela:${entry.event}]`, entry.message || '', entry);
  } catch {}
}

// ── Local ring buffer ────────────────────────────────────────────────

function sessionStore() {
  try {
    return globalThis.sessionStorage || null;
  } catch {
    return null;
  }
}

function loadBuffer() {
  if (state.buffer) return state.buffer;
  state.buffer = [];
  try {
    const raw = sessionStore()?.getItem(BUFFER_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed)) state.buffer = parsed.filter((item) => item && typeof item === 'object').slice(-BUFFER_LIMIT);
  } catch {}
  return state.buffer;
}

function persistBuffer() {
  try {
    if (state.persistTimer) {
      clearTimeout(state.persistTimer);
      state.persistTimer = null;
    }
    const store = sessionStore();
    if (!store) return;
    if (!state.buffer?.length) store.removeItem(BUFFER_STORAGE_KEY);
    else store.setItem(BUFFER_STORAGE_KEY, JSON.stringify(state.buffer));
  } catch {}
}

function schedulePersist() {
  if (state.persistTimer) return;
  try {
    state.persistTimer = setTimeout(persistBuffer, BUFFER_PERSIST_DELAY_MS);
  } catch {}
}

function kindOf(event, explicit) {
  if (LOG_KINDS.has(explicit)) return explicit;
  return EVENT_KINDS[event] || 'runtime';
}

// Adds an entry to the buffer, or bumps `count` on an identical recent one.
// Identity ignores the request id: a poll failing every minute is one line.
function recordLocal(entry, kind) {
  try {
    const buffer = loadBuffer();
    const data = entry.data && typeof entry.data === 'object' ? entry.data : {};
    const status = Number.isFinite(data.status) ? data.status : undefined;
    const url = typeof data.url === 'string' ? data.url : undefined;
    const key = `${entry.level}|${kind}|${entry.event}|${entry.message || ''}|${url || ''}|${status ?? ''}`;
    const now = Date.now();

    for (let index = buffer.length - 1; index >= 0; index -= 1) {
      const item = buffer[index];
      if (item.key !== key) continue;
      if (now - Date.parse(item.lastTs) < DEDUPE_WINDOW_MS) {
        item.count += 1;
        item.lastTs = entry.ts;
        if (entry.relatedRequestId) item.requestId = entry.relatedRequestId;
        schedulePersist();
        return;
      }
      break;
    }

    const local = {
      key,
      ts: entry.ts,
      lastTs: entry.ts,
      level: entry.level,
      kind,
      event: entry.event,
      message: entry.message,
      url,
      status,
      route: entry.path,
      requestId: entry.relatedRequestId,
      clientEventId: entry.clientEventId,
      count: 1,
    };
    Object.keys(local).forEach((name) => local[name] === undefined && delete local[name]);
    buffer.push(local);
    if (buffer.length > BUFFER_LIMIT) buffer.splice(0, buffer.length - BUFFER_LIMIT);
    schedulePersist();
  } catch {}
}

function publicEntry(item) {
  const { key: _key, ...rest } = item;
  return rest;
}

function matchesFilter(item, filter) {
  if (!filter) return true;
  if (typeof filter === 'function') return Boolean(filter(publicEntry(item)));
  if (typeof filter === 'string') return item.level === filter || item.kind === filter;
  if (typeof filter !== 'object') return true;
  if (filter.level && item.level !== filter.level) return false;
  if (filter.kind && item.kind !== filter.kind) return false;
  if (filter.status != null && item.status !== filter.status) return false;
  if (filter.since && Date.parse(item.lastTs) < new Date(filter.since).getTime()) return false;
  if (filter.text) {
    const needle = String(filter.text).toLowerCase();
    const haystack = `${item.event} ${item.message || ''} ${item.url || ''} ${item.route || ''}`.toLowerCase();
    if (!haystack.includes(needle)) return false;
  }
  return true;
}

/**
 * Entries kept locally, oldest first.
 * @param {object|string|function} [filter] `{ level, kind, status, since, text }`,
 *   a level/kind name, or a predicate.
 */
export function listLocalLogs(filter) {
  try {
    return loadBuffer().filter((item) => matchesFilter(item, filter)).map(publicEntry);
  } catch {
    return [];
  }
}

/** Empties the local buffer and its sessionStorage mirror. */
export function clearLocalLogs() {
  try {
    state.buffer = [];
    persistBuffer();
  } catch {}
}

/** Local buffer as a JSON string, for support tickets. */
export function exportLocalLogs(filter) {
  try {
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      route: currentPath(),
      userAgent: globalThis.navigator?.userAgent,
      entries: listLocalLogs(filter),
    }, null, 2);
  } catch {
    return '{"entries":[]}';
  }
}

/** Installs `window.__dovelaLogs` once. */
export function installLogConsole(target = globalThis.window) {
  try {
    if (!target || target.__dovelaLogs) return;
    Object.defineProperty(target, '__dovelaLogs', {
      configurable: true,
      enumerable: false,
      value: Object.freeze({
        list: listLocalLogs,
        clear: clearLocalLogs,
        export: exportLocalLogs,
        flush: flushLogs,
      }),
    });
  } catch {}
}

// Longest prefix of `json` whose `{ ...head, truncated, preview }` wrapper fits
// in MAX_DATA_BYTES once serialized (escaping and multi-byte characters included).
function truncatedPreview(json, head = {}) {
  let low = 0;
  let high = json.length;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    const size = utf8Bytes(JSON.stringify({ ...head, truncated: true, preview: json.slice(0, mid) }));
    if (size <= MAX_DATA_BYTES) low = mid;
    else high = mid - 1;
  }
  return { ...head, truncated: true, preview: json.slice(0, low) };
}

// Redacts `data` and tags plain objects with `kind`, keeping the whole result
// (tag included) within MAX_DATA_BYTES. Arrays and primitives are kept untagged.
function boundedData(data, kind) {
  if (data == null) return { kind };
  const redacted = redactObject(data);
  const isPlainObject = typeof redacted === 'object' && redacted !== null && !Array.isArray(redacted);
  const tagged = isPlainObject ? { kind, ...redacted } : redacted;
  try {
    const json = JSON.stringify(tagged);
    if (json === undefined) return { kind };
    if (utf8Bytes(json) <= MAX_DATA_BYTES) return tagged;
    return isPlainObject ? truncatedPreview(JSON.stringify(redacted), { kind }) : truncatedPreview(json);
  } catch {
    return { kind };
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
    const next = state.queue[0].entry;
    const size = utf8Bytes(JSON.stringify(next)) + 1;
    if (batch.length && bytes + size > MAX_REQUEST_BYTES) break;
    batch.push(state.queue.shift().entry);
    bytes += size;
  }
  return batch;
}

function isEndpointMissing(error) {
  const status = error?.response?.status;
  return status === 404 || status === 405 || status === 501;
}

/**
 * Sends every event recorded under the current session. Without a session or
 * transport the queue waits; events from another session (or from before login)
 * are dropped.
 */
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
    if (!state.transport || !state.queue.length) return;
    const session = currentSession();
    if (!session) return;
    state.queue = state.queue.filter((item) => item.session === session);

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
 * Drops every queued event and the dedupe memory. Called when the session is
 * torn down (401 or explicit logout) so nothing recorded under one user is sent
 * with the next user's token.
 */
export function clearLogQueue() {
  try {
    if (state.timer) {
      clearTimeout(state.timer);
      state.timer = null;
    }
    state.queue = [];
    state.recent = new Map();
    // Entries of the user that just left must not be shown to the next one.
    clearLocalLogs();
  } catch {}
}

/**
 * Records one event. Returns its `clientEventId` (the earlier one when it was
 * deduplicated), or null when it was dropped (over the rate limit) or invalid.
 *
 * @param {'error'|'warn'|'info'} level
 * @param {string} event short snake_case name, e.g. `http_error`
 * @param {object} [fields] message, stack, componentStack, path, module,
 *   relatedRequestId, data, clientEventId, kind (http|runtime|resource|chunk|render),
 *   localOnly (keep in the local buffer only)
 */
export function logEvent(level, event, fields = {}) {
  try {
    const safeLevel = LEVELS.has(level) ? level : 'info';
    const name = safeText(event, MAX_EVENT_NAME);
    if (!name) return null;

    const path = fields.path || currentPath();
    const kind = kindOf(name, fields.kind);
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
      data: boundedData(fields.data, kind),
    };
    Object.keys(entry).forEach((key) => entry[key] === undefined && delete entry[key]);

    recordLocal(entry, kind);
    // Failures the caller already handles (optional endpoints, the log transport
    // itself) stay in the local buffer only: never echoed, never sent.
    if (fields.localOnly) return entry.clientEventId;
    echo(safeLevel, entry);

    // A duplicate answers with the id of the event that was actually queued, so
    // a reference shown to the user always matches something in the logs.
    const now = Date.now();
    const dedupeKey = `${entry.event}|${entry.message || ''}|${entry.relatedRequestId || ''}`;
    const seen = state.recent.get(dedupeKey);
    if (seen && now - seen.at < DEDUPE_WINDOW_MS) return seen.id;
    if (state.recent.size > 200) {
      state.recent.forEach((item, key) => { if (now - item.at >= DEDUPE_WINDOW_MS) state.recent.delete(key); });
    }

    if (state.transportDisabled) return null;
    state.acceptedAt = state.acceptedAt.filter((at) => now - at < RATE_LIMIT_WINDOW_MS);
    if (state.acceptedAt.length >= RATE_LIMIT_EVENTS) return null;
    state.recent.set(dedupeKey, { at: now, id: entry.clientEventId });
    state.acceptedAt.push(now);
    state.queue.push({ entry, session: currentSession() });
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
    // Requests cut by a page unload (logout redirect, reload) are not failures.
    if (!status && state.unloading) return null;
    const method = String(error.config?.method || 'get').toUpperCase();
    const path = requestPath(error.config);
    const { level, ...rest } = fields;
    return logEvent(level || (status >= 500 ? 'error' : 'warn'), rest.event || 'http_error', {
      message: `${method} ${path} -> ${status ?? error.code ?? 'network'}`,
      relatedRequestId: getRequestIdFromError(error) || undefined,
      kind: 'http',
      ...rest,
      data: { method, url: path, status, code: error.code || undefined, ...(rest.data || {}) },
    });
  } catch {
    return null;
  }
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
  installLogConsole(target);

  target.addEventListener('error', (event) => {
    const message = String(event?.message || event?.error?.message || '');
    // Benign browser notice, not an application error.
    if (/ResizeObserver loop/i.test(message)) return;
    logError('js_error', event?.error || event?.message, {
      data: { source: event?.filename, line: event?.lineno, column: event?.colno },
    });
  });

  target.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason;
    // Failed requests were already logged by the HTTP client.
    if (isAxiosError(reason)) return;
    // Aborted fetches/navigations reject with AbortError: expected, not a failure.
    if (reason?.name === 'AbortError' || reason?.code === 'ERR_CANCELED' || reason?.__CANCEL__) return;
    logError('unhandled_rejection', reason, { level: 'warn' });
  });

  const markUnloading = () => {
    state.unloading = true;
    persistBuffer();
  };
  target.addEventListener('pagehide', markUnloading);
  target.addEventListener('pageshow', () => { state.unloading = false; });

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
  state.acceptedAt = [];
  state.recent = new Map();
  state.timer = null;
  state.transport = null;
  state.transportDisabled = false;
  state.buffer = null;
  state.unloading = false;
  if (state.persistTimer) clearTimeout(state.persistTimer);
  state.persistTimer = null;
}

/** Test helper: events waiting to be sent. */
export function __getQueuedEventsForTests() {
  return state.queue.map((item) => item.entry);
}
