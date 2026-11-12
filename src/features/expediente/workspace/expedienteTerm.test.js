import { describe, expect, it } from 'vitest';
import { PENDING_STATUS_META } from './expedientePendingStatus';
import { EXPEDIENTE_STATUS_META, NO_TERM_STATUS_META, UNKNOWN_STATUS_META } from './expedienteStatus';
import {
  DESISTED_STATUS_META,
  FINISHED_STATUS_META,
  LOADING_TERM,
  PAUSED_STATUS_META,
  UNKNOWN_TERM,
  selectExpedienteTerm,
} from './expedienteTerm';

const phase = (id, status, extra = {}) => ({
  id,
  title: `Fase ${id}`,
  responsible: 'Curaduría',
  status,
  totalDays: 10,
  usedDays: 0,
  extraDays: 0,
  startDate: '2026-02-02',
  endDate: status === 'COMPLETADO' ? '2026-02-10' : null,
  limitDate: '2026-02-16',
  ...extra,
});

describe('selectExpedienteTerm', () => {
  it('overdue: the real figures, never clamped, on the phase Tiempos points at', () => {
    const view = selectExpedienteTerm({
      processPhases: [
        phase('phase1', 'COMPLETADO'),
        phase('phase2', 'ACTIVO', { title: 'Notificación Observaciones', usedDays: 148, totalDays: 10 }),
        phase('phase3', 'PENDIENTE'),
      ],
    });

    expect(view).toMatchObject({
      kind: 'phase',
      status: 'VENCIDO',
      phaseTitle: 'Notificación Observaciones',
      phaseIndex: 1,
      phaseCount: 3,
      responsible: 'Curaduría',
      known: true,
      overdue: true,
      overdueDays: 138,
      remainingDays: -138,
      usedDays: 148,
      totalDays: 10,
      text: 'Vencido hace 138 días hábiles',
      shortText: '+138 d',
      ratioText: '148/10 d',
      barPercent: 100,
      tone: 'danger',
      limitDate: '2026-02-16',
    });
    expect(view.statusMeta).toBe(EXPEDIENTE_STATUS_META.VENCIDO);
    expect(view.description).toBe(
      'Fase actual: Notificación Observaciones (2 de 3) · Responsable: Curaduría · Vencido hace 138 días hábiles · Plazo legal: 10 días hábiles · Usados: 148 · Límite legal: 16/02/2026',
    );
  });

  it('on time: "En término" with the remaining days (extra days count in the plazo)', () => {
    const view = selectExpedienteTerm({
      processPhases: [phase('phase1', 'ACTIVO', { totalDays: 20, extraDays: 10, usedDays: 5, responsible: 'Solicitante' })],
    });

    expect(view).toMatchObject({ status: 'EN_TERMINO', text: 'Quedan 25 días hábiles', shortText: '25 d', ratioText: '5/30 d', overdue: false, tone: 'info', responsible: 'Solicitante' });
    expect(view.statusMeta).toBe(EXPEDIENTE_STATUS_META.EN_TERMINO);
  });

  it.each([
    [7, 'Quedan 3 días hábiles'],
    [9, 'Queda 1 día hábil'],
    [10, 'Quedan 0 días hábiles'],
  ])('close to the limit (used %i of 10): "Pronto a vencer", warning like the strip', (usedDays, text) => {
    const view = selectExpedienteTerm({ processPhases: [phase('phase2', 'ACTIVO', { usedDays })] });

    expect(view).toMatchObject({ status: 'PRONTO_A_VENCER', text, tone: 'warning', overdue: false });
    expect(view.statusMeta).toBe(EXPEDIENTE_STATUS_META.PRONTO_A_VENCER);
  });

  it('paused by a suspension: "Pausado"', () => {
    const view = selectExpedienteTerm({ processPhases: [phase('phase1', 'PAUSADO', { usedDays: 2 })] });

    expect(view).toMatchObject({ status: 'PAUSADO', text: 'Pausado · Quedan 8 días hábiles', tone: 'warning' });
    expect(view.statusMeta).toBe(PAUSED_STATUS_META);
  });

  it('finished with records left to register: "Pendiente", no day figures', () => {
    const view = selectExpedienteTerm({
      processPhases: [phase('phase5', 'ACTIVO', { usedDays: 165, totalDays: 10, title: 'Notificación de Viabilidad' }), phase('phase10', 'COMPLETADO')],
      pendingStatus: { finished: true, pending: true, signal: 'closed-state', count: 2, items: [], openPhases: [{ title: 'Notificación de Viabilidad' }] },
    });

    expect(view).toMatchObject({
      kind: 'pending',
      status: 'PENDIENTE',
      pending: true,
      pendingCount: 2,
      overdue: false,
      known: false,
      text: 'Proceso finalizado · 2 pendientes por registrar',
      shortText: '2 pend.',
      ratioText: '',
      barPercent: 0,
    });
    expect(view.openPhaseTitles).toEqual(['Notificación de Viabilidad']);
    expect(view.statusMeta).toBe(PENDING_STATUS_META);
  });

  it('no phases: neutral "Sin término calculado" (never "En término")', () => {
    const view = selectExpedienteTerm({ processPhases: [] });

    expect(view).toMatchObject({ kind: 'none', status: 'SIN_TERMINO', text: 'Sin término calculado', known: false, ratioText: '', textRepeatsStatus: true });
    expect(view.statusMeta).toBe(NO_TERM_STATUS_META);
    expect(selectExpedienteTerm().status).toBe('SIN_TERMINO');
  });

  it('nothing started yet: "Sin término calculado" badge, the strip wording as text', () => {
    const view = selectExpedienteTerm({ processPhases: [phase('phase0', 'PENDIENTE', { startDate: null }), phase('phase1', 'PENDIENTE')] });

    expect(view).toMatchObject({ status: 'SIN_TERMINO', phaseTitle: 'Fase phase0', text: 'Fase sin iniciar', known: false, textRepeatsStatus: false });
    expect(view.statusMeta).toBe(NO_TERM_STATUS_META);
  });

  it('every phase completed: "Finalizado", or "Desistido" for a desisted process', () => {
    const phases = [phase('phase1', 'COMPLETADO'), phase('phase10', 'COMPLETADO', { title: 'Entrega de Licencia', usedDays: 3 })];

    const finished = selectExpedienteTerm({ processPhases: phases, processStatus: 'FINALIZADO' });
    expect(finished).toMatchObject({ status: 'FINALIZADO', phaseTitle: 'Entrega de Licencia', text: 'Fase completada', known: false, overdue: false });
    expect(finished.statusMeta).toBe(FINISHED_STATUS_META);

    const desisted = selectExpedienteTerm({ processPhases: phases, processStatus: 'DESISTIDO' });
    expect(desisted.statusMeta).toBe(DESISTED_STATUS_META);
  });

  it('a status the presentation does not know: neutral "Sin estado"', () => {
    const view = selectExpedienteTerm({ processPhases: [phase('phase1', 'COMPLETADO'), phase('phase9', 'ESPERANDO_NOTIFICACION', { usedDays: 1 })] });

    expect(view.status).toBe('SIN_ESTADO');
    expect(view.statusMeta).toBe(UNKNOWN_STATUS_META);
  });

  it('without the engine (no clocks loaded) the term is unknown, and loading shows no number', () => {
    expect(UNKNOWN_TERM).toMatchObject({ kind: 'unknown', status: 'SIN_ESTADO', text: 'Sin estado', ratioText: '', textRepeatsStatus: true });
    expect(UNKNOWN_TERM.statusMeta).toBe(UNKNOWN_STATUS_META);
    expect(LOADING_TERM).toMatchObject({ kind: 'loading', ratioText: '', usedDays: null });
  });
});
