import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import { PDFDocument, StandardFonts } from 'pdf-lib';
import { dateParser } from '../../../../components/customClasses/typeParse';
import moment from 'moment';
import { cities, domains, domains_number } from '../../../../components/jsons/vars';

const MySwal = withReactContent(Swal);
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
        var formUrl = process.env.REACT_APP_API_URL + "/pdf/funcheckflat";
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
        let _number = document.getElementById('func_pdf_0_1').value;
        page.moveTo(215, 783)
        page.drawText(_number, { size: 14 })
        page.moveTo(100, 770)
        page.drawText(_city, { size: 9 })
        page.moveTo(420, 830)
        page.drawText(currentItem.id_public, { size: 14 })

        // FUN 1
        _child = this._GET_CHILD_1();
        // FUN 1.1
        if (_child) {
            // FUN 1.1
            if (_child.item_1) {
                if (_child.item_1.includes('A')) { page.moveTo(221, 700); page.drawText('x', { size: 11 }) }
                if (_child.item_1.includes('B')) { page.moveTo(221, 690); page.drawText('x', { size: 11 }) }
                if (_child.item_1.includes('C')) { page.moveTo(221, 679); page.drawText('x', { size: 11 }) }
                if (_child.item_1.includes('D')) { page.moveTo(221, 668); page.drawText('x', { size: 11 }) }
                if (_child.item_1.includes('E')) { page.moveTo(221, 652); page.drawText('x', { size: 11 }) }
                if (_child.item_1.includes('F')) { page.moveTo(221, 624); page.drawText('x', { size: 11 }) }
                if (_child.item_1.includes('G')) { page.moveTo(221, 601); page.drawText('x', { size: 11 }) }
            }
        }
        // FUN 1.2
        if (_child.item_2) {
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
        // FUN 1.3
        if (_child.item_3) {
            if (_child.item_3 == 'A') { page.moveTo(222, 562); page.drawText('x', { size: 11 }) }
            if (_child.item_3 == 'B') { page.moveTo(222, 546); page.drawText('x', { size: 11 }) }
            if (_child.item_3 == 'C') { page.moveTo(222, 532); page.drawText('x', { size: 11 }) }
        }
        // FUN 1.4
        if (_child.item_4) {
            if (_child.item_4 == 'A') { page.moveTo(222, 504); page.drawText('x', { size: 11 }) }
            if (_child.item_4 == 'B') { page.moveTo(222, 491); page.drawText('x', { size: 11 }) }
            if (_child.item_4 == 'C') { page.moveTo(222, 472); page.drawText('x', { size: 11 }) }
        }
        // FUN 1.5
        if (_child.item_5) {
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

        // FUN 53
        _child = this._GET_CHILD_53();
        page.moveTo(90, 415); page.drawText(_child.item_5311 + ' ' + _child.item_5312, { size: 9 });
        page.moveTo(400, 415); page.drawText(_child.item_536, { size: 9 });
        page.moveTo(110, 400); page.drawText(_child.item_534, { size: 9 });
        page.moveTo(400, 400); page.drawText(_child.item_535, { size: 9 });

        // FUN C
        _child = this._GET_CHILD_C();
        page.moveTo(105, 320); page.drawText(_child.item_c1, { size: 9 }); // WORKER NAME
        page.moveTo(105, 296); page.drawText(dateParser(_child.item_c6), { size: 9 }); // DATE OF REVIEW
        page.moveTo(385, 296); page.drawText(currentItem.id_public, { size: 9 }); // ID PUBLIC

        let _condition = _child.item_c3;
        if (_condition == '1') { page.moveTo(430, 238); page.drawText("x", { size: 15 }); }
        else { page.moveTo(430, 215); page.drawText("x", { size: 15 }); }

        let _actor = _child.item_c8;
        if (_actor.includes('A')) { page.moveTo(183, 201); page.drawText('x', { size: 10 }) }
        if (_actor.includes('B')) { page.moveTo(250, 201); page.drawText('x', { size: 10 }) }
        if (_actor.includes('C')) { page.moveTo(320, 201); page.drawText('x', { size: 10 }) }

        page.moveTo(85, 155); page.drawText(_child.item_c5, { size: 10 }); // NAME
        page.moveTo(340, 141); page.drawText(_child.item_c3 == 1 ? dateParser(_child.item_c9) : dateParser(_child.item_c2), { size: 9 }); // DATE
        page.moveTo(172, 141); page.drawText(_child.item_c7, { size: 9 }); // ID NUMBER

        // NEXT PAGE
        page = pdfDoc.getPage(1);

        page.moveTo(215, 783)
        page.drawText(_number, { size: 14 })
        page.moveTo(100, 770)
        page.drawText(_city, { size: 9 })
        page.moveTo(420, 830)
        page.drawText(currentItem.id_public, { size: 14 })

        // FUN R
        _child = this._GET_CHILD_REVIEW();
        let _code = _child.code;
        let _check = _child.checked;


        if (_code && _check) {
            _code = _code.split(',');
            _check = _check.split(',');
            let index = null;
            // 6.1
            index = _code.indexOf('511');  // 511
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(520, 634); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(478, 634); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(557, 634); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(557, 634); page.drawText('x', { size: 10 })


            index = _code.indexOf('512'); // 512
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(520, 621); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(478, 621); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(557, 621); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(557, 621); page.drawText('x', { size: 10 })

            index = _code.indexOf('516'); // 516
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(520, 609); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(478, 609); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(557, 609); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(557, 609); page.drawText('x', { size: 10 })

            index = _code.indexOf('518'); // 518
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(520, 597); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(478, 597); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(557, 597); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(557, 597); page.drawText('x', { size: 10 })

            index = _code.indexOf('513'); // 513
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(520, 584); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(478, 584); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(557, 584); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(557, 584); page.drawText('x', { size: 10 })

            index = _code.indexOf('517'); // 517
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(520, 572); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(478, 572); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(557, 572); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(557, 572); page.drawText('x', { size: 10 })

            index = _code.indexOf('519'); // 519
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(520, 561); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(478, 561); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(557, 561); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(557, 561); page.drawText('x', { size: 10 })


            // 6.2
            index = _code.indexOf('621');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(517, 496); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(474, 496); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(555, 496); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(555, 496); page.drawText('x', { size: 10 })

            index = _code.indexOf('601a');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(517, 484); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(474, 484); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(555, 484); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(555, 484); page.drawText('x', { size: 10 })

            index = _code.indexOf('622');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(517, 472); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(474, 472); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(555, 472); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(555, 472); page.drawText('x', { size: 10 })

            index = _code.indexOf('602a');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(517, 460); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(474, 460); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(555, 460); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(555, 460); page.drawText('x', { size: 10 })

            index = _code.indexOf('623');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(517, 422); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(474, 422); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(555, 422); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(555, 422); page.drawText('x', { size: 10 })

            index = _code.indexOf('601b');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(517, 406); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(474, 406); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(555, 406); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(555, 406); page.drawText('x', { size: 10 })

            index = _code.indexOf('602b');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(517, 394); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(474, 394); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(555, 394); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(555, 394); page.drawText('x', { size: 10 })

            index = _code.indexOf('624');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(517, 378); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(474, 378); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(555, 378); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(555, 378); page.drawText('x', { size: 10 })

            index = _code.indexOf('625');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(517, 359); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(474, 359); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(555, 359); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(555, 359); page.drawText('x', { size: 10 })

            index = _code.indexOf('626');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(517, 315); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(474, 315); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(555, 315); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(555, 315); page.drawText('x', { size: 10 })

            index = _code.indexOf('627');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(517, 296); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(474, 296); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(555, 296); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(555, 296); page.drawText('x', { size: 10 })

            index = _code.indexOf('601c');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(517, 280); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(474, 280); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(555, 280); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(555, 280); page.drawText('x', { size: 10 })

            index = _code.indexOf('602c');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(517, 268); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(474, 268); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(555, 268); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(555, 268); page.drawText('x', { size: 10 })

            // 6.3
            index = _code.indexOf('630');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(517, 222); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(474, 222); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(555, 222); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(555, 222); page.drawText('x', { size: 10 })

            index = _code.indexOf('631');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(517, 206); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(474, 206); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(555, 206); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(555, 206); page.drawText('x', { size: 10 })

            index = _code.indexOf('632');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(517, 190); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(474, 190); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(555, 190); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(555, 190); page.drawText('x', { size: 10 })

            index = _code.indexOf('633');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(517, 178); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(474, 178); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(555, 178); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(555, 178); page.drawText('x', { size: 10 })

            index = _code.indexOf('634');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(517, 140); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(474, 140); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(555, 140); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(555, 140); page.drawText('x', { size: 10 })

            index = _code.indexOf('635');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(517, 120); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(474, 120); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(555, 120); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(555, 120); page.drawText('x', { size: 10 })

            index = _code.indexOf('636');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(517, 101); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(474, 101); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(555, 101); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(555, 101); page.drawText('x', { size: 10 })

            // 6.4
            index = _code.indexOf('641');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(517, 44); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(474, 44); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(555, 44); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(555, 44); page.drawText('x', { size: 10 })


            // NEXT PAGE
            page = pdfDoc.getPage(2);

            page.moveTo(215, 783)
            page.drawText(_number, { size: 14 })
            page.moveTo(100, 770)
            page.drawText(_city, { size: 9 })
            page.moveTo(420, 830)
            page.drawText(currentItem.id_public, { size: 14 })

            index = _code.indexOf('642');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(520, 674); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(485, 674); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(553, 674); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(553, 674); page.drawText('x', { size: 10 })

            index = _code.indexOf('643');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(520, 661); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(485, 661); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(553, 661); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(553, 661); page.drawText('x', { size: 10 })

            // 6.5
            index = _code.indexOf('651');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(520, 618); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(489, 618); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(556, 618); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(556, 618); page.drawText('x', { size: 10 })

            index = _code.indexOf('652');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(520, 602); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(489, 602); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(556, 602); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(556, 602); page.drawText('x', { size: 10 })

            index = _code.indexOf('653');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(520, 586); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(489, 586); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(556, 586); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(556, 586); page.drawText('x', { size: 10 })

            // 6.6
            index = _code.indexOf('6601');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(520, 528); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(485, 528); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(553, 528); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(553, 528); page.drawText('x', { size: 10 })

            index = _code.indexOf('6602');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(520, 515); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(485, 515); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(553, 515); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(553, 515); page.drawText('x', { size: 10 })

            index = _code.indexOf('6603');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(520, 504); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(485, 504); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(553, 504); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(553, 504); page.drawText('x', { size: 10 })

            index = _code.indexOf('6604');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(520, 492); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(485, 492); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(553, 492); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(553, 492); page.drawText('x', { size: 10 })

            index = _code.indexOf('6605');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(520, 480); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(485, 480); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(553, 480); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(553, 480); page.drawText('x', { size: 10 })

            index = _code.indexOf('660a');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(520, 433); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(485, 433); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(553, 433); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(553, 433); page.drawText('x', { size: 10 })

            index = _code.indexOf('660b');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(520, 421); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(485, 421); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(553, 421); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(553, 421); page.drawText('x', { size: 10 })

            index = _code.indexOf('660c');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(520, 408); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(485, 408); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(553, 408); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(553, 408); page.drawText('x', { size: 10 })

            index = _code.indexOf('660d');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(520, 392); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(485, 392); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(553, 392); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(553, 392); page.drawText('x', { size: 10 })

            index = _code.indexOf('660e');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(520, 373); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(485, 373); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(553, 373); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(553, 373); page.drawText('x', { size: 10 })

            index = _code.indexOf('6607');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(520, 323); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(485, 323); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(553, 323); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(553, 323); page.drawText('x', { size: 10 })

            index = _code.indexOf('6608');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(520, 303); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(485, 303); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(553, 303); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(553, 303); page.drawText('x', { size: 10 })

            index = _code.indexOf('6609');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(520, 257); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(485, 257); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(553, 257); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(553, 257); page.drawText('x', { size: 10 })

            index = _code.indexOf('6610');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(520, 203); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(485, 203); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(553, 203); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(553, 203); page.drawText('x', { size: 10 })

            index = _code.indexOf('6611');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(520, 146); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(485, 146); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(553, 146); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(553, 146); page.drawText('x', { size: 10 })

            index = _code.indexOf('6612');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(520, 108); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(485, 108); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(553, 108); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(553, 108); page.drawText('x', { size: 10 })

            index = _code.indexOf('6613');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(520, 92); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(485, 92); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(553, 92); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(553, 92); page.drawText('x', { size: 10 })

            index = _code.indexOf('6614');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(520, 51); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(485, 51); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(553, 51); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(553, 51); page.drawText('x', { size: 10 })


            // NEXT PAGE
            page = pdfDoc.getPage(3);

            page.moveTo(215, 783)
            page.drawText(_number, { size: 14 })
            page.moveTo(100, 770)
            page.drawText(_city, { size: 9 })
            page.moveTo(420, 830)
            page.drawText(currentItem.id_public, { size: 14 })

            // 6.7
            index = _code.indexOf('671');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(520, 654); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(485, 654); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(553, 654); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(553, 654); page.drawText('x', { size: 10 })

            index = _code.indexOf('672');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(520, 643); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(485, 643); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(553, 643); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(553, 643); page.drawText('x', { size: 10 })

            // 6.8
            index = _code.indexOf('680');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(520, 580); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(485, 580); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(553, 580); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(553, 580); page.drawText('x', { size: 10 })

            index = _code.indexOf('681');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(520, 545); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(485, 545); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(553, 545); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(553, 545); page.drawText('x', { size: 10 })

            index = _code.indexOf('682');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(520, 530); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(485, 530); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(553, 530); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(553, 530); page.drawText('x', { size: 10 })

            index = _code.indexOf('683');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(520, 510); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(485, 510); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(553, 510); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(553, 510); page.drawText('x', { size: 10 })

            index = _code.indexOf('684');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(520, 495); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(485, 495); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(553, 495); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(553, 495); page.drawText('x', { size: 10 })

            index = _code.indexOf('685');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(520, 482); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(485, 482); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(553, 482); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(553, 482); page.drawText('x', { size: 10 })

            index = _code.indexOf('6861');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(520, 448); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(485, 448); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(553, 448); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(553, 448); page.drawText('x', { size: 10 })

            index = _code.indexOf('687');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(520, 415); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(485, 415); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(553, 415); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(553, 415); page.drawText('x', { size: 10 })

            index = _code.indexOf('6862');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(520, 403); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(485, 403); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(553, 403); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(553, 403); page.drawText('x', { size: 10 })

            index = _code.indexOf('688');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(520, 365); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(485, 365); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(553, 365); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(553, 365); page.drawText('x', { size: 10 })

            index = _code.indexOf('689');
            if (index > -1) {
                let _value = _check[index]
                if (_value == 0) { { page.moveTo(520, 350); page.drawText('x', { size: 10 }) } }
                if (_value == 1) { { page.moveTo(485, 350); page.drawText('x', { size: 10 }) } }
                if (_value == 2) { { page.moveTo(553, 350); page.drawText('x', { size: 10 }) } }
            } else page.moveTo(553, 350); page.drawText('x', { size: 10 })
        }

        _child = this._GET_CHILD_C();
        page.moveTo(46, 120); page.drawText(_child.item_c1, { size: 14 }); // WORKER NAME
        page.moveTo(410, 120); page.drawText(dateParser(_child.item_c6), { size: 12 }); // DATE OF REVIEW
        let _details = _child.item_c4;
        
        let formatString = _details.split('\n');
        if(_details.length > 0){
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
            _detailsArray.map((value, i) => { page.moveTo(46, 301 - i * 15.25); page.drawText(`${value}`, { size: 7 }); })
        }

       
/*        let _detailsWrapped = this.WordWrap(_details, 105);
        if (_detailsWrapped) {
            let _detailsArray = _detailsWrapped.split("\n");
            if (_detailsArray[0]) { page.moveTo(46, 301); page.drawText(_detailsArray[0], { size: 8 }); }
            if (_detailsArray[1]) { page.moveTo(46, 285); page.drawText(_detailsArray[1], { size: 8 }); }
            if (_detailsArray[2]) { page.moveTo(46, 270); page.drawText(_detailsArray[2], { size: 8 }); }
            if (_detailsArray[3]) { page.moveTo(46, 256); page.drawText(_detailsArray[3], { size: 8 }); }
            if (_detailsArray[4]) { page.moveTo(46, 242); page.drawText(_detailsArray[4], { size: 8 }); }
            if (_detailsArray[5]) { page.moveTo(46, 227); page.drawText(_detailsArray[5], { size: 8 }); }
            if (_detailsArray[6]) { page.moveTo(46, 212); page.drawText(_detailsArray[6], { size: 8 }); }
            if (_detailsArray[7]) { page.moveTo(46, 199); page.drawText(_detailsArray[7], { size: 8 }); }
        }
        */

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