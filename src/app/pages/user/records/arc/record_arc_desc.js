import { useCallback, useState, useEffect } from 'react';
import DataTable from '@/components/data-table-bridge';

import FUN_SERVICE from '../../../../services/fun.service'
import RECORD_ARCSERVICE from '../../../../services/record_arc.service';
import VIZUALIZER from '../../../../components/vizualizer.component';
import RECORD_ARC_AREAS from './record_arc_areas.component';
import EXP_AREAS_RECORD from '../exp_areas_record.component';
import { Icon } from '@/components/icon';
import { swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';
import RichTextEditor from '@/components/rich-text-editor';
import { uploadRecordArcRichTextImage } from './recordArcRichTextUpload';

function RECORD_ARC_DESC({ translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, _FUN_R, requestUpdateRecord, requestUpdate }) {
    const [editBlueprint, setEditBlueprint] = useState(false);
    const [saveState, setSaveState] = useState({});
    const uploadRichTextImage = useCallback((file) => uploadRecordArcRichTextImage(file, currentItem), [currentItem]);

    useEffect(() => {
        if (editBlueprint) {
            var _ITEM = editBlueprint;
            document.getElementById("r_a_33_blueprint_1_edit").value = _ITEM.id_public;
            document.getElementById("r_a_33_blueprint_2_edit").value = _ITEM.use;
            document.getElementById("r_a_33_blueprint_3_edit").value = _ITEM.scale;
            document.getElementById("r_a_33_blueprint_4_edit").value = _ITEM.category
            document.getElementById("r_a_33_blueprint_5_edit").value = _ITEM.id6_blueprint ? _ITEM.id6_blueprint : 0;
        }
    }, [editBlueprint]);
        // DATA GETERS
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
                    _CHILD_VARS.description = _CHILD[_CURRENT_VERSION].description ? _CHILD[_CURRENT_VERSION].description : "";
                }
            }
            return _CHILD_VARS;
        }
        let LOAD_STEP = (_id_public) => {
            var _CHILD = Array.isArray(currentRecord.record_arc_steps) ? currentRecord.record_arc_steps : [];
            for (var i = 0; i < _CHILD.length; i++) {
                if (_CHILD[i].version == currentVersionR && _CHILD[i].id_public == _id_public) return _CHILD[i]
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
        // COMPONENTS JSX 
        let _SAVING_STATE = (state) => {
            if(!state) return '';
            if(state == 1) return <label className='text-warning fw-bold'><Icon name="save" size={16} /></label>;
            if(state == 2) return <label className='text-success fw-bold'><Icon name="save" size={16} /></label>;
            if(state == 3) return <label className='text-danger fw-bold'><Icon name="save" size={16} /></label>;
        }


        let _COMPONENT_1 = () => {
            let values = _GET_STEP_TYPE('s33', 'value');
            return <>
                <div className="row">
                    <div className='row  border border-dark bg-primary text-primary-foreground fwb-bold py-1 mx-0 mt-3'>
                        <div className='col'>
                            <label>Antecedentes del proyecto</label>
                        </div>
                    </div>

                    <RichTextEditor
                        value={values[0]}
                        hiddenName="s_33_values"
                        maxLength={8000}
                        minHeight={180}
                        placeholder="Registre antecedentes, notas de evaluación e imágenes de soporte"
                        uploadFile={uploadRichTextImage}
                        onBlur={() => {setSaveState(prev => ({...prev, ant: '1'})); manage_ra_33(false, 'ant')}}
                    />
                    <label>{_SAVING_STATE(saveState.ant)}</label>
                </div>

                <div className="row">
                    <div className='row  border border-dark bg-primary text-primary-foreground fwb-bold py-1 mx-0 mt-3'>
                        <div className='col'>
                            <label>Descripción del proyecto radicado</label>
                        </div>
                    </div>
                    <textarea className="input-group" rows="4" disabled value={_GET_CHILD_1().description} style={{ backgroundColor: 'gainsboro' }}></textarea>
                </div>

                <div className="row">
                    <div className='row  border border-dark bg-primary text-primary-foreground fwb-bold py-1 mx-0 mt-3'>
                        <div className='col'>
                            <label>Descripción del proyecto Arquitectónica</label>
                        </div>
                    </div>
                    <RichTextEditor
                        value={values[1]}
                        hiddenName="s_33_values"
                        maxLength={8000}
                        minHeight={180}
                        placeholder="Describa la evaluación arquitectónica del proyecto"
                        uploadFile={uploadRichTextImage}
                        onBlur={() => {setSaveState(prev => ({...prev, desc: '1'})); manage_ra_33(false, 'desc')}}
                    />
                    <label>{_SAVING_STATE(saveState.desc)}</label>
                </div>
            </>
        }



        // FUNCTIONS AND WORKING ENGINES
        var formData = new FormData();
        let manage_ra_33 = (useSwal, state) => {

            let checks = [];
            let values = [];

            formData = new FormData();

            var checks_html = document.getElementsByName('s_33_checks');
            for (var i = 0; i < checks_html.length; i++) {
                let value = document.getElementById('s_33_checks_' + i).value
                checks.push(value)
            }
            formData.set('check', checks.join(';'));

            var values_html = document.getElementsByName('s_33_values');
            for (var i = 0; i < values_html.length; i++) {
                values.push(values_html[i].value.replaceAll(';', ','))
            }
            
            formData.set('value', values.join(';'));

            formData.set('version', currentVersionR);
            formData.set('recordArcId', currentRecord.id);
            formData.set('id_public', 's33');

            save_step('s33', useSwal, formData, state);

            formData = new FormData();
            checks = [];
            values = [];

        }
        let save_step = (_id_public, useSwal, formData, state) => {
            setSaveState(prev => ({...prev, [state]: 1}))
            var STEP = LOAD_STEP(_id_public);

            if (useSwal) swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            if (STEP.id) {
                RECORD_ARCSERVICE.update_step(STEP.id, formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            if (useSwal) swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                            requestUpdateRecord(currentItem.id);
                            setSaveState(prev => ({...prev, [state]: 2}))
                        } else {
                            if (useSwal) swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                            setSaveState(prev => ({...prev, [state]: 3}))
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        if (useSwal) swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                        setSaveState(prev => ({...prev, [state]: 3}))
                    });
            }
            else {
                RECORD_ARCSERVICE.create_step(formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            if (useSwal) swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                            requestUpdateRecord(currentItem.id);
                            setSaveState(prev => ({...prev, [state]: 2}))
                        } else {
                            if (useSwal) swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                            setSaveState(prev => ({...prev, [state]: 3}))
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        if (useSwal) swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                        setSaveState(prev => ({...prev, [state]: 3}))
                    });
            }
        }

        return (
                <div className="row">
                    {_COMPONENT_1()}
                </div>
        );
}

export default RECORD_ARC_DESC;