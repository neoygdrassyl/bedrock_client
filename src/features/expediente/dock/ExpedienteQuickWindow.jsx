import { m } from 'motion/react';
import { Maximize2, Minus, X } from 'lucide-react';
import { Icon } from '@/shared/components/icon';
import { IllustratedState } from '@/shared/components/feedback/IllustratedState';
import { cn } from '@/shared/lib/utils';
import { formsParser1 } from '@/shared/config/customClasses/typeParse';
import { getExpedienteStatusMeta, getExpedienteTermFigures, UNKNOWN_STATUS_META } from '../workspace/expedienteStatus';
import { useQuickSummary } from './quickSummaryCache';

export const QUICK_LINKS = Object.freeze([
  { section: 'detalles', label: 'Detalles', icon: 'FolderOpen' },
  { section: 'tiempos', label: 'Tiempos', icon: 'Clock' },
  { section: 'documentos', label: 'Documentos', icon: 'Archive' },
  { section: 'juridico', label: 'Inf. jurídico', icon: 'Scale' },
  { section: 'acta', label: 'Acta', icon: 'FileCheck' },
  { section: 'expedicion', label: 'Expedición', icon: 'FileOutput' },
]);

const WINDOW_TRANSITION = { type: 'spring', stiffness: 420, damping: 34, mass: 0.8 };

function formatDate(value) {
  if (!value) return 'Sin fecha';
  if (typeof value === 'string') return value;
  try {
    return new Intl.DateTimeFormat('es-CO', { year: 'numeric', month: 'short', day: '2-digit' }).format(new Date(value));
  } catch {
    return String(value);
  }
}

function describeCategory(summary) {
  const parsed = formsParser1({
    tipo: summary?.tipo ?? summary?.tipo_licencia,
    tramite: summary?.tramite,
    m_urb: summary?.m_urb,
    m_sub: summary?.m_sub,
    m_lic: summary?.m_lic,
  });
  return summary?.categoria || parsed || 'Sin categoría';
}

function HeaderButton({ label, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md border-0 bg-transparent text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
    </button>
  );
}

function Field({ label, value }) {
  return (
    <div className="min-w-0 rounded-lg border border-border/70 bg-muted/30 px-2.5 py-2">
      <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="m-0 mt-0.5 truncate text-xs font-medium text-foreground" title={typeof value === 'string' ? value : undefined}>{value}</p>
    </div>
  );
}

function SummarySkeleton() {
  return (
    <div className="space-y-3 p-3" aria-hidden="true" data-testid="quick-window-skeleton">
      <span className="block h-3.5 w-2/3 animate-pulse rounded bg-muted" />
      <div className="grid grid-cols-2 gap-2">
        {[0, 1, 2, 3].map((key) => <span key={key} className="block h-11 animate-pulse rounded-lg bg-muted/80" />)}
      </div>
      <span className="block h-2 w-full animate-pulse rounded-full bg-muted" />
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2, 3, 4, 5].map((key) => <span key={key} className="block h-14 animate-pulse rounded-lg bg-muted/70" />)}
      </div>
    </div>
  );
}

/**
 * Facebook-chat style quick view of one expediente. Loads only the legal summary.
 */
export function ExpedienteQuickWindow({ radicado, onMinimize, onExpand, onClose }) {
  const { status, data, retry, notFound } = useQuickSummary(radicado);
  const statusMeta = data ? getExpedienteStatusMeta(data.status) : UNKNOWN_STATUS_META;
  const term = getExpedienteTermFigures(data);
  const titleId = `quick-window-title-${radicado}`;

  return (
    <m.section
      role="dialog"
      aria-labelledby={titleId}
      initial={{ opacity: 0, scale: 0.92, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 16 }}
      transition={WINDOW_TRANSITION}
      style={{ transformOrigin: 'bottom right' }}
      className="pointer-events-auto flex h-[min(480px,calc(100dvh-7rem))] w-[min(320px,calc(100vw-24px))] flex-col overflow-hidden rounded-2xl border border-border bg-card text-foreground shadow-2xl shadow-black/15"
      data-testid={`quick-window-${radicado}`}
    >
      <header className="flex shrink-0 items-center gap-2 border-b border-border/70 bg-muted/30 py-2 pl-3 pr-1.5">
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="m-0 truncate font-mono text-[13px] font-semibold text-foreground">{radicado}</h2>
          <span className={cn('mt-0.5 inline-flex items-center gap-1 rounded-full border px-1.5 py-px text-[10px] font-semibold', statusMeta.badgeClass)}>
            <span className={cn('size-1.5 rounded-full', statusMeta.dotClass)} aria-hidden="true" />
            {status === 'loading' ? 'Consultando…' : statusMeta.label}
          </span>
        </div>
        <HeaderButton label={`Minimizar ${radicado}`} onClick={onMinimize}>
          <Minus className="h-4 w-4" aria-hidden="true" />
        </HeaderButton>
        <HeaderButton label={`Abrir ${radicado} en pantalla completa`} onClick={() => onExpand()}>
          <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
        </HeaderButton>
        <HeaderButton label={`Cerrar ${radicado}`} onClick={onClose}>
          <X className="h-4 w-4" aria-hidden="true" />
        </HeaderButton>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {status === 'loading' || status === 'idle' ? <SummarySkeleton /> : null}

        {status === 'error' ? (
          <IllustratedState
            size="compact"
            variant={notFound ? 'not-found' : 'load-error'}
            title={notFound ? 'Expediente no encontrado' : 'No se pudo cargar el resumen'}
            description={notFound ? 'Verifique el radicado o ábralo en pantalla completa.' : 'Revise la conexión e intente de nuevo.'}
            onRetry={notFound ? undefined : retry}
          />
        ) : null}

        {status === 'done' && data ? (
          <div className="space-y-3 p-3">
            <div className="min-w-0">
              <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Solicitante</p>
              <p className="m-0 mt-0.5 truncate text-sm font-semibold text-foreground">{data.solicitante || 'Sin solicitante registrado'}</p>
              {data.fase_label ? <p className="m-0 mt-0.5 truncate text-[11px] text-muted-foreground">{data.fase_label}</p> : null}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Categoría" value={describeCategory(data)} />
              <Field label="Versión" value={`v${data.version ?? 1}`} />
              <Field label="Radicación" value={formatDate(data.fecha_radicacion)} />
              <Field label="Fecha límite" value={formatDate(data.fecha_limite)} />
            </div>

            <div className="rounded-lg border border-border/70 bg-background p-2.5">
              <div className="mb-1.5 flex items-center justify-between gap-2 text-[11px]">
                <span className="font-medium text-foreground">
                  {term.remainingDays != null ? `${term.remainingDays} días hábiles restantes` : 'Sin término calculado'}
                </span>
                <span className="font-mono text-muted-foreground">{term.usedDays}/{term.limitDays || 0}</span>
              </div>
              <div
                className="h-1.5 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-label="Avance del término legal"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={term.progressPercent}
              >
                <div className={cn('h-full rounded-full', statusMeta.barClass)} style={{ width: `${term.progressPercent}%` }} />
              </div>
            </div>

            <nav aria-label={`Accesos rápidos de ${radicado}`}>
              <ul className="m-0 grid list-none grid-cols-3 gap-1.5 p-0">
                {QUICK_LINKS.map((link) => (
                  <li key={link.section} className="m-0 p-0">
                    <button
                      type="button"
                      onClick={() => onExpand(link.section)}
                      className="flex h-14 w-full flex-col items-center justify-center gap-1 rounded-lg border border-border/70 bg-background px-1 text-[11px] font-medium text-muted-foreground outline-none transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Icon name={link.icon} size={15} aria-hidden="true" />
                      <span className="max-w-full truncate">{link.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        ) : null}
      </div>
    </m.section>
  );
}

export default ExpedienteQuickWindow;
