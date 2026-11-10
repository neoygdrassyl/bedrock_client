import { useId } from 'react';
import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { cn } from '@/shared/lib/utils';
import { fieldClass } from './FormField';

/**
 * One "Filtros" button for a documents table: a popover with one labelled select per filter (`fields`:
 * [{ key, label, allLabel, options: [{ value, label }] }], fields without options are left out), the number of active
 * filters as a badge and "Limpiar filtros". `values` holds the current value of each key ('' = all).
 */
export function DocumentFiltersMenu({ fields, values, activeCount = 0, onChange, onClear }) {
  const ids = useId();
  const shown = fields.filter((field) => field.options.length);
  if (!shown.length) return null;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="h-9" aria-label={activeCount ? `Filtros (${activeCount} activos)` : 'Filtros'} data-testid="documents-filters">
          <SlidersHorizontal aria-hidden="true" />Filtros
          {activeCount ? <span className="ml-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-semibold tabular-nums text-primary-foreground" aria-hidden="true">{activeCount}</span> : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(20rem,calc(100vw-2rem))] p-0" aria-label="Filtros de documentos">
        <div className="flex flex-col gap-[0.75rem] p-[1rem]">
          {shown.map((field) => (
            <div key={field.key} className="flex flex-col gap-1">
              <label htmlFor={`${ids}-${field.key}`} className="mb-0 text-xs font-medium text-foreground">{field.label}</label>
              <select id={`${ids}-${field.key}`} className={cn(fieldClass, 'h-9')} value={values[field.key] || ''} onChange={(event) => onChange(field.key, event.target.value)}>
                <option value="">{field.allLabel}</option>
                {field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between gap-2 border-t bg-muted/30 px-[1rem] py-2">
          <span className="text-xs text-muted-foreground" aria-live="polite">{activeCount ? `${activeCount} ${activeCount === 1 ? 'filtro activo' : 'filtros activos'}` : 'Sin filtros'}</span>
          <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-xs" disabled={!activeCount} onClick={onClear}><RotateCcw aria-hidden="true" />Limpiar filtros</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default DocumentFiltersMenu;
