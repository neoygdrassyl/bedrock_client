import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import fileDownload from 'js-file-download';
import * as api from '@/app/services/documentaryLegalForm.service';
import * as operations from '@/app/services/documentaryOperations.service';

import { buildChecklistPdf, CHECKLIST_CODES } from '../../../fun_forms/components/checklistPdf';
import { LegalFormPanel } from './LegalFormPanel';

const { saveCanonicalControl } = operations;

vi.mock('@/app/services/documentaryLegalForm.service', async (importOriginal) => ({
  ...(await importOriginal()),
  getLegalForm: vi.fn(), saveLegalFormReview: vi.fn(), saveLegalFormChecklist: vi.fn(), declareLegalForm: vi.fn(), revokeLegalForm: vi.fn(),
}));
vi.mock('@/app/services/documentaryOperations.service', () => ({ saveCanonicalControl: vi.fn(), saveCanonicalReview: vi.fn(), getCanonicalDocuments: vi.fn(), getCanonicalVersions: vi.fn(), createCanonicalSubmit: vi.fn(),
  documentaryReceiptRuleError: vi.fn(), getCanonicalVersionSubmitIds: vi.fn(), receiveCanonicalDocument: vi.fn(), updateCanonicalEvidence: vi.fn(), getCanonicalHistory: vi.fn(), getMissingRequirements: vi.fn(), refreshDocumentaryRequirements: vi.fn(), downloadCanonicalFile: vi.fn() }));
vi.mock('../../../fun_forms/components/checklistPdf', async (importOriginal) => ({ ...(await importOriginal()), buildChecklistPdf: vi.fn() }));
vi.mock('js-file-download', () => ({ default: vi.fn() }));
vi.mock('@/app/services/documentary.service', () => ({ documentaryError: (error) => error.message || 'Error' }));

const origin = { mode: 'canonical', project: { fun0Id: 1, idPublic: 'FUN-1' }, publication: { configurationId: 2, checksum: 'c' }, catalogue: { documents: [], classifications: [] } };
const controls = (total = 0, complies = 0) => ({ status: total ? 'unreviewed' : 'no_configured_controls', total, complies, doesNotComply: 0, unreviewed: total - complies });
const instance = (extra) => ({ documentKey: 'k-1', instanceLabel: null, currentRowId: 10, evidenceRevision: 1, vrLabel: 'VR-1', controls: controls(), review: null, reviewRevision: 0, verdict: 'pending', source: 'review', ...extra });
const requirement = (extra) => ({ documentCode: '511', documentId: 'd-511', title: 'Formulario único', required: true, delivered: true, currentRowId: 10, vrLabel: 'VR-1', controls: controls(),
  review: null, verdict: 'pending', blockers: [], groupCode: null, additional: false, allowsMultipleInstances: false, instances: [instance()], ...extra });
const legalForm = (extra = {}) => ({ schemaVersion: api.LEGAL_FORM_SCHEMA, mode: 'canonical', applicable: true, project: { fun0Id: 1, idPublic: 'FUN-1', state: 1 }, state: 'not_ready',
  requirements: [requirement()], groups: [], blockers: [], declaration: null, sheet: null, actions: { review: true, declare: false, revoke: false, sheet: true },
  evaluation: { cacheState: 'current', status: 'complete' }, ...extra });

// View rows of the shared documents table (scope=input, requirement documents only).
const receipt = (id, extra) => ({ id, submitId: 11, rowVersion: 1, evidenceRevision: 1, hasPhysical: false, files: { digital: null, scan: null }, vrLabel: 'VR-1', ...extra });
const pendingEvaluation = { status: 'pending', source: 'review', verdict: null, reviewRevision: 0 };
const viewRow = (extra = {}) => ({ rowKey: 'canonical:k-1', documentKey: 'k-1', documentClass: 'requirement', documentId: 'd-511', documentCode: '511', title: 'Formulario único', receivedDocumentRowId: 10,
  versionSequence: 1, versionCount: 1, catalogueDisplay: { code: '511', name: 'Formulario único' }, receipt: receipt(10), controls: [], evaluation: pendingEvaluation, actions: { evaluate: true }, ...extra });
const viewOf = (rows = [viewRow()]) => ({ readOnly: false, capabilities: { createDocument: true, receivePhysical: true, receiveDigital: true, review: true }, governance: { inputRevision: 1 },
  requirements: { documents: [] }, warnings: [], submits: [], rows, pagination: { nextAfterId: null }, counts: { canonicalDocuments: rows.length } });
const version = (id, sequence, evaluation, extra) => ({ ...receipt(id, { vrLabel: `VR-${sequence}` }), versionSequence: sequence, evaluation, ...extra });
const approved = { status: 'approved', source: 'review', verdict: 'complies', reviewRevision: 3, reviewedBy: 4, reviewedByName: 'Marta Ruiz', reviewedAt: '2026-10-14T15:00:00.000Z' };

beforeEach(() => {
  vi.clearAllMocks();
  operations.getCanonicalDocuments.mockResolvedValue(viewOf());
  operations.getCanonicalVersions.mockResolvedValue({ rows: [version(10, 1, pendingEvaluation)], nextAfterId: null });
});

describe('LegalFormPanel', () => {
  it('shows a not-ready expediente with blockers, the requirements still to deliver and the declare action disabled', async () => {
    api.getLegalForm.mockResolvedValue(legalForm({
      requirements: [requirement(), requirement({ documentCode: '600', documentId: 'd-600', title: 'Plano', delivered: false, instances: [], currentRowId: null, vrLabel: null })],
      blockers: [
        { code: 'VERDICT_PENDING', message: 'x', documentCode: '511', groupCode: null, documentKey: 'k-1' },
        { code: 'NOT_DELIVERED', message: 'y', documentCode: '600', groupCode: null, documentKey: null },
        { code: 'GROUP_NOT_SATISFIED', message: 'z', documentCode: null, groupCode: 'G1', documentKey: null },
      ],
    }));
    render(<LegalFormPanel origin={origin} canManage />);
    expect(await screen.findByTestId('legal-form-state')).toHaveTextContent('No lista');
    expect(screen.getByText('Sin entregar · 1')).toBeInTheDocument();
    expect(screen.getByText('Revisión pendiente · 1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Declarar legal y debida forma' })).toBeDisabled();
    const missing = screen.getByTestId('legal-form-missing');
    expect(within(missing).getByText('Requisitos sin entregar')).toBeInTheDocument();
    expect(within(missing).getByText('600 · Plano')).toBeInTheDocument();
    expect(within(missing).getByText('Grupo G1: falta cumplir el grupo')).toBeInTheDocument();
    expect(within(missing).queryByText(/511/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ver pendientes' }));
    expect(screen.getByText('Grupo G1')).toBeInTheDocument();
  });

  it('renders the shared documents table filtered to requirements, with Evaluación and no scan or medium columns', async () => {
    api.getLegalForm.mockResolvedValue(legalForm());
    operations.getCanonicalDocuments.mockResolvedValue(viewOf([
      viewRow({ evaluation: approved }),
      viewRow({ rowKey: 'canonical:k-2', documentKey: 'k-2', documentCode: '512', catalogueDisplay: { code: '512', name: 'Plano' }, receivedDocumentRowId: 11, receipt: receipt(11), evaluation: { status: 'rejected', source: 'review', reviewedByName: 'Luis Gómez' } }),
    ]));
    render(<LegalFormPanel origin={origin} canManage />);
    const table = await screen.findByRole('grid', { name: 'Documentos de legal y debida forma' });
    await within(table).findByText('Aprobado');
    expect(operations.getCanonicalDocuments).toHaveBeenCalledWith(origin, 0, expect.any(AbortSignal), { scope: 'input', documentClass: 'requirement' });
    const headers = within(table).getAllByRole('columnheader').map((header) => header.textContent);
    expect(headers).toEqual(expect.arrayContaining(['Documento', 'Última entrega', 'Evaluación', 'Versiones']));
    ['Físico', 'Digital', 'Escaneado'].forEach((name) => expect(headers).not.toContain(name));
    const rows = within(table).getAllByRole('row').filter((row) => row.hasAttribute('data-row-key'));
    expect(rows[0]).toHaveTextContent('Aprobado');
    expect(rows[0]).toHaveTextContent('por Marta Ruiz');
    expect(rows[1]).toHaveTextContent('Rechazado');
    expect(within(table).getAllByRole('button', { name: /^Evaluar 51/ })).toHaveLength(2);
  });

  it('shows the table without Evaluar actions when the expediente cannot be reviewed (declared)', async () => {
    api.getLegalForm.mockResolvedValue(legalForm({ state: 'declared', declaration: { at: '2026-10-15T15:00:00.000Z', by: 7 }, actions: { review: false, declare: false, revoke: true, sheet: true } }));
    render(<LegalFormPanel origin={origin} canManage />);
    await screen.findByRole('grid', { name: 'Documentos de legal y debida forma' });
    await screen.findByText('Formulario único');
    expect(screen.queryByRole('button', { name: /^Evaluar 511/ })).not.toBeInTheDocument();
  });

  it('declares a ready expediente with legal date and motive, then notifies the module', async () => {
    const changed = vi.fn();
    api.getLegalForm.mockResolvedValueOnce(legalForm({ state: 'ready', actions: { review: true, declare: true, revoke: false, sheet: true } }))
      .mockResolvedValue(legalForm({ state: 'declared', declaration: { at: '2026-10-15T15:00:00.000Z', by: 7 }, actions: { review: false, declare: false, revoke: true, sheet: true } }));
    api.declareLegalForm.mockResolvedValue({ state: 'declared' });
    render(<LegalFormPanel origin={origin} canManage onDeclarationChanged={changed} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Declarar legal y debida forma' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByLabelText('Fecha legal').value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    fireEvent.change(within(dialog).getByLabelText('Fecha legal'), { target: { value: '2026-10-14' } });
    expect(within(dialog).getByRole('button', { name: 'Declarar' })).toBeDisabled();
    fireEvent.change(within(dialog).getByLabelText('Motivo'), { target: { value: 'Revisión completa' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Declarar' }));
    await waitFor(() => expect(api.declareLegalForm).toHaveBeenCalledWith(1, { legalDate: '2026-10-14', reason: 'Revisión completa', idempotencyKey: expect.any(String) }));
    expect(changed).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('Expediente declarado en legal y debida forma.')).toBeInTheDocument();
    expect(await screen.findByTestId('legal-form-declaration')).toHaveTextContent('por el usuario 7');
  });

  it('keeps the dialog open with the rule message when the declaration is rejected', async () => {
    api.getLegalForm.mockResolvedValue(legalForm({ state: 'ready', actions: { review: true, declare: true, revoke: false, sheet: true } }));
    api.declareLegalForm.mockRejectedValue({ response: { status: 409, data: { error: { code: 'LEGAL_FORM_NOT_READY' } } } });
    render(<LegalFormPanel origin={origin} canManage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Declarar legal y debida forma' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Motivo'), { target: { value: 'Revisión' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Declarar' }));
    expect(await within(dialog).findByText(/aún no está listo/)).toBeInTheDocument();
    await waitFor(() => expect(api.getLegalForm).toHaveBeenCalledTimes(2));
  });

  it('revokes a declared expediente with a motive', async () => {
    const changed = vi.fn();
    api.getLegalForm.mockResolvedValue(legalForm({ state: 'declared', declaration: { at: '2026-10-15T15:00:00.000Z', by: 7 }, actions: { review: false, declare: false, revoke: true, sheet: true } }));
    api.revokeLegalForm.mockResolvedValue({ declaration: null });
    render(<LegalFormPanel origin={origin} canManage onDeclarationChanged={changed} />);
    expect(await screen.findByTestId('legal-form-state')).toHaveTextContent('Declarada');
    expect(screen.queryByRole('button', { name: 'Declarar legal y debida forma' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Revisar 511/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Anular declaración' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Motivo'), { target: { value: 'Error de folios' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Anular declaración' }));
    await waitFor(() => expect(api.revokeLegalForm).toHaveBeenCalledWith(1, { reason: 'Error de folios', idempotencyKey: expect.any(String) }));
    expect(changed).toHaveBeenCalledTimes(1);
  });

  const openSheet = async (name = 'Evaluar 511') => {
    fireEvent.click(await screen.findByRole('button', { name }));
    return screen.findByRole('dialog');
  };

  it('evaluates a delivery without controls with the reviewer verdict and reloads the table and the legal-form state', async () => {
    api.getLegalForm.mockResolvedValue(legalForm());
    operations.saveCanonicalReview.mockResolvedValue({ unchanged: false });
    render(<LegalFormPanel origin={origin} canManage />);
    const sheet = await openSheet();
    expect(within(sheet).getByText(/Formulario único · VR-1 · Versión 1/)).toBeInTheDocument();
    const save = within(sheet).getByRole('button', { name: 'Guardar evaluación' });
    expect(save).toBeDisabled();
    fireEvent.change(within(sheet).getByLabelText('Veredicto'), { target: { value: 'does_not_comply' } });
    expect(save).toBeDisabled();
    expect(within(sheet).getByLabelText('Observación (obligatoria)')).toBeInTheDocument();
    fireEvent.change(within(sheet).getByLabelText('Rango de folios'), { target: { value: '1-12' } });
    fireEvent.change(within(sheet).getByLabelText('Observación (obligatoria)'), { target: { value: 'Falta la firma' } });
    fireEvent.click(save);
    await waitFor(() => expect(operations.saveCanonicalReview).toHaveBeenCalledWith(1, 10, {
      verdict: 'does_not_comply', folioRange: '1-12', observation: 'Falta la firma', expectedReviewRevision: 0, idempotencyKey: expect.any(String), reason: 'Revisión de legal y debida forma',
    }));
    expect(await screen.findByText('Evaluación guardada.')).toBeInTheDocument();
    await waitFor(() => expect(api.getLegalForm).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(operations.getCanonicalDocuments).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('reuses the idempotent command after a network failure and reloads on a revision conflict', async () => {
    api.getLegalForm.mockResolvedValue(legalForm());
    operations.saveCanonicalReview.mockRejectedValueOnce({ message: 'Fallo de red' });
    render(<LegalFormPanel origin={origin} canManage />);
    const sheet = await openSheet();
    fireEvent.change(within(sheet).getByLabelText('Veredicto'), { target: { value: 'complies' } });
    fireEvent.click(within(sheet).getByRole('button', { name: 'Guardar evaluación' }));
    expect(await within(sheet).findByText('Fallo de red')).toBeInTheDocument();
    operations.saveCanonicalReview.mockRejectedValueOnce({ response: { status: 409, data: { error: { code: 'REVIEW_REVISION_CONFLICT' } } } });
    fireEvent.click(within(sheet).getByRole('button', { name: 'Guardar evaluación' }));
    await waitFor(() => expect(operations.saveCanonicalReview).toHaveBeenCalledTimes(2));
    expect(operations.saveCanonicalReview.mock.calls[1][2].idempotencyKey).toBe(operations.saveCanonicalReview.mock.calls[0][2].idempotencyKey);
    expect(await screen.findByText(/Los datos cambiaron/)).toBeInTheDocument();
    await waitFor(() => expect(api.getLegalForm).toHaveBeenCalledTimes(2));
  });

  it('explains rule errors of the review instead of treating them as a conflict', async () => {
    api.getLegalForm.mockResolvedValue(legalForm());
    operations.saveCanonicalReview.mockRejectedValue({ response: { status: 409, data: { error: { code: 'DOCUMENT_HAS_CONTROLS' } } } });
    render(<LegalFormPanel origin={origin} canManage />);
    const sheet = await openSheet();
    fireEvent.change(within(sheet).getByLabelText('Veredicto'), { target: { value: 'complies' } });
    fireEvent.click(within(sheet).getByRole('button', { name: 'Guardar evaluación' }));
    expect(await within(sheet).findByText(/tiene controles de Central/)).toBeInTheDocument();
    expect(api.getLegalForm).toHaveBeenCalledTimes(1);
  });

  it('lists the evaluations of every version and switches the sheet to another version', async () => {
    api.getLegalForm.mockResolvedValue(legalForm());
    operations.getCanonicalDocuments.mockResolvedValue(viewOf([viewRow({ receivedDocumentRowId: 11, versionSequence: 2, versionCount: 2, receipt: receipt(11, { vrLabel: 'VR-2' }) })]));
    operations.getCanonicalVersions.mockResolvedValue({ rows: [version(10, 1, approved), version(11, 2, pendingEvaluation)], nextAfterId: null });
    operations.saveCanonicalReview.mockResolvedValue({ unchanged: false });
    render(<LegalFormPanel origin={origin} canManage />);
    const sheet = await openSheet();
    expect(within(sheet).getByText(/Formulario único · VR-2 · Versión 2/)).toBeInTheDocument();
    expect(within(sheet).getByLabelText('Veredicto')).toHaveValue('');
    const previous = await within(sheet).findByRole('region', { name: 'Evaluaciones anteriores' });
    const [newest, oldest] = within(previous).getAllByRole('listitem');
    expect(newest).toHaveTextContent('VR-2 · Versión 2');
    expect(newest).toHaveTextContent('Sin evaluar');
    expect(newest).toHaveTextContent('En evaluación');
    expect(oldest).toHaveTextContent('VR-1 · Versión 1');
    expect(oldest).toHaveTextContent('Aprobado');
    expect(oldest).toHaveTextContent('por Marta Ruiz');
    fireEvent.click(within(oldest).getByRole('button', { name: /^Evaluar VR-1/ }));
    expect(await within(sheet).findByText(/Formulario único · VR-1 · Versión 1/)).toBeInTheDocument();
    expect(within(sheet).getByLabelText('Veredicto')).toHaveValue('complies');
    expect(within(sheet).getByText(/Revisado por Marta Ruiz · /)).toBeInTheDocument();
    fireEvent.change(within(sheet).getByLabelText('Veredicto'), { target: { value: 'not_applicable' } });
    fireEvent.click(within(sheet).getByRole('button', { name: 'Guardar evaluación' }));
    await waitFor(() => expect(operations.saveCanonicalReview).toHaveBeenCalledWith(1, 10, expect.objectContaining({ verdict: 'not_applicable', expectedReviewRevision: 3 })));
    // Switching versions reuses the loaded list.
    expect(operations.getCanonicalVersions).toHaveBeenCalledTimes(1);
  });

  const control = (id, title, review = null) => ({ controlId: id, title, review, values: [
    { sourceValueId: `${id}-ok`, label: 'Cumple', effect: 'complies' }, { sourceValueId: `${id}-no`, label: 'No cumple', effect: 'does_not_comply' }] });
  const openControls = async (list) => {
    api.getLegalForm.mockResolvedValue(legalForm());
    operations.getCanonicalDocuments.mockResolvedValue(viewOf([viewRow({ controls: list, actions: { review: true }, evaluation: { status: 'pending', source: 'controls' } })]));
    render(<LegalFormPanel origin={origin} canManage />);
    return openSheet();
  };

  it('opens the Central controls of a delivery in one form with a single Guardar', async () => {
    const sheet = await openControls([control('c-1', 'Firma del titular')]);
    expect(await within(sheet).findByText('Firma del titular')).toBeInTheDocument();
    expect(within(sheet).getAllByRole('button', { name: /^Guardar/ })).toHaveLength(1);
    expect(within(sheet).getByRole('button', { name: 'Guardar' })).toBeDisabled();
    expect(within(sheet).queryByLabelText('Veredicto')).not.toBeInTheDocument();
    fireEvent.change(within(sheet).getByLabelText('Resultado'), { target: { value: 'c-1-ok' } });
    expect(within(sheet).getByRole('button', { name: 'Guardar' })).toBeEnabled();
  });

  it('saves every changed control sequentially from the single form and shows who reviewed', async () => {
    const sheet = await openControls([
      control('c-1', 'Firma del titular'),
      control('c-2', 'Folios', { selectedSourceValueId: 'c-2-ok', observation: null, resultRevision: 3, effect: 'complies', current: true, actorName: 'Ana Pérez', decidedAt: '2026-10-14T15:00:00.000Z' }),
      control('c-3', 'Sello'),
    ]);
    await within(sheet).findByText('Firma del titular');
    expect(within(sheet).getByText(/Revisado por Ana Pérez · /)).toBeInTheDocument();
    expect(within(sheet).getAllByRole('button', { name: /^Guardar/ })).toHaveLength(1);
    const order = [];
    saveCanonicalControl.mockImplementation(async (fun0Id, rowId, controlId) => { order.push(controlId); });
    const selects = within(sheet).getAllByLabelText('Resultado');
    fireEvent.change(selects[0], { target: { value: 'c-1-ok' } });
    fireEvent.change(selects[1], { target: { value: 'c-2-no' } });
    fireEvent.change(within(sheet).getAllByLabelText('Observación')[1], { target: { value: 'Faltan folios' } });
    fireEvent.click(within(sheet).getByRole('button', { name: 'Guardar' }));
    await waitFor(() => expect(saveCanonicalControl).toHaveBeenCalledTimes(2));
    expect(order).toEqual(['c-1', 'c-2']);
    expect(saveCanonicalControl).toHaveBeenNthCalledWith(1, 1, 10, 'c-1', expect.objectContaining({ selectedSourceValueId: 'c-1-ok', observation: null, expectedEvidenceRevision: 1, expectedResultRevision: 0, reason: expect.any(String) }));
    expect(saveCanonicalControl).toHaveBeenNthCalledWith(2, 1, 10, 'c-2', expect.objectContaining({ selectedSourceValueId: 'c-2-no', observation: 'Faltan folios', expectedResultRevision: 3 }));
    expect(await screen.findByText('Evaluación guardada.')).toBeInTheDocument();
    await waitFor(() => expect(api.getLegalForm).toHaveBeenCalledTimes(2));
  });

  it('requires an observation for a non-complying control before sending anything, and stops at the first failure', async () => {
    const sheet = await openControls([control('c-1', 'Firma del titular'), control('c-2', 'Folios')]);
    await within(sheet).findByText('Firma del titular');
    const selects = within(sheet).getAllByLabelText('Resultado');
    fireEvent.change(selects[0], { target: { value: 'c-1-ok' } });
    fireEvent.change(selects[1], { target: { value: 'c-2-no' } });
    fireEvent.click(within(sheet).getByRole('button', { name: 'Guardar' }));
    expect(await within(sheet).findByText(/Escriba la observación de «Folios»/)).toBeInTheDocument();
    expect(saveCanonicalControl).not.toHaveBeenCalled();
    fireEvent.change(within(sheet).getAllByLabelText('Observación')[1], { target: { value: 'Falta' } });
    saveCanonicalControl.mockRejectedValueOnce({ message: 'Fallo de red' });
    fireEvent.click(within(sheet).getByRole('button', { name: 'Guardar' }));
    expect(await within(sheet).findByText('Fallo de red')).toBeInTheDocument();
    expect(saveCanonicalControl).toHaveBeenCalledTimes(1);
  });

  it('does not resend a stale control until the user picks a result for it', async () => {
    const stale = { selectedSourceValueId: 'c-1-ok', observation: 'Visto antes', resultRevision: 2, effect: 'complies', current: false };
    const sheet = await openControls([control('c-1', 'Firma del titular', stale), control('c-2', 'Folios')]);
    await within(sheet).findByText('Firma del titular');
    const selects = within(sheet).getAllByLabelText('Resultado');
    expect(selects[0]).toHaveValue(''); // the stale decision is not preselected
    expect(within(sheet).getAllByLabelText('Observación')[0]).toHaveValue('Visto antes');
    expect(within(sheet).getByRole('button', { name: 'Guardar' })).toBeDisabled();
    fireEvent.change(selects[1], { target: { value: 'c-2-ok' } });
    saveCanonicalControl.mockResolvedValue({});
    fireEvent.click(within(sheet).getByRole('button', { name: 'Guardar' }));
    await waitFor(() => expect(saveCanonicalControl).toHaveBeenCalledTimes(1));
    expect(saveCanonicalControl).toHaveBeenCalledWith(1, 10, 'c-2', expect.any(Object));
  });

  it('sends a stale control once the user picks a result, against its stored revision', async () => {
    const stale = { selectedSourceValueId: 'c-1-ok', observation: null, resultRevision: 2, effect: 'complies', current: false };
    const sheet = await openControls([control('c-1', 'Firma del titular', stale)]);
    await within(sheet).findByText('Firma del titular');
    fireEvent.change(within(sheet).getByLabelText('Resultado'), { target: { value: 'c-1-ok' } });
    saveCanonicalControl.mockResolvedValue({});
    fireEvent.click(within(sheet).getByRole('button', { name: 'Guardar' }));
    await waitFor(() => expect(saveCanonicalControl).toHaveBeenCalledWith(1, 10, 'c-1', expect.objectContaining({ selectedSourceValueId: 'c-1-ok', expectedResultRevision: 2 })));
  });

  it('evaluates an older version of a document with controls from its own receipt, starting from empty results', async () => {
    api.getLegalForm.mockResolvedValue(legalForm());
    const current = { selectedSourceValueId: 'c-1-ok', observation: null, resultRevision: 4, effect: 'complies', current: true };
    operations.getCanonicalDocuments.mockResolvedValue(viewOf([viewRow({ receivedDocumentRowId: 11, versionSequence: 2, versionCount: 2, receipt: receipt(11, { evidenceRevision: 2 }), controls: [control('c-1', 'Firma del titular', current)], actions: { review: true }, evaluation: { status: 'approved', source: 'controls' } })]));
    operations.getCanonicalVersions.mockResolvedValue({ rows: [version(10, 1, { status: 'pending', source: 'controls' }, { evidenceRevision: 5 }), version(11, 2, { status: 'approved', source: 'controls' }, { evidenceRevision: 2 })], nextAfterId: null });
    saveCanonicalControl.mockResolvedValue({});
    render(<LegalFormPanel origin={origin} canManage />);
    const sheet = await openSheet();
    expect(within(sheet).getByLabelText('Resultado')).toHaveValue('c-1-ok');
    const previous = await within(sheet).findByRole('region', { name: 'Evaluaciones anteriores' });
    fireEvent.click(within(previous).getByRole('button', { name: /^Evaluar VR-1/ }));
    await waitFor(() => expect(within(sheet).getByLabelText('Resultado')).toHaveValue(''));
    fireEvent.change(within(sheet).getByLabelText('Resultado'), { target: { value: 'c-1-ok' } });
    fireEvent.click(within(sheet).getByRole('button', { name: 'Guardar' }));
    await waitFor(() => expect(saveCanonicalControl).toHaveBeenCalledWith(1, 10, 'c-1', expect.objectContaining({ expectedEvidenceRevision: 5, expectedResultRevision: 0 })));
  });

  describe('partial failures of the controls form', () => {
    const failFirstOfTwo = async () => {
      const sheet = await openControls([control('c-1', 'Firma del titular'), control('c-2', 'Folios')]);
      await within(sheet).findByText('Firma del titular');
      const selects = within(sheet).getAllByLabelText('Resultado');
      fireEvent.change(selects[0], { target: { value: 'c-1-ok' } });
      fireEvent.change(selects[1], { target: { value: 'c-2-ok' } });
      saveCanonicalControl.mockResolvedValueOnce({}).mockRejectedValueOnce({ message: 'Fallo de red' });
      fireEvent.click(within(sheet).getByRole('button', { name: 'Guardar' }));
      expect(await within(sheet).findByText('Fallo de red')).toBeInTheDocument();
      return sheet;
    };

    it('retries only the failed control with the same idempotency key', async () => {
      const sheet = await failFirstOfTwo();
      expect(saveCanonicalControl).toHaveBeenCalledTimes(2);
      saveCanonicalControl.mockResolvedValue({});
      fireEvent.click(within(sheet).getByRole('button', { name: 'Guardar' }));
      await waitFor(() => expect(saveCanonicalControl).toHaveBeenCalledTimes(3));
      expect(saveCanonicalControl.mock.calls[2][2]).toBe('c-2');
      expect(saveCanonicalControl.mock.calls[2][3].idempotencyKey).toBe(saveCanonicalControl.mock.calls[1][3].idempotencyKey);
    });

    it('keeps the command of an untouched control when another one is edited', async () => {
      const sheet = await failFirstOfTwo();
      fireEvent.change(within(sheet).getAllByLabelText('Observación')[0], { target: { value: 'Nota' } }); // c-1 was saved: only its own command is dropped
      saveCanonicalControl.mockResolvedValue({});
      fireEvent.click(within(sheet).getByRole('button', { name: 'Guardar' }));
      await waitFor(() => expect(saveCanonicalControl).toHaveBeenCalledTimes(4));
      expect(saveCanonicalControl.mock.calls[2][2]).toBe('c-1');
      expect(saveCanonicalControl.mock.calls[3][2]).toBe('c-2');
      expect(saveCanonicalControl.mock.calls[3][3].idempotencyKey).toBe(saveCanonicalControl.mock.calls[1][3].idempotencyKey);
    });

    it('refreshes the table and the legal-form state when the sheet is closed after some controls were saved', async () => {
      const sheet = await failFirstOfTwo();
      expect(api.getLegalForm).toHaveBeenCalledTimes(1);
      fireEvent.click(within(sheet).getByRole('button', { name: 'Cancelar' }));
      await waitFor(() => expect(api.getLegalForm).toHaveBeenCalledTimes(2));
      await waitFor(() => expect(operations.getCanonicalDocuments).toHaveBeenCalledTimes(2));
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('does not refresh when the sheet is closed without saving anything', async () => {
      const sheet = await openControls([control('c-1', 'Firma del titular')]);
      await within(sheet).findByText('Firma del titular');
      fireEvent.click(within(sheet).getByRole('button', { name: 'Cancelar' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(api.getLegalForm).toHaveBeenCalledTimes(1);
      expect(operations.getCanonicalDocuments).toHaveBeenCalledTimes(1);
    });
  });

  it('shows the incomplete-evaluation warning with human labels and keeps declaring enabled', async () => {
    api.getLegalForm.mockResolvedValue(legalForm({
      state: 'ready', actions: { review: true, declare: true, revoke: false, sheet: true, checklist: true },
      warnings: [{ code: 'REQUIREMENTS_INCOMPLETE', message: 'm', sourceKeys: ['usosAny', 'desconocidaAny'] }], evaluation: { cacheState: 'current', status: 'incomplete', missingFacts: ['usosAny', 'areaAny'] },
    }));
    render(<LegalFormPanel origin={origin} canManage />);
    const warning = await screen.findByTestId('legal-form-warning');
    expect(within(warning).getByText('Evaluación incompleta')).toBeInTheDocument();
    expect(warning).toHaveTextContent('Faltan datos del FUN');
    ['Usos', 'Área', 'desconocidaAny'].forEach((label) => expect(within(warning).getByText(label)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Declarar legal y debida forma' })).toBeEnabled();
  });

  it('names who declared and who reviewed when the server provides it', async () => {
    api.getLegalForm.mockResolvedValue(legalForm({ state: 'declared', declaration: { at: '2026-10-15T15:00:00.000Z', by: 7, byName: 'Luis Gómez' }, actions: { review: true, declare: false, revoke: true, sheet: true } }));
    operations.getCanonicalDocuments.mockResolvedValue(viewOf([viewRow({ evaluation: approved })]));
    render(<LegalFormPanel origin={origin} canManage />);
    expect(await screen.findByTestId('legal-form-declaration')).toHaveTextContent('por Luis Gómez');
    const sheet = await openSheet();
    expect(within(sheet).getByText(/Revisado por Marta Ruiz · /)).toBeInTheDocument();
  });

  describe('traditional expedientes', () => {
    const traditionalOrigin = { mode: 'traditional', project: { fun0Id: 1, idPublic: 'FUN-1' } };
    const traditionalForm = (legacy) => ({ schemaVersion: api.LEGAL_FORM_SCHEMA, mode: 'traditional', applicable: false, project: { fun0Id: 1 }, state: 'not_applicable', legacy });

    it('shows a read-only consult card of the legacy declaration with no actions and no documents table', async () => {
      api.getLegalForm.mockResolvedValue(traditionalForm({ state: 5, declared: true, declaredAt: '2026-03-02', clockName: 'Legal y debida forma', clockDesc: '30 días hábiles' }));
      render(<LegalFormPanel origin={traditionalOrigin} canManage currentVersion={1} />);
      const card = await screen.findByTestId('legal-form-legacy');
      expect(card).toHaveTextContent('Declarada el 2 mar 2026');
      expect(card).toHaveTextContent('Legal y debida forma · 30 días hábiles');
      expect(card).toHaveTextContent('Estado actual del expediente: 5');
      expect(card).toHaveTextContent('módulo «Chequeo»');
      ['Declarar legal y debida forma', 'Anular declaración', 'Lista de chequeo'].forEach((name) => expect(screen.queryByRole('button', { name })).not.toBeInTheDocument());
      expect(screen.getByRole('button', { name: 'Actualizar' })).toBeInTheDocument();
      expect(screen.queryByRole('grid')).not.toBeInTheDocument();
      expect(operations.getCanonicalDocuments).not.toHaveBeenCalled();
    });

    it('says when the legacy declaration does not exist yet', async () => {
      api.getLegalForm.mockResolvedValue(traditionalForm({ state: 3, declared: false, declaredAt: null, clockName: null, clockDesc: null }));
      render(<LegalFormPanel origin={traditionalOrigin} canManage />);
      expect(await screen.findByTestId('legal-form-legacy')).toHaveTextContent('No declarada');
    });
  });

  describe('checklist', () => {
    const item = { id: 1, id_public: 'FUN-1', model: 2022 };
    const checklistForm = (extra = {}) => legalForm({ actions: { review: true, declare: false, revoke: false, sheet: true, checklist: true }, checklistDefaults: { 511: '1', 512: '0' }, checklist: null,
      requirements: [requirement({ title: 'Formulario único nacional' })], ...extra });
    const renderPanel = () => render(<LegalFormPanel origin={origin} canManage currentItem={item} currentVersion={1} swaMsg={{}} />);

    it('names every code with the legacy checklist catalogue and hints at rows that do not apply or are not delivered', async () => {
      api.getLegalForm.mockResolvedValue(checklistForm({
        requirements: [requirement({ title: 'Título del requisito' })],
        checklistItems: [
          { code: '511', name: 'Formulario único nacional', applies: true, delivered: true, verdict: 'complies', defaultMark: '1' },
          { code: '512', name: 'Memoria de cálculo estructural', applies: false, delivered: false, verdict: null, defaultMark: '2' },
          { code: '513', name: 'Planos arquitectónicos', applies: true, delivered: false, verdict: null, defaultMark: '0' },
        ],
      }));
      renderPanel();
      fireEvent.click(await screen.findByRole('button', { name: 'Lista de chequeo' }));
      const dialog = await screen.findByRole('dialog');
      expect(within(dialog).getByTestId('checklist-row-511')).toHaveTextContent('Formulario único nacional');
      expect(within(dialog).getByTestId('checklist-row-511')).not.toHaveTextContent('Título del requisito');
      expect(within(dialog).getByTestId('checklist-hint-512')).toHaveTextContent('No aplica a este expediente');
      expect(within(dialog).getByTestId('checklist-hint-513')).toHaveTextContent('Sin entregar');
      expect(within(dialog).queryByTestId('checklist-hint-511')).not.toBeInTheDocument();
      // A code the catalogue does not name falls back to the code itself.
      const unnamed = CHECKLIST_CODES.find((code) => !['511', '512', '513'].includes(String(code)));
      expect(within(dialog).getByTestId(`checklist-row-${unnamed}`)).toHaveTextContent(String(unnamed));
      // Print order is the order of the PDF template, not the order of the payload.
      const rendered = within(dialog).getAllByTestId(/^checklist-row-/).map((row) => row.getAttribute('data-testid').replace('checklist-row-', ''));
      expect(rendered).toEqual(CHECKLIST_CODES.map(String));
    });

    it('hides the action when the panel is mounted without the expediente version', async () => {
      api.getLegalForm.mockResolvedValue(checklistForm());
      render(<LegalFormPanel origin={origin} canManage />);
      await screen.findByTestId('legal-form-state');
      expect(screen.queryByRole('button', { name: 'Lista de chequeo' })).not.toBeInTheDocument();
    });

    it('opens with server defaults, saves only the overrides and then builds and downloads the PDF', async () => {
      const pdf = new Uint8Array([1, 2, 3]);
      api.getLegalForm.mockResolvedValue(checklistForm({ checklist: { marks: { 512: '2' }, checklistRevision: 4, updatedBy: 3, updatedByName: 'Eva Mora', updatedAt: '2026-10-14T15:00:00.000Z' } }));
      api.saveLegalFormChecklist.mockResolvedValue({ checklistRevision: 5 });
      buildChecklistPdf.mockResolvedValue(pdf);
      renderPanel();
      expect(await screen.findByTestId('legal-form-checklist-line')).toHaveTextContent('Lista de chequeo guardada por Eva Mora');
      fireEvent.click(screen.getByRole('button', { name: 'Lista de chequeo' }));
      const dialog = await screen.findByRole('dialog');
      expect(within(dialog).getByRole('heading', { name: 'Lista de chequeo' })).toBeInTheDocument();
      expect(within(dialog).getByTestId('checklist-row-511')).toHaveTextContent('Formulario único nacional');
      expect(within(dialog).getByRole('radio', { name: '511: SI' })).toBeChecked();
      expect(within(dialog).getByRole('radio', { name: '512: N/A' })).toBeChecked(); // saved mark wins over the default
      expect(within(dialog).getByRole('radio', { name: '513: N/A' })).toBeChecked(); // no mark nor default
      fireEvent.click(within(dialog).getByRole('radio', { name: '513: NO' }));
      fireEvent.click(within(dialog).getByRole('button', { name: 'Guardar y descargar' }));
      await waitFor(() => expect(fileDownload).toHaveBeenCalledWith(pdf, 'FORMULARIO DE REVISION GENERALFUN-1.pdf'));
      const command = api.saveLegalFormChecklist.mock.calls[0][1];
      expect(api.saveLegalFormChecklist.mock.calls[0][0]).toBe(1);
      expect(command).toMatchObject({ expectedChecklistRevision: 4, reason: 'Lista de chequeo de legal y debida forma', idempotencyKey: expect.any(String) });
      expect(command.marks).toEqual({ 512: '2', 513: '0' }); // only the overrides of the defaults, never all codes
      const build = buildChecklistPdf.mock.calls[0][0];
      expect(build).toMatchObject({ currentItem: item, currentVersion: 1 });
      expect(build.review.code).toBe(CHECKLIST_CODES.join(','));
      expect(build.review.checked.split(',')).toHaveLength(CHECKLIST_CODES.length);
      expect(api.saveLegalFormChecklist.mock.invocationCallOrder[0]).toBeLessThan(buildChecklistPdf.mock.invocationCallOrder[0]);
      expect(await screen.findByText('Lista de chequeo guardada.')).toBeInTheDocument();
    });

    it('resets the marks to the defaults and reports a revision conflict', async () => {
      api.getLegalForm.mockResolvedValue(checklistForm({ checklist: { marks: { 511: '0' }, checklistRevision: 2, updatedBy: 3, updatedAt: '2026-10-14T15:00:00.000Z' } }));
      api.saveLegalFormChecklist.mockRejectedValue({ response: { status: 409, data: { error: { code: 'CHECKLIST_REVISION_CONFLICT' } } } });
      renderPanel();
      fireEvent.click(await screen.findByRole('button', { name: 'Lista de chequeo' }));
      const dialog = await screen.findByRole('dialog');
      expect(within(dialog).getByRole('radio', { name: '511: NO' })).toBeChecked();
      fireEvent.click(within(dialog).getByRole('button', { name: 'Restablecer' }));
      expect(within(dialog).getByRole('radio', { name: '511: SI' })).toBeChecked();
      fireEvent.click(within(dialog).getByRole('button', { name: 'Guardar y descargar' }));
      expect(await screen.findByText(/Los datos cambiaron/)).toBeInTheDocument();
      expect(api.saveLegalFormChecklist.mock.calls[0][1]).toMatchObject({ marks: {}, expectedChecklistRevision: 2 }); // reset clears the overrides
      expect(buildChecklistPdf).not.toHaveBeenCalled();
    });

    it('skips the PUT and only downloads when the marks equal the stored overrides', async () => {
      const pdf = new Uint8Array([4]);
      buildChecklistPdf.mockResolvedValue(pdf);
      api.getLegalForm.mockResolvedValue(checklistForm({ checklist: { marks: { 512: '2' }, checklistRevision: 4, updatedBy: 3, updatedAt: '2026-10-14T15:00:00.000Z' } }));
      renderPanel();
      fireEvent.click(await screen.findByRole('button', { name: 'Lista de chequeo' }));
      const dialog = await screen.findByRole('dialog');
      fireEvent.click(within(dialog).getByRole('button', { name: 'Guardar y descargar' }));
      await waitFor(() => expect(fileDownload).toHaveBeenCalledWith(pdf, 'FORMULARIO DE REVISION GENERALFUN-1.pdf'));
      expect(api.saveLegalFormChecklist).not.toHaveBeenCalled();
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('skips the PUT when nothing is stored and the marks are the defaults', async () => {
      buildChecklistPdf.mockResolvedValue(new Uint8Array([5]));
      api.getLegalForm.mockResolvedValue(checklistForm());
      renderPanel();
      fireEvent.click(await screen.findByRole('button', { name: 'Lista de chequeo' }));
      fireEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Guardar y descargar' }));
      await waitFor(() => expect(fileDownload).toHaveBeenCalledTimes(1));
      expect(api.saveLegalFormChecklist).not.toHaveBeenCalled();
    });

    it('does not save when the expediente has no model, which the PDF generator requires', async () => {
      api.getLegalForm.mockResolvedValue(checklistForm());
      render(<LegalFormPanel origin={origin} canManage currentItem={{ id: 1, id_public: 'FUN-1' }} currentVersion={1} swaMsg={{}} />);
      fireEvent.click(await screen.findByRole('button', { name: 'Lista de chequeo' }));
      const dialog = await screen.findByRole('dialog');
      fireEvent.click(within(dialog).getByRole('radio', { name: '513: NO' }));
      fireEvent.click(within(dialog).getByRole('button', { name: 'Guardar y descargar' }));
      expect(await within(dialog).findByText(/no tiene el modelo definido/)).toBeInTheDocument();
      expect(api.saveLegalFormChecklist).not.toHaveBeenCalled();
      expect(buildChecklistPdf).not.toHaveBeenCalled();
    });

    it('is read-only without the checklist action: downloads with the stored marks and does not save', async () => {
      api.getLegalForm.mockResolvedValue(checklistForm({ actions: { review: true, declare: false, revoke: false, sheet: true, checklist: false } }));
      buildChecklistPdf.mockResolvedValue(new Uint8Array([9]));
      renderPanel();
      fireEvent.click(await screen.findByRole('button', { name: 'Lista de chequeo' }));
      const dialog = await screen.findByRole('dialog');
      expect(within(dialog).getByRole('radio', { name: '511: SI' })).toBeDisabled();
      expect(within(dialog).queryByRole('button', { name: 'Restablecer' })).not.toBeInTheDocument();
      fireEvent.click(within(dialog).getByRole('button', { name: 'Descargar' }));
      await waitFor(() => expect(fileDownload).toHaveBeenCalledTimes(1));
      expect(api.saveLegalFormChecklist).not.toHaveBeenCalled();
    });
  });
});
