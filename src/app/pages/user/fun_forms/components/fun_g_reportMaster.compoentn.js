import React, { Component } from 'react';

class FUN_G_REPORT_MASTER extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion, nomenclature, noLaw, noArc, noEng, id } = this.props;
        const { } = this.state;
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
        let _COMPONENT_REPORT_MASTER = () => {
            return <>
                <div className="row mb-2">
                    <div className="col-6">
                        <div class="input-group">
                            <input type="text" class="form-control me-1" id="r_l_review_1"
                                defaultValue={'Acta de Observaciones'} disabled />
                        </div>
                    </div>
                    <div className="col-3">
                        <input type="text" class="form-control me-1" id="r_l_review_1"
                            defaultValue={_GET_CLOCK_STATE(30).desc ? _GET_CLOCK_STATE(30).desc.includes('NO CUMPLE')
                            ? 'NO CUMPLE' : _GET_CLOCK_STATE(30).desc.includes('CUMPLE')
                                ? 'CUMPLE' : '': ''} disabled />
                    </div>
                    <div className="col-3">
                        <input type="date" class="form-control me-1" id="r_l_review_3" max="2100-01-01" disabled
                            defaultValue={_GET_CLOCK_STATE(30).date_start ?? ''} />
                    </div>
                </div>
                <div className="row mb-2">
                    <div className="col-6">
                        <div class="input-group">
                            <input type="text" class="form-control me-1" id="r_l_review_1"
                                defaultValue={'Acta de Correciones'} disabled />
                        </div>
                    </div>
                    <div className="col-3">
                        <input type="text" class="form-control me-1" id="r_l_review_1"
                            defaultValue={_GET_CLOCK_STATE(49).desc ? _GET_CLOCK_STATE(49).desc.includes('NO CUMPLE')
                                ? 'NO CUMPLE' : _GET_CLOCK_STATE(49).desc.includes('CUMPLE')
                                    ? 'CUMPLE' : '': ''} disabled />
                    </div>
                    <div className="col-3">
                        <input type="date" class="form-control me-1" id="r_l_review_3" max="2100-01-01" disabled
                            defaultValue={_GET_CLOCK_STATE(49).date_start ?? ''} />
                    </div>
                </div>
            </>
        }
        return (
            <div className="fun_g_mix">

                <legend className="my-2 px-3 text-uppercase Collapsible" id="fung_report_master">
                    <label className="app-p lead text-center fw-normal text-uppercase">10. ACTA <i class="fas fa-file-contract me-2"></i></label>
                </legend>

                {_COMPONENT_REPORT_MASTER()}
            </div >
        );
    }
}

export default FUN_G_REPORT_MASTER;