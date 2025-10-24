/**
 * Hook for managing clocks data state
 * Handles local state, optimistic updates, and revalidation
 */

import { useState, useEffect } from 'react';
import { createClock, updateClock } from '../services/clocksApi';
import { getClockState } from '../selectors/clocksSelectors';

/**
 * Hook for managing clocks data with optimistic updates
 * @param {Object} currentItem - Current item with fun_clocks
 * @param {Function} requestUpdate - Function to trigger parent update
 * @returns {Object} Clock data state and operations
 */
export const useClocksData = (currentItem, requestUpdate) => {
  const [clocksData, setClocksData] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Sync local state with currentItem.fun_clocks
  useEffect(() => {
    if (currentItem?.fun_clocks) {
      setClocksData([...currentItem.fun_clocks]);
      setRefreshTrigger(prev => prev + 1);
    }
  }, [currentItem?.fun_clocks]);

  /**
   * Apply local optimistic change
   * @param {number} state - State code
   * @param {Object} changes - Changes to apply
   */
  const applyLocalClockChange = (state, changes) => {
    setClocksData(prev => {
      const arr = Array.isArray(prev) ? [...prev] : [];
      const idx = arr.findIndex(c => c.state == state);
      if (idx >= 0) {
        arr[idx] = { ...arr[idx], ...changes, state };
      } else {
        arr.push({ ...changes, state });
      }
      return arr;
    });
    setRefreshTrigger(p => p + 1);
  };

  /**
   * Save a clock (create or update)
   * @param {number} state - State code
   * @param {FormData} formData - Form data to save
   * @param {boolean} showAlert - Whether to show alert
   * @returns {Promise} Save operation promise
   */
  const saveClock = (state, formData, showAlert = false) => {
    const existingClock = getClockState(clocksData, state);
    
    // Don't send empty date_start to avoid clearing dates
    const dateStart = formData.get('date_start');
    if (!dateStart || String(dateStart).trim() === '') {
      formData.delete('date_start');
    }

    formData.set('fun0Id', currentItem.id);
    formData.set('state', state);

    // Optimistic update
    const optimisticChanges = {};
    for (let pair of formData.entries()) {
      if (pair[0] !== 'fun0Id') {
        optimisticChanges[pair[0]] = pair[1];
      }
    }
    applyLocalClockChange(state, optimisticChanges);

    // API call
    const apiCall = existingClock && existingClock.id
      ? updateClock(existingClock.id, formData)
      : createClock(formData);

    return apiCall.then(r => {
      if (r.data === 'OK') {
        // Revalidate after successful save
        if (requestUpdate) {
          requestUpdate(currentItem.id);
          // Double revalidation with slight delay for optimistic updates
          setTimeout(() => {
            requestUpdate(currentItem.id);
          }, 150);
        }
        setRefreshTrigger(p => p + 1);
        return { success: true };
      }
      throw new Error('Save failed');
    }).catch(e => {
      console.error('Error saving clock:', e);
      // Revert optimistic update on error
      if (currentItem?.fun_clocks) {
        setClocksData([...currentItem.fun_clocks]);
      }
      return { success: false, error: e };
    });
  };

  return {
    clocksData,
    setClocksData,
    refreshTrigger,
    setRefreshTrigger,
    applyLocalClockChange,
    saveClock
  };
};
