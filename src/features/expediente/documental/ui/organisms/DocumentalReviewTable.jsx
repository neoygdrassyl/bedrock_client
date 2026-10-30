import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import {
  Archive,
  ChevronLeft,
  ChevronRight,
  FileSearch,
  FileText,
  History,
  Monitor,
  ScanLine,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { cn } from '@/shared/lib/utils';
import { VrCell } from '../molecules/VrCell';
import { DocumentTitleButton } from '../molecules/DocumentTitleButton';
import { ReceiptStatus, ScanStatus } from '../molecules/DocumentReceiptStatus';
import { DocumentalDetailPanel } from './DocumentalDetailPanel';
import { DocumentalTableToolbar } from './DocumentalTableToolbar';
import { handleSelectableRowKeyDown, selectableRowClass, selectedRowAccent } from '../selectableRows';

function DocumentalPagination({ page, totalPages, resultCount, pageSize, onPageChange }) {
  const firstVisible = resultCount ? (page - 1) * pageSize + 1 : 0;
  const lastVisible = Math.min(page * pageSize, resultCount);
  const startPage = Math.max(1, Math.min(page - 2, totalPages - 4));
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, index) => startPage + index);
  return (
    <nav
      className="flex min-h-12 shrink-0 flex-wrap items-center justify-between gap-2 border-t bg-[hsl(var(--card))] px-[1rem] py-2"
      aria-label="Paginación documental"
    >
      <span className="text-xs text-muted-foreground" aria-live="polite">
        <strong className="font-semibold tabular-nums text-foreground">
          {firstVisible}–{lastVisible}
        </strong>{' '}
        de {resultCount} unidades
      </span>
      {totalPages > 1 ? (
        <div className="flex items-center gap-1">
          <span className="mr-2 hidden text-xs text-muted-foreground sm:inline">
            Página {page} de {totalPages}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={page <= 1}
            aria-label="Página anterior"
            onClick={() => onPageChange?.(page - 1)}
          >
            <ChevronLeft aria-hidden="true" />
          </Button>
          {pages.map((number) => (
            <Button
              key={number}
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8 font-mono text-xs',
                number === page &&
                  'bg-primary/10 font-semibold text-[hsl(var(--primary))] hover:bg-primary/15 hover:text-primary',
              )}
              aria-label={`Ir a página ${number}`}
              aria-current={number === page ? 'page' : undefined}
              onClick={() => onPageChange?.(number)}
            >
              {number}
            </Button>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={page >= totalPages}
            aria-label="Página siguiente"
            onClick={() => onPageChange?.(page + 1)}
          >
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
      ) : null}
    </nav>
  );
}

/** Presentation-only workspace. All receipt/filter/legal rules remain in the existing hook. */
export function DocumentalReviewTable({
  rows = [],
  loading = false,
  filters = {},
  vrOptions = [],
  resultCount = 0,
  hasFilters = false,
  page = 1,
  pageSize = 12,
  totalPages = 1,
  onFilterChange,
  onResetFilters,
  onPageChange,
  onRowAction,
  summary,
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const detailId = useId();
  const viewportRef = useRef(null);
  const tableViewportRef = useRef(null);
  const toolbarRef = useRef(null);
  const [availableHeight, setAvailableHeight] = useState(null);

  useLayoutEffect(() => {
    const element = viewportRef.current;
    if (!element) return undefined;
    const measure = () => {
      const top = Math.max(0, element.getBoundingClientRect().top);
      // Keep the workspace usable in short windows; the outer page can scroll.
      const height = Math.max(
        440,
        (toolbarRef.current?.offsetHeight || 0) + 320,
        window.innerHeight - top - 32,
      );
      setAvailableHeight((previous) => (previous === height ? previous : height));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element.parentElement);
    if (toolbarRef.current) observer.observe(toolbarRef.current);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, []);

  useEffect(() => {
    tableViewportRef.current?.scrollTo?.({ top: 0, left: 0, behavior: 'auto' });
    setSelectedId(null);
    setExpandedId(null);
  }, [
    page,
    filters.document,
    filters.vr,
    filters.date,
    filters.folios,
    filters.mediums,
    filters.statuses,
  ]);

  const selected = rows.find((row) => row.id === selectedId) || rows[0];
  const toggleRow = (row) => {
    setSelectedId(row.id);
    setExpandedId((previous) => (previous === row.id ? null : row.id));
  };

  return (
    <div
      ref={viewportRef}
      style={{ '--documental-height': availableHeight ? `${availableHeight}px` : '65dvh' }}
      className="flex min-h-0 flex-col overflow-hidden rounded-lg border bg-[hsl(var(--card))] shadow-sm lg:h-[var(--documental-height)]"
      data-testid="documental-review-workspace"
    >
      <DocumentalTableToolbar
        containerRef={toolbarRef}
        filters={filters}
        vrOptions={vrOptions}
        resultCount={resultCount}
        hasFilters={hasFilters}
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
        summary={summary}
        id={detailId}
      />
      <p role="status" className="sr-only">
        {loading
          ? 'Cargando documentos…'
          : selected
            ? `Documento seleccionado: ${selected.documentName || 'Documento sin nombre'}, código ${selected.documentCode || 'sin código'}. Ficha documental disponible después de la tabla.`
            : 'Sin documento seleccionado.'}
      </p>
      <div className="grid min-h-0 min-w-0 flex-1 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_350px] 2xl:grid-cols-[minmax(0,1fr)_370px]">
        <div className="flex min-h-0 min-w-0 flex-col">
          <div
            ref={tableViewportRef}
            className="max-h-[60dvh] min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring lg:max-h-none"
            tabIndex={0}
            role="region"
            aria-label="Tabla documental desplazable"
          >
            <table
              role="grid"
              className="w-full min-w-[660px] table-fixed border-collapse text-sm"
              aria-label="Documentos new por unidad documental"
              aria-busy={loading}
            >
              <TableHeader className="sticky top-0 z-10 bg-[hsl(var(--card))]">
                <TableRow className="border-border bg-muted/30 hover:bg-muted/30">
                  <TableHead scope="col" className="h-10 w-[44%] px-[1rem] text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Documento
                  </TableHead>
                  <TableHead
                    scope="col"
                    className="h-10 w-[20%] px-[0.75rem] text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    <span className="flex items-center gap-1.5">
                      <History className="h-3.5 w-3.5" aria-hidden="true" />
                      Última recepción
                    </span>
                  </TableHead>
                  <TableHead scope="col" className="h-10 w-[10%] px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Archive className="h-3.5 w-3.5" aria-hidden="true" />
                      Físico
                    </span>
                  </TableHead>
                  <TableHead scope="col" className="h-10 w-[10%] px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Monitor className="h-3.5 w-3.5" aria-hidden="true" />
                      Digital
                    </span>
                  </TableHead>
                  <TableHead
                    scope="col"
                    className="h-10 w-[16%] px-[0.75rem] text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    <span className="flex items-center gap-1.5">
                      <ScanLine className="h-3.5 w-3.5" aria-hidden="true" />
                      Escaneado
                    </span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 8 }, (_, index) => (
                      <TableRow key={index} className="border-border/60">
                        <TableCell className="px-[1rem] py-[0.75rem]">
                          <div className="flex items-center gap-[0.75rem]">
                            <Skeleton className="h-8 w-8 shrink-0" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-3 w-4/5" />
                              <Skeleton className="h-2 w-12" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-[0.75rem]">
                          <Skeleton className="h-5 w-24" />
                        </TableCell>
                        {[0, 1, 2].map((item) => (
                          <TableCell key={item} className="px-2">
                            <Skeleton className="h-4 w-10" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : rows.map((row) => {
                      const isSelected = selected?.id === row.id;
                      return (
                        <TableRow
                          key={row.id}
                          data-row-key={row.id}
                          aria-selected={isSelected}
                          tabIndex={isSelected ? 0 : -1}
                          onClick={() => toggleRow(row)}
                          onKeyDown={(event) => handleSelectableRowKeyDown(event, () => toggleRow(row))}
                          className={selectableRowClass(isSelected)}
                        >
                          <TableCell className={cn('relative px-[1rem] py-2', isSelected && selectedRowAccent)}>
                            <DocumentTitleButton
                              name={row.documentName}
                              code={row.documentCode}
                              expanded={expandedId === row.id}
                              selected={isSelected}
                              controlsId={`${detailId}-${row.id}`}
                              tabIndex={-1}
                            />
                          </TableCell>
                          <TableCell className="px-[0.75rem] py-2">
                            <VrCell latestVr={row.latestVr} />
                            <span className="mt-1 block font-mono text-[11px] leading-4 text-muted-foreground">
                              {row.latestDocumentDate || 'Sin fecha'}
                            </span>
                          </TableCell>
                          <TableCell className="px-2 py-2">
                            <ReceiptStatus row={row} medium="physical" />
                          </TableCell>
                          <TableCell className="px-2 py-2">
                            <ReceiptStatus row={row} medium="digital" />
                          </TableCell>
                          <TableCell className="px-[0.75rem] py-2">
                            <ScanStatus scanned={row.scanned} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                {!loading && !rows.length ? (
                  <TableRow>
                    <TableCell colSpan={5} className="px-6 py-16 text-center">
                      <FileSearch
                        className="mx-auto mb-[0.75rem] h-8 w-8 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <p className="mb-1 text-sm font-semibold text-foreground">
                        {hasFilters ? 'Sin coincidencias' : 'Aún no hay documentos'}
                      </p>
                      <p className="mb-[1rem] text-xs text-muted-foreground">
                        {hasFilters
                          ? 'Prueba con otro nombre, código o combinación de filtros.'
                          : 'Los documentos recibidos en este expediente aparecerán aquí.'}
                      </p>
                      {hasFilters ? (
                        <Button type="button" variant="outline" size="sm" onClick={onResetFilters}>
                          Limpiar filtros
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </table>
          </div>
          <DocumentalPagination
            page={page}
            totalPages={totalPages}
            pageSize={pageSize}
            resultCount={resultCount}
            onPageChange={onPageChange}
          />
        </div>
        {loading ? (
          <div className="flex flex-col gap-[0.75rem] border-t bg-muted/20 p-[1rem] lg:border-l lg:border-t-0" aria-hidden="true">
            <div className="flex items-center gap-[0.75rem]">
              <Skeleton className="h-9 w-9 shrink-0" />
              <Skeleton className="h-5 flex-1" />
            </div>
            <Skeleton className="h-36 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        ) : selected ? (
          <DocumentalDetailPanel
            key={selected.id}
            row={selected}
            onRowAction={onRowAction}
            headingId={`${detailId}-detail`}
          />
        ) : (
          <aside className="flex flex-col items-center justify-center gap-[0.75rem] border-t bg-muted/20 p-8 text-center lg:border-l lg:border-t-0">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-muted text-muted-foreground">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="mb-0 max-w-[16rem] text-xs leading-5 text-muted-foreground">
              Selecciona un documento para consultar sus soportes y recepciones.
            </p>
          </aside>
        )}
      </div>
    </div>
  );
}
