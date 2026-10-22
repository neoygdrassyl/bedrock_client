/**
 * Pure helpers of the technical evaluation layer (Central layer "technical") and of the applicant
 * self-assessment the portal imports with each request. No React, no HTTP.
 */

/** Technical control tags published by Central, in the order the filter chips show them. */
export const TECHNICAL_TAGS = [
  { value: 'juridico', label: 'Jurídico' },
  { value: 'arquitectonico', label: 'Arquitectónico' },
  { value: 'estructural', label: 'Estructural' },
];

const asArray = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);
const tagsOf = (control) => asArray(control?.tags).map((tag) => String(tag).toLowerCase());

/** Technical controls of a view or version row (older backends omit the key). */
export const technicalControlsOf = (row) => asArray(row?.technicalControls);

/**
 * Controls whose tags intersect `tagFilter` (array of tag values). An empty filter keeps every control;
 * a control without tags only passes when there is no filter.
 */
export function filterTechnicalControls(controls, tagFilter = []) {
  const wanted = asArray(tagFilter).map((tag) => String(tag).toLowerCase());
  if (!wanted.length) return asArray(controls);
  return asArray(controls).filter((control) => tagsOf(control).some((tag) => wanted.includes(tag)));
}

/** Whether the row has at least one technical control matching the filter. */
export const hasTechnicalControls = (row, tagFilter = []) => filterTechnicalControls(technicalControlsOf(row), tagFilter).length > 0;

/** View rows with at least one technical control (matching the filter when one is active). */
export const filterRowsByTechnicalTags = (rows, tagFilter = []) => asArray(rows).filter((row) => hasTechnicalControls(row, tagFilter));

/** Decision that still applies: a stale review (`current === false`) counts as undecided. */
const currentEffectOf = (control) => (control?.review && control.review.current !== false ? control.review.effect || null : null);

/**
 * Counts of the technical decisions of a list of controls: `complies`, `doesNotComply` and `noDecision`
 * only count current reviews; `pending` are the controls without a current decision.
 */
export function technicalSummary(controls) {
  const list = asArray(controls);
  const summary = { total: list.length, complies: 0, doesNotComply: 0, noDecision: 0, pending: 0 };
  for (const control of list) {
    const effect = currentEffectOf(control);
    if (effect === 'complies') summary.complies += 1;
    else if (effect === 'does_not_comply') summary.doesNotComply += 1;
    else if (effect === 'no_decision') summary.noDecision += 1;
    else summary.pending += 1;
  }
  return summary;
}

/** "cumple/total" of a summary, or null when there are no controls. */
export const technicalSummaryLabel = (summary) => (summary && summary.total > 0 ? `${summary.complies}/${summary.total}` : null);

/** Tone of the technical summary tag: green when every control complies, red when one does not, amber otherwise. */
export function technicalSummaryTone(summary) {
  if (!summary || !summary.total) return 'neutral';
  if (summary.doesNotComply > 0) return 'danger';
  if (summary.complies === summary.total) return 'success';
  return 'warning';
}

/** Toggles a tag in the filter; `null` clears it (the "Todos" chip). */
export function toggleTechnicalTag(current, tag) {
  const list = asArray(current);
  if (tag === null || tag === undefined) return [];
  return list.includes(tag) ? list.filter((value) => value !== tag) : [...list, tag];
}

/* ── Applicant self-assessment ───────────────────────────────────── */

/** Items of the applicant self-assessment of a row (`row.applicantAssessment`), or an empty list. */
export const applicantItemsOf = (row) => asArray(row?.applicantAssessment?.items);

/**
 * Splits the applicant items of a row between the controls the curaduría decides (`byControl`, keyed by
 * controlId) and the answers whose control is not in `controls` or is flagged unknown (`other`).
 */
export function splitApplicantItems(row, controls = row?.controls) {
  const known = new Set(asArray(controls).map((control) => control.controlId));
  const byControl = new Map();
  const other = [];
  for (const item of applicantItemsOf(row)) {
    if (item.controlKnown !== false && item.controlId && known.has(item.controlId) && !byControl.has(item.controlId)) byControl.set(item.controlId, item);
    else other.push(item);
  }
  return { byControl, other };
}

/** "2 ✓ / 1 ✗" of an applicant summary, or null when there is no self-assessment. */
export function applicantSummaryLabel(summary) {
  if (!summary || typeof summary !== 'object') return null;
  const complies = Number(summary.complies) || 0;
  const doesNotComply = Number(summary.doesNotComply) || 0;
  return `${complies} ✓ / ${doesNotComply} ✗`;
}

/** Tooltip of the applicant summary column. */
export function applicantSummaryTitle(summary) {
  if (!summary || typeof summary !== 'object') return 'El solicitante no envió autoevaluación para este documento';
  const parts = [`${Number(summary.complies) || 0} cumple`, `${Number(summary.doesNotComply) || 0} no cumple`];
  if (Number(summary.noDecision) > 0) parts.push(`${Number(summary.noDecision)} sin decisión`);
  return `Autoevaluación del solicitante: ${parts.join(', ')} de ${Number(summary.total) || 0}`;
}
