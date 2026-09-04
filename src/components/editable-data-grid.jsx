// EditableDataGrid.jsx
// ⚠️ Este componente es agnóstico al contenido: no debe conocer reglas de
// negocio de ninguna tabla que lo consuma. Los cambios de estilo (alturas,
// colores, paddings) son seguros. Cambios en handlers de eventos, en la
// firma de props, o en el formato de `onCellsCommit` pueden romper a
// RECORD_ARC_AREAS_2 (u otras tablas futuras) y requieren revisión aparte.

import React, { useCallback, useId, useMemo, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

const CELL_TONE_CLASSES = {
  blue: 'text-info',
  green: 'text-success',
  orchid: 'text-primary',
  red: 'text-destructive',
  tomato: 'text-primary',
};

const DEFAULT_COLUMN_WIDTH = 100;

function normalizeRange(range) {
  if (!range) return null;
  return {
    startRow: Math.min(range.startRow, range.endRow),
    endRow: Math.max(range.startRow, range.endRow),
    startCol: Math.min(range.startCol, range.endCol),
    endCol: Math.max(range.startCol, range.endCol),
  };
}

function getColumnWidth(column) {
  return column.width || DEFAULT_COLUMN_WIDTH;
}

function getStickyOffsets(columns) {
  const offsets = [];
  let runningOffset = 0;
  for (const column of columns) {
    offsets.push(runningOffset);
    runningOffset += getColumnWidth(column);
  }
  return offsets;
}

function getColumnStyle(column, columnIndex, stickyOffsets) {
  const width = getColumnWidth(column);
  return {
    width,
    minWidth: width,
    maxWidth: width,
    left: column.sticky ? stickyOffsets[columnIndex] : undefined,
  };
}

function isTotalRow(row) {
  return row.some(cell => cell?.ignore);
}

function getHeaderClassName(column) {
  return cn(
    'h-6 !rounded-none border-b border-r border-border bg-slate-200 px-1.5 align-middle text-[11.5px] font-semibold uppercase tracking-[0.035em] text-foreground/80 last:border-r-0 dark:bg-slate-800',
    column.align === 'right' && 'text-right tabular-nums',
    column.align === 'center' && 'text-center',
    column.sticky && 'sticky z-30',
  );
}

function getCellClassName({ column, cell, totalRow, selected, active, selectionEdges, spreadsheetInteractions }) {
  return cn(
    'h-6 !rounded-none border-b border-r border-border px-1.5 align-middle last:border-r-0',
    'overflow-hidden text-ellipsis whitespace-nowrap transition-colors',
    column.align === 'right' && 'text-right tabular-nums',
    column.align === 'center' && 'text-center',
    !spreadsheetInteractions
      ? 'cursor-default bg-card !text-[11px] group-hover:bg-slate-50 [&_*]:!text-[11px] dark:group-hover:bg-slate-800/40'
      : cell.readOnly
      ? 'cursor-default bg-slate-100 text-foreground/70 group-hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:group-hover:bg-slate-800'
      : 'cursor-cell bg-card group-hover:bg-slate-50 dark:group-hover:bg-slate-800/40',
    totalRow && 'bg-slate-300 text-foreground group-hover:bg-slate-300 dark:bg-slate-700 dark:group-hover:bg-slate-700',
    column.sticky && 'sticky z-10 border-r-border',
    cell.className,
    CELL_TONE_CLASSES[cell.color],
    selected && !column.sticky && 'relative',
    selected && 'z-10 bg-slate-200/90 text-foreground group-hover:bg-slate-200/90 dark:bg-slate-700/90 dark:group-hover:bg-slate-700/90',
    active && 'z-20 bg-white group-hover:bg-white dark:bg-slate-800 dark:group-hover:bg-slate-800',
    selectionEdges?.top && 'border-t-2 border-t-primary',
    selectionEdges?.right && 'border-r-2 border-r-primary',
    selectionEdges?.bottom && 'border-b-2 border-b-primary',
    selectionEdges?.left && 'border-l-2 border-l-primary',
  );
}

function serializeRangeToText(rows, range) {
  if (!range) return '';
  return rows.slice(range.startRow, range.endRow + 1).map((row) => (
    row.slice(range.startCol, range.endCol + 1).map(cell => cell?.value ?? '').join('\t')
  )).join('\n');
}

function parseClipboardText(text) {
  return text.replace(/\r/g, '').split('\n')
    .filter((row, index, source) => row || index < source.length - 1)
    .map(row => row.split('\t'));
}

const GridCell = React.memo(function GridCell({
  gridId,
  rowIndex,
  columnIndex,
  column,
  cell,
  cellValue,
  cellState,
  totalRow,
  selected,
  active,
  selectionEdges,
  spreadsheetInteractions,
  editing,
  style,
  onCellMouseDown,
  onCellMouseEnter,
  onCellClick,
  onCellDoubleClick,
  onCellCommit,
  onCellCancelEdit,
}) {
  return (
    <td
      id={`${gridId}-cell-${rowIndex}-${columnIndex}`}
      role="gridcell"
      aria-label={cellValue || `${column.header}, fila ${rowIndex + 1}`}
      aria-readonly={cell.readOnly ? 'true' : 'false'}
      aria-selected={selected ? 'true' : 'false'}
      data-cell-state={cellState}
      data-row-index={rowIndex}
      data-column-index={columnIndex}
      className={getCellClassName({ column, cell, totalRow, selected, active, selectionEdges, spreadsheetInteractions })}
      style={style}
      title={cellValue}
      onMouseDown={onCellMouseDown ? (event) => onCellMouseDown(rowIndex, columnIndex, event) : undefined}
      onMouseEnter={onCellMouseEnter ? () => onCellMouseEnter(rowIndex, columnIndex) : undefined}
      onClick={onCellClick ? (event) => onCellClick(rowIndex, columnIndex, event) : undefined}
      onDoubleClick={onCellDoubleClick ? () => onCellDoubleClick(rowIndex, columnIndex) : undefined}
    >
      {editing ? (
        <input
          type="text"
          autoFocus
          aria-label={`Editar ${column.header}, fila ${rowIndex + 1}`}
          defaultValue={cellValue}
          className="h-4 w-full rounded-none border-0 bg-transparent p-0 text-inherit outline-none ring-0"
          onMouseDown={event => event.stopPropagation()}
          onClick={event => event.stopPropagation()}
          onDoubleClick={event => event.stopPropagation()}
          onFocus={event => event.target.select()}
          onBlur={(event) => onCellCommit(rowIndex, columnIndex, event.target.value, cellValue)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              event.currentTarget.blur();
            }
            if (event.key === 'Escape') {
              event.preventDefault();
              onCellCancelEdit();
            }
          }}
        />
      ) : cell.content !== undefined ? cell.content : cellValue}
    </td>
  );
});

export function EditableDataGrid({
  ariaLabel,
  columns = [],
  rows = [],
  getRowId = (_row, index) => index,
  onCellsCommit,
  emptyMessage = 'No hay datos para mostrar',
  spreadsheetInteractions = true,
  scrollClassName,
  scrollable = true,
  fillWidth = false,
}) {
  const gridId = useId().replaceAll(':', '');
  const gridRef = useRef(null);
  const didDragSelectRef = useRef(false);
  const dragAnchorRef = useRef(null);
  const rowsRef = useRef(rows);
  const getRowIdRef = useRef(getRowId);
  const onCellsCommitRef = useRef(onCellsCommit);
  const pasteShortcutRef = useRef(null);
  const selectedRangeRef = useRef(null);

  rowsRef.current = rows;
  getRowIdRef.current = getRowId;
  onCellsCommitRef.current = onCellsCommit;

  const [selectedRange, setSelectedRangeState] = useState(null);
  const [editingCell, setEditingCell] = useState(null);

  function setSelectedRange(next) {
    selectedRangeRef.current = next;
    setSelectedRangeState(next);
  }

  const stickyOffsets = useMemo(() => getStickyOffsets(columns), [columns]);
  const columnStyles = useMemo(
    () => columns.map((column, index) => getColumnStyle(column, index, stickyOffsets)),
    [columns, stickyOffsets],
  );
  const tableWidth = useMemo(
    () => columns.reduce((total, column) => total + getColumnWidth(column), 0),
    [columns],
  );
  const normalizedSelectedRange = normalizeRange(selectedRange);

  function isCellSelected(rowIndex, columnIndex) {
    const range = normalizedSelectedRange;
    if (!range) return false;
    return rowIndex >= range.startRow && rowIndex <= range.endRow
      && columnIndex >= range.startCol && columnIndex <= range.endCol;
  }

  const getCellReference = useCallback((row, rowIndex) => (
    getRowIdRef.current(row, rowIndex)
  ), []);

  const buildChanges = useCallback((entries) => {
    return entries.flatMap(({ rowIndex, columnIndex, value }) => {
      const row = rowsRef.current[rowIndex];
      const cell = row?.[columnIndex];
      if (!cell || cell.readOnly || !cell.name || cell.ignore || isTotalRow(row)) return [];
      return [{
        previousCell: { name: cell.name, ref: getCellReference(row, rowIndex) },
        newCell: { text: value },
      }];
    });
  }, [getCellReference]);

  const commitChanges = useCallback((entries) => {
    const changes = buildChanges(entries);
    if (changes.length) onCellsCommitRef.current?.(changes);
  }, [buildChanges]);

  const activateCell = useCallback((rowIndex, columnIndex) => {
    gridRef.current?.focus();
    setSelectedRange({ startRow: rowIndex, endRow: rowIndex, startCol: columnIndex, endCol: columnIndex });
  }, []);

  const startEditing = useCallback((rowIndex, columnIndex) => {
    const cell = rowsRef.current[rowIndex]?.[columnIndex];
    if (!cell || cell.readOnly) return;
    activateCell(rowIndex, columnIndex);
    setEditingCell({ row: rowIndex, col: columnIndex });
  }, [activateCell]);

  const handleCellMouseDown = useCallback((rowIndex, columnIndex, event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    didDragSelectRef.current = false;
    setEditingCell(null);
    if (event.shiftKey && selectedRangeRef.current) {
      gridRef.current?.focus();
      setSelectedRange({ ...selectedRangeRef.current, endRow: rowIndex, endCol: columnIndex });
      dragAnchorRef.current = {
        row: selectedRangeRef.current.startRow,
        col: selectedRangeRef.current.startCol,
      };
      return;
    }
    activateCell(rowIndex, columnIndex);
    dragAnchorRef.current = { row: rowIndex, col: columnIndex };
  }, [activateCell]);

  const handleCellMouseEnter = useCallback((rowIndex, columnIndex) => {
    const anchor = dragAnchorRef.current;
    if (!anchor) return;
    didDragSelectRef.current = true;
    setSelectedRange({
      startRow: anchor.row,
      startCol: anchor.col,
      endRow: rowIndex,
      endCol: columnIndex,
    });
  }, []);

  const handleCellClick = useCallback((rowIndex, columnIndex, event) => {
    if (didDragSelectRef.current) {
      didDragSelectRef.current = false;
      return;
    }
    if (event.shiftKey && selectedRangeRef.current) {
      setSelectedRange({ ...selectedRangeRef.current, endRow: rowIndex, endCol: columnIndex });
      return;
    }
    startEditing(rowIndex, columnIndex);
  }, [startEditing]);

  const handleCellDoubleClick = useCallback((rowIndex, columnIndex) => {
    startEditing(rowIndex, columnIndex);
  }, [startEditing]);

  const handleCellCommit = useCallback((rowIndex, columnIndex, value, originalValue) => {
    if (value !== originalValue) {
      commitChanges([{ rowIndex, columnIndex, value }]);
    }
    setEditingCell(null);
  }, [commitChanges]);

  const handleCellCancelEdit = useCallback(() => {
    setEditingCell(null);
    gridRef.current?.focus();
  }, []);

  function handleGridKeyDown(event) {
    if (editingCell || !selectedRange) return;
    const shortcut = event.ctrlKey || event.metaKey ? event.key.toLowerCase() : null;
    if (shortcut === 'c') {
      const text = getSelectedText();
      if (text && typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        void navigator.clipboard.writeText(text).catch(() => {});
      }
      return;
    }
    if (shortcut === 'v') {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.readText) {
        const pasteShortcut = { handled: false, startedAt: Date.now() };
        pasteShortcutRef.current = pasteShortcut;
        void navigator.clipboard.readText()
          .then((text) => {
            if (!text || pasteShortcutRef.current !== pasteShortcut || pasteShortcut.handled) return;
            pasteShortcut.handled = true;
            pasteSelectedText(text);
          })
          .catch(() => {});
      }
      return;
    }

    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      const range = normalizeRange(selectedRange);
      commitChanges(Array.from({ length: range.endRow - range.startRow + 1 }, (_, rowOffset) => (
        Array.from({ length: range.endCol - range.startCol + 1 }, (_unused, colOffset) => ({
          rowIndex: range.startRow + rowOffset,
          columnIndex: range.startCol + colOffset,
          value: '',
        }))
      )).flat());
      return;
    }

    if (event.key === 'Enter' || event.key === 'F2') {
      event.preventDefault();
      startEditing(selectedRange.startRow, selectedRange.startCol);
      return;
    }

    const movement = {
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
      ArrowUp: [-1, 0],
    }[event.key];
    if (!movement) return;

    event.preventDefault();
    const nextRow = Math.max(0, Math.min(rows.length - 1, selectedRange.endRow + movement[0]));
    const nextCol = Math.max(0, Math.min(columns.length - 1, selectedRange.endCol + movement[1]));
    setSelectedRange(event.shiftKey
      ? { ...selectedRange, endRow: nextRow, endCol: nextCol }
      : { startRow: nextRow, endRow: nextRow, startCol: nextCol, endCol: nextCol });
  }

  function getSelectedText() {
    const range = normalizeRange(selectedRange);
    return serializeRangeToText(rows, range);
  }

  function pasteSelectedText(text) {
    const range = normalizeRange(selectedRange);
    if (!range || !text) return;
    const values = parseClipboardText(text);
    const pastedRowCount = values.length;
    const pastedColumnCount = Math.max(...values.map(rowValues => rowValues.length));
    const selectedRowCount = range.endRow - range.startRow + 1;
    const selectedColumnCount = range.endCol - range.startCol + 1;
    const endRow = Math.min(rows.length - 1, range.startRow + Math.max(selectedRowCount, pastedRowCount) - 1);
    const endCol = Math.min(columns.length - 1, range.startCol + Math.max(selectedColumnCount, pastedColumnCount) - 1);

    setSelectedRange({
      startRow: range.startRow,
      endRow,
      startCol: range.startCol,
      endCol,
    });
    commitChanges(Array.from({ length: endRow - range.startRow + 1 }, (_, rowOffset) => (
      Array.from({ length: endCol - range.startCol + 1 }, (_unused, colOffset) => ({
        rowIndex: range.startRow + rowOffset,
        columnIndex: range.startCol + colOffset,
        value: values[rowOffset % pastedRowCount][colOffset % pastedColumnCount] ?? '',
      }))
    )).flat());
  }

  return (
    <div
      data-editable-grid-scroll
      className={cn(
        'relative w-full rounded-none border border-border bg-card shadow-sm',
        scrollable && 'max-h-[70vh] overflow-auto',
        scrollClassName,
      )}
    >
      <table
        ref={gridRef}
        role="grid"
        aria-label={ariaLabel}
        aria-rowcount={rows.length}
        aria-colcount={columns.length}
        aria-activedescendant={spreadsheetInteractions && selectedRange
          ? `${gridId}-cell-${selectedRange.startRow}-${selectedRange.startCol}`
          : undefined}
        tabIndex={spreadsheetInteractions ? 0 : undefined}
        className={cn(
          fillWidth ? 'w-full table-fixed' : 'w-max',
          'border-separate border-spacing-0 text-[11px] text-foreground',
          spreadsheetInteractions && 'select-none outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
        )}
        style={{ minWidth: tableWidth }}
        onMouseUp={spreadsheetInteractions ? () => { dragAnchorRef.current = null; } : undefined}
        onMouseLeave={spreadsheetInteractions ? () => { dragAnchorRef.current = null; } : undefined}
        onKeyDown={spreadsheetInteractions ? handleGridKeyDown : undefined}
        onCopy={spreadsheetInteractions ? (event) => {
          const text = getSelectedText();
          if (!text) return;
          event.preventDefault();
          event.clipboardData.setData('text/plain', text);
        } : undefined}
        onPaste={spreadsheetInteractions ? (event) => {
          if (editingCell) return;
          const text = event.clipboardData.getData('text/plain');
          if (!text) return;
          event.preventDefault();
          const pasteShortcut = pasteShortcutRef.current;
          if (pasteShortcut && Date.now() - pasteShortcut.startedAt < 1000) {
            if (pasteShortcut.handled) return;
            pasteShortcut.handled = true;
          }
          pasteSelectedText(text);
        } : undefined}
      >
        <thead className="sticky top-0 z-20 bg-slate-200 shadow-[0_1px_0_hsl(var(--border))] dark:bg-slate-800">
          <tr role="row">
            {columns.map((column, columnIndex) => (
              <th
                key={column.id || columnIndex}
                role="columnheader"
                data-sticky={column.sticky ? 'true' : undefined}
                className={getHeaderClassName(column)}
                style={columnStyles[columnIndex]}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? rows.map((row, rowIndex) => {
            const totalRow = isTotalRow(row);
            return (
              <tr
                key={getCellReference(row, rowIndex)}
                role="row"
                data-total-row={totalRow ? 'true' : undefined}
                aria-label={totalRow ? row.map(cell => cell?.value).filter(Boolean).join(' ') : undefined}
                className={cn(
                  'group transition-colors',
                  totalRow && 'font-semibold',
                )}
              >
                {columns.map((column, columnIndex) => {
                  const cell = row[columnIndex] || {};
                  const cellValue = cell.value == null ? '' : String(cell.value);
                  const selected = spreadsheetInteractions && isCellSelected(rowIndex, columnIndex);
                  const active = spreadsheetInteractions
                    && selectedRange?.startRow === rowIndex
                    && selectedRange?.startCol === columnIndex;
                  const selectionEdges = selected ? {
                    top: rowIndex === normalizedSelectedRange.startRow,
                    right: columnIndex === normalizedSelectedRange.endCol,
                    bottom: rowIndex === normalizedSelectedRange.endRow,
                    left: columnIndex === normalizedSelectedRange.startCol,
                  } : null;
                  const editing = editingCell?.row === rowIndex && editingCell?.col === columnIndex && !cell.readOnly;
                  const cellState = totalRow ? 'total' : cell.readOnly ? 'readonly' : 'editable';

                  return (
                    <GridCell
                      key={`${getCellReference(row, rowIndex)}-${column.id || columnIndex}`}
                      gridId={gridId}
                      rowIndex={rowIndex}
                      columnIndex={columnIndex}
                      column={column}
                      cell={cell}
                      cellValue={cellValue}
                      cellState={cellState}
                      totalRow={totalRow}
                      selected={selected}
                      active={active}
                      selectionEdges={selectionEdges}
                      spreadsheetInteractions={spreadsheetInteractions}
                      editing={spreadsheetInteractions && editing}
                      style={columnStyles[columnIndex]}
                      onCellMouseDown={spreadsheetInteractions ? handleCellMouseDown : undefined}
                      onCellMouseEnter={spreadsheetInteractions ? handleCellMouseEnter : undefined}
                      onCellClick={spreadsheetInteractions ? handleCellClick : undefined}
                      onCellDoubleClick={spreadsheetInteractions ? handleCellDoubleClick : undefined}
                      onCellCommit={handleCellCommit}
                      onCellCancelEdit={handleCellCancelEdit}
                    />
                  );
                })}
              </tr>
            );
          }) : (
            <tr role="row">
              <td role="gridcell" colSpan={columns.length || 1} className="h-24 !rounded-none px-4 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
