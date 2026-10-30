/**
 * Centralized navigation configuration for Dovela.
 * Defines the icon rail items, routes, and legacy redirects.
 *
 * NOTE: Role filtering is temporarily disabled (roles:[] in all items).
 * Permissions will be reintroduced in a future iteration using real DB roles
 * (Prog., Curador, Admin., Ing., Abg., Arq., Secretario) — not fake codes.
 */

const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Panel de control',
    icon: 'LayoutGrid',
    route: '/dashboard',
    roles: [],
    children: [],
  },
  {
    id: 'licencias',
    label: 'Licencias',
    icon: 'Building2',
    route: '/licencias',
    roles: [],
    children: [
      { id: 'licencias-radicar', label: 'Radicar', route: '/licencias', icon: 'FilePlus2' },
      { id: 'licencias-gestion', label: 'Gestión', route: '/licencias/gestion', icon: 'FolderKanban' },
      { id: 'licencias-gestion-nueva', label: 'Gestión nueva', route: '/licencias/gestion-nueva', icon: 'LayoutList' },
    ],
  },
  {
    id: 'peticiones',
    label: 'Peticiones',
    icon: 'MessageSquareText',
    route: '/peticiones',
    roles: [],
    children: [],
  },
  {
    id: 'ventanilla',
    label: 'Ventanilla',
    icon: 'Inbox',
    route: '/ventanilla',
    roles: [],
    children: [],
  },
  {
    id: 'mensajes',
    label: 'Mensajes',
    icon: 'Mail',
    route: '/mensajes',
    roles: [],
    children: [],
  },
  {
    id: 'calendario',
    label: 'Calendario',
    icon: 'CalendarDays',
    route: '/calendario',
    roles: [],
    children: [],
  },
  {
    id: 'archivo',
    label: 'Archivo',
    icon: 'Archive',
    route: '/archivo',
    roles: [],
    children: [],
  },
  {
    id: 'publicaciones',
    label: 'Publicaciones',
    icon: 'Megaphone',
    route: '/publicaciones',
    roles: [],
    children: [],
  },
  {
    id: 'nomenclatura',
    label: 'Nomenclatura',
    icon: 'Signpost',
    route: '/nomenclatura',
    roles: [],
    children: [],
  },
  {
    id: 'normas',
    label: 'Normas urbanas',
    icon: 'Landmark',
    route: '/normas',
    roles: [],
    children: [
      { id: 'normas-urbanas', label: 'Normas', route: '/normas', icon: 'Scale' },
      { id: 'uso-suelo', label: 'Uso de suelo', route: '/uso-suelo', icon: 'MapPinned' },
    ],
  },
  {
    id: 'simulador',
    label: 'Simulador',
    icon: 'FlaskConical',
    route: '/simulador',
    roles: [],
    children: [
      { id: 'simulador-documentos', label: 'Documentos', route: '/configuracion?tab=configuracion-documental', icon: 'FileStack' },
      { id: 'simulador-legal', label: 'Legal', route: '/simulador/legal', icon: 'Gavel' },
    ],
  },
  {
    id: 'configuracion',
    label: 'Configuración',
    icon: 'Settings2',
    route: '/configuracion',
    roles: [],
    children: [],
  },
];

const ROUTE_PRELOADERS = {
  '/dashboard': () => import('../../features/dashboard/dashboard'),
  '/licencias': () => import('../../features/expediente/fun/fun'),
  '/licencias/gestion': () => import('../../features/expediente/fun/funmanage.page'),
  '/licencias/gestion-nueva': () => import('../../features/expediente/fun/funmanage_new.page'),
  '/peticiones': () => import('../../features/pqrs/pqrsadmin'),
  '/ventanilla': () => import('../../features/ventanilla/submit'),
  '/mensajes': () => import('../../features/messaging/mail'),
  '/calendario': () => import('../../features/appointments/appointments'),
  '/archivo': () => import('../../features/archive/archive.page'),
  '/publicaciones': () => import('../../features/publications/publish'),
  '/nomenclatura': () => import('../../features/nomenclature/nomenclature'),
  '/normas': () => import('../../features/norms/norms.page'),
  '/uso-suelo': () => import('../../features/norms/zone-use/zone_use.page'),
  '/simulador': () => import('../../features/simulador'),
  '/simulador/documentos': () => import('../../features/settings/SettingsPage'),
  '/simulador/legal': () => import('../../features/simulador/legal_flow_guide/LegalFlowGuide.page'),
  '/configuracion': () => import('../../features/settings/SettingsPage'),
};

export function preloadNavigationRoute(route) {
  const preload = ROUTE_PRELOADERS[route];
  return preload ? preload().catch(() => undefined) : Promise.resolve();
}

/**
 * Returns nav items filtered by role.
 * Currently no filtering is applied (all items visible to all roles).
 * Kept as pass-through to preserve call sites during the redesign.
 */
export function getNavItems(_role) {
  return NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.length === 0
  );
}

/**
 * Old route → new route mapping for redirects.
 * Used in App.js to redirect bookmarked/hardcoded old URLs.
 */
export function getRouteRedirects() {
  return {
    '/fun': '/licencias',
    '/funmanage': '/licencias/gestion',
    '/funmanage-new': '/licencias/gestion-nueva',
    '/pqrsadmin': '/peticiones',
    '/mail': '/mensajes',
    '/appointments': '/calendario',
    '/submit': '/ventanilla',
    '/publish': '/publicaciones',
    '/osha': '/documentos',
    '/calculator': '/calculadora',
    '/dictionary': '/consecutivos',
    '/guide_user': '/ayuda',
    '/profesionals': '/profesionales',
    '/certs': '/certificados',
    '/nomenclature': '/nomenclatura',
    '/zone_use': '/uso-suelo',
    '/archive': '/archivo',
    '/norms': '/normas',
    '/normogram': '/normas',
    '/administrative': '/publicaciones',
    '/old': '/archivo',
    '/liquidator': '/calculadora',
    '/pqrs': '/peticiones',
    '/scheduling': '/calendario',
    '/certificacion': '/certificados',
    '/seals': '/sellos',
  };
}
