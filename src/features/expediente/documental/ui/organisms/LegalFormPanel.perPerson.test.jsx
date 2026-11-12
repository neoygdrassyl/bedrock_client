import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import * as api from '@/features/expediente/api/documentaryLegalForm.service';
import * as operations from '@/features/expediente/api/documentaryOperations.service';
import { LegalFormPanel } from './LegalFormPanel';

vi.mock('@/features/expediente/api/documentaryLegalForm.service', async (importOriginal) => ({
  ...(await importOriginal()),
  getLegalForm: vi.fn(), listTypologySelections: vi.fn(), saveTypologySelection: vi.fn(), selectLegalFormVr: vi.fn(), clearLegalFormVr: vi.fn(),
}));
vi.mock('@/features/expediente/api/documentaryOperations.service', () => ({ saveCanonicalControl: vi.fn(), saveCanonicalReview: vi.fn(), getCanonicalDocuments: vi.fn(), getCanonicalDocumentRow: vi.fn(), getCanonicalVersions: vi.fn(), createCanonicalSubmit: vi.fn(),
  documentaryReceiptRuleError: vi.fn(), getCanonicalVersionSubmitIds: vi.fn(), receiveCanonicalDocument: vi.fn(), updateCanonicalEvidence: vi.fn(), getCanonicalHistory: vi.fn(), getMissingRequirements: vi.fn(), refreshDocumentaryRequirements: vi.fn(), downloadCanonicalFile: vi.fn() }));
vi.mock('@/features/expediente/api/documentaryRequirements.service', () => ({ refreshRequirementsFor: vi.fn() }));
vi.mock('@/features/expediente/api/documentary.service', () => ({ documentaryError: (error) => error.message || 'Error' }));

const ANA = 'fun_51:1';
const EVA = 'fun_52:7';
const origin = { mode: 'canonical', project: { fun0Id: 1, idPublic: 'FUN-1' }, publication: { configurationId: 2, checksum: 'c' }, catalogue: { documents: [], classifications: [] } };
const controls = () => ({ status: 'no_configured_controls', total: 0, complies: 0, doesNotComply: 0, unreviewed: 0 });
const instance = (extra) => ({ documentKey: 'k-ana', instanceLabel: null, currentRowId: 10, evidenceRevision: 1, vrLabel: 'VR-1', controls: controls(), review: null, reviewRevision: 0, verdict: 'pending', source: 'review', ...extra });
const requirement = (extra) => ({ documentCode: '511', documentId: 'd-511', title: 'Cédula', required: true, delivered: false, currentRowId: null, vrLabel: null, controls: controls(),
  review: null, verdict: 'pending', blockers: [], groupCode: null, additional: false, allowsMultipleInstances: false, instances: [], ...extra });
const party = (id, extra) => ({ id, kind: 'applicant', kindLabel: 'Solicitante', label: 'Ana Pérez', source: { table: 'fun_51s', rowId: 1 }, idNumber: '1.234', type: 'natural', role: 'titular',
  values: ['natural', 'titular'], valueLabels: ['Persona natural', 'Titular'], issues: [], evaluated: true, requirementCount: 1, deliveredCount: 1, blockerCount: 0, state: 'missing', ...extra });
const eva = (issues = []) => party(EVA, { kind: 'professional', kindLabel: 'Profesional', label: 'Eva Gil', source: { table: 'fun_52s', rowId: 7 }, role: issues.length ? null : 'director',
  values: issues.length ? [] : ['director_obra'], valueLabels: issues.length ? [] : ['Director de la construcción'], issues });

const legalForm = ({ evaIssues = [], ...extra } = {}) => ({
  schemaVersion: api.LEGAL_FORM_SCHEMA, mode: 'canonical', applicable: true, project: { fun0Id: 1, idPublic: 'FUN-1', state: 1 }, state: 'not_ready', declaration: null, sheet: null,
  actions: { review: true, declare: false, revoke: false, sheet: true, select: true }, evaluation: { cacheState: 'current', status: 'complete' },
  parties: { available: true, perPerson: true, applicants: [party(ANA)], professionals: [eva(evaIssues)], unassigned: [], issueCount: evaIssues.length },
  subjects: [
    { subjectId: ANA, kind: 'applicant', label: 'Ana Pérez', typologies: [], state: 'missing' },
    { subjectId: EVA, kind: 'professional', label: 'Eva Gil', typologies: [{ typologyCode: 'PRO', typologyName: 'Profesional responsable', selectedOptionIds: [], hasOptions: true }], state: 'selection_required' },
  ],
  requirements: [
    requirement({ documentCode: '600', documentId: 'd-600', title: 'Plano', blockers: [{ code: 'NOT_DELIVERED', documentCode: '600' }] }),
    requirement({ requirementKey: `${ANA}|d-511`, subjectId: ANA, subjectKind: 'applicant', subjectLabel: 'Ana Pérez', delivered: true, currentRowId: 10, vrLabel: 'VR-1', instances: [instance()],
      blockers: [{ code: 'VERDICT_PENDING', documentCode: '511', documentKey: 'k-ana', subjectId: ANA }] }),
    requirement({ requirementKey: `${EVA}|d-511`, subjectId: EVA, subjectKind: 'professional', subjectLabel: 'Eva Gil', blockers: [{ code: 'NOT_DELIVERED', documentCode: '511', subjectId: EVA }] }),
    requirement({ documentCode: '990', documentId: 'd-990', title: 'Licencia expedida', direction: 'output', required: false }),
  ],
  groups: [],
  blockers: [
    { code: 'NOT_DELIVERED', documentCode: '600' },
    { code: 'VERDICT_PENDING', documentCode: '511', documentKey: 'k-ana', subjectId: ANA },
    { code: 'NOT_DELIVERED', documentCode: '511', subjectId: EVA },
    { code: 'TYPOLOGY_SELECTION_REQUIRED', typologyCode: 'PRO', subjectId: EVA },
  ],
  ...extra,
});
const selections = (extra) => ({ inputRevision: 3, subjectSelectionAvailable: true, typologies: [
  { typologyCode: 'PRO', typologyName: 'Profesional responsable', selectionMode: 'single', subjectId: EVA, subjectKind: 'professional', subjectLabel: 'Eva Gil', selectionRevision: 0, selectedOptionIds: [],
    options: [{ id: 'director', label: 'Director de obra', requirementMode: 'all', documentCodes: ['511'] }, { id: 'disenador', label: 'Diseñador', requirementMode: 'all', documentCodes: [] }] },
], ...extra });
const viewRow = { rowKey: 'canonical:k-ana', documentKey: 'k-ana', documentClass: 'requirement', documentId: 'd-511', documentCode: '511', title: 'Cédula', subjectId: ANA, direction: 'input', receivedDocumentRowId: 10,
  versionSequence: 1, versionCount: 1, catalogueDisplay: { code: '511', name: 'Cédula' }, receipt: { id: 10, submitId: 11, rowVersion: 1, evidenceRevision: 1, hasPhysical: false, files: { digital: null, scan: null }, vrLabel: 'VR-1' },
  controls: [], evaluation: { status: 'pending', source: 'review', verdict: null, reviewRevision: 0 }, actions: { evaluate: true } };

beforeEach(() => {
  vi.clearAllMocks();
  api.listTypologySelections.mockResolvedValue(selections());
  operations.getCanonicalDocuments.mockResolvedValue({ readOnly: false, capabilities: { review: true }, governance: { inputRevision: 1 }, requirements: { documents: [] }, warnings: [], submits: [],
    rows: [viewRow], pagination: { nextAfterId: null }, counts: { canonicalDocuments: 1 } });
  operations.getCanonicalVersions.mockResolvedValue({ rows: [], nextAfterId: null });
});

describe('LegalFormPanel per person', () => {
  it('lists the parties and one checklist group per person, the same document twice and issued documents left out', async () => {
    api.getLegalForm.mockResolvedValue(legalForm());
    render(<LegalFormPanel origin={origin} canManage />);
    const parties = await screen.findByTestId('ldf-parties');
    expect(within(parties).getByTestId('ldf-parties-summary')).toHaveTextContent('2 partes completas');
    // Complete parties collapse to one line.
    expect(within(parties).getByRole('button', { name: /Partes de la solicitud/ })).toHaveAttribute('aria-expanded', 'false');
    const checklist = screen.getByTestId('ldf-checklist');
    expect(within(checklist).queryByTestId('ldf-checklist-gate')).not.toBeInTheDocument();
    expect(within(checklist).getByRole('region', { name: 'Solicitud' })).toHaveTextContent('600');
    const ana = within(checklist).getByRole('region', { name: 'Ana Pérez · Solicitante — Persona natural · Titular' });
    expect(within(ana).getByRole('button', { name: /^511 Cédula: Sin evaluar/ })).toBeInTheDocument();
    expect(within(ana).getByTestId(`ldf-group-progress-${ANA}`)).toHaveTextContent('1/1 entregados');
    const evaGroup = within(checklist).getByRole('region', { name: 'Eva Gil · Profesional — Director de la construcción' });
    expect(within(evaGroup).getByRole('button', { name: /^511 Cédula: Sin entregar/ })).toBeInTheDocument();
    expect(within(evaGroup).getByRole('button', { name: /^Elegir la opción de «Profesional responsable»/ })).toBeInTheDocument();
    expect(screen.queryByText('Licencia expedida')).not.toBeInTheDocument();
  });

  it('gates the evaluation while a party has pending data and sends the user to its FUN form', async () => {
    const openForm = vi.fn();
    api.getLegalForm.mockResolvedValue(legalForm({ evaIssues: [{ code: 'MISSING_ROLE', field: 'role' }] }));
    render(<LegalFormPanel origin={origin} canManage onOpenFunForm={openForm} />);
    const parties = await screen.findByTestId('ldf-parties');
    expect(within(parties).getByRole('button', { name: /Partes de la solicitud/ })).toHaveAttribute('aria-expanded', 'true');
    const item = within(parties).getByTestId(`ldf-party-${EVA}`);
    expect(item).toHaveTextContent('Falta rol');
    expect(item).toHaveTextContent('Pendiente');
    fireEvent.click(within(item).getByRole('button', { name: 'Completar Eva Gil en el formulario 5.2 del FUN' }));
    expect(openForm).toHaveBeenCalledWith(expect.objectContaining({ anchor: 'fun_n_52', label: '5.2' }));
    expect(screen.getByTestId('ldf-checklist-gate')).toHaveTextContent('Completa las partes para evaluar los documentos de cada persona.');
    // Still readable: the delivered row opens its evaluation, read-only.
    fireEvent.click(screen.getByRole('button', { name: /^511 Cédula: Sin evaluar/ }));
    const sheet = await screen.findByRole('dialog');
    expect(await within(sheet).findByText('Evaluar documento')).toBeInTheDocument();
    expect(within(sheet).getByText('Completa las partes para evaluar los documentos de cada persona.')).toBeInTheDocument();
    expect(within(sheet).getByTestId('ldf-requirement-context')).toHaveTextContent('Persona: Ana Pérez · Solicitante — Persona natural · Titular');
    expect(within(sheet).queryByRole('button', { name: 'Guardar evaluación' })).not.toBeInTheDocument();
  });

  it('chooses the option of a per-person typology for that person', async () => {
    api.getLegalForm.mockResolvedValue(legalForm());
    api.saveTypologySelection.mockResolvedValue({ unchanged: false, cacheState: 'current', selection: { typologyCode: 'PRO', subjectId: EVA } });
    render(<LegalFormPanel origin={origin} canManage />);
    fireEvent.click(await screen.findByRole('button', { name: /^Elegir la opción de «Profesional responsable»/ }));
    const detail = await screen.findByRole('dialog');
    await waitFor(() => expect(api.listTypologySelections).toHaveBeenCalled());
    fireEvent.click(await within(detail).findByRole('button', { name: 'Elegir opción' }));
    const picker = await screen.findByRole('dialog', { name: /Elegir opción · Profesional responsable · Eva Gil/ });
    fireEvent.click(within(picker).getByLabelText(/Director de obra/));
    fireEvent.change(within(picker).getByLabelText('Motivo'), { target: { value: 'Rol del FUN' } });
    fireEvent.click(within(picker).getByRole('button', { name: 'Guardar selección' }));
    await waitFor(() => expect(api.saveTypologySelection).toHaveBeenCalledWith(1, 'PRO', expect.objectContaining({ optionIds: ['director'], subjectId: EVA, expectedSelectionRevision: 0, reason: 'Rol del FUN' })));
    expect(await screen.findByText('Selección de tipología guardada.')).toBeInTheDocument();
  });

  it('explains a missing per-person storage instead of failing', async () => {
    api.getLegalForm.mockResolvedValue(legalForm());
    api.saveTypologySelection.mockRejectedValue({ response: { status: 503, data: { error: { code: 'SUBJECT_STORAGE_UNAVAILABLE' } } } });
    render(<LegalFormPanel origin={origin} canManage />);
    fireEvent.click(await screen.findByRole('button', { name: /^Elegir la opción de «Profesional responsable»/ }));
    const detail = await screen.findByRole('dialog');
    fireEvent.click(await within(detail).findByRole('button', { name: 'Elegir opción' }));
    const picker = await screen.findByRole('dialog', { name: /Elegir opción/ });
    fireEvent.click(within(picker).getByLabelText(/Director de obra/));
    fireEvent.change(within(picker).getByLabelText('Motivo'), { target: { value: 'Rol del FUN' } });
    fireEvent.click(within(picker).getByRole('button', { name: 'Guardar selección' }));
    expect(await within(picker).findByText(api.SUBJECT_STORAGE_MESSAGE)).toBeInTheDocument();
  });

  it('does not offer the per-person picker when the server cannot store per-person selections', async () => {
    api.getLegalForm.mockResolvedValue(legalForm());
    api.listTypologySelections.mockResolvedValue(selections({ subjectSelectionAvailable: false }));
    render(<LegalFormPanel origin={origin} canManage />);
    await waitFor(() => expect(api.listTypologySelections).toHaveBeenCalled());
    fireEvent.click(await screen.findByRole('button', { name: /^Elegir la opción de «Profesional responsable»/ }));
    const detail = await screen.findByRole('dialog');
    expect(await within(detail).findByText(api.SUBJECT_STORAGE_MESSAGE)).toBeInTheDocument();
    expect(within(detail).queryByRole('button', { name: 'Elegir opción' })).not.toBeInTheDocument();
  });
  it('receives a missing per-person document on behalf of its person from the detail sheet', async () => {
    const catalogueOrigin = { ...origin, catalogue: { documents: [{ documentId: 'd-511', code: '511', name: 'Cédula', isActive: true, listKey: 'L', classificationIds: [] }], classifications: [] } };
    api.getLegalForm.mockResolvedValue(legalForm());
    operations.getCanonicalDocuments.mockResolvedValue({ readOnly: false, capabilities: { createDocument: true, receivePhysical: true, receiveDigital: true, review: true }, governance: { inputRevision: 1 },
      requirements: { documents: [{ documentId: 'd-511', subjectId: ANA }, { documentId: 'd-511', subjectId: EVA }], requirementGroups: [], typologyOptions: [], warnings: [] }, warnings: [],
      submits: [{ id: 11, idPublic: 'VR-1' }], rows: [viewRow], pagination: { nextAfterId: null }, counts: { canonicalDocuments: 1 } });
    operations.receiveCanonicalDocument.mockResolvedValue({});
    render(<LegalFormPanel origin={catalogueOrigin} canManage />);
    const evaGroup = await screen.findByRole('region', { name: /^Eva Gil/ });
    fireEvent.click(within(evaGroup).getByRole('button', { name: /^511 Cédula: Sin entregar/ }));
    const detail = await screen.findByRole('dialog');
    fireEvent.click(within(detail).getByRole('button', { name: 'Recibir a nombre de Eva Gil' }));
    const receipt = await screen.findByRole('dialog', { name: /Recibir documento/ });
    expect(within(receipt).getByLabelText('Persona')).toHaveValue(EVA);
    expect(within(within(receipt).getByLabelText('Persona')).getByRole('option', { name: 'Eva Gil · Profesional' }).value).toBe(EVA);
    fireEvent.change(within(receipt).getByLabelText('VR de recepción'), { target: { value: '11' } });
    fireEvent.click(within(receipt).getByLabelText('Se recibió soporte físico'));
    fireEvent.change(within(receipt).getByLabelText('Folios físicos'), { target: { value: '1' } });
    fireEvent.change(within(receipt).getByLabelText('Ubicación o referencia física'), { target: { value: 'Caja 1' } });
    fireEvent.change(within(receipt).getByLabelText('Nota de recepción'), { target: { value: 'Cédula de Eva' } });
    fireEvent.click(within(receipt).getByRole('button', { name: 'Guardar recepción' }));
    await waitFor(() => expect(operations.receiveCanonicalDocument).toHaveBeenCalledWith(1, expect.objectContaining({ documentId: 'd-511', subjectId: EVA }), null, null));
    expect(await screen.findByText('Documento recibido.')).toBeInTheDocument();
    await waitFor(() => expect(api.getLegalForm).toHaveBeenCalledTimes(2));
  });

  it('receives a missing alternative of a person from the "Documentos alternativos" sheet', async () => {
    const catalogueOrigin = { ...origin, catalogue: { documents: [{ documentId: 'd-cc', code: 'ID-CC', name: 'Cédula de ciudadanía', isActive: true, listKey: 'L', classificationIds: [] },
      { documentId: 'd-ce', code: 'ID-CE', name: 'Cédula de extranjería', isActive: true, listKey: 'L', classificationIds: [] }], classifications: [] } };
    const group = `ID:doc@${EVA}`;
    const alternative = (code, id) => requirement({ documentCode: code, documentId: id, title: code, required: false, groupCode: group, requirementKey: `${EVA}|${id}`, subjectId: EVA, subjectKind: 'professional', subjectLabel: 'Eva Gil' });
    api.getLegalForm.mockResolvedValue(legalForm({
      requirements: [alternative('ID-CC', 'd-cc'), alternative('ID-CE', 'd-ce')],
      groups: [{ code: group, mode: 'at_least_one', status: 'missing', satisfied: false, subjectId: EVA, documentCodes: ['ID-CC', 'ID-CE'], typologyName: 'Identificación', optionLabel: 'Documento' }],
      blockers: [{ code: 'GROUP_NOT_SATISFIED', groupCode: group, subjectId: EVA }],
    }));
    operations.getCanonicalDocuments.mockResolvedValue({ readOnly: false, capabilities: { createDocument: true, receivePhysical: true, receiveDigital: true, review: true }, governance: { inputRevision: 1 },
      requirements: { documents: [{ documentId: 'd-cc', subjectId: EVA }, { documentId: 'd-ce', subjectId: EVA }], requirementGroups: [], typologyOptions: [], warnings: [] }, warnings: [],
      submits: [{ id: 11, idPublic: 'VR-1' }], rows: [], pagination: { nextAfterId: null }, counts: { canonicalDocuments: 0 } });
    render(<LegalFormPanel origin={catalogueOrigin} canManage />);
    fireEvent.click(await screen.findByRole('button', { name: /^ID-CC \/ ID-CE Uno de/ }));
    const sheet = await screen.findByRole('dialog', { name: /Documentos alternativos/ });
    fireEvent.click(within(sheet).getByRole('button', { name: 'Recibir ID-CE' }));
    const receipt = await screen.findByRole('dialog', { name: /Recibir documento/ });
    expect(within(receipt).getByText('Seleccionado: ID-CE · Cédula de extranjería')).toBeInTheDocument();
    expect(within(receipt).getByLabelText('Persona')).toHaveValue(EVA);
  });

  it('explains on the Solicitud group which request documents are now asked of each person', async () => {
    api.getLegalForm.mockResolvedValue(legalForm({ supersededBySubjectDocumentCodes: ['519', '520'] }));
    render(<LegalFormPanel origin={origin} canManage />);
    const request = await screen.findByTestId('ldf-group-request');
    expect(within(request).getByRole('button', { name: 'Se piden a cada persona: 519, 520' })).toBeInTheDocument();
    expect(within(request).queryByText('519')).not.toBeInTheDocument();
  });

  it('tells the module that documentary data changed after a typology selection is saved', async () => {
    const changed = vi.fn();
    api.getLegalForm.mockResolvedValue(legalForm());
    api.saveTypologySelection.mockResolvedValue({ unchanged: false, cacheState: 'current' });
    render(<LegalFormPanel origin={origin} canManage onDataChanged={changed} />);
    fireEvent.click(await screen.findByRole('button', { name: /^Elegir la opción de «Profesional responsable»/ }));
    const detail = await screen.findByRole('dialog');
    fireEvent.click(await within(detail).findByRole('button', { name: 'Elegir opción' }));
    const picker = await screen.findByRole('dialog', { name: /Elegir opción/ });
    fireEvent.click(within(picker).getByLabelText(/Director de obra/));
    fireEvent.change(within(picker).getByLabelText('Motivo'), { target: { value: 'Rol' } });
    fireEvent.click(within(picker).getByRole('button', { name: 'Guardar selección' }));
    await waitFor(() => expect(changed).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(api.getLegalForm).toHaveBeenCalledTimes(2));
  });
});
