/**
 * Selectors for reading and normalizing clock data
 * Pure functions that extract information from clocksData
 */

import moment from 'moment';
import { dateParser_dateDiff } from '../../../../../components/customClasses/typeParse';
import { STATE_CODES, DEFAULT_EXTENSION_DAYS } from '../constants/clocksConstants';

/**
 * Get clock by state
 * @param {Array} clocksData - Array of clock objects
 * @param {number|string} state - State code to find
 * @returns {Object|false} Clock object or false if not found
 */
export const getClockState = (clocksData, state) => {
  if (!Array.isArray(clocksData) || state == null) return false;
  for (let i = 0; i < clocksData.length; i++) {
    if (clocksData[i].state == state) return clocksData[i];
  }
  return false;
};

/**
 * Get clock by state and version
 * @param {Array} clocksData - Array of clock objects
 * @param {number|string} state - State code to find
 * @param {number|string} version - Version to match
 * @returns {Object|false} Clock object or false if not found
 */
export const getClockStateVersion = (clocksData, state, version) => {
  if (!Array.isArray(clocksData) || state == null) return false;
  for (let i = 0; i < clocksData.length; i++) {
    if (clocksData[i].state == state && clocksData[i].version == version) {
      return clocksData[i];
    }
  }
  return false;
};

/**
 * Get pre-acta suspension data
 * @param {Array} clocksData - Array of clock objects
 * @returns {Object} Suspension data with exists, start, end, days
 */
export const getSuspensionPreActa = (clocksData) => {
  const startClock = getClockState(clocksData, STATE_CODES.SUSP_PRE_START);
  const endClock = getClockState(clocksData, STATE_CODES.SUSP_PRE_END);
  
  return {
    exists: startClock && startClock.date_start,
    start: startClock,
    end: endClock,
    days: startClock?.date_start && endClock?.date_start
      ? dateParser_dateDiff(startClock.date_start, endClock.date_start)
      : (startClock?.date_start ? dateParser_dateDiff(startClock.date_start, moment().format('YYYY-MM-DD')) : 0)
  };
};

/**
 * Get post-acta suspension data
 * @param {Array} clocksData - Array of clock objects
 * @returns {Object} Suspension data with exists, start, end, days
 */
export const getSuspensionPostActa = (clocksData) => {
  const startClock = getClockState(clocksData, STATE_CODES.SUSP_POST_START);
  const endClock = getClockState(clocksData, STATE_CODES.SUSP_POST_END);
  
  return {
    exists: startClock && startClock.date_start,
    start: startClock,
    end: endClock,
    days: startClock?.date_start && endClock?.date_start
      ? dateParser_dateDiff(startClock.date_start, endClock.date_start)
      : (startClock?.date_start ? dateParser_dateDiff(startClock.date_start, moment().format('YYYY-MM-DD')) : 0)
  };
};

/**
 * Get extension (prórroga) data
 * @param {Array} clocksData - Array of clock objects
 * @returns {Object} Extension data with exists, start, end, days
 */
export const getExtension = (clocksData) => {
  const startClock = getClockState(clocksData, STATE_CODES.EXT_START);
  const endClock = getClockState(clocksData, STATE_CODES.EXT_END);
  
  return {
    exists: startClock && startClock.date_start,
    start: startClock,
    end: endClock,
    days: startClock?.date_start && endClock?.date_start 
      ? dateParser_dateDiff(startClock.date_start, endClock.date_start) 
      : DEFAULT_EXTENSION_DAYS
  };
};

/**
 * Get total suspension days (pre + post)
 * @param {Array} clocksData - Array of clock objects
 * @returns {number} Total days of suspension
 */
export const getTotalSuspensionDays = (clocksData) => {
  const preSusp = getSuspensionPreActa(clocksData);
  const postSusp = getSuspensionPostActa(clocksData);
  return (preSusp.days || 0) + (postSusp.days || 0);
};

/**
 * Get the newest date among a list of states
 * @param {Array} clocksData - Array of clock objects
 * @param {Array<number>} states - Array of state codes to check
 * @returns {string|null} Most recent date or null
 */
export const getNewestDate = (clocksData, states) => {
  let newDate = null;
  states.forEach((state) => {
    const clock = getClockState(clocksData, state);
    const date = clock ? clock.date_start : null;
    if (!newDate && date) newDate = date;
    else if (date && moment(date).isAfter(newDate)) newDate = date;
  });
  return newDate;
};

/**
 * Check if can add suspension
 * @param {Array} clocksData - Array of clock objects
 * @returns {boolean} True if can add suspension
 */
export const canAddSuspension = (clocksData) => {
  const totalDays = getTotalSuspensionDays(clocksData);
  const preSusp = getSuspensionPreActa(clocksData);
  const postSusp = getSuspensionPostActa(clocksData);
  const acta2 = getClockState(clocksData, STATE_CODES.ACTA_2);
  const ldf = getClockState(clocksData, STATE_CODES.LDF);
  
  if (totalDays >= 10) return false;
  if (preSusp.exists && postSusp.exists) return false;
  if (acta2?.date_start || !ldf?.date_start) return false;
  return true;
};

/**
 * Get available suspension types
 * @param {Array} clocksData - Array of clock objects
 * @returns {Array} Array of available suspension types
 */
export const getAvailableSuspensionTypes = (clocksData) => {
  const preSusp = getSuspensionPreActa(clocksData);
  const postSusp = getSuspensionPostActa(clocksData);
  const acta1 = getClockState(clocksData, STATE_CODES.ACTA_1);
  const types = [];
  
  if (!preSusp.exists) {
    types.push({ value: 'pre', label: 'Antes del Acta de Observaciones', available: true });
  }
  if (!postSusp.exists && acta1?.date_start) {
    types.push({ value: 'post', label: 'Después del Acta de Observaciones', available: true });
  }
  return types;
};

/**
 * Check if can add extension
 * @param {Array} clocksData - Array of clock objects
 * @returns {boolean} True if can add extension
 */
export const canAddExtension = (clocksData) => {
  const extension = getExtension(clocksData);
  const acta2 = getClockState(clocksData, STATE_CODES.ACTA_2);
  const ldf = getClockState(clocksData, STATE_CODES.LDF);
  
  if (acta2?.date_start || !ldf?.date_start) return false;
  return !extension.exists;
};

/**
 * Get desist events (desistimientos)
 * @param {Array} clocksData - Array of clock objects
 * @param {Array<string>} stepsToCheck - Steps to check for desist
 * @returns {Array} Array of desist events
 */
export const getDesistEvents = (clocksData, stepsToCheck) => {
  if (!Array.isArray(clocksData)) return [];
  return clocksData.filter(c => c?.date_start && stepsToCheck.includes(String(c.state)));
};
