import React, { Component } from 'react';
import FUNService from '../../../services/fun.service'
import { MDBBtn, MDBTooltip } from 'mdb-react-ui-kit';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import DataTable from 'react-data-table-component';
import moment from 'moment';
import FUN_SERVICE from '../../../services/fun.service';
import VIZUALIZER from '../../../components/vizualizer.component';
import DOCS_LIST from './components/docs_list.component';
import FUN_6_HISTORY from './components/fun_6_history.component';
import submitService from '../../../services/submit.service';


const MySwal = withReactContent(Swal);
class FUN_6_VIEW extends Component {
    constructor(props) {
        super(props);
        this.requestUpdate = this.requestUpdate.bind(this);
        this.retrieveItem = this.retrieveItem.bind(this);
        this.retrieveItemVR = this.retrieveItemVR.bind(this);
        this.state = {
            attachs: 0,
            edit: false,
            item: null,
            show_doc_1: false,
            modal_searchList: false,
            currentItem6: [],
            VRList: [],
            load: false,
        };
    }
    requestUpdate(id) {
        this.retrieveItem(id);
    }
    componentDidMount() {
        this.retrieveItem(this.props.currentId);
        this.retrieveItemVR(this.props.currentItem.id_public);
    }
    retrieveItemVR(id) {
        submitService.getIdRelated(id).then(response => {
            let newList = [];
            let List = response.data
            if (!List) return;
            List.map((value, i) => {
                let vr = value.id_public;
                if (!newList.includes(vr)) newList.push(vr)
            })
            this.setState({ VRList: newList, load: true })
        })
    }
    retrieveItem(id) {
        FUN_SERVICE.get(id)
            .then(response => {
                this.setState({
                    currentItem6: response.data.fun_6s,
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

    componentDidUpdate(prevProps, prevState) {
        if (this.state.item !== prevState.item && this.state.item != null) {
            document.getElementById('fun6_descriptions_edit').value = this.state.item.description;
            document.getElementById('fun6_codes_edit').value = this.state.item.id_public;
            document.getElementById('fun6_pages_edit').value = this.state.item.pages;
            document.getElementById('fun6_dates_edit').value = this.state.item.date;
        }
        if (this.props.currentItem !== prevProps.currentItem && this.props.currentItem != null) {
            this.retrieveItem(this.props.currentId);
        }
        if (this.props.parentLoad == 0 && this.props.parentLoad != undefined) {
            this.retrieveItem(this.props.currentId);
            this.props.updateParentLoad(1);
        }
    }

    render() {
        const { translation, swaMsg, globals, currentItem, readOnly, title } = this.props;
        const { currentItem6, load } = this.state;
        var formData = new FormData();

        let _CHILD_6_LIST = () => {
            let _LIST = currentItem6;
            const columns = [
                {
                    name: <label className="text-center">DESCRIPCIÓN</label>,
                    selector: 'description',
                    sortable: true,
                    filterable: true,
                    cell: row => <label>{row.description}</label>
                },
                {
                    name: <label>VR</label>,
                    selector: 'id_replace',
                    sortable: true,
                    filterable: true,
                    minWidth: '50px',
                    maxWidth: '150px',
                    cell: row => this.props.VREdit ? <select className='form-select form-select-sm' id="f_6_vr" defaultValue={row.id_replace || ''}
                        onChange={(e) => edit_6_vr(row.id, e.target.value)}>
                        <option value="">SIN VR</option>
                        {this.state.VRList.map(vr => <option>{vr}</option>)}
                    </select> : <label>{row.id_replace}</label>
                },
                {
                    name: <label>CÓDIGO</label>,
                    selector: 'id_public',
                    sortable: true,
                    filterable: true,
                    maxWidth: '50px',
                    cell: row => <label>{row.id_public}</label>
                },
                {
                    name: <label>FOLIOS</label>,
                    selector: 'pages',
                    sortable: true,
                    filterable: true,
                    maxWidth: '40px',
                    cell: row => <label>{row.pages}</label>
                },
                {
                    name: <label>FECHA RADICACIÓN</label>,
                    selector: 'date',
                    sortable: true,
                    filterable: true,
                    maxWidth: '100px',
                    cell: row => <label>{row.date}</label>
                },
                /**
                 * {
                    name: <label>ESTADO</label>,
                    button: true,
                    maxWidth: '50px',
                    omit: readOnly ? true : false,
                    cell: row =>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" defaultChecked={row.active == 1 ? true : false} onChange={() => setChecked6(row)} />
                        </div>
                },
                 * 
                 */
                {
                    name: <label>ACCIÓN</label>,
                    button: true,
                    minWidth: '150px',
                    cell: row => <>
                        <VIZUALIZER url={row.path + "/" + row.filename} apipath={'/files/'}
                            icon='fas fa-search'
                            iconWrapper='btn btn-sm btn-info m-0 p-1 shadow-none'
                            iconStyle={{ fontSize: '150%' }} />
                        <FUN_6_HISTORY translation={translation}
                            swaMsg={swaMsg}
                            globals={globals}
                            fun6={row} />
                        {readOnly ? '' :
                            window.user.id == 1 || window.user.roleId == 3 ?
                                <>
                                    <MDBTooltip title='Modificar Item' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 ms-1">
                                        <MDBBtn className="btn btn-secondary m-0 p-1 shadow-none" onClick={() => set_edit_6(row)}>
                                            <i class="far fa-edit" style={{ fontSize: '150%' }}></i></MDBBtn>
                                    </MDBTooltip>
                                    <MDBTooltip title='Eliminar Item' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 ms-1">
                                        <MDBBtn className="btn btn-danger btn-sm  m-0 p-1 shadow-none" onClick={() => delete_6(row.id)}>
                                            <i class="far fa-trash-alt" style={{ fontSize: '150%' }}></i></MDBBtn>
                                    </MDBTooltip>
                                </>
                                : ''
                        }


                    </>
                },
            ]
            return <DataTable
                paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                noDataComponent="No hay Items"
                striped="true"
                columns={columns}
                data={_LIST}
                highlightOnHover
                pagination
                paginationPerPage={15}
                paginationRowsPerPageOptions={[15, 30, 60]}
                className="data-table-component"
                title={'DOCUMENTOS DIGITALIZADOS'}
                noHeader={!title}

                load={load}
                progressPending={!load}
                progressComponent={<label className='fw-normal lead text-muted'>CARGANDO...</label>}

                dense
            />
        }
        let setValues_edit = (refs, values) => {
            document.getElementById('fun6_codes_edit').value = values[0];
            document.getElementById('fun6_descriptions_edit').value = values[1];
        }
        let _EDIT_COMPONENT = () => {
            return <><h3 class="text-uppercase text-center py-3" id="fund_edit">ACTUALIZAR DOCUMENTO</h3>
                <div className="row">
                    <div className="col-12">
                        <div class="input-group">
                            <span class="input-group-text bg-info text-white"><i class="fas fa-paperclip"></i></span>
                            <input type="file" class="form-control" id="file_fun6s_edit" accept="image/png, image/jpeg application/pdf" />
                        </div>
                        <div class="input-group">
                            <span class="input-group-text bg-info text-white"><i class="fas fa-paperclip"></i></span>
                            <input list="fun_6_docs_list" id="fun6_descriptions_edit" class="form-control" required />
                            <DOCS_LIST idRef={''} setValues={setValues_edit} text={'VER LISTA'} />
                        </div>
                    </div>
                </div>
                <div className="row d-flex justify-content-start mb-3">
                    <div className="col-3">
                        <div class="input-group">
                            <span class="input-group-text bg-info text-white"><i class="fas fa-hashtag"></i></span>
                            <input type="text" class="form-control" id="fun6_codes_edit" />
                        </div>
                    </div>
                    <div className="col-3">
                        <div class="input-group">
                            <span class="input-group-text bg-info text-white"><i class="far fa-sticky-note"></i></span>
                            <input type="number" class="form-control" step="1" min="0" id="fun6_pages_edit" required />
                        </div>
                    </div>
                    <div className="col-5">
                        <div class="input-group">
                            <span class="input-group-text bg-info text-white"><i class="far fa-calendar-alt"></i>&nbsp;Fecha Anexo</span>
                            <input type="date" class="form-control" max="2100-01-01" id="fun6_dates_edit" required />
                        </div>
                    </div>
                </div>
            </>
        }
        let setChecked6 = (item) => {
            formData = new FormData();
            let id = item.id
            let active = item.active;
            active = active == 1 ? 0 : 1;
            formData.set('active', active);
            FUNService.update_6(id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        this.requestUpdate(currentItem.id);
                    } else {
                        if (response.status == 500) {
                        }
                    }
                })
                .catch(e => {
                    console.log(e);
                });
        }
        let delete_6 = (id) => {
            formData = new FormData();
            MySwal.fire({
                title: "ELIMINAR ESTE ITEM",
                text: "¿Esta seguro de eliminar de forma permanente este item?",
                icon: 'question',
                confirmButtonText: "ELIMINAR",
                showCancelButton: true,
                cancelButtonText: "CANCELAR"
            }).then(SweetAlertResult => {
                if (SweetAlertResult.isConfirmed) {
                    MySwal.fire({
                        title: swaMsg.title_wait,
                        text: swaMsg.text_wait,
                        icon: 'info',
                        showConfirmButton: false,
                    });
                    FUNService.delete_6(id)
                        .then(response => {
                            if (response.data === 'OK') {
                                MySwal.fire({
                                    title: swaMsg.publish_success_title,
                                    text: swaMsg.publish_success_text,
                                    footer: swaMsg.text_footer,
                                    icon: 'success',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                                this.requestUpdate(currentItem.id);
                                this.setState({ edit: false })
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
            });
        }
        let set_edit_6 = (_item) => {
            this.setState({
                item: _item,
                edit: true
            })
        }
        let edit_6 = (e) => {
            e.preventDefault();
            formData = new FormData();
            // FILE DATA
            let _creationYear = moment(currentItem.createdAt).format('YY');
            let _folder = currentItem.id_public;
            let file = document.getElementById('file_fun6s_edit').files[0];
            if (file) {
                formData.append('file', file, "fun6_" + _creationYear + "_" + _folder + "_" + file.name);
                formData.set('attached', true);

            } else {
                formData.set('attached', false);
            }

            let description = document.getElementById('fun6_descriptions_edit').value;
            formData.set('description', description);
            let id_public = document.getElementById('fun6_codes_edit').value;
            formData.set('id_public', id_public);
            let pages = document.getElementById('fun6_pages_edit').value;
            formData.set('pages', pages);
            formData.set('id_public', id_public);
            let date = document.getElementById('fun6_dates_edit').value;

            if (!date) date = null;
            formData.set('date', date);
            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            FUNService.update_6(this.state.item.id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.generic_success_title,
                            text: swaMsg.generic_success_text,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        this.setState({ edit: false, item: null });
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
        let edit_6_vr = (id, new_vr) => {
            formData = new FormData();
            formData.set('id_replace', new_vr);
            FUNService.update_6(id, formData)
                .then(response => {
                    if (response.data === 'OK') {

                        this.setState({ edit: false, item: null });
                        this.requestUpdate(currentItem.id);
                    }
                })
                .catch(e => {
                    console.log(e);
                });
        }

        return (
            <div>
                {_CHILD_6_LIST()}
                {this.state.edit
                    ? <>
                        <form id="fun_6_d_edit" onSubmit={edit_6} className="py-3">
                            {_EDIT_COMPONENT()}
                            <div className="row text-center">
                                <div className="col-12">
                                    <button className="btn btn-lg btn-success"><i class="fas fa-archive"></i> GUARDAR CAMBIOS </button>
                                </div>
                            </div>
                        </form></> : ""}
            </div>
        );
    }
}

export default FUN_6_VIEW;