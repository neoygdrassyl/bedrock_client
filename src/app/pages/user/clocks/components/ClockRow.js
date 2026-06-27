import React, { useState, useCallback, useMemo, memo } from 'react';
import dayjs from 'dayjs';
import { calcularDiasHabiles, sumarDiasHabiles } from '../hooks/useClocksManager';
import { calculateScheduledLimitForDisplay } from '../utils/scheduleUtils';
import { Icon } from '@/components/icon';
import { swalFormDialog } from '../../../../utils/swalAdapter';
import { getIconSvg } from '../../../../utils/iconSvgString';

// --- Anchos de columna centralizados ---
export const DEFAULT_CLOCK_COLUMN_VISIBILITY = {
    scheduledLimit: false,
    scheduledAlarm: false,
    nextStep: false,
};

export const CLOCK_COLUMN_WIDTHS = {
    EVENT: 300,
    DATE: 150,
    LEGAL_LIMIT: 150,
    LEGAL_ALARM: 150,
    SCHEDULED_LIMIT: 150,
    SCHEDULED_ALARM: 150,
    NEXT_STEP: 220,
};

const px = (value) => `${value}px`;

export const getClockTableWidth = (visibleColumns = DEFAULT_CLOCK_COLUMN_VISIBILITY) => {
    let width = CLOCK_COLUMN_WIDTHS.EVENT
        + CLOCK_COLUMN_WIDTHS.DATE
        + CLOCK_COLUMN_WIDTHS.LEGAL_LIMIT
        + CLOCK_COLUMN_WIDTHS.LEGAL_ALARM;

    if (visibleColumns.scheduledLimit) width += CLOCK_COLUMN_WIDTHS.SCHEDULED_LIMIT;
    if (visibleColumns.scheduledAlarm) width += CLOCK_COLUMN_WIDTHS.SCHEDULED_ALARM;
    if (visibleColumns.nextStep) width += CLOCK_COLUMN_WIDTHS.NEXT_STEP;

    return width;
};

export const ClockTableHeader = ({ visibleColumns = DEFAULT_CLOCK_COLUMN_VISIBILITY }) => {
    const headerStyle = {
        display: 'flex',
        alignItems: 'center',
        padding: '0.75rem 1rem',
        backgroundColor: '#f8f9fa',
        borderBottom: '2px solid #dee2e6',
        fontWeight: 600,
        fontSize: '0.85rem',
        color: '#495057',
        position: 'sticky',
        top: 0,
        zIndex: 10,
    };

    const colStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    };

    // --- NUEVO: Estilos para columnas fijas (sticky) en el header ---
    const stickyColStyle = {
        position: 'sticky',
        zIndex: 11, // Debe ser mayor que el zIndex del header (10)
        backgroundColor: '#f8f9fa', // Fondo opaco para no ver el scroll detrás
    };

    return (
        <div style={headerStyle}>
            {/* Columna 1 Fija (Evento) */}
            <div style={{ 
                ...colStyle, 
                ...stickyColStyle,
                left: 0, // Pegado a la izquierda
                flex: `0 0 ${px(CLOCK_COLUMN_WIDTHS.EVENT)}`, 
                minWidth: px(CLOCK_COLUMN_WIDTHS.EVENT) 
            }}>
                <Icon name="list" size={16} /> Evento
            </div>
            {/* Columna 2 Fija (Fecha Evento) */}
            <div style={{ 
                ...colStyle, 
                ...stickyColStyle,
                left: px(CLOCK_COLUMN_WIDTHS.EVENT), // Desplazado por el ancho de la primera columna
                flex: `0 0 ${px(CLOCK_COLUMN_WIDTHS.DATE)}`, 
                minWidth: px(CLOCK_COLUMN_WIDTHS.DATE)
            }}>
                <Icon name="calendar" size={16} /> Fecha evento
            </div>

            {/* Columnas con scroll */}
            <div style={{ ...colStyle, flex: `0 0 ${px(CLOCK_COLUMN_WIDTHS.LEGAL_LIMIT)}`, minWidth: px(CLOCK_COLUMN_WIDTHS.LEGAL_LIMIT) }}>
                <Icon name="gavel" size={16} /> Límite legal
            </div>
            <div style={{ ...colStyle, flex: `0 0 ${px(CLOCK_COLUMN_WIDTHS.LEGAL_ALARM)}`, minWidth: px(CLOCK_COLUMN_WIDTHS.LEGAL_ALARM) }}>
                <Icon name="exclamation-triangle" size={16} /> Alarma legal
            </div>
            {visibleColumns.scheduledLimit && (
                <div style={{ ...colStyle, flex: `0 0 ${px(CLOCK_COLUMN_WIDTHS.SCHEDULED_LIMIT)}`, minWidth: px(CLOCK_COLUMN_WIDTHS.SCHEDULED_LIMIT) }}>
                    <Icon name="calendar-check" size={16} /> Límite programado
                </div>
            )}
            {visibleColumns.scheduledAlarm && (
                <div style={{ ...colStyle, flex: `0 0 ${px(CLOCK_COLUMN_WIDTHS.SCHEDULED_ALARM)}`, minWidth: px(CLOCK_COLUMN_WIDTHS.SCHEDULED_ALARM) }}>
                    <Icon name="bell" size={16} /> Alarma programada
                </div>
            )}
            {visibleColumns.nextStep && (
                <div style={{ ...colStyle, flex: `0 0 ${px(CLOCK_COLUMN_WIDTHS.NEXT_STEP)}`, minWidth: px(CLOCK_COLUMN_WIDTHS.NEXT_STEP) }}>
                    <Icon name="arrow-right" size={16} /> Siguiente paso
                </div>
            )}
        </div>
    );
};


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
    } = props;
    const { getClock, getClockVersion, FUN_0_TYPE_TIME, suspensionPreActa, suspensionPostActa, extension, currentItem, calculateDaysSpent, viaTime } = helpers;

    // Resolver reloj según versión - memoizado
    const getClockScoped = useCallback((state) => {
        if (value.version !== undefined) {
            return getClockVersion(state, value.version) || getClock(state);
        }
        return getClock(state);
    }, [value.version, getClockVersion, getClock]);

    const [isHovered, setIsHovered] = useState(false);
    
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
    const formatDate = (dateStr) => dateStr ? dayjs(dateStr).format('DD/MM/YYYY') : '- -';

    // =====================================================
    // CÁLCULO DE ICONOS Y ESTADOS (SEMÁFORO)
    // =====================================================
    const getRowIcon = () => {
        const currentDate = clock?.date_start ?? value.manualDate;
        
        if (currentDate) {
            return <Icon name="check-circle" size={16} style={{ color: '#2f9e44', fontSize: '0.9rem' }} />;
        }
        
        if (value.requiredClock && !getClockScoped(value.requiredClock)?.date_start) {
             return <Icon name="minus-circle" size={16} style={{ color: '#dee2e6', fontSize: '0.9rem' }} />;
        }

        return <Icon name="clock" size={16} style={{ color: '#fcc419', fontSize: '0.9rem' }} />;
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
            limitDate = 1;
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
        if (!legalData || !legalData.limitDate) return null;
        const { limitDate } = legalData;
        const limitMoment = dayjs(limitDate);
        const isCompleted = !!clock?.date_start;
        const today = dayjs(systemDate);
        const state = value.state;


        if (state===504){
            const actoAdministrativo = getClock(70);
            let text = '';
            let color = '';
            let icon = null;

            if (isCompleted) {
                text = `A tiempo`;
                color = '#2f9e44';
                icon = 'Check';
            } else if (!isCompleted && actoAdministrativo?.date_start) {
                text = 'Vencida';
                color = '#e03131';
                icon = 'XCircle';
            } else {
                text = 'Pendiente';
                color = '#f08c00';
                icon = 'Hourglass';
            }
            return { text, color, icon };
        }

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
                color = '#e03131';
                icon = 'AlertCircle';
            } else {
                text = `A tiempo`;
                color = '#2f9e44';
                icon = 'Check';
            }
        } else {
            const isOverdue = today.isAfter(limitMoment, 'day');
            
            if (isOverdue) {
                // CORRECCIÓN: Usar formato string YYYY-MM-DD para evitar problemas de timezone
                const overdueDays = calcularDiasHabiles(limitMoment.format('YYYY-MM-DD'), today.format('YYYY-MM-DD'));
                text = `Vencido por ${overdueDays} día(s)`;
                color = '#e03131';
                icon = 'AlertCircle';
            } else {
                // CORRECCIÓN: Usar formato string YYYY-MM-DD para evitar problemas de timezone
                const remainingDays = calcularDiasHabiles(today.format('YYYY-MM-DD'), limitMoment.format('YYYY-MM-DD'));
                text = `${remainingDays} día(s) restante(s)`;
                color = '#f08c00';
                icon = 'Hourglass';
                
                if (remainingDays <= 2) {
                    color = '#e03131';
                    icon = 'AlertTriangle';
                }
            }
        }
        return { text, color, icon };
    };
    
    const alarmInfo = getAlarmInfo();

    const renderAlarmColumn = () => {
        if (!alarmInfo) return null;
        return (
            <div className="d-flex align-items-center" style={{ color: alarmInfo.color, fontWeight: 500, fontSize: '0.8rem' }}>
                {alarmInfo.icon && <Icon name={alarmInfo.icon} size={16} className="me-1" />}
                {alarmInfo.text}
            </div>
        );
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
                color = '#e03131';
                icon = 'AlertCircle';
            } else {
                text = `A tiempo`;
                color = '#2f9e44';
                icon = 'Check';
            }
        } else {
            const isOverdue = today.isAfter(limitMoment, 'day');
            
            if (isOverdue) {
                // CORRECCIÓN: Usar formato string YYYY-MM-DD para evitar problemas de timezone
                const overdueDays = calcularDiasHabiles(limitMoment.format('YYYY-MM-DD'), today.format('YYYY-MM-DD'));
                text = `Vencido por ${overdueDays} día(s)`;
                color = '#e03131';
                icon = 'AlertCircle';
            } else {
                // CORRECCIÓN: Usar formato string YYYY-MM-DD para evitar problemas de timezone
                const remainingDays = calcularDiasHabiles(today.format('YYYY-MM-DD'), limitMoment.format('YYYY-MM-DD'));
                text = `${remainingDays} día(s) restante(s)`;
                color = '#f08c00';
                icon = 'Hourglass';
                
                if (remainingDays <= 2) {
                    color = '#e03131';
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
                            color: '#868e96'
                        };
                    }
                }
            }
        }

        // Si no hay dependencias pendientes, este es el siguiente paso
        return {
            text: 'Acción requerida',
            icon: 'PlayCircle',
            color: '#1971c2'
        };
    };

    const nextStepInfo = getNextStepInfo();

    const renderScheduledAlarmColumn = () => {
        if (!scheduledAlarmInfo) return <span style={{ color: '#adb5bd', fontSize: '0.75rem' }}>- -</span>;
        return (
            <div style={{ display: 'flex', alignItems: 'center', color: scheduledAlarmInfo.color, fontWeight: 500, fontSize: '0.8rem' }}>
                {scheduledAlarmInfo.icon && <Icon name={scheduledAlarmInfo.icon} size={16} className="me-1" />}
                {scheduledAlarmInfo.text}
            </div>
        );
    };

    const renderNextStepColumn = () => {
        if (!nextStepInfo) return <span style={{ color: '#adb5bd', fontSize: '0.75rem', fontStyle: 'italic' }}>Completado</span>;
        return (
            <div style={{ display: 'flex', alignItems: 'center', color: nextStepInfo.color, fontWeight: 500, fontSize: '0.8rem' }}>
                {nextStepInfo.icon && <Icon name={nextStepInfo.icon} size={16} className="me-1" />}
                {nextStepInfo.text}
            </div>
        );
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
                            ${legalData.baseDate ? `<div className="tdm-sub-value">Calculado desde: ${formatDate(legalData.baseDate)}</div>` : ''}
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
                <div className="tdm-section">
                    <div className="tdm-section-title"><Icon name="balance-scale" size={16} /> Soporte Legal</div>
                    <div className="tdm-legal-text">
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

    if (value.show === false) return null;
    if (value.requiredClock && !getClockScoped(value.requiredClock)?.date_start) return null;
    if (value.optional && !clock) return null;

    const currentDate = clock?.date_start ?? value.manualDate ?? '';
    const canEditDate = value.editableDate !== false;

    const sentenceCaseEs = (s) => (s && typeof s === 'string') ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;
    const eventName = value.name ?? sentenceCaseEs(clock?.name) ?? '';

    const rowIcon = getRowIcon();
    
    const titleClassName = `row-title text-truncate sticky ${isHighlighted ? 'title-highlight' : ''}`;
    const dateInputClassName = `form-control form-control-sm border-0 bg-transparent dates-input-class ${localDateValue ? '' : 'padding-date-input'}`;
    
    const ACTIVE_BG = 'rgba(245, 245, 245)';   // .active-row-container
    const ACTIVE_HOVER_BG = 'rgba(242, 242, 242)'; // .active-row-container:hover

    const backgroundColor = isHighlighted
    ? (isHovered ? ACTIVE_HOVER_BG : ACTIVE_BG)
    : '#fff';


    const rowStyle = {
        display: 'flex',
        alignItems: 'stretch',
        padding: '0.5rem 1rem',
        backgroundColor: isHighlighted ? '#ffffffff' : '#fff',
        borderBottom: '1px solid #f1f3f5',
        transition: 'background-color 0.2s',
    };

    const colStyle = {
        display: 'flex',
        alignItems: 'center',
        padding: '0 0.5rem',
    };
    
    // --- NUEVO: Estilos para columnas fijas (sticky) en cada fila ---
    const stickyColStyle = {
        position: 'sticky',
        zIndex: 1, // z-index para filas, menor que el del header
        // El color de fondo se toma del estilo de la fila para manejar el resaltado
        backgroundColor: backgroundColor,
    };

    return (
        <div style={rowStyle} 
             className={isHighlighted ? 'active-row-container' : ''} 
             >
            {/* Columna 1 Fija (Evento) */}
            <div style={{ 
                ...colStyle, 
                ...stickyColStyle,
                left: 0,
                flex: `0 0 ${px(CLOCK_COLUMN_WIDTHS.EVENT)}`, 
                minWidth: px(CLOCK_COLUMN_WIDTHS.EVENT) 
            }}>
                <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '0.5rem' }}>
                    {rowIcon}
                </div>
                <div 
                    className={titleClassName} 
                    onClick={openDetailModal}
                    title="Ver detalles"
                    style={{ flex: 1, cursor: 'pointer', minWidth: 0 }}
                >
                    {eventName}
                    {clock?.desc && clock.desc.includes('|| OBS:') && (
                        <Icon name="comment-dots" size={12} className="ms-2 text-info" title="Tiene observaciones" />
                    )}
                </div>
            </div>

            {/* Columna 2 Fija (Fecha Evento) */}
            <div style={{ 
                ...colStyle,
                ...stickyColStyle,
                left: px(CLOCK_COLUMN_WIDTHS.EVENT),
                flex: `0 0 ${px(CLOCK_COLUMN_WIDTHS.DATE)}`, 
                minWidth: px(CLOCK_COLUMN_WIDTHS.DATE),
            }}>
                {canEditDate ? (
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <input 
                            type="date" 
                            className={dateInputClassName}
                            style={{fontSize: '0.85rem', color: '#495057', fontWeight: 500, flex: 1}}
                            id={'clock_exp_date_' + i} 
                            value={localDateValue} 
                            max="2100-01-01" 
                            onChange={handleDateChange}
                            onBlur={handleDateBlur} 
                        />
                        {localDateValue && (
                            <button 
                                style={{ background: 'none', border: 'none', padding: '0 0.25rem', cursor: 'pointer', color: '#6c757d' }}
                                onClick={() => onDelete(value)} 
                                title="Eliminar fecha"
                            >
                                <Icon name="eraser" size={16} />
                            </button>
                        )}
                    </div>
                ) : (
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#495057' }}>
                        {formatDate(currentDate)}
                    </span>
                )}
            </div>

            {/* Columnas con scroll */}
            <div style={{ ...colStyle, flex: `0 0 ${px(CLOCK_COLUMN_WIDTHS.LEGAL_LIMIT)}`, minWidth: px(CLOCK_COLUMN_WIDTHS.LEGAL_LIMIT) }}>
                <span style={{ fontSize: '0.85rem', color: '#495057' }}>
                    {legalData.limitDate ? formatDate(legalData.limitDate) : '- -'}
                </span>
            </div>

            <div style={{ ...colStyle, flex: `0 0 ${px(CLOCK_COLUMN_WIDTHS.LEGAL_ALARM)}`, minWidth: px(CLOCK_COLUMN_WIDTHS.LEGAL_ALARM) }}>
                {renderAlarmColumn()}
            </div>

            {visibleColumns.scheduledLimit && (
                <div style={{ ...colStyle, flex: `0 0 ${px(CLOCK_COLUMN_WIDTHS.SCHEDULED_LIMIT)}`, minWidth: px(CLOCK_COLUMN_WIDTHS.SCHEDULED_LIMIT) }}>
                    <span style={{ fontSize: '0.85rem', color: '#495057' }}>
                        {scheduledData && scheduledData.limitDate ? formatDate(scheduledData.limitDate) : '- -'}
                    </span>
                </div>
            )}

            {visibleColumns.scheduledAlarm && (
                <div style={{ ...colStyle, flex: `0 0 ${px(CLOCK_COLUMN_WIDTHS.SCHEDULED_ALARM)}`, minWidth: px(CLOCK_COLUMN_WIDTHS.SCHEDULED_ALARM) }}>
                    {renderScheduledAlarmColumn()}
                </div>
            )}

            {visibleColumns.nextStep && (
                <div style={{ ...colStyle, flex: `0 0 ${px(CLOCK_COLUMN_WIDTHS.NEXT_STEP)}`, minWidth: px(CLOCK_COLUMN_WIDTHS.NEXT_STEP) }}>
                    {renderNextStepColumn()}
                </div>
            )}
        </div>
    );
});