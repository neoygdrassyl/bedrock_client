import { ChevronLeft, ChevronRight, Hourglass } from 'lucide-react';
import { DovelaButton } from '@/shared/dovela-ui';
import { cn } from '@/shared/lib/utils';
import { plural } from '../onlineRadicationModel';
import { WARNING_TEXT } from './InboxRowParts';

const PAGE_BUTTON = 'h-7 gap-1 px-2 text-[12px] [&_svg]:size-3.5';

/**
 * Range summary, ordering hint, how many rows of the page wait too long and previous/next
 * controls (server pagination).
 */
export function InboxPagination({ page, pageSize, total, hint, overdueCount = 0, overdueThreshold, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total ? (page - 1) * pageSize + 1 : 0;
  const to = Math.min(total, page * pageSize);

  return (
    <nav
      aria-label="Paginación de solicitudes"
      className="flex flex-wrap items-center justify-between gap-x-[1rem] gap-y-2 border-t border-border/70 px-[1.25rem] py-2 text-[12px] text-muted-foreground"
    >
      <p className="mb-0 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
        <span>
          <span className="font-mono font-semibold tabular-nums text-foreground">{from}–{to}</span> de{' '}
          <span className="font-mono font-semibold tabular-nums text-foreground">{total}</span>
        </span>
        {overdueCount > 0 ? (
          <span className={cn('inline-flex items-center gap-1 font-medium', WARNING_TEXT)}>
            <Hourglass className="h-3 w-3" aria-hidden="true" />
            {plural(overdueCount, 'solicitud', 'solicitudes')} con más de {plural(overdueThreshold, 'día hábil', 'días hábiles')} en espera
          </span>
        ) : null}
        {hint ? <span className="hidden md:inline">{hint}</span> : null}
      </p>
      {totalPages > 1 ? (
        <div className="flex items-center gap-1.5">
          <DovelaButton tone="neutral" size="sm" className={PAGE_BUTTON} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            <ChevronLeft aria-hidden="true" />
            Anterior
          </DovelaButton>
          <span className="px-1.5 tabular-nums" aria-current="page">
            Página <span className="font-mono text-foreground">{page}</span> de <span className="font-mono text-foreground">{totalPages}</span>
          </span>
          <DovelaButton tone="neutral" size="sm" className={PAGE_BUTTON} disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
            Siguiente
            <ChevronRight aria-hidden="true" />
          </DovelaButton>
        </div>
      ) : null}
    </nav>
  );
}
