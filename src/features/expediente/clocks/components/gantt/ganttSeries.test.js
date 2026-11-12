import { describe, expect, it } from 'vitest';
import {
  GANTT_STATUS,
  buildGanttAxis,
  buildGanttScale,
  buildGanttSeries,
  calendarDaysBetween,
  dateAtX,
  formatGanttDate,
} from './ganttSeries';

// February 2026 has no Colombian holiday: business days are plain Monday-Friday.
// x(date) = business days after the radicación (Monday 2026-02-02).
const RAD = '2026-02-02';
const TODAY = '2026-02-27'; // x = 19

const estudio = (extra = {}) => ({
  id: 'phase1', title: 'Estudio y Observaciones', responsible: 'Curaduría', status: 'COMPLETADO',
  startDate: '2026-02-02', endDate: '2026-02-13', totalDays: 10, usedDays: 9, relatedStates: [5, 30], ...extra,
});
const revision = (extra = {}) => ({
  id: 'phase4', title: 'Revisión y Viabilidad', responsible: 'Curaduría', status: 'ACTIVO',
  startDate: '2026-02-16', totalDays: 5, usedDays: 9, relatedStates: [61], ...extra,
});
const entrega = (extra = {}) => ({ id: 'phase6', title: 'Entrega', status: 'PENDIENTE', totalDays: 5, usedDays: 0, ...extra });

const build = (input = {}) => buildGanttSeries({ phases: [estudio(), revision(), entrega()], radDate: RAD, today: TODAY, ...input });

describe('buildGanttSeries', () => {
  it('returns null without a radicación date or without phases', () => {
    expect(buildGanttSeries()).toBeNull();
    expect(buildGanttSeries({ phases: [estudio()], radDate: null })).toBeNull();
    expect(buildGanttSeries({ phases: [], radDate: RAD })).toBeNull();
    expect(buildGanttSeries({ phases: null, radDate: RAD })).toBeNull();
  });

  it('places a completed phase between its start and end dates, on the business-day axis', () => {
    const [row] = build().rows;

    expect(row).toMatchObject({ id: 'phase1', index: 1, start: 0, end: 9, limit: 10, used: 9, total: 10, remaining: 1, overrun: null, plan: null });
    expect(row.status).toBe(GANTT_STATUS.done);
    expect(row.limitDate).toBe('2026-02-16');
  });

  it('runs an open phase up to today and draws the stretch past its legal limit as overrun', () => {
    const series = build();
    const row = series.rows[1];

    expect(series.todayX).toBe(19);
    expect(row).toMatchObject({ start: 10, end: 19, limit: 15, remaining: -4 });
    expect(row.status).toBe(GANTT_STATUS.overdue);
    expect(row.overrun).toEqual({ from: 15, to: 19, days: 4 });
  });

  it('keeps an open phase inside its limit as "En curso" without overrun', () => {
    const row = build({ phases: [estudio(), revision({ totalDays: 15, usedDays: 9 })] }).rows[1];

    expect(row.status).toBe(GANTT_STATUS.active);
    expect(row).toMatchObject({ end: 19, limit: 25, overrun: null });
  });

  it('projects a phase that has not started right after the previous one, never in the past', () => {
    const series = build();
    const row = series.rows[2];

    expect(row.status).toBe(GANTT_STATUS.notStarted);
    expect(row).toMatchObject({ start: null, end: null, limit: null, anchor: null });
    // The previous phase is overdue: the projection starts today (19), not at its limit (15).
    expect(row.plan).toEqual({ from: 19, to: 24 });
    expect(series.projectedEnd).toBe(24);
    expect(series.projectedEndDate).toBe(dateAtX(RAD, 24));
    expect(series.deliveredDate).toBeNull();
    expect(series.extent).toBe(24);
  });

  it('marks a completed phase closed after its limit as late', () => {
    const row = build({ phases: [estudio({ endDate: '2026-02-20', limitDate: '2026-02-16', usedDays: 14 })] }).rows[0];

    expect(row.status).toBe(GANTT_STATUS.doneLate);
    expect(row).toMatchObject({ end: 14, limit: 10 });
    expect(row.overrun).toEqual({ from: 10, to: 14, days: 4 });
  });

  it('finished process with pending records: nothing runs, nothing is overdue, nothing is projected', () => {
    const series = build({ processPending: true });
    const [done, open, never] = series.rows;

    expect(done.status).toBe(GANTT_STATUS.done);
    expect(open.status).toBe(GANTT_STATUS.pendingRecord);
    expect(open).toMatchObject({ start: 10, end: null, limit: 15, overrun: null });
    expect(never.status).toBe(GANTT_STATUS.pendingRecord);
    // Where it would have begun: the limit of the phase that stayed open.
    expect(never).toMatchObject({ plan: null, anchor: 15 });
    expect(series.projectedEnd).toBeNull();
    expect(series.projectedEndDate).toBeNull();
    expect(series.has).toMatchObject({ overrun: false, plan: false });
    expect(series.kinds).toEqual(['done', 'pendingRecord']);
  });

  it('reports the delivery date when the last phase is completed', () => {
    const series = build({ phases: [estudio(), revision({ status: 'COMPLETADO', endDate: '2026-02-20', usedDays: 4 })] });

    expect(series.deliveredDate).toBe('2026-02-20');
    expect(series.projectedEnd).toBe(14);
    expect(series.projectedEndDate).toBe('2026-02-20');
  });

  it('draws a closed suspension on the phase it belongs to and an ongoing one up to today', () => {
    const closed = build({ suspensionPreActa: { exists: true, start: { date_start: '2026-02-04' }, end: { date_start: '2026-02-06' }, days: 3 } });
    expect(closed.rows[0].suspension).toEqual({ from: 2, to: 4, days: 3, startDate: '2026-02-04', endDate: '2026-02-06', ongoing: false });
    expect(closed.rows[1].suspension).toBeNull();
    expect(closed.has.suspension).toBe(true);

    const ongoing = build({ suspensionPostActa: { exists: true, start: { date_start: '2026-02-18' } } });
    expect(ongoing.rows[0].suspension).toBeNull();
    expect(ongoing.rows[1].suspension).toMatchObject({ from: 12, to: 19, days: 7, ongoing: true, endDate: null });
  });

  it('draws a counted prórroga as the last days of the allowance and a requested one as a marker', () => {
    const counted = build({
      phases: [estudio({ totalDays: 10, extraDays: 5 }), revision()],
      extension: { exists: true, start: { date_start: '2026-02-05' }, end: { date_start: '2026-02-12' }, days: 5 },
    });
    expect(counted.rows[0]).toMatchObject({ limit: 15, total: 15 });
    expect(counted.rows[0].prorroga).toEqual({ counted: true, from: 10, to: 15, days: 5, date: '2026-02-05' });
    expect(counted.rows[1].prorroga).toBeNull();

    const requested = build({ extension: { exists: true, start: { date_start: '2026-02-18' }, days: 22 } });
    expect(requested.rows[0].prorroga).toBeNull();
    expect(requested.rows[1].prorroga).toEqual({ counted: false, at: 12, days: 22, date: '2026-02-18' });
  });

  it('gives the secondary actor its own lane', () => {
    const withActor = (secondary, phaseExtra = {}) => build({
      phases: [estudio({ parallelActors: { primary: { name: 'Curaduría' }, secondary }, ...phaseExtra })],
    }).rows[0].actor;

    expect(withActor({ name: 'Solicitante', taskDescription: 'Instalar valla', status: 'COMPLETADO', endDate: '2026-02-06', totalDays: 5, usedDays: 4 }))
      .toMatchObject({ name: 'Solicitante', task: 'Instalar valla', from: 0, to: 4, limit: 5, status: GANTT_STATUS.done });
    // The phase closed and the actor never registered its event.
    expect(withActor({ name: 'Solicitante', status: 'ACTIVO', totalDays: 5, usedDays: 9 }))
      .toMatchObject({ to: null, status: GANTT_STATUS.noRecord });
    expect(withActor({ name: 'Solicitante', status: 'ACTIVO', totalDays: 30, usedDays: 19 }, { status: 'ACTIVO', endDate: undefined, totalDays: 30, usedDays: 19 }))
      .toMatchObject({ to: 19, limit: 30, status: GANTT_STATUS.active });
  });

  it('positions milestones and scheduled limits by date', () => {
    const series = build({
      milestones: [
        { key: 'ldf', label: 'Legal y debida forma', date: '2026-02-09' },
        { key: 'old', label: 'Antes de radicar', date: '2026-01-20' },
        { key: 'none', label: 'Sin fecha' },
      ],
      scheduled: [
        { state: 61, label: 'Viabilidad', date: '2026-02-19' },
        { state: 999, label: 'Sin dueño', date: '2026-02-05' },
        { state: 30, label: 'Sin fecha' },
      ],
    });

    expect(series.milestones).toEqual([{ key: 'ldf', label: 'Legal y debida forma', date: '2026-02-09', x: 5 }]);
    // By owner of the event state, else by the phase running at that date.
    expect(series.rows[1].markers).toEqual([{ x: 13, date: '2026-02-19', label: 'Viabilidad', state: 61 }]);
    expect(series.rows[0].markers).toEqual([{ x: 3, date: '2026-02-05', label: 'Sin dueño', state: 999 }]);
    expect(series.has).toMatchObject({ markers: true, milestones: true });
  });

  it('never reports a negative "today" when the system date is before the radicación', () => {
    expect(build({ today: '2026-01-15' }).todayX).toBe(0);
  });
});

describe('buildGanttScale', () => {
  const series = (rows, todayX) => ({ rad: RAD, today: TODAY, todayX, milestones: [], rows: rows.map((row) => ({ markers: [], ...row })) });
  const compact = series([{ start: 0, end: 9, limit: 10 }, { start: 10, end: 19, limit: 15 }], 19);
  const sparse = series([{ start: 0, end: 10, limit: 10 }, { start: 200, end: 205, limit: 210 }], 205);

  it('returns null without a series', () => {
    expect(buildGanttScale(null)).toBeNull();
    expect(buildGanttAxis(null, null)).toEqual({ ticks: [], months: [] });
  });

  it('maps business days to pixels linearly and in order when nothing is compressed', () => {
    const scale = buildGanttScale(compact, { mode: 'process', width: 800, padLeft: 16 });

    expect(scale.breaks).toEqual([]);
    expect(scale.domainStart).toBe(0);
    expect(scale.domainEnd).toBeGreaterThan(19);
    expect(scale.toPx(0)).toBe(16);
    expect(scale.toPx(10) - scale.toPx(0)).toBeCloseTo(10 * scale.pxPerDay);
    expect(scale.toPx(19)).toBeGreaterThan(scale.toPx(15));
    // Out-of-domain values are clamped to the edges.
    expect(scale.toPx(-5)).toBe(scale.toPx(0));
    expect(scale.toPx(10000)).toBe(scale.totalPx);
    expect(scale.inDomain(19)).toBe(true);
    expect(scale.inDomain(-1)).toBe(false);
  });

  it('compresses a long empty stretch into a fixed-width break in "process" mode', () => {
    const scale = buildGanttScale(sparse, { mode: 'process', width: 800, breakPx: 36, padLeft: 16 });

    expect(scale.breaks).toHaveLength(1);
    const [gap] = scale.breaks;
    // 8 days of margin around the marks on each side of the gap (10 .. 200).
    expect(gap).toMatchObject({ from: 18, to: 192, days: 174, width: 36 });
    expect(gap.left).toBeCloseTo(scale.toPx(18));
    expect(scale.toPx(192) - scale.toPx(18)).toBeCloseTo(36);
    // Positions keep their order across the break.
    const xs = [0, 10, 18, 100, 192, 200, 205, 210].map(scale.toPx);
    expect([...xs].sort((a, b) => a - b)).toEqual(xs);
    // Outside the break the scale is linear again.
    expect(scale.toPx(205) - scale.toPx(200)).toBeCloseTo(5 * scale.pxPerDay);
  });

  it('keeps real proportions in "all" mode', () => {
    const scale = buildGanttScale(sparse, { mode: 'all', width: 800, padLeft: 16 });

    expect(scale.breaks).toEqual([]);
    expect(scale.toPx(200) - scale.toPx(0)).toBeCloseTo(200 * scale.pxPerDay);
  });

  it('leaves the axis ticks out of a compressed stretch', () => {
    const scale = buildGanttScale(sparse, { mode: 'process', width: 800 });
    const { ticks, step } = buildGanttAxis(sparse, scale);

    expect(ticks.length).toBeGreaterThan(0);
    expect(ticks[0]).toEqual({ x: 0, px: scale.toPx(0) });
    expect(ticks.every((tick) => tick.x % step === 0)).toBe(true);
    expect(ticks.some((tick) => tick.x > 18 && tick.x < 192)).toBe(false);
    expect(ticks.some((tick) => tick.x >= 192)).toBe(true);
  });
});

describe('gantt date helpers', () => {
  it('formats dates as dd/mm/yyyy and missing ones as a dash', () => {
    expect(formatGanttDate('2026-02-27')).toBe('27/02/2026');
    expect(formatGanttDate(null)).toBe('—');
    expect(formatGanttDate('no es fecha')).toBe('—');
  });

  it('converts between axis positions and calendar dates', () => {
    expect(dateAtX(RAD, 4)).toBe('2026-02-06');
    expect(dateAtX(RAD, 5)).toBe('2026-02-09');
    expect(dateAtX(RAD, -3)).toBe(dateAtX(RAD, 0));
    expect(calendarDaysBetween('2026-02-02', '2026-02-09')).toBe(7);
  });
});
