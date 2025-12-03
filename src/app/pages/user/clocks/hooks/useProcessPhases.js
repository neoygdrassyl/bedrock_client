import { useMemo } from 'react';
import moment from 'moment';
import { calcularDiasHabiles, sumarDiasHabiles, FUN_0_TYPE_TIME } from './useClocksManager';

export const useProcessPhases = ({ clocksData, currentItem, today, suspensionPreActa, suspensionPostActa, extension }) => {

  const processPhases = useMemo(() => {
    const getClock = (state) => (clocksData || []).find(c => String(c.state) === String(state)) || null;

    const getNewestDate = (states) => {
      let newestDate = null;
      states.forEach((state) => {
        const clock = getClock(state);
        const date = clock?.date_start;
        if (date && (!  newestDate || moment(date).isAfter(newestDate))) {
          newestDate = date;
        }
      });
      return newestDate;
    };

    // --- 1.   EXTRACCIÓN DE FECHAS ---
    const radicacionDate = currentItem.  date;
    const ldfDate = getClock(5)?.date_start;
    const vallaDate = getClock(503)?.date_start;
    const acta1 = getClock(30);
    const acta1Date = acta1?.date_start;
    const notificacionActa1Date = getNewestDate([32, 33]);
    const corrDate = getClock(35)?.date_start;
    
    // Viabilidad
    const viabilidadDate = getClock(61)?.date_start;
    const notificacionViaDate = getNewestDate([56, 57]);
    
    // Pagos
    const pagosDate = getClock(69)?.date_start;
    
    // Resolución
    const resolucionDate = getClock(70)?.date_start;
    const notificacionResDate = getNewestDate([72, 73]); // Notificación Resolución
    
    // Recurso y Final
    const recursoDate = getClock(74)?.date_start;
    const renunciaTerminos = getClock(730)?.date_start;
    const ejecutoriaDate = getClock(99)?.date_start;
    const entregaDate = getClock(98)?.date_start;

    const baseDaysCuraduria = FUN_0_TYPE_TIME[currentItem.type] ??  45;
    const VALLA_LIMIT_DAYS = 5;
    const RECURSO_LIMIT_DAYS = 10;

    // --- 2.  HELPERS ---
    const checkCompliance = (desc) => {
        if (! desc) return false;
        return desc.trim().toUpperCase().includes("ACTA PARTE 1 OBSERVACIONES: CUMPLE");
    };

    const calculateUsedDaysFromNextDay = (startDate, endDate, defaultEnd = today) => {
      if (!startDate) return 0;
      const calcEnd = endDate || defaultEnd;
      if (moment(calcEnd).isBefore(startDate)) return 0;
      return calcularDiasHabiles(startDate, calcEnd);
    };

    // --- 3. CÁLCULOS NETOS FASE 1 ---
    const suspensionPreDays = suspensionPreActa.exists && suspensionPreActa.end?.date_start ?   suspensionPreActa.days : 0;
    const suspensionPostDays = suspensionPostActa.exists && suspensionPostActa.end?.date_start ?  suspensionPostActa.days : 0;
    const totalSuspensionDays = suspensionPreDays + suspensionPostDays;
    const extensionDays = extension.exists && extension.end?.date_start ? extension.days : 0;
    const totalCuraduriaDays = baseDaysCuraduria + totalSuspensionDays + extensionDays;

    // -- Calculo de días usados en fase 1 ---
    let phase1UsedDays = 0;
    if (ldfDate && acta1Date) {
      const grossDays = calculateUsedDaysFromNextDay(ldfDate, acta1Date);
      phase1UsedDays = Math.max(0, grossDays);
    } else if (ldfDate && !  acta1Date) {
      let endPoint = today;
      const grossDays = calculateUsedDaysFromNextDay(ldfDate, endPoint);
      console.log("Cálculo fase 1 en curso, días brutos:", grossDays);
      phase1UsedDays = Math.max(0, grossDays); 
    } else {
      console.log("Fase 1 aún no iniciada.");
    }

    const phase4AvailableDays = totalCuraduriaDays - phase1UsedDays;

    // --- 4. CONSTRUCCIÓN FASES ---
    let phases = [];
    let isProcessActive = true; 
    const addPhase = (phase) => { phases.push(phase); };

    const checkStatus = (startDate, endDate) => {
      if (!startDate) return 'PENDIENTE';
      if (endDate) return 'COMPLETADO';
      if (isProcessActive) { 
          isProcessActive = false;
          return 'ACTIVO'; 
      }
      return 'PENDIENTE';
    };
    
    // Helper especial para controlar estados dentro de grupos paralelos
    const checkParallelStatus = (startDate, endDate, parentIsActive) => {
        if (endDate) return 'COMPLETADO';
        if (!  startDate) return 'PENDIENTE';
        if (startDate && !  endDate) return 'ACTIVO';
        return 'PENDIENTE';
    };

    // FASE 0: Radicación
    addPhase({ 
        id: 'phase0', 
        title: 'Radicación de Legal y debida forma', 
        responsible: 'Solicitante', 
        status: checkStatus(radicacionDate, ldfDate), 
        totalDays: 30, 
        usedDays: calculateUsedDaysFromNextDay(radicacionDate, ldfDate), 
        extraDays: 0, 
        startDate: radicacionDate, 
        endDate: ldfDate, 
        parallelActors: null 
    });

    // FASE 1: Estudio
    let phase1Status = checkStatus(ldfDate, acta1Date);
    if (phase1Status === 'ACTIVO' && suspensionPreActa.isActive) phase1Status = 'PAUSADO';
    const vallaStatus = checkParallelStatus(ldfDate, vallaDate, phase1Status === 'ACTIVO');
    let vallaUsedDays = calculateUsedDaysFromNextDay(ldfDate, vallaDate);

    addPhase({ 
        id: 'phase1', 
        title: 'Estudio y Observaciones', 
        responsible: 'Curaduría', 
        status: phase1Status, 
        totalDays: totalCuraduriaDays, 
        usedDays: phase1UsedDays, 
        extraDays: 0, 
        startDate: ldfDate, 
        endDate: acta1Date, 
        daysBreakdown: { 
            base: baseDaysCuraduria, 
            suspensions: totalSuspensionDays, 
            extension: extensionDays 
        }, 
        parallelActors: { 
            primary: { 
                name: 'Curaduría', 
                icon: 'fa-building', 
                color: 'primary', 
                totalDays: totalCuraduriaDays, 
                usedDays: phase1UsedDays, 
                extraDays: 0, 
                status: phase1Status, 
                taskDescription: 'Acta parte 1: Observaciones', 
                daysBreakdown: { 
                    base: baseDaysCuraduria, 
                    suspensions: totalSuspensionDays, 
                    extension: extensionDays 
                }
            }, 
            secondary: { 
                name: 'Solicitante', 
                icon: 'fa-user', 
                color: 'info', 
                totalDays: VALLA_LIMIT_DAYS, 
                usedDays: vallaUsedDays, 
                extraDays: 0, 
                status: vallaStatus, 
                taskDescription: 'Instalación de valla', 
                referenceState: 503 
            } 
        } 
    });

    const isCumple = checkCompliance(acta1?.desc);

    // FASE 2 & 3 (Condicionales si NO CUMPLE)
    if (!isCumple) {
        // FASE 2: Notificación Observaciones
        addPhase({
          id: 'phase2', 
          title: 'Notificación Observaciones', 
          responsible: 'Curaduría',
          status: checkStatus(acta1Date, notificacionActa1Date), 
          totalDays: 15,
          usedDays: calculateUsedDaysFromNextDay(acta1Date, notificacionActa1Date), 
          extraDays: 0,
          startDate: acta1Date, 
          endDate: notificacionActa1Date, 
          parallelActors: null,
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
          id: 'phase3', 
          title: 'Correcciones del Solicitante', 
          responsible: 'Solicitante',
          status: phase3Status, 
          totalDays: hasProrrogaCorr ? 30 + 15 : 30,
          usedDays: phase3Used, 
          extraDays: 0,
          startDate: notificacionActa1Date, 
          endDate: corrDate, 
          parallelActors: null,
        });
    }

    // --- FASE 4: REVISIÓN Y VIABILIDAD ---
    let triggerDate = null;
    let triggerSource = "NONE";

    if (isCumple) {
        triggerDate = acta1Date; 
        triggerSource = "ACTA1_CUMPLE";
    } else if (corrDate) {
        triggerDate = corrDate;
        triggerSource = "CORRECCIONES";
    }

    let phase4Status = checkStatus(triggerDate, viabilidadDate);
    let phase4Used = 0;
    let phase4EndPoint = null;

    if (phase4Status === 'ACTIVO' || phase4Status === 'COMPLETADO') {
      const endPoint = viabilidadDate || (suspensionPostActa.isActive ? suspensionPostActa.start?.date_start : today);
      phase4EndPoint = endPoint;
      
      const grossUsed = calculateUsedDaysFromNextDay(triggerDate, endPoint);
      phase4Used = Math.max(0, grossUsed - suspensionPostDays);

      if (phase4Status === 'ACTIVO' && suspensionPostActa.isActive) {
        phase4Status = 'PAUSADO';
      }
    }

    addPhase({
      id: 'phase4', 
      title: 'Revisión y Viabilidad', 
      responsible: 'Curaduría', 
      status: phase4Status, 
      totalDays: Math.max(0, phase4AvailableDays), 
      usedDays: phase4Used, 
      extraDays: 0, 
      startDate: triggerDate, 
      endDate: viabilidadDate, 
      daysContext: { 
          totalCuraduria: totalCuraduriaDays, 
          usedInPhase1: phase1UsedDays, 
          availableForPhase4: phase4AvailableDays 
      }, 
      parallelActors: null,
    });

    // --- FASE 5: NOTIFICACIÓN DE VIABILIDAD ---
    addPhase({
        id: 'phase5_notif',
        title: 'Notificación de Viabilidad',
        responsible: 'Curaduría',
        status: checkStatus(viabilidadDate, notificacionViaDate),
        totalDays: 15,
        usedDays: calculateUsedDaysFromNextDay(viabilidadDate, notificacionViaDate),
        extraDays: 0,
        startDate: viabilidadDate,
        endDate: notificacionViaDate,
        parallelActors: null
    });

    // --- FASE 6: LIQUIDACIÓN Y PAGOS ---
    addPhase({
        id: 'phase6_pagos',
        title: 'Liquidación y Pagos',
        responsible: 'Solicitante',
        status: checkStatus(notificacionViaDate, pagosDate),
        totalDays: 30,
        usedDays: calculateUsedDaysFromNextDay(notificacionViaDate, pagosDate),
        extraDays: 0,
        startDate: notificacionViaDate,
        endDate: pagosDate,
        parallelActors: null
    });

    // --- FASE 7: GENERACIÓN DE RESOLUCIÓN ---
    addPhase({ 
        id: 'phase7', 
        title: 'Generación de Resolución', 
        responsible: 'Curaduría', 
        status: checkStatus(pagosDate, resolucionDate), 
        totalDays: 5, 
        usedDays: calculateUsedDaysFromNextDay(pagosDate, resolucionDate), 
        extraDays: 0, 
        startDate: pagosDate, 
        endDate: resolucionDate, 
        parallelActors: null 
    });

    // --- FASE 8: NOTIFICACIÓN RESOLUCIÓN ---
    addPhase({ 
        id: 'phase8_notif', 
        title: 'Notificación Resolución', 
        responsible: 'Curaduría', 
        status: checkStatus(resolucionDate, notificacionResDate), 
        totalDays: 15,
        usedDays: calculateUsedDaysFromNextDay(resolucionDate, notificacionResDate), 
        extraDays: 0, 
        startDate: resolucionDate, 
        endDate: notificacionResDate, 
        parallelActors: null 
    });

    // --- FASE 9: EJECUTORIA Y RECURSO DE REPOSICIÓN (PARALELO) ---
    // Calcular si el plazo del recurso ha vencido
    let recursoExpired = false;
    let recursoRemainingDays = 0;

    if (notificacionResDate && ! recursoDate && !renunciaTerminos) {
        const recursoLimitDate = sumarDiasHabiles(notificacionResDate, RECURSO_LIMIT_DAYS);
        recursoRemainingDays = calcularDiasHabiles(today, recursoLimitDate);
        
        // Si la fecha límite ya pasó, el recurso está vencido
        if (moment(today).isAfter(recursoLimitDate)) {
            recursoExpired = true;
        }
    }

    // Determinar fecha final de ejecutoria
    let ejecutoriaEndDate = ejecutoriaDate || renunciaTerminos;

    // Si hay recurso activo (presentado pero no vencido), la ejecutoria espera
    if (recursoDate && !ejecutoriaDate && !renunciaTerminos) {
        ejecutoriaEndDate = null; // Ejecutoria en espera del recurso
    }

    // Si el recurso venció sin presentarse, la ejecutoria puede proceder
    if (recursoExpired && !ejecutoriaDate) {
        // Calcular fecha automática de ejecutoria (10 días desde notificación)
        ejecutoriaEndDate = sumarDiasHabiles(notificacionResDate, RECURSO_LIMIT_DAYS);
    }

    let phase9Status = checkStatus(notificacionResDate, ejecutoriaEndDate);

    // Sub-estados internos
    // Ejecutoria: Espera 10 días o Renuncia de Términos
    const ejecutoriaStatus = checkParallelStatus(notificacionResDate, ejecutoriaEndDate, phase9Status === 'ACTIVO');
    const ejecutoriaUsed = calculateUsedDaysFromNextDay(notificacionResDate, ejecutoriaEndDate);

    // Recurso: Determinar estado según si fue presentado o si venció
    let recursoStatus = 'PENDIENTE';
    let recursoUsed = 0;
    let recursoTaskDescription = 'Plazo para presentar recurso (opcional)';

    if (recursoDate) {
        // Recurso fue presentado
        recursoStatus = 'COMPLETADO';
        recursoUsed = calculateUsedDaysFromNextDay(notificacionResDate, recursoDate);
        recursoTaskDescription = `Recurso presentado (${recursoUsed} días)`;
    } else if (recursoExpired) {
        // Plazo venció sin presentar recurso
        recursoStatus = 'VENCIDO';
        recursoUsed = RECURSO_LIMIT_DAYS;
        recursoTaskDescription = 'Plazo vencido - Derecho agotado';
    } else if (notificacionResDate && !renunciaTerminos) {
        // Recurso está activo (plazo corriendo)
        recursoStatus = 'ACTIVO';
        recursoUsed = calculateUsedDaysFromNextDay(notificacionResDate, null);
        recursoTaskDescription = `Plazo disponible (${recursoRemainingDays} días restantes)`;
    }

    addPhase({
        id: 'phase9_exec',
        title: 'Ejecutoria y Recurso',
        responsible: 'Mixto',
        status: phase9Status,
        totalDays: 10,
        usedDays: Math.max(ejecutoriaUsed, recursoUsed), // Tomamos el mayor
        extraDays: 0,
        startDate: notificacionResDate,
        endDate: ejecutoriaEndDate,
        parallelActors: {
            primary: {
                name: 'Ejecutoria',
                icon: 'fa-gavel',
                color: 'primary',
                totalDays: 10,
                usedDays: ejecutoriaUsed,
                extraDays: 0,
                status: ejecutoriaStatus,
                taskDescription: 'Licencia queda en firme',
                referenceState: 99
            },
            secondary: {
                name: 'Recurso de Reposición',
                icon: 'fa-file-invoice',
                color: 'info',
                totalDays: 10,
                usedDays: recursoUsed,
                extraDays: 0,
                status: recursoStatus,
                taskDescription: recursoTaskDescription,
                referenceState: 74
            }
        }
    });

    // --- FASE 10: ENTREGA DE LICENCIA ---
    addPhase({ 
        id: 'phase10', 
        title: 'Entrega de Licencia', 
        responsible: 'Curaduría', 
        status: checkStatus(ejecutoriaDate, entregaDate), 
        totalDays: 1, 
        usedDays: calculateUsedDaysFromNextDay(ejecutoriaDate, entregaDate, true), 
        extraDays: 0, 
        startDate: ejecutoriaDate, 
        endDate: entregaDate, 
        parallelActors: null 
    });

    // DEBUG
    phases.debugInfo = {
        system: { today, type: currentItem. type },
        fechas: { ldf: ldfDate, acta1: acta1Date, corr: corrDate, viab: viabilidadDate, res: resolucionDate },
        calculoFase1: { usados: phase1UsedDays, suspensionPreDesc: suspensionPreDays },
        fase4Debug: { trigger: triggerDate, source: triggerSource, status: phase4Status, endPoint: phase4EndPoint, usedCalculated: phase4Used, available: phase4AvailableDays },
        suspensiones: { pre: { active: suspensionPreActa.  isActive, days: suspensionPreDays }, post: { active: suspensionPostActa. isActive, days: suspensionPostDays } },
        totales: { totalDisponible: totalCuraduriaDays, restanteFase4: phase4AvailableDays },
        cumplimiento: { isCumple: isCumple, text: acta1?.desc },
        recurso: { 
            presented: !!recursoDate, 
            date: recursoDate, 
            expired: recursoExpired,
            remainingDays: recursoRemainingDays,
            status: recursoStatus
        }
    };

    return phases;
  }, [clocksData, currentItem, today, extension, suspensionPreActa, suspensionPostActa]);

  return processPhases;
};