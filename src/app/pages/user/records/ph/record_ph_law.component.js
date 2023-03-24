import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import { MDBBadge } from 'mdb-react-ui-kit';
import FUN6JSON from '../../../../components/jsons/fun6DocsList.json'
import FUN_SERVICE from '../../../../services/fun.service';
import RECORD_PH_SERVICE from '../../../../services/record_ph.service'
import VIZUALIZER from '../../../../components/vizualizer.component';
import moment from 'moment';
import RECORD_LAW_PDF from '../law/record_law_pdf';

const MySwal = withReactContent(Swal);

class RECORD_PH_LAW extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { translation, swaMsg, globals, currentItem, _FUN_R, _FUN_6, currentRecord, currentVersionR } = this.props;
        const { } = this.state;

        // DATA GETTER
        let _GET_CHILD_6 = () => {
            var _CHILD = _FUN_6;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        //  DATA CONVERTES
        let _FIND_6 = (_ID) => {
            let _LIST = _GET_CHILD_6();
            let _CHILD = [];
            for (var i = 0; i < _LIST.length; i++) {
                if (_LIST[i].id == _ID) {
                    return _LIST[i];
                }
            }
            return _CHILD;
        }
        let _CHILD_6_SELECT = () => {
            let _LIST = _GET_CHILD_6();
            let _COMPONENT = [];
            for (var i = 0; i < _LIST.length; i++) {
                _COMPONENT.push(<option value={_LIST[i].id}>{_LIST[i].description}</option>)
            }
            return <>{_COMPONENT}</>
        }
        let _GET_VALUE_BADGE = (_value) => {
            if (_value == -1) return <MDBBadge color='dark'>SIN DEFINIR</MDBBadge>
            if (_value == 0) return <MDBBadge color='danger'>NO APORTO</MDBBadge>
            if (_value == 1) return <MDBBadge color='success'>APORTO</MDBBadge>
            if (_value == 2) return <MDBBadge color='warning'>NO APLICA</MDBBadge>
        }
        let _GET_SELECT_COLOR_VALUE = (_VALUE) => {
            if (!_VALUE) {
                return 'form-select text-danger';
            }
            if (_VALUE == 0) {
                return 'form-select text-danger';
            }
            if (_VALUE == 1) {
                return 'form-select text-success';
            }
            if (_VALUE == 2) {
                return 'form-select text-warning';
            } else {
                return 'form-select';
            }
        }
        let _GET_REVIEW = (_code) => {
            let _review = _FUN_R.review;
            _review ? _review = _review.split(',') : _review = [];
            for (var i = 0; i < _review.length; i++) {
                if (_review[i].includes(_code)) return _review[i].split('&')[1];
            }
            return 0;
        }
        let _GET_ID6 = (_code) => {
            let _id6 = _FUN_R.id6;
            _id6 ? _id6 = _id6.split(',') : _id6 = [];
            for (var i = 0; i < _id6.length; i++) {
                if (_id6[i].includes(_code)) return _id6[i].split('&')[1];
            }
            return 0;
        }

        // COMPONENT JSX
        let _COMPONENT_DOC_CHECK = (_checks) => {
            if (!_FUN_R) return <label className="fw-bold">La lista de Checkeo no esta debidamente formulada</label>
            let _DOCS = _FUN_R.code;
            let _VALUE = _FUN_R.checked;
            let _REVIEW = _FUN_R.review;
            let _ID6 = _FUN_R.id6;
            if (!_DOCS || !_VALUE) return <label className="fw-bold">La lista de Checkeo no esta debidamente formulada</label>
            _DOCS = _DOCS.split(',');
            _VALUE = _VALUE.split(',');
            let _COMPONENT = [];
            for (var i = 0; i < _checks.length; i++) {
                let index = _DOCS.indexOf(_checks[i]);
                _COMPONENT.push(<li class="list-group-item">
                    <div className="row mb-2">
                        <lavel> {index > -1
                            ? <>{_GET_VALUE_BADGE(_VALUE[index])} - {FUN6JSON[_DOCS[index]]}</>
                            : <> {_GET_VALUE_BADGE(index)} - {FUN6JSON[_checks[i]]} </>}</lavel>
                    </div>
                    {_VALUE[index] == 1
                        ? <div className="row">
                            <div className="col-4">
                                <input type="hidden" value={_DOCS[index]} readOnly name={'r_l_g2_doc_code'} />
                                <select className={_GET_SELECT_COLOR_VALUE(_GET_REVIEW(_DOCS[index]))} name="r_l_g2_doc_review"
                                    defaultValue={_GET_REVIEW(_DOCS[index])} onChange={() => save_fun_r()}>
                                    <option value="0" className="text-danger">NO CUMPLE</option>
                                    <option value="1" className="text-success">CUMPLE</option>
                                </select>
                            </div>
                            <div className="col-7">
                                <select className='form-select' name="r_l_g2_doc_id6"
                                    defaultValue={_GET_ID6(_DOCS[index])} onChange={() => save_fun_r()}>
                                    <option value="-1">APORTADO FÍSICAMENTE</option>
                                    <option value="0">SIN DOCUMENTO</option>
                                    {_CHILD_6_SELECT()}
                                </select>
                            </div>
                            <div className="col-1">
                                {_GET_ID6(_DOCS[index]) > 0
                                    ?
                                    <VIZUALIZER url={_FIND_6(_GET_ID6(_DOCS[index])).path + "/" + _FIND_6(_GET_ID6(_DOCS[index])).filename}
                                        apipath={'/files/'} />
                                    : ""}
                            </div>
                        </div>
                        : ""}
                </li>)
            }

            return <>{_COMPONENT}</>
        }
        let _COMPONENT_WORKER = () => {
            return <>
                <div className="row">
                    <input type="hidden" id="record_ph_worker_law_0" defaultValue={currentRecord.worker_law_id ? currentRecord.worker_law_id : window.user.id} />
                    <div className="col-6">
                        <label>Profesional</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-user"></i>
                            </span>
                            <input type="text" class="form-control" id="record_ph_worker_law_1"
                                defaultValue={currentRecord.worker_law_name ? currentRecord.worker_law_name : window.user.name + " " + window.user.surname} />
                        </div>
                    </div>
                    <div className="col-3">
                        <label>Fecha de la revisón</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-calendar-alt"></i>
                            </span>
                            <input type="date" class="form-control" id="record_ph_worker_law_2" required
                                defaultValue={currentRecord.date_law_review ? currentRecord.date_law_review : moment().format('YYYY-MM-DD')} />
                        </div>
                    </div>

                    <div className="col-3">
                        <label>Aprobado</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-check-square"></i>
                            </span>
                            <select class="form-control" id="record_ph_worker_law_3" defaultValue={currentRecord.check_law} >
                                <option value="0" className="text-danger">NO</option>
                                <option value="1" className="text-success">SI</option>
                            </select>
                        </div>
                    </div>
                </div>
            </>
        }

        // FUNCTIONS & APIS
        var formData = new FormData();

        let save_fun_r = () => {
            let _reivews = document.getElementsByName('r_l_g2_doc_review');
            let _id6s = document.getElementsByName('r_l_g2_doc_id6');
            let _codes = document.getElementsByName('r_l_g2_doc_code');

            let review = [];
            let id6 = [];
            for (var i = 0; i < _codes.length; i++) {
                review.push(`${_codes[i].value}&${_reivews[i].value}`);
                id6.push(`${_codes[i].value}&${_id6s[i].value}`);
            }
            formData.set('review', review.join());
            formData.set('id6', id6.join());
            manage_fun_r(false);
        }
        let manage_fun_r = (useMySwal) => {
            if (useMySwal) {
                MySwal.fire({
                    title: swaMsg.title_wait,
                    text: swaMsg.text_wait,
                    icon: 'info',
                    showConfirmButton: false,
                });
            }
            if (_FUN_R) {
                FUN_SERVICE.update_r(_FUN_R.id, formData)
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
                            this.props.requestUpdate(currentItem.id);
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
        let manage_item = (e) => {
            e.preventDefault();
            formData = new FormData();

            let worker_law_id = document.getElementById("record_ph_worker_law_0").value;
            formData.set('worker_law_id', worker_law_id);
            let worker_law_name = document.getElementById("record_ph_worker_law_1").value;
            formData.set('worker_law_name', worker_law_name);
            let date_law_review = document.getElementById("record_ph_worker_law_2").value;
            formData.set('date_law_review', date_law_review);
            let check_law = document.getElementById("record_ph_worker_law_3").value;
            formData.set('check_law', check_law);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            RECORD_PH_SERVICE.update(currentRecord.id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        this.props.requestUpdateRecord(currentItem.id);
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
            <div className="record_ph_law container">

                <form id="form_manage_ph_gen" onSubmit={manage_item}>
                    <label className="app-p lead fw-bold my-2">PROFESIONAL QUE REALIZA LA REVISION JURÍDICA</label>
                    {_COMPONENT_WORKER()}
                    <div className="row mb-3 text-center">

                        <div className="col">
                            <button className="btn btn-success my-3" ><i class="far fa-file-alt"></i> GUARDAR CAMBIOS </button>
                        </div>
                    </div>
                </form>
                <div className="row mb-3 text-center">
                <label className="app-p lead fw-bold my-2">GENERAR PDF</label>
                        <div className='col'>
                        <RECORD_LAW_PDF
                            currentItem={currentItem}
                            currentVersion={1}
                            currentRecord={currentRecord}
                            currentVersionR={currentVersionR}
                            swaMsg={swaMsg}
                            noReport />
                        </div>

                    </div>
            </div >
        );
    }
}

export default RECORD_PH_LAW;