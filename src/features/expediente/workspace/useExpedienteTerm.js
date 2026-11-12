import { useMemo } from 'react';
import dayjs from 'dayjs';
import { useClocksManager } from '../clocks/hooks/useClocksManager';
import { generateClocks } from '../clocks/config/clocks.definitions';
import { buildClockGroups, filterClocksAfterDesist, flattenClockRows } from '../clocks/utils/clockRows';
import { getFinishedPendingStatus } from './expedientePendingStatus';
import { LOADING_TERM, UNKNOWN_TERM, selectExpedienteTerm } from './expedienteTerm';

const EMPTY_ITEM = Object.freeze({});
const EMPTY_CLOCKS = Object.freeze([]);
const conGI = import.meta.env.VITE_GLOBAL_ID === 'cb1';
const namePayment = conGI ? 'Impuestos Municipales' : 'Impuesto Delineacion';

function parsePhaseOptions(clocks) {
  const stored = clocks.find((clock) => String(clock?.state) === '1001');
  try {
    return stored?.desc ? JSON.parse(stored.desc) : {};
  } catch {
    return {};
  }
}

/**
 * Legal term of a loaded expediente (`expedienteTerm` view-model), outside the Tiempos
 * module: the workspace header and the dock quick windows. It runs the same hooks with the
 * same inputs as the Tiempos module (`centralClocks.component`): the item, its clocks, today
 * and the stored notification route (`phase_options`, state 1001). Read-only.
 *
 * `expediente` must be the detail (`GET /fun/get/idpublic/:rad` or `GET /fun/:id`, both carry
 * `fun_clocks`). Without a clocks array the result is `UNKNOWN_TERM` ("Sin estado"), or
 * `LOADING_TERM` while `loading` is true. Recomputed whenever the clocks change, so a
 * refetched item updates every consumer at once.
 *
 * Note: the Tiempos module can emulate another date ("viaje en el tiempo"); that simulation
 * is local to the module, the header always uses the real date.
 */
export function useExpedienteTerm(expediente, { loading = false } = {}) {
  const hasDetail = Boolean(expediente) && Array.isArray(expediente.fun_clocks);
  const item = hasDetail ? expediente : EMPTY_ITEM;
  const clocks = hasDetail ? expediente.fun_clocks : EMPTY_CLOCKS;
  const today = dayjs().format('YYYY-MM-DD');

  const phaseOptions = useMemo(() => parsePhaseOptions(clocks), [clocks]);
  const manager = useClocksManager(item, clocks, undefined, today, phaseOptions);
  const { processPhases, isDesisted, curaduriaDetails } = manager;
  const processStatus = curaduriaDetails?.status ?? null;

  return useMemo(() => {
    if (!hasDetail) return loading ? LOADING_TERM : UNKNOWN_TERM;
    const definitions = filterClocksAfterDesist(
      generateClocks({ ...manager, currentItem: item, namePayment, conGI, phaseOptions }),
      isDesisted,
    );
    const pendingStatus = getFinishedPendingStatus({
      expedienteState: item.state,
      processPhases,
      isDesisted,
      eventRows: flattenClockRows(buildClockGroups(definitions, manager)),
    });
    return selectExpedienteTerm({ processPhases, processStatus, pendingStatus });
    // `manager` is a new object on every render; its helpers only read `clocks` and `item`.
  }, [hasDetail, loading, item, clocks, phaseOptions, processPhases, processStatus, isDesisted]);
}

export default useExpedienteTerm;
