import { formsParser1, _GET_SERIE_COD, _GET_SUBSERIE_COD, _IDENTIFY_SERIES, _GET_SERIE_STR, _GET_SUBSERIE_STR } from '../../../../components/customClasses/typeParse';
import { EditableDataGrid } from '@/components/editable-data-grid';

function RECORD_ARC_32({ translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR }) {

        let _GET_CHILD_1 = () => {
            var _CHILD = currentItem.fun_1s;
            var _CURRENT_VERSION = currentVersion - 1;
            var _CHILD_VARS = {
                id: "",
                tipo: "",
                tramite: "",
                m_urb: "",
                m_sub: "",
                m_lic: "",
                usos: "",
                area: "",
                vivienda: "",
                cultural: "",
                regla_1: "",
                regla_2: "",
            }
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD_VARS.id = _CHILD[_CURRENT_VERSION].id;
                    _CHILD_VARS.tipo = _CHILD[_CURRENT_VERSION].tipo;
                    _CHILD_VARS.tramite = _CHILD[_CURRENT_VERSION].tramite;
                    _CHILD_VARS.m_urb = _CHILD[_CURRENT_VERSION].m_urb;
                    _CHILD_VARS.m_sub = _CHILD[_CURRENT_VERSION].m_sub;
                    _CHILD_VARS.m_lic = _CHILD[_CURRENT_VERSION].m_lic;
                    _CHILD_VARS.usos = _CHILD[_CURRENT_VERSION].usos;
                    _CHILD_VARS.area = _CHILD[_CURRENT_VERSION].area;
                    _CHILD_VARS.vivienda = _CHILD[_CURRENT_VERSION].vivienda;
                    _CHILD_VARS.cultural = _CHILD[_CURRENT_VERSION].cultural;
                    _CHILD_VARS.regla_1 = _CHILD[_CURRENT_VERSION].regla_1;
                    _CHILD_VARS.regla_2 = _CHILD[_CURRENT_VERSION].regla_2;

                    _CHILD_VARS.item_0 = _CHILD[_CURRENT_VERSION].id;
                    _CHILD_VARS.item_1 = _CHILD[_CURRENT_VERSION].tipo ? _CHILD[_CURRENT_VERSION].tipo : "";
                    _CHILD_VARS.item_2 = _CHILD[_CURRENT_VERSION].tramite ? _CHILD[_CURRENT_VERSION].tramite : "";
                    _CHILD_VARS.item_3 = _CHILD[_CURRENT_VERSION].m_urb ? _CHILD[_CURRENT_VERSION].m_urb : "";
                    _CHILD_VARS.item_4 = _CHILD[_CURRENT_VERSION].m_sub ? _CHILD[_CURRENT_VERSION].m_sub : "";
                    _CHILD_VARS.item_5 = _CHILD[_CURRENT_VERSION].m_lic ? _CHILD[_CURRENT_VERSION].m_lic : "";
                    _CHILD_VARS.item_6 = _CHILD[_CURRENT_VERSION].usos ? _CHILD[_CURRENT_VERSION].usos : "";
                    _CHILD_VARS.item_7 = _CHILD[_CURRENT_VERSION].area ? _CHILD[_CURRENT_VERSION].area : "";
                    _CHILD_VARS.item_8 = _CHILD[_CURRENT_VERSION].vivienda ? _CHILD[_CURRENT_VERSION].vivienda : "";
                    _CHILD_VARS.item_9 = _CHILD[_CURRENT_VERSION].cultural ? _CHILD[_CURRENT_VERSION].cultural : "";
                    _CHILD_VARS.item_101 = _CHILD[_CURRENT_VERSION].regla_1 ? _CHILD[_CURRENT_VERSION].regla_1 : "";
                    _CHILD_VARS.item_102 = _CHILD[_CURRENT_VERSION].regla_2 ? _CHILD[_CURRENT_VERSION].regla_2 : "";
                }
            }
            return _CHILD_VARS;
        }
        // COMPONENT JSX

        let _COMPONENT = () => {
            let _CHILD = _GET_CHILD_1();

            return <dl className="record-arc-request-type mt-2 mb-0 rounded-md border border-border bg-slate-50 px-3 py-2 dark:bg-slate-800/40">
                <dt className="mb-1 text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">Tipo de trámite</dt>
                <dd className="mb-0 text-[11px] font-medium text-foreground">{formsParser1(_CHILD)}</dd>
            </dl>
        }
        let _COMPONENT_SERIES = () => {
            let _CHILD = _GET_CHILD_1();
            let _SERIE = _GET_SERIE_COD(_CHILD);
            let _SUBSERIE = _GET_SUBSERIE_COD(_CHILD);
            let _SERIE_STR = _GET_SERIE_STR(_CHILD)
            let _SUBSERIE_STR = _GET_SUBSERIE_STR(_CHILD);
            const columns = [
                { id: 'documental-type', header: 'Tipo documental', width: 210 },
                { id: 'code', header: 'Código', width: 130, align: 'center' },
                { id: 'description', header: 'Descripción' },
            ];
            const rows = [
                [
                    { id: 'serie', value: 'Serie Documental:', readOnly: true, className: 'font-semibold' },
                    { value: _SERIE, readOnly: true },
                    {
                        value: _SERIE_STR[0] ?? 'No se encuentra Serie',
                        content: _SERIE_STR[0] ?? <label className='text-danger'>No se encuentra Serie</label>,
                        readOnly: true,
                        className: 'font-semibold',
                    },
                ],
                [
                    { id: 'subserie', value: 'Subserie Documental:', readOnly: true, className: 'font-semibold' },
                    { value: _SUBSERIE.length == 1 ? _SUBSERIE[0] : '', readOnly: true },
                    {
                        value: _SUBSERIE_STR[0] ?? 'No se encuentra Subserie',
                        content: _SUBSERIE_STR[0] ?? <label className='text-danger'>No se encuentra Subserie</label>,
                        readOnly: true,
                        className: 'font-semibold',
                    },
                ],
            ];

            return <EditableDataGrid
                ariaLabel="Serie y subserie documental"
                columns={columns}
                rows={rows}
                getRowId={(row) => row[0].id}
                spreadsheetInteractions={false}
                fillWidth
            />
        }


        return (
            <div className="record_arc_31 w-full">
                {_COMPONENT_SERIES()}
                {_COMPONENT()}
        
            </div >
        );
}

export default RECORD_ARC_32;
