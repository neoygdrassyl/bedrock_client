import { lazy, Suspense, useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileInput, Globe } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip';
import { InboxSkeleton } from './online-radication/components/InboxSkeleton';
import { useOnlineRadicationCounts } from './online-radication/hooks/useOnlineRadicationCounts';

// The inbox (sheet, dialogs, detail sections) loads only when its tab is opened.
const OnlineRadicationInbox = lazy(() => import('./online-radication/OnlineRadicationInbox'));

export const VENTANILLA_TABS = { vr: 'radicados', online: 'en-linea' };

// Segmented control with the rhythm of the redesigned modules (see FunDocumentalNew).
const TRIGGER_CLASS = [
  'group h-9 gap-2 rounded-md border-[1px] border-solid border-transparent px-[0.875rem] py-0 text-sm font-medium text-muted-foreground',
  'hover:bg-background/60 hover:text-foreground',
  'data-[state=active]:border-[hsl(var(--primary)/0.3)] data-[state=active]:bg-background data-[state=active]:font-semibold data-[state=active]:text-[hsl(var(--primary))] data-[state=active]:shadow-sm',
  '[&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0',
].join(' ');

function pluralize(count, singular, pluralForm) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

/** What the tab badge adds up: requests to radicate + requests with document entries to receive. */
function attentionParts(counts) {
  const pending = counts?.pending || 0;
  const entries = counts?.pendingEntries || 0;
  return {
    total: pending + entries,
    pending: pluralize(pending, 'solicitud pendiente de radicar', 'solicitudes pendientes de radicar'),
    entries: pluralize(entries, 'solicitud con entradas de documentos por recibir', 'solicitudes con entradas de documentos por recibir'),
  };
}

function AttentionBadge({ parts }) {
  if (!parts.total) return null;
  return (
    <>
      <span
        aria-hidden="true"
        className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[hsl(var(--warning)/0.18)] px-1.5 text-[11px] font-semibold leading-none tabular-nums text-[hsl(var(--operational-warning-text))] dark:text-[hsl(var(--warning))]"
      >
        {parts.total > 99 ? '99+' : parts.total}
      </span>
      <span className="sr-only">({parts.pending}; {parts.entries})</span>
    </>
  );
}

/**
 * Ventanilla Única tabs: "Radicados VR" (the existing page, always mounted) and "Solicitudes en
 * línea" (mounted on first visit). The active tab lives in `?tab=en-linea` so it can be linked.
 */
export function VentanillaTabs({ vrPanel }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === VENTANILLA_TABS.online ? VENTANILLA_TABS.online : VENTANILLA_TABS.vr;
  const [onlineMounted, setOnlineMounted] = useState(activeTab === VENTANILLA_TABS.online);
  if (activeTab === VENTANILLA_TABS.online && !onlineMounted) setOnlineMounted(true);
  const { counts, refresh, applyCounts } = useOnlineRadicationCounts();
  const attention = attentionParts(counts);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const selectTab = useCallback((value) => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      if (value === VENTANILLA_TABS.online) next.set('tab', VENTANILLA_TABS.online);
      else next.delete('tab');
      return next;
    }, { replace: true });
    if (value === VENTANILLA_TABS.online) refresh();
  }, [setSearchParams, refresh]);

  return (
    <Tabs value={activeTab} onValueChange={selectTab} className="flex min-w-0 flex-col gap-[1rem]">
      <TabsList
        aria-label="Secciones de Ventanilla Única"
        className="h-auto max-w-full justify-start gap-1 self-start overflow-x-auto rounded-xl border bg-muted/50 p-1 shadow-sm"
      >
        <TabsTrigger value={VENTANILLA_TABS.vr} className={TRIGGER_CLASS}>
          <FileInput aria-hidden="true" />
          Radicados VR
        </TabsTrigger>
        <TooltipProvider delayDuration={250}>
          <Tooltip open={tooltipOpen && attention.total > 0} onOpenChange={setTooltipOpen}>
            <TooltipTrigger asChild>
              <TabsTrigger value={VENTANILLA_TABS.online} className={TRIGGER_CLASS}>
                <Globe aria-hidden="true" />
                Solicitudes en línea
                <AttentionBadge parts={attention} />
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="start" className="max-w-xs text-xs leading-5">
              <p className="mb-0.5 font-semibold">Requieren atención: {attention.total}</p>
              <ul className="mb-0 list-disc pl-4">
                <li>{attention.pending}</li>
                <li>{attention.entries}</li>
              </ul>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TabsList>

      {/* Kept mounted so the VR list, its paging and open modals survive tab switches. */}
      <TabsContent value={VENTANILLA_TABS.vr} forceMount className="mt-0 min-w-0 data-[state=inactive]:hidden">
        {vrPanel}
      </TabsContent>

      {onlineMounted ? (
        <TabsContent value={VENTANILLA_TABS.online} forceMount className="mt-0 min-w-0 data-[state=inactive]:hidden">
          <Suspense fallback={<InboxSkeleton />}>
            <OnlineRadicationInbox counts={counts} onCountsChange={applyCounts} active={activeTab === VENTANILLA_TABS.online} />
          </Suspense>
        </TabsContent>
      ) : null}
    </Tabs>
  );
}
