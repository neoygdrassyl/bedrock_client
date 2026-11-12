import dayjs from 'dayjs';
import { SectionCard } from '@/shared/components/SectionCard';
import { DovelaBadge } from '@/shared/dovela-ui';

function FUN_G_REPORT_MASTER({ translation, swaMsg, globals, currentItem, currentVersion, nomenclature, noLaw, noArc, noEng, id }) {
        const empty_model = { version: '', worker_name: '', worker_id: '', date_asign: '', worker_prev: '' }
        // DATA GETTERS
        let _GET_CHILD_1 = () => {
            var _CHILD = currentItem.fun_1s;
            var _CURRENT_VERSION = currentVersion - 1;
            var _CHILD_VARS = {
                item_0: "",
                item_1: "",
                item_2: "",
                item_3: "",
                item_4: "",
                item_5: "",
                item_6: "",
                item_7: "",
                item_8: "",
                item_9: "",
                item_101: "",
                item_102: "",
            }
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
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
        let _GET_CHILD_CLOCK = () => {
            var _CHILD = currentItem.fun_clocks;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }

        // DATA CONVERTERS
        let _GET_CLOCK_STATE = (_state) => {
            var _CLOCK = _GET_CHILD_CLOCK();
            if (_state == null) return false;
            for (var i = 0; i < _CLOCK.length; i++) {
                if (_CLOCK[i].state == _state) return _CLOCK[i];
            }
            return false;
        }
        // COMPONENT JSX
        let _GET_ACT_RESULT = (_state) => {
            const desc = _GET_CLOCK_STATE(_state).desc;
            if (!desc) return '';
            if (desc.includes('NO CUMPLE')) return 'NO CUMPLE';
            if (desc.includes('CUMPLE')) return 'CUMPLE';
            return '';
        }
        let _ACT_ROW = (label, _state) => {
            const result = _GET_ACT_RESULT(_state);
            const date = _GET_CLOCK_STATE(_state).date_start ?? '';
            return <tr>
                <th scope="row" className="fw-normal">{label}</th>
                <td>
                    {result === 'CUMPLE' ? <DovelaBadge tone="success">Cumple</DovelaBadge> : null}
                    {result === 'NO CUMPLE' ? <DovelaBadge tone="danger">No cumple</DovelaBadge> : null}
                    {result === '' ? <span className="text-muted-foreground">Sin resultado</span> : null}
                </td>
                <td className="ew-num">
                    {date
                        ? (dayjs(date).isValid() ? dayjs(date).format('DD/MM/YYYY') : date)
                        : <span className="text-muted-foreground">Sin fecha</span>}
                </td>
            </tr>
        }
        return (
            <SectionCard id="fung_report_master" className="fun_g_mix" title="10. Acta">
                <div className="rdt_Table overflow-auto rounded-[var(--radius)] border border-border">
                    <table className="table mb-0">
                        <thead>
                            <tr>
                                <th scope="col">Acta</th>
                                <th scope="col">Resultado</th>
                                <th scope="col">Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            {_ACT_ROW('Acta de observaciones', 30)}
                            {_ACT_ROW('Acta de correcciones', 49)}
                        </tbody>
                    </table>
                </div>
            </SectionCard>
        );
}

export default FUN_G_REPORT_MASTER;