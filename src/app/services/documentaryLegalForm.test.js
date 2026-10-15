import { beforeEach, describe, expect, it, vi } from 'vitest';
import http from '../../http-common';
import * as operations from './documentaryOperations.service';
import * as api from './documentaryLegalForm.service';

vi.mock('../../http-common', () => ({ default: { get: vi.fn(), put: vi.fn(), post: vi.fn(), delete: vi.fn() } }));
vi.mock('./documentaryOperations.service', () => ({ getCanonicalDocuments: vi.fn() }));

const instance = (extra) => ({ documentKey: 'k-1', instanceLabel: null, currentRowId: 10, evidenceRevision: 1, vrLabel: 'VR-1', controls: { status: 'no_configured_controls', total: 0, complies: 0, doesNotComply: 0, unreviewed: 0 },
  review: null, reviewRevision: 0, verdict: 'pending', source: 'review', ...extra });
const legalFormFixture = (extra = {}) => ({
  schemaVersion: api.LEGAL_FORM_SCHEMA, mode: 'canonical', applicable: true, project: { fun0Id: 1, idPublic: 'FUN-1', state: 1 }, state: 'not_ready',
  requirements: [{ documentCode: '511', documentId: 'd-511', title: 'Formulario', required: true, delivered: true, currentRowId: 10, vrLabel: 'VR-1',
    controls: { status: 'no_configured_controls', total: 0, complies: 0, doesNotComply: 0, unreviewed: 0 }, review: null, verdict: 'pending', blockers: [],
    groupCode: null, additional: false, allowsMultipleInstances: false, instances: [instance()] }],
  groups: [], blockers: [{ code: 'VERDICT_PENDING', message: 'x', documentCode: '511', groupCode: null, documentKey: 'k-1' }], declaration: null, sheet: null,
  actions: { review: true, declare: false, revoke: false, sheet: true }, evaluation: { cacheState: 'current', status: 'complete' }, ...extra,
});

beforeEach(() => { vi.clearAllMocks(); });

describe('documentaryLegalForm.service', () => {
  it('reads and validates the legal-form contract of the expediente', async () => {
    http.get.mockResolvedValue({ data: legalFormFixture() });
    await expect(api.getLegalForm(1)).resolves.toMatchObject({ state: 'not_ready' });
    expect(http.get.mock.calls[0][0]).toBe('/fun/documentary/v1/projects/1/legal-form');
    http.get.mockResolvedValue({ data: legalFormFixture({ project: { fun0Id: 2 } }) });
    await expect(api.getLegalForm(1)).rejects.toThrow(/no corresponde/);
    http.get.mockResolvedValue({ data: legalFormFixture({ state: 'unknown' }) });
    await expect(api.getLegalForm(1)).rejects.toThrow();
  });

  it('accepts the traditional answer and tolerates unknown fields', () => {
    const traditional = { schemaVersion: api.LEGAL_FORM_SCHEMA, mode: 'traditional', applicable: false, project: { fun0Id: 1 }, state: 'not_applicable', requirements: [], groups: [], blockers: [], declaration: null, sheet: null, actions: {} };
    expect(api.validateLegalForm(traditional, 1).applicable).toBe(false);
    expect(api.validateLegalForm({ ...legalFormFixture(), futureField: 1 }, 1).futureField).toBe(1);
    expect(() => api.validateLegalForm({ ...traditional, state: 'ready' }, 1)).toThrow();
  });

  it('sends JSON commands to the review, sheet and declaration routes', async () => {
    http.put.mockResolvedValue({ data: { unchanged: false } });
    http.post.mockResolvedValue({ data: { state: 'declared' } });
    http.delete.mockResolvedValue({ data: { declaration: null } });
    const review = { verdict: 'complies', expectedReviewRevision: 0, idempotencyKey: 'k', reason: 'r' };
    await api.saveLegalFormReview(1, '5 11', review);
    expect(http.put).toHaveBeenCalledWith('/fun/documentary/v1/projects/1/legal-form/reviews/5%2011', review, { headers: { 'Content-Type': 'application/json' } });
    await expect(api.saveLegalFormReview(1, '511', { ...review, verdict: 'pending' })).rejects.toThrow(/veredicto/);
    await api.saveLegalFormSheet(1, { sheet: {}, expectedSheetRevision: 0 });
    expect(http.put.mock.calls[1][0]).toBe('/fun/documentary/v1/projects/1/legal-form/sheet');
    await api.declareLegalForm(1, { legalDate: '2026-10-15', idempotencyKey: 'k', reason: 'r' });
    expect(http.post.mock.calls[0][0]).toBe('/fun/documentary/v1/projects/1/legal-form/declaration');
    await api.revokeLegalForm(1, { idempotencyKey: 'k', reason: 'r' });
    expect(http.delete).toHaveBeenCalledWith('/fun/documentary/v1/projects/1/legal-form/declaration', { data: { idempotencyKey: 'k', reason: 'r' }, headers: { 'Content-Type': 'application/json' } });
  });

  it('maps rule errors to actionable messages', () => {
    const failure = (code) => ({ response: { status: 409, data: { error: { code } } } });
    expect(api.legalFormErrorMessage(failure('OBSERVATION_REQUIRED'))).toMatch(/observación/);
    expect(api.legalFormErrorMessage(failure('LEGAL_FORM_STATE_PROGRESSED'))).toMatch(/ya no puede anularse/);
    expect(api.legalFormErrorMessage(failure('OTHER'))).toBeNull();
    expect(api.isRevisionConflict(api.legalFormErrorCode(failure('REVIEW_REVISION_CONFLICT')))).toBe(true);
  });

  it('finds a delivery row across the pages of the canonical view', async () => {
    const page = (rows, nextAfterId) => ({ rows, pagination: { nextAfterId } });
    operations.getCanonicalDocuments.mockResolvedValueOnce(page([{ receivedDocumentRowId: 1 }], 25)).mockResolvedValueOnce(page([{ receivedDocumentRowId: 30 }], null));
    const found = await api.findCanonicalRow({ project: { fun0Id: 1 } }, 30);
    expect(found.row.receivedDocumentRowId).toBe(30);
    expect(operations.getCanonicalDocuments.mock.calls[1][1]).toBe(25);
    operations.getCanonicalDocuments.mockResolvedValueOnce(page([], null));
    await expect(api.findCanonicalRow({ project: { fun0Id: 1 } }, 99)).resolves.toBeNull();
  });
});
