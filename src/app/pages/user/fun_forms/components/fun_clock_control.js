import React, { Component } from 'react';
import { dateParser_dateDiff, dateParser_finalDate } from '../../../../components/customClasses/typeParse';

var momentB = require('moment-business-days');

class FUN_CLOCK_CONTROL extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion } = this.props;

        // DATA GETTERS
        let _GET_CHILD_CLOCK = () => {
            var _CHILD = currentItem.fun_clocks;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        // DATA CONVERTERS
        let _GET_COLOR_STATE = (_state) => {
            if (!_state) return 'LightGray'
            if (_state == 1) return 'DarkGreen'
            if (_state < 0) return 'DarkRed'
            //if (_state == -2) return 'Pink'
            if (_state == 1) return 'SkyBlue'
            if (_state == 3) return 'DarkBlue'
            //if (_state == 4) return 'SkyBlue'
            if (_state == 5) return 'DarkGreen' // LYDF
            //if (_state == 6) return 'LightGreen'
            //if (_state == 7) return 'Purple'
            //if (_state == 8) return 'Orchid'
            if (_state == 11) return 'Teal' // RECORD LAW
            if (_state == 12) return 'Teal' // RECORD ENG
            if (_state == 13) return 'Teal' // RECORD ARC
            if (_state == 14) return 'Teal' // RECORD PH
            if (_state >= 30 && _state <= 50) return 'MidnightBlue' // RECORD PH
            //if (_state == 99) return 'Gold' 
            if (_state == 100) return 'Black' // ARCHIVE
            return 'LightGray'
        }
        let _GET_CLOCK_STATE_VERSION = (_state, _version) => {
            var _CLOCK = _GET_CHILD_CLOCK();
            if (_state == null) return false;
            for (var i = 0; i < _CLOCK.length; i++) {
                if (_CLOCK[i].state == _state && _CLOCK[i].version == _version) return _CLOCK[i];
            }
            return false;
        }
        let _GET_ICON_CONTEXT = (_clock) => {
            if (_clock.state == -1) return <i class="far fa-times-circle" style={{ color: 'Red' }}></i>
            if (_clock.state < -1) return <i class="far fa-times-circle" style={{ color: 'Red' }}></i>
            if (_clock.state == 3) return <i class="far fa-check-circle" style={{ color: 'DarkBlue' }}></i>
            if (_clock.state == 5) return <i class="far fa-check-circle" style={{ color: 'Green' }}></i>
            if (_clock.state > 10 && _clock.state < 15) return <i class="far fa-dot-circle" style={{ color: 'Teal' }}></i>
            if (_clock.state == 30 || _clock.state == 50 || _clock.state == 49) return <i class="far fa-check-circle" style={{ color: 'MidnightBlue' }}></i>
            if (_clock.state >= 31 || _clock.state < 49) return <i class="far fa-dot-circle" style={{ color: 'MidnightBlue' }}></i>
            if (_clock.state == 100) return <i class="far fa-pause-circle" style={{ color: 'Black' }}></i>
            return ""
        }
        let _GET_TIME_FOR_CLOCK_STATE = (_state) => {
            if (!_state) return 0
            if (_state == -1) return 30
            if (_state == 3) return 30
            if (_state == 5) return _GET_FINAL_TIME_LEGAL() // LYDF
            if (_state == 30) return _GET_FINAL_TIME_LEGAL()
            if (_state == 50) return _GET_FINAL_TIME_LEGAL() + 30
            return 0
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
        let _GET_PROCESS_CONTEXT = (version) => {
            if (!version) return ""
            if (version == '-1') return "INCOMPLETO"
            if (version == '-2') return "NO CUMPLE ACTA DE OBSERVACIONES"
            if (version == '-3') return "NO CUMPLE ACTA DE CORRECIONES"
            if (version == '-4') return "NO PAGO EXPENSAS VARIABLES"
            return ""
        }
        let _GET_FINAL_TIME_LEGAL = () => {
            let daysPassed = 45;
            let start = _GET_CLOCK_STATE_VERSION(-5, -2).date_start;
            let end = _GET_CLOCK_STATE_VERSION(-30, -2).date_start;
            let diff;
            if (start && end) {
                diff = dateParser_dateDiff(start, end);
                daysPassed += diff;
            }
            start = _GET_CLOCK_STATE_VERSION(-5, -3).date_start;
            end = _GET_CLOCK_STATE_VERSION(-30, -3).date_start;
            if (start && end) {
                diff = dateParser_dateDiff(start, end);
                daysPassed += diff;
            }

            return daysPassed;
        }
        // COMPONENTS JSX
        let _COMPONENT = () => {
            var _CLOCK = _GET_CHILD_CLOCK();
            var _COMPONENT = [];
            _COMPONENT.push(<>
                <div className="row text-center text-uppercase text-white ms-0">
                    <div className="col-3 border bg-info">
                        <label className="fw-bold  ">Control de Proceso</label>
                    </div>
                    <div className="col-5 border bg-info">
                        <label className="fw-bold">Observaciones</label>
                    </div>
                    <div className="col-2 border bg-info">
                        <label className="fw-bold">Fehca en Proceso</label>
                    </div>
                    <div className="col-2 border bg-info">
                        <label className="fw-bold">Fecha Limite</label>
                    </div>
                </div>
                <div className="row text-center text-uppercase text-dark ms-0 mb-1">
                    <div className="col bg-light">
                        <label className="fw-bold">Eventos principales</label>
                    </div>
                </div>
            </>)

            // PRIMARY EVENTS

            _COMPONENT.push(<>
                <div className="row ms-0 mb-1" style={{ fontSize: '0.95rem' }}>
                    <div className="col-3 border border-primary">
                        <label><i class="far fa-check-circle" style={{ color: 'DarkBlue' }}></i> Radicacion virtual</label>
                    </div>
                    <div className="col-5 border border-primary">
                        <label >Momento en que la radicacion fue añadida al sistema</label>
                    </div>
                    <div className="col-4 border border-primary text-center">
                        <label>{currentItem.date}</label>
                    </div>
                </div>
            </>)



            for (var i = 0; i < _CLOCK.length; i++) {
                if (
                    !(_CLOCK[i].state >= 10 && _CLOCK[i].state <= 15)
                    && !(_CLOCK[i].state >= 31 && _CLOCK[i].state < 49)
                    && (
                        (_CLOCK[i].state >= -1 && _CLOCK[i].state < 30)
                        ||
                        (_CLOCK[i].state >= 30)
                    )
                )
                    _COMPONENT.push(<>
                        <div className="row ms-0 mb-1" style={{ fontSize: '0.95rem' }}>
                            <div className="col-3" style={{ borderColor: _GET_COLOR_STATE(_CLOCK[i].state), borderStyle: 'solid', borderWidth: '0.5px' }}>
                                <label>{_GET_ICON_CONTEXT(_CLOCK[i])} {_CLOCK[i].name}</label>
                            </div>
                            <div className="col-5" style={{ borderColor: _GET_COLOR_STATE(_CLOCK[i].state), borderStyle: 'solid', borderWidth: '0.5px' }}>
                                <label>{_CLOCK[i].desc}</label>
                            </div>
                            <div className="col-2 text-center" style={{ borderColor: _GET_COLOR_STATE(_CLOCK[i].state), borderStyle: 'solid', borderWidth: '0.5px' }}>
                                <label>{_CLOCK[i].date_start}</label>
                            </div>
                            <div className="col-2 text-center" style={{ borderColor: _GET_COLOR_STATE(_CLOCK[i].state), borderStyle: 'solid', borderWidth: '0.5px' }}>
                                <label>{dateParser_finalDate(_CLOCK[i].date_start, _GET_TIME_FOR_CLOCK_STATE(_CLOCK[i].state))} </label>
                            </div>
                        </div>
                    </>)
            }

            // SECONDARY EVENTS

            _COMPONENT.push(<>
                <div className="row text-center text-uppercase text-dark ms-0 mb-1">
                    <div className="col bg-light">
                        <label className="fw-bold">Eventos Secundarios</label>
                    </div>
                </div>
            </>)

            // SIGN
            if (currentItem.fun_law) {
                if (currentItem.fun_law.sign) {
                    let _sign = currentItem.fun_law.sign.split(',')
                    if (_sign[1]) _COMPONENT.push(<>
                        <div className="row ms-0 mb-1" style={{ fontSize: '0.95rem' }}>
                            <div className="col-3" style={{ borderColor: 'Purple', borderStyle: 'solid', borderWidth: '0.5px' }}>
                                <label> <i class="far fa-dot-circle" style={{ color: 'Purple' }}></i> Radicacion de Valla</label>
                            </div>
                            <div className="col-5" style={{ borderColor: 'Purple', borderStyle: 'solid', borderWidth: '0.5px' }}>
                                <label></label>
                            </div>
                            <div className="col-4 text-center" style={{ borderColor: 'Purple', borderStyle: 'solid', borderWidth: '0.5px' }}>
                                <label>{_sign[1]}</label>
                            </div>
                        </div>
                    </>)
                }
            }

            // NEIGHBOURS
            let _neighbours = currentItem.fun_3s;
            for (var i = 0; i < _neighbours.length; i++) {
                if (_neighbours[i].alerted) _COMPONENT.push(<>
                    <div className="row ms-0 mb-1" style={{ fontSize: '0.95rem' }}>
                        <div className="col-3" style={{ borderColor: 'Orchid', borderStyle: 'solid', borderWidth: '0.5px' }}>
                            <label> <i class="far fa-dot-circle" style={{ color: 'Orchid' }}></i> Vecino Notificado</label>
                        </div>
                        <div className="col-5" style={{ borderColor: 'Orchid', borderStyle: 'solid', borderWidth: '0.5px' }}>
                            <label></label>
                        </div>
                        <div className="col-4 text-center" style={{ borderColor: 'Orchid', borderStyle: 'solid', borderWidth: '0.5px' }}>
                            <label>{_neighbours[i].alerted}</label>
                        </div>
                    </div>
                </>)
            }


            //  REPORTS & RECORDS

            for (var i = 0; i < _CLOCK.length; i++) {
                if ((_CLOCK[i].state > 10 && _CLOCK[i].state < 15))
                    _COMPONENT.push(<>
                        <div className="row ms-0 mb-1" style={{ fontSize: '0.95rem' }}>
                            <div className="col-3" style={{ borderColor: _GET_COLOR_STATE(_CLOCK[i].state), borderStyle: 'solid', borderWidth: '0.5px' }}>
                                <label>{_GET_ICON_CONTEXT(_CLOCK[i])} {_CLOCK[i].name}</label>
                            </div>
                            <div className="col-5" style={{ borderColor: _GET_COLOR_STATE(_CLOCK[i].state), borderStyle: 'solid', borderWidth: '0.5px' }}>
                                <label>{_CLOCK[i].desc}</label>
                            </div>
                            <div className="col-4 text-center" style={{ borderColor: _GET_COLOR_STATE(_CLOCK[i].state), borderStyle: 'solid', borderWidth: '0.5px' }}>
                                <label>{_CLOCK[i].date_start}</label>
                            </div>
                        </div>
                    </>)
            }

            //  REPORT REVIEW NOTIFICATION PROCESS

            for (var i = 0; i < _CLOCK.length; i++) {
                if ((_CLOCK[i].state >= 31 && _CLOCK[i].state < 49))
                    _COMPONENT.push(<>
                        <div className="row ms-0 mb-1" style={{ fontSize: '0.95rem' }}>
                            <div className="col-3" style={{ borderColor: _GET_COLOR_STATE(_CLOCK[i].state), borderStyle: 'solid', borderWidth: '0.5px' }}>
                                <label>{_GET_ICON_CONTEXT(_CLOCK[i])} {_CLOCK[i].name}</label>
                            </div>
                            <div className="col-5" style={{ borderColor: _GET_COLOR_STATE(_CLOCK[i].state), borderStyle: 'solid', borderWidth: '0.5px' }}>
                                <label>{_CLOCK[i].desc}</label>
                            </div>
                            <div className="col-4 text-center" style={{ borderColor: _GET_COLOR_STATE(_CLOCK[i].state), borderStyle: 'solid', borderWidth: '0.5px' }}>
                                <label>{_CLOCK[i].date_start}</label>
                            </div>
                        </div>
                    </>)
            }

            // CLOSE PROCESS

            _COMPONENT.push(<>
                <div className="row text-center text-uppercase text-dark ms-0 mb-1">
                    <div className="col bg-light">
                        <label className="fw-bold">Procesos de Desistimientos</label>
                    </div>
                </div>
            </>)

            let _LIST_NEGATIVE = []
            let _CLOCKS = _CLOCK;
            for (var i = 0; i < _CLOCKS.length; i++) {
                if (_CLOCKS[i].state < 0) _LIST_NEGATIVE.push(_CLOCKS[i])
            }


            var _LIST_SORTED = _LIST_NEGATIVE;

            /* USE THIS IN CASE THE LIST NEEDS TO BE ARRANGE USING OTHER OF ITS KEYS, IE date_start OR state
            BY DEFAULT IT IS SORTED BY THE KEY date_start
            for (var state in _LIST_NEGATIVE) {
                _LIST_SORTED.push(_LIST_NEGATIVE[state]);
            }

            _LIST_SORTED.sort(function (a, b) {
                return b.date_start - a.date_start;
            });
            */
            for (var i = 0; i < _LIST_SORTED.length; i++) {
                if (_LIST_SORTED[i].state < -4)
                    _COMPONENT.push(<>
                        <div className="row ms-0 mb-1" style={{ fontSize: '0.95rem' }}>
                            <div className="col-3" style={{ borderColor: _GET_COLOR_STATE(_LIST_SORTED[i].state), borderStyle: 'solid', borderWidth: '0.5px' }}>
                                <label>{_GET_ICON_CONTEXT(_LIST_SORTED[i])} {_LIST_SORTED[i].name}</label>
                            </div>
                            <div className="col-2" style={{ borderColor: _GET_COLOR_STATE(_LIST_SORTED[i].state), borderStyle: 'solid', borderWidth: '0.5px' }}>
                                <label>{_GET_PROCESS_CONTEXT(_LIST_SORTED[i].version)}</label>
                            </div>
                            <div className="col-3" style={{ borderColor: _GET_COLOR_STATE(_LIST_SORTED[i].state), borderStyle: 'solid', borderWidth: '0.5px' }}>
                                <label>{_LIST_SORTED[i].desc}</label>
                            </div>
                            <div className="col-2 text-center" style={{ borderColor: _GET_COLOR_STATE(_LIST_SORTED[i].state), borderStyle: 'solid', borderWidth: '0.5px' }}>
                                <label>{_LIST_SORTED[i].date_start}</label>
                            </div>
                            <div className="col-2 text-center" style={{ borderColor: _GET_COLOR_STATE(_LIST_SORTED[i].state), borderStyle: 'solid', borderWidth: '0.5px' }}>
                                <label>{_GET_TIME_FOR_NEGATIVE_PROCESS(_LIST_SORTED[i])}</label>
                            </div>
                        </div>
                    </>)
            }

            return <>{_COMPONENT}</>

        }

        // FUNCTIONS AND WORKING ENGINES


        return (
            <div className="row p-1 m-1">
                {_COMPONENT()}

            </div>
        );
    }
}

export default FUN_CLOCK_CONTROL;