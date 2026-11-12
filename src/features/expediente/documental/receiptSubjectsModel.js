// Person-scoped receipts (Radicación): a Central document required of persons (requirements[].documents[].subjectId of
// the /view evaluation) is received on behalf of one of them (POST documents `subjectId`). Party ids: "fun_51:<id>"
// (titular), "fun_53:<id>" (responsable / apoderado), "fun_52:<id>" (profesional).

/** Option value of the "Solicitud (sin persona)" choice when the document is also required of the request. */
export const REQUEST_SUBJECT = '__request__';

const KIND_BY_PREFIX = { fun_51: 'Solicitante', fun_53: 'Solicitante', fun_52: 'Profesional' };

/**
 * Persons a document is required of in the current evaluation: { subjectIds, requestLevel }. `subjectIds` keeps the
 * evaluation order without repeats; `requestLevel` tells whether the same document is also a request-level requirement.
 */
export function receiptSubjectsOf(view, documentId) {
  if (!documentId) return { subjectIds: [], requestLevel: false };
  const documents = (view?.requirements?.documents || []).filter((document) => document.documentId === documentId);
  const subjectIds = Array.from(new Set(documents.map((document) => document.subjectId).filter(Boolean)));
  return { subjectIds, requestLevel: documents.some((document) => !document.subjectId) };
}

/** Parties of a legal-form `parties` payload by id (applicants and professionals). */
export function partiesById(parties) {
  return new Map([...(parties?.applicants || []), ...(parties?.professionals || [])].filter((party) => party?.id).map((party) => [party.id, party]));
}

/** "Ana Pérez · Solicitante" of a person; without its party data, the kind and the FUN row ("Profesional fun_52:7"). */
export function subjectOptionLabel(subjectId, byId) {
  const party = byId?.get(subjectId);
  const kind = party?.kindLabel || KIND_BY_PREFIX[String(subjectId).split(':')[0]] || 'Persona';
  return party?.label ? `${party.label} · ${kind}` : `${kind} ${subjectId}`;
}

/** Rows of the same document already received for the chosen person (or for the request when `subjectId` is null). */
export function rowsOfSubject(rows, subjectId) {
  return (rows || []).filter((row) => (row.subjectId || null) === (subjectId || null));
}

const KIND_LABELS = { applicant: 'Solicitante', professional: 'Profesional' };

/**
 * Person a delivery (view row or version) belongs to, or null for request-level deliveries:
 * { id, label, kind, text: "Ana Pérez Ruiz · Profesional" }. The row's own subjectLabel/subjectKind win; otherwise the
 * legal-form parties (`byId`) name it; otherwise the kind and the FUN row id.
 */
export function subjectOfRow(row, byId) {
  const id = row?.subjectId;
  if (!id) return null;
  const party = byId?.get(id);
  const kind = KIND_LABELS[row.subjectKind] || row.subjectKind || party?.kindLabel || KIND_BY_PREFIX[String(id).split(':')[0]] || 'Persona';
  const label = row.subjectLabel || party?.label || null;
  return { id, label: label || id, kind, text: label ? `${label} · ${kind}` : `${kind} ${id}` };
}

/** Whether some row names a person without its label (the legal-form parties are needed to name it). */
export const rowsNeedPartyNames = (rows) => (rows || []).some((row) => row?.subjectId && !row.subjectLabel);

/** Options of the person filter of a documents table: every person of the rows (by label) and the request itself. */
export function subjectFilterOptions(rows, byId) {
  const people = new Map();
  let request = false;
  (rows || []).forEach((row) => {
    const person = subjectOfRow(row, byId);
    if (person) { if (!people.has(person.id)) people.set(person.id, person); } else request = true;
  });
  if (!people.size) return [];
  const options = Array.from(people.values()).sort((a, b) => a.text.localeCompare(b.text, 'es')).map((person) => ({ value: person.id, label: person.text }));
  return request ? [...options, { value: REQUEST_SUBJECT, label: 'Solicitud (sin persona)' }] : options;
}
