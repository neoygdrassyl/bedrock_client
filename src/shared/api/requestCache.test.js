import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearPendingRequests, dedupeGet } from './requestCache';

afterEach(() => {
  clearPendingRequests();
});

describe('dedupeGet', () => {
  it('shares the same in-flight request for the same key', () => {
    const requestFn = vi.fn(() => new Promise(() => {}));

    const first = dedupeGet('submit:getlist:123', requestFn);
    const second = dedupeGet('submit:getlist:123', requestFn);

    expect(second).toBe(first);
    expect(requestFn).toHaveBeenCalledTimes(1);
  });

  it('clears the key after the request resolves', async () => {
    const requestFn = vi.fn().mockResolvedValue({ data: [] });

    await dedupeGet('fun:loadPQRSxFUN:abc', requestFn);
    await dedupeGet('fun:loadPQRSxFUN:abc', requestFn);

    expect(requestFn).toHaveBeenCalledTimes(2);
  });

  it('does not mix different keys', () => {
    const requestFn = vi.fn(() => new Promise(() => {}));

    const first = dedupeGet('cubXVr:getByFUN:a', requestFn);
    const second = dedupeGet('cubXVr:getByFUN:b', requestFn);

    expect(second).not.toBe(first);
    expect(requestFn).toHaveBeenCalledTimes(2);
  });

  it('force starts a new request instead of joining the pending one, and later callers join it', async () => {
    let resolveStale;
    const stale = dedupeGet('fun:get_fun_IdPublic:x', () => new Promise((resolve) => { resolveStale = resolve; }));
    const fresh = dedupeGet('fun:get_fun_IdPublic:x', () => Promise.resolve('post-write'), { force: true });
    const joiner = dedupeGet('fun:get_fun_IdPublic:x', () => Promise.resolve('unused'));

    expect(fresh).not.toBe(stale);
    expect(joiner).toBe(fresh);
    await expect(fresh).resolves.toBe('post-write');

    // The stale request settling later must not clear the key of a newer pending request.
    const newer = dedupeGet('fun:get_fun_IdPublic:x', () => new Promise(() => {}));
    resolveStale('pre-write');
    await expect(stale).resolves.toBe('pre-write');
    expect(dedupeGet('fun:get_fun_IdPublic:x', () => Promise.resolve('other'))).toBe(newer);
  });
});
