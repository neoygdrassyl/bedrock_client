import { useMemo, useEffect, useState } from 'react';
import moment from 'moment';
import { DiasHabilesColombia } from '../../../../utils/BusinessDaysCol.js';

// =====================================================
// INSTANCIA DEL CALCULADOR DE DÍAS HÁBILES
// =====================================================
const businessDaysCalculator = new DiasHabilesColombia();

// =====================================================
// FUNCIONES HELPER PARA CALCULAR DÍAS HÁBILES
// =====================================================
const calcularDiasHabiles = (fechaInicio, fechaFin) => {
  if (!fechaInicio || !fechaFin) return 0;
  
  try {
    const inicio = moment(fechaInicio).format('YYYY-MM-DD');
    const fin = moment(fechaFin).format('YYYY-MM-DD');
    
    if (inicio === fin) return 0;
    if (moment(fin).isBefore(inicio)) return 0;
    
    return businessDaysCalculator.contarDiasHabiles(inicio, fin);
    
  } catch (error) {
    console.warn('Error al calcular días hábiles:', error);
    return 0;
  }
};

const sumarDiasHabiles = (fechaInicio, dias) => {
  if (!fechaInicio || !dias) return fechaInicio;
  
  try {
    const inicio = moment(fechaInicio).format('YYYY-MM-DD');
    return businessDaysCalculator.sumarDiasHabiles(inicio, dias);
  } catch (error) {
    console.warn('Error al sumar días hábiles:', error);
    return moment(fechaInicio).add(dias, 'days').format('YYYY-MM-DD');
  }
};

export { calcularDiasHabiles, sumarDiasHabiles };

const STEPS_TO_CHECK = ['-5', '-6', '-7', '-8', '-10', '-11', '-17', '-18', '-19', '-20', '-21', '-22', '-30'];

export const FUN_0_TYPE_TIME = { 
  'i': 20, 
  'ii': 25, 
  'iii': 35, 
  'iv': 45, 
  'oa': 15 
};

export const FUN_0_TYPE_LABELS = {
  'i': 'Tipo I (20 días)',
  'ii': 'Tipo II (25 días)',
  'iii': 'Tipo III (35 días)',
  'iv': 'Tipo IV (45 días)',
  'oa': 'Obra Menor (15 días)'
};

export const NEGATIVE_PROCESS_TITLE = {
  '-1': 'INCOMPLETO',
  '-2': 'FALTA VALLA INFORMATIVA',
  '-3': 'NO CUMPLE ACTA CORRECCIONES',
  '-4': 'NO PAGA EXPENSAS',
  '-5': 'VOLUNTARIO',
  '-6': 'NEGADA',
};

// =====================================================
// GESTIÓN DE PROGRAMACIÓN (LocalStorage)
// =====================================================
const STORAGE_KEY_PREFIX = 'curaduria_programacion_';

export const useScheduleConfig = (expedienteId) => {
  const storageKey = `${STORAGE_KEY_PREFIX}${expedienteId}`;
  
  const [scheduleConfig, setScheduleConfig] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const saveScheduleConfig = (config) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(config));
      setScheduleConfig(config);
    } catch (error) {
      console.warn('Error al guardar configuración de programación:', error);
    }
  };

  const clearScheduleConfig = () => {
    try {
      localStorage.removeItem(storageKey);
      setScheduleConfig(null);
    } catch (error) {
      console.warn('Error al limpiar configuración:', error);
    }
  };

  return {
    scheduleConfig,
    saveScheduleConfig,
    clearScheduleConfig,
    hasSchedule: !!scheduleConfig
  };
};

// =====================================================
// HOOK PRINCIPAL
// =====================================================
export const useClocksManager = (currentItem, clocksData, currentVersion, systemDate) => { // 🆕 systemDate añadido
  
  const today = useMemo(() => moment(systemDate).format('YYYY-MM-DD'), [systemDate]); // 🆕 Fecha "hoy" dinámica

  const getClock = (state) => (clocksData || []).find(c => String(c.state) === String(state)) || null;
  
  const getClockVersion = (state, version) => 
    (clocksData || []).find(c => String(c.state) === String(state) && String(c.version) === String(version)) || null;

  const getNewestDate = (states) => {
    let newestDate = null;
    states.forEach((state) => {
      const date = getClock(state)?.date_start;
      if (!date) return;
      if (!newestDate) {
        newestDate = date;
      } else if (moment(date).isAfter(newestDate)) {
        newestDate = date;
      }
    });
    return newestDate;
  };

  const child1 = useMemo(() => {
    const child = currentItem.fun_1s;
    const version = currentVersion - 1;
    if (child && child[version] != null) {
      return {
        item_0: child[version].id,
        tramite: child[version].tramite,
        description: child[version].description || "",
      };
    }
    return { item_0: "", description: "" };
  }, [currentItem.fun_1s, currentVersion]);

  const suspensionPreActa = useMemo(() => {
    const startClock = getClock(300);
    const endClock = getClock(350);
    const exists = !!startClock?.date_start;
    
    let days = 0;
    let isActive = false;

    if (exists) {
      if (endClock?.date_start) {
        days = calcularDiasHabiles(startClock.date_start, endClock.date_start);
      } else {
        // Usa `today` del hook en lugar de moment()
        days = calcularDiasHabiles(startClock.date_start, today);
        isActive = true;
      }
    }
      
    return { exists, start: startClock, end: endClock, days, isActive };
  }, [clocksData, today]);

  const suspensionPostActa = useMemo(() => {
    const startClock = getClock(301);
    const endClock = getClock(351);
    const exists = !!startClock?.date_start;
    
    let days = 0;
    let isActive = false;

    if (exists) {
      if (endClock?.date_start) {
        days = calcularDiasHabiles(startClock.date_start, endClock.date_start);
      } else {
        days = calcularDiasHabiles(startClock.date_start, today);
        isActive = true;
      }
    }

    return { exists, start: startClock, end: endClock, days, isActive };
  }, [clocksData, today]);
  
  const totalSuspensionDays = useMemo(() => {
    const preDays = suspensionPreActa.exists && suspensionPreActa.end?.date_start ? suspensionPreActa.days : 0;
    const postDays = suspensionPostActa.exists && suspensionPostActa.end?.date_start ? suspensionPostActa.days : 0;
    return preDays + postDays;
  }, [suspensionPreActa, suspensionPostActa]);

  const extension = useMemo(() => {
    const startClock = getClock(400);
    const endClock = getClock(401);
    const exists = !!startClock?.date_start;
    
    let days = 0;
    let isActive = false;

    if (exists) {
      if (endClock?.date_start) {
        days = calcularDiasHabiles(startClock.date_start, endClock.date_start);
      } else {
        isActive = true;
        days = 0;
      }
    }

    return { exists, start: startClock, end: endClock, days, isActive };
  }, [clocksData]);

  const canAddSuspension = useMemo(() => {
    const act_2 = getClock(49);
    const ldfTime = getClock(5);
    if (totalSuspensionDays >= 10) return false;
    if (suspensionPreActa.isActive || suspensionPostActa.isActive) return false;
    if (act_2?.date_start || !ldfTime?.date_start) return false;
    return true;
  }, [totalSuspensionDays, suspensionPreActa, suspensionPostActa, clocksData]);
  
  const availableSuspensionTypes = useMemo(() => {
      const acta1 = getClock(30);
      const correcciones = getClock(35);
      const types = [];

      if (!suspensionPreActa.exists) {
          types.push({ value: 'pre', label: 'Antes del Acta de Observaciones' });
      }

      if (!suspensionPostActa.exists && correcciones?.date_start) {
          types.push({ value: 'post', label: 'Después de Radicación de Correcciones' });
      }

      return types;
  }, [suspensionPreActa, suspensionPostActa, clocksData]);

  const canAddExtension = useMemo(() => {
    const act_2 = getClock(49);
    const ldfTime = getClock(5);
    if (act_2?.date_start || !ldfTime?.date_start) return false;
    return !extension.exists;
  }, [extension, clocksData]);

  const curaduriaDetails = useMemo(() => {
    const acta2Clock = getClock(49);
    const actViav = getClock(61);
    
    if (acta2Clock?.date_start || actViav?.date_start) {
      return {
        status: 'FINALIZADO',
        total: 0,
        used: 0,
        remaining: 0,
        reference: acta2Clock?.date_start || actViav?.date_start,
        from: acta2Clock?.date_start ? 'ACTA_2(49)' : 'VIABILIDAD(61)',
        today: today, // 🆕 Usa `today` del hook
        notStarted: false,
        paused: false,
        finished: true,
        baseDays: 0,
        suspensionDays: 0,
        extensionDays: 0,
        processType: currentItem.type,
        processTypeLabel: FUN_0_TYPE_LABELS[currentItem.type] || currentItem.type,
      };
    }

    const baseDays = FUN_0_TYPE_TIME[currentItem.type] ?? 45;
    const ldfTime = getClock(5)?.date_start;
    const acta1Time = getClock(30)?.date_start;
    const corrTime = getClock(35)?.date_start;

    if (!ldfTime) {
      return {
        status: 'NO_INICIADO',
        total: baseDays,
        used: 0,
        remaining: baseDays,
        reference: null,
        from: 'NO_INICIADO',
        today: today, // 🆕 Usa `today` del hook
        notStarted: true,
        paused: false,
        finished: false,
        baseDays,
        suspensionDays: 0,
        extensionDays: 0,
        processType: currentItem.type,
        processTypeLabel: FUN_0_TYPE_LABELS[currentItem.type] || currentItem.type,
      };
    }

    const extensionDaysToAdd = (extension.exists && extension.end?.date_start) ? extension.days : 0;
    let totalAvailable = baseDays + totalSuspensionDays + extensionDaysToAdd;

    let daysUsed = 0;
    let referenceDate = ldfTime;
    let referenceLabel = 'LDF(5)';
    let isPaused = false;

    if (acta1Time && !corrTime) {
      const totalDaysInPeriod = calcularDiasHabiles(ldfTime, acta1Time);
      
      let suspensionToSubtract = 0;
      if (suspensionPreActa.exists && suspensionPreActa.end?.date_start) {
        const suspStart = suspensionPreActa.start.date_start;
        const suspEnd = suspensionPreActa.end.date_start;
        
        if (moment(suspStart).isSameOrAfter(ldfTime) && moment(suspEnd).isSameOrBefore(acta1Time)) {
          suspensionToSubtract = suspensionPreActa.days;
        }
      }
      
      daysUsed = Math.max(0, totalDaysInPeriod - suspensionToSubtract);
      isPaused = true;
      referenceDate = acta1Time;
      referenceLabel = 'ACTA_1(30) - PAUSADO';
    }
    else if (corrTime) {
      let phase1End = acta1Time || today;
      let phase1Days = calcularDiasHabiles(ldfTime, phase1End);
      
      if (suspensionPreActa.exists && suspensionPreActa.end?.date_start) {
        const suspStart = suspensionPreActa.start.date_start;
        const suspEnd = suspensionPreActa.end.date_start;
        
        if (moment(suspStart).isSameOrAfter(ldfTime) && moment(suspEnd).isSameOrBefore(phase1End)) {
          phase1Days = Math.max(0, phase1Days - suspensionPreActa.days);
        }
      }
      
      let phase2End = today;
      
      if (suspensionPostActa.isActive && suspensionPostActa.start?.date_start) {
        if (moment(suspensionPostActa.start.date_start).isAfter(corrTime)) {
          phase2End = suspensionPostActa.start.date_start;
          isPaused = true;
        }
      }
      
      let phase2Days = calcularDiasHabiles(corrTime, phase2End);
      
      if (suspensionPostActa.exists && suspensionPostActa.end?.date_start) {
        const suspStart = suspensionPostActa.start.date_start;
        const suspEnd = suspensionPostActa.end.date_start;
        
        if (moment(suspStart).isSameOrAfter(corrTime) && moment(suspEnd).isSameOrBefore(phase2End)) {
          phase2Days = Math.max(0, phase2Days - suspensionPostActa.days);
        }
      }
      
      daysUsed = phase1Days + phase2Days;
      referenceDate = phase2End;
      referenceLabel = isPaused ? `SUSP_ACTIVA(${suspensionPostActa.start.state})` : 'HOY';
    }
    else {
      let endDateForCalc = today;
      
      if (suspensionPreActa.isActive && suspensionPreActa.start?.date_start) {
        endDateForCalc = suspensionPreActa.start.date_start;
        isPaused = true;
      }
      
      const totalDaysInPeriod = calcularDiasHabiles(ldfTime, endDateForCalc);

      let suspensionDaysToSubtract = 0;
      
      if (suspensionPreActa.exists && suspensionPreActa.end?.date_start) {
        const suspStart = suspensionPreActa.start.date_start;
        const suspEnd = suspensionPreActa.end.date_start;
        
        if (moment(suspStart).isSameOrAfter(ldfTime) && moment(suspEnd).isSameOrBefore(endDateForCalc)) {
          suspensionDaysToSubtract = suspensionPreActa.days;
        }
      }
      
      daysUsed = Math.max(0, totalDaysInPeriod);
      
      referenceDate = endDateForCalc;
      referenceLabel = isPaused ? `SUSP_ACTIVA(${suspensionPreActa.start.state})` : 'HOY';
    }

    const remaining = totalAvailable - daysUsed;
    const status = isPaused ? 'PAUSADO' : (remaining < 0 ? 'VENCIDO' : 'EN_CURSO');

    return {
      status,
      total: totalAvailable,
      used: daysUsed,
      remaining,
      reference: referenceDate,
      from: referenceLabel,
      today: today, // 🆕 Usa `today` del hook
      notStarted: false,
      paused: isPaused,
      finished: false,
      baseDays,
      suspensionDays: totalSuspensionDays,
      extensionDays: extensionDaysToAdd,
      processType: currentItem.type,
      processTypeLabel: FUN_0_TYPE_LABELS[currentItem.type] || currentItem.type,
    };

  }, [clocksData, currentItem.type, totalSuspensionDays, extension, suspensionPreActa, suspensionPostActa, today]); // 🆕 `today` como dependencia
  
  const desistEvents = useMemo(() => {
      return (clocksData || []).filter(c => c?.date_start && STEPS_TO_CHECK.includes(String(c.state)));
  }, [clocksData]);

  const isDesisted = useMemo(() => desistEvents.length > 0, [desistEvents]);

  const viaTime = useMemo(() => {
    return curaduriaDetails.remaining > 0 ? curaduriaDetails.remaining : 1;
  }, [curaduriaDetails]);

  const calculateDaysSpent = (value, clock) => {
    if (!value.spentDaysConfig || !clock?.date_start) {
      return null;
    }

    const { startState, referenceDate } = value.spentDaysConfig;
    let startDate = null;

    if (referenceDate) {
      startDate = referenceDate;
    } else if (Array.isArray(startState)) {
      startDate = getNewestDate(startState);
    } else if (typeof startState === 'number' || typeof startState === 'string') {
      startDate = getClock(startState)?.date_start;
    }

    if (!startDate) {
      return null;
    }

    const days = calcularDiasHabiles(startDate, clock.date_start);

    return {
        days: days,
        startDate: startDate,
    };
  };

  return {
    clocksData,
    child1,
    suspensionPreActa,
    suspensionPostActa,
    totalSuspensionDays,
    extension,
    curaduriaDetails,
    desistEvents,
    isDesisted,
    viaTime,
    getNewestDate,
    canAddSuspension,
    canAddExtension,
    availableSuspensionTypes,
    NEGATIVE_PROCESS_TITLE,
    FUN_0_TYPE_TIME,
    FUN_0_TYPE_LABELS,
    calculateDaysSpent,
    getClock,
    getClockVersion,
  };
};