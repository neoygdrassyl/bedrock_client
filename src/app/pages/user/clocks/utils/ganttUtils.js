import moment from 'moment';
import { calcularDiasHabiles } from '../hooks/useClocksManager';

/**
 * Calcula los datos necesarios para renderizar el diagrama de Gantt
 * @param {Object} manager - Objeto del hook useClocksManager con toda la información del proceso
 * @param {string} visualizationMode - 'legal' o 'actual' para determinar el modo de visualización
 * @returns {Object} Datos formateados para el diagrama de Gantt
 */
export const calculateGanttData = (manager, visualizationMode = 'legal') => {
  if (!manager || !manager.processPhases) {
    return { phases: [], totalDuration: 0, startDate: null, endDate: null };
  }

  const { processPhases, currentItem, extension, suspensionPreActa, suspensionPostActa } = manager;
  
  // Fecha de inicio del proceso (radicación)
  const processStartDate = currentItem?.date || moment().format('YYYY-MM-DD');
  
  // Calcular el total de días del proceso
  const baseDays = manager.FUN0TYPETIME?.(currentItem?.type) || 45;
  const suspensionDays = (manager.totalSuspensionDays || 0);
  const extensionDays = (extension?.days || 0);
  const totalDays = baseDays + suspensionDays + extensionDays;

  // Preparar las fases para el Gantt
  const ganttPhases = processPhases.map(phase => {
    return preparePhaseForGantt(phase, visualizationMode, {
      suspensionPreActa,
      suspensionPostActa,
      extension,
      baseDays,
      totalDays
    });
  });

  // Calcular fecha de fin proyectada
  const endDate = calculateProjectedEndDate(processStartDate, totalDays);

  return {
    phases: ganttPhases,
    totalDuration: totalDays,
    startDate: processStartDate,
    endDate: endDate,
    baseDays,
    suspensionDays,
    extensionDays
  };
};

/**
 * Prepara una fase individual para el diagrama de Gantt
 */
const preparePhaseForGantt = (phase, visualizationMode, context) => {
  const { suspensionPreActa, suspensionPostActa, extension, baseDays, totalDays } = context;
  
  // Determinar fechas según el modo de visualización
  let startDate = phase.startDate;
  let endDate = phase.endDate;
  let duration = phase.totalDays + (phase.extraDays || 0);
  let usedDays = phase.usedDays || 0;

  if (visualizationMode === 'actual') {
    // En modo actual, usar solo fechas de evento reales
    if (phase.endDate) {
      duration = usedDays;
    }
  }

  // Calcular suspensiones y prórrogas aplicables a esta fase
  const phaseSuspensions = calculatePhaseSuspensions(phase, suspensionPreActa, suspensionPostActa);
  const phaseExtensions = calculatePhaseExtensions(phase, extension);

  // Preparar actores (para fases paralelas)
  let actors = [];
  if (phase.parallelActors) {
    actors = [
      prepareActorForGantt(phase.parallelActors.primary, visualizationMode),
      prepareActorForGantt(phase.parallelActors.secondary, visualizationMode)
    ];
  } else {
    // Fase con un solo responsable
    actors = [{
      name: getActorName(phase.responsible),
      icon: getActorIcon(phase.responsible),
      color: getActorColor(phase.responsible),
      totalDays: duration,
      usedDays: usedDays,
      status: phase.status
    }];
  }

  return {
    id: phase.id,
    title: phase.title,
    startDate,
    endDate,
    duration,
    usedDays,
    status: phase.status,
    responsible: phase.responsible,
    actors,
    suspensions: phaseSuspensions,
    extensions: phaseExtensions,
    isParallel: !!phase.parallelActors
  };
};

/**
 * Prepara un actor individual para el Gantt
 */
const prepareActorForGantt = (actor, visualizationMode) => {
  if (!actor) return null;

  let duration = (actor.totalDays || 0) + (actor.extraDays || 0);
  let usedDays = actor.usedDays || 0;

  if (visualizationMode === 'actual') {
    duration = usedDays;
  }

  return {
    name: actor.name,
    icon: actor.icon,
    color: actor.color,
    totalDays: duration,
    usedDays: usedDays,
    status: actor.status,
    taskDescription: actor.taskDescription
  };
};

/**
 * Calcula las suspensiones aplicables a una fase específica
 */
const calculatePhaseSuspensions = (phase, suspensionPreActa, suspensionPostActa) => {
  const suspensions = [];

  // Verificar si la fase está relacionada con acta parte 1 (pre-acta)
  const isPreActaPhase = phase.id === 'phase1' || phase.title?.includes('Estudio');
  
  // Verificar si la fase está relacionada con acta parte 2 (post-acta)
  const isPostActaPhase = phase.id === 'phase4' || phase.title?.includes('Viabilidad');

  if (isPreActaPhase && suspensionPreActa?.exists) {
    suspensions.push({
      type: 'pre-acta',
      days: suspensionPreActa.days || 0,
      startDate: suspensionPreActa.start?.date_start,
      endDate: suspensionPreActa.end?.date_start,
      color: 'warning' // amarillo
    });
  }

  if (isPostActaPhase && suspensionPostActa?.exists) {
    suspensions.push({
      type: 'post-acta',
      days: suspensionPostActa.days || 0,
      startDate: suspensionPostActa.start?.date_start,
      endDate: suspensionPostActa.end?.date_start,
      color: 'warning' // amarillo
    });
  }

  return suspensions;
};

/**
 * Calcula las prórrogas aplicables a una fase específica
 */
const calculatePhaseExtensions = (phase, extension) => {
  const extensions = [];

  // Las prórrogas generalmente se aplican a las fases de la curaduría
  if (extension?.exists && phase.responsible === 'Curaduria') {
    extensions.push({
      type: 'extension',
      days: extension.days || 0,
      startDate: extension.start?.date_start,
      endDate: extension.end?.date_start,
      color: 'info' // azul claro
    });
  }

  return extensions;
};

/**
 * Calcula la fecha de fin proyectada del proceso
 */
const calculateProjectedEndDate = (startDate, totalDays) => {
  if (!startDate) return null;
  
  // Usar moment para sumar días hábiles
  const start = moment(startDate);
  let current = start.clone();
  let daysAdded = 0;

  while (daysAdded < totalDays) {
    current.add(1, 'days');
    // Saltar fines de semana (simplificado - en producción usar calcularDiasHabiles)
    if (current.day() !== 0 && current.day() !== 6) {
      daysAdded++;
    }
  }

  return current.format('YYYY-MM-DD');
};

/**
 * Calcula la distribución de días entre Acta Parte 1 y Parte 2
 * Regla: Si existe fecha de acta parte 1, divide el tiempo
 * Si no existe, asigna 44 días a parte 1 y 1 día a parte 2
 */
export const calculateDaysDistribution = (manager) => {
  const { processPhases, currentItem, totalSuspensionDays, extension } = manager;
  
  const baseDays = manager.FUN0TYPETIME?.(currentItem?.type) || 45;
  const suspensionDays = totalSuspensionDays || 0;
  const extensionDays = extension?.days || 0;
  const totalDays = baseDays + suspensionDays + extensionDays;

  // Buscar la fase del acta parte 1
  const phase1 = processPhases?.find(p => p.id === 'phase1');
  const phase4 = processPhases?.find(p => p.id === 'phase4');

  let part1Days = 0;
  let part2Days = 0;

  if (phase1?.endDate) {
    // Si existe fecha de evento del acta parte 1, calcular días usados
    part1Days = phase1.usedDays || 0;
    part2Days = Math.max(1, totalDays - part1Days);
  } else {
    // Si no hay fecha de acta parte 1, usar límites legales
    part1Days = 44;
    part2Days = 1;
    
    // Distribuir suspensiones y prórrogas
    if (suspensionDays > 0 || extensionDays > 0) {
      // Sumar proporcionalmente
      part1Days += Math.floor((suspensionDays + extensionDays) * 0.9);
      part2Days += Math.ceil((suspensionDays + extensionDays) * 0.1);
    }
  }

  return {
    part1Days,
    part2Days,
    totalDays,
    hasActa1Date: !!phase1?.endDate
  };
};

/**
 * Obtiene el nombre del actor según el responsable
 */
const getActorName = (responsible) => {
  switch (responsible) {
    case 'Curaduria':
      return 'Curaduría';
    case 'Solicitante':
      return 'Solicitante';
    case 'Mixto':
      return 'Mixto';
    default:
      return responsible || 'Responsable';
  }
};

/**
 * Obtiene el icono del actor según el responsable
 */
const getActorIcon = (responsible) => {
  switch (responsible) {
    case 'Curaduria':
      return 'fa-building';
    case 'Solicitante':
      return 'fa-user';
    case 'Mixto':
      return 'fa-users';
    default:
      return 'fa-user-tie';
  }
};

/**
 * Obtiene el color del actor según el responsable
 */
const getActorColor = (responsible) => {
  switch (responsible) {
    case 'Curaduria':
      return 'primary';
    case 'Solicitante':
      return 'info';
    case 'Mixto':
      return 'purple';
    default:
      return 'secondary';
  }
};

/**
 * Calcula el porcentaje de progreso de una fase
 */
export const calculateProgress = (usedDays, totalDays) => {
  if (!totalDays || totalDays === 0) return 0;
  return Math.min(100, Math.round((usedDays / totalDays) * 100));
};

/**
 * Genera los datos para la vista de timeline del Gantt
 */
export const generateTimelineData = (ganttData) => {
  if (!ganttData || !ganttData.phases) return [];

  const { startDate, totalDuration } = ganttData;
  const timelineData = [];

  let cumulativeDays = 0;

  ganttData.phases.forEach((phase, index) => {
    const phaseStart = cumulativeDays;
    const phaseDuration = phase.duration || 0;
    const phaseEnd = phaseStart + phaseDuration;

    timelineData.push({
      ...phase,
      timelineStart: phaseStart,
      timelineEnd: phaseEnd,
      timelineProgress: calculateProgress(phase.usedDays, phase.duration)
    });

    cumulativeDays = phaseEnd;
  });

  return timelineData;
};

/**
 * Formatea una fecha para mostrar en el Gantt
 */
export const formatGanttDate = (date) => {
  if (!date) return '—';
  return moment(date).format('DD/MM/YYYY');
};

/**
 * Obtiene la clase CSS según el estado de la fase
 */
export const getStatusClass = (status) => {
  switch (status) {
    case 'COMPLETADO':
      return 'gantt-status-completed';
    case 'ACTIVO':
      return 'gantt-status-active';
    case 'PAUSADO':
      return 'gantt-status-paused';
    case 'VENCIDO':
      return 'gantt-status-overdue';
    default:
      return 'gantt-status-pending';
  }
};
