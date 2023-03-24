import React, { Component } from 'react';
import { dateParser, dateParser_finalDate } from '../../../../components/customClasses/typeParse';
import VIZUALIZER from '../../../../components/vizualizer.component';

class FUN_REPORT_DATA extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    render() {
        const { translation, swaMsg, globals, currentItem } = this.props;
        const { } = this.state;


        // DATA GETERS
        function formatNumber(num) {
            return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
        }
        let _GET_CHILD_6 = () => {
            var _CHILD = currentItem.fun_6s;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _FIND_6 = (_ID) => {
            let _LIST = _GET_CHILD_6();
            let _CHILD = [];
            for (var i = 0; i < _LIST.length; i++) {
                if (_LIST[i].id == _ID) {
                    _CHILD = _LIST[i];
                    break;
                }
            }
            return _CHILD;
        }
        let _GET_CHILD_LAW = () => {
            var _CHILD = currentItem.fun_law;
            var _CHILD_VARS = {
                report_data: [],
                report_cub: "",
            }
            if (_CHILD != null) {
                _CHILD_VARS.report_data = _CHILD.report_data ? _CHILD.report_data: [];
                _CHILD_VARS.report_cub = _CHILD.report_cub ? _CHILD.report_cub: "";
            }
            return _CHILD_VARS;
        }
        let _GET_LAW_REPORT_DATA = () => {
            var _CHILD = _GET_CHILD_LAW();
            if (_CHILD.report_data.length) {
                return _CHILD.report_data.split(",");
            }
            return [];
        }
        let _GET_NOTIFY = (_VALUE) => {
            if (_VALUE == 0) return <label className="text-danger">SIN NOTIFICAR</label>
            if (_VALUE == 1) return <label className="text-success">NOTIFICADO</label>
        }
        // COMPONENTS JSX
        let _COMPONENT = () => {
            var _CHILD = _GET_LAW_REPORT_DATA();
            return <>
                <div className="row">
                    <div className="col-9 p-1">
                        <label>CUB1 notifico reconocimiento a la –SPM-</label>
                    </div>
                    <div className="col-3 p-1">
                    <label className="fw-bold">{_GET_NOTIFY(_CHILD[0])}</label>
                    </div>
                </div>
                <div className="row">
                    <div className="col-9 p-1">
                        <label>Identificación del oficio</label>
                    </div>
                    <div className="col-3 p-1">
                    <label className="fw-bold">{_GET_CHILD_LAW().report_cub}</label>
                    </div>
                </div>
                <div className="row">
                    <div className="col-9 p-1">
                        <label>Fecha de Radicación ante la SPM</label>
                    </div>
                    <div className="col-3 p-1">
                    <label className="fw-bold">{dateParser(_CHILD[2])}</label>
                    </div>
                </div>
                <div className="row">
                    <div className="col-9 p-1">
                        <label>Respuesta SPM radicación</label>
                    </div>
                    <div className="col-3 p-1">
                    <label className="fw-bold">{_CHILD[3]}</label>
                    </div>
                </div>
                <div className="row">
                    <div className="col-9 p-1">
                        <label>Fecha Limite (Fecha radicacion mas 10 dias hábiles)</label>
                    </div>
                    <div className="col-3 p-1">
                    <label className="fw-bold">{dateParser_finalDate(_CHILD[2], 10)}</label>
                    </div>
                </div>
                <div className="row">
                    <div className="col-9 p-1">
                        <label>Oficio de Planeacion</label>
                    </div>
                    <div className="col-3 p-1">
                    <label className="fw-bold">{_CHILD[5]}</label>
                    </div>
                </div>
               <div className="row">
                    <div className="col-9 p-1">
                        <label>Reporte de Planeacion</label>
                    </div>
                    <div className="col-3 p-1">
                    {_CHILD[6] > 0
                            ? <VIZUALIZER url={ _FIND_6(_CHILD[6]).path + "/" + _FIND_6(_CHILD[6]).filename}
                            apipath={'/files/'} />
                            : <label className="fw-bold">SIN DOCUMENTO</label>}
                    </div>
                </div>
            </>
        }
        return (
            <div className="fun_report_data container">
                {_COMPONENT()}
            </div >
        );
    }
}

export default FUN_REPORT_DATA;