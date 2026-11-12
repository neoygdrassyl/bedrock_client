import { Fragment, memo, useCallback, useEffect, useId, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { Icon } from '@/shared/components/icon';
import { cn } from '@/shared/lib/utils';
import { calculateScheduledLimitForDisplay } from '../../utils/scheduleUtils';
import { GANTT_STATUS, buildGanttAxis, buildGanttScale, buildGanttSeries, formatGanttDate } from './ganttSeries';

/**
 * Series of the Gantt, built once by the module and handed to the inline card, the dialog
 * and the legend, so the three always show the same data with the same encoding.
 */
export function useGanttSeries({ phases, radDate, manager, scheduleConfig, suspensionPreActa, suspensionPostActa, extension, processPending }) {
  const today = manager?.systemDate ? dayjs(manager.systemDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');

  const scheduled = useMemo(() => {
    if (!scheduleConfig?.times || !manager?.getClock) return [];
    return Object.keys(scheduleConfig.times).map((key) => {
      const state = Number(key);
      const clockDef = (manager.clocksData || []).find((c) => c.state === state);
      try {
        const info = calculateScheduledLimitForDisplay(state, clockDef || { state, allowSchedule: true }, manager.getClock(state), scheduleConfig, manager.getClock, manager.getClockVersion, manager);
        return info?.limitDate ? { state, label: clockDef?.name || `Evento ${state}`, date: info.limitDate } : null;
      } catch {
        return null;
      }
    }).filter(Boolean);
  }, [scheduleConfig, manager]);

  const milestones = useMemo(() => {
    const getClock = manager?.getClock;
    const dateOf = (state) => (getClock ? getClock(state)?.date_start : null) || null;
    return [
      { key: 'radicacion', label: 'Radicación', short: 'Rad.', date: radDate || null },
      { key: 'acta', label: 'Acta de observaciones', short: 'Acta', date: dateOf(30) },
      { key: 'resolucion', label: 'Resolución', short: 'Res.', date: dateOf(70) },
      { key: 'entrega', label: 'Entrega de licencia', short: 'Entrega', date: dateOf(98) },
    ].filter((m) => m.date);
  }, [manager, radDate]);

  return useMemo(() => buildGanttSeries({
    phases, radDate, today, suspensionPreActa, suspensionPostActa, extension, processPending, milestones, scheduled,
  }), [phases, radDate, today, suspensionPreActa, suspensionPostActa, extension, processPending, milestones, scheduled]);
}

const ZOOM_OPTIONS = [
  { key: 'process', label: 'Proceso', hint: 'Todo el proceso; los tramos largos sin cambios se comprimen' },
  { key: 'all', label: 'Todo', hint: 'Escala lineal, proporciones reales' },
  { key: 'recent', label: '90 días', hint: 'Últimos 90 días calendario' },
];

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const BREAK_PX = 36;
const TRACK_PAD = 28;

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

/** Sentence read by screen readers for one phase row (the tooltip is visual only). */
const describeRow = (row) => {
  const parts = [`Fase ${row.index}, ${row.title}`, row.status.label];
  if (row.status === GANTT_STATUS.pendingRecord) {
    parts.push(`plazo de ${plural(row.total, 'día hábil', 'días hábiles')}`);
    parts.push(row.startDate ? `inicio ${formatGanttDate(row.startDate)}, límite legal ${formatGanttDate(row.limitDate)}` : 'sin registro de inicio');
    parts.push('sin registro de cierre');
  } else if (row.start !== null) {
    parts.push(`${row.used} de ${row.total} días hábiles`);
    parts.push(`inicio ${formatGanttDate(row.startDate)}`);
    parts.push(`límite legal ${formatGanttDate(row.limitDate)}`);
    parts.push(row.endDate ? `fin ${formatGanttDate(row.endDate)}` : 'sin fecha de fin');
  } else {
    parts.push(`plazo de ${plural(row.total, 'día hábil', 'días hábiles')}, sin fecha de inicio`);
  }
  if (row.overrun) parts.push(`${plural(row.overrun.days, 'día hábil', 'días hábiles')} de retraso`);
  if (row.suspension) parts.push(`suspensión de ${row.suspension.days} días`);
  if (row.prorroga) parts.push(`prórroga de ${row.prorroga.days} días`);
  if (row.actor) parts.push(`${row.actor.name}: ${row.actor.status.label}, ${row.actor.used} de ${row.actor.total} días`);
  return `${parts.join('. ')}.`;
};

/** Visual tooltip; its own state, so hovering never re-renders the rows. */
function GanttTooltip({ ref }) {
  const [tip, setTip] = useState(null);
  useImperativeHandle(ref, () => ({ show: setTip, hide: () => setTip(null) }), []);
  if (!tip) return null;
  const { row, left, top, flip } = tip;
  const status = row.status;
  return (
    <div className={cn('gx-tooltip', flip && 'is-flipped')} style={{ left, top }} aria-hidden="true">
      <p className="gx-tooltip-title">
        <span className="gx-tooltip-index">Fase {row.index}</span>
        {row.title}
      </p>
      <p className={cn('gx-chip', `tone-${status.tone}`)}>
        <Icon name={status.icon} size={12} aria-hidden="true" />
        {status.label}
      </p>
      <dl className="gx-tooltip-grid">
        <dt>Inicio</dt><dd>{row.startDate ? formatGanttDate(row.startDate) : 'Sin registro'}</dd>
        <dt>Fin</dt>
        <dd>
          {row.endDate
            ? formatGanttDate(row.endDate)
            : row.status === GANTT_STATUS.pendingRecord ? 'Sin registro' : row.start !== null ? 'En curso' : '—'}
        </dd>
        <dt>Límite legal</dt><dd>{row.limitDate ? formatGanttDate(row.limitDate) : '—'}</dd>
        <dt>Días hábiles</dt>
        <dd>
          {row.status === GANTT_STATUS.pendingRecord ? `Plazo ${row.total} · sin registro` : `${row.used}/${row.total}`}
          {row.overrun ? <span className="gx-tooltip-over"> · +{row.overrun.days} de retraso</span> : null}
        </dd>
        {row.suspension ? (<><dt>Suspensión</dt><dd>{row.suspension.days} d · {formatGanttDate(row.suspension.startDate)}{row.suspension.ongoing ? ' → en curso' : ` → ${formatGanttDate(row.suspension.endDate)}`}</dd></>) : null}
        {row.prorroga ? (<><dt>Prórroga</dt><dd>{row.prorroga.days} d · {formatGanttDate(row.prorroga.date)}{row.prorroga.counted ? '' : ' (sin computar)'}</dd></>) : null}
        {row.actor ? (<><dt>{row.actor.name}</dt><dd>{row.actor.used}/{row.actor.total} · {row.actor.status.label}</dd></>) : null}
        {row.markers.map((m) => (
          <Fragment key={m.state}><dt>Programado</dt><dd>{formatGanttDate(m.date)} · {m.label}</dd></Fragment>
        ))}
      </dl>
    </div>
  );
}

/** A text label of ~`width` px at `left` would run into a compressed stretch. */
const hitsBreak = (scale, left, width = 150) => scale.breaks.some((b) => b.left < left + width && b.left + b.width > left);

const span = (scale, from, to, min = 0) => {
  const left = scale.toPx(from);
  return { left, width: Math.max(min, scale.toPx(to) - left) };
};

/** Bars of one phase, positioned on the track. */
const RowBars = ({ row, scale, compactLabels }) => {
  const tone = `tone-${row.status.tone}`;
  const els = [];
  const pendingRecord = row.status === GANTT_STATUS.pendingRecord;

  if (row.suspension) {
    const s = span(scale, row.suspension.from, row.suspension.to, 3);
    els.push(<span key="susp" className="gx-susp" style={{ left: s.left, width: s.width }} />);
  }

  if (row.start !== null) {
    // Legal allowance (planned): ghost bar from the start to the legal limit.
    const allow = span(scale, row.start, row.limit, 2);
    els.push(<span key="allow" className={cn('gx-allow', tone, pendingRecord && 'is-dashed')} style={{ left: allow.left, width: allow.width }} />);

    if (row.prorroga?.counted) {
      const p = span(scale, row.prorroga.from, row.prorroga.to, 2);
      els.push(<span key="pro" className="gx-prorroga" style={{ left: p.left, width: p.width }} />);
    }

    if (row.end !== null) {
      // Actual: solid bar up to the end (or today), capped at the limit; the rest is overrun.
      const actualTo = row.overrun ? row.limit : row.end;
      const a = span(scale, row.start, actualTo, 3);
      els.push(<span key="act" className={cn('gx-actual', tone, row.status === GANTT_STATUS.paused && 'is-hatched')} style={{ left: a.left, width: a.width }} />);
      if (row.overrun) {
        const o = span(scale, row.overrun.from, row.overrun.to, 3);
        els.push(<span key="over" className="gx-over" style={{ left: o.left, width: o.width }} />);
        els.push(<span key="cap" className="gx-cap" style={{ left: o.left + o.width }} />);
        els.push(<span key="overlbl" className="gx-over-label" style={{ left: o.left + o.width + 6 }}>+{row.overrun.days} d</span>);
      }
    }

    if (pendingRecord) {
      // Nothing runs in a finished process: the legal limit is a mark, not a growing line.
      const x = scale.toPx(row.limit);
      els.push(<span key="lim" className="gx-limit-tick" style={{ left: x }} />);
      if (!compactLabels && !hitsBreak(scale, x + 8)) els.push(<span key="limlbl" className="gx-row-note tone-pending" style={{ left: x + 8 }}>Pendiente por registrar</span>);
    }

    if (row.prorroga && !row.prorroga.counted && Number.isFinite(row.prorroga.at)) {
      els.push(<span key="proflag" className="gx-prorroga-flag" style={{ left: scale.toPx(row.prorroga.at) }} />);
    }
  } else if (row.plan) {
    const p = span(scale, row.plan.from, row.plan.to, 3);
    els.push(<span key="plan" className="gx-plan" style={{ left: p.left, width: p.width }} />);
  } else if (row.anchor !== null && row.anchor !== undefined && !compactLabels && !hitsBreak(scale, scale.toPx(row.anchor) + 4, 130)) {
    els.push(<span key="anchor" className="gx-row-note tone-muted" style={{ left: scale.toPx(row.anchor) + 4 }}>Sin registro de inicio</span>);
  }

  if (row.actor) {
    const { actor } = row;
    const aTone = `tone-${actor.status.tone}`;
    const g = span(scale, actor.from, actor.limit, 2);
    els.push(<span key="aallow" className={cn('gx-actor-allow', aTone)} style={{ left: g.left, width: g.width }} />);
    if (actor.to !== null) {
      const a = span(scale, actor.from, Math.min(actor.to, actor.limit), 3);
      els.push(<span key="aact" className={cn('gx-actor-actual', aTone)} style={{ left: a.left, width: a.width }} />);
      if (actor.to > actor.limit) {
        const o = span(scale, actor.limit, actor.to, 2);
        els.push(<span key="aover" className="gx-actor-over" style={{ left: o.left, width: o.width }} />);
      }
    }
  }

  row.markers.forEach((m) => {
    if (!scale.inDomain(m.x)) return;
    els.push(<span key={`mk-${m.state}`} className="gx-sched" style={{ left: scale.toPx(m.x) }} />);
  });

  return els;
};

const GanttRow = memo(function GanttRow({ row, scale, active, onActivate, onHover, onLeave, onKeyNav, compactLabels }) {
  const handlePointer = useCallback((event) => onHover(row, event), [onHover, row]);
  const handleFocus = useCallback((event) => onHover(row, event), [onHover, row]);
  return (
    <li className={cn('gx-row-item', row.actor && 'has-actor')}>
      <button
        type="button"
        className={cn('gx-row', active && 'is-active')}
        aria-label={describeRow(row)}
        aria-current={active ? 'step' : undefined}
        data-row-index={row.index}
        onClick={() => onActivate(row)}
        onPointerMove={handlePointer}
        onPointerLeave={onLeave}
        onFocus={handleFocus}
        onBlur={onLeave}
        onKeyDown={onKeyNav}
      >
        <span className="gx-label">
          <span className={cn('gx-label-icon', `tone-${row.status.tone}`)} aria-hidden="true">
            <Icon name={row.status.icon} size={14} />
          </span>
          <span className="gx-label-text">
            <span className="gx-label-title">{row.title}</span>
            {row.actor ? (
              <span className="gx-label-sub">
                {row.actor.name} {row.actor.status === GANTT_STATUS.pendingRecord || row.actor.status === GANTT_STATUS.noRecord ? `· ${row.actor.status.label.toLowerCase()}` : `${row.actor.used}/${row.actor.total}`}
              </span>
            ) : null}
          </span>
          <span className={cn('gx-label-days', row.overrun && 'is-over', row.status === GANTT_STATUS.pendingRecord && 'is-pending')}>
            {row.status === GANTT_STATUS.pendingRecord ? 'pend.' : `${row.used}/${row.total}`}
          </span>
        </span>
        <span className="gx-track" aria-hidden="true">
          <RowBars row={row} scale={scale} compactLabels={compactLabels} />
        </span>
      </button>
    </li>
  );
});

/**
 * Gantt of the process phases. Pure view of `series` (see useGanttSeries / ganttSeries.js):
 * no day count or status is computed here. Nothing here writes data: rows only open the
 * phase detail through `onPhaseClick`.
 */
export const GanttChart = memo(function GanttChart({ series, onPhaseClick, activePhaseId, variant = 'inline', className }) {
  const [mode, setMode] = useState('process');
  const [viewportWidth, setViewportWidth] = useState(0);
  const scrollRef = useRef(null);
  const tooltipRef = useRef(null);
  const rootRef = useRef(null);
  const summaryId = useId();

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;
    const measure = () => setViewportWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [series ? 1 : 0]);

  const labelWidth = viewportWidth && viewportWidth < 760 ? 184 : variant === 'dialog' ? 288 : 264;
  const trackWidth = Math.max(240, viewportWidth - labelWidth - TRACK_PAD);
  const scale = useMemo(() => buildGanttScale(series, { mode, width: trackWidth, breakPx: BREAK_PX }), [series, mode, trackWidth]);
  const axis = useMemo(() => buildGanttAxis(series, scale), [series, scale]);

  // Keep "today" in view when the chart is wider than its box.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !scale || !series) return;
    if (scale.totalPx <= trackWidth) { el.scrollLeft = 0; return; }
    const todayPx = scale.toPx(series.todayX);
    el.scrollLeft = Math.max(0, todayPx - trackWidth * 0.7);
  }, [scale, series, trackWidth]);

  const showTip = useCallback((row, event) => {
    const root = rootRef.current;
    if (!root || !tooltipRef.current) return;
    const box = root.getBoundingClientRect();
    let x;
    let y;
    if (event.type === 'focus') {
      const track = event.currentTarget.querySelector('.gx-track');
      const r = (track || event.currentTarget).getBoundingClientRect();
      x = Math.min(r.right, Math.max(r.left, r.left + 24));
      y = r.bottom;
    } else {
      x = event.clientX;
      y = event.clientY + 12;
    }
    const left = x - box.left + 14;
    const flip = left + 300 > box.width;
    tooltipRef.current.show({ row, left: flip ? Math.max(8, x - box.left - 314) : left, top: y - box.top + 4, flip });
  }, []);
  const hideTip = useCallback(() => tooltipRef.current?.hide(), []);
  const activate = useCallback((row) => onPhaseClick?.(row.phase), [onPhaseClick]);
  const keyNav = useCallback((event) => {
    if (event.key === 'Escape') { hideTip(); return; }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    const rows = [...(rootRef.current?.querySelectorAll('.gx-row') || [])];
    const at = rows.indexOf(event.currentTarget);
    rows[at + (event.key === 'ArrowDown' ? 1 : -1)]?.focus();
  }, [hideTip]);

  if (!series) {
    return (
      <div className="gx-empty">
        <Icon name="GanttChart" size={16} aria-hidden="true" />
        <p>Sin fases calculadas: registra la fecha de radicación para ver el diagrama.</p>
      </div>
    );
  }

  const ready = Boolean(scale) && viewportWidth > 0;
  const todayIn = ready && scale.inDomain(series.todayX);
  const todayAfter = ready && series.todayX > scale.domainEnd;
  const canvasWidth = ready ? labelWidth + scale.totalPx + TRACK_PAD : '100%';
  const compressedDays = ready ? scale.breaks.reduce((acc, b) => acc + b.days, 0) : 0;
  const overdueRows = series.rows.filter((r) => r.overrun && r.end === series.todayX).length;
  const doneRows = series.rows.filter((r) => r.phase.status === 'COMPLETADO').length;

  // Milestone labels: alternate the line when two are close.
  let lastPx = -Infinity;
  let lift = false;
  const milestoneEls = ready ? series.milestones.filter((m) => scale.inDomain(m.x)).map((m) => {
    const px = scale.toPx(m.x);
    lift = px - lastPx < 64 ? !lift : false;
    lastPx = px;
    return { ...m, px, lift };
  }) : [];

  return (
    <div
      ref={rootRef}
      className={cn('gx', `gx-${variant}`, className)}
      style={{ '--gx-label-w': `${labelWidth}px` }}
      role="group"
      aria-label="Diagrama de Gantt de las fases del proceso"
      aria-describedby={summaryId}
    >
      <div className="gx-toolbar">
        <div className="gx-zoom" role="group" aria-label="Escala del diagrama">
          {ZOOM_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              className={cn('gx-zoom-btn', mode === opt.key && 'is-on')}
              aria-pressed={mode === opt.key}
              title={opt.hint}
              onClick={() => setMode(opt.key)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="gx-toolbar-note">
          <span>Eje: días hábiles desde la radicación <span className="gx-mono">{formatGanttDate(series.rad)}</span></span>
          {compressedDays > 0 ? (
            <span className="gx-break-note">
              <span className="gx-break-glyph" aria-hidden="true" />
              {plural(compressedDays, 'día hábil comprimido', 'días hábiles comprimidos')}
            </span>
          ) : null}
        </p>
      </div>

      <div ref={scrollRef} className="gx-scroll">
        {ready ? (
          <div className="gx-canvas" style={{ width: canvasWidth }}>
            {/* Grid, compressed stretches and today, behind / across the rows */}
            <div className="gx-layer gx-grid" aria-hidden="true" style={{ left: labelWidth, width: scale.totalPx }}>
              {axis.ticks.map((t) => <span key={`g-${t.x}`} className="gx-gridline" style={{ left: t.px }} />)}
              {axis.months.map((m) => <span key={`gm-${m.key}`} className="gx-gridline is-month" style={{ left: m.fromPx }} />)}
            </div>

            <div className="gx-head">
              <div className="gx-corner">
                <span>Fase</span>
                <span className="gx-corner-days">Días háb.</span>
              </div>
              <div className="gx-axis" style={{ width: scale.totalPx }} aria-hidden="true">
                <div className="gx-axis-months">
                  {axis.months.map((m, i) => {
                    const w = m.toPx - m.fromPx;
                    if (w < 22) return null;
                    // Year on the first month, on January and after a compressed stretch.
                    const prev = axis.months[i - 1];
                    const first = w >= 60 && (i === 0 || m.date.month() === 0 || !prev || prev.date.add(1, 'month').format('YYYY-MM') !== m.key);
                    return (
                      <span key={m.key} className="gx-month" style={{ left: m.fromPx, width: w }}>
                        {w < 44 ? MONTHS[m.date.month()].slice(0, 1) : `${MONTHS[m.date.month()]}${first ? ` ${m.date.format('YYYY')}` : ''}`}
                      </span>
                    );
                  })}
                </div>
                <div className="gx-axis-ticks">
                  {axis.ticks.map((t) => (
                    // A tick under the "Hoy" chip would be unreadable: the chip wins.
                    todayIn && Math.abs(t.px - scale.toPx(series.todayX)) < 44
                      ? null
                      : <span key={`t-${t.x}`} className="gx-tick" style={{ left: t.px }}>{t.x}</span>
                  ))}
                </div>
                {scale.breaks.map((b) => (
                  <span key={`hb-${b.from}`} className="gx-axis-break" style={{ left: b.left, width: b.width }} title={`${b.days} días hábiles comprimidos`}>
                    ≈{b.days}
                  </span>
                ))}
                {todayIn ? (
                  <span className="gx-today-chip" style={{ left: scale.toPx(series.todayX) }}>
                    Hoy <span className="gx-mono">{dayjs(series.today).format('DD/MM')}</span>
                  </span>
                ) : null}
                {todayAfter ? (
                  <span className="gx-today-chip is-edge" style={{ left: scale.totalPx }}>
                    Hoy <span className="gx-mono">{dayjs(series.today).format('DD/MM/YY')}</span> →
                  </span>
                ) : null}
              </div>
            </div>

            {milestoneEls.length ? (
              <div className="gx-lane">
                <div className="gx-lane-label">Hitos</div>
                <div className="gx-lane-track" style={{ width: scale.totalPx }}>
                  {milestoneEls.map((m) => (
                    <span key={m.key} className={cn('gx-milestone', m.lift && 'is-lift')} style={{ left: m.px }} title={`${m.label} · ${formatGanttDate(m.date)}`}>
                      <span className="gx-milestone-mark" aria-hidden="true" />
                      <span className="gx-milestone-label">{m.short} <span className="gx-mono">{dayjs(m.date).format('DD/MM')}</span></span>
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <ol className="gx-rows" aria-label="Fases">
              {series.rows.map((row) => (
                <GanttRow
                  key={row.id}
                  row={row}
                  scale={scale}
                  active={row.id === activePhaseId}
                  onActivate={activate}
                  onHover={showTip}
                  onLeave={hideTip}
                  onKeyNav={keyNav}
                  compactLabels={labelWidth < 200}
                />
              ))}
            </ol>

            <div className="gx-layer gx-over-layer" aria-hidden="true" style={{ left: labelWidth, width: scale.totalPx }}>
              {scale.breaks.map((b) => <span key={`b-${b.from}`} className="gx-break" style={{ left: b.left, width: b.width }} />)}
              {todayIn ? <span className="gx-today" style={{ left: scale.toPx(series.todayX) }} /> : null}
            </div>
          </div>
        ) : null}
      </div>

      <GanttTooltip ref={tooltipRef} />

      <p id={summaryId} className="sr-only">
        {`${series.rows.length} fases: ${doneRows} completadas${overdueRows ? `, ${overdueRows} vencida${overdueRows === 1 ? '' : 's'}` : ''}. `}
        {`Radicación ${formatGanttDate(series.rad)}; hoy ${formatGanttDate(series.today)}, día hábil ${series.todayX}. `}
        Cada fase es un botón con su detalle; flechas arriba y abajo para recorrerlas.
      </p>
    </div>
  );
});


export default GanttChart;
