import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { resetSubmitGuard } from '@/shared/utils/submitGuard';
import { useActionGuard } from './useActionGuard';

afterEach(() => {
  resetSubmitGuard();
});

describe('useActionGuard', () => {
  it('drops a repeated run inside the window and cancels its form submit', () => {
    const { result } = renderHook(() => useActionGuard());
    const handler = vi.fn();
    const guarded = result.current(handler, 'save');
    const event = { preventDefault: vi.fn() };

    guarded(event);
    guarded(event);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
  });

  it('releases the action when the handler throws synchronously', () => {
    const { result } = renderHook(() => useActionGuard());
    const handler = vi.fn()
      .mockImplementationOnce(() => { throw new Error('validation'); })
      .mockReturnValue('OK');
    const guarded = result.current(handler, 'save');

    expect(() => guarded()).toThrow('validation');
    expect(guarded()).toBe('OK');
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('releases the action at once when the request is rejected', async () => {
    const { result } = renderHook(() => useActionGuard());
    const handler = vi.fn()
      .mockImplementationOnce(() => Promise.reject(new Error('503')))
      .mockImplementation(() => Promise.resolve('OK'));
    const guarded = result.current(handler, 'generate');

    await expect(guarded()).rejects.toThrow('503');
    await expect(guarded()).resolves.toBe('OK');
  });
});
