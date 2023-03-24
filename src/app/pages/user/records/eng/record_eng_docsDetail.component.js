import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import RECORD_ENG_SERVICE from '../../../../services/record_eng.service'

const MySwal = withReactContent(Swal);

class RECORD_ENG_DOCS_DESC extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR } = this.props;
        const { } = this.state;

        // DATA GETTERS
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
            }
            return _CHILD_VARS;

        }
        // DATA CONVERTERS

        // COMPONENT JSX
        let COMPONENT_DESC = () => {
            return <>
                <div className='row  border border-dark bg-info text-light fwb-bold py-1 mx-0 mt-3'>
                    <div className='col'>
                        <label>Notas del Ingeniero Revisor</label>
                    </div>
                </div>
                <textarea className="input-group" id="record_eng_docs_desc" maxLength={4000} defaultValue={_GET_REVIEW().detail_3 ?? ""} rows="3"></textarea>
                <label> (Máximo 4000 Caracteres)</label>
            </>
        }

        // FUNCTIONS AND APIS
        var formData = new FormData();

        let save_item = (e) => {
            e.preventDefault();
            formData = new FormData();
            formData.set('recordEngId', currentRecord.id);
            let desc = document.getElementById('record_eng_docs_desc').value;
            formData.set('detail_3', desc);
            manage_item();
        }
        let manage_item = () => {
            var _CHILD = _GET_REVIEW();
            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            if (_CHILD.id) {
                RECORD_ENG_SERVICE.update_review(_CHILD.id, formData)
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
            } else {
                RECORD_ENG_SERVICE.create_review(formData)
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

        }


        return (
            <div className="record_eng_desc container">
                <form id="form_manage_ph_gen" onSubmit={save_item}>
                    {COMPONENT_DESC()}
                    <div className="row mb-3 text-center">
                        <div className="col-12">
                            <button className="btn btn-success my-3" ><i class="far fa-edit"></i> GUARDAR CAMBIOS </button>
                        </div>
                    </div>
                </form>
            </div >
        );
    }
}

export default RECORD_ENG_DOCS_DESC;