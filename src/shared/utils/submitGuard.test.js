import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { logEvent } from '../observability/logger';
import {
  MIN_HOLD_MS,
  SETTLE_DEBOUNCE_MS,
  SUBMIT_TIMEOUT_MS,
  guardSubmit,
  holdSubmit,
  isRepeatedSubmit,
  isSubmitInFlight,
  resetSubmitGuard,
} from './submitGuard';

vi.mock('../observability/logger', () => ({ logEvent: vi.fn(), logError: vi.fn() }));

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

/** Lets the settle handlers of already settled promises run. */
const flush = () => vi.advanceTimersByTimeAsync(0);

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-12T10:00:00Z'));
  resetSubmitGuard();
  logEvent.mockClear();
});

afterEach(() => {
  resetSubmitGuard();
  vi.useRealTimers();
});

describe('isRepeatedSubmit (legacy time window)', () => {
  it('lets the first submission through and blocks the same action inside the window', () => {
    expect(isRepeatedSubmit('fun-c:1')).toBe(false);
    expect(isRepeatedSubmit('fun-c:1')).toBe(true);

    vi.advanceTimersByTime(1499);
    expect(isRepeatedSubmit('fun-c:1')).toBe(true);
  });

  it('releases the action once the window has passed, counted from the accepted submission', () => {
    expect(isRepeatedSubmit('fun-c:1')).toBe(false);

    // Blocked attempts do not extend the window.
    vi.advanceTimersByTime(1000);
    expect(isRepeatedSubmit('fun-c:1')).toBe(true);
    vi.advanceTimersByTime(500);

    expect(isRepeatedSubmit('fun-c:1')).toBe(false);
    expect(isRepeatedSubmit('fun-c:1')).toBe(true);
  });

  it('keeps one window per key', () => {
    expect(isRepeatedSubmit('fun-c:1')).toBe(false);
    expect(isRepeatedSubmit('fun-c:2')).toBe(false);
    expect(isRepeatedSubmit('fun-n:1')).toBe(false);
    expect(isRepeatedSubmit('fun-c:2')).toBe(true);
  });

  it('honours a custom window', () => {
    expect(isRepeatedSubmit('save', 200)).toBe(false);
    vi.advanceTimersByTime(199);
    expect(isRepeatedSubmit('save', 200)).toBe(true);
    vi.advanceTimersByTime(1);
    expect(isRepeatedSubmit('save', 200)).toBe(false);
  });

  it('forgets every action on reset', () => {
    expect(isRepeatedSubmit('fun-c:1')).toBe(false);
    resetSubmitGuard();
    expect(isRepeatedSubmit('fun-c:1')).toBe(false);
  });

  it('stays time-window based when the caller hands over no promise', () => {
    expect(isRepeatedSubmit('legacy')).toBe(false);
    expect(holdSubmit('legacy', undefined)).toBeUndefined();
    expect(holdSubmit('legacy', 'OK')).toBe('OK');
    expect(isSubmitInFlight('legacy')).toBe(false);

    vi.advanceTimersByTime(1499);
    expect(isRepeatedSubmit('legacy')).toBe(true);
    vi.advanceTimersByTime(1);
    expect(isRepeatedSubmit('legacy')).toBe(false);
  });
});

describe('holdSubmit (in-flight guard)', () => {
  it('keeps the action taken for as long as the request is pending, past the time window', async () => {
    const request = deferred();
    expect(isRepeatedSubmit('save')).toBe(false);
    holdSubmit('save', request.promise);

    await vi.advanceTimersByTimeAsync(5000);
    expect(isSubmitInFlight('save')).toBe(true);
    expect(isRepeatedSubmit('save')).toBe(true);

    request.resolve('OK');
    await flush();
    expect(isSubmitInFlight('save')).toBe(false);
  });

  it('settles exactly like the promise it holds', async () => {
    const ok = deferred();
    const held = holdSubmit('a', ok.promise);
    ok.resolve({ data: 'OK' });
    await expect(held).resolves.toEqual({ data: 'OK' });

    const failure = new Error('network');
    const ko = deferred();
    const heldFailure = holdSubmit('b', ko.promise);
    ko.reject(failure);
    await expect(heldFailure).rejects.toBe(failure);
  });

  it('releases on resolve after the post-settle debounce', async () => {
    const request = deferred();
    expect(isRepeatedSubmit('save')).toBe(false);
    holdSubmit('save', request.promise);

    await vi.advanceTimersByTimeAsync(4000);
    request.resolve('OK');
    await flush();

    // The second click of a double click that lands right after the answer is absorbed.
    expect(isRepeatedSubmit('save')).toBe(true);
    vi.advanceTimersByTime(SETTLE_DEBOUNCE_MS - 1);
    expect(isRepeatedSubmit('save')).toBe(true);
    vi.advanceTimersByTime(1);
    expect(isRepeatedSubmit('save')).toBe(false);
  });

  it('absorbs a double click when the answer is very fast', async () => {
    expect(isRepeatedSubmit('save')).toBe(false);
    holdSubmit('save', Promise.resolve('OK'));
    await flush();

    vi.advanceTimersByTime(MIN_HOLD_MS - 1);
    expect(isRepeatedSubmit('save')).toBe(true);
    vi.advanceTimersByTime(1);
    expect(isRepeatedSubmit('save')).toBe(false);
  });

  it('releases on reject so a retry works immediately', async () => {
    const request = deferred();
    expect(isRepeatedSubmit('save')).toBe(false);
    const held = holdSubmit('save', request.promise);
    held.catch(() => {});

    await vi.advanceTimersByTimeAsync(50);
    expect(isRepeatedSubmit('save')).toBe(true);

    request.reject(new Error('500'));
    await flush();

    // Inside the legacy 1500 ms window, yet free again.
    expect(isSubmitInFlight('save')).toBe(false);
    expect(isRepeatedSubmit('save')).toBe(false);
  });

  it('releases after the safety timeout when the promise never settles, and logs it', async () => {
    expect(isRepeatedSubmit('save')).toBe(false);
    holdSubmit('save', new Promise(() => {}));

    await vi.advanceTimersByTimeAsync(SUBMIT_TIMEOUT_MS - 1);
    expect(isRepeatedSubmit('save')).toBe(true);
    expect(logEvent).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(isSubmitInFlight('save')).toBe(false);
    expect(isRepeatedSubmit('save')).toBe(false);
    expect(logEvent).toHaveBeenCalledTimes(1);
    expect(logEvent).toHaveBeenCalledWith('warn', 'submit_guard_timeout', expect.objectContaining({
      data: { key: 'save', timeoutMs: SUBMIT_TIMEOUT_MS },
    }));
  });

  it('honours a custom safety timeout and ignores a late answer', async () => {
    const request = deferred();
    expect(isRepeatedSubmit('save')).toBe(false);
    holdSubmit('save', request.promise, { timeoutMs: 2000 });

    await vi.advanceTimersByTimeAsync(2000);
    expect(isRepeatedSubmit('save')).toBe(false); // second run takes the key
    const second = deferred();
    holdSubmit('save', second.promise);

    request.resolve('late');
    await flush();
    expect(isSubmitInFlight('save')).toBe(true); // the late answer does not free the second run
    second.resolve('OK');
    await flush();
    expect(isSubmitInFlight('save')).toBe(false);
  });

  it('isolates keys', async () => {
    const first = deferred();
    expect(isRepeatedSubmit('fun_n_3:new_3')).toBe(false);
    holdSubmit('fun_n_3:new_3', first.promise).catch(() => {});

    expect(isRepeatedSubmit('fun_n_3:edit_3')).toBe(false);
    expect(isSubmitInFlight('fun_n_3:edit_3')).toBe(false);

    first.reject(new Error('x'));
    await flush();
    expect(isRepeatedSubmit('fun_n_3:edit_3')).toBe(true); // still on its own window
    expect(isRepeatedSubmit('fun_n_3:new_3')).toBe(false);
  });

  it('covers every request of one action until the last one settles', async () => {
    const save = deferred();
    const clock = deferred();
    expect(isRepeatedSubmit('fun_c:save_c')).toBe(false);
    holdSubmit('fun_c:save_c', save.promise);
    holdSubmit('fun_c:save_c', undefined); // a helper that had nothing to send
    holdSubmit('fun_c:save_c', clock.promise);

    save.resolve('OK');
    await vi.advanceTimersByTimeAsync(3000);
    expect(isRepeatedSubmit('fun_c:save_c')).toBe(true);

    clock.resolve('OK');
    await flush();
    expect(isSubmitInFlight('fun_c:save_c')).toBe(false);
    vi.advanceTimersByTime(SETTLE_DEBOUNCE_MS);
    expect(isRepeatedSubmit('fun_c:save_c')).toBe(false);
  });
});

describe('guardSubmit', () => {
  it('runs concurrent calls once and returns the action result', async () => {
    const request = deferred();
    const action = vi.fn(() => request.promise);

    const first = guardSubmit('generate', action);
    const second = guardSubmit('generate', action);
    await vi.advanceTimersByTimeAsync(2500);
    const third = guardSubmit('generate', action);

    expect(action).toHaveBeenCalledTimes(1);
    expect(second).toBeUndefined();
    expect(third).toBeUndefined();

    request.resolve('CONSECUTIVE-1');
    await expect(first).resolves.toBe('CONSECUTIVE-1');
  });

  it('lets the action run again right after a rejection', async () => {
    const action = vi.fn()
      .mockImplementationOnce(() => Promise.reject(new Error('503')))
      .mockImplementationOnce(() => Promise.resolve('OK'));

    await expect(guardSubmit('generate', action)).rejects.toThrow('503');
    await expect(guardSubmit('generate', action)).resolves.toBe('OK');
    expect(action).toHaveBeenCalledTimes(2);
  });

  it('falls back to the time window for an action that returns no promise', () => {
    const action = vi.fn(() => 'done');

    expect(guardSubmit('sync', action, { windowMs: 1000 })).toBe('done');
    expect(guardSubmit('sync', action, { windowMs: 1000 })).toBeUndefined();
    vi.advanceTimersByTime(1000);
    expect(guardSubmit('sync', action, { windowMs: 1000 })).toBe('done');
    expect(action).toHaveBeenCalledTimes(2);
  });

  it('frees the key when the action throws synchronously', () => {
    const action = vi.fn(() => { throw new Error('validation'); });

    expect(() => guardSubmit('sync', action)).toThrow('validation');
    expect(() => guardSubmit('sync', action)).toThrow('validation');
    expect(action).toHaveBeenCalledTimes(2);
  });
});
