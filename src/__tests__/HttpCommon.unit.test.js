import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const buildHttpModule = async () => {
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

  const mod = await import('../http-common');

  return {
    http: mod.default,
    createSpy,
    mockRequestUse,
    mockResponseUse,
  };
};

describe('http-common', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    window.user = { id: 1 };
  });

  afterEach(() => {
    window.user = null;
    vi.restoreAllMocks();
  });

  it('configura axios.create con baseURL y content-type multipart', async () => {
    const { createSpy } = await buildHttpModule();

    expect(createSpy).toHaveBeenCalledTimes(1);
    const config = createSpy.mock.calls[0][0];
    expect(config.baseURL).toBe(import.meta.env.VITE_API_URL);
    expect(config.headers['Content-type']).toContain('multipart/form-data');
  });

  it('request interceptor adjunta Bearer token cuando existe', async () => {
    const { mockRequestUse } = await buildHttpModule();

    expect(mockRequestUse).toHaveBeenCalledTimes(1);
    const onFulfilled = mockRequestUse.mock.calls[0][0];

    localStorage.setItem('dovela_token', 'abc123');
    const config = { headers: {} };
    const updated = onFulfilled(config);

    expect(updated.headers.Authorization).toBe('Bearer abc123');
  });

  it('request interceptor no adjunta Authorization cuando no existe token', async () => {
    const { mockRequestUse } = await buildHttpModule();

    const onFulfilled = mockRequestUse.mock.calls[0][0];
    const config = { headers: {} };
    const updated = onFulfilled(config);

    expect(updated.headers.Authorization).toBeUndefined();
  });

  it('response interceptor limpia sesion en 401 expired', async () => {
    const { mockResponseUse } = await buildHttpModule();

    expect(mockResponseUse).toHaveBeenCalledTimes(1);
    const onRejected = mockResponseUse.mock.calls[0][1];

    localStorage.setItem('dovela_token', 'abc123');
    localStorage.setItem('dovela_user', '{"id":1}');

    await expect(
      onRejected({
        response: {
          status: 401,
          data: { expired: true },
        },
      })
    ).rejects.toBeTruthy();

    expect(localStorage.getItem('dovela_token')).toBeNull();
    expect(localStorage.getItem('dovela_user')).toBeNull();
    expect(window.user).toBeNull();
  });

  it('response interceptor no limpia sesion en error no-401', async () => {
    const { mockResponseUse } = await buildHttpModule();
    const onRejected = mockResponseUse.mock.calls[0][1];

    localStorage.setItem('dovela_token', 'abc123');
    localStorage.setItem('dovela_user', '{"id":1}');

    const error = {
      response: {
        status: 500,
        data: { expired: true },
      },
    };

    await expect(onRejected(error)).rejects.toBe(error);
    expect(localStorage.getItem('dovela_token')).toBe('abc123');
    expect(localStorage.getItem('dovela_user')).toBe('{"id":1}');
    expect(window.user).toEqual({ id: 1 });
  });

  it('response interceptor no limpia sesion en 401 sin expired=true', async () => {
    const { mockResponseUse } = await buildHttpModule();
    const onRejected = mockResponseUse.mock.calls[0][1];

    localStorage.setItem('dovela_token', 'abc123');
    localStorage.setItem('dovela_user', '{"id":1}');

    const error = {
      response: {
        status: 401,
        data: { expired: false },
      },
    };

    await expect(onRejected(error)).rejects.toBe(error);
    expect(localStorage.getItem('dovela_token')).toBe('abc123');
    expect(localStorage.getItem('dovela_user')).toBe('{"id":1}');
    expect(window.user).toEqual({ id: 1 });
  });
});
