import moment from 'moment';
import { calcularDiasHabiles, sumarDiasHabiles } from '../hooks/useClocksManager';

// Constantes compartidas
export const COMPLIANCE_STRING = "ACTA PARTE 1 OBSERVACIONES: CUMPLE";
export const HIDDEN_STATES_IN_CUMPLE = [34, 35, 49]; 

/**
 * Convierte días disponibles a fecha límite programada
 */
export const calculateScheduledDateFromDays = (referenceDate, days) => {
  if (!referenceDate || !days) return null;
  return sumarDiasHabiles(referenceDate, days);
};

/**
 * Convierte fecha especificada a días disponibles desde referencia
 */
export const calculateDaysFromScheduledDate = (referenceDate, scheduledDate) => {
  if (!referenceDate || !scheduledDate) return 0;
  return calcularDiasHabiles(referenceDate, scheduledDate, true);
};

/**
 * CORRECCIÓN IMPORTANTE: getReferenceDate
 * Añadida lógica explícita para el State 30 (Acta Parte 1)
 */
export const getReferenceDate = (clockState, clockValue, scheduleConfig, getClock, getClockVersion, manager) => {
  if (!clockValue) return null;

  const getClockScoped = (state, version) => {
    if (version !== undefined) {
      return getClockVersion(state, version) || getClock(state);
    }
    return getClock(state);
  };

  // --- CORRECCIÓN BUG ACTA PARTE 1 (State 30) ---
  // El Acta Parte 1 siempre depende de la Radicación en LDF (State 5) o 502/501
  if (clockState === 30) {
      // 1. Intentar obtener fecha real de LDF
      const ldf = getClockScoped(5);
      if (ldf?.date_start) return ldf.date_start;

      // 2. Si no hay LDF, verificar si hay un evento previo configurado en 'limit'
      // Normalmente el clock 30 tiene limit: [[5, X]]. 
      // Si no existe el evento 5, la lógica genérica de abajo fallaría si no encuentra schedule.
  }

  // 1. Intentar obtener desde limit config (relaciones de dependencia)
  if (clockValue.limit) {
    const limitDate = resolveLimitDate(clockValue.limit, getClockScoped, clockValue.version);
    if (limitDate) return limitDate;
  }

  // 2. Lógica especial Viabilidad y Acta 2
  if (clockState === 49 || clockState === 61) {
    const acta1 = getClockScoped(30);
    const corrDate = getClockScoped(35)?.date_start;
    const isCumple = acta1?.desc?.includes(COMPLIANCE_STRING);
    
    if (clockState === 61 && isCumple) {
      const notificacionAviso = getClockScoped(32)?.date_start;
      const notificacionPersonal = getClockScoped(33)?.date_start;
      return notificacionAviso || notificacionPersonal || null;
    }
    if (corrDate) return corrDate;
    if (acta1?.date_start && isCumple) {
      return acta1.date_start;
    }
  }

  // 3. Si no se puede resolver desde eventos reales, intentar desde programación anterior
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
    for (const option of limitConfig) {
      const result = resolveLimitDate(option, getClockScoped, version);
      if (result) return result;
    }
    return null;
  }

  const [states] = limitConfig;
  const startStates = Array.isArray(states) ? states : [states];
  
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

  const [states] = limitConfig;
  const startStates = Array.isArray(states) ? states : [states];

  for (const st of startStates) {
    const scheduled = scheduleConfig?.times?.[st];
    if (scheduled) {
      // Intentar calcular la fecha absoluta de ese evento programado anterior
      // IMPORTANTE: Aquí hay recursividad. Si el evento anterior también depende de otro,
      // necesitamos calcular su fecha real para usarla como base.
      
      // Caso simple: Es tipo fecha
      if (scheduled.type === 'date') return scheduled.value;

      // Caso complejo: Es tipo días. Necesitamos la referencia DEL ANTERIOR.
      // (Esta parte puede ser compleja sin pasar todo el manager recursivamente, 
      //  pero para 1 nivel de profundidad suele bastar si el anterior tiene fecha).
      
      // Nota: Si la cadena es muy larga, esto puede retornar null y el usuario verá "Pendiente fecha ref".
    }
  }

  return null;
};

/**
 * MODIFICADO: Determina si un tiempo es programable.
 * Se eliminó la restricción de `clock.date_start` para permitir editar ejecutados.
 */
export const isTimeSchedulable = (clockValue, clock) => {
  // AHORA PERMITIMOS PROGRAMAR AUNQUE ESTÉ EJECUTADO
  // if (clock?.date_start) return false; 
  
  // No es programable si no tiene flag allowSchedule
  if (!clockValue.allowSchedule) return false;
  
  // No es programable si es un título o sección
  if (clockValue.title) return false;
  
  // No es programable si no tiene state definido
  if (clockValue.state === false || clockValue.state === undefined) return false;
  
  return true;
};

export const buildSchedulePayload = (scheduleData, currentItem) => {
  return {
    expedienteId: currentItem.id,
    updatedAt: moment().toISOString(),
    times: scheduleData
  };
};

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
          display: `${moment(limitDate).format('DD/MM/YYYY')} (${days} de ${manager.viaTime}d restantes)`,
          extensionDays: 0 
      };
  }
  
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

export const getTotalAvailableDaysWithExtensions = (clockState, manager, baseDays) => {
  const { suspensionPreActa, suspensionPostActa, extension } = manager;
  
  let totalDays = baseDays;

  if (clockState === 30) {
    if (suspensionPreActa.exists && suspensionPreActa.end?.date_start) {
      totalDays += suspensionPreActa.days;
    }
    
    if (extension.exists && extension.end?.date_start && !extension.isActive) {
      const acta1Date = manager.getClock(30)?.date_start;
      if (!acta1Date || moment(extension.start.date_start).isBefore(acta1Date)) {
        totalDays += extension.days;
      }
    }
  }

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

export const calculateLegalLimit = (clockState, clockValue, manager) => {
  const { getClock, getClockVersion, FUN_0_TYPE_TIME, suspensionPreActa, suspensionPostActa, extension, currentItem, viaTime } = manager;
  
  const getClockScoped = (state, version) => {
    if (version !== undefined) {
      return getClockVersion(state, version) || getClock(state);
    }
    return getClock(state);
  };
  
  // --- Lógica Especial para Suspensiones (350/351) ---
  if (clockState === 350 || clockState === 351) {
      const isEndPre = clockState === 350;
      const thisSusp = isEndPre ? suspensionPreActa : suspensionPostActa;
      if (thisSusp.start?.date_start) {
          const otherUsedDays = isEndPre 
          ? (suspensionPostActa.end?.date_start ? suspensionPostActa.days : 0)
          : (suspensionPreActa.end?.date_start ? suspensionPreActa.days : 0);
          const availableForThis = 10 - otherUsedDays;
          const daysToAdd = Math.max(0, availableForThis - 1);
          return sumarDiasHabiles(thisSusp.start.date_start, daysToAdd);
      }
  } 
  // --- Lógica Especial para Prórroga (401) ---
  else if (clockState === 401) {
       const startExt = getClockScoped(400)?.date_start;
       if (startExt) {
           let extDuration = (clockValue.limit && Array.isArray(clockValue.limit) && clockValue.limit[0] && typeof clockValue.limit[0][1] === 'number') ? clockValue.limit[0][1] : 22;
           const daysToAdd = Math.max(0, extDuration - 1); 
           return sumarDiasHabiles(startExt, daysToAdd);
       }
  }
  else if (clockState === 30) {
      const ldf = getClockScoped(5)?.date_start;
      if (ldf) {
          const baseDays = FUN_0_TYPE_TIME[currentItem.type] ?? 45;
          let totalDays = baseDays;
          if (suspensionPreActa.exists && suspensionPreActa.end?.date_start) totalDays += suspensionPreActa.days;
          if (extension.exists && extension.end?.date_start && !extension.isActive) {
              const acta1Date = getClockScoped(30)?.date_start;
              if (!acta1Date || moment(extension.start.date_start).isBefore(acta1Date)) totalDays += extension.days;
          }
          return sumarDiasHabiles(ldf, totalDays);
      }
  } 
  else if (clockState === 49 || clockState === 61) {
       const ldf = getClockScoped(5)?.date_start;
       if (ldf) {
           const acta1 = getClockScoped(30);
           const isCumple = acta1?.desc?.includes(COMPLIANCE_STRING);
           const hasActa = !!acta1?.date_start;
           const corrDate = getClockScoped(35)?.date_start;

           if (clockState === 61 && isCumple) {
               const notif = getClockScoped(32)?.date_start || getClockScoped(33)?.date_start;
               if (notif) return sumarDiasHabiles(notif, viaTime);
           } else if (isCumple || !hasActa) {
               const baseDate = acta1?.date_start || ldf; 
               return sumarDiasHabiles(baseDate, viaTime);
           } else if (hasActa && !isCumple && corrDate) {
               return sumarDiasHabiles(corrDate, viaTime);
           }
       }
  }
  else if (clockValue.limit) {
      return resolveLegalLimitFromConfig(clockValue.limit, getClockScoped, clockValue.version);
  }
  
  return null;
};


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

export const getProgrammedExtensionDays = (clockState, scheduleConfig, manager) => {
    if (!scheduleConfig || !scheduleConfig.times) return 0;

    const { suspensionPreActa, suspensionPostActa, extension, getClock } = manager;
    let totalDays = 0;

    const addDaysFromEvent = (event) => {
        if (event.exists && event.end?.date_start) {
            totalDays += event.days;
        }
    };
    
    if (clockState === 30) {
        addDaysFromEvent(suspensionPreActa);
        
        if (extension.exists && extension.start?.date_start) {
            const acta1Date = getClock(30)?.date_start;
            if (!acta1Date || moment(extension.start.date_start).isBefore(acta1Date)) {
                 addDaysFromEvent(extension);
            }
        }
    }
    
    if (clockState === 49 || clockState === 61) {
        return 0;
    }
    
    return totalDays;
};