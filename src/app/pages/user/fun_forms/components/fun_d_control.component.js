import React, { Component } from 'react';
import { MDBBtn } from 'mdb-react-ui-kit';
import FUN_SERVICE from '../../../../services/fun.service';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Codes from '../../../../components/jsons/fun6DocsList.json';
import { SERIES_DOCS, _GET_SERIE_COD, _GET_SERIE_STR, _GET_SUBSERIE_COD, _GET_SUBSERIE_STR } from '../../../../components/customClasses/typeParse';

const MySwal = withReactContent(Swal);
class FUN_D_CONTROL extends Component {
    constructor(props) {
        super(props);
        this._GET_CHILD_1 = this._GET_CHILD_1.bind(this);
        this.state = {
        };
    }
    componentDidMount() {
        let SERIE = document.getElementById('fun_doc_control_0').value;
        let _CHILD = this._GET_CHILD_1();
        if (!SERIE) SERIE = 0;
        let str = _GET_SERIE_STR(_CHILD)
        document.getElementById('fun_doc_control_1').value = str;

        SERIE = document.getElementById('fun_doc_control_2').value;
        if (!SERIE) SERIE = 0;
        str = _GET_SUBSERIE_STR(_CHILD);
        document.getElementById('fun_doc_control_3').value = str;
    }
    _GET_CHILD_1 = () => {
        var _CHILD = this.props.currentItem.fun_1s;
        var _CURRENT_VERSION = this.props.currentVersion - 1;
        var _CHILD_VARS = {
            item_0: "",
            item_1: "",
            item_2: "",
            item_3: "",
            item_4: "",
            item_5: "",
            item_6: "",
            item_7: "",
            item_8: "",
            item_9: "",
            item_101: "",
            item_102: "",
        }
        if (_CHILD) {
            if (_CHILD[_CURRENT_VERSION] != null) {
                _CHILD_VARS.item_0 = _CHILD[_CURRENT_VERSION].id;
                _CHILD_VARS.item_1 = _CHILD[_CURRENT_VERSION].tipo ? _CHILD[_CURRENT_VERSION].tipo : "";
                _CHILD_VARS.item_2 = _CHILD[_CURRENT_VERSION].tramite ? _CHILD[_CURRENT_VERSION].tramite : "";
                _CHILD_VARS.item_3 = _CHILD[_CURRENT_VERSION].m_urb ? _CHILD[_CURRENT_VERSION].m_urb : "";
                _CHILD_VARS.item_4 = _CHILD[_CURRENT_VERSION].m_sub ? _CHILD[_CURRENT_VERSION].m_sub : "";
                _CHILD_VARS.item_5 = _CHILD[_CURRENT_VERSION].m_lic ? _CHILD[_CURRENT_VERSION].m_lic : "";
                _CHILD_VARS.item_6 = _CHILD[_CURRENT_VERSION].usos ? _CHILD[_CURRENT_VERSION].usos : "";
                _CHILD_VARS.item_7 = _CHILD[_CURRENT_VERSION].area ? _CHILD[_CURRENT_VERSION].area : "";
                _CHILD_VARS.item_8 = _CHILD[_CURRENT_VERSION].vivienda ? _CHILD[_CURRENT_VERSION].vivienda : "";
                _CHILD_VARS.item_9 = _CHILD[_CURRENT_VERSION].cultural ? _CHILD[_CURRENT_VERSION].cultural : "";
                _CHILD_VARS.item_101 = _CHILD[_CURRENT_VERSION].regla_1 ? _CHILD[_CURRENT_VERSION].regla_1 : "";
                _CHILD_VARS.item_102 = _CHILD[_CURRENT_VERSION].regla_2 ? _CHILD[_CURRENT_VERSION].regla_2 : "";
            }
        }
        return _CHILD_VARS;
    }

    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion } = this.props;
        const { } = this.state;
        let sumPages = 0;
        const _SERIES_DOCS = SERIES_DOCS
        // DATA GETTERS
    
        let _SET_CHILD_REVIEW = () => {
            var _CHILD = currentItem.fun_rs;
            var _CURRENT_VERSION = currentVersion - 1;
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD = _CHILD[_CURRENT_VERSION]
                } else {
                    _CHILD = false
                }
            }
            return _CHILD;
        }

        // DATA CONVERTERS
        let _GET_FUNR_CHECK_CONTROL = (_INDEX) => {
            const _CHILD_REVIEW = _SET_CHILD_REVIEW();
            if (_CHILD_REVIEW) {
                let _ARRAY_OF_CODES = _CHILD_REVIEW.check_control ? _CHILD_REVIEW.check_control.split(",") : [];
                let _value = _ARRAY_OF_CODES[_INDEX]
                if (_value) return _value
                else return null
            }
        }
        let _GET_FUNR_CHECK_CONTROL_PAGES = (_INDEX) => {
            const _CHILD_REVIEW = _SET_CHILD_REVIEW();
            if (_CHILD_REVIEW) {
                let _ARRAY_OF_CODES = _CHILD_REVIEW.check_control_pages ? _CHILD_REVIEW.check_control_pages.split(",") : [];
                let _value = _ARRAY_OF_CODES[_INDEX]
                if (_value) return _value
                else return null
            }
        }
        let _GET_FUNR_CODE = (_CODE) => {
            const _CHILD_REVIEW = _SET_CHILD_REVIEW();
            if (_CHILD_REVIEW) {
                let _ARRAY_CODES = _CHILD_REVIEW.code ? _CHILD_REVIEW.code.split(",") : [];
                let _ARRAY_VALUES = _CHILD_REVIEW.checked ? _CHILD_REVIEW.checked.split(",") : [];
                let _code_index = _ARRAY_CODES.indexOf(String(_CODE))
                if (_code_index != -1) return _ARRAY_VALUES[_code_index];
                else return null
            }
        }
        // COMPONENT JSX
        let _GET_SERIES = () => {
            let _CHILD = this._GET_CHILD_1();
            let _SERIE = _GET_SERIE_COD(_CHILD);
            let _SUBSERIE = _GET_SUBSERIE_COD(_CHILD);
            return <>
                <div className="row my-2">
                    <div className="col-3">
                        <label className="fw-bold ms-4">Series Documental:</label>
                    </div>
                    <div className="col-3">
                        <input class="form-control me-1" id="fun_doc_control_0" defaultValue={_SERIE[0]}  disabled />
                    </div>
                    <div className="col-6">
                        <input type="text" class="form-control me-1" id="fun_doc_control_1" disabled defaultValue={''} />
                    </div>
                </div>

                <div className="row my-2">
                    <div className="col-3">
                        <label className="fw-bold ms-4">Subseries Documental:</label>
                    </div>
                    <div className="col-3">
                        <input class="form-control me-1" id="fun_doc_control_2" defaultValue={_SUBSERIE[0]}  disabled  />
                         
                    </div>
                    <div className="col-6">
                        <input type="text" class="form-control me-1 text-uppercase" id="fun_doc_control_3" disabled
                            defaultValue={''} />
                    </div>
                </div>

                {_SERIE.length > 1 || _SUBSERIE.length > 1
                    ? <div className="row my-2">
                        <label className="text-danger fw-bold text-uppercase">AMBIGÜEDAD DE SERIES O SUBSERIES ENCONTRADA</label><br />
                        <label className="fw-bold">El sistema ha detectado varias series o varias subseries validas para esta solicitud</label>
                    </div>
                    : ""}

                {_SERIE.length == 0 || _SUBSERIE.length == 0
                    ? <div className="row my-2">
                        <label className="text-danger fw-bold text-uppercase">SERIE O SUBSERIE NO ENCONTRADA</label><br />
                        <label className="fw-bold">El sistema no ha podido identificar una serie o subserie, revise la modalidad de la solicitud.</label>
                    </div>
                    : ""}

                {_SERIE.length == 1 && _SUBSERIE.length <= 1
                    ? <div className="row my-2">
                        <form id="form_manage_ph_gen" onSubmit={save_fun_r}>
                            <div className="row mb-3 text-center">
                                <div className="col">
                                    <button className="btn btn-success my-3" ><i class="far fa-edit"></i> GUARDAR CAMBIOS </button>
                                </div>
                                <div className="col">
                                    <MDBBtn className="btn btn-danger my-3" onClick={() => gen_pdf()} ><i class="far fa-file-pdf"></i> GENERAR PDF </MDBBtn>
                                </div>
                            </div>
                            <ul class="list-group mx-2">
                                <li class="list-group-item">
                                    <div className="row">
                                        <div className="col-1 text-center"><label className="fw-bold">N° Orden</label></div>
                                        <div className="col text-center"><label className="fw-bold">Nombre Tipologia Documental</label></div>
                                        <div className="col-1 text-center"><label className="fw-bold">Codigo Tipologia</label></div>
                                        <div className="col-2 text-center"><label className="fw-bold"># (Folios / Cantidad)</label></div>
                                        <div className="col-2 text-center"><label className="fw-bold">Estado</label></div>
                                    </div>
                                </li>
                                {_COMPONENT_LIST()}
                            </ul>
                        </form>
                    </div>
                    : ""}
            </>
        }
        let _COMPONENT_LIST = () => {
            let _CHILD = this._GET_CHILD_1();
            let _SERIE = _GET_SERIE_COD(_CHILD);
            let _SUBSERIE = _GET_SUBSERIE_COD(_CHILD);
            let _LIST = [];
            if (_SUBSERIE.length == 0) _LIST = _SERIE;
            else _LIST = _SUBSERIE;

            return _LIST.map((value) => {
                let _LIST_2 = _SERIES_DOCS[value]
                if (!_LIST_2) _LIST_2 = _SERIES_DOCS['GENERIC']
                let _RETURN_COMPONENT = []
                let DOCS_COUNT = 1;
                for (var ITEM in _LIST_2) {
                    _RETURN_COMPONENT.push(<>
                        <li class="list-group-item">
                            <div className="row">
                                <div className="col">
                                    <label className="fw-bold" name="title_doc">{ITEM}</label>
                                    <input type='hidden' name="title_id" value={DOCS_COUNT - 1} />
                                </div>
                            </div>
                        </li>

                        {_COMPONENT_DOCS(_LIST_2[ITEM], DOCS_COUNT)}

                    </>)
                    DOCS_COUNT += _LIST_2[ITEM].length;
                }
                _RETURN_COMPONENT.push(<>
                    <li class="list-group-item">
                        <div className="row">
                            <div className="col-1 text-center">

                            </div>
                            <div className="col">
                                <label className='fw-bold'>TOTAL NUMERO DE FOLIOS</label>
                            </div>
                            <div className="col-1 text-center">

                            </div>
                            <div className="col-2 text-center">
                                <label>{sumPages}</label>
                            </div>
                            <div className="col-2 text-center">

                            </div>
                        </div>
                    </li></>)
                return <>
                    {_RETURN_COMPONENT}
                </>
            })
        }
        let _COMPONENT_DOCS = (array, _DOCS_COUNT) => {
            let _COMPONENT = [];

            for (var i = 0; i < array.length; i++) {
                let cId = Number(array[i].i);
                let currentPages = _GET_FUNR_CHECK_CONTROL_PAGES(cId);
                sumPages += Number(currentPages);
                let docName = Codes[array[i].n];
                let docCode = array[i].n;
                _COMPONENT.push(<>
                    <li class="list-group-item">
                        <div className="row">
                            <div className="col-1 text-center">
                                <label className="fw-bold" name="number_doc">{i + _DOCS_COUNT}</label>
                            </div>
                            <div className="col">
                                <label name="name_doc">{docName}</label>
                            </div>
                            <div className="col-1 text-center">
                                <label className="fw-bold" name="code_doc">{docCode}</label>
                            </div>
                            <div className="col-2 text-center">
                                <input type="number" step="1" min="0" className="form-control" name="pages_doc" id={"pages_doc_" + cId}
                                    defaultValue={currentPages} />
                            </div>
                            <div className="col-2 text-center">
                                <select class="form-select" name="select_doc" id={"select_doc_" + cId}
                                    defaultValue={_GET_FUNR_CHECK_CONTROL(cId) ?? _GET_FUNR_CODE(array[i].i) ?? 2}>
                                    <option value="2">N/A</option>
                                    <option value="1">SI</option>
                                    <option value="0">NO</option>
                                </select>
                            </div>
                        </div>
                    </li></>)
            }
            return <>{_COMPONENT}</>
        }
        // FUNCTIONS & APIS
        var formData = new FormData();

        let save_fun_r = (e) => {
            e.preventDefault();

            formData = new FormData();
            formData.set('fun0Id', currentItem.id);

            var checks = document.getElementsByName('select_doc');
            var check_control = [];
            for (var i = 0; i < checks.length; i++) {
                let element = document.getElementById('select_doc_' + i).value
                check_control.push(element);
            }
            formData.set('check_control', check_control.join(','));

            checks = document.getElementsByName('pages_doc');
            var check_control_pages = [];
            for (var i = 0; i < checks.length; i++) {
                let element = document.getElementById('pages_doc_' + i).value
                check_control_pages.push(element);
            }
            formData.set('check_control_pages', check_control_pages.join(','));
            manage_fun_r();

        }
        let manage_fun_r = () => {
            var _CHILD = _SET_CHILD_REVIEW();

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            if (_CHILD.id) {
                FUN_SERVICE.update_r(_CHILD.id, formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            this.props.requestUpdate(currentItem.id);
                        } else {
                            MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    });
            }
            else {
                FUN_SERVICE.create_funr(formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            this.props.requestUpdate(currentItem.id);
                        } else {
                            MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    });
            }

        }
        let gen_pdf = () => {

            formData = new FormData();

            formData.set('id_public', currentItem.id_public);

            var dom = document.getElementsByName('title_doc');
            var title_doc = [];
            for (var i = 0; i < dom.length; i++) {
                title_doc.push(dom[i].innerText);
            }

            dom = document.getElementsByName('title_id');
            var title_id = [];
            for (var i = 0; i < dom.length; i++) {
                title_id.push(dom[i].value);
            }

            dom = document.getElementsByName('number_doc');
            var number_doc = [];
            for (var i = 0; i < dom.length; i++) {
                number_doc.push(dom[i].innerText);
            }

            dom = document.getElementsByName('name_doc');
            var name_doc = [];
            for (var i = 0; i < dom.length; i++) {
                name_doc.push(dom[i].innerText);
            }

            dom = document.getElementsByName('pages_doc');
            var pages_doc = [];
            for (var i = 0; i < dom.length; i++) {
                pages_doc.push(dom[i].value);
            }

            dom = document.getElementsByName('code_doc');
            var code_doc = [];
            for (var i = 0; i < dom.length; i++) {
                code_doc.push(dom[i].innerText);
            }

            dom = document.getElementsByName('select_doc');
            var select_doc = [];
            for (var i = 0; i < dom.length; i++) {
                select_doc.push(dom[i].value);
            }

            formData.set('title_doc', title_doc.join(';'));
            formData.set('title_id', title_id.join(';'));
            formData.set('number_doc', number_doc.join(';'));
            formData.set('name_doc', name_doc.join(';'));
            formData.set('pages_doc', pages_doc.join(';'));
            formData.set('code_doc', code_doc.join(';'));
            formData.set('select_doc', select_doc.join(';'));

            var serie_cod = document.getElementById('fun_doc_control_0').value;
            formData.set('serie_cod', serie_cod);
            var serie_str = document.getElementById('fun_doc_control_1').value;
            formData.set('serie_str', serie_str);
            var subserie_cod = document.getElementById('fun_doc_control_2').value;
            formData.set('subserie_cod', subserie_cod);
            var subserie_str = document.getElementById('fun_doc_control_3').value;
            formData.set('subserie_str', subserie_str);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            FUN_SERVICE.gen_doc_checkcontrol(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.close();
                        window.open(process.env.REACT_APP_API_URL + "/pdf/controlcheck/" + "Hoja de control serie documental - " + currentItem.id_public + ".pdf");
                    } else {
                        MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    }
                })
                .catch(e => {
                    console.log(e);
                    MySwal.fire({
                        title: swaMsg.generic_eror_title,
                        text: swaMsg.generic_error_text,
                        icon: 'warning',
                        confirmButtonText: swaMsg.text_btn,
                    });
                });

        }
        return (
            <div>
                {_GET_SERIES()}
            </div>
        );
    }
}

export default FUN_D_CONTROL;