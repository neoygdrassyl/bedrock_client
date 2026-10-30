import { isCanonicalExpediente } from '../../../documental/expedienteMode';

export const CANONICAL_SAVE_UNAVAILABLE_HINT = 'Guardar no está disponible en el modelo nuevo todavía';

/**
 * True when the generator's save actions write tables the backend protects in canonical expedientes
 * (CANONICAL_LEGACY_WRITE_FORBIDDEN) and the expediente is canonical. `entry.canonicalSave` is the
 * registry capability; generators that never save declare it false too.
 */
export function isCanonicalSaveBlocked(entry, currentItem) {
  return entry?.canonicalSave === false && isCanonicalExpediente(currentItem);
}

/** Backend error code/message of a failed write, or `fallback` when the response carries none. */
export function generatorSaveErrorText(error, fallback) {
  const payload = error?.response?.data;
  const detail = payload && typeof payload === 'object' ? (payload.error && typeof payload.error === 'object' ? payload.error : payload) : null;
  const message = typeof detail?.message === 'string' ? detail.message : '';
  const code = typeof detail?.code === 'string' ? detail.code : '';
  if (!message && !code) return fallback;
  return code ? `${message || fallback} (${code})` : message;
}
