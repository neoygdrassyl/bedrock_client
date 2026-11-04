import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const registry = vi.hoisted(() => ({ roleEligibility: vi.fn() }));
vi.mock('@/features/professional-registry', () => ({ professionalRegistryService: registry }));

import { useRoleEligibility } from './useRoleEligibility';

const ELIGIBILITY = { registryId: 9, generalMonths: 120, roles: [] };
const deferred = () => {
  let resolve;
  const promise = new Promise((res) => { resolve = res; });
  return { promise, resolve };
};

describe('useRoleEligibility', () => {
  beforeEach(() => { registry.roleEligibility.mockReset(); });

  it('stays idle without a professional', () => {
    const { result } = renderHook(() => useRoleEligibility(null));
    expect(result.current).toEqual({ status: 'idle', data: null });
    expect(registry.roleEligibility).not.toHaveBeenCalled();
  });

  it('loads the eligibility with a cancellable request', async () => {
    registry.roleEligibility.mockResolvedValue({ data: ELIGIBILITY });
    const { result } = renderHook(() => useRoleEligibility(9));
    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current).toEqual({ status: 'ready', data: ELIGIBILITY }));
    expect(registry.roleEligibility).toHaveBeenCalledWith(9, { signal: expect.any(AbortSignal) });
  });

  it.each([
    ['a 404 from an older backend', () => Promise.reject({ response: { status: 404 } })],
    ['a network failure', () => Promise.reject(new Error('Network Error'))],
    ['an unexpected answer', () => Promise.resolve({ data: 'OK' })],
  ])('is unavailable after %s', async (_case, answer) => {
    registry.roleEligibility.mockImplementation(answer);
    const { result } = renderHook(() => useRoleEligibility(9));
    await waitFor(() => expect(result.current).toEqual({ status: 'unavailable', data: null }));
  });

  it('aborts the previous request and ignores its late answer', async () => {
    const first = deferred();
    const second = deferred();
    registry.roleEligibility.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const { result, rerender } = renderHook(({ id }) => useRoleEligibility(id), { initialProps: { id: 9 } });
    const firstSignal = registry.roleEligibility.mock.calls[0][1].signal;

    rerender({ id: 10 });
    expect(firstSignal.aborted).toBe(true);
    second.resolve({ data: { ...ELIGIBILITY, registryId: 10 } });
    await waitFor(() => expect(result.current.data?.registryId).toBe(10));
    first.resolve({ data: ELIGIBILITY });
    await Promise.resolve();
    expect(result.current.data.registryId).toBe(10);
  });

  it('aborts on unmount and goes idle when the professional is cleared', async () => {
    registry.roleEligibility.mockReturnValue(new Promise(() => {}));
    const { result, rerender, unmount } = renderHook(({ id }) => useRoleEligibility(id), { initialProps: { id: 9 } });
    const signal = registry.roleEligibility.mock.calls[0][1].signal;
    rerender({ id: null });
    expect(signal.aborted).toBe(true);
    expect(result.current.status).toBe('idle');

    rerender({ id: 9 });
    unmount();
    expect(registry.roleEligibility.mock.calls[1][1].signal.aborted).toBe(true);
  });
});
