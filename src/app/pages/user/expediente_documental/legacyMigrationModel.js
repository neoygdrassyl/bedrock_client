// Pure presentation model of the legacy -> documentary migration preview.

export const ISSUE_LABELS = {
  NOT_LEGACY: 'El expediente ya usa el modelo nuevo',
  EVIDENCE_EXISTS: 'Ya hay documentos registrados en el modelo nuevo',
  RELEASE_NOT_READY: 'Publicación de Central no lista',
  DIGITAL_WITHOUT_VR: 'Archivo digital sin VR',
  AMBIGUOUS_VR: 'VR ambigua',
  DUPLICATE_IN_VR: 'Documento repetido en la misma VR',
  MISSING_PAGES: 'Entrega física sin folios',
  FILE_MISSING: 'Archivo no encontrado en el almacenamiento',
  UNKNOWN_CODE: 'Código fuera del catálogo (se importa como anexo)',
  PQRS_VR: 'Ventanilla de PQRS',
  REPORT_EXCLUDED: 'Informe técnico excluido',
  CHECKLIST_MISMATCH: 'Diferencia con la lista de chequeo antigua',
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

/** Headline figures of the preview. */
export function summaryFacts(preview) {
  const stats = preview?.stats;
  if (!stats) return [];
  return [
    { key: 'vrs', label: 'VR', value: stats.vrs, hint: stats.pqrsVrs ? `${stats.pqrsVrs} PQRS` : null },
    { key: 'deliveries', label: 'Entregas', value: stats.deliveries, hint: `${stats.documents} docs · ${stats.versionedDocuments} versionados` },
    { key: 'files', label: 'Archivos', value: stats.files.imported, hint: stats.files.missing ? `${stats.files.missing} sin archivo` : null },
    { key: 'issues', label: 'Incidencias', value: stats.issues.blocking + stats.issues.warning, hint: stats.issues.blocking ? `${stats.issues.blocking} bloqueantes` : null },
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
