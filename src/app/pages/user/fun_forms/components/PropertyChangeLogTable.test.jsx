import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import PropertyChangeLogTable from './PropertyChangeLogTable.jsx';

describe('PropertyChangeLogTable', () => {
  const props = {
    entries: [],
    drafts: [],
    loading: false,
    error: '',
    deletingEntryId: null,
    onDraftChange: vi.fn(),
    onPersistedInputChange: vi.fn(),
    onPersistedChange: vi.fn(),
    onDelete: vi.fn(),
  };

  it('keeps its structure visible while the saved history is empty', () => {
    render(<PropertyChangeLogTable {...props} />);

    expect(screen.getByRole('region', { name: 'Bitácora de cambios de Información del Predio' })).toBeInTheDocument();
    expect(screen.getByText('No hay cambios registrados.')).toBeInTheDocument();
  });

  it('renders the requested audit columns for persisted property changes', () => {
    render(<PropertyChangeLogTable
      {...props}
      requestResponsibleName="Ana López"
      entries={[{
        id: 12,
        targetId: '2.1 Dirección actual',
        createdAt: '2026-09-16T12:00:00.000Z',
        responsibleName: 'Ana López',
        category: 'MODIFICACION',
        updateDetail: 'Cambio de nomenclatura',
        support: 'Plano actualizado',
        receiptStatus: 'LYDF',
      }]}
    />);

    ['ID', 'FECHA', 'RESPONSABLE', 'CATEGORÍA', 'ACTUALIZACIÓN', 'SOPORTE', 'RADICACIÓN', 'ACCIÓN'].forEach((column) => {
      expect(screen.getByRole('columnheader', { name: column })).toBeInTheDocument();
    });
    expect(screen.queryByRole('columnheader', { name: 'VR' })).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('Cambio de nomenclatura')).toBeInTheDocument();
    expect(screen.getByText('2.1 Dirección actual')).toBeInTheDocument();
    expect(screen.getByText('Ana López')).toBeInTheDocument();
  });

  it('shows the request responsible instead of the change actor for persisted and draft property changes', () => {
    render(<PropertyChangeLogTable
      {...props}
      requestResponsibleName="María Pérez"
      drafts={[{
        targetKey: 'direccion',
        targetId: '2.1 Dirección actual',
        responsibleName: 'Usuario borrador',
        detectedAt: '2026-09-16T12:00:00.000Z',
      }]}
      entries={[{
        id: 12,
        targetId: '2.2 Matrícula actual',
        responsibleName: 'Usuario que guardó el cambio',
        category: 'MODIFICACION',
      }]}
    />);

    expect(screen.getAllByText('María Pérez')).toHaveLength(2);
    expect(screen.queryByText('Usuario borrador')).not.toBeInTheDocument();
    expect(screen.queryByText('Usuario que guardó el cambio')).not.toBeInTheDocument();
  });

  it('shows a visible fallback when the request responsible is unavailable', () => {
    render(<PropertyChangeLogTable
      {...props}
      entries={[{
        id: 12,
        targetId: '2.2 Matrícula actual',
        responsibleName: 'Usuario que guardó el cambio',
        category: 'MODIFICACION',
      }]}
    />);

    expect(screen.getByText('Sin responsable registrado')).toBeInTheDocument();
    expect(screen.queryByText('Usuario que guardó el cambio')).not.toBeInTheDocument();
  });
});
