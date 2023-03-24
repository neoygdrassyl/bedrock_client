import React, { Component } from 'react';
import { dateParser, dateParser_timeLeft, dateParser_finalDate, dateParser_dateDiff } from '../../../../components/customClasses/typeParse'
import DataTable, { Alignment } from 'react-data-table-component';

class PQRS_COMPONENT_CLOCKS extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { translation, swaMsg, globals, translation_form, currentItem } = this.props;
        const { } = this.state;

        // DATA GETTERS 
        let get_PQRS_TIME = () => {
            if (currentItem.pqrs_time) return currentItem.pqrs_time;
            return {
                creation: '',
                creation: false,
                time: 30,
                legal: false,
                reply_formal: false,
            }
        }
        let _GET_NOTIFY_CONTEXT = (_value, _date) => {
            if (_value == 0) return <label className="text-warning">PENDIENTE</label>
            if (_value == 1) return <label className="text-success">SI CONSTANCIA FISICA DE RADICACION - {dateParser(_date)}</label>
            if (_value == 2) return <label className="text-success">SI - CORREO ELECTRONICO DE RECIBIDO</label>
            if (_value == 3) return <label className="text-danger">NO</label>
            if (_value == 4) return <label className="text-success">SI CONSTANCIA FISICA DE OFICIO - {dateParser(_date)}</label>
            if (_value == 5) return <label className="text-success">SI - CORREO ELECTRONICO</label>

        }

        let _GET_CONTACTS = () => {
            return currentItem.pqrs_contacts;
        }

        const SHOW_NOTIFICATIONS = () => {
            var _LIST = _GET_CONTACTS();
            
            const columns = [
                {
                    name: <label><b>CONTACTO</b></label>,
                    selector: 'name',
                    minWidth: '100px',
                    sortable: true,
                    filterable: true,
                    cell: row => <h6 className="pt-3 text-center">{row.email ? row.email : row.address}</h6>
                },
                {
                    name: <label><b>NOTIFICACIÓN - CONFIRMACIÓN</b></label>,
                    selector: row => row.competence,
                    minWidth: '100px',
                    sortable: true,
                    filterable: true,
                    cell: row => <h6>{ row.notify_confirm ? _GET_NOTIFY_CONTEXT(row.notify_confirm, row.notify_confirm_date) : <label className="text-warning">PENDIENTE</label> }</h6>
                },
                {
                    name: <label><b>NOTIFICACIÓN - EXTENSION</b></label>,
                    selector: 'asign',
                    minWidth: '100px',
                    sortable: true,
                    filterable: true,
                    cell: row => <h6>{ row.notify_reply ? _GET_NOTIFY_CONTEXT(row.notify_reply, row.notify_date): <label className="text-warning">PENDIENTE</label>}</h6>,
                },
                {
                    name: <label><b>NOTIFICACIÓN - OFICIO RESPUESTA</b></label>,
                    selector: 'asign',
                    minWidth: '100px',
                    sortable: true,
                    omit: currentItem.pqrs_law ? currentItem.pqrs_law.extension ? 0 : 1 : 1,
                    filterable: true,
                    cell: row => <h6>{row.notify_extension  && row.notify_extension_date ? _GET_NOTIFY_CONTEXT(row.notify_extension, row.notify_extension_date) : <label className="text-warning">PENDIENTE</label> }</h6>
                },
            ]
            var _COMPONENT = <DataTable
                paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                noDataComponent="No hay mensajes"
                striped="true"
                columns={columns}
                data={_LIST}
                highlightOnHover
                className="data-table-component"
                noHeader
            />
            return _COMPONENT;
        }

       // var  validation = currentItem.pqrs_law ? currentItem.pqrs_law.extension == true : null;
        var validation_extension = currentItem.pqrs_law ? currentItem.pqrs_law.extension == true : null;

        // COMPONENTS JSX
        let _TIME_CONTROL_COMPONENT = () => {
            let pTime = get_PQRS_TIME();
            let ext = currentItem.pqrs_law ? currentItem.pqrs_law.extension ? 2 : 1 : 1;
            return <>            
                <div class="container">
                    <div class="row align-items-center">
                        <div class="col-3">

                            <div className="col">
                                <lavel>Fecha inicio de terminos</lavel>
                            </div>
                            <div className="col">
                                <lavel>Fecha limite de respuesta</lavel>
                            </div>
                            <div className="col">
                                <lavel>Termino legal de respuesta</lavel>
                            </div>
                            <div className="col">
                                <lavel>(Con prorroga)</lavel>
                            </div>
                            {pTime.reply_formal ? <>
                                <div className="col">

                                    <lavel>Fecha envío respuesta</lavel>
                                </div>
                                <div className="col">
                                    <lavel>Tiempo real de respuesta</lavel>
                                </div>
                            </> : <>
                                <div className="col">
                                    <lavel>Tiempo de Respuesta Restante</lavel>
                                </div>
                                <div className="col">
                                    <lavel>Fecha Limite Respuesta</lavel>
                                </div>
                            </>}
                          


                        </div>
                        <div class="col-3">
                            <div className="col">
                                <label className="fw-bold">{dateParser(pTime.legal)}</label>
                            </div>
                            <div className="col">
                                <label className="fw-bold">{dateParser(dateParser_finalDate(pTime.legal, pTime.time))}</label>
                            </div>
                            <div className="col">
                                <label className="fw-bold">{pTime.time * (ext)} Dia(s) hábiles</label>
                            </div>
                            <div className="col">
                                <label className="fw-bold">{validation_extension ? <label className='text-warning'>Si</label> : <label>No</label>} </label>
                            </div>
                            {pTime.reply_formal
                                ? <>
                                    <div className="col">
                                        <label className="fw-bold">{dateParser(pTime.reply_formal)}</label>
                                    </div>
                                    <div className="col">
                                        <label className="fw-bold">{dateParser_dateDiff(pTime.legal, pTime.reply_formal) + ' dia(s) calendario'}</label>
                                    </div>
                                </> :
                                <>
                                    <div className="col">
                                        <label className="fw-bold">{dateParser_timeLeft(pTime.legal, pTime.time * (ext))} Dia(s) habiles</label>
                                    </div>
                                    <div className="col">
                                        <label className="fw-bold">{dateParser(dateParser_finalDate(pTime.legal, pTime.time * (ext)))}</label>
                                    </div>
                                </>}
                          
                        </div>
                        <div class="col-6">
                            {SHOW_NOTIFICATIONS()}
                        </div>
                    </div>
                </div>











                 

                

            </>
        }
        let _ACTION_REVIEW_COMPONENT = () => {
            return <>
                <hr />
                <div className="row">
                    <labal className="fw-bold">Acción de Mejora</labal>
                    <div className="col-12">
                        <lavel>{currentItem.action_review}</lavel>
                    </div>
                </div>
            </>
        }

        // DATA CONVERTERS


        return (
            <div>
                {_TIME_CONTROL_COMPONENT()}
                {currentItem.action_review
                    ? <>
                        {_ACTION_REVIEW_COMPONENT()}
                    </>
                    : ""}
            </div>
        );
    }
}

export default PQRS_COMPONENT_CLOCKS;