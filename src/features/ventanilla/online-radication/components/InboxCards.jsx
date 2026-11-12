import { cn } from '@/shared/lib/utils';
import { needsAction, waitInfo } from '../inboxModel';
import { Applicant, Documents, OpenAction, Property, Received, RequestCode, Status } from './InboxRowParts';

/**
 * Narrow layout of the inbox: one stacked card per request instead of a squeezed table. The card
 * opens the detail on click; keyboard users reach its "Revisar"/"Ver" button.
 */
export function InboxCards({ items, now, onOpen, label, selectedId = null }) {
  return (
    <ul aria-label={label} className="mb-0 list-none divide-y divide-border/60 p-0">
      {items.map((item) => {
        const selected = selectedId != null && item.id === selectedId;
        const overdue = waitInfo(item, now).overdue;
        return (
          <li
            key={item.id}
            data-inbox-card=""
            data-selected={selected ? '' : undefined}
            data-needs-action={needsAction(item) ? '' : undefined}
            onClick={() => onOpen(item)}
            className={cn(
              'group cursor-pointer px-[1rem] py-[0.75rem] transition-colors',
              selected ? 'bg-primary/[0.06] shadow-[inset_3px_0_0_hsl(var(--primary))]' : 'hover:bg-muted/50',
              !selected && overdue && 'shadow-[inset_3px_0_0_hsl(var(--warning))]',
            )}
          >
            <div className="flex min-w-0 items-start justify-between gap-x-[0.75rem]">
              <div className="min-w-0 flex-1"><RequestCode item={item} maxChips={2} /></div>
              <Status item={item} />
            </div>
            <div className="mt-2 grid min-w-0 grid-cols-1 gap-x-[1rem] gap-y-2 min-[480px]:grid-cols-2">
              <Applicant item={item} />
              <Property item={item} />
            </div>
            <div className="mt-2 flex min-w-0 items-end justify-between gap-x-[0.75rem]">
              <div className="flex min-w-0 items-end gap-x-[1.25rem]">
                <Received item={item} now={now} />
                <Documents item={item} align="start" />
              </div>
              <OpenAction item={item} onOpen={onOpen} className="-mr-1" />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
