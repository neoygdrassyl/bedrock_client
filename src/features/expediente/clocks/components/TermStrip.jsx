import { BellRing } from 'lucide-react';
import { Icon } from '@/shared/components/icon';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import { formatPhaseDate, getResponsibleCfg } from '../utils/phaseTerm';
import { PENDING_STATUS_META, describePendingCount } from '../../workspace/expedientePendingStatus';
import { selectExpedienteTerm } from '../../workspace/expedienteTerm';

const TONE_TEXT = {
  danger: 'text-destructive',
  warning: 'text-[color:var(--tc-warning-text)]',
  success: 'text-[color:var(--tc-success-text)]',
  info: 'text-foreground',
  neutral: 'text-muted-foreground',
};
const TONE_BAR = {
  danger: 'bg-destructive',
  warning: 'bg-warning',
  success: 'bg-accent',
  info: 'bg-primary',
  neutral: 'bg-muted-foreground/40',
};
const PROCESS_STATE = {
  DESISTIDO: { label: 'Proceso desistido', className: 'border-destructive/30 bg-destructive/10 text-destructive' },
  FINALIZADO: { label: 'Proceso finalizado', className: 'border-accent/30 bg-accent/10 text-[color:var(--tc-success-text)]' },
  NO_INICIADO: { label: 'Pendiente de inicio', className: 'border-border bg-muted text-muted-foreground' },
};

function Chip({ icon, children, className }) {
  return (
    <span className={cn('inline-flex h-6 items-center gap-1 whitespace-nowrap rounded-full border px-2 text-[11px] font-medium', className)}>
      {icon ? <Icon name={icon} size={12} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

function extraTimeChips({ suspensionPreActa, suspensionPostActa, extension }) {
  const chips = [];
  [[suspensionPreActa, 'Suspensión (pre-acta)'], [suspensionPostActa, 'Suspensión (post-acta)']].forEach(([suspension, label]) => {
    if (!suspension?.exists) return;
    chips.push({
      key: label,
      icon: 'Pause',
      text: suspension.isActive ? `${label} en curso` : `${label} · ${suspension.days} d`,
      className: 'border-warning/40 bg-warning/10 text-[color:var(--tc-warning-text)]',
    });
  });
  if (extension?.exists) {
    chips.push({
      key: 'extension',
      icon: 'Clock',
      text: extension.isActive ? 'Prórroga en curso' : `Prórroga · ${extension.days} d`,
      className: 'border-primary/30 bg-primary/10 text-primary',
    });
  }
  return chips;
}

/**
 * Term strip of the Tiempos module. Every figure comes from `manager.processPhases`
 * (the array that feeds the phase card and the pager) through `selectExpedienteTerm`, the
 * same selector the workspace header uses, so the strip, the card and the header cannot
 * disagree. `tools` is the labeled tools menu.
 *
 * `pending` (workspace/expedientePendingStatus): the process is finished and some records
 * were never registered. The strip then states that, calmly, instead of the term of the
 * phase that stayed open; the day figures remain in the phase detail.
 */
export function TermStrip({ manager, alarmCount = 0, alarmsOpen = false, onToggleAlarms, tools, emulatedDate, pending }) {
  const view = selectExpedienteTerm({
    processPhases: manager?.processPhases,
    processStatus: manager?.curaduriaDetails?.status,
    pendingStatus: pending,
  });
  const isPending = view.pending;
  const { phase, phaseIndex: index, phaseCount } = view;
  const processState = PROCESS_STATE[view.processStatus];
  const chips = extraTimeChips(manager || {});

  const barPercent = view.barPercent;
  const responsible = phase ? getResponsibleCfg(phase.responsible) : null;

  const openPhaseTitles = view.openPhaseTitles;
  const badgeCount = isPending ? view.pendingCount : alarmCount;

  return (
    <section
      aria-label={isPending ? 'Estado del proceso' : 'Término de la fase actual'}
      className="flex min-w-0 flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-border/70 bg-card px-4 py-3 shadow-[shadow:var(--card-shadow)]"
      data-testid="tiempos-term-strip"
    >
      <div className="min-w-0 flex-1 basis-60">
        <h2
          className="m-0 flex min-w-0 items-center gap-2 text-[15px] font-semibold leading-tight text-foreground"
          title={isPending ? undefined : phase?.title}
          data-testid={isPending ? 'tiempos-pending-text' : undefined}
        >
          {isPending ? (
            <Chip icon="Hourglass" className={cn('shrink-0', PENDING_STATUS_META.badgeClass)}>{PENDING_STATUS_META.label}</Chip>
          ) : null}
          <span className="truncate">
            {isPending ? view.text : phase ? phase.title : 'Sin fases calculadas'}
          </span>
        </h2>
        <p className="m-0 mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
          {isPending ? (
            <span>
              No corre ningún término legal.{' '}
              {openPhaseTitles.length === 1
                ? `Falta cerrar la fase «${openPhaseTitles[0]}».`
                : `Faltan por cerrar ${openPhaseTitles.length} fases, la primera «${openPhaseTitles[0]}».`}
            </span>
          ) : phase ? (
            <>
              <span>Fase actual, {index + 1} de {phaseCount}</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 text-foreground/80">
                <Icon name={responsible.icon} size={12} aria-hidden="true" />
                {responsible.text}
              </span>
            </>
          ) : (
            <span>Registra la radicación para iniciar el control de términos.</span>
          )}
          {processState && !isPending ? <Chip className={processState.className}>{processState.label}</Chip> : null}
        </p>
      </div>

      {phase && !isPending ? (
        <>
          <div className="min-w-[13rem]">
            <p className={cn('m-0 text-sm font-semibold leading-tight', TONE_TEXT[view.tone])} data-testid="tiempos-term-text">
              {view.text}
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <div
                className="h-1.5 w-28 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-label="Días hábiles usados de la fase"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(barPercent)}
                aria-valuetext={`${view.usedDays} de ${view.totalDays} días hábiles`}
              >
                <div className={cn('h-full rounded-full', TONE_BAR[view.tone])} style={{ width: `${barPercent}%` }} />
              </div>
              <span className="font-mono text-xs tabular-nums text-muted-foreground" data-testid="tiempos-term-ratio">
                {view.ratioText}
              </span>
            </div>
          </div>

          <dl className="m-0 flex flex-col">
            <dt className="text-[11px] font-medium text-muted-foreground">Límite legal</dt>
            <dd className="m-0 font-mono text-sm font-medium tabular-nums text-foreground">
              {phase.limitDate ? formatPhaseDate(phase.limitDate) : <span className="font-sans text-xs font-normal text-muted-foreground">Sin fecha registrada</span>}
            </dd>
          </dl>
        </>
      ) : null}

      {chips.length || emulatedDate ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {chips.map((chip) => (
            <Chip key={chip.key} icon={chip.icon} className={chip.className}>{chip.text}</Chip>
          ))}
          {emulatedDate ? (
            <Chip icon="UserClock" className="border-warning/40 bg-warning/10 text-[color:var(--tc-warning-text)]">
              Fecha emulada <span className="font-mono">{formatPhaseDate(emulatedDate)}</span>
            </Chip>
          ) : null}
        </div>
      ) : null}

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn('h-9 gap-1.5 rounded-lg px-3 text-[13px] font-medium', alarmsOpen && 'bg-muted')}
          aria-pressed={alarmsOpen}
          aria-label={isPending ? `Pendientes: ${describePendingCount(view.pendingCount)}` : `Alertas de tiempos: ${alarmCount}`}
          onClick={onToggleAlarms}
        >
          <BellRing className="h-4 w-4" aria-hidden="true" />
          {isPending ? 'Pendientes' : 'Alertas'}
          <span
            className={cn(
              'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 font-mono text-[11px] font-semibold tabular-nums',
              badgeCount <= 0
                ? 'bg-muted text-muted-foreground'
                : isPending
                  ? 'bg-warning/20 text-[color:var(--tc-warning-text)]'
                  : 'bg-destructive text-destructive-foreground',
            )}
            aria-hidden="true"
          >
            {badgeCount}
          </span>
        </Button>
        {tools}
      </div>
    </section>
  );
}

export default TermStrip;
