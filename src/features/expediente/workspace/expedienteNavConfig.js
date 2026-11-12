/**
 * Section navigation for the expediente workspace (nav card under the shell header;
 * side sheet below 1024px).
 *
 * Section ids are part of the workspace contract (`?section=` / `?report=`) and of
 * `renderModuleContent`; do not rename them. Visibility rules mirror the legacy
 * module nav: "Actualizar" requires an editable expediente, "Publicidad" requires
 * the publicity rules, and P.H. expedientes swap the three discipline reports for
 * a single "Informe P.H." and drop "Acta".
 *
 * `shortLabel` is the label used where the group name is already visible next to the
 * item (the horizontal nav card); `label` is the self-explanatory one. `description`
 * is the one-line summary of the module (kept as data; used as the item tooltip).
 *
 * Group ids are stable too (`informes` and `cierre` are referenced by code); only their
 * labels changed to "Evaluación" and "Expedición". `tone` is the key of the categorical
 * section color (`NAV_TONE_CLASSES`, tokens `--section-*` in `src/index.css`).
 */

export const EXPEDIENTE_NAV_GROUPS = Object.freeze([
  {
    id: 'consulta',
    label: 'Consulta',
    tone: 'consulta',
    items: [
      { id: 'detalles', label: 'Detalles', icon: 'FolderOpen', description: 'Resumen de la solicitud y datos generales del expediente.' },
      { id: 'tiempos', label: 'Tiempos', icon: 'Clock', description: 'Control de tiempos, fechas y términos legales.' },
    ],
  },
  {
    id: 'documentos',
    label: 'Documentos',
    tone: 'documentos',
    items: [
      { id: 'documentos-new', label: 'Documentos (nuevo)', icon: 'FileStack', description: 'Documentos de entrada y documentos expedidos.' },
      { id: 'documentos', label: 'Documentos', icon: 'Archive', description: 'Archivo documental del expediente.' },
      { id: 'actualizar', label: 'Actualizar', icon: 'RefreshCw', requiresEdit: true, description: 'Actualización de los datos de la solicitud.' },
      { id: 'chequeo', label: 'Chequeo', icon: 'CheckSquare', description: 'Lista de chequeo de la solicitud.' },
      { id: 'publicidad', label: 'Publicidad', icon: 'Megaphone', requiresPublicidad: true, description: 'Publicidad de la solicitud y citación a vecinos.' },
    ],
  },
  {
    id: 'informes',
    label: 'Evaluación',
    tone: 'evaluacion',
    items: [
      { id: 'juridico', label: 'Inf. jurídico', shortLabel: 'Jurídico', ariaLabel: 'Informe jurídico', icon: 'Scale', standardReport: true },
      { id: 'arquitectonico', label: 'Inf. arquitectónico', shortLabel: 'Arquitectónico', ariaLabel: 'Informe arquitectónico', icon: 'Building', standardReport: true },
      { id: 'estructural', label: 'Inf. estructural', shortLabel: 'Estructural', ariaLabel: 'Informe estructural', icon: 'Cog', standardReport: true },
      { id: 'ph', label: 'Informe P.H.', shortLabel: 'P.H.', icon: 'PenTool', phOnly: true },
    ],
  },
  {
    id: 'cierre',
    label: 'Expedición',
    tone: 'expedicion',
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

/**
 * Classes per group tone. Every class resolves to a `--section-*` token (light, dark and
 * all palettes); the strings are literal so Tailwind can see them. Color is never the
 * only cue: the group name and the item icon + label always travel with it.
 *
 *   chip    solid group marker (text on strong, AA)
 *   wash    very light tint behind the whole group segment
 *   icon    item icon / tone-colored text on card or soft
 *   hover   hover + open state of an item
 *   activeSurface / activeText  selected item: tinted fill + tone ring / tone text
 *   dot     small solid marker (side sheet group title)
 */
export const NAV_TONE_CLASSES = Object.freeze({
  consulta: Object.freeze({
    chip: 'bg-[hsl(var(--section-consulta-strong))] text-[hsl(var(--section-on-strong))]',
    wash: 'bg-[hsl(var(--section-consulta-soft)/0.5)]',
    icon: 'text-[hsl(var(--section-consulta-foreground))]',
    hover: 'hover:bg-[hsl(var(--section-consulta-soft))] data-[state=open]:bg-[hsl(var(--section-consulta-soft))]',
    activeSurface: 'bg-[hsl(var(--section-consulta-strong)/0.16)] ring-1 ring-inset ring-[hsl(var(--section-consulta-strong)/0.6)]',
    activeText: 'text-[hsl(var(--section-consulta-foreground))]',
    dot: 'bg-[hsl(var(--section-consulta-strong))]',
  }),
  documentos: Object.freeze({
    chip: 'bg-[hsl(var(--section-documentos-strong))] text-[hsl(var(--section-on-strong))]',
    wash: 'bg-[hsl(var(--section-documentos-soft)/0.6)]',
    icon: 'text-[hsl(var(--section-documentos-foreground))]',
    hover: 'hover:bg-[hsl(var(--section-documentos-soft))] data-[state=open]:bg-[hsl(var(--section-documentos-soft))]',
    activeSurface: 'bg-[hsl(var(--section-documentos-strong)/0.16)] ring-1 ring-inset ring-[hsl(var(--section-documentos-strong)/0.6)]',
    activeText: 'text-[hsl(var(--section-documentos-foreground))]',
    dot: 'bg-[hsl(var(--section-documentos-strong))]',
  }),
  evaluacion: Object.freeze({
    chip: 'bg-[hsl(var(--section-evaluacion-strong))] text-[hsl(var(--section-on-strong))]',
    wash: 'bg-[hsl(var(--section-evaluacion-soft)/0.6)]',
    icon: 'text-[hsl(var(--section-evaluacion-foreground))]',
    hover: 'hover:bg-[hsl(var(--section-evaluacion-soft))] data-[state=open]:bg-[hsl(var(--section-evaluacion-soft))]',
    activeSurface: 'bg-[hsl(var(--section-evaluacion-strong)/0.16)] ring-1 ring-inset ring-[hsl(var(--section-evaluacion-strong)/0.6)]',
    activeText: 'text-[hsl(var(--section-evaluacion-foreground))]',
    dot: 'bg-[hsl(var(--section-evaluacion-strong))]',
  }),
  expedicion: Object.freeze({
    chip: 'bg-[hsl(var(--section-expedicion-strong))] text-[hsl(var(--section-on-strong))]',
    wash: 'bg-[hsl(var(--section-expedicion-soft)/0.6)]',
    icon: 'text-[hsl(var(--section-expedicion-foreground))]',
    hover: 'hover:bg-[hsl(var(--section-expedicion-soft))] data-[state=open]:bg-[hsl(var(--section-expedicion-soft))]',
    activeSurface: 'bg-[hsl(var(--section-expedicion-strong)/0.16)] ring-1 ring-inset ring-[hsl(var(--section-expedicion-strong)/0.6)]',
    activeText: 'text-[hsl(var(--section-expedicion-foreground))]',
    dot: 'bg-[hsl(var(--section-expedicion-strong))]',
  }),
});

/** Tone classes of a group or item; unknown tones fall back to "consulta". */
export function getNavToneClasses(tone) {
  return NAV_TONE_CLASSES[tone] || NAV_TONE_CLASSES.consulta;
}

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
