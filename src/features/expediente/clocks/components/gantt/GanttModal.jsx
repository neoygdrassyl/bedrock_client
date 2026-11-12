import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { GanttChart } from './GanttChart';
import { GANTT_STATUS, formatGanttDate } from './ganttSeries';
import { Icon } from '@/shared/components/icon';
import { cn } from '@/shared/lib/utils';

const STATUS_SWATCH = {
  done: 'tone-success',
  doneLate: 'tone-danger',
  active: 'tone-info',
  overdue: 'tone-danger',
  paused: 'tone-warning is-hatched',
  pendingRecord: 'tone-pending is-dashed',
  notStarted: 'tone-muted is-plan',
};

/**
 * Legend of the Gantt, built from the same series as the chart: only what is drawn, in the
 * order it first appears (statuses top to bottom, then overlays). Every entry pairs the
 * tone with a shape or pattern, so no meaning relies on color alone.
 */
export const GanttLegend = ({ series, className = '' }) => {
  if (!series) return null;
  const statuses = series.kinds
    .map((key) => Object.values(GANTT_STATUS).find((s) => s.key === key))
    .filter(Boolean);
  const { has } = series;
  return (
    <div className={cn('gx-legend', className)}>
      <span className="gx-legend-title">Leyenda</span>
      <ul className="gx-legend-items" aria-label="Leyenda del diagrama">
        {statuses.map((s) => (
          <li key={s.key} className="gx-legend-item">
            <span className={cn('gx-swatch', s.key === 'notStarted' ? 'gx-swatch-plan' : 'gx-swatch-bar', STATUS_SWATCH[s.key])} aria-hidden="true" />
            {s.key === 'notStarted' && has.plan ? 'Sin iniciar (previsto)' : s.label}
          </li>
        ))}
        {has.allowance ? <li className="gx-legend-item"><span className="gx-swatch gx-swatch-allow" aria-hidden="true" />Plazo legal</li> : null}
        {has.overrun ? <li className="gx-legend-item"><span className="gx-swatch gx-swatch-over" aria-hidden="true" />Exceso sobre el límite</li> : null}
        {has.suspension ? <li className="gx-legend-item"><span className="gx-swatch gx-swatch-susp" aria-hidden="true" />Suspensión</li> : null}
        {has.prorroga ? <li className="gx-legend-item"><span className="gx-swatch gx-swatch-prorroga" aria-hidden="true" />Prórroga</li> : null}
        {has.markers ? <li className="gx-legend-item"><span className="gx-swatch gx-swatch-sched" aria-hidden="true" />Límite programado</li> : null}
        {has.milestones ? <li className="gx-legend-item"><span className="gx-swatch gx-swatch-milestone" aria-hidden="true" />Hito</li> : null}
        <li className="gx-legend-item"><span className="gx-swatch gx-swatch-today" aria-hidden="true" />Hoy</li>
      </ul>
    </div>
  );
};

/** Detail of the phase picked in the dialog. Figures as the phases hook gives them. */
const PhaseDetailPanel = ({ row, onClose }) => {
  if (!row) return null;
  const { status, phase } = row;
  const actors = phase.parallelActors?.primary && phase.parallelActors?.secondary
    ? [phase.parallelActors.primary, phase.parallelActors.secondary]
    : [];
  return (
    <aside className="gx-detail" aria-label={`Detalle de la fase ${row.title}`}>
      <div className="gx-detail-head">
        <div className="min-w-0">
          <p className="gx-detail-kicker">Fase {row.index}</p>
          <h4 className="gx-detail-title">{row.title}</h4>
        </div>
        <button type="button" className="gx-icon-btn" onClick={onClose} aria-label="Cerrar detalle de la fase" title="Cerrar">
          <Icon name="X" size={16} />
        </button>
      </div>
      <p className={cn('gx-chip', `tone-${status.tone}`)}>
        <Icon name={status.icon} size={12} aria-hidden="true" />
        {status.label}
      </p>
      <dl className="gx-detail-grid">
        <dt>Responsable</dt><dd>{row.responsible || '—'}</dd>
        <dt>Inicio</dt><dd className="gx-mono">{row.startDate ? formatGanttDate(row.startDate) : 'Sin registro'}</dd>
        <dt>Fin</dt><dd className="gx-mono">{row.endDate ? formatGanttDate(row.endDate) : status === GANTT_STATUS.pendingRecord ? 'Sin registro' : row.start !== null ? 'En curso' : '—'}</dd>
        <dt>Límite legal</dt><dd className="gx-mono">{formatGanttDate(row.limitDate)}</dd>
        <dt>Días hábiles</dt><dd className="gx-mono">{row.used}/{row.total}</dd>
        {row.overrun ? (<><dt>Retraso</dt><dd className="gx-mono gx-text-danger">+{row.overrun.days} d</dd></>) : null}
        {row.suspension ? (<><dt>Suspensión</dt><dd className="gx-mono">{row.suspension.days} d</dd></>) : null}
        {row.prorroga ? (<><dt>Prórroga</dt><dd className="gx-mono">{row.prorroga.days} d{row.prorroga.counted ? '' : ' · sin computar'}</dd></>) : null}
      </dl>
      {actors.length ? (
        <div className="gx-detail-actors">
          <p className="gx-detail-kicker">Actores en paralelo</p>
          {actors.map((a) => (
            <div key={a.name} className="gx-detail-actor">
              <span>{a.name}{a.taskDescription ? <span className="gx-detail-task"> · {a.taskDescription}</span> : null}</span>
              <span className="gx-mono">{Number(a.usedDays) || 0}/{(Number(a.totalDays) || 0) + (Number(a.extraDays) || 0)}</span>
            </div>
          ))}
        </div>
      ) : null}
    </aside>
  );
};

export const GanttModal = ({ isOpen, onClose, series, currentItem }) => {
  const [selectedId, setSelectedId] = useState(null);
  const titleId = useId();
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => { if (!isOpen) setSelectedId(null); }, [isOpen]);
  const togglePhase = useCallback((phase) => setSelectedId((id) => (id === phase.id ? null : phase.id)), []);

  // Focus moves into the dialog on open, returns to the opener on close; Escape closes.
  useEffect(() => {
    if (!isOpen) return undefined;
    const opener = document.activeElement;
    dialogRef.current?.focus();
    // Opened from a menu, the menu hands focus back to its trigger right after closing:
    // take it again once that has happened.
    const focusTimer = window.setTimeout(() => {
      if (dialogRef.current && !dialogRef.current.contains(document.activeElement)) dialogRef.current.focus();
    }, 80);
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCloseRef.current?.();
        return;
      }
      // Keep Tab inside the dialog.
      if (event.key === 'Tab' && dialogRef.current) {
        const focusables = [...dialogRef.current.querySelectorAll('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')];
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      if (opener instanceof HTMLElement && document.contains(opener)) opener.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedRow = series?.rows.find((r) => r.id === selectedId) || null;
  const pending = series?.rows.some((r) => r.status === GANTT_STATUS.pendingRecord);

  return (
    <div className="gantt-modal-overlay" onClick={onClose}>
      <div
        ref={dialogRef}
        className="gantt-modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="gantt-modal-header">
          <div className="gantt-modal-title-group">
            <h3 id={titleId}>Diagrama de Gantt</h3>
            {series ? (
              <dl className="gantt-modal-stats">
                {series.deliveredDate ? (
                  <div><dt>Entrega real</dt><dd className="gx-mono">{formatGanttDate(series.deliveredDate)}</dd></div>
                ) : pending ? (
                  <div><dt>Estado</dt><dd>Finalizado · pendiente por registrar</dd></div>
                ) : series.projectedEndDate ? (
                  <div><dt>Entrega estimada</dt><dd className="gx-mono">{formatGanttDate(series.projectedEndDate)}</dd></div>
                ) : null}
                {!pending && series.projectedEnd !== null ? (
                  <div><dt>{series.deliveredDate ? 'Duración' : 'Duración proyectada'}</dt><dd className="gx-mono">{series.projectedEnd} días hábiles</dd></div>
                ) : null}
                <div><dt>Hoy</dt><dd className="gx-mono">día {series.todayX}</dd></div>
              </dl>
            ) : null}
          </div>
          <div className="gantt-modal-controls">
            {currentItem?.id ? <span className="gantt-modal-ref">Ref. {currentItem.id}</span> : null}
            <button type="button" className="gx-icon-btn" onClick={onClose} aria-label="Cerrar diagrama de Gantt" title="Cerrar">
              <Icon name="X" size={18} />
            </button>
          </div>
        </div>

        <div className={cn('gantt-modal-body', selectedRow && 'has-detail')}>
          <GanttChart
            series={series}
            variant="dialog"
            activePhaseId={selectedId}
            onPhaseClick={togglePhase}
          />
          {selectedRow ? <PhaseDetailPanel row={selectedRow} onClose={() => setSelectedId(null)} /> : null}
        </div>

        <div className="gantt-modal-footer">
          <GanttLegend series={series} />
        </div>
      </div>
    </div>
  );
};
