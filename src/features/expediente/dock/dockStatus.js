import { UNKNOWN_STATUS_META } from '../workspace/expedienteStatus';

/** Shown on a dock dot while the term of that expediente has not been computed yet. */
export const NOT_COMPUTED_STATUS_META = Object.freeze({
  ...UNKNOWN_STATUS_META,
  label: 'Término por calcular',
});

/**
 * Status of a dock chip / "Expedientes abiertos" row: the term computed from the clocks
 * (`computedTermStore`), or a neutral "Término por calcular" until the expediente is opened
 * in the workspace or in a quick window. The backend summary status is never used, so a
 * dot can not contradict what the workspace shows.
 */
export function getDockStatusMeta(computedTerm) {
  return computedTerm?.statusMeta ?? NOT_COMPUTED_STATUS_META;
}
