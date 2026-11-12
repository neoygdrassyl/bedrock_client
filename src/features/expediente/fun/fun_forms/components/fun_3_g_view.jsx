import { Children } from 'react';
import dayjs from 'dayjs';
import DataTable from '@/shared/components/data-table-bridge';


import { dateParser } from '../../../../../shared/config/customClasses/typeParse'
import VIZUALIZER from '../../../../../shared/components/vizualizer.component';
import { DovelaBadge } from '@/shared/dovela-ui';

// Publication-support download icon: categorical token from index.css.
const SUPPORT_COLOR = 'hsl(var(--doc-key-support))';

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
            if (!_state) return <DovelaBadge tone="danger">Pendiente</DovelaBadge>
            else if (_state == 1) return <DovelaBadge tone="success">Citación positiva</DovelaBadge>
            else if (_state == 2) return <DovelaBadge tone="warning">Citación negativa</DovelaBadge>
        }
        let _GET_NEIGHBOUR_ALERTS = (_alerts_info) => {
            if (!_alerts_info) return null;
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
            return _ALERT.length ? <>{Children.toArray(_ALERT)}</> : null;
        }
        let _GET_NEIGHBOUR_ALERTS_ID6 = (_alerts_info) => {
            if (!_alerts_info) return null;
            let _alerts_array = _alerts_info;
            _alerts_array = _alerts_array.split(',');
            let _ALERT = [];
            for (var i = 0; i < _alerts_array.length; i++) {
                if (_alerts_array[i].includes("ALERT_1")) {
                    if (_alerts_array[i].split('&')[2] > 0) _ALERT.push(<>Soporte periódico:
                            
                            <VIZUALIZER url={_FIND_6(_alerts_array[i].split('&')[2]).path + "/" + _FIND_6(_alerts_array[i].split('&')[2]).filename}
                            apipath={'/files/'} icon={'Download'} color={SUPPORT_COLOR} />

                    </>);
                }
                if (_alerts_array[i].includes("ALERT_2")) {
                    if (_alerts_array[i].split('&')[2] > 0) _ALERT.push(<>Soporte radio:
                            <VIZUALIZER url={_FIND_6(_alerts_array[i].split('&')[2]).path + "/" + _FIND_6(_alerts_array[i].split('&')[2]).filename}
                            apipath={'/files/'} icon={'Download'} color={SUPPORT_COLOR} />
                                <br/>
                    </>);
                }
                if (_alerts_array[i].includes("ALERT_3")) {
                    if (_alerts_array[i].split('&')[2] > 0) _ALERT.push(<>Soporte página web:
                            <VIZUALIZER url={_FIND_6(_alerts_array[i].split('&')[2]).path + "/" + _FIND_6(_alerts_array[i].split('&')[2]).filename}
                            apipath={'/files/'} icon={'Download'} color={SUPPORT_COLOR} />
                                <br/>
                    </>);
                }
                if (_alerts_array[i].includes("ALERT_4")) {
                    if (_alerts_array[i].split('&')[2] > 0) _ALERT.push(<>Soporte físico:
                            <VIZUALIZER url={_FIND_6(_alerts_array[i].split('&')[2]).path + "/" + _FIND_6(_alerts_array[i].split('&')[2]).filename}
                            apipath={'/files/'} icon={'Download'} color={SUPPORT_COLOR} />
                    </>);
                }
            }
            return _ALERT.length ? <>{Children.toArray(_ALERT)}</> : null;
        }

        // Empty cells read as an explicit dash, like "¿Se declaró parte?".
        const EMPTY_CELL = <span className="text-sm text-muted-foreground">—</span>;
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
                    cell: row => <span className="text-sm">{row.extra ? <span className="ew-text-warning font-medium">Añadido por la Curaduría</span> : "Diligenciado por el solicitante"}</span>
                },
                {
                    name: '¿SE DECLARÓ PARTE?',
                    cell: row => row.part || row.part_id
                        ? <span className="text-sm">{row.part} - {row.part_id}</span>
                        : <span className="text-sm text-muted-foreground">—</span>
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
                    cell: row => row.id_cub ? <span className="ew-num text-sm">{row.id_cub}</span> : EMPTY_CELL
                },
                {
                    name: 'GUÍA DE CONFIRMACIÓN',
                    selector: row => row.id_alerted,
                    sortable: true,
                    filterable: true,
                    cell: row => row.id_alerted && row.id_alerted != "-1"
                        ? <span className="ew-num text-sm">{row.id_alerted}</span>
                        : EMPTY_CELL
                },
                {
                    name: 'FECHA RECIBIDO',
                    selector: row => row.alerted,
                    sortable: true,
                    filterable: true,
                    cell: row => row.state == 1 && row.alerted
                        ? <span className="ew-num text-sm">{dayjs(row.alerted).format('DD/MM/YYYY')}</span>
                        : EMPTY_CELL
                },
                {
                    name: 'MÉTODOS DE PUBLICACIÓN',
                    minWidth: '250px',
                    cell: row => <span className="text-sm">{_GET_NEIGHBOUR_ALERTS(row.alters_info) ?? EMPTY_CELL}</span>
                },
                {
                    name: 'SOPORTES DE PUBLICACIÓN',
                    minWidth: '200px',
                    cell: row => <span className="text-sm">{_GET_NEIGHBOUR_ALERTS_ID6(row.alters_info) ?? EMPTY_CELL}</span>
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
                            : EMPTY_CELL}</>
                },
            ]
            return <DataTable
                paginationComponentOptions={{ rowsPerPageText: 'Filas por página', rangeSeparatorText: 'de' }}
                noDataComponent="Sin vecinos colindantes registrados"
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