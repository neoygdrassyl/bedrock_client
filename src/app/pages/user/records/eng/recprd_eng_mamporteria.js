import React from 'react'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import RECORD_ENG_SERVICE from '../../../../services/record_eng.service'

const MySwal = withReactContent(Swal);

export const ENG_MANPOSTERIA = (props) => {

    const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, version, requestUpdateRecord } = props;
    const SUBCATEGORIES = currentRecord.subcategory ? currentRecord.subcategory.split(';') : [];

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

    let LOAD_STEP = (_id_public) => {
        var _CHILD = currentRecord.record_eng_steps;
        for (var i = 0; i < _CHILD.length; i++) {
            if (_CHILD[i].version == currentVersionR && _CHILD[i].id_public == _id_public) return _CHILD[i]
        }
        return []
    }

    let _GET_STEP_TYPE_INDEX = (_id_public, _type, _index) => {
        var STEP = LOAD_STEP(_id_public);
        if (!STEP) return null;
        if (!STEP['id']) return null;
        var value = STEP[_type]
        if (!value) return null;
        value = value.split(';');
        return value[_index]
    }

    let get_E118 = () => {
        let E118 = _GET_STEP_TYPE_INDEX('s4313', 'value', 11) || '';
        return E118
    }

    let get_emin = () => {
        let E118 = get_E118()
        let F344 = document.getElementById('mamposteria_01_2') ? document.getElementById('mamposteria_01_2').value : (_GET_STEP_TYPE_INDEX('mamposteria_01', 'value', 2) || '');
        let dic = {
            "ALTA": [110, 110],
            "MEDIA": [100, 110],
            "BAJA": [95, 110],
        }
        if (E118 && F344) return dic[E118][F344 - 1] || ''
        return ''
    }


    const MANPOSTERIA_1 = [
        { i: 0, name: 'Area de entrepiso o cubierta (m2)', open: true, calc: () => null, },
        { i: 1, name: 'es cubierta ligera?', values: ['SI', 'NO', 'NA'], calc: () => null, },
        { i: 2, name: 'número de pisos', open: true, calc: () => null, },
        { i: 3, name: 'e (espesor del muro)', open: true, calc: () => null, },
        { i: 4, name: 'e (mín)', calc: get_emin, },
        { i: 5, name: 'Zona de amenaza', calc: get_E118, },
        { c: 0, name: 'Evaluación', },
    ];


    let get_F355 = () => {
        let E118 = _GET_STEP_TYPE_INDEX('s4313', 'value', 11) || null;
        let E113 = _GET_STEP_TYPE_INDEX('s4233', 'value', 0) || null;
        let dic = {
            "ALTA": {
                '0.4': 33,
                '0.35': 30,
                '0.3': 25,
                '0.25': 21,
            },
            "MEDIA": {
                "0.2": 17,
                "0.15": 13,
            },
            "BAJA": {
                "0.1": 8,
                "0.05": 4,
            },
        }
        if (E113 && E118) return dic[E118][E113] || ''
        return ''
    }

    let get_F356 = () => {
        let F342 = null
        if (document.getElementById('mamposteria_01_0')) F342 = document.getElementById('mamposteria_01_0').value
        return F342 || _GET_STEP_TYPE_INDEX('mamposteria_01', 'value', 0) || '';
    }

    let get_F358 = () => {
        // ROUNDUP((F355*F356)/F357;2)
        let F355 = get_F355() || 0;
        let F356 = get_F356() || 0;
        let F357 = document.getElementById('mamposteria_02_2') ? document.getElementById('mamposteria_02_2').value : (_GET_STEP_TYPE_INDEX('mamposteria_02', 'value', 2) || 1);
        return Math.ceil(F355 * F356 / F357 * 100) / 100;
    }

    let get_F362 = () => {
        // IF((F358-F360)<=0; 0;(F358-F360))
        let F358 = get_F358()
        let F360 = document.getElementById('mamposteria_02_4') ? document.getElementById('mamposteria_02_4').value : (_GET_STEP_TYPE_INDEX('mamposteria_02', 'value', 4) || 0);
        if (F358 - F360 <= 0) return 0
        return (F358 - F360).toFixed(2)
    }

    let get_G362 = () => {
        // IF((F358-G360)<=0; 0;(F358-G360))
        let F358 = get_F358()
        let G360 = document.getElementById('mamposteria_02_5') ? document.getElementById('mamposteria_02_5').value : (_GET_STEP_TYPE_INDEX('mamposteria_02', 'value', 5) || 0);
        if (F358 - G360 <= 0) return 0
        return (F358 - G360).toFixed(2)
    }

    let get_F367 = () => {
        // MIN(F368:F370)
        return Math.min(...[Number(get_F368()), Number(get_F369()), get_F370()]).toFixed(2)
    }

    let get_F368 = () => {
        // 35*(F357/1000)
        let F357 = document.getElementById('mamposteria_02_2') ? document.getElementById('mamposteria_02_2').value : (_GET_STEP_TYPE_INDEX('mamposteria_02', 'value', 2) || 0);
        return Number(35 * F357 / 1000).toFixed(2)
    }

    let get_F369 = () => {
        // 1,5*F365
        let F365 = document.getElementById('mamposteria_02_0') ? document.getElementById('mamposteria_02_0').value : (_GET_STEP_TYPE_INDEX('mamposteria_p2', 'value', 0) || 0);
        return Number(1.5 * F365).toFixed(2)
    }

    let get_F370 = () => {
        // 4
        return 4
    }

    let get_H374 = () => {
        // IF((0,35*F373)>F374; "ok";"reducir")
        let F373 = document.getElementById('mamposteria_p3_0') ? document.getElementById('mamposteria_p3_0').value : (_GET_STEP_TYPE_INDEX('mamposteria_p3', 'value', 0) || 0);
        let F374 = document.getElementById('mamposteria_p3_1') ? document.getElementById('mamposteria_p3_1').value : (_GET_STEP_TYPE_INDEX('mamposteria_p3', 'value', 1) || 0);
        if (0.35 * F373 > F374) return "OK"
        return "REDUCIR"
    }

    let get_H376 = () => {
        // =IF(AND(F376>0,5;F376>=F375/2);"ok";"aumentar")
        let F375 = document.getElementById('mamposteria_p3_2') ? document.getElementById('mamposteria_p3_2').value : (_GET_STEP_TYPE_INDEX('mamposteria_p3', 'value', 2) || 0);
        let F376 = document.getElementById('mamposteria_p3_3') ? document.getElementById('mamposteria_p3_3').value : (_GET_STEP_TYPE_INDEX('mamposteria_p3', 'value', 3) || 0);
        if (F376 > 0.5 && F376 >= F375 / 2) return "OK"
        return "AUMENTAR"
    }


    const MANPOSTERIA_2 = [
        { i: 0, name: 'Coeficiente Mo (E.3.6-1)', calc: get_F355, },
        { i: 1, name: 'Ap m^2', calc: get_F356, },
        { i: 2, name: 'espesor del muro (t) mm', open: true, calc: () => null, },
        { i: 3, name: 'Longitud minima de muro en ambas direcciones (E.3.6.4) m', calc: get_F358, },
        { c: 0, name: 'Evaluación', },
    ];

    const MANPOSTERIA_2_1 = [
        { i: 4, name: 'Longitud de muros X', calc: () => null, open: true, },
        { i: 5, name: 'Longitud de muros Y', calc: () => null, open: true, },
        { c: 1, name: 'Cumple Longitud minima? X', },
        { c: 2, name: 'Cumple Longitud minima? Y', },
        { i: 6, name: 'Cuanto falta para cumplir con el criterio? X', calc: get_F362, },
        { i: 7, name: 'Cuanto falta para cumplir con el criterio? Y', calc: get_G362, },
        { c: 3, name: 'Evaluación', },
    ];

    const MAMPOSTERIA_PASO_2 = [
        { i: 0, name: 'Altura de entrepiso o cubierta (m)', calc: () => null, open: true, c: 0 },
        { i: 1, name: 'Distancia minima de confinamiento (E.4.3.3) (m)', calc: () => null, open: true, },
        { i: 2, name: 'Distancia minima horizontal de confinamiento calculada (m)', calc: () => get_F367, },
        { i: 3, name: 'D1 (m)', calc: () => get_F368, },
        { i: 4, name: 'D2 (m)', calc: () => get_F369, },
        { i: 5, name: 'D3 (m)', calc: () => get_F370, },
    ]

    const MAMPOSTERIA_PASO_3 = [
        { i: 0, name: 'Área de muro (m^2)', },
        { i: 1, name: 'Área de abertura (m^2)', i2: 4, c: 0 },
        { i: 2, name: 'Dimensión mínima de la abertura (E.3.4.1) (m)', },
        { i: 3, name: 'Distancia mínima entre aberturas (E.3.4.2) (m)', i2: 5, c: 1 },
    ]

    const MAMPOSTERIA_PASO_4 = [
        { i: 0, c: 0, name: 'Se realizó el chequeo de distribución simetrica de muros según lo preescrito en E.3.6.6, cumpliendo con la ecuación E.3.6-2 siendo el resultado de este calculo menor a 0.15', },
    ]



    let SAVE_STEP_MAMPOSTERIA_1 = () => {
        let formData = new FormData();
        let values = [];
        let checks = [];

        document.getElementById('mamposteria_01_4').value = get_emin();
        document.getElementById('mamposteria_01_5').value = get_E118();

        MANPOSTERIA_1.map(item => {
            if (item.i > -1) values.push(document.getElementById('mamposteria_01_' + item.i).value)
            if (item.c > -1) checks.push(document.getElementById('mamposteria_01_c_' + item.c).value)
        });

        formData.set('value', values.join(';'));
        formData.set('check', checks.join(';'));


        formData.set('version', currentVersionR);
        formData.set('recordEngId', currentRecord.id);
        formData.set('id_public', 'mamposteria_01');
        save_step('mamposteria_01', false, formData);
    }

    let SAVE_STEP_MAMPOSTERIA_2 = () => {
        let formData = new FormData();
        let values = [];
        let checks = [];

        document.getElementById('mamposteria_02_0').value = get_F355();
        document.getElementById('mamposteria_02_1').value = get_F356();
        document.getElementById('mamposteria_02_3').value = get_F358();
        document.getElementById('mamposteria_02_6').value = get_F362();
        document.getElementById('mamposteria_02_7').value = get_G362();

        MANPOSTERIA_2.map(item => {
            if (item.i > -1) values.push(document.getElementById('mamposteria_02_' + item.i).value)
            if (item.c > -1) checks.push(document.getElementById('mamposteria_02_c_' + item.c).value)
        });
        MANPOSTERIA_2_1.map(item => {
            if (item.i > -1) values.push(document.getElementById('mamposteria_02_' + item.i).value)
            if (item.c > -1) checks.push(document.getElementById('mamposteria_02_c_' + item.c).value)
        });

        formData.set('value', values.join(';'));
        formData.set('check', checks.join(';'));


        formData.set('version', currentVersionR);
        formData.set('recordEngId', currentRecord.id);
        formData.set('id_public', 'mamposteria_02');
        save_step('mamposteria_02', false, formData);
    }

    let SAVE_STEP_MAMPOSTERIA_P2 = () => {
        let formData = new FormData();
        let values = [];
        let checks = [];

        document.getElementById('mamposteria_p2_2').value = get_F367();
        document.getElementById('mamposteria_p2_3').value = get_F368();
        document.getElementById('mamposteria_p2_4').value = get_F369();
        document.getElementById('mamposteria_p2_5').value = get_F370();

        MAMPOSTERIA_PASO_2.map(item => {
            values.push(document.getElementById('mamposteria_p2_' + item.i).value)
            if (item.c != undefined) checks.push(document.getElementById('mamposteria_p2_c_' + item.c).value)
        });

        formData.set('value', values.join(';'));
        formData.set('check', checks.join(';'));

        formData.set('version', currentVersionR);
        formData.set('recordEngId', currentRecord.id);
        formData.set('id_public', 'mamposteria_p2');
        save_step('mamposteria_p2', false, formData);
    }

    let SAVE_STEP_MAMPOSTERIA_P3 = () => {
        let formData = new FormData();
        let values = [];
        let checks = [];

        document.getElementById('mamposteria_p3_4').value = get_H374();
        document.getElementById('mamposteria_p3_5').value = get_H376();


        MAMPOSTERIA_PASO_2.map(item => {
            values.push(document.getElementById('mamposteria_p3_' + item.i).value)
            if (item.c != undefined) checks.push(document.getElementById('mamposteria_p3_c_' + item.c).value)
        });

        formData.set('value', values.join(';'));
        formData.set('check', checks.join(';'));

        formData.set('version', currentVersionR);
        formData.set('recordEngId', currentRecord.id);
        formData.set('id_public', 'mamposteria_p3');
        save_step('mamposteria_p3', false, formData);
    }

    let SAVE_STEP_MAMPOSTERIA_P4 = () => {
        let formData = new FormData();
        let values = [];
        let checks = [];


        MAMPOSTERIA_PASO_4.map(item => {
            // values.push(document.getElementById('mamposteria_p4_' + item.i).value)
            if (item.c != undefined) checks.push(document.getElementById('mamposteria_p4_c_' + item.c).value)
        });

        formData.set('value', values.join(';'));
        formData.set('check', checks.join(';'));

        formData.set('version', currentVersionR);
        formData.set('recordEngId', currentRecord.id);
        formData.set('id_public', 'mamposteria_p4');
        save_step('mamposteria_p4', false, formData);
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
                        requestUpdateRecord(currentItem.id);
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
                        requestUpdateRecord(currentItem.id);
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

    let COMPONENT_0 = () => <>
        <div className="row mb-1 mt-5">
            <div className='col'>
                <div className="row">
                    {MANPOSTERIA_1.map(item => <>
                        <div className="col-3 mb-1">{item.name}</div>
                        <div className="col-3 mb-1">
                            {item.i > -1 ? <>
                                {item.values ? <select className='form-select form-control form-control-sm' name="mamposteria_01" id={'mamposteria_01_' + item.i}
                                    defaultValue={_GET_STEP_TYPE_INDEX('mamposteria_01', 'value', item.i) ?? 'SI'} onChange={() => SAVE_STEP_MAMPOSTERIA_1()} >
                                    {item.values.map(v => <option>{v}</option>)}
                                </select> : <input type={item.open ? "number" : "text"} step="0.01"
                                    className="form-control" name="mamposteria_01" id={'mamposteria_01_' + item.i} disabled={item.open !== true}
                                    onBlur={() => SAVE_STEP_MAMPOSTERIA_1()}
                                    defaultValue={_GET_STEP_TYPE_INDEX('mamposteria_01', 'value', item.i) ?? item.calc() ?? ''} />}

                            </> : <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('mamposteria_01', 'check', item.c) ?? 1)}
                                name="mamposteria_01_c" id={'mamposteria_01_c_' + item.c}
                                defaultValue={_GET_STEP_TYPE_INDEX('mamposteria_01', 'check', item.c) ?? 1} onChange={() => SAVE_STEP_MAMPOSTERIA_1()} >
                                <option value="0" className="text-danger">NO CUMPLE</option>
                                <option value="1" className="text-success">CUMPLE</option>
                            </select>}

                        </div>
                    </>)}
                </div>
            </div>
        </div>

        <div className="row text-center fw-bold">
            <div className="col-6 border border-black ">Tabla E.3.5-1 Espesores nominales para muros</div>
            <div className="col-6 border border-black">Dos pisos</div>
        </div>
        <div className="row text-center">
            <div className="col-3 border border-black">Alta </div>
            <div className="col-3 border border-black">110</div>
            <div className="col-3 border border-black">110</div>
            <div className="col-3 border border-black">100</div>
        </div>
        <div className="row text-center">
            <div className="col-3 border border-black">Intermedia </div>
            <div className="col-3 border border-black">100</div>
            <div className="col-3 border border-black">110</div>
            <div className="col-3 border border-black">95</div>
        </div>
        <div className="row text-center">
            <div className="col-3 border border-black">Baja </div>
            <div className="col-3 border border-black">95</div>
            <div className="col-3 border border-black">110</div>
            <div className="col-3 border border-black">95</div>
        </div>
    </>

    let COMPONENT_1 = () => <>

        <label className="app-p fw-bold my-2">Paso 1. Chequeo longitud mínima de muros en cada dirección de análisis</label>
        <div className="row">
            {MANPOSTERIA_2.map(item => <>
                <div className="col-3 mb-1">{item.name}</div>
                <div className="col-3 mb-1">
                    {item.i > -1 ? <>
                        <input type={item.open ? "number" : "text"} step="0.01"
                            className="form-control" name="mamposteria_02" id={'mamposteria_02_' + item.i} disabled={item.open !== true}
                            onBlur={() => SAVE_STEP_MAMPOSTERIA_2()}
                            defaultValue={_GET_STEP_TYPE_INDEX('mamposteria_02', 'value', item.i) ?? item.calc() ?? ''} />

                    </> : <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('mamposteria_02', 'check', item.c) ?? 1)}
                        name="mamposteria_02_c" id={'mamposteria_02_c_' + item.c}
                        defaultValue={_GET_STEP_TYPE_INDEX('mamposteria_02', 'check', item.c) ?? 1} onChange={() => SAVE_STEP_MAMPOSTERIA_2()} >
                        <option value="0" className="text-danger">NO CUMPLE</option>
                        <option value="1" className="text-success">CUMPLE</option>
                    </select>}

                </div>
            </>)}
        </div>
        <br />
        <div className="row">
            {MANPOSTERIA_2_1.map(item => <>
                <div className="col-3 mb-1">{item.name}</div>
                <div className="col-3 mb-1">
                    {item.i > -1 ? <>
                        <input type="number" step="0.01"
                            className="form-control" name="mamposteria_02" id={'mamposteria_02_' + item.i} disabled={item.open !== true}
                            onBlur={() => SAVE_STEP_MAMPOSTERIA_2()}
                            defaultValue={_GET_STEP_TYPE_INDEX('mamposteria_02', 'value', item.i) ?? item.calc() ?? ''} />

                    </> : <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('mamposteria_02', 'check', item.c) ?? 1)}
                        name="mamposteria_02_c" id={'mamposteria_02_c_' + item.c}
                        defaultValue={_GET_STEP_TYPE_INDEX('mamposteria_02', 'check', item.c) ?? 1} onChange={() => SAVE_STEP_MAMPOSTERIA_2()} >
                        <option value="0" className="text-danger">NO CUMPLE</option>
                        <option value="1" className="text-success">CUMPLE</option>
                    </select>}

                </div>
            </>)}
        </div>

    </>

    let COMPONENT_2 = () => <>
        <label className="app-p fw-bold my-2">Paso 2. Chequeo distancia de confinamiento</label>
        <div className="row">
            {MAMPOSTERIA_PASO_2.map(item => <>
                <div className="col-4 mb-1">{item.name}</div>
                <div className="col-4 mb-1">
                    <input type="number" step="0.01"
                        className="form-control" name="mamposteria_p2" id={'mamposteria_p2_' + item.i} disabled={item.open !== true}
                        onBlur={() => SAVE_STEP_MAMPOSTERIA_P2()}
                        defaultValue={_GET_STEP_TYPE_INDEX('mamposteria_p2', 'value', item.i) ?? item.calc() ?? ''} />
                </div>
                {item.c != undefined ? <div className="col-4 mb-1">
                    <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('mamposteria_p2', 'check', item.c) ?? 1)}
                        name="mamposteria_p2_c" id={'mamposteria_p2_c_' + item.c}
                        defaultValue={_GET_STEP_TYPE_INDEX('mamposteria_p2', 'check', item.c) ?? 1} onChange={() => SAVE_STEP_MAMPOSTERIA_P2()} >
                        <option value="0" className="text-danger">NO CUMPLE</option>
                        <option value="1" className="text-success">CUMPLE</option>
                    </select>
                </div>
                    : <div className="col-4 mb-1"></div>}
            </>)}
        </div>
    </>

    let COMPONENT_3 = () => <>
        <label className="app-p fw-bold my-2">Paso 3. Aberturas en los muroso</label>
        <div className="row">
            {MAMPOSTERIA_PASO_3.map(item => <>
                <div className="col-3 mb-1">{item.name}</div>
                <div className="col-3 mb-1">
                    <input type="number" step="0.01"
                        className="form-control" name="mamposteria_p3" id={'mamposteria_p3_' + item.i}
                        onBlur={() => SAVE_STEP_MAMPOSTERIA_P3()}
                        defaultValue={_GET_STEP_TYPE_INDEX('mamposteria_p3', 'value', item.i) ?? ''} />
                </div>

                {item.i2 ? <div className="col-3 mb-1">
                    <input className="form-control" name="mamposteria_p3" id={'mamposteria_p3_' + item.i2} disabled
                        defaultValue={_GET_STEP_TYPE_INDEX('mamposteria_p3', 'value', item.i2) ?? ''} />
                </div> :
                    <div className="col-3 mb-1"></div>}

                {item.c != undefined ? <div className="col-3 mb-1">
                    <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('mamposteria_p3', 'check', item.c) ?? 1)}
                        name="mamposteria_p3_c" id={'mamposteria_p3_c_' + item.c}
                        defaultValue={_GET_STEP_TYPE_INDEX('mamposteria_p3', 'check', item.c) ?? 1} onChange={() => SAVE_STEP_MAMPOSTERIA_P3()} >
                        <option value="0" className="text-danger">NO CUMPLE</option>
                        <option value="1" className="text-success">CUMPLE</option>
                    </select>
                </div>
                    : <div className="col-3 mb-1"></div>}

            </>)}
        </div>
    </>

    let COMPONENT_4 = () => <>
        <label className="app-p fw-bold my-2">Paso 4.Distribución simetrica de muros</label>
        <div className="row">
            {MAMPOSTERIA_PASO_4.map(item => <>
                <div className="col-9 mb-1">{item.name}</div>

                {item.c != undefined ? <div className="col-3 mb-1">
                    <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('mamposteria_p4', 'check', item.c) ?? 1)}
                        name="mamposteria_p4_c" id={'mamposteria_p4_c_' + item.c}
                        defaultValue={_GET_STEP_TYPE_INDEX('mamposteria_p4', 'check', item.c) ?? 1} onChange={() => SAVE_STEP_MAMPOSTERIA_P4()} >
                        <option value="0" className="text-danger">NO CUMPLE</option>
                        <option value="1" className="text-success">CUMPLE</option>
                    </select>
                </div>
                    : <div className="col-3 mb-1"></div>}

            </>)}
        </div>
    </>

    return <>
        {SUBCATEGORIES[16] == 1 ? <>
            <legend className="my-3 px-3 text-uppercase bg-light" id="record_eng_433">
                <label className="app-p lead fw-normal text-uppercase">Edificaciones de Mamposterías Titulo E</label>
            </legend>

            {COMPONENT_0()}
            {COMPONENT_1()}
            {COMPONENT_2()}
            {COMPONENT_3()}
            {COMPONENT_4()}

        </>
            : null}
    </>
}
