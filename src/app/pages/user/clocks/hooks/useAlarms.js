import { useMemo } from 'react';
import moment from 'moment';
import { calculateLegalLimit, calculateScheduledLimitForDisplay } from '../utils/scheduleUtils';
import { ALARM_SUGGESTIONS, ALARM_THRESHOLD_DAYS } from '../config/alarms.definitions';
import { calcularDiasHabiles } from '../hooks/useClocksManager';

/**
 * Hook para generar y gestionar las alarmas del proceso.
 * @param {object} manager - El objeto principal de useClocksManager.
 * @param {object} scheduleConfig - La configuración de programación.
 * @param {array} clocksToShow - La lista de definiciones de clocks.
 * @param {string} systemDate - La fecha actual del sistema para los cálculos.
 * @returns {array} Una lista de objetos de alarma.
 */
export const useAlarms = (manager, scheduleConfig, clocksToShow, systemDate) => {
    const { curaduriaDetails, getClock, getClockVersion, phaseOptions } = manager;

    const alarms = useMemo(() => {
        const allAlarms = [];
        const today = moment(systemDate);

        // --- CONFIGURACIÓN DE NOTIFICACIÓN ---
        const estudioOptions = phaseOptions?.phase_estudio || { notificationType: 'notificar', byAviso: false };
        const correccionesOptions = phaseOptions?.phase_correcciones || { notificationType: 'notificar', byAviso: false };

        // --- ESTADOS DE NOTIFICACIÓN A EXCLUIR SEGÚN CONFIGURACIÓN ---
        const excludedStates = new Set();

        excludedStates.add(64); // Excluir estampilla PRO-UIS ya que la fecha de control es la rad. ultimo pago

        // Fase 2: Notificación Observaciones (States 31, 32, 33)
        if (estudioOptions.notificationType === 'comunicar') {
            excludedStates.add(31); // Citación
            excludedStates.add(32); // Notificación Personal
        } else if (estudioOptions.notificationType === 'notificar' && !estudioOptions.byAviso) {
            excludedStates.add(33); // Notificación por Aviso
        }

        // Fase 5: Notificación Viabilidad (States 55, 56, 57)
        if (correccionesOptions.notificationType === 'comunicar') {
            excludedStates.add(55); // Citación Viabilidad
            excludedStates.add(56); // Notificación Personal Viabilidad
        } else if (correccionesOptions.notificationType === 'notificar' && !correccionesOptions.byAviso) {
            excludedStates.add(57); // Notificación por Aviso Viabilidad
        }

        // --- Helper para verificar si un evento debe mostrarse ---
        const shouldShowEvent = (clockDef) => {
            // Si tiene la propiedad show === false, excluirlo
            if (clockDef.show === false) return false;
            
            // Si no tiene propiedad show, incluirlo por defecto
            return true;
        };

        // --- Helper para añadir alarmas evitando duplicados ---
        const addAlarm = (alarmData) => {
            const { state, type } = alarmData;
            const id = `${type}-${state}`;
            
            if (allAlarms.some(a => a.id === id)) return;

            const limitMoment = moment(alarmData.limitDate);
            if (!limitMoment.isValid()) return;
            
            const remainingDays = alarmData.remainingDays;
            const isOverdue = remainingDays < 0;
            const suggestionKey = isOverdue ? 'vencido' : 'porVencer';
            
            const suggestionDef = (ALARM_SUGGESTIONS[state] && ALARM_SUGGESTIONS[state][type])
                ? ALARM_SUGGESTIONS[state][type][suggestionKey]
                : (ALARM_SUGGESTIONS.default[type] ? ALARM_SUGGESTIONS.default[type][suggestionKey] : null);

            let severity = 'warning';
            if (isOverdue) severity = 'danger';
            if (remainingDays >= 0 && remainingDays <= 2) severity = 'danger';

            allAlarms.push({
                id,
                type: alarmData.type,
                typeLabel: alarmData.typeLabel,
                eventName: alarmData.eventName,
                state: alarmData.state,
                remainingDays,
                limitDate: limitMoment.format('DD/MM/YYYY'),
                suggestion: suggestionDef ? suggestionDef.suggestion : null,
                severity,
            });
        };

        // --- TIPO 1: ALARMAS LEGALES (CON FILTROS DINÁMICOS) ---
        clocksToShow.forEach(clockDef => {
            if (clockDef && (clockDef.hasLegalAlarm || clockDef.limit) && !clockDef.title) {
                
                // --- FILTRO 1: Verificar si el evento debe mostrarse ---
                if (!shouldShowEvent(clockDef)) {
                    return;
                }

                // --- FILTRO 2: Excluir eventos según configuración de notificación ---
                if (excludedStates.has(clockDef.state)) {
                    return;
                }

                // --- CASOS ESPECIALES: States duales (33 y 57) ---
                if (clockDef.state === 33) {
                    const shouldInclude33 = estudioOptions.notificationType === 'comunicar' || 
                                           (estudioOptions.notificationType === 'notificar' && estudioOptions.byAviso);
                    if (!shouldInclude33) return;
                }

                if (clockDef.state === 57) {
                    const shouldInclude57 = correccionesOptions.notificationType === 'comunicar' || 
                                           (correccionesOptions.notificationType === 'notificar' && correccionesOptions.byAviso);
                    if (!shouldInclude57) return;
                }

                const clock = clockDef.version !== undefined ? getClockVersion(clockDef.state, clockDef.version) : getClock(clockDef.state);
                const legalLimit = calculateLegalLimit(clockDef.state, clockDef, manager);

                if (!legalLimit) return;
                
                const limitMoment = moment(legalLimit);

                if (clock && clock.date_start) {
                    // --- EVENTO COMPLETADO: VERIFICAR SI HUBO RETRASO ---
                    const completionDate = moment(clock.date_start);
                    if (completionDate.isAfter(limitMoment, 'day')) {
                        const delayDays = calcularDiasHabiles(limitMoment.toDate(), completionDate.toDate());
                        addAlarm({
                            state: clockDef.state,
                            type: 'legal',
                            typeLabel: 'Legal',
                            eventName: clockDef.name,
                            limitDate: legalLimit,
                            remainingDays: -delayDays,
                        });
                    }
                } else {
                    // --- EVENTO PENDIENTE: VERIFICAR SI ESTÁ PRÓXIMO A VENCER ---
                    const remaining = limitMoment.diff(today, 'days');
                    if (remaining <= ALARM_THRESHOLD_DAYS.legal) {
                        addAlarm({
                            state: clockDef.state,
                            type: 'legal',
                            typeLabel: 'Legal',
                            eventName: clockDef.name,
                            limitDate: legalLimit,
                            remainingDays: remaining,
                        });
                    }
                }
            }
        });

        // --- TIPO 2: ALARMAS DE PROGRAMACIÓN (con filtros dinámicos) ---
        if (scheduleConfig && scheduleConfig.times) {
            Object.keys(scheduleConfig.times).forEach(stateStr => {
                const state = Number(stateStr);
                
                const clockDef = clocksToShow.find(c => c.state === state);
                
                // --- FILTRO 1: Verificar si el evento debe mostrarse ---
                if (!clockDef || !shouldShowEvent(clockDef)) return;
                
                // --- FILTRO 2: Excluir eventos según configuración de notificación ---
                if (excludedStates.has(state)) return;
                
                // --- CASOS ESPECIALES: States duales ---
                if (state === 33) {
                    const shouldInclude33 = estudioOptions.notificationType === 'comunicar' || 
                                           (estudioOptions.notificationType === 'notificar' && estudioOptions.byAviso);
                    if (!shouldInclude33) return;
                }
                if (state === 57) {
                    const shouldInclude57 = correccionesOptions.notificationType === 'comunicar' || 
                                           (correccionesOptions.notificationType === 'notificar' && correccionesOptions.byAviso);
                    if (!shouldInclude57) return;
                }

                const clock = getClock(state);

                if (clockDef && (!clock || !clock.date_start)) {
                    const scheduledData = calculateScheduledLimitForDisplay(state, clockDef, clock, scheduleConfig, getClock, getClockVersion, manager);
                    
                    if (scheduledData && scheduledData.limitDate) {
                        const remaining = moment(scheduledData.limitDate).diff(today, 'days');
                        if (remaining <= ALARM_THRESHOLD_DAYS.scheduled) {
                            addAlarm({
                                state: state,
                                type: 'scheduled',
                                typeLabel: 'Programado',
                                eventName: clockDef.name,
                                limitDate: scheduledData.limitDate,
                                remainingDays: remaining,
                            });
                        }
                    }
                }
            });
        }
        
        // --- TIPO 3: ALARMA DE PROCESO GENERAL ---
        const { status, remaining, activePhaseName } = curaduriaDetails;
        if ((status === 'ACTIVO' || status === 'VENCIDO') && remaining <= ALARM_THRESHOLD_DAYS.process) {
            const isOverdue = remaining < 0;
            const suggestionKey = isOverdue ? 'vencido' : 'porVencer';
            const suggestionDef = ALARM_SUGGESTIONS.process[suggestionKey];
            
            allAlarms.push({
                id: 'process-general',
                type: 'process',
                typeLabel: 'Proceso',
                eventName: activePhaseName,
                state: 'process',
                remainingDays: remaining,
                limitDate: moment(systemDate).add(remaining, 'days').format('DD/MM/YYYY'),
                suggestion: suggestionDef.suggestion,
                severity: isOverdue ? 'danger' : 'warning',
            });
        }

        return allAlarms.sort((a, b) => a.remainingDays - b.remainingDays);

    }, [manager, scheduleConfig, clocksToShow, systemDate, curaduriaDetails, getClock, getClockVersion, phaseOptions]);

    return alarms;
};