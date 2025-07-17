import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import RECORD_ENG_SERVICE from '../../../../services/record_eng.service'

const MySwal = withReactContent(Swal);

class RECORD_ENG_STEP_433 extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, version } = this.props;
        const { } = this.state;
        const SUBCATEGORIES = currentRecord.subcategory ? currentRecord.subcategory.split(';') : [];

        // FUNCTIONS & VARIABLES
        // DATA GETTERS
        let _GET_CHILD_SISMIC = () => {
            var _CHILD = currentRecord.record_eng_sismics;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }

        let _GET_PESOPLAC_VALUE = (row) => {
            if (!row.area || !row.name) return '';
            let area = row.area;
            let denplac = row.denplac;
            return Number(area * denplac).toFixed(2);
        }
        let _get_COLPAN_VALUE = (row) => {
            let wc = _GET_STEP_TYPE_INDEX('sis_wc', 'value', 0) ?? 24;
            let column;
            column = JSON.parse(row.column);
            column = JSON.parse(column);
            if (!column) column = { n: 9, c1: 0.3, c2: 0.3 }
            return Number(row.height * column.c1 * column.c2 * column.n * wc).toFixed(2);
        }
        let _get_VIGA = (height) => {
            let wc = _GET_STEP_TYPE_INDEX('sis_wc', 'value', 0) ?? 24;
            return Number(height * 0.3 * 0.3 * 9 * wc * 0.85).toFixed(2);
        }


        let _get_TOT = (row) => {
            let pesoplac = _GET_PESOPLAC_VALUE(row);
            let colpan = _get_COLPAN_VALUE(row)
            let viga = _get_VIGA(row.height)
            let esca = row.esca;
            let sum = Number(pesoplac) + Number(colpan) + Number(viga) + Number(esca);
            return (sum).toFixed(2)
        }

        let LOAD_STEP = (_id_public) => {
            var _CHILD = currentRecord.record_eng_steps;
            for (var i = 0; i < _CHILD.length; i++) {
                if (_CHILD[i].version == currentVersionR && _CHILD[i].id_public == _id_public) return _CHILD[i]
            }
            return []
        }

        let _GET_TOTAL = () => {
            var _LIST = _GET_CHILD_SISMIC();
            // let d237 = _GET_STEP_TYPE_INDEX('sis_wc', 'value', 0) || 24;
            // let d236 = _GET_STEP_TYPE_INDEX('s4238', 'value', 3) || 1;

            var _TOTALES = {
                height: 0,
                pesoplac: 0,
                colpan: 0,
                viga: 0,
                esca: 0,
                wihik: 0,
                cvi: 0,
                f_x: 0,
                f_y: 0,
                tot: 0,
            }
            for (var i = 0; i < _LIST.length; i++) {
                let condition = _LIST[i].pos == 1
                if (condition) continue;
                let floor = _LIST[i].name ? _LIST[i].name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : '';
                let con_down = (floor).includes('sotano') || (floor).includes('semisotano');
                _TOTALES.height += Math.abs(Number(con_down ? 0 : _LIST[i].height));
                // _TOTALES.pesoplac += Number(this._GET_PESOPLAC_VALUE(_LIST[i]));
                // _TOTALES.colpan += Number(this._get_COLPAN_VALUE(_LIST[i]));
                // _TOTALES.viga += Number(this._get_VIGA(Math.abs(_LIST[i].height)));
                // _TOTALES.esca += Number(_LIST[i].esca);
                // _TOTALES.wihik += Number(this._get_WIHIK(_LIST[i]));
                _TOTALES.tot += Number(_get_TOT(_LIST[i]));
            }

            // THIS IS DONE IN ORDER TO PREVENT RECURSION
            /*
            for (var i = 0; i < _LIST.length; i++) {
                let condition = _LIST[i].pos == 1;
                if (condition) continue;
                let d231 = this._GET_STEP_TYPE_INDEX('s4237', 'value', 20) || 1
    
                let cvi = Number(this._get_WIHIK(_LIST[i])) / Number(_TOTALES.wihik);
                _TOTALES.cvi += cvi
                _TOTALES.f_x += cvi * Number(this.get_d236());
                _TOTALES.f_y += cvi * Number(this.get_d236()) * 0.3;
            }
                */


            return _TOTALES;
        }

        // DATA CONVERTERS
        let _GET_SELECT_COLOR_VALUE = (_VALUE) => {
            if (!_VALUE) {
                return 'form-select text-danger form-control form-control-sm';
            }
            if (_VALUE == '0') {
                return 'form-select text-danger form-control form-control-sm';
            }
            if (_VALUE == '1') {
                return 'form-select text-success form-control form-control-sm';
            }
            if (_VALUE == '2') {
                return 'form-select text-warning form-control form-control-sm';
            } else {
                return 'form-select form-control form-control-sm';
            }
        }
        let _GET_STEP_TYPE_INDEX = (_id_public, _type, _index) => {
            var STEP = LOAD_STEP(_id_public);
            if (!STEP.id) return null;
            var value = STEP[_type]
            if (!value) return null
            value = value.split(';');
            return value[_index]
        }

        const OPS_VARILLAS_SELECT = ["N3", "N4", "N5", "N6", "N7", "N8"]
        const OPS_ESTRIBOS_SELECT = ["N3", "N4"]
        const OPS_VARILLAS = {
            N3: { d: 9.5, a: 71 },
            N4: { d: 12.7, a: 129 },
            N5: { d: 15.9, a: 199 },
            N6: { d: 19.1, a: 284 },
            N7: { d: 22.2, a: 387 },
            N8: { d: 25.4, a: 510 },
        }
        let OPS_VARILLAS_KEY = {
            "9.5": "71",
            "12.7": "129",
            "15.9": "199",
            "19.1": "284",
            "22.2": "387",
            "25.4": "510",
        }

        let get_G450 = () => {
            // 0,3*G446
            let G446 = Number(_GET_STEP_TYPE_INDEX('estructural_p1', 'value', 1) || document.getElementById("estructural_p1_1")?.value || 0);
            return Number(0.3 * G446).toFixed(4)
        }
        let get_G451 = () => 2.5
        let get_G453 = () => {
            // G459+G459
            let G459 = Number(_GET_STEP_TYPE_INDEX('estructural_p1', 'value', 11) || document.getElementById("estructural_p1_11")?.value || 0);
            return Number(G459 + G459).toFixed(4)
        }
        let get_G454 = () => {
            // G458+G458
            let G458 = Number(_GET_STEP_TYPE_INDEX('estructural_p1', 'value', 10) || document.getElementById("estructural_p1_10")?.value || 0);
            return Number(G458 + G458).toFixed(4)
        }
        let get_G455 = () => {
            // G458+0,75*G459
            let G458 = Number(_GET_STEP_TYPE_INDEX('estructural_p1', 'value', 10) || document.getElementById("estructural_p1_10")?.value || 0);
            let G459 = Number(_GET_STEP_TYPE_INDEX('estructural_p1', 'value', 11) || document.getElementById("estructural_p1_11")?.value || 0);
            return Number(G458 + 0.75 * G459).toFixed(4)
        }
        let get_G456 = () => {
            // G459+0,75*G458
            let G458 = Number(_GET_STEP_TYPE_INDEX('estructural_p1', 'value', 10) || document.getElementById("estructural_p1_10")?.value || 0);
            let G459 = Number(_GET_STEP_TYPE_INDEX('estructural_p1', 'value', 11) || document.getElementById("estructural_p1_11")?.value || 0);
            return Number(G459 + 0.75 * G458).toFixed(4)
        }
        let get_G467 = () => {
            // G463*
            // VLOOKUP(G462;$DATOS.$F$3:$G$8;2;FALSE())
            // +G465
            // *VLOOKUP(G464;$DATOS.$F$3:$G$8;2;FALSE())
            let G462 = Number(_GET_STEP_TYPE_INDEX('estructural_p1', 'value', 12) || document.getElementById("estructural_p1_12")?.value || 0);
            let G463 = Number(_GET_STEP_TYPE_INDEX('estructural_p1', 'value', 13) || document.getElementById("estructural_p1_13")?.value || 0);
            let G464 = Number(_GET_STEP_TYPE_INDEX('estructural_p1', 'value', 14) || document.getElementById("estructural_p1_14")?.value || 0);
            let G465 = Number(_GET_STEP_TYPE_INDEX('estructural_p1', 'value', 15) || document.getElementById("estructural_p1_15")?.value || 0);


            return Number(G463 * (OPS_VARILLAS_KEY[G462] || 0) + G465 * (OPS_VARILLAS_KEY[G464] || 0)).toFixed(4)
        }
        let get_H462 = () => {
            // G459+0,75*G458
            let F462 = _GET_STEP_TYPE_INDEX('estructural_p1', 'value', 29) || document.getElementById("estructural_p1_29")?.value || "N3";
            return OPS_VARILLAS[F462].a
        }
        let get_H464 = () => {
            // G459+0,75*G458
            let F464 = _GET_STEP_TYPE_INDEX('estructural_p1', 'value', 31) || document.getElementById("estructural_p1_31")?.value || "N3";
            return OPS_VARILLAS[F464].a
        }
        let get_G462 = () => {
            // VLOOKUP(F462;$DATOS.E3:G8;2;FALSE())
            let F462 = _GET_STEP_TYPE_INDEX('estructural_p1', 'value', 29) || document.getElementById("estructural_p1_29")?.value || "N3";
            return OPS_VARILLAS[F462].d
        }
        let get_G464 = () => {
            // VLOOKUP(F462;$DATOS.E3:G8;2;FALSE())
            let F464 = _GET_STEP_TYPE_INDEX('estructural_p1', 'value', 31) || document.getElementById("estructural_p1_31")?.value || "N3";
            return OPS_VARILLAS[F464].d
        }
        let get_G468 = () => {
            // G446
            // -G447
            // -$DATOS.F3/1000
            // -(G462*G463*H462+G464*G465*H464)
            // /(G463*H462+G465*H464)
            // /2000

            let G446 = Number(_GET_STEP_TYPE_INDEX('estructural_p1', 'value', 1) || document.getElementById("estructural_p1_1")?.value || 0);
            let G447 = Number(_GET_STEP_TYPE_INDEX('estructural_p1', 'value', 2) || document.getElementById("estructural_p1_2")?.value || 0);
            let G462 = Number(_GET_STEP_TYPE_INDEX('estructural_p1', 'value', 12) || document.getElementById("estructural_p1_12")?.value || 0);
            let G463 = Number(_GET_STEP_TYPE_INDEX('estructural_p1', 'value', 13) || document.getElementById("estructural_p1_13")?.value || 0);
            let H462 = Number(_GET_STEP_TYPE_INDEX('estructural_p1', 'value', 30) || document.getElementById("estructural_p1_30")?.value || 0);
            let G464 = Number(_GET_STEP_TYPE_INDEX('estructural_p1', 'value', 14) || document.getElementById("estructural_p1_14")?.value || 0);
            let G465 = Number(_GET_STEP_TYPE_INDEX('estructural_p1', 'value', 15) || document.getElementById("estructural_p1_15")?.value || 0);
            let H464 = Number(_GET_STEP_TYPE_INDEX('estructural_p1', 'value', 32) || document.getElementById("estructural_p1_32")?.value || 0);

            return Number(G446 - G447 - 9.5 / 1000 - (G462 * G463 * H462 + G464 * G465 * H464) / (G463 * H462 + G465 * H464) / 2000).toFixed(4)
        }

        let get_G470 = () => {
            // IF( 0,25*SQRT(L51)/F55
            // >1,4/F55
            // ;0,25*SQRT(L51)/F55;
            // 1,4/F55)
            let L51 = Number(_GET_STEP_TYPE_INDEX('s423m', 'value', 1) || 21)
            let F55 = Number(_GET_STEP_TYPE_INDEX('s423m', 'value', 4) || 420)
            if (0.25 * Math.sqrt(L51) / F55 > 1.4 / F55) return Number(0.25 * Math.sqrt(L51) / F55).toFixed(4)
            else return Number(1.4 / F55).toFixed(4)
        }
        let get_G471 = () => {
            // G467/(G468*1000*G448*1000)
            let G467 = Number(_GET_STEP_TYPE_INDEX('estructural_p1', 'value', 16) || document.getElementById("estructural_p1_16")?.value || 0);
            let G468 = Number(_GET_STEP_TYPE_INDEX('estructural_p1', 'value', 17) || document.getElementById("estructural_p1_17")?.value || 0);
            let G448 = Number(_GET_STEP_TYPE_INDEX('estructural_p1', 'value', 3) || document.getElementById("estructural_p1_3")?.value || 0);

            return Number(G467 / (G468 * 1000 * G448 * 1000)).toFixed(4)
        }
        let get_G472 = () => {
            // MIN(
            // 0,75*0,85* ((L51*VLOOKUP(L51;$DATOS.I3:J14;2;FALSE()))
            // /$'REV OBRA NUEVA'.F55)
            // *(600/(600+$'REV OBRA NUEVA'.F55));0,025)
            let datos = {
                "21": "0.85",
                "22": "0.85",
                "23": "0.85",
                "24": "0.85",
                "25": "0.85",
                "26": "0.85",
                "27": "0.85",
                "28": "0.85",
                "35": "0.8",
                "42": "0.75",
                "49": "0.7",
                "56": "0.65",
            }

            let L51 = Number(_GET_STEP_TYPE_INDEX('s423m', 'value', 1) || 21)
            let F55 = Number(_GET_STEP_TYPE_INDEX('s423m', 'value', 4) || 420)
            let value = Math.min(0.75 * 0.85 * L51 * datos[L51] / F55 * (600 / (600 + F55)), 0.025)
            return Number(value).toFixed(4)
        }
        let get_G477 = () => {
            // 2*G446
            let G446 = Number(_GET_STEP_TYPE_INDEX('estructural_p1', 'value', 1) || document.getElementById("estructural_p1_1")?.value || 0);
            return Number(2 * G446).toFixed(4)
        }
        let get_G479 = () => {
            // 300
            return 300
        }
        let get_G480 = () => {
            // G468/4*1000
            let G468 = Number(_GET_STEP_TYPE_INDEX('estructural_p1', 'value', 17) || document.getElementById("estructural_p1_17")?.value || 0);
            return Number(G468 / 4 * 1000).toFixed(4)
        }
        let get_G481 = () => {
            // 8*IF(G465=0
            // ;G462
            // ;MIN(G462;G464))
            let G462 = Number(_GET_STEP_TYPE_INDEX('estructural_p1', 'value', 12) || document.getElementById("estructural_p1_12")?.value || 0);
            let G464 = Number(_GET_STEP_TYPE_INDEX('estructural_p1', 'value', 14) || document.getElementById("estructural_p1_14")?.value || 0);
            let G465 = Number(_GET_STEP_TYPE_INDEX('estructural_p1', 'value', 15) || document.getElementById("estructural_p1_15")?.value || 0);

            if (G465 == 0) return Number(8 * G462).toFixed(4)
            else return Number(8 * Math.min(G462, G464)).toFixed(4)
        }
        let get_G482 = () => {
            // 24*VLOOKUP(E476;$DATOS.E3:F4;2;FALSE())
            let E476 = _GET_STEP_TYPE_INDEX('estructural_p1', 'value', 33) || document.getElementById("estructural_p1_33")?.value || "N3";
            return Number(24 * OPS_VARILLAS[E476].d).toFixed(4)
        }
        let get_G485 = () => {
            // G480*2
            let G480 = Number(_GET_STEP_TYPE_INDEX('estructural_p1', 'value', 24) || document.getElementById("estructural_p1_24")?.value || 0);
            return Number(G480 * 2).toFixed(4)
        }

        let get_G91 = () => {
            // 0.35
            return 0.35
        }

        let get_G92 = () => {
            // G459
            let G459 = Number(_GET_STEP_TYPE_INDEX('estructural_p1', 'value', 11) || document.getElementById("estructural_p1_11")?.value || 0);
            return G459
        }

        let get_G93 = () => {
            // 0.3
            return 0.3
        }

        let get_G497 = () => {
            //G492*G491
            let G491 = Number(_GET_STEP_TYPE_INDEX('estructural_p2', 'value', 0) || document.getElementById("estructural_p2_0")?.value || 0);
            let G492 = Number(_GET_STEP_TYPE_INDEX('estructural_p2', 'value', 1) || document.getElementById("estructural_p2_1")?.value || 0);
            return Number(G491 * G492).toFixed(4)
        }

        let get_G497_2 = () => {
            return get_G497() + " >= 0.09"
        }

        let get_G498 = () => {
            // MAX(G491:G492)/MIN(G491:G492)
            let G491 = Number(_GET_STEP_TYPE_INDEX('estructural_p2', 'value', 0) || document.getElementById("estructural_p2_0")?.value || 0);
            let G492 = Number(_GET_STEP_TYPE_INDEX('estructural_p2', 'value', 1) || document.getElementById("estructural_p2_1")?.value || 0);
            return Number(Math.max(G491, G492) * Math.min(G491, G492)).toFixed(4)
        }

        let get_G498_2 = () => {
            return get_G498() + " > 0.4"
        }

        let get_G502 = () => {
            // G497*1000000
            let G497 = Number(get_G497() || 0);
            return G497 * 1000000
        }

        let get_G507 = () => {
            // G504 * VLOOKUP(G503;$DATOS.$F$3:$G$8;2;FALSE())
            // +G506 * VLOOKUP(G505;$DATOS.$F$3:$G$8;2;FALSE())
            let G503 = Number(_GET_STEP_TYPE_INDEX('estructural_p2', 'value', 8) || document.getElementById("estructural_p2_8")?.value || 0);
            let G504 = Number(_GET_STEP_TYPE_INDEX('estructural_p2', 'value', 9) || document.getElementById("estructural_p2_9")?.value || 0);
            let G505 = Number(_GET_STEP_TYPE_INDEX('estructural_p2', 'value', 10) || document.getElementById("estructural_p2_10")?.value || 0);
            let G506 = Number(_GET_STEP_TYPE_INDEX('estructural_p2', 'value', 11) || document.getElementById("estructural_p2_11")?.value || 0);
            return G504 * (OPS_VARILLAS_KEY[G503] || 0) + G506 * (OPS_VARILLAS_KEY[G505] || 0)
        }

        let get_G509 = () => {
            // G507/G502
            let G507 = Number(_GET_STEP_TYPE_INDEX('estructural_p2', 'value', 12) || document.getElementById("estructural_p2_12")?.value || 0);
            let G502 = Number(_GET_STEP_TYPE_INDEX('estructural_p2', 'value', 7) || document.getElementById("estructural_p2_7")?.value || 0);
            return (G507 / G502).toFixed(4)
        }

        let get_G509_2 = () => {
            return get_G509() + " > 0.01"
        }

        let get_G510 = () => {
            return " > 0.04"
        }

        let get_G514 = () => {
            let H514 = _GET_STEP_TYPE_INDEX('estructural_p2', 'value', 32) || document.getElementById("estructural_p2_32")?.value || "N3";
            return OPS_VARILLAS[H514].d
        }

        let get_G517 = () => {
            // MAX(G491:G492)
            let G491 = Number(_GET_STEP_TYPE_INDEX('estructural_p2', 'value', 0) || document.getElementById("estructural_p2_0")?.value || 0);
            let G492 = Number(_GET_STEP_TYPE_INDEX('estructural_p2', 'value', 1) || document.getElementById("estructural_p2_1")?.value || 0);
            return Math.max(G491, G492)
        }

        let get_G518 = () => {
            // G513/6
            let G513 = Number(_GET_STEP_TYPE_INDEX('estructural_p2', 'value', 15) || document.getElementById("estructural_p2_15")?.value || 0);
            return (G513 / 6).toFixed(4)
        }

        let get_G519 = () => {
            // 0.45
            return 0.45
        }

        let get_G521 = () => {
            // MIN(G491:G492)*1000/4
            let G491 = Number(_GET_STEP_TYPE_INDEX('estructural_p2', 'value', 0) || document.getElementById("estructural_p2_0")?.value || 0);
            let G492 = Number(_GET_STEP_TYPE_INDEX('estructural_p2', 'value', 1) || document.getElementById("estructural_p2_1")?.value || 0);
            return (Math.min(G491, G492) * 1000 / 4).toFixed(4)
        }

        let get_G522 = () => {
            // 6* 
            // IF G506=0
            // ;G503
            // ;MIN(G503;G505)
            let G503 = Number(_GET_STEP_TYPE_INDEX('estructural_p2', 'value', 8) || document.getElementById("estructural_p2_8")?.value || 0);
            let G505 = Number(_GET_STEP_TYPE_INDEX('estructural_p2', 'value', 10) || document.getElementById("estructural_p2_10")?.value || 0);
            let G506 = Number(_GET_STEP_TYPE_INDEX('estructural_p2', 'value', 11) || document.getElementById("estructural_p2_11")?.value || 0);

            if (G506 == 0) return (6 * G503).toFixed(4)
            else return (6 * Math.min(G503, G505)).toFixed(4)
        }

        let get_G523 = () => {
            // MAX(
            // 100;
            // MIN(150;
            // 100+(350-G501)/3))
            let G501 = Number(_GET_STEP_TYPE_INDEX('estructural_p2', 'value', 6) || document.getElementById("estructural_p2_6")?.value || 0);
            let value = 100 + (350 - G501) / 3
            return Math.max(100, Math.min(150, value))
        }

        let get_G526 = () => {
            // (G491*1000-40-H514) * (G492*1000-40-H514)
            let G491 = Number(_GET_STEP_TYPE_INDEX('estructural_p2', 'value', 0) || document.getElementById("estructural_p2_0")?.value || 0);
            let G492 = Number(_GET_STEP_TYPE_INDEX('estructural_p2', 'value', 1) || document.getElementById("estructural_p2_1")?.value || 0);
            let H514 = get_G514()
            return ((G491 * 1000 - 40 - H514) * (G492 * 1000 - 40 - H514)).toFixed(4)
        }

        let get_G528 = () => {
            // 0,09*G520*MIN(G491;G492)*1000*F52/F55
            let G491 = Number(_GET_STEP_TYPE_INDEX('estructural_p2', 'value', 0) || document.getElementById("estructural_p2_0")?.value || 0);
            let G492 = Number(_GET_STEP_TYPE_INDEX('estructural_p2', 'value', 1) || document.getElementById("estructural_p2_1")?.value || 0);
            let G520 = Number(_GET_STEP_TYPE_INDEX('estructural_p2', 'value', 21) || document.getElementById("estructural_p2_21")?.value || 0);
            let F52 = Number(_GET_STEP_TYPE_INDEX('s423m', 'value', 2) || 0);
            let F55 = Number(_GET_STEP_TYPE_INDEX('s423m', 'value', 4) || 0);

            return (0.09 * G520 * Math.min(G491, G492) * 1000 * F52 / F55).toFixed(4)
        }

        let get_G529 = () => {
            // 0,09*G520*MAX(G491;G492)*1000*F52/F55
            let G491 = Number(_GET_STEP_TYPE_INDEX('estructural_p2', 'value', 0) || document.getElementById("estructural_p2_0")?.value || 0);
            let G492 = Number(_GET_STEP_TYPE_INDEX('estructural_p2', 'value', 1) || document.getElementById("estructural_p2_1")?.value || 0);
            let G520 = Number(_GET_STEP_TYPE_INDEX('estructural_p2', 'value', 21) || document.getElementById("estructural_p2_21")?.value || 0);
            let F52 = Number(_GET_STEP_TYPE_INDEX('s423m', 'value', 2) || 0);
            let F55 = Number(_GET_STEP_TYPE_INDEX('s423m', 'value', 4) || 0);

            return (0.09 * G520 * Math.max(G491, G492) * 1000 * F52 / F55).toFixed(4)
        }

        let get_G531 = () => {
            // 0,3*G520*MIN(G491;G492)*1000*F52/F55*(G502*1000^2/G526-1)
            let G491 = Number(_GET_STEP_TYPE_INDEX('estructural_p2', 'value', 0) || document.getElementById("estructural_p2_0")?.value || 0);
            let G492 = Number(_GET_STEP_TYPE_INDEX('estructural_p2', 'value', 1) || document.getElementById("estructural_p2_1")?.value || 0);
            let G520 = Number(_GET_STEP_TYPE_INDEX('estructural_p2', 'value', 21) || document.getElementById("estructural_p2_21")?.value || 0);
            let F52 = Number(_GET_STEP_TYPE_INDEX('s423m', 'value', 2) || 0);
            let F55 = Number(_GET_STEP_TYPE_INDEX('s423m', 'value', 4) || 0);
            let G502 = Number(_GET_STEP_TYPE_INDEX('estructural_p2', 'value', 7) || document.getElementById("estructural_p2_7")?.value || 0);
            let G526 = Number(_GET_STEP_TYPE_INDEX('estructural_p2', 'value', 25) || document.getElementById("estructural_p2_25")?.value || 0);

            return (0.3 * G520 * Math.min(G491, G492) * 1000 * F52 / F55 * (G502 * Math.pow(1000, 2) / G526 - 1)).toFixed(2)
        }

        let get_G532 = () => {
            // 0,3*G520*MAX(G491;G492)*1000*F52/F55*(G502*1000^2/G526-1)
            let G491 = Number(_GET_STEP_TYPE_INDEX('estructural_p2', 'value', 0) || document.getElementById("estructural_p2_0")?.value || 0);
            let G492 = Number(_GET_STEP_TYPE_INDEX('estructural_p2', 'value', 1) || document.getElementById("estructural_p2_1")?.value || 0);
            let G520 = Number(_GET_STEP_TYPE_INDEX('estructural_p2', 'value', 21) || document.getElementById("estructural_p2_21")?.value || 0);
            let F52 = Number(_GET_STEP_TYPE_INDEX('s423m', 'value', 2) || 0);
            let F55 = Number(_GET_STEP_TYPE_INDEX('s423m', 'value', 4) || 0);
            let G502 = Number(_GET_STEP_TYPE_INDEX('estructural_p2', 'value', 7) || document.getElementById("estructural_p2_7")?.value || 0);
            let G526 = Number(_GET_STEP_TYPE_INDEX('estructural_p2', 'value', 25) || document.getElementById("estructural_p2_25")?.value || 0);

            return (0.3 * G520 * Math.max(G491, G492) * 1000 * F52 / F55 * (G502 * Math.pow(1000, 2) / G526 - 1)).toFixed(2)
        }

        let get_G547 = () => {
            // SUM(F268:F295)*1000 
            let h = Number(_GET_TOTAL().height) * 1000
            return h
        }

        let get_G548 = () => {
            // M296/G550
            let M296 = Number(_GET_TOTAL().tot)
            let G550 = Number(_GET_STEP_TYPE_INDEX('estructural_p3', 'value', 10) || document.getElementById("estructural_p3_10")?.value || 0);
            return Number(M296 / G550).toFixed(4)
        }

        let get_G549 = () => {
            // 4700*SQRT(L52)
            let L52 = Number(_GET_STEP_TYPE_INDEX('s423m', 'value', 3) ?? 21)
            return Number(4700 * Math.sqrt(L52)).toFixed(4)
        }

        let get_G553 = () => {
            // G551*G540/1000/G550
            let G551 = Number(_GET_STEP_TYPE_INDEX('estructural_p3', 'value', 11) || document.getElementById("estructural_p3_11")?.value || 0);
            let G540 = Number(_GET_STEP_TYPE_INDEX('estructural_p3', 'value', 0) || document.getElementById("estructural_p3_0")?.value || 0);
            let G550 = Number(_GET_STEP_TYPE_INDEX('estructural_p3', 'value', 10) || document.getElementById("estructural_p3_10")?.value || 0);
            return Number(G551 * G540 / 1000 / G550).toFixed(4)
        }

        let get_G554 = () => {
            // G552*G540/1000/G550
            let G552 = Number(_GET_STEP_TYPE_INDEX('estructural_p3', 'value', 12) || document.getElementById("estructural_p3_12")?.value || 0);
            let G540 = Number(_GET_STEP_TYPE_INDEX('estructural_p3', 'value', 0) || document.getElementById("estructural_p3_0")?.value || 0);
            let G550 = Number(_GET_STEP_TYPE_INDEX('estructural_p3', 'value', 10) || document.getElementById("estructural_p3_10")?.value || 0);
            return Number(G552 * G540 / 1000 / G550).toFixed(4)
        }

        let get_G555 = () => {
            // 2,5*1000
            return 2.5 * 1000
        }

        let get_G556 = () => {
            // G555/G540
            let G540 = Number(_GET_STEP_TYPE_INDEX('estructural_p3', 'value', 0) || document.getElementById("estructural_p3_0")?.value || 0);
            let G555 = get_G555()
            return Number(G555 / G540).toFixed(4)
        }

        let get_G557 = () => {
            // G547/G541
            let G547 = Number(_GET_STEP_TYPE_INDEX('estructural_p3', 'value', 0) || document.getElementById("estructural_p3_0")?.value || 0);
            let G541 = Number(_GET_STEP_TYPE_INDEX('estructural_p3', 'value', 1) || document.getElementById("estructural_p3_1")?.value || 0);
            return Number(G547 / G541).toFixed(4)
        }

        let get_G560 = () => {
            // MAX(
            // 0,2*K230*(G547/G541)*SQRT(G548/(G549*1000*G553*G555/1000))*G555/G547
            // 0,007)
            let K230 = Number(_GET_STEP_TYPE_INDEX('s4237', 'value', 20) || 0);
            let G547 = Number(_GET_STEP_TYPE_INDEX('estructural_p3', 'value', 0) || document.getElementById("estructural_p3_0")?.value || 0);
            let G541 = Number(_GET_STEP_TYPE_INDEX('estructural_p3', 'value', 1) || document.getElementById("estructural_p3_1")?.value || 0);
            let G548 = get_G548();
            let G549 = get_G549();
            let G553 = get_G553();
            let G555 = get_G555();
            let value = 0.2 * K230 * (G547 / G541) * Math.sqrt(G548 / (G549 * 1000 * G553 * G555 / 1000)) * G555 / G547;
            return Math.max(value, 0.007)
        }

        let get_G561 = () => {
            // MAX(
            // 0,2*K230*(G547/G541)*SQRT(G548/(G549*1000*G554*G555/1000))*G555/G547
            // 0,007)
            let K230 = Number(_GET_STEP_TYPE_INDEX('s4237', 'value', 20) || 0);
            let G547 = Number(_GET_STEP_TYPE_INDEX('estructural_p3', 'value', 0) || document.getElementById("estructural_p3_0")?.value || 0);
            let G541 = Number(_GET_STEP_TYPE_INDEX('estructural_p3', 'value', 1) || document.getElementById("estructural_p3_1")?.value || 0);
            let G548 = get_G548();
            let G549 = get_G549();
            let G554 = get_G554();
            let G555 = get_G555();
            let value = 0.2 * K230 * (G547 / G541) * Math.sqrt(G548 / (G549 * 1000 * G554 * G555 / 1000)) * G555 / G547;
            return Math.max(value, 0.007)
        }

        let get_G562 = () => {
            // G541/(600*G560)
            let G541 = Number(_GET_STEP_TYPE_INDEX('estructural_p3', 'value', 1) || document.getElementById("estructural_p3_1")?.value || 0);
            let G560 = get_G560();
            return Number(G541 / (600 * G560)).toFixed(4)
        }

        let get_G563 = () => {
            // G541/(600*G561)
            let G541 = Number(_GET_STEP_TYPE_INDEX('estructural_p3', 'value', 1) || document.getElementById("estructural_p3_1")?.value || 0);
            let G561 = get_G561();
            return Number(G541 / (600 * G561)).toFixed(4)
        }

        let get_G564 = () => {
            // IF(
            // SI
            // NO
            let G558 = Number(_GET_STEP_TYPE_INDEX('estructural_p3', 'value', 18) || document.getElementById("estructural_p3_18")?.value || 0);
            let G563 = get_G563();
            if (G558 >= G563) return 'SI'
            return 'NO'
        }

        let get_G569 = () => {
            // IF((G558-(0,1*G541))<0
            // ;"N.A"
            // ;G558-(0,1*G541))
            let G558 = Number(_GET_STEP_TYPE_INDEX('estructural_p3', 'value', 18) || document.getElementById("estructural_p3_18")?.value || 0);
            let G541 = Number(_GET_STEP_TYPE_INDEX('estructural_p3', 'value', 1) || document.getElementById("estructural_p3_1")?.value || 0);
            let value = (G558 - (0.1 * G541));
            if (value < 0) return "NA";
            return Number(value).toFixed(4);
        }

        let get_G570 = () => {
            // G558/2
            let G558 = Number(_GET_STEP_TYPE_INDEX('estructural_p3', 'value', 18) || document.getElementById("estructural_p3_18")?.value || 0);
            return Number(G558 / 2).toFixed(4);
        }

        let get_G571 = () => {
            // 300
            return 300
        }

        let get_G576 = () => {
            // G542/3
            let G542 = Number(_GET_STEP_TYPE_INDEX('estructural_p3', 'value', 2) || document.getElementById("estructural_p3_2")?.value || 0);
            return Number(G542 / 3).toFixed(4);
        }

        let get_G577 = () => {
            // 6*G546
            let G546 = Number(_GET_STEP_TYPE_INDEX('estructural_p3', 'value', 6) || document.getElementById("estructural_p3_6")?.value || 0);
            return Number(6 * G546).toFixed(4);
        }

        let get_G578 = () => {
            // MIN(
            //      MAX(
            //      100-(350-G543)/3
            //      100)
            // 150)
            let G543 = Number(_GET_STEP_TYPE_INDEX('estructural_p3', 'value', 3) || document.getElementById("estructural_p3_3")?.value || 0);
            let value = Number(100 - (350 - G543) / 3).toFixed(4);
            return Math.min(Math.max(value, 100), 150)
        }

        let get_G583 = () => {
            // 0,09*G544*G542*L52/L55
            let G544 = Number(_GET_STEP_TYPE_INDEX('estructural_p3', 'value', 4) || document.getElementById("estructural_p3_4")?.value || 0);
            let G542 = Number(_GET_STEP_TYPE_INDEX('estructural_p3', 'value', 2) || document.getElementById("estructural_p3_2")?.value || 0);
            let L52 = Number(_GET_STEP_TYPE_INDEX('s423m', 'value', 3) ?? 21);
            let L55 = Number(_GET_STEP_TYPE_INDEX('s423m', 'value', 5) ?? 420);
            return Number(0.09 * G544 * G542 * L52 / L55).toFixed(4)
        }

        let get_G588 = () => {
            // PI /4*G587^2
            let G587 = Number(_GET_STEP_TYPE_INDEX('estructural_p3', 'value', 32) || document.getElementById("estructural_p3_32")?.value || 0);
            return Number(Math.PI / 4 * G587 ^ 2).toFixed(4)
        }

        let get_G589 = () => {
            // G588/G586/G540*2
            let G540 = Number(_GET_STEP_TYPE_INDEX('estructural_p3', 'value', 0) || document.getElementById("estructural_p3_0")?.value || 0);
            let G586 = Number(_GET_STEP_TYPE_INDEX('estructural_p3', 'value', 31) || document.getElementById("estructural_p3_31")?.value || 0);
            let G588 = get_G588();
            return Number(G588 / G586 / G540 * 2).toFixed(4);
        }

        let get_G590 = () => {
            // 200
            return 200;
        }

        let get_G591 = () => {
            // 0.0025
            return 0.0025;
        }

        let get_G596 = () => {
            // PI /4*G595^2
            let G595 = Number(_GET_STEP_TYPE_INDEX('estructural_p3', 'value', 38) || document.getElementById("estructural_p3_38")?.value || 0);
            return Number(Math.PI / 4 * G595 ^ 2).toFixed(4)
        }

        let get_G597 = () => {
            //G596/G594/G540*2
            let G540 = Number(_GET_STEP_TYPE_INDEX('estructural_p3', 'value', 0) || document.getElementById("estructural_p3_0")?.value || 0);
            let G594 = Number(_GET_STEP_TYPE_INDEX('estructural_p3', 'value', 37) || document.getElementById("estructural_p3_37")?.value || 0);
            let G596 = get_G596();
            return Number(G596 / G594 / G540 * 2).toFixed(4);
        }

        let get_G598 = () => {
            // 450
            return 450;
        }

        let get_G599 = () => {
            // 0.0025
            return 0.0025;
        }

        const PASO_10_VERSION_2 = [
            { i: 0, c: 0, name: "Deriva admisible (A.6.4 NSR-10) (m)", },
            { i: 1, c: 1, name: "Deriva máxima (cm)", },
            { i: 2, c: 2, name: "Nivel en el que se obtuvo (m)", },
        ]

        const ESTRUCTURAL_P1 = [
            { i: 0, c: 0, name: "Longitud libre Ln>=4h (m)", name2: "NSR 10 C.21.5.1.2", open: true, calc: null },
            { i: 1, c: 1, name: "Altura (M)", name2: "NSR 10 C.15.13.3.1", open: true, calc: null },
            { i: 2, name: "d - Recubirmiento min=4cm (m)", open: true, calc: null },
            { i: 3, name: "Base (m)", open: true, calc: null },
            { name: "", calc: null },
            { i: 4, c: 2, name: "Base minima requerida 1 (m)", name2: "NSR 10 C.21.5.1.3", calc: get_G450 },
            { i: 5, name: "Base minima requerida 2 (m)", calc: get_G451 },
            { name: "", calc: null },
            { i: 6, c: 3, name: "Base máxima permitida 1 (m)", name2: "NSR 10 C.21.5.1.4 (a)", calc: get_G453 },
            { i: 7, c: 4, name: "Base máxima permitida 2 (m)", name2: "NSR 10 C.21.5.1.4 (a)", calc: get_G454 },
            { i: 8, c: 5, name: "Base máxima permitida 3 (m)", name2: "NSR 10 C.21.5.1.4 (b)", calc: get_G455 },
            { i: 9, c: 6, name: "Base máxima permitida 4 (m)", name2: "NSR 10 C.21.5.1.4 (b)", calc: get_G456 },
            { name: "", calc: null },
            { i: 10, c: 7, name: "C = 1  (m) - Dimension de Columna medida en dirección de la luz para la cual se determinan los momentos", name2: "NSR 10 C.21.6.1.1", calc: null, open: true },
            { i: 11, name: "C = 2 (m)", name2: "NSR 10 C.21.6.1.2", calc: null, open: true },
            { name: "Revision de cuantias", calc: null, bold: true, },
            { i: 12, name: "diámetro de varilla 1 (mm2)", calc: get_G462, i2: 29, i3: 30, cacl3: get_H462 },
            { i: 13, name: "cantidad de verillas 1 ", calc: null, open: true },
            { i: 14, name: "diámetro de varilla 2 (mm2)", calc: get_G464, i2: 31, i3: 32, cacl3: get_H464 },
            { i: 15, name: "cantidad de verillas 2", calc: null, open: true },
            { name: "", calc: null },
            { i: 16, name: "Acero planteado (mm2)", calc: get_G467, },
            { i: 17, c: 8, name: "d (Distancia desde el centroide del refuerzo a la fibra superior a compresión) (m)", name2: "NSR 10 C.10.5.1, si no cumple revisar C.10.5.3", calc: get_G468, },
            { i: 18, c: 9, name: "ρmin Cuantia mínima", name2: "NSR 10 C.10.5.1", calc: get_G470, },
            { i: 19, c: 10, name: "ρ Cuantia actual", calc: get_G471, },
            { i: 20, c: 11, name: "ρmax Cuantia máxima", name2: "NSR 10 C.10.3.2", calc: get_G472, },
            { name: "Acero transversal NSR 10 C.21.5.3", calc: null, bold: true, },
            { name: "ZONA CONFINADA", calc: null, bold: true, },
            { i: 33, name: "ESTRIBOS", calc: null, options: OPS_ESTRIBOS_SELECT },
            { i: 21, name: "Longitud mínima de la zona confinada (m)", calc: get_G477, },
            { i: 22, name: "Separación de estribos en la zona confinada (mm)", name2: "NSR 10 C.21.5.3.2", calc: null, open: true },
            { i: 23, name: "Separación de estribos requerida en la zona confinada 1 (mm)", calc: get_G479, },
            { i: 24, name: "Separación de estribos requerida en la zona confinada 2 (mm)", calc: get_G480, },
            { i: 25, name: "Separación de estribos requerida en la zona confinada 3 (mm)", calc: get_G481, },
            { i: 26, name: "Separación de estribos requerida en la zona confinada 4 (mm)", calc: get_G482, },
            { name: "ZONA NO CONFINADA", calc: null, bold: true, },
            { i: 27, name: "Separación de estribos en la zona no confinada (mm)", name2: "NSR 10 C.21.5.3.4", calc: null, open: true },
            { i: 28, name: "Separación de estribos requerida en la zona no confinada (mm)", calc: get_G485, },
        ]

        const ESTRUCTURAL_P2 = [
            { name: "Requisitos geometricos (Articulo C.21 NSR10)", calc: null, bold: true, },
            { i: 0, name: "Dimensión de columna c1 (m)", calc: get_G91, },
            { i: 1, name: "Dimensión de columna c2 (m)", calc: get_G92, },
            { i: 2, c: 0, name: "Dimensión de columna mínima requerida (m)", calc: get_G93, },
            { i: 3, name: "Longitud de columna (m)", calc: null, open: true },
            { name: "", calc: null },
            { i: 4, c: 1, name: "Área grosa de columna (Ag)", calc: get_G497_2, },
            { i: 5, c: 2, name: "Relación entre la dimensión menor y mayor de la columna", calc: get_G498_2, },
            { name: "Revision de cuantias NSR 10 C.21.6.3", calc: null, bold: true, },
            { i: 6, c: 3, name: "Espcaiamiento horizontal entre estribos (hx) (mm)", nam2: "NSR 10 C.21.6.4.2", calc: null, open: true },
            { i: 7, name: "Área grosa de columna (Ag) (mm^2)", calc: get_G502, },
            { i: 8, name: "diámetro de varilla 1 (mm)", calc: null, open: true },
            { i: 9, name: "cantidad de verillas 1", calc: null, open: true },
            { i: 10, name: "diámetro de varilla 2 (mm)", calc: null, open: true },
            { i: 11, name: "cantidad de verillas 2", calc: null, open: true },
            { i: 12, name: "Acero planteado (mm^2)", calc: get_G507, },
            { name: "", calc: null },
            { i: 13, c: 4, name: "ρ Cuantia actual", nam2: "NSR 10 C.21.6.3.1", calc: get_G509_2, },
            { i: 14, c: 5, name: "ρmax Cuantia máxima", nam2: "NSR 10 C.21.6.3.1", calc: get_G510, },
            { name: "Acero transversal NSR 10 C.21.6.4", calc: null, bold: true, },
            { i: 15, name: "Longitud libre de columna (m)", calc: null, open: true },
            { i: 16, name: "N estribos (mm)", calc: get_G514, i2: 32 },
            { name: "ZONA CONFINADA", calc: null, },
            { i: 17, c: 6, name: "Longitud de la zona confinada planteada (m)", name2: "NSR 10 C.21.6.4.1", calc: null, open: true },
            { i: 18, name: "Longitud de la zona confinada 1 (m)", calc: get_G517, },
            { i: 19, name: "Longitud de la zona confinada 2 (m)", calc: get_G518, },
            { i: 20, name: "Longitud de la zona confinada 3 (m)", calc: get_G519, },
            { i: 21, c: 7, name: "Separación de estribos en la zona confinada (mm)", name2: "NSR 10 C.21.6.4.3", calc: null, open: true },
            { i: 22, name: "Separación de estribos requerida en la zona confinada 1 (mm)", calc: get_G521, },
            { i: 23, name: "Separación de estribos requerida en la zona confinada 2 (mm)", calc: get_G522, },
            { i: 24, name: "Separación de estribos requerida en la zona confinada 3 (mm)", calc: get_G523, },
            { name: "Revision de cuantia volumétrica en columnas", calc: null, bold: true, },
            { i: 25, name: "Area encerrada por el refuerzo transversal (Aoh) (mm^2)", calc: get_G526, },
            { name: "Area total de refuerzo transversal 1 (Ash1)", calc: null, },
            { i: 26, name: "Sentido corto (mm^2)", calc: get_G528, },
            { i: 27, name: "Sentido largo (mm^2)", calc: get_G529, },
            { name: "Area total de refuerzo transversal 2 (Ash2)", calc: null, },
            { i: 28, name: "Sentido corto (mm^2)", calc: get_G531, },
            { i: 29, name: "Sentido largo (mm^2)", calc: get_G532, },
            { name: " NSR 10 C.21.", calc: null, },
            { i: 30, c: 8, name: "sentido corto (mm^2)", calc: null, open: true },
            { i: 31, c: 9, name: "sentido largo (mm^2)", calc: null, open: true },
        ]

        const ESTRUCTURAL_P3 = [
            { i: 0, name: "t - espesor del muro (mm)", calc: null, open: true },
            { i: 1, name: "Lw - Longitud del muro (mm)", calc: null, open: true },
            { i: 2, name: "b - ancho elemento de borde (mm)", calc: null, open: true },
            { i: 3, name: "hx - Separacion maxima entre estribos en elemento de borde (mm)", calc: null, open: true },
            { i: 4, name: "s - Separacion estribos elementos de borde (mm)", calc: null, open: true },
            { i: 5, name: "Av - Area resistente de estribos y ganchos en elemento de borde (mm^2)", calc: null, open: true },
            { i: 6, name: "db - Diametro de barras longitudinales ne leemntos de borde (mm)", calc: null, open: true, },
            { i: 7, name: "hw (mm)", calc: get_G547, },
            { i: 8, name: "wd (kN/m^2)", calc: get_G548, },
            { i: 9, name: "Ec (Mpa)", calc: get_G549, },
            { i: 10, name: "Aplanta (mm^2)", calc: null, open: true },
            { i: 11, name: "Lx (m)", calc: null, open: true },
            { i: 12, name: "Ly (m)", calc: null, open: true },
            { i: 13, name: "pwx", calc: get_G553, },
            { i: 14, name: "pwy", calc: get_G554, },
            { i: 15, name: "hs (mm)", calc: get_G555, },
            { i: 16, name: "hs/t - mayor a 20 se considera esbelto , lo ideal es que sea menor a 16 ", calc: get_G556, },
            { i: 17, name: "hw/lw", calc: get_G557, },
            { i: 18, name: "c - según el diseño estructural (mm)", calc: null, open: true },
            { name: "C.21.9.6.4", calc: null, },
            { i: 19, name: "δu/hw_x - C.21.4.4.1 (%)", calc: get_G560, },
            { i: 20, name: "δu/hw_y - C.21.4.4.1 (%)", calc: get_G561, },
            { name: "", calc: null, },
            { i: 21, name: "Lw /(600*(δu/hw))_x (mm)", calc: get_G562, },
            { i: 22, name: "Lw /(600*(δu/hw))_y (mm)", calc: get_G563, },
            { i: 23, name: "requiere elemento de borde", calc: get_G564, },
            { name: "Chequeo elementos de borde en muros ", calc: null, bold: true, },
            { i: 24, name: "bmin1 (mm)", calc: get_G569, },
            { i: 25, name: "bmin2 (mm)", calc: get_G570, },
            { i: 26, c: 0, name: "bmin3 (mm)", calc: get_G571, },
            { name: "Espaciamiento en elementos de borde ", calc: null, bold: true, },
            { i: 27, name: "Sconfi1 (mm)", calc: get_G576, },
            { i: 28, name: "Sconfi2 (mm)", calc: get_G577, },
            { i: 29, c: 1, name: "Sconfi3 (mm)", calc: get_G578, },
            { name: "Refuerzo tranversal en elemento de borde", calc: null, bold: true, },
            { i: 30, c: 2, name: "Ash (mm^2)", calc: get_G583, },
            { name: "Cuantia mínima transversal en el alma de muro ", calc: null, bold: true, },
            { i: 31, name: "s - Seapracion de barras a a corte en alma de muro (mm)", calc: null, open: true },
            { i: 32, name: "db - diametro de barras efectivas a corte en centro de muro  (mm)", calc: null, open: true },
            { i: 33, name: "Ab (mm^2)", calc: get_G588, },
            { i: 34, name: "pt Cuantia de acero en el alma", calc: get_G589, },
            { i: 35, c: 3, name: "smax (mm)", calc: get_G590, },
            { i: 36, c: 4, name: "Pt_min", calc: get_G591, },
            { name: "Cuantia mínima longitudinal en el alma de muro", calc: null, bold: true, },
            { i: 37, name: "s - Seapracion de barras a a corte en alma de muro (mm)", calc: null, open: true },
            { i: 38, name: "db - diametro de barras efectivas a corte en centro de muro  (mm)", calc: null, open: true },
            { i: 39, name: "Ab (mm^2)", calc: get_G596, },
            { i: 40, name: "pl Cuantia de acero en el alma", calc: get_G597, },
            { i: 41, c: 5, name: "smax (mm)", calc: get_G598, },
            { i: 42, c: 6, name: "Pl_min", calc: get_G599, },
        ]


        // COMPONENT JSX
        let ESTRUCTURAL_COMPONENT = (item, id, save) => <div className="row">
            <div className={"col-3 mb-1" + (item.bold ? " fw-bold" : "")}>{item.name}</div>
            <div className="col-3 mb-1">
                <div className='form-group row'>
                    {item.i2 ?
                        <div className='col'>
                            <select className={"form-control form-control-sm form-select"}
                                name={id} id={id + "_" + + item.i2}
                                defaultValue={_GET_STEP_TYPE_INDEX(id, 'value', item.i2) ?? "N3"} onChange={() => save()} >
                                {OPS_VARILLAS_SELECT.map(o => <option>{o}</option>)}
                            </select>
                        </div>

                        : null}
                    {item.i != undefined ? <div className='col'>
                        {item.options ?
                            <select className={"form-control form-control-sm form-select"}
                                name={id} id={id + "_" + + item.i}
                                defaultValue={_GET_STEP_TYPE_INDEX(id, 'value', item.i) ?? item.options[0]} onChange={() => save()} >
                                {item.options.map(o => <option>{o}</option>)}
                            </select> :
                            <input type={item.open ? "number" : "text"} step={item.open ? false : "0.01"}
                                className="form-control form-control-sm" name={id} id={id + "_" + + item.i} disabled={item.open ? false : true}
                                onBlur={() => save()}
                                defaultValue={_GET_STEP_TYPE_INDEX(id, 'value', item.i) ?? (item.calc ? item.calc() : '')} />}
                    </div> : null}
                </div>
            </div>
            <div className="col-3 mb-1">{item.name2 || ''}
                {item.i3 != undefined ? <input type="text"
                    className="form-control form-control-sm" name={id} id={id + "_" + + item.i3} disabled={true}
                    onBlur={() => save()}
                    defaultValue={_GET_STEP_TYPE_INDEX(id, 'value', item.i3) ?? (item.calc3 ? item.calc3() : '')} /> : null}
            </div>
            {item.c != undefined ? <div className="col-3 mb-1">
                <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX(id, 'check', item.c) ?? 1)}
                    name={id + "_c"} id={id + '_c_' + item.c}
                    defaultValue={_GET_STEP_TYPE_INDEX(id, 'check', item.c) ?? 1} onChange={() => save()} >
                    <option value="0" className="text-danger">NO CUMPLE</option>
                    <option value="1" className="text-success">CUMPLE</option>
                </select>
            </div>
                : <div className="col-3 mb-1"></div>}
        </div>

        let COMPONENT_912 = () => {
            return <>
                {SUBCATEGORIES[10] == 1 ? <>
                    <div className="row">
                        <div className="col-10">
                            <label className="fw-bold text-uppercase my-2">Paso 9, Desplazamientos horizontales. Se evalúan los desplazamientos horizontales, incluyendo los efectos torsionales dela estructura, las derivas (desplazamiento entre niveles continuos), por medio de los procedimientos del (Cap. A.6), y con base en los desplazamientos obtenidos en el paso 8.</label>
                        </div>
                        <div className="col-2">
                            <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s433', 'check', 0) ?? 1)} name="r_e_select_s433"
                                defaultValue={_GET_STEP_TYPE_INDEX('s433', 'check', 0) ?? 1} onChange={() => manage_step_912()} >
                                <option value="0" className="text-danger">NO CUMPLE</option>
                                <option value="1" className="text-success">CUMPLE</option>
                            </select>
                        </div>
                    </div>
                </> : ""}
                {SUBCATEGORIES[11] == 1 ? <>

                    {version === 2 ?
                        <div className="row">
                            {PASO_10_VERSION_2.map(item => <>
                                <div className="col-4 mb-1">{item.name}</div>
                                <div className="col-4 mb-1">
                                    <input type="number" step="0.01"
                                        className="form-control" name="s43310_21" id={'s43310_21_' + item.i}
                                        onBlur={() => manage_step_912()}
                                        defaultValue={_GET_STEP_TYPE_INDEX('s43310_21', 'value', item.i) ?? ''} />
                                </div>
                                {item.c != undefined ? <div className="col-4 mb-1">
                                    <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s43310_21', 'check', item.c) ?? 1)}
                                        name="s43310_21_c" id={'s43310_21_c_' + item.c}
                                        defaultValue={_GET_STEP_TYPE_INDEX('s43310_21', 'check', item.c) ?? 1} onChange={() => manage_step_912()} >
                                        <option value="0" className="text-danger">NO CUMPLE</option>
                                        <option value="1" className="text-success">CUMPLE</option>
                                    </select>
                                </div>
                                    : <div className="col-4 mb-1"></div>}

                            </>)}
                        </div>
                        : null}

                    <div className="row">
                        <div className="col-10">
                            <label className="fw-bold text-uppercase my-2">Paso10: Verificación de las derivas. Comprobar que las derivas no excedan los límites del (Cap. A.6), si la estructura excede dichos límites,  es obligatorio rigidizarla y llevar a cabo los pasos 8, 9 y 10, hasta que cumpla.</label>
                        </div>
                        <div className="col-2">
                            <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s43310', 'check', 0) ?? 1)} name="r_e_select_s43310"
                                defaultValue={_GET_STEP_TYPE_INDEX('s43310', 'check', 0) ?? 1} onChange={() => manage_step_912()}>
                                <option value="0" className="text-danger">NO CUMPLE</option>
                                <option value="1" className="text-success">CUMPLE</option>
                            </select>
                        </div>
                    </div>
                    {version === 2 ?
                        <div className="row">
                            <div className="col-10">
                                <label className="fw-bold text-uppercase my-2">Desplazamientos horizontales. Se evalúan los desplazamientos horizontales, incluyendo los efectos torsionales dela estructura, las derivas (desplazamiento entre niveles continuos), por medio de los procedimientos del (Cap. A.6), y con base en los desplazamientos obtenidos en el paso 8.</label>
                            </div>
                            <div className="col-2">
                                <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s43310_22', 'check', 0) ?? 1)} name="r_e_select_s43310_22"
                                    defaultValue={_GET_STEP_TYPE_INDEX('s43310_22', 'check', 0) ?? 1} onChange={() => manage_step_912()}>
                                    <option value="0" className="text-danger">NO CUMPLE</option>
                                    <option value="1" className="text-success">CUMPLE</option>
                                </select>
                            </div>
                        </div>
                        : null}
                </> : ""}
                {SUBCATEGORIES[12] == 1 ? <>
                    <div className="row">
                        <div className="col-10">
                            <label className="fw-bold text-uppercase my-2">Paso 11, Combinación de las diferentes solicitudes. De la combinación de las diferentes solicitudes sale la obtención de las fuerzas internas de diseño de la estructura, (Cap. B.2), por el método de diseño propio de cada material estructural,  cada una de las combinaciones de carga se multiplica por un coeficiente de carga prescrito para esta combinación,  en los efectos del sismo de diseño, se tiene en cuenta la capacidad de disipación de energía lo cual se logra empleando unos efectos sísmicos reducidos de diseño, E, determinadas en el paso 7, por el coeficiente de capacidad de disipar energía,  R(E = Fs/R). </label>
                        </div>
                        <div className="col-2">
                            <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s43311', 'check', 0) ?? 1)} name="r_e_select_s43311"
                                defaultValue={_GET_STEP_TYPE_INDEX('s43311', 'check', 0) ?? 1} onChange={() => manage_step_912()}>
                                <option value="0" className="text-danger">NO CUMPLE</option>
                                <option value="1" className="text-success">CUMPLE</option>
                            </select>
                        </div>
                    </div>
                </> : ""}
                {SUBCATEGORIES[13] == 1 ? <>
                    <div className="row">
                        <div className="col-10">
                            <label className="fw-bold text-uppercase my-2">Paso 12, Diseño de los elementos estructurales. Se lleva a cabo de acuerdo con los requisitos del sistema de resistencia sísmica y del material estructural utilizado, los materiales deben diseñarse de acuerdo con el grado de disipación de energía, prescrito en el Cap. A  según corresponda, lo cual permitirá a la estructura responder ante la ocurrencia de un sismo, en el rango inelástico de respuesta, y cumplir con los objetivos de la norma sismo resistente, este diseño debe efectuarse con los elementos más desfavorables, entre las combinaciones obtenidas en el paso 11, tal como lo prescribe el título B del reglamento.</label>
                        </div>
                        <div className="col-2">
                            <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s43312', 'check', 0) ?? 1)} name="r_e_select_s43312"
                                defaultValue={_GET_STEP_TYPE_INDEX('s43312', 'check', 0) ?? 1} onChange={() => manage_step_912()}>
                                <option value="0" className="text-danger">NO CUMPLE</option>
                                <option value="1" className="text-success">CUMPLE</option>
                            </select>
                        </div>
                    </div>

                    {version == 2 ? ESTRUCTURALES() : null}
                </> : ""}
            </>
        }
        let COMPONENT_02 = () => {
            return <>
                {SUBCATEGORIES[13] == 1 ? <>
                    <ul class="list-group my-0 py-0">
                        <li class="list-group-item py-0">
                            <div className="row">
                                <div className="col-10">
                                    <label className="">Memorias de diseño de elementos estructurales</label>
                                </div>
                                <div className="col-2">
                                    <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s43312', 'check', 1) ?? 1)} name="r_e_select_s43312"
                                        defaultValue={_GET_STEP_TYPE_INDEX('s43312', 'check', 1) ?? 1} onChange={() => manage_step_912()}>
                                        <option value="0" className="text-danger">NO CUMPLE</option>
                                        <option value="1" className="text-success">CUMPLE</option>
                                        <option value="2" className="text-warning">N/A</option>
                                    </select>
                                </div>
                            </div>
                        </li>
                        <li class="list-group-item py-0">
                            <div className="row">
                                <div className="col-10">
                                    <label className="">Memorias de diseño de cimentación</label>
                                </div>
                                <div className="col-2">
                                    <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s43312', 'check', 2) ?? 1)} name="r_e_select_s43312"
                                        defaultValue={_GET_STEP_TYPE_INDEX('s43312', 'check', 2) ?? 1} onChange={() => manage_step_912()}>
                                        <option value="0" className="text-danger">NO CUMPLE</option>
                                        <option value="1" className="text-success">CUMPLE</option>
                                        <option value="2" className="text-warning">N/A</option>
                                    </select>
                                </div>
                            </div>
                        </li>
                        <li class="list-group-item py-0">
                            <div className="row">
                                <div className="col-10">
                                    <label className="">Memorias de diseño de placas de entrepiso</label>
                                </div>
                                <div className="col-2">
                                    <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s43312', 'check', 3) ?? 1)} name="r_e_select_s43312"
                                        defaultValue={_GET_STEP_TYPE_INDEX('s43312', 'check', 3) ?? 1} onChange={() => manage_step_912()}>
                                        <option value="0" className="text-danger">NO CUMPLE</option>
                                        <option value="1" className="text-success">CUMPLE</option>
                                        <option value="2" className="text-warning">N/A</option>
                                    </select>
                                </div>
                            </div>
                        </li>
                        <li class="list-group-item py-0">
                            <div className="row">
                                <div className="col-10">
                                    <label className="">Memorias de diseño de escaleras</label>
                                </div>
                                <div className="col-2">
                                    <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s43312', 'check', 4) ?? 1)} name="r_e_select_s43312"
                                        defaultValue={_GET_STEP_TYPE_INDEX('s43312', 'check', 4) ?? 1} onChange={() => manage_step_912()}>
                                        <option value="0" className="text-danger">NO CUMPLE</option>
                                        <option value="1" className="text-success">CUMPLE</option>
                                        <option value="2" className="text-warning">N/A</option>
                                    </select>
                                </div>
                            </div>
                        </li>
                        <li class="list-group-item py-0">
                            <div className="row">
                                <div className="col-10">
                                    <label className="">Memorias de diseño de muros</label>
                                </div>
                                <div className="col-2">
                                    <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s43312', 'check', 5) ?? 1)} name="r_e_select_s43312"
                                        defaultValue={_GET_STEP_TYPE_INDEX('s43312', 'check', 5) ?? 1} onChange={() => manage_step_912()}>
                                        <option value="0" className="text-danger">NO CUMPLE</option>
                                        <option value="1" className="text-success">CUMPLE</option>
                                        <option value="2" className="text-warning">N/A</option>
                                    </select>
                                </div>
                            </div>
                        </li>
                        <li class="list-group-item py-0">
                            <div className="row">
                                <div className="col-10">
                                    <label className="">Memorias de diseño de tanques</label>
                                </div>
                                <div className="col-2">
                                    <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s43312', 'check', 6) ?? 1)} name="r_e_select_s43312"
                                        defaultValue={_GET_STEP_TYPE_INDEX('s43312', 'check', 6) ?? 1} onChange={() => manage_step_912()}>
                                        <option value="0" className="text-danger">NO CUMPLE</option>
                                        <option value="1" className="text-success">CUMPLE</option>
                                        <option value="2" className="text-warning">N/A</option>
                                    </select>
                                </div>
                            </div>
                        </li>
                        <li class="list-group-item py-0">
                            <div className="row">
                                <div className="col-10">
                                    <label className="">Memorias de diseño de estructuras metálicas</label>
                                </div>
                                <div className="col-2">
                                    <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s43312', 'check', 7) ?? 1)} name="r_e_select_s43312"
                                        defaultValue={_GET_STEP_TYPE_INDEX('s43312', 'check', 7) ?? 1} onChange={() => manage_step_912()}>
                                        <option value="0" className="text-danger">NO CUMPLE</option>
                                        <option value="1" className="text-success">CUMPLE</option>
                                        <option value="2" className="text-warning">N/A</option>
                                    </select>
                                </div>
                            </div>
                        </li>
                        <li class="list-group-item py-0">
                            <div className="row">
                                <div className="col-10">
                                    <label className="">Memorias de otros diseños</label>
                                </div>
                                <div className="col-2">
                                    <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s43312', 'check', 8) ?? 1)} name="r_e_select_s43312"
                                        defaultValue={_GET_STEP_TYPE_INDEX('s43312', 'check', 8) ?? 1} onChange={() => manage_step_912()}>
                                        <option value="0" className="text-danger">NO CUMPLE</option>
                                        <option value="1" className="text-success">CUMPLE</option>
                                        <option value="2" className="text-warning">N/A</option>
                                    </select>
                                </div>
                            </div>
                        </li>
                    </ul>
                </> : ""}
            </>
        }
        let COMPONENT_03 = () => {
            return <>
                <ul class="list-group my-0 py-0">
                    <li class="list-group-item py-0">
                        <div className="row">
                            <div className="col-10">
                                <label className="">Coherencia técnica con los planos arquitectónicos</label>
                            </div>
                            <div className="col-2">
                                <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s433b', 'check', 0) ?? 1)} name="r_e_select_s433b"
                                    defaultValue={_GET_STEP_TYPE_INDEX('s433b', 'check', 0) ?? 1} onChange={() => manage_step_912()} >
                                    <option value="0" className="text-danger">NO CUMPLE</option>
                                    <option value="1" className="text-success">CUMPLE</option>
                                    <option value="2" className="text-warning">N/A</option>
                                </select>
                            </div>
                        </div>
                    </li>
                    <li class="list-group-item py-0">
                        <div className="row">
                            <div className="col-10">
                                <label className="">Coherencia con las memorias de cálculo</label>
                            </div>
                            <div className="col-2">
                                <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s433b', 'check', 1) ?? 1)} name="r_e_select_s433b"
                                    defaultValue={_GET_STEP_TYPE_INDEX('s433b', 'check', 1) ?? 1} onChange={() => manage_step_912()} >
                                    <option value="0" className="text-danger">NO CUMPLE</option>
                                    <option value="1" className="text-success">CUMPLE</option>
                                    <option value="2" className="text-warning">N/A</option>
                                </select>
                            </div>
                        </div>
                    </li>
                    <li class="list-group-item py-0">
                        <div className="row">
                            <div className="col-10">
                                <label className="">Especificaciones de materiales</label>
                            </div>
                            <div className="col-2">
                                <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s433b', 'check', 2) ?? 1)} name="r_e_select_s433b"
                                    defaultValue={_GET_STEP_TYPE_INDEX('s433b', 'check', 2) ?? 1} onChange={() => manage_step_912()} >
                                    <option value="0" className="text-danger">NO CUMPLE</option>
                                    <option value="1" className="text-success">CUMPLE</option>
                                    <option value="2" className="text-warning">N/A</option>
                                </select>
                            </div>
                        </div>
                    </li>
                    <li class="list-group-item py-0">
                        <div className="row">
                            <div className="col-10">
                                <label className="">Plantas de cimentación, entrepisos y cubierta</label>
                            </div>
                            <div className="col-2">
                                <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s433b', 'check', 3) ?? 1)} name="r_e_select_s433b"
                                    defaultValue={_GET_STEP_TYPE_INDEX('s433b', 'check', 3) ?? 1} onChange={() => manage_step_912()} >
                                    <option value="0" className="text-danger">NO CUMPLE</option>
                                    <option value="1" className="text-success">CUMPLE</option>
                                    <option value="2" className="text-warning">N/A</option>
                                </select>
                            </div>
                        </div>
                    </li>
                    <li class="list-group-item py-0">
                        <div className="row">
                            <div className="col-10">
                                <label className="">Detalle de losas de entrepiso</label>
                            </div>
                            <div className="col-2">
                                <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s433b', 'check', 4) ?? 1)} name="r_e_select_s433b"
                                    defaultValue={_GET_STEP_TYPE_INDEX('s433b', 'check', 4) ?? 1} onChange={() => manage_step_912()} >
                                    <option value="0" className="text-danger">NO CUMPLE</option>
                                    <option value="1" className="text-success">CUMPLE</option>
                                    <option value="2" className="text-warning">N/A</option>
                                </select>
                            </div>
                        </div>
                    </li>
                    <li class="list-group-item py-0">
                        <div className="row">
                            <div className="col-10">
                                <label className="">Diseño de cimentación</label>
                            </div>
                            <div className="col-2">
                                <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s433b', 'check', 5) ?? 1)} name="r_e_select_s433b"
                                    defaultValue={_GET_STEP_TYPE_INDEX('s433b', 'check', 5) ?? 1} onChange={() => manage_step_912()} >
                                    <option value="0" className="text-danger">NO CUMPLE</option>
                                    <option value="1" className="text-success">CUMPLE</option>
                                    <option value="2" className="text-warning">N/A</option>
                                </select>
                            </div>
                        </div>
                    </li>
                    <li class="list-group-item py-0">
                        <div className="row">
                            <div className="col-10">
                                <label className="">Diseño de columnas y muros</label>
                            </div>
                            <div className="col-2">
                                <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s433b', 'check', 6) ?? 1)} name="r_e_select_s433b"
                                    defaultValue={_GET_STEP_TYPE_INDEX('s433b', 'check', 6) ?? 1} onChange={() => manage_step_912()} >
                                    <option value="0" className="text-danger">NO CUMPLE</option>
                                    <option value="1" className="text-success">CUMPLE</option>
                                    <option value="2" className="text-warning">N/A</option>
                                </select>
                            </div>
                        </div>
                    </li>
                    <li class="list-group-item py-0">
                        <div className="row">
                            <div className="col-10">
                                <label className="">Diseño de vigas</label>
                            </div>
                            <div className="col-2">
                                <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s433b', 'check', 7) ?? 1)} name="r_e_select_s433b"
                                    defaultValue={_GET_STEP_TYPE_INDEX('s433b', 'check', 7) ?? 1} onChange={() => manage_step_912()} >
                                    <option value="0" className="text-danger">NO CUMPLE</option>
                                    <option value="1" className="text-success">CUMPLE</option>
                                    <option value="2" className="text-warning">N/A</option>
                                </select>
                            </div>
                        </div>
                    </li>
                    <li class="list-group-item py-0">
                        <div className="row">
                            <div className="col-10">
                                <label className="">Diseño de viguetas</label>
                            </div>
                            <div className="col-2">
                                <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s433b', 'check', 8) ?? 1)} name="r_e_select_s433b"
                                    defaultValue={_GET_STEP_TYPE_INDEX('s433b', 'check', 8) ?? 1} onChange={() => manage_step_912()} >
                                    <option value="0" className="text-danger">NO CUMPLE</option>
                                    <option value="1" className="text-success">CUMPLE</option>
                                    <option value="2" className="text-warning">N/A</option>
                                </select>
                            </div>
                        </div>
                    </li>
                    <li class="list-group-item py-0">
                        <div className="row">
                            <div className="col-10">
                                <label className="">Detalles de cubierta (elementos de cubierta, conexiones)</label>
                            </div>
                            <div className="col-2">
                                <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s433b', 'check', 9) ?? 1)} name="r_e_select_s433b"
                                    defaultValue={_GET_STEP_TYPE_INDEX('s433b', 'check', 9) ?? 1} onChange={() => manage_step_912()} >
                                    <option value="0" className="text-danger">NO CUMPLE</option>
                                    <option value="1" className="text-success">CUMPLE</option>
                                    <option value="2" className="text-warning">N/A</option>
                                </select>
                            </div>
                        </div>
                    </li>
                    <li class="list-group-item py-0">
                        <div className="row">
                            <div className="col-10">
                                <label className="">Diseño de escaleras</label>
                            </div>
                            <div className="col-2">
                                <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s433b', 'check', 10) ?? 1)} name="r_e_select_s433b"
                                    defaultValue={_GET_STEP_TYPE_INDEX('s433b', 'check', 10) ?? 1} onChange={() => manage_step_912()} >
                                    <option value="0" className="text-danger">NO CUMPLE</option>
                                    <option value="1" className="text-success">CUMPLE</option>
                                    <option value="2" className="text-warning">N/A</option>
                                </select>
                            </div>
                        </div>
                    </li>
                    <li class="list-group-item py-0">
                        <div className="row">
                            <div className="col-10">
                                <label className="">Detalle y refuerzo de tanques</label>
                            </div>
                            <div className="col-2">
                                <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s433b', 'check', 11) ?? 1)} name="r_e_select_s433b"
                                    defaultValue={_GET_STEP_TYPE_INDEX('s433b', 'check', 11) ?? 1} onChange={() => manage_step_912()} >
                                    <option value="0" className="text-danger">NO CUMPLE</option>
                                    <option value="1" className="text-success">CUMPLE</option>
                                    <option value="2" className="text-warning">N/A</option>
                                </select>
                            </div>
                        </div>
                    </li>
                    <li class="list-group-item py-0">
                        <div className="row">
                            <div className="col-10">
                                <label className="">Detalle y refuerzo estructuras de contención</label>
                            </div>
                            <div className="col-2">
                                <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s433b', 'check', 12) ?? 1)} name="r_e_select_s433b"
                                    defaultValue={_GET_STEP_TYPE_INDEX('s433b', 'check', 12) ?? 1} onChange={() => manage_step_912()} >
                                    <option value="0" className="text-danger">NO CUMPLE</option>
                                    <option value="1" className="text-success">CUMPLE</option>
                                    <option value="2" className="text-warning">N/A</option>
                                </select>
                            </div>
                        </div>
                    </li>
                    <li class="list-group-item py-0">
                        <div className="row">
                            <div className="col-10">
                                <label className="">Diseños de elementos no estructurales</label>
                            </div>
                            <div className="col-2">
                                <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s433b', 'check', 13) ?? 1)} name="r_e_select_s433b"
                                    defaultValue={_GET_STEP_TYPE_INDEX('s433b', 'check', 13) ?? 1} onChange={() => manage_step_912()} >
                                    <option value="0" className="text-danger">NO CUMPLE</option>
                                    <option value="1" className="text-success">CUMPLE</option>
                                    <option value="2" className="text-warning">N/A</option>
                                </select>
                            </div>
                        </div>
                    </li>
                    <li class="list-group-item py-0">
                        <div className="row">
                            <div className="col-10">
                                <label className="">Firma del ingeniero geotecnista en plano de cimentación (H.1.1.2.1)</label>
                            </div>
                            <div className="col-2">
                                <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s433b', 'check', 14) ?? 1)} name="r_e_select_s433b"
                                    defaultValue={_GET_STEP_TYPE_INDEX('s433b', 'check', 14) ?? 1} onChange={() => manage_step_912()} >
                                    <option value="0" className="text-danger">NO CUMPLE</option>
                                    <option value="1" className="text-success">CUMPLE</option>
                                    <option value="2" className="text-warning">N/A</option>
                                </select>
                            </div>
                        </div>
                    </li>
                    {version === 2 ? <>
                        <li class="list-group-item py-0">
                            <div className="row">
                                <div className="col-10">
                                    <label className="">Firma del profesional responsable en cada documento entregado</label>
                                </div>
                                <div className="col-2">
                                    <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s433b', 'check', 15) ?? 1)} name="r_e_select_s433b"
                                        defaultValue={_GET_STEP_TYPE_INDEX('s433b', 'check', 15) ?? 1} onChange={() => manage_step_912()} >
                                        <option value="0" className="text-danger">NO CUMPLE</option>
                                        <option value="1" className="text-success">CUMPLE</option>
                                        <option value="2" className="text-warning">N/A</option>
                                    </select>
                                </div>
                            </div>
                        </li>
                        <li class="list-group-item py-0">
                            <div className="row">
                                <div className="col-10">
                                    <label className="">Firma del revisor independiente en todo lo relacionado con el componente estructural</label>
                                </div>
                                <div className="col-2">
                                    <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s433b', 'check', 16) ?? 1)} name="r_e_select_s433b"
                                        defaultValue={_GET_STEP_TYPE_INDEX('s433b', 'check', 16) ?? 1} onChange={() => manage_step_912()} >
                                        <option value="0" className="text-danger">NO CUMPLE</option>
                                        <option value="1" className="text-success">CUMPLE</option>
                                        <option value="2" className="text-warning">N/A</option>
                                    </select>
                                </div>
                            </div>
                        </li>
                        <li class="list-group-item py-0">
                            <div className="row">
                                <div className="col-10">
                                    <label className="">Firma del director de obra en planos y memorias de elementos no estructurales (A.1.3.6.5)</label>
                                </div>
                                <div className="col-2">
                                    <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s433b', 'check', 17) ?? 1)} name="r_e_select_s433b"
                                        defaultValue={_GET_STEP_TYPE_INDEX('s433b', 'check', 17) ?? 1} onChange={() => manage_step_912()} >
                                        <option value="0" className="text-danger">NO CUMPLE</option>
                                        <option value="1" className="text-success">CUMPLE</option>
                                        <option value="2" className="text-warning">N/A</option>
                                    </select>
                                </div>
                            </div>
                        </li>
                        <li class="list-group-item py-0">
                            <div className="row">
                                <div className="col-10">
                                    <label className="">Firma del director de obra en el informe de demolición</label>
                                </div>
                                <div className="col-2">
                                    <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s433b', 'check', 18) ?? 1)} name="r_e_select_s433b"
                                        defaultValue={_GET_STEP_TYPE_INDEX('s433b', 'check', 18) ?? 1} onChange={() => manage_step_912()} >
                                        <option value="0" className="text-danger">NO CUMPLE</option>
                                        <option value="1" className="text-success">CUMPLE</option>
                                        <option value="2" className="text-warning">N/A</option>
                                    </select>
                                </div>
                            </div>
                        </li>
                    </>
                        : null}
                </ul>
            </>
        }
        let ESTRUCTURALES = () => {
            return <>
                <div className="row border py-2 my-2">
                    <div className="col-10">
                        <label className="fw-bold">Paso 1. CHEQUEO DE VIGAS</label>
                    </div>
                    <div className="col-2">
                        <select className='form-select form-control form-control-sm' name="use_estructural"
                            defaultValue={_GET_STEP_TYPE_INDEX('use_estructural', 'check', 0) ?? 0} onChange={() => manage_step_ESTRUCTURAL()} >
                            <option value="0">NO USAR</option>
                            <option value="1">USAR</option>
                        </select>
                    </div>
                </div>

                {_GET_STEP_TYPE_INDEX('use_estructural', 'check', 0) == 1 ? <>
                    <div className="row">
                        <div className="col-10">
                            <label className="fw-bold">Requisitos geometricos (Articulo C.21 NSR10)</label>
                        </div>
                    </div>
                    {ESTRUCTURAL_P1.map(i => ESTRUCTURAL_COMPONENT(i, "estructural_p1", manage_step_ESTRUCTURAL_P1))}


                </> : null}

                <div className="row border pycantidad-2 my-2">
                    <div className="col-10">
                        <label className="fw-bold">Paso 2. CHEQUEO DE COLUMNAS</label>
                    </div>
                    <div className="col-2">
                        <select className='form-select form-control form-control-sm' name="use_estructural"
                            defaultValue={_GET_STEP_TYPE_INDEX('use_estructural', 'check', 1) ?? 0} onChange={() => manage_step_ESTRUCTURAL()} >
                            <option value="0">NO USAR</option>
                            <option value="1">USAR</option>
                        </select>
                    </div>
                </div>

                {_GET_STEP_TYPE_INDEX('use_estructural', 'check', 1) == 1 ? <>
                    {ESTRUCTURAL_P2.map(i => ESTRUCTURAL_COMPONENT(i, "estructural_p2", manage_step_ESTRUCTURAL_P2))}
                </> : null}

                <div className="row border py-2 my-2">
                    <div className="col-10">
                        <label className="fw-bold">Paso 3. CHEQUEO DE MUROS</label>
                    </div>
                    <div className="col-2">
                        <select className='form-select form-control form-control-sm' name="use_estructural"
                            defaultValue={_GET_STEP_TYPE_INDEX('use_estructural', 'check', 2) ?? 0} onChange={() => manage_step_ESTRUCTURAL()} >
                            <option value="0">NO USAR</option>
                            <option value="1">USAR</option>
                        </select>
                    </div>
                </div>

                {_GET_STEP_TYPE_INDEX('use_estructural', 'check', 2) == 1 ? <>
                    {ESTRUCTURAL_P3.map(i => ESTRUCTURAL_COMPONENT(i, "estructural_p3", manage_step_ESTRUCTURAL_P3))}
                </> : null}
            </>
        }
        // FUNCTIONS AND APIS
        //var formData = new FormData();

        let manage_step_ESTRUCTURAL_P1 = (e) => {
            if (e) e.preventDefault();
            var formData = new FormData();

            let checks = [];
            let values = [];
            formData = new FormData();

            let max_i = 0
            ESTRUCTURAL_P1.map(paso => {
                if (document.getElementById('estructural_p1_c_' + paso.c)) checks.push(document.getElementById('estructural_p1_c_' + paso.c).value)
                if (paso.i) {
                    if (paso.calc) document.getElementById('estructural_p1_' + paso.i).value = paso.calc()
                    max_i += 1
                }
                if (paso.i2) {
                    max_i += 1
                }
                if (paso.i3) {
                    if (paso.cacl3) document.getElementById('estructural_p1_' + paso.i3).value = paso.cacl3()
                    max_i += 1
                }
            })

            for (let i = 0; i <= max_i; i++) {
                if (document.getElementById('estructural_p1_' + i)) values.push(document.getElementById('estructural_p1_' + i).value)

            }

            formData.set('value', values.join(';'));
            formData.set('check', checks.join(';'));

            formData.set('version', currentVersionR);
            formData.set('recordEngId', currentRecord.id);
            formData.set('id_public', 'estructural_p1');
            save_step('estructural_p1', false, formData);
        }

        let manage_step_ESTRUCTURAL_P2 = (e) => {
            if (e) e.preventDefault();
            var formData = new FormData();

            let checks = [];
            let values = [];
            formData = new FormData();

            let max_i = 0
            ESTRUCTURAL_P2.map(paso => {
                if (document.getElementById('estructural_p2_c_' + paso.c)) checks.push(document.getElementById('estructural_p2_c_' + paso.c).value)
                if (paso.i) {
                    if (paso.calc) document.getElementById('estructural_p2_' + paso.i).value = paso.calc()
                    max_i += 1
                }
                if (paso.i2) {
                    max_i += 1
                }
            })

            for (let i = 0; i < max_i; i++) {
                if (document.getElementById('estructural_p2_' + i)) values.push(document.getElementById('estructural_p2_' + i).value)
            }

            formData.set('value', values.join(';'));
            formData.set('check', checks.join(';'));

            formData.set('version', currentVersionR);
            formData.set('recordEngId', currentRecord.id);
            formData.set('id_public', 'estructural_p2');
            save_step('estructural_p2', false, formData);
        }

        let manage_step_ESTRUCTURAL_P3 = (e) => {
            if (e) e.preventDefault();
            var formData = new FormData();

            let checks = [];
            let values = [];
            formData = new FormData();

            let max_i = 0
            ESTRUCTURAL_P3.map(paso => {
                if (document.getElementById('estructural_p3_c_' + paso.c)) checks.push(document.getElementById('estructural_p3_c_' + paso.c).value)
                if (paso.i) {
                    if (paso.calc) document.getElementById('estructural_p3_' + paso.i).value = paso.calc()
                    max_i += 1
                }
            })

            for (let i = 0; i < max_i; i++) {
                if (document.getElementById('estructural_p3_' + i)) values.push(document.getElementById('estructural_p3_' + i).value)
            }

            formData.set('value', values.join(';'));
            formData.set('check', checks.join(';'));

            formData.set('version', currentVersionR);
            formData.set('recordEngId', currentRecord.id);
            formData.set('id_public', 'estructural_p3');
            save_step('estructural_p3', false, formData);
        }

        let manage_step_912 = (e) => {
            if (e) e.preventDefault();
            var formData = new FormData();

            let checks = [];
            let values = [];
            formData = new FormData();


            checks = [];
            var checks_2 = document.getElementsByName('r_e_select_s433');
            for (var i = 0; i < checks_2.length; i++) {
                checks.push(checks_2[i].value)
            }
            formData.set('check', checks.join(';'));

            formData.set('version', currentVersionR);
            formData.set('recordEngId', currentRecord.id);
            formData.set('id_public', 's433');
            save_step('s433', false, formData);

            formData = new FormData();
            checks = [];
            checks_2 = document.getElementsByName('r_e_select_s433b');
            for (var i = 0; i < checks_2.length; i++) {
                checks.push(checks_2[i].value)
            }
            formData.set('check', checks.join(';'));

            formData.set('version', currentVersionR);
            formData.set('recordEngId', currentRecord.id);
            formData.set('id_public', 's433b');
            save_step('s433b', false, formData);

            formData = new FormData();
            checks = [];
            checks_2 = document.getElementsByName('r_e_select_s43312');
            for (var i = 0; i < checks_2.length; i++) {
                checks.push(checks_2[i].value)
            }
            formData.set('check', checks.join(';'));

            formData.set('version', currentVersionR);
            formData.set('recordEngId', currentRecord.id);
            formData.set('id_public', 's43312');
            save_step('s43312', false, formData);

            formData = new FormData();
            checks = [];
            checks_2 = document.getElementsByName('r_e_select_s43311');
            for (var i = 0; i < checks_2.length; i++) {
                checks.push(checks_2[i].value)
            }
            formData.set('check', checks.join(';'));

            formData.set('version', currentVersionR);
            formData.set('recordEngId', currentRecord.id);
            formData.set('id_public', 's43311');
            save_step('s43311', false, formData);

            formData = new FormData();
            checks = [];
            checks_2 = document.getElementsByName('r_e_select_s43310');
            for (var i = 0; i < checks_2.length; i++) {
                checks.push(checks_2[i].value)
            }
            formData.set('check', checks.join(';'));

            formData.set('version', currentVersionR);
            formData.set('recordEngId', currentRecord.id);
            formData.set('id_public', 's43310');
            save_step('s43310', false, formData);

            formData = new FormData();
            checks = [];
            checks_2 = document.getElementsByName('r_e_select_s43310_22');
            for (var i = 0; i < checks_2.length; i++) {
                checks.push(checks_2[i].value)
            }
            formData.set('check', checks.join(';'));

            formData.set('version', currentVersionR);
            formData.set('recordEngId', currentRecord.id);
            formData.set('id_public', 's43310_22');
            save_step('s43310_22', false, formData);

            formData = new FormData();
            checks = [];

            PASO_10_VERSION_2.map(item => {
                values.push(document.getElementById("s43310_21_" + item.i).value)
                if (item.c != undefined) checks.push(document.getElementById("s43310_21_c_" + item.c).value)
            })
            formData.set('check', checks.join(';'));
            formData.set('value', values.join(';'));

            formData.set('version', currentVersionR);
            formData.set('recordEngId', currentRecord.id);
            formData.set('id_public', 's43310_21');
            save_step('s43310_21', false, formData);

        }

        let manage_step_ESTRUCTURAL = (e) => {
            if (e) e.preventDefault();
            var formData = new FormData();

            let checks = [];
            let values = [];
            formData = new FormData();


            checks = [];
            var checks_2 = document.getElementsByName('use_estructural');
            for (var i = 0; i < checks_2.length; i++) {
                checks.push(checks_2[i].value)
            }
            formData.set('check', checks.join(';'));

            formData.set('version', currentVersionR);
            formData.set('recordEngId', currentRecord.id);
            formData.set('id_public', 'use_estructural');
            save_step('use_estructural', false, formData);
        }

        let save_step = (_id_public, useSwal, formData) => {
            var STEP = LOAD_STEP(_id_public);

            if (useSwal) MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            if (STEP.id) {
                RECORD_ENG_SERVICE.update_step(STEP.id, formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            if (useSwal) MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            this.props.requestUpdateRecord(currentItem.id);
                        } else {
                            if (useSwal) MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        if (useSwal) MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    });
            }
            else {
                RECORD_ENG_SERVICE.create_step(formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            if (useSwal) MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            this.props.requestUpdateRecord(currentItem.id);
                        } else {
                            if (useSwal) MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        if (useSwal) MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    });
            }
        }

        return (
            <div className="record_eng_desc container">
                <hr />
                {COMPONENT_912()}
                {COMPONENT_02()}
                {(!version && SUBCATEGORIES[14] == 1)
                    || (version === 2 && SUBCATEGORIES[15] == 1)
                    ? <>
                        <legend className="my-3 px-3 text-uppercase bg-light" id="record_eng_433">
                            <label className="app-p lead fw-normal text-uppercase">4.3.3 Planos Estructurales</label>
                        </legend>
                        {COMPONENT_03()}

                    </> : ""}
            </div >
        );
    }
}

export default RECORD_ENG_STEP_433;