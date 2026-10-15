import http from '../../http-common';
import { documentaryProjectId } from './documentary.service';
import { isRowEvaluation } from '../pages/user/expediente_documental/documentaryViewContract';

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
  return object(value) && ['total', 'complies', 'doesNotComply', 'unreviewed', 'noDecision'].every((key) => value[key] === undefined || count(value[key]));
}

// One delivery (VR version) of an instance, newest first, with its own evaluation.
function validVersion(value) {
  return object(value) && Number.isInteger(value.rowId) && nullableString(value.vrLabel) && isRowEvaluation(value.evaluation);
}

function validChecklistItem(value) {
  return object(value) && string(value.code) && nullableString(value.name);
}

function validInstance(value) {
  return object(value) && string(value.documentKey) && nullableString(value.instanceLabel)
    && LEGAL_FORM_VERDICTS.includes(value.verdict) && ['controls', 'review'].includes(value.source)
    && (value.reviewRevision === undefined || count(value.reviewRevision)) && (value.controls === undefined || validControls(value.controls))
    && (value.versions === undefined || (Array.isArray(value.versions) && value.versions.every(validVersion)));
}

function validRequirement(value) {
  return object(value) && nullableString(value.documentCode) && nullableString(value.title)
    && typeof value.delivered === 'boolean' && LEGAL_FORM_VERDICTS.includes(value.verdict)
    && Array.isArray(value.blockers) && Array.isArray(value.instances) && value.instances.every(validInstance)
    && (value.controls == null || validControls(value.controls));
}

const validBlocker = (value) => object(value) && string(value.code) && nullableString(value.documentCode) && nullableString(value.documentKey);

const validWarning = (value) => object(value) && string(value.code) && (value.sourceKeys === undefined || (Array.isArray(value.sourceKeys) && value.sourceKeys.every(string)));

// Traditional expedientes only expose a read-only summary of the legacy declaration (`legacy`).
function validLegacySummary(value) {
  return value === undefined || value === null || (object(value) && nullableString(value.state == null ? null : String(value.state))
    && (value.declared === undefined || typeof value.declared === 'boolean') && nullableString(value.declaredAt)
    && nullableString(value.clockName) && nullableString(value.clockDesc));
}

export function validateLegalForm(data, fun0Id) {
  if (object(data) && data.mode === 'traditional') {
    if (data.schemaVersion !== LEGAL_FORM_SCHEMA || !object(data.project) || data.project.fun0Id !== Number(fun0Id)
      || data.applicable !== false || data.state !== 'not_applicable' || !validLegacySummary(data.legacy)) invalid();
    return data;
  }
  if (!object(data) || data.schemaVersion !== LEGAL_FORM_SCHEMA || !['canonical', 'traditional'].includes(data.mode)
    || !object(data.project) || data.project.fun0Id !== Number(fun0Id) || !LEGAL_FORM_STATES.includes(data.state)
    || data.applicable !== (data.mode === 'canonical') || (!data.applicable && data.state !== 'not_applicable')
    || !Array.isArray(data.requirements) || !data.requirements.every(validRequirement)
    || !Array.isArray(data.blockers) || !data.blockers.every(validBlocker)
    || !(data.declaration === null || (object(data.declaration) && string(data.declaration.at)))
    || !(data.sheet == null || (object(data.sheet) && object(data.sheet.sheet) && count(data.sheet.sheetRevision)))
    || !(data.warnings === undefined || (Array.isArray(data.warnings) && data.warnings.every(validWarning)))
    || !(data.checklist == null || (object(data.checklist) && object(data.checklist.marks)))
    || !(data.checklistDefaults == null || object(data.checklistDefaults))
    || !(data.checklistItems === undefined || (Array.isArray(data.checklistItems) && data.checklistItems.every(validChecklistItem)))
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

/** Legal-form checklist marks ('0' NO, '1' SI, '2' N/A by document code) behind the "lista de chequeo" PDF. */
export async function saveLegalFormChecklist(fun0Id, command) {
  if (!object(command?.marks)) invalid();
  const { data } = await http.put(`${legalFormUrl(fun0Id)}/checklist`, command, { headers: JSON_HEADERS });
  return data;
}

export async function declareLegalForm(fun0Id, command) {
  const { data } = await http.post(`${legalFormUrl(fun0Id)}/declaration`, command, { headers: JSON_HEADERS });
  return data;
}

/** Re-declares with the current deliveries; state and legal clock stay as they are. Body: idempotencyKey, reason. */
export async function updateLegalFormDeclaration(fun0Id, command) {
  const { data } = await http.put(`${legalFormUrl(fun0Id)}/declaration`, command, { headers: JSON_HEADERS });
  return data;
}

export async function revokeLegalForm(fun0Id, command) {
  const { data } = await http.delete(`${legalFormUrl(fun0Id)}/declaration`, { data: command, headers: JSON_HEADERS });
  return data;
}

/**
 * Typology option selections of the expediente (backoffice selection over the portal choices).
 * Older backends do not expose the route: callers treat a 404 as "selection unavailable".
 */
export async function listTypologySelections(fun0Id, signal) {
  const { data } = await http.get(`${ROOT}/projects/${documentaryProjectId(fun0Id)}/typology-selections`, { signal });
  if (!object(data) || !Array.isArray(data.typologies)) invalid();
  return data;
}

/** Stores the options chosen for one typology; the backend re-evaluates the requirements in the same command. */
export async function saveTypologySelection(fun0Id, typologyCode, command) {
  if (!string(typologyCode) || !typologyCode.trim() || !Array.isArray(command?.optionIds) || !command.optionIds.length) invalid();
  const { data } = await http.put(`${ROOT}/projects/${documentaryProjectId(fun0Id)}/typology-selections/${encodeURIComponent(typologyCode)}`, command, { headers: JSON_HEADERS });
  return data;
}

// The server keeps the selection revision of a cleared choice but GET /legal-form only exposes it while a VR is chosen:
// remember the last revision answered by a command so choosing again after clearing sends the right one.
const knownSelectionRevisions = new Map();

/** Revision to send as expectedSelectionRevision: the instance's own, else the last one a command answered, else 0. */
export function selectionRevisionOf(instance) {
  const own = instance?.selectionRevision ?? instance?.selection?.selectionRevision;
  if (Number.isSafeInteger(own)) return own;
  return knownSelectionRevisions.get(instance?.documentKey) ?? 0;
}

const selectionUrl = (fun0Id, documentKey) => `${legalFormUrl(fun0Id)}/selections/${encodeURIComponent(documentKey)}`;

/** Chooses the VR delivery that legal y debida forma uses for a document instance (body: rowId, expectedSelectionRevision, idempotencyKey, reason). */
export async function selectLegalFormVr(fun0Id, documentKey, command) {
  if (!string(documentKey) || !documentKey.trim() || !Number.isInteger(command?.rowId)) invalid();
  const { data } = await http.put(selectionUrl(fun0Id, documentKey), command, { headers: JSON_HEADERS });
  if (Number.isSafeInteger(data?.selection?.selectionRevision)) knownSelectionRevisions.set(documentKey, data.selection.selectionRevision);
  return data;
}

/** Clears the chosen VR of a document instance (body: expectedSelectionRevision, idempotencyKey, reason). */
export async function clearLegalFormVr(fun0Id, documentKey, command) {
  if (!string(documentKey) || !documentKey.trim()) invalid();
  const { data } = await http.delete(selectionUrl(fun0Id, documentKey), { data: command, headers: JSON_HEADERS });
  if (Number.isSafeInteger(data?.selectionRevision)) knownSelectionRevisions.set(documentKey, data.selectionRevision);
  return data;
}

// Rule errors the user can act on; anything else falls back to the generic documentary message.
const LEGAL_FORM_ERRORS = {
  CONTROLS_CONFIGURED: 'Este documento tiene controles de Central: decida sus controles en lugar de registrar un veredicto.',
  DOCUMENT_HAS_CONTROLS: 'Este documento tiene controles de Central: decida sus controles en lugar de registrar un veredicto.',
  REVIEW_SCOPE_MISMATCH: 'La entrega que intenta evaluar no corresponde a este documento. Actualice la vista e intente nuevamente.',
  OBSERVATION_REQUIRED: 'Escriba la observación: es obligatoria cuando el documento no cumple.',
  DOCUMENT_NOT_DELIVERED: 'El documento no tiene una entrega vigente para revisar.',
  INSTANCE_REQUIRED: 'El documento tiene varias instancias: revise cada una por separado.',
  REVIEW_REVISION_CONFLICT: 'La revisión cambió mientras la editaba. Se recargaron los datos; confirme nuevamente.',
  CHECKLIST_REVISION_CONFLICT: 'La lista de chequeo cambió mientras la editaba. Se recargaron los datos; confirme nuevamente.',
  SHEET_REVISION_CONFLICT: 'La hoja cambió mientras la editaba. Recargue y confirme nuevamente.',
  LEGAL_FORM_DECLARED: 'El expediente ya fue declarado en legal y debida forma. Anule la declaración para cambiar revisiones.',
  LEGAL_FORM_NOT_READY: 'El expediente aún no está listo para declararse. Revise los pendientes.',
  LEGAL_FORM_ALREADY_DECLARED: 'El expediente ya fue declarado en legal y debida forma.',
  LEGAL_FORM_NOT_DECLARED: 'El expediente no tiene una declaración vigente.',
  LEGAL_FORM_STATE_PROGRESSED: 'El expediente avanzó de estado después de la declaración; ya no puede anularse.',
  LEGAL_FORM_CLOCK_CHANGED: 'El término de legal y debida forma cambió después de la declaración; ya no puede anularse.',
  REVISION_CONFLICT: 'La selección de la tipología cambió mientras la editaba. Se recargaron los datos; confirme nuevamente.',
  TYPOLOGY_NOT_FOUND: 'La tipología ya no hace parte de la evaluación de requisitos. Actualice la evaluación e intente nuevamente.',
  UNKNOWN_TYPOLOGY_OPTION: 'Una de las opciones elegidas no pertenece a la tipología.',
  SELECTION_NOT_APPROVED: 'Solo se puede elegir una entrega aprobada. Apruebe esta entrega para poder elegirla.',
  SELECTION_REVISION_CONFLICT: 'La elección del VR cambió mientras la editaba. Se recargaron los datos; confirme nuevamente.',
  SELECTION_SCOPE_MISMATCH: 'La entrega no corresponde a este documento. Actualice la vista e intente nuevamente.',
  DOCUMENT_NOT_FOUND: 'La entrega ya no existe en este expediente. Actualice la vista e intente nuevamente.',
  INVALID_TYPOLOGY_SELECTION_COUNT: 'Esta tipología admite una sola opción.',
};
export const isRevisionConflict = (code) => code === 'REVIEW_REVISION_CONFLICT' || code === 'SHEET_REVISION_CONFLICT' || code === 'CHECKLIST_REVISION_CONFLICT' || code === 'REVISION_CONFLICT';

export function legalFormErrorCode(error) {
  const code = error?.response?.data?.error?.code;
  return typeof code === 'string' ? code : null;
}

/** Spanish message of a legal-form command failure, or null when the caller should use its generic message. */
export function legalFormErrorMessage(error) {
  return LEGAL_FORM_ERRORS[legalFormErrorCode(error)] || null;
}
