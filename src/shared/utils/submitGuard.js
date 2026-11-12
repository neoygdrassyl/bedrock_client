import { logEvent } from '../observability/logger';

/**
 * Double-submit guard for legacy forms whose save handlers run promise chains with no shared
 * pending state. One key per user action. Two ways to use it:
 *
 * 1. In-flight (preferred). The key stays taken from the moment the action starts until its
 *    promise settles, whatever the request takes, and is released in `finally`:
 *
 *      if (isRepeatedSubmit('fun_n_3:new_3')) return;        // claim
 *      holdSubmit('fun_n_3:new_3', FUNService.create_fun3(formData).then(...).catch(...));
 *
 *    or, when the whole action is one promise-returning function:
 *
 *      guardSubmit('expedition:create', () => EXPEDITION_SERVICE.create(formData));
 *
 *    - A rejection frees the key at once, so a retry is never blocked.
 *    - A fulfilment keeps it for a short debounce (`MIN_HOLD_MS` from the start and
 *      `SETTLE_DEBOUNCE_MS` after the answer) to absorb the second click of a double click
 *      that lands after a very fast response. Chains that swallow their error in `.catch`
 *      fulfil, so they get this debounce too.
 *    - A promise that never settles frees the key after `timeoutMs` (30 s) and is logged
 *      as `submit_guard_timeout`, so a button can never stay locked for good.
 *    - Several holds on one key (a handler that fires more than one request) keep it taken
 *      until the last one settles.
 *
 * 2. Time window (legacy). A caller that cannot provide a promise only calls
 *    `isRepeatedSubmit(key, windowMs)`: the key is taken for `windowMs` from the accepted
 *    submission and nothing else. That path does NOT know how long the request takes: a save
 *    slower than the window can be sent twice, and a fast failure blocks the retry until the
 *    window ends. Paths that return before any request starts (a failed validation) stay on
 *    this window too.
 *
 * Neither form delays or changes the first submission.
 */
export const SUBMIT_WINDOW_MS = 1500;
export const SUBMIT_TIMEOUT_MS = 30000;
export const MIN_HOLD_MS = 600;
export const SETTLE_DEBOUNCE_MS = 300;

/** key -> timestamp until which the key is taken (time window or post-settle debounce). */
const blockedUntil = new Map();
/** key -> { startedAt, failed, holds: Map<token, timeoutId> } while a promise is pending. */
const inFlight = new Map();

const isThenable = (value) => value != null && typeof value.then === 'function';

function release(key, token, outcome) {
    const entry = inFlight.get(key);
    if (!entry || !entry.holds.has(token)) return;
    clearTimeout(entry.holds.get(token));
    entry.holds.delete(token);
    if (outcome !== 'fulfilled') entry.failed = true;
    if (entry.holds.size > 0) return;

    inFlight.delete(key);
    if (entry.failed) {
        blockedUntil.delete(key);
        return;
    }
    blockedUntil.set(key, Math.max(entry.startedAt + MIN_HOLD_MS, Date.now() + SETTLE_DEBOUNCE_MS));
}

/** True while a promise handed to `holdSubmit`/`guardSubmit` for this key is still pending. */
export function isSubmitInFlight(key) {
    return inFlight.has(key);
}

/**
 * Returns true when the action must be dropped: its promise is still pending, or it fired
 * within `windowMs` of the accepted submission. Otherwise takes the key and returns false:
 *
 *   if (isRepeatedSubmit(`fun-c:${currentItem.id}`)) return;
 */
export function isRepeatedSubmit(key, windowMs = SUBMIT_WINDOW_MS) {
    if (inFlight.has(key)) return true;
    const now = Date.now();
    const until = blockedUntil.get(key);
    if (until != null && now < until) return true;
    blockedUntil.set(key, now + windowMs);
    return false;
}

/**
 * Keeps `key` taken until `pending` settles (see the module comment). Returns a promise that
 * settles exactly like `pending`, so it can replace it in a chain or be ignored. A value that
 * is not a promise is returned untouched and the key stays on its time window.
 */
export function holdSubmit(key, pending, { timeoutMs = SUBMIT_TIMEOUT_MS } = {}) {
    if (!isThenable(pending)) return pending;

    let entry = inFlight.get(key);
    if (!entry) {
        entry = { startedAt: Date.now(), failed: false, holds: new Map() };
        inFlight.set(key, entry);
    }
    const token = Symbol(key);
    entry.holds.set(token, setTimeout(() => {
        logEvent('warn', 'submit_guard_timeout', {
            message: `Action "${key}" did not settle within ${timeoutMs} ms; the guard was released.`,
            data: { key, timeoutMs },
        });
        release(key, token, 'timeout');
    }, timeoutMs));

    return Promise.resolve(pending).then(
        (value) => { release(key, token, 'fulfilled'); return value; },
        (error) => { release(key, token, 'rejected'); throw error; },
    );
}

/**
 * Runs `action` unless the same key is already running or inside its window. Returns
 * `undefined` when the call is dropped; otherwise whatever `action` returns, held in flight
 * when it is a promise. A synchronous throw frees the key and is rethrown.
 */
export function guardSubmit(key, action, { windowMs = SUBMIT_WINDOW_MS, timeoutMs = SUBMIT_TIMEOUT_MS } = {}) {
    if (isRepeatedSubmit(key, windowMs)) return undefined;
    let result;
    try {
        result = action();
    } catch (error) {
        blockedUntil.delete(key);
        throw error;
    }
    return holdSubmit(key, result, { timeoutMs });
}

/** Test helper. */
export function resetSubmitGuard() {
    inFlight.forEach((entry) => entry.holds.forEach((timer) => clearTimeout(timer)));
    inFlight.clear();
    blockedUntil.clear();
}
