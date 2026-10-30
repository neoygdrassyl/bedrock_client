export const DEFAULT_FILTERS = {
  page: 1,
  limit: 12,
  fase: null,
  phase: null,
  subfiltro: null,
  status: null,
  responsable: null,
  profesional: null,
  asignado_a_mi: false,
  desde: null,
  hasta: null,
  search: '',
  sort: 'severity',
  order: 'DESC',
  desistido: null,
  causal: null,
  incluirCerrados: false,
  bookmarked: null,
  vecinos: null,
  vecinosState: null,
  valla: null,
  vallaState: null,
  alarmTraffic: null,
  alarmLevel: null,
  alarmActor: null,
  alarmAction: null,
  soloConAlarmas: false,
};

export function serializeFilters(filters) {
  const out = {};
  Object.entries(filters || {}).forEach(([k, v]) => {
    if (v === null || v === undefined || v === '' || v === false) return;
    out[k] = v;
  });
  return out;
}

export function mergeFilters(current, patch) {
  const next = { ...current, ...patch };
  if (patch && Object.keys(patch).some((k) => k !== 'page')) {
    next.page = 1;
  }
  return next;
}

export function clearFilter(filters, key) {
  const next = { ...filters, [key]: DEFAULT_FILTERS[key] ?? null };
  next.page = 1;
  return next;
}

export function hasActiveFilters(filters) {
  const keys = [
    'fase', 'phase', 'subfiltro', 'status', 'responsable', 'profesional', 
    'search', 'desistido', 'causal', 'bookmarked', 'vecinos', 'vecinosState', 'valla', 'vallaState',
    'alarmTraffic', 'alarmLevel', 'alarmActor', 'alarmAction',
    'desde', 'hasta'
  ];
  return keys.some((k) => {
    const v = filters?.[k];
    return v !== null && v !== undefined && v !== '';
  }) || filters?.asignado_a_mi || filters?.incluirCerrados || filters?.soloConAlarmas;
}
