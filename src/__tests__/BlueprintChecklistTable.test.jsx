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
            <tr key={row.id ?? row.v}>
              {columns.map((column) => <td key={column.name}>{column.cell(row)}</td>)}
            </tr>
          ))
          : <tr><td colSpan={columns.length}>{noDataComponent}</td></tr>}
      </tbody>
    </table>
  ),
}));

import BlueprintChecklistTable from '../app/pages/user/records/arc/components/BlueprintChecklistTable';

describe('BlueprintChecklistTable', () => {
  test('renders editable plan quantity and evaluation controls with the shared table design', () => {
    const onSave = vi.fn();

    render(
      <BlueprintChecklistTable
        items={[
          { name: 'Arquitectónicos', v: 0, c: 0 },
          { name: 'Observaciones adicionales', v: 1, open: true },
        ]}
        values={['29', 'Revisar escala de la fachada']}
        checks={['1']}
        getSelectClassName={vi.fn(() => 'form-select text-success form-select-sm')}
        onSave={onSave}
      />,
    );

    expect(screen.getByRole('columnheader', { name: 'PLANO' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'CANT.' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'EVA.' })).toBeInTheDocument();

    const quantity = screen.getByLabelText('Cantidad de Arquitectónicos');
    const evaluation = screen.getByLabelText('Evaluación de Arquitectónicos');
    const observations = screen.getByLabelText('Observaciones adicionales');

    expect(quantity).toHaveAttribute('id', 'blue_prints_values_0');
    expect(quantity).toHaveValue(29);
    expect(evaluation).toHaveValue('1');
    expect(observations).toHaveAttribute('id', 'blue_prints_values_1');

    fireEvent.blur(quantity);
    fireEvent.change(evaluation, { target: { value: '2' } });
    fireEvent.blur(observations);

    expect(onSave).toHaveBeenCalledTimes(3);
  });
});
