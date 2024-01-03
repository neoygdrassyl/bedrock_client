import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import RECORD_ENG_SERVICE from '../../../../services/record_eng.service'

const MySwal = withReactContent(Swal);

class RECORD_ENG_STEP_44 extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR } = this.props;
        const { } = this.state;

        // FUNCTIONS & VARIABLES
        // DATA GETTERS
        let LOAD_STEP = (_id_public) => {
            var _CHILD = currentRecord.record_eng_steps;
            for (var i = 0; i < _CHILD.length; i++) {
                if (_CHILD[i].version == currentVersionR && _CHILD[i].id_public == _id_public) return _CHILD[i]
            }
            return []
        }

        // DATA CONVERTERS
        let _GET_SELECT_COLOR_VALUE = (_VALUE) => {
            if (_VALUE == '0') {
                return 'form-select text-danger form-control form-control-sm';
            }
            if (_VALUE == '1') {
                return 'form-select text-success form-control form-control-sm';
            }
            if (_VALUE == '2') {
                return 'form-select text-warning form-control form-control-sm';
            }
            return 'form-select form-control form-control-sm text-success';
        }
        let _GET_STEP_TYPE_INDEX = (_id_public, _type, _index) => {
            var STEP = LOAD_STEP(_id_public);
            if (!STEP.id) return null;
            var value = STEP[_type]
            value = value.split(';');
            return value[_index]
        }
        let _GET_STEP_TYPE = (_id_public, _type) => {
            var STEP = LOAD_STEP(_id_public);
            if (!STEP.id) return [];
            var value = STEP[_type] ? STEP[_type] : []
            if (!value) return [];
            value = value.split(';');
            return value
        }
        // COMPONENT JSX
        let COMPONENT = () => {
            return <>
                <ul class="list-group my-0 py-0">
                    <li class="list-group-item py-0">
                        <div className="row">
                            <div className="col-10">
                                <label className="">Los documentos aportados están firmados por los profesionales responsables de su elaboración</label>
                            </div>
                            <div className="col-2">
                                <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s44', 'check', 0) ?? 1)} name="r_e_select_s44"
                                    defaultValue={_GET_STEP_TYPE_INDEX('s44', 'check', 0) ?? 1} onChange={() => manage_step_44()}>
                                    <option value="0" className="text-danger">NO</option>
                                    <option value="1" className="text-success">SI</option>
                                    <option value="2" className="text-warning">N/A</option>
                                </select>
                            </div>
                        </div>
                    </li>
                    <li class="list-group-item py-0">
                        <div className="row">
                            <div className="col-10">
                                <label className="">Los profesionales cumplen con la experiencia mínima establecida en la ley 400 de 1997</label>
                            </div>
                            <div className="col-2">
                                <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s44', 'check', 1) ?? 1)} name="r_e_select_s44"
                                    defaultValue={_GET_STEP_TYPE_INDEX('s44', 'check', 1) ?? 1} onChange={() => manage_step_44()}>
                                    <option value="0" className="text-danger">NO</option>
                                    <option value="1" className="text-success">SI</option>
                                    <option value="2" className="text-warning">N/A</option>
                                </select>
                            </div>
                        </div>
                    </li>
                    <li class="list-group-item py-0">
                        <div className="row">
                            <div className="col-10">
                                <label className="">El proyecto estructural coincide con el diseño arquitectónico</label>
                            </div>
                            <div className="col-2">
                                <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s44', 'check', 2) ?? 1)} name="r_e_select_s44"
                                    defaultValue={_GET_STEP_TYPE_INDEX('s44', 'check', 2) ?? 1} onChange={() => manage_step_44()}>
                                    <option value="0" className="text-danger">NO</option>
                                    <option value="1" className="text-success">SI</option>
                                    <option value="2" className="text-warning">N/A</option>
                                </select>
                            </div>
                        </div>
                    </li>
                    <li class="list-group-item py-0">
                        <div className="row">
                            <div className="col-10">
                                <label className="">¿La cimentación y propuesta estructural recogen las recomendaciones del estudio de suelos?</label>
                            </div>
                            <div className="col-2">
                                <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s44', 'check', 3) ?? 1)} name="r_e_select_s44"
                                    defaultValue={_GET_STEP_TYPE_INDEX('s44', 'check', 3) ?? 1} onChange={() => manage_step_44()}>
                                    <option value="0" className="text-danger">NO</option>
                                    <option value="1" className="text-success">SI</option>
                                    <option value="2" className="text-warning">N/A</option>
                                </select>
                            </div>
                        </div>
                    </li>
                    <li class="list-group-item py-0">
                        <div className="row">
                            <div className="col-10">
                                <label className="">El sistema estructural propuesto se enmarca dentro de los tipos admitidos por la NSR-10</label>
                            </div>
                            <div className="col-2">
                                <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s44', 'check', 4) ?? 1)} name="r_e_select_s44"
                                    defaultValue={_GET_STEP_TYPE_INDEX('s44', 'check', 4) ?? 1} onChange={() => manage_step_44()}>
                                    <option value="0" className="text-danger">NO</option>
                                    <option value="1" className="text-success">SI</option>
                                    <option value="2" className="text-warning">N/A</option>
                                </select>
                            </div>
                        </div>
                    </li>
                    <li class="list-group-item py-0">
                        <div className="row">
                            <div className="col-10">
                                <label className="">¿Los sótanos o estructuras de cimentación invaden el antejardín y/o predios vecinos?</label>
                            </div>
                            <div className="col-2">
                                <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s44', 'check', 5) ?? 1)} name="r_e_select_s44"
                                    defaultValue={_GET_STEP_TYPE_INDEX('s44', 'check', 5) ?? 1} onChange={() => manage_step_44()}>
                                    <option value="0" className="text-danger">NO</option>
                                    <option value="1" className="text-success">SI</option>
                                    <option value="2" className="text-warning">N/A</option>
                                </select>
                            </div>
                        </div>
                    </li>
                    <li class="list-group-item py-0">
                        <div className="row">
                            <div className="col-10">
                                <label className="">¿La información estructural es suficiente para entender y construir el proyecto?</label>
                            </div>
                            <div className="col-2">
                                <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s44', 'check', 6) ?? 1)} name="r_e_select_s44"
                                    defaultValue={_GET_STEP_TYPE_INDEX('s44', 'check', 6) ?? 1} onChange={() => manage_step_44()}>
                                    <option value="0" className="text-danger">NO</option>
                                    <option value="1" className="text-success">SI</option>
                                    <option value="2" className="text-warning">N/A</option>
                                </select>
                            </div>
                        </div>
                    </li>
                    <li class="list-group-item py-0">
                        <div className="row">
                            <div className="col-10">
                                <label className="">¿De acuerdo con las áreas de construcción y/o altura de la edificación se requiere instrumentación sísmica?</label>
                            </div>
                            <div className="col-2">
                                <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s44', 'check', 7) ?? 1)} name="r_e_select_s44"
                                    defaultValue={_GET_STEP_TYPE_INDEX('s44', 'check', 7) ?? 1} onChange={() => manage_step_44()}>
                                    <option value="0" className="text-danger">NO</option>
                                    <option value="1" className="text-success">SI</option>
                                    <option value="2" className="text-warning">N/A</option>
                                </select>
                            </div>
                        </div>
                    </li>
                    <li class="list-group-item py-0">
                        <div className="row">
                            <div className="col-10">
                                <label className="">¿De requerirse instrumentación sísmica, el proyecto ha dispuesto los espacios arquitectónicos requeridos?</label>
                            </div>
                            <div className="col-2">
                                <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s44', 'check', 8) ?? 1)} name="r_e_select_s44"
                                    defaultValue={_GET_STEP_TYPE_INDEX('s44', 'check', 8) ?? 1} onChange={() => manage_step_44()}>
                                    <option value="0" className="text-danger">NO</option>
                                    <option value="1" className="text-success">SI</option>
                                    <option value="2" className="text-warning">N/A</option>
                                </select>
                            </div>
                        </div>
                    </li>
                    <li class="list-group-item py-0">
                        <div className="row">
                            <div className="col-10">
                                <label className="">¿El proyecto tiene sótanos o requiere realizar excavaciones y/o movimientos de tierra que generen taludes?</label>
                            </div>
                            <div className="col-2">
                                <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s44', 'check', 9) ?? 1)} name="r_e_select_s44"
                                    defaultValue={_GET_STEP_TYPE_INDEX('s44', 'check', 9) ?? 1} onChange={() => manage_step_44()}>
                                    <option value="0" className="text-danger">NO</option>
                                    <option value="1" className="text-success">SI</option>
                                    <option value="2" className="text-warning">N/A</option>
                                </select>
                            </div>
                        </div>
                    </li>
                    <li class="list-group-item py-0">
                        <div className="row">
                            <div className="col-10">
                                <label className="">¿El proyecto cumple con la separación sísmica mínima requerida?</label>
                            </div>
                            <div className="col-2">
                                <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s44', 'check', 10) ?? 1)} name="r_e_select_s44"
                                    defaultValue={_GET_STEP_TYPE_INDEX('s44', 'check', 10) ?? 1} onChange={() => manage_step_44()}>
                                    <option value="0" className="text-danger">NO</option>
                                    <option value="1" className="text-success">SI</option>
                                    <option value="2" className="text-warning">N/A</option>
                                </select>
                            </div>
                        </div>
                    </li>
                    <li class="list-group-item py-0">
                        <div className="row">
                            <div className="col-10">
                                <label className="">¿El proyecto requiere supervisión técnica estructural?</label>
                            </div>
                            <div className="col-2">
                                <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s44', 'check', 11) ?? 1)} name="r_e_select_s44"
                                    defaultValue={_GET_STEP_TYPE_INDEX('s44', 'check', 11) ?? 1} onChange={() => manage_step_44()}>
                                    <option value="0" className="text-danger">NO</option>
                                    <option value="1" className="text-success">SI</option>
                                    <option value="2" className="text-warning">N/A</option>
                                </select>
                            </div>
                        </div>
                    </li>
                    <li class="list-group-item py-0">
                        <div className="row">
                            <div className="col-10">
                                <label className="">¿El proyecto requiere supervisión Geotécnico?</label>
                            </div>
                            <div className="col-2">
                                <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s44', 'check', 12) ?? 1)} name="r_e_select_s44"
                                    defaultValue={_GET_STEP_TYPE_INDEX('s44', 'check', 12) ?? 1} onChange={() => manage_step_44()}>
                                    <option value="0" className="text-danger">NO</option>
                                    <option value="1" className="text-success">SI</option>
                                    <option value="2" className="text-warning">N/A</option>
                                </select>
                            </div>
                        </div>
                    </li>
                    <li class="list-group-item py-0">
                        <div className="row">
                            <div className="col-10">
                                <label className="">¿Durante el proceso de revisión hubo cambios frente al proyecto inicial en materia de geometría, uso, alturas, etc?</label>
                            </div>
                            <div className="col-2">
                                <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s44', 'check', 13) ?? 1)} name="r_e_select_s44"
                                    defaultValue={_GET_STEP_TYPE_INDEX('s44', 'check', 13) ?? 1} onChange={() => manage_step_44()}>
                                    <option value="0" className="text-danger">NO</option>
                                    <option value="1" className="text-success">SI</option>
                                    <option value="2" className="text-warning">N/A</option>
                                </select>
                            </div>
                        </div>
                    </li>
                    <li class="list-group-item py-0">
                        <div className="row">
                            <div className="col-10">
                                <label className="">¿Estos cambios fueron notificados al asesor arquitectónico y jurídico?</label>
                            </div>
                            <div className="col-2">
                                <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s44', 'check', 14) ?? 1)} name="r_e_select_s44"
                                    defaultValue={_GET_STEP_TYPE_INDEX('s44', 'check', 14) ?? 1} onChange={() => manage_step_44()}>
                                    <option value="0" className="text-danger">NO</option>
                                    <option value="1" className="text-success">SI</option>
                                    <option value="2" className="text-warning">N/A</option>
                                </select>
                            </div>
                        </div>
                    </li>
                    <li class="list-group-item py-0">
                        <div className="row">
                            <div className="col-10">
                                <label className="">Visualización de planos y detalles claros (no borrosos) para verificar su cumplimiento</label>
                            </div>
                            <div className="col-2">
                                <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s44', 'check', 15) ?? 1)} name="r_e_select_s44"
                                    defaultValue={_GET_STEP_TYPE_INDEX('s44', 'check', 15) ?? 1} onChange={() => manage_step_44()}>
                                    <option value="0" className="text-danger">NO</option>
                                    <option value="1" className="text-success">SI</option>
                                    <option value="2" className="text-warning">N/A</option>
                                </select>
                            </div>
                        </div>
                    </li>
                </ul>
            </>
        }
        let _COMPONENT_CHECK = () => {
            const _CHECK_ARRAY = _GET_STEP_TYPE('s44_check', 'check');
            const LIST = [
                { title: 'PARA PROYECTOS SUJETOS AL TÍTULO E DEL REGLAMENTO NSR-10*:', className: 'fw-bold', items: [], },
                {
                    title: false, items: [
                        { i: 0, v: 0, desc: 'APIQUE', },
                        { i: 1, v: 0, desc: 'CUADRO DE LONGITUD DE MUROS CONFINADOS', },
                        { i: false, v: 0, desc: 'PLANOS CON ELEMENTOS ESTRUCTURALES DE MUROS CONFINADOS, CIMENTACION ENTREPISOS Y CUBIERTA*', },
                        { i: false, v: 0, desc: 'Rótulo', },
                        { i: 2, v: 0, desc: 'Dirección', },
                        { i: 3, v: 0, desc: 'Firma del arquitecto', },
                        { i: 4, v: 0, desc: 'Número de matrícula del ingeniero', },
                        { i: 5, v: 0, desc: 'Escala', },
                        { i: 6, v: 0, desc: 'Planta de cimentación con ejes', },
                        { i: 7, v: 0, desc: 'Plantas de vigas y muro con ejes', },
                        { i: 8, v: 0, desc: 'Despiece de elementos de confinamiento', },
                        { i: 9, v: 0, desc: 'Especificaciones de materiales', },
                    ]
                },
                { title: 'PARA PROYECTOS NO SUJETOS AL TÍTULO E DEL REGLAMENTO NSR-10*:', className: 'fw-bold', items: [], },
                {
                    title: false, items: [
                        { i: 10, v: 0, desc: 'ESTUDIO DE SUELOS Y GEOTÉCNICO', },
                        { i: 11, v: 0, desc: 'MEMORIAS DE CÁLCULO ESTRUCTURAL', },
                        { i: false, v: 0, desc: 'PLANOS ESTRUCTURALES*', },
                        { i: false, v: 0, desc: 'Rótulo', },
                        { i: 12, v: 0, desc: 'Dirección', },
                        { i: 13, v: 0, desc: 'Firma del arquitecto', },
                        { i: 14, v: 0, desc: 'Número de matrícula del ingeniero', },
                        { i: 15, v: 0, desc: 'Escala', },
                        { i: 16, v: 0, desc: 'Planta de cimentación con ejes', },
                        { i: 17, v: 0, desc: 'Plantas estructurales con ejes', },
                        { i: 18, v: 0, desc: 'Despiece de elementos de confinamiento', },
                        { i: 19, v: 0, desc: 'Especificaciones de materiales', },
                        { i: false, v: 0, desc: 'ELEMENTOS NO ESTRUCTURALES', },
                        { i: 20, v: 0, desc: 'Cálculo de los elementos no estructurales', },
                        { i: 21, v: 0, desc: 'Planos de elementos no estructurales', },
                    ]
                },
                { title: 'PROYECTOS DE INGENIERIA PARA EL RECONOCIMIENTO DE LA EXISTENCIA DE EDIFICACIONES', className: 'fw-bold', items: [], },
                {
                    title: false, items: [
                        { i: 22, v: 0, desc: 'PARA PROYECTOS SUJETOS AL TÍTULO E DEL REGLAMENTONSR-10 Peritaje simplificado según Manual de Construcción, Evaluación y Rehabilitación sismo resistente de Viviendas de Mampostería de la Asociación de Ingeniería Sísmica, AIS (Decreto 1077, Artículo 2.2.6.4.2).', },
                        { i: 23, v: 0, desc: 'PARA PROYECTOS NO SUJETOS AL TÍTULO E DEL REGLAMENTO NSR-10 Copia de un peritaje técnico que sirva para determinar la estabilidad de la construcción y las intervenciones y obras a realizar que lleven progresiva o definitivamente a disminuir la vulnerabilidad sísmica de la edificación, cuando a ello hubiere lugar (Decreto 1077, Artículo 2.2.6.4.2.3).', },
                    ]
                },
                { title: '*Todos los planos y estudios especializados deben ir debidamente rotulados y firmados por profesional idóneo de acuerdo con el Título VI – Ley 400 de 1997', items: [], },
                
            ]

            return LIST.map((list, i) => {
                return <>
                    <div className="row border">
                        {list.title ? <div className='col'><label className={list.className ?? ''}>{list.title}</label></div> : ''}
                    </div>
                    {list.items.map((item, j) => {
                        return <>
                            <div className='row border'>
                                <div className='col'><label>{item.desc}</label></div>
                                {item.i === false ? '' :
                                    <div className='col-2'><select className={_GET_SELECT_COLOR_VALUE(_CHECK_ARRAY[item.i])}
                                        name="s_44_checks" id={"s_44_checks_" + item.i}
                                        defaultValue={_CHECK_ARRAY[item.i] ?? 1} onChange={() => manage_step_44(false)} >
                                        <option value="0" className="text-danger">NO</option>
                                        <option value="1" className="text-success">SI</option>
                                        <option value="2" className="text-warning">NA</option>
                                    </select></div>
                                }
                            </div>
                        </>
                    })}
                </>
            })
        }
        // FUNCTIONS AND APIS
        //var formData = new FormData();

        let manage_step_44 = (e) => {
            if (e) e.preventDefault();
            var formData = new FormData();

            let checks = [];
            formData = new FormData();
            checks = [];
            var checks_2 = document.getElementsByName('r_e_select_s44');
            for (var i = 0; i < checks_2.length; i++) {
                checks.push(checks_2[i].value)
            }
            formData.set('check', checks.join(';'));

            formData.set('version', currentVersionR);
            formData.set('recordEngId', currentRecord.id);
            formData.set('id_public', 's44');
            save_step('s44', false, formData);


            formData = new FormData();
            checks = [];
            var checks_html = document.getElementsByName('s_44_checks').length;
            for (var i = 0; i < checks_html; i++) {
                var c =  document.getElementById('s_44_checks_'+i).value;
                checks.push(c)
            }
            formData.set('check', checks.join(';'));

            formData.set('version', currentVersionR);
            formData.set('recordEngId', currentRecord.id);
            formData.set('id_public', 's44_check');
            save_step('s44_check', false, formData);

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
            <div className="record_eng_step_44 container">
                <label className='fw-bold my-3'>EVALUACIÓN DEL PROYECTO</label>
                {COMPONENT()}
                <label className='fw-bold my-3'>EVALUACIÓN DE CHECKEO</label>
                {_COMPONENT_CHECK()}
            </div >
        );
    }
}

export default RECORD_ENG_STEP_44;