import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { CircleAlert, CircleCheck, DatabaseZap, Globe, Inbox, RefreshCw, SearchX } from 'lucide-react';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { TooltipProvider } from '@/shared/ui/tooltip';
import { cn } from '@/shared/lib/utils';
import { isUnavailableError } from '@/features/ventanilla/api/online-radication.service';
import { InboxPagination } from './components/InboxPagination';
import { InboxRowsSkeleton } from './components/InboxSkeleton';
import { InboxState } from './components/InboxState';
import { InboxTable } from './components/InboxTable';
import { InboxToolbar } from './components/InboxToolbar';
import { useDebouncedValue, useNow } from './hooks/useDebouncedValue';
import { useOnlineRadicationList } from './hooks/useOnlineRadicationList';
import { ONLINE_RADICATION_SCOPE } from './onlineRadicationScope';
import { EMPTY_STATES, ORDER_HINTS, PAGE_SIZE, plural, statusFilterLabel } from './onlineRadicationModel';
import { RequestDetailSheet } from './RequestDetailSheet';

const SMALL_BUTTON = 'h-8 gap-1.5 px-[0.75rem] text-xs [&_svg]:size-3.5';

function RetryButton({ onClick }) {
  return (
    <Button type="button" variant="outline" size="sm" className={SMALL_BUTTON} onClick={onClick}>
      <RefreshCw aria-hidden="true" />
      Reintentar
    </Button>
  );
}

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
 * kept in sync with every list response.
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

  const unavailable = isUnavailableError(list.error);
  // Rows of a failed reload stay on screen, except when the inbox turned out to be unavailable.
  const hasRows = list.items.length > 0 && !unavailable;
  const empty = EMPTY_STATES[status] || EMPTY_STATES.all;
  const announcement = announcementFor({ loading: list.loading, error: list.error, total: list.total, status, query });

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
        icon={DatabaseZap}
        tone="warning"
        title="La bandeja aún no está habilitada en este servidor"
        description="Falta ejecutar la migración de base de datos de las solicitudes en línea. Cuando esté lista, las solicitudes del portal aparecerán aquí."
        action={<RetryButton onClick={reload} />}
      />
    );
  } else if (list.error && !hasRows) {
    content = (
      <InboxState
        role="alert"
        icon={CircleAlert}
        tone="danger"
        title="No fue posible cargar las solicitudes"
        description={list.error.message}
        action={<RetryButton onClick={reload} />}
      />
    );
  } else if (!hasRows) {
    content = query ? (
      <InboxState
        icon={SearchX}
        title={`Sin resultados para «${query}»`}
        description="Revise el término o busque por código del portal, solicitante, documento, dirección, expediente o VR."
        action={(
          <Button type="button" variant="outline" size="sm" className={SMALL_BUTTON} onClick={() => setSearch('')}>
            Limpiar búsqueda
          </Button>
        )}
      />
    ) : (
      <InboxState
        icon={status === 'pending' ? CircleCheck : Inbox}
        tone={status === 'pending' ? 'success' : 'neutral'}
        title={empty.title}
        description={empty.description}
      />
    );
  } else {
    content = (
      <>
        {list.error ? (
          <div className="border-b px-[1.25rem] py-[0.75rem]">
            <Alert variant="destructive" className="flex-wrap items-center py-2">
              <CircleAlert aria-hidden="true" />
              <AlertDescription className="min-w-0 flex-1">No fue posible actualizar la lista: {list.error.message}</AlertDescription>
              <RetryButton onClick={reload} />
            </Alert>
          </div>
        ) : null}
        <div>
          <InboxTable
            items={list.items}
            now={now}
            onOpen={openDetail}
            label={`Solicitudes de radicación en línea: ${statusFilterLabel(status).toLowerCase()}`}
          />
        </div>
      </>
    );
  }

  return (
    <TooltipProvider delayDuration={250}>
      <section
        aria-labelledby={titleId}
        className={cn(ONLINE_RADICATION_SCOPE, 'min-w-0 overflow-hidden rounded-xl border bg-[hsl(var(--card))] shadow-sm')}
      >
        <header className="flex flex-wrap items-start justify-between gap-x-[1rem] gap-y-[0.75rem] px-[1.25rem] py-[1rem]">
          <div className="flex min-w-0 items-start gap-[0.75rem]">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border-[1px] border-primary/20 bg-primary/10 text-[hsl(var(--primary))]">
              <Globe className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 id={titleId} className="mb-0 text-base font-semibold leading-6 tracking-tight text-foreground">
                Solicitudes de radicación en línea
              </h2>
              <p className="mb-0 mt-0.5 max-w-3xl text-sm leading-5 text-muted-foreground">
                Llegan desde el portal ciudadano. Revise cada solicitud y llévela a radicación para crear el expediente y su VR, o recházela indicando el motivo.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={SMALL_BUTTON}
            onClick={reload}
            disabled={list.loading || list.refreshing}
          >
            <RefreshCw aria-hidden="true" className={cn(list.refreshing && 'animate-spin motion-reduce:animate-none')} />
            {list.refreshing ? 'Actualizando…' : 'Actualizar'}
          </Button>
        </header>

        <InboxToolbar
          status={status}
          counts={unavailable ? null : counts}
          onStatusChange={setStatus}
          search={search}
          onSearchChange={setSearch}
        />

        <p className="sr-only" aria-live="polite">{announcement}</p>

        {content}

        {hasRows && !list.loading ? (
          <InboxPagination
            page={page}
            pageSize={PAGE_SIZE}
            total={list.total}
            hint={ORDER_HINTS[status]}
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
