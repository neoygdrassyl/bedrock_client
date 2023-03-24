import React, { Component } from 'react';
import VIZUALIZER from '../../../../components/vizualizer.component';
import FUN_REPORT_DATA from './fun_report_data';

class FUN_G_MIX extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion } = this.props;
        const { } = this.state;

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
        let _CHILD_6_SELECT = () => {
            let _LIST = _SET_CHILD_6();
            let _COMPONENT = [];
            for (var i = 0; i < _LIST.length; i++) {
                _COMPONENT.push(<option value={_LIST[i].id}>{_LIST[i].description}</option>)
            }
            return <>{_COMPONENT}</>
        }
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
            return <div className="row mb-3">
                <div className="col-7">
                    <label>Foto de Valla o aviso</label>
                    <select class="form-select" id="alert_sign_select" defaultValue={_GET_SIGN()[0]} disabled>
                        <option value="-1">APORTADO FISICAMENTE</option>
                        <option value="0">SIN DOCUMENTO</option>
                        {_CHILD_6_SELECT()}
                    </select>
                </div>
                <div className="col-4">
                    <label>Fecha de Radicación</label>
                    <input type="date" class="form-control" max="2100-01-01" id="alert_sign_date" defaultValue={_GET_SIGN()[1]}
                        disabled />
                </div>
                <div className="col-1">
                    <br />
                    {_GET_SIGN()[0] > 0
                        ?
                        <VIZUALIZER url={_FIND_6(_GET_SIGN()[0]).path + "/" + _FIND_6(_GET_SIGN()[0]).filename}
                            apipath={'/files/'} />
                        : ""}
                </div>
            </div>
        }
        let rules = currentItem ? currentItem.rules ? currentItem.rules.split(';') : [] : [];
        return (
            <div className="fun_g_mix">
                <fieldset className="p-3" id="fung_mix">
                    <legend className="my-2 px-3 text-uppercase Collapsible text-white">
                        <label className="app-p lead text-center fw-normal text-uppercase">8. DATOS VARIOS</label>
                    </legend>

                    <legend className="my-2 px-3 text-uppercase bg-light" id="fung_mix_sign">
                        <label className="app-p lead text-center fw-normal text-uppercase">8.1 PUBLICIDAD</label>
                    </legend>
                    {rules[0] != 1 ?
                        _COMPONENT_SIGN()
                        : <label className="fw-bold text-danger">NO APLICA</label>
                    }

                    <legend className="my-2 px-3 text-uppercase bg-light" id="fung_mix_report">
                        <label className="app-p lead text-center fw-normal text-uppercase">8.2 REPORTE DE PLANEACION</label>
                    </legend>
                    {_SET_CHILD_1().item_1.includes('F')
                        ? <>
                            <FUN_REPORT_DATA
                                translation={translation} swaMsg={swaMsg} globals={globals}
                                currentItem={currentItem}
                                currentVersion={currentVersion} />
                        </>
                        : <label className="fw-bold text-danger">NO APLICA</label>
                    }


                </fieldset>
            </div>
        );
    }
}

export default FUN_G_MIX;