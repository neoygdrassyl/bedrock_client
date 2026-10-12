import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CanonicalDocumentaryWorkspace } from './CanonicalDocumentaryWorkspace';
import * as api from '@/app/services/documentaryOperations.service';
vi.mock('@/app/services/documentaryOperations.service', () => ({ getMissingRequirements: vi.fn(), getCanonicalDocuments: vi.fn(), getCanonicalVersions: vi.fn(), downloadCanonicalFile: vi.fn(), receiveCanonicalDocument: vi.fn(), saveCanonicalControl: vi.fn(), createCanonicalSubmit: vi.fn(), updateCanonicalEvidence:vi.fn(), getCanonicalHistory:vi.fn(), getDocumentaryGovernance:vi.fn(), getDocumentaryConfigurationOptions:vi.fn(), returnDocumentaryProjectToLegacy:vi.fn(), refreshDocumentaryRequirements:vi.fn(), changeDocumentaryConfiguration:vi.fn(), getCanonicalVersionSubmitIds:vi.fn(), documentaryReceiptRuleError:vi.fn(() => null) }));
vi.mock('@/app/services/documentary.service', () => ({ documentaryError:error=>error.message||'Error',getDocumentaryConfigurations:vi.fn().mockRejectedValue(new Error('Unexpected publication request')) }));
const origin = { mode:'canonical', project: { fun0Id: 1 }, publication: { configurationId: 2, checksum: 'pinned' }, catalogue: {
  documents: [{ documentId: 'C-DOC-A', code: 'DOC-A', name: 'Documento publicado', isActive: true, listKey: 'LIST-A', classificationIds: ['CAT-A'] }],
  classifications: [{ id: 'CAT-A', name: 'Categoría publicada' }],
} };
const view = () => ({ readOnly: false, capabilities: { createDocument: true, receivePhysical: true, receiveDigital: true, review: true },
  requirements: { documents: [] }, warnings: [], submits: [{ id: 11, idPublic: 'VR-A' }], rows: [], pagination: { nextAfterId: null } });
beforeEach(() => { vi.clearAllMocks(); api.getCanonicalDocuments.mockResolvedValue(view()); api.getCanonicalHistory.mockResolvedValue({events:[],nextAfterId:null}); api.getDocumentaryGovernance.mockResolvedValue({inputRevision:1,selection:{configurationId:2,changeAllowed:true,lockedReason:null,options:[{kind:'legacy',configurationId:null,selected:false}]},source:{fields:[],diagnostics:[]}}); api.getDocumentaryConfigurationOptions.mockResolvedValue({actuations:[],typologyOptions:[]}); });
describe('recepción según publicación y expediente', () => {
  it('opens the shared missing-documents modal from the requirement summary',async()=>{
    api.getMissingRequirements.mockResolvedValue({schemaVersion:'dovela-backoffice/documentary-missing/v1',project:{fun0Id:1,idPublic:'FUN-1'},mode:'canonical',applicable:true,state:'current',allRequirementsSatisfied:false,
      requirements:[{documentId:'C-DOC-A',code:'DOC-A',name:'Documento publicado',required:true,standaloneRequired:true,groupCode:null,status:'missing'}],groups:[],summary:{total:1,missing:1,present:0},refresh:{allowed:false,path:null,expectedInputRevision:1},warnings:[]});
    render(<CanonicalDocumentaryWorkspace origin={origin} canManage/>);
    fireEvent.click(await screen.findByRole('button',{name:'Ver faltantes'}));
    await waitFor(()=>expect(api.getMissingRequirements).toHaveBeenCalledWith(1,expect.any(AbortSignal)));
    expect(await screen.findByText('Faltantes: 1')).toBeInTheDocument();
  });
  it('reloads on 409 and requires a fresh decision instead of retrying the stale command',async()=>{
    api.receiveCanonicalDocument.mockRejectedValue({response:{status:409,data:{}}});
    render(<CanonicalDocumentaryWorkspace origin={origin} fixedSubmitId={11} canManage />);
    fireEvent.click(await screen.findByRole('button',{name:'Recibir documento'}));
    fireEvent.change(screen.getByLabelText('Documento de Central'),{target:{value:'C-DOC-A'}});fireEvent.click(screen.getByLabelText('Se recibió soporte físico'));
    fireEvent.change(screen.getByLabelText('Folios físicos'),{target:{value:'2'}});fireEvent.change(screen.getByLabelText('Ubicación o referencia física'),{target:{value:'Archivo'}});fireEvent.change(screen.getByLabelText('Nota de recepción'),{target:{value:'Entrega'}});
    fireEvent.click(screen.getByRole('button',{name:'Guardar recepción'}));
    await waitFor(()=>expect(api.getCanonicalDocuments).toHaveBeenCalledTimes(2));
    expect(api.receiveCanonicalDocument).toHaveBeenCalledTimes(1);expect(screen.queryByRole('button',{name:'Guardar recepción'})).not.toBeInTheDocument();
    expect(screen.getByText(/confirme nuevamente/i)).toBeInTheDocument();
  });
  it('updates evidence on the same received row and exposes paginated historical manifests',async()=>{
    const row={rowKey:'row',documentKey:'key',receivedDocumentRowId:21,versionSequence:1,catalogueDisplay:{code:'D',name:'Documento'},receipt:{id:21,rowVersion:2,evidenceRevision:3,hasPhysical:true,pagesPhysical:4,location:'Archivo',files:{digital:null,scan:null},vrLabel:'VR'},actions:{replace:true},controls:[]};
    api.getCanonicalDocuments.mockResolvedValue({...view(),rows:[row]});api.updateCanonicalEvidence.mockResolvedValue({});
    api.getCanonicalHistory.mockResolvedValue({events:[{id:7,eventType:'evidence_updated',reason:'Escaneo anterior',receivedDocumentRowId:21,afterJson:{manifest:{evidenceRevision:1,files:{digital:{originalName:'antiguo.pdf',evidenceRevision:1},scan:null}}}}],nextAfterId:7});
    render(<CanonicalDocumentaryWorkspace origin={origin} canManage/>);
    fireEvent.click(await screen.findByRole('button',{name:'Actualizar evidencia'}));
    fireEvent.click(screen.getByLabelText(/Confirmo que/));fireEvent.change(screen.getByLabelText('Motivo de la actualización'),{target:{value:'Completar scan'}});
    fireEvent.click(screen.getByRole('button',{name:'Guardar evidencia'}));
    await waitFor(()=>expect(api.updateCanonicalEvidence).toHaveBeenCalledWith(1,21,expect.objectContaining({sameContent:true,expectedRowVersion:2,expectedEvidenceRevision:3}),null,null));
    fireEvent.click(await screen.findByRole('button',{name:'Cargar historial'}));
    await screen.findByText('Escaneo anterior');fireEvent.click(screen.getByRole('button',{name:'Descargar digital'}));
    await waitFor(()=>expect(api.downloadCanonicalFile).toHaveBeenCalledWith(1,21,'digital',expect.objectContaining({evidenceRevision:1})));
    fireEvent.click(screen.getByRole('button',{name:'Más eventos'}));await waitFor(()=>expect(api.getCanonicalHistory).toHaveBeenLastCalledWith(1,7));
  });
  it('envía la identidad publicada y el VR de este expediente y reutiliza el comando al reintentar', async () => {
    api.receiveCanonicalDocument.mockRejectedValue(new Error('Conexión interrumpida'));
    render(<CanonicalDocumentaryWorkspace origin={origin} fixedSubmitId={11} canManage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Recibir documento' }));
    fireEvent.change(screen.getByLabelText('Documento de Central'), { target: { value: 'C-DOC-A' } });
    expect(screen.getByText(/Lista: LIST-A/)).toHaveTextContent('Categoría publicada');
    fireEvent.click(screen.getByLabelText('Se recibió soporte físico'));
    fireEvent.change(screen.getByLabelText('Folios físicos'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Ubicación o referencia física'), { target: { value: 'Archivo 1' } });
    fireEvent.change(screen.getByLabelText('Nota de recepción'), { target: { value: 'Entrega en ventanilla' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar recepción' }));
    await screen.findByText('Conexión interrumpida');
    expect(api.receiveCanonicalDocument).toHaveBeenCalledWith(1, expect.objectContaining({ documentClass: 'requirement', documentId: 'C-DOC-A', submitId: 11, title: 'Documento publicado', physical: { pages: 2, location: 'Archivo 1', reference: null } }), null, null);
    const first = api.receiveCanonicalDocument.mock.calls[0][1];
    fireEvent.click(screen.getByRole('button', { name: 'Guardar recepción' }));
    await waitFor(() => expect(api.receiveCanonicalDocument).toHaveBeenCalledTimes(2));
    expect(api.receiveCanonicalDocument.mock.calls[1][1]).toEqual(first);
  });
  it('no habilita recepción si el VR no pertenece al expediente', async () => {
    render(<CanonicalDocumentaryWorkspace origin={origin} fixedSubmitId={99} canManage />);
    await screen.findByText(/Este VR aún no tiene vínculo operativo/);
    expect(screen.queryByRole('button', { name: 'Recibir documento' })).not.toBeInTheDocument();
  });
  it('respeta el bloqueo operativo real del servidor', async () => {
    api.getCanonicalDocuments.mockResolvedValue({ ...view(), readOnly: true });
    render(<CanonicalDocumentaryWorkspace origin={origin} canManage />);
    await screen.findByText(/La consulta está disponible/);
    expect(screen.queryByRole('button', { name: 'Recibir documento' })).not.toBeInTheDocument();
    expect(screen.queryByText('Crear VR para este expediente')).not.toBeInTheDocument();
  });
  it('conserva el error de publicación sin ofrecer la recepción tradicional', async () => {
    api.getCanonicalDocuments.mockRejectedValue(new Error('Publicación no disponible'));
    render(<CanonicalDocumentaryWorkspace origin={origin} canManage />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Publicación no disponible');
    expect(screen.queryByRole('button', { name: 'Recibir documento' })).not.toBeInTheDocument();
  });
  it('revisa el control de la evidencia vigente con las revisiones de concurrencia', async () => {
    const row = { rowKey: 'doc', receivedDocumentRowId: 21, versionSequence: 1, catalogueDisplay: { code: 'DOC-A', name: 'Documento publicado' },
      receipt: { id: 21, evidenceRevision: 4, files: {}, vrLabel: 'VR-A' }, actions: { review: true }, controls: [{ controlId: 'CTRL-31', title: 'Firma válida', values: [{ sourceValueId: 'NO', label: 'Firma pendiente', effect: 'does_not_comply' }], review: { resultRevision: 2, current: false } }] };
    api.getCanonicalDocuments.mockResolvedValue({ ...view(), rows: [row] });
    api.saveCanonicalControl.mockResolvedValue({});
    render(<CanonicalDocumentaryWorkspace origin={origin} canManage />);
    await screen.findByText('DOC-A · Documento publicado');
    fireEvent.click(screen.getByText('Legal y debida forma (1)'));
    fireEvent.change(screen.getByLabelText('Resultado'), { target: { value: 'NO' } });
    expect(screen.getByLabelText('Observación')).toBeRequired();
    fireEvent.change(screen.getByLabelText('Observación'), { target: { value: 'Falta firma' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar revisión' }));
    await waitFor(() => expect(api.saveCanonicalControl).toHaveBeenCalledWith(1, 21, 'CTRL-31', expect.objectContaining({ selectedSourceValueId: 'NO', observation: 'Falta firma', expectedEvidenceRevision: 4, expectedResultRevision: 2 })));
  });
  it('groups received rows by list and shows the document class and version count', async () => {
    const receipt = (id, extra) => ({ id, rowVersion: 1, evidenceRevision: 1, hasPhysical: false, files: { digital: null, scan: null }, vrLabel: 'VR-A', ...extra });
    const rows = [
      { rowKey: 'canonical:a', documentKey: 'a', documentClass: 'requirement', documentId: 'C-DOC-A', listTitle: 'Lista técnica', receivedDocumentRowId: 21, versionSequence: 2, versionCount: 3, catalogueDisplay: { code: 'DOC-A', name: 'Documento publicado' }, receipt: receipt(21), actions: {}, controls: [] },
      { rowKey: 'canonical:b', documentKey: 'b', documentClass: 'annex', documentId: null, title: 'Plano adicional', listTitle: 'Anexos', receivedDocumentRowId: 22, versionSequence: 1, versionCount: 1, catalogueDisplay: {}, receipt: receipt(22), actions: {}, controls: [] },
    ];
    api.getCanonicalDocuments.mockResolvedValue({ ...view(), rows });
    render(<CanonicalDocumentaryWorkspace origin={origin} />);
    const technical = await screen.findByRole('region', { name: 'Lista técnica' });
    expect(technical).toHaveTextContent('Lista técnica (1)');
    expect(technical).toHaveTextContent('Requisito · VR VR-A · Versión 2 de 3');
    const annexes = screen.getByRole('region', { name: 'Anexos' });
    expect(annexes).toHaveTextContent('Plano adicional');
    expect(annexes).toHaveTextContent('Anexo · VR VR-A · Versión 1 de 1');
    expect(annexes).not.toHaveTextContent('Legal y debida forma');
  });
  it('receives an annex with a free title and no Central document id', async () => {
    api.receiveCanonicalDocument.mockResolvedValue({});
    render(<CanonicalDocumentaryWorkspace origin={origin} fixedSubmitId={11} canManage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Recibir documento' }));
    fireEvent.change(screen.getByLabelText('Tipo de documento'), { target: { value: 'annex' } });
    fireEvent.change(screen.getByLabelText('Título del anexo'), { target: { value: 'Memoria adicional' } });
    fireEvent.click(screen.getByLabelText('Se recibió soporte físico'));
    fireEvent.change(screen.getByLabelText('Folios físicos'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Ubicación o referencia física'), { target: { value: 'Caja 2' } });
    fireEvent.change(screen.getByLabelText('Nota de recepción'), { target: { value: 'Anexo entregado' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar recepción' }));
    await waitFor(() => expect(api.receiveCanonicalDocument).toHaveBeenCalledTimes(1));
    const command = api.receiveCanonicalDocument.mock.calls[0][1];
    expect(command).toEqual(expect.objectContaining({ documentClass: 'annex', title: 'Memoria adicional', submitId: 11 }));
    expect(command).not.toHaveProperty('documentId');
  });
});
