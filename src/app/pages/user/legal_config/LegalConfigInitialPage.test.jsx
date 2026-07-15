import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

const service = vi.hoisted(() => ({ workspace: vi.fn(), create: vi.fn(), update: vi.fn(), saveAssociations: vi.fn() }));
vi.mock('../../../services/legal_config.service.js', () => ({ default: service }));
import LegalConfigInitialPage from './LegalConfigInitialPage.jsx';

const workspace = {
  actuations: [{ id: 'a', name: 'Licencia', code: 'LIC', is_active: true, revision: 0 }],
  typologies: [{ id: 't', name: 'Plano', code: 'PLA', is_active: true }],
  labels: [{ id: 'l', name: 'Firmado', code: 'FIR', is_active: true }],
  documents: [{ id: 'd', name: 'Plano principal', code: 'PLA-1', typology_id: 't', is_active: true }, { id: 'v', name: 'Plano variante', code: 'PLA-1-V', typology_id: 't', parent_document_id: 'd', is_active: true }],
  conditions: [],
  conditionFields: [
    { key: 'culturalAny', label: 'Bien de interés cultural', operator: 'includes_any', values: [{ value: 'A', label: 'Sí' }, { value: 'B', label: 'No' }] },
  ],
  conditionDocuments: [], actuationConditions: [],
  documentLabels: [], actuationTypologies: [], actuationLabels: [], directDocuments: [],
  legacyActuationTypes: [{ id: 'legacy-a', name: 'Licencia heredada', slug: 'licencia-heredada' }],
};

describe('LegalConfigInitialPage', () => {
  beforeEach(() => vi.resetAllMocks());
  afterEach(() => vi.clearAllMocks());

  it('nests one-level variants and posts a document with its typology', async () => {
    service.workspace.mockResolvedValue({ data: workspace }); service.create.mockResolvedValue({ data: { id: 'new' } });
    render(<LegalConfigInitialPage />);
    expect(await screen.findByText(/Plano variante/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Certificado' } });
    fireEvent.change(screen.getByLabelText('Código'), { target: { value: 'CER' } });
    fireEvent.change(screen.getByLabelText('Tipología'), { target: { value: 'Plano' } });
    fireEvent.keyDown(screen.getByLabelText('Tipología'), { key: 'ArrowDown' });
    fireEvent.keyDown(screen.getByLabelText('Tipología'), { key: 'Enter' });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar documento' }));
    await waitFor(() => expect(service.create).toHaveBeenCalledWith('documents', expect.objectContaining({ typology_id: 't' })));
  });

  it('shows the server error when saving a document fails', async () => {
    service.workspace.mockResolvedValue({ data: workspace });
    service.create.mockRejectedValue({ response: { data: { message: 'La tipología no está activa.' } } });
    render(<LegalConfigInitialPage />);
    await screen.findByText(/Plano variante/);
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Certificado' } });
    fireEvent.change(screen.getByLabelText('Código'), { target: { value: 'CER' } });
    fireEvent.change(screen.getByLabelText('Tipología'), { target: { value: 'Plano' } });
    fireEvent.keyDown(screen.getByLabelText('Tipología'), { key: 'Enter' });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar documento' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('La tipología no está activa.');
  });

  it('keeps the selected typology visible while allowing a document without one', async () => {
    service.workspace.mockResolvedValue({ data: workspace });
    service.create.mockResolvedValue({ data: { id: 'standalone' } });
    render(<LegalConfigInitialPage />);

    await screen.findByText(/Plano variante/);
    const submit = screen.getByRole('button', { name: 'Guardar documento' });
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Certificado' } });
    fireEvent.change(screen.getByLabelText('Código'), { target: { value: 'CER' } });
    expect(submit).toBeEnabled();

    fireEvent.click(submit);
    await waitFor(() => expect(service.create).toHaveBeenCalledWith('documents', expect.objectContaining({
      name: 'Certificado', code: 'CER', typology_id: null, label_ids: [],
    })));

    const typology = screen.getByRole('combobox', { name: 'Tipología' });
    fireEvent.change(typology, { target: { value: 'Plano' } });
    fireEvent.keyDown(typology, { key: 'Enter' });

    expect(typology).toHaveValue('Plano');
  });

  it('opens a normalized catalogue modal and manages typologies and labels independently', async () => {
    service.workspace.mockResolvedValue({ data: workspace });
    service.create.mockResolvedValue({ data: { id: 'new-catalogue', name: 'Nueva tipología', code: 'NUEVA_TIPOLOGIA', is_active: true } });
    render(<LegalConfigInitialPage />);

    await screen.findByText(/Plano variante/);
    fireEvent.click(screen.getByRole('button', { name: 'Gestionar catálogos' }));

    const dialog = screen.getByRole('dialog', { name: 'Tipologías y etiquetas' });
    expect(within(dialog).getByText('Plano')).toBeInTheDocument();
    expect(within(dialog).queryByText('Define')).not.toBeInTheDocument();

    fireEvent.change(within(dialog).getByLabelText('Nuevo nombre'), { target: { value: 'Nueva tipología' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Crear tipología' }));
    await waitFor(() => expect(service.create).toHaveBeenCalledWith('typologies', { name: 'Nueva tipología', code: 'Nueva tipología' }));

    fireEvent.click(within(dialog).getByRole('tab', { name: /Etiquetas/ }));
    expect(within(dialog).getByText('Firmado')).toBeInTheDocument();
    fireEvent.change(within(dialog).getByLabelText('Nuevo nombre'), { target: { value: 'Nueva etiqueta' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Crear etiqueta' }));
    await waitFor(() => expect(service.create).toHaveBeenCalledWith('labels', { name: 'Nueva etiqueta', code: 'Nueva etiqueta' }));
  });

  it('sends the entered suffix as variant_code and inherits the parent typology', async () => {
    service.workspace.mockResolvedValue({ data: workspace });
    service.create.mockResolvedValue({ data: { id: 'new-variant' } });
    render(<LegalConfigInitialPage />);

    await screen.findByText(/Plano variante/);
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Plano de sótano' } });
    fireEvent.change(screen.getByLabelText('Código'), { target: { value: 'SOT' } });
    fireEvent.change(screen.getByLabelText('Variante de'), { target: { value: 'd' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar documento' }));

    await waitFor(() => expect(service.create).toHaveBeenCalledWith('documents', expect.objectContaining({
      code: 'SOT', variant_code: 'SOT', parent_document_id: 'd', typology_id: 't',
    })));
  });

  it('shows an accessible error when managed typology creation fails', async () => {
    service.workspace.mockResolvedValue({ data: workspace });
    service.create.mockRejectedValue({ response: { data: { message: 'La tipología ya existe.' } } });
    render(<LegalConfigInitialPage />);

    await screen.findByText(/Plano variante/);
    fireEvent.click(screen.getByRole('button', { name: 'Gestionar catálogos' }));
    const dialog = screen.getByRole('dialog', { name: 'Tipologías y etiquetas' });
    const nameInput = within(dialog).getByLabelText('Nuevo nombre');
    fireEvent.change(nameInput, { target: { value: 'Nueva tipología' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Crear tipología' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('La tipología ya existe.');
    expect(nameInput).toHaveValue('Nueva tipología');
  });

  it('shows an accessible error when inline actuation creation fails', async () => {
    service.workspace.mockResolvedValue({ data: workspace });
    service.create.mockRejectedValue({ response: { data: { message: 'La actuación ya existe.' } } });
    render(<LegalConfigInitialPage />);

    await screen.findByText(/Plano variante/);
    fireEvent.click(screen.getByRole('button', { name: 'Nueva actuación' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Nombre de la actuación' }), { target: { value: 'Nueva actuación' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear actuación' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('La actuación ya existe.');
  });

  it('shows an accessible error when managed label creation fails', async () => {
    service.workspace.mockResolvedValue({ data: workspace });
    service.create.mockRejectedValue({ response: { data: { message: 'La etiqueta ya existe.' } } });
    render(<LegalConfigInitialPage />);

    await screen.findByText(/Plano variante/);
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
    expect(screen.getByRole('button', { name: 'Guardar documento' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Nueva actuación' })).toBeDisabled();
    resolveWorkspace({ data: workspace });
    await screen.findByText(/Plano variante/);

    service.workspace.mockImplementation(() => new Promise(() => {}));
    fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }));
    expect(screen.getByRole('status')).toHaveTextContent('Cargando configuración');
  });

  it('shows alert feedback when saving associations fails', async () => {
    service.workspace.mockResolvedValue({ data: workspace });
    service.saveAssociations.mockRejectedValue({ response: { data: { message: 'No se pudieron guardar las asociaciones.' } } });
    render(<LegalConfigInitialPage />);
    await screen.findByText(/Plano variante/);
    fireEvent.click(screen.getByRole('button', { name: 'Licencia' }));
    const associationSelect = screen.getByRole('combobox', { name: 'Documentos directos' });
    fireEvent.change(associationSelect, { target: { value: 'Plano principal' } });
    fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: 'Plano principal' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron guardar las asociaciones.');
  });

  it('clears a previous association success notice when a later save fails', async () => {
    service.workspace.mockResolvedValue({ data: workspace });
    service.saveAssociations
      .mockResolvedValueOnce({ data: { revision: 1 } })
      .mockRejectedValueOnce({ response: { data: { message: 'No se pudieron guardar las asociaciones.' } } });
    render(<LegalConfigInitialPage />);
    await screen.findByText(/Plano variante/);
    fireEvent.click(screen.getByRole('button', { name: 'Licencia' }));

    const associationSelect = screen.getByRole('combobox', { name: 'Documentos directos' });
    fireEvent.change(associationSelect, { target: { value: 'Plano principal' } });
    fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: 'Plano principal' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Asociaciones guardadas.');

    fireEvent.click(screen.getByRole('button', { name: 'Quitar Plano principal' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron guardar las asociaciones.');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('announces that a conflicting association change was refreshed but not saved', async () => {
    service.workspace.mockResolvedValue({ data: workspace });
    service.saveAssociations.mockRejectedValue({ response: { status: 409, data: { message: 'La configuración fue modificada por otro administrador.' } } });
    render(<LegalConfigInitialPage />);
    await screen.findByText(/Plano variante/);
    fireEvent.click(screen.getByRole('button', { name: 'Licencia' }));

    const associationSelect = screen.getByRole('combobox', { name: 'Documentos directos' });
    fireEvent.change(associationSelect, { target: { value: 'Plano principal' } });
    fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: 'Plano principal' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('La configuración se actualizó y el cambio de asociación no se guardó.');
  });

  it('selects the first matching option with ArrowDown and saves associations successfully', async () => {
    service.workspace.mockResolvedValue({ data: workspace });
    service.saveAssociations.mockResolvedValue({ data: { revision: 1 } });
    render(<LegalConfigInitialPage />);
    await screen.findByText(/Plano variante/);
    fireEvent.click(screen.getByRole('button', { name: 'Licencia' }));

    const associationSelect = screen.getByRole('combobox', { name: 'Documentos directos' });
    fireEvent.keyDown(associationSelect, { key: 'ArrowDown' });
    fireEvent.keyDown(associationSelect, { key: 'Enter' });

    await waitFor(() => expect(service.saveAssociations).toHaveBeenCalledWith('a', expect.objectContaining({ document_ids: ['d'] })));
    expect(await screen.findByRole('status')).toHaveTextContent('Asociaciones guardadas.');
  });

  it('exposes the configuration controls through labelled comboboxes inside the workspace', async () => {
    service.workspace.mockResolvedValue({ data: workspace });
    render(<LegalConfigInitialPage />);

    const workspaceRoot = await screen.findByRole('main', { name: 'Documentos y actuaciones' });
    expect(within(workspaceRoot).getByRole('combobox', { name: 'Tipología' })).toBeInTheDocument();
    fireEvent.click(within(workspaceRoot).getByRole('button', { name: 'Licencia' }));
    expect(within(workspaceRoot).getByRole('combobox', { name: 'Documentos directos' })).toBeInTheDocument();
  });

  it('maps an actuation through the full-width legacy generation field', async () => {
    service.workspace.mockResolvedValue({ data: workspace });
    service.update.mockResolvedValue({ data: { ...workspace.actuations[0], legacy_actuation_type_id: 'legacy-a' } });
    render(<LegalConfigInitialPage />);
    await screen.findByText(/Plano variante/);
    fireEvent.click(screen.getByRole('button', { name: 'Licencia' }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Actuación heredada para generación' }), { target: { value: 'legacy-a' } });
    await waitFor(() => expect(service.update).toHaveBeenCalledWith('actuations', 'a', { legacy_actuation_type_id: 'legacy-a', revision: 0 }));
    expect(await screen.findByRole('status')).toHaveTextContent('Vínculo con actuación heredada guardado.');
  });

  it('shows an accessible mapping error without changing the selection', async () => {
    service.workspace.mockResolvedValue({ data: workspace });
    service.update.mockRejectedValue({ response: { data: { message: 'La actuación heredada no existe o está inactiva.' } } });
    render(<LegalConfigInitialPage />);
    await screen.findByText(/Plano variante/);
    fireEvent.click(screen.getByRole('button', { name: 'Licencia' }));
    const mapping = screen.getByRole('combobox', { name: 'Actuación heredada para generación' });
    fireEvent.change(mapping, { target: { value: 'legacy-a' } });
    expect(await screen.findByRole('alert')).toHaveTextContent('La actuación heredada no existe o está inactiva.');
    expect(mapping).toHaveValue('');
    expect(mapping).toHaveAccessibleDescription(/La actuación heredada no existe o está inactiva\./);
  });

  it('reloads and explains a stale legacy mapping revision', async () => {
    service.workspace.mockResolvedValue({ data: workspace });
    service.update.mockRejectedValue({ response: { status: 409, data: { message: 'La configuración fue modificada por otro administrador.' } } });
    render(<LegalConfigInitialPage />);
    await screen.findByText(/Plano variante/);
    fireEvent.click(screen.getByRole('button', { name: 'Licencia' }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Actuación heredada para generación' }), { target: { value: 'legacy-a' } });
    expect(await screen.findByRole('alert')).toHaveTextContent('La configuración se actualizó y el vínculo heredado no se guardó.');
    await waitFor(() => expect(service.workspace).toHaveBeenCalledTimes(2));
  });

  it('keeps the in-flight association snapshot bound to its actuation', async () => {
    let resolveSave;
    service.workspace.mockResolvedValue({ data: { ...workspace, actuations: [...workspace.actuations, { id: 'b', name: 'Reconocimiento', code: 'REC', is_active: true, revision: 0 }] } });
    service.saveAssociations.mockImplementation(() => new Promise((resolve) => { resolveSave = resolve; }));
    render(<LegalConfigInitialPage />);
    await screen.findByText(/Plano variante/);
    fireEvent.click(screen.getByRole('button', { name: 'Licencia' }));
    const associationSelect = screen.getByRole('combobox', { name: 'Documentos directos' });
    fireEvent.keyDown(associationSelect, { key: 'ArrowDown' });
    fireEvent.keyDown(associationSelect, { key: 'Enter' });
    await waitFor(() => expect(service.saveAssociations).toHaveBeenCalledWith('a', expect.objectContaining({ document_ids: ['d'], revision: 0 })));
    expect(screen.getByRole('button', { name: 'Reconocimiento' })).toBeDisabled();
    resolveSave({ data: { revision: 1 } });
    await screen.findByText('Asociaciones guardadas.');
  });

  it('gives duplicate catalogue labels distinct combobox and listbox IDs', async () => {
    service.workspace.mockResolvedValue({ data: workspace });
    render(<LegalConfigInitialPage />);
    await screen.findByText(/Plano variante/);
    fireEvent.click(screen.getByRole('button', { name: 'Licencia' }));
    const labels = screen.getAllByRole('combobox', { name: 'Etiquetas' });
    expect(labels).toHaveLength(2);
    expect(labels[0].getAttribute('aria-controls')).not.toBe(labels[1].getAttribute('aria-controls'));
    fireEvent.keyDown(labels[1], { key: 'ArrowDown' });
    const listbox = screen.getByRole('listbox');
    expect(listbox.id).toBe(labels[1].getAttribute('aria-controls'));
    expect(within(listbox).getByRole('option', { name: 'Firmado' }).id).toMatch(new RegExp(`^${listbox.id}-`));
  });

  it('selects the first active actuation after loading so associations are immediately usable', async () => {
    service.workspace.mockResolvedValue({ data: workspace });
    render(<LegalConfigInitialPage />);

    expect(await screen.findByRole('combobox', { name: 'Documentos directos' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Licencia' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('creates an actuation from an inline form instead of a browser prompt', async () => {
    service.workspace.mockResolvedValue({ data: workspace });
    service.create.mockResolvedValue({ data: { id: 'new-actuation', name: 'Reconocimiento' } });
    render(<LegalConfigInitialPage />);

    await screen.findByText(/Plano variante/);
    fireEvent.click(screen.getByRole('button', { name: 'Nueva actuación' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Nombre de la actuación' }), { target: { value: 'Reconocimiento' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear actuación' }));

    await waitFor(() => expect(service.create).toHaveBeenCalledWith('actuations', { name: 'Reconocimiento', code: 'Reconocimiento' }));
  });

  it('shows guided empty states when the catalogue has no actuations or documents', async () => {
    service.workspace.mockResolvedValue({ data: { ...workspace, actuations: [], documents: [] } });
    render(<LegalConfigInitialPage />);

    expect(await screen.findByText('Aún no hay actuaciones')).toBeInTheDocument();
    expect(screen.getByText('Aún no hay documentos')).toBeInTheDocument();
    expect(screen.getByText(/Crea una actuación para empezar a relacionar/i)).toBeInTheDocument();
  });

  it('keeps the workspace headings compact without repeated panel descriptions', async () => {
    service.workspace.mockResolvedValue({ data: workspace });
    render(<LegalConfigInitialPage />);

    expect(await screen.findByRole('heading', { name: 'Documentos y actuaciones' })).toBeInTheDocument();
    expect(screen.queryByText('Organiza el catálogo documental y define qué aplica a cada actuación urbanística.')).not.toBeInTheDocument();
    expect(screen.queryByText('Selecciona el contexto a configurar.')).not.toBeInTheDocument();
    expect(screen.queryByText('Registra documentos principales y variantes.')).not.toBeInTheDocument();
    expect(screen.queryByText('Define cómo se resuelve la matriz.')).not.toBeInTheDocument();
  });

  it('hides technical acronyms from the main actuation and catalogue views', async () => {
    service.workspace.mockResolvedValue({ data: workspace });
    render(<LegalConfigInitialPage />);

    await screen.findByText(/Plano variante/);
    expect(screen.queryByText('LIC')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Gestionar catálogos' }));
    const dialog = screen.getByRole('dialog', { name: 'Tipologías y etiquetas' });
    expect(within(dialog).queryByText('PLA')).not.toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('tab', { name: /Etiquetas/ }));
    expect(within(dialog).queryByText('FIR')).not.toBeInTheDocument();
  });

  it('shows the document variant hierarchy and a clear resulting-code preview', async () => {
    service.workspace.mockResolvedValue({ data: workspace });
    render(<LegalConfigInitialPage />);

    await screen.findByText(/Plano variante/);
    expect(screen.getByText('1 variante')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Plano de sótano' } });
    fireEvent.change(screen.getByLabelText('Variante de'), { target: { value: 'd' } });
    fireEvent.change(screen.getByLabelText('Código'), { target: { value: 'SOT' } });

    const preview = screen.getByLabelText('Vista previa de variante');
    expect(within(preview).getByText('PLA-1-SOT')).toBeInTheDocument();
    expect(within(preview).getByText('Plano principal')).toBeInTheDocument();
  });

  it('edits series and subseries codes in an independent modal', async () => {
    const seriesWorkspace = {
      ...workspace,
      actuations: [
        { ...workspace.actuations[0], name: 'Licencias urbanísticas', code: '100' },
        { id: 'child', name: 'Licencia de construcción', code: '100-01', parent_id: 'a', is_active: true, revision: 0 },
      ],
    };
    service.workspace.mockResolvedValue({ data: seriesWorkspace });
    service.update.mockResolvedValue({ data: {} });
    render(<LegalConfigInitialPage />);

    await screen.findByText(/Plano variante/);
    fireEvent.click(screen.getByRole('button', { name: 'Series y subseries' }));
    const dialog = screen.getByRole('dialog', { name: 'Series y subseries' });
    expect(within(dialog).getByText('Licencias urbanísticas')).toBeInTheDocument();
    expect(within(dialog).getByText('Licencia de construcción')).toBeInTheDocument();

    fireEvent.change(within(dialog).getByLabelText('Código de serie para Licencias urbanísticas'), { target: { value: '200' } });
    fireEvent.change(within(dialog).getByLabelText('Código de subserie para Licencia de construcción'), { target: { value: '200-01' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Guardar series' }));

    await waitFor(() => {
      expect(service.update).toHaveBeenCalledWith('actuations', 'a', expect.objectContaining({ code: '200' }));
      expect(service.update).toHaveBeenCalledWith('actuations', 'child', expect.objectContaining({ code: '200-01' }));
    });
  });

  it('creates a compact condition under the selected actuation and links its document', async () => {
    service.workspace.mockResolvedValue({ data: workspace });
    service.create.mockResolvedValue({ data: { id: 'condition-1', name: 'El predio es BIC' } });
    render(<LegalConfigInitialPage />);

    await screen.findByRole('button', { name: 'Licencia' });
    fireEvent.click(screen.getByRole('button', { name: 'Nueva condición' }));

    const dialog = screen.getByRole('dialog', { name: 'Nueva condición' });
    fireEvent.change(within(dialog).getByLabelText('Nombre de la condición'), { target: { value: 'El predio es BIC' } });
    fireEvent.change(within(dialog).getByLabelText('Dato del FUN'), { target: { value: 'culturalAny' } });
    fireEvent.change(within(dialog).getByLabelText('Valor'), { target: { value: 'A' } });
    fireEvent.change(within(dialog).getByLabelText('Resultado'), { target: { value: 'include' } });
    fireEvent.keyDown(within(dialog).getByRole('combobox', { name: 'Documentos' }), { key: 'ArrowDown' });
    fireEvent.keyDown(within(dialog).getByRole('combobox', { name: 'Documentos' }), { key: 'Enter' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Crear condición' }));

    await waitFor(() => expect(service.create).toHaveBeenCalledWith('conditions', {
      name: 'El predio es BIC',
      code: 'El predio es BIC',
      source_key: 'culturalAny',
      operator: 'includes_any',
      expected_values: ['A'],
      effect: 'include',
      document_ids: ['d'],
      actuation_ids: ['a'],
    }));
  });

  it('filters the actuation list while preserving matching hierarchy context', async () => {
    service.workspace.mockResolvedValue({
      data: {
        ...workspace,
        actuations: [
          ...workspace.actuations,
          { id: 'construction', name: 'Construcción', code: 'D', is_active: true, revision: 0 },
          { id: 'new-work', parent_id: 'construction', name: 'Obra nueva', code: 'D_A', is_active: true, revision: 0 },
        ],
      },
    });
    render(<LegalConfigInitialPage />);

    await screen.findByRole('button', { name: 'Construcción' });
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar actuación' }), { target: { value: 'obra nueva' } });

    expect(screen.getByRole('button', { name: 'Construcción' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Obra nueva' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Licencia' })).not.toBeInTheDocument();
  });

});
