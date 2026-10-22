import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { cn } from '@/shared/lib/utils';
import { MISSING, formatDateTime, formatRelative, parseDate } from '../onlineRadicationModel';

/** "hace 2 h" with the absolute date on hover (and in the accessible text). */
export function RelativeTime({ value, now, className }) {
  const date = parseDate(value);
  if (!date) return <span className={cn('text-muted-foreground', className)}>{MISSING}</span>;
  const absolute = formatDateTime(date);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <time dateTime={date.toISOString()} className={cn('cursor-default whitespace-nowrap', className)}>
          {formatRelative(date, now)}
          <span className="sr-only">, {absolute}</span>
        </time>
      </TooltipTrigger>
      <TooltipContent className="text-xs">{absolute}</TooltipContent>
    </Tooltip>
  );
}
