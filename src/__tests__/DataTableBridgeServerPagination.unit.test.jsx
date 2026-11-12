import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DataTable from '@/shared/components/data-table-bridge';

const columns = [
  { name: 'Nombre', selector: (row) => row.name, sortable: true },
];

// In server mode the component only ever receives the current page, never the
// whole dataset — that is the entire point of the mode.
const pageOne = Array.from({ length: 20 }, (_, index) => ({
  id: index + 1,
  name: `Registro ${index + 1}`,
}));

function renderServerTable(overrides = {}) {
  return render(
    <DataTable
      columns={columns}
      data={pageOne}
      pagination
      paginationServer
      paginationTotalRows={21984}
      paginationPerPage={20}
      paginationRowsPerPageOptions={[20, 50]}
      paginationComponentOptions={{ rowsPerPageText: 'Filas por página:' }}
      {...overrides}
    />,
  );
}

const pager = () => screen.getByRole('navigation', { name: 'Paginación de la tabla' });
const pagerButton = (name) => within(pager()).getByRole('button', { name });

describe('DataTable bridge server-side pagination', () => {
  it('reports the server total, not the length of the page it was handed', () => {
    renderServerTable();

    expect(pager()).toHaveTextContent('1–20 de 21984');
  });

  it('derives the page count from the server total so the last page is reachable', () => {
    const { getByText } = renderServerTable();

    // 21984 rows / 20 per page = 1100 pages.
    expect(getByText(/Página 1 de 1100/)).toBeInTheDocument();
  });

  it('does not slice the page it was given (all 20 rows stay visible)', () => {
    const { getByText } = renderServerTable();

    expect(getByText('Registro 1')).toBeInTheDocument();
    expect(getByText('Registro 20')).toBeInTheDocument();
  });

  it('notifies the parent with a 1-based page number when moving forward', async () => {
    const user = userEvent.setup();
    const onChangePage = vi.fn();
    renderServerTable({ onChangePage });

    expect(pagerButton('Primera página')).toBeDisabled();
    expect(pagerButton('Página anterior')).toBeDisabled();

    await user.click(pagerButton('Página siguiente'));

    expect(onChangePage).toHaveBeenCalledTimes(1);
    expect(onChangePage).toHaveBeenCalledWith(2, 21984);
    expect(pager()).toHaveTextContent('21–40 de 21984');
  });

  it('jumps to the last and back to the first page reporting each to the parent', async () => {
    const user = userEvent.setup();
    const onChangePage = vi.fn();
    renderServerTable({ onChangePage });

    await user.click(pagerButton('Última página'));

    expect(onChangePage).toHaveBeenLastCalledWith(1100, 21984);
    // 21984 rows: the last page holds rows 21981 to 21984.
    expect(pager()).toHaveTextContent('21981–21984 de 21984');
    expect(pagerButton('Página siguiente')).toBeDisabled();
    expect(pagerButton('Última página')).toBeDisabled();

    await user.click(pagerButton('Primera página'));

    expect(onChangePage).toHaveBeenLastCalledWith(1, 21984);
    expect(pager()).toHaveTextContent('1–20 de 21984');
  });

  it('notifies the parent when rows per page changes and resets to page 1', async () => {
    const user = userEvent.setup();
    const onChangeRowsPerPage = vi.fn();
    const { getByLabelText } = renderServerTable({ onChangeRowsPerPage });

    await user.selectOptions(getByLabelText('Filas por página:'), '50');

    expect(onChangeRowsPerPage).toHaveBeenCalledWith(50, 1);
  });

  it('follows the parent page number so the indicator does not desync on reset', () => {
    // Regression: sorting resets the parent to page 1, but the bridge kept its
    // own pageIndex and went on displaying the previous page.
    const { getByText, rerender } = render(
      <DataTable
        columns={columns}
        data={pageOne}
        pagination
        paginationServer
        paginationTotalRows={21984}
        paginationPerPage={20}
        paginationPage={5}
      />,
    );

    expect(getByText(/Página 5 de 1100/)).toBeInTheDocument();

    rerender(
      <DataTable
        columns={columns}
        data={pageOne}
        pagination
        paginationServer
        paginationTotalRows={21984}
        paginationPerPage={20}
        paginationPage={1}
      />,
    );

    expect(getByText(/Página 1 de 1100/)).toBeInTheDocument();
  });

  it('reports the sorted column and direction to the parent instead of sorting the page locally', async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();
    const { getByText } = renderServerTable({ sortServer: true, onSort });

    await user.click(getByText('Nombre'));

    expect(onSort).toHaveBeenCalledTimes(1);
    const [column, direction] = onSort.mock.calls[0];
    expect(column.name).toBe('Nombre');
    expect(['asc', 'desc']).toContain(direction);
  });

  it('recomputes the page count when switching back from server to client mode', () => {
    // Regression: the ventanilla flips to client mode while showing search
    // results. The page count kept reporting the server total's page count
    // ("1 registros · Página 1 de 1100") instead of recomputing from the rows.
    const { getByText, rerender } = render(
      <DataTable
        columns={columns}
        data={pageOne}
        pagination
        paginationServer
        paginationTotalRows={21984}
        paginationPerPage={20}
      />,
    );
    expect(getByText(/Página 1 de 1100/)).toBeInTheDocument();

    rerender(
      <DataTable
        columns={columns}
        data={[{ id: 1, name: 'Único resultado' }]}
        pagination
        paginationServer={false}
        paginationTotalRows={1}
        paginationPerPage={20}
      />,
    );

    expect(pager()).toHaveTextContent('1–1 de 1');
    expect(getByText(/Página 1 de 1$/)).toBeInTheDocument();
  });

  it('keeps client-side pagination untouched when paginationServer is not set', async () => {
    const user = userEvent.setup();
    const onChangePage = vi.fn();
    const twentyFive = Array.from({ length: 25 }, (_, i) => ({ id: i + 1, name: `Registro ${i + 1}` }));

    const { getByText, queryByText } = render(
      <DataTable
        columns={columns}
        data={twentyFive}
        pagination
        paginationPerPage={20}
        onChangePage={onChangePage}
      />,
    );

    expect(pager()).toHaveTextContent('1–20 de 25');
    expect(queryByText('Registro 21')).not.toBeInTheDocument();

    await user.click(pagerButton('Página siguiente'));

    // Client mode slices locally and must not call the server callback.
    expect(getByText('Registro 21')).toBeInTheDocument();
    expect(queryByText('Registro 20')).not.toBeInTheDocument();
    expect(pager()).toHaveTextContent('21–25 de 25');
    expect(onChangePage).not.toHaveBeenCalled();
  });
});
