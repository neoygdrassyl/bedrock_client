/**
 * Hook for computing curaduría details
 * Composes selectors and domain rules
 */

import { useMemo } from 'react';
import moment from 'moment';
import { computeCuraduriaRemaining } from '../domain/clocksRules';
import { getClockState } from '../selectors/clocksSelectors';
import { STATE_CODES } from '../constants/clocksConstants';

/**
 * Hook for computing curaduría state and details
 * @param {Array} clocksData - Array of clock objects
 * @param {string} itemType - Type of item (i, ii, iii, iv, oa)
 * @returns {Object} Curaduría details and state flags
 */
export const useCuraduria = (clocksData, itemType) => {
  return useMemo(() => {
    const curDetails = computeCuraduriaRemaining(clocksData, itemType, moment().format('YYYY-MM-DD'));
    
    const acta2Clock = getClockState(clocksData, STATE_CODES.ACTA_2);
    const actoViab = getClockState(clocksData, STATE_CODES.ACTO_VIABILIDAD);

    // State flags
    const finalized = !!(acta2Clock?.date_start || actoViab?.date_start || curDetails === null);
    const notStarted = !!(curDetails && curDetails.notStarted);
    const paused = !!(curDetails && curDetails.paused);
    const expired = !!(curDetails && !paused && !notStarted && curDetails.remaining < 0);
    const inCourse = !!(curDetails && !paused && !notStarted && curDetails.remaining >= 0);

    return {
      curDetails,
      finalized,
      notStarted,
      paused,
      expired,
      inCourse
    };
  }, [clocksData, itemType]);
};
