import moment from 'moment';
import { calcularDiasHabiles, sumarDiasHabiles } from '../hooks/useClocksManager';

/**
 * Convierte días disponibles a fecha límite programada
 * @param {string} referenceDate - Fecha de referencia en formato YYYY-MM-DD
 * @param {number} days - Número de días hábiles disponibles
 * @returns {string} Fecha límite en formato YYYY-MM-DD
 */
export const calculateScheduledDateFromDays = (referenceDate, days) => {
  if (!referenceDate || !days) return null;
  return sumarDiasHabiles(referenceDate, days);
};

/**
 * Convierte fecha especificada a días disponibles desde referencia
 * @param {string} referenceDate - Fecha de referencia en formato YYYY-MM-DD
 * @param {string} scheduledDate - Fecha programada en formato YYYY-MM-DD
 * @returns {number} Número de días hábiles
 */
export const calculateDaysFromScheduledDate = (referenceDate, scheduledDate) => {
  if (!referenceDate || !scheduledDate) return 0;
  return calcularDiasHabiles(referenceDate, scheduledDate, true);
};

/**
 * Obtiene la fecha de referencia anterior según prioridad de resolución
 * @param {number} clockState - Estado del clock actual
 * @param {object} clockValue - Definición del clock desde clocksDefinitions
 * @param {object} scheduleConfig - Configuración de programación
 * @param {function} getClock - Función para obtener clock por state
 * @param {function} getClockVersion - Función para obtener clock por state y version
 * @param {object} manager - Manager con datos adicionales (extension, suspension, etc)
 * @returns {string|null} Fecha de referencia en formato YYYY-MM-DD o null
 */
export const getReferenceDate = (clockState, clockValue, scheduleConfig, getClock, getClockVersion, manager) => {
  if (!clockValue) return null;

  // Helper para obtener clock considerando versión
  const getClockScoped = (state, version) => {
    if (version !== undefined) {
      return getClockVersion(state, version) || getClock(state);
    }
    return getClock(state);
  };

  // 1. Intentar obtener desde limit config (relaciones de dependencia)
  if (clockValue.limit) {
    const limitDate = resolveLimitDate(clockValue.limit, getClockScoped, clockValue.version);
    if (limitDate) return limitDate;
  }

  // 2. Para algunos casos especiales, usar lógica específica
  // Acta Parte 2 (49) y Viabilidad (61) dependen de correcciones o acta 1
  if (clockState === 49 || clockState === 61) {
    const acta1 = getClockScoped(30);
    const corrDate = getClockScoped(35)?.date_start;
    
    // Si hay correcciones, usar esa fecha
    if (corrDate) return corrDate;
    
    // Si acta 1 cumple, usar acta 1
    if (acta1?.date_start && acta1?.desc?.includes('CUMPLE')) {
      return acta1.date_start;
    }
  }

  // 3. Si no se puede resolver desde eventos, intentar desde programación anterior
  if (scheduleConfig && clockValue.limit) {
    const refFromSchedule = resolveReferenceDateFromSchedule(
      clockValue.limit,
      scheduleConfig,
      getClockScoped
    );
    if (refFromSchedule) return refFromSchedule;
  }

  return null;
};

/**
 * Resuelve fecha límite desde configuración de limit
 * @private
 */
const resolveLimitDate = (limitConfig, getClockScoped, version) => {
  if (!limitConfig || !Array.isArray(limitConfig)) return null;

  const isDirectConfig = typeof limitConfig[1] === 'number';

  if (!isDirectConfig) {
    // Es array de opciones, intentar cada una
    for (const option of limitConfig) {
      const result = resolveLimitDate(option, getClockScoped, version);
      if (result) return result;
    }
    return null;
  }

  // Es configuración directa [states, days]
  const [states] = limitConfig;
  const startStates = Array.isArray(states) ? states : [states];
  
  // Buscar fecha de evento en los estados de inicio
  for (const st of startStates) {
    const c = getClockScoped(st, version);
    if (c?.date_start) return c.date_start;
  }

  return null;
};

/**
 * Resuelve fecha de referencia desde programación cuando no hay evento real
 * @private
 */
const resolveReferenceDateFromSchedule = (limitConfig, scheduleConfig, getClockScoped) => {
  if (!limitConfig || !Array.isArray(limitConfig)) return null;

  const isDirectConfig = typeof limitConfig[1] === 'number';

  if (!isDirectConfig) {
    for (const option of limitConfig) {
      const result = resolveReferenceDateFromSchedule(option, scheduleConfig, getClockScoped);
      if (result) return result;
    }
    return null;
  }

  const [states, days] = limitConfig;
  const startStates = Array.isArray(states) ? states : [states];

  // Primero intentar obtener fecha de evento real
  for (const st of startStates) {
    const c = getClockScoped(st);
    if (c?.date_start) return c.date_start;
  }

  // Si no hay evento, intentar calcular desde programación del anterior
  for (const st of startStates) {
    const scheduled = scheduleConfig?.times?.[st];
    if (scheduled) {
      // Si el anterior tiene fecha programada, calcularla
      const anteriorRef = getReferenceDate(st, { limit: null }, scheduleConfig, getClockScoped);
      if (anteriorRef) {
        if (scheduled.type === 'days') {
          return calculateScheduledDateFromDays(anteriorRef, scheduled.value);
        } else if (scheduled.type === 'date') {
          return scheduled.value;
        }
      }
    }
  }

  return null;
};

/**
 * Determina si un tiempo es programable
 * @param {object} clockValue - Definición del clock
 * @param {object} clock - Clock actual con datos
 * @returns {boolean}
 */
export const isTimeSchedulable = (clockValue, clock) => {
  // No es programable si ya está ejecutado (tiene fecha)
  if (clock?.date_start) return false;
  
  // No es programable si no tiene flag allowSchedule
  if (!clockValue.allowSchedule) return false;
  
  // No es programable si es un título o sección
  if (clockValue.title) return false;
  
  // No es programable si no tiene state definido
  if (clockValue.state === false || clockValue.state === undefined) return false;
  
  return true;
};

/**
 * Construye el payload para enviar al endpoint
 * @param {object} scheduleData - Datos de programación por tiempo
 * @param {object} currentItem - Expediente actual
 * @returns {object} scheduleConfig listo para serializar
 */
export const buildSchedulePayload = (scheduleData, currentItem) => {
  return {
    expedienteId: currentItem.id,
    updatedAt: moment().toISOString(),
    times: scheduleData
  };
};

/**
 * Calcula el límite programado para mostrar en tabla
 * @param {number} clockState - Estado del clock
 * @param {object} clockValue - Definición del clock
 * @param {object} clock - Clock con datos reales
 * @param {object} scheduleConfig - Configuración de programación
 * @param {function} getClock - Función para obtener clock
 * @param {function} getClockVersion - Función para obtener clock versionado
 * @param {object} manager - Manager con datos adicionales
 * @returns {object|null} { limitDate, days, display }
 */
export const calculateScheduledLimitForDisplay = (
  clockState,
  clockValue,
  clock,
  scheduleConfig,
  getClock,
  getClockVersion,
  manager
) => {
  if (!scheduleConfig || !scheduleConfig.times) return null;
  
  const scheduled = scheduleConfig.times[clockState];
  if (!scheduled) return null;

  const referenceDate = getReferenceDate(
    clockState,
    clockValue,
    scheduleConfig,
    getClock,
    getClockVersion,
    manager
  );

  // Caso 1: No hay fecha de referencia
  if (!referenceDate) {
    if (scheduled.type === 'days') {
      return {
        limitDate: null,
        days: scheduled.value,
        display: `${scheduled.value} días (pendiente fecha ref.)`
      };
    } else {
      return {
        limitDate: scheduled.value,
        days: null,
        display: 'Pendiente fecha ref.'
      };
    }
  }

  // Caso 2: Hay fecha de referencia
  let limitDate, days;

  if (scheduled.type === 'days') {
    limitDate = calculateScheduledDateFromDays(referenceDate, scheduled.value);
    days = scheduled.value;
  } else {
    limitDate = scheduled.value;
    days = calculateDaysFromScheduledDate(referenceDate, limitDate);
  }

  return {
    limitDate,
    days,
    display: limitDate 
      ? `${moment(limitDate).format('DD/MM/YYYY')} (${days} días)`
      : `${days} días (pendiente fecha ref.)`
  };
};

/**
 * Obtiene días totales disponibles incluyendo prórrogas y suspensiones
 * Para casos especiales como Acta Parte 1/2
 * @param {number} clockState - Estado del clock
 * @param {object} manager - Manager con datos de extensión y suspensión
 * @param {number} baseDays - Días base según tipo de proyecto
 * @returns {number} Días totales disponibles
 */
export const getTotalAvailableDaysWithExtensions = (clockState, manager, baseDays) => {
  const { suspensionPreActa, suspensionPostActa, extension } = manager;
  
  let totalDays = baseDays;

  // Para Acta Parte 1 (state 30), incluir suspensiones pre-acta y prórroga si aplica
  if (clockState === 30) {
    if (suspensionPreActa.exists && suspensionPreActa.end?.date_start) {
      totalDays += suspensionPreActa.days;
    }
    
    // Incluir prórroga si existe y termina antes del acta
    if (extension.exists && extension.end?.date_start && !extension.isActive) {
      const acta1Date = manager.getClock(30)?.date_start;
      if (!acta1Date || moment(extension.start.date_start).isBefore(acta1Date)) {
        totalDays += extension.days;
      }
    }
  }

  // Para Acta Parte 2 (state 49) y Viabilidad (61), incluir todas las extensiones
  if (clockState === 49 || clockState === 61) {
    if (suspensionPreActa.exists && suspensionPreActa.end?.date_start) {
      totalDays += suspensionPreActa.days;
    }
    if (suspensionPostActa.exists && suspensionPostActa.end?.date_start) {
      totalDays += suspensionPostActa.days;
    }
    if (extension.exists && extension.end?.date_start) {
      totalDays += extension.days;
    }
  }

  return totalDays;
};
