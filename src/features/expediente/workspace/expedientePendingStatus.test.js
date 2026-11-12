import { describe, expect, it } from 'vitest';
import {
  describePendingCount,
  describePendingShort,
  describePendingTerm,
  getFinishedPendingStatus,
  getFinishedSignal,
  getPendingEvents,
  isExpedienteClosedState,
} from './expedientePendingStatus';

const done = (id, extra = {}) => ({ id, title: `Fase ${id}`, status: 'COMPLETADO', endDate: '2026-03-01', ...extra });
const open = (id, extra = {}) => ({ id, title: `Fase ${id}`, status: 'ACTIVO', startDate: '2026-02-01', ...extra });
const row = (index, state, extra = {}) => ({ index, state, name: `Evento ${state}`, hasDate: false, optional: false, hidden: false, ...extra });

describe('isExpedienteClosedState', () => {
  it.each([
    [100, true], ['100', true], [101, true], [250, true],
    [99, false], [5, false], [0, false], [-1, false],
    [null, false], [undefined, false], ['', false], ['cerrado', false], [Number.NaN, false],
  ])('state %j -> %s', (state, expected) => {
    expect(isExpedienteClosedState(state)).toBe(expected);
  });
});

describe('getFinishedSignal', () => {
  it('reads a closed expediente state first', () => {
    expect(getFinishedSignal({ expedienteState: 100, processPhases: [open('a')] })).toBe('closed-state');
  });

  it('reads the last phase being completed when the expediente is still open', () => {
    expect(getFinishedSignal({ expedienteState: 50, processPhases: [open('a'), done('b')] })).toBe('last-phase');
  });

  it('does not treat a desisted process as finished by its last phase', () => {
    expect(getFinishedSignal({ expedienteState: 50, processPhases: [open('a'), done('b')], isDesisted: true })).toBeNull();
  });

  it('returns null without a trusted signal', () => {
    expect(getFinishedSignal({ expedienteState: 50, processPhases: [done('a'), open('b')] })).toBeNull();
    expect(getFinishedSignal({ expedienteState: undefined, processPhases: undefined })).toBeNull();
    expect(getFinishedSignal()).toBeNull();
  });
});

describe('getFinishedPendingStatus', () => {
  const eventRows = [row(1, 30, { hasDate: true }), row(2, 32, { limitDate: '2026-02-10', groupTitle: 'Estudio' }), row(3, 33, { optional: true })];
  const phases = [open('estudio', { relatedStates: [30, 32, 33] }), done('entrega')];

  it.each([
    ['unknown state, last phase open', { expedienteState: undefined, processPhases: [done('a'), open('b')] }],
    ['open state, last phase open', { expedienteState: 50, processPhases: [open('a'), open('b')] }],
    ['closed state but no calculated phases', { expedienteState: 100, processPhases: [] }],
    ['closed state but phases missing', { expedienteState: 100 }],
    ['desisted with the last phase completed', { expedienteState: 50, processPhases: [open('a'), done('b')], isDesisted: true }],
    ['no input', undefined],
  ])('%s -> not finished, not pending', (_label, input) => {
    expect(getFinishedPendingStatus(input)).toEqual({ finished: false, pending: false, signal: null, count: 0, items: [], openPhases: [] });
  });

  it('is finished without pendings when every phase is completed', () => {
    expect(getFinishedPendingStatus({ expedienteState: 100, processPhases: [done('a'), done('b')], eventRows }))
      .toMatchObject({ finished: true, pending: false, signal: 'closed-state', count: 0, items: [] });
  });

  it('is pending when the process is finished and a phase stayed open', () => {
    const status = getFinishedPendingStatus({ expedienteState: 50, processPhases: phases, eventRows });

    expect(status).toMatchObject({ finished: true, pending: true, signal: 'last-phase', count: 1 });
    expect(status.openPhases).toEqual([phases[0]]);
    expect(status.items).toEqual([{
      key: 'estudio:2',
      index: 2,
      state: 32,
      name: 'Evento 32',
      groupTitle: 'Estudio',
      limitDate: '2026-02-10',
      phaseId: 'estudio',
      phaseTitle: 'Fase estudio',
    }]);
  });

  it('is pending with a closed state even when the open phase has no identifiable event', () => {
    expect(getFinishedPendingStatus({ expedienteState: 101, processPhases: [open('a', { relatedStates: [] })], eventRows }))
      .toMatchObject({ finished: true, pending: true, signal: 'closed-state', count: 0, items: [] });
  });
});

describe('getPendingEvents', () => {
  it('lists the required events without a date of every open phase', () => {
    const items = getPendingEvents({
      processPhases: [open('p1', { relatedStates: [30, 32] }), open('p2', { relatedStates: ['61'] })],
      eventRows: [row(0, 30), row(1, 32), row(2, 61), row(3, 70)],
    });
    expect(items.map((item) => [item.phaseId, item.state])).toEqual([['p1', 30], ['p1', 32], ['p2', 61]]);
  });

  it('falls back to the last optional event when every required one is registered', () => {
    const items = getPendingEvents({
      processPhases: [open('p1', { relatedStates: [30, 32, 33] })],
      eventRows: [row(0, 30, { hasDate: true }), row(1, 32, { optional: true }), row(2, 33, { optional: true })],
    });
    expect(items.map((item) => item.state)).toEqual([33]);
  });

  it('ignores hidden rows, dated rows, completed phases and phases that already have an end date', () => {
    const items = getPendingEvents({
      processPhases: [
        done('p1', { relatedStates: [30] }),
        open('p2', { relatedStates: [32], endDate: '2026-03-01' }),
        open('p3', { relatedStates: [61, 62, 63] }),
      ],
      eventRows: [row(0, 30), row(1, 32), row(2, 61, { hidden: true }), row(3, 62, { hasDate: true }), row(4, 63)],
    });
    expect(items.map((item) => item.state)).toEqual([63]);
  });

  it('never counts the same row for two phases and tolerates missing input', () => {
    const items = getPendingEvents({
      processPhases: [open('p1', { relatedStates: [30] }), open('p2', { relatedStates: [30, false, null] }), null],
      eventRows: [row(0, 30)],
    });
    expect(items).toHaveLength(1);
    expect(items[0].phaseId).toBe('p1');
    expect(getPendingEvents()).toEqual([]);
  });
});

describe('pending wording', () => {
  it('describes the count', () => {
    expect(describePendingCount(1)).toBe('1 pendiente por registrar');
    expect(describePendingCount(3)).toBe('3 pendientes por registrar');
    expect(describePendingCount(0)).toBe('registros pendientes');
    expect(describePendingCount(null)).toBe('registros pendientes');
    expect(describePendingTerm(2)).toBe('Proceso finalizado · 2 pendientes por registrar');
    expect(describePendingShort(2)).toBe('2 pend.');
    expect(describePendingShort(null)).toBe('Pend.');
  });
});
