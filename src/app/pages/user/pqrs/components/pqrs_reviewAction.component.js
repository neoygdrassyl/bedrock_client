import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import Modal from 'react-modal';
import { MDBBtn, MDBTooltip } from 'mdb-react-ui-kit';
import PQRS_Service from '../../../../services/pqrs_main.service';
import { infoCud } from '../../../../components/jsons/vars'

const customStyles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.75)',
        zIndex: 2
    },
    content: {
        position: 'absolute',
        top: '80px',
        left: '15%',
        right: '15%',
        bottom: '50px',
        border: '1px solid #ccc',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        borderRadius: '4px',
        outline: 'none',
        padding: '20px',

    }
};
const MySwal = withReactContent(Swal);
class PQRS_ACTION_REVIEW extends Component {
    constructor(props) {
        super(props);
        this.state = {
            review_modal: false,
            currentItem: null
        };
    }
    getToggle = () => {
        return this.state.review_modal;
    }

    render() {
        const { translation, swaMsg, globals, currentItemId } = this.props;
        const { currentItem } = this.state;

        const loadData = (id, toogle = true) => {
            PQRS_Service.get(id)
                .then(response => {
                    this.setState({ currentItem: response.data })
                    if (toogle) this.setState({ review_modal: !this.state.review_modal })
                })
                .catch(e => {
                    console.log(e);
                    MySwal.fire({
                        title: "ERROR AL CARGAR",
                        text: "No ha sido posible cargar este item, intentelo nuevamente.",
                        icon: 'error',
                        confirmButtonText: swaMsg.text_btn,
                    });
                });
        }

        let GET_STEP = (id_public) => {
            var STEPS = currentItem.pqrs_steps;
            if (STEPS == null) return false;
            for (var i = 0; i < STEPS.length; i++) {
                if (STEPS[i].id_public == id_public) return STEPS[i];
            }
            return false;
        }

        let GET_ENTITY = (id) => {
            var entity = infoCud.other_entities;
            if (entity == false) return false;
            for (var i = 0; i < entity.length; i++) {
                if (entity[i].id == id) return entity[i];
            }
            return false;
        }

        const create_step = (formData) => {
            PQRS_Service.create_step(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        loadData(currentItem.id, false)
                    }
                })
                .catch(e => {
                    console.log(e);
                });
        }

        const edit_step = (formData, id) => {
            PQRS_Service.update_step(id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        loadData(currentItem.id, false)
                    }
                })
                .catch(e => {
                    console.log(e);
                });
        }


        const SAVE_STEP = (value, rew) => {
            let step = GET_STEP(rew.id_public);
            var formData = new FormData();

            formData.set('desc', rew.desc);
            formData.set('id_public', rew.id_public);
            formData.set('pqrsMasterId', currentItemId);

            if (rew.check) formData.set('check', value);
            if (rew.value) formData.set('value', value);

            if (step.id) edit_step(formData, step.id)
            else create_step(formData)
        }

        const rew_09_values = [
            "NO",
            "Planeación",
            "CDMB",
            "UNGR",
            "INGEOMINAS"
        ]



        const REW_DATA = [
            { title: "Cumplimiento de aspectos formales. Art 16/1755/2015", check: [0, 1], },
            { id_public: "rew_01", desc: `Esta dirigida a la entidad ${infoCud.name}. Art 16/1755/2015`, check: [0, 1], },
            { id_public: "rew_02", desc: `Es claro el objetivo deee la petición. Art 16/1755/2015`, check: [0, 1], },
            { id_public: "rew_03", desc: `Presenta razones que la fundamentan. Art 16/1755/2015`, check: [0, 1], },
            { id_public: "rew_04", desc: `Anexa documentos. Art 15/1755/2015`, check: [0, 1], },
            { id_public: "rew_05", desc: `Requiere estar por escrita. Art 15/1755/2015`, check: [0, 1], },
            { title: `Relación de competencias de la Petición con la ${infoCud.name}` },
            { id_public: "rew_06", desc: `Una actuación urbanística (Licencia / Reconocimientos / Otras actuaciones)`, check: [0, 1], },
            { id_public: "rew_07", desc: `Reconocimiento de un derecho (Vecino Colindante / Debido proceso)`, check: [0, 1], },
            { id_public: "rew_08", desc: `Recursos de reposición y/o subsidio de apelación`, check: [0, 1], },
            { title: `Relación de la petición con otras entidades`, check: [0, 1], },
            { id_public: "rew_09", desc: `Requiere integración de otras entidades `, value: rew_09_values },
        ]


        const SOLICITORS_COMPONENT = () => {
            let solicitors = currentItem.pqrs_solocitors || [];
            let contacts = currentItem.pqrs_contacts || [];
            return <>
                <div class="card border border-dark mb-3">
                    <div class="card-header text-uppercase">  1. DATOS PETICIONARIO</div>
                    <div class="card-body text-dark">
                        <div className='row'>
                            <div className='col'>
                                {solicitors.map(s => <>
                                    <div className='row'>
                                        <div className='col'>
                                            <label>Nombre: <label className='fw-bold'>{s.name}</label></label>
                                            <br />
                                            <label>Tipo: <label className='fw-bold'>{s.type}</label></label>
                                            <br />
                                            <label>{s.type_id} {s.id_number}</label>
                                            <hr />
                                        </div>
                                    </div>
                                </>)}
                            </div>
                            <div className='col'>
                                {contacts.map(c => <>
                                    <div className='row'>
                                        <div className='col'>
                                            <label>Teléfono: <label className='fw-bold'>{c.phone}</label></label>
                                            <br />
                                            <label>Dirección: <label className='fw-bold'>{c.address}</label></label>
                                            <br />
                                            <label>Email: <label className='fw-bold'>{c.email} (Autoriza: {c.notify ? "SI" : "NO"})</label></label>
                                            <hr />
                                        </div>
                                    </div>
                                </>)}
                            </div>
                        </div>
                    </div>
                </div>
            </>
        }

        const DESC_COMMPONENT = () => {
            return <>
                <div class="card border border-dark mb-3">
                    <div class="card-header text-uppercase">2.DESCRIPCIÓN DEL ASUNTO DE LA SOLICITUD</div>
                    <div class="card-body text-dark text-justify">
                        <label className='fw-bold'>Hechos:</label>  {currentItem.content}
                    </div>
                </div>
            </>
        }

        const STUDY_COMMPONENT = () => {
            return <>
                <div class="card border border-dark mb-3">
                    <div class="card-header text-uppercase">3. VALORACIÓN DE LA SOLICITUD Y DEFINICIÓN DE COMPETENCIA</div>
                    <div class="card-body text-dark">
                        {REW_DATA.map(rew => {
                            if (rew.title) return <>
                                <br />
                                <label className='fw-bold'>{rew.title}</label>
                            </>
                            else {
                                return <>
                                    <div className='row'>
                                        <div className='col-10 border'>{rew.desc}</div>
                                        <div className='col-2 border'>
                                            {rew.check ?
                                                <select className='form-select form-control form-control-sm' id={rew.id_public}
                                                    defaultValue={GET_STEP(rew.id_public).check}
                                                    onChange={(e) => SAVE_STEP(e.target.value, rew)}
                                                >
                                                    <option value="0">NO</option>
                                                    <option value="1">SI</option>
                                                </select>
                                                : null}
                                            {rew.value ?
                                                <select className='form-select form-control form-control-sm' id={rew.id_public}
                                                    defaultValue={GET_STEP(rew.id_public).value}
                                                    onChange={(e) => SAVE_STEP(e.target.value, rew)}
                                                >
                                                    {rew.value.map(v => <option>{v}</option>)}
                                                </select>
                                                : null}
                                        </div>
                                    </div>
                                </>
                            }
                        })}

                        {GET_STEP("rew_09").value && GET_ENTITY(GET_STEP("rew_09").value) ? <>
                            <div className='row'>
                                <div className='col'>
                                    <label className='fw-bold'>Art 21. Ley 1755/2015. Funcionarios sin competencia. Entidades a la que se hace el traslado. Correspondencia se debe enviar dentro de los 5 días siguientes a la radicación</label>
                                </div>
                            </div>
                            <div className='row'>
                                <div className='col-4 border'>Entidad</div>
                                <div className='col-8 border fw-bold'>{GET_ENTITY(GET_STEP("rew_09").value).name}</div>
                            </div>
                            <div className='row'>
                                <div className='col-4 border'>Funcionario</div>
                                <div className='col-8 border fw-bold'>{GET_ENTITY(GET_STEP("rew_09").value).official}</div>
                            </div>
                            <div className='row'>
                                <div className='col-4 border'>Cargo</div>
                                <div className='col-8 border fw-bold'>{GET_ENTITY(GET_STEP("rew_09").value).job}</div>
                            </div>
                            <div className='row'>
                                <div className='col-4 border'>Correo electrónica / Ventanilla Única</div>
                                <div className='col-8 border fw-bold'>{GET_ENTITY(GET_STEP("rew_09").value).email}</div>
                            </div>
                            <div className='row'>
                                <div className='col-4 border'>Hecho a petición</div>
                                <div className='col-8  border fw-bold'>{GET_ENTITY(GET_STEP("rew_09").value).other}</div>
                            </div>
                        </>
                            : null}
                    </div>
                </div>
            </>
        }

        const RESOLVE_COMMPONENT = () => {
            return <>
                <div class="card border border-dark mb-3">
                    <div class="card-header text-uppercase">4. CLASIFICACIÓN Y TERMINO PARA RESOLUCIÓN DE LA PQRS</div>
                    <div class="card-body text-dark">
                     ///
                    </div>
                </div>
            </>
        }
        return (
            <div className="">
                <MDBTooltip title='Control administrativo' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 mb-1 ms-1" className="">
                    <button className="btn btn-sm btn-warning m-0 px-2 shadow-none"
                        onClick={() => loadData(currentItemId)}>
                        <i class="fas fa-clipboard-check"></i></button></MDBTooltip>

                <Modal contentLabel="REVIEW ACTION"
                    isOpen={this.state.review_modal}
                    style={customStyles}
                    ariaHideApp={false}
                >
                    {currentItem ? <>
                        <div className="my-4 d-flex justify-content-between">
                            <label><i class="fas fa-th"></i> Control Administrativo {currentItem.id_global}</label>
                            <MDBBtn className='btn-close' color='none' onClick={() => this.setState({ review_modal: !this.state.review_modal })}></MDBBtn>
                        </div>
                        <hr />
                        {SOLICITORS_COMPONENT()}
                        {DESC_COMMPONENT()}
                        {STUDY_COMMPONENT()}
                        {RESOLVE_COMMPONENT()}
                    </>

                        : "CARGARGANDO..."}


                    <div className="text-end py-4 mt-3">
                        <button className="btn btn-lg btn-info" onClick={() => this.setState({ review_modal: !this.state.review_modal })}>
                            <i class="fas fa-times-circle"></i> CERRAR </button>
                    </div>
                </Modal>
            </div>
        );
    }
}

export default PQRS_ACTION_REVIEW;