/**
 * EXP_CLOCKS Component - Re-export of refactored version
 * This file now imports the refactored component to maintain backward compatibility
 */

import EXP_CLOCKS from './EXP_CLOCKS';

export default EXP_CLOCKS;

/* 
 * Original implementation has been refactored to ./EXP_CLOCKS.jsx
 * with layered architecture: constants, selectors, domain, services, hooks, components
 * 
 * Backup of original version saved in exp_clocks.component_BACKUP.js
 * 
 * The refactored version includes:
 * - Optimistic UI updates
 * - Proper calculation of Acta 1 limit with suspensions/extensions priority
 * - Fixed suspension end date saving (no empty date_start)
 * - Immediate table refresh after save/create
 * - Layered architecture with separation of concerns
 */
