import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const {
  serviceMock,
  listActuationTypesMock,
  listDocumentDefinitionsMock,
  listDocumentCodesMock,
  listConfigurationLabelsMock,
  listLegalTextsMock,
  listReadContractsMock,
  listAssertionsMock,
  listRulesMock,
  createActuationTypeMock,
  createDocumentCodeMock,
  createDocumentDefinitionMock,
  updateDocumentDefinitionMock,
  updateActuationTypeMock,
  deleteRuleMock,
  createActuationDocumentRuleMock,
  createActuationTextRuleMock,
  createActuationDocumentsByLabelRuleMock,
  createActuationTextsByLabelRuleMock,
} = vi.hoisted(() => {
  const listActuationTypesMock = vi.fn();
  const listDocumentDefinitionsMock = vi.fn();
  const listDocumentCodesMock = vi.fn();
  const listConfigurationLabelsMock = vi.fn();
  const listLegalTextsMock = vi.fn();
  const listReadContractsMock = vi.fn();
  const listAssertionsMock = vi.fn();
  const listRulesMock = vi.fn();
  const createActuationTypeMock = vi.fn();
  const createDocumentCodeMock = vi.fn();
  const createDocumentDefinitionMock = vi.fn();
  const updateDocumentDefinitionMock = vi.fn();
  const updateActuationTypeMock = vi.fn();
  const deleteRuleMock = vi.fn();
  const createActuationDocumentRuleMock = vi.fn();
  const createActuationTextRuleMock = vi.fn();
  const createActuationDocumentsByLabelRuleMock = vi.fn();
  const createActuationTextsByLabelRuleMock = vi.fn();
  return {
    listActuationTypesMock,
    listDocumentDefinitionsMock,
    listDocumentCodesMock,
    listConfigurationLabelsMock,
    listLegalTextsMock,
    listReadContractsMock,
    listAssertionsMock,
    listRulesMock,
    createActuationTypeMock,
    createDocumentCodeMock,
    createDocumentDefinitionMock,
    updateDocumentDefinitionMock,
    updateActuationTypeMock,
    deleteRuleMock,
    createActuationDocumentRuleMock,
    createActuationTextRuleMock,
    createActuationDocumentsByLabelRuleMock,
    createActuationTextsByLabelRuleMock,
    serviceMock: {
      listActuationTypes: listActuationTypesMock,
      listDocumentDefinitions: listDocumentDefinitionsMock,
      listDocumentCodes: listDocumentCodesMock,
      listConfigurationLabels: listConfigurationLabelsMock,
      listLegalTexts: listLegalTextsMock,
      listReadContracts: listReadContractsMock,
      listAssertions: listAssertionsMock,
      listRules: listRulesMock,
      createActuationType: createActuationTypeMock,
      createDocumentCode: createDocumentCodeMock,
      createDocumentDefinition: createDocumentDefinitionMock,
      updateDocumentDefinition: updateDocumentDefinitionMock,
      updateActuationType: updateActuationTypeMock,
      deleteRule: deleteRuleMock,
      createActuationDocumentRule: createActuationDocumentRuleMock,
      createActuationTextRule: createActuationTextRuleMock,
      createActuationDocumentsByLabelRule: createActuationDocumentsByLabelRuleMock,
      createActuationTextsByLabelRule: createActuationTextsByLabelRuleMock,
    },
  };
});

vi.mock('../../../services/legal_config.service.js', () => ({
  __esModule: true,
  default: serviceMock,
}));

vi.mock('../../../services/data.service.js', () => ({
  __esModule: true,
  default: {
    getUserData: () => ({ name: 'Admin', surname: 'Dovela', roleDesc: 'Administrador', role: 'ADM' }),
  },
}));

vi.mock('../../../utils/developerAccess.js', () => ({
  isDeveloperUser: () => false,
  isErrorReportManagerUser: () => false,
}));

import LegalConfigInitialPage from './LegalConfigInitialPage.jsx';
import SettingsPage from '../SettingsPage.jsx';

const actuationTypes = [
  { id: 'root', name: 'Licencias urbanísticas', slug: 'licencias-urbanisticas', node_type: 'group', parent_id: null, is_selectable: false, is_active: true },
  { id: 'subdivision', name: 'Licencia de subdivisión', slug: 'licencia-subdivision', node_type: 'actuation', parent_id: 'root', is_selectable: true, is_active: true },
  { id: 'subdivision-rural', name: 'Subdivisión rural', slug: 'subdivision-rural', node_type: 'modality', parent_id: 'subdivision', is_selectable: true, is_active: true },
];

const documents = [
  { id: 'doc1', name: 'Formulario único nacional', slug: 'fun', document_code_id: 'code1' },
  { id: 'doc2', name: 'Plano arquitectónico firmado', slug: 'plano-arquitectonico', document_code_id: 'code2' },
];

const documentCodes = [
  { id: 'code1', code: 'DOC-GEN-FOR-001', name: 'Formulario único nacional', description: 'Formulario base de solicitud', is_active: true, metadata: { category: 'form', scope: 'general', support_type: 'form', version: '1', normative_source: 'Manual interno' } },
  { id: 'code2', code: 'DOC-SUB-PLA-001', name: 'Plano de subdivisión', description: 'Plano técnico para subdivisión', is_active: true, metadata: { category: 'technical', scope: 'subdivision', support_type: 'plan', version: '1', aliases: ['PLANO-SUB'] } },
];

const labels = [
  { id: 'label-doc', name: 'Documentos comunes', label_scope: 'document' },
  { id: 'label-text', name: 'Fundamentos jurídicos', label_scope: 'text' },
];

const texts = [
  { id: 'txt1', title: 'Fundamento base', output_section: 'fundamentos' },
  { id: 'txt2', title: 'Texto jurídico para subdivisión', output_section: 'fundamentos' },
];

function mockLoadedState() {
  listActuationTypesMock.mockResolvedValue({ data: actuationTypes });
  listDocumentDefinitionsMock.mockResolvedValue({ data: documents });
  listDocumentCodesMock.mockResolvedValue({ data: documentCodes });
  listConfigurationLabelsMock.mockResolvedValue({ data: labels });
  listLegalTextsMock.mockResolvedValue({ data: texts });
  listReadContractsMock.mockResolvedValue({ data: [] });
  listAssertionsMock.mockResolvedValue({ data: [] });
  listRulesMock.mockResolvedValue({ data: {} });
}

function renderPage() {
  return render(<LegalConfigInitialPage />);
}

describe('LegalConfigInitialPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoadedState();
  });

  it('organiza la configuración en tres ventanas principales y deja Actuaciones como ventana funcional', async () => {
    renderPage();

    expect(await screen.findByTestId('legal-config-page')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Actuaciones$/i })).toHaveClass('is-active');
    expect(screen.getByRole('button', { name: /^Documentos$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Resolución$/i })).toBeInTheDocument();

    expect(screen.getByTestId('actuation-graph-canvas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Licencias urbanísticas/i })).toBeInTheDocument();
    expect(within(screen.getByTestId('actuation-graph-canvas')).getByRole('button', { name: /Licencia de subdivisión/i })).toBeInTheDocument();
    expect(screen.getByText(/Subdivisión rural/i)).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /Crear hija \/ tipo/i })).toBeInTheDocument();
    expect(screen.queryByRole('table', { name: /Relaciones documentales/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Inspector de actuación/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Gestionar relaciones/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Desactivar actuación seleccionada/i })).toBeInTheDocument();

    expect(screen.queryByTestId('actuation-quick-relations')).not.toBeInTheDocument();
    expect(screen.queryByTestId('actuation-relation-list')).not.toBeInTheDocument();

    const visibleCopy = document.body.textContent || '';
    expect(visibleCopy).not.toMatch(/id_|external_case_id|actuation_type_id|legal_config/i);
    expect(screen.queryByText(/Control de calidad gráfico/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Demo rápida/i)).not.toBeInTheDocument();
  });


  it('modela Documentos como catálogo de códigos documentales con inspector y creación', async () => {
    const createdCode = {
      id: 'code-new',
      code: 'DOC-SUB-CER-002',
      name: 'Certificado predial de subdivisión',
      description: 'Certificado para validar información predial',
      is_active: true,
      metadata: { category: 'predial', scope: 'subdivision', support_type: 'certificate', version: '1', normative_source: 'Manual interno', aliases: ['CERT-SUB'] },
    };
    createDocumentCodeMock.mockResolvedValue({ data: createdCode });

    renderPage();
    await screen.findByTestId('actuation-graph-canvas');

    fireEvent.click(screen.getByRole('button', { name: /^Documentos$/i }));
    expect(await screen.findByTestId('legal-config-documents-pane')).toBeInTheDocument();
    expect(screen.getByRole('table', { name: /Códigos documentales/i })).toBeInTheDocument();
    expect(screen.getAllByText('DOC-GEN-FOR-001').length).toBeGreaterThan(0);
    expect(screen.getByText(/^Detalle del código$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ayuda: Códigos documentales/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Nueva definición/i })).toBeInTheDocument();
    expect(screen.getByText(/Fuente normativa/i)).toBeInTheDocument();

    listDocumentCodesMock.mockResolvedValueOnce({ data: [...documentCodes, createdCode] });
    fireEvent.click(screen.getByRole('button', { name: /Nuevo código/i }));
    const dialog = await screen.findByRole('dialog', { name: /Crear código documental/i });
    fireEvent.change(within(dialog).getByLabelText(/^Código documental$/i, { selector: 'input' }), { target: { value: 'doc-sub-cer-002' } });
    fireEvent.change(within(dialog).getByLabelText(/Nombre visible/i), { target: { value: 'Certificado predial de subdivisión' } });
    fireEvent.change(within(dialog).getByLabelText(/Categoría/i), { target: { value: 'predial' } });
    fireEvent.change(within(dialog).getByLabelText(/Ámbito/i), { target: { value: 'subdivision' } });
    fireEvent.change(within(dialog).getByLabelText(/Tipo de soporte/i), { target: { value: 'certificate' } });
    fireEvent.change(within(dialog).getByLabelText(/Fuente normativa/i), { target: { value: 'Manual interno' } });
    fireEvent.change(within(dialog).getByLabelText(/Alias o códigos anteriores/i), { target: { value: 'CERT-SUB' } });
    fireEvent.click(within(dialog).getByRole('button', { name: /Crear código/i }));

    await waitFor(() => expect(createDocumentCodeMock).toHaveBeenCalledWith(expect.objectContaining({
      code: 'DOC-SUB-CER-002',
      name: 'Certificado predial de subdivisión',
      metadata: expect.objectContaining({ category: 'predial', scope: 'subdivision', support_type: 'certificate', aliases: ['CERT-SUB'] }),
    })));
    await waitFor(() => expect(screen.getAllByText('DOC-SUB-CER-002').length).toBeGreaterThan(0));

    const createdDefinition = { id: 'def-new', name: 'Certificado predial de subdivisión', slug: 'certificado-predial-subdivision', document_code_id: 'code-new' };
    createDocumentDefinitionMock.mockResolvedValue({ data: createdDefinition });
    listDocumentDefinitionsMock.mockResolvedValueOnce({ data: [...documents, createdDefinition] });
    fireEvent.click(screen.getByRole('button', { name: /Nueva definición/i }));
    const definitionDialog = await screen.findByRole('dialog', { name: /Nueva definición/i });
    fireEvent.change(within(definitionDialog).getByLabelText(/Descripción de validación/i), { target: { value: 'Debe estar vigente y legible.' } });
    fireEvent.change(within(definitionDialog).getByLabelText(/Nota de soporte esperado/i), { target: { value: 'PDF vigente' } });
    fireEvent.click(within(definitionDialog).getByRole('button', { name: /Crear definición/i }));
    await waitFor(() => expect(createDocumentDefinitionMock).toHaveBeenCalledWith(expect.objectContaining({
      document_code_id: 'code-new',
      description: 'Debe estar vigente y legible.',
      validation_config: expect.objectContaining({ expected_support_note: 'PDF vigente' }),
    })));
  });

  it('simplifica la definición, muestra la jerarquía documental y permite reemplazar sin borrar', async () => {
    const childCode = { ...documentCodes[1], id: 'code-child', code: 'DOC-SUB-PLA-001-A', name: 'Plano con cuadro de áreas', parent_id: 'code2' };
    listDocumentCodesMock.mockResolvedValue({ data: [...documentCodes, childCode] });
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Documentos' }));
    expect(await screen.findByText(/Subcódigo de DOC-SUB-PLA-001/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Nueva definición/i }));
    const definitionDialog = await screen.findByRole('dialog', { name: /Nueva definición/i });
    expect(within(definitionDialog).queryByLabelText(/Slug interno/i)).not.toBeInTheDocument();
    expect(within(definitionDialog).queryByLabelText(/múltiples archivos/i)).not.toBeInTheDocument();

    fireEvent.click(within(definitionDialog).getByRole('button', { name: /Cancelar/i }));
    fireEvent.click(screen.getByRole('button', { name: /Gestionar definiciones/i }));
    const manager = await screen.findByRole('dialog', { name: /^Definiciones$/i });
    expect(within(manager).getByRole('button', { name: /Reemplazar definición/i })).toBeInTheDocument();
  });

  it('gestiona definiciones del código seleccionado y desactiva sin borrarlas', async () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Documentos' }));
    await screen.findAllByText('DOC-GEN-FOR-001');
    fireEvent.click(screen.getByRole('button', { name: /Gestionar definiciones/i }));

    const dialog = await screen.findByRole('dialog', { name: /^Definiciones$/i });
    expect(within(dialog).getByRole('table', { name: /Definiciones documentales/i })).toBeInTheDocument();
    expect(within(dialog).getAllByText(/Formulario único nacional/i).length).toBeGreaterThan(0);

    updateDocumentDefinitionMock.mockResolvedValue({ data: { ...documents[0], is_active: false } });
    fireEvent.click(within(dialog).getByRole('button', { name: /Desactivar definición/i }));
    const confirmation = await screen.findByRole('dialog', { name: /Desactivar definición/i });
    fireEvent.click(within(confirmation).getByRole('button', { name: /^Desactivar$/i }));

    await waitFor(() => expect(updateDocumentDefinitionMock).toHaveBeenCalledWith(
      documents[0].id,
      expect.objectContaining({ is_active: false }),
    ));
  });

  it('crea un tipo de actuación vía backend real y lo agrega al árbol', async () => {
    const createdNode = {
      id: 'new-modality-id',
      name: 'Nueva modalidad demo',
      slug: 'nueva-modalidad-demo',
      node_type: 'modality',
      parent_id: 'subdivision',
      is_selectable: true,
      is_active: true,
    };
    createActuationTypeMock.mockResolvedValue({ data: createdNode });

    renderPage();
    await screen.findByTestId('actuation-graph-canvas');

    listActuationTypesMock.mockResolvedValueOnce({ data: [...actuationTypes, createdNode] });

    fireEvent.click(screen.getByRole('button', { name: /Crear hija \/ tipo/i }));

    const dialog = await screen.findByRole('dialog', { name: /Crear tipo de actuación/i });
    fireEvent.change(within(dialog).getByLabelText(/Nombre del tipo/i), { target: { value: 'Nueva modalidad demo' } });
    fireEvent.change(within(dialog).getByLabelText(/Depende de/i), { target: { value: 'subdivision' } });
    fireEvent.change(within(dialog).getByLabelText(/Clasificación/i), { target: { value: 'modality' } });
    fireEvent.click(within(dialog).getByRole('button', { name: /Agregar al árbol/i }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    expect(createActuationTypeMock).toHaveBeenCalledWith({
      name: 'Nueva modalidad demo',
      slug: 'nueva-modalidad-demo',
      parent_id: 'subdivision',
      node_type: 'modality',
    });
    expect(await screen.findByRole('button', { name: /Nueva modalidad demo/i })).toBeInTheDocument();
  });

  it('muestra el error del backend en el modal cuando la creación falla', async () => {
    createActuationTypeMock.mockRejectedValue({ response: { data: { message: 'La jerarquía de actuaciones no puede contener ciclos.' } } });

    renderPage();
    await screen.findByTestId('actuation-graph-canvas');

    fireEvent.click(screen.getByRole('button', { name: /Crear hija \/ tipo/i }));
    const dialog = await screen.findByRole('dialog', { name: /Crear tipo de actuación/i });
    fireEvent.change(within(dialog).getByLabelText(/Nombre del tipo/i), { target: { value: 'Tipo inválido' } });
    fireEvent.click(within(dialog).getByRole('button', { name: /Agregar al árbol/i }));

    expect(await within(dialog).findByText(/no puede contener ciclos/i)).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('asocia documentos, textos jurídicos y etiquetas desde modales contra el backend real', async () => {
    const ruleAfterDoc = { actuation_documents: [{ id: 'rule-doc-1', actuation_type_id: 'subdivision', document_id: 'doc2' }] };
    const ruleAfterText = { ...ruleAfterDoc, actuation_texts: [{ id: 'rule-text-1', actuation_type_id: 'subdivision', text_id: 'txt2' }] };
    const ruleAfterLabel = { ...ruleAfterText, actuation_documents_by_labels: [{ id: 'rule-label-1', actuation_type_id: 'subdivision', label_id: 'label-doc' }] };

    createActuationDocumentRuleMock.mockResolvedValue({ data: ruleAfterDoc.actuation_documents[0] });
    createActuationTextRuleMock.mockResolvedValue({ data: ruleAfterText.actuation_texts[0] });
    createActuationDocumentsByLabelRuleMock.mockResolvedValue({ data: ruleAfterLabel.actuation_documents_by_labels[0] });

    listRulesMock
      .mockResolvedValueOnce({ data: {} })
      .mockResolvedValueOnce({ data: ruleAfterDoc })
      .mockResolvedValueOnce({ data: ruleAfterText })
      .mockResolvedValueOnce({ data: ruleAfterLabel });

    renderPage();

    await screen.findByTestId('actuation-graph-canvas');
    fireEvent.click(within(screen.getByTestId('actuation-graph-canvas')).getByRole('button', { name: /Licencia de subdivisión/i }));
    fireEvent.click(screen.getByRole('button', { name: /Gestionar relaciones/i }));
    const detailDialog = await screen.findByRole('dialog', { name: /Licencia de subdivisión/i });

    fireEvent.click(within(detailDialog).getByRole('button', { name: /Asociar documento/i }));
    let dialog = await screen.findByRole('dialog', { name: /Asociar documento/i });
    fireEvent.change(within(dialog).getByLabelText(/Documento disponible/i), { target: { value: 'doc2' } });
    fireEvent.click(within(dialog).getByRole('button', { name: /Guardar relación/i }));
    await waitFor(() => expect(createActuationDocumentRuleMock).toHaveBeenCalledWith({ actuation_type_id: 'subdivision', document_id: 'doc2' }));
    expect(within(screen.getByRole('dialog', { name: /Licencia de subdivisión/i })).getByText('Plano arquitectónico firmado')).toBeInTheDocument();

    fireEvent.click(within(screen.getByRole('dialog', { name: /Licencia de subdivisión/i })).getByRole('button', { name: /Asociar texto jurídico/i }));
    dialog = await screen.findByRole('dialog', { name: /Asociar texto jurídico/i });
    fireEvent.change(within(dialog).getByLabelText(/Texto jurídico disponible/i), { target: { value: 'txt2' } });
    fireEvent.click(within(dialog).getByRole('button', { name: /Guardar relación/i }));
    await waitFor(() => expect(createActuationTextRuleMock).toHaveBeenCalledWith({ actuation_type_id: 'subdivision', text_id: 'txt2' }));
    fireEvent.click(within(screen.getByRole('dialog', { name: /Licencia de subdivisión/i })).getByRole('button', { name: /Resolución relacionada/i }));
    expect(within(screen.getByRole('dialog', { name: /Licencia de subdivisión/i })).getByText('Texto jurídico para subdivisión')).toBeInTheDocument();
    fireEvent.click(within(screen.getByRole('dialog', { name: /Licencia de subdivisión/i })).getByRole('button', { name: /Documentos relacionados/i }));

    fireEvent.click(within(screen.getByRole('dialog', { name: /Licencia de subdivisión/i })).getByRole('button', { name: /Asociar etiqueta/i }));
    dialog = await screen.findByRole('dialog', { name: /Asociar etiqueta/i });
    fireEvent.change(within(dialog).getByLabelText(/Etiqueta disponible/i), { target: { value: 'label-doc' } });
    fireEvent.click(within(dialog).getByRole('button', { name: /Guardar relación/i }));
    await waitFor(() => expect(createActuationDocumentsByLabelRuleMock).toHaveBeenCalledWith({ actuation_type_id: 'subdivision', label_id: 'label-doc' }));
    expect(within(screen.getByRole('dialog', { name: /Licencia de subdivisión/i })).getByText('Documentos comunes')).toBeInTheDocument();
  });

  it('desactiva una actuación desde el gráfico y refresca el mapa', async () => {
    updateActuationTypeMock.mockResolvedValue({ data: { ...actuationTypes[2], is_active: false } });
    listActuationTypesMock
      .mockResolvedValueOnce({ data: actuationTypes })
      .mockResolvedValueOnce({ data: actuationTypes.filter((item) => item.id !== 'subdivision-rural') });

    renderPage();
    await screen.findByTestId('actuation-graph-canvas');

    fireEvent.click(within(screen.getByTestId('actuation-graph-canvas')).getByRole('button', { name: /Subdivisión rural/i }));
    fireEvent.click(screen.getByRole('button', { name: /Desactivar actuación seleccionada/i }));
    const deactivateDialog = await screen.findByRole('dialog', { name: /Desactivar actuación/i });
    expect(within(deactivateDialog).getByText(/relaciones no se eliminan/i)).toBeInTheDocument();
    fireEvent.click(within(deactivateDialog).getByRole('button', { name: /^Desactivar actuación$/i }));

    await waitFor(() => expect(updateActuationTypeMock).toHaveBeenCalled());
    expect(updateActuationTypeMock).toHaveBeenCalledWith('subdivision-rural', expect.objectContaining({ is_active: false }));
    expect(screen.queryByRole('button', { name: /Subdivisión rural/i })).not.toBeInTheDocument();
  });

  it('muestra relaciones en tablas dentro del modal del nodo y permite quitar una relación', async () => {
    listRulesMock
      .mockResolvedValueOnce({
        data: {
          actuation_documents: [{ id: 'rule-doc-3', actuation_type_id: 'root', document_id: 'doc1' }],
          actuation_texts: [{ id: 'rule-text-3', actuation_type_id: 'root', text_id: 'txt1' }],
        },
      })
      .mockResolvedValueOnce({ data: { actuation_texts: [{ id: 'rule-text-3', actuation_type_id: 'root', text_id: 'txt1' }] } });
    deleteRuleMock.mockResolvedValue({ data: { ok: true } });

    renderPage();
    await screen.findByTestId('actuation-graph-canvas');

    fireEvent.click(within(screen.getByTestId('actuation-graph-canvas')).getByRole('button', { name: /Licencias urbanísticas/i }));
    fireEvent.click(screen.getByRole('button', { name: /Gestionar relaciones/i }));

    const detailDialog = await screen.findByRole('dialog', { name: /Licencias urbanísticas/i });
    expect(within(detailDialog).getByText(/Actuación padre/i)).toBeInTheDocument();
    expect(within(detailDialog).getByText(/Estado/i)).toBeInTheDocument();
    expect(within(detailDialog).getByRole('table', { name: /Relaciones documentales/i })).toBeInTheDocument();
    expect(await within(detailDialog).findByText('Formulario único nacional')).toBeInTheDocument();

    fireEvent.click(within(detailDialog).getByRole('button', { name: /Resolución relacionada/i }));
    expect(within(detailDialog).getByRole('table', { name: /Relaciones de resolución/i })).toBeInTheDocument();
    expect(within(detailDialog).getByText('Fundamento base')).toBeInTheDocument();

    fireEvent.click(within(detailDialog).getByRole('button', { name: /Documentos relacionados/i }));
    fireEvent.click(within(detailDialog).getByRole('button', { name: /Quitar Formulario único nacional/i }));

    await waitFor(() => expect(deleteRuleMock).toHaveBeenCalledWith('actuation_documents', 'rule-doc-3'));
  });

  it('selecciona una actuación y abre el modal de gobierno desde el inspector', async () => {
    listRulesMock.mockResolvedValue({
      data: {
        actuation_documents: [{ id: 'rule-doc-3', actuation_type_id: 'root', document_id: 'doc1' }],
        actuation_texts: [{ id: 'rule-text-3', actuation_type_id: 'root', text_id: 'txt1' }],
      },
    });

    renderPage();
    await screen.findByTestId('actuation-graph-canvas');

    fireEvent.click(within(screen.getByTestId('actuation-graph-canvas')).getByRole('button', { name: /Licencias urbanísticas/i }));
    expect(screen.getByText(/Padre: Raíz/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Gestionar relaciones/i }));

    const previewDialog = await screen.findByRole('dialog', { name: /Licencias urbanísticas/i });
    expect(await within(previewDialog).findByText('Formulario único nacional')).toBeInTheDocument();

    fireEvent.click(within(previewDialog).getByRole('button', { name: /Resolución relacionada/i }));
    expect(within(previewDialog).getByText('Fundamento base')).toBeInTheDocument();
  });

  it('ignora una respuesta de loadData desactualizada que resuelve después de una más reciente', async () => {
    let resolveSlowFetch;
    const slowFetch = new Promise((resolve) => { resolveSlowFetch = resolve; });

    const createdNode = {
      id: 'new-id',
      name: 'Nuevo tipo',
      slug: 'nuevo-tipo',
      node_type: 'actuation',
      parent_id: null,
      is_selectable: true,
      is_active: true,
    };
    createActuationTypeMock.mockResolvedValue({ data: createdNode });

    renderPage();
    await screen.findByTestId('actuation-graph-canvas');

    // "Actualizar" dispara un loadData que queda colgado (respuesta lenta).
    listActuationTypesMock.mockReturnValueOnce(slowFetch);
    fireEvent.click(screen.getByRole('button', { name: /^Actualizar$/i }));

    // Crear un tipo dispara un segundo loadData que resuelve antes, con datos más nuevos.
    listActuationTypesMock.mockResolvedValueOnce({ data: [...actuationTypes, createdNode] });
    fireEvent.click(screen.getByRole('button', { name: /Crear hija \/ tipo/i }));
    const dialog = await screen.findByRole('dialog', { name: /Crear tipo de actuación/i });
    fireEvent.change(within(dialog).getByLabelText(/Nombre del tipo/i), { target: { value: 'Nuevo tipo' } });
    fireEvent.click(within(dialog).getByRole('button', { name: /Agregar al árbol/i }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(await screen.findByRole('button', { name: /Nuevo tipo/i })).toBeInTheDocument();

    // Ahora resuelve la respuesta vieja y lenta de "Actualizar", con datos desactualizados
    // (sin el tipo recién creado). No debe pisar el estado más reciente.
    resolveSlowFetch({ data: actuationTypes });
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(screen.getByRole('button', { name: /Nuevo tipo/i })).toBeInTheDocument();
  });

  it('abre la página desde Configuración sin reemplazar Requisitos documentales', async () => {
    render(
      <MemoryRouter initialEntries={['/configuracion?tab=configuracion-actuaciones']}>
        <SettingsPage />
      </MemoryRouter>
    );

    expect(await screen.findByTestId('legal-config-page')).toBeInTheDocument();
    expect(screen.getByTestId('settings-nav-configuracion-actuaciones')).toHaveClass('is-active');
    expect(screen.getByTestId('settings-nav-requisitos-documentales')).toBeInTheDocument();
    expect(document.body.textContent || '').not.toMatch(/legal_config|id_|external_case_id/i);
  });
});
