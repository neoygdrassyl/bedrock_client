import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import * as api from '@/app/services/documentaryLegalForm.service';
import { LegalFormPanel } from './LegalFormPanel';

vi.mock('@/app/services/documentaryLegalForm.service', async (importOriginal) => ({
  ...(await importOriginal()),
  getLegalForm: vi.fn(), saveLegalFormReview: vi.fn(), declareLegalForm: vi.fn(), revokeLegalForm: vi.fn(), findCanonicalRow: vi.fn(),
}));
vi.mock('@/app/services/documentaryOperations.service', () => ({ saveCanonicalControl: vi.fn(), getCanonicalDocuments: vi.fn(), createCanonicalSubmit: vi.fn(),
  documentaryReceiptRuleError: vi.fn(), getCanonicalVersionSubmitIds: vi.fn(), receiveCanonicalDocument: vi.fn(), updateCanonicalEvidence: vi.fn() }));
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

  it('opens the Central controls of a delivery with the ficha ControlDecision form', async () => {
    api.getLegalForm.mockResolvedValue(legalForm({ requirements: [requirement({ controls: controls(2, 1), instances: [instance({ source: 'controls', controls: controls(2, 1) })] })] }));
    const row = { receivedDocumentRowId: 10, receipt: { evidenceRevision: 1 }, actions: { review: true }, controls: [
      { controlId: 'c-1', title: 'Firma del titular', values: [{ sourceValueId: 'v1', label: 'Cumple', effect: 'complies' }], review: null },
    ] };
    api.findCanonicalRow.mockResolvedValue({ view: { readOnly: false, capabilities: { review: true } }, row });
    render(<LegalFormPanel origin={origin} canManage />);
    expect(await screen.findByText('1/2')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Revisar controles 511' }));
    const sheet = await screen.findByRole('dialog');
    expect(await within(sheet).findByText('Firma del titular')).toBeInTheDocument();
    expect(api.findCanonicalRow).toHaveBeenCalledWith(origin, 10, expect.any(AbortSignal));
    expect(within(sheet).getByRole('button', { name: 'Guardar revisión' })).toBeEnabled();
  });
});
