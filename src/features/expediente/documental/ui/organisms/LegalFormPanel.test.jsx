import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import fileDownload from 'js-file-download';
import * as api from '@/features/expediente/api/documentaryLegalForm.service';
import * as operations from '@/features/expediente/api/documentaryOperations.service';

import { buildChecklistPdf, CHECKLIST_CODES } from '../../../fun/fun_forms/components/checklistPdf';
import { LegalFormPanel } from './LegalFormPanel';

const { saveCanonicalControl } = operations;

vi.mock('@/features/expediente/api/documentaryLegalForm.service', async (importOriginal) => ({
  ...(await importOriginal()),
  getLegalForm: vi.fn(), saveLegalFormReview: vi.fn(), saveLegalFormChecklist: vi.fn(), declareLegalForm: vi.fn(), revokeLegalForm: vi.fn(), updateLegalFormDeclaration: vi.fn(), selectLegalFormVr: vi.fn(), clearLegalFormVr: vi.fn(),
}));
vi.mock('@/features/expediente/api/documentaryOperations.service', () => ({ saveCanonicalControl: vi.fn(), saveCanonicalReview: vi.fn(), getCanonicalDocuments: vi.fn(), getCanonicalDocumentRow: vi.fn(), getCanonicalVersions: vi.fn(), createCanonicalSubmit: vi.fn(),
  documentaryReceiptRuleError: vi.fn(), getCanonicalVersionSubmitIds: vi.fn(), receiveCanonicalDocument: vi.fn(), updateCanonicalEvidence: vi.fn(), getCanonicalHistory: vi.fn(), getMissingRequirements: vi.fn(), refreshDocumentaryRequirements: vi.fn(), downloadCanonicalFile: vi.fn() }));
vi.mock('../../../fun/fun_forms/components/checklistPdf', async (importOriginal) => ({ ...(await importOriginal()), buildChecklistPdf: vi.fn() }));
vi.mock('js-file-download', () => ({ default: vi.fn() }));
vi.mock('@/features/expediente/api/documentary.service', () => ({ documentaryError: (error) => error.message || 'Error' }));

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

// The documents table of Radicación (deliveries, VR in use, versions) lives in the collapsed "Entregas y versiones" block.
async function renderWithDeliveries(ui) {
  const result = render(ui);
  fireEvent.click(await screen.findByRole('button', { name: /Entregas y versiones/ }));
  return result;
}

beforeEach(() => {
  vi.clearAllMocks();
  operations.getCanonicalDocuments.mockResolvedValue(viewOf());
  operations.getCanonicalVersions.mockResolvedValue({ rows: [version(10, 1, pendingEvaluation)], nextAfterId: null });
});

describe('LegalFormPanel', () => {
  it('lists every requirement in one checklist with its state, an unsatisfied alternative group as one row, and the declare action disabled', async () => {
    api.getLegalForm.mockResolvedValue(legalForm({
      requirements: [requirement(), requirement({ documentCode: '600', documentId: 'd-600', title: 'Plano', delivered: false, instances: [], currentRowId: null, vrLabel: null,
        blockers: [{ code: 'NOT_DELIVERED', message: 'y', documentCode: '600' }] })],
      blockers: [
        { code: 'VERDICT_PENDING', message: 'x', documentCode: '511', groupCode: null, documentKey: 'k-1' },
        { code: 'NOT_DELIVERED', message: 'y', documentCode: '600', groupCode: null, documentKey: null },
        { code: 'GROUP_NOT_SATISFIED', message: 'z', documentCode: null, groupCode: 'G1', documentKey: null },
      ],
      groups: [{ code: 'G1', mode: 'at_least_one', status: 'missing', satisfied: false, documentCodes: ['700', '701'], typologyName: 'Vivienda', optionLabel: 'Nueva' }],
    }));
    render(<LegalFormPanel origin={origin} canManage />);
    expect(await screen.findByTestId('legal-form-state')).toHaveTextContent('No lista');
    expect(screen.getByRole('button', { name: 'Declarar legal y debida forma' })).toBeDisabled();
    const checklist = screen.getByTestId('ldf-checklist');
    const group = within(checklist).getByTestId('ldf-group-request');
    expect(within(group).getByRole('button', { name: /^511 Formulario único: Sin evaluar/ })).toBeInTheDocument();
    expect(within(group).getByRole('button', { name: /^600 Plano: Sin entregar/ })).toBeInTheDocument();
    expect(within(group).getByRole('button', { name: /^700 \/ 701 Uno de: 700 · 701: Falta al menos uno/ })).toBeInTheDocument();
    expect(within(group).getByTestId('ldf-group-progress-request')).toHaveTextContent('1/3 entregados');
    expect(screen.queryByTestId('legal-form-pending')).not.toBeInTheDocument();
    // The documents table of Radicación stays available, collapsed.
    expect(screen.getByRole('button', { name: /Entregas y versiones/ })).toHaveAttribute('aria-expanded', 'false');
  });

  it('shows evaluation-level problems on top of the checklist and opens a delivered row in the evaluation sheet with why it is required', async () => {
    api.getLegalForm.mockResolvedValue(legalForm({
      blockers: [
        { code: 'SELECTION_INVALID', message: 'v', documentCode: '511', groupCode: null, documentKey: 'k-1' },
        { code: 'REQUIREMENTS_STALE', message: 'La evaluación cambió', documentCode: null, groupCode: null, documentKey: null },
      ],
      requirements: [requirement({ blockers: [{ code: 'SELECTION_INVALID', documentCode: '511', documentKey: 'k-1' }], instances: [instance({ selection: { rowId: 10, vrLabel: 'VR-1', versionSequence: 1 } })] }),
        requirement({ documentCode: '600', documentId: 'd-600', title: 'Plano', delivered: false, instances: [], currentRowId: null, vrLabel: null, controls: controls(3), blockers: [{ code: 'NOT_DELIVERED', documentCode: '600' }] })],
    }));
    render(<LegalFormPanel origin={origin} canManage />);
    expect(await screen.findByTestId('ldf-checklist-alert')).toHaveTextContent('Evaluación desactualizada');
    fireEvent.click(screen.getByRole('button', { name: /^600 Plano: Sin entregar/ }));
    const detail = await screen.findByRole('dialog');
    expect(within(detail).getByText('Documento requerido')).toBeInTheDocument();
    expect(within(detail).getByTestId('ldf-requirement-context')).toHaveTextContent('Requisito general de la solicitud.');
    expect(within(detail).getByTestId('ldf-requirement-controls')).toHaveTextContent('Al recibirlo se verifican 3 controles de Central.');
    fireEvent.click(within(detail).getByRole('button', { name: 'Cerrar' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /^511 Formulario único: Elección de VR inválida/ }));
    const sheet = await screen.findByRole('dialog');
    expect(await within(sheet).findByText('Evaluar documento')).toBeInTheDocument();
    expect(within(sheet).getByTestId('ldf-requirement-context')).toHaveTextContent('Requisito general de la solicitud.');
  });

  it('explains why a verdict or a typology option is pending', async () => {
    api.getLegalForm.mockResolvedValue(legalForm({
      sections: [{ typologyCode: 'T1', typologyName: 'Vivienda', state: 'selection_required', requirementCodes: [] }],
      requirements: [requirement({ blockers: [{ code: 'VERDICT_PENDING', reason: 'no_decision', documentCode: '511', documentKey: 'k-1' }] })],
      blockers: [
        { code: 'VERDICT_PENDING', reason: 'no_decision', message: 'x', documentCode: '511', groupCode: null, documentKey: 'k-1' },
        { code: 'TYPOLOGY_SELECTION_REQUIRED', reason: 'unknown_option', message: 'x', typologyCode: 'T1', documentCode: null, groupCode: null, documentKey: null },
      ],
    }));
    render(<LegalFormPanel origin={origin} canManage />);
    const group = await screen.findByTestId('ldf-group-request');
    expect(within(group).getByRole('button', { name: /^511 Formulario único: Sin evaluar \(Controles decididos sin aprobación\)/ })).toBeInTheDocument();
    expect(within(group).getByRole('button', { name: /^Elegir la opción de «Vivienda»: Falta elegir opción \(La opción elegida en el portal no existe en esta versión de Central\)/ })).toBeInTheDocument();
  });

  it('opens the evaluation of a checklist row whose document is not on the loaded page by asking for its row', async () => {
    api.getLegalForm.mockResolvedValue(legalForm({
      blockers: [{ code: 'VERDICT_PENDING', message: 'x', documentCode: '511', groupCode: null, documentKey: 'k-1' }],
    }));
    operations.getCanonicalDocuments.mockResolvedValue(viewOf([viewRow({ rowKey: 'canonical:k-9', documentKey: 'k-9', documentCode: '519', catalogueDisplay: { code: '519', name: 'Otro' }, receivedDocumentRowId: 19, receipt: receipt(19) })]));
    operations.getCanonicalDocumentRow.mockResolvedValue(viewRow());
    await renderWithDeliveries(<LegalFormPanel origin={origin} canManage />);
    await screen.findByText('Otro');
    fireEvent.click(screen.getByRole('button', { name: /^511 Formulario único:/ }));
    expect(await screen.findByText('Evaluar documento')).toBeInTheDocument();
    expect(operations.getCanonicalDocumentRow).toHaveBeenCalledWith(origin, 'k-1');
    expect(screen.getByText(/Formulario único · VR-1 · Versión 1/)).toBeInTheDocument();
    expect(screen.queryByText(/No se encontró ese documento/)).not.toBeInTheDocument();
  });

  it('does not ask for the row when the document is on the loaded page', async () => {
    api.getLegalForm.mockResolvedValue(legalForm({ blockers: [{ code: 'VERDICT_PENDING', message: 'x', documentCode: '511', groupCode: null, documentKey: 'k-1' }] }));
    await renderWithDeliveries(<LegalFormPanel origin={origin} canManage />);
    await screen.findByRole('grid', { name: 'Documentos de legal y debida forma' });
    await screen.findAllByText('Formulario único');
    fireEvent.click(screen.getByRole('button', { name: /^511 Formulario único:/ }));
    expect(await screen.findByText('Evaluar documento')).toBeInTheDocument();
    expect(operations.getCanonicalDocumentRow).not.toHaveBeenCalled();
  });

  it('loads every page of requirement rows so the order and the chips apply to the whole list', async () => {
    api.getLegalForm.mockResolvedValue(legalForm());
    const second = viewRow({ rowKey: 'canonical:k-2', documentKey: 'k-2', documentCode: '512', catalogueDisplay: { code: '512', name: 'Plano' }, receivedDocumentRowId: 11, receipt: receipt(11), evaluation: { status: 'rejected', source: 'review' } });
    operations.getCanonicalDocuments
      .mockResolvedValueOnce({ ...viewOf([viewRow({ evaluation: approved })]), pagination: { nextAfterId: 77 }, counts: { canonicalDocuments: 2 } })
      .mockResolvedValueOnce(viewOf([second]));
    await renderWithDeliveries(<LegalFormPanel origin={origin} canManage />);
    const table = await screen.findByRole('grid', { name: 'Documentos de legal y debida forma' });
    await within(table).findByText('Plano');
    expect(operations.getCanonicalDocuments).toHaveBeenCalledTimes(2);
    expect(operations.getCanonicalDocuments).toHaveBeenNthCalledWith(1, origin, 0, expect.any(AbortSignal), { scope: 'input', documentClass: 'requirement' });
    expect(operations.getCanonicalDocuments).toHaveBeenNthCalledWith(2, origin, 77, expect.any(AbortSignal), { scope: 'input', documentClass: 'requirement' });
    const keys = () => within(table).getAllByRole('row').filter((row) => row.hasAttribute('data-row-key')).map((row) => row.getAttribute('data-row-key'));
    expect(keys()).toEqual(['canonical:k-2', 'canonical:k-1']); // the rejected row of the second page sorts first
    expect(screen.queryByText(/aplican a esta página/)).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Paginación documental' })).not.toBeInTheDocument();
    expect(within(screen.getByRole('group', { name: 'Estado de los requisitos' })).getByRole('button', { name: /^Todos/ })).toHaveTextContent('2');
  });

  it('renders the shared documents table filtered to requirements, with Evaluación and no scan or medium columns', async () => {
    api.getLegalForm.mockResolvedValue(legalForm());
    operations.getCanonicalDocuments.mockResolvedValue(viewOf([
      viewRow({ evaluation: approved }),
      viewRow({ rowKey: 'canonical:k-2', documentKey: 'k-2', documentCode: '512', catalogueDisplay: { code: '512', name: 'Plano' }, receivedDocumentRowId: 11, receipt: receipt(11), evaluation: { status: 'rejected', source: 'review', reviewedByName: 'Luis Gómez' } }),
    ]));
    await renderWithDeliveries(<LegalFormPanel origin={origin} canManage />);
    const table = await screen.findByRole('grid', { name: 'Documentos de legal y debida forma' });
    await within(table).findByText('Aprobado');
    expect(operations.getCanonicalDocuments).toHaveBeenCalledWith(origin, 0, expect.any(AbortSignal), { scope: 'input', documentClass: 'requirement' });
    const headers = within(table).getAllByRole('columnheader').map((header) => header.textContent);
    expect(headers).toEqual(expect.arrayContaining(['Documento', 'Última entrega', 'Evaluación', 'Versiones']));
    ['Físico', 'Digital', 'Escaneado'].forEach((name) => expect(headers).not.toContain(name));
    const rows = within(table).getAllByRole('row').filter((row) => row.hasAttribute('data-row-key'));
    // Unresolved rows first: the rejected one precedes the approved one that has no chosen VR.
    expect(rows[0]).toHaveTextContent('Rechazado');
    expect(rows[1]).toHaveTextContent('Aprobado');
    expect(rows[1]).toHaveTextContent('por Marta Ruiz');
    expect(within(table).getAllByRole('button', { name: /^Evaluar 51/ })).toHaveLength(2);
  });

  it('shows the table without Evaluar actions when the expediente cannot be reviewed (declared)', async () => {
    api.getLegalForm.mockResolvedValue(legalForm({ state: 'declared', declaration: { at: '2026-10-15T15:00:00.000Z', by: 7 }, actions: { review: false, declare: false, revoke: true, sheet: true } }));
    await renderWithDeliveries(<LegalFormPanel origin={origin} canManage />);
    const table = await screen.findByRole('grid', { name: 'Documentos de legal y debida forma' });
    await within(table).findByText('Formulario único');
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

  describe('update of the declaration', () => {
    const declaredForm = (extra = {}) => legalForm({ state: 'declared', declaration: { at: '2026-10-15T15:00:00.000Z', by: 7, byName: 'Luis Gómez' }, outdated: false,
      actions: { review: true, declare: false, revoke: true, update: true, sheet: true }, ...extra });

    it('offers the update next to the annulment, warns about newer deliveries and sends the motive', async () => {
      api.getLegalForm.mockResolvedValueOnce(declaredForm({ outdated: true }))
        .mockResolvedValue(declaredForm({ declaration: { at: '2026-10-15T15:00:00.000Z', by: 7, byName: 'Luis Gómez', updatedAt: '2026-10-16T15:00:00.000Z', updatedBy: 8, updatedByName: 'Ana Pérez' } }));
      api.updateLegalFormDeclaration.mockResolvedValue({ wasOutdated: true, state: 'declared' });
      const changed = vi.fn();
      render(<LegalFormPanel origin={origin} canManage onDeclarationChanged={changed} />);
      expect(await screen.findByTestId('legal-form-outdated')).toHaveTextContent('Hay entregas más recientes que las declaradas');
      expect(screen.getByRole('button', { name: 'Anular declaración' })).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Actualizar legal y debida forma' }));
      const dialog = await screen.findByRole('dialog');
      expect(within(dialog).getByRole('button', { name: 'Actualizar declaración' })).toBeDisabled();
      fireEvent.change(within(dialog).getByLabelText('Motivo'), { target: { value: 'Nueva entrega aprobada' } });
      fireEvent.click(within(dialog).getByRole('button', { name: 'Actualizar declaración' }));
      await waitFor(() => expect(api.updateLegalFormDeclaration).toHaveBeenCalledWith(1, { reason: 'Nueva entrega aprobada', idempotencyKey: expect.any(String) }));
      expect(await screen.findByText('Declaración actualizada.')).toBeInTheDocument();
      expect(await screen.findByTestId('legal-form-declaration-updated')).toHaveTextContent(/Actualizada el .* por Ana Pérez/);
      expect(screen.queryByTestId('legal-form-outdated')).not.toBeInTheDocument();
      expect(changed).not.toHaveBeenCalled(); // state and clock do not change
    });

    it('hides the update without the action and says nothing about newer deliveries when up to date', async () => {
      api.getLegalForm.mockResolvedValue(declaredForm({ actions: { review: true, declare: false, revoke: true, update: false, sheet: true } }));
      render(<LegalFormPanel origin={origin} canManage />);
      await screen.findByTestId('legal-form-declaration');
      expect(screen.queryByRole('button', { name: 'Actualizar legal y debida forma' })).not.toBeInTheDocument();
      expect(screen.queryByTestId('legal-form-outdated')).not.toBeInTheDocument();
      expect(screen.queryByTestId('legal-form-declaration-updated')).not.toBeInTheDocument();
    });

    it('keeps the dialog open with the rule message and reloads when the update is rejected', async () => {
      api.getLegalForm.mockResolvedValue(declaredForm());
      api.updateLegalFormDeclaration.mockRejectedValue({ response: { status: 409, data: { error: { code: 'LEGAL_FORM_NOT_READY' } } } });
      render(<LegalFormPanel origin={origin} canManage />);
      fireEvent.click(await screen.findByRole('button', { name: 'Actualizar legal y debida forma' }));
      const dialog = await screen.findByRole('dialog');
      fireEvent.change(within(dialog).getByLabelText('Motivo'), { target: { value: 'Revisión' } });
      fireEvent.click(within(dialog).getByRole('button', { name: 'Actualizar declaración' }));
      expect(await within(dialog).findByText(/aún no está listo/)).toBeInTheDocument();
      await waitFor(() => expect(api.getLegalForm).toHaveBeenCalledTimes(2));
    });
  });

  const openSheet = async (name = 'Evaluar 511') => {
    fireEvent.click(await screen.findByRole('button', { name }));
    return screen.findByRole('dialog');
  };

  it('evaluates a delivery without controls with the reviewer verdict and reloads the table and the legal-form state', async () => {
    api.getLegalForm.mockResolvedValue(legalForm());
    operations.saveCanonicalReview.mockResolvedValue({ unchanged: false });
    await renderWithDeliveries(<LegalFormPanel origin={origin} canManage />);
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
    await renderWithDeliveries(<LegalFormPanel origin={origin} canManage />);
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
    await renderWithDeliveries(<LegalFormPanel origin={origin} canManage />);
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
    await renderWithDeliveries(<LegalFormPanel origin={origin} canManage />);
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
    await renderWithDeliveries(<LegalFormPanel origin={origin} canManage />);
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
    await renderWithDeliveries(<LegalFormPanel origin={origin} canManage />);
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
    await renderWithDeliveries(<LegalFormPanel origin={origin} canManage />);
    const warning = await screen.findByTestId('legal-form-warning');
    expect(within(warning).getByText('Evaluación incompleta')).toBeInTheDocument();
    expect(warning).toHaveTextContent('Faltan datos del FUN');
    ['Usos', 'Área', 'desconocidaAny'].forEach((label) => expect(within(warning).getByText(label)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Declarar legal y debida forma' })).toBeEnabled();
  });

  it('names who declared and who reviewed when the server provides it', async () => {
    api.getLegalForm.mockResolvedValue(legalForm({ state: 'declared', declaration: { at: '2026-10-15T15:00:00.000Z', by: 7, byName: 'Luis Gómez' }, actions: { review: true, declare: false, revoke: true, sheet: true } }));
    operations.getCanonicalDocuments.mockResolvedValue(viewOf([viewRow({ evaluation: approved })]));
    await renderWithDeliveries(<LegalFormPanel origin={origin} canManage />);
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

  describe('VR in use', () => {
    const chosen = { rowId: 10, vrLabel: 'VR-1', versionSequence: 1, selectedBy: 4, selectedByName: 'Marta Ruiz', selectedAt: '2026-10-14T15:00:00.000Z', selectionRevision: 4 };
    const latest = { rowId: 11, vrLabel: 'VR-2', versionSequence: 2, source: 'latest' };
    const form = (instanceExtra = {}, extra = {}) => legalForm({ actions: { review: true, declare: false, revoke: false, sheet: true, select: true },
      requirements: [requirement({ instances: [instance({ selection: null, selectionRevision: 0, effective: latest, selectedEvaluation: null, ...instanceExtra })] })], ...extra });
    const twoVersions = (first = approved, second = pendingEvaluation) => {
      operations.getCanonicalDocuments.mockResolvedValue(viewOf([viewRow({ receivedDocumentRowId: 11, versionSequence: 2, versionCount: 2, receipt: receipt(11, { vrLabel: 'VR-2' }) })]));
      operations.getCanonicalVersions.mockResolvedValue({ rows: [version(10, 1, first), version(11, 2, second)], nextAfterId: null });
    };

    it('uses the latest delivery by default and lets an approved older one be chosen optionally', async () => {
      api.getLegalForm.mockResolvedValue(form());
      twoVersions();
      api.selectLegalFormVr.mockResolvedValue({ unchanged: false, selection: chosen });
      await renderWithDeliveries(<LegalFormPanel origin={origin} canManage />);
      const sheet = await openSheet();
      const previous = await within(sheet).findByRole('region', { name: 'Evaluaciones anteriores' });
      expect(within(previous).getByTestId('effective-vr-line')).toHaveTextContent('Se usa: VR-2 (último)');
      expect(within(previous).queryByRole('button', { name: 'Volver al último' })).not.toBeInTheDocument();
      const [newest, oldest] = within(previous).getAllByRole('listitem');
      expect(newest).toHaveTextContent('En uso');
      expect(within(newest).queryByRole('button', { name: /^Usar VR-2/ })).not.toBeInTheDocument();
      expect(oldest).not.toHaveTextContent('En uso');
      expect(within(oldest).getByRole('button', { name: /^Usar VR-1/ })).toHaveTextContent('Usar esta entrega');
      const documentCalls = operations.getCanonicalDocuments.mock.calls.length;
      fireEvent.click(within(oldest).getByRole('button', { name: /^Usar VR-1/ }));
      await waitFor(() => expect(api.selectLegalFormVr).toHaveBeenCalledWith(1, 'k-1', expect.objectContaining({ rowId: 10, expectedSelectionRevision: 0, idempotencyKey: expect.any(String), reason: expect.any(String) })));
      await waitFor(() => expect(api.getLegalForm).toHaveBeenCalledTimes(2));
      await waitFor(() => expect(operations.getCanonicalDocuments.mock.calls.length).toBeGreaterThan(documentCalls));
      expect(await within(sheet).findByText('Entrega en uso elegida para legal y debida forma.')).toBeInTheDocument();
    });

    it('disables choosing a delivery that is not approved', async () => {
      api.getLegalForm.mockResolvedValue(form({ effective: { rowId: 10, vrLabel: 'VR-1', versionSequence: 1, source: 'latest' } }));
      operations.getCanonicalDocuments.mockResolvedValue(viewOf([viewRow()]));
      operations.getCanonicalVersions.mockResolvedValue({ rows: [version(10, 1, approved), version(11, 2, pendingEvaluation)], nextAfterId: null });
      await renderWithDeliveries(<LegalFormPanel origin={origin} canManage />);
      const sheet = await openSheet();
      const previous = await within(sheet).findByRole('region', { name: 'Evaluaciones anteriores' });
      const [newest] = within(previous).getAllByRole('listitem');
      expect(within(newest).getByRole('button', { name: /^Usar VR-2/ })).toBeDisabled();
      expect(newest).toHaveTextContent('Apruebe esta entrega para poder usarla');
    });

    it('shows the chosen delivery with who chose it and goes back to the latest against the stored revision', async () => {
      api.getLegalForm.mockResolvedValue(form({ selection: chosen, selectionRevision: 4, selectedEvaluation: approved, effective: { ...chosen, source: 'selected' } }));
      twoVersions();
      api.clearLegalFormVr.mockResolvedValue({ unchanged: false, selection: null, selectionRevision: 5, documentKey: 'k-1' });
      await renderWithDeliveries(<LegalFormPanel origin={origin} canManage />);
      const sheet = await openSheet();
      const previous = await within(sheet).findByRole('region', { name: 'Evaluaciones anteriores' });
      expect(within(previous).getByTestId('effective-vr-line')).toHaveTextContent('Se usa: VR-1 (elegido por Marta Ruiz)');
      const [newest, oldest] = within(previous).getAllByRole('listitem');
      expect(oldest).toHaveTextContent('En uso');
      expect(oldest).toHaveTextContent('Elegido por Marta Ruiz');
      expect(newest).not.toHaveTextContent('En uso');
      fireEvent.click(within(previous).getByRole('button', { name: 'Volver al último' }));
      await waitFor(() => expect(api.clearLegalFormVr).toHaveBeenCalledWith(1, 'k-1', expect.objectContaining({ expectedSelectionRevision: 4 })));
      expect(await within(sheet).findByText('Se usa de nuevo la última entrega.')).toBeInTheDocument();
    });

    it('offers neither choosing nor going back once the expediente is declared', async () => {
      api.getLegalForm.mockResolvedValue(form({ selection: chosen, selectionRevision: 4, selectedEvaluation: approved, effective: { ...chosen, source: 'selected' } }, { declaration: { at: '2026-10-15T15:00:00.000Z', by: 7 }, state: 'declared' }));
      twoVersions();
      await renderWithDeliveries(<LegalFormPanel origin={origin} canManage />);
      const sheet = await openSheet();
      const previous = await within(sheet).findByRole('region', { name: 'Evaluaciones anteriores' });
      expect(within(previous).queryByRole('button', { name: 'Volver al último' })).not.toBeInTheDocument();
      expect(within(previous).queryByRole('button', { name: /^Usar VR/ })).not.toBeInTheDocument();
      expect(previous).toHaveTextContent('anule la declaración');
    });

    it('explains a rule error of the choice without closing the sheet', async () => {
      api.getLegalForm.mockResolvedValue(form());
      twoVersions();
      api.selectLegalFormVr.mockRejectedValue({ response: { status: 409, data: { error: { code: 'SELECTION_NOT_APPROVED' } } } });
      await renderWithDeliveries(<LegalFormPanel origin={origin} canManage />);
      const sheet = await openSheet();
      fireEvent.click(await within(sheet).findByRole('button', { name: /^Usar VR-1/ }));
      expect(await within(sheet).findByText(/Solo se puede elegir una entrega aprobada/)).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('tags the delivery in use in the table, derived from the legal form, and names it on the other rows', async () => {
      const twoInstances = [
        instance({ selection: null, effective: { rowId: 10, vrLabel: 'VR-1', versionSequence: 1, source: 'latest' } }),
        instance({ documentKey: 'k-2', selection: chosen, selectedEvaluation: approved, effective: { ...chosen, source: 'selected' } }),
      ];
      api.getLegalForm.mockResolvedValue(form({}, { requirements: [requirement({ instances: twoInstances })] }));
      operations.getCanonicalDocuments.mockResolvedValue(viewOf([
        viewRow({ evaluation: approved }),
        viewRow({ rowKey: 'canonical:k-2', documentKey: 'k-2', documentCode: '512', catalogueDisplay: { code: '512', name: 'Plano' }, receivedDocumentRowId: 11, receipt: receipt(11, { vrLabel: 'VR-2' }), evaluation: pendingEvaluation }),
      ]));
      await renderWithDeliveries(<LegalFormPanel origin={origin} canManage />);
      const table = await screen.findByRole('grid', { name: 'Documentos de legal y debida forma' });
      await within(table).findByText('En uso');
      const rows = within(table).getAllByRole('row').filter((row) => row.hasAttribute('data-row-key'));
      const latestRow = rows.find((row) => row.getAttribute('data-row-key') === 'canonical:k-1');
      const chosenElsewhere = rows.find((row) => row.getAttribute('data-row-key') === 'canonical:k-2');
      expect(latestRow).toHaveTextContent('En uso');
      expect(chosenElsewhere).not.toHaveTextContent('En uso');
      expect(chosenElsewhere).toHaveTextContent('Se usa: VR-1 · v1');
    });

    it('orders unresolved rows first and filters Por resolver / Listos by the delivery in use', async () => {
      api.getLegalForm.mockResolvedValue(form({ selection: chosen, selectedEvaluation: approved, effective: { ...chosen, source: 'selected' } }));
      operations.getCanonicalDocuments.mockResolvedValue(viewOf([
        viewRow({ evaluation: pendingEvaluation }),
        viewRow({ rowKey: 'canonical:k-2', documentKey: 'k-2', documentCode: '512', catalogueDisplay: { code: '512', name: 'Plano' }, receivedDocumentRowId: 11, receipt: receipt(11), evaluation: pendingEvaluation }),
      ]));
      await renderWithDeliveries(<LegalFormPanel origin={origin} canManage />);
      const table = await screen.findByRole('grid', { name: 'Documentos de legal y debida forma' });
      await within(table).findByText('Plano');
      const keys = () => within(table).getAllByRole('row').filter((row) => row.hasAttribute('data-row-key')).map((row) => row.getAttribute('data-row-key'));
      // k-1 is pending itself but its chosen delivery is approved, so it is ready; k-2 has no instance and is pending.
      expect(keys()).toEqual(['canonical:k-2', 'canonical:k-1']);
      const chips = screen.getByRole('group', { name: 'Estado de los requisitos' });
      fireEvent.click(within(chips).getByRole('button', { name: /^Listos/ }));
      expect(keys()).toEqual(['canonical:k-1']);
      fireEvent.click(within(chips).getByRole('button', { name: /^Por resolver/ }));
      expect(keys()).toEqual(['canonical:k-2']);
    });
  });
});
