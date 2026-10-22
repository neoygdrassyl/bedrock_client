// Pure presentation model of the legacy -> documentary migration preview.

// One short sentence per code: what happens and, when needed, what to do. Codes come from the backend.
export const ISSUE_LABELS = {
  NOT_LEGACY: 'El expediente ya usa el modelo nuevo: no hay nada que migrar.',
  EVIDENCE_EXISTS: 'Ya hay documentos registrados en el modelo nuevo: no se puede migrar.',
  RELEASE_NOT_READY: 'La publicación elegida no está lista: elija otra publicación.',
  DIGITAL_WITHOUT_VR: 'Archivo digital sin VR: asígnelo a una VR o exclúyalo.',
  AMBIGUOUS_VR: 'No se puede saber a qué expediente pertenece una VR: revísela antes de migrar.',
  DUPLICATE_IN_VR: 'Documento repetido en la misma VR: se importa sin perder entregas. No requiere acción.',
  MISSING_PAGES: 'Entrega física sin folios: se importa sin folios. Puede completarlos después.',
  FILE_MISSING: 'Archivo no encontrado en el almacenamiento: se conserva su referencia.',
  UNKNOWN_CODE: 'Código fuera del catálogo: el documento se importa como anexo.',
  PQRS_VR: 'VR de otro trámite: se importa igual. No requiere acción.',
  REPORT_EXCLUDED: 'Informe técnico: no se importa, pertenece a los documentos expedidos.',
  CHECKLIST_MISMATCH: 'La lista de chequeo antigua no coincide con las entregas: no se importa, solo se compara.',
};

export const SEVERITY_LABELS = { blocking: 'Bloqueantes', warning: 'Advertencias' };

export const CLASS_LABELS = { requirement: 'Requisito', annex: 'Anexo', vr_slip: 'Comprobante VR' };

export const FILE_STATUS_LABELS = {
  attached: 'Asociado a la entrega', digital_only: 'Entrega solo digital', vr_slip: 'Comprobante de VR', unassigned: 'Sin VR',
  excluded: 'Excluido', report_excluded: 'Informe excluido', duplicate: 'Repetido', invalid_path: 'Ruta no válida',
};

export const CHECKLIST_STATUS_LABELS = { consistent: 'Coincide', mismatch: 'No coincide', missing: 'Falta según Central', not_applicable: 'No aplica' };

/** Issues grouped by severity, then by code with their number of occurrences. */
export function groupIssues(issues) {
  const groups = { blocking: new Map(), warning: new Map() };
  (issues || []).forEach((issue) => {
    const bucket = groups[issue.severity] || groups.warning;
    const entry = bucket.get(issue.code) || { code: issue.code, label: ISSUE_LABELS[issue.code] || issue.code, message: issue.message || '', count: 0, items: [] };
    entry.count += 1;
    entry.items.push(issue);
    bucket.set(issue.code, entry);
  });
  return ['blocking', 'warning'].map((severity) => ({ severity, label: SEVERITY_LABELS[severity], entries: Array.from(groups[severity].values()) }))
    .filter((group) => group.entries.length);
}

/** Headline figures of the preview: what will be migrated (issues are listed separately). */
export function summaryFacts(preview) {
  const stats = preview?.stats;
  if (!stats) return [];
  return [
    { key: 'vrs', label: 'VR a migrar', value: stats.vrs, hint: null },
    { key: 'deliveries', label: 'Entregas', value: stats.deliveries, hint: `${stats.documents} documentos` },
    { key: 'files', label: 'Archivos', value: stats.files.imported, hint: stats.files.missing ? `${stats.files.missing} sin archivo` : null },
  ];
}

/** Digital files without VR that need a decision (assign a VR or exclude). */
export function pendingDigitalFiles(preview) {
  return (preview?.files || []).filter((file) => file.assignable && file.table === 'fun_6s');
}

export const EXCLUDE_VALUE = 'exclude';

/**
 * Resolutions body from the UI choices. choices: { [fun6Id]: submitId string | 'exclude' }.
 * Files without a choice are left out, so the preview keeps reporting them as blocking.
 */
export function buildResolutions(choices, excludedSources) {
  const digitalAssignments = Object.keys(choices || {}).filter((key) => choices[key])
    .map((key) => ({ fun6Id: Number(key), submitId: choices[key] === EXCLUDE_VALUE ? null : Number(choices[key]) }))
    .sort((a, b) => a.fun6Id - b.fun6Id);
  return { digitalAssignments, excludedSources: Array.from(new Set(excludedSources || [])).sort() };
}

/** Commit command for the analyzed plan. */
export function commitCommand(preview, resolutions, reason, idempotencyKey) {
  return { configurationId: preview.release.configurationId, expectedChecksum: preview.release.checksum, expectedPlanHash: preview.planHash,
    expectedInputRevision: preview.inputRevision, idempotencyKey, reason: reason.trim(), resolutions };
}

export function releaseLabel(option) {
  return [`Publicación ${option.releaseVersion}`, option.isCurrent ? 'Vigente' : null].filter(Boolean).join(' · ');
}

/** Short page/medium description of one delivery. */
export function deliveryMedium(delivery) {
  const parts = [];
  if (delivery.hasPhysical) parts.push(delivery.pagesPhysical ? `Físico · ${delivery.pagesPhysical} folios` : 'Físico · sin folios');
  if (delivery.files?.scan) parts.push('Escaneo');
  if (delivery.files?.digital) parts.push(delivery.pagesDigital ? `Digital · ${delivery.pagesDigital} págs.` : 'Digital');
  return parts.join(' · ') || 'Sin soporte';
}
