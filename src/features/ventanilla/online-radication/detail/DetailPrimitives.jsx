import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/collapsible';
import { cn } from '@/shared/lib/utils';
import { MISSING, hasValue } from '../onlineRadicationModel';

const CARD = 'min-w-0 overflow-hidden rounded-xl border bg-[hsl(var(--card))] shadow-sm';

function SectionIcon({ icon: Icon }) {
  if (!Icon) return null;
  return (
    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-[hsl(var(--primary))]">
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
    </span>
  );
}

export function CountPill({ children, label }) {
  return (
    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-[11px] font-semibold tabular-nums text-muted-foreground">
      <span aria-hidden={label ? 'true' : undefined}>{children}</span>
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );
}

/** Titled card of the detail sheet. */
export function DetailCard({ icon, title, aside, className, contentClassName, children }) {
  const titleId = useId();
  return (
    <section aria-labelledby={titleId} className={cn(CARD, className)}>
      <header className="flex min-h-11 items-center justify-between gap-[0.75rem] border-b px-[1rem] py-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <SectionIcon icon={icon} />
          <h3 id={titleId} className="mb-0 truncate text-sm font-semibold leading-5 text-foreground">{title}</h3>
        </div>
        {aside ? <div className="flex shrink-0 items-center gap-2">{aside}</div> : null}
      </header>
      <div className={cn('px-[1rem] py-[0.875rem]', contentClassName)}>{children}</div>
    </section>
  );
}

/** Card whose body can be folded; the header is the toggle button. */
export function CollapsibleCard({ icon, title, aside, defaultOpen = false, contentClassName, children }) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();
  return (
    <Collapsible open={open} onOpenChange={setOpen} className={CARD}>
      <h3 className="mb-0 text-sm">
        <CollapsibleTrigger
          aria-controls={contentId}
          className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-[0.75rem] bg-transparent px-[1rem] py-2 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        >
          <span className="flex min-w-0 items-center gap-2.5">
            <SectionIcon icon={icon} />
            <span className="truncate text-sm font-semibold leading-5 text-foreground">{title}</span>
            {aside}
          </span>
          <ChevronDown
            className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none', open && 'rotate-180')}
            aria-hidden="true"
          />
        </CollapsibleTrigger>
      </h3>
      <CollapsibleContent id={contentId} className={cn('border-t px-[1rem] py-[0.875rem]', contentClassName)}>
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function FactGrid({ columns = 2, className, children }) {
  return (
    <dl
      className={cn(
        'm-0 grid gap-x-6 gap-y-[0.875rem]',
        columns === 2 && 'sm:grid-cols-2',
        columns === 3 && 'sm:grid-cols-2 lg:grid-cols-3',
        className,
      )}
    >
      {children}
    </dl>
  );
}

/** Label/value pair; empty values render an explicit "—" (never hidden). */
export function Fact({ label, value, children, wide = false, mono = false, className }) {
  const content = children ?? value;
  const empty = !hasValue(content);
  return (
    <div className={cn('min-w-0', wide && 'sm:col-span-full', className)}>
      <dt className="text-xs font-medium leading-4 text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          'mb-0 ml-0 mt-1 break-words text-sm leading-5 text-foreground',
          mono && !empty && 'font-mono text-[13px]',
          empty && 'text-muted-foreground',
        )}
      >
        {empty ? MISSING : content}
      </dd>
    </div>
  );
}

export function EmptyNote({ children }) {
  return <p className="mb-0 text-sm leading-5 text-muted-foreground">{children}</p>;
}

/** Bordered sub-card for one person (titular, profesional, responsable). */
export function PersonCard({ title, meta, badges, children }) {
  return (
    <article className="min-w-0 rounded-lg border bg-muted/20 px-[0.875rem] py-[0.75rem]">
      <header className="mb-[0.625rem] flex flex-wrap items-center gap-x-2 gap-y-1">
        <h4 className="mb-0 text-sm font-semibold leading-5 text-foreground">{title || MISSING}</h4>
        {meta ? <span className="text-xs text-muted-foreground">{meta}</span> : null}
        {badges ? <span className="flex flex-wrap items-center gap-1">{badges}</span> : null}
      </header>
      {children}
    </article>
  );
}

/** Compact read-only table for repeated rows (vecinos, linderos). */
export function MiniTable({ label, columns, rows }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm" aria-label={label}>
        <thead className="bg-muted/40">
          <tr className="border-b">
            {columns.map((column) => (
              <th key={column.key} scope="col" className={cn('whitespace-nowrap px-[0.75rem] py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground', column.className)}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.key ?? index} className="border-b border-border/70 last:border-b-0">
              {columns.map((column) => {
                const value = column.render ? column.render(row) : row[column.key];
                return (
                  <td key={column.key} className={cn('px-[0.75rem] py-2 align-top text-foreground', !hasValue(value) && 'text-muted-foreground', column.cellClassName)}>
                    {hasValue(value) ? value : MISSING}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
