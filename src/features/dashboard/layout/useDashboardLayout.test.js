import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WIDGETS } from '../dashboardConfig';
import { createDefaultLayout, useDashboardLayout } from './useDashboardLayout';

const KEY = 'dovela-dashboard-layout:v2:7';
const DEFAULT_ORDER = WIDGETS.map((widget) => widget.id);

function stored() {
  return JSON.parse(localStorage.getItem(KEY));
}

function renderLayout(userId = 7) {
  return renderHook(() => useDashboardLayout(userId));
}

describe('useDashboardLayout', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('starts from the defaults: work widgets first, seeded favorites, nothing hidden', () => {
    const { result } = renderLayout();

    expect(result.current.layout).toEqual(createDefaultLayout());
    expect(result.current.layout.order.slice(0, 4)).toEqual(['kpis', 'favorites', 'recent', 'tracked']);
    expect(result.current.layout.favorites).toEqual(['/licencias', '/licencias/gestion', '/archivo', '/nomenclatura']);
    expect(result.current.layout.hidden).toEqual([]);
    expect(stored()).toEqual(createDefaultLayout());
  });

  it('keys the layout per user', () => {
    localStorage.setItem('dovela-dashboard-layout:v2:8', JSON.stringify({ hidden: ['kpis'] }));

    expect(renderLayout(7).result.current.layout.hidden).toEqual([]);
    expect(renderLayout(8).result.current.layout.hidden).toEqual(['kpis']);
    expect(renderHook(() => useDashboardLayout(undefined)).result.current.layout).toEqual(createDefaultLayout());
    expect(localStorage.getItem('dovela-dashboard-layout:v2:anon')).not.toBeNull();
  });

  it('merges a stored layout with the registry: drops unknown and duplicate ids, inserts new widgets after their default predecessor, fixes sizes', () => {
    localStorage.setItem(KEY, JSON.stringify({
      order: ['utilidades', 'kpis', 'removed-widget', 'kpis', 'radicacion'],
      hidden: ['ghost', 'recent', 'recent'],
      sizes: { kpis: 'md', radicacion: 'huge' },
      favorites: ['/archivo', '', 42, '/archivo'],
    }));

    const { layout } = renderLayout().result.current;

    expect(layout.order).toHaveLength(DEFAULT_ORDER.length);
    expect(new Set(layout.order)).toEqual(new Set(DEFAULT_ORDER));
    expect(layout.order.slice(0, 2)).toEqual(['utilidades', 'kpis']);
    // `favorites`, `recent` and `tracked` follow `kpis`, their nearest stored predecessor.
    expect(layout.order.slice(2, 5)).toEqual(['favorites', 'recent', 'tracked']);
    expect(layout.order).not.toContain('removed-widget');
    expect(layout.hidden).toEqual(['recent']);
    expect(layout.sizes.kpis).toBe('md');
    expect(layout.sizes.radicacion).toBe(createDefaultLayout().sizes.radicacion);
    expect(layout.favorites).toEqual(['/archivo']);
  });

  it('falls back to the defaults on corrupt storage', () => {
    localStorage.setItem(KEY, '{not json');
    expect(renderLayout().result.current.layout).toEqual(createDefaultLayout());
  });

  it('moves widgets among visible neighbours, skipping hidden ones', () => {
    const { result } = renderLayout();

    act(() => result.current.hide('favorites'));
    act(() => result.current.moveBy('recent', -1));
    // `favorites` is hidden, so the visible neighbour before `recent` is `kpis`.
    expect(result.current.layout.order.slice(0, 4)).toEqual(['recent', 'kpis', 'favorites', 'tracked']);

    const before = result.current.layout;
    act(() => result.current.moveBy('recent', -1));
    expect(result.current.layout).toBe(before);
  });

  it('places a widget before or after a target', () => {
    const { result } = renderLayout();

    act(() => result.current.moveRelative('utilidades', 'kpis', 'before'));
    expect(result.current.layout.order[0]).toBe('utilidades');

    act(() => result.current.moveRelative('utilidades', 'tracked', 'after'));
    expect(result.current.layout.order.indexOf('utilidades')).toBe(result.current.layout.order.indexOf('tracked') + 1);

    const before = result.current.layout;
    act(() => result.current.moveRelative('utilidades', 'missing', 'after'));
    act(() => result.current.moveRelative('kpis', 'kpis', 'after'));
    expect(result.current.layout).toBe(before);
  });

  it('moves to an absolute index, clamped to the order', () => {
    const { result } = renderLayout();
    act(() => result.current.move('kpis', 999));
    expect(result.current.layout.order.at(-1)).toBe('kpis');
  });

  it('accepts only known sizes', () => {
    const { result } = renderLayout();

    act(() => result.current.setSize('recent', 'full'));
    expect(result.current.layout.sizes.recent).toBe('full');

    act(() => result.current.setSize('recent', 'xl'));
    expect(result.current.layout.sizes.recent).toBe('full');
    expect(stored().sizes.recent).toBe('full');
  });

  it('hides and shows widgets idempotently', () => {
    const { result } = renderLayout();

    act(() => result.current.hide('tracked'));
    act(() => result.current.hide('tracked'));
    expect(result.current.layout.hidden).toEqual(['tracked']);

    act(() => result.current.show('tracked'));
    expect(result.current.layout.hidden).toEqual([]);
    expect(stored().hidden).toEqual([]);
  });

  it('toggles favorites and keeps them on reset', () => {
    const { result } = renderLayout();

    act(() => result.current.toggleFavorite('/calculadora'));
    act(() => result.current.toggleFavorite('/archivo'));
    expect(result.current.layout.favorites).toEqual(['/licencias', '/licencias/gestion', '/nomenclatura', '/calculadora']);

    act(() => {
      result.current.hide('kpis');
      result.current.setSize('recent', 'sm');
      result.current.move('utilidades', 0);
    });
    act(() => result.current.reset());

    const defaults = createDefaultLayout();
    expect(result.current.layout.order).toEqual(defaults.order);
    expect(result.current.layout.hidden).toEqual([]);
    expect(result.current.layout.sizes).toEqual(defaults.sizes);
    expect(result.current.layout.favorites).toEqual(['/licencias', '/licencias/gestion', '/nomenclatura', '/calculadora']);
  });

  it('keeps working in memory when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });

    const { result } = renderLayout();
    expect(result.current.layout).toEqual(createDefaultLayout());

    act(() => result.current.hide('kpis'));
    expect(result.current.layout.hidden).toEqual(['kpis']);
  });
});
