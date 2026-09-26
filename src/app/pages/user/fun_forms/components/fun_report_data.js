import { dateParser, dateParser_finalDate } from '../../../../components/customClasses/typeParse';
import VIZUALIZER from '../../../../components/vizualizer.component';
import { EditableDataGrid } from '@/components/editable-data-grid';

function FUN_REPORT_DATA({ translation, swaMsg, globals, currentItem }) {


        // DATA GETERS
        function formatNumber(num) {
            return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
        }
        let _GET_CHILD_6 = () => {
            var _CHILD = currentItem.fun_6s;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _FIND_6 = (_ID) => {
            let _LIST = _GET_CHILD_6();
            let _CHILD = [];
            for (var i = 0; i < _LIST.length; i++) {
                if (_LIST[i].id == _ID) {
                    _CHILD = _LIST[i];
                    break;
                }
            }
            return _CHILD;
        }
        let _GET_CHILD_LAW = () => {
            var _CHILD = currentItem.fun_law;
            var _CHILD_VARS = {
                report_data: [],
                report_cub: "",
            }
            if (_CHILD != null) {
                _CHILD_VARS.report_data = _CHILD.report_data ? _CHILD.report_data: [];
                _CHILD_VARS.report_cub = _CHILD.report_cub ? _CHILD.report_cub: "";
            }
            return _CHILD_VARS;
        }
        let _GET_LAW_REPORT_DATA = () => {
            var _CHILD = _GET_CHILD_LAW();
            if (_CHILD.report_data.length) {
                return _CHILD.report_data.split(",");
            }
            return [];
        }
        let _GET_NOTIFY = (_VALUE) => {
            if (_VALUE == 0) return <label className="text-danger">SIN NOTIFICAR</label>
            if (_VALUE == 1) return <label className="text-success">NOTIFICADO</label>
        }
        // COMPONENTS JSX
        let _COMPONENT = () => {
            var _CHILD = _GET_LAW_REPORT_DATA();
            const columns = [
                { id: 'field', header: 'Dato SPM', width: 480 },
                { id: 'value', header: 'Valor', width: 280 },
            ];
            const rows = [
                [
                    { id: 'notification', value: 'CUB1 notifico reconocimiento a la –SPM-', readOnly: true },
                    { value: _CHILD[0] == 0 ? 'SIN NOTIFICAR' : _CHILD[0] == 1 ? 'NOTIFICADO' : '', content: _GET_NOTIFY(_CHILD[0]), readOnly: true },
                ],
                [
                    { id: 'office-id', value: 'Identificación del oficio', readOnly: true },
                    { value: _GET_CHILD_LAW().report_cub, readOnly: true },
                ],
                [
                    { id: 'filing-date', value: 'Fecha de Radicación ante la SPM', readOnly: true },
                    { value: dateParser(_CHILD[2]), readOnly: true },
                ],
                [
                    { id: 'filing-response', value: 'Respuesta SPM radicación', readOnly: true },
                    { value: _CHILD[3], readOnly: true },
                ],
                [
                    { id: 'deadline', value: 'Fecha Limite (Fecha radicacion mas 10 dias hábiles)', readOnly: true },
                    { value: dateParser_finalDate(_CHILD[2], 10), readOnly: true },
                ],
                [
                    { id: 'planning-office', value: 'Oficio de Planeacion', readOnly: true },
                    { value: _CHILD[5], readOnly: true },
                ],
                [
                    { id: 'planning-report', value: 'Reporte de Planeacion', readOnly: true },
                    {
                        value: _CHILD[6] > 0 ? 'Reporte de Planeacion' : 'SIN DOCUMENTO',
                        content: _CHILD[6] > 0
                            ? <VIZUALIZER url={_FIND_6(_CHILD[6]).path + "/" + _FIND_6(_CHILD[6]).filename} apipath={'/files/'} />
                            : <label className="fw-bold">SIN DOCUMENTO</label>,
                        readOnly: true,
                    },
                ],
            ];

            return <EditableDataGrid
                ariaLabel="Datos SPM"
                columns={columns}
                rows={rows}
                getRowId={(row) => row[0].id}
                spreadsheetInteractions={false}
            />
        }
        return (
            <div className="fun_report_data container">
                {_COMPONENT()}
            </div >
        );
}

export default FUN_REPORT_DATA;
