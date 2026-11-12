import dayjs from 'dayjs';
import { calcularDiasHabiles, sumarDiasHabiles } from '../../hooks/useClocksManager';
import { describePhaseTerm } from '../SidebarInfo';

/**
 * Gantt series: the ONE projection of the calculated phases (`useProcessPhases`) onto a
 * business-day axis, shared by the inline Gantt card and the Gantt dialog.
 *
 * Presentation only. Every day count, limit and status comes from the phases hook (through
 * `describePhaseTerm`, the same helper the phase stepper uses); this module only maps dates
 * to x positions:
 *
 *   x(date) = business days in (radicación, date]   (calcularDiasHabiles, start excluded)
 *
 * which is the same convention the hook uses for `startPosition` and `usedDays`, and the
 * inverse of the axis labels (`sumarDiasHabiles(radicación, x)`).
 */

const DAY_MS = 86400000;

/** Gantt status vocabulary. `tone` drives color; `pattern` the non-color cue. */
export const GANTT_STATUS = Object.freeze({
  done: { key: 'done', label: 'Completado', tone: 'success', icon: 'CheckCircle' },
  doneLate: { key: 'doneLate', label: 'Completado con retraso', tone: 'danger', icon: 'AlertTriangle' },
  active: { key: 'active', label: 'En curso', tone: 'info', icon: 'Play' },
  overdue: { key: 'overdue', label: 'Vencido', tone: 'danger', icon: 'AlertTriangle' },
  paused: { key: 'paused', label: 'Pausado (suspensión)', tone: 'warning', icon: 'PauseCircle' },
  pendingRecord: { key: 'pendingRecord', label: 'Pendiente por registrar', tone: 'pending', icon: 'Hourglass' },
  notStarted: { key: 'notStarted', label: 'Sin iniciar', tone: 'muted', icon: 'Circle' },
  // Secondary actor whose phase already closed without its event (e.g. no recurso filed).
  noRecord: { key: 'noRecord', label: 'Sin registro', tone: 'muted', icon: 'Circle' },
});

export const formatGanttDate = (value) => (value && dayjs(value).isValid() ? dayjs(value).format('DD/MM/YYYY') : '—');

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const resolveStatus = (phase, term, processPending) => {
  if (processPending && phase?.status !== 'COMPLETADO') return GANTT_STATUS.pendingRecord;
  switch (phase?.status) {
    case 'COMPLETADO':
      // describePhaseTerm marks a phase closed after its limit as "Vencido".
      return term.status.color === 'danger' ? GANTT_STATUS.doneLate : GANTT_STATUS.done;
    case 'ACTIVO':
      return term.remaining < 0 ? GANTT_STATUS.overdue : GANTT_STATUS.active;
    case 'PAUSADO':
      return GANTT_STATUS.paused;
    case 'VENCIDO':
      return GANTT_STATUS.overdue;
    default:
      return GANTT_STATUS.notStarted;
  }
};

const isOpenStatus = (status) => status === GANTT_STATUS.active || status === GANTT_STATUS.overdue || status === GANTT_STATUS.paused;

/**
 * @param {object} input
 * @param {object[]} input.phases              processPhases from useProcessPhases
 * @param {string}   input.radDate             radicación (YYYY-MM-DD)
 * @param {string}   input.today               system / emulated date
 * @param {object}   [input.suspensionPreActa]
 * @param {object}   [input.suspensionPostActa]
 * @param {object}   [input.extension]
 * @param {boolean}  [input.processPending]    finished process with records still to file
 * @param {object[]} [input.milestones]        [{ key, label, short, date }]
 * @param {object[]} [input.scheduled]         [{ state, label, date }] scheduled limits
 */
export function buildGanttSeries({
  phases = [],
  radDate,
  today,
  suspensionPreActa,
  suspensionPostActa,
  extension,
  processPending = false,
  milestones = [],
  scheduled = [],
} = {}) {
  if (!radDate || !Array.isArray(phases) || phases.length === 0) return null;

  const rad = dayjs(radDate).format('YYYY-MM-DD');
  const todayStr = dayjs(today || undefined).format('YYYY-MM-DD');
  const xOf = (date) => (date ? calcularDiasHabiles(rad, date, false) : null);
  const todayX = dayjs(todayStr).isBefore(rad) ? 0 : xOf(todayStr);

  // Prórroga belongs to the phase it was granted in (same rule as before: before or after
  // the start of "Revisión y Viabilidad").
  const splitDate = phases.find((p) => p.title === 'Revisión y Viabilidad')?.startDate || null;
  const extensionDate = extension?.exists ? extension.start?.date_start : null;
  const extensionCounted = Boolean(extension?.exists && extension.end?.date_start);

  const rows = [];
  let cursor = 0; // expected end of the previous phase, for not-started projections

  phases.forEach((phase, i) => {
    const term = describePhaseTerm(phase);
    const status = resolveStatus(phase, term, processPending);
    const total = term.total;
    const used = term.used;

    const start = phase.startDate ? (Number.isFinite(phase.startPosition) ? phase.startPosition : xOf(phase.startDate)) : null;
    let end = null;
    if (start !== null) {
      if (phase.status === 'COMPLETADO') {
        end = phase.endDate ? Math.max(start, xOf(phase.endDate)) : start + used;
      } else if (isOpenStatus(status)) {
        end = Math.max(start, todayX);
      }
    }
    const limit = start !== null ? start + total : null;
    const limitDate = phase.limitDate || (phase.startDate ? sumarDiasHabiles(phase.startDate, total) : null);

    // Overrun: the stretch past the legal limit. Never for a pending record (nothing runs).
    let overrun = null;
    if (status !== GANTT_STATUS.pendingRecord && end !== null && limit !== null && end > limit) {
      overrun = { from: limit, to: end, days: Math.max(0, used - total) || end - limit };
    }

    // Projection of a phase that has not started: right after the expected end of the
    // previous one (never in the past). Not drawn for a finished process.
    let plan = null;
    // Finished process, phase never started: where it would have begun, for a note.
    const anchor = start === null && processPending ? cursor : null;
    if (start === null && !processPending) {
      const planStart = Math.max(cursor, 0);
      plan = { from: planStart, to: planStart + total };
    }

    if (start !== null) {
      if (phase.status === 'COMPLETADO') cursor = end;
      else if (status === GANTT_STATUS.pendingRecord) cursor = limit;
      else cursor = Math.max(limit, todayX);
    } else if (plan) {
      cursor = plan.to;
    }

    // Suspension window (pre-acta on Estudio, post-acta on Revisión).
    let suspension = null;
    const susp = phase.id === 'phase1' ? suspensionPreActa
      : (phase.id === 'phase4' || phase.id === 'phase4_desist') ? suspensionPostActa : null;
    if (susp?.exists && susp.start?.date_start && !dayjs(susp.start.date_start).isBefore(rad)) {
      const from = xOf(susp.start.date_start);
      const endDate = susp.end?.date_start || null;
      const to = endDate ? Math.max(from, xOf(endDate)) : Math.max(from, todayX);
      suspension = {
        from,
        to: Math.max(to, from + 1),
        days: toNumber(susp.days) || (to - from),
        startDate: susp.start.date_start,
        endDate,
        ongoing: !endDate,
      };
    }

    // Prórroga: when counted, the hook added its days to this phase's allowance; it is drawn
    // as the last `days` of that allowance. When requested but not counted yet, a marker.
    let prorroga = null;
    if (extensionDate && start !== null) {
      const inPhase1 = phase.id === 'phase1' && (!splitDate || dayjs(extensionDate).isBefore(splitDate));
      const inPhase4 = (phase.id === 'phase4' || phase.id === 'phase4_desist') && splitDate && !dayjs(extensionDate).isBefore(splitDate);
      if (inPhase1 || inPhase4) {
        const days = toNumber(extension.days);
        prorroga = extensionCounted && days > 0 && limit !== null
          ? { counted: true, from: Math.max(start, limit - days), to: limit, days, date: extensionDate }
          : { counted: false, at: xOf(extensionDate), days, date: extensionDate };
      }
    }

    // Secondary actor (valla / recurso): its own lane under the phase bar.
    let actor = null;
    const secondary = phase.parallelActors?.primary && phase.parallelActors?.secondary ? phase.parallelActors.secondary : null;
    if (secondary && start !== null) {
      const aTerm = describePhaseTerm(secondary);
      const phaseClosed = phase.status === 'COMPLETADO';
      const aEnd = secondary.endDate
        ? Math.max(start, xOf(secondary.endDate))
        : (secondary.status === 'ACTIVO' && !processPending && !phaseClosed ? Math.max(start, todayX) : null);
      const aStatus = !secondary.endDate && phaseClosed
        ? GANTT_STATUS.noRecord
        : processPending && secondary.status !== 'COMPLETADO'
        ? GANTT_STATUS.pendingRecord
        : secondary.endDate ? (aTerm.status.color === 'danger' ? GANTT_STATUS.doneLate : GANTT_STATUS.done)
          : secondary.status === 'ACTIVO' ? (aTerm.remaining < 0 ? GANTT_STATUS.overdue : GANTT_STATUS.active)
            : secondary.status === 'VENCIDO' ? GANTT_STATUS.overdue : GANTT_STATUS.notStarted;
      actor = {
        name: secondary.name,
        task: secondary.taskDescription || null,
        used: aTerm.used,
        total: aTerm.total,
        status: aStatus,
        from: start,
        to: aEnd,
        limit: start + aTerm.total,
        endDate: secondary.endDate || null,
      };
    }

    rows.push({
      id: phase.id || `phase-${i}`,
      index: i + 1,
      title: phase.title,
      responsible: phase.responsible,
      status,
      used,
      total,
      remaining: term.remaining,
      start,
      end,
      limit,
      startDate: phase.startDate || null,
      endDate: phase.endDate || null,
      limitDate,
      overrun,
      plan,
      anchor,
      suspension,
      prorroga,
      actor,
      markers: [],
      phase,
    });
  });

  // Scheduled limits: on the phase that owns the event, else the one running at that date.
  scheduled.forEach((item) => {
    if (!item?.date) return;
    const x = xOf(item.date);
    const owner = rows.find((row) => (row.phase.relatedStates || []).includes(item.state))
      || rows.find((row) => row.start !== null && x >= row.start && (row.end === null || x <= row.end));
    if (owner) owner.markers.push({ x, date: item.date, label: item.label, state: item.state });
  });

  const marks = milestones
    .filter((m) => m?.date && !dayjs(m.date).isBefore(rad))
    .map((m) => ({ ...m, x: xOf(m.date) }));

  // Expected delivery: end of the last row (real end when completed, else projected).
  const last = rows[rows.length - 1];
  const lastCompleted = last?.phase.status === 'COMPLETADO' && last.endDate;
  const projectedEnd = rows.reduce((acc, row) => {
    const candidates = [row.end, row.limit, row.plan?.to].filter((v) => v !== null && v !== undefined);
    return Math.max(acc, ...candidates, 0);
  }, 0);

  const kinds = [];
  rows.forEach((row) => { if (!kinds.includes(row.status.key)) kinds.push(row.status.key); });

  return {
    rad,
    today: todayStr,
    todayX,
    rows,
    milestones: marks,
    projectedEnd: lastCompleted ? last.end : (processPending ? null : cursor),
    projectedEndDate: lastCompleted ? last.endDate : (processPending ? null : sumarDiasHabiles(rad, cursor)),
    deliveredDate: lastCompleted ? last.endDate : null,
    extent: projectedEnd,
    kinds,
    has: {
      overrun: rows.some((r) => r.overrun),
      suspension: rows.some((r) => r.suspension),
      prorroga: rows.some((r) => r.prorroga),
      plan: rows.some((r) => r.plan),
      allowance: rows.some((r) => r.start !== null),
      markers: rows.some((r) => r.markers.length > 0),
      milestones: marks.length > 0,
      actor: rows.some((r) => r.actor),
    },
  };
}

/** Business-day x of a calendar date, for axis labels. */
export const businessX = (rad, date) => calcularDiasHabiles(rad, date, false);

/**
 * Scale of the chart: domain in business days and an optional set of compressed gaps.
 * `mode`: 'process' (fit the process, long empty stretches compressed), 'all' (linear,
 * real proportions) or 'recent' (90 calendar days around today).
 */
export function buildGanttScale(series, { mode = 'process', width = 800, breakPx = 36, padLeft = 16 } = {}) {
  if (!series) return null;
  const { rows, todayX, milestones } = series;

  const points = new Set([0]);
  rows.forEach((row) => {
    [row.start, row.end, row.limit, row.plan?.from, row.plan?.to, row.suspension?.from, row.suspension?.to,
      row.prorroga?.from, row.prorroga?.at, row.actor?.to, row.actor?.limit]
      .forEach((v) => { if (Number.isFinite(v)) points.add(v); });
    row.markers.forEach((m) => points.add(m.x));
  });
  milestones.forEach((m) => points.add(m.x));
  points.add(todayX);

  const sorted = [...points].sort((a, b) => a - b);
  let domainStart = 0;
  let domainEnd = sorted[sorted.length - 1];

  if (mode === 'recent') {
    const from = businessX(series.rad, dayjs(series.today).subtract(90, 'day').format('YYYY-MM-DD'));
    domainStart = Math.max(0, from);
    domainEnd = Math.max(todayX + 10, domainStart + 20);
  }
  // Breathing room after the last mark.
  const span = Math.max(1, domainEnd - domainStart);
  domainEnd += Math.max(3, Math.round(span * 0.03));

  // Compress the longest empty stretches (no start, end, limit, mark or today inside).
  const breaks = [];
  if (mode === 'process') {
    const threshold = Math.max(60, span * 0.22);
    const margin = 8;
    const gaps = [];
    for (let i = 0; i < sorted.length - 1; i += 1) {
      const a = sorted[i];
      const b = sorted[i + 1];
      if (b - a > threshold) gaps.push({ from: a + margin, to: b - margin });
    }
    gaps.sort((g1, g2) => (g2.to - g2.from) - (g1.to - g1.from));
    gaps.slice(0, 2).sort((g1, g2) => g1.from - g2.from).forEach((g) => breaks.push({ ...g, days: g.to - g.from }));
  }

  const compressed = breaks.reduce((acc, b) => acc + b.days, 0);
  const linearDays = Math.max(1, domainEnd - domainStart - compressed);
  const minPx = mode === 'all' ? 1.5 : mode === 'recent' ? 6 : 3;
  const usable = Math.max(120, width - padLeft - breaks.length * breakPx);
  const pxPerDay = Math.max(minPx, usable / linearDays);

  const toPx = (x) => {
    const v = Math.min(Math.max(x, domainStart), domainEnd);
    let px = padLeft + (v - domainStart) * pxPerDay;
    for (const b of breaks) {
      if (v <= b.from) break;
      if (v >= b.to) px += breakPx - b.days * pxPerDay;
      else px += ((v - b.from) / b.days) * breakPx - (v - b.from) * pxPerDay;
    }
    return px;
  };

  const totalPx = toPx(domainEnd);
  const breakSpans = breaks.map((b) => ({ ...b, left: toPx(b.from), width: breakPx }));

  return { mode, domainStart, domainEnd, pxPerDay, breaks: breakSpans, toPx, totalPx, inDomain: (x) => x >= domainStart && x <= domainEnd };
}

/** Axis ticks: business-day numbers at a readable step, and month boundaries. */
export function buildGanttAxis(series, scale) {
  if (!series || !scale) return { ticks: [], months: [] };
  const { domainStart, domainEnd, pxPerDay, breaks, toPx } = scale;
  const steps = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500];
  const step = steps.find((s) => s * pxPerDay >= 44) || 500;
  const inBreak = (x) => breaks.some((b) => x > b.from && x < b.to);

  const ticks = [];
  for (let x = Math.ceil(domainStart / step) * step; x <= domainEnd; x += step) {
    if (!inBreak(x)) ticks.push({ x, px: toPx(x) });
  }

  // Month boundaries: x of the last day of each month.
  const months = [];
  const startDate = dayjs(sumarDiasHabiles(series.rad, domainStart));
  const endDate = dayjs(sumarDiasHabiles(series.rad, domainEnd));
  if (endDate.diff(startDate, 'day') < 3000) {
    let cursor = startDate.startOf('month');
    let guard = 0;
    while (cursor.isBefore(endDate) && guard < 200) {
      const next = cursor.add(1, 'month');
      const fromX = Math.max(domainStart, cursor.isAfter(series.rad) ? businessX(series.rad, cursor.subtract(1, 'day').format('YYYY-MM-DD')) : 0);
      const toX = Math.min(domainEnd, businessX(series.rad, next.subtract(1, 'day').format('YYYY-MM-DD')));
      if (toX > fromX && !(breaks.some((b) => fromX >= b.from && toX <= b.to))) {
        months.push({ key: cursor.format('YYYY-MM'), date: cursor, fromPx: toPx(fromX), toPx: toPx(toX) });
      }
      cursor = next;
      guard += 1;
    }
  }
  return { ticks, months, step };
}

/** Calendar date at business-day x (for tooltips / labels). */
export const dateAtX = (rad, x) => sumarDiasHabiles(rad, Math.max(0, Math.round(x)));

export const calendarDaysBetween = (a, b) => Math.round((dayjs(b).valueOf() - dayjs(a).valueOf()) / DAY_MS);
