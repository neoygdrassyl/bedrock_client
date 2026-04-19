import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import DataTable from '@/components/data-table-bridge';

const columns = [
  { name: 'Nombre', selector: (row) => row.name, sortable: true },
];

describe('DataTable bridge legacy compatibility', () => {
  it('preserves legacy rdt selectors for existing automation and wrappers', () => {
    const { container } = render(
      <DataTable columns={columns} data={[{ id: 1, name: 'Alpha' }]} />,
    );

    expect(container.querySelector('.rdt_Table')).not.toBeNull();
    expect(container.querySelector('.rdt_TableRow')).not.toBeNull();
  });

  it('renders custom noDataComponent content instead of replacing it with generic text', () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        noDataComponent={<h4>NO HAY INFORMACION</h4>}
      />,
    );

    expect(screen.getByText('NO HAY INFORMACION')).toBeInTheDocument();
  });
});
