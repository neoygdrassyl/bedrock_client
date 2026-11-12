import { useRef } from 'react';
import { cn } from '@/shared/lib/utils';
import { InboxRow } from './InboxRow';

/*
 * Native table (not the `@/shared/ui/table` primitive, which wraps it in an `overflow-auto` box and
 * would break the sticky header). `px-[…]` instead of `px-4`: Bootstrap's `.px-4` is !important.
 * The header cells stick to the top of the app's scroll area; their bottom rule is an inset shadow
 * because collapsed borders do not travel with sticky cells.
 */
const HEAD = cn(
  'sticky top-0 z-[1] h-9 whitespace-nowrap bg-[hsl(var(--card))] px-[0.75rem] py-0 text-left align-middle',
  'text-[11px] font-semibold uppercase tracking-wide text-muted-foreground shadow-[inset_0_-1px_0_hsl(var(--border))]',
);

// Fixed layout: the three text columns share the remaining width and truncate instead of wrapping.
export const INBOX_COLUMNS = [
  { key: 'request', label: 'Solicitud', className: 'w-[24%] pl-[1.25rem]' },
  { key: 'applicant', label: 'Solicitante' },
  { key: 'property', label: 'Predio' },
  { key: 'received', label: 'Recibida', className: 'w-[8.5rem]' },
  { key: 'documents', label: 'Documentos', className: 'w-[7rem] text-right' },
  { key: 'status', label: 'Estado', className: 'w-[11.5rem]' },
];

const NAVIGATION_KEYS = ['ArrowDown', 'ArrowUp', 'Home', 'End'];

/** Inbox table. Rows are focusable; arrow keys move between them, Enter or Space opens the detail. */
export function InboxTable({ items, now, onOpen, label, selectedId = null }) {
  const bodyRef = useRef(null);

  function handleKeyDown(event) {
    if (!NAVIGATION_KEYS.includes(event.key)) return;
    const rows = Array.from(bodyRef.current?.querySelectorAll('[data-inbox-row]') || []);
    const index = rows.indexOf(event.target);
    if (index === -1) return;
    event.preventDefault();
    const next = {
      ArrowDown: Math.min(index + 1, rows.length - 1),
      ArrowUp: Math.max(index - 1, 0),
      Home: 0,
      End: rows.length - 1,
    }[event.key];
    rows[next]?.focus();
  }

  return (
    <table aria-label={label} className="mb-0 w-full table-fixed border-collapse text-sm">
      <thead>
        <tr>
          {INBOX_COLUMNS.map((column) => (
            <th key={column.key} scope="col" className={cn(HEAD, column.className)}>{column.label}</th>
          ))}
          <th scope="col" className={cn(HEAD, 'w-[6rem] pr-[1rem]')}><span className="sr-only">Acciones</span></th>
        </tr>
      </thead>
      <tbody ref={bodyRef} onKeyDown={handleKeyDown}>
        {items.map((item) => (
          <InboxRow key={item.id} item={item} now={now} onOpen={onOpen} selected={selectedId != null && item.id === selectedId} />
        ))}
      </tbody>
    </table>
  );
}
