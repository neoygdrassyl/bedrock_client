/**
 * "Process finished with pending records": presentation-only status of the expediente
 * workspace. Nothing here changes how phases, terms or limits are computed.
 *
 * Problem it solves: the phase model marks as current the first phase that has a start
 * and no end. When an intermediate date was never registered (for example "Notificación
 * Personal (Viabilidad)"), that phase stays open forever, so an expediente whose licence
 * was delivered months ago keeps reading "Vencido hace N días hábiles", one more every day.
 *
 * A process is FINISHED when one of the signals the app already trusts says so:
 *   1. `closed-state`: the expediente state is >= 100 (100 expedida, 101 archivada,
 *      200+ archivo). A person closed it; the rest of the app already reads `state >= 100`
 *      as closed (`fun_moduleNav`, `funmanage.page`, and the backend summary falls back to
 *      "COMPLETADO" on `entregaDate || fun0.state >= 100`).
 *   2. `last-phase`: the last phase of the calculated flow is COMPLETADO and the process
 *      is not a desistimiento. It is the exact condition of the "Proceso finalizado" chip
 *      of the Tiempos module (`curaduriaDetails.status === 'FINALIZADO'`): ejecutoria and
 *      entrega de licencia are both registered.
 * Either one is enough: (1) covers closed expedientes whose delivery date was never
 * registered, (2) covers delivered expedientes nobody closed yet.
 *
 * The status is PENDING only when the process is finished AND at least one phase is still
 * open. Conservative by design: unknown state, no phases, or nothing open returns
 * `pending: false`, and the regular "Vencido / En término" presentation applies.
 */

export const CLOSED_EXPEDIENTE_STATE = 100;

/** Same shape as `EXPEDIENTE_STATUS_META` entries; calm tone, never danger. */
export const PENDING_STATUS_META = Object.freeze({
  label: 'Pendiente',
  tone: 'warning',
  badgeClass: 'border-warning/30 bg-warning/10 text-warning',
  barClass: 'bg-warning/60',
  dotClass: 'bg-warning',
});

const NOT_PENDING = Object.freeze({ finished: false, pending: false, signal: null, count: 0, items: [], openPhases: [] });

export function isExpedienteClosedState(state) {
  if (state === null || state === undefined || state === '') return false;
  const value = Number(state);
  return Number.isFinite(value) && value >= CLOSED_EXPEDIENTE_STATE;
}

/** Which trusted signal says the process is over, or `null` when none does. */
export function getFinishedSignal({ expedienteState, processPhases, isDesisted = false } = {}) {
  if (isExpedienteClosedState(expedienteState)) return 'closed-state';
  const phases = Array.isArray(processPhases) ? processPhases : [];
  const lastPhase = phases[phases.length - 1];
  if (lastPhase?.status === 'COMPLETADO' && isDesisted !== true) return 'last-phase';
  return null;
}

const sameState = (a, b) => a !== false && a !== null && a !== undefined && String(a) === String(b);

/**
 * Events without a registered date that keep a phase open.
 *
 * The phase model does not say which event closes a phase, only which events belong to it
 * (`relatedStates`). So, for every phase that is not completed and has no end date, the
 * candidates are its visible events without a date: the required ones, or, when all the
 * required ones are registered, the last optional one (for example the "por aviso"
 * notification when that is the one that ends the phase). A phase that already has an end
 * date but no start is blocked by an earlier phase and adds nothing of its own.
 *
 * `eventRows`: `{ index, state, name, hasDate, optional, hidden, limitDate }[]` in table order.
 */
export function getPendingEvents({ processPhases, eventRows } = {}) {
  const phases = Array.isArray(processPhases) ? processPhases : [];
  const rows = (Array.isArray(eventRows) ? eventRows : []).filter((row) => !row.hidden && !row.hasDate);
  const taken = new Set();
  const items = [];

  phases.forEach((phase) => {
    if (!phase || phase.status === 'COMPLETADO' || phase.endDate) return;
    const related = (phase.relatedStates || []).filter((state) => state !== false && state !== null && state !== undefined);
    const candidates = rows.filter((row) => !taken.has(row.index) && related.some((state) => sameState(state, row.state)));
    const required = candidates.filter((row) => !row.optional);
    const chosen = required.length ? required : candidates.slice(-1);
    chosen.forEach((row) => {
      taken.add(row.index);
      items.push({
        key: `${phase.id}:${row.index}`,
        index: row.index,
        state: row.state,
        name: row.name,
        groupTitle: row.groupTitle,
        limitDate: row.limitDate || null,
        phaseId: phase.id,
        phaseTitle: phase.title,
      });
    });
  });

  return items;
}

/**
 * Full decision from the calculated phases (Tiempos module; workspace header and dock
 * through `workspace/useExpedienteTerm`).
 */
export function getFinishedPendingStatus({ expedienteState, processPhases, isDesisted = false, eventRows } = {}) {
  const phases = Array.isArray(processPhases) ? processPhases : [];
  if (phases.length === 0) return NOT_PENDING;
  const signal = getFinishedSignal({ expedienteState, processPhases: phases, isDesisted });
  if (!signal) return NOT_PENDING;

  const openPhases = phases.filter((phase) => phase && phase.status !== 'COMPLETADO');
  if (openPhases.length === 0) return { ...NOT_PENDING, finished: true, signal };

  const items = getPendingEvents({ processPhases: phases, eventRows });
  return { finished: true, pending: true, signal, count: items.length, items, openPhases };
}

/** "2 pendientes por registrar"; without a known count, "registros pendientes". */
export function describePendingCount(count) {
  if (!Number.isFinite(count) || count <= 0) return 'registros pendientes';
  return `${count} pendiente${count === 1 ? '' : 's'} por registrar`;
}

/** Headline that replaces "Vencido hace N días hábiles". */
export function describePendingTerm(count) {
  return `Proceso finalizado · ${describePendingCount(count)}`;
}

/** Compact figure for narrow headers: "2 pend." */
export function describePendingShort(count) {
  return Number.isFinite(count) && count > 0 ? `${count} pend.` : 'Pend.';
}
