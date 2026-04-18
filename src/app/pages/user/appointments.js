import { useState, useEffect, useCallback } from 'react';
import AppointmentService from '../../services/appointments.service'
import UserslDataService from '../../services/users.service'
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/icon';
import DataTable from '@/components/data-table-bridge';
import Collapsible from '../../components/Collapsible';
import { LegacyModal as Modal } from '@/components/legacy-modal';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { dateParser } from '../../components/customClasses/typeParse'


import dayjs from 'dayjs';
const MySwal = withReactContent(Swal)

function Appointments({ translation, globals, breadCrums, swaMsg }) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [modal, setModal] = useState(false);
    const [modal_edit, setModalEdit] = useState(false);
    const [items, setItems] = useState([]);
    const [items_2, setItems2] = useState([]);
    const [items_3, setItems3] = useState([]);
    const [users, setUsers] = useState([]);

    const toggle = useCallback(() => setModal(prev => !prev), []);
    const toggle_edit = useCallback(() => setModalEdit(prev => !prev), []);

    const setItemFn = useCallback((item) => {
        setCurrentItem(item);
        setModal(true);
    }, []);

    const setItem_edit = useCallback((item) => {
        setCurrentItem(item);
        setModalEdit(true);
    }, []);

    const retrievePublish = useCallback(() => {
        AppointmentService.getAll()
            .then(response => {
                let list = [];
                let list_2 = [];
                let list_3 = [];
                response.data.map((item, i) => {
                    let today = dayjs().format("YYYY-MM-DD")
                    if (dayjs(today).diff(item.date, 'days') < 0) {
                        list.push(item);
                    }
                    if (dayjs(today).diff(item.date, 'days') == 0) {
                        list_2.push(item);
                    }
                    if (dayjs(today).diff(item.date, 'days') > 0) {
                        list_3.push(item);
                    }
                });
                setItems(list);
                setItems2(list_2);
                setItems3(list_3);
                setIsLoaded(true);
            })
            .catch(e => {
                console.log(e);
            });
    }, []);

    const loadUsers = useCallback(() => {
        UserslDataService.getAllWorkers()
        .then(response => {
            if(response.data) setUsers(response.data)
        })
        .catch(console.log);
    }, []);

    useEffect(() => {
        retrievePublish();
        loadUsers();
    }, [retrievePublish, loadUsers]);
        const columns = [
            {
                name: <h4>CONSECUTIVO</h4>,
                selector: row => row.id,
                sortable: true,
                filterable: true,
                minWidth: '40px',
                center: true,
                cell: row => <label>{row.id}</label>
            },
            {
                name: <h4>FECHA</h4>,
                selector: row => row.date,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{dateParser(row.date)}</label>
            },
            {
                name: <h4>HORA</h4>,
                selector: row => row.time,
                sortable: true,
                center: true,
                cell: row => <label>{row.time}</label>
            },
            {
                name: <h4>PROFESIONAL</h4>,
                selector: row => row.profesional,
                sortable: true,
                center: true,
                cell: row => <label>{row.profesional}</label>
            },
            {
                name: <h4>DESCRIPCIÓN</h4>,
                selector: row => row.profesional,
                sortable: true,
                center: true,
                minWidth: '100px',
                cell: row => <label>{row.content}</label>
            },
                        {
                name: <h4>OBSERVACIONES</h4>,
                selector: row => row.profesional,
                sortable: true,
                center: true,
                minWidth: '100px',
                cell: row => <label>{row.details}</label>
            },
            {
                name: <h4>ASISTENCIA SEÑAS</h4>,
                selector: row => row.profesional,
                sortable: true,
                center: true,
                minWidth: '250px',
                cell: row => <label>{row.accesibility == true ? <label className='text-success fw-bold'>Si</label> : 'No'}</label>
            },
            {
                name: <h4>ACCIÓN</h4>,
                button: true,
                minWidth: '120px',
                ignoreCSV: true,
                cell: row => <>
                    {dayjs().diff(row.date, 'days') <= 0
                        ? <button className="btn btn-secondary btn-sm me-1" onClick={() => setItem_edit(row)}><Icon name="edit" size={16} /></button>
                        : ""}
                    <button className="btn btn-info btn-sm" onClick={() => setItemFn(row)}><Icon name="info-circle" size={16} /></button>
                </>
                ,
            },
        ]
        const customStyles = {
            overlay: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.75)'
            },
            content: {
                position: 'absolute',
                top: '40px',
                left: '20%',
                right: 'auto',
                bottom: '40px',
                border: '1px solid #ccc',
                overflow: 'auto',
                WebkitOverflowScrolling: 'touch',
                borderRadius: '4px',
                outline: 'none',
                padding: '20px',
                marginRight: '20%',
                width: '1000px',

            }, zIndex: '4'
        };

        let app_edit = (e) => {
            e.preventDefault();
            var formData = new FormData();

            const profesional = document.getElementById("app_worker").value;
            formData.set('profesional', profesional);

            if (profesional == 'LUIS PARRA') formData.set('profesional_id', 0);
            if (profesional == 'CARLOS ULLOA') formData.set('profesional_id', 1);
            if (profesional == 'MARIA MARGARITA') formData.set('profesional_id', 2);
            if (profesional == 'MAYRA CEPEDA') formData.set('profesional_id', 3);

            const date = document.getElementById("app_date").value;
            formData.set('date', date);
            const time = document.getElementById("app_time").value;
            formData.set('time', time);
            const appointment_type = document.getElementById("app_type").value;
            formData.set('appointment_type', appointment_type);
            const motive = document.getElementById("app_motive").value;
            formData.set('motive', motive);
            const content = document.getElementById("app_content").value;
            formData.set('content', content);
            const details = document.getElementById("app_detail").value;
            formData.set('details', details);

            AppointmentService.update(currentItem.id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.scheduling_success_title,
                            text: swaMsg.scheduling_success_text,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        })
                        toggle_edit();
                        retrievePublish();
                    } else {
                        MySwal.fire({
                            title: swaMsg.scheduling_error_title,
                            text: swaMsg.text_error,
                            footer: swaMsg.text_footer,
                            icon: 'error',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    }
                })
                .catch(e => {
                    MySwal.fire({
                        title: swaMsg.scheduling_error_title,
                        text: swaMsg.text_error,
                        footer: swaMsg.text_footer,
                        icon: 'error',
                        confirmButtonText: swaMsg.text_btn,
                    });
                });

        }
      
        let generateCVS = (_data, _name) => {
            var rows = [];
            let _columns = [...columns]
            const headRows = _columns.filter(c => c.ignoreCSV == undefined).map(c => { return typeof c.name === 'string' ? c.name : (c.name?.props?.children ?? '') })
            rows = _data.map(d =>
                _columns.filter(c => c.ignoreCSV == undefined).map(c => {
                    if (c.cvsCB) return (String(c.cvsCB(d) ?? '')).replace(/[\n\r]+ */g, ' ')
                    else return (String(c.cell(d).props.children ?? '')).replace(/[\n\r]+ */g, ' ')
                }
                )
            );

            rows.unshift(headRows);

            let csvContent = "data:text/csv;charset=utf-8,"
                + rows.map(e => e.join(";")).join("\n");


            var encodedUri = encodeURI(csvContent);
            const fixedEncodedURI = encodedUri.replaceAll('#', '%23').replaceAll('°', 'r');

            var link = document.createElement("a");
            link.setAttribute("href", fixedEncodedURI);
            link.setAttribute("download", `${_name ?? 'LICENCIAS URBANISTICAS'}.csv`);
            document.body.appendChild(link); // Required for FF

            link.click();
        }

        return (

            <div className="space-y-6">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Calendario de Citas</h1>
                    <p className="text-sm text-muted-foreground mt-1">Gestión de citas y turnos programados</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base"><Icon name="Calendar" size={16} className="inline mr-2" />Citas para hoy</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoaded ? (
                            <DataTable
                                paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                                noDataComponent="No hay citas para este dia"
                                striped="true"
                                columns={columns}
                                data={items_2}
                                highlightOnHover
                                pagination
                                paginationPerPage={20}
                                paginationRowsPerPageOptions={[20, 50, 100]}
                                className="data-table-component"
                                noHeader
                            />
                        ) : (
                            <div className="p-8 text-center text-muted-foreground text-sm">Cargando...</div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base"><Icon name="Clock" size={16} className="inline mr-2" />Citas en proximidad</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoaded ? (
                            <DataTable
                                paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                                noDataComponent="No hay citas proximas"
                                striped="true"
                                columns={columns}
                                data={items}
                                highlightOnHover
                                pagination
                                paginationPerPage={20}
                                paginationRowsPerPageOptions={[20, 50, 100]}
                                className="data-table-component"
                                noHeader
                            />
                        ) : (
                            <div className="p-8 text-center text-muted-foreground text-sm">Cargando...</div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base"><Icon name="Archive" size={16} className="inline mr-2" />Citas pasadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Collapsible trigger={<><label className="m-2"> </label>
                            <button className="btn btn-warning btn-sm my-2"><Icon name="plus" size={16} /> Ver Lista</button></>}>
                            {isLoaded ? (
                                <>
                                <DataTable
                                    paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                                    noDataComponent="No hay citas pasadas"
                                    striped="true"
                                    columns={columns}
                                    data={items_3}
                                    highlightOnHover
                                    pagination
                                    paginationPerPage={20}
                                    paginationRowsPerPageOptions={[20, 50, 100]}
                                    className="data-table-component"
                                    defaultSortFieldId={1}
                                    defaultSortAsc={false}
                                    title={
                                        <div className="d-flex justify-content-between">
                                            <div><h5>CITAS PASADAS</h5></div>
                                            <div><Button variant="outline" size="sm" onClick={() => { generateCVS(items_3, 'CITAS') }}
                                            ><Icon name="FileSpreadsheet" size={14} /> Descargar CSV</Button></div>
                                        </div>
                                    }
                                />
                                </>
                            ) : (
                                <div className="p-8 text-center text-muted-foreground text-sm">Cargando...</div>
                            )}
                        </Collapsible>
                    </CardContent>
                </Card>

                {/* View Modal */}
                {modal && (
                    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={toggle}>
                        <Card className="w-full max-w-4xl max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between p-4 border-b border-border">
                                <h2 className="text-lg font-semibold"><Icon name="Calendar" size={18} className="inline mr-2" />Detalles de la Cita {currentItem ? currentItem.id : ''}</h2>
                                <button type="button" className="btn-close" onClick={toggle} />
                            </div>
                            <CardContent className="p-4">
                                <div className="row">
                                    <div className="col-md-6">
                                        <table className="table table-bordered table-sm table-hover text-start table-light">
                                            <tbody>
                                                {currentItem ? <>
                                                    <tr className="Collapsible text-center">
                                                        <th colSpan="2"><label>Información del Solicitante</label></th>
                                                    </tr>
                                                    <tr>
                                                        <td><label>Nombre y Apellido(s)</label></td>
                                                        <td><label className="fw-bold">{currentItem.name}</label></td>
                                                    </tr>
                                                    <tr>
                                                        <td><label>Tipo de Documentos</label></td>
                                                        <td><label className="fw-bold">{globals.form_type_id[currentItem.type_id]}</label></td>
                                                    </tr>
                                                    <tr>
                                                        <td><label>Número de Documento</label></td>
                                                        <td><label className="fw-bold">{currentItem.number_id}</label></td>
                                                    </tr>
                                                    <tr>
                                                        <td><label>Email de Contacto</label></td>
                                                        <td><label className="fw-bold">{currentItem.email}</label></td>
                                                    </tr>
                                                    <tr>
                                                        <td><label>Número de Contacto</label></td>
                                                        <td><label className="fw-bold">{currentItem.number_mobile}</label></td>
                                                    </tr>
                                                    <tr>
                                                        <td><label>Requiere asistencia por señas</label></td>
                                                        <td><label className="fw-bold">{currentItem.accesibility == true ? <label className='text-success'>Si</label> : 'No'}</label></td>
                                                    </tr>
                                                </> : ""}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="col-md-6">
                                        <table className="table table-bordered table-sm table-hover text-start table-light">
                                            <tbody>
                                                {currentItem ? <>
                                                    <tr className="Collapsible text-center">
                                                        <th colSpan="2"><label>Información de la cita</label></th>
                                                    </tr>
                                                    <tr>
                                                        <td><label>Nombre Profesional</label></td>
                                                        <td><label className="fw-bold">{currentItem.profesional}</label></td>
                                                            </tr>
                                                    <tr>
                                                        <td><label>Fecha</label></td>
                                                        <td><label className="fw-bold">{dateParser(currentItem.date)}</label></td>
                                                    </tr>
                                                    <tr>
                                                        <td><label>Hora</label></td>
                                                        <td><label className="fw-bold">{currentItem.time}</label></td>
                                                    </tr>
                                                    <tr>
                                                        <td><label>Presentación</label></td>
                                                        <td><label className="fw-bold">{currentItem.appointment_type ? "Presencial" : "Virtual"}</label></td>
                                                    </tr>
                                                    <tr>
                                                        <td><label>Tipo de Cita</label></td>
                                                        <td><label className="fw-bold">{currentItem.motive}</label></td>
                                                    </tr>
                                                    <tr>
                                                        <td colSpan="2"><label>Descripción</label></td>
                                                    </tr>
                                                    <tr>
                                                        <td colSpan="2"><label className="fw-bold">{currentItem.content}</label></td>
                                                    </tr>
                                                    <tr>
                                                        <td colSpan="2"><label>Observaciones</label></td>
                                                    </tr>
                                                    <tr>
                                                        <td colSpan="2"><label className="fw-bold">{currentItem.details}</label></td>
                                                    </tr>
                                                </> : ""}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </CardContent>
                            <div className="flex justify-end p-4 border-t border-border">
                                <Button variant="secondary" onClick={toggle}><Icon name="XCircle" size={16} /> Cerrar</Button>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Edit Modal (react-modal) */}
                <Modal contentLabel="GENERAL VIEW FUN"
                    isOpen={modal_edit}
                    style={customStyles}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <label><Icon name="Pencil" size={16} className="inline mr-2" />Actualizar la Cita {currentItem ? currentItem.id : ''}</label>
                        <button type="button" className="btn-close" onClick={toggle_edit} />
                    </div>
                    <form id="appointment_edit" onSubmit={app_edit}>
                        <div className="row">
                            <div className="col-md-6">
                                <table className="table table-bordered table-sm table-hover text-start table-light">
                                    <tbody>
                                        {currentItem ? <>
                                            <tr className="Collapsible text-center">
                                                <th colSpan="2"><label>Información del Solicitante</label></th>
                                            </tr>
                                            <tr>
                                                <td><label>Nombre y Apellido(s)</label></td>
                                                <td><label className="fw-bold">{currentItem.name}</label></td>
                                            </tr>
                                            <tr>
                                                <td><label>Tipo de Documentos</label></td>
                                                <td><label className="fw-bold">{globals.form_type_id[currentItem.type_id]}</label></td>
                                            </tr>
                                            <tr>
                                                <td><label>Número de Documento</label></td>
                                                <td><label className="fw-bold">{currentItem.number_id}</label></td>
                                            </tr>
                                            <tr>
                                                <td><label>Email de Contacto</label></td>
                                                <td><label className="fw-bold">{currentItem.email}</label></td>
                                            </tr>
                                            <tr>
                                                <td><label>Número de Contacto</label></td>
                                                <td><label className="fw-bold">{currentItem.number_mobile}</label></td>
                                            </tr>
                                            <tr>
                                                <td><label>Requiere asistencia por señas</label></td>
                                                <td><label className="fw-bold">{currentItem.accesibility == true ? <label className='text-success fw-bold'>Si</label> : 'No'}</label></td>
                                            </tr>
                                        </> : ""}
                                    </tbody>
                                </table>
                            </div>
                            <div className="col-md-6">
                                <table className="table table-bordered table-sm table-hover text-start table-light">
                                    <tbody>
                                        {currentItem ? <>
                                            <tr className="Collapsible text-center">
                                                <th colSpan="2"><label>Información de la cita</label></th>
                                            </tr>
                                            <tr>
                                                <td><label>Nombre Profesional</label></td>
                                                <td>
                                                    <select className="form-select" id="app_worker" defaultValue={(currentItem.profesional).normalize("NFD").replace(/[\u0300-\u036f]/g, "")}>
                                                        {users.map(user => <option>{`${user.name.toUpperCase()} ${user.surname.toUpperCase()}`}</option>)}
                                                    </select>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td><label>Fecha</label></td>
                                                <td>
                                                    <input type="date" max="2100-01-01" className="form-control" id="app_date"
                                                        defaultValue={currentItem.date} />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td><label>Hora</label></td>
                                                <td>
                                                    <input type="time" className="form-control" id="app_time"
                                                        defaultValue={dayjs(currentItem.time, 'hh:mm').format("HH:mm")} />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td><label>Presentación</label></td>
                                                <td>
                                                    <select className="form-select" id="app_type" defaultValue={currentItem.appointment_type ? 1 : 0}>
                                                        <option value="0">{translation.form_appointment_type_0}</option>
                                                        <option value="1">{translation.form_appointment_type_1}</option>
                                                    </select>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td><label>Tipo de Cita</label></td>
                                                <td>
                                                    <select className="form-select" id="app_motive" defaultValue={currentItem.motive}>
                                                        <option>{translation.form_motive_0}</option>
                                                        <option>{translation.form_motive_1}</option>
                                                        <option>{translation.form_motive_2}</option>
                                                        <option>{translation.form_motive_3}</option>
                                                        <option>{translation.form_motive_4}</option>
                                                    </select>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td colSpan="2"><label>Descripción</label></td>
                                            </tr>
                                            <tr>
                                                <td colSpan="2">
                                                    <textarea rows="3" defaultValue={currentItem.content} id="app_content" className="form-control"></textarea>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td colSpan="2"><label>Observaciones</label></td>
                                            </tr>
                                            <tr>
                                                <td colSpan="2">
                                                    <textarea rows="3" defaultValue={currentItem.details} id="app_detail" className="form-control"></textarea>
                                                </td>
                                            </tr>
                                        </> : ""}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="text-end py-4 mt-3">
                            <button className="btn btn-lg btn-secondary me-1"><Icon name="edit" size={16} /> GUARDAR CAMBIOS </button>
                            <Button variant="secondary" size="lg" onClick={() => toggle_edit()}><Icon name="XCircle" size={16} /> Cerrar</Button>
                        </div>
                    </form>
                </Modal>

            </div>
    );
}

export default Appointments;