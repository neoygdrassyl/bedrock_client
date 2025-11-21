import { useMemo, useState } from 'react';
import moment from 'moment';
import { DiasHabilesColombia } from '../../../../utils/BusinessDaysCol.js';
import { useProcessPhases } from './useProcessPhases';

// --- INSTANCIA Y HELPERS (pueden permanecer aquí o moverse a un archivo de utils) ---
const businessDaysCalculator = new DiasHabilesColombia();
export const calcularDiasHabiles = (fechaInicio, fechaFin) => {
  if (!fechaInicio || !fechaFin) return 0;
  try {
    const inicio = moment(fechaInicio).format('YYYY-MM-DD');
    const fin = moment(fechaFin).format('YYYY-MM-DD');
    if (moment(fin).isBefore(inicio)) return 0;
    return businessDaysCalculator.contarDiasHabiles(inicio, fin);
  } catch (e) { return 0; }
};
export const sumarDiasHabiles = (fechaInicio, dias) => {
    if (!fechaInicio || dias === undefined || dias === null) return fechaInicio;
    try {
      const inicio = moment(fechaInicio).format('YYYY-MM-DD');
      return businessDaysCalculator.sumarDiasHabiles(inicio, dias);
    } catch (e) { return moment(fechaInicio).format('YYYY-MM-DD'); }
};

// --- CONSTANTES ---
export const FUN_0_TYPE_TIME = { 'i': 20, 'ii': 25, 'iii': 35, 'iv': 45, 'oa': 15 };
export const FUN_0_TYPE_LABELS = { 'i': 'Tipo I', 'ii': 'Tipo II', 'iii': 'Tipo III', 'iv': 'Tipo IV', 'oa': 'Obra Menor' };
const STEPS_TO_CHECK = ['-5', '-6', '-7', '-8', '-10', '-11', '-17', '-18', '-19', '-20', '-21', '-22', '-30'];
export const NEGATIVE_PROCESS_TITLE = { '-1': 'INCOMPLETO', '-2': 'FALTA VALLA INFORMATIVA', '-3': 'NO CUMPLE ACTA CORRECCIONES', '-4': 'NO PAGA EXPENSAS', '-5': 'VOLUNTARIO', '-6': 'NEGADA' };

export const useScheduleConfig = (expedienteId) => {
    const storageKey = `curaduria_programacion_${expedienteId}`;
    const [scheduleConfig, setScheduleConfig] = useState(() => {
      try {
        const stored = localStorage.getItem(storageKey);
        return stored ? JSON.parse(stored) : null;
      } catch { return null; }
    });
    const saveScheduleConfig = (config) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(config));
        setScheduleConfig(config);
      } catch (error) { console.warn('Error al guardar config de programación:', error); }
    };
    const clearScheduleConfig = () => {
      try {
        localStorage.removeItem(storageKey);
        setScheduleConfig(null);
      } catch (error) { console.warn('Error al limpiar config:', error); }
    };
    return { scheduleConfig, saveScheduleConfig, clearScheduleConfig, hasSchedule: !!scheduleConfig };
};

// =====================================================
// HOOK PRINCIPAL SIMPLIFICADO
// =====================================================
export const useClocksManager = (currentItem, clocksData, currentVersion, systemDate) => {

  const today = useMemo(() => moment(systemDate).format('YYYY-MM-DD'), [systemDate]);

  // --- HELPERS BÁSICOS ---
  const getClock = (state) => (clocksData || []).find(c => String(c.state) === String(state)) || null;
  const getClockVersion = (state, version) => (clocksData || []).find(c => String(c.state) === String(state) && String(c.version) === String(version)) || null;
  const getNewestDate = (states) => {
    let newestDate = null;
    states.forEach((state) => {
      const date = getClock(state)?.date_start;
      if (date && (!newestDate || moment(date).isAfter(newestDate))) {
        newestDate = date;
      }
    });
    return newestDate;
  };
  
  // --- MEMOS DE EVENTOS CLAVE ---
  const suspensionPreActa = useMemo(() => {
    const start = getClock(300), end = getClock(350);
    const exists = !!start?.date_start;
    return { exists, start, end, days: exists && end?.date_start ? calcularDiasHabiles(start.date_start, end.date_start) : 0, isActive: exists && !end?.date_start };
  }, [clocksData]);

  const suspensionPostActa = useMemo(() => {
    const start = getClock(301), end = getClock(351);
    const exists = !!start?.date_start;
    return { exists, start, end, days: exists && end?.date_start ? calcularDiasHabiles(start.date_start, end.date_start) : 0, isActive: exists && !end?.date_start };
  }, [clocksData]);

  const extension = useMemo(() => {
    const start = getClock(400), end = getClock(401);
    const exists = !!start?.date_start;
    return { exists, start, end, days: exists && end?.date_start ? calcularDiasHabiles(start.date_start, end.date_start) : 0, isActive: exists && !end?.date_start };
  }, [clocksData]);

  const totalSuspensionDays = useMemo(() => suspensionPreActa.days + suspensionPostActa.days, [suspensionPreActa, suspensionPostActa]);
  const extensionDays = useMemo(() => extension.days, [extension]);

  // --- 👈 DELEGACIÓN DEL CÁLCULO DE FASES ---
  const processPhases = useProcessPhases({
      clocksData, currentItem, today, suspensionPreActa, suspensionPostActa, extension
  });
  
  // --- CÁLCULO DEL ESTADO GLOBAL (para compatibilidad y vistas de alto nivel) ---
  const curaduriaDetails = useMemo(() => {
    const activePhase = processPhases.find(p => ['ACTIVO', 'PAUSADO'].includes(p.status));
    const isFinished = processPhases.length > 0 && processPhases[processPhases.length - 1].status === 'COMPLETADO';
    const desistEvents = (clocksData || []).filter(c => c?.date_start && STEPS_TO_CHECK.includes(String(c.state)));
    const isDesisted = desistEvents.length > 0;

    if (isDesisted) return { status: 'DESISTIDO', notStarted: false, paused: false, finished: true, isDesisted: true };
    if (isFinished) return { status: 'FINALIZADO', notStarted: false, paused: false, finished: true, isDesisted: false };
    if (!activePhase) return { status: 'NO_INICIADO', notStarted: true, paused: false, finished: false, isDesisted: false };
    
    const total = (activePhase.totalDays || 0) + (activePhase.extraDays || 0);
    const used = activePhase.usedDays || 0;
    
    let status = activePhase.status;
    if (status === 'ACTIVO' && total > 0 && total - used < 0) { // Solo es VENCIDO si tiene un plazo
      status = 'VENCIDO';
    }

    return {
      status: status, total: total, used: used, remaining: total - used,
      notStarted: false, paused: status === 'PAUSADO', finished: false, isDesisted: false,
      baseDays: activePhase.totalDays, suspensionDays: totalSuspensionDays, extensionDays: extensionDays,
      processTypeLabel: FUN_0_TYPE_LABELS[currentItem.type] || '',
    };
  }, [processPhases, totalSuspensionDays, extensionDays, currentItem.type, clocksData]);


  // --- LÓGICA DE ACCIONES (canAdd...) ---
  const canAddSuspension = useMemo(() => {
    const activeCuraduriaPhase = processPhases.find(p => p.responsible === 'Curaduría' && p.status === 'ACTIVO');
    if (!activeCuraduriaPhase) return false;
    if (totalSuspensionDays >= 10) return false;
    if (suspensionPreActa.isActive || suspensionPostActa.isActive) return false;
    return true;
  }, [processPhases, totalSuspensionDays, suspensionPreActa, suspensionPostActa]);
  
  const canAddExtension = useMemo(() => {
    const phase1 = processPhases.find(p => p.id === 'phase1');
    if (!phase1 || phase1.status === 'COMPLETADO') return false;
    return !extension.exists;
  }, [processPhases, extension]);

  const availableSuspensionTypes = useMemo(() => {
      const types = [];
      const phase1 = processPhases.find(p => p.id === 'phase1');
      const phase4 = processPhases.find(p => p.id === 'phase4');
      if (phase1?.status !== 'COMPLETADO' && !suspensionPreActa.exists) {
          types.push({ value: 'pre', label: 'Antes del Acta (Fase 1)' });
      }
      if (phase4?.status !== 'PENDIENTE' && phase4?.status !== 'COMPLETADO' && !suspensionPostActa.exists) {
          types.push({ value: 'post', label: 'Post-Correcciones (Fase 4)' });
      }
      return types;
  }, [processPhases, suspensionPreActa, suspensionPostActa]);

  const calculateDaysSpent = (value, clock) => {
    // ... (sin cambios)
    if (!value.spentDaysConfig || !clock?.date_start) return null;
    const { startState, referenceDate } = value.spentDaysConfig;
    let startDate = referenceDate;
    if (!startDate) {
        const startStates = Array.isArray(startState) ? startState : [startState];
        startDate = getNewestDate(startStates);
    }
    if (!startDate) return null;
    return { days: calcularDiasHabiles(startDate, clock.date_start), startDate };
  };

  return {
    clocksData, suspensionPreActa, suspensionPostActa, totalSuspensionDays, extension,
    curaduriaDetails, isDesisted: curaduriaDetails.isDesisted, processPhases, getNewestDate, canAddSuspension, canAddExtension, availableSuspensionTypes,
    NEGATIVE_PROCESS_TITLE, FUN_0_TYPE_TIME, FUN_0_TYPE_LABELS, calculateDaysSpent, getClock, getClockVersion,
  };
};