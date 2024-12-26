import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import DataTable from 'react-data-table-component';

import { dateParser } from '../../../components/customClasses/typeParse';
import VIZUALIZER from '../../../components/vizualizer.component';

const MySwal = withReactContent(Swal);
class FUNG_CHECKLIST extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion } = this.props;

        let _SET_CHILD = () => {
            var _CHILD = currentItem.fun_1s;
            var _CURRENT_VERSION = currentVersion - 1;
            var _CHILD_VARS = {
                item_1: "",
                item_2: "",
                item_3: "",
                item_4: "",
                item_5: "",
            }
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD_VARS.item_1 = _CHILD[_CURRENT_VERSION].tipo ?? '';
                    _CHILD_VARS.item_2 = _CHILD[_CURRENT_VERSION].tramite ?? '';
                    _CHILD_VARS.item_3 = _CHILD[_CURRENT_VERSION].m_urb ?? '';
                    _CHILD_VARS.item_4 = _CHILD[_CURRENT_VERSION].m_sub ?? '';
                    _CHILD_VARS.item_5 = _CHILD[_CURRENT_VERSION].m_lic ?? '';
                }
            }
            return _CHILD_VARS;
        }
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
        let _CHECK_INDEXVALUE = (_CODE, _VALUE) => {
            const _CHILD_REVIEW = _SET_CHILD_REVIEW();
            if (_CHILD_REVIEW) {
                let _ARRAY_OF_CODES = _CHILD_REVIEW.code.split(",");
                let _ARRAY_OF_CHECKEDS = _CHILD_REVIEW.checked.split(",");
                if (_ARRAY_OF_CODES.indexOf(_CODE) > -1) {
                    let pos = _ARRAY_OF_CODES.indexOf(_CODE);
                    if (_ARRAY_OF_CHECKEDS[pos] == _VALUE) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }

        let _SET_610 = () => {

            return <>
                <div className="row">
                    <div className="col-9">
                        <label className="app-p upper-case fw-bold"> 6.1 DOCUMENTOS COMUNES A TODA SOLICITUD</label>
                    </div>
                    <div className="col-1">
                        <label className="app-p upper-case">SI</label>
                    </div>
                    <div className="col-1">
                        <label className="app-p upper-case">NO</label>
                    </div>
                    <div className="col-1">
                        <label className="app-p upper-case">N/A</label>
                    </div>
                </div>
                <div className="row">
                    <div className="col-9">
                        <ul>
                            <label>(611) Formulario Único Nacional (Adoptado por el MVCT).</label>
                        </ul>
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="611" value="1"
                            checked={_CHECK_INDEXVALUE('611', 1)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="611" value="0"
                            checked={_CHECK_INDEXVALUE('611', 0)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="611" value="2"
                            checked={_CHECK_INDEXVALUE('611', 2)} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-9">
                        <ul>
                            <label>(612) Copia del certificado de tradición y libertad del inmueble.</label>
                        </ul>
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="612" value="1"
                            checked={_CHECK_INDEXVALUE('612', 1)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="612" value="0"
                            checked={_CHECK_INDEXVALUE('612', 0)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="612" value="2"
                            checked={_CHECK_INDEXVALUE('612', 2)} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-9">
                        <ul>
                            <label>(613) Copia documento de identidad del solicitante o  certificado de existencia y representación legal.</label>
                        </ul>
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="613" value="1"
                            checked={_CHECK_INDEXVALUE('613', 1)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="613" value="0"
                            checked={_CHECK_INDEXVALUE('613', 0)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="613" value="2"
                            checked={_CHECK_INDEXVALUE('613', 2)} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-9">
                        <ul>
                            <label>(614) Poder o autorización debidamente otorgado.</label>
                        </ul>
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="614" value="1"
                            checked={_CHECK_INDEXVALUE('614', 1)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="614" value="0"
                            checked={_CHECK_INDEXVALUE('614', 0)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="614" value="2"
                            checked={_CHECK_INDEXVALUE('614', 2)} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-9">
                        <ul>
                            <label>(615) Copia del documento o declaración privada del impuesto predial del último año u otro documento oficial (establece la dirección del predio).</label>
                        </ul>
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="615" value="1"
                            checked={_CHECK_INDEXVALUE('615', 1)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="615" value="0"
                            checked={_CHECK_INDEXVALUE('615', 0)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="615" value="2"
                            checked={_CHECK_INDEXVALUE('615', 2)} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-9">
                        <ul>
                            <label>(615) Relación de la dirección delos predios colindantes al proyecto.</label>
                        </ul>
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="616" value="1"
                            checked={_CHECK_INDEXVALUE('616', 1)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="616" value="0"
                            checked={_CHECK_INDEXVALUE('616', 0)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="616" value="2"
                            checked={_CHECK_INDEXVALUE('616', 2)} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-9">
                        <ul>
                            <label>(617) Copia de la matrícula profesional de los profesionales intervinientes en el trámite y copia de las certificaciones que acrediten su experiencia, para los trámites que así lo requieran.</label>
                        </ul>
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="617" value="1"
                            checked={_CHECK_INDEXVALUE('617', 1)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="617" value="0"
                            checked={_CHECK_INDEXVALUE('617', 0)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="617" value="2"
                            checked={_CHECK_INDEXVALUE('617', 2)} />
                    </div>
                </div>
            </>
        }

        let _SET_620 = () => {
            const _CHILD_VARS = _SET_CHILD();
            if (_CHILD_VARS.item_1.includes("A")) {
                return <>
                    <div className="row">
                        <div className="col-9">
                            <label className="app-p upper-case fw-bold"> 6.2 DOCUMENTOS ADICIONALES EN LICENCIA DE URBANIZACIÓN</label>
                        </div>
                        <div className="col-1">
                            <label className="app-p upper-case">SI</label>
                        </div>
                        <div className="col-1">
                            <label className="app-p upper-case">NO</label>
                        </div>
                        <div className="col-1">
                            <label className="app-p upper-case">N/A</label>
                        </div>
                    </div>
                    {_SET_620A()}
                    {_SET_620B()}
                    {_SET_620C()}
                </>
            }
        }
        let _SET_620A = () => {
            const _CHILD_VARS = _SET_CHILD();
            if (_CHILD_VARS.item_3.includes("A")) {
                return <>
                    <div className="row">
                        <div className="col-12">
                            <label className="fw-bold"> A. Modalidad Desarrollo</label>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-9">
                            <ul>
                                <label>(621) Plano topográfico del Predio, predios o parte del predio objeto de la solicitud.</label>
                            </ul>
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="621" value="1"
                                checked={_CHECK_INDEXVALUE('621', 1)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="621" value="0"
                                checked={_CHECK_INDEXVALUE('621', 0)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="621" value="2"
                                checked={_CHECK_INDEXVALUE('621', 2)} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-9">
                            <ul>
                                <label>(601) Plano de proyecto urbanístico.</label>
                            </ul>
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="601a" value="1"
                                checked={_CHECK_INDEXVALUE('601a', 1)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="601a" value="0"
                                checked={_CHECK_INDEXVALUE('601a', 0)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="601a" value="2"
                                checked={_CHECK_INDEXVALUE('601a', 2)} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-9">
                            <ul>
                                <label>(622) Certificación indicando disponibilidad inmediata de servicios públicos.</label>
                            </ul>
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="622" value="1"
                                checked={_CHECK_INDEXVALUE('622', 1)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="622" value="0"
                                checked={_CHECK_INDEXVALUE('622', 0)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="622" value="2"
                                checked={_CHECK_INDEXVALUE('622', 2)} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-9">
                            <ul>
                                <label>(602) Estudios detallados de amenaza y riesgo.</label>
                            </ul>
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="602a" value="1"
                                checked={_CHECK_INDEXVALUE('602a', 1)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="602a" value="0"
                                checked={_CHECK_INDEXVALUE('602a', 0)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="602a" value="2"
                                checked={_CHECK_INDEXVALUE('602a', 2)} />
                        </div>
                    </div>
                </>
            }
        }
        let _SET_620B = () => {
            const _CHILD_VARS = _SET_CHILD();
            if (_CHILD_VARS.item_3.includes("B")) {
                return <>
                    <div className="row">
                        <div className="col-12">
                            <label className="fw-bold"> B. Modalidad Saneamiento</label>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-9">
                            <ul>
                                <label>(623) Copia de licencias de urbanización, sus modificaciones y revalidaciones junto con los planos urbanísticos aprobados con los que se ejecuto el 80% de la urbanización.</label>
                            </ul>
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="623" value="1"
                                checked={_CHECK_INDEXVALUE('623', 1)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="623" value="0"
                                checked={_CHECK_INDEXVALUE('623', 0)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="623" value="2"
                                checked={_CHECK_INDEXVALUE('623', 2)} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-9">
                            <ul>
                                <label>(601) Plano de proyecto urbanístico firmado por arquitecto responsable del diseño.</label>
                            </ul>
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="601b" value="1"
                                checked={_CHECK_INDEXVALUE('601b', 1)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="601b" value="0"
                                checked={_CHECK_INDEXVALUE('601b', 0)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="601b" value="2"
                                checked={_CHECK_INDEXVALUE('601b', 2)} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-9">
                            <ul>
                                <label>(602) Estudios de amenaza y riesgo.</label>
                            </ul>
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="602b" value="1"
                                checked={_CHECK_INDEXVALUE('602b', 1)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="602b" value="0"
                                checked={_CHECK_INDEXVALUE('602b', 0)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="602b" value="2"
                                checked={_CHECK_INDEXVALUE('602b', 2)} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-9">
                            <ul>
                                <label>(624) Certificación bajo gravedad de juramento que la urbanización para la cual se solicita esta licencia está ejecutada como mínimo el 80% del total de las áreas de cesión.</label>
                            </ul>
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="624" value="1"
                                checked={_CHECK_INDEXVALUE('624', 1)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="624" value="0"
                                checked={_CHECK_INDEXVALUE('624', 0)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="624" value="2"
                                checked={_CHECK_INDEXVALUE('624', 2)} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-9">
                            <ul>
                                <label>(625) Copia de solicitud de entrega a las dependencias municipales o distritales competentes de las áreas de cesión pública ejecutadas.</label>
                            </ul>
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="625" value="1"
                                checked={_CHECK_INDEXVALUE('625', 1)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="625" value="0"
                                checked={_CHECK_INDEXVALUE('625', 0)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="625" value="2"
                                checked={_CHECK_INDEXVALUE('625', 2)} />
                        </div>
                    </div>
                </>
            }
        }
        let _SET_620C = () => {
            const _CHILD_VARS = _SET_CHILD();
            if (_CHILD_VARS.item_3.includes("C")) {
                return <>
                    <div className="row">
                        <div className="col-12">
                            <label className="fw-bold"> C. Modalidad de Reurbanización</label>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-9">
                            <ul>
                                <label>(626) Copia de la licencia de urbanización, sus modificaciones y revalidaciones o los actos de legalización, con los respectivos planos urbanísticos aprobados.</label>
                            </ul>
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="626" value="1"
                                checked={_CHECK_INDEXVALUE('626', 1)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="626" value="0"
                                checked={_CHECK_INDEXVALUE('626', 0)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="626" value="2"
                                checked={_CHECK_INDEXVALUE('626', 2)} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-9">
                            <ul>
                                <label>(627) Plano topográfico con el que se tramitó la licencia o acto de legalización del área a reurbanizar.</label>
                            </ul>
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="627" value="1"
                                checked={_CHECK_INDEXVALUE('627', 1)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="627" value="0"
                                checked={_CHECK_INDEXVALUE('627', 0)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="627" value="2"
                                checked={_CHECK_INDEXVALUE('627', 2)} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-9">
                            <ul>
                                <label>(601) Plano nuevo proyecto urbanístico firmado por profesional competente.</label>
                            </ul>
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="601c" value="1"
                                checked={_CHECK_INDEXVALUE('601c', 1)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="601c" value="0"
                                checked={_CHECK_INDEXVALUE('601c', 0)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="601c" value="2"
                                checked={_CHECK_INDEXVALUE('601c', 2)} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-9">
                            <ul>
                                <label>(602) Estudios detallados de amenaza y riesgo.</label>
                            </ul>
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="602c" value="1"
                                checked={_CHECK_INDEXVALUE('602c', 1)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="602c" value="0"
                                checked={_CHECK_INDEXVALUE('602c', 0)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="602c" value="2"
                                checked={_CHECK_INDEXVALUE('602c', 2)} />
                        </div>
                    </div>
                </>
            }
        }

        let _SET_630 = () => {
            const _CHILD_VARS = _SET_CHILD();
            if (_CHILD_VARS.item_1.includes("B")) {
                return <>
                    <div className="row">
                        <div className="col-9">
                            <label className="app-p upper-case fw-bold"> 6.3 DOCUMENTOS ADICIONALES EN LA LICENCIA DE PARCELACIÓN</label>
                        </div>
                        <div className="col-1">
                            <label className="app-p upper-case">SI</label>
                        </div>
                        <div className="col-1">
                            <label className="app-p upper-case">NO</label>
                        </div>
                        <div className="col-1">
                            <label className="app-p upper-case">N/A</label>
                        </div>
                    </div>
                    {_SET_6301()}
                    {_SET_6302()}
                </>
            }
        }
        let _SET_6301 = () => {
            return <>
                <div className="row">
                    <div className="col-9">
                        <ul>
                            <label>(631) Plano topográfico georreferenciado del predio(s), firmado por profesional competente.</label>
                        </ul>
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="631" value="1"
                            checked={_CHECK_INDEXVALUE('631', 1)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="631" value="0"
                            checked={_CHECK_INDEXVALUE('631', 0)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="631" value="2"
                            checked={_CHECK_INDEXVALUE('631', 2)} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-9">
                        <ul>
                            <label>(632) Copias autorizaciones que sustentan la prestación de los servicios de agua potable, saneamiento básico y demás autorizaciones ambientales.</label>
                        </ul>
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="632" value="1"
                            checked={_CHECK_INDEXVALUE('632', 1)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="632" value="0"
                            checked={_CHECK_INDEXVALUE('632', 0)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="632" value="2"
                            checked={_CHECK_INDEXVALUE('632', 2)} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-9">
                        <ul>
                            <label>(633) Plano proyecto de parcelación debidamente firmado por arquitecto y el solicitante.</label>
                        </ul>
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="633" value="1"
                            checked={_CHECK_INDEXVALUE('633', 1)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="633" value="0"
                            checked={_CHECK_INDEXVALUE('633', 0)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="633" value="2"
                            checked={_CHECK_INDEXVALUE('633', 2)} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-9">
                        <ul>
                            <label>(602) Estudios detallados de amenaza y riesgo.</label>
                        </ul>
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6023" value="1"
                            checked={_CHECK_INDEXVALUE('6023', 1)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6023" value="0"
                            checked={_CHECK_INDEXVALUE('6023', 0)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6023" value="2"
                            checked={_CHECK_INDEXVALUE('6023', 2)} />
                    </div>
                </div>
            </>
        }
        let _SET_6302 = () => {
            return <>
                <div className="row">
                    <div className="col-12">
                        <label className="fw-bold">Documentos adicionales en licencia de parcaleación para saneamiento</label>
                    </div>
                </div>
                <div className="row">
                    <div className="col-9">
                        <ul>
                            <label>(634) Copia de la licencia vencida de pareclación y construcción en suelo rural, sus modificaciones y revalidaciones junto con planos aprobados.</label>
                        </ul>
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="634" value="1"
                            checked={_CHECK_INDEXVALUE('634', 1)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="634" value="0"
                            checked={_CHECK_INDEXVALUE('634', 0)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="634" value="2"
                            checked={_CHECK_INDEXVALUE('634', 2)} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-9">
                        <ul>
                            <label>(635) Plano impreso del proyecto de pareclación firmado por un arquitecto responsable del diseño.</label>
                        </ul>
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="635" value="1"
                            checked={_CHECK_INDEXVALUE('635', 1)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="635" value="0"
                            checked={_CHECK_INDEXVALUE('635', 0)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="635" value="2"
                            checked={_CHECK_INDEXVALUE('635', 2)} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-9">
                        <ul>
                            <label>(636) Certificación bajo gravedad de juramento que las cesiones obligatorias en suelo rural se ejecutaron como mínimo en el 80% del total aprobado en la licencia vencida.</label>
                        </ul>
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="636" value="1"
                            checked={_CHECK_INDEXVALUE('636', 1)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="636" value="0"
                            checked={_CHECK_INDEXVALUE('636', 0)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="636" value="2"
                            checked={_CHECK_INDEXVALUE('636', 2)} />
                    </div>
                </div>
            </>
        }

        let _SET_640 = () => {
            const _CHILD_VARS = _SET_CHILD();
            if (_CHILD_VARS.item_1.includes("C")) {
                return <>
                    <div className="row">
                        <div className="col-9">
                            <label className="app-p upper-case fw-bold">6.4 DOCUMENTOS ADICIONALES EN LA LICENCIA DE SUBDIVISIÓN</label>
                        </div>
                        <div className="col-1">
                            <label className="app-p upper-case">SI</label>
                        </div>
                        <div className="col-1">
                            <label className="app-p upper-case">NO</label>
                        </div>
                        <div className="col-1">
                            <label className="app-p upper-case">N/A</label>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <label className="fw-bold"> A. Modalidad Subdivisión Urbana y Rural</label>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-9">
                            <ul>
                                <label>(641) Plano del levantamiento topográfico el antes y después de la subdivisión.</label>
                            </ul>
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="641" value="1"
                                checked={_CHECK_INDEXVALUE('641', 1)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="641" value="0"
                                checked={_CHECK_INDEXVALUE('641', 0)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="641" value="2"
                                checked={_CHECK_INDEXVALUE('641', 2)} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <label className="fw-bold"> B. Modalidad Reloteo</label>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-9">
                            <ul>
                                <label>(642) Plano base en el cual se urbanizaron los predios objeto de solicitud.</label>
                            </ul>
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="642" value="1"
                                checked={_CHECK_INDEXVALUE('642', 1)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="642" value="0"
                                checked={_CHECK_INDEXVALUE('642', 0)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="642" value="2"
                                checked={_CHECK_INDEXVALUE('642', 2)} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-9">
                            <ul>
                                <label>(643) Plano que señale los predios resultantes de la división propuesta.</label>
                            </ul>
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="643" value="1"
                                checked={_CHECK_INDEXVALUE('643', 1)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="643" value="0"
                                checked={_CHECK_INDEXVALUE('643', 0)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="643" value="2"
                                checked={_CHECK_INDEXVALUE('643', 2)} />
                        </div>
                    </div>
                </>
            }
        }

        let _SET_650 = () => {
            const _CHILD_VARS = _SET_CHILD();
            if (_CHILD_VARS.item_1.includes("F")) {
                return <>
                    <div className="row">
                        <div className="col-9">
                            <label className="app-p upper-case fw-bold">6.5 DOCUMENTOS RECONOCIMIENTO DE EDIFICACIONES</label>
                        </div>
                        <div className="col-1">
                            <label className="app-p upper-case">SI</label>
                        </div>
                        <div className="col-1">
                            <label className="app-p upper-case">NO</label>
                        </div>
                        <div className="col-1">
                            <label className="app-p upper-case">N/A</label>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-9">
                            <ul>
                                <label>(651) Plano de levantamiento arquitectónico de la construcción formados por arquitecto responsable.</label>
                            </ul>
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="651" value="1"
                                checked={_CHECK_INDEXVALUE('651', 1)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="651" value="0"
                                checked={_CHECK_INDEXVALUE('651', 0)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="651" value="2"
                                checked={_CHECK_INDEXVALUE('651', 2)} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-9">
                            <ul>
                                <label>(652) Copia del peritaje técnico que determine la estabilidad de las construcción y propuesta para las intervenciones.</label>
                            </ul>
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="652" value="1"
                                checked={_CHECK_INDEXVALUE('652', 1)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="652" value="0"
                                checked={_CHECK_INDEXVALUE('652', 0)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="652" value="2"
                                checked={_CHECK_INDEXVALUE('652', 2)} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-9">
                            <ul>
                                <label>(653) Declaración de antigüedad de la construcción entendida bajo la gravedad de juramento.</label>
                            </ul>
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="653" value="1"
                                checked={_CHECK_INDEXVALUE('653', 1)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="653" value="0"
                                checked={_CHECK_INDEXVALUE('653', 0)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="653" value="2"
                                checked={_CHECK_INDEXVALUE('653', 2)} />
                        </div>
                    </div>
                </>
            }
        }

        let _SET_660 = () => {
            const _CHILD_VARS = _SET_CHILD();
            if (_CHILD_VARS.item_1.includes("D")) {
                return <>
                    <div className="row">
                        <div className="col-9">
                            <label className="app-p upper-case fw-bold">6.6 DOCUMENTOS ADICIONALES EN LICENCIA DE CONSTRUCCIÓN</label>
                        </div>
                        <div className="col-1">
                            <label className="app-p upper-case">SI</label>
                        </div>
                        <div className="col-1">
                            <label className="app-p upper-case">NO</label>
                        </div>
                        <div className="col-1">
                            <label className="app-p upper-case">N/A</label>
                        </div>
                    </div>
                    {_SET_6601()}
                    {_SET_6602()}
                    {_SET_6603()}
                </>
            }
        }
        let _SET_6601 = () => {
            return <>
                <div className="row">
                    <div className="col-12">
                        <sup className="">* Deben presentarse firmados y rotulados por profesional idóneo</sup>
                    </div>
                </div>
                <div className="row">
                    <div className="col-9">
                        <ul>
                            <label>(6601) Memoria de cálculos y diseños estructurales*.</label>
                        </ul>
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6601" value="1"
                            checked={_CHECK_INDEXVALUE('6601', 1)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6601" value="0"
                            checked={_CHECK_INDEXVALUE('6601', 0)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6601" value="2"
                            checked={_CHECK_INDEXVALUE('6601', 2)} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-9">
                        <ul>
                            <label>(6602) Copia de los estudios geotécnicos y de suelos*.</label>
                        </ul>
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6602" value="1"
                            checked={_CHECK_INDEXVALUE('6602', 1)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6602" value="0"
                            checked={_CHECK_INDEXVALUE('6602', 0)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6602" value="2"
                            checked={_CHECK_INDEXVALUE('6602', 2)} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-9">
                        <ul>
                            <label>(6603) El proyecto arquitectónico*.</label>
                        </ul>
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6603" value="1"
                            checked={_CHECK_INDEXVALUE('6603', 1)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6603" value="0"
                            checked={_CHECK_INDEXVALUE('6603', 0)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6603" value="2"
                            checked={_CHECK_INDEXVALUE('6603', 2)} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-9">
                        <ul>
                            <label>(6604) Memoria de diseño de los elementos no estructurales*.</label>
                        </ul>
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6604" value="1"
                            checked={_CHECK_INDEXVALUE('6604', 1)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6604" value="0"
                            checked={_CHECK_INDEXVALUE('6604', 0)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6604" value="2"
                            checked={_CHECK_INDEXVALUE('6604', 2)} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-9">
                        <ul>
                            <label>(6605) Planos estructurales del proyecto*.</label>
                        </ul>
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6605" value="1"
                            checked={_CHECK_INDEXVALUE('6605', 1)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6605" value="0"
                            checked={_CHECK_INDEXVALUE('6605', 0)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6605" value="2"
                            checked={_CHECK_INDEXVALUE('6605', 2)} />
                    </div>
                </div>
            </>
        }
        let _SET_6602 = () => {
            return <>
                <div className="row">
                    <div className="col-12">
                        <label className="fw-bold">Revisión independiente de los diseños estructurales</label>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <sup className="">Indique la condición por la que se debe adelantar la revisión (Apéndice A-6.3 NSR 10)</sup>
                    </div>
                </div>
                <div className="row">
                    <div className="col-9">
                        <ul>
                            <label>(6606) Edificaciones que tengan o superen los 2000m<sup>2</sup> de área construida.</label>
                        </ul>
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6606" value="1"
                            checked={_CHECK_INDEXVALUE('6606', 1)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6606" value="0"
                            checked={_CHECK_INDEXVALUE('6606', 0)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6606" value="2"
                            checked={_CHECK_INDEXVALUE('6606', 2)} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-9">
                        <ul>
                            <label>(6607) Edificaciones que en conjunto superen los 2000m<sup>2</sup> de área construida.</label>
                        </ul>
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6607" value="1"
                            checked={_CHECK_INDEXVALUE('6607', 1)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6607" value="0"
                            checked={_CHECK_INDEXVALUE('6607', 0)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6607" value="2"
                            checked={_CHECK_INDEXVALUE('6607', 2)} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-9">
                        <ul>
                            <label>(6608) Edificaciones que deban someterse a supervisión técnica independiente.</label>
                        </ul>
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6608" value="1"
                            checked={_CHECK_INDEXVALUE('6608', 1)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6608" value="0"
                            checked={_CHECK_INDEXVALUE('6608', 0)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6608" value="2"
                            checked={_CHECK_INDEXVALUE('6608', 2)} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-9">
                        <ul>
                            <label>(6609) Edificaciones que tengan menos de 2000m<sup>2</sup> de área construida, que cuenten con la posibilidad de tramitar ampliaciones que alcancen los 2000m<sup>2</sup>.</label>
                        </ul>
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6609" value="1"
                            checked={_CHECK_INDEXVALUE('6609', 1)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6609" value="0"
                            checked={_CHECK_INDEXVALUE('6609', 0)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6609" value="2"
                            checked={_CHECK_INDEXVALUE('6609', 2)} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-9">
                        <ul>
                            <label>(6610) Edificaciones de menos de 2000m<sup>2</sup> de área construida que deban someterse a Supervisión Técnica Independiente.</label>
                        </ul>
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6610" value="1"
                            checked={_CHECK_INDEXVALUE('6610', 1)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6610" value="0"
                            checked={_CHECK_INDEXVALUE('6610', 0)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6610" value="2"
                            checked={_CHECK_INDEXVALUE('6610', 2)} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <p className="">Para las condiciones anteriores, adjuntar los siguientes documentos:</p>
                    </div>
                </div>
                <div className="row">
                    <div className="col-9">
                        <ul>
                            <label>(6611) Memoria de los cálculos y plano estructurales, firmados por el revisor independiente de los diseños estructurales.</label>
                        </ul>
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6611" value="1"
                            checked={_CHECK_INDEXVALUE('6611', 1)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6611" value="0"
                            checked={_CHECK_INDEXVALUE('6611', 0)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6611" value="2"
                            checked={_CHECK_INDEXVALUE('6611', 2)} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-9">
                        <ul>
                            <label>(6612) Memorial firmado por el revisor independiente de los diseños estructurales, en el que certifique el alcance de la revisión.</label>
                        </ul>
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6612" value="1"
                            checked={_CHECK_INDEXVALUE('6612', 1)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6612" value="0"
                            checked={_CHECK_INDEXVALUE('6612', 0)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6612" value="2"
                            checked={_CHECK_INDEXVALUE('6612', 2)} />
                    </div>
                </div>
            </>
        }
        let _SET_6603 = () => {
            return <>
                <div className="row">
                    <div className="col-12">
                        <label className="fw-bold">Bien de interés cultural</label>
                    </div>
                </div>
                <div className="row">
                    <div className="col-9">
                        <ul>
                            <label>(6613) Anteproyecto aprobado por el Ministerio de Cultura o la entidad competente. En intervenciones sobre patrimonio arqueológico, autorización expedida por la entidad competente.</label>
                        </ul>
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6613" value="1"
                            checked={_CHECK_INDEXVALUE('6613', 1)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6613" value="0"
                            checked={_CHECK_INDEXVALUE('6613', 0)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6613" value="2"
                            checked={_CHECK_INDEXVALUE('6613', 2)} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <label className="fw-bold">Propiedad Horizontal</label>
                    </div>
                </div>
                <div className="row">
                    <div className="col-9">
                        <ul>
                            <label>(6614) Copia del acta del órgano competente de administración de la propiedad horizontal o del documento que haga sus veces, autorizando la ejecución de las obras sometidas al régimen de propiedad horizontal.</label>
                        </ul>
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6614" value="1"
                            checked={_CHECK_INDEXVALUE('6614', 1)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6614" value="0"
                            checked={_CHECK_INDEXVALUE('6614', 0)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6614" value="2"
                            checked={_CHECK_INDEXVALUE('6614', 2)} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <label className="fw-bold">Reforzamiento Estructural para Edificaciones en riesgo por daños en la estructura</label>
                    </div>
                </div>
                <div className="row">
                    <div className="col-9">
                        <ul>
                            <label>(6615) Concepto técnico expedido por la autoridad municipal o distrital encargada de la gestión del riesgo u orden judicial o administrativa que ordene reforzar el inmueble.</label>
                        </ul>
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6615" value="1"
                            checked={_CHECK_INDEXVALUE('6615', 1)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6615" value="0"
                            checked={_CHECK_INDEXVALUE('6615', 0)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6615" value="2"
                            checked={_CHECK_INDEXVALUE('6615', 2)} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <label className="fw-bold">Equipamientos en suelos objeto de entrega de cesiones anticipadas:</label>
                    </div>
                </div>
                <div className="row">
                    <div className="col-9">
                        <ul>
                            <label>(6616) Certificación de disponibilidad inmediata de servicios públicos domiciliarios.</label>
                        </ul>
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6616" value="1"
                            checked={_CHECK_INDEXVALUE('6616', 1)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6616" value="0"
                            checked={_CHECK_INDEXVALUE('6616', 0)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6616" value="2"
                            checked={_CHECK_INDEXVALUE('6616', 2)} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-9">
                        <ul>
                            <label>(6617) Información que soporte el acceso directo al predio objeto de cesión desde una vía pública vehicular en las condiciones de la norma urbanística correspondiente.</label>
                        </ul>
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6617" value="1"
                            checked={_CHECK_INDEXVALUE('6617', 1)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6617" value="0"
                            checked={_CHECK_INDEXVALUE('6617', 0)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6617" value="2"
                            checked={_CHECK_INDEXVALUE('6617', 2)} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <label className="fw-bold">Trámite presentado ante autoridad distinta a la que otorgo la licencia inicial</label>
                    </div>
                </div>
                <div className="row">
                    <div className="col-9">
                        <ul>
                            <label>(6618) Licencias anteriores o el instrumento que haga sus veces con los respectivos planos.</label>
                        </ul>
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6618" value="1"
                            checked={_CHECK_INDEXVALUE('6618', 1)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6618" value="0"
                            checked={_CHECK_INDEXVALUE('6618', 0)} />
                    </div>
                    <div className="col-1">
                        <input class="form-check-input" readOnly type="radio" name="6618" value="2"
                            checked={_CHECK_INDEXVALUE('6618', 2)} />
                    </div>
                </div>
            </>
        }

        let _SET_670 = () => {
            const _CHILD_VARS = _SET_CHILD();
            if (_CHILD_VARS.item_1.includes("E")) {
                return <>
                    <div className="row">
                        <div className="col-9">
                            <label className="app-p upper-case fw-bold">6.7 DOCUMENTOS ADICIONALES EN LICENCIAS DE INTERVENCIÓN Y OCUPACIÓN DEL ESPACIO PÚBLICO</label>
                        </div>
                        <div className="col-1">
                            <label className="app-p upper-case">SI</label>
                        </div>
                        <div className="col-1">
                            <label className="app-p upper-case">NO</label>
                        </div>
                        <div className="col-1">
                            <label className="app-p upper-case">N/A</label>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <sup className="">* Deben presentarse firmados y rotulados por profesional idóneo</sup>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-9">
                            <ul>
                                <label>(671) Plano de levantamiento arquitectónico de la construcción formados por arquitecto responsable.</label>
                            </ul>
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="671" value="1"
                                checked={_CHECK_INDEXVALUE('671', 1)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="671" value="0"
                                checked={_CHECK_INDEXVALUE('671', 0)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="671" value="2"
                                checked={_CHECK_INDEXVALUE('671', 2)} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-9">
                            <ul>
                                <label>(672) Copia de los planos de diseño del proyecto *.</label>
                            </ul>
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="672" value="1"
                                checked={_CHECK_INDEXVALUE('672', 1)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="672" value="0"
                                checked={_CHECK_INDEXVALUE('672', 0)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="672" value="2"
                                checked={_CHECK_INDEXVALUE('672', 2)} />
                        </div>
                    </div>
                </>
            }
        }

        let _SET_680 = () => {
            const _CHILD_VARS = _SET_CHILD();
            if (_CHILD_VARS.item_1.includes("G")) {
                return <>
                    <div className="row">
                        <div className="col-9">
                            <label className="app-p upper-case fw-bold">6.8 DOCUMENTOS PARA OTRAS ACTUACIONES</label>
                        </div>
                        <div className="col-1">
                            <label className="app-p upper-case">SI</label>
                        </div>
                        <div className="col-1">
                            <label className="app-p upper-case">NO</label>
                        </div>
                        <div className="col-1">
                            <label className="app-p upper-case">N/A</label>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <sup className="">* Deben presentarse firmados y rotulados por profesional idóneo</sup>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <label className="fw-bold">Ajuste de cotas y áreas</label>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-9">
                            <ul>
                                <label>(681) Planos de alinderamiento.</label>
                            </ul>
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="681" value="1"
                                checked={_CHECK_INDEXVALUE('681', 1)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="681" value="0"
                                checked={_CHECK_INDEXVALUE('681', 0)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="681" value="2"
                                checked={_CHECK_INDEXVALUE('681', 2)} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <label className="fw-bold">Aprobación de los planos de propiedad horizontal</label>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-9">
                            <ul>
                                <label>(682) Presentación de solicitud ante autoridad distinta a la que otorgó la licencia: copia de la licencia y de los planos correspondientes.</label>
                            </ul>
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="682" value="1"
                                checked={_CHECK_INDEXVALUE('682', 1)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="682" value="0"
                                checked={_CHECK_INDEXVALUE('682', 0)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="682" value="2"
                                checked={_CHECK_INDEXVALUE('682', 2)} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-9">
                            <ul>
                                <label>(683) Para licencias urbanísticas que hayan perdido su vigencia: manifestación expresa bajo gravedad de juramento en la que conste que la obra aprobada está construida en su totalidad.</label>
                            </ul>
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="683" value="1"
                                checked={_CHECK_INDEXVALUE('683', 1)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="683" value="0"
                                checked={_CHECK_INDEXVALUE('683', 0)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="683" value="2"
                                checked={_CHECK_INDEXVALUE('683', 2)} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-9">
                            <ul>
                                <label>(684) Cuadro de áreas o proyecto de división.</label>
                            </ul>
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="684" value="1"
                                checked={_CHECK_INDEXVALUE('684', 1)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="684" value="0"
                                checked={_CHECK_INDEXVALUE('684', 0)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="684" value="2"
                                checked={_CHECK_INDEXVALUE('684', 2)} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-9">
                            <ul>
                                <label>(685) Bienes de interés cultural: Anteproyecto de intervención aprobado.</label>
                            </ul>
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="685" value="1"
                                checked={_CHECK_INDEXVALUE('685', 1)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="685" value="0"
                                checked={_CHECK_INDEXVALUE('685', 0)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="685" value="2"
                                checked={_CHECK_INDEXVALUE('685', 2)} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <label className="fw-bold">Autorización para el movimiento de tierras</label>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-9">
                            <ul>
                                <label>(686) Estudios de suelos y geotécnicos.</label>
                            </ul>
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="6861" value="1"
                                checked={_CHECK_INDEXVALUE('6861', 1)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="6861" value="0"
                                checked={_CHECK_INDEXVALUE('6861', 0)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="6861" value="2"
                                checked={_CHECK_INDEXVALUE('6861', 2)} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <label className="fw-bold">Aprobación de piscinas</label>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-9">
                            <ul>
                                <label>(687) Planos de diseño y arquitectónicos (NSR-10).</label>
                            </ul>
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="687" value="1"
                                checked={_CHECK_INDEXVALUE('687', 1)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="687" value="0"
                                checked={_CHECK_INDEXVALUE('687', 0)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="687" value="2"
                                checked={_CHECK_INDEXVALUE('687', 2)} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-9">
                            <ul>
                                <label>(686) Estudios geotécnicos y de suelos.</label>
                            </ul>
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="6862" value="1"
                                checked={_CHECK_INDEXVALUE('6862', 1)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="6862" value="0"
                                checked={_CHECK_INDEXVALUE('6862', 0)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="6862" value="2"
                                checked={_CHECK_INDEXVALUE('6862', 2)} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <label className="fw-bold">Modificación del plano urbanístico:</label>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-9">
                            <ul>
                                <label>(688) Copia de la licencia de urbanización, sus modificaciones, prórroga y/o revalidación y los planos que hacen parte de las mismas.</label>
                            </ul>
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="688" value="1"
                                checked={_CHECK_INDEXVALUE('688', 1)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="688" value="0"
                                checked={_CHECK_INDEXVALUE('688', 0)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="688" value="2"
                                checked={_CHECK_INDEXVALUE('688', 2)} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-9">
                            <ul>
                                <label>(689) Planos que contengan la nueva propuesta de modificación de plano urbanístico.</label>
                            </ul>
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="689" value="1"
                                checked={_CHECK_INDEXVALUE('689', 1)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="689" value="0"
                                checked={_CHECK_INDEXVALUE('689', 0)} />
                        </div>
                        <div className="col-1">
                            <input class="form-check-input" readOnly type="radio" name="689" value="2"
                                checked={_CHECK_INDEXVALUE('689', 2)} />
                        </div>
                    </div>
                </>
            }
        }

        let _CHILD_6_LIST = () => {
            let _LIST = currentItem.fun_6s;
            const columns = [
                {
                    name: <label className="text-center">DESCRIPCIÓN</label>,
                    selector: 'description',
                    sortable: true,
                    filterable: true,
                    cell: row => <label>{row.description}</label>
                },
                {
                    name: <label>CÓDIGO</label>,
                    selector: 'id_public',
                    sortable: true,
                    filterable: true,
                    maxWidth: '50px',
                    cell: row => <label>{row.id_public}</label>
                },
                {
                    name: <label>FOLIOS</label>,
                    selector: 'pages',
                    sortable: true,
                    filterable: true,
                    maxWidth: '40px',
                    cell: row => <label>{row.pages}</label>
                },
                {
                    name: <label>FECHA ANEXO</label>,
                    selector: 'date',
                    sortable: true,
                    filterable: true,
                    maxWidth: '100px',
                    cell: row => <label>{dateParser(row.date)}</label>
                },
                {
                    name: <label>ESTADO</label>,
                    button: true,
                    maxWidth: '50px',
                    cell: row => <>
                        {row.active == 1
                            ? <label className="text-success fw-bold">Activo</label>
                            : <label className="text-danger fw-bold">Inactivo</label>}
                    </>
                },
                {
                    name: <label>ACCIÓN</label>,
                    button: true,
                    minWidth: '140px',
                    cell: row => <>
                        <VIZUALIZER url={row.path + "/" + row.filename}
                            apipath={'/files/'} />
                    </>
                },
            ]
            return <DataTable
                paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                noDataComponent="No hay Items"
                striped="true"
                columns={columns}
                data={_LIST}
                highlightOnHover
                pagination
                paginationPerPage={10}
                paginationRowsPerPageOptions={[10, 20, 30]}
                className="data-table-component"
                noHeader
            />
        }

        return (
            <div>
                <legend className="my-2 px-3 text-uppercase Collapsible" id="fung_c3">
                    <label className="app-p lead text-center fw-normal text-uppercase">6. LISTA GENERAL DE CHEQUEO DE DOCUMENTOS</label>
                </legend>
                {_SET_610()}
                {_SET_620()}
                {_SET_630()}
                {_SET_640()}
                {_SET_650()}
                {_SET_660()}
                {_SET_670()}
                {_SET_680()}
                <legend className="my-2 px-3 text-uppercase Collapsible" id="fung_c4">
                    <label className="app-p lead text-center fw-normal text-uppercase">7. GESTIÓN DOCUMENTAL</label>
                </legend>
                {_CHILD_6_LIST()}
            </div>
        );
    }
}

export default FUNG_CHECKLIST;