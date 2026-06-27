import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/components/legacy-modal', () => ({
  LegacyModal: ({ isOpen, children, contentLabel }) => (isOpen ? <section aria-label={contentLabel}>{children}</section> : null),
}));

import MissingDocumentsModal from './MissingDocumentsModal.jsx';

const baseResult = {
  source: 'snapshot',
  snapshotId: 321,
  configVersionId: 12,
  summary: {
    totalRequirements: 3,
    missing: 1,
    pendingScan: 1,
    present: 1,
    notApplicable: 0,
  },
  requirements: [
    {
      code: 'DOC-001',
      label: 'Formulario único nacional',
      groupKey: 'base',
      status: 'missing',
      statusReason: 'required_without_evidence',
      evidence: [],
    },
    {
      code: 'DOC-002',
      label: 'Certificado de libertad físico',
      groupKey: 'base',
      status: 'pending_scan',
      statusReason: 'physical_positive_without_digital',
      evidence: [{ sourceTable: 'sub_list', sourceId: 42, vrIdPublic: 'VR26-2330' }],
    },
    {
      code: 'DOC-003',
      label: 'Documento de identidad digital',
      groupKey: 'identidad',
      status: 'present',
      statusReason: 'digital_evidence',
      evidence: [{ sourceTable: 'fun_6', sourceId: 77, documentName: 'Documento de identidad digital' }],
    },
  ],
  missingDocuments: [
    { code: 'DOC-001', label: 'Formulario único nacional', reason: 'required_without_evidence', suggestedText: 'Solicitar Formulario único nacional.' },
    { code: 'DOC-002', label: 'Certificado de libertad físico', reason: 'physical_positive_without_digital', suggestedText: 'Digitalizar o cargar Certificado de libertad físico.' },
  ],
};

describe('MissingDocumentsModal', () => {
  it('agrupa faltantes, pendientes de escaneo y presentes con source y snapshotId visibles', () => {
    render(<MissingDocumentsModal open result={baseResult} loading={false} error="" onClose={vi.fn()} />);

    expect(screen.getByText('source: snapshot')).toBeInTheDocument();
    expect(screen.getByText('snapshotId: 321')).toBeInTheDocument();

    const missingGroup = screen.getByRole('region', { name: /^Faltantes$/i });
    const pendingGroup = screen.getByRole('region', { name: /^Pendientes de escaneo$/i });
    const presentGroup = screen.getByRole('region', { name: /^Presentes$/i });

    expect(within(missingGroup).getByText('DOC-001')).toBeInTheDocument();
    expect(within(missingGroup).getByText('Formulario único nacional')).toBeInTheDocument();
    expect(within(pendingGroup).getByText('DOC-002')).toBeInTheDocument();
    expect(within(pendingGroup).getByText('Certificado de libertad físico')).toBeInTheDocument();
    expect(within(presentGroup).getByText('DOC-003')).toBeInTheDocument();
    expect(within(presentGroup).getByText('Documento de identidad digital')).toBeInTheDocument();
  });

  it('muestra el callout exacto cuando source es no_snapshot', () => {
    render(<MissingDocumentsModal open result={{ ...baseResult, source: 'no_snapshot', snapshotId: null, requirements: [], missingDocuments: [] }} loading={false} error="" onClose={vi.fn()} />);

    expect(screen.getByText('Este expediente aún no tiene snapshot de requisitos; no se infieren todos los documentos.')).toBeInTheDocument();
    expect(screen.getByText('source: no_snapshot')).toBeInTheDocument();
  });

  it('muestra insufficient_inputs como alerta visible y no como resultado exitoso vacío', () => {
    render(<MissingDocumentsModal open result={{ ...baseResult, source: 'insufficient_inputs', snapshotId: null, requirements: [], missingDocuments: [] }} loading={false} error="" onClose={vi.fn()} />);

    expect(screen.getByRole('alert')).toHaveTextContent(/insufficient_inputs/i);
    expect(screen.getByRole('alert')).toHaveTextContent(/No hay insumos suficientes/i);
    expect(screen.queryByText(/No hay documentos faltantes por mostrar/i)).not.toBeInTheDocument();
  });

  it('cierra sin acciones de guardado', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<MissingDocumentsModal open result={baseResult} loading={false} error="" onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: /Cerrar/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
