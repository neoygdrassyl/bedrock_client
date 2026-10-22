import { useRef } from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { InboxRow } from './InboxRow';

// `px-[…]` replaces the primitive's `px-4` (Bootstrap's `.px-4` is !important and 1.5rem).
const HEAD = 'h-9 whitespace-nowrap px-[0.875rem] text-[11px] font-semibold uppercase tracking-wide text-muted-foreground';

// Fixed layout with proportional columns: long values truncate instead of widening the table.
const COLUMNS = [
  { key: 'code', label: 'Código del portal', className: 'w-[13%] pl-[1.25rem]' },
  { key: 'received', label: 'Recibida', className: 'w-[13%]' },
  { key: 'applicant', label: 'Solicitante', className: 'w-[15%]' },
  { key: 'property', label: 'Predio', className: 'w-[15%]' },
  { key: 'actuations', label: 'Actuaciones', className: 'w-[15%]' },
  { key: 'documents', label: 'Documentos', className: 'w-[9%]' },
  { key: 'status', label: 'Estado', className: 'w-[14%]' },
];

const NAVIGATION_KEYS = ['ArrowDown', 'ArrowUp', 'Home', 'End'];

/** Inbox table. Rows are focusable; arrow keys move between them, Enter opens the detail. */
export function InboxTable({ items, now, onOpen, label }) {
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
    <Table aria-label={label} className="min-w-[80rem] table-fixed">
      <TableHeader className="bg-muted/40">
        <TableRow className="border-b border-border/70 hover:bg-transparent">
          {COLUMNS.map((column) => (
            <TableHead key={column.key} scope="col" className={`${HEAD} ${column.className || ''}`}>{column.label}</TableHead>
          ))}
          <TableHead scope="col" className={`${HEAD} w-[6%] pr-[1.25rem]`}><span className="sr-only">Acciones</span></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody ref={bodyRef} onKeyDown={handleKeyDown}>
        {items.map((item) => <InboxRow key={item.id} item={item} now={now} onOpen={onOpen} />)}
      </TableBody>
    </Table>
  );
}
