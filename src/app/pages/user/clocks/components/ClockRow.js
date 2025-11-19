import React from 'react';
import moment from 'moment';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { FaMinus } from "react-icons/fa6";
import { calcularDiasHabiles, sumarDiasHabiles } from '../hooks/useClocksManager';

const MySwal = withReactContent(Swal);

export const ClockRow = (props) => {
    const { value, i, clock, onSave, onDelete, cat, outCodes, _CHILD_6_SELECT, _FIND_6, helpers, scheduleConfig } = props;
    const { getClock, getNewestDate, FUN_0_TYPE_TIME, suspensionPreActa, suspensionPostActa, extension, currentItem, calculateDaysSpent, totalSuspensionDays } = helpers;

    moment.locale('es');

    const formatDate = (dateStr) => dateStr ? moment(dateStr).format('DD MMM YYYY') : '';

    // =====================================================
    // CÁLCULO DEL LÍMITE PARA ACTA PARTE 1 (State 30)
    // =====================================================
    const calculateActa1Limit = () => {
        if (value.state !== 30) return null;

        const ldf = getClock(5)?.date_start;
        if (!ldf) return null;

        const baseDays = FUN_0_TYPE_TIME[currentItem.type] ?? 45;
        let totalDays = baseDays;

        if (suspensionPreActa.exists && suspensionPreActa.end?.date_start) {
            totalDays += suspensionPreActa.days;
        }

        if (extension.exists && extension.end?.date_start && !extension.isActive) {
            const acta1Date = getClock(30)?.date_start;
            if (!acta1Date || moment(extension.start.date_start).isBefore(acta1Date)) {
                totalDays += extension.days;
            }
        }

        const limitDate = sumarDiasHabiles(ldf, totalDays);
        const tip = `Base: ${baseDays} días + Suspensión: ${suspensionPreActa.days} días + Prórroga: ${extension.exists && !extension.isActive ? extension.days : 0} días = ${totalDays} días hábiles desde LDF`;

        return { limitDate, tooltip: tip };
    };

    // =====================================================
    // CÁLCULO DEL LÍMITE PARA SUSPENSIÓN (States 350/351)
    // =====================================================
    const calculateSuspensionLimit = () => {
        const isEndPre = value.state === 350;
        const isEndPost = value.state === 351;
        if (!isEndPre && !isEndPost) return null;

        const thisSusp = isEndPre ? suspensionPreActa : suspensionPostActa;
        if (!thisSusp.start?.date_start) return null;

        const otherUsedDays = isEndPre 
            ? (suspensionPostActa.end?.date_start ? suspensionPostActa.days : 0)
            : (suspensionPreActa.end?.date_start ? suspensionPreActa.days : 0);
        
        const availableForThis = 10 - otherUsedDays;
        const limitDate = sumarDiasHabiles(thisSusp.start.date_start, availableForThis);
        const tip = `Días hábiles disponibles para esta suspensión: ${availableForThis} (Total: 10, Usados en otra: ${otherUsedDays})`;

        return { limitDate, tooltip: tip };
    };

    // =====================================================
    // CÁLCULO DINÁMICO DE LÍMITES
    // =====================================================
    const calculateDynamicLimit = (limitConfig) => {
        if (!limitConfig || !Array.isArray(limitConfig)) return null;

        const isListOfOptions = Array.isArray(limitConfig[0]);

        if (isListOfOptions) {
            for (const option of limitConfig) {
                const result = calculateDynamicLimit(option);
                if (result) return result;
            }
            return null;
        }

        const [states, days] = limitConfig;
        if (states === undefined || days === undefined) return null;
        
        const startStates = Array.isArray(states) ? states : [states];
        const baseDate = getNewestDate(startStates);

        if (baseDate) {
            return sumarDiasHabiles(baseDate, days);
        }

        return null;
    };

    const renderLegalLimit = () => {
        let limitDate = null;
        let tooltip = 'Límite legal calculado según la normativa.';

        // Casos especiales y dinámicos para obtener la fecha límite
        if (value.state === 350 || value.state === 351) {
            const result = calculateSuspensionLimit();
            if (result) {
                limitDate = result.limitDate;
                tooltip = result.tooltip;
            }
        } else if (value.state === 30) {
            const result = calculateActa1Limit();
            if (result) {
                limitDate = result.limitDate;
                tooltip = result.tooltip;
            }
        } else if (value.limit) {
            limitDate = calculateDynamicLimit(value.limit);
        } else if (value.limitValues) {
            let baseDate = null;
            const corrTime = getClock(35)?.date_start;
            if (extension.exists && corrTime && extension.start.date_start >= corrTime && extension.end?.date_start) {
                baseDate = extension.start.date_start;
            } else if (suspensionPostActa.exists && suspensionPostActa.end?.date_start && corrTime && suspensionPostActa.end.date_start >= corrTime) {
                baseDate = suspensionPostActa.end.date_start;
            } else if (corrTime) {
                baseDate = corrTime;
            }
            if (baseDate) {
                limitDate = sumarDiasHabiles(baseDate, value.limitValues);
                tooltip = `Límite legal: ${value.limitValues} días hábiles desde ${formatDate(baseDate)}`;
            }
        }

        // Obtener los días gastados (lógica de la columna eliminada)
        const spentDaysResult = calculateDaysSpent(value, clock);
        let statusText = null;

        if (spentDaysResult) {
            const { days, startDate } = spentDaysResult;
            let scheduledTotal = null;

            if (scheduleConfig) {
                if (value.state === 30 && scheduleConfig.phase1Days) {
                    scheduledTotal = scheduleConfig.phase1Days;
                } else if (value.state === 61 && scheduleConfig.phase2Days) {
                    scheduledTotal = scheduleConfig.phase2Days;
                }
            }
            
            if (scheduledTotal !== null) {
                statusText = `${days}/${scheduledTotal}d invertidos`;
            } else {
                statusText = `${days}d invertidos`;
            }
        }

        if (!limitDate) {
            return <div className="legal-limit-cell" title="No aplica un límite legal para este evento.">-</div>;
        }
        
        return (
            <div className="legal-limit-cell" title={tooltip}>
                <div className="limit-date text-primary">
                    {formatDate(limitDate)}
                </div>
                {statusText && (
                    <div className="limit-status small text-muted">
                        {statusText}
                    </div>
                )}
            </div>
        );
    };

    // =====================================================
    // RENDERIZADO DE LÍMITE PROGRAMADO (YA EXISTENTE)
    // =====================================================
    const renderScheduledLimit = () => {
        if (!scheduleConfig) return <div className="scheduled-limit-cell" title="No hay una programación guardada para este proceso.">-</div>;

        const ldf = getClock(5)?.date_start;
        if (!ldf) return <div className="scheduled-limit-cell" title="La programación requiere la fecha de Legal y Debida Forma.">-</div>;

        let scheduledDays = null;
        let scheduledLimitDate = null;
        let remainingDays = null;
        let baseDateForSchedule = null;
        let tooltip = 'Límite según la programación interna.';

        if (value.state === 30 && scheduleConfig.phase1Days) {
            scheduledDays = scheduleConfig.phase1Days;
            baseDateForSchedule = ldf;
        } else if (value.state === 61 && scheduleConfig.phase2Days) {
            const corrTime = getClock(35)?.date_start;
            if(corrTime){
                scheduledDays = scheduleConfig.phase2Days;
                baseDateForSchedule = corrTime;
            } else {
                 tooltip = "Esperando fecha de correcciones para calcular.";
            }
        }
        
        if (scheduledDays && baseDateForSchedule) {
            scheduledLimitDate = sumarDiasHabiles(baseDateForSchedule, scheduledDays);
            tooltip = `${scheduledDays} días programados desde ${formatDate(baseDateForSchedule)}.`;
            const eventDate = clock?.date_start;

            if (eventDate) {
                const daysTaken = calcularDiasHabiles(baseDateForSchedule, eventDate);
                remainingDays = scheduledDays - daysTaken;
            } else {
                const today = moment().format('YYYY-MM-DD');
                const daysUsed = calcularDiasHabiles(baseDateForSchedule, today);
                remainingDays = scheduledDays - daysUsed;
            }
        } else if (scheduleConfig && (value.state === 30 || value.state === 61)) {
            // Caso donde hay plan pero no aplica a esta fila
        } else {
            return <div className="scheduled-limit-cell" title={tooltip}>-</div>;
        }
        
        const isOverdue = remainingDays !== null && remainingDays < 0;
        const colorClass = isOverdue ? 'text-danger' : (remainingDays === 0 && clock?.date_start) ? 'text-success' : 'text-primary';

        return (
            <div className="scheduled-limit-cell" title={tooltip}>
                {scheduledLimitDate && (
                    <div className={`scheduled-date ${colorClass}`}>
                        {formatDate(scheduledLimitDate)}
                    </div>
                )}
                {remainingDays !== null && !clock?.date_start && (
                    <div className={`scheduled-remaining small ${isOverdue ? 'text-danger' : 'text-success'}`}>
                        {isOverdue ? `Retraso: ${Math.abs(remainingDays)}d` : `Quedan: ${remainingDays}d`}
                    </div>
                )}
                 {clock?.date_start && (
                    <div className="scheduled-remaining small text-muted">Completado</div>
                )}
            </div>
        );
    };

    // =====================================================
    // RENDERIZADO DE NOMBRE DEL EVENTO
    // =====================================================
    const renderEventName = () => {
        const eventDesc = value.desc ? (typeof value.desc === 'string' ? value.desc : '') : '';
        const sentenceCaseEs = (s) => (s && typeof s === 'string') ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;
        const eventName = value.name ?? sentenceCaseEs(clock?.name) ?? '';
        
        if (eventDesc && eventDesc !== false) {
            return (
                <div className="d-flex align-items-center">
                    <span>{eventName}</span>
                    <span 
                        className="info-icon-tooltip"
                        data-tooltip={eventDesc}
                        title="Más información"
                    >
                        <i className="fas fa-info-circle"></i>
                    </span>
                </div>
            );
        }
        return <span>{eventName}</span>;
    };

    // =====================================================
    // ICONO DE ESTADO
    // =====================================================
    const get_clockExistIcon = (state, icon) => {
        const _CHILD = getClock(state);
        if (_CHILD && icon !== "empty") {
            if (_CHILD.date_start || _CHILD.name === "RADICACIÓN") {
                return <i className="far fa-check-circle text-success"></i>;
            }
            return <i className="far fa-dot-circle text-warning"></i>;
        }
        return <i className="far fa-circle text-muted"></i>;
    };

    // =====================================================
    // VALIDACIONES DE VISUALIZACIÓN
    // =====================================================
    if (value.show === false) return null;
    if (value.requiredClock && !getClock(value.requiredClock)?.date_start) return null;
    if (value.optional && !clock) return null;

    const currentDate = clock?.date_start ?? value.manualDate ?? '';
    const canEditDate = value.editableDate !== false && value.version === undefined;

    // =====================================================
    // CÁLCULO DE INDENTACIÓN
    // =====================================================
    let indentLevel = 0;
    if (value.title) {
        indentLevel = 0;
    } else if (value.name && (
        value.name.includes('Comunicación') || 
        value.name.includes('Notificación') || 
        value.name.includes('Citación') || 
        value.name.includes('Prórroga') ||
        value.name.includes('Radicación de Correcciones') ||
        value.name.includes('Traslado') ||
        value.name.includes('Declaracion') ||
        value.name.includes('superintendencia') ||
        value.name.includes('Recepción') ||
        value.name.includes('Fin de')
    )) {
        indentLevel = 2;
    } else {
        indentLevel = 1;
    }

    // =====================================================
    // RENDERIZADO FINAL (🆕 CON COLUMNAS UNIFICADAS)
    // =====================================================
    return (
        <React.Fragment>
            {value.title ? (
                <div className="exp-section" style={{ '--cat': cat.color }}>
                    <div className="d-flex align-items-center mb-1">
                        <i className={`fas ${cat.icon} me-2`}></i>
                        <strong className="text-uppercase">{value.title}</strong>
                    </div>
                </div>
            ) : (
                <div className="exp-row border-bottom" style={{ '--cat': cat.color }}>
                    <div className="row g-0 align-items-stretch w-100 m-0">
                        {/* COLUMNA 1: NOMBRE DEL EVENTO */}
                        <div className="col-5 px-1 py-2 cell-border">
                            <div style={{ paddingLeft: `${indentLevel * 1.1}rem` }} className="d-flex align-items-center h-100">
                                {indentLevel > 0 && (
                                    <span className="text-muted me-2" style={{ fontSize: '1rem', display: 'inline-flex', alignItems: 'center' }}>
                                        {indentLevel === 2 ? <FaMinus /> : ''}
                                    </span>
                                )}
                                <span className="me-2" style={{ minWidth: 16, display: 'flex', alignItems: 'center' }}>
                                    {get_clockExistIcon(value.state, value.icon)}
                                </span>
                                {renderEventName()}
                            </div>
                        </div>

                        {/* COLUMNA 2: FECHA DEL EVENTO */}
                        <div className="col-2 px-1 cell-border">
                            <div className="exp-row-content">
                                {canEditDate ? (
                                    <>
                                        <input 
                                            type="date" 
                                            className="form-control form-control-sm p-1" 
                                            id={'clock_exp_date_' + i} 
                                            max="2100-01-01" 
                                            defaultValue={currentDate} 
                                            onBlur={() => onSave(value, i)} 
                                        />
                                        {currentDate && (
                                            <button 
                                                className="btn-delete-date" 
                                                title="Eliminar fecha"
                                                onClick={() => onDelete(value)}
                                            >
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <span className="text-center small">
                                        {currentDate ? formatDate(currentDate) : <span className='text-muted'>-</span>}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* 🆕 COLUMNA 3: LÍMITE LEGAL (UNIFICADA) */}
                        <div className="col-3 text-center small cell-border">
                            <div className="exp-row-content">
                                {renderLegalLimit()}
                            </div>
                        </div>

                        {/* 🆕 COLUMNA 4: LÍMITE PROGRAMADO */}
                        <div className="col-2 text-center small">
                            <div className="exp-row-content">
                                {renderScheduledLimit()}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </React.Fragment>
    );
};