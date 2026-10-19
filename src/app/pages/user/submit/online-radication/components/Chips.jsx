import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { MISSING } from '../onlineRadicationModel';

export function Chip({ className, title, children }) {
  return (
    <span
      title={title}
      className={cn(
        'inline-flex max-w-full items-center truncate rounded-md border-[1px] bg-muted/50 px-2 py-0.5 text-xs font-medium leading-5 text-foreground',
        className,
      )}
    >
      <span className="truncate">{children}</span>
    </span>
  );
}

/** Up to `max` chips and a "+N" chip whose tooltip lists the rest. */
export function ChipList({ values = [], max = 2, emptyLabel = MISSING, className }) {
  if (!values.length) return <span className="text-sm text-muted-foreground">{emptyLabel}</span>;
  const visible = max ? values.slice(0, max) : values;
  const hidden = max ? values.slice(max) : [];
  return (
    <span className={cn('flex flex-wrap items-center gap-1', className)}>
      {visible.map((value, index) => <Chip key={`${value}-${index}`} title={value}>{value}</Chip>)}
      {hidden.length ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex shrink-0 cursor-default items-center rounded-md bg-muted px-1.5 py-0.5 text-xs font-semibold leading-5 tabular-nums text-muted-foreground">
              +{hidden.length}
              <span className="sr-only">: {hidden.join(', ')}</span>
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-xs">
            <ul className="mb-0 list-none space-y-0.5 p-0">
              {hidden.map((value, index) => <li key={`${value}-${index}`}>{value}</li>)}
            </ul>
          </TooltipContent>
        </Tooltip>
      ) : null}
    </span>
  );
}
