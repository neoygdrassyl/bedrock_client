import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import PQRS_Service from '../../../../services/pqrs_main.service';
import HolyDays from '../../../../components/holydays.list.json'
import PQRS_EMAILS from './pqrs_emails.component';
//import PQRS_SET_REPLY from './pqrs_setReply.component';
import { dateParser_finalDate } from '../../../../components/customClasses/typeParse'

const moment = require('moment');
const momentB = require('moment-business-days');
const MySwal = withReactContent(Swal);
class PQRS_EDIT_INFO extends Component {
    constructor(props) {
        super(props);
        this.refreshCurrentItem = this.refreshCurrentItem.bind(this);
        this.refreshList = this.refreshList.bind(this);
        this.state = {
        };
    }
    componentDidMount() {
        if (this.props.currentItem.pqrs_law) {
            if (this.props.currentItem.pqrs_law.extension) this.setState({ email: true });
        }

    }
    refreshCurrentItem(id) {
        this.props.refreshCurrentItem(this.props.currentItem.id);
    }
    refreshList() {
        this.props.refreshList()
    }
    render() {
        const { translation, swaMsg, globals, translation_form, currentItem } = this.props;
        const { } = this.state;

        // WORKING SELECTS
        const selectTypeMaster = translation_form.form_type_request.map(function (item, i) {
            return <option value={i}>{item}</option>
        })
        const selectTypeChannel = translation_form.form_radication_chanel.map(function (item) {
            return <option>{item}</option>
        })
        const selectCategoryMaster = translation_form.form_category_request.map(function (item) {
            return <option>{item}</option>
        })

        //DATA GETTERS
        let _GET_INFO = () => {
            var _CHILD = currentItem;
            var _INFO = currentItem.pqrs_info;
            var _TIME = currentItem.pqrs_time;
            var _TFS = currentItem.pqrs_law ?? '';
            var _CHILD_VARS = [];

            if (_CHILD) _CHILD_VARS = {
                id: _CHILD.id ? _CHILD.id : 0,
                id_global: _CHILD.id_global ? _CHILD.id_global : "",
                id_publico: _CHILD.id_publico ? _CHILD.id_publico : "",
                id_correspondency: _CHILD.id_correspondency ? _CHILD.id_correspondency : "",
                type: _CHILD.type ? _CHILD.type : "",
                keywords: _CHILD.keywords ? _CHILD.keywords : "",
                content: _CHILD.content ? _CHILD.content : "",
                extension: _TFS.extension ? _TFS.extension : "",
                extension_date: _TFS.extension_date ? _TFS.extension_date : "",
                info_id: _INFO ? _INFO.id : 0,
                radication_channel: _INFO ? _INFO.radication_channel : "",


                time_id: _TIME ? _TIME.id : 0,
                time: _TIME ? _TIME.time : "",
                creation: _TIME ? _TIME.creation : "",
                legal: _TIME ? _TIME.legal : "",

            }
            return _CHILD_VARS
        }
        let _GET_LAW = () => {
            if (!currentItem.pqrs_law) return {};
            return currentItem.pqrs_law
        }

        // DATA CONVERTERS
        let _GET_LAST_ID = () => {
            let new_id = "";
            PQRS_Service.getlastid()
                .then(response => {
                    new_id = response.data[0].id_publico;
                    let concecutive = new_id.split('-')[1];
                    concecutive = Number(concecutive) + 1
                    if (concecutive < 1000) concecutive = "0" + concecutive
                    if (concecutive < 100) concecutive = "0" + concecutive
                    if (concecutive < 10) concecutive = "0" + concecutive
                    new_id = new_id.split('-')[0] + "-" + concecutive
                    document.getElementById('pqrs_edit_info_1').value = new_id;
                })
                .catch(e => {
                    console.log(e);
                    MySwal.fire({
                        title: "ERROR AL CARGAR",
                        text: "No ha sido posible cargar el concecutivo, intentelo nuevamnte.",
                        icon: 'error',
                        confirmButtonText: this.props.swaMsg.text_btn,
                    });
                });

        }
        let _SET_LEGAL_TIME = () => {
            console.log(Number('JUR21-0287'.split('-')[1]))
            let _date = document.getElementById('pqrs_edit_info_61').value;
            let _legal_date = _date;
            let _time = document.getElementById('pqrs_edit_info_62').value;

            let _now = moment().format('YYYY-MM-DD');
            _now = _now + " " + _time;
            let _hour = moment(_now).format('HH');
            if (momentB(_date).isBusinessDay()) {
                if (_hour < 17) document.getElementById('pqrs_edit_info_7').value = _legal_date;
                else document.getElementById('pqrs_edit_info_7').value = _GET_NEXT_BUSSINESS_DAY(_date)
            } else document.getElementById('pqrs_edit_info_7').value = _GET_NEXT_BUSSINESS_DAY(_date)
        }
        let _GET_NEXT_BUSSINESS_DAY = (_date) => {
            let date = _date;
            date = momentB(date).nextBusinessDay();
            let _year = moment(date).format('YYYY');
            let _month = moment(date).format('MM') - 1;
            let _day = moment(date).format('D');
            if (HolyDays[_year][_month][_day]) return _GET_NEXT_BUSSINESS_DAY(date)
            return moment(date).format('YYYY-MM-DD');
        }
        let _SET_REPLY_TIME = () => {
            let type = document.getElementById('pqrs_edit_info_2').value;
            let time_element = document.getElementById('pqrs_edit_info_8');
            if (type == 'Petición General') { time_element.value = 15; time_element.disabled = false }
            else if (type == 'Petición de documentos y de información') { time_element.value = 10; time_element.disabled = false }
            else if (type == 'Petición de consulta') { time_element.value = 30; time_element.disabled = false }
            else if (type == 'Peticiones de autoridades y entes de control') { time_element.value = 5; time_element.disabled = false }
            else if (type == 'Entrega de Copias') { time_element.value = 3; time_element.disabled = false }
            //else time_element.disabled = false
        }
        let _SET_EXTENSION = (_checked) => {
            var _CHILD = _GET_INFO()
            if (_checked) {
                document.getElementById('pqrs_edit_info_8').value = _CHILD.time;
                document.getElementById('pqrs_extension_2').disabled = false;
                document.getElementById('pqrs_extension_date1').disabled = false;
                this.setState({ email: true });
            } else {
                document.getElementById('pqrs_edit_info_8').value = _CHILD.time;
                document.getElementById('pqrs_extension_2').disabled = true;
                document.getElementById('pqrs_extension_date1').disabled = true;
                this.setState({ email: false });
            }
        }
        // COMPONENTS JSX
        let _INFO_COMPONENT = () => {
            var _CHILD = _GET_INFO()
            return <>
                <div className="row">

                    <div className="col-lg-6 col-md-6">
                        <label>Número de registro Ventanilla Única</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-hashtag"></i>
                            </span>
                            <input type="text" class="form-control" id="pqrs_edit_info_9"
                                defaultValue={_CHILD.id_global} />
                        </div>
                    </div>
                    <div className="col-lg-6 col-md-6">
                        <label>Número de registro de caso(histórico año 2021)</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-hashtag"></i>
                            </span>
                            <input type="text" class="form-control" id="pqrs_edit_info_1"
                                defaultValue={_CHILD.id_publico} />
                            <button type="button" class="btn btn-info shadow-none" onClick={() => _GET_LAST_ID()}>GENERAR</button>
                        </div>
                    </div>

                </div>

                <div className="row">

                    <div className="col-lg-6 col-md-6">
                        <label>Clasificación de la Petición</label>
                        <div class="input-group mb-3">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-check-square"></i>
                            </span>
                            <input list="browsers" id="pqrs_edit_info_2" class="form-control" onChange={() => _SET_REPLY_TIME()}
                                autoComplete='false' defaultValue={_CHILD.type} />
                            <datalist id="browsers">
                                <option value="Petición General" />
                                <option value="Petición de documentos y de información" />
                                <option value="Petición de consulta" />
                                <option value="Peticiones de autoridades y entes de control" />
                                <option value="Entrega de Copias" />
                            </datalist>
                        </div>
                    </div>
                    <div className="col-lg-6 col-md-6">
                        <label>Fecha de radicacion</label>
                        <div class="input-group mb-3">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-calendar-alt"></i>
                            </span>
                            <input type="date" max="2100-01-01" class="form-control" id="pqrs_edit_info_61"
                                defaultValue={_CHILD.creation.split(" ")[0]} onChange={() => _SET_LEGAL_TIME()} required />
                            <input type="time" class="form-control" id="pqrs_edit_info_62"
                                defaultValue={_CHILD.creation.split(" ")[1]} onChange={() => _SET_LEGAL_TIME()} required />
                        </div>
                    </div>

                </div>

                <div className="row">

                    <div className="col-lg-6 col-md-6">
                        <label>Canal de Radicación original</label>
                        <div class="input-group mb-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-check-square"></i>
                            </span>
                            <select class="form-select" id="pqrs_edit_info_3" defaultValue={_CHILD.radication_channel}>
                                {selectTypeChannel}
                            </select>
                        </div>
                    </div>

                    <div className="col-lg-6 col-md-6">
                        <label className='px-1'>Fecha inicio de términos  </label> <label className='px-4'></label><label className='px-4'>Fecha limite respuesta</label>
                        <div class="input-group mb-3">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-calendar-alt"></i>
                            </span>
                            <input type="date" max="2100-01-01" class="form-control" id="pqrs_edit_info_7" defaultValue={_CHILD.legal} disabled />
                            <input type="date" max="2100-01-01" class="form-control" defaultValue={dateParser_finalDate(_CHILD.legal, _CHILD.time)} disabled />
                        </div>
                    </div>

                </div>

                <div className="row">

                    <div className="col-lg-6 col-md-6">
                        <label>Guia de Correspondencia</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-hashtag"></i>
                            </span>
                            <input type="text" class="form-control" id="pqrs_edit_info_10"
                                defaultValue={_CHILD.id_correspondency} />
                        </div>
                    </div>


                    <div className="col-lg-6 col-md-6">
                        <label>Termino legal de respuesta</label> <label className='px-3'></label> <label className='px-4'>(Con prorroga)</label>
                        <div class="input-group mb-3">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-calendar-alt"></i>
                            </span>
                            <input type="number" step="1" min="1" class="form-control"
                                id="pqrs_edit_info_8" defaultValue={_CHILD.time} />
                            <input type="number" step="1" min="1" class="form-control"
                                id="pqrs_edit_info_8" defaultValue={_CHILD.extension == true ? _CHILD.time * 2 : _CHILD.extension == false ? '' : ''} disabled />
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-6 col-md-6">
                        <label>Palabras Clave (Separadas por coma)</label>
                        <div class="input-group mb-3">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-font"></i>
                            </span>
                            <input type="text" class="form-control" maxLength="200" id="pqrs_edit_info_4"
                                defaultValue={_CHILD.keywords} />
                        </div>
                    </div>
                    <div class="col-6">
                        <label>Fecha solicitud prorroga</label><label className='px-4'></label> <label className='px-4'>Fecha limite prorroga</label>
                        <div class="input-group mb-3">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-calendar-alt"></i>
                            </span>
                            <input type="date" class="form-control" id="" defaultValue={_CHILD.extension ? _CHILD.extension_date : ''} disabled />
                            <input type="date" class="form-control" id="" defaultValue={_CHILD.extension ? dateParser_finalDate(_CHILD.legal, _CHILD.time * 2) : ''} disabled />
                            <label className="fw-bold">{dateParser_finalDate(_CHILD.extension_date)}</label>
                        </div>
                    </div>

                </div>

                <div className="row">
                    <div className="col">
                        <label>Contenido o descripción de la Solicitud (Máximo 2000 Caracteres)</label>
                        <textarea class="form-control mb-3" rows="3" maxlength="2000" id="pqrs_edit_info_5" defaultValue={_CHILD.content}></textarea>
                    </div>
                </div>
            </>
        }
        let _EXTENSION_COMPONENT = () => {
            var _CHILD = _GET_LAW()
            return <>
                <div class="form-check ms-5">
                    <input class="form-check-input" type="checkbox" onChange={(e) => _SET_EXTENSION(e.target.checked)}
                        id="pqrs_extension_1" defaultChecked={_CHILD.extension} />
                    <label class="form-check-label" for="flexCheckDefault">
                        Solicitar Prorroga
                    </label>
                </div>
                <div className='row'>
                    <div className='col-6'>
                        <label>Fecha solicitud prorroga</label>
                        <div class="input-group mb-3">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-calendar-alt"></i>
                            </span>
                            <input type="date" class="form-control" id="pqrs_extension_date1" defaultValue={_CHILD.extension ? _CHILD.extension_date : moment().format('YYYY-MM-DD')} disabled={_CHILD.extension ? false : true} />
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <label>Motivo de la Prorroga (Máximo 2000 caracteres)</label>
                        <textarea class="form-control mb-3" rows="3" maxlength="2000" id="pqrs_extension_2" disabled={_CHILD.extension ? false : true}
                            defaultValue={_CHILD.extension_reason}></textarea>
                    </div>
                </div>
            </>
        }
        // FUNCTIONS & APIS
        var formData = new FormData();

        let manage_item = (e) => {
            e.preventDefault();
            formData = new FormData();
            var _CHILD = _GET_INFO()

            let master_id_publico = document.getElementById("pqrs_edit_info_1").value;
            formData.set('master_id_publico', master_id_publico);
            let master_id_global = document.getElementById("pqrs_edit_info_9").value; // ID GLOBAL
            formData.set('master_id_global', master_id_global);
            let master_id_correspondency = document.getElementById("pqrs_edit_info_10").value; // ID CORRESPONDENCY
            formData.set('master_id_correspondency', master_id_correspondency);
            let master_type = document.getElementById("pqrs_edit_info_2").value;
            formData.set('master_type', master_type);
            let info_radication_chanel = document.getElementById("pqrs_edit_info_3").value; // RADICATION CHANNEL
            formData.set('info_radication_chanel', info_radication_chanel);
            let master_keywords = document.getElementById("pqrs_edit_info_4").value; // KEY WORDS
            formData.set('master_keywords', master_keywords);
            let master_content = document.getElementById("pqrs_edit_info_5").value; // CONTENNT
            formData.set('master_content', master_content);

            let time_creation = document.getElementById("pqrs_edit_info_61").value + " " + document.getElementById("pqrs_edit_info_62").value; // CREATION
            formData.set('time_creation', time_creation);

            let time_legal = document.getElementById("pqrs_edit_info_7").value; // LEGAL DATE
            formData.set('time_legal', time_legal);
            let time_time = document.getElementById("pqrs_edit_info_8").value; //TIME
            formData.set('time_time', time_time);

            //verficacion de los id en caso de que sean undefine o null
            var verification_info_id = _CHILD.info_id == null || _CHILD.info_id == false ? _CHILD.info_id = 0 : _CHILD.info_id;
            var verification_time_id = _CHILD.time_id == null || _CHILD.time_id == false ? _CHILD.time_id = 0 : _CHILD.time_id;

            formData.set('InfoId', verification_info_id);
            formData.set('TimeId', verification_time_id);

            // EXTENSION
            var _CHILD_LAW = _GET_LAW();
            var verification_law_id = _CHILD_LAW.id == null || _CHILD_LAW.id == false ? _CHILD_LAW.id = 0 : _CHILD_LAW.id;
            formData.set('LawId', verification_law_id);

            console.log(verification_info_id, verification_time_id, verification_law_id)


            let extension = document.getElementById("pqrs_extension_1").checked;
            formData.set('extension', extension);
            let extension_reason = document.getElementById("pqrs_extension_2").value;
            formData.set('extension_reason', extension_reason);
            let extension_date = document.getElementById("pqrs_extension_date1").value;
            formData.set('extension_date', extension_date);
            save_item();
        }

        let save_item = () => {
            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            PQRS_Service.update_main(currentItem.id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        this.props.refreshCurrentItem(currentItem.id);
                        this.props.refreshList();
                    } else if (response.data === 'ERROR_DUPLICATE') {
                        MySwal.fire({
                            title: "ERROR DE DUPLICACION",
                            text: "El concecutivo de radicado de este formulario ya existe, debe de elegir un concecutivo nuevo",
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

        return (
            <div>
                <form id="form_pqrs_edit_fun_edit" onSubmit={manage_item}>
                    {_INFO_COMPONENT()}
                    <h4 className=""><b>4.1 PRORROGA</b></h4>
                    {_EXTENSION_COMPONENT()}
                    <div className="text-center">
                        <button className="btn btn-sm btn-success my-3">
                            <i class="far fa-share-square"></i> GUARDAR CAMBIOS
                        </button>
                    </div>
                </form>
                {this.state.email
                    ? <>
                        <h4 className=""><b>4.1.1 CORREO DE PRORROGA</b></h4>
                        <PQRS_EMAILS
                            translation={translation} swaMsg={swaMsg} globals={globals}
                            currentItem={currentItem}
                            email_types={[1]}
                            refreshCurrentItem={this.refreshCurrentItem}
                            closeComponent={() => this.setState({ email: false })}
                            attachs
                        />
                    </>
                    : ""}
                {/*currentItem.id_reply
                    ? <>
                        <h4 className=""><b>4.2 RESPUESTA A PETICIONARIO</b></h4>
                        <PQRS_SET_REPLY
                            translation={translation} swaMsg={swaMsg} globals={globals}
                            currentItem={currentItem}
                            retrieveItem={this.refreshCurrentItem}
                            refreshList={this.refreshList}
                        />
                    </>
                : ""*/}
            </div>
        );
    }
}

export default PQRS_EDIT_INFO;