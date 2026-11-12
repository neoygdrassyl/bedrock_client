import VIZUALIZER from '../../../../../shared/components/vizualizer.component';
import FUN_REPORT_DATA from './fun_report_data';
import dayjs from 'dayjs';
import { SectionCard, SectionSubheading, DataGrid, DataField } from '@/shared/components/SectionCard';

function FUN_G_MIX({ translation, swaMsg, globals, currentItem, currentVersion }) {

        // DATA GETTERS
        let _SET_CHILD_1 = () => {
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
        let _SET_CHILD_6 = () => {
            var _CHILD = currentItem.fun_6s;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _SET_CHILD_LAW = () => {
            var _CHILD = currentItem.fun_law;
            var _CHILD_VARS = {
                sign: null,
                new_type: null,
                publish_neighbour: null,
                alters_info: [],
            }
            if (_CHILD) {
                _CHILD_VARS.id = _CHILD.id;
                _CHILD_VARS.sign = _CHILD.sign;
                _CHILD_VARS.new_type = _CHILD.new_type;
                _CHILD_VARS.publish_neighbour = _CHILD.publish_neighbour;
                _CHILD_VARS.alters_info = _CHILD.alters_info ? _CHILD.alters_info : [];
            }
            return _CHILD_VARS;
        }

        // DATA CONVERTERS
        let _GET_SIGN = () => {
            var _CHILD = _SET_CHILD_LAW()
            var sign = [];
            if (_CHILD.sign) {
                sign = _CHILD.sign.split(',')
            }
            return sign;
        }
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

        // COMPONENT JSX
        let _COMPONENT_SIGN = () => {
            const signDocument = _GET_SIGN()[0];
            const signDate = _GET_SIGN()[1];
            // Same options the "Publicidad" form offers for this field.
            let signLabel = '';
            if (signDocument == -1) signLabel = 'Aportado físicamente';
            else if (signDocument == 0) signLabel = 'Sin documento';
            else if (signDocument > 0) signLabel = _FIND_6(signDocument).description || 'Documento anexo';
            return <DataGrid>
                <DataField label="Foto de valla o aviso">
                    {signLabel ? <span className="inline-flex items-center gap-2">
                        {signLabel}
                        {signDocument > 0
                            ?
                            <VIZUALIZER url={_FIND_6(signDocument).path + "/" + _FIND_6(signDocument).filename}
                                apipath={'/files/'} />
                            : ""}
                    </span> : null}
                </DataField>
                <DataField label="Fecha de radicación" mono value={signDate && dayjs(signDate).isValid() ? dayjs(signDate).format('DD/MM/YYYY') : signDate} />
            </DataGrid>
        }
        let rules = currentItem ? currentItem.rules ? currentItem.rules.split(';') : [] : [];
        const notApplicable = <p className="m-0 text-sm text-muted-foreground">No aplica.</p>;
        return (
            <SectionCard id="fung_mix" className="fun_g_mix" title="8. Datos varios">
                <SectionSubheading id="fung_mix_sign" className="ew-subheading--first">8.1 Publicidad</SectionSubheading>
                {rules[0] != 1 ?
                    _COMPONENT_SIGN()
                    : notApplicable
                }

                <SectionSubheading id="fung_mix_report">8.2 Reporte de planeación</SectionSubheading>
                {_SET_CHILD_1().item_1.includes('F')
                    ? <>
                        <FUN_REPORT_DATA
                            translation={translation} swaMsg={swaMsg} globals={globals}
                            currentItem={currentItem}
                            currentVersion={currentVersion} />
                    </>
                    : notApplicable
                }
            </SectionCard>
        );
}

export default FUN_G_MIX;
