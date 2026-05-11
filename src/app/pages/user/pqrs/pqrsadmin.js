import { useState, useEffect, useCallback } from 'react';
import { TabPane } from '@/components/ui/tab-pane';
import { Button } from '@/components/ui/button';
import PQRS_Main from '../../../services/pqrs_main.service'
import { Link } from "react-router-dom";
import DataTable from '@/components/data-table-bridge';
import { dateParser, dateParser_timeLeft, dateParser_finalDate, dateParser_dateDiff } from '../../../components/customClasses/typeParse'
import { LegacyModal as Modal } from '@/components/legacy-modal';

// MODALS FOR PQRS
import PQRSNEW from './newpqrs'
import PQRSINFO from './infopqrs'
//simplificacion
import PQRSASIGN from './asignpqrs'
import PQRSINFORMAL from './infomalpqrs'
import PQRSREPLY from './replypqrs'
import PQRSLOCK from './lockpqrs'

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
import { Icon } from '@/components/icon';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { swalClose, swalLoading } from '@/app/utils/swalAdapter';

function PendingComponent({ pendingOpen, setPendingOpen, pending }) {
    return (
        <div className="col-lg-11 col-md-12">
            <div className="alert alert-warning">

                <div className="row">
                    <div className="col-10">
                        <span className="font-semibold text-sm">PQRS PENDIENTES POR VENTANILLA ÚNICA: </span>
                    </div>
                    <div className="col text-end">
                        <Button variant="ghost" size="sm" title="Ver Listado" onClick={() => setPendingOpen(prev => !prev)}>
                            <Icon name="info-circle" size={16} />
                        </Button>
                    </div>
                </div>
                {pendingOpen && (
                    <div className="row">
                        <div className="col-10">
                            <ul>
                                {pending.map((i) => <li key={i.id_pending}>{i.id_pending}</li>)}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}

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
                    _COMPONENT.push(<p key={item.pqrs_workers[i].id ?? item.pqrs_workers[i].worker_id ?? `pqrsadmin-reply-date-${i}`}>{dateParser(item.pqrs_workers[i].date_reply)}</p>)
                }
            }
            return <>{_COMPONENT}</>;
        }
        let _STATUS_COMPONENT = (item) => {
            switch (item) {
                case 0:
                    return <Badge variant="destructive" className="text-[10px]">Activo</Badge>
                case 1:
                    return <Badge className="text-[10px] bg-accent text-accent-foreground">Cerrado</Badge>
                case 2:
                    return <Badge variant="secondary" className="text-[10px]">Archivado</Badge>
                case 3:
                    return <Badge variant="outline" className="text-[10px]">Trasladado</Badge>
                default:
                    break;
            }
        }
        let _GET_STOPLIGHT_COLOR = (row) => {
            if (!row) return <Icon name="lightbulb" size={16} className="text-muted" />;
            let time = row.pqrs_time ? row.pqrs_time.time : 0;
            let legal = row.pqrs_time ? row.pqrs_time.legal : 0
            let ext = row.pqrs_law ? row.pqrs_law.extension ? 2 : 1 : 1;
            let days = dateParser_timeLeft(legal, time * (ext));
            if (days <= 0) return <Icon name="lightbulb" size={16} className="text-danger" />
            if (days > 0 && days < 7) return <Icon name="lightbulb" size={16} className="text-warning" />
            if (days >= 7) return <Icon name="lightbulb" size={16} className="text-success" />
        }
        let _GET_STOPLIGHT_COLOR_ASSIGNED = (row) => {
            let days = dateParser_timeLeft(row.legal, row.time / 2);
            if (days <= 0) return <Icon name="lightbulb" size={16} className="text-danger" />
            if (days > 0 && days < 7) return <Icon name="lightbulb" size={16} className="text-warning" />
            if (days >= 7) return <Icon name="lightbulb" size={16} className="text-success" />
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
            if (review == 1) return <Badge className="text-[10px] bg-accent text-accent-foreground">Visto Bueno</Badge>;
            else if (review == 0) return <Badge variant="outline" className="text-[10px] text-warning border-warning">Visto Negativo</Badge>;
            else if (review == null) return <Badge variant="destructive" className="text-[10px]">Debe dar Visto</Badge>;
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

        // -----------------
        const rowSelectedStyle = [
            {
                when: row => row.id == selectedRow,
                style: {
                    backgroundColor: 'hsl(var(--warning) / 0.12)',
                },
            },
        ];
        // -----------------

        const columns = [
            {
                name: "",
                right: true,
                maxWidth: "40px",
                cell: row => _GET_STOPLIGHT_COLOR(row)
            },
            {
                name: 'CONSECUTIVO ENTRADA',
                selector: row => row.id_global ? row.id_global : row.id_publico ? row.id_publico : '',
                sortable: true,
                center: true,
                filterable: true,
                cell: row => <span className="text-sm font-medium font-mono">{row.id_global ? row.id_global : row.id_publico ? row.id_publico : <Badge variant="destructive" className="text-[10px]">Sin consecutivo</Badge>}</span>
            },
            {
                name: '¿PROFESIONAL ASIGNADO?',
                cell: row => <span className="text-xs">{row.pqrs_workers.length ? row.pqrs_workers.map((value, idx) => <span key={idx} className="block">{value.name}</span>) : <Badge variant="outline" className="text-[10px] text-warning border-warning">Pendiente</Badge>}</span>
            },
            {
                name: 'FECHA RADICACIÓN',
                selector: row => row.pqrs_time ? row.pqrs_time.legal : '',
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <span className="text-xs font-mono tabular-nums">{row.pqrs_time ? row.pqrs_time.legal : ''}</span>
            },
            {
                name: 'TIEMPO RESTANTE',
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
                    return <span className="text-xs"><span className={cn('font-bold tabular-nums', result <= 0 ? 'text-destructive' : result < 7 ? 'text-warning' : '')}>{result}</span><span className="text-muted-foreground"> d</span></span>
                }
            },
            {
                name: 'FECHA LÍMITE',
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
                    return <span className="text-xs font-mono tabular-nums">{result}</span>
                }
            },
            {
                name: 'ACCIÓN',
                button: true,
                center: true,
                minWidth: '150px',
                cell: row => <>
                    <Button size="sm" className="m-0 px-2" title="Informacion General" onClick={() => toggleInfo(row)}><Icon name="eye" size={16} /></Button>
                    {window.user.roleId == 1 || window.user.roleId == 5 || window.user.roleId == 3 || window.user.roleId == 2
                        ? <>
                            <Button size="sm" className="m-0 px-2" title="Gestionar peticion" onClick={() => toggleManage(row)}><Icon name="cog" size={16} /></Button>
                        </> : ""}
                </>,
            },
        ]
        const columnsArchive = [
            {
                name: 'CONSECUTIVO ENTRADA',
                selector: row => row.id_publico ? row.id_publico : row.id_global ? row.id_global : '',
                sortable: true,
                filterable: true,
                cell: row => <span className="text-sm font-medium font-mono">{row.id_publico ? row.id_publico : row.id_global ? row.id_global : <Badge variant="destructive" className="text-[10px]">Sin consecutivo</Badge>}</span>
            },
            {
                name: 'CONSECUTIVO SALIDA',
                selector: row => row.id_reply,
                sortable: true,
                filterable: true,
                cell: row => <span className="text-sm font-mono">{row.id_reply}</span>
            },
            {
                name: 'FECHA RADICACIÓN',
                selector: row => row.pqrs_time?.legal,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <span className="text-xs font-mono tabular-nums">{dateParser(row.pqrs_time.legal) ?? ''}</span>

            },
            {
                name: 'FECHA LÍMITE RESPUESTA',
                minWidth: '150px',
                selector: row => dateParser_finalDate(row.pqrs_time.legal, row.pqrs_time.time * (row.pqrs_law.extension ? 2 : 1)),
                sortable: true,
                center: true,
                cell: row => <span className="text-xs font-mono tabular-nums">{dateParser(dateParser_finalDate(row.pqrs_time.legal, row.pqrs_time.time * (row.pqrs_law.extension ? 2 : 1)))}</span>
            },
            {
                name: 'FECHA ENVÍO RESPUESTA',
                selector: row => row.pqrs_time?.reply_formal,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <span className="text-xs font-mono tabular-nums">{dateParser(row.pqrs_time.reply_formal)}</span>
            },
            {
                name: 'TIEMPO REAL RESPUESTA',
                selector: row => dateParser_dateDiff(row.pqrs_time.legal, row.pqrs_time.reply_formal),
                sortable: true,
                center: true,
                cell: row => <span className="text-xs">{dateParser_dateDiff(row.pqrs_time.legal, row.pqrs_time.reply_formal)} | {row.pqrs_time.time} día(s) hábiles</span>
            },

            {
                name: 'ACCIÓN',
                button: true,
                minWidth: '150px',
                center: true,
                cell: row => <>
                    <Button size="sm" className="m-0 px-2" title="Informacion General" onClick={() => toggleInfo(row)}><Icon name="eye" size={16} /></Button>
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
                name: 'CONSECUTIVO ENTRADA',
                selector: row => row.id_publico ? row.id_publico : row.id_global ? row.id_global : '',
                sortable: true,
                filterable: true,
                cell: row => <span className="text-sm font-medium font-mono">{row.id_publico ? row.id_publico : row.id_global ? row.id_global : <Badge variant="destructive" className="text-[10px]">Sin consecutivo</Badge>}</span>
            },
            {
                name: 'CONSECUTIVO SALIDA',
                selector: row => row.id_reply,
                sortable: true,
                filterable: true,
                cell: row => <span className="text-sm font-mono">{row.id_reply}</span>
            },
            {
                name: 'ESTADO',
                selector: row => row.status,
                sortable: true,
                filterable: true,
                cell: row => _STATUS_COMPONENT(row.status)
            },
            {
                name: 'FECHA RADICACIÓN',
                selector: row => row.pqrs_time?.reply_legal,
                sortable: true,
                filterable: true,
                cell: row => <span className="text-xs font-mono tabular-nums">{row.pqrs_time ? dateParser(row.pqrs_time.legal) : ''}</span>
            },
            {
                name: 'FECHA LÍMITE RESPUESTA',
                selector: row => row.pqrs_time?.legal,
                sortable: true,
                cell: row => <span className="text-xs font-mono tabular-nums">{row.pqrs_time ? dateParser(dateParser_finalDate(row.pqrs_time.legal, row.pqrs_time.time * (row.pqrs_law.extension ? 2 : 1))) : ''}</span>
            },
            {
                name: 'ACCIÓN',
                button: true,
                minWidth: '150px',
                cell: row => <Button size="sm" className="m-0 px-2" title="Informacion General" onClick={() => toggleInfo(row)}><Icon name="eye" size={16} /></Button>,

            },
        ]
        // CUSTOM STYLES FOR THE MODAL
        const customStylesForModalMacro = {};
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
                swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
                PQRS_Main.search(formData)
                    .then(response => {
                        //asignLists(response.data);
                        // asignListsWorkers(response.data);
                        setItemsSearch(response.data);
                        setIsloadedSearch(true);
                        swalClose();
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
            setDate_end(date_end_val)
        }
        return (
            <div className="Publish container">
                <div>
                    <h1 className="text-xl font-bold text-foreground">PQRS</h1>
                    <p className="text-sm text-muted-foreground mt-1">Gestión de peticiones, quejas, reclamos y sugerencias</p>
                </div>
                
                <div className="row mb-4 d-flex justify-content-center">

{pending.length > 0 ? <PendingComponent pendingOpen={pending_open} setPendingOpen={setPending_open} pending={pending} /> : ''}

                    <div className="col-lg-11 col-md-12">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                            <div className="rounded-lg border bg-card p-4">
                                <h4 className="text-sm font-semibold text-center mb-2">Generar PQRS</h4>
                                <p className="text-xs text-muted-foreground text-center mb-3">Digitalización de una solicitud PQRS</p>
                                <div className="text-center">
                                    <Button onClick={() => toggle()}>
                                        <Icon name="FolderPlus" size={14} /> Nueva Solicitud
                                    </Button>
                                </div>
                            </div>
                            <div className="rounded-lg border bg-card p-4">
                                <h4 className="text-sm font-semibold text-center mb-2">Consultar PQRS</h4>
                                <form onSubmit={search} id="app-form">
                                    <div className="input-group mb-2">
                                        <span className="input-group-text bg-primary text-primary-foreground">
                                            <Icon name="Info" size={13} />
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
                                    <div className="input-group mb-2">
                                        <span className="input-group-text bg-primary text-primary-foreground">
                                            <Icon name="MessageCircle" size={13} />
                                        </span>
                                        <input type="text" className="form-control" id="search_1" placeholder="Buscar..." />
                                    </div>
                                    <div className="text-center">
                                        <Button variant="secondary" size="sm" type="submit">
                                            <Icon name="SearchCheck" size={13} /> Consultar
                                        </Button>
                                    </div>
                                </form>
                            </div>
                            <div className="rounded-lg border bg-card p-4">
                                <h4 className="text-sm font-semibold text-center mb-2">Macro Tabla</h4>
                                <form onSubmit={loadMacro} id="fun_form_macro_table_pqrs">
                                    <div className="input-group mb-2">
                                        <span className="input-group-text bg-primary text-primary-foreground">
                                            <Icon name="Calendar" size={13} />
                                        </span>
                                        <input type="date" className="form-control" id="load_macro_date_1" required
                                            defaultValue={dayjs().subtract(6, 'months').format('YYYY-MM-DD')} />
                                    </div>
                                    <div className="input-group mb-2">
                                        <span className="input-group-text bg-primary text-primary-foreground">
                                            <Icon name="Calendar" size={13} />
                                        </span>
                                        <input type="date" className="form-control" id="load_macro_date_2" required
                                            defaultValue={dayjs().format('YYYY-MM-DD')} />
                                    </div>
                                    <div className="text-center">
                                        <Button variant="destructive" size="sm" type="submit">
                                            <Icon name="Table" size={13} /> Cargar
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {isloadedSearch && (
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold text-center mb-2">
                                <Icon name="Search" size={14} className="inline mr-1" /> Resultado de la Búsqueda
                            </h3>
                            <DataTable
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
                                noHeader
                                onRowClicked={(e) => setSelectedRow(e.id)}
                                conditionalRowStyles={rowSelectedStyle}
                            />
                        </div>
                    )}

                    <div className="flex border-b border-border overflow-x-auto" role="tablist">
                        <button
                            role="tab"
                            aria-selected={fillActive === '1'}
                            onClick={() => handleFillClick('1')}
                            className={cn(
                                'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap border-0 bg-transparent',
                                fillActive === '1'
                                    ? 'border-b-primary text-primary'
                                    : 'border-b-transparent text-muted-foreground hover:text-foreground hover:border-b-border'
                            )}
                        >
                            <Icon name="MessageSquare" size={14} />
                            Peticiones Activas
                            <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">{items.length}</Badge>
                        </button>
                        <button
                            role="tab"
                            aria-selected={fillActive === '10'}
                            onClick={() => handleFillClick('10')}
                            className={cn(
                                'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap border-0 bg-transparent',
                                fillActive === '10'
                                    ? 'border-b-primary text-primary'
                                    : 'border-b-transparent text-muted-foreground hover:text-foreground hover:border-b-border'
                            )}
                        >
                            <Icon name="Archive" size={14} />
                            Archivo
                            <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">{itemsClose.length}</Badge>
                        </button>
                    </div>

                    <div>
                        <TabPane show={fillActive === '1'}>
                            {isLoaded ? <>
                                <div className="row">
                                    <div className='col ms-5 mb-3'>
                                        <div className="flex flex-wrap gap-1">
                                            <Button variant={!filterreply ? "outline" : "default"} size="sm" onClick={() => setFilterreply(prev => !prev)}>VER POR RESPONDER: {dataFilter(items, true, false).length}</Button>
                                            <Button variant={!filterreply2 ? "outline" : "default"} size="sm" onClick={() => setFilterreply2(prev => !prev)}>VER POR VISTO BUENO: {dataFilter(items, false, true).length}</Button>
                                        </div>
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
                        </TabPane>
                        <TabPane show={fillActive === '10'}>
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
                        </TabPane>

                    </div>

                    <Modal contentLabel="GENERAR SOLCITUD PQRS"
                        isOpen={modalNew}
                        ariaHideApp={false}
                    >
                        <div className="flex items-center justify-between py-2.5 mb-3 border-b border-border/60">
                            <div className="flex items-center gap-2.5">
                                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
                                    <Icon name="FolderPlus" size={14} className="text-primary" />
                                </div>
                                <h2 className="text-sm font-semibold tracking-tight">Crear Nueva Petición</h2>
                            </div>
                            <button type="button" onClick={() => toggle()} className="rounded-md p-1 hover:bg-muted transition-colors" aria-label="Cerrar">
                                <Icon name="X" size={16} className="text-muted-foreground" />
                            </button>
                        </div>
                        <PQRSNEW
                            translation={translation}
                            swaMsg={swaMsg}
                            globals={globals}
                            translation_form={translation_form}
                            refreshRequested={refreshRequested} />
                        <div className="flex justify-end py-3 mt-3 border-t border-border/60">
                            <Button variant="outline" size="sm" onClick={() => toggle()}><Icon name="X" size={14} /> Cerrar</Button>
                        </div>
                    </Modal>

                    <Modal contentLabel="INFORMACION PQRS"
                        isOpen={modalInfo}
                        ariaHideApp={false}
                    >
                        <div className="flex items-center justify-between py-2.5 mb-3 border-b border-border/60">
                            <div className="flex items-center gap-2.5">
                                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
                                    <Icon name="Info" size={14} className="text-primary" />
                                </div>
                                <h2 className="text-sm font-semibold tracking-tight">Información PQRS — {currentIdPublic}</h2>
                            </div>
                            <button type="button" onClick={() => toggleInfo()} className="rounded-md p-1 hover:bg-muted transition-colors" aria-label="Cerrar">
                                <Icon name="X" size={16} className="text-muted-foreground" />
                            </button>
                        </div>
                        <PQRSINFO
                            ranslation={translation}
                            swaMsg={swaMsg}
                            globals={globals}
                            translation_form={translation_form}
                            currentId={currentId}
                            NAVIGATION={navigation} />
                        <div className="flex justify-end py-3 mt-3 border-t border-border/60">
                            <Button variant="outline" size="sm" onClick={() => toggleInfo()}><Icon name="X" size={14} /> Cerrar</Button>
                        </div>
                    </Modal>

                    <Modal contentLabel="ASIGNAR PROFESIONALES PQRS"
                        isOpen={modalAsign}
                        ariaHideApp={false}
                    >
                        <div className="flex items-center justify-between py-2.5 mb-3 border-b border-border/60">
                            <div className="flex items-center gap-2.5">
                                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
                                    <Icon name="UserPlus" size={14} className="text-primary" />
                                </div>
                                <h2 className="text-sm font-semibold tracking-tight">Asignar Profesionales — {currentIdPublic}</h2>
                            </div>
                            <button type="button" onClick={() => toggleAsign()} className="rounded-md p-1 hover:bg-muted transition-colors" aria-label="Cerrar">
                                <Icon name="X" size={16} className="text-muted-foreground" />
                            </button>
                        </div>
                        <PQRSASIGN
                            ranslation={translation}
                            swaMsg={swaMsg}
                            globals={globals}
                            translation_form={translation_form}
                            currentId={currentId}
                            refreshList={refreshList}
                            NAVIGATION={navigation} />
                        <div className="flex justify-end py-3 mt-3 border-t border-border/60">
                            <Button variant="outline" size="sm" onClick={() => toggleAsign()}><Icon name="X" size={14} /> Cerrar</Button>
                        </div>
                    </Modal>

                    <Modal contentLabel="RESPUESTA PROFESIONAL PQRS"
                        isOpen={modalInformal}
                        ariaHideApp={false}
                    >
                        <div className="flex items-center justify-between py-2.5 mb-3 border-b border-border/60">
                            <div className="flex items-center gap-2.5">
                                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
                                    <Icon name="MessageSquare" size={14} className="text-primary" />
                                </div>
                                <h2 className="text-sm font-semibold tracking-tight">Respuesta Profesional — {currentIdPublic}</h2>
                            </div>
                            <button type="button" onClick={() => toggleInformal()} className="rounded-md p-1 hover:bg-muted transition-colors" aria-label="Cerrar">
                                <Icon name="X" size={16} className="text-muted-foreground" />
                            </button>
                        </div>
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
                        <div className="flex justify-end py-3 mt-3 border-t border-border/60">
                            <Button variant="outline" size="sm" onClick={() => toggleInformal()}><Icon name="X" size={14} /> Cerrar</Button>
                        </div>
                    </Modal>

                    <Modal contentLabel="RESPONDER PETICION PQRS"
                        isOpen={modalReply}
                        ariaHideApp={false}
                    >
                        <div className="flex items-center justify-between py-2.5 mb-3 border-b border-border/60">
                            <div className="flex items-center gap-2.5">
                                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
                                    <Icon name="Reply" size={14} className="text-primary" />
                                </div>
                                <h2 className="text-sm font-semibold tracking-tight">Responder Petición — {currentIdPublic}</h2>
                            </div>
                            <button type="button" onClick={() => toggleReply()} className="rounded-md p-1 hover:bg-muted transition-colors" aria-label="Cerrar">
                                <Icon name="X" size={16} className="text-muted-foreground" />
                            </button>
                        </div>
                        <PQRSREPLY
                            ranslation={translation}
                            swaMsg={swaMsg}
                            globals={globals}
                            translation_form={translation_form}
                            currentId={currentId}
                            refreshList={refreshList}
                            NAVIGATION={navigation}
                            closeModal={() => toggleReply()} />
                        <div className="flex justify-end py-3 mt-3 border-t border-border/60">
                            <Button variant="outline" size="sm" onClick={() => toggleReply()}><Icon name="X" size={14} /> Cerrar</Button>
                        </div>
                    </Modal>

                    <Modal contentLabel="CERRAR PQRS"
                        isOpen={modalLock}
                        ariaHideApp={false}
                    >
                        <div className="flex items-center justify-between py-2.5 mb-3 border-b border-border/60">
                            <div className="flex items-center gap-2.5">
                                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
                                    <Icon name="Lock" size={14} className="text-primary" />
                                </div>
                                <h2 className="text-sm font-semibold tracking-tight">Cerrar Petición — {currentIdPublic}</h2>
                            </div>
                            <button type="button" onClick={() => toggleLock()} className="rounded-md p-1 hover:bg-muted transition-colors" aria-label="Cerrar">
                                <Icon name="X" size={16} className="text-muted-foreground" />
                            </button>
                        </div>
                        <PQRSLOCK
                            ranslation={translation}
                            swaMsg={swaMsg}
                            globals={globals}
                            translation_form={translation_form}
                            currentId={currentId}
                            refreshList={refreshList}
                            NAVIGATION={navigation} />
                        <div className="flex justify-end py-3 mt-3 border-t border-border/60">
                            <Button variant="outline" size="sm" onClick={() => toggleLock()}><Icon name="X" size={14} /> Cerrar</Button>
                        </div>
                    </Modal>

                    <Modal contentLabel="EDIT PQRS"
                        isOpen={modalEdit}
                        ariaHideApp={false}
                    >
                        <div className="flex items-center justify-between py-2.5 mb-3 border-b border-border/60">
                            <div className="flex items-center gap-2.5">
                                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
                                    <Icon name="Pencil" size={14} className="text-primary" />
                                </div>
                                <h2 className="text-sm font-semibold tracking-tight">Modificar Petición — {currentIdPublic}</h2>
                            </div>
                            <button type="button" onClick={() => toggleEdit()} className="rounded-md p-1 hover:bg-muted transition-colors" aria-label="Cerrar">
                                <Icon name="X" size={16} className="text-muted-foreground" />
                            </button>
                        </div>
                        <PQRS_EDIT
                            ranslation={translation}
                            swaMsg={swaMsg}
                            globals={globals}
                            translation_form={translation_form}
                            currentId={currentId}
                            refreshList={refreshList}
                            NAVIGATION={navigation} />
                        <div className="flex justify-end py-3 mt-3 border-t border-border/60">
                            <Button variant="outline" size="sm" onClick={() => toggleEdit()}><Icon name="X" size={14} /> Cerrar</Button>
                        </div>
                    </Modal>
                    <Modal contentLabel="MANAGE PQRS"
                        isOpen={modalManage}
                        ariaHideApp={false}
                    >
                        <div className="flex items-center justify-between py-2.5 mb-3 border-b border-border/60">
                            <div className="flex items-center gap-2.5">
                                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
                                    <Icon name="Settings" size={14} className="text-primary" />
                                </div>
                                <h2 className="text-sm font-semibold tracking-tight">Gestionar Petición — {currentIdGlobal || currentIdPublic}</h2>
                            </div>
                            <button type="button" onClick={() => toggleManage()} className="rounded-md p-1 hover:bg-muted transition-colors" aria-label="Cerrar">
                                <Icon name="X" size={16} className="text-muted-foreground" />
                            </button>
                        </div>
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
                        <div className="flex justify-end py-3 mt-3 border-t border-border/60">
                            <Button variant="outline" size="sm" onClick={() => toggleManage()}><Icon name="X" size={14} /> Cerrar</Button>
                        </div>
                    </Modal>
                    <Modal contentLabel="EDIT PQRS"
                        isOpen={modalEditable}
                        ariaHideApp={false}
                    >
                        <div className="flex items-center justify-between py-2.5 mb-3 border-b border-border/60">
                            <div className="flex items-center gap-2.5">
                                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
                                    <Icon name="FileEdit" size={14} className="text-primary" />
                                </div>
                                <h2 className="text-sm font-semibold tracking-tight">Editar Petición — {currentIdGlobal || currentIdPublic}</h2>
                            </div>
                            <button type="button" onClick={() => toggleEditable()} className="rounded-md p-1 hover:bg-muted transition-colors" aria-label="Cerrar">
                                <Icon name="X" size={16} className="text-muted-foreground" />
                            </button>
                        </div>
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
                        <div className="flex justify-end py-3 mt-3 border-t border-border/60">
                            <Button variant="outline" size="sm" onClick={() => toggleEditable()}><Icon name="X" size={14} /> Cerrar</Button>
                        </div>
                    </Modal>

                    <Modal contentLabel="MACRO TABLE"
                        isOpen={modal_macro}
                        ariaHideApp={false}
                    >
                        <div className="flex items-center justify-between py-2.5 mb-3 border-b border-border/60">
                            <div className="flex items-center gap-2.5">
                                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
                                    <Icon name="Table" size={14} className="text-primary" />
                                </div>
                                <h2 className="text-sm font-semibold tracking-tight">Macro Tabla: {dateParser(date_start)} — {dateParser(date_end)}</h2>
                            </div>
                            <button type="button" onClick={() => toggle_macro()} className="rounded-md p-1 hover:bg-muted transition-colors" aria-label="Cerrar">
                                <Icon name="X" size={16} className="text-muted-foreground" />
                            </button>
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
