import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { formsParser1, _GET_SERIE_COD, _GET_SUBSERIE_COD } from '../../../../components/customClasses/typeParse';
import RECORD_ENG_SERVICE from '../../../../services/record_eng.service'
import Series from '../../../../components/jsons/funCodes.json';

const MySwal = withReactContent(Swal);

class RECORD_ENG_DESC extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, category, arcSteps } = this.props;
        const { } = this.state;

        // DATA GETTERS
        let _GET_CHILD_1 = () => {
            var _CHILD = currentItem.fun_1s;
            var _CURRENT_VERSION = currentVersion - 1;
            if (!_CHILD[_CURRENT_VERSION]) return {}
            var _CHILD_VARS = {
                item_0: _CHILD[_CURRENT_VERSION].id ?? false,
                item_1: _CHILD[_CURRENT_VERSION].tipo ?? "",
                item_2: _CHILD[_CURRENT_VERSION].tramite ?? "",
                item_3: _CHILD[_CURRENT_VERSION].m_urb ?? "",
                item_4: _CHILD[_CURRENT_VERSION].m_sub ?? "",
                item_5: _CHILD[_CURRENT_VERSION].m_lic ?? "",
                item_6: _CHILD[_CURRENT_VERSION].usos ?? "",
                item_7: _CHILD[_CURRENT_VERSION].area ?? "",
                item_8: _CHILD[_CURRENT_VERSION].vivienda ?? "",
                item_9: _CHILD[_CURRENT_VERSION].cultural ?? "",
                item_101: _CHILD[_CURRENT_VERSION].regla_1 ?? "",
                item_102: _CHILD[_CURRENT_VERSION].regla_2 ?? "",
                description: _CHILD[_CURRENT_VERSION].description ?? "",
            }
            return _CHILD_VARS;
        }
        let _GET_CHILD_1_curated = () => {
            var _CHILD = currentItem.fun_1s;
            var _CURRENT_VERSION = currentVersion - 1;
            if (!_CHILD[_CURRENT_VERSION]) return {}
            var _CHILD_VARS = {
                id: _CHILD[_CURRENT_VERSION].id ?? false,
                tipo: _CHILD[_CURRENT_VERSION].tipo ?? "",
                tramite: _CHILD[_CURRENT_VERSION].tramite ?? "",
                m_urb: _CHILD[_CURRENT_VERSION].m_urb ?? "",
                m_sub: _CHILD[_CURRENT_VERSION].m_sub ?? "",
                m_lic: _CHILD[_CURRENT_VERSION].m_lic ?? "",
            }
            return _CHILD_VARS;
        }
        let _GET_REVIEW = () => {
            var _CHILD = currentRecord.record_eng_reviews;
            var _CURRENT_VERSION = currentVersionR - 1;
            var _CHILD_VARS = {
                id: _CHILD[_CURRENT_VERSION] ? _CHILD[_CURRENT_VERSION].id : false,
                check: _CHILD[_CURRENT_VERSION] ? _CHILD[_CURRENT_VERSION].check : "",
                check_2: _CHILD[_CURRENT_VERSION] ? _CHILD[_CURRENT_VERSION].check_2 : "",
                date: _CHILD[_CURRENT_VERSION] ? _CHILD[_CURRENT_VERSION].date : "",
                desc: _CHILD[_CURRENT_VERSION] ? _CHILD[_CURRENT_VERSION].desc : "",
                detail: _CHILD[_CURRENT_VERSION] ? _CHILD[_CURRENT_VERSION].detail : "",
                detail_2: _CHILD[_CURRENT_VERSION] ? _CHILD[_CURRENT_VERSION].detail_2 : "",
                worker_id: _CHILD[_CURRENT_VERSION] ? _CHILD[_CURRENT_VERSION].worker_id : "",
                worker_name: _CHILD[_CURRENT_VERSION] ? _CHILD[_CURRENT_VERSION].worker_name : "",
                version: _CHILD[_CURRENT_VERSION] ? _CHILD[_CURRENT_VERSION].version : "",
                detail_3: _CHILD[_CURRENT_VERSION] ? _CHILD[_CURRENT_VERSION].detail_3 : "",
                detail_4: _CHILD[_CURRENT_VERSION] ? _CHILD[_CURRENT_VERSION].detail_4 : "",
            }
            return _CHILD_VARS;

        }
        // DATA CONVERTERS
        let LOAD_STEP = (_id_public) => {
            var _CHILD = arcSteps;
            for (var i = 0; i < _CHILD.length; i++) {
                if (_CHILD[i].version == currentVersionR && _CHILD[i].id_public == _id_public) return _CHILD[i]
            }
            return []
        }
        let _GET_STEP_TYPE = (_id_public, _type) => {
            var STEP = LOAD_STEP(_id_public);
            if (!STEP.id) return [];
            var value = STEP[_type] ? STEP[_type] : []
            if (!value) return [];
            value = value.split(';');
            return value
        }
        let LOAD_STEP_ENG = (_id_public) => {
            var _CHILD = currentRecord.record_eng_steps;
            for (var i = 0; i < _CHILD.length; i++) {
                if (_CHILD[i].version == currentVersionR && _CHILD[i].id_public == _id_public) return _CHILD[i]
            }
            return []
        }
        let _GET_STEP_TYPE_ENG = (_id_public, _type) => {
            var STEP = LOAD_STEP_ENG(_id_public);
            if (!STEP.id) return null;
            var value = STEP[_type]
            value = value.split(';');
            return value
        }
        // COMPONENT JSX
        let COMPONENT_DESC = () => {
            let values = _GET_STEP_TYPE('s33', 'value');
            let values2 = _GET_STEP_TYPE_ENG('s33_exp', 'value');
            return <>
                <div className='row  border border-dark bg-info text-light fwb-bold py-1 mx-0 mt-3'>
                    <div className='col'>
                        <label>Tipo de Proyecto</label>
                    </div>
                </div>
                <textarea className="input-group" value={formsParser1(_GET_CHILD_1_curated())} disabled readOnly rows="2" style={{ backgroundColor: 'gainsboro' }}></textarea>

                <div className='row  border border-dark bg-info text-light fwb-bold py-1 mx-0 mt-3'>
                    <div className='col'>
                        <label>Descripción del Proyecto </label>
                    </div>
                </div>
                <textarea className="input-group" value={_GET_CHILD_1().description} disabled readOnly rows="4" style={{ backgroundColor: 'gainsboro' }}></textarea>

                <div className='row  border border-dark bg-info text-light fwb-bold py-1 mx-0 mt-3'>
                    <div className='col'>
                        <label>Antecedentes</label>
                    </div>
                </div>
                <textarea className="input-group" value={values[0]} disabled readOnly rows="4" style={{ backgroundColor: 'gainsboro' }}></textarea>


                <div className='row  border border-dark bg-info text-light fwb-bold py-1 mx-0 mt-3'>
                    <div className='col'>
                        <label>Descripción del proyecto estructural </label>
                    </div>
                </div>
                <textarea className="input-group" id="record_eng_desc" maxLength={4000}
                    defaultValue={_GET_REVIEW().desc || values[1]} onBlur={() => save_item()} rows="3"></textarea>
                <label> (Máximo 4000 Caracteres)</label>

                {category == '2' ?
                    <>
                        <div className='row  border border-dark bg-info text-light fwb-bold py-1 mx-0 mt-3'>
                            <div className='col'>
                                <label>Revisión general (Para Certificaciones) </label>
                            </div>
                        </div>
                        <textarea className="input-group" id="record_eng_detail_4" maxLength={4000}
                            defaultValue={_GET_REVIEW().detail_4 ?? ""} onBlur={() => save_item()} rows="5"></textarea>
                        <label> (Máximo 4000 Caracteres)</label>

                        <div className="row">
                            <div className="col-3">
                                <label className="mt-1">N° Folios Certificación</label>
                                <input type="number" class="form-control" id="record_eng_detail_4_2" min="0" step="1"
                                    defaultValue={values2} onBlur={() => manage_step()} />
                            </div>
                        </div>
                    </>
                    : ''}
            </>
        }
        let _COMPONENT_SERIES = () => {
            let _CHILD = _GET_CHILD_1();
            let _SERIE = _GET_SERIE_COD(_CHILD);
            let _SUBSERIE = _GET_SUBSERIE_COD(_CHILD);
            return <>
                <div className="row my-2">
                    <div className="col-3">
                        <label className="fw-bold ms-4">Serie Documental:</label>
                    </div>
                    <div className="col-2">
                        <label className='fw-bold'>{_SERIE}</label>
                    </div>
                    <div className="col">
                        <label className='fw-bold'>{Series[_SERIE] ?? <label className='text-danger'>No se encuentra Serie</label>}</label>
                    </div>
                </div>

                <div className="row my-2">
                    <div className="col-3">
                        <label className="fw-bold ms-4">Subserie Documental:</label>
                    </div>
                    <div className="col-2">
                        <label className='fw-bold'>{_SUBSERIE}</label>
                    </div>
                    <div className="col">
                        <label className='fw-bold'>{Series[_SUBSERIE] ?? <label className='text-danger'>No se encuentra Subserie</label>}</label>
                    </div>
                </div>
            </>
        }

        // FUNCTIONS AND APIS
        var formData = new FormData();

        let save_item = (e) => {
            if (e) e.preventDefault();
            formData = new FormData();
            formData.set('recordEngId', currentRecord.id);
            let desc = document.getElementById('record_eng_desc').value;
            formData.set('desc', desc);

            let detail_4 = document.getElementById('record_eng_detail_4');
            if (detail_4) formData.set('detail_4', detail_4.value);
            manage_item(false);
        }
        let manage_item = (useSwal) => {
            var _CHILD = _GET_REVIEW();
            if (useSwal) MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            if (_CHILD.id) {
                RECORD_ENG_SERVICE.update_review(_CHILD.id, formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            if (useSwal) MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            this.props.requestUpdateRecord(currentItem.id);
                        } else {
                            if (useSwal) MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        if (useSwal) MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    });
            } else {
                RECORD_ENG_SERVICE.create_review(formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            if (useSwal) MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            this.props.requestUpdateRecord(currentItem.id);
                        } else {
                            if (useSwal) MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        if (useSwal) MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    });
            }

        }

        let manage_step = () => {
            var formData = new FormData();
            var value = document.getElementById('record_eng_detail_4_2').value;
            formData.set('value', value);

            formData.set('version', currentVersionR);
            formData.set('recordEngId', currentRecord.id);
            formData.set('id_public', 's33_exp');
            save_step('s33_exp', false, formData);

        }
        let save_step = (_id_public, useSwal, formData) => {
            var STEP = LOAD_STEP(_id_public);

            if (useSwal) MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            if (STEP.id) {
                RECORD_ENG_SERVICE.update_step(STEP.id, formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            if (useSwal) MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            this.props.requestUpdateRecord(currentItem.id);
                        } else {
                            if (useSwal) MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        if (useSwal) MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    });
            }
            else {
                RECORD_ENG_SERVICE.create_step(formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            if (useSwal) MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            this.props.requestUpdateRecord(currentItem.id);
                        } else {
                            if (useSwal) MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        if (useSwal) MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    });
            }
        }
        return (
            <div className="record_eng_desc container">
                {_COMPONENT_SERIES()}
                {COMPONENT_DESC()}
            </div >
        );
    }
}

export default RECORD_ENG_DESC;