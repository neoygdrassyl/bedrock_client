import React from 'react';
import moment from 'moment';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { FaRegFile} from 'react-icons/fa';
import { FaMinus } from "react-icons/fa6";
import { dateParser_finalDate, dateParser_dateDiff } from '../../../../components/customClasses/typeParse';
import VIZUALIZER from '../../../../components/vizualizer.component';


const MySwal = withReactContent(Swal);


export const ClockRow = (props) => {
    const { value, i, clock, onSave, onDelete, cat, outCodes, _CHILD_6_SELECT, _FIND_6, helpers } = props;
    const { getClock, getNewestDate, FUN_0_TYPE_TIME, suspensionPreActa, suspensionPostActa, extension, currentItem, calculateDaysSpent, totalSuspensionDays } = helpers;


    moment.locale('es');


    const formatDate = (dateStr) => dateStr ? moment(dateStr).format('DD MMM YYYY') : '';


    const showSuspensionInfo = (suspensionData, type) => {
        const typeText = type === 'pre' ? 'Antes del Acta' : 'Después del Acta';
        MySwal.fire({
            title: `Suspensión ${typeText}`,
            html: `
            <div class="text-start">
                <p><strong>Ubicación:</strong> ${typeText}</p>
                <p><strong>Fecha de Inicio:</strong> ${formatDate(suspensionData.start?.date_start) || 'No definida'}</p>
                <p><strong>Fecha de Fin:</strong> ${formatDate(suspensionData.end?.date_start) || 'Pendiente por definir'}</p>
                <p><strong>Días de Suspensión:</strong> ${suspensionData.days || 'Pendiente'}</p>
                ${suspensionData.start?.desc ? `<p><strong>Información:</strong><br>${suspensionData.start.desc}</p>` : ''}
            </div>`,
            icon: 'info',
            confirmButtonText: 'Cerrar'
        });
    };


    const get_clockExistIcon = (state, icon) => {
        const _CHILD = getClock(state);
        if (_CHILD && icon !== "empty") {
            if (_CHILD.date_start || _CHILD.name === "RADICACIÓN") return <i className="far fa-check-circle text-success"></i>;
            return <i className="far fa-dot-circle text-warning"></i>;
        }
        return <i className="far fa-dot-circle"></i>;
    };


    const renderActa1LimitSmart = () => {
        if (value.state !== 30) return null;
        // Si no hay legal, no se puede calcular el límite
        const ldf = getClock(5)?.date_start;
        if (!ldf) return <span className="text-danger">-</span>;
        const baseDays = FUN_0_TYPE_TIME[currentItem.type] ?? 45;

        const finishCandidates = [];
        if (extension?.end?.date_start) finishCandidates.push({ date: extension.end.date_start, kind: 'EXT_END' });
        if (suspensionPreActa?.end?.date_start) finishCandidates.push({ date: suspensionPreActa.end.date_start, kind: 'SUSP_PRE_END' });

        const startCandidates = [];
        // if (extension?.start?.date_start) startCandidates.push({ date: extension.start.date_start, kind: 'EXT_START' });
        // if (suspensionPreActa?.start?.date_start) startCandidates.push({ date: suspensionPreActa.start.date_start, kind: 'SUSP_PRE_START' });


        const pickMostRecent = (arr) => arr.sort((a, b) => (moment(a.date).isAfter(b.date) ? -1 : 1))[0];
        
        let baseChoice = pickMostRecent(finishCandidates) || pickMostRecent(startCandidates) || { date: ldf, kind: 'LDF' };
        
        let usedBeforeBase = (baseChoice.kind === 'SUSP_PRE_END' && suspensionPreActa?.start?.date_start)
            ? dateParser_dateDiff(ldf, suspensionPreActa.start.date_start)
            : dateParser_dateDiff(ldf, baseChoice.date);
        
        const extDays = (extension?.exists && extension.start?.date_start && moment(extension.start.date_start).isSameOrAfter(ldf)) ? extension.days : 0;
        let remainingDays = Math.max(0, baseDays - usedBeforeBase + extDays);
        const limitDate = dateParser_finalDate(baseChoice.date, remainingDays);
        const tip = `Base: ${baseChoice.kind} | Usados: ${usedBeforeBase} | Prórroga: ${extDays} | Restantes: ${remainingDays}`;
        return <span className="text-primary" title={tip}>{formatDate(limitDate)}</span>;
    };


    const renderSuspensionRemainingLimit = () => {
        const isEndPre = value.state === 350;
        const isEndPost = value.state === 351;
        if (!isEndPre && !isEndPost) return null;

        const thisSusp = isEndPre ? suspensionPreActa : suspensionPostActa;
        if (!thisSusp.start?.date_start) return <span className="text-muted">-</span>;

        const otherUsedDays = (isEndPre ? (suspensionPostActa.end ? suspensionPostActa.days : 0) : (suspensionPreActa.end ? suspensionPreActa.days : 0)) || 0;
        
        const availableTotal = 10 - otherUsedDays;
        
        const limitDate = dateParser_finalDate(thisSusp.start.date_start, availableTotal);
        const tip = `Disponibles: ${availableTotal} días (Total: 10, Usados por otra suspensión: ${otherUsedDays})`;

        return <span className="text-primary" title={tip}>{formatDate(limitDate)}</span>;
    };
    
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
            return dateParser_finalDate(baseDate, days);
        }

        return null;
    };

    let calculatedLimit = value.calculatedLimit;
    if (value.limit) {
        calculatedLimit = calculateDynamicLimit(value.limit);
    }
    else if (value.limitValues) {
        let corrTime = getClock(35)?.date_start;
        let baseDate = null;
        if (extension.exists && corrTime && extension.start.date_start >= corrTime) baseDate = extension.start.date_start;
        else if (suspensionPostActa.exists && suspensionPostActa.end && corrTime && suspensionPostActa.end.date_start >= corrTime) baseDate = suspensionPostActa.end.date_start;
        else if (corrTime) baseDate = corrTime;


        if (baseDate) {
            calculatedLimit = dateParser_finalDate(baseDate, value.limitValues);
            value.limitBaseDate = baseDate;
        }
    }

    if (value.show === false) return null;
    if (value.requiredClock && !getClock(value.requiredClock)?.date_start) return null;
    if (value.optional && !clock) return null;

    const currentDate = clock?.date_start ?? value.manualDate ?? '';
    const canEditDate = value.editableDate !== false && value.version === undefined;
    const sentenceCaseEs = (s) => (s && typeof s === 'string') ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;


    let indentLevel = 0;
    if (value.title) indentLevel = 0;
    else if (value.name && (value.name.includes('Comunicación') || value.name.includes('Notificación') || 
    value.name.includes('Citación') || value.name.includes('Prórroga correcciones') || 
    value.name.includes('Radicación de Correcciones') || value.name.includes('Traslado') || 
    value.name.includes('Declaracion en legal y debida forma') || value.name.includes('superintendencia') ||
    value.name.includes('Recepción') || value.name.includes('Fin de'))) indentLevel = 2;
    else indentLevel = 1;

    const renderDaysSpent = () => {
        const result = calculateDaysSpent(value, clock);

        if (result === null || isNaN(result.days)) {
            return <div className="days-badge-empty">-</div>;
        }

        const { days } = result;
        const eventDate = clock?.date_start;
        const limitDate = calculatedLimit;

        const tip = `Días calculados desde: ${formatDate(result.startDate)}. Límite: ${limitDate ? formatDate(limitDate) : 'N/A'}`;

        if (limitDate && moment(eventDate).isAfter(limitDate, 'day')) {
            return <span className="text-danger" style={{ fontWeight: '600' }} title={tip}>{days} días (retraso)</span>;
        }
        
        return <span className="text-info" style={{ fontWeight: '600' }} title={tip}>{days} días</span>;
    };


    const renderEventName = () => {
        const eventDesc = value.desc ? (typeof value.desc === 'string' ? value.desc : '') : '';
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
                        <div className="col-6 px-1 py-2 cell-border">
                            <div style={{ paddingLeft: `${indentLevel * 1.1}rem` }} className="d-flex align-items-center h-100">
                                {indentLevel > 0 && (
                                <span className="text-muted me-2" style={{ fontSize: '1rem', display: 'inline-flex', alignItems: 'center' }}>
                                    {indentLevel === 2 ? <FaMinus /> : ''}
                                </span>
                                )}
                                <span className="me-2" style={{ minWidth: 16, display: 'flex', alignItems: 'center' }}>{get_clockExistIcon(value.state, value.icon)}</span>
                                {renderEventName()}
                            </div>
                        </div>
                        <div className="col-2 px-1 cell-border">
                            <div className="exp-row-content">
                                {canEditDate ? (
                                    <>
                                        <input type="date" className="form-control form-control-sm p-1" id={'clock_exp_date_' + i} max="2100-01-01" defaultValue={currentDate} onBlur={() => onSave(value, i)} />
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
                                ) : (<span className="text-center small">{currentDate ? formatDate(currentDate) : <span className='text-danger'>-</span>}</span>)}
                            </div>
                        </div>
                        <div className="col-2 text-center small cell-border">
                            <div className="exp-row-content">
                                {(value.state === 350 || value.state === 351) ? renderSuspensionRemainingLimit()
                                    : value.state === 30 ? renderActa1LimitSmart()
                                    : calculatedLimit ? <span className="text-primary" title={`Calculado desde: ${formatDate(value.limitBaseDate)}`}>{formatDate(calculatedLimit)}</span>
                                    : ''
                                }
                            </div>
                        </div>
                        <div className="col-2 px-1 cell-border">
                            <div className="exp-row-content">
                                {renderDaysSpent()}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </React.Fragment>
    );
};