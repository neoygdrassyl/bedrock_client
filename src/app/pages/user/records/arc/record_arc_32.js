import React, { Component } from 'react';
import Series from '../../../../components/jsons/funCodes.json';
import { formsParser1, SERIES_MODULES_RELATION, SUBSERIES_MODULES_RELATION, _GET_SERIE_COD, _GET_SUBSERIE_COD, _IDENTIFY_SERIES } from '../../../../components/customClasses/typeParse';

class RECORD_ARC_32 extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR } = this.props;
        const { } = this.state;

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

            return <>
                <textarea className="input-group" defaultValue={formsParser1(_CHILD)} disabled></textarea>
            </>
        }
        let _COMPONENT_SERIES = () => {
            let _CHILD = _GET_CHILD_1();
            let _SERIE = _GET_SERIE_COD(_CHILD);
            let _SUBSERIE = _GET_SUBSERIE_COD(_CHILD);
            return <>
                <div className="row my-2">
                    <div className="col-3">
                        <label className="fw-bold ms-4">Serie Documental:</label>
                    </div>
                    <div className="col-2">
                        <label className='fw-bold'>{_SERIE}</label>
                    </div>
                    <div className="col">
                        <label className='fw-bold'>{Series[_SERIE] ?? <label className='text-danger'>No se encuentra Serie</label>}</label>
                    </div>
                </div>

                <div className="row my-2">
                    <div className="col-3">
                        <label className="fw-bold ms-4">Subserie Documental:</label>
                    </div>
                    <div className="col-2">
                        <label className='fw-bold'>{_SUBSERIE.length == 1 ? _SUBSERIE[0] : ''}</label>
                    </div>
                    <div className="col">
                        <label className='fw-bold'>{Series[_SUBSERIE] ?? <label className='text-danger'>No se encuentra Subserie</label>}</label>
                    </div>
                </div>
            </>
        }


        return (
            <div className="record_arc_31 container">
                {_COMPONENT_SERIES()}
                {_COMPONENT()}
        
            </div >
        );
    }
}

export default RECORD_ARC_32;