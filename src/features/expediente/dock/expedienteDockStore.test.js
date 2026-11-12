import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  DOCK_MAX_ITEMS,
  DOCK_MAX_OPEN,
  DOCK_STORAGE_KEY,
  __resetDockStoreForTests,
  addToDock,
  closeItem,
  getDockSnapshot,
  minimize,
  sanitizeDockItems,
  setActiveWorkspace,
  setDockSearchOpen,
  toggleWindow,
  useExpedienteDock,
} from './expedienteDockStore';

let tick = 0;
const clock = () => {
  tick += 1;
  return tick;
};

const stored = () => JSON.parse(window.localStorage.getItem(DOCK_STORAGE_KEY) || 'null');
const openRadicados = () => getDockSnapshot().items.filter((item) => item.open).map((item) => item.radicado);

beforeEach(() => {
  tick = 0;
  window.localStorage.clear();
  __resetDockStoreForTests({ clock });
});

afterEach(() => {
  window.localStorage.clear();
});

describe('expedienteDockStore', () => {
  it('adds, minimizes, toggles and closes items', () => {
    addToDock('68001-1-26-0231');
    expect(getDockSnapshot().items).toEqual([{ radicado: '68001-1-26-0231', open: true, addedAt: 1, openedAt: 1 }]);

    minimize('68001-1-26-0231');
    expect(openRadicados()).toEqual([]);

    toggleWindow('68001-1-26-0231');
    expect(openRadicados()).toEqual(['68001-1-26-0231']);

    closeItem('68001-1-26-0231');
    expect(getDockSnapshot().items).toEqual([]);
    expect(window.localStorage.getItem(DOCK_STORAGE_KEY)).toBeNull();
  });

  it('ignores empty radicados and does not duplicate an existing one', () => {
    addToDock('  ');
    addToDock('Sin radicado');
    addToDock(' A-1 ', { open: false });
    addToDock('A-1', { open: true });
    expect(getDockSnapshot().items).toHaveLength(1);
    expect(getDockSnapshot().items[0]).toEqual({ radicado: 'A-1', open: true, addedAt: 1, openedAt: 2 });
  });

  it(`keeps at most ${DOCK_MAX_OPEN} windows open, minimizing the one opened longest ago`, () => {
    ['A', 'B', 'C'].forEach((radicado) => addToDock(radicado));
    expect(openRadicados()).toEqual(['A', 'B', 'C']);

    addToDock('D');
    expect(openRadicados()).toEqual(['B', 'C', 'D']);

    // Re-opening A refreshes its openedAt, so B (now the oldest open) is minimized.
    toggleWindow('A');
    expect(openRadicados()).toEqual(['A', 'C', 'D']);
  });

  it(`keeps at most ${DOCK_MAX_ITEMS} items, dropping the oldest minimized one`, () => {
    for (let index = 1; index <= DOCK_MAX_ITEMS; index += 1) addToDock(`R-${index}`, { open: false });
    addToDock('R-new', { open: false });

    const radicados = getDockSnapshot().items.map((item) => item.radicado);
    expect(radicados).toHaveLength(DOCK_MAX_ITEMS);
    expect(radicados).not.toContain('R-1');
    expect(radicados).toContain('R-new');
  });

  it('persists items but never the session-only UI state', () => {
    addToDock('A');
    setDockSearchOpen(true);
    setActiveWorkspace('B');

    expect(stored()).toEqual([{ radicado: 'A', open: true, addedAt: 1, openedAt: 1 }]);
    expect(getDockSnapshot()).toMatchObject({ searchOpen: true, activeWorkspace: 'B' });

    // A fresh module state (new page load) hydrates items from storage only.
    __resetDockStoreForTests({ clock });
    expect(getDockSnapshot()).toMatchObject({ items: [{ radicado: 'A', open: true }], searchOpen: false, activeWorkspace: null });
  });

  it('closes the search popover when an expediente is added', () => {
    setDockSearchOpen(true);
    addToDock('A');
    expect(getDockSnapshot().searchOpen).toBe(false);
  });

  it.each([
    ['malformed JSON', '{not json'],
    ['a non-array payload', JSON.stringify({ radicado: 'A' })],
    ['an array of invalid items', JSON.stringify([null, 3, { radicado: '', open: true, addedAt: 1 }, { radicado: 'A', open: 'yes', addedAt: 1 }])],
  ])('starts empty when storage holds %s', (_label, payload) => {
    window.localStorage.setItem(DOCK_STORAGE_KEY, payload);
    __resetDockStoreForTests({ clock });
    expect(getDockSnapshot().items).toEqual([]);
  });

  it('repairs a persisted payload: drops duplicates and invalid rows and re-applies the limits', () => {
    const many = Array.from({ length: DOCK_MAX_ITEMS + 2 }, (_, index) => ({ radicado: `R-${index}`, open: true, addedAt: index }));
    const items = sanitizeDockItems([...many, { radicado: 'R-9', open: false, addedAt: 99 }, { radicado: 'X', open: true }]);

    expect(items).toHaveLength(DOCK_MAX_ITEMS);
    expect(items.filter((item) => item.open)).toHaveLength(DOCK_MAX_OPEN);
    expect(new Set(items.map((item) => item.radicado)).size).toBe(items.length);
  });

  it('keeps working in memory when localStorage throws', () => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = () => { throw new Error('quota'); };
    try {
      expect(() => addToDock('A')).not.toThrow();
      expect(openRadicados()).toEqual(['A']);
    } finally {
      Storage.prototype.setItem = original;
    }
  });

  it('notifies React subscribers through useExpedienteDock', () => {
    const { result } = renderHook(() => useExpedienteDock());
    expect(result.current.items).toEqual([]);

    act(() => { addToDock('A'); });
    expect(result.current.items.map((item) => item.radicado)).toEqual(['A']);

    act(() => { closeItem('A'); });
    expect(result.current.items).toEqual([]);
  });

  it('syncs items written by another tab', () => {
    const { result } = renderHook(() => useExpedienteDock());
    const payload = JSON.stringify([{ radicado: 'Z', open: false, addedAt: 5 }]);
    window.localStorage.setItem(DOCK_STORAGE_KEY, payload);

    act(() => {
      window.dispatchEvent(new window.StorageEvent('storage', { key: DOCK_STORAGE_KEY, newValue: payload }));
    });
    expect(result.current.items).toEqual([{ radicado: 'Z', open: false, addedAt: 5 }]);
  });
});
