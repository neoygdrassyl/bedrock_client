import { useMemo } from 'react';
import moment from 'moment';
import { calcularDiasHabiles, sumarDiasHabiles, FUN_0_TYPE_TIME } from './useClocksManager';

export const useProcessPhases = ({ clocksData, currentItem, today, suspensionPreActa, suspensionPostActa, extension, phaseOptions }) => {

  const processPhases = useMemo(() => {
    // --- HELPERS DE CLOCKS ---
    const getClock = (state) => (clocksData || []).find(c => String(c.state) === String(state)) || null;
    
    // Helper para obtener clocks de desistimiento específicos (por versión)
    const getClockVersion = (state, version) => (clocksData || []).find(c => String(c.state) === String(state) && String(c.version) === String(version)) || null;

    // Detectar si hay un proceso de desistimiento activo y cuál es su causa (versión)
    // -1: Incompleto, -2: Valla, -3: No Cumple, -4: No Pagos, -5: Voluntario, -6: Negado
    const getDesistimientoVersion = () => {
        const versions = ['-1', '-2', '-3', '-4', '-5', '-6'];
        for (const v of versions) {
            // Buscamos si existe el inicio del desistimiento (-50) o la citación (-5) para esa versión
            if (getClockVersion(-50, v) || getClockVersion(-5, v)) return v;
        }
        return null;
    };

    const desistimientoVersion = getDesistimientoVersion();
    const estudioOptions = phaseOptions?.phase_estudio || { notificationType: 'notificar', byAviso: false };
    const correccionesOptions = phaseOptions?.phase_correcciones || { notificationType: 'notificar', byAviso: false };

    // --- 1. EXTRACCIÓN DE FECHAS ESTÁNDAR ---
    const radicacionDate = currentItem.date;
    const ldfDate = getClock(5)?.date_start;
    const vallaDate = getClock(503)?.date_start;
    const acta1 = getClock(30);
    const acta1Date = acta1?.date_start;
    const notificacionActa1Date =  estudioOptions.byAviso ? getClock(33)?.date_start : getClock(32)?.date_start;
    const corrDate = getClock(35)?.date_start;
    
    // Viabilidad
    const viabilidadDate = getClock(61)?.date_start;
    const notificacionViaDate = correccionesOptions.byAviso ? getClock(57)?.date_start : getClock(56)?.date_start;
    
    // Pagos
    const pagosDate = getClock(69)?.date_start;
    
    // Resolución Final
    const resolucionDate = getClock(70)?.date_start;
    const notificacionResDate = getClock(72)?.date_start || getClock(73)?.date_start;
    
    // Recurso y Final
    const recursoDate = getClock(74)?.date_start;
    const renunciaTerminos = getClock(730)?.date_start;
    const ejecutoriaDate = getClock(99)?.date_start;
    const entregaDate = getClock(98)?.date_start;

    const baseDaysCuraduria = FUN_0_TYPE_TIME[currentItem.type] ?? 45;
    const VALLA_LIMIT_DAYS = 5;
    const RECURSO_LIMIT_DAYS = 10;

    // --- 2. HELPERS DE CÁLCULO Y ESTADO ---
    const checkCompliance = (desc) => {
        if (!desc) return false;
        return desc.trim().toUpperCase().includes("ACTA PARTE 1 OBSERVACIONES: CUMPLE");
    };

    const calculateUsedDaysFromNextDay = (startDate, endDate, defaultEnd = today) => {
      if (!startDate) return 0;
      const calcEnd = endDate || defaultEnd;
      if (moment(calcEnd).isBefore(startDate)) return 0;
      return calcularDiasHabiles(startDate, calcEnd);
    };

    let isProcessActive = true; 

    const checkStatus = (startDate, endDate) => {
      if (!startDate) return 'PENDIENTE';
      if (endDate) return 'COMPLETADO';
      if (isProcessActive) { 
          isProcessActive = false;
          return 'ACTIVO'; 
      }
      return 'PENDIENTE';
    };
    
    const checkParallelStatus = (startDate, endDate, parentIsActive) => {
        if (endDate) return 'COMPLETADO';
        if (!startDate) return 'PENDIENTE';
        if (startDate && !endDate) return 'ACTIVO';
        return 'PENDIENTE';
    };

    // --- 3. GENERADOR DE FASES DE DESISTIMIENTO ---
    // Esta función encapsula toda la lógica nueva solicitada para los bloques de desistimiento
    const generateDesistimientoPhases = (version) => {
        const dPhases = [];
        
        // Fechas Clave del Desistimiento
        const dStart = getClockVersion(-50, version)?.date_start; // Inicio (-50)
        const dRes = getClockVersion(-6, version)?.date_start;    // Resolución (-6)
        const dCitacion = getClockVersion(-5, version)?.date_start; // Citación (-5)
        const dNotifPersonal = getClockVersion(-7, version)?.date_start;
        const dNotifAviso = getClockVersion(-8, version)?.date_start;
        const dNotif = dNotifPersonal || dNotifAviso; // Fecha efectiva de notificación
        
        const dRecurso = getClockVersion(-10, version)?.date_start; // Interponer recurso (-10)
        const dResRecurso = getClockVersion(-17, version)?.date_start; // Resolución Recurso (-17)
        
        const dNotifRecurso = getClockVersion(-22, version)?.date_start || getClockVersion(-21, version)?.date_start; // Notificación 2da vez
        const dFinal = getClockVersion(-30, version)?.date_start; // Finalización (-30)

        // FASE D1: Resolución Desistida
        // "Cuenta el tiempo desde el state -50 hasta que hay resolucion desistida"
        dPhases.push({
            id: `desist_${version}_res`,
            title: 'Resolución Desistida',
            responsible: 'Curaduría',
            status: checkStatus(dStart, dRes),
            totalDays: 5,
            usedDays: calculateUsedDaysFromNextDay(dStart, dRes),
            extraDays: 0,
            startDate: dStart,
            endDate: dRes,
            parallelActors: null
        });

        // FASE D2: Notificación Resolución
        // "Dura 15 días y comprende las fechas desde la citación hasta la notificacion"
        // Usamos -5 (Citación) o -6 (Resolución) como inicio, hasta -7/-8 (Notificación)
        const startNotif = dCitacion || dRes;
        dPhases.push({
            id: `desist_${version}_notif`,
            title: 'Notificación Resolución',
            responsible: 'Curaduría',
            status: checkStatus(startNotif, dNotif),
            totalDays: 15,
            usedDays: calculateUsedDaysFromNextDay(startNotif, dNotif),
            extraDays: 0,
            startDate: startNotif,
            endDate: dNotif,
            parallelActors: null
        });

        // FASE D3: Ejecutoria y Plazo Recurso
        // "Importante que modeles el comportamiento... cuando hay recurso"
        // Aquí usamos actores paralelos para evitar el "Mixto"
        
        // Determinar fin de ejecutoria: Si hay recurso, termina cuando se interpone. Si no, calculamos fecha.
        let dEjecutoriaEnd = ejecutoriaDate || dRecurso; //|| (dNotif ? sumarDiasHabiles(dNotif, 10) : null);
        // Si el proceso ya finalizó sin recurso, la ejecutoria se asume cumplida
        if (!dRecurso && dFinal) dEjecutoriaEnd = dFinal; 

        const dPhase3Status = checkStatus(dNotif, dRecurso || (dFinal ? dFinal : null));
        
        // Estado Recurso
        let recursoStatus = 'PENDIENTE';
        if (dNotif && !dRecurso && !dFinal) recursoStatus = 'ACTIVO'; // Corriendo tiempo
        if (dRecurso) recursoStatus = 'COMPLETADO';
        
        // Estado Ejecutoria
        let ejecutoriaStatus = 'PENDIENTE';
        if (dNotif && !dFinal) ejecutoriaStatus = 'ACTIVO';
        if (dFinal || dRecurso) ejecutoriaStatus = 'COMPLETADO';

        dPhases.push({
            id: `desist_${version}_exec`,
            title: 'Ejecutoria y Recurso',
            responsible: 'Curaduría', // Se marca curaduría como principal, pero se desglosa abajo
            status: dPhase3Status,
            totalDays: 10,
            usedDays: calculateUsedDaysFromNextDay(dNotif, dRecurso || dEjecutoriaEnd),
            extraDays: 0,
            startDate: dNotif,
            endDate: dRecurso || dEjecutoriaEnd,
            parallelActors: {
                primary: {
                    name: 'Ejecutoria',
                    icon: 'fa-gavel',
                    color: 'primary',
                    totalDays: 10,
                    usedDays: calculateUsedDaysFromNextDay(dNotif, dEjecutoriaEnd),
                    extraDays: 0,
                    status: ejecutoriaStatus,
                    taskDescription: 'Firmeza del acto',
                },
                secondary: {
                    name: 'Recurso',
                    icon: 'fa-file-signature',
                    color: 'info',
                    totalDays: 10,
                    usedDays: calculateUsedDaysFromNextDay(dNotif, dRecurso),
                    extraDays: 0,
                    status: recursoStatus,
                    taskDescription: 'Interposición de recurso',
                }
            }
        });

        // FASES ADICIONALES SI HAY RECURSO
        if (dRecurso) {
            // FASE D4: Resolver Recurso
            dPhases.push({
                id: `desist_${version}_res_rec`,
                title: 'Resolver Recurso de Reposición',
                responsible: 'Curaduría',
                status: checkStatus(dRecurso, dResRecurso),
                totalDays: 45, // Plazo legal típico para resolver recursos
                usedDays: calculateUsedDaysFromNextDay(dRecurso, dResRecurso),
                extraDays: 0,
                startDate: dRecurso,
                endDate: dResRecurso,
                parallelActors: null
            });

            // FASE D5: Notificación Recurso
            dPhases.push({
                id: `desist_${version}_notif_rec`,
                title: 'Notificación Respuesta Recurso',
                responsible: 'Curaduría',
                status: checkStatus(dResRecurso, dNotifRecurso),
                totalDays: 15,
                usedDays: calculateUsedDaysFromNextDay(dResRecurso, dNotifRecurso),
                extraDays: 0,
                startDate: dResRecurso,
                endDate: dNotifRecurso,
                parallelActors: null
            });

            // FASE D6: Cierre / Fase Final
            dPhases.push({
                id: `desist_${version}_final`,
                title: 'Cierre y Archivo',
                responsible: 'Curaduría',
                status: checkStatus(dNotifRecurso, dFinal),
                totalDays: 1,
                usedDays: calculateUsedDaysFromNextDay(dNotifRecurso, dFinal),
                extraDays: 0,
                startDate: dNotifRecurso,
                endDate: dFinal,
                parallelActors: null
            });
        }

        return dPhases;
    };

    // --- 4. CONSTRUCCIÓN DEL FLUJO DE FASES ---
    let phases = [];
    const addPhase = (phase) => { phases.push(phase); };

    // ==========================================================
    // LÓGICA DE BIFURCACIÓN SEGÚN CAUSAL DE DESISTIMIENTO
    // ==========================================================

    // FASE 0: Radicación (Común para todos)
    // >>> CORRECCIÓN: Si es desistimiento por incompleto (-1) o valla (-2), no esperamos LDF, forzamos completado.
    const skipPhase0 = ['-1', '-2'].includes(desistimientoVersion);
    
    addPhase({ 
        id: 'phase0', 
        title: 'Radicación de Legal y debida forma', 
        responsible: 'Solicitante', 
        status: skipPhase0 ? 'COMPLETADO' : checkStatus(radicacionDate, ldfDate), 
        totalDays: 30, 
        usedDays: calculateUsedDaysFromNextDay(radicacionDate, ldfDate), 
        extraDays: 0, 
        startDate: radicacionDate, 
        endDate: ldfDate, 
        parallelActors: null 
    });

    // --- CASO 1: INCOMPLETO (-1) ---
    if (desistimientoVersion === '-1') {
        // "Incompleto: Radicacion (Fase inicial ya existente) - Resolución Desistida..."
        // Saltamos directamente a las fases de desistimiento
        const dPhases = generateDesistimientoPhases('-1');
        dPhases.forEach(p => addPhase(p));
    }
    // --- CASO 2: VALLA INFORMATIVA (-2) ---
    else if (desistimientoVersion === '-2') {
        // "Valla informativa: ...proceso de acta y valla quiero que se muestre que seria la segunda fase"
        // >>> CORRECCIÓN: "tampoco deberia esperar que haya acta". Forzamos completado para avanzar.
        
        const phase1Status = 'COMPLETADO';
        const vallaUsedDays = calculateUsedDaysFromNextDay(ldfDate, vallaDate);
        
        addPhase({ 
            id: 'phase1_valla', 
            title: 'Estudio y Observaciones', 
            responsible: 'Curaduría', 
            status: phase1Status, 
            totalDays: baseDaysCuraduria, 
            usedDays: calculateUsedDaysFromNextDay(ldfDate, vallaDate || today), 
            extraDays: 0, 
            startDate: ldfDate, 
            endDate: vallaDate, 
            parallelActors: {
                primary: { 
                    name: 'Curaduría', 
                    icon: 'fa-building', 
                    color: 'primary', 
                    totalDays: baseDaysCuraduria, 
                    usedDays: calculateUsedDaysFromNextDay(ldfDate, vallaDate || today), 
                    extraDays: 0, 
                    status: phase1Status, 
                    taskDescription: 'Revisión preliminar'
                }, 
                secondary: { 
                    name: 'Solicitante', 
                    icon: 'fa-user', 
                    color: 'info', 
                    totalDays: VALLA_LIMIT_DAYS, 
                    usedDays: vallaUsedDays, 
                    extraDays: 0, 
                    status: phase1Status === 'PENDIENTE' ? 'PENDIENTE' : (vallaDate ? 'COMPLETADO' : 'ACTIVO'), 
                    taskDescription: 'Falta Valla Informativa', 
                } 
            }
        });

        // Luego fases de desistimiento
        const dPhases = generateDesistimientoPhases('-2');
        dPhases.forEach(p => addPhase(p));
    }
    // --- CASOS: NO CUMPLE (-3), VOLUNTARIO (-5), NEGADO (-6) ---
    // Estos comparten la lógica de ir hasta correcciones/viabilidad
    else if (['-3', '-5', '-6'].includes(desistimientoVersion)) {
        // FASE 1: Estudio (Normal)
        let phase1Status = checkStatus(ldfDate, acta1Date);
        if (phase1Status === 'ACTIVO' && suspensionPreActa.isActive) phase1Status = 'PAUSADO';
        const suspensionDays = (suspensionPreActa.exists && suspensionPreActa.end?.date_start ? suspensionPreActa.days : 0) +
                               (suspensionPostActa.exists && suspensionPostActa.end?.date_start ? suspensionPostActa.days : 0);
        const extensionDays = extension.exists && extension.end?.date_start ? extension.days : 0;
        const totalCuraduriaDays = baseDaysCuraduria + suspensionDays + extensionDays;
        const phase1UsedDays = ldfDate ? calculateUsedDaysFromNextDay(ldfDate, acta1Date || today) : 0;

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
            parallelActors: null 
        });

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
        // >>> CORRECCIÓN: "no se espera la fecha de radicacion por lo que esa fase deberia marcarse como completa automaticamente"
        const hasProrrogaCorr = !!getClock(34)?.date_start;
        let phase3Status = checkStatus(notificacionActa1Date, corrDate);
        if (['-3', '-5', '-6'].includes(desistimientoVersion)) phase3Status = 'COMPLETADO';

        addPhase({
          id: 'phase3', 
          title: 'Correcciones del Solicitante', 
          responsible: 'Solicitante',
          status: phase3Status, 
          totalDays: hasProrrogaCorr ? 45 : 30,
          usedDays: calculateUsedDaysFromNextDay(notificacionActa1Date, corrDate), 
          extraDays: 0,
          startDate: notificacionActa1Date, 
          endDate: corrDate, 
          parallelActors: null,
        });

        // FASE 4: Correcciones y Viabilidad (RENOMBRADA y DETENIDA AQUÍ)
        // "La fase no se llama viabilidad... sino correcciones y viabilidad"
        // El desistimiento ocurre durante o después de esta fase
        const startPhase4 = corrDate || notificacionActa1Date; // Si no corrigió, arranca desde notif
        const endPhase4 = viabilidadDate || getClockVersion(-50, desistimientoVersion)?.date_start || today;
        let phase4Status = checkStatus(startPhase4, endPhase4);
        
        addPhase({
          id: 'phase4_desist', 
          title: 'Correcciones y Viabilidad', 
          responsible: 'Curaduría', 
          status: phase4Status, 
          totalDays: Math.max(0, totalCuraduriaDays - phase1UsedDays), 
          usedDays: calculateUsedDaysFromNextDay(startPhase4, endPhase4), 
          extraDays: 0, 
          startDate: startPhase4, 
          endDate: endPhase4, 
          parallelActors: null,
        });

        // Fases de Desistimiento
        const dPhases = generateDesistimientoPhases(desistimientoVersion);
        dPhases.forEach(p => addPhase(p));
    }
    
    // --- FLUJO ESTÁNDAR (O PARCIAL SI ES -4) ---
    if (!desistimientoVersion || desistimientoVersion === '-4') {
        
        // Cálculos Fase 1
        const suspensionPreDays = suspensionPreActa.exists && suspensionPreActa.end?.date_start ? suspensionPreActa.days : 0;
        const suspensionPostDays = suspensionPostActa.exists && suspensionPostActa.end?.date_start ? suspensionPostActa.days : 0;
        const totalSuspensionDays = suspensionPreDays + suspensionPostDays;
        const extensionDays = extension.exists && extension.end?.date_start ? extension.days : 0;
        const totalCuraduriaDays = baseDaysCuraduria + totalSuspensionDays + extensionDays;
        
        let phase1UsedDays = ldfDate && acta1Date ? calculateUsedDaysFromNextDay(ldfDate, acta1Date) : 
                             (ldfDate ? calculateUsedDaysFromNextDay(ldfDate, today) : 0);

        // FASE 1
        let phase1Status = checkStatus(ldfDate, acta1Date);
        if (phase1Status === 'ACTIVO' && suspensionPreActa.isActive) phase1Status = 'PAUSADO';
        
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
                }, 
                secondary: { 
                    name: 'Solicitante', 
                    icon: 'fa-user', 
                    color: 'info', 
                    totalDays: VALLA_LIMIT_DAYS, 
                    usedDays: calculateUsedDaysFromNextDay(ldfDate, vallaDate), 
                    extraDays: 0, 
                    status: checkParallelStatus(ldfDate, vallaDate), 
                    taskDescription: 'Instalación de valla', 
                } 
            } 
        });

        const isCumple = checkCompliance(acta1?.desc);
        const notificaActa = estudioOptions.notificationType === 'notificar';

        // FASE 2 & 3 (Solo si NO CUMPLE)
        if (!isCumple) {
            if(notificaActa){
            addPhase({
              id: 'phase2', 
              title: 'Notificación Observaciones', 
              responsible: 'Curaduría',
              status: checkStatus(acta1Date, notificacionActa1Date), 
              totalDays: estudioOptions.byAviso ? 15 : 10,
              usedDays: calculateUsedDaysFromNextDay(acta1Date, notificacionActa1Date), 
              extraDays: 0,
              startDate: acta1Date, 
              endDate: notificacionActa1Date, 
              parallelActors: null,
            });}

            const hasProrrogaCorr = !!getClock(34)?.date_start;
            addPhase({
              id: 'phase3', 
              title: 'Correcciones del Solicitante', 
              responsible: 'Solicitante',
              status: checkStatus(notificacionActa1Date, corrDate), 
              totalDays: hasProrrogaCorr ? 45 : 30,
              usedDays: calculateUsedDaysFromNextDay(notificacionActa1Date, corrDate), 
              extraDays: 0,
              startDate: notificacionActa1Date, 
              endDate: corrDate, 
              parallelActors: null,
            });
        }

        // FASE 4: Revisión y Viabilidad
        let triggerDate = isCumple ? acta1Date : corrDate;
        let phase4AvailableDays = totalCuraduriaDays - phase1UsedDays;
        let phase4Status = checkStatus(triggerDate, viabilidadDate);
        if (phase4Status === 'ACTIVO' && suspensionPostActa.isActive) phase4Status = 'PAUSADO';

        addPhase({
          id: 'phase4', 
          title: 'Revisión y Viabilidad', 
          responsible: 'Curaduría', 
          status: phase4Status, 
          totalDays: Math.max(0, phase4AvailableDays), 
          usedDays: calculateUsedDaysFromNextDay(triggerDate, viabilidadDate), 
          extraDays: 0, 
          startDate: triggerDate, 
          endDate: viabilidadDate, 
          daysContext: { totalCuraduria: totalCuraduriaDays, usedInPhase1: phase1UsedDays, availableForPhase4: phase4AvailableDays },
          parallelActors: null,
        });

        const notificaVia = correccionesOptions.notificationType === 'notificar';

        // FASE 5: Notificación Viabilidad
        if(notificaVia){
            addPhase({
                id: 'phase5_notif',
                title: 'Notificación de Viabilidad',
                responsible: 'Curaduría',
                status: checkStatus(viabilidadDate, notificacionViaDate),
                totalDays: correccionesOptions.byAviso ? 15 : 10,
                usedDays: calculateUsedDaysFromNextDay(viabilidadDate, notificacionViaDate),
                extraDays: 0,
                startDate: viabilidadDate,
                endDate: notificacionViaDate,
                parallelActors: null
            });
        }

        // FASE 6: Liquidación y Pagos
        // >>> CORRECCIÓN: "cuando no se paga expensas tampoco debe esperarse la ultima fecha de pago a expensas"
        let phase6Status = checkStatus(notificacionViaDate, pagosDate);
        if (desistimientoVersion === '-4') phase6Status = 'COMPLETADO';

        addPhase({
            id: 'phase6_pagos',
            title: 'Liquidación y Pagos',
            responsible: 'Solicitante',
            status: phase6Status,
            totalDays: 30,
            usedDays: calculateUsedDaysFromNextDay(notificacionViaDate, pagosDate),
            extraDays: 0,
            startDate: notificacionViaDate,
            endDate: pagosDate,
            parallelActors: null
        });

        // >>> PUNTO DE BIFURCACIÓN PARA NO PAGA EXPENSAS (-4) <<<
        if (desistimientoVersion === '-4') {
            const dPhases = generateDesistimientoPhases('-4');
            dPhases.forEach(p => addPhase(p));
            // Detenemos aquí para no agregar fases de resolución normal
        } else {
            // --- FLUJO NORMAL FINAL ---
            
            // FASE 7: Resolución
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

            // FASE 8: Notificación Res
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

            // FASE 9: Ejecutoria y Recurso (Lógica Paralela Estándar)
            // ... (Lógica de cálculo de expiración de recurso mantenida del original) ...
            let recursoExpired = false;
            if (notificacionResDate && !recursoDate && !renunciaTerminos) {
                const recursoLimitDate = sumarDiasHabiles(notificacionResDate, RECURSO_LIMIT_DAYS);
                if (moment(today).isAfter(recursoLimitDate)) recursoExpired = true;
            }
            let ejecutoriaEndDate = ejecutoriaDate; //|| renunciaTerminos;
            if (recursoDate && !ejecutoriaDate && !renunciaTerminos) ejecutoriaEndDate = null; 
            if (recursoExpired && !ejecutoriaDate) ejecutoriaEndDate = sumarDiasHabiles(notificacionResDate, RECURSO_LIMIT_DAYS);

            let phase9Status = checkStatus(notificacionResDate, ejecutoriaEndDate);
            
            // Sub-estados para Actores Paralelos
            let ejecutoriaStatus = checkParallelStatus(notificacionResDate, ejecutoriaEndDate, phase9Status === 'ACTIVO');
            let recursoStatus = 'PENDIENTE';
            if (recursoDate) recursoStatus = 'COMPLETADO';
            else if (recursoExpired) recursoStatus = 'VENCIDO';
            else if (notificacionResDate && !renunciaTerminos) recursoStatus = 'ACTIVO';

            addPhase({
                id: 'phase9_exec',
                title: 'Ejecutoria y Recurso',
                responsible: 'Curaduría',
                status: phase9Status,
                totalDays: 10,
                usedDays: calculateUsedDaysFromNextDay(notificacionResDate, ejecutoriaEndDate),
                extraDays: 0,
                startDate: notificacionResDate,
                endDate: ejecutoriaEndDate,
                parallelActors: {
                    primary: {
                        name: 'Ejecutoria',
                        icon: 'fa-gavel',
                        color: 'primary',
                        totalDays: 10,
                        usedDays: calculateUsedDaysFromNextDay(notificacionResDate, ejecutoriaEndDate),
                        extraDays: 0,
                        status: ejecutoriaStatus,
                        taskDescription: 'Licencia queda en firme',
                    },
                    secondary: {
                        name: 'Recurso',
                        icon: 'fa-file-invoice',
                        color: 'info',
                        totalDays: 10,
                        usedDays: calculateUsedDaysFromNextDay(notificacionResDate, recursoDate || ejecutoriaEndDate),
                        extraDays: 0,
                        status: recursoStatus,
                        taskDescription: recursoDate ? 'Recurso presentado' : (recursoExpired ? 'Derecho agotado' : 'Plazo disponible'),
                    }
                }
            });

            // FASE 10: Entrega
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
        }
    }

    // Debug info
    phases.debugInfo = {
        system: { today, type: currentItem.type },
        desistimiento: { active: !!desistimientoVersion, version: desistimientoVersion }
    };

    return phases;
  }, [clocksData, currentItem, today, extension, suspensionPreActa, suspensionPostActa]);

  return processPhases;
};