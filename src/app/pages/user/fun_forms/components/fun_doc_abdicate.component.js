import { MDBBtn } from 'mdb-react-ui-kit';
import FUN_SERVICE from '../../../../services/fun.service';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { dateParser } from '../../../../components/customClasses/typeParse';
import moment from 'moment';

const _GLOBAL_ID = process.env.REACT_APP_GLOBAL_ID;
const MySwal = withReactContent(Swal);

export default function FUN_D_ABDICATE(props) {
    const { translation, swaMsg, globals, currentItem, currentVersion, id_related, related } = props;

    // ***************************  DATA CONVERTER *********************** //
    let _GET_CHILD_1 = () => {
        var _CHILD = currentItem.fun_1s;
        var _CURRENT_VERSION = currentVersion - 1;
        var _CHILD_VARS = {
            tipo: [],
            tramite: [],
            m_urb: [],
            m_sub: [],
            m_lic: [],
        }
        if (_CHILD) {
            if (_CHILD[_CURRENT_VERSION] != null) {
                _CHILD_VARS.tipo = _CHILD[_CURRENT_VERSION].tipo;
                _CHILD_VARS.tramite = _CHILD[_CURRENT_VERSION].tramite;
                _CHILD_VARS.m_urb = _CHILD[_CURRENT_VERSION].m_urb;
                _CHILD_VARS.m_sub = _CHILD[_CURRENT_VERSION].m_sub;
                _CHILD_VARS.m_lic = _CHILD[_CURRENT_VERSION].m_lic;
            }
        }
        return _CHILD_VARS;

    }
    let _GET_CHILD_2 = () => {
        var _CHILD = currentItem.fun_2;
        var _CHILD_VARS = {
            item_20: "",
            item_211: "",
            item_212: "",
            item_22: "",
            item_23: "",
            item_24: "",
            item_25: "",
            item_261: "",
            item_262: "",
            item_263: "",
            item_264: "",
            item_265: "",
            item_266: "",
        }
        if (_CHILD) {
            _CHILD_VARS.item_20 = _CHILD.id;
            _CHILD_VARS.item_211 = _CHILD.direccion;
            _CHILD_VARS.item_212 = _CHILD.direccion_ant;
            _CHILD_VARS.item_22 = _CHILD.matricula;
            _CHILD_VARS.item_23 = _CHILD.catastral;
            _CHILD_VARS.item_24 = _CHILD.suelo; // PARSER
            _CHILD_VARS.item_25 = _CHILD.lote_pla;// PARSER

            _CHILD_VARS.item_261 = _CHILD.barrio;
            _CHILD_VARS.item_262 = _CHILD.vereda;
            _CHILD_VARS.item_263 = _CHILD.comuna;
            _CHILD_VARS.item_264 = _CHILD.sector;
            _CHILD_VARS.item_265 = _CHILD.corregimiento;
            _CHILD_VARS.item_266 = _CHILD.lote;
            _CHILD_VARS.item_267 = _CHILD.estrato;
            _CHILD_VARS.item_268 = _CHILD.manzana;
        }
        return _CHILD_VARS;
    }
    let _GET_CHILD_51 = () => {
        var _CHILD = currentItem.fun_51s;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
    }
    let _GET_CHILD_53 = () => {
        var _CHILD = currentItem.fun_53s;
        var _CURRENT_VERSION = currentVersion - 1;
        var _CHILD_VARS = {
            item_530: "",
            item_5311: "",
            item_5312: "",
            item_532: "",
            item_533: "",
            item_534: "",
            item_535: "",
            item_536: "",
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
            }
        }
        return _CHILD_VARS;
    }
    let _SET_F51 = (name, id, role) => {
        let f51 = _GET_CHILD_51();
        if (name) {
            let find = f51.find(f => f.name + ' ' + f.surname == name);
            if (!find) return;
            document.getElementById('fda_f51_id').value = find.id_number;
            document.getElementById('fda_f51_role').value = find.role;
        }
        if (id) {
            let find = f51.find(f => f.id_number == id);
            if (!find) return;
            document.getElementById('fda_f51').value = find.name + ' ' + find.surname;
            document.getElementById('fda_f51_role').value = find.role;
        }
        if (role) {
            let find = f51.find(f => f.role == role);
            if (!find) return;
            document.getElementById('fda_f51').value = find.name + ' ' + find.surname;
            document.getElementById('fda_f51_id').value = find.id_number;
        }
    }
    // ***************************  JXS *********************** //
    let _COMPONENT = () => {
        let RES_DATA = currentItem.expedition || {};
        let f51 = _GET_CHILD_51();
        var writtenNumber = require('written-number');
        writtenNumber.defaults.lang = 'es';
        let date_1 = dateParser(moment().format('YYYY-MM-DD'));
        date_1 = date_1.split(' ').map(s => {
            if (!isNaN(s)) return writtenNumber(s)
            return s
        }).join(' ');

        let date_2 = dateParser(RES_DATA.date || ' ');
        date_2 = date_2.split(' ').map(s => {
            if (!isNaN(s)) return writtenNumber(s)
            return s
        }).join(' ');

        return <>
            <div className="row m-2">
                <div className="col mx-1">
                    <label>Fecha</label>
                    <div class="row">
                        <div class="col mx-0 px-0">
                            <input type="date" class="form-control form-control-sm" id="fda_date_1" max="2100-01-01" defaultValue={moment().format('YYYY-MM-DD')} />
                        </div>
                        <div class="col mx-0 px-0">
                            <input type="text" class="form-control form-control-sm" id="fda_date_2" max="2100-01-01" defaultValue={date_1} />

                        </div>
                    </div>
                </div>
                <div className="col mx-1">
                    <label>Hora</label>
                    <div class="row">
                        <div class="col mx-0 px-0">
                            <input type="time" class="form-control form-control-sm mx-0" id="fda_time_n" defaultValue={moment().format('HH:mm')} />
                        </div>
                        <div class="col mx-0 px-0">
                            <input type="text" class="form-control form-control-sm mx-0" id="fda_time_t" defaultValue={''} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="row m-2">
                <div className="col">
                    <label>Radicación</label>
                    <input type="text" class="form-control form-control-sm" id="fda_id" disabled defaultValue={currentItem.id_public} />
                </div>
                <div className="col">
                    <label>Resolución</label>
                    <input type="text" class="form-control form-control-sm" id="fda_res_id" defaultValue={RES_DATA.id_public} />
                </div>
                <div className="col-6">
                    <label>Resolución Fecha</label>
                    <div class="row">
                        <div class="col mx-0 px-0">
                            <input type="date" class="form-control form-control-sm" id="fda_res_date_1" max="2100-01-01" defaultValue={RES_DATA.date} />
                        </div>
                        <div class="col mx-0 px-0">
                            <input type="text" class="form-control form-control-sm" id="fda_res_date_2" defaultValue={date_2} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="row m-2">
                <input type='hidden' id="fda_change" />
                <div className="col">
                    <label>Titular</label>
                    <input list="fda_f51_list" class="form-control form-control-sm" id="fda_f51" onChange={(e) => _SET_F51(e.target.value, false, false)} />
                    <datalist id="fda_f51_list" >
                        {f51.map(f => <option value={f.name + ' ' + f.surname} />)}
                    </datalist>
                </div>
                <div className="col">
                    <label>Documento</label>
                    <input list="fda_f51_id_list" class="form-control form-control-sm" id="fda_f51_id" onChange={(e) => _SET_F51(false, e.target.value, false)} />
                    <datalist id="fda_f51_id_list">
                        {f51.map(f => <option value={f.id_number}>{f.name + ' ' + f.surname}: {f.id_number}</option>)}
                    </datalist>
                </div>
                <div className="col">
                    <label>Calidad</label>
                    <input list="fda_f51_role_list" class="form-control form-control-sm" id="fda_f51_role" onChange={(e) => _SET_F51(false, false, e.target.value)} />
                    <datalist id="fda_f51_role_list">
                        {f51.map(f => <option value={f.role} >{f.name + ' ' + f.surname}: {f.role}</option>)}
                    </datalist>
                </div>
            </div>

            {_GLOBAL_ID == "cp1" ?
                <>

                    <div className="row m-2">
                        <div className="col-4">
                            <label>Nombre Notificador(a)</label>
                            <input class="form-control form-control-sm" id="fda_name_not" />
                        </div>
                        <div className="col-4">
                            <label>Cargo Notificador(a)</label>
                            <input class="form-control form-control-sm" id="fda_role_not" />
                        </div>
                    </div>

                    <div className="row m-2">
                        <label>Recursos</label>

                        <div className="col-12 d-flex justify-content-start">
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" name="fda_res" />
                                <label class="form-check-label">REPOSICIÓN ANTE LA CURADORA URBANA N° 1 DE PIEDECUESTA </label>
                            </div>
                        </div>
                        <div className="col-12 d-flex justify-content-start">
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" name="fda_res" />
                                <label class="form-check-label">APELACIÓN ANTE LA OFICINA ASESORA DE PLANEACIÓN DE PIEDECUESTA O EN SU DEFECTO ANTE EL ALCALDE MUNICIPAL  </label>
                            </div>
                        </div>
                    </div>

                    <div className="row m-2">
                        <label>Renuncia a términos</label>

                        <div className="col-12 d-flex justify-content-start">
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="fda_adbdicate" />
                                <label class="form-check-label">SI </label>
                            </div>
                        </div>
                    </div>
                </> : null}

        </>
    }
    // ***************************  APIS *********************** //
    function get_pdf(e) {
        e.preventDefault();
        let formData = new FormData();

        let year_1 = document.getElementById('fda_date_1').value.split('-')[0]
        let year_2 = document.getElementById('fda_res_date_1').value.split('-')[0]
        let hour = document.getElementById('fda_time_n').value.split(':')[0]
        let min = document.getElementById('fda_time_n').value.split(':')[1]

        formData.set('date_year', year_1);
        formData.set('date_string', document.getElementById('fda_date_2').value);
        formData.set('date_ll', dateParser(document.getElementById('fda_date_1').value));

        formData.set('time_string', document.getElementById('fda_time_t').value);
        formData.set('time_hour', hour);
        formData.set('time_min', min);
        formData.set('date_string_2', document.getElementById('fda_res_date_2').value);
        formData.set('date_year_2', year_2);
        formData.set('date_ll_2', dateParser(document.getElementById('fda_res_date_1').value));


        formData.set('f51_name', document.getElementById('fda_f51').value);
        formData.set('f51_id_number', document.getElementById('fda_f51_id').value);
        formData.set('f51_role', document.getElementById('fda_f51_role').value);

        formData.set('id_res', document.getElementById('fda_res_id').value);
        formData.set('id_public', document.getElementById('fda_id').value);

        if (document.getElementById('fda_name_not'))  formData.set('name_not', document.getElementById('fda_name_not').value);
        if (document.getElementById('fda_role_not'))  formData.set('role_not', document.getElementById('fda_role_not').value);

        if (document.getElementById('fda_adbdicate')) formData.set('adbdicate', document.getElementById('fda_adbdicate').checked);
        if (document.getElementsByName('fda_res').length > 0) {
            let resources = "";
            resources += document.getElementsByName('fda_res')[0].checked ? '1,' : '0,';
            resources += document.getElementsByName('fda_res')[1].checked ? '1' : '0';
            formData.set('resources', resources);
        }

        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        FUN_SERVICE.gen_doc_abdicate(formData)
            .then(response => {
                if (response.data === 'OK') {
                    MySwal.close();
                    window.open(process.env.REACT_APP_API_URL + "/pdf/expdocresabd/" + "INFORMACIÓN LIENCIA RENUNCIADO DE TÉRMINOS " + currentItem.id_public + ".pdf");
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
        <>
            <div className='border p-2'>
                {_COMPONENT()}
                <div className='text-center my-2'>
                    <MDBBtn className="btn btn-danger my-3" onClick={(e) => get_pdf(e)}><i class="far fa-file-pdf"></i> GENERAR PDF</MDBBtn>
                </div>
            </div>
        </>
    );
}
