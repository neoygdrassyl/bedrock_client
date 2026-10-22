import { Tag } from '../atoms/Tag';
import { cn } from '@/shared/lib/utils';

/**
 * Card-like block of the "Ficha documental" (same pattern as the Actualizar cards: bordered
 * surface, titled header, content). `aside` renders at the right of the title (e.g. a count).
 */
export function DetailSection({ id, title, aside, className, children, ...props }) {
  return (
    <section aria-labelledby={id} className={cn('min-w-0 rounded-lg border bg-[hsl(var(--card))] shadow-sm', className)} {...props}>
      <header className="flex min-h-9 items-center justify-between gap-2 border-b bg-muted/30 px-[0.75rem] py-1.5">
        <h4 id={id} className="mb-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h4>
        {aside}
      </header>
      <div className="p-[0.75rem]">{children}</div>
    </section>
  );
}

/** Labelled key/value pair of a detail grid (<dl>). */
export function DetailFact({ label, className, children }) {
  return (
    <div className={cn('min-w-0', className)}>
      <dt className="text-xs font-normal leading-4 text-muted-foreground">{label}</dt>
      <dd className="mb-0 mt-1 break-words text-sm font-medium leading-5 text-foreground">{children}</dd>
    </div>
  );
}

/** Small count/label pill used in section headers and timelines. */
export function DetailPill({ tone = 'neutral', className, children }) {
  return (
    <Tag tone={tone === 'primary' ? 'info' : tone} pill className={className}>
      {children}
    </Tag>
  );
}
