import { useMemo } from 'react';

export const EXPEDIENTE_MODE = Object.freeze({ canonical: 'canonical', traditional: 'traditional', unlinked: 'unlinked' });

/**
 * Single documentary-mode selector. `origin` (GET documentary origin) is authoritative once loaded;
 * until then the expediente row (`fun0.centralReleaseId`) is the hint callers already had.
 * Returns 'canonical' | 'traditional' | 'unlinked' (a submit without an expediente), or null when
 * neither source is available yet.
 */
export function expedienteModeOf(fun0, origin) {
  if (origin?.mode) return origin.mode;
  if (fun0) return fun0.centralReleaseId != null ? EXPEDIENTE_MODE.canonical : EXPEDIENTE_MODE.traditional;
  return null;
}

export const isCanonicalMode = (mode) => mode === EXPEDIENTE_MODE.canonical;
/** Modes that keep the existing (non-canonical) document intake. */
export const usesTraditionalIntake = (mode) => mode === EXPEDIENTE_MODE.traditional || mode === EXPEDIENTE_MODE.unlinked;
/** Row-only convenience: is this expediente row in the new documentary model? */
export const isCanonicalExpediente = (fun0) => isCanonicalMode(expedienteModeOf(fun0));

export function useExpedienteMode(fun0, origin) {
  const centralReleaseId = fun0?.centralReleaseId;
  const hasFun0 = Boolean(fun0);
  const originMode = origin?.mode;
  return useMemo(
    () => expedienteModeOf(hasFun0 ? { centralReleaseId } : null, originMode ? { mode: originMode } : null),
    [hasFun0, centralReleaseId, originMode],
  );
}
