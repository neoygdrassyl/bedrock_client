import {React, useState} from 'react';
import moment from 'moment';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { calcularDiasHabiles, sumarDiasHabiles } from '../hooks/useClocksManager';
import { calculateScheduledLimitForDisplay } from '../utils/scheduleUtils';

const MySwal = withReactContent(Swal);

// --- Anchos de columna centralizados ---
const COL_WIDTHS = {
    EVENT: '300px',
    DATE: '150px', 
    OTHERS: '150px' 
};

export const ClockTableHeader = () => {
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
                flex: `0 0 ${COL_WIDTHS.EVENT}`, 
                minWidth: COL_WIDTHS.EVENT 
            }}>
                <i className="fas fa-list"></i> Evento
            </div>
            {/* Columna 2 Fija (Fecha Evento) */}
            <div style={{ 
                ...colStyle, 
                ...stickyColStyle,
                left: COL_WIDTHS.EVENT, // Desplazado por el ancho de la primera columna
                flex: `0 0 ${COL_WIDTHS.DATE}`, 
                minWidth: COL_WIDTHS.DATE
            }}>
                <i className="far fa-calendar"></i> Fecha evento
            </div>

            {/* Columnas con scroll */}
            <div style={{ ...colStyle, flex: `0 0 ${COL_WIDTHS.OTHERS}`, minWidth: COL_WIDTHS.OTHERS }}>
                <i className="fas fa-gavel"></i> Límite legal
            </div>
            <div style={{ ...colStyle, flex: `0 0 ${COL_WIDTHS.OTHERS}`, minWidth: COL_WIDTHS.OTHERS }}>
                <i className="fas fa-exclamation-triangle"></i> Alarma legal
            </div>
            <div style={{ ...colStyle, flex: `0 0 ${COL_WIDTHS.OTHERS}`, minWidth: COL_WIDTHS.OTHERS }}>
                <i className="fas fa-calendar-check"></i> Límite programado
            </div>
            <div style={{ ...colStyle, flex: `0 0 ${COL_WIDTHS.OTHERS}`, minWidth: COL_WIDTHS.OTHERS }}>
                <i className="far fa-bell"></i> Alarma programada
            </div>
            <div style={{ ...colStyle, flex: '1', minWidth: '220px' }}>
                <i className="fas fa-arrow-right"></i> Siguiente paso
            </div>
        </div>
    );
};


export const ClockRow = (props) => {
    const { value, i, clock, onSave, onDelete, helpers, scheduleConfig, systemDate, isHighlighted } = props;
    const { getClock, getClockVersion, FUN_0_TYPE_TIME, suspensionPreActa, suspensionPostActa, extension, currentItem, calculateDaysSpent, viaTime } = helpers;

    // ... (resto de la lógica del componente que no cambia)
    // Resolver reloj según versión
    const getClockScoped = (state) => {
        if (value.version !== undefined) {
            return getClockVersion(state, value.version) || getClock(state);
        }
        return getClock(state);
    };

    const [isHovered, setIsHovered] = useState(false);

    // Formateador textual MODIFICADO para usar formato de fecha corta (L)
    const formatDate = (dateStr) => dateStr ? moment(dateStr).format('DD/MM/YYYY') : '- -';

    // =====================================================
    // CÁLCULO DE ICONOS Y ESTADOS (SEMÁFORO)
    // =====================================================
    const getRowIcon = () => {
        const currentDate = clock?.date_start ?? value.manualDate;
        
        if (currentDate) {
            return <i className="fas fa-check-circle" style={{ color: '#2f9e44', fontSize: '0.9rem' }}></i>;
        }
        
        if (value.requiredClock && !getClockScoped(value.requiredClock)?.date_start) {
             return <i className="fas fa-minus-circle" style={{ color: '#dee2e6', fontSize: '0.9rem' }}></i>;
        }

        return <i className="fas fa-clock" style={{ color: '#fcc419', fontSize: '0.9rem' }}></i>;
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
                    if (!acta1Date || moment(extension.start.date_start).isBefore(acta1Date)) totalDays += extension.days;
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
        const limitMoment = moment(limitDate);
        const isCompleted = !!clock?.date_start;
        const today = moment(systemDate);
        const state = value.state;


        if (state===504){
            const actoAdministrativo = getClock(70);
            let text = '';
            let color = '';
            let icon = null;

            if (isCompleted) {
                text = `A tiempo`;
                color = '#2f9e44';
                icon = 'fa-check';
            } else if (!isCompleted && actoAdministrativo?.date_start) {
                text = 'Vencida';
                color = '#e03131';
                icon = 'fa-times-circle';
            } else {
                text = 'Pendiente';
                color = '#f08c00';
                icon = 'fa-hourglass-half';
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
            const completionDate = moment(clock.date_start);
            
            if (completionDate.isAfter(limitMoment, 'day')) {
                const delayDays = calcularDiasHabiles(limitMoment.toDate(), completionDate.toDate());
                text = `Retraso de ${delayDays} día(s)`;
                color = '#e03131';
                icon = 'fa-exclamation-circle';
            } else {
                text = `A tiempo`;
                color = '#2f9e44';
                icon = 'fa-check';
            }
        } else {
            const isOverdue = today.isAfter(limitMoment, 'day');
            
            if (isOverdue) {
                const overdueDays = calcularDiasHabiles(limitMoment.toDate(), today.toDate());
                text = `Vencido por ${overdueDays} día(s)`;
                color = '#e03131';
                icon = 'fa-exclamation-circle';
            } else {
                const remainingDays = calcularDiasHabiles(today.toDate(), limitMoment.toDate());
                text = `${remainingDays} día(s) restante(s)`;
                color = '#f08c00';
                icon = 'fa-hourglass-half';
                
                if (remainingDays <= 2) {
                    color = '#e03131';
                    icon = 'fa-exclamation-triangle';
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
                {alarmInfo.icon && <i className={`fas ${alarmInfo.icon} me-1`}></i>}
                {alarmInfo.text}
            </div>
        );
    };

    // =====================================================
    // CÁLCULO DE ALARMA PROGRAMADA (NUEVA FUNCIÓN)
    // =====================================================
    const getScheduledAlarmInfo = () => {
        if (!scheduledData || !scheduledData.limitDate) return null;
        
        const limitMoment = moment(scheduledData.limitDate);
        const isCompleted = !!clock?.date_start;
        const today = moment(systemDate);

        let text = '';
        let color = '';
        let icon = null;

        if (isCompleted) {
            const completionDate = moment(clock.date_start);
            
            if (completionDate.isAfter(limitMoment, 'day')) {
                const delayDays = calcularDiasHabiles(limitMoment.toDate(), completionDate.toDate());
                text = `Retraso de ${delayDays} día(s)`;
                color = '#e03131';
                icon = 'fa-exclamation-circle';
            } else {
                text = `A tiempo`;
                color = '#2f9e44';
                icon = 'fa-check';
            }
        } else {
            const isOverdue = today.isAfter(limitMoment, 'day');
            
            if (isOverdue) {
                const overdueDays = calcularDiasHabiles(limitMoment.toDate(), today.toDate());
                text = `Vencido por ${overdueDays} día(s)`;
                color = '#e03131';
                icon = 'fa-exclamation-circle';
            } else {
                const remainingDays = calcularDiasHabiles(today.toDate(), limitMoment.toDate());
                text = `${remainingDays} día(s) restante(s)`;
                color = '#f08c00';
                icon = 'fa-hourglass-half';
                
                if (remainingDays <= 2) {
                    color = '#e03131';
                    icon = 'fa-exclamation-triangle';
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
                            icon: 'fa-pause-circle',
                            color: '#868e96'
                        };
                    }
                }
            }
        }

        // Si no hay dependencias pendientes, este es el siguiente paso
        return {
            text: 'Acción requerida',
            icon: 'fa-play-circle',
            color: '#1971c2'
        };
    };

    const nextStepInfo = getNextStepInfo();

    const renderScheduledAlarmColumn = () => {
        if (!scheduledAlarmInfo) return <span style={{ color: '#adb5bd', fontSize: '0.75rem' }}>- -</span>;
        return (
            <div style={{ display: 'flex', alignItems: 'center', color: scheduledAlarmInfo.color, fontWeight: 500, fontSize: '0.8rem' }}>
                {scheduledAlarmInfo.icon && <i className={`fas ${scheduledAlarmInfo.icon}`} style={{ marginRight: '0.35rem' }}></i>}
                {scheduledAlarmInfo.text}
            </div>
        );
    };

    const renderNextStepColumn = () => {
        if (!nextStepInfo) return <span style={{ color: '#adb5bd', fontSize: '0.75rem', fontStyle: 'italic' }}>Completado</span>;
        return (
            <div style={{ display: 'flex', alignItems: 'center', color: nextStepInfo.color, fontWeight: 500, fontSize: '0.8rem' }}>
                {nextStepInfo.icon && <i className={`fas ${nextStepInfo.icon}`} style={{ marginRight: '0.35rem' }}></i>}
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

        MySwal.fire({
            html: `
            <div class="time-detail-modal">
                <div class="tdm-header">
                    <div class="tdm-title-group">
                        <div class="tdm-icon-box"><i class="fas fa-calendar-day"></i></div>
                        <div>
                            <h5 class="tdm-title">${title}</h5>
                            <span class="tdm-subtitle">${systemDesc}</span>
                        </div>
                    </div>
                    <span class="tdm-badge status-${statusColor}">${statusText}</span>
                </div>

                <div class="tdm-grid">
                    <div class="tdm-card">
                        <div class="tdm-card-header"><i class="fas fa-calendar-check text-primary"></i> Fecha Real</div>
                        <div class="tdm-card-body">
                            <div class="tdm-big-value">${currentDate}</div>
                            ${legalData.baseDate ? `<div class="tdm-sub-value">Calculado desde: ${formatDate(legalData.baseDate)}</div>` : ''}
                        </div>
                    </div>

                    <div class="tdm-card">
                        <div class="tdm-card-header"><i class="fas fa-gavel text-danger"></i> Límite Legal</div>
                        <div class="tdm-card-body">
                            <div class="tdm-big-value">${legalData.limitDate ? formatDate(legalData.limitDate) : 'N/A'}</div>
                            <div class="tdm-sub-value">${(state === 501 ? 'Límite legal con holgura de 2 días' : state === 502 ? 'Límite legal con holgura de 1 día' : '') || ''}</div>
                        </div>
                    </div>

                    <div class="tdm-card">
                        <div class="tdm-card-header"><i class="fas fa-user-clock text-info"></i> Programado</div>
                        <div class="tdm-card-body">
                            <div class="tdm-big-value">${scheduledData && scheduledData.limitDate ? formatDate(scheduledData.limitDate) : 'N/A'}</div>
                            <div class="tdm-sub-value">${scheduledData ? `${scheduledData.days} días hábiles previstos` : 'No programado'}</div>
                        </div>
                    </div>
                </div>

                ${value.legalSupport ? `
                <div class="tdm-section">
                    <div class="tdm-section-title"><i class="fas fa-balance-scale"></i> Soporte Legal</div>
                    <div class="tdm-legal-text">
                        ${value.legalSupport}
                    </div>
                </div>
                ` : ''}

                <div class="tdm-section">
                    <div class="tdm-section-title"><i class="fas fa-comment-alt"></i> Observaciones / Notas</div>
                    <textarea id="swal-input-obs" class="form-control tdm-textarea" placeholder="Escribe aquí observaciones sobre este tiempo...">${existingObs}</textarea>
                </div>
            </div>
            `,
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonText: '<i class="fas fa-save me-2"></i>Guardar Observación',
            confirmButtonColor: '#1971c2',
            cancelButtonText: 'Cerrar',
            customClass: {
                popup: 'tdm-popup',
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
    const dateInputClassName = `form-control form-control-sm border-0 bg-transparent dates-input-class ${currentDate ? '' : 'padding-date-input'}`;
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
                flex: `0 0 ${COL_WIDTHS.EVENT}`, 
                minWidth: COL_WIDTHS.EVENT 
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
                        <i className="fas fa-comment-dots ms-2 text-info" title="Tiene observaciones" style={{fontSize: '0.75rem'}}></i>
                    )}
                </div>
            </div>

            {/* Columna 2 Fija (Fecha Evento) */}
            <div style={{ 
                ...colStyle,
                ...stickyColStyle,
                left: COL_WIDTHS.EVENT,
                flex: `0 0 ${COL_WIDTHS.DATE}`, 
                minWidth: COL_WIDTHS.DATE,
            }}>
                {canEditDate ? (
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <input 
                            type="date" 
                            className={dateInputClassName}
                            style={{fontSize: '0.85rem', color: '#495057', fontWeight: 500, flex: 1}}
                            id={'clock_exp_date_' + i} 
                            defaultValue={currentDate} 
                            max="2100-01-01" 
                            onBlur={() => onSave(value, i)} 
                        />
                        {currentDate && (
                            <button 
                                style={{ background: 'none', border: 'none', padding: '0 0.25rem', cursor: 'pointer', color: '#6c757d' }}
                                onClick={() => onDelete(value)} 
                                title="Eliminar fecha"
                            >
                                <i className="fas fa-eraser fa-xs"></i>
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
            <div style={{ ...colStyle, flex: `0 0 ${COL_WIDTHS.OTHERS}`, minWidth: COL_WIDTHS.OTHERS }}>
                <span style={{ fontSize: '0.85rem', color: '#495057' }}>
                    {legalData.limitDate ? formatDate(legalData.limitDate) : '- -'}
                </span>
            </div>

            <div style={{ ...colStyle, flex: `0 0 ${COL_WIDTHS.OTHERS}`, minWidth: COL_WIDTHS.OTHERS }}>
                {renderAlarmColumn()}
            </div>

            <div style={{ ...colStyle, flex: `0 0 ${COL_WIDTHS.OTHERS}`, minWidth: COL_WIDTHS.OTHERS }}>
                <span style={{ fontSize: '0.85rem', color: '#495057' }}>
                    {scheduledData && scheduledData.limitDate ? formatDate(scheduledData.limitDate) : '- -'}
                </span>
            </div>

            <div style={{ ...colStyle, flex: `0 0 ${COL_WIDTHS.OTHERS}`, minWidth: COL_WIDTHS.OTHERS }}>
                {renderScheduledAlarmColumn()}
            </div>

            <div style={{ ...colStyle, flex: '1', minWidth: '220px' }}>
                {renderNextStepColumn()}
            </div>
        </div>
    );
};