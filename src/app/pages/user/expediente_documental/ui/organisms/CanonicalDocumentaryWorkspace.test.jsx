import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { CanonicalDocumentaryWorkspace } from './CanonicalDocumentaryWorkspace';
import * as api from '@/app/services/documentaryOperations.service';
vi.mock('@/app/services/documentaryOperations.service', () => ({ getMissingRequirements: vi.fn(), getCanonicalDocuments: vi.fn(), getCanonicalVersions: vi.fn(), downloadCanonicalFile: vi.fn(), receiveCanonicalDocument: vi.fn(), saveCanonicalControl: vi.fn(), createCanonicalSubmit: vi.fn(), updateCanonicalEvidence:vi.fn(), getCanonicalHistory:vi.fn(), refreshDocumentaryRequirements:vi.fn(), getCanonicalVersionSubmitIds:vi.fn(), documentaryReceiptRuleError:vi.fn(() => null) }));
vi.mock('@/app/services/documentary.service', () => ({ documentaryError:error=>error.message||'Error' }));
const origin = { mode:'canonical', project: { fun0Id: 1, idPublic: 'FUN-1' }, publication: { configurationId: 2, checksum: 'pinned' }, catalogue: {
  documents: [
    { documentId: 'C-DOC-A', code: 'DOC-A', name: 'Documento publicado', isActive: true, listKey: 'LIST-A', classificationIds: ['CAT-A'] },
    { documentId: 'C-DOC-B', code: 'DOC-B', name: 'Plano de localización', isActive: true, listKey: 'LIST-A', classificationIds: [] },
  ],
  classifications: [{ id: 'CAT-A', name: 'Categoría publicada' }],
} };
const view = () => ({ readOnly: false, capabilities: { createDocument: true, receivePhysical: true, receiveDigital: true, review: true },
  governance: { inputRevision: 4 }, requirements: { documents: [] }, warnings: [], submits: [{ id: 11, idPublic: 'VR-A' }], rows: [], pagination: { nextAfterId: null } });
const receipt = (id, extra) => ({ id, submitId: 11, rowVersion: 1, evidenceRevision: 1, hasPhysical: false, files: { digital: null, scan: null }, vrLabel: 'VR-A', ...extra });
const docRow = (extra = {}) => ({ rowKey: 'canonical:a', documentKey: 'a', documentClass: 'requirement', documentId: 'C-DOC-A', receivedDocumentRowId: 21, versionSequence: 1, versionCount: 1,
  catalogueDisplay: { code: 'DOC-A', name: 'Documento publicado' }, receipt: receipt(21), actions: { replace: true }, controls: [], ...extra });

async function openReceive() {
  fireEvent.click(await screen.findByRole('button', { name: 'Recibir documento' }));
  return screen.findByRole('dialog');
}
function fillPhysicalReceipt(dialog, { pages = '2', location = 'Archivo 1', note = 'Entrega en ventanilla' } = {}) {
  fireEvent.click(within(dialog).getByLabelText('Se recibió soporte físico'));
  fireEvent.change(within(dialog).getByLabelText('Folios físicos'), { target: { value: pages } });
  fireEvent.change(within(dialog).getByLabelText('Ubicación o referencia física'), { target: { value: location } });
  fireEvent.change(within(dialog).getByLabelText('Nota de recepción'), { target: { value: note } });
}

beforeEach(() => { vi.clearAllMocks(); delete window.user; api.getCanonicalDocuments.mockResolvedValue(view()); api.getCanonicalHistory.mockResolvedValue({events:[],nextAfterId:null}); });
afterEach(() => { delete window.user; });

describe('recepción según el catálogo y el expediente', () => {
  it('opens the shared missing-documents modal from the requirement banner',async()=>{
    api.getMissingRequirements.mockResolvedValue({schemaVersion:'dovela-backoffice/documentary-missing/v1',project:{fun0Id:1,idPublic:'FUN-1'},mode:'canonical',applicable:true,state:'current',allRequirementsSatisfied:false,
      requirements:[{documentId:'C-DOC-A',code:'DOC-A',name:'Documento publicado',required:true,standaloneRequired:true,groupCode:null,status:'missing'}],groups:[],summary:{total:1,missing:1,present:0},refresh:{allowed:false,path:null,expectedInputRevision:1},warnings:[]});
    render(<CanonicalDocumentaryWorkspace origin={origin} canManage/>);
    fireEvent.click(await screen.findByRole('button',{name:'Ver faltantes'}));
    await waitFor(()=>expect(api.getMissingRequirements).toHaveBeenCalledWith(1,expect.any(AbortSignal)));
    expect(await screen.findByText('Faltantes: 1')).toBeInTheDocument();
  });

  it('shows one plain requirement status and offers the refresh only to allowed roles', async () => {
    api.getCanonicalDocuments.mockResolvedValue({ ...view(), warnings: [{ code: 'REQUIREMENTS_CACHE_MISSING', message: 'x' }, { code: 'NO_CONFIGURED_CONTROLS', message: 'y' }], rows: [docRow(), docRow({ rowKey: 'canonical:b', documentKey: 'b', receivedDocumentRowId: 22, receipt: receipt(22) })] });
    const { unmount } = render(<CanonicalDocumentaryWorkspace origin={origin} canManage />);
    const banner = await screen.findByRole('region', { name: 'Estado de los requisitos' });
    expect(banner).toHaveTextContent('Los requisitos aún no se han evaluado.');
    expect(screen.getAllByText('Los requisitos aún no se han evaluado.')).toHaveLength(1);
    expect(screen.queryByText(/controles configurados/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Actualizar requisitos' })).not.toBeInTheDocument();
    unmount();
    window.user = { role_short: 'CUR' };
    api.refreshDocumentaryRequirements.mockResolvedValue({});
    render(<CanonicalDocumentaryWorkspace origin={origin} canManage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Actualizar requisitos' }));
    await waitFor(() => expect(api.refreshDocumentaryRequirements).toHaveBeenCalledWith(1, expect.objectContaining({ expectedInputRevision: 4 })));
    expect(await screen.findByText('Evaluación de requisitos actualizada.')).toBeInTheDocument();
  });

  it('reloads on 409 and requires a fresh decision instead of retrying the stale command',async()=>{
    api.receiveCanonicalDocument.mockRejectedValue({response:{status:409,data:{}}});
    render(<CanonicalDocumentaryWorkspace origin={origin} fixedSubmitId={11} canManage />);
    const dialog = await openReceive();
    fireEvent.click(within(dialog).getByRole('option',{name:/DOC-A/}));
    fillPhysicalReceipt(dialog);
    fireEvent.click(within(dialog).getByRole('button',{name:'Guardar recepción'}));
    await waitFor(()=>expect(api.getCanonicalDocuments).toHaveBeenCalledTimes(2));
    expect(api.receiveCanonicalDocument).toHaveBeenCalledTimes(1);
    await waitFor(()=>expect(screen.queryByRole('button',{name:'Guardar recepción'})).not.toBeInTheDocument());
    expect(screen.getByText(/confirme nuevamente/i)).toBeInTheDocument();
  });

  it('filters the catalogue selector by code or name', async () => {
    render(<CanonicalDocumentaryWorkspace origin={origin} fixedSubmitId={11} canManage />);
    const dialog = await openReceive();
    const catalogue = within(dialog).getByRole('listbox', { name: 'Documentos del catálogo' });
    expect(within(catalogue).getAllByRole('option')).toHaveLength(2);
    fireEvent.change(within(dialog).getByRole('combobox', { name: 'Documento del catálogo' }), { target: { value: 'plano' } });
    await waitFor(() => expect(within(catalogue).getAllByRole('option')).toHaveLength(1));
    fireEvent.click(within(dialog).getByRole('option', { name: /DOC-B/ }));
    expect(within(dialog).getByText('Seleccionado: DOC-B · Plano de localización')).toBeInTheDocument();
  });

  it('updates evidence on the same received row and exposes paginated historical manifests',async()=>{
    const row = docRow({ receipt: receipt(21, { rowVersion: 2, evidenceRevision: 3, hasPhysical: true, pagesPhysical: 4, location: 'Archivo', vrLabel: 'VR' }) });
    api.getCanonicalDocuments.mockResolvedValue({...view(),rows:[row]});api.updateCanonicalEvidence.mockResolvedValue({});
    api.getCanonicalHistory.mockResolvedValue({events:[{id:7,eventType:'evidence_updated',reason:'Escaneo anterior',receivedDocumentRowId:21,afterJson:{manifest:{evidenceRevision:1,files:{digital:{originalName:'antiguo.pdf',evidenceRevision:1},scan:null}}}}],nextAfterId:7});
    render(<CanonicalDocumentaryWorkspace origin={origin} canManage/>);
    fireEvent.click(await screen.findByRole('button',{name:'Actualizar evidencia'}));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByLabelText(/Confirmo que/));fireEvent.change(within(dialog).getByLabelText('Motivo de la actualización'),{target:{value:'Completar scan'}});
    fireEvent.click(within(dialog).getByRole('button',{name:'Guardar evidencia'}));
    await waitFor(()=>expect(api.updateCanonicalEvidence).toHaveBeenCalledWith(1,21,expect.objectContaining({sameContent:true,expectedRowVersion:2,expectedEvidenceRevision:3}),null,null));
    fireEvent.click(await screen.findByRole('button',{name:'Historial documental'}));
    fireEvent.click(await screen.findByRole('button',{name:'Cargar historial'}));
    await screen.findByText('Escaneo anterior');
    expect(screen.getByText('Evidencia actualizada')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Descargar digital'}));
    await waitFor(()=>expect(api.downloadCanonicalFile).toHaveBeenCalledWith(1,21,'digital',expect.objectContaining({evidenceRevision:1})));
    fireEvent.click(screen.getByRole('button',{name:'Más eventos'}));await waitFor(()=>expect(api.getCanonicalHistory).toHaveBeenLastCalledWith(1,7));
  });

  it('envía la identidad del catálogo y el VR de este expediente y reutiliza el comando al reintentar', async () => {
    api.receiveCanonicalDocument.mockRejectedValue(new Error('Conexión interrumpida'));
    render(<CanonicalDocumentaryWorkspace origin={origin} fixedSubmitId={11} canManage />);
    const dialog = await openReceive();
    fireEvent.click(within(dialog).getByRole('option', { name: /DOC-A/ }));
    expect(within(dialog).getByText(/Lista: LIST-A/)).toHaveTextContent('Categoría publicada');
    fillPhysicalReceipt(dialog);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Guardar recepción' }));
    await within(dialog).findByText('Conexión interrumpida');
    expect(api.receiveCanonicalDocument).toHaveBeenCalledWith(1, expect.objectContaining({ documentClass: 'requirement', documentId: 'C-DOC-A', submitId: 11, title: 'Documento publicado', physical: { pages: 2, location: 'Archivo 1', reference: null } }), null, null);
    const first = api.receiveCanonicalDocument.mock.calls[0][1];
    fireEvent.click(within(dialog).getByRole('button', { name: 'Guardar recepción' }));
    await waitFor(() => expect(api.receiveCanonicalDocument).toHaveBeenCalledTimes(2));
    expect(api.receiveCanonicalDocument.mock.calls[1][1]).toEqual(first);
  });

  it('keeps physical fields visible with a hint and enables them only for a physical delivery', async () => {
    render(<CanonicalDocumentaryWorkspace origin={origin} fixedSubmitId={11} canManage />);
    const dialog = await openReceive();
    expect(within(dialog).getByLabelText('Folios físicos')).toBeDisabled();
    expect(within(dialog).getByText(/si el documento se entregó en papel/)).toBeInTheDocument();
    fireEvent.click(within(dialog).getByLabelText('Se recibió soporte físico'));
    expect(within(dialog).getByLabelText('Folios físicos')).toBeEnabled();
    expect(within(dialog).getByLabelText('Folios físicos')).toBeRequired();
  });

  it('explains when every VR already has a version and offers to create a new VR', async () => {
    api.getCanonicalDocuments.mockResolvedValue({ ...view(), rows: [docRow()] });
    api.createCanonicalSubmit.mockResolvedValue({});
    render(<CanonicalDocumentaryWorkspace origin={origin} canManage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Recibir nueva versión' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('alert')).toHaveTextContent('Este documento ya tiene una versión en todas las VR del expediente. Cree una VR nueva para registrar otra entrega.');
    expect(within(dialog).getByRole('button', { name: 'Guardar recepción' })).toBeDisabled();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Crear VR' }));
    fireEvent.change(within(dialog).getByLabelText('Consecutivo de la nueva VR'), { target: { value: 'VR-B' } });
    api.getCanonicalDocuments.mockResolvedValue({ ...view(), submits: [{ id: 12, idPublic: 'VR-B' }, { id: 11, idPublic: 'VR-A' }], rows: [docRow()] });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Crear VR' }));
    await waitFor(() => expect(api.createCanonicalSubmit).toHaveBeenCalledWith(1, expect.objectContaining({ vrLabel: 'VR-B' })));
    await waitFor(() => expect(within(dialog).getByLabelText('VR de recepción')).toHaveValue('12'));
    expect(within(dialog).getByRole('button', { name: 'Guardar recepción' })).toBeDisabled();
    fillPhysicalReceipt(dialog);
    expect(within(dialog).getByRole('button', { name: 'Guardar recepción' })).toBeEnabled();
  });

  it('keeps «Guardar recepción» disabled with inline hints until the receipt is complete', async () => {
    render(<CanonicalDocumentaryWorkspace origin={origin} canManage />);
    const dialog = await openReceive();
    const save = within(dialog).getByRole('button', { name: 'Guardar recepción' });
    expect(save).toBeDisabled();
    expect(save).toHaveAccessibleDescription(/Seleccione un documento del catálogo\..*Seleccione la VR de recepción\..*Escriba la nota de recepción\./);
    fireEvent.click(within(dialog).getByRole('option', { name: /DOC-A/ }));
    fireEvent.change(within(dialog).getByLabelText('VR de recepción'), { target: { value: '11' } });
    fireEvent.click(within(dialog).getByLabelText('Se recibió soporte físico'));
    fireEvent.change(within(dialog).getByLabelText('Folios físicos'), { target: { value: '0' } });
    fireEvent.change(within(dialog).getByLabelText('Ubicación o referencia física'), { target: { value: 'Archivo 1' } });
    fireEvent.change(within(dialog).getByLabelText('Nota de recepción'), { target: { value: 'Entrega' } });
    expect(save).toBeDisabled();
    expect(within(dialog).getByText(/Indique los folios físicos/)).toBeInTheDocument();
    fireEvent.change(within(dialog).getByLabelText('Folios físicos'), { target: { value: '3' } });
    expect(save).toBeEnabled();
    expect(within(dialog).queryByText('Para guardar la recepción:')).not.toBeInTheDocument();
  });

  it('selects a document from anywhere in its row, by click or keyboard, and updates the ficha', async () => {
    const rows = [
      docRow({ catalogueDisplay: { code: '513', name: 'Plano estructural' } }),
      docRow({ rowKey: 'canonical:b', documentKey: 'b', documentId: 'C-DOC-B', receivedDocumentRowId: 22, catalogueDisplay: { code: '511', name: 'Memoria de cálculo' }, receipt: receipt(22) }),
    ];
    api.getCanonicalDocuments.mockResolvedValue({ ...view(), rows });
    render(<CanonicalDocumentaryWorkspace origin={origin} />);
    await screen.findByRole('heading', { name: 'Plano estructural' });
    const [first, second] = screen.getAllByRole('row').filter((row) => row.hasAttribute('data-row-key'));
    expect(first).toHaveAttribute('aria-selected', 'true');
    expect(second).toHaveAttribute('aria-selected', 'false');
    // Click on a non-title cell (the version count) of the second row.
    fireEvent.click([...second.querySelectorAll('td')].at(-1));
    expect(await screen.findByRole('heading', { name: 'Memoria de cálculo' })).toBeInTheDocument();
    expect(screen.getByRole('complementary')).toHaveTextContent('511');
    expect(second).toHaveAttribute('aria-selected', 'true');
    expect(second).toHaveAttribute('tabindex', '0');
    expect(first).toHaveAttribute('tabindex', '-1');
    fireEvent.keyDown(first, { key: 'Enter' });
    expect(await screen.findByRole('heading', { name: 'Plano estructural' })).toBeInTheDocument();
    fireEvent.keyDown(first, { key: 'ArrowDown' });
    expect(second).toHaveFocus();
    fireEvent.keyDown(second, { key: ' ' });
    expect(await screen.findByRole('heading', { name: 'Memoria de cálculo' })).toBeInTheDocument();
  });

  it('no habilita recepción si el VR no pertenece al expediente', async () => {
    render(<CanonicalDocumentaryWorkspace origin={origin} fixedSubmitId={99} canManage />);
    await screen.findByText(/Este VR aún no tiene vínculo operativo/);
    expect(screen.queryByRole('button', { name: 'Recibir documento' })).not.toBeInTheDocument();
  });

  it('respeta el bloqueo operativo real del servidor', async () => {
    api.getCanonicalDocuments.mockResolvedValue({ ...view(), readOnly: true });
    render(<CanonicalDocumentaryWorkspace origin={origin} canManage />);
    await screen.findByText(/Puede consultar los documentos/);
    expect(screen.queryByRole('button', { name: 'Recibir documento' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Crear VR' })).not.toBeInTheDocument();
  });

  it('conserva el error de consulta sin ofrecer la recepción', async () => {
    api.getCanonicalDocuments.mockRejectedValue(new Error('Publicación no disponible'));
    render(<CanonicalDocumentaryWorkspace origin={origin} canManage />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Publicación no disponible');
    expect(screen.queryByRole('button', { name: 'Recibir documento' })).not.toBeInTheDocument();
  });

  it('revisa el control de la evidencia vigente con las revisiones de concurrencia', async () => {
    const row = docRow({ actions: { review: true }, receipt: receipt(21, { evidenceRevision: 4, files: {} }), controls: [{ controlId: 'CTRL-31', title: 'Firma válida', values: [{ sourceValueId: 'NO', label: 'Firma pendiente', effect: 'does_not_comply' }], review: { resultRevision: 2, current: false } }] });
    api.getCanonicalDocuments.mockResolvedValue({ ...view(), rows: [row] });
    api.saveCanonicalControl.mockResolvedValue({});
    render(<CanonicalDocumentaryWorkspace origin={origin} canManage />);
    await screen.findByRole('heading', { name: 'Documento publicado' });
    const detail = screen.getByRole('complementary');
    expect(within(detail).getByText('Legal y debida forma')).toBeInTheDocument();
    fireEvent.change(within(detail).getByLabelText('Resultado'), { target: { value: 'NO' } });
    expect(within(detail).getByLabelText('Observación')).toBeRequired();
    fireEvent.change(within(detail).getByLabelText('Observación'), { target: { value: 'Falta firma' } });
    fireEvent.click(within(detail).getByRole('button', { name: 'Guardar revisión' }));
    await waitFor(() => expect(api.saveCanonicalControl).toHaveBeenCalledWith(1, 21, 'CTRL-31', expect.objectContaining({ selectedSourceValueId: 'NO', observation: 'Falta firma', expectedEvidenceRevision: 4, expectedResultRevision: 2 })));
  });

  it('lists one row per document grouped by list, with class, formatted date and version count', async () => {
    const rows = [
      docRow({ listTitle: 'Lista técnica', versionSequence: 2, versionCount: 3, receipt: receipt(21, { registeredAt: '2026-09-28T00:48:00', hasPhysical: true, pagesPhysical: 2 }) }),
      { rowKey: 'canonical:b', documentKey: 'b', documentClass: 'annex', documentId: null, title: 'Plano adicional', listTitle: 'Anexos', receivedDocumentRowId: 22, versionSequence: 1, versionCount: 1, catalogueDisplay: {}, receipt: receipt(22), actions: {}, controls: [] },
    ];
    const onCountChange = vi.fn();
    api.getCanonicalDocuments.mockResolvedValue({ ...view(), rows, counts: { canonicalDocuments: 2, receivedVersions: 4 } });
    render(<CanonicalDocumentaryWorkspace origin={origin} onCountChange={onCountChange} />);
    const technical = await screen.findByRole('rowgroup', { name: 'Lista técnica' });
    expect(technical).toHaveTextContent('Lista técnica (1)');
    const [, documentRow] = within(technical).getAllByRole('row');
    expect(documentRow).toHaveTextContent('Requisito');
    expect(documentRow).toHaveTextContent('28 sep 2026, 00:48');
    expect(documentRow).toHaveTextContent('2 folios');
    expect(documentRow).toHaveTextContent(/3$/);
    const annexes = screen.getByRole('rowgroup', { name: 'Anexos' });
    expect(annexes).toHaveTextContent('Plano adicional');
    expect(annexes).toHaveTextContent('Anexo');
    await waitFor(() => expect(onCountChange).toHaveBeenCalledWith(2));
    expect(screen.getByRole('complementary')).toHaveTextContent('Versión 2 de 3');
    fireEvent.click(within(annexes).getByRole('button', { name: /Plano adicional/ }));
    expect(screen.getByRole('complementary')).toHaveTextContent('Plano adicional');
    expect(screen.getByRole('complementary')).not.toHaveTextContent('Legal y debida forma');
  });

  it('receives an annex with a free title and no Central document id', async () => {
    api.receiveCanonicalDocument.mockResolvedValue({});
    render(<CanonicalDocumentaryWorkspace origin={origin} fixedSubmitId={11} canManage />);
    const dialog = await openReceive();
    fireEvent.change(within(dialog).getByLabelText('Tipo de documento'), { target: { value: 'annex' } });
    fireEvent.change(within(dialog).getByLabelText('Título del anexo'), { target: { value: 'Memoria adicional' } });
    fillPhysicalReceipt(dialog, { pages: '1', location: 'Caja 2', note: 'Anexo entregado' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Guardar recepción' }));
    await waitFor(() => expect(api.receiveCanonicalDocument).toHaveBeenCalledTimes(1));
    const command = api.receiveCanonicalDocument.mock.calls[0][1];
    expect(command).toEqual(expect.objectContaining({ documentClass: 'annex', title: 'Memoria adicional', submitId: 11 }));
    expect(command).not.toHaveProperty('documentId');
  });
});
