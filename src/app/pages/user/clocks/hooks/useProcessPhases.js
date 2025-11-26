import { useMemo } from 'react';
import moment from 'moment';
import { calcularDiasHabiles, sumarDiasHabiles, FUN_0_TYPE_TIME } from './useClocksManager';

export const useProcessPhases = ({ clocksData, currentItem, today, suspensionPreActa, suspensionPostActa, extension }) => {

  const processPhases = useMemo(() => {
    const getClock = (state) => (clocksData || []). find(c => String(c.state) === String(state)) || null;

    const getNewestDate = (states) => {
      let newestDate = null;
      states. forEach((state) => {
        const clock = getClock(state);
        const date = clock?. date_start;
        if (date && (! newestDate || moment(date).isAfter(newestDate))) {
          newestDate = date;
        }
      });
      return newestDate;
    };

    // --- 1. EXTRACCIÓN ---
    const radicacionDate = currentItem. date;
    const ldfDate = getClock(5)?.date_start;
    const vallaDate = getClock(503)?.date_start;
    const acta1 = getClock(30);
    const acta1Date = acta1?.date_start;
    const notificacionActa1Date = getNewestDate([32, 33]);
    const corrDate = getClock(35)?.date_start;
    const viabilidadDate = getClock(61)?.date_start;
    const notificacionViaDate = getNewestDate([56, 57]);
    const pagosDate = getClock(69)?.date_start;
    const resolucionDate = getClock(70)?.date_start;
    const ejecutoriaDate = getClock(99)?.date_start;
    const entregaDate = getClock(98)?.date_start;

    const baseDaysCuraduria = FUN_0_TYPE_TIME[currentItem.type] ??  45;
    const VALLA_LIMIT_DAYS = 5;

    // --- 2. HELPERS ---
    const checkCompliance = (desc) => {
        if (!desc) return false;
        return desc.trim().toUpperCase().includes("ACTA PARTE 1 OBSERVACIONES: CUMPLE");
    };

    const calculateUsedDaysFromNextDay = (startDate, endDate, defaultEnd = today) => {
        if (!startDate) return 0;
        const calcStart = sumarDiasHabiles(startDate, 1);
        const calcEnd = endDate || defaultEnd;
        if (moment(calcEnd).isBefore(calcStart)) return 0;
        return calcularDiasHabiles(calcStart, calcEnd);
    };

    // --- 3. CÁLCULOS NETOS FASE 1 ---
    const suspensionPreDays = suspensionPreActa.exists && suspensionPreActa.end?.date_start ? suspensionPreActa.days : 0;
    const suspensionPostDays = suspensionPostActa.exists && suspensionPostActa.end?.date_start ? suspensionPostActa.days : 0;
    const totalSuspensionDays = suspensionPreDays + suspensionPostDays;
    const extensionDays = extension.exists && extension.end?.date_start ? extension.days : 0;
    const totalCuraduriaDays = baseDaysCuraduria + totalSuspensionDays + extensionDays;

    let phase1UsedDays = 0;
    if (ldfDate && acta1Date) {
      const grossDays = calculateUsedDaysFromNextDay(ldfDate, acta1Date);
      phase1UsedDays = Math.max(0, grossDays - suspensionPreDays);
    } else if (ldfDate && !acta1Date) {
      let endPoint = today;
      let isPausedNow = false;
      if (suspensionPreActa.isActive) {
          endPoint = suspensionPreActa.start?.date_start;
          isPausedNow = true;
      }
      const grossDays = calculateUsedDaysFromNextDay(ldfDate, endPoint);
      phase1UsedDays = Math.max(0, grossDays - (isPausedNow ? 0 : suspensionPreDays)); 
    }

    const phase4AvailableDays = totalCuraduriaDays - phase1UsedDays;

    // --- 4. CONSTRUCCIÓN FASES ---
    let phases = [];
    let isProcessActive = true; // Esta es la bandera crítica
    const addPhase = (phase) => { phases.push(phase); };

    const checkStatus = (startDate, endDate) => {
      if (!startDate) return 'PENDIENTE';
      if (endDate) return 'COMPLETADO';
      // Si llegamos aquí, la fase inició pero no terminó.
      // Si nadie más ha tomado el estado ACTIVO, lo tomamos nosotros.
      if (isProcessActive) { 
          isProcessActive = false; // ¡Consumimos la bandera!
          return 'ACTIVO'; 
      }
      return 'PENDIENTE';
    };
    
    const checkParallelStatus = (startDate, endDate, parentStatus) => {
        if (!startDate) return 'PENDIENTE';
        if (endDate) return 'COMPLETADO';
        if (parentStatus === 'ACTIVO' || parentStatus === 'PAUSADO') return 'ACTIVO';
        return 'PENDIENTE';
    };

    // FASE 0
    addPhase({ id: 'phase0', title: 'Radicación y Legal y debida forma', responsible: 'Solicitante', status: checkStatus(radicacionDate, ldfDate), totalDays: 30, usedDays: calculateUsedDaysFromNextDay(radicacionDate, ldfDate), extraDays: 0, startDate: radicacionDate, endDate: ldfDate, parallelActors: null });

    // FASE 1
    let phase1Status = checkStatus(ldfDate, acta1Date);
    if (phase1Status === 'ACTIVO' && suspensionPreActa.isActive) phase1Status = 'PAUSADO';
    const vallaStatus = checkParallelStatus(ldfDate, vallaDate, phase1Status);
    let vallaUsedDays = calculateUsedDaysFromNextDay(ldfDate, vallaDate);

    addPhase({ id: 'phase1', title: 'Estudio y Observaciones', responsible: 'Curaduría', status: phase1Status, totalDays: totalCuraduriaDays, usedDays: phase1UsedDays, extraDays: 0, startDate: ldfDate, endDate: acta1Date, daysBreakdown: { base: baseDaysCuraduria, suspensions: totalSuspensionDays, extension: extensionDays }, parallelActors: { primary: { name: 'Curaduría', icon: 'fa-building', color: 'primary', totalDays: totalCuraduriaDays, usedDays: phase1UsedDays, extraDays: 0, status: phase1Status, taskDescription: 'Acta parte 1: Observaciones', daysBreakdown: { base: baseDaysCuraduria, suspensions: totalSuspensionDays, extension: extensionDays }}, secondary: { name: 'Solicitante', icon: 'fa-user', color: 'info', totalDays: VALLA_LIMIT_DAYS, usedDays: vallaUsedDays, extraDays: 0, status: vallaStatus, taskDescription: 'Instalación de valla', referenceState: 503 } } });

    // VERIFICACIÓN CUMPLIMIENTO
    const isCumple = checkCompliance(acta1?.desc);

    // --- CORRECCIÓN CRÍTICA: Solo agregar F2 y F3 si NO cumple ---
    // Antes las agregábamos y luego borrábamos, consumiendo el estado 'ACTIVO' en el proceso.
    
    if (!isCumple) {
        // FASE 2: Notificación
        addPhase({
          id: 'phase2', title: 'Notificación Observaciones', responsible: 'Curaduría',
          status: checkStatus(acta1Date, notificacionActa1Date), totalDays: 10,
          usedDays: calculateUsedDaysFromNextDay(acta1Date, notificacionActa1Date), extraDays: 0,
          startDate: acta1Date, endDate: notificacionActa1Date, parallelActors: null,
        });

        // FASE 3: Correcciones
        const hasProrrogaCorr = !!getClock(34)?.date_start;
        let phase3Status = 'PENDIENTE', phase3Used = 0;

        if (acta1?.desc?.toUpperCase().includes('NO CUMPLE') || acta1Date) {
          phase3Status = checkStatus(notificacionActa1Date, corrDate);
          if (phase3Status === 'ACTIVO' || phase3Status === 'COMPLETADO') {
             phase3Used = calculateUsedDaysFromNextDay(notificacionActa1Date, corrDate);
          }
        }

        addPhase({
          id: 'phase3', title: 'Correcciones del Solicitante', responsible: 'Solicitante',
          status: phase3Status, totalDays: hasProrrogaCorr ? 30 + 15 : 30,
          usedDays: phase3Used, extraDays: 0,
          startDate: notificacionActa1Date, endDate: corrDate, parallelActors: null,
        });
    }

    // --- FASE 4: REVISIÓN Y VIABILIDAD ---
    let triggerDate = null;
    let triggerSource = "NONE";

    if (isCumple) {
        triggerDate = acta1Date; // Salta directo desde Acta 1
        triggerSource = "ACTA1_CUMPLE";
    } else if (corrDate) {
        triggerDate = corrDate;
        triggerSource = "CORRECCIONES";
    }

    // Ahora checkStatus funcionará correctamente porque la bandera isProcessActive 
    // no fue consumida por las fases fantasma 2 y 3.
    let phase4Status = checkStatus(triggerDate, viabilidadDate);
    let phase4Used = 0;
    let phase4EndPoint = null;

    if (phase4Status === 'ACTIVO' || phase4Status === 'COMPLETADO') {
      const endPoint = viabilidadDate || (suspensionPostActa.isActive ? suspensionPostActa.start?. date_start : today);
      phase4EndPoint = endPoint;
      
      const grossUsed = calculateUsedDaysFromNextDay(triggerDate, endPoint);
      phase4Used = Math.max(0, grossUsed - suspensionPostDays);

      if (phase4Status === 'ACTIVO' && suspensionPostActa.isActive) {
        phase4Status = 'PAUSADO';
      }
    }

    addPhase({
      id: 'phase4', title: 'Revisión y Viabilidad', responsible: 'Curaduría', status: phase4Status, totalDays: Math.max(0, phase4AvailableDays), usedDays: phase4Used, extraDays: 0, startDate: triggerDate, endDate: viabilidadDate, daysContext: { totalCuraduria: totalCuraduriaDays, usedInPhase1: phase1UsedDays, availableForPhase4: phase4AvailableDays }, parallelActors: null,
    });

    // RESTO DE FASES (5 a 8)
    addPhase({ id: 'phase5', title: 'Liquidación y Pagos', responsible: 'Solicitante', status: checkStatus(notificacionViaDate, pagosDate), totalDays: 30, usedDays: calculateUsedDaysFromNextDay(notificacionViaDate, pagosDate), extraDays: 0, startDate: notificacionViaDate, endDate: pagosDate, parallelActors: null });
    addPhase({ id: 'phase6', title: 'Generación de Resolución', responsible: 'Curaduría', status: checkStatus(pagosDate, resolucionDate), totalDays: 5, usedDays: calculateUsedDaysFromNextDay(pagosDate, resolucionDate), extraDays: 0, startDate: pagosDate, endDate: resolucionDate, parallelActors: null });
    const notificacionResDate = getNewestDate([72, 73]);
    const renunciaTerminos = getClock(730)?.date_start;
    const phase7EndDate = ejecutoriaDate || renunciaTerminos;
    addPhase({ id: 'phase7', title: 'Ejecutoria de Licencia', responsible: 'Mixto', status: checkStatus(notificacionResDate, phase7EndDate), totalDays: 10, usedDays: calculateUsedDaysFromNextDay(notificacionResDate, phase7EndDate), extraDays: 0, startDate: notificacionResDate, endDate: phase7EndDate, parallelActors: null });
    addPhase({ id: 'phase8', title: 'Entrega de Licencia', responsible: 'Curaduría', status: checkStatus(ejecutoriaDate, entregaDate), totalDays: 1, usedDays: calculateUsedDaysFromNextDay(ejecutoriaDate, entregaDate), extraDays: 0, startDate: ejecutoriaDate, endDate: entregaDate, parallelActors: null });

    // DEBUG
    phases.debugInfo = {
        system: { today, type: currentItem.type },
        fechas: { ldf: ldfDate, acta1: acta1Date, corr: corrDate, viab: viabilidadDate },
        calculoFase1: { usados: phase1UsedDays, suspensionPreDesc: suspensionPreDays },
        fase4Debug: { trigger: triggerDate, source: triggerSource, status: phase4Status, endPoint: phase4EndPoint, usedCalculated: phase4Used, available: phase4AvailableDays },
        suspensiones: { pre: { active: suspensionPreActa.isActive, days: suspensionPreDays }, post: { active: suspensionPostActa.isActive, days: suspensionPostDays } },
        totales: { totalDisponible: totalCuraduriaDays, restanteFase4: phase4AvailableDays },
        cumplimiento: { isCumple: isCumple, text: acta1?.desc }
    };

    return phases;
  }, [clocksData, currentItem, today, extension, suspensionPreActa, suspensionPostActa]);

  return processPhases;
};