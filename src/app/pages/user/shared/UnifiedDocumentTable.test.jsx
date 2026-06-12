import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import UnifiedDocumentTable from './UnifiedDocumentTable.jsx';
import { DOCUMENT_ORIGIN_STATE } from './expediente-documental.constants.js';

const baseEntries = [
  {
    entryId: 'source:fun_6:77',
    contractVersion: 3,
    isConsolidated: true,
    consolidationKey: 'VR26-2330|DOC-003',
    documentCode: 'DOC-003',
    documentName: 'Documento de identidad digital',
    originState: DOCUMENT_ORIGIN_STATE.DIGITAL,
    date: '2026-06-01',
    time: '09:00',
    summary: {
      sourceCount: 1,
      foliosDigital: 1,
      foliosPhysical: 0,
      foliosTotal: 1,
      previewSourceEntryId: 'fun6:77',
      editableSourceEntryId: 'fun6:77',
    },
    sources: [
      {
        entryId: 'fun6:77',
        sourceTable: 'fun_6',
        source: 'digital',
        originState: DOCUMENT_ORIGIN_STATE.DIGITAL,
        documentCode: 'DOC-003',
        documentName: 'Documento de identidad digital',
        vr: 'VR26-2330',
        date: '2026-06-01',
        time: '09:00',
        pages: 1,
        filename: 'doc-003.pdf',
        path: 'docs/fun/FUN26-2330',
        canPreview: true,
        canEdit: true,
        canDelete: true,
      },
    ],
  },
];

const legalFormResult = {
  source: 'snapshot',
  snapshotId: 321,
  configVersionId: 12,
  summary: {
    totalRequirements: 3,
    missing: 1,
    pendingScan: 1,
    present: 1,
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
};

describe('UnifiedDocumentTable Legal y Debida Forma', () => {
  it('muestra KPI legal, filtra faltantes y no ofrece preview/download para filas sintéticas', async () => {
    const user = userEvent.setup();

    render(
      <UnifiedDocumentTable
        entries={baseEntries}
        loading={false}
        canManage={true}
        onAddDocument={vi.fn()}
        onEditEntry={vi.fn()}
        onSaveDigitalEntry={vi.fn()}
        onDeleteEntry={vi.fn()}
        vrList={['VR26-2330']}
        legalFormResult={legalFormResult}
        legalFormLoading={false}
        legalFormError=""
      />,
    );

    expect(screen.getByText('Legal y Debida Forma')).toBeInTheDocument();
    expect(screen.getByText('Presentes')).toBeInTheDocument();
    expect(screen.getByText('Faltantes')).toBeInTheDocument();
    expect(screen.getByText('Pendientes escaneo')).toBeInTheDocument();
    expect(screen.getAllByText('Snapshot activo').length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: /Faltantes/i }));

    expect(screen.getByText('Formulario único nacional')).toBeInTheDocument();
    expect(screen.queryByText('Documento de identidad digital')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Consultar entradas históricas/i }));

    expect(screen.getByText('Esta entrada no tiene archivo digital para previsualizar.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Descargar archivo previsualizado/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Ver archivo previsualizado en pantalla completa/i })).not.toBeInTheDocument();
  });

  it('visibiliza el estado no_snapshot en lugar de aparentar cero faltantes', () => {
    render(
      <UnifiedDocumentTable
        entries={baseEntries}
        loading={false}
        canManage={false}
        onAddDocument={vi.fn()}
        onEditEntry={vi.fn()}
        onSaveDigitalEntry={vi.fn()}
        onDeleteEntry={vi.fn()}
        vrList={[]}
        legalFormResult={{ ...legalFormResult, source: 'no_snapshot', snapshotId: null, requirements: [], summary: { totalRequirements: 0, missing: 0, pendingScan: 0, present: 0 } }}
        legalFormLoading={false}
        legalFormError=""
      />,
    );

    const notice = screen.getByRole('alert');
    expect(within(notice).getByText(/sin snapshot/i)).toBeInTheDocument();
    expect(within(notice).getByText(/no se infieren todos los documentos/i)).toBeInTheDocument();
  });
});
