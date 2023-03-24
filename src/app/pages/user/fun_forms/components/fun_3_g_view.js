import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import DataTable from 'react-data-table-component';


import { dateParser } from '../../../../components/customClasses/typeParse'
import VIZUALIZER from '../../../../components/vizualizer.component';

const MySwal = withReactContent(Swal);
class FUN_3_G_VIEW extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    render() {
        const { _FUN_3, _FUN_6 } = this.props;
        const { } = this.state;

        // DATA GETTERS
        let _SET_CHILD_3 = () => {
            var _CHILD = _FUN_3;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _SET_CHILD_6 = () => {
            var _CHILD = _FUN_6;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }

        // DATA CONVERTERS
        let _FIND_6 = (_ID) => {
            let _LIST = _SET_CHILD_6();
            let _CHILD = [];
            for (var i = 0; i < _LIST.length; i++) {
                if (_LIST[i].id == _ID) {
                    _CHILD = _LIST[i];
                    break;
                }
            }
            return _CHILD;
        }
        let _GET_NEIGHBOUR_STATE = (_state) => {
            if (!_state) return <label className="fw-bold text-danger">PENDIENTE</label>
            else if (_state == 1) return <label className="fw-bold text-success">CITACION POSITIVA</label>
            else if (_state == 2) return <label className="fw-bold text-warning">CITACION NEGATIVA</label>
        }
        let _GET_NEIGHBOUR_ALERTS = (_alerts_info) => {
            if (!_alerts_info) return "";
            let _alerts_array = _alerts_info;
            _alerts_array = _alerts_array.split(',');
            let _ALERT = [];
            for (var i = 0; i < _alerts_array.length; i++) {
                if (_alerts_array[i].includes("ALERT_1")) 
                    if (_alerts_array[i].split('&')[1]) _ALERT.push(<><label>Periódico el {dateParser(_alerts_array[i].split('&')[1])}</label><br/></>);
                if (_alerts_array[i].includes("ALERT_2")) 
                    if (_alerts_array[i].split('&')[1])_ALERT.push(<><label>Radio el {dateParser(_alerts_array[i].split('&')[1])}</label><br/></>);
                if (_alerts_array[i].includes("ALERT_3")) 
                    if (_alerts_array[i].split('&')[1]) _ALERT.push(<><label>Pagina Web el {dateParser(_alerts_array[i].split('&')[1])}</label><br/></>);
                if (_alerts_array[i].includes("ALERT_4")) 
                    if (_alerts_array[i].split('&')[1]) _ALERT.push(<><label>Físico el {dateParser(_alerts_array[i].split('&')[1])}</label><br/></>);
            }
            return <>{_ALERT}</>
        }
        let _GET_NEIGHBOUR_ALERTS_ID6 = (_alerts_info) => {
            if (!_alerts_info) return "";
            let _alerts_array = _alerts_info;
            _alerts_array = _alerts_array.split(',');
            let _ALERT = [];
            for (var i = 0; i < _alerts_array.length; i++) {
                if (_alerts_array[i].includes("ALERT_1")) {
                    if (_alerts_array[i].split('&')[2] > 0) _ALERT.push(<>Soporte Pediódico: 
                            
                            <VIZUALIZER url={_FIND_6(_alerts_array[i].split('&')[2]).path + "/" + _FIND_6(_alerts_array[i].split('&')[2]).filename}
                            apipath={'/files/'} icon={'fas fa-cloud-download-alt'} color={'Crimson'} />

                    </>);
                }
                if (_alerts_array[i].includes("ALERT_2")) {
                    if (_alerts_array[i].split('&')[2] > 0) _ALERT.push(<>Soporte Radio: 
                            <VIZUALIZER url={_FIND_6(_alerts_array[i].split('&')[2]).path + "/" + _FIND_6(_alerts_array[i].split('&')[2]).filename}
                            apipath={'/files/'} icon={'fas fa-cloud-download-alt'} color={'Crimson'} />
                                <br/>
                    </>);
                }
                if (_alerts_array[i].includes("ALERT_3")) {
                    if (_alerts_array[i].split('&')[2] > 0) _ALERT.push(<>Soporte Pagina Web: 
                            <VIZUALIZER url={_FIND_6(_alerts_array[i].split('&')[2]).path + "/" + _FIND_6(_alerts_array[i].split('&')[2]).filename}
                            apipath={'/files/'} icon={'fas fa-cloud-download-alt'} color={'Crimson'} />
                                <br/>
                    </>);
                }
                if (_alerts_array[i].includes("ALERT_4")) {
                    if (_alerts_array[i].split('&')[2] > 0) _ALERT.push(<>Soporte Físico: 
                            <VIZUALIZER url={_FIND_6(_alerts_array[i].split('&')[2]).path + "/" + _FIND_6(_alerts_array[i].split('&')[2]).filename}
                            apipath={'/files/'} icon={'fas fa-cloud-download-alt'} color={'Crimson'} />
                    </>);
                }
            }
            return <>{_ALERT}</>
        }

        let _CHILD_3_LIST = () => {
            let _LIST = _SET_CHILD_3();
            const columns_3 = [
                {
                    name: <label>DIRECCIÓN DEL PREDIO</label>,
                    selector: 'direccion_1',
                    sortable: true,
                    filterable: true,
                    cell: row => <label>{row.direccion_1}</label>
                },
                {
                    name: <label>DIRECCIÓN DE CORRESPONDENCIA</label>,
                    selector: 'direccion_2',
                    sortable: true,
                    filterable: true,
                    cell: row => <label>{row.direccion_2}</label>
                },
                {
                    name: <label>ORIGEN DATO</label>,
                    cell: row => <label>{row.extra ? <label className="text-warning fw-bold">Añadido por la Curaduria</label> : "Diligenciado por el solicitante"}</label>
                },
                {
                    name: <label>¿SE DECLARÓ PARTE?</label>,
                    cell: row => <label>{row.part} - {row.part_id}</label>
                },
                {
                    name: <label>ESTADO CITACIÓN</label>,
                    selector: 'row.state',
                    sortable: true,
                    filterable: true,
                    cell: row => <label>{_GET_NEIGHBOUR_STATE(row.state)}</label>
                },
                {
                    name: <label>CONSECUTIVO RELACIONADO</label>,
                    selector: 'id_cub',
                    sortable: true,
                    filterable: true,
                    cell: row => <label>{row.id_cub}</label>
                },
                {
                    name: <label>GUIÁ DE CONFIRMACIÓN</label>,
                    selector: 'id_alerted',
                    sortable: true,
                    filterable: true,
                    cell: row => <label>{row.id_alerted == "-1"
                        ? ""
                        : row.id_alerted}</label>
                },
                {
                    name: <label>FECHA RECIBIDO</label>,
                    selector: 'alerted',
                    sortable: true,
                    filterable: true,
                    cell: row => <label>{row.state == 1 ? dateParser(row.alerted) : ""}</label>
                },
                {
                    name: <label>MÉTODOS DE PUBLICACIÓN</label>,
                    minWidth: '250px',
                    cell: row => <label>{_GET_NEIGHBOUR_ALERTS(row.alters_info)}</label>
                },
                {
                    name: <label>SOPORTES DE PUBLICACIÓN</label>,
                    minWidth: '200px',
                    cell: row => <label>{_GET_NEIGHBOUR_ALERTS_ID6(row.alters_info)}</label>
                },
                {
                    name: <label>DOCUMENTO</label>,
                    button: true,
                    minWidth: '150px',
                    cell: row => <>
                        {row.id_6
                            ? 
                            <VIZUALIZER url={_FIND_6(row.id_6).path + "/" + _FIND_6(row.id_6).filename}
                            apipath={'/files/'} />
                            : ""}</>
                },
            ]
            return <DataTable
                paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                noDataComponent="No hay Items"
                striped="true"
                columns={columns_3}
                data={_LIST}
                highlightOnHover
                pagination
                paginationPerPage={5}
                paginationRowsPerPageOptions={[5, 10, 15]}
                className="data-table-component"
                noHeader
            />
        }


        return (
            <div>
                {_CHILD_3_LIST()}
            </div>
        );
    }
}

export default FUN_3_G_VIEW;