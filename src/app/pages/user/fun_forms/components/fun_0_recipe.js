import React, { Component } from 'react';
import FUNService from '../../../../services/fun.service'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import VIZUALIZER from '../../../../components/vizualizer.component';
import ReactTagInput from '@pathofdev/react-tag-input';

const _GLOBAL_ID = process.env.REACT_APP_GLOBAL_ID;

class FUN_0_RECIPE extends Component {
    constructor(props) {
        super(props);
        this.tagInput = React.createRef();
        this.requestUpdate = this.requestUpdate.bind(this);
        this.state = {
            tags: null,
        };
    }
    requestUpdate(id) {
        this.props.requestUpdate(id);
    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion } = this.props;
        const { } = this.state;
        const MySwal = withReactContent(Swal);

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

        let _SET_CHILD_6 = () => {
            var _CHILD = currentItem.fun_6s;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _CHILD_6_SELECT = () => {
            let _LIST = _SET_CHILD_6();
            let _COMPONENT = [];
            for (var i = 0; i < _LIST.length; i++) {
                _COMPONENT.push(<option value={_LIST[i].id}>{_LIST[i].description}</option>)
            }
            return <>{_COMPONENT}</>
        }

        let _GET_CHILD_CLOCK = () => {
            var _CHILD = currentItem.fun_clocks;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _GET_CHILD_LAW = () => {
            var _CHILD = currentItem.fun_law;
            var _CHILD_VARS = {
                id: "",
                sign: "",
                new_type: "",
                publish_neighbour: "",
                id6payment: "",
            }
            if (_CHILD != null) {
                _CHILD_VARS.id = _CHILD.id;
                _CHILD_VARS.new_type = _CHILD.new_type;
                _CHILD_VARS.sign = _CHILD.sign;
                _CHILD_VARS.id6payment = _CHILD.id6payment;
            }
            return _CHILD_VARS;
        }
        let _GET_CLOCK = (_state) => {
            var _CLOCK = _GET_CHILD_CLOCK();
            if (_state == null) return false;
            for (var i = 0; i < _CLOCK.length; i++) {
                if (_CLOCK[i].state == _state) return _CLOCK[i];
            }
            return false;
        }

        // DATA CONVERTERS
        let _FIND_6 = (_ID) => {
            let _LIST = _SET_CHILD_6();
            let _CHILD = [];
            for (var i = 0; i < _LIST.length; i++) {
                if (_LIST[i].id == _ID) {
                    return _LIST[i];
                }
            }
            return _CHILD;
        }

        // COMPONENT JSX
        let _COMPONENT_PAYMENT = () => {
            var _CHILD_CLOCK = _GET_CLOCK(3);
            var _CHILD_LAW = _GET_CHILD_LAW();
            return <>
                <div className="row mb-2">
                    <div className="col-5">
                        <label>Relacionar Documento</label>
                        <select id="fun_c_select_payment" className="form-select"
                            defaultValue={_CHILD_LAW.id6payment}>
                            <option value="-1">APORTADO FISICAMENTE</option>
                            <option value="0">SIN DOCUMENTO</option>
                            {_CHILD_6_SELECT()}
                        </select>
                    </div>
                    <div className="col-3">
                        <label>consecutivo de Recibo</label>
                        <div class="input-group">
                            <input type="text" class="form-control me-1" id="fun_c_payment_2"
                                defaultValue={currentItem.id_payment} />
                        </div>
                    </div>
                    <div className="col-3">
                        <label>Fecha de Recibo</label>
                        <div class="input-group">
                            <input type="date" max="2100-01-01" class="form-control me-1" id="fun_c_payment_1"
                                defaultValue={_CHILD_CLOCK.date_start} />
                        </div>
                    </div>
                    <div className="col-1">
                        <br />
                        {_CHILD_LAW.id6payment > 0
                            ?
                            <VIZUALIZER url={_FIND_6(_CHILD_LAW.id6payment).path + "/" + _FIND_6(_CHILD_LAW.id6payment).filename}
                                apipath={'/files/'} />
                            : ""}
                    </div>
                </div>
            </>
        }
        let _COMPONENT_DESC = () => {
            let rules = currentItem.rules ? currentItem.rules.split(';') : [];
            return <>
                <div className="row mb-2">

                    {_GLOBAL_ID == "cp1" ?
                        <input type='hidden' value={'iv'} id="fun_0_cats" />
                        : <>
                            <div className="col-6">
                                <label>Categorización de la Solicitud {currentItem.type ? "" : <label className="text-danger fw-bold">NO ESTA CATEGORIZADO</label>}</label>
                                <select class="form-select" id="fun_0_cats" defaultValue={currentItem.type}>
                                    <option value="0">Sin Categorizar</option>
                                    <option value="i">Categoria I</option>
                                    <option value="ii">Categoria II</option>
                                    <option value="iii">Categoria III</option>
                                    <option value="iv">Categoria IV</option>
                                    <option value="oa">Otra Actuación</option>
                                </select>
                            </div>
                        </>}


                    <div className="col-6">
                        <label>Modelo de Solicitud</label>
                        <select class="form-select" id="fun_0_model" defaultValue={currentItem.model ?? 2023}>
                            <option value="0">Sin modelo</option>
                            <option value={2021}>Res. 463 / 17</option>
                            <option value={2022}>Res. 1026 / 21 (2022)</option>
                            <option value={2023} selected>Res. 1026 / 21 (2023+)</option>
                        </select>
                    </div>
                </div>
                <div className="row mb-2">
                    <div className="col">
                        <label>Descripcion del Proyecto (Maximo 2000 Caracteres)</label>
                        <textarea className="input-group" maxLength="2000" id="fun_0_desc" rows="4"
                            defaultValue={_GET_CHILD_1().description}></textarea>
                    </div>
                </div>
                <div>
                    <ReactTagInput
                        tags={this.state.tags ?? (currentItem.tags ? currentItem.tags.split(',') : [])}
                        placeholder="Etiquetas de la solicitud"
                        onChange={(newTags) => this.setState({ tags: newTags })}
                        removeOnBackspace={true}
                        ref={this.tagInput}
                    />
                </div>
                <div className="row my-2">
                    <label className='fw-bold'>Reglas adicionales</label>
                    <div className="col">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="1" name="fun_0_rules" defaultChecked={rules[0] == 1} />
                            <label class="form-check-label">No usar Publicidad</label>
                        </div>
                    </div>
                    <div className="col">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="1" name="fun_0_rules" defaultChecked={rules[1] == 1} />
                            <label class="form-check-label" >No usar informe Estructural</label>
                        </div>
                        <h6><b>Valido para:</b></h6>
                        <ul>
                            <li><h6>Propiedad horizontal</h6></li>
                            <li><h6>Revalidación</h6></li>
                            <li><h6>Prorroga</h6></li>
                            <li><h6>Subdivisión</h6></li>
                            <li><h6>Parcelación</h6></li>
                        </ul>
                    </div>
                </div>
            </>
        }


        // FUNCTIONS AND WORKING ENGINES
        var formData = new FormData();
        var formDataclock = new FormData();


        let manage_clock = (useMySwal, findOne) => {

            var _CHILD = _GET_CLOCK(findOne);
            formDataclock.set('fun0Id', currentItem.id);
            if (useMySwal) {
                MySwal.fire({
                    title: swaMsg.title_wait,
                    text: swaMsg.text_wait,
                    icon: 'info',
                    showConfirmButton: false,
                });
            }

            if (_CHILD.id) {
                FUNService.update_clock(_CHILD.id, formDataclock)
                    .then(response => {
                        if (response.data === 'OK') {
                            if (useMySwal) {
                                MySwal.fire({
                                    title: swaMsg.publish_success_title,
                                    text: swaMsg.publish_success_text,
                                    footer: swaMsg.text_footer,
                                    icon: 'success',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                                this.props.requestUpdate(currentItem.id);
                            }
                        } else {
                            if (useMySwal) {
                                MySwal.fire({
                                    title: swaMsg.generic_eror_title,
                                    text: swaMsg.generic_error_text,
                                    icon: 'warning',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                            }
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        if (useMySwal) {
                            MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                    });
            }
            else {
                FUNService.create_clock(formDataclock)
                    .then(response => {
                        if (response.data === 'OK') {
                            if (useMySwal) {
                                MySwal.fire({
                                    title: swaMsg.publish_success_title,
                                    text: swaMsg.publish_success_text,
                                    footer: swaMsg.text_footer,
                                    icon: 'success',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                            }
                            this.props.requestUpdate(currentItem.id);
                        } else {
                            if (useMySwal) {
                                MySwal.fire({
                                    title: swaMsg.generic_eror_title,
                                    text: swaMsg.generic_error_text,
                                    icon: 'warning',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                            }
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        if (useMySwal) {
                            MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                    });
            }

        }
        let save_clock = () => {
            formDataclock = new FormData();
            let date_start = document.getElementById("fun_c_payment_1").value;
            if (!date_start) return;
            formDataclock.set('date_start', date_start);
            formDataclock.set('date_real', date_start);
            formDataclock.set('name', "Pago de recibo expensas fijas");
            formDataclock.set('desc', "Los terminos emepizan a partir de esta fecha");
            formDataclock.set('time', 30);
            formDataclock.set('state', 3);
            formDataclock.set('version', currentItem.version);
            manage_clock(false, 3);
        }

        let manage_law = (useMySwal) => {
            var _CHILD = _GET_CHILD_LAW();
            formData.set('fun0Id', currentItem.id);
            if (useMySwal) {
                MySwal.fire({
                    title: swaMsg.title_wait,
                    text: swaMsg.text_wait,
                    icon: 'info',
                    showConfirmButton: false,
                });
            }
            if (_CHILD.id) {
                FUNService.update_law(_CHILD.id, formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            if (useMySwal) {
                                MySwal.fire({
                                    title: swaMsg.publish_success_title,
                                    text: swaMsg.publish_success_text,
                                    footer: swaMsg.text_footer,
                                    icon: 'success',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                            }
                        } else {
                            if (useMySwal) {
                                MySwal.fire({
                                    title: swaMsg.generic_eror_title,
                                    text: swaMsg.generic_error_text,
                                    icon: 'warning',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                            }
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        if (useMySwal) {
                            MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                    });
            }
            else {
                FUNService.create_law(formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            if (useMySwal) {
                                MySwal.fire({
                                    title: swaMsg.publish_success_title,
                                    text: swaMsg.publish_success_text,
                                    footer: swaMsg.text_footer,
                                    icon: 'success',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                            }
                        } else {
                            if (useMySwal) {
                                MySwal.fire({
                                    title: swaMsg.generic_eror_title,
                                    text: swaMsg.generic_error_text,
                                    icon: 'warning',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                            }
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        if (useMySwal) {
                            MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                    });
            }

        }
        let save_law = (e) => {
            e.preventDefault();
            formData = new FormData();
            let id6payment = document.getElementById("fun_c_select_payment").value;
            formData.set('id6payment', id6payment);
            manage_law(true);
            save_desc();
            save_fun0();
            save_clock();
        }

        let save_desc = () => {
            let description = document.getElementById("fun_0_desc").value;
            formData.set('description', description);
            formData.set('version', currentVersion);
            formData.set('fun0Id', currentItem.id);
            manage_fun_1(false);
        }
        let manage_fun_1 = (useMySwal) => {
            var _CHILD = _GET_CHILD_1();

            if (useMySwal) {
                MySwal.fire({
                    title: swaMsg.title_wait,
                    text: swaMsg.text_wait,
                    icon: 'info',
                    showConfirmButton: false,
                });
            }


            if (_CHILD.item_0) {
                FUNService.update_1(_CHILD.item_0, formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            if (useMySwal) {
                                MySwal.fire({
                                    title: swaMsg.publish_success_title,
                                    text: swaMsg.publish_success_text,
                                    footer: swaMsg.text_footer,
                                    icon: 'success',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                            }
                            this.props.requestUpdate(currentItem.id)
                        } else {
                            if (response.status == 500) {
                                MySwal.close();
                            }
                        }
                    })
                    .catch(e => {
                        console.log(e);
                    });
            } else {
                FUNService.create_fun1(formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            if (useMySwal) {
                                MySwal.fire({
                                    title: swaMsg.publish_success_title,
                                    text: swaMsg.publish_success_text,
                                    footer: swaMsg.text_footer,
                                    icon: 'success',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                            }
                            this.props.requestUpdate(currentItem.id)
                        } else {
                            if (useMySwal) {
                                MySwal.fire({
                                    title: swaMsg.generic_eror_title,
                                    text: swaMsg.generic_error_text,
                                    icon: 'warning',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                            }
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        if (useMySwal) {
                            MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                    });
            }
        }

        let save_fun0 = () => {
            var formData0 = new FormData();
            let id_payment = document.getElementById("fun_c_payment_2").value;
            formData0.set('id_payment', id_payment);
            let type = document.getElementById("fun_0_cats").value;
            formData0.set('type', type);
            let model = document.getElementById("fun_0_model").value;
            formData0.set('model', model);

            let tags = this.tagInput.current.props.tags ?? []
            formData0.set('tags', tags.join(','));

            let rules_html = document.getElementsByName('fun_0_rules');
            let rules = [];
            for (let i = 0; i < rules_html.length; i++) {
                const rule = rules_html[i];
                rules.push(rule.checked ? 1 : 0);
            }

            formData0.set('rules', rules.join(';'));

            FUNService.update(currentItem.id, formData0).then(response => {
                if (response.data === 'OK') this.props.requestUpdate(currentItem.id)
            });
        }

        return (
            <>
                <form id="form_fun_c_payment" onSubmit={save_law}>
                    {_COMPONENT_PAYMENT()}
                    {_COMPONENT_DESC()}
                    <div className="col-12 text-center">
                        <button className="btn btn-success btn-lg my-3" id="btn-review"><i class="far fa-share-square"></i> GUARDAR CAMBIOS</button>
                    </div>
                </form>

            </>
        );
    }
}

export default FUN_0_RECIPE;