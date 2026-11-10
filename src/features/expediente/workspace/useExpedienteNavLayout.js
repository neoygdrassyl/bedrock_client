import { useCallback, useEffect, useState } from 'react';

export const NAV_COLLAPSED_STORAGE_KEY = 'dovela-expediente-nav-collapsed';
export const WIDE_VIEWPORT_MIN_WIDTH = 1024;

function readCollapsed() {
  try {
    return window.localStorage.getItem(NAV_COLLAPSED_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

/** Collapse state of the expediente side nav, persisted per browser. */
export function useExpedienteNavCollapsed() {
  const [collapsed, setCollapsedState] = useState(readCollapsed);

  const setCollapsed = useCallback((value) => {
    setCollapsedState((previous) => {
      const next = typeof value === 'function' ? value(previous) : Boolean(value);
      try {
        window.localStorage.setItem(NAV_COLLAPSED_STORAGE_KEY, String(next));
      } catch {
        // Storage unavailable (private mode, quota): keep the in-memory value only.
      }
      return next;
    });
  }, []);

  const toggleCollapsed = useCallback(() => setCollapsed((previous) => !previous), [setCollapsed]);

  return { collapsed, setCollapsed, toggleCollapsed };
}

function isWideViewport() {
  return typeof window === 'undefined' || window.innerWidth >= WIDE_VIEWPORT_MIN_WIDTH;
}

/** True at >= 1024px: the side nav is docked; below it lives in an off-canvas sheet. */
export function useIsWideViewport() {
  const [wide, setWide] = useState(isWideViewport);

  useEffect(() => {
    const handleResize = () => setWide(isWideViewport());
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return wide;
}
