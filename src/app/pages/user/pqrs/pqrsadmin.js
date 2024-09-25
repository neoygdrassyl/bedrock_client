import React, { Component } from 'react';
import { MDBRow, MDBCol, MDBCard, MDBCardBody, MDBCardTitle, MDBBreadcrumb, MDBBreadcrumbItem, MDBTooltip, MDBBtn, MDBTabs, MDBTabsItem, MDBTabsLink, MDBTabsPane, MDBTabsContent, MDBBtnGroup, MDBTypography } from 'mdb-react-ui-kit';
import PQRS_Main from '../../../services/pqrs_main.service'
import { Link } from "react-router-dom";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import DataTable from 'react-data-table-component';
import { dateParser, dateParser_timeLeft, dateParser_finalDate, dateParser_dateDiff } from '../../../components/customClasses/typeParse'
import Modal from 'react-modal';

// MODALS FOR PQRS
import PQRSNEW from './newpqrs'
import PQRSINFO from './infopqrs'
//simplificacion
import PQRSASIGN from './asignpqrs'
import PQRSINFORMAL from './infomalpqrs'
import PQRSREPLY from './replypqrs'
import PQRSLOCK from './lockpqrs'

// IMGS
// STEP BY STEP IMAGES
import IMG_ASIGN from '../../../img/pqrs/asignarIconosbarra-01.png'
import IMG_WORKER from '../../../img/pqrs/respuestaproIconosbarra-01.png'
import IMG_REPLY from '../../../img/pqrs/respuestaoficioIconosbarra-01.png'
import IMG_LOCK from '../../../img/pqrs/cerrarIconosbarra-01.png'
import IMG_ARCHIVE from '../../../img/pqrs/archivarIconosbarra-01.png'
// ICON IMGS
import IMG_ASIGN_ICON from '../../../img/pqrs/asignarIconos-01.png'
import IMG_WORKER_ICON from '../../../img/pqrs/respuestaproIconos-01.png'
import IMG_REPLY_ICON from '../../../img/pqrs/respuestaoficioIconos-01.png'
import IMG_LOCK_ICON from '../../../img/pqrs/cerrarIconos-01.png'
import IMG_ARCHIVE_ICON from '../../../img/pqrs/archivarIconos-01.png'
import IMG_SEARCH_ICON from '../../../img/pqrs/Buscaricono-01.png'

// COMPONENTS
import PQRS_EDIT from './pqrs_edit';
import PQRS_MACROTABLE from './pqrs_macrotable';
import PQRS_ACTION_REVIEW from './components/pqrs_reviewAction.component';
import SUBMIT_X_FUN from '../submit/submit_x_fun.component';
import PQRS_MANAGE_COMPONENT from './pqrs_manage.view';
import { ACESS_EDIT } from './access_edit';
import { MDBCollapse } from 'mdbreact';

// JSONS
//const momentHolydays = require('../../components/jsons/holydaysmoment.json')

const moment = require('moment');
const momentB = require('moment-business-days');
const MySwal = withReactContent(Swal);

class PQRSADMIN extends Component {
    constructor(props) {
        super(props);
        this.retrievePublish = this.retrievePublish.bind(this);
        this.refreshList = this.refreshList.bind(this);
        this.refreshRequested = this.refreshRequested.bind(this);
        this.refreshCurrentItem = this.refreshCurrentItem.bind(this);
        this.setSubtmitRows = this.setSubtmitRows.bind(this);
        this.retrievePending = this.retrievePending.bind(this);
        this.state = {
            error: null,
            isLoaded: false,
            isLoadedAsign: false,
            isLoadedReply: false,
            isloadedFormal: false,
            isloadedSearch: false,

            currentItem: null,
            currentItemAsign: null,
            currentIndex: -1,

            items: [],
            itemsAsigned: [],
            itemsReply: [],
            itemsFormal: [],
            itemsClose: [],
            itemsGeneral: [],
            itemsGeneral2: [],
            itemsSearch: [],

            modalNew: false,
            modalInfo: false,
            modalAsign: false,
            modalInformal: false,
            modalReply: false,
            modalLock: false,
            modalEdit: false,
            modal_macro: false,
            modalManage: false,
            modalEditable: false,
            editMaster: false,

            submitItems: [],
            fillActive: '1',
            filterreply: false,
            filterreply2: false,

            pending: [],
            pending_open: false,
        };
    }
    componentDidMount() {
        this.retrievePublish();
        this.retrievePending();
    }
    retrievePublish() {
        PQRS_Main.getAllPqrs()
            .then(response => {
                this.setState({
                    itemsGeneral: response.data,
                });
                this.asignLists(response.data);
                this.asignListsWorkers(response.data);
            })
            .catch(e => {
                console.log(e);
            });
    }

    retrievePending() {
        PQRS_Main.getAllPqrsPending()
            .then(response => {
                this.setState({
                    pending: response.data,
                });
            })
            .catch(e => {
                console.log(e);
            });
    }

    refreshList() {
        this.retrievePending();
        this.retrievePublish();
        this.setState({
            currentItem: null,
            currentIndex: -1,
        });
    }

    asignLists(_LIST) {
        let littNoAsigned = [];
        let listReply = [];
        let listFormal = [];
        let listClose = [];
        for (var i = 0; i < _LIST.length; i++) {
            if (_LIST[i].status == 0) {
                if (!_LIST[i].id_reply) {
                    littNoAsigned.push(_LIST[i])
                }
                if (_LIST[i].id_reply) {
                    littNoAsigned.push(_LIST[i])
                }
            } else if (_LIST[i].status == 1) {
                listClose.push(_LIST[i])
            }

        }
        this.asignListsLock(listFormal)
        this.setState({
            items: littNoAsigned,
            //itemsReply: listReply,
            itemsClose: listClose,
            isLoaded: true,
        });
    }
    asignListsWorkers(_LIST) {
        let listNotReplyTo = [];
        for (var i = 0; i < _LIST.length; i++) {
            if (_LIST[i].pqrs_workers) {
                for (var j = 0; j < _LIST[i].pqrs_workers.length; j++) {
                    let worker = _LIST[i].pqrs_workers[j]
                    if ((!worker.reply && worker.worker_id == window.user.id) || (!worker.reply && (window.user.roleId == 1 || window.user.roleId == 5 || window.user.roleId == 3))) {
                        worker.id_master = _LIST[i].id;
                        worker.id_public = _LIST[i].id_publico;
                        worker.time = _LIST[i].pqrs_time.time;
                        worker.legal = _LIST[i].pqrs_time.legal;
                        listNotReplyTo.push(worker)
                    }
                }
            }
        }
        this.setState({
            itemsAsigned: listNotReplyTo,
            isLoadedAsign: true,
        });
    }
    asignListsLock(_LIST) {

        //READ IN EACH ITEM, IF ANY OF THE WORKERS IS THE CURRENT USER ID
        let listNotReplyTo = [];
        for (var i = 0; i < _LIST.length; i++) {
            if (_LIST[i].pqrs_workers) {
                for (var j = 0; j < _LIST[i].pqrs_workers.length; j++) {
                    let worker = _LIST[i].pqrs_workers[j]
                    if (worker.worker_id == window.user.id || (window.user.roleId == 1 || window.user.roleId == 5 || window.user.roleId == 3)) {
                        listNotReplyTo.push(_LIST[i])
                        break;
                    }
                }
            }
        }
        this.setState({
            itemsFormal: listNotReplyTo,
            isLoadedAsign: true,
        });
    }
    //  MODAL CONTROLS
    toggle = () => {
        this.setState({
            modalNew: !this.state.modalNew,
        });
    }
    getToggle = () => {
        return this.state.modalNew;
    }
    toggleInfo = (item) => {
        if (item) this.setItem(item);
        this.setState({
            modalInfo: !this.state.modalInfo,
            modal_macro: false,
        });
    }
    getToggleInfo = () => {
        return this.state.modalInfo;
    }
    toggleInfo2 = (item) => {
        if (item) this.setItemAsign(item);
        this.setState({
            modalInfo: !this.state.modalInfo,
            modal_macro: false,
        });
    }
    toggleAsign = (item) => {
        if (item) this.setItem(item);
        this.setState({
            modalAsign: !this.state.modalAsign
        });
    }
    getToggleAsign = () => {
        return this.state.modalAsign;
    }
    toggleInformal = (item) => {
        if (item) {
            this.setItemAsign(item);
        }
        this.setState({
            modalInformal: !this.state.modalInformal
        });
    }
    getToggleInformal = () => {
        return this.state.modalInformal;
    }
    toggleReply = (item) => {
        if (item) this.setItem(item);
        this.setState({
            modalReply: !this.state.modalReply
        });
    }
    getToggleReply = () => {
        return this.state.modalReply;
    }
    toggleLock = (item) => {
        if (item) this.setItem(item);
        this.setState({
            modalLock: !this.state.modalLock
        });
    }
    getToggleLock = () => {
        return this.state.modalLock;
    }
    toggleEdit = (item) => {
        if (item) this.setItem(item);
        this.setState({
            modalEdit: !this.state.modalEdit
        });
    }
    getToggleEdit = () => {
        return this.state.modalEdit;
    }
    getToggle_macro = () => {
        return this.state.modal_macro;
    }
    toggle_macro = (item) => {
        this.setState({
            modal_macro: !this.state.modal_macro,
        });
        if (item) this.setItem(item);
    }
    toggleManage = (item) => {
        if (item) this.setItem(item);
        this.setState({
            modalManage: !this.state.modalManage
        });
    }
    toggleEditable = (item) => {
        if (item) this.setItem(item);
        this.setState({
            modalEditable: !this.state.modalEditable
        });
    }
    funcion = () => {
        var x = this.state.editMaster == true
        return x
    }
    // END MODAL CONTROLS
    setItem(item) {
        this.setState({
            currentId: item.id,
            selectedRow: item.id,
            currentIdPublic: item.id_publico,
            currentIdGlobal: item.id_global,
            currentStatus: item.status,
        });
    }
    setItemAsign(item) {
        this.setState({
            currentItemAsign: item.id,
            currentId: item.id_master,
            selectedRow: item.id_master,
            currentIdPublic: item.id_public,
            currentIdGlobal: item.id_global,
        });
    }
    getFinalDate(item) {
        if (!item) return ""
        let startDate = item.legal
        let time = item.time;
        let endate = momentB(startDate, 'YYYY-MM-DD').businessAdd(time)._d;
        let parseDate = dateParser(endate)
        return parseDate;
    }
    navigation = (item, TO, FROM) => {

        switch (FROM) {
            case "general":
                this.toggleInfo(false)
                this.setState({ editMaster: false })
                break;
            case "edit":
                this.toggleEdit(false)
                break;
            case "start":
                this.toggleAsign(false)
                break;
            case "formal":
                this.toggleReply(false)
                break;
            case "informal":
                this.toggleInformal(false)
                break;
            case "lock":
                this.toggleLock(false)
                break;
            case "macro":
                this.toggle_macro(false)
                break;
            case "manage":
                this.toggleManage(false)
                this.setState({ editMaster: false })
                break;
            case "editable":
                this.toggleEditable(false)
                this.setState({ editMaster: false })
                break;

        }
        switch (TO) {
            case "general":
                this.toggleInfo(item)
                break;
            case "edit":
                this.toggleEdit(item)
                break;
            case "start":
                this.toggleAsign(item)
                break;
            case "informal":
                this.toggleInformal(item)
                break;
            case "formal":
                this.toggleReply(item)
                break;
            case "lock":
                this.toggleLock(item)
                break;
            case "macro":
                let base_date = moment(item.createdAt).format('YYYY-MM-DD');
                this.setState({
                    date_start: moment(base_date).subtract(6, 'months').format('YYYY-MM-DD'),
                    date_end: moment(base_date).add(6, 'months').format('YYYY-MM-DD')
                })
                this.toggle_macro(item)
                break;
            case "manage":
                this.toggleManage(item)
                break;
            case "editable":
                this.toggleEditable(item)
                break;
        }
    }
    // THIS FUNCTIONS IS CALLED BY THE CHILDREN COMPONENT TO TELL THE APP TO CLOSE THE MODAL AND REFRESH THE LIST
    // THIS FUNCTIONS RECIEVES THE NAME OF THE MODAL TO BE CLOSED
    refreshRequested() {
        this.setState({
            modalNew: false,
            modalAsign: false,
            modalInformal: false,
            modalReply: false,
            modalLock: false
        })
        this.refreshList();
    }
    refreshCurrentItem(id) {
        PQRS_Main.get(id).then(response => {
            let item = response.data
            this.setState({
                currentItem: item,
                currentVersion: item.version
            })
            this.retrievePublish();
        })
    }
    setSubtmitRows(items) {
        this.setState({ submitItems: items })
    }
    render() {
        const { translation, translation_form, swaMsg, globals, breadCrums } = this.props;
        const { currentItem, isLoaded, items } = this.state;

        // COMPONENTS
        let _REPLIES_COMPONENT = (item) => {
            var counter = 0;
            for (var i = 0; i < item.pqrs_workers.length; i++) {
                if (item.pqrs_workers[i].reply) {
                    counter++;
                }
            }
            return counter;
        }
        let _REPLIES_DATES_COMPONENT = (item) => {
            var _COMPONENT = [];
            for (var i = 0; i < item.pqrs_workers.length; i++) {
                if (item.pqrs_workers[i].reply) {
                    _COMPONENT.push(<p>{dateParser(item.pqrs_workers[i].date_reply)}</p>)
                }
            }
            return <>{_COMPONENT}</>;
        }
        let _STATUS_COMPONENT = (item) => {
            switch (item) {
                case 0:
                    return <label className="text-danger fw-bold">ACTIVO</label>
                case 1:
                    return <label className="text-success fw-bold">CERRADO</label>
                case 2:
                    return <label className="text-primary fw-bold">ARCHIVADO</label>
                case 3:
                    return <label className="text-secondary fw-bold">TRASLADADO</label>
                default:
                    break;
            }
        }
        let _GET_STOPLIGHT_COLOR = (row) => {
            if (!row) return <i class="fas fa-lightbulb fa-2x text-muted"></i>;
            let time = row.pqrs_time ? row.pqrs_time.time : 0;
            let legal = row.pqrs_time ? row.pqrs_time.legal : 0
            let ext = row.pqrs_law ? row.pqrs_law.extension ? 2 : 1 : 1;
            let days = dateParser_timeLeft(legal, time * (ext));
            if (days <= 0) return <i class="fas fa-lightbulb fa-2x text-danger"></i>
            if (days > 0 && days < 7) return <i class="fas fa-lightbulb fa-2x text-warning"></i>
            if (days >= 7) return <i class="fas fa-lightbulb fa-2x text-success"></i>
        }
        let _GET_STOPLIGHT_COLOR_ASSIGNED = (row) => {
            let days = dateParser_timeLeft(row.legal, row.time / 2);
            if (days <= 0) return <i class="fas fa-lightbulb fa-2x text-danger"></i>
            if (days > 0 && days < 7) return <i class="fas fa-lightbulb fa-2x text-warning"></i>
            if (days >= 7) return <i class="fas fa-lightbulb fa-2x text-success"></i>
        }
        let _CHECK_FOR_REVIEWS = (row) => {
            let _woerker_list = row.pqrs_workers;
            let length = row.pqrs_workers.length;
            let review = null;
            for (var i = 0; i < length; i++) {
                if (_woerker_list[i].worker_id == window.user.id) {
                    review = _woerker_list[i].feedback
                    break;
                }
            }
            if (review == 1) return <label className="text-success fw-bold">VISTO BUENO</label>;
            else if (review == 0) return <label className="text-warning fw-bold">VISTO NEGATIVO</label>;
            else if (review == null) return <label className="text-danger fw-bold">DEBE DAR VISTO</label>;
        }

        const dataFilter = (_items, _filterreply, _filterreply2) => {
            return _items.filter(it => {
                if (_filterreply && _filterreply2) {
                    for (var i = 0; i < it.pqrs_workers.length; i++) {
                        if (window.user.id == it.pqrs_workers[i].worker_id) {
                            if (it.pqrs_workers[i].reply == null) {
                                return true;
                            } if (it.pqrs_workers[i].feedback == null) {
                                return true;
                            } else {
                                return false;
                            }

                        }
                    }
                } else
                    if (_filterreply) {
                        for (var i = 0; i < it.pqrs_workers.length; i++) {
                            // console.log(it.pqrs_workers[i])
                            if (window.user.id == it.pqrs_workers[i].worker_id) {
                                if (it.pqrs_workers[i].reply == null) {
                                    return true;
                                } else {
                                    return false;
                                }

                            }
                        }

                    } else if (_filterreply2) {
                        for (var i = 0; i < it.pqrs_workers.length; i++) {
                            if (window.user.id == it.pqrs_workers[i].worker_id) {
                                if (it.pqrs_workers[i].feedback == null) {
                                    return true;
                                } else {
                                    return false;
                                }
                            }
                        }

                    } else {
                        return true;
                    }
            })

        }

        const PENDING_COMPONENT = () => (
            <div className="col-lg-11 col-md-12">
                <MDBTypography note noteColor="warning">

                    <div className="row">
                        <div className="col-10">
                            <label className="fw-bold">PQRS PENDIENTES POR VENTANILLA ÚNICA: </label>
                        </div>
                        <div className="col text-end">
                            <MDBTooltip title='Ver Listado' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1" className="">
                                <MDBBtn
                                    color="info"
                                    size="sm"
                                    onClick={() => this.setState({ pending_open: !this.state.pending_open })}
                                    className="px-2"
                                > <i class="fas fa-info-circle fa-2x"></i>
                                </MDBBtn>
                            </MDBTooltip>
                        </div>
                    </div>
                    <MDBCollapse id='pending_list' isOpen={this.state.pending_open}>
                        <div className="row">
                            <div className="col-10">
                                <ul>
                                    {this.state.pending.map((i) => <li>{i.id_pending}</li>)}
                                </ul>
                            </div>
                        </div>
                    </MDBCollapse>
                </MDBTypography >
            </div >
        )
        // -----------------
        const rowSelectedStyle = [
            {
                when: row => row.id == this.state.selectedRow,
                style: {
                    backgroundColor: 'BlanchedAlmond',
                },
            },
        ];
        // -----------------


        const columns = [
            {
                name: "",
                right: true,
                maxWidth: "40px",
                cell: row => <label>{_GET_STOPLIGHT_COLOR(row)}</label>
            },
            {
                name: <label>CONSECUTIVO ENTRADA</label>,
                selector: row => row.id_global ? row.id_global : row.id_publico ? row.id_publico : '',
                sortable: true,
                center: true,
                filterable: true,
                cell: row => <label>{row.id_global ? row.id_global : row.id_publico ? row.id_publico : <label className="fw-bold text-danger">SIN CONCENCUTIVO</label>}</label>
            },
            {
                name: <label>¿PROFESIONAL ASIGNADO?</label>,
                //center: true,
                cell: row => <label>{row.pqrs_workers.length ? <label>{row.pqrs_workers.map(function (value) { return <h5 className='my-0 py-0 fw-normal'>{value.name}</h5> })}</label> : <label className="fw-bold text-warning">PENDIENTE</label>}</label>
            },
            {
                name: <label>FECHA RADICACION</label>,
                selector: row => row.pqrs_time ? row.pqrs_time.legal : '',
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{(row.pqrs_time ? row.pqrs_time.legal : false)}</label>
            },
            {
                name: <label>TIEMPO RESTANTE</label>,
                selector: row => {
                    let time = row.pqrs_time ? row.pqrs_time.time : 0;
                    let legal = row.pqrs_time ? row.pqrs_time.legal : 0;
                    let ext = row.pqrs_law ? row.pqrs_law.extension ? 2 : 1 : 1;
                    let result = (dateParser_timeLeft(legal, time * (ext)))
                    return result
                },
                sortable: true,
                center: true,
                center: true,
                cell: row => {
                    let time = row.pqrs_time ? row.pqrs_time.time : 0;
                    let legal = row.pqrs_time ? row.pqrs_time.legal : 0;
                    let ext = row.pqrs_law ? row.pqrs_law.extension ? 2 : 1 : 1;
                    let result = (dateParser_timeLeft(legal, time * (ext)))
                    return <label>{result} d</label>
                }
            },
            {
                name: <label>FECHA LIMITE</label>,
                selector: row => {
                    let time = row.pqrs_time ? row.pqrs_time.time : 0;
                    let legal = row.pqrs_time ? row.pqrs_time.legal : 0;
                    let ext = row.pqrs_law ? row.pqrs_law.extension ? 2 : 1 : 1;
                    let result = (dateParser_finalDate(legal, time * (ext)))
                    return result
                },
                sortable: true,
                center: true,
                cell: row => {
                    let time = row.pqrs_time ? row.pqrs_time.time : 0;
                    let legal = row.pqrs_time ? row.pqrs_time.legal : 0;
                    let ext = row.pqrs_law ? row.pqrs_law.extension ? 2 : 1 : 1;
                    let result = (dateParser_finalDate(legal, time * (ext)))
                    return <label>{result}</label>
                }
            },
            {
                name: <label>ACCION</label>,
                button: true,
                center: true,
                minWidth: '150px',
                cell: row => <>
                    <MDBTooltip title='Informacion General' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 me-1" className="">
                        <button className="btn btn-sm btn-info m-0 px-2 shadow-none" onClick={() => this.toggleInfo(row)}><i class="far fa-eye"></i></button>
                    </MDBTooltip>
                    {window.user.roleId == 1 || window.user.roleId == 5 || window.user.roleId == 3
                        ? <>
                            <MDBTooltip title='Gestionar peticion' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 me-1" className="">
                                <button className="btn btn-success btn-sm m-0 px-2 shadow-none" onClick={() => this.toggleManage(row)}><i class="fas fa-cog"></i></button>
                            </MDBTooltip>
                        </> : ""}
                </>,
            },
        ]
        const columnsArchive = [
            {
                name: <h6>CONSECUTIVO ENTRADA</h6>,
                selector: row => row.id_publico ? row.id_publico : row.id_global ? row.id_global : '',
                sortable: true,
                filterable: true,
                cell: row => <label>{row.id_publico ? row.id_publico : row.id_global ? row.id_global : <label className="fw-bold text-danger">SIN CONCENCUTIVO</label>}</label>
            },
            {
                name: <h6>CONSECUTIVO SALIDA</h6>,
                selector: 'id_reply',
                sortable: true,
                filterable: true,
                cell: row => <label>{row.id_reply}</label>
            },
            {
                name: <h6>FECHA RADICACIÓN</h6>,
                selector: 'pqrs_time.legal',
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{dateParser(row.pqrs_time.legal) ?? ''}</label>

            },
            {
                name: <h6>FECHA LÍMITE RESPUESTA</h6>,
                minWidth: '150px',
                selector: row => dateParser_finalDate(row.pqrs_time.legal, row.pqrs_time.time * (row.pqrs_law.extension ? 2 : 1)),
                sortable: true,
                center: true,
                cell: row => <label>{dateParser(dateParser_finalDate(row.pqrs_time.legal, row.pqrs_time.time * (row.pqrs_law.extension ? 2 : 1)))}</label>
            },
            {
                name: <h6>FECHA ENVIO RESPUESTA </h6>,
                selector: 'pqrs_time.reply_formal',
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{dateParser(row.pqrs_time.reply_formal)}</label>
            },
            {
                name: <h6>TIEMPO REAL DE RESPUESTA</h6>,
                selector: row => dateParser_dateDiff(row.pqrs_time.legal, row.pqrs_time.reply_formal),
                sortable: true,
                center: true,
                cell: row => <label>{dateParser_dateDiff(row.pqrs_time.legal, row.pqrs_time.reply_formal) + ' | ' + (row.pqrs_time.time)} dia(s) habiles</label>
            },

            {
                name: <p>ACCION</p>,
                button: true,
                minWidth: '150px',
                center: true,
                cell: row => <>
                    <MDBTooltip title='Informacion General' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 me-1" className="">
                        <button className="btn btn-sm btn-info m-0 px-2 shadow-none" onClick={() => this.toggleInfo(row)}><i class="far fa-eye"></i></button>
                    </MDBTooltip>
                    {window.user.roleId == 1 || window.user.roleId == 5 || window.user.roleId == 3
                        ?
                        <PQRS_ACTION_REVIEW translation={translation} swaMsg={swaMsg} globals={globals}
                            currentItemId={row.id}
                            refreshList={this.refreshList}
                        />
                        : ""}

                </>,
            },
        ]
        const columnsSearch = [
            {
                name: <label>CONSECUTIVO ENTRADA</label>,
                selector: row => row.id_publico ? row.id_publico : row.id_global ? row.id_global : '',
                sortable: true,
                filterable: true,
                cell: row => <label>{row.id_publico ? row.id_publico : row.id_global ? row.id_global : <label className="fw-bold text-danger">SIN CONCENCUTIVO</label>}</label>
            },
            {
                name: <label>CONSECUTIVO SALIDA</label>,
                selector: 'id_reply',
                sortable: true,
                filterable: true,
                cell: row => <label>{row.id_reply}</label>
            },
            {
                name: <label>ESTADO</label>,
                selector: 'status',
                sortable: true,
                filterable: true,
                cell: row => <label>{_STATUS_COMPONENT(row.status)}</label>
            },
            {
                name: <label>FECHA RADICACION</label>,
                selector: 'pqrs_time.reply_legal',
                sortable: true,
                filterable: true,
                cell: row => <label>{row.pqrs_time ? dateParser(row.pqrs_time.legal) : ''}</label>
            },
            {
                name: <label className="text-center">FECHA LIMITE RESPUESTA</label>,
                selector: 'pqrs_time.legal',
                sortable: true,

                cell: row => <label>{row.pqrs_time ? dateParser(dateParser_finalDate(row.pqrs_time.legal, row.pqrs_time.time * (row.pqrs_law.extension ? 2 : 1))) : ''}</label>

            },
            {
                name: <label>ACCION</label>,
                button: true,
                minWidth: '150px',
                cell: row => <MDBTooltip title='Informacion General' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 me-1" className="">
                    <button className="btn btn-sm btn-info m-0 px-2 shadow-none" onClick={() => this.toggleInfo(row)}><i class="far fa-eye "></i></button>

                </MDBTooltip>,

            },
        ]
        // CUSTOM STYLES FOR THE MODAL
        const customStyles = {
            overlay: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.75)',
                zIndex: 2
            },
            content: {
                position: 'absolute',
                top: '40px',
                left: '15%',
                right: '5%',
                bottom: '40px',
                border: '1px solid #ccc',
                overflow: 'auto',
                WebkitOverflowScrolling: 'touch',
                borderRadius: '4px',
                outline: 'none',
                padding: '20px',
                marginRight: 'auto',
            }
        };
        const customStylesForModalMacro = {
            overlay: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.75)',
                zIndex: 2,
            },
            content: {
                position: 'absolute',
                top: '0px',
                left: '0px',
                right: '0px',
                bottom: '0px',
                border: '1px solid #ccc',
                overflow: 'auto',
                WebkitOverflowScrolling: 'touch',
                borderRadius: '4px',
                outline: 'none',
                padding: '20px',
                width: 'auto',
            }
        };
        //NAVIGATION
        const handleFillClick = (state) => {
            if (state === this.state.fillActive) {
                return;
            }
            this.setState({ fillActive: state });
        };
        const handleFillClick2 = (state) => {
            if (state === this.state.fillActive) {
                return;
            }
            this.setState({ fillActive: state });
        };


        var formData = new FormData();

        let search = (event) => {
            event.preventDefault();
            formData = new FormData();
            let search_field = document.getElementById("search_0").value;
            formData.set('search_field', search_field);
            let serach_str = document.getElementById("search_1").value;
            formData.set('serach_str', serach_str);
            if (serach_str) {
                MySwal.fire({
                    title: swaMsg.title_wait,
                    text: swaMsg.text_wait,
                    icon: 'info',
                    showConfirmButton: false,
                });
                PQRS_Main.search(formData)
                    .then(response => {
                        //this.asignLists(response.data);
                        // this.asignListsWorkers(response.data);
                        this.setState({
                            itemsSearch: response.data,
                            isloadedSearch: true,
                        });
                        MySwal.close();
                    })
                    .catch(e => {
                        console.log(e);
                    });
            } else {
                this.refreshList();
                this.setState({
                    itemsSearch: [],
                    isloadedSearch: false,
                })
            }
        }
        let loadMacro = (event) => {
            event.preventDefault();
            this.toggle_macro();
            let date_a = document.getElementById("load_macro_date_1").value;
            let date_b = document.getElementById("load_macro_date_2").value;
            var date_start = date_a;
            var date_end = date_b;
            if (moment(date_a).diff(date_b) >= 0) {
                date_start = date_b;
                date_end = date_a;
            }
            this.setState({ date_start: date_start });
            this.setState({ date_end: date_end })
        }
        return (
            <div className="Publish container">
                <div className="row my-4 d-flex justify-content-center">
                    <MDBBreadcrumb className="mx-5">
                        <MDBBreadcrumbItem>
                            <Link to={'/home'}><i class="fas fa-home"></i> <label className="text-uppercase">{breadCrums.bc_01}</label></Link>
                        </MDBBreadcrumbItem>
                        <MDBBreadcrumbItem>
                            <Link to={'/dashboard'}><i class="far fa-bookmark"></i> <label className="text-uppercase">{breadCrums.bc_u1}</label></Link>
                        </MDBBreadcrumbItem>
                        <MDBBreadcrumbItem active><i class="fas fa-file-alt"></i>  <label className="text-uppercase">{breadCrums.bc_u7}</label></MDBBreadcrumbItem>
                    </MDBBreadcrumb>


                    {this.state.pending.length > 0 ? PENDING_COMPONENT() : ''}

                    <div className="col-lg-11 col-md-12">
                        <h1 className="text-center my-4">GESTIÓN DE PQRS Y SOLICITUDES</h1>
                        <hr />
                        <MDBRow>
                            <h2 class="text-uppercase text-center pb-2">ACCIONES</h2>
                            <MDBCol md="4">
                                <MDBCard className="bg-card mb-3">
                                    <MDBCardBody>
                                        <MDBCardTitle className="text-center"> <h4>GENERAR PQRS</h4></MDBCardTitle>
                                        <p className="app-text-primary text-justify"> Permite la digitalizcion de una solicitud PQRS</p>
                                        <div className="text-center py-4 mt-3">
                                            <button className="btn btn-lg btn-success" onClick={() => this.toggle()}><i class="fas fa-folder-plus"></i> NUEVA SOLICITUD </button>
                                        </div>
                                    </MDBCardBody>
                                </MDBCard>
                            </MDBCol>
                            <MDBCol md="4">
                                <MDBCard className="bg-card mb-3">
                                    <MDBCardBody>
                                        <MDBCardTitle className="text-center"> <h4>CONSULTAR PQRS</h4></MDBCardTitle>
                                        <form onSubmit={search} id="app-form">
                                            <div class="input-group mb-3">
                                                <span class="input-group-text bg-info text-white">
                                                    <i class="fas fa-info-circle"></i>
                                                </span>
                                                <select class="form-select" id="search_0" required>
                                                    <option value="1">Consecutivo Entrada</option>
                                                    <option value="2">Consecutivo de Salida</option>
                                                    <option value="3">Numero de radicación de Licencia</option>
                                                    <option value="4">Nombre de Peticionario</option>
                                                    <option value="5">Numero de Documento (C.C, NIT)</option>
                                                    <option value="6">Profesional Asignado</option>
                                                </select>
                                            </div>
                                            <div class="input-group mb-3">
                                                <span class="input-group-text bg-info text-white">
                                                    <i class="far fa-comment-dots"></i>
                                                </span>
                                                <input type="text" class="form-control" id="search_1" />
                                            </div>
                                            <div className="text-center py-4 mt-3">
                                                <button className="btn btn-lg btn-secondary"><i class="fas fa-search-plus"></i> CONSULTAR </button>
                                            </div>
                                        </form>
                                    </MDBCardBody>
                                </MDBCard>
                            </MDBCol>
                            <MDBCol md="4">
                                <MDBCard className="bg-card mb-3">
                                    <MDBCardBody>
                                        <MDBCardTitle className="text-center"> <h4>MACRO TABLA</h4></MDBCardTitle>
                                        <form onSubmit={loadMacro} id="fun_form_macro_table_pqrs">
                                            <div class="input-group mb-3">
                                                <span class="input-group-text bg-info text-white">
                                                    <i class="far fa-calendar-alt"></i>
                                                </span>
                                                <input type="date" class="form-control" id="load_macro_date_1" required
                                                    defaultValue={moment().subtract(6, 'months').format('YYYY-MM-DD')} />
                                            </div>
                                            <div class="input-group mb-3">
                                                <span class="input-group-text bg-info text-white">
                                                    <i class="far fa-calendar-alt"></i>
                                                </span>
                                                <input type="date" class="form-control" id="load_macro_date_2" required
                                                    defaultValue={moment().format('YYYY-MM-DD')} />
                                            </div>
                                            <div className="text-center py-4 mt-3">
                                                <button className="btn btn-lg btn-danger"><i class="fas fa-th"></i> CARGAR </button>
                                            </div>
                                        </form>
                                    </MDBCardBody>
                                </MDBCard>
                            </MDBCol>
                        </MDBRow>
                    </div>




                    <div className="row d-flex justify-content-center">
                        <div className="col-11">
                            {this.state.isloadedSearch ? (<>
                                <h2 class="text-uppercase text-center pb-2">RESULTADO DE LA BUSQUEDA <img src={IMG_SEARCH_ICON} class="" height="75px" alt="..." /></h2>

                                <DataTable
                                    title="TABLA DE BÚSQUEDA"
                                    paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                                    noDataComponent="No hay mensajes"
                                    striped="true"
                                    columns={columnsSearch}
                                    data={this.state.itemsSearch}
                                    highlightOnHover
                                    pagination
                                    paginationPerPage={20}
                                    paginationRowsPerPageOptions={[20, 50, 100]}
                                    className="data-table-component"
                                    Header
                                    onRowClicked={(e) => this.setState({ selectedRow: e.id })}
                                    conditionalRowStyles={rowSelectedStyle}
                                /></>
                            ) : ""}
                        </div>
                    </div>

                    <MDBTabs fill pills className='mb-3'>
                        <MDBTabsItem>
                            <MDBTabsLink onClick={() => handleFillClick('1')} active={this.state.fillActive === '1'}>
                                <label className="upper-case">PETICIONES ACTIVAS ({items.length})</label>
                            </MDBTabsLink>
                        </MDBTabsItem>
                        <MDBTabsItem>
                            <MDBTabsLink onClick={() => handleFillClick('10')} active={this.state.fillActive === '10'}>
                                <label className="upper-case">ARCHIVO ({this.state.itemsClose.length})</label>
                            </MDBTabsLink>
                        </MDBTabsItem>
                    </MDBTabs>


                    <MDBTabsContent>
                        <MDBTabsPane show={this.state.fillActive === '1'}>
                            {isLoaded ? <>
                                <div class="row">
                                    <div className='col ms-5 mb-3'>
                                        <MDBBtnGroup >
                                            <MDBBtn outline={!this.state.filterreply} onClick={() => this.setState({ filterreply: !this.state.filterreply })} size='sm'>VER POR RESPONDER: {dataFilter(items, true, false).length}</MDBBtn>
                                            <MDBBtn outline={!this.state.filterreply2} onClick={() => this.setState({ filterreply2: !this.state.filterreply2 })} size='sm'>VER POR VISTO BUENO: {dataFilter(items, false, true).length}</MDBBtn>
                                        </MDBBtnGroup>
                                    </div>
                                </div>
                                <DataTable
                                    title="Lista de peticiones activas"
                                    paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                                    noDataComponent="No hay mensajes"
                                    striped="true"
                                    columns={columns}
                                    data={dataFilter(items, this.state.filterreply, this.state.filterreply2)}
                                    highlightOnHover
                                    pagination
                                    paginationPerPage={20}
                                    paginationRowsPerPageOptions={[20, 50, 100]}
                                    className="data-table-component"
                                    Header
                                    onRowClicked={(e) => this.setState({ selectedRow: e.id })}
                                    conditionalRowStyles={rowSelectedStyle}
                                    dense
                                    defaultSortFieldId={1}
                                    defaultSortAsc
                                />
                            </> :
                                <div>
                                    <h4>No Data Retrieved</h4>
                                </div>}
                        </MDBTabsPane>
                        <MDBTabsPane show={this.state.fillActive === '10'}>
                            {isLoaded ? <>
                                <DataTable
                                    title="Lista de peticiones archivadas"
                                    paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                                    noDataComponent="No hay mensajes"
                                    striped="true"
                                    columns={columnsArchive}
                                    data={this.state.itemsClose}
                                    highlightOnHover
                                    pagination
                                    paginationPerPage={20}
                                    paginationRowsPerPageOptions={[20, 50, 100]}
                                    className="data-table-component"
                                    Header
                                    onRowClicked={(e) => this.setState({ selectedRow: e.id })}
                                    conditionalRowStyles={rowSelectedStyle}
                                    dense
                                    defaultSortFieldId={1}
                                    defaultSortAsc
                                />
                            </> :
                                <div>
                                    <h4>No Data Retrieved</h4>
                                </div>}
                        </MDBTabsPane>

                    </MDBTabsContent>



                    <Modal contentLabel="GENERAR SOLCITUD PQRS"
                        isOpen={this.state.modalNew}
                        style={customStyles}
                        ariaHideApp={false}
                    >
                        <div className="my-4 d-flex justify-content-between">
                            <h2>CREAR NUEVA PETICIÓN</h2>

                            <div className='btn-close' color='none' onClick={() => this.toggle()}></div>
                        </div>
                        <hr />
                        <PQRSNEW
                            translation={translation}
                            swaMsg={swaMsg}
                            globals={globals}
                            translation_form={translation_form}
                            refreshRequested={this.refreshRequested} />
                        <hr />
                        <div className="text-end py-4 mt-3">
                            <button className="btn btn-lg btn-info" onClick={() => this.toggle()}><i class="fas fa-times-circle"></i> CERRAR </button>
                        </div>
                    </Modal>

                    <Modal contentLabel="INFORMACION PQRS"
                        isOpen={this.state.modalInfo}
                        style={customStyles}
                        ariaHideApp={false}
                    >
                        <div className="my-4 d-flex justify-content-between">
                            <h3>INFORMACION PQRS - {this.state.currentIdPublic}</h3>
                            <div className='btn-close' color='none' onClick={() => this.toggleInfo()}></div>
                        </div>
                        <hr />
                        <PQRSINFO
                            ranslation={translation}
                            swaMsg={swaMsg}
                            globals={globals}
                            translation_form={translation_form}
                            currentId={this.state.currentId}
                            NAVIGATION={this.navigation} />
                        <hr />
                        <div className="text-end py-4 mt-3">
                            <button className="btn btn-lg btn-info" onClick={() => this.toggleInfo()}><i class="fas fa-times-circle"></i> CERRAR </button>
                        </div>
                    </Modal>

                    <Modal contentLabel="ASIGNAR PROFESIONALES PQRS"
                        isOpen={this.state.modalAsign}
                        style={customStyles}
                        ariaHideApp={false}
                    >
                        <div className="my-4 d-flex justify-content-between">
                            <h3>ASIGNAR PROFESIONALES -  {this.state.currentIdPublic}</h3>
                            <div className='btn-close' color='none' onClick={() => this.toggleAsign()}></div>
                        </div>
                        <hr />
                        <PQRSASIGN
                            ranslation={translation}
                            swaMsg={swaMsg}
                            globals={globals}
                            translation_form={translation_form}
                            currentId={this.state.currentId}
                            refreshList={this.refreshList}
                            NAVIGATION={this.navigation} />
                        <hr />
                        <div className="text-end py-4 mt-3">
                            <button className="btn btn-lg btn-info" onClick={() => this.toggleAsign()}><i class="fas fa-times-circle"></i> CERRAR </button>
                        </div>
                    </Modal>

                    <Modal contentLabel="RESPUESTA PROFESIONAL PQRS"
                        isOpen={this.state.modalInformal}
                        style={customStyles}
                        ariaHideApp={false}
                    >
                        <div className="my-4 d-flex justify-content-between">
                            <h3>RESPUESTA PROFESIONAL -  {this.state.currentIdPublic}</h3>
                            <div className='btn-close' color='none' onClick={() => this.toggleInformal()}></div>
                        </div>
                        <hr />
                        <PQRSINFORMAL
                            ranslation={translation}
                            swaMsg={swaMsg}
                            globals={globals}
                            translation_form={translation_form}
                            currentId={this.state.currentId}
                            refreshList={this.refreshList}
                            currentItemAsign={this.state.currentItemAsign}
                            NAVIGATION={this.navigation}
                            closeModal={() => this.toggleInformal()} />
                        <hr />
                        <div className="text-end py-4 mt-3">
                            <button className="btn btn-lg btn-info" onClick={() => this.toggleInformal()}><i class="fas fa-times-circle"></i> CERRAR </button>
                        </div>
                    </Modal>

                    <Modal contentLabel="RESPONDER PETICION PQRS"
                        isOpen={this.state.modalReply}
                        style={customStyles}
                        ariaHideApp={false}
                    >
                        <div className="my-4 d-flex justify-content-between">
                            <h3>RESPONDER A PETICION -  {this.state.currentIdPublic}</h3>
                            <div className='btn-close' color='none' onClick={() => this.toggleReply()}></div>
                        </div>
                        <hr />
                        <PQRSREPLY
                            ranslation={translation}
                            swaMsg={swaMsg}
                            globals={globals}
                            translation_form={translation_form}
                            currentId={this.state.currentId}
                            refreshList={this.refreshList}
                            NAVIGATION={this.navigation}
                            closeModal={() => this.toggleReply()} />
                        <hr />
                        <div className="text-end py-4 mt-3">
                            <button className="btn btn-lg btn-info" onClick={() => this.toggleReply()}><i class="fas fa-times-circle"></i> CERRAR </button>
                        </div>
                    </Modal>

                    <Modal contentLabel="CERRAR PQRS"
                        isOpen={this.state.modalLock}
                        style={customStyles}
                        ariaHideApp={false}
                    >
                        <div className="my-4 d-flex justify-content-between">
                            <h3>CERRAR PETICION -  {this.state.currentIdPublic}</h3>
                            <div className='btn-close' color='none' onClick={() => this.toggleLock()}></div>
                        </div>
                        <hr />
                        <PQRSLOCK
                            ranslation={translation}
                            swaMsg={swaMsg}
                            globals={globals}
                            translation_form={translation_form}
                            currentId={this.state.currentId}
                            refreshList={this.refreshList}
                            NAVIGATION={this.navigation} />
                        <hr />
                        <div className="text-end py-4 mt-3">
                            <button className="btn btn-lg btn-info" onClick={() => this.toggleLock()}><i class="fas fa-times-circle"></i> CERRAR </button>
                        </div>
                    </Modal>

                    <Modal contentLabel="EDIT PQRS"
                        isOpen={this.state.modalEdit}
                        style={customStyles}
                        ariaHideApp={false}
                    >
                        <div className="my-4 d-flex justify-content-between">
                            <h3>MODIFICAR PETICION -  {this.state.currentIdPublic}</h3>
                            <div className='btn-close' color='none' onClick={() => this.toggleEdit()}></div>
                        </div>
                        <hr />
                        <PQRS_EDIT
                            ranslation={translation}
                            swaMsg={swaMsg}
                            globals={globals}
                            translation_form={translation_form}
                            currentId={this.state.currentId}
                            refreshList={this.refreshList}
                            NAVIGATION={this.navigation} />
                        <hr />
                        <div className="text-end py-4 mt-3">
                            <button className="btn btn-lg btn-info" onClick={() => this.toggleEdit()}><i class="fas fa-times-circle"></i> CERRAR </button>
                        </div>
                    </Modal>
                    <Modal contentLabel="MANAGE PQRS"
                        isOpen={this.state.modalManage}
                        style={customStyles}
                        ariaHideApp={false}
                    >
                        <div className="my-4 d-flex justify-content-between">
                            <h3>GESTIONAR PETICION -  {this.state.currentIdGlobal || this.state.currentIdPublic}</h3>
                            <div className='btn-close' color='none' onClick={() => this.toggleManage()}></div>
                        </div>
                        <hr />
                        <PQRS_MANAGE_COMPONENT
                            translation={translation}
                            swaMsg={swaMsg}
                            globals={globals}
                            currentId={this.state.currentId}
                            refreshList={this.refreshList}
                            NAVIGATION={this.navigation}
                            closeModal={this.toggleManage}
                            translation_form={translation_form}
                            retrievePublish={this.retrievePublish}
                        />

                        <div className="text-end py-4 mt-3">
                            <button className="btn btn-lg btn-info" onClick={() => this.toggleManage()}><i class="fas fa-times-circle"></i> CERRAR </button>
                        </div>
                    </Modal>
                    <Modal contentLabel="EDIT PQRS"
                        isOpen={this.state.modalEditable}
                        style={customStyles}
                        ariaHideApp={false}
                    >
                        <div className="my-4 d-flex justify-content-between">
                            <h3>EDITAR PETICION -  {this.state.currentIdGlobal || this.state.currentIdPublic}</h3>
                            <div className='btn-close' color='none' onClick={() => this.toggleEditable()}></div>
                        </div>
                        <hr />
                        {this.state.editMaster == true ?
                            <PQRS_MANAGE_COMPONENT
                                translation={translation}
                                swaMsg={swaMsg}
                                globals={globals}
                                currentId={this.state.currentId}
                                refreshList={this.refreshList}
                                NAVIGATION={this.navigation}
                                closeModal={this.toggleEditable}
                                translation_form={translation_form}
                                retrievePublish={this.retrievePublish}
                            /> :
                            <ACESS_EDIT
                                swaMsg={swaMsg}
                                editMaster1={() => this.setState({ editMaster: !this.state.editMaster })}
                                NAVIGATION={this.navigation}
                                translation={translation}
                                currentId={this.state.currentId}
                            />
                        }
                        <div className="text-end py-4 mt-3">
                            <button className="btn btn-lg btn-info" onClick={() => this.toggleEditable()}><i class="fas fa-times-circle"></i> CERRAR </button>
                        </div>
                    </Modal>

                    <Modal contentLabel="MACRO TABLE"
                        isOpen={this.state.modal_macro}
                        style={customStylesForModalMacro}
                        ariaHideApp={false}
                    >
                        <div className="my-4 d-flex justify-content-between">
                            <label><i class="fas fa-th"></i> Macro tabla de seguimiento: Desde {dateParser(this.state.date_start)} hasta {dateParser(this.state.date_end)}</label>
                            <MDBBtn className='btn-close' color='none' onClick={() => this.toggle_macro()}></MDBBtn>
                        </div>

                        <PQRS_MACROTABLE translation={translation} swaMsg={swaMsg} globals={globals}
                            closeModal={this.toggle_macro}
                            NAVIGATION={this.navigation}
                            NAVIGATION_GEN={this.toggleInfo}
                            date_start={this.state.date_start}
                            date_end={this.state.date_end}
                            selectedRow={this.state.selectedRow}
                            setSelectedRow={(id) => this.setState({ selectedRow: id })}
                        />

                    </Modal>

                </div >
            </div >
        );
    }
}

export default PQRSADMIN;