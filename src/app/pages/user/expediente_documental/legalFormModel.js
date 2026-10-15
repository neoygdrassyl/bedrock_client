// Pure helpers of the legal y debida forma (LDF) view and of the generators that write it.

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
