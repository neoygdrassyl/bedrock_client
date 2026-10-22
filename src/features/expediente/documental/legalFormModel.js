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
  TYPOLOGY_SELECTION_REQUIRED: 'Falta elegir opción de tipología',
  SELECTION_INVALID: 'Elección de VR inválida',
};

// ---------- sections (typology / option groups) ----------

export const SECTION_STATE_META = {
  satisfied: { label: 'Cumple', tone: 'success' },
  missing: { label: 'Pendiente', tone: 'warning' },
  selection_required: { label: 'Debe elegirse una opción', tone: 'warning' },
  not_applicable: { label: 'No aplica', tone: 'neutral' },
};

export const SELECTION_SOURCE_LABELS = { portal: 'Ventanilla', backoffice: 'Backoffice' };

export const REQUIREMENT_MODE_LABELS = { all: 'Todos requeridos', at_least_one: 'Al menos uno', complementary: 'Complementarios (opcionales)' };

export const MUTED_ALTERNATIVE_TEXT = 'No requerido: la alternativa ya se cumple';

/** Status line of an option group (null without a group). */
export function groupStatusLabel(group) {
  if (!group) return null;
  const total = group.documentCodes?.length || 0;
  const favourable = group.favourableCount || 0;
  if (group.mode === 'at_least_one') return group.satisfied ? `Cumple · ${favourable} de ${total} alternativas` : 'Falta al menos una alternativa';
  if (group.mode === 'all') return `Todos requeridos · ${favourable} de ${total}`;
  if (group.mode === 'complementary') return 'Complementarios (opcionales)';
  return null;
}

/** Label of a group for blocker lines: its option label (typology name first), else the raw group code. */
export function groupDisplayName(groupCode, groups = []) {
  const group = groups.find((item) => item.code === groupCode);
  if (group?.optionLabel) return [group.typologyName, group.optionLabel].filter(Boolean).join(' · ');
  return groupCode ? `Grupo ${groupCode}` : null;
}

/**
 * Requirements of the LDF grouped for display: one section per typology (with its options, each with its group) and
 * the general requirements last. Without `data.sections` (older backend) a single untitled section holds every
 * requirement in the server order, so the view renders as a flat list.
 * Section: { key, typologyCode, title, state, selectionMode, selectedOptionIds, selectionSource, optionLabels, options:
 * [{ key, optionId, label, group, statusLabel, items: [{ requirement, muted }] }] }.
 */
export function buildSections(data) {
  const requirements = data?.requirements || [];
  const groups = data?.groups || [];
  if (!Array.isArray(data?.sections) || !data.sections.length) {
    return requirements.length ? [{ key: 'all', typologyCode: null, title: null, state: null, selectionMode: null, selectedOptionIds: [], selectionSource: null, optionLabels: [],
      options: [{ key: 'all', optionId: null, label: null, group: null, statusLabel: null, items: requirements.map((requirement) => ({ requirement, muted: false })) }] }] : [];
  }
  const byCode = new Map(requirements.map((requirement) => [requirement.documentCode, requirement]));
  return data.sections.map((section) => {
    const typologyCode = section.typologyCode ?? null;
    const options = new Map();
    const optionOf = (optionId, label) => {
      const key = optionId ?? 'general';
      if (!options.has(key)) {
        const group = typologyCode ? groups.find((item) => item.typologyCode === typologyCode && item.optionId === optionId) || null : null;
        options.set(key, { key, optionId: optionId ?? null, label: label || group?.optionLabel || null, group, statusLabel: groupStatusLabel(group), items: [] });
      }
      return options.get(key);
    };
    (section.requirementCodes || []).forEach((code) => {
      const requirement = byCode.get(code);
      if (!requirement) return;
      const option = optionOf(requirement.section?.optionId ?? null, requirement.section?.optionLabel);
      const muted = Boolean(option.group && option.group.mode === 'at_least_one' && option.group.satisfied && !requirement.delivered);
      option.items.push({ requirement, muted });
    });
    (section.groups || []).forEach((code) => { const group = groups.find((item) => item.code === code); if (group) optionOf(group.optionId, group.optionLabel); });
    const labels = new Map(groups.filter((group) => group.typologyCode === typologyCode && group.optionId).map((group) => [group.optionId, group.optionLabel]));
    return { key: typologyCode || 'general', typologyCode, title: typologyCode ? section.typologyName || typologyCode : 'Requisitos generales', state: section.state || null,
      selectionMode: section.selectionMode || null, selectedOptionIds: section.selectedOptionIds || [], selectionSource: section.selectionSource || null,
      optionLabels: (section.selectedOptionIds || []).map((id) => labels.get(id) || id), options: Array.from(options.values()) };
  });
}

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

// ---------- pending panel ----------

// Blockers about the evaluation as a whole (shown as an alert on top of the pending panel).
const EVALUATION_BLOCKERS = ['REQUIREMENTS_NOT_EVALUATED', 'REQUIREMENTS_STALE', 'REQUIREMENTS_INCOMPLETE', 'REQUIREMENTS_UNSUPPORTED'];

// Fixed order of the pending groups: what the user must resolve first comes first.
export const PENDING_GROUPS = [
  { key: 'not_delivered', title: 'Sin entregar', hint: 'Reciba estos documentos en Radicación.', codes: ['NOT_DELIVERED', 'GROUP_NOT_SATISFIED'] },
  { key: 'rejected', title: 'Rechazados', hint: 'Pida una nueva entrega o revise la evaluación.', codes: ['DOES_NOT_COMPLY'] },
  { key: 'pending_review', title: 'Sin evaluar', hint: 'Evalúe la entrega para continuar.', codes: ['VERDICT_PENDING'] },
  { key: 'selection_invalid', title: 'Elección de VR inválida', hint: 'Elija otra entrega aprobada o vuelva a la última.', codes: ['SELECTION_INVALID'] },
  { key: 'typology', title: 'Opción de tipología', hint: 'Elija la opción para conocer los documentos exigidos.', codes: ['TYPOLOGY_SELECTION_REQUIRED'] },
];
const KNOWN_PENDING_CODES = new Set([...EVALUATION_BLOCKERS, ...PENDING_GROUPS.flatMap((group) => group.codes)]);

const SELECTION_INVALID_NOTE = 'La entrega elegida ya no está aprobada';

// Extra explanation of a blocker, from its `reason` (read leniently from the blocker or its details).
const BLOCKER_REASON_NOTES = {
  VERDICT_PENDING: { no_decision: 'Controles decididos sin aprobación' },
  TYPOLOGY_SELECTION_REQUIRED: {
    unknown_option: 'La opción elegida en el portal no existe en esta versión de Central',
    invalid_count: 'Se eligieron más opciones de las permitidas',
  },
};
const blockerNote = (blocker) => BLOCKER_REASON_NOTES[blocker.code]?.[blocker.reason ?? blocker.details?.reason] || null;

/** Instances of the legal form by documentKey ({ requirement, instance }). */
export function instancesByKey(data) {
  const map = new Map();
  (data?.requirements || []).forEach((requirement) => (requirement.instances || []).forEach((instance) => map.set(instance.documentKey, { requirement, instance })));
  return map;
}

function pendingItem(blocker, data, lookup) {
  const found = blocker.documentKey ? lookup.get(blocker.documentKey) : null;
  const requirement = found?.requirement || (data?.requirements || []).find((item) => item.documentCode === blocker.documentCode) || null;
  const instance = found?.instance || null;
  const invalid = blocker.code === 'SELECTION_INVALID';
  let title = requirement?.title || null;
  let code = requirement?.documentCode || blocker.documentCode || null;
  if (!requirement && blocker.groupCode) title = blocker.code === 'GROUP_NOT_SATISFIED' ? `${groupDisplayName(blocker.groupCode, data?.groups)}: falta al menos una alternativa` : groupDisplayName(blocker.groupCode, data?.groups);
  if (blocker.typologyCode) title = (data?.sections || []).find((section) => section.typologyCode === blocker.typologyCode)?.typologyName || blocker.typologyCode;
  const vrLabel = (invalid ? instance?.selection?.vrLabel : instance?.vrLabel) || null;
  const label = [code, [title, instance?.instanceLabel].filter(Boolean).join(' · ') || null, vrLabel].filter(Boolean).join(' · ');
  return { key: `${blocker.code}:${blocker.documentKey || code || blocker.groupCode || blocker.typologyCode || ''}`, code: blocker.code, documentCode: code, documentKey: blocker.documentKey || null,
    typologyCode: blocker.typologyCode || null, title, vrLabel, label: label || blocker.message || blocker.code, note: invalid ? SELECTION_INVALID_NOTE : blockerNote(blocker),
    openable: Boolean(blocker.documentKey && instance) };
}

/**
 * Blockers of the legal form arranged for the pending panel: `alerts` (evaluation-level blockers, shown first) and
 * `groups` in the fixed order of PENDING_GROUPS (empty groups left out; blockers with an unknown code go last in
 * "Otros pendientes"). Item: { key, code, documentCode, documentKey, typologyCode, title, vrLabel, label, note, openable }.
 */
export function pendingGroups(data) {
  const blockers = data?.blockers || [];
  const lookup = instancesByKey(data);
  const alerts = blockers.filter((blocker) => EVALUATION_BLOCKERS.includes(blocker.code)).map((blocker) => ({ code: blocker.code, label: BLOCKER_LABELS[blocker.code], message: blocker.message || null }));
  const groups = PENDING_GROUPS.map((group) => ({ key: group.key, title: group.title, hint: group.hint,
    items: blockers.filter((blocker) => group.codes.includes(blocker.code)).sort((a, b) => group.codes.indexOf(a.code) - group.codes.indexOf(b.code)).map((blocker) => pendingItem(blocker, data, lookup)) }));
  const others = blockers.filter((blocker) => !KNOWN_PENDING_CODES.has(blocker.code));
  if (others.length) groups.push({ key: 'other', title: 'Otros pendientes', hint: null, items: others.map((blocker) => pendingItem(blocker, data, lookup)) });
  return { alerts, groups: groups.filter((group) => group.items.length) };
}

// ---------- readiness of a requirement row (LDF table order) ----------

export const READINESS = { REJECTED: 0, PENDING: 1, READY: 2 };

/**
 * Where a requirement row stands: rejected, pending evaluation, or ready (approved or not applicable). The row is judged
 * by the effective delivery of its instance (explicit choice, else the latest) through `instance.selectedEvaluation`;
 * without it the row's own evaluation counts.
 */
export function rowReadiness(row, instance) {
  const status = instance?.selectedEvaluation?.status || row?.evaluation?.status;
  if (status === 'rejected' || instance?.verdict === 'does_not_comply') return READINESS.REJECTED;
  if (status === 'pending') return READINESS.PENDING;
  return READINESS.READY;
}

/** Rows sorted by readiness (stable inside each level). */
export function sortByReadiness(rows, lookup) {
  return rows.map((row, index) => ({ row, index, rank: rowReadiness(row, lookup?.get(row.documentKey)?.instance) }))
    .sort((a, b) => a.rank - b.rank || a.index - b.index).map((item) => item.row);
}

export const READINESS_FILTER = { ALL: '', UNRESOLVED: 'unresolved', READY: 'ready' };

/** Rows kept by the "Todos / Por resolver / Listos" chip, plus the counts of the three chips. */
export function filterByReadiness(rows, filter, lookup) {
  const ready = (row) => rowReadiness(row, lookup?.get(row.documentKey)?.instance) === READINESS.READY;
  const kept = filter === READINESS_FILTER.READY ? rows.filter(ready) : filter === READINESS_FILTER.UNRESOLVED ? rows.filter((row) => !ready(row)) : rows;
  const readyCount = rows.filter(ready).length;
  return { rows: kept, counts: { all: rows.length, unresolved: rows.length - readyCount, ready: readyCount } };
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

// ---------- VR selection ----------

/**
 * Delivery a legal-form instance uses: `{ rowId, vrLabel, versionSequence, source: 'selected' | 'latest' }`, or null.
 * Older payloads without `effective` fall back to the explicit selection.
 */
export function effectiveOf(instance) {
  if (instance?.effective) return instance.effective;
  const selection = instance?.selection;
  return selection ? { rowId: selection.rowId, vrLabel: selection.vrLabel, versionSequence: selection.versionSequence, source: 'selected' } : null;
}

/** "VR-1 · v2" of an effective delivery. */
export const effectiveDeliveryLabel = (effective) => `${effective?.vrLabel || 'Sin VR'}${effective?.versionSequence != null ? ` · v${effective.versionSequence}` : ''}`;

/** "Se usa: VR-x (último)" / "Se usa: VR-x (elegido por …)" of an instance, or null when it has no delivery in use. */
export function effectiveVrLine(instance) {
  const effective = effectiveOf(instance);
  if (!effective) return null;
  const vr = effective.vrLabel || 'Sin VR';
  if (effective.source !== 'selected') return `Se usa: ${vr} (último)`;
  const selection = instance.selection;
  const who = selection?.selectedByName || (selection?.selectedBy != null ? `usuario ${selection.selectedBy}` : 'un usuario');
  return `Se usa: ${vr} (elegido por ${who})`;
}

/** "Elegido por {name} · {date}" of a chosen VR, or null without a selection. */
export function selectedByLine(selection) {
  if (!selection) return null;
  const who = selection.selectedByName || (selection.selectedBy != null ? `usuario ${selection.selectedBy}` : 'un usuario');
  const when = selection.selectedAt ? formatDocumentaryDate(selection.selectedAt) : null;
  return [`Elegido por ${who}`, when && when !== '—' ? when : null].filter(Boolean).join(' · ');
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

/**
 * Name and hint of each checklist code: `checklistItems` (legacy checklist catalogue names), falling back to the
 * requirement titles of older payloads and finally to the code. The hint explains rows that do not apply to the
 * expediente or whose document has not been delivered yet.
 */
export function checklistItemMeta(data) {
  const titles = new Map((data?.requirements || []).filter((item) => item.documentCode).map((item) => [String(item.documentCode).trim(), item.title]));
  const meta = new Map();
  (data?.checklistItems || []).forEach((item) => {
    const code = String(item.code).trim();
    const hint = item.applies === false ? 'No aplica a este expediente' : item.delivered === false ? 'Sin entregar' : null;
    meta.set(code, { name: item.name || titles.get(code) || null, hint });
  });
  titles.forEach((title, code) => { if (!meta.has(code)) meta.set(code, { name: title, hint: null }); });
  return meta;
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
