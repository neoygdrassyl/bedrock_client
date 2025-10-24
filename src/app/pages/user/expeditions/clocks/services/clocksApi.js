/**
 * API services for clocks operations
 * Wrapper around FUN_SERVICE for clock-specific operations
 */

import FUN_SERVICE from '../../../../../services/fun.service';

/**
 * Create a new clock
 * @param {FormData} formData - Form data with clock information
 * @returns {Promise} API response
 */
export const createClock = (formData) => {
  return FUN_SERVICE.create_clock(formData);
};

/**
 * Update an existing clock
 * @param {number} clockId - ID of the clock to update
 * @param {FormData} formData - Form data with updated information
 * @returns {Promise} API response
 */
export const updateClock = (clockId, formData) => {
  return FUN_SERVICE.update_clock(clockId, formData);
};
