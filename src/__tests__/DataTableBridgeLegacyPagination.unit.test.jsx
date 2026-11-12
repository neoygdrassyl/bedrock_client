import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DataTable from '@/shared/components/data-table-bridge';

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

  describe('automatic pagination (the `pagination` prop is omitted)', () => {
    const rows = (count) => data.slice(0, count);
    const queryPager = () => screen.queryByRole('navigation', { name: 'Paginación de la tabla' });

    it('shows every row and no paginator up to 10 rows', () => {
      render(<DataTable columns={columns} data={rows(10)} />);

      expect(screen.getByText('Registro 10')).toBeInTheDocument();
      expect(queryPager()).not.toBeInTheDocument();
    });

    it('paginates 10 per page from the eleventh row on and reaches the rest through the paginator', async () => {
      const user = userEvent.setup();
      render(<DataTable columns={columns} data={rows(11)} />);

      const pager = queryPager();
      expect(pager).toHaveTextContent('1–10 de 11');
      expect(within(pager).getByLabelText('Filas por página')).toHaveValue('10');
      expect(screen.getByText('Registro 10')).toBeInTheDocument();
      expect(screen.queryByText('Registro 11')).not.toBeInTheDocument();

      await user.click(within(pager).getByRole('button', { name: 'Página siguiente' }));

      expect(screen.getByText('Registro 11')).toBeInTheDocument();
      expect(screen.queryByText('Registro 10')).not.toBeInTheDocument();
      expect(pager).toHaveTextContent('11–11 de 11');
    });

    it('renders every row when the consumer opts out with pagination={false}', () => {
      render(<DataTable columns={columns} data={data} pagination={false} />);

      expect(screen.getByText('Registro 1')).toBeInTheDocument();
      expect(screen.getByText('Registro 25')).toBeInTheDocument();
      expect(queryPager()).not.toBeInTheDocument();
    });

    it('goes back to the first page when the number of rows changes', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<DataTable columns={columns} data={data} />);

      await user.click(screen.getByRole('button', { name: 'Página siguiente' }));
      expect(screen.getByText('Registro 11')).toBeInTheDocument();

      rerender(<DataTable columns={columns} data={rows(12)} />);

      expect(screen.getByText('Registro 1')).toBeInTheDocument();
      expect(screen.queryByText('Registro 11')).not.toBeInTheDocument();
      expect(queryPager()).toHaveTextContent('1–10 de 12');
    });
  });
});
