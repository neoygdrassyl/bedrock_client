import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import { PDFDocument, StandardFonts } from 'pdf-lib';
import { dateParser } from '../../../../components/customClasses/typeParse';
import moment from 'moment';
import { cities, domains, domains_number } from '../../../../components/jsons/vars';

const MySwal = withReactContent(Swal);
const _GLOBAL_ID = process.env.REACT_APP_GLOBAL_ID;
class FUN_PDF_CHECK extends Component {
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
        }
        if (_CHILD) {
            if (_CHILD[_CURRENT_VERSION] != null) {
                _CHILD_VARS.item_0 = _CHILD[_CURRENT_VERSION].id;
                _CHILD_VARS.item_1 = _CHILD[_CURRENT_VERSION].tipo ? _CHILD[_CURRENT_VERSION].tipo : " ";
                _CHILD_VARS.item_2 = _CHILD[_CURRENT_VERSION].tramite ? _CHILD[_CURRENT_VERSION].tramite : " ";
                _CHILD_VARS.item_3 = _CHILD[_CURRENT_VERSION].m_urb ? _CHILD[_CURRENT_VERSION].m_urb : " ";
                _CHILD_VARS.item_4 = _CHILD[_CURRENT_VERSION].m_sub ? _CHILD[_CURRENT_VERSION].m_sub : " ";
                _CHILD_VARS.item_5 = _CHILD[_CURRENT_VERSION].m_lic ? _CHILD[_CURRENT_VERSION].m_lic : " ";
                _CHILD_VARS.item_6 = _CHILD[_CURRENT_VERSION].usos ? _CHILD[_CURRENT_VERSION].usos : " ";
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
            _CHILD_VARS.item_211 = _CHILD.direccion != 'null' ? _CHILD.direccion : " ";
            _CHILD_VARS.item_212 = _CHILD.direccion_ant != 'null' ? _CHILD.direccion_ant : " ";;
            _CHILD_VARS.item_22 = _CHILD.matricula != 'null' ? _CHILD.matricula : " ";;
            _CHILD_VARS.item_23 = _CHILD.catastral != 'null' ? _CHILD.catastral : " ";;
            _CHILD_VARS.item_24 = _CHILD.suelo; // PARSER
            _CHILD_VARS.item_25 = _CHILD.lote_pla;// PARSER

            _CHILD_VARS.item_261 = _CHILD.barrio != 'null' ? _CHILD.barrio : " ";;
            _CHILD_VARS.item_262 = _CHILD.vereda != 'null' ? _CHILD.vereda : " ";;
            _CHILD_VARS.item_263 = _CHILD.comuna != 'null' ? _CHILD.comuna : " ";;
            _CHILD_VARS.item_264 = _CHILD.sector != 'null' ? _CHILD.sector : " ";;
            _CHILD_VARS.item_265 = _CHILD.corregimiento != 'null' ? _CHILD.corregimiento : " ";;
            _CHILD_VARS.item_266 = _CHILD.lote != 'null' ? _CHILD.lote : " ";;
            _CHILD_VARS.item_267 = _CHILD.estrato != 'null' ? _CHILD.estrato : " ";;
            _CHILD_VARS.item_268 = _CHILD.manzana != 'null' ? _CHILD.manzana : " ";;
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
                _CHILD_VARS.item_5311 = _CHILD[_CURRENT_VERSION].name ? _CHILD[_CURRENT_VERSION].name : " ";
                _CHILD_VARS.item_5312 = _CHILD[_CURRENT_VERSION].surname ? _CHILD[_CURRENT_VERSION].surname : " ";
                _CHILD_VARS.item_532 = _CHILD[_CURRENT_VERSION].id_number ? _CHILD[_CURRENT_VERSION].id_number : " ";
                _CHILD_VARS.item_533 = _CHILD[_CURRENT_VERSION].role ? _CHILD[_CURRENT_VERSION].role : " ";
                _CHILD_VARS.item_534 = _CHILD[_CURRENT_VERSION].number ? _CHILD[_CURRENT_VERSION].number : " ";
                _CHILD_VARS.item_535 = _CHILD[_CURRENT_VERSION].email ? _CHILD[_CURRENT_VERSION].email : " ";
                _CHILD_VARS.item_536 = _CHILD[_CURRENT_VERSION].address ? _CHILD[_CURRENT_VERSION].address : " ";
                _CHILD_VARS.docs = _CHILD[_CURRENT_VERSION].docs ? _CHILD[_CURRENT_VERSION].docs : " ";
            }
        }
        return _CHILD_VARS;
    }
    _GET_CHILD_C = () => {
        var _CHILD = this.props.currentItem.fun_cs;
        var _CURRENT_VERSION = this.props.currentItem.version - 1;
        var _CHILD_VARS = {
            item_c0: "",
            item_c1: "",
            item_c2: "",
            item_c3: "",
            item_c4: "",
            item_c5: "",
            item_c6: "",
            item_c7: "",
            item_c8: "",
            item_c9: "",
        }
        if (_CHILD) {
            if (_CHILD[_CURRENT_VERSION] != null) {
                _CHILD_VARS.item_c0 = _CHILD[_CURRENT_VERSION].id;
                _CHILD_VARS.item_c1 = _CHILD[_CURRENT_VERSION].worker ? _CHILD[_CURRENT_VERSION].worker : " ";
                _CHILD_VARS.item_c2 = _CHILD[_CURRENT_VERSION].date ? _CHILD[_CURRENT_VERSION].date : " ";
                _CHILD_VARS.item_c3 = _CHILD[_CURRENT_VERSION].condition ? _CHILD[_CURRENT_VERSION].condition : " ";
                _CHILD_VARS.item_c4 = _CHILD[_CURRENT_VERSION].details ? _CHILD[_CURRENT_VERSION].details : " ";
                _CHILD_VARS.item_c5 = _CHILD[_CURRENT_VERSION].reciever_name ? _CHILD[_CURRENT_VERSION].reciever_name : " ";
                _CHILD_VARS.item_c6 = _CHILD[_CURRENT_VERSION].reciever_date ? _CHILD[_CURRENT_VERSION].reciever_date : " ";
                _CHILD_VARS.item_c7 = _CHILD[_CURRENT_VERSION].reciever_id ? _CHILD[_CURRENT_VERSION].reciever_id : " ";
                _CHILD_VARS.item_c8 = _CHILD[_CURRENT_VERSION].reciever_actor ? _CHILD[_CURRENT_VERSION].reciever_actor : " ";
                _CHILD_VARS.item_c9 = _CHILD[_CURRENT_VERSION].legal_date ? _CHILD[_CURRENT_VERSION].legal_date : " ";
            }
        }

        return _CHILD_VARS;
    }
    _GET_CHILD_REVIEW() {
        var _CHILD = this.props.currentItem.fun_rs;
        var _CURRENT_VERSION = this.props.currentVersion - 1;
        if (_CHILD) {
            if (_CHILD[_CURRENT_VERSION] != null) {
                _CHILD = _CHILD[_CURRENT_VERSION]
            } else {
                _CHILD = false
            }
        }
        return _CHILD;
    }

    _GET_CLOCK = () => {
        var _CHILD = this.props.currentItem.fun_clocks;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
    }

    _GET_CLOCK_STATE = (_state) => {
        var _CLOCK = this._GET_CLOCK();
        if (_state == null) return false;
        for (var i = 0; i < _CLOCK.length; i++) {
            if (_CLOCK[i].state == _state) return _CLOCK[i];
        }
        return false;
    }

    WordWrap(text, maxLength) {
        if (!text) return false;

        const strWords = text.split(' ');
        let tempWord = '';
        let lineLength = 0;

        return strWords.reduce((acc, word) => {
            lineLength += word.length;

            if (lineLength > maxLength) {
                lineLength = 0;
                tempWord = word;
                return `${acc} \n`
            } else {
                const withTempWord = `${acc} ${tempWord} ${word}`;
                tempWord = '';
                return withTempWord;
            }
        }, '');
    };
    async getPdfForm() {
        let swaMsg = this.props.swaMsg;
        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });

        let model = this.props.currentItem.model
        if (!model) return MySwal.fire({
            title: 'SOLICITUD SIN MODELO',
            text: 'Para poder generar el PDF de esta solicitud, se debe de definir el modelo.',
            icon: 'error',
            showConfirmButton: true,
            confirmButtonText: 'CONTINUAR',
        });


        let m_2022 = Number(model) >= 2022
        // m_2022 = false

        var formUrl = process.env.REACT_APP_API_URL + "/pdf/funcheckflat";
        // if (m_2022) formUrl = process.env.REACT_APP_API_URL + "/pdf/funcheckflat";
        if (m_2022) formUrl = process.env.REACT_APP_API_URL + "/pdf/funcheckflat2022";

        var formPdfBytes = await fetch(formUrl).then(res => res.arrayBuffer());
        var pdfDoc = await PDFDocument.load(formPdfBytes);

        var _child = null;
        var _array = null;
        const currentItem = this.props.currentItem;

        let page = pdfDoc.getPage(0)
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
        page.setFont(helveticaFont)
        // WIDTH = 612, HEIGHT = 936

        let _city = document.getElementById('func_pdf_0_2').value;
        let _date = this._GET_CLOCK_STATE(3)
        if (_date.date_start && _GLOBAL_ID === 'cb1') _city = document.getElementById('func_pdf_0_2').value + ", radicado el " + _date.date_start;
        let _number = document.getElementById('func_pdf_0_1').value;

        let ox = 0
        let oy = 0

        let o_si = 0
        let o_no = 0
        let o_na = 0


        let print_new_page = (n) => {
            if (m_2022) {
                let y_offset = 0
                if (n == 2 || n == 3) y_offset = -15
                page.moveTo(210, 632 + y_offset)
                page.drawText(_number, { size: 14 })
                page.moveTo(100, 620 + y_offset)
                page.drawText(_city, { size: 9 })
                page.moveTo(450, 665 + y_offset)
                page.drawText(currentItem.id_public, { size: 14 })
            }
            else {
                page.moveTo(215, 783)
                page.drawText(_number, { size: 14 })
                page.moveTo(100, 770)
                page.drawText(_city, { size: 9 })
                page.moveTo(420, 830)
                page.drawText(currentItem.id_public, { size: 14 })
            }
        }
        print_new_page(0)

        // FUN 1
        _child = this._GET_CHILD_1();
        // FUN 1.1
        if (_child) {
            // FUN 1.1
            if (_child.item_1) {
                if (m_2022) {
                    if (_child.item_1.includes('A')) { page.moveTo(273, 573); page.drawText('X', { size: 12 }) }
                    // if (_child.item_1.includes('B')) { page.moveTo(273, 561); page.drawText('X', { size: 12 }) }
                    if (_child.item_1.includes('C')) { page.moveTo(273, 561); page.drawText('X', { size: 12 }) }
                    if (_child.item_1.includes('D')) { page.moveTo(273, 550); page.drawText('X', { size: 12 }) }
                    if (_child.item_1.includes('E')) { page.moveTo(273, 535); page.drawText('X', { size: 12 }) }
                    if (_child.item_1.includes('F')) { page.moveTo(273, 512); page.drawText('X', { size: 12 }) }
                    if (_child.item_1.includes('G')) { page.moveTo(273, 496); page.drawText('X', { size: 12 }) }
                }
                else {
                    if (_child.item_1.includes('A')) { page.moveTo(221, 700); page.drawText('x', { size: 11 }) }
                    if (_child.item_1.includes('B')) { page.moveTo(221, 690); page.drawText('x', { size: 11 }) }
                    if (_child.item_1.includes('C')) { page.moveTo(221, 679); page.drawText('x', { size: 11 }) }
                    if (_child.item_1.includes('D')) { page.moveTo(221, 668); page.drawText('x', { size: 11 }) }
                    if (_child.item_1.includes('E')) { page.moveTo(221, 652); page.drawText('x', { size: 11 }) }
                    if (_child.item_1.includes('F')) { page.moveTo(221, 624); page.drawText('x', { size: 11 }) }
                    if (_child.item_1.includes('G')) { page.moveTo(221, 601); page.drawText('x', { size: 11 }) }
                }
            }
        }

        // FUN 1.2
        if (_child.item_2) {
            if (m_2022) {
                if (_child.item_2 != 'A' && _child.item_2 != 'B' && _child.item_2 != 'C' && _child.item_2 != 'D') {
                    page.moveTo(342, 507); page.drawText(_child.item_2, { size: 9 })
                    page.moveTo(542, 512); page.drawText('X', { size: 12 })
                }
                else {
                    if (_child.item_2 == 'A') { page.moveTo(542, 573); page.drawText('X', { size: 12 }) }
                    // if (_child.item_2 == 'B') { page.moveTo(542, 690); page.drawText('X', { size: 12 }) }
                    if (_child.item_2 == 'C') { page.moveTo(542, 561); page.drawText('X', { size: 12 }) }
                    if (_child.item_2 == 'D') { page.moveTo(542, 550); page.drawText('X', { size: 12 }) }
                }

            } else {
                if (_child.item_2 != 'A' && _child.item_2 != 'B' && _child.item_2 != 'C' && _child.item_2 != 'D') {
                    page.moveTo(332, 613); page.drawText(_child.item_2, { size: 9 })
                    page.moveTo(524, 618); page.drawText('x', { size: 11 })
                }
                else {
                    if (_child.item_2 == 'A') { page.moveTo(522, 700); page.drawText('x', { size: 11 }) }
                    if (_child.item_2 == 'B') { page.moveTo(522, 690); page.drawText('x', { size: 11 }) }
                    if (_child.item_2 == 'C') { page.moveTo(522, 673); page.drawText('x', { size: 11 }) }
                    if (_child.item_2 == 'D') { page.moveTo(524, 651); page.drawText('x', { size: 11 }) }
                }
            }
        }

        // FUN 1.3
        if (_child.item_3) {
            if (m_2022) {
                if (_child.item_3 == 'A') { page.moveTo(273, 466); page.drawText('X', { size: 12 }) }
                if (_child.item_3 == 'B') { page.moveTo(273, 449); page.drawText('X', { size: 12 }) }
                if (_child.item_3 == 'C') { page.moveTo(273, 438); page.drawText('X', { size: 12 }) }
            } else {
                if (_child.item_3 == 'A') { page.moveTo(222, 562); page.drawText('X', { size: 11 }) }
                if (_child.item_3 == 'B') { page.moveTo(222, 546); page.drawText('X', { size: 11 }) }
                if (_child.item_3 == 'C') { page.moveTo(222, 532); page.drawText('X', { size: 11 }) }
            }

        }

        // FUN 1.4
        if (_child.item_4) {
            if (m_2022) {
                if (_child.item_4 == 'A') { page.moveTo(273, 414); page.drawText('X', { size: 12 }) }
                if (_child.item_4 == 'B') { page.moveTo(273, 403); page.drawText('X', { size: 12 }) }
                if (_child.item_4 == 'C') { page.moveTo(273, 392); page.drawText('X', { size: 12 }) }
            }
            else {
                if (_child.item_4 == 'A') { page.moveTo(222, 504); page.drawText('x', { size: 11 }) }
                if (_child.item_4 == 'B') { page.moveTo(222, 491); page.drawText('x', { size: 11 }) }
                if (_child.item_4 == 'C') { page.moveTo(222, 472); page.drawText('x', { size: 11 }) }
            }

        }

        // FUN 1.5
        if (_child.item_5) {
            if (m_2022) {
                if (_child.item_5.includes('A')) { page.moveTo(408, 466); page.drawText('X', { size: 12 }) }
                if (_child.item_5.includes('B')) { page.moveTo(408, 450); page.drawText('X', { size: 12 }) }
                if (_child.item_5.includes('C')) { page.moveTo(408, 439); page.drawText('X', { size: 12 }) }
                if (_child.item_5.includes('D')) { page.moveTo(408, 426); page.drawText('X', { size: 12 }) }
                if (_child.item_5.includes('E')) { page.moveTo(408, 414); page.drawText('X', { size: 12 }) }
                if (_child.item_5.includes('F')) { page.moveTo(542, 466); page.drawText('X', { size: 12 }) }
                if (_child.item_5.includes('G')) {
                    page.moveTo(542, 439); page.drawText('X', { size: 12 });
                }
                if (_child.item_5.includes('g')) {
                    page.moveTo(542, 426); page.drawText('X', { size: 12 });
                }
                if (_child.item_5.includes('H')) { page.moveTo(542, 414); page.drawText('X', { size: 12 }) }
                if (_child.item_5.includes('I')) { page.moveTo(542, 403); page.drawText('X', { size: 12 }) }
            } else {
                if (_child.item_5.includes('A')) { page.moveTo(400, 555); page.drawText('x', { size: 11 }) }
                if (_child.item_5.includes('B')) { page.moveTo(400, 518); page.drawText('x', { size: 11 }) }
                if (_child.item_5.includes('C')) { page.moveTo(400, 504); page.drawText('x', { size: 11 }) }
                if (_child.item_5.includes('D')) { page.moveTo(400, 490); page.drawText('x', { size: 11 }) }
                if (_child.item_5.includes('E')) { page.moveTo(400, 472); page.drawText('x', { size: 11 }) }
                if (_child.item_5.includes('F')) { page.moveTo(542, 555); page.drawText('x', { size: 11 }) }
                if (_child.item_5.includes('G')) {
                    page.moveTo(542, 518); page.drawText('x', { size: 11 });
                    page.moveTo(542, 532); page.drawText('x', { size: 11 })
                }
                if (_child.item_5.includes('g')) {
                    page.moveTo(542, 504); page.drawText('x', { size: 11 });
                    page.moveTo(542, 532); page.drawText('x', { size: 11 })
                }
                if (_child.item_5.includes('H')) { page.moveTo(542, 490); page.drawText('x', { size: 11 }) }
                if (_child.item_5.includes('I')) { page.moveTo(542, 472); page.drawText('x', { size: 11 }) }
            }
        }

        // FUN 53


        _child = this._GET_CHILD_53();
        if (m_2022) {
            page.moveTo(80, 352); page.drawText(_child.item_5311 + ' ' + _child.item_5312, { size: 9 });
            page.moveTo(370, 352); page.drawText(_child.item_536, { size: 9 });
            page.moveTo(100, 340); page.drawText(_child.item_534, { size: 9 });
            page.moveTo(350, 340); page.drawText(_child.item_535, { size: 9 });
        } else {
            page.moveTo(90, 415); page.drawText(_child.item_5311 + ' ' + _child.item_5312, { size: 9 });
            page.moveTo(400, 415); page.drawText(_child.item_536, { size: 9 });
            page.moveTo(110, 400); page.drawText(_child.item_534, { size: 9 });
            page.moveTo(400, 400); page.drawText(_child.item_535, { size: 9 });
        }


        // FUN C
        _child = this._GET_CHILD_C();
        if (m_2022) {
            page.moveTo(90, 294); page.drawText(_child.item_c1, { size: 9 }); // WORKER NAME
            page.moveTo(90, 278); page.drawText(dateParser(_child.item_c6), { size: 9 }); // DATE OF REVIEW
            page.moveTo(350, 278); page.drawText(currentItem.id_public, { size: 9 }); // ID PUBLIC
        } else {
            page.moveTo(105, 320); page.drawText(_child.item_c1, { size: 9 }); // WORKER NAME
            page.moveTo(105, 296); page.drawText(dateParser(_child.item_c6), { size: 9 }); // DATE OF REVIEW
            page.moveTo(385, 296); page.drawText(currentItem.id_public, { size: 9 }); // ID PUBLIC
        }



        let _condition = _child.item_c3;
        let _actor = _child.item_c8;

        if (m_2022) {
            if (_condition == '1') { page.moveTo(316, 246); page.drawText("x", { size: 16 }); }
            else { page.moveTo(316, 232); page.drawText("x", { size: 16 }); }

            if (_actor.includes('A')) { page.moveTo(175, 216); page.drawText('x', { size: 16 }) }
            if (_actor.includes('B')) { page.moveTo(240, 216); page.drawText('x', { size: 16 }) }
            if (_actor.includes('C')) { page.moveTo(307, 216); page.drawText('x', { size: 16 }) }

            page.moveTo(90, 170); page.drawText(_child.item_c5, { size: 10 }); // NAME
            page.moveTo(150, 160); page.drawText(_child.item_c7, { size: 9 }); // ID NUMBER
            page.moveTo(400, 160); page.drawText(_child.item_c3 == 1 ? dateParser(_child.item_c9) : dateParser(_child.item_c2), { size: 9 }); // DATE

        } else {
            if (_condition == '1') { page.moveTo(430, 238); page.drawText("x", { size: 15 }); }
            else { page.moveTo(430, 215); page.drawText("x", { size: 15 }); }

            if (_actor.includes('A')) { page.moveTo(183, 201); page.drawText('x', { size: 10 }) }
            if (_actor.includes('B')) { page.moveTo(250, 201); page.drawText('x', { size: 10 }) }
            if (_actor.includes('C')) { page.moveTo(320, 201); page.drawText('x', { size: 10 }) }

            page.moveTo(85, 155); page.drawText(_child.item_c5, { size: 10 }); // NAME
            page.moveTo(340, 141); page.drawText(_child.item_c3 == 1 ? dateParser(_child.item_c9) : dateParser(_child.item_c2), { size: 9 }); // DATE
            page.moveTo(172, 141); page.drawText(_child.item_c7, { size: 9 }); // ID NUMBER
        }
        // NEXT PAGE
        page = pdfDoc.getPage(1);

        print_new_page(1)

        // FUN R
        _child = this._GET_CHILD_REVIEW();
        let _code = _child.code;
        let _check = _child.checked;

        if (_code && _check) {
            _code = _code.split(',');
            _check = _check.split(',');

            let print_review = () => {
                let size = 10
                let text = "x"
                if (index > -1) {
                    let _value = _check[index]
                    if (_value == 0) { { page.moveTo(o_no, oy); page.drawText(text, { size: size }) } }
                    if (_value == 1) { { page.moveTo(o_si, oy); page.drawText(text, { size: size }) } }
                    if (_value == 2) { { page.moveTo(o_na, oy); page.drawText(text, { size: size }) } }
                } else page.moveTo(o_na, oy); page.drawText(text, { size: size })
            }

            let index = null;
            // 6.1

            index = _code.indexOf('511');  // 511
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 524; }
            else { o_si = 478; o_no = 520; o_na = 557; oy = 634; }
            print_review()

            index = _code.indexOf('512'); // 512
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 535; }
            else { o_si = 478; o_no = 520; o_na = 557; oy = 621; }
            print_review()

            index = _code.indexOf('516'); // 516
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 502; }
            else { o_si = 478; o_no = 520; o_na = 557; oy = 609; }
            print_review()

            index = _code.indexOf('518'); // 518
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 502; }
            else { o_si = 478; o_no = 520; o_na = 557; oy = 597; print_review(); }

            index = _code.indexOf('513'); // 513
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 513; }
            else { o_si = 478; o_no = 520; o_na = 557; oy = 584; }
            print_review()

            index = _code.indexOf('517'); // 517
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 491; }
            else { o_si = 478; o_no = 520; o_na = 557; oy = 572; }
            print_review()

            index = _code.indexOf('519'); // 519
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 476; }
            else { o_si = 478; o_no = 520; o_na = 557; oy = 561; }
            print_review()

            // 6.2

            // 6.2 A
            index = _code.indexOf('621');
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 423; }
            else { o_si = 474; o_no = 517; o_na = 555; oy = 496; }
            print_review()

            index = _code.indexOf('601a');
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 412; }
            else { o_si = 474; o_no = 517; o_na = 555; oy = 484; }
            print_review()

            index = _code.indexOf('622');
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 401; }
            else { o_si = 474; o_no = 517; o_na = 555; oy = 472; }
            print_review()

            index = _code.indexOf('602a');
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 390; }
            else { o_si = 474; o_no = 517; o_na = 555; oy = 460; }
            print_review()

            // 6.2 B
            index = _code.indexOf('623');
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 360; }
            else { o_si = 474; o_no = 517; o_na = 555; oy = 422; }
            print_review()

            index = _code.indexOf('601b');
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 336; }
            else { o_si = 474; o_no = 517; o_na = 555; oy = 406; }
            print_review()

            index = _code.indexOf('602b');
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 321 }
            else { o_si = 474; o_no = 517; o_na = 555; oy = 394; }
            print_review()

            index = _code.indexOf('624');
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 306 }
            else { o_si = 474; o_no = 517; o_na = 555; oy = 378; }
            print_review()

            index = _code.indexOf('625');
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 291 }
            else { o_si = 474; o_no = 517; o_na = 555; oy = 359; }
            print_review()

            // 6.2 C
            index = _code.indexOf('626');
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 265 }
            else { o_si = 474; o_no = 517; o_na = 555; oy = 315; }
            print_review()

            index = _code.indexOf('627');
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 250 }
            else { o_si = 474; o_no = 517; o_na = 555; oy = 296; }
            print_review()

            index = _code.indexOf('601c');
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 239 }
            else { o_si = 474; o_no = 517; o_na = 555; oy = 280; }
            print_review()

            index = _code.indexOf('602c');
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 228 }
            else { o_si = 474; o_no = 517; o_na = 555; oy = 268; }
            print_review()

            // 6.3
            index = _code.indexOf('630');
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 201 }
            else { o_si = 474; o_no = 517; o_na = 555; oy = 222; }
            print_review()

            index = _code.indexOf('631');
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 190 }
            else { o_si = 474; o_no = 517; o_na = 555; oy = 206; }
            print_review()

            index = _code.indexOf('632');
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 175 }
            else { o_si = 474; o_no = 517; o_na = 555; oy = 190; }
            print_review()

            index = _code.indexOf('633');
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 160 }
            else { o_si = 474; o_no = 517; o_na = 555; oy = 178; }
            print_review()

            index = _code.indexOf('634');
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 129 }
            else { o_si = 474; o_no = 517; o_na = 555; oy = 140; }
            print_review()

            index = _code.indexOf('635');
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 106 }
            else { o_si = 474; o_no = 517; o_na = 555; oy = 120; }
            print_review()

            index = _code.indexOf('636');
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 91 }
            else { o_si = 474; o_no = 517; o_na = 555; oy = 101; }
            print_review()

            // 6.4
            index = _code.indexOf('641');
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 53 }
            else { o_si = 474; o_no = 517; o_na = 555; oy = 44; }
            print_review()

            // NEXT PAGE
            page = pdfDoc.getPage(2);
            ox = 0
            oy = 0

            o_si = 0
            o_no = 0
            o_na = 0

            print_new_page(2)

            index = _code.indexOf('642');
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 544; }
            else { o_si = 485; o_no = 520; o_na = 553; oy = 674; }
            print_review()

            index = _code.indexOf('643');
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 534; }
            else { o_si = 485; o_no = 520; o_na = 553; oy = 661; }
            print_review()

            // 6.5
            index = _code.indexOf('651');
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 509; }
            else { o_si = 489; o_no = 520; o_na = 556; oy = 618; }
            print_review()


            index = _code.indexOf('652');
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 498; }
            else { o_si = 489; o_no = 520; o_na = 556; oy = 602; }
            print_review()

            index = _code.indexOf('653');
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 487; }
            else { o_si = 489; o_no = 520; o_na = 556; oy = 586; }
            print_review()


            // 6.6
            index = _code.indexOf('6601'); // OK
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 455; } // Memoria de cálculos y diseños estructurales
            else { o_si = 485; o_no = 520; o_na = 553; oy = 528; } // Memoria de cálculos y diseños estructurales
            print_review()

            index = _code.indexOf('6602'); // OK
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 433; } // Copia de los estudios geotécnicos y de suelos B
            else { o_si = 485; o_no = 520; o_na = 553; oy = 515; } // Copia de los estudios geotécnicos y de suelos B
            print_review()

            index = _code.indexOf('6603'); // OK
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 411; } // El proyecto arquitectónico D
            else { o_si = 485; o_no = 520; o_na = 553; oy = 504; } // El proyecto arquitectónico  D
            print_review()

            index = _code.indexOf('6604'); // OK
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 444; } // Memoria de diseño de los elementos no estructurales A
            else { o_si = 485; o_no = 520; o_na = 553; oy = 492; } // Memoria de diseño de los elementos no estructurales A
            print_review()

            index = _code.indexOf('6605'); // OK
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 422; } // Planos estructurales del proyecto C
            else { o_si = 485; o_no = 520; o_na = 553; oy = 480; } // Planos estructurales del proyecto C
            print_review()

            index = _code.indexOf('660a'); // OK
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 378; } // Edificaciones que tengan o superen los 2.000 m
            else { o_si = 485; o_no = 520; o_na = 553; oy = 433; } // Edificaciones que tengan o superen los 2.000 m2 de área construida 
            print_review()

            index = _code.indexOf('660b'); // OK
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 367; } //  Edificaciones que en conjunto superen los 2.000 m
            else { o_si = 485; o_no = 520; o_na = 553; oy = 421; } // Edificaciones que en conjunto superen los 2.000 m2 de área construida 
            print_review()

            index = _code.indexOf('660c'); // OK
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 356; } // Edificaciones que deban someterse a supervisión técnica independiente
            else { o_si = 485; o_no = 520; o_na = 553; oy = 408; } // Edificaciones que deban someterse a supervisión técnica independiente 
            print_review()

            index = _code.indexOf('660d'); // OK
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 344; } //  Edificaciones que tengan menos de 2.000 m
            else { o_si = 485; o_no = 520; o_na = 553; oy = 392; } // Edificaciones que tengan menos de 2.000 m 
            print_review()

            index = _code.indexOf('660e'); // OK
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 319; } // Edificaciones que tengan menos de 2.000 m
            else { o_si = 485; o_no = 520; o_na = 553; oy = 373; } // Edificaciones de menos de 2 000 m H
            print_review()

            if (m_2022) {
                index = _code.indexOf('660f');
                { o_si = 474; o_no = 516; o_na = 557; oy = 302; }  // NEW El proyecto constructivo genera 5 o más unidades de vivienda para transferir a terceros.
                print_review()
            }


            index = _code.indexOf('6607'); // OK
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 274; }  // Memoria de los cálculos y planos estructurales
            else { o_si = 485; o_no = 520; o_na = 553; oy = 323; } // Memoria de los cálculos y planos estructurales, firmados por el revisor independiente de los diseños estructurales
            print_review()

            index = _code.indexOf('6608'); // OK
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 254; }  // Memorial firmado por el revisor independiente de los diseños estructurales
            else { o_si = 485; o_no = 520; o_na = 553; oy = 303; } // Memorial firmado por el revisor independiente de los diseños estructurales, en el que certifique el alcance de la revisión
            print_review()

            index = _code.indexOf('6609'); // OK
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 221; }  // Anteproyecto o autorización de intervención aprobada por el Ministerio de Cultura ...
            else { o_si = 485; o_no = 520; o_na = 553; oy = 257; } // Anteproyecto aprobado por el Ministerio de Cultur...
            print_review()

            index = _code.indexOf('6610'); // OK
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 188; }  // Copia del acta del órgano competente de administració
            else { o_si = 485; o_no = 520; o_na = 553; oy = 203; } // Copia del acta del órgano competente de administración de la propiedad horizonta...
            print_review()

            index = _code.indexOf('6611'); // OK
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 155; }   // Concepto técnico expedido por la autoridad municipal o distrital encargada...
            else { o_si = 485; o_no = 520; o_na = 553; oy = 146; } // Concepto técnico expedido por la autoridad municipa...
            print_review()

            index = _code.indexOf('6612'); // OK
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 126; } // Certificación de disponibilidad inmediata de servicios públicos domiciliarios
            else { o_si = 485; o_no = 520; o_na = 553; oy = 108; } // Certificación de disponibilidad inmediata de servicios públicos domiciliarios
            print_review()

            index = _code.indexOf('6613'); // OK
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 111; } // Información que soporte el acceso directo al predio objeto de cesión desde una vía pública...
            else { o_si = 485; o_no = 520; o_na = 553; oy = 92; } // nformación que soporte el acceso directo al predio objeto de cesión desde una vía pública...
            print_review()

            index = _code.indexOf('6614'); // OK
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 82; } // Licencias anteriores o el instrumento que haga sus veces 
            else { o_si = 485; o_no = 520; o_na = 553; oy = 51; } // Licencias anteriores o el instrumento que haga sus veces con los respectivos planos
            print_review()


            // NEXT PAGE
            page = pdfDoc.getPage(3);
            ox = 0
            oy = 0

            o_si = 0
            o_no = 0
            o_na = 0
            print_new_page(3)

            // 6.7
            index = _code.indexOf('671');  // Descripción general del proyecto
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 528; }
            else { o_si = 485; o_no = 520; o_na = 553; oy = 654; }
            print_review()

            index = _code.indexOf('672');  // Copia de los planos de diseño del proyectO
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 517; }
            else { o_si = 485; o_no = 520; o_na = 553; oy = 643; }
            print_review()

            // 6.8
            index = _code.indexOf('680');  // Copia del plano correspondiente
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 473; }
            else { o_si = 485; o_no = 520; o_na = 553; oy = 580; }
            print_review()

            index = _code.indexOf('681');  // Planos de alinderamiento
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 450; }
            else { o_si = 485; o_no = 520; o_na = 553; oy = 545; }
            print_review()

            index = _code.indexOf('682');  // Presentación de solicitud ante autoridad distinta a la que otorgó la licencia...
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 434; }
            else { o_si = 485; o_no = 520; o_na = 553; oy = 530; }
            print_review()

            index = _code.indexOf('683');  // Para licencias urbanísticas que hayan perdido su vigencia...
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 415; }
            else { o_si = 485; o_no = 520; o_na = 553; oy = 510; }
            print_review()

            index = _code.indexOf('684');  // Cuadro de áreas o proyecto de división
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 400; }
            else { o_si = 485; o_no = 520; o_na = 553; oy = 495; }
            print_review()

            index = _code.indexOf('685');  // Bienes de interés cultural: Anteproyecto o autorización de intervención aprobada
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 389; }
            else { o_si = 485; o_no = 520; o_na = 553; oy = 482; }
            print_review()

            index = _code.indexOf('6861');  // Estudios de suelos y geotécnicos
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 365; }
            else { o_si = 485; o_no = 520; o_na = 553; oy = 448; }
            print_review()

            index = _code.indexOf('687');  // Planos de diseño y arquitectónicos (NSR-10)
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 341; }
            else { o_si = 485; o_no = 520; o_na = 553; oy = 415; }
            print_review()

            index = _code.indexOf('6862');  // Estudios geotécnicos y de suelos
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 330; }
            else { o_si = 485; o_no = 520; o_na = 553; oy = 403; }
            print_review()

            index = _code.indexOf('6862');  // Estudios geotécnicos y de suelos
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 330; }
            else { o_si = 485; o_no = 520; o_na = 553; oy = 403; }
            print_review()

            index = _code.indexOf('688');  // Copia de la licencia de urbanización, sus modificaciones, prórroga y/o revalidación...
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 302; }
            else { o_si = 485; o_no = 520; o_na = 553; oy = 365; }
            print_review()

            index = _code.indexOf('689');  // Planos que contengan la nueva propuesta urbanística objeto de aprobación
            if (m_2022) { o_si = 474; o_no = 516; o_na = 557; oy = 287; }
            else { o_si = 485; o_no = 520; o_na = 553; oy = 350; }
            print_review()

            if (m_2022) {
                index = _code.indexOf('6891');  // NEW Dirección oficial del predio o su ubicación si se encuentra en suelo rural
                { o_si = 474; o_no = 516; o_na = 557; oy = 263; }
                print_review()

                index = _code.indexOf('6892');   // NEW Antecedentes urbanísticos como licencias y demás, en caso de existir
                { o_si = 474; o_no = 516; o_na = 557; oy = 252; }
                print_review()

                index = _code.indexOf('6893');  // NEW Plano record de identificación de zonas de uso público elaborado por el Ministerio de Vivienda, Ciudad y Territorio
                { o_si = 474; o_no = 516; o_na = 557; oy = 227; }
                print_review()
            }
        }

        _child = this._GET_CHILD_C();
        if (m_2022) {
            page.moveTo(50, 83); page.drawText(_child.item_c1, { size: 14 }); // WORKER NAME
            page.moveTo(430, 83); page.drawText(dateParser(_child.item_c6), { size: 12 }); // DATE OF REVIEW
        }
        else {
            page.moveTo(46 + ox, 120 + oy); page.drawText(_child.item_c1, { size: 14 }); // WORKER NAME
            page.moveTo(410 + ox, 120 + oy); page.drawText(dateParser(_child.item_c6), { size: 12 }); // DATE OF REVIEW
        }
        let _details = _child.item_c4;

        let formatString = _details.split('\n');
        if (_details.length > 0) {
            for (let i = 0; i < formatString.length; i++) {
                formatString[i] = formatString[i].replace(/^/, ``);
            }
        }
        formatString = formatString.join('\n');
        const _detailsWrapped = (s) => s.replace(
            /(?![^\n]{1,165}$)([^\n]{1,165})\s/g, '$1\n'
        );
        if (_detailsWrapped(formatString)) {
            let _detailsArray = _detailsWrapped(formatString).split("\n");

            if (m_2022) _detailsArray.map((value, i) => { page.moveTo(46, 195 - i * 11.35); page.drawText(`${value}`, { size: 7 }); })
            else _detailsArray.map((value, i) => { page.moveTo(46, 301 - i * 15.25); page.drawText(`${value}`, { size: 7 }); })
        }



        pdfDoc.setAuthor("CURADURIA URBANA 1 DE BUCARAMANGA");
        pdfDoc.setCreationDate(moment().toDate());
        pdfDoc.setCreator('NESTOR TRIANA - MORE INFO AT: http://devnatriana.com/ ');
        pdfDoc.setKeywords(['formulario', 'unico', 'nacional', 'curaduria', 'planeacion', 'construccion', 'obra', 'proyecto']);
        pdfDoc.setLanguage('es-co');
        pdfDoc.setProducer('NESTOR TRIANA - MORE INFO AT: http://devnatriana.com/ ');
        pdfDoc.setTitle('FORMULARIO UNICO NACIONAL LISTA DE REVISION - ' + currentItem.id_public)

        var pdfBytes = await pdfDoc.save();
        var fileDownload = require('js-file-download');
        fileDownload(pdfBytes, 'FORMULARIO DE REVISION GENERAL' + currentItem.id_public + '.pdf');
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
        return (
            <div className="py-3">
                <div className="row mb-3">
                    <div className="col-6">
                        <label>Autoridad Competente</label>
                        <div class="input-group my-1">
                            <select class="form-select me-1" id={"func_pdf_0_1"}>
                                {domains_number}
                            </select>
                        </div>
                    </div>
                    <div className="col-4">
                        <label>Ciudad</label>
                        <div class="input-group my-1">
                            <select class="form-select me-1" id={"func_pdf_0_2"}>
                                {cities}
                            </select>
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


export default FUN_PDF_CHECK;