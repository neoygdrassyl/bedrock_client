import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as requestCache from '@/app/services/requestCache';

describe('requestCache', () => {
  beforeEach(() => {
    requestCache.clearPendingRequests();
    requestCache.clearResolvedRequests?.();
  });

  it('reuses a fresh GET response and allows an explicit refresh', async () => {
    expect(requestCache.cachedGet).toBeTypeOf('function');

    const request = vi.fn()
      .mockResolvedValueOnce({ data: ['first'] })
      .mockResolvedValueOnce({ data: ['refreshed'] });

    const first = await requestCache.cachedGet('macro-range', request, { ttlMs: 30_000 });
    const cached = await requestCache.cachedGet('macro-range', request, { ttlMs: 30_000 });
    const refreshed = await requestCache.cachedGet('macro-range', request, { ttlMs: 30_000, force: true });

    expect(first.data).toEqual(['first']);
    expect(cached).toBe(first);
    expect(refreshed.data).toEqual(['refreshed']);
    expect(request).toHaveBeenCalledTimes(2);
  });
});
