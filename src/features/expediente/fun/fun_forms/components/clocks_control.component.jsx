import { useId, useState } from 'react';
import dayjs from 'dayjs';
import { isEmptyEntity } from '../../../../../shared/utils/isEmptyEntity';

import { dateParser_dateDiff, dateParser_finalDate, regexChecker_isOA_2 } from '../../../../../shared/config/customClasses/typeParse';
import EXP_CLOCKS from '../../../clocks/centralClocks.component';
import FUN_CLOCK_CHART from './func_clock_chart';
import FUN_CLOCK_EVENTS from './fun_clocks_events.component';
import FUN_CLOCKS_NEGATIVE from './fun_clocks_negative.component';
import { Icon } from '@/shared/components/icon';
import { cn } from '@/shared/lib/utils';

// Display only: ISO dates are shown as dd/mm/yyyy; anything else is printed as stored.
const formatControlDate = (value) => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(value)) return value || '';
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.format('DD/MM/YYYY') : value;
};

const CONTROL_GRID = 'grid grid-cols-[minmax(0,1.1fr)_17rem_9.5rem_minmax(0,1.4fr)]';
const CONTROL_GRID_SECONDARY = 'grid grid-cols-[minmax(0,1.2fr)_9.5rem_minmax(0,1.5fr)]';
// Same header as the events table of "Tiempos Expedición": card surface, quiet label, one rule below.
const CONTROL_HEAD_ROW = 'border-b border-border bg-card';
const CONTROL_HEAD_CELL = 'px-3 py-2 text-xs font-semibold text-[color:var(--tc-text-3)]';
const CONTROL_CELL = 'min-w-0 px-3 py-2 text-[13px] text-foreground';
const CONTROL_EMPTY = 'text-xs text-muted-foreground';

function CLOCKS_CONTROL(props) {
    const [activeTab, setActiveTab] = useState('tiempos');
    const tabsId = useId();
    const { translation, swaMsg, globals, currentItem, currentVersion, secondary } = props;

    const requestUpdate = (id) => {
        if (props.requestUpdate) {
            return props.requestUpdate(id);
        }
        return Promise.resolve();
    }
    
    const requestRefresh = () => {
        if (props.requestRefresh) {
            return props.requestRefresh();
        }
        return Promise.resolve();
    }

    const handleTabChange = (tabName) => {
        setActiveTab(tabName);
    }
    
        const stepsToCheck = ['-5', '-6', '-7', '-8', '-10', '-11', '-17', '-18', '-19', '-20', '-21', '-22', '-30'];
        const _fun_0_type_time = { 'i': 20, 'ii': 25, 'iii': 35, 'iv': 45, 'oa': 15 };
        
        let _GET_CHILD_CLOCK = () => {
            var _CHILD = currentItem.fun_clocks;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }

        let _GET_CHILD_1 = () => {
            var _CHILD = currentItem.fun_1s;
            var _CURRENT_VERSION = currentVersion - 1;
            var _CHILD_VARS = {
                item_0: "", tramite: "", tipo: "", m_urb: "", m_sub: "",
                m_lic: "", area: "", description: "", usos: ""
            };
            if (_CHILD && _CHILD[_CURRENT_VERSION] != null) {
                const childVersion = _CHILD[_CURRENT_VERSION];
                return {
                    item_0: childVersion.id,
                    tramite: childVersion.tramite,
                    description: childVersion.description || "",
                    tipo: childVersion.tipo || "",
                    m_urb: childVersion.m_urb || "",
                    m_sub: childVersion.m_sub || "",
                    m_lic: childVersion.m_lic || "",
                    usos: childVersion.usos || "",
                    area: childVersion.area || "",
                };
            }
            return _CHILD_VARS;
        }

        let _GET_CLOCK_STATE_VERSION = (_state, _version) => {
            var _CLOCK = _GET_CHILD_CLOCK();
            if (_state == null) return false;
            for (var i = 0; i < _CLOCK.length; i++) {
                if (_CLOCK[i].state == _state && _CLOCK[i].version == _version) return _CLOCK[i];
            }
            return false;
        }
        let _GET_CLOCK_STATE = (_state) => {
            var _CLOCK = _GET_CHILD_CLOCK();
            if (_state == null) return false;
            for (var i = 0; i < _CLOCK.length; i++) {
                if (_CLOCK[i].state == _state) return _CLOCK[i];
            }
            return false;
        }
        
        let _GET_TIME_FOR_NEGATIVE_PROCESS = (_clock) => {
            let date = _clock.date_start
            let time = 0;

            if (_clock.state == -5 || _clock.state == -6) return _GET_CLOCK_STATE_VERSION(-5, _clock.version).date_start
            if (_clock.state == -7 || _clock.state == -8) {
                date = _GET_CLOCK_STATE_VERSION(-5, _clock.version).date_start;
                time = 5;
            }
            if (_clock.state == -10 || _clock.state == -11) {
                date = _GET_CLOCK_STATE_VERSION(-7, _clock.version).date_start;
                if (!date) date = _GET_CLOCK_STATE_VERSION(-8, _clock.version).date_start;
                time = 10;
            }
            if (_clock.state == -17 || _clock.state == -18 || _clock.state == -19) {
                date = _GET_CLOCK_STATE_VERSION(-10, _clock.version).date_start;
                time = 45;
            }
            if (_clock.state == -20) return _GET_CLOCK_STATE_VERSION(-17, _clock.version).date_start;
            if (_clock.state == -22 || _clock.state == -21) {
                date = _GET_CLOCK_STATE_VERSION(-20, _clock.version).date_start;
                time = 5;
            }
            return dateParser_finalDate(date, time);
        }

        const requereCorr = () => {
            let actaClock = _GET_CLOCK_STATE(30);
            let con = false;
            if (actaClock.desc) {
                if (actaClock.desc.includes('NO CUMPLE')) con = true;
            }
            return con;
        }

        const presentExt = () => {
            return _GET_CLOCK_STATE(34).date_start ? true : false;
        }
        // DEPRECATED FUNCTION
        const viaTime = () => {
            let ldfTime = _GET_CLOCK_STATE(5).date_start;
            let actaTime = _GET_CLOCK_STATE(30).date_start;
            let acta2Time = _GET_CLOCK_STATE(49).date_start;
            let corrTime = _GET_CLOCK_STATE(35).date_start;
            const evaDefaultTime = _fun_0_type_time[currentItem.type] ?? 45;
            let time = 1;

            if (ldfTime && actaTime) {
                if (acta2Time && corrTime) {
                    time = evaDefaultTime - dateParser_dateDiff(ldfTime, actaTime) - dateParser_dateDiff(acta2Time, corrTime);
                } else {
                    time = evaDefaultTime - dateParser_dateDiff(ldfTime, actaTime);
                }
            }
            if (time < 1) time = 1;
            return time;
        }

        let extraClocks = () => {
            if(regexChecker_isOA_2(_GET_CHILD_1())) return []
            else return [
                { state: 30, name: 'Acta Parte 1: Observaciones', limit: [5, false, _fun_0_type_time[currentItem.type] ?? 45], icon: <Icon name="file-alt" size={16} className="text-success" />, },
                { state: 31, name: 'Citación (Observaciones)', icon: <Icon name="envelope" size={16} className="text-secondary" />, },
                { state: 32, name: 'Notificación (Observaciones)', limit: [31, false, 5], icon: <Icon name="envelope" size={16} className="text-secondary" />, },
                { state: 33, name: 'Notificación por aviso (Observaciones)', limit: [31, false, 10], icon: <Icon name="envelope" size={16} className="text-secondary" />, optional: true, },
    
                { state: 34, name: 'Prórroga correcciones', optional: true, limit: [[33, 32], false, [30, 30]], icon: <Icon name="dot-circle" size={16} />, },
                { state: 35, name: 'Correcciones', optional: !requereCorr(), limit: [[33, 32], false, [35, 35, 40]], limitValues: presentExt() ? 45 : 30, icon: <Icon name="file-alt" size={16} />, },
    
                { state: stepsToCheck, version: -3, optional: true, icon: <Icon name="dot-circle" size={16} className="text-danger" /> },
    
                { state: 49, name: 'Acta Parte 2: Correcciones', optional: !requereCorr(), limit: [35, false, 50], limitValues: viaTime(), icon: <Icon name="file-alt" size={16} className="text-success" />, },
    
                { state: stepsToCheck, version: -4, optional: true, icon: <Icon name="dot-circle" size={16} className="text-danger" /> },
    
                { state: 61, name: 'Acto de Tramite de Licencia (Viabilidad)', limit: false, icon: <Icon name="file-alt" size={16} className="text-success" />, },
                { state: 55, name: 'Citación (Viabilidad)', limit: [61, false, 5], icon: <Icon name="envelope" size={16} className="text-secondary" />, },
                { state: 56, name: 'Notificación (Viabilidad)', limit: [55, false, 5], icon: <Icon name="envelope" size={16} className="text-secondary" />, },
                { state: 57, name: 'Notificación por aviso (Viabilidad)', limit: [55, false, 10], icon: <Icon name="envelope" size={16} className="text-secondary" />, optional: true, },
    
                { state: 69, name: 'Radicaciones de pagos', limit: false, icon: <Icon name="comment-dollar" size={16} className="text-warning" />, },
            ]
        } 
        const clocks = [
            { state: false, version: false, desc: "Tiempo de Creacion en el sistema", name: 'RADICACIÓN', date: currentItem.date, icon: <Icon name="dot-circle" size={16} />, },
            { state: 3, version: false, desc: "Las fechas se calculan a partir de este momento", name: 'PAGO EXPENSAS FIJAS', icon: <Icon name="comment-dollar" size={16} className="text-warning" />, },
            { state: -1, version: false, desc: false, name: 'INCOMPLETO', limit: [3, false, 30], icon: <Icon name="dot-circle" size={16} />, optional: true, },
            { state: stepsToCheck, version: -1, optional: true, icon: <Icon name="dot-circle" size={16} className="text-danger" /> },
            { state: 4, version: false, desc: "Vencimiento Licencia Inicial", name: 'VENCIMIENTO LICENCIA INICIAL', icon: <Icon name="file-alt" size={16} className="text-success" />,  optional: regexChecker_isOA_2(_GET_CHILD_1()) ? false: true,},
            { state: 5, version: false, desc: false, name: 'LEGAL Y DEBIDA FORMA', limit: regexChecker_isOA_2(_GET_CHILD_1()) ?  [4, false, -30]:  [3, false, 30], icon: <Icon name="check-circle" size={16} className="text-success" />, },

            ...extraClocks(),

            { state: 70, name: 'Acto Administrativo / Resolución', limit: [69, false, 10], icon: <Icon name="file-alt" size={16} className="text-success" />, },

            { state: 71, name: 'Citación (Resolución)', limit: [69, false, 0], icon: <Icon name="envelope" size={16} className="text-secondary" />, },
            { state: 72, name: 'Notificación (Resolución)', limit: [71, false, 5], icon: <Icon name="envelope" size={16} className="text-secondary" />, },
            { state: 73, name: 'Notificación por aviso (Resolución)', limit: [71, false, 5], icon: <Icon name="envelope" size={16} className="text-secondary" />, optional: true, },

            { state: 74, name: 'Recurso Resolución', limit: [71, false, 15], optional: true, icon: <Icon name="dot-circle" size={16} />, },
            { state: 75, name: 'Respuesta Recurso Resolución', limit: [74, false, 30], optional: true, icon: <Icon name="dot-circle" size={16} />, },
            //{ state: 80, name: 'Certificación de Ejecutoria', icon: <Icon name="file-alt" size={16} className="text-success" />, },
            { state: 99, name: 'Licencia', icon: <Icon name="file-alt" size={16} className="text-success" />, },
            { state: 101, name: 'Archivo', icon: <Icon name="lock" size={16} className="text-info" />, },
        ]
        
        const _ROW_COMPONENT = (value, hideLimit, key) => {
            var clock;
            if (value.version) clock = _GET_CLOCK_STATE_VERSION(value.state, value.version)
            else clock = _GET_CLOCK_STATE(value.state)
            if (!clock && value.optional) return;

            let limit_clock;
            if (value.limit) {
                if (Array.isArray(value.limit[0])) {
                    for (let i = 0; i < value.limit[0].length; i++) {
                        const limitI = value.limit[0][i];
                        const limitD = value.limit[2][i]
                        if (value.limit[1]) limit_clock = _GET_CLOCK_STATE_VERSION(limitI, limitD)
                        else limit_clock = _GET_CLOCK_STATE(limitI)
                        if (limit_clock) break;
                    }
                } else {
                    if (value.limit[1]) limit_clock = _GET_CLOCK_STATE_VERSION(value.limit[0], value.limit[1])
                    else limit_clock = _GET_CLOCK_STATE(value.limit[0])
                }

            }

            const limitValue = limit_clock
                ? dateParser_finalDate(limit_clock.date_start, value.limitValues || value.limit[2])
                : value.version < 0
                    ? _GET_TIME_FOR_NEGATIVE_PROCESS({ state: value.state, version: value.version, date_start: clock.date_start })
                    : '';
            const dateValue = value.date ?? clock.date_start ?? '';
            const descValue = value.desc ?? clock.desc ?? '';

            return (
                <div role="row" className={cn(hideLimit ? CONTROL_GRID_SECONDARY : CONTROL_GRID, 'min-h-10 items-center border-b border-border/70 last:border-b-0')} key={key}>
                    <div role="cell" className={cn(CONTROL_CELL, 'flex items-center gap-2 font-medium')}>
                        <span className="shrink-0" aria-hidden="true">{value.icon}</span>
                        <span className="min-w-0 break-words">{value.name ?? clock.name ?? ''}</span>
                    </div>
                    {!hideLimit &&
                    <div role="cell" className={cn(CONTROL_CELL, 'font-mono tabular-nums')}>
                        {limitValue ? formatControlDate(limitValue) : <span className={cn(CONTROL_EMPTY, 'font-sans')}>Sin límite calculado</span>}
                    </div>}
                    <div role="cell" className={cn(CONTROL_CELL, 'font-mono tabular-nums')}>
                        {dateValue ? formatControlDate(dateValue) : <span className={cn(CONTROL_EMPTY, 'font-sans')}>Sin fecha registrada</span>}
                    </div>
                    <div role="cell" className={cn(CONTROL_CELL, 'break-words text-foreground/80')}>
                        {descValue || <span className={CONTROL_EMPTY}>Sin observaciones</span>}
                    </div>
                </div>
            );
        };

        const _COMPONENT_SECONDARY = () => {
            var secondaryClocks = [];

            if (!isEmptyEntity(currentItem.fun_law)) {
                if (currentItem.fun_law.sign) {
                    let _sign = currentItem.fun_law.sign.split(',')
                    if (_sign[1]) secondaryClocks.push({ state: false, version: false, desc: "", name: 'Radicación de Valla', date: _sign[1], icon: <Icon name="sign" size={16} className="text-secondary" />, })
                }
            }
            let _neighbours = currentItem.fun_3s;
            _neighbours.map(value => {
                if (value.id_alerted) secondaryClocks.push({
                    state: false, version: false,
                    desc: value.direccion_1 + ' Guia:' + value.id_alerted,
                    name: 'Vecino Notificado',
                    date: value.alerted,
                    icon: <Icon name="envelope" size={16} />,
                })
            })

            var _CLOCK = _GET_CHILD_CLOCK();

            let asignExist = false;
            _CLOCK.map(value => { if (value.version == 100) asignExist = true });


            _CLOCK.map(value => {
                if (value.state > 10 && value.state < 15) {
                    if (asignExist) {
                        if (value.version == 200) {
                            //var clocks_asign = _GET_CLOCK_STATE_VERSION(state, 100);
                            var clocks_reviews = value;

                            //var asigns = clocks_asign.date_start ? clocks_asign.date_start.split(';') : [];

                            var reviews_date = clocks_reviews.date_start ? clocks_reviews.date_start.split(';') : [];
                            var reviews_check = clocks_reviews.resolver_context ? clocks_reviews.resolver_context.split(';') : [];
                            var state = value.state;
                            const reviewType = { '11': 'JURÍDICA', '12': 'ESTRUCTURAL', '13': 'ARQUITECTÓNICA' };
                            const reviewCheck = { '0': 'NO CUMPLE', '1': 'CUMPLE', '2': 'NO APLICA' };

                            var desc = (check) => {
                                if (state == 12) {
                                    let reviews = check ? check.split(',') : ['-1', '-1'];
                                    return `Resultado 1: ${reviewCheck[reviews[0]] ?? ''}, Resultado 2: ${reviewCheck[reviews[1]] ?? ''}`;
                                } else {
                                    return `Resultado Informe: ${reviewCheck[check] ?? ''}`;
                                }
                            };

                            reviews_check.filter(value => {
                                if (state == 12) {
                                    let reviews = value ? value.split(',') : [false, false];
                                    if (!reviews[0] && !reviews[1]) return false
                                } else {
                                    if (value == undefined) return false;
                                }
                                return true;
                            }).map((value, index) => {
                                secondaryClocks.push({
                                    state: value.state, version: index + 1,
                                    desc: desc(value),
                                    name: `REVISION ${reviewType[state]}, revision ${index + 1}`,
                                    date: reviews_date[index],
                                    icon: <Icon name="check" size={16} className="text-success" />,
                                })
                            })
                        }
                    }
                    else if (value.version < 100) secondaryClocks.push({
                        state: value.sate, version: value.version,
                        desc: value.desc,
                        name: value.name,
                        date: value.date_start,
                        icon: <Icon name="check" size={16} className="text-success" />,
                    })

                }
            })

            _CLOCK.map(value => {
                if (value.state >= 31 && value.state < 49) secondaryClocks.push({
                    state: value.sate, version: false,
                    desc: value.desc,
                    name: value.name,
                    date: value.date_start,
                    icon: <Icon name="dot-circle" size={16} className="text-info" />,
                })
            })

            _CLOCK.map(value => {
                if (value.state >= 61 && value.state <= 65) secondaryClocks.push({
                    state: value.sate, version: false,
                    desc: value.desc,
                    name: value.name,
                    date: value.date_start,
                    icon: <Icon name="comment-dollar" size={16} className="text-warning" />,
                })
            })


            return secondaryClocks.map((value, index) => _ROW_COMPONENT(value, true, `sec-${index}`))
        };
        
        const HEAD = (
            <div role="row" className={cn(CONTROL_GRID, CONTROL_HEAD_ROW)}>
                <div role="columnheader" className={CONTROL_HEAD_CELL}>Control del proceso</div>
                <div role="columnheader" className={CONTROL_HEAD_CELL}>
                    Fecha límite (términos y plazos)
                    <span className="mt-1 block text-[11px] font-normal leading-snug">
                        Fechas calculadas con el motor anterior; la referencia vigente es la pestaña Tiempos Expedición.
                    </span>
                </div>
                <div role="columnheader" className={CONTROL_HEAD_CELL}>Fecha de ejecución</div>
                <div role="columnheader" className={CONTROL_HEAD_CELL}>Observaciones</div>
            </div>
        );

        const HEAD_SECONDARY_HEADER = (
            <div role="row" className={cn(CONTROL_GRID_SECONDARY, CONTROL_HEAD_ROW)}>
                <div role="columnheader" className={CONTROL_HEAD_CELL}>Control del proceso (términos y plazos)</div>
                <div role="columnheader" className={CONTROL_HEAD_CELL}>Fecha de ejecución</div>
                <div role="columnheader" className={CONTROL_HEAD_CELL}>Observaciones</div>
            </div>
        );

        const _COMPONENT_CLOCK_LIST = () => clocks.map((value, index) =>
            Array.isArray(value.state)
                ? value.state.map((valuej, j) => _ROW_COMPONENT({ ...value, state: valuej }, false, `${index}-${j}`))
                : _ROW_COMPONENT(value, false, index)
        );

        const tabs = [
            { id: 'tiempos', label: 'Tiempos Expedición'},
            { id: 'principal', label: 'Control Principal' },
            { id: 'eventos', label: 'Anuncios y Eventos' },
            { id: 'grafico', label: 'Gráfico de Tiempos' },
            { id: 'desistimientos', label: 'Control Desistimientos' },
        ];
        const secondaryRows = secondary ? _COMPONENT_SECONDARY().filter(Boolean) : [];

        return (
            <div className="mb-5 w-full min-w-0">
                {/* Bootstrap nav-tabs markup: the legacy bridge turns it into the shared module tab strip. */}
                <ul className="nav nav-tabs mb-3" role="tablist" aria-label="Vistas de tiempos">
                    {tabs.map(tab => (
                        <li key={tab.id} className="nav-item" role="presentation">
                            <button
                                type="button"
                                role="tab"
                                id={`${tabsId}-tab-${tab.id}`}
                                aria-controls={`${tabsId}-panel`}
                                aria-selected={activeTab === tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                            >
                                {tab.label}
                            </button>
                        </li>
                    ))}
                </ul>

                <div className="tab-content w-full min-w-0">
                    <div className="w-full min-w-0" role="tabpanel" id={`${tabsId}-panel`} aria-labelledby={`${tabsId}-tab-${activeTab}`}>
                        {activeTab === 'tiempos' && (
                            <EXP_CLOCKS 
                                {...props}
                                requestUpdate={requestUpdate}
                            />
                        )}
                        {activeTab === 'principal' && (
                            <div className="flex flex-col gap-3">
                                <section className="tc-card" aria-labelledby={`${tabsId}-principal-title`}>
                                    <div className="tc-card-header">
                                        <h3 id={`${tabsId}-principal-title`} className="tc-card-title">Control principal</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <div role="table" aria-labelledby={`${tabsId}-principal-title`} className="min-w-[52rem]">
                                            {HEAD}
                                            {_COMPONENT_CLOCK_LIST()}
                                        </div>
                                    </div>
                                </section>
                                {secondary && (
                                    <section className="tc-card" aria-labelledby={`${tabsId}-secondary-title`}>
                                        <div className="tc-card-header">
                                            <h3 id={`${tabsId}-secondary-title`} className="tc-card-title">Eventos secundarios</h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <div role="table" aria-labelledby={`${tabsId}-secondary-title`} className="min-w-[38rem]">
                                                {HEAD_SECONDARY_HEADER}
                                                {secondaryRows.length > 0
                                                    ? secondaryRows
                                                    : <p className="tc-empty">Sin eventos secundarios registrados.</p>}
                                            </div>
                                        </div>
                                    </section>
                                )}
                            </div>
                        )}
                        {activeTab === 'eventos' && (
                            <section className="tc-card" aria-labelledby={`${tabsId}-eventos-title`}>
                                <div className="tc-card-header">
                                    <h3 id={`${tabsId}-eventos-title`} className="tc-card-title">Anuncios y eventos</h3>
                                </div>
                                <div className="p-3 sm:p-4">
                                    <FUN_CLOCK_EVENTS
                                        {...props}
                                        requestUpdate={requestUpdate}
                                    />
                                </div>
                            </section>
                        )}
                        {activeTab === 'grafico' && (
                            <section className="tc-card" aria-labelledby={`${tabsId}-grafico-title`}>
                                <div className="tc-card-header">
                                    <h3 id={`${tabsId}-grafico-title`} className="tc-card-title">Gráfico de tiempos</h3>
                                </div>
                                <div className="overflow-x-auto p-3 sm:p-4">
                                    <FUN_CLOCK_CHART
                                        {...props}
                                    />
                                </div>
                            </section>
                        )}
                        {activeTab === 'desistimientos' && (
                            <section className="tc-card" aria-labelledby={`${tabsId}-desist-title`}>
                                <div className="tc-card-header">
                                    <h3 id={`${tabsId}-desist-title`} className="tc-card-title">Control de procesos de desistimiento</h3>
                                </div>
                                <div className="p-3 sm:p-4">
                                    <FUN_CLOCKS_NEGATIVE
                                        {...props}
                                        requestUpdate={requestUpdate}
                                        requestRefresh={requestRefresh}
                                    />
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        );
}

export default CLOCKS_CONTROL;
