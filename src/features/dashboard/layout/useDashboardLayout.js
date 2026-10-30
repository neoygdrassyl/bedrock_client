import { useCallback, useEffect, useRef, useState } from 'react';
import { WIDGETS, WIDGET_SIZES } from '../dashboardConfig';

// v2: new default order/sizes; v1 layouts are dropped so everyone starts from them.
const STORAGE_PREFIX = 'dovela-dashboard-layout:v2:';
const LAYOUT_VERSION = 1;

const DEFAULT_ORDER = WIDGETS.map((widget) => widget.id);
const KNOWN_IDS = new Set(DEFAULT_ORDER);

function buildDefaultSizes() {
  return Object.fromEntries(WIDGETS.map((widget) => [widget.id, widget.defaultSize]));
}

// Seeded favorites make the quick-access strip useful on day one.
const DEFAULT_HIDDEN = [];
const DEFAULT_FAVORITES = ['/licencias', '/licencias/gestion', '/archivo', '/nomenclatura'];

export function createDefaultLayout() {
  return {
    version: LAYOUT_VERSION,
    order: [...DEFAULT_ORDER],
    hidden: [...DEFAULT_HIDDEN],
    sizes: buildDefaultSizes(),
    favorites: [...DEFAULT_FAVORITES],
  };
}

function storageKey(userId) {
  return `${STORAGE_PREFIX}${userId ?? 'anon'}`;
}

/**
 * Merges a stored layout with the current widget registry: unknown ids are
 * dropped, new widgets are inserted after their nearest default predecessor,
 * and invalid sizes fall back to the widget default.
 */
function mergeWithDefaults(stored) {
  const defaults = createDefaultLayout();
  if (!stored || typeof stored !== 'object') return defaults;

  const seen = new Set();
  const order = (Array.isArray(stored.order) ? stored.order : []).filter((id) => {
    if (!KNOWN_IDS.has(id) || seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  DEFAULT_ORDER.forEach((id, defaultIndex) => {
    if (seen.has(id)) return;
    let insertAt = 0;
    for (let i = defaultIndex - 1; i >= 0; i -= 1) {
      const anchorIndex = order.indexOf(DEFAULT_ORDER[i]);
      if (anchorIndex !== -1) {
        insertAt = anchorIndex + 1;
        break;
      }
    }
    order.splice(insertAt, 0, id);
    seen.add(id);
  });

  const hidden = Array.from(new Set((Array.isArray(stored.hidden) ? stored.hidden : DEFAULT_HIDDEN).filter((id) => KNOWN_IDS.has(id))));

  const storedSizes = stored.sizes && typeof stored.sizes === 'object' ? stored.sizes : {};
  const sizes = Object.fromEntries(
    DEFAULT_ORDER.map((id) => [id, WIDGET_SIZES.includes(storedSizes[id]) ? storedSizes[id] : defaults.sizes[id]])
  );

  const favorites = Array.from(
    new Set((Array.isArray(stored.favorites) ? stored.favorites : DEFAULT_FAVORITES).filter((value) => typeof value === 'string' && value))
  );

  return { version: LAYOUT_VERSION, order, hidden, sizes, favorites };
}

function readLayout(key) {
  try {
    const raw = window.localStorage.getItem(key);
    return mergeWithDefaults(raw ? JSON.parse(raw) : null);
  } catch {
    return createDefaultLayout();
  }
}

function moveInArray(list, id, toIndex) {
  const from = list.indexOf(id);
  if (from === -1) return list;
  const next = list.filter((value) => value !== id);
  const clamped = Math.max(0, Math.min(toIndex, next.length));
  next.splice(clamped, 0, id);
  return next.every((value, index) => value === list[index]) ? list : next;
}

/**
 * Per-user dashboard layout persisted in localStorage.
 * Order indexes refer to the full order (hidden widgets included);
 * `moveBy` and `moveRelative` work on visible neighbours.
 */
export function useDashboardLayout(userId) {
  const key = storageKey(userId);
  const [layout, setLayout] = useState(() => readLayout(key));
  const lastSavedRef = useRef(null);

  useEffect(() => {
    const serialized = JSON.stringify(layout);
    if (lastSavedRef.current === serialized) return;
    lastSavedRef.current = serialized;
    try {
      window.localStorage.setItem(key, serialized);
    } catch {
      // Storage may be unavailable (private mode, quota); layout stays in memory.
    }
  }, [key, layout]);

  const move = useCallback((id, toIndex) => {
    setLayout((prev) => {
      const order = moveInArray(prev.order, id, toIndex);
      return order === prev.order ? prev : { ...prev, order };
    });
  }, []);

  const moveRelative = useCallback((id, targetId, placement) => {
    if (id === targetId) return;
    setLayout((prev) => {
      const without = prev.order.filter((value) => value !== id);
      const targetIndex = without.indexOf(targetId);
      if (targetIndex === -1) return prev;
      const order = moveInArray(prev.order, id, placement === 'after' ? targetIndex + 1 : targetIndex);
      return order === prev.order ? prev : { ...prev, order };
    });
  }, []);

  const moveBy = useCallback((id, delta) => {
    setLayout((prev) => {
      const hidden = new Set(prev.hidden);
      const visible = prev.order.filter((value) => !hidden.has(value));
      const visibleIndex = visible.indexOf(id);
      const neighbour = visible[visibleIndex + delta];
      if (visibleIndex === -1 || !neighbour) return prev;
      const without = prev.order.filter((value) => value !== id);
      const neighbourIndex = without.indexOf(neighbour);
      const order = moveInArray(prev.order, id, delta < 0 ? neighbourIndex : neighbourIndex + 1);
      return order === prev.order ? prev : { ...prev, order };
    });
  }, []);

  const setSize = useCallback((id, size) => {
    if (!WIDGET_SIZES.includes(size)) return;
    setLayout((prev) => (prev.sizes[id] === size ? prev : { ...prev, sizes: { ...prev.sizes, [id]: size } }));
  }, []);

  const hide = useCallback((id) => {
    setLayout((prev) => (prev.hidden.includes(id) ? prev : { ...prev, hidden: [...prev.hidden, id] }));
  }, []);

  const show = useCallback((id) => {
    setLayout((prev) => (prev.hidden.includes(id) ? { ...prev, hidden: prev.hidden.filter((value) => value !== id) } : prev));
  }, []);

  const toggleFavorite = useCallback((itemId) => {
    setLayout((prev) => ({
      ...prev,
      favorites: prev.favorites.includes(itemId)
        ? prev.favorites.filter((value) => value !== itemId)
        : [...prev.favorites, itemId],
    }));
  }, []);

  // Restores order, sizes and visibility; favorites are user content and are kept.
  const reset = useCallback(() => {
    setLayout((prev) => ({ ...createDefaultLayout(), favorites: prev.favorites }));
  }, []);

  return { layout, move, moveRelative, moveBy, setSize, hide, show, toggleFavorite, reset };
}
