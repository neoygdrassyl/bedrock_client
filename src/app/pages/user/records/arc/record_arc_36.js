import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import RECORD_ARCSERVICE from '../../../../services/record_arc.service';
import perfilData from '../../../../components/jsons/perfilesData.json';
import { getJSONFull, getJSON_Simple } from '../../../../components/customClasses/typeParse';
import RECORD_ARC_36_TABLE from './record_arc_36.table';

const MySwal = withReactContent(Swal);

class RECORD_ARC_36 extends Component {
    constructor(props) {
        super(props);
        this.state = {
            link_recipe: false,
            new_duty: false,
            new_element: false,
            edit_element: false,
        };
    }
    componentDidUpdate(prevState) {
        if (this.state.edit_element !== prevState.edit_element && this.state.edit_element != false) {
            var _ITEM = this.state.edit_element;

            document.getElementById("r_a_36_info_1_edit").value = _ITEM.parent;
            document.getElementById("r_a_36_info_2_edit").value = _ITEM.name;
            document.getElementById("r_a_36_info_3_edit").value = _ITEM.norm;
            document.getElementById("r_a_36_info_4_edit").value = _ITEM.project;
            document.getElementById("r_a_36_info_5_edit").value = _ITEM.address;
            document.getElementById("r_a_36_info_6_edit").value = _ITEM.side;

            let _LIST = perfilData;
            let _COMPONENT = document.getElementById("r_a_36_imglink_edit");
            let _BASE_URL = "//www.curaduria1bucaramanga.com/public_docs/OTHERS/PERFILES/"
            _COMPONENT.href = _BASE_URL + _LIST[_ITEM.parent].src;
        }
    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR } = this.props;
        const { } = this.state;


        // DATA GETERS
        let _GET_CHILD_2 = () => {
            var _CHILD = currentItem.fun_2;
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
                _CHILD_VARS.item_211 = _CHILD.direccion;
                _CHILD_VARS.item_212 = _CHILD.direccion_ant;
                _CHILD_VARS.item_22 = _CHILD.matricula;
                _CHILD_VARS.item_23 = _CHILD.catastral;
                _CHILD_VARS.item_24 = _CHILD.suelo; // PARSER
                _CHILD_VARS.item_25 = _CHILD.lote_pla;// PARSER

                _CHILD_VARS.item_261 = _CHILD.barrio;
                _CHILD_VARS.item_262 = _CHILD.vereda;
                _CHILD_VARS.item_263 = _CHILD.comuna;
                _CHILD_VARS.item_264 = _CHILD.sector;
                _CHILD_VARS.item_265 = _CHILD.corregimiento;
                _CHILD_VARS.item_266 = _CHILD.lote;
                _CHILD_VARS.item_267 = _CHILD.estrato;
                _CHILD_VARS.item_268 = _CHILD.manzana;
            }
            return _CHILD_VARS;
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
        let LOAD_STEP = (_id_public) => {
            var _CHILD = currentRecord.record_arc_steps;
            for (var i = 0; i < _CHILD.length; i++) {
                if (_CHILD[i].version == currentVersionR && _CHILD[i].id_public == _id_public) return _CHILD[i]
            }
            return []
        }
        let _GET_CLOCK = () => {
            var _CHILD = currentItem.fun_clocks;
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
        // DATA CONVERTER
        let _GET_CLOCK_STATE = (_state, _version) => {
            var _CLOCK = _GET_CLOCK();
            if (_state == null) return false;
            for (var i = 0; i < _CLOCK.length; i++) {
                if (_CLOCK[i].state == _state && _CLOCK[i].version == _version) return _CLOCK[i];
            }
            return false;
        }
        let _GET_STEP_TYPE = (_id_public, _type) => {
            var STEP = LOAD_STEP(_id_public);
            if (!STEP.id) return [];
            var value = STEP[_type]
            if (!value) return [];
            value = value.split(';');
            return value
        }
        let _GET_STEP_TYPE_JSON = (_id_public) => {
            var STEP = LOAD_STEP(_id_public);
            if (!STEP.id) return {};
            var value = STEP['json']
            if (!value) return {};
            value = JSON.parse(JSON.parse(value));
            return value
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

        const value36 = _GET_STEP_TYPE('s36', 'value');
        const check36 = _GET_STEP_TYPE('s36', 'check');

        // COMPONENTS JSX

        let _COMPONENT_2 = () => {
            const _CHECK_ARRAY = check36;
            const _VALUE_ARRAY = value36;
            const LIST = [
                {
                    c: 0, title: 'Continuidad', items: [
                        { desc: 'La franja de circulación sigue la pendiente longitudinal de las calzadas', i: 0 },
                        { desc: 'Los accesos peatonales  vehiculares a predios respetan continuidad y nivel de FC sn generar desniveles', i: 1 },
                        { desc: 'En vías con desniveles se proyecta soluciones con elementos de transición (Gradas, rampas en el caos aprobó SPM)', i: 2 },
                    ]
                },
                {
                    c: 1, title: 'Tratamiento', items: [
                        { desc: 'Superficie de FC dura, antideslizante y continua siguiendo el MEPB', i: 3 },
                        { desc: 'La franja ambiental o de amoblamiento -FA- tratada según área de actividad', i: 4 },
                        { desc: 'Cuando A.A + servidumbre via = 1,20m; arboriza 1 árbol c/u 5m de frente', i: 5 },
                    ]
                },
                {
                    c: 2, title: 'Accesibilidad', items: [
                        { desc: 'Los vados cumplen NTC 4143 (sin obstáculos), se encuentra en la esquina y/o lado', i: 6 },
                        { desc: 'FC con losetas señaladoras y táctil para guiar el desplazamiento de personas en baja visión e invidentes NTC 5616', i: 7 },
                    ]
                },
            ]
            return LIST.map((list, i) => {
                return <div className="row border">
                    {list.title ? <div className='col-3 text-center '><label className='fw-bold'>{list.title}</label></div> : ''}
                    <div className='col'>
                        {list.items.map((item, j) => {
                            return <>
                                <div className='row border'>
                                    <div className='col'><label>{item.desc}</label></div>
                                    <div className='col-3'><select className={_GET_SELECT_COLOR_VALUE(_VALUE_ARRAY[item.i])} name="s_36_values"
                                        defaultValue={_VALUE_ARRAY[item.i]} onChange={() => save_ra_36(false)} >
                                        <option className="text-danger">NO</option>
                                        <option className="text-success">SI</option>
                                        <option className="text-warning">NA</option>
                                    </select></div>
                                </div>
                            </>
                        })}
                    </div>
                    <div className='col-2 text-center '>
                        <select className={_GET_SELECT_COLOR_VALUE(_CHECK_ARRAY[list.c])} name="s_36_checks"
                            defaultValue={_CHECK_ARRAY[list.c]} onChange={() => save_ra_36(false)} >
                            <option value="0" className="text-danger">NO CUMPLE</option>
                            <option value="1" className="text-success">CUMPLE</option>
                            <option value="2" className="text-warning">NO APLICA</option>
                        </select>
                    </div>
                </div>
            })
        }

        let _COMPONENT_CORRECTIONS = () => {
            return <div className="row">
                <div className='row  border border-dark bg-info text-light fwb-bold py-1 mx-0 mt-3'>
                    <div className='col'>
                        <label>Observaciones espacio publico</label>
                    </div>
                </div>
                <textarea className="input-group" maxLength="2000" name="s_36_values" rows="4"
                    defaultValue={value36[8]} onBlur={() => save_ra_36()}></textarea>
                <label>(máximo 2000 caracteres)</label>
            </div>
        }

        let _COMPONENT_DUTIES = () => {

            const totalBuild = _GET_CHILD_33_AREAS().reduce((sum, next) => sum += Number(_GET_TOTAL_AREA(next.build, next.historic_areas)), 0);
            const value34 = _GET_STEP_TYPE('s34', 'value');
            const json34 = _GET_STEP_TYPE_JSON('s34');
            const value35 = _GET_STEP_TYPE('s35', 'value');
            const dutyClock = _GET_CLOCK_STATE(65).resolver_context || 'NO';
            let tra = value34[2] ? value34[2].split('-')[1] : '';
            tra = tra || ''
            let strata = _GET_CHILD_2().item_267
            let m2comp = strata > 2 && strata < 5 ? 4 : 6;
            const _CHECK = _GET_STEP_TYPE('s36_useduty', 'check');
            const recipeId = getJSONFull(currentItem.expedition ? currentItem.expedition.taxes : false);
            let _CONDTIIONS = [
                { name: 'Estrato', n: 'Mas de 2', p: strata ?? '', e: strata > 2 },
                { name: 'Tratamiento', n: 'TRA o TC', p: tra, e: tra.includes('TRA') || tra.includes('TC') },
                { name: 'Unidad de viviendas', n: 'Mas de 2', p: value35[2] ?? '', e: value35[2] > 2 },
                { name: 'Área de otro uso', n: 'Mas de 0', p: value35[0] ?? '', e: value35[0] > 0 },
                { name: 'Área Total construida', n: 'Mas de 0', p: totalBuild ?? '', e: totalBuild > 0 },
                { name: 'Institucional Público', n: 'No', p: 'Profesional debe revisar', },
            ]
            return <>
                <div className='row border text-center border-dark'>
                    <div className='col-3 fw-bold'>
                        <label>Condiciones</label>
                    </div>
                    <div className='col fw-bold'>
                        <label>Norma</label>
                    </div>
                    <div className='col fw-bold'>
                        <label>Proyecto</label>
                    </div>
                    <div className='col fw-bold'>
                        <label>Evaluación</label>
                    </div>
                </div>
                {_CONDTIIONS.map(con => {
                    return <div className='row border text-center'>
                        <div className='col-3'>
                            <label>{con.name}</label>
                        </div>
                        <div className='col'>
                            <label>{con.n}</label>
                        </div>
                        <div className='col'>
                            <label>{con.p}</label>
                        </div>
                        <div className='col'>
                            <label>{con.e && con.e != undefined ? <i class="fas fa-check text-success"></i> : <i class="fas fa-times text-danger"></i>}</label>
                        </div>
                    </div>
                })}




                <div className='row py-3 border' style={{ backgroundColor: 'gainsboro' }}>
                    <div className='col text-center fw-bold'>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" id="s36_useduty_check" defaultChecked={_CHECK == 1 ? true : false} onChange={() => save_ra_36()} />
                            <label class="form-check-label">USAR DEBERES URBANÍSTICOS</label>
                        </div>
                    </div>
                </div>
                {_CHECK[0] == 1 ?
                    <>
                        <div className='row border'>
                            <div className='col text-end fw-bold'>Consecutivo:</div>
                            <div className='col'>{currentItem.expedition ? (currentItem.expedition.cub2 ?? '') : ''}</div>
                            <div className='col text-center fw-bold'>Valor Liquidado:</div>
                            <div className='col'>${Math.round(Number(m2comp * value35[2] * json34.zugm) + Number(0.06 * value35[0] * json34.zugm))}</div>
                            <div className='col text-center fw-bold'>Nr Recibo:</div>
                            <div className='col'>{recipeId ? recipeId.id_payment_3 || '' : ''}</div>
                            <div className='col text-center fw-bold'>Cancelado</div>
                            <div className='col'>{dutyClock}</div>
                        </div>
                        <div className='row border mt-2'>
                            <div className='col text-center fw-bold'>Uso</div>
                            <div className='col text-center fw-bold'>Trata.</div>
                            <div className='col text-center fw-bold'>ZGU</div>
                            <div className='col text-center fw-bold'>Gen.</div>
                            <div className='col text-center fw-bold'>Cant.</div>
                            <div className='col text-center fw-bold'>m2*Cant.</div>
                            <div className='col text-center fw-bold'>m2*Comp.</div>
                            <div className='col text-center fw-bold'>Valor Comp.</div>
                        </div>
                        {Math.round(m2comp * value35[2] * json34.zugm) > 0 ?
                            <div className='row border'>
                                <div className='col text-center'>Diferente a vivienda</div>
                                <div className='col text-center'>{tra}</div>
                                <div className='col text-center'>{json34.zgu} / ${json34.zugm}</div>
                                <div className='col text-center'>Unidad</div>
                                <div className='col text-center'>{value35[2]}</div>
                                <div className='col text-center'>{m2comp}</div>
                                <div className='col text-center'>{m2comp * value35[2]} m2</div>
                                <div className='col text-center'>${Math.round(m2comp * value35[2] * json34.zugm)}</div>
                            </div>
                            : ''}
                        {(0.06 * value35[0] * json34.zugm).toFixed(0) > 0 ?
                            <div className='row border'>
                                <div className='col text-center'>Comercio</div>
                                <div className='col text-center'>{tra}</div>
                                <div className='col text-center'>{json34.zgu} / ${json34.zugm}</div>
                                <div className='col text-center'>m2</div>
                                <div className='col text-center'>{value35[0]}</div>
                                <div className='col text-center'>{0.06}</div>
                                <div className='col text-center'>{(0.06 * value35[0]).toFixed(2)} m2</div>
                                <div className='col text-center'>${(0.06 * value35[0] * json34.zugm).toFixed(0)}</div>
                            </div>
                            : ''}

                        <div className='row border'>
                            <div className='col text-center'></div>
                            <div className='col text-center'></div>
                            <div className='col text-center'></div>
                            <div className='col text-center'></div>
                            <div className='col text-center'></div>
                            <div className='col text-center fw-bold'>TOTAL: </div>
                            <div className='col text-center fw-bold'>{(Number(0.06 * value35[0]) + Number(m2comp * value35[2])).toFixed(2)} m2</div>
                            <div className='col text-center fw-bold'>${Math.round(Number(m2comp * value35[2] * json34.zugm) + Number(0.06 * value35[0] * json34.zugm))}</div>
                        </div>
                    </>
                    : ''}

            </>
        }


        // FUNCTIONS AND WORKING ENGINES
        var formData = new FormData();

        let save_ra_36 = (e) => {
            if (e) e.preventDefault();

            let checks = [];
            let values = [];

            formData = new FormData();

            var checks_html = document.getElementsByName('s_36_checks');
            for (var i = 0; i < checks_html.length; i++) {
                checks.push(checks_html[i].value)
            }
            formData.set('check', checks.join(';'));

            var values_html = document.getElementsByName('s_36_values');
            for (var i = 0; i < values_html.length; i++) {
                values.push(values_html[i].value.replaceAll(';', ','))
            }
            formData.set('value', values.join(';'));

            formData.set('version', currentVersionR);
            formData.set('recordArcId', currentRecord.id);
            formData.set('id_public', 's36');

            save_step('s36', false, formData);

            checks = [];


            formData = new FormData();


            formData.set('check', document.getElementById('s36_useduty_check').checked ? 1 : 0);

            formData.set('version', currentVersionR);
            formData.set('recordArcId', currentRecord.id);
            formData.set('id_public', 's36_useduty');

            save_step('s36_useduty', false, formData);

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
            <div className="record_arc_32 container">
                <div className="row">
                    <h3 className="py-3" >3.6.1 Elementos del perfil vial incluido antejardín y retroceso frontal</h3>
                    <h6 className='text-muted'>Nota del elemento de perfil vial:
                        <ul>
                            <li>F.A: Franja de amoblamiento</li>
                            <li>F.C: Franja de Circulación</li>
                            <li>F.R: Franja de retiro</li>
                        </ul>
                    </h6>
                    <RECORD_ARC_36_TABLE
                        translation={translation} swaMsg={swaMsg} globals={globals}
                        currentItem={currentItem}
                        currentVersion={currentVersion}
                        currentRecord={currentRecord}
                        currentVersionR={currentVersionR}
                        requestUpdateRecord={() => this.props.requestUpdateRecord(currentItem.id)}
                    />

                    <h3 className="py-3" >3.6.2 Evaluación de Perfiles (Vías peatonales y andenes. Art 164 a 169)</h3>
                    {_COMPONENT_2()}

                    <h3 className="py-3" >3.6.3 Deberes Urbanísticos</h3>
                    {_COMPONENT_DUTIES()}

                    <h3 className="py-3" >3.6.4 Observaciones: Espacio Publico</h3>
                    {_COMPONENT_CORRECTIONS()}
                </div>
            </div >
        );
    }
}

export default RECORD_ARC_36;