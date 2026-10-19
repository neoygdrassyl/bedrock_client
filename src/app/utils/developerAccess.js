const DEVELOPER_ROLE_CODES = new Set([
  'DEV',
  'DEVELOPER',
  'DVL',
  'AUX',
  'PROG',
  'PROG.',
  'PROGRAMADOR',
  'SYS',
  'SUPERADMIN',
]);

const ERROR_REPORT_MANAGER_ROLE_CODES = new Set(['ADM', 'CUR']);

function normalize(value) {
  return String(value || '').trim().toUpperCase();
}

function getRoleCandidates(user) {
  if (!user) return [];

  return [
    user.role_short,
    user.role,
    user.roleDesc,
    user.Role?.short,
    user.Role?.name,
    user.Role?.desc,
  ].filter(Boolean).map(normalize);
}

function hasRole(user, roleCodes) {
  const candidates = getRoleCandidates(user);
  if (candidates.length === 0) return false;
  return candidates.some((role) => roleCodes.has(role));
}

export function isDeveloperUser(user) {
  const candidates = getRoleCandidates(user);
  if (candidates.length === 0) return false;

  return candidates.some((role) => {
    if (DEVELOPER_ROLE_CODES.has(role)) return true;
    return role.includes('DESARROLL') || role.includes('DEVELOPER') || role.includes('PROGRAMADOR');
  });
}

export function isErrorReportManagerUser(user) {
  return hasRole(user, ERROR_REPORT_MANAGER_ROLE_CODES);
}

// Mirrors the backend gate for Central configuration (documentary-access.js): the
// backend strips trailing dots and maps ADMIN/ADMINISTRADOR and CURADOR to ADM/CUR,
// so "Admin." (role_short) must be accepted here too.
const INTEGRATION_MANAGER_ROLE_CODES = new Set(['ADM', 'ADMIN', 'ADMINISTRADOR', 'CUR', 'CURADOR']);

export function isIntegrationManagerUser(user) {
  if (isDeveloperUser(user)) return true;
  return getRoleCandidates(user).some((role) => INTEGRATION_MANAGER_ROLE_CODES.has(role.replace(/\.+$/, '')));
}