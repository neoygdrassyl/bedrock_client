
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import DATATABLE from '@/components/data-table-bridge';
import FUN_SERVICE from '../../../../services/fun.service';
import USER_SERVICE from '../../../../services/users.service'
import { Icon } from '@/components/icon';
import { swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';

export default function FUN_CLOCK_EVENTS(props) {
    const { swaMsg, translation, globals, currentItem, currentVersion } = props;

    const search = ['date_start', 'desc', 'name'];
    const columns = [
        {
            name: 'DE:',
            selector: row => row.name.split(';')[0],
            maxWidth: '150px',
            cell: row => <h6 className='fw-normal'>{(row.name.split(';')[0])}</h6>
        },
        {
            name: 'PARA:',
            selector: row => row.name.split(';')[1],
            maxWidth: '150px',
            cell: row => <h6 className='fw-normal'>{(row.name.split(';')[1])}</h6>
        },
        {
            name: 'FECHA',
            selector: row => row.date_start,
            maxWidth: '90px',
            cell: row => <h6 className='fw-normal'>{(row.date_start)}</h6>
        },
        {
            name: 'EVENTO',
            cell: row => <h6 className='fw-normal'>{(row.desc)}</h6>
        },
        {
            name: 'ACCIÓN',
            maxWidth: '90px',
            omit: !(window.user.roleId == 1 || window.user.roleId == 3 || window.user.roleId == 2),
            cell: row => <span title="Eliminar Item"><button type="button" className="btn btn-danger btn-sm  m-0 p-1 shadow-none" onClick={() => deleteEvent(row.id)}><Icon name="trash-alt" size={16} /></button></span>
        },
    ]
    var [filter, setFilter] = useState('');
    var [data, setData] = useState([]);
    var [workers, setWorkers] = useState([]);
    var [load, setLoad] = useState(0);
    var [newEvent, setNewEvent] = useState(false);

    useEffect(() => {
        if (load == 0) {
            loadData()
            retrieveWorkerList()
        }
        if (currentItem.fun_clocks) loadData()
    }, [load, currentItem]);

    // ***************************  DATA GETTERS *********************** //
    let _GET_CHILD_CLOCK = () => {
        var _CHILD = currentItem.fun_clocks;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
    }
    let _GET_CLOCK_STATES = (_state) => {
        var _CLOCKS = _GET_CHILD_CLOCK();
        var _CLOKS_STATES = []
        for (var i = 0; i < _CLOCKS.length; i++) {
            if (_CLOCKS[i].state == _state) _CLOKS_STATES.push(_CLOCKS[i]);
        }
        return _CLOKS_STATES;
    }
    function loadData() {
        let _data = _GET_CLOCK_STATES(0);
        setData(_data);
        setLoad(1);
    }
    // *************************  DATA CONVERTERS ********************** //
    function search_data() {
        let newValue = document.getElementById('DATA_TABLE_EVENTS').value;
        newValue = newValue.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        setFilter(newValue)
    }

    function search_clean() {
        document.getElementById('DATA_TABLE_EVENTS').value = '';
        setFilter('')
    }

    function filter_data(d) {
        if (filter == '') return true;
        return search.some(f => {
            if (!d[f]) return false;
            let curatedText = d[f].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            return curatedText.includes(filter);
        })
    }

    // Helpers seguras (ponlas arriba del componente o en el mismo archivo)
    const getWindowUserSafe = () => {
    const user = (typeof window !== 'undefined' && window.user) ? window.user : {};
    return {
        name: (user.name || '').toLowerCase(),
        surname: (user.surname || '').toLowerCase(),
    };
    };

    const getAssigneeFromRow = (row) => {
    // row.name podría no ser string o no tener ';'
    const raw = String(row?.name ?? '');
    const parts = raw.split(';');
    // La parte después del primer ';' (si existe) es el asignado
    return (parts[1] || '').trim().toLowerCase();
    };

    const isRowAssignedToCurrentUser = (row) => {
    const assignee = getAssigneeFromRow(row);
    const { name, surname } = getWindowUserSafe();

    if (!assignee) return false;
    // Si falta alguno de los campos del usuario, no reventar:
    const matchName = name ? assignee.includes(name) : true;
    const matchSurname = surname ? assignee.includes(surname) : true;

    return matchName && matchSurname;
    };

    // ******************************* JSX ***************************** // 
    let _COMPONENET_NEW = () => {
        return <>
            <div className="row m-2">
                <div className="col">
                    <label>De:</label>
                    <input type="text" className="form-control form-control-sm" id="clock_event_1" disabled defaultValue={window.user.name + ' ' + window.user.surname} />
                </div>
                <div className="col">
                    <label>Para:</label>
                    <input list="option_workers" className="form-select form-select-sm" id="clock_event_2" autoComplete='off'></input>
                    <datalist id="option_workers">
                        {workers.map(worker => <option>{worker.name} {worker.surname}</option>)}
                    </datalist>
                </div>
                <div className="col">
                    <label>Fecha</label>
                    <input type="date" className="form-control form-control-sm" id="clock_event_3" max="2100-01-01" disabled
                        defaultValue={dayjs().format('YYYY-MM-DD')} />

                </div>
                <div className="col-6">
                    <label>Mensaje</label>
                    <input type="text" className="form-control form-control-sm" id="clock_event_4" maxLength={200} />

                </div>
                <div className="col-1">
                    <button type="button" className="btn btn-success btn-sm rounded-pill p-2 m-2 mt-4" onClick={() => createEvent(true)}><Icon name="plus" size={16} /></button>
                </div>
            </div>
        </>
    }

    // ******************************* APIS **************************** // 
    function retrieveWorkerList() {
        USER_SERVICE.getAll()
            .then(response => {
                setWorkers(response.data.filter(d => d.active == 1))
            })
            .catch(e => {
                console.log(e);
                swalError({ title: "ERROR AL CARGAR", text: "No ha sido posible cargar este item, intentelo nuevamente." });
            });
    }

    function createEvent(useMySwal) {
        var formDataclock = new FormData();

        let date_start = document.getElementById('clock_event_3').value
        formDataclock.set('date_start', date_start);

        let name_1 = document.getElementById('clock_event_1').value
        let name_2 = document.getElementById('clock_event_2').value
        formDataclock.set('name', name_1 + ';' + name_2);

        let desc = document.getElementById('clock_event_4').value
        formDataclock.set('desc', desc);

        formDataclock.set('fun0Id', currentItem.id);
        formDataclock.set('state', 0);

        FUN_SERVICE.create_clock(formDataclock)
            .then(response => {
                if (response.data === 'OK') {
                    if (useMySwal) {
                        swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                    }
                    props.requestUpdate(currentItem.id);
                    setNewEvent(false);
                } else {
                    if (useMySwal) {
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                    }
                }
            })
            .catch(e => {
                console.log(e);
                if (useMySwal) {
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                }
            });
    }

    function deleteEvent(id, useMySwal) {
        MySwal.fire({
            title: "ELIMINAR ESTE ITEM",
            text: "¿Esta seguro de eliminar de forma permanente este item?",
            icon: 'question',
            confirmButtonText: "ELIMINAR",
            showCancelButton: true,
            cancelButtonText: "CANCELAR"
        }).then(SweetAlertResult => {
            if (SweetAlertResult.isConfirmed) {
                if (useMySwal) swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
                FUN_SERVICE.delete_clock(id)
                    .then(response => {
                        if (response.data === 'OK') {
                            if (useMySwal) swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                            props.requestUpdate(currentItem.id);
                            setNewEvent(false);
                        } else {
                            if (useMySwal) swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        if (useMySwal) swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                    });
            }
        });
    }

    return <>
        <button type="button" className={`btn btn-sm rounded-pill ${!newEvent ? "btn-outline-success" : "btn-success"}`} onClick={() => setNewEvent(!newEvent)}><Icon name="plus-circle" size={16} /> NUEVO</button>
        {newEvent ? _COMPONENET_NEW() : ''}

        <DATATABLE
            title={<>
                <div className='row'>
                    <div className='col'><Icon name="clipboard-list" size={16} /> {'EVENTOS LICENCIAS'}</div>
                    <div className='col'>

                        <div className="input-group input-group-sm">
                            <span className="input-group-text"><Icon name="search" size={16} /></span>
                            <input type="text" className="form-control" placeholder={'Buscar...'} id={'DATA_TABLE_EVENTS'} onKeyPress={(e) => { if (e.key === 'Enter') search_data() }} />
                            {filter
                                ? <button className="btn btn-danger" onClick={() => search_clean()}><Icon name="times" size={16} /></button>
                                : <button className="btn btn-primary" onClick={() => search_data()}><Icon name="angle-double-right" size={16} /> BUSCAR</button>}
                        </div>
                    </div>
                </ div>
            </>}
            columns={columns.map(column => {
                return {
                    ...column,
                    name: <label className="text-center fw-bold">{column.name}</label>,
                    sortable: column.selector ? true : false,
                    filterable: column.selector ? true : false,
                    center: column.center ?? true,
                }
            })}
            data={data.filter(d => filter_data(d))}

            className="data-table"

            progressPending={load == 0}
            progressComponent={<h4 className="fw-bold my-4 text-muted">CARGAGANDO...</h4>}
            noDataComponent={<h4 className="fw-bold  my-4 text-muted">NO HAY INFORMACIÓN</h4>}

            striped="true"
            highlightOnHover

            defaultSortFieldId={1}
            defaultSortAsc={false}

            paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}

            pagination={true}
            paginationPerPage={20}
            paginationRowsPerPageOptions={[20, 50, 100]}

            dense

            conditionalRowStyles={[
                {
                    when: row => isRowAssignedToCurrentUser(row),
                    style: {
                    backgroundColor: 'Skyblue',
                    },
                },
            ]}

        />
    </>;
}
