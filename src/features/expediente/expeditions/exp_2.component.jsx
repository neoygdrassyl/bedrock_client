import { DateInput } from '@/shared/components/DateInput';
import { parseLegacyJson } from '@/shared/utils/parseLegacyJson';
import { useState } from 'react';
import EXPEDITION_SERVICE from '../api/expedition.service';
import RECORD_ARCSERVICE from '../api/record_arc.service';
import PQRS_Service from '../../pqrs/api/pqrs_main.service';
import JSONObjectParser from '../../../shared/config/jsons/jsonReplacer';
import { axis, infoCud, zones } from '../../../shared/config/jsons/vars'
import { getJSONFull, regexChecker_isOA_2, _MANAGE_IDS } from '../../../shared/config/customClasses/typeParse';
import EXP_CALC from './exp_calc.component';
import { Icon } from '@/shared/components/icon';
import { swalError, swalLoading, swalSuccess } from '@/shared/utils/swalAdapter';
import { isEmptyEntity } from '../../../shared/utils/isEmptyEntity';
import { SectionCard, SectionSubheading } from '@/shared/components/SectionCard';

const _GLOBAL_ID = import.meta.env.VITE_GLOBAL_ID;
function EXP_2({ translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, requestUpdateRecord, requestUpdate, step }) {
    const [pym, setPym] = useState(undefined);
    // The architecture control step can only be stored against an existing architecture record.
    const hasArcRecord = !isEmptyEntity(currentItem.record_arc) && Boolean(currentItem.record_arc?.id);

        // DATA GETTERS
        let _GET_EXPEDITION_JSON = (field) => {
            let json = currentRecord[field];
            if (!json) return {}
            let object = parseLegacyJson(json, {}, `exp_2:expedition.${field}`)
            return object
        }
        let _GET_LAST_ID = (_id) => {
            let new_id = "";
            PQRS_Service.getlascub()
                .then(response => {
                    new_id = response.data[0].cub;
                    new_id = _MANAGE_IDS(new_id, 'end')
                    document.getElementById(_id).value = new_id;
                })
                .catch(e => {
                    console.log(e);
                    swalError({ title: "ERROR AL CARGAR", text: "No ha sido posible cargar el consecutivo, intentelo nuevamnte." });
                });

        }
        let _GET_CHILD_1 = () => {
            var _CHILD = currentItem.fun_1s;
            var _CURRENT_VERSION = currentVersion - 1;
            var _CHILD_VARS = {
                item_0: "",
                description: "",
            }
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD_VARS.item_0 = _CHILD[_CURRENT_VERSION].id;
                    _CHILD_VARS.tramite = _CHILD[_CURRENT_VERSION].tramite;
                    _CHILD_VARS.description = _CHILD[_CURRENT_VERSION].description ? _CHILD[_CURRENT_VERSION].description : "";
                }
            }
            return _CHILD_VARS;
        }
        let LOAD_STEP = (_id_public) => {
            var _CHILD = currentItem.record_arc_steps;
            var VERSIONR = currentItem.record_arc ? currentItem.record_arc.version : 0;
            for (var i = 0; i < _CHILD.length; i++) {
                if (_CHILD[i].version == VERSIONR && _CHILD[i].id_public == _id_public) return _CHILD[i]
            }
            return []
        }
        let _GET_STEP_TYPE = (_id_public, _type) => {
            var STEP = LOAD_STEP(_id_public);
            if (!STEP.id) return [];
            var value = STEP[_type] ? STEP[_type] : []
            if (!value) return [];
            value = value.split(';');
            return value
        }
        let _GET_STEP_TYPE_JSON = (_id_public) => {
            var STEP = LOAD_STEP(_id_public);
            if (!STEP.id) return {};
            var value = STEP['json']
            if (!value) return {};
            value = parseLegacyJson(value, {}, `exp_2:step.${_id_public}.json`);
            return value
        }
        let conOA = () => regexChecker_isOA_2(currentItem ? _GET_CHILD_1() : false)
        let _GET_CHILD_35_PARKING = () => {
            let arc = currentItem.record_arc ? currentItem.record_arc : false;
            let _CHILD = arc ? arc.record_arc_35_parkings : [];
            let _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        // DATA CONVERTERS
        let _SAVING_STATE = (state) => {
            if (!state) return <span className="ew-status-chip">Guardado automático</span>;
            if (state == 1) return <span className="ew-status-chip ew-status-chip--warning" role="status"><Icon name="save" size={12} /> Guardando…</span>;
            if (state == 2) return <span className="ew-status-chip ew-status-chip--success" role="status"><Icon name="save" size={12} /> Guardado</span>;
            if (state == 3) return <span className="ew-status-chip ew-status-chip--danger" role="status"><Icon name="save" size={12} /> No se pudo guardar</span>;
        }
        // COMPONENT JSX
        let _COMPONENT_GENERAL = () => {
            let json = currentRecord.control;
            let control = getJSONFull(json);

            const jsonArc = _GET_STEP_TYPE_JSON('arc_control');
            const controlArc = getJSONFull(jsonArc);

            //Default Values brought by others parts of the code

            const json34 = _GET_STEP_TYPE_JSON('s34');

            let m2 = json34.m2;
            let mainuse = json34.mainuse;
            let parkings = _GET_CHILD_35_PARKING().reduce((sum, next) => sum += next.project || 0, 0);
            return <>
                <div>
                    <SectionSubheading className="ew-subheading--first">Planeación</SectionSubheading>
                    <div className="ew-form-grid">
                        <div>
                            <label className="mt-1">N.° de folios de la licencia</label>
                            <input type="number" className="form-control" id="exp_2_1" min="0" step="1"
                                defaultValue={control.n_lic} onBlur={() => save_exp()} />
                        </div>
                        <div>
                            <label className="mt-1">N.° de folios de la resolución</label>
                            <input type="number" className="form-control" id="exp_2_2" min="0" step="1"
                                defaultValue={control.n_res} onBlur={() => save_exp()} />
                        </div>
                        <div>
                            <label className="mt-1">Norma</label>
                            <input type="text" className="form-control" id="exp_2_3"
                                defaultValue={control.norm} onBlur={() => save_exp()} />
                        </div>
                        <div>
                            <label className="mt-1">Fecha de la norma</label>
                            <DateInput className="form-control" id="exp_2_4" max={'2100-12-31'}
                                defaultValue={control.date_norm} onBlur={() => save_exp()} />
                        </div>
                    </div>
                    <div className="ew-form-grid">
                        <div>
                            <label className="mt-1">N.° de folios de la norma</label>
                            <input type="text" className="form-control" id="exp_2_5" min="0" step="1"
                                defaultValue={control.n_norm} onBlur={() => save_exp()} />
                        </div>

                        <div>
                            <label className="mt-1">Área del predio (m²)</label>
                            <input type="text" className="form-control" id="ra_control_data_1"
                                defaultValue={control.area_predio} onBlur={() => manage_ra_33_control('pym')} />
                        </div>
                        <div>
                            <label className="mt-1">Uso principal</label>
                            <input type="text" className="form-control" id="ra_control_data_2"
                                defaultValue={control.uso_principal} onBlur={() =>manage_ra_33_control('pym')} />
                        </div>

                        <div>
                            <label className="mt-1">Número de subdivisión</label>
                            <input type="number" className="form-control" id="ra_control_data_3"
                                defaultValue={controlArc.n_sub} onBlur={() => manage_ra_33_control('pym')} />
                        </div>
                    </div>
                    <div className="ew-form-grid">
                        <div>
                            <label className="mt-1">N.° de parqueaderos (totales)</label>
                            <input type="number" className="form-control" id="ra_control_data_0" min="0" step="1"
                                defaultValue={jsonArc.n_parking} onBlur={() => manage_ra_33_control('pym')} />
                        </div>
                        <div>
                            <label className="mt-1">N.° de parqueaderos (privados)</label>
                            <input type="number" className="form-control" id="ra_control_data_0_1" min="0" step="1"
                                defaultValue={jsonArc.n_parking_private} onBlur={() => manage_ra_33_control('pym')} />
                        </div>
                        <div>
                            <label className="mt-1">N.° de parqueaderos (visitantes)</label>
                            <input type="number" className="form-control" id="ra_control_data_0_2" min="0" step="1"
                                defaultValue={jsonArc.n_parking_visit} onBlur={() => manage_ra_33_control('pym')} />
                        </div>


                    </div>
                </div>
            </>
        }

        let _COMPONENT_CONTROL = () => {
            const json = _GET_STEP_TYPE_JSON('arc_control');
            const control = getJSONFull(json);

            //Default Values brought by others parts of the code
            return <>
                <div className="ew-form-grid ew-form-grid--pairs ew-form-grid--groups">


                    <div>
                        <SectionSubheading>Ministerio de vivienda</SectionSubheading>
                        <div className="ew-inline-field">
                            <label>Área bruta (m²)</label>
                            <div>
                                <input type="number" className="form-control" id="ra_control_data_4" min="0" step="0.01"
                                    defaultValue={control.m2_brute} onBlur={() => manage_ra_33_control('pym')} />
                            </div>
                        </div>

                        <div className="ew-inline-field">
                            <label>Área neta (m²)</label>
                            <div>
                                <input type="number" className="form-control" id="ra_control_data_5" min="0" step="0.01"
                                    defaultValue={control.m2_net} onBlur={() => manage_ra_33_control('pym')} />
                            </div>
                        </div>

                        <div className="ew-inline-field">
                            <label>Área útil (m²)</label>
                            <div>
                                <input type="number" className="form-control" id="ra_control_data_6" min="0" step="0.01"
                                    defaultValue={control.m2_useful} onBlur={() => manage_ra_33_control('pym')} />
                            </div>
                        </div>

                    </div>
                    <div>
                        <SectionSubheading>Ministerio de vivienda, Modalidad Urbanización</SectionSubheading>
                        <div className="ew-inline-field">
                            <label>Área útil VIS</label>
                            <div>
                                <input type="number" className="form-control" id="ra_control_data_7" min="0" step="0.01"
                                    defaultValue={control.m2_vis} onBlur={() => manage_ra_33_control('pym')} />
                            </div>
                        </div>

                        <div className="ew-inline-field">
                            <label>Área útil VIP</label>
                            <div>
                                <input type="number" className="form-control" id="ra_control_data_8" min="0" step="0.01"
                                    defaultValue={control.m2_vip} onBlur={() => manage_ra_33_control('pym')} />
                            </div>
                        </div>

                        <div className="ew-inline-field">
                            <label>Área útil no VIS</label>
                            <div>
                                <input type="number" className="form-control" id="ra_control_data_9" min="0" step="0.01"
                                    defaultValue={control.m2_novis} onBlur={() => manage_ra_33_control('pym')} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <SectionSubheading>Ministerio de vivienda, Modalidad Urbanización y Parcelación</SectionSubheading>
                        <div className="ew-inline-field">
                            <label>Área útil industrial</label>
                            <div>
                                <input type="number" className="form-control" id="ra_control_data_10" min="0" step="0.01"
                                    defaultValue={control.m2_ind} onBlur={() => manage_ra_33_control('pym')} />
                            </div>
                        </div>

                        <div className="ew-inline-field">
                            <label>Área útil com./serv.</label>
                            <div>
                                <input type="number" className="form-control" id="ra_control_data_11" min="0" step="0.01"
                                    defaultValue={control.m2_com} onBlur={() => manage_ra_33_control('pym')} />
                            </div>
                        </div>

                        <div className="ew-inline-field">
                            <label>Área útil dotacional</label>
                            <div>
                                <input type="number" className="form-control" id="ra_control_data_12" min="0" step="0.01"
                                    defaultValue={control.m2_dot} onBlur={() => manage_ra_33_control('pym')} />
                            </div>
                        </div>

                    </div>
                </div>
            </>
        }

        var formData = new FormData();

        let save_exp = (e) => {
            formData = new FormData();

            let control = {};

            let json = currentRecord.control;
            control = getJSONFull(json);

            control.n_lic = document.getElementById('exp_2_1').value;
            control.n_res = document.getElementById('exp_2_2').value;
            control.norm = document.getElementById('exp_2_3').value;
            control.date_norm = document.getElementById('exp_2_4').value;
            control.n_norm = document.getElementById('exp_2_5').value;

            formData.set('control', JSONObjectParser(control));

            setPym(1);
            manage_exp(false);
        }

        let manage_ra_33_control = (state) => {
            formData = new FormData();

            const json = _GET_STEP_TYPE_JSON('arc_control');
            const control = getJSONFull(json);

            control.n_parking = document.getElementById('ra_control_data_0').value;
            control.n_parking_private = document.getElementById('ra_control_data_0_1').value;
            control.n_parking_visit = document.getElementById('ra_control_data_0_2').value;
            control.m2_predio = document.getElementById('ra_control_data_1').value;
            control.main_use = document.getElementById('ra_control_data_2').value;
            control.n_sub = document.getElementById('ra_control_data_3').value;
            control.m2_brute = document.getElementById('ra_control_data_4').value;
            control.m2_net = document.getElementById('ra_control_data_5').value;
            control.m2_useful = document.getElementById('ra_control_data_6').value;
            control.m2_vis = document.getElementById('ra_control_data_7').value;
            control.m2_vip = document.getElementById('ra_control_data_8').value;
            control.m2_novis = document.getElementById('ra_control_data_9').value;
            control.m2_ind = document.getElementById('ra_control_data_10').value;
            control.m2_com = document.getElementById('ra_control_data_11').value;
            control.m2_dot = document.getElementById('ra_control_data_12').value;

            formData.set('json', JSONObjectParser(control));

            formData.set('version', 1);
            formData.set('recordArcId', currentItem.record_arc.id);
            formData.set('id_public', 'arc_control');

            save_step('arc_control', false, formData, state);


        }

        let save_step = (_id_public, useSwal, formData, state) => {
            if (state) setPym(1)
            var STEP = LOAD_STEP(_id_public);

            if (useSwal) swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            if (STEP.id) {
                RECORD_ARCSERVICE.update_step(STEP.id, formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            if (useSwal) swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                            requestUpdateRecord(currentItem.id);
                            if (state) setPym(2)
                        } else {
                            if (useSwal) swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                            if (state) setPym(3)
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        if (useSwal) swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                        if (state) setPym(3)
                    });
            }
            else {
                RECORD_ARCSERVICE.create_step(formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            if (useSwal) swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                            requestUpdateRecord(currentItem.id);
                            if (state) setPym(2)
                        } else {
                            if (useSwal) swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                            if (state) setPym(3)
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        if (useSwal) swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                        if (state) setPym(3)
                    });
            }
        }

        let manage_exp = (useMySwal) => {
            if (useMySwal) swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            EXPEDITION_SERVICE.update(currentRecord.id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        if (useMySwal) swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                        setPym(2);

                        requestUpdateRecord(currentItem.id);
                        requestUpdate(currentItem.id);
                    } else if (response.data === 'ERROR_DUPLICATE') {
                        setPym(3);
                        if (useMySwal) swalError({ title: "ERROR DE DUPLICACION", text: "El consecutivo CUB de este formulario ya existe, debe de elegir un consecutivo nuevo" });
                    }
                    else {
                        setPym(3);
                        if (useMySwal) swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                    }
                })
                .catch(e => {
                    console.log(e);
                    setPym(3);
                    if (useMySwal) swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                });
        }
        return (
            <SectionCard
                id="nav_expedition_control"
                className="record_ph_gen"
                title={`${step ? `${step}. ` : ''}Control para entidades supervisoras`}
                meta={hasArcRecord ? _SAVING_STATE(pym) : <span className="ew-status-chip ew-status-chip--warning">Requiere informe de arquitectura</span>}
            >
                {hasArcRecord ? <>
                    <p className="ew-toolbar__meta mb-3">Cada campo se guarda al salir de él.</p>
                    {_COMPONENT_GENERAL()}

                    {_COMPONENT_CONTROL()}
                </> :
                    <p className="ew-notice ew-notice--warning m-0" role="status">Se debe crear primero el informe de arquitectura.</p>}

            </SectionCard>
        );
}

export default EXP_2;