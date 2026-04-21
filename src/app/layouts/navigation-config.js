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
    icon: 'LayoutDashboard',
    route: '/dashboard',
    roles: [],
    children: [],
  },
  {
    id: 'licencias',
    label: 'Licencias',
    icon: 'FileText',
    route: '/licencias',
    roles: [],
    children: [
      { id: 'licencias-radicar', label: 'Radicar', route: '/licencias', icon: 'FilePlus' },
      { id: 'licencias-gestion', label: 'Gestión', route: '/licencias/gestion', icon: 'FolderOpen' },
      { id: 'licencias-gestion-nueva', label: 'Gestión nueva', route: '/licencias/gestion-nueva', icon: 'Layers' },
    ],
  },
  {
    id: 'peticiones',
    label: 'Peticiones',
    icon: 'FileSpreadsheet',
    route: '/peticiones',
    roles: [],
    children: [],
  },
  {
    id: 'ventanilla',
    label: 'Ventanilla',
    icon: 'FileInput',
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
    icon: 'Calendar',
    route: '/calendario',
    roles: [],
    children: [],
  },
  {
    id: 'archivo',
    label: 'Archivo',
    icon: 'FolderOpen',
    route: '/archivo',
    roles: [],
    children: [],
  },
  {
    id: 'publicaciones',
    label: 'Publicaciones',
    icon: 'Newspaper',
    route: '/publicaciones',
    roles: [],
    children: [],
  },
  {
    id: 'nomenclatura',
    label: 'Nomenclatura',
    icon: 'PenLine',
    route: '/nomenclatura',
    roles: [],
    children: [],
  },
  {
    id: 'normas',
    label: 'Normas urbanas',
    icon: 'Home',
    route: '/normas',
    roles: [],
    children: [
      { id: 'normas-urbanas', label: 'Normas', route: '/normas', icon: 'Scale' },
      { id: 'uso-suelo', label: 'Uso de suelo', route: '/uso-suelo', icon: 'MapPin' },
    ],
  },
];

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

/**
 * Utility modules shown on dashboard but not in icon rail.
 * These are accessible via dashboard cards and the command palette.
 */
export const UTILITY_MODULES = [
  { id: 'documentos', label: 'Documentos', icon: 'FileText', route: '/documentos' },
  { id: 'calculadora', label: 'Calculadora', icon: 'Calculator', route: '/calculadora' },
  { id: 'consecutivos', label: 'Consecutivos', icon: 'Book', route: '/consecutivos' },
  { id: 'ayuda', label: 'Ayuda', icon: 'BookOpen', route: '/ayuda' },
  { id: 'profesionales', label: 'Profesionales', icon: 'HardHat', route: '/profesionales' },
  { id: 'certificados', label: 'Certificados', icon: 'Contact', route: '/certificados' },
];
