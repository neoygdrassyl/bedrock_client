import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';

const service = vi.hoisted(() => ({ catalog: vi.fn() }));
vi.mock('@/features/professional-registry/api/professional_registry.service', () => ({ default: service }));

import { resetRegistryCatalog, useRegistryCatalog } from './useRegistryCatalog';

const ROLES = [{ code: 'ARQ_PROY', label: 'ARQUITECTO PROYECTISTA' }];

function deferred() {
  let resolve;
  const promise = new Promise((ok) => { resolve = ok; });
  return { promise, resolve };
}

describe('useRegistryCatalog', () => {
  beforeEach(() => {
    resetRegistryCatalog();
    service.catalog.mockReset().mockResolvedValue({ data: { data: ROLES, professions: ['ARQUITECTO'] } });
  });

  it('shares one request between the consumers on screen', async () => {
    const pending = deferred();
    service.catalog.mockReturnValue(pending.promise);
    const first = renderHook(() => useRegistryCatalog());
    const second = renderHook(() => useRegistryCatalog());
    await act(async () => { pending.resolve({ data: { data: ROLES, professions: ['ARQUITECTO'] } }); });

    expect(service.catalog).toHaveBeenCalledTimes(1);
    [first, second].forEach(({ result }) => expect(result.current).toEqual({
      roles: ROLES, professions: ['ARQUITECTO'], loaded: true, failed: false,
    }));

    // A consumer that arrives while another is still on screen reuses the answer.
    const third = renderHook(() => useRegistryCatalog());
    await waitFor(() => expect(third.result.current.loaded).toBe(true));
    expect(service.catalog).toHaveBeenCalledTimes(1);
  });

  it('asks again once every consumer has gone', async () => {
    const first = renderHook(() => useRegistryCatalog());
    await waitFor(() => expect(first.result.current.loaded).toBe(true));
    first.unmount();

    service.catalog.mockResolvedValue({ data: { data: [] } });
    const next = renderHook(() => useRegistryCatalog());
    await waitFor(() => expect(next.result.current.loaded).toBe(true));
    expect(service.catalog).toHaveBeenCalledTimes(2);
    expect(next.result.current).toEqual({ roles: [], professions: null, loaded: true, failed: false });
  });

  it('waits while disabled and leaves professions null when an older server does not send them', async () => {
    service.catalog.mockResolvedValue({ data: { data: ROLES, professions: [] } });
    const { result, rerender } = renderHook(({ enabled }) => useRegistryCatalog(enabled), { initialProps: { enabled: false } });
    expect(service.catalog).not.toHaveBeenCalled();
    expect(result.current.loaded).toBe(false);

    rerender({ enabled: true });
    await waitFor(() => expect(result.current.loaded).toBe(true));
    expect(result.current.professions).toBeNull();
    expect(result.current.roles).toEqual(ROLES);
  });

  it('reports a failure and does not keep it: the next consumer retries', async () => {
    service.catalog.mockRejectedValueOnce(new Error('offline'));
    const first = renderHook(() => useRegistryCatalog());
    await waitFor(() => expect(first.result.current.failed).toBe(true));
    expect(first.result.current.roles).toEqual([]);

    const second = renderHook(() => useRegistryCatalog());
    await waitFor(() => expect(second.result.current.loaded).toBe(true));
    expect(service.catalog).toHaveBeenCalledTimes(2);
  });

  it('turns a service that throws into a failure', async () => {
    service.catalog.mockImplementation(() => { throw new Error('not a function'); });
    const { result } = renderHook(() => useRegistryCatalog());
    await waitFor(() => expect(result.current.failed).toBe(true));
  });
});
