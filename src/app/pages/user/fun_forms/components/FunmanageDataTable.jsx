import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { MissingDataBadge } from './MissingDataBadge';
import { BookmarkQuickMenu } from './BookmarkQuickMenu';

function buildColumns(onViewDetail, onOpenWorkspace, onToggleBookmarkScope) {
  return [
    {
        id: 'radicado',
        header: 'Radicado',
        accessorFn: (row) => row.radicado ?? '—',
        cell: (info) => {
          const row = info.row.original;
          const radicado = info.getValue();
          const rowId = row.rowId ?? row.id ?? row.fun0Id ?? row.fun_0_id ?? '';
          const bookmarkState = row._bookmarkState;

          return (
            <div className="flex min-w-0 items-center gap-2">
              <BookmarkQuickMenu
                bookmarkState={bookmarkState}
                rowId={rowId}
                onToggleScope={(scope, isMarked) => {
                  onToggleBookmarkScope?.(row, scope, isMarked);
                }}
                triggerClassName="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-transparent bg-transparent transition-colors hover:border-border hover:bg-muted"
              />

              {radicado && radicado !== '—' ? (
                <span className="truncate font-mono text-sm font-semibold text-foreground" data-testid={`radicado-value-${rowId}`}>
                  {radicado}
                </span>
              ) : (
                <MissingDataBadge reason="fecha_radicacion" />
              )}
            </div>
          );
        },
      },
      {
        id: 'fase',
        header: 'Fase',
        accessorFn: (row) => row.phaseText ?? row.fase_label ?? 'Sin fase',
        cell: (info) => {
          const row = info.row.original;
          const phaseText = row.phaseText ?? 'Sin fase';
          const phaseTooltip = row.phaseTooltip ?? phaseText;

          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className="block max-w-[14rem] cursor-help truncate text-sm text-muted-foreground"
                  data-testid={`phase-text-${row.rowId ?? row.id ?? info.row.id}`}
                  title={phaseTooltip}
                >
                  {phaseText}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-xs">
                {phaseTooltip}
              </TooltipContent>
            </Tooltip>
          );
        },
      },
      {
        id: 'estado',
        header: 'Estado',
        accessorFn: (row) => `${row.curValue ?? '0/0'}|${row.solValue ?? '0/0'}`,
        cell: (info) => {
          const row = info.row.original;
          const rowId = row.rowId ?? row.id ?? info.row.id;
          const currentActor = row.currentActor ?? 'cur';

          const blocks = [
            {
              key: 'cur',
              label: 'Cur',
              icon: 'building',
              value: row.curValue ?? '0/0',
              active: currentActor === 'cur',
            },
            {
              key: 'sol',
              label: 'Sol',
              icon: 'user',
              value: row.solValue ?? '0/0',
              active: currentActor === 'sol',
            },
          ];

          return (
            <div
              className="grid min-w-[11rem] grid-cols-2 overflow-hidden rounded-lg border border-border bg-muted/30"
              data-testid={`status-cell-${rowId}`}
            >
              {blocks.map((block, index) => (
                <div
                  key={block.key}
                  className={[
                    'flex min-w-0 items-center gap-2 px-3 py-2',
                    index === 0 ? 'border-r border-border' : '',
                    block.active ? 'bg-background text-foreground' : 'text-muted-foreground',
                  ].filter(Boolean).join(' ')}
                  data-testid={`status-${block.key}-${rowId}`}
                >
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Icon name={block.icon} size={14} />
                  </span>
                  <span className="flex min-w-0 flex-col leading-none">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.08em]">
                      {block.label}
                    </span>
                    <span className="font-mono text-xs font-semibold" data-testid={`status-${block.key}-value-${rowId}`}>
                      {block.value}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          );
        },
      },
      {
        id: 'acciones',
        header: 'Acciones',
        enableSorting: false,
        cell: (info) => {
          const row = info.row.original;
          const rowId = row.rowId ?? row.id ?? info.row.id;

          return (
            <div className="flex items-center justify-end gap-2" data-testid={`row-actions-${rowId}`}>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                title="Previsualizar expediente"
                aria-label="Previsualizar expediente"
                data-testid={`row-preview-${rowId}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onViewDetail?.(row);
                }}
              >
                <Icon name="folder-open" size={16} />
              </Button>

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                title="Abrir gestión completa"
                aria-label="Abrir gestión completa"
                data-testid={`row-fullscreen-${rowId}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onOpenWorkspace?.(row);
                }}
              >
                <Icon name="expand-alt" size={16} />
              </Button>
            </div>
          );
        },
      },
    ];
  }

  function SortIcon({ direction }) {
    if (direction === 'asc') return <Icon name="sort-up" size={14} className="text-primary" />;
    if (direction === 'desc') return <Icon name="sort-down" size={14} className="text-primary" />;
    return <Icon name="sort" size={14} className="text-muted-foreground opacity-60" />;
  }

  function SortableHeader({ column, label, widthClass = '' }) {
    return (
      <button
        type="button"
        className={`inline-flex items-center gap-1 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground ${widthClass}`.trim()}
        onClick={() => column.toggleSorting()}
        aria-label={`Ordenar por ${label}`}
      >
        <span>{label}</span>
        <SortIcon direction={column.getIsSorted()} />
      </button>
    );
  }

  export function FunmanageDataTable({
    data = [],
    totalRows = 0,
    page = 1,
    pageSize = 50,
    loading,
    error,
    search,
    onSearchChange,
    sorting = [],
    onSortingChange,
    onPageChange,
    onRetry,
    onViewDetail,
    onOpenWorkspace,
    onToggleBookmarkScope,
  }) {
    const columns = useMemo(() => {
      const baseColumns = buildColumns(onViewDetail, onOpenWorkspace, onToggleBookmarkScope);

      return [
        {
          ...baseColumns[0],
          header: ({ column }) => <SortableHeader column={column} label="Radicado" widthClass="w-full" />,
        },
        {
          ...baseColumns[1],
          header: ({ column }) => <SortableHeader column={column} label="Fase" widthClass="w-full" />,
        },
        baseColumns[2],
        baseColumns[3],
      ];
    }, [onOpenWorkspace, onToggleBookmarkScope, onViewDetail]);

    const table = useReactTable({
      data,
      columns,
      state: { sorting },
      manualPagination: true,
      manualSorting: true,
      pageCount: Math.max(1, Math.ceil(totalRows / pageSize)),
      onSortingChange,
      getCoreRowModel: getCoreRowModel(),
    });

    const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
    const canPrev = page > 1;
    const canNext = page < totalPages;

    return (
      <TooltipProvider delayDuration={150}>
        <div data-testid="data-table" className="w-full">
          <div className="mb-2 flex flex-col gap-2 rounded-lg border border-border bg-muted/20 px-2 py-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative min-w-0 flex-1 sm:max-w-sm">
              <Icon
                name="search"
                size={14}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                type="search"
                className="h-8 rounded-lg border-border bg-background/90 pl-8 pr-2 text-xs"
                placeholder="Buscar radicado…"
                value={search ?? ''}
                onChange={(event) => onSearchChange?.(event.target.value)}
                data-testid="table-search"
              />
            </div>

            <span className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background/80 px-2.5 text-xs font-medium text-muted-foreground" data-testid="table-total">
              <Icon name="database" size={14} />
              {loading ? '…' : `${totalRows} solicitudes`}
            </span>
          </div>

          {error && !loading && (
            <div className="mb-3 flex items-center gap-2 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-foreground" role="alert">
              <Icon name="exclamation-triangle" size={16} className="text-warning" />
              <span>{error}</span>
              <Button type="button" variant="link" size="sm" className="ml-auto h-auto px-0" onClick={onRetry}>
                Reintentar
              </Button>
            </div>
          )}

          <div
            className="overflow-y-auto rounded-lg border border-border bg-card shadow-sm"
            style={{ maxHeight: 'clamp(300px, calc(100vh - 340px), 900px)' }}
            data-testid="funmanage-table-scroll-container"
          >
            <table className="w-full table-fixed border-collapse" data-testid="funmanage-table">
              <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b border-border">
                    {headerGroup.headers.map((header) => {
                      const widthClass =
                        header.id === 'radicado'
                          ? 'w-[26%]'
                          : header.id === 'fase'
                            ? 'w-[24%]'
                            : header.id === 'estado'
                              ? 'w-[32%]'
                              : 'w-[18%]';

                      return (
                        <th key={header.id} className={`px-4 py-2.5 text-left align-middle ${widthClass}`.trim()}>
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-6 text-center text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
                        Cargando datos…
                      </span>
                    </td>
                  </tr>
                ) : table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-6 text-center text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <Icon name="inbox" size={16} />
                        Sin resultados para los filtros aplicados.
                      </span>
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row, idx) => (
                    <tr
                      key={row.id}
                      className="cursor-pointer border-b border-border/70 transition-colors hover:bg-muted/40"
                      data-testid={`table-row-${idx}`}
                      onClick={() => onViewDetail?.(row.original)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-2.5 align-middle">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && totalRows > 0 && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm text-muted-foreground">
                Página <strong>{page}</strong> de <strong>{totalPages}</strong>{' '}
                <span className="text-muted-foreground/80">({totalRows} filas totales)</span>
              </span>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!canPrev || loading}
                  onClick={() => onPageChange?.(Math.max(1, page - 1))}
                  data-testid="pagination-prev"
                >
                  <Icon name="chevron-left" size={16} />
                  Anterior
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!canNext || loading}
                  onClick={() => onPageChange?.(Math.min(totalPages, page + 1))}
                  data-testid="pagination-next"
                >
                  Siguiente
                  <Icon name="chevron-right" size={16} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </TooltipProvider>
    );
  }

export default FunmanageDataTable;
