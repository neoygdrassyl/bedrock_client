const LAST_ERROR_STORAGE_KEY = 'dovela-last-error-context-v2';
const LAST_HTTP_ERROR_STORAGE_KEY = 'dovela-last-http-error-context-v1';
const LAST_ACTION_STORAGE_KEY = 'dovela-last-user-action-v2';
const CONSOLE_ENTRIES_STORAGE_KEY = 'dovela-console-entries-v2';
export const DOVELA_OPEN_ERROR_REPORT_EVENT = 'dovela:open-error-report';
const REPORT_HTTP_ERROR_WINDOW_MS = 2 * 60 * 1000;
const SENSITIVE_KEY_PATTERN = /(password|passwd|contrase|token|authorization|cookie|secret|api[-_]?key|jwt|session|credential|credencial)/i;
const SENSITIVE_QUERY_PATTERN = /((?:password|passwd|token|authorization|secret|api[-_]?key|jwt|session|cookie)=)[^&\s]+/gi;

const MODULE_LABELS = {
  dashboard: 'Dashboard principal',
  licencias: 'Licencias',
  funmanage: 'Gestión de licencias',
  peticiones: 'Peticiones PQRS',
  ventanilla: 'Ventanilla Única',
  mensajes: 'Mensajes y chat',
  calendario: 'Calendario de citas',
  archivo: 'Archivo',
  publicaciones: 'Publicaciones',
  nomenclatura: 'Nomenclatura',
  documentos: 'Documentos',
  calculadora: 'Calculadora de expensas',
  consecutivos: 'Consecutivos',
  profesionales: 'Profesionales',
  certificados: 'Certificados',
  ayuda: 'Manual de usuario',
  configuracion: 'Configuración',
};

function canUseStorage() {
  try {
    return typeof window !== 'undefined' && Boolean(window.localStorage);
  } catch {
    return false;
  }
}

function readStorage(key, fallback = null) {
  if (!canUseStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function safeText(value, maxLength = 420) {
  if (value == null) return '';
  return String(value)
    .replace(SENSITIVE_QUERY_PATTERN, '$1[REDACTED]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function redactObject(value, depth = 0, seen = new WeakSet()) {
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

function getPageSnapshot() {
  if (typeof window === 'undefined') return {};
  return {
    title: document.title || 'Sin título',
    referrer: document.referrer || null,
    visibilityState: document.visibilityState || null,
    online: window.navigator?.onLine ?? null,
    scroll: {
      x: Math.round(window.scrollX || 0),
      y: Math.round(window.scrollY || 0),
    },
    mainHeading: safeText(document.querySelector('main h1, main h2, [role="main"] h1')?.textContent, 180) || null,
    activeElement: safeText(document.activeElement?.getAttribute?.('aria-label') || document.activeElement?.textContent || document.activeElement?.id, 180) || null,
  };
}

function getCurrentLocationSnapshot() {
  if (typeof window === 'undefined') return {};
  return {
    href: window.location.href,
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    origin: window.location.origin,
  };
}

function getModuleLabel(pathname = '') {
  const segment = pathname.split('/').filter(Boolean)[0] || 'dashboard';
  return MODULE_LABELS[segment] || segment.replace(/-/g, ' ') || 'Módulo no identificado';
}

function getUserSnapshot() {
  if (typeof window === 'undefined' || !window.user) return null;
  const user = window.user;
  return {
    id: user.id ?? user.id_user ?? user.worker_id ?? null,
    name: [user.name, user.name_2, user.surname].filter(Boolean).join(' ').trim() || user.name_full || null,
    email: user.email || user.email_public || null,
    role: user.role_short || user.role || user.roleDesc || null,
    active: user.active ?? null,
  };
}

function getBrowserSnapshot() {
  if (typeof window === 'undefined') return {};
  return {
    userAgent: window.navigator?.userAgent || 'No disponible',
    language: window.navigator?.language || 'No disponible',
    viewport: `${window.innerWidth || 0}x${window.innerHeight || 0}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    platform: window.navigator?.platform || 'No disponible',
    deviceMemory: window.navigator?.deviceMemory || null,
  };
}

function normalizeConsoleArgs(args = []) {
  return args.map((arg) => {
    if (arg instanceof Error) return `${arg.name}: ${arg.message}\n${arg.stack || ''}`;
    if (typeof arg === 'object') {
      try { return JSON.stringify(redactObject(arg)); } catch { return String(arg); }
    }
    return String(arg);
  }).join(' ');
}

export function getRecentConsoleEntries() {
  const entries = readStorage(CONSOLE_ENTRIES_STORAGE_KEY, []);
  return Array.isArray(entries) ? entries : [];
}

export function captureDovelaConsoleMessage(level, args = []) {
  const location = getCurrentLocationSnapshot();
  const entry = {
    at: new Date().toISOString(),
    level,
    message: safeText(normalizeConsoleArgs(args), 1400),
    path: location.pathname,
    module: getModuleLabel(location.pathname),
  };
  const entries = [entry, ...getRecentConsoleEntries()].slice(0, 30);
  writeStorage(CONSOLE_ENTRIES_STORAGE_KEY, entries);
  return entry;
}

function getQueryValue(params, keys) {
  for (const key of keys) {
    const value = params.get(key);
    if (value) return value;
  }
  return null;
}

function extractElementDataset(element) {
  if (!element?.dataset) return {};
  const allowedKeys = ['radicado', 'idPublic', 'id_public', 'fun0Id', 'expedienteId', 'module', 'submodule'];
  return allowedKeys.reduce((acc, key) => {
    if (element.dataset[key]) acc[key] = element.dataset[key];
    return acc;
  }, {});
}

export function extractExpedienteContext() {
  if (typeof window === 'undefined') return null;

  const location = getCurrentLocationSnapshot();
  const params = new URLSearchParams(location.search || '');
  const fromQuery = getQueryValue(params, ['radicado', 'id_public', 'idPublic', 'fun0Id', 'expediente', 'id']);
  const expedienteRouteMatch = location.pathname?.match(/\/funmanage\/expediente\/([^/]+)/i);
  const activeElement = document.activeElement;
  const contextElement = activeElement?.closest?.('[data-radicado], [data-id-public], [data-id_public], [data-fun0-id], [data-expediente-id]');
  const dataset = extractElementDataset(contextElement);
  const radicado = fromQuery || expedienteRouteMatch?.[1] || dataset.radicado || dataset.idPublic || dataset.id_public || null;

  if (!radicado && Object.keys(dataset).length === 0) return null;

  return {
    radicado: radicado ? decodeURIComponent(radicado) : null,
    identifiers: dataset,
  };
}

function describeElement(element) {
  if (!element?.tagName) return null;
  const href = element.getAttribute?.('href');
  const role = element.getAttribute?.('role');
  const ariaLabel = element.getAttribute?.('aria-label');
  const title = element.getAttribute?.('title');
  const name = element.getAttribute?.('name');
  const type = element.getAttribute?.('type');
  const id = element.getAttribute?.('id');
  const text = ['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName)
    ? element.getAttribute?.('placeholder')
    : element.textContent;

  return {
    tag: element.tagName.toLowerCase(),
    role: role || null,
    id: id || null,
    name: name || null,
    type: type || null,
    href: href || null,
    label: safeText(ariaLabel || title || text, 180) || null,
  };
}

export function captureDovelaUserAction(event) {
  const target = event?.target;
  const element = target?.closest?.('button, a, [role="button"], [role="menuitem"], input, select, textarea, [data-report-context]');
  if (!element) return null;

  const location = getCurrentLocationSnapshot();
  const action = {
    at: new Date().toISOString(),
    type: event.type,
    path: location.pathname,
    module: getModuleLabel(location.pathname),
    element: describeElement(element),
    expediente: extractExpedienteContext(),
  };

  writeStorage(LAST_ACTION_STORAGE_KEY, action);
  return action;
}

function serializeError(error) {
  if (!error) return null;
  if (typeof error === 'string') return { message: safeText(error, 1000) };

  return {
    name: error.name || 'Error',
    message: safeText(error.message || error.reason || error.toString?.(), 1000),
    stack: safeText(error.stack, 2600),
  };
}

function buildBaseContext() {
  const location = getCurrentLocationSnapshot();
  return {
    at: new Date().toISOString(),
    appVersion: 'Dovela 2.0',
    location,
    module: getModuleLabel(location.pathname),
    user: getUserSnapshot(),
    browser: getBrowserSnapshot(),
    page: getPageSnapshot(),
    consoleEntries: getRecentConsoleEntries().slice(0, 12),
    expediente: extractExpedienteContext(),
    lastAction: readStorage(LAST_ACTION_STORAGE_KEY, null),
  };
}

export function captureDovelaError(error, meta = {}) {
  const snapshot = {
    ...buildBaseContext(),
    source: meta.source || 'frontend',
    notify: meta.notify !== false,
    error: serializeError(error),
    info: meta.info || null,
    componentStack: safeText(meta.componentStack, 2600) || null,
    http: meta.http || null,
  };

  writeStorage(LAST_ERROR_STORAGE_KEY, snapshot);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dovela:error-captured', { detail: snapshot }));
  }

  return snapshot;
}

export function captureDovelaHttpError(error) {
  const status = error?.response?.status ?? null;
  const url = error?.config?.url || '';
  const responseData = error?.response?.data || {};
  const responseHeaders = error?.response?.headers || {};
  const requestId = responseData.requestId || responseHeaders['x-dovela-request-id'] || responseHeaders['X-Dovela-Request-Id'] || null;
  const backendErrorId = responseData.backendErrorId || responseHeaders['x-dovela-backend-error-id'] || responseHeaders['X-Dovela-Backend-Error-Id'] || null;
  const isExpectedAuthRedirect = status === 401 && error?.response?.data?.expired === true;
  // 404/422 casi siempre delatan un contrato roto (ruta inexistente, payload
  // rechazado) y deben verse en telemetría; el resto de 4xx sigue filtrado
  // porque suele ser validación esperada de UI.
  const isContractError = status === 404 || status === 422;
  if (url.includes('error-reports')) return null;
  if (isExpectedAuthRedirect || (status && status < 500 && !isContractError)) return null;

  const snapshot = captureDovelaError(error, {
    source: 'http-client',
    notify: true,
    http: {
      status,
      statusText: error?.response?.statusText || null,
      method: error?.config?.method || null,
      url: error?.config?.url || null,
      baseURL: error?.config?.baseURL || null,
      requestId,
      backendRequestId: requestId,
      backendErrorId,
      responseMessage: safeText(error?.response?.data?.message || error?.response?.data?.error, 700) || null,
    },
  });

  writeStorage(LAST_HTTP_ERROR_STORAGE_KEY, snapshot);
  return snapshot;
}

export function getLastDovelaError() {
  const lastError = readStorage(LAST_ERROR_STORAGE_KEY, null);
  if (!lastError) return null;
  if (!lastError.http) return lastError;
  const status = lastError.http.status;
  if (status && status < 500) return null;
  return lastError;
}

export function isThinDovelaErrorContext(lastError) {
  if (!lastError || typeof lastError !== 'object') return false;
  if (lastError.http || lastError.componentStack || lastError.info) return false;
  return Object.keys(lastError).every((key) => ['source', 'error'].includes(key));
}

export function getLastDovelaHttpError(options = {}) {
  const { maxAgeMs = REPORT_HTTP_ERROR_WINDOW_MS, pathname = null } = options;
  const lastHttpError = readStorage(LAST_HTTP_ERROR_STORAGE_KEY, null);
  if (!lastHttpError?.http) return null;

  const status = lastHttpError.http.status;
  if (status && status < 500) return null;

  const timestamp = Date.parse(lastHttpError.at || '');
  if (Number.isFinite(timestamp) && maxAgeMs > 0 && (Date.now() - timestamp) > maxAgeMs) {
    return null;
  }

  if (pathname && lastHttpError?.location?.pathname && lastHttpError.location.pathname !== pathname) {
    return null;
  }

  return lastHttpError;
}

export function resolveDovelaReportLastError(context = {}) {
  const explicitLastError = context?.lastError || context?.errorSnapshot || null;
  const currentPath = context?.location?.pathname
    || context?.path
    || (typeof window !== 'undefined' ? window.location?.pathname : null)
    || null;

  if (explicitLastError?.http?.status >= 500 || explicitLastError?.http?.backendErrorId || explicitLastError?.http?.requestId) {
    return explicitLastError;
  }

  const recentHttpError = getLastDovelaHttpError({ pathname: currentPath });
  if (recentHttpError && (!explicitLastError || isThinDovelaErrorContext(explicitLastError))) {
    return recentHttpError;
  }

  return explicitLastError || getLastDovelaError();
}

export function getLastDovelaAction() {
  return readStorage(LAST_ACTION_STORAGE_KEY, null);
}

export function buildDovelaErrorReport(userInput = {}, overrides = {}) {
  const resolvedLastError = overrides.lastError || resolveDovelaReportLastError(overrides);
  return {
    id: `DOVELA-${Date.now().toString(36).toUpperCase()}`,
    ...buildBaseContext(),
    lastError: resolvedLastError,
    backendTrace: resolvedLastError?.http || null,
    userInput: {
      expediente: safeText(userInput.expediente, 160) || null,
      attemptedAction: safeText(userInput.attemptedAction, 900) || null,
      details: safeText(userInput.details, 2200) || null,
      severity: safeText(userInput.severity, 80) || 'Error funcional',
    },
    source: overrides.source || 'manual-report',
  };
}

export function requestDovelaErrorReport(context = {}) {
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return false;

  try {
    window.dispatchEvent(new CustomEvent(DOVELA_OPEN_ERROR_REPORT_EVENT, {
      detail: redactObject(context),
    }));
    return true;
  } catch {
    return false;
  }
}

export async function copyReportToClipboard(report) {
  const text = JSON.stringify(report, null, 2);
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  return false;
}

export function downloadReportJson(report) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${report.id || 'dovela-error-report'}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function getDashboardGuideStorageKey(user) {
  const userId = user?.id ?? user?.id_user ?? user?.email ?? user?.role_short ?? 'anonymous';
  return `dovela-dashboard-v2-guide-dismissed:${userId}`;
}

export function isDashboardGuideDismissed(user) {
  if (!canUseStorage()) return false;
  return window.localStorage.getItem(getDashboardGuideStorageKey(user)) === 'true';
}

export function dismissDashboardGuide(user) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(getDashboardGuideStorageKey(user), 'true');
}