import { Check, CircleCheck, Clock, Minus } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

// Receipt medium is independent of digital folios, scans and legal approval.
export function ReceiptStatus({ row, medium }) {
  const present =
    !row.isPreviewRow && Boolean(row.mediumPresence?.[medium] || row.medium === medium);
  const Icon = present ? Check : Minus;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap text-xs',
        present ? 'font-medium text-foreground' : 'text-muted-foreground',
      )}
    >
      <Icon
        className={cn('h-3.5 w-3.5', present && 'text-[hsl(var(--primary))]')}
        aria-hidden="true"
      />
      {present ? 'Sí' : 'No'}
    </span>
  );
}

export function ScanStatus({ scanned }) {
  const applies = scanned?.applies;
  const done = applies && scanned?.value;
  const Icon = !applies ? Minus : done ? CircleCheck : Clock;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium',
        !applies && 'text-muted-foreground',
        done &&
          'bg-[hsl(var(--operational-success-bg))] text-[hsl(var(--operational-success-text))] dark:bg-[hsl(var(--operational-success-border)/0.12)] dark:text-[hsl(var(--operational-success-bg))]',
        applies &&
          !done &&
          'bg-[hsl(var(--operational-warning-bg))] text-[hsl(var(--operational-warning-text))] dark:bg-warning/10 dark:text-warning',
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {!applies ? 'No aplica' : done ? 'Sí' : 'Pendiente'}
    </span>
  );
}

/**
 * Tooltip copy of the three supports of a delivery (`support`: rowSupport() shape, `location`: physical location).
 * Physical: "Físico · 4 folios · Caja demo 1"; digital: received or not; scan of the physical copy: done, pending or N/A.
 */
export function supportIconTexts(support, location = null) {
  const physical = Boolean(support?.mediumPresence?.physical);
  const digital = Boolean(support?.mediumPresence?.digital);
  const pages = support?.pagesPhysical;
  const scanned = support?.scanned || {};
  return {
    physical: physical ? ['Físico', pages != null ? `${pages} ${pages === 1 ? 'folio' : 'folios'}` : null, location || null].filter(Boolean).join(' · ') : 'Sin soporte físico',
    digital: digital ? 'Digital recibido' : 'Sin soporte digital',
    scan: !scanned.applies ? 'Escaneado: no aplica (sin soporte físico)' : scanned.value ? 'Escaneado del físico' : 'Escaneo del físico pendiente',
  };
}
