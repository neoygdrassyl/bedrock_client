import React, { Component } from 'react';
import { MDBBtn } from 'mdb-react-ui-kit';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import PQRS_Service from '../../../services/pqrs_main.service';
import PQRS_COMPONENT_INFO from './components/pqrs_gen.component';
import PQRS_COMPONENT_CLOCKS from './components/pqrs_clock.component';
import PQRS_COMPONENT_LICENCE from './components/pqrs_licence.component';
import PQRS_MODULE_NAV from './components/pqrs_moduleNav.component';

const moment = require('moment');
const MySwal = withReactContent(Swal);
class PQRSINFORMAL extends Component {
    constructor(props) {
        super(props);
        this.retrieveItem = this.retrieveItem.bind(this);
        this.refreshList = this.refreshList.bind(this);
        this.state = {
            attachs: 0,
        };
    }
    componentDidMount() {
        this.retrieveItem(this.props.currentId);
    }
    retrieveItem(id) {
        PQRS_Service.get(id)
            .then(response => {
                this.setState({
                    currentItem: response.data,
                    load: true
                })
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: "ERROR AL CARGAR",
                    text: "No ha sido posible cargar este item, intentelo nuevamente.",
                    icon: 'error',
                    confirmButtonText: this.props.swaMsg.text_btn,
                });
                this.setState({
                    load: false
                })
            });
    }
    refreshList() {
        this.props.refreshList()
    }
    clearForm() {
        document.getElementById("app-formInformal").reset()
    }
    addAttach() {
        this.setState({ attachs: this.state.attachs + 1 })
    }
    minusAttach() {
        this.setState({ attachs: this.state.attachs - 1 })
    }

    render() {
        const { translation, swaMsg, globals, translation_form, currentItemAsign } = this.props;
        const { attachs, currentItem, load } = this.state;
        var formData = new FormData();

        let _ATTACHS_COMPONENT = () => {
            var _COMPONENT = [];
            for (var i = 0; i < attachs; i++) {
                _COMPONENT.push(<div className="row d-flex justify-content-center my-2">
                    <div className="col-lg-8 col-md-8 ">
                        <label className="app-p lead text-start fw-normal text-uppercase">DOCUMENTO ANEXO N° {i + 1}</label>
                        <div class="input-group">
                            <span class="input-group-text bg-info text-white" id="name"><i class="fas fa-paperclip"></i></span>
                            <input type="file" class="form-control" name="files_informal" accept="image/png, image/jpeg application/pdf" />
                        </div>
                        <div class="input-group">
                            <span class="input-group-text bg-info text-white" id="name"><i class="fas fa-paperclip"></i></span>
                            <input type="text" class="form-control" name="files_informal_names" placeholder="Nombre documento (nombre o corta descripcion)" />
                        </div>
                    </div>
                </div>)
            }

            return <div>{_COMPONENT}</div>;
        }
        let informalReplyPQRS = (e) => {
            e.preventDefault();
            formData = new FormData();
            formData.set('id', currentItemAsign);
            let reply = document.getElementById("pqrs_informal_reply").value;
            formData.set('reply', reply);
            let date_reply = document.getElementById("pqrs_informal_time").value;
            formData.set('date_reply', date_reply);
            // GET DATA OF ATTACHS
            let files = document.getElementsByName("files_informal");

            formData.set('attachs_length', attachs);
            for (var i = 0; i < attachs; i++) {
                formData.append('file', files[i].files[0], "pqrsout_" + files[i].files[0].name)
            }

            let array_form = [];
            let array_html = [];

            array_html = document.getElementsByName("files_informal_names");
            for (var i = 0; i < array_html.length; i++) {
                array_form.push(array_html[i].value)
            }
            formData.set('files_names', array_form);

            // Display the key/value pairs
            /*
            for (var pair of formData.entries()) {
                console.log(pair[0] + ', ' + pair[1]);
            }
            */
            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            PQRS_Service.informalReply(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.generic_success_title,
                            text: swaMsg.generic_success_text,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        this.clearForm();
                        this.retrieveItem(currentItem.id);
                        this.refreshList();
                        this.props.closeModal()
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
                });
        };
        return (
            <div>
                {currentItemAsign && currentItem
                    ? <>
                        {load ? <>
                            <fieldset className="p-3">
                                <legend className="my-2 px-3 text-uppercase Collapsible" id="pqrs_info_1">
                                    <label className="app-p lead fw-normal text-uppercase">INFORMACIÓN DE LA PQRS</label>
                                </legend>
                                <PQRS_COMPONENT_INFO
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    translation_form={translation_form}
                                    currentItem={currentItem}
                                />
                            </fieldset>
                            <div className="row">
                                <div className="col-6">
                                    <fieldset className="p-3">
                                        <legend className="my-2 px-3 text-uppercase Collapsible" id="pqrs_info_1">
                                            <label className="app-p lead fw-normal text-uppercase">CONTROL DE TIEMPOS</label>
                                        </legend>
                                        <PQRS_COMPONENT_CLOCKS
                                            translation={translation} swaMsg={swaMsg} globals={globals}
                                            currentItem={currentItem}
                                        />
                                    </fieldset>
                                </div>
                                <div className="col-6">
                                    {currentItem.pqrs_fun ?
                                        <fieldset className="p-3">
                                            <legend className="my-2 px-3 text-uppercase Collapsible" id="pqrs_info_1">
                                                <label className="app-p lead fw-normal text-uppercase">SOLICITUD RELACIONADA</label>
                                            </legend>
                                            <PQRS_COMPONENT_LICENCE
                                                translation={translation} swaMsg={swaMsg} globals={globals}
                                                currentItem={currentItem}
                                            />
                                        </fieldset>
                                        : ""}
                                </div>
                            </div>

                            <form onSubmit={informalReplyPQRS} id="app-formInformal" className="py-3">

                                <legend className="my-2 px-3 text-uppercase Collapsible" id="pqrs_info_1">
                                    <label className="app-p lead fw-normal text-uppercase">RESPUESTA INFORMAL DE PETICIÓN</label>
                                </legend>
                                <p className="app-p">ESTA RESPUESTA SERÁ DADA COMO EL PROFESIONAL : <label className="fw-bold text-uppercase">{currentItemAsign.name}</label></p>
                                <p className="app-p">Instrucciones para dar respuesta a la solicitud: </p>
                                <ul>
                                    <li>Escribir la respuesta en la caja de texto seguida de las instrucciones.</li>
                                    <li>Incluir una breve descripción de la solicitud.</li>
                                    <li>Argumentar la respuesta, citando fuentes.</li>
                                    <li>Si el peticionario ha solicitado copia de documentos, identificarlos y enumerarlos en esta caja de texto y seguidamente anexarlos en el siguinte paso.</li>
                                    <li>Si la CUB1 no es competente orientar al peticionario y recomendar el traslado de la PQRS.</li>
                                </ul>
                                <div className="text-center m-3">
                                    <textarea class="form-control m-3" rows="5" maxlength="4096" id="pqrs_informal_reply"></textarea>
                                </div>
                                <hr className="my-3" />
                                <label className="app-p lead text-start fw-bold text-uppercase">ANEXAR DOCUMENTO</label>
                                <div className="text-end m-3">
                                    {attachs > 0
                                        ? <MDBBtn className="btn btn-lg btn-secondary mx-3" onClick={() => this.minusAttach()}><i class="fas fa-minus-circle"></i> REMOVER ULTIMO </MDBBtn>
                                        : ""}
                                    <MDBBtn className="btn btn-lg btn-secondary" onClick={() => this.addAttach()}><i class="fas fa-plus-circle"></i> AÑADIR OTRO </MDBBtn>
                                </div>
                                {_ATTACHS_COMPONENT()}

                                <hr className="my-3" />
                                <div className="row">

                                    <div className="col-lg-6 col-md-6">
                                        <input type="text" class="form-control" placeholder="  ESTA RESPUESTA A LA SOLICITUD SE DA PARA LA FECHA:" disabled />
                                        <div class="input-group mb-3">
                                            <span class="input-group-text bg-info text-white">
                                                <i class="far fa-calendar-alt"></i>
                                            </span>
                                            <input type="date" max="2100-01-01" class="form-control" id="pqrs_informal_time" defaultValue={moment().format('YYYY-MM-DD')} required />
                                        </div>
                                    </div>
                                </div>
                                <div className="text-center py-4 mt-3">
                                    <button className="btn btn-lg btn-success"><i class="fas fa-reply"></i> RESPONDER </button>
                                </div>
                            </form></> : <fieldset className="p-3" id="fung_0">
                            <div className="text-center"> <h3 className="fw-bold text-danger">NO HA SIDO POSIBLE CARGAR LA INFORMACIÓN, INTÉNTELO NUEVAMENTE</h3></div>
                        </fieldset>}
                    </> : <fieldset className="p-3" id="fung_0">
                        <div className="text-center"> <h3 className="fw-bold ">CARGANDO INFORMACIÓN...</h3></div>
                    </fieldset>}

                    <PQRS_MODULE_NAV
                    translation={translation}
                    currentItem={currentItem}
                    FROM={"informal"}
                    NAVIGATION={this.props.NAVIGATION}
                />
            </div>
        );
    }
}

export default PQRSINFORMAL;