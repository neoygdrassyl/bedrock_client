import moment from 'moment';
import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

// SERVICES
import SubmitService from '../../../services/submit.service';
import FunService from '../../../services/fun.service';
import { formsParser1 } from '../../../components/customClasses/typeParse';
import NEW_SOLICITOR from '../solicitors_/solicitor_create';
import Solicitors_service from '../../../services/solicitors.service.js';
import DataTable from 'react-data-table-component';

const MySwal = withReactContent(Swal);

class SUBMIT_CREATE extends Component {
    constructor(props) {
        super(props);
        this.refreshList = this.refreshList.bind(this);
        this.state = {
            list: [],
            currentItem: false,
            isLoaded: false
        };

    }
    componentDidMount() {
        this.refreshItem()
    }

    refreshItem() {
        if (this.props.currentId) {
            SubmitService.get(this.props.currentId).then(response => {
                let item = response.data
                this.setState({
                    currentItem: item, //esto lo puedo aplicar para tener el userrrr
                })
            })
        }
    }
    refreshList(id) {
        this.props.refreshList(id);
    }
    //TEMPORAL ----------------------------------------------------------

    retrievePublish(id) {
        Solicitors_service.getVRs(id)
            .then(response => {
                this.asignList(response.data);
            })
            .catch(e => {
                console.log(e);
            });
    }
    asignList(_LIST) {
        this.setState({
            list: _LIST,
            isLoaded: true,
        });
    }
    //--------------------------------

    render() {
        const { translation, swaMsg, globals } = this.props;
        const { currentItem, list, isLoaded } = this.state;
        const userID = document.getElementById('solicitor_id') ? (document.getElementById('solicitor_id').value) : ''
        const columns = [
            {
                name: <label className="text-center">Nr. RADICACIÓN</label>,
                selector: 'id_public',
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{row.id_public}</label>
            },
            {
                name: <label className="text-center">TIPO</label>,
                selector: 'type',
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{row.type}</label>
            }
        ]
        // DATA GETTERS
        let GET_SUBMIT = () => {
            var _CHILD = currentItem;
            var _CHILD_VARS = {
                id: _CHILD ? _CHILD.id : null,
                id_public: _CHILD ? _CHILD.id_public : null,
                id_related: _CHILD ? _CHILD.id_related : null,
                type: _CHILD ? _CHILD.type : null,
                list_type: _CHILD ? _CHILD.list_type : null,
                list_type_str: _CHILD ? _CHILD.list_type_str : null,
                date: _CHILD ? _CHILD.date : moment().format('YYYY-MM-DD'),
                time: _CHILD ? _CHILD.time : moment().format('HH:mm'),
                owner: _CHILD ? _CHILD.owner : null,
                worker_reciever: _CHILD ? _CHILD.worker_reciever : window.user.name + " " + window.user.surname,
                name_retriever: _CHILD ? _CHILD.name_retriever : null,
                id_number_retriever: _CHILD ? _CHILD.id_number_retriever : null,
                details: _CHILD ? _CHILD.details : null,

                list_category: _CHILD ? _CHILD.list_category : null,
                list_code: _CHILD ? _CHILD.list_code : null,
                list_pages: _CHILD ? _CHILD.list_pages : null,
                list_review: _CHILD ? _CHILD.list_review : null,
                list_name: _CHILD ? _CHILD.list_name : null,
            }
            if (document.getElementById('submit_7')) document.getElementById('submit_7').value = _CHILD_VARS.worker_reciever;
            if (document.getElementById('submit_3')) document.getElementById('submit_3').value = _CHILD_VARS.date
            if (document.getElementById('submit_32')) document.getElementById('submit_32').value = _CHILD_VARS.time
            return _CHILD_VARS;
        }

        // DATA COMVERTERS
        // let _REGEX_IDNUMBER = (e) => {
        //     let regex = /^[0-9]+$/i;
        //     let test = regex.test(e.target.value);
        //     if (test) {
        //         var _value = Number(e.target.value).toLocaleString();
        //         _value = _value.replaceAll(',', '.');
        //         document.getElementById(e.target.id).value = _value;
        //     }
        // }
        let _GET_LAST_ID = (_htmlId) => {
            let new_id = "";
            let htmlId = _htmlId ?? 'submit_1';
            SubmitService.getlastid()
                .then(response => {
                    if (response.data.length) {
                        new_id = response.data[0].vr;
                        if (new_id) {
                            let concecutive = new_id.split('-')[1];
                            concecutive = Number(concecutive) + 1
                            if (concecutive < 1000) concecutive = "0" + concecutive
                            if (concecutive < 100) concecutive = "0" + concecutive
                            if (concecutive < 10) concecutive = "0" + concecutive
                            new_id = new_id.split('-')[0] + "-" + concecutive
                            document.getElementById(htmlId).value = new_id;
                        } else document.getElementById(htmlId).value = "VR" + moment().format('YY') + "-0001";
                    } else document.getElementById(htmlId).value = "VR" + moment().format('YY') + "-0001";
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
        let _VERIFY_RELATED_ID = () => {
            this.setState({ verifyMSG: <label className="fw-bold"><i class="fas fa-search-location text-info"></i> Buscando...</label> })
            var id = document.getElementById('submit_2').value;
            if (id.length) {
                _GET_TYPE(id)
                SubmitService.verifyid(id)
                    .then(response => {
                        if (response.data.length) {
                            this.setState({ verifyMSG: <label className="fw-bold"><i class="fas fa-check text-success"></i> Se encontro consecutivo</label> })
                        } else {
                            this.setState({ verifyMSG: <label className="fw-bold"><i class="fas fa-exclamation text-warning"></i> No se encontro consecutivo</label> })
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        this.setState({ verifyMSG: <label className="fw-bold"><i class="fas fa-exclamation text-warning"></i> Se encontraron errores en el Codigo a buscar</label> })
                    });
            } else {
                document.getElementById('submit_4').value = ""
                this.setState({ verifyMSG: <label className="fw-bold"><i class="fas fa-times text-danger"></i> Debe especificar un consecutivo de Licencia o JUR.</label> })
            }
        }
        let _GET_TYPE = (id_public) => {
            FunService.get_fun_IdPublic(id_public).then(response => {
                if (response.data) {
                    let fun = response.data;
                    let version = fun.version - 1
                    let fun_1 = fun.fun_1s[version]
                    let fun_51 = fun.fun_51s;
                    let owners = [];
                    let state = fun.state;
                    let rec_rev = fun.record_review ? fun.record_review.check : null;
                    let rec_rev_2 = fun.record_review ? fun.record_review.check_2 : null;
                    let state_str = (state) => {
                        if (state == undefined || state == null) return '';
                        if (state < -1) return 'DESISTIDO';
                        if (state < 5) return 'INCOMPLETO';
                        if (state == 5) {
                            let con = (rec_rev == 1 || (rec_rev != 1 && rec_rev_2 == 1));
                            let con2 = (rec_rev == null && rec_rev_2 == null);
                            if (con2) return 'LEGAL Y DEBIDA FORMA';
                            if (con) return "ACTA DE OBSERVACIONES"
                            return "ACTA DE OBSERVACIONES Y CORRECCIONES"
                        }
                        if (state > 5 || state < 100) return "EXPEDICIÓN";
                        if (state > 100 || state < 200) return "EXPEDIDO";
                        if (state > 200) return "DESISTIDO";
                    }
                    fun_51.map(value => { if (value.role == 'PROPIETARIO') owners.push(value.name + ' ' + value.surname) })
                    document.getElementById('submit_5').value = owners.join(', ');
                    document.getElementById('submit_42').value = state_str(state);
                    if (fun_1) document.getElementById('submit_4').value = formsParser1(fun_1);
                    else document.getElementById('submit_4').value = ""
                } else document.getElementById('submit_4').value = ""
            })
        }
        let _GET_LAST_ID_PUBLIC = () => {
            let new_id = "";
            FunService.getLastIdPublic()
                .then(response => {
                    if (response.data.length) {
                        new_id = response.data[0].id;
                        if (new_id) {
                            let _id = new_id.split('-')
                            let concecutive = _id[3];
                            concecutive = Number(concecutive) + 1
                            if (concecutive < 1000) concecutive = "0" + concecutive
                            if (concecutive < 100) concecutive = "0" + concecutive
                            if (concecutive < 10) concecutive = "0" + concecutive
                            new_id = `${_id[0]}-${_id[1]}-${_id[2]}-${concecutive}`
                            document.getElementById('submit_2').value = new_id;
                        } else document.getElementById('submit_2').value = "68001-1-" + moment().format('YY') + "-0001";
                    } else document.getElementById('submit_2').value = "68001-1-" + moment().format('YY') + "-0001";
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
        // COMPONENTs JSX
        let COMPONENT_NEW = () => {
            let _CHILD = GET_SUBMIT();
            return (
                <div className="container-fluid">
                    <div className="row">
                        {/* Primera sección */}
                        <div className="col-lg-5 col-md-14 border-end border-2 border-black">
                            <h2>1. Usuario Solicitante</h2>
                            {COMPONENT_NEW_SOLICITOR()}
                        </div>

                        {/* Segunda sección */}
                        <div className="col-lg-3 col-md-11 border-end border-2 border-black">
                            <div>
                                <h2>2. Motivo Razón</h2>
                                <form id='form_reason_submit' onSubmit={save_reason_response}>
                                    {COMPONENT_NEW_REASON(_CHILD)}
                                </form>
                                <div className="row ">
                                    <div className="text-center col-12">
                                        {isLoaded ? (
                                            <DataTable
                                                paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                                                striped="true"
                                                columns={columns}
                                                data={list}
                                                highlightOnHover
                                                pagination
                                                paginationPerPage={5}
                                                paginationRowsPerPageOptions={[20, 50, 100]}
                                                className="data-table-component"
                                                noHeader

                                                dense
                                                defaultSortFieldId={1}
                                                defaultSortAsc={false}
                                            />
                                        ) : (
                                            <div className="text-center">
                                                <button onClick={() => {
                                                    document.getElementById("solicitor_id").value != '' ?
                                                        this.retrievePublish(document.getElementById("solicitor_id").value) : MySwal.fire({
                                                            title: 'No hay un usuario registrado',
                                                            text: 'Por favor llene los datos del formulario',
                                                            icon: 'warning',
                                                            confirmButtonText: swaMsg.text_btn,
                                                        });
                                                }}>Cargar info</button>
                                            </div>)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tercera sección */}
                        <div className="col-lg-4 col-md-12">
                            <div>
                                <h2>3. Creación de VR</h2>
                                <form id="form_manage_submit" onSubmit={save_submit}>
                                    {COMPONENT_NEW_VR(_CHILD)}
                                </form>

                            </div>
                        </div>

                    </div>
                </div>
            );
        }
        // FUNCTIONS AND APIS
        let save_reason_response = (e) => {
            e.preventDefault()
            let formDataReason = new FormData()

            let starterQuality = document.getElementById("starterQuality").value;
            formDataReason.set('starterQuality', starterQuality);
            let actionType = document.getElementById("submit_4").value;
            formDataReason.set('actionType', actionType);
            let sub_ActionType = document.getElementById("submit_41").value;
            formDataReason.set('sub_ActionType', sub_ActionType);
            let comments = document.getElementById("submit_9").value;
            formDataReason.set('comments', comments);

            let solicitor_id = document.getElementById("solicitor_id").value;
            formDataReason.set('solicitorId', solicitor_id);

            console.log(formDataReason.get('starterQuality'))
            Solicitors_service.addReason(formDataReason)
                .then(response => {
                    console.log(response)
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.generic_success_title,
                            text: swaMsg.generic_success_text,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        document.getElementById("step_2_circle").style.backgroundColor = "green"
                        document.getElementById("step_2").setAttribute('hidden', '')
                        document.getElementById("step_3").removeAttribute('hidden')

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

        var formData = new FormData();

        let save_submit = (e) => {
            e.preventDefault();
            formData = new FormData();

            let type = document.getElementById("submit_4").value;
            if (type) formData.set('type', type);

            let list_type_str = document.getElementById("submit_42").value;
            if (list_type_str) formData.set('list_type_str', list_type_str);

            let list_type = document.getElementById("submit_41").value;
            if (list_type) formData.set('list_type', list_type);

            let id_related = document.getElementById("submit_2").value;
            if (id_related) formData.set('id_related', id_related);
            if (document.getElementById("payment_cb")) {
                if (document.getElementById("payment_cb").checked) {
                    let id_payment = document.getElementById("submit_21").value;
                    if (id_payment) formData.set('id_payment', id_payment);
                }
            }

            let id_public = document.getElementById("submit_1").value;
            formData.set('id_public', id_public);

            let date = document.getElementById("submit_3").value;
            if (date) formData.set('date', date);
            let time = document.getElementById("submit_32").value;
            if (time) formData.set('time', time);
            let owner = document.getElementById("submit_5").value;
            if (owner) formData.set('owner', owner);
            let worker_reciever = document.getElementById("submit_7").value;
            if (worker_reciever) formData.set('worker_reciever', worker_reciever);
            if (worker_reciever) formData.set('worker_id', window.user.id);
            // let name_retriever = document.getElementById("submit_8").value;
            // if (name_retriever) formData.set('name_retriever', name_retriever);
            let id_number_retriever = document.getElementById("submit_81").value;
            if (id_number_retriever) formData.set('id_number_retriever', id_number_retriever);
            let details = document.getElementById("submit_9").value;
            if (details) formData.set('details', details);

            manage_submit(id_public);

        };
        let manage_submit = (id_public) => {
            let _CHILD = GET_SUBMIT();

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            if (_CHILD.id) {
                formData.set('new_id', document.getElementById("submit_1").value);
                formData.set('prev_id', _CHILD.id_public);

                SubmitService.update(_CHILD.id, formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            this.props.refreshList(currentItem.id);
                        } else if (response.data === 'ERROR_DUPLICATE') {
                            MySwal.fire({
                                title: "ERROR DE DUPLICACIÓN",
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
                SubmitService.create(formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            this.props.refreshList();
                            this.props.closeModal();
                        } else if (response.data === 'ERROR_DUPLICATE') {
                            MySwal.fire({
                                title: "ERROR DE DUPLICACIÓN",
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
        //STEPS

        //CREATE USER || UPDATE IT
        let COMPONENT_NEW_SOLICITOR = () => {
            return (
                <NEW_SOLICITOR
                    translation={translation} swaMsg={swaMsg} globals={globals}
                    refreshList={this.refreshList} />
            )

        }

        // ADD A REASON AND LINK IT TO USER'S ID
        let COMPONENT_NEW_REASON = (_CHILD) => {

            return (
                // className={`${this.step2 === true ? 'opacity-100' : 'opacity-50'}`}
                <section
                >
                    <div className="row mb-3">
                        <div className="col-12">
                            <label className="form-label">2.1 Calidad en la que viene</label>
                            <div className="input-group">
                                <span className="input-group-text bg-info text-white">
                                    <i className="fas fa-hashtag"></i>
                                </span>
                                <input type="text" className="form-control" id="starterQuality" defaultValue={_CHILD.list_type_str} maxLength={250} />
                            </div>
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div className="col-12">
                            <label className="form-label">2.2 Tipo</label>
                            <div className="input-group">
                                <span className="input-group-text bg-info text-white">
                                    <i className="far fa-check-square"></i>
                                </span>
                                <input list="submit_type" className="form-control" id="submit_4" defaultValue={_CHILD.type} autoComplete="off" maxLength={250} />
                                <datalist id="submit_type">
                                    <option value="LICENCIA" />
                                    <option value="URBANIZACION" />
                                    <option value="PARCELACION" />
                                    <option value="SUBDIVICON" />
                                    <option value="RECONOCIMIENTO" />
                                    <option value="CONSTRUCCION" />
                                    <option value="OTRAS ACTUACIONES" />
                                    <option value="VISTO BUENO" />
                                    <option value="PROPIEDAD HORIZONTAL" />
                                    <option value="EXPENSAS / IMPUESTOS " />
                                </datalist>
                            </div>
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div className="col-12">
                            <label className="form-label">2.3 Tipo de Radicación</label>
                            <div className="input-group">
                                <span className="input-group-text bg-info text-white">
                                    <i className="far fa-check-square"></i>
                                </span>
                                <select className="form-select" id="submit_41" defaultValue={_CHILD.list_type}>
                                    <option value={1} selected={_CHILD.list_type == 1}>RADICACIÓN SOLICITUD</option>
                                    <option value={2} selected={_CHILD.list_type == 2}>ASESORÍA TÉCNICA</option>
                                    <option value={3} selected={_CHILD.list_type == 3}>CORRECCIONES SOLICITUD</option>
                                    <option value={4} selected={_CHILD.list_type == 4}>TRAMITE</option>
                                    <option value={5} selected={_CHILD.list_type == 5}>PQRS</option>
                                    <option value={0} selected={_CHILD.list_type == 0}>OTRO</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="row ">
                        <div className="col-12">
                            <label >3. Observaciones y detalles (Maximo 2000 Caracteres)</label>
                            <textarea class="form-control mb-3" rows="3" maxLength="2000" id="submit_9"
                                defaultValue={_CHILD.details}></textarea>
                        </div>
                    </div>
                    <div className="text-center py-4 mt-3">
                        <button className="btn btn-xs btn-success" hidden id='step_2'><i class="fas fa-folder-plus"></i> CONTINUAR </button>
                    </div>
                </section>
            )
        }

        //CREATE VR && LINK IT WITH THE ID 
        let COMPONENT_NEW_VR = (_CHILD) => {
            return (
                <>
                    <div className="row">
                        <div className="col-12">
                            <label>1. Número de radicación</label>
                            <div class="input-group mb-1">
                                <span class="input-group-text bg-info text-white">
                                    <i class="fas fa-hashtag"></i>
                                </span>
                                <input type="text" class="form-control" id="submit_1" required defaultValue={_CHILD.id_public} />
                                <button type="button" class="btn btn-info shadow-none" onClick={() => _GET_LAST_ID()}>GENERAR</button>
                            </div>
                        </div>
                        <div className="col-12">
                            <label>2. Número de solicitud</label>
                            <div class="input-group mb-1">
                                <span class="input-group-text bg-info text-white">
                                    <i class="fas fa-hashtag"></i>
                                </span>
                                <input type="text" class="form-control" id="submit_2" defaultValue={_CHILD.id_related} />
                                <button type="button" class="btn btn-warning shadow-none" onClick={() => _VERIFY_RELATED_ID()}>VERIFICAR</button>
                            </div>
                            {this.state.verifyMSG}
                        </div>
                        <div className="col-12">
                            {this.state.payment && <>
                                <label>2.1 Consecutivo Pago</label>
                                <div class="input-group mb-1">
                                    <span class="input-group-text bg-info text-white">
                                        <i class="fas fa-hashtag"></i>
                                    </span>
                                    <input type="text" class="form-control" id="submit_21" required defaultValue={_CHILD.id_related} />
                                </div>
                            </>}
                        </div>
                    </div>
                    {!this.props.edit && <div className="row text-end">
                        <div className="col-12">
                            <div class="form-check my-3">
                                <input class="form-check-input" type="checkbox" id="payment_cb" onChange={(e) => this.setState({ payment: e.target.checked })} />
                                <p class="form-check-label" >SE ENTREGA PAGO DE EXPENSAS FIJAS Y GENERAR SOLICITUD</p>
                            </div>
                        </div>
                        {this.state.payment && <div className="col-12 text-end">
                            <button type="button" class="btn btn-info shadow-none me-1" onClick={() => _GET_LAST_ID_PUBLIC()}>GENERAR LIC</button>
                            <button type="button" class="btn btn-info shadow-none" onClick={() => _GET_LAST_ID('submit_2')}>GENERAR VR</button>
                        </div>}
                    </div>}
                    <div className="row">
                        <div className="col-12">
                            <label>3. Estado</label>
                            <div class="input-group mb-1">
                                <span class="input-group-text bg-info text-white">
                                    <i class="fas fa-hashtag"></i>
                                </span>
                                <input type="text" class="form-control" id="submit_42" defaultValue={_CHILD.list_type_str} maxLength={250} />
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <label>4. Fecha y hora ingreso</label>
                            <div class="input-group mb-1">
                                <span class="input-group-text bg-info text-white">
                                    <i class="far fa-calendar-alt"></i>
                                </span>
                                <input type="date" max="2100-01-01" class="form-control" id="submit_3" required defaultValue={_CHILD.date} />
                                <input type="time" class="form-control" id="submit_32" defaultValue={_CHILD.time} />
                            </div>
                        </div>
                        <div className="col-12">
                            <label>5. Propietarios</label>
                            <div class="input-group mb-1">
                                <span class="input-group-text bg-info text-white">
                                    <i class="far fa-user"></i>
                                </span>
                                <input type="text" class="form-control" id="submit_5" maxLength={250} defaultValue={_CHILD.owner} />
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <label>6. Funcionario que recibe</label>
                            <div class="input-group mb-1">
                                <span class="input-group-text bg-info text-white">
                                    <i class="far fa-user"></i>
                                </span>
                                <input type="text" class="form-control" id="submit_7" disabled defaultValue={_CHILD.worker_reciever} />
                            </div>
                        </div>
                        <div className="col-12">
                            <label>7. Número de Identificación Persona que entrega</label>
                            <div class="input-group mb-1">
                                <span class="input-group-text bg-info text-white">
                                    <i class="far fa-user"></i>
                                </span>
                                <input type="text" class="form-control" id="submit_81" maxLength={250} defaultValue={userID} />
                            </div>
                        </div>
                        <div className="text-center py-4 mt-3">
                            <button className="btn btn-xs btn-success" hidden id='step_3'><i class="fas fa-folder-plus"></i> CONTINUAR </button>
                        </div>
                    </div>
                </>
            )
        }
        const customStepStyle = {

            width: '20px',
            height: '20px',
            backgroundColor: 'white',
        }
        return (
            <div className="Nomenclature_new container-fluid">
                <>
                    <legend className="mt-2 mb-4 px-3 text-uppercase Collapsible border-0 d-flex py-2" id="fun_pdf">
                        <label className="app-p lead fw-normal text-uppercase text-light">NUEVA ENTRADA</label>
                        {/* //STEPS */}
                        <section className='d-flex align-items-center ms-4'>
                            <div id="step_1_circle" className='rounded-circle mx-1' style={customStepStyle} />
                            <div id="step_2_circle" className='rounded-circle mx-1' style={customStepStyle} />
                            <div id="step_3_circle" className='rounded-circle mx-1' style={customStepStyle} />
                        </section>
                    </legend>

                    {COMPONENT_NEW()}

                </>
            </div>
        );
    }
}

export default SUBMIT_CREATE;