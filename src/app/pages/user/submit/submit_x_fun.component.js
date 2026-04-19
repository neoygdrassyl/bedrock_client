import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import dayjs from 'dayjs';
import { useState, useEffect, useCallback, useRef } from 'react';
import { dateParser_finalDate, dateParser_timeLeft, formsParser1 } from '../../../components/customClasses/typeParse';
import { DiasHabilesColombia } from '../../../utils/BusinessDaysCol';
import FunService from '../../../services/fun.service';
import PqrsMainDataService from '../../../services/pqrs_main.service';
import Codes from '../../../components/jsons/fun6DocsList.json';
import DataTable from '@/components/data-table-bridge';
import { LegacyModal as Modal } from '@/components/legacy-modal';
import TABLE_COMPONENT_EXPANDED from '../fun_forms/components/table_components/table.component_expanded';
import USER_SERVICE from '../../../services/users.service';
import { Icon } from '@/components/icon';
import { swalError } from '@/app/utils/swalAdapter';

function SUBMIT_X_FUN({ translation, globals, swaMsg, type, simple, hide, setSubtmitRows, openModal, listIncomplete }) {
    const [currentItems, setCurrentItems] = useState([]);
    const [collapseID, setCollapseID] = useState(false);
    const [load, setLoad] = useState(false);
    const [incomplete, setIncomplete] = useState([]);
    const [modal, setModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [worker_list, setWorkerList] = useState([]);
    const [dataAsign, setDataAsign] = useState([]);
    const [lic_list, setLicList] = useState(false);
    const hasSyncedListIncomplete = useRef(false);

    const get_lastVRTime = (items) => {
        var screated = items.screated ? items.screated.split(';') : [];
        var today = dayjs();
        var diff = dayjs(today).diff(screated[0], 'days', true);
        screated.map(value => {
            var diffi = dayjs(today).diff(value, 'days', true)
            if (diffi < diff) diff = diffi
        })
        return diff;
    };

    const loadIcoplete = useCallback(() => {
        FunService.getAll_incDocs()
            .then(response => {
                if (response.data.length) {
                    setIncomplete(response.data);
                }
            })
            .catch(e => {
                console.log(e);
            });
    }, []);

    const retrieveWorker = useCallback(() => {
        USER_SERVICE.getAll()
            .then(response => {
                setWorkerList(response.data);
            })
            .catch(e => {
                console.log(e);
                swalError({ title: "ERROR AL CARGAR", text: "No ha sido posible cargar este item, intentelo nuevamente." });
            });
    }, [swaMsg]);

    const retrieveMacro = useCallback((id1, id2) => {
        FunService.loadMacroAsigns(id1, id2)
            .then(response => {
                setDataAsign(response.data);
            })
            .catch(e => {
                console.log(e);
                swalError({ title: "ERROR AL CARGAR", text: "No ha sido posible cargar este item, inténtelo nuevamente." });
            });
    }, [swaMsg]);

    useEffect(() => {
        if (simple) return;

        var end_date = dayjs().format('YYYY-MM-DD');
        const _bd = new DiasHabilesColombia();
        var start_date = _bd.restarDiasHabiles(end_date, 15);

        if (type == "LIC") {
            FunService.loadSubmit2(start_date, end_date)
                .then(response => {
                    if (response.data.length) {
                        setCurrentItems(response.data);
                        setLoad(true);
                        var submitItems = [];
                        for (var i = 0; i < response.data.length; i++) {
                            submitItems.push(response.data[i].id)
                        }
                        setSubtmitRows?.(submitItems);
                    }
                })
                .catch(e => {
                    console.log(e);
                });
        }
        if (type == "PQRS") {
            PqrsMainDataService.loadSubmit(start_date, end_date)
                .then(response => {
                    if (response.data.length) {
                        setCurrentItems(response.data);
                        var submitItems = [];
                        var incompleteItems = [];
                        for (var i = 0; i < response.data.length; i++) {
                            submitItems.push(response.data[i].id);
                            console.log(response.data[i])
                        }
                        setSubtmitRows?.(submitItems);
                    }
                })
                .catch(e => {
                    console.log(e);
                });
        }

        retrieveWorker();
        if (type == "LIC") loadIcoplete();
    }, [loadIcoplete, retrieveWorker, setSubtmitRows, simple, type]);

    useEffect(() => {
        if (simple || type != "LIC") return;
        if (!hasSyncedListIncomplete.current) {
            hasSyncedListIncomplete.current = true;
            return;
        }
        loadIcoplete();
    }, [listIncomplete, loadIcoplete, simple, type]);

    useEffect(() => {
        if (!simple || type != "LIC" || !lic_list || incomplete.length) return;
        loadIcoplete();
    }, [incomplete.length, lic_list, loadIcoplete, simple, type]);
        const customStylesForModal = {
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
                top: '10px',
                left: '20%',
                right: '15%',
                bottom: '10px',
                border: '1px solid #ccc',
                overflow: 'auto',
                WebkitOverflowScrolling: 'touch',
                borderRadius: '4px',
                outline: 'none',
                padding: '20px',
                marginRight: 'auto',

            }
        };
        const docs6ToCheck = ['672', '6601', '6602', '6604', '6605', '6606', '6607', '6608', '681', '682', '685', '686', '687', '689', '916', '917', '918']
        const _fun_0_state = {
            '1': 'RADICACIÓN',
            '-1': 'RADICACIÓN',
            '-101': "DESISTIMIENTO",
            '-102': "DESISTIMIENTO",
            '-103': "DESISTIMIENTO",
            '-104': "DESISTIMIENTO",
            '-105': "DESISTIMIENTO",
            '-106': "DESISTIMIENTO",
            '5': 'EVALUACIÓN (LyDF)',
            '50': 'EXPEDICIÓN',
            '100': 'EXPEDIDA',
            '101': 'ARCHIVADA',
        }
        const _fun_0_state_COLOR = {
            '1': 'fw-bold',
            '-1': 'fw-bold',
            '-101': "fw-bold text-danger",
            '-102': "fw-bold text-danger",
            '-103': "fw-bold text-danger",
            '-104': "fw-bold text-danger",
            '-105': "fw-bold text-danger",
            '-106': "fw-bold text-danger",
            '5': 'fw-bold',
            '50': 'fw-bold',
            '100': 'fw-bold text-primary',
            '101': 'fw-bold text-primary',
        }
        let fatherValues_n = {
            61: ['511', '512', '513', '516', '517', '518', '519'],
            62: ['621', '601a', '622', '602a', '623', '601b', '602b', '624', '625', '626', '627', '601c', '602c'],
            63: ['630', '631', '632', '633',],
            64: ['641', '642', '643',],
            65: ['651', '652', '653',],
            66: ['6601', '6602', '6603', '6604', '6605', '911', '660a', '660b', '660c', '660d', '660e', '6607', '6608', '6609', '6610', '6611', '6612', '6613', '6614', '6615', '6616', '6617', '6618', '6619',],
            67: ['671', '672',],
            68: ['680', '681', '682', '683', '684', '685', '686', '687', '6862', '688', '689'],
        }

        let bluePrintBaget = (items) => {
            let _array_codes = items.scodes ? items.scodes.split(',') : [];
            let _array_names = items.snames ? items.snames.split(';') : [];
            let _array_reviews = items.sreview ? items.sreview.split(',') : [];
            let bluePrints = false;
            _array_reviews.map((review, i) => {
                if ((docs6ToCheck.includes(_array_codes[i]) || ((_array_names[i] || '').toLowerCase()).includes('plano')) && review == 'SI') {
                    bluePrints = true
                }
            })
            if (bluePrints === true) return <span className="badge bg-primary">PLANOS</span>
        }
        let listVR = (item) => {
            var scodes = item.scodes ? item.scodes.split(',') : [];
            var sreview = item.sreview ? item.sreview.split(',') : [];
            var snames = item.snames ? item.snames.split(';') : [];
            return <>
                <h6 className='fw-bold'>{item.title} | {item.screated}</h6>
                <ul>
                    {sreview.map((value, i) => {
                        if (value == 'SI') return <li><h6 className='text-muted'>{scodes[i]} {snames[i]}</h6></li>
                    })}
                </ul>
            </>
        }
        let get_lastVR = (items) => {
            var diff = get_lastVRTime(items)
            var days = Math.trunc(diff);
            var hours = Math.trunc(diff * 24) % 24;
            var mins = Math.trunc(diff * 24 * 60) % 60;
            var message = `${days} d, ${hours}:${mins < 10 ? '0' + mins : mins} h,`
            return <label className={days <= 2 ? 'text-success fw-bold' : ''}>{message}</label>
        }
        let listItemPopOver = (items) => {
            var scodes = items.scodes ? items.scodes.split(';') : [];
            var sreview = items.sreview ? items.sreview.split(';') : [];
            var snames = items.snames ? items.snames.split('&&') : [];

            var vrs = items.vrs ? items.vrs.split(',') : [];
            var screated = items.screated ? items.screated.split(';') : [];
            var vrItem = [];
            vrs.map((value, i) => vrItem.push(
                {
                    title: value,
                    scodes: scodes[i],
                    sreview: sreview[i],
                    screated: screated[i],
                    snames: snames[i],
                }
            ))
            vrItem.sort((a, b) => new Date(b.screated) - new Date(a.screated));
            return <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="px-2 mb-1 me-1 h-7">
                        <Icon name="FileInput" size={14} />
                    </Button>
                </PopoverTrigger>
                <PopoverContent side="left" className="w-[600px] max-h-80 overflow-y-auto">
                    <h4 className="text-sm font-semibold mb-2">Ventanilla Única</h4>
                    <div className="space-y-1">{vrItem.map(value => listVR(value))}</div>
                </PopoverContent>
            </Popover>
        }

        let listIncPopOver = (row) => {
            let vr_codes = row.vr_codes ? row.vr_codes.split(',') : [];
            let vr_checked = row.vr_checked ? row.vr_checked.split(',') : []

            let submited = [];
            vr_codes.map((code, i) => {
                if (vr_checked[i] == 'SI' && code) submited.push(code);
            })

            let codes = row.code ? row.code.split(',') : [];
            let checked = row.checked ? row.checked.split(',') : []

            let toSubmit = [];
            let inChecked = [];

            codes.map((code, i) => {
                if ((checked[i] == 1 || checked[i] == 0) && code) toSubmit.push(code);
                if (checked[i] === '1') inChecked.push(code)
            })

            return <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="px-2 mb-1 me-1 h-7">
                        <Icon name="FileInput" size={14} />
                    </Button>
                </PopoverTrigger>
                <PopoverContent side="left" className="w-[800px] max-h-96 overflow-y-auto">
                    <h4 className="text-sm font-semibold mb-2">Documentos aportados</h4>

                    <ul>
                        {toSubmit.map(code => {
                            let classColor = '';
                            if (submited.includes(code) && !inChecked.includes(code)) classColor = "text-warning"
                            if (inChecked.includes(code) && !submited.includes(code)) classColor = "text-warning"
                            if (inChecked.includes(code) && submited.includes(code)) classColor = "text-success"
                            return <li className={classColor}>
                                <label> <label className='fw-bold'>{code}</label> - {Codes[code]}  {inChecked.includes(code) ? <Icon name="check-square" size={16} className="text-dark" /> : ''} {submited.includes(code) ? <Icon name="file-import" size={16} className="text-dark" /> : ''}</label>
                            </li>
                        })}
                    </ul>
                </PopoverContent>
            </Popover>
        }

        function processCodes(row) {
            let vr_codes = row.vr_codes ? row.vr_codes.split(',') : [];
            let vr_checked = row.vr_checked ? row.vr_checked.split(',') : []

            let submited = [];
            vr_codes.map((code, i) => {
                if (vr_checked[i] == 'SI' && code) submited.push(code);
            })

            let codes = row.code ? row.code.split(',') : [];
            let checked = row.checked ? row.checked.split(',') : []

            let toSubmit = [];
            let inChecked = [];
            let allCheckedCounter = 0;

            codes.map((code, i) => {
                if (checked[i] === '1' || checked[i] === '0') toSubmit.push(code);
                if (checked[i] === '1') inChecked.push(code)
                if (checked[i] === '1') allCheckedCounter++
            })

            let completed = 0;
            toSubmit.map(code => {
                if (submited.includes(code) || inChecked.includes(code)) completed = completed + 1;
            })

            return { completed, toSubmit, inChecked, allCheckedCounter }
        }

        let _COMPONENT_LIST_DOCS_CHECK = (simple) => {
            const columns = [
                {
                    name: '# Radicación',
                    selector: row => row.id_public,
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: '150px',
                    maxWidth: '150px',
                    cell: row => {
                        const { completed, toSubmit, inChecked, allCheckedCounter } = processCodes(row)
                        if (completed == toSubmit.length && completed != 0 && allCheckedCounter < toSubmit.length) return <div className='d-flex'><label>{row.id_public} <Icon name="star" size={16} className="text-muted" /> </label></div>;
                        else if (completed == toSubmit.length && completed != 0 && allCheckedCounter >= toSubmit.length) return <div className='d-flex'><label>{row.id_public} <Icon name="star" size={16} className="text-warning" /> </label></div>;
                        else return <label>{row.id_public}</label>;
                    }
                },
                {
                    name: 'Docs LYDF',
                    center: true,
                    minWidth: '100px',
                    maxWidth: '100px',
                    cell: row => {
                        const { completed, toSubmit } = processCodes(row)
                        return <label className>{completed}/{toSubmit.length}</label>
                    }
                },
                {
                    name: 'Modalidad',
                    selector: row => formsParser1(row),
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <label className>{formsParser1(row)}</label>
                },
                {
                    name: 'Fecha Límite',
                    selector: row => dateParser_finalDate(row.clocks_date, 30),
                    sortable: true,
                    filterable: true,
                    center: true,
                    center: true,
                    minWidth: '100px',
                    maxWidth: '100px',
                    cell: row => <label className>{dateParser_finalDate(row.clocks_date, 30)}</label>
                },
                {
                    name: 'Tiempo Restante',
                    selector: row => dateParser_timeLeft(row.clocks_date, 30),
                    sortable: true,
                    filterable: true,
                    center: true,
                    center: true,
                    minWidth: '100px',
                    maxWidth: '100px',
                    cell: row => {
                        let timeLeft = dateParser_timeLeft(row.clocks_date, 30);
                        let timeOver = timeLeft < 0;
                        return <span className="text-sm font-mono"><span className={timeOver ? 'text-destructive font-bold' : ''}>{timeLeft}</span> /30</span>
                    }
                },
                {
                    name: 'Acción',
                    button: true,
                    center: true,
                    minWidth: '200px',
                    cell: row => <>
                        {listIncPopOver(row)}
                        <button
                                onClick={() => openModal({ ...row, version: 1 }, 'archive')}
                                className="px-1 btn-sm btn-secondary btn"
                            ><Icon name="archive" size={16} />
                            </button>
                    </>,
                },
            ]
            return <DataTable
                paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                noDataComponent="NO HAY ENTRADAS"
                striped="true"
                columns={columns}
                data={incomplete.filter(row => {
                    if (simple) {
                        const { completed, toSubmit, inChecked, allCheckedCounter } = processCodes(row)
                        return (completed >= toSubmit.length && completed != 0)
                    }
                    return true
                })}
                highlightOnHover
                pagination
                paginationPerPage={20}
                paginationRowsPerPageOptions={[20, 50, 100]}
                className="data-table-component"
                title="LISTA DE DOCUMENTOS FALTANTES PARA LYDF"

                progressPending={!incomplete.length}
                progressComponent={<label className='fw-normal lead text-muted'>CARGANDO...</label>}

                defaultSortFieldId={1}

                dense
            />
        }

        let _COMPONENT_SUBMIT_LIST = () => {
            const columns = [
                {
                    name: '# Radicación',
                    selector: row => row.id_public,
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: '140px',
                    cell: row => <span className="text-sm font-medium font-mono">{row.id_public}</span>
                },
                {
                    name: 'Estado',
                    selector: row => row.state,
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: '160px',
                    cell: row => <label className={_fun_0_state_COLOR[row.state] ?? 'fw-bold'}>{_fun_0_state[row.state] ?? ''}</label>
                },
                {
                    name: 'Último VR',
                    center: true,
                    selector: row => get_lastVRTime(row),
                    sortable: true,
                    filterable: true,
                    minWidth: '100px',
                    cell: row => <span className="text-sm font-mono">{get_lastVR(row)}</span>,
                },
                {
                    name: '',
                    minWidth: '50px',
                    maxWidth: '50px',
                    cell: row => <span>{bluePrintBaget(row)}</span>,
                },
                {
                    name: 'Acción',
                    button: true,
                    center: true,
                    minWidth: '200px',
                    cell: row => <>
                        {listItemPopOver(row)}
                        <button
                                onClick={() => openModal(row, 'general')}
                                className="px-1 btn-sm btn-info btn"
                            > <Icon name="folder-open" size={16} />
                            </button>
                        <button
                                onClick={() => { setModal(true); setSelectedItem(row); }}
                                className="px-1 btn-sm btn-warning btn"
                            > <Icon name="user-clock" size={16} />
                            </button>
                    </>,
                },
            ]
            return <DataTable
                paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                noDataComponent="NO HAY ENTRADAS"
                striped="true"
                columns={columns}
                data={currentItems}
                highlightOnHover
                pagination
                paginationPerPage={20}
                paginationRowsPerPageOptions={[20, 50, 100]}
                className="data-table-component"
                title="LISTA DE DOCUMENTOS ENTRANTES"

                progressPending={!load}
                progressComponent={<label className='fw-normal lead text-muted'>CARGANDO...</label>}

                defaultSortFieldId={3}

                dense
            />
        }

        let _COMPONENT_SIMPLE = () => {
            return <div className="alert alert-danger">
                <div className="row">
                    <div className="col-10">
                        <label className="fw-bold">SOLICITUDES PARA DECLARAR EN LYDF</label>
                    </div>
                    <div className="col text-end">
                        <span title="Detalles"><button type="button" className="btn"
                                color="info"
                                size="sm"
                                onClick={() => setLicList(prev => !prev)}
                                className="px-2"
                            > <Icon name="info-circle" size={16} />
                            </button></span>
                    </div>
                </div>
                {lic_list && (
                    <ul className="list-group mx-2">
                        {type == "LIC" ? _COMPONENT_LIST_DOCS_CHECK(simple) : ''}
                    </ul>
                )}

            </div>
        }

        // CHANGE ONE ROLE ID FOR 3 IN THE FUTURE IF IS NEEDED
        return simple && (window.user.id == 1 || window.user.roleId == 3 || window.user.roleId == 5 || window.user.roleId == 2) ?
            <div className="submit_x_fun  container">
                <div className="row d-flex justify-content-center">
                    <div className="col-10">
                        {_COMPONENT_SIMPLE()}
                    </div>
                </div>
            </div >

            : hide ? '' : <div className="submit_x_fun  container">
                <div className="row d-flex justify-content-center">
                    {type == "LIC" ? _COMPONENT_LIST_DOCS_CHECK() : ''}
                    {_COMPONENT_SUBMIT_LIST()}
                </div>

                <Modal contentLabel="ASIGN PROFS"
                    isOpen={modal}
                    style={customStylesForModal}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <label><Icon name="file-alt" size={16} /> ASIFNACIÓN DE PROFESIONALES:  {selectedItem ? selectedItem.id_public : ''} </label>
                        <button type="button" className="btn-close" onClick={() => setModal(false)} />
                    </div>

                    {selectedItem ?
                        <TABLE_COMPONENT_EXPANDED currentItem={{ ...selectedItem, rec_review: selectedItem.rec_review, rec_review_2: selectedItem.rec_rev_2 }}
                            requestUpdate={() => retrieveMacro()}
                            translation={translation} swaMsg={swaMsg} globals={globals}
                            worker_list={worker_list}
                            lenghtL={dataAsign.lenght}
                            dataL={dataAsign}
                        />
                        : null}

                    <div className="text-end py-4 mt-3">
                        <button type="button" className="btn btn-info" onClick={() => setModal(false)}>
                            <h4 className="pt-2"><Icon name="times-circle" size={16} /> CERRAR</h4>
                        </button>
                    </div>
                </Modal>

            </div >
}

export default SUBMIT_X_FUN;
