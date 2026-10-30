import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { getBrandingMock } = vi.hoisted(() => ({ getBrandingMock: vi.fn() }));

vi.mock('@/shared/api/branding.service', () => ({ default: { getBranding: getBrandingMock } }));
vi.mock('@/shared/config/jsons/vars', () => ({ infoCud: { icon: '/bundled-logo.png' } }));

const CUSTOM = 'data:image/png;base64,iVBORw0KGgo=';

// The hook keeps a module-level store; load a fresh copy per test.
async function loadModule() {
  vi.resetModules();
  return import('./useCuraduriaLogo');
}

describe('useCuraduriaLogo', () => {
  beforeEach(() => {
    getBrandingMock.mockReset();
    localStorage.clear();
    localStorage.setItem('dovela_token', 'jwt');
  });

  afterEach(() => localStorage.clear());

  it('uses the custom logo returned by /api/branding and caches it', async () => {
    getBrandingMock.mockResolvedValue({ data: { logo: CUSTOM } });
    const { useCuraduriaLogo } = await loadModule();

    const { result } = renderHook(() => useCuraduriaLogo());

    await waitFor(() => expect(result.current.logo).toBe(CUSTOM));
    expect(result.current).toEqual({ logo: CUSTOM, customLogo: CUSTOM, isCustom: true });
    expect(localStorage.getItem('dovela-branding-logo')).toBe(CUSTOM);
  });

  it('accepts the logo wrapped in a { data } envelope', async () => {
    const { logoFromBrandingResponse } = await loadModule();
    expect(logoFromBrandingResponse({ data: { data: { logo: CUSTOM } } })).toBe(CUSTOM);
    expect(logoFromBrandingResponse({ data: { logo: 'javascript:alert(1)' } })).toBeNull();
  });

  it('falls back to infoCud.icon and clears the cache when the backend has no /api/branding (404)', async () => {
    localStorage.setItem('dovela-branding-logo', CUSTOM);
    getBrandingMock.mockRejectedValue({ response: { status: 404 } });
    const { useCuraduriaLogo } = await loadModule();

    const { result } = renderHook(() => useCuraduriaLogo());
    expect(result.current.logo).toBe(CUSTOM);

    await waitFor(() => expect(result.current.logo).toBe('/bundled-logo.png'));
    expect(result.current.isCustom).toBe(false);
    expect(localStorage.getItem('dovela-branding-logo')).toBeNull();
  });

  it('keeps the cached logo on other failures', async () => {
    localStorage.setItem('dovela-branding-logo', CUSTOM);
    getBrandingMock.mockRejectedValue({ response: { status: 500 } });
    const { useCuraduriaLogo } = await loadModule();

    const { result } = renderHook(() => useCuraduriaLogo());

    await waitFor(() => expect(getBrandingMock).toHaveBeenCalledTimes(1));
    expect(result.current.logo).toBe(CUSTOM);
  });

  it('does not request branding without a session token', async () => {
    localStorage.removeItem('dovela_token');
    const { useCuraduriaLogo } = await loadModule();

    const { result } = renderHook(() => useCuraduriaLogo());

    expect(result.current).toEqual({ logo: '/bundled-logo.png', customLogo: null, isCustom: false });
    expect(getBrandingMock).not.toHaveBeenCalled();
  });

  it('requests once per page session even with several consumers', async () => {
    getBrandingMock.mockResolvedValue({ data: { logo: null } });
    const { useCuraduriaLogo } = await loadModule();

    renderHook(() => useCuraduriaLogo());
    renderHook(() => useCuraduriaLogo());
    await waitFor(() => expect(getBrandingMock).toHaveBeenCalledTimes(1));
    renderHook(() => useCuraduriaLogo());
    expect(getBrandingMock).toHaveBeenCalledTimes(1);
  });

  it('notifies every consumer when the logo changes and ignores invalid values', async () => {
    getBrandingMock.mockResolvedValue({ data: { logo: null } });
    const { useCuraduriaLogo, setCuraduriaLogo } = await loadModule();
    const first = renderHook(() => useCuraduriaLogo());
    const second = renderHook(() => useCuraduriaLogo());

    act(() => setCuraduriaLogo(CUSTOM));
    expect(first.result.current.logo).toBe(CUSTOM);
    expect(second.result.current.logo).toBe(CUSTOM);

    act(() => setCuraduriaLogo('https://evil.example/logo.svg'));
    expect(first.result.current.logo).toBe('/bundled-logo.png');
    expect(localStorage.getItem('dovela-branding-logo')).toBeNull();
  });
});
