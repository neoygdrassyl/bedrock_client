import { Tag } from '../atoms/Tag';
import { cn } from '@/shared/lib/utils';

/**
 * Underlined segmented shortcuts (e.g. Todos / Por escanear / Escaneados).
 * options: [{ value, label, count? }]; an empty value means "all".
 */
export function DocumentalQuickFilters({ options, value = '', onChange, label = 'Accesos rápidos', className }) {
  return (
    <div className={cn('flex flex-wrap gap-x-[1.25rem] px-[1rem]', className)} role="group" aria-label={label}>
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
                ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]'
                : 'border-transparent text-muted-foreground hover:border-[hsl(var(--border))] hover:text-foreground',
            )}
          >
            {option.label}
            {Number.isFinite(option.count) ? (
              <Tag tone={active ? 'info' : 'neutral'} pill>{option.count}</Tag>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export default DocumentalQuickFilters;
