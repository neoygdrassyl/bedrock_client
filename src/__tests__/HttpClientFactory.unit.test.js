import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const buildFactoryModule = async () => {
  vi.resetModules();

  const mockRequestUse = vi.fn();
  const mockResponseUse = vi.fn();

  const mockInstance = {
    interceptors: {
      request: { use: mockRequestUse },
      response: { use: mockResponseUse },
    },
  };

  const createSpy = vi.fn(() => mockInstance);

  vi.doMock('axios', () => ({
    default: {
      create: createSpy,
    },
  }));

  const mod = await import('../http-client-factory');

  return {
    createDovelaHttpClient: mod.createDovelaHttpClient,
    createSpy,
    mockRequestUse,
    mockResponseUse,
  };
};

describe('http-client-factory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    window.user = { id: 1 };
  });

  afterEach(() => {
    window.user = null;
    vi.restoreAllMocks();
  });

  it('forwards baseURL and headers to axios.create', async () => {
    const { createDovelaHttpClient, createSpy } = await buildFactoryModule();

    createDovelaHttpClient({ baseURL: 'https://example.test/api', headers: { foo: 'bar' } });

    expect(createSpy).toHaveBeenCalledWith({ baseURL: 'https://example.test/api', headers: { foo: 'bar' } });
  });

  it('registers the JWT request interceptor when attachAuth is true (default)', async () => {
    const { createDovelaHttpClient, mockRequestUse } = await buildFactoryModule();

    createDovelaHttpClient({ baseURL: 'https://example.test/api' });

    expect(mockRequestUse).toHaveBeenCalledTimes(1);
    const onFulfilled = mockRequestUse.mock.calls[0][0];

    localStorage.setItem('dovela_token', 'abc123');
    const config = { headers: {} };
    const updated = onFulfilled(config);

    expect(updated.headers.Authorization).toBe('Bearer abc123');
  });

  it('does NOT register the request interceptor when attachAuth is false', async () => {
    const { createDovelaHttpClient, mockRequestUse } = await buildFactoryModule();

    createDovelaHttpClient({ baseURL: 'https://third-party.test/api', attachAuth: false });

    expect(mockRequestUse).not.toHaveBeenCalled();
  });

  it('always registers the 401/error response interceptor, regardless of attachAuth', async () => {
    const { createDovelaHttpClient, mockResponseUse } = await buildFactoryModule();

    createDovelaHttpClient({ baseURL: 'https://third-party.test/api', attachAuth: false });

    expect(mockResponseUse).toHaveBeenCalledTimes(1);
  });

  it('clears the session and redirects on a 401 when attachAuth is true (main API)', async () => {
    const { createDovelaHttpClient, mockResponseUse } = await buildFactoryModule();

    createDovelaHttpClient({ baseURL: 'https://example.test/api' });
    const onRejected = mockResponseUse.mock.calls[0][1];

    localStorage.setItem('dovela_token', 'abc123');
    localStorage.setItem('dovela_user', '{"id":1}');

    await expect(
      onRejected({
        config: { url: '/fun/1' },
        response: { status: 401, data: { expired: true } },
      })
    ).rejects.toBeTruthy();

    expect(localStorage.getItem('dovela_token')).toBeNull();
    expect(localStorage.getItem('dovela_user')).toBeNull();
    expect(window.user).toBeNull();
  });

  it('does NOT tear down the session on a 401 when attachAuth is false (third-party host)', async () => {
    // A third-party host's 401 says nothing about the main app's session —
    // gated so it never logs the user out of the main app (see http-client-factory.js).
    const { createDovelaHttpClient, mockResponseUse } = await buildFactoryModule();

    createDovelaHttpClient({ baseURL: 'https://third-party.test/api', attachAuth: false });
    const onRejected = mockResponseUse.mock.calls[0][1];

    localStorage.setItem('dovela_token', 'abc123');
    localStorage.setItem('dovela_user', '{"id":1}');

    await expect(
      onRejected({
        config: { url: '/fun/1' },
        response: { status: 401, data: { expired: true } },
      })
    ).rejects.toBeTruthy();

    expect(localStorage.getItem('dovela_token')).toBe('abc123');
    expect(localStorage.getItem('dovela_user')).toBe('{"id":1}');
    expect(window.user).toEqual({ id: 1 });
  });
});
