export const DASHBOARD_PREFERENCES_STORAGE_KEY = 'dovela-dashboard-preferences';
export const DASHBOARD_PREFERENCES_CHANGED_EVENT = 'dovela:dashboard-preferences-changed';

export const DASHBOARD_PRESET_OPTIONS = [
  {
    value: 'recommended',
    label: 'Dovela recomendado',
    description: 'Consola equilibrada para radicar, gestionar y vigilar prioridades sin duplicar módulos.',
    previewActions: ['Radicar', 'Gestión nueva', 'PQRS', 'Alarmas'],
  },
  {
    value: 'intake',
    label: 'Radicación express',
    description: 'Prioriza recepción, ventanilla y creación de trámites nuevos.',
    previewActions: ['Radicación', 'Ventanilla', 'LIC. Nuevo', 'Nomenclatura'],
  },
  {
    value: 'management',
    label: 'Gestión curaduría',
    description: 'Da protagonismo a expedientes activos, alarmas, calendario y seguimiento del equipo.',
    previewActions: ['Gestión nueva', 'Gestión actual', 'Alarmas', 'Calendario'],
  },
  {
    value: 'communications',
    label: 'Atención y comunicaciones',
    description: 'Enfoca la primera pantalla en PQRS, mensajes, chat, agenda y novedades.',
    previewActions: ['PQRS', 'Mensajes', 'Chat', 'Calendario'],
  },
  {
    value: 'archive',
    label: 'Archivo y expedición',
    description: 'Ordena documentos, archivo, consecutivos, sellos y consultas complementarias.',
    previewActions: ['Archivo', 'Documentos', 'Consecutivos', 'Sellos'],
  },
];

export const DASHBOARD_LAYOUT_OPTIONS = DASHBOARD_PRESET_OPTIONS;

export const DASHBOARD_PALETTE_OPTIONS = [
  {
    value: 'dovela',
    label: 'Dovela recomendado',
    description: 'Azul institucional refinado con acento esmeralda para estados de avance.',
    swatches: ['217 76% 47%', '162 73% 34%', '38 92% 48%'],
  },
  {
    value: 'civic',
    label: 'Azul cívico',
    description: 'Más énfasis en confianza, navegación y acciones de trámite.',
    swatches: ['212 84% 44%', '199 89% 48%', '35 92% 48%'],
  },
  {
    value: 'verde',
    label: 'Verde gestión',
    description: 'Reduce ruido visual y refuerza avance, resolución y seguimiento.',
    swatches: ['162 73% 34%', '187 75% 35%', '39 92% 48%'],
  },
  {
    value: 'ambar',
    label: 'Ámbar control',
    description: 'Hace más visibles prioridades, plazos y módulos sensibles al tiempo.',
    swatches: ['37 91% 45%', '20 88% 50%', '42 96% 50%'],
  },
  {
    value: 'graphite',
    label: 'Grafito sobrio',
    description: 'Vista ejecutiva y neutral para operación densa de backoffice.',
    swatches: ['215 28% 31%', '199 69% 45%', '38 92% 48%'],
  },
];

export const DASHBOARD_DENSITY_OPTIONS = [
  {
    value: 'comfortable',
    label: 'Cómoda',
    description: 'Más aire entre bloques y lectura más pausada.',
  },
  {
    value: 'compact',
    label: 'Compacta',
    description: 'Más información útil en la primera pantalla para operación diaria.',
  },
];

const VALID_LAYOUTS = new Set(DASHBOARD_PRESET_OPTIONS.map((option) => option.value));
const VALID_PALETTES = new Set(DASHBOARD_PALETTE_OPTIONS.map((option) => option.value));
const VALID_DENSITIES = new Set(DASHBOARD_DENSITY_OPTIONS.map((option) => option.value));

const LEGACY_LAYOUT_MAP = {
  balanced: 'recommended',
  focus: 'intake',
  tracking: 'management',
};

const LEGACY_PALETTE_MAP = {
  default: 'dovela',
  blue: 'civic',
  emerald: 'verde',
  amber: 'ambar',
};

export const DEFAULT_DASHBOARD_PREFERENCES = {
  layout: 'recommended',
  palette: 'dovela',
  density: 'compact',
};

function canUseStorage() {
  try {
    return typeof window !== 'undefined' && Boolean(window.localStorage);
  } catch {
    return false;
  }
}

function safeParse(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function getUserStorageSuffix() {
  if (!canUseStorage()) return 'anonymous';

  let storedUser = null;
  try {
    storedUser = safeParse(window.localStorage.getItem('dovela_user'));
  } catch {
    storedUser = null;
  }

  const user = window.user || storedUser || {};
  return String(user.id || user.email || user.name_full || user.name || 'anonymous');
}

function getScopedStorageKey() {
  return `${DASHBOARD_PREFERENCES_STORAGE_KEY}:${getUserStorageSuffix()}`;
}

function normalizeLayout(value) {
  const migrated = LEGACY_LAYOUT_MAP[value] || value;
  return VALID_LAYOUTS.has(migrated) ? migrated : DEFAULT_DASHBOARD_PREFERENCES.layout;
}

function normalizePalette(value) {
  const migrated = LEGACY_PALETTE_MAP[value] || value;
  return VALID_PALETTES.has(migrated) ? migrated : DEFAULT_DASHBOARD_PREFERENCES.palette;
}

function emitChange(preferences) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(DASHBOARD_PREFERENCES_CHANGED_EVENT, {
      detail: preferences,
    })
  );
}

export function normalizeDashboardPreferences(raw) {
  const input = raw && typeof raw === 'object' ? raw : {};

  return {
    layout: normalizeLayout(input.layout || input.preset),
    palette: normalizePalette(input.palette),
    density: VALID_DENSITIES.has(input.density) ? input.density : DEFAULT_DASHBOARD_PREFERENCES.density,
  };
}

export function readDashboardPreferences() {
  if (!canUseStorage()) return DEFAULT_DASHBOARD_PREFERENCES;

  try {
    const scopedValue = window.localStorage.getItem(getScopedStorageKey());
    const legacyValue = window.localStorage.getItem(DASHBOARD_PREFERENCES_STORAGE_KEY);
    return normalizeDashboardPreferences(safeParse(scopedValue) || safeParse(legacyValue));
  } catch {
    return DEFAULT_DASHBOARD_PREFERENCES;
  }
}

export function applyDashboardPreferencesToDocument(nextPreferences = readDashboardPreferences()) {
  if (typeof document === 'undefined') return normalizeDashboardPreferences(nextPreferences);

  const normalized = normalizeDashboardPreferences(nextPreferences);
  document.documentElement.setAttribute('data-dovela-palette', normalized.palette);
  return normalized;
}

export function writeDashboardPreferences(nextPreferences) {
  const normalized = normalizeDashboardPreferences(nextPreferences);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(getScopedStorageKey(), JSON.stringify(normalized));
    } catch {
      // La preferencia visual es progresiva; la UI sigue funcionando con el estado en memoria.
    }
  }

  applyDashboardPreferencesToDocument(normalized);
  emitChange(normalized);
  return normalized;
}

export function patchDashboardPreferences(partialPreferences) {
  const nextPreferences = {
    ...readDashboardPreferences(),
    ...(partialPreferences || {}),
  };

  return writeDashboardPreferences(nextPreferences);
}

export function resetDashboardPreferences() {
  const defaults = { ...DEFAULT_DASHBOARD_PREFERENCES };

  if (canUseStorage()) {
    try {
      window.localStorage.removeItem(getScopedStorageKey());
      window.localStorage.removeItem(DASHBOARD_PREFERENCES_STORAGE_KEY);
    } catch {
      // Local storage es opcional; los valores recomendados siguen aplicando para esta sesión.
    }
  }

  applyDashboardPreferencesToDocument(defaults);
  emitChange(defaults);
  return defaults;
}
