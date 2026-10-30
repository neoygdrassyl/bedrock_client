import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/shared/ui/skeleton';
import { TINTS } from '../dashboardConfig';
import { WidgetCard, WidgetIcon } from './WidgetCard';

const TRACKED_SKELETON_ROWS = ['tracked-skeleton-1', 'tracked-skeleton-2'];

function TrackedRow({ item }) {
  return (
    <li>
      <Link
        to={item.href}
        className="group/row grid grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-xl px-2.5 py-2 text-foreground no-underline transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono !text-xs font-semibold text-foreground">{item.radicado}</span>
            <span className="rounded-full border border-border px-1.5 !text-xs leading-5 text-muted-foreground">{item.stateLabel}</span>
          </span>
          <span className="mt-0.5 block truncate !text-xs font-medium text-foreground">{item.title}</span>
          <span className="block truncate !text-xs text-muted-foreground">{item.description}</span>
        </span>
        <span className="flex flex-col items-end justify-between gap-2 text-right">
          <span className="whitespace-nowrap !text-xs text-muted-foreground">{item.dateLabel}</span>
          <WidgetIcon name="ArrowUpRight" size={14} className="text-muted-foreground/70 group-hover/row:text-primary" />
        </span>
      </Link>
    </li>
  );
}

function TrackedSection({ title, icon, items, loading, emptyText }) {
  return (
    <div className="px-2 pb-2">
      <div className="flex items-center justify-between px-2.5 py-1.5">
        <h3 className="m-0 flex items-center gap-1.5 !text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <WidgetIcon name={icon} size={13} />
          {title}
        </h3>
        <span className="!text-xs tabular-nums text-muted-foreground">{loading ? '…' : items.length}</span>
      </div>
      {loading ? (
        <div className="grid gap-2 px-2.5 py-1">
          {TRACKED_SKELETON_ROWS.map((key) => (
            <div key={key}>
              <Skeleton className="mb-1.5 h-4 w-1/3" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="m-0 px-2.5 pb-2 !text-xs text-muted-foreground">{emptyText}</p>
      ) : (
        <ul className="m-0 grid list-none gap-0.5 p-0">
          {items.map((item) => (
            <TrackedRow key={item.key} item={item} />
          ))}
        </ul>
      )}
    </div>
  );
}

function TrackedWidget({ personal, team, loading, error }) {
  return (
    <WidgetCard
      icon="Bookmark"
      tint={TINTS.primary}
      title="Expedientes marcados"
      subtitle="Seguimiento personal y del equipo"
      count={loading ? '…' : personal.length + team.length}
      headingId="dashboard-widget-tracked-title"
      footer={
        <div className="mt-auto border-t border-border/70 px-4 py-2.5 text-right">
          <Link to="/licencias/gestion-nueva" className="!text-xs font-medium text-primary no-underline hover:underline underline-offset-2">
            Ver gestión nueva
          </Link>
        </div>
      }
    >
      <TrackedSection
        title="Marcados para mí"
        icon="Bookmark"
        items={personal}
        loading={loading}
        emptyText="No tienes expedientes marcados para seguimiento personal."
      />
      <div className="mx-4 border-t border-dashed border-border/70" />
      <TrackedSection
        title="Marcados del equipo"
        icon="Users"
        items={team}
        loading={loading}
        emptyText="Aún no hay expedientes marcados para el equipo."
      />
      {error && (
        <p className="m-0 mx-4 mb-3 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 !text-xs text-warning">{error}</p>
      )}
    </WidgetCard>
  );
}

export default memo(TrackedWidget);
