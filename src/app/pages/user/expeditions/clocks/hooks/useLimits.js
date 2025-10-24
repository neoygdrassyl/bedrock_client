/**
 * Hook for computing limits for each row
 * Handles special cases like Acta 1 and suspension ends
 */

import moment from 'moment';
import { dateParser_dateDiff } from '../../../../../components/customClasses/typeParse';
import { computeActa1LimitSmart } from '../domain/clocksRules';
import {
  getClockState,
  getSuspensionPreActa,
  getSuspensionPostActa
} from '../selectors/clocksSelectors';
import { STATE_CODES } from '../constants/clocksConstants';

/**
 * Compute limit for suspension end states (350/351)
 * Shows remaining days from the 10-day quota
 * @param {Array} clocksData - Array of clock objects
 * @param {number} state - State code (350 or 351)
 * @param {string} currentDate - Current date from the row
 * @returns {Object} Limit display info
 */
export const computeSuspensionRemainingLimit = (clocksData, state, currentDate) => {
  const isEndPre = state === STATE_CODES.SUSP_PRE_END;
  const isEndPost = state === STATE_CODES.SUSP_POST_END;
  
  if (!isEndPre && !isEndPost) return null;

  const pre = getSuspensionPreActa(clocksData);
  const post = getSuspensionPostActa(clocksData);
  const today = moment().format('YYYY-MM-DD');

  // Calculate the "other" suspension's used days
  const otherUsed = isEndPre
    ? (post?.start?.date_start && post?.end?.date_start ? post.days : 0)
    : (pre?.start?.date_start && pre?.end?.date_start ? pre.days : 0);

  const thisStart = isEndPre ? pre?.start?.date_start : post?.start?.date_start;
  if (!thisStart) return { label: '-', tooltip: 'Sin fecha de inicio', className: 'text-muted' };

  const thisEnd = currentDate || '';
  const usedThis = thisEnd
    ? dateParser_dateDiff(thisStart, thisEnd)
    : dateParser_dateDiff(thisStart, today);

  const remaining = 10 - otherUsed - usedThis;
  const remainingClamped = remaining < 0 ? 0 : remaining;

  return {
    label: `${remainingClamped} días`,
    tooltip: `Total disponible: 10 días\nOtra suspensión: ${otherUsed} días\nEsta suspensión: ${usedThis} días\nRestantes: ${remainingClamped} días`,
    className: remaining < 0 ? 'text-danger' : 'text-primary'
  };
};

/**
 * Hook for computing limits
 * @param {Array} clocksData - Array of clock objects
 * @param {string} itemType - Type of item
 * @returns {Function} Function to get limit for a state
 */
export const useLimits = (clocksData, itemType) => {
  /**
   * Get limit for a specific state
   * @param {number} state - State code
   * @param {string} currentDate - Current date for the row
   * @returns {Object|null} Limit display info
   */
  const getLimit = (state, currentDate) => {
    // Special case: Acta 1 (state 30)
    if (state === STATE_CODES.ACTA_1) {
      const result = computeActa1LimitSmart(clocksData, itemType);
      if (!result) return { label: '-', tooltip: 'Sin LDF', className: 'text-danger' };
      return {
        label: result.limitDate,
        tooltip: result.tooltip,
        className: 'text-primary'
      };
    }

    // Special case: Suspension ends (350/351)
    if (state === STATE_CODES.SUSP_PRE_END || state === STATE_CODES.SUSP_POST_END) {
      return computeSuspensionRemainingLimit(clocksData, state, currentDate);
    }

    return null;
  };

  return { getLimit };
};
