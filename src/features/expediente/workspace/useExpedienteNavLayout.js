import { useCallback, useEffect, useLayoutEffect, useState } from 'react';

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

/** True at >= 1024px: the module nav sits in the nav card; below it lives in an off-canvas sheet. */
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

function computeWidthFlags(width, thresholds) {
  const flags = {};
  for (const key of Object.keys(thresholds)) {
    // Unmeasurable (no node yet, no ResizeObserver) counts as "wide".
    flags[key] = width == null || width >= thresholds[key];
  }
  return flags;
}

function sameFlags(a, b) {
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every((key) => a[key] === b[key]);
}

/**
 * `{ [name]: boolean }` telling whether a DOM node (not a ref: it may come from the shell
 * store) is at least as wide as each named threshold in px. The pixel width is never
 * exposed, so consumers re-render at most once per threshold crossing instead of on every
 * frame of a width transition (the app sidebar opening or closing). `thresholds` must be
 * a stable object. Every flag is `true` while the node cannot be measured.
 */
export function useNodeWidthFlags(node, thresholds) {
  const [flags, setFlags] = useState(() => computeWidthFlags(null, thresholds));

  useEffect(() => {
    const apply = (width) => setFlags((previous) => {
      const next = computeWidthFlags(width, thresholds);
      return sameFlags(previous, next) ? previous : next;
    });
    if (!node || typeof ResizeObserver === 'undefined') {
      apply(null);
      return undefined;
    }
    const update = () => {
      const width = Math.round(node.clientWidth);
      apply(width > 0 ? width : null);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [node, thresholds]);

  return flags;
}

/**
 * True while a DOM node is at least `minWidth` px wide (and while it cannot be measured).
 * Measured before paint, so a layout that depends on it never flashes the wide variant.
 */
export function useNodeMinWidth(node, minWidth) {
  const [fits, setFits] = useState(true);

  useLayoutEffect(() => {
    if (!node || typeof ResizeObserver === 'undefined') {
      setFits(true);
      return undefined;
    }
    const update = () => {
      const width = Math.round(node.clientWidth);
      setFits(width <= 0 || width >= minWidth);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [node, minWidth]);

  return fits;
}
