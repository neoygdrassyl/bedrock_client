import React, { Component } from 'react';

import { dateParser_dateDiff, dateParser_finalDate, dateParser_timePassed, regexChecker_isOA_2 } from '../../../../components/customClasses/typeParse';
//import EXP_CLOCKS from '../../expeditions/exp_clocks.component';
import EXP_CLOCKS from '../../clocks/centralClocks.component';
import EXP_CLOCKS_DIAGRAM from '../../expeditions/exp_clocks_diagram.component';
import FUN_CLOCK_CHART from './func_clock_chart';

class CLOCKS_CONTROL extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 'expedicion'
        };
    }

    requestUpdate = (id) => {
        // Propagar el requestUpdate al componente padre si existe
        if (this.props.requestUpdate) {
            this.props.requestUpdate(id);
        }
    }

    handleTabChange = (tabName) => {
        this.setState({ activeTab: tabName });
    }

    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion, secondary } = this.props;
        const { activeTab } = this.state;
        const stepsToCheck = ['-5', '-6', '-7', '-8', '-10', '-11', '-17', '-18', '-19', '-20', '-21', '-22', '-30'];
        const _fun_0_type_time = { 'i': 20, 'ii': 25, 'iii': 35, 'iv': 45, 'oa': 15 };
        
        // DATA GETTERS
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
                item_0: "",
                tramite: "",
                tipo: "",
                m_urb: "",
                m_sub: "",
                m_lic: "",
                area: "",
                description: "",
            }
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD_VARS.item_0 = _CHILD[_CURRENT_VERSION].id;
                    _CHILD_VARS.tramite = _CHILD[_CURRENT_VERSION].tramite;
                    _CHILD_VARS.description = _CHILD[_CURRENT_VERSION].description ? _CHILD[_CURRENT_VERSION].description : "";
                    _CHILD_VARS.tipo = _CHILD[_CURRENT_VERSION].tipo ? _CHILD[_CURRENT_VERSION].tipo : "";
                    _CHILD_VARS.m_urb = _CHILD[_CURRENT_VERSION].m_urb ? _CHILD[_CURRENT_VERSION].m_urb : "";
                    _CHILD_VARS.m_sub = _CHILD[_CURRENT_VERSION].m_sub ? _CHILD[_CURRENT_VERSION].m_sub : "";
                    _CHILD_VARS.m_lic = _CHILD[_CURRENT_VERSION].m_lic ? _CHILD[_CURRENT_VERSION].m_lic : "";
                    _CHILD_VARS.usos = _CHILD[_CURRENT_VERSION].usos ? _CHILD[_CURRENT_VERSION].usos : "";
                    _CHILD_VARS.area = _CHILD[_CURRENT_VERSION].area ? _CHILD[_CURRENT_VERSION].area : "";
                }
            }
            return _CHILD_VARS;
        }

        // DATA CONVERTERS
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
            let time = 0
            let date = _clock.date_start
            if (_clock.state == -5 || _clock.state == -6) return _GET_CLOCK_STATE_VERSION(-5, _clock.version).date_start
            if (_clock.state == -7 || _clock.state == -8) {
                date = _GET_CLOCK_STATE_VERSION(-5, _clock.version).date_start;
                time = 5
            }
            if (_clock.state == -10 || _clock.state == -11) {
                date = _GET_CLOCK_STATE_VERSION(-7, _clock.version).date_start;
                if (!date) date = _GET_CLOCK_STATE_VERSION(-8, _clock.version).date_start;
                time = 10
            }
            if (_clock.state == -17 || _clock.state == -18 || _clock.state == -19) {
                date = _GET_CLOCK_STATE_VERSION(-10, _clock.version).date_start;
                time = 45
            }
            if (_clock.state == -20) return _GET_CLOCK_STATE_VERSION(-17, _clock.version).date_start
            if (_clock.state == -22 || _clock.state == -21) {
                date = _GET_CLOCK_STATE_VERSION(-20, _clock.version).date_start;
                time = 5
            }

            return dateParser_finalDate(date, time)
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

        const viaTime = () => {
            let ldfTime = _GET_CLOCK_STATE(5).date_start;
            let actaTime = _GET_CLOCK_STATE(30).date_start;
            let acta2Time = _GET_CLOCK_STATE(49).date_start;
            let corrTime = _GET_CLOCK_STATE(35).date_start;
            const evaDefaultTime = _fun_0_type_time[currentItem.type] ?? 45
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
                { state: 30, name: 'Acta Parte 1: Observaciones', limit: [5, false, _fun_0_type_time[currentItem.type] ?? 45], icon: <i class="fas fa-file-alt text-success"></i>, },
                { state: 31, name: 'Citación (Observaciones)', icon: <i class="far fa-envelope text-secondary"></i>, },
                { state: 32, name: 'Notificación (Observaciones)', limit: [31, false, 5], icon: <i class="far fa-envelope text-secondary"></i>, },
                { state: 33, name: 'Notificación por aviso (Observaciones)', limit: [31, false, 10], icon: <i class="far fa-envelope text-secondary"></i>, optional: true, },
    
                { state: 34, name: 'Prórroga correcciones', optional: true, limit: [[33, 32], false, [30, 30]], icon: <i class="far fa-dot-circle"></i>, },
                { state: 35, name: 'Radicación de Correcciones', optional: !requereCorr(), limit: [[33, 32], false, [35, 35, 40]], limitValues: presentExt() ? 45 : 30, icon: <i class="fas fa-file-alt"></i>, },
    
                { state: stepsToCheck, version: -3, optional: true, icon: <i class="far fa-dot-circle text-danger"></i> },
    
                { state: 49, name: 'Acta Parte 2: Correcciones', optional: !requereCorr(), limit: [35, false, 50], limitValues: viaTime(), icon: <i class="fas fa-file-alt text-success"></i>, },
    
                { state: stepsToCheck, version: -4, optional: true, icon: <i class="far fa-dot-circle text-danger"></i> },
    
                { state: 61, name: 'Acto de Tramite de Licencia (Viabilidad)', limit: false, icon: <i class="fas fa-file-alt text-success"></i>, },
                { state: 55, name: 'Citación (Viabilidad)', limit: [61, false, 5], icon: <i class="far fa-envelope text-secondary"></i>, },
                { state: 56, name: 'Notificación (Viabilidad)', limit: [55, false, 5], icon: <i class="far fa-envelope text-secondary"></i>, },
                { state: 57, name: 'Notificación por aviso (Viabilidad)', limit: [55, false, 10], icon: <i class="far fa-envelope text-secondary"></i>, optional: true, },
    
                { state: 69, name: 'Radicacion de último pago', limit: false, icon: <i class="fas fa-comment-dollar text-warning"></i>, },
            ]
        } 
        
        const clocks = [
            { state: false, version: false, desc: "Tiempo de Creacion en el sistema", name: 'RADICACIÓN', date: currentItem.date, icon: <i class="far fa-dot-circle"></i>, },
            { state: 3, version: false, desc: "Las fechas se calculan a partir de este momento", name: 'PAGO EXPENSAS FIJAS', icon: <i class="fas fa-comment-dollar text-warning"></i>, },
            { state: -1, version: false, desc: false, name: 'INCOMPLETO', limit: [3, false, 30], icon: <i class="far fa-dot-circle"></i>, optional: true, },
            { state: stepsToCheck, version: -1, optional: true, icon: <i class="far fa-dot-circle text-danger"></i> },
            { state: 4, version: false, desc: "Vencimiento Licencia Inicial", name: 'VENCIMIENTO LICENCIA INICIAL', icon: <i class="fas fa-file-alt text-success"></i>,  optional: regexChecker_isOA_2(_GET_CHILD_1()) ? false: true,},
            { state: 5, version: false, desc: false, name: 'LEGAL Y DEBIDA FORMA', limit: regexChecker_isOA_2(_GET_CHILD_1()) ?  [4, false, -30]:  [3, false, 30], icon: <i class="far fa-check-circle text-success"></i>, },

            ...extraClocks(),

            { state: 70, name: 'Acto Administrativo / Resolución', limit: [69, false, 10], icon: <i class="fas fa-file-alt text-success"></i>, },

            { state: 71, name: 'Citación (Resolución)', limit: [69, false, 0], icon: <i class="far fa-envelope text-secondary"></i>, },
            { state: 72, name: 'Notificación (Resolución)', limit: [71, false, 5], icon: <i class="far fa-envelope text-secondary"></i>, },
            { state: 73, name: 'Notificación por aviso (Resolución)', limit: [71, false, 5], icon: <i class="far fa-envelope text-secondary"></i>, optional: true, },

            { state: 74, name: 'Recurso Resolución', limit: [71, false, 15], optional: true, icon: <i class="far fa-dot-circle"></i>, },
            { state: 75, name: 'Respuesta Recurso Resolución', limit: [74, false, 30], optional: true, icon: <i class="far fa-dot-circle"></i>, },
            { state: 99, name: 'Ejecutoria', icon: <i class="fas fa-file-alt text-success"></i>, },
            { state: 101, name: 'Archivo', icon: <i class="fas fa-lock text-info"></i>, },
        ]

        // COMPONENTS JSX
        // Recorre cada uno de los states y en caso de ser un arreglo, recorre uno por uno según el estado
        let _COMPONENT_CLOCK_LIST = () => {
            return clocks.map((value, index) => {
                if (Array.isArray(value.state)) {
                    return value.state.map((valuej, j) => _ROW_COMPONENT({ ...value, state: valuej, }, false, `${index}-${j}`))
                } else {
                    return _ROW_COMPONENT(value, false, index)
                }
            })
        }
        
        let _COMPONENT_SECONDARY = () => {
            var secondaryClocks = [];

            if (currentItem.fun_law) {
                if (currentItem.fun_law.sign) {
                    let _sign = currentItem.fun_law.sign.split(',')
                    if (_sign[1]) secondaryClocks.push({ state: false, version: false, desc: "", name: 'Radicación de Valla', date: _sign[1], icon: <i class="fas fa-sign text-secondary"></i>, })
                }
            }
            let _neighbours = currentItem.fun_3s;
            _neighbours.map(value => {
                if (value.id_alerted) secondaryClocks.push({
                    state: false, version: false,
                    desc: value.direccion_1 + ' Guia:' + value.id_alerted,
                    name: 'Vecino Notificado',
                    date: value.alerted,
                    icon: <i class="far fa-envelope"></i>,
                })
            })

            var _CLOCK = _GET_CHILD_CLOCK();

            let asignExist = false;
            _CLOCK.map(value => { if (value.version == 100) asignExist = true });

            _CLOCK.map(value => {
                if (value.state > 10 && value.state < 15) {
                    if (asignExist) {
                        if (value.version == 200) {
                            var clocks_reviews = value;
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
                                    icon: <i class="fas fa-check text-success"></i>,
                                })
                            })
                        }
                    }
                    else if (value.version < 100) secondaryClocks.push({
                        state: value.sate, version: value.version,
                        desc: value.desc,
                        name: value.name,
                        date: value.date_start,
                        icon: <i class="fas fa-check text-success"></i>,
                    })
                }
            })

            _CLOCK.map(value => {
                if (value.state >= 31 && value.state < 49) secondaryClocks.push({
                    state: value.sate, version: false,
                    desc: value.desc,
                    name: value.name,
                    date: value.date_start,
                    icon: <i class="far fa-dot-circle text-info"></i>,
                })
            })

            _CLOCK.map(value => {
                if (value.state >= 61 && value.state <= 65) secondaryClocks.push({
                    state: value.sate, version: false,
                    desc: value.desc,
                    name: value.name,
                    date: value.date_start,
                    icon: <i class="fas fa-comment-dollar text-warning"></i>,
                })
            })

            return secondaryClocks.map((value, index) => _ROW_COMPONENT(value, true, `sec-${index}`))
        }
        
        // FUNCTIONS AND WORKING ENGINES
        let _ROW_COMPONENT = (value, hideLimit, key) => {
            var clock;
            if (value.version) clock = _GET_CLOCK_STATE_VERSION(value.state, value.version)
            else clock = _GET_CLOCK_STATE(value.state)
            if (!clock && value.optional) return null;

            var limit_clock;
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

            return (
                <div className="row" key={key}>
                    <div className="col border">
                        <label className="fw-bold text-uppercase">{value.icon} {value.name ?? clock.name ?? ''}</label>
                    </div>
                    {hideLimit ?
                        null
                        : <div className="col-2 border py-1 text-center">
                            {limit_clock
                                ? dateParser_finalDate(limit_clock.date_start, value.limitValues || value.limit[2])
                                : value.version < 0 ?
                                    _GET_TIME_FOR_NEGATIVE_PROCESS({ state: value.state, version: value.version, date_start: clock.date_start })
                                    : ''}
                        </div>
                    }
                    <div className="col-2 border py-1 text-center">
                        <label> {value.date ?? clock.date_start ?? ''}</label>
                    </div>
                    <div className="col border">
                        <label> {value.desc ?? clock.desc ?? ''}</label>
                    </div>
                </div>
            )
        }
        
        const HEAD = (
            <div className="row text-light">
                <div className="col border bg-info text-center">
                    <label className="fw-bold text-uppercase">Control Proceso</label>
                </div>
                <div className="col-2 border bg-info py-1 text-center">
                    <label className="fw-bold text-uppercase">Fecha límite términos y plazos</label>
                </div>
                <div className="col-2 border bg-info py-1 text-center">
                    <label className="fw-bold text-uppercase">Fecha ejecución proceso</label>
                </div>
                <div className="col border bg-info text-center">
                    <label className="fw-bold text-uppercase">Observaciones</label>
                </div>
            </div>
        );
        
        const HEAD2 = (
            <div className="row text-light">
                <div className="col border bg-info text-center">
                    <label className="fw-bold text-uppercase">EVENTOS SECUNDARIOS</label>
                </div>
            </div>
        );
        
        const HEAD3 = (
            <div className="row text-light">
                <div className="col border bg-info text-center">
                    <label className="fw-bold text-uppercase">Control Proceso términos y plazos</label>
                </div>
                <div className="col-2 border bg-info py-1 text-center">
                    <label className="fw-bold text-uppercase">Fecha ejecución proceso</label>
                </div>
                <div className="col border bg-info text-center">
                    <label className="fw-bold text-uppercase">Observaciones</label>
                </div>
            </div>
        );

        return (
            <div className="row mb-5">
                {/* Tabs Navigation */}
                <ul className="nav nav-tabs mb-3">
                    <li className="nav-item">
                        <a 
                            className={`nav-link ${activeTab === 'principal' ? 'active' : ''}`}
                            onClick={() => this.handleTabChange('principal')}
                            style={{ cursor: 'pointer' }}
                        >
                            Control Principal
                        </a>
                    </li>
                    {secondary && (
                        <li className="nav-item">
                            <a 
                                className={`nav-link ${activeTab === 'secundario' ? 'active' : ''}`}
                                onClick={() => this.handleTabChange('secundario')}
                                style={{ cursor: 'pointer' }}
                            >
                                Eventos Secundarios
                            </a>
                        </li>
                    )}
                    <li className="nav-item">
                        <a 
                            className={`nav-link ${activeTab === 'expedicion' ? 'active' : ''}`}
                            onClick={() => this.handleTabChange('expedicion')}
                            style={{ cursor: 'pointer' }}
                        >
                            Tiempos Expedición
                        </a>
                    </li>
                </ul>

                {/* Tab Content */}
                <div className="tab-content">
                    {activeTab === 'principal' && (
                        <div className="tab-pane active">
                            {HEAD}
                            {_COMPONENT_CLOCK_LIST()}
                        </div>
                    )}
                    
                    {activeTab === 'secundario' && secondary && (
                        <div className="tab-pane active">
                            {HEAD2}
                            {HEAD3}
                            {_COMPONENT_SECONDARY()}
                            {/* <EXP_CLOCKS_DIAGRAM
                                translation={translation}
                                swaMsg={swaMsg}
                                globals={globals}
                                currentItem={currentItem}
                                currentVersion={currentVersion}
                                currentRecord={this.props.currentRecord}
                                currentVersionR={this.props.currentVersionR}
                                outCodes={this.props.outCodes || []}
                                requestUpdate={this.requestUpdate}
                            /> */}
                        </div>
                    )}

                    {activeTab === 'expedicion' && (
                        <div className="tab-pane active">
                            <EXP_CLOCKS 
                                translation={translation}
                                swaMsg={swaMsg}
                                globals={globals}
                                currentItem={currentItem}
                                currentVersion={currentVersion}
                                currentRecord={this.props.currentRecord}
                                currentVersionR={this.props.currentVersionR}
                                outCodes={this.props.outCodes || []}
                                requestUpdate={this.requestUpdate}
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default CLOCKS_CONTROL;