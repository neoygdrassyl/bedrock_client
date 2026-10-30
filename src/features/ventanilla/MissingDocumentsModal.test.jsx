import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getMissingRequirementsMock, refreshDocumentaryRequirementsMock } = vi.hoisted(() => ({
  getMissingRequirementsMock: vi.fn(),
  refreshDocumentaryRequirementsMock: vi.fn(),
}));

vi.mock('@/shared/components/legacy-modal', () => ({
  LegacyModal: ({ isOpen, children, contentLabel }) => (isOpen ? <section aria-label={contentLabel}>{children}</section> : null),
}));
vi.mock('@/features/expediente/api/documentaryOperations.service', () => ({
  getMissingRequirements: getMissingRequirementsMock,
  refreshDocumentaryRequirements: refreshDocumentaryRequirementsMock,
}));
vi.mock('@/features/expediente/api/documentary.service', () => ({
  documentaryError: (error) => error.message || 'Error',
}));

import MissingDocumentsModal from './MissingDocumentsModal.jsx';

function result(overrides = {}) {
  return {
    schemaVersion: 'dovela-backoffice/documentary-missing/v1',
    project: { fun0Id: 7, idPublic: 'FUN-7' },
    mode: 'canonical',
    applicable: true,
    state: 'current',
    allRequirementsSatisfied: false,
    requirements: [
      { documentId: 'C-D1', code: 'D1', name: 'Formulario único', required: true, standaloneRequired: true, groupCode: null, status: 'present' },
      { documentId: 'C-D2', code: 'D2', name: 'Certificado de libertad', required: true, standaloneRequired: true, groupCode: null, status: 'missing' },
    ],
    groups: [{ code: 'ALT', mode: 'at_least_one', status: 'missing' }],
    summary: { total: 2, missing: 1, present: 1 },
    refresh: { allowed: false, path: '/api/fun/documentary/v1/projects/7/requirements/refresh', expectedInputRevision: 3 },
    warnings: [],
    ...overrides,
  };
}

describe('MissingDocumentsModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists missing and present requirements of a current evaluation', async () => {
    getMissingRequirementsMock.mockResolvedValue(result());
    render(<MissingDocumentsModal open fun0Id={7} onClose={vi.fn()} />);

    const missing = await screen.findByRole('region', { name: 'Faltantes' });
    expect(within(missing).getByText('Certificado de libertad')).toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: 'Presentes' })).getByText('Formulario único')).toBeInTheDocument();
    expect(screen.getByText('Faltantes: 1')).toBeInTheDocument();
    expect(screen.getByText('Requisitos incompletos')).toBeInTheDocument();
    expect(screen.getByText('Grupo ALT · Al menos uno · Faltante')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Actualizar evaluación/ })).not.toBeInTheDocument();
    expect(getMissingRequirementsMock).toHaveBeenCalledWith(7, expect.any(AbortSignal));
  });

  it('reports a satisfied evaluation', async () => {
    getMissingRequirementsMock.mockResolvedValue(result({
      allRequirementsSatisfied: true,
      requirements: [{ documentId: 'C-D1', code: 'D1', name: 'Formulario único', required: true, standaloneRequired: true, groupCode: null, status: 'present' }],
      groups: [],
      summary: { total: 1, missing: 0, present: 1 },
    }));
    render(<MissingDocumentsModal open fun0Id={7} onClose={vi.fn()} />);

    expect(await screen.findByText('Requisitos completos')).toBeInTheDocument();
    expect(screen.getByText('No hay requisitos faltantes en la evaluación disponible.')).toBeInTheDocument();
  });

  it('warns about a stale evaluation and refreshes it when allowed', async () => {
    getMissingRequirementsMock
      .mockResolvedValueOnce(result({ state: 'stale', allRequirementsSatisfied: null, refresh: { allowed: true, path: 'x', expectedInputRevision: 3 } }))
      .mockResolvedValueOnce(result({ state: 'current' }));
    refreshDocumentaryRequirementsMock.mockResolvedValue({});
    const onRefreshed = vi.fn();
    render(<MissingDocumentsModal open fun0Id={7} onClose={vi.fn()} onRefreshed={onRefreshed} />);

    expect(await screen.findByText(/está desactualizada/)).toBeInTheDocument();
    expect(screen.getByText('Completitud no establecida')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Actualizar evaluación/ }));

    await waitFor(() => expect(refreshDocumentaryRequirementsMock).toHaveBeenCalledWith(7, expect.objectContaining({ expectedInputRevision: 3, reason: expect.any(String), idempotencyKey: expect.any(String) })));
    await waitFor(() => expect(getMissingRequirementsMock).toHaveBeenCalledTimes(2));
    expect(onRefreshed).toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByText(/está desactualizada/)).not.toBeInTheDocument());
  });

  it('shows the not-applicable state for a traditional project with a pending activation', async () => {
    getMissingRequirementsMock.mockResolvedValue(result({
      mode: 'traditional', applicable: false, state: 'not_applicable', allRequirementsSatisfied: null, requirements: [], groups: [],
      summary: { total: 0, missing: 0, present: 0 }, refresh: { allowed: false, path: null, expectedInputRevision: null },
      warnings: [{ code: 'CENTRAL_ACTIVATION_PENDING', message: 'x', releaseId: 'release-a', releaseVersion: 4 }],
    }));
    render(<MissingDocumentsModal open fun0Id={7} onClose={vi.fn()} />);

    expect(await screen.findByText(/solo aplica a expedientes activados/)).toBeInTheDocument();
    expect(screen.getByText(/versión 4, pendiente de activación/)).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Faltantes' })).not.toBeInTheDocument();
  });

  it('shows not applicable without querying when there is no linked project', () => {
    render(<MissingDocumentsModal open fun0Id={null} onClose={vi.fn()} />);

    expect(screen.getByText(/solo aplica a expedientes activados/)).toBeInTheDocument();
    expect(getMissingRequirementsMock).not.toHaveBeenCalled();
  });

  it('shows the error and retries', async () => {
    getMissingRequirementsMock.mockRejectedValueOnce(new Error('Servicio no disponible')).mockResolvedValueOnce(result());
    render(<MissingDocumentsModal open fun0Id={7} onClose={vi.fn()} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Servicio no disponible');
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByRole('region', { name: 'Faltantes' })).toBeInTheDocument();
  });
});
