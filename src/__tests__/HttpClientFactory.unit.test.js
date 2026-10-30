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

  const mod = await import('../shared/api/http-client-factory');
  const logger = await import('../shared/observability/logger');

  return {
    logger,
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

  it('sends a backend-valid x-dovela-request-id on main API requests and keeps one already set', async () => {
    const { createDovelaHttpClient, mockRequestUse } = await buildFactoryModule();

    createDovelaHttpClient({ baseURL: 'https://example.test/api' });
    const onFulfilled = mockRequestUse.mock.calls[0][0];

    const fresh = onFulfilled({ headers: {} });
    expect(fresh.headers['x-dovela-request-id']).toMatch(/^req_[a-z0-9]+_[a-z0-9]{8}$/);
    expect(fresh.headers['x-dovela-request-id']).toMatch(/^[A-Za-z0-9_.:-]{8,80}$/);
    expect(fresh.dovelaRequestId).toBe(fresh.headers['x-dovela-request-id']);

    const preset = onFulfilled({ headers: { 'x-dovela-request-id': 'req_custom_12345678' } });
    expect(preset.headers['x-dovela-request-id']).toBe('req_custom_12345678');
    expect(preset.dovelaRequestId).toBe('req_custom_12345678');
  });

  it('logs failed requests as http_error with the correlated request id', async () => {
    const { createDovelaHttpClient, mockResponseUse, logger } = await buildFactoryModule();

    createDovelaHttpClient({ baseURL: 'https://example.test/api' });
    const onRejected = mockResponseUse.mock.calls[0][1];

    await expect(onRejected({
      config: { url: 'fun/get/1?token=secret', method: 'get', dovelaRequestId: 'req_client_12345678' },
      response: { status: 500, headers: { 'x-dovela-request-id': 'req_server_12345678' }, data: {} },
    })).rejects.toBeTruthy();
    await expect(onRejected({
      config: { url: '/fun/save', method: 'post' },
      response: { status: 422, data: {} },
    })).rejects.toBeTruthy();
    await expect(onRejected({ config: { url: '/fun/list', method: 'get' }, code: 'ERR_NETWORK' })).rejects.toBeTruthy();

    const events = logger.__getQueuedEventsForTests();
    expect(events).toHaveLength(3);
    expect(events[0]).toMatchObject({
      level: 'error',
      event: 'http_error',
      message: 'GET /fun/get/1 -> 500',
      relatedRequestId: 'req_server_12345678',
      data: { method: 'GET', url: '/fun/get/1', status: 500 },
    });
    expect(JSON.stringify(events[0])).not.toContain('secret');
    expect(events[1]).toMatchObject({ level: 'warn', message: 'POST /fun/save -> 422' });
    expect(events[2]).toMatchObject({ level: 'warn', message: 'GET /fun/list -> ERR_NETWORK' });
  });

  it('does not log 401s, canceled requests or requests that opt out with skipErrorLog', async () => {
    const { createDovelaHttpClient, mockResponseUse, logger } = await buildFactoryModule();

    createDovelaHttpClient({ baseURL: 'https://third-party.test/api', attachAuth: false });
    const onRejected = mockResponseUse.mock.calls[0][1];

    await expect(onRejected({ config: { url: '/a' }, response: { status: 401, data: {} } })).rejects.toBeTruthy();
    await expect(onRejected({ config: { url: '/b' }, code: 'ERR_CANCELED' })).rejects.toBeTruthy();
    await expect(onRejected({ config: { url: '/c', skipErrorLog: true }, response: { status: 500, data: {} } })).rejects.toBeTruthy();

    expect(logger.__getQueuedEventsForTests()).toEqual([]);
  });
});
