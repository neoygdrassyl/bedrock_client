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
    const radDate = currentItem.date; // CAMBIO CLAVE: Esta es ahora nuestra fecha de inicio global
    const ldfDate = getClock(5)?.date_start;
    const vallaDate = getClock(503)?.date_start;
    
    // Fase 1 y Transición a Fase 3
    const acta1 = getClock(30);
    const acta1Date = acta1?.date_start;
    
    // Lógica dinámica para determinar el fin de la notificación/comunicación de observaciones
    let endOfNotification1Date = null;
    if (estudioOptions.notificationType === 'comunicar') {
        // Si es comunicar, usamos el reloj de comunicación (33 en config de comunicar) o el acta misma si no hay fecha aun
        endOfNotification1Date = getClock(33)?.date_start || acta1Date;
    } else {
        // Si es notificar, usamos personal (32) o aviso (33)
        endOfNotification1Date = estudioOptions.byAviso ? getClock(33)?.date_start : getClock(32)?.date_start;
    }

    const corrDate = getClock(35)?.date_start;
    
    // Viabilidad y Transición a Fase 6
    const viabilidadDate = getClock(61)?.date_start;
    
    // Lógica dinámica para determinar el fin de la notificación/comunicación de viabilidad
    let endOfNotificationViaDate = null;
    if (correccionesOptions.notificationType === 'comunicar') {
        // Si es comunicar, usamos el reloj de comunicación (57 en config comunicar) o la viabilidad misma
        endOfNotificationViaDate = getClock(57)?.date_start || viabilidadDate;
    } else {
        // Si es notificar, usamos personal (56) o aviso (57)
        endOfNotificationViaDate = correccionesOptions.byAviso ? getClock(57)?.date_start : getClock(56)?.date_start;
    }
    
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

    // Usamos 'today' (fecha del sistema/emulador) para calcular días usados si no hay fecha fin
    const calculateUsedDaysFromNextDay = (startDate, endDate, defaultEnd = today, include_today=false) => {
      if (!startDate) return 0;
      const calcEnd = endDate || defaultEnd;
      if (moment(calcEnd).isBefore(startDate)) return 0;
      let usedDays = calcularDiasHabiles(startDate, calcEnd, include_today);
      return usedDays;
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
    const generateDesistimientoPhases = (version) => {
        const dPhases = [];
        
        // Fechas Clave del Desistimiento
        const dStart = getClockVersion(-50, version)?.date_start; // Inicio (-50)
        const dRes = getClockVersion(-6, version)?.date_start;    // Resolución (-6)
        const dCitacion = getClockVersion(-5, version)?.date_start; // Citación (-5)
        const dNotifPersonal = getClockVersion(-7, version)?.date_start;
        const dNotifAviso = getClockVersion(-8, version)?.date_start;
        const dNotif = dNotifPersonal || dNotifAviso; 
        
        const dRecurso = getClockVersion(-10, version)?.date_start; 
        const dResRecurso = getClockVersion(-17, version)?.date_start; 
        
        const dNotifRecurso = getClockVersion(-22, version)?.date_start || getClockVersion(-21, version)?.date_start; 
        const dFinal = getClockVersion(-30, version)?.date_start; 

        // FASE D1: Resolución Desistida
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
            limitDate: dStart ? sumarDiasHabiles(dStart, 5) : null,
            parallelActors: null,
            highlightClass: 'phase-highlight-desist',
            relatedStates: [-50, -6],
        });

        // FASE D2: Notificación Resolución
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
            limitDate: startNotif ? sumarDiasHabiles(startNotif, 15) : null,
            parallelActors: null,
            highlightClass: 'phase-highlight-desist',
            relatedStates: [-5, -7, -8],
        });

        // FASE D3: Ejecutoria y Plazo Recurso
        let dEjecutoriaEnd = ejecutoriaDate || dRecurso; 
        if (!dRecurso && dFinal) dEjecutoriaEnd = dFinal; 

        const dPhase3Status = checkStatus(dNotif, dRecurso || (dFinal ? dFinal : null));
        
        let recursoStatus = 'PENDIENTE';
        if (dNotif && !dRecurso && !dFinal) recursoStatus = 'ACTIVO'; 
        if (dRecurso) recursoStatus = 'COMPLETADO';
        
        let ejecutoriaStatus = 'PENDIENTE';
        if (dNotif && !dFinal) ejecutoriaStatus = 'ACTIVO';
        if (dFinal || dRecurso) ejecutoriaStatus = 'COMPLETADO';

        dPhases.push({
            id: `desist_${version}_exec`,
            title: 'Ejecutoria y Recurso',
            responsible: 'Curaduría', 
            status: dPhase3Status,
            totalDays: 10,
            usedDays: calculateUsedDaysFromNextDay(dNotif, dRecurso || dEjecutoriaEnd),
            extraDays: 0,
            startDate: dNotif,
            endDate: dRecurso || dEjecutoriaEnd,
            limitDate: dNotif ? sumarDiasHabiles(dNotif, 10) : null,
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
                    endDate: dEjecutoriaEnd,
                    limitDate: dNotif ? sumarDiasHabiles(dNotif, 10) : null,
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
                    endDate: dRecurso,
                    limitDate: dNotif ? sumarDiasHabiles(dNotif, 10) : null,
                }
            },
            highlightClass: 'phase-highlight-desist',
            relatedStates: [-10],
        });

        if (dRecurso) {
            dPhases.push({
                id: `desist_${version}_res_rec`,
                title: 'Resolver Recurso de Reposición',
                responsible: 'Curaduría',
                status: checkStatus(dRecurso, dResRecurso),
                totalDays: 45, 
                usedDays: calculateUsedDaysFromNextDay(dRecurso, dResRecurso),
                extraDays: 0,
                startDate: dRecurso,
                endDate: dResRecurso,
                limitDate: dRecurso ? sumarDiasHabiles(dRecurso, 45) : null,
                parallelActors: null,
                highlightClass: 'phase-highlight-desist',
                relatedStates: [-17],
            });

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
                limitDate: dResRecurso ? sumarDiasHabiles(dResRecurso, 15) : null,
                parallelActors: null,
                highlightClass: 'phase-highlight-desist',
                relatedStates: [-20, -21, -22],
            });

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
                limitDate: dNotifRecurso ? sumarDiasHabiles(dNotifRecurso, 1) : null,
                parallelActors: null,
                highlightClass: 'phase-highlight-desist',
                relatedStates: [-30],
            });
        }

        return dPhases;
    };

    // --- 4. CONSTRUCCIÓN DEL FLUJO DE FASES ---
    let phases = [];
    const addPhase = (phase) => { 
        // CAMBIO CLAVE: El startPosition de cada fase ahora es la diferencia
        // en días hábiles desde la fecha de radicación inicial.
        if (phase.startDate && radDate) {
            phase.startPosition = calcularDiasHabiles(radDate, phase.startDate, false);
        } else {
            phase.startPosition = 0;
        }
        phases.push(phase); 
    };

    // FASE 0: Radicación 
    const skipPhase0 = ['-1', '-2'].includes(desistimientoVersion);
    
    addPhase({ 
        id: 'phase0', 
        title: 'Radicación de Legal y debida forma', 
        responsible: 'Solicitante', 
        status: skipPhase0 ? 'COMPLETADO' : checkStatus(radDate, ldfDate), 
        totalDays: 29, 
        usedDays: calculateUsedDaysFromNextDay(radDate, ldfDate),
        extraDays: 0, 
        startDate: radDate, 
        endDate: ldfDate, 
        limitDate: radDate ? sumarDiasHabiles(radDate, 29) : null,
        parallelActors: null,
        ganttBlockDays: 29,
        highlightClass: 'phase-highlight-radicacion',
        relatedStates: [false,3, -1, 5, 501, 502, 504],
    });

    // --- CASO 1: INCOMPLETO (-1) ---
    if (desistimientoVersion === '-1') {
        const dPhases = generateDesistimientoPhases('-1');
        dPhases.forEach(p => addPhase(p));
    }
    // --- CASO 2: VALLA INFORMATIVA (-2) ---
    else if (desistimientoVersion === '-2') {
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
            limitDate: ldfDate ? sumarDiasHabiles(ldfDate, baseDaysCuraduria) : null,
            parallelActors: {
                primary: { 
                    name: 'Curaduría', 
                    icon: 'fa-building', 
                    color: 'primary', 
                    totalDays: baseDaysCuraduria, 
                    usedDays: calculateUsedDaysFromNextDay(ldfDate, vallaDate || today), 
                    extraDays: 0, 
                    status: phase1Status, 
                    taskDescription: 'Revisión preliminar',
                    endDate: vallaDate,
                    limitDate: ldfDate ? sumarDiasHabiles(ldfDate, baseDaysCuraduria) : null,
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
                    endDate: vallaDate,
                    limitDate: ldfDate ? sumarDiasHabiles(ldfDate, VALLA_LIMIT_DAYS) : null,
                } 
            },
            highlightClass: 'phase-highlight-estudio',
            relatedStates: [503, 300, 350] 
        });

        const dPhases = generateDesistimientoPhases('-2');
        dPhases.forEach(p => addPhase(p));
    }
    // --- CASOS: NO CUMPLE (-3), VOLUNTARIO (-5), NEGADO (-6) ---
    else if (['-3', '-5', '-6'].includes(desistimientoVersion)) {
        // FASE 1: Estudio
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
            limitDate: ldfDate ? sumarDiasHabiles(ldfDate, totalCuraduriaDays) : null,
            parallelActors: null,
            highlightClass: 'phase-highlight-estudio',
            relatedStates: [503, 30, 300, 350, estudioOptions.notificationType !== 'notificar' ? 33 : null], 
        });

        // FASE 2: Notificación Observaciones (Solo si es notificar)
        if (estudioOptions.notificationType === 'notificar') {
            addPhase({
              id: 'phase2', 
              title: 'Notificación Observaciones', 
              responsible: 'Curaduría',
              status: checkStatus(acta1Date, endOfNotification1Date), 
              totalDays: 15,
              usedDays: calculateUsedDaysFromNextDay(acta1Date, endOfNotification1Date), 
              extraDays: 0,
              startDate: acta1Date, 
              endDate: endOfNotification1Date, 
              limitDate: acta1Date ? sumarDiasHabiles(acta1Date, 15) : null,
              parallelActors: null,
              highlightClass: 'phase-highlight-notificacion',
              relatedStates: [31, 32, 33],
            });
        }

        // FASE 3: Correcciones
        const hasProrrogaCorr = !!getClock(34)?.date_start;
        // La fecha de inicio de correcciones depende de si hubo notificación o comunicación
        const startPhase3 = endOfNotification1Date;
        let phase3Status = checkStatus(startPhase3, corrDate);
        if (['-3', '-5', '-6'].includes(desistimientoVersion)) phase3Status = 'COMPLETADO';

        addPhase({
          id: 'phase3', 
          title: 'Correcciones del Solicitante', 
          responsible: 'Solicitante',
          status: phase3Status, 
          totalDays: hasProrrogaCorr ? 45 : 30,
          usedDays: calculateUsedDaysFromNextDay(startPhase3, corrDate), 
          extraDays: 0,
          startDate: startPhase3, 
          endDate: corrDate, 
          limitDate: startPhase3 ? sumarDiasHabiles(startPhase3, hasProrrogaCorr ? 45 : 30) : null,
          parallelActors: null,
          highlightClass: 'phase-highlight-correcciones',
          relatedStates: [34, 35],
        });

        // FASE 4: Correcciones y Viabilidad (RENOMBRADA y DETENIDA AQUÍ)
        const startPhase4 = corrDate || startPhase3; 
        const endPhase4 = viabilidadDate || getClockVersion(-50, desistimientoVersion)?.date_start || today;
        let phase4Status = checkStatus(startPhase4, endPhase4);
        
        addPhase({
          id: 'phase4_desist', 
          title: 'Revisión y Viabilidad', 
          responsible: 'Curaduría', 
          status: phase4Status, 
          totalDays: Math.max(0, totalCuraduriaDays - phase1UsedDays), 
          usedDays: calculateUsedDaysFromNextDay(startPhase4, endPhase4), 
          extraDays: 0, 
          startDate: startPhase4, 
          endDate: endPhase4, 
          limitDate: startPhase4 ? sumarDiasHabiles(startPhase4, Math.max(0, totalCuraduriaDays - phase1UsedDays)) : null,
          parallelActors: null,
          highlightClass: 'phase-highlight-viabilidad',
          relatedStates: [49, 61, 301, 351, 400, 401],
        });

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
            limitDate: ldfDate ? sumarDiasHabiles(ldfDate, totalCuraduriaDays) : null,
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
                    endDate: acta1Date,
                    limitDate: ldfDate ? sumarDiasHabiles(ldfDate, totalCuraduriaDays) : null,
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
                    endDate: vallaDate,
                    limitDate: ldfDate ? sumarDiasHabiles(ldfDate, VALLA_LIMIT_DAYS) : null, 
                } 
            },
            highlightClass: 'phase-highlight-estudio',
            relatedStates: [503, 30, 300, 350, estudioOptions.notificationType !== 'notificar' ? 33 : null], 
        });

        const isCumple = checkCompliance(acta1?.desc);
        const notificaActa = estudioOptions.notificationType === 'notificar';

        // FASE 2 & 3 (Solo si NO CUMPLE)
        let startPhase3 = endOfNotification1Date;

        if (!isCumple) {
            // Si hay notificación, agregamos la fase intermedia
            if(notificaActa){
                addPhase({
                  id: 'phase2', 
                  title: 'Notificación Observaciones', 
                  responsible: 'Curaduría',
                  status: checkStatus(acta1Date, endOfNotification1Date), 
                  totalDays: estudioOptions.byAviso ? 15 : 10,
                  usedDays: calculateUsedDaysFromNextDay(acta1Date, endOfNotification1Date), 
                  extraDays: 0,
                  startDate: acta1Date, 
                  endDate: endOfNotification1Date, 
                  limitDate: acta1Date ? sumarDiasHabiles(acta1Date, estudioOptions.byAviso ? 15 : 10) : null,
                  parallelActors: null,
                  highlightClass: 'phase-highlight-notificacion',
                  relatedStates: [31, 32, 33],
                });
            } else {
                // Si es Comunicar, la fase 3 empieza tras el Acta
                startPhase3 = acta1Date;
            }

            const hasProrrogaCorr = !!getClock(34)?.date_start;
            addPhase({
              id: 'phase3', 
              title: 'Correcciones del Solicitante', 
              responsible: 'Solicitante',
              status: checkStatus(startPhase3, corrDate), 
              totalDays: hasProrrogaCorr ? 45 : 30,
              usedDays: calculateUsedDaysFromNextDay(startPhase3, corrDate), 
              extraDays: 0,
              startDate: startPhase3, 
              endDate: corrDate, 
              limitDate: startPhase3 ? sumarDiasHabiles(startPhase3, hasProrrogaCorr ? 45 : 30) : null,
              parallelActors: null,
              highlightClass: 'phase-highlight-correcciones',
              relatedStates: [34, 35],
            });
        }

        // FASE 4: Revisión y Viabilidad
        // Si CUMPLE, arrancamos tras el acta. Si no, tras la corrección.
        // OJO: Si NO CUMPLE y NO corrigió (desistimiento), esto ya se manejó arriba.
        // Aquí asumimos flujo normal.
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
          limitDate: triggerDate ? sumarDiasHabiles(triggerDate, Math.max(0, phase4AvailableDays)) : null,
          daysContext: { totalCuraduria: totalCuraduriaDays, usedInPhase1: phase1UsedDays, availableForPhase4: phase4AvailableDays },
          parallelActors: null,
          highlightClass: 'phase-highlight-viabilidad',
          relatedStates: [49, 61, 301, 351, 400, 401, correccionesOptions.notificationType !== 'notificar' ? 57 : null], 
        });

        const notificaVia = correccionesOptions.notificationType === 'notificar';

        // FASE 5: Notificación Viabilidad (Solo si es notificar)
        if(notificaVia){
            addPhase({
                id: 'phase5_notif',
                title: 'Notificación de Viabilidad',
                responsible: 'Curaduría',
                status: checkStatus(viabilidadDate, endOfNotificationViaDate),
                totalDays: correccionesOptions.byAviso ? 15 : 10,
                usedDays: calculateUsedDaysFromNextDay(viabilidadDate, endOfNotificationViaDate),
                extraDays: 0,
                startDate: viabilidadDate,
                endDate: endOfNotificationViaDate,
                limitDate: viabilidadDate ? sumarDiasHabiles(viabilidadDate, correccionesOptions.byAviso ? 15 : 10) : null,
                parallelActors: null,
                highlightClass: 'phase-highlight-notificacion',
                relatedStates: [55, 56, 57],
            });
        }

        // FASE 6: Liquidación y Pagos
        // Determinamos inicio: si hubo notificación, tras ella. Si hubo comunicación, tras ella o tras viabilidad.
        const startPhase6 = notificaVia ? endOfNotificationViaDate : (endOfNotificationViaDate || viabilidadDate);
        
        let phase6Status = checkStatus(startPhase6, pagosDate);
        if (desistimientoVersion === '-4') phase6Status = 'COMPLETADO';

        addPhase({
            id: 'phase6_pagos',
            title: 'Liquidación y Pagos',
            responsible: 'Solicitante',
            status: phase6Status,
            totalDays: 30,
            usedDays: calculateUsedDaysFromNextDay(startPhase6, pagosDate),
            extraDays: 0,
            startDate: startPhase6, 
            endDate: pagosDate,
            limitDate: startPhase6 ? sumarDiasHabiles(startPhase6, 30) : null,
            parallelActors: null,
            highlightClass: 'phase-highlight-pagos',
            relatedStates: [62, 63, 64, 65, 69],
        });

        // >>> PUNTO DE BIFURCACIÓN PARA NO PAGA EXPENSAS (-4) <<<
        if (desistimientoVersion === '-4') {
            const dPhases = generateDesistimientoPhases('-4');
            dPhases.forEach(p => addPhase(p));
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
                limitDate: pagosDate ? sumarDiasHabiles(pagosDate, 5) : null,
                parallelActors: null,
                highlightClass: 'phase-highlight-resolucion',
                relatedStates: [70],
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
                limitDate: resolucionDate ? sumarDiasHabiles(resolucionDate, 15) : null,
                parallelActors: null,
                highlightClass: 'phase-highlight-notificacion',
                relatedStates: [71, 72, 73, 731, 85],
            });

            // FASE 9: Ejecutoria y Recurso (Lógica Paralela Estándar)
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
                limitDate: notificacionResDate ? sumarDiasHabiles(notificacionResDate, 10) : null,
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
                        endDate: ejecutoriaEndDate,
                        limitDate: notificacionResDate ? sumarDiasHabiles(notificacionResDate, 10) : null,
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
                        endDate: recursoDate,
                        limitDate: notificacionResDate ? sumarDiasHabiles(notificacionResDate, 10) : null,
                    }
                },
                highlightClass: 'phase-highlight-recurso',
                relatedStates: [730, 74, 75, 751, 752, 733, 762, 76, 761, 99],
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
                limitDate: ejecutoriaDate ? sumarDiasHabiles(ejecutoriaDate, 1) : null,
                parallelActors: null,
                highlightClass: 'phase-highlight-entrega',
                relatedStates: [98],
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