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
    const { curaduriaDetails, getClock, getClockVersion } = manager;

    const alarms = useMemo(() => {
        const allAlarms = [];
        const today = moment(systemDate);

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

        // --- TIPO 1: ALARMAS LEGALES ---
        clocksToShow.forEach(clockDef => {
            if (clockDef && (clockDef.hasLegalAlarm || clockDef.limit) && !clockDef.title) {
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
                            remainingDays: -delayDays, // Representa el retraso como días "vencidos"
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

        // --- TIPO 2: ALARMAS DE PROGRAMACIÓN ---
        if (scheduleConfig && scheduleConfig.times) {
            Object.keys(scheduleConfig.times).forEach(stateStr => {
                const state = Number(stateStr);
                const clockDef = clocksToShow.find(c => c.state === state);
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

    }, [manager, scheduleConfig, clocksToShow, systemDate, curaduriaDetails, getClock, getClockVersion]);

    return alarms;
};