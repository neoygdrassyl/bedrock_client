import React from 'react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const {
  documentRequirementServiceMock,
  getConfigMock,
  saveDraftMock,
  publishConfigMock,
} = vi.hoisted(() => {
  const getConfigMock = vi.fn();
  const saveDraftMock = vi.fn();
  const publishConfigMock = vi.fn();
  return {
    getConfigMock,
    saveDraftMock,
    publishConfigMock,
    documentRequirementServiceMock: {
      getConfig: getConfigMock,
      saveDraft: saveDraftMock,
      publishConfig: publishConfigMock,
    },
  };
});

vi.mock('../../../services/document_requirement.service.js', () => ({
  __esModule: true,
  default: documentRequirementServiceMock,
}));

vi.mock('../../../services/data.service.js', () => ({
  __esModule: true,
  default: {
    getUserData: () => ({ name: 'Admin', surname: 'Dovela', roleDesc: 'Administrador' }),
  },
}));

vi.mock('../../../utils/developerAccess.js', () => ({
  isDeveloperUser: () => false,
  isErrorReportManagerUser: () => false,
}));

import DocumentRequirementsConfigPanel from './DocumentRequirementsConfigPanel.jsx';
import SettingsPage from '../SettingsPage.jsx';

const baseConditions = {
  tipoAny: true,
  tramiteAny: true,
  mUrbAny: true,
  mSubAny: true,
  mLicAny: true,
  usosAny: true,
  areaAny: true,
  viviendaAny: true,
  culturalAny: true,
};

const publishedConfig = {
  schemaVersion: 1,
  groups: [
    { key: 'identidad', label: 'Identidad del solicitante', order: 1, sourceListTitle: 'Ventanilla' },
  ],
  documents: [
    { code: 'DOC-001', label: 'Formulario único nacional', active: true, groupKey: 'identidad', order: 1, legacyAliases: [] },
  ],
  rules: [
    {
      key: 'regla-base',
      groupKey: 'identidad',
      documentCodes: ['DOC-001'],
      conditions: baseConditions,
      required: true,
      allowNa: true,
      active: true,
      order: 1,
    },
  ],
};

const draftConfig = {
  ...publishedConfig,
  groups: [
    ...publishedConfig.groups,
    { key: 'tecnica', label: 'Soporte técnico', order: 2, sourceListTitle: 'Ventanilla' },
  ],
  rules: [
    ...publishedConfig.rules,
    {
      key: 'regla-tecnica',
      groupKey: 'tecnica',
      documentCodes: ['DOC-001'],
      conditions: baseConditions,
      required: true,
      allowNa: false,
      active: true,
      order: 2,
    },
  ],
};

function mockLoadedConfig() {
  getConfigMock.mockImplementation((status) => Promise.resolve({
    data: status === 'draft'
      ? { configVersion: 3, status: 'draft', config: draftConfig, updatedAt: '2026-06-11T10:30:00.000Z' }
      : { configVersion: 2, status: 'published', config: publishedConfig, updatedAt: '2026-06-10T08:15:00.000Z' },
  }));
  saveDraftMock.mockResolvedValue({ data: { configVersion: 3, status: 'draft', config: draftConfig } });
  publishConfigMock.mockResolvedValue({ data: { published: { configVersion: 4, status: 'published', config: draftConfig } } });
}

function renderPanel() {
  return render(<DocumentRequirementsConfigPanel />);
}

describe('DocumentRequirementsConfigPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoadedConfig();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('muestra estados Borrador/Publicada, tarjetas de resumen y acciones principales al cargar', async () => {
    renderPanel();

    expect(await screen.findByTestId('document-requirements-panel')).toBeInTheDocument();
    expect(screen.getByText('Borrador')).toBeInTheDocument();
    expect(screen.getByText('Publicada')).toBeInTheDocument();
    expect(screen.getByText('Versión publicada')).toBeInTheDocument();
    expect(screen.getByText('Versión borrador')).toBeInTheDocument();
    expect(screen.getByText('Total grupos')).toBeInTheDocument();
    expect(screen.getByText('Total reglas')).toBeInTheDocument();
    expect(screen.getByText('Última actualización')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Guardar borrador/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Publicar configuración/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Simular reglas/i })).toBeInTheDocument();
  });

  it('guarda el borrador con el JSON editado a través del servicio', async () => {
    const user = userEvent.setup();
    renderPanel();

    const editor = await screen.findByLabelText(/Editor JSON del borrador documental/i);
    const nextConfig = {
      ...draftConfig,
      groups: draftConfig.groups.slice(0, 1),
      rules: draftConfig.rules.slice(0, 1),
    };

    fireEvent.change(editor, { target: { value: JSON.stringify(nextConfig, null, 2) } });
    await user.click(screen.getByRole('button', { name: /Guardar borrador/i }));

    await waitFor(() => expect(saveDraftMock).toHaveBeenCalledWith(nextConfig));
    expect(await screen.findByText(/Borrador guardado/i)).toBeInTheDocument();
  });

  it('publica el borrador y refresca las versiones desde el backend', async () => {
    const user = userEvent.setup();
    renderPanel();

    await screen.findByTestId('document-requirements-panel');
    await user.click(screen.getByRole('button', { name: /Publicar configuración/i }));

    await waitFor(() => expect(publishConfigMock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getConfigMock).toHaveBeenCalledTimes(4));
    expect(await screen.findByText(/Configuración publicada/i)).toBeInTheDocument();
  });

  it('mantiene visible un error 400 de validación del backend sin dejar la UI en blanco', async () => {
    const user = userEvent.setup();
    saveDraftMock.mockRejectedValueOnce({
      response: {
        status: 400,
        data: {
          message: 'Configuracion documental invalida.',
          errors: ['rules[0].key es requerido.'],
        },
      },
    });

    renderPanel();

    const editor = await screen.findByLabelText(/Editor JSON del borrador documental/i);
    fireEvent.change(editor, { target: { value: JSON.stringify({ ...draftConfig, rules: [{ ...draftConfig.rules[0], key: '' }] }, null, 2) } });
    await user.click(screen.getByRole('button', { name: /Guardar borrador/i }));

    expect(await screen.findByText(/Configuracion documental invalida/i)).toBeInTheDocument();
    expect(screen.getByText(/rules\[0\]\.key es requerido/i)).toBeInTheDocument();
    expect(screen.getByTestId('document-requirements-panel')).toBeInTheDocument();
  });

  it('abre el panel desde /configuracion?tab=requisitos-documentales y marca el tab activo', async () => {
    render(
      <MemoryRouter initialEntries={['/configuracion?tab=requisitos-documentales']}>
        <SettingsPage />
      </MemoryRouter>
    );

    expect(await screen.findByTestId('doc-explorer-page')).toBeInTheDocument();
    expect(screen.getByTestId('settings-nav-requisitos-documentales')).toHaveClass('is-active');
  });
});
