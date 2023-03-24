import React, { Component } from 'react';
import FUNService from '../../../services/fun.service'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { MDBBtn } from 'mdb-react-ui-kit';

const MySwal = withReactContent(Swal);
class FUNN2 extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion } = this.props;
        const { } = this.state;

        var formData = new FormData();

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
                _CHILD_VARS.item_232 = _CHILD.catastral_2;
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
        let _CHILD_20 = () => {
            let _CHILD_VARS = _SET_CHILD_2();

            return <input type="hidden" id="f_20_id" value={_CHILD_VARS.item_20} />
        }
        // DATA COMVERTERS
        let _REGEX_PREDIAL = (e) => {
            let regex = /^[0-9]+$/i;
            let _value = e.target.value
            let _id = e.target.id
            let test = regex.test(_value);
            if (test) {
                var _new_value = "";
                if (_value.length == 15) {
                    _new_value += _value.substring(0, 2);
                    _new_value += "-";
                    _new_value += _value.substring(2, 4);
                    _new_value += "-";
                    _new_value += _value.substring(4, 8);
                    _new_value += "-";
                    _new_value += _value.substring(8, 12);
                    _new_value += "-";
                    _new_value += _value.substring(12, 15);
                    document.getElementById(_id).value = _new_value;
                } else document.getElementById(_id).value = _value;
            } else {
                document.getElementById(_id).value = _value.slice(0, _value.length - 1);
            }
        }
        let _REGEX_MATRICULA = (e) => {
            let _keyPressed = e.key;
            let regex = /^[0-9]+$/i;
            let _value = e.target.value;
            let _id = e.target.id
            let test = regex.test(_keyPressed);
            if (test) {
                var _new_value = "";
                if (_value.length == 4) {
                    _new_value += _value.substring(0, 3);
                    _new_value += "-";
                    _new_value += _value.substring(3, _value.length + 1);
                    document.getElementById(_id).value = _new_value;
                } else document.getElementById(_id).value = _value;
            } else {
                document.getElementById(_id).value = _value.slice(0, _value.length - 1);
            }
        }
        // COMPONENT JSX
        let _CHILD_2_COMPONENT = () => {
            let _CHILD_VARS = _SET_CHILD_2();

            return <>
                <div className="row mb-3">
                    <div className="col-6">
                        <label>2.1 Dirección o Nomenclatura actual</label>
                        <textarea class="form-control mb-3" rows="3" id="f_211"
                            defaultValue={_CHILD_VARS.item_211}></textarea>
                    </div>
                    <div className="col-6">
                        <label>2.1 Dirección(es) Anterior(es)</label>
                        <textarea class="form-control mb-3" rows="3" id="f_212"
                            defaultValue={_CHILD_VARS.item_212}></textarea>
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-6">
                        <label >2.2 No. Matrícula Inmobiliaria</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-file-alt"></i>
                            </span>
                            <input type="text" class="form-control" id="f_22"
                                defaultValue={_CHILD_VARS.item_22} />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>2.3.1 Identificación Catastral (Viejo)</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-file-alt"></i>
                            </span>
                            <input type="text" class="form-control" placeholder="No. Catastral" id="f_23"
                                defaultValue={_CHILD_VARS.item_23} />
                        </div>
                        <label>2.3.2 Identificación Catastral (Nuevo, 30 dígitos)</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-file-alt"></i>
                            </span>
                            <input type="text" class="form-control" placeholder="No. Catastral nuevo" id="f_232"
                                defaultValue={_CHILD_VARS.item_232} />
                        </div>
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-6">
                        <label>2.4 Clasificación del Suelo</label>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" value="A" name="f_24"
                                defaultChecked={_CHILD_VARS.item_24 == 'A' ? true : false} />
                            <label class="form-check-label" for="flexCheckDefault">
                                A. Urbano
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" value="B" name="f_24"
                                defaultChecked={_CHILD_VARS.item_24 == 'B' ? true : false} />
                            <label class="form-check-label" for="flexCheckChecked">
                                B. Rural
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" value="C" name="f_24"
                                defaultChecked={_CHILD_VARS.item_24 == 'C' ? true : false} />
                            <label class="form-check-label" for="flexCheckChecked">
                                C. De Expansión
                            </label>
                        </div>
                    </div>
                    <div className="col-6">
                        <label>2.5 Planimetría del Lote</label>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" value="A" name="f_25"
                                defaultChecked={_CHILD_VARS.item_25 == 'A' ? true : false} />
                            <label class="form-check-label" for="flexCheckDefault">
                                A. Plano del Lote
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" value="B" name="f_25"
                                defaultChecked={_CHILD_VARS.item_25 == 'B' ? true : false} />
                            <label class="form-check-label" for="flexCheckChecked">
                                B. Plano Topográfico
                            </label>
                        </div>
                        <div class="input-group my-3">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-question-circle"></i>
                            </span>
                            <input type="text" class="form-control" placeholder="Otro, ¿Cual?"
                                id="f_25_o" defaultChecked={_CHILD_VARS.item_25 != 'A' && _CHILD_VARS.item_25 != 'B' ? _CHILD_VARS.item_25 : ""} />
                        </div>

                    </div>
                </div>

                <label>2.6 Información General</label>
                <div className="row mb-3">
                    <div className="col-6">
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-map-marked-alt"></i>&nbsp;Barrio o Urbanzación
                            </span>
                            <input type="text" class="form-control" id="f_261" defaultValue={_CHILD_VARS.item_261} />
                        </div>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-map-marked-alt"></i>&nbsp;Comuna
                            </span>
                            <input type="text" class="form-control" id="f_263" defaultValue={_CHILD_VARS.item_263} />
                        </div>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-map-marked-alt"></i>&nbsp;Estrato
                            </span>
                            <input type="number" min="1" max="6" step="1" class="form-control" id="f_267" defaultValue={_CHILD_VARS.item_267} />
                        </div>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-map-marked-alt"></i>&nbsp;Manzana No.
                            </span>
                            <input type="text" class="form-control" id="f_268" defaultValue={_CHILD_VARS.item_268} />
                        </div>
                    </div>
                    <div className="col-6">
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-map-marked-alt"></i>&nbsp;Vereda
                            </span>
                            <input type="text" class="form-control" id="f_262" defaultValue={_CHILD_VARS.item_262} />
                        </div>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-map-marked-alt"></i>&nbsp;Sector
                            </span>
                            <input type="text" class="form-control" id="f_264" defaultValue={_CHILD_VARS.item_264} />
                        </div>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-map-marked-alt"></i>&nbsp;Corregimiento
                            </span>
                            <input type="text" class="form-control" id="f_265" defaultValue={_CHILD_VARS.item_265} />
                        </div>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-map-marked-alt"></i>&nbsp;Lote No.
                            </span>
                            <input type="text" class="form-control" id="f_266" defaultValue={_CHILD_VARS.item_266} />
                        </div>
                    </div>
                </div>
            </>
        }
        let _RESET_FORM_2 = () => {
            let _array = []
            _array = document.getElementsByName("f_24");
            for (var i = 0; i < _array.length; i++) {
                _array[i].checked = false;
            }
            _array = [];

            _array = document.getElementsByName("f_25");
            for (var i = 0; i < _array.length; i++) {
                _array[i].checked = false;
            }
            document.getElementById('f_25_o').value = "";
        }

        let new_2 = () => {
            formData = new FormData();
            let fun0Id = currentItem.id;
            formData.set('fun0Id', fun0Id);
            let fun2Id = document.getElementById("f_20_id").value;

            let direccion = document.getElementById("f_211").value;
            formData.set('direccion', direccion);
            let direccion_ant = document.getElementById("f_212").value;
            formData.set('direccion_ant', direccion_ant);
            let matricula = document.getElementById("f_22").value;
            formData.set('matricula', matricula);
            let catastral = document.getElementById("f_23").value;
            formData.set('catastral', catastral);
            let catastral_2 = document.getElementById("f_232").value;
            formData.set('catastral_2', catastral_2);
            // ----------------------
            let barrio = document.getElementById("f_261").value;
            formData.set('barrio', barrio);
            let comuna = document.getElementById("f_263").value;
            formData.set('comuna', comuna);
            let estrato = document.getElementById("f_267").value;
            formData.set('estrato', estrato);
            let manzana = document.getElementById("f_268").value;
            formData.set('manzana', manzana);
            let vereda = document.getElementById("f_262").value;
            formData.set('vereda', vereda);
            let sector = document.getElementById("f_264").value;
            formData.set('sector', sector);
            let corregimiento = document.getElementById("f_265").value;
            formData.set('corregimiento', corregimiento);
            let lote = document.getElementById("f_266").value;
            formData.set('lote', lote);
            // ----------------------

            let otherOption = null;
            let radios = null;
            let suelo = null;
            let lote_pla = null;

            radios = document.getElementsByName("f_24");
            for (var i = 0; i < radios.length; i++) {
                if (radios[i].checked == true) {
                    suelo = radios[i].value
                }
            } formData.set('suelo', suelo);

            otherOption = document.getElementById("f_25_o");
            if (otherOption.value) {
                lote_pla = otherOption.value
            } else {
                radios = document.getElementsByName("f_25"); // USES OTHER OPTION
                for (var i = 0; i < radios.length; i++) {
                    if (radios[i].checked == true) {
                        lote_pla = radios[i].value
                    }
                }
            } formData.set('lote_pla', lote_pla);
            otherOption = null;

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            if (currentItem.fun_2 == null) {
                FUNService.create_fun2(formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            this.props.requestUpdate(currentItem.id)
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
            } else {
                FUNService.update_2(currentItem.fun_2.id, formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            this.props.requestUpdate(currentItem.id)
                        } else {
                            if (response.status == 500) {
                                MySwal.close();
                            }
                        }
                    })
                    .catch(e => {
                        console.log(e);
                    });
            }
        }

        return (<>
            {_CHILD_20()}
            <fieldset className="p-3">
                <legend className="my-2 px-3 text-uppercase Collapsible" id="funn_2">
                    <label className="app-p lead text-center fw-normal text-uppercase">2. Información del Predio</label>
                </legend>
                {_CHILD_2_COMPONENT()}
                <div className="row mb-3 text-center">
                    <div className="col-6">
                        <MDBBtn className="btn btn-success my-3" onClick={() => new_2()}><i class="far fa-file-alt"></i> ACTUALIZAR </MDBBtn>
                    </div>
                    <div className="col-6">
                            <MDBBtn className="btn btn-warning my-3" onClick={() => _RESET_FORM_2()}><i class="fas fa-eraser"></i> LIMPIAR (2.4 y 2.5) </MDBBtn>
                        </div>
                </div>
            </fieldset>
        </>);
    }
}

export default FUNN2;