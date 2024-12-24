import React, { Component } from 'react';
import FUNService from '../../../../services/fun.service'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import moment from 'moment';
import { formsParser1, _ADDRESS_SET_FULL } from '../../../../components/customClasses/typeParse';
import PQRS_Service from '../../../../services/pqrs_main.service';
import { infoCud } from '../../../../components/jsons/vars';
import SubmitService from '../../../../services/submit.service'


const MySwal = withReactContent(Swal);
class FUN_ALERT_NEIGHBOUR extends Component {
    constructor(props) {
        super(props);
        this.state = {
            vrsRelated: []
        };
    }
    componentDidMount() {
        this.retrieveItem();
    }
    retrieveItem() {
        SubmitService.getIdRelated(this.props.currentItem.id_public).then(response => {
            this.setState({ vrsRelated: response.data })
        })
    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion } = this.props;
        const { } = this.state;

        // DATA GETTERS
        let _SET_CHILD_1 = () => {
            var _CHILD = currentItem.fun_1s;
            var _CURRENT_VERSION = currentVersion - 1;
            var _CHILD_VARS = {
                tipo: [],
                tramite: [],
                m_urb: [],
                m_sub: [],
                m_lic: [],
                description: "",
            }
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD_VARS.tipo = _CHILD[_CURRENT_VERSION].tipo;
                    _CHILD_VARS.tramite = _CHILD[_CURRENT_VERSION].tramite;
                    _CHILD_VARS.m_urb = _CHILD[_CURRENT_VERSION].m_urb;
                    _CHILD_VARS.m_sub = _CHILD[_CURRENT_VERSION].m_sub;
                    _CHILD_VARS.m_lic = _CHILD[_CURRENT_VERSION].m_lic;
                    _CHILD_VARS.description = _CHILD[_CURRENT_VERSION].description;
                }
            }
            return _CHILD_VARS;

        }
        let _SET_CHILD_2 = () => {
            var _CHILD = currentItem.fun_2;
            var _CHILD_VARS = {
                item_20: "",
                item_211: "",
                item_212: "",
                item_22: "",
                item_23: "",
                item_24: "",
                item_25: "",
                item_261: "",
                item_262: "",
                item_263: "",
                item_264: "",
                item_265: "",
                item_266: "",
            }
            if (_CHILD) {
                _CHILD_VARS.item_20 = _CHILD.id;
                _CHILD_VARS.item_211 = _CHILD.direccion;
                _CHILD_VARS.item_212 = _CHILD.direccion_ant;
                _CHILD_VARS.item_22 = _CHILD.matricula;
                _CHILD_VARS.item_23 = _CHILD.catastral;
                _CHILD_VARS.item_24 = _CHILD.suelo; // PARSER
                _CHILD_VARS.item_25 = _CHILD.lote_pla;// PARSER

                _CHILD_VARS.item_261 = _CHILD.barrio;
                _CHILD_VARS.item_262 = _CHILD.vereda;
                _CHILD_VARS.item_263 = _CHILD.comuna;
                _CHILD_VARS.item_264 = _CHILD.sector;
                _CHILD_VARS.item_265 = _CHILD.corregimiento;
                _CHILD_VARS.item_266 = _CHILD.lote;
                _CHILD_VARS.item_267 = _CHILD.estrato;
                _CHILD_VARS.item_268 = _CHILD.manzana;
            }
            return _CHILD_VARS;
        }
        let _SET_CHILD_3 = () => {
            var _CHILD = currentItem.fun_3s;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _GET_CLOCK = () => {
            var _CHILD = currentItem.fun_clocks;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _GET_CLOCK_STATE = (_state) => {
            var _CLOCK = _GET_CLOCK();
            if (_state == null) return false;
            for (var i = 0; i < _CLOCK.length; i++) {
                if (_CLOCK[i].state == _state) return _CLOCK[i];
            }
            return false;
        }
        // DATA CONVERTERS
        let _CHILD_3_SELECT = () => {
            let _LIST = _SET_CHILD_3();
            let _COMPONENT = [];
            for (var i = 0; i < _LIST.length; i++) {
                _COMPONENT.push(<option value={i}>{_LIST[i].direccion_2}</option>)
            }
            return <>{_COMPONENT}</>
        }
        let _SET_CHILD_51 = () => {
            var _CHILD = currentItem.fun_51s;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _CHILD_3_ADDRESSES = () => {
            let _LIST = _SET_CHILD_3();
            let _ADDRESSES = [];
            for (var i = 0; i < _LIST.length; i++) {
                _ADDRESSES.push(_LIST[i].direccion_2)
            }
            return _ADDRESSES.join();
        }
        let _CHILD_51_OWNERS = () => {
            let _LIST = _SET_CHILD_51();
            let _OWNERS = [];
            for (var i = 0; i < _LIST.length; i++) {
                _OWNERS.push(_LIST[i].name + " " + _LIST[i].surname)
            }
            return _OWNERS.join();
        }
        let _GET_CHILD_3_IDCUB = (_id) => {
            let _CHILDREN = _SET_CHILD_3();
            let _CHILD = _CHILDREN[_id];
            if (!_CHILD) document.getElementById('gen_alert_id_cub').value = ""
            document.getElementById('gen_alert_id_cub').value = _CHILD.id_cub
        }
        let _GET_CHILD_3_IDCUB_DEFAULT = () => {
            let _CHILDREN = _SET_CHILD_3();
            let _CHILD = _CHILDREN[0];
            if (!_CHILD) return ""
            return _CHILD.id_cub
        }
        // COMPONENT JSX
        let _GENDOC_COMPONENT = () => {
            var _CHILD_1 = _SET_CHILD_1();
            var _CHILD_2 = _SET_CHILD_2();

            return <>
                <div className="row mb-3">
                    <div className="col">
                        <label>2.1.1. Fecha de documento</label>
                        <input type="date" class="form-control" max='2100-01-01' id="gen_alert_date" required
                            defaultValue={moment().format('YYYY-MM-DD')} />
                    </div>
                    <div className="col">
                        <label>2.1.2 Fecha de Pago</label>
                        <div class="input-group my-1">
                            <input type="date" class="form-control" max='2100-01-01' id="gen_pay_date"
                                defaultValue={_GET_CLOCK_STATE(3).date_start} />
                        </div>
                    </div>
                    <div className="col">
                        <label>2.1.3 Consecutivo de Salida</label>
                        <div class="input-group my-1">
                            <input type="text" class="form-control" id="gen_alert_id_cub" 
                                defaultValue={_GET_CHILD_3_IDCUB_DEFAULT() || this.props.cubSelected || ""} />
                        </div>
                    </div>
                    <div></div>
                    <div className="col">
                        <label>2.1.4 Consecutivo Radicado</label>
                        <div class="input-group my-1">
                            <input type="text" class="form-control" id="gen_alert_id_public" disabled
                                defaultValue={currentItem.id_public} />
                        </div>
                    </div>
                    <div className="col ms-auto" >
                        <label className="mt-1">2.1.3 {infoCud.serials.start}</label>
                        <div class="input-group ">
                            <select class="form-select" id="vr_selected" defaultValue={this.props.vr || ""} onChange={(e) => {this.props.setVr(e.target.value)}}>
                                <option value=''>Seleccione una opción</option>
                                {this.state.vrsRelated.map((value, key) => (
                                    <option key={value.id} value={value.id_public}>
                                        {value.id_public}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-6">
                        <label>2.1.5 Dirección</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="gen_alert_address"
                                defaultValue={_CHILD_2.item_211} />
                            <button className='btn btn-info' type='button' onClick={() => _ADDRESS_SET_FULL("gen_alert_address", _CHILD_2)}>DIRECCIÓN COMPLETA</button>
                        </div>
                    </div>
                    <div className="col-6">
                        <label>2.1.6 Ciudad</label>
                        <input type="text" class="form-control" id="gen_alert_city"
                            defaultValue={infoCud.city} />
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-4">
                        <label>2.1.7 Número Predial/Catastral</label>
                        <input type="text" class="form-control" id="gen_alert_predial"
                            defaultValue={(_CHILD_2.item_23).replaceAll('-', '')} />
                    </div>
                    <div className="col-4">
                        <label>2.1.8 Número de Matricula</label>
                        <input type="text" class="form-control" id="gen_alert_matricula"
                            defaultValue={(_CHILD_2.item_22).replaceAll('-', ' ')} />
                    </div>
                    <div className="col-4">
                        <label>2.1.9 Propietario Predio</label>
                        <input type="text" class="form-control" id="gen_alert_owner"
                            defaultValue={_CHILD_51_OWNERS()} />
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-6">
                        <label>2.1.10 Descripción del Proyecto</label>
                        <textarea rows="3" class="form-control" id="gen_alert_description"
                            defaultValue={_CHILD_1.description}
                        />
                    </div>
                    <div className="col-6">
                        <label>2.1.11 Tipo de Solicitud</label>
                        <textarea rows="3" class="form-control" id="gen_alert_type"
                            defaultValue={formsParser1(_CHILD_1)} />
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-6">
                        <label>2.1.12 Vecino Colindante</label>
                        <select class="form-select" required id="gen_alert_address_n"
                            onChange={(e) => _GET_CHILD_3_IDCUB(e.target.value)}>
                            {_CHILD_3_SELECT()}
                        </select>
                    </div>
                    <div className="col-6">
                        <br />
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="digital_firm" />
                            <label class="form-check-label" for="digital_firm">
                                Usar firma digital
                            </label>
                        </div>
                    </div>
                </div>
                <div className="row text-center">
                    <div className="col-4">
                        <button className="btn btn-danger my-3" onClick={() => gen_doc_nconfirm(false)}><i class="fas fa-file-download"></i> GENERAR CARTA</button>
                    </div>
                    <div className="col-4">
                        <button className="btn btn-danger my-3" onClick={() => gen_doc_nconfirm(true)}><i class="fas fa-file-download"></i> GENERAR CARTA Y LISTA</button>
                    </div>
                    <div className="col-4">
                        <button className="btn btn-danger my-3" onClick={() => gen_doc_npublish()}><i class="fas fa-file-download"></i> GENERAR PUBLICACIÓN</button>
                    </div>
                </div>
            </>
        }

        // FUNCTIONS & APIS
        let gen_doc_nconfirm = (_AIM) => {
            let address_i = document.getElementById("gen_alert_address_n").value;
            if (!address_i) return MySwal.fire({
                title: 'NO HAY VECINO SELECCIONADO',
                text: 'Para poder generar el documento de citación a vecinos se debe seleccionar un vecino de la lista 2.1.10',
                icon: 'warning',
                confirmButtonText: swaMsg.text_btn,
            });
            let formData = new FormData();
            let date = document.getElementById("gen_alert_date").value;
            formData.set('date', date);
            let pay_date = document.getElementById("gen_pay_date").value;
            formData.set('pay_date', pay_date);
            let id_cub = document.getElementById("gen_alert_id_cub").value;
            formData.set('id_cub', id_cub);
            let id_public = document.getElementById("gen_alert_id_public").value;
            formData.set('id_public', id_public);
            let owner = document.getElementById("gen_alert_owner").value;
            formData.set('owner', owner);
            let description = document.getElementById("gen_alert_description").value;
            formData.set('description', description);
            let address = document.getElementById("gen_alert_address").value;
            formData.set('address', address);
            let city = document.getElementById("gen_alert_city").value;
            formData.set('city', city);
            let predial = document.getElementById("gen_alert_predial").value;
            formData.set('predial', predial);
            let matricula = document.getElementById("gen_alert_matricula").value;
            formData.set('matricula', matricula);
            let type = document.getElementById("gen_alert_type").value;
            formData.set('type', type);
            address_i = document.getElementById("gen_alert_address_n").value;
            let address_n = _SET_CHILD_3()[address_i].direccion_2;
            formData.set('address_n', address_n);

            formData.set('neighbour', _SET_CHILD_2().item_261);

            formData.set('address_multiple', _CHILD_3_ADDRESSES());
            formData.set('address_multiple_cubs', _SET_CHILD_3().map(c3 => c3.id_cub).join(','));

            let digital_firm = document.getElementById("digital_firm").checked;
            formData.set('digital_firm', digital_firm);

            formData.set('list', _AIM);
            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            FUNService.gen_doc_nconfirm(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.close();
                        window.open(process.env.REACT_APP_API_URL + "/pdf/nconfirm/" + "Confirmacion_Vecino_" + currentItem.id_public + ".pdf");
                    } else {
                        MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    }
                })
                .catch(e => {
                    console.log(e);
                    MySwal.fire({
                        title: swaMsg.generic_eror_title,
                        text: swaMsg.generic_error_text,
                        icon: 'warning',
                        confirmButtonText: swaMsg.text_btn,
                    });
                });
        }

        let gen_doc_npublish = () => {
            let formData = new FormData();
            let date = document.getElementById("gen_alert_date").value;
            formData.set('date', date);
            let pay_date = document.getElementById("gen_pay_date").value;
            formData.set('pay_date', pay_date);
            let id_public = document.getElementById("gen_alert_id_public").value;
            formData.set('id_public', id_public);
            let id_cub = document.getElementById("gen_alert_id_cub").value;
            formData.set('id_cub', id_cub);
            let owner = document.getElementById("gen_alert_owner").value;
            formData.set('owner', owner);
            let description = document.getElementById("gen_alert_description").value;
            formData.set('description', description);
            let address = document.getElementById("gen_alert_address").value;
            formData.set('address', address);
            let city = document.getElementById("gen_alert_city").value;
            formData.set('city', city);
            let predial = document.getElementById("gen_alert_predial").value;
            formData.set('predial', predial);
            let matricula = document.getElementById("gen_alert_matricula").value;
            formData.set('matricula', matricula);
            let type = document.getElementById("gen_alert_type").value;
            formData.set('type', type);

            formData.set('neighbour', _SET_CHILD_2().item_261);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            FUNService.gen_doc_npublish(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.close();
                        window.open(process.env.REACT_APP_API_URL + "/pdf/nconfirm/" + "Confirmacion_Vecino_" + currentItem.id_public + ".pdf");
                    } else {
                        MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    }
                })
                .catch(e => {
                    console.log(e);
                    MySwal.fire({
                        title: swaMsg.generic_eror_title,
                        text: swaMsg.generic_error_text,
                        icon: 'warning',
                        confirmButtonText: swaMsg.text_btn,
                    });
                });
        }
        return (
            <div>
                {_GENDOC_COMPONENT()}
            </div>
        );
    }
}

export default FUN_ALERT_NEIGHBOUR;