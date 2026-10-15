// Pure helpers of the legal y debida forma (LDF) view and of the generators that write it.
import { formatDocumentaryDate } from './canonicalDocumentaryModel';

export const LEGAL_FORM_STATE_META = {
  ready: { label: 'Lista para declarar', tone: 'success', text: 'Todos los requisitos están entregados y revisados.' },
  not_ready: { label: 'No lista', tone: 'warning', text: 'Hay pendientes antes de declarar.' },
  declared: { label: 'Declarada', tone: 'info', text: 'El expediente fue declarado en legal y debida forma.' },
  stale: { label: 'Desactualizada', tone: 'danger', text: 'La declaración ya no coincide con los documentos vigentes.' },
  not_applicable: { label: 'No aplica', tone: 'neutral', text: 'El expediente usa la documentación tradicional.' },
};

export const VERDICT_META = {
  complies: { label: 'Cumple', tone: 'success' },
  does_not_comply: { label: 'No cumple', tone: 'danger' },
  not_applicable: { label: 'No aplica', tone: 'slate' },
  pending: { label: 'Pendiente', tone: 'warning' },
};

export const BLOCKER_LABELS = {
  REQUIREMENTS_NOT_EVALUATED: 'Requisitos sin evaluar',
  REQUIREMENTS_STALE: 'Evaluación desactualizada',
  REQUIREMENTS_INCOMPLETE: 'Evaluación incompleta',
  REQUIREMENTS_UNSUPPORTED: 'Evaluación no soportada',
  NOT_DELIVERED: 'Sin entregar',
  VERDICT_PENDING: 'Revisión pendiente',
  DOES_NOT_COMPLY: 'No cumple',
  GROUP_NOT_SATISFIED: 'Grupo sin cumplir',
};

/** Blockers grouped by code, in the order of BLOCKER_LABELS (unknown codes last). */
export function groupBlockers(blockers = []) {
  const order = Object.keys(BLOCKER_LABELS);
  const groups = new Map();
  blockers.forEach((blocker) => {
    if (!groups.has(blocker.code)) groups.set(blocker.code, []);
    groups.get(blocker.code).push(blocker);
  });
  const rank = (code) => (order.includes(code) ? order.indexOf(code) : order.length);
  return Array.from(groups, ([code, items]) => ({ code, label: BLOCKER_LABELS[code] || code, items }))
    .sort((left, right) => rank(left.code) - rank(right.code));
}

/** Where a requirement (or instance) is reviewed: Central controls or a reviewer verdict. */
export function reviewSourceOf(item) {
  if (item.source) return item.source;
  return item.controls?.total > 0 ? 'controls' : 'review';
}

export const controlsSummary = (controls) => (controls && controls.total > 0 ? `${controls.complies}/${controls.total}` : null);

// Sends documentKey only when it disambiguates (multi-instance documents).
export function instanceKeyFor(requirement, instance) {
  return requirement.allowsMultipleInstances || requirement.instances.length > 1 ? instance.documentKey : undefined;
}

// ---------- hoja de control documental (fun_d_control) ----------

// fun_rs.checked vocabulary of the sheet select: 1 = SI, 0 = NO, 2 = N/A.
export const VERDICT_BY_CHECK = { 1: 'complies', 0: 'does_not_comply', 2: 'not_applicable' };
export const CHECK_BY_VERDICT = { complies: '1', does_not_comply: '0', not_applicable: '2' };

export const SHEET_SKIP_REASONS = {
  controls: 'tiene controles de Central (revíselos en «Legal y debida forma»)',
  observation: 'requiere observación por no cumplir (regístrela en «Legal y debida forma»)',
};

/**
 * Review commands of the hoja de control documental: one per delivered instance reviewed by a
 * person whose verdict or folio range changed. Codes that are not delivered requirements are
 * ignored (the sheet lists the whole series), documents with Central controls and "NO" without an
 * observation are reported as skipped. `entries`: [{ code, check: '0'|'1'|'2', pages }].
 */
export function controlSheetReviewPlan(legalForm, entries, reason) {
  const byCode = new Map((legalForm?.requirements || []).filter((item) => item.documentCode).map((item) => [String(item.documentCode).trim(), item]));
  const commands = []; const skipped = [];
  entries.forEach(({ code, check, pages }) => {
    const requirement = byCode.get(String(code).trim());
    const verdict = VERDICT_BY_CHECK[check];
    if (!requirement || !requirement.delivered || !verdict) return;
    const folioRange = String(pages ?? '').trim() || null;
    requirement.instances.forEach((instance) => {
      if (instance.source === 'controls') { skipped.push({ code: requirement.documentCode, reason: 'controls' }); return; }
      const review = instance.review || null;
      if (review && !review.stale && review.verdict === verdict && (review.folioRange || null) === folioRange) return;
      const observation = review?.observation || null;
      if (verdict === 'does_not_comply' && !observation) { skipped.push({ code: requirement.documentCode, reason: 'observation' }); return; }
      const documentKey = instanceKeyFor(requirement, instance);
      commands.push({ documentCode: requirement.documentCode, body: { ...(documentKey ? { documentKey } : {}), verdict, folioRange, observation,
        expectedReviewRevision: instance.reviewRevision || 0, idempotencyKey: crypto.randomUUID(), reason } });
    });
  });
  return { commands, skipped };
}

/** Sheet value of a code for the sheet select, from the reviewer verdict of its single delivery. */
export function controlSheetDefaults(legalForm, code) {
  const requirement = (legalForm?.requirements || []).find((item) => String(item.documentCode).trim() === String(code).trim());
  if (!requirement || requirement.instances.length !== 1) return null;
  const review = requirement.instances[0].review;
  if (!review || review.stale) return null;
  return { check: CHECK_BY_VERDICT[review.verdict] ?? null, folioRange: review.folioRange || null };
}

// ---------- hoja de control de inventario (fun_d_control_2) ----------

const text = (value) => (value == null ? '' : String(value));

/** Archive sheet JSON: the same shape the legacy fun_rs.check_control_inventory stored. */
export function inventorySheetOf({ date_create, user_archive, user_retrieve, date_retrieve, items = [] }) {
  return { date_create: text(date_create), user_archive: text(user_archive), user_retrieve: text(user_retrieve), date_retrieve: text(date_retrieve),
    items: items.map((item) => ({ name: text(item.name), date: text(item.date), n: text(item.n), label: text(item.label) })) };
}

export function inventorySheetCommand(legalForm, values, reason) {
  return { sheet: inventorySheetOf(values), expectedSheetRevision: legalForm?.sheet?.sheetRevision || 0, idempotencyKey: crypto.randomUUID(), reason };
}

// ---------- incomplete evaluation (warning) ----------

/** Human labels of the Central source keys (facts of the FUN) an evaluation can miss. Unknown keys show as-is. */
export const SOURCE_FACT_LABELS = {
  tipoAny: 'Tipo de solicitud',
  tramiteAny: 'Trámite',
  mUrbAny: 'Modalidad urbanización',
  mSubAny: 'Modalidad subdivisión',
  mLicAny: 'Modalidad licencia',
  usosAny: 'Usos',
  areaAny: 'Área',
  viviendaAny: 'Vivienda',
  culturalAny: 'Bien de interés cultural',
  personaAny: 'Tipo de persona del solicitante',
  calidadAny: 'Calidad del solicitante',
  profesionalAny: 'Profesionales',
};
// Legacy aliases of the same facts (backend documentary-fact-aliases.js).
Object.entries({ tipo: 'tipoAny', tramite: 'tramiteAny', m_urb: 'mUrbAny', m_sub: 'mSubAny', m_lic: 'mLicAny', usos: 'usosAny', area: 'areaAny', vivienda: 'viviendaAny', cultural: 'culturalAny' })
  .forEach(([alias, key]) => { SOURCE_FACT_LABELS[alias] = SOURCE_FACT_LABELS[key]; });

export const factLabel = (sourceKey) => SOURCE_FACT_LABELS[sourceKey] || String(sourceKey);

/**
 * Labels of the facts the evaluation could not read: `evaluation.missingFacts` plus the sourceKeys of
 * the REQUIREMENTS_INCOMPLETE warning, deduplicated. Empty for payloads without these fields.
 */
export function missingFactLabels(data) {
  const warned = (data?.warnings || []).filter((warning) => warning?.code === 'REQUIREMENTS_INCOMPLETE').flatMap((warning) => warning.sourceKeys || []);
  const keys = [...(data?.evaluation?.missingFacts || []), ...warned].filter((key) => key != null && key !== '');
  return Array.from(new Set(keys.map(String))).map(factLabel);
}

// ---------- reviewer attribution ----------

/**
 * "Revisado por {name} · {date}" of a previous decision, or null when there is none. Falls back to
 * "usuario {id}" when only the id is known; the date is omitted when unknown.
 */
export function reviewedByLine({ name, id, at } = {}) {
  const who = name || (id != null && id !== '' ? `usuario ${id}` : null);
  if (!who && !at) return null;
  const when = at ? formatDocumentaryDate(at) : null;
  return [`Revisado por ${who || 'un usuario'}`, when && when !== '—' ? when : null].filter(Boolean).join(' · ');
}

// ---------- lista de chequeo (checklist) ----------

export const CHECKLIST_MARKS = [{ value: '1', label: 'SI' }, { value: '0', label: 'NO' }, { value: '2', label: 'N/A' }];
const validMark = (value) => (value === '0' || value === '1' || value === '2' ? value : null);

/** Server defaults (derived from the reviews) of each code; N/A when unknown. */
export function checklistDefaultMarks(data, codes) {
  return Object.fromEntries(codes.map((code) => [code, validMark(data?.checklistDefaults?.[code]) ?? '2']));
}

/** Initial marks of the checklist dialog: saved mark, else server default, else N/A. */
export function checklistInitialMarks(data, codes) {
  const defaults = checklistDefaultMarks(data, codes);
  return Object.fromEntries(codes.map((code) => [code, validMark(data?.checklist?.marks?.[code]) ?? defaults[code]]));
}

/** Legacy `fun_rs` shape the checklist PDF reads: { code: 'a,b', checked: '1,0' }. */
export const checklistReviewOf = (codes, marks) => ({ code: codes.join(','), checked: codes.map((code) => marks[code] ?? '2').join(',') });

/** Valid stored marks as a plain { code: mark } object (invalid or empty values dropped). */
const storedChecklistMarks = (data) => Object.fromEntries(Object.entries(data?.checklist?.marks || {}).map(([code, value]) => [code, validMark(value)]).filter(([, value]) => value));

/**
 * Checklist marks are overrides of the server defaults: only the codes whose mark differs from the
 * default (N/A when the server gives none) are stored. All marks equal to the defaults gives `{}`.
 */
export function checklistOverrides(data, codes, marks) {
  const defaults = checklistDefaultMarks(data, codes);
  return Object.fromEntries(codes.map((code) => [code, validMark(marks?.[code]) ?? defaults[code]]).filter(([code, value]) => value !== defaults[code]));
}

/** Whether `overrides` is exactly what is already stored (both empty counts as equal). */
export function checklistOverridesStored(data, overrides) {
  const stored = storedChecklistMarks(data);
  const keys = Object.keys(overrides);
  return keys.length === Object.keys(stored).length && keys.every((code) => stored[code] === overrides[code]);
}
