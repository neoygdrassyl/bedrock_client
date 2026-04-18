import { useState, useEffect } from 'react';
import FUNService from '../../../services/fun.service'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import DataTable from '@/components/data-table-bridge';

import VIZUALIZER from '../../../components/vizualizer.component';
import { Icon } from '@/components/icon';

const MySwal = withReactContent(Swal);
function FUNN51({ translation, swaMsg, globals, currentItem, currentVersion, requestUpdate }) {
    const [isNew, setIsNew] = useState(false);
    const [edit, setEdit] = useState(false);
    const [legal, setLegal] = useState(false);

    useEffect(() => {
        if (edit !== false) {
            var _ITEM = edit;
            document.getElementById("f_5111_edit").value = _ITEM.name;
            document.getElementById("f_5112_edit").value = _ITEM.surname;
            document.getElementById("f_512_edit").value = _ITEM.id_number;
            document.getElementById("f_513_edit").value = _ITEM.email;
            document.getElementById("f_514_edit").value = _ITEM.nunber;
            document.getElementById("f_515_edit").value = _ITEM.role;
            let docs = _ITEM.docs;
            if (!docs) docs = "";
            document.getElementById("f_51_doc1_edit").value = docs.split(',')[0] ? docs.split(',')[0] : 0;
            document.getElementById("f_51_doc2_edit").value = docs.split(',')[1] ? docs.split(',')[1] : 0;

            let _type = _ITEM.type;
            document.getElementById("f_51_type_edit").value = _type
            if (_type == 'PERSONA JURIDICA') {
                document.getElementById('f_51_rep_name_edit').disabled = false;
                document.getElementById('f_51_rep_idnumber_edit').disabled = false;
            }
            else {
                document.getElementById('f_51_rep_name_edit').disabled = true;
                document.getElementById('f_51_rep_idnumber_edit').disabled = true;
            }
            if (document.getElementById("f_51_rep_name_edit")) document.getElementById("f_51_rep_name_edit").value = _ITEM.rep_name
            if (document.getElementById("f_51_rep_idnumber_edit")) document.getElementById("f_51_rep_idnumber_edit").value = _ITEM.rep_id_number

        }
    }, [edit]);

        var formData = new FormData();

        // DATA GETTERS
        let _SET_CHILD_51 = () => {
            var _CHILD = currentItem.fun_51s;
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

        // DATA COVERTERS
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
                    icon={'far fa-id-card fa-2x me-1'} color={'DeepSkyBlue'} />
                : ""}</>)

            _COMPONENT.push(<>{_array[1] > 0
                ? <VIZUALIZER url={_FIND_6(_array[1]).path + "/" + _FIND_6(_array[1]).filename} apipath={'/files/'}
                    icon={'far fa-id-badge fa-2x me-1'} color={'DarkOrchid'} />
                : ""}</>)

            return <>{_COMPONENT}</>
        }
        let _REGEX_IDNUMBER = (e) => {
            let regex = /^[0-9]+$/i;
            let test = regex.test(e.target.value);
            if (test) {
                var _value = Number(e.target.value).toLocaleString();
                _value = _value.replaceAll(',', '.');
                document.getElementById(e.target.id).value = _value;
            }
        }

        // COMPONENTS JSX
        let _COMPONENT_NEW = () => {
            return <>
                <div className="row mb-1">
                    <div className="col-6">
                        <label>5.1.0 Tipo de Persona</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-info text-white">
                                <Icon name="user" size={16} />
                            </span>
                            <select className='form-select' id="f_51_type"
                                onChange={(e) => {
                                    if (e.target.value == 'PERSONA JURIDICA') {
                                        document.getElementById('f_51_rep_name').disabled = false;
                                        document.getElementById('f_51_rep_idnumber').disabled = false;
                                        document.getElementById('f_51_doc2').disabled = false;
                                    } else {
                                        document.getElementById('f_51_rep_name').disabled = true;
                                        document.getElementById('f_51_rep_idnumber').disabled = true;
                                        document.getElementById('f_51_doc2').disabled = true;
                                    }
                                }}>
                                <option>PERSONA NATURAL</option>
                                <option>PERSONA JURIDICA</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-6">
                        <label>5.1.0.1 Nombre y Apellidos (Representante Legal)</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-info text-white">
                                <Icon name="user" size={16} />
                            </span>
                            <input type="text" className="form-control" id="f_51_rep_name" disabled />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.1.0.2 Cédula (Representante Legal)</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-info text-white">
                                <Icon name="user" size={16} />
                            </span>
                            <input type="text" className="form-control" id="f_51_rep_idnumber" disabled
                                onBlur={(e) => { if (e.currentTarget === e.target) _REGEX_IDNUMBER(e) }} />
                        </div>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-6">
                        <label>5.1.1 Nombre</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-info text-white">
                                <Icon name="user" size={16} />
                            </span>
                            <input type="text" className="form-control" id="f_5111" />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.1.1 Apellido(s)</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-info text-white">
                                <Icon name="user" size={16} />
                            </span>
                            <input type="text" className="form-control" id="f_5112" />
                        </div>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-6">
                        <label>5.1.2 CC o NIT</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-info text-white">
                                <Icon name="id-card" size={16} />
                            </span>
                            <input type="text" className="form-control" id="f_512" onBlur={(e) => { if (e.currentTarget === e.target) _REGEX_IDNUMBER(e) }} />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.1.3 Correo Electrónico</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-info text-white">
                                <Icon name="envelope" size={16} />
                            </span>
                            <input type="text" className="form-control" id="f_513" />
                        </div>
                    </div>
                </div>
                <div className="row mb-1">
                    <div className="col-6">
                        <label>5.1.4 Teléfono de Contacto</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-info text-white">
                                <Icon name="phone-alt" size={16} />
                            </span>
                            <input type="text" className="form-control" id="f_514" />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.1.5 Tipo de Titular</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-info text-white">
                                <Icon name="phone-alt" size={16} />
                            </span>
                            <select className='form-select' id="f_515">
                                <option>PROPIETARIO</option>
                                <option>PROPIETARIO COMUNEROS</option>
                                <option>PROPIETARIO FIDUCIARIA</option>
                                <option>FIDEICOMITENTE</option>
                                <option>USUFRUCTUARIO</option>
                                <option>NACION U OTRA ENTIDAD</option>
                                <option>POSEEDOR</option>
                                <option>OTRO</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="row mb-1">
                    <div className="col-6">
                        <label>5.1.6 Relacionar Documento: Documento de Identidad</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-info text-white">
                                <Icon name="file" size={16} />
                            </span>
                            <select className='form-select' id="f_51_doc1">
                                <option value="-1">APORTADO FISICAMENTE</option>
                                <option value="0">SIN DOCUMENTO</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.1.7 Relacionar Documento: Certificado de Existencia y Representación Legal </label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-info text-white">
                                <Icon name="file" size={16} />
                            </span>
                            <select className='form-select' id="f_51_doc2" disabled defaultValue={0}>
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
                <div className="row mb-1">
                    <div className="col-6">
                        <label>5.1.0 Tipo de Personar</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-info text-white">
                                <Icon name="user" size={16} />
                            </span>
                            <select className='form-select' id="f_51_type_edit"
                                onChange={(e) => {
                                    if (e.target.value == 'PERSONA JURIDICA') {
                                        document.getElementById('f_51_rep_name_edit').disabled = false;
                                        document.getElementById('f_51_rep_idnumber_edit').disabled = false;
                                        document.getElementById('f_51_doc2_edit').disabled = false;
                                    }
                                    else {
                                        document.getElementById('f_51_rep_name_edit').disabled = true;
                                        document.getElementById('f_51_rep_idnumber_edit').disabled = true;
                                        document.getElementById('f_51_doc2_edit').disabled = true;
                                    }
                                }}>
                                <option>PERSONA NATURAL</option>
                                <option>PERSONA JURIDICA</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-6">
                        <label>5.1.0.1 Nombre y Apellidos (Representante Legal)</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-info text-white">
                                <Icon name="user" size={16} />
                            </span>
                            <input type="text" className="form-control" id="f_51_rep_name_edit" />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.1.0.2 Cédula (Representante Lega)</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-info text-white">
                                <Icon name="user" size={16} />
                            </span>
                            <input type="text" className="form-control" id="f_51_rep_idnumber_edit" onBlur={(e) => { if (e.currentTarget === e.target) _REGEX_IDNUMBER(e) }} />
                        </div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-6">
                        <label>5.1.1 Nombre</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-info text-white">
                                <Icon name="user" size={16} />
                            </span>
                            <input type="text" className="form-control" id="f_5111_edit" />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.1.1 Apellido(s)</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-info text-white">
                                <Icon name="user" size={16} />
                            </span>
                            <input type="text" className="form-control" id="f_5112_edit" />
                        </div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-6">
                        <label>5.1.2 CC o NIT</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-info text-white">
                                <Icon name="id-card" size={16} />
                            </span>
                            <input type="text" className="form-control" id="f_512_edit" onBlur={(e) => { if (e.currentTarget === e.target) _REGEX_IDNUMBER(e) }} />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.1.3 Correo Electrónico</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-info text-white">
                                <Icon name="envelope" size={16} />
                            </span>
                            <input type="text" className="form-control" id="f_513_edit" />
                        </div>
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-6">
                        <label>5.1.4 Teléfono  de Contacto</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-info text-white">
                                <Icon name="phone-alt" size={16} />
                            </span>
                            <input type="text" className="form-control" id="f_514_edit" />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.1.5 Tipo de Titular</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-info text-white">
                                <Icon name="phone-alt" size={16} />
                            </span>
                            <select className='form-select' id="f_515_edit">
                                <option>PROPIETARIO</option>
                                <option>PROPIETARIO COMUNEROS</option>
                                <option>PROPIETARIO FIDUCIARIA</option>
                                <option>FIDEICOMITENTE</option>
                                <option>USUFRUCTUARIO</option>
                                <option>NACION U OTRA ENTIDAD</option>
                                <option>POSEEDOR</option>
                                <option>OTRO</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-6">
                        <label>5.1.6 Relacionar Documento: Documento de Identidad</label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-info text-white">
                                <Icon name="file" size={16} />
                            </span>
                            <select className='form-select' id="f_51_doc1_edit">
                                <option value="-1">APORTADO FISICAMENTE</option>
                                <option value="0">SIN DOCUMENTO</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.1.7 Relacionar Documento: Certificado de Existencia y Representación Legal </label>
                        <div className="input-group my-1">
                            <span className="input-group-text bg-info text-white">
                                <Icon name="file" size={16} />
                            </span>
                            <select className='form-select' id="f_51_doc2_edit" disabled>
                                <option value="-1">APORTADO FISICAMENTE</option>
                                <option value="0">SIN DOCUMENTO</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div>
                    </div>
                </div>
            </>
        }
        let _CHILD_51_LIST = () => {
            let _LIST = _SET_CHILD_51();
            const columns_51 = [
                {
                    name: 'TIPO PERSONA',
                    selector: row => row.type, // FIX: react-data-table v7→v8
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: '150px',
                    cell: row => <span className="text-sm">{row.type}</span>
                },
                {
                    name: 'NOMBRE',
                    selector: row => row.name, // FIX: react-data-table v7→v8
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
                    cell: row => <span className="text-sm">{row.id_number}</span>
                },
                {
                    name: 'NOMBRE REP. LEGAL',
                    selector: row => row.rep_name, // FIX: react-data-table v7→v8
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: '200px',
                    cell: row => <span className="text-sm">{row.rep_name}</span>
                },
                {
                    name: 'C.C. REP. LEGAL',
                    selector: row => row.rep_id_number, // FIX: react-data-table v7→v8
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <span className="text-sm">{row.rep_id_number}</span>
                },
                {
                    name: 'TELEFONO/ CELULAR',
                    selector: row => row.nunber, // FIX: react-data-table v7→v8
                    center: true,
                    cell: row => <label >{row.nunber}</label>
                },
                {
                    name: 'CORREO',
                    selector: row => row.email, // FIX: react-data-table v7→v8
                    center: true,
                    cell: row => <span className="text-sm">{row.email}</span>
                },
                {
                    name: 'TIPO TITULAR',
                    selector: row => row.role, // FIX: react-data-table v7→v8
                    center: true,
                    minWidth: '200px',
                    cell: row => <span className="text-sm">{row.role}</span>
                },
                {
                    name: 'DOCUMENTOS',
                    button: true,
                    center: true,
                    center: true,
                    cell: row => <> {_GET_DOCS_BTNS(row.docs)}</>
                },
                {
                    name: 'ESTADO',
                    button: true,
                    cell: row =>
                        <div className="form-check form-switch">
                            <input className="form-check-input" type="checkbox" defaultChecked={row.active == 1 ? true : false} onChange={() => setActive_51(row)} />
                        </div>
                },
                {
                    name: 'ACCION',
                    button: true,
                    minWidth: '120px',
                    cell: row => <>
                        <span title="Modificar Item">{/* FIX: button anidado - replaced MDBBtn with span */}
                            <span 
                                role="button" 
                                tabIndex={0} 
                                className="btn btn-secondary btn-sm m-0 p-2 shadow-none" 
                                onClick={() => setEdit(row)}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setEdit(row); }}
                                style={{cursor: 'pointer'}}>
                                <Icon name="edit" size={16} />
                            </span></span>
                        <span title="Eliminar Item">{/* FIX: button anidado - replaced MDBBtn with span */}
                            <span 
                                role="button" 
                                tabIndex={0} 
                                className="btn btn-danger btn-sm m-0 p-2 shadow-none" 
                                onClick={() => delete_51(row.id)}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') delete_51(row.id); }}
                                style={{cursor: 'pointer'}}>
                                <Icon name="trash-alt" size={16} />
                            </span></span>

                    </>
                },
            ]
            return <DataTable
                noDataComponent="No hay Items"
                striped="true"
                columns={columns_51}
                data={_LIST}
                highlightOnHover
                className="data-table-component"
                noHeader
            />
        }

        // FUNCTIONS AND APIS
        let new_51 = (e) => {
            e.preventDefault();
            let fun0Id = null;
            formData = new FormData();
            fun0Id = currentItem.id;
            formData.set('fun0Id', fun0Id);

            let type = document.getElementById("f_51_type").value;
            formData.set('type', type);
            if (type == "PERSONA JURIDICA") {
                let rep_name = document.getElementById("f_51_rep_name").value;
                formData.set('rep_name', rep_name);
                let rep_id_number = document.getElementById("f_51_rep_idnumber").value;
                formData.set('rep_id_number', rep_id_number);
            }

            let name = document.getElementById("f_5111").value;
            formData.set('name', name);
            let surname = document.getElementById("f_5112").value;
            formData.set('surname', surname);
            let id_number = document.getElementById("f_512").value;
            formData.set('id_number', id_number);
            let email = document.getElementById("f_513").value;
            formData.set('email', email);
            let nunber = document.getElementById("f_514").value;
            formData.set('nunber', nunber);
            let role = document.getElementById("f_515").value;
            formData.set('role', role);

            let docs = [];
            docs.push(document.getElementById("f_51_doc1").value);
            docs.push(document.getElementById("f_51_doc2").value);
            formData.set('docs', docs.join());

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            FUNService.create_fun51(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        requestUpdate(currentItem.id);
                        document.getElementById('form_fun_51_new').reset();
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
        let edit_51 = (e) => {
            e.preventDefault();
            formData = new FormData();

            let type = document.getElementById("f_51_type_edit").value;
            formData.set('type', type);
            if (type == "PERSONA JURIDICA") {
                let rep_name = document.getElementById("f_51_rep_name_edit").value;
                formData.set('rep_name', rep_name);
                let rep_id_number = document.getElementById("f_51_rep_idnumber_edit").value;
                formData.set('rep_id_number', rep_id_number);
            } else {
                formData.set('rep_name', "");
                formData.set('rep_id_number', "");
            }

            let name = document.getElementById("f_5111_edit").value;
            formData.set('name', name);
            let surname = document.getElementById("f_5112_edit").value;
            formData.set('surname', surname);
            let id_number = document.getElementById("f_512_edit").value;
            formData.set('id_number', id_number);
            let email = document.getElementById("f_513_edit").value;
            formData.set('email', email);
            let nunber = document.getElementById("f_514_edit").value;
            formData.set('nunber', nunber);
            let role = document.getElementById("f_515_edit").value;
            formData.set('role', role);

            let docs = [];
            docs.push(document.getElementById("f_51_doc1_edit").value);
            docs.push(document.getElementById("f_51_doc2_edit").value);
            formData.set('docs', docs.join());

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            FUNService.update_51(edit.id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        requestUpdate(currentItem.id);
                        document.getElementById('form_fun_51_edit').reset();
                        setEdit(false);
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
        let delete_51 = (id) => {
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
                    FUNService.delete_51(id)
                        .then(response => {
                            if (response.data === 'OK') {
                                MySwal.fire({
                                    title: swaMsg.publish_success_title,
                                    text: swaMsg.publish_success_text,
                                    footer: swaMsg.text_footer,
                                    icon: 'success',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                                requestUpdate(currentItem.id);
                                setEdit(false);
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
        let setActive_51 = (item) => {
            formData = new FormData();
            let id = item.id
            let active = item.active;
            active = active == 1 ? 0 : 1;
            formData.set('active', active);
            FUNService.update_51(id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.close();
                        requestUpdate(currentItem.id)
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

        return (<>
            <fieldset className="p-3">
                <legend className="my-2 px-3 text-uppercase Collapsible" id="funn_51">
                    <label className="app-p lead text-center fw-normal text-uppercase">5.1 Titular(es) de la Licencia</label>
                </legend>
                <div className="form-check ms-5">
                    <input className="form-check-input" type="checkbox" onChange={(e) => setIsNew(e.target.checked)} />
                    <label className="form-check-label" htmlFor="flexCheckDefault">
                        Añadir Titular
                    </label>
                </div>
                {isNew
                    ? <>
                        <form id="form_fun_51_new" onSubmit={new_51}>
                            {_COMPONENT_NEW()}
                            <div className="row mb-3 text-center">
                                <div className="col-12">
                                    <button className="btn btn-success my-3" ><Icon name="file-alt" size={16} /> AÑADIR ITEM </button>
                                </div>
                            </div>
                        </form>
                    </>
                    : ""}

                {_CHILD_51_LIST()}
                <div className="border p-2 m-2">
                    <label className="me-2">LEYENDA:</label>
                    <label className="me-2"><Icon name="id-card" size={16} style={{ color: "DeepSkyBlue" }} /> : Documento de Identidad,</label>
                    <label className="me-2"><Icon name="id-badge" size={16} style={{ color: 'DarkOrchid' }} />: Certificado de Existencia y Representación Legal</label>
                </div>
                {edit
                    ? <>
                        <form id="form_fun_51_edit" onSubmit={edit_51}>
                            <h3 className="my-3 text-center">Actualizar Titular</h3>
                            {_COMPONENT_EDIT()}
                            <div className="row mb-3 text-center">
                                <div className="col-12">
                                    <button className="btn btn-success my-3" ><Icon name="file-alt" size={16} /> GUARDAR CAMBIOS </button>
                                </div>
                            </div>
                        </form>
                    </>
                    : ""}
            </fieldset>
        </>);
}

export default FUNN51;