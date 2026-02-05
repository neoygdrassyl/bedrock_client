import React, { Component } from 'react';
import ReactDOM from "react-dom";
import ReactHTMLDatalist from "react-html-datalist";
import FUNService from '../../../services/fun.service'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import DataTable from 'react-data-table-component';
import { MDBBtn, MDBTooltip } from 'mdb-react-ui-kit';
import { dateParser, dateParser_timePassed, dateParser_yearsPassed } from '../../../components/customClasses/typeParse'
import VIZUALIZER from '../../../components/vizualizer.component';
import { Divider } from 'rsuite';
import profesionalsService from '../../../services/profesionals.service';

const _GLOBAL_ID = process.env.REACT_APP_GLOBAL_ID;
const MySwal = withReactContent(Swal);
const moment = require('moment');
class FUNN51 extends Component {
    constructor(props) {
        super(props);
        this.state = {
            new: false,
            edit: false,
            dataListPrfesionals: [],
            searchingP: false,
        };
    }
    componentDidUpdate(prevState) {
        if (this.state.edit !== prevState.edit && this.state.edit != false) {
            var _ITEM = this.state.edit;
            document.getElementById("f_5211_edit").value = _ITEM.name;
            document.getElementById("f_5212_edit").value = _ITEM.surname;
            document.getElementById("f_522_edit").value = _ITEM.id_number;
            document.getElementById("f_524_edit").value = _ITEM.number;
            document.getElementById("f_523_edit").value = _ITEM.email;
            document.getElementById("f_526_edit").value = _ITEM.registration;
            document.getElementById("f_527_edit").value = _ITEM.registration_date;
            document.getElementById("f_528_edit").value = _ITEM.supervision;
            document.getElementById("f_5210_edit").value = _ITEM.sanction ? 1 : 0;

            if (_ITEM.expirience) {
                let experience_m = _ITEM.expirience;
                let experience_months_left = experience_m % 12;
                let experience_y = Math.trunc(experience_m / 12);
                document.getElementById("f_529_edit").value = experience_y;
                document.getElementById("f_529m_edit").value = experience_months_left;
            }


            let array = _ITEM.role.split(',');
            let select = document.getElementById("f_525_edit");
            for (var options of select) {
                if (array.includes(options.value)) {
                    options.selected = true;
                }
            }

            if (_ITEM.docs) {
                var _array = _ITEM.docs.split(',');
                document.getElementById("f_52_111_edit").value = _array[0];
                document.getElementById("f_52_112_edit").value = _array[1];
                document.getElementById("f_52_113_edit").value = _array[2];
                document.getElementById("f_52_114_edit").value = _array[3];
                document.getElementById("f_52_115_edit").value = _array[4];
                document.getElementById("f_52_116_edit").value = _array[5];
            }

        }
    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion } = this.props;
        const { dataListPrfesionals } = this.state;

        var formData = new FormData();

        // DATA GETTERS
        let _SET_CHILD_52 = () => {
            var _CHILD = currentItem.fun_52s;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _GET_CHILD_6 = () => {
            var _CHILD = currentItem.fun_6s;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }

        // DATA CONVERTERS
        let _CHILD_6_SELECT = () => {
            let _LIST = _GET_CHILD_6();
            let _COMPONENT = [];
            for (var i = 0; i < _LIST.length; i++) {
                _COMPONENT.push(<option value={_LIST[i].id}>{_LIST[i].description}</option>)
            }
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
        let _GET_DOCS_BTNS = (_item) => {
            if (!_item) return "";
            var _array = _item.split(',');
            var _COMPONENT = [];

            _COMPONENT.push(<>{_array[0] > 0
                ?
                <VIZUALIZER url={_FIND_6(_array[0]).path + "/" + _FIND_6(_array[0]).filename} apipath={'/files/'}
                    icon={'far fa-id-card fa-2x'} color={'DeepSkyBlue'} />
                : ""}</>)

            _COMPONENT.push(<>{_array[1] > 0
                ?
                <VIZUALIZER url={_FIND_6(_array[1]).path + "/" + _FIND_6(_array[1]).filename} apipath={'/files/'}
                    icon={'far fa-file-alt fa-2x'} color={'DarkOrchid'} />
                : ""}</>)

            _COMPONENT.push(<>{_array[2] > 0
                ?
                <VIZUALIZER url={_FIND_6(_array[2]).path + "/" + _FIND_6(_array[2]).filename} apipath={'/files/'}
                    icon={'far fa-file-alt fa-2x'} color={'GoldenRod'} />
                : ""}</>)

            _COMPONENT.push(<>{_array[3] > 0
                ?
                <VIZUALIZER url={_FIND_6(_array[3]).path + "/" + _FIND_6(_array[3]).filename} apipath={'/files/'}
                    icon={'far fa-file-alt fa-2x'} color={'LimeGreen'} />
                : ""}</>)

            _COMPONENT.push(<>{_array[4] > 0
                ?
                <VIZUALIZER url={_FIND_6(_array[4]).path + "/" + _FIND_6(_array[4]).filename} apipath={'/files/'}
                    icon={'far fa-file-alt fa-2x'} color={'tomato'} />
                : ""}</>)

            _COMPONENT.push(<>{_array[5] > 0
                ?
                <VIZUALIZER url={_FIND_6(_array[5]).path + "/" + _FIND_6(_array[5]).filename} apipath={'/files/'}
                    icon={'far fa-file-alt fa-2x'} color={'gray'} />
                : ""}</>)


            return <>{_COMPONENT}</>
        }
        let _REGEX_IDNUMBER = (e) => {
            let text = e.target.value
            text = text.trim();
            let regex = /^[0-9]+$/i;
            let test = regex.test(text);
            if (test) {
                var _value = Number(text).toLocaleString();
                _value = _value.replaceAll(',', '.');
                document.getElementById(e.target.id).value = _value;
            }
        }
        let _GET_YEARS_EXPERIENCE = (id) => {
            let idate = document.getElementById('f_527' + id).value;
            let date = moment(idate).format('YYYY-MM-DD');
            let today = moment().format('YYYY-MM-DD');
            let timePassed = moment(today).diff(date, 'months');
            let years = Math.trunc(timePassed / 12);
            let months = Math.trunc(timePassed % 12);
            document.getElementById('f_529' + id).value = years;
            document.getElementById('f_529m' + id).value = months;
        }

        // COMPONENTS JSX
        let _COMPONENT_NEW = () => {
            return <>
                {_PROFESIONAL_SEARCHER('')}
                <div className="row mb-3">
                    <div className="col-6">
                        <label>5.2.1 Nombre</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-user"></i>
                            </span>
                            <input type="text" class="form-control" id="f_5211" />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.2.1 Apellido(s)</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-user"></i>
                            </span>
                            <input type="text" class="form-control" id="f_5212" />
                        </div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-6">
                        <label>5.2.2 Cédula</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-id-card"></i>
                            </span>
                            <input type="text" class="form-control" id="f_522" onBlur={(e) => { if (e.currentTarget === e.target) _REGEX_IDNUMBER(e) }} />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.2.3 Correo Electrónico</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-envelope"></i>
                            </span>
                            <input type="text" class="form-control" id="f_523" />
                        </div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-12">
                        <label>5.2.5 Rol que Desempeña (Puede seleccionar multiples usando la tecla ctrl)</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-user-graduate"></i>
                            </span>
                            <select class="form-select" id="f_525">
                                <option>URBANIZADOR/PARCELADOR</option>
                                <option value={'URBANIZADOR O CONSTRUCTOR RESPONSABLE'}>(2021) URBANIZADOR O CONSTRUCTOR RESPONSABLE</option>
                                <option value={'DIRECTOR DE LA CONSTRUCCION'}>(2022) DIRECTOR DE LA CONSTRUCCION</option>
                                <option>ARQUITECTO PROYECTISTA</option>
                                <option>INGENIERO CIVIL DISEÑADOR ESTRUCTURAL</option>
                                <option>DISEÑADOR DE ELEMENTOS NO ESTRUCTURALES</option>
                                <option>INGENIERO CIVIL GEOTECNISTA</option>
                                <option>INGENIERO TOPOGRAFO Y/O TOPÓGRAFO</option>
                                <option>REVISOR INDEPENDIENTE DE LOS DISEÑOS ESTRUCTURALES</option>
                                <option>OTROS PROFESIONALES ESPECIALISTAS</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-6">
                        <label>5.2.4 Teléfono de Contacto</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-phone-alt"></i>
                            </span>
                            <input type="text" class="form-control" id="f_524" />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.2.6 No. Matrícula Profesional</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-file-contract"></i>
                            </span>
                            <input type="text" class="form-control" id="f_526" />
                        </div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-6">
                        <label>5.2.7 Fecha expedición Matrícula</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-calendar-alt"></i>
                            </span>
                            <input type="date" class="form-control" max="2100-01-01" id="f_527" onChange={() => _GET_YEARS_EXPERIENCE('')} />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.2.8 ¿Sancionado?</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-check-square"></i>
                            </span>
                            <select class="form-select" id="f_5210">
                                <option value="0">NO</option>
                                <option value="1">SI</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-6">
                        <label>5.2.9 Tiempo de Experiencia (Años y meses)</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                Años:
                            </span>
                            <input type="number" step="1" min="0" id="f_529" placeholder="Años" class="form-control" />
                            <span class="input-group-text bg-info text-white ms-1">
                                Meses:
                            </span>
                            <input type="number" step="1" min="0" id="f_529m" placeholder="Meses" class="form-control" />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.2.10 Supervisión técnica</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-eye"></i>
                            </span>
                            <select class="form-select" id="f_528">
                                <option selected>N/A</option>
                                <option>SI</option>
                                <option>NO</option>
                            </select>
                        </div>
                    </div>
                </div>

                <Divider>DOCUMENTOS</Divider>

                <div className="row mb-2">
                    <div className="col-6">
                        <label>5.2.11.1 Relacionar Documento: Hoja de Vida</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-file"></i>
                            </span>
                            <select className='form-select' id="f_52_114" defaultValue={_GLOBAL_ID === 'cp1' ? 0 : -1}>
                                <option value="-1">APORTADO FISICAMENTE</option>
                                <option value="0">SIN DOCUMENTO</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.2.11.2 Relacionar Documento: Documento de Identidad</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-file"></i>
                            </span>
                            <select className='form-select' id="f_52_111" defaultValue={_GLOBAL_ID === 'cp1' ? 0 : -1}>
                                <option value="-1">APORTADO FISICAMENTE</option>
                                <option value="0">SIN DOCUMENTO</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.2.11.3 Relacionar Documento: Matricula</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-file"></i>
                            </span>
                            <select className='form-select' id="f_52_112" defaultValue={_GLOBAL_ID === 'cp1' ? 0 : -1}>
                                <option value="-1">APORTADO FISICAMENTE</option>
                                <option value="0">SIN DOCUMENTO</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.2.11.4 Relacionar Documento: Vigencia Matricular</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-file"></i>
                            </span>
                            <select className='form-select' id="f_52_113" defaultValue={_GLOBAL_ID === 'cp1' ? 0 : -1}>
                                <option value="-1">APORTADO FISICAMENTE</option>
                                <option value="0">SIN DOCUMENTO</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.2.11.5 Relacionar Documento: Estudios de postgrado</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-file"></i>
                            </span>
                            <select className='form-select' id="f_52_115" defaultValue={_GLOBAL_ID === 'cp1' ? 0 : -1}>
                                <option value="-1">APORTADO FISICAMENTE</option>
                                <option value="0">SIN DOCUMENTO</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.2.11.6 Relacionar Documento: Certificados</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-file"></i>
                            </span>
                            <select className='form-select' id="f_52_116" defaultValue={_GLOBAL_ID === 'cp1' ? "0" : "-1"}>
                                <option value="-1">APORTADO FISICAMENTE</option>
                                <option value="0">SIN DOCUMENTO</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div>
                    </div>
                </div>
            </>
        }
        let _COMPONENT_EDIT = () => {
            return <>
                {_PROFESIONAL_SEARCHER('_edit')}
                <div className="row mb-3">
                    <div className="col-6">
                        <label>5.2.1 Nombre</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-user"></i>
                            </span>
                            <input type="text" class="form-control" id="f_5211_edit" />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.2.1 Apellido(s)</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-user"></i>
                            </span>
                            <input type="text" class="form-control" id="f_5212_edit" />
                        </div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-6">
                        <label>5.2.2 Cédula</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-id-card"></i>
                            </span>
                            <input type="text" class="form-control" id="f_522_edit" onBlur={(e) => { if (e.currentTarget === e.target) _REGEX_IDNUMBER(e) }} />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.2.3 Correo Eletrónico</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-envelope"></i>
                            </span>
                            <input type="text" class="form-control" id="f_523_edit" />
                        </div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-12">
                        <label>5.2.5 Rol que Desempeña (Puede seleccionar multiples usando la tecla ctrl)</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-user-graduate"></i>
                            </span>
                            <select class="form-select" id="f_525_edit">
                                <option>URBANIZADOR/PARCELADOR</option>
                                <option value={'URBANIZADOR O CONSTRUCTOR RESPONSABLE'}>(2021) URBANIZADOR O CONSTRUCTOR RESPONSABLE</option>
                                <option value={'DIRECTOR DE LA CONSTRUCCION'}>(2022) DIRECTOR DE LA CONSTRUCCION</option>
                                <option>ARQUITECTO PROYECTISTA</option>
                                <option>INGENIERO CIVIL DISEÑADOR ESTRUCTURAL</option>
                                <option>DISEÑADOR DE ELEMENTOS NO ESTRUCTURALES</option>
                                <option>INGENIERO CIVIL GEOTECNISTA</option>
                                <option>INGENIERO TOPOGRAFO Y/O TOPÓGRAFO</option>
                                <option>REVISOR INDEPENDIENTE DE LOS DISEÑOS ESTRUCTURALES</option>
                                <option>OTROS PROFESIONALES ESPECIALISTAS</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-6">
                        <label>5.2.4 Teléfono de Contacto</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-phone-alt"></i>
                            </span>
                            <input type="text" class="form-control" id="f_524_edit" />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.2.6 No. Matricula Profesional</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-file-contract"></i>
                            </span>
                            <input type="text" class="form-control" id="f_526_edit" />
                        </div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-6">
                        <label>5.2.7 Fecha expedición Matrícula</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-calendar-alt"></i>
                            </span>
                            <input type="date" class="form-control" max="2100-01-01" id="f_527_edit" onChange={() => _GET_YEARS_EXPERIENCE('_edit')} />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.2.8 ¿Sancionado?</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-check-square"></i>
                            </span>
                            <select class="form-select" id="f_5210_edit">
                                <option value="0">NO</option>
                                <option value="1">SI</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-6">
                        <label>5.2.9 Tiempo de Experiencia (Años y meses)</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                Años:
                            </span>
                            <input type="number" step="1" min="0" id="f_529_edit" placeholder="Años" class="form-control" />
                            <span class="input-group-text bg-info text-white ms-1">
                                Meses:
                            </span>
                            <input type="number" step="1" min="0" id="f_529m_edit" placeholder="Meses" class="form-control" />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.2.10 Supervisión técnica</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-eye"></i>
                            </span>
                            <select class="form-select" id="f_528_edit">
                                <option selected>N/A</option>
                                <option>SI</option>
                                <option>NO</option>
                            </select>
                        </div>
                    </div>
                </div>

                <Divider>DOCUMENTOS</Divider>

                <div className="row mb-2">
                    <div className="col-6">
                        <label>5.2.11.1 Hoja de Vida</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-file"></i>
                            </span>
                            <select className='form-select' id="f_52_114_edit">
                                <option value="-1">APORTADO FISICAMENTE</option>
                                <option value="0">SIN DOCUMENTO</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.2.11.2 Relacionar Documento: Documento de Identidad</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-file"></i>
                            </span>
                            <select className='form-select' id="f_52_111_edit">
                                <option value="-1">APORTADO FISICAMENTE</option>
                                <option value="0">SIN DOCUMENTO</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.2.11.3 Relacionar Documento: Matrícula</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-file"></i>
                            </span>
                            <select className='form-select' id="f_52_112_edit">
                                <option value="-1">APORTADO FISICAMENTE</option>
                                <option value="0">SIN DOCUMENTO</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.2.11.4 Relacionar Documento: Vigencia Matricular</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-file"></i>
                            </span>
                            <select className='form-select' id="f_52_113_edit">
                                <option value="-1">APORTADO FISICAMENTE</option>
                                <option value="0">SIN DOCUMENTO</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.2.11.5 Relacionar Documento: Estudios de postgrado</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-file"></i>
                            </span>
                            <select className='form-select' id="f_52_115_edit">
                                <option value="-1">APORTADO FISICAMENTE</option>
                                <option value="0">SIN DOCUMENTO</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.2.11.6 Relacionar Documento: Certificados</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-file"></i>
                            </span>
                            <select className='form-select' id="f_52_116_edit">
                                <option value="-1">APORTADO FISICAMENTE</option>
                                <option value="0">SIN DOCUMENTO</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div>
                    </div>
                </div>
            </>
        }
        let _CHILD_52_LIST = () => {
            let _LIST = _SET_CHILD_52();
            const columns_52 = [
                {
                    name: <label>NOMBRE</label>,
                    selector: row => row.surname, // FIX: react-data-table v7→v8
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: '200px',
                    cell: row => <label>{row.name + " " + row.surname}</label>
                },
                {
                    name: <label>CC/NIT</label>,
                    selector: row => row.id_number, // FIX: react-data-table v7→v8
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: '150px',
                    cell: row => <label>{row.id_number}</label>
                },
                {
                    name: <label>TELEFONO/ CELULAR</label>,
                    selector: row => row.number, // FIX: react-data-table v7→v8
                    center: true,
                    minWidth: '150px',
                    cell: row => <label>{row.number}</label>
                },
                {
                    name: <label>CORREO</label>,
                    selector: row => row.email, // FIX: react-data-table v7→v8
                    center: true,
                    minWidth: '150px',
                    cell: row => <label>{row.email}</label>
                },
                {
                    name: <label>PROFESION</label>,
                    selector: row => row.role, // FIX: react-data-table v7→v8
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: '200px',
                    cell: row => <label>{row.role}</label>
                },
                {
                    name: <label>MATRICULA</label>,
                    selector: row => row.registration, // FIX: react-data-table v7→v8
                    center: true,
                    minWidth: '150px',
                    cell: row => <label>{row.registration}</label>
                },
                {
                    name: <label>EXP. MATRICULA</label>,
                    selector: row => row.registration_date, // FIX: react-data-table v7→v8
                    center: true,
                    minWidth: '150px',
                    cell: row => <label>{dateParser(row.registration_date)}</label>
                },
                {
                    name: <label>EXPERIENCIA</label>,
                    selector: row => row.expirience, // FIX: react-data-table v7→v8
                    center: true,
                    minWidth: '150px',
                    cell: row => <label>{Math.trunc(row.expirience / 12)} año(s)</label>
                },
                {
                    name: <label>¿SANCIONADO?</label>,
                    selector: row => row.sanction, // FIX: react-data-table v7→v8
                    center: true,
                    cell: row => <label>{row.sanction ? <label className="text-danger fw-bold">SI</label> : "NO"}</label>
                },
                {
                    name: <label>SUPERVISION</label>,
                    selector: row => row.supervision, // FIX: react-data-table v7→v8
                    center: true,
                    cell: row => <label>{row.supervision}</label>
                },
                {
                    name: <label>DOCUMENTOS</label>,
                    button: true,
                    center: true,
                    minWidth: '190px',
                    cell: row => <>{_GET_DOCS_BTNS(row.docs)}</>
                },
                {
                    name: <label>ESTADO</label>,
                    button: true,
                    compact: true,
                    cell: row =>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" defaultChecked={row.active == 1 ? true : false} onChange={() => setActive_52(row)} />
                        </div>
                },
                {
                    name: <label>ACCION</label>,
                    button: true,
                    compact: true,
                    cell: row => <>
                        <MDBTooltip title='Modificar Item' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1">
                            {/* FIX: button anidado - replaced MDBBtn with span */}
                            <span 
                                role="button" 
                                tabIndex={0} 
                                className="btn btn-secondary btn-sm  m-0 p-2 shadow-none" 
                                onClick={() => this.setState({ edit: row })}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') this.setState({ edit: row }); }}
                                style={{cursor: 'pointer'}}>
                                <i className="far fa-edit fa-2x"></i>
                            </span>
                        </MDBTooltip>
                        <MDBTooltip title='Eliminar Item' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1">
                            {/* FIX: button anidado - replaced MDBBtn with span */}
                            <span 
                                role="button" 
                                tabIndex={0} 
                                className="btn btn-danger btn-sm  m-0 p-2 shadow-none" 
                                onClick={() => delete_52(row.id)}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') delete_52(row.id); }}
                                style={{cursor: 'pointer'}}>
                                <i className="far fa-trash-alt fa-2x"></i>
                            </span>
                        </MDBTooltip>

                    </>
                },
            ]
            return <DataTable
                noDataComponent="No hay Items"
                striped="true"
                columns={columns_52}
                data={_LIST}
                highlightOnHover
                className="data-table-component"
                noHeader
            />
        }

        let _PROFESIONAL_SEARCHER = (_scope) => {

            return <>
                <div className="row">
                    <div className="col">
                        <label>Busqueda de Profesional. {this.state.searchingP ? <label className='fw-bold'>Buscando...</label> : ''}</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-success text-white">
                                <i class="fas fa-search"></i>
                            </span>
                            <ReactHTMLDatalist
                                name={"search_52"}
                                onChange={(e) => process_dataList(e.target.text, e.target.value, _scope)}
                                classNames={"form-control"}
                                options={dataListPrfesionals.map((v, i) => {
                                    let searchTerm = (v.name + ' ' + v.name_2 + ' ' + v.surname + ' ' + v.surname_2).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()
                                    return { text: searchTerm, value: JSON.stringify(v) }
                                })}
                            />
                        </div>
                    </div>
                </div>
            </>
        }
        // FUNCTIONS AND APIS
        let new_52 = (e) => {
            e.preventDefault();
            manage_prof();
            let fun0Id = null;
            //
            formData = new FormData();
            fun0Id = currentItem.id;
            formData.set('fun0Id', fun0Id);
            let name = document.getElementById("f_5211").value;
            formData.set('name', name);
            let surname = document.getElementById("f_5212").value;
            formData.set('surname', surname);
            let id_number = document.getElementById("f_522").value;
            formData.set('id_number', id_number);
            let number = document.getElementById("f_524").value;
            formData.set('number', number);
            let email = document.getElementById("f_523").value;
            formData.set('email', email);

            // 5.2.5 THIS IS A SELECT THAT CAN BE MULTIPLE
            let role = [];
            let select = document.getElementById("f_525").selectedOptions;
            for (var option of select) {
                role.push(option.value)
            }
            formData.set('role', role);

            let registration = document.getElementById("f_526").value;
            formData.set('registration', registration);
            let registration_date = document.getElementById("f_527").value; // THIS IS A DATE
            if (registration_date) formData.set('registration_date', registration_date);
            let supervision = document.getElementById("f_528").value; // THIS IS A SELECT
            formData.set('supervision', supervision);

            let expirience_y = document.getElementById("f_529").value;
            let expirience_m = document.getElementById("f_529m").value;
            let expirience = parseInt((expirience_y ? expirience_y * 12 : 0) + parseInt(expirience_m ? expirience_m : 0));
            formData.set('expirience', expirience);
            let sanction = document.getElementById("f_5210").value;
            formData.set('sanction', sanction);

            let docs = [];
            docs.push(document.getElementById("f_52_111").value);
            docs.push(document.getElementById("f_52_112").value);
            docs.push(document.getElementById("f_52_113").value);
            docs.push(document.getElementById("f_52_114").value);
            docs.push(document.getElementById("f_52_115").value);
            docs.push(document.getElementById("f_52_116").value);
            formData.set('docs', docs.join());

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            FUNService.create_fun52(formData)
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
                        document.getElementById('form_fun_52_new').reset();
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
        let edit_52 = (e) => {
            e.preventDefault();
            formData = new FormData();

            let name = document.getElementById("f_5211_edit").value;
            formData.set('name', name);
            let surname = document.getElementById("f_5212_edit").value;
            formData.set('surname', surname);
            let id_number = document.getElementById("f_522_edit").value;
            formData.set('id_number', id_number);
            let number = document.getElementById("f_524_edit").value;
            formData.set('number', number);
            let email = document.getElementById("f_523_edit").value;
            formData.set('email', email);

            // 5.2.5 THIS IS A SELECT THAT CAN BE MULTIPLE
            let role = [];
            let select = document.getElementById("f_525_edit").selectedOptions;
            for (var option of select) {
                role.push(option.value)
            }
            formData.set('role', role);

            let registration = document.getElementById("f_526_edit").value;
            formData.set('registration', registration);
            let registration_date = document.getElementById("f_527_edit").value; // THIS IS A DATE
            formData.set('registration_date', registration_date);
            let supervision = document.getElementById("f_528_edit").value; // THIS IS A SELECT
            formData.set('supervision', supervision);

            let expirience_y = document.getElementById("f_529_edit").value;
            let expirience_m = document.getElementById("f_529m_edit").value;
            let expirience = parseInt((expirience_y ? expirience_y * 12 : 0) + parseInt(expirience_m ? expirience_m : 0));
            formData.set('expirience', expirience);
            let sanction = document.getElementById("f_5210_edit").value;
            formData.set('sanction', sanction);

            let docs = [];
            docs.push(document.getElementById("f_52_111_edit").value);
            docs.push(document.getElementById("f_52_112_edit").value);
            docs.push(document.getElementById("f_52_113_edit").value);
            docs.push(document.getElementById("f_52_114_edit").value);
            docs.push(document.getElementById("f_52_115_edit").value);
            docs.push(document.getElementById("f_52_116_edit").value);
            formData.set('docs', docs.join());

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            FUNService.update_52(this.state.edit.id, formData)
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
                        this.setState({ edit: false });
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
        let delete_52 = (id) => {
            MySwal.fire({
                title: "ELIMINAR ESTE ITEM",
                text: "¿Esta seguro de eliminar de forma permanente este item?",
                icon: 'question',
                confirmButtonText: "ELIMINAR",
                showCancelButton: true,
                cancelButtonText: "CANCELAR"
            }).then(SweetAlertResult => {
                if (SweetAlertResult.isConfirmed) {
                    MySwal.fire({
                        title: swaMsg.title_wait,
                        text: swaMsg.text_wait,
                        icon: 'info',
                        showConfirmButton: false,
                    });
                    FUNService.delete_52(id)
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
                                this.setState({ edit: false });
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
            });
        }
        let setActive_52 = (item) => {
            formData = new FormData();
            let id = item.id
            let active = item.active;
            active = active == 1 ? 0 : 1;
            formData.set('active', active);
            FUNService.update_52(id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.close();
                        this.props.requestUpdate(currentItem.id)
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

        let manage_prof = () => {
            formData = new FormData();
            let _name = document.getElementById("f_5211").value;
            _name = _name.trim();
            let name = _name.substring(0, _name.indexOf(' '));
            let name_2 = _name.substring(_name.indexOf(' '), _name.length);
            formData.set('name', name.trim());
            formData.set('name_2', name_2.trim());

            let _surname = document.getElementById("f_5212").value;
            _surname = _surname.trim();
            let surname = _surname.substring(0, _surname.indexOf(' '));
            let surname_2 = _surname.substring(_surname.indexOf(' '), _surname.length);
            formData.set('surname', surname.trim());
            formData.set('surname_2', surname_2.trim());

            let id_number = document.getElementById("f_522").value;
            formData.set('id_number', id_number);
            let number = document.getElementById("f_524").value;
            formData.set('number', number);
            let email = document.getElementById("f_523").value;
            formData.set('email', email);

            let registration = document.getElementById("f_526").value;
            formData.set('registration', registration);
            let registration_date = document.getElementById("f_527").value; // THIS IS A DATE
            if (registration_date) formData.set('registration_date', registration_date);

            let role = '';
            let select = document.getElementById("f_525").selectedOptions;
            for (var option of select) {
                role = option.value;
            }

            let role_type = {
                'URBANIZADOR/PARCELADOR': 'oth',
                'URBANIZADOR O CONSTRUCTOR RESPONSABLE': 'oth',
                'DIRECTOR DE LA CONSTRUCCION': 'oth',
                'ARQUITECTO PROYECTISTA': 'arq',
                'INGENIERO CIVIL DISEÑADOR ESTRUCTURAL': 'eng',
                'DISEÑADOR DE ELEMENTOS NO ESTRUCTURALES': 'eng',
                'INGENIERO CIVIL GEOTECNISTA': 'eng',
                'INGENIERO TOPOGRAFO Y/O TOPÓGRAFO': 'eng',
                'REVISOR INDEPENDIENTE DE LOS DISEÑOS ESTRUCTURALES': 'eng',
                'OTROS PROFESIONALES ESPECIALISTAS': 'oth',
            };
            formData.set('title', role_type[role]);
            formData.set('active', 1);

            profesionalsService.createOrFind(formData)
                .then(data => {
                    return
                })
                .catch((err) => {
                    console.log(err)
                });;
        }

        let process_dataList = (inputText, dataList, _scope) => {
            profSearch(inputText);
            if (dataList) {
                let worker = JSON.parse(dataList);
                document.getElementById("f_5211" + _scope).value = worker.name.toUpperCase() + ' ' + worker.name_2.toUpperCase();
                document.getElementById("f_5212" + _scope).value = worker.surname.toUpperCase() + ' ' + worker.surname_2.toUpperCase();
                document.getElementById("f_522" + _scope).value = worker.id_number;
                document.getElementById("f_524" + _scope).value = worker.number;
                document.getElementById("f_523" + _scope).value = worker.email;
                document.getElementById("f_526" + _scope).value = worker.registration;
                document.getElementById("f_527" + _scope).value = worker.registration_date;
                document.getElementById("f_5210" + _scope).value = worker.sanction ? 1 : 0;

                if (worker.registration_date) {
                    _GET_YEARS_EXPERIENCE(_scope)
                }
            }
        }

        let profSearch = (val) => {
            if (val.length) {
                let _val = val.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                this.setState({ searchingP: true })

                profesionalsService.getByName(_val)
                    .then(response => {
                        if (response.data.length) {
                            this.setState({ dataListPrfesionals: response.data, searchingP: false })
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
            else this.setState({ dataListPrfesionals: [], searchingP: false })
        }

        return (<>
            <fieldset className="p-3">
                <legend className="my-2 px-3 text-uppercase Collapsible" id="funn_52">
                    <label className="app-p lead text-center fw-normal text-uppercase">5.2 Profesionales Responsables</label>
                </legend>

                <div class="form-check ms-5">
                    <input class="form-check-input" type="checkbox" onChange={(e) => this.setState({ new: e.target.checked })} />
                    <label class="form-check-label" for="flexCheckDefault">
                        Añadir nuevo Profesional
                    </label>
                </div>
                {this.state.new
                    ? <>
                        <form id="form_fun_52_new" onSubmit={new_52}>
                            {_COMPONENT_NEW()}
                            <div className="row mb-3 text-center">
                                <div className="col-12">
                                    <button className="btn btn-success my-3" ><i class="far fa-file-alt"></i> AÑADIR ITEM </button>
                                </div>
                            </div>
                        </form>
                    </>
                    : ""}


                {_CHILD_52_LIST()}
                <div className="border p-2 m-2">
                    <label className="me-2">LEYENDA:</label>
                    <label className="me-2"><a><i class="far fa-id-card fa-2x" style={{ "color": "DeepSkyBlue" }}></i></a> : C.C.,</label>
                    <label className="me-2"><a><i class="far fa-file-alt fa-2x" style={{ "color": "DarkOrchid" }}></i></a> : Matrícula,</label>
                    <label className="me-2"><a><i class="far fa-file-alt fa-2x" style={{ "color": "GoldenRod" }}></i></a> : Vigencia Matricular,</label>
                    <label className="me-2"><a><i class="far fa-file-alt fa-2x" style={{ "color": "LimeGreen" }}></i></a> : Hoja de vida</label>
                    <label className="me-2"><a><i class="far fa-file-alt fa-2x" style={{ "color": "tomato" }}></i></a> : Estudios de postgrado</label>
                     <label className="me-2"><a><i class="far fa-file-alt fa-2x" style={{ "color": "gray" }}></i></a> : Certificados</label>
                </div>
                {this.state.edit
                    ? <form id="form_fun_52_edit" onSubmit={edit_52}>
                        <h3 className="my-3 text-center">Actualizar Profesional</h3>
                        {_COMPONENT_EDIT()}
                        <div className="text-center">
                            <button className="btn btn-success my-3">
                                <i class="far fa-share-square"></i> GUARDAR CAMBIOS
                            </button>
                        </div>
                    </form>
                    : ""}
            </fieldset>
        </>);
    }
}

export default FUNN51;