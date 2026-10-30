import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/shared/lib/utils';
import { DEFAULT_ICON_COLOR, ICON_COLORS, getItemId } from '../dashboardConfig';
import { WidgetCard, WidgetIcon } from './WidgetCard';

const ITEM_GRID_BY_SIZE = {
  sm: 'grid-cols-1',
  md: 'grid-cols-1 sm:grid-cols-2',
  lg: 'grid-cols-1 sm:grid-cols-2',
  full: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3',
};

function RowTrailing({ item, counts, loadingCounts }) {
  const countKey = item.countKey || item.link;
  const hasCount = item.showCount !== false && Object.prototype.hasOwnProperty.call(counts, countKey);
  const count = counts[countKey];

  if (item.status) {
    return (
      <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 !text-xs font-medium text-indigo-600 dark:text-indigo-400">
        {item.status}
      </span>
    );
  }
  if (loadingCounts && hasCount) return <Skeleton className="h-5 w-8 rounded-full" />;
  if (hasCount && count != null) {
    return (
      <span className="rounded-full bg-muted px-2 py-0.5 !text-xs font-semibold tabular-nums text-foreground">
        {count.toLocaleString('es-CO')}
      </span>
    );
  }
  if (hasCount) {
    return (
      <span className="rounded-full px-1.5 !text-xs text-muted-foreground" title="Conteo no disponible">
        —
      </span>
    );
  }
  return (
    <WidgetIcon
      name="ArrowUpRight"
      size={15}
      className="text-muted-foreground/70 transition-colors group-hover/row:text-primary"
    />
  );
}

export function ModuleRow({ item, counts, loadingCounts, starred, onToggleFavorite }) {
  const itemId = getItemId(item);
  const iconColor = ICON_COLORS[item.link] || DEFAULT_ICON_COLOR;

  return (
    <li className="group/row relative flex min-w-0 items-center rounded-xl transition-colors hover:bg-muted/60 focus-within:bg-muted/60">
      <Link
        to={item.link}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-xl py-2 pl-2.5 pr-10 text-foreground no-underline hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', iconColor)}>
          <WidgetIcon name={item.icon} size={15} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate !text-sm font-medium !leading-5 text-foreground">{item.title}</span>
          <span className="truncate !text-xs !leading-4 text-muted-foreground">{item.desc}</span>
        </span>
        <span className="flex shrink-0 items-center">
          <RowTrailing item={item} counts={counts} loadingCounts={loadingCounts} />
        </span>
      </Link>
      <button
        type="button"
        onClick={() => onToggleFavorite(itemId)}
        aria-pressed={starred}
        aria-label={starred ? `Quitar de accesos rápidos: ${item.title}` : `Agregar a accesos rápidos: ${item.title}`}
        title={starred ? 'Quitar de accesos rápidos' : 'Agregar a accesos rápidos'}
        className={cn(
          'absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg border-0 bg-transparent p-0 transition-[opacity,color,background-color] hover:bg-background focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          starred
            ? 'text-amber-500 opacity-100'
            : 'text-muted-foreground opacity-0 hover:text-amber-500 group-hover/row:opacity-100 group-focus-within/row:opacity-100 touch:opacity-100'
        )}
      >
        <WidgetIcon name="Star" size={15} fill={starred ? 'currentColor' : 'none'} />
      </button>
    </li>
  );
}

function ModuleGroupWidget({ group, counts, loadingCounts, favoriteSet, onToggleFavorite, size }) {
  return (
    <WidgetCard
      icon={group.icon}
      tint={group.tint}
      title={group.title}
      subtitle={group.description}
      count={group.items.length}
      headingId={`dashboard-widget-${group.key}-title`}
    >
      <ul className={cn('m-0 grid list-none gap-0.5 px-2 pb-2.5 pt-0', ITEM_GRID_BY_SIZE[size] || ITEM_GRID_BY_SIZE.sm)}>
        {group.items.map((item) => {
          const itemId = getItemId(item);
          return (
            <ModuleRow
              key={itemId}
              item={item}
              counts={counts}
              loadingCounts={loadingCounts}
              starred={favoriteSet.has(itemId)}
              onToggleFavorite={onToggleFavorite}
            />
          );
        })}
      </ul>
    </WidgetCard>
  );
}

export default memo(ModuleGroupWidget);
