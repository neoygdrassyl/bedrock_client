import { MDBTooltip } from 'mdb-react-ui-kit';
import moment from 'moment';
import React, { Component } from 'react';
import DataTable from 'react-data-table-component';
import PQRS_Service from '../../../../services/pqrs_main.service';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import PQRS_WORKERS_EMAILS from './pqrs_workersEmails.component'

const MySwal = withReactContent(Swal);
class PQRS_COMPONENT_WORKER_FEEDBACK extends Component {
    constructor(props) {
        super(props);
        this.retrieveItem = this.retrieveItem.bind(this);
        this.state = {
        };
    }
    componentDidUpdate(prevState) {
        if (this.state.feedback !== prevState.feedback && this.state.feedback != false) {
            var _ITEM = this.state.feedback;
            if (_ITEM.feedback) document.getElementById("pqrs_worker_feeback_1").value = _ITEM.feedback;
            document.getElementById("pqrs_worker_feeback_3").value = _ITEM.feedback_argument
        }
    }
    retrieveItem(id) {
        this.props.retrieveItem(id)
    }
    render() {
        const { translation, swaMsg, globals, currentItem } = this.props;
        const { } = this.state;

        // DATA GETTER
        let _GET_WORKERS = () => {
            return currentItem.pqrs_workers
        }

        // DATA CONVERTER
        let _GET_FEEBACK = (_feebabk) => {
            if (_feebabk == null) return ""
            if (_feebabk == 0) return <label className="text-danger fw-bold">NO ACUERDA</label>
            if (_feebabk == 1) return <label className="text-success fw-bold">VISTO BUENO</label>
        }

        // COMPONENTS JSX
        let FEEDBACK_COMPONENT = () => {
            var _LIST = _GET_WORKERS();
            const columns = [
                {
                    name: <label>PROFESIONAL</label>,
                    selector: 'name',
                    sortable: true,
                    filterable: true,
                    cell: row => <label>{row.name}</label>,
                },
                {
                    name: <label>VISTO</label>,
                    selector: 'competence',
                    sortable: true,
                    filterable: true,
                    cell: row => <label>{_GET_FEEBACK(row.feedback)}</label>,
                },
                {
                    name: <label>ARGUMENTO</label>,
                    selector: 'asign',
                    sortable: true,
                    filterable: true,
                    cell: row => <label>{row.feedback_argument}</label>,
                },
                {
                    name: <label>FECHA</label>,
                    selector: 'asign',
                    sortable: true,
                    filterable: true,
                    cell: row => <label>{row.feedback_date}</label>,
                },
                {
                    name: <label>ACCIÓN</label>,
                    button: true,
                    minWidth: '150px',
                    cell: row => <>
                        {row.worker_id == window.user.id || window.user.roleId == 1
                            ? <MDBTooltip title='Dar visto' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1" className="">
                                <button onClick={() => this.setState({ feedback: row })} className="btn btn-sm btn-secondary m-0 p-2 shadow-none">
                                    <i class="far fa-check-square fa-2x"></i></button></MDBTooltip>
                            : ""}
                        {window.user.roleId == 5 || window.user.roleId == 1
                            ? <MDBTooltip title='Enviar Correo' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1" className="">
                                <button onClick={() => this.setState({ worker: row })} className="btn btn-sm btn-warning m-0 p-2 shadow-none">
                                    <i class="far fa-paper-plane fa-2x"></i></button></MDBTooltip>
                            : ""}
                    </>,
                },
            ]
            var _COMPONENT = <DataTable
                noDataComponent="No hay solicitantes"
                striped="true"
                columns={columns}
                data={_LIST}
                highlightOnHover
                className="data-table-component"
                noHeader
            />
            return _COMPONENT;
        }
        let WOERKER_FEEBACK_COMPONENT = () => {
            return <>
                <div className="row">
                    <h3 className="text-center py-2">DAR VISTO FINAL</h3>
                    <div className="col-6">
                        <label>Visto Final</label>
                        <div class="input-group mb-3">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-check-square"></i>
                            </span>
                            <select class="form-select" id="pqrs_worker_feeback_1" required>
                                <option value="0">NO APRUEBO</option>
                                <option value="1" selected>SI APRUEBO</option>
                            </select>

                        </div>
                    </div>
                    <div className="col-6">
                        <label>Fecha de Visto</label>
                        <div class="input-group mb-3">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-calendar-alt"></i>
                            </span>
                            <input type="date" max="2100-01-01" class="form-control" id="pqrs_worker_feeback_2"
                                disabled required defaultValue={moment().format('YYYY-MM-DD')} />
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <label>Argumentación (Máximo 1000 Caracteres)</label>
                        <textarea class="form-control mb-3" rows="3" maxlength="2000" id="pqrs_worker_feeback_3"></textarea>
                    </div>
                </div>
            </>
        }

        // FUNCTIONS & APIS
        var formData = new FormData();

        let update_worker = (e) => {
            e.preventDefault();
            formData = new FormData();
            let feedback = document.getElementById("pqrs_worker_feeback_1").value;
            formData.set('feedback', feedback);
            let feedback_date = document.getElementById("pqrs_worker_feeback_2").value;
            formData.set('feedback_date', feedback_date);
            let feedback_argument = document.getElementById("pqrs_worker_feeback_3").value;
            if (feedback_argument) formData.set('feedback_argument', feedback_argument);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            PQRS_Service.updateWorker(this.state.feedback.id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        this.props.retrieveItem(currentItem.id);
                        this.props.refreshList();
                        this.setState({ feedback: false });
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
            <div>

                {FEEDBACK_COMPONENT()}
                {this.state.feedback
                    ? <>
                        <form id="form_worker_feeback" onSubmit={update_worker}>
                            {WOERKER_FEEBACK_COMPONENT()}
                            <div className="row d-flex justify-content-center">
                                <div className="col-4 text-center">
                                    <button className="btn btn-lg btn-success"><i class="far fa-check-square"></i> DAR VISTO </button>
                                </div>
                            </div>
                        </form>

                    </>
                    : ""}
                {this.state.worker
                    ? <>
                        <label class="text-center py-2 fw-bold">Enviar Correo a Profesional</label>
                        <PQRS_WORKERS_EMAILS
                            translation={translation} swaMsg={swaMsg} globals={globals}
                            currentItem={currentItem}
                            worker={this.state.worker}
                            email_types={[2]}
                            retrieveItem={this.retrieveItem}
                            closeComponent={() => this.setState({ worker: false })}
                        />
                    </> : ""}
            </div>
        );
    }
}

export default PQRS_COMPONENT_WORKER_FEEDBACK;