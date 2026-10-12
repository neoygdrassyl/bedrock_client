import { cn } from '@/lib/utils';

/**
 * Underlined segmented shortcuts (e.g. Todos / Por escanear / Escaneados).
 * options: [{ value, label, count? }]; an empty value means "all".
 */
export function DocumentalQuickFilters({ options, value = '', onChange, label = 'Accesos rápidos', className }) {
  return (
    <div className={cn('flex flex-wrap gap-[1rem] px-[1rem]', className)} role="group" aria-label={label}>
      {options.map((option) => {
        const active = (option.value || '') === (value || '');
        return (
          <button
            key={option.label}
            type="button"
            aria-pressed={active}
            onClick={() => onChange?.(option.value || '')}
            className={cn(
              'inline-flex items-center gap-1.5 border-x-0 border-t-0 border-b-2 border-solid bg-transparent px-0 py-2.5 text-xs font-medium transition-colors focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none',
              active
                ? 'border-primary text-[hsl(var(--primary))]'
                : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
            )}
          >
            {option.label}
            {Number.isFinite(option.count) ? (
              <span className="font-mono text-[11px] tabular-nums opacity-80">{option.count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export default DocumentalQuickFilters;
