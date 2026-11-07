import { beforeEach, describe, expect, it, vi } from 'vitest';

const http = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() }));
vi.mock('../../../shared/api/http-common', () => ({ default: http }));
const download = vi.hoisted(() => ({ downloadProtectedFile: vi.fn() }));
vi.mock('../../../shared/utils/pdfDownload', () => download);

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
    service.restore(7, { expectedVersion: 2 });
    service.merge(7, { targetId: 8 });
    service.relink(7, 9, { registryId: 8 });
    service.resolve({ type: 'nombres' });
    service.consolidate({ apply: false });
    const config = { skipDovelaErrorCapture: true, headers: { 'Content-Type': 'application/json' } };
    expect(http.post).toHaveBeenCalledWith('/professional-registry', { name: 'Ana' }, config);
    expect(http.put).toHaveBeenCalledWith('/professional-registry/7', { expectedVersion: 1 }, config);
    expect(http.put).toHaveBeenCalledWith('/professional-registry/7/canonical-name', { name: 'Ana' }, config);
    expect(service.setSpecificExperience).toBeUndefined();
    expect(http.post).toHaveBeenCalledWith('/professional-registry/7/restore', { expectedVersion: 2 }, config);
    expect(http.post).toHaveBeenCalledWith('/professional-registry/7/merge', { targetId: 8 }, config);
    expect(http.post).toHaveBeenCalledWith('/professional-registry/7/participations/9/relink', { registryId: 8 }, config);
    expect(http.post).toHaveBeenCalledWith('/professional-registry/review/resolve', { type: 'nombres' }, config);
    expect(http.post).toHaveBeenCalledWith('/professional-registry/consolidate', { apply: false }, config);
  });

  it('looks up FUN 5.2 suggestions quietly, cancellable and without logging the failure as an error', () => {
    const signal = new AbortController().signal;
    service.lookup('ana maría', { signal });
    expect(http.get).toHaveBeenCalledWith('/professional-registry/lookup?q=ana+mar%C3%ADa', { skipDovelaErrorCapture: true, skipErrorLog: true, signal });
    service.lookup('ana', { limit: 5 });
    expect(http.get).toHaveBeenLastCalledWith('/professional-registry/lookup?q=ana&limit=5', { skipDovelaErrorCapture: true, skipErrorLog: true, signal: undefined });
  });

  it('reads the FUN 5.2 role eligibility quietly and cancellable', () => {
    const signal = new AbortController().signal;
    service.roleEligibility(7, { signal });
    expect(http.get).toHaveBeenCalledWith('/professional-registry/7/role-eligibility', { skipDovelaErrorCapture: true, skipErrorLog: true, signal });
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

  it('lists, creates (as FormData), deletes and downloads certified experiences', () => {
    const form = new FormData();
    service.listExperienceCertificates(7);
    service.createExperienceCertificate(7, form);
    service.deleteExperienceCertificate(7, 4, { expectedVersion: 3 });
    service.downloadExperienceCertificateFile(7, 4, 'cert.pdf');
    expect(http.get).toHaveBeenCalledWith('/professional-registry/7/experience-certificates', { skipDovelaErrorCapture: true });
    expect(http.post).toHaveBeenCalledWith('/professional-registry/7/experience-certificates', form, { skipDovelaErrorCapture: true });
    expect(http.delete).toHaveBeenCalledWith('/professional-registry/7/experience-certificates/4', { skipDovelaErrorCapture: true, headers: { 'Content-Type': 'application/json' }, data: { expectedVersion: 3 } });
    expect(download.downloadProtectedFile).toHaveBeenCalledWith('/professional-registry/7/experience-certificates/4/file', 'cert.pdf', { skipDovelaErrorCapture: true });
  });

  it('lists, creates (as FormData), deletes and downloads validity certificates', () => {
    const form = new FormData();
    service.listValidityCertificates(7);
    service.createValidityCertificate(7, form);
    service.deleteValidityCertificate(7, 4, { expectedVersion: 3 });
    service.downloadValidityCertificateFile(7, 4, 'vigencia.pdf');
    service.downloadValidityCertificateFile(7, 5);
    expect(http.get).toHaveBeenCalledWith('/professional-registry/7/validity-certificates', { skipDovelaErrorCapture: true });
    expect(http.post).toHaveBeenCalledWith('/professional-registry/7/validity-certificates', form, { skipDovelaErrorCapture: true });
    expect(http.delete).toHaveBeenCalledWith('/professional-registry/7/validity-certificates/4', { skipDovelaErrorCapture: true, headers: { 'Content-Type': 'application/json' }, data: { expectedVersion: 3 } });
    expect(download.downloadProtectedFile).toHaveBeenCalledWith('/professional-registry/7/validity-certificates/4/file', 'vigencia.pdf', { skipDovelaErrorCapture: true });
    expect(download.downloadProtectedFile).toHaveBeenCalledWith('/professional-registry/7/validity-certificates/5/file', 'certificado-vigencia.pdf', { skipDovelaErrorCapture: true });
  });
});
