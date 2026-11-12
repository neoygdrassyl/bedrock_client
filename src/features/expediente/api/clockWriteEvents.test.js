import { afterEach, describe, expect, it, vi } from 'vitest';
import { afterClockWrite, onClockWritten } from './clockWriteEvents';

let unsubscribe = () => {};
afterEach(() => unsubscribe());

describe('clockWriteEvents', () => {
  it('publishes a successful write with its expediente and resolves with the response', async () => {
    const listener = vi.fn();
    unsubscribe = onClockWritten(listener);
    const data = new FormData();
    data.set('fun0Id', '42');

    await expect(afterClockWrite(Promise.resolve({ data: 'OK' }), data)).resolves.toEqual({ data: 'OK' });
    expect(listener).toHaveBeenCalledWith({ fun0Id: '42' });

    await afterClockWrite(Promise.resolve({ data: 'OK' }), { fun0Id: 7 });
    expect(listener).toHaveBeenLastCalledWith({ fun0Id: 7 });

    await afterClockWrite(Promise.resolve({ data: 'OK' }), null);
    expect(listener).toHaveBeenLastCalledWith({ fun0Id: null });
  });

  it('does not publish a failed write and keeps its error', async () => {
    const listener = vi.fn();
    unsubscribe = onClockWritten(listener);
    const error = new Error('boom');

    await expect(afterClockWrite(Promise.reject(error), { fun0Id: 1 })).rejects.toBe(error);
    expect(listener).not.toHaveBeenCalled();
  });

  it('a failing listener never fails the write, and unsubscribed listeners are not called', async () => {
    const failing = vi.fn(() => { throw new Error('listener'); });
    const removed = vi.fn();
    const stop = onClockWritten(removed);
    stop();
    unsubscribe = onClockWritten(failing);

    await expect(afterClockWrite(Promise.resolve({ data: 'OK' }), null)).resolves.toEqual({ data: 'OK' });
    expect(failing).toHaveBeenCalledTimes(1);
    expect(removed).not.toHaveBeenCalled();
  });
});
