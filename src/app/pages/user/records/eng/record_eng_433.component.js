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
        const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR } = this.props;
        const { } = this.state;
        const SUBCATEGORIES = currentRecord.subcategory ? currentRecord.subcategory.split(';') : [];

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
        // COMPONENT JSX
        let COMPONENT_912 = () => {
            return <>
                {SUBCATEGORIES[10] == 1 ? <>
                    <div className="row">
                        <div className="col-10">
                            <label className="fw-bold text-uppercase my-2">Paso 9, Desplazamientos horizontales. Se evalúan los desplazamientos horizontales, incluyendo los efectos torsionales dela estructura, las derivas (desplazamiento entre niveles continuos), por medio de los procedimientos del (Cap. A.6), y con base en los desplazamientos obtenidos en el paso 8.</label>
                        </div>
                        <div className="col-2">
                            <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s433', 'check', 0) ?? 1)} name="r_e_select_s433"
                                defaultValue={_GET_STEP_TYPE_INDEX('s433', 'check', 0) ?? 1} onChange={()=>manage_step_912()} >
                                <option value="0" className="text-danger">NO CUMPLE</option>
                                <option value="1" className="text-success">CUMPLE</option>
                            </select>
                        </div>
                    </div>
                </> : ""}
                {SUBCATEGORIES[11] == 1 ? <>
                    <div className="row">
                        <div className="col-10">
                            <label className="fw-bold text-uppercase my-2">Paso10: Verificación de las derivas. Comprobar que las derivas no excedan los límites del (Cap. A.6), si la estructura excede dichos límites,  es obligatorio rigidizarla y llevar a cabo los pasos 8, 9 y 10, hasta que cumpla.</label>
                        </div>
                        <div className="col-2">
                            <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s43310', 'check', 0) ?? 1)} name="r_e_select_s43310"
                                defaultValue={_GET_STEP_TYPE_INDEX('s43310', 'check', 0) ?? 1} onChange={()=>manage_step_912()}>
                                <option value="0" className="text-danger">NO CUMPLE</option>
                                <option value="1" className="text-success">CUMPLE</option>
                            </select>
                        </div>
                    </div>
                </> : ""}
                {SUBCATEGORIES[12] == 1 ? <>
                    <div className="row">
                        <div className="col-10">
                            <label className="fw-bold text-uppercase my-2">Paso 11, Combinación de las diferentes solicitudes. De la combinación de las diferentes solicitudes sale la obtención de las fuerzas internas de diseño de la estructura, (Cap. B.2), por el método de diseño propio de cada material estructural,  cada una de las combinaciones de carga se multiplica por un coeficiente de carga prescrito para esta combinación,  en los efectos del sismo de diseño, se tiene en cuenta la capacidad de disipación de energía lo cual se logra empleando unos efectos sísmicos reducidos de diseño, E, determinadas en el paso 7, por el coeficiente de capacidad de disipar energía,  R(E = Fs/R). </label>
                        </div>
                        <div className="col-2">
                            <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s43311', 'check', 0) ?? 1)} name="r_e_select_s43311"
                                defaultValue={_GET_STEP_TYPE_INDEX('s43311', 'check', 0) ?? 1} onChange={()=>manage_step_912()}>
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
                                defaultValue={_GET_STEP_TYPE_INDEX('s43312', 'check', 0) ?? 1} onChange={()=>manage_step_912()}>
                                <option value="0" className="text-danger">NO CUMPLE</option>
                                <option value="1" className="text-success">CUMPLE</option>
                            </select>
                        </div>
                    </div>
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
                                        defaultValue={_GET_STEP_TYPE_INDEX('s43312', 'check', 1) ?? 1} onChange={()=>manage_step_912()}>
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
                                        defaultValue={_GET_STEP_TYPE_INDEX('s43312', 'check', 2) ?? 1} onChange={()=>manage_step_912()}>
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
                                        defaultValue={_GET_STEP_TYPE_INDEX('s43312', 'check', 3) ?? 1} onChange={()=>manage_step_912()}>
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
                                        defaultValue={_GET_STEP_TYPE_INDEX('s43312', 'check', 4) ?? 1} onChange={()=>manage_step_912()}>
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
                                        defaultValue={_GET_STEP_TYPE_INDEX('s43312', 'check', 5) ?? 1} onChange={()=>manage_step_912()}>
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
                                        defaultValue={_GET_STEP_TYPE_INDEX('s43312', 'check', 6) ?? 1} onChange={()=>manage_step_912()}>
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
                                        defaultValue={_GET_STEP_TYPE_INDEX('s43312', 'check', 7) ?? 1} onChange={()=>manage_step_912()}>
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
                                        defaultValue={_GET_STEP_TYPE_INDEX('s43312', 'check', 8) ?? 1} onChange={()=>manage_step_912()}>
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
                                    defaultValue={_GET_STEP_TYPE_INDEX('s433b', 'check', 0) ?? 1} onChange={()=>manage_step_912()} >
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
                                    defaultValue={_GET_STEP_TYPE_INDEX('s433b', 'check', 1) ?? 1} onChange={()=>manage_step_912()} >
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
                                    defaultValue={_GET_STEP_TYPE_INDEX('s433b', 'check', 2) ?? 1} onChange={()=>manage_step_912()} >
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
                                    defaultValue={_GET_STEP_TYPE_INDEX('s433b', 'check', 3) ?? 1}  onChange={()=>manage_step_912()} >
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
                                    defaultValue={_GET_STEP_TYPE_INDEX('s433b', 'check', 4) ?? 1} onChange={()=>manage_step_912()} >
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
                                    defaultValue={_GET_STEP_TYPE_INDEX('s433b', 'check', 5) ?? 1} onChange={()=>manage_step_912()} >
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
                                    defaultValue={_GET_STEP_TYPE_INDEX('s433b', 'check', 6) ?? 1} onChange={()=>manage_step_912()} >
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
                                    defaultValue={_GET_STEP_TYPE_INDEX('s433b', 'check', 7) ?? 1} onChange={()=>manage_step_912()} >
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
                                    defaultValue={_GET_STEP_TYPE_INDEX('s433b', 'check', 8) ?? 1} onChange={()=>manage_step_912()} >
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
                                    defaultValue={_GET_STEP_TYPE_INDEX('s433b', 'check', 9) ?? 1} onChange={()=>manage_step_912()} >
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
                                    defaultValue={_GET_STEP_TYPE_INDEX('s433b', 'check', 10) ?? 1} onChange={()=>manage_step_912()} >
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
                                    defaultValue={_GET_STEP_TYPE_INDEX('s433b', 'check', 11) ?? 1} onChange={()=>manage_step_912()} >
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
                                    defaultValue={_GET_STEP_TYPE_INDEX('s433b', 'check', 12) ?? 1} onChange={()=>manage_step_912()} >
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
                                    defaultValue={_GET_STEP_TYPE_INDEX('s433b', 'check', 13) ?? 1} onChange={()=>manage_step_912()} >
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
                                    defaultValue={_GET_STEP_TYPE_INDEX('s433b', 'check', 14) ?? 1} onChange={()=>manage_step_912()} >
                                    <option value="0" className="text-danger">NO CUMPLE</option>
                                    <option value="1" className="text-success">CUMPLE</option>
                                    <option value="2" className="text-warning">N/A</option>
                                </select>
                            </div>
                        </div>
                    </li>
                </ul>
            </>
        }
        // FUNCTIONS AND APIS
        //var formData = new FormData();

        let manage_step_912 = (e) => {
            if(e) e.preventDefault();
            var formData = new FormData();

            let checks = [];
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
                    {SUBCATEGORIES[14] == 1 ? <>
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