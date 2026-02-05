import React, { Component } from 'react';
import { formsParser1 } from '../../../../components/customClasses/typeParse';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import FUN_SERVICE from '../../../../services/fun.service'
import { cities, infoCud } from '../../../../components/jsons/vars';
import { MDBBtn } from 'mdb-react-ui-kit';
import JSONObjectParser from '../../../../components/jsons/jsonReplacer';

const MySwal = withReactContent(Swal);
const moment = require('moment');
class FUN_REPORT_DATA_PDF extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion } = this.props;
        const { } = this.state;


        // DATA GETERS
        let _GET_CHILD_1 = () => {
            var _CHILD = currentItem.fun_1s;
            var _CURRENT_VERSION = currentVersion - 1;
            var _CHILD_VARS = {
                item_0: "",
                tipo: "",
                tramite: "",
                m_sub: "",
                m_urb: "",
                m_lic: "",
            }
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD_VARS.item_0 = _CHILD[_CURRENT_VERSION].id;
                    _CHILD_VARS.tipo = _CHILD[_CURRENT_VERSION].tipo ? _CHILD[_CURRENT_VERSION].tipo : "";
                    _CHILD_VARS.tramite = _CHILD[_CURRENT_VERSION].tramite ? _CHILD[_CURRENT_VERSION].tramite : "";
                    _CHILD_VARS.m_urb = _CHILD[_CURRENT_VERSION].m_urb ? _CHILD[_CURRENT_VERSION].m_urb : "";
                    _CHILD_VARS.m_sub = _CHILD[_CURRENT_VERSION].m_sub ? _CHILD[_CURRENT_VERSION].m_sub : "";
                    _CHILD_VARS.m_lic = _CHILD[_CURRENT_VERSION].m_lic ? _CHILD[_CURRENT_VERSION].m_lic : "";
                }
            }
            return _CHILD_VARS;
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
        let _GET_CHILD_51 = () => {
            var _CHILD = currentItem.fun_51s;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _GET_CHILD_53 = () => {
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
                docs: "",
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
                    _CHILD_VARS.docs = _CHILD[_CURRENT_VERSION].docs;
                }
            }
            return _CHILD_VARS;
        }
        let _GET_CHILD_LAW = () => {
            var _CHILD = currentItem.fun_law;
            var _CHILD_VARS = {
                id: "",
                report_data: [],
                report_cub: "",
                report_data_pdf: {},
            }
            if (_CHILD != null) {
                _CHILD_VARS.id = _CHILD.id;
                _CHILD_VARS.report_data = _CHILD.report_data ? _CHILD.report_data : [];
                _CHILD_VARS.report_cub = _CHILD.report_cub ? _CHILD.report_cub : "";
                _CHILD_VARS.report_data_pdf = _CHILD.report_data_pdf ? _CHILD.report_data_pdf : false;
            }
            return _CHILD_VARS;
        }
        // DATA CONVERTERS
        let _GET_OWNERS = () => {
            let _CHILDREN = _GET_CHILD_51();
            let _OWNERS = [];
            for (var i = 0; i < _CHILDREN.length; i++) {
                if (_CHILDREN[i].active) _OWNERS.push(_CHILDREN[i].name + " " + _CHILDREN[i].surname)
            }
            return _OWNERS.join(", ")
        }
        let _GET_JSON = () => {
            let json = _GET_CHILD_LAW().report_data_pdf;
            if (!json) return {}
            let object = JSON.parse(JSON.parse(json))
            return object
        }

        // COMPONENTS JSX
        let _PAGE_1_COMPONENT = () => {
            return <>
                <div className="row">
                    <div className="col-3">
                        <label>Fecha del documento</label>
                        <input type="date" max="2100-01-01" class="form-control" id="fun_report_pdf_1" defaultValue={moment().format('YYYY-MM-DD')} />
                    </div>
                    <div className="col-3">
                        <label>N° CUB</label>
                        <input type="text" class="form-control" id="fun_report_pdf_2"
                            defaultValue={_GET_CHILD_LAW().report_cub} disabled />
                    </div>
                    <div className="col-3">
                        <label>N° de Radicado</label>
                        <input type="text" class="form-control" id="fun_report_pdf_3"
                            defaultValue={currentItem.id_public} disabled />
                    </div>
                    <div className="col-3">
                        <label>Ciudad</label>
                        <select class="form-select me-1" id={"fun_report_pdf_4"}>
                            {cities}
                        </select>
                    </div>
                </div>
            </>
        }
        let _PAGE_2_A_COMPONENT = () => {
            let _CHILD_2 = _GET_CHILD_2();
            let _CHILD_53 = _GET_CHILD_53();
            return <>
                <div className="row">
                    <div className="col-12">
                        <label>Propietario(s) / Solicitante(s)</label>
                        <input type="text" class="form-control" id="fun_report_pdf_a1"
                            defaultValue={_GET_OWNERS()} />
                    </div>
                </div>

                <div className="row">
                    <div className="col-4">
                        <label>Dirección</label>
                        <input type="text" class="form-control" id="fun_report_pdf_a2"
                            defaultValue={_CHILD_2.item_211} />
                    </div>
                    <div className="col-4">
                        <label>Barrio</label>
                        <input type="text" class="form-control" id="fun_report_pdf_a3"
                            defaultValue={_CHILD_2.item_261} />
                    </div>
                    <div className="col-4">
                        <label>Número Predial / Catastral</label>
                        <input type="text" class="form-control" id="fun_report_pdf_a4"
                            defaultValue={_CHILD_2.item_23} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-6">
                        <label>Responsable</label>
                        <input type="text" class="form-control" id="fun_report_pdf_a5"
                            defaultValue={_CHILD_53.item_5311 + " " + _CHILD_53.item_5312} />
                    </div>
                    <div className="col-6">
                        <label>Contacto</label>
                        <input type="text" class="form-control" id="fun_report_pdf_a6"
                            defaultValue={_CHILD_53.item_534} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <label>Actuación</label>
                        <input type="text" class="form-control" id="fun_report_pdf_a7"
                            defaultValue={formsParser1(_GET_CHILD_1())} />
                    </div>
                </div>
            </>
        }
        let _PAGE_2_B_COMPONENT = () => {
            let json = _GET_JSON();
            return <>
                <div className="row">
                    <div className="col-2">
                        <label>Plano Arquitectónico</label>
                    </div>
                    <div className="col-5">
                        <label>Contenido Planos</label>
                        <textarea class="form-control" id="fun_report_pdf_b1" defaultValue={json.b1} />
                    </div>
                    <div className="col-5">
                        <label>Cantidad</label>
                        <input type="text" class="form-control" id="fun_report_pdf_b2" defaultValue={json.b2} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-2">
                        <label>Plano Estructural</label>
                    </div>
                    <div className="col-5">
                        <label>Contenido Planos</label>
                        <textarea class="form-control" id="fun_report_pdf_b3" defaultValue={json.b3} />
                    </div>
                    <div className="col-5">
                        <label>Cantidad</label>
                        <input type="text" class="form-control" id="fun_report_pdf_b4" defaultValue={json.b4} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-2">
                        <label>Peritaje Estructural</label>
                    </div>
                    <div className="col-5">
                    </div>
                    <div className="col-5">
                        <label>Número de Folios</label>
                        <input type="text" class="form-control" id="fun_report_pdf_b5" defaultValue={json.b5} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-2">
                        <label>Memorias Estructurales</label>
                    </div>
                    <div className="col-5">
                    </div>
                    <div className="col-5">
                        <label>Número de Folios</label>
                        <input type="text" class="form-control" id="fun_report_pdf_b6" defaultValue={json.b6} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-2">
                        <label>Videos Imagenes</label>
                    </div>
                    <div className="col-5">
                    </div>
                    <div className="col-5">
                        <label>Cantidad</label>
                        <input type="text" class="form-control" id="fun_report_pdf_b7" defaultValue={json.b7} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-2">
                        <label>Otros</label>
                    </div>
                    <div className="col-5">
                    </div>
                    <div className="col-5">
                        <label>Cantidad</label>
                        <textarea class="form-control" id="fun_report_pdf_b8" defaultValue={json.b8} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-2">
                        <label>Licencia Anterior</label>
                    </div>
                    <div className="col-5">
                    </div>
                    <div className="col-5">
                        <label>Número de Folios</label>
                        <input type="text" class="form-control" id="fun_report_pdf_b9" defaultValue={json.b9} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-2">
                        <label>PLanos Licencia Anterior</label>
                    </div>
                    <div className="col-5">
                    </div>
                    <div className="col-5">
                        <label>Cantidad</label>
                        <input type="text" class="form-control" id="fun_report_pdf_b10" defaultValue={json.b10} />
                    </div>
                </div>
            </>
        }
        let _PAGE_2_C_COMPONENT = () => {
            let json = _GET_JSON();
            return <>
                <div className="row">
                    <div className="col-12">
                        <label>Maximo 2000 Caracteres</label>
                        <textarea type="text" class="form-control" id="fun_report_pdf_c" maxLength={2048} rows="3" defaultValue={json.notations} />
                    </div>
                </div>
            </>
        }

        let _PAGE_CUP1_COMPONENT = () => {
            let _CHILD_2 = _GET_CHILD_2();
            let _CHILD_53 = _GET_CHILD_53();
            let json = _GET_JSON();
            return <>
                <div className="row">
                    <div className="col-3">
                        <label>Fecha del documento</label>
                        <input type="date" max="2100-01-01" class="form-control" id="fun_report_pdf_1" defaultValue={moment().format('YYYY-MM-DD')} />
                    </div>
                    <div className="col-3">
                        <label>N° {infoCud.serials.end}</label>
                        <input type="text" class="form-control" id="fun_report_pdf_2"
                            defaultValue={_GET_CHILD_LAW().report_cub} disabled />
                    </div>
                    <div className="col-3">
                        <label>N° de Radicado</label>
                        <input type="text" class="form-control" id="fun_report_pdf_3"
                            defaultValue={currentItem.id_public} disabled />
                    </div>
                    <div className="col-3">
                        <label>Ciudad</label>
                        <select class="form-select me-1" id={"fun_report_pdf_4"}>
                            {cities}
                        </select>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <label>Propietario(s) / Solicitante(s)</label>
                        <input type="text" class="form-control" id="fun_report_pdf_a1"
                            defaultValue={_GET_OWNERS()} />
                    </div>
                </div>

                <div className="row">
                    <div className="col-4">
                        <label>Dirección</label>
                        <input type="text" class="form-control" id="fun_report_pdf_a2"
                            defaultValue={_CHILD_2.item_211} />
                    </div>
                    <div className="col-4">
                        <label>Barrio</label>
                        <input type="text" class="form-control" id="fun_report_pdf_a3"
                            defaultValue={_CHILD_2.item_261} />
                    </div>
                    <div className="col-4">
                        <label>Número Predial / Catastral</label>
                        <input type="text" class="form-control" id="fun_report_pdf_a4"
                            defaultValue={_CHILD_2.item_23} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-6">
                        <label>Responsable</label>
                        <input type="text" class="form-control" id="fun_report_pdf_a5"
                            defaultValue={_CHILD_53.item_5311 + " " + _CHILD_53.item_5312} />
                    </div>
                    <div className="col-6">
                        <label>Contacto</label>
                        <input type="text" class="form-control" id="fun_report_pdf_a6"
                            defaultValue={_CHILD_53.item_534} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <label>Actuación</label>
                        <input type="text" class="form-control" id="fun_report_pdf_a7"
                            defaultValue={formsParser1(_GET_CHILD_1())} />
                    </div>
                </div>
                <div className="row">
                    <label>Entidad Interesada</label>
                </div>
                <div className="row">
                    <div className="col-2 me-0">
                        <input type="text" class="form-control " id="fun_report_pdf_b1" defaultValue={json.b1 ?? 'Doctor'} />
                    </div>
                    <div className="col me-0">
                        <input type="text" class="form-control" id="fun_report_pdf_b2" defaultValue={json.b2 ?? 'Gustavo Adolfo González Acevedo'} />
                    </div>
                    <div className="col me-0">
                        <input type="text" class="form-control" id="fun_report_pdf_b3" defaultValue={json.b3 ?? 'Inspector de Policía Urbana No. III'} />
                    </div>
                    <div className="col me-0">
                        <input type="text" class="form-control" id="fun_report_pdf_b4" defaultValue={json.b4 ?? 'Piedecuesta'} />
                    </div>
                    <div className="col me-0">
                        <input type="text" class="form-control" id="fun_report_pdf_b5" defaultValue={json.b5 ?? 'E.S.M'} />
                    </div>
                </div>
            </>
        }
        // FUNCTIONS AND APIS
        var formData = new FormData();

        let pdf_gen = (e) => {
            if (e) e.preventDefault();
            if (!_GET_CHILD_LAW().report_cub) {
                MySwal.fire({
                    title: "NO SE ENCUENTRA NÚMERO DE SALIDA",
                    text: `Para poder generar este documento, se debe de asociar un número ${infoCud.serials.end} al reporte de la entidad interesada.`,
                    icon: 'error',
                    confirmButtonText: swaMsg.text_btn,
                });
                return 1
            }

            formData = new FormData();

            let date = document.getElementById('fun_report_pdf_1').value;
            formData.set('date', date);
            let id_cub = document.getElementById('fun_report_pdf_2').value;
            formData.set('id_cub', id_cub);
            let id_public = document.getElementById('fun_report_pdf_3').value;
            formData.set('id_public', id_public);
            let city = document.getElementById('fun_report_pdf_4').value;
            formData.set('city', city);

            let owner = document.getElementById('fun_report_pdf_a1').value;
            formData.set('owner', owner);
            let address = document.getElementById('fun_report_pdf_a2').value;
            formData.set('address', address);
            let neighbour = document.getElementById('fun_report_pdf_a3').value;
            formData.set('neighbour', neighbour);
            let catastral = document.getElementById('fun_report_pdf_a4').value;
            formData.set('catastral', catastral);
            let responsable = document.getElementById('fun_report_pdf_a5').value;
            formData.set('responsable', responsable);
            let number = document.getElementById('fun_report_pdf_a6').value;
            formData.set('number', number);
            let type = document.getElementById('fun_report_pdf_a7').value;
            formData.set('type', type);

            let b1;
            let b2;
            let b3;
            let b4;
            let b5;
            let b6;
            let b7;
            let b8;
            let b9;
            let b10;
            let notations

            b1 = document.getElementById('fun_report_pdf_b1').value;
            formData.set('b1', b1);
            b2 = document.getElementById('fun_report_pdf_b2').value;
            formData.set('b2', b2);
            b3 = document.getElementById('fun_report_pdf_b3').value;
            formData.set('b3', b3);
            b4 = document.getElementById('fun_report_pdf_b4').value;
            formData.set('b4', b4);
            b5 = document.getElementById('fun_report_pdf_b5').value;
            formData.set('b5', b5);
            if (document.getElementById('fun_report_pdf_b6')) b6 = document.getElementById('fun_report_pdf_b6').value;
            if (document.getElementById('fun_report_pdf_b6')) formData.set('b6', b6);
            if (document.getElementById('fun_report_pdf_b7')) b7 = document.getElementById('fun_report_pdf_b7').value;
            if (document.getElementById('fun_report_pdf_b7')) formData.set('b7', b7);
            if (document.getElementById('fun_report_pdf_b8')) b8 = document.getElementById('fun_report_pdf_b8').value;
            if (document.getElementById('fun_report_pdf_b8')) formData.set('b8', b8);
            if (document.getElementById('fun_report_pdf_b9')) b9 = document.getElementById('fun_report_pdf_b9').value;
            if (document.getElementById('fun_report_pdf_b9')) formData.set('b9', b9);
            if (document.getElementById('fun_report_pdf_b10')) b10 = document.getElementById('fun_report_pdf_b10').value;
            if (document.getElementById('fun_report_pdf_b10')) formData.set('b10', b10);

            if (document.getElementById('fun_report_pdf_c')) notations = document.getElementById('fun_report_pdf_c').value;
            if (document.getElementById('fun_report_pdf_c')) formData.set('notations', notations);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            FUN_SERVICE.gen_doc_planing(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.close();
                        window.open(process.env.REACT_APP_API_URL + "/pdf/planing/" + "Informe Planeacion " + _GET_CHILD_LAW().report_cub + ".pdf");
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

        let save_reportData = (e) => {
            e.preventDefault();
            formData = new FormData();

            let reportDataPdf = {};
            /*
            reportDataPdf.date = document.getElementById('fun_report_pdf_1').value;
            reportDataPdf.id_cub = document.getElementById('fun_report_pdf_2').value;
            reportDataPdf.id_public = document.getElementById('fun_report_pdf_3').value;
            reportDataPdf.city = document.getElementById('fun_report_pdf_4').value;

            reportDataPdf.owner = document.getElementById('fun_report_pdf_a1').value;
            reportDataPdf.address = document.getElementById('fun_report_pdf_a2').value;
            reportDataPdf.neighbour = document.getElementById('fun_report_pdf_a3').value;
            reportDataPdf.catastral = document.getElementById('fun_report_pdf_a4').value;
            reportDataPdf.responsable = document.getElementById('fun_report_pdf_a5').value;
            reportDataPdf.number = document.getElementById('fun_report_pdf_a6').value;
            reportDataPdf.type = document.getElementById('fun_report_pdf_a7').value;
            */
            reportDataPdf.b1 = document.getElementById('fun_report_pdf_b1').value;
            reportDataPdf.b2 = document.getElementById('fun_report_pdf_b2').value;
            reportDataPdf.b3 = document.getElementById('fun_report_pdf_b3').value;
            reportDataPdf.b4 = document.getElementById('fun_report_pdf_b4').value;
            reportDataPdf.b5 = document.getElementById('fun_report_pdf_b5').value;
            if (document.getElementById('fun_report_pdf_b6'))reportDataPdf.b6 = document.getElementById('fun_report_pdf_b6').value;
            if (document.getElementById('fun_report_pdf_b7'))reportDataPdf.b7 = document.getElementById('fun_report_pdf_b7').value;
            if (document.getElementById('fun_report_pdf_b8'))reportDataPdf.b8 = document.getElementById('fun_report_pdf_b8').value;
            if (document.getElementById('fun_report_pdf_b9'))reportDataPdf.b9 = document.getElementById('fun_report_pdf_b9').value;
            if (document.getElementById('fun_report_pdf_b10'))reportDataPdf.b10 = document.getElementById('fun_report_pdf_b10').value;

            if (document.getElementById('fun_report_pdf_c'))reportDataPdf.notations = document.getElementById('fun_report_pdf_c').value;

            formData.set('report_data_pdf', JSONObjectParser(reportDataPdf));

            manage_law();
        }

        let manage_law = () => {
            let _CHILD = _GET_CHILD_LAW();
            formData.set('fun0Id', currentItem.id);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            if (_CHILD.id) {

                FUN_SERVICE.update_law(_CHILD.id, formData)
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
                        } else if (response.data === 'ERROR_DUPLICATE') {
                            MySwal.fire({
                                title: "ERROR DE DUPLICACION",
                                text: "El consecutivo de radicado de este formulario ya existe, debe de elegir un consecutivo nuevo",
                                icon: 'error',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                        else {
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
                FUN_SERVICE.create_law(formData)
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
                        } else if (response.data === 'ERROR_DUPLICATE') {
                            MySwal.fire({
                                title: "ERROR DE DUPLICACION",
                                text: "El consecutivo de radicado de este formulario ya existe, debe de elegir un consecutivo nuevo",
                                icon: 'error',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                        else {
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
        }
        return (
            <div className="fun_report_pdf container py-3 border border-danger p-2">
                <form id="form_report_data_edit" onSubmit={save_reportData}>

                    {process.env.REACT_APP_GLOBAL_ID == 'cb1' ?
                        <>
                            {_PAGE_1_COMPONENT()}
                            <label className="fw-bold py-3">INVENTARIO</label>
                            {_PAGE_2_A_COMPONENT()}
                            <label className="fw-bold py-3">INVENTARIO GENERAL</label>
                            {_PAGE_2_B_COMPONENT()}
                            <label className="fw-bold py-3">OBSERVACIONES</label>
                            {_PAGE_2_C_COMPONENT()}
                        </>
                        : ''}

                    {process.env.REACT_APP_GLOBAL_ID == 'cp1' ?
                        <>
                            {_PAGE_CUP1_COMPONENT()}
                        </>
                        : ''}


                    <div className="row text-center">
                        <div className="col">
                            <button className="btn btn-success my-3">
                                <i class="far fa-share-square"></i> GUARDAR CAMBIOS
                            </button>
                        </div>
                        <div className="col">
                            <MDBBtn className="btn btn-danger my-3" onClick={() => pdf_gen()}>
                                <i class="far fa-file-pdf"></i> GENERAR PDF
                            </MDBBtn>
                        </div>
                    </div>
                </form>
            </div >
        );
    }
}

export default FUN_REPORT_DATA_PDF;