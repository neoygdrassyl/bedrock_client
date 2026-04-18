import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import DataTable from '@/components/data-table-bridge';


import { dateParser } from '../../../../components/customClasses/typeParse'
import VIZUALIZER from '../../../../components/vizualizer.component';

const MySwal = withReactContent(Swal);
function FUN_3_G_VIEW({ _FUN_3, _FUN_6 }) {

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
                    name: 'DIRECCIÓN DEL PREDIO',
                    selector: row => row.direccion_1,
                    sortable: true,
                    filterable: true,
                    cell: row => <span className="text-sm">{row.direccion_1}</span>
                },
                {
                    name: 'DIRECCIÓN DE CORRESPONDENCIA',
                    selector: row => row.direccion_2,
                    sortable: true,
                    filterable: true,
                    cell: row => <span className="text-sm">{row.direccion_2}</span>
                },
                {
                    name: 'ORIGEN DATO',
                    cell: row => <span className="text-sm">{row.extra ? <label className="text-warning fw-bold">Añadido por la Curaduria</label> : "Diligenciado por el solicitante"}</span>
                },
                {
                    name: '¿SE DECLARÓ PARTE?',
                    cell: row => <label>{row.part} - {row.part_id}</label>
                },
                {
                    name: 'ESTADO CITACIÓN',
                    selector: row => row.state,
                    sortable: true,
                    filterable: true,
                    cell: row => <span className="text-sm">{_GET_NEIGHBOUR_STATE(row.state)}</span>
                },
                {
                    name: 'CONSECUTIVO RELACIONADO',
                    selector: row => row.id_cub,
                    sortable: true,
                    filterable: true,
                    cell: row => <span className="text-sm">{row.id_cub}</span>
                },
                {
                    name: 'GUIÁ DE CONFIRMACIÓN',
                    selector: row => row.id_alerted,
                    sortable: true,
                    filterable: true,
                    cell: row => <span className="text-sm">{row.id_alerted == "-1"
                        ? ""
                        : row.id_alerted}</span>
                },
                {
                    name: 'FECHA RECIBIDO',
                    selector: row => row.alerted,
                    sortable: true,
                    filterable: true,
                    cell: row => <span className="text-sm">{row.state == 1 ? dateParser(row.alerted) : ""}</span>
                },
                {
                    name: 'MÉTODOS DE PUBLICACIÓN',
                    minWidth: '250px',
                    cell: row => <span className="text-sm">{_GET_NEIGHBOUR_ALERTS(row.alters_info)}</span>
                },
                {
                    name: 'SOPORTES DE PUBLICACIÓN',
                    minWidth: '200px',
                    cell: row => <span className="text-sm">{_GET_NEIGHBOUR_ALERTS_ID6(row.alters_info)}</span>
                },
                {
                    name: 'DOCUMENTO',
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

export default FUN_3_G_VIEW;