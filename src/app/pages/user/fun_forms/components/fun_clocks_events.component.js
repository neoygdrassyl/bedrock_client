import { MDBBtn, MDBTooltip } from 'mdb-react-ui-kit';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import DATATABLE from 'react-data-table-component';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import FUN_SERVICE from '../../../../services/fun.service';
import USER_SERVICE from '../../../../services/users.service'

const MySwal = withReactContent(Swal);
export default function FUN_CLOCK_EVENTS(props) {
    const { swaMsg, translation, globals, currentItem, currentVersion } = props;

    const search = ['date_start', 'desc', 'name'];
    const columns = [
        {
            name: <label className="text-center">DE:</label>,
            selector: row => row.name.split(';')[0],
            maxWidth: '150px',
            cell: row => <h6 className='fw-normal'>{(row.name.split(';')[0])}</h6>
        },
        {
            name: <label className="text-center">PARA:</label>,
            selector: row => row.name.split(';')[1],
            maxWidth: '150px',
            cell: row => <h6 className='fw-normal'>{(row.name.split(';')[1])}</h6>
        },
        {
            name: <label className="text-center">FECHA</label>,
            selector: row => row.date_start,
            maxWidth: '90px',
            cell: row => <h6 className='fw-normal'>{(row.date_start)}</h6>
        },
        {
            name: <label className="text-center">EVENTO</label>,
            cell: row => <h6 className='fw-normal'>{(row.desc)}</h6>
        },
        {
            name: <label className="text-center">ACCIÓN</label>,
            maxWidth: '90px',
            omit: !(window.user.roleId == 1 || window.user.roleId == 3 || window.user.roleId == 2),
            cell: row => <MDBTooltip title='Eliminar Item' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1">
                <MDBBtn className="btn btn-danger btn-sm  m-0 p-1 shadow-none" onClick={() => deleteEvent(row.id)}><i class="far fa-trash-alt"></i></MDBBtn>
            </MDBTooltip>
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
    // ******************************* JSX ***************************** // 
    let _COMPONENET_NEW = () => {
        return <>
            <div className="row m-2">
                <div className="col">
                    <label>De:</label>
                    <input type="text" class="form-control form-control-sm" id="clock_event_1" disabled defaultValue={window.user.name + ' ' + window.user.surname} />
                </div>
                <div className="col">
                    <label>Para:</label>
                    <input list="option_workers" class="form-select form-select-sm" id="clock_event_2" autoComplete='off'></input>
                    <datalist id="option_workers">
                        {workers.map(worker => <option>{worker.name} {worker.surname}</option>)}
                    </datalist>
                </div>
                <div className="col">
                    <label>Fecha</label>
                    <input type="date" class="form-control form-control-sm" id="clock_event_3" max="2100-01-01" disabled
                        defaultValue={moment().format('YYYY-MM-DD')} />

                </div>
                <div className="col-6">
                    <label>Mensaje</label>
                    <input type="text" class="form-control form-control-sm" id="clock_event_4" maxLength={200} />

                </div>
                <div className="col-1">
                    <MDBBtn rounded color="success" sise="sm" className='p-2 m-2 mt-4' onClick={() => createEvent(true)}><i class="fas fa-plus"></i></MDBBtn>
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
                MySwal.fire({
                    title: "ERROR AL CARGAR",
                    text: "No ha sido posible cargar este item, intentelo nuevamente.",
                    icon: 'error',
                    confirmButtonText: this.props.swaMsg.text_btn,
                });
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
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    }
                    props.requestUpdate(currentItem.id);
                    setNewEvent(false);
                } else {
                    if (useMySwal) {
                        MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    }
                }
            })
            .catch(e => {
                console.log(e);
                if (useMySwal) {
                    MySwal.fire({
                        title: swaMsg.generic_eror_title,
                        text: swaMsg.generic_error_text,
                        icon: 'warning',
                        confirmButtonText: swaMsg.text_btn,
                    });
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
                if (useMySwal) MySwal.fire({
                    title: swaMsg.title_wait,
                    text: swaMsg.text_wait,
                    icon: 'info',
                    showConfirmButton: false,
                });
                FUN_SERVICE.delete_clock(id)
                    .then(response => {
                        if (response.data === 'OK') {
                            if (useMySwal) MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            props.requestUpdate(currentItem.id);
                            setNewEvent(false);
                        } else {
                            if (useMySwal) MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        if (useMySwal) MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    });
            }
        });
    }

    return <>
        <MDBBtn rounded outline={!newEvent} color="success" sise="sm" onClick={() => setNewEvent(!newEvent)}><i class="fas fa-plus-circle"></i> NUEVO</MDBBtn>
        {newEvent ? _COMPONENET_NEW() : ''}

        <DATATABLE
            title={<>
                <div className='row'>
                    <div className='col'><i class="fas fa-clipboard-list"></i> {'EVENTOS LICENCIAS'}</div>
                    <div className='col'>

                        <div className="input-group input-group-sm">
                            <span className="input-group-text"><i class="fas fa-search"></i></span>
                            <input type="text" className="form-control" placeholder={'Buscar...'} id={'DATA_TABLE_EVENTS'} onKeyPress={(e) => { if (e.key === 'Enter') search_data() }} />
                            {filter
                                ? <button className="btn btn-danger" onClick={() => search_clean()}><i class="fas fa-times"></i></button>
                                : <button className="btn btn-primary" onClick={() => search_data()}><i class="fas fa-angle-double-right"></i> BUSCAR</button>}
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
                    when: row =>  row.name && row.name.split(';')[1] && (row.name.split(';')[1]).includes(window.user.name) &&
                        (row.name && row.name.split(';')[1]).includes(window.user.surname),
                    style: {
                        backgroundColor: 'Skyblue',
                    },
                },
            ]}

        />
    </>;
}
