import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Globe } from 'lucide-react';
import { DovelaButton, DovelaInlineAlert } from '@/shared/dovela-ui';
import { TooltipProvider } from '@/shared/ui/tooltip';
import { cn } from '@/shared/lib/utils';
import { isUnavailableError } from '@/features/ventanilla/api/online-radication.service';
import { InboxCards } from './components/InboxCards';
import { InboxPagination } from './components/InboxPagination';
import { INBOX_CARD, InboxRowsSkeleton } from './components/InboxSkeleton';
import { InboxState } from './components/InboxState';
import { InboxTable } from './components/InboxTable';
import { InboxToolbar } from './components/InboxToolbar';
import { useDebouncedValue, useNow } from './hooks/useDebouncedValue';
import { useOnlineRadicationList } from './hooks/useOnlineRadicationList';
import { waitInfo } from './inboxModel';
import { ONLINE_RADICATION_SCOPE } from './onlineRadicationScope';
import {
  EMPTY_STATES,
  ORDER_HINTS,
  PAGE_SIZE,
  WAITING_WARNING_BUSINESS_DAYS,
  formatRelative,
  plural,
  statusFilterLabel,
} from './onlineRadicationModel';
import { RequestDetailSheet } from './RequestDetailSheet';

function announcementFor({ loading, error, total, status, query }) {
  if (loading || error) return '';
  const filter = statusFilterLabel(status).toLowerCase();
  const scope = status === 'all' ? 'en total' : filter;
  return query
    ? `${plural(total, 'solicitud', 'solicitudes')} ${scope} coinciden con «${query}».`
    : `${plural(total, 'solicitud', 'solicitudes')} ${scope}.`;
}

/**
 * Inbox of online radication requests (container): status filter, debounced search, server
 * pagination and the detail sheet. Counters are owned by the Ventanilla page (tab badge) and
 * kept in sync with every list response. The list is a table when the inbox is wide and stacked
 * cards when it is narrow (container query in online-radication.css).
 */
export default function OnlineRadicationInbox({ counts, onCountsChange, active = true }) {
  const titleId = useId();
  const [status, setStatus] = useState('pending');
  const [search, setSearch] = useState('');
  const query = useDebouncedValue(search.trim(), 350);
  const filterKey = `${status}|${query}`;
  const [pageState, setPageState] = useState({ key: filterKey, page: 1 });
  const page = pageState.key === filterKey ? pageState.page : 1;
  const setPage = (next) => setPageState({ key: filterKey, page: next });
  const list = useOnlineRadicationList({ status, q: query, page, pageSize: PAGE_SIZE });
  const now = useNow();
  const [selected, setSelected] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const { reload } = list;
  const wasActiveRef = useRef(active);

  useEffect(() => {
    if (list.counts) onCountsChange?.(list.counts);
  }, [list.counts, onCountsChange]);

  // The inbox stays mounted behind the Ventanilla tabs: coming back to it re-reads the list.
  useEffect(() => {
    if (active && !wasActiveRef.current) reload();
    wasActiveRef.current = active;
  }, [active, reload]);

  // After a decision the current page can become empty: step back to the last page with rows.
  useEffect(() => {
    if (list.loading || list.error || page <= 1 || list.items.length || !list.total) return;
    setPageState({ key: filterKey, page: Math.max(1, Math.ceil(list.total / PAGE_SIZE)) });
  }, [list.loading, list.error, list.items.length, list.total, page, filterKey]);

  const openDetail = useCallback((item) => {
    setSelected(item);
    setDetailOpen(true);
  }, []);

  const handleChanged = useCallback(() => reload(), [reload]);

  const overdueCount = useMemo(
    () => list.items.reduce((total, item) => total + (waitInfo(item, now).overdue ? 1 : 0), 0),
    [list.items, now],
  );

  const unavailable = isUnavailableError(list.error);
  // Rows of a failed reload stay on screen, except when the inbox turned out to be unavailable.
  const hasRows = list.items.length > 0 && !unavailable;
  const empty = EMPTY_STATES[status] || EMPTY_STATES.all;
  const announcement = announcementFor({ loading: list.loading, error: list.error, total: list.total, status, query });
  const listLabel = `Solicitudes de radicación en línea: ${statusFilterLabel(status).toLowerCase()}`;
  // `now` ticks every minute, so a fresher load is clamped to it ("hace un momento", never "dentro de").
  const updatedAgo = list.loadedAt && !list.loading ? formatRelative(new Date(Math.min(list.loadedAt, now.getTime())), now) : null;

  let content;
  if (list.loading) {
    content = (
      <>
        <p role="status" className="sr-only">Cargando solicitudes…</p>
        <InboxRowsSkeleton />
      </>
    );
  } else if (unavailable) {
    content = (
      <InboxState
        variant="offline"
        title="La bandeja aún no está habilitada en este servidor"
        description="Falta ejecutar la migración de base de datos de las solicitudes en línea. Cuando esté lista, las solicitudes del portal aparecerán aquí."
        onRetry={reload}
      />
    );
  } else if (list.error && !hasRows) {
    content = (
      <InboxState
        role="alert"
        variant="load-error"
        title="No fue posible cargar las solicitudes"
        description={list.error.message}
        onRetry={reload}
      />
    );
  } else if (!hasRows) {
    content = query ? (
      <InboxState
        variant="not-found"
        title={`Sin resultados para «${query}»`}
        description="Revise el término o busque por código del portal, solicitante, documento, dirección, expediente o VR."
        action={(
          <DovelaButton tone="neutral" size="sm" className="h-8 text-[13px]" onClick={() => setSearch('')}>
            Limpiar búsqueda
          </DovelaButton>
        )}
      />
    ) : (
      <InboxState variant="empty" title={empty.title} description={empty.description} />
    );
  } else {
    const selectedId = selected?.id ?? null;
    content = (
      <>
        {list.error ? (
          <div className="border-b border-border/70 px-[1.25rem] py-2.5">
            <DovelaInlineAlert tone="danger" className="items-center py-2">
              <span className="flex flex-wrap items-center justify-between gap-2">
                <span className="min-w-0">No fue posible actualizar la lista: {list.error.message}</span>
                <DovelaButton tone="neutral" size="sm" className="h-7 text-[12px]" onClick={reload}>Reintentar</DovelaButton>
              </span>
            </DovelaInlineAlert>
          </div>
        ) : null}
        <div className="or-inbox-body">
          <div className="or-inbox-table">
            <InboxTable items={list.items} now={now} onOpen={openDetail} label={listLabel} selectedId={selectedId} />
          </div>
          <div className="or-inbox-cards">
            <InboxCards items={list.items} now={now} onOpen={openDetail} label={listLabel} selectedId={selectedId} />
          </div>
        </div>
      </>
    );
  }

  return (
    <TooltipProvider delayDuration={250}>
      {/* `overflow-clip` (not hidden) rounds the corners without creating a scroll box, so the table header can stick. */}
      <section aria-labelledby={titleId} className={cn(ONLINE_RADICATION_SCOPE, INBOX_CARD, 'min-w-0 overflow-clip')}>
        <header className="flex flex-wrap items-center justify-between gap-x-[1rem] gap-y-1 px-[1.25rem] pb-2 pt-[0.875rem]">
          <div className="flex min-w-0 items-center gap-[0.75rem]">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-[hsl(var(--primary))]">
              <Globe className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 id={titleId} className="mb-0 text-[15px] font-semibold leading-5 tracking-tight text-foreground">
                Solicitudes de radicación en línea
              </h2>
              <p className="mb-0 text-[12px] leading-4 text-muted-foreground">
                Llegan desde el portal ciudadano. Ábralas para revisar, gestionar el pago, radicar o rechazar.
              </p>
            </div>
          </div>
          {updatedAgo ? (
            <p className="mb-0 text-[11px] text-muted-foreground" title={new Date(list.loadedAt).toLocaleString('es-CO')}>
              Actualizado {updatedAgo}
            </p>
          ) : null}
        </header>

        <InboxToolbar
          status={status}
          counts={unavailable ? null : counts}
          onStatusChange={setStatus}
          search={search}
          onSearchChange={setSearch}
          onRefresh={reload}
          refreshing={list.refreshing}
          refreshDisabled={list.loading}
        />

        <p className="sr-only" aria-live="polite">{announcement}</p>

        {content}

        {hasRows && !list.loading ? (
          <InboxPagination
            page={page}
            pageSize={PAGE_SIZE}
            total={list.total}
            hint={ORDER_HINTS[status]}
            overdueCount={overdueCount}
            overdueThreshold={WAITING_WARNING_BUSINESS_DAYS}
            onPageChange={setPage}
          />
        ) : null}
      </section>

      <RequestDetailSheet
        open={detailOpen}
        onOpenChange={setDetailOpen}
        summary={selected}
        now={now}
        onChanged={handleChanged}
      />
    </TooltipProvider>
  );
}
