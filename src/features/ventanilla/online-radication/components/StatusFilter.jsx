import { useRef } from 'react';
import { cn } from '@/shared/lib/utils';
import { STATUS_FILTERS } from '../onlineRadicationModel';

const PILL_BASE = 'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold leading-none tabular-nums';

function pillClass(filter, count, active) {
  if (filter === 'pending' && count > 0) {
    return 'bg-[hsl(var(--warning)/0.18)] text-[hsl(var(--operational-warning-text))] dark:text-[hsl(var(--warning))]';
  }
  if (filter === 'with_entries' && count > 0) return 'bg-primary/15 text-[hsl(var(--primary))]';
  return active ? 'bg-primary/10 text-[hsl(var(--primary))]' : 'bg-background/80 text-muted-foreground';
}

/**
 * Segmented status filter (radio group: arrow keys move and select, Tab leaves the group).
 * Counts come from `/counts`; "Todas" is the sum of the three states, and "Con entradas nuevas"
 * counts requests (of any open state) with document entries waiting.
 */
export function StatusFilter({ value, counts, onChange }) {
  const buttonsRef = useRef([]);

  function handleKeyDown(event, index) {
    const last = STATUS_FILTERS.length - 1;
    const moves = { ArrowRight: index + 1, ArrowDown: index + 1, ArrowLeft: index - 1, ArrowUp: index - 1, Home: 0, End: last };
    if (!(event.key in moves)) return;
    event.preventDefault();
    const next = (moves[event.key] + STATUS_FILTERS.length) % STATUS_FILTERS.length;
    buttonsRef.current[next]?.focus();
    onChange(STATUS_FILTERS[next].value);
  }

  return (
    <div
      role="radiogroup"
      aria-label="Filtrar solicitudes por estado"
      className="inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-lg border bg-muted/50 p-0.5"
    >
      {STATUS_FILTERS.map((filter, index) => {
        const active = filter.value === value;
        const count = counts ? counts[filter.countKey] : undefined;
        return (
          <button
            key={filter.value}
            ref={(node) => { buttonsRef.current[index] = node; }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(filter.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              'inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md border-[1px] border-solid border-transparent bg-transparent px-[0.75rem] text-[13px] font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              active
                ? 'border-[hsl(var(--border))] bg-background font-semibold text-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-background/60 hover:text-foreground',
            )}
          >
            {filter.label}
            {Number.isFinite(count) ? (
              <span className={cn(PILL_BASE, pillClass(filter.value, count, active))}>
                {count > 999 ? '999+' : count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
