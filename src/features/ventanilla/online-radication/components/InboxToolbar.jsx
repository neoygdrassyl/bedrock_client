import { useId } from 'react';
import { RefreshCw, Search, X } from 'lucide-react';
import { DovelaButton, DovelaInput } from '@/shared/dovela-ui';
import { cn } from '@/shared/lib/utils';
import { StatusFilter } from './StatusFilter';

/**
 * One-row toolbar: status filter with counts, search (debounced by the container) and refresh.
 * Wraps onto two rows only when the inbox is narrow.
 */
export function InboxToolbar({ status, counts, onStatusChange, search, onSearchChange, onRefresh, refreshing = false, refreshDisabled = false }) {
  const searchId = useId();
  const hintId = `${searchId}-hint`;
  return (
    <div className="flex flex-wrap items-center gap-x-[0.75rem] gap-y-2 border-b border-border/70 px-[1.25rem] py-2.5">
      <div className="min-w-0 max-w-full">
        <StatusFilter value={status} counts={counts} onChange={onStatusChange} />
      </div>
      <div className="ml-auto flex min-w-0 flex-[1_1_18rem] items-center gap-2 sm:max-w-[26rem]">
        <div className="relative min-w-0 flex-1">
          <label htmlFor={searchId} className="sr-only">Buscar solicitudes</label>
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <DovelaInput
            id={searchId}
            type="text"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Escape' && search) { event.preventDefault(); onSearchChange(''); } }}
            placeholder="Código, solicitante, documento, dirección o VR"
            aria-describedby={hintId}
            className="h-8 px-[2rem] text-[13px]"
          />
          <span id={hintId} className="sr-only">
            Busca en el código del portal, el nombre o documento del solicitante, la dirección del predio, el número de expediente y el VR.
          </span>
          {search ? (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Limpiar búsqueda"
              className="absolute right-1 top-1/2 inline-grid h-6 w-6 -translate-y-1/2 cursor-pointer place-items-center rounded-md border-0 bg-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          ) : null}
        </div>
        {onRefresh ? (
          <DovelaButton
            tone="neutral"
            size="sm"
            onClick={onRefresh}
            disabled={refreshDisabled || refreshing}
            aria-label={refreshing ? 'Actualizando la lista' : 'Actualizar la lista'}
            title="Actualizar"
            className="h-8 shrink-0 gap-1.5 px-2.5 text-[13px] [&_svg]:size-3.5"
          >
            <RefreshCw aria-hidden="true" className={cn(refreshing && 'animate-spin motion-reduce:animate-none')} />
            <span className="hidden md:inline">{refreshing ? 'Actualizando…' : 'Actualizar'}</span>
          </DovelaButton>
        ) : null}
      </div>
    </div>
  );
}
