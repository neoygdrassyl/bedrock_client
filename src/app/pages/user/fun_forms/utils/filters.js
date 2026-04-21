export const DEFAULT_FILTERS = {
  page: 1,
  limit: 12,
  fase: null,
  status: null,
  responsable: null,
  search: '',
  sort: 'severity',
  order: 'DESC',
  desistido: null,
  causal: null,
  incluirCerrados: false,
  bookmarked: null,
  vecinosState: null,
};

export function serializeFilters(filters) {
  const out = {};
  Object.entries(filters || {}).forEach(([k, v]) => {
    if (v === null || v === undefined || v === '') return;
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
  const keys = ['fase', 'status', 'responsable', 'search', 'desistido', 'causal', 'bookmarked', 'vecinosState'];
  return keys.some((k) => {
    const v = filters?.[k];
    return v !== null && v !== undefined && v !== '';
  });
}
