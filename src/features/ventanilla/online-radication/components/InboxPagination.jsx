import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/ui/button';

const PAGE_BUTTON = 'h-8 gap-1 px-2.5 text-xs [&_svg]:size-3.5';

/** Range summary, ordering hint and previous/next controls (server pagination). */
export function InboxPagination({ page, pageSize, total, hint, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total ? (page - 1) * pageSize + 1 : 0;
  const to = Math.min(total, page * pageSize);

  return (
    <nav
      aria-label="Paginación de solicitudes"
      className="flex flex-wrap items-center justify-between gap-x-[1rem] gap-y-2 border-t px-[1.25rem] py-2.5 text-xs text-muted-foreground"
    >
      <p className="mb-0">
        Mostrando <span className="font-semibold tabular-nums text-foreground">{from}–{to}</span> de{' '}
        <span className="font-semibold tabular-nums text-foreground">{total}</span>
        {hint ? <span className="hidden md:inline"> · {hint}</span> : null}
      </p>
      {totalPages > 1 ? (
        <div className="flex items-center gap-1.5">
          <Button type="button" variant="outline" size="sm" className={PAGE_BUTTON} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            <ChevronLeft aria-hidden="true" />
            Anterior
          </Button>
          <span className="px-2 tabular-nums" aria-current="page">Página {page} de {totalPages}</span>
          <Button type="button" variant="outline" size="sm" className={PAGE_BUTTON} disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
            Siguiente
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
      ) : null}
    </nav>
  );
}
