import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

vi.mock('@/components/data-table-bridge', () => ({
  __esModule: true,
  default: ({ columns, data, noDataComponent }) => (
    <table>
      <thead>
        <tr>{columns.map((column) => <th key={column.name}>{column.name}</th>)}</tr>
      </thead>
      <tbody>
        {data.length
          ? data.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => <td key={column.name}>{column.cell(row)}</td>)}
            </tr>
          ))
          : <tr><td colSpan={columns.length}>{noDataComponent}</td></tr>}
      </tbody>
    </table>
  ),
}));

import BlueprintTable from '../app/pages/user/records/arc/components/BlueprintTable';

describe('BlueprintTable', () => {
  test('renders plan data and delegates document and row actions', () => {
    const row = { id: 9, id_public: 'A-01', scale: '1:100', use: 'Planta arquitectónica' };
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const renderDocument = vi.fn(() => <span>Documento asociado</span>);

    render(
      <BlueprintTable
        rows={[row]}
        renderDocument={renderDocument}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText('A-01')).toBeInTheDocument();
    expect(screen.getByText('1:100')).toBeInTheDocument();
    expect(screen.getByText('Planta arquitectónica')).toBeInTheDocument();
    expect(screen.getByText('Documento asociado')).toBeInTheDocument();
    expect(renderDocument).toHaveBeenCalledWith(row);

    fireEvent.click(screen.getByRole('button', { name: 'Editar plano A-01' }));
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar plano A-01' }));

    expect(onEdit).toHaveBeenCalledWith(row);
    expect(onDelete).toHaveBeenCalledWith(row);
  });

  test('shows the established empty state', () => {
    render(
      <BlueprintTable
        rows={[]}
        renderDocument={() => null}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('No hay Items')).toBeInTheDocument();
  });
});
