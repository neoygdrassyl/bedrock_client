import { ChartNoAxesColumn } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Skeleton } from '@/shared/ui/skeleton';

/**
 * The documentary counters (documentos, recepciones, físicos, digitales, faltantes) behind one small toolbar button,
 * so the table stays the visual focus. `metrics`: [{ label, value, icon, hint? }].
 */
export function DocumentMetricsPopover({ metrics, loading = false }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" aria-label="Resumen documental" data-testid="documents-metrics">
          <ChartNoAxesColumn aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-0" aria-label="Resumen documental">
        <dl className="m-0 flex flex-col divide-y" aria-busy={loading}>
          {metrics.map(({ label, value, icon: Icon, hint }) => (
            <div key={label} className="flex items-start justify-between gap-[0.75rem] px-[1rem] py-2">
              <dt className="flex min-w-0 flex-col text-xs font-medium leading-4 text-muted-foreground">
                <span className="flex items-center gap-1.5">{Icon ? <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> : null}{label}</span>
                {hint ? <span className="mt-0.5 text-[11px] font-normal leading-4 text-muted-foreground/80">{hint}</span> : null}
              </dt>
              <dd className="m-0 text-sm font-semibold leading-4 tabular-nums text-foreground">{loading ? <Skeleton className="h-4 w-6" /> : (value ?? '—')}</dd>
            </div>
          ))}
        </dl>
      </PopoverContent>
    </Popover>
  );
}

export default DocumentMetricsPopover;
