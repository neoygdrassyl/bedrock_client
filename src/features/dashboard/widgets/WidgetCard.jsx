import { GripVertical, MessagesSquare, RotateCcw } from 'lucide-react';
import { Icon } from '@/shared/components/icon';
import { cn } from '@/shared/lib/utils';

// Icons used by the dashboard that are not part of the shared registry.
const EXTRA_ICONS = { GripVertical, MessagesSquare, RotateCcw };

export function WidgetIcon({ name, size = 16, className, ...rest }) {
  const Extra = EXTRA_ICONS[name];
  if (Extra) return <Extra size={size} className={className} aria-hidden="true" {...rest} />;
  return <Icon name={name} size={size} className={className} aria-hidden="true" {...rest} />;
}

export const CARD_CLASS =
  'rounded-2xl border border-border/70 bg-card text-card-foreground shadow-[0_8px_24px_-18px_rgba(15,23,42,0.35)] transition-[border-color,box-shadow] duration-200 hover:border-primary/30 hover:shadow-[0_16px_32px_-20px_rgba(15,23,42,0.45)]';

export function IconTile({ icon, tint, size = 'md' }) {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center',
        size === 'lg' ? 'h-10 w-10 rounded-xl' : size === 'sm' ? 'h-7 w-7 rounded-lg' : 'h-9 w-9 rounded-xl',
        tint
      )}
    >
      <WidgetIcon name={icon} size={size === 'lg' ? 18 : size === 'sm' ? 14 : 16} />
    </span>
  );
}

/** Shared card shell: tinted icon tile, title, optional subtitle and counter. */
export function WidgetCard({ icon, tint, title, subtitle, count, children, footer, className, headingId }) {
  return (
    <section className={cn(CARD_CLASS, 'flex flex-col overflow-hidden', className)} aria-labelledby={headingId}>
      <header className="flex items-center justify-between gap-3 px-4 pb-3 pt-4">
        <div className="flex min-w-0 items-center gap-3">
          <IconTile icon={icon} tint={tint} />
          <div className="min-w-0">
            <h2 id={headingId} className="m-0 truncate !text-sm font-semibold !leading-5 text-foreground">
              {title}
            </h2>
            {subtitle && <p className="m-0 truncate !text-xs !leading-4 text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {count != null && (
          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 !text-xs font-medium tabular-nums text-muted-foreground">
            {count}
          </span>
        )}
      </header>
      {children}
      {footer}
    </section>
  );
}
