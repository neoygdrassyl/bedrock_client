import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

const service = vi.hoisted(() => Object.fromEntries([
  'listActuationTypes', 'listDocumentDefinitions', 'listDocumentCodes', 'listConfigurationLabels', 'listLegalTexts', 'listReadContracts', 'listAssertions', 'listRules', 'listDocumentTypologies', 'createDocumentDefinition', 'updateDocumentDefinition', 'createDocumentTypology', 'updateDocumentTypology', 'proposeDocumentCode', 'createConfigurationLabel', 'updateConfigurationLabel',
].map((name) => [name, vi.fn()])));

vi.mock('../../../services/legal_config.service.js', () => ({ __esModule: true, default: service }));
vi.mock('../../../services/data.service.js', () => ({ __esModule: true, default: { getUserData: () => ({ role: 'ADM' }) } }));
vi.mock('../../../utils/developerAccess.js', () => ({ isDeveloperUser: () => false, isErrorReportManagerUser: () => false }));

import LegalConfigInitialPage from './LegalConfigInitialPage.jsx';

const labels = [{ id: 'label-doc', name: 'Documentos comunes', label_scope: 'document', is_active: true }];
const typologies = [{ id: 'type-plan', code: 'PLAN-', name: 'Planos', description: 'Documentos gráficos', is_active: true }];
const documents = [
  { id: 'root', code: 'FUN-001', name: 'Formulario único nacional', slug: 'fun', label_ids: ['label-doc'], is_active: true },
  { id: 'typed', code: 'PLAN-001', name: 'Plano arquitectónico', slug: 'plan', typology_id: 'type-plan', code_suffix: '001', is_active: true },
  { id: 'variant', code: 'FUN-001-1', name: 'Formulario variante', slug: 'fun-variante', parent_definition_id: 'root', code_suffix: '1', is_active: true },
];

function load() {
  service.listActuationTypes.mockResolvedValue({ data: [] });
  service.listDocumentDefinitions.mockResolvedValue({ data: documents });
  service.listDocumentCodes.mockResolvedValue({ data: [] });
  service.listConfigurationLabels.mockResolvedValue({ data: labels });
  service.listLegalTexts.mockResolvedValue({ data: [] });
  service.listReadContracts.mockResolvedValue({ data: [] });
  service.listAssertions.mockResolvedValue({ data: [] });
  service.listRules.mockResolvedValue({ data: {} });
  service.listDocumentTypologies.mockResolvedValue({ data: typologies });
  service.proposeDocumentCode.mockResolvedValue({ data: { code_suffix: '002', code: 'PLAN-002' } });
}

async function openDocuments() {
  render(<LegalConfigInitialPage />);
  fireEvent.click(await screen.findByRole('button', { name: 'Documentos' }));
  return screen.findByRole('table', { name: 'Documentos activos' });
}

describe('LegalConfigInitialPage document variants and typologies', () => {
  beforeEach(() => { vi.clearAllMocks(); load(); });

  it('lists only active definitions, preserves labels, and never exposes legacy code creation', async () => {
    await openDocuments();
    expect(screen.getByText('FUN-001')).toBeInTheDocument();
    expect(screen.getByText('Documentos comunes')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Nuevo código/i })).not.toBeInTheDocument();
    expect(service.createDocumentCode).toBeUndefined();
  });

  it('creates a document with independent typology and labels', async () => {
    service.createDocumentDefinition.mockResolvedValue({ data: { id: 'new' } });
    await openDocuments();
    fireEvent.click(screen.getByRole('button', { name: /^Nuevo documento$/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Nuevo documento' });
    fireEvent.change(within(dialog).getByLabelText('Código del documento'), { target: { value: 'PLAN-009' } });
    fireEvent.change(within(dialog).getByLabelText('Nombre del documento'), { target: { value: 'Plano de localización' } });
    fireEvent.change(within(dialog).getByLabelText('Tipología del documento'), { target: { value: 'type-plan' } });
    fireEvent.change(within(dialog).getByRole('combobox', { name: 'Buscar etiquetas documentales' }), { target: { value: 'Documentos' } });
    fireEvent.click(await screen.findByRole('option', { name: 'Documentos comunes' }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Crear documento' }));
    await waitFor(() => expect(service.createDocumentDefinition).toHaveBeenLastCalledWith(expect.objectContaining({
      mode: 'standalone', code: 'PLAN-009', typology_id: 'type-plan', label_ids: ['label-doc'],
    })));
  });

  it('shows server field errors and permits recovery', async () => {
    service.createDocumentDefinition.mockRejectedValueOnce({ response: { data: { message: 'Código duplicado', errors: [{ field: 'code', code: 'duplicate' }] } } });
    await openDocuments();
    fireEvent.click(screen.getByRole('button', { name: /^Nuevo documento$/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Nuevo documento' });
    fireEvent.change(within(dialog).getByLabelText('Código del documento'), { target: { value: 'FUN-001' } });
    fireEvent.change(within(dialog).getByLabelText('Nombre del documento'), { target: { value: 'Duplicado' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Crear documento' }));
    expect(await within(dialog).findByText('Código duplicado')).toBeInTheDocument();
    expect(within(dialog).getByText('duplicate')).toBeInTheDocument();
  });

  it('expands variants and opens a locked parent variant form', async () => {
    await openDocuments();
    fireEvent.click(screen.getByText('1 variante'));
    expect(screen.getByRole('list', { name: 'Variantes de Formulario único nacional' })).toBeInTheDocument();
    expect(screen.getByText('FUN-001-1')).toBeInTheDocument();
    expect(screen.getByText(/Formulario variante/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Agregar variante a Formulario único nacional' }));
    const dialog = await screen.findByRole('dialog', { name: 'Nueva variante' });
    expect(within(dialog).getByDisplayValue('FUN-001')).toHaveAttribute('readonly');
    expect(within(dialog).queryByLabelText('Seleccionar tipología')).not.toBeInTheDocument();
    expect(within(dialog).getByLabelText('Sufijo numérico')).toBeRequired();
  });

  it('creates variants with their locked parent source and keeps edit origins immutable', async () => {
    service.createDocumentDefinition.mockResolvedValue({ data: { id: 'next' } });
    service.updateDocumentDefinition.mockResolvedValue({ data: documents[0] });
    await openDocuments();
    fireEvent.click(screen.getByRole('button', { name: 'Agregar variante a Formulario único nacional' }));
    const variantDialog = await screen.findByRole('dialog', { name: 'Nueva variante' });
    fireEvent.change(within(variantDialog).getByLabelText('Sufijo numérico'), { target: { value: '2' } });
    fireEvent.change(within(variantDialog).getByLabelText('Nombre del documento'), { target: { value: 'Variante dos' } });
    fireEvent.click(within(variantDialog).getByRole('button', { name: 'Crear variante' }));
    await waitFor(() => expect(service.createDocumentDefinition).toHaveBeenCalledWith(expect.objectContaining({ mode: 'variant', parent_definition_id: 'root', code_suffix: '2' })));
    fireEvent.click(screen.getAllByRole('button', { name: 'Editar' })[0]);
    const editDialog = await screen.findByRole('dialog', { name: 'Editar documento' });
    expect(within(editDialog).getByLabelText('Código inmutable')).toHaveAttribute('readonly');
  });

  it('uses designed creation dialogs for typologies and labels', async () => {
    await openDocuments();
    fireEvent.click(screen.getByRole('button', { name: 'Gestionar tipologías' }));
    const manager = await screen.findByRole('dialog', { name: 'Tipologías documentales' });
    fireEvent.click(within(manager).getByRole('button', { name: 'Nueva tipología' }));
    const typologyDialog = await screen.findByRole('dialog', { name: 'Nueva tipología' });
    expect(within(typologyDialog).getByLabelText('Código o prefijo')).toBeInTheDocument();
    expect(within(typologyDialog).getByLabelText('Nombre de la tipología')).toBeInTheDocument();
    expect(within(typologyDialog).getByText('Vista previa')).toBeInTheDocument();
    fireEvent.click(within(typologyDialog).getByRole('button', { name: 'Cancelar' }));
    fireEvent.click(within(manager).getByRole('button', { name: 'Cerrar' }));

    fireEvent.click(screen.getByRole('button', { name: 'Nuevo documento' }));
    const documentDialog = await screen.findByRole('dialog', { name: 'Nuevo documento' });
    fireEvent.change(within(documentDialog).getByRole('combobox', { name: 'Buscar etiquetas documentales' }), { target: { value: 'Control técnico' } });
    fireEvent.click(await screen.findByRole('option', { name: /Crear etiqueta/ }));
    const labelDialog = await screen.findByRole('dialog', { name: 'Crear etiqueta' });
    expect(within(labelDialog).getByLabelText('Nombre de la etiqueta')).toBeInTheDocument();
    expect(within(labelDialog).getByText('Disponible para documentos')).toBeInTheDocument();
  });

  it('manages typologies and document lifecycle while retaining label editing', async () => {
    service.updateDocumentTypology.mockResolvedValue({ data: { ...typologies[0], is_active: false } });
    service.updateDocumentDefinition.mockResolvedValue({ data: { ...documents[0], is_active: false } });
    await openDocuments();
    fireEvent.click(screen.getByRole('button', { name: 'Gestionar tipologías' }));
    const manager = await screen.findByRole('dialog', { name: 'Tipologías documentales' });
    fireEvent.click(within(manager).getByRole('button', { name: 'Desactivar' }));
    const confirmation = await screen.findByRole('dialog', { name: 'Desactivar tipología' });
    fireEvent.click(within(confirmation).getByRole('button', { name: 'Desactivar tipología' }));
    await waitFor(() => expect(service.updateDocumentTypology).toHaveBeenCalledWith('type-plan', expect.objectContaining({ is_active: false })));
    fireEvent.click(within(manager).getByRole('button', { name: 'Cerrar' }));

  });

  it('renders a typology edit error and succeeds when retried without submitting its immutable code', async () => {
    service.updateDocumentTypology.mockRejectedValueOnce({ response: { data: { message: 'No se pudo actualizar' } } }).mockResolvedValueOnce({ data: typologies[0] });
    await openDocuments();
    fireEvent.click(screen.getByRole('button', { name: 'Gestionar tipologías' }));
    const manager = await screen.findByRole('dialog', { name: 'Tipologías documentales' });
    fireEvent.click(within(manager).getByRole('button', { name: 'Editar' }));
    const edit = await screen.findByRole('dialog', { name: 'Editar tipología' });
    fireEvent.change(within(edit).getByDisplayValue('Planos'), { target: { value: 'Planos actualizados' } });
    fireEvent.click(within(edit).getByRole('button', { name: 'Guardar tipología' }));
    expect(await screen.findByText('No se pudo actualizar')).toBeInTheDocument();
    fireEvent.click(within(edit).getByRole('button', { name: 'Guardar tipología' }));
    await waitFor(() => expect(service.updateDocumentTypology).toHaveBeenLastCalledWith('type-plan', expect.not.objectContaining({ code: expect.anything() })));
  });


  it('blocks root retirement while variants are active and permits it once variants are retired', async () => {
    await openDocuments();
    const rootRow = screen.getByText('Formulario único nacional').closest('tr');
    fireEvent.click(within(rootRow).getByRole('button', { name: 'Desactivar' }));
    const confirmation = await screen.findByRole('dialog', { name: 'Desactivar definición' });
    fireEvent.click(within(confirmation).getByRole('button', { name: 'Desactivar definición' }));
    expect(await within(confirmation).findByText(/Desactiva primero las variantes activas/i)).toBeInTheDocument();
    expect(screen.getByText('Formulario único nacional')).toBeInTheDocument();
  });

  it('exposes edit and deactivate controls for expanded variants', async () => {
    service.updateDocumentDefinition.mockResolvedValue({ data: { ...documents[2], is_active: false } });
    await openDocuments();
    fireEvent.click(screen.getByText('1 variante'));
    fireEvent.click(screen.getByRole('button', { name: 'Editar variante' }));
    expect(await screen.findByRole('dialog', { name: 'Editar documento' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Desactivar variante' }));
    const confirmation = await screen.findByRole('dialog', { name: 'Desactivar definición' });
    fireEvent.click(within(confirmation).getByRole('button', { name: 'Desactivar definición' }));
    await waitFor(() => expect(service.updateDocumentDefinition).toHaveBeenCalledWith('variant', { is_active: false }));
  });

  it('blocks the labeled root until its active variant is retired, then retires only lifecycle state', async () => {
    const afterVariantRetirement = documents.map((item) => item.id === 'variant' ? { ...item, is_active: false } : item);
    service.listDocumentDefinitions.mockResolvedValueOnce({ data: documents }).mockResolvedValue({ data: afterVariantRetirement });
    service.updateDocumentDefinition.mockResolvedValue({ data: { ok: true } });
    await openDocuments();
    expect(screen.getByText('Documentos comunes')).toBeInTheDocument();
    const rootRow = screen.getByText('Formulario único nacional').closest('tr');
    fireEvent.click(within(rootRow).getByRole('button', { name: 'Desactivar' }));
    let confirmation = await screen.findByRole('dialog', { name: 'Desactivar definición' });
    fireEvent.click(within(confirmation).getByRole('button', { name: 'Desactivar definición' }));
    expect(await within(confirmation).findByText(/Desactiva primero las variantes activas/i)).toBeInTheDocument();
    expect(service.updateDocumentDefinition).not.toHaveBeenCalled();
    fireEvent.click(within(confirmation).getByRole('button', { name: 'Cancelar' }));
    fireEvent.click(screen.getByText('1 variante'));
    fireEvent.click(screen.getByRole('button', { name: 'Desactivar variante' }));
    confirmation = await screen.findByRole('dialog', { name: 'Desactivar definición' });
    fireEvent.click(within(confirmation).getByRole('button', { name: 'Desactivar definición' }));
    await waitFor(() => expect(service.updateDocumentDefinition).toHaveBeenCalledWith('variant', { is_active: false }));
    expect(screen.queryByText('Formulario variante')).not.toBeInTheDocument();
    expect(screen.getByText('Documentos comunes')).toBeInTheDocument();
    fireEvent.click(within(rootRow).getByRole('button', { name: 'Desactivar' }));
    confirmation = await screen.findByRole('dialog', { name: 'Desactivar definición' });
    fireEvent.click(within(confirmation).getByRole('button', { name: 'Desactivar definición' }));
    await waitFor(() => expect(service.updateDocumentDefinition).toHaveBeenLastCalledWith('root', { is_active: false }));
    expect(screen.queryByRole('dialog', { name: 'Desactivar definición' })).not.toBeInTheDocument();
  });

  it('edits an expanded variant with only descriptive fields while origin remains immutable', async () => {
    service.updateDocumentDefinition.mockResolvedValue({ data: { ...documents[2], name: 'Formulario variante corregido' } });
    await openDocuments();
    fireEvent.click(screen.getByText('1 variante'));
    fireEvent.click(screen.getByRole('button', { name: 'Editar variante' }));
    const dialog = await screen.findByRole('dialog', { name: 'Editar documento' });
    expect(within(dialog).getByLabelText('Código inmutable')).toHaveAttribute('readonly');
    expect(within(dialog).queryByLabelText('Seleccionar tipología')).not.toBeInTheDocument();
    fireEvent.change(within(dialog).getByLabelText('Nombre del documento'), { target: { value: 'Formulario variante corregido' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Guardar cambios' }));
    await waitFor(() => expect(service.updateDocumentDefinition).toHaveBeenCalledWith('variant', {
      name: 'Formulario variante corregido', slug: 'formulario-variante-corregido', description: null,
      label_ids: [], is_record: false, validation_config: { expected_support_note: null }, metadata: { source: 'legal-config-documentos-ui' },
    }));
  });
});
