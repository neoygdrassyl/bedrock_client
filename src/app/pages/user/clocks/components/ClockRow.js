import React from 'react';
import moment from 'moment';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { dateParser_finalDate, dateParser_dateDiff } from '../../../../components/customClasses/typeParse';
import VIZUALIZER from '../../../../components/vizualizer.component';

const MySwal = withReactContent(Swal);

export const ClockRow = (props) => {
    const { value, i, clock, onSave, cat, outCodes, _CHILD_6_SELECT, _FIND_6, helpers } = props;
    const { getClock, getNewestDate, FUN_0_TYPE_TIME, suspensionPreActa, suspensionPostActa, extension, currentItem } = helpers;

    const showSuspensionInfo = (suspensionData, type) => {
        const typeText = type === 'pre' ? 'Antes del Acta' : 'Después del Acta';
        MySwal.fire({
            title: `Suspensión ${typeText}`,
            html: `
            <div class="text-start">
                <p><strong>Ubicación:</strong> ${typeText}</p>
                <p><strong>Fecha de Inicio:</strong> ${suspensionData.start?.date_start || 'No definida'}</p>
                <p><strong>Fecha de Fin:</strong> ${suspensionData.end?.date_start || 'Pendiente por definir'}</p>
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
        const ldf = getClock(5)?.date_start;
        if (!ldf) return <span className="text-danger">-</span>;
        const baseDays = FUN_0_TYPE_TIME[currentItem.type] ?? 45;

        const finishCandidates = [];
        if (extension?.end?.date_start) finishCandidates.push({ date: extension.end.date_start, kind: 'EXT_END' });
        if (suspensionPreActa?.end?.date_start) finishCandidates.push({ date: suspensionPreActa.end.date_start, kind: 'SUSP_PRE_END' });

        const startCandidates = [];
        if (extension?.start?.date_start) startCandidates.push({ date: extension.start.date_start, kind: 'EXT_START' });
        if (suspensionPreActa?.start?.date_start) startCandidates.push({ date: suspensionPreActa.start.date_start, kind: 'SUSP_PRE_START' });

        const pickMostRecent = (arr) => arr.sort((a, b) => (moment(a.date).isAfter(b.date) ? -1 : 1))[0];
        
        let baseChoice = pickMostRecent(finishCandidates) || pickMostRecent(startCandidates) || { date: ldf, kind: 'LDF' };
        
        let usedBeforeBase = (baseChoice.kind === 'SUSP_PRE_END' && suspensionPreActa?.start?.date_start)
            ? dateParser_dateDiff(ldf, suspensionPreActa.start.date_start)
            : dateParser_dateDiff(ldf, baseChoice.date);
        
        const extDays = (extension?.exists && extension.start?.date_start && moment(extension.start.date_start).isSameOrAfter(ldf)) ? extension.days : 0;
        let remainingDays = Math.max(0, baseDays - usedBeforeBase + extDays);
        const limitDate = dateParser_finalDate(baseChoice.date, remainingDays);
        const tip = `Base: ${baseChoice.kind} | Usados: ${usedBeforeBase} | Prórroga: ${extDays} | Restantes: ${remainingDays}`;
        return <span className="text-primary" title={tip}>{limitDate}</span>;
    };

    const renderSuspensionRemainingLimit = () => {
        const isEndPre = value.state === 350;
        const isEndPost = value.state === 351;
        if (!isEndPre && !isEndPost) return null;

        const today = moment().format('YYYY-MM-DD');
        const otherUsed = isEndPre ? (suspensionPostActa.days || 0) : (suspensionPreActa.days || 0);
        const thisStart = isEndPre ? suspensionPreActa?.start?.date_start : suspensionPostActa?.start?.date_start;

        if (!thisStart) return <span className="text-muted">-</span>;

        const thisEnd = clock?.date_start || '';
        const usedThis = thisEnd ? dateParser_dateDiff(thisStart, thisEnd) : dateParser_dateDiff(thisStart, today);
        const remaining = Math.max(0, 10 - otherUsed - usedThis);

        return <span className={remaining <= 0 ? 'text-danger' : 'text-primary'}>{remaining} días</span>;
    };

    if (value.show === false) return null;
    if (value.requiredClock && !getClock(value.requiredClock)?.date_start) return null;
    if (value.optional && !clock) return null;

    let calculatedLimit = value.calculatedLimit;
    if (value.limitValues) {
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
    
    const currentDate = clock?.date_start ?? value.manualDate ?? '';
    const canEditDate = value.editableDate !== false && value.version === undefined;
    const sentenceCaseEs = (s) => (s && typeof s === 'string') ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;

    let indentLevel = 0;
    if (value.title) indentLevel = 0;
    else if (value.name && (value.name.includes('Comunicación') || value.name.includes('Notificación') || value.name.includes('Citación') || value.name.includes('Prórroga') || value.name.includes('Radicación de Correcciones') || value.name.includes('Traslado') || value.name.includes('Recepción') || value.name.includes('Fin de'))) indentLevel = 2;
    else indentLevel = 1;

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
                    <div className="row g-2 align-items-center px-3 py-2">
                        <div className="col-4 mt-0">
                            <div style={{ paddingLeft: `${indentLevel * 1.1}rem` }} className="d-flex align-items-center">
                                {indentLevel > 0 && <span className="text-muted me-2" style={{ fontSize: '1rem' }}>{indentLevel === 2 ? '└' : '•'}</span>}
                                <span className="me-2" style={{ minWidth: 16 }}>{get_clockExistIcon(value.state, value.icon)}</span>
                                <span>{value.name ?? sentenceCaseEs(clock?.name) ?? ''}</span>
                            </div>
                        </div>
                        <div className="col-2 px-1">
                            {canEditDate ? (
                                <input type="date" className="form-control form-control-sm p-1" id={'clock_exp_date_' + i} max="2100-01-01" defaultValue={currentDate} onBlur={() => onSave(value, i)} />
                            ) : (<div className="text-center small">{currentDate ? currentDate : <span className='text-danger'>-</span>}</div>)}
                        </div>
                        <div className="col-2 text-center small">
                            {(value.state === 350 || value.state === 351) ? renderSuspensionRemainingLimit()
                                : value.state === 30 ? renderActa1LimitSmart()
                                : calculatedLimit ? <span className="text-primary" title={`Calculado desde: ${value.limitBaseDate}`}>{calculatedLimit}</span>
                                : value.limit ? (Array.isArray(value.limit[0]) ? dateParser_finalDate(getNewestDate(value.limit[0]), value.limit[1]) : dateParser_finalDate(getClock(value.limit[0])?.date_start, value.limit[1])) : ''
                            }
                        </div>
                        <div className="col-2 px-1">
                            <div className="d-flex align-items-center gap-1">
                                {value.info && (
                                    <select className='form-select form-select-sm p-1' style={{ minWidth: '80px', flex: '1' }} id={'clock_exp_res_' + i} defaultValue={clock?.resolver_context ?? ''} onChange={() => onSave(value, i)} disabled={value.version !== undefined}>
                                        <option value="">- Seleccione -</option>
                                        {value.info.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                )}
                                {value.suspensionInfo && (
                                    <button type="button" className="btn btn-outline-info btn-suspension-info" title="Ver información de suspensión" onClick={() => showSuspensionInfo(value.suspensionInfo.data, value.suspensionInfo.type)}>
                                        <i className="fas fa-question"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="col-1 px-1">
                            {value.hasConsecutivo !== false && (
                                <><input list="codes_exp" autoComplete='off' className='form-control form-control-sm p-1' id={'clock_exp_id_related_' + i} defaultValue={clock?.id_related ?? ''} onBlur={() => onSave(value, i)} disabled={value.version !== undefined} />
                                <datalist id="codes_exp">{outCodes.map((data) => <option key={data.cub} value={data.cub}></option>)}</datalist></>
                            )}
                        </div>
                        <div className="col-1 px-1">
                            <div className="d-flex align-items-center justify-content-center gap-1">
                                {value.hasAnnexSelect !== false && (
                                    <select className='form-select form-select-sm p-1' id={'clock_exp_id6_' + i} defaultValue={clock?.resolver_id6 ?? 0} onChange={() => onSave(value, i)} disabled={value.version !== undefined}>
                                        <option value="-1">FIS</option><option value="0">N/A</option>{_CHILD_6_SELECT()}
                                    </select>
                                )}
                                {(clock?.resolver_id6 ?? 0) > 0 && (() => {
                                    const file = _FIND_6(clock.resolver_id6);
                                    return file?.path && file?.filename ? <VIZUALIZER url={`${file.path}/${file.filename}`} apipath={'/files/'} icon={'fas fa-search'} iconWrapper={'btn btn-sm btn-info p-1 shadow-none'} /> : null;
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </React.Fragment>
    );
};