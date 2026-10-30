import { describe, expect, it, vi } from 'vitest';
import { isChunkLoadError, isServerUnreachable, tryChunkAutoReload } from './errorKinds';

describe('error kind classification', () => {
  it('detects lazy chunk failures across browsers', () => {
    expect(isChunkLoadError(new TypeError('Failed to fetch dynamically imported module: /assets/a.js'))).toBe(true);
    expect(isChunkLoadError(new TypeError('Importing a module script failed.'))).toBe(true);
    expect(isChunkLoadError(new Error('error loading dynamically imported module'))).toBe(true);
    expect(isChunkLoadError({ name: 'ChunkLoadError', message: 'x' })).toBe(true);
    expect(isChunkLoadError(new Error('Unable to preload CSS for /assets/a.css'))).toBe(true);
    expect(isChunkLoadError(new TypeError('x is undefined'))).toBe(false);
  });

  it('detects an unreachable backend but not a timeout or an ordinary error status', () => {
    expect(isServerUnreachable({ isAxiosError: true, code: 'ERR_NETWORK', request: {} })).toBe(true);
    expect(isServerUnreachable({ isAxiosError: true, response: { status: 503 } })).toBe(true);
    expect(isServerUnreachable({ isAxiosError: true, response: { status: 502 } })).toBe(true);
    // A 5xx produced by Dovela carries its request id: a real server error, not an outage.
    expect(isServerUnreachable({ isAxiosError: true, response: { status: 500, headers: { 'x-dovela-request-id': 'req_abc_12345678' } } })).toBe(false);
    expect(isServerUnreachable({ isAxiosError: true, response: { status: 500, headers: { get: (name) => (name === 'x-dovela-request-id' ? 'req_abc_12345678' : null) } } })).toBe(false);
    // A 5xx with neither the header nor a body came from a proxy or gateway
    // (Vite's dev proxy answers an empty 500 when the backend is down).
    expect(isServerUnreachable({ isAxiosError: true, response: { status: 500, headers: {}, data: '' } })).toBe(true);
    expect(isServerUnreachable({ isAxiosError: true, response: { status: 500, headers: {} } })).toBe(true);
    expect(isServerUnreachable({ isAxiosError: true, response: { status: 500, data: null } })).toBe(true);
    expect(isServerUnreachable({ isAxiosError: true, response: { status: 500, data: {} } })).toBe(true);
    expect(isServerUnreachable({ isAxiosError: true, response: { status: 500, data: [] } })).toBe(true);
    // A real backend 500 always has a JSON body, even when a cross-origin
    // deployment does not expose the request id header: not an outage.
    expect(isServerUnreachable({ isAxiosError: true, response: { status: 500, headers: {}, data: { message: 'boom' } } })).toBe(false);
    expect(isServerUnreachable({ isAxiosError: true, response: { status: 500, headers: { get: () => null }, data: { error: 'x' } } })).toBe(false);
    // With the header it is Dovela's own error, body or not.
    expect(isServerUnreachable({ isAxiosError: true, response: { status: 500, headers: { 'x-dovela-request-id': 'req_abc_12345678' }, data: '' } })).toBe(false);
    // Client errors are never an outage.
    expect(isServerUnreachable({ isAxiosError: true, response: { status: 404, headers: {} } })).toBe(false);
    expect(isServerUnreachable({ isAxiosError: true, code: 'ECONNABORTED', request: {} })).toBe(false);
    expect(isServerUnreachable({ code: 'ERR_CANCELED' })).toBe(false);
  });

  it('reloads once per minute at most', () => {
    const store = new Map();
    const storage = { getItem: (key) => store.get(key) ?? null, setItem: (key, value) => store.set(key, value) };
    const reload = vi.fn();

    expect(tryChunkAutoReload({ storage, reload })).toBe(true);
    expect(tryChunkAutoReload({ storage, reload })).toBe(false);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('does not reload without a working sessionStorage', () => {
    const reload = vi.fn();
    // Missing storage.
    expect(tryChunkAutoReload({ storage: null, reload })).toBe(false);
    // Writes that throw (quota, blocked site data).
    expect(tryChunkAutoReload({ storage: { getItem: () => null, setItem: () => { throw new Error('quota'); } }, reload })).toBe(false);
    // Writes that are silently dropped would let the reload loop forever.
    expect(tryChunkAutoReload({ storage: { getItem: () => null, setItem: () => {} }, reload })).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });

  it('does not reload when storage is unavailable', () => {
    const storage = { getItem: () => { throw new Error('blocked'); }, setItem: vi.fn() };
    const reload = vi.fn();
    expect(tryChunkAutoReload({ storage, reload })).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });
});
