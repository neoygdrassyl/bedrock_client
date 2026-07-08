import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const {
  serviceMock,
  listActuationTypesMock,
  listDocumentDefinitionsMock,
  listConfigurationLabelsMock,
  listLegalTextsMock,
  listReadContractsMock,
  listAssertionsMock,
  listRulesMock,
  createActuationTypeMock,
  createActuationDocumentRuleMock,
  createActuationTextRuleMock,
  createActuationDocumentsByLabelRuleMock,
  createActuationTextsByLabelRuleMock,
} = vi.hoisted(() => {
  const listActuationTypesMock = vi.fn();
  const listDocumentDefinitionsMock = vi.fn();
  const listConfigurationLabelsMock = vi.fn();
  const listLegalTextsMock = vi.fn();
  const listReadContractsMock = vi.fn();
  const listAssertionsMock = vi.fn();
  const listRulesMock = vi.fn();
  const createActuationTypeMock = vi.fn();
  const createActuationDocumentRuleMock = vi.fn();
  const createActuationTextRuleMock = vi.fn();
  const createActuationDocumentsByLabelRuleMock = vi.fn();
  const createActuationTextsByLabelRuleMock = vi.fn();
  return {
    listActuationTypesMock,
    listDocumentDefinitionsMock,
    listConfigurationLabelsMock,
    listLegalTextsMock,
    listReadContractsMock,
    listAssertionsMock,
    listRulesMock,
    createActuationTypeMock,
    createActuationDocumentRuleMock,
    createActuationTextRuleMock,
    createActuationDocumentsByLabelRuleMock,
    createActuationTextsByLabelRuleMock,
    serviceMock: {
      listActuationTypes: listActuationTypesMock,
      listDocumentDefinitions: listDocumentDefinitionsMock,
      listConfigurationLabels: listConfigurationLabelsMock,
      listLegalTexts: listLegalTextsMock,
      listReadContracts: listReadContractsMock,
      listAssertions: listAssertionsMock,
      listRules: listRulesMock,
      createActuationType: createActuationTypeMock,
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
  { id: 'doc1', name: 'Formulario único nacional', slug: 'fun' },
  { id: 'doc2', name: 'Plano arquitectónico firmado', slug: 'plano-arquitectonico' },
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
    expect(screen.getByRole('button', { name: /Licencia de subdivisión/i })).toBeInTheDocument();
    expect(screen.getByText(/Subdivisión rural/i)).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /Crear tipo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Asociar texto jurídico/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Asociar documento/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Asociar etiqueta/i })).toBeInTheDocument();

    expect(screen.getByTestId('actuation-quick-relations')).toBeInTheDocument();
    expect(screen.getByTestId('actuation-relation-list')).toBeInTheDocument();

    const visibleCopy = document.body.textContent || '';
    expect(visibleCopy).not.toMatch(/id_|external_case_id|actuation_type_id|legal_config/i);
    expect(screen.queryByText(/Control de calidad gráfico/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Demo rápida/i)).not.toBeInTheDocument();
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

    fireEvent.click(screen.getByRole('button', { name: /Crear tipo/i }));

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

    fireEvent.click(screen.getByRole('button', { name: /Crear tipo/i }));
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
    fireEvent.click(screen.getByRole('button', { name: /Licencia de subdivisión/i }));

    fireEvent.click(screen.getByRole('button', { name: /Asociar documento/i }));
    let dialog = await screen.findByRole('dialog', { name: /Asociar documento/i });
    fireEvent.change(within(dialog).getByLabelText(/Documento disponible/i), { target: { value: 'doc2' } });
    fireEvent.click(within(dialog).getByRole('button', { name: /Guardar relación/i }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(createActuationDocumentRuleMock).toHaveBeenCalledWith({ actuation_type_id: 'subdivision', document_id: 'doc2' });
    expect(within(screen.getByTestId('actuation-relation-list')).getByText('Plano arquitectónico firmado')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Asociar texto jurídico/i }));
    dialog = await screen.findByRole('dialog', { name: /Asociar texto jurídico/i });
    fireEvent.change(within(dialog).getByLabelText(/Texto jurídico disponible/i), { target: { value: 'txt2' } });
    fireEvent.click(within(dialog).getByRole('button', { name: /Guardar relación/i }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(createActuationTextRuleMock).toHaveBeenCalledWith({ actuation_type_id: 'subdivision', text_id: 'txt2' });
    expect(within(screen.getByTestId('actuation-relation-list')).getByText('Texto jurídico para subdivisión')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Asociar etiqueta/i }));
    dialog = await screen.findByRole('dialog', { name: /Asociar etiqueta/i });
    fireEvent.change(within(dialog).getByLabelText(/Etiqueta disponible/i), { target: { value: 'label-doc' } });
    fireEvent.click(within(dialog).getByRole('button', { name: /Guardar relación/i }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(createActuationDocumentsByLabelRuleMock).toHaveBeenCalledWith({ actuation_type_id: 'subdivision', label_id: 'label-doc' });
    expect(within(screen.getByTestId('actuation-relation-list')).getByText('Documentos comunes')).toBeInTheDocument();
  });

  it('relaciona documentos, textos y etiquetas desde el panel de relaciones rápidas contra el backend', async () => {
    const rulesAfterQuickRelate = {
      actuation_documents: [{ id: 'rule-doc-2', actuation_type_id: 'subdivision-rural', document_id: 'doc1' }],
      actuation_texts: [{ id: 'rule-text-2', actuation_type_id: 'subdivision-rural', text_id: 'txt1' }],
      actuation_texts_by_labels: [{ id: 'rule-label-2', actuation_type_id: 'subdivision-rural', label_id: 'label-text' }],
    };
    createActuationDocumentRuleMock.mockResolvedValue({ data: rulesAfterQuickRelate.actuation_documents[0] });
    createActuationTextRuleMock.mockResolvedValue({ data: rulesAfterQuickRelate.actuation_texts[0] });
    createActuationTextsByLabelRuleMock.mockResolvedValue({ data: rulesAfterQuickRelate.actuation_texts_by_labels[0] });

    listRulesMock
      .mockResolvedValueOnce({ data: {} })
      .mockResolvedValueOnce({ data: rulesAfterQuickRelate });

    renderPage();

    await screen.findByTestId('actuation-graph-canvas');
    fireEvent.click(screen.getByRole('button', { name: /Subdivisión rural/i }));

    const quickPanel = screen.getByTestId('actuation-quick-relations');
    fireEvent.change(within(quickPanel).getByLabelText(/Documento/i), { target: { value: 'doc1' } });
    fireEvent.change(within(quickPanel).getByLabelText(/Texto jurídico/i), { target: { value: 'txt1' } });
    fireEvent.change(within(quickPanel).getByLabelText(/Etiqueta/i), { target: { value: 'label-text' } });
    fireEvent.click(within(quickPanel).getByRole('button', { name: /Relacionar seleccionados/i }));

    await waitFor(() => expect(createActuationTextsByLabelRuleMock).toHaveBeenCalled());
    expect(createActuationDocumentRuleMock).toHaveBeenCalledWith({ actuation_type_id: 'subdivision-rural', document_id: 'doc1' });
    expect(createActuationTextRuleMock).toHaveBeenCalledWith({ actuation_type_id: 'subdivision-rural', text_id: 'txt1' });
    expect(createActuationTextsByLabelRuleMock).toHaveBeenCalledWith({ actuation_type_id: 'subdivision-rural', label_id: 'label-text' });

    const relationList = await screen.findByTestId('actuation-relation-list');
    expect(within(relationList).getByText('Formulario único nacional')).toBeInTheDocument();
    expect(within(relationList).getByText('Fundamento base')).toBeInTheDocument();
    expect(within(relationList).getByText('Fundamentos jurídicos')).toBeInTheDocument();
    expect(screen.getByText(/Backend/i)).toBeInTheDocument();
  });

  it('al hacer click en una actuación general (grupo) abre un modal de previsualización con documentos y textos reales', async () => {
    listRulesMock.mockResolvedValue({
      data: {
        actuation_documents: [{ id: 'rule-doc-3', actuation_type_id: 'root', document_id: 'doc1' }],
        actuation_texts: [{ id: 'rule-text-3', actuation_type_id: 'root', text_id: 'txt1' }],
      },
    });

    renderPage();
    await screen.findByTestId('actuation-graph-canvas');

    fireEvent.click(screen.getByRole('button', { name: /Licencias urbanísticas/i }));

    const previewDialog = await screen.findByRole('dialog', { name: /Licencias urbanísticas/i });
    expect(within(previewDialog).getByText('Formulario único nacional')).toBeInTheDocument();

    fireEvent.click(within(previewDialog).getByRole('button', { name: /Textos legales/i }));
    expect(within(previewDialog).getByText('Fundamento base')).toBeInTheDocument();

    fireEvent.keyDown(previewDialog, { key: 'Escape', code: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    // las actuaciones que no son de tipo "grupo" solo se seleccionan, no abren previsualización
    fireEvent.click(screen.getByRole('button', { name: /Licencia de subdivisión/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
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
    fireEvent.click(screen.getByRole('button', { name: /^Crear tipo$/i }));
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
