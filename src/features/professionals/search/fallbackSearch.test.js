import { describe, expect, it, vi } from 'vitest';

vi.mock('../../professional-registry', () => ({ professionalRegistryService: { lookup: vi.fn() } }));
vi.mock('../api/profesionals.service', () => ({ default: { getByName: vi.fn() } }));

import { createFallbackSearch, DEFAULT_SOURCE_NAMES, sourceNames } from './fallbackSearch';
import { ProfessionalSearchUnavailableError } from './professionalSuggestion';

const httpError = (status) => Object.assign(new Error(`HTTP ${status}`), { response: { status } });
const source = (name, answer) => ({
  name,
  search: vi.fn(typeof answer === 'function' ? answer : async () => answer),
});
const found = (key) => [{ key }];

describe('createFallbackSearch', () => {
  it('answers with the registry when it finds someone, without asking the external service', async () => {
    const registry = source('registry', found('registry:1'));
    const external = source('external', found('external:1'));
    expect(await createFallbackSearch([registry, external])('ana')).toEqual(found('registry:1'));
    expect(external.search).not.toHaveBeenCalled();
  });

  it('falls back to the external service when the registry fails (older backend: 404) or finds nobody', async () => {
    const external = source('external', found('external:1'));
    const failing = source('registry', async () => { throw httpError(404); });
    expect(await createFallbackSearch([failing, external])('ana')).toEqual(found('external:1'));
    const empty = source('registry', []);
    expect(await createFallbackSearch([empty, external])('ana')).toEqual(found('external:1'));
  });

  it('passes the query and signal to every source', async () => {
    const signal = new AbortController().signal;
    const registry = source('registry', []);
    const external = source('external', []);
    expect(await createFallbackSearch([registry, external])('ana', { signal })).toEqual([]);
    expect(registry.search).toHaveBeenCalledWith('ana', { signal });
    expect(external.search).toHaveBeenCalledWith('ana', { signal });
  });

  it('rejects as unavailable only when every source failed', async () => {
    const down = (status) => source('x', async () => { throw httpError(status); });
    await expect(createFallbackSearch([down(403), down(500)])('ana')).rejects.toBeInstanceOf(ProfessionalSearchUnavailableError);
    await expect(createFallbackSearch([])('ana')).rejects.toBeInstanceOf(ProfessionalSearchUnavailableError);
    expect(await createFallbackSearch([down(404), source('external', [])])('ana')).toEqual([]);
  });

  it('stops on a 401 (the session ended) instead of asking the next source', async () => {
    const unauthorized = httpError(401);
    const registry = source('registry', async () => { throw unauthorized; });
    const external = source('external', found('external:1'));
    await expect(createFallbackSearch([registry, external])('ana')).rejects.toBe(unauthorized);
    expect(external.search).not.toHaveBeenCalled();
  });

  it('stops on abort instead of falling back', async () => {
    const controller = new AbortController();
    const aborted = Object.assign(new Error('canceled'), { name: 'CanceledError', code: 'ERR_CANCELED' });
    const registry = source('registry', async () => { controller.abort(); throw aborted; });
    const external = source('external', found('external:1'));
    await expect(createFallbackSearch([registry, external])('ana', { signal: controller.signal })).rejects.toBe(aborted);
    expect(external.search).not.toHaveBeenCalled();
    await expect(createFallbackSearch([external])('ana', { signal: controller.signal })).rejects.toBeTruthy();
    expect(external.search).not.toHaveBeenCalled();
  });
});

describe('sourceNames', () => {
  it('reads the order from the setting, ignoring unknown names and repeats; empty means the default', () => {
    expect(sourceNames('external, Registry ,nope,external')).toEqual(['external', 'registry']);
    expect(sourceNames('external')).toEqual(['external']);
    expect(sourceNames('')).toEqual(DEFAULT_SOURCE_NAMES);
    expect(sourceNames(undefined)).toEqual(DEFAULT_SOURCE_NAMES);
    expect(sourceNames('nope')).toEqual(['registry', 'external']);
  });
});
