import React, { Component } from 'react';
import { formsParser1, getJSONFull, _ADDRESS_SET_FULL, _MANAGE_IDS } from '../../../../components/customClasses/typeParse'
import FUNService from '../../../../services/fun.service'
import SubmitService from '../../../../services/submit.service'
import CubXVrDataService from '../../../../services/cubXvr.service'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import moment from 'moment';
import { infoCud } from '../../../../components/jsons/vars';
import PQRS_Service from '../../../../services/pqrs_main.service';
import { MDBBtn } from 'mdb-react-ui-kit';

const MySwal = withReactContent(Swal);
class FUN_DOC_CONFIRMLEGAL extends Component {
    constructor(props) {
        super(props);
        this.retrieveItem = this.retrieveItem.bind(this);
        this.state = {
            load: false,
            curatedList: [],
            vrsRelated: [],
            vrSelected: null,
            cubSelected: null,
            idCUBxVr: null,
        };
    }
    componentDidMount() {
        this.retrieveItem();
    }
    componentDidUpdate(prevProps) {
        // Uso tipico (no olvides de comparar las props):
        if (this.props.currentVersion !== prevProps.currentVersion && this.props.currentVersion != null) {
            var _CHILD_1 = this._SET_CHILD_1_FOREIGNER();
            document.getElementById('geng_type').value = formsParser1(_CHILD_1)
        }
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
    async retrieveItem() {
        try {
            await SubmitService.getIdRelated(this.props.currentItem.id_public).then(response => {
                this.setState({ vrsRelated: response.data })
            })
            const responseCubXVr = await CubXVrDataService.getByFUN(this.props.currentItem.id_public);
            const data = responseCubXVr.data.find(item => item.process === 'CARTA LEGAL Y DEBIDA FORMA');

            if (data) document.getElementById("vr_selected").value = data.vr
            this.setState({ vrSelected: data.vr, cubSelected: data.cub, idCUBxVr: data.id })
        } catch (error) {
            console.log(error);
        }
    }
    setCuratedList(List) {
        let newList = [];
        if (!List) return;
        List.map((value, i) => {
            let subList = value.sub_lists;
            subList.map(valuej => {
                let name = valuej.list_name ? valuej.list_name.split(";") : []
                let category = valuej.list_category ? valuej.list_category.split(",") : []
                let code = valuej.list_code ? valuej.list_code.split(",") : []
                let page = valuej.list_pages ? valuej.list_pages.split(",") : []
                let review = valuej.list_review ? valuej.list_review.split(",") : []

                review.map((valuek, k) => {
                    if (valuek == 'SI') newList.push({
                        id_public: value.id_public,
                        date: value.date,
                        time: value.time,
                        name: name[k],
                        category: category[k],
                        page: page[k],
                        code: code[k],
                    })
                })
            })
        })
        this.setState({ curatedList: newList, load: true })
    }


    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion, alert, VIEW_G } = this.props;

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
        let _SET_CHILD_1 = () => {
            var _CHILD = currentItem.fun_1s;
            var _CURRENT_VERSION = currentVersion - 1;
            var _CHILD_VARS = {
                tipo: [],
                tramite: [],
                m_urb: [],
                m_sub: [],
                m_lic: [],
            }
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD_VARS.tipo = _CHILD[_CURRENT_VERSION].tipo;
                    _CHILD_VARS.tramite = _CHILD[_CURRENT_VERSION].tramite;
                    _CHILD_VARS.m_urb = _CHILD[_CURRENT_VERSION].m_urb;
                    _CHILD_VARS.m_sub = _CHILD[_CURRENT_VERSION].m_sub;
                    _CHILD_VARS.m_lic = _CHILD[_CURRENT_VERSION].m_lic;
                }
            }
            return _CHILD_VARS;

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
        let _SET_CHILD_C = () => {
            var _CHILD = currentItem.fun_cs;
            var _CURRENT_VERSION = currentVersion - 1;
            var _CHILD_VARS = {
                item_c0: "",
                item_c1: "",
                item_c2: "",
                item_c3: "",
                item_c4: "",
                item_c5: "",
                item_c6: "",
                item_c7: "",
                item_c8: "",
                item_c9: "",
            }
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD_VARS.item_c0 = _CHILD[_CURRENT_VERSION].id;
                    _CHILD_VARS.item_c1 = _CHILD[_CURRENT_VERSION].worker;
                    _CHILD_VARS.item_c2 = _CHILD[_CURRENT_VERSION].date;
                    _CHILD_VARS.item_c3 = _CHILD[_CURRENT_VERSION].condition;
                    _CHILD_VARS.item_c4 = _CHILD[_CURRENT_VERSION].details;
                    _CHILD_VARS.item_c5 = _CHILD[_CURRENT_VERSION].reciever_name;
                    _CHILD_VARS.item_c6 = _CHILD[_CURRENT_VERSION].reciever_date;
                    _CHILD_VARS.item_c7 = _CHILD[_CURRENT_VERSION].reciever_id;
                    _CHILD_VARS.item_c8 = _CHILD[_CURRENT_VERSION].reciever_actor;
                    _CHILD_VARS.item_c9 = _CHILD[_CURRENT_VERSION].legal_date;
                }
            }
            return _CHILD_VARS
        }
        let _GET_CHILD_LAW = () => {
            var _CHILD = currentItem.fun_law;
            var _CHILD_VARS = {
                id: _CHILD ? (_CHILD.id ?? null) : null,
                sign: _CHILD ? (_CHILD.sign ?? '') : '',
                new_type: _CHILD ? (_CHILD.new_type ?? '') : '',
                publish_neighbour: _CHILD ? (_CHILD.publish_neighbour ?? '') : '',
                id6payment: _CHILD ? (_CHILD.id6payment ?? '') : '',
                cub_ldf: _CHILD ? (_CHILD.cub_ldf ?? '') : '',
                cub_ldf_json: _CHILD ? (_CHILD.cub_ldf_json ?? null) : null,
                fun_c_control: _CHILD ? (_CHILD.fun_c_control ?? '') : '',
            }
            return _CHILD_VARS;
        }
        let _SET_CHILD_REVIEW = () => {
            var _CHILD = currentItem.fun_rs;
            var _CURRENT_VERSION = currentVersion - 1;
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD = _CHILD[_CURRENT_VERSION]
                } else {
                    _CHILD = false
                }
            }
            return _CHILD;
        }
        let _GET_CHILD_CLOCK = () => {
            var _CHILD = currentItem.fun_clocks;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
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

        let _GENDOC_COMPONENT = () => {
            var _CHILD_C = _SET_CHILD_C();
            var _CHILD_1 = _SET_CHILD_1();
            var _CHILD_2 = _SET_CHILD_2();
            var _CHILD_53 = _SET_CHILD_53();
            let _JSON = getJSONFull(_GET_CHILD_LAW().cub_ldf_json);
            return <>
                <div className="row mb-3">
                    <div className="col">
                        <label>5.1. Fecha del documento</label>
                        <input type="date" class="form-control mb-3" max='2100-01-01' id="geng_date_doc" required
                            defaultValue={_JSON.date_doc ?? moment().format('YYYY-MM-DD')} />
                    </div>
                    <div className="col">
                        <label>5.2. Fecha LyDF</label>
                        <input type="date" class="form-control mb-3" max='2100-01-01' id="geng_date" required disabled
                            value={_CHILD_C.item_c9} />
                    </div>
                    <div className="col">
                        <label>5.3 Número de Radicación</label>
                        <input type="text" class="form-control mb-3" id="geng_id_public" disabled
                            defaultValue={currentItem.id_public} />
                    </div>
                    <div></div>
                    <div className="col">
                        <label className="mt-1">5.4.1 {infoCud.serials.end} Carta LyDF</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="geng_cub_ldf"
                                defaultValue={_GET_CHILD_LAW().cub_ldf || this.state.cubSelected || ""} />
                            {this.props.edit ? <button type="button" class="btn btn-info shadow-none" onClick={() => _GET_LAST_ID('geng_cub_ldf')}>GENERAR</button>
                                : ''}
                        </div>
                    </div>
                    <div className="col">
                        <label className="mt-1">5.4.2 {infoCud.serials.start}</label>
                        <div class="input-group">
                            <select class="form-select" id="vr_selected" defaultValue={this.state.vrSelected || ""}>
                                <option disabled value=''>Seleccione una opción</option>
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
                    <div className="col-4">
                        <label>5.5 Solicitante</label>
                        <select className='form-select' id="geng_actor_name" defaultValue={_JSON.actor_name ?? _CHILD_C.item_c8}>
                            <option value="A">TITULAR</option>
                            <option value="B">APODERADO</option>
                            <option value="C">MANDATARIO</option>
                        </select>
                    </div>
                    <div className="col-4">
                        <label>5.6 Responsable</label>
                        <input type="text" class="form-control mb-3" id="geng_name"
                            defaultValue={_JSON.name ?? _CHILD_53.item_5311 + " " + _CHILD_53.item_5312} />
                    </div>
                    <div className="col-4">
                        <label>5.7 Documento Responsable</label>
                        <input type="text" class="form-control mb-3" id="geng_id_number"
                            defaultValue={_JSON.id_number ?? _CHILD_53.item_532} />
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-6">
                        <label>5.8 Dirección Responsable</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="geng_address"
                                defaultValue={_JSON.address ?? _CHILD_53.item_536} />
                        </div>
                    </div>
                    <div className="col">
                        <label>5.9 Email Responsable</label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="geng_email"
                                defaultValue={_JSON.email || _CHILD_53.item_535} />
                        </div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col">
                        <label>5.10 Dirección Predio</label>
                        <input type="text" class="form-control mb-3" id="geng_address_2"
                            defaultValue={_JSON.address_2 ?? _CHILD_2.item_211} />
                    </div>
                    <div className="col">
                        <label>5.11 Número Predial/Catastral</label>
                        <input type="text" class="form-control mb-3" id="geng_predial"
                            defaultValue={_JSON.predial ?? _CHILD_2.item_23} />
                    </div>
                    <div className="col">
                        <label>5.12 Ciudad Predio</label>
                        <input type="text" class="form-control mb-3" id="geng_city"
                            defaultValue={_JSON.city ?? capitalize(infoCud.city.toLowerCase())} />
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col">
                        <label>5.13 Tipo de Solicitud</label>
                        <textarea rows="2" class="form-control mb-3" id="geng_type" defaultValue={_JSON.type ?? formsParser1(_CHILD_1)}></textarea>
                    </div>
                </div>
            </>
        }



        let _GET_LAST_VR = () => {
            let fun_r = _SET_CHILD_REVIEW();
            let checks = fun_r.checked ? fun_r.checked.split(',') : [];
            let codes = fun_r.code ? fun_r.code.split(',') : [];

            let docsToCheck = codes.filter((code, i) => checks[i] == '1' || checks[i] == '0')

            let lastDate = _GET_CLOCK_STATE(3).date_start;
            let last_vr = ''

            this.state.curatedList.map(obj => {
                let date = obj.date
                if (docsToCheck.includes(obj.code)) {
                    if (moment(date).isAfter(lastDate)) {
                        lastDate = date
                        last_vr = obj.id_public
                    }
                }
            })
            return { date: lastDate, vr: last_vr }
        }


        let _CONTROL_COMPONENTN = () => {
            let last_vr = _GET_LAST_VR()
            let control_clock = _GET_CLOCK_STATE_VERSION(0, 5)
            let name_1 = control_clock.name ? control_clock.name.split(';')[0] : window.user.name + ' ' + window.user.surname
            let name_2 = control_clock.name ? control_clock.name.split(';')[1] : 'Radicación extemporánea';
            let date = control_clock.date_start || moment().format('YYYY-MM-DD');
            let desc = control_clock.desc || ''

            let fun_c_control = _GET_CHILD_LAW().fun_c_control ? _GET_CHILD_LAW().fun_c_control.split(';') : []
            return <>
                <strong>CONTROL DE CALIDAD: SNR</strong>
                <hr />
                <div className='mx-5'>
                    <div class="form-check">
                        <label>
                            <a href='https://sisg.supernotariado.gov.co/siteminderagent/forms/loginsnr.fcc?TYPE=33554433&REALMOID=06-18e70428-379e-45d6-85a6-4095a9982c2e&GUID=&SMAUTHREASON=0&METHOD=GET&SMAGENTNAME=-SM-PKnunRcJfp7c%2fiHfQBdxBnPiyhxa2OCzryG6HgblD42T09D171jXVqmTby6FXFtO&TARGET=-SM-http%3a%2f%2fsisg%2esupernotariado%2egov%2eco%2f'
                                target='_blank'>Link de la Super Intendencia</a>
                        </label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="" id="control_func_1"
                            defaultChecked={fun_c_control[0] == 1} />
                        <label class="form-check-label" for="control_func_1">
                            Toda la documentación esta completa según lo requiere el tipo de actuación, siendo la constancia del ultimo radicado VR: {last_vr.vr}
                        </label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="" id="control_func_2"
                            defaultChecked={fun_c_control[1] == 1} />
                        <label class="form-check-label" for="control_func_2">
                            Se actualizo en el mismo dia en el modulo de radicación de la SNR
                        </label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="" id="control_func_3"
                            defaultChecked={fun_c_control[2] == 1} />
                        <label class="form-check-label" for="control_func_3">
                            Se radicó en LyDF de manera extemporánea
                        </label>
                    </div>
                    <div className="row m-2">
                        <div className="col">
                            <label>De:</label>
                            <input type="text" class="form-control form-control-sm" id="clock_event_1" disabled defaultValue={name_1} />
                        </div>
                        <div className="col">
                            <label>Para:</label>
                            <input class="form-control form-control-sm" id="clock_event_2" defaultValue={name_2} />
                        </div>
                        <div className="col">
                            <label>Fecha</label>
                            <input type="date" class="form-control form-control-sm" id="clock_event_3" max="2100-01-01" disabled
                                defaultValue={date} />

                        </div>
                        <div className="col-6">
                            <label>Mensaje</label>
                            <input list="option_workers" class="form-select form-select-sm" id="clock_event_4" autoComplete='off'
                                defaultValue={desc}></input>
                            <datalist id="option_workers">
                                <option>Fallo / error del sistema de reporte o comunicación curaduria / SNR</option>
                                <option>Fallo / error proveedor internet / error humano / caso fortuito</option>
                                <option>Debidamente desistido pero revocado</option>
                            </datalist>

                        </div>
                    </div>
                </div>
                <hr />
            </>
        }

        let _NOTY_TYPE_COMPONENENT = () => {
            return <>
                <div className='row mx-5 my-3'>
                    <strong>TIPO DE NOTIFICACIÓN</strong>

                    <div className="col-4">
                        <select className='form-select' id="type_not">
                            <option value="0">NO USAR</option>
                            <option value="1">NOTIFICACIÓN PRESENCIAL</option>
                            <option value="2">NOTIFICACIÓN ELECTRÓNICA - SIN RECURSO</option>
                            <option value="3">NOTIFICACIÓN ELECTRÓNICA - CON RECURSO</option>
                        </select>
                    </div>
                </div>
            </>
        }

        let gen_confirmDoc = (e) => {
            if (e) e.preventDefault();
            let formData = new FormData();
            let cub = document.getElementById("geng_cub_ldf").value;
            formData.set('cub', cub);
            let date_doc = document.getElementById("geng_date_doc").value;
            formData.set('date_doc', date_doc);
            let date = document.getElementById("geng_date").value;
            formData.set('date', date);
            let id_public = document.getElementById("geng_id_public").value;
            formData.set('id_public', id_public);
            let actor_name = document.getElementById("geng_actor_name").value;
            formData.set('actor_name', actor_name);
            let name = document.getElementById("geng_name").value;
            formData.set('name', name);
            let id_number = document.getElementById("geng_id_number").value;
            formData.set('id_number', id_number);
            let address = document.getElementById("geng_address").value;
            formData.set('address', address);
            let address_2 = document.getElementById("geng_address_2").value;
            formData.set('address_2', address_2);
            let email = document.getElementById("geng_email").value;
            formData.set('email', email);
            let city = document.getElementById("geng_city").value;
            formData.set('city', city);
            let predial = document.getElementById("geng_predial").value;
            formData.set('predial', predial);
            let type = document.getElementById("geng_type").value;
            formData.set('type', type);

            formData.set('type_not', document.getElementById("type_not").value);

            var _CHILD = currentItem.fun_cs;
            var _CURRENT_VERSION = currentItem.version - 1;

            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD = _CHILD[_CURRENT_VERSION];
                }
            }
            let condition = null;
            if (_CHILD.condition != null) condition = _CHILD.condition;
            if (condition != null && condition == 1) {
                MySwal.fire({
                    title: swaMsg.title_wait,
                    text: swaMsg.text_wait,
                    icon: 'info',
                    showConfirmButton: false,
                });
                FUNService.gen_doc_confirm(formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            MySwal.close();
                            window.open(process.env.REACT_APP_API_URL + "/pdf/confirm/" + "Confirmacion_" + currentItem.id_public + ".pdf");
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
            else {
                MySwal.fire({
                    title: 'FALTAN DATOS IMPORTANTES',
                    text: 'Para poder generar este documento la solicitud debe de estar en Legal y debida forma.',
                    icon: 'error',
                    confirmButtonText: swaMsg.text_btn,
                });
            }
        }

        let save_doc = (e) => {
            if (e) e.preventDefault();
            let formData = new FormData();
            let cub_ldf_json = getJSONFull(_GET_CHILD_LAW().cub_ldf_json);

            let new_id = document.getElementById("geng_cub_ldf").value;
            formData.set('new_id', new_id || false);
            formData.set('prev_id', _GET_CHILD_LAW().cub_ldf);
            formData.set('aim_cub', 'cub_ldf');

            let date_doc = document.getElementById("geng_date_doc").value;
            let date = document.getElementById("geng_date").value;
            let id_public = document.getElementById("geng_id_public").value;
            let actor_name = document.getElementById("geng_actor_name").value;
            let name = document.getElementById("geng_name").value;
            let id_number = document.getElementById("geng_id_number").value;
            let address = document.getElementById("geng_address").value;
            let address_2 = document.getElementById("geng_address_2").value;
            let city = document.getElementById("geng_city").value;
            let predial = document.getElementById("geng_predial").value;
            let type = document.getElementById("geng_type").value;
            let email = document.getElementById("geng_email").value;

            cub_ldf_json.date_doc = date_doc;
            cub_ldf_json.date = date;
            cub_ldf_json.id_public = id_public;
            cub_ldf_json.actor_name = actor_name;
            cub_ldf_json.name = name;
            cub_ldf_json.id_number = id_number;
            cub_ldf_json.address = address;
            cub_ldf_json.address_2 = address_2;
            cub_ldf_json.email = email;
            cub_ldf_json.city = city;
            cub_ldf_json.predial = predial;
            cub_ldf_json.type = type;

            //let formDataLaw = new FormData();
            formData.set('cub_ldf_json', JSON.stringify(cub_ldf_json));

            let fun_c_control = [];
            fun_c_control.push(document.getElementById("control_func_1").checked ? 1 : 0);
            fun_c_control.push(document.getElementById("control_func_2").checked ? 1 : 0);
            fun_c_control.push(document.getElementById("control_func_3").checked ? 1 : 0);
            formData.set('fun_c_control', fun_c_control.join(';'));

            manage_law(true, formData);
            if (document.getElementById('control_func_3').checked) createEvent(false)
            createVRxCUB_relation(new_id)
            this.retrieveItem();

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
                                this.props.requestUpdate(currentItem.id, true)
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
                                this.props.requestUpdate(currentItem.id, true)
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

        let createEvent = (useMySwal) => {
            var formDataclock = new FormData();

            let date_start = document.getElementById('clock_event_3').value
            formDataclock.set('date_start', date_start);

            let name_1 = document.getElementById('clock_event_1').value
            let name_2 = document.getElementById('clock_event_2').value
            formDataclock.set('name', name_1 + ';' + name_2);

            let desc = document.getElementById('clock_event_4').value
            formDataclock.set('desc', desc);

            formDataclock.set('fun0Id', currentItem.id);
            formDataclock.set('state', 0);
            formDataclock.set('version', 5);

            let control_clock = _GET_CLOCK_STATE_VERSION(0, 5)

            if (control_clock.id) {
                FUNService.update_clock(control_clock.id, formDataclock)
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
                            }
                            this.props.requestUpdate(currentItem.id, true)
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
                FUNService.create_clock(formDataclock)
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
                            }
                            this.props.requestUpdate(currentItem.id, true);
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
            let vr = document.getElementById("vr_selected").value;
            let cub = cub_selected;
            let formatData = new FormData();

            formatData.set('vr', vr);
            formatData.set('cub', cub);
            formatData.set('fun', currentItem.id_public);
            formatData.set('process', 'CARTA LEGAL Y DEBIDA FORMA');

            let desc = document.getElementById('geng_type').value;
            formatData.set('desc', desc);

            let date = document.getElementById('geng_date_doc').value;
            formatData.set('date', date);

            if (this.state.idCUBxVr) {
                CubXVrDataService.updateCubVr(this.state.idCUBxVr, formatData)
                    .then((response) => {
                        if (response.data === 'OK') {
                            // Refrescar la UI
                            this.props.requestUpdate(currentItem.id, true);
                        } 
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            } else {
                // Crear relación
                CubXVrDataService.createCubXVr(formatData)
                    .then((response) => {
                        if (response.data === 'OK') {
                            // Refrescar la UI
                            this.props.requestUpdate(currentItem.id, true);
                        } 
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }
        };

        return (
            <form id="genc_doc_form" onSubmit={save_doc}>
                {_GENDOC_COMPONENT()}
                {_NOTY_TYPE_COMPONENENT()}

                {this.props.edit ? _CONTROL_COMPONENTN() : ''}

                <div className="row text-center">
                    <div className='row'>{alert ? <label className="text-danger">Nota: Antes de generar este documento, verifique que la solicitud se encuentre actualizada y en Legal y Debida forma.</label> : ""}</div>

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

export default FUN_DOC_CONFIRMLEGAL;