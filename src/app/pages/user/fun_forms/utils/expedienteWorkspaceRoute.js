const WORKSPACE_SECTIONS = new Set([
  'detalles',
  'tiempos',
  'actualizar',
  'chequeo',
  'documentos',
  'publicidad',
  'informes',
  'acta',
  'expedicion',
]);

const WORKSPACE_REPORTS = new Set(['juridico', 'arquitectonico', 'estructural']);
const RECENT_EXPEDIENTES_STORAGE_KEY = 'dovela.recentExpedientes';
const RECENT_EXPEDIENTES_CHANGED_EVENT = 'dovela:recent-expedientes-changed';

export const LEGACY_MODULE_TO_WORKSPACE = {
  general: { section: 'detalles' },
  check: { section: 'chequeo' },
  clock: { section: 'tiempos' },
  archive: { section: 'documentos' },
  edit: { section: 'actualizar' },
  alert: { section: 'publicidad' },
  record_law: { section: 'informes', report: 'juridico' },
  record_arc: { section: 'informes', report: 'arquitectonico' },
  record_eng: { section: 'informes', report: 'estructural' },
  record_review: { section: 'acta' },
  expedition: { section: 'expedicion' },
};

export function getExpedienteWorkspaceRadicado(expediente) {
  return expediente?.id_public ?? expediente?.radicado ?? expediente?.currentPublic ?? '';
}

export function normalizeExpedienteWorkspaceTarget(options = {}) {
  const legacyTarget = LEGACY_MODULE_TO_WORKSPACE[options.module] || {};
  const section = options.section || legacyTarget.section || 'detalles';
  const report = options.report || legacyTarget.report || 'juridico';

  return {
    section: WORKSPACE_SECTIONS.has(section) ? section : 'detalles',
    report: WORKSPACE_REPORTS.has(report) ? report : 'juridico',
    rightPanel: options.rightPanel === true,
  };
}

export function buildExpedienteWorkspaceUrl(expediente, options = {}) {
  const radicado = getExpedienteWorkspaceRadicado(expediente);
  if (!radicado) return '';

  const target = normalizeExpedienteWorkspaceTarget(options);
  const params = new URLSearchParams();

  if (target.section !== 'detalles') {
    params.set('section', target.section);
  }

  if (target.section === 'informes' && target.report !== 'juridico') {
    params.set('report', target.report);
  }

  if (target.rightPanel) {
    params.set('panel', 'open');
  }

  const query = params.toString();
  return `/funmanage/expediente/${encodeURIComponent(radicado)}${query ? `?${query}` : ''}`;
}

export function openExpedienteWorkspace(expediente, options = {}) {
  const url = buildExpedienteWorkspaceUrl(expediente, options);
  if (!url) return false;

  const opener = options.opener || window;
  const target = options.target || '_blank';
  const features = options.features || 'noopener,noreferrer';
  const openedWindow = opener.open?.(url, target, features);

  if (!openedWindow && options.fallbackToSameTab === true) {
    opener.location.assign(url);
  }

  return true;
}

export function parseExpedienteWorkspaceSearch(search) {
  const params = search instanceof URLSearchParams ? search : new URLSearchParams(search || '');

  return normalizeExpedienteWorkspaceTarget({
    section: params.get('section') || undefined,
    report: params.get('report') || undefined,
    rightPanel: params.get('panel') === 'open',
  });
}

export function getRecentExpedientes(limit = 6) {
  if (typeof window === 'undefined' || !window.localStorage) return [];

  try {
    const payload = window.localStorage.getItem(RECENT_EXPEDIENTES_STORAGE_KEY);
    const items = JSON.parse(payload || '[]');

    if (!Array.isArray(items)) return [];

    return items
      .filter((item) => item?.radicado && item?.href)
      .slice(0, limit);
  } catch {
    return [];
  }
}

export function rememberRecentExpediente(expediente, options = {}) {
  if (typeof window === 'undefined' || !window.localStorage) return [];

  const radicado = getExpedienteWorkspaceRadicado(expediente);
  if (!radicado) return getRecentExpedientes(options.limit);

  const limit = options.limit || 6;
  const href = buildExpedienteWorkspaceUrl(expediente, options) || `/funmanage/expediente/${encodeURIComponent(radicado)}`;
  const currentItems = getRecentExpedientes(limit + 1);
  const nextItems = [
    { radicado, href, updatedAt: new Date().toISOString() },
    ...currentItems.filter((item) => item.radicado !== radicado),
  ].slice(0, limit);

  try {
    window.localStorage.setItem(RECENT_EXPEDIENTES_STORAGE_KEY, JSON.stringify(nextItems));
    window.dispatchEvent(new CustomEvent(RECENT_EXPEDIENTES_CHANGED_EVENT, { detail: nextItems }));
  } catch {
    return currentItems.slice(0, limit);
  }

  return nextItems;
}

export { RECENT_EXPEDIENTES_STORAGE_KEY, RECENT_EXPEDIENTES_CHANGED_EVENT };