import { MDBBtn } from 'mdb-react-ui-kit';
import React, { useState } from 'react';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { getJSON_Simple } from '../../../../components/customClasses/typeParse';
import RECORD_ARCSERVICE from '../../../../services/record_arc.service';

export default function RECORD_ARC_37(props) {
    const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR } = props;
    const MySwal = withReactContent(Swal);
    var importCounter = 0;
    const GROUPS = [
        {
            name: 'A (ALMACENAMIENTO)', subs: [
                { name: 'A-1 (RIESGO MODERADO)', index: [28] },
                { name: 'A-2 (RIESGO BAJO', index: [28] },
            ]
        },
        {
            name: 'C (COMERCIAL)', subs: [
                { name: 'C-1 (SERVICIOS)', index: [10] },
                { name: 'C-2 (BIENES)', index: [6, 3] },
            ]
        },
        {
            name: 'E (ESPECIALES)', subs: [
                { name: 'E (ESPECIALES)', index: false },
            ]
        },
        {
            name: 'F (FABRIL E INDUSTRIAL)', subs: [
                { name: 'F-1 (RIESGO MODERADO)', index: [9] },
                { name: 'F-2 (RIESGO BAJO)', index: [9] },
            ]
        },
        {
            name: 'I (INSTITUCIONAL)', subs: [
                { name: 'I-1 (RECLUSIÓN)', index: [11] },
                { name: 'I-2 (SALUD O INCAPACIDAD)', index: [11, 9, 22] },
                { name: 'I-3 (EDUCACIÓN)', index: [1.8, 4.6] },
                { name: 'I-4 (SEGURIDAD PÚBLICA)', index: [2.8] },
                { name: 'I-5 (SERVICIO PÚBLICO)', index: [0.3] },
            ]
        },
        {
            name: 'L (LUGARES DE REUNIÓN)', subs: [
                { name: 'L-1 (DEPORTIVOS)', index: [0.5] },
                { name: 'L-2 (CULTURALES Y  TEATRO)', index: [0.7] },
                { name: 'L-3 (SOCIALES Y RECREATIVOS)', index: [1.4] },
                { name: 'L-4 (RELIGIOSOS)', index: false },
                { name: 'L-5 (DE TRANSPORTE)', index: false },
                { name: 'L (LUGARES DE REUNIÓN)', index: [1, 1.4, 1.8, 3.7, 4.6, 9.3, 28] },
            ]
        },
        {
            name: 'M (MIXTOS Y OTROS)', subs: [
                { name: 'M (MIXTOS Y OTROS)', index: false },
            ]
        },
        {
            name: 'P (ALTA PELIGROSIDAD)', subs: [
                { name: 'M (MIXTOS Y OTROS)', index: [9] },
            ]
        },
        {
            name: 'R (RESIDENCIAL)', subs: [
                { name: 'R-1 (UNIFAMILIAR Y BIFAMILIAR)', index: [18] },
                { name: 'R-2 (MULTIFAMILIAR)', index: [18] },
                { name: 'R-3 (HOTELES)', index: [18] },
            ]
        },
        {
            name: 'T (TEMPORAL)', subs: [
                { name: 'T (TEMPORAL)', index: false },
            ]
        },
    ]
    var [new37, setNew] = useState(false);
    var [edit37, set37] = useState(false);
    var [newImport, setImport] = useState(false);

    var [grp, setGrp] = useState(GROUPS[0].name)
    var [subgr, setSub] = useState(GROUPS[0].subs)
    var [ind, setInd] = useState(GROUPS[0].subs[0].index)
    var [newRow, setRow] = useState({});
    var [newEdit, setEdit] = useState({});

    // ***************************  DATA GETTERS *********************** //
    let LOAD_STEP = (_id_public) => {
        var _CHILD = currentRecord.record_arc_steps;
        for (var i = 0; i < _CHILD.length; i++) {
            if (_CHILD[i].version == currentVersionR && _CHILD[i].id_public == _id_public) return _CHILD[i]
        }
        return []
    }
    let _GET_CHILD_37 = () => {
        var _CHILD = currentRecord.record_arc_37s;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
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
    // *************************  DATA CONVERTERS ********************** //

    let _GET_STEP_TYPE = (_id_public, _type) => {
        var STEP = LOAD_STEP(_id_public);
        if (!STEP.id) return [];
        var value = STEP[_type] ? STEP[_type] : []
        if (!value) return [];
        value = value.split(';');
        return value
    }
    let _GET_SELECT_COLOR_VALUE = (_VALUE) => {
        if (_VALUE == 0 || _VALUE == 'NO') {
            return 'form-select text-danger form-select-sm';
        }
        if (_VALUE == 1 || _VALUE == 'SI') {
            return 'form-select text-success form-select-sm';
        }
        if (_VALUE == 2 || _VALUE == 'NA') {
            return 'form-select text-warning form-select-sm';
        }
        return 'form-select form-select-sm';
    }
    let _SET_SUBGROUP = (_value) => {
        let group = GROUPS.find(g => g.name == _value);
        setGrp(_value)
        setSub(group.subs)
        if (group.subs[0].index) setInd(group.subs[0].index)
        else setInd([])
    }
    let _SET_SUBGROUP_IMPORT = (_value, i) => {
        let group = GROUPS.find(g => g.name == _value);

        var select = document.getElementById('import_sub_group_' + i);
        select.innerHTML = '';

        group.subs.map(g => {
            var opt = document.createElement("option");
            opt.text = g.name;
            select.add(opt, null);
        })
    }
    let _SET_INDEX = (_value) => {
        let subgroup = subgr.find(g => g.name == _value);
        if (subgroup.index) setInd(subgroup.index)
        else setInd([])
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
    
    
    let _GET_NET_INDEX = (_build, _destroy, _historic) => {
        if (!_build) return 0;
        var destroy = Number(_ADD_AREAS(_destroy));
        var areaToBuild = _GET_TOTAL_AREA(_build, _historic);
        var _NET_IDEX = Number(areaToBuild) - Number(destroy);
        return (_NET_IDEX).toFixed(2);
    }

    function array_sort(a, b) {
        let A;
        let B;
        if (a.floor) {
            A = a.floor ? a.floor.split(' ') : '';
            B = b.floor ? b.floor.split(' ') : '';
        } else {
            A = a.name ? a.name.split(' ') : '';
            B = b.name ? b.name.split(' ') : '';
        }
        let strPartA = A[0] ? A[0].toLowerCase() : '';
        let strPartB = B[0] ? B[0].toLowerCase() : '';
        let nunPartA = Number(A[1]) ?? Infinity;
        let nunPartB = Number(B[1]) ?? Infinity;


        if (strPartA < strPartB) { return -1; }
        if (strPartA > strPartB) { return 1; }

        if (strPartA[0] && strPartA[0].toLowerCase() == 's') {
            if (nunPartA < nunPartB) { return -1; }
            if (nunPartA > nunPartB) { return 1; }
        } else {
            if (nunPartA < nunPartB) { return 1; }
            if (nunPartA > nunPartB) { return -1; }
        }

        return 0;
    }
    // ******************************* JSX ***************************** // 
    const _VALUE_ARRAY = _GET_STEP_TYPE('s37', 'value');
    const _CHECK_ARRAY = _GET_STEP_TYPE('s37', 'check');

    const ExpandedComponent = ({ data }) => {
        let subItems = data.main_group ? data.main_group.split(';') : [];

        return <>
            <div className='row border'>
                <div className='col my-1'>
                    <MDBBtn rounded outline size='sm' className='me-1' onClick={() => setRow(newRow[data.id] ? {} : { [data.id]: true })}>NUEVO GRUPO</MDBBtn>
                </div>
            </div>

            <div className='row border'>
                <div className='col-3'>
                    <h5 className='fw-bold'><i class="fas fa-asterisk"></i> GRUPO</h5>
                </div>
                <div className='col-3'>
                    <h5 className='fw-bold'><i class="fas fa-asterisk"></i><i class="fas fa-asterisk"></i> SUBGRUPO</h5>
                </div>
                <div className='col'>
                    <h5 className='fw-bold'><i class="fas fa-cube"></i> ÁREA NETA</h5>
                </div>
                <div className='col'>
                    <h5 className='fw-bold'><i class="fas fa-male"></i> INDICE</h5>
                </div>
                <div className='col'>
                    <h5 className='fw-bold'><i class="fas fa-male"></i> OCUPACIÓN REAL</h5>
                </div>
                <div className='col-1'></div>

            </div>
            {subItems.map((it, i) => {
                let main_group = it;
                let sub_group = data.sub_group ? data.sub_group.split(';')[i] : '';
                let anet = data.anet ? data.anet.split(';')[i] : '';
                let index = data.index ? data.index.split(';')[i] : '';
                let real = data.real ? data.real.split(';')[i] : '';
                let subgroup = [];
                if (main_group) {
                    subgroup = GROUPS.find(g => g.name == main_group).subs;
                }

                return <>

                    <div className='row border'>
                        <div className='col-3'>
                            {newEdit['main_group_' + data.id + i] ?
                                <select className="form-select form-select-sm" name={'main_group_' + data.id} id={'main_group_' + data.id + i}
                                    defaultValue={main_group} onBlur={() => add_grp_37(data.id)}>
                                    {GROUPS.map(g => <option>{g.name}</option>)}
                                </select>
                                :
                                <label name={'main_group_' + data.id} id={'main_group_' + data.id + i} onDoubleClick={() => setEdit({ ['main_group_' + data.id + i]: true })}>{main_group}</label>
                            }
                        </div>
                        <div className='col-3'>
                            {newEdit['sub_group_' + data.id + i] ?
                                <select className="form-select form-select-sm" name={'sub_group_' + data.id} id={'sub_group_' + data.id + i}
                                    defaultValue={sub_group} onBlur={() => add_grp_37(data.id)}>
                                    {subgroup.map(g => <option>{g.name}</option>)}
                                </select>
                                :
                                <label name={'sub_group_' + data.id} id={'sub_group_' + data.id + i} onDoubleClick={() => setEdit({ ['sub_group_' + data.id + i]: true })}>{sub_group}</label>
                            }
                        </div>
                        <div className='col' onDoubleClick={() => setEdit({ ['anet_' + data.id + i]: true })}>
                            {newEdit['anet_' + data.id + i] ?
                                <input name={'anet_' + data.id} id={'anet_' + data.id + i} type="number" min={0} step={0.01}
                                    className='form-control form-control-sm' onBlur={() => add_grp_37(data.id)} defaultValue={anet} autoFocus={true} />
                                :
                                <label name={'anet_' + data.id} id={'anet_' + data.id + i}>{anet}</label>
                            }
                        </div>
                        <div className='col' onDoubleClick={() => setEdit({ ['index_' + data.id + i]: true })}>
                            {newEdit['index_' + data.id + i] ?
                                <input name={'index_' + data.id} id={'index_' + data.id + i} type="number" min={0}
                                    className='form-control form-control-sm' onBlur={() => add_grp_37(data.id)} defaultValue={index} autoFocus={true} />
                                :
                                <label name={'index_' + data.id} id={'index_' + data.id + i} >{index}</label>
                            }

                        </div>
                        <div className='col' onDoubleClick={() => setEdit({ ['real_' + data.id + i]: true })}>
                            {newEdit['real_' + data.id + i] ?
                                <input name={'real_' + data.id} id={'real_' + data.id + i} type="number" min={0}
                                    className='form-control form-control-sm' onBlur={() => add_grp_37(data.id)} defaultValue={real} autoFocus={true} />
                                :
                                <label name={'real_' + data.id} id={'real_' + data.id + i}>{real}</label>
                            }
                        </div>
                        <div className='col-1'>
                            {newRow[data.id] || subItems.length == 1 ? '' :
                                <MDBBtn color="danger" rounded outline size='sm' className='px-2' onClick={() => del_grp_37(data.id)}> <i class="fas fa-minus text-danger"></i></MDBBtn>
                            }
                        </div>
                    </div>
                </>
            })}
            {newRow[data.id] ?
                <div className='row border my-1'>
                    <div className='col-3'>
                        <select className="form-select form-select-sm" name={'main_group_' + data.id} id={'main_group_' + data.id + subItems.length}
                            onChange={(e) => _SET_SUBGROUP(e.target.value)} defaultValue={grp}>
                            {GROUPS.map(g => <option>{g.name}</option>)}
                        </select>
                    </div>
                    <div className='col-3'>
                        <select className="form-select form-select-sm" name={'sub_group_' + data.id} id={'sub_group_' + data.id + subItems.length}>
                            {subgr.map(sg => <option>{sg.name}</option>)}
                        </select>
                    </div>
                    <div className='col'>
                        <input name={'anet_' + data.id} id={'anet' + data.id + subItems.length} type="number" min={0} step={0.01} className='form-control form-control-sm' />
                    </div>
                    <div className='col'>
                        <input className='form-select form-select-sm' list="index_37" name={'index_' + data.id} id={'index_' + data.id + subItems.length} />
                        <datalist id="index_37">
                            {ind.map(i => <option>{i}</option>)}
                        </datalist>
                    </div>
                    <div className='col'>
                        <input name={'real_' + data.id} id={'real_' + data.id + subItems.length} type="number" min={0} className='form-control form-control-sm' />
                    </div>
                    <div className='col-1'>
                        {newRow[data.id] ?
                            <MDBBtn color="success" rounded outline size='sm' className='px-2' onClick={() => add_grp_37(data.id)}> <i class="fas fa-plus text-success"></i></MDBBtn> : ''}
                    </div>
                </div> : ''}
        </>
    };

    let _COMPONENTN_IMPORT = () => {
        let areas = _GET_CHILD_33_AREAS();
        areas.sort((a, b) => array_sort(a, b));
        return <>
            <div className='row'>
                <div className='col-1'></div>
                <div className='col text-center border fw-bold'><label>PISO</label></div>
                <div className='col text-center border fw-bold'><label>GRUPO</label></div>
                <div className='col text-center border fw-bold'><label>SUBGRUPO</label></div>
                <div className='col text-center border fw-bold'><label>AREA NETA</label></div>
                <div className='col text-center border fw-bold'><label>INDICE</label></div>
                <div className='col text-center border fw-bold'><label>OCUPACION REAL</label></div>
            </div>
            {areas.map((area, i) => {
                return <div className='row'>

                    <div className='col-1 text-end'> <input class="form-check-input" type="checkbox" defaultChecked={true} name="import_checks" /> </div>
                    <div className='col border'>
                        <input type="text" class="form-control form-control-sm" name={'import_name'} defaultValue={area.floor} />
                    </div>
                    <div className='col border'><select className="form-select form-select-sm" name="import_main_group"
                        onChange={(e) => _SET_SUBGROUP_IMPORT(e.target.value, i)}>
                        {GROUPS.map(g => <option>{g.name}</option>)}
                    </select></div>
                    <div className='col border'><select className="form-select form-select-sm" name="import_sub_group" id={'import_sub_group_' + i}>
                        {GROUPS.map(g => <option>{g.name}</option>)}
                    </select></div>
                    <div className='col border'>
                        <input type="number" min={0} class="form-control form-control-sm" name={'import_anet'} defaultValue={_GET_NET_INDEX(area.build, area.destroy, area.historic_areas)} />
                    </div>
                    <div className='col border'><input type="number" min={0} class="form-control form-control-sm" name={'import_index'} /></div>
                    <div className='col border'><input type="number" min={0} class="form-control form-control-sm" name={'import_real'} /></div>
                </div>
            })}
            <div className='row my-2'>
                <div className='col-1'></div>
                <div className='col text-center'>
                    <MDBBtn size='sm' color='success' onClick={() => import_37()}><i class="fas fa-file-upload"></i> IMPORTAR</MDBBtn>
                </div>
            </div>
        </>
    }
    let _COMPOENT_REVIEW = () => {
        const LIST = [
            {
                title: 'Clasificación de la edificación', items: []
            },
            {
                c: 5, title: 'General. A.10.1.3.7', items: [
                    { v: 20, desc: 'Edificación', text: true, },
                    { v: 21, desc: 'Altura (pisos) ', text: true, },
                    { v: 22, desc: 'Gran altura', text: true, },
                    { v: 23, desc: 'Categoría', text: true, },
                ]
            },
            {
                title: 'Medios de salida protegida', items: []
            },
            {
                c: 0, title: 'Escaleras', items: [
                    { v: 0, desc: 'Número de salidas por piso', text: true, },
                    { v: 1, desc: 'Construcción fija; materiales antideslizantes y sin escalones calados', },
                    { v: 2, desc: 'Ancho de la huella sin proyecciones= 0,28m', },
                    { v: 3, desc: 'Diferencia entre al ancho entre tipo de huellas < 0,02m', },
                    { v: 4, desc: 'Altura contrahuella entre 0,10m y 0,18m', },
                    { v: 5, desc: 'Diferencia entre altura de contrahuellas < 0,02m', },
                    { v: 6, desc: 'Suma de dos contrahuellas y una huella entre 0,60m y 0,64m   ', },
                    { v: 7, desc: 'Ancho en todos lo puntos de la escalera:', text: true, },
                    { v: 8, desc: 'Altura mínima 2,05m', },
                ]
            },
            {
                c: 1, title: 'Pasamanos', items: [
                    { v: 9, desc: 'Continúo incluido el descanso', },
                    { v: 10, desc: 'Prolongado 0,30 en los externos de la escalera', },
                    { v: 11, desc: 'Se encuentra entre 0,85 y 0,95m de altura', },
                    { v: 12, desc: 'Circular a con diámetro entre 0,032m y 0,050m', },
                    { v: 13, desc: 'Separado a una distancia ≥ 0,05m del muro', },
                ]
            },
            {
                c: 2, title: 'Puertas protegidas', items: [
                    { v: 14, desc: 'Ancho de la puerta ≥0,90m', },
                    { v: 15, desc: 'Altura puerta ≥ 2,05m', },
                    { v: 16, desc: 'Secuencia de puertas seriadas distanciadas mínimo 2,10 ', },
                    { v: 17, desc: 'El constructor obligado a cumplir K.3.18.2.5 Medios de salida.', },
                ]
            },
            {
                c: 3, title: 'Descarga de salida', items: [
                    { v: 18, desc: 'Una de las 2 escaleras descarga directamente al espacio público', },
                    { v: 19, desc: 'Presenta rociadores el vestíbulo; requerido para las 2 escaleras.', },
                ]
            },
        ]

        return LIST.map((list, i) => {
            return <div className="row border text-center ">
                <div className='col'>
                    {list.title ? <label className='fw-bold'>{list.title}</label> : ''}
                </div>
                {list.items.length ?
                    <div className='col-7'>
                        {list.items.map((item, j) => {
                            if (!item.text) return <>
                                <div className='row border text-start'>
                                    <div className='col'><label>{item.desc}</label></div>
                                    <div className='col-3'><select className={_GET_SELECT_COLOR_VALUE(_VALUE_ARRAY[item.v])}
                                        name="s_37_values" id={'s_37_values_' + item.v}
                                        defaultValue={_VALUE_ARRAY[item.v]} onChange={() => save_ra_37(false)} >
                                        <option className="text-danger">NO</option>
                                        <option className="text-success">SI</option>
                                        <option className="text-warning">NA</option>
                                    </select></div>
                                </div>
                            </>
                            else return <>
                                <div className='row border text-start'>
                                    <div className='col'><label>{item.desc}</label></div>
                                    <div className='col-3'>
                                        <input className={'form-control-sm form-control'}
                                            name="s_37_values" id={'s_37_values_' + item.v}
                                            defaultValue={_VALUE_ARRAY[item.v]} onBlur={() => save_ra_37(false)} />
                                    </div>
                                </div>
                            </>
                        })}
                    </div>
                    : ''}
                {list.c != undefined ?
                    <div className='col-2 text-center '>
                        <select className={_GET_SELECT_COLOR_VALUE(_CHECK_ARRAY[list.c])}
                            name="s_37_checks" id={'s_37_checks_' + list.c}
                            defaultValue={_CHECK_ARRAY[list.c]} onChange={() => save_ra_37(false)} >
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
                            <option value="2" className="text-warning">NO APLICA</option>
                        </select>
                    </div>
                    : ''}
            </div>

        })
    }
    let _LIST_COMPONENT = () => {
        let _LIST = _GET_CHILD_37();

        const columns = [
            {
                name: <label>Dirección</label>,
                selector: row => row.name,
                sortable: true,
                filterable: true,
                center: true,
                compact: true,
                minWidth: '150px',
                cell: row => <label>{row.name}</label>
            },
            {
                name: <label>Grupos</label>,
                center: true,
                compact: true,
                cell: row => {
                    let grous = row.main_group ? row.main_group.split(';') : [];
                    let newGroups = [];
                    grous.map(g => { if (!newGroups.includes(g)) newGroups.push(g) })
                    return newGroups.join(', ')
                }
            },
            {
                name: <label>Subgrupos</label>,
                center: true,
                compact: true,
                cell: row => {
                    let grous = row.sub_group ? row.sub_group.split(';') : [];
                    return grous.join(', ')
                }
            },
            {
                name: <label>Áreas Netas</label>,
                center: true,
                compact: true,
                maxWidth: '60px',
                cell: row => {
                    let grous = row.anet ? row.anet.split(';') : [];
                    let sum = 0;
                    grous.map(g => sum += Number(g))
                    return sum.toFixed(2);
                }
            },
            /**
             * 
             * {
                name: <label>Evaluación</label>,
                button: true,
                center: true,
                minWidth: '140px',
                cell: row => <select
                    className={_GET_SELECT_COLOR_VALUE(row.check)} defaultValue={row.check}
                    onChange={(e) => setCheck_37(row.id, e.target.value)}>
                    <option value="0" className="text-danger">NO CUMPLE</option>
                    <option value="1" className="text-success">CUMPLE</option>
                    <option value="2" className="text-warning">NO APLICA</option>
                </select>
            },
           
             */
            {
                name: <label>ACCIÓN</label>,
                button: true,
                center: true,
                minWidth: '110px',
                cell: row => <>
                    <MDBBtn className="btn btn-secondary btn-sm px-2 me-1" onClick={() => edit37 ? set37(false) : set37(row)}><i class="far fa-edit"></i></MDBBtn>
                    <MDBBtn className="btn btn-danger btn-sm px-2" onClick={() => delete_37(row.id)}><i class="far fa-trash-alt"></i></MDBBtn>
                </>,
            },
        ]
        return <DataTable
            noDataComponent="No hay Items"
            striped="true"
            columns={columns}
            data={_LIST.sort((a, b) => array_sort(a, b))}
            highlightOnHover
            className="data-table-component"
            noHeader
            dense
            expandableRows
            expandableRowsComponent={ExpandedComponent}
        />
    }
    let _COMPONENT_37 = (edit, _edit37) => {
        return <>
            <div className="row">
                <input type="hidden" id="r_a_34_" />
                <div className="col-2 p-1">
                    <label>Espacio</label>
                    <input type="text" class="form-control form-control-sm" id={"r_a_37_1" + edit}
                        defaultValue={_edit37.name ?? ''} />
                </div>
                {_edit37 ? '' : <>
                    <div className="col p-1">
                        <label>Grupo</label>
                        <select className="form-select form-select-sm" id={"r_a_37_2" + edit}
                            onChange={(e) => _SET_SUBGROUP(e.target.value)}>
                            {GROUPS.map(g => <option>{g.name}</option>)}
                        </select>
                    </div>
                    <div className="col p-1">
                        <label>Subgrupo</label>
                        <select className="form-select form-select-sm" id={"r_a_37_3" + edit}
                            onChange={(e) => _SET_INDEX(e.target.value)}>
                            {subgr.map(sg => <option>{sg.name}</option>)}
                        </select>
                    </div>
                    <div className="col p-1">
                        <label>Área neta</label>
                        <input type="number" step={0.01} min={0} class="form-control form-control-sm" id={"r_a_37_5" + edit}
                            defaultValue={''} />
                    </div>
                    <div className="col-2 p-1">
                        <label>Indice</label>
                        <input className='form-select form-select-sm' list="index_37" id={"r_a_37_4" + edit}
                            defaultValue={''} />
                        <datalist id="index_37">
                            {ind.map(i => <option>{i}</option>)}
                        </datalist>
                    </div>
                    <div className="col p-1">
                        <label>Ocupación real</label>
                        <input type="number" min={0} class="form-control form-control-sm" id={"r_a_37_6" + edit}
                            defaultValue={''} />
                    </div>
                </>}

            </div>
        </>
    }
    // ******************************* APIS **************************** // 
    let save_ra_37 = (e) => {
        if (e) e.preventDefault();

        let checks = [];
        let values = [];
        var checks_html;
        var values_html;

        var formData = new FormData();

        var checks_html = document.getElementsByName('s_37_checks');
        for (var i = 0; i < checks_html.length; i++) {
            checks.push(document.getElementById('s_37_checks_' + i).value)
        }
        formData.set('check', checks.join(';'));

        var values_html = document.getElementsByName('s_37_values');
        for (var i = 0; i < values_html.length; i++) {
            values.push(document.getElementById('s_37_values_' + i).value)
        }
        formData.set('value', values.join(';'));

        formData.set('version', currentVersionR);
        formData.set('recordArcId', currentRecord.id);
        formData.set('id_public', 's37');

        save_step('s37', false, formData);

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

    let new_ra_37 = (e) => {
        e.preventDefault();
        var formData = new FormData();
        formData.set('recordArcId', currentRecord.id);

        let name = document.getElementById("r_a_37_1").value;
        formData.set('name', name);
        let main_group = document.getElementById("r_a_37_2").value;
        formData.set('main_group', main_group);
        let sub_group = document.getElementById("r_a_37_3").value;
        formData.set('sub_group', sub_group);
        let index = document.getElementById("r_a_37_4").value;
        formData.set('index', index);
        let anet = document.getElementById("r_a_37_5").value;
        formData.set('anet', anet);
        let real = document.getElementById("r_a_37_6").value;
        formData.set('real', real);

        RECORD_ARCSERVICE.create_arc_37(formData)
            .then(response => {
                if (response.data === 'OK') {
                    MySwal.fire({
                        title: swaMsg.publish_success_title,
                        text: swaMsg.publish_success_text,
                        footer: swaMsg.text_footer,
                        icon: 'success',
                        confirmButtonText: swaMsg.text_btn,
                    });
                    props.requestUpdateRecord(currentItem.id);
                    setNew(false)
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
    let edit_ra_37 = (e) => {
        e.preventDefault();
        var formData = new FormData();
        formData.set('recordArcId', currentRecord.id);

        let name = document.getElementById("r_a_37_1_edit").value;
        formData.set('name', name);
        /*
        let main_group = document.getElementById("r_a_37_2_edit").value;
        formData.set('main_group', main_group);
        let sub_group = document.getElementById("r_a_37_3_edit").value;
        formData.set('sub_group', sub_group);
        let index = document.getElementById("r_a_37_4_edit").value;
        formData.set('index', index);
        let anet = document.getElementById("r_a_37_5_edit").value;
        formData.set('anet', anet);
        let real = document.getElementById("r_a_37_6_edit").value;
        formData.set('real', real);
        */
        RECORD_ARCSERVICE.update_arc_37(edit37.id, formData)
            .then(response => {
                if (response.data === 'OK') {
                    MySwal.fire({
                        title: swaMsg.publish_success_title,
                        text: swaMsg.publish_success_text,
                        footer: swaMsg.text_footer,
                        icon: 'success',
                        confirmButtonText: swaMsg.text_btn,
                    });
                    props.requestUpdateRecord(currentItem.id);
                    set37(false)
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
    let add_grp_37 = (id, useSwal) => {
        var formData = new FormData();

        let main_group = [];
        let sub_group = [];
        let index = [];
        let anet = [];
        let real = [];

        let htmls = document.getElementsByName('main_group_' + id);
        for (let i = 0; i < htmls.length; i++) {
            const element = document.getElementById('main_group_' + id + i);
            if (!element) continue;
            if (element.value) main_group.push(element.value)
            else if (element.textContent) main_group.push(element.textContent)
        }

        htmls = document.getElementsByName('sub_group_' + id);
        for (let i = 0; i < htmls.length; i++) {
            const element = document.getElementById('sub_group_' + id + i);
            if (!element) continue;
            if (element.value) sub_group.push(element.value)
            else if (element.textContent) sub_group.push(element.textContent)
        }

        htmls = document.getElementsByName('anet_' + id);
        for (let i = 0; i < htmls.length; i++) {
            const element = document.getElementById('anet_' + id + i);
            if (!element) continue;
            if (element.value) anet.push(element.value)
            else if (element.textContent) anet.push(element.textContent)
            else anet.push('')
        }

        htmls = document.getElementsByName('index_' + id);
        for (let i = 0; i < htmls.length; i++) {
            const element = document.getElementById('index_' + id + i);
            if (!element) continue;
            if (element.value) index.push(element.value)
            else if (element.textContent) index.push(element.textContent)
            else index.push('')
        }

        htmls = document.getElementsByName('real_' + id);
        for (let i = 0; i < htmls.length; i++) {
            const element = document.getElementById('real_' + id + i);
            if (!element) continue;
            if (element.value) real.push(element.value)
            else if (element.textContent) real.push(element.textContent)
            else real.push('')
        }

        formData.set('main_group', main_group.join(';'));
        formData.set('sub_group', sub_group.join(';'));
        formData.set('index', index.join(';'));
        formData.set('anet', anet.join(';'));
        formData.set('real', real.join(';'));

        RECORD_ARCSERVICE.update_arc_37(id, formData)
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
                    setRow({});
                    setEdit({});
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
    let import_37 = () => {

        let newItems = [];

        let checks = document.getElementsByName('import_checks');
        let names = document.getElementsByName('import_name');
        let anets = document.getElementsByName('import_anet');
        let main_groups = document.getElementsByName('import_main_group');
        let sub_groups = document.getElementsByName('import_sub_group');
        let reals = document.getElementsByName('import_real');
        let indexs = document.getElementsByName('import_index');

        for (let i = 0; i < names.length; i++) {
            if (checks[i].checked == true) newItems.push({
                recordArcId: currentRecord.id,
                name: names[i].value,
                anet: anets[i].value,
                main_group: main_groups[i].value,
                sub_group: sub_groups[i].value,
                real: reals[i].value,
                index: indexs[i].value,
            })
        }

        if (newItems.length > 1) MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });

        newItems.map(it => {
            var formData = new FormData();
            formData.set('recordArcId', it.recordArcId);
            formData.set('name', it.name);
            formData.set('anet', it.anet);
            formData.set('main_group', it.main_group);
            formData.set('sub_group', it.sub_group);
            formData.set('real', it.real);
            formData.set('index', it.index);

            RECORD_ARCSERVICE.create_arc_37(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        importCounter++;
                        if (importCounter == newItems.length) {
                            MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            setImport(false)
                            props.requestUpdateRecord(currentItem.id);
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
                    MySwal.fire({
                        title: swaMsg.generic_eror_title,
                        text: swaMsg.generic_error_text,
                        icon: 'warning',
                        confirmButtonText: swaMsg.text_btn,
                    });
                });

        })



    }
    let del_grp_37 = (id, ind, useSwal) => {
        var formData = new FormData();

        let main_group = [];
        let sub_group = [];
        let index = [];
        let anet = [];
        let real = [];

        let htmls = document.getElementsByName('main_group_' + id);
        for (let i = 0; i < htmls.length; i++) {
            const element = document.getElementById('main_group_' + id + i);
            if (!element) continue;
            if (element.value) main_group.push(element.value)
            else if (element.textContent) main_group.push(element.textContent)
        }

        htmls = document.getElementsByName('sub_group_' + id);
        for (let i = 0; i < htmls.length; i++) {
            const element = document.getElementById('sub_group_' + id + i);
            if (!element) continue;
            if (element.value) sub_group.push(element.value)
            else if (element.textContent) sub_group.push(element.textContent)
        }

        htmls = document.getElementsByName('anet_' + id);
        for (let i = 0; i < htmls.length; i++) {
            const element = document.getElementById('anet_' + id + i);
            if (!element) continue;
            if (element.value) anet.push(element.value)
            else if (element.textContent) anet.push(element.textContent)
            else anet.push('')
        }

        htmls = document.getElementsByName('index_' + id);
        for (let i = 0; i < htmls.length; i++) {
            const element = document.getElementById('index_' + id + i);
            if (!element) continue;
            if (element.value) index.push(element.value)
            else if (element.textContent) index.push(element.textContent)
            else index.push('')
        }

        htmls = document.getElementsByName('real_' + id);
        for (let i = 0; i < htmls.length; i++) {
            const element = document.getElementById('real_' + id + i);
            if (!element) continue;
            if (element.value) real.push(element.value)
            else if (element.textContent) real.push(element.textContent)
            else real.push('')
        }

        main_group.splice(ind, 1);
        sub_group.splice(ind, 1);
        index.splice(ind, 1);
        anet.splice(ind, 1);
        real.splice(ind, 1);

        formData.set('main_group', main_group.join(';'));
        formData.set('sub_group', sub_group.join(';'));
        formData.set('index', index.join(';'));
        formData.set('anet', anet.join(';'));
        formData.set('real', real.join(';'));

        RECORD_ARCSERVICE.update_arc_37(id, formData)
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
                    setRow({});
                    setEdit({});
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
    let delete_37 = (id) => {
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
                RECORD_ARCSERVICE.delete_37(id)
                    .then(response => {
                        if (response.data === 'OK') {
                            MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            props.requestUpdateRecord(currentItem.id);
                            set37(false)
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
    let setCheck_37 = (id, value) => {
        var formData = new FormData();
        formData.set('check', value);
        RECORD_ARCSERVICE.update_arc_37(id, formData)
            .then(response => {
                if (response.data === 'OK') {
                    props.requestUpdateRecord(currentItem.id);
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

    return (
        <div>
            <h3 className="py-3" >3.7.1 Grupos y subgrupos; Carga de Ocupación</h3>

            <div className="row border text-center ">
                <div className='col-3'>
                    <label className='fw-bold'>Separación sísmica</label>
                </div>
                <div className='col text-start'>
                    <textarea className={'form-control-sm form-control'}
                        name="s_37_values" id={'s_37_values_' + 24}
                        defaultValue={_VALUE_ARRAY[24]} onBlur={() => save_ra_37(false)} />
                </div>
                <div className='col-2 text-center '>
                    <select className={_GET_SELECT_COLOR_VALUE(_CHECK_ARRAY[4])}
                        name="s_37_checks" id={'s_37_checks_4'}
                        defaultValue={_CHECK_ARRAY[4]} onChange={() => save_ra_37(false)} >
                        <option value="1" className="text-success">APLICA</option>
                        <option value="2" className="text-warning">NO APLICA</option>
                    </select>
                </div>
            </div>

            <div className='row my-2'>
                <div className='col'>
                    <div class="form-check ms-5 my-2">
                        <input class="form-check-input" type="checkbox" onChange={(e) => setNew(e.target.checked)} />
                        <label class="form-check-label" for="flexCheckDefault">
                            Añadir nuevo elemento
                        </label>
                    </div>
                </div>
                <div className='col text-end'>
                    <MDBBtn size='sm' outline={!newImport} onClick={() => setImport(!newImport)}><i class="fas fa-table"></i> IMPORTAR DE CUADRO DE AREAS</MDBBtn>
                </div>
            </div>

            {new37
                ? <form id="form_ra_37" onSubmit={new_ra_37}>
                    {_COMPONENT_37('', false)}
                    <div className="text-center">
                        <button className="btn btn-success btn-sm my-2">
                            <i class="far fa-share-square"></i> AÑADIR ELEMENTOS
                        </button>
                    </div>
                </form>
                : ""}
            {newImport ? _COMPONENTN_IMPORT() : ''}
            {_LIST_COMPONENT()}
            {edit37
                ? <form id="form_ra_36_info_edit" onSubmit={edit_ra_37}>
                    <h4 className="fw-bold text-center py-2">Actualizar Elemento</h4>
                    {_COMPONENT_37('_edit', edit37)}
                    <div className="text-center">
                        <button className="btn btn-success btn-sm  my-2">
                            <i class="far fa-share-square"></i> GUARDAR CAMBIOS
                        </button>
                    </div>
                </form>
                : ""}
            <h3 className="py-3" >3.7.2 Evaluación Norma NRS-10</h3>
            {_COMPOENT_REVIEW()}
        </div>
    );
}
