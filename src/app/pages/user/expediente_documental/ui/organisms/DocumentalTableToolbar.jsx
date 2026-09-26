import { ListFilter, RotateCcw, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ColumnFilterField } from '../molecules/ColumnFilterField';

const MEDIUM_OPTIONS = [
  { value: 'physical', label: 'Físico' },
  { value: 'digital', label: 'Digital' },
];
const SCAN_OPTIONS = [
  { value: 'scanned', label: 'Escaneados' },
  { value: 'pending_scan', label: 'Por escanear' },
  { value: 'not_applicable', label: 'No aplica' },
];

export function DocumentalTableToolbar({
  containerRef,
  filters,
  vrOptions,
  resultCount,
  hasFilters,
  filtersOpen,
  setFiltersOpen,
  onFilterChange,
  onResetFilters,
  id,
}) {
  const medium = filters.mediums?.length === 1 ? filters.mediums[0] : '';
  const status = filters.statuses?.length === 1 ? filters.statuses[0] : '';
  const activeFilters = [
    filters.vr && {
      key: 'vr',
      label: `VR: ${vrOptions.find((option) => option.value === filters.vr)?.label || filters.vr}`,
      reset: '',
    },
    ...(filters.mediums || []).map((value) => ({
      key: 'mediums',
      value,
      label: MEDIUM_OPTIONS.find((option) => option.value === value)?.label || value,
      reset: filters.mediums.filter((item) => item !== value),
    })),
    ...(filters.statuses || []).map((value) => ({
      key: 'statuses',
      value,
      label: SCAN_OPTIONS.find((option) => option.value === value)?.label || value,
      reset: filters.statuses.filter((item) => item !== value),
    })),
    filters.date && { key: 'date', label: `Fecha: ${filters.date}`, reset: '' },
    filters.folios && { key: 'folios', label: `Folios: ${filters.folios}`, reset: '' },
  ].filter(Boolean);

  return (
    <div ref={containerRef} className="shrink-0 border-b border-border bg-[hsl(var(--card))]">
      <div className="flex flex-wrap items-center gap-[0.75rem] px-[1rem] py-[0.75rem]">
        <div className="relative min-w-0 basis-full sm:max-w-sm sm:flex-1 sm:basis-auto">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id={`${id}-search`}
            name="documentalSearch"
            value={filters.document || ''}
            onChange={(event) => onFilterChange?.('document', event.target.value)}
            placeholder="Buscar por nombre o código…"
            aria-label="Buscar documento o código"
            className="h-9 bg-background px-[2.25rem] text-sm"
          />
          {filters.document ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-0.5 h-8 w-8"
              aria-label="Limpiar búsqueda"
              onClick={() => onFilterChange?.('document', '')}
            >
              <X aria-hidden="true" />
            </Button>
          ) : null}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-expanded={filtersOpen}
          aria-controls={`${id}-filters`}
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={cn(
            'text-xs',
            (filtersOpen || activeFilters.length > 0) &&
              'border-primary/30 bg-primary/5 text-[hsl(var(--primary))]',
          )}
        >
          <ListFilter aria-hidden="true" />
          Filtros
          {activeFilters.length > 0 ? (
            <span className="grid h-4 min-w-4 place-items-center rounded bg-primary/10 px-1 font-mono text-[10px]">
              {activeFilters.length}
            </span>
          ) : null}
        </Button>
        {hasFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="px-2 text-xs text-muted-foreground"
          >
            <RotateCcw aria-hidden="true" />
            Limpiar
          </Button>
        ) : null}
        <span className="ml-auto text-xs text-muted-foreground" aria-live="polite">
          <strong className="font-mono font-medium tabular-nums text-foreground">
            {resultCount}
          </strong>{' '}
          {resultCount === 1 ? 'unidad' : 'unidades'}
        </span>
      </div>

      {filtersOpen ? (
        <div
          id={`${id}-filters`}
          className="grid gap-[0.75rem] border-t border-border/60 bg-muted/20 p-[1rem] sm:grid-cols-2 xl:grid-cols-5"
        >
          <label className="space-y-1.5 text-xs font-medium text-foreground">
            Último VR
            <ColumnFilterField
              type="select"
              value={filters.vr || ''}
              options={vrOptions}
              onChange={(value) => onFilterChange?.('vr', value)}
              aria-label="Filtrar por último VR"
            />
          </label>
          <label className="space-y-1.5 text-xs font-medium text-foreground">
            Medio recibido
            <ColumnFilterField
              type="select"
              value={medium}
              options={MEDIUM_OPTIONS}
              onChange={(value) => onFilterChange?.('mediums', value ? [value] : [])}
              aria-label="Filtrar por medio recibido"
            />
          </label>
          <label className="space-y-1.5 text-xs font-medium text-foreground">
            Escaneado
            <ColumnFilterField
              type="select"
              value={status}
              options={SCAN_OPTIONS}
              onChange={(value) => onFilterChange?.('statuses', value ? [value] : [])}
              aria-label="Filtrar por escaneo"
            />
          </label>
          <label className="space-y-1.5 text-xs font-medium text-foreground">
            Fecha del último documento
            <ColumnFilterField
              name="documentalDate"
              value={filters.date || ''}
              onChange={(value) => onFilterChange?.('date', value)}
              placeholder="AAAA-MM-DD"
              aria-label="Filtrar por fecha"
            />
          </label>
          <label className="space-y-1.5 text-xs font-medium text-foreground">
            Folios digitales o físicos
            <ColumnFilterField
              name="documentalFolios"
              value={filters.folios || ''}
              onChange={(value) => onFilterChange?.('folios', value)}
              placeholder="Número de folios"
              inputMode="numeric"
              aria-label="Filtrar por folios"
            />
          </label>
        </div>
      ) : (
        <div id={`${id}-filters`} hidden />
      )}

      {activeFilters.length > 0 ? (
        <div className="flex flex-wrap gap-2 px-[1rem] pb-[0.75rem]" aria-label="Filtros activos">
          {activeFilters.map((filter) => (
            <Button
              key={`${filter.key}-${filter.value || ''}`}
              type="button"
              variant="outline"
              size="sm"
              className="h-7 max-w-full gap-2 rounded-md border-border/80 bg-muted/30 px-2 text-xs font-normal"
              aria-label={`Quitar filtro ${filter.label}`}
              onClick={() => onFilterChange?.(filter.key, filter.reset)}
            >
              <span className="truncate">{filter.label}</span>
              <X className="shrink-0" aria-hidden="true" />
            </Button>
          ))}
        </div>
      ) : null}

      <div
        className="flex flex-wrap gap-[1rem] px-[1rem]"
        role="group"
        aria-label="Accesos rápidos de escaneo"
      >
        {[{ value: '', label: 'Todos' }, SCAN_OPTIONS[1], SCAN_OPTIONS[0]].map((option) => {
          const active = option.value ? status === option.value : !filters.statuses?.length;
          return (
            <button
              key={option.label}
              type="button"
              aria-pressed={active}
              onClick={() => onFilterChange?.('statuses', option.value ? [option.value] : [])}
              className={cn(
                'border-x-0 border-t-0 border-b-2 border-solid bg-transparent px-0 py-2.5 text-xs font-medium transition-colors focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none',
                active
                  ? 'border-primary text-[hsl(var(--primary))]'
                  : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
