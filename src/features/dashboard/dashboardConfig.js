// Static dashboard definitions: module groups, widget registry and size classes.
// Kept at module level so they are created once and never trigger re-renders.

const _GLOBAL_ID = import.meta.env.VITE_GLOBAL_ID;

/** Soft tints for icon tiles. Palette tints carry an explicit dark variant. */
export const TINTS = {
  sky: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  teal: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  fuchsia: 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400',
  orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  primary: 'bg-primary/10 text-primary',
  accent: 'bg-accent/10 text-accent',
  warning: 'bg-warning/10 text-warning',
  muted: 'bg-muted text-muted-foreground',
};

/** Per-route icon chip tints for module rows. */
export const ICON_COLORS = {
  '/licencias': TINTS.primary,
  '/licencias/gestion': TINTS.primary,
  '/licencias/gestion-nueva': TINTS.indigo,
  '/peticiones': TINTS.warning,
  '/ventanilla': TINTS.sky,
  '/calendario': TINTS.emerald,
  '/normas': TINTS.primary,
  '/uso-suelo': TINTS.accent,
  '/nomenclatura': TINTS.amber,
  '/configuracion?tab=configuracion-documental': TINTS.fuchsia,
  '/simulador/documentos': TINTS.primary,
  '/simulador/legal': TINTS.accent,
  '/archivo': TINTS.teal,
  '/documentos': TINTS.primary,
  '/consecutivos': TINTS.muted,
  '/publicaciones': TINTS.muted,
  '/mensajes': TINTS.violet,
  '/calculadora': TINTS.accent,
  '/profesionales': TINTS.orange,
  '/bd-profesionales': TINTS.orange,
  '/certificados': TINTS.muted,
  '/ayuda': TINTS.muted,
  '/sellos': TINTS.primary,
};

export const DEFAULT_ICON_COLOR = TINTS.muted;

export const DASHBOARD_GROUPS = [
  {
    key: 'radicacion',
    title: 'Radicación',
    description: 'Ingreso, recepción y consulta inicial de solicitudes',
    icon: 'FilePlus2',
    tint: TINTS.sky,
    items: [
      { title: 'Nueva radicación', icon: 'FileText', desc: 'Crear y revisar radicaciones realizadas', link: '/licencias' },
      { title: 'Ventanilla Única', icon: 'FileInput', desc: 'Recepción documental completa', link: '/ventanilla' },
    ],
  },
  {
    key: 'gestion-curaduria',
    title: 'Gestión Curaduría',
    description: 'Control operativo de expedientes, PQRS y alarmas',
    icon: 'FolderKanban',
    tint: TINTS.indigo,
    items: [
      { title: 'Gestionar Licencias Nuevo', icon: 'Layers', desc: 'Dashboard operativo en desarrollo', link: '/licencias/gestion-nueva', status: 'En desarrollo' },
      { title: 'Gestionar Licencias', icon: 'FolderOpen', desc: 'Gestión clásica de expedientes', link: '/licencias/gestion' },
      { title: 'Peticiones PQRS', icon: 'FileSpreadsheet', desc: 'Quejas, reclamos y solicitudes', link: '/peticiones' },
    ],
  },
  {
    key: 'otras-actuaciones',
    title: 'Otras actuaciones',
    description: 'Normas, usos y nomenclaturas según curaduría',
    icon: 'Landmark',
    tint: TINTS.amber,
    items: [
      ...(_GLOBAL_ID === 'cb1'
        ? [
            { title: 'Normas Urbanas', icon: 'Home', desc: 'Disponible para esta curaduría', link: '/normas' },
            { title: 'Usos del suelo', icon: 'MapPin', desc: 'Disponible para esta curaduría', link: '/uso-suelo' },
          ]
        : []),
      { title: 'Nomenclaturas', icon: 'Signpost', desc: 'Asignación y consulta predial', link: '/nomenclatura' },
    ],
  },
  {
    key: 'archivo-expedicion',
    title: 'Archivo y Expedición',
    description: 'Repositorio, consecutivos y documentos de soporte',
    icon: 'Archive',
    tint: TINTS.teal,
    items: [
      { title: 'Archivo', icon: 'Archive', desc: 'Repositorio principal de expedientes', link: '/archivo' },
      { title: 'Diccionario de consecutivos', icon: 'Book', desc: 'Consulta de radicados y series', link: '/consecutivos' },
      { title: 'Documentos', icon: 'FileText', desc: 'Plantillas, formatos e instrumentos', link: '/documentos' },
    ],
  },
  {
    key: 'comunicaciones',
    title: 'Comunicaciones',
    description: 'Publicación, mensajería, citas y chat interno',
    icon: 'MessagesSquare',
    tint: TINTS.emerald,
    items: [
      { title: 'Publicaciones', icon: 'Newspaper', desc: 'Novedades y resoluciones', link: '/publicaciones' },
      { title: 'Buzón de mensajes', icon: 'Mail', desc: 'Mensajes y correspondencia externa', link: '/mensajes' },
      { title: 'Calendario de citas', icon: 'Calendar', desc: 'Agenda y programación', link: '/calendario' },
      { key: 'chat-curaduria', title: 'Chat curaduría', icon: 'MessageCircle', desc: 'Conversaciones internas del equipo', link: '/mensajes', showCount: false },
    ],
  },
  {
    key: 'simulador',
    title: 'Simulador',
    description: 'Herramientas de consulta previa sin modificar expedientes',
    icon: 'FlaskConical',
    tint: TINTS.fuchsia,
    items: [
      { title: 'Documentos', icon: 'FileText', desc: 'Consulta y administra la configuración documental de Dovela Central', link: '/configuracion?tab=configuracion-documental' },
      { title: 'Legal', icon: 'Gavel', desc: 'Revisa la guía jurídica existente del flujo legal', link: '/simulador/legal' },
    ],
  },
  {
    key: 'utilidades',
    title: 'Utilidades',
    description: 'Herramientas auxiliares y consultas de apoyo',
    icon: 'Wrench',
    tint: TINTS.orange,
    items: [
      { title: 'Calculadora de expensas', icon: 'Calculator', desc: 'Liquidación de costos', link: '/calculadora' },
      { title: 'Base de datos profesionales', icon: 'HardHat', desc: 'Profesionales registrados', link: '/profesionales' },
      { title: 'BD PROFESIONALES', icon: 'Users', desc: 'Roles, experiencia y expedientes por profesional', link: '/bd-profesionales' },
      { title: 'Historial de profesionales', icon: 'Contact', desc: 'Certificaciones emitidas', link: '/certificados' },
      { title: 'Manual de usuario', icon: 'BookOpen', desc: 'Guía de uso del sistema', link: '/ayuda' },
      { title: 'Sellos', icon: 'Stamp', desc: 'Consulta y generación de sellos', link: '/sellos' },
    ],
  },
].filter((group) => group.items.length > 0);

/** Stable identity of a module item, used for favorites. */
export function getItemId(item) {
  return item.key || item.link;
}

export const GROUPS_BY_KEY = Object.fromEntries(DASHBOARD_GROUPS.map((group) => [group.key, group]));

/** Flat lookup of every module item available in this deployment. */
export const ITEMS_BY_ID = Object.fromEntries(
  DASHBOARD_GROUPS.flatMap((group) => group.items.map((item) => [getItemId(item), { ...item, groupKey: group.key }]))
);

export const KPI_ITEMS = [
  { link: '/peticiones', label: 'PQRS', icon: 'FileSpreadsheet', tint: TINTS.amber },
  { link: '/mensajes', label: 'Buzón', icon: 'Mail', tint: TINTS.violet },
  { link: '/calendario', label: 'Citas', icon: 'CalendarDays', tint: TINTS.emerald },
  { link: '/licencias/gestion-nueva', countKey: 'tracked', label: 'Expedientes marcados', icon: 'Bookmark', tint: TINTS.rose },
];

export const WIDGET_SIZES = ['sm', 'md', 'lg', 'full'];

export const SIZE_LABELS = {
  sm: { short: 'S', aria: 'Tamaño pequeño' },
  md: { short: 'M', aria: 'Tamaño mediano' },
  lg: { short: 'L', aria: 'Tamaño grande' },
  full: { short: 'Full', aria: 'Ancho completo' },
};

// Literal strings so Tailwind JIT picks them up.
export const SIZE_CLASSES = {
  sm: 'col-span-12 lg:col-span-6 2xl:col-span-4',
  md: 'col-span-12 lg:col-span-6 2xl:col-span-6',
  lg: 'col-span-12 lg:col-span-12 2xl:col-span-8',
  full: 'col-span-12',
};

const GROUP_WIDGETS = Object.fromEntries(
  DASHBOARD_GROUPS.map((group) => [
    group.key,
    { id: group.key, title: group.title, icon: group.icon, kind: 'group', defaultSize: 'sm' },
  ])
);

const WIDGET_REGISTRY = {
  kpis: { id: 'kpis', title: 'Indicadores', icon: 'BarChart3', kind: 'kpis', defaultSize: 'full' },
  favorites: { id: 'favorites', title: 'Accesos rápidos', icon: 'Star', kind: 'favorites', defaultSize: 'full' },
  recent: { id: 'recent', title: 'Continuar trabajando', icon: 'History', kind: 'recent', defaultSize: 'md' },
  tracked: { id: 'tracked', title: 'Expedientes marcados', icon: 'Bookmark', kind: 'tracked', defaultSize: 'md' },
  ...GROUP_WIDGETS,
};

const DEFAULT_ORDER_CANDIDATES = [
  // Daily work first (where you left off, what you follow), module catalog after.
  'kpis',
  'favorites',
  'recent',
  'tracked',
  'radicacion',
  'gestion-curaduria',
  'otras-actuaciones',
  'archivo-expedicion',
  'comunicaciones',
  'simulador',
  'utilidades',
];

/** Widgets in default order, limited to those available in this deployment. */
export const WIDGETS = DEFAULT_ORDER_CANDIDATES.filter((id) => WIDGET_REGISTRY[id]).map((id) => WIDGET_REGISTRY[id]);

export const WIDGETS_BY_ID = Object.fromEntries(WIDGETS.map((widget) => [widget.id, widget]));
