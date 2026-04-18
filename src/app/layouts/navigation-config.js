/**
 * Centralized navigation configuration for Dovela.
 * Defines the icon rail items, role visibility, routes, and legacy redirects.
 */

/** @typedef {'ADMIN' | 'AUX' | 'USER'} RoleShort */

/**
 * All navigation items. `roles` array defines who can see each item.
 * An empty array means visible to all roles (including null/undefined).
 * `children` define sub-items shown in the contextual panel.
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
    roles: ['ADMIN', 'AUX'],
    children: [
      { id: 'licencias-radicar', label: 'Radicar', route: '/licencias', icon: 'FilePlus' },
      { id: 'licencias-gestion', label: 'Gestión', route: '/licencias/gestion', icon: 'FolderOpen' },
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
    roles: ['ADMIN', 'USER'],
    children: [],
  },
  {
    id: 'mensajes',
    label: 'Mensajes',
    icon: 'Mail',
    route: '/mensajes',
    roles: ['ADMIN'],
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
    roles: ['ADMIN'],
    children: [],
  },
  {
    id: 'publicaciones',
    label: 'Publicaciones',
    icon: 'Newspaper',
    route: '/publicaciones',
    roles: ['ADMIN'],
    children: [],
  },
  {
    id: 'nomenclatura',
    label: 'Nomenclatura',
    icon: 'PenLine',
    route: '/nomenclatura',
    roles: ['ADMIN'],
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
 * If role is null/undefined, returns all items (legacy fallback).
 *
 * @param {RoleShort | null} role
 * @returns {typeof NAV_ITEMS}
 */
export function getNavItems(role) {
  if (!role) return NAV_ITEMS;
  return NAV_ITEMS.filter(
    (item) => item.roles.length === 0 || item.roles.includes(role)
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
