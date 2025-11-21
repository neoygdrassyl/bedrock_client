import { useMemo } from 'react';
import moment from 'moment';
import { calcularDiasHabiles, FUN_0_TYPE_TIME } from './useClocksManager'; // Importamos helpers y constantes

/**
 * Hook dedicado a calcular y devolver el estado de cada fase del proceso de curaduría.
 * @param {object} params - Parámetros de entrada para el cálculo.
 * @param {Array} params.clocksData - Array de todos los eventos (clocks) del expediente.
 * @param {object} params.currentItem - El item principal del expediente.
 * @param {string} params.today - La fecha del sistema (puede ser la real o la del "viaje en el tiempo").
 * @param {object} params.suspensionPreActa - Datos de la suspensión pre-acta.
 * @param {object} params.suspensionPostActa - Datos de la suspensión post-acta.
 * @param {object} params.extension - Datos de la prórroga por complejidad.
 * @returns {Array} - Un array de objetos, donde cada objeto representa una fase del proceso.
 */
export const useProcessPhases = ({ clocksData, currentItem, today, suspensionPreActa, suspensionPostActa, extension }) => {

  const processPhases = useMemo(() => {
    // --- OBTENER FECHAS CLAVE ---
    const getClock = (state) => (clocksData || []).find(c => String(c.state) === String(state)) || null;
    const getNewestDate = (states) => {
        let newestDate = null;
        states.forEach((state) => {
            const clock = getClock(state);
            const date = clock?.date_start;
            if (date && (!newestDate || moment(date).isAfter(newestDate))) {
                newestDate = date;
            }
        });
        return newestDate;
    };

    const radicacionDate = currentItem.date;
    const ldfDate = getClock(5)?.date_start;
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

    const baseDaysCuraduria = FUN_0_TYPE_TIME[currentItem.type] ?? 45;
    let phases = [];
    let isProcessActive = true; 

    // Helper para determinar el estado de una fase de forma secuencial
    const checkStatus = (startDate, endDate) => {
        if (!startDate) return 'PENDIENTE';
        if (endDate) return 'COMPLETADO';
        if (isProcessActive) {
            isProcessActive = false; // La primera fase sin fin es la activa
            return 'ACTIVO';
        }
        return 'PENDIENTE'; // Si ya hay una activa, las siguientes quedan pendientes
    };
    
    // --- FASE 0: Radicación y Documentación (Plazo Solicitante) ---
    phases.push({
      id: 'phase0', title: 'Radicación y Documentación', responsible: 'Solicitante',
      status: checkStatus(radicacionDate, ldfDate),
      totalDays: 30, usedDays: radicacionDate ? calcularDiasHabiles(radicacionDate, ldfDate || today) : 0,
      extraDays: 0, startDate: radicacionDate, endDate: ldfDate,
    });

    // --- FASE 1: Estudio y Observaciones (Plazo Curaduría) ---
    let phase1Used = 0, phase1Extra = 0, phase1Status = checkStatus(ldfDate, acta1Date);
    if (phase1Status === 'ACTIVO') {
      const endPoint = suspensionPreActa.isActive ? suspensionPreActa.start.date_start : today;
      phase1Used = calcularDiasHabiles(ldfDate, endPoint);
      if (suspensionPreActa.isActive) phase1Status = 'PAUSADO';
    } else if (phase1Status === 'COMPLETADO') {
      phase1Used = calcularDiasHabiles(ldfDate, acta1Date);
    }
    if (extension.exists && (!acta1Date || moment(extension.start.date_start).isBefore(acta1Date))) phase1Extra += extension.days;
    if (suspensionPreActa.exists) phase1Extra += suspensionPreActa.days;
    phases.push({
      id: 'phase1', title: 'Estudio y Observaciones', responsible: 'Curaduría',
      status: phase1Status, totalDays: baseDaysCuraduria, usedDays: phase1Used,
      extraDays: phase1Extra, startDate: ldfDate, endDate: acta1Date,
    });
    
    // --- FASE 2: Notificación de Observaciones (Plazo Administrativo) ---
    phases.push({
      id: 'phase2', title: 'Notificación Observaciones', responsible: 'Curaduría',
      status: checkStatus(acta1Date, notificacionActa1Date),
      totalDays: 10, usedDays: acta1Date ? calcularDiasHabiles(acta1Date, notificacionActa1Date || today) : 0,
      extraDays: 0, startDate: acta1Date, endDate: notificacionActa1Date,
    });

    // --- FASE 3: Correcciones (Plazo Solicitante) ---
    const hasProrrogaCorr = !!getClock(34)?.date_start;
    let phase3Status = 'PENDIENTE', phase3Used = 0;
    if (acta1?.desc?.includes('NO CUMPLE')) {
        phase3Status = checkStatus(notificacionActa1Date, corrDate);
        if(phase3Status === 'ACTIVO') phase3Used = calcularDiasHabiles(notificacionActa1Date, today);
        else if (phase3Status === 'COMPLETADO') phase3Used = calcularDiasHabiles(notificacionActa1Date, corrDate);
    }
    phases.push({
        id: 'phase3', title: 'Correcciones del Solicitante', responsible: 'Solicitante',
        status: phase3Status, totalDays: hasProrrogaCorr ? 30 + 15 : 30, usedDays: phase3Used, 
        extraDays: 0, startDate: notificacionActa1Date, endDate: corrDate,
    });

    // --- FASE 4: Revisión y Viabilidad (Plazo Curaduría) ---
    const phase4StartDate = corrDate || (acta1Date && !acta1.desc?.includes('NO CUMPLE') ? acta1Date : null);
    let phase4Status = checkStatus(phase4StartDate, viabilidadDate), phase4Used = 0, phase4Extra = phase1Extra;
    if(phase4Status === 'ACTIVO' || phase4Status === 'COMPLETADO'){
        const phase1RealUsed = acta1Date ? calcularDiasHabiles(ldfDate, acta1Date) : 0;
        const endPoint = viabilidadDate || (suspensionPostActa.isActive ? suspensionPostActa.start.date_start : today);
        phase4Used = phase1RealUsed + (corrDate ? calcularDiasHabiles(corrDate, endPoint) : 0);
        if(phase4Status === 'ACTIVO' && suspensionPostActa.isActive) phase4Status = 'PAUSADO';
    }
    if (suspensionPostActa.exists) phase4Extra += suspensionPostActa.days;
    phases.push({
        id: 'phase4', title: 'Revisión y Viabilidad', responsible: 'Curaduría',
        status: phase4Status, totalDays: baseDaysCuraduria, usedDays: phase4Used, extraDays: phase4Extra, 
        startDate: phase4StartDate, endDate: viabilidadDate,
    });
    
    // --- FASE 5: Pagos y Liquidación (Plazo Solicitante) ---
    phases.push({
        id: 'phase5', title: 'Liquidación y Pagos', responsible: 'Solicitante',
        status: checkStatus(notificacionViaDate, pagosDate),
        totalDays: 30, usedDays: notificacionViaDate ? calcularDiasHabiles(notificacionViaDate, pagosDate || today) : 0, 
        extraDays: 0, startDate: notificacionViaDate, endDate: pagosDate,
    });

    // --- FASE 6: Resolución (Plazo Curaduría) ---
    phases.push({
        id: 'phase6', title: 'Generación de Resolución', responsible: 'Curaduría',
        status: checkStatus(pagosDate, resolucionDate),
        totalDays: 5, usedDays: pagosDate ? calcularDiasHabiles(pagosDate, resolucionDate || today) : 0, 
        extraDays: 0, startDate: pagosDate, endDate: resolucionDate,
    });
    
    // --- FASE 7: Ejecutoria (Plazo Mixto) ---
    const notificacionResDate = getNewestDate([72, 73]);
    const renunciaTerminos = getClock(730)?.date_start;
    const phase7EndDate = ejecutoriaDate || renunciaTerminos;
    phases.push({
        id: 'phase7', title: 'Ejecutoria de Licencia', responsible: 'Mixto',
        status: checkStatus(notificacionResDate, phase7EndDate),
        totalDays: 10, usedDays: notificacionResDate ? calcularDiasHabiles(notificacionResDate, phase7EndDate || today) : 0, 
        extraDays: 0, startDate: notificacionResDate, endDate: phase7EndDate,
    });

    // --- FASE 8: Entrega (Plazo Curaduría) ---
    phases.push({
        id: 'phase8', title: 'Entrega de Licencia', responsible: 'Curaduría',
        status: checkStatus(ejecutoriaDate, entregaDate),
        totalDays: 1, usedDays: ejecutoriaDate ? calcularDiasHabiles(ejecutoriaDate, entregaDate || today) : 0, 
        extraDays: 0, startDate: ejecutoriaDate, endDate: entregaDate,
    });
    
    return phases;

  }, [clocksData, currentItem, today, extension, suspensionPreActa, suspensionPostActa]);

  return processPhases;
};