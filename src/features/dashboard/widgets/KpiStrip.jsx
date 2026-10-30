import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/shared/lib/utils';
import { KPI_ITEMS } from '../dashboardConfig';
import { CARD_CLASS, IconTile, WidgetIcon } from './WidgetCard';

const WIDE_SIZES = new Set(['lg', 'full']);

function KpiStrip({ counts, loading, size }) {
  return (
    <ul
      className={cn('m-0 grid list-none gap-3 p-0', WIDE_SIZES.has(size) ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2')}
      aria-label="Indicadores operativos"
    >
      {KPI_ITEMS.map((kpi) => {
        const value = counts[kpi.countKey || kpi.link];
        const pending = loading || value === undefined;
        return (
          <li key={kpi.countKey || kpi.link} className="min-w-0">
            <Link
              to={kpi.link}
              className={cn(
                CARD_CLASS,
                'group flex items-center gap-3 px-4 py-3.5 text-foreground no-underline hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              )}
            >
              <IconTile icon={kpi.icon} tint={kpi.tint} size="lg" />
              <span className="flex min-w-0 flex-1 flex-col">
                {pending ? (
                  <Skeleton className="mb-1 h-7 w-12 rounded-md" />
                ) : (
                  <span className="!text-2xl font-semibold !leading-8 tabular-nums tracking-tight text-foreground">
                    {value == null ? '—' : value.toLocaleString('es-CO')}
                  </span>
                )}
                <span className="truncate !text-xs text-muted-foreground">{kpi.label}</span>
              </span>
              <WidgetIcon
                name="ArrowUpRight"
                size={16}
                className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default memo(KpiStrip);
