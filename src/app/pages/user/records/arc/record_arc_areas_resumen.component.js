import React, { useEffect, useState } from 'react';

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { _FUN_1_PARSER } from '../../../../components/customClasses/funCustomArrays';
import { getJSON_Simple } from '../../../../components/customClasses/typeParse';
import "@silevis/reactgrid/styles.css";
import DataTable from 'react-data-table-component';

var tagHRef = React.createRef();
var tagERef = React.createRef();

export default function RECORD_ARC_AREAS_RESUME(props) {
    const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR } = props;
    const _Header = [
        "#",
        "Sótano/Piso",
        "ID Plano",
        "Escala",
        "Nivel N",
        "Nivel m",
        "Suma/Entre Piso",
        // HERE ADD HISTORIC
        // HERE ADD EMPATE
        // HERE ADD TYPES

        "Área total construida",
        "Área total descontar",
        "Área total neta",
        "Área total intervenida",
        "Uso Principal",
        // HERE ADD NEGATIVE

        // HERE ADD UNITS

        // HERE ADD UNITS AREAS
    ];
    const destory_check = ["Parqueaderos",
        "Cesión Tipo B",
        "Cuartos Técnicos",
        "Tanques de agua",
        //"Pto Fijo. Ascensor",
        "Pto Fijo",
        //"Pto Fijo. Corredor",
        "Otros"];

    const units_check = ["U Viviendas",
        "U Locales",
        "U Parcelas",
        "U Parqueos",
        "U Oficinas",
        "U Bodegas",
        "U Apartamentos",
        "U Depositos",
        "U Lotes",
        "U Dotacional",
        "U Industrial",
        "U Otros",
    ];

    const units_a_check = ["A Viviendas",
        "A Locales",
        "A Parcelas",
        "A Parqueos",
        "A Oficinas",
        "A Bodegas",
        "A Apartamentos",
        "A Depositos",
        "A Lotes",
        "A Dotacional",
        "A Industrial",
        "A Otros",
    ];

    const publicXindexName = [
        { n: "#", i: 'id', dv: '', },
        { n: "ID Plano", i: 'id_public', dv: '', },
        { n: "Escala", i: 'scale', dv: '', },
        { n: "Sótano/Piso", i: 'floor', dv: '', },
        { n: "Nivel N", i: 'level_n', dv: '', },
        { n: "Nivel m", i: 'level_m', dv: '', },
        { n: "Suma/Entre Piso", i: 'level_m_s', dv: '', },
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
        { n: 'Reconocida', i: 'build_10', dv: '0', },
        { n: 'Ampliada', i: 'build_1', dv: '0', },
        { n: 'Adecuación', i: 'build_2', dv: '0', },
        { n: 'Modificada', i: 'build_3', dv: '0', },
        { n: 'Restaurada', i: 'build_4', dv: '0', },
        { n: 'Reforzada', i: 'build_5', dv: '0', },
        { n: 'Cerrada', i: 'build_9', dv: '0', },
        { n: 'Reconstruida', i: 'build_8', dv: '0', },

        { n: "Parqueaderos", i: 'destroy_0', dv: '0', },
        { n: "Cesión Tipo B", i: 'destroy_1', dv: '0', },
        { n: "Cuartos Técnicos", i: 'destroy_2', dv: '0', },
        { n: "Tanques de agua", i: 'destroy_3', dv: '0', },
        //{ n: "Pto Fijo. Ascensor", i: 'destroy_4', dv: '0', },
        { n: "Pto Fijo", i: 'destroy_4', dv: '0', },
        //{ n: "Pto Fijo. Corredor", i: 'destroy_6', dv: '0', },
        { n: "Otros", i: 'destroy_5', dv: '0', },

        ...units_check.map((v, i) => {
            return {
                n: v,
                i: `units_${i}`,
                dv: '0',
            }
        }),

        ...units_a_check.map((v, i) => {
            return {
                n: v,
                i: `units_a_${i}`,
                dv: '0',
            }
        }),
    ];

    var [data, setData] = useState([]);
    var [Header, setHeader] = useState(_Header)

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
                if (_CHILD[i].type === "area") {
                    _AREAS.push(_CHILD[i])
                }
            }
        }
        return _AREAS;
    }
    let LOAD_STEP = (_id_public) => {
        var _CHILD = currentRecord.record_arc_steps;
        for (var i = 0; i < _CHILD.length; i++) {
            if (_CHILD[i].version === currentVersionR && _CHILD[i].id_public === _id_public) return _CHILD[i]
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
    let _ADD_AREAS = (_array, ss = ",") => {
        if (!_array) return 0;
        var areas = _array.split(ss);
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
    let _GET_AJUSTES = (_historic) => {
        let STEP = LOAD_STEP('a_config');
        let json = STEP ? STEP.json ?? {} : {};
        json = getJSON_Simple(json)
        let tagsH = json.tagh ? json.tagh.split(';') : [];
        var historic = _historic ? _historic.split(';') : [];
        let reduced = historic.filter((_h, i) => {
            if (!tagsH[i]) return false
            let tag = tagsH[i].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            return tag.includes('ajuste');
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
        var ajustes = _GET_AJUSTES(_historic)
        if (build[0] > 0) area_1 += Number(build[0]);
        if (build[1] > 0) area_1 += Number(build[1]);
        if (build[10] > 0) area_1 += Number(build[10]);
        //if (build[6] > 0) area_5 = Number(build[6]);
        if (build[7] > 0) area_5 += Number(build[7]);
        var _TOTAL_AREA = Number(historic) + Number(ajustes) + area_1 - area_5;
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
        var _NET_IDEX = Number(areaToBuild) - Number(destroy);
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
        let con = floor_c[0].toLowerCase() === 's';
        let firstFloorHeight = 0;
        let currentfloorName = (_floor || '').toLowerCase().includes('piso');
        let currentfloorNumber = (_floor || '').replace(/^\D+/g, '');

        let areas = _GET_CHILD_33_AREAS();
        areas.sort((a, b) => array_sort(a, b));

        let new_areas = areas.filter(item => {
            let floor = item.floor ? item.floor : ' ';
            floor = (floor).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            let floorName = (floor).includes('piso');
            let floorNumber = (floor).replace(/^\D+/g, '');
            if (floorName && floorNumber === 1) firstFloorHeight = item.level ? Number(item.level.split('&')[1]) : 0;

            if (con) {
                let con2 = floor[0] === 's';
                return con2;
            } else {
                let con1 = (floor).includes('cubierta');
                let con3 = (floor).includes('piso');
                let con4 = (floor).replace(/^\D+/g, '');
                let con2 = floor[0] === 's';
                return !con2;
            }
        });
        let floor_index = -1;
        let sum = 0;
        if (con) new_areas.reverse();

        new_areas.map((item, i) => { if (_floor === item.floor) floor_index = i; })
        if (floor_index != -1) {
            if (DA_RULE === '1') {
                let inferior_i = -1;
                new_areas.map((item, i) => {
                    if (_floor === item.floor) {
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
                    let floor = item.floor ? item.floor : ' ';
                    floor = (floor).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    let con = floor != 'piso 1';
                    if (floor_index <= i && con) {
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
        let item = _item[_index] ? _item[_index].split(ss) : '0'
        item = item[i] || '0';
        if (Number(item)) return item
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
            if (strPartA[0] && strPartA[0].toLowerCase() === 's') {
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
        { value: (v, i) => i + 1, name: 'ref', id: (v) => v.id, pos: i => i, readOnly: true, className: 'text-muted' },
        { value: (v) => v.floor, name: 'floor', id: (v) => v.id, },
        { value: (v) => v.id_public || '', name: 'id_public', id: (v) => v.id, pos: i => i, },
        { value: (v) => v.scale || '', name: 'scale', id: (v) => v.id, },
        { value: (v) => v.level ? v.level.split('&')[0] : '', name: 'level_n', id: (v) => v.id, },
        { value: (v) => v.level ? v.level.split('&')[1] : '', name: 'level_m', id: (v) => v.id, },
        { value: (v) => _GET_SUM_LEVEL_BY_FLOOR(v.floor), name: 'level_m_s', className: 'text-secondary text-muted', readOnly: true, id: (v) => v.id, },
        // HERE ADD HISTORIC0
        // HERE ADD EMPATE
        // HERE ADD TYPES
        { value: (v) => _GET_TOTAL_AREA(v.build, v.historic_areas), name: 'build_total', readOnly: true, className: 'text-secondary', id: (v) => v.id, color: 'orchid', },
        { value: (v) => _GET_TOTAL_DESTROY(v.destroy), name: 'destroy_total', readOnly: true, className: 'text-secondary', id: (v) => v.id, color: 'orchid', },
        { value: (v) => _GET_NET_INDEX(v.build, v.destroy, v.historic_areas), name: 'net_total', readOnly: true, className: 'text-secondary', id: (v) => v.id, color: 'orchid', },
        { value: (v) => _ADD_AREAS(v.build), name: 'int_total', readOnly: true, className: 'text-secondary', id: (v) => v.id, color: 'orchid', },
        { value: (v) => v.use || '', name: 'use', id: (v) => v.id, },
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
                if (_LIST[i].type === "area") {
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
            _cells.splice(spliceOffset, 0, { value: (v) => _CHECK_AREA_STR(v, 'build', 9), name: 'build_9', color: 'green', id: (v) => v.id, },)
        }
        if (child.m_lic.includes('H') && !_header.includes('Reconstruida')) {
            _header.splice(spliceOffset, 0, 'Reconstruida')
            _cells.splice(spliceOffset, 0, { value: (v) => _CHECK_AREA_STR(v, 'build', 8), name: 'build_8', color: 'green', id: (v) => v.id, },)
        }
        if (child.m_lic.includes('F') && !_header.includes('Reforzada')) {
            _header.splice(spliceOffset, 0, 'Reforzada')
            _cells.splice(spliceOffset, 0, { value: (v) => _CHECK_AREA_STR(v, 'build', 5), name: 'build_5', color: 'green', id: (v) => v.id, },)
        }
        if (child.m_lic.includes('E') && !_header.includes('Restaurada')) {
            _header.splice(spliceOffset, 0, 'Restaurada')
            _cells.splice(spliceOffset, 0, { value: (v) => _CHECK_AREA_STR(v, 'build', 4), name: 'build_4', color: 'green', id: (v) => v.id, },)
        }
        if (child.m_lic.includes('D') && !_header.includes('Modificada')) {
            _header.splice(spliceOffset, 0, 'Modificada')
            _cells.splice(spliceOffset, 0, { value: (v) => _CHECK_AREA_STR(v, 'build', 3), name: 'build_3', color: 'green', id: (v) => v.id, },)
        }
        if (child.m_lic.includes('C') && !_header.includes('Adecuación')) {
            _header.splice(spliceOffset, 0, 'Adecuación')
            _cells.splice(spliceOffset, 0, { value: (v) => _CHECK_AREA_STR(v, 'build', 2), name: 'build_2', color: 'green', id: (v) => v.id, },)
        }
        if (child.m_lic.includes('B') && !_header.includes('Ampliada')) {
            _header.splice(spliceOffset, 0, 'Ampliada')
            _cells.splice(spliceOffset, 0, { value: (v) => _CHECK_AREA_STR(v, 'build', 1), name: 'build_1', color: 'green', id: (v) => v.id, },)
        }

        if (child.tipo.includes('F') && !_header.includes('Reconocida')) {
            _header.splice(spliceOffset, 0, 'Reconocida')
            _cells.splice(spliceOffset, 0, { value: (v) => _CHECK_AREA_STR(v, 'build', 10), name: 'build_10', color: 'green', id: (v) => v.id, },)
        }
        if (child.m_lic.includes('A') && !_header.includes('Obra Nueva')) {
            _header.splice(spliceOffset, 0, 'Obra Nueva')
            _cells.splice(spliceOffset, 0, { value: (v) => _CHECK_AREA_STR(v, 'build', 0), name: 'build_0', color: 'green', id: (v) => v.id, },)
        }


        if (child.m_lic.includes('g') && !_header.includes('Demolida parcial')) {
            _header.splice(spliceOffset, 0, 'Demolida parcial')
            _cells.splice(spliceOffset, 0, { value: (v) => _CHECK_AREA_STR(v, 'build', 7), name: 'build_7', color: 'green', id: (v) => v.id, },)
        }
        if (child.m_lic.includes('G') && !_header.includes('Demolida total')) {
            _header.splice(spliceOffset, 0, 'Demolida total')
            _cells.splice(spliceOffset, 0, { value: (v) => _CHECK_AREA_STR(v, 'build', 6), name: 'build_6', color: 'green', id: (v) => v.id, },)
        }


        tagsH.map((tag, i) => {
            if (!_header.includes(tag)) {
                _header.splice(spliceOffset + i, 0, '*' + tag)
                _cells.splice(spliceOffset + i, 0, { value: (v) => _CHECK_AREA_STR(v, 'historic_areas', i, ';'), name: 'histocic_' + i, color: 'green', id: (v) => v.id, })
            }
        })

        tagsE.map((tag, i) => {
            if (!_header.includes('Empate: ' + tag)) {
                _header.splice(spliceOffset + i, 0, 'Empate: ' + tag)
                _cells.splice(spliceOffset + i, 0, { value: (v) => _CHECK_AREA_STR(v, 'empate_h', i, ';'), name: 'empate_' + i, color: 'green', id: (v) => v.id, },)
            }
        })



        destory_check.map((label, i) => {
            if (destroy_cb[i] === 'true' && !_header.some(h => h === label)) {
                _header.push(label)
                _cells.push({ value: (v) => _CHECK_AREA_STR(v, 'destroy', i, ','), name: 'destroy_' + i, className: 'text-danger', color: 'red', id: (v) => v.id, },)
            }
        })

        units_check.map((label, i) => {
            if (units_cb[i] === 'true' && !_header.some(h => h === label)) {
                _header.push(label)
                _cells.push({ value: (v) => _CHECK_AREA_STR(v, 'units', i, ';'), name: 'units_' + i, className: 'text-warning', color: 'blue', id: (v) => v.id, },)
            }
        })

        units_a_check.map((label, i) => {
            if (units_a_cb[i] === 'true' && !_header.some(h => h === label)) {
                _header.push(label)
                _cells.push({ value: (v) => _CHECK_AREA_STR(v, 'units_a', i, ';'), name: 'units_a_' + i, className: 'text-primary', color: 'tomato', id: (v) => v.id, },)
            }
        })

        // SORTS THE ARRAYS AND PROCESS TO FILL THE VALUES OF THE SPREADSHEET
        setHeader(_header);
        var newData = _AREAS.sort((a, b) => array_sort(a, b));
        let cells = (v, i) => {
            return _cells.map((c, j) => {
                return {
                    value: c.value(v, i),
                    id: c.id ? c.id(v) : null,
                    pos: c.pos ? i : null,
                    name: c.name,
                    readOnly: c.readOnly,
                    className: c.className,
                    color: c.color,
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
                    let con_1 = _h === hn.n;
                    let con_2 = _h.includes('*') && hn.n === '*';
                    let con_3 = _h.includes('Empate:') && hn.n.includes('Empate:');
                    if (con_1 || con_2 || con_3) {
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
                                cellObj.className = 'text-success fw-bold';
                                cellObj.color = 'green';
                                break;
                            case 'build_1':
                                cellObj.value = _GET_TOTAL_AREAS('build', 1, ',').toFixed(2)
                                cellObj.className = 'text-success fw-bold'
                                cellObj.color = 'green';
                                break;
                            case 'build_2':
                                cellObj.value = _GET_TOTAL_AREAS('build', 2, ',').toFixed(2)
                                cellObj.className = 'text-success fw-bold';
                                cellObj.color = 'green';
                                break;
                            case 'build_3':
                                cellObj.value = _GET_TOTAL_AREAS('build', 3, ',').toFixed(2)
                                cellObj.className = 'text-success fw-bold';
                                cellObj.color = 'green';
                                break;
                            case 'build_4':
                                cellObj.value = _GET_TOTAL_AREAS('build', 4, ',').toFixed(2)
                                cellObj.className = 'text-success fw-bold';
                                cellObj.color = 'green';
                                break;
                            case 'build_5':
                                cellObj.value = _GET_TOTAL_AREAS('build', 5, ',').toFixed(2)
                                cellObj.className = 'text-success fw-bold';
                                cellObj.color = 'green';
                                break;
                            case 'build_6':
                                cellObj.value = _GET_TOTAL_AREAS('build', 6, ',').toFixed(2)
                                cellObj.className = 'text-success fw-bold';
                                cellObj.color = 'green';
                                break;
                            case 'build_7':
                                cellObj.value = _GET_TOTAL_AREAS('build', 7, ',').toFixed(2)
                                cellObj.className = 'text-success fw-bold';
                                cellObj.color = 'green';
                                break;
                            case 'build_8':
                                cellObj.value = _GET_TOTAL_AREAS('build', 8, ',').toFixed(2)
                                cellObj.className = 'text-success fw-bold';
                                cellObj.color = 'green';
                                break;
                            case 'build_9':
                                cellObj.value = _GET_TOTAL_AREAS('build', 9, ',').toFixed(2)
                                cellObj.className = 'text-success fw-bold';
                                cellObj.color = 'green';
                                break;
                            case 'build_10':
                                cellObj.value = _GET_TOTAL_AREAS('build', 10, ',').toFixed(2)
                                cellObj.className = 'text-success fw-bold';
                                cellObj.color = 'green';
                                break;
                            case 'destroy_0':
                                cellObj.value = _GET_TOTAL_AREAS('destroy', 0, ',').toFixed(2)
                                cellObj.className = 'text-danger fw-bold';
                                cellObj.color = 'red';
                                break;
                            case 'destroy_1':
                                cellObj.value = _GET_TOTAL_AREAS('destroy', 1, ',').toFixed(2)
                                cellObj.className = 'text-danger fw-bold';
                                cellObj.color = 'red';
                                break;
                            case 'destroy_2':
                                cellObj.value = _GET_TOTAL_AREAS('destroy', 2, ',').toFixed(2)
                                cellObj.className = 'text-danger fw-bold';
                                cellObj.color = 'red';
                                break;
                            case 'destroy_3':
                                cellObj.value = _GET_TOTAL_AREAS('destroy', 3, ',').toFixed(2)
                                cellObj.className = 'text-danger fw-bold'
                                cellObj.color = 'red';
                                break;
                            case 'destroy_4':
                                cellObj.value = _GET_TOTAL_AREAS('destroy', 4, ',').toFixed(2)
                                cellObj.className = 'text-danger fw-bold';
                                cellObj.color = 'red';
                                break;
                            case 'destroy_5':
                                cellObj.value = _GET_TOTAL_AREAS('destroy', 5, ',').toFixed(2)
                                cellObj.className = 'text-danger fw-bold';
                                cellObj.color = 'red';
                                break;
                            case 'destroy_6':
                                cellObj.value = _GET_TOTAL_AREAS('destroy', 6, ',').toFixed(2)
                                cellObj.className = 'text-danger fw-bold';
                                cellObj.color = 'red';
                                break;
                            case 'destroy_7':
                                cellObj.value = _GET_TOTAL_AREAS('destroy', 7, ',').toFixed(2)
                                cellObj.className = 'text-danger fw-bold';
                                cellObj.color = 'red';
                                break;
                            case 'units_0':
                                cellObj.value = _GET_TOTAL_AREAS('units', 0, ';').toFixed(2)
                                cellObj.className = 'text-warning fw-bold';
                                cellObj.color = 'blue';
                                break;
                            case 'units_1':
                                cellObj.value = _GET_TOTAL_AREAS('units', 1, ';').toFixed(2)
                                cellObj.className = 'text-warning fw-bold';
                                cellObj.color = 'blue';
                                break;
                            case 'units_2':
                                cellObj.value = _GET_TOTAL_AREAS('units', 2, ';').toFixed(2)
                                cellObj.className = 'text-warning fw-bold';
                                cellObj.color = 'blue';
                                break;
                            case 'units_3':
                                cellObj.value = _GET_TOTAL_AREAS('units', 3, ';').toFixed(2)
                                cellObj.className = 'text-warning fw-bold'
                                cellObj.color = 'blue';
                                break;
                            case 'units_4':
                                cellObj.value = _GET_TOTAL_AREAS('units', 4, ';').toFixed(2)
                                cellObj.className = 'text-warning fw-bold';
                                cellObj.color = 'blue';
                                break;
                            case 'units_5':
                                cellObj.value = _GET_TOTAL_AREAS('units', 5, ';').toFixed(2)
                                cellObj.className = 'text-warning fw-bold';
                                cellObj.color = 'blue';
                                break;
                            case 'units_6':
                                cellObj.value = _GET_TOTAL_AREAS('units', 6, ';').toFixed(2)
                                cellObj.className = 'text-warning fw-bold';
                                cellObj.color = 'blue';
                                break;
                            case 'units_7':
                                cellObj.value = _GET_TOTAL_AREAS('units', 7, ';').toFixed(2)
                                cellObj.className = 'text-warning fw-bold';
                                cellObj.color = 'blue';
                                break;
                            case 'units_8':
                                cellObj.value = _GET_TOTAL_AREAS('units', 8, ';').toFixed(2)
                                cellObj.className = 'text-warning fw-bold';
                                cellObj.color = 'blue';
                                break;
                            case 'units_9':
                                cellObj.value = _GET_TOTAL_AREAS('units', 9, ';').toFixed(2)
                                cellObj.className = 'text-warning fw-bold';
                                cellObj.color = 'blue';
                                break;
                            case 'units_10':
                                cellObj.value = _GET_TOTAL_AREAS('units', 10, ';').toFixed(2)
                                cellObj.className = 'text-warning fw-bold';
                                cellObj.color = 'blue';
                                break;
                            case 'units_11':
                                cellObj.value = _GET_TOTAL_AREAS('units', 11, ';').toFixed(2)
                                cellObj.className = 'text-warning fw-bold';
                                cellObj.color = 'blue';
                                break;
                            case 'units_a_0':
                                cellObj.value = _GET_TOTAL_AREAS('units_a', 0, ';').toFixed(2)
                                cellObj.className = 'text-primary fw-bold';
                                cellObj.color = 'tomato';
                                break;
                            case 'units_a_1':
                                cellObj.value = _GET_TOTAL_AREAS('units_a', 1, ';').toFixed(2)
                                cellObj.className = 'text-primary fw-bold';
                                cellObj.color = 'tomato';
                                break;
                            case 'units_a_2':
                                cellObj.value = _GET_TOTAL_AREAS('units_a', 2, ';').toFixed(2)
                                cellObj.className = 'text-primary fw-bold';
                                cellObj.color = 'tomato';
                                break;
                            case 'units_a_3':
                                cellObj.value = _GET_TOTAL_AREAS('units_a', 3, ';').toFixed(2)
                                cellObj.className = 'text-primary fw-bold';
                                cellObj.color = 'tomato';
                                break;
                            case 'units_a_4':
                                cellObj.value = _GET_TOTAL_AREAS('units_a', 4, ';').toFixed(2)
                                cellObj.className = 'text-primary fw-bold';
                                cellObj.color = 'tomato';
                                break;
                            case 'units_a_5':
                                cellObj.value = _GET_TOTAL_AREAS('units_a', 5, ';').toFixed(2)
                                cellObj.className = 'text-primary fw-bold';
                                cellObj.color = 'tomato';
                                break;
                            case 'units_a_6':
                                cellObj.value = _GET_TOTAL_AREAS('units_a', 6, ';').toFixed(2)
                                cellObj.className = 'text-primary fw-bold';
                                cellObj.color = 'tomato';
                                break;
                            case 'units_a_7':
                                cellObj.value = _GET_TOTAL_AREAS('units_a', 7, ';').toFixed(2)
                                cellObj.className = 'text-primary fw-bold';
                                cellObj.color = 'tomato';
                                break;
                            case 'units_a_8':
                                cellObj.value = _GET_TOTAL_AREAS('units_a', 8, ';').toFixed(2)
                                cellObj.className = 'text-primary fw-bold';
                                cellObj.color = 'tomato';
                                break;
                            case 'units_a_9':
                                cellObj.value = _GET_TOTAL_AREAS('units_a', 9, ';').toFixed(2)
                                cellObj.className = 'text-primary fw-bold';
                                cellObj.color = 'tomato';
                                break;
                            case 'units_a_10':
                                cellObj.value = _GET_TOTAL_AREAS('units_a', 10, ';').toFixed(2)
                                cellObj.className = 'text-primary fw-bold';
                                cellObj.color = 'tomato';
                                break;
                            case 'units_a_11':
                                cellObj.value = _GET_TOTAL_AREAS('units_a', 11, ';').toFixed(2)
                                cellObj.className = 'text-primary fw-bold';
                                cellObj.color = 'tomato';
                                break;
                            case 'build_total':
                                let total_1 = 0;
                                areas.map(a => total_1 += Number(_GET_TOTAL_AREA(a.build, a.historic_areas)))
                                cellObj.value = total_1.toFixed(2)
                                cellObj.className = 'text-secondary fw-bold';
                                cellObj.color = 'orchid';
                                break;
                            case 'destroy_total':
                                let total_2 = 0;
                                areas.map(a => total_2 += Number(_GET_TOTAL_DESTROY(a.destroy)))
                                cellObj.value = total_2.toFixed(2)
                                cellObj.className = 'text-secondary fw-bold';
                                cellObj.color = 'orchid';
                                break;
                            case 'net_total':
                                let total_3 = 0;
                                areas.map(a => total_3 += Number(_GET_NET_INDEX(a.build, a.destroy, a.historic_areas)))
                                cellObj.value = total_3.toFixed(2)
                                cellObj.className = 'text-secondary fw-bold';
                                cellObj.color = 'orchid';
                                break;
                            case 'int_total':
                                let total_4 = 0;
                                areas.map(a => total_4 += Number(_ADD_AREAS(a.build)))
                                cellObj.value = total_4.toFixed(2)
                                cellObj.className = 'text-secondary fw-bold';
                                cellObj.color = 'orchid';
                                break;
                            default:
                                cellObj.value = hn.dv;
                                break;
                        }

                        if (_h.includes('*')) {
                            tagsH.map((tag, i) => {
                                if (_h === '*' + tag) {
                                    cellObj.value = _GET_TOTAL_AREAS('historic_areas', i, ';').toFixed(2)
                                    cellObj.className = 'fw-bold text-dark';
                                    cellObj.color = 'green';
                                }
                            })
                        }


                        if (_h.includes('Empate: ')) {
                            tagsE.map((tag, i) => {
                                if (_h === 'Empate: ' + tag) {
                                    cellObj.value = _GET_TOTAL_AREAS('empate_h', i, ';').toFixed(2);
                                    cellObj.className = 'fw-bold text-dark';
                                    cellObj.color = 'green';
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

    // ******************************* JSX ***************************** // 
    let _cOMPONENT_TABLE_RESUME_BYUSE = () => {
        let child = _GET_CHILD_1();
        let areas = currentRecord ? currentRecord.record_arc_33_areas ? currentRecord.record_arc_33_areas : [] : [];
        let STEP = LOAD_STEP('a_config');
        let json = STEP ? STEP.json ?? {} : {};
        json = getJSON_Simple(json)
        let tagsH = json.tagh ? json.tagh.split(';') : [];

        const types = [];
        const totals = [];
        const c_tagsH = [];
        const au = [];
        tagsH.map((tag, i) => {
            c_tagsH.push({
                name: <label>{tag}</label>,
                cell: row => areas.reduce((p, n, j) => {
                    if (String(n.use || '').toLowerCase().trim() === String(row.use || '').toLowerCase().trim() || row.use === 'total') return (Number(p) + Number(
                        _CHECK_AREA_STR(n, 'historic_areas', i, ';')
                    )).toFixed(2)
                    else return Number(p).toFixed(2)
                }, 0),
            })
        })

        if (child.m_lic.includes('I')) {
            types.push({
                name: <label>Cerrada</label>,
                cell: row => areas.reduce((p, n, i) => {
                    if (String(n.use || '').toLowerCase().trim() === String(row.use || '').toLowerCase().trim() || row.use === 'total') return (Number(p) + Number(
                        _CHECK_AREA_STR(n, 'build', 9),
                    )).toFixed(2)
                    else return Number(p).toFixed(2)
                }, 0),
            })
        }
        if (child.m_lic.includes('H')) {
            types.push({
                name: <label>Reconstruida</label>,
                cell: row => areas.reduce((p, n, i) => {
                    if (String(n.use || '').toLowerCase().trim() === String(row.use || '').toLowerCase().trim() || row.use === 'total') return (Number(p) + Number(
                        _CHECK_AREA_STR(n, 'build', 8),
                    )).toFixed(2)
                    else return Number(p).toFixed(2)
                }, 0),
            })
        }
        if (child.m_lic.includes('F')) {
            types.push({
                name: <label>Reforzada</label>,
                cell: row => areas.reduce((p, n, i) => {
                    if (String(n.use || '').toLowerCase().trim() === String(row.use || '').toLowerCase().trim() || row.use === 'total') return (Number(p) + Number(
                        _CHECK_AREA_STR(n, 'build', 5),
                    )).toFixed(2)
                    else return Number(p).toFixed(2)
                }, 0),
            })
        }
        if (child.m_lic.includes('E')) {
            types.push({
                name: <label>Restaurada</label>,
                cell: row => areas.reduce((p, n, i) => {
                    if (String(n.use || '').toLowerCase().trim() === String(row.use || '').toLowerCase().trim() || row.use === 'total') return (Number(p) + Number(
                        _CHECK_AREA_STR(n, 'build', 4),
                    )).toFixed(2)
                    else return Number(p).toFixed(2)
                }, 0),
            })
        }
        if (child.m_lic.includes('D')) {
            types.push({
                name: <label>Modificada</label>,
                cell: row => areas.reduce((p, n, i) => {
                    if (String(n.use || '').toLowerCase().trim() === String(row.use || '').toLowerCase().trim() || row.use === 'total') return (Number(p) + Number(
                        _CHECK_AREA_STR(n, 'build', 3),
                    )).toFixed(2)
                    else return Number(p).toFixed(2)
                }, 0),
            })
        }
        if (child.m_lic.includes('C')) {
            types.push({
                name: <label>Adecuación</label>,
                cell: row => areas.reduce((p, n, i) => {
                    if (String(n.use || '').toLowerCase().trim() === String(row.use || '').toLowerCase().trim() || row.use === 'total') return (Number(p) + Number(
                        _CHECK_AREA_STR(n, 'build', 2),
                    )).toFixed(2)
                    else return Number(p).toFixed(2)
                }, 0),
            })
        }
        if (child.m_lic.includes('B')) {
            types.push({
                name: <label>Ampliada</label>,
                cell: row => areas.reduce((p, n, i) => {
                    if (String(n.use || '').toLowerCase().trim() === String(row.use || '').toLowerCase().trim() || row.use === 'total') return (Number(p) + Number(
                        _CHECK_AREA_STR(n, 'build', 1),
                    )).toFixed(2)
                    else return Number(p).toFixed(2)
                }, 0),
            })
        }
        if (child.tipo.includes('F')) {
            types.push({
                name: <label>Reconocida</label>,
                cell: row => areas.reduce((p, n, i) => {
                    if (String(n.use || '').toLowerCase().trim() === String(row.use || '').toLowerCase().trim() || row.use === 'total') return (Number(p) + Number(
                        _CHECK_AREA_STR(n, 'build', 10),
                    )).toFixed(2)
                    else return Number(p).toFixed(2)
                }, 0),
            })
        }
        if (child.m_lic.includes('A')) {
            types.push({
                name: <label>Obra Nueva</label>,
                cell: row => areas.reduce((p, n, i) => {
                    if (String(n.use || '').toLowerCase().trim() === String(row.use || '').toLowerCase().trim() || row.use === 'total') return (Number(p) + Number(
                        _CHECK_AREA_STR(n, 'build', 0),
                    )).toFixed(2)
                    else return Number(p).toFixed(2)
                }, 0),
            })
        }
        if (child.m_lic.includes('g')) {
            types.push({
                name: <label>Demolida parcial</label>,
                cell: row => areas.reduce((p, n, i) => {
                    if (String(n.use || '').toLowerCase().trim() === String(row.use || '').toLowerCase().trim() || row.use === 'total') return (Number(p) + Number(
                        _CHECK_AREA_STR(n, 'build', 7),
                    )).toFixed(2)
                    else return Number(p).toFixed(2)
                }, 0),
            })
        }
        if (child.m_lic.includes('G')) {
            types.push({
                name: <label>Demolida total</label>,
                cell: row => areas.reduce((p, n, i) => {
                    if (String(n.use || '').toLowerCase().trim() === String(row.use || '').toLowerCase().trim() || row.use === 'total') return (Number(p) + Number(
                        _CHECK_AREA_STR(n, 'build', 6),
                    )).toFixed(2)
                    else return Number(p).toFixed(2)
                }, 0),
            })
        }

        totals.push({
            name: <label>A. total const.</label>,
            cell: row => areas.reduce((p, n, i) => {
                if (String(n.use || '').toLowerCase().trim() === String(row.use || '').toLowerCase().trim() || row.use === 'total') return (Number(p) + Number(
                    _GET_TOTAL_AREA(n.build, n.historic_areas),
                )).toFixed(2)
                else return Number(p).toFixed(2)
            }, 0),
        })
        totals.push({
            name: <label>A. total desc.</label>,
            cell: row => areas.reduce((p, n, i) => {
                if (String(n.use || '').toLowerCase().trim() === String(row.use || '').toLowerCase().trim() || row.use === 'total') return (Number(p) + Number(
                    _GET_TOTAL_DESTROY(n.destroy),
                )).toFixed(2)
                else return Number(p).toFixed(2)
            }, 0),
        })
        totals.push({
            name: <label>A. total neta</label>,
            cell: row => areas.reduce((p, n, i) => {
                if (String(n.use || '').toLowerCase().trim() === String(row.use || '').toLowerCase().trim() || row.use === 'total') return (Number(p) + Number(
                    _GET_NET_INDEX(n.build, n.destroy, n.historic_areas),
                )).toFixed(2)
                else return Number(p).toFixed(2)
            }, 0),
        })
        totals.push({
            name: <label>A. total inte.</label>,
            cell: row => areas.reduce((p, n, i) => {
                if (String(n.use || '').toLowerCase().trim() === String(row.use || '').toLowerCase().trim() || row.use === 'total') return (Number(p) + Number(
                    _ADD_AREAS(n.build),
                )).toFixed(2)
                else return Number(p).toFixed(2)
            }, 0),
        })

        au.push({
            name: <label>Unidades Nueva</label>,
            cell: row => areas.reduce((p, n, i) => {
                if (String(n.use || '').toLowerCase().trim() === String(row.use || '').toLowerCase().trim() || row.use === 'total') return (Number(p) + Number(
                    _ADD_AREAS(n.units, ';'),
                )).toFixed(2)
                else return Number(p).toFixed(2)
            }, 0),
        })

        //au.push({
        //  name: <label>Nuevas Areas</label>,
        //cell: row => _ADD_AREAS(row.units_a, ';'),
        //})

        const columns_archive = [
            {
                name: <label>Uso</label>,
                selector: row => row.use,
                sortable: true,
                filterable: true,
                cell: row => row.use || 'otro',
            },
            ...c_tagsH,
            ...types,
            ...totals,
            ...au,
        ];

        let uses = [];
        let usesRows = [];

        areas.map(a => {
            let area = String(a.use || '').toLowerCase().trim();
            if (!uses.includes(area || 'otro')) uses.push(area);
        })

        areas.map(area => {
            let use = String(area.use || 'otro').toLowerCase().trim();
            let rowObjest = columns_archive.map(cl => cl.cell(area));
            let sumAreas = rowObjest.reduce((p, n) => Number(p) + (isNaN(n) ? 0 : Number(n)), 0)
            let findUse = usesRows.find(row => String(row.use || '').toLowerCase().trim() === use);
            if (!findUse && sumAreas > 0) usesRows.push(area);
        })

        usesRows.push({ ...areas, use: 'total' })

        return <DataTable
            noDataComponent="NO HAY AREAS"
            striped="true"
            columns={columns_archive}
            data={usesRows}
            highlightOnHover
            className="data-table-component"
            noHeader
            dense
        />
    }
    // ******************************* APIS **************************** // 

    return (
        <div>
            {_cOMPONENT_TABLE_RESUME_BYUSE()}
        </div >
    );
}
