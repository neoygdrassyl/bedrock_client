import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { Spreadsheet } from "react-spreadsheet";
import { _FUN_1_PARSER } from '../../../../components/customClasses/funCustomArrays';
import { MDBBtn, MDBCollapse } from 'mdb-react-ui-kit';
import RECORD_ARCSERVICE from '../../../../services/record_arc.service';
import ReactTagInput from '@pathofdev/react-tag-input';
import { getJSON_Simple } from '../../../../components/customClasses/typeParse';
import FUNService from '../../../../services/fun.service';

var tagHRef = React.createRef();
var tagERef = React.createRef();

export default function RECORD_ARC_AREAS(props) {
    const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR } = props;
    const _Header = [
        "Refe",
        "ID Plano",
        "Escala",
        "Sótano/Piso",
        "Nivel N",
        "Nivel m",
        "Suma/Nivel",
        // HERE ADD HISTORIC
        // HERE ADD EMPATE
        // HERE ADD TYPES

        "Área total construida",
        "Área total descontar ",
        "Área total neta",
        "Área total intervenida",
        "Uso Principal",
        // HERE ADD NEGATIVE

        // HERE ADD UNITS

        // HERE ADD UNITS AREAS
    ];
    const publicXindexName = [
        { n: "Refe", i: 'id', dv: '', },
        { n: "ID Plano", i: 'id_public', dv: '', },
        { n: "Escala", i: 'scale', dv: '', },
        { n: "Sótano/Piso", i: 'floor', dv: '', },
        { n: "Nivel N", i: 'level_n', dv: '', },
        { n: "Nivel m", i: 'level_m', dv: '', },
        { n: "Suma/Nivel", i: 'level_m_s', dv: '', },
        { n: "Área total construida", i: 'build_total', dv: '', },
        { n: "Área total descontar", i: 'destroy_total', dv: '', },
        { n: "Área total neta", i: 'net_total', dv: '', },
        { n: "Área total intervenida", i: 'int_total', dv: '', },
        { n: "Uso Principal", i: 'use', dv: '', },

        { n: '*', i: 'histocic_', dv: '', },
        { n: 'Empate: ', i: 'empate_', dv: '', },

        { n: 'Demolida total', i: 'build_6', dv: '0', },
        { n: 'Demolida parcial', i: 'build_7', dv: '0', },
        { n: 'Obra Nueva', i: 'build_0', dv: '0', },
        { n: 'Reconstruida', i: 'build_8', dv: '0', },
        { n: 'Ampliada', i: 'build_1', dv: '0', },
        { n: 'Adecuación', i: 'build_2', dv: '0', },
        { n: 'Modificada', i: 'build_3', dv: '0', },
        { n: 'Restaurada', i: 'build_4', dv: '0', },
        { n: 'Reforzada', i: 'build_5', dv: '0', },
        { n: 'Cerrada', i: 'build_9', dv: '0', },
        { n: 'Reconocida', i: 'build_10', dv: '0', },

        { n: "Parqueaderos", i: 'destroy_0', dv: '0', },
        { n: "Sesión Tipo B", i: 'destroy_1', dv: '0', },
        { n: "Cuartos Técnicos", i: 'destroy_2', dv: '0', },
        { n: "Tanques de agua", i: 'destroy_3', dv: '0', },
        //{ n: "Pto Fijo. Ascensor", i: 'destroy_4', dv: '0', },
        { n: "Pto Fijo", i: 'destroy_4', dv: '0', },
        //{ n: "Pto Fijo. Corredor", i: 'destroy_6', dv: '0', },
        { n: "Otros", i: 'destroy_5', dv: '0', },

        { n: "U Viviendas", i: 'units_0', dv: '0', },
        { n: "U Locales", i: 'units_1', dv: '0', },
        { n: "U Parcelas", i: 'units_2', dv: '0', },
        { n: "U Parqueos", i: 'units_3', dv: '0', },
        { n: "U Oficinas", i: 'units_4', dv: '0', },
        { n: "U Bodegas", i: 'units_5', dv: '0', },
        { n: "U Apartamentos", i: 'units_6', dv: '0', },
        { n: "U Depositos", i: 'units_7', dv: '0', },
        { n: "U Lotes", i: 'units_8', dv: '0', },

        { n: "A Viviendas", i: 'units_a_0', dv: '0', },
        { n: "A Locales", i: 'units_a_1', dv: '0', },
        { n: "A Parcelas", i: 'units_a_2', dv: '0', },
        { n: "A Parqueos", i: 'units_a_3', dv: '0', },
        { n: "A Oficinas", i: 'units_a_4', dv: '0', },
        { n: "A Bodegas", i: 'units_a_5', dv: '0', },
        { n: "A Apartamentos", i: 'units_a_6', dv: '0', },
        { n: "A Depositos", i: 'units_a_7', dv: '0', },
        { n: "A Lotes", i: 'units_a_8', dv: '0', },
    ]
    const type_check = [
        'Demolida total',
        'Demolida parcial',

        "Obra Nueva",
        'Reconocida',

        'Ampliada',
        'Adecuación',
        'Modificada',
        'Restaurada',
        'Reforzada',
        'Cerrada',
        'Reconstruida',
    ]
    const destory_check = ["Parqueaderos",
        "Sesión Tipo B",
        "Cuartos Técnicos",
        "Tanques de agua",
        //"Pto Fijo. Ascensor",
        "Pto Fijo",
        //"Pto Fijo. Corredor",
        "Otros"]
    const units_check = ["U Viviendas",
        "U Locales",
        "U Parcelas",
        "U Parqueos",
        "U Oficinas",
        "U Bodegas",
        "U Apartamentos",
        "U Depositos",
        "U Lotes",]
    const units_a_check = ["A Viviendas",
        "A Locales",
        "A Parcelas",
        "A Parqueos",
        "A Oficinas",
        "A Bodegas",
        "A Apartamentos",
        "A Depositos",
        "A Lotes",]

    const MySwal = withReactContent(Swal);
    var [data, setData] = useState([]);
    var [saving, setSaving] = useState(-1);
    var [Header, setHeader] = useState(_Header)
    var [openConfig, setOc] = useState(false);
    var [tagsH, setTagH] = useState([]);
    var [tagsE, setTagE] = useState([]);
    var saveCounter = 0;

    useEffect(() => {
        if (currentRecord.record_arc_33_areas != null) {
            _SET_DATA()
        }
    }, [currentRecord.record_arc_33_areas, currentItem.fun_1s]);
    // ***************************  DATA GETTERS *********************** //
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
                _CHILD_VARS.id = _CHILD[_CURRENT_VERSION].id ?? false;
                _CHILD_VARS.tipo = _CHILD[_CURRENT_VERSION].tipo ?? '';
                _CHILD_VARS.tramite = _CHILD[_CURRENT_VERSION].tramite ?? '';
                _CHILD_VARS.m_urb = _CHILD[_CURRENT_VERSION].m_urb ?? '';
                _CHILD_VARS.m_sub = _CHILD[_CURRENT_VERSION].m_sub ?? '';
                _CHILD_VARS.m_lic = _CHILD[_CURRENT_VERSION].m_lic ?? '';
                _CHILD_VARS.usos = _CHILD[_CURRENT_VERSION].usos ?? '';
                _CHILD_VARS.area = _CHILD[_CURRENT_VERSION].area ?? '';
                _CHILD_VARS.vivienda = _CHILD[_CURRENT_VERSION].vivienda ?? '';
                _CHILD_VARS.cultural = _CHILD[_CURRENT_VERSION].cultural ?? '';
                _CHILD_VARS.regla_1 = _CHILD[_CURRENT_VERSION].regla_1 ?? '';
                _CHILD_VARS.regla_2 = _CHILD[_CURRENT_VERSION].regla_2 ?? '';
            }
        }
        return _CHILD_VARS;
    }
    let _GET_CHILD_33_AREAS = () => {
        var _CHILD = currentRecord.record_arc_33_areas;
        var _AREAS = [];
        if (_CHILD) {
            for (var i = 0; i < _CHILD.length; i++) {
                if (_CHILD[i].type == "area") {
                    _AREAS.push(_CHILD[i])
                }
            }
        }
        return _AREAS;
    }
    let LOAD_STEP = (_id_public) => {
        var _CHILD = currentRecord.record_arc_steps;
        for (var i = 0; i < _CHILD.length; i++) {
            if (_CHILD[i].version == currentVersionR && _CHILD[i].id_public == _id_public) return _CHILD[i]
        }
        return []
    }
    let _GET_STEP_TYPE = (_id_public, _type) => {
        var STEP = LOAD_STEP(_id_public);
        if (!STEP.id) return [];
        var value = STEP[_type] ? STEP[_type] : []
        if (!value.length) return [];
        value = value.split(';');
        return value
    }
    let _ADD_AREAS = (_array) => {
        if (!_array) return 0;
        var areas = _array.split(",");
        var sum = 0;
        for (var i = 0; i < areas.length; i++) {
            sum += Number(areas[i])
        }
        return sum.toFixed(2);
    }
    let _GET_HISTORIC = (_historic) => {
        let STEP = LOAD_STEP('a_config');
        let json = STEP ? STEP.json ?? {} : {};
        json = getJSON_Simple(json)
        let tagsH = json.tagh ? json.tagh.split(';') : [];
        var historic = _historic ? _historic.split(';') : [];
        let reduced = historic.filter((_h, i) => {
            if (!tagsH[i]) return false
            let tag = tagsH[i].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            return tag.includes('historic');
        })
        let sum = 0;
        reduced.map((r) => sum += Number(r))
        return sum;
    }


    let _GET_TOTAL_AREA = (_build, _historic) => {
        if (!_build) return 0;
        var build = _build.split(",");
        var area_1 = 0;
        var area_5 = 0
        var historic = _GET_HISTORIC(_historic)
        if (build[0] > 0) area_1 += Number(build[0]);
        if (build[1] > 0) area_1 += Number(build[1]);
        if (build[10] > 0) area_1 += Number(build[10]);
        //if (build[6] > 0) area_5 = Number(build[6]);
        if (build[7] > 0) area_5 += Number(build[7]);
        var _TOTAL_AREA = Number(historic) + area_1 - area_5;
        return (_TOTAL_AREA).toFixed(2);
    }
    let _GET_TOTAL_DESTROY = (_destroy) => {
        if (!_destroy) return 0;
        var destroy = _destroy.split(",");
        let sum = destroy.reduce((p, n) => Number(p) + Number(n))
        return (sum).toFixed(2);
    }


    let _GET_NET_INDEX = (_build, _destroy, _historic) => {
        if (!_build) return 0;
        var destroy = Number(_ADD_AREAS(_destroy));
        var areaToBuild = _GET_TOTAL_AREA(_build, _historic);
        var historic = _GET_HISTORIC(_historic)
        var _NET_IDEX = Number(historic) + areaToBuild - destroy;
        console.log(areaToBuild, destroy)
        return (_NET_IDEX).toFixed(2);
    }
    let _GET_TOTAL_AREAS = (_field, _index, ss) => {
        let areas = _GET_CHILD_33_AREAS();
        let sum = 0;
        areas.map(a => {
            if (!a[_field]) return;
            let items = a[_field].split(ss);
            sum += Number(items[_index])
        })
        return sum;
    }
    let _GET_SUM_LEVEL_BY_FLOOR = (_floor) => {
        let DA_RULE = _GET_STEP_TYPE('a_config', 'check')[0];
        let floor_c = _floor ? String(_floor) : ' ';
        let con = floor_c[0].toLowerCase() == 's';
        let firstFloorHeight = 0;
        let currentfloorName = (_floor || '').toLowerCase().includes('piso');
        let currentfloorNumber = (_floor || '').replace(/^\D+/g, '');

        let areas = _GET_CHILD_33_AREAS();
        areas.sort((a, b) => array_sort(a, b));

        let new_areas = areas.filter(item => {
            let floor = item.floor ? item.floor : ' ';
            let floorName = (floor).toLowerCase().includes('piso');
            let floorNumber = (floor).replace(/^\D+/g, '');
            if (floorName && floorNumber == 1) firstFloorHeight = item.level ? Number(item.level.split('&')[1]) : 0;

            if (con) {
                let con2 = floor[0].toLowerCase() == 's';
                if (con2) return true;
                return false
            } else {
                let con1 = (floor).toLowerCase().includes('cubierta');
                let con3 = (floor).toLowerCase().includes('piso');
                let con4 = (floor).replace(/^\D+/g, '');
                let con2 = floor[0].toLowerCase() == 's';
                if (con2) return false;
                return true
            }
        });
        let floor_index = -1;
        let sum = 0;
        if (con) new_areas.reverse();

        new_areas.map((item, i) => { if (_floor == item.floor) floor_index = i; })
        if (floor_index != -1) {
            if (DA_RULE == '1') {
                let inferior_i = -1;
                new_areas.map((item, i) => {
                    if (_floor == item.floor) {
                        sum = item.level ? Number(item.level.split('&')[1]) : 0;
                        inferior_i = i + 1;
                    }
                })
                if (inferior_i > -1) {
                    let prev = new_areas[inferior_i] ? Number(new_areas[inferior_i].level.split('&')[1]) : 0;
                    sum = sum - prev;
                }
            } else {
                new_areas.map((item, i) => {
                    if (floor_index < i) {
                        let level = item.level ? item.level.split('&')[1] : 0;
                        sum += Number(level);
                    }
                });
            }

        }

        return sum.toFixed(2);
    }
    let _CHECK_AREA_STR = (_item, _index, i, _ss) => {
        let ss = _ss || ',';
        let item = _item[_index] ? _item[_index].split(ss)[i] : '0'
        if (Number(item) > 0) return item
        else return '';
    }
    // *************************  DATA CONVERTERS ********************** //
    function array_sort(a, b) {
        let A = a.floor ? a.floor.split(' ') : '';
        let B = b.floor ? b.floor.split(' ') : '';
        let strPartA = A[0] ? A[0].toLowerCase() : '';
        let strPartB = B[0] ? B[0].toLowerCase() : '';
        let nunPartA = Number(A[1]) ?? Infinity;
        let nunPartB = Number(B[1]) ?? Infinity;

        let buildingPriority = {
            'terraza': 4,
            'cubierta': 4,
            'techo': 4,
            'piso': 3,
            'nivel': 3,
            'planta': 3,
            'semisotano': 2,
            'semisótano': 2,
            'sotano': 1,
            'sótano': 1,
        }

        let firstCheck = (buildingPriority[strPartB] ?? 0) - (buildingPriority[strPartA] ?? 0);
        if (firstCheck != 0) return firstCheck
        else {
            if (strPartA[0] && strPartA[0].toLowerCase() == 's') {
                if (nunPartA < nunPartB) { return -1; }
                if (nunPartA > nunPartB) { return 1; }
            } else {
                if (nunPartA < nunPartB) { return 1; }
                if (nunPartA > nunPartB) { return -1; }
            }
        }

        return 0;
    }

    const _Cells = [
        { value: (v) => v.id, name: 'ref', id: (v) => v.id, pos: i => i, readOnly: true, className: 'text-muted' },
        { value: (v) => v.id_public, name: 'id_public', id: (v) => v.id, pos: i => i },
        { value: (v) => v.scale, name: 'scale', },
        { value: (v) => v.floor, name: 'floor', },
        { value: (v) => v.level ? v.level.split('&')[0] : '', name: 'level_n', },
        { value: (v) => v.level ? v.level.split('&')[1] : '', name: 'level_m', },
        { value: (v) => _GET_SUM_LEVEL_BY_FLOOR(v.floor), name: 'level_m_s', className: 'text-secondary text-muted', readOnly: true, },
        // HERE ADD HISTORIC0
        // HERE ADD EMPATE
        // HERE ADD TYPES
        { value: (v) => _GET_TOTAL_AREA(v.build, v.historic_areas), name: 'build_total', readOnly: true, className: 'text-secondary' },
        { value: (v) => _GET_TOTAL_DESTROY(v.destroy), name: 'destroy_total', readOnly: true, className: 'text-secondary' },
        { value: (v) => _GET_NET_INDEX(v.build, v.destroy, v.historic_areas), name: 'net_total', readOnly: true, className: 'text-secondary' },
        { value: (v) => _ADD_AREAS(v.build), name: 'int_total', readOnly: true, className: 'text-secondary' },
        { value: (v) => v.use, name: 'use', },
        // HERE ADD NEGATIVE

        // HERE ADD UNITS

        // HERE ADD UNITS AREAS

    ]

    function _SET_DATA() {

        // LOAD WORKING VARIABLES
        let _LIST = currentRecord.record_arc_33_areas ?? [];
        var _AREAS = [];
        if (_LIST) {
            for (var i = 0; i < _LIST.length; i++) {
                if (_LIST[i].type == "area") {
                    _AREAS.push(_LIST[i])
                }
            }
        }
        let child = _GET_CHILD_1();
        let _header = Array.from(_Header);
        let _cells = Array.from(_Cells);

        let STEP = LOAD_STEP('a_config');
        let json = STEP ? STEP.json ?? {} : {};
        json = getJSON_Simple(json)
        let tagsH = json.tagh ? json.tagh.split(';') : [];
        let tagsE = json.tage ? json.tage.split(';') : [];
        let destroy_cb = json.destroy_cb ? json.destroy_cb.split(';') : [];
        let units_cb = json.units_cb ? json.units_cb.split(';') : [];
        let units_a_cb = json.units_a_cb ? json.units_a_cb.split(';') : [];

        let spliceOffset = 7;
        // SET EXTRA HEADERS

        if (child.m_lic.includes('I') && !_header.includes('Cerrada')) {
            _header.splice(spliceOffset, 0, 'Cerrada')
            _cells.splice(spliceOffset, 0, { value: (v) => _CHECK_AREA_STR(v, 'build', 9), name: 'build_9', },)
        }
        if (child.m_lic.includes('H') && !_header.includes('Reconstruida')) {
            _header.splice(spliceOffset, 0, 'Reconstruida')
            _cells.splice(spliceOffset, 0, { value: (v) => _CHECK_AREA_STR(v, 'build', 8), name: 'build_8', },)
        }
        if (child.m_lic.includes('F') && !_header.includes('Reforzada')) {
            _header.splice(spliceOffset, 0, 'Reforzada')
            _cells.splice(spliceOffset, 0, { value: (v) => _CHECK_AREA_STR(v, 'build', 5), name: 'build_5', },)
        }
        if (child.m_lic.includes('E') && !_header.includes('Restaurada')) {
            _header.splice(spliceOffset, 0, 'Restaurada')
            _cells.splice(spliceOffset, 0, { value: (v) => _CHECK_AREA_STR(v, 'build', 4), name: 'build_4', },)
        }
        if (child.m_lic.includes('D') && !_header.includes('Modificada')) {
            _header.splice(spliceOffset, 0, 'Modificada')
            _cells.splice(spliceOffset, 0, { value: (v) => _CHECK_AREA_STR(v, 'build', 3), name: 'build_3', },)
        }
        if (child.m_lic.includes('C') && !_header.includes('Adecuación')) {
            _header.splice(spliceOffset, 0, 'Adecuación')
            _cells.splice(spliceOffset, 0, { value: (v) => _CHECK_AREA_STR(v, 'build', 2), name: 'build_2', },)
        }
        if (child.m_lic.includes('B') && !_header.includes('Ampliada')) {
            _header.splice(spliceOffset, 0, 'Ampliada')
            _cells.splice(spliceOffset, 0, { value: (v) => _CHECK_AREA_STR(v, 'build', 1), name: 'build_1', },)
        }

        if (child.tipo.includes('F') && !_header.includes('Reconocida')) {
            _header.splice(spliceOffset, 0, 'Reconocida')
            _cells.splice(spliceOffset, 0, { value: (v) => _CHECK_AREA_STR(v, 'build', 10), name: 'build_10', },)
        }
        if (child.m_lic.includes('A') && !_header.includes('Obra Nueva')) {
            _header.splice(spliceOffset, 0, 'Obra Nueva')
            _cells.splice(spliceOffset, 0, { value: (v) => _CHECK_AREA_STR(v, 'build', 0), name: 'build_0', },)
        }


        if (child.m_lic.includes('g') && !_header.includes('Demolida parcial')) {
            _header.splice(spliceOffset, 0, 'Demolida parcial')
            _cells.splice(spliceOffset, 0, { value: (v) => _CHECK_AREA_STR(v, 'build', 7), name: 'build_7', },)
        }
        if (child.m_lic.includes('G') && !_header.includes('Demolida total')) {
            _header.splice(spliceOffset, 0, 'Demolida total')
            _cells.splice(spliceOffset, 0, { value: (v) => _CHECK_AREA_STR(v, 'build', 6), name: 'build_6', },)
        }


        tagsH.map((tag, i) => {
            if (!_header.includes(tag)) {
                _header.splice(spliceOffset + i, 0, '*' + tag)
                _cells.splice(spliceOffset + i, 0, { value: (v) => _CHECK_AREA_STR(v, 'historic_areas', i, ';'), name: 'histocic_' + i, })
            }
        })

        tagsE.map((tag, i) => {
            if (!_header.includes('Empate: ' + tag)) {
                _header.splice(spliceOffset + i, 0, 'Empate: ' + tag)
                _cells.splice(spliceOffset + i, 0, { value: (v) => _CHECK_AREA_STR(v, 'empate_h', i, ';'), name: 'empate_' + i, },)
            }
        })



        destory_check.map((label, i) => {
            if (destroy_cb[i] == 'true' && !_header.includes(label)) {
                _header.push(label)
                _cells.push({ value: (v) => _CHECK_AREA_STR(v, 'destroy', i, ','), name: 'destroy_' + i, className: 'text-danger' },)
            }
        })

        units_check.map((label, i) => {
            if (units_cb[i] == 'true' && !_header.includes(label)) {
                _header.push(label)
                _cells.push({ value: (v) => _CHECK_AREA_STR(v, 'units', i, ';'), name: 'units_' + i, className: 'text-warning' },)
            }
        })

        units_a_check.map((label, i) => {
            if (units_a_cb[i] == 'true' && !_header.includes(label)) {
                _header.push(label)
                _cells.push({ value: (v) => _CHECK_AREA_STR(v, 'units_a', i, ';'), name: 'units_a_' + i, className: 'text-primary' },)
            }
        })

        // SORTS THE ARRAYS AND PROCESS TO FILL THE VALUES OF THE SPREADSHEET
        setHeader(_header);
        var newData = _AREAS.sort((a, b) => array_sort(a, b));
        let cells = (v, i) => {
            return _cells.map(c => {
                return {
                    value: c.value(v),
                    id: c.id ? c.id(v) : null,
                    pos: c.pos ? i : null,
                    name: c.name,
                    readOnly: c.readOnly,
                    className: c.className,
                }
            })
        }

        var _data = [];
        newData.map((v, i) =>
            _data.push(cells(v, i))
        )

        var totalCell = () => {
            let cell = [];
            _header.map((_h, i) => {
                publicXindexName.map(hn => {
                    if (_h.includes(hn.n)) {
                        let cellObj = {};
                        cellObj.name = hn.i;
                        cellObj.ignore = true;
                        cellObj.readOnly = true;
                        let areas = _GET_CHILD_33_AREAS();
                        switch (hn.i) {
                            case 'level_m_s':
                                cellObj.value = 'TOTALES'
                                cellObj.className = 'fw-bold'
                                break;
                            case 'build_0':
                                cellObj.value = _GET_TOTAL_AREAS('build', 0, ',').toFixed(2)
                                cellObj.className = 'text-success fw-bold'
                                break;
                            case 'build_1':
                                cellObj.value = _GET_TOTAL_AREAS('build', 1, ',').toFixed(2)
                                cellObj.className = 'text-success fw-bold'
                                break;
                            case 'build_2':
                                cellObj.value = _GET_TOTAL_AREAS('build', 2, ',').toFixed(2)
                                cellObj.className = 'text-success fw-bold'
                                break;
                            case 'build_3':
                                cellObj.value = _GET_TOTAL_AREAS('build', 3, ',').toFixed(2)
                                cellObj.className = 'text-success fw-bold'
                                break;
                            case 'build_4':
                                cellObj.value = _GET_TOTAL_AREAS('build', 4, ',').toFixed(2)
                                cellObj.className = 'text-success fw-bold'
                                break;
                            case 'build_5':
                                cellObj.value = _GET_TOTAL_AREAS('build', 5, ',').toFixed(2)
                                cellObj.className = 'text-success fw-bold'
                                break;
                            case 'build_6':
                                cellObj.value = _GET_TOTAL_AREAS('build', 6, ',').toFixed(2)
                                cellObj.className = 'text-success fw-bold'
                                break;
                            case 'build_7':
                                cellObj.value = _GET_TOTAL_AREAS('build', 7, ',').toFixed(2)
                                cellObj.className = 'text-success fw-bold'
                                break;
                            case 'build_8':
                                cellObj.value = _GET_TOTAL_AREAS('build', 8, ',').toFixed(2)
                                cellObj.className = 'text-success fw-bold'
                                break;
                            case 'build_9':
                                cellObj.value = _GET_TOTAL_AREAS('build', 9, ',').toFixed(2)
                                cellObj.className = 'text-success fw-bold'
                                break;
                            case 'build_10':
                                cellObj.value = _GET_TOTAL_AREAS('build', 10, ',').toFixed(2)
                                cellObj.className = 'text-success fw-bold'
                                break;
                            case 'destroy_0':
                                cellObj.value = _GET_TOTAL_AREAS('destroy', 0, ',').toFixed(2)
                                cellObj.className = 'text-danger fw-bold'
                                break;
                            case 'destroy_1':
                                cellObj.value = _GET_TOTAL_AREAS('destroy', 1, ',').toFixed(2)
                                cellObj.className = 'text-danger fw-bold'
                                break;
                            case 'destroy_2':
                                cellObj.value = _GET_TOTAL_AREAS('destroy', 2, ',').toFixed(2)
                                cellObj.className = 'text-danger fw-bold'
                                break;
                            case 'destroy_3':
                                cellObj.value = _GET_TOTAL_AREAS('destroy', 3, ',').toFixed(2)
                                cellObj.className = 'text-danger fw-bold'
                                break;
                            case 'destroy_4':
                                cellObj.value = _GET_TOTAL_AREAS('destroy', 4, ',').toFixed(2)
                                cellObj.className = 'text-danger fw-bold'
                                break;
                            case 'destroy_5':
                                cellObj.value = _GET_TOTAL_AREAS('destroy', 5, ',').toFixed(2)
                                cellObj.className = 'text-danger fw-bold'
                                break;
                            case 'destroy_6':
                                cellObj.value = _GET_TOTAL_AREAS('destroy', 6, ',').toFixed(2)
                                cellObj.className = 'text-danger fw-bold'
                                break;
                            case 'destroy_7':
                                cellObj.value = _GET_TOTAL_AREAS('destroy', 7, ',').toFixed(2)
                                cellObj.className = 'text-danger fw-bold'
                                break;
                            case 'units_0':
                                cellObj.value = _GET_TOTAL_AREAS('units', 0, ';').toFixed(2)
                                cellObj.className = 'text-warning fw-bold'
                                break;
                            case 'units_1':
                                cellObj.value = _GET_TOTAL_AREAS('units', 1, ';').toFixed(2)
                                cellObj.className = 'text-warning fw-bold'
                                break;
                            case 'units_2':
                                cellObj.value = _GET_TOTAL_AREAS('units', 2, ';').toFixed(2)
                                cellObj.className = 'text-warning fw-bold'
                                break;
                            case 'units_3':
                                cellObj.value = _GET_TOTAL_AREAS('units', 3, ';').toFixed(2)
                                cellObj.className = 'text-warning fw-bold'
                                break;
                            case 'units_4':
                                cellObj.value = _GET_TOTAL_AREAS('units', 4, ';').toFixed(2)
                                cellObj.className = 'text-warning fw-bold'
                                break;
                            case 'units_5':
                                cellObj.value = _GET_TOTAL_AREAS('units', 5, ';').toFixed(2)
                                cellObj.className = 'text-warning fw-bold'
                                break;
                            case 'units_6':
                                cellObj.value = _GET_TOTAL_AREAS('units', 6, ';').toFixed(2)
                                cellObj.className = 'text-warning fw-bold'
                                break;
                            case 'units_7':
                                cellObj.value = _GET_TOTAL_AREAS('units', 7, ';').toFixed(2)
                                cellObj.className = 'text-warning fw-bold'
                                break;
                            case 'units_8':
                                cellObj.value = _GET_TOTAL_AREAS('units', 8, ';').toFixed(2)
                                cellObj.className = 'text-warning fw-bold'
                                break;
                            case 'units_a_0':
                                cellObj.value = _GET_TOTAL_AREAS('units_a', 0, ';').toFixed(2)
                                cellObj.className = 'text-primary fw-bold'
                                break;
                            case 'units_a_1':
                                cellObj.value = _GET_TOTAL_AREAS('units_a', 1, ';').toFixed(2)
                                cellObj.className = 'text-primary fw-bold'
                                break;
                            case 'units_a_2':
                                cellObj.value = _GET_TOTAL_AREAS('units_a', 2, ';').toFixed(2)
                                cellObj.className = 'text-primary fw-bold'
                                break;
                            case 'units_a_3':
                                cellObj.value = _GET_TOTAL_AREAS('units_a', 3, ';').toFixed(2)
                                cellObj.className = 'text-primary fw-bold'
                                break;
                            case 'units_a_4':
                                cellObj.value = _GET_TOTAL_AREAS('units_a', 4, ';').toFixed(2)
                                cellObj.className = 'text-primary fw-bold'
                                break;
                            case 'units_a_5':
                                cellObj.value = _GET_TOTAL_AREAS('units_a', 5, ';').toFixed(2)
                                cellObj.className = 'text-primary fw-bold'
                                break;
                            case 'units_a_6':
                                cellObj.value = _GET_TOTAL_AREAS('units_a', 6, ';').toFixed(2)
                                cellObj.className = 'text-primary fw-bold'
                                break;
                            case 'units_a_7':
                                cellObj.value = _GET_TOTAL_AREAS('units_a', 7, ';').toFixed(2)
                                cellObj.className = 'text-primary fw-bold'
                                break;
                            case 'units_a_8':
                                cellObj.value = _GET_TOTAL_AREAS('units_a', 8, ';').toFixed(2)
                                cellObj.className = 'text-primary fw-bold'
                                break;
                            case 'build_total':
                                let total_1 = 0;
                                areas.map(a => total_1 += Number(_GET_TOTAL_AREA(a.build, a.historic_areas)))
                                cellObj.value = total_1.toFixed(2)
                                cellObj.className = 'text-secondary fw-bold'
                                break;
                            case 'destroy_total':
                                let total_2 = 0;
                                areas.map(a => total_2 += Number(_GET_TOTAL_DESTROY(a.destroy)))
                                cellObj.value = total_2.toFixed(2)
                                cellObj.className = 'text-secondary fw-bold'
                                break;
                            case 'net_total':
                                let total_3 = 0;
                                areas.map(a => total_3 += Number(_GET_NET_INDEX(a.build, a.destroy, a.historic_areas)))
                                cellObj.value = total_3.toFixed(2)
                                cellObj.className = 'text-secondary fw-bold'
                                break;
                            case 'int_total':
                                let total_4 = 0;
                                areas.map(a => total_4 += Number(_ADD_AREAS(a.build)))
                                cellObj.value = total_4.toFixed(2)
                                cellObj.className = 'text-secondary fw-bold'
                                break;
                            default:
                                cellObj.value = hn.dv;
                                break;
                        }

                        if (_h.includes('*')) {
                            tagsH.map((tag, i) => {
                                if (_h == '*' + tag) {
                                    cellObj.value = _GET_TOTAL_AREAS('historic_areas', i, ';').toFixed(2)
                                    cellObj.className = 'fw-bold text-dark'
                                }
                            })
                        }


                        if (_h.includes('Empate: ')) {
                            tagsE.map((tag, i) => {
                                if (_h == 'Empate: ' + tag) {
                                    cellObj.value = _GET_TOTAL_AREAS('empate_h', i, ';').toFixed(2)
                                    cellObj.className = 'fw-bold text-dark'
                                }
                            })
                        }



                        cell.push(cellObj)
                    }
                })
            })
            return cell;
        }

        _data.push(totalCell())
        setData(_data);
    }
    function _NEW_BD() {
        let fl = document.getElementById('create_b_fl').value;
        let ss = document.getElementById('create_b_ss').value;
        let st = document.getElementById('create_b_st').value;
        fl = Number(fl);
        if (fl < 0) fl = 0;
        ss = Number(ss);
        if (ss < 0) ss = 0;
        st = Number(st);
        if (st < 0) st = 0;
        _ADD_TO_TABLE(fl, ss, st)
    }

    function _ADD_TO_TABLE(_fl, _ss, _st) {
        let fl = _fl ?? 1;
        let ss = _ss ?? 0;
        let st = _st ?? 0;

        var newData = [...data];

        for (let i = fl; i > 0; i--) {
            let newRow = Array.from(data[0]).map(v => { return { name: v.name } })
            let rowAdd = { value: "Piso " + (i), name: 'floor', }
            newRow.splice(3, 1, rowAdd)
            newData.splice(newData.length - 1, 0, newRow)
        }


        for (let i = 0; i < ss; i++) {
            let newRow = Array.from(data[0]).map(v => { return { name: v.name } })
            let rowAdd = { value: "Semisótano", name: 'floor', }
            newRow.splice(3, 1, rowAdd)
            newData.splice(newData.length - 1, 0, newRow)
        }

        for (let i = 0; i < st; i++) {
            let newRow = Array.from(data[0]).map(v => { return { name: v.name } })
            let rowAdd = { value: "Sótano " + (i + 1), name: 'floor', }
            newRow.splice(3, 1, rowAdd)
            newData.splice(newData.length - 1, 0, newRow)
        }




        setData(newData)
    }
    function _REMOVE_TO_TABLE() {
        let st = document.getElementById('delete_pos_area').value;
        let en = document.getElementById('delete_pos_area_end').value;
        st = Number(st);
        en = Number(en);
        if (st > en) {
            let saven = st;
            st = en;
            en = saven;
        }

        st = Number(st) - 1;
        if (!en) en = Number(st) + 1;
        else en = Number(en);
        if (st < 0) st = 0;
        if (en < 0) en = st + 1;

        let del = en - st;
        if (del == 0) del = 1;
        let newData = Array.from(data);;
        newData.splice(st, del)

        setData(newData)
    }
    // ******************************* JSX ***************************** // 
    let _COMPONENT_TABLE = () => {
        return <>
            <div className='row container-sh'>
                <Spreadsheet data={data} onChange={(d) => { setData(d) }} columnLabels={Header}>
                </Spreadsheet>
            </div>
        </>
    }
    let _COMPONENT_BTNS = () => {
        return <>
            <div className='row'>
                <div className='col-8'>
                    <div class="btn-group btn-group-sm" role="group" aria-label="...">
                        <MDBBtn color='primary' outline={!openConfig} size='sm'
                            onClick={() => setOc(!openConfig)}>CONFIGURAR TABLA</MDBBtn>
                        <MDBBtn color='primary' outline size='sm'
                            onClick={() => _ADD_TO_TABLE()}>NUEVA FILA</MDBBtn>
                        <MDBBtn color='success' outline size='sm'
                            onClick={() => manage_areas(false)}>GUARDAR CAMBIOS</MDBBtn>
                    </div>
                    <div>
                        {saving == 0 ?
                            <label className='fw-bold'>GUARDANDO...</label>
                            : ''}
                        {saving == 1 ?
                            <label className='fw-bold text-success'>DATOS GUARDADOS</label>
                            : ''}
                    </div>

                </div>
                <div className='col text-end'>
                    <div class="btn-group btn-group-sm" role="group" aria-label="...">
                        <input type='number' step={1} className="border-danger text-end" style={{ width: '50px' }} id="delete_pos_area" />
                        <input type='number' step={1} className="border-danger text-end" style={{ width: '50px' }} id="delete_pos_area_end" />
                        <MDBBtn color='danger' outline size='sm'
                            onClick={() => _REMOVE_TO_TABLE()}>ELIMINAR FILA</MDBBtn>
                    </div>
                </div>
            </div>
        </>
    }
    let _COMPONENT_CONFIG = () => {
        let CHILD_1 = _GET_CHILD_1();
        let STEP = LOAD_STEP('a_config');
        let LEVEL_RULE = _GET_STEP_TYPE('a_config', 'check')
        let json = STEP ? STEP.json ?? {} : {};
        json = getJSON_Simple(json)
        let tagsH = json.tagh ? json.tagh.split(';') : [];
        let tagsE = json.tage ? json.tage.split(';') : [];
        let destroy_cb = json.destroy_cb ? json.destroy_cb.split(';') : [];
        let units_cb = json.units_cb ? json.units_cb.split(';') : [];
        let units_a_cb = json.units_a_cb ? json.units_a_cb.split(';') : [];
        let child_1_cb = [
            CHILD_1.m_lic.includes('G'),
            CHILD_1.m_lic.includes('g'),
            CHILD_1.m_lic.includes('A'),
            CHILD_1.tipo.includes('F'),
            CHILD_1.m_lic.includes('B'),
            CHILD_1.m_lic.includes('C'),
            CHILD_1.m_lic.includes('D'),
            CHILD_1.m_lic.includes('E'),
            CHILD_1.m_lic.includes('F'),
            CHILD_1.m_lic.includes('H'),
            CHILD_1.m_lic.includes('I'),

        ]
        return <>
            <MDBCollapse show={openConfig}>
                <div className='row border p-2'>
                    <div className='row mb-1'>
                        <div className='col'>
                            <label className='mx-2 fw-bold'>Añadir Otros (Históricos, Etapas, etc...):</label>
                            <ReactTagInput
                                tags={tagsH}
                                placeholder="Histórico..."
                                onChange={(newTags) => { setTagH(newTags); manage_step(newTags, 'h') }}
                                removeOnBackspace={true}
                                ref={tagHRef}
                            />
                        </div>
                        <div className='col'>
                            <label className='mx-2 fw-bold'>Añadir Empate:</label>
                            <ReactTagInput
                                tags={tagsE}
                                placeholder="Empate..."
                                onChange={(newTags) => { setTagE(newTags); manage_step(newTags, 'e') }}
                                removeOnBackspace={true}
                                ref={tagERef}
                            />
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col-6 mb-1'>
                            <label className='mx-2 fw-bold'>Usar Áreas Modalidad:</label>
                            {type_check.map((val, i) => {
                                return <>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input my-0" type="checkbox" name="type_cb"
                                            defaultChecked={child_1_cb[i]} onChange={() => manage_step(false, 'f1')} />
                                        <h5 class="form-check-label fw-normal" for="inlineCheckbox1">{val}</h5>
                                    </div>
                                </>
                            })}
                        </div>
                        <div className='col-6 mb-1'>
                            <label className='mx-2 fw-bold'>Usar Áreas descontadas:</label>
                            {destory_check.map((val, i) => {
                                return <>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input my-0" type="checkbox" name="destroy_cb"
                                            defaultChecked={destroy_cb[i] == 'true'} onChange={() => manage_step()} />
                                        <h5 class="form-check-label fw-normal" for="inlineCheckbox1">{val}</h5>
                                    </div>
                                </>
                            })}
                        </div>
                        <div className='col-6'>
                            <label className='mx-2  fw-bold'>Usar Unidades Privadas:</label>
                            {units_check.map((val, i) => {
                                return <>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input my-0" type="checkbox" name="units_cb"
                                            defaultChecked={units_cb[i] == 'true'} onChange={() => manage_step()} />
                                        <h5 class="form-check-label fw-normal" for="inlineCheckbox1">{val}</h5>
                                    </div>
                                </>
                            })}
                        </div>
                        <div className='col-6'>
                            <label className='mx-2  fw-bold'>Usar Áreas Privadas:</label>
                            {units_a_check.map((val, i) => {
                                return <>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input my-0" type="checkbox" name="units_a_cb"
                                            defaultChecked={units_a_cb[i] == 'true'} onChange={() => manage_step()} />
                                        <h5 class="form-check-label fw-normal" for="inlineCheckbox1">{val}</h5>
                                    </div>
                                </>
                            })}
                        </div>
                    </div>
                    <div className='row'>
                        <label className='mx-2 mt-2 fw-bold'>Crear edificio:</label>
                        <div className='col-2'>
                            <div class="input-group mb-2">
                                <div class="input-group-prepend">
                                    <div class="input-group-text">Pis.</div>
                                </div>
                                <input type='number' step={1} min={0} defaultValue={1} className="text-end form-control" id="create_b_fl" />
                            </div>
                        </div>
                        <div className='col-2'>
                            <div class="input-group mb-2">
                                <div class="input-group-prepend">
                                    <div class="input-group-text">Smt.</div>
                                </div>
                                <input type='number' step={1} min={0} max={1} defaultValue={0} className="text-end form-control" id="create_b_ss" />
                            </div>
                        </div>
                        <div className='col-2'>
                            <div class="input-group mb-2">
                                <div class="input-group-prepend">
                                    <div class="input-group-text">Sót.</div>
                                </div>
                                <input type='number' step={1} min={0} defaultValue={0} className="text-end form-control" id="create_b_st" />
                            </div>
                        </div>
                        <div className='col-3'>
                            <MDBBtn color='primary' outline size='sm' onClick={() => _NEW_BD()}>CREAR</MDBBtn>
                        </div>
                        <div className='col'>
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="cb_level_rule" onChange={() => manage_step()} defaultChecked={LEVEL_RULE[0] == '1'} />
                                <label class="form-check-label fw-bold" for="cb_level_rule">Usar nivel m aditivo</label>
                            </div>
                        </div>
                    </div>
                </div>
            </MDBCollapse>

        </>
    }
    // ******************************* APIS **************************** // 

    // ************
    let manage_areas = (useSwal) => {
        setSaving(0);
        saveCounter = 0;
        let newItems = [];
        let originalAreas = _GET_CHILD_33_AREAS();
        let getCellByName = (_cells, _name) => {
            let find = _cells.find(c => {
                if (c == undefined) return undefined;
                return c.name == _name
            });
            if (find) return (find.value ?? '').replaceAll(',', '.');
            else return undefined;
        }
        let setItem = (cells) => {
            let build = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            let destroy = Array(destory_check.length).fill(0);
            let units = Array(units_check.length).fill(0);
            let units_a = Array(units_a_check.length).fill(0);
            for (let i = 0; i < build.length; i++) {
                build[i] = getCellByName(cells, 'build_' + i) || 0;
            }
            for (let i = 0; i < destroy.length; i++) {
                destroy[i] = getCellByName(cells, 'destroy_' + i) || 0;
            }
            for (let i = 0; i < units.length; i++) {
                units[i] = getCellByName(cells, 'units_' + i) || 0;
            }
            for (let i = 0; i < units_a.length; i++) {
                units_a[i] = getCellByName(cells, 'units_a_' + i) || 0;
            }


            let historic = [];
            let empate = [];
            let STEP = LOAD_STEP('a_config');
            let json = STEP ? STEP.json ?? {} : {};
            json = getJSON_Simple(json)
            let tagsHL = json.tagh ? json.tagh.split(';').length : [];
            let tagsEL = json.tage ? json.tage.split(';').length : [];
            for (let i = 0; i < tagsHL; i++) {
                historic.push(getCellByName(cells, 'histocic_' + i) || 0)
            }
            for (let i = 0; i < tagsEL; i++) {
                empate.push(getCellByName(cells, 'empate_' + i) || 0)
            }


            let newArea = {
                id_public: getCellByName(cells, 'id_public') ?? '',
                scale: getCellByName(cells, 'scale') ?? '',
                floor: getCellByName(cells, 'floor') ?? '',
                level: (getCellByName(cells, 'level_n') ?? '') + '&' + (getCellByName(cells, 'level_m') ?? ''),
                build: build.join(','),
                use: getCellByName(cells, 'use') ?? '',
                destroy: destroy.join(','),
                units: units.join(';'),
                units_a: units_a.join(';'),
                historic_areas: historic.join(';'),
                empate_h: empate.join(';'),
            }
            let formData = new FormData();
            formData.set('id_public', newArea.id_public);
            formData.set('scale', newArea.scale);
            formData.set('floor', newArea.floor);
            formData.set('level', newArea.level);
            formData.set('use', newArea.use);

            formData.set('build', newArea.build);
            formData.set('destroy', newArea.destroy);
            formData.set('units', newArea.units);
            formData.set('units_a', newArea.units_a);

            formData.set('historic_areas', newArea.historic_areas);
            formData.set('empate_h', newArea.empate_h);

            return formData;
        }

        let updateCells = [];
        let newCells = [];
        let delCells = [];

        let finish_flag = data.length - 2;

        data.map((d, i) => {
            if (i < finish_flag + 1) {
                let _id = d[0].value ?? d[0].id;
                if (_id) {
                    if (originalAreas.some(a => a.id == _id)) updateCells.push(d);
                }
                if (!_id) { newCells.push(d); }
            }
        })

        originalAreas.map(a => {
            if (!data.find(d => d[0].id == a.id)) delCells.push([{ id: a.id }])

        })

        let end_counter = updateCells.length + delCells.length + newCells.length;

        updateCells.map((cells, i) => {
            if (cells[0].ignore) return;
            let formData = setItem(cells);
            update_area(cells[0].id, formData, false, i, end_counter);
        });
        newCells.map((newItem) => {
            let formData = setItem(newItem);
            formData.set('recordArcId', currentRecord.id);
            formData.set('active', 1);
            formData.set('type', "area");
            create_area(formData, false, newItem.i, end_counter)
        });
        delCells.map(cell => {
            delete_areas(cell[0].id, false, end_counter)
        });
    }
    let create_area = (formData, useSwal, i, fg) => {
        if (useSwal) MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        RECORD_ARCSERVICE.create_arc_33_area(formData)
            .then(response => {
                if (response.data === 'OK') {
                    if (useSwal) MySwal.fire({
                        title: swaMsg.publish_success_title,
                        text: swaMsg.publish_success_text,
                        footer: swaMsg.text_footer,
                        icon: 'success',
                        confirmButtonText: swaMsg.text_btn,
                    });
                    saveCounter++;
                    if (saveCounter == fg) {
                        props.requestUpdateRecord(currentItem.id);
                        setSaving(1);
                    }
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
                if (useSwal) MySwal.fire({
                    title: swaMsg.generic_eror_title,
                    text: swaMsg.generic_error_text,
                    icon: 'warning',
                    confirmButtonText: swaMsg.text_btn,
                });
            });
    }
    let update_area = (_id, _form, useSwal, i, fg) => {
        if (useSwal) MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        RECORD_ARCSERVICE.update_arc_33_area(_id, _form)
            .then(response => {
                if (response.data === 'OK') {
                    if (useSwal) MySwal.fire({
                        title: swaMsg.publish_success_title,
                        text: swaMsg.publish_success_text,
                        footer: swaMsg.text_footer,
                        icon: 'success',
                        confirmButtonText: swaMsg.text_btn,
                    });
                    saveCounter++;
                    if (saveCounter == fg) {
                        props.requestUpdateRecord(currentItem.id);
                        setSaving(1);
                    }
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
                if (useSwal) MySwal.fire({
                    title: swaMsg.generic_eror_title,
                    text: swaMsg.generic_error_text,
                    icon: 'warning',
                    confirmButtonText: swaMsg.text_btn,
                });
            });
    }
    let delete_areas = (id, useSwal, fg) => {
        RECORD_ARCSERVICE.delete_33_area_byId(id)
            .then(response => {
                if (response.data === 'OK') {
                    if (useSwal) MySwal.fire({
                        title: swaMsg.publish_success_title,
                        text: swaMsg.publish_success_text,
                        footer: swaMsg.text_footer,
                        icon: 'success',
                        confirmButtonText: swaMsg.text_btn,
                    });
                    saveCounter++;
                    if (saveCounter == fg) {
                        props.requestUpdateRecord(currentItem.id);
                        setSaving(1);
                    }

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
    // ************


    let manage_fun_1 = () => {
        let formData = new FormData();
        let version = currentVersion;
        let fun0Id = currentItem.id;
        formData.set('version', version);
        formData.set('fun0Id', fun0Id);

        let value = null;
        let checkbox = null;
        let F1A = ['G', 'g', 'A', 'F', 'B', 'C', 'D', 'E', 'F', 'H', 'I',]
        // SET OF THE VARIABLES

        value = []
        checkbox = document.getElementsByName("type_cb");
        for (var i = 0; i < 10; i++) {
            if (i == 3) continue;
            if (checkbox[i].checked) {
                value.push(F1A[i])
            }
        } formData.set('m_lic', value.join(','));

        let _CHILD_1 = _GET_CHILD_1();
        value = _CHILD_1.tipo.split(',');
        if (!checkbox[3].checked) {
            const index = value.indexOf('F');
            if (index > -1) {
                value.splice(index, 1);
            }
        }
        if (checkbox[3].checked) {
            const index = value.indexOf('F');
            if (index == -1) {
                value.push('F');
            }
            value.sort()
        }
        formData.set('tipo', value.join(','));
        save_fun_1(formData, false)
    }
    let save_fun_1 = (formData, useSwal) => {
        let _CHILD_1 = _GET_CHILD_1();

        if (useSwal) MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });

        if (!_CHILD_1.id) {
            FUNService.create_fun1(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        if (useSwal) MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        props.requestUpdate(currentItem.id)
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
        } else {
            FUNService.update_1(_CHILD_1.id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        if (useSwal) MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        props.requestUpdate(currentItem.id)
                    }
                })
                .catch(e => {
                    console.log(e);
                });
        }
    }

    let manage_step = (tags, type) => {
        var formData = new FormData();
        let STEP = LOAD_STEP('a_config');

        let json = STEP ? STEP.json ?? {} : {};
        json = getJSON_Simple(json)

        if (type == 'f1') manage_fun_1();
        if (type == 'h') json.tagh = tags.join(';');
        else json.tagh = json.tagh;

        if (type == 'e') json.tage = tags.join(';');
        else json.tage = json.tage;

        let check = [];
        let cb_html = document.getElementsByName('destroy_cb');
        for (let i = 0; i < cb_html.length; i++) {
            const cb = cb_html[i];
            check.push(cb.checked)
        }
        json.destroy_cb = check.join(';');

        check = [];
        cb_html = document.getElementsByName('units_cb');
        for (let i = 0; i < cb_html.length; i++) {
            const cb = cb_html[i];
            check.push(cb.checked)
        }
        json.units_cb = check.join(';');

        check = [];
        cb_html = document.getElementsByName('units_a_cb');
        for (let i = 0; i < cb_html.length; i++) {
            const cb = cb_html[i];
            check.push(cb.checked)
        }
        json.units_a_cb = check.join(';');


        var checks_html = document.getElementById('cb_level_rule').checked ? 1 : 0;
        formData.set('check', checks_html);

        //console.log(JSON.stringify(json))
        formData.set('json', JSON.stringify(json));
        formData.set('version', currentVersionR);
        formData.set('recordArcId', currentRecord.id);
        formData.set('id_public', 'a_config');

        save_step('a_config', false, formData);

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
            RECORD_ARCSERVICE.update_step(STEP.id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        if (useSwal) MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        props.requestUpdateRecord(currentItem.id);
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
            RECORD_ARCSERVICE.create_step(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        if (useSwal) MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        props.requestUpdateRecord(currentItem.id);
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
        <div>
            {_COMPONENT_TABLE()}
            {_COMPONENT_BTNS()}
            {_COMPONENT_CONFIG()}
        </div >
    );
}
