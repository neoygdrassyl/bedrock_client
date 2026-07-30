import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

const service = vi.hoisted(() => ({
  workspace: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  saveAssociations: vi.fn(),
  evaluationConfig: vi.fn(),
  updateEvaluationConfig: vi.fn(),
  updateDocumentScope: vi.fn(),
}));
vi.mock('../../../services/legal_config.service.js', () => ({ default: service }));
import LegalConfigInitialPage from './LegalConfigInitialPage.jsx';

const workspace = {
  actuations: [{ id: 'a', name: 'Licencia', code: 'LIC', node_kind: 'category', is_active: true, revision: 0 }],
  typologies: [{ id: 't', name: 'Plano', code: 'PLA', is_active: true }],
  labels: [{ id: 'l', name: 'Firmado', code: 'FIR', is_active: true }],
  documents: [
    { id: 'd', name: 'Plano principal', code: 'PLA-1', typology_id: 't', is_active: true },
    { id: 'v', name: 'Plano variante', code: 'PLA-1-V', typology_id: 't', parent_document_id: 'd', is_active: true },
  ],
  conditions: [],
  conditionFields: [
    { key: 'culturalAny', label: 'Bien de interés cultural', operator: 'includes_any', values: [{ value: 'A', label: 'Sí' }, { value: 'B', label: 'No' }] },
  ],
  conditionDocuments: [],
  actuationConditions: [],
  documentLabels: [],
  labelTypologies: [],
  actuationTypologies: [],
  actuationLabels: [],
  directDocuments: [],
  documentScope: { section: '100', subsection: '.01' },
};

const evaluation = {
  own_config: { legal_requirements: [], typology_checks: [], document_checks: [] },
  effective_config: { legal_requirements: [], typology_checks: [], document_checks: [] },
  ancestor_layers: [],
};

function actuationButton(name) {
  return screen.getByRole('button', { name: new RegExp(`^${name},`) });
}

async function loaded() {
  await screen.findByRole('columnheader', { name: 'Documento' });
}

function openNewDocument() {
  fireEvent.click(screen.getByRole('button', { name: 'Nuevo documento' }));
  return screen.getByRole('dialog', { name: 'Nuevo documento' });
}

function openAssociationsTab(name) {
  fireEvent.click(screen.getByRole('tab', { name: new RegExp(`^${name}`) }));
}

describe('LegalConfigInitialPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    service.workspace.mockResolvedValue({ data: workspace });
    service.evaluationConfig.mockResolvedValue({ data: evaluation });
    service.updateEvaluationConfig.mockResolvedValue({ data: evaluation });
    service.updateDocumentScope.mockResolvedValue({ data: workspace.documentScope });
  });
  afterEach(() => vi.clearAllMocks());

  it('nests one-level variants and posts a document with its typology', async () => {
    service.create.mockResolvedValue({ data: { id: 'new' } });
    render(<LegalConfigInitialPage />);
    await loaded();
    expect(screen.getByRole('row', { name: /Plano variante Variante de Plano principal/ })).toBeInTheDocument();

    const dialog = openNewDocument();
    fireEvent.change(within(dialog).getByLabelText(/^Nombre/), { target: { value: 'Certificado' } });
    fireEvent.change(within(dialog).getByLabelText(/^Código/), { target: { value: 'CER' } });
    const typology = within(dialog).getByRole('combobox', { name: 'Tipología' });
    fireEvent.change(typology, { target: { value: 'Plano' } });
    fireEvent.keyDown(typology, { key: 'Enter' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Crear documento' }));

    await waitFor(() => expect(service.create).toHaveBeenCalledWith('documents', expect.objectContaining({ typology_id: 't' })));
  });

  it('shows the server error when saving a document fails', async () => {
    service.create.mockRejectedValue({ response: { data: { message: 'La tipología no está activa.' } } });
    render(<LegalConfigInitialPage />);
    await loaded();
    const dialog = openNewDocument();
    fireEvent.change(within(dialog).getByLabelText(/^Nombre/), { target: { value: 'Certificado' } });
    fireEvent.change(within(dialog).getByLabelText(/^Código/), { target: { value: 'CER' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Crear documento' }));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('La tipología no está activa.');
  });

  it('keeps the selected typology visible while allowing a document without one', async () => {
    service.create.mockResolvedValue({ data: { id: 'standalone' } });
    render(<LegalConfigInitialPage />);
    await loaded();
    const dialog = openNewDocument();
    fireEvent.change(within(dialog).getByLabelText(/^Nombre/), { target: { value: 'Certificado' } });
    fireEvent.change(within(dialog).getByLabelText(/^Código/), { target: { value: 'CER' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Crear documento' }));
    await waitFor(() => expect(service.create).toHaveBeenCalledWith('documents', expect.objectContaining({
      name: 'Certificado', code: 'CER', typology_id: null, label_ids: [],
    })));

    const nextDialog = openNewDocument();
    const typology = within(nextDialog).getByRole('combobox', { name: 'Tipología' });
    fireEvent.change(typology, { target: { value: 'Plano' } });
    fireEvent.keyDown(typology, { key: 'Enter' });
    expect(typology).toHaveValue('Plano');
  });

  it('opens a normalized catalogue modal and manages typologies and labels independently', async () => {
    service.create.mockResolvedValue({ data: { id: 'new-catalogue', name: 'Nuevo catálogo', is_active: true } });
    render(<LegalConfigInitialPage />);
    await loaded();
    fireEvent.click(screen.getByRole('button', { name: 'Gestionar catálogos' }));
    const dialog = screen.getByRole('dialog', { name: 'Tipologías y etiquetas' });
    expect(within(dialog).getByText('Plano')).toBeInTheDocument();

    fireEvent.change(within(dialog).getByLabelText('Nuevo nombre'), { target: { value: 'Nueva tipología' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Crear tipología' }));
    await waitFor(() => expect(service.create).toHaveBeenCalledWith('typologies', { name: 'Nueva tipología', code: 'Nueva tipología' }));

    fireEvent.click(within(dialog).getByRole('tab', { name: /Etiquetas/ }));
    expect(within(dialog).getAllByText('Firmado')).not.toHaveLength(0);
    fireEvent.change(within(dialog).getByLabelText('Nuevo nombre'), { target: { value: 'Nueva etiqueta' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Crear etiqueta' }));
    await waitFor(() => expect(service.create).toHaveBeenCalledWith('labels', { name: 'Nueva etiqueta', code: 'Nueva etiqueta' }));
  });

  it('sends the entered suffix as variant_code and inherits the parent typology', async () => {
    service.create.mockResolvedValue({ data: { id: 'new-variant' } });
    render(<LegalConfigInitialPage />);
    await loaded();
    const dialog = openNewDocument();
    fireEvent.change(within(dialog).getByLabelText(/^Nombre/), { target: { value: 'Plano de sótano' } });
    fireEvent.change(within(dialog).getByRole('combobox', { name: /^Variante de/ }), { target: { value: 'd' } });
    fireEvent.change(within(dialog).getByLabelText(/^Sufijo del código/), { target: { value: 'SOT' } });
    expect(within(dialog).getByLabelText('Clasificación heredada del documento principal')).toHaveTextContent('Plano');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Crear documento' }));

    await waitFor(() => expect(service.create).toHaveBeenCalledWith('documents', expect.objectContaining({
      code: 'SOT', variant_code: 'SOT', parent_document_id: 'd', typology_id: 't',
    })));
  });

  it('shows an accessible error when managed typology creation fails', async () => {
    service.create.mockRejectedValue({ response: { data: { message: 'La tipología ya existe.' } } });
    render(<LegalConfigInitialPage />);
    await loaded();
    fireEvent.click(screen.getByRole('button', { name: 'Gestionar catálogos' }));
    const dialog = screen.getByRole('dialog', { name: 'Tipologías y etiquetas' });
    const nameInput = within(dialog).getByLabelText('Nuevo nombre');
    fireEvent.change(nameInput, { target: { value: 'Nueva tipología' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Crear tipología' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('La tipología ya existe.');
    expect(nameInput).toHaveValue('Nueva tipología');
  });

  it('shows an accessible error when inline actuation creation fails', async () => {
    service.create.mockRejectedValue({ response: { data: { message: 'La actuación ya existe.' } } });
    render(<LegalConfigInitialPage />);
    await loaded();
    fireEvent.click(screen.getByRole('button', { name: 'Nueva actuación o modalidad' }));
    const dialog = screen.getByRole('dialog', { name: 'Nueva categoría, actuación o modalidad' });
    fireEvent.change(within(dialog).getByLabelText(/^Nombre/), { target: { value: 'Nueva actuación' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Crear categoría' }));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('La actuación ya existe.');
  });

  it('shows an accessible error when managed label creation fails', async () => {
    service.create.mockRejectedValue({ response: { data: { message: 'La etiqueta ya existe.' } } });
    render(<LegalConfigInitialPage />);
    await loaded();
    fireEvent.click(screen.getByRole('button', { name: 'Gestionar catálogos' }));
    const dialog = screen.getByRole('dialog', { name: 'Tipologías y etiquetas' });
    fireEvent.click(within(dialog).getByRole('tab', { name: /Etiquetas/ }));
    const nameInput = within(dialog).getByLabelText('Nuevo nombre');
    fireEvent.change(nameInput, { target: { value: 'Nueva etiqueta' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Crear etiqueta' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('La etiqueta ya existe.');
    expect(nameInput).toHaveValue('Nueva etiqueta');
  });

  it('announces the initial load and refresh while workspace data is pending', async () => {
    let resolveWorkspace;
    service.workspace.mockImplementation(() => new Promise((resolve) => { resolveWorkspace = resolve; }));
    render(<LegalConfigInitialPage />);
    expect(screen.getByRole('status')).toHaveTextContent('Cargando configuración');
    expect(screen.getByRole('button', { name: 'Nuevo documento' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Nueva actuación o modalidad' })).toBeDisabled();
    resolveWorkspace({ data: workspace });
    await loaded();

    service.workspace.mockImplementation(() => new Promise(() => {}));
    fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }));
    expect(screen.getByRole('status')).toHaveTextContent('Cargando configuración');
  });

  it('shows alert feedback when saving associations fails', async () => {
    service.saveAssociations.mockRejectedValue({ response: { data: { message: 'No se pudieron guardar las asociaciones.' } } });
    render(<LegalConfigInitialPage />);
    await loaded();
    openAssociationsTab('Documentos directos');
    fireEvent.click(screen.getByRole('button', { name: 'Agregar Plano principal' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron guardar las asociaciones.');
  });

  it('clears a previous association success notice when a later save fails', async () => {
    service.workspace
      .mockResolvedValueOnce({ data: workspace })
      .mockResolvedValue({ data: { ...workspace, directDocuments: [{ actuation_id: 'a', document_id: 'd' }] } });
    service.saveAssociations
      .mockResolvedValueOnce({ data: { revision: 1 } })
      .mockRejectedValueOnce({ response: { data: { message: 'No se pudieron guardar las asociaciones.' } } });
    render(<LegalConfigInitialPage />);
    await loaded();
    openAssociationsTab('Documentos directos');
    fireEvent.click(screen.getByRole('button', { name: 'Agregar Plano principal' }));
    expect(await screen.findByText('Asociaciones guardadas.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Quitar Plano principal' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron guardar las asociaciones.');
    expect(screen.queryByText('Asociaciones guardadas.')).not.toBeInTheDocument();
  });

  it('announces that a conflicting association change was refreshed but not saved', async () => {
    service.saveAssociations.mockRejectedValue({ response: { status: 409, data: { message: 'La configuración fue modificada por otro administrador.' } } });
    render(<LegalConfigInitialPage />);
    await loaded();
    openAssociationsTab('Documentos directos');
    fireEvent.click(screen.getByRole('button', { name: 'Agregar Plano principal' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('La configuración se actualizó y el cambio de asociación no se guardó.');
    await waitFor(() => expect(service.workspace).toHaveBeenCalledTimes(2));
  });

  it('adds the selected catalogue item and saves associations successfully', async () => {
    service.saveAssociations.mockResolvedValue({ data: { revision: 1 } });
    render(<LegalConfigInitialPage />);
    await loaded();
    openAssociationsTab('Documentos directos');
    fireEvent.click(screen.getByRole('button', { name: 'Agregar Plano principal' }));
    await waitFor(() => expect(service.saveAssociations).toHaveBeenCalledWith('a', expect.objectContaining({ document_ids: ['d'] })));
    expect(await screen.findByRole('status')).toHaveTextContent('Asociaciones guardadas.');
  });

  it('exposes the current configuration controls through labelled workspace controls', async () => {
    render(<LegalConfigInitialPage />);
    const workspaceRoot = await screen.findByRole('main', { name: 'Documentos y actuaciones' });
    expect(within(workspaceRoot).getByRole('textbox', { name: 'Buscar documentos' })).toBeInTheDocument();
    expect(within(workspaceRoot).getByRole('tablist', { name: 'Catálogo disponible' })).toBeInTheDocument();
    expect(within(workspaceRoot).getByRole('combobox', { name: 'Tipología' })).toBeInTheDocument();
  });

  it('saves contextual legal requirements for the selected actuation', async () => {
    service.updateEvaluationConfig.mockResolvedValue({ data: { ...evaluation, own_config: { ...evaluation.own_config, legal_requirements: [{ typology_id: 't', document_id: 'd', requirement: 'complementary' }] } } });
    render(<LegalConfigInitialPage />);
    await loaded();
    await waitFor(() => expect(screen.queryByText('Cargando reglas de evaluación…')).not.toBeInTheDocument());
    fireEvent.change(screen.getByRole('combobox', { name: 'Exigencia de Plano principal' }), { target: { value: 'complementary' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    await waitFor(() => expect(service.updateEvaluationConfig).toHaveBeenCalledWith('a', {
      evaluation_config: expect.objectContaining({
        legal_requirements: expect.arrayContaining([{ typology_id: 't', document_id: 'd', requirement: 'complementary' }]),
      }),
    }));
  });

  it('shows an accessible error when contextual evaluation is unavailable', async () => {
    service.evaluationConfig.mockRejectedValue({ response: { status: 404 } });
    render(<LegalConfigInitialPage />);
    await loaded();
    expect(await screen.findByRole('alert')).toHaveTextContent('La evaluación contextual aún no está disponible en el servicio.');
    expect(actuationButton('Licencia')).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows an accessible server error when contextual evaluation cannot be saved', async () => {
    service.updateEvaluationConfig.mockRejectedValue({ response: { data: { message: 'La configuración fue modificada por otro administrador.' } } });
    render(<LegalConfigInitialPage />);
    await loaded();
    fireEvent.change(screen.getByRole('combobox', { name: 'Exigencia de Plano principal' }), { target: { value: 'not_applicable' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('No fue posible guardar la evaluación contextual. La configuración fue modificada por otro administrador.');
  });

  it('keeps the in-flight association snapshot bound to its actuation', async () => {
    let resolveSave;
    service.workspace.mockResolvedValue({ data: { ...workspace, actuations: [...workspace.actuations, { id: 'b', name: 'Reconocimiento', code: 'REC', node_kind: 'category', is_active: true, revision: 0 }] } });
    service.saveAssociations.mockImplementation(() => new Promise((resolve) => { resolveSave = resolve; }));
    render(<LegalConfigInitialPage />);
    await loaded();
    openAssociationsTab('Documentos directos');
    fireEvent.click(screen.getByRole('button', { name: 'Agregar Plano principal' }));
    await waitFor(() => expect(service.saveAssociations).toHaveBeenCalledWith('a', expect.objectContaining({ document_ids: ['d'], revision: 0 })));
    expect(actuationButton('Reconocimiento')).toBeDisabled();
    resolveSave({ data: { revision: 1 } });
    await screen.findByText('Asociaciones guardadas.');
  });

  it('gives document catalogue comboboxes distinct listbox IDs', async () => {
    render(<LegalConfigInitialPage />);
    await loaded();
    const dialog = openNewDocument();
    const catalogueInputs = within(dialog).getAllByRole('combobox').filter((input) => input.hasAttribute('aria-controls'));
    expect(catalogueInputs).toHaveLength(2);
    expect(catalogueInputs[0].getAttribute('aria-controls')).not.toBe(catalogueInputs[1].getAttribute('aria-controls'));
    fireEvent.keyDown(catalogueInputs[1], { key: 'ArrowDown' });
    const listbox = within(dialog).getByRole('listbox');
    expect(listbox.id).toBe(catalogueInputs[1].getAttribute('aria-controls'));
    expect(within(listbox).getByRole('option', { name: 'Firmado' }).id).toMatch(new RegExp(`^${listbox.id}-`));
  });

  it('selects the first active actuation after loading so associations are immediately usable', async () => {
    render(<LegalConfigInitialPage />);
    await loaded();
    expect(screen.getByRole('region', { name: 'Configuración de Licencia' })).toBeInTheDocument();
    expect(actuationButton('Licencia')).toHaveAttribute('aria-pressed', 'true');
  });

  it('creates an actuation from an inline form instead of a browser prompt', async () => {
    service.create.mockResolvedValue({ data: { id: 'new-actuation', name: 'Reconocimiento' } });
    render(<LegalConfigInitialPage />);
    await loaded();
    fireEvent.click(screen.getByRole('button', { name: 'Nueva actuación o modalidad' }));
    const dialog = screen.getByRole('dialog', { name: 'Nueva categoría, actuación o modalidad' });
    fireEvent.change(within(dialog).getByLabelText(/^Nombre/), { target: { value: 'Reconocimiento' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Crear categoría' }));
    await waitFor(() => expect(service.create).toHaveBeenCalledWith('actuations', {
      name: 'Reconocimiento', parent_id: null, node_kind: 'category', code: 'Reconocimiento',
    }));
  });

  it('shows guided empty states when the catalogue has no actuations or documents', async () => {
    service.workspace.mockResolvedValue({ data: { ...workspace, actuations: [], documents: [] } });
    render(<LegalConfigInitialPage />);
    expect(await screen.findByText('Aún no hay actuaciones')).toBeInTheDocument();
    expect(screen.getByText('Aún no hay documentos. Crea el primero para iniciar el catálogo.')).toBeInTheDocument();
    expect(screen.getByText(/Crea una actuación para empezar a relacionar/i)).toBeInTheDocument();
  });

  it('keeps the workspace headings compact without repeated panel descriptions', async () => {
    render(<LegalConfigInitialPage />);
    expect(await screen.findByRole('heading', { name: 'Documentos y actuaciones' })).toBeInTheDocument();
    expect(screen.queryByText('Organiza el catálogo documental y define qué aplica a cada actuación urbanística.')).not.toBeInTheDocument();
    expect(screen.queryByText('Selecciona el contexto a configurar.')).not.toBeInTheDocument();
    expect(screen.queryByText('Registra documentos principales y variantes.')).not.toBeInTheDocument();
    expect(screen.queryByText('Define cómo se resuelve la matriz.')).not.toBeInTheDocument();
  });

  it('shows the actuation code badge in the main list but hides technical acronyms from catalogue views', async () => {
    render(<LegalConfigInitialPage />);
    await loaded();
    expect(within(actuationButton('Licencia')).getByTitle('Código: LIC')).toHaveTextContent('LIC');
    fireEvent.click(screen.getByRole('button', { name: 'Gestionar catálogos' }));
    const dialog = screen.getByRole('dialog', { name: 'Tipologías y etiquetas' });
    expect(within(dialog).queryByText('PLA')).not.toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('tab', { name: /Etiquetas/ }));
    expect(within(dialog).queryByText('FIR')).not.toBeInTheDocument();
  });

  it('shows the document variant hierarchy and a clear resulting-code preview', async () => {
    render(<LegalConfigInitialPage />);
    await loaded();
    expect(screen.getByRole('row', { name: /Plano principal 1 variante/ })).toBeInTheDocument();
    const dialog = openNewDocument();
    fireEvent.change(within(dialog).getByLabelText(/^Nombre/), { target: { value: 'Plano de sótano' } });
    fireEvent.change(within(dialog).getByRole('combobox', { name: /^Variante de/ }), { target: { value: 'd' } });
    fireEvent.change(within(dialog).getByLabelText(/^Sufijo del código/), { target: { value: 'SOT' } });
    const preview = within(dialog).getByLabelText('Vista previa de la variante');
    expect(within(preview).getByText('PLA-1-SOT')).toBeInTheDocument();
    expect(within(preview).getByText('Plano principal')).toBeInTheDocument();
  });

  it('edits series and subseries codes in an independent modal', async () => {
    const seriesWorkspace = {
      ...workspace,
      actuations: [
        { ...workspace.actuations[0], name: 'Licencias urbanísticas', code: '100' },
        { id: 'child', name: 'Licencia de construcción', code: '100-01', parent_id: 'a', node_kind: 'actuation', is_active: true, revision: 0 },
      ],
    };
    service.workspace.mockResolvedValue({ data: seriesWorkspace });
    service.update.mockResolvedValue({ data: {} });
    render(<LegalConfigInitialPage />);
    await loaded();
    fireEvent.click(screen.getByRole('button', { name: 'Gestionar series' }));
    const dialog = screen.getByRole('dialog', { name: 'Series y subseries' });
    expect(within(dialog).getByRole('heading', { name: 'Licencias urbanísticas' })).toBeInTheDocument();
    expect(within(dialog).getByText('Licencia de construcción')).toBeInTheDocument();
    fireEvent.change(within(dialog).getByRole('textbox', { name: 'Código de la serie' }), { target: { value: '200' } });
    fireEvent.change(within(dialog).getByLabelText('Sufijo de código para Licencia de construcción'), { target: { value: '-01' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Guardar cambios' }));
    await waitFor(() => {
      expect(service.update).toHaveBeenCalledWith('actuations', 'a', expect.objectContaining({ code: '200' }));
      expect(service.update).toHaveBeenCalledWith('actuations', 'child', expect.objectContaining({ code: '200-01' }));
    });
  });

  it('creates a subserie inline from the series modal with its composed code', async () => {
    service.workspace.mockResolvedValue({ data: { ...workspace, actuations: [{ ...workspace.actuations[0], name: 'Licencias urbanísticas', code: '100' }] } });
    service.create.mockResolvedValue({ data: { id: 'new-child' } });
    render(<LegalConfigInitialPage />);
    await loaded();
    fireEvent.click(screen.getByRole('button', { name: 'Gestionar series' }));
    const dialog = screen.getByRole('dialog', { name: 'Series y subseries' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Nueva subserie' }));
    fireEvent.change(within(dialog).getByLabelText('Nombre de la subserie'), { target: { value: 'Licencia de intervención' } });
    fireEvent.change(within(dialog).getByLabelText('Sufijo para la nueva subserie de Licencias urbanísticas'), { target: { value: '-02' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Agregar' }));
    await waitFor(() => expect(service.create).toHaveBeenCalledWith('actuations', { name: 'Licencia de intervención', code: '100-02', parent_id: 'a' }));
  });

  it('persists series before subseries so a subserie is not validated against a stale parent code', async () => {
    const seriesWorkspace = {
      ...workspace,
      actuations: [
        { ...workspace.actuations[0], name: 'Licencias urbanísticas', code: '100' },
        { id: 'child', name: 'Licencia de construcción', code: '100-01', parent_id: 'a', node_kind: 'actuation', is_active: true, revision: 0 },
      ],
    };
    service.workspace.mockResolvedValue({ data: seriesWorkspace });
    let resolveRootUpdate;
    service.update.mockImplementation((_catalogue, id) => (
      id === 'a' ? new Promise((resolve) => { resolveRootUpdate = resolve; }) : Promise.resolve({ data: {} })
    ));
    render(<LegalConfigInitialPage />);
    await loaded();
    fireEvent.click(screen.getByRole('button', { name: 'Gestionar series' }));
    const dialog = screen.getByRole('dialog', { name: 'Series y subseries' });
    fireEvent.change(within(dialog).getByRole('textbox', { name: 'Código de la serie' }), { target: { value: '200' } });
    fireEvent.change(within(dialog).getByLabelText('Sufijo de código para Licencia de construcción'), { target: { value: '-01' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Guardar cambios' }));
    await waitFor(() => expect(service.update).toHaveBeenCalledWith('actuations', 'a', expect.objectContaining({ code: '200' })));
    expect(service.update).not.toHaveBeenCalledWith('actuations', 'child', expect.anything());
    resolveRootUpdate({ data: {} });
    await waitFor(() => expect(service.update).toHaveBeenCalledWith('actuations', 'child', expect.objectContaining({ code: '200-01' })));
  });

  it('creates a compact condition under the selected actuation and links its document', async () => {
    service.create.mockResolvedValue({ data: { id: 'condition-1', name: 'El predio es BIC' } });
    render(<LegalConfigInitialPage />);
    await loaded();
    openAssociationsTab('Condiciones');
    fireEvent.click(screen.getByRole('button', { name: 'Nueva condición' }));
    const dialog = screen.getByRole('dialog', { name: 'Nueva condición' });
    fireEvent.change(within(dialog).getByLabelText('Nombre de la condición'), { target: { value: 'El predio es BIC' } });
    fireEvent.change(within(dialog).getByLabelText('Dato del FUN'), { target: { value: 'culturalAny' } });
    fireEvent.change(within(dialog).getByLabelText('Valor'), { target: { value: 'A' } });
    fireEvent.change(within(dialog).getByLabelText('Resultado'), { target: { value: 'include' } });
    const documents = within(dialog).getByRole('combobox', { name: 'Documentos' });
    fireEvent.keyDown(documents, { key: 'ArrowDown' });
    fireEvent.keyDown(documents, { key: 'Enter' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Crear condición' }));
    await waitFor(() => expect(service.create).toHaveBeenCalledWith('conditions', {
      name: 'El predio es BIC', code: 'El predio es BIC', source_key: 'culturalAny', operator: 'includes_any',
      expected_values: ['A'], effect: 'include', document_ids: ['d'], actuation_ids: ['a'],
    }));
  });

  it('filters the actuation tree while preserving category, actuation, and modality context', async () => {
    service.workspace.mockResolvedValue({
      data: {
        ...workspace,
        actuations: [
          { id: 'category', name: 'Licencias urbanísticas', code: 'D', node_kind: 'category', is_active: true, revision: 0 },
          { id: 'construction', parent_id: 'category', name: 'Construcción', code: 'D_A', node_kind: 'actuation', is_active: true, revision: 0 },
          { id: 'new-work', parent_id: 'construction', name: 'Obra nueva', code: 'D_A_01', node_kind: 'modality', is_active: true, revision: 0 },
          ...workspace.actuations,
        ],
      },
    });
    render(<LegalConfigInitialPage />);
    await loaded();
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar actuación' }), { target: { value: 'obra nueva' } });
    expect(actuationButton('Licencias urbanísticas')).toBeInTheDocument();
    expect(actuationButton('Construcción')).toBeInTheDocument();
    expect(actuationButton('Obra nueva')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Licencia,/ })).not.toBeInTheDocument();
  });

  it('uses the shared DataTable standard for the document catalogue and controlled catalogues', async () => {
    render(<LegalConfigInitialPage />);
    expect(await screen.findByRole('columnheader', { name: 'Código' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Documento' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Tipología' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Etiquetas' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Estado' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Gestionar catálogos' }));
    const dialog = screen.getByRole('dialog', { name: 'Tipologías y etiquetas' });
    expect(within(dialog).getByRole('columnheader', { name: 'Nombre' })).toBeInTheDocument();
    expect(within(dialog).getByRole('columnheader', { name: 'Estado' })).toBeInTheDocument();
    expect(within(dialog).getByRole('columnheader', { name: 'Acciones' })).toBeInTheDocument();
  });

  it('marks the controlled catalogue and condition names as required form fields', async () => {
    render(<LegalConfigInitialPage />);
    await loaded();
    fireEvent.click(screen.getByRole('button', { name: 'Gestionar catálogos' }));
    const catalogueDialog = screen.getByRole('dialog', { name: 'Tipologías y etiquetas' });
    expect(within(catalogueDialog).getByLabelText('Nuevo nombre')).toBeRequired();
    fireEvent.click(within(catalogueDialog).getByRole('button', { name: 'Cerrar' }));
    openAssociationsTab('Condiciones');
    fireEvent.click(screen.getByRole('button', { name: 'Nueva condición' }));
    expect(within(screen.getByRole('dialog', { name: 'Nueva condición' })).getByLabelText('Nombre de la condición')).toBeRequired();
  });

  it('keeps the parent context when searching a document variant', async () => {
    render(<LegalConfigInitialPage />);
    await loaded();
    fireEvent.change(screen.getByRole('textbox', { name: 'Buscar documentos' }), { target: { value: 'variante' } });
    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(within(table).getByText('Plano principal')).toBeInTheDocument();
      expect(within(table).getByText('Plano variante')).toBeInTheDocument();
    });
  });
});
