import { cn } from '@/shared/lib/utils';
import { needsAction, waitInfo } from '../inboxModel';
import { Applicant, Documents, OpenAction, Property, Received, RequestCode, Status } from './InboxRowParts';

// `p-[…]` instead of `p-3`/`px-4`: Bootstrap's spacing utilities of the same name are !important.
export const CELL = 'px-[0.75rem] py-[0.375rem] align-middle';
const EDGE_MARKER = {
  selected: 'shadow-[inset_3px_0_0_hsl(var(--primary))]',
  overdue: 'shadow-[inset_3px_0_0_hsl(var(--warning))]',
};

/**
 * One request of the inbox table. The whole row opens the detail (click, Enter or Space); the copy
 * button and the expediente link keep their own action. A left marker flags the last opened
 * request (primary) or a request waiting longer than the threshold (warning).
 */
export function InboxRow({ item, now, onOpen, selected = false }) {
  const wait = waitInfo(item, now);
  const marker = selected ? EDGE_MARKER.selected : wait.overdue ? EDGE_MARKER.overdue : null;

  function handleKeyDown(event) {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen(item);
    }
  }

  return (
    <tr
      data-inbox-row=""
      data-selected={selected ? '' : undefined}
      data-needs-action={needsAction(item) ? '' : undefined}
      tabIndex={0}
      onClick={() => onOpen(item)}
      onKeyDown={handleKeyDown}
      className={cn(
        'group cursor-pointer border-b border-border/60 transition-colors last:border-b-0',
        selected ? 'bg-primary/[0.06] hover:bg-primary/[0.09]' : 'hover:bg-muted/50',
        'focus-visible:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
      )}
    >
      <td className={cn(CELL, 'pl-[1.25rem]', marker)}>
        <RequestCode item={item} />
      </td>
      <td className={CELL}><Applicant item={item} /></td>
      <td className={CELL}><Property item={item} /></td>
      <td className={CELL}><Received item={item} now={now} /></td>
      <td className={cn(CELL, 'text-right')}><Documents item={item} /></td>
      <td className={CELL}><Status item={item} /></td>
      <td className={cn(CELL, 'pr-[1rem] text-right')}>
        <OpenAction item={item} onOpen={onOpen} tabIndex={-1} />
      </td>
    </tr>
  );
}
