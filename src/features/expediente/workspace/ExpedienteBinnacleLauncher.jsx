import { AnimatePresence, m } from 'motion/react';
import { MessagesSquare, PanelRight, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';

const WINDOW_TRANSITION = { type: 'spring', stiffness: 420, damping: 34, mass: 0.8 };

/**
 * Chat-style access to the professional binnacles: a round launcher pinned to the
 * bottom-right corner of the workspace and a floating window above it. The window can be
 * docked back to the right column (`onDock`), which is the classic side panel.
 */
export function ExpedienteBinnacleLauncher({ open, onToggle, onDock, subtitle, liftForDock = false, hideLauncher = false, children }) {
  const bottom = liftForDock ? 'bottom-[5.25rem]' : 'bottom-5';
  return (
    <>
      <AnimatePresence>
        {open ? (
          <m.section
            key="binnacle-window"
            role="dialog"
            aria-modal="false"
            aria-label="Bitácoras del expediente"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={WINDOW_TRANSITION}
            style={{ transformOrigin: 'bottom right' }}
            className={cn(
              'absolute left-3 right-3 z-30 flex h-[min(40rem,calc(100dvh-9rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground',
              'shadow-[0_28px_60px_-20px_rgb(2_6_23/0.55),0_8px_20px_-12px_rgb(2_6_23/0.35)] sm:left-auto sm:right-5 sm:w-[26rem]',
              liftForDock ? 'bottom-[9.5rem]' : 'bottom-[5.5rem]',
            )}
          >
            <header className="flex shrink-0 items-center gap-3 bg-sidebar px-4 py-3 text-sidebar-foreground">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sidebar-accent text-sidebar-accent-foreground shadow-[0_6px_14px_-6px_hsl(var(--sidebar-accent)/0.8)]">
                <MessagesSquare className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="m-0 truncate text-sm font-semibold text-sidebar-foreground">Bitácoras profesionales</h2>
                {subtitle ? <p className="m-0 truncate font-mono text-[11px] text-sidebar-foreground/60">{subtitle}</p> : null}
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" onClick={onDock} aria-label="Acoplar bitácoras al costado" className="hidden size-8 items-center justify-center rounded-lg border-0 bg-transparent text-sidebar-foreground/65 outline-none transition-colors hover:bg-white/10 hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring sm:inline-flex">
                    <PanelRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">Acoplar al costado</TooltipContent>
              </Tooltip>
              <button type="button" onClick={onToggle} aria-label="Cerrar bitácoras" className="inline-flex size-8 items-center justify-center rounded-lg border-0 bg-transparent text-sidebar-foreground/65 outline-none transition-colors hover:bg-white/10 hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto bg-muted/30 p-2.5">{children}</div>
          </m.section>
        ) : null}
      </AnimatePresence>

      {hideLauncher ? null : (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onToggle}
              aria-label={open ? 'Cerrar bitácoras' : 'Abrir bitácoras'}
              aria-expanded={open}
              data-testid="binnacle-launcher"
              className={cn(
                'absolute right-5 z-30 inline-flex size-14 items-center justify-center rounded-full border-0 outline-none',
                'bg-sidebar text-sidebar-foreground ring-1 ring-white/10 transition-[transform,background-color,box-shadow] duration-200 ease-out',
                'shadow-[0_14px_30px_-10px_rgb(2_6_23/0.6)] hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-12px_rgb(2_6_23/0.7)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none',
                open && 'bg-sidebar-accent text-sidebar-accent-foreground',
                bottom,
              )}
            >
              <span className={cn('transition-transform duration-200 motion-reduce:transition-none', open && 'rotate-90')}>
                {open ? <X className="h-5 w-5" aria-hidden="true" /> : <MessagesSquare className="h-[22px] w-[22px]" aria-hidden="true" />}
              </span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="text-xs">{open ? 'Cerrar bitácoras' : 'Bitácoras profesionales'}</TooltipContent>
        </Tooltip>
      )}
    </>
  );
}

export default ExpedienteBinnacleLauncher;
