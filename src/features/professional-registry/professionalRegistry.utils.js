// Role codes as the login stores them (role_short: "Admin.", "Curador", "Prog."; role: "Administrador"...), reduced to the
// codes the server authorizes with (ADM, CUR, AUX). The server decides who can write; this only hides controls it would refuse.
const ROLE_ALIASES = { ADMIN: 'ADM', ADMINISTRADOR: 'ADM', CURADOR: 'CUR', PROG: 'AUX', PROGRAMADOR: 'AUX', AUXILIAR: 'AUX' };
const WRITE_ROLES = new Set(['ADM', 'CUR', 'AUX']);

function roleCode(value) {
  const code = String(value || '').trim().toUpperCase().replace(/\.+$/, '');
  return ROLE_ALIASES[code] || code;
}

export function canWriteRegistry(user) {
  if (!user) return false;
  return [user.role_short, user.role].some((value) => WRITE_ROLES.has(roleCode(value)));
}

export function formatMonths(months) {
  const value = Number(months);
  if (months === null || months === undefined || !Number.isFinite(value) || value <= 0) return 'Sin dato';
  const years = Math.trunc(value / 12);
  const rest = value % 12;
  return [years ? `${years} ${years === 1 ? 'año' : 'años'}` : '', rest ? `${rest} ${rest === 1 ? 'mes' : 'meses'}` : ''].filter(Boolean).join(' ');
}

// Experience as { years, months, days }, as the server sends it (professional-registry-experience).
const DURATION_UNITS = [['years', 'año', 'años'], ['months', 'mes', 'meses'], ['days', 'día', 'días']];

export function formatDuration(duration) {
  if (!duration) return '—';
  const parts = DURATION_UNITS.filter(([key]) => duration[key]).map(([key, one, many]) => `${duration[key]} ${duration[key] === 1 ? one : many}`);
  return parts.length ? parts.join(' ') : '0 días';
}

// Why the server could not compute the general experience (time since the issue date of the principal matrícula).
export const GENERAL_MISSING = {
  SIN_MATRICULA: 'Sin matrícula',
  PRINCIPAL_EMPATADA: 'Defina la matrícula en uso',
  SIN_FECHA: 'Matrícula en uso sin fecha de expedición',
  FECHA_FUTURA: 'Fecha de expedición posterior a hoy',
};

export function formatGeneralExperience(general) {
  if (general?.duration) return formatDuration(general.duration);
  return GENERAL_MISSING[general?.missing] || 'Sin dato';
}

// Same limit the server uses to flag an experience as atypical (50 years): beyond it the value is almost surely a typing error.
export const IMPLAUSIBLE_MONTHS = 600;

export function isImplausibleMonths(months) {
  const value = Number(months);
  return months !== null && months !== undefined && Number.isFinite(value) && value > IMPLAUSIBLE_MONTHS;
}

export function formatCc(cc) {
  return cc ? String(cc).replace(/\B(?=(\d{3})+(?!\d))/g, '.') : 'Sin cédula';
}

export function formatDate(value) {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeZone: 'UTC' }).format(date);
}

// A moment someone saved something, as dd/mm/aaaa on the local calendar (formatDate shows calendar dates, in UTC).
export function formatDay(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

export const DIFF_LABELS = {
  INCOMPLETO: 'Nombre incompleto',
  ORDEN_INVERTIDO: 'Nombre y apellido invertidos',
  ERROR_ORTOGRAFICO: 'Error de escritura',
  DUDOSO: 'Dudoso',
  REVISAR_IDENTIDAD: 'Posible otra persona',
};

export const DUPLICATE_REASONS = {
  MISMO_NOMBRE: 'Mismo nombre con otra cédula',
  CEDULA_SIMILAR: 'Cédula casi igual',
  MATRICULA_COMPARTIDA: 'Matrícula compartida',
};

export const SORT_OPTIONS = [
  ['name', 'Nombre'],
  ['projects', 'Más expedientes'],
  ['cc', 'Cédula'],
  ['updated', 'Modificados recientemente'],
];

const SAFE_CODES = new Set([
  'VALIDATION', 'VERSION_CONFLICT', 'CC_EXISTS', 'REGISTRATION_EXISTS', 'DELETED', 'MERGED', 'NOT_FOUND',
  'CONSOLIDATION_RUNNING', 'REGISTRY_FAILED',
]);

export function errorCode(error) {
  return error?.response?.data?.code || null;
}

// The backend answers these codes with controlled Spanish messages; anything else gets the generic text.
export function errorText(error, fallback = 'No fue posible completar la operación.') {
  if (error?.response?.status === 403) return 'No tiene permisos para realizar esta acción.';
  const data = error?.response?.data;
  return SAFE_CODES.has(data?.code) && typeof data.message === 'string' && data.message ? data.message : fallback;
}

// The shared dialog's close button inherits a near-white color here; this makes the "X" dark on the light dialog.
export const DIALOG_CLOSE_CLASS = '[&>button.absolute]:text-foreground';
