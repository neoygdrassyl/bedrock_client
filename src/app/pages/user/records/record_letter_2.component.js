import React, { Component } from 'react';
import { dateParser_finalDate, formsParser1, getJSONFull, _ADDRESS_SET_FULL, _MANAGE_IDS } from '../../../components/customClasses/typeParse'
import FUNService from '../../../services/fun.service'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import moment from 'moment';
import { infoCud } from '../../../components/jsons/vars';
import PQRS_Service from '../../../services/pqrs_main.service';
import { MDBBtn } from 'mdb-react-ui-kit';
import RecordReviewService from '../../../services/record_review.service';
import SubmitService from '../../../services/submit.service'
import CubXVrDataService from '../../../services/cubXvr.service'

const MySwal = withReactContent(Swal);
class RECORD_DOC_LETTER_2 extends Component {
    constructor(props) {
        super(props);
        this.state = {
            vrsRelated: []
        };
    }
    componentDidUpdate(prevProps) {
        // Uso tipico (no olvides de comparar las props):
        if (this.props.currentVersion !== prevProps.currentVersion && this.props.currentVersion != null) {
            var _CHILD_1 = this._SET_CHILD_1_FOREIGNER();
            document.getElementById('gena_type').value = formsParser1(_CHILD_1)
        }
    }
    componentDidMount() {
        this.retrieveItem();
    }
    retrieveItem() {
        SubmitService.getIdRelated(this.props.currentItem.id_public).then(response => {
            this.setState({ vrsRelated: response.data })
        })
    }
    _SET_CHILD_1_FOREIGNER = () => {
        var _CHILD = this.props.currentItem.fun_1s;
        var _CURRENT_VERSION = this.props.currentVersion - 1;
        var _CHILD_VARS = {
            tipo: [],
            tramite: [],
            m_urb: [],
            m_sub: [],
            m_lic: [],
        }
        if (_CHILD) {
            if (_CHILD[_CURRENT_VERSION] != null) {
                _CHILD_VARS.tipo = _CHILD[_CURRENT_VERSION].tipo ? _CHILD[_CURRENT_VERSION].tipo : "";
                _CHILD_VARS.tramite = _CHILD[_CURRENT_VERSION].tramite ? _CHILD[_CURRENT_VERSION].tramite : "";
                _CHILD_VARS.m_urb = _CHILD[_CURRENT_VERSION].m_urb ? _CHILD[_CURRENT_VERSION].m_urb : "";
                _CHILD_VARS.m_sub = _CHILD[_CURRENT_VERSION].m_sub ? _CHILD[_CURRENT_VERSION].m_sub : "";
                _CHILD_VARS.m_lic = _CHILD[_CURRENT_VERSION].m_lic ? _CHILD[_CURRENT_VERSION].m_lic : "";
            }
        }
        return _CHILD_VARS;

    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion } = this.props;

        function capitalize(s) {
            return s && s[0].toUpperCase() + s.slice(1);
        }

        let _GET_LAST_ID = (_id) => {
            let new_id = "";
            PQRS_Service.getlascub()
                .then(response => {
                    new_id = response.data[0].cub;
                    new_id = _MANAGE_IDS(new_id, 'end')
                    document.getElementById(_id).value = new_id;
                })
                .catch(e => {
                    console.log(e);
                    MySwal.fire({
                        title: "ERROR AL CARGAR",
                        text: "No ha sido posible cargar el consecutivo, inténtelo nuevamente.",
                        icon: 'error',
                        confirmButtonText: this.props.swaMsg.text_btn,
                    });
                });

        }
        let _SET_CHILD_53 = () => {
            var _CHILD = currentItem.fun_53s;
            var _CURRENT_VERSION = currentVersion - 1;
            var _CHILD_VARS = {
                item_530: "",
                item_5311: "",
                item_5312: "",
                item_532: "",
                item_533: "",
                item_534: "",
                item_535: "",
                item_536: "",
            }
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD_VARS.item_530 = _CHILD[_CURRENT_VERSION].id;
                    _CHILD_VARS.item_5311 = _CHILD[_CURRENT_VERSION].name;
                    _CHILD_VARS.item_5312 = _CHILD[_CURRENT_VERSION].surname;
                    _CHILD_VARS.item_532 = _CHILD[_CURRENT_VERSION].id_number;
                    _CHILD_VARS.item_533 = _CHILD[_CURRENT_VERSION].role;
                    _CHILD_VARS.item_534 = _CHILD[_CURRENT_VERSION].number;
                    _CHILD_VARS.item_535 = _CHILD[_CURRENT_VERSION].email;
                    _CHILD_VARS.item_536 = _CHILD[_CURRENT_VERSION].address;
                }
            }
            return _CHILD_VARS;
        }
        let _GET_CHILD_LAW = () => {
            var _CHILD = currentItem.fun_law;
            var _CHILD_VARS = {
                id: _CHILD ? (_CHILD.id ?? null) : null,
                sign: _CHILD ? (_CHILD.sign ?? '') : '',
                new_type: _CHILD ? (_CHILD.new_type ?? '') : '',
                publish_neighbour: _CHILD ? (_CHILD.publish_neighbour ?? '') : '',
                id6payment: _CHILD ? (_CHILD.id6payment ?? '') : '',
                cub_act: _CHILD ? (_CHILD.cub_act ?? '') : '',
                cub_act2: _CHILD ? (_CHILD.cub_act2 ?? '') : '',
                cub_act_json: _CHILD ? (_CHILD.cub_act_json ?? null) : null,
                cub_act2_json: _CHILD ? (_CHILD.cub_act2_json ?? null) : null,
            }
            return _CHILD_VARS;
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
        // *********************************
        let _GENDOC_COMPONENT = () => {
            var _CHILD_53 = _SET_CHILD_53();
            let _JSON = getJSONFull(_GET_CHILD_LAW().cub_act2_json);
            let clock = _GET_CLOCK_STATE(32).date_start || _GET_CLOCK_STATE(33).date_start || _GET_CLOCK_STATE(5).date_start;
            return <>
                <div className="row mb-3">
                    <div className="col">
                        <label>Fecha del documento</label>
                        <input type="date" class="form-control mb-3" max='2100-01-01' id="gena2_date_doc" required
                            defaultValue={_JSON.date_doc || moment().format('YYYY-MM-DD')} />
                    </div>
                    <div className="col">
                        <label>Número de Radicación</label>
                        <input type="text" class="form-control mb-3" id="gena2_id_public" disabled
                            defaultValue={currentItem.id_public} />
                    </div>
                    <div></div>
                    <div className="col">
                        <label className="mt-1">{infoCud.serials.end} Carta Acta de Obs.</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="gena_cub_act2"
                                defaultValue={_GET_CHILD_LAW().cub_act2 || ''} />
                            {this.props.edit ? <button type="button" class="btn btn-info shadow-none" onClick={() => _GET_LAST_ID('gena_cub_act2')}>GENERAR</button>
                                : ''}
                        </div>
                    </div>
                    <div className="col" >
                        <label className="mt-1">{infoCud.serials.start}</label>
                        <div class="input-group ">
                            <select class="form-select" id="vr_selected1" defaultValue={""}>
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
                    <div className="col">
                        <label>Fecha limite (fecha not. + 30 d hab.)</label>
                        <input type="date" class="form-control mb-3" max='2100-01-01' id="gena2_date_limit" required
                            defaultValue={_JSON.date_limit || dateParser_finalDate(clock, 30)} />
                    </div>
                    <div className="col">
                        <label>Fecha limite + extension (fecha not. + 30 d + 15 d)</label>
                        <input type="date" class="form-control mb-3" max='2100-01-01' id="gena2_date_limit_2" required
                            defaultValue={_JSON.date_limit_2 || dateParser_finalDate(clock, 45)} />
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col">
                        <label>Ciudad</label>
                        <input type="text" class="form-control mb-3" id="gena2_city"
                            defaultValue={_JSON.city || capitalize(infoCud.city.toLowerCase())} />
                    </div>
                    <div className="col">
                        <label>Responsable</label>
                        <input type="text" class="form-control mb-3" id="gena2_name"
                            defaultValue={_JSON.name || _CHILD_53.item_5311 + " " + _CHILD_53.item_5312} />
                    </div>
                    <div className="col">
                        <label>Dirección</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="gena2_address"
                                defaultValue={_JSON.address || _CHILD_53.item_536} />
                        </div>
                    </div>
                    <div className="col">
                        <label>Email</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="gena2_email"
                                defaultValue={_JSON.email || _CHILD_53.item_535} />
                        </div>
                    </div>
                </div>
            </>
        }

        let gen_confirmDoc = (e) => {

            if (e) e.preventDefault();
            let formData = new FormData();

            let date_doc = document.getElementById("gena2_date_doc").value;
            //let date = document.getElementById("gena_date").value;
            let date_limit = document.getElementById("gena2_date_limit").value;
            let date_limit_2 = document.getElementById("gena2_date_limit_2").value;
            let id_public = document.getElementById("gena2_id_public").value;
            let name = document.getElementById("gena2_name").value;
            let city = document.getElementById("gena2_city").value;
            let email = document.getElementById("gena2_email").value;
            let address = document.getElementById("gena2_address").value;
            let cub = document.getElementById("gena_cub_act2").value;

            formData.set('date_doc', date_doc);
            formData.set('date_limit_2', date_limit_2);
            formData.set('date_limit', date_limit);
            formData.set('id_public', id_public);
            formData.set('name', name);
            formData.set('city', city);
            formData.set('email', email);
            formData.set('address', address);
            formData.set('cub', cub);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            RecordReviewService.gen_doc_incomplete_act_2(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.close();
                        window.open(process.env.REACT_APP_API_URL + "/pdf/confirmact2/" + "Carta_Ampliacion_Terminos_" + currentItem.id_public + ".pdf");
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

        let save_doc = (e) => {
            if (e) e.preventDefault();
            let formData = new FormData();
            let cub_act2_json = getJSONFull(_GET_CHILD_LAW().cub_act2_json);

            let new_id = document.getElementById("gena_cub_act2").value;
            formData.set('new_id', new_id);
            formData.set('prev_id', _GET_CHILD_LAW().cub_act2);
            formData.set('aim_cub', 'cub_act2');

            let date_doc = document.getElementById("gena2_date_doc").value;
            //let date = document.getElementById("gena_date").value;
            let date_limit = document.getElementById("gena2_date_limit").value;
            let date_limit_2 = document.getElementById("gena2_date_limit_2").value;
            let id_public = document.getElementById("gena2_id_public").value;
            let name = document.getElementById("gena2_name").value;
            let city = document.getElementById("gena2_city").value;
            let email = document.getElementById("gena2_email").value;
            let address = document.getElementById("gena2_address").value;

            cub_act2_json.date_doc = date_doc;
            cub_act2_json.date_limit_2 = date_limit_2;
            cub_act2_json.date_limit = date_limit;
            cub_act2_json.id_public = id_public;
            cub_act2_json.name = name;
            cub_act2_json.city = city;
            cub_act2_json.email = email;
            cub_act2_json.address = address;

            formData.set('cub_act2_json', JSON.stringify(cub_act2_json));

            //manage_law(true, formData);
            createVRxCUB_relation(new_id);
        }
        let manage_law = (useMySwal, formData) => {
            var _CHILD = _GET_CHILD_LAW();
            formData.set('fun0Id', currentItem.id);
            if (useMySwal) {
                MySwal.fire({
                    title: swaMsg.title_wait,
                    text: swaMsg.text_wait,
                    icon: 'info',
                    showConfirmButton: false,
                });
            }
            if (_CHILD.id) {
                FUNService.update_law(_CHILD.id, formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            if (useMySwal) {
                                MySwal.fire({
                                    title: swaMsg.publish_success_title,
                                    text: swaMsg.publish_success_text,
                                    footer: swaMsg.text_footer,
                                    icon: 'success',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                                this.props.requestUpdate(currentItem.id)
                            }
                        } else if (response.data === 'ERROR_DUPLICATE') {
                            MySwal.fire({
                                title: "ERROR DE DUPLICACION",
                                text: `El consecutivo ${infoCud.serials.end} de este formulario ya existe, debe de elegir un consecutivo nuevo`,
                                icon: 'error',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        } else {
                            if (useMySwal) {
                                MySwal.fire({
                                    title: swaMsg.generic_eror_title,
                                    text: swaMsg.generic_error_text,
                                    icon: 'warning',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                            }
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        if (useMySwal) {
                            MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                    });
            }
            else {
                FUNService.create_law(formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            if (useMySwal) {
                                MySwal.fire({
                                    title: swaMsg.publish_success_title,
                                    text: swaMsg.publish_success_text,
                                    footer: swaMsg.text_footer,
                                    icon: 'success',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                                this.props.requestUpdate(currentItem.id)
                            }
                        } else if (response.data === 'ERROR_DUPLICATE') {
                            MySwal.fire({
                                title: "ERROR DE DUPLICACION",
                                text: `El consecutivo ${infoCud.serials.end} de este formulario ya existe, debe de elegir un consecutivo nuevo`,
                                icon: 'error',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        } else {
                            if (useMySwal) {
                                MySwal.fire({
                                    title: swaMsg.generic_eror_title,
                                    text: swaMsg.generic_error_text,
                                    icon: 'warning',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                            }
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        if (useMySwal) {
                            MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                    });
            }

        }
        let createVRxCUB_relation = (cub_selected) => {
            let vr = document.getElementById("vr_selected1").value;
            let cub = cub_selected;
            let formatData = new FormData();
            console.log(vr)
            
            formatData.set('vr', vr);
            formatData.set('cub', cub);
            formatData.set('fun', currentItem.id);
            formatData.set('process', 'CARTA AMPLIACION DE TERMINOS');
            
            /*
            let desc = document.getElementById('geng_type').value;
            formatData.set('desc', desc);
            */
            let date = document.getElementById('gena2_date_doc').value;
            formatData.set('date', date);
            
           
            // Mostrar mensaje inicial de espera
            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
        
            // Crear relación
            CubXVrDataService.createCubXVr(formatData)
                .then((response) => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        // Refrescar la UI
                        this.props.requestUpdate(currentItem.id, true);
                    } else if (response.data === 'ERROR_DUPLICATE') {
                        MySwal.fire({
                            title: "ERROR DE DUPLICACIÓN",
                            text: `El consecutivo ya existe, debe de elegir un consecutivo nuevo`,
                            icon: 'error',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    } else {
                        MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    }
                })
                .catch((error) => {
                    console.error(error);
                    MySwal.fire({
                        title: swaMsg.generic_eror_title,
                        text: swaMsg.generic_error_text,
                        icon: 'warning',
                        confirmButtonText: swaMsg.text_btn,
                    });
                });
        };
        return (
            <form id="genc_doc_form" onSubmit={save_doc}>
                {_GENDOC_COMPONENT()}
                <div className="row text-center">
                    {this.props.edit ?
                        <div className="col">
                            <button className="btn btn-success my-3"><i class="fas fa-share-square"></i> GUARDAR DATOS</button>
                        </div>
                        : ''}
                    <div className="col">
                        <MDBBtn className="btn btn-danger my-3" onClick={() => gen_confirmDoc()}><i class="far fa-file-pdf"></i> GENERAR DOCUMENTO</MDBBtn>
                    </div>
                </div>
            </form>

        );
    }
}

export default RECORD_DOC_LETTER_2;