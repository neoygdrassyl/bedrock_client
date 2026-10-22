import { isDeveloperUser, isIntegrationManagerUser } from '@/features/settings/developerAccess.js';

// The server decides who can write (ADM, CUR and the programmer role); this only hides controls that would be refused.
export function canWriteRegistry(user) {
  return Boolean(user) && (isIntegrationManagerUser(user) || isDeveloperUser(user));
}

export function formatMonths(months) {
  const value = Number(months);
  if (months === null || months === undefined || !Number.isFinite(value) || value <= 0) return 'Sin dato';
  const years = Math.trunc(value / 12);
  const rest = value % 12;
  return [years ? `${years} ${years === 1 ? 'año' : 'años'}` : '', rest ? `${rest} ${rest === 1 ? 'mes' : 'meses'}` : ''].filter(Boolean).join(' ');
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
