import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable } from '@/components/data-table';

const sampleColumns = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Nombre' },
  { accessorKey: 'status', header: 'Estado' },
];

const sampleData = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  name: `Licencia ${i + 1}`,
  status: i % 2 === 0 ? 'Activa' : 'Inactiva',
}));

describe('DataTable', () => {
  it('renders column headers', () => {
    render(<DataTable columns={sampleColumns} data={sampleData.slice(0, 5)} />);
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Nombre')).toBeInTheDocument();
    expect(screen.getByText('Estado')).toBeInTheDocument();
  });

  it('renders row data', () => {
    render(<DataTable columns={sampleColumns} data={sampleData.slice(0, 5)} />);
    expect(screen.getByText('Licencia 1')).toBeInTheDocument();
    expect(screen.getByText('Licencia 5')).toBeInTheDocument();
  });

  it('shows empty message when data is empty', () => {
    render(
      <DataTable columns={sampleColumns} data={[]} emptyMessage="Sin registros" />
    );
    expect(screen.getByText('Sin registros')).toBeInTheDocument();
  });

  it('paginates data with default page size', () => {
    render(<DataTable columns={sampleColumns} data={sampleData} pagination />);
    // Default page size is 20, so "Licencia 21" should NOT be on page 1
    expect(screen.getByText('Licencia 1')).toBeInTheDocument();
    expect(screen.getByText('Licencia 20')).toBeInTheDocument();
    expect(screen.queryByText('Licencia 21')).not.toBeInTheDocument();
  });

  it('filters data with search input', async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        columns={sampleColumns}
        data={sampleData.slice(0, 10)}
        searchable
        searchPlaceholder="Buscar..."
      />
    );

    const searchInput = screen.getByPlaceholderText('Buscar...');
    await user.type(searchInput, 'Licencia 3');

    expect(screen.getByText('Licencia 3')).toBeInTheDocument();
    expect(screen.queryByText('Licencia 1')).not.toBeInTheDocument();
  });

  it('shows loading skeleton when loading prop is true', () => {
    render(<DataTable columns={sampleColumns} data={[]} loading />);
    // Skeleton renders placeholder rows
    const rows = document.querySelectorAll('tbody tr');
    expect(rows.length).toBeGreaterThan(0);
  });
});
