import { useMemo } from 'react';
import moment from 'moment';
import { dateParser_dateDiff } from '../../../../components/customClasses/typeParse';

// Constantes centralizadas para la lógica de negocio
const STEPS_TO_CHECK = ['-5', '-6', '-7', '-8', '-10', '-11', '-17', '-18', '-19', '-20', '-21', '-22', '-30'];
const FUN_0_TYPE_TIME = { 'i': 20, 'ii': 25, 'iii': 35, 'iv': 45, 'oa': 15 };
export const NEGATIVE_PROCESS_TITLE = {
  '-1': 'INCOMPLETO',
  '-2': 'FALTA VALLA INFORMATIVA',
  '-3': 'NO CUMPLE ACTA CORRECCIONES',
  '-4': 'NO PAGA EXPENSAS',
  '-5': 'VOLUNTARIO',
  '-6': 'NEGADA',
};

export const useClocksManager = (currentItem, clocksData, currentVersion) => {

  const getClock = (state) => (clocksData || []).find(c => String(c.state) === String(state)) || null;
  const getClockVersion = (state, version) => (clocksData || []).find(c => String(c.state) === String(state) && String(c.version) === String(version)) || null;

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
    const days = exists && endClock?.date_start
      ? dateParser_dateDiff(startClock.date_start, endClock.date_start)
      : (exists ? dateParser_dateDiff(startClock.date_start, moment().format('YYYY-MM-DD')) : 0);
      
    return { exists, start: startClock, end: endClock, days };
  }, [clocksData]);

  const suspensionPostActa = useMemo(() => {
    const startClock = getClock(301);
    const endClock = getClock(351);
    const exists = !!startClock?.date_start;
    const days = exists && endClock?.date_start
      ? dateParser_dateDiff(startClock.date_start, endClock.date_start)
      : (exists ? dateParser_dateDiff(startClock.date_start, moment().format('YYYY-MM-DD')) : 0);

    return { exists, start: startClock, end: endClock, days };
  }, [clocksData]);

  const totalSuspensionDays = useMemo(() => {
    // Solo contamos días de suspensiones finalizadas para el total
    const preDays = suspensionPreActa.exists && suspensionPreActa.end?.date_start ? suspensionPreActa.days : 0;
    const postDays = suspensionPostActa.exists && suspensionPostActa.end?.date_start ? suspensionPostActa.days : 0;
    return preDays + postDays;
  }, [suspensionPreActa, suspensionPostActa]);

  const extension = useMemo(() => {
    const startClock = getClock(400);
    const endClock = getClock(401);
    const exists = !!startClock?.date_start;
    // Si hay fecha de fin, calcula los días. Si no, devuelve el máximo teórico (22)
    const days = exists && endClock?.date_start 
        ? dateParser_dateDiff(startClock.date_start, endClock.date_start) 
        : (exists ? 22 : 0);

    return { exists, start: startClock, end: endClock, days };
  }, [clocksData]);

  const canAddSuspension = useMemo(() => {
    const act_2 = getClock(49);
    const ldfTime = getClock(5);
    // No se puede añadir si ya se usaron los 10 días o más
    if (totalSuspensionDays >= 10) return false;
    // No se puede añadir si hay una suspensión en curso (sin fecha de fin)
    if (suspensionPreActa.exists && !suspensionPreActa.end?.date_start) return false;
    if (suspensionPostActa.exists && !suspensionPostActa.end?.date_start) return false;
    // Restricciones del proceso
    if (act_2?.date_start || !ldfTime?.date_start) return false;
    
    return true;
  }, [totalSuspensionDays, suspensionPreActa, suspensionPostActa, clocksData]);
  
  const availableSuspensionTypes = useMemo(() => {
      const acta1 = getClock(30);
      const types = [];
      if (!suspensionPreActa.exists) {
          types.push({ value: 'pre', label: 'Antes del Acta de Observaciones' });
      }
      if (!suspensionPostActa.exists && acta1?.date_start) {
          types.push({ value: 'post', label: 'Después del Acta de Observaciones' });
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
    if (acta2Clock?.date_start || actViav?.date_start) return null;

    const evaDefaultTime = FUN_0_TYPE_TIME[currentItem.type] ?? 45;
    const ldfTime = getClock(5)?.date_start;
    const acta1Time = getClock(30)?.date_start;
    const corrTime = getClock(35)?.date_start;

    const extensionDays = extension.exists ? extension.days : 0;
    const baseTotal = evaDefaultTime + totalSuspensionDays + extensionDays;

    if (!ldfTime) {
      return {
        total: baseTotal, used: 0, remaining: baseTotal, reference: null, from: 'NOT_STARTED',
        today: moment().format('YYYY-MM-DD'), suspensions: totalSuspensionDays, extension: extensionDays,
        preActaUsed: 0, preFirstEventUsed: 0, preFirstEventExtra: 0, paused: false, notStarted: true,
      };
    }
    
    const preActaUsed = (ldfTime && acta1Time) ? dateParser_dateDiff(ldfTime, acta1Time) : 0;

    const firstEventCandidates = [];
    if (suspensionPreActa?.start?.date_start) firstEventCandidates.push({ date: suspensionPreActa.start.date_start, type: 'SUSP_PRE_START(300)' });
    if (suspensionPostActa?.start?.date_start) firstEventCandidates.push({ date: suspensionPostActa.start.date_start, type: 'SUSP_POST_START(301)' });
    if (corrTime) firstEventCandidates.push({ date: corrTime, type: 'CORR_35' });

    const validFirsts = firstEventCandidates.filter(c => c.date && (moment(c.date).isAfter(ldfTime) || moment(c.date).isSame(ldfTime)));
    let firstEvent = null;
    if (validFirsts.length) {
      validFirsts.sort((a, b) => (moment(a.date).isBefore(b.date) ? -1 : 1));
      firstEvent = validFirsts[0];
    }
    
    const preFirstEventUsed = firstEvent ? dateParser_dateDiff(ldfTime, firstEvent.date) : 0;
    const preFirstEventExtra = Math.max(0, preFirstEventUsed - preActaUsed);

    const candidates = [];
    if (acta1Time) {
      if (suspensionPostActa.end?.date_start) candidates.push({ date: suspensionPostActa.end.date_start, from: 'SUSP_POST_END(351)' });
      if (suspensionPostActa.start?.date_start) candidates.push({ date: suspensionPostActa.start.date_start, from: 'SUSP_POST_START(301)' });
      if (corrTime) candidates.push({ date: corrTime, from: 'CORR_35' });
    } else {
      if (suspensionPreActa.end?.date_start) candidates.push({ date: suspensionPreActa.end.date_start, from: 'SUSP_PRE_END(350)' });
      if (suspensionPreActa.start?.date_start) candidates.push({ date: suspensionPreActa.start.date_start, from: 'SUSP_PRE_START(300)' });
      if (ldfTime) candidates.push({ date: ldfTime, from: 'LDF_5' });
    }

    if (!candidates.length) {
      if (acta1Time) {
        return {
          total: baseTotal, used: preActaUsed + preFirstEventExtra, remaining: baseTotal - (preActaUsed + preFirstEventExtra),
          reference: null, from: 'PAUSED', today: moment().format('YYYY-MM-DD'), suspensions: totalSuspensionDays, extension: extensionDays,
          preActaUsed, preFirstEventUsed, preFirstEventExtra, paused: true, notStarted: false, firstEventDate: firstEvent?.date, firstEventType: firstEvent?.type,
        };
      }
      return {
        total: baseTotal, used: 0, remaining: baseTotal, reference: null, from: 'NOT_STARTED', today: moment().format('YYYY-MM-DD'),
        suspensions: totalSuspensionDays, extension: extensionDays, preActaUsed: 0, preFirstEventUsed: 0, preFirstEventExtra: 0,
        paused: false, notStarted: true, firstEventDate: firstEvent?.date, firstEventType: firstEvent?.type,
      };
    }

    candidates.sort((a, b) => (moment(a.date).isAfter(b.date) ? -1 : 1));
    const lastRef = candidates[0];

    let effectiveToday = moment().format('YYYY-MM-DD');
    const isActiveSuspension = (susp) => susp.exists && !susp.end?.date_start && susp.start?.date_start && moment(susp.start.date_start).isAfter(lastRef.date);

    if (acta1Time) {
      if (isActiveSuspension(suspensionPostActa)) effectiveToday = suspensionPostActa.start.date_start;
    } else {
      if (isActiveSuspension(suspensionPreActa)) effectiveToday = suspensionPreActa.start.date_start;
    }

    const usedAfterRef = dateParser_dateDiff(lastRef.date, effectiveToday);
    const used = preActaUsed + preFirstEventExtra + usedAfterRef;
    const remaining = baseTotal - used;
    const isPaused = (acta1Time && !corrTime && !suspensionPostActa.start?.date_start) || (isActiveSuspension(suspensionPreActa)) || (isActiveSuspension(suspensionPostActa));

    return {
      total: baseTotal, used, remaining, reference: lastRef.date, from: lastRef.from, today: effectiveToday,
      suspensions: totalSuspensionDays, extension: extensionDays, preActaUsed, preFirstEventUsed, preFirstEventExtra,
      paused: isPaused, notStarted: false, firstEventDate: firstEvent?.date, firstEventType: firstEvent?.type,
    };

  }, [clocksData, currentItem.type, extension, totalSuspensionDays, suspensionPreActa, suspensionPostActa]);
  
  const desistEvents = useMemo(() => {
      return (clocksData || []).filter(c => c?.date_start && STEPS_TO_CHECK.includes(String(c.state)));
  }, [clocksData]);

  const isDesisted = useMemo(() => desistEvents.length > 0, [desistEvents]);

  const viaTime = useMemo(() => {
    const evaDefaultTime = FUN_0_TYPE_TIME[currentItem.type] ?? 45;
    let ldfTime = getClock(5)?.date_start;
    let actaTime = getClock(30)?.date_start;
    let acta2Time = getClock(49)?.date_start;
    let corrTime = getClock(35)?.date_start;
    
    let time = evaDefaultTime;

    if (ldfTime && actaTime) {
        if (acta2Time && corrTime) {
            time = evaDefaultTime - dateParser_dateDiff(ldfTime, actaTime) - dateParser_dateDiff(acta2Time, corrTime);
        } else {
            time = evaDefaultTime - dateParser_dateDiff(ldfTime, actaTime);
        }
        time += totalSuspensionDays + (extension.exists ? extension.days : 0);
    }
    return time < 1 ? 1 : time;
  }, [clocksData, currentItem.type, totalSuspensionDays, extension]);

  const getNewestDate = (states) => {
    let newDate = null;
    states.forEach((element) => {
      const date = getClock(element)?.date_start;
      if (!newDate && date) newDate = date;
      else if (date && moment(date).isAfter(newDate)) newDate = date;
    });
    return newDate;
  }

  const calculateDaysSpent = (value, clock) => {
    // 1. Validaciones iniciales
    if (!value.spentDaysConfig || !clock?.date_start) {
      return null;
    }

    const { startState, referenceDate } = value.spentDaysConfig;
    let startDate = null;

    // 2. Búsqueda de la fecha de inicio
    if (referenceDate) {
      // Prioridad 1: Usar la fecha de referencia directa si existe.
      startDate = referenceDate;
    } else if (Array.isArray(startState)) {
      // Prioridad 2: Buscar en la lista de estados de inicio usando getNewestDate
      startDate = getNewestDate(startState);
    } else if (typeof startState === 'number' || typeof startState === 'string') {
      // Prioridad 3: Comportamiento anterior para un solo estado.
      startDate = getClock(startState)?.date_start;
    }

    // 3. Si después de todas las búsquedas no hay fecha de inicio, no se puede calcular.
    if (!startDate) {
      return null;
    }

    // 4. Calcular la diferencia en días.
    const days = dateParser_dateDiff(startDate, clock.date_start);

    // 5. Devolver un objeto con el resultado.
    return {
        days: days,
        startDate: startDate,
    };
  };

  return {
    // Data & Calculated values
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
    getNewestDate, // Exportar para usar en ClockRow
    
    // Booleans & Checks
    canAddSuspension,
    canAddExtension,
    availableSuspensionTypes,
    
    // Constants
    NEGATIVE_PROCESS_TITLE,
    FUN_0_TYPE_TIME,
    
    // Methods
    calculateDaysSpent,
    
    // Raw Getters
    getClock,
    getClockVersion,
  };
};