import React, { Component } from 'react';
import FUNService from '../../../services/fun.service'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import VIZUALIZER from '../../../components/vizualizer.component';

const MySwal = withReactContent(Swal);
class FUNN53 extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
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
        let _SET_CHILD_52 = () => {
            var _CHILD = currentItem.fun_52s;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _SET_CHILD_53 = () => {
            var _CHILD = currentItem.fun_53s;
            var _CURRENT_VERSION = currentItem.version - 1;
            var _CHILD_VARS = {
                item_530: "",
                item_5311: "",
                item_5312: "",
                item_532: "",
                item_533: "",
                item_534: "",
                item_535: "",
                item_536: "",
                docs: "",
            }
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD_VARS.item_530 = _CHILD[_CURRENT_VERSION].id;
                    _CHILD_VARS.item_5311 = _CHILD[_CURRENT_VERSION].name;
                    _CHILD_VARS.item_5312 = _CHILD[_CURRENT_VERSION].surname;
                    _CHILD_VARS.item_532 = _CHILD[_CURRENT_VERSION].id_number;
                    _CHILD_VARS.item_533 = _CHILD[_CURRENT_VERSION].role;
                    _CHILD_VARS.item_534 = _CHILD[_CURRENT_VERSION].number;
                    _CHILD_VARS.item_535 = _CHILD[_CURRENT_VERSION].email;
                    _CHILD_VARS.item_536 = _CHILD[_CURRENT_VERSION].address;
                    _CHILD_VARS.docs = _CHILD[_CURRENT_VERSION].docs;
                }
            }
            return _CHILD_VARS;
        }
        let _CHILD_530 = () => {
            let _CHILD_VARS = _SET_CHILD_53();

            return <input type="hidden" id="f_530_id" defaultValue={_CHILD_VARS.item_530} />
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
        let _GET_DOC_VALUE = (_index) => {
            var _CHILD = _SET_CHILD_53();
            if (!_CHILD.docs) return false
            var _array = _CHILD.docs.split(',');

            return _array[_index]
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
        // COMPONENT JSX
        let _CHILD_53_COMPONENT = () => {
            let _CHILD_VARS = _SET_CHILD_53();

            return <>
                <div className="row mb-3">
                    <div className="col-6">
                        <label>Copiar Titular o Profesional</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-success text-white">
                                <i class="far fa-copy"></i>
                            </span>
                            {_COMPY_COMPONENT()}
                        </div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-6">
                        <label>5.3.1 Nombre</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-user"></i>
                            </span>
                            <input type="text" class="form-control" placeholder="Nombre" id="f_531"
                                defaultValue={_CHILD_VARS.item_5311} />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.3.1 Apellido(s)</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-user"></i>
                            </span>
                            <input type="text" class="form-control" placeholder="Apellido(s)" id="f_5312"
                                defaultValue={_CHILD_VARS.item_5312} />
                        </div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-6">
                        <label>5.3.2 Número de Identificación (C.C.)</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-user"></i>
                            </span>
                            <input type="text" class="form-control" placeholder="Numero de Identificación" id="f_532"
                                defaultValue={_CHILD_VARS.item_532} onBlur={(e) => { if (e.currentTarget === e.target) _REGEX_IDNUMBER(e) }} />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.3.3 En calidad de:</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-user"></i>
                            </span>
                            <input className='form-select' list="f53_roles" id="f_533" defaultValue={_CHILD_VARS.item_533} required />

                            <datalist id="f53_roles">
                                <option>TITULAR</option>
                                <option>PROPIETARIO</option>
                                <option>TITULAR</option>
                                <option>APODERADO</option>
                                <option>MANDATARIO</option>
                                <option>PROPIETARIO COMUNEROS</option>
                                <option>PROPIETARIO FIDUCIARIA</option>
                                <option>FIDEICOMITENTE</option>
                                <option>USUFRUCTUARIO</option>
                                <option>NACION U OTRA ENTIDAD</option>
                                <option>POSEEDOR</option>
                                <option>OTRO</option>
                            </datalist>

                        </div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-6">
                        <label>5.3.4 Teléfono de Contacto</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-phone-alt"></i>
                            </span>
                            <input type="text" class="form-control" placeholder="Teléfono" id="f_534"
                                defaultValue={_CHILD_VARS.item_534} />
                        </div>
                    </div>
                    <div className="col-6">
                        <label>5.3.5 Correo Electrónico</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-envelope"></i>
                            </span>
                            <input type="text" class="form-control" placeholder="Correo Electrónico" id="f_535"
                                defaultValue={_CHILD_VARS.item_535} />
                        </div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-6">
                        <label>5.3.6 Dirección para correspondencia</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-map-marked-alt"></i>
                            </span>
                            <input type="text" class="form-control" placeholder="Dirección para correspondencia" id="f_536"
                                defaultValue={_CHILD_VARS.item_536} />
                        </div>
                    </div>
                    <div className="col-5">
                        <label>5.3.7 Relacionar Documento: Doc. de Identidad</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-file"></i>
                            </span>
                            <select className='form-select' id="f_53_doc1" defaultValue={_GET_DOC_VALUE(0)}>
                                <option value="-1">APORTADO FISICAMENTE</option>
                                <option value="0">SIN DOCUMENTO</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div>
                    </div>
                    <div className="col-1">
                        <br />
                        {_GET_DOC_VALUE(0) > 0
                            ? <VIZUALIZER url={_FIND_6(_GET_DOC_VALUE(0)).path + "/" + _FIND_6(_GET_DOC_VALUE(0)).filename}
                                apipath={'/files/'} />
                            : ""}
                    </div>
                </div>

                <div className="row mb-2">
                    <div className="col-5">
                        <label>5.3.8 Poder, mandato o autorización debidamente otorgado</label>
                        <div class="input-group my-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-file"></i>
                            </span>
                            <select className='form-select' id="f_53_doc2" defaultValue={_GET_DOC_VALUE(1)}>
                                <option value="-1">APORTADO FISICAMENTE</option>
                                <option value="0">SIN DOCUMENTO</option>
                                {_CHILD_6_SELECT()}
                            </select>
                        </div>
                    </div>
                    <div className="col-1">
                        <br />
                        <br />
                        {_GET_DOC_VALUE(1) > 0
                            ?
                            <VIZUALIZER url={_FIND_6(_GET_DOC_VALUE(1)).path + "/" + _FIND_6(_GET_DOC_VALUE(1)).filename} apipath={'/files/'}
                            />
                            : ""}
                    </div>
                    <div className="col-6">
                        <label></label>

                    </div>
                </div>

            </>
        }
        let _COMPY_COMPONENT = () => {
            let copyList = [];

            let FUN_51 = _SET_CHILD_51();
            let FUN_52 = _SET_CHILD_52();

            FUN_51.map((value, i) => copyList.push({
                index: 'p' + i,
                name: value.name,
                surname: value.surname,
                number: value.nunber,
                id_number: value.id_number,
                email: value.email,
            }))

            FUN_52.map((value, i) => copyList.push({
                index: 't' + i,
                name: value.name,
                surname: value.surname,
                number: value.number,
                id_number: value.id_number,
                email: value.email,
            }))

            let setCopy = (index) => {
                let copyObject = copyList.find(value => value.index == index);

                document.getElementById('f_531').value = copyObject.name;
                document.getElementById('f_5312').value = copyObject.surname;
                document.getElementById('f_532').value = copyObject.id_number;
                document.getElementById('f_534').value = copyObject.number;
                document.getElementById('f_535').value = copyObject.email;
            }

            return <select className='form-select' onChange={(e) => setCopy(e.target.value)}>
                <option disabled selected>Copiar...</option>
                {copyList.map(value => <option value={value.index}>{value.name} {value.surname}</option>)}
            </select>

        }
        // FUNCTIONS AND APIS
        let manage_53 = () => {
            var _CHILD = _SET_CHILD_53();

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });

            if (_CHILD.item_530) {
                FUNService.update_53(_CHILD.item_530, formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
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
            } else {
                FUNService.create_fun53(formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
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
        }

        let new_53 = (e) => {
            e.preventDefault();
            formData = new FormData();
            let fun0Id = currentItem.id;
            formData.set('fun0Id', fun0Id);
            let version = currentVersion;
            formData.set('version', version);

            let name = document.getElementById("f_531").value;
            let surname = document.getElementById("f_5312").value;
            let id_number = document.getElementById("f_532").value;
            let role = document.getElementById("f_533").value;
            let email = document.getElementById("f_535").value;
            let address = document.getElementById("f_536").value;
            let number = document.getElementById("f_534").value;
            formData.set('name', name);
            formData.set('surname', surname);
            formData.set('id_number', id_number);
            formData.set('role', role);
            formData.set('email', email);
            formData.set('address', address);
            formData.set('number', number);

            let docs = [];
            docs.push(document.getElementById("f_53_doc1").value);
            docs.push(document.getElementById("f_53_doc2").value);
            formData.set('docs', docs.join());

            manage_53();

        }

        return (<>
            {_CHILD_530()}
            <fieldset className="p-3">
                <legend className="my-2 px-3 text-uppercase Collapsible" id="funn_53">
                    <label className="app-p lead text-center fw-normal text-uppercase">5.3 Responsable de la Solicitud</label>
                </legend>
                <form id="form_fun_53_manage" onSubmit={new_53}>
                    {_CHILD_53_COMPONENT()}
                    <div className="row mb-3 text-center">
                        <div className="col-12">
                            <button className="btn btn-success my-3"><i class="far fa-file-alt"></i> ACTUALIZAR ITEM </button>
                        </div>
                    </div>
                </form>
            </fieldset>
        </>);
    }
}

export default FUNN53;