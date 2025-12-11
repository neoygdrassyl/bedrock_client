import React from 'react';
import moment from 'moment';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { FaMinus } from "react-icons/fa6";
import { calcularDiasHabiles, sumarDiasHabiles } from '../hooks/useClocksManager';
import { calculateScheduledLimitForDisplay } from '../utils/scheduleUtils';

const MySwal = withReactContent(Swal);

export const ClockRow = (props) => {
    const { value, i, clock, onSave, onDelete, cat, outCodes, _CHILD_6_SELECT, _FIND_6, helpers, scheduleConfig } = props;
    const { getClock, getClockVersion, getNewestDate, FUN_0_TYPE_TIME, suspensionPreActa, suspensionPostActa, extension, currentItem, calculateDaysSpent, totalSuspensionDays, viaTime } = helpers;

    moment.locale('es');

    // Resolver reloj según versión (para que límites de desistimiento usen el proceso correcto)
    const getClockScoped = (state) => {
        if (value.version !== undefined) {
            return getClockVersion(state, value.version) || getClock(state);
        }
        return getClock(state);
    };

    const formatDate = (dateStr) => dateStr ?  moment(dateStr). format('DD MMM YYYY') : '';

    // =====================================================
    // CÁLCULO DEL LÍMITE PARA ACTA PARTE 1 (State 30)
    // =====================================================
    const calculateActa1Limit = () => {
        if (value.state !== 30) return null;

        const ldf = getClockScoped(5)?.date_start;
        if (!ldf) return null;

        const baseDays = FUN_0_TYPE_TIME[currentItem. type] ?? 45;
        let totalDays = baseDays;

        // Sumamos días de suspensión pre-acta si están cerrados
        if (suspensionPreActa.exists && suspensionPreActa. end?.date_start) {
            totalDays += suspensionPreActa.days;
        }

        // Sumamos días de prórroga si aplica antes del acta
        if (extension.exists && extension. end?.date_start && ! extension.isActive) {
            const acta1Date = getClockScoped(30)?.date_start;
            if (! acta1Date || moment(extension.start.date_start). isBefore(acta1Date)) {
                totalDays += extension.days;
            }
        }

        const limitDate = sumarDiasHabiles(ldf, totalDays);
        const tip = `Base: ${baseDays} + Susp: ${suspensionPreActa.days} + Prórroga: ${extension.exists && ! extension.isActive ? extension.days : 0} = ${totalDays} días hábiles desde LDF`;

        return { limitDate, tooltip: tip };
    };

    // =====================================================
    // CÁLCULO DEL LÍMITE PARA SUSPENSIÓN (States 350/351)
    // =====================================================
    const calculateSuspensionLimit = () => {
        const isEndPre = value.state === 350;
        const isEndPost = value. state === 351;
        if (!isEndPre && ! isEndPost) return null;

        const thisSusp = isEndPre ? suspensionPreActa : suspensionPostActa;
        if (!thisSusp. start?. date_start) return null;

        const otherUsedDays = isEndPre 
            ? (suspensionPostActa.end?.date_start ?  suspensionPostActa.days : 0)
            : (suspensionPreActa.end?.date_start ? suspensionPreActa.days : 0);
        
        const availableForThis = 10 - otherUsedDays;
        const limitDate = sumarDiasHabiles(thisSusp.start.date_start, availableForThis);
        const tip = `Días disponibles: ${availableForThis} (Total 10 - Usados otra susp: ${otherUsedDays})`;

        return { limitDate, tooltip: tip };
    };

    // =====================================================
    // CÁLCULO DEL LÍMITE PARA VIABILIDAD (States 49 y 61)
    // =====================================================
    const calculateViabilityLimit = () => {
        // Solo aplica para estados 49 (Acta 2) y 61 (Viabilidad)
        if (value.state !== 49 && value.state !== 61) return null;

        const ldf = getClockScoped(5)?.date_start;
        const acta1 = getClockScoped(30);
        const corrDate = getClockScoped(35)?.date_start; // Fecha de correcciones

        // Si no hay LDF, no podemos calcular nada
        if (!ldf) return null;

        // 1. Calcular Días Totales Disponibles para Curaduría
        const baseDays = FUN_0_TYPE_TIME[currentItem.type] ?? 45;
        
        // Incluimos TODAS las suspensiones cerradas y prórrogas cerradas al total de días
        const totalSuspension = (suspensionPreActa.exists && suspensionPreActa.end?.date_start ? suspensionPreActa.days : 0) +
                                (suspensionPostActa.exists && suspensionPostActa.end?.date_start ? suspensionPostActa.days : 0);
        
        const totalExtension = (extension.exists && extension.end?.date_start ? extension.days : 0);
        
        const totalCuraduriaDays = baseDays + totalSuspension + totalExtension;

        // Determinar escenario: Lógica ESTRICTA de cumplimiento
        // Solo es verdadero si el texto contiene la frase exacta.
        const complianceString = "ACTA PARTE 1 OBSERVACIONES: CUMPLE";
        const isCumple = acta1?.desc?.includes(complianceString);
        const hasActa = !!acta1?.date_start;

        // ESCENARIO A: ACTA 1 CUMPLE (O no hay acta aún y asumimos proyección ideal desde LDF)
        // Lógica: Fecha Límite = LDF + Total Días Curaduría
        if (isCumple || !hasActa) {
            const limitDate = sumarDiasHabiles(acta1?.date_start, viaTime);
            const tooltip = `Caso CUMPLE (o proyección inicial): Desde Acta parte 1 (${formatDate(acta1?.date_start)}) + ${viaTime} días totales (Base ${baseDays} + Susp ${totalSuspension} + Prórroga ${totalExtension})`;
            return { limitDate, tooltip };
        }

        // ESCENARIO B: ACTA 1 NO CUMPLE (Cualquier otro texto en el acta)
        // Lógica: Fecha Límite = Fecha Radicación Correcciones + Días Restantes (viaTime)
        if (hasActa && !isCumple) {
            if (corrDate) {
                // Si ya hay correcciones, usamos la fecha de correcciones + días restantes
                // Nota: viaTime ya viene calculado correctamente (incluyendo regla de día siguiente) desde el hook
                const limitDate = sumarDiasHabiles(corrDate, viaTime);
                const tooltip = `Caso CORRECCIONES: Desde Radicación Correcciones (${formatDate(corrDate)}) + ${viaTime} días restantes`;
                return { limitDate, tooltip };
            } else {
                // Si NO hay correcciones aún, pero el acta ya se emitió y no cumple
                return { limitDate: null, tooltip: "Esperando radicación de correcciones para calcular límite." };
            }
        }

        return null;
    };

    // =====================================================
    // CÁLCULO DINÁMICO DE LÍMITES (GENÉRICO)
    // =====================================================
    const calculateDynamicLimit = (limitConfig) => {
        if (!limitConfig || !Array.isArray(limitConfig)) return null;

        const isDirectConfig = typeof limitConfig[1] === 'number';

        if (! isDirectConfig) {
            for (const option of limitConfig) {
                const result = calculateDynamicLimit(option);
                if (result) return result;
            }
            return null;
        }

        const [states, days] = limitConfig;
        if (states === undefined || days === undefined) return null;
        
        const startStates = Array.isArray(states) ? states : [states];
        const baseDate = (() => {
            // Para clocks versionados (desistimientos) usamos la versión actual
            for (const st of startStates) {
                const c = getClockScoped(st);
                if (c?.date_start) return c.date_start;
            }
            return null;
        })();

        if (baseDate) {
            return sumarDiasHabiles(baseDate, days);
        }

        return null;
    };

    const renderLegalLimit = () => {
        let limitDate = null;
        let tooltip = 'Límite legal calculado según la normativa. ';

        // Caso especial: Suspensiones (350/351)
        if (value.state === 350 || value.state === 351) {
            const result = calculateSuspensionLimit();
            if (result) {
                limitDate = result.limitDate;
                tooltip = result.tooltip;
            }
        } 
        // Caso especial: Acta Parte 1 (30)
        else if (value.state === 30) {
            const result = calculateActa1Limit();
            if (result) {
                limitDate = result.limitDate;
                tooltip = result. tooltip;
            }
        } 
        // Caso especial: Viabilidad (49 y 61) - NUEVA LÓGICA
        else if (value.state === 49 || value.state === 61) {
            const result = calculateViabilityLimit();
            if (result) {
                limitDate = result.limitDate;
                tooltip = result.tooltip;
            }
        }
        // Caso general: usar limit config
        else if (value.limit) {
            limitDate = calculateDynamicLimit(value.limit);
        }

        // Obtener los días gastados
        const spentDaysResult = calculateDaysSpent(value, clock);
        let statusText = null;

        if (spentDaysResult) {
            const { days, startDate } = spentDaysResult;
            let scheduledTotal = null;

            if (scheduleConfig) {
                if (value.state === 30 && scheduleConfig.phase1Days) {
                    scheduledTotal = scheduleConfig.phase1Days;
                } else if (value. state === 61 && scheduleConfig.phase2Days) {
                    scheduledTotal = scheduleConfig.phase2Days;
                }
            }
            
            if (scheduledTotal !== null) {
                statusText = `${days}/${scheduledTotal}d invertidos`;
            } else {
                statusText = `${days}d invertidos`;
            }
        }

        if (! limitDate) {
            return <div className="legal-limit-cell" title="No aplica un límite legal para este evento o faltan fechas previas.">-</div>;
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
    // RENDERIZADO DE LÍMITE PROGRAMADO
    // =====================================================
    const renderScheduledLimit = () => {
        if (!scheduleConfig || !scheduleConfig.times) {
            return <div className="scheduled-limit-cell" title="No hay una programación guardada para este proceso.">-</div>;
        }

        // Usar la nueva utilidad para calcular el límite programado
        const scheduledLimit = calculateScheduledLimitForDisplay(
            value.state,
            value,
            clock,
            scheduleConfig,
            getClock,
            getClockVersion,
            helpers
        );

        if (!scheduledLimit) {
            return <div className="scheduled-limit-cell" title="Este tiempo no tiene programación.">-</div>;
        }

        const { limitDate, days, display } = scheduledLimit;
        
        // Determinar si hay retraso
        let isCompleted = !!clock?.date_start;
        let isOverdue = false;
        let remainingDays = null;

        if (limitDate && !isCompleted) {
            const today = moment().format('YYYY-MM-DD');
            if (moment(today).isAfter(limitDate)) {
                isOverdue = true;
                remainingDays = calcularDiasHabiles(limitDate, today, true);
            } else {
                remainingDays = calcularDiasHabiles(today, limitDate, true);
            }
        }

        const colorClass = isOverdue ? 'text-danger' : isCompleted ? 'text-success' : 'text-primary';

        return (
            <div className="scheduled-limit-cell" title={`Límite programado: ${display}`}>
                {limitDate ? (
                    <>
                        <div className={`scheduled-date ${colorClass}`}>
                            {moment(limitDate).format('DD MMM YYYY')}
                        </div>
                        {days && (
                            <div className="scheduled-remaining small text-muted">
                                {days} días
                            </div>
                        )}
                        {!isCompleted && remainingDays !== null && (
                            <div className={`scheduled-remaining small ${isOverdue ? 'text-danger' : 'text-success'}`}>
                                {isOverdue ? `Retraso: ${remainingDays}d` : `Quedan: ${remainingDays}d`}
                            </div>
                        )}
                        {isCompleted && (
                            <div className="scheduled-remaining small text-muted">Completado</div>
                        )}
                    </>
                ) : (
                    <div className="scheduled-remaining small text-warning">
                        {display}
                    </div>
                )}
            </div>
        );
    };

    // =====================================================
    // RENDERIZADO DE NOMBRE DEL EVENTO
    // =====================================================
    const renderEventName = () => {
        const eventDesc = value.desc ?  (typeof value.desc === 'string' ? value.desc : '') : '';
        const sentenceCaseEs = (s) => (s && typeof s === 'string') ? s.charAt(0).toUpperCase() + s. slice(1). toLowerCase() : s;
        const eventName = value.name ??  sentenceCaseEs(clock?.name) ?? '';
        
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

    const get_clockExistIcon = (state, icon) => {
        const _CHILD = getClockScoped(state);
        if (_CHILD && icon !== "empty") {
            if (_CHILD.date_start || _CHILD.name === "RADICACIÓN") {
                return <i className="far fa-check-circle text-success"></i>;
            }
            return <i className="far fa-dot-circle text-warning"></i>;
        }
        return <i className="far fa-circle text-muted"></i>;
    };

    if (value.show === false) return null;
    if (value.requiredClock && !getClockScoped(value.requiredClock)?.date_start) return null;
    if (value.optional && !clock) return null;

    const currentDate = clock?.date_start ??  value.manualDate ??  '';
    const canEditDate = value.editableDate !== false;

    let indentLevel = 0;
    if (value. title) {
        indentLevel = 0;
    } else if (value.name && (
        value.name.includes('Comunicación') || 
        value. name.includes('Notificación') || 
        value. name.includes('Citación') || 
        value.name. includes('Prórroga') ||
        value. name.includes('Radicación de Correcciones') ||
        value.name.includes('Traslado') ||
        value. name.includes('Declaracion') ||
        value.name.includes('superintendencia') ||
        value.name.includes('Recepción') ||
        value.name.includes('Fin de')
    )) {
        indentLevel = 2;
    } else {
        indentLevel = 1;
    }

    return (
        <React.Fragment>
            {value.title ?  (
                <div className="exp-section" style={{ '--cat': cat. color }}>
                    <div className="d-flex align-items-center mb-1">
                        <i className={`fas ${cat.icon} me-2`}></i>
                        <strong className="text-uppercase">{value.title}</strong>
                    </div>
                </div>
            ) : (
                <div className="exp-row border-bottom" style={{ '--cat': cat.color }}>
                    <div className="row g-0 align-items-stretch w-100 m-0">
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

                        <div className="col-2 px-1 cell-border">
                            <div className="exp-row-content">
                                {canEditDate ?  (
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
                                        {currentDate ?  formatDate(currentDate) : <span className='text-muted'>-</span>}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="col-3 text-center small cell-border">
                            <div className="exp-row-content">
                                {renderLegalLimit()}
                            </div>
                        </div>

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