/**
 * Pure helpers of the online radication inbox: status vocabulary, label resolution for the
 * portal snapshot and Spanish formatters. No React, no HTTP.
 */

export const PAGE_SIZE = 20;
export const WAITING_WARNING_BUSINESS_DAYS = 3;
export const MISSING = '—';

// `countKey` is the field of the normalized `/counts` payload shown in the filter pill.
export const STATUS_FILTERS = [
  { value: 'pending', label: 'Pendientes', countKey: 'pending' },
  { value: 'with_entries', label: 'Con entradas nuevas', countKey: 'pendingEntries' },
  { value: 'radicated', label: 'Radicadas', countKey: 'radicated' },
  { value: 'rejected', label: 'Rechazadas', countKey: 'rejected' },
  { value: 'all', label: 'Todas', countKey: 'all' },
];

export const STATUS_META = {
  pending: { label: 'Pendiente', tone: 'warning' },
  radicated: { label: 'Radicada', tone: 'success' },
  rejected: { label: 'Rechazada', tone: 'danger' },
};

export const ORDER_HINTS = {
  pending: 'Orden de llegada: las más antiguas primero.',
  with_entries: 'Solicitudes con entradas de documentos por recibir o rechazar.',
  radicated: 'Las radicadas más recientes primero.',
  rejected: 'Las rechazadas más recientes primero.',
  all: 'Las recibidas más recientes primero.',
};

export const EMPTY_STATES = {
  pending: {
    title: 'No hay solicitudes pendientes',
    description: 'Las nuevas solicitudes del portal aparecerán aquí.',
  },
  with_entries: {
    title: 'No hay entradas de documentos por revisar',
    description: 'Cuando la ciudadanía actualice documentos desde el portal, la solicitud aparecerá aquí.',
  },
  radicated: {
    title: 'Aún no hay solicitudes radicadas',
    description: 'Las solicitudes que lleve a radicación aparecerán aquí con su expediente y su VR.',
  },
  rejected: {
    title: 'No hay solicitudes rechazadas',
    description: 'Las solicitudes rechazadas se conservan aquí con el motivo registrado.',
  },
  all: {
    title: 'Aún no han llegado solicitudes del portal',
    description: 'Cuando la ciudadanía radique en línea, sus solicitudes aparecerán aquí.',
  },
};

export function statusFilterLabel(value) {
  return STATUS_FILTERS.find((filter) => filter.value === value)?.label ?? '';
}

export function hasValue(value) {
  if (value === null || value === undefined || value === false) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export function plural(count, singular, pluralForm = `${singular}s`) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

/** "1 entrada nueva" / "3 entradas nuevas". */
export function pendingEntriesLabel(count) {
  return count === 1 ? '1 entrada nueva' : `${count} entradas nuevas`;
}

export function pendingEntryCount(item) {
  const count = Number(item?.pendingEntryCount);
  return Number.isFinite(count) && count > 0 ? Math.trunc(count) : 0;
}

/* ── Snapshot access ─────────────────────────────────────────────── */

const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const asArray = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);

export function getSnapshot(item) {
  return isPlainObject(item?.snapshot) ? item.snapshot : null;
}

export function getMetadata(item) {
  const metadata = getSnapshot(item)?.metadata;
  return isPlainObject(metadata) ? metadata : null;
}

export function getLabels(item) {
  const labels = getSnapshot(item)?.summary?.labels;
  return isPlainObject(labels) ? labels : {};
}

export function metadataSection(metadata, key) {
  return isPlainObject(metadata?.[key]) ? metadata[key] : {};
}

export function metadataList(metadata, key) {
  return asArray(metadata?.[key]);
}

/**
 * Human label of a catalogue code. Single-letter FUN codes collide across fields, so the portal
 * qualifies them with their metadata path (`request.typeCodes.D`); document types, capacities and
 * professional roles keep bare-code keys. Falls back to the raw code.
 */
export function labelFor(labels, code, path) {
  if (!hasValue(code)) return null;
  const key = String(code);
  const candidates = path ? [`${path}.${key}`, key] : [key];
  for (const candidate of candidates) {
    const label = labels?.[candidate];
    if (typeof label === 'string' && label.trim()) return label;
  }
  return key;
}

export function labelsFor(labels, codes, path) {
  return asArray(codes).map((code) => labelFor(labels, code, path)).filter(Boolean);
}

/** "Cédula de ciudadanía 1098765432" (or the bare code when there is no label). */
export function documentText(labels, documentType, documentNumber) {
  if (!hasValue(documentNumber)) return null;
  const type = labelFor(labels, documentType);
  return type ? `${type} ${documentNumber}` : String(documentNumber);
}

export function titleholderName(titleholder) {
  if (!titleholder) return null;
  if (titleholder.kind === 'legal') return titleholder.legalName || null;
  return [titleholder.firstName, titleholder.lastName].filter(hasValue).join(' ') || null;
}

export const PROFILE_KIND_LABELS = { natural: 'Persona natural', legal: 'Persona jurídica' };

/* ── Documents ───────────────────────────────────────────────────── */

/**
 * Documents aportados: files of the snapshot joined with the evaluated requirements (label and
 * required marker). Without snapshot (catalogue codes only) the evaluated requirements are listed.
 */
export function buildDocumentRows(item) {
  const evaluated = asArray(item?.evaluatedDocuments);
  const byCode = new Map(evaluated.map((doc) => [doc.documentCode, doc]));
  const labels = getLabels(item);
  const files = getSnapshot(item) ? asArray(getSnapshot(item).documents) : null;

  if (!files) {
    return {
      hasFiles: false,
      rows: evaluated.map((doc, index) => ({
        key: `${doc.documentCode || 'doc'}-${index}`,
        code: doc.documentCode || null,
        label: doc.label || labelFor(labels, doc.documentCode) || 'Documento sin código',
        required: Boolean(doc.required),
      })),
      missing: [],
    };
  }

  const covered = new Set(files.map((file) => file.documentCode).filter(Boolean));
  return {
    hasFiles: true,
    rows: files.map((file, index) => {
      const requirement = file.documentCode ? byCode.get(file.documentCode) : null;
      return {
        key: file.id || `${file.documentCode || 'file'}-${index}`,
        code: file.documentCode || null,
        label: file.documentLabel || requirement?.label || labelFor(labels, file.documentCode) || 'Documento sin clasificar',
        fileName: file.originalName || null,
        size: formatBytes(file.byteSize),
        mimeType: file.mimeType || null,
        sha256: file.sha256 || null,
        receivedAt: file.receivedAt || null,
        required: Boolean(requirement?.required),
      };
    }),
    // Required requirements that arrived without any file (informative only).
    missing: evaluated
      .filter((doc) => doc.required && doc.documentCode && !covered.has(doc.documentCode))
      .map((doc) => ({ key: doc.documentCode, code: doc.documentCode, label: doc.label || labelFor(labels, doc.documentCode) })),
  };
}

/* ── Document entries ────────────────────────────────────────────── */

export const ENTRY_KIND_LABELS = {
  initial: 'Radicación inicial',
  update: 'Actualización de documentos',
};

export const ENTRY_STATUS_META = {
  pending: { label: 'Pendiente', tone: 'warning' },
  received: { label: 'Recibida', tone: 'success' },
  rejected: { label: 'Rechazada', tone: 'danger' },
};

/** `documentEntries` of the detail, newest first. `null` when the backend predates entries. */
export function getDocumentEntries(item) {
  if (!Array.isArray(item?.documentEntries)) return null;
  return item.documentEntries
    .filter((entry) => entry && entry.id)
    .map((entry) => ({ ...entry, documents: asArray(entry.documents) }))
    .sort((a, b) => (parseDate(b.receivedAt)?.getTime() ?? 0) - (parseDate(a.receivedAt)?.getTime() ?? 0) || b.id - a.id);
}

/**
 * sha256 → file of an entry (`{ entryId, index, mimeType, originalName }`), so the snapshot
 * documents can open the file the portal transferred. Received entries win over pending ones.
 */
export function buildEntryFileIndex(item) {
  const index = new Map();
  const entries = getDocumentEntries(item) || [];
  const rank = { received: 0, pending: 1, rejected: 2 };
  [...entries]
    .sort((a, b) => (rank[a.status] ?? 3) - (rank[b.status] ?? 3))
    .forEach((entry) => {
      entry.documents.forEach((doc, position) => {
        if (!doc?.sha256 || index.has(doc.sha256)) return;
        index.set(doc.sha256, {
          entryId: entry.id,
          index: Number.isInteger(doc.index) ? doc.index : position,
          mimeType: doc.mimeType || null,
          originalName: doc.originalName || null,
          label: doc.label || null,
          byteSize: doc.byteSize ?? null,
        });
      });
    });
  return index;
}

export function documentsSummary(item) {
  const total = Number(item?.documentCount) || 0;
  const required = Number(item?.requiredDocumentCount) || 0;
  return { total: plural(total, 'doc'), required: plural(required, 'obligatorio') };
}

/* ── Formatters ──────────────────────────────────────────────────── */

const DATE_TIME = new Intl.DateTimeFormat('es-CO', { dateStyle: 'long', timeStyle: 'short' });
const DATE_LONG = new Intl.DateTimeFormat('es-CO', { dateStyle: 'long' });
const DATE_SHORT = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
const RELATIVE_SHORT = new Intl.RelativeTimeFormat('es', { numeric: 'auto', style: 'short' });
const RELATIVE_LONG = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
const NUMBER = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 });

export function parseDate(value) {
  if (!value) return null;
  // Calendar dates (YYYY-MM-DD) are local days, not UTC midnight.
  const calendar = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));
  const date = calendar ? new Date(Number(calendar[1]), Number(calendar[2]) - 1, Number(calendar[3])) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateTime(value) {
  const date = parseDate(value);
  return date ? DATE_TIME.format(date) : null;
}

export function formatDate(value) {
  const date = parseDate(value);
  return date ? DATE_LONG.format(date) : null;
}

export function formatShortDate(value) {
  const date = parseDate(value);
  return date ? DATE_SHORT.format(date) : null;
}

export function formatRelative(value, now = new Date()) {
  const date = parseDate(value);
  if (!date) return null;
  const seconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 60) return 'hace un momento';
  if (abs < 3600) return RELATIVE_SHORT.format(Math.round(seconds / 60), 'minute');
  if (abs < 86400) return RELATIVE_SHORT.format(Math.round(seconds / 3600), 'hour');
  if (abs < 86400 * 30) return RELATIVE_LONG.format(Math.round(seconds / 86400), 'day');
  if (abs < 86400 * 365) return RELATIVE_LONG.format(Math.round(seconds / (86400 * 30)), 'month');
  return RELATIVE_LONG.format(Math.round(seconds / (86400 * 365)), 'year');
}

/** Weekdays elapsed since `from` (holidays are not considered). */
export function businessDaysSince(from, now = new Date()) {
  const start = parseDate(from);
  if (!start || start > now) return 0;
  const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let count = 0;
  while (cursor < end && count < 999) {
    cursor.setDate(cursor.getDate() + 1);
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) count += 1;
  }
  return count;
}

export function waitingBusinessDays(item, now) {
  return item?.status === 'pending' ? businessDaysSince(item.receivedAt, now) : 0;
}

export function formatBytes(bytes) {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value < 0 || bytes === null || bytes === undefined) return null;
  if (value < 1024) return `${value} B`;
  const units = ['KB', 'MB', 'GB'];
  let size = value / 1024;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${new Intl.NumberFormat('es-CO', { maximumFractionDigits: size < 10 ? 1 : 0 }).format(size)} ${units[unit]}`;
}

export function formatNumber(value, suffix = '') {
  const number = Number(value);
  if (value === null || value === undefined || value === '' || !Number.isFinite(number)) return null;
  return `${NUMBER.format(number)}${suffix}`;
}

export function formatExperience(months) {
  const total = Number(months);
  if (months === null || months === undefined || !Number.isFinite(total) || total < 0) return null;
  const years = Math.floor(total / 12);
  const rest = total % 12;
  const parts = [];
  if (years) parts.push(plural(years, 'año'));
  if (rest || !years) parts.push(plural(rest, 'mes', 'meses'));
  return parts.join(' y ');
}

export function formatBoolean(value) {
  if (value === true) return 'Sí';
  if (value === false) return 'No';
  return null;
}

export function formatFactValue(value) {
  if (value === null || value === undefined || value === '') return MISSING;
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  if (Array.isArray(value)) return value.length ? value.map((entry) => formatFactValue(entry)).join(', ') : MISSING;
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function abbreviateChecksum(value) {
  if (!hasValue(value)) return null;
  const text = String(value);
  return text.length > 16 ? `${text.slice(0, 12)}…${text.slice(-4)}` : text;
}

export function todayIsoDate(now = new Date()) {
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}
