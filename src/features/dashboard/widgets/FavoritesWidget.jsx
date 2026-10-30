import { memo } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/shared/lib/utils';
import { DEFAULT_ICON_COLOR, ICON_COLORS, ITEMS_BY_ID, TINTS } from '../dashboardConfig';
import { WidgetCard, WidgetIcon } from './WidgetCard';

function FavoritesWidget({ favorites, onToggleFavorite }) {
  // Favorites pointing to modules unavailable in this deployment are skipped.
  const items = favorites.map((id) => ITEMS_BY_ID[id] && { id, ...ITEMS_BY_ID[id] }).filter(Boolean);

  return (
    <WidgetCard
      icon="Star"
      tint={TINTS.amber}
      title="Accesos rápidos"
      subtitle="Tus módulos marcados con estrella"
      count={items.length}
      headingId="dashboard-widget-favorites-title"
    >
      {items.length === 0 ? (
        <div className="mx-4 mb-4 flex items-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-3">
          <WidgetIcon name="Sparkles" size={16} className="shrink-0 text-amber-500" />
          <p className="m-0 !text-xs leading-5 text-muted-foreground">
            Marca con la estrella cualquier módulo para tenerlo aquí.
          </p>
        </div>
      ) : (
        <ul className="m-0 flex list-none flex-wrap gap-2 px-4 pb-4 pt-0">
          {items.map((item) => (
            <li key={item.id} className="group/pill relative flex items-center">
              <Link
                to={item.link}
                className="flex items-center gap-2 rounded-full border border-border/70 bg-background py-1.5 pl-1.5 pr-8 !text-sm font-medium text-foreground no-underline transition-[border-color,box-shadow] hover:border-primary/40 hover:text-foreground hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className={cn('flex h-6 w-6 items-center justify-center rounded-full', ICON_COLORS[item.link] || DEFAULT_ICON_COLOR)}>
                  <WidgetIcon name={item.icon} size={13} />
                </span>
                {item.title}
              </Link>
              <button
                type="button"
                onClick={() => onToggleFavorite(item.id)}
                aria-pressed="true"
                aria-label={`Quitar de accesos rápidos: ${item.title}`}
                title="Quitar de accesos rápidos"
                className="absolute right-1.5 flex h-6 w-6 items-center justify-center rounded-full border-0 bg-transparent p-0 text-amber-500 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <WidgetIcon name="Star" size={13} fill="currentColor" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}

export default memo(FavoritesWidget);
