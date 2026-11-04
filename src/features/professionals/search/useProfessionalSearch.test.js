import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

vi.mock('./fallbackSearch', () => ({ professionalSearch: vi.fn() }));

import { useProfessionalSearch } from './useProfessionalSearch';

const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((ok, fail) => { resolve = ok; reject = fail; });
  return { promise, resolve, reject };
};
const flush = () => act(async () => { await Promise.resolve(); });

describe('useProfessionalSearch', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  const setup = (search) => renderHook(() => useProfessionalSearch({ search }));

  it('waits for the debounce and searches once with the collapsed last query', async () => {
    const search = vi.fn().mockResolvedValue([{ key: 'a' }]);
    const { result } = setup(search);
    act(() => { result.current.setQuery('an'); });
    act(() => { result.current.setQuery(' ana  mar '); });
    act(() => { vi.advanceTimersByTime(299); });
    expect(search).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(1); });
    expect(result.current.status).toBe('loading');
    await flush();
    expect(search).toHaveBeenCalledTimes(1);
    expect(search.mock.calls[0][0]).toBe('ana mar');
    expect(result.current).toMatchObject({ status: 'ready', suggestions: [{ key: 'a' }] });
  });

  it('stays idle under three characters and goes back to idle when the query is shortened', async () => {
    const search = vi.fn().mockResolvedValue([{ key: 'a' }]);
    const { result } = setup(search);
    act(() => { result.current.setQuery('an'); });
    act(() => { vi.advanceTimersByTime(500); });
    expect(search).not.toHaveBeenCalled();
    expect(result.current.status).toBe('idle');
    act(() => { result.current.setQuery('ana'); });
    act(() => { vi.advanceTimersByTime(300); });
    await flush();
    act(() => { result.current.setQuery('a'); });
    expect(result.current).toMatchObject({ status: 'idle', suggestions: [] });
  });

  it('cancels the request in flight and ignores its late answer', async () => {
    const first = deferred();
    const second = deferred();
    const search = vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const { result } = setup(search);
    act(() => { result.current.setQuery('ana'); });
    act(() => { vi.advanceTimersByTime(300); });
    await flush();
    const firstSignal = search.mock.calls[0][1].signal;
    act(() => { result.current.setQuery('ana maria'); });
    expect(firstSignal.aborted).toBe(true);
    act(() => { vi.advanceTimersByTime(300); });
    second.resolve([{ key: 'new' }]);
    await flush();
    first.resolve([{ key: 'stale' }]);
    await flush();
    expect(result.current.suggestions).toEqual([{ key: 'new' }]);
  });

  it('never stays loading: empty and failed searches settle without popups', async () => {
    const search = vi.fn().mockResolvedValueOnce([]).mockRejectedValueOnce(new Error('down'));
    const { result } = setup(search);
    act(() => { result.current.setQuery('ana'); });
    act(() => { vi.advanceTimersByTime(300); });
    await flush();
    expect(result.current.status).toBe('empty');
    act(() => { result.current.setQuery('anabel'); });
    act(() => { vi.advanceTimersByTime(300); });
    await flush();
    expect(result.current).toMatchObject({ status: 'unavailable', suggestions: [] });
  });

  it('settles as unavailable when the search throws synchronously', async () => {
    const search = vi.fn(() => { throw new Error('boom'); });
    const { result } = setup(search);
    act(() => { result.current.setQuery('ana'); });
    act(() => { vi.advanceTimersByTime(300); });
    await flush();
    await flush();
    expect(result.current).toMatchObject({ status: 'unavailable', suggestions: [] });
  });

  it('makes repeated suggestion keys unique', async () => {
    const search = vi.fn().mockResolvedValue([{ key: 'external:1' }, { key: 'external:1' }]);
    const { result } = setup(search);
    act(() => { result.current.setQuery('ana'); });
    act(() => { vi.advanceTimersByTime(300); });
    await flush();
    await flush();
    expect(result.current.suggestions.map((item) => item.key)).toEqual(['external:1', 'external:1#2']);
  });

  it('aborts the pending search on unmount', async () => {
    const search = vi.fn(() => new Promise(() => {}));
    const { result, unmount } = setup(search);
    act(() => { result.current.setQuery('ana'); });
    act(() => { vi.advanceTimersByTime(300); });
    await flush();
    unmount();
    expect(search.mock.calls[0][1].signal.aborted).toBe(true);
  });
});
