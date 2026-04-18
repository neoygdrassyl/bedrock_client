import { useState } from 'react';
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
 * @param {boolean} [props.pagination=false]
 * @param {number} [props.pageSize=20]
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
  pagination = false,
  pageSize = 20,
  sortable = true,
  loading = false,
  emptyMessage = 'No hay registros',
  compact = false,
  className,
}) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');

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
            placeholder={searchPlaceholder}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />
        </div>
      )}

      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      compact && 'py-2 px-3 text-xs',
                      header.column.getCanSort() && sortable && 'cursor-pointer select-none'
                    )}
                    onClick={
                      header.column.getCanSort() && sortable
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && sortable && (
                        <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </div>
                  </TableHead>
                ))}
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
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {table.getState().pagination.pageIndex + 1} de{' '}
            {table.getPageCount() || 1}
            {' · '}
            {table.getFilteredRowModel().rows.length} registros
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
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
