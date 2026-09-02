import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { DocumentalTable } from './DocumentalTable.jsx';
import { DOCUMENT_ORIGIN_STATE } from '../../../shared/expediente-documental.constants.js';
import {
  buildDocumentTableRows,
  decorateDocumentTableRowsWithLegalForm,
} from '../../../shared/expediente-documental.utils.js';

// jsdom does not implement pointer capture or scrollIntoView, both used by
// Radix Select when an item is selected (see ColumnFilterField.test.jsx).
beforeAll(() => {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {};
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
});

// Same fixtures as the legacy shared/UnifiedDocumentTable.test.jsx — DocumentalTable
// is the parity-gated successor for that component's table slice (column filters,
// row rendering, row actions). KPI chips / legal-mode switch / entry sheet moved to
// DocumentalToolbar and DocumentEntrySheet in later phases and are not this
// organism's responsibility.
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
  summary: { totalRequirements: 3, missing: 1, pendingScan: 1, present: 1 },
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

const DEFAULT_FILTERS = { document: '', vr: '', mediums: [], statuses: [] };

function buildRows(entries = baseEntries, legal = null) {
  const rows = buildDocumentTableRows(entries);
  return legal ? decorateDocumentTableRowsWithLegalForm(rows, legal) : rows;
}

function renderTable(props = {}) {
  return render(
    <DocumentalTable
      rows={[]}
      loading={false}
      canManage={false}
      filters={DEFAULT_FILTERS}
      vrOptions={[]}
      onFilterChange={vi.fn()}
      onRowAction={vi.fn()}
      {...props}
    />,
  );
}

describe('DocumentalTable', () => {
  it('shows a loading skeleton and no data rows while loading', () => {
    renderTable({ loading: true });

    expect(screen.getAllByTestId('documental-table-skeleton-row').length).toBeGreaterThan(0);
    expect(screen.queryByText('No hay documentos registrados')).not.toBeInTheDocument();
  });

  it('shows the empty state when there are no rows and it is not loading', () => {
    renderTable({ rows: [] });

    expect(screen.getByText('No hay documentos registrados')).toBeInTheDocument();
  });

  it('renders document, VR, date and folios for each row', () => {
    renderTable({ rows: buildRows() });

    expect(screen.getByText('Documento de identidad digital')).toBeInTheDocument();
    expect(screen.getByText('DOC-003')).toBeInTheDocument();
    expect(screen.getByText('VR26-2330')).toBeInTheDocument();
    expect(screen.getByText('2026-06-01')).toBeInTheDocument();
  });

  it('shows "No aplica" scan status for a digital-only row (parity: DOCUMENT_ORIGIN_STATE digital never requires scanning)', () => {
    renderTable({ rows: buildRows() });

    expect(screen.getByText('No aplica')).toBeInTheDocument();
  });

  it('parity (UnifiedDocumentTable.test.jsx, same fixtures): keeps the legal-form source label visible per row, including synthetic requirement rows', () => {
    renderTable({ rows: buildRows(baseEntries, legalFormResult) });

    expect(screen.getAllByText('Snapshot activo').length).toBeGreaterThan(0);
    expect(screen.getByText('Formulario único nacional')).toBeInTheDocument();
    expect(screen.getAllByText('Fila sintética').length).toBeGreaterThan(0);
  });

  it('parity: a synthetic legal-form row keeps history/evaluation available but never allows edit, even for a manager', async () => {
    const user = userEvent.setup();
    const onRowAction = vi.fn();
    const rows = buildRows(baseEntries, legalFormResult);
    const syntheticRow = rows.find((row) => row.isPreviewRow);

    renderTable({ rows: [syntheticRow], canManage: true, onRowAction });

    const historyButton = screen.getByRole('button', { name: 'Consultar entradas históricas' });
    const editButton = screen.getByRole('button', { name: 'Editar entradas digitales' });
    const evaluationButton = screen.getByRole('button', { name: 'Ver evaluación documental' });

    expect(historyButton).toBeEnabled();
    expect(evaluationButton).toBeEnabled();
    expect(editButton).toBeDisabled();

    await user.click(historyButton);
    expect(onRowAction).toHaveBeenCalledWith(syntheticRow, 'history');

    await user.click(evaluationButton);
    expect(onRowAction).toHaveBeenCalledWith(syntheticRow, 'evaluation');
  });

  it('enables edit only when canManage is true and the group has at least one editable entry', () => {
    const rows = buildRows();
    const { rerender } = renderTable({ rows, canManage: false });

    expect(screen.getByRole('button', { name: 'Editar entradas digitales' })).toBeDisabled();

    rerender(
      <DocumentalTable
        rows={rows}
        loading={false}
        canManage
        filters={DEFAULT_FILTERS}
        vrOptions={[]}
        onFilterChange={vi.fn()}
        onRowAction={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Editar entradas digitales' })).toBeEnabled();
  });

  it('calls onRowAction with the row and "edit" when a manager clicks edit', async () => {
    const user = userEvent.setup();
    const onRowAction = vi.fn();
    const rows = buildRows();

    renderTable({ rows, canManage: true, onRowAction });
    await user.click(screen.getByRole('button', { name: 'Editar entradas digitales' }));

    expect(onRowAction).toHaveBeenCalledWith(rows[0], 'edit');
  });

  it('forwards document search input changes without filtering rows itself (filtering stays owned by the hook)', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();
    const rows = buildRows();

    renderTable({ rows, onFilterChange });
    await user.type(screen.getByPlaceholderText('Buscar...'), 'x');

    expect(onFilterChange).toHaveBeenCalledWith('document', 'x');
    expect(screen.getByText('Documento de identidad digital')).toBeInTheDocument();
  });

  it('shows the VR select options passed via vrOptions and forwards a selection', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();
    const rows = buildRows();

    renderTable({
      rows,
      onFilterChange,
      vrOptions: [{ value: 'VR26-2330', label: 'VR26-2330', count: 1 }],
    });

    const vrCombobox = screen.getAllByRole('combobox')[0];
    await user.click(vrCombobox);
    await user.click(await screen.findByRole('option', { name: 'VR26-2330 (1)' }));

    expect(onFilterChange).toHaveBeenCalledWith('vr', 'VR26-2330');
  });

  it('shows both medium indicators for a document with a physical and a digital entry', () => {
    // groupDocumentEntries reads originState per top-level entry (not per nested
    // `sources` item), so physical + digital presence needs two entries that
    // share the same documentCode/documentName to land in the same group.
    const mixedEntries = [
      {
        entryId: 'source:fun_6:1',
        documentCode: 'DOC-010',
        documentName: 'Certificado mixto',
        originState: DOCUMENT_ORIGIN_STATE.DIGITAL,
        date: '2026-05-01',
        time: '08:00',
        summary: { sourceCount: 1, foliosDigital: 1, foliosPhysical: 0, foliosTotal: 1 },
        sources: [{
          entryId: 'fun6:1', sourceTable: 'fun_6', originState: DOCUMENT_ORIGIN_STATE.DIGITAL,
          documentCode: 'DOC-010', documentName: 'Certificado mixto', vr: 'VR26-0100', date: '2026-05-01', time: '08:00', pages: 1, canEdit: true,
        }],
      },
      {
        entryId: 'source:fun_6:2',
        documentCode: 'DOC-010',
        documentName: 'Certificado mixto',
        originState: DOCUMENT_ORIGIN_STATE.PHYSICAL,
        date: '2026-04-20',
        time: '10:00',
        summary: { sourceCount: 1, foliosDigital: 0, foliosPhysical: 2, foliosTotal: 2 },
        sources: [{
          entryId: 'fun6:2', sourceTable: 'fun_6', originState: DOCUMENT_ORIGIN_STATE.PHYSICAL,
          documentCode: 'DOC-010', documentName: 'Certificado mixto', vr: 'VR26-0100', date: '2026-04-20', time: '10:00', pages: 2, canEdit: true,
        }],
      },
    ];

    renderTable({ rows: buildRows(mixedEntries) });

    expect(screen.getAllByTestId('medium-indicator').length).toBe(2);
  });

  it('shows the digital and physical folio counts for a row', () => {
    const mixedEntries = [
      {
        entryId: 'source:fun_6:1',
        documentCode: 'DOC-010',
        documentName: 'Certificado mixto',
        originState: DOCUMENT_ORIGIN_STATE.PHYSICAL,
        date: '2026-05-01',
        time: '08:00',
        summary: { sourceCount: 1, foliosDigital: 3, foliosPhysical: 5, foliosTotal: 8 },
        sources: [{
          entryId: 'fun6:1', sourceTable: 'fun_6', originState: DOCUMENT_ORIGIN_STATE.PHYSICAL,
          documentCode: 'DOC-010', documentName: 'Certificado mixto', vr: 'VR26-0100', date: '2026-05-01', time: '08:00', pages: 5, canEdit: false,
        }],
      },
    ];

    renderTable({ rows: buildRows(mixedEntries) });

    expect(screen.getByTestId('folio-split-cell')).toBeInTheDocument();
  });
});
