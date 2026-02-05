import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

// SERVICES
import Nomenclature_Service from '../../../services/nomeclature.service'
import NOMENCLATURE_ANEX from './nomenclature_anex.componen';


const MySwal = withReactContent(Swal);

class NOMENCLATURE_NEW extends Component {
    constructor(props) {
        super(props);
        this.refreshList = this.refreshList.bind(this);
        this.state = {
        };
    }

    refreshList(id) {
        this.props.refreshList(id);
    }
    render() {
        const { translation, swaMsg, globals, currentItem } = this.props;
        const { } = this.state;

        // DATA GETTERS
        let GET_NOMENCLATURE = () => {
            var _CHILD = currentItem;
            var _CHILD_VARS = {
                id: "",
                id_public: "",
                type: "",
                name: "",
                surname: "",
                number_id: "",
                address: "",
                neighbour: "",
                predial: "",
                matricula: "",
                date_start: "",
                date_end: "",
                details: "",
                note: "",
                number: "",
                use: "",
                recipe_office_id: "",
                recipe_office_date: "",
                recipe_county_id: "",
                recipe_county_date: "",
            }
            if (_CHILD) {
                _CHILD_VARS.id = _CHILD.id;
                _CHILD_VARS.id_public = _CHILD.id_public;
                _CHILD_VARS.type = _CHILD.type;
                _CHILD_VARS.name = _CHILD.name;
                _CHILD_VARS.surname = _CHILD.surname;
                _CHILD_VARS.number_id = _CHILD.number_id;
                _CHILD_VARS.address = _CHILD.address;
                _CHILD_VARS.neighbour = _CHILD.neighbour ? _CHILD.neighbour.split(";") : ["", ""];
                _CHILD_VARS.predial = _CHILD.predial;
                _CHILD_VARS.matricula = _CHILD.matricula;
                _CHILD_VARS.date_start = _CHILD.date_start;
                _CHILD_VARS.date_end = _CHILD.date_end;
                _CHILD_VARS.details = _CHILD.details;
                _CHILD_VARS.number = _CHILD.number;
                _CHILD_VARS.note = _CHILD.note;
                _CHILD_VARS.use = _CHILD.use ?? '';
                _CHILD_VARS.recipe_office_id = _CHILD.recipe_office_id;
                _CHILD_VARS.recipe_office_date = _CHILD.recipe_office_date;
                _CHILD_VARS.recipe_county_id = _CHILD.recipe_county_id;
                _CHILD_VARS.recipe_county_date = _CHILD.recipe_county_date;
            }
            return _CHILD_VARS;
        }

        // DATA COMVERTERS
        let _REGEX_IDNUMBER = (e) => {
            let regex = /^[0-9]+$/i;
            let test = regex.test(e.target.value);
            if (test) {
                var _value = Number(e.target.value).toLocaleString();
                _value = _value.replaceAll(',', '.');
                document.getElementById(e.target.id).value = _value;
            }
        }
        let _GET_LAST_ID = () => {
            let new_id = "";
            Nomenclature_Service.getlastid()
                .then(response => {
                    new_id = response.data[0].id_public;
                    let concecutive = new_id.split('-')[1];
                    concecutive = Number(concecutive) + 1
                    if (concecutive < 1000) concecutive = "0" + concecutive
                    if (concecutive < 100) concecutive = "0" + concecutive
                    if (concecutive < 10) concecutive = "0" + concecutive
                    new_id = new_id.split('-')[0] + "-" + concecutive
                    document.getElementById('nomen_1').value = new_id;
                })
                .catch(e => {
                    console.log(e);
                    MySwal.fire({
                        title: "ERROR AL CARGAR",
                        text: "No ha sido posible cargar el consecutivo, intentelo nuevamnte.",
                        icon: 'error',
                        confirmButtonText: this.props.swaMsg.text_btn,
                    });
                });

        }
        // COMPONENT JSX
        let COMPONENT_NEW = () => {
            let _CHILD = GET_NOMENCLATURE();
            return <>
                <div className="row">
                    <div className="col-4">
                        <label >1. Número de Radicación</label>
                        <div class="input-group mb-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-file-alt"></i>
                            </span>
                            <input type="text" class="form-control" id="nomen_1" required
                                defaultValue={_CHILD.id_public} />
                            <button type="button" class="btn btn-info shadow-none" onClick={() => _GET_LAST_ID()}>GENERAR</button>
                        </div>
                    </div>
                    <div className="col-4">
                        <label >2. Tipo de Nomenclatura</label>
                        <div class="input-group mb-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-file-alt"></i>
                            </span>
                            <select class="form-select" required id="nomen_2"
                                defaultValue={_CHILD.type}>
                                <option>CERTIFICADO</option>
                                <option>NUEVA NOMENCLATURA</option>
                                <option>RECTIFICACION</option>
                            </select>
                        </div>
                    </div>
                    <div className="col-4">
                        <label >3. Número de Nomenclaturas</label>
                        <div class="input-group mb-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-file-alt"></i>
                            </span>
                            <input type="number" class="form-control" id="nomen_11" step="1" nim="1"
                                defaultValue={_CHILD.number} />
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-4">
                        <label >4.1 Nombre Solicitante</label>
                        <div class="input-group mb-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-user"></i>
                            </span>
                            <input type="text" class="form-control" id="nomen_31"
                                defaultValue={_CHILD.name} />
                        </div>
                    </div>
                    <div className="col-4">
                        <label >4.2 Apellido(s) Solicitante</label>
                        <div class="input-group mb-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-user"></i>
                            </span>
                            <input type="text" class="form-control" id="nomen_32"
                                defaultValue={_CHILD.surname} />
                        </div>
                    </div>
                    <div className="col-4">
                        <label >5. Documento Solicitante</label>
                        <div class="input-group mb-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-id-card"></i>
                            </span>
                            <input type="text" class="form-control" id="nomen_4"
                                onBlur={(e) => { if (e.currentTarget === e.target) _REGEX_IDNUMBER(e) }}
                                defaultValue={_CHILD.number_id} />
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-4">
                        <label >6. Dirección Predio</label>
                        <div class="input-group mb-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-home"></i>
                            </span>
                            <input type="text" class="form-control" id="nomen_5"
                                defaultValue={_CHILD.address} />
                        </div>
                    </div>
                    <div className="col-4">
                        <label >7.1 Tipo localizacion</label>
                        <div class="input-group mb-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-home"></i>
                            </span>
                            <select class="form-select" required id="nomen_16_1"
                            defaultValue={_CHILD.neighbour[1]}>
                            <option>BARRIO</option>
                            <option>URBANIZACIÓN</option>
                            <option>VEREDA</option>
                        </select>
                        </div>
                    </div>
                    <div className="col-4">
                        <label >7.2 Barrio</label>
                        <div class="input-group mb-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-home"></i>
                            </span>
                            <input type="text" class="form-control" id="nomen_16"
                                defaultValue={_CHILD.neighbour[0]} />
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-6">
                        <label >8. Número Predial/Catastral</label>
                        <div class="input-group mb-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-home"></i>
                            </span>
                            <input type="text" class="form-control" id="nomen_6"
                                defaultValue={_CHILD.predial} />
                        </div>
                    </div>
                    <div className="col-6">
                        <label >9. Número de Matrícula</label>
                        <div class="input-group mb-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-home"></i>
                            </span>
                            <input type="text" class="form-control" id="nomen_7"
                                defaultValue={_CHILD.matricula} />
                        </div>
                    </div>
                </div>
                <div className="row">
                    <label >10. Destino</label>
                    <div className='row p-3'>
                        <div className="col">
                            <div class="form-group form-check">
                                <input type="checkbox" class="form-check-input" name={"use"}
                                    value={"VIVIENDA"} defaultChecked={_CHILD.use.includes("VIVIENDA")} />
                                <label class="form-check-label" >VIVIENDA</label>
                            </div>
                        </div>
                        <div className="col">
                            <div class="form-group form-check">
                                <input type="checkbox" class="form-check-input" name={"use"}
                                    value={"COMERCIO"} defaultChecked={_CHILD.use.includes("COMERCIO")} />
                                <label class="form-check-label" >COMERCIO</label>
                            </div>
                        </div>
                        <div className="col">
                            <div class="form-group form-check">
                                <input type="checkbox" class="form-check-input" name={"use"}
                                    value={"INDUSTRIAL"} defaultChecked={_CHILD.use.includes("INDUSTRIAL")} />
                                <label class="form-check-label" >INDUSTRIAL</label>
                            </div>
                        </div>
                        <div className="col">
                            <div class="form-group form-check">
                                <input type="checkbox" class="form-check-input" name={"use"}
                                    value={"DOTACIONAL"} defaultChecked={_CHILD.use.includes("DOTACIONAL")} />
                                <label class="form-check-label" >DOTACIONAL</label>
                            </div>
                        </div>
                        <div className="col">
                            <div class="form-group form-check">
                                <input type="checkbox" class="form-check-input" name={"use"}
                                    value={"INSTITUCIONAL"} defaultChecked={_CHILD.use.includes("INSTITUCIONAL")} />
                                <label class="form-check-label" >INSTITUCIONAL</label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-4">
                        <label >11.1. Fecha Radicación</label>
                        <div class="input-group mb-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-calendar-check"></i>
                            </span>
                            <input type="date" class="form-control" max="2100-01-01" id="nomen_8"
                                defaultValue={_CHILD.date_start} />
                        </div>
                    </div>
                    <div className="col-4">
                        <label >11.2 Fecha Expedición</label>
                        <div class="input-group mb-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-calendar-times"></i>
                            </span>
                            <input type="date" class="form-control" max="2100-01-01" id="nomen_9"
                                defaultValue={_CHILD.date_end} />
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-4">
                        <label >12.1. Número de Recibo Curaduría</label>
                        <div class="input-group mb-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-money-check-alt"></i>
                            </span>
                            <input type="text" class="form-control" id="nomen_12"
                                defaultValue={_CHILD.recipe_office_id} />
                        </div>
                    </div>
                    <div className="col-4">
                        <label >12.2 Fecha de Recibo Curaduría</label>
                        <div class="input-group mb-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-calendar-alt"></i>
                            </span>
                            <input type="date" class="form-control" max="2100-01-01" id="nomen_13"
                                defaultValue={_CHILD.recipe_office_date} />
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-4">
                        <label >13.1. Número de Recibo Municipal</label>
                        <div class="input-group mb-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="fas fa-money-check-alt"></i>
                            </span>
                            <input type="text" class="form-control" id="nomen_14"
                                defaultValue={_CHILD.recipe_county_id} />
                        </div>
                    </div>
                    <div className="col-4">
                        <label >13.2 Fecha de Recibo Municipal</label>
                        <div class="input-group mb-1">
                            <span class="input-group-text bg-info text-white">
                                <i class="far fa-calendar-alt"></i>
                            </span>
                            <input type="date" class="form-control" max="2100-01-01" id="nomen_15"
                                defaultValue={_CHILD.recipe_county_date} />
                        </div>
                    </div>
                </div>
                <div className="row mt-2">
                    <div className="col-12">
                        <label >14. Observaciones (Máximo 2000 Caracteres)</label>
                        <textarea class="form-control mb-3" rows="3" maxLength="1900" id="nomen_10"
                            defaultValue={_CHILD.details}></textarea>
                    </div>
                </div>
                <div className="row">
                    <div className="col-13">
                        <label >15. Nota (Máximo 1000 Caracteres)</label>
                        <textarea class="form-control mb-3" rows="2" maxLength="1000" id="nomen_17"
                            defaultValue={_CHILD.note}></textarea>
                    </div>
                </div>
            </>
        }
        // FUNCTIONS AND APIS
        var formData = new FormData();

        let save_nomenclature = (event) => {
            event.preventDefault();

            formData = new FormData();
            let id_public = document.getElementById("nomen_1").value;
            formData.set('id_public', id_public);
            let type = document.getElementById("nomen_2").value;
            if (type) formData.set('type', type);
            let name = document.getElementById("nomen_31").value;
            if (name) formData.set('name', name);
            let surname = document.getElementById("nomen_32").value;
            if (surname) formData.set('surname', surname);
            let number_id = document.getElementById("nomen_4").value;
            if (number_id) formData.set('number_id', number_id);
            let address = document.getElementById("nomen_5").value;
            if (address) formData.set('address', address);
            let predial = document.getElementById("nomen_6").value;
            if (predial) formData.set('predial', predial);
            let matricula = document.getElementById("nomen_7").value;
            if (matricula) formData.set('matricula', matricula);
            let date_start = document.getElementById("nomen_8").value;
            if (date_start) formData.set('date_start', date_start);
            let date_end = document.getElementById("nomen_9").value;
            if (date_end) formData.set('date_end', date_end);
            let details = document.getElementById("nomen_10").value;
            if (details) formData.set('details', details);
            let number = document.getElementById("nomen_11").value;
            if (number) formData.set('number', number);
            let neighbour = [] 
            neighbour.push(document.getElementById("nomen_16").value || '')
            neighbour.push(document.getElementById("nomen_16_1").value || '');
            if (neighbour.length) formData.set('neighbour', neighbour.join(";"));

            let note = document.getElementById("nomen_17").value;
            if (note) formData.set('note', note);

            let use = [];
            let uses = document.getElementsByName('use')
            for (let i = 0; i < uses.length; i++) {
                const use_value = uses[i].value;
                const use_checked = uses[i].checked;
                if (use_checked) use.push(use_value)
            }
            if (use.length) formData.set('use', use.join(', '));

            let recipe_office_id = document.getElementById("nomen_12").value;
            if (recipe_office_id) formData.set('recipe_office_id', recipe_office_id);
            let recipe_office_date = document.getElementById("nomen_13").value;
            if (recipe_office_date) formData.set('recipe_office_date', recipe_office_date);
            let recipe_county_id = document.getElementById("nomen_14").value;
            if (recipe_county_id) formData.set('recipe_county_id', recipe_county_id);
            let recipe_county_date = document.getElementById("nomen_15").value;
            if (recipe_county_date) formData.set('recipe_county_date', recipe_county_date);


            manage_nomeclature();

        };
        let manage_nomeclature = () => {
            let _CHILD = GET_NOMENCLATURE();


            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            if (_CHILD.id) {
                Nomenclature_Service.update(_CHILD.id, formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            this.props.refreshList(currentItem.id);
                        } else if (response.data === 'ERROR_DUPLICATE') {
                            MySwal.fire({
                                title: "ERROR DE DUPLICACION",
                                text: "El consecutivo de radicado de este formulario ya existe, debe de elegir un consecutivo nuevo",
                                icon: 'error',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                        else {
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
                Nomenclature_Service.create(formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            this.props.refreshList();
                            this.props.closeModal();
                        } else if (response.data === 'ERROR_DUPLICATE') {
                            MySwal.fire({
                                title: "ERROR DE DUPLICACION",
                                text: "El consecutivo de radicado de este formulario ya existe, debe de elegir un consecutivo nuevo",
                                icon: 'error',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                        else {
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

        return (
            <div className="Nomenclature_new container">
                <fieldset className="p-3">
                    <legend className="my-2 px-3 text-uppercase Collapsible" id="fun_pdf">
                        <label className="app-p lead fw-normal text-uppercase text-light">{currentItem ? "ACTUALIZAR" : "NUEVA"} NOMENCLATURA</label>
                    </legend>
                    <form id="form_new_nomen" onSubmit={save_nomenclature}>
                        {COMPONENT_NEW()}
                        <div className="row mb-3 text-center">
                            <div className="col-12">
                                {currentItem
                                    ? <button className="btn btn-success my-3"><i class="far fa-edit"></i> GUARDAR CAMBIOS </button>
                                    : <button className="btn btn-success my-3"><i class="fas fa-plus-circle"></i> CREAR </button>}

                            </div>
                        </div>
                    </form>
                </fieldset>
                {currentItem
                    ? <fieldset className="p-3">
                        <legend className="my-2 px-3 text-uppercase Collapsible" id="fun_pdf">
                            <label className="app-p lead fw-normal text-uppercase text-light">DOCUMENTO</label>
                        </legend>
                        <NOMENCLATURE_ANEX
                            translation={translation} swaMsg={swaMsg} globals={globals}
                            currentItem={currentItem}
                            refreshItem={this.refreshList}
                        />
                    </fieldset>
                    : ""}
            </div >
        );
    }
}

export default NOMENCLATURE_NEW;