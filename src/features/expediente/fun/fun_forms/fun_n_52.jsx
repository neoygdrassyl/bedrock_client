import { Fragment, useState, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import HTMLDatalist from '../../../../shared/components/HTMLDatalist';
import FUNService from '../../api/fun.service'
import DataTable from '@/shared/components/data-table-bridge';

import { dateParser, dateParser_timePassed, dateParser_yearsPassed } from '../../../../shared/config/customClasses/typeParse'
import VIZUALIZER from '../../../../shared/components/vizualizer.component';
const Divider = ({ children }) => <div className="dvl-divider text-center my-2"><span className="text-muted small">{children}</span></div>;
import profesionalsService from '../../../professionals/api/profesionals.service';
import FunUpdateSectionLegend from './components/FunUpdateSectionLegend.jsx';

const _GLOBAL_ID = import.meta.env.VITE_GLOBAL_ID;
// Positional order of fun_52.docs (5.2.11). The server owns this list: the edit form only displays it.
const EDIT_DOC_SELECT_IDS = ['f_52_111_edit', 'f_52_112_edit', 'f_52_113_edit', 'f_52_114_edit', 'f_52_115_edit', 'f_52_116_edit'];
import { Icon } from '@/shared/components/icon';
import { swalClose, swalConfirm, swalError, swalLoading, swalSuccess } from '@/shared/utils/swalAdapter';
import { formatYearsMonths, readSpecificExperience, todayIso, wholeMonthsBetween } from '@/shared/utils/specificExperience';

function FUNN51({ translation, swaMsg, globals, currentItem, currentVersion, requestUpdate }) {
    const [isNew, setIsNew] = useState(false);
    const [edit, setEdit] = useState(false);
    const [dataListPrfesionals, setDataListPrfesionals] = useState([]);
    const [searchingP, setSearchingP] = useState(false);

    useEffect(() => {
        if (edit !== false) {
            var _ITEM = edit;
            document.getElementById("f_5211_edit").value = _ITEM.name;
            document.getElementById("f_5212_edit").value = _ITEM.surname;
            document.getElementById("f_522_edit").value = _ITEM.id_number;
            document.getElementById("f_524_edit").value = _ITEM.number;
            document.getElementById("f_523_edit").value = _ITEM.email;
            document.getElementById("f_526_edit").value = _ITEM.registration;
            document.getElementById("f_527_edit").value = _ITEM.registration_date;
            document.getElementById("f_528_edit").value = _ITEM.supervision;
            document.getElementById("f_5210_edit").value = _ITEM.sanction ? 1 : 0;

            // 5.2.9 is shown only when it was saved as specific experience; an older value was the general one.
            document.getElementById("f_529_edit").value = '';
            document.getElementById("f_529m_edit").value = '';
            document.getElementById("f_529_prev_edit").textContent = '';
            if (_ITEM.expirience_specific) {
                document.getElementById("f_529_edit").value = Math.trunc(_ITEM.expirience / 12);
                document.getElementById("f_529m_edit").value = _ITEM.expirience % 12;
            } else if (_ITEM.expirience) {
                document.getElementById("f_529_prev_edit").textContent = `Valor anterior: ${formatYearsMonths(_ITEM.expirience)} (no cuenta como experiencia específica).`;
            }
            _SHOW_GENERAL_EXPERIENCE('_edit');

            let array = _ITEM.role.split(',');
            let select = document.getElementById("f_525_edit");
            for (var options of select) {
                if (array.includes(options.value)) {
                    options.selected = true;
                }
            }

            // Read-only display: a missing position stays blank instead of keeping a previous row's value.
            const _array = (_ITEM.docs || '').split(',');
            EDIT_DOC_SELECT_IDS.forEach((selectId, index) => {
                document.getElementById(selectId).value = _array[index] ?? '';
            });

        }
    }, [edit]);

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
            return _LIST.map((item, index) => (
                <option key={`fun6-${item.id ?? index}`} value={item.id}>{item.description}</option>
            ));
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

            _COMPONENT.push(<Fragment key="document-0">{_array[0] > 0
                ?
                <VIZUALIZER url={_FIND_6(_array[0]).path + "/" + _FIND_6(_array[0]).filename} apipath={'/files/'}
                    icon={'IdCard'} color={'DeepSkyBlue'} />
                : ""}</Fragment>)

            _COMPONENT.push(<Fragment key="document-1">{_array[1] > 0
                ?
                <VIZUALIZER url={_FIND_6(_array[1]).path + "/" + _FIND_6(_array[1]).filename} apipath={'/files/'}
                    icon={'FileText'} color={'DarkOrchid'} />
                : ""}</Fragment>)

            _COMPONENT.push(<Fragment key="document-2">{_array[2] > 0
                ?
                <VIZUALIZER url={_FIND_6(_array[2]).path + "/" + _FIND_6(_array[2]).filename} apipath={'/files/'}
                    icon={'FileText'} color={'GoldenRod'} />
                : ""}</Fragment>)

            _COMPONENT.push(<Fragment key="document-3">{_array[3] > 0
                ?
                <VIZUALIZER url={_FIND_6(_array[3]).path + "/" + _FIND_6(_array[3]).filename} apipath={'/files/'}
                    icon={'FileText'} color={'LimeGreen'} />
                : ""}</Fragment>)

            _COMPONENT.push(<Fragment key="document-4">{_array[4] > 0
                ?
                <VIZUALIZER url={_FIND_6(_array[4]).path + "/" + _FIND_6(_array[4]).filename} apipath={'/files/'}
                    icon={'FileText'} color={'tomato'} />
                : ""}</Fragment>)

            _COMPONENT.push(<Fragment key="document-5">{_array[5] > 0
                ?
                <VIZUALIZER url={_FIND_6(_array[5]).path + "/" + _FIND_6(_array[5]).filename} apipath={'/files/'}
                    icon={'FileText'} color={'gray'} />
                : ""}</Fragment>)

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
        // 5.2.9 is no longer filled from 5.2.7: 5.2.7 only tells the general experience, the limit of the specific one.
        let _SHOW_GENERAL_EXPERIENCE = (id) => {
            let general = wholeMonthsBetween(document.getElementById('f_527' + id).value, todayIso());
            document.getElementById('f_529_general' + id).textContent = general === null
                ? 'Indique 5.2.7 para conocer la experiencia general.'
                : `Experiencia general (desde 5.2.7): ${formatYearsMonths(general)}. La específica no puede superarla.`;
        }
        // Adds 5.2.9 to the request as specific experience, or returns the problem to show. An empty 5.2.9 leaves the
        // stored value alone and, when it was specific experience, stops counting it as such.
        let _SET_SPECIFIC_EXPERIENCE = (id, formData, wasSpecific) => {
            let read = readSpecificExperience(
                document.getElementById('f_529' + id).value,
                document.getElementById('f_529m' + id).value,
                document.getElementById('f_527' + id).value,
            );
            if (read.problem) return read.problem;
            if (read.empty) {
                if (wasSpecific) formData.set('expirience_specific', 'false');
                return null;
            }
            formData.set('expirience', read.months);
            formData.set('expirience_specific', 'true');
            return null;
        }

        // COMPONENTS JSX
        let _COMPONENT_NEW = () => {
            return <>
                {_PROFESIONAL_SEARCHER('')}
                <div className="row mb-3">
                    <div className="col-6">
                        <label>5.2.1 Nombre</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="user" size={16} />
                            </span>
                            <input type="text" className="form-control" id="f_5211" />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.2.1 Apellido(s)</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="user" size={16} />
                            </span>
                            <input type="text" className="form-control" id="f_5212" />
                        </div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-6">
                        <label>5.2.2 Cédula</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="id-card" size={16} />
                            </span>
                            <input type="text" className="form-control" id="f_522" onBlur={(e) => { if (e.currentTarget === e.target) _REGEX_IDNUMBER(e) }} />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.2.3 Correo Electrónico</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="envelope" size={16} />
                            </span>
                            <input type="text" className="form-control" id="f_523" />
                        </div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-12">
                        <label>5.2.5 Rol que Desempeña</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="user-graduate" size={16} />
                            </span>
                            <select className="form-select" id="f_525">
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
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="phone-alt" size={16} />
                            </span>
                            <input type="text" className="form-control" id="f_524" />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.2.6 No. Matrícula Profesional</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="file-contract" size={16} />
                            </span>
                            <input type="text" className="form-control" id="f_526" />
                        </div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-6">
                        <label>5.2.7 Fecha expedición Matrícula</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="calendar-alt" size={16} />
                            </span>
                            <input type="date" className="form-control" max="2100-01-01" id="f_527" onChange={() => _SHOW_GENERAL_EXPERIENCE('')} />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.2.8 ¿Sancionado?</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="check-square" size={16} />
                            </span>
                            <select className="form-select" id="f_5210">
                                <option value="0">NO</option>
                                <option value="1">SI</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-6">
                        <label>5.2.9 Experiencia específica en el rol (Años y meses)</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                Años:
                            </span>
                            <input type="text" inputMode="numeric" maxLength={2} id="f_529" placeholder="Años" className="form-control" />
                            <span className="input-group-text bg-primary text-primary-foreground ms-1">
                                Meses:
                            </span>
                            <input type="text" inputMode="numeric" maxLength={2} id="f_529m" placeholder="Meses" className="form-control" />
                        </div>
                        <small className="text-muted d-block" id="f_529_general">Indique 5.2.7 para conocer la experiencia general.</small>
                    </div>
                    <div className="col-6">
                        <label>5.2.10 Supervisión técnica</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="eye" size={16} />
                            </span>
                            <select className="form-select" id="f_528">
                                <option>N/A</option>
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
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="file" size={16} />
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
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="file" size={16} />
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
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="file" size={16} />
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
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="file" size={16} />
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
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="file" size={16} />
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
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="file" size={16} />
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
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="user" size={16} />
                            </span>
                            <input type="text" className="form-control" id="f_5211_edit" />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.2.1 Apellido(s)</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="user" size={16} />
                            </span>
                            <input type="text" className="form-control" id="f_5212_edit" />
                        </div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-6">
                        <label>5.2.2 Cédula</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="id-card" size={16} />
                            </span>
                            <input type="text" className="form-control" id="f_522_edit" onBlur={(e) => { if (e.currentTarget === e.target) _REGEX_IDNUMBER(e) }} />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.2.3 Correo Eletrónico</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="envelope" size={16} />
                            </span>
                            <input type="text" className="form-control" id="f_523_edit" />
                        </div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-12">
                        <label>5.2.5 Rol que Desempeña</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="user-graduate" size={16} />
                            </span>
                            <select className="form-select" id="f_525_edit">
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
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="phone-alt" size={16} />
                            </span>
                            <input type="text" className="form-control" id="f_524_edit" />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.2.6 No. Matricula Profesional</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="file-contract" size={16} />
                            </span>
                            <input type="text" className="form-control" id="f_526_edit" />
                        </div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-6">
                        <label>5.2.7 Fecha expedición Matrícula</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="calendar-alt" size={16} />
                            </span>
                            <input type="date" className="form-control" max="2100-01-01" id="f_527_edit" onChange={() => _SHOW_GENERAL_EXPERIENCE('_edit')} />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.2.8 ¿Sancionado?</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="check-square" size={16} />
                            </span>
                            <select className="form-select" id="f_5210_edit">
                                <option value="0">NO</option>
                                <option value="1">SI</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-6">
                        <label>5.2.9 Experiencia específica en el rol (Años y meses)</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                Años:
                            </span>
                            <input type="text" inputMode="numeric" maxLength={2} id="f_529_edit" placeholder="Años" className="form-control" />
                            <span className="input-group-text bg-primary text-primary-foreground ms-1">
                                Meses:
                            </span>
                            <input type="text" inputMode="numeric" maxLength={2} id="f_529m_edit" placeholder="Meses" className="form-control" />
                        </div>
                        <small className="text-muted d-block" id="f_529_general_edit">Indique 5.2.7 para conocer la experiencia general.</small>
                        <small className="text-muted d-block" id="f_529_prev_edit"></small>
                    </div>
                    <div className="col-6">
                        <label>5.2.10 Supervisión técnica</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="eye" size={16} />
                            </span>
                            <select className="form-select" id="f_528_edit">
                                <option>N/A</option>
                                <option>SI</option>
                                <option>NO</option>
                            </select>
                        </div>
                    </div>
                </div>

                <Divider>DOCUMENTOS</Divider>
                <p className="text-muted small text-center mb-2">Los documentos relacionados no se pueden modificar desde esta edición.</p>

                <div className="row mb-2">
                    <div className="col-6">
                        <label>5.2.11.1 Hoja de Vida</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="file" size={16} />
                            </span>
                            <select className='form-select' id="f_52_114_edit" disabled>
                                <option value="-1">APORTADO FISICAMENTE</option>
                                <option value="0">SIN DOCUMENTO</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.2.11.2 Relacionar Documento: Documento de Identidad</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="file" size={16} />
                            </span>
                            <select className='form-select' id="f_52_111_edit" disabled>
                                <option value="-1">APORTADO FISICAMENTE</option>
                                <option value="0">SIN DOCUMENTO</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.2.11.3 Relacionar Documento: Matrícula</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="file" size={16} />
                            </span>
                            <select className='form-select' id="f_52_112_edit" disabled>
                                <option value="-1">APORTADO FISICAMENTE</option>
                                <option value="0">SIN DOCUMENTO</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.2.11.4 Relacionar Documento: Vigencia Matricular</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="file" size={16} />
                            </span>
                            <select className='form-select' id="f_52_113_edit" disabled>
                                <option value="-1">APORTADO FISICAMENTE</option>
                                <option value="0">SIN DOCUMENTO</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.2.11.5 Relacionar Documento: Estudios de postgrado</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="file" size={16} />
                            </span>
                            <select className='form-select' id="f_52_115_edit" disabled>
                                <option value="-1">APORTADO FISICAMENTE</option>
                                <option value="0">SIN DOCUMENTO</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.2.11.6 Relacionar Documento: Certificados</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-primary text-primary-foreground">
                                <Icon name="file" size={16} />
                            </span>
                            <select className='form-select' id="f_52_116_edit" disabled>
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
                    name: 'NOMBRE',
                    selector: row => row.surname, // FIX: react-data-table v7→v8
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: '200px',
                    cell: row => <span className="text-sm">{row.name + " " + row.surname}</span>
                },
                {
                    name: 'CC/NIT',
                    selector: row => row.id_number, // FIX: react-data-table v7→v8
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: '150px',
                    cell: row => <span className="text-sm">{row.id_number}</span>
                },
                {
                    name: 'TELEFONO/ CELULAR',
                    selector: row => row.number, // FIX: react-data-table v7→v8
                    center: true,
                    minWidth: '150px',
                    cell: row => <span className="text-sm">{row.number}</span>
                },
                {
                    name: 'CORREO',
                    selector: row => row.email, // FIX: react-data-table v7→v8
                    center: true,
                    minWidth: '150px',
                    cell: row => <span className="text-sm">{row.email}</span>
                },
                {
                    name: 'PROFESION',
                    selector: row => row.role, // FIX: react-data-table v7→v8
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: '200px',
                    cell: row => <span className="text-sm">{row.role}</span>
                },
                {
                    name: 'MATRICULA',
                    selector: row => row.registration, // FIX: react-data-table v7→v8
                    center: true,
                    minWidth: '150px',
                    cell: row => <span className="text-sm">{row.registration}</span>
                },
                {
                    name: 'EXP. MATRICULA',
                    selector: row => row.registration_date, // FIX: react-data-table v7→v8
                    center: true,
                    minWidth: '150px',
                    cell: row => <span className="text-sm">{dateParser(row.registration_date)}</span>
                },
                {
                    name: 'EXPERIENCIA',
                    selector: row => row.expirience, // FIX: react-data-table v7→v8
                    center: true,
                    minWidth: '150px',
                    cell: row => <label>{Math.trunc(row.expirience / 12)} año(s)</label>
                },
                {
                    name: '¿SANCIONADO?',
                    selector: row => row.sanction, // FIX: react-data-table v7→v8
                    center: true,
                    cell: row => <span className="text-sm">{row.sanction ? <label className="text-danger fw-bold">SI</label> : "NO"}</span>
                },
                {
                    name: 'SUPERVISION',
                    selector: row => row.supervision, // FIX: react-data-table v7→v8
                    center: true,
                    cell: row => <span className="text-sm">{row.supervision}</span>
                },
                {
                    name: 'DOCUMENTOS',
                    button: true,
                    center: true,
                    minWidth: '190px',
                    cell: row => <>{_GET_DOCS_BTNS(row.docs)}</>
                },
                {
                    name: 'ESTADO',
                    button: true,
                    compact: true,
                    cell: row =>
                        <div className="form-check form-switch">
                            <input className="form-check-input" type="checkbox" defaultChecked={row.active == 1 ? true : false} onChange={() => setActive_52(row)} />
                        </div>
                },
                {
                    name: 'ACCION',
                    button: true,
                    compact: true,
                    cell: row => <>
                        <span title="Modificar Item">{/* FIX: button anidado - replaced MDBBtn with span */}
                            <span 
                                role="button" 
                                tabIndex={0} 
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground m-0 p-2" 
                                onClick={() => setEdit(row)}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setEdit(row); }}
                                style={{cursor: 'pointer'}}>
                                <Icon name="edit" size={16} />
                            </span></span>
                        <span title="Eliminar Item">{/* FIX: button anidado - replaced MDBBtn with span */}
                            <span 
                                role="button" 
                                tabIndex={0} 
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 m-0 p-2" 
                                onClick={() => delete_52(row.id)}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') delete_52(row.id); }}
                                style={{cursor: 'pointer'}}>
                                <Icon name="trash-alt" size={16} />
                            </span></span>

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
                        <label>Busqueda de Profesional. {searchingP ? <label className='fw-bold'>Buscando...</label> : ''}</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-success text-white">
                                <Icon name="search" size={16} />
                            </span>
                            <HTMLDatalist
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

            let experienceProblem = _SET_SPECIFIC_EXPERIENCE('', formData, false);
            if (experienceProblem) return swalError({ title: '5.2.9 Experiencia específica', text: experienceProblem });
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

            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            FUNService.create_fun52(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                        requestUpdate(currentItem.id);
                        document.getElementById('form_fun_52_new').reset();
                        _SHOW_GENERAL_EXPERIENCE('');
                    } else {
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                    }
                })
                .catch(e => {
                    console.log(e);
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
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

            let experienceProblem = _SET_SPECIFIC_EXPERIENCE('_edit', formData, Boolean(edit.expirience_specific));
            if (experienceProblem) return swalError({ title: '5.2.9 Experiencia específica', text: experienceProblem });
            let sanction = document.getElementById("f_5210_edit").value;
            formData.set('sanction', sanction);
            // docs (5.2.11) is server-owned and read-only on update: it is not sent.

            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            FUNService.update_52(edit.id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                        requestUpdate(currentItem.id);
                        setEdit(false);
                    } else {
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                    }
                })
                .catch(e => {
                    console.log(e);
                    swalError({ title: swaMsg.generic_eror_title, text: e.response?.data?.message || swaMsg.generic_error_text });
                });
        }
        let delete_52 = (id) => {
            swalConfirm({
                title: "ELIMINAR ESTE ITEM",
                text: "¿Esta seguro de eliminar de forma permanente este item?",
                icon: 'question',
                confirmButtonText: "ELIMINAR",
            }).then(SweetAlertResult => {
                if (SweetAlertResult.isConfirmed) {
                    swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
                    FUNService.delete_52(id)
                        .then(response => {
                            if (response.data === 'OK') {
                                swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                                requestUpdate(currentItem.id);
                                setEdit(false);
                            } else {
                                swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                            }
                        })
                        .catch(e => {
                            console.log(e);
                            swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
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
                        swalClose();
                        requestUpdate(currentItem.id)
                    } else {
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                    }
                })
                .catch(e => {
                    console.log(e);
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
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

                _SHOW_GENERAL_EXPERIENCE(_scope)
            }
        }

        let profSearch = (val) => {
            if (val.length) {
                let _val = val.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                setSearchingP(true)

                profesionalsService.getByName(_val)
                    .then(response => {
                        if (response.data.length) {
                            setDataListPrfesionals(response.data);
                            setSearchingP(false);
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                    });
            }
            else { setDataListPrfesionals([]); setSearchingP(false); }
        }

        return (<>
            <fieldset className="p-3">
                <FunUpdateSectionLegend id="funn_52" step="5.2">Profesionales Responsables</FunUpdateSectionLegend>

                <div className="form-check ms-5">
                    <input className="form-check-input" type="checkbox" onChange={(e) => setIsNew(e.target.checked)} />
                    <label className="form-check-label" htmlFor="flexCheckDefault">
                        Añadir nuevo Profesional
                    </label>
                </div>
                {isNew
                    ? <>
                        <form id="form_fun_52_new" onSubmit={new_52}>
                            {_COMPONENT_NEW()}
                            <div className="row mb-3 text-center">
                                <div className="col-12">
                                    <Button size="sm" className="my-3"><Icon name="file-alt" size={16} /> AÑADIR ITEM </Button>
                                </div>
                            </div>
                        </form>
                    </>
                    : ""}

                {_CHILD_52_LIST()}
                <div className="border p-2 m-2">
                    <label className="me-2">LEYENDA:</label>
                    <label className="me-2"><a><Icon name="id-card" size={16} style={{ "color": "DeepSkyBlue" }} /></a> : C.C.,</label>
                    <label className="me-2"><a><Icon name="file-alt" size={16} style={{ "color": "DarkOrchid" }} /></a> : Matrícula,</label>
                    <label className="me-2"><a><Icon name="file-alt" size={16} style={{ "color": "GoldenRod" }} /></a> : Vigencia Matricular,</label>
                    <label className="me-2"><a><Icon name="file-alt" size={16} style={{ "color": "LimeGreen" }} /></a> : Hoja de vida</label>
                    <label className="me-2"><a><Icon name="file-alt" size={16} style={{ "color": "tomato" }} /></a> : Estudios de postgrado</label>
                     <label className="me-2"><a><Icon name="file-alt" size={16} style={{ "color": "gray" }} /></a> : Certificados</label>
                </div>
                {edit
                    ? <form id="form_fun_52_edit" onSubmit={edit_52}>
                        <h3 className="my-3 text-center">Actualizar Profesional</h3>
                        {_COMPONENT_EDIT()}
                        <div className="text-center">
                            <Button size="sm" className="my-3">
                                <Icon name="share-square" size={16} /> GUARDAR CAMBIOS
                            </Button>
                        </div>
                    </form>
                    : ""}
            </fieldset>
        </>);
}

export default FUNN51;
