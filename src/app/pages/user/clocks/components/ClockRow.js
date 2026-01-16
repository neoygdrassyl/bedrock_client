import React from 'react';
import moment from 'moment';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { calcularDiasHabiles, sumarDiasHabiles } from '../hooks/useClocksManager';
import { calculateScheduledLimitForDisplay } from '../utils/scheduleUtils';

const MySwal = withReactContent(Swal);

export const ClockRow = (props) => {
    const { value, i, clock, onSave, onDelete, helpers, scheduleConfig, systemDate, isHighlighted } = props;
    const { getClock, getClockVersion, FUN_0_TYPE_TIME, suspensionPreActa, suspensionPostActa, extension, currentItem, calculateDaysSpent, viaTime } = helpers;

    moment.locale('es');

    // Resolver reloj según versión
    const getClockScoped = (state) => {
        if (value.version !== undefined) {
            return getClockVersion(state, value.version) || getClock(state);
        }
        return getClock(state);
    };

    // Formateador textual
    const formatDate = (dateStr) => dateStr ? moment(dateStr).format('D [de] MMMM') : '- -';

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

        let text = '';
        let color = '';
        let icon = null;

        if (isCompleted) {
            const completionDate = moment(clock.date_start);
            
            // Si la fecha de finalización es DESPUÉS de la fecha límite, hay retraso.
            if (completionDate.isAfter(limitMoment, 'day')) {
                // Contamos los días hábiles ENTRE la fecha límite y la de finalización.
                // No se incluye el día límite (tercer argumento false o no presente).
                const delayDays = calcularDiasHabiles(limitMoment.toDate(), completionDate.toDate());
                text = `Retraso de ${delayDays} día(s)`;
                color = '#e03131';
                icon = 'fa-exclamation-circle';
            } else {
                // Si es el mismo día o antes, está a tiempo.
                text = `A tiempo`;
                color = '#2f9e44';
                icon = 'fa-check';
            }
        } else {
            // Lógica para eventos pendientes (no se modifica)
            const isOverdue = today.isAfter(limitMoment, 'day');
            
            if (isOverdue) {
                const overdueDays = calcularDiasHabiles(limitMoment.toDate(), today.toDate());
                text = `Retrasado por ${overdueDays} día(s)`;
                color = '#e03131';
                icon = 'fa-exclamation-circle';
            } else {
                const remainingDays = calcularDiasHabiles(today.toDate(), limitMoment.toDate());
                text = `${remainingDays} día(s) restante(s)`;
                color = '#f08c00'; // Naranja por defecto
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

    // Nombre evento sentence case
    const sentenceCaseEs = (s) => (s && typeof s === 'string') ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;
    const eventName = value.name ?? sentenceCaseEs(clock?.name) ?? '';

    // Icono inicial
    const rowIcon = getRowIcon();
    
    // Clase condicional para resaltar el título
    const titleClassName = `row-title text-truncate ${isHighlighted ? 'title-highlight' : ''}`;
    const blockClassName = `exp-row-custom ${isHighlighted ? 'active-row-container' : ''}`;
    const dateInputClassName = `form-control form-control-sm border-0 bg-transparent dates-input-class ${currentDate ? '' : 'padding-date-input'}`;

    return (
        <div className={blockClassName}>
            {/* COL 1: Evento (Icono + Texto) */}
            <div className="col-eventos d-flex align-items-center">
                <div className="row-icon-container">
                    {rowIcon}
                </div>
                <div 
                    className={titleClassName} 
                    onClick={openDetailModal}
                    title="Ver detalles"
                >
                    {eventName}
                    {clock?.desc && clock.desc.includes('|| OBS:') && (
                        <i className="fas fa-comment-dots ms-2 text-info" title="Tiene observaciones" style={{fontSize: '0.75rem'}}></i>
                    )}
                </div>
            </div>

            {/* COL 2: Fecha Evento (Input Restaurado) */}
            {canEditDate ? (
                <div className="col-fecha d-flex align-items-center date-input-container">
                    <div className="input-group input-group-sm pl-0" style={{maxWidth: 'auto'}}>
                    <input 
                        type="date" 
                        className={dateInputClassName}
                        style={{fontSize: '0.85rem', color: '#495057', fontWeight: 500}}
                        id={'clock_exp_date_' + i} 
                        defaultValue={currentDate} 
                        max="2100-01-01" 
                        onBlur={() => onSave(value, i)} 
                    />
                    {currentDate && (
                        <button className="btn btn-link text-dark p-0 d-flex align-items-center justify-content-center" onClick={() => onDelete(value)} title="Eliminar fecha">
                            <i className="fas fa-eraser fa-xs"></i>
                        </button>
                    )}
                    </div>
                </div>
            ) : (
                <div className="col-fecha d-flex align-items-center">
                    <span className="text-dark fw-bold">{formatDate(currentDate)}</span>
                </div>
            )}

            {/* COL 3: Límite Legal */}
            <div className="col-limite d-flex align-items-center">
                <span className="text-dark" style={{fontSize: '0.85rem'}}>
                    {legalData.limitDate ? formatDate(legalData.limitDate) : ''}
                </span>
            </div>

            {/* COL 4: Límite Programado */}
            <div className="col-programado d-flex align-items-center">
                <span className="text-dark" style={{fontSize: '0.85rem'}}>
                    {scheduledData && scheduledData.limitDate ? formatDate(scheduledData.limitDate) : '- -'}
                </span>
            </div>

             {/* COL 5: Alarma (LEGAL) */}
             <div className="col-alarma d-flex align-items-center">
                {renderAlarmColumn()}
            </div>
        </div>
    );
};