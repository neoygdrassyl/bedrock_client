import { useState, useEffect, useCallback } from 'react';
import { MDBRow, MDBCol, MDBCard, MDBCardBody, MDBCardTitle, MDBBreadcrumb, MDBBreadcrumbItem, MDBTooltip, MDBBtn, MDBTabs, MDBTabsItem, MDBTabsLink, MDBTabsPane, MDBTabsContent, MDBBtnGroup, MDBTypography } from '../../../components/ui';
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

// JSONS
import dayjs from 'dayjs';
import { DiasHabilesColombia } from '../../../utils/BusinessDaysCol';
const MySwal = withReactContent(Swal);

function PQRSADMIN({ translation, translation_form, swaMsg, globals, breadCrums }) {
    // State
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLoadedAsign, setIsLoadedAsign] = useState(false);
    const [isLoadedReply, setIsLoadedReply] = useState(false);
    const [isloadedFormal, setIsloadedFormal] = useState(false);
    const [isloadedSearch, setIsloadedSearch] = useState(false);

    const [currentItem, setCurrentItem] = useState(null);
    const [currentItemAsign, setCurrentItemAsign] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(-1);

    const [items, setItems] = useState([]);
    const [itemsAsigned, setItemsAsigned] = useState([]);
    const [itemsReply, setItemsReply] = useState([]);
    const [itemsFormal, setItemsFormal] = useState([]);
    const [itemsClose, setItemsClose] = useState([]);
    const [itemsGeneral, setItemsGeneral] = useState([]);
    const [itemsGeneral2, setItemsGeneral2] = useState([]);
    const [itemsSearch, setItemsSearch] = useState([]);

    const [modalNew, setModalNew] = useState(false);
    const [modalInfo, setModalInfo] = useState(false);
    const [modalAsign, setModalAsign] = useState(false);
    const [modalInformal, setModalInformal] = useState(false);
    const [modalReply, setModalReply] = useState(false);
    const [modalLock, setModalLock] = useState(false);
    const [modalEdit, setModalEdit] = useState(false);
    const [modal_macro, setModal_macro] = useState(false);
    const [modalManage, setModalManage] = useState(false);
    const [modalEditable, setModalEditable] = useState(false);
    const [editMaster, setEditMaster] = useState(false);

    const [submitItems, setSubmitItemsState] = useState([]);
    const [fillActive, setFillActive] = useState('1');
    const [filterreply, setFilterreply] = useState(false);
    const [filterreply2, setFilterreply2] = useState(false);

    const [pending, setPending] = useState([]);
    const [pending_open, setPending_open] = useState(false);

    // Additional state from setItem / setItemAsign / refreshCurrentItem / navigation
    const [currentId, setCurrentId] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);
    const [currentIdPublic, setCurrentIdPublic] = useState(null);
    const [currentIdGlobal, setCurrentIdGlobal] = useState(null);
    const [currentStatus, setCurrentStatus] = useState(null);
    const [currentVersion, setCurrentVersion] = useState(null);
    const [date_start, setDate_start] = useState(null);
    const [date_end, setDate_end] = useState(null);

    // --- Methods ---

    const asignListsLock = (_LIST) => {
        let listNotReplyTo = [];
        for (var i = 0; i < _LIST.length; i++) {
            if (_LIST[i].pqrs_workers) {
                for (var j = 0; j < _LIST[i].pqrs_workers.length; j++) {
                    let worker = _LIST[i].pqrs_workers[j]
                    if (worker.worker_id == window.user.id || (window.user.roleId == 1 || window.user.roleId == 5 || window.user.roleId == 3 || window.user.roleId == 2)) {
                        listNotReplyTo.push(_LIST[i])
                        break;
                    }
                }
            }
        }
        setItemsFormal(listNotReplyTo);
        setIsLoadedAsign(true);
    };

    const asignLists = (_LIST) => {
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
        asignListsLock(listFormal);
        setItems(littNoAsigned);
        setItemsClose(listClose);
        setIsLoaded(true);
    };

    const asignListsWorkers = (_LIST) => {
        let listNotReplyTo = [];
        for (var i = 0; i < _LIST.length; i++) {
            if (_LIST[i].pqrs_workers) {
                for (var j = 0; j < _LIST[i].pqrs_workers.length; j++) {
                    let worker = _LIST[i].pqrs_workers[j]
                    if ((!worker.reply && worker.worker_id == window.user.id) || (!worker.reply && (window.user.roleId == 1 || window.user.roleId == 5 || window.user.roleId == 3 || window.user.roleId == 2))) {
                        worker.id_master = _LIST[i].id;
                        worker.id_public = _LIST[i].id_publico;
                        worker.time = _LIST[i].pqrs_time.time;
                        worker.legal = _LIST[i].pqrs_time.legal;
                        listNotReplyTo.push(worker)
                    }
                }
            }
        }
        setItemsAsigned(listNotReplyTo);
        setIsLoadedAsign(true);
    };

    const retrievePublish = useCallback(() => {
        PQRS_Main.getAllPqrs()
            .then(response => {
                setItemsGeneral(response.data);
                asignLists(response.data);
                asignListsWorkers(response.data);
            })
            .catch(e => {
                console.log(e);
            });
    }, []);

    const retrievePending = useCallback(() => {
        PQRS_Main.getAllPqrsPending()
            .then(response => {
                setPending(response.data);
            })
            .catch(e => {
                console.log(e);
            });
    }, []);

    const refreshList = useCallback(() => {
        retrievePending();
        retrievePublish();
        setCurrentItem(null);
        setCurrentIndex(-1);
    }, [retrievePending, retrievePublish]);

    // MODAL CONTROLS
    const toggle = () => {
        setModalNew(prev => !prev);
    };
    const getToggle = () => {
        return modalNew;
    };

    const setItemState = (item) => {
        setCurrentId(item.id);
        setSelectedRow(item.id);
        setCurrentIdPublic(item.id_publico);
        setCurrentIdGlobal(item.id_global);
        setCurrentStatus(item.status);
    };

    const setItemAsignState = (item) => {
        setCurrentItemAsign(item.id);
        setCurrentId(item.id_master);
        setSelectedRow(item.id_master);
        setCurrentIdPublic(item.id_public);
        setCurrentIdGlobal(item.id_global);
    };

    const toggleInfo = (item) => {
        if (item) setItemState(item);
        setModalInfo(prev => !prev);
        setModal_macro(false);
    };
    const getToggleInfo = () => {
        return modalInfo;
    };
    const toggleInfo2 = (item) => {
        if (item) setItemAsignState(item);
        setModalInfo(prev => !prev);
        setModal_macro(false);
    };
    const toggleAsign = (item) => {
        if (item) setItemState(item);
        setModalAsign(prev => !prev);
    };
    const getToggleAsign = () => {
        return modalAsign;
    };
    const toggleInformal = (item) => {
        if (item) {
            setItemAsignState(item);
        }
        setModalInformal(prev => !prev);
    };
    const getToggleInformal = () => {
        return modalInformal;
    };
    const toggleReply = (item) => {
        if (item) setItemState(item);
        setModalReply(prev => !prev);
    };
    const getToggleReply = () => {
        return modalReply;
    };
    const toggleLock = (item) => {
        if (item) setItemState(item);
        setModalLock(prev => !prev);
    };
    const getToggleLock = () => {
        return modalLock;
    };
    const toggleEdit = (item) => {
        if (item) setItemState(item);
        setModalEdit(prev => !prev);
    };
    const getToggleEdit = () => {
        return modalEdit;
    };
    const getToggle_macro = () => {
        return modal_macro;
    };
    const toggle_macro = (item) => {
        setModal_macro(prev => !prev);
        if (item) setItemState(item);
    };
    const toggleManage = (item) => {
        if (item) setItemState(item);
        setModalManage(prev => !prev);
    };
    const toggleEditable = (item) => {
        if (item) setItemState(item);
        setModalEditable(prev => !prev);
    };
    const funcion = () => {
        var x = editMaster == true;
        return x;
    };
    // END MODAL CONTROLS

    const getFinalDate = (item) => {
        if (!item) return ""
        let startDate = item.legal
        let time = item.time;
        const _bd = new DiasHabilesColombia();
        let endate = _bd.sumarDiasHabiles(startDate, time);
        let parseDate = dateParser(endate)
        return parseDate;
    };

    const navigation = (item, TO, FROM) => {
        switch (FROM) {
            case "general":
                toggleInfo(false);
                setEditMaster(false);
                break;
            case "edit":
                toggleEdit(false);
                break;
            case "start":
                toggleAsign(false);
                break;
            case "formal":
                toggleReply(false);
                break;
            case "informal":
                toggleInformal(false);
                break;
            case "lock":
                toggleLock(false);
                break;
            case "macro":
                toggle_macro(false);
                break;
            case "manage":
                toggleManage(false);
                setEditMaster(false);
                break;
            case "editable":
                toggleEditable(false);
                setEditMaster(false);
                break;
        }
        switch (TO) {
            case "general":
                toggleInfo(item);
                break;
            case "edit":
                toggleEdit(item);
                break;
            case "start":
                toggleAsign(item);
                break;
            case "informal":
                toggleInformal(item);
                break;
            case "formal":
                toggleReply(item);
                break;
            case "lock":
                toggleLock(item);
                break;
            case "macro":
                let base_date = dayjs(item.createdAt).format('YYYY-MM-DD');
                setDate_start(dayjs(base_date).subtract(6, 'months').format('YYYY-MM-DD'));
                setDate_end(dayjs(base_date).add(6, 'months').format('YYYY-MM-DD'));
                toggle_macro(item);
                break;
            case "manage":
                toggleManage(item);
                break;
            case "editable":
                toggleEditable(item);
                break;
        }
    };

    // THIS FUNCTIONS IS CALLED BY THE CHILDREN COMPONENT TO TELL THE APP TO CLOSE THE MODAL AND REFRESH THE LIST
    // THIS FUNCTIONS RECIEVES THE NAME OF THE MODAL TO BE CLOSED
    const refreshRequested = () => {
        setModalNew(false);
        setModalAsign(false);
        setModalInformal(false);
        setModalReply(false);
        setModalLock(false);
        refreshList();
    };

    const refreshCurrentItem = useCallback((id) => {
        PQRS_Main.get(id).then(response => {
            let item = response.data;
            setCurrentItem(item);
            setCurrentVersion(item.version);
            retrievePublish();
        });
    }, [retrievePublish]);

    const setSubtmitRows = (rowItems) => {
        setSubmitItemsState(rowItems);
    };

    // componentDidMount
    useEffect(() => {
        retrievePublish();
        retrievePending();
    }, []);

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
        if (!row) return <i className="fas fa-lightbulb fa-2x text-muted"></i>;
        let time = row.pqrs_time ? row.pqrs_time.time : 0;
        let legal = row.pqrs_time ? row.pqrs_time.legal : 0
        let ext = row.pqrs_law ? row.pqrs_law.extension ? 2 : 1 : 1;
        let days = dateParser_timeLeft(legal, time * (ext));
        if (days <= 0) return <i className="fas fa-lightbulb fa-2x text-danger"></i>
        if (days > 0 && days < 7) return <i className="fas fa-lightbulb fa-2x text-warning"></i>
        if (days >= 7) return <i className="fas fa-lightbulb fa-2x text-success"></i>
    }
    let _GET_STOPLIGHT_COLOR_ASSIGNED = (row) => {
        let days = dateParser_timeLeft(row.legal, row.time / 2);
        if (days <= 0) return <i className="fas fa-lightbulb fa-2x text-danger"></i>
        if (days > 0 && days < 7) return <i className="fas fa-lightbulb fa-2x text-warning"></i>
        if (days >= 7) return <i className="fas fa-lightbulb fa-2x text-success"></i>
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
                                onClick={() => setPending_open(prev => !prev)}
                                className="px-2"
                            > <i className="fas fa-info-circle fa-2x"></i>
                            </MDBBtn>
                        </MDBTooltip>
                    </div>
                </div>
                {pending_open && (
                    <div className="row">
                        <div className="col-10">
                            <ul>
                                {pending.map((i) => <li>{i.id_pending}</li>)}
                            </ul>
                        </div>
                    </div>
                )}
            </MDBTypography >
        </div >
    )
    // -----------------
    const rowSelectedStyle = [
        {
            when: row => row.id == selectedRow,
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
            cell: row => <label>{row.id_global ? row.id_global : row.id_publico ? row.id_publico : <label className="fw-bold text-danger">SIN CONSECUTIVO</label>}</label>
        },
        {
            name: <label>¿PROFESIONAL ASIGNADO?</label>,
            //center: true,
            cell: row => <label>{row.pqrs_workers.length ? <label>{row.pqrs_workers.map(function (value) { return <h5 className='my-0 py-0 fw-normal'>{value.name}</h5> })}</label> : <label className="fw-bold text-warning">PENDIENTE</label>}</label>
        },
        {
            name: <label>FECHA RADICACIÓN</label>,
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
            name: <label>ACCIÓN</label>,
            button: true,
            center: true,
            minWidth: '150px',
            cell: row => <>
                <MDBTooltip title='Informacion General' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 me-1" className="">
                    <button className="btn btn-sm btn-info m-0 px-2 shadow-none" onClick={() => toggleInfo(row)}><i className="far fa-eye"></i></button>
                </MDBTooltip>
                {window.user.roleId == 1 || window.user.roleId == 5 || window.user.roleId == 3 || window.user.roleId == 2
                    ? <>
                        <MDBTooltip title='Gestionar peticion' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 me-1" className="">
                            <button className="btn btn-success btn-sm m-0 px-2 shadow-none" onClick={() => toggleManage(row)}><i className="fas fa-cog"></i></button>
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
            cell: row => <label>{row.id_publico ? row.id_publico : row.id_global ? row.id_global : <label className="fw-bold text-danger">SIN CONSECUTIVO</label>}</label>
        },
        {
            name: <h6>CONSECUTIVO SALIDA</h6>,
            selector: row => row.id_reply,
            sortable: true,
            filterable: true,
            cell: row => <label>{row.id_reply}</label>
        },
        {
            name: <h6>FECHA RADICACIÓN</h6>,
            selector: row => row.pqrs_time?.legal,
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
            selector: row => row.pqrs_time?.reply_formal,
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
            cell: row => <label>{dateParser_dateDiff(row.pqrs_time.legal, row.pqrs_time.reply_formal) + ' | ' + (row.pqrs_time.time)} día(s) habiles</label>
        },

        {
            name: <p>ACCIÓN</p>,
            button: true,
            minWidth: '150px',
            center: true,
            cell: row => <>
                <MDBTooltip title='Informacion General' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 me-1" className="">
                    <button className="btn btn-sm btn-info m-0 px-2 shadow-none" onClick={() => toggleInfo(row)}><i className="far fa-eye"></i></button>
                </MDBTooltip>
                {window.user.roleId == 1 || window.user.roleId == 5 || window.user.roleId == 3 || window.user.roleId == 2
                    ?
                    <PQRS_ACTION_REVIEW translation={translation} swaMsg={swaMsg} globals={globals}
                        currentItemId={row.id}
                        refreshList={refreshList}
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
            cell: row => <label>{row.id_publico ? row.id_publico : row.id_global ? row.id_global : <label className="fw-bold text-danger">SIN CONSECUTIVO</label>}</label>
        },
        {
            name: <label>CONSECUTIVO SALIDA</label>,
            selector: row => row.id_reply,
            sortable: true,
            filterable: true,
            cell: row => <label>{row.id_reply}</label>
        },
        {
            name: <label>ESTADO</label>,
            selector: row => row.status,
            sortable: true,
            filterable: true,
            cell: row => <label>{_STATUS_COMPONENT(row.status)}</label>
        },
        {
            name: <label>FECHA RADICACIÓN</label>,
            selector: row => row.pqrs_time?.reply_legal,
            sortable: true,
            filterable: true,
            cell: row => <label>{row.pqrs_time ? dateParser(row.pqrs_time.legal) : ''}</label>
        },
        {
            name: <label className="text-center">FECHA LIMITE RESPUESTA</label>,
            selector: row => row.pqrs_time?.legal,
            sortable: true,

            cell: row => <label>{row.pqrs_time ? dateParser(dateParser_finalDate(row.pqrs_time.legal, row.pqrs_time.time * (row.pqrs_law.extension ? 2 : 1))) : ''}</label>

        },
        {
            name: <label>ACCIÓN</label>,
            button: true,
            minWidth: '150px',
            cell: row => <MDBTooltip title='Informacion General' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 me-1" className="">
                <button className="btn btn-sm btn-info m-0 px-2 shadow-none" onClick={() => toggleInfo(row)}><i className="far fa-eye "></i></button>

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
            zIndex: 1050
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
            zIndex: 1050,
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
        if (state === fillActive) {
            return;
        }
        setFillActive(state);
    };
    const handleFillClick2 = (state) => {
        if (state === fillActive) {
            return;
        }
        setFillActive(state);
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
                    setItemsSearch(response.data);
                    setIsloadedSearch(true);
                    MySwal.close();
                })
                .catch(e => {
                    console.log(e);
                });
        } else {
            refreshList();
            setItemsSearch([]);
            setIsloadedSearch(false);
        }
    }
    let loadMacro = (event) => {
        event.preventDefault();
        toggle_macro();
        let date_a = document.getElementById("load_macro_date_1").value;
        let date_b = document.getElementById("load_macro_date_2").value;
        var date_start_val = date_a;
        var date_end_val = date_b;
        if (dayjs(date_a).diff(date_b) >= 0) {
            date_start_val = date_b;
            date_end_val = date_a;
        }
        setDate_start(date_start_val);
        setDate_end(date_end_val);
    }
    return (
        <div className="Publish container">
            <div className="col-12 d-flex justify-content-start p-0">
                <MDBBreadcrumb className="mb-0 p-0 ms-0">
                    <MDBBreadcrumbItem>
                        <Link to={'/home'}><i className="fas fa-home"></i> <label className="text-uppercase">{breadCrums.bc_01}</label></Link>
                    </MDBBreadcrumbItem>
                    <MDBBreadcrumbItem>
                        <Link to={'/dashboard'}><i className="far fa-bookmark"></i> <label className="text-uppercase">{breadCrums.bc_u1}</label></Link>
                    </MDBBreadcrumbItem>
                    <MDBBreadcrumbItem active><i className="fas fa-file-alt"></i>  <label className="text-uppercase">{breadCrums.bc_u7}</label></MDBBreadcrumbItem>
                </MDBBreadcrumb>
            </div>
            
            <div className="row mb-4 d-flex justify-content-center">

                {pending.length > 0 ? PENDING_COMPONENT() : ''}

                <div className="col-lg-11 col-md-12">
                    <h1 className="text-center my-4">GESTIÓN DE PQRS Y SOLICITUDES</h1>
                    <hr />
                    <MDBRow>
                        <h2 className="text-uppercase text-center pb-2">ACCIONES</h2>
                        <MDBCol md="4">
                            <MDBCard className="bg-card mb-3">
                                <MDBCardBody>
                                    <MDBCardTitle className="text-center"> <h4>GENERAR PQRS</h4></MDBCardTitle>
                                    <p className="app-text-primary text-justify"> Permite la digitalización de una solicitud PQRS</p>
                                    <div className="text-center py-4 mt-3">
                                        <button className="btn btn-lg btn-success" onClick={() => toggle()}><i className="fas fa-folder-plus"></i> NUEVA SOLICITUD </button>
                                    </div>
                                </MDBCardBody>
                            </MDBCard>
                        </MDBCol>
                        <MDBCol md="4">
                            <MDBCard className="bg-card mb-3">
                                <MDBCardBody>
                                    <MDBCardTitle className="text-center"> <h4>CONSULTAR PQRS</h4></MDBCardTitle>
                                    <form onSubmit={search} id="app-form">
                                        <div className="input-group mb-3">
                                            <span className="input-group-text bg-info text-white">
                                                <i className="fas fa-info-circle"></i>
                                            </span>
                                            <select className="form-select" id="search_0" required>
                                                <option value="1">Consecutivo de Entrada</option>
                                                <option value="2">Consecutivo de Salida</option>
                                                <option value="3">Numero de radicación de Licencia</option>
                                                <option value="4">Nombre de Peticionario</option>
                                                <option value="5">Numero de Documento (C.C, NIT)</option>
                                                <option value="6">Profesional Asignado</option>
                                            </select>
                                        </div>
                                        <div className="input-group mb-3">
                                            <span className="input-group-text bg-info text-white">
                                                <i className="far fa-comment-dots"></i>
                                            </span>
                                            <input type="text" className="form-control" id="search_1" />
                                        </div>
                                        <div className="text-center py-4 mt-3">
                                            <button className="btn btn-lg btn-secondary"><i className="fas fa-search-plus"></i> CONSULTAR </button>
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
                                        <div className="input-group mb-3">
                                            <span className="input-group-text bg-info text-white">
                                                <i className="far fa-calendar-alt"></i>
                                            </span>
                                            <input type="date" className="form-control" id="load_macro_date_1" required
                                                defaultValue={dayjs().subtract(6, 'months').format('YYYY-MM-DD')} />
                                        </div>
                                        <div className="input-group mb-3">
                                            <span className="input-group-text bg-info text-white">
                                                <i className="far fa-calendar-alt"></i>
                                            </span>
                                            <input type="date" className="form-control" id="load_macro_date_2" required
                                                defaultValue={dayjs().format('YYYY-MM-DD')} />
                                        </div>
                                        <div className="text-center py-4 mt-3">
                                            <button className="btn btn-lg btn-danger"><i className="fas fa-th"></i> CARGAR </button>
                                        </div>
                                    </form>
                                </MDBCardBody>
                            </MDBCard>
                        </MDBCol>
                    </MDBRow>
                </div>




                <div className="row d-flex justify-content-center">
                    <div className="col-11">
                        {isloadedSearch ? (<>
                            <h2 className="text-uppercase text-center pb-2">RESULTADO DE LA BUSQUEDA <img src={IMG_SEARCH_ICON} className="" height="75px" alt="..." /></h2>

                            <DataTable
                                title="TABLA DE BÚSQUEDA"
                                paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                                noDataComponent="No hay mensajes"
                                striped="true"
                                columns={columnsSearch}
                                data={itemsSearch}
                                highlightOnHover
                                pagination
                                paginationPerPage={20}
                                paginationRowsPerPageOptions={[20, 50, 100]}
                                className="data-table-component"
                                Header
                                onRowClicked={(e) => setSelectedRow(e.id)}
                                conditionalRowStyles={rowSelectedStyle}
                            /></>
                        ) : ""}
                    </div>
                </div>

                <MDBTabs fill pills className='mb-3'>
                    <MDBTabsItem>
                        <MDBTabsLink onClick={() => handleFillClick('1')} active={fillActive === '1'}>
                            <label className="upper-case">PETICIONES ACTIVAS ({items.length})</label>
                        </MDBTabsLink>
                    </MDBTabsItem>
                    <MDBTabsItem>
                        <MDBTabsLink onClick={() => handleFillClick('10')} active={fillActive === '10'}>
                            <label className="upper-case">ARCHIVO ({itemsClose.length})</label>
                        </MDBTabsLink>
                    </MDBTabsItem>
                </MDBTabs>


                <MDBTabsContent>
                    <MDBTabsPane show={fillActive === '1'}>
                        {isLoaded ? <>
                            <div className="row">
                                <div className='col ms-5 mb-3'>
                                    <MDBBtnGroup >
                                        <MDBBtn outline={!filterreply} onClick={() => setFilterreply(prev => !prev)} size='sm'>VER POR RESPONDER: {dataFilter(items, true, false).length}</MDBBtn>
                                        <MDBBtn outline={!filterreply2} onClick={() => setFilterreply2(prev => !prev)} size='sm'>VER POR VISTO BUENO: {dataFilter(items, false, true).length}</MDBBtn>
                                    </MDBBtnGroup>
                                </div>
                            </div>
                            <DataTable
                                title="Lista de peticiones activas"
                                paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                                noDataComponent="No hay mensajes"
                                striped="true"
                                columns={columns}
                                data={dataFilter(items, filterreply, filterreply2)}
                                highlightOnHover
                                pagination
                                paginationPerPage={20}
                                paginationRowsPerPageOptions={[20, 50, 100]}
                                className="data-table-component"
                                Header
                                onRowClicked={(e) => setSelectedRow(e.id)}
                                conditionalRowStyles={rowSelectedStyle}
                                dense
                                defaultSortFieldId={1}
                                defaultSortAsc
                            />
                        </> :
                            <div>
                                <h4>No hay información</h4>
                            </div>}
                    </MDBTabsPane>
                    <MDBTabsPane show={fillActive === '10'}>
                        {isLoaded ? <>
                            <DataTable
                                title="Lista de peticiones archivadas"
                                paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Página:', rangeSeparatorText: 'de' }}
                                noDataComponent="No hay mensajes"
                                striped="true"
                                columns={columnsArchive}
                                data={itemsClose}
                                highlightOnHover
                                pagination
                                paginationPerPage={20}
                                paginationRowsPerPageOptions={[20, 50, 100]}
                                className="data-table-component"
                                Header
                                onRowClicked={(e) => setSelectedRow(e.id)}
                                conditionalRowStyles={rowSelectedStyle}
                                dense
                                defaultSortFieldId={1}
                                defaultSortAsc
                            />
                        </> :
                            <div>
                                <h4>No hay información</h4>
                            </div>}
                    </MDBTabsPane>

                </MDBTabsContent>



                <Modal contentLabel="GENERAR SOLCITUD PQRS"
                    isOpen={modalNew}
                    style={customStyles}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <h2>CREAR NUEVA PETICIÓN</h2>

                        <div className='btn-close' color='none' onClick={() => toggle()}></div>
                    </div>
                    <hr />
                    <PQRSNEW
                        translation={translation}
                        swaMsg={swaMsg}
                        globals={globals}
                        translation_form={translation_form}
                        refreshRequested={refreshRequested} />
                    <hr />
                    <div className="text-end py-4 mt-3">
                        <button className="btn btn-lg btn-info" onClick={() => toggle()}><i className="fas fa-times-circle"></i> CERRAR </button>
                    </div>
                </Modal>

                <Modal contentLabel="INFORMACION PQRS"
                    isOpen={modalInfo}
                    style={customStyles}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <h3>INFORMACION PQRS - {currentIdPublic}</h3>
                        <div className='btn-close' color='none' onClick={() => toggleInfo()}></div>
                    </div>
                    <hr />
                    <PQRSINFO
                        ranslation={translation}
                        swaMsg={swaMsg}
                        globals={globals}
                        translation_form={translation_form}
                        currentId={currentId}
                        NAVIGATION={navigation} />
                    <hr />
                    <div className="text-end py-4 mt-3">
                        <button className="btn btn-lg btn-info" onClick={() => toggleInfo()}><i className="fas fa-times-circle"></i> CERRAR </button>
                    </div>
                </Modal>

                <Modal contentLabel="ASIGNAR PROFESIONALES PQRS"
                    isOpen={modalAsign}
                    style={customStyles}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <h3>ASIGNAR PROFESIONALES -  {currentIdPublic}</h3>
                        <div className='btn-close' color='none' onClick={() => toggleAsign()}></div>
                    </div>
                    <hr />
                    <PQRSASIGN
                        ranslation={translation}
                        swaMsg={swaMsg}
                        globals={globals}
                        translation_form={translation_form}
                        currentId={currentId}
                        refreshList={refreshList}
                        NAVIGATION={navigation} />
                    <hr />
                    <div className="text-end py-4 mt-3">
                        <button className="btn btn-lg btn-info" onClick={() => toggleAsign()}><i className="fas fa-times-circle"></i> CERRAR </button>
                    </div>
                </Modal>

                <Modal contentLabel="RESPUESTA PROFESIONAL PQRS"
                    isOpen={modalInformal}
                    style={customStyles}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <h3>RESPUESTA PROFESIONAL -  {currentIdPublic}</h3>
                        <div className='btn-close' color='none' onClick={() => toggleInformal()}></div>
                    </div>
                    <hr />
                    <PQRSINFORMAL
                        ranslation={translation}
                        swaMsg={swaMsg}
                        globals={globals}
                        translation_form={translation_form}
                        currentId={currentId}
                        refreshList={refreshList}
                        currentItemAsign={currentItemAsign}
                        NAVIGATION={navigation}
                        closeModal={() => toggleInformal()} />
                    <hr />
                    <div className="text-end py-4 mt-3">
                        <button className="btn btn-lg btn-info" onClick={() => toggleInformal()}><i className="fas fa-times-circle"></i> CERRAR </button>
                    </div>
                </Modal>

                <Modal contentLabel="RESPONDER PETICION PQRS"
                    isOpen={modalReply}
                    style={customStyles}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <h3>RESPONDER A PETICIÓN -  {currentIdPublic}</h3>
                        <div className='btn-close' color='none' onClick={() => toggleReply()}></div>
                    </div>
                    <hr />
                    <PQRSREPLY
                        ranslation={translation}
                        swaMsg={swaMsg}
                        globals={globals}
                        translation_form={translation_form}
                        currentId={currentId}
                        refreshList={refreshList}
                        NAVIGATION={navigation}
                        closeModal={() => toggleReply()} />
                    <hr />
                    <div className="text-end py-4 mt-3">
                        <button className="btn btn-lg btn-info" onClick={() => toggleReply()}><i className="fas fa-times-circle"></i> CERRAR </button>
                    </div>
                </Modal>

                <Modal contentLabel="CERRAR PQRS"
                    isOpen={modalLock}
                    style={customStyles}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <h3>CERRAR PETICIÓN -  {currentIdPublic}</h3>
                        <div className='btn-close' color='none' onClick={() => toggleLock()}></div>
                    </div>
                    <hr />
                    <PQRSLOCK
                        ranslation={translation}
                        swaMsg={swaMsg}
                        globals={globals}
                        translation_form={translation_form}
                        currentId={currentId}
                        refreshList={refreshList}
                        NAVIGATION={navigation} />
                    <hr />
                    <div className="text-end py-4 mt-3">
                        <button className="btn btn-lg btn-info" onClick={() => toggleLock()}><i className="fas fa-times-circle"></i> CERRAR </button>
                    </div>
                </Modal>

                <Modal contentLabel="EDIT PQRS"
                    isOpen={modalEdit}
                    style={customStyles}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <h3>MODIFICAR PETICIÓN -  {currentIdPublic}</h3>
                        <div className='btn-close' color='none' onClick={() => toggleEdit()}></div>
                    </div>
                    <hr />
                    <PQRS_EDIT
                        ranslation={translation}
                        swaMsg={swaMsg}
                        globals={globals}
                        translation_form={translation_form}
                        currentId={currentId}
                        refreshList={refreshList}
                        NAVIGATION={navigation} />
                    <hr />
                    <div className="text-end py-4 mt-3">
                        <button className="btn btn-lg btn-info" onClick={() => toggleEdit()}><i className="fas fa-times-circle"></i> CERRAR </button>
                    </div>
                </Modal>
                <Modal contentLabel="MANAGE PQRS"
                    isOpen={modalManage}
                    style={customStyles}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <h3>GESTIONAR PETICIÓN -  {currentIdGlobal || currentIdPublic}</h3>
                        <div className='btn-close' color='none' onClick={() => toggleManage()}></div>
                    </div>
                    <hr />
                    <PQRS_MANAGE_COMPONENT
                        translation={translation}
                        swaMsg={swaMsg}
                        globals={globals}
                        currentId={currentId}
                        refreshList={refreshList}
                        NAVIGATION={navigation}
                        closeModal={toggleManage}
                        translation_form={translation_form}
                        retrievePublish={retrievePublish}
                    />

                    <div className="text-end py-4 mt-3">
                        <button className="btn btn-lg btn-info" onClick={() => toggleManage()}><i className="fas fa-times-circle"></i> CERRAR </button>
                    </div>
                </Modal>
                <Modal contentLabel="EDIT PQRS"
                    isOpen={modalEditable}
                    style={customStyles}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <h3>EDITAR PETICIÓN -  {currentIdGlobal || currentIdPublic}</h3>
                        <div className='btn-close' color='none' onClick={() => toggleEditable()}></div>
                    </div>
                    <hr />
                    {editMaster == true ?
                        <PQRS_MANAGE_COMPONENT
                            translation={translation}
                            swaMsg={swaMsg}
                            globals={globals}
                            currentId={currentId}
                            refreshList={refreshList}
                            NAVIGATION={navigation}
                            closeModal={toggleEditable}
                            translation_form={translation_form}
                            retrievePublish={retrievePublish}
                        /> :
                        <ACESS_EDIT
                            swaMsg={swaMsg}
                            editMaster1={() => setEditMaster(prev => !prev)}
                            NAVIGATION={navigation}
                            translation={translation}
                            currentId={currentId}
                        />
                    }
                    <div className="text-end py-4 mt-3">
                        <button className="btn btn-lg btn-info" onClick={() => toggleEditable()}><i className="fas fa-times-circle"></i> CERRAR </button>
                    </div>
                </Modal>

                <Modal contentLabel="MACRO TABLE"
                    isOpen={modal_macro}
                    style={customStylesForModalMacro}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <label><i className="fas fa-th"></i> Macro tabla de seguimiento: Desde {dateParser(date_start)} hasta {dateParser(date_end)}</label>
                        <MDBBtn className='btn-close' color='none' onClick={() => toggle_macro()}></MDBBtn>
                    </div>

                    <PQRS_MACROTABLE translation={translation} swaMsg={swaMsg} globals={globals}
                        closeModal={toggle_macro}
                        NAVIGATION={navigation}
                        NAVIGATION_GEN={toggleInfo}
                        date_start={date_start}
                        date_end={date_end}
                        selectedRow={selectedRow}
                        setSelectedRow={(id) => setSelectedRow(id)}
                    />

                </Modal>

            </div >
        </div >
    );
}

export default PQRSADMIN;
