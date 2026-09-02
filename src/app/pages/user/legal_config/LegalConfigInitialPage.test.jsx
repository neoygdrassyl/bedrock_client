import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

// The page grew past workspace/create/update/saveAssociations: the contextual
// evaluation panel calls evaluationConfig, previewDocuments and the document
// review endpoints on mount. Leaving them off the mock made every render fail
// with "evaluationConfig is not a function", which then masked the assertion
// each test was actually making.
const service = vi.hoisted(() => ({
  workspace: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  saveAssociations: vi.fn(),
  evaluationConfig: vi.fn(),
  updateEvaluationConfig: vi.fn(),
  previewDocuments: vi.fn(),
  documentReviews: vi.fn(),
  updateDocumentReviews: vi.fn(),
  documentScope: vi.fn(),
  updateDocumentScope: vi.fn(),
  effectiveDocuments: vi.fn(),
}));

// Auxiliary calls each test does not care about. resetAllMocks() clears the
// implementations, so they are re-armed per test.
const armAuxiliaryServiceCalls = () => {
  service.evaluationConfig.mockResolvedValue({ data: {} });
  service.updateEvaluationConfig.mockResolvedValue({ data: {} });
  service.previewDocuments.mockResolvedValue({ data: { documents: [] } });
  service.documentReviews.mockResolvedValue({ data: [] });
  service.updateDocumentReviews.mockResolvedValue({ data: [] });
  service.documentScope.mockResolvedValue({ data: {} });
  service.updateDocumentScope.mockResolvedValue({ data: {} });
  service.effectiveDocuments.mockResolvedValue({ data: [] });
};
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

// The variant name renders in two panels: the catalogue table and the
// evaluation workspace added later, so a bare text query matches both.
// Scoping to the catalogue keeps this a single-element assertion; findAllByText
// would still pass if the catalogue stopped rendering the row.
// Actuation buttons carry an explicit aria-label that also announces the code
// and the association count ("Licencia, código LIC, 0 asociaciones"), so the
// accessible name is no longer the bare text.
// The document editor moved from an inline panel into a dialog opened from the
// catalogue toolbar, so its fields only exist after this click.
// Every editor on this page is a dialog, and names like "Tipología" also exist
// in the catalogue table, so field queries have to be scoped to the open dialog.
const dialogFields = () => within(screen.getByRole('dialog'));

// Associations moved from multi-select comboboxes to a tabbed catalogue: pick
// the tab, then add or remove each item with its own button.
const openCatalogueTab = (label) =>
  fireEvent.click(screen.getByRole('tab', { name: new RegExp(`^${label}\\b`) }));

const newConditionButton = () => {
  openCatalogueTab('Condiciones');
  return screen.getByRole('button', { name: 'Nueva condición' });
};

const addAssociation = (name) => {
  fireEvent.click(screen.getByRole('tab', { name: /^Documentos directos\b/ }));
  fireEvent.click(screen.getByRole('button', { name: `Agregar ${name}` }));
};

const openDocumentForm = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Nuevo documento' }));

const actuationButton = (name) =>
  screen.getByRole('button', { name: new RegExp(`^${name},`) });

const findVariantInCatalog = () =>
  screen.findByText(/Plano variante/, { selector: '.document-table__name strong' });

describe('LegalConfigInitialPage', () => {
  beforeEach(() => { vi.resetAllMocks(); armAuxiliaryServiceCalls(); });
  afterEach(() => vi.clearAllMocks());

  it('nests one-level variants and posts a document with its typology', async () => {
    service.workspace.mockResolvedValue({ data: workspace }); service.create.mockResolvedValue({ data: { id: 'new' } });
    render(<LegalConfigInitialPage />);
    expect(await findVariantInCatalog()).toBeInTheDocument();
    openDocumentForm();
    fireEvent.change(dialogFields().getByLabelText('Nombre *'), { target: { value: 'Certificado' } });
    fireEvent.change(dialogFields().getByLabelText('Código *'), { target: { value: 'CER' } });
    fireEvent.change(dialogFields().getByLabelText('Tipología'), { target: { value: 'Plano' } });
    fireEvent.keyDown(dialogFields().getByLabelText('Tipología'), { key: 'ArrowDown' });
    fireEvent.keyDown(dialogFields().getByLabelText('Tipología'), { key: 'Enter' });
    fireEvent.click(dialogFields().getByRole('button', { name: 'Crear documento' }));
    await waitFor(() => expect(service.create).toHaveBeenCalledWith('documents', expect.objectContaining({ typology_id: 't' })));
  });

  it('shows the server error when saving a document fails', async () => {
    service.workspace.mockResolvedValue({ data: workspace });
    service.create.mockRejectedValue({ response: { data: { message: 'La tipología no está activa.' } } });
    render(<LegalConfigInitialPage />);
    await findVariantInCatalog();
    openDocumentForm();
    fireEvent.change(dialogFields().getByLabelText('Nombre *'), { target: { value: 'Certificado' } });
    fireEvent.change(dialogFields().getByLabelText('Código *'), { target: { value: 'CER' } });
    fireEvent.change(dialogFields().getByLabelText('Tipología'), { target: { value: 'Plano' } });
    fireEvent.keyDown(dialogFields().getByLabelText('Tipología'), { key: 'Enter' });
    fireEvent.click(dialogFields().getByRole('button', { name: 'Crear documento' }));
    expect(await dialogFields().findByRole('alert')).toHaveTextContent('La tipología no está activa.');
  });

  it('keeps the selected typology visible while allowing a document without one', async () => {
    service.workspace.mockResolvedValue({ data: workspace });
    service.create.mockResolvedValue({ data: { id: 'standalone' } });
    render(<LegalConfigInitialPage />);

    await findVariantInCatalog();
    openDocumentForm();
    const submit = dialogFields().getByRole('button', { name: 'Crear documento' });
    fireEvent.change(dialogFields().getByLabelText('Nombre *'), { target: { value: 'Certificado' } });
    fireEvent.change(dialogFields().getByLabelText('Código *'), { target: { value: 'CER' } });
    expect(submit).toBeEnabled();

    fireEvent.click(submit);
    await waitFor(() => expect(service.create).toHaveBeenCalledWith('documents', expect.objectContaining({
      name: 'Certificado', code: 'CER', typology_id: null, label_ids: [],
    })));

    const typology = screen.getByRole('combobox', { name: 'Tipología' });
    fireEvent.change(typology, { target: { value: 't' } });

    expect(typology).toHaveValue('t');
  });

  it('opens a normalized catalogue modal and manages typologies and labels independently', async () => {
    service.workspace.mockResolvedValue({ data: workspace });
    service.create.mockResolvedValue({ data: { id: 'new-catalogue', name: 'Nueva tipología', code: 'NUEVA_TIPOLOGIA', is_active: true } });
    render(<LegalConfigInitialPage />);

    await findVariantInCatalog();
    fireEvent.click(screen.getByRole('button', { name: 'Gestionar catálogos' }));

    const dialog = screen.getByRole('dialog', { name: 'Tipologías y etiquetas' });
    expect(within(dialog).getByText('Plano')).toBeInTheDocument();
    expect(within(dialog).queryByText('Define')).not.toBeInTheDocument();

    fireEvent.change(within(dialog).getByLabelText('Nuevo nombre'), { target: { value: 'Nueva tipología' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Crear tipología' }));
    await waitFor(() => expect(service.create).toHaveBeenCalledWith('typologies', { name: 'Nueva tipología', code: 'Nueva tipología' }));

    fireEvent.click(within(dialog).getByRole('tab', { name: /Etiquetas/ }));
    expect(within(dialog).getAllByText('Firmado').length).toBeGreaterThan(0);
    fireEvent.change(within(dialog).getByLabelText('Nuevo nombre'), { target: { value: 'Nueva etiqueta' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Crear etiqueta' }));
    await waitFor(() => expect(service.create).toHaveBeenCalledWith('labels', { name: 'Nueva etiqueta', code: 'Nueva etiqueta' }));
  });

  it('sends the entered suffix as variant_code and inherits the parent typology', async () => {
    service.workspace.mockResolvedValue({ data: workspace });
    service.create.mockResolvedValue({ data: { id: 'new-variant' } });
    render(<LegalConfigInitialPage />);

    await findVariantInCatalog();
    openDocumentForm();
    fireEvent.change(dialogFields().getByLabelText('Nombre *'), { target: { value: 'Plano de sótano' } });
    fireEvent.change(dialogFields().getByLabelText('Código *'), { target: { value: 'SOT' } });
    fireEvent.change(dialogFields().getByLabelText(/^Variante de/), { target: { value: 'd' } });
    fireEvent.click(dialogFields().getByRole('button', { name: 'Crear documento' }));

    await waitFor(() => expect(service.create).toHaveBeenCalledWith('documents', expect.objectContaining({
      code: 'SOT', variant_code: 'SOT', parent_document_id: 'd', typology_id: 't',
    })));
  });

  it('shows an accessible error when managed typology creation fails', async () => {
    service.workspace.mockResolvedValue({ data: workspace });
    service.create.mockRejectedValue({ response: { data: { message: 'La tipología ya existe.' } } });
    render(<LegalConfigInitialPage />);

    await findVariantInCatalog();
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

    await findVariantInCatalog();
    fireEvent.click(screen.getByRole('button', { name: 'Nueva actuación o modalidad' }));
    fireEvent.change(dialogFields().getByLabelText('Nombre *'), { target: { value: 'Nueva actuación' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear categoría' }));

    expect(await dialogFields().findByRole('alert')).toHaveTextContent('La actuación ya existe.');
  });

  it('shows an accessible error when managed label creation fails', async () => {
    service.workspace.mockResolvedValue({ data: workspace });
    service.create.mockRejectedValue({ response: { data: { message: 'La etiqueta ya existe.' } } });
    render(<LegalConfigInitialPage />);

    await findVariantInCatalog();
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
    await findVariantInCatalog();

    service.workspace.mockImplementation(() => new Promise(() => {}));
    fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }));
    expect(screen.getByRole('status')).toHaveTextContent('Cargando configuración');
  });

  it('shows alert feedback when saving associations fails', async () => {
    service.workspace.mockResolvedValue({ data: workspace });
    service.saveAssociations.mockRejectedValue({ response: { data: { message: 'No se pudieron guardar las asociaciones.' } } });
    render(<LegalConfigInitialPage />);
    await findVariantInCatalog();
    fireEvent.click(actuationButton('Licencia'));
    addAssociation('Plano principal');
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron guardar las asociaciones.');
  });

  it('clears a previous association success notice when a later save fails', async () => {
    // Two documents, because the notice is cleared by a second save: the
    // current-associations table is derived from the workspace payload, which
    // this mock never re-serves, so the first item keeps offering "Agregar"
    // and there is no "Quitar" to click.
    service.workspace.mockResolvedValue({
      data: {
        ...workspace,
        documents: [...workspace.documents, { id: 'd2', name: 'Memoria estructural', code: 'MEM-1', typology_id: 't', is_active: true }],
      },
    });
    service.saveAssociations
      .mockResolvedValueOnce({ data: { revision: 1 } })
      .mockRejectedValueOnce({ response: { data: { message: 'No se pudieron guardar las asociaciones.' } } });
    render(<LegalConfigInitialPage />);
    await findVariantInCatalog();
    fireEvent.click(actuationButton('Licencia'));

    addAssociation('Plano principal');
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Asociaciones guardadas.'));

    addAssociation('Memoria estructural');
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron guardar las asociaciones.');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('announces that a conflicting association change was refreshed but not saved', async () => {
    service.workspace.mockResolvedValue({ data: workspace });
    service.saveAssociations.mockRejectedValue({ response: { status: 409, data: { message: 'La configuración fue modificada por otro administrador.' } } });
    render(<LegalConfigInitialPage />);
    await findVariantInCatalog();
    fireEvent.click(actuationButton('Licencia'));

    addAssociation('Plano principal');

    expect(await screen.findByRole('alert')).toHaveTextContent('La configuración se actualizó y el cambio de asociación no se guardó.');
  });

  it('saves associations when a catalogue item is added', async () => {
    service.workspace.mockResolvedValue({ data: workspace });
    service.saveAssociations.mockResolvedValue({ data: { revision: 1 } });
    render(<LegalConfigInitialPage />);
    await findVariantInCatalog();
    fireEvent.click(actuationButton('Licencia'));

    addAssociation('Plano principal');

    await waitFor(() => expect(service.saveAssociations).toHaveBeenCalledWith('a', expect.objectContaining({ document_ids: ['d'] })));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Asociaciones guardadas.'));
  });

  it('exposes the configuration controls inside the workspace', async () => {
    service.workspace.mockResolvedValue({ data: workspace });
    render(<LegalConfigInitialPage />);

    const workspaceRoot = await screen.findByRole('main', { name: 'Documentos y actuaciones' });
    expect(within(workspaceRoot).getByRole('combobox', { name: 'Tipología' })).toBeInTheDocument();
    fireEvent.click(actuationButton('Licencia'));
    expect(within(workspaceRoot).getByRole('tab', { name: /^Documentos directos\b/ })).toBeInTheDocument();
  });

  it('keeps the in-flight association snapshot bound to its actuation', async () => {
    let resolveSave;
    service.workspace.mockResolvedValue({ data: { ...workspace, actuations: [...workspace.actuations, { id: 'b', name: 'Reconocimiento', code: 'REC', is_active: true, revision: 0 }] } });
    service.saveAssociations.mockImplementation(() => new Promise((resolve) => { resolveSave = resolve; }));
    render(<LegalConfigInitialPage />);
    await findVariantInCatalog();
    fireEvent.click(actuationButton('Licencia'));
    addAssociation('Plano principal');
    await waitFor(() => expect(service.saveAssociations).toHaveBeenCalledWith('a', expect.objectContaining({ document_ids: ['d'], revision: 0 })));
    expect(actuationButton('Reconocimiento')).toBeDisabled();
    resolveSave({ data: { revision: 1 } });
    await screen.findByText('Asociaciones guardadas.');
  });

  it('selects the first active actuation after loading so associations are immediately usable', async () => {
    service.workspace.mockResolvedValue({ data: workspace });
    render(<LegalConfigInitialPage />);

    expect(await screen.findByRole('tab', { name: /^Documentos directos\b/ })).toBeInTheDocument();
    expect(actuationButton('Licencia')).toHaveAttribute('aria-pressed', 'true');
  });

  it('creates an actuation from an inline form instead of a browser prompt', async () => {
    service.workspace.mockResolvedValue({ data: workspace });
    service.create.mockResolvedValue({ data: { id: 'new-actuation', name: 'Reconocimiento' } });
    render(<LegalConfigInitialPage />);

    await findVariantInCatalog();
    fireEvent.click(screen.getByRole('button', { name: 'Nueva actuación o modalidad' }));
    fireEvent.change(dialogFields().getByLabelText('Nombre *'), { target: { value: 'Reconocimiento' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear categoría' }));

    await waitFor(() => expect(service.create).toHaveBeenCalledWith('actuations', {
      name: 'Reconocimiento', code: 'Reconocimiento', node_kind: 'category', parent_id: null,
    }));
  });

  it('shows guided empty states when the catalogue has no actuations or documents', async () => {
    service.workspace.mockResolvedValue({ data: { ...workspace, actuations: [], documents: [] } });
    render(<LegalConfigInitialPage />);

    expect(await screen.findByText('Aún no hay actuaciones')).toBeInTheDocument();
    expect(screen.getByText(/Aún no hay documentos/)).toBeInTheDocument();
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

  it('shows the actuation code badge in the main list but hides technical acronyms from catalogue views', async () => {
    service.workspace.mockResolvedValue({ data: workspace });
    render(<LegalConfigInitialPage />);

    await findVariantInCatalog();
    const actuationItem = actuationButton('Licencia');
    expect(within(actuationItem).getByText('LIC')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Gestionar catálogos' }));
    const dialog = screen.getByRole('dialog', { name: 'Tipologías y etiquetas' });
    expect(within(dialog).queryByText('PLA')).not.toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('tab', { name: /Etiquetas/ }));
    expect(within(dialog).queryByText('FIR')).not.toBeInTheDocument();
  });

  it('shows the document variant hierarchy and a clear resulting-code preview', async () => {
    service.workspace.mockResolvedValue({ data: workspace });
    render(<LegalConfigInitialPage />);

    await findVariantInCatalog();
    expect(screen.getByText(/1 variante/)).toBeInTheDocument();
    openDocumentForm();
    fireEvent.change(dialogFields().getByLabelText('Nombre *'), { target: { value: 'Plano de sótano' } });
    fireEvent.change(dialogFields().getByLabelText(/^Variante de/), { target: { value: 'd' } });
    fireEvent.change(dialogFields().getByLabelText('Sufijo del código *'), { target: { value: 'SOT' } });

    const preview = screen.getByLabelText('Vista previa de la variante');
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

    await findVariantInCatalog();
    fireEvent.click(screen.getByRole('button', { name: 'Gestionar series' }));
    const dialog = screen.getByRole('dialog', { name: 'Series y subseries' });
    expect(within(dialog).getAllByText('Licencias urbanísticas').length).toBeGreaterThan(0);
    expect(within(dialog).getByText('Licencia de construcción')).toBeInTheDocument();

    fireEvent.change(within(dialog).getByLabelText('Código de la serie', { selector: 'input' }), { target: { value: '200' } });
    fireEvent.change(within(dialog).getByLabelText('Sufijo de código para Licencia de construcción'), { target: { value: '-01' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => {
      expect(service.update).toHaveBeenCalledWith('actuations', 'a', expect.objectContaining({ code: '200' }));
      expect(service.update).toHaveBeenCalledWith('actuations', 'child', expect.objectContaining({ code: '200-01' }));
    });
  });

  it('creates a subserie inline from the series modal with its composed code', async () => {
    const seriesWorkspace = {
      ...workspace,
      actuations: [{ ...workspace.actuations[0], name: 'Licencias urbanísticas', code: '100' }],
    };
    service.workspace.mockResolvedValue({ data: seriesWorkspace });
    service.create.mockResolvedValue({ data: { id: 'new-child' } });
    render(<LegalConfigInitialPage />);

    await findVariantInCatalog();
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
        { id: 'child', name: 'Licencia de construcción', code: '100-01', parent_id: 'a', is_active: true, revision: 0 },
      ],
    };
    service.workspace.mockResolvedValue({ data: seriesWorkspace });
    let resolveRootUpdate;
    service.update.mockImplementation((_catalogue, id) => (
      id === 'a'
        ? new Promise((resolve) => { resolveRootUpdate = resolve; })
        : Promise.resolve({ data: {} })
    ));
    render(<LegalConfigInitialPage />);

    await findVariantInCatalog();
    fireEvent.click(screen.getByRole('button', { name: 'Gestionar series' }));
    const dialog = screen.getByRole('dialog', { name: 'Series y subseries' });

    fireEvent.change(within(dialog).getByLabelText('Código de la serie', { selector: 'input' }), { target: { value: '200' } });
    fireEvent.change(within(dialog).getByLabelText('Sufijo de código para Licencia de construcción'), { target: { value: '-01' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => expect(service.update).toHaveBeenCalledWith('actuations', 'a', expect.objectContaining({ code: '200' })));
    expect(service.update).not.toHaveBeenCalledWith('actuations', 'child', expect.anything());

    resolveRootUpdate({ data: {} });
    await waitFor(() => expect(service.update).toHaveBeenCalledWith('actuations', 'child', expect.objectContaining({ code: '200-01' })));
  });

  it('creates a compact condition under the selected actuation and links its document', async () => {
    service.workspace.mockResolvedValue({ data: workspace });
    service.create.mockResolvedValue({ data: { id: 'condition-1', name: 'El predio es BIC' } });
    render(<LegalConfigInitialPage />);

    await screen.findByRole('button', { name: /^Licencia,/ });
    fireEvent.click(newConditionButton());

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

    await screen.findByRole('button', { name: /^Construcción,/ });
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar actuación' }), { target: { value: 'obra nueva' } });

    expect(actuationButton('Construcción')).toBeInTheDocument();
    expect(actuationButton('Obra nueva')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Licencia,/ })).not.toBeInTheDocument();
  });

  it('uses the shared DataTable standard for the document catalogue and controlled catalogues', async () => {
    service.workspace.mockResolvedValue({ data: workspace });
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
    service.workspace.mockResolvedValue({ data: workspace });
    render(<LegalConfigInitialPage />);

    await findVariantInCatalog();
    fireEvent.click(screen.getByRole('button', { name: 'Gestionar catálogos' }));
    const catalogueDialog = screen.getByRole('dialog', { name: 'Tipologías y etiquetas' });
    expect(within(catalogueDialog).getByLabelText('Nuevo nombre')).toBeRequired();
    fireEvent.click(within(catalogueDialog).getByRole('button', { name: 'Close' }));

    fireEvent.click(newConditionButton());
    expect(within(screen.getByRole('dialog', { name: 'Nueva condición' })).getByLabelText('Nombre de la condición')).toBeRequired();
  });

  it('keeps the parent context when searching a document variant', async () => {
    service.workspace.mockResolvedValue({ data: workspace });
    render(<LegalConfigInitialPage />);

    await screen.findAllByText(/Plano principal/);
    fireEvent.change(screen.getByRole('textbox', { name: 'Buscar documentos' }), { target: { value: 'variante' } });

    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(within(table).getByText(/Plano principal/)).toBeInTheDocument();
      expect(within(table).getByText(/Plano variante/)).toBeInTheDocument();
    });
  });
});
