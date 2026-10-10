// Mirrors the backend session normalization (auth.middleware.js `normalizeRole`)
// so the UI hides exactly what `canManageDocumentaryConfiguration(req)` rejects.
const ROLE_ALIASES = {
  ADMIN: 'ADM',
  ADMINISTRADOR: 'ADM',
  CURADOR: 'CUR',
  PROG: 'AUX',
  PROGRAMADOR: 'AUX',
  AUXILIAR: 'AUX',
  ABOGADO: 'ABG',
};

// Abogado, curador and programador/auxiliar. Admin is excluded on purpose.
const CONFIGURATION_MANAGER_ROLES = new Set(['ABG', 'CUR', 'AUX']);

function normalizeRole(value) {
  const normalized = String(value || '').trim().toUpperCase().replace(/[.]+$/, '');
  return ROLE_ALIASES[normalized] || normalized;
}

/**
 * Whether the session user may view and change which Dovela Central configuration
 * version governs an expediente. Advisory only: the backend enforces the same rule.
 */
export function canManageDocumentaryConfiguration(user) {
  if (!user) return false;
  // `role_short` is the claim the backend normalizes; the role name is a fallback.
  const sessionRole = user.role_short || user.role;
  return CONFIGURATION_MANAGER_ROLES.has(normalizeRole(sessionRole));
}
