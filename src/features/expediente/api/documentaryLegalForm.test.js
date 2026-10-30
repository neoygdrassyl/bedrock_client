import { beforeEach, describe, expect, it, vi } from 'vitest';
import http from '../../../shared/api/http-common';
import * as api from './documentaryLegalForm.service';

vi.mock('../../../shared/api/http-common', () => ({ default: { get: vi.fn(), put: vi.fn(), post: vi.fn(), delete: vi.fn() } }));

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

  it('updates the declaration with PUT and a JSON body, and accepts the new effective-VR fields of the legal form', async () => {
    http.put.mockResolvedValue({ data: { wasOutdated: true, state: 'declared' } });
    await expect(api.updateLegalFormDeclaration(1, { idempotencyKey: 'k', reason: 'r' })).resolves.toMatchObject({ wasOutdated: true });
    expect(http.put).toHaveBeenCalledWith('/fun/documentary/v1/projects/1/legal-form/declaration', { idempotencyKey: 'k', reason: 'r' }, { headers: { 'Content-Type': 'application/json' } });
    const effective = { rowId: 11, vrLabel: 'VR-2', versionSequence: 2, source: 'latest' };
    http.get.mockResolvedValue({ data: legalFormFixture({ outdated: false, declaration: { at: '2026-10-15T15:00:00.000Z', updatedAt: '2026-10-16T15:00:00.000Z', updatedBy: 3 },
      requirements: [{ ...legalFormFixture().requirements[0], effectiveSource: 'latest', referenceVerdict: 'pending', instances: [instance({ selection: null, selectionRevision: 0, effective, declared: null, outdated: false, controls: { total: 2, complies: 1, noDecision: 1 } })] }] }) });
    await expect(api.getLegalForm(1)).resolves.toMatchObject({ outdated: false });
  });

  it('sends the checklist marks as a JSON command and recognizes its revision conflict', async () => {
    http.put.mockResolvedValue({ data: { checklistRevision: 1 } });
    const command = { marks: { 511: '1' }, expectedChecklistRevision: 0, idempotencyKey: 'k', reason: 'r' };
    await api.saveLegalFormChecklist(1, command);
    expect(http.put).toHaveBeenCalledWith('/fun/documentary/v1/projects/1/legal-form/checklist', command, { headers: { 'Content-Type': 'application/json' } });
    await expect(api.saveLegalFormChecklist(1, {})).rejects.toThrow(/no corresponde/);
    expect(api.isRevisionConflict('CHECKLIST_REVISION_CONFLICT')).toBe(true);
    expect(api.legalFormErrorMessage({ response: { data: { error: { code: 'CHECKLIST_REVISION_CONFLICT' } } } })).toMatch(/lista de chequeo/);
  });

  it('accepts the checklist and warning fields of newer payloads and still passes older ones', () => {
    const extra = { warnings: [{ code: 'REQUIREMENTS_INCOMPLETE', message: 'm', sourceKeys: ['usosAny'] }], checklist: { marks: { 511: '1' }, checklistRevision: 2 }, checklistDefaults: { 511: '1' } };
    expect(api.validateLegalForm(legalFormFixture(extra), 1).warnings).toHaveLength(1);
    expect(api.validateLegalForm(legalFormFixture({ checklist: null }), 1).checklist).toBeNull();
    expect(() => api.validateLegalForm(legalFormFixture({ warnings: 'x' }), 1)).toThrow();
    expect(() => api.validateLegalForm(legalFormFixture({ checklist: { marks: [] } }), 1)).toThrow();
  });

  it('maps rule errors to actionable messages', () => {
    const failure = (code) => ({ response: { status: 409, data: { error: { code } } } });
    expect(api.legalFormErrorMessage(failure('OBSERVATION_REQUIRED'))).toMatch(/observación/);
    expect(api.legalFormErrorMessage(failure('LEGAL_FORM_STATE_PROGRESSED'))).toMatch(/ya no puede anularse/);
    expect(api.legalFormErrorMessage(failure('OTHER'))).toBeNull();
    expect(api.isRevisionConflict(api.legalFormErrorCode(failure('REVIEW_REVISION_CONFLICT')))).toBe(true);
  });

  it('accepts the legacy summary of a traditional expediente without the canonical lists', () => {
    const legacy = { state: 5, declared: true, declaredAt: '2026-03-02', clockName: 'Legal y debida forma', clockDesc: '30 días hábiles' };
    const traditional = { schemaVersion: api.LEGAL_FORM_SCHEMA, mode: 'traditional', applicable: false, project: { fun0Id: 1 }, state: 'not_applicable', legacy };
    expect(api.validateLegalForm(traditional, 1).legacy).toEqual(legacy);
    expect(api.validateLegalForm({ ...traditional, legacy: { ...legacy, declared: false, declaredAt: null, clockName: null, clockDesc: null } }, 1).legacy.declared).toBe(false);
    expect(api.validateLegalForm({ ...traditional, legacy: undefined }, 1).mode).toBe('traditional');
    expect(() => api.validateLegalForm({ ...traditional, legacy: { ...legacy, declared: 'yes' } }, 1)).toThrow();
    expect(() => api.validateLegalForm({ ...traditional, project: { fun0Id: 2 } }, 1)).toThrow();
  });

  it('validates the per-delivery versions and the checklist items leniently', () => {
    const approved = { status: 'approved', source: 'review', verdict: 'complies', reviewRevision: 2, reviewedByName: 'Marta Ruiz', reviewedAt: '2026-10-14T15:00:00.000Z' };
    const withVersions = legalFormFixture({
      requirements: [{ ...legalFormFixture().requirements[0], instances: [instance({ versions: [{ rowId: 11, vrLabel: 'VR-2', versionSequence: 2, isCurrent: true, evaluation: approved }, { rowId: 10, vrLabel: 'VR-1', versionSequence: 1, isCurrent: false, evaluation: { status: 'pending' } }] })] }],
      checklistItems: [{ code: '511', name: 'Formulario único', applies: true, delivered: true, verdict: 'complies', defaultMark: '1' }],
    });
    expect(api.validateLegalForm(withVersions, 1).requirements[0].instances[0].versions).toHaveLength(2);
    expect(api.validateLegalForm(legalFormFixture(), 1).checklistItems).toBeUndefined(); // older payloads still pass
    const badEvaluation = legalFormFixture({ requirements: [{ ...legalFormFixture().requirements[0], instances: [instance({ versions: [{ rowId: 10, vrLabel: 'VR-1', evaluation: { status: 'maybe' } }] })] }] });
    expect(() => api.validateLegalForm(badEvaluation, 1)).toThrow();
    expect(() => api.validateLegalForm(legalFormFixture({ checklistItems: [{ name: 'sin código' }] }), 1)).toThrow();
  });

  it('explains the review rule errors of the per-delivery evaluation', () => {
    const failure = (code) => ({ response: { status: 409, data: { error: { code } } } });
    expect(api.legalFormErrorMessage(failure('DOCUMENT_HAS_CONTROLS'))).toMatch(/controles de Central/);
    expect(api.legalFormErrorMessage(failure('REVIEW_SCOPE_MISMATCH'))).toMatch(/no corresponde a este documento/);
    expect(api.legalFormErrorMessage(failure('LEGAL_FORM_DECLARED'))).toMatch(/Anule la declaración/);
  });

  it('chooses and clears the VR of an instance and remembers the revision of a cleared choice', async () => {
    http.put.mockResolvedValue({ data: { unchanged: false, selection: { rowId: 10, selectionRevision: 3 } } });
    await api.selectLegalFormVr(1, 'k-1', { rowId: 10, expectedSelectionRevision: 2, idempotencyKey: 'i', reason: 'r' });
    expect(http.put.mock.calls[0][0]).toBe('/fun/documentary/v1/projects/1/legal-form/selections/k-1');
    http.delete.mockResolvedValue({ data: { unchanged: false, selection: null, selectionRevision: 3, documentKey: 'k-2' } });
    await api.clearLegalFormVr(1, 'k-2', { expectedSelectionRevision: 3, idempotencyKey: 'i', reason: 'r' });
    expect(http.delete.mock.calls[0][0]).toBe('/fun/documentary/v1/projects/1/legal-form/selections/k-2');
    expect(http.delete.mock.calls[0][1].data).toMatchObject({ expectedSelectionRevision: 3 });
    expect(api.selectionRevisionOf({ documentKey: 'k-2', selection: null })).toBe(3);
    expect(api.selectionRevisionOf({ documentKey: 'k-9', selection: { selectionRevision: 5 } })).toBe(5);
    expect(api.selectionRevisionOf({ documentKey: 'k-9', selection: null })).toBe(0);
    await expect(api.selectLegalFormVr(1, 'k-1', { rowId: 'x' })).rejects.toThrow();
  });

  it('explains the VR selection rule errors', () => {
    const failure = (code) => ({ response: { status: 409, data: { error: { code } } } });
    expect(api.legalFormErrorMessage(failure('SELECTION_NOT_APPROVED'))).toMatch(/entrega aprobada/);
    expect(api.legalFormErrorMessage(failure('SELECTION_REVISION_CONFLICT'))).toMatch(/elección del VR cambió/);
    expect(api.legalFormErrorMessage(failure('SELECTION_SCOPE_MISMATCH'))).toMatch(/no corresponde a este documento/);
  });
});
