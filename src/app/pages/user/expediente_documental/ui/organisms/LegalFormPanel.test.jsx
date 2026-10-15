import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import fileDownload from 'js-file-download';
import * as api from '@/app/services/documentaryLegalForm.service';
import { saveCanonicalControl } from '@/app/services/documentaryOperations.service';
import { buildChecklistPdf, CHECKLIST_CODES } from '../../../fun_forms/components/checklistPdf';
import { LegalFormPanel } from './LegalFormPanel';

vi.mock('@/app/services/documentaryLegalForm.service', async (importOriginal) => ({
  ...(await importOriginal()),
  getLegalForm: vi.fn(), saveLegalFormReview: vi.fn(), saveLegalFormChecklist: vi.fn(), declareLegalForm: vi.fn(), revokeLegalForm: vi.fn(), findCanonicalRow: vi.fn(),
}));
vi.mock('@/app/services/documentaryOperations.service', () => ({ saveCanonicalControl: vi.fn(), getCanonicalDocuments: vi.fn(), createCanonicalSubmit: vi.fn(),
  documentaryReceiptRuleError: vi.fn(), getCanonicalVersionSubmitIds: vi.fn(), receiveCanonicalDocument: vi.fn(), updateCanonicalEvidence: vi.fn() }));
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

beforeEach(() => { vi.clearAllMocks(); });

describe('LegalFormPanel', () => {
  it('shows a not-ready expediente with grouped, expandable blockers and the declare action disabled', async () => {
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
    fireEvent.click(screen.getByRole('button', { name: 'Ver pendientes' }));
    expect(screen.getByText('600 · Plano')).toBeInTheDocument();
    expect(screen.getByText('Grupo G1')).toBeInTheDocument();
    expect(within(screen.getByTestId('legal-form-row-600')).getByText('Sin entrega')).toBeInTheDocument();
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

  it('requires an observation for a non-complying reviewer verdict', async () => {
    api.getLegalForm.mockResolvedValue(legalForm());
    api.saveLegalFormReview.mockResolvedValue({ unchanged: false });
    render(<LegalFormPanel origin={origin} canManage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Revisar 511' }));
    const sheet = await screen.findByRole('dialog');
    const save = within(sheet).getByRole('button', { name: 'Guardar revisión' });
    expect(save).toBeDisabled();
    fireEvent.change(within(sheet).getByLabelText('Veredicto'), { target: { value: 'does_not_comply' } });
    expect(save).toBeDisabled();
    expect(within(sheet).getByLabelText('Observación (obligatoria)')).toBeInTheDocument();
    fireEvent.change(within(sheet).getByLabelText('Rango de folios'), { target: { value: '1-12' } });
    fireEvent.change(within(sheet).getByLabelText('Observación (obligatoria)'), { target: { value: 'Falta la firma' } });
    fireEvent.click(save);
    await waitFor(() => expect(api.saveLegalFormReview).toHaveBeenCalledWith(1, '511', expect.objectContaining({
      verdict: 'does_not_comply', folioRange: '1-12', observation: 'Falta la firma', expectedReviewRevision: 0, reason: 'Revisión de legal y debida forma',
    })));
    expect(api.saveLegalFormReview.mock.calls[0][2]).not.toHaveProperty('documentKey');
    expect(await screen.findByText('Revisión guardada.')).toBeInTheDocument();
  });

  it('lists one row per instance and sends the documentKey of the reviewed instance', async () => {
    api.getLegalForm.mockResolvedValue(legalForm({ requirements: [requirement({ allowsMultipleInstances: true, instances: [
      instance({ documentKey: 'a', instanceLabel: 'Hoja 1', verdict: 'complies', review: { verdict: 'complies', stale: false }, reviewRevision: 2 }),
      instance({ documentKey: 'b', instanceLabel: 'Hoja 2', currentRowId: 11 }),
    ] })] }));
    api.saveLegalFormReview.mockResolvedValue({ unchanged: false });
    render(<LegalFormPanel origin={origin} canManage />);
    expect(await screen.findByText('2 instancias')).toBeInTheDocument();
    expect(within(screen.getByTestId('legal-form-instance-a')).getByText('Cumple')).toBeInTheDocument();
    expect(within(screen.getByTestId('legal-form-instance-b')).getByText('Pendiente')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Revisar 511 · Hoja 1' }));
    const sheet = await screen.findByRole('dialog');
    fireEvent.click(within(sheet).getByRole('button', { name: 'Guardar revisión' }));
    await waitFor(() => expect(api.saveLegalFormReview).toHaveBeenCalledWith(1, '511', expect.objectContaining({ documentKey: 'a', verdict: 'complies', expectedReviewRevision: 2 })));
  });

  const controlRow = (controls) => ({ receivedDocumentRowId: 10, receipt: { evidenceRevision: 1 }, actions: { review: true }, controls });
  const control = (id, title, review = null) => ({ controlId: id, title, review, values: [
    { sourceValueId: `${id}-ok`, label: 'Cumple', effect: 'complies' }, { sourceValueId: `${id}-no`, label: 'No cumple', effect: 'does_not_comply' }] });
  const openControls = async (controls) => {
    api.getLegalForm.mockResolvedValue(legalForm({ requirements: [requirement({ controls: controlsOf(controls.length), instances: [instance({ source: 'controls', controls: controlsOf(controls.length) })] })] }));
    api.findCanonicalRow.mockResolvedValue({ view: { readOnly: false, capabilities: { review: true } }, row: controlRow(controls) });
    render(<LegalFormPanel origin={origin} canManage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Revisar controles 511' }));
    return screen.findByRole('dialog');
  };
  const controlsOf = (total) => controls(total, 0);

  it('opens the Central controls of a delivery in one form with a single Guardar', async () => {
    const sheet = await openControls([control('c-1', 'Firma del titular')]);
    expect(await within(sheet).findByText('Firma del titular')).toBeInTheDocument();
    expect(api.findCanonicalRow).toHaveBeenCalledWith(origin, 10, expect.any(AbortSignal));
    expect(within(sheet).getAllByRole('button', { name: /^Guardar/ })).toHaveLength(1);
    expect(within(sheet).getByRole('button', { name: 'Guardar' })).toBeDisabled();
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
    expect(await screen.findByText('Revisión guardada.')).toBeInTheDocument();
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
    api.getLegalForm.mockResolvedValue(legalForm({ state: 'declared', declaration: { at: '2026-10-15T15:00:00.000Z', by: 7, byName: 'Luis Gómez' }, actions: { review: true, declare: false, revoke: true, sheet: true },
      requirements: [requirement({ instances: [instance({ verdict: 'complies', review: { verdict: 'complies', stale: false, reviewedBy: 4, reviewedByName: 'Marta Ruiz', reviewedAt: '2026-10-14T15:00:00.000Z' } })] })] }));
    render(<LegalFormPanel origin={origin} canManage />);
    expect(await screen.findByTestId('legal-form-declaration')).toHaveTextContent('por Luis Gómez');
    fireEvent.click(screen.getByRole('button', { name: 'Revisar 511' }));
    expect(await screen.findByText(/Revisado por Marta Ruiz · /)).toBeInTheDocument();
  });

  describe('checklist', () => {
    const item = { id: 1, id_public: 'FUN-1', model: 2022 };
    const checklistForm = (extra = {}) => legalForm({ actions: { review: true, declare: false, revoke: false, sheet: true, checklist: true }, checklistDefaults: { 511: '1', 512: '0' }, checklist: null,
      requirements: [requirement({ title: 'Formulario único nacional' })], ...extra });
    const renderPanel = () => render(<LegalFormPanel origin={origin} canManage currentItem={item} currentVersion={1} swaMsg={{}} />);

    it('hides the action when the panel is mounted without the expediente version', async () => {
      api.getLegalForm.mockResolvedValue(checklistForm());
      render(<LegalFormPanel origin={origin} canManage />);
      await screen.findByTestId('legal-form-state');
      expect(screen.queryByRole('button', { name: 'Lista de chequeo' })).not.toBeInTheDocument();
    });

    it('opens with server defaults, saves the marks and then builds and downloads the PDF', async () => {
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
      expect(Object.keys(command.marks).sort()).toEqual([...CHECKLIST_CODES].sort());
      expect(command.marks).toMatchObject({ 511: '1', 512: '2', 513: '0' });
      const build = buildChecklistPdf.mock.calls[0][0];
      expect(build).toMatchObject({ currentItem: item, currentVersion: 1 });
      expect(build.review.code).toBe(CHECKLIST_CODES.join(','));
      expect(build.review.checked.split(',')).toHaveLength(CHECKLIST_CODES.length);
      expect(api.saveLegalFormChecklist.mock.invocationCallOrder[0]).toBeLessThan(buildChecklistPdf.mock.invocationCallOrder[0]);
      expect(await screen.findByText('Lista de chequeo guardada.')).toBeInTheDocument();
    });

    it('resets the marks to the defaults and reports a revision conflict', async () => {
      api.getLegalForm.mockResolvedValue(checklistForm());
      api.saveLegalFormChecklist.mockRejectedValue({ response: { status: 409, data: { error: { code: 'CHECKLIST_REVISION_CONFLICT' } } } });
      renderPanel();
      fireEvent.click(await screen.findByRole('button', { name: 'Lista de chequeo' }));
      const dialog = await screen.findByRole('dialog');
      fireEvent.click(within(dialog).getByRole('radio', { name: '511: NO' }));
      fireEvent.click(within(dialog).getByRole('button', { name: 'Restablecer' }));
      expect(within(dialog).getByRole('radio', { name: '511: SI' })).toBeChecked();
      fireEvent.click(within(dialog).getByRole('button', { name: 'Guardar y descargar' }));
      expect(await screen.findByText(/Los datos cambiaron/)).toBeInTheDocument();
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
