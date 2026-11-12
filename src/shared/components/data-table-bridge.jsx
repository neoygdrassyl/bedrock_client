import { useState, useMemo, useEffect, Fragment, useId } from 'react';
import {
  flexRender,
  getCoreRowModel,
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
} from '@/shared/ui/table';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { EmptyState } from '@/shared/ui/empty-state';
import { cn } from '@/shared/lib/utils';
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

// Unified pagination: a table with more rows than the smallest page size paginates
// by default. Consumers opt out with `pagination={false}` (editable grids, tables
// with totals rows, anything that must show or print every row).
const AUTO_PAGINATION_PAGE_SIZE = 10;
const EXPLICIT_PAGINATION_PAGE_SIZE = 20;
const DEFAULT_ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

function PagerButton({ label, onClick, disabled, children }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-8 w-8 p-0"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </Button>
  );
}

/**
 * Bridge component: accepts react-data-table-component props,
 * renders using shadcn/ui Table with Dovela design tokens.
 *
 * Drop-in replacement: change import from 'react-data-table-component'
 * to '@/shared/components/data-table-bridge'.
 *
 * Pagination differs from react-data-table-component on purpose:
 *   - `pagination` omitted → automatic: on when there are more than 10 rows (10/25/50 per page).
 *   - `pagination` / `pagination={true}` → always on (20 per page unless `paginationPerPage`).
 *   - `pagination={false}` → never; every row is rendered.
 *   - `paginationServer` keeps working as in rdt and is never switched on automatically.
 */
export function DataTableBridge({
  columns: rdtColumns = [],
  data = [],
  pagination,
  paginationPerPage,
  paginationRowsPerPageOptions,
  paginationComponentOptions,
  // Server-side pagination (opt-in, mirrors the react-data-table-component API).
  // Off by default so existing consumers keep paginating client-side.
  paginationServer = false,
  paginationTotalRows = 0,
  // 1-based current page. In server mode the parent owns the page number, so
  // when it resets (e.g. after re-sorting) the indicator has to follow instead
  // of keeping the page the user was previously on.
  paginationPage,
  onChangePage,
  onChangeRowsPerPage,
  // Server-side sorting. Required alongside paginationServer, otherwise a click
  // on a header would only reorder the page currently in memory and silently
  // look like it sorted the whole dataset.
  sortServer = false,
  onSort,
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
  const rowCount = Array.isArray(data) ? data.length : 0;
  const paginationEnabled = pagination == null
    ? !paginationServer && rowCount > AUTO_PAGINATION_PAGE_SIZE
    : Boolean(pagination);
  const defaultPageSize = paginationPerPage
    || (pagination ? EXPLICIT_PAGINATION_PAGE_SIZE : AUTO_PAGINATION_PAGE_SIZE);
  const [paginationState, setPaginationState] = useState({
    pageIndex: 0,
    pageSize: defaultPageSize,
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
          meta: {
            button: Boolean(col.button),
            center: Boolean(col.center || col.button),
            right: Boolean(col.right),
          },
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

  // Follow the parent's page number in server mode. Without this the indicator
  // desyncs whenever the parent resets the page on its own (sorting, refresh).
  useEffect(() => {
    if (!paginationServer || paginationPage == null) return;
    const nextIndex = Math.max(0, paginationPage - 1);
    setPaginationState((current) => (
      current.pageIndex === nextIndex ? current : { ...current, pageIndex: nextIndex }
    ));
  }, [paginationServer, paginationPage]);

  // Client mode: go back to the first page when the number of rows changes (filter,
  // add, delete) but keep the page when the same rows are merely re-rendered or edited.
  useEffect(() => {
    if (paginationServer) return;
    setPaginationState((current) => (current.pageIndex === 0 ? current : { ...current, pageIndex: 0 }));
  }, [paginationServer, rowCount]);

  // In server mode `data` is already the current page, so TanStack must not
  // slice it again; it only needs the total page count to drive the controls.
  const serverPageCount = paginationServer
    ? Math.max(1, Math.ceil((paginationTotalRows || 0) / (paginationState.pageSize || defaultPageSize)))
    : undefined;

  // Page/size changes are owned by the parent in server mode: apply them to
  // local state for the controls, then notify so it can refetch.
  const handlePaginationChange = (updater) => {
    const next = typeof updater === 'function' ? updater(paginationState) : updater;
    setPaginationState(next);

    if (!paginationServer) return;
    if (next.pageSize !== paginationState.pageSize) {
      // rdt reports 1-based pages.
      onChangeRowsPerPage?.(next.pageSize, next.pageIndex + 1);
      return;
    }
    if (next.pageIndex !== paginationState.pageIndex) {
      onChangePage?.(next.pageIndex + 1, paginationTotalRows);
    }
  };

  // Sorting is owned by the parent in server mode: keep local state so the
  // header arrows still reflect the active column, then notify so it refetches.
  const handleSortingChange = (updater) => {
    const next = typeof updater === 'function' ? updater(sorting) : updater;
    setSorting(next);

    if (!sortServer) {
      // A new order starts from the first page.
      setPaginationState((current) => (current.pageIndex === 0 ? current : { ...current, pageIndex: 0 }));
      return;
    }
    const [active] = next;
    if (!active) {
      onSort?.(null, null);
      return;
    }
    // Report the original rdt column object, as react-data-table-component does.
    const rdtColumn = rdtColumns.filter(c => !c.omit)
      .find((col, index) => String(col.id || index + 1) === String(active.id));
    onSort?.(rdtColumn || null, active.desc ? 'desc' : 'asc');
  };

  const table = useReactTable({
    data,
    columns: tanstackColumns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: handleSortingChange,
    // In server mode rows arrive already ordered; re-sorting them locally would
    // only shuffle the current page. Passed unconditionally for the same
    // option-merging reason as pageCount above.
    manualSorting: sortServer,
    ...(sortServer ? {} : { getSortedRowModel: getSortedRowModel() }),
    ...(paginationEnabled && {
      // Page resets are handled above (row count / sort changes); the automatic one
      // would send the user back to page 1 on every parent re-render that rebuilds `data`.
      autoResetPageIndex: false,
      // Client mode keeps the row model that slices locally; server mode swaps
      // it for manualPagination + an explicit pageCount.
      // `manualPagination` and `pageCount` are always passed, never omitted:
      // useReactTable merges options across renders, so leaving a key out keeps
      // the previous value and the page count would stay stuck on the server
      // total after switching back to client mode.
      manualPagination: paginationServer,
      pageCount: paginationServer ? serverPageCount : undefined,
      ...(paginationServer ? {} : { getPaginationRowModel: getPaginationRowModel() }),
      onPaginationChange: handlePaginationChange,
    }),
    ...(expandableRows && {
      getExpandedRowModel: getExpandedRowModel(),
      onExpandedChange: setExpanded,
    }),
    state: {
      sorting,
      expanded,
      ...(paginationEnabled && { pagination: paginationState }),
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

  const isInteractiveElement = (target) => {
    if (!(target instanceof Element)) return false;

    return Boolean(target.closest('button, a, input, select, textarea, [role="button"]'));
  };

  const cellPadding = dense ? 'py-1 px-2 text-xs' : 'py-2 px-3 text-sm';
  // The current size is always offered, even when it is not one of the standard options.
  const rowsPerPageOptions = Array.from(new Set([
    ...(Array.isArray(paginationRowsPerPageOptions) && paginationRowsPerPageOptions.length
      ? paginationRowsPerPageOptions
      : DEFAULT_ROWS_PER_PAGE_OPTIONS),
    defaultPageSize,
    paginationState.pageSize,
  ].map(Number).filter((size) => Number.isFinite(size) && size > 0))).sort((a, b) => a - b);
  const rowsPerPageText = paginationComponentOptions?.rowsPerPageText || 'Filas por página';
  const rangeSeparatorText = paginationComponentOptions?.rangeSeparatorText || 'de';
  const showRowsPerPage = !paginationComponentOptions?.noRowsPerPage;

  const getColumnStyle = (columnDef) => {
    const style = {};

    if (columnDef.size) style.width = columnDef.size;
    if (columnDef.minSize) style.minWidth = columnDef.minSize;
    if (columnDef.maxSize) style.maxWidth = columnDef.maxSize;

    return Object.keys(style).length ? style : undefined;
  };

  const getColumnAlignmentClass = (columnDef) => {
    if (columnDef.meta?.right) return 'text-right';
    if (columnDef.meta?.center) return 'text-center';
    return '';
  };

  const getHeaderContentAlignmentClass = (columnDef) => {
    if (columnDef.meta?.right) return 'justify-end';
    if (columnDef.meta?.center) return 'justify-center';
    return '';
  };

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
          'rdt_Table rounded-[var(--radius)] border border-border overflow-auto',
          fixedHeader && 'overflow-y-auto'
        )}
        aria-busy={progressPending || undefined}
        style={fixedHeader ? { maxHeight: fixedHeaderScrollHeight || '400px' } : undefined}
      >
        <Table>
          {!noTableHead && (
            <TableHeader className="rdt_TableHead bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="rdt_TableHeadRow border-b-border/60">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      aria-sort={header.column.getIsSorted() ? (header.column.getIsSorted() === 'desc' ? 'descending' : 'ascending') : undefined}
                      className={cn(
                        cellPadding,
                        'h-auto font-semibold text-[0.6875rem] uppercase tracking-wide text-foreground/80',
                        getColumnAlignmentClass(header.column.columnDef),
                        header.column.getCanSort() && 'cursor-pointer select-none hover:text-foreground transition-colors'
                      )}
                      style={getColumnStyle(header.column.columnDef)}
                      onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <div className={cn('flex items-center gap-1', getHeaderContentAlignmentClass(header.column.columnDef))}>
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
                      'rdt_TableRow transition-colors',
                      onRowClicked && 'cursor-pointer',
                      highlightOnHover && 'hover:bg-muted/40',
                      striped && rowIdx % 2 === 1 && 'bg-muted/20',
                      getRowClassName(row.original),
                    )}
                    style={getRowStyle(row.original)}
                    onClick={onRowClicked ? (event) => {
                      if (isInteractiveElement(event.target)) return;
                      onRowClicked(row.original);
                    } : undefined}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          'rdt_TableCell',
                          cellPadding,
                          'align-middle',
                          getColumnAlignmentClass(cell.column.columnDef),
                          cell.column.columnDef.meta?.button && 'whitespace-nowrap'
                        )}
                        style={getColumnStyle(cell.column.columnDef)}
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
                        <TableCell colSpan={tanstackColumns.length} className="p-0 bg-muted/10 border-l-2 border-l-primary/30">
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

      {paginationEnabled && !progressPending && (() => {
        const { pageIndex, pageSize } = table.getState().pagination;
        const totalRows = paginationServer ? (paginationTotalRows || 0) : table.getPrePaginationRowModel().rows.length;
        const pageCount = Math.max(1, table.getPageCount() || 1);
        const firstRow = totalRows ? pageIndex * pageSize + 1 : 0;
        const lastRow = Math.min(totalRows, (pageIndex + 1) * pageSize);

        return (
          <nav
            aria-label="Paginación de la tabla"
            className="rdt_Pagination flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-1 text-xs text-muted-foreground"
          >
            {showRowsPerPage ? (
              <div className="flex items-center gap-2">
                <label htmlFor={rowsPerPageId} className="m-0 text-xs text-muted-foreground">
                  {rowsPerPageText}
                </label>
                <select
                  id={rowsPerPageId}
                  className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={String(pageSize)}
                  onChange={(event) => {
                    // Routed through the shared handler so server mode is notified;
                    // it also resets to the first page.
                    handlePaginationChange({
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
            ) : null}
            <div className="ml-auto flex flex-wrap items-center gap-x-3 gap-y-2">
              {/* In server mode the row model only holds the current page, so the
                  total has to come from the server. */}
              <span className="tabular-nums text-foreground/80" aria-live="polite">
                {firstRow}–{lastRow} {rangeSeparatorText} {totalRows}
                <span className="sr-only">. Página {pageIndex + 1} de {pageCount}</span>
              </span>
              <div className="flex items-center gap-1">
                <PagerButton label="Primera página" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
                  <ChevronsLeft className="h-3.5 w-3.5" aria-hidden="true" />
                </PagerButton>
                <PagerButton label="Página anterior" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                  <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                </PagerButton>
                <PagerButton label="Página siguiente" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </PagerButton>
                <PagerButton label="Última página" onClick={() => table.setPageIndex(pageCount - 1)} disabled={!table.getCanNextPage()}>
                  <ChevronsRight className="h-3.5 w-3.5" aria-hidden="true" />
                </PagerButton>
              </div>
            </div>
          </nav>
        );
      })()}
    </div>
  );
}

// Compatibility export for code importing { Alignment } from react-data-table-component
export const Alignment = { LEFT: 'left', CENTER: 'center', RIGHT: 'right' };

export default DataTableBridge;
