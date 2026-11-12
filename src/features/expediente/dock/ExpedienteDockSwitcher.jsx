import { useCallback, useId, useState } from 'react';
import { useInRouterContext, useNavigate } from 'react-router-dom';
import { Layers, Loader2, PictureInPicture2, Search, X } from 'lucide-react';
import { Anchor as PopoverAnchor } from '@radix-ui/react-popover';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip';
import { cn } from '@/shared/lib/utils';
import { getShortRadicado } from '../workspace/expedienteStatus';
import { getDockStatusMeta } from './dockStatus';
import { useComputedTerm } from './computedTermStore';
import { addToDock, closeItem, toggleWindow, useExpedienteDock } from './expedienteDockStore';
import { expandDockItem } from './dockNavigation';
import { useQuickSummary } from './quickSummaryCache';
import { useExpedienteSearch } from './useExpedienteSearch';

const DEFAULT_TRIGGER_CLASS = 'relative inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-muted-foreground outline-none transition-colors duration-150 hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring aria-expanded:bg-muted aria-expanded:text-foreground';
const ROW_ACTION_CLASS = 'inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-muted-foreground outline-none transition-colors duration-150 hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring aria-pressed:bg-primary/10 aria-pressed:text-primary';
const SECTION_TITLE_CLASS = 'm-0 px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground';

function RowAction({ label, onClick, children, ...props }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" onClick={onClick} aria-label={label} className={ROW_ACTION_CLASS} {...props}>
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={6} className="rounded-lg px-2.5 py-1 text-xs">{label}</TooltipContent>
    </Tooltip>
  );
}

function SwitcherRow({ radicado, title, subtitle, dotClass, statusLabel, quickOpen = false, onSwitch, onQuickView, onRemove }) {
  return (
    <li className="m-0 flex items-center gap-0.5 rounded-lg p-0 pr-1 transition-colors duration-150 focus-within:bg-muted hover:bg-muted">
      <button
        type="button"
        onClick={() => onSwitch(radicado)}
        aria-label={`Ir al expediente ${radicado}${statusLabel ? ` (${statusLabel})` : ''}`}
        title={radicado}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-lg border-0 bg-transparent px-2 py-1.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {dotClass ? <span className={cn('size-2 shrink-0 rounded-full', dotClass)} aria-hidden="true" /> : null}
        <span className="min-w-0 flex-1">
          <span className="block truncate font-mono text-[13px] font-semibold leading-5 text-foreground">{title}</span>
          {subtitle ? <span className="block truncate text-[11px] leading-4 text-muted-foreground">{subtitle}</span> : null}
        </span>
      </button>
      <RowAction label={`Vista rápida de ${radicado}`} onClick={() => onQuickView(radicado)} aria-pressed={onRemove ? quickOpen : undefined}>
        <PictureInPicture2 className="size-3.5" aria-hidden="true" />
      </RowAction>
      {onRemove ? (
        <RowAction label={`Quitar ${radicado} de la lista`} onClick={() => onRemove(radicado)}>
          <X className="size-3.5" aria-hidden="true" />
        </RowAction>
      ) : null}
    </li>
  );
}

function DockedRow({ item, onSwitch, onQuickView, onRemove }) {
  // Applicant from the summary; the status dot only from the computed term (dockStatus).
  const { data } = useQuickSummary(item.radicado);
  const statusMeta = getDockStatusMeta(useComputedTerm(item.radicado));

  return (
    <SwitcherRow
      radicado={item.radicado}
      title={getShortRadicado(item.radicado)}
      subtitle={data?.solicitante || ''}
      dotClass={statusMeta.dotClass}
      statusLabel={statusMeta.label}
      quickOpen={item.open}
      onSwitch={onSwitch}
      onQuickView={onQuickView}
      onRemove={onRemove}
    />
  );
}

function SwitcherPanel({ items, onSwitch, onQuickView, onOpenQuickView, onRemove }) {
  const [query, setQuery] = useState('');
  const { status, results } = useExpedienteSearch(query);
  const inputId = useId();
  const searching = status !== 'idle';

  const handleKeyDown = (event) => {
    if (event.nativeEvent?.isComposing) return;
    if (event.key === 'Enter' && results[0]) {
      event.preventDefault();
      onSwitch(results[0].radicado);
    }
  };

  return (
    <div className="flex max-h-[min(30rem,var(--radix-popover-content-available-height,calc(100dvh-8rem)))] w-[340px] max-w-[calc(100vw-24px)] flex-col">
      <label className="m-0 flex h-11 shrink-0 items-center gap-2 border-b border-border px-3" htmlFor={inputId}>
        {status === 'loading'
          ? <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground motion-reduce:animate-none" aria-hidden="true" />
          : <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
        <span className="sr-only">Abrir otro expediente</span>
        <input
          id={inputId}
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Abrir otro expediente (radicado)"
          autoComplete="off"
          className="h-full min-w-0 flex-1 border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </label>

      <div className="min-h-0 flex-1 overflow-y-auto p-1.5">
        {searching ? (
          <section aria-label="Resultados de la búsqueda" aria-live="polite">
            <h3 className={SECTION_TITLE_CLASS}>Resultados</h3>
            {status === 'error' ? (
              <p className="m-0 px-2 py-2 text-xs text-destructive">No fue posible buscar. Intente de nuevo.</p>
            ) : null}
            {status === 'done' && !results.length ? (
              <p className="m-0 px-2 py-2 text-xs text-muted-foreground">Sin expedientes para esta búsqueda.</p>
            ) : null}
            {status === 'loading' && !results.length ? (
              <p className="m-0 px-2 py-2 text-xs text-muted-foreground">Buscando…</p>
            ) : null}
            {results.length ? (
              <ul className="m-0 list-none space-y-0.5 p-0">
                {results.map((result) => (
                  <SwitcherRow
                    key={result.radicado}
                    radicado={result.radicado}
                    title={result.radicado}
                    subtitle={result.subtitle}
                    onSwitch={onSwitch}
                    onQuickView={onOpenQuickView}
                  />
                ))}
              </ul>
            ) : null}
          </section>
        ) : null}

        <section aria-label="Expedientes abiertos">
          <h3 className={SECTION_TITLE_CLASS}>Abiertos</h3>
          {items.length ? (
            <ul className="m-0 list-none space-y-0.5 p-0">
              {items.map((item) => (
                <DockedRow key={item.radicado} item={item} onSwitch={onSwitch} onQuickView={onQuickView} onRemove={onRemove} />
              ))}
            </ul>
          ) : (
            <p className="m-0 px-2 pb-2 pt-1 text-xs leading-5 text-muted-foreground">
              No hay otros expedientes abiertos. Busque un radicado para abrirlo, o minimice este para retomarlo después.
            </p>
          )}
        </section>
      </div>

    </div>
  );
}

function SwitcherPopover({ navigate, open: openProp, onOpenChange, anchorOnly = false, returnFocusRef, triggerClassName, align = 'end' }) {
  const { items, activeWorkspace } = useExpedienteDock();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = useCallback((next) => {
    if (openProp === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  }, [onOpenChange, openProp]);
  const others = items.filter((item) => item.radicado !== activeWorkspace);
  const count = others.length;
  const label = count
    ? `Expedientes abiertos: ${count}`
    : 'Expedientes abiertos';

  const handleSwitch = useCallback((radicado) => {
    setOpen(false);
    expandDockItem(navigate, radicado);
  }, [navigate, setOpen]);

  const handleOpenQuickView = useCallback((radicado) => {
    addToDock(radicado, { open: true });
    setOpen(false);
  }, [setOpen]);

  return (
    <TooltipProvider delayDuration={200}>
      <Popover open={open} onOpenChange={setOpen}>
        {anchorOnly ? (
          // Opened from another control (an overflow menu): the popover only needs a place.
          <PopoverAnchor asChild>
            <span className="pointer-events-none absolute inset-0" aria-hidden="true" />
          </PopoverAnchor>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label={label}
                  className={cn(DEFAULT_TRIGGER_CLASS, triggerClassName)}
                  data-testid="expediente-dock-switcher-trigger"
                >
                  <Layers className="size-4 shrink-0" aria-hidden="true" />
                  {count ? (
                    <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 font-mono text-[10px] font-semibold leading-none text-primary-foreground" aria-hidden="true">
                      {count}
                    </span>
                  ) : null}
                </button>
              </PopoverTrigger>
            </TooltipTrigger>
            {open ? null : (
              <TooltipContent side="bottom" sideOffset={6} className="rounded-lg px-2.5 py-1 text-xs">
                Expedientes abiertos
              </TooltipContent>
            )}
          </Tooltip>
        )}
        <PopoverContent
          align={align}
          sideOffset={8}
          collisionPadding={8}
          aria-label="Expedientes abiertos"
          onCloseAutoFocus={returnFocusRef ? (event) => {
            event.preventDefault();
            returnFocusRef.current?.focus?.();
          } : undefined}
          className="w-auto overflow-hidden rounded-xl p-0 shadow-lg"
        >
          <SwitcherPanel
            items={others}
            onSwitch={handleSwitch}
            onQuickView={toggleWindow}
            onOpenQuickView={handleOpenQuickView}
            onRemove={closeItem}
          />
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}

function hardNavigate(url) {
  window.location.assign(url);
}

function RouterSwitcher(props) {
  const navigate = useNavigate();
  return <SwitcherPopover {...props} navigate={navigate} />;
}

/**
 * "Expedientes abiertos": an icon button with a counter whose popover lists the docked
 * expedientes (switch, quick view, remove) and searches another one to open. Minimizing
 * the current expediente is a window control of the workspace header, not part of this
 * popover. Driven by the dock store; it replaces the floating chip strip wherever it is
 * rendered.
 *
 * `open` / `onOpenChange` make it controlled. With `anchorOnly` no trigger is rendered:
 * the popover is positioned over the nearest positioned ancestor and focus goes back to
 * `returnFocusRef` when it closes (used when an overflow menu opens it).
 *
 * Works with or without a Router: outside one it falls back to a full page load.
 *
 * @param {{
 *   open?: boolean,
 *   onOpenChange?: (open: boolean) => void,
 *   anchorOnly?: boolean,
 *   returnFocusRef?: { current: HTMLElement|null },
 *   triggerClassName?: string,
 *   align?: 'start'|'center'|'end',
 * }} props
 */
export function ExpedienteDockSwitcher(props) {
  const inRouter = useInRouterContext();
  return inRouter ? <RouterSwitcher {...props} /> : <SwitcherPopover {...props} navigate={hardNavigate} />;
}

export default ExpedienteDockSwitcher;
