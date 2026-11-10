// Pure helpers of the simplified legal y debida forma (LDF) view: the parties of the request (applicants and
// professionals, with what the FUN still lacks) and ONE document checklist grouped by "Solicitud" and by person.
// Contract: backend app/modules/documentary/services/documentary-view-contract.js (GET legal-form `parties`,
// `subjects`, per-person requirements with requirementKey/subjectId/subjectKind/subjectLabel).
import { BLOCKER_LABELS, blockerNote, pendingGroups } from './legalFormModel';

// ---------- parties ----------

export const PARTY_KIND_LABELS = { applicant: 'Solicitante', professional: 'Profesional' };

const FIELD_LABELS = { type: 'Tipo de persona', role: 'Rol', 'responsible.role': 'Calidad del responsable', id_number: 'Identificación' };

/** Plain Spanish text of one party issue (what the FUN lacks for the evaluation). */
export function partyIssueLabel(issue) {
  switch (issue?.code) {
    case 'MISSING_PERSON_TYPE': return 'Falta tipo de persona';
    case 'MISSING_ROLE': return 'Falta rol';
    case 'UNMAPPED_VALUE': return `${FIELD_LABELS[issue.field] || 'Valor'} no reconocido${issue.value ? `: «${issue.value}»` : ''}`;
    case 'UNMATCHED_RESPONSIBLE': return 'No coincide con un titular ni es apoderado';
    default: return issue?.code ? `Dato pendiente (${issue.code})` : 'Dato pendiente';
  }
}

/** FUN form where a party is completed: 5.1 titulares, 5.2 profesionales, 5.3 responsable / apoderado. */
export const PARTY_FORMS = {
  fun_51s: { anchor: 'fun_n_51', label: '5.1', title: 'Titulares' },
  fun_52s: { anchor: 'fun_n_52', label: '5.2', title: 'Profesionales' },
  fun_53s: { anchor: 'fun_n_53', label: '5.3', title: 'Responsable de la solicitud' },
};
export const partyFormOf = (party) => PARTY_FORMS[party?.source?.table] || null;

/** "Solicitante — Persona jurídica · Apoderado" of a party (kind label, then its Central values). */
export function partyDescription(party) {
  if (!party) return '';
  const kind = party.kindLabel || PARTY_KIND_LABELS[party.kind] || '';
  const values = (party.valueLabels || []).filter(Boolean);
  return values.length ? `${kind} — ${values.join(' · ')}` : kind;
}

/**
 * Parties of the request for the "Partes de la solicitud" block, or null when the backend does not publish them.
 * `gated` is true while any party has issues: the per-person documents cannot be trusted until they are completed.
 * Item: { key, id, kind, label, description, idNumber, issues: [{ code, label }], complete, form, party }.
 */
export function partiesOf(data) {
  const parties = data?.parties;
  if (!parties || typeof parties !== 'object') return null;
  const item = (party, fallbackKind) => {
    const issues = (party.issues || []).map((issue) => ({ code: issue.code, label: partyIssueLabel(issue) }));
    return { key: party.id || `${party.source?.table}:${party.source?.rowId}`, id: party.id || null, kind: party.kind || fallbackKind, label: party.label || 'Sin nombre',
      description: party.kind ? partyDescription(party) : party.role ? `Responsable — ${party.role}` : 'Responsable de la solicitud', idNumber: party.idNumber || null,
      issues, complete: issues.length === 0, form: partyFormOf(party), party };
  };
  const applicants = (parties.applicants || []).map((party) => item(party, 'applicant'));
  const professionals = (parties.professionals || []).map((party) => item(party, 'professional'));
  const unassigned = (parties.unassigned || []).map((party) => item(party, null));
  const counted = [...applicants, ...professionals, ...unassigned].reduce((total, party) => total + party.issues.length, 0);
  const issueCount = Number.isSafeInteger(parties.issueCount) ? Math.max(parties.issueCount, counted) : counted;
  return { available: parties.available !== false, perPerson: Boolean(parties.perPerson), applicants, professionals, unassigned,
    total: applicants.length + professionals.length + unassigned.length, pendingCount: [...applicants, ...professionals, ...unassigned].filter((party) => !party.complete).length,
    issueCount, gated: issueCount > 0 };
}

/** Party of a subject id (applicants and professionals), or null. */
export function partyById(data, subjectId) {
  if (!subjectId) return null;
  return [...(data?.parties?.applicants || []), ...(data?.parties?.professionals || [])].find((party) => party.id === subjectId) || null;
}

// ---------- checklist rows ----------

/** State of a checklist row: label, tone and whether it needs nothing more (`done`). */
export const ROW_STATUS = {
  complies: { label: 'Cumple', tone: 'success', done: true },
  not_applicable: { label: 'No aplica', tone: 'slate', done: true },
  pending_review: { label: 'Sin evaluar', tone: 'warning', done: false },
  rejected: { label: 'No cumple', tone: 'danger', done: false },
  selection_invalid: { label: 'Elección de VR inválida', tone: 'danger', done: false },
  missing: { label: 'Sin entregar', tone: 'warning', done: false },
  missing_alternative: { label: 'Falta al menos uno', tone: 'warning', done: false },
  optional: { label: 'Sin entregar', tone: 'neutral', done: true },
  covered: { label: 'No requerido: la alternativa ya se cumple', tone: 'neutral', done: true },
  selection_required: { label: 'Falta elegir opción', tone: 'warning', done: false },
};

/** Marker of what the requirement asks for. */
export const ROW_MARKERS = {
  required: { label: 'Obligatorio', tone: 'info' },
  at_least_one: { label: 'Al menos uno', tone: 'info' },
  optional: { label: 'Opcional', tone: 'neutral' },
  additional: { label: 'Adicional', tone: 'neutral' },
};

/** Requirement key of a legal-form requirement: the backend key, else "<subjectId>|<documentId>", else documentId/code. */
export function requirementKeyOf(requirement) {
  if (requirement?.requirementKey) return requirement.requirementKey;
  const id = requirement?.documentId || requirement?.documentCode || '';
  return requirement?.subjectId ? `${requirement.subjectId}|${id}` : id;
}

/** Status key (ROW_STATUS) of one requirement, from its own blockers first and then its delivery and verdict. */
export function requirementStatus(requirement) {
  const codes = new Set((requirement?.blockers || []).map((blocker) => blocker.code));
  if (codes.has('DOES_NOT_COMPLY')) return 'rejected';
  if (codes.has('SELECTION_INVALID')) return 'selection_invalid';
  if (codes.has('VERDICT_PENDING')) return 'pending_review';
  if (codes.has('NOT_DELIVERED')) return 'missing';
  if (requirement?.delivered) {
    if (requirement.verdict === 'complies') return 'complies';
    if (requirement.verdict === 'not_applicable') return 'not_applicable';
    if (requirement.verdict === 'does_not_comply') return 'rejected';
    return 'pending_review';
  }
  return requirement?.required ? 'missing' : 'optional';
}

const STATUS_RANK = ['rejected', 'selection_invalid', 'pending_review', 'missing', 'missing_alternative', 'selection_required'];

/** Input documents only: issued ones (Central direction 'output') belong to "Expedidos". */
export const isInputRequirement = (requirement) => requirement?.direction !== 'output';

function documentRow(requirement) {
  const status = requirementStatus(requirement);
  const marker = requirement.additional ? 'additional' : requirement.required ? 'required' : 'optional';
  const note = (requirement.blockers || []).map(blockerNote).find(Boolean) || null;
  return { key: `doc:${requirementKeyOf(requirement)}`, type: 'document', code: requirement.documentCode || '', title: requirement.title || 'Documento sin nombre',
    marker, status, note, delivered: Boolean(requirement.delivered), requirement, members: [requirement], group: null, subjectId: requirement.subjectId || null, typologyCode: requirement.section?.typologyCode || null };
}

function alternativesRow(group, members, subjectId) {
  const statuses = members.map(requirementStatus);
  const delivered = members.some((member) => member.delivered);
  let status = 'missing_alternative';
  if (group.satisfied === true) status = 'complies';
  else {
    const worst = STATUS_RANK.find((key) => statuses.includes(key) && key !== 'missing');
    if (worst) status = worst;
  }
  const memberCodes = new Set(members.map((member) => String(member.documentCode)));
  const missingCodes = (group.documentCodes || []).map(String).filter((code) => !memberCodes.has(code));
  const names = [...members.map((member) => [member.documentCode, member.title].filter(Boolean).join(' ')), ...missingCodes];
  return { key: `alt:${group.code}`, type: 'alternatives', code: [...members.map((member) => member.documentCode), ...missingCodes].filter(Boolean).join(' / '),
    title: `Uno de: ${names.join(' · ') || 'alternativas sin documentos listados'}`, marker: 'at_least_one', status, note: null, delivered, requirement: null, members, group,
    subjectId: subjectId || null, typologyCode: group.typologyCode || null };
}

function selectionRow(blocker, data) {
  const subject = (data?.subjects || []).find((item) => item.subjectId === blocker.subjectId);
  const typology = subject ? (subject.typologies || []).find((item) => item.typologyCode === blocker.typologyCode) : (data?.sections || []).find((item) => item.typologyCode === blocker.typologyCode);
  const name = typology?.typologyName || blocker.typologyCode;
  return { key: `sel:${blocker.typologyCode}@${blocker.subjectId || ''}`, type: 'selection', code: '', title: `Elegir la opción de «${name}»`, typologyName: name,
    marker: 'required', status: 'selection_required', note: blockerNote(blocker), delivered: false, requirement: null, members: [], group: null, subjectId: blocker.subjectId || null,
    typologyCode: blocker.typologyCode, reason: blocker.reason ?? blocker.details?.reason ?? null };
}

const sortRows = (rows) => rows.map((row, index) => ({ row, index }))
  .sort((a, b) => (a.row.type === 'selection' ? 0 : 1) - (b.row.type === 'selection' ? 0 : 1) || a.index - b.index).map((item) => item.row);

/** Progress of a list of rows: required rows (documents + alternative groups) and how many are delivered / resolved. */
export function rowsProgress(rows) {
  const required = rows.filter((row) => row.type !== 'selection' && (row.marker === 'required' || row.marker === 'at_least_one'));
  return { requiredCount: required.length, deliveredCount: required.filter((row) => row.delivered).length,
    pendingCount: rows.filter((row) => !ROW_STATUS[row.status]?.done).length };
}

const EVALUATION_LEVEL = new Set(['REQUIREMENTS_NOT_EVALUATED', 'REQUIREMENTS_STALE', 'REQUIREMENTS_INCOMPLETE', 'REQUIREMENTS_UNSUPPORTED']);
const ROW_LEVEL = new Set(['NOT_DELIVERED', 'VERDICT_PENDING', 'DOES_NOT_COMPLY', 'SELECTION_INVALID', 'GROUP_NOT_SATISFIED', 'TYPOLOGY_SELECTION_REQUIRED']);

/**
 * The single LDF checklist: `groups` = "Solicitud" (request-level requirements) first, then one group per person in the
 * evaluation order (`data.subjects`, then any other person a requirement names). Every input requirement is a row, an
 * applicable at_least_one group is ONE row ("Uno de: …") and a missing typology option is a row of its group, so
 * nothing the backend blocks on is left out. `alerts` are evaluation-level blockers; `others` blockers with an unknown code.
 * Group: { key, kind: 'request'|'applicant'|'professional', subjectId, title, subtitle, party, subject, rows, requiredCount, deliveredCount, pendingCount }.
 */
export function buildLdfChecklist(data) {
  const requirements = (data?.requirements || []).filter(isInputRequirement);
  const groupsByCode = new Map((data?.groups || []).map((group) => [group.code, group]));
  const alternativeOf = (requirement) => {
    const group = requirement.groupCode ? groupsByCode.get(requirement.groupCode) : null;
    return group && group.mode === 'at_least_one' && group.status !== 'not_applicable' ? group : null;
  };
  const rowsBySubject = new Map();
  const push = (subjectId, row) => { const key = subjectId || ''; if (!rowsBySubject.has(key)) rowsBySubject.set(key, []); rowsBySubject.get(key).push(row); };
  const alternatives = new Map();
  requirements.forEach((requirement) => {
    const group = alternativeOf(requirement);
    if (!group) { push(requirement.subjectId, documentRow(requirement)); return; }
    if (!alternatives.has(group.code)) {
      const row = { placeholder: true, group, members: [], subjectId: group.subjectId || requirement.subjectId || null };
      alternatives.set(group.code, row);
      push(row.subjectId, row);
    }
    alternatives.get(group.code).members.push(requirement);
  });
  // An unsatisfied alternative group none of whose documents is listed still gets its row.
  (data?.blockers || []).filter((blocker) => blocker.code === 'GROUP_NOT_SATISFIED' && blocker.groupCode && !alternatives.has(blocker.groupCode)).forEach((blocker) => {
    const group = groupsByCode.get(blocker.groupCode) || { code: blocker.groupCode, mode: 'at_least_one', satisfied: false, documentCodes: [] };
    const row = { placeholder: true, group, members: [], subjectId: blocker.subjectId || group.subjectId || null };
    alternatives.set(group.code, row);
    push(row.subjectId, row);
  });
  (data?.blockers || []).filter((blocker) => blocker.code === 'TYPOLOGY_SELECTION_REQUIRED' && blocker.typologyCode).forEach((blocker) => push(blocker.subjectId, selectionRow(blocker, data)));

  const finish = (rows) => sortRows(rows.map((row) => (row.placeholder ? alternativesRow(row.group, row.members, row.subjectId) : row)));
  const subjects = data?.subjects || [];
  const order = ['', ...subjects.map((subject) => subject.subjectId), ...Array.from(rowsBySubject.keys()).filter((key) => key && !subjects.some((subject) => subject.subjectId === key))];
  const groups = Array.from(new Set(order)).map((key) => {
    const rows = finish(rowsBySubject.get(key) || []);
    if (!key) return rows.length ? { key: 'request', kind: 'request', subjectId: null, title: 'Solicitud', subtitle: 'Documentos de la solicitud', party: null, subject: null, rows, ...rowsProgress(rows) } : null;
    const subject = subjects.find((item) => item.subjectId === key) || null;
    const party = partyById(data, key);
    const sample = rows.find((row) => row.requirement)?.requirement || rows.find((row) => row.members.length)?.members[0] || null;
    const kind = party?.kind || subject?.kind || sample?.subjectKind || 'applicant';
    const title = party?.label || subject?.label || sample?.subjectLabel || key;
    const subtitle = party ? partyDescription(party) : PARTY_KIND_LABELS[kind] || '';
    return { key, kind, subjectId: key, title, subtitle, party, subject, rows, ...rowsProgress(rows) };
  }).filter(Boolean);

  const { alerts } = pendingGroups(data);
  const others = (data?.blockers || []).filter((blocker) => !EVALUATION_LEVEL.has(blocker.code) && !ROW_LEVEL.has(blocker.code))
    .map((blocker) => ({ key: `${blocker.code}:${blocker.documentCode || blocker.groupCode || blocker.typologyCode || ''}:${blocker.subjectId || ''}`, label: BLOCKER_LABELS[blocker.code] || blocker.code, message: blocker.message || null }));
  return { groups, alerts, others };
}

/** "Ana Pérez · Profesional — Director de obra" heading of a checklist group. */
export const groupHeading = (group) => (group.kind === 'request' ? group.title : [group.title, group.subtitle].filter(Boolean).join(' · '));

// ---------- requirement detail (why it is required) ----------

export const SELECTION_SOURCE_TEXT = { portal: 'elegida en Ventanilla', backoffice: 'elegida en Backoffice', party: 'según los datos de la persona', implicit: 'única opción' };

/**
 * Why a requirement (or alternative group / selection row) is required: { general, typologyCode, typologyName, optionLabel,
 * selectionSource, groupMode, subjectId, pendingSelections: [{ typologyCode, typologyName, subjectId }] }.
 * `pendingSelections` are the missing typology options of the same person (or of the request).
 */
export function requirementReason(data, row) {
  const requirement = row?.requirement || row?.members?.[0] || null;
  const group = row?.group || (requirement?.groupCode ? (data?.groups || []).find((item) => item.code === requirement.groupCode) : null) || null;
  const section = requirement?.section || null;
  const subjectId = row?.subjectId ?? requirement?.subjectId ?? null;
  const typologyCode = row?.typologyCode || section?.typologyCode || group?.typologyCode || null;
  const subject = subjectId ? (data?.subjects || []).find((item) => item.subjectId === subjectId) : null;
  const typology = typologyCode ? (subject ? (subject.typologies || []) : (data?.sections || [])).find((item) => item.typologyCode === typologyCode) : null;
  const pendingSelections = (data?.blockers || []).filter((blocker) => blocker.code === 'TYPOLOGY_SELECTION_REQUIRED' && (blocker.subjectId || null) === (subjectId || null))
    .map((blocker) => selectionRow(blocker, data)).map((item) => ({ typologyCode: item.typologyCode, typologyName: item.typologyName, subjectId: item.subjectId, reason: item.reason }));
  return {
    general: !typologyCode,
    typologyCode,
    typologyName: row?.typologyName || section?.typologyName || group?.typologyName || typology?.typologyName || typologyCode,
    optionLabel: section?.optionLabel || group?.optionLabel || null,
    selectionSource: typology?.selectionSource || null,
    groupMode: group?.mode || null,
    subjectId,
    pendingSelections,
  };
}

/** Requirement of a delivered instance (by documentKey) with its row of the checklist, or null. */
export function requirementOfDocumentKey(data, documentKey) {
  if (!documentKey) return null;
  return (data?.requirements || []).find((requirement) => (requirement.instances || []).some((instance) => instance.documentKey === documentKey)) || null;
}

/** Instance to open first: the first one still needing work (not complying or pending), else the first one. */
export function primaryInstance(requirement) {
  const instances = requirement?.instances || [];
  return instances.find((instance) => instance.verdict === 'does_not_comply') || instances.find((instance) => instance.verdict === 'pending') || instances[0] || null;
}
