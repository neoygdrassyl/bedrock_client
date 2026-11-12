import React, { useState, useCallback, memo } from 'react';
import dayjs from 'dayjs';
import { calcularDiasHabiles, sumarDiasHabiles } from '../hooks/useClocksManager';
import { calculateScheduledLimitForDisplay } from '../utils/scheduleUtils';
import { isClockRowHidden } from '../utils/clockRows';
import { cn } from '@/shared/lib/utils';
import { Icon } from '@/shared/components/icon';
import { swalFormDialog } from '../../../../shared/utils/swalAdapter';
import { getIconSvg } from '../../../../shared/utils/iconSvgString';

// --- Anchos de columna centralizados ---
export const DEFAULT_CLOCK_COLUMN_VISIBILITY = {
    scheduledLimit: false,
    scheduledAlarm: false,
    nextStep: false,
};

// The event column includes the 16px left padding of the row.
export const CLOCK_COLUMN_WIDTHS = {
    EVENT: 316,
    DATE: 172,
    LEGAL_LIMIT: 168,
    LEGAL_ALARM: 216,
    SCHEDULED_LIMIT: 168,
    SCHEDULED_ALARM: 216,
    NEXT_STEP: 232,
};

// Widest the event column grows; beyond it the dates would drift away from the names.
const EVENT_COLUMN_MAX = '37rem';

const px = (value) => `${value}px`;

const OPTIONAL_COLUMNS = [
    { key: 'scheduledLimit', label: 'Límite programado', width: CLOCK_COLUMN_WIDTHS.SCHEDULED_LIMIT },
    { key: 'scheduledAlarm', label: 'Alarma programada', width: CLOCK_COLUMN_WIDTHS.SCHEDULED_ALARM },
    { key: 'nextStep', label: 'Siguiente paso', width: CLOCK_COLUMN_WIDTHS.NEXT_STEP },
];

const visibleOptionalColumns = (visibleColumns) => OPTIONAL_COLUMNS.filter((column) => visibleColumns[column.key]);

/**
 * The one column grid of the events table. The table root sets it as `--tc-cols`; the
 * header, the group headers and every event row lay out with that same template, so a
 * column starts at the same x in all of them. The last column takes the free width.
 */
export const getClockGridTemplate = (visibleColumns = DEFAULT_CLOCK_COLUMN_VISIBILITY) => {
    const fixed = [CLOCK_COLUMN_WIDTHS.DATE, CLOCK_COLUMN_WIDTHS.LEGAL_LIMIT, CLOCK_COLUMN_WIDTHS.LEGAL_ALARM, ...visibleOptionalColumns(visibleColumns).map((column) => column.width)];
    const last = fixed.pop();
    return [`minmax(${px(CLOCK_COLUMN_WIDTHS.EVENT)}, ${EVENT_COLUMN_MAX})`, ...fixed.map(px), `minmax(${px(last)}, 1fr)`].join(' ');
};

export const getClockColumnCount = (visibleColumns = DEFAULT_CLOCK_COLUMN_VISIBILITY) => 4 + visibleOptionalColumns(visibleColumns).length;

const DATE_TEXT_CLASS = 'font-mono tabular-nums';
// States whose legal limit is derived from an earlier event (see calculateLegalData).
const DERIVED_LIMIT_STATES = [30, 49, 61, 350, 351, 401];

// Kept here for the callers that import it from the row module.
export { isClockRowHidden };

const isEpochSentinel = (value) => {
    if (value === 0 || value === 1 || value === '0' || value === '1') return true;
    return value instanceof Date && value.getTime() <= 1;
};

export const formatClockDate = (value) => {
    if (!value || isEpochSentinel(value)) return '- -';
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.format('DD/MM/YYYY') : '- -';
};

export const getClockRowAlarmInfo = ({ state, isCompleted, hasAdministrativeAct }) => {
    if (state !== 504) return null;
    if (isCompleted) return { text: 'A tiempo', color: 'var(--ew-success-text, hsl(var(--accent)))', icon: 'Check' };
    if (hasAdministrativeAct) return { text: 'Vencida', color: 'var(--ew-danger-text, hsl(var(--destructive)))', icon: 'XCircle' };
    return { text: 'Pendiente', color: 'var(--ew-warning-text, hsl(var(--warning)))', icon: 'Hourglass' };
};

/** Minimum width of the table: below it the scroller scrolls horizontally. */
export const getClockTableWidth = (visibleColumns = DEFAULT_CLOCK_COLUMN_VISIBILITY) => (
    CLOCK_COLUMN_WIDTHS.EVENT
    + CLOCK_COLUMN_WIDTHS.DATE
    + CLOCK_COLUMN_WIDTHS.LEGAL_LIMIT
    + CLOCK_COLUMN_WIDTHS.LEGAL_ALARM
    + visibleOptionalColumns(visibleColumns).reduce((total, column) => total + column.width, 0)
);

export const ClockTableHeader = ({ visibleColumns = DEFAULT_CLOCK_COLUMN_VISIBILITY }) => (
    <div role="row" className="tc-head">
        <div role="columnheader" className="tc-cell tc-cell-event">
            <span className="tc-row-slot" aria-hidden="true" />
            <span>Evento</span>
        </div>
        <div role="columnheader" className="tc-cell tc-cell-date">Fecha</div>
        <div role="columnheader" className="tc-cell">Límite legal</div>
        <div role="columnheader" className="tc-cell">
            <span>Estado <span className="font-normal">(alarma legal)</span></span>
        </div>
        {visibleOptionalColumns(visibleColumns).map((column) => (
            <div role="columnheader" className="tc-cell" key={column.key}>{column.label}</div>
        ))}
    </div>
);


// Componente ClockRow memoizado para evitar re-renders innecesarios
export const ClockRow = memo((props) => {
    const {
        value,
        i,
        clock,
        onSave,
        onDelete,
        helpers,
        scheduleConfig,
        systemDate,
        isHighlighted,
        visibleColumns = DEFAULT_CLOCK_COLUMN_VISIBILITY,
        onDateDraftChange,
        // Process finished (see workspace/expedientePendingStatus): an event without a date
        // is a pending record, not a running legal term.
        processFinished = false,
        // One of the pending records of that finished process (the events that keep a phase open).
        isPendingRecord = false,
        isFlashed = false,
    } = props;
    const { getClock, getClockVersion, FUN_0_TYPE_TIME, suspensionPreActa, suspensionPostActa, extension, currentItem, calculateDaysSpent, viaTime } = helpers;

    // Resolver reloj según versión - memoizado
    const getClockScoped = useCallback((state) => {
        if (value.version !== undefined) {
            return getClockVersion(state, value.version) || getClock(state);
        }
        return getClock(state);
    }, [value.version, getClockVersion, getClock]);

    // SOLUCIÓN: Estado local para el input de fecha - evita re-renders del padre
    const originalDate = clock?.date_start ?? value.manualDate ?? '';
    const [localDateValue, setLocalDateValue] = useState(originalDate);
    
    // Sincronizar estado local cuando cambian las props (solo si es diferente)
    React.useEffect(() => {
        const newDate = clock?.date_start ?? value.manualDate ?? '';
        if (newDate !== localDateValue) {
            setLocalDateValue(newDate);
        }
    }, [clock?.date_start, value.manualDate]); // No incluir localDateValue para evitar ciclos

    // SOLUCIÓN: Handler para cambios en el input de fecha - DEBE estar antes de cualquier return
    const handleDateChange = useCallback((e) => {
        const nextDate = e.target.value;
        setLocalDateValue(nextDate);
        onDateDraftChange?.(value, i, nextDate, originalDate);
    }, [i, onDateDraftChange, originalDate, value]);
    
    // SOLUCIÓN: Handler para guardar solo cuando hay cambios reales - DEBE estar antes de cualquier return
    const handleDateBlur = useCallback(() => {
        const originalDate = clock?.date_start ?? value.manualDate ?? '';
        // Solo guardar si el valor realmente cambió
        if (localDateValue !== originalDate) {
            onSave(value, i, localDateValue);
        }
    }, [localDateValue, clock?.date_start, value, i, onSave]);

    // Formateador textual MODIFICADO para usar formato de fecha corta (L)
    const formatDate = formatClockDate;

    // =====================================================
    // CÁLCULO DE ICONOS Y ESTADOS (SEMÁFORO)
    // =====================================================
    const getRowIcon = () => {
        const currentDate = clock?.date_start ?? value.manualDate;
        
        if (currentDate) {
            return <Icon name="check-circle" size={16} style={{ color: 'var(--ew-success-text, hsl(var(--accent)))', fontSize: '0.9rem' }} />;
        }
        
        if (value.requiredClock && !getClockScoped(value.requiredClock)?.date_start) {
             return <Icon name="minus-circle" size={16} style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.9rem' }} />;
        }

        // Finished process: only the pending records keep the "waiting" mark.
        if (processFinished && !isPendingRecord) {
            return <Icon name="minus-circle" size={16} style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.9rem' }} />;
        }

        return <Icon name="clock" size={16} style={{ color: 'hsl(var(--warning))', fontSize: '0.9rem' }} />;
    };


    // =====================================================
    // CÁLCULO DE LÍMITES LEGALES (Incluyendo tu corrección de -1 día)
    // =====================================================
    const calculateLegalData = () => {
        let limitDate = null;
        let tooltip = '';
        let baseDate = null; 

        // --- Lógica Especial para Suspensiones (350/351) ---
        if (value.state === 350 || value.state === 351) {
            const isEndPre = value.state === 350;
            const thisSusp = isEndPre ? suspensionPreActa : suspensionPostActa;
            if (thisSusp.start?.date_start) {
                baseDate = thisSusp.start.date_start;
                const otherUsedDays = isEndPre 
                ? (suspensionPostActa.end?.date_start ? suspensionPostActa.days : 0)
                : (suspensionPreActa.end?.date_start ? suspensionPreActa.days : 0);
                
                const availableForThis = 10 - otherUsedDays;
                
                // Corrección: Inclusivo, restamos 1 día
                const daysToAdd = Math.max(0, availableForThis - 1);
                
                limitDate = sumarDiasHabiles(thisSusp.start.date_start, daysToAdd);
                tooltip = `Suspensión: Máximo ${availableForThis} días hábiles (Inclusivo)`;
            }
        }

        else if (value.state === 504){
            // State 504 is binary and has no fixed legal deadline.
            limitDate = null;
        }
        // --- Lógica Especial para Prórroga (401) ---
        else if (value.state === 401) {
             const startExt = getClockScoped(400)?.date_start;
             let extDuration = 0;
             if (value.limit && Array.isArray(value.limit) && value.limit[0] && typeof value.limit[0][1] === 'number') {
                 extDuration = value.limit[0][1];
             } else {
                 extDuration = 22; 
             }

             if (startExt) {
                 baseDate = startExt;
                 // Corrección: Inclusivo, restamos 1 día
                 const daysToAdd = Math.max(0, extDuration - 1); 
                 limitDate = sumarDiasHabiles(startExt, daysToAdd);
                 tooltip = `Prórroga: ${extDuration} días hábiles (Inclusivo)`;
             }
        }
        else if (value.state === 30) {
            const ldf = getClockScoped(5)?.date_start;
            if (ldf) {
                baseDate = ldf;
                const baseDays = FUN_0_TYPE_TIME[currentItem.type] ?? 45;
                let totalDays = baseDays;
                if (suspensionPreActa.exists && suspensionPreActa.end?.date_start) totalDays += suspensionPreActa.days;
                if (extension.exists && extension.end?.date_start && !extension.isActive) {
                    const acta1Date = getClockScoped(30)?.date_start;
                    if (!acta1Date || dayjs(extension.start.date_start).isBefore(acta1Date)) totalDays += extension.days;
                }
                limitDate = sumarDiasHabiles(ldf, totalDays);
                tooltip = `Acta 1: ${totalDays} días hábiles desde LDF`;
            }
        } 
        else if (value.state === 49 || value.state === 61) {
             const ldf = getClockScoped(5)?.date_start;
             if (ldf) {
                 const acta1 = getClockScoped(30);
                 const isCumple = acta1?.desc?.includes("ACTA PARTE 1 OBSERVACIONES: CUMPLE");
                 const hasActa = !!acta1?.date_start;
                 const corrDate = getClockScoped(35)?.date_start;

                 if (value.state === 61 && isCumple) {
                     const notif = getClockScoped(32)?.date_start || getClockScoped(33)?.date_start;
                     if (notif) {
                         baseDate = notif;
                         limitDate = sumarDiasHabiles(notif, viaTime);
                         tooltip = `Viabilidad (Cumple): Notificación + ${viaTime} días`;
                     }
                 } else if (isCumple || !hasActa) {
                     baseDate = acta1?.date_start || ldf; 
                     limitDate = sumarDiasHabiles(acta1?.date_start || ldf, viaTime);
                     tooltip = `Viabilidad (Proyección): Acta 1 + ${viaTime} días`;
                 } else if (hasActa && !isCumple && corrDate) {
                     baseDate = corrDate;
                     limitDate = sumarDiasHabiles(corrDate, viaTime);
                     tooltip = `Viabilidad (Correcciones): Radicación + ${viaTime} días`;
                 }
             }
        }
        else if (value.limit) {
            const resolveLimit = (cfg) => {
                if (!Array.isArray(cfg)) return null;
                if (typeof cfg[1] === 'number') {
                    const [states, days] = cfg;
                    const startStates = Array.isArray(states) ? states : [states];
                    for (const st of startStates) {
                        const c = getClockScoped(st);
                        if (c?.date_start) {
                            baseDate = c.date_start; 
                            return sumarDiasHabiles(c.date_start, days);
                        }
                    }
                    return null;
                }
                for (const opt of cfg) {
                    const res = resolveLimit(opt);
                    if (res) return res;
                }
                return null;
            }
            limitDate = resolveLimit(value.limit);
        }

        const spentDaysResult = calculateDaysSpent(value, clock);
        let spentText = '';
        if (spentDaysResult) {
            const { days } = spentDaysResult;
            spentText = `${days} días`;
        }

        return { limitDate, tooltip, spentText, baseDate };
    };

    const legalData = calculateLegalData();
    const scheduledData = (() => {
        if (!scheduleConfig || !scheduleConfig.times || !scheduleConfig.times[value.state]) return null;
        return calculateScheduledLimitForDisplay(value.state, value, clock, scheduleConfig, getClock, getClockVersion, helpers);
    })();

    // =====================================================
    // CÁLCULO DE ALARMA (USANDO LÍMITES LEGALES)
    // =====================================================
    const getAlarmInfo = () => {
        const isCompleted = !!clock?.date_start;
        const state = value.state;

        // Presentation only: in a finished process an event without a date is listed as a
        // pending record; its limit stays visible in the "Límite legal" column and here as the tooltip.
        // Only the events counted as pending records read "Pendiente por registrar"; any other
        // event without a date (optional, or of a phase that did close) just has no record.
        const pendingInfo = (title) => (isPendingRecord
            ? { text: 'Pendiente por registrar', color: 'var(--ew-warning-text, hsl(var(--warning)))', icon: 'Hourglass', title }
            : { text: 'Sin registro', color: 'var(--tc-text-3, hsl(var(--muted-foreground)))', icon: null, title });

        if (state === 504) {
            if (processFinished && !isCompleted) return pendingInfo('Sin plazo fijo · sin registro');
            const actoAdministrativo = getClock(70);
            return getClockRowAlarmInfo({
                state,
                isCompleted,
                hasAdministrativeAct: !!actoAdministrativo?.date_start,
            });
        }

        if (!legalData || !legalData.limitDate) return null;
        const { limitDate } = legalData;
        if (processFinished && !isCompleted && !(state === 34 && getClock(35)?.date_start)) {
            return pendingInfo(`Límite legal ${formatDate(limitDate)} · sin registro`);
        }
        const limitMoment = dayjs(limitDate);
        const today = dayjs(systemDate);

        if (state === 34 && getClock(35)?.date_start){
            let text = '';
            let color = '';
            let icon = null;
            return { text, color, icon };
        }

        // --- LÓGICA ESTÁNDAR ---
        let text = '';
        let color = '';
        let icon = null;

        if (isCompleted) {
            const completionDate = dayjs(clock.date_start);
            
            if (completionDate.isAfter(limitMoment, 'day')) {
                // CORRECCIÓN: Usar formato string YYYY-MM-DD para evitar problemas de timezone
                const delayDays = calcularDiasHabiles(limitMoment.format('YYYY-MM-DD'), completionDate.format('YYYY-MM-DD'));
                text = `Retraso de ${delayDays} día(s)`;
                color = 'var(--ew-danger-text, hsl(var(--destructive)))';
                icon = 'AlertCircle';
            } else {
                text = `A tiempo`;
                color = 'var(--ew-success-text, hsl(var(--accent)))';
                icon = 'Check';
            }
        } else {
            const isOverdue = today.isAfter(limitMoment, 'day');
            
            if (isOverdue) {
                // CORRECCIÓN: Usar formato string YYYY-MM-DD para evitar problemas de timezone
                const overdueDays = calcularDiasHabiles(limitMoment.format('YYYY-MM-DD'), today.format('YYYY-MM-DD'));
                text = `Vencido por ${overdueDays} día(s)`;
                color = 'var(--ew-danger-text, hsl(var(--destructive)))';
                icon = 'AlertCircle';
            } else {
                // CORRECCIÓN: Usar formato string YYYY-MM-DD para evitar problemas de timezone
                const remainingDays = calcularDiasHabiles(today.format('YYYY-MM-DD'), limitMoment.format('YYYY-MM-DD'));
                text = `${remainingDays} día(s) restante(s)`;
                color = 'var(--ew-warning-text, hsl(var(--warning)))';
                icon = 'Hourglass';
                
                if (remainingDays <= 2) {
                    color = 'var(--ew-danger-text, hsl(var(--destructive)))';
                    icon = 'AlertTriangle';
                }
            }
        }
        return { text, color, icon };
    };
    
    const alarmInfo = getAlarmInfo();

    const renderStatus = (info) => (
        <span className="tc-status" style={{ color: info.color }} title={info.title || undefined}>
            {info.icon && <Icon name={info.icon} size={16} aria-hidden="true" />}
            <span>{info.text}</span>
        </span>
    );

    const renderAlarmColumn = () => {
        if (!alarmInfo || !alarmInfo.text) return null;
        return renderStatus(alarmInfo);
    };

    // =====================================================
    // CÁLCULO DE ALARMA PROGRAMADA (NUEVA FUNCIÓN)
    // =====================================================
    const getScheduledAlarmInfo = () => {
        if (!scheduledData || !scheduledData.limitDate) return null;
        
        const limitMoment = dayjs(scheduledData.limitDate);
        const isCompleted = !!clock?.date_start;
        const today = dayjs(systemDate);

        let text = '';
        let color = '';
        let icon = null;

        if (isCompleted) {
            const completionDate = dayjs(clock.date_start);
            
            if (completionDate.isAfter(limitMoment, 'day')) {
                // CORRECCIÓN: Usar formato string YYYY-MM-DD para evitar problemas de timezone
                const delayDays = calcularDiasHabiles(limitMoment.format('YYYY-MM-DD'), completionDate.format('YYYY-MM-DD'));
                text = `Retraso de ${delayDays} día(s)`;
                color = 'var(--ew-danger-text, hsl(var(--destructive)))';
                icon = 'AlertCircle';
            } else {
                text = `A tiempo`;
                color = 'var(--ew-success-text, hsl(var(--accent)))';
                icon = 'Check';
            }
        } else {
            const isOverdue = today.isAfter(limitMoment, 'day');
            
            if (isOverdue) {
                // CORRECCIÓN: Usar formato string YYYY-MM-DD para evitar problemas de timezone
                const overdueDays = calcularDiasHabiles(limitMoment.format('YYYY-MM-DD'), today.format('YYYY-MM-DD'));
                text = `Vencido por ${overdueDays} día(s)`;
                color = 'var(--ew-danger-text, hsl(var(--destructive)))';
                icon = 'AlertCircle';
            } else {
                // CORRECCIÓN: Usar formato string YYYY-MM-DD para evitar problemas de timezone
                const remainingDays = calcularDiasHabiles(today.format('YYYY-MM-DD'), limitMoment.format('YYYY-MM-DD'));
                text = `${remainingDays} día(s) restante(s)`;
                color = 'var(--ew-warning-text, hsl(var(--warning)))';
                icon = 'Hourglass';
                
                if (remainingDays <= 2) {
                    color = 'var(--ew-danger-text, hsl(var(--destructive)))';
                    icon = 'AlertTriangle';
                }
            }
        }
        return { text, color, icon };
    };

    const scheduledAlarmInfo = getScheduledAlarmInfo();

    // =====================================================
    // CÁLCULO DE SIGUIENTE PASO (NUEVA FUNCIÓN)
    // =====================================================
    const getNextStepInfo = () => {
        // Si este evento está completado, no hay siguiente paso para él
        if (clock?.date_start) return null;

        // Buscar el siguiente evento pendiente en la lista
        const allClocks = helpers.clocksData || [];
        const currentState = value.state;
        
        // Determinar qué evento debe completarse antes de este
        if (value.limit) {
            const getDependentStates = (limitConfig) => {
                if (!Array.isArray(limitConfig)) return [];
                if (typeof limitConfig[1] === 'number') {
                    const [states] = limitConfig;
                    return Array.isArray(states) ? states : [states];
                }
                let allStates = [];
                limitConfig.forEach(opt => {
                    allStates = [...allStates, ...getDependentStates(opt)];
                });
                return allStates;
            };

            const dependentStates = getDependentStates(value.limit);
            
            // Verificar si hay algún evento dependiente pendiente
            for (const depState of dependentStates) {
                const depClock = getClock(depState);
                if (!depClock || !depClock.date_start) {
                    // Encontramos un evento dependiente que está pendiente
                    const depClockDef = helpers.clocksToShow?.find(c => c.state === depState);
                    if (depClockDef) {
                        return {
                            text: `Espera: ${depClockDef.name || 'Evento previo'}`,
                            icon: 'PauseCircle',
                            color: 'hsl(var(--muted-foreground))'
                        };
                    }
                }
            }
        }

        // Si no hay dependencias pendientes, este es el siguiente paso
        return {
            text: 'Acción requerida',
            icon: 'PlayCircle',
            color: 'var(--ew-info-text, hsl(var(--primary)))'
        };
    };

    const nextStepInfo = getNextStepInfo();

    const renderScheduledAlarmColumn = () => {
        if (!scheduledAlarmInfo) return <span className="tc-muted">Sin alarma programada</span>;
        return renderStatus(scheduledAlarmInfo);
    };

    const renderNextStepColumn = () => {
        if (!nextStepInfo) return <span className="tc-muted">Completado</span>;
        return renderStatus(nextStepInfo);
    };

    // =====================================================
    // EXTRAER Y GUARDAR OBSERVACIONES
    // =====================================================
    const getObservations = () => {
        if (!clock || !clock.desc) return '';
        try {
            const parsed = JSON.parse(clock.desc);
            return parsed.userNotes || '';
        } catch (e) {
            if (clock.desc.includes('|| OBS:')) {
                return clock.desc.split('|| OBS:')[1].trim();
            }
            return ''; 
        }
    };

    // =====================================================
    // MODAL DE DETALLE MEJORADO
    // =====================================================
    const openDetailModal = () => {
        const title = value.name || value.title || 'Detalle del Evento';
        const systemDesc = value.desc || 'Evento del proceso.';
        const currentDate = clock?.date_start ? formatDate(clock.date_start) : 'Pendiente';
        const statusColor = clock?.date_start ? 'success' : 'secondary';
        const statusText = clock?.date_start ? 'COMPLETADO' : 'PENDIENTE';
        const state = clock?.state ?? value.state;
        
        let existingObs = '';
        if (clock && clock.desc && clock.desc.includes('|| OBS:')) {
            existingObs = clock.desc.split('|| OBS:')[1].trim();
        }

        swalFormDialog({
            html: `
            <div class="time-detail-modal">
                <div class="tdm-header">
                    <div class="tdm-title-group">
                        <div class="tdm-icon-box">${getIconSvg("fa-calendar-day")}</div>
                        <div>
                            <h5 class="tdm-title">${title}</h5>
                            <span class="tdm-subtitle">${systemDesc}</span>
                        </div>
                    </div>
                    <span class="tdm-badge status-${statusColor}">${statusText}</span>
                </div>

                <div class="tdm-grid">
                    <div class="tdm-card">
                        <div class="tdm-card-header">${getIconSvg("fa-calendar-check", 14, "text-primary")} Fecha Real</div>
                        <div class="tdm-card-body">
                            <div class="tdm-big-value">${currentDate}</div>
                            ${legalData.baseDate ? `<div class="tdm-sub-value">Calculado desde: ${formatDate(legalData.baseDate)}</div>` : ''}
                        </div>
                    </div>

                    <div class="tdm-card">
                        <div class="tdm-card-header">${getIconSvg("fa-gavel", 14, "text-danger")} Límite Legal</div>
                        <div class="tdm-card-body">
                            <div class="tdm-big-value">${legalData.limitDate ? formatDate(legalData.limitDate) : 'N/A'}</div>
                            <div class="tdm-sub-value">${(state === 501 ? 'Límite legal con holgura de 2 días' : state === 502 ? 'Límite legal con holgura de 1 día' : '') || ''}</div>
                        </div>
                    </div>

                    <div class="tdm-card">
                        <div class="tdm-card-header">${getIconSvg("fa-user-clock", 14, "text-info")} Programado</div>
                        <div class="tdm-card-body">
                            <div class="tdm-big-value">${scheduledData && scheduledData.limitDate ? formatDate(scheduledData.limitDate) : 'N/A'}</div>
                            <div class="tdm-sub-value">${scheduledData ? `${scheduledData.days} días hábiles previstos` : 'No programado'}</div>
                        </div>
                    </div>
                </div>

                ${value.legalSupport ? `
                <div class="tdm-section">
                    <div class="tdm-section-title">${getIconSvg('fa-balance-scale')} Soporte Legal</div>
                    <div class="tdm-legal-text">
                        ${value.legalSupport}
                    </div>
                </div>
                ` : ''}

                <div class="tdm-section">
                    <div class="tdm-section-title">${getIconSvg("fa-comment-alt")} Observaciones / Notas</div>
                    <textarea id="swal-input-obs" class="form-control tdm-textarea" placeholder="Escribe aquí observaciones sobre este tiempo...">${existingObs}</textarea>
                </div>
            </div>
            `,
            showCloseButton: true,
            confirmButtonText: 'Guardar Observación',
            cancelButtonText: 'Cerrar',
            customClass: {
                popup: 'swal2-themed tdm-popup',
                confirmButton: 'swal2-confirm-themed',
                cancelButton: 'swal2-cancel-themed',
                htmlContainer: 'tdm-container'
            },
            width: 600,
            preConfirm: () => {
                const newObs = document.getElementById('swal-input-obs').value;
                if (newObs !== existingObs) {
                    return newObs;
                }
                return null;
            }
        }).then((result) => {
            if (result.isConfirmed && result.value !== null && clock) {
                const newDescBase = clock.desc ? clock.desc.split('|| OBS:')[0].trim() : (value.desc || '');
                const finalDesc = result.value ? `${newDescBase} || OBS: ${result.value}` : newDescBase;
                
                const payload = {
                    ...value,
                    desc: finalDesc
                };
                onSave(payload, i);
            }
        });
    };

    // Rows outside the current path of the process (definition logic, unchanged).
    if (isClockRowHidden({ value, clock, getClock, getClockVersion })) return null;

    const currentDate = clock?.date_start ?? value.manualDate ?? '';
    const canEditDate = value.editableDate !== false;

    const sentenceCaseEs = (s) => (s && typeof s === 'string') ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;
    const eventName = value.name ?? sentenceCaseEs(clock?.name) ?? '';

    const rowIcon = getRowIcon();

    const hasLimitRule = Boolean(value.limit) || DERIVED_LIMIT_STATES.includes(value.state);
    const missingLimitText = value.state === 504
        ? 'Sin plazo fijo'
        : hasLimitRule ? 'Evento previo sin fecha' : 'Sin límite legal';

    // Every cell is a track of the shared grid (`--tc-cols`, see getClockGridTemplate).
    // A date sits in the same box whether it is editable or not: the text starts at the
    // same x, and the eraser has its own fixed slot so it never moves the value.
    return (
        <div
            role="row"
            id={`tc-row-${i}`}
            className={cn('tc-row', isHighlighted && 'is-phase', isFlashed && 'is-flash')}
            data-state={String(value.state)}
        >
            <div role="cell" className="tc-cell tc-cell-event">
                <span className="tc-row-slot" aria-hidden="true">{rowIcon}</span>
                <button
                    type="button"
                    className={cn('tc-row-name', isHighlighted && 'title-highlight')}
                    onClick={openDetailModal}
                    title={eventName}
                    aria-label={`Ver detalles de ${eventName}`}
                >
                    <span className="tc-row-name-text">{eventName}</span>
                    {clock?.desc && clock.desc.includes('|| OBS:') && (
                        <Icon name="comment-dots" size={12} className="shrink-0 text-primary" title="Tiene observaciones" />
                    )}
                </button>
            </div>

            <div role="cell" className="tc-cell tc-cell-date">
                {canEditDate ? (
                    <>
                        <span className="tc-date" data-empty={localDateValue ? undefined : 'true'}>
                            <input
                                type="date"
                                className={cn('tc-date-input', DATE_TEXT_CLASS)}
                                id={'clock_exp_date_' + i}
                                aria-label={`Fecha de ${eventName}`}
                                value={localDateValue}
                                max="2100-01-01"
                                onChange={handleDateChange}
                                onBlur={handleDateBlur}
                            />
                            {/* At rest the date reads dd/mm/yyyy like every read-only date; the native field shows while editing. */}
                            <span className={cn('tc-date-display', DATE_TEXT_CLASS)} aria-hidden="true">
                                {localDateValue ? formatDate(localDateValue) : 'dd/mm/aaaa'}
                            </span>
                        </span>
                        <span className="tc-row-slot">
                            {localDateValue ? (
                                <button
                                    type="button"
                                    className="tc-row-erase"
                                    onClick={() => onDelete(value)}
                                    title="Eliminar fecha"
                                    aria-label={`Eliminar la fecha de ${eventName}`}
                                >
                                    <Icon name="eraser" size={16} aria-hidden="true" />
                                </button>
                            ) : null}
                        </span>
                    </>
                ) : (
                    <span className="tc-date is-readonly" data-empty={currentDate ? undefined : 'true'}>
                        {currentDate ? (
                            <span className={cn('tc-date-display', DATE_TEXT_CLASS)}>{formatDate(currentDate)}</span>
                        ) : (
                            <span className="tc-muted">Sin fecha registrada</span>
                        )}
                    </span>
                )}
            </div>

            <div role="cell" className="tc-cell">
                {legalData.limitDate ? (
                    <span className={cn('tc-date-text', DATE_TEXT_CLASS)} title={legalData.tooltip || undefined}>
                        {formatDate(legalData.limitDate)}
                    </span>
                ) : (
                    <span className="tc-muted">{missingLimitText}</span>
                )}
            </div>

            <div role="cell" className="tc-cell">
                {renderAlarmColumn()}
            </div>

            {visibleColumns.scheduledLimit && (
                <div role="cell" className="tc-cell">
                    {scheduledData && scheduledData.limitDate ? (
                        <span className={cn('tc-date-text', DATE_TEXT_CLASS)}>{formatDate(scheduledData.limitDate)}</span>
                    ) : (
                        <span className="tc-muted">Sin programar</span>
                    )}
                </div>
            )}

            {visibleColumns.scheduledAlarm && (
                <div role="cell" className="tc-cell">
                    {renderScheduledAlarmColumn()}
                </div>
            )}

            {visibleColumns.nextStep && (
                <div role="cell" className="tc-cell">
                    {renderNextStepColumn()}
                </div>
            )}
        </div>
    );
});
