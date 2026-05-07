import FUNService from '../../../services/fun.service'
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';
import { swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';

const FUNN2 = ({ translation, swaMsg, globals, currentItem, currentVersion, requestUpdate }) => {

        var formData = new FormData();

        let _GET_EXISTING_FUN_2 = () => {
            const child = currentItem.fun_2;
            const item = Array.isArray(child) ? child.find(entry => entry?.id) : child;
            if (!item || typeof item !== 'object' || item.id == null || item.id === '') return null;
            return item;
        }

        let _GET_RADIO_VALUE = (name) => {
            const radios = document.getElementsByName(name);
            for (var i = 0; i < radios.length; i++) {
                if (radios[i].checked == true) return radios[i].value;
            }
            return '';
        }

        let _SET_CHILD_2 = () => {
            var _CHILD = _GET_EXISTING_FUN_2();
            var _CHILD_VARS = {
                item_20: "",
                item_211: "",
                item_212: "",
                item_22: "",
                item_23: "",
                item_232: "",
                item_24: "",
                item_25: "",
                item_261: "",
                item_262: "",
                item_263: "",
                item_264: "",
                item_265: "",
                item_266: "",
                item_267: "",
                item_268: "",
            }
            if (_CHILD) {
                _CHILD_VARS.item_20 = _CHILD.id ?? "";
                _CHILD_VARS.item_211 = _CHILD.direccion ?? "";
                _CHILD_VARS.item_212 = _CHILD.direccion_ant ?? "";
                _CHILD_VARS.item_22 = _CHILD.matricula ?? "";
                _CHILD_VARS.item_23 = _CHILD.catastral ?? "";
                _CHILD_VARS.item_232 = _CHILD.catastral_2 ?? "";
                _CHILD_VARS.item_24 = _CHILD.suelo ?? ""; // PARSER
                _CHILD_VARS.item_25 = _CHILD.lote_pla ?? "";// PARSER

                _CHILD_VARS.item_261 = _CHILD.barrio ?? "";
                _CHILD_VARS.item_262 = _CHILD.vereda ?? "";
                _CHILD_VARS.item_263 = _CHILD.comuna ?? "";
                _CHILD_VARS.item_264 = _CHILD.sector ?? "";
                _CHILD_VARS.item_265 = _CHILD.corregimiento ?? "";
                _CHILD_VARS.item_266 = _CHILD.lote ?? "";
                _CHILD_VARS.item_267 = _CHILD.estrato ?? "";
                _CHILD_VARS.item_268 = _CHILD.manzana ?? "";
            }
            return _CHILD_VARS;
        }
        let _CHILD_20 = () => {
            let _CHILD_VARS = _SET_CHILD_2();

            return <input type="hidden" id="f_20_id" defaultValue={_CHILD_VARS.item_20} />
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
                        <textarea className="form-control mb-3" rows="3" id="f_211"
                            defaultValue={_CHILD_VARS.item_211}></textarea>
                    </div>
                    <div className="col-6">
                        <label>2.1 Dirección(es) Anterior(es)</label>
                        <textarea className="form-control mb-3" rows="3" id="f_212"
                            defaultValue={_CHILD_VARS.item_212}></textarea>
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-6">
                        <label >2.2 No. Matrícula Inmobiliaria</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="file-alt" size={16} />
                            </span>
                            <input type="text" className="form-control" id="f_22"
                                defaultValue={_CHILD_VARS.item_22} />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>2.3.1 Identificación Catastral (Viejo)</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="file-alt" size={16} />
                            </span>
                            <input type="text" className="form-control" placeholder="No. Catastral" id="f_23"
                                defaultValue={_CHILD_VARS.item_23} />
                        </div>
                        <label>2.3.2 Identificación Catastral (Nuevo, 30 dígitos)</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="file-alt" size={16} />
                            </span>
                            <input type="text" className="form-control" placeholder="No. Catastral nuevo" id="f_232"
                                defaultValue={_CHILD_VARS.item_232} />
                        </div>
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-6">
                        <label>2.4 Clasificación del Suelo</label>
                        <div className="form-check">
                            <input className="form-check-input" type="radio" value="A" name="f_24"
                                defaultChecked={_CHILD_VARS.item_24 == 'A' ? true : false} />
                            <label className="form-check-label" htmlFor="flexCheckDefault">
                                A. Urbano
                            </label>
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="radio" value="B" name="f_24"
                                defaultChecked={_CHILD_VARS.item_24 == 'B' ? true : false} />
                            <label className="form-check-label" htmlFor="flexCheckChecked">
                                B. Rural
                            </label>
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="radio" value="C" name="f_24"
                                defaultChecked={_CHILD_VARS.item_24 == 'C' ? true : false} />
                            <label className="form-check-label" htmlFor="flexCheckChecked">
                                C. De Expansión
                            </label>
                        </div>
                    </div>
                    <div className="col-6">
                        <label>2.5 Planimetría del Lote</label>
                        <div className="form-check">
                            <input className="form-check-input" type="radio" value="A" name="f_25"
                                defaultChecked={_CHILD_VARS.item_25 == 'A' ? true : false} />
                            <label className="form-check-label" htmlFor="flexCheckDefault">
                                A. Plano del Lote
                            </label>
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="radio" value="B" name="f_25"
                                defaultChecked={_CHILD_VARS.item_25 == 'B' ? true : false} />
                            <label className="form-check-label" htmlFor="flexCheckChecked">
                                B. Plano Topográfico
                            </label>
                        </div>
                        <div className="input-group my-3">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="question-circle" size={16} />
                            </span>
                            <input type="text" className="form-control" placeholder="Otro, ¿Cual?"
                                id="f_25_o" defaultValue={_CHILD_VARS.item_25 != 'A' && _CHILD_VARS.item_25 != 'B' ? _CHILD_VARS.item_25 : ""} />
                        </div>

                    </div>
                </div>

                <label>2.6 Información General</label>
                <div className="row mb-3">
                    <div className="col-6">
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="map-marked-alt" size={16} />&nbsp;Barrio o Urbanzación
                            </span>
                            <input type="text" className="form-control" id="f_261" defaultValue={_CHILD_VARS.item_261} />
                        </div>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="map-marked-alt" size={16} />&nbsp;Comuna
                            </span>
                            <input type="text" className="form-control" id="f_263" defaultValue={_CHILD_VARS.item_263} />
                        </div>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="map-marked-alt" size={16} />&nbsp;Estrato
                            </span>
                            <input type="number" min="1" max="6" step="1" className="form-control" id="f_267" defaultValue={_CHILD_VARS.item_267} />
                        </div>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="map-marked-alt" size={16} />&nbsp;Manzana No.
                            </span>
                            <input type="text" className="form-control" id="f_268" defaultValue={_CHILD_VARS.item_268} />
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="map-marked-alt" size={16} />&nbsp;Vereda
                            </span>
                            <input type="text" className="form-control" id="f_262" defaultValue={_CHILD_VARS.item_262} />
                        </div>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="map-marked-alt" size={16} />&nbsp;Sector
                            </span>
                            <input type="text" className="form-control" id="f_264" defaultValue={_CHILD_VARS.item_264} />
                        </div>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="map-marked-alt" size={16} />&nbsp;Corregimiento
                            </span>
                            <input type="text" className="form-control" id="f_265" defaultValue={_CHILD_VARS.item_265} />
                        </div>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="map-marked-alt" size={16} />&nbsp;Lote No.
                            </span>
                            <input type="text" className="form-control" id="f_266" defaultValue={_CHILD_VARS.item_266} />
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
            const currentFun2 = _GET_EXISTING_FUN_2();
            let fun2Id = currentFun2?.id ?? document.getElementById("f_20_id").value;

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
            let suelo = '';
            let lote_pla = '';

            suelo = _GET_RADIO_VALUE("f_24");
            formData.set('suelo', suelo);

            otherOption = document.getElementById("f_25_o");
            if (otherOption.value) {
                lote_pla = otherOption.value
            } else {
                lote_pla = _GET_RADIO_VALUE("f_25");
            }
            formData.set('lote_pla', lote_pla);
            otherOption = null;

            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            if (!fun2Id) {
                FUNService.create_fun2(formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                            requestUpdate(currentItem.id)
                        } else {
                            swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                    });
            } else {
                FUNService.update_2(currentItem.fun_2.id, formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                            requestUpdate(currentItem.id)
                        } else {
                            swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                    });
            }
        }

        return (<>
            {_CHILD_20()}
            <fieldset className="p-3">
                <legend className="my-2 px-3 Collapsible" id="funn_2">
                    <label className="app-p lead text-center fw-normal">2. Información del Predio</label>
                </legend>
                {_CHILD_2_COMPONENT()}
                <div className="row mb-3 text-center">
                    <div className="col-6">
                        <Button size="sm" className="my-3" onClick={() => new_2()}><Icon name="file-alt" size={16} /> ACTUALIZAR </Button>
                    </div>
                    <div className="col-6">
                            <Button size="sm" className="bg-warning text-warning-foreground hover:bg-warning/90 my-3" onClick={() => _RESET_FORM_2()}><Icon name="eraser" size={16} /> LIMPIAR (2.4 y 2.5) </Button>
                        </div>
                </div>
            </fieldset>
        </>);
};

export default FUNN2;