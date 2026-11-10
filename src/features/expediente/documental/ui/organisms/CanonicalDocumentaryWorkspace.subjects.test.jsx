import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { CanonicalDocumentaryWorkspace } from './CanonicalDocumentaryWorkspace';
import * as api from '@/features/expediente/api/documentaryOperations.service';
import * as legalForm from '@/features/expediente/api/documentaryLegalForm.service';

vi.mock('@/features/expediente/api/documentaryOperations.service', async (importOriginal) => ({
  ...(await importOriginal()),
  getMissingRequirements: vi.fn(), getCanonicalDocuments: vi.fn(), getCanonicalVersions: vi.fn(), receiveCanonicalDocument: vi.fn(), getCanonicalHistory: vi.fn(), getCanonicalVersionSubmitIds: vi.fn(), getCanonicalDocumentRow: vi.fn(),
}));
vi.mock('@/features/expediente/api/documentaryLegalForm.service', async (importOriginal) => ({ ...(await importOriginal()), getLegalForm: vi.fn() }));
vi.mock('@/features/expediente/api/documentary.service', () => ({ documentaryError: (error) => error.message || 'Error' }));

const ANA = 'fun_51:1';
const EVA = 'fun_52:7';
const origin = { mode: 'canonical', project: { fun0Id: 1, idPublic: 'FUN-1' }, publication: { configurationId: 2, checksum: 'pinned' }, catalogue: {
  documents: [
    { documentId: 'C-DOC-A', code: 'DOC-A', name: 'Cédula', isActive: true, listKey: 'LIST-A', classificationIds: [] },
    { documentId: 'C-DOC-B', code: 'DOC-B', name: 'Plano de localización', isActive: true, listKey: 'LIST-A', classificationIds: [] },
  ],
  classifications: [],
} };
const view = () => ({ readOnly: false, capabilities: { createDocument: true, receivePhysical: true, receiveDigital: true, review: true }, governance: { inputRevision: 4 },
  requirements: { documents: [{ documentId: 'C-DOC-A', subjectId: ANA }, { documentId: 'C-DOC-A', subjectId: EVA }, { documentId: 'C-DOC-B' }], requirementGroups: [], typologyOptions: [], warnings: [] },
  warnings: [], submits: [{ id: 11, idPublic: 'VR-A' }], rows: [], pagination: { nextAfterId: null }, counts: { canonicalDocuments: 0 } });
const parties = { available: true, applicants: [{ id: ANA, kind: 'applicant', kindLabel: 'Solicitante', label: 'Ana Pérez' }], professionals: [{ id: EVA, kind: 'professional', kindLabel: 'Profesional', label: 'Eva Gil' }], unassigned: [], issueCount: 0 };

function fillPhysicalReceipt(dialog) {
  fireEvent.click(within(dialog).getByLabelText('Se recibió soporte físico'));
  fireEvent.change(within(dialog).getByLabelText('Folios físicos'), { target: { value: '2' } });
  fireEvent.change(within(dialog).getByLabelText('Ubicación o referencia física'), { target: { value: 'Archivo 1' } });
  fireEvent.change(within(dialog).getByLabelText('Nota de recepción'), { target: { value: 'Entrega en ventanilla' } });
}
async function openReceive() {
  fireEvent.click(await screen.findByRole('button', { name: 'Recibir documento' }));
  return screen.findByRole('dialog');
}

const personRow = (key, extra) => ({ rowKey: `canonical:${key}`, documentKey: key, documentClass: 'requirement', documentId: 'C-DOC-A', receivedDocumentRowId: key.length, versionSequence: 1, versionCount: 1,
  catalogueDisplay: { code: 'DOC-A', name: 'Cédula' }, listTitle: 'Lista A', receipt: { id: key.length, submitId: 11, rowVersion: 1, evidenceRevision: 1, hasPhysical: false, files: { digital: null, scan: null }, vrLabel: 'VR-A' },
  actions: {}, controls: [], allowsMultipleInstances: false, ...extra });

beforeEach(() => {
  vi.clearAllMocks();
  api.getCanonicalDocuments.mockResolvedValue(view());
  api.getCanonicalHistory.mockResolvedValue({ events: [], nextAfterId: null });
  legalForm.getLegalForm.mockResolvedValue({ parties });
});

describe('recepción a nombre de una persona', () => {
  it('asks for the person of a per-person document, names it from the legal form and sends its subjectId', async () => {
    api.receiveCanonicalDocument.mockResolvedValue({});
    render(<CanonicalDocumentaryWorkspace origin={origin} fixedSubmitId={11} canManage />);
    const dialog = await openReceive();
    fireEvent.click(within(dialog).getByRole('option', { name: /DOC-A/ }));
    const person = within(dialog).getByLabelText('Persona');
    await waitFor(() => expect(within(person).getByRole('option', { name: 'Eva Gil · Profesional' })).toBeInTheDocument());
    expect(within(person).getByRole('option', { name: 'Ana Pérez · Solicitante' })).toBeInTheDocument();
    expect(legalForm.getLegalForm).toHaveBeenCalledWith(1, expect.any(AbortSignal));
    fillPhysicalReceipt(dialog);
    expect(within(dialog).getByText('Seleccione la persona a cuyo nombre se recibe el documento.')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Guardar recepción' })).toBeDisabled();
    fireEvent.change(person, { target: { value: EVA } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Guardar recepción' }));
    await waitFor(() => expect(api.receiveCanonicalDocument).toHaveBeenCalledWith(1, expect.objectContaining({ documentId: 'C-DOC-A', subjectId: EVA, submitId: 11 }), null, null));
  });

  it('sends no person for a request-level document and asks for none', async () => {
    api.receiveCanonicalDocument.mockResolvedValue({});
    render(<CanonicalDocumentaryWorkspace origin={origin} fixedSubmitId={11} canManage />);
    const dialog = await openReceive();
    fireEvent.click(within(dialog).getByRole('option', { name: /DOC-B/ }));
    expect(within(dialog).queryByLabelText('Persona')).not.toBeInTheDocument();
    fillPhysicalReceipt(dialog);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Guardar recepción' }));
    await waitFor(() => expect(api.receiveCanonicalDocument).toHaveBeenCalledTimes(1));
    expect(api.receiveCanonicalDocument.mock.calls[0][1]).not.toHaveProperty('subjectId');
    expect(legalForm.getLegalForm).not.toHaveBeenCalled();
  });

  it('explains that per-person receipts are not enabled on the server (503) and keeps the form open', async () => {
    api.receiveCanonicalDocument.mockRejectedValue({ response: { status: 503, data: { error: { code: 'SUBJECT_STORAGE_UNAVAILABLE' } } } });
    render(<CanonicalDocumentaryWorkspace origin={origin} fixedSubmitId={11} canManage />);
    const dialog = await openReceive();
    fireEvent.click(within(dialog).getByRole('option', { name: /DOC-A/ }));
    fireEvent.change(within(dialog).getByLabelText('Persona'), { target: { value: ANA } });
    fillPhysicalReceipt(dialog);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Guardar recepción' }));
    expect(await within(dialog).findByText(/Las entregas por persona aún no están habilitadas en el servidor/)).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBe(dialog);
  });

  it('opens the receipt preselected on request in Legal y debida forma and reports the saved receipt', async () => {
    api.receiveCanonicalDocument.mockResolvedValue({});
    const received = vi.fn();
    render(<CanonicalDocumentaryWorkspace origin={origin} variant="legalForm" embedded canManage={false} receiveOnRequest parties={parties} onReceived={received}
      receiveRequest={{ documentId: 'C-DOC-A', subjectId: EVA, nonce: 1 }} />);
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Seleccionado: DOC-A · Cédula')).toBeInTheDocument();
    expect(within(dialog).getByLabelText('Persona')).toHaveValue(EVA);
    expect(legalForm.getLegalForm).not.toHaveBeenCalled();
    fireEvent.change(within(dialog).getByLabelText('VR de recepción'), { target: { value: '11' } });
    fillPhysicalReceipt(dialog);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Guardar recepción' }));
    await waitFor(() => expect(api.receiveCanonicalDocument).toHaveBeenCalledWith(1, expect.objectContaining({ documentId: 'C-DOC-A', subjectId: EVA }), null, null));
    await waitFor(() => expect(received).toHaveBeenCalledWith('Documento recibido.'));
  });

  it('shows to whom each delivery belongs in the table and the ficha', async () => {
    api.getCanonicalDocuments.mockResolvedValue({ ...view(), rows: [personRow('a', { subjectId: EVA, subjectLabel: 'Eva Gil Ruiz', subjectKind: 'professional' }), personRow('bb', { subjectId: ANA }), personRow('ccc', { documentId: 'C-DOC-B', catalogueDisplay: { code: 'DOC-B', name: 'Plano de localización' } })] });
    render(<CanonicalDocumentaryWorkspace origin={origin} canManage />);
    const table = await screen.findByRole('grid');
    // Two lines per document: the name, then code · class · person (request-level rows simply have no person).
    await waitFor(() => expect(within(table).getAllByTestId('row-meta').map((line) => line.textContent)).toEqual(['DOC-A · Requisito · Eva Gil Ruiz · Profesional', 'DOC-A · Requisito · Ana Pérez · Solicitante', 'DOC-B · Requisito']));
    expect(within(table).getAllByTestId('row-name').map((line) => line.textContent)).toEqual(['Cédula', 'Cédula', 'Plano de localización']);
    // Ana has no label on the row: the legal-form parties name her.
    expect(legalForm.getLegalForm).toHaveBeenCalledWith(1, expect.any(AbortSignal));
    expect(screen.getByTestId('detail-person')).toHaveTextContent('A nombre de: Eva Gil Ruiz · Profesional');
  });

  it('filters by persona, lista, clase, evaluación and soporte from one Filtros menu, counting and clearing them', async () => {
    const support = (physical, digital) => ({ hasPhysical: physical, files: { digital: digital ? { name: 'd.pdf' } : null, scan: null } });
    const rows = [
      personRow('a', { subjectId: EVA, subjectLabel: 'Eva Gil', subjectKind: 'professional', evaluation: { status: 'approved' }, receipt: { ...personRow('a').receipt, ...support(true, false) } }),
      personRow('bb', { subjectId: ANA, subjectLabel: 'Ana Pérez', evaluation: { status: 'pending' }, receipt: { ...personRow('bb').receipt, ...support(false, true) } }),
      personRow('ccc', { documentId: 'C-DOC-B', catalogueDisplay: { code: 'DOC-B', name: 'Plano' }, listTitle: 'Lista B', evaluation: { status: 'rejected' }, receipt: { ...personRow('ccc').receipt, ...support(true, true) } }),
      personRow('dddd', { documentClass: 'annex', documentId: null, catalogueDisplay: null, title: 'Anexo libre', evaluation: { status: 'not_applicable' }, receipt: { ...personRow('dddd').receipt, ...support(true, false) } }),
    ];
    api.getCanonicalDocuments.mockResolvedValue({ ...view(), rows });
    render(<CanonicalDocumentaryWorkspace origin={origin} canManage />);
    const table = await screen.findByRole('grid');
    const names = () => within(table).queryAllByTestId('row-meta').map((line) => line.textContent.split(' · ')[0]);
    await waitFor(() => expect(names()).toHaveLength(4));
    expect(screen.queryByRole('group', { name: 'Accesos rápidos de escaneo' })).not.toBeInTheDocument();
    expect(screen.queryByText('Escaneados')).not.toBeInTheDocument();
    const open = async () => { fireEvent.click(screen.getByTestId('documents-filters')); return screen.findByRole('dialog', { name: 'Filtros de documentos' }); };
    let menu = await open();
    const select = (label, value) => fireEvent.change(within(menu).getByLabelText(label), { target: { value } });
    expect(within(within(menu).getByLabelText('Persona')).getAllByRole('option').map((option) => option.textContent)).toEqual(['Todas', 'Ana Pérez · Solicitante', 'Eva Gil · Profesional', 'Solicitud — sin persona']);
    select('Persona', '__request__');
    await waitFor(() => expect(names()).toEqual(['DOC-B', 'Anexo']));
    select('Soporte', 'digital');
    await waitFor(() => expect(names()).toEqual(['DOC-B']));
    expect(screen.getByTestId('documents-filters')).toHaveAccessibleName('Filtros (2 activos)');
    fireEvent.click(within(menu).getByRole('button', { name: 'Limpiar filtros' }));
    await waitFor(() => expect(names()).toHaveLength(4));
    select('Evaluación', 'pending');
    await waitFor(() => expect(names()).toEqual(['DOC-A']));
    select('Evaluación', 'not_applicable');
    select('Clase', 'annex');
    await waitFor(() => expect(names()).toEqual(['Anexo']));
    select('Clase', 'requirement');
    await waitFor(() => expect(names()).toEqual([]));
    fireEvent.click(within(menu).getByRole('button', { name: 'Limpiar filtros' }));
    select('Lista', 'Lista B');
    select('Soporte', 'physical');
    await waitFor(() => expect(names()).toEqual(['DOC-B']));
    select('Persona', EVA);
    await waitFor(() => expect(names()).toEqual([]));
    expect(screen.getByTestId('documents-filters')).toHaveAccessibleName('Filtros (3 activos)');
  });
});
