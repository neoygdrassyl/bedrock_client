import React from 'react'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import RECORD_ENG_SERVICE from '../../../../services/record_eng.service'

const MySwal = withReactContent(Swal);

export const ENG_FUEGO = (props) => {

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
    /*
        A1	Almacenamiento
        A2	Almacenamiento
        C1	Comercial
        C2	Comercial
        E	Especial
        F1	Fabril e Industrial
        F2	Fabril e Industrial
        I1	Institucional
        I2	Institucional
        I3	Institucional
        I4	Institucional
        I5	Institucional
        L	Lugares de reunión
        M	Mixto y otros
        P	Alta peligrosidad
        R1	Residencial
        R2	Residencial
        R3	Residencial
        T	Temporal
    */
    const TIPO_OCUPACION_VALUES = ['A1', 'A2', 'C1', 'C2', 'E', 'F1', 'F2', 'I1', 'I2', 'I3', 'I4', 'I5', 'L', 'M', 'P', 'R1', 'R2', 'R3', 'T'];
    const CATEGORIA = ['I', 'II', 'III'];
    const CATEGORIA_V = { 'I': 2, 'II': 1.5, 'III': 1 };
    const AGREGADO = ['Siliceo', 'Carbonato', 'Liviano'];
    const AGREGADO_2 = ['Siliceo', 'Carbonato', 'Finos Livianos', 'Gruesos Livianos'];

    const COLUMNAS = {
        'Siliceo': {
            '1': { col: 'Siliceo 1', res: 1, dim: 200, rec: 20, },
            '1.5': { col: 'Siliceo 1.5', res: 1.5, dim: 230, rec: 20, },
            '2': { col: 'Siliceo 2', res: 2, dim: 250, rec: 30, },
            '3': { col: 'Siliceo 3', res: 3, dim: 310, rec: 30, },
            '4': { col: 'Siliceo 4', res: 4, dim: 360, rec: 40, },
        },
        'Carbonato': {
            '1': { col: 'Carbonato 1', res: 1, dim: 200, rec: 20, },
            '1.5': { col: 'Carbonato 1.5', res: 1.5, dim: 230, rec: 20, },
            '2': { col: 'Carbonato 2', res: 2, dim: 250, rec: 20, },
            '3': { col: 'Carbonato 3', res: 3, dim: 300, rec: 30, },
            '4': { col: 'Carbonato 4', res: 4, dim: 310, rec: 30, },
        },
        'Liviano': {
            '1': { col: 'Carbonato 1', res: 1, dim: 200, rec: 20, },
            '1.5': { col: 'Carbonato 1.5', res: 1.5, dim: 220, rec: 20, },
            '2': { col: 'Carbonato 2', res: 2, dim: 230, rec: 20, },
            '3': { col: 'Carbonato 3', res: 3, dim: 270, rec: 30, },
            '4': { col: 'Carbonato 4', res: 4, dim: 310, rec: 30, },
        },
    }
    const LOSAS = {
        'Siliceo': {
            '1': { col: 'Siliceo 1', res: 1, dim: 90 },
            '1.5': { col: 'Siliceo 1.5', res: 1.5, dim: 110 },
            '2': { col: 'Siliceo 2', res: 2, dim: 130 },
            '3': { col: 'Siliceo 3', res: 3, dim: 160 },
            '4': { col: 'Siliceo 4', res: 4, dim: 180 },
        },
        'Carbonato': {
            '1': { col: 'Carbonato 1', res: 1, dim: 80 },
            '1.5': { col: 'Carbonato 1.5', res: 1.5, dim: 100 },
            '2': { col: 'Carbonato 2', res: 2, dim: 120 },
            '3': { col: 'Carbonato 3', res: 3, dim: 150 },
            '4': { col: 'Carbonato 4', res: 4, dim: 170 },
        },
        'Finos Livianos': {
            '1': { col: 'Carbonato 1', res: 1, dim: 70 },
            '1.5': { col: 'Carbonato 1.5', res: 1.5, dim: 80 },
            '2': { col: 'Carbonato 2', res: 2, dim: 100 },
            '3': { col: 'Carbonato 3', res: 3, dim: 120 },
            '4': { col: 'Carbonato 4', res: 4, dim: 140 },
        },
        'Gruesos Livianos': {
            '1': { col: 'Carbonato 1', res: 1, dim: 60 },
            '1.5': { col: 'Carbonato 1.5', res: 1.5, dim: 80 },
            '2': { col: 'Carbonato 2', res: 2, dim: 90 },
            '3': { col: 'Carbonato 3', res: 3, dim: 110 },
            '4': { col: 'Carbonato 4', res: 4, dim: 130 },
        },
    }

    let get_G606 = () => {
        let G605 = (document.getElementById("fuego_p1_1")?.value || _GET_STEP_TYPE_INDEX('fuego_p1', 'value', 1));
        return CATEGORIA_V[G605] || 0
    }

    let get_G612 = () => {
        let G605 = (document.getElementById("fuego_p1_1")?.value || _GET_STEP_TYPE_INDEX('fuego_p1', 'value', 1));
        return CATEGORIA_V[G605] || 0
    }

    let get_G616 = () => {
        // COLUMNAS/1000
        let mat = (document.getElementById("fuego_p2_3")?.value || _GET_STEP_TYPE_INDEX('fuego_p2', 'value', 3) || AGREGADO[0]);
        let res = (document.getElementById("fuego_p2_0")?.value || _GET_STEP_TYPE_INDEX('fuego_p2', 'value', 0) || 1);
        return Number(COLUMNAS[mat][res].dim / 1000).toFixed(4)
    }

    let get_G623 = () => {
        // G620-G622
        let G620 = Number(document.getElementById("fuego_p2_6")?.value || _GET_STEP_TYPE_INDEX('fuego_p2', 'value', 6) || 0);
        let G622 = Number(document.getElementById("fuego_p2_8")?.value || _GET_STEP_TYPE_INDEX('fuego_p2', 'value', 8) || 0);
        return Number(G620 - G622).toFixed(4)
    }

    let get_G625 = () => {
        // (((G620*(G621+G624))-(G623*(G621-G624)))/G621)*1000
        let G620 = Number(document.getElementById("fuego_p2_6")?.value || _GET_STEP_TYPE_INDEX('fuego_p2', 'value', 6) || 0);
        let G621 = Number(document.getElementById("fuego_p2_7")?.value || _GET_STEP_TYPE_INDEX('fuego_p2', 'value', 7) || 0);
        let G623 = Number(document.getElementById("fuego_p2_9")?.value || _GET_STEP_TYPE_INDEX('fuego_p2', 'value', 9) || 0);
        let G624 = Number(document.getElementById("fuego_p2_10")?.value || _GET_STEP_TYPE_INDEX('fuego_p2', 'value', 10) || 0);
        return Number((((G620 * (G621 + G624)) - (G623 * (G621 - G624))) / G621) * 1000).toFixed(4)
    }

    let get_G627 = () => {
        // LOSAS
        let mat = (document.getElementById("fuego_p2_12")?.value || _GET_STEP_TYPE_INDEX('fuego_p2', 'value', 12) || AGREGADO_2[0]);
        let res = (document.getElementById("fuego_p2_5")?.value || _GET_STEP_TYPE_INDEX('fuego_p2', 'value', 5) || 1);
        return Number(LOSAS[mat][res].dim)
    }

    let get_G628 = () => {
        // REC
        let mat = (document.getElementById("fuego_p2_3")?.value || _GET_STEP_TYPE_INDEX('fuego_p2', 'value', 3) || AGREGADO[0]);
        let res = (document.getElementById("fuego_p2_5")?.value || _GET_STEP_TYPE_INDEX('fuego_p2', 'value', 5) || 1);
        return Number(COLUMNAS[mat][res].rec)
    }

    let get_H654 = () => {
        // H655*(1+(0.03*H656))
        let H655 = get_H655();
        let H656 = get_H656();
        let value = H655 * (1 + (0.03 * H656));
        return Number(value).toFixed(4)
    }

    let get_H655 = () => {
        // (14.74 * ((H657/H658)^0.7))+(0.552*((H659^1.6)/(H660^0.2))*(1+(0.00006085*((H661/(H662*H663*H659*(H664+H659)))^0.8))))
        let H657 = get_H657();
        let H658 = Number(document.getElementById("fuego_p2_23")?.value || _GET_STEP_TYPE_INDEX('fuego_p2', 'value', 23) || 0);
        let H659 = Number(document.getElementById("fuego_p2_24")?.value || _GET_STEP_TYPE_INDEX('fuego_p2', 'value', 24) || 0);
        let H660 = get_H660();
        let H661 = get_H661();
        let H662 = get_H662();
        let H663 = get_H663();
        let H664 = Number(document.getElementById("fuego_p2_29")?.value || _GET_STEP_TYPE_INDEX('fuego_p2', 'value', 29) || 0);
        let value = 14.74 * (Math.pow(H657 / H658, 0.7)) + (0.552 * (Math.pow(H659, 1.6) / Math.pow(H660, 0.2)) * (1 + (0.00006085 * (Math.pow(H661 / (H662 * H663 * H659 * (H664 + H659))), 0.8))))
        return Number(value).toFixed(4)
    }

    let get_H656 = () => {
        // 4
        return 4
    }

    let get_H657 = () => {
        // 26.4*(9.8066)
        return Number(26.4 * (9.8066)).toFixed(4)
    }

    let get_H660 = () => {
        // 1.644 *3600
        return Number(1.644 * 3600).toFixed(4)
    }

    let get_H661 = () => {
        // 46.975 *H657 *1000
        let H657 = get_H657()
        return Number(46.975 * H657 * 1000).toFixed(4)
    }

    let get_H662 = () => {
        // 2400
        return 2400
    }

    let get_H663 = () => {
        // 837.4 / 9.8066
        return Number(837.4 / 9.8066).toFixed(4)
    }

    let get_H670 = () => {
        // H668/H669
        let H668 = Number(document.getElementById("fuego_p2_31")?.value || _GET_STEP_TYPE_INDEX('fuego_p2', 'value', 31) || 0);
        let H669 = Number(document.getElementById("fuego_p2_32")?.value || _GET_STEP_TYPE_INDEX('fuego_p2', 'value', 32) || 1);
        return Number(H668 / H669).toFixed(4)
    }

    const FUEGO_1 = [
        { i: 0, name: 'TIPO DE OCUPACIÓN', options: TIPO_OCUPACION_VALUES, open: true, calc: null, },
        { i: 1, name: 'CATEGORIA DE LA EDIFICACIÓN (J.3.3-1 Y J.2.5-4 NSR-10)', options: CATEGORIA, calc: null, open: true, },
        { i: 2, name: 'RESISTENCIA AL FUEGO ESPERADA EN HORAS', calc: get_G606 },
        { i: 3, name: 'PROVISIONES ESPECIALES', calc: null, open: true, },
    ];

    const FUEGO_2 = [
        { name: 'Columnas', name2: 'NSR 10 J.3.5-1', title: true, c: 0 },
        { i: 0, name: 'Horas de resistencia requeridas', calc: get_G612, },
        { i: 1, name: 'C1 (m)', calc: null, open: true, },
        { i: 2, name: 'C2 (m)', calc: null, open: true, },
        { i: 3, name: 'Tipo de agregado', calc: null, open: true, options: AGREGADO },
        { i: 4, name: 'Cmin', calc: get_G616, },
        { name: 'Losas', name2: 'NSR 10 J.3.5-2, J.3.5-3, J.3.5-5', title: true, c: 1 },
        { i: 5, name: 'Horas de resistencia requeridas', calc: get_G612, },
        { i: 6, name: 'Altura total placa H: (m)', calc: null, open: true, },
        { i: 7, name: 'Separacion nervios C: (m)', calc: null, open: true, },
        { i: 8, name: 'Loseta superior D1: (m)', calc: null, open: true, },
        { i: 9, name: 'Alto Casetón D2: (m)', calc: get_G623, },
        { i: 10, name: 'Ancho Vigueta B: (m)', calc: null, open: true, },
        { i: 11, name: 'Altura equivalente: (mm)', calc: get_G625, },
        { i: 12, name: 'Tipo de agregado', calc: null, open: true, options: AGREGADO_2 },
        { i: 13, name: 'Altura equivalente min: (mm)', calc: get_G627, },
        { i: 14, name: 'Recubrimiento min losas: (mm)', calc: get_G628, },
        { name: 'Vigas', title: true, },
        { i: 15, name: 'Horas de resistencia requeridas', calc: get_G612, },
        { i: 16, name: 'bw (mm)', calc: null, open: true, },
        { i: 17, name: 'Recubrimiento (mm)', calc: null, open: true, },
        { name: 'Elementos de Acero', title: true, c: 2 },
        { i: 18, name: 'Horas de resistencia requeridas', calc: get_G612, },
        { i: 19, name: 'R (min)', calc: get_H654, },
        { i: 20, name: 'R0 (min)', calc: get_H655, },
        { i: 21, name: 'H (%)', calc: get_H656, },
        { i: 22, name: 'W (N/m)', calc: get_H657, },
        { i: 23, name: 'P (mm)', calc: null, open: true, },
        { i: 24, name: 'e (mm)', calc: null, open: true, },
        { i: 25, name: 'Kc (J/h/m/K)', calc: get_H660, },
        { i: 26, name: 'Ta (J/h/m/K)', calc: get_H661, },
        { i: 27, name: 'dc (kg/m3)', calc: get_H662, },
        { i: 28, name: 'Cc (J/NK)', calc: get_H663, },
        { i: 29, name: 'L (mm)', calc: null, open: true, },
        { name: 'Elementos llenos de concreto', name2: 'NSR-10 J.3.5.4.6', title: true, c: 3 },
        { i: 30, name: 'Horas de resistencia requeridas', calc: get_G612, },
        { i: 31, name: 'Pu (kN)', calc: null, open: true, },
        { i: 32, name: 'Pr (kN)', calc: null, open: true, },
        { i: 33, name: 'Pu/Pr', calc: get_H670, },
    ];


    let SAVE_STEP_FUEGO_1 = () => {
        let formData = new FormData();
        let values = [];
        let checks = [];

        FUEGO_1.map(paso => {
            if (document.getElementById('fuego_p1_' + paso.i)) {
                let v = null
                if (paso.calc) {
                    v = paso.calc();
                    document.getElementById('fuego_p1_' + paso.i).value = v;
                }
                values.push(v || document.getElementById('fuego_p1_' + paso.i).value)
            }
            if (document.getElementById('fuego_p1_c_' + paso.c)) checks.push(document.getElementById('fuego_p1_c_' + paso.c).value)
        })


        formData.set('value', values.join(';'));
        formData.set('check', checks.join(';'));


        formData.set('version', currentVersionR);
        formData.set('recordEngId', currentRecord.id);
        formData.set('id_public', 'fuego_p1');
        save_step('fuego_p1', false, formData);
    }

    let SAVE_STEP_FUEGO_2 = () => {
        let formData = new FormData();
        let values = [];
        let checks = [];

        FUEGO_2.map(paso => {
            if (document.getElementById('fuego_p2_' + paso.i)) {
                let v = null
                if (paso.calc) {
                    v = paso.calc();
                    document.getElementById('fuego_p2_' + paso.i).value = v;
                }
                values.push(v || document.getElementById('fuego_p2_' + paso.i).value)
            }
            if (document.getElementById('fuego_p2_c_' + paso.c)) checks.push(document.getElementById('fuego_p2_c_' + paso.c).value)
        })


        formData.set('value', values.join(';'));
        formData.set('check', checks.join(';'));


        formData.set('version', currentVersionR);
        formData.set('recordEngId', currentRecord.id);
        formData.set('id_public', 'fuego_p2');
        save_step('fuego_p2', false, formData);
    }

    let SAVE_STEP_FUEGO_3 = () => {
        let formData = new FormData();
        let values = [];
        let checks = [];

        if (document.getElementById('fuego_p3_c_' + 0)) checks.push(document.getElementById('fuego_p3_c_' + 0).value)


        formData.set('value', values.join(';'));
        formData.set('check', checks.join(';'));


        formData.set('version', currentVersionR);
        formData.set('recordEngId', currentRecord.id);
        formData.set('id_public', 'fuego_p3');
        save_step('fuego_p3', false, formData);
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

    let BUILD_COMPONENT = (item, id, save) => <div className="row">
        <div className={"col-3 mb-1" + (item.title ? " fw-bold text-center" : "")}>{item.name}</div>
        <div className="col-3 mb-1">
            <div className='form-group row'>
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
        <div className="col-3 mb-1 text-center">{item.name2 || ''}</div>
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

    let PART_1 = () => <>
        {FUEGO_1.map(i => BUILD_COMPONENT(i, "fuego_p1", SAVE_STEP_FUEGO_1))}
    </>


    let PART_2 = () => <>
        {FUEGO_2.map(i => BUILD_COMPONENT(i, "fuego_p2", SAVE_STEP_FUEGO_2))}
    </>

    return <>
        {SUBCATEGORIES[17] == 1 ? <>
            <legend className="my-3 px-3 text-uppercase bg-light" id="record_eng_433">
                <label className="app-p lead fw-normal text-uppercase">PROCEDIMIENTO DE DISEÑO DE RESISTENCIA AL FUEGO DE LOS ELEMENTOS ESTRUCTURALES</label>
            </legend>

            {PART_1()}
            <label className="app-p lead fw-bold"> Paso 1. ELEMENTOS DE CONCRETO</label>
            {PART_2()}

            <div className="row">

                <div className={"col-9 mt-5 fw-bold"}>Diseño de los elementos estructrurales contra el fuego: Presenta recomendaciones respecto al diseño de los elementos estructurales y no estructurales para la resistencia al fuego, estas recomendaciones cumplen con los requerimientos minimos de resistencia al fuego (en horas) calculados según lo prescrito en el Capítulo J. con el objetivo de que la estructura presente un comportamiento adecuado ante la ocurrencia de un incendio, estas recomendaciones deben ser aprobadas por el director de obra.</div>
                <div className={"col-3 mt-5"}>
                    <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX("fuego_p3", 'check', 0) ?? 1)}
                        name={"fuego_p3" + "_c"} id={"fuego_p3" + '_c_' + 0}
                        defaultValue={_GET_STEP_TYPE_INDEX("fuego_p3", 'check', 0) ?? 1} onChange={() => SAVE_STEP_FUEGO_3()} >
                        <option value="0" className="text-danger">NO CUMPLE</option>
                        <option value="1" className="text-success">CUMPLE</option>
                    </select>
                </div>
            </div>

        </>
            : null}
    </>
}
