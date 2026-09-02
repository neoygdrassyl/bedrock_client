import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// http-profs and http-emails point at third-party hosts (different origin
// from VITE_API_URL) so they must reuse the shared factory WITHOUT
// attaching the app JWT, while still getting the 401/error handling.
const importClientWithMockedFactory = async (modulePath) => {
  vi.resetModules();

  const mockCreateDovelaHttpClient = vi.fn(() => ({}));

  vi.doMock('@/http-client-factory', () => ({
    createDovelaHttpClient: mockCreateDovelaHttpClient,
  }));

  await import(modulePath);

  return { mockCreateDovelaHttpClient };
};

describe('http-profs / http-emails client wiring', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('http-profs uses the shared factory with attachAuth disabled', async () => {
    const { mockCreateDovelaHttpClient } = await importClientWithMockedFactory('../app/services/http-profs');

    expect(mockCreateDovelaHttpClient).toHaveBeenCalledTimes(1);
    const config = mockCreateDovelaHttpClient.mock.calls[0][0];

    expect(config.baseURL).toBe(import.meta.env.VITE_API_PROF_URL);
    expect(config.headers['Content-type']).toContain('multipart/form-data');
    expect(config.attachAuth).toBe(false);
  });

  it('http-emails uses the shared factory with attachAuth disabled', async () => {
    const { mockCreateDovelaHttpClient } = await importClientWithMockedFactory('../app/services/http-emails');

    expect(mockCreateDovelaHttpClient).toHaveBeenCalledTimes(1);
    const config = mockCreateDovelaHttpClient.mock.calls[0][0];

    expect(config.baseURL).toBe(import.meta.env.VITE_API_EMAIL_URL);
    expect(config.headers['Content-type']).toContain('multipart/form-data');
    expect(config.attachAuth).toBe(false);
  });
});
