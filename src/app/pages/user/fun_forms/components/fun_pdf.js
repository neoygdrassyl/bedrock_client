import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import { PDFDocument, StandardFonts } from 'pdf-lib';
import { dateParser, getJSONFull } from '../../../../components/customClasses/typeParse';
import moment from 'moment';
import { cities, domains, states } from '../../../../components/jsons/vars';

const MySwal = withReactContent(Swal);
class FUN_PDF extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    _GET_CHILD_1 = () => {
        var _CHILD = this.props.currentItem.fun_1s;
        var _CURRENT_VERSION = this.props.currentVersion - 1;
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
                _CHILD_VARS.anex1 = _CHILD[_CURRENT_VERSION].anex1 ? _CHILD[_CURRENT_VERSION].anex1 : "";
                _CHILD_VARS.anex2 = _CHILD[_CURRENT_VERSION].anex2 ? _CHILD[_CURRENT_VERSION].anex2 : "";
                _CHILD_VARS.anex3 = _CHILD[_CURRENT_VERSION].anex3 ? _CHILD[_CURRENT_VERSION].anex3 : "";
            }
        }
        return _CHILD_VARS;
    }
    _GET_CHILD_2 = () => {
        var _CHILD = this.props.currentItem.fun_2;
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
            _CHILD_VARS.item_211 = _CHILD.direccion != 'null' ? _CHILD.direccion : "";
            _CHILD_VARS.item_212 = _CHILD.direccion_ant != 'null' ? _CHILD.direccion_ant : "";;
            _CHILD_VARS.item_22 = _CHILD.matricula != 'null' ? _CHILD.matricula : "";;
            _CHILD_VARS.item_23 = _CHILD.catastral != 'null' ? _CHILD.catastral : "";;
            _CHILD_VARS.item_24 = _CHILD.suelo; // PARSER
            _CHILD_VARS.item_25 = _CHILD.lote_pla;// PARSER

            _CHILD_VARS.item_261 = _CHILD.barrio != 'null' ? _CHILD.barrio : "";;
            _CHILD_VARS.item_262 = _CHILD.vereda != 'null' ? _CHILD.vereda : "";;
            _CHILD_VARS.item_263 = _CHILD.comuna != 'null' ? _CHILD.comuna : "";;
            _CHILD_VARS.item_264 = _CHILD.sector != 'null' ? _CHILD.sector : "";;
            _CHILD_VARS.item_265 = _CHILD.corregimiento != 'null' ? _CHILD.corregimiento : "";;
            _CHILD_VARS.item_266 = _CHILD.lote != 'null' ? _CHILD.lote : "";;
            _CHILD_VARS.item_267 = _CHILD.estrato != 'null' ? _CHILD.estrato : "";;
            _CHILD_VARS.item_268 = _CHILD.manzana != 'null' ? _CHILD.manzana : "";;
        }
        return _CHILD_VARS;
    }
    _GET_CHILD_3 = () => {
        var _CHILD = this.props.currentItem.fun_3s;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
    }
    _GET_CHILD_4 = () => {
        var _CHILD = this.props.currentItem.fun_4s;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
    }
    _GET_CHILD_51 = () => {
        var _CHILD = this.props.currentItem.fun_51s;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
    }
    GET_CHILD_52 = () => {
        var _CHILD = this.props.currentItem.fun_52s;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
    }
    _GET_CHILD_53 = () => {
        var _CHILD = this.props.currentItem.fun_53s;
        var _CURRENT_VERSION = this.props.currentItem.version - 1;
        var _CHILD_VARS = {
            item_530: "",
            item_5311: "",
            item_5312: "",
            item_532: "",
            item_533: "",
            item_534: "",
            item_535: "",
            item_536: "",
            docs: "",
        }
        if (_CHILD) {
            if (_CHILD[_CURRENT_VERSION] != null) {
                _CHILD_VARS.item_530 = _CHILD[_CURRENT_VERSION].id;
                _CHILD_VARS.item_5311 = _CHILD[_CURRENT_VERSION].name;
                _CHILD_VARS.item_5312 = _CHILD[_CURRENT_VERSION].surname;
                _CHILD_VARS.item_532 = _CHILD[_CURRENT_VERSION].id_number;
                _CHILD_VARS.item_533 = _CHILD[_CURRENT_VERSION].role;
                _CHILD_VARS.item_534 = _CHILD[_CURRENT_VERSION].number;
                _CHILD_VARS.item_535 = _CHILD[_CURRENT_VERSION].email;
                _CHILD_VARS.item_536 = _CHILD[_CURRENT_VERSION].address;
                _CHILD_VARS.docs = _CHILD[_CURRENT_VERSION].docs;
            }
        }
        return _CHILD_VARS;
    }

    async getPdfForm() {
        let swaMsg = this.props.swaMsg;
        let model = this.props.currentItem.model
        if (!model) return MySwal.fire({
            title: 'SOLICITUD SIN MODELO',
            text: 'Para poder generar el PDF de esta solicitud, se debe de definir el modelo.',
            icon: 'error',
            showConfirmButton: true,
            confirmButtonText: 'CONTINUAR',
        });

        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        var formUrl = process.env.REACT_APP_API_URL + "/pdf/funflat";
        if (Number(model) == 2021) formUrl = process.env.REACT_APP_API_URL + "/pdf/funflat";
        if (Number(model) >= 2022) formUrl = process.env.REACT_APP_API_URL + "/pdf/funflat2022";
        //if (model == '2023') formUrl = process.env.REACT_APP_API_URL + "/pdf/funflat2022";
        var formPdfBytes = await fetch(formUrl).then(res => res.arrayBuffer());
        var pdfDoc = await PDFDocument.load(formPdfBytes);

        var _child = null;
        var _array = null;
        const currentItem = this.props.currentItem;


        let page = pdfDoc.getPage(0)
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
        page.setFont(helveticaFont)
        // WIDTH = 612, HEIGHT = 936

        // SETTING THE FORMS
        // FUN 0

        if (model == '2021') {

            page.moveTo(230, 781)
            page.drawText(document.getElementById('fun_pdf_0_1').value, { size: 9 })
            // ID_PUBLIC
            var _id_public = document.getElementById('fun_pdf_0_2').value
            _id_public = _id_public.replaceAll('-', '');

            page.moveTo(246, 761)
            const nb_0_id = ['nb_0_1', 'nb_0_2', 'nb_0_3', 'nb_0_4', 'nb_0_5', 'nb_0_6', 'nb_0_7', 'nb_0_8', 'nb_0_9', 'nb_0_10', 'nb_0_11', 'nb_0_12']; // PUBLIC ID
            _array = nb_0_id;
            for (var i = 0; i < 5; i++) {
                page.drawText(String(_id_public[i] || ' '), { size: 7 });
                page.moveRight(10);
            }
            page.moveRight(4);
            for (var i = 5; i < 6; i++) {
                page.drawText(String(_id_public[i] || ' '), { size: 7 });
                page.moveRight(10);
            }
            page.moveRight(3);
            for (var i = 6; i < 8; i++) {
                page.drawText(String(_id_public[i] || ' '), { size: 7 });
                page.moveRight(10);
            }
            page.moveRight(3);
            for (var i = 8; i < 12; i++) {
                page.drawText(String(_id_public[i] || ' '), { size: 7 });
                page.moveRight(10);
            }
            //
            // STATE - COUNTY - DATE
            page.moveTo(230, 741)
            page.drawText(document.getElementById('fun_pdf_0_3').value, { size: 9 })
            page.moveTo(330, 741)
            page.drawText(document.getElementById('fun_pdf_0_4').value, { size: 9 })
            page.moveTo(410, 741)
            page.drawText(document.getElementById('fun_pdf_0_5').value, { size: 9 })

            // FUN 1
            _child = this._GET_CHILD_1();
            // FUN 1.1
            if (_child) {
                // FUN 1.1
                if (_child.item_1) {
                    if (_child.item_1.includes('A')) { page.moveTo(247, 685); page.drawText('x', { size: 9 }) }
                    if (_child.item_1.includes('B')) { page.moveTo(247, 671); page.drawText('x', { size: 9 }) }
                    if (_child.item_1.includes('C')) { page.moveTo(247, 657); page.drawText('x', { size: 9 }) }
                    if (_child.item_1.includes('D')) { page.moveTo(247, 643); page.drawText('x', { size: 9 }) }
                    if (_child.item_1.includes('E')) { page.moveTo(247, 628); page.drawText('x', { size: 9 }) }
                    if (_child.item_1.includes('F')) { page.moveTo(247, 609); page.drawText('x', { size: 9 }) }
                    if (_child.item_1.includes('G')) { page.moveTo(247, 589); page.drawText('x', { size: 9 }) }
                }
            }
            // FUN 1.2
            if (_child.item_2) {
                if (_child.item_2 != 'A' && _child.item_2 != 'B' && _child.item_2 != 'C' && _child.item_2 != 'D') { page.moveTo(350, 580); page.drawText(_child.item_2, { size: 9 }) }
                else {
                    if (_child.item_2 == 'A') { page.moveTo(494, 671); page.drawText('x', { size: 9 }) }
                    if (_child.item_2 == 'B') { page.moveTo(494, 657); page.drawText('x', { size: 9 }) }
                    if (_child.item_2 == 'C') { page.moveTo(494, 643); page.drawText('x', { size: 9 }) }
                    if (_child.item_2 == 'D') { page.moveTo(494, 628); page.drawText('x', { size: 9 }) }
                }
            }
            // FUN 1.3
            if (_child.item_3) {
                if (_child.item_3 == 'A') { page.moveTo(247, 553); page.drawText('x', { size: 9 }) }
                if (_child.item_3 == 'B') { page.moveTo(247, 537); page.drawText('x', { size: 9 }) }
                if (_child.item_3 == 'C') { page.moveTo(247, 526); page.drawText('x', { size: 9 }) }
            }
            // FUN 1.4
            if (_child.item_4) {
                if (_child.item_4 == 'A') { page.moveTo(247, 505); page.drawText('x', { size: 9 }) }
                if (_child.item_4 == 'B') { page.moveTo(247, 496); page.drawText('x', { size: 9 }) }
                if (_child.item_4 == 'C') { page.moveTo(247, 486); page.drawText('x', { size: 9 }) }
            }
            // FUN 1.5
            if (_child.item_5) {
                if (_child.item_5.includes('A')) { page.moveTo(416, 558); page.drawText('x', { size: 9 }) }
                if (_child.item_5.includes('B')) { page.moveTo(416, 526); page.drawText('x', { size: 9 }) }
                if (_child.item_5.includes('C')) { page.moveTo(416, 515); page.drawText('x', { size: 9 }) }
                if (_child.item_5.includes('D')) { page.moveTo(416, 505); page.drawText('x', { size: 9 }) }
                if (_child.item_5.includes('E')) { page.moveTo(416, 495); page.drawText('x', { size: 9 }) }
                if (_child.item_5.includes('F')) { page.moveTo(551, 553); page.drawText('x', { size: 9 }) }
                if (_child.item_5.includes('G')) { page.moveTo(551, 526); page.drawText('x', { size: 9 }) }
                if (_child.item_5.includes('g')) { page.moveTo(551, 515); page.drawText('x', { size: 9 }) }
                if (_child.item_5.includes('H')) { page.moveTo(551, 505); page.drawText('x', { size: 9 }) }
                if (_child.item_5.includes('I')) { page.moveTo(551, 495); page.drawText('x', { size: 9 }) }
            }
            // FUN 1.6
            if (_child.item_6) {
                let _arrayHelper = ['ABCD', 'ABC', 'ABD', 'ACD', 'AB', 'AC', 'AD', 'BC', 'BD', 'CD', 'A', 'B', 'C', 'D'];
                let _arrayPretty = _child.item_6.replace(',', "");
                let flag = false;
                for (var i = 0; i < _arrayHelper.length; i++) {
                    if (_arrayPretty.includes(_arrayHelper[i])) {
                        flag = true;
                        break
                    }
                }
                if (!flag) {
                    { page.moveTo(169, 439); page.drawText('x', { size: 9 }) }
                    { page.moveTo(231, 438); page.drawText(_child.item_6, { size: 9 }) }
                } else {
                    if (_child.item_6.includes('A')) { page.moveTo(41, 462); page.drawText('x', { size: 9 }) }
                    if (_child.item_6.includes('B')) { page.moveTo(121, 462); page.drawText('x', { size: 9 }) }
                    if (_child.item_6.includes('C')) { page.moveTo(202, 462); page.drawText('x', { size: 9 }) }
                    if (_child.item_6.includes('D')) { page.moveTo(75, 438); page.drawText('x', { size: 9 }) }
                }
            }
            // FUN 1.7
            if (_child.item_7) {
                if (_child.item_7 == 'A') { page.moveTo(320, 462); page.drawText('x', { size: 9 }) }
                if (_child.item_7 == 'B') { page.moveTo(407, 462); page.drawText('x', { size: 9 }) }
                if (_child.item_7 == 'C') { page.moveTo(511, 462); page.drawText('x', { size: 9 }) }
            }
            // FUN 1.8
            if (_child.item_8) {
                if (_child.item_8 == 'A') { page.moveTo(68, 405); page.drawText('x', { size: 9 }) }
                if (_child.item_8 == 'B') { page.moveTo(159, 405); page.drawText('x', { size: 9 }) }
                if (_child.item_8 == 'C') { page.moveTo(245, 405); page.drawText('x', { size: 9 }) }
            }
            // FUN 1.9
            if (_child.item_9) {
                if (_child.item_9 == 'A') { page.moveTo(421, 404); page.drawText('x', { size: 9 }) }
                if (_child.item_9 == 'B') { page.moveTo(452, 404); page.drawText('x', { size: 9 }) }
            }
            // FUN 1.102
            if (_child.item_102) {
                if (_child.item_102 != 'A' && _child.item_102 != 'B' && _child.item_102 != 'C' && _child.item_102 != 'D') {
                    { page.moveTo(353, 314); page.drawText('x', { size: 9 }) }
                    { page.moveTo(480, 314); page.drawText(_child.item_102, { size: 9 }) }
                }
                else {
                    if (_child.item_102 == 'A') { page.moveTo(316, 348); page.drawText('x', { size: 9 }) }
                    if (_child.item_102 == 'B') { page.moveTo(384, 348); page.drawText('x', { size: 9 }) }
                    if (_child.item_102 == 'C') { page.moveTo(452, 348); page.drawText('x', { size: 9 }) }
                    if (_child.item_102 == 'D') { page.moveTo(519, 348); page.drawText('x', { size: 9 }) }
                }
            }
            // FUN 1.101
            if (_child.item_101) {
                if (_child.item_101 == 'A') { page.moveTo(41, 356); page.drawText('x', { size: 9 }) }
                if (_child.item_101 == 'B') { page.moveTo(132, 356); page.drawText('x', { size: 9 }) }
                if (_child.item_101 == 'C') { page.moveTo(225, 356); page.drawText('x', { size: 9 }) }
            }
            // FUN 2
            _child = this._GET_CHILD_2();
            page.moveTo(56, 252); page.drawText(_child.item_211 ? _child.item_211 : "", { size: 9 })
            page.moveTo(320, 252); page.drawText(_child.item_212 ? _child.item_212 : "", { size: 9 })
            page.moveTo(56, 198); page.drawText(_child.item_22 ? _child.item_22 : "", { size: 9 })
            page.moveTo(320, 198); page.drawText(_child.item_23 ? _child.item_23 : "", { size: 9 })
            // FUN 2.6
            page.moveTo(312, 143); page.drawText(_child.item_261 ? _child.item_261 : "", { size: 7 }) // BARRIOR
            page.moveTo(447, 143); page.drawText(_child.item_262 ? _child.item_262 : "", { size: 7 }) // VEREDA
            page.moveTo(312, 123); page.drawText(_child.item_263 ? _child.item_263 : "", { size: 7 }) // COMUNA
            page.moveTo(447, 123); page.drawText(_child.item_264 ? _child.item_264 : "", { size: 7 }) // SECTOR
            page.moveTo(447, 102); page.drawText(_child.item_265 ? _child.item_265 : "", { size: 7 }) // CORREGIMIENTO
            page.moveTo(447, 82); page.drawText(_child.item_266 ? _child.item_266 : "", { size: 7 }) // LOTE
            page.moveTo(321, 102); page.drawText(_child.item_267 ? _child.item_267 : "", { size: 7 }) // ESTRATO
            page.moveTo(321, 82); page.drawText(_child.item_268 ? _child.item_268 : "", { size: 7 }) // MANZANA

            // FUN 2.4
            if (_child.item_24) {
                if (_child.item_24 == 'A') { page.moveTo(153, 144); page.drawText('x', { size: 9 }) }
                if (_child.item_24 == 'B') { page.moveTo(153, 134); page.drawText('x', { size: 9 }) }
                if (_child.item_24 == 'C') { page.moveTo(153, 123); page.drawText('x', { size: 9 }) }
            }
            // FUN 2.5
            if (_child.item_25) {
                if (_child.item_25 != 'A' && _child.item_25 != 'B' && _child.item_25 != 'null') {
                    { page.moveTo(289, 123); page.drawText('x', { size: 9 }) }
                    { page.moveTo(220, 114); page.drawText(_child.item_25, { size: 9 }) }
                } else {
                    if (_child.item_25 == 'A') { page.moveTo(289, 144); page.drawText('x', { size: 9 }) }
                    if (_child.item_25 == 'B') { page.moveTo(289, 134); page.drawText('x', { size: 9 }) }
                }
            }

            // ADVANCE TO THE NEXT PAGE
            page = pdfDoc.getPage(1);

            // FUN 3
            let _child_3 = [];
            _child = this._GET_CHILD_3();
            for (var i = 0; i < _child.length; i++) {
                _child_3.push(_child[i]);
            }
            // FUN 4
            let _child_4 = null;
            _child_4 = this._GET_CHILD_4();
            var _child_4_n = [];
            var _child_4_s = [];
            var _child_4_e = [];
            var _child_4_w = [];
            for (var i = 0; i < _child_4.length; i++) {
                if (_child_4[i].coord == 'NORTE') _child_4_n.push(_child_4[i]);
                if (_child_4[i].coord == 'SUR') _child_4_s.push(_child_4[i]);
                if (_child_4[i].coord == 'ORIENTE') _child_4_e.push(_child_4[i]);
                if (_child_4[i].coord == 'OCCIDENTE') _child_4_w.push(_child_4[i]);
            }
            // FUN 51
            let _child_51 = [];
            _child = this._GET_CHILD_51();
            for (var i = 0; i < _child.length; i++) {
                _child_51.push(_child[i]);
            }

            // DRAW TEXT IN THE PAGE
            if (_child_3.length) {
                if (_child_3[0]) {
                    { page.moveTo(61, 767); page.drawText(_child_3[0].direccion_1, { size: 9 }) }
                    { page.moveTo(61, 742); page.drawText(_child_3[0].direccion_2, { size: 9 }) }
                }
                if (_child_3[1]) {
                    { page.moveTo(332, 767); page.drawText(_child_3[1].direccion_1, { size: 9 }) }
                    { page.moveTo(332, 742); page.drawText(_child_3[1].direccion_2, { size: 9 }) }
                }
                if (_child_3[2]) {
                    { page.moveTo(61, 715); page.drawText(_child_3[2].direccion_1, { size: 9 }) }
                    { page.moveTo(61, 689); page.drawText(_child_3[2].direccion_2, { size: 9 }) }
                }
                if (_child_3[3]) {
                    { page.moveTo(332, 715); page.drawText(_child_3[3].direccion_1, { size: 9 }) }
                    { page.moveTo(332, 689); page.drawText(_child_3[3].direccion_2, { size: 9 }) }
                }
                if (_child_3[4]) {
                    { page.moveTo(61, 663); page.drawText(_child_3[4].direccion_1, { size: 9 }) }
                    { page.moveTo(61, 638); page.drawText(_child_3[4].direccion_2, { size: 9 }) }
                }
                if (_child_3[5]) {
                    { page.moveTo(332, 663); page.drawText(_child_3[5].direccion_1, { size: 9 }) }
                    { page.moveTo(332, 638); page.drawText(_child_3[5].direccion_2, { size: 9 }) }
                }
                if (_child_3[6]) {
                    { page.moveTo(61, 612); page.drawText(_child_3[6].direccion_1, { size: 9 }) }
                    { page.moveTo(61, 586); page.drawText(_child_3[6].direccion_2, { size: 9 }) }
                }
                if (_child_3[7]) {
                    { page.moveTo(332, 612); page.drawText(_child_3[7].direccion_1, { size: 9 }) }
                    { page.moveTo(332, 586); page.drawText(_child_3[7].direccion_2, { size: 9 }) }
                }

                var _ceilling = 8;
                if (_child_3.length < _ceilling) _ceilling = _child_3.length;
                for (var i = 0; i < _ceilling; i++) {
                    _child_3.shift();
                }
            }
            if (_child_4_n.length) {
                var _ceilling = 4;
                if (_child_4_n.length < _ceilling) _ceilling = _child_4_n.length;
                for (var i = 0; i < _ceilling; i++) {
                    if (_child_4_n[i]) {
                        { page.moveTo(180, 536 - (i * 12)); page.drawText(_child_4_n[i].longitud, { size: 9 }) }
                        { page.moveTo(317, 536 - (i * 12)); page.drawText(_child_4_n[i].colinda, { size: 9 }) }
                    }
                }
                for (var i = 0; i < _ceilling; i++) {
                    _child_4_n.shift();
                }
            }
            if (_child_4_s.length) {
                var _ceilling = 4;
                if (_child_4_s.length < _ceilling) _ceilling = _child_4_s.length;
                for (var i = 0; i < _ceilling; i++) {
                    if (_child_4_s[i]) {
                        { page.moveTo(180, 487 - (i * 12)); page.drawText(_child_4_s[i].longitud, { size: 9 }) }
                        { page.moveTo(317, 487 - (i * 12)); page.drawText(_child_4_s[i].colinda, { size: 9 }) }
                    }
                }
                for (var i = 0; i < _ceilling; i++) {
                    _child_4_s.shift();
                }
            }
            if (_child_4_e.length) {
                var _ceilling = 4;
                if (_child_4_e.length < _ceilling) _ceilling = _child_4_e.length;
                for (var i = 0; i < _ceilling; i++) {
                    if (_child_4_e[i]) {
                        { page.moveTo(180, 440 - (i * 12)); page.drawText(_child_4_e[i].longitud, { size: 9 }) }
                        { page.moveTo(317, 440 - (i * 12)); page.drawText(_child_4_e[i].colinda, { size: 9 }) }
                    }
                }
                for (var i = 0; i < _ceilling; i++) {
                    _child_4_e.shift();
                }
            }
            if (_child_4_w.length) {
                var _ceilling = 4;
                if (_child_4_w.length < _ceilling) _ceilling = _child_4_w.length;
                for (var i = 0; i < _ceilling; i++) {
                    if (_child_4_w[i]) {
                        { page.moveTo(180, 393 - (i * 12)); page.drawText(_child_4_w[i].longitud, { size: 9 }) }
                        { page.moveTo(317, 393 - (i * 12)); page.drawText(_child_4_w[i].colinda, { size: 9 }) }
                    }
                }
                for (var i = 0; i < _ceilling; i++) {
                    _child_4_w.shift();
                }
            }
            if (_child_51.length) {
                var _ceilling = 4;
                if (_child_51.length < _ceilling) _ceilling = _child_51.length;
                for (var i = 0; i < _ceilling; i++) {
                    { page.moveTo(43, 261 - (i * 50)); page.drawText(_child_51[i].name + ' ' + _child_51[i].surname, { size: 9 }) }
                    { page.moveTo(43, 241 - (i * 50)); page.drawText(String(_child_51[i].id_number), { size: 9 }) }
                    { page.moveTo(180, 241 - (i * 50)); page.drawText(String(_child_51[i].nunber), { size: 9 }) }
                    { page.moveTo(318, 241 - (i * 50)); page.drawText(_child_51[i].email, { size: 9 }) }
                }
                for (var i = 0; i < _ceilling; i++) {
                    _child_51.shift();
                }
            }

            // IN THE PAGE 2 THE SOFTWARE MUST WRITE A CERTAIN AMMOUNT OF PAGES 2, AS MANY AS IT NEEDS TO COVER AL THE ITEMS OF THE OBJECTS
            // FUN 3, FUN 4 AND FUN 51.
            // IN ORDER TO DETERMINE IF MORE PAGES 2 ARE REQUIRE THE SOFTWARE MUST KNOW HOW MANY EXTRA ITEMS ARE GREATER THAN THE NUMBER
            // IT CAN CONTAIN PHYSICALLY IN THE PAGE 2
            // FOR FUN 3 IT CAN HOLD 8 ITEMS PER PAGE
            // FOR FUN 4 IT CAN CONTAIN 4 ITEMS OF A SINGLE CARDINAL DIRECTION
            // FOR FUN 51 IT CAN CONTAIN 4 ITEMS PER PAGE
            // IF THIS MINIMUN NUMBER IS SURPASSED AN ADITIONAL PAGE 2 IS REQUIRED.
            // DOES AN INTITIAL WRITE FOR FUN 3, FUN 4 AND FUN 51

            const _items_FUN_3 = this._GET_CHILD_3().length;
            const _item_FUN_4 = this._GET_CHILD_4();
            const _items_FUN_51 = this._GET_CHILD_51().length
            const pages_fun_3 = Math.trunc(_items_FUN_3 / 8);
            const pages_fun_51 = Math.trunc(_items_FUN_51 / 4);

            var _items_FUN_4_N = 0;
            var _items_FUN_4_S = 0;
            var _items_FUN_4_E = 0;
            var _items_FUN_4_W = 0;
            for (var i = 0; i < _item_FUN_4.length; i++) {
                if (_item_FUN_4[i].coord == 'NORTE') _items_FUN_4_N++;
                if (_item_FUN_4[i].coord == 'SUR') _items_FUN_4_S++;
                if (_item_FUN_4[i].coord == 'ORIENTE') _items_FUN_4_E++;
                if (_item_FUN_4[i].coord == 'OCCIDENTE') _items_FUN_4_W++;
            }
            const pages_fun_4_n = Math.trunc(_items_FUN_4_N / 4);
            const pages_fun_4_s = Math.trunc(_items_FUN_4_S / 4);
            const pages_fun_4_e = Math.trunc(_items_FUN_4_E / 4);
            const pages_fun_4_w = Math.trunc(_items_FUN_4_W / 4);
            // IF ANY OF THE pages VARIABLES IS EQUAL OR GREATER THAN 1, MORE PAGES 2 ARE REQUIRED,
            // THE EXTRA NUMBER  OF PAGES 2 IS EQUAL TO THE GREATER NUMBER AMONGS THE pages VALUES
            var GREATER_NUMBER = pages_fun_3;
            if (GREATER_NUMBER < pages_fun_51) GREATER_NUMBER = pages_fun_51;
            if (GREATER_NUMBER < pages_fun_4_n) GREATER_NUMBER = pages_fun_4_n;
            if (GREATER_NUMBER < pages_fun_4_s) GREATER_NUMBER = pages_fun_4_s;
            if (GREATER_NUMBER < pages_fun_4_e) GREATER_NUMBER = pages_fun_4_e;
            if (GREATER_NUMBER < pages_fun_4_w) GREATER_NUMBER = pages_fun_4_w;
            //console.log("THE NUMBER OF EXTRA PAGES IS: ", GREATER_NUMBER)

            for (var j = 0; j < GREATER_NUMBER; j++) {

                var PdfUrl_2pg = process.env.REACT_APP_API_URL + "/pdf/funform2pgflat";
                var Buffer_2pg = await fetch(PdfUrl_2pg).then((res) => res.arrayBuffer())
                var PdfDoc_2pg = await PDFDocument.load(Buffer_2pg)
                let page = PdfDoc_2pg.getPage(0);
                // ---------------------------

                if (_child_3.length) {
                    if (_child_3[0]) {
                        { page.moveTo(61, 767); page.drawText(_child_3[0].direccion_1, { size: 9 }) }
                        { page.moveTo(61, 742); page.drawText(_child_3[0].direccion_2, { size: 9 }) }
                    }
                    if (_child_3[1]) {
                        { page.moveTo(332, 767); page.drawText(_child_3[1].direccion_1, { size: 9 }) }
                        { page.moveTo(332, 742); page.drawText(_child_3[1].direccion_2, { size: 9 }) }
                    }
                    if (_child_3[2]) {
                        { page.moveTo(61, 715); page.drawText(_child_3[2].direccion_1, { size: 9 }) }
                        { page.moveTo(61, 689); page.drawText(_child_3[2].direccion_2, { size: 9 }) }
                    }
                    if (_child_3[3]) {
                        { page.moveTo(332, 715); page.drawText(_child_3[3].direccion_1, { size: 9 }) }
                        { page.moveTo(332, 689); page.drawText(_child_3[3].direccion_2, { size: 9 }) }
                    }
                    if (_child_3[4]) {
                        { page.moveTo(61, 663); page.drawText(_child_3[4].direccion_1, { size: 9 }) }
                        { page.moveTo(61, 638); page.drawText(_child_3[4].direccion_2, { size: 9 }) }
                    }
                    if (_child_3[5]) {
                        { page.moveTo(332, 663); page.drawText(_child_3[5].direccion_1, { size: 9 }) }
                        { page.moveTo(332, 638); page.drawText(_child_3[5].direccion_2, { size: 9 }) }
                    }
                    if (_child_3[6]) {
                        { page.moveTo(61, 612); page.drawText(_child_3[6].direccion_1, { size: 9 }) }
                        { page.moveTo(61, 586); page.drawText(_child_3[6].direccion_2, { size: 9 }) }
                    }
                    if (_child_3[7]) {
                        { page.moveTo(332, 612); page.drawText(_child_3[7].direccion_1, { size: 9 }) }
                        { page.moveTo(332, 586); page.drawText(_child_3[7].direccion_2, { size: 9 }) }
                    }

                    var _ceilling = 8;
                    if (_child_3.length < _ceilling) _ceilling = _child_3.length;
                    for (var i = 0; i < _ceilling; i++) {
                        _child_3.shift();
                    }
                }
                if (_child_4_n.length) {
                    var _ceilling = 4;
                    if (_child_4_n.length < _ceilling) _ceilling = _child_4_n.length;
                    for (var i = 0; i < _ceilling; i++) {
                        if (_child_4_n[i]) {
                            { page.moveTo(180, 536 - (i * 12)); page.drawText(_child_4_n[i].longitud, { size: 9 }) }
                            { page.moveTo(317, 536 - (i * 12)); page.drawText(_child_4_n[i].colinda, { size: 9 }) }
                        }
                    }
                    for (var i = 0; i < _ceilling; i++) {
                        _child_4_n.shift();
                    }
                }
                if (_child_4_s.length) {
                    var _ceilling = 4;
                    if (_child_4_s.length < _ceilling) _ceilling = _child_4_s.length;
                    for (var i = 0; i < _ceilling; i++) {
                        if (_child_4_s[i]) {
                            { page.moveTo(180, 487 - (i * 12)); page.drawText(_child_4_s[i].longitud, { size: 9 }) }
                            { page.moveTo(317, 487 - (i * 12)); page.drawText(_child_4_s[i].colinda, { size: 9 }) }
                        }
                    }
                    for (var i = 0; i < _ceilling; i++) {
                        _child_4_s.shift();
                    }
                }
                if (_child_4_e.length) {
                    var _ceilling = 4;
                    if (_child_4_e.length < _ceilling) _ceilling = _child_4_s.length;
                    for (var i = 0; i < _ceilling; i++) {
                        if (_child_4_e[i]) {
                            { page.moveTo(180, 440 - (i * 12)); page.drawText(_child_4_e[i].longitud, { size: 9 }) }
                            { page.moveTo(317, 440 - (i * 12)); page.drawText(_child_4_e[i].colinda, { size: 9 }) }
                        }
                    }
                    for (var i = 0; i < _ceilling; i++) {
                        _child_4_e.shift();
                    }
                }
                if (_child_4_w.length) {
                    var _ceilling = 4;
                    if (_child_4_w.length < _ceilling) _ceilling = _child_4_s.length;
                    for (var i = 0; i < _ceilling; i++) {
                        if (_child_4_w[i]) {
                            { page.moveTo(180, 393 - (i * 12)); page.drawText(_child_4_w[i].longitud, { size: 9 }) }
                            { page.moveTo(317, 393 - (i * 12)); page.drawText(_child_4_w[i].colinda, { size: 9 }) }
                        }
                    }
                    for (var i = 0; i < _ceilling; i++) {
                        _child_4_w.shift();
                    }
                }
                if (_child_51.length) {
                    var _ceilling = 4;
                    if (_child_51.length < _ceilling) _ceilling = _child_51.length;
                    for (var i = 0; i < _ceilling; i++) {
                        { page.moveTo(43, 261 - (i * 50)); page.drawText(_child_51[i].name + ' ' + _child_51[i].surname, { size: 9 }) }
                        { page.moveTo(43, 241 - (i * 50)); page.drawText(String(_child_51[i].id_number), { size: 9 }) }
                        { page.moveTo(180, 241 - (i * 50)); page.drawText(String(_child_51[i].nunber), { size: 9 }) }
                        { page.moveTo(318, 241 - (i * 50)); page.drawText(_child_51[i].email, { size: 9 }) }
                    }
                    for (var i = 0; i < _ceilling; i++) {
                        _child_51.shift();
                    }
                }
                // ---------------------------
                const pdfBytes_2pg = await PdfDoc_2pg.save();
                var [copiedPages] = await pdfDoc.copyPages(PdfDoc_2pg, [0]);
                pdfDoc.addPage(copiedPages);
            }

            // ADVANCE TO THE NEXT PAGE
            page = pdfDoc.getPage(2);

            // FUN 52
            _child = this.GET_CHILD_52();
            if (_child.length) {
                for (var i = 0; i < _child.length; i++) {
                    if (_child[i].role.includes("URBANIZADOR O CONSTRUCTOR RESPONSABLE")) {
                        page.moveTo(118, 748); page.drawText(_child[i].name + ' ' + _child[i].surname, { size: 9 })
                        page.moveTo(118, 726); page.drawText(String(_child[i].id_number), { size: 9 })
                        page.moveTo(262, 726); page.drawText(String(_child[i].registration), { size: 9 })
                        page.moveTo(422, 726); page.drawText(dateParser(_child[i].registration_date), { size: 9 })
                        page.moveTo(118, 705); page.drawText(_child[i].email, { size: 9 })
                    }
                    if (_child[i].role.includes("ARQUITECTO PROYECTISTA")) {
                        let offset = 1 * 75
                        page.moveTo(118, 748 - offset); page.drawText(_child[i].name + ' ' + _child[i].surname, { size: 9 })
                        page.moveTo(118, 726 - offset); page.drawText(String(_child[i].id_number), { size: 9 })
                        page.moveTo(262, 726 - offset); page.drawText(String(_child[i].registration), { size: 9 })
                        page.moveTo(422 + 2, 726 - offset); page.drawText(dateParser(_child[i].registration_date), { size: 9 })
                        page.moveTo(118, 705 - offset); page.drawText(_child[i].email, { size: 9 })
                    }
                    if (_child[i].role.includes("INGENIERO CIVIL DISEÑADOR ESTRUCTURAL")) {
                        let offset = 2 * 76
                        page.moveTo(118, 748 - offset); page.drawText(_child[i].name + ' ' + _child[i].surname, { size: 9 })
                        page.moveTo(118, 726 - offset); page.drawText(String(_child[i].id_number), { size: 9 })
                        page.moveTo(262, 726 - offset); page.drawText(String(_child[i].registration), { size: 9 })
                        page.moveTo(422 + 2, 726 - offset); page.drawText(dateParser(_child[i].registration_date), { size: 9 })
                        page.moveTo(118, 705 - offset); page.drawText(_child[i].email, { size: 9 })
                        if (_child[i].supervision == 'SI') { page.moveTo(515, 726 - offset); page.drawText('x', { size: 9 }) }
                        else if (_child[i].supervision == 'NO') { page.moveTo(548, 726 - offset); page.drawText('x', { size: 9 }) }
                    }
                    if (_child[i].role.includes("DISEÑADOR DE ELEMENTOS NO ESTRUCTURALES")) {
                        let offset = 3 * 76
                        page.moveTo(118, 748 - offset); page.drawText(_child[i].name + ' ' + _child[i].surname, { size: 9 })
                        page.moveTo(118, 726 - offset); page.drawText(String(_child[i].id_number), { size: 9 })
                        page.moveTo(262, 726 - offset); page.drawText(String(_child[i].registration), { size: 9 })
                        page.moveTo(422 + 5, 726 - offset); page.drawText(dateParser(_child[i].registration_date), { size: 8 })
                        page.moveTo(118, 705 - offset); page.drawText(_child[i].email, { size: 9 })
                        if (_child[i].supervision == 'SI') { page.moveTo(515, 726 - offset); page.drawText('x', { size: 9 }) }
                        else if (_child[i].supervision == 'NO') { page.moveTo(548, 726 - offset); page.drawText('x', { size: 9 }) }
                    }
                    if (_child[i].role.includes("INGENIERO CIVIL GEOTECNISTA")) {
                        let offset = 4 * 76
                        page.moveTo(118, 748 - offset); page.drawText(_child[i].name + ' ' + _child[i].surname, { size: 9 })
                        page.moveTo(118, 726 - offset); page.drawText(String(_child[i].id_number), { size: 9 })
                        page.moveTo(262, 726 - offset); page.drawText(String(_child[i].registration), { size: 9 })
                        page.moveTo(422 + 7, 726 - offset); page.drawText(dateParser(_child[i].registration_date), { size: 9 })
                        page.moveTo(118, 705 - offset); page.drawText(_child[i].email, { size: 9 })
                    }
                    if (_child[i].role.includes("INGENIERO TOPOGRAFO Y/O TOPÓGRAFO")) {
                        let offset = 5 * 76
                        page.moveTo(118, 748 + 1 - offset); page.drawText(_child[i].name + ' ' + _child[i].surname, { size: 9 })
                        page.moveTo(118, 726 + 1 - offset); page.drawText(String(_child[i].id_number), { size: 9 })
                        page.moveTo(262, 726 + 1 - offset); page.drawText(String(_child[i].registration), { size: 9 })
                        page.moveTo(422 + 5, 726 + 1 - offset); page.drawText(dateParser(_child[i].registration_date), { size: 9 })
                        page.moveTo(118, 705 + 1 - offset); page.drawText(_child[i].email, { size: 9 })
                    }
                    if (_child[i].role.includes("REVISOR INDEPENDIENTE DE LOS DISEÑOS ESTRUCTURALES")) {
                        let offset = 6 * 75
                        page.moveTo(118, 748 - 3 - offset); page.drawText(_child[i].name + ' ' + _child[i].surname, { size: 9 })
                        page.moveTo(118, 726 - 3 - offset); page.drawText(String(_child[i].id_number), { size: 9 })
                        page.moveTo(262, 726 - 3 - offset); page.drawText(String(_child[i].registration), { size: 9 })
                        page.moveTo(422 + 5, 726 - 3 - offset); page.drawText(dateParser(_child[i].registration_date), { size: 9 })
                        page.moveTo(118, 705 - 3 - offset); page.drawText(_child[i].email, { size: 9 })
                    }
                    if (_child[i].role.includes("OTROS PROFESIONALES ESPECIALISTAS")) {
                        let offset = 7 * 75
                        page.moveTo(118, 748 - 3 - offset); page.drawText(_child[i].name + ' ' + _child[i].surname, { size: 9 })
                        page.moveTo(118, 726 - 3 - offset); page.drawText(String(_child[i].id_number), { size: 9 })
                        page.moveTo(262, 726 - 3 - offset); page.drawText(String(_child[i].registration), { size: 9 })
                        page.moveTo(422 + 5, 726 - 3 - offset); page.drawText(dateParser(_child[i].registration_date), { size: 9 })
                        page.moveTo(118, 705 - 3 - offset); page.drawText(_child[i].email, { size: 9 })
                    }
                }

            }

            // FUN 53
            _child = this._GET_CHILD_53();
            page.moveTo(118, 132); page.drawText(_child.item_5311 + ' ' + _child.item_5312, { size: 9 });
            page.moveTo(118, 111); page.drawText(_child.item_532 ? _child.item_532 : "", { size: 9 });
            page.moveTo(430, 111); page.drawText(_child.item_534 ? _child.item_534 : "", { size: 9 }); // NUMBER
            page.moveTo(370, 70); page.drawText(_child.item_535 ? _child.item_535 : "", { size: 9 }); // EMAIL
            page.moveTo(118, 70); page.drawText(_child.item_536 ? _child.item_536 : "", { size: 9 }); // ADDRESS
        }
        if (model >= '2022' || model == '2023') {

            page.moveTo(300, 800)
            page.drawText(document.getElementById('fun_pdf_0_1').value, { size: 12 })
            // ID_PUBLIC
            var _id_public = document.getElementById('fun_pdf_0_2').value
            _id_public = _id_public.replaceAll('-', '');

            page.moveTo(325, 780)
            const nb_0_id = ['nb_0_1', 'nb_0_2', 'nb_0_3', 'nb_0_4', 'nb_0_5', 'nb_0_6', 'nb_0_7', 'nb_0_8', 'nb_0_9', 'nb_0_10', 'nb_0_11', 'nb_0_12']; // PUBLIC ID
            _array = nb_0_id;
            for (var i = 0; i < 5; i++) {
                page.drawText(String(_id_public[i] || ' '), { size: 12 });
                page.moveRight(19);
            }
            page.moveRight(9);
            for (var i = 5; i < 6; i++) {
                page.drawText(String(_id_public[i] || ' '), { size: 12 });
                page.moveRight(19);
            }
            page.moveRight(9);
            for (var i = 6; i < 8; i++) {
                page.drawText(String(_id_public[i] || ' '), { size: 12 });
                page.moveRight(19);
            }
            page.moveRight(9);
            for (var i = 8; i < 12; i++) {
                page.drawText(String(_id_public[i] || ' '), { size: 12 });
                page.moveRight(19);
            }
            //
            // STATE - COUNTY - DATE
            page.moveTo(170, 758)
            page.drawText(document.getElementById('fun_pdf_0_3').value, { size: 9 })
            page.moveTo(270, 758)
            page.drawText(document.getElementById('fun_pdf_0_4').value, { size: 9 })
            page.moveTo(350, 758)
            page.drawText(document.getElementById('fun_pdf_0_5').value, { size: 9 })

            // FUN 1
            _child = this._GET_CHILD_1();
            // FUN 1.1
            if (_child) {
                // FUN 1.1
                if (_child.item_1) {
                    if (_child.item_1.includes('A')) { page.moveTo(248, 705); page.drawText('X', { size: 10 }) }
                    if (_child.item_1.includes('B')) { page.moveTo(248, 695); page.drawText('X', { size: 10 }) }
                    if (_child.item_1.includes('C')) { page.moveTo(248, 685); page.drawText('X', { size: 10 }) }
                    if (_child.item_1.includes('D')) { page.moveTo(248, 674); page.drawText('X', { size: 10 }) }
                    if (_child.item_1.includes('E')) { page.moveTo(248, 658); page.drawText('X', { size: 10 }) }
                    if (_child.item_1.includes('F')) { page.moveTo(248, 639); page.drawText('X', { size: 10 }) }
                    if (_child.item_1.includes('G')) { page.moveTo(248, 623); page.drawText('X', { size: 10 }) }
                }
            }
            // FUN 1.2
            if (_child.item_2) {
                if (_child.item_2 != 'A' && _child.item_2 != 'B' && _child.item_2 != 'C' && _child.item_2 != 'D') { page.moveTo(310, 639); page.drawText(_child.item_2, { size: 10 }) }
                else {
                    if (_child.item_2 == 'A') { page.moveTo(536, 705); page.drawText('X', { size: 10 }) }
                    //if (_child.item_2 == 'B') { page.moveTo(494, 657); page.drawText('X', { size: 10 }) }
                    if (_child.item_2 == 'C') { page.moveTo(536, 695); page.drawText('X', { size: 10 }) }
                    if (_child.item_2 == 'D') { page.moveTo(536, 685); page.drawText('X', { size: 10 }) }
                }
            }
            // FUN 1.3
            if (_child.item_3) {
                if (_child.item_3 == 'A') { page.moveTo(248, 601); page.drawText('X', { size: 10 }) }
                if (_child.item_3 == 'B') { page.moveTo(248, 591); page.drawText('X', { size: 10 }) }
                if (_child.item_3 == 'C') { page.moveTo(248, 580); page.drawText('X', { size: 10 }) }
            }
            // FUN 1.4
            if (_child.item_4) {
                if (_child.item_4 == 'A') { page.moveTo(248, 557); page.drawText('X', { size: 10 }) }
                if (_child.item_4 == 'B') { page.moveTo(248, 547); page.drawText('X', { size: 10 }) }
                if (_child.item_4 == 'C') { page.moveTo(248, 535); page.drawText('X', { size: 10 }) }
            }
            // FUN 1.5
            if (_child.item_5) {
                if (_child.item_5.includes('A')) { page.moveTo(387, 601); page.drawText('X', { size: 10 }) }
                if (_child.item_5.includes('B')) { page.moveTo(387, 580); page.drawText('X', { size: 10 }) }
                if (_child.item_5.includes('C')) { page.moveTo(387, 568); page.drawText('X', { size: 10 }) }
                if (_child.item_5.includes('D')) { page.moveTo(387, 557); page.drawText('X', { size: 10 }) }
                if (_child.item_5.includes('E')) { page.moveTo(387, 546); page.drawText('X', { size: 10 }) }
                if (_child.item_5.includes('F')) { page.moveTo(536, 601); page.drawText('X', { size: 10 }) }
                if (_child.item_5.includes('G')) { page.moveTo(536, 568); page.drawText('X', { size: 10 }) }
                if (_child.item_5.includes('g')) { page.moveTo(536, 557); page.drawText('X', { size: 10 }) }
                if (_child.item_5.includes('H')) { page.moveTo(536, 546); page.drawText('X', { size: 10 }) }
                if (_child.item_5.includes('I')) { page.moveTo(536, 535); page.drawText('X', { size: 10 }) }
            }
            // FUN 1.6
            if (_child.item_6) {
                let _arrayHelper = ['ABCD', 'ABC', 'ABD', 'ACD', 'AB', 'AC', 'AD', 'BC', 'BD', 'CD', 'A', 'B', 'C', 'D'];
                let _arrayPretty = _child.item_6.replace(',', "");
                let flag = false;
                for (var i = 0; i < _arrayHelper.length; i++) {
                    if (_arrayPretty.includes(_arrayHelper[i])) {
                        flag = true;
                        break
                    }
                }
                if (!flag) {
                    { page.moveTo(105, 485); page.drawText('X', { size: 9 }) }
                    { page.moveTo(173, 485); page.drawText(_child.item_6, { size: 9 }) }
                } else {
                    if (_child.item_6.includes('A')) { page.moveTo(35, 509); page.drawText('X', { size: 10 }) }
                    if (_child.item_6.includes('B')) { page.moveTo(105, 509); page.drawText('X', { size: 10 }) }
                    if (_child.item_6.includes('C')) { page.moveTo(183, 509); page.drawText('X', { size: 10 }) }
                    if (_child.item_6.includes('D')) { page.moveTo(35, 485); page.drawText('X', { size: 10 }) }
                }
            }
            // FUN 1.7
            if (_child.item_7) {
                if (_child.item_7 == 'A') { page.moveTo(397, 509); page.drawText('X', { size: 10 }) }
                if (_child.item_7 == 'B') { page.moveTo(397, 485); page.drawText('X', { size: 10 }) }
                if (_child.item_7 == 'C') { page.moveTo(552, 509); page.drawText('X', { size: 10 }) }
                if (_child.item_7 == 'D') { page.moveTo(552, 485); page.drawText('X', { size: 10 }) }
            }
            // FUN 1.8
            if (_child.item_8) {
                if (_child.item_8 == 'A') { page.moveTo(36, 454); page.drawText('X', { size: 10 }) }
                if (_child.item_8 == 'B') { page.moveTo(107, 454); page.drawText('X', { size: 10 }) }
                if (_child.item_8 == 'C') { page.moveTo(186, 454); page.drawText('X', { size: 10 }) }

            }
            // FUN 1.9
            if (_child.item_9) {
                if (_child.item_9 == 'A') { page.moveTo(327, 454); page.drawText('X', { size: 10 }) }
                if (_child.item_9 == 'B') { page.moveTo(450, 454); page.drawText('X', { size: 10 }) }
            }
            // FUN 1.102
            /*
            if (_child.item_102) {
                if (_child.item_102 != 'A' && _child.item_102 != 'B' && _child.item_102 != 'C' && _child.item_102 != 'D') {
                    { page.moveTo(353, 314); page.drawText('X', { size: 9 }) }
                    { page.moveTo(480, 314); page.drawText(_child.item_102, { size: 9 }) }
                }
                else {
                    if (_child.item_102 == 'A') { page.moveTo(316, 348); page.drawText('X', { size: 10 }) }
                    if (_child.item_102 == 'B') { page.moveTo(384, 348); page.drawText('X', { size: 10 }) }
                    if (_child.item_102 == 'C') { page.moveTo(452, 348); page.drawText('X', { size: 10 }) }
                    if (_child.item_102 == 'D') { page.moveTo(519, 348); page.drawText('X', { size: 10 }) }
                }
            }
            // FUN 1.101
            if (_child.item_101) {
                if (_child.item_101 == 'A') { page.moveTo(41, 356); page.drawText('X', { size: 9 }) }
                if (_child.item_101 == 'B') { page.moveTo(132, 356); page.drawText('X', { size: 9 }) }
                if (_child.item_101 == 'C') { page.moveTo(225, 356); page.drawText('X', { size: 9 }) }
            }
            */
            // FUN 2
            _child = this._GET_CHILD_2();
            page.moveTo(50, 380); page.drawText(_child.item_211 ? _child.item_211 : "", { size: 9 })
            page.moveTo(320, 380); page.drawText(_child.item_212 ? _child.item_212 : "", { size: 9 })
            page.moveTo(50, 310); page.drawText(_child.item_22 ? _child.item_22 : "", { size: 9 })
            page.moveTo(320, 310); page.drawText(_child.item_23 ? _child.item_23 : "", { size: 9 })
            // FUN 2.6
            page.moveTo(35, 184); page.drawText(_child.item_261 ? _child.item_261 : "", { size: 12 }) // BARRIOR
            page.moveTo(315, 184); page.drawText(_child.item_262 ? _child.item_262 : "", { size: 12 }) // VEREDA
            page.moveTo(35, 156); page.drawText(_child.item_263 ? _child.item_263 : "", { size: 12 }) // COMUNA
            page.moveTo(315, 156); page.drawText(_child.item_264 ? _child.item_264 : "", { size: 12 }) // SECTOR
            page.moveTo(315, 127); page.drawText(_child.item_265 ? _child.item_265 : "", { size: 12 }) // CORREGIMIENTO
            page.moveTo(315, 100); page.drawText(_child.item_266 ? _child.item_266 : "", { size: 12 }) // LOTE
            page.moveTo(35, 127); page.drawText(_child.item_267 ? _child.item_267 : "", { size: 12 }) // ESTRATO
            page.moveTo(35, 100); page.drawText(_child.item_268 ? _child.item_268 : "", { size: 12 }) // MANZANA

            // FUN 2.4
            if (_child.item_24) {
                if (_child.item_24 == 'A') { page.moveTo(272, 271); page.drawText('X', { size: 12 }) }
                if (_child.item_24 == 'B') { page.moveTo(272, 260); page.drawText('X', { size: 12 }) }
                if (_child.item_24 == 'C') { page.moveTo(272, 249); page.drawText('X', { size: 12 }) }
            }
            // FUN 2.5
            if (_child.item_25) {
                if (_child.item_25 != 'A' && _child.item_25 != 'B' && _child.item_25 != 'null') {
                    { page.moveTo(549, 249); page.drawText('X', { size: 12 }) }
                    { page.moveTo(336, 230); page.drawText(_child.item_25, { size: 9 }) }
                } else {
                    if (_child.item_25 == 'A') { page.moveTo(549, 271); page.drawText('X', { size: 12 }) }
                    if (_child.item_25 == 'B') { page.moveTo(549, 260); page.drawText('X', { size: 12 }) }
                }
            }

            // ADVANCE TO THE NEXT PAGE
            page = pdfDoc.getPage(1);

            // FUN 3
            let _child_3 = [];
            _child = this._GET_CHILD_3();
            for (var i = 0; i < _child.length; i++) {
                _child_3.push(_child[i]);
            }
            // FUN 4
            let _child_4 = null;
            _child_4 = this._GET_CHILD_4();
            var _child_4_n = [];
            var _child_4_s = [];
            var _child_4_e = [];
            var _child_4_w = [];
            for (var i = 0; i < _child_4.length; i++) {
                if (_child_4[i].coord == 'NORTE') _child_4_n.push(_child_4[i]);
                if (_child_4[i].coord == 'SUR') _child_4_s.push(_child_4[i]);
                if (_child_4[i].coord == 'ORIENTE') _child_4_e.push(_child_4[i]);
                if (_child_4[i].coord == 'OCCIDENTE') _child_4_w.push(_child_4[i]);
            }
            // FUN 51
            let _child_51 = [];
            _child = this._GET_CHILD_51();
            for (var i = 0; i < _child.length; i++) {
                _child_51.push(_child[i]);
            }

            // DRAW TEXT IN THE PAGE
            if (_child_3.length) {
                if (_child_3[0]) {
                    { page.moveTo(70, 777); page.drawText(_child_3[0].direccion_1, { size: 11 }) }
                    { page.moveTo(70, 742); page.drawText(_child_3[0].direccion_2, { size: 11 }) }
                }
                if (_child_3[1]) {
                    { page.moveTo(352, 777); page.drawText(_child_3[1].direccion_1, { size: 11 }) }
                    { page.moveTo(352, 742); page.drawText(_child_3[1].direccion_2, { size: 11 }) }
                }
                if (_child_3[2]) {
                    { page.moveTo(70, 702); page.drawText(_child_3[2].direccion_1, { size: 11 }) }
                    { page.moveTo(70, 663); page.drawText(_child_3[2].direccion_2, { size: 11 }) }
                }
                if (_child_3[3]) {
                    { page.moveTo(352, 702); page.drawText(_child_3[3].direccion_1, { size: 11 }) }
                    { page.moveTo(352, 663); page.drawText(_child_3[3].direccion_2, { size: 11 }) }
                }
                if (_child_3[4]) {
                    { page.moveTo(70, 627); page.drawText(_child_3[4].direccion_1, { size: 11 }) }
                    { page.moveTo(70, 586); page.drawText(_child_3[4].direccion_2, { size: 11 }) }
                }
                if (_child_3[5]) {
                    { page.moveTo(352, 627); page.drawText(_child_3[5].direccion_1, { size: 11 }) }
                    { page.moveTo(352, 586); page.drawText(_child_3[5].direccion_2, { size: 11 }) }
                }
                if (_child_3[6]) {
                    { page.moveTo(70, 548); page.drawText(_child_3[6].direccion_1, { size: 11 }) }
                    { page.moveTo(70, 510); page.drawText(_child_3[6].direccion_2, { size: 11 }) }
                }
                if (_child_3[7]) {
                    { page.moveTo(352, 548); page.drawText(_child_3[7].direccion_1, { size: 11 }) }
                    { page.moveTo(352, 510); page.drawText(_child_3[7].direccion_2, { size: 11 }) }
                }

                var _ceilling = 8;
                if (_child_3.length < _ceilling) _ceilling = _child_3.length;
                for (var i = 0; i < _ceilling; i++) {
                    _child_3.shift();
                }
            }
            if (_child_4_n.length) {
                var _ceilling = 4;
                if (_child_4_n.length < _ceilling) _ceilling = _child_4_n.length;
                for (var i = 0; i < _ceilling; i++) {
                    if (_child_4_n[i]) {
                        { page.moveTo(180, 474 - (i * 12)); page.drawText(_child_4_n[i].longitud, { size: 9 }) }
                        { page.moveTo(317, 474 - (i * 12)); page.drawText(_child_4_n[i].colinda, { size: 9 }) }
                    }
                }
                for (var i = 0; i < _ceilling; i++) {
                    _child_4_n.shift();
                }
            }
            if (_child_4_s.length) {
                var _ceilling = 4;
                if (_child_4_s.length < _ceilling) _ceilling = _child_4_s.length;
                for (var i = 0; i < _ceilling; i++) {
                    if (_child_4_s[i]) {
                        { page.moveTo(180, 434 - (i * 12)); page.drawText(_child_4_s[i].longitud, { size: 9 }) }
                        { page.moveTo(317, 434 - (i * 12)); page.drawText(_child_4_s[i].colinda, { size: 9 }) }
                    }
                }
                for (var i = 0; i < _ceilling; i++) {
                    _child_4_s.shift();
                }
            }
            if (_child_4_e.length) {
                var _ceilling = 4;
                if (_child_4_e.length < _ceilling) _ceilling = _child_4_e.length;
                for (var i = 0; i < _ceilling; i++) {
                    if (_child_4_e[i]) {
                        { page.moveTo(180, 395 - (i * 12)); page.drawText(_child_4_e[i].longitud, { size: 9 }) }
                        { page.moveTo(317, 395 - (i * 12)); page.drawText(_child_4_e[i].colinda, { size: 9 }) }
                    }
                }
                for (var i = 0; i < _ceilling; i++) {
                    _child_4_e.shift();
                }
            }
            if (_child_4_w.length) {
                var _ceilling = 4;
                if (_child_4_w.length < _ceilling) _ceilling = _child_4_w.length;
                for (var i = 0; i < _ceilling; i++) {
                    if (_child_4_w[i]) {
                        { page.moveTo(180, 355 - (i * 12)); page.drawText(_child_4_w[i].longitud, { size: 9 }) }
                        { page.moveTo(317, 355 - (i * 12)); page.drawText(_child_4_w[i].colinda, { size: 9 }) }
                    }
                }
                for (var i = 0; i < _ceilling; i++) {
                    _child_4_w.shift();
                }
            }
            if (_child_51.length) {
                var _ceilling = 4;
                if (_child_51.length < _ceilling) _ceilling = _child_51.length;
                for (var i = 0; i < _ceilling; i++) {
                    { page.moveTo(70, 252 - (i * 36)); page.drawText(_child_51[i].name + ' ' + _child_51[i].surname, { size: 9 }) }
                    { page.moveTo(70, 238 - (i * 36)); page.drawText(String(_child_51[i].id_number), { size: 9 }) }
                    { page.moveTo(245, 238 - (i * 36)); page.drawText(String(_child_51[i].nunber), { size: 9 }) }
                    { page.moveTo(400, 238 - (i * 36)); page.drawText(_child_51[i].email, { size: 9 }) }
                }
                for (var i = 0; i < _ceilling; i++) {
                    _child_51.shift();
                }
            }

            // IN THE PAGE 2 THE SOFTWARE MUST WRITE A CERTAIN AMMOUNT OF PAGES 2, AS MANY AS IT NEEDS TO COVER AL THE ITEMS OF THE OBJECTS
            // FUN 3, FUN 4 AND FUN 51.
            // IN ORDER TO DETERMINE IF MORE PAGES 2 ARE REQUIRE THE SOFTWARE MUST KNOW HOW MANY EXTRA ITEMS ARE GREATER THAN THE NUMBER
            // IT CAN CONTAIN PHYSICALLY IN THE PAGE 2
            // FOR FUN 3 IT CAN HOLD 8 ITEMS PER PAGE
            // FOR FUN 4 IT CAN CONTAIN 4 ITEMS OF A SINGLE CARDINAL DIRECTION
            // FOR FUN 51 IT CAN CONTAIN 4 ITEMS PER PAGE
            // IF THIS MINIMUN NUMBER IS SURPASSED AN ADITIONAL PAGE 2 IS REQUIRED.
            // DOES AN INTITIAL WRITE FOR FUN 3, FUN 4 AND FUN 51

            const _items_FUN_3 = this._GET_CHILD_3().length;
            const _item_FUN_4 = this._GET_CHILD_4();
            const _items_FUN_51 = this._GET_CHILD_51().length
            const pages_fun_3 = Math.trunc(_items_FUN_3 / 8);
            const pages_fun_51 = Math.trunc(_items_FUN_51 / 4);

            var _items_FUN_4_N = 0;
            var _items_FUN_4_S = 0;
            var _items_FUN_4_E = 0;
            var _items_FUN_4_W = 0;
            for (var i = 0; i < _item_FUN_4.length; i++) {
                if (_item_FUN_4[i].coord == 'NORTE') _items_FUN_4_N++;
                if (_item_FUN_4[i].coord == 'SUR') _items_FUN_4_S++;
                if (_item_FUN_4[i].coord == 'ORIENTE') _items_FUN_4_E++;
                if (_item_FUN_4[i].coord == 'OCCIDENTE') _items_FUN_4_W++;
            }
            const pages_fun_4_n = Math.trunc(_items_FUN_4_N / 4);
            const pages_fun_4_s = Math.trunc(_items_FUN_4_S / 4);
            const pages_fun_4_e = Math.trunc(_items_FUN_4_E / 4);
            const pages_fun_4_w = Math.trunc(_items_FUN_4_W / 4);
            // IF ANY OF THE pages VARIABLES IS EQUAL OR GREATER THAN 1, MORE PAGES 2 ARE REQUIRED,
            // THE EXTRA NUMBER  OF PAGES 2 IS EQUAL TO THE GREATER NUMBER AMONGS THE pages VALUES
            var GREATER_NUMBER = pages_fun_3;
            if (GREATER_NUMBER < pages_fun_51) GREATER_NUMBER = pages_fun_51;
            if (GREATER_NUMBER < pages_fun_4_n) GREATER_NUMBER = pages_fun_4_n;
            if (GREATER_NUMBER < pages_fun_4_s) GREATER_NUMBER = pages_fun_4_s;
            if (GREATER_NUMBER < pages_fun_4_e) GREATER_NUMBER = pages_fun_4_e;
            if (GREATER_NUMBER < pages_fun_4_w) GREATER_NUMBER = pages_fun_4_w;
            //console.log("THE NUMBER OF EXTRA PAGES IS: ", GREATER_NUMBER)

            for (var j = 0; j < GREATER_NUMBER; j++) {

                var PdfUrl_2pg = process.env.REACT_APP_API_URL + "/pdf/funform2pgflat";
                var Buffer_2pg = await fetch(PdfUrl_2pg).then((res) => res.arrayBuffer())
                var PdfDoc_2pg = await PDFDocument.load(Buffer_2pg)
                let page = PdfDoc_2pg.getPage(0);
                // ---------------------------

                if (_child_3.length) {
                    if (_child_3[0]) {
                        { page.moveTo(61, 767); page.drawText(_child_3[0].direccion_1, { size: 9 }) }
                        { page.moveTo(61, 742); page.drawText(_child_3[0].direccion_2, { size: 9 }) }
                    }
                    if (_child_3[1]) {
                        { page.moveTo(332, 767); page.drawText(_child_3[1].direccion_1, { size: 9 }) }
                        { page.moveTo(332, 742); page.drawText(_child_3[1].direccion_2, { size: 9 }) }
                    }
                    if (_child_3[2]) {
                        { page.moveTo(61, 715); page.drawText(_child_3[2].direccion_1, { size: 9 }) }
                        { page.moveTo(61, 689); page.drawText(_child_3[2].direccion_2, { size: 9 }) }
                    }
                    if (_child_3[3]) {
                        { page.moveTo(332, 715); page.drawText(_child_3[3].direccion_1, { size: 9 }) }
                        { page.moveTo(332, 689); page.drawText(_child_3[3].direccion_2, { size: 9 }) }
                    }
                    if (_child_3[4]) {
                        { page.moveTo(61, 663); page.drawText(_child_3[4].direccion_1, { size: 9 }) }
                        { page.moveTo(61, 638); page.drawText(_child_3[4].direccion_2, { size: 9 }) }
                    }
                    if (_child_3[5]) {
                        { page.moveTo(332, 663); page.drawText(_child_3[5].direccion_1, { size: 9 }) }
                        { page.moveTo(332, 638); page.drawText(_child_3[5].direccion_2, { size: 9 }) }
                    }
                    if (_child_3[6]) {
                        { page.moveTo(61, 612); page.drawText(_child_3[6].direccion_1, { size: 9 }) }
                        { page.moveTo(61, 586); page.drawText(_child_3[6].direccion_2, { size: 9 }) }
                    }
                    if (_child_3[7]) {
                        { page.moveTo(332, 612); page.drawText(_child_3[7].direccion_1, { size: 9 }) }
                        { page.moveTo(332, 586); page.drawText(_child_3[7].direccion_2, { size: 9 }) }
                    }

                    var _ceilling = 8;
                    if (_child_3.length < _ceilling) _ceilling = _child_3.length;
                    for (var i = 0; i < _ceilling; i++) {
                        _child_3.shift();
                    }
                }
                if (_child_4_n.length) {
                    var _ceilling = 4;
                    if (_child_4_n.length < _ceilling) _ceilling = _child_4_n.length;
                    for (var i = 0; i < _ceilling; i++) {
                        if (_child_4_n[i]) {
                            { page.moveTo(180, 536 - (i * 12)); page.drawText(_child_4_n[i].longitud, { size: 9 }) }
                            { page.moveTo(317, 536 - (i * 12)); page.drawText(_child_4_n[i].colinda, { size: 9 }) }
                        }
                    }
                    for (var i = 0; i < _ceilling; i++) {
                        _child_4_n.shift();
                    }
                }
                if (_child_4_s.length) {
                    var _ceilling = 4;
                    if (_child_4_s.length < _ceilling) _ceilling = _child_4_s.length;
                    for (var i = 0; i < _ceilling; i++) {
                        if (_child_4_s[i]) {
                            { page.moveTo(180, 487 - (i * 12)); page.drawText(_child_4_s[i].longitud, { size: 9 }) }
                            { page.moveTo(317, 487 - (i * 12)); page.drawText(_child_4_s[i].colinda, { size: 9 }) }
                        }
                    }
                    for (var i = 0; i < _ceilling; i++) {
                        _child_4_s.shift();
                    }
                }
                if (_child_4_e.length) {
                    var _ceilling = 4;
                    if (_child_4_e.length < _ceilling) _ceilling = _child_4_s.length;
                    for (var i = 0; i < _ceilling; i++) {
                        if (_child_4_e[i]) {
                            { page.moveTo(180, 440 - (i * 12)); page.drawText(_child_4_e[i].longitud, { size: 9 }) }
                            { page.moveTo(317, 440 - (i * 12)); page.drawText(_child_4_e[i].colinda, { size: 9 }) }
                        }
                    }
                    for (var i = 0; i < _ceilling; i++) {
                        _child_4_e.shift();
                    }
                }
                if (_child_4_w.length) {
                    var _ceilling = 4;
                    if (_child_4_w.length < _ceilling) _ceilling = _child_4_s.length;
                    for (var i = 0; i < _ceilling; i++) {
                        if (_child_4_w[i]) {
                            { page.moveTo(180, 393 - (i * 12)); page.drawText(_child_4_w[i].longitud, { size: 9 }) }
                            { page.moveTo(317, 393 - (i * 12)); page.drawText(_child_4_w[i].colinda, { size: 9 }) }
                        }
                    }
                    for (var i = 0; i < _ceilling; i++) {
                        _child_4_w.shift();
                    }
                }
                if (_child_51.length) {
                    var _ceilling = 4;
                    if (_child_51.length < _ceilling) _ceilling = _child_51.length;
                    for (var i = 0; i < _ceilling; i++) {
                        { page.moveTo(43, 261 - (i * 50)); page.drawText(_child_51[i].name + ' ' + _child_51[i].surname, { size: 9 }) }
                        { page.moveTo(43, 241 - (i * 50)); page.drawText(String(_child_51[i].id_number), { size: 9 }) }
                        { page.moveTo(180, 241 - (i * 50)); page.drawText(String(_child_51[i].nunber), { size: 9 }) }
                        { page.moveTo(318, 241 - (i * 50)); page.drawText(_child_51[i].email, { size: 9 }) }
                    }
                    for (var i = 0; i < _ceilling; i++) {
                        _child_51.shift();
                    }
                }
                // ---------------------------
                const pdfBytes_2pg = await PdfDoc_2pg.save();
                var [copiedPages] = await pdfDoc.copyPages(PdfDoc_2pg, [0]);
                pdfDoc.addPage(copiedPages);
            }

            // ADVANCE TO THE NEXT PAGE
            page = pdfDoc.getPage(2);

            // FUN 52
            _child = this.GET_CHILD_52();
            if (_child.length) {
                for (var i = 0; i < _child.length; i++) {
                    if (_child[i].role.includes("URBANIZADOR/PARCELADOR")) {
                        let offset = 0 * 75
                        page.moveTo(118, 795 - 3 - offset); page.drawText(_child[i].name + ' ' + _child[i].surname, { size: 9 })
                        page.moveTo(118, 773 - 3 - offset); page.drawText(String(_child[i].id_number), { size: 9 })
                        page.moveTo(272, 773 - 3 - offset); page.drawText(String(_child[i].registration), { size: 9 })
                        page.moveTo(427, 773 - 3 - offset); page.drawText(dateParser(_child[i].registration_date), { size: 9 })
                        page.moveTo(118, 753 - 3 - offset); page.drawText(_child[i].email, { size: 9 })
                        page.moveTo(352, 753 - 3 - offset); page.drawText(_child[i].number, { size: 9 })
                    }
                    if (_child[i].role.includes("URBANIZADOR O CONSTRUCTOR RESPONSABLE") || _child[i].role.includes("DIRECTOR DE LA CONSTRUCCION")) {
                        let offset = 1 * 67
                        page.moveTo(118, 795 - offset); page.drawText(_child[i].name + ' ' + _child[i].surname, { size: 9 })
                        page.moveTo(118, 773 - offset); page.drawText(String(_child[i].id_number), { size: 9 })
                        page.moveTo(272, 773 - offset); page.drawText(String(_child[i].registration), { size: 9 })
                        page.moveTo(422 + 50, 773 - offset); page.drawText(dateParser(_child[i].registration_date), { size: 9 })
                        page.moveTo(118, 753 + 2 - offset); page.drawText(_child[i].email, { size: 9 })
                        page.moveTo(352, 753 + 2 - offset); page.drawText(_child[i].number, { size: 9 })
                    }
                    if (_child[i].role.includes("ARQUITECTO PROYECTISTA")) {
                        let offset = 2 * 66
                        page.moveTo(118, 795 - offset); page.drawText(_child[i].name + ' ' + _child[i].surname, { size: 9 })
                        page.moveTo(118, 773 - offset); page.drawText(String(_child[i].id_number), { size: 9 })
                        page.moveTo(272, 773 - offset); page.drawText(String(_child[i].registration), { size: 9 })
                        page.moveTo(427, 773 - offset); page.drawText(dateParser(_child[i].registration_date), { size: 9 })
                        page.moveTo(118, 753 + 2 - offset); page.drawText(_child[i].email, { size: 9 })
                        page.moveTo(352, 753 + 2 - offset); page.drawText(_child[i].number, { size: 9 })
                    }
                    if (_child[i].role.includes("INGENIERO CIVIL DISEÑADOR ESTRUCTURAL")) {
                        let offset = 3 * 66
                        page.moveTo(118, 795 - offset); page.drawText(_child[i].name + ' ' + _child[i].surname, { size: 9 })
                        page.moveTo(118, 773 - offset); page.drawText(String(_child[i].id_number), { size: 9 })
                        page.moveTo(272, 773 - offset); page.drawText(String(_child[i].registration), { size: 9 })
                        page.moveTo(427, 773 - offset); page.drawText(dateParser(_child[i].registration_date), { size: 9 })
                        page.moveTo(118, 753 + 1 - offset); page.drawText(_child[i].email, { size: 9 })
                        page.moveTo(352, 753 + 1 - offset); page.drawText(_child[i].number, { size: 9 })
                        if (_child[i].supervision == 'SI') { page.moveTo(521, 777 - offset); page.drawText('X', { size: 12 }) }
                        else if (_child[i].supervision == 'NO') { page.moveTo(550, 777 - offset); page.drawText('X', { size: 12 }) }
                    }
                    if (_child[i].role.includes("DISEÑADOR DE ELEMENTOS NO ESTRUCTURALES")) {
                        let offset = 4 * 66
                        page.moveTo(118, 795 - offset); page.drawText(_child[i].name + ' ' + _child[i].surname, { size: 9 })
                        page.moveTo(118, 773 - offset); page.drawText(String(_child[i].id_number), { size: 9 })
                        page.moveTo(272, 773 - offset); page.drawText(String(_child[i].registration), { size: 9 })
                        page.moveTo(427, 773 - offset); page.drawText(dateParser(_child[i].registration_date), { size: 8 })
                        page.moveTo(118, 753 + 2 - offset); page.drawText(_child[i].email, { size: 9 })
                        page.moveTo(352, 753 + 2 - offset); page.drawText(_child[i].number, { size: 9 })
                    }
                    if (_child[i].role.includes("INGENIERO CIVIL GEOTECNISTA")) {
                        let offset = 5 * 66
                        page.moveTo(118, 795 - offset); page.drawText(_child[i].name + ' ' + _child[i].surname, { size: 9 })
                        page.moveTo(118, 773 - offset); page.drawText(String(_child[i].id_number), { size: 9 })
                        page.moveTo(272, 773 - offset); page.drawText(String(_child[i].registration), { size: 9 })
                        page.moveTo(427, 773 - offset); page.drawText(dateParser(_child[i].registration_date), { size: 9 })
                        page.moveTo(352, 753 + 2 - offset); page.drawText(_child[i].number, { size: 9 })
                        page.moveTo(118, 753 + 2 - offset); page.drawText(_child[i].email, { size: 9 })
                        if (_child[i].supervision == 'SI') { page.moveTo(521, 777 - offset); page.drawText('X', { size: 12 }) }
                        else if (_child[i].supervision == 'NO') { page.moveTo(550, 777 - offset); page.drawText('X', { size: 12 }) }
                    }
                    if (_child[i].role.includes("INGENIERO TOPOGRAFO Y/O TOPÓGRAFO")) {
                        let offset = 6 * 66
                        page.moveTo(118, 795 - offset); page.drawText(_child[i].name + ' ' + _child[i].surname, { size: 9 })
                        page.moveTo(118, 773 - offset); page.drawText(String(_child[i].id_number), { size: 9 })
                        page.moveTo(272, 773 - offset); page.drawText(String(_child[i].registration), { size: 9 })
                        page.moveTo(427, 773 - offset); page.drawText(dateParser(_child[i].registration_date), { size: 9 })
                        page.moveTo(118, 753 + 3 - offset); page.drawText(_child[i].email, { size: 9 })
                        page.moveTo(352, 753 + 3 - offset); page.drawText(_child[i].number, { size: 9 })
                    }
                    if (_child[i].role.includes("REVISOR INDEPENDIENTE DE LOS DISEÑOS ESTRUCTURALES")) {
                        let offset = 7 * 66
                        page.moveTo(118, 795 - offset); page.drawText(_child[i].name + ' ' + _child[i].surname, { size: 9 })
                        page.moveTo(118, 773 + 1 - offset); page.drawText(String(_child[i].id_number), { size: 9 })
                        page.moveTo(272, 773 + 1 - offset); page.drawText(String(_child[i].registration), { size: 9 })
                        page.moveTo(427, 773 + 1 - offset); page.drawText(dateParser(_child[i].registration_date), { size: 9 })
                        page.moveTo(118, 753 + 3 - offset); page.drawText(_child[i].email, { size: 9 })
                        page.moveTo(352, 753 + 3 - offset); page.drawText(_child[i].number, { size: 9 })
                    }
                    if (_child[i].role.includes("OTROS PROFESIONALES ESPECIALISTAS")) {
                        let offset = 8 * 66
                        page.moveTo(118, 795 - offset); page.drawText(_child[i].name + ' ' + _child[i].surname, { size: 9 })
                        page.moveTo(118, 773 + 2 - offset); page.drawText(String(_child[i].id_number), { size: 9 })
                        page.moveTo(272, 773 + 2 - offset); page.drawText(String(_child[i].registration), { size: 9 })
                        page.moveTo(427, 773 + 2 - offset); page.drawText(dateParser(_child[i].registration_date), { size: 9 })
                        page.moveTo(118, 753 + 4 - offset); page.drawText(_child[i].email, { size: 9 })
                        page.moveTo(352, 753 + 4 - offset); page.drawText(_child[i].number, { size: 9 })
                    }
                }

            }

            // FUN 53
            _child = this._GET_CHILD_53();
            page.moveTo(118, 130); page.drawText(_child.item_5311 + ' ' + _child.item_5312, { size: 9 });
            page.moveTo(118, 110); page.drawText(_child.item_532 ? _child.item_532 : "", { size: 9 }); // ID NUMBER
            page.moveTo(430, 110); page.drawText(_child.item_534 ? _child.item_534 : "", { size: 9 }); // NUMBER
            page.moveTo(350, 76); page.drawText(_child.item_535 ? _child.item_535 : "", { size: 9 }); // EMAIL
            page.moveTo(118, 76); page.drawText(_child.item_536 ? _child.item_536 : "", { size: 9 }); // ADDRESS

            _child = this._GET_CHILD_1();
            let A1 = _child.anex1 ? _child.anex1.split(';') : [];
            let A2 = getJSONFull(_child.anex2);
            let A3 = _child.anex3 ? _child.anex3.split(';') : [];

            page = pdfDoc.getPage(3);

            // FUN ANEX 1

            if (A1.includes('A')) { page.moveTo(125, 797); page.drawText('X', { size: 12 }); }
            if (A1.includes('B')) { page.moveTo(279, 797); page.drawText('X', { size: 12 }); }
            if (A1.includes('C')) { page.moveTo(407, 797); page.drawText('X', { size: 12 }); }
            if (A1.includes('D')) { page.moveTo(482, 797); page.drawText('X', { size: 12 }); }
            if (A1.includes('E')) { page.moveTo(124, 775); page.drawText('X', { size: 12 }); }
            if (A1.includes('F')) { page.moveTo(279, 775); page.drawText('X', { size: 12 }); }
            if (A1[6]) { page.moveTo(370, 775); page.drawText(A1[6], { size: 9 }); }
            if (A1[6]) { page.moveTo(437, 775); page.drawText('X', { size: 12 }); }

            // FUN ANEX 2

            let A2_11 = A2.a211 ? A2.a211.split(';') : [];
            let A2_12 = A2.a212 ? A2.a212.split(';') : [];
            let A2_2 = A2.a22 ? A2.a22.split(';') : [];
            let A2_3 = A2.a23 ? A2.a23.split(';') : [];
            let A2_4 = A2.a24 ? A2.a24.split(';') : [];
            let A2_6 = A2.a26 ? A2.a26.split(';') : [];

            let offset_y = 0;
            let offset_x = 0;
            let anex = A2_11;

            function drawAnex(offset = [0, 0, 0, 0, 0, 0]) {
                if (anex.includes('A')) { page.moveTo(278 + offset_x, 720 - offset_y - offset[0]); page.drawText('X', { size: 12 }); }
                if (anex.includes('B')) { page.moveTo(278 + offset_x, 709 - offset_y - offset[1]); page.drawText('X', { size: 12 }); }
                if (anex.includes('C')) { page.moveTo(278 + offset_x, 698 - offset_y - offset[2]); page.drawText('X', { size: 12 }); }
                if (anex.includes('D')) { page.moveTo(278 + offset_x, 687 - offset_y - offset[3]); page.drawText('X', { size: 12 }); }
                if (anex.includes('E')) { page.moveTo(278 + offset_x, 676 - offset_y - offset[4]); page.drawText('X', { size: 12 }); }
                if (anex[5]) { page.moveTo(153 + offset_x, 666 - offset_y - offset[5]); page.drawText(anex[5], { size: 9 }); }
                if (anex[5]) { page.moveTo(278 + offset_x, 665 - offset_y - offset[5]); page.drawText('X', { size: 12 }); }
            }

            drawAnex();

            offset_y = 0;
            offset_x = 270;
            anex = A2_12;

            drawAnex();

            offset_y = 94;
            offset_x = 0;
            anex = A2_2;

            drawAnex();

            offset_y = 94;
            offset_x = 270;
            anex = A2_3;

            drawAnex();

            offset_y = 171;
            offset_x = 0;
            anex = A2_4;

            drawAnex([0, 0, 1, 2, 3, 4]);

            offset_y = 251;
            offset_x = 0;
            anex = A2_6;

            drawAnex();

            let A2_5 = A2.a24 ? A2.a25.split(';') : [];
            if (A2_5[0]) { page.moveTo(430, 538); page.drawText(A2_5[0], { size: 9 }); }
            if (A2_5[1]) { page.moveTo(430, 526); page.drawText(A2_5[1], { size: 9 }); }
            if (A2_5[2]) { page.moveTo(430, 514); page.drawText(A2_5[2], { size: 9 }); }
            if (A2_5[3]) { page.moveTo(430, 502); page.drawText(A2_5[3], { size: 9 }); }
            if (A2_5[4]) { page.moveTo(500, 514); page.drawText(A2_5[4], { size: 9 }); }

            let A2_7 = A2.a27 ? A2.a27.split(';') : [];

            if (A2_7.includes('A')) { page.moveTo(317, 452); page.drawText('X', { size: 12 }); }
            if (A2_7.includes('B')) { page.moveTo(372, 452); page.drawText('X', { size: 12 }); }
            if (A2_7.includes('C')) { page.moveTo(450, 452); page.drawText('X', { size: 12 }); }
            if (A2_7.includes('D')) { page.moveTo(512, 452); page.drawText('X', { size: 12 }); }
            if (A2_7.includes('E')) { page.moveTo(316, 414); page.drawText('X', { size: 12 }); }
            if (A2_7.includes('F')) { page.moveTo(393, 414); page.drawText('X', { size: 12 }); }
            if (A2_7[6]) { page.moveTo(495, 414); page.drawText(A2_7[6], { size: 9 }); }

            let A2_8 = A2.a28 ? A2.a28.split(';') : [];
            if (A2_8[0]) { page.moveTo(205, 382); page.drawText(A2_8[0], { size: 9 }); }

            let A2_9 = A2.a29 ? A2.a29.split(';') : [];
            if (A2_9[0]) { page.moveTo(485, 382); page.drawText(A2_9[0], { size: 9 }); }


            // FUN ANEX 3

            if (A3[0]) { page.moveTo(520, 348); page.drawText(A3[0], { size: 9 }); }
            if (A3[1]) { page.moveTo(520, 330); page.drawText(A3[1], { size: 9 }); }
            if (A3[2]) { page.moveTo(520, 315); page.drawText(A3[2], { size: 9 }); }
        }


        let _author = document.getElementById('fun_pdf_0_1').value + ' DE ' + document.getElementById('fun_pdf_0_4').value
        pdfDoc.setAuthor(_author);
        pdfDoc.setCreationDate(moment().toDate());
        pdfDoc.setCreator('NESTOR TRIANA - MORE INFO AT: http://devnatriana.com/ ');
        pdfDoc.setKeywords(['formulario', 'unico', 'nacional', 'curaduria', 'planeacion', 'construccion', 'obra', 'proyecto']);
        pdfDoc.setLanguage('es-co');
        pdfDoc.setProducer('NESTOR TRIANA - MORE INFO AT: http://devnatriana.com/ ');
        pdfDoc.setTitle('FORMULARIO UNICO NACIONAL - ' + currentItem.id_public)

        var pdfBytes = await pdfDoc.save();
        var fileDownload = require('js-file-download');
        fileDownload(pdfBytes, 'FORMULARIO UNICO NACIONAL ' + currentItem.id_public + '.pdf');
        MySwal.close();

        /* USE THIS TO DEBUG OR CHECK THE IDS OF THE FIELDS
          const fields = form.getFields()
        fields.forEach(field => {
          const type = field.constructor.name
          const name = field.getName()
          console.log(`${type}: ${name}`)
        })
        */
    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion } = this.props;
        const { } = this.state;
        let _GET_CLOCK = () => {
            var _CHILD = currentItem.fun_clocks;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _GET_CLOCK_STATE = (_state) => {
            var _CLOCK = _GET_CLOCK();
            if (_state == null) return false;
            var _clock = [];
            for (var i = 0; i < _CLOCK.length; i++) {
                if (_CLOCK[i].state == _state) return (_CLOCK[i]);
            }
            return _clock;
        }
        return (
            <div className="py-3">
                <div className="row mb-3">
                    <div className="col-5">
                        <label>Oficina Responsable</label>
                        <div class="input-group my-1">
                            <select class="form-select me-1" id={"fun_pdf_0_1"}>
                                {domains}
                            </select>
                        </div>
                    </div>
                    <div className="col-4">
                        <label>No. de Radicación</label>
                        <div class="input-group my-1">
                            <input type="text" class="form-control" id="fun_pdf_0_2"
                                defaultValue={currentItem.id_public} disabled />
                        </div>
                    </div>
                    <div className="col">
                        <label>Modelo</label>
                        <div class="input-group my-1">
                            <input type="text" class="form-control" id="fun_pdf_0_6"
                                defaultValue={currentItem.model} disabled />
                        </div>
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-4">
                        <label>Departamento</label>
                        <div class="input-group my-1">
                            <select class="form-select me-1" id={"fun_pdf_0_3"}>
                                {states}
                            </select>
                        </div>
                    </div>
                    <div className="col-4">
                        <label>Municipio</label>
                        <div class="input-group my-1">
                            <select class="form-select me-1" id={"fun_pdf_0_4"}>
                                {cities}
                            </select>
                        </div>
                    </div>
                    <div className="col-3">
                        <label>Fecha (Pago de Expensas)</label>
                        <div class="input-group my-1">
                            <input type="text" class="form-control" id="fun_pdf_0_5"
                                defaultValue={dateParser(_GET_CLOCK_STATE(3).date_start)} disabled />
                        </div>
                    </div>
                </div>

                <div className="row mb-3 text-center">
                    <div className="col-12">
                        <button className="btn btn-danger my-3" onClick={() => this.getPdfForm()}><i class="far fa-file-pdf"></i> DESCARGAR FORMULARIO</button>
                    </div>
                </div>
            </div>
        );
    }
}


export default FUN_PDF;