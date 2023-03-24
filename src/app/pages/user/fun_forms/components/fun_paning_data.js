import React, { Component } from 'react';
import { addDecimalPoints, dateParser } from '../../../../components/customClasses/typeParse';


class FUN_PLANING_DATA extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    render() {
        const { translation, swaMsg, globals, currentItem } = this.props;
        const { } = this.state;


        // DATA GETERS
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
                planing_data: [],
            }
            if (_CHILD != null) {
                _CHILD_VARS.planing_data = _CHILD.planing_data;
            }
            return _CHILD_VARS;
        }
        let _GET_LAW_PLANING_DATA = () => {
            var _CHILD = _GET_CHILD_LAW();
            if(!_CHILD) return [];
            if(!_CHILD.planing_data) return [];
            if (_CHILD.planing_data.length) {
                return _CHILD.planing_data.split(",");
            }
            return [];
        }
        // COMPONENTS JSX
        let _COMPONENT = () => {
            var _ARRAY = _GET_LAW_PLANING_DATA();
            return <div>
                <div className="row border">
                    <div className="col-6 p-1">
                        <label>1. Se realizó la liquidación de los deberes urbanísticos</label>
                    </div>
                    <div className="col-3 p-1">
                        <label>Serial: </label> <label className="fw-bold">{_ARRAY[0]}</label>
                    </div>
                    <div className="col-3 p-1">
                        <label>Fecha: </label>  <label className="fw-bold">{dateParser(_ARRAY[1])}</label>
                    </div>
                </div>
                <div className="row border">
                    <div className="col-6 p-1">
                        <label>2. Se envió a la Secretaria de Planeación Municipal</label>
                    </div>
                    <div className="col-3 p-1">
                        <label>Guía/recibido: </label><label className="fw-bold">{_ARRAY[2]}</label>
                    </div>
                </div>
                <div className="row border">
                    <div className="col-6 p-1">
                        <label>3. Se aportó el recibo de pago</label>
                    </div>
                    <div className="col-3 p-1">
                        <label>Número: </label> <label className="fw-bold">{_ARRAY[3]}</label>
                    </div>
                    <div className="col-3 p-1">
                        <label>Valor: </label> <label className="fw-bold">${addDecimalPoints(_ARRAY[4])}</label>
                    </div>
                </div>
                <div className="row border">
                    <div className="col-6 p-1">
                        <label>4. ¿Se aporto el recibo de pago?</label>
                    </div>
                    <div className="col-3 p-1"> {_ARRAY[5] ? <label className="fw-bold">SI APORTO</label> : <label className="fw-bold">NO APORTO</label>}
                    </div>
                </div>
                <div className="row border">
                    <div className="col-6 p-1">
                        <label>5. Documento: Liquidación</label>
                    </div>
                    <div className="col-6 p-1">
                        {_ARRAY[6] > 0
                            ? <a className="btn btn-sm btn-danger" target="_blank"
                                href={process.env.REACT_APP_API_URL + '/files/' + _FIND_6(_ARRAY[6]).path + "/" + _FIND_6(_ARRAY[6]).filename} ><i class="fas fa-cloud-download-alt fa-2x"></i></a>
                            : <label className="fw-bold">SIN DOCUMENTO</label>}
                    </div>
                </div>
                <div className="row border">
                    <div className="col-6 p-1">
                        <label>6. Documento: Comprobante de envío</label>
                    </div>
                    <div className="col-6 p-1">
                        {_ARRAY[7] > 0
                            ? <a className="btn btn-sm btn-danger" target="_blank"
                                href={process.env.REACT_APP_API_URL + '/files/' + _FIND_6(_ARRAY[7]).path + "/" + _FIND_6(_ARRAY[7]).filename} ><i class="fas fa-cloud-download-alt fa-2x"></i></a>
                            : <label className="fw-bold">SIN DOCUMENTO</label>}
                    </div>

                </div>
                <div className="row border">
                    <div className="col-6 p-1">
                        <label>7. Documento: Recibo de Pago</label>
                    </div>
                    <div className="col-6 p-1">
                        {_ARRAY[8] > 0
                            ? <a className="btn btn-sm btn-danger" target="_blank"
                                href={process.env.REACT_APP_API_URL + '/files/' + _FIND_6(_ARRAY[8]).path + "/" + _FIND_6(_ARRAY[8]).filename} ><i class="fas fa-cloud-download-alt fa-2x"></i></a>
                            : <label className="fw-bold">SIN DOCUMENTO</label>}
                    </div>

                </div>
            </div>
        }
        return (
            <div className="fun_planing_data container">
                {_COMPONENT()}
            </div >
        );
    }
}

export default FUN_PLANING_DATA;