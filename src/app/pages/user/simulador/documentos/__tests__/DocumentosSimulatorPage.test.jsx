import React from 'react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { documentRequirementServiceMock, previewRequirementsMock } = vi.hoisted(() => {
  const previewRequirementsMock = vi.fn();
  return {
    previewRequirementsMock,
    documentRequirementServiceMock: {
      previewRequirements: previewRequirementsMock,
    },
  };
});

vi.mock('@/app/services/document_requirement.service.js', () => ({
  __esModule: true,
  default: documentRequirementServiceMock,
}));

import DocumentosSimulatorPage from '../DocumentosSimulatorPage.jsx';

const backendPreviewResponse = {
  data: {
    configVersion: 7,
    status: 'draft',
    config: {
      schemaVersion: 1,
      groups: [
        { key: 'construccion', label: 'Documentos de construcción', order: 1 },
      ],
      documents: [
        { code: '6601', label: 'Documento técnico backend', active: true, groupKey: 'construccion', order: 1 },
      ],
      rules: [
        {
          key: 'rule-construction-backend',
          groupKey: 'construccion',
          documentCodes: ['6601'],
          conditions: {
            tipoAny: ['D'],
            tramiteAny: true,
            mUrbAny: true,
            mSubAny: true,
            mLicAny: true,
            usosAny: true,
            areaAny: true,
            viviendaAny: true,
            culturalAny: true,
          },
          required: true,
          allowNa: false,
          active: true,
          order: 1,
          conditionSummary: 'tipoAny=D',
        },
      ],
    },
    requiredDocuments: [
      { code: '6601', label: 'Documento técnico backend', groupKey: 'construccion' },
    ],
    matchedRules: [
      {
        key: 'rule-construction-backend',
        groupKey: 'construccion',
        documentCodes: ['6601'],
        required: true,
        allowNa: false,
        conditionSummary: 'tipoAny=D',
      },
    ],
    diagnostics: [],
  },
};

async function selectConstruction(user) {
  await user.click(screen.getByLabelText('D Construcción'));
}

describe('DocumentosSimulatorPage backend preview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.pushState({}, '', '/simulador/documentos');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('envía la selección al preview backend y muestra badge de borrador con trazas de regla', async () => {
    const user = userEvent.setup();
    window.history.pushState({}, '', '/simulador/documentos?configStatus=draft');
    previewRequirementsMock.mockResolvedValue(backendPreviewResponse);

    render(<DocumentosSimulatorPage />);
    await selectConstruction(user);

    await waitFor(() => {
      expect(previewRequirementsMock).toHaveBeenLastCalledWith(expect.objectContaining({
        configStatus: 'draft',
        actuacion: expect.objectContaining({
          tipo: ['D'],
        }),
      }));
    });

    expect(await screen.findByText('Borrador')).toBeInTheDocument();
    expect(screen.getByText('Documento técnico backend')).toBeInTheDocument();
    expect(screen.getAllByText(/rule-construction-backend/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/tipoAny=D/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Ver reglas locales históricas/i })).toBeInTheDocument();
  });

  it('muestra error backend sin presentar tabla oficial de requisitos', async () => {
    const user = userEvent.setup();
    previewRequirementsMock.mockRejectedValue({
      response: {
        status: 500,
        data: { message: 'Fallo interno del preview documental.' },
      },
    });

    render(<DocumentosSimulatorPage />);
    await selectConstruction(user);

    expect(await screen.findByRole('alert')).toHaveTextContent(/Fallo interno del preview documental/i);
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Requisitos configurados por backend/i })).not.toBeInTheDocument();
    expect(screen.queryByText('Documento técnico backend')).not.toBeInTheDocument();

    const diagnosticToggle = screen.getByRole('button', { name: /Ver reglas locales históricas/i });
    expect(diagnosticToggle).toBeInTheDocument();
    expect(within(diagnosticToggle).queryByText(/Documento técnico backend/i)).not.toBeInTheDocument();
  });
});
