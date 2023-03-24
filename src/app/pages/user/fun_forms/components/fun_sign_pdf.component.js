import moment from 'moment';
import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import writtenNumber from 'written-number';
import { _FUN_6_PARSER } from '../../../../components/customClasses/funCustomArrays';
import { formsParser1, getJSON, _ADDRESS_SET_FULL } from '../../../../components/customClasses/typeParse';
import { infoCud } from '../../../../components/jsons/vars';
import FunService from '../../../../services/fun.service';

const MySwal = withReactContent(Swal);
class FUN_SIGN_PDF extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    componentDidMount() {

    }
    entDidUpdate(prevState) {
        if (this.state.currentSeal !== prevState.currentSeal && this.state.currentSeal != null) {
            var _ITEM = this.state.currentSeal;
            document.getElementById("seal_3").value = _ITEM.id_public;
            document.getElementById("seal_4").value = _ITEM.area;
            document.getElementById("seal_5").value = this.props.currentItem.date;
            document.getElementById("seal_6").value = _ITEM.blueprints;
            document.getElementById("seal_7").value = _ITEM.drives;
            document.getElementById("seal_8").value = _ITEM.folders;
        }
    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion } = this.props;
        const { } = this.state;
        // DATA GETTERS
        let _GET_CHILD_1 = () => {
            var _CHILD = currentItem.fun_1s;
            var _CURRENT_VERSION = currentVersion - 1;
            var _CHILD_VARS = {
                tipo: _CHILD[_CURRENT_VERSION] ? _CHILD[_CURRENT_VERSION].tipo : null,
                tramite: _CHILD[_CURRENT_VERSION] ? _CHILD[_CURRENT_VERSION].tramite : null,
                m_urb: _CHILD[_CURRENT_VERSION] ? _CHILD[_CURRENT_VERSION].m_urb : null,
                m_sub: _CHILD[_CURRENT_VERSION] ? _CHILD[_CURRENT_VERSION].m_sub : null,
                m_lic: _CHILD[_CURRENT_VERSION] ? _CHILD[_CURRENT_VERSION].m_lic : null,
                usos: _CHILD[_CURRENT_VERSION] ? _CHILD[_CURRENT_VERSION].usos : null,
            }
            return _CHILD_VARS
        }
        let _GET_CHILD_2 = () => {
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
        let _SET_CHILD_51 = () => {
            var _CHILD = currentItem.fun_51s;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _SET_CHILD_LAW = () => {
            var _CHILD = currentItem.fun_law;
            var _CHILD_VARS = {
                sign: null,
                new_type: null,
                publish_neighbour: null,
                alters_info: [],
            }
            if (_CHILD) {
                _CHILD_VARS.id = _CHILD.id;
                _CHILD_VARS.sign = _CHILD.sign;
                _CHILD_VARS.new_type = _CHILD.new_type;
                _CHILD_VARS.publish_neighbour = _CHILD.publish_neighbour;
                _CHILD_VARS.alters_info = _CHILD.alters_info ? _CHILD.alters_info : [];
            }
            return _CHILD_VARS;
        }
        let _GET_SIGN = () => {
            var _CHILD = _SET_CHILD_LAW()
            var sign = [];
            if (_CHILD.sign) {
                sign = _CHILD.sign.split(',')
            }
            return sign;
        }
        let _GET_CHILD_51_BYROLE = (role) => {
            let _CHILDREN = _SET_CHILD_51();
            for (let i = 0; i < _CHILDREN.length; i++) {
                const _child = _CHILDREN[i];
                if (_child.role == role) return _child.name + ' ' + _child.surname
            }
            return ''
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
        let _GET_EXPEDITIO = () => {
            var _CHILD = currentItem.expedition;
            return _CHILD;
        }
        let _GET_STEP_TYPE_JSON = (_id_public) => {
            var STEP = LOAD_STEP(_id_public);
            if (!STEP.id) return {};
            var value = STEP['json']
            if (!value) return {};
            value = JSON.parse(JSON.parse(value));
            return value
        }
        let LOAD_STEP = (_id_public) => {
            var _PARENT = currentItem.record_arc ?? {};
            var currentVersionR = _PARENT.version ?? 1;
            var _CHILD = _PARENT.record_arc_steps ?? [];
            console.log(_PARENT)
            for (var i = 0; i < _CHILD.length; i++) {
                if (_CHILD[i].version == currentVersionR && _CHILD[i].id_public == _id_public) return _CHILD[i]
            }
            return []
        }
        // JSX COMPONENT

        let _SIGN_FORM = () => {
            var res_id = _GET_EXPEDITIO() ? (_GET_EXPEDITIO().id_public ?? '') : '';
            var res_expiration_date = _GET_EXPEDITIO() ? _GET_EXPEDITIO().reso ?? '' : '';
            res_expiration_date = getJSON(res_expiration_date, 'date');
            return <>
                <form onSubmit={generate_pdf} id="app_form_sign_pdf">
                    <div className="row">
                        <div className=" col">
                            <label>No. Radicación</label>
                            <div class="input-group mb-3">
                                <span class="input-group-text bg-info text-white">
                                    <i class="fas fa-hashtag"></i>
                                </span>
                                <input type="text" class="form-control" defaultValue={currentItem.id_public} id="sign_pdf_1" />
                            </div>
                        </div>
                        <div className=" col">
                            <label>No. Resolución</label>
                            <div class="input-group mb-3">
                                <span class="input-group-text bg-info text-white">
                                    <i class="fas fa-hashtag"></i>
                                </span>
                                <input type="text" class="form-control" defaultValue={res_id} id="sign_pdf_12" />
                            </div>
                        </div>
                        <div className=" col-6">
                            <label>Tipo de Solicitud</label>
                            <div class="input-group mb-3">
                                <span class="input-group-text bg-info text-white">
                                    <i class="far fa-check-square"></i>
                                </span>
                                <input type="text" class="form-control" defaultValue={formsParser1(_GET_CHILD_1())} id="sign_pdf_2" />
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className=" col">
                            <label>Solicitante</label>
                            <div class="input-group mb-3">
                                <span class="input-group-text bg-info text-white">
                                    <i class="far fa-user"></i>
                                </span>
                                <input type="text" class="form-control" defaultValue={_GET_CHILD_51_BYROLE('PROPIETARIO')} id="sign_pdf_3" />
                            </div>
                        </div>

                        <div className=" col">
                            <label>Dirección</label>
                            <div class="input-group mb-3">
                                <span class="input-group-text bg-info text-white">
                                    <i class="fas fa-home"></i>
                                </span>
                                <input type="text" class="form-control" defaultValue={_GET_CHILD_2().item_211} id="sign_pdf_4" />
                                <button className='btn btn-info' type='button' onClick={() => _ADDRESS_SET_FULL("sign_pdf_4", _GET_CHILD_2())}>DIRECCIÓN COMPLETA</button>
                            </div>
                        </div>


                    </div>

                    <div className="row">
                        <div className=" col">
                            <label>Uso</label>
                            <div class="input-group mb-3">
                                <span class="input-group-text bg-info text-white">
                                    <i class="fas fa-list-ul"></i>
                                </span>
                                <input type="text" class="form-control" defaultValue={_FUN_6_PARSER(_GET_CHILD_1().usos, true)} id="sign_pdf_8" />
                            </div>
                        </div>
                        <div className=" col">
                            <label>Fecha de Radicación</label>
                            <div class="input-group mb-3">
                                <span class="input-group-text bg-info text-white">
                                    <i class="far fa-calendar-alt"></i>
                                </span>
                                <input type="date" class="form-control" defaultValue={_GET_SIGN()[1]} id="sign_pdf_6" />
                            </div>
                        </div>
                        <div className=" col">
                            <label>Fecha de Licencia</label>
                            <div class="input-group mb-3">
                                <span class="input-group-text bg-info text-white">
                                    <i class="far fa-calendar-alt"></i>
                                </span>
                                <input type="date" class="form-control" defaultValue={res_expiration_date} id="sign_pdf_lic" />
                            </div>
                        </div>

                        <div className=" col">
                            <label>Vigencia</label>
                            <div class="input-group mb-3">
                                <span class="input-group-text bg-info text-white">
                                    <i class="far fa-calendar-alt"></i>
                                </span>
                                <input type="date" class="form-control" defaultValue={res_expiration_date} id="sign_pdf_13-1" />
                                <input type="date" class="form-control" defaultValue={res_expiration_date} id="sign_pdf_13-2" />
                            </div>
                        </div>

                    </div>

                    <div className='row'>
                        <div className=" col-2">
                            <label>Altura</label>
                            <div class="input-group mb-3">
                                <span class="input-group-text bg-info text-white">
                                    <i class="fas fa-ruler-vertical"></i>
                                </span>
                                <input type="text" class="form-control" id="sign_pdf_5" />
                            </div>
                        </div>
                        <div className=" col-2">
                            <label>Área</label>
                            <div class="input-group mb-3">
                                <span class="input-group-text bg-info text-white">
                                    <i class="fas fa-cube"></i>
                                </span>
                                <input type="number" step={0.01} min="0" class="form-control" id="sign_pdf_14" />
                            </div>
                        </div>
                        <div className=" col-2">
                            <label># Estacionamientos</label>
                            <div class="input-group mb-3">
                                <span class="input-group-text bg-info text-white">
                                    <i class="fas fa-car-side"></i>
                                </span>
                                <input type="number" step={1} min="0" class="form-control" id="sign_pdf_parking" />
                            </div>
                        </div>
                        <div className=" col-2">
                            <label># Unidades otro uso</label>
                            <div class="input-group mb-3">
                                <span class="input-group-text bg-info text-white">
                                    <i class="fas fa-home"></i>
                                </span>
                                <input type="number" step={1} min="0" class="form-control" id="sign_pdf_otheruse" />
                            </div>
                        </div>
                    </div>

                    <hr />

                    <div className="row">
                        <div className=" col-3">
                            <label>Tamaño</label>
                            <div class="input-group mb-3">
                                <span class="input-group-text bg-info text-white">
                                    <i class="fas fa-ruler-combined"></i>
                                </span>
                                <select className='form-select' id="sign_pdf_7" >
                                    <option value="1">1m x 70cm</option>
                                    <option value="2">50cm x 30cm</option>
                                </select>
                            </div>
                        </div>

                        <div className=" col-3">
                            <label>Color de Fondo</label>
                            <div class="input-group mb-3">
                                <span class="input-group-text bg-info text-white">
                                    <i class="fas fa-palette"></i>
                                </span>
                                <select class="form-control form-select" id="sign_pdf_9">
                                    <option value={'white'}>Fondo Blanco</option>
                                    <option value={'gold'}>Fondo Amarillo</option>
                                </select>
                            </div>
                        </div>

                        <div className=" col-3">
                            <label>Tipo de valla</label>
                            <div class="input-group mb-3">
                                <span class="input-group-text bg-info text-white">
                                    <i class="fas fa-palette"></i>
                                </span>
                                <select class="form-control form-select" id="sign_pdf_type">
                                    <option value={'1'}>Valla de radicación</option>
                                    <option value={'2'}>Valla de resolución</option>
                                </select>
                            </div>
                        </div>
                        <div className=" col-3">
                            <div class="form-check">
                                <br />
                                <input type="checkbox" class="form-check-input" id="sign_pdf_11" />
                                <label class="form-check-label" for="exampleCheck1">Usar fecha de instalación</label>
                            </div>
                        </div>
                    </div>
                     <div className="row">
                        <div className=" col">
                            <label>Texto de Valla</label>
                            <textarea id="sign_pdf_10" defaultValue={infoCud.sign.text} class="form-control" rows={4}></textarea>
                        </div>
                    </div>

                    <div className="row">
                        <div className="Col-12">
                            <div className="text-center py-4 mt-3">
                                <button className="btn btn-danger"><i class="far fa-file-pdf"></i> GENERAR PDF </button>
                            </div>
                        </div>
                    </div>
                </form>
            </>
        }
        // FUNCTIONS & APIS
        var formData = new FormData();


        // GENERATES AND GETS PDF SEAL
        let generate_pdf = (e) => {
            e.preventDefault()
            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            formData = new FormData();
            let id_public = document.getElementById("sign_pdf_1").value
            formData.set('id_public', id_public);
            let type = document.getElementById("sign_pdf_2").value
            formData.set('type', type);
            let solicitor = document.getElementById("sign_pdf_3").value
            formData.set('solicitor', solicitor);
            let address = document.getElementById("sign_pdf_4").value
            formData.set('address', address);
            let height = document.getElementById("sign_pdf_5").value
            formData.set('height', height);
            let date = document.getElementById("sign_pdf_6").value
            formData.set('date', date);
            let size = document.getElementById("sign_pdf_7").value
            formData.set('size', size);
            let use = document.getElementById("sign_pdf_8").value
            formData.set('use', use);
            let color = document.getElementById("sign_pdf_9").value
            formData.set('color', color);
            let text = document.getElementById("sign_pdf_10").value
            formData.set('text', text);
            let daten = document.getElementById("sign_pdf_11").checked ? 1 : 0;
            formData.set('daten', daten);
            let res_id = document.getElementById("sign_pdf_12").value;
            formData.set('res_id', res_id);
            let res_date = document.getElementById("sign_pdf_lic").value;
            formData.set('res_date', res_date);
            let res_exp_date_1 = document.getElementById("sign_pdf_13-1").value;
            formData.set('res_exp_date_1', res_exp_date_1);
            let res_exp_date_2 = document.getElementById("sign_pdf_13-2").value;
            formData.set('res_exp_date_2', res_exp_date_2);
            let area = document.getElementById("sign_pdf_14").value;
            formData.set('area', area);
            let parking = document.getElementById("sign_pdf_parking").value;
            formData.set('parking', parking);
            let otheruse = document.getElementById("sign_pdf_otheruse").value;
            formData.set('otheruse', otheruse);

            size == '1' ? size = "1m x 70cm" : size = "50cm x 30cm";

            let between_months = moment(res_exp_date_1).diff(moment(res_exp_date_2), 'months', false);
            between_months = Math.abs(between_months);
            
            writtenNumber.defaults.lang = 'es';
            let writen_months = writtenNumber(between_months).toUpperCase();

            formData.set('between_months', between_months);
            formData.set('writen_months', writen_months);

            let sign_type = document.getElementById("sign_pdf_type").value;
            formData.set('sign_type', sign_type);

            FunService.gen_doc_sign(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.close();
                        window.open(process.env.REACT_APP_API_URL + "/pdf/sign/" + "Valla " + id_public + " tamaño " + size + ".pdf");
                        MySwal.close();
                    } else {

                    }
                })
                .catch(e => {
                    console.log(e);
                });
        };
        return (
            <div className="py-3">
                {_SIGN_FORM()}
            </div>
        );
    }
}


export default FUN_SIGN_PDF;