import { useId } from 'react';
import { Search, X } from 'lucide-react';
import { DovelaInput } from '@/shared/dovela-ui';
import { StatusFilter } from './StatusFilter';

/** Status filter + debounced search (the debounce lives in the container). */
export function InboxToolbar({ status, counts, onStatusChange, search, onSearchChange }) {
  const searchId = useId();
  const hintId = `${searchId}-hint`;
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-[1rem] gap-y-[0.75rem] border-y bg-muted/20 px-[1.25rem] py-[0.75rem]">
      <StatusFilter value={status} counts={counts} onChange={onStatusChange} />
      <div className="relative w-full sm:w-[26rem]">
        <label htmlFor={searchId} className="sr-only">Buscar solicitudes</label>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <DovelaInput
          id={searchId}
          type="text"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          onKeyDown={(event) => { if (event.key === 'Escape' && search) { event.preventDefault(); onSearchChange(''); } }}
          placeholder="Buscar por código, solicitante, documento o VR"
          aria-describedby={hintId}
          className="h-9 px-[2.25rem]"
        />
        <span id={hintId} className="sr-only">
          Busca en el código del portal, el nombre o documento del solicitante, la dirección del predio, el número de expediente y el VR.
        </span>
        {search ? (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Limpiar búsqueda"
            className="absolute right-1 top-1/2 inline-grid h-7 w-7 -translate-y-1/2 cursor-pointer place-items-center rounded-md bg-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
