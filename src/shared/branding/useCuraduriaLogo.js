import { useEffect, useSyncExternalStore } from 'react';
import BrandingService from '@/shared/api/branding.service';
import { infoCud } from '@/shared/config/jsons/vars';

// Curaduría logo configured from Configuración > Identidad. The stored value is a
// small data URL; when there is none (or the backend predates /api/branding) the
// bundled tenant logo (`infoCud.icon`) is used.
const CACHE_KEY = 'dovela-branding-logo';
const TOKEN_KEY = 'dovela_token';
const DATA_URL_PREFIX = /^data:image\/(png|webp|jpeg);base64,/;

const listeners = new Set();
let customLogo = readCache();
let loadPromise = null;
let loaded = false;

function readCache() {
  try {
    const value = localStorage.getItem(CACHE_KEY);
    return value && DATA_URL_PREFIX.test(value) ? value : null;
  } catch {
    return null;
  }
}

function writeCache(value) {
  try {
    if (value) localStorage.setItem(CACHE_KEY, value);
    else localStorage.removeItem(CACHE_KEY);
  } catch {
    // Storage full or blocked: the in-memory value still applies for this session.
  }
}

function hasSession() {
  try {
    return Boolean(localStorage.getItem(TOKEN_KEY));
  } catch {
    return false;
  }
}

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return customLogo;
}

function readLogo(response) {
  const body = response?.data ?? response;
  const payload = body && Object.prototype.hasOwnProperty.call(body, 'logo') ? body : body?.data;
  const logo = payload?.logo;
  return typeof logo === 'string' && DATA_URL_PREFIX.test(logo) ? logo : null;
}

/** Replaces the custom logo (null restores the default) and notifies every consumer. */
export function setCuraduriaLogo(value) {
  const next = typeof value === 'string' && DATA_URL_PREFIX.test(value) ? value : null;
  loaded = true;
  if (next === customLogo) return;
  customLogo = next;
  writeCache(next);
  emit();
}

/** Extracts the logo from a /api/branding response body. */
export function logoFromBrandingResponse(response) {
  return readLogo(response);
}

// Fetches once per page session, and only with a session: the login page also shows
// the brand mark and an unauthenticated request would bounce back to /login.
function ensureLoaded() {
  if (loaded || loadPromise || !hasSession()) return;
  loadPromise = BrandingService.getBranding()
    .then((response) => {
      setCuraduriaLogo(readLogo(response));
    })
    .catch((error) => {
      // Older backends have no /api/branding: no custom logo there. Other failures
      // keep the cached value and are retried on the next page load.
      if (error?.response?.status === 404) setCuraduriaLogo(null);
      else loaded = true;
    })
    .finally(() => {
      loadPromise = null;
    });
}

/**
 * Returns `{ logo, customLogo, isCustom }`: `logo` is what to render (custom logo or
 * the bundled tenant logo), `customLogo` the stored data URL or null.
 */
export function useCuraduriaLogo() {
  const current = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    ensureLoaded();
  }, []);

  return {
    logo: current || infoCud.icon || null,
    customLogo: current,
    isCustom: Boolean(current),
  };
}

export default useCuraduriaLogo;
