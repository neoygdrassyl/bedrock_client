import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

vi.mock('../app/components/ui', () => ({
  MDBTooltip: ({ children }) => <>{children}</>,
  MDBBtn: ({ children, onClick, ...props }) => (
    <button type="button" onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('react-modal', () => ({
  __esModule: true,
  default: ({ children, isOpen }) => (isOpen ? <div data-testid="docs-modal">{children}</div> : null),
}));

vi.mock('react-data-table-component', () => ({
  __esModule: true,
  default: ({ data = [], columns = [], subHeader, subHeaderComponent, noDataComponent }) => (
    <div data-testid="docs-datatable">
      {subHeader ? subHeaderComponent : null}
      {data.length
        ? data.map((row) => (
            <div key={row.cod} data-testid={`doc-row-${row.cod}`}>
              <span>{row.cod}</span>
              <span>{row.desc}</span>
              {columns.map((column, index) => (
                <div key={`${row.cod}-${index}`}>
                  {column.cell ? column.cell(row) : null}
                </div>
              ))}
            </div>
          ))
        : noDataComponent}
    </div>
  ),
}));

import DOCS_LIST from '../app/pages/user/fun_forms/components/docs_list.component';

describe('DOCS_LIST', () => {
  test('permite filtrar la lista de documentos por codigo', () => {
    render(<DOCS_LIST idRef="docs-field" text="VER LISTA" setValues={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /ver lista/i }));

    expect(screen.getByTestId('doc-row-301')).toBeInTheDocument();
    expect(screen.getByTestId('doc-row-601a')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/buscar/i), {
      target: { value: '601a' },
    });

    expect(screen.getByTestId('doc-row-601a')).toBeInTheDocument();
    expect(screen.queryByTestId('doc-row-301')).not.toBeInTheDocument();
  });
});