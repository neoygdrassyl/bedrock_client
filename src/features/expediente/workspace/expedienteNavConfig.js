/**
 * Section navigation for the expediente workspace (left side nav).
 *
 * Section ids are part of the workspace contract (`?section=` / `?report=`) and of
 * `renderModuleContent`; do not rename them. Visibility rules mirror the legacy
 * module nav: "Actualizar" requires an editable expediente, "Publicidad" requires
 * the publicity rules, and P.H. expedientes swap the three discipline reports for
 * a single "Informe P.H." and drop "Acta".
 */

export const EXPEDIENTE_NAV_GROUPS = Object.freeze([
  {
    id: 'consulta',
    label: 'Consulta',
    tone: 'sky',
    items: [
      { id: 'detalles', label: 'Detalles', icon: 'FolderOpen' },
      { id: 'tiempos', label: 'Tiempos', icon: 'Clock' },
    ],
  },
  {
    id: 'documentos',
    label: 'Documentos',
    tone: 'indigo',
    items: [
      { id: 'documentos-new', label: 'Documentos (nuevo)', icon: 'FileStack' },
      { id: 'documentos', label: 'Documentos', icon: 'Archive' },
      { id: 'actualizar', label: 'Actualizar', icon: 'RefreshCw', requiresEdit: true },
      { id: 'chequeo', label: 'Chequeo', icon: 'CheckSquare' },
      { id: 'publicidad', label: 'Publicidad', icon: 'Megaphone', requiresPublicidad: true },
    ],
  },
  {
    id: 'informes',
    label: 'Informes',
    tone: 'violet',
    items: [
      { id: 'juridico', label: 'Inf. jurídico', ariaLabel: 'Informe jurídico', icon: 'Scale', standardReport: true },
      { id: 'arquitectonico', label: 'Inf. arquitectónico', ariaLabel: 'Informe arquitectónico', icon: 'Building', standardReport: true },
      { id: 'estructural', label: 'Inf. estructural', ariaLabel: 'Informe estructural', icon: 'Cog', standardReport: true },
      { id: 'ph', label: 'Informe P.H.', icon: 'PenTool', phOnly: true },
    ],
  },
  {
    id: 'cierre',
    label: 'Cierre',
    tone: 'amber',
    items: [
      { id: 'acta', label: 'Acta', icon: 'FileCheck', hideForPH: true },
      { id: 'expedicion', label: 'Expedición', phLabel: 'Expedición P.H.', icon: 'FileOutput' },
    ],
  },
]);

export const EXPEDIENTE_SECTION_IDS = Object.freeze(
  EXPEDIENTE_NAV_GROUPS.flatMap((group) => group.items.map((item) => item.id))
);

export const STANDARD_REPORT_SECTION_IDS = Object.freeze(['juridico', 'arquitectonico', 'estructural']);
const REPORT_SECTION_IDS = new Set([...STANDARD_REPORT_SECTION_IDS, 'ph']);

/** Tailwind classes per tone, spelled out literally so the JIT compiler emits them. */
export const NAV_TONE_CLASSES = Object.freeze({
  sky: { dot: 'bg-sky-500', icon: 'text-sky-600 dark:text-sky-400', pill: 'bg-sky-500/10 ring-sky-500/25' },
  indigo: { dot: 'bg-indigo-500', icon: 'text-indigo-600 dark:text-indigo-400', pill: 'bg-indigo-500/10 ring-indigo-500/25' },
  violet: { dot: 'bg-violet-500', icon: 'text-violet-600 dark:text-violet-400', pill: 'bg-violet-500/10 ring-violet-500/25' },
  amber: { dot: 'bg-amber-500', icon: 'text-amber-600 dark:text-amber-400', pill: 'bg-amber-500/10 ring-amber-500/25' },
});

/**
 * Resolves the groups and items visible for one expediente.
 * @param {{ canEdit?: boolean, canShowPublicidad?: boolean, isPropertyHorizontal?: boolean }} flags
 */
export function getExpedienteNavGroups({ canEdit = false, canShowPublicidad = false, isPropertyHorizontal = false } = {}) {
  return EXPEDIENTE_NAV_GROUPS
    .map((group) => ({
      ...group,
      items: group.items
        .filter((item) => {
          if (item.requiresEdit && !canEdit) return false;
          if (item.requiresPublicidad && !canShowPublicidad) return false;
          if (item.standardReport && isPropertyHorizontal) return false;
          if (item.phOnly && !isPropertyHorizontal) return false;
          if (item.hideForPH && isPropertyHorizontal) return false;
          return true;
        })
        .map(({ phLabel, standardReport, phOnly, hideForPH, ...item }) => ({
          ...item,
          label: isPropertyHorizontal && phLabel ? phLabel : item.label,
          tone: group.tone,
        })),
    }))
    .filter((group) => group.items.length > 0);
}

/** Finds the visible item and its group for a section id. */
export function findNavSection(groups, sectionId) {
  for (const group of groups || []) {
    const item = group.items.find((candidate) => candidate.id === sectionId);
    if (item) return { group, item };
  }
  return null;
}

/**
 * Maps a workspace section id to the URL target understood by
 * `parseExpedienteWorkspaceSearch`: reports travel as `section=informes&report=<id>`.
 */
export function sectionToWorkspaceTarget(sectionId) {
  if (REPORT_SECTION_IDS.has(sectionId)) {
    return { section: 'informes', report: sectionId };
  }
  return { section: EXPEDIENTE_SECTION_IDS.includes(sectionId) ? sectionId : 'detalles', report: null };
}

/**
 * Returns the next search params for a section change, preserving unrelated params
 * (e.g. `panel`), or `null` when the URL already points at that section.
 * @param {URLSearchParams|string} search
 * @param {string} sectionId
 */
export function buildSectionSearchParams(search, sectionId) {
  const current = new URLSearchParams(search instanceof URLSearchParams ? search.toString() : search || '');
  const next = new URLSearchParams(current.toString());
  const target = sectionToWorkspaceTarget(sectionId);

  if (target.section === 'detalles') next.delete('section');
  else next.set('section', target.section);

  if (target.report) next.set('report', target.report);
  else next.delete('report');

  return next.toString() === current.toString() ? null : next;
}
