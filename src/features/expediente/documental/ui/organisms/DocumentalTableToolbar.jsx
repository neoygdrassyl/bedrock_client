import { Tag } from '../atoms/Tag';
import { ListFilter, RotateCcw, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import { ColumnFilterField } from '../molecules/ColumnFilterField';
import { DocumentalSearchField } from '../molecules/DocumentalSearchField';
import { DocumentalQuickFilters } from '../molecules/DocumentalQuickFilters';

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
  summary,
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
    <div ref={containerRef} className="shrink-0 border-b bg-[hsl(var(--card))]">
      <div className="flex flex-wrap items-center gap-2 px-[1rem] py-[0.75rem]">
        <DocumentalSearchField
          id={`${id}-search`}
          value={filters.document || ''}
          onChange={(value) => onFilterChange?.('document', value)}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-expanded={filtersOpen}
          aria-controls={`${id}-filters`}
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={cn(
            (filtersOpen || activeFilters.length > 0) &&
              'bg-primary/5 text-[hsl(var(--primary))] hover:bg-primary/10 hover:text-[hsl(var(--primary))]',
          )}
        >
          <ListFilter aria-hidden="true" />
          Filtros
          {activeFilters.length > 0 ? (
            <Tag tone="info" pill className="justify-center">
              {activeFilters.length}
            </Tag>
          ) : null}
        </Button>
        {hasFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="px-2.5 text-muted-foreground"
          >
            <RotateCcw aria-hidden="true" />
            Limpiar
          </Button>
        ) : null}
        <span className="ml-auto text-xs text-muted-foreground" aria-live="polite">
          <strong className="font-semibold tabular-nums text-foreground">
            {resultCount}
          </strong>{' '}
          {resultCount === 1 ? 'unidad' : 'unidades'}
        </span>
      </div>

      {filtersOpen ? (
        <div
          id={`${id}-filters`}
          className="grid gap-[0.75rem] border-t bg-muted/20 p-[1rem] sm:grid-cols-2 xl:grid-cols-5"
        >
          <label className="flex min-w-0 flex-col gap-1.5 text-[13px] font-medium leading-5 text-foreground">
            Último VR
            <ColumnFilterField
              type="select"
              value={filters.vr || ''}
              options={vrOptions}
              onChange={(value) => onFilterChange?.('vr', value)}
              aria-label="Filtrar por último VR"
            />
          </label>
          <label className="flex min-w-0 flex-col gap-1.5 text-[13px] font-medium leading-5 text-foreground">
            Medio recibido
            <ColumnFilterField
              type="select"
              value={medium}
              options={MEDIUM_OPTIONS}
              onChange={(value) => onFilterChange?.('mediums', value ? [value] : [])}
              aria-label="Filtrar por medio recibido"
            />
          </label>
          <label className="flex min-w-0 flex-col gap-1.5 text-[13px] font-medium leading-5 text-foreground">
            Escaneado
            <ColumnFilterField
              type="select"
              value={status}
              options={SCAN_OPTIONS}
              onChange={(value) => onFilterChange?.('statuses', value ? [value] : [])}
              aria-label="Filtrar por escaneo"
            />
          </label>
          <label className="flex min-w-0 flex-col gap-1.5 text-[13px] font-medium leading-5 text-foreground">
            Fecha del último documento
            <ColumnFilterField
              name="documentalDate"
              value={filters.date || ''}
              onChange={(value) => onFilterChange?.('date', value)}
              placeholder="AAAA-MM-DD"
              aria-label="Filtrar por fecha"
            />
          </label>
          <label className="flex min-w-0 flex-col gap-1.5 text-[13px] font-medium leading-5 text-foreground">
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

      <div className="flex flex-wrap items-center justify-between gap-x-[1rem] gap-y-1 pr-[1rem]">
        <DocumentalQuickFilters
          label="Accesos rápidos de escaneo"
          options={[{ value: '', label: 'Todos' }, SCAN_OPTIONS[1], SCAN_OPTIONS[0]]}
          // Several statuses selected from the filter panel leave no shortcut active.
          value={filters.statuses?.length ? status || 'multiple' : ''}
          onChange={(value) => onFilterChange?.('statuses', value ? [value] : [])}
        />
        {summary ? <div className="min-w-0 py-1.5 pl-[1rem] sm:pl-0">{summary}</div> : null}
      </div>
    </div>
  );
}
