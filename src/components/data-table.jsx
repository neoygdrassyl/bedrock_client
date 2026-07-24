import { useId, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Unified data table component for Dovela.
 * Wraps @tanstack/react-table with shadcn/ui Table primitives.
 *
 * @param {object} props
 * @param {import('@tanstack/react-table').ColumnDef[]} props.columns
 * @param {any[]} props.data
 * @param {boolean} [props.searchable=false]
 * @param {string} [props.searchPlaceholder="Buscar..."]
 * @param {string} [props.searchLabel="Buscar registros"]
 * @param {boolean} [props.pagination=false]
 * @param {number} [props.pageSize=20]
 * @param {number[]} [props.pageSizeOptions]
 * @param {boolean} [props.sortable=true]
 * @param {boolean} [props.loading=false]
 * @param {string} [props.emptyMessage="No hay registros"]
 * @param {boolean} [props.compact=false]
 * @param {string} [props.className]
 */
export function DataTable({
  columns,
  data,
  searchable = false,
  searchPlaceholder = 'Buscar...',
  searchLabel = 'Buscar registros',
  pagination = false,
  pageSize = 20,
  pageSizeOptions,
  sortable = true,
  loading = false,
  emptyMessage = 'No hay registros',
  compact = false,
  className,
}) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const pageSizeId = useId();
  const resolvedPageSizeOptions = Array.isArray(pageSizeOptions) && pageSizeOptions.length
    ? [...new Set([pageSize, ...pageSizeOptions])].sort((left, right) => left - right)
    : [];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...(sortable && {
      onSortingChange: setSorting,
      getSortedRowModel: getSortedRowModel(),
    }),
    ...(searchable && {
      onGlobalFilterChange: setGlobalFilter,
      getFilteredRowModel: getFilteredRowModel(),
    }),
    ...(pagination && {
      getPaginationRowModel: getPaginationRowModel(),
    }),
    state: {
      sorting,
      globalFilter,
    },
    initialState: {
      pagination: { pageSize },
    },
  });

  return (
    <div className={cn('space-y-4', className)}>
      {searchable && (
        <div className="flex items-center">
          <Input
            aria-label={searchLabel}
            placeholder={searchPlaceholder}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-md border border-border">
        <Table>
          <TableHeader className="bg-muted/55">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort() && sortable;
                  const sorted = header.column.getIsSorted();
                  const content = header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext());

                  return (
                    <TableHead
                      key={header.id}
                      className={cn('h-11 px-4 text-xs font-semibold uppercase tracking-[0.025em] text-foreground/85', compact && 'py-2 px-3 text-xs')}
                      aria-sort={sorted === 'asc' ? 'ascending' : (sorted === 'desc' ? 'descending' : undefined)}
                    >
                      {canSort ? (
                        <button
                          type="button"
                          className="flex w-full items-center gap-1 rounded-sm text-left text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {content}
                          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-1">{content}</div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {columns.map((_, j) => (
                    <TableCell key={`skeleton-${i}-${j}`} className={cn(compact && 'py-2 px-3')}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cn(compact && 'py-2 px-3 text-sm')}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && !loading && (
        <div className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 max-sm:grid-cols-1">
          {resolvedPageSizeOptions.length > 0 ? (
            <label htmlFor={pageSizeId} className="flex shrink-0 items-center gap-2 whitespace-nowrap text-sm text-muted-foreground">
                Filas por página
                <select
                  id={pageSizeId}
                  className="h-8 rounded-md border border-border bg-background px-2 text-sm text-foreground"
                  value={table.getState().pagination.pageSize}
                  onChange={(event) => table.setPageSize(Number(event.target.value))}
                >
                  {resolvedPageSizeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
            </label>
          ) : <span aria-hidden="true" />}
          <p className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-center text-sm text-muted-foreground max-sm:text-left">
            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount() || 1} · {table.getFilteredRowModel().rows.length} registros
          </p>
          <div className="flex items-center justify-end gap-2 max-sm:justify-start">
            <Button
              variant="outline"
              size="sm"
              aria-label="Página anterior"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              aria-label="Página siguiente"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
