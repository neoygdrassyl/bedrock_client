import { useState, useMemo, Fragment, useId } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
import { ArrowUpDown, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Bridge component: accepts react-data-table-component props,
 * renders using shadcn/ui Table with Dovela design tokens.
 *
 * Drop-in replacement: change import from 'react-data-table-component'
 * to '@/components/data-table-bridge'.
 */
export function DataTableBridge({
  columns: rdtColumns = [],
  data = [],
  pagination = false,
  paginationPerPage = 20,
  paginationRowsPerPageOptions,
  paginationComponentOptions,
  noDataComponent = 'No hay registros',
  striped,
  highlightOnHover,
  dense,
  noHeader,
  noTableHead,
  conditionalRowStyles = [],
  onRowClicked,
  progressPending = false,
  progressComponent,
  defaultSortFieldId,
  defaultSortAsc = true,
  expandableRows = false,
  expandableRowsComponent: ExpandableComponent,
  expandableRowDisabled,
  subHeader,
  subHeaderComponent,
  fixedHeader,
  fixedHeaderScrollHeight,
  className,
  title,
  // Ignored props from react-data-table-component
  customStyles,     // eslint-disable-line no-unused-vars
  ...rest           // eslint-disable-line no-unused-vars
}) {
  const [sorting, setSorting] = useState(() => {
    if (defaultSortFieldId != null) {
      const col = rdtColumns.find((c, i) => (c.id || i + 1) === defaultSortFieldId);
      if (col) {
        return [{ id: String(defaultSortFieldId), desc: !defaultSortAsc }];
      }
    }
    return [];
  });
  const [expanded, setExpanded] = useState({});
  const [paginationState, setPaginationState] = useState({
    pageIndex: 0,
    pageSize: paginationPerPage,
  });
  const rowsPerPageId = useId();

  // Convert react-data-table-component columns → tanstack columns
  const tanstackColumns = useMemo(() => {
    const cols = rdtColumns
      .filter(c => !c.omit)
      .map((col, index) => {
        const id = String(col.id || index + 1);
        const def = {
          id,
          header: col.name || '',
          enableSorting: !!col.sortable,
        };

        // Accessor
        if (typeof col.selector === 'function') {
          def.accessorFn = col.selector;
        } else if (typeof col.selector === 'string') {
          def.accessorKey = col.selector;
        } else {
          def.accessorFn = () => '';
        }

        // Cell renderer — bridge from RDT (receives row) to tanstack (receives cell info)
        if (col.cell) {
          def.cell = (info) => col.cell(info.row.original, info.row.index, {
            id, name: col.name
          });
        } else if (col.format) {
          def.cell = (info) => col.format(info.row.original);
        }

        // Size
        if (col.width) {
          def.size = parseInt(col.width, 10) || undefined;
          def.minSize = def.size;
          def.maxSize = def.size;
        }
        if (col.minWidth) def.minSize = parseInt(col.minWidth, 10);
        if (col.maxWidth) def.maxSize = parseInt(col.maxWidth, 10);
        if (col.grow === 0) def.size = def.size || 80;

        return def;
      });

    // Add expand column if needed
    if (expandableRows) {
      cols.unshift({
        id: '__expand',
        header: '',
        size: 36,
        enableSorting: false,
        cell: ({ row }) => {
          const isDisabled = expandableRowDisabled?.(row.original);
          if (isDisabled) return null;
          return (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); row.toggleExpanded(); }}
              className="p-0.5 rounded hover:bg-muted transition-colors"
            >
              {row.getIsExpanded()
                ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>
          );
        },
      });
    }

    return cols;
  }, [rdtColumns, expandableRows, expandableRowDisabled]);

  const table = useReactTable({
    data,
    columns: tanstackColumns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    ...(pagination && {
      getPaginationRowModel: getPaginationRowModel(),
      onPaginationChange: setPaginationState,
    }),
    ...(expandableRows && {
      getExpandedRowModel: getExpandedRowModel(),
      onExpandedChange: setExpanded,
    }),
    state: {
      sorting,
      expanded,
      ...(pagination && { pagination: paginationState }),
    },
  });

  // Conditional row style resolver
  const getRowStyle = (row) => {
    for (const rule of conditionalRowStyles) {
      if (rule.when(row)) return rule.style || {};
    }
    return {};
  };

  const getRowClassName = (row) => {
    for (const rule of conditionalRowStyles) {
      if (rule.when(row)) return rule.classNames || '';
    }
    return '';
  };

  const cellPadding = dense ? 'py-1 px-2 text-xs' : 'py-2 px-3 text-sm';
  const rowsPerPageOptions = Array.isArray(paginationRowsPerPageOptions) && paginationRowsPerPageOptions.length
    ? paginationRowsPerPageOptions
    : [paginationPerPage];
  const rowsPerPageText = paginationComponentOptions?.rowsPerPageText || 'Filas por página:';

  return (
    <div className={cn('space-y-2', className)}>
      {!noHeader && title && (
        <div className="text-sm font-semibold text-foreground">{title}</div>
      )}
      {subHeader && subHeaderComponent && (
        <div className="mb-2">{subHeaderComponent}</div>
      )}

      <div
        className={cn(
          'rdt_Table rounded-md border border-border overflow-auto',
          fixedHeader && 'overflow-y-auto'
        )}
        style={fixedHeader ? { maxHeight: fixedHeaderScrollHeight || '400px' } : undefined}
      >
        <Table>
          {!noTableHead && (
            <TableHeader className="rdt_TableHead bg-muted/50 sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="rdt_TableHeadRow">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        cellPadding,
                        'font-semibold text-muted-foreground',
                        header.column.getCanSort() && 'cursor-pointer select-none hover:text-foreground transition-colors'
                      )}
                      style={header.column.columnDef.size ? { width: header.column.columnDef.size } : undefined}
                      onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <div className="flex items-center gap-1">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <ArrowUpDown className="h-3 w-3 opacity-50" />
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
          )}
          <TableBody>
            {progressPending ? (
              progressComponent ? (
                <TableRow>
                  <TableCell colSpan={tanstackColumns.length} className="h-24 text-center">
                    {progressComponent}
                  </TableCell>
                </TableRow>
              ) : (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`skel-${i}`}>
                    {tanstackColumns.map((_, j) => (
                      <TableCell key={`skel-${i}-${j}`} className={cellPadding}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, rowIdx) => {
                const rowContent = (
                  <TableRow
                    key={row.id}
                    className={cn(
                      'rdt_TableRow',
                      onRowClicked && 'cursor-pointer',
                      highlightOnHover && 'hover:bg-muted/50',
                      striped && rowIdx % 2 === 1 && 'bg-muted/30',
                      getRowClassName(row.original),
                    )}
                    style={getRowStyle(row.original)}
                    onClick={onRowClicked ? () => onRowClicked(row.original) : undefined}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn('rdt_TableCell', cellPadding, 'align-middle')}
                        style={cell.column.columnDef.size ? { width: cell.column.columnDef.size } : undefined}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                );
                if (expandableRows && row.getIsExpanded() && ExpandableComponent) {
                  return (
                    <Fragment key={row.id}>
                      {rowContent}
                      <TableRow>
                        <TableCell colSpan={tanstackColumns.length} className="p-0 bg-muted/20">
                          <ExpandableComponent data={row.original} />
                        </TableCell>
                      </TableRow>
                    </Fragment>
                  );
                }
                return rowContent;
              })
            ) : (
              <TableRow>
                <TableCell colSpan={tanstackColumns.length} className="h-32 text-center">
                  {typeof noDataComponent === 'string' ? (
                    <EmptyState message={noDataComponent} icon="FileText" />
                  ) : (
                    noDataComponent
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && !progressPending && (
        <div className="rdt_Pagination flex flex-wrap items-center justify-between gap-2 text-sm pt-1">
          <div className="flex items-center gap-2">
            <label htmlFor={rowsPerPageId} className="text-xs text-muted-foreground">
              {rowsPerPageText}
            </label>
            <select
              id={rowsPerPageId}
              aria-label={rowsPerPageText}
              className="h-7 rounded-md border border-border bg-background px-2 text-xs text-foreground"
              value={String(table.getState().pagination.pageSize)}
              onChange={(event) => {
                setPaginationState({
                  pageIndex: 0,
                  pageSize: Number(event.target.value),
                });
              }}
            >
              {rowsPerPageOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <span className="text-muted-foreground text-xs">
            {table.getFilteredRowModel().rows.length} registros
            {' · '}
            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount() || 1}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            {table.getPageCount() <= 7 ? (
              Array.from({ length: table.getPageCount() }, (_, i) => (
                <Button
                  key={i}
                  variant={table.getState().pagination.pageIndex === i ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 w-7 p-0 text-xs"
                  onClick={() => table.setPageIndex(i)}
                >
                  {i + 1}
                </Button>
              ))
            ) : (
              <span className="text-xs text-muted-foreground px-2">
                {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
              </span>
            )}
            <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Compatibility export for code importing { Alignment } from react-data-table-component
export const Alignment = { LEFT: 'left', CENTER: 'center', RIGHT: 'right' };

export default DataTableBridge;
