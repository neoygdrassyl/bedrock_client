import React from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import RECORD_ENG_SERVICE from '../../../../services/record_eng.service';

export default function RECORD_ENG_STEP_430(props) {
    const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR } = props;
    const MySwal = withReactContent(Swal);
    const LIST = [
        { title: 'Memorias elementos estructurales', page: true, index: 0, },
        { title: 'Memorias elementos NO estructurales', page: true, index: 1, },
        { title: 'Planos estructurales', index: 2, },
        { title: 'Planos NO estructurales', Page: true, index: 8, },
        { title: 'Plano Geotécnico', page: true, index: 3, },
        { title: 'Estudio Geotécnico', page: true, index: 9, },
        { title: 'Memorias segunda revisor', index: 4, },
        { title: 'Peritaje', index: 5, },
        { title: 'Movimiento de tierras', index: 6, },
        { title: 'Otros', otrher: true, page: true, index: 7, },
    ]
    var formData = new FormData();
    // ***************************  DATA GETTERS *********************** //
    let LOAD_STEP = (_id_public) => {
        var _CHILD = currentRecord.record_eng_steps;
        for (var i = 0; i < _CHILD.length; i++) {
            if (_CHILD[i].version == currentVersionR && _CHILD[i].id_public == _id_public) return _CHILD[i]
        }
        return []
    }

    // *************************  DATA CONVERTERS ********************** //
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
        return 'form-select form-control form-control-sm';
    }
    let _GET_STEP_TYPE_INDEX = (_id_public, _type, _index) => {
        var STEP = LOAD_STEP(_id_public);
        if (!STEP.id) return null;
        var value = STEP[_type]
        if (!value) return '';
        value = value.split(';');
        return value[_index]
    }
    // ******************************* JSX ***************************** // 
    let _COMPONENT_LIST = () => {
        return <>
            <div className="row fw-bold text-center">
                <div className="col">
                    <label>ELEMENTO</label>
                </div>

                <div className="col-2">
                    <label>FOLIOS/ PLANOS</label>
                </div>


                <div className="col-2">
                    <label>CANT/ No COPIAS</label>
                </div>

                <div className="col-2">
                    <label>EVALUACION</label>
                </div>
            </div>

            {LIST.map((value, i) => {
                return <div className="row">
                    <div className="col">
                        {value.otrher ?
                            <input type="text" className="form-control form-control-sm" id="r_e_input_s430_other" placeholder='OTRO'
                                defaultValue={_GET_STEP_TYPE_INDEX('s430o', 'value', 0) ?? ''} onBlur={() => manage_step_430o()} />
                            : <label className="">{value.title}</label>}

                    </div>

                    <div className="col-2">
                        <input type="number" step={1} min={0} className="form-control form-control-sm" name="r_e_input_s430_page"
                            id={'r_e_input_s430_page_' + value.index} defaultValue={_GET_STEP_TYPE_INDEX('s430p', 'value', value.index) ?? 0} onBlur={() => manage_step_430p()} />
                    </div>


                    <div className="col-2">
                        <input type="number" step={1} min={0} className="form-control form-control-sm" name="r_e_input_s430"
                            id={'r_e_input_s430_' + value.index} defaultValue={_GET_STEP_TYPE_INDEX('s430', 'value', value.index) ?? 0} onBlur={() => manage_step_430()} />

                    </div>

                    <div className="col-2">
                        <select className={_GET_SELECT_COLOR_VALUE(_GET_STEP_TYPE_INDEX('s430', 'check', value.index) || '1')} name="r_e_select_s430_"
                            id={'r_e_select_s430_' + value.index} defaultValue={_GET_STEP_TYPE_INDEX('s430', 'check', value.index) || '1'} onChange={() => manage_step_430()}>
                            <option value="0" className="text-danger">NO APLICA</option>
                            <option value="1" className="text-success">APLICA</option>
                        </select>
                    </div>
                </div>
            })}
        </>
    }
    // ******************************* APIS **************************** // 
    let manage_step_430 = (e) => {
        if (e) e.preventDefault();
        var formData = new FormData();

        let checks = [];
        formData = new FormData();
        checks = [];
        var checks_2 = document.getElementsByName('r_e_select_s430_');
        for (var i = 0; i < checks_2.length; i++) {
            let item = document.getElementById('r_e_select_s430_' + i);
            checks.push(item.value)
        }
        formData.set('check', checks.join(';'));

        checks = [];
        var checks_2 = document.getElementsByName('r_e_input_s430');
        for (var i = 0; i < checks_2.length; i++) {
            let item = document.getElementById('r_e_input_s430_' + i);
            checks.push(item.value)
        }

        formData.set('value', checks.join(';'));

        formData.set('version', currentVersionR);
        formData.set('recordEngId', currentRecord.id);
        formData.set('id_public', 's430');
        save_step('s430', false, formData);

    }
    let manage_step_430p = (e) => {
        if (e) e.preventDefault();
        var formData = new FormData();

        let checks = [];
        formData = new FormData();
        checks = [];
        var checks_2;

        checks_2 = document.getElementsByName('r_e_input_s430_page');
        for (var i = 0; i < checks_2.length; i++) {
            let item = document.getElementById('r_e_input_s430_page_' + i);
            checks.push(item.value)
        }
        formData.set('value', checks.join(';'));

        formData.set('version', currentVersionR);
        formData.set('recordEngId', currentRecord.id);
        formData.set('id_public', 's430p');
        save_step('s430p', false, formData);

    }
    let manage_step_430o = (e) => {
        if (e) e.preventDefault();
        var formData = new FormData();

        let checks = [];
        formData = new FormData();
        checks = [];
        var checks_2;

        checks_2 = document.getElementById('r_e_input_s430_other').value;
        checks.push(checks_2)

        formData.set('value', checks.join(';'));

        formData.set('version', currentVersionR);
        formData.set('recordEngId', currentRecord.id);
        formData.set('id_public', 's430o');
        save_step('s430o', false, formData);

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
    return (
        <div>
            {_COMPONENT_LIST()}
        </div >
    );
}
