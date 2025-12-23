import React from 'react';
import moment from 'moment';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { calcularDiasHabiles, sumarDiasHabiles } from '../hooks/useClocksManager';
import { calculateScheduledLimitForDisplay } from '../utils/scheduleUtils';

const MySwal = withReactContent(Swal);

export const ClockRow = (props) => {
    const { value, i, clock, onSave, onDelete, helpers, scheduleConfig, systemDate } = props;
    const { getClock, getClockVersion, FUN_0_TYPE_TIME, suspensionPreActa, suspensionPostActa, extension, currentItem, calculateDaysSpent, viaTime } = helpers;

    moment.locale('es');

    // Resolver reloj según versión
    const getClockScoped = (state) => {
        if (value.version !== undefined) {
            return getClockVersion(state, value.version) || getClock(state);
        }
        return getClock(state);
    };

    // Formateador simple
    const formatDate = (dateStr) => dateStr ? moment(dateStr).format('D [de] MMMM') : '- -';

    // =====================================================
    // CÁLCULO DE ICONOS Y ESTADOS (SEMÁFORO)
    // =====================================================
    const getRowIcon = () => {
        const currentDate = clock?.date_start ?? value.manualDate;
        
        if (currentDate) {
            return <i className="fas fa-check" style={{ color: '#80B882', fontSize: '1rem' }}></i>;
        }
        
        if (value.requiredClock && !getClockScoped(value.requiredClock)?.date_start) {
             return <i className="fas fa-minus-circle" style={{ color: '#EBEBEB', fontSize: '1rem' }}></i>;
        }

        const isCritical = ['Citación', 'Notificación'].some(k => (value.name || '').includes(k)); 
        
        if (isCritical) {
            return <i className="fas fa-exclamation-circle" style={{ color: '#C52D2D', fontSize: '1rem' }}></i>;
        }

        return <i className="fas fa-minus-circle" style={{ color: '#F0D228', fontSize: '1rem' }}></i>;
    };


    // =====================================================
    // CÁLCULO DE LÍMITES LEGALES
    // =====================================================
    const calculateLegalData = () => {
        let limitDate = null;
        let tooltip = '';
        let baseDate = null; // Para la línea de tiempo

        if (value.state === 350 || value.state === 351) {
            const isEndPre = value.state === 350;
            const thisSusp = isEndPre ? suspensionPreActa : suspensionPostActa;
            if (thisSusp.start?.date_start) {
                baseDate = thisSusp.start.date_start;
                const otherUsedDays = isEndPre 
                ? (suspensionPostActa.end?.date_start ?  suspensionPostActa.days : 0)
                : (suspensionPreActa.end?.date_start ? suspensionPreActa.days : 0);
                const availableForThis = 10 - otherUsedDays;
                limitDate = sumarDiasHabiles(thisSusp.start.date_start, availableForThis);
                tooltip = `Suspensión: Máximo ${availableForThis} días hábiles`;
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
                     baseDate = acta1?.date_start || ldf; // Fallback a ldf si es proyección
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
                            baseDate = c.date_start; // Capturamos la fecha base
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
    // CÁLCULO DE ALARMA
    // =====================================================
    const getAlarmInfo = () => {
        if (!scheduledData || !scheduledData.limitDate) return null;
        const { limitDate } = scheduledData;
        const isCompleted = !!clock?.date_start;
        const today = systemDate;
        
        let text = '';
        let color = '';
        let icon = null;

        if (isCompleted) {
            const diff = calcularDiasHabiles(limitDate, clock.date_start, true);
            if (diff <= 0) {
                text = `Completado ${Math.abs(diff)} días antes`;
                color = '#80B882';
            } else {
                text = `Retraso ${diff} días`;
                color = '#C52D2D';
            }
        } else {
            const isOverdue = moment(today).isAfter(limitDate);
            const remaining = calcularDiasHabiles(isOverdue ? limitDate : today, isOverdue ? today : limitDate, true);
            
            if (isOverdue) {
                 text = `Retraso ${remaining} días`;
                 color = '#C52D2D';
            } else {
                 text = `Restante: ${remaining} días`;
                 color = '#9E8600';
                 icon = 'fa-exclamation-triangle';
            }
        }
        return { text, color, icon };
    };
    
    const alarmInfo = getAlarmInfo();

    const renderAlarmColumn = () => {
        if (!alarmInfo) return null;
        return (
            <span style={{ color: alarmInfo.color, fontWeight: 500 }}>
                {alarmInfo.text} {alarmInfo.icon && <i className={`fas ${alarmInfo.icon} ms-1`} style={{fontSize: '0.8rem'}}></i>}
            </span>
        );
    };


    // =====================================================
    // MODAL DE DETALLE MEJORADO
    // =====================================================
    const openDetailModal = () => {
        const title = value.name || value.title || 'Detalle del Evento';
        const desc = value.desc || 'Sin descripción adicional.';
        
        // --- Generar HTML de la Línea de Tiempo ---
        let timelineHtml = '';
        if (legalData.limitDate && legalData.baseDate) {
            const start = moment(legalData.baseDate);
            const end = moment(legalData.limitDate);
            const current = clock?.date_start ? moment(clock.date_start) : moment(systemDate);
            
            const totalDuration = end.diff(start, 'days');
            let progress = current.diff(start, 'days');
            
            // Normalizar porcentajes (0-100%)
            let percent = totalDuration > 0 ? (progress / totalDuration) * 100 : 0;
            if (percent < 0) percent = 0;
            if (percent > 100) percent = 100;
            
            const isCompleted = !!clock?.date_start;
            const flagColor = isCompleted ? '#80B882' : (percent >= 100 ? '#C52D2D' : '#5bc0de');
            
            timelineHtml = `
                <div class="mt-3 mb-2">
                    <div class="d-flex justify-content-between small text-muted mb-1">
                        <span>Inicio: ${start.format('DD MMM')}</span>
                        <span>Límite: ${end.format('DD MMM')}</span>
                    </div>
                    <div style="position: relative; height: 6px; background: #e9ecef; border-radius: 3px; margin: 0 5px;">
                        <div style="position: absolute; left: 0; top: 0; height: 100%; width: ${percent}%; background: ${flagColor}; border-radius: 3px;"></div>
                        <div style="position: absolute; left: ${percent}%; top: -14px; transform: translateX(-50%); color: ${flagColor}; font-size: 14px;">
                            <i class="fas fa-flag"></i>
                        </div>
                    </div>
                     <div class="text-center small mt-2 text-muted">
                        ${isCompleted ? `Completado el ${current.format('DD MMM')}` : 'En progreso'}
                    </div>
                </div>
            `;
        }

        MySwal.fire({
            title: `<h5 class="fw-bold text-start mb-0" style="color:#343a40">${title}</h5>`,
            html: `
                <div class="text-start pb-2 border-bottom mb-3" style="color:#6c757d; font-size: 0.9rem;">
                    ${desc}
                </div>
                
                <div class="row g-2 text-start">
                    <div class="col-6">
                        <div class="p-2 border rounded bg-light h-100">
                             <div class="small fw-bold text-secondary text-uppercase mb-1">Legal</div>
                             <div class="fw-bold text-dark">${legalData.limitDate ? formatDate(legalData.limitDate) : '-'}</div>
                             <div class="small text-muted">${legalData.spentText || '-'}</div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="p-2 border rounded bg-light h-100">
                             <div class="small fw-bold text-secondary text-uppercase mb-1">Programado</div>
                             <div class="fw-bold text-dark">${scheduledData && scheduledData.limitDate ? formatDate(scheduledData.limitDate) : '-'}</div>
                             <div class="small text-muted">${scheduledData ? `${scheduledData.days} días` : '-'}</div>
                        </div>
                    </div>
                </div>

                ${alarmInfo ? `
                <div class="mt-2 p-2 rounded text-start" style="background-color: ${alarmInfo.color}15; border: 1px solid ${alarmInfo.color}40;">
                     <strong style="color: ${alarmInfo.color}">Alarma:</strong> <span class="small text-dark">${alarmInfo.text}</span>
                </div>
                ` : ''}

                ${timelineHtml}
            `,
            showCloseButton: true,
            showConfirmButton: false,
            width: '400px',
            padding: '1.5rem'
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

    return (
        <div className="exp-row-custom">
            {/* COL 1: Evento (Icono + Texto) */}
            <div className="col-eventos d-flex align-items-center">
                <div className="row-icon-container">
                    {rowIcon}
                </div>
                <div 
                    className="row-title text-truncate" 
                    onClick={openDetailModal}
                    title="Ver detalles"
                >
                    {eventName}
                </div>
            </div>

            {/* COL 2: Fecha Evento (Input Restaurado) */}
            <div className="col-fecha d-flex align-items-center">
                {canEditDate ? (
                     <div className="input-group input-group-sm" style={{maxWidth: '130px'}}>
                        <input 
                            type="date" 
                            className="form-control form-control-sm border-0 bg-transparent px-1"
                            style={{fontSize: '0.85rem', color: '#495057', fontWeight: 500}}
                            id={'clock_exp_date_' + i} 
                            defaultValue={currentDate} 
                            max="2100-01-01" 
                            onBlur={() => onSave(value, i)} 
                        />
                        {currentDate && (
                            <button className="btn btn-link text-danger p-0 ms-1" onClick={() => onDelete(value)} title="Eliminar fecha">
                                <i className="fas fa-times"></i>
                            </button>
                        )}
                    </div>
                ) : (
                     <span className="text-dark fw-bold ps-2">{formatDate(currentDate)}</span>
                )}
            </div>

            {/* COL 3: Límite Legal */}
            <div className="col-limite d-flex align-items-center">
                <span className="text-dark">
                    {legalData.limitDate ? formatDate(legalData.limitDate) : ''}
                </span>
            </div>

            {/* COL 4: Límite Programado */}
            <div className="col-programado d-flex align-items-center">
                <span className="text-dark">
                    {scheduledData && scheduledData.limitDate ? formatDate(scheduledData.limitDate) : '- -'}
                </span>
            </div>

             {/* COL 5: Alarma */}
             <div className="col-alarma d-flex align-items-center">
                {renderAlarmColumn()}
            </div>
        </div>
    );
};