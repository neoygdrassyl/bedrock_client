/**
 * Pure presentation helpers for the catalogue-based ("canonical") documentary view.
 * They only read the `documentary-view/v1` canonical response; no business rule is decided here.
 */

export const CLASS_LABELS = { requirement: 'Requisito', annex: 'Anexo', vr_slip: 'Volante de radicación' };
export const CLASS_SHORT_LABELS = { requirement: 'Requisito', annex: 'Anexo', vr_slip: 'Volante' };
export const CONTRIBUTOR_LABELS = { applicant: 'Solicitante', curaduria: 'Curaduría' };
export const CHANNEL_LABELS = { counter: 'Ventanilla', email: 'Correo', whatsapp: 'WhatsApp', other: 'Otro' };
export const NO_LIST_TITLE = 'Sin lista';
export const EMPTY_VALUE = '—';

export const SCAN_FILTER = { ALL: '', PENDING: 'pending_scan', SCANNED: 'scanned' };

// Rows from backends older than v5 carry no documentClass and are always catalogue requirements.
export const documentClassOf = (row) => row?.documentClass || 'requirement';

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseDate(value) {
  if (value === null || value === undefined || value === '' || value === 'null') return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : { date: value, dateOnly: false };
  const text = String(value).trim();
  const dateOnly = DATE_ONLY.exec(text);
  // A bare date is a calendar day: parse it locally so it never shifts across time zones.
  if (dateOnly) return { date: new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3])), dateOnly: true };
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : { date, dateOnly: false };
}

/**
 * Colombian short date, e.g. "28 sep 2026, 00:48" (or "28 sep 2026" for calendar days
 * or when `withTime` is false). Empty or invalid values render as "—".
 */
export function formatDocumentaryDate(value, { withTime = true } = {}) {
  const parsed = parseDate(value);
  if (!parsed) return EMPTY_VALUE;
  const parts = Object.fromEntries(new Intl.DateTimeFormat('es-CO', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(parsed.date).map((part) => [part.type, part.value]));
  const month = String(parts.month || '').replace('.', '').slice(0, 3);
  const day = `${parts.day} ${month} ${parts.year}`;
  return withTime && !parsed.dateOnly ? `${day}, ${parts.hour}:${parts.minute}` : day;
}

/** Display text for nullable server values ("null", "", undefined → "—"). */
export function displayValue(value) {
  if (value === null || value === undefined) return EMPTY_VALUE;
  const text = String(value).trim();
  return !text || text.toLowerCase() === 'null' || text.toLowerCase() === 'undefined' ? EMPTY_VALUE : text;
}

export function rowCode(row) {
  return row.catalogueDisplay?.code || row.documentCode || null;
}

export function rowName(row) {
  const name = row.catalogueDisplay?.name || row.title || 'Documento sin nombre';
  return row.instanceLabel ? `${name} · ${row.instanceLabel}` : name;
}

export function rowListTitle(row) {
  return row.listTitle || row.receipt?.listTitle || NO_LIST_TITLE;
}

/** Received supports of the current version, in the shape of the shared status molecules. */
export function rowSupport(row) {
  const receipt = row.receipt || {};
  const physical = Boolean(receipt.hasPhysical);
  const digital = Boolean(receipt.files?.digital || receipt.hasDigital);
  const scan = Boolean(receipt.files?.scan || receipt.hasScan);
  return {
    mediumPresence: { physical, digital },
    scanned: { applies: physical, value: scan },
    pagesPhysical: physical && Number.isFinite(receipt.pagesPhysical) ? receipt.pagesPhysical : null,
  };
}

export function versionCountOf(row) {
  return row.versionCount ?? row.versionSequence ?? 1;
}

function normalize(text) {
  return String(text || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Client-side filters over the rows of the current page. */
/** `subject`: '' every row, '__request__' rows without a person, else the rows of that person (subjectId). */
export function filterCanonicalRows(rows, { search = '', list = '', documentClass = '', scan = SCAN_FILTER.ALL, subject = '' } = {}) {
  const needle = normalize(search.trim());
  return rows.filter((row) => {
    if (needle && !normalize(`${rowCode(row) || ''} ${rowName(row)}`).includes(needle)) return false;
    if (list && rowListTitle(row) !== list) return false;
    if (documentClass && documentClassOf(row) !== documentClass) return false;
    if (subject && (subject === '__request__' ? Boolean(row.subjectId) : row.subjectId !== subject)) return false;
    const { scanned } = rowSupport(row);
    if (scan === SCAN_FILTER.PENDING && !(scanned.applies && !scanned.value)) return false;
    if (scan === SCAN_FILTER.SCANNED && !scanned.value) return false;
    return true;
  });
}

/** Groups rows by their ventanilla list, keeping the server order. */
export function groupRowsByList(rows) {
  const groups = new Map();
  rows.forEach((row) => {
    const title = rowListTitle(row);
    if (!groups.has(title)) groups.set(title, []);
    groups.get(title).push(row);
  });
  return [...groups].map(([title, items]) => ({ title, rows: items }));
}

export function listOptions(rows) {
  return [...new Set(rows.map(rowListTitle))].map((title) => ({ value: title, label: title }));
}

export function scanCounts(rows) {
  return rows.reduce((counts, row) => {
    const { scanned } = rowSupport(row);
    if (scanned.value) counts.scanned += 1;
    else if (scanned.applies) counts.pending += 1;
    return counts;
  }, { scanned: 0, pending: 0 });
}

/**
 * Header metrics. Documents and deliveries come from the server totals; physical, digital
 * and scanned are counted on the loaded page (flagged `partial` when there are more pages).
 * `missing` is null when the requirement evaluation is not current.
 */
export function canonicalMetrics(view, { firstPage = true } = {}) {
  const rows = view?.rows || [];
  const totals = rows.reduce((acc, row) => {
    const support = rowSupport(row);
    if (support.mediumPresence.physical) acc.physical += 1;
    if (support.mediumPresence.digital) acc.digital += 1;
    if (support.scanned.value) acc.scanned += 1;
    return acc;
  }, { physical: 0, digital: 0, scanned: 0 });
  const satisfaction = view?.satisfaction;
  const missing = satisfaction && satisfaction.allRequirementsSatisfied !== null && satisfaction.allRequirementsSatisfied !== undefined
    && Array.isArray(satisfaction.missingDocumentIds) ? satisfaction.missingDocumentIds.length : null;
  return {
    documents: view?.counts?.canonicalDocuments ?? (firstPage && !view?.pagination?.nextAfterId ? rows.length : null),
    deliveries: view?.counts?.receivedVersions ?? null,
    ...totals,
    missing,
    partial: !firstPage || Boolean(view?.pagination?.nextAfterId),
  };
}

const REQUIREMENT_MESSAGES = {
  REQUIREMENTS_CACHE_MISSING: 'Los requisitos aún no se han evaluado.',
  REQUIREMENTS_CACHE_STALE: 'La evaluación de requisitos está desactualizada.',
  REQUIREMENTS_INCOMPLETE: 'La evaluación de requisitos está incompleta.',
};

/** One plain-language requirement status for the whole expediente. */
export function requirementStatus(view) {
  const warning = (view?.warnings || []).find((item) => item.code?.startsWith('REQUIREMENTS_'));
  const satisfied = view?.satisfaction?.allRequirementsSatisfied;
  if (warning || satisfied === null || satisfied === undefined) {
    return { tone: 'pending', message: REQUIREMENT_MESSAGES[warning?.code] || 'Los requisitos aún no se han evaluado.', detail: 'Mientras tanto, recibir documentos no confirma que el expediente esté completo.' };
  }
  if (satisfied === false) {
    const missing = view.satisfaction.missingDocumentIds?.length || 0;
    return { tone: 'missing', message: missing === 1 ? 'Falta 1 requisito por recibir.' : missing ? `Faltan ${missing} requisitos por recibir.` : 'Hay requisitos pendientes por recibir.' };
  }
  return { tone: 'complete', message: 'Todos los requisitos tienen al menos una entrega.', detail: 'La revisión de legal y debida forma se registra por documento.' };
}

// ---------- per-delivery evaluation ----------

/** Evaluation statuses of a delivery row (view / versions / legal form). `not_applicable` renders as a dash. */
export const EVALUATION_META = {
  approved: { label: 'Aprobado', tone: 'success' },
  rejected: { label: 'Rechazado', tone: 'danger' },
  pending: { label: 'Sin evaluar', tone: 'warning' },
  not_applicable: { label: EMPTY_VALUE, tone: 'neutral' },
};

/** Evaluation of a row; rows from older backends have none and are shown as not evaluable. */
export const evaluationOf = (row) => row?.evaluation || { status: 'not_applicable', source: null };

/** Name of the reviewer of an evaluation ("usuario {id}" when only the id is known), or null. */
export function evaluationReviewer(evaluation) {
  if (!evaluation || !['approved', 'rejected'].includes(evaluation.status)) return null;
  if (evaluation.reviewedByName) return evaluation.reviewedByName;
  return evaluation.reviewedBy != null && evaluation.reviewedBy !== '' ? `usuario ${evaluation.reviewedBy}` : null;
}

/** Whether the row can be evaluated by the current user (server flag: `actions.evaluate` or `actions.review`). */
export const canEvaluateRow = (row) => Boolean(row?.actions?.evaluate || row?.actions?.review);
