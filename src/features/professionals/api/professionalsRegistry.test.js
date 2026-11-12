import { describe, expect, it, vi } from 'vitest';
import { isProfessionalsRegistryEnabled, professionalsApiUrl } from './professionalsRegistry';

const PROD_URL = 'https://server.prof.example.com/api';

describe('professionals registry configuration', () => {
  it('is disabled in local/dev unless VITE_PROFESSIONALS_API_URL is set, even with the legacy production URL', () => {
    expect(professionalsApiUrl({ DEV: true, PROD: false, VITE_API_PROF_URL: PROD_URL })).toBe('');
    expect(isProfessionalsRegistryEnabled({ PROD: false, VITE_API_PROF_URL: PROD_URL, VITE_PROFESSIONALS_API_URL: '  ' })).toBe(false);
    expect(professionalsApiUrl({ PROD: false, VITE_PROFESSIONALS_API_URL: 'http://127.0.0.1:4000/api' })).toBe('http://127.0.0.1:4000/api');
  });

  it('keeps the legacy VITE_API_PROF_URL only for production builds, where the explicit variable wins', () => {
    expect(professionalsApiUrl({ PROD: true, VITE_API_PROF_URL: PROD_URL })).toBe(PROD_URL);
    expect(professionalsApiUrl({ PROD: true, VITE_API_PROF_URL: PROD_URL, VITE_PROFESSIONALS_API_URL: 'https://staging/api' })).toBe('https://staging/api');
    expect(professionalsApiUrl({ PROD: true })).toBe('');
  });
});

describe('profesionals.service without a configured registry', () => {
  it('sends nothing: find-or-create is skipped, lookups answer empty and registry changes fail clearly', async () => {
    vi.resetModules();
    const post = vi.fn(); const get = vi.fn(); const put = vi.fn();
    vi.doMock('./http-profs', () => ({ default: { post, get, put, delete: vi.fn() } }));
    vi.doMock('./professionalsRegistry', async (importOriginal) => ({ ...(await importOriginal()), isProfessionalsRegistryEnabled: () => false }));
    const { default: service } = await import('./profesionals.service');
    await expect(service.createOrFind(new FormData())).resolves.toMatchObject({ data: null, skipped: true });
    await expect(service.getByName('ana')).resolves.toMatchObject({ data: [] });
    await expect(service.update(1, {})).rejects.toThrow(/no está configurado/);
    expect(post).not.toHaveBeenCalled();
    expect(get).not.toHaveBeenCalled();
    expect(put).not.toHaveBeenCalled();
    vi.doUnmock('./http-profs'); vi.doUnmock('./professionalsRegistry');
  });
});
