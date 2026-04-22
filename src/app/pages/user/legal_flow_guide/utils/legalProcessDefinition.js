/**
 * Legal Process Definition — Source of truth for all legal flow diagrams.
 * Pure data + helper functions. No React dependencies.
 */

export const PROCESS_DEFINITION = {
  phases: [
    {
      id: 'RAD', order: 0, label: 'Radicación y LDF',
      responsible: 'solicitante', baseDays: 29,
      color: 'solicitante',
      next: ['EST'],
      desistimientos: ['-1'],
      skipConditions: null,
    },
    {
      id: 'EST', order: 1, label: 'Estudio y Observaciones',
      responsible: 'curaduria', baseDays: null,
      baseDaysByType: { I: 20, II: 25, III: 35, IV: 45 },
      color: 'curaduria',
      sharedPool: true,
      next: ['NOT_OBS', 'CORR', 'VIA'],
      desistimientos: ['-2'],
      modifiers: ['suspension_pre_acta', 'extension'],
      skipConditions: null,
    },
    {
      id: 'NOT_OBS', order: 2, label: 'Notificación Observaciones',
      responsible: 'curaduria',
      baseDays: null,
      daysByMode: { notificar_personal: 10, notificar_aviso: 15 },
      color: 'curaduria',
      next: ['CORR'],
      desistimientos: [],
      skipConditions: ['cumple_acta', 'modo_comunicar'],
    },
    {
      id: 'CORR', order: 3, label: 'Correcciones del Solicitante',
      responsible: 'solicitante', baseDays: 30,
      baseDaysWithProrroga: 45,
      color: 'solicitante',
      next: ['VIA'],
      desistimientos: ['-3'],
      modifiers: ['prorroga_correcciones'],
      skipConditions: ['cumple_acta'],
    },
    {
      id: 'VIA', order: 4, label: 'Revisión y Viabilidad',
      responsible: 'curaduria',
      baseDays: null,
      color: 'curaduria',
      sharedPool: true,
      next: ['NOT_VIA', 'PAG'],
      desistimientos: ['-6'],
      modifiers: ['suspension_post_acta'],
      skipConditions: null,
    },
    {
      id: 'NOT_VIA', order: 5, label: 'Notificación Viabilidad',
      responsible: 'curaduria',
      baseDays: null,
      daysByMode: { notificar_personal: 10, notificar_aviso: 15 },
      color: 'curaduria',
      next: ['PAG'],
      desistimientos: [],
      skipConditions: ['modo_comunicar_viabilidad'],
    },
    {
      id: 'PAG', order: 6, label: 'Liquidación y Pagos',
      responsible: 'solicitante', baseDays: 30,
      color: 'solicitante',
      next: ['RES'],
      desistimientos: ['-4'],
      skipConditions: null,
    },
    {
      id: 'RES', order: 7, label: 'Generación de Resolución',
      responsible: 'curaduria', baseDays: 5,
      color: 'curaduria',
      next: ['NOT_RES'],
      desistimientos: ['-6'],
      skipConditions: null,
    },
    {
      id: 'NOT_RES', order: 8, label: 'Notificación Resolución',
      responsible: 'curaduria', baseDays: 15,
      color: 'curaduria',
      next: ['EJEC'],
      desistimientos: [],
      skipConditions: null,
    },
    {
      id: 'EJEC', order: 9, label: 'Ejecutoria y Recurso',
      responsible: 'paralelo', baseDays: 10,
      color: 'paralelo',
      next: ['ENT'],
      desistimientos: [],
      hasRecurso: true,
      skipConditions: null,
    },
    {
      id: 'ENT', order: 10, label: 'Entrega de Licencia',
      responsible: 'curaduria', baseDays: 1,
      color: 'curaduria',
      next: [],
      desistimientos: [],
      skipConditions: null,
    },
  ],
  desistimientos: {
    '-1': { label: 'Incompleto', bifurcation: 'RAD', anytime: false },
    '-2': { label: 'Falta Valla', bifurcation: 'EST', anytime: false },
    '-3': { label: 'No Cumple Correcciones', bifurcation: 'CORR', anytime: false },
    '-4': { label: 'No Paga Expensas', bifurcation: 'PAG', anytime: false },
    '-5': { label: 'Voluntario', bifurcation: null, anytime: true },
    '-6': {
      label: 'Negada',
      bifurcation: ['EST', 'VIA', 'RES'],
      anytime: false,
    },
  },
  desistimientoSubflow: [
    { id: 'D1', label: 'Resolución Desistida', days: 5, responsible: 'curaduria' },
    { id: 'D2', label: 'Notificación Resolución', days: 15, responsible: 'curaduria' },
    { id: 'D3', label: 'Ejecutoria/Recurso', days: 10, responsible: 'paralelo' },
    { id: 'D4', label: 'Resolver Recurso', days: 45, responsible: 'curaduria', conditional: true },
    { id: 'D5', label: 'Notif. Respuesta Recurso', days: 15, responsible: 'curaduria', conditional: true },
    { id: 'D6', label: 'Cierre y Archivo', days: 1, responsible: 'curaduria', conditional: true },
  ],
  modifiers: {
    suspension_pre_acta: { label: 'Suspensión Pre-Acta', maxDays: 10, phase: 'EST', sharedLimit: true },
    suspension_post_acta: { label: 'Suspensión Post-Acta', maxDays: 10, phase: 'VIA', sharedLimit: true },
    extension: { label: 'Extensión', maxDays: null, phase: 'EST', maxCount: 1 },
    prorroga_correcciones: { label: 'Prórroga Correcciones', extraDays: 15, phase: 'CORR' },
  },
  notificationModes: {
    notificar: { personalDays: 10, avisoDays: 15, skipsPhase: false },
    comunicar: { days: 0, skipsPhase: true },
  },
};

// --- Lookup helpers ---

const phaseMap = new Map(PROCESS_DEFINITION.phases.map((p) => [p.id, p]));

/**
 * Get the days allocated for a phase given contextual options.
 *
 * @param {string} phaseId
 * @param {Object} options
 * @param {string}  [options.projectType='I']       - Licence category I–IV
 * @param {string}  [options.notificationMode='notificar'] - 'notificar' | 'comunicar'
 * @param {string}  [options.notificationType='personal']  - 'personal' | 'aviso'
 * @param {boolean} [options.withProrroga=false]
 * @param {number}  [options.poolRemainder]          - For VIA when pool is shared
 * @returns {number|null} Days, or null if phase is skipped / indeterminate.
 */
export function getPhaseDays(phaseId, options = {}) {
  const phase = phaseMap.get(phaseId);
  if (!phase) return null;

  const {
    projectType = 'I',
    notificationMode = 'notificar',
    notificationType = 'personal',
    withProrroga = false,
    poolRemainder,
  } = options;

  // Phases with baseDaysByType (EST)
  if (phase.baseDaysByType) {
    return phase.baseDaysByType[projectType] ?? phase.baseDaysByType['I'];
  }

  // Notification phases with daysByMode
  if (phase.daysByMode) {
    if (notificationMode === 'comunicar') return 0;
    const key = `notificar_${notificationType}`;
    return phase.daysByMode[key] ?? phase.daysByMode.notificar_personal;
  }

  // CORR with optional prorroga
  if (phaseId === 'CORR' && withProrroga && phase.baseDaysWithProrroga) {
    return phase.baseDaysWithProrroga;
  }

  // VIA shared pool remainder
  if (phaseId === 'VIA' && poolRemainder !== undefined) {
    return Math.max(0, poolRemainder);
  }

  return phase.baseDays;
}

/**
 * Get the total shared pool days for EST + VIA based on project type.
 *
 * @param {string} projectType - 'I' | 'II' | 'III' | 'IV'
 * @returns {number}
 */
export function getPoolDays(projectType) {
  const est = phaseMap.get('EST');
  return est?.baseDaysByType?.[projectType] ?? est?.baseDaysByType?.['I'] ?? 20;
}

/**
 * Calculate total calendar days for a given route (list of visible phase IDs).
 *
 * @param {string[]} visiblePhases - Ordered list of phase IDs in the route.
 * @param {Object}   options       - Same options accepted by getPhaseDays.
 * @returns {number} Total days.
 */
export function calculateRouteDays(visiblePhases, options = {}) {
  const { projectType = 'I' } = options;
  const poolTotal = getPoolDays(projectType);
  let poolUsed = 0;
  let total = 0;

  for (const pid of visiblePhases) {
    const phase = phaseMap.get(pid);
    if (!phase) continue;

    if (phase.sharedPool) {
      if (pid === 'EST') {
        const estDays = getPhaseDays('EST', options) ?? 0;
        poolUsed = estDays;
        total += estDays;
      } else if (pid === 'VIA') {
        const remainder = Math.max(0, poolTotal - poolUsed);
        total += remainder;
      }
    } else {
      const days = getPhaseDays(pid, options);
      if (days != null) total += days;
    }
  }

  return total;
}
