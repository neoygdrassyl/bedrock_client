/**
 * Legal term of an expediente as the Tiempos module states it: the ONE view-model the
 * workspace header, the Tiempos term strip (also embedded in Jurídico), the expanded
 * summary, the side nav and the dock quick windows render.
 *
 * Source of truth: the phases computed by the Tiempos engine (`useClocksManager` ->
 * `useProcessPhases`, with the notification route stored in the `phase_options` clock,
 * state 1001) and the "process finished with pending records" rule
 * (`expedientePendingStatus`). This module only reads those results through the same
 * helpers the Tiempos module uses (`getDefaultPhaseIndex`, `describePhaseTerm`); it never
 * computes a phase, a day count or a limit of its own.
 *
 * The backend legal summary (`GET /fun/get/summary/:rad`) is NOT an input: it infers the
 * notification route from the clocks instead of reading `phase_options`, so it can point at
 * a different phase. It is used by the workspace for metadata only (applicant, category).
 *
 * Status of the view-model (`status`, with `statusMeta` shaped like `EXPEDIENTE_STATUS_META`):
 *   VENCIDO          the current phase is running past its limit
 *   PRONTO_A_VENCER  running, CLOSE_TO_LIMIT_DAYS or fewer business days left
 *   PAUSADO          running phase paused by an active suspension
 *   EN_TERMINO       running with more days left
 *   PENDIENTE        process finished with records left to register (no term runs)
 *   FINALIZADO / DESISTIDO  every phase completed
 *   SIN_TERMINO      no phase running ("Sin término calculado"): no phases, or the
 *                    current phase has not started
 *   SIN_ESTADO       the engine could not run (expediente detail not available)
 * The tones follow the Tiempos strip: danger when overdue, warning when close to the
 * limit or paused.
 */

import { describePhaseTerm, formatPhaseDate, getDefaultPhaseIndex, getResponsibleCfg } from '../clocks/utils/phaseTerm';
import { EXPEDIENTE_STATUS_META, NO_TERM_STATUS_META, UNKNOWN_STATUS_META } from './expedienteStatus';
import { PENDING_STATUS_META, describePendingShort, describePendingTerm } from './expedientePendingStatus';

/** Same threshold as the warning tone of the Tiempos strip. */
export const CLOSE_TO_LIMIT_DAYS = 3;

export const PAUSED_STATUS_META = Object.freeze({
  label: 'Pausado',
  tone: 'warning',
  badgeClass: 'border-warning/30 bg-warning/10 text-warning',
  barClass: 'bg-warning',
  dotClass: 'bg-warning',
});

export const FINISHED_STATUS_META = Object.freeze({
  label: 'Finalizado',
  tone: 'success',
  badgeClass: 'border-accent/30 bg-accent/10 text-accent',
  barClass: 'bg-accent',
  dotClass: 'bg-accent',
});

export const DESISTED_STATUS_META = Object.freeze({
  label: 'Desistido',
  tone: 'danger',
  badgeClass: 'border-destructive/30 bg-destructive/10 text-destructive',
  barClass: 'bg-destructive',
  dotClass: 'bg-destructive',
});

const businessDays = (count) => `${count} día${count === 1 ? '' : 's'} hábil${count === 1 ? '' : 'es'}`;

const RUNNING = new Set(['ACTIVO', 'PAUSADO']);

/**
 * Wording of the term of a phase from the same figures the phase card prints (moved from
 * the Tiempos strip; unchanged).
 */
export function describePhaseWording(phase, term) {
  const overdue = term.remaining < 0;
  switch (phase.status) {
    case 'PENDIENTE':
      return { text: 'Fase sin iniciar', tone: 'neutral' };
    case 'COMPLETADO':
      return term.status.color === 'danger'
        ? { text: 'Completada después del límite', tone: 'danger' }
        : { text: 'Fase completada', tone: 'success' };
    case 'ACTIVO':
    case 'PAUSADO': {
      const prefix = phase.status === 'PAUSADO' ? 'Pausado · ' : '';
      if (overdue) return { text: `${prefix}Vencido hace ${businessDays(-term.remaining)}`, tone: 'danger' };
      return {
        text: `${prefix}${term.remaining === 1 ? 'Queda' : 'Quedan'} ${businessDays(term.remaining)}`,
        tone: phase.status === 'PAUSADO' || term.remaining <= CLOSE_TO_LIMIT_DAYS ? 'warning' : 'info',
      };
    }
    default:
      return { text: term.status.text, tone: overdue ? 'danger' : 'info' };
  }
}

function resolveStatus(phase, term, processStatus) {
  if (RUNNING.has(phase.status)) {
    if (term.remaining < 0) return 'VENCIDO';
    if (phase.status === 'PAUSADO') return 'PAUSADO';
    return term.remaining <= CLOSE_TO_LIMIT_DAYS ? 'PRONTO_A_VENCER' : 'EN_TERMINO';
  }
  if (phase.status === 'PENDIENTE') return 'SIN_TERMINO';
  if (phase.status === 'COMPLETADO') return processStatus === 'DESISTIDO' ? 'DESISTIDO' : 'FINALIZADO';
  return term.remaining < 0 ? 'VENCIDO' : 'SIN_ESTADO';
}

const STATUS_META_BY_KEY = Object.freeze({
  ...EXPEDIENTE_STATUS_META,
  PAUSADO: PAUSED_STATUS_META,
  PENDIENTE: PENDING_STATUS_META,
  FINALIZADO: FINISHED_STATUS_META,
  DESISTIDO: DESISTED_STATUS_META,
  SIN_TERMINO: NO_TERM_STATUS_META,
  SIN_ESTADO: UNKNOWN_STATUS_META,
});

export function getTermStatusMeta(status) {
  return STATUS_META_BY_KEY[status] || UNKNOWN_STATUS_META;
}

const EMPTY_FIGURES = Object.freeze({
  known: false,
  usedDays: null,
  totalDays: null,
  remainingDays: null,
  overdue: false,
  overdueDays: 0,
  ratioText: '',
  barPercent: 0,
});

function build(fields) {
  const statusMeta = getTermStatusMeta(fields.status);
  const view = { ...EMPTY_FIGURES, ...fields, statusMeta };
  // The neutral badge already says what the text would repeat ("Sin término calculado").
  view.textRepeatsStatus = view.text === statusMeta.label;
  return Object.freeze(view);
}

const NO_PHASE = Object.freeze({
  phase: null,
  phaseIndex: -1,
  phaseCount: 0,
  phaseTitle: null,
  responsible: null,
  limitDate: null,
  processStatus: null,
  pending: false,
  pendingCount: 0,
  openPhaseTitles: Object.freeze([]),
});

/** The engine could not run: no expediente detail (no clocks array). */
export const UNKNOWN_TERM = build({
  ...NO_PHASE,
  kind: 'unknown',
  status: 'SIN_ESTADO',
  tone: 'neutral',
  text: 'Sin estado',
  shortText: '—',
  description: 'Sin estado: el expediente no tiene tiempos cargados.',
});

/** The expediente detail is being loaded (skeleton, never a number). */
export const LOADING_TERM = Object.freeze({ ...UNKNOWN_TERM, kind: 'loading', text: 'Calculando término…', description: 'Calculando el término legal…' });

/**
 * Term view-model from the outputs of the Tiempos engine.
 *
 * @param {{
 *   processPhases?: object[],   // manager.processPhases
 *   processStatus?: string|null, // manager.curaduriaDetails.status (FINALIZADO, DESISTIDO, ...)
 *   pendingStatus?: object|null, // getFinishedPendingStatus(...)
 * }} input
 */
export function selectExpedienteTerm({ processPhases, processStatus = null, pendingStatus = null } = {}) {
  const phases = Array.isArray(processPhases) ? processPhases : [];
  const phaseIndex = getDefaultPhaseIndex(phases);
  const phase = phaseIndex >= 0 ? phases[phaseIndex] : null;
  const identity = {
    ...NO_PHASE,
    phase,
    phaseIndex,
    phaseCount: phases.length,
    phaseTitle: phase?.title || null,
    responsible: phase ? getResponsibleCfg(phase.responsible).text : null,
    limitDate: phase?.limitDate || null,
    processStatus: processStatus ?? null,
  };

  if (pendingStatus?.pending) {
    const openPhaseTitles = Object.freeze((pendingStatus.openPhases || []).map((openPhase) => openPhase.title));
    const count = pendingStatus.count;
    const firstOpen = openPhaseTitles[0];
    return build({
      ...identity,
      kind: 'pending',
      status: 'PENDIENTE',
      tone: 'warning',
      pending: true,
      pendingCount: count,
      openPhaseTitles,
      text: describePendingTerm(count),
      shortText: describePendingShort(count),
      description: [
        describePendingTerm(count),
        'No corre ningún término legal',
        firstOpen ? `Falta cerrar la fase «${firstOpen}»` : null,
      ].filter(Boolean).join(' · '),
    });
  }

  if (!phase) {
    return build({
      ...identity,
      kind: 'none',
      status: 'SIN_TERMINO',
      tone: 'neutral',
      text: 'Sin término calculado',
      shortText: '—',
      description: 'Sin término calculado: Tiempos no tiene fases para este expediente.',
    });
  }

  const term = describePhaseTerm(phase);
  const wording = describePhaseWording(phase, term);
  const status = resolveStatus(phase, term, processStatus);
  const running = RUNNING.has(phase.status);
  const overdue = term.remaining < 0 && (running || status === 'VENCIDO');
  // Bar width only (a bar cannot exceed its track); the ratio text is never clamped.
  const barPercent = term.total > 0 ? Math.max(0, Math.min(100, (term.used / term.total) * 100)) : 0;

  return build({
    ...identity,
    kind: 'phase',
    status,
    tone: wording.tone,
    known: running,
    usedDays: term.used,
    totalDays: term.total,
    remainingDays: term.remaining,
    overdue,
    overdueDays: overdue ? -term.remaining : 0,
    text: wording.text,
    shortText: !running ? '—' : overdue ? `+${-term.remaining} d` : `${term.remaining} d`,
    ratioText: `${term.used}/${term.total} d`,
    barPercent,
    description: [
      `Fase actual: ${phase.title} (${phaseIndex + 1} de ${phases.length})`,
      `Responsable: ${identity.responsible}`,
      wording.text,
      `Plazo legal: ${businessDays(term.total)}`,
      `Usados: ${term.used}`,
      phase.limitDate ? `Límite legal: ${formatPhaseDate(phase.limitDate)}` : null,
    ].filter(Boolean).join(' · '),
  });
}
