import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, m } from 'motion/react';
import { Loader2, Plus, Search, X } from 'lucide-react';
import { Anchor as PopoverAnchor } from '@radix-ui/react-popover';
import { Popover, PopoverContent } from '@/shared/ui/popover';
import { Z_CLASS } from '@/shared/lib/layers';
import { cn } from '@/shared/lib/utils';
import { getShortRadicado } from '../workspace/expedienteStatus';
import { getDockStatusMeta } from './dockStatus';
import {
  addToDock,
  closeItem,
  minimize,
  setDockSearchOpen,
  toggleWindow,
  useExpedienteDock,
} from './expedienteDockStore';
import { expandDockItem } from './dockNavigation';
import { ExpedienteQuickWindow } from './ExpedienteQuickWindow';
import { useComputedTerm } from './computedTermStore';
import { useExpedienteSearch } from './useExpedienteSearch';

const CHIP_TRANSITION = { type: 'spring', stiffness: 500, damping: 38 };

function DockSearchPanel({ onPick }) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const { status, results } = useExpedienteSearch(query);
  const listId = useId();

  useEffect(() => setActiveIndex(0), [results]);

  const handleKeyDown = (event) => {
    if (event.nativeEvent?.isComposing) return;
    if (event.key === 'ArrowDown' && results.length) {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % results.length);
    } else if (event.key === 'ArrowUp' && results.length) {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + results.length) % results.length);
    } else if (event.key === 'Enter' && results[activeIndex]) {
      event.preventDefault();
      onPick(results[activeIndex].radicado);
    }
  };

  return (
    <div className="w-[300px]">
      <label className="flex h-10 items-center gap-2 border-b border-border px-3" htmlFor={`${listId}-input`}>
        {status === 'loading'
          ? <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" aria-hidden="true" />
          : <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
        <input
          id={`${listId}-input`}
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Busque un radicado"
          aria-label="Buscar expediente para abrir en ventana"
          aria-controls={listId}
          aria-activedescendant={results[activeIndex] ? `${listId}-${activeIndex}` : undefined}
          className="h-full min-w-0 flex-1 border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </label>
      <div className="max-h-64 overflow-y-auto p-1.5">
        {status === 'idle' ? (
          <p className="m-0 px-2 py-3 text-xs text-muted-foreground">Escriba al menos dos caracteres del radicado.</p>
        ) : null}
        {status === 'error' ? (
          <p className="m-0 px-2 py-3 text-xs text-destructive">No fue posible buscar. Intente de nuevo.</p>
        ) : null}
        {status === 'done' && !results.length ? (
          <p className="m-0 px-2 py-3 text-xs text-muted-foreground">Sin expedientes para esta búsqueda.</p>
        ) : null}
        {results.length ? (
          <ul id={listId} role="listbox" aria-label="Expedientes encontrados" className="m-0 list-none space-y-0.5 p-0">
            {results.map((result, index) => (
              <li
                key={result.radicado}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                onPointerEnter={() => setActiveIndex(index)}
                onClick={() => onPick(result.radicado)}
                className={cn(
                  'm-0 cursor-pointer rounded-lg px-2.5 py-1.5',
                  index === activeIndex ? 'bg-muted text-foreground' : 'text-muted-foreground',
                )}
              >
                <p className="m-0 truncate font-mono text-[13px] font-semibold text-foreground">{result.radicado}</p>
                {result.subtitle ? <p className="m-0 truncate text-[11px] text-muted-foreground">{result.subtitle}</p> : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

// Only a status dot: the computed term (computedTermStore) once the workspace or the quick
// window computed it, a neutral dot until then (never the backend summary's status).
function DockChip({ item }) {
  const statusMeta = getDockStatusMeta(useComputedTerm(item.radicado));
  const shortLabel = getShortRadicado(item.radicado);

  return (
    <m.div
      layout
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={CHIP_TRANSITION}
      className={cn(
        'pointer-events-auto flex h-9 items-center rounded-full border bg-card pl-1 pr-1 shadow-lg shadow-black/10',
        item.open ? 'border-primary/40 ring-2 ring-primary/15' : 'border-border',
      )}
      data-testid={`dock-chip-${item.radicado}`}
    >
      <button
        type="button"
        onClick={() => toggleWindow(item.radicado)}
        aria-label={`${item.open ? 'Minimizar' : 'Abrir'} ventana de ${item.radicado} (${statusMeta.label})`}
        aria-pressed={item.open}
        title={item.radicado}
        className="flex h-7 items-center gap-1.5 rounded-full border-0 bg-transparent px-2 font-mono text-xs font-semibold text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className={cn('size-2 shrink-0 rounded-full', statusMeta.dotClass)} aria-hidden="true" />
        {shortLabel}
      </button>
      <button
        type="button"
        onClick={() => closeItem(item.radicado)}
        aria-label={`Quitar ${item.radicado} de la barra`}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full border-0 bg-transparent text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </m.div>
  );
}

/**
 * Global bottom-right dock of expedientes (chips + up to three quick windows).
 * Portaled to <body> above the page and below modal surfaces. While an expediente
 * workspace is mounted only the quick windows float here: the chips and the search
 * live in the workspace top bar (ExpedienteDockSwitcher).
 */
export function ExpedienteDock() {
  const { items, searchOpen, activeWorkspace } = useExpedienteDock();
  const navigate = useNavigate();
  const plusRef = useRef(null);

  const openWindows = useMemo(
    () => items
      .filter((item) => item.open)
      .sort((a, b) => (b.openedAt ?? b.addedAt) - (a.openedAt ?? a.addedAt)),
    [items]
  );

  const handlePick = useCallback((radicado) => addToDock(radicado, { open: true }), []);
  const handleExpand = useCallback((radicado, section) => expandDockItem(navigate, radicado, section), [navigate]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={cn('pointer-events-none fixed bottom-3 right-3 flex max-w-[calc(100vw-24px)] flex-col items-end gap-2', Z_CLASS.dock)}
      data-testid="expediente-dock"
    >
      {/* Most recently opened window sits rightmost; on phones only that one is shown. */}
      <div className="flex flex-row-reverse items-end gap-3 max-sm:[&>*:not(:first-child)]:hidden">
        <AnimatePresence initial={false}>
          {openWindows.map((item) => (
            <ExpedienteQuickWindow
              key={item.radicado}
              radicado={item.radicado}
              onMinimize={() => minimize(item.radicado)}
              onExpand={(section) => handleExpand(item.radicado, section)}
              onClose={() => closeItem(item.radicado)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Inside the workspace the top bar switcher ("Abiertos") replaces the chip strip. */}
      {activeWorkspace ? null : (
        <div className="flex max-w-full flex-wrap-reverse items-center justify-end gap-1.5" role="toolbar" aria-label="Expedientes en ventana">
          <AnimatePresence initial={false}>
            {items.map((item) => <DockChip key={item.radicado} item={item} />)}
          </AnimatePresence>

          <Popover open={searchOpen} onOpenChange={setDockSearchOpen}>
            <PopoverAnchor asChild>
              <button
                ref={plusRef}
                type="button"
                onClick={() => setDockSearchOpen(!searchOpen)}
                aria-label="Abrir otro expediente en ventana"
                aria-expanded={searchOpen}
                aria-haspopup="dialog"
                className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-lg shadow-black/10 outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </PopoverAnchor>
            <PopoverContent
              side="top"
              align="end"
              sideOffset={10}
              className="w-auto overflow-hidden rounded-2xl p-0 shadow-2xl"
              onCloseAutoFocus={(event) => {
                event.preventDefault();
                plusRef.current?.focus?.();
              }}
            >
              <DockSearchPanel onPick={handlePick} />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>,
    document.body
  );
}

export default ExpedienteDock;
