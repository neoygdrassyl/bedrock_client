import React, { Component } from 'react';
import FUNService from '../../../../services/fun.service'
import { MDBBtn, MDBTooltip } from 'mdb-react-ui-kit';
import Collapsible from 'react-collapsible';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import moment from 'moment';
import FUN6DATALIST from './fun_6_datalist';

import FUN_DOC_CONFIRMLEGAL from './fun_doc_confirmlegal';
import FUND_NAV from './fun_d_nav';
import FUN_MODULE_NAV from './fun_moduleNav';
import FUN_VERSION_NAV from './fun_versionNav';
import FUN_CHECKLIST_N from './fun_checklist_n';
import FUN_ALERT_NEIGHBOUR from './fun_alertNeighbour';
import FUN_REPORT_DATA_EDIT from './fun_report_data_edit';
import FUN_PDF from './fun_pdf';

import FUN_SERVICE from '../../../../services/fun.service';
import FUN_PDF_CHECK from './fun_pdf_check';
import FUN_SEAL from './fun_seals';
import SUBMIT_SINGLE_VIEW from '../../submit/submit_view.component';
import FUN_SIGN_PDF from './fun_sign_pdf.component';
import DOCS_LIST from './docs_list.component';
import FUN_D_CONTROL from './fun_d_control.component';
import FUN_6_VIEW from '../fun_6.view';
import FUN_DOC_CONFIRM_INCOMPLETE from './fun_doc_confirminc';
import { regexChecker_isOA, regexChecker_isOA_2, regexChecker_isOA_3 } from '../../../../components/customClasses/typeParse';
import FUN_CERTIFICATION from './fun_doc_certification.component';

import { PDFDocument } from 'pdf-lib'
import fs from 'fs'
import FUN_D_ABDICATE from './fun_doc_abdicate.component';
import FUN_D_CONTROL_2 from './fun_d_control.component_2';

const MySwal = withReactContent(Swal);
const _GLOBAL_ID = process.env.REACT_APP_GLOBAL_ID;
class FUN_DOCS extends Component {
    constructor(props) {
        super(props);
        this.requestUpdate = this.requestUpdate.bind(this);
        this.state = {
            attachs: 0,
            edit: false,
            item: null,
            show_doc_1: false,
            modal_searchList: false,
            pqrsxfun: false
        };
    }
    requestUpdate(id) {
        this.retrieveItem(id);
    }
    componentDidMount() {
        this.retrieveItem(this.props.currentId);
    }
    retrieveItem(id) {
        FUN_SERVICE.get(id)
            .then(response => {
                this.setState({
                    currentItem: response.data,
                    load: true
                })
                this.retrievePQRSxFUN(response.data.id_public);
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: "ERROR AL CARGAR",
                    text: "No ha sido posible cargar este item, intentelo nuevamente.",
                    icon: 'error',
                    confirmButtonText: this.props.swaMsg.text_btn,
                });
            });
    }
    retrievePQRSxFUN(id_public) {
        FUN_SERVICE.loadPQRSxFUN(id_public)
            .then(response => {
                this.setState({
                    pqrsxfun: response.data,
                })
            })
            .catch(e => {
                console.log(e);
            });
    }
    componentDidUpdate(prevState) {
        // Uso tipico (no olvides de comparar las props):
        if (this.state.item !== prevState.item && this.state.item != null) {
            document.getElementById('fun6_descriptions_edit').value = this.state.item.description;
            document.getElementById('fun6_codes_edit').value = this.state.item.id_public;
            document.getElementById('fun6_pages_edit').value = this.state.item.pages;
            document.getElementById('fun6_dates_edit').value = this.state.item.date;
        }
    }
    addAttach() {
        this.setState({ attachs: this.state.attachs + 1 })
    }
    minusAttach() {
        this.setState({ attachs: this.state.attachs - 1 })
    }

    async readPDF(file, i) {
        if (file.type == "application/pdf") {
            var path = (window.URL || window.webkitURL).createObjectURL(file);
            const url = path
            const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer())
            const pdfDoc = await PDFDocument.load(existingPdfBytes)
            const pages = pdfDoc.getPages().length
            document.getElementById('fun6_page_' + i).value = pages
        }
    };

    render() {
        const { translation, swaMsg, globals, currentVersion } = this.props;
        const { attachs, currentItem } = this.state;
        var formData = new FormData();

        let _GET_CHILD_1 = () => {
            var _CHILD = currentItem.fun_1s;
            var _CURRENT_VERSION = currentVersion - 1;
            var _CHILD_VARS = {
                item_0: "",
                description: "",
            }
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD_VARS.item_0 = _CHILD[_CURRENT_VERSION].id;
                    _CHILD_VARS.tramite = _CHILD[_CURRENT_VERSION].tramite;
                    _CHILD_VARS.description = _CHILD[_CURRENT_VERSION].description ? _CHILD[_CURRENT_VERSION].description : "";
                }
            }
            return _CHILD_VARS;
        }
        let setValues = (refs, values) => {
            document.getElementById('fun6_codes_' + refs).value = values[0];
            document.getElementById('fun6_descriptions_' + refs).value = values[1];
        }

        let _ATTACHS_COMPONENT = () => {
            var array_of_attachts = Array(attachs).fill(0);
            return array_of_attachts.map((a, i) => {
                return <>
                    <div className="row">
                        <div className="col-12">
                            <label className="app-p lead text-start fw-normal text-uppercase">DOCUMENTO ANEXO N° {i + 1}</label>
                            <div class="input-group">
                                <span class="input-group-text bg-info text-white"><i class="fas fa-paperclip"></i></span>
                                <input type="file" class="form-control" name="files_fun6s" accept="image/png, image/jpeg application/pdf"
                                    required onChange={(e) => this.readPDF(e.target.files[0], i)} />
                            </div>
                            <div class="input-group">
                                <span class="input-group-text bg-info text-white"><i class="fas fa-paperclip"></i></span>
                                <input list="fun_6_docs_list" name="fun6_descriptions" id={'fun6_descriptions_' + i} class="form-control" placeholder="Descripcion del documento" />
                                <DOCS_LIST idRef={i} setValues={setValues} text={'VER LISTA'} />
                            </div>
                        </div>
                    </div>
                    <div className="row d-flex justify-content-start">
                        <div className="col">
                            <div class="input-group">
                                <span class="input-group-text bg-info text-white"><i class="fas fa-hashtag"></i></span>
                                <input type="text" class="form-control" id={'fun6_codes_' + i} placeholder="Codigo" name="fun6_codes" />
                            </div>
                        </div>
                        <div className="col">
                            <div class="input-group">
                                <span class="input-group-text bg-info text-white"><i class="far fa-sticky-note"></i></span>
                                <input type="number" class="form-control" placeholder="Folios" step="1" min="0" name="fun6_pages"
                                    id={'fun6_page_' + i} />
                            </div>
                        </div>
                        <div className="col-4">
                            <div class="input-group">
                                <span class="input-group-text bg-info text-white"><i class="far fa-calendar-alt"></i>&nbsp;Fecha Radicación</span>
                                <input type="date" class="form-control" max="2100-01-01" defaultValue={moment().format('YYYY-MM-DD')} name="fun6_dates" />
                            </div>
                        </div>
                    </div>
                </>
            })
        }
        let addDocument = (e) => {
            e.preventDefault();
            formData = new FormData();
            formData.set('fun0Id', currentItem.id);

            let _creationYear = moment(currentItem.createdAt).format('YY');
            let _folder = currentItem.id_public;

            // GET DATA OF ATTACHS
            let files = document.getElementsByName("files_fun6s");
            formData.set('attachs_length', attachs);
            for (var i = 0; i < attachs; i++) {
                let code = document.getElementsByName("fun6_codes")
                if (files[i].files[0]) {
                    formData.append('file', files[i].files[0], "fun6_" + _creationYear + "_" + _folder + "_" + code[i].value + "-"+ files[i].files[0].name)
                }
            }

            let array_form = [];
            let array_html = [];

            array_html = document.getElementsByName("fun6_descriptions");
            for (var i = 0; i < array_html.length; i++) {
                array_form.push(array_html[i].value)
            }
            formData.set('descriptions', array_form.join());
            array_form = [];

            array_html = document.getElementsByName("fun6_codes");
            for (var i = 0; i < array_html.length; i++) {
                array_form.push(array_html[i].value)
            }
            formData.set('codes', array_form.join());
            array_form = [];

            array_html = document.getElementsByName("fun6_pages");
            for (var i = 0; i < array_html.length; i++) {
                array_form.push(array_html[i].value)
            }
            formData.set('pages', array_form.join());
            array_form = [];

            array_html = document.getElementsByName("fun6_dates");
            for (var i = 0; i < array_html.length; i++) {
                array_form.push(array_html[i].value)
            }
            formData.set('dates', array_form.join());
            array_form = [];

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            FUNService.create_fun6(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.generic_success_title,
                            text: swaMsg.generic_success_text,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        this.setState({ attachs: 0 });
                        this.requestUpdate(currentItem.id);
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

        let conOA = () => regexChecker_isOA_3(currentItem ? _GET_CHILD_1() : {})
        let rules = currentItem ? currentItem.rules ? currentItem.rules.split(';') : [] : [];
        return (
            <div>
                <legend className="my-2 px-3 text-uppercase Collapsible">
                    <label className="app-p lead fw-normal text-uppercase" id="fund_1">1 GESTIÓN DOCUMENTAL</label>
                </legend>

                <legend className="my-2 px-3 text-uppercase">
                    <label className="app-p lead fw-normal text-uppercase" id="fund_11">1.1 DOCUMENTOS DIGITALIZADOS</label>
                </legend>
                {currentItem != null ? <>

                    <FUN_6_VIEW
                        translation={translation}
                        swaMsg={swaMsg}
                        globals={globals}
                        currentItem={currentItem}
                        currentId={this.props.currentId}
                        currentVersion={currentVersion}
                        requestUpdate={this.requestUpdate}
                        VREdit
                    />

                    <legend className="my-2 px-3 text-uppercase">
                        <label className="app-p lead fw-normal text-uppercase" id="fund_12">1.2 DOCUMENTOS DE VENTANILLA ÚNICA</label>
                    </legend>

                    <SUBMIT_SINGLE_VIEW
                        translation={translation} swaMsg={swaMsg} globals={globals}
                        id_related={currentItem.id_public}
                    />

                    <fieldset className="p-3">
                        <legend className="my-2 px-3 text-uppercase Collapsible">
                            <label className="app-p lead fw-normal text-uppercase" id="fund_2">2. ANEXAR DOCUMENTOS</label>
                        </legend>
                        <p className="app-p">GUÍA PARA ANEXAR DOCUMENTOS</p>
                        <ul>
                            <li>Para anexar un documento se debe de dar click en el botón de "Añadir", tantas veces como archivos anexos se deseen añadir al sistema.</li>
                            <li>Cada archivo posee su formulario de información que complementará la información de la lista de arriba, para esto, en la caja de "Código" se debe indicar el código del documento usado, representado en paréntesis al inicio del nombre de documento en la lista de arriba.</li>
                            <li>Este código debe de coincidir para que el sistema pueda identificar la información, de no ser asi, esta información será ignorada por el sistema.</li>
                            <li>En la caja de "Descripción del documento" indique el código del documento al que se esta refiriendo, el sistema le mostrará los posibles documentos asociados a ese código y después elija el documento acorde al código deseado.</li>
                        </ul>
                        <div className="row">
                            <div className="col text-end m-3">

                                {attachs > 0
                                    ? <MDBBtn className="btn btn-lg btn-secondary mx-3" onClick={() => this.minusAttach()}><i class="fas fa-minus-circle"></i> REMOVER ULTIMO </MDBBtn>
                                    : ""}
                                <MDBBtn className="btn btn-lg btn-secondary" onClick={() => this.addAttach()}><i class="fas fa-plus-circle"></i> AÑADIR </MDBBtn>
                            </div>
                        </div>

                        <form id="form_fun6" onSubmit={addDocument} enctype="multipart/form-data">
                            {_ATTACHS_COMPONENT()}
                            <FUN6DATALIST />
                            {attachs > 0
                                ? <div className="row text-center">
                                    <div className="col-12">
                                        <button className="btn btn-warning btn-lg my-3"><i class="far fa-file-alt"></i> AÑADIR {attachs} DOCUMENTO(S)</button>
                                    </div>
                                </div> : ""}
                        </form>
                    </fieldset>

                    <fieldset className="p-3">
                        <legend className="my-2 px-3 text-uppercase Collapsible" id="fund_3">
                            <label className="app-p lead fw-normal text-uppercase">3. LISTA GENERAL DE CHEQUEO DE DOCUMENTOS</label>
                        </legend>
                        <FUN_CHECKLIST_N
                            translation={translation}
                            swaMsg={swaMsg}
                            globals={globals}
                            currentItem={currentItem}
                            currentVersion={currentVersion}
                            requestUpdate={this.requestUpdate}
                            readOnly
                        />
                    </fieldset>


                    <h3 class="text-uppercase text-center py-3" id="fund_4">4. GENERAR DOCUMENTOS AUTOMÁTICOS </h3>


                    <div id="fund_pdf">
                        <Collapsible className='bg-light border border-info' openedClassName='bg-light border border-info' trigger={<label className="fw-normal text-info text-uppercase">PDF Formulario Único Nacional</label>}>
                            <div className='text-start'>
                                <FUN_PDF
                                    translation={translation}
                                    swaMsg={swaMsg}
                                    globals={globals}
                                    currentItem={currentItem}
                                    currentVersion={currentVersion}
                                />
                            </div>
                        </Collapsible>

                    </div>

                    <div id="fund_pdf2">
                        <Collapsible className='bg-light border border-info' openedClassName='bg-light border border-info' trigger={<label className="fw-normal text-info text-uppercase">PDF Lista de Chekeo</label>}>
                            <div className='text-start'>
                                <FUN_PDF_CHECK
                                    translation={translation}
                                    swaMsg={swaMsg}
                                    globals={globals}
                                    currentItem={currentItem}
                                    currentVersion={currentVersion}
                                />
                            </div>
                        </Collapsible>
                    </div>
                    <div id="fund_212">
                        <Collapsible className='bg-light border border-info' openedClassName='bg-light border border-info' trigger={<label className="fw-normal text-info text-uppercase">Documento de recordatorio incompleto</label>}>
                            <div className='text-start'>
                                <FUN_DOC_CONFIRM_INCOMPLETE
                                    translation={translation}
                                    swaMsg={swaMsg}
                                    globals={globals}
                                    currentItem={currentItem}
                                    currentVersion={currentVersion}
                                    requestUpdate={this.requestUpdate}
                                />
                            </div>
                        </Collapsible>
                    </div>
                    {currentItem.state >= 5
                        ? <>
                            <div id="fund_21">
                                <Collapsible className='bg-light border border-info' openedClassName='bg-light border border-info' trigger={<label className="fw-normal text-info text-uppercase">Documento de Confirmación Legal y Debida Forma</label>}>
                                    <div className='text-start'>
                                        <FUN_DOC_CONFIRMLEGAL
                                            translation={translation}
                                            swaMsg={swaMsg}
                                            globals={globals}
                                            currentItem={currentItem}
                                            currentVersion={currentVersion}
                                            requestUpdate={this.requestUpdate}
                                            VIEW_G
                                        />
                                    </div>
                                </Collapsible>
                            </div>
                            {rules[0] != 1 || conOA() ?
                                <div id="fund_sign">
                                    <Collapsible className='bg-light border border-info' openedClassName='bg-light border border-info' trigger={<label className="fw-normal text-info text-uppercase">Valla</label>}>
                                        <div className='text-start'>
                                            <FUN_SIGN_PDF
                                                translation={translation}
                                                swaMsg={swaMsg}
                                                globals={globals}
                                                currentItem={currentItem}
                                                currentVersion={currentVersion}
                                            />
                                        </div>
                                    </Collapsible>
                                </div>

                                : ''}

                        </>
                        : ""}

                    {_GLOBAL_ID == "cb1" ?
                        <div id="fund_seal">
                            <Collapsible className='bg-light border border-info' openedClassName='bg-light border border-info' trigger={<label className="fw-normal text-info text-uppercase">Sello</label>}>
                                <div className='text-start'>
                                    <FUN_SEAL
                                        translation={translation}
                                        swaMsg={swaMsg}
                                        globals={globals}
                                        currentItem={currentItem}
                                        currentVersion={currentVersion}
                                    />
                                </div>
                            </Collapsible>
                        </div>
                        : null}


                    {rules[0] != 1 || conOA() ?
                        <div id="fund_22">
                            <Collapsible className='bg-light border border-info' openedClassName='bg-light border border-info' trigger={<label className="fw-normal text-info text-uppercase">DOCUMENTOS DE CITACIÓN A VECINOS</label>}>
                                <div className='text-start'>
                                    <FUN_ALERT_NEIGHBOUR
                                        translation={translation}
                                        swaMsg={swaMsg}
                                        globals={globals}
                                        currentItem={currentItem}
                                        currentVersion={currentVersion}
                                    />
                                </div>
                            </Collapsible>
                        </div>
                        : ''}

                    {currentItem.state >= 5
                        ? <>
                            <div id="fund_doc_control">
                                <Collapsible className='bg-light border border-info' openedClassName='bg-light border border-info' trigger={<label className="fw-normal text-info text-uppercase">HOJA DE CONTROL DOCUMENTAL</label>}>
                                    <div className='text-start'>
                                        <FUN_D_CONTROL
                                            translation={translation}
                                            swaMsg={swaMsg}
                                            globals={globals}
                                            currentItem={currentItem}
                                            currentVersion={currentVersion}
                                            requestUpdate={this.requestUpdate}
                                        />
                                    </div>
                                </Collapsible>
                            </div>

                            <div id="fund_doc_control">
                                <Collapsible className='bg-light border border-info' openedClassName='bg-light border border-info' trigger={<label className="fw-normal text-info text-uppercase">HOJA DE CONTROL DE INVENTARIO</label>}>
                                    <div className='text-start'>
                                        <FUN_D_CONTROL_2
                                            translation={translation}
                                            swaMsg={swaMsg}
                                            globals={globals}
                                            currentItem={currentItem}
                                            currentVersion={currentVersion}
                                            requestUpdate={this.requestUpdate}
                                        />
                                    </div>
                                </Collapsible>
                            </div>
                        </>
                        : ""}

                    <div id="fund_doc_not_abdicate">
                        <Collapsible className='bg-light border border-info' openedClassName='bg-light border border-info' trigger={<label className="fw-normal text-info text-uppercase">Notificación Licencia - Renuncia de terminos</label>}>
                            <div className='text-start'>
                                <FUN_D_ABDICATE
                                    translation={translation}
                                    swaMsg={swaMsg}
                                    globals={globals}
                                    currentItem={currentItem}
                                    currentVersion={currentVersion}
                                    requestUpdate={this.requestUpdate}
                                />
                            </div>
                        </Collapsible>
                    </div>

                    <h3 class="text-uppercase text-center py-3" id="fund_5">5. CONTROL DE DOCUMENTACIÓN ESPECIAL </h3>
                    <div id="fund_23" >
                        <Collapsible className='bg-light border border-info' openedClassName='bg-light border border-info' trigger={<label className="fw-normal text-info text-uppercase">CONTROL DE DOCUMENTO DE RECONOCIMIENTO</label>}>
                            <div className='text-start'>
                                <FUN_REPORT_DATA_EDIT
                                    translation={translation}
                                    swaMsg={swaMsg}
                                    globals={globals}
                                    currentItem={currentItem}
                                    currentVersion={currentVersion}
                                    requestUpdate={this.requestUpdate}
                                />
                            </div>
                        </Collapsible>
                    </div>
                    <div id="fund_23" >
                        <Collapsible className='bg-light border border-info'
                            openedClassName='bg-light border border-info'
                            trigger={<label className="fw-normal text-info text-uppercase">CERTIFICACIONES</label>}>
                            <div className='text-start'>
                                <FUN_CERTIFICATION
                                    translation={translation}
                                    swaMsg={swaMsg}
                                    globals={globals}
                                    currentItem={currentItem}
                                    currentVersion={currentVersion}
                                    id_related={currentItem.id_public}
                                    related={'fun'}
                                />
                            </div>
                        </Collapsible>
                    </div>


                    {/* <FUND_NAV currentItem={currentItem} /> */}
                    <FUN_MODULE_NAV
                        translation={translation}
                        currentItem={currentItem}
                        currentVersion={currentVersion}
                        FROM={"archive"}
                        NAVIGATION={this.props.NAVIGATION}
                        pqrsxfun={this.state.pqrsxfun}
                    />
                    <FUN_VERSION_NAV
                        translation={translation}
                        currentItem={currentItem}
                        currentVersion={currentVersion}
                        NAVIGATION_VERSION={this.props.NAVIGATION_VERSION}
                        ON
                    />
                </> : <fieldset className="p-3" id="fung_0">
                    <div className="text-center"> <h3 className="fw-bold ">CARGANDO INFORMACIÓN...</h3></div>
                </fieldset>}


            </div>
        );
    }
}

export default FUN_DOCS;