import Icon from '@/components/icon';
import { Button } from '@/components/ui/button';
import VIZUALIZER from '../../../../components/vizualizer.component';
import CodesJson from '../../../../components/jsons/fun6DocsList.json';
import RECORD_ENG_SERVICE from '../../../../services/record_eng.service';
import { swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';
function RECORD_ENG_DOCS_CHECK(props) {
        const { translation, swaMsg, globals, _FUN_6, currentItem, currentVersion, currentRecord, currentVersionR, _DOCS, requestUpdateRecord } = props;

        let _GET_CHILD_6 = () => {
            var _CHILD = _FUN_6;
            return Array.isArray(_CHILD) ? _CHILD : [];
        }
        let _GET_CHILD_REVIEW_GEN = () => {
            var _CHILD = currentRecord.review_check;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD.split(';');
            }
            return _LIST;
        }
        let LOAD_STEP = (_id_public) => {
            var _CHILD = Array.isArray(currentRecord.record_eng_steps) ? currentRecord.record_eng_steps : [];
            for (var i = 0; i < _CHILD.length; i++) {
                if (_CHILD[i].version == currentVersionR && _CHILD[i].id_public == _id_public) return _CHILD[i]
            }
            return []
        }
        //  DATA CONVERTES
        let _GET_DOCS_BTNS = (_item) => {
            if (!_item) return "";
            var _array = _item.split(',');
            var _COMPONENT = [];

            _COMPONENT.push(<>{_array[0] > 0
                ?
                <span title="CEDULA DE CIUDADANIA"><VIZUALIZER url={_FIND_6(_array[0]).path + "/" + _FIND_6(_array[0]).filename} apipath={'/files/'}
                        icon={'far fa-id-card fa-2x me-1'} color={'DeepSkyBlue'} /></span>
                : ""}</>)

            _COMPONENT.push(<>{_array[1] > 0
                ?
                <span title="MATRICULA"><VIZUALIZER url={_FIND_6(_array[1]).path + "/" + _FIND_6(_array[1]).filename} apipath={'/files/'}
                        icon={'far fa-id-badge fa-2x me-1'} color={'DarkOrchid'} /></span>
                : ""}</>)

            _COMPONENT.push(<>{_array[2] > 0
                ?
                <span title="FICHA COPNIA"><VIZUALIZER url={_FIND_6(_array[2]).path + "/" + _FIND_6(_array[2]).filename} apipath={'/files/'}
                        icon={'fas fa-book fa-2x me-1'} color={'GoldenRod'} /></span>
                : ""}</>)

            _COMPONENT.push(<>{_array[2] > 0
                ? <span title="HOJA DE VIDA Y CERTIFICADOS"><VIZUALIZER url={_FIND_6(_array[3]).path + "/" + _FIND_6(_array[3]).filename} apipath={'/files/'}
                        icon={'fas fa-file-invoice fa-2x me-1'} color={'LimeGreen'} /></span>
                : ""}</>)

            return <>{_COMPONENT}</>
        }
        let _FIND_6 = (_ID) => {
            let _LIST = _GET_CHILD_6();
            let _CHILD = [];
            for (var i = 0; i < _LIST.length; i++) {
                if (_LIST[i].id == _ID) {
                    return _LIST[i];
                }
            }
            return _CHILD;
        }
        let _FIND_6_BY_CODE = (_CODE) => {
            let _LIST = _GET_CHILD_6();
            let _CHILD = [];
            for (var i = 0; i < _LIST.length; i++) {
                if (_LIST[i].id_public == _CODE) {
                    _CHILD.push(_LIST[i]);
                }
            }
            return _CHILD;
        }
        let _GET_STEP_TYPE_INDEX = (_id_public, _type, _index) => {
            var STEP = LOAD_STEP(_id_public);
            if (!STEP.id) return null;
            var value = STEP[_type]
            value = value.split(';');
            return value[_index]
        }
        // COMPONENT JSX
        let COMPONENT_DOCS_CHECK = (_codes) => {
            let _COMPONENT = [];

            for (var i = 0; i < _codes.length; i++) {
                let _DOCS = _FIND_6_BY_CODE(_codes[i]);
                if (_DOCS.length > 0) {
                    return _DOCS.map((object, index) =>{
                        return <>
                        <li className="list-group-item">
                            <div className="row">
                                <div className="col">
                                    <label><span className="badge bg-success">ANEXADO</span> {object.description} </label>
                                </div>
                                <div className="col-1">
                                    <VIZUALIZER url={object.path + "/" + object.filename} apipath={'/files/'} />
                                </div>
                                <div className="col">
                                    <input type="text" className="form-control" name="sdocs" placeholder="Observaciónes"
                                        defaultValue={_GET_STEP_TYPE_INDEX('sdocs', 'value', index) ?? ''} />
                                </div>
                            </div>
                        </li>
                    </>
                    })
                } else {
                    _COMPONENT.push(<>
                        <li className="list-group-item">
                            <span className="badge bg-danger">SIN ANEXAR</span> {CodesJson[_codes[i]]}
                        </li>
                    </>)
                }

            }
            return <>{_COMPONENT}</>
        }
        // FUNCTIONS AND APIS
        let manage_step_docs = (e) => {
            e.preventDefault();
            var formData = new FormData();

            let values = [];
            formData = new FormData();
            values = [];
            var checks_2 = document.getElementsByName('sdocs');
            for (var i = 0; i < checks_2.length; i++) {
                values.push(checks_2[i].value)
            }
            formData.set('value', values.join(';'));

            formData.set('version', currentVersionR);
            formData.set('recordEngId', currentRecord.id);
            formData.set('id_public', 'sdocs');
            save_step('sdocs', true, formData);

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
            <div className="record_ph_profesional_evaluation container">
                <form id="form_manage_ph_gen" onSubmit={manage_step_docs}>
                    <li className="list-group-item"><label className="fw-bold">DOCUMENTOS ANEXOS</label></li>
                    {COMPONENT_DOCS_CHECK(_DOCS)}
                    <div className="row mb-3 text-center">
                        <div className="col-12">
                            <Button size="sm" className="my-3"><Icon name="edit" size={16} /> GUARDAR CAMBIOS </Button>
                        </div>
                    </div>
                </form>
            </div >
        );
}

export default RECORD_ENG_DOCS_CHECK;