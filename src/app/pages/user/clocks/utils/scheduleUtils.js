import moment from 'moment';
import { calcularDiasHabiles, sumarDiasHabiles } from '../hooks/useClocksManager';

// Constantes compartidas
export const COMPLIANCE_STRING = "ACTA PARTE 1 OBSERVACIONES: CUMPLE";
export const HIDDEN_STATES_IN_CUMPLE = [34, 35, 49]; // Prórroga correcciones, Radiación correcciones, Acta Parte 2

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
    const isCumple = acta1?.desc?.includes(COMPLIANCE_STRING);
    
    // Para Viabilidad (61) en caso CUMPLE, usar notificación efectiva
    if (clockState === 61 && isCumple) {
      const notificacionAviso = getClockScoped(32)?.date_start;
      const notificacionPersonal = getClockScoped(33)?.date_start;
      return notificacionAviso || notificacionPersonal || null;
    }
    
    // Si hay correcciones, usar esa fecha
    if (corrDate) return corrDate;
    
    // Si acta 1 cumple, usar acta 1
    if (acta1?.date_start && isCumple) {
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

  // --- Lógica especial para Fase 2 (Viabilidad, etc.) ---
  const isPhase2Event = clockState === 49 || clockState === 61;
  if (isPhase2Event && manager.viaTime !== null) {
      if (!referenceDate) {
          return {
              limitDate: null,
              days: manager.viaTime,
              display: `${manager.viaTime} días restantes (pendiente fecha ref.)`,
              extensionDays: 0,
          };
      }
      
      // Si el evento está programado, usamos su fecha o días, pero el total es `viaTime`
      let limitDate;
      let days = scheduled.type === 'days' ? scheduled.value : calculateDaysFromScheduledDate(referenceDate, scheduled.value);

      if (scheduled.type === 'date') {
          limitDate = scheduled.value;
      } else {
          limitDate = calculateScheduledDateFromDays(referenceDate, scheduled.value);
      }

      return {
          limitDate,
          days: days,
          // Mostramos los días programados vs. el total disponible de `viaTime`
          display: `${moment(limitDate).format('DD/MM/YYYY')} (${days} de ${manager.viaTime}d restantes)`,
          extensionDays: 0 // viaTime ya incluye suspensiones y prórrogas
      };
  }
  
  // --- Lógica General para otros eventos ---
  const extensionDays = getProgrammedExtensionDays(clockState, scheduleConfig, manager);

  if (!referenceDate) {
    if (scheduled.type === 'days') {
      const totalDays = scheduled.value + extensionDays;
      return {
        limitDate: null,
        days: totalDays,
        display: extensionDays > 0 
          ? `${totalDays} días (${scheduled.value}+${extensionDays} ext.) (pendiente fecha ref.)`
          : `${scheduled.value} días (pendiente fecha ref.)`,
        extensionDays: extensionDays,
      };
    } else {
      return {
        limitDate: scheduled.value,
        days: null,
        display: 'Pendiente fecha ref.',
        extensionDays: extensionDays,
      };
    }
  }

  let limitDate, days;

  if (scheduled.type === 'days') {
    const totalDays = scheduled.value + extensionDays;
    limitDate = calculateScheduledDateFromDays(referenceDate, totalDays);
    days = totalDays;
  } else {
    const baseDays = calculateDaysFromScheduledDate(referenceDate, scheduled.value);
    days = Math.max(0, baseDays - extensionDays);
    limitDate = scheduled.value;
  }

  return {
    limitDate,
    days,
    extensionDays,
    display: limitDate 
      ? extensionDays > 0
        ? `${moment(limitDate).format('DD/MM/YYYY')} (${days} días + ${extensionDays} ext.)`
        : `${moment(limitDate).format('DD/MM/YYYY')} (${days} días)`
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

/**
 * Calcula el límite legal para un tiempo específico
 * @param {number} clockState - Estado del clock
 * @param {object} clockValue - Definición del clock
 * @param {object} manager - Manager con toda la información
 * @returns {string|null} Fecha límite legal en formato YYYY-MM-DD
 */
export const calculateLegalLimit = (clockState, clockValue, manager) => {
  const { getClock, getClockVersion, FUN_0_TYPE_TIME, suspensionPreActa, suspensionPostActa, extension, currentItem, viaTime } = manager;
  
  const getClockScoped = (state) => {
    if (clockValue.version !== undefined) {
      return getClockVersion(state, clockValue.version) || getClock(state);
    }
    return getClock(state);
  };
  
  // Casos especiales
  
  // Acta Parte 1 (state 30)
  if (clockState === 30) {
    const ldf = getClockScoped(5)?.date_start;
    if (!ldf) return null;
    
    const baseDays = FUN_0_TYPE_TIME[currentItem.type] ?? 45;
    let totalDays = baseDays;
    
    if (suspensionPreActa.exists && suspensionPreActa.end?.date_start) {
      totalDays += suspensionPreActa.days;
    }
    
    if (extension.exists && extension.end?.date_start && !extension.isActive) {
      const acta1Date = getClockScoped(30)?.date_start;
      if (!acta1Date || moment(extension.start.date_start).isBefore(acta1Date)) {
        totalDays += extension.days;
      }
    }
    
    return sumarDiasHabiles(ldf, totalDays);
  }
  
  // Viabilidad (states 49 y 61)
  if (clockState === 49 || clockState === 61) {
    const ldf = getClockScoped(5)?.date_start;
    const acta1 = getClockScoped(30);
    const corrDate = getClockScoped(35)?.date_start;
    
    if (!ldf) return null;
    
    const isCumple = acta1?.desc?.includes(COMPLIANCE_STRING);
    const hasActa = !!acta1?.date_start;
    
    // Viabilidad en CUMPLE usa notificación efectiva
    if (clockState === 61 && isCumple) {
      const notificacionAviso = getClockScoped(32)?.date_start;
      const notificacionPersonal = getClockScoped(33)?.date_start;
      const notificacionEfectiva = notificacionAviso || notificacionPersonal;
      
      if (notificacionEfectiva && viaTime !== null) {
        return sumarDiasHabiles(notificacionEfectiva, viaTime);
      }
      return null;
    }
    
    // CUMPLE o sin acta
    if (isCumple || !hasActa) {
      if (acta1?.date_start && viaTime !== null) {
        return sumarDiasHabiles(acta1.date_start, viaTime);
      }
      return null;
    }
    
    // NO CUMPLE
    if (hasActa && !isCumple && corrDate && viaTime !== null) {
      return sumarDiasHabiles(corrDate, viaTime);
    }
    
    return null;
  }
  
  // Suspensiones (states 350/351)
  if (clockState === 350 || clockState === 351) {
    const isEndPre = clockState === 350;
    const thisSusp = isEndPre ? suspensionPreActa : suspensionPostActa;
    
    if (!thisSusp.start?.date_start) return null;
    
    const otherUsedDays = isEndPre 
      ? (suspensionPostActa.end?.date_start ? suspensionPostActa.days : 0)
      : (suspensionPreActa.end?.date_start ? suspensionPreActa.days : 0);
    
    const availableForThis = 10 - otherUsedDays;
    
    // MODIFICADO: Se resta 1 día porque la suspensión cuenta desde el MISMO día de inicio (inclusivo)
    // Si tengo 10 días y empiezo el Lunes, termino el próximo Viernes (10 días total), no el próximo Lunes (+10 días).
    return sumarDiasHabiles(thisSusp.start.date_start, Math.max(0, availableForThis - 1));
  }
  
  // Caso general: usar limit config
  if (clockValue.limit) {
    return resolveLegalLimitFromConfig(clockValue.limit, getClockScoped, clockValue.version);
  }
  
  return null;
};

/**
 * Resuelve límite legal desde configuración de limit
 * @private
 */
const resolveLegalLimitFromConfig = (limitConfig, getClockScoped, version) => {
  if (!limitConfig || !Array.isArray(limitConfig)) return null;
  
  const isDirectConfig = typeof limitConfig[1] === 'number';
  
  if (!isDirectConfig) {
    for (const option of limitConfig) {
      const result = resolveLegalLimitFromConfig(option, getClockScoped, version);
      if (result) return result;
    }
    return null;
  }
  
  const [states, days] = limitConfig;
  if (states === undefined || days === undefined) return null;
  
  const startStates = Array.isArray(states) ? states : [states];
  
  for (const st of startStates) {
    const c = getClockScoped(st, version);
    if (c?.date_start) {
      return sumarDiasHabiles(c.date_start, days);
    }
  }
  
  return null;
};

/**
 * Calcula días programados de prórrogas y suspensiones que afectan a un tiempo específico.
 * @param {number} clockState - El estado del tiempo que se está calculando.
 * @param {object} scheduleConfig - La configuración de programación guardada.
 * @param {object} manager - El objeto manager con acceso a todos los datos del proceso.
 * @returns {number} El total de días de extensión/suspensión que se deben sumar.
 */
export const getProgrammedExtensionDays = (clockState, scheduleConfig, manager) => {
    if (!scheduleConfig || !scheduleConfig.times) return 0;

    const { suspensionPreActa, suspensionPostActa, extension, getClock } = manager;
    let totalDays = 0;

    const addDaysFromEvent = (event) => {
        if (event.exists && event.end?.date_start) {
            totalDays += event.days;
        }
    };
    
    // Para Acta Parte 1 (state 30), solo contamos lo que ocurrió ANTES
    if (clockState === 30) {
        addDaysFromEvent(suspensionPreActa);
        
        // La prórroga solo se suma si empezó antes del acta
        if (extension.exists && extension.start?.date_start) {
            const acta1Date = getClock(30)?.date_start;
            if (!acta1Date || moment(extension.start.date_start).isBefore(acta1Date)) {
                 addDaysFromEvent(extension);
            }
        }
    }
    
    // Para Acta Parte 2 (49) y Viabilidad (61), la lógica se maneja con `viaTime`,
    // por lo que no necesitamos sumar días extra aquí. `viaTime` ya los contiene.
    // Devolvemos 0 para evitar doble contabilidad.
    if (clockState === 49 || clockState === 61) {
        return 0;
    }
    
    // Para cualquier otro evento, podrías necesitar una lógica más genérica,
    // pero por ahora, nos mantenemos restrictivos según tu petición.
    
    return totalDays;
};