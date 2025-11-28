import React, { Component } from 'react';

import { dateParser_dateDiff, dateParser_finalDate, regexChecker_isOA_2 } from '../../../../components/customClasses/typeParse';
import EXP_CLOCKS from '../../clocks/centralClocks.component';
import FUN_CLOCK_CHART from './func_clock_chart';
import FUN_CLOCK_EVENTS from './fun_clocks_events.component';
import FUN_CLOCKS_NEGATIVE from './fun_clocks_negative.component';

// Estilos ajustados para la nueva interfaz de pestañas.
const styles = {
    tabsContainer: {
        marginBottom: '0', // Se quita el margen para unir con el contenido
        paddingLeft: '0',
        display: 'flex',
        listStyle: 'none',
        borderBottom: '1px solid #dee2e6',
    },
    tabItem: {
        marginRight: '0.25rem',
    },
    tabLink: {
        cursor: 'pointer',
        padding: '0.75rem 1.25rem',
        color: '#495057',
        textDecoration: 'none',
        display: 'block',
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderBottom: 'none',
        borderTopLeftRadius: '.35rem',
        borderTopRightRadius: '.35rem',
        transition: 'background-color 0.2s ease-in-out',
    },
    tabLinkActive: {
        color: '#0056b3',
        backgroundColor: '#fff',
        borderTop: '3px solid #007bff',
        borderLeft: '1px solid #dee2e6',
        borderRight: '1px solid #dee2e6',
        borderBottom: '1px solid #fff', // Esto hace que se funda con el panel
        fontWeight: 'bold',
        marginBottom: '-1px', // Compensa el borde inferior del contenedor
    },
    tabPane: {
        padding: '1.5rem',
        border: '1px solid #dee2e6',
        borderTop: 'none',
        borderRadius: '0 0 .35rem .35rem',
        backgroundColor: '#fff',
        marginTop: '-1px', // solapa con el borde del nav
    }
};

class CLOCKS_CONTROL extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 'principal'
        };
    }

    requestUpdate = (id) => {
        if (this.props.requestUpdate) {
            this.props.requestUpdate(id);
        }
    }
    
    requestRefresh = () => {
        if (this.props.requestRefresh) {
            this.props.requestRefresh();
        }
    }

    handleTabChange = (tabName) => {
        this.setState({ activeTab: tabName });
    }
    
    getTabLinkStyle = (tabName) => {
        const baseStyle = styles.tabLink;
        if (this.state.activeTab === tabName) {
            return { ...baseStyle, ...styles.tabLinkActive };
        }
        return baseStyle;
    }

    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion, secondary } = this.props;
        const { activeTab } = this.state;
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
                { state: 30, name: 'Acta Parte 1: Observaciones', limit: [5, false, _fun_0_type_time[currentItem.type] ?? 45], icon: <i class="fas fa-file-alt text-success"></i>, },
                { state: 31, name: 'Citación (Observaciones)', icon: <i class="far fa-envelope text-secondary"></i>, },
                { state: 32, name: 'Notificación (Observaciones)', limit: [31, false, 5], icon: <i class="far fa-envelope text-secondary"></i>, },
                { state: 33, name: 'Notificación por aviso (Observaciones)', limit: [31, false, 10], icon: <i class="far fa-envelope text-secondary"></i>, optional: true, },
    
                { state: 34, name: 'Prórroga correcciones', optional: true, limit: [[33, 32], false, [30, 30]], icon: <i class="far fa-dot-circle"></i>, },
                { state: 35, name: 'Correcciones', optional: !requereCorr(), limit: [[33, 32], false, [35, 35, 40]], limitValues: presentExt() ? 45 : 30, icon: <i class="fas fa-file-alt"></i>, },
    
                { state: stepsToCheck, version: -3, optional: true, icon: <i class="far fa-dot-circle text-danger"></i> },
    
                { state: 49, name: 'Acta Parte 2: Correcciones', optional: !requereCorr(), limit: [35, false, 50], limitValues: viaTime(), icon: <i class="fas fa-file-alt text-success"></i>, },
    
                { state: stepsToCheck, version: -4, optional: true, icon: <i class="far fa-dot-circle text-danger"></i> },
    
                { state: 61, name: 'Acto de Tramite de Licencia (Viabilidad)', limit: false, icon: <i class="fas fa-file-alt text-success"></i>, },
                { state: 55, name: 'Citación (Viabilidad)', limit: [61, false, 5], icon: <i class="far fa-envelope text-secondary"></i>, },
                { state: 56, name: 'Notificación (Viabilidad)', limit: [55, false, 5], icon: <i class="far fa-envelope text-secondary"></i>, },
                { state: 57, name: 'Notificación por aviso (Viabilidad)', limit: [55, false, 10], icon: <i class="far fa-envelope text-secondary"></i>, optional: true, },
    
                { state: 69, name: 'Radicaciones de pagos', limit: false, icon: <i class="fas fa-comment-dollar text-warning"></i>, },
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
            //{ state: 80, name: 'Certificación de Ejecutoria', icon: <i class="fas fa-file-alt text-success"></i>, },
            { state: 99, name: 'Licencia', icon: <i class="fas fa-file-alt text-success"></i>, },
            { state: 101, name: 'Archivo', icon: <i class="fas fa-lock text-info"></i>, },
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

            return (
                <div className="row" key={key}>
                    <div className="col border"><label className="fw-bold text-uppercase">{value.icon} {value.name ?? clock.name ?? ''}</label></div>
                    {!hideLimit && 
                    <div className="col-2 border py-1 text-center">
                        {limit_clock 
                            ? dateParser_finalDate(limit_clock.date_start, value.limitValues || value.limit[2]) 
                            : value.version < 0 
                                ? _GET_TIME_FOR_NEGATIVE_PROCESS({ state: value.state, version: value.version, date_start: clock.date_start }) 
                                : ''}
                    </div>}
                    <div className="col-2 border py-1 text-center"><label>{value.date ?? clock.date_start ?? ''}</label></div>
                    <div className="col border"><label>{value.desc ?? clock.desc ?? ''}</label></div>
                </div>
            );
        };

        const _COMPONENT_SECONDARY = () => {
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
        };
        
        const HEAD = (
            <div className="row text-light">
                <div className="col border bg-info text-center"><label className="fw-bold text-uppercase">Control Proceso</label></div>
                <div className="col-2 border bg-info py-1 text-center"><label className="fw-bold text-uppercase">Fecha límite términos y plazos</label></div>
                <div className="col-2 border bg-info py-1 text-center"><label className="fw-bold text-uppercase">Fecha ejecución proceso</label></div>
                <div className="col border bg-info text-center"><label className="fw-bold text-uppercase">Observaciones</label></div>
            </div>
        );

        const HEAD_SECONDARY_TITLE = (
            <div className="row text-light mt-3">
                <div className="col border bg-info text-center">
                    <label className="fw-bold text-uppercase">EVENTOS SECUNDARIOS</label>
                </div>
            </div>
        );

        const HEAD_SECONDARY_HEADER = (
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
            { id: 'desistimientos', label: 'Control Desistimientos', className: 'text-danger fw-bold' },
        ];

        return (
            <div className="mb-5">
                <ul style={styles.tabsContainer}>
                    {tabs.map(tab => (
                        <li key={tab.id} style={styles.tabItem}>
                            <a
                                style={this.getTabLinkStyle(tab.id)}
                                onClick={() => this.handleTabChange(tab.id)}
                                className={tab.className || ''}
                            >
                                {tab.label}
                            </a>
                        </li>
                    ))}
                </ul>

                <div className="tab-content">
                    <div style={styles.tabPane}>
                        {activeTab === 'tiempos' && (
                            <EXP_CLOCKS 
                                {...this.props}
                                requestUpdate={this.requestUpdate}
                            />
                        )}
                        {activeTab === 'principal' && (
                            <>
                                {HEAD}
                                {_COMPONENT_CLOCK_LIST()}
                                {secondary && <>
                                    {HEAD_SECONDARY_TITLE}
                                    {HEAD_SECONDARY_HEADER}
                                    {_COMPONENT_SECONDARY()}
                                </>}
                            </>
                        )}
                        {activeTab === 'eventos' && (
                            <FUN_CLOCK_EVENTS
                                {...this.props}
                                requestUpdate={this.requestUpdate}
                            />
                        )}
                        {activeTab === 'grafico' && (
                            <FUN_CLOCK_CHART
                                {...this.props}
                            />
                        )}
                        {activeTab === 'desistimientos' && (
                            <>
                                <legend className="my-3 px-3 text-uppercase bg-danger">
                                    <label className="app-p lead text-center fw-normal text-uppercase text-light">CONTROL DE PROCESOS DE DESISTIMIENTOS</label>
                                </legend>
                                <FUN_CLOCKS_NEGATIVE
                                    {...this.props}
                                    requestUpdate={this.requestUpdate}
                                    requestRefresh={this.requestRefresh}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

export default CLOCKS_CONTROL;