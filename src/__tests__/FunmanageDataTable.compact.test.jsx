import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { FunmanageDataTable } from '@/app/pages/user/fun_forms/components/FunmanageDataTable';

function renderCompactTable(props = {}) {
  const defaultProps = {
    data: [
      {
        id: 101,
        rowId: 101,
        radicado: '2026-00123',
        phaseText: 'Estudio y Observaciones',
        phaseTooltip: 'Estudio y Observaciones',
        currentActor: 'cur',
        curValue: '4/10',
        solValue: '0/0',
        _bookmarkState: { personal: false, team: false, any: false, mode: 'none' },
        _bookmarked: false,
      },
    ],
    totalRows: 1,
    page: 1,
    pageSize: 12,
    loading: false,
    error: null,
    search: '',
    sorting: [],
    onSearchChange: vi.fn(),
    onSortingChange: vi.fn(),
    onPageChange: vi.fn(),
    onRetry: vi.fn(),
    onViewDetail: vi.fn(),
    onOpenWorkspace: vi.fn(),
    onToggleBookmarkScope: vi.fn(),
    ...props,
  };

  const view = render(
    <MemoryRouter>
      <FunmanageDataTable {...defaultProps} />
    </MemoryRouter>
  );

  return { ...view, props: defaultProps };
}

describe('FunmanageDataTable compact', () => {
  it('renders only the compact headers and row content', () => {
    renderCompactTable();

    expect(screen.getByRole('button', { name: /ordenar por radicado/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ordenar por fase/i })).toBeInTheDocument();
    expect(screen.getByText('Estado')).toBeInTheDocument();
    expect(screen.getByText('Acciones')).toBeInTheDocument();

    expect(screen.queryByText('Alarma')).not.toBeInTheDocument();
    expect(screen.queryByText('Semáforo')).not.toBeInTheDocument();
    expect(screen.queryByText('Solicitante')).not.toBeInTheDocument();

    expect(screen.getByTestId('radicado-value-101')).toHaveTextContent('2026-00123');
    expect(screen.getByTestId('phase-text-101')).toHaveTextContent('Estudio y Observaciones');
    expect(screen.getByTestId('status-cur-value-101')).toHaveTextContent('4/10');
    expect(screen.getByTestId('status-sol-value-101')).toHaveTextContent('0/0');
    expect(screen.getByTestId('row-preview-101')).toBeInTheDocument();
    expect(screen.getByTestId('row-fullscreen-101')).toBeInTheDocument();
  });

  it('shows fallback badge when radicado is missing', () => {
    renderCompactTable({
      data: [
        {
          id: 202,
          rowId: 202,
          radicado: null,
          phaseText: 'Sin fase',
          phaseTooltip: 'Sin fase',
          currentActor: 'sol',
          curValue: '0/0',
          solValue: '3/8',
          _bookmarkState: { personal: true, team: false, any: true, mode: 'personal' },
          _bookmarked: true,
        },
      ],
    });

    expect(screen.getByText('Falta radicación')).toBeInTheDocument();
    expect(screen.getByTestId('status-sol-value-202')).toHaveTextContent('3/8');
  });

  it('renders accent bookmark state when row is bookmarked for both scopes', () => {
    renderCompactTable({
      data: [
        {
          id: 303,
          rowId: 303,
          radicado: '2026-00456',
          phaseText: 'En trámite',
          phaseTooltip: 'En trámite',
          currentActor: 'cur',
          curValue: '1/2',
          solValue: '2/3',
          _bookmarkState: { personal: true, team: true, any: true, mode: 'both' },
          _bookmarked: true,
        },
      ],
    });

    expect(screen.getByTestId('bookmark-toggle-303')).toHaveAttribute(
      'title',
      'Destacado para mi y para el equipo',
    );
    expect(screen.getByTestId('bookmark-toggle-303').querySelector('svg')).toHaveClass(
      'text-accent',
    );
  });

  it('keeps row click separate from bookmark and action buttons', async () => {
    const user = userEvent.setup();
    const onViewDetail = vi.fn();
    const onOpenWorkspace = vi.fn();
    const onToggleBookmarkScope = vi.fn();

    renderCompactTable({ onViewDetail, onOpenWorkspace, onToggleBookmarkScope });

    await user.click(screen.getByTestId('bookmark-toggle-101'));
    expect(onToggleBookmarkScope).toHaveBeenCalledTimes(1);
    expect(onToggleBookmarkScope).toHaveBeenCalledWith(
      expect.objectContaining({ rowId: 101 }),
      'personal',
      true,
    );
    expect(onViewDetail).not.toHaveBeenCalled();
    expect(onOpenWorkspace).not.toHaveBeenCalled();

    await user.click(screen.getByTestId('row-preview-101'));
    expect(onViewDetail).toHaveBeenCalledTimes(1);
    expect(onOpenWorkspace).not.toHaveBeenCalled();

    await user.click(screen.getByTestId('row-fullscreen-101'));
    expect(onOpenWorkspace).toHaveBeenCalledTimes(1);
    expect(onViewDetail).toHaveBeenCalledTimes(1);

    await user.click(screen.getByTestId('table-row-0'));
    expect(onViewDetail).toHaveBeenCalledTimes(2);
  });
});
