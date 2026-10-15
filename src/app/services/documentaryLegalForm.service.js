import http from '../../http-common';
import { documentaryProjectId } from './documentary.service';
import { getCanonicalDocuments } from './documentaryOperations.service';

/**
 * Legal y debida forma (LDF) of canonical expedientes
 * (contract: scripts/plans/catalogo-documental/2026-10-16-legal-debida-forma-v1.md).
 * GET /legal-form is validated leniently: required shape only, unknown fields pass through.
 */
export const LEGAL_FORM_SCHEMA = 'dovela-backoffice/documentary-legal-form/v1';
export const LEGAL_FORM_STATES = ['not_ready', 'ready', 'declared', 'stale', 'not_applicable'];
export const LEGAL_FORM_VERDICTS = ['complies', 'does_not_comply', 'pending', 'not_applicable'];
const REVIEW_VERDICTS = ['complies', 'does_not_comply', 'not_applicable'];

const ROOT = '/fun/documentary/v1';
const legalFormUrl = (fun0Id) => `${ROOT}/projects/${documentaryProjectId(fun0Id)}/legal-form`;
// The shared client defaults to multipart; documentary commands are strict JSON contracts.
const JSON_HEADERS = { 'Content-Type': 'application/json' };

const object = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const string = (value) => typeof value === 'string';
const nullableString = (value) => value == null || string(value);
const count = (value) => Number.isSafeInteger(value) && value >= 0;

function invalid() {
  throw new Error('La respuesta de legal y debida forma no corresponde al expediente.');
}

function validControls(value) {
  return object(value) && ['total', 'complies', 'doesNotComply', 'unreviewed'].every((key) => value[key] === undefined || count(value[key]));
}

function validInstance(value) {
  return object(value) && string(value.documentKey) && nullableString(value.instanceLabel)
    && LEGAL_FORM_VERDICTS.includes(value.verdict) && ['controls', 'review'].includes(value.source)
    && (value.reviewRevision === undefined || count(value.reviewRevision)) && (value.controls === undefined || validControls(value.controls));
}

function validRequirement(value) {
  return object(value) && nullableString(value.documentCode) && nullableString(value.title)
    && typeof value.delivered === 'boolean' && LEGAL_FORM_VERDICTS.includes(value.verdict)
    && Array.isArray(value.blockers) && Array.isArray(value.instances) && value.instances.every(validInstance)
    && (value.controls == null || validControls(value.controls));
}

const validBlocker = (value) => object(value) && string(value.code) && nullableString(value.documentCode) && nullableString(value.documentKey);

export function validateLegalForm(data, fun0Id) {
  if (!object(data) || data.schemaVersion !== LEGAL_FORM_SCHEMA || !['canonical', 'traditional'].includes(data.mode)
    || !object(data.project) || data.project.fun0Id !== Number(fun0Id) || !LEGAL_FORM_STATES.includes(data.state)
    || data.applicable !== (data.mode === 'canonical') || (!data.applicable && data.state !== 'not_applicable')
    || !Array.isArray(data.requirements) || !data.requirements.every(validRequirement)
    || !Array.isArray(data.blockers) || !data.blockers.every(validBlocker)
    || !(data.declaration === null || (object(data.declaration) && string(data.declaration.at)))
    || !(data.sheet == null || (object(data.sheet) && object(data.sheet.sheet) && count(data.sheet.sheetRevision)))
    || !object(data.actions)) invalid();
  return data;
}

export async function getLegalForm(fun0Id, signal) {
  const { data } = await http.get(legalFormUrl(fun0Id), { signal });
  return validateLegalForm(data, fun0Id);
}

/** Reviewer verdict of a document without Central controls (one instance per call). */
export async function saveLegalFormReview(fun0Id, documentCode, command) {
  if (!string(documentCode) || !documentCode.trim()) invalid();
  if (!REVIEW_VERDICTS.includes(command?.verdict)) throw new Error('Seleccione un veredicto válido.');
  const { data } = await http.put(`${legalFormUrl(fun0Id)}/reviews/${encodeURIComponent(documentCode)}`, command, { headers: JSON_HEADERS });
  return data;
}

/** Archive inventory sheet (hoja de control de inventario). */
export async function saveLegalFormSheet(fun0Id, command) {
  if (!object(command?.sheet)) invalid();
  const { data } = await http.put(`${legalFormUrl(fun0Id)}/sheet`, command, { headers: JSON_HEADERS });
  return data;
}

export async function declareLegalForm(fun0Id, command) {
  const { data } = await http.post(`${legalFormUrl(fun0Id)}/declaration`, command, { headers: JSON_HEADERS });
  return data;
}

export async function revokeLegalForm(fun0Id, command) {
  const { data } = await http.delete(`${legalFormUrl(fun0Id)}/declaration`, { data: command, headers: JSON_HEADERS });
  return data;
}

const MAX_VIEW_PAGES = 40;
/**
 * View row (with its Central controls) of a current delivery, paging the canonical view until it
 * is found. Returns { view, row } or null when the delivery is no longer current.
 */
export async function findCanonicalRow(origin, rowId, signal) {
  let afterId = 0;
  for (let page = 0; page < MAX_VIEW_PAGES; page += 1) {
    const view = await getCanonicalDocuments(origin, afterId, signal);
    const row = view.rows.find((item) => item.receivedDocumentRowId === Number(rowId));
    if (row) return { view, row };
    if (!view.pagination.nextAfterId) return null;
    afterId = view.pagination.nextAfterId;
  }
  return null;
}

// Rule errors the user can act on; anything else falls back to the generic documentary message.
const LEGAL_FORM_ERRORS = {
  CONTROLS_CONFIGURED: 'Este documento tiene controles de Central: decida sus controles en lugar de registrar un veredicto.',
  OBSERVATION_REQUIRED: 'Escriba la observación: es obligatoria cuando el documento no cumple.',
  DOCUMENT_NOT_DELIVERED: 'El documento no tiene una entrega vigente para revisar.',
  INSTANCE_REQUIRED: 'El documento tiene varias instancias: revise cada una por separado.',
  REVIEW_REVISION_CONFLICT: 'La revisión cambió mientras la editaba. Se recargaron los datos; confirme nuevamente.',
  SHEET_REVISION_CONFLICT: 'La hoja cambió mientras la editaba. Recargue y confirme nuevamente.',
  LEGAL_FORM_DECLARED: 'El expediente ya fue declarado en legal y debida forma. Anule la declaración para cambiar revisiones.',
  LEGAL_FORM_NOT_READY: 'El expediente aún no está listo para declararse. Revise los pendientes.',
  LEGAL_FORM_ALREADY_DECLARED: 'El expediente ya fue declarado en legal y debida forma.',
  LEGAL_FORM_NOT_DECLARED: 'El expediente no tiene una declaración vigente.',
  LEGAL_FORM_STATE_PROGRESSED: 'El expediente avanzó de estado después de la declaración; ya no puede anularse.',
  LEGAL_FORM_CLOCK_CHANGED: 'El término de legal y debida forma cambió después de la declaración; ya no puede anularse.',
};
export const isRevisionConflict = (code) => code === 'REVIEW_REVISION_CONFLICT' || code === 'SHEET_REVISION_CONFLICT';

export function legalFormErrorCode(error) {
  const code = error?.response?.data?.error?.code;
  return typeof code === 'string' ? code : null;
}

/** Spanish message of a legal-form command failure, or null when the caller should use its generic message. */
export function legalFormErrorMessage(error) {
  return LEGAL_FORM_ERRORS[legalFormErrorCode(error)] || null;
}
