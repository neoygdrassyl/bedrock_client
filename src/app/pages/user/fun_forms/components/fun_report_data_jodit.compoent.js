import React, { useRef, useState } from 'react'
import { dateParser, dateParser_finalDate, formsParser1 } from '../../../../components/customClasses/typeParse'
import JoditEditor from "jodit-pro-react";
import { MDBBtn } from 'mdb-react-ui-kit';
import { infoCud } from '../../../../components/jsons/vars';
import { _FUN_1_PARSER } from '../../../../components/customClasses/funCustomArrays';
const moment = require('moment');
const momentB = require('moment-business-days');


export const FUN_REPORT_DATA_JODIT = (props) => {
    const { translation, swaMsg, globals, currentItem, currentVersion } = props;


    // DATA GETERS
    let _GET_CHILD_1 = () => {
        var _CHILD = currentItem.fun_1s;
        var _CURRENT_VERSION = currentVersion - 1;
        if (!_CHILD[_CURRENT_VERSION]) return { tipo: '' };
        var _CHILD_VARS = {
            item_0: _CHILD[_CURRENT_VERSION].id,
            tipo: _CHILD[_CURRENT_VERSION].tipo ? _CHILD[_CURRENT_VERSION].tipo : "",
            tramite: _CHILD[_CURRENT_VERSION].tramite ? _CHILD[_CURRENT_VERSION].tramite : "",
            m_urb: _CHILD[_CURRENT_VERSION].m_urb ? _CHILD[_CURRENT_VERSION].m_urb : "",
            m_sub: _CHILD[_CURRENT_VERSION].m_sub ? _CHILD[_CURRENT_VERSION].m_sub : "",
            m_lic: _CHILD[_CURRENT_VERSION].m_lic ? _CHILD[_CURRENT_VERSION].m_lic : "",
            item_6: _CHILD[_CURRENT_VERSION].usos ? _CHILD[_CURRENT_VERSION].usos : "",
            item_7: _CHILD[_CURRENT_VERSION].area ? _CHILD[_CURRENT_VERSION].area : "",
            item_8: _CHILD[_CURRENT_VERSION].vivienda ? _CHILD[_CURRENT_VERSION].vivienda : "",
            item_9: _CHILD[_CURRENT_VERSION].cultural ? _CHILD[_CURRENT_VERSION].cultural : "",
            item_101: _CHILD[_CURRENT_VERSION].regla_1 ? _CHILD[_CURRENT_VERSION].regla_1 : "",
            item_102: _CHILD[_CURRENT_VERSION].regla_2 ? _CHILD[_CURRENT_VERSION].regla_2 : "",
        }
        return _CHILD_VARS;
    }
    let _GET_CHILD_2 = () => {
        var _CHILD = currentItem.fun_2;
        var _CHILD_VARS = {
            item_20: "",
            item_211: "",
            item_212: "",
            item_22: "",
            item_23: "",
            item_24: "",
            item_25: "",
            item_261: "",
            item_262: "",
            item_263: "",
            item_264: "",
            item_265: "",
            item_266: "",
        }
        if (_CHILD) {
            _CHILD_VARS.item_20 = _CHILD.id;
            _CHILD_VARS.item_211 = _CHILD.direccion;
            _CHILD_VARS.item_212 = _CHILD.direccion_ant;
            _CHILD_VARS.item_22 = _CHILD.matricula;
            _CHILD_VARS.item_23 = _CHILD.catastral;
            _CHILD_VARS.item_24 = _CHILD.suelo; // PARSER
            _CHILD_VARS.item_25 = _CHILD.lote_pla;// PARSER

            _CHILD_VARS.item_261 = _CHILD.barrio;
            _CHILD_VARS.item_262 = _CHILD.vereda;
            _CHILD_VARS.item_263 = _CHILD.comuna;
            _CHILD_VARS.item_264 = _CHILD.sector;
            _CHILD_VARS.item_265 = _CHILD.corregimiento;
            _CHILD_VARS.item_266 = _CHILD.lote;
            _CHILD_VARS.item_267 = _CHILD.estrato;
            _CHILD_VARS.item_268 = _CHILD.manzana;
        }
        return _CHILD_VARS;
    }
    let _SET_CHILD_51 = () => {
        var _CHILD = currentItem.fun_51s;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
    }
    let _GET_CHILD_6 = () => {
        var _CHILD = currentItem.fun_6s;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
    }
    let _CHILD_6_SELECT = () => {
        let _LIST = _GET_CHILD_6();
        let _COMPONENT = [];
        for (var i = 0; i < _LIST.length; i++) {
            _COMPONENT.push(<option value={_LIST[i].id}>{_LIST[i].description}</option>)
        }
        return <>{_COMPONENT}</>
    }
    let _GET_CHILD_LAW = () => {
        var _CHILD = currentItem.fun_law;
        var _CHILD_VARS = {
            id: "",
            report_data: [],
            report_cub: "",
        }
        if (_CHILD != null) {
            _CHILD_VARS.id = _CHILD.id;
            _CHILD_VARS.report_data = _CHILD.report_data ? _CHILD.report_data : [];
            _CHILD_VARS.report_cub = _CHILD.report_cub ? _CHILD.report_cub : "";
        }
        return _CHILD_VARS;
    }
  
    let LOAD_STEP = (_id_public) => {
        var _CHILD = currentItem.record_arc_steps || [];
        for (var i = 0; i < _CHILD.length; i++) {
            if (_CHILD[i].version == 1 && _CHILD[i].id_public == _id_public) return _CHILD[i]
        }
        return []
    }
    // ****************
    let _GET_CHILD_51_BYROLE = (role) => {
        let _CHILDREN = _SET_CHILD_51();
        for (let i = 0; i < _CHILDREN.length; i++) {
            const _child = _CHILDREN[i];
            if (_child.role == role) return _child.name + ' ' + _child.surname
        }
        return ''
    }
    let _GET_FULL_2_ADDRESS = (_FUN2) => {
        let newAddress = [];
        newAddress.push(_FUN2.item_211);
        if (_FUN2.item_268) newAddress.push('manzana No. ' + _FUN2.item_268);
        if (_FUN2.item_264) newAddress.push('sector ' + _FUN2.item_264);
        if (_FUN2.item_266) newAddress.push('lote n° ' + _FUN2.item_266);
        if (_FUN2.item_261) newAddress.push('barrio ' + _FUN2.item_261);
        if (_FUN2.item_263) newAddress.push('comuna ' + _FUN2.item_263);
        if (_FUN2.item_265) newAddress.push('corregimiento ' + _FUN2.item_265);
        if (_FUN2.item_262) newAddress.push('vereda ' + _FUN2.item_262);

        return newAddress.join(', ');
    }
    let _GET_LAW_REPORT_DATA = () => {
        var _CHILD = _GET_CHILD_LAW();
        if (_CHILD.report_data.length) {
            return _CHILD.report_data.split(",");
        }
        return [];
    }
    let _GET_STEP_TYPE = (_id_public, _type) => {
        var STEP = LOAD_STEP(_id_public);
        if (!STEP.id) return [];
        var value = STEP[_type] ? STEP[_type] : []
        if (!value) return [];
        value = value.split(';');
        return value
    }

    let ARC_DESC = _GET_STEP_TYPE('s33', 'value');
    var default_content = `
|       <br />
        <br />
        <p style="text-align: center; line-height: 0.5;">
            <strong style="font-size: 18px;">${infoCud.name} ${infoCud.city.toUpperCase()}</strong></p>
        <p style="text-align: center; line-height: 0.5;">
            <strong style="font-size: 18px;">${infoCud.title} ${infoCud.dir}</strong></p>
        <br />
        <p style="text-align: left; line-height: 0.5; margin-left: 100px;">${infoCud.city}, ${dateParser(_GET_LAW_REPORT_DATA()[2] || moment().format('YYYY-MM-DD'))}</p>
        <br />
        <p style="text-align: left; line-height: 0.5; margin-left: 100px;"><strong>${_GET_CHILD_LAW().report_cub}</strong></p>
        <br />
        <p style="text-align: left; margin-left: 100px; line-height: 0.5;"><strong>Doctor </strong></p>
        <p style="text-align: left; margin-left: 100px; line-height: 0.5;"><strong>Gustavo Adolfo González Acevedo </strong></p>
        <p style="text-align: left; margin-left: 100px; line-height: 0.5;"><strong>Inspector de Policía Urbana No. III </strong></p>
        <p style="text-align: left; margin-left: 100px; line-height: 0.5;"><strong>Piedecuesta </strong></p>
        <p style="text-align: left; margin-left: 100px; line-height: 0.5;"><strong>E.S.M  </strong></p>
        <br />
        <p style="text-align: left; margin-left: 100px;">Asunto: Reconocimiento de edificación No. ${currentItem.id_public}</p>
        <p style="text-align: left; margin-left: 100px;">Cordial Saludo,</p>

        <p style="text-align: left; margin-left: 100px;">Por medio del presente escrito me permito poner ajo s conocimiento la solicitud de reconocimiento 
        de edificación "<strong>${ARC_DESC[1] || formsParser1(_GET_CHILD_1())}</strong>" realizada ante nuestro despacho y que corresponde a la siguiente información</p>

        <table style="width: 78.2413%; margin-left: 11.0485%;"><tbody>
            <tr>
                <td style="width: 20%; border-color: rgb(0, 0, 0); background-color: rgb(183, 183, 183); text-align: center;">Nr. Solicitud</td>
                <td style="width: 20%; border-color: rgb(0, 0, 0); background-color: rgb(183, 183, 183); text-align: center;">Tipo de Solicitud</td>
                <td style="width: 20%; border-color: rgb(0, 0, 0); background-color: rgb(183, 183, 183); text-align: center;">Nombre</td>
                <td style="width: 20%; border-color: rgb(0, 0, 0); background-color: rgb(183, 183, 183); text-align: center;">Dirección</td>
                <td style="width: 20%; border-color: rgb(0, 0, 0); background-color: rgb(183, 183, 183); text-align: center;">Nr. Predial</td></tr>
            <tr>
                <td style="width: 20%; border-color: rgb(0, 0, 0); text-align: center;">${currentItem.id_public}</td>
                <td style="width: 20%; border-color: rgb(0, 0, 0); text-align: center;">${formsParser1(_GET_CHILD_1())}</td>
                <td style="width: 20%; border-color: rgb(0, 0, 0); text-align: center;">${_GET_CHILD_51_BYROLE('PROPIETARIO') ?? ''}</td>
                <td style="width: 20%; border-color: rgb(0, 0, 0); text-align: center;">${_GET_FULL_2_ADDRESS(_GET_CHILD_2())}</td>
                <td style="width: 20%; border-color: rgb(0, 0, 0); text-align: center;">${_GET_CHILD_2().item_23}</td></tr></tbody></table>
        <br />
        <br />
        <br />
        <p style="text-align: left; margin-left: 100px; line-height: 0.5;">Cordialmente,</p>
        <br />
        <br />
        <br />
        <p style="text-align: left; margin-left: 100px; line-height: 0.5;"><strong>${infoCud.dir}</strong></p>
        <p style="text-align: left; margin-left: 100px; line-height: 0.5;"><strong>${infoCud.name} ${infoCud.city.toUpperCase()}</strong></p>
    `

    const editor = useRef(null)
    const [content, setContent] = useState(default_content)


    const config = () => {
        return {
            readonly: false, // all options from https://xdsoft.net/jodit/doc/,
            uploader: {
                url: 'https://xdsoft.net/jodit/finder/?action=fileUpload'
            },
            filebrowser: {
                ajax: {
                    url: 'https://xdsoft.net/jodit/finder/'
                },
                height: 1000,
            },
            language: 'es',
            "readonly": false,
            "toolbar": true,
            "disablePlugins": "clipboard",
            "disablePlugins": "xpath",
            minHeight: 1000,
            removeButtons: ['xpath'],
            controls: {
                lineHeight: {

                    list: ([0.5, 1, 1.1, 1.2, 1.3, 1.4, 1.5, 2, 3, 3.5])

                }
            }
        }
    }



    let _JODIT_COMPONENT = () => {

        return <JoditEditor
            ref={editor}
            value={content}
            config={config()}
            tabIndex={1} // tabIndex of textarea
            onBlur={newContent => setContent(newContent)} // preferred to use only this option to update the content for performance reasons
            class="form-control mb-3"
            rows="5"
            maxlength="409675"

        />
    }

    return (
        <div>
            {_JODIT_COMPONENT()}
        </div>
    )
}
