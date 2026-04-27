const DEVELOPER_ROLE_CODES = new Set([
  'DEV',
  'DEVELOPER',
  'DVL',
  'PROG',
  'PROGRAMADOR',
  'SYS',
  'SUPERADMIN',
]);

function normalize(value) {
  return String(value || '').trim().toUpperCase();
}

export function isDeveloperUser(user) {
  if (!user) return false;

  const candidates = [
    user.role_short,
    user.role,
    user.roleDesc,
    user.Role?.short,
    user.Role?.name,
    user.Role?.desc,
  ].filter(Boolean).map(normalize);

  return candidates.some((role) => {
    if (DEVELOPER_ROLE_CODES.has(role)) return true;
    return role.includes('DESARROLL') || role.includes('DEVELOPER') || role.includes('PROGRAMADOR');
  });
}