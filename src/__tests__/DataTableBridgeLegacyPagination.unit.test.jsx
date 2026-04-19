import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DataTable from '@/components/data-table-bridge';

const columns = [
  { name: 'Nombre', selector: (row) => row.name, sortable: true },
];

const data = Array.from({ length: 25 }, (_, index) => ({
  id: index + 1,
  name: `Registro ${index + 1}`,
}));

describe('DataTable bridge legacy pagination compatibility', () => {
  it('emits the full legacy rdt selector contract used by wrappers', () => {
    const { container } = render(
      <DataTable columns={columns} data={[{ id: 1, name: 'Alpha' }]} pagination />,
    );

    expect(container.querySelector('.rdt_Table')).not.toBeNull();
    expect(container.querySelector('.rdt_TableHead')).not.toBeNull();
    expect(container.querySelector('.rdt_TableHeadRow')).not.toBeNull();
    expect(container.querySelector('.rdt_TableRow')).not.toBeNull();
    expect(container.querySelector('.rdt_TableCell')).not.toBeNull();
  });

  it('uses legacy pagination options to change rows per page', async () => {
    const user = userEvent.setup();
    const { getByLabelText, queryByText, getByText } = render(
      <DataTable
        columns={columns}
        data={data}
        pagination
        paginationPerPage={20}
        paginationRowsPerPageOptions={[10, 20]}
        paginationComponentOptions={{ rowsPerPageText: 'Filas por página:' }}
      />,
    );

    expect(getByText('Registro 20')).toBeInTheDocument();
    const select = getByLabelText('Filas por página:');
    await user.selectOptions(select, '10');
    expect(queryByText('Registro 20')).not.toBeInTheDocument();
    expect(getByText('Registro 10')).toBeInTheDocument();
  });
});
