import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { cn } from '@/shared/lib/utils';
import { MISSING } from '../onlineRadicationModel';

const CHIP = 'inline-flex max-w-full items-center truncate rounded-md border-[1px] bg-muted/50 px-2 py-0.5 text-xs font-medium leading-5 text-foreground';
const DENSE_CHIP = 'min-w-0 px-1.5 py-0 text-[11px] leading-4';

export function Chip({ className, title, children }) {
  return (
    <span title={title} className={cn(CHIP, className)}>
      <span className="truncate">{children}</span>
    </span>
  );
}

/**
 * Up to `max` chips and a "+N" chip whose tooltip lists the rest. `dense` renders them on a single
 * line (11 px, truncated) for table rows and cards.
 */
export function ChipList({ values = [], max = 2, emptyLabel = MISSING, dense = false, className }) {
  if (!values.length) return <span className={cn('text-muted-foreground', dense ? 'text-[11px]' : 'text-sm')}>{emptyLabel}</span>;
  const visible = max ? values.slice(0, max) : values;
  const hidden = max ? values.slice(max) : [];
  return (
    <span className={cn('flex items-center gap-1', dense ? 'min-w-0 flex-nowrap overflow-hidden' : 'flex-wrap', className)}>
      {visible.map((value, index) => (
        <Chip key={`${value}-${index}`} title={value} className={cn(dense && DENSE_CHIP)}>{value}</Chip>
      ))}
      {hidden.length ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(
                'inline-flex shrink-0 cursor-default items-center rounded-md bg-muted font-semibold tabular-nums text-muted-foreground',
                dense ? 'px-1.5 py-0 text-[11px] leading-4' : 'px-1.5 py-0.5 text-xs leading-5',
              )}
            >
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
