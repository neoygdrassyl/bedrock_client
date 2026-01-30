import React, { Component } from 'react';
import FUNService from '../../../services/fun.service'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import DataTable from 'react-data-table-component';
import { MDBBtn, MDBTooltip } from 'mdb-react-ui-kit';
import VIZUALIZER from '../../../components/vizualizer.component';

const MySwal = withReactContent(Swal);
class FUNN51 extends Component {
    constructor(props) {
        super(props);
        this.state = {
            new: false,
            edit: false,
            legal: false,
        };
    }
    componentDidUpdate(prevState) {
        if (this.state.edit !== prevState.edit && this.state.edit != false) {
            var _ITEM = this.state.edit;
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
    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion } = this.props;
        const { } = this.state;

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
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-user"></i>
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
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-user"></i>
                            </span>
                            <input type="text" class="form-control" id="f_51_rep_name" disabled />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.1.0.2 Cédula (Representante Legal)</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-user"></i>
                            </span>
                            <input type="text" class="form-control" id="f_51_rep_idnumber" disabled
                                onBlur={(e) => { if (e.currentTarget === e.target) _REGEX_IDNUMBER(e) }} />
                        </div>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-6">
                        <label>5.1.1 Nombre</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-user"></i>
                            </span>
                            <input type="text" class="form-control" id="f_5111" />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.1.1 Apellido(s)</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-user"></i>
                            </span>
                            <input type="text" class="form-control" id="f_5112" />
                        </div>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-6">
                        <label>5.1.2 CC o NIT</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-id-card"></i>
                            </span>
                            <input type="text" class="form-control" id="f_512" onBlur={(e) => { if (e.currentTarget === e.target) _REGEX_IDNUMBER(e) }} />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.1.3 Correo Electrónico</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-envelope"></i>
                            </span>
                            <input type="text" class="form-control" id="f_513" />
                        </div>
                    </div>
                </div>
                <div className="row mb-1">
                    <div className="col-6">
                        <label>5.1.4 Teléfono de Contacto</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-phone-alt"></i>
                            </span>
                            <input type="text" class="form-control" id="f_514" />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.1.5 Tipo de Titular</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-phone-alt"></i>
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
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-file"></i>
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
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-file"></i>
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
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-user"></i>
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
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-user"></i>
                            </span>
                            <input type="text" class="form-control" id="f_51_rep_name_edit" />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.1.0.2 Cédula (Representante Lega)</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-user"></i>
                            </span>
                            <input type="text" class="form-control" id="f_51_rep_idnumber_edit" onBlur={(e) => { if (e.currentTarget === e.target) _REGEX_IDNUMBER(e) }} />
                        </div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-6">
                        <label>5.1.1 Nombre</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-user"></i>
                            </span>
                            <input type="text" class="form-control" id="f_5111_edit" />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.1.1 Apellido(s)</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-user"></i>
                            </span>
                            <input type="text" class="form-control" id="f_5112_edit" />
                        </div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-6">
                        <label>5.1.2 CC o NIT</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-id-card"></i>
                            </span>
                            <input type="text" class="form-control" id="f_512_edit" onBlur={(e) => { if (e.currentTarget === e.target) _REGEX_IDNUMBER(e) }} />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.1.3 Correo Electrónico</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-envelope"></i>
                            </span>
                            <input type="text" class="form-control" id="f_513_edit" />
                        </div>
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-6">
                        <label>5.1.4 Teléfono  de Contacto</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-phone-alt"></i>
                            </span>
                            <input type="text" class="form-control" id="f_514_edit" />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.1.5 Tipo de Titular</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-phone-alt"></i>
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
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-file"></i>
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
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-file"></i>
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
                    name: <label>TIPO PERSONA</label>,
                    selector: row => row.type, // FIX: react-data-table v7→v8
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: '150px',
                    cell: row => <label>{row.type}</label>
                },
                {
                    name: <label>NOMBRE</label>,
                    selector: row => row.name, // FIX: react-data-table v7→v8
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
                    cell: row => <label>{row.id_number}</label>
                },
                {
                    name: <label>NOMBRE REP. LEGAL</label>,
                    selector: row => row.rep_name, // FIX: react-data-table v7→v8
                    sortable: true,
                    filterable: true,
                    center: true,
                    minWidth: '200px',
                    cell: row => <label>{row.rep_name}</label>
                },
                {
                    name: <label>C.C. REP. LEGAL</label>,
                    selector: row => row.rep_id_number, // FIX: react-data-table v7→v8
                    sortable: true,
                    filterable: true,
                    center: true,
                    cell: row => <label>{row.rep_id_number}</label>
                },
                {
                    name: <label>TELEFONO/ CELULAR</label>,
                    selector: row => row.nunber, // FIX: react-data-table v7→v8
                    center: true,
                    cell: row => <label >{row.nunber}</label>
                },
                {
                    name: <label>CORREO</label>,
                    selector: row => row.email, // FIX: react-data-table v7→v8
                    center: true,
                    cell: row => <label>{row.email}</label>
                },
                {
                    name: <label>TIPO TITULAR</label>,
                    selector: row => row.role, // FIX: react-data-table v7→v8
                    center: true,
                    minWidth: '200px',
                    cell: row => <label>{row.role}</label>
                },
                {
                    name: <label>DOCUMENTOS</label>,
                    button: true,
                    center: true,
                    center: true,
                    cell: row => <> {_GET_DOCS_BTNS(row.docs)}</>
                },
                {
                    name: <label>ESTADO</label>,
                    button: true,
                    cell: row =>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" defaultChecked={row.active == 1 ? true : false} onChange={() => setActive_51(row)} />
                        </div>
                },
                {
                    name: <label>ACCION</label>,
                    button: true,
                    minWidth: '120px',
                    cell: row => <>
                        <MDBTooltip title='Modificar Item' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1">
                            {/* FIX: button anidado - replaced MDBBtn with span */}
                            <span 
                                role="button" 
                                tabIndex={0} 
                                className="btn btn-secondary btn-sm m-0 p-2 shadow-none" 
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
                                className="btn btn-danger btn-sm m-0 p-2 shadow-none" 
                                onClick={() => delete_51(row.id)}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') delete_51(row.id); }}
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
                        this.props.requestUpdate(currentItem.id);
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
            FUNService.update_51(this.state.edit.id, formData)
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
                        document.getElementById('form_fun_51_edit').reset();
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

        return (<>
            <fieldset className="p-3">
                <legend className="my-2 px-3 text-uppercase Collapsible" id="funn_51">
                    <label className="app-p lead text-center fw-normal text-uppercase">5.1 Titular(es) de la Licencia</label>
                </legend>
                <div class="form-check ms-5">
                    <input class="form-check-input" type="checkbox" onChange={(e) => this.setState({ new: e.target.checked })} />
                    <label class="form-check-label" for="flexCheckDefault">
                        Añadir Titular
                    </label>
                </div>
                {this.state.new
                    ? <>
                        <form id="form_fun_51_new" onSubmit={new_51}>
                            {_COMPONENT_NEW()}
                            <div className="row mb-3 text-center">
                                <div className="col-12">
                                    <button className="btn btn-success my-3" ><i class="far fa-file-alt"></i> AÑADIR ITEM </button>
                                </div>
                            </div>
                        </form>
                    </>
                    : ""}

                {_CHILD_51_LIST()}
                <div className="border p-2 m-2">
                    <label className="me-2">LEYENDA:</label>
                    <label className="me-2"><i class="far fa-id-card fa-2x" style={{ color: "DeepSkyBlue" }}></i> : Documento de Identidad,</label>
                    <label className="me-2"><i class="far fa-id-badge fa-2x" style={{ color: 'DarkOrchid' }}></i>: Certificado de Existencia y Representación Legal</label>
                </div>
                {this.state.edit
                    ? <>
                        <form id="form_fun_51_edit" onSubmit={edit_51}>
                            <h3 className="my-3 text-center">Actualizar Titular</h3>
                            {_COMPONENT_EDIT()}
                            <div className="row mb-3 text-center">
                                <div className="col-12">
                                    <button className="btn btn-success my-3" ><i class="far fa-file-alt"></i> GUARDAR CAMBIOS </button>
                                </div>
                            </div>
                        </form>
                    </>
                    : ""}
            </fieldset>
        </>);
    }
}

export default FUNN51;