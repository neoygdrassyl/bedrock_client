import { beforeEach, describe, expect, it, vi } from 'vitest';

const http = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() }));
vi.mock('../../../shared/api/http-common', () => ({ default: http }));

import service from './professional_registry.service';

describe('professional registry service', () => {
  beforeEach(() => { Object.values(http).forEach((fn) => fn.mockReset().mockResolvedValue({ data: {} })); });

  it('builds the list query without empty values and silences the HTTP error telemetry', () => {
    service.list({ q: '13439751', role: '', page: 2, nameFlag: '', minMonths: 0, includeDeleted: false });
    expect(http.get).toHaveBeenCalledWith('/professional-registry?q=13439751&page=2&minMonths=0', { skipDovelaErrorCapture: true });
    service.list();
    expect(http.get).toHaveBeenLastCalledWith('/professional-registry', { skipDovelaErrorCapture: true });
  });

  it('sends writes as JSON and keeps them out of the error telemetry', () => {
    service.create({ name: 'Ana' });
    service.update(7, { expectedVersion: 1 });
    service.setCanonicalName(7, { name: 'Ana' });
    service.setSpecificExperience(7, 'ARQ_PROY', { expectedVersion: 2, years: 4, months: 6 });
    service.restore(7, { expectedVersion: 2 });
    service.merge(7, { targetId: 8 });
    service.relink(7, 9, { registryId: 8 });
    service.resolve({ type: 'nombres' });
    service.consolidate({ apply: false });
    const config = { skipDovelaErrorCapture: true, headers: { 'Content-Type': 'application/json' } };
    expect(http.post).toHaveBeenCalledWith('/professional-registry', { name: 'Ana' }, config);
    expect(http.put).toHaveBeenCalledWith('/professional-registry/7', { expectedVersion: 1 }, config);
    expect(http.put).toHaveBeenCalledWith('/professional-registry/7/canonical-name', { name: 'Ana' }, config);
    expect(http.put).toHaveBeenCalledWith('/professional-registry/7/roles/ARQ_PROY/specific-experience', { expectedVersion: 2, years: 4, months: 6 }, config);
    expect(http.post).toHaveBeenCalledWith('/professional-registry/7/restore', { expectedVersion: 2 }, config);
    expect(http.post).toHaveBeenCalledWith('/professional-registry/7/merge', { targetId: 8 }, config);
    expect(http.post).toHaveBeenCalledWith('/professional-registry/7/participations/9/relink', { registryId: 8 }, config);
    expect(http.post).toHaveBeenCalledWith('/professional-registry/review/resolve', { type: 'nombres' }, config);
    expect(http.post).toHaveBeenCalledWith('/professional-registry/consolidate', { apply: false }, config);
  });

  it('deletes with the expected version in the body', () => {
    service.remove(7, { expectedVersion: 3 });
    expect(http.delete).toHaveBeenCalledWith('/professional-registry/7', { skipDovelaErrorCapture: true, headers: { 'Content-Type': 'application/json' }, data: { expectedVersion: 3 } });
  });

  it('reads detail, catalog and review queues', () => {
    service.get(7);
    service.catalog();
    service.reviewSummary();
    service.review({ type: 'nombres', page: 1 });
    expect(http.get).toHaveBeenCalledWith('/professional-registry/7', { skipDovelaErrorCapture: true });
    expect(http.get).toHaveBeenCalledWith('/professional-registry/catalog', { skipDovelaErrorCapture: true });
    expect(http.get).toHaveBeenCalledWith('/professional-registry/review/summary', { skipDovelaErrorCapture: true });
    expect(http.get).toHaveBeenCalledWith('/professional-registry/review?type=nombres&page=1', { skipDovelaErrorCapture: true });
  });
});
