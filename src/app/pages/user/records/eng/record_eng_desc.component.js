import { formsParser1, _GET_SERIE_COD, _GET_SUBSERIE_COD, _GET_SERIE_STR, _GET_SUBSERIE_STR } from '../../../../components/customClasses/typeParse';
import RECORD_ENG_SERVICE from '../../../../services/record_eng.service'
import { swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';
import RichTextEditor from '@/components/rich-text-editor';
import { richTextToPlainText } from '@/app/utils/richTextBlockNote';
import ObservationPanel from '../../../../components/ObservationPanel';


function RECORD_ENG_DESC(props) {
        const { swaMsg, currentItem, currentVersion, currentRecord, currentVersionR, category, arcSteps, requestUpdateRecord } = props;

        const splitLegacyStepValue = (value) => {
            if (value == null || value === '') return [];
            if (Array.isArray(value)) return value;
            if (typeof value === 'string') return value.split(';');
            return [];
        }

        // DATA GETTERS
        let _GET_CHILD_1 = () => {
            var _CHILD = currentItem.fun_1s;
            var _CURRENT_VERSION = currentVersion - 1;
            if (!_CHILD[_CURRENT_VERSION]) return {}
            var _CHILD_VARS = {
                item_0: _CHILD[_CURRENT_VERSION].id ?? false,
                item_1: _CHILD[_CURRENT_VERSION].tipo ?? "",
                item_2: _CHILD[_CURRENT_VERSION].tramite ?? "",
                item_3: _CHILD[_CURRENT_VERSION].m_urb ?? "",
                item_4: _CHILD[_CURRENT_VERSION].m_sub ?? "",
                item_5: _CHILD[_CURRENT_VERSION].m_lic ?? "",
                item_6: _CHILD[_CURRENT_VERSION].usos ?? "",
                item_7: _CHILD[_CURRENT_VERSION].area ?? "",
                item_8: _CHILD[_CURRENT_VERSION].vivienda ?? "",
                item_9: _CHILD[_CURRENT_VERSION].cultural ?? "",
                item_101: _CHILD[_CURRENT_VERSION].regla_1 ?? "",
                item_102: _CHILD[_CURRENT_VERSION].regla_2 ?? "",
                description: _CHILD[_CURRENT_VERSION].description ?? "",
            }
            return _CHILD_VARS;
        }
        let _GET_CHILD_1_curated = () => {
            var _CHILD = currentItem.fun_1s;
            var _CURRENT_VERSION = currentVersion - 1;
            if (!_CHILD[_CURRENT_VERSION]) return {}
            var _CHILD_VARS = {
                id: _CHILD[_CURRENT_VERSION].id ?? false,
                tipo: _CHILD[_CURRENT_VERSION].tipo ?? "",
                tramite: _CHILD[_CURRENT_VERSION].tramite ?? "",
                m_urb: _CHILD[_CURRENT_VERSION].m_urb ?? "",
                m_sub: _CHILD[_CURRENT_VERSION].m_sub ?? "",
                m_lic: _CHILD[_CURRENT_VERSION].m_lic ?? "",
            }
            return _CHILD_VARS;
        }
        let _GET_REVIEW = () => {
            var _CHILD = Array.isArray(currentRecord.record_eng_reviews) ? currentRecord.record_eng_reviews : [];
            var _CURRENT_VERSION = Number(currentVersionR);
            var _CURRENT_REVIEW = _CHILD.find((review) => Number(review.version) === _CURRENT_VERSION);
            var _CHILD_VARS = {
                id: _CURRENT_REVIEW ? _CURRENT_REVIEW.id : false,
                check: _CURRENT_REVIEW ? _CURRENT_REVIEW.check : "",
                check_2: _CURRENT_REVIEW ? _CURRENT_REVIEW.check_2 : "",
                date: _CURRENT_REVIEW ? _CURRENT_REVIEW.date : "",
                desc: _CURRENT_REVIEW ? _CURRENT_REVIEW.desc : "",
                detail: _CURRENT_REVIEW ? _CURRENT_REVIEW.detail : "",
                detail_2: _CURRENT_REVIEW ? _CURRENT_REVIEW.detail_2 : "",
                worker_id: _CURRENT_REVIEW ? _CURRENT_REVIEW.worker_id : "",
                worker_name: _CURRENT_REVIEW ? _CURRENT_REVIEW.worker_name : "",
                version: _CURRENT_REVIEW ? _CURRENT_REVIEW.version : "",
                detail_3: _CURRENT_REVIEW ? _CURRENT_REVIEW.detail_3 : "",
                detail_4: _CURRENT_REVIEW ? _CURRENT_REVIEW.detail_4 : "",
            }
            return _CHILD_VARS;

        }
        // DATA CONVERTERS
        let LOAD_STEP = (_id_public) => {
            var _CHILD = arcSteps;
            for (var i = 0; i < _CHILD.length; i++) {
                if (_CHILD[i].version == currentVersionR && _CHILD[i].id_public == _id_public) return _CHILD[i]
            }
            return []
        }
        let _GET_STEP_TYPE = (_id_public, _type) => {
            var STEP = LOAD_STEP(_id_public);
            if (!STEP.id) return [];
            return splitLegacyStepValue(STEP[_type]);
        }
        let LOAD_STEP_ENG = (_id_public) => {
            var _CHILD = currentRecord.record_eng_steps;
            for (var i = 0; i < _CHILD.length; i++) {
                if (_CHILD[i].version == currentVersionR && _CHILD[i].id_public == _id_public) return _CHILD[i]
            }
            return []
        }
        let _GET_STEP_TYPE_ENG = (_id_public, _type) => {
            var STEP = LOAD_STEP_ENG(_id_public);
            if (!STEP.id) return [];
            return splitLegacyStepValue(STEP[_type]);
        }
        // COMPONENT JSX
        let COMPONENT_DESC = () => {
            let values = _GET_STEP_TYPE('s33', 'value');
            let values2 = _GET_STEP_TYPE_ENG('s33_exp', 'value');
            let architectureDescription = values[1] ?? "";
            let structuralDescription = richTextToPlainText(_GET_REVIEW().desc || architectureDescription);
            return <>
                <ObservationPanel
                    title="Tipo de Proyecto"
                    collapsible={false}
                    textareaProps={{
                        readOnly: true,
                        value: formsParser1(_GET_CHILD_1_curated()),
                    }}
                />

                <ObservationPanel
                    title="Descripción del Proyecto"
                    collapsible={false}
                    textareaProps={{
                        readOnly: true,
                        value: _GET_CHILD_1().description,
                    }}
                />

                <ObservationPanel title="Antecedentes" collapsible={false}>
                    <RichTextEditor
                        value={values[0] ?? ""}
                        maxLength={8000}
                        minHeight={150}
                        readOnly
                        placeholder="Antecedentes del proyecto"
                    />
                </ObservationPanel>

                <ObservationPanel title="Descripción del proyecto Arquitectónica" collapsible={false}>
                    <RichTextEditor
                        value={architectureDescription}
                        maxLength={8000}
                        minHeight={150}
                        readOnly
                        placeholder="Descripción del proyecto Arquitectónica"
                    />
                </ObservationPanel>

                <ObservationPanel
                    title="Descripción del proyecto estructural"
                    collapsible={false}
                    helperText="(máximo 4000 caracteres)"
                    textareaProps={{
                        id: 'record_eng_desc',
                        maxLength: 4000,
                        defaultValue: structuralDescription,
                        onBlur: () => save_item(),
                    }}
                />

                {category == '2' ?
                    <>
                        <ObservationPanel
                            title="Revisión general (Para Certificaciones)"
                            collapsible={false}
                            helperText="(máximo 4000 caracteres)"
                            textareaProps={{
                                id: 'record_eng_detail_4',
                                maxLength: 4000,
                                defaultValue: _GET_REVIEW().detail_4 ?? "",
                                onBlur: () => save_item(),
                            }}
                        />

                        <div className="row">
                            <div className="col-3">
                                <label className="mt-1">N° Folios Certificación</label>
                                <input type="number" className="form-control" id="record_eng_detail_4_2" min="0" step="1"
                                    defaultValue={values2?.[0] ?? ''} onBlur={() => manage_step()} />
                            </div>
                        </div>
                    </>
                    : ''}
            </>
        }
        let _COMPONENT_SERIES = () => {
            let _CHILD = _GET_CHILD_1();
            let _SERIE = _GET_SERIE_COD(_CHILD);
            let _SUBSERIE = _GET_SUBSERIE_COD(_CHILD);
             let _SERIE_STR = _GET_SERIE_STR(_CHILD)
            let _SUBSERIE_STR = _GET_SUBSERIE_STR(_CHILD);
            return <>
                <div className="row my-2">
                    <div className="col-3">
                        <label className="fw-bold ms-4">Serie Documental:</label>
                    </div>
                    <div className="col-2">
                        <label className='fw-bold'>{_SERIE}</label>
                    </div>
                    <div className="col">
                        <label className='fw-bold'>{_SERIE_STR[0] ?? <label className='text-danger'>No se encuentra Serie</label>}</label>
                    </div>
                </div>

                <div className="row my-2">
                    <div className="col-3">
                        <label className="fw-bold ms-4">Subserie Documental:</label>
                    </div>
                    <div className="col-2">
                        <label className='fw-bold'>{_SUBSERIE}</label>
                    </div>
                    <div className="col">
                        <label className='fw-bold'>{_SUBSERIE_STR[0] ?? <label className='text-danger'>No se encuentra Subserie</label>}</label>
                    </div>
                </div>
            </>
        }

        // FUNCTIONS AND APIS
        var formData = new FormData();

        let save_item = (e) => {
            if (e) e.preventDefault();
            formData = new FormData();
            formData.set('recordEngId', currentRecord.id);
            let desc = document.getElementById('record_eng_desc').value;
            formData.set('desc', desc);

            let detail_4 = document.getElementById('record_eng_detail_4');
            if (detail_4) formData.set('detail_4', detail_4.value);
            manage_item(false);
        }
        let manage_item = (useSwal) => {
            var _CHILD = _GET_REVIEW();
            if (useSwal) swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            if (_CHILD.id) {
                RECORD_ENG_SERVICE.update_review(_CHILD.id, formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            if (useSwal) swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                            requestUpdateRecord(currentItem.id);
                        } else {
                            if (useSwal) swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        if (useSwal) swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                    });
            } else {
                RECORD_ENG_SERVICE.create_review(formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            if (useSwal) swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                            requestUpdateRecord(currentItem.id);
                        } else {
                            if (useSwal) swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        if (useSwal) swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                    });
            }

        }

        let manage_step = () => {
            var formData = new FormData();
            var value = document.getElementById('record_eng_detail_4_2').value;
            formData.set('value', value);

            formData.set('version', currentVersionR);
            formData.set('recordEngId', currentRecord.id);
            formData.set('id_public', 's33_exp');
            save_step('s33_exp', false, formData);

        }
        let save_step = (_id_public, useSwal, formData) => {
            var STEP = LOAD_STEP(_id_public);

            if (useSwal) swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            if (STEP.id) {
                RECORD_ENG_SERVICE.update_step(STEP.id, formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            if (useSwal) swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                            requestUpdateRecord(currentItem.id);
                        } else {
                            if (useSwal) swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        if (useSwal) swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                    });
            }
            else {
                RECORD_ENG_SERVICE.create_step(formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            if (useSwal) swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                            requestUpdateRecord(currentItem.id);
                        } else {
                            if (useSwal) swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        if (useSwal) swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                    });
            }
        }
        return (
            <div className="record_eng_desc container">
                {_COMPONENT_SERIES()}
                {COMPONENT_DESC()}
            </div >
        );
}

export default RECORD_ENG_DESC;
