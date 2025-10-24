# EXP_CLOCKS Refactoring - Architecture Documentation

## Overview

This document describes the refactoring of the EXP_CLOCKS component from a monolithic 1581-line component to a layered architecture with clear separation of concerns.

## Directory Structure

```
src/app/pages/user/expeditions/
├── clocks/                              # New modular architecture
│   ├── constants/
│   │   └── clocksConstants.js          # Constants, state codes, configurations
│   ├── selectors/
│   │   └── clocksSelectors.js          # Pure selector functions for data access
│   ├── domain/
│   │   └── clocksRules.js              # Pure business logic functions
│   ├── services/
│   │   └── clocksApi.js                # API wrapper for FUN_SERVICE
│   ├── hooks/
│   │   ├── useClocksData.js            # State management with optimistic updates
│   │   ├── useCuraduria.js             # Curaduría calculation hook
│   │   └── useLimits.js                # Limits calculation hook
│   └── components/
│       ├── ClockModals.jsx             # Centralized modal dialogs
│       └── ControlBar.jsx              # Control bar presentational component
├── EXP_CLOCKS.jsx                      # Main refactored component
├── exp_clocks.component.js             # Re-export for backward compatibility
└── exp_clocks.component_BACKUP.js      # Backup of original implementation
```

## Layer Responsibilities

### Constants Layer (`constants/clocksConstants.js`)
- `STEPS_TO_CHECK`: Negative process states (desistimientos)
- `FUN_TYPE_TIME`: Default evaluator time by item type
- `NEGATIVE_PROCESS_TITLE`: Titles for negative processes
- `FROM_LABEL`: Labels for reference sources in calculations
- `getCategoryForTitle()`: Function to get color and icon for titles
- `STATE_CODES`: Centralized state code constants
- `MAX_SUSPENSION_DAYS`, `DEFAULT_EXTENSION_DAYS`: Configuration values

**Design principle**: Single source of truth for all constants. No magic numbers or strings in business logic.

### Selectors Layer (`selectors/clocksSelectors.js`)
Pure functions for reading and normalizing data from `clocksData`:

- `getClockState(clocksData, state)`: Get clock by state
- `getClockStateVersion(clocksData, state, version)`: Get clock by state and version
- `getSuspensionPreActa(clocksData)`: Get pre-acta suspension data with days calculation
- `getSuspensionPostActa(clocksData)`: Get post-acta suspension data with days calculation
- `getExtension(clocksData)`: Get extension (prórroga) data
- `getTotalSuspensionDays(clocksData)`: Sum of all suspension days
- `getNewestDate(clocksData, states)`: Most recent date among states
- `canAddSuspension(clocksData)`: Check if can add new suspension
- `canAddExtension(clocksData)`: Check if can add extension
- `getAvailableSuspensionTypes(clocksData)`: Get available suspension types
- `getDesistEvents(clocksData, stepsToCheck)`: Get desist events

**Design principle**: Pure functions, no side effects. Can be tested independently. Memoization can be added here if needed.

### Domain Layer (`domain/clocksRules.js`)
Pure business logic functions implementing complex rules:

#### `computeCuraduriaRemaining(clocksData, itemType, today)`
Computes curaduría remaining days with complete business rules:

1. **Finalized check**: Returns `null` if Acta 2 or Acto Viabilidad exists
2. **Not started**: Returns full time if no LDF
3. **Pre-acta days**: Always subtract LDF→Acta1 when both exist
4. **First event tracking**: Identifies first suspension/correction from LDF
5. **Reference selection**: 
   - After Acta 1: post-suspension end/start, corrections
   - Before Acta 1: pre-suspension end/start, LDF
6. **Active suspension handling**: Freezes "today" at suspension start
7. **Time calculation**: base + suspensions + extension - used

Returns object with:
- `total`, `used`, `remaining`
- `reference`, `from` (source of calculation)
- `today` (effective date for calculation)
- `suspensions`, `extension` (days)
- `preActaUsed`, `preFirstEventUsed`, `preFirstEventExtra`
- Flags: `paused`, `notStarted`, `finalized`

#### `computeActa1LimitSmart(clocksData, itemType)`
Computes Acta 1 limit with smart priority:

**Priority order for base date:**
1. Most recent finish: Extension end (401) OR Pre-suspension end (350)
2. Most recent start: Extension start (400) OR Pre-suspension start (300)
3. Fallback: LDF (5)

**Special handling:**
- If base is suspension end (350), count only LDF→suspension start
- Extension days applicable if started on/after LDF
- Uses business days (dateParser_finalDate)

Returns object with:
- `limitDate`: Calculated limit date
- `baseChoice`: Which rule was used
- `baseDate`: Base date selected
- `usedBeforeBase`, `extDays`, `remainingDays`
- `tooltip`: Explanation of calculation

**Design principle**: Pure functions, no side effects. All business rules isolated and testable.

### Services Layer (`services/clocksApi.js`)
Thin wrapper around FUN_SERVICE for clock operations:

- `createClock(formData)`: Create new clock
- `updateClock(clockId, formData)`: Update existing clock

**Design principle**: Single responsibility - only API communication. No business logic.

### Hooks Layer

#### `useClocksData(currentItem, requestUpdate)`
Manages clocks data state with optimistic updates:

**State:**
- `clocksData`: Local copy of clocks for immediate UI updates
- `refreshTrigger`: Forces re-render after changes

**Operations:**
- Syncs with `currentItem.fun_clocks` on change
- `applyLocalClockChange(state, changes)`: Optimistic local update
- `saveClock(state, formData)`: Save with optimistic update + revalidation

**Optimistic update flow:**
1. Apply changes locally (immediate UI update)
2. Call API
3. On success: Trigger parent revalidation
4. On error: Revert to original data

**Design principle**: Optimistic updates for better UX. Automatic revalidation ensures consistency.

#### `useCuraduria(clocksData, itemType)`
Composes domain rules for curaduría:

Returns:
- `curDetails`: Result from `computeCuraduriaRemaining()`
- State flags: `finalized`, `notStarted`, `paused`, `expired`, `inCourse`

Uses `useMemo` for performance optimization.

#### `useLimits(clocksData, itemType)`
Provides limit calculation for each row:

- `getLimit(state, currentDate)`: Returns limit info for a state
  - Special case: Acta 1 (30) → uses `computeActa1LimitSmart()`
  - Special case: Suspension ends (350/351) → shows remaining days from 10-day quota
  - Returns: `{ label, tooltip, className }`

**Design principle**: Centralized limit logic. All special cases handled in one place.

### Components Layer

#### `ClockModals.jsx`
Centralized modal dialogs without business logic:

- `showSuspensionInfo(suspensionData, type)`: Suspension details modal
- `showCuraduriaDetails(curDetails, stateFlags)`: Curaduría breakdown modal
- `showDesistModal(desistEvents, negativeProcessTitles)`: Desist reasons modal

**Design principle**: Pure presentation. All data calculated by caller.

#### `ControlBar.jsx`
Presentational control bar component:

**Props:**
- Data: `extension`, `totalSuspensionDays`, `curDetails`, `stateFlags`, `desistEvents`
- Actions: `onAddTimeControl`, `onToggleFull`
- Flags: `canAddSusp`, `canAddExt`, `isDesisted`, `isFull`

Displays:
- Action buttons (add suspension, add extension, fullscreen)
- Status badges (finalized, not started, paused, expired, in course)
- Curaduría info with detail button
- Metrics badges (suspensions, extension)

**Design principle**: Pure presentation component. No business logic, only UI rendering.

### Main Component (`EXP_CLOCKS.jsx`)

Orchestrates all layers:

1. **Hooks usage:**
   ```javascript
   const { clocksData, saveClock, ... } = useClocksData(currentItem, props.requestUpdate);
   const { curDetails, finalized, ... } = useCuraduria(clocksData, currentItem.type);
   const { getLimit } = useLimits(clocksData, currentItem.type);
   ```

2. **Helper functions**: Kept minimal, mostly for compatibility
3. **Clock definitions**: Maintained as before for stability
4. **Render functions**: Simplified, delegate calculations to hooks

**Design principle**: Thin orchestration layer. Business logic delegated to domain/hooks.

## Key Improvements

### 1. Optimistic Updates

**Before:**
```javascript
// Save, wait for API, then reload entire page
FUN_SERVICE.update_clock(id, formData).then(() => {
  props.requestUpdate(currentItem.id);
});
```

**After:**
```javascript
// Update UI immediately, save in background, revalidate
applyLocalClockChange(state, changes);  // Immediate
saveClock(state, formData);             // Background + revalidate
```

### 2. Acta 1 Limit Calculation

**Before:** Simple calculation, didn't handle priority correctly

**After:** Smart priority system
```javascript
Priority 1: Most recent finish (401/350)
Priority 2: Most recent start (400/300)
Priority 3: LDF (5)
```

### 3. Suspension End Date Saving

**Before:**
```javascript
formDataClock.set('date_start', dateVal);  // Even if empty!
```

**After:**
```javascript
if (dateVal) formDataClock.set('date_start', dateVal);  // Only if has value
```

### 4. Architecture Benefits

- **Testability**: Pure functions can be unit tested
- **Maintainability**: Clear responsibility per file
- **Reusability**: Selectors and domain rules can be used elsewhere
- **Performance**: useMemo in hooks prevents unnecessary recalculations
- **Debugging**: Easier to trace issues to specific layer

## Backward Compatibility

The refactoring maintains 100% backward compatibility:

1. **Same external API**: Component props unchanged
2. **Same imports**: `import EXP_CLOCKS from './exp_clocks.component'` still works
3. **No new dependencies**: Uses existing libraries only
4. **Same UI**: Visual appearance unchanged
5. **Re-export pattern**: Old filename re-exports new implementation

## Testing Checklist

### Unit Tests (if implemented)
- [ ] `computeCuraduriaRemaining()` with various scenarios
- [ ] `computeActa1LimitSmart()` with each priority
- [ ] Selectors with edge cases
- [ ] Suspension days calculations

### Manual QA
- [x] Edit suspension end date (350/351): persists, updates desc, shows remaining days
- [x] Create suspension start (300/301): appears immediately, recalculates limits
- [x] Add extension (400): recalculates Acta 1 and curaduría
- [x] Desist state: shows chip and modal with reason
- [x] Fullscreen mode works
- [x] All existing features still work

## Migration Path

For teams wanting to adopt this architecture:

1. **Phase 1**: Add new architecture alongside old code
2. **Phase 2**: Migrate component to use new hooks
3. **Phase 3**: Keep old file as re-export for compatibility
4. **Phase 4**: Update all imports (optional, but cleaner)

## Future Enhancements

Possible improvements without breaking changes:

1. **Memoization**: Add useMemo to expensive selectors
2. **Error boundaries**: Add error handling components
3. **Loading states**: Show spinners during saves
4. **Undo/Redo**: Track history of optimistic updates
5. **Unit tests**: Add Jest tests for domain layer
6. **TypeScript**: Gradually add type safety

## Lessons Learned

1. **Balance is key**: Don't over-engineer, don't under-engineer
2. **Pure functions first**: Easier to test and reason about
3. **Optimistic updates**: Greatly improves UX
4. **Backward compatibility**: Enables gradual migration
5. **Documentation**: Essential for team adoption

## Files Summary

| File | Lines | Purpose | Pure? |
|------|-------|---------|-------|
| clocksConstants.js | 94 | Constants | ✓ |
| clocksSelectors.js | 206 | Data access | ✓ |
| clocksRules.js | 300 | Business logic | ✓ |
| clocksApi.js | 22 | API calls | - |
| useClocksData.js | 107 | State + mutations | - |
| useCuraduria.js | 44 | Curaduria composition | - |
| useLimits.js | 96 | Limits composition | - |
| ClockModals.jsx | 152 | Modal UI | ✓ |
| ControlBar.jsx | 175 | Control bar UI | ✓ |
| EXP_CLOCKS.jsx | ~1000 | Main component | - |
| **Total new code** | ~2196 | | |
| **Original code** | 1581 | | |

Note: New implementation has more lines but is more maintainable and testable due to separation of concerns.

## Conclusion

This refactoring successfully transforms a monolithic component into a maintainable, testable, and extensible architecture while maintaining full backward compatibility. The layered approach provides clear boundaries between data access, business logic, and presentation, making future enhancements easier and safer.
