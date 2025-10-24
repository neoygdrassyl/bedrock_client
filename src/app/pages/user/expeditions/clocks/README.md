# Clocks Module

Modular architecture for expedition clocks (EXP_CLOCKS) with layered design and optimistic updates.

## Quick Start

```javascript
// Use the refactored component (automatic via re-export)
import EXP_CLOCKS from './exp_clocks.component';

// Or use directly
import EXP_CLOCKS from './EXP_CLOCKS';
```

## Architecture

The module is organized in layers with clear responsibilities:

```
clocks/
├── constants/       # Constants and configurations (pure)
├── selectors/       # Data access functions (pure)
├── domain/          # Business logic rules (pure)
├── services/        # API communication
├── hooks/           # React hooks for state and logic composition
└── components/      # Presentational components
```

## Key Features

### 1. Optimistic Updates
Changes appear immediately in the UI, then sync with the server:

```javascript
// User edits date → UI updates instantly → Save to server → Revalidate
```

### 2. Smart Acta 1 Limit Calculation
Priority-based calculation considering suspensions and extensions:

```
Priority 1: Most recent finish (Extension end 401 OR Suspension end 350)
Priority 2: Most recent start (Extension start 400 OR Suspension start 300)
Priority 3: LDF (5)
```

### 3. Layered Architecture
Each layer has a single responsibility:
- **Constants**: Static values
- **Selectors**: Reading data
- **Domain**: Business rules
- **Services**: API calls
- **Hooks**: State management
- **Components**: UI rendering

## Usage Examples

### Using Selectors

```javascript
import { getClockState, getSuspensionPreActa } from './clocks/selectors/clocksSelectors';

const ldf = getClockState(clocksData, 5);
const suspension = getSuspensionPreActa(clocksData);
console.log('Suspension days:', suspension.days);
```

### Using Domain Rules

```javascript
import { computeCuraduriaRemaining } from './clocks/domain/clocksRules';

const details = computeCuraduriaRemaining(clocksData, 'iii', '2024-01-15');
console.log('Remaining days:', details.remaining);
console.log('State:', details.notStarted ? 'Not started' : 'In progress');
```

### Using Hooks

```javascript
import { useClocksData } from './clocks/hooks/useClocksData';
import { useCuraduria } from './clocks/hooks/useCuraduria';

function MyComponent({ currentItem, requestUpdate }) {
  const { clocksData, saveClock } = useClocksData(currentItem, requestUpdate);
  const { curDetails, expired, inCourse } = useCuraduria(clocksData, currentItem.type);
  
  return (
    <div>
      Status: {expired ? 'Expired' : inCourse ? 'In progress' : 'Unknown'}
      Remaining: {curDetails?.remaining} days
    </div>
  );
}
```

## API Reference

### Constants

```javascript
import { 
  STATE_CODES,           // { LDF: 5, ACTA_1: 30, ... }
  FUN_TYPE_TIME,         // { 'i': 20, 'ii': 25, ... }
  MAX_SUSPENSION_DAYS,   // 10
  getCategoryForTitle    // (title) => { color, icon }
} from './constants/clocksConstants';
```

### Selectors

All selectors are pure functions:

```javascript
getClockState(clocksData, state)
getSuspensionPreActa(clocksData)
getSuspensionPostActa(clocksData)
getExtension(clocksData)
getTotalSuspensionDays(clocksData)
canAddSuspension(clocksData)
canAddExtension(clocksData)
```

### Domain Rules

Pure business logic functions:

```javascript
computeCuraduriaRemaining(clocksData, itemType, today)
// Returns: { total, used, remaining, reference, from, today, ... }

computeActa1LimitSmart(clocksData, itemType)
// Returns: { limitDate, baseChoice, baseDate, tooltip, ... }
```

### Hooks

#### `useClocksData(currentItem, requestUpdate)`

Manages clock state with optimistic updates.

**Returns:**
- `clocksData`: Current clocks array
- `refreshTrigger`: Trigger value for forcing re-renders
- `applyLocalClockChange(state, changes)`: Apply local change
- `saveClock(state, formData)`: Save with optimistic update

#### `useCuraduria(clocksData, itemType)`

Computes curaduría details and state flags.

**Returns:**
- `curDetails`: Detailed calculation object
- `finalized`, `notStarted`, `paused`, `expired`, `inCourse`: State flags

#### `useLimits(clocksData, itemType)`

Provides limit calculations for each state.

**Returns:**
- `getLimit(state, currentDate)`: Get limit info for a state

### Components

#### `<ControlBar />`

Presentational control bar.

**Props:**
```javascript
{
  extension: { exists, days, ... },
  totalSuspensionDays: number,
  canAddSusp: boolean,
  canAddExt: boolean,
  onAddTimeControl: (type) => void,
  curDetails: object,
  stateFlags: { finalized, notStarted, ... },
  desistEvents: array,
  isDesisted: boolean,
  onToggleFull: () => void,
  isFull: boolean
}
```

#### Modal Functions

```javascript
import { 
  showSuspensionInfo, 
  showCuraduriaDetails, 
  showDesistModal 
} from './components/ClockModals';

showSuspensionInfo(suspensionData, 'pre');
showCuraduriaDetails(curDetails, stateFlags);
showDesistModal(desistEvents, NEGATIVE_PROCESS_TITLE);
```

## Testing

### Unit Testing Selectors

```javascript
import { getSuspensionPreActa } from './selectors/clocksSelectors';

describe('getSuspensionPreActa', () => {
  it('calculates days between start and end', () => {
    const clocksData = [
      { state: 300, date_start: '2024-01-01' },
      { state: 350, date_start: '2024-01-10' }
    ];
    const result = getSuspensionPreActa(clocksData);
    expect(result.exists).toBe(true);
    expect(result.days).toBeGreaterThan(0);
  });
});
```

### Unit Testing Domain Rules

```javascript
import { computeCuraduriaRemaining } from './domain/clocksRules';

describe('computeCuraduriaRemaining', () => {
  it('returns not started when no LDF', () => {
    const clocksData = [];
    const result = computeCuraduriaRemaining(clocksData, 'iii', '2024-01-15');
    expect(result.notStarted).toBe(true);
    expect(result.used).toBe(0);
  });
});
```

## Migration Guide

### From Monolithic Component

If you have code using the old monolithic structure:

**Before:**
```javascript
// Inside massive EXP_CLOCKS component
const suspension = _GET_SUSPENSION_PRE_ACTA();
const totalDays = suspension.days;
```

**After:**
```javascript
// Using selectors
import { getSuspensionPreActa } from './clocks/selectors/clocksSelectors';

const suspension = getSuspensionPreActa(clocksData);
const totalDays = suspension.days;
```

### Adding New Clock States

1. Add constant to `constants/clocksConstants.js`:
```javascript
export const STATE_CODES = {
  // ...existing
  MY_NEW_STATE: 999,
};
```

2. Add selector if needed (optional):
```javascript
export const getMyNewState = (clocksData) => {
  return getClockState(clocksData, STATE_CODES.MY_NEW_STATE);
};
```

3. Add to clock definitions in `EXP_CLOCKS.jsx`:
```javascript
{ 
  state: STATE_CODES.MY_NEW_STATE, 
  name: 'My New State', 
  desc: 'Description',
  // ...options
}
```

## Best Practices

### 1. Keep Functions Pure

✅ **Good:**
```javascript
export const computeTotal = (clocksData, type) => {
  const base = FUN_TYPE_TIME[type] ?? 45;
  const suspension = getTotalSuspensionDays(clocksData);
  return base + suspension;
};
```

❌ **Bad:**
```javascript
export const computeTotal = (type) => {
  const suspension = getTotalSuspensionDays(window.globalClocksData);
  return FUN_TYPE_TIME[type] + suspension;
};
```

### 2. Use Selectors for Data Access

✅ **Good:**
```javascript
const ldf = getClockState(clocksData, STATE_CODES.LDF);
```

❌ **Bad:**
```javascript
const ldf = clocksData.find(c => c.state === 5);
```

### 3. Compose with Hooks

✅ **Good:**
```javascript
const { clocksData } = useClocksData(currentItem, requestUpdate);
const { curDetails } = useCuraduria(clocksData, type);
```

❌ **Bad:**
```javascript
const [clocksData, setClocksData] = useState([]);
const curDetails = computeCuraduriaRemaining(clocksData, type);
// Missing optimistic updates, revalidation, etc.
```

## Troubleshooting

### Issue: Changes don't appear immediately

**Cause:** Not using optimistic updates
**Solution:** Use `saveClock()` from `useClocksData` hook instead of calling API directly

### Issue: Acta 1 limit incorrect

**Check:**
1. Suspension/extension dates are correct
2. LDF date exists
3. Using `getLimit()` from `useLimits` hook

### Issue: Table doesn't refresh

**Cause:** Not triggering revalidation
**Solution:** Ensure `requestUpdate()` is called after successful save

## Performance Tips

1. **Use memoization** for expensive calculations:
```javascript
const curDetails = useMemo(
  () => computeCuraduriaRemaining(clocksData, type),
  [clocksData, type]
);
```

2. **Debounce rapid changes**:
```javascript
const debouncedSave = useDebounce(saveClock, 300);
```

3. **Avoid unnecessary re-renders**:
```javascript
const { curDetails } = useCuraduria(clocksData, type); // Already memoized
```

## Contributing

When adding features:

1. Keep layers separate
2. Write pure functions when possible
3. Add tests for business logic
4. Document complex calculations
5. Maintain backward compatibility

## See Also

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed architecture documentation
- Original implementation: `exp_clocks.component_BACKUP.js`
- Main component: `../EXP_CLOCKS.jsx`
