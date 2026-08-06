import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { EditableDataGrid } from '@/components/editable-data-grid';

const columns = [
  { id: 'ref', header: '#', width: 48, sticky: true, align: 'center' },
  { id: 'floor', header: 'Sótano/Piso', width: 132, sticky: true },
  { id: 'area', header: 'Área total neta', width: 140, align: 'right' },
];

const rows = [
  [
    { id: 10, name: 'ref', value: '1', readOnly: true },
    { id: 10, name: 'floor', value: 'Piso 1' },
    { id: 10, name: 'area', value: '4259.45', readOnly: true },
  ],
  [
    { name: 'ref', value: '', readOnly: true, ignore: true },
    { name: 'floor', value: 'TOTALES', readOnly: true, ignore: true },
    { name: 'area', value: '4259.45', readOnly: true, ignore: true },
  ],
];

const pasteColumns = [
  { id: 'a', header: 'A' },
  { id: 'b', header: 'B' },
  { id: 'c', header: 'C' },
];

const pasteRows = [
  [
    { name: 'a', value: 'A1' },
    { name: 'b', value: 'B1', readOnly: true },
    { name: 'c', value: 'C1' },
  ],
  [
    { name: 'a', value: 'A2' },
    { name: 'b', value: 'B2' },
    { name: 'c', value: 'C2' },
  ],
  [
    { name: 'a', value: 'A3' },
    { name: 'b', value: 'B3' },
    { name: 'c', value: 'C3' },
  ],
];

const originalClipboard = navigator.clipboard;

function mockClipboard(clipboard) {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: clipboard,
  });
}

describe('EditableDataGrid', () => {
  test('renders a single-scroll data grid with sticky columns and explicit cell states', () => {
    render(
      <EditableDataGrid
        ariaLabel="Información de áreas"
        columns={columns}
        rows={rows}
        getRowId={(row, index) => row[0]?.id || `row-${index}`}
        onCellsCommit={vi.fn()}
      />,
    );

    const grid = screen.getByRole('grid', { name: 'Información de áreas' });
    expect(grid.closest('[data-editable-grid-scroll]')).toHaveClass('max-h-[70vh]', 'overflow-auto');
    expect(grid.querySelector('thead')).toHaveClass('sticky', 'top-0');
    expect(grid.querySelectorAll('thead th[data-sticky="true"]')).toHaveLength(2);
    expect(grid.querySelectorAll('tbody td.sticky')).toHaveLength(4);
    expect(screen.getByRole('columnheader', { name: 'Sótano/Piso' })).toHaveAttribute('data-sticky', 'true');
    expect(screen.getByRole('gridcell', { name: 'Piso 1' })).toHaveAttribute('data-cell-state', 'editable');
    expect(screen.getAllByRole('gridcell', { name: '4259.45' })[0]).toHaveAttribute('data-cell-state', 'readonly');
    expect(screen.getByRole('row', { name: /TOTALES/ })).toHaveAttribute('data-total-row', 'true');
  });

  test('keeps a sticky cell fixed when it becomes selected', () => {
    render(
      <EditableDataGrid
        ariaLabel="Información de áreas"
        columns={columns}
        rows={rows}
        getRowId={(row, index) => row[0]?.id || `row-${index}`}
        onCellsCommit={vi.fn()}
      />,
    );

    const stickyCell = screen.getByRole('gridcell', { name: 'Piso 1' });
    fireEvent.mouseDown(stickyCell, { button: 0 });

    expect(stickyCell).toHaveClass('sticky');
    expect(stickyCell).not.toHaveClass('relative');
  });

  test('renders custom controls in display mode without spreadsheet interactions', () => {
    const onAction = vi.fn();
    const writeText = vi.fn().mockResolvedValue(undefined);
    mockClipboard({ writeText });
    render(
      <EditableDataGrid
        ariaLabel="Document inventory"
        columns={[{ id: 'status', header: 'Status', width: 140 }]}
        rows={[[{
            name: 'status',
            value: 'APORTO',
            content: <button type="button" onClick={onAction}>APORTO</button>,
            readOnly: true,
            className: 'h-auto whitespace-normal py-2',
        }]]}
        getRowId={(_row, index) => index + 1}
        spreadsheetInteractions={false}
        scrollClassName="max-h-[360px]"
      />,
    );

    const grid = screen.getByRole('grid', { name: 'Document inventory' });
    const cell = screen.getByRole('gridcell', { name: 'APORTO' });
    expect(grid.closest('[data-editable-grid-scroll]')).toHaveClass('max-h-[360px]');
    expect(grid).not.toHaveAttribute('tabindex');
    expect(cell).toHaveClass('h-auto', 'whitespace-normal', 'py-2');

    fireEvent.mouseDown(cell, { button: 0 });
    fireEvent.keyDown(grid, { key: 'c', ctrlKey: true });
    fireEvent.click(screen.getByRole('button', { name: 'APORTO' }));

    expect(cell).toHaveAttribute('aria-selected', 'false');
    expect(writeText).not.toHaveBeenCalled();
    expect(onAction).toHaveBeenCalledTimes(1);
    mockClipboard(originalClipboard);
  });

  test('commits an inline edit without knowing domain persistence', async () => {
    const user = userEvent.setup();
    const onCellsCommit = vi.fn();
    render(
      <EditableDataGrid
        ariaLabel="Información de áreas"
        columns={columns}
        rows={rows}
        getRowId={(row, index) => row[0]?.id || `row-${index}`}
        onCellsCommit={onCellsCommit}
      />,
    );

    await user.dblClick(screen.getByRole('gridcell', { name: 'Piso 1' }));
    const input = screen.getByRole('textbox', { name: 'Editar Sótano/Piso, fila 1' });
    await user.clear(input);
    await user.type(input, 'Piso 2{Enter}');

    expect(onCellsCommit).toHaveBeenCalledWith([
      {
        previousCell: { name: 'floor', ref: 10 },
        newCell: { text: 'Piso 2' },
      },
    ]);
  });

  test('clears a selected editable cell with the keyboard and preserves readonly cells', () => {
    const onCellsCommit = vi.fn();
    render(
      <EditableDataGrid
        ariaLabel="Información de áreas"
        columns={columns}
        rows={rows}
        getRowId={(row, index) => row[0]?.id || `row-${index}`}
        onCellsCommit={onCellsCommit}
      />,
    );

    fireEvent.mouseDown(screen.getByRole('gridcell', { name: 'Piso 1' }), { button: 0 });
    fireEvent.keyDown(screen.getByRole('grid', { name: 'Información de áreas' }), { key: 'Delete' });

    expect(onCellsCommit).toHaveBeenCalledWith([
      {
        previousCell: { name: 'floor', ref: 10 },
        newCell: { text: '' },
      },
    ]);
  });

  test('clears an editable range while skipping readonly and total cells', () => {
    const onCellsCommit = vi.fn();
    render(
      <EditableDataGrid
        ariaLabel="Información de áreas"
        columns={columns}
        rows={rows}
        getRowId={(row, index) => row[0]?.id || `row-${index}`}
        onCellsCommit={onCellsCommit}
      />,
    );

    const grid = screen.getByRole('grid', { name: 'Información de áreas' });
    fireEvent.mouseDown(screen.getByRole('gridcell', { name: 'Piso 1' }), { button: 0 });
    fireEvent.mouseEnter(screen.getAllByRole('gridcell', { name: '4259.45' })[1]);
    fireEvent.mouseUp(grid);
    fireEvent.keyDown(grid, { key: 'Delete' });

    expect(onCellsCommit).toHaveBeenCalledWith([
      {
        previousCell: { name: 'floor', ref: 10 },
        newCell: { text: '' },
      },
    ]);
  });

  test('copies the selected range as tab-separated text', () => {
    render(
      <EditableDataGrid
        ariaLabel="Información de áreas"
        columns={columns}
        rows={rows}
        getRowId={(row, index) => row[0]?.id || `row-${index}`}
        onCellsCommit={vi.fn()}
      />,
    );
    const setData = vi.fn();

    fireEvent.mouseDown(screen.getByRole('gridcell', { name: 'Piso 1' }), { button: 0 });
    fireEvent.copy(screen.getByRole('grid'), { clipboardData: { setData } });

    expect(setData).toHaveBeenCalledWith('text/plain', 'Piso 1');
  });

  test('copies with Ctrl+C through the Clipboard API', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    mockClipboard({ writeText });
    render(
      <EditableDataGrid
        ariaLabel="Paste grid"
        columns={pasteColumns}
        rows={pasteRows}
        getRowId={(_row, index) => index + 1}
        onCellsCommit={vi.fn()}
      />,
    );

    const grid = screen.getByRole('grid', { name: 'Paste grid' });
    fireEvent.mouseDown(screen.getByRole('gridcell', { name: 'A1' }), { button: 0 });
    fireEvent.keyDown(grid, { key: 'c', ctrlKey: true });

    await waitFor(() => expect(writeText).toHaveBeenCalledWith('A1'));
    mockClipboard(originalClipboard);
  });

  test('pastes with Ctrl+V through the Clipboard API', async () => {
    const onCellsCommit = vi.fn();
    mockClipboard({ readText: vi.fn().mockResolvedValue('X\tY') });
    render(
      <EditableDataGrid
        ariaLabel="Paste grid"
        columns={pasteColumns}
        rows={pasteRows}
        getRowId={(_row, index) => index + 1}
        onCellsCommit={onCellsCommit}
      />,
    );

    const grid = screen.getByRole('grid', { name: 'Paste grid' });
    fireEvent.mouseDown(screen.getByRole('gridcell', { name: 'A2' }), { button: 0 });
    fireEvent.keyDown(grid, { key: 'v', ctrlKey: true });

    await waitFor(() => expect(onCellsCommit).toHaveBeenCalledWith([
      { previousCell: { name: 'a', ref: 2 }, newCell: { text: 'X' } },
      { previousCell: { name: 'b', ref: 2 }, newCell: { text: 'Y' } },
    ]));
    mockClipboard(originalClipboard);
  });

  test('commits paste only once when native paste and Clipboard API both fire', async () => {
    const onCellsCommit = vi.fn();
    let resolveClipboard;
    mockClipboard({
      readText: vi.fn(() => new Promise(resolve => { resolveClipboard = resolve; })),
    });
    render(
      <EditableDataGrid
        ariaLabel="Paste grid"
        columns={pasteColumns}
        rows={pasteRows}
        getRowId={(_row, index) => index + 1}
        onCellsCommit={onCellsCommit}
      />,
    );

    const grid = screen.getByRole('grid', { name: 'Paste grid' });
    fireEvent.mouseDown(screen.getByRole('gridcell', { name: 'A2' }), { button: 0 });
    fireEvent.keyDown(grid, { key: 'v', ctrlKey: true });
    fireEvent.paste(grid, { clipboardData: { getData: () => 'X\tY' } });
    resolveClipboard('X\tY');

    await new Promise(resolve => setTimeout(resolve, 0));
    expect(onCellsCommit).toHaveBeenCalledTimes(1);
    mockClipboard(originalClipboard);
  });

  test('shows an active cell, filled range, and continuous perimeter while dragging', () => {
    render(
      <EditableDataGrid
        ariaLabel="Paste grid"
        columns={pasteColumns}
        rows={pasteRows}
        getRowId={(_row, index) => index + 1}
        onCellsCommit={vi.fn()}
      />,
    );

    const firstCell = screen.getByRole('gridcell', { name: 'A1' });
    const lastCell = screen.getByRole('gridcell', { name: 'B2' });
    fireEvent.mouseDown(firstCell, { button: 0 });
    fireEvent.mouseEnter(lastCell);

    expect(firstCell).toHaveClass('bg-white', 'group-hover:bg-white', 'border-l-2', 'border-l-primary', 'border-t-2', 'border-t-primary');
    expect(lastCell).toHaveClass('bg-slate-200/90', 'group-hover:bg-slate-200/90', 'border-r-2', 'border-r-primary', 'border-b-2', 'border-b-primary');
    expect(firstCell).not.toHaveClass('bg-card');
  });

  test('extends the current selection with shift-click', () => {
    render(
      <EditableDataGrid
        ariaLabel="Paste grid"
        columns={pasteColumns}
        rows={pasteRows}
        getRowId={(_row, index) => index + 1}
        onCellsCommit={vi.fn()}
      />,
    );

    const grid = screen.getByRole('grid', { name: 'Paste grid' });
    fireEvent.mouseDown(screen.getByRole('gridcell', { name: 'A1' }), { button: 0 });
    fireEvent.click(screen.getByRole('gridcell', { name: 'A1' }));
    fireEvent.mouseDown(screen.getByRole('gridcell', { name: 'B2' }), { button: 0, shiftKey: true });
    fireEvent.click(screen.getByRole('gridcell', { name: 'B2' }), { shiftKey: true });

    expect(grid.querySelectorAll('[role="gridcell"][aria-selected="true"]')).toHaveLength(4);
  });

  test('exposes keyboard navigation and supports F2, Escape, and Enter editing', () => {
    const onCellsCommit = vi.fn();
    render(
      <EditableDataGrid
        ariaLabel="Información de áreas"
        columns={columns}
        rows={rows}
        getRowId={(row, index) => row[0]?.id || `row-${index}`}
        onCellsCommit={onCellsCommit}
      />,
    );

    const grid = screen.getByRole('grid', { name: 'Información de áreas' });
    fireEvent.mouseDown(screen.getByRole('gridcell', { name: 'Piso 1' }), { button: 0 });
    expect(grid.getAttribute('aria-activedescendant')).toMatch(/cell-0-1$/);

    fireEvent.keyDown(grid, { key: 'ArrowRight' });
    expect(grid.getAttribute('aria-activedescendant')).toMatch(/cell-0-2$/);
    fireEvent.keyDown(grid, { key: 'ArrowLeft' });
    fireEvent.keyDown(grid, { key: 'F2' });

    let input = screen.getByRole('textbox', { name: 'Editar Sótano/Piso, fila 1' });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(onCellsCommit).not.toHaveBeenCalled();

    fireEvent.keyDown(grid, { key: 'Enter' });
    input = screen.getByRole('textbox', { name: 'Editar Sótano/Piso, fila 1' });
    fireEvent.change(input, { target: { value: 'Piso 2' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onCellsCommit).toHaveBeenCalledWith([
      {
        previousCell: { name: 'floor', ref: 10 },
        newCell: { text: 'Piso 2' },
      },
    ]);
  });

  test('pastes tabular values into the selected range while skipping readonly cells', () => {
    const onCellsCommit = vi.fn();
    render(
      <EditableDataGrid
        ariaLabel="Información de áreas"
        columns={columns}
        rows={rows}
        getRowId={(row, index) => row[0]?.id || `row-${index}`}
        onCellsCommit={onCellsCommit}
      />,
    );

    fireEvent.mouseDown(screen.getByRole('gridcell', { name: 'Piso 1' }), { button: 0 });
    fireEvent.paste(screen.getByRole('grid', { name: 'Información de áreas' }), {
      clipboardData: { getData: () => 'Piso 3\t999.00' },
    });

    expect(onCellsCommit).toHaveBeenCalledWith([
      {
        previousCell: { name: 'floor', ref: 10 },
        newCell: { text: 'Piso 3' },
      },
    ]);
  });

  test('tiles one pasted value across a larger selection while skipping readonly cells', () => {
    const onCellsCommit = vi.fn();
    render(
      <EditableDataGrid
        ariaLabel="Paste grid"
        columns={pasteColumns}
        rows={pasteRows}
        getRowId={(_row, index) => index + 1}
        onCellsCommit={onCellsCommit}
      />,
    );

    const grid = screen.getByRole('grid', { name: 'Paste grid' });
    fireEvent.mouseDown(screen.getByRole('gridcell', { name: 'A1' }), { button: 0 });
    fireEvent.mouseEnter(screen.getByRole('gridcell', { name: 'B2' }));
    fireEvent.mouseUp(grid);
    fireEvent.paste(grid, { clipboardData: { getData: () => 'X' } });

    expect(onCellsCommit).toHaveBeenCalledTimes(1);
    expect(onCellsCommit).toHaveBeenCalledWith([
      { previousCell: { name: 'a', ref: 1 }, newCell: { text: 'X' } },
      { previousCell: { name: 'a', ref: 2 }, newCell: { text: 'X' } },
      { previousCell: { name: 'b', ref: 2 }, newCell: { text: 'X' } },
    ]);
  });

  test('expands a single-cell selection to a pasted matrix and commits in row-major order', () => {
    const onCellsCommit = vi.fn();
    render(
      <EditableDataGrid
        ariaLabel="Paste grid"
        columns={pasteColumns}
        rows={pasteRows}
        getRowId={(_row, index) => index + 1}
        onCellsCommit={onCellsCommit}
      />,
    );

    const grid = screen.getByRole('grid', { name: 'Paste grid' });
    fireEvent.mouseDown(screen.getByRole('gridcell', { name: 'A2' }), { button: 0 });
    fireEvent.paste(grid, { clipboardData: { getData: () => '1\t2\n3\t4' } });

    expect(onCellsCommit).toHaveBeenCalledWith([
      { previousCell: { name: 'a', ref: 2 }, newCell: { text: '1' } },
      { previousCell: { name: 'b', ref: 2 }, newCell: { text: '2' } },
      { previousCell: { name: 'a', ref: 3 }, newCell: { text: '3' } },
      { previousCell: { name: 'b', ref: 3 }, newCell: { text: '4' } },
    ]);
    expect(grid.querySelectorAll('[role="gridcell"][aria-selected="true"]')).toHaveLength(4);
  });

  test('clips a pasted matrix at the bottom and right grid bounds', () => {
    const onCellsCommit = vi.fn();
    render(
      <EditableDataGrid
        ariaLabel="Paste grid"
        columns={pasteColumns}
        rows={pasteRows}
        getRowId={(_row, index) => index + 1}
        onCellsCommit={onCellsCommit}
      />,
    );

    const grid = screen.getByRole('grid', { name: 'Paste grid' });
    fireEvent.mouseDown(screen.getByRole('gridcell', { name: 'B2' }), { button: 0 });
    fireEvent.paste(grid, { clipboardData: { getData: () => '1\t2\t3\n4\t5\t6\n7\t8\t9' } });

    expect(onCellsCommit).toHaveBeenCalledWith([
      { previousCell: { name: 'b', ref: 2 }, newCell: { text: '1' } },
      { previousCell: { name: 'c', ref: 2 }, newCell: { text: '2' } },
      { previousCell: { name: 'b', ref: 3 }, newCell: { text: '4' } },
      { previousCell: { name: 'c', ref: 3 }, newCell: { text: '5' } },
    ]);
    expect(grid.querySelectorAll('[role="gridcell"][aria-selected="true"]')).toHaveLength(4);
  });

  test('keeps pasted positions while skipping missing, readonly, unnamed, and summary cells', () => {
    const onCellsCommit = vi.fn();
    const positionalColumns = ['A', 'B', 'C', 'D', 'E'].map(header => ({ id: header, header }));
    const positionalRows = [
      [
        { name: 'a', value: 'A1' },
        { name: 'b', value: 'B1', readOnly: true },
        undefined,
        { value: 'D1' },
        { name: 'e', value: 'E1' },
      ],
      [
        { name: 'a', value: 'SUMMARY', ignore: true },
        { name: 'b', value: 'B2' },
        { name: 'c', value: 'C2' },
        { name: 'd', value: 'D2' },
        { name: 'e', value: 'E2' },
      ],
    ];
    render(
      <EditableDataGrid
        ariaLabel="Positional paste grid"
        columns={positionalColumns}
        rows={positionalRows}
        getRowId={(_row, index) => index + 1}
        onCellsCommit={onCellsCommit}
      />,
    );

    const grid = screen.getByRole('grid', { name: 'Positional paste grid' });
    fireEvent.mouseDown(screen.getByRole('gridcell', { name: 'A1' }), { button: 0 });
    fireEvent.paste(grid, {
      clipboardData: { getData: () => '1\t2\t3\t4\t5\n6\t7\t8\t9\t10' },
    });

    expect(onCellsCommit).toHaveBeenCalledWith([
      { previousCell: { name: 'a', ref: 1 }, newCell: { text: '1' } },
      { previousCell: { name: 'e', ref: 1 }, newCell: { text: '5' } },
    ]);
  });

  test('copies a reverse-dragged rectangle as normalized TSV including readonly values', () => {
    render(
      <EditableDataGrid
        ariaLabel="Paste grid"
        columns={pasteColumns}
        rows={pasteRows}
        getRowId={(_row, index) => index + 1}
        onCellsCommit={vi.fn()}
      />,
    );
    const grid = screen.getByRole('grid', { name: 'Paste grid' });
    const setData = vi.fn();

    fireEvent.mouseDown(screen.getByRole('gridcell', { name: 'B2' }), { button: 0 });
    fireEvent.mouseEnter(screen.getByRole('gridcell', { name: 'A1' }));
    fireEvent.mouseUp(grid);
    fireEvent.copy(grid, { clipboardData: { setData } });

    expect(setData).toHaveBeenCalledWith('text/plain', 'A1\tB1\nA2\tB2');
  });
});
