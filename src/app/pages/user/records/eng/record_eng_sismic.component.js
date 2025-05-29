import { MDBBtn, MDBDropdown, MDBDropdownItem, MDBDropdownLink, MDBDropdownMenu, MDBDropdownToggle, MDBPopover, MDBPopoverBody, MDBPopoverHeader, MDBTooltip } from 'mdb-react-ui-kit';
import React, { Component } from 'react';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import RECORD_ENG_SERVICE from '../../../../services/record_eng.service'

const MySwal = withReactContent(Swal);

class RECORD_ENG_SISMIC extends Component {
    constructor(props) {
        super(props);
        this.state = {
            new: false,
            edit: false,
            sort: 'desc',
        };
    }
    componentDidMount() {
        this.set_values();
    }
    get_d233() {
        let d232 = document.getElementById('d232') ? document.getElementById('d232').value : 0;
        d232 = Number(d232);
        let op = 0;
        if (d232 < 0.5) op = 1;
        else if (d232 < 2.5) op = 0.75 + 0.5 * d232;
        else op = 2;

        op = Number(op).toFixed(2)
        return op;
    }
    set_d231() {
        var op = this._GET_STEP_TYPE_INDEX('s4237', 'value', 20) ?? this._GET_STEP_TYPE_INDEX('s4238', 'value', 0) ?? ''
        if (document.getElementById('d231')) document.getElementById('d231').value = op;
    }
    set_d232() {
        let d232 = document.getElementById('d232') ? document.getElementById('d232').value : 0;
        d232 = Number(d232);
        let op = 0;
        if (d232 < 0.5) op = 1;
        else if (d232 < 2.5) op = 0.75 + 0.5 * d232;
        else op = 2;

        op = Number(op).toFixed(2)
        if (document.getElementById('d233')) document.getElementById('d233').value = op;
    }
    set_d233() {
        let d232 = document.getElementById('d232') ? document.getElementById('d232').value : 0;
        d232 = Number(d232);
        let op = 0;
        if (d232 < 0.5) op = 1;
        else if (d232 < 2.5) op = 0.75 + 0.5 * d232;
        else op = 2;

        op = Number(op).toFixed(2)
        if (document.getElementById('d233')) document.getElementById('d233').value = op;
    }
    set_d236() {
        let d231 = document.getElementById('d231') ? document.getElementById('d231').value : 0;
        let tot = 0;
        let _LIST = this._GET_CHILD_SISMIC();
        for (var i = 0; i < _LIST.length; i++) {
            let condition = String(_LIST[i].name).toLowerCase().includes('piso 1');
            if (!condition) {
                tot += Number(this._get_TOT(_LIST[i]))
            }
        }

        let op = d231 * tot;
        op = Number(op).toFixed(2)
        if (document.getElementById('d236')) document.getElementById('d236').value = op;
    }
    get_d236() {
        let d231 = document.getElementById('d231') ? document.getElementById('d231').value : 0;
        let tot = 0;
        let _LIST = this._GET_CHILD_SISMIC();
        for (var i = 0; i < _LIST.length; i++) {
            let condition = String(_LIST[i].name).toLowerCase().includes('piso 1');
            if (!condition) {
                tot += Number(this._get_TOT(_LIST[i]))
            }
        }

        let op = d231 * tot;
        op = Number(op).toFixed(2)
        return op;
    }
    set_d237() {
        let d236 = document.getElementById('d236') ? document.getElementById('d236').value : 0;
        let op = d236 / 10;
        op = Number(op).toFixed(2)
        this.setState({ d237: op })
        if (document.getElementById('d237')) document.getElementById('d237').value = op;
    }
    set_values() {
        this.set_d231();
        this.set_d232();
        this.set_d233();
        this.set_d236();
        this.set_d237();
    }
    // DATA GETTERS
    _GET_CHILD_SISMIC = () => {
        var _CHILD = this.props.currentRecord.record_eng_sismics;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
    }
    LOAD_STEP(_id_public) {
        var _CHILD = this.props.currentRecord.record_eng_steps;
        for (var i = 0; i < _CHILD.length; i++) {
            if (_CHILD[i].version == this.props.currentVersionR && _CHILD[i].id_public == _id_public) return _CHILD[i]
        }
        return []
    }
    // DATA CONVERTERS
    _GET_STEP_TYPE_INDEX = (_id_public, _type, _index) => {
        var STEP = this.LOAD_STEP(_id_public);
        if (!STEP) return null;
        if (!STEP['id']) return null;
        var value = STEP[_type]
        if (!value) return null;
        value = value.split(';');
        return value[_index]
    }
    _GET_DENPLAC_VALUE = () => {
        return this._GET_STEP_TYPE_INDEX('s4322', 'value', 30);
    }
    _GET_PESOPLAC_VALUE = (row) => {
        if (!row.area || !row.name) return '';
        let area = row.area;
        let denplac = row.denplac;
        return Number(area * denplac).toFixed(2);
    }
    _get_COLPAN_VALUE = (row) => {
        let wc = this._GET_STEP_TYPE_INDEX('sis_wc', 'value', 0) ?? 24;
        let column;
        column = JSON.parse(row.column);
        column = JSON.parse(column);
        if (!column) column = { n: 9, c1: 0.3, c2: 0.3 }
        return Number(row.height * column.c1 * column.c2 * column.n * wc).toFixed(2);
    }
    _get_VIGA = (height) => {
        let wc = this._GET_STEP_TYPE_INDEX('sis_wc', 'value', 0) ?? 24;
        return Number(height * 0.3 * 0.3 * 9 * wc * 0.85).toFixed(2);
    }
    _get_TOT = (row) => {
        let pesoplac = this._GET_PESOPLAC_VALUE(row);
        let colpan = this._get_COLPAN_VALUE(row)
        let viga = this._get_VIGA(row.height)
        let esca = row.esca;
        let sum = Number(pesoplac) + Number(colpan) + Number(viga) + Number(esca);
        return (sum).toFixed(2)
    }
    _get_WIHIK = (row) => {
        var k = this.get_d233() || this._GET_STEP_TYPE_INDEX('s4238', 'value', 2) || 1;
        //var hi = Math.abs(this._get_SUMLEVEL(row.id, row.name, true));
        var hi = Number(row.height);
        var wi = this._get_TOT(row);
        let op = wi * Math.pow(hi, k);
        op = Number(op).toFixed(2)
        return op;
    }
    _get_CVI = (row) => {
        var wihik = this._get_WIHIK(row);
        var wihik_total = this._GET_TOTAL().wihik;
        let op = wihik / wihik_total;
        op = Number(op).toFixed(3)
        return op;
    }
    _get_F_x = (row) => {
        var cvi = this._get_CVI(row);
        let d236 = document.getElementById('d236') ? Number(document.getElementById('d236').value) ? Number(document.getElementById('d236').value) : 1 : 1;
        let op = cvi * d236 || this.get_d236();
        op = Number(op).toFixed(2)
        return op;
    }
    _get_F_y = (row) => {
        var f_x = this._get_F_x(row);
        let op = f_x * 0.3;
        op = Number(op).toFixed(2)
        return op;
    }
    _get_SUMLEVEL = (_id, _floor, includeP1) => {
        let _CHILDREN = this._GET_CHILD_SISMIC();
        _CHILDREN.sort((a, b) => a.pos - b.pos);

        let floor = _floor ? _floor.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : '';
        let con_up = (floor).includes('piso') || (floor).includes('nivel') || (floor).includes('planta') || (floor).includes('cubierta') || (floor).includes('atico');
        let con_down = (floor).includes('sotano') || (floor).includes('semisotano');
        let con_n = (floor).replace(/^\D+/g, '') == 1;

        if (con_up && con_n && !includeP1) return 0;

        let index = -1;
        let sum = 0

        if (con_up) {
            _CHILDREN = _CHILDREN.filter(item => {
                let floor = item.name ? item.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : '';
                let con_floor = (floor).includes('piso') || (floor).includes('nivel') || (floor).includes('planta') || (floor).includes('cubierta') || (floor).includes('atico');
                return con_floor;
            })

            _CHILDREN.map((item, i) => { if (item.id == _id) index = i })

            _CHILDREN.map((item, i) => { if (i <= index) sum += Number(item.height) })

            return (sum).toFixed(2);

        }
        if (con_down) {
            _CHILDREN = _CHILDREN.filter(item => {
                let floor = item.name ? item.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : '';
                let con_floor = (floor).includes('sotano') || (floor).includes('semisotano');
                return con_floor;
            })

            _CHILDREN.reverse();

            _CHILDREN.map((item, i) => { if (item.id == _id) index = i })

            _CHILDREN.map((item, i) => { if (i <= index) sum -= Number(item.height) })

            return (sum).toFixed(2);

        }
    }
    _GET_TOTAL = () => {
        var _LIST = this._GET_CHILD_SISMIC();
        let d237 = this.state.d237 ?? 1;
        let d236 = document.getElementById('d236') ? Number(document.getElementById('d236').value) ? Number(document.getElementById('d236').value) : 1 : 1;

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
            _TOTALES.pesoplac += Number(this._GET_PESOPLAC_VALUE(_LIST[i]));
            _TOTALES.colpan += Number(this._get_COLPAN_VALUE(_LIST[i]));
            _TOTALES.viga += Number(this._get_VIGA(Math.abs(_LIST[i].height)));
            _TOTALES.esca += Number(_LIST[i].esca);
            _TOTALES.wihik += Number(this._get_WIHIK(_LIST[i]));
            _TOTALES.tot += Number(this._get_TOT(_LIST[i]));
        }

        // THIS IS DONE IN ORDER TO PREVENT RECURSION
        for (var i = 0; i < _LIST.length; i++) {
            let condition = _LIST[i].pos == 1;
            if (condition) continue;
            let d231 = this._GET_STEP_TYPE_INDEX('s4237', 'value', 20) || 1

            let cvi = Number(this._get_WIHIK(_LIST[i])) / Number(_TOTALES.wihik);
            _TOTALES.cvi += cvi
            _TOTALES.f_x += cvi * Number(this.get_d236());
            _TOTALES.f_y += cvi * Number(this.get_d236()) * 0.3;
        }


        return _TOTALES;
    }
    componentDidUpdate(prevState) {
        if (this.state.edit !== prevState.edit && this.state.edit != false) {
            var _ITEM = this.state.edit;

            document.getElementById("r_eng_sismic_1_edit").value = _ITEM.name;
            document.getElementById("r_eng_sismic_2_edit").value = _ITEM.height;
            document.getElementById("r_eng_sismic_3_edit").value = _ITEM.area;
            document.getElementById("r_eng_sismic_4_edit").value = _ITEM.esca;
            document.getElementById("r_eng_sismic_5_edit").value = _ITEM.pos;
            document.getElementById("r_eng_sismic_6_edit").value = _ITEM.denplac;

            let column;
            column = JSON.parse(_ITEM.column);
            column = JSON.parse(column);
            if (!column) column = { n: 9, c1: 0.3, c2: 0.3 }

            document.getElementById("r_eng_sismic_column_1_edit").value = column.n;
            document.getElementById("r_eng_sismic_column_2_edit").value = column.c1;
            document.getElementById("r_eng_sismic_column_3_edit").value = column.c2;
        }
    }

    // EXTRA ACTIONS

    async new_x(dir, pos, isCopy) {
        let op = '-1';
        let x = 1;
        let sort = this.state.sort;

        if (dir == 'up' && sort == 'asc') op = '-1';
        else if (dir == 'dw' && sort == 'asc') op = '0';

        else if (dir == 'up' && sort == 'desc') op = '-1';
        else if (dir == 'dw' && sort == 'desc') op = '0';

        const { value: formValues } = await MySwal.fire({
            title: `${isCopy ? 'COPIAR' : 'AÑADIR'} ITEMS`,
            input: 'text',
            icon: 'question',
            confirmButtonText: `${isCopy ? 'COPIAR' : 'AÑADIR'}`,
            inputLabel: `Especifique la cantidad de Items a ${isCopy ? 'copiar' : 'añadir'}`,
            inputValue: '1',
            showCancelButton: true,
            cancelButtonText: "CANCELAR",
            inputValidator: (value) => {
                let n = Number(value)
                let conditions = n && n > 0 && Number.isInteger(n)
                if (!conditions) {
                    return 'Valor no valido'
                }
            }
        })

        if (Number(formValues)) {
            x = Number(formValues);

            var formData = new FormData();
            formData.set('recordEngId', this.props.currentRecord.id);
            formData.set('op', op);
            formData.set('x', x);
            formData.set('pos', pos);
            formData.set('sort', String(sort).toUpperCase());
            if (isCopy) formData.set('copy', 1);

            MySwal.fire({
                title: this.props.swaMsg.title_wait,
                text: this.props.swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });

            RECORD_ENG_SERVICE.create_xsis(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: this.props.swaMsg.publish_success_title,
                            text: this.props.swaMsg.publish_success_text,
                            footer: this.props.swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: this.props.swaMsg.text_btn,
                        });
                        this.props.requestUpdateRecord(this.props.currentItem.id);
                        this.setState({ edit: false });
                    } else {
                        MySwal.fire({
                            title: this.props.swaMsg.generic_eror_title,
                            text: this.props.swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: this.props.swaMsg.text_btn,
                        });
                    }
                })
                .catch(e => {
                    console.log(e);
                    MySwal.fire({
                        title: this.props.swaMsg.generic_eror_title,
                        text: this.props.swaMsg.generic_error_text,
                        icon: 'warning',
                        confirmButtonText: this.props.swaMsg.text_btn,
                    });
                });
        }


    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, version } = this.props;
        const { } = this.state;
        const SUBCATEGORIES = currentRecord.subcategory ? currentRecord.subcategory.split(';') : [];

        const SISMIC_ELASTIC_DATA_01_X = [
            { i: 0, name: 'Tx modal', open: true, calc: () => null },
            {
                i: 1, name: 'Tajuste x', calc: () => {
                    let tx_modal = this._GET_STEP_TYPE_INDEX('elastic_sismi', 'value', 0) || document.getElementById('rees_01_0').valie || 0;
                    let ta_usado = Number(this._GET_STEP_TYPE_INDEX('s4237', 'value', 8)) || 0;
                    let t_max = Number(this._GET_STEP_TYPE_INDEX('s4237', 'value', 7)) || 0;

                    if (tx_modal < ta_usado) return ta_usado.toFixed(2)
                    if (tx_modal > t_max) return t_max.toFixed(2)
                    return tx_modal.toFixed(2)
                }
            },
            {
                i: 2, name: 'SaX(g)', calc: () => {
                    let Tajuste = Number(this._GET_STEP_TYPE_INDEX('elastic_sismi', 'value', 1)) || document.getElementById('rees_01_1').valie || 0;
                    let tc = this._GET_STEP_TYPE_INDEX('s4237', 'value', 12) || 0;
                    let Aa = this._GET_STEP_TYPE_INDEX('s4233', 'value', 0) || 0;
                    let Fa = this._GET_STEP_TYPE_INDEX('s4313', 'value', 19) || 0;
                    let Ci = this._GET_STEP_TYPE_INDEX('s4234', 'value', 2) || 0;
                    let Av = this._GET_STEP_TYPE_INDEX('s4233', 'value', 1) || 0;
                    let Fv = this._GET_STEP_TYPE_INDEX('s4313', 'value', 20) || 0;

                    if (Tajuste < tc) return (2.5 * Aa * Fa * Ci).toFixed(2);
                    return (1.2 * Av * Fv * Ci / (Tajuste || 1)).toFixed(2);
                }
            },
            {
                i: 3, name: 'VsX ton', calc: () => {
                    let tot = this._GET_TOTAL().tot;
                    let SaX = this._GET_STEP_TYPE_INDEX('elastic_sismi', 'value', 2) || document.getElementById('rees_01_2').valie || 0;

                    return (tot / 9.80665 * SaX).toFixed(2);
                }
            },
            {
                i: 4, name: 'VsY * g', calc: () => {
                    let VsX = this._GET_STEP_TYPE_INDEX('elastic_sismi', 'value', 3) || document.getElementById('rees_01_3').valie || 0;
                    return (VsX * 9.81).toFixed(2);
                }
            },
            {
                i: 5, name: '90ntaX%', calc: () => {
                    // =(C256/100)*D236
                    let ajuste = 0; // C256
                    let VsX = this._GET_STEP_TYPE_INDEX('elastic_sismi', 'value', 3) || document.getElementById('rees_01_3').valie || 0; // D236

                    return (ajuste / 100.0 * VsX).toFixed(2);
                }
            },
            {
                i: 6, name: '90ntaX% * g', calc: () => {
                    let _90nta = this._GET_STEP_TYPE_INDEX('elastic_sismi', 'value', 5) || document.getElementById('rees_01_5').valie || 0;
                    return (_90nta * 9.81).toFixed(2);
                }
            },
        ];

        const SISMIC_ELASTIC_DATA_01_Y = [
            { i: 7, name: 'Ty modal', open: true, calc: () => null },
            {
                i: 8, name: 'Tajuste y', calc: () => {
                    let ty_modal = this._GET_STEP_TYPE_INDEX('elastic_sismi', 'value', 7) || document.getElementById('rees_01_7').valie || 0;
                    let ta_usado = Number(this._GET_STEP_TYPE_INDEX('s4237', 'value', 8)) || 0;
                    let t_max = Number(this._GET_STEP_TYPE_INDEX('s4237', 'value', 7)) || 0;

                    if (ty_modal < ta_usado) return ta_usado.toFixed(2);
                    if (ty_modal > t_max) return t_max.toFixed(2);
                    return ty_modal.toFixed(2);
                }
            },
            {
                i: 9, name: 'SaY[g]', calc: () => {
                    let Tajuste = Number(this._GET_STEP_TYPE_INDEX('elastic_sismi', 'value', 1)) || document.getElementById('rees_01_1').valie || 0; // D234
                    let tc = this._GET_STEP_TYPE_INDEX('s4237', 'value', 12) || 0; // K220
                    let Aa = this._GET_STEP_TYPE_INDEX('s4233', 'value', 0) || 0; // E113
                    let Fa = this._GET_STEP_TYPE_INDEX('s4313', 'value', 19) || 0; // E123
                    let Ci = this._GET_STEP_TYPE_INDEX('s4234', 'value', 2) || 0; // H174
                    let Av = this._GET_STEP_TYPE_INDEX('s4233', 'value', 1) || 0; // I113
                    let Fv = this._GET_STEP_TYPE_INDEX('s4313', 'value', 20) || 0; // E124

                    if (Tajuste < tc) return (2.5 * Aa * Fa * Ci).toFixed(2);
                    return (1.2 * Av * Fv * Ci / (Tajuste || 1)).toFixed(2);
                }
            },
            {
                i: 10, name: 'VsY', calc: () => {
                    let tot = this._GET_TOTAL().tot; // M296
                    let SaX = this._GET_STEP_TYPE_INDEX('elastic_sismi', 'value', 2) || document.getElementById('rees_01_2').valie || 0; // D235

                    return (tot / 9.80665 * SaX).toFixed(2);
                }
            },
            {
                i: 11, name: 'VsY * g', calc: () => {
                    let VsY = this._GET_STEP_TYPE_INDEX('elastic_sismi', 'value', 10) || document.getElementById('rees_01_10').valie || 0;
                    return (VsY * 9.81).toFixed(2);
                }
            },
            {
                i: 12, name: '90ntaY%', calc: () => {
                    let ajuste = 0; // C256
                    let VsY = this._GET_STEP_TYPE_INDEX('elastic_sismi', 'value', 10) || document.getElementById('rees_01_10').valie || 0; // H236

                    return (ajuste / 100.0 * VsY).toFixed(2);
                }
            },
            {
                i: 13, name: '90nta%Y * g', calc: () => {
                    let _90ntaY = this._GET_STEP_TYPE_INDEX('elastic_sismi', 'value', 12) || document.getElementById('rees_01_12').valie || 0;
                    return (_90ntaY * 9.81).toFixed(2);
                }
            },
        ];

        const SISMIC_ELASTIC_DATA_01_Z = [
            {
                i: 14, name: 'Tx modal', calc: () => {
                    let tx_modal = Number(this._GET_STEP_TYPE_INDEX('elastic_sismi', 'value', 0)) || document.getElementById('rees_01_0').valie || 0;
                    return tx_modal.toFixed(2)
                }
            },
            {
                i: 15, name: 'SaX modal (g)', calc: () => {
                    let tx_modal = Number(this._GET_STEP_TYPE_INDEX('elastic_sismi', 'value', 2)) || document.getElementById('rees_01_2').valie || 0;
                    return tx_modal.toFixed(2)
                }
            },
            {
                i: 16, name: 'Ty modal', calc: () => {
                    let tx_modal = Number(this._GET_STEP_TYPE_INDEX('elastic_sismi', 'value', 7)) || document.getElementById('rees_01_7').valie || 0;
                    return tx_modal.toFixed(2)
                }
            },
            {
                i: 17, name: 'SaY modal (g)', calc: () => {
                    let tx_modal = Number(this._GET_STEP_TYPE_INDEX('elastic_sismi', 'value', 9)) || document.getElementById('rees_01_9').valie || 0;
                    return tx_modal.toFixed(2)
                }
            },
        ]

        const SISMIC_ELASTIC_DATA_01_VS = [18, 19, 20, 21, 22, 23];
        const SISMIC_ELASTIC_DATA_01_AJUSTE = [24, 25, 26, 27, 28]

        let STEP_08_02 = () => {
            SISMIC_ELASTIC_DATA_01_X.map(item => item.open ? null : document.getElementById('rees_01_' + item.i).value = item.calc());
            SISMIC_ELASTIC_DATA_01_Y.map(item => item.open ? null : document.getElementById('rees_01_' + item.i).value = item.calc());
            SISMIC_ELASTIC_DATA_01_Z.map(item => item.open ? null : document.getElementById('rees_01_' + item.i).value = item.calc());

            let f1x = Number(this._GET_STEP_TYPE_INDEX('elastic_sismi', 'value', 18)) || document.getElementById('rees_01_18').value || 0; // D251
            let f2x =  Number(this._GET_STEP_TYPE_INDEX('elastic_sismi', 'value', 19)) || document.getElementById('rees_01_19').value || 0; // E251
            let Vsx_total = Math.sqrt(Math.pow(f1x, 2) + Math.pow(f2x, 2)).toFixed(2);

            let f1y =  Number(this._GET_STEP_TYPE_INDEX('elastic_sismi', 'value', 21)) || document.getElementById('rees_01_21').value || 0; // D252
            let f2y =  Number(this._GET_STEP_TYPE_INDEX('elastic_sismi', 'value', 22)) || document.getElementById('rees_01_22').value || 0; // E252
            let Vsy_total = Math.sqrt(Math.pow(f1y, 2) + Math.pow(f2y, 2)).toFixed(2);

            document.getElementById('rees_01_20').value = Vsx_total;
            document.getElementById('rees_01_23').value = Vsy_total;

            let Rx = this._GET_STEP_TYPE_INDEX('s4236', 'value', 9); // F132
            let Ro = this._GET_STEP_TYPE_INDEX('s4236', 'value', 0); // F127
            if(Rx < Ro) document.getElementById('rees_01_24').value = 90;
            else document.getElementById('rees_01_24').value = 80;

            let _90mx = this._GET_STEP_TYPE_INDEX('elastic_sismi', 'value', 5); // D238
            // Vsx_total = F251
            let ajuste_x = (_90mx / (Vsx_total || 1)).toFixed(2);
            if (ajuste_x < 1.0 ) ajuste_x = 1
            document.getElementById('rees_01_25').value =ajuste_x
            document.getElementById('rees_01_26').value = (ajuste_x * 9.81).toFixed(2);

            let _90my = this._GET_STEP_TYPE_INDEX('elastic_sismi', 'value', 12); // E238
            // Vsy_total = G251
            let ajuste_y = (_90my / (Vsy_total || 1)).toFixed(2);
            if (ajuste_y < 1.0 ) ajuste_y = 1;
            document.getElementById('rees_01_27').value = ajuste_y;
            document.getElementById('rees_01_28').value = (ajuste_y * 9.81).toFixed(2);

            SAVE_STEP_08_02();
        }

        let SAVE_STEP_08_02 = () => {
            formData = new FormData();
            let values = [];
            SISMIC_ELASTIC_DATA_01_X.map(item => values.push(document.getElementById('rees_01_' + item.i).value));
            SISMIC_ELASTIC_DATA_01_Y.map(item => values.push(document.getElementById('rees_01_' + item.i).value));
            SISMIC_ELASTIC_DATA_01_Z.map(item => values.push(document.getElementById('rees_01_' + item.i).value));
            SISMIC_ELASTIC_DATA_01_VS.map(item => values.push(document.getElementById('rees_01_' + item).value));
            SISMIC_ELASTIC_DATA_01_AJUSTE.map(item => values.push(document.getElementById('rees_01_' + item).value));

            formData.set('value', values.join(';'));
            formData.set('version', currentVersionR);
            formData.set('recordEngId', currentRecord.id);
            formData.set('id_public', 'elastic_sismi');
            save_step('elastic_sismi', false, formData);
        }


        let popBtn = (row) => {
            return <>
                {this.state['qedit_' + row.id]
                    ? <button type="button" onClick={() => manage_edit_item(row.id)} class="btn btn-sm btn-success">Guardar</button>
                    : <MDBPopover size='sm' color='info' btnChildren={'OPCIONES'} placement='left' dismiss>
                        <MDBPopoverBody>
                            <div class="list-group list-group-flush">
                                <button type="button" onClick={() => this.setState({ ['qedit_' + row.id]: true })} class="list-group-item list-group-item-action" ><i class="fas fa-pencil-alt"></i> Edición Rapida</button>
                                <button type="button" onClick={() => this.setState({ edit: row })} class="list-group-item list-group-item-action"><i class="fas fa-pencil-alt"></i> Edición Completa</button>
                                <button type="button" onClick={() => delete_item(row.id)} class="list-group-item list-group-item-action list-group-item-danger"><i class="fas fa-trash-alt"></i> Eliminar</button>
                                <button type="button" onClick={() => this.new_x('up', row.pos)} class="list-group-item list-group-item-action"><i class="fas fa-plus"></i> Añadir Arriba</button>
                                <button type="button" onClick={() => this.new_x('dw', row.pos)} class="list-group-item list-group-item-action"><i class="fas fa-plus"></i> Añadir Abajo</button>
                                <button type="button" onClick={() => this.new_x('up', row.pos, true)} class="list-group-item list-group-item-action"><i class="fas fa-copy"></i> Copiar Arriba</button>
                                <button type="button" onClick={() => this.new_x('dw', row.pos, true)} class="list-group-item list-group-item-action"><i class="fas fa-copy"></i> Copiar Abajo</button>
                            </div>
                        </MDBPopoverBody>
                    </MDBPopover>
                }
            </>
        }
        // DATA GETTERS
        // COMPONENT JSX
        let alert_icon = (row) => {
            if (!row.column) return <label className='text-danger fw-bold'>!</label>
        }
        let _CONCRETE_VAR = () => {
            return <div className="row mx-2 my-2">
                <div className="col-2 border border-dark px-2 pt-2"><label className="fw-bold">Peso Concreto</label></div>
                <div className="col-2 border border-dark px-2">  <input type="number" step="0.01"
                    className="form-control my-1" name="recprd_eng_sis_wc" id='k202' onBlur={() => manage_step_sis_wc()}
                    defaultValue={this._GET_STEP_TYPE_INDEX('sis_wc', 'value', 0) ?? 24} /></div>
                <div className="col-1 border border-dark px-2 pt-2"><label className="fw-bold">KN/m<sup>3</sup></label></div>
            </div>
        }
        let _CHILD_LICENCE_LIST = () => {
            let _LIST = this._GET_CHILD_SISMIC();

            const columns = [
                {
                    name: <label className="text-center text-success">Nivel</label>,
                    selector: 'pos',
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <>{
                        this.state['qedit_' + row.id]
                            ? <div class="input-group input-group-sm">
                                <input type="number" step="1" class="form-control me-1" id={"r_eng_sismic_5_edit_" + row.id} defaultValue={row.pos} />
                            </div>
                            : <label>{row.pos}</label>
                    }</>
                },
                {
                    name: <label className="text-center">Descripción</label>,
                    center: true,
                    cell: row => <>{
                        this.state['qedit_' + row.id]
                            ? <div class="input-group input-group-sm">
                                <input type="text" class="form-control me-1" id={"r_eng_sismic_1_edit_" + row.id} defaultValue={row.name} />
                            </div>
                            : <label>{alert_icon(row)} {row.name}</label>
                    }</>
                },
                {
                    name: <label className="text-center">Nivel j [m]</label>,
                    center: true,
                    cell: row => <label>{this._get_SUMLEVEL(row.id, row.name)}</label>
                },
                {
                    name: <label className="text-center">h Piso [m]</label>,
                    center: true,
                    cell: row => <>{
                        this.state['qedit_' + row.id]
                            ? <div class="input-group input-group-sm">
                                <input type="number" step="0.01" class="form-control me-1" id={"r_eng_sismic_2_edit_" + row.id} defaultValue={row.height} />
                            </div>
                            : <label>{row.height}</label>
                    }</>
                },
                {
                    name: <label className="text-center">Área placa [m2]</label>,
                    center: true,
                    cell: row => <>{
                        this.state['qedit_' + row.id]
                            ? <div class="input-group input-group-sm">
                                <input type="number" step="0.01" class="form-control me-1" id={"r_eng_sismic_3_edit_" + row.id} defaultValue={row.area} />
                            </div>
                            : <label>{row.pos <= 1 ? '' : row.area}</label>
                    }</>
                },
                {
                    name: <label className="text-center">Den/Plac [kN/m2]</label>,
                    center: true,
                    minWidth: "40px",
                    compact: true,
                    cell: row => <>{
                        this.state['qedit_' + row.id]
                            ? <div class="input-group input-group-sm">
                                <input type="number" step="0.01" class="form-control me-1" id={"r_eng_sismic_6_edit_" + row.id} defaultValue={row.denplac} />
                            </div>
                            : <label>{row.pos <= 1 ? '' : row.denplac}</label>
                    }</>
                },
                {
                    name: <label className="text-center">Peso/Plac [kN]</label>,
                    center: true,
                    minWidth: "40px",
                    compact: true,
                    cell: row => <label >{row.pos <= 1 ? '' : this._GET_PESOPLAC_VALUE(row)}</label>
                },
                {
                    name: <label className="text-center">Col/Pan [KN]</label>,
                    center: true,
                    minWidth: "40px",
                    compact: true,
                    cell: row => <label >{row.pos <= 1 ? '' : this._get_COLPAN_VALUE(row)}</label>
                },
                {
                    name: <label className="text-center">Viga [KN]</label>,
                    center: true,
                    minWidth: "40px",
                    compact: true,
                    cell: row => <label >{row.pos <= 1 ? '' : this._get_VIGA(row.height)}</label>
                },
                {
                    name: <label className="text-center">Esca [kN]</label>,
                    center: true,
                    minWidth: "40px",
                    compact: true,
                    cell: row => <>{
                        this.state['qedit_' + row.id]
                            ? <div class="input-group input-group-sm">
                                <input type="number" step="0.01" class="form-control me-1" id={"r_eng_sismic_4_edit_" + row.id} defaultValue={row.esca} />
                            </div>
                            : <label>{row.pos <= 1 ? '' : row.esca}</label>
                    }</>
                },
                {
                    name: <label className="text-center">Peso tot [kN]</label>,
                    center: true,
                    minWidth: "40px",
                    compact: true,
                    cell: row => <label >{row.pos <= 1 ? '' : this._get_TOT(row)}</label>
                },
                {
                    name: <label>ACCION</label>,
                    button: true,
                    minWidth: '120px',
                    cell: row => <>
                        {popBtn(row)}
                    </>
                },
            ]

            return <DataTable
                noDataComponent="No hay Items"
                striped="true"
                columns={columns}
                data={_LIST}
                highlightOnHover
                className="data-table-component"
                noHeader
                dense
                defaultSortFieldId={1}
                defaultSortAsc={false}
                onSort={(selectedColumn, sortDirection) => this.setState({ sort: sortDirection })}
            />
        }
        let _CHILD_LICENCE_LIST_FHE = () => {
            let _LIST = this._GET_CHILD_SISMIC();

            const columns = [
                {
                    name: <label className="text-center text-success">Nivel</label>,
                    selector: 'pos',
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <label>{row.pos}</label>
                },
                {
                    name: <label className="text-center">Descripción</label>,
                    center: true,
                    cell: row => <label>{alert_icon(row)} {row.name}</label>
                },
                {
                    name: <label className="text-center">Nivel i [m]</label>,
                    center: true,
                    cell: row => <label>{this._get_SUMLEVEL(row.id, row.name)}</label>
                },
                {
                    name: <label className="text-center">hi [m]</label>,
                    center: true,
                    cell: row => <label>{row.height}</label>
                },
                {
                    name: <label className="text-center">Wi [m]</label>,
                    center: true,
                    cell: row => <label>{this._get_TOT(row)}</label>
                },
                {
                    name: <label className="text-center">Wi *(hi)^k</label>,
                    center: true,
                    minWidth: "40px",
                    compact: true,
                    cell: row => <label >{this._get_WIHIK(row)}</label>
                },
                {
                    name: <label className="text-center">cvi</label>,
                    center: true,
                    minWidth: "40px",
                    compact: true,
                    cell: row => <label>{this._get_CVI(row)}</label>
                },
                {
                    name: <label className="text-center">F_x [kN]</label>,
                    center: true,
                    minWidth: "40px",
                    compact: true,
                    cell: row => <label>{this._get_F_x(row)}</label>
                },
                {
                    name: <label className="text-center">F_y [kN]</label>,
                    center: true,
                    minWidth: "40px",
                    compact: true,
                    cell: row => <label>{this._get_F_y(row)}</label>
                },
            ]
            return <DataTable
                noDataComponent="No hay Items"
                striped="true"
                columns={columns}
                data={_LIST}
                highlightOnHover
                className="data-table-component"
                noHeader
                dense

                defaultSortFieldId={1}
                defaultSortAsc={false}

            />
        }
        let _COMPONENT_MANAGE = (edit = "") => {
            return <>
                <div className="row mb-1">
                    <div className="col">
                        <label>Nivel</label>
                        <div class="input-group my-1">
                            <input type="number" min="1" step="1" class="form-control" id={"r_eng_sismic_5" + edit} defaultValue={this._GET_CHILD_SISMIC().length + 1} required />
                        </div>
                    </div>
                    <div className="col-3">
                        <label>Descripcin</label>
                        <div class="input-group my-1">
                            <input type="text" class="form-control" id={"r_eng_sismic_1" + edit} />
                        </div>
                    </div>
                    <div className="col">
                        <label>h Piso [m]</label>
                        <div class="input-group my-1">
                            <input type="number" step="0.01" class="form-control" id={"r_eng_sismic_2" + edit} />
                        </div>
                    </div>
                    <div className="col">
                        <label>Área Placa [m2]</label>
                        <div class="input-group my-1">
                            <input type="number" step="0.01" class="form-control" id={"r_eng_sismic_3" + edit} />
                        </div>
                    </div>
                    <div className="col">
                        <label>Esca [kN]</label>
                        <div class="input-group my-1">
                            <input type="number" step="0.01" class="form-control" id={"r_eng_sismic_4" + edit} />
                        </div>
                    </div>
                    <div className="col">
                        <label>Den Planc [kN/m2]</label>
                        <div class="input-group my-1">
                            <input type="number" step="0.01" class="form-control" id={"r_eng_sismic_6" + edit}
                                defaultValue={this._GET_DENPLAC_VALUE()} />
                        </div>
                    </div>
                </div>
                <div className="row mb-1">
                    <div className="col-2">
                        <label className='fw-bold mt-3'>Columna:</label>
                    </div>
                    <div className="col-2">
                        <label>Número </label>
                        <div class="input-group my-1">
                            <input type="number" step="1" min={1} defaultValue={9} class="form-control" id={"r_eng_sismic_column_1" + edit} />
                        </div>
                    </div>
                    <div className="col-2">
                        <label>Promedio C1 (m)</label>
                        <div class="input-group my-1">
                            <input type="number" step="0.01" defaultValue={0.3} class="form-control" id={"r_eng_sismic_column_2" + edit} />
                        </div>
                    </div>
                    <div className="col-2">
                        <label>Promedio C2 (m)</label>
                        <div class="input-group my-1">
                            <input type="number" step="0.01" defaultValue={0.3} class="form-control" id={"r_eng_sismic_column_3" + edit} />
                        </div>
                    </div>

                </div>
            </>
        }
        let _COMPONENT_TOTAL = () => {
            let _LIST = this._GET_TOTAL();
            return <>
                <div className="row mx-2 py-2">
                    <div className="col-12  text-center">
                        <label className="fw-bold">Totales:</label>
                    </div>
                </div>
                <div className="row mx-2 text-center">
                    <div className="col border border-dark ">
                        <label style={{ fontSize: 'small' }}>h Piso [m]</label><br />
                        <label className="fw-bold">{(_LIST.height).toFixed(2)}</label>
                    </div>
                    <div className="col border border-dark ">
                        <label style={{ fontSize: 'small' }}>Peso/Plac [kN]</label><br />
                        <label className="fw-bold">{(_LIST.pesoplac).toFixed(2)}</label>
                    </div>
                    <div className="col border border-dark ">
                        <label style={{ fontSize: 'small' }}>Col/Pan [kN]</label><br />
                        <label className="fw-bold">{(_LIST.colpan.toFixed(2))}</label>
                    </div>
                    <div className="col border border-dark ">
                        <label style={{ fontSize: 'small' }}>Viga [kN]</label><br />
                        <label className="fw-bold">{(_LIST.viga).toFixed(2)}</label>
                    </div>
                    <div className="col border border-dark ">
                        <label style={{ fontSize: 'small' }}>Esca [kN]</label><br />
                        <label className="fw-bold">{(_LIST.esca).toFixed(2)}</label>
                    </div>
                    <div className="col border border-dark ">
                        <label style={{ fontSize: 'small' }}>Peso tot [kN]</label><br />
                        <label className="fw-bold">{(_LIST.tot).toFixed(2)}</label>
                    </div>
                </div>
            </>
        }
        let _COMPONENT_TOTAL_PHE = () => {
            let _LIST = this._GET_TOTAL();
            return <>
                <div className="row mx-2 py-2">
                    <div className="col-12  text-center">
                        <label className="fw-bold">Totales:</label>
                    </div>
                </div>
                <div className="row mx-2 text-center">
                    <div className="col border border-dark ">
                        <label style={{ fontSize: 'small' }}>hi [m]</label><br />
                        <label className="fw-bold">{(_LIST.height).toFixed(2)}</label>
                    </div>
                    <div className="col border border-dark ">
                        <label style={{ fontSize: 'small' }}>Wi [m]</label><br />
                        <label className="fw-bold">{(_LIST.tot.toFixed(2))}</label>
                    </div>
                    <div className="col border border-dark ">
                        <label style={{ fontSize: 'small' }}>Wi*(hi)^k</label><br />
                        <label className="fw-bold">{(_LIST.wihik).toFixed(2)}</label>
                    </div>
                    <div className="col border border-dark ">
                        <label style={{ fontSize: 'small' }}>Cvi</label><br />
                        <label className="fw-bold">{(_LIST.cvi).toFixed(2)}</label>
                    </div>
                    <div className="col border border-dark ">
                        <label style={{ fontSize: 'small' }}>F_x [kN]</label><br />
                        <label className="fw-bold">{(_LIST.f_x).toFixed(2)}</label>
                    </div>
                    <div className="col border border-dark ">
                        <label style={{ fontSize: 'small' }}>F_y [kN]</label><br />
                        <label className="fw-bold">{(_LIST.f_y).toFixed(2)}</label>
                    </div>
                </div>
            </>
        }
        let COMPONENT_STEP_08 = () => {
            return <>
                <div className="row mb-1 mt-5">
                    <div className="col-3">
                        <label>VSax =  Say </label>
                    </div>
                    <div className="col-2">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_s08" id='d231' disabled
                            defaultValue={this._GET_STEP_TYPE_INDEX('s4237', 'value', 20) ?? this._GET_STEP_TYPE_INDEX('s4238', 'value', 0) ?? ''} />
                    </div>
                    <div className="col-3"><label>T {'<'} 0.5     K= 1.0</label></div>
                    <div className="col-2"> </div>
                    <div className="col-2"><button className='btn btn-info btn-sm' onClick={() => this.set_values()}>ACTUALIZAR</button></div>
                </div>

                <div className="row mb-1">
                    <div className="col-3">
                        <label>Tf = </label>
                    </div>
                    <div className="col-2">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_s08" id='d232' disabled
                            defaultValue={this._GET_STEP_TYPE_INDEX('s4237', 'value', 18) ?? this._GET_STEP_TYPE_INDEX('s4238', 'value', 1) ?? ''} />
                    </div>
                    <div className="col-3"><label>T(0.5 y 2.5) K=0.75+0.5T</label></div>
                    <div className="col-2"> </div>
                    <div className="col-2"></div>
                </div>

                <div className="row mb-1">
                    <div className="col-3">
                        <label>K =</label>
                    </div>
                    <div className="col-2">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_s08" id='d233' disabled
                            defaultValue={this.get_d233() ?? this._GET_STEP_TYPE_INDEX('s4238', 'value', 2) ?? ''} />
                    </div>
                    <div className="col-3"><label>T {'>'} 2.5     K= 2.0</label></div>
                    <div className="col-2"> </div>
                    <div className="col-2"></div>
                </div>

                <div className="row mb-1">
                    <div className="col-5">
                        <label>Cortante sísmico basal    (Vs=Sa*g*M)     (Vs=Sa*W)</label>
                    </div>
                    <div className="col-3"></div>
                    <div className="col-2"> </div>
                    <div className="col-2"></div>
                </div>

                <div className="row mb-1">
                    <div className="col-3">
                        <label>Vs = (kN)</label>
                    </div>
                    <div className="col-2">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_s08" id='d236' disabled style={{ background: 'DarkKhaki' }}
                            defaultValue={this._GET_STEP_TYPE_INDEX('s4238', 'value', 3) ?? ''} />
                    </div>
                    <div className="col-3"></div>
                    <div className="col-2"> </div>
                    <div className="col-2"></div>
                </div>
                <div className="row mb-1">
                    <div className="col-3">
                        <label>Vs = (TON)</label>
                    </div>
                    <div className="col-2">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_s08" id='d237' disabled style={{ background: 'DarkKhaki' }}
                            defaultValue={this._GET_STEP_TYPE_INDEX('s4238', 'value', 4) ?? ''} />
                    </div>
                    <div className="col-3"></div>
                    <div className="col-2"> </div>
                    <div className="col-2"></div>
                </div>
            </>
        }

        let COMPONENT_STEP_08_02 = () => {
            return <>
                <label className="app-p fw-bold my-2">ANÁLISIS SÍSMICO DINAMICO ELASTICO</label>
                <div className="row mb-1 mt-5">
                    <div className='col'>
                        <div className="row">
                            {SISMIC_ELASTIC_DATA_01_X.map(item => <>
                                <div className="col-6 mb-1">{item.name}</div>
                                <div className="col-6 mb-1">
                                    <input type="number" step="0.01"
                                        className="form-control" name="recprd_eng_elastic_sismic" id={'rees_01_' + item.i} disabled={item.open !== true}
                                        onBlur={() => STEP_08_02()}
                                        defaultValue={this._GET_STEP_TYPE_INDEX('elastic_sismi', 'value', item.i) ?? item.calc() ?? ''} />
                                </div>
                            </>)}
                        </div>
                    </div>
                    <div className='col'>
                        <div className="row">
                            {SISMIC_ELASTIC_DATA_01_Y.map(item => <>
                                <div className="col-6 mb-1">{item.name}</div>
                                <div className="col-6 mb-1">
                                    <input type="number" step="0.01"
                                        className="form-control" name="recprd_eng_elastic_sismic" id={'rees_01_' + item.i} disabled={item.open !== true}
                                        onBlur={() => STEP_08_02()}
                                        defaultValue={this._GET_STEP_TYPE_INDEX('elastic_sismi', 'value', item.i) ?? item.calc() ?? ''} />
                                </div>
                            </>)}
                        </div>
                    </div>
                </div>

                <label className="app-p fw-bold my-2">ANÁLISIS MODAL ESPECTRAL</label>
                <div className="row mb-1 mt-5">
                    {SISMIC_ELASTIC_DATA_01_Z.map(item => <>
                        <div className="col-3 mb-1">{item.name}</div>
                        <div className="col-3 mb-1">
                            <input type="number" step="0.01"
                                className="form-control" name="recprd_eng_elastic_sismic" id={'rees_01_' + item.i} disabled={item.open !== true}
                                onBlur={() => STEP_08_02()}
                                defaultValue={this._GET_STEP_TYPE_INDEX('elastic_sismi', 'value', item.i) ?? item.calc() ?? ''} />
                        </div>
                    </>)}
                </div>

                <label className="app-p fw-bold my-2">AJUSTE DE RESULTADOS PARA REVISIÓN DE CORTANTE BASAL (A.5.4.5 NSR-10)</label><br />
                <label className="app-p fw-bold">CORTANTE BASAL CON EL MODELO INICIAL</label>

                <div className="row text-center fw-bold">
                    <div className="col-3 mb-1 border border-black">VS</div>
                    <div className="col-3 mb-1 border border-black">F1</div>
                    <div className="col-3 mb-1 border border-black">F2</div>
                    <div className="col-3 mb-1 border border-black">TOTAL</div>
                </div>
                <div className="row text-center fw-bold">
                    <div className="col-3 mb-1 border border-black">Vs(x)</div>
                    <div className="col-3 mb-1 border border-black">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_elastic_sismic" id={'rees_01_18'} onBlur={() => STEP_08_02()}
                            defaultValue={this._GET_STEP_TYPE_INDEX('elastic_sismi', 'value', 18) ?? ''} />
                    </div>
                    <div className="col-3 mb-1 border border-black">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_elastic_sismic" id={'rees_01_19'} onBlur={() => STEP_08_02()}
                            defaultValue={this._GET_STEP_TYPE_INDEX('elastic_sismi', 'value', 19) ?? ''} />
                    </div>
                    <div className="col-3 mb-1 border border-black">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_elastic_sismic" id={'rees_01_20'} disabled={true}
                            defaultValue={this._GET_STEP_TYPE_INDEX('elastic_sismi', 'value', 20) ?? ''} />
                    </div>
                </div>

                <div className="row text-center fw-bold">
                    <div className="col-3 mb-1 border border-black">Vs(y)</div>
                    <div className="col-3 mb-1 border border-black">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_elastic_sismic" id={'rees_01_21'} onBlur={() => STEP_08_02()}
                            defaultValue={this._GET_STEP_TYPE_INDEX('elastic_sismi', 'value', 21) ?? ''} />
                    </div>
                    <div className="col-3 mb-1 border border-black">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_elastic_sismic" id={'rees_01_22'} onBlur={() => STEP_08_02()}
                            defaultValue={this._GET_STEP_TYPE_INDEX('elastic_sismi', 'value', 22) ?? ''} />
                    </div>
                    <div className="col-3 mb-1 border border-black">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_elastic_sismic" id={'rees_01_23'} disabled={true}
                            defaultValue={this._GET_STEP_TYPE_INDEX('elastic_sismi', 'value', 23) ?? ''} />
                    </div>
                </div>

                <label className="app-p fw-bold my-2">AJUSTE:</label>

                <div className="row text-center fw-bold">
                    <div className="col-3 mb-1 border border-black">
                    <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_elastic_sismic" id={'rees_01_24'} disabled={true}
                            defaultValue={this._GET_STEP_TYPE_INDEX('elastic_sismi', 'value', 24) ?? ''} />
                    </div>
                    <div className="col-9 mb-1 border border-black">FACTOR COORRECCIÓN</div>
                </div>

                <div className="row text-center fw-bold">
                    <div className="col-3 mb-1 border border-black">Ajuste X</div>
                    <div className="col-3 mb-1 border border-black">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_elastic_sismic" id={'rees_01_25'} disabled={true}
                            defaultValue={this._GET_STEP_TYPE_INDEX('elastic_sismi', 'value', 25) ?? ''} />
                    </div>
                    <div className="col-3 mb-1 border border-black">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_elastic_sismic" id={'rees_01_26'} disabled={true}
                            defaultValue={this._GET_STEP_TYPE_INDEX('elastic_sismi', 'value', 26) ?? ''} />
                    </div>
                    <div className="col-3 mb-1 border border-black">m/s2</div>
                </div>

                <div className="row text-center fw-bold">
                    <div className="col-3 mb-1 border border-black">Ajuste Y</div>
                    <div className="col-3 mb-1 border border-black">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_elastic_sismic" id={'rees_01_27'} disabled={true}
                            defaultValue={this._GET_STEP_TYPE_INDEX('elastic_sismi', 'value', 27) ?? ''} />
                    </div>
                    <div className="col-3 mb-1 border border-black">
                        <input type="number" step="0.01"
                            className="form-control" name="recprd_eng_elastic_sismic" id={'rees_01_28'} disabled={true}
                            defaultValue={this._GET_STEP_TYPE_INDEX('elastic_sismi', 'value', 28) ?? ''} />
                    </div>
                    <div className="col-3 mb-1 border border-black">m/s2</div>
                </div>

                <br />
            </>
        }
        // FUNCTIONS AND APIS
        var formData = new FormData();

        let new_item = (e) => {
            e.preventDefault();
            formData = new FormData();

            formData.set('recordEngId', currentRecord.id);

            let name = document.getElementById("r_eng_sismic_1").value;
            if (name) formData.set('name', name);
            let height = document.getElementById("r_eng_sismic_2").value;
            if (height) formData.set('height', height);
            let area = document.getElementById("r_eng_sismic_3").value;
            if (area) formData.set('area', area);
            let esca = document.getElementById("r_eng_sismic_4").value;
            if (esca) formData.set('esca', esca);
            let pos = document.getElementById("r_eng_sismic_5").value;
            if (pos) formData.set('pos', pos);
            let denplac = document.getElementById("r_eng_sismic_6").value;
            if (denplac) formData.set('denplac', denplac);

            let column = {};
            column.n = document.getElementById("r_eng_sismic_column_1").value || 9;
            column.c1 = document.getElementById("r_eng_sismic_column_2").value || 0.3;
            column.c2 = document.getElementById("r_eng_sismic_column_3").value || 0.3;
            formData.set('column', JSON.stringify(column));

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            RECORD_ENG_SERVICE.create_sis(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        this.props.requestUpdateRecord(currentItem.id);
                        document.getElementById('form_end_sismic_new').reset();
                    } else {
                        MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    }
                })
                .catch(e => {
                    console.log(e);
                    MySwal.fire({
                        title: swaMsg.generic_eror_title,
                        text: swaMsg.generic_error_text,
                        icon: 'warning',
                        confirmButtonText: swaMsg.text_btn,
                    });
                });
        }
        let delete_item = (id) => {
            MySwal.fire({
                title: "ELIMINAR ESTE ITEM",
                text: "¿Esta seguro de eliminar de forma permanente este item?",
                icon: 'question',
                confirmButtonText: "ELIMINAR",
                showCancelButton: true,
                cancelButtonText: "CANCELAR"
            }).then(SweetAlertResult => {
                if (SweetAlertResult.isConfirmed) {
                    MySwal.fire({
                        title: swaMsg.title_wait,
                        text: swaMsg.text_wait,
                        icon: 'info',
                        showConfirmButton: false,
                    });
                    let sort = this.state.sort;
                    sort = String(sort).toUpperCase()
                    RECORD_ENG_SERVICE.delete_sis(id, sort, currentRecord.id)
                        .then(response => {
                            if (response.data === 'OK') {
                                MySwal.fire({
                                    title: swaMsg.publish_success_title,
                                    text: swaMsg.publish_success_text,
                                    footer: swaMsg.text_footer,
                                    icon: 'success',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                                this.props.requestUpdateRecord(currentItem.id);
                                this.setState({ edit: false });
                            } else {
                                MySwal.fire({
                                    title: swaMsg.generic_eror_title,
                                    text: swaMsg.generic_error_text,
                                    icon: 'warning',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                            }
                        })
                        .catch(e => {
                            console.log(e);
                            MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        });
                }
            });
        }
        let edit_item = (e) => {
            e.preventDefault();
            manage_edit_item();
        }
        let manage_edit_item = (id = "") => {
            let _id = this.state.edit.id || id;
            let strId = ""
            if (id) strId = '_' + id
            formData = new FormData();

            let name = document.getElementById("r_eng_sismic_1_edit" + strId).value;
            formData.set('name', name);
            let height = document.getElementById("r_eng_sismic_2_edit" + strId).value;
            formData.set('height', height);
            let area = document.getElementById("r_eng_sismic_3_edit" + strId).value;
            formData.set('area', area);
            let esca = document.getElementById("r_eng_sismic_4_edit" + strId).value;
            formData.set('esca', esca);
            let pos = document.getElementById("r_eng_sismic_5_edit" + strId).value;
            formData.set('pos', pos);
            let denplac = document.getElementById("r_eng_sismic_6_edit" + strId).value;
            formData.set('denplac', denplac);

            let column = {};
            if (document.getElementById("r_eng_sismic_column_1_edit")) {
                column.n = document.getElementById("r_eng_sismic_column_1_edit") ? document.getElementById("r_eng_sismic_column_1_edit").value : '9';
                column.c1 = document.getElementById("r_eng_sismic_column_2_edit") ? document.getElementById("r_eng_sismic_column_2_edit").value : '0.3';
                column.c2 = document.getElementById("r_eng_sismic_column_3_edit") ? document.getElementById("r_eng_sismic_column_3_edit").value : '0.3';
                formData.set('column', JSON.stringify(column));

            }

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            RECORD_ENG_SERVICE.update_sis(_id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        this.props.requestUpdateRecord(currentItem.id);
                        //document.getElementById('form_end_sismic_edit').reset();
                        this.setState({ edit: false });
                        this.setState({ ['qedit_' + _id]: false });
                    } else {
                        MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    }
                })
                .catch(e => {
                    console.log(e);
                    MySwal.fire({
                        title: swaMsg.generic_eror_title,
                        text: swaMsg.generic_error_text,
                        icon: 'warning',
                        confirmButtonText: swaMsg.text_btn,
                    });
                });
        }

        let manage_step_sis_wc = (e) => {
            if (e) e.preventDefault();

            formData = new FormData();
            let values = [];
            let values_2 = document.getElementsByName('recprd_eng_sis_wc');
            for (var i = 0; i < values_2.length; i++) {
                values.push(values_2[i].value)
            }
            formData.set('value', values.join(';'));


            formData.set('version', currentVersionR);
            formData.set('recordEngId', currentRecord.id);
            formData.set('id_public', 'sis_wc');
            save_step('sis_wc', false, formData);

        }
        let save_step = (_id_public, useSwal, formData) => {
            var STEP = this.LOAD_STEP(_id_public);

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
            <div
                className="record_eng_sismic my-2">
                {SUBCATEGORIES[9] == 1 ? <>
                    <hr />
                    <label className="app-p fw-bold text-uppercase my-2">Paso 8, Análisis sísmico de la estructura. Aplicación de los movimientos sísmicos de diseño (Cap. A.3) este análisis se realiza sin ser dividido por el coeficiente de capacidad de disipación de energía, R, según los resultados del paso 6, se determinan los desplazamientos máximos de diseño y las fuerzas internas que se derivan de ellos. Desplazamiento máximo corresponde al 1% de la altura de entrepisos.</label>
                    {_CONCRETE_VAR()}
                    <div class="form-check ms-5">
                        <input class="form-check-input" type="checkbox" onChange={(e) => this.setState({ new: e.target.checked })} />
                        <label class="form-check-label" for="flexCheckDefault">
                            Nuevo Piso
                        </label>
                    </div>

                    {this.state.new
                        ? <>
                            <form id="form_end_sismic_new" onSubmit={new_item}>
                                {_COMPONENT_MANAGE()}
                                <div className="row mb-3 text-center">
                                    <div className="col-12">
                                        <button className="btn btn-success my-3" ><i class="far fa-file-alt"></i> AÑADIR ITEM </button>
                                    </div>
                                </div>
                            </form>
                        </>
                        : ""}
                    <label className="app-p fw-bold my-2">EVALUACION DE CARGAS VERTICALES EN ENTREPISOS</label>
                    <h5 className='text-muted mt-3 ps-5s'>NOTA SOBRE <label className='text-success'>NIVEL</label>: Empieza a partir de 1, el nivel mas inferior es considerado como el 1, empezando desde el sotano mas profundo y ascendiendo.</h5>
                    <h5 className='text-muted mt-3 ps-5s'>NOTA SOBRE <label className='text-danger fw-bold'>!</label>: Indican que las columnas del Item no han sido definidas.</h5>

                    {_CHILD_LICENCE_LIST()}
                    {_COMPONENT_TOTAL()}
                    {this.state.edit
                        ? <>
                            <form id="form_end_sismic_edit" onSubmit={edit_item}>
                                <h3 className="my-3 text-center">Actualizar Piso</h3>
                                {_COMPONENT_MANAGE('_edit')}
                                <div className="row mb-3 text-center">
                                    <div className="col-12">
                                        <button className="btn btn-success my-3" ><i class="far fa-file-alt"></i> GUARDAR CAMBIOS </button>
                                    </div>
                                </div>
                            </form>
                        </>
                        : ""}
                    {COMPONENT_STEP_08()}
                    {version === 2 && this._GET_STEP_TYPE_INDEX('s4236', 'value', 11) == 'Análisis dinámico elástico' ? COMPONENT_STEP_08_02() : null}
                    <label className="app-p fw-bold my-2">ANÁLISIS SÍSMICO     MÉTODO FHE.</label>
                    {_CHILD_LICENCE_LIST_FHE()}
                    {_COMPONENT_TOTAL_PHE()}
                </> : ""}
            </div >
        );
    }
}

export default RECORD_ENG_SISMIC;