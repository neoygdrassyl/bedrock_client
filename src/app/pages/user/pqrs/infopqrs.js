import React, { Component } from 'react';
import PQRS_COMPONENT_INFO from './components/pqrs_gen.component';
import PQRS_COMPONENT_CLOCKS from './components/pqrs_clock.component';
import PQRS_COMPONENT_LICENCE from './components/pqrs_licence.component';
import PQRS_COMPONENT_SOLICITORS from './components/pqrs_solicitors.component';
import PQRS_COMPONENT_CONTACTS from './components/pqrs_contancts.component';
import PQRS_COMPONENT_ATTACHS from './components/pqrs_attach.component';
import PQRS_COMPONENT_ATTACH_SPECIAL from './components/pqrs_attach_spe.component';
import PQRS_COMPONENT_REPLIES_PROFESIONAL from './components/pqrs_replies_1.component';
import PQRS_COMPONENT_ATTACH_PROFESIONAL from './components/pqrs_attach_pro.component';
import PQRS_COMPONENT_REPLIES_TOSOLICITOR from './components/pqrs_replies_2.component';
import PQRS_Service from '../../../services/pqrs_main.service';

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import PQRS_MODULE_NAV from './components/pqrs_moduleNav.component';
import SUBMIT_SINGLE_VIEW from '../submit/submit_view.component';
import { PQRS_COMPONENT_REPLIES_PROFESIONAL1 } from './components/pqrs_replices_11.component';
import { PQRS_COMPONENT_REPLIES_TOSOLICITOR2 } from './components/pqrs_replies_22.component';
const MySwal = withReactContent(Swal);
class PQRSINFO extends Component {
    constructor(props) {
        super(props);
        this.retrieveItem = this.retrieveItem.bind(this);
        this.state = {
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
                    text: "No ha sido posible cargar este item, inténtelo nuevamente.",
                    icon: 'error',
                    confirmButtonText: this.props.swaMsg.text_btn,
                });
                this.setState({
                    load: false
                })
            });
    }
    render() {
        const { translation, swaMsg, globals, translation_form, } = this.props;
        const { currentItem, load } = this.state;

        // DATA CONVERTERS
        let _checkForReplies = () => {
            for (var i = 0; i < currentItem.pqrs_workers.length; i++) {
                if ((currentItem.pqrs_workers[i].reply && currentItem.pqrs_workers[i].roleId == window.user.roleId) || window.user.roleId == 1) {
                    return true;
                }
            }
            return false;
        }
        let _checkForOutputDocs = () => {
            for (var i = 0; i < currentItem.pqrs_attaches.length; i++) {
                if (currentItem.pqrs_attaches[i].class == 1) {
                    return true;
                }
            }
            return false;
        }
        let _checkForInputDocs = () => {
            for (var i = 0; i < currentItem.pqrs_attaches.length; i++) {
                if (currentItem.pqrs_attaches[i].class == 0) {
                    return true;
                }
            }
            return false;
        }

        return (
            <div>
                {currentItem != null ? <>
                    {load ? <><div>

                        <div className="row my-4 d-flex justify-content-center">
                            <fieldset className="p-3 border border-info mb-2">
                                <h2 className=" px-4 app-p lead fw-normal text-uppercase"><b>1. INFORMACIÓN DE LA PQRS <i class="fas fa-info-circle"></i></b></h2>
                                <PQRS_COMPONENT_INFO
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    translation_form={translation_form}
                                    currentItem={currentItem}
                                />
                            </fieldset>

                            {_checkForReplies() ? <>

                                <fieldset className="p-3 border border-info mb-2">
                                    <h2 className=" px-4 app-p lead fw-normal text-uppercase"><b>2. NFORMACIÓN DE RESPUESTA(S) DE PROFESIONAL(ES) <i class="fas fa-file-alt"></i></b></h2>
                                    <PQRS_COMPONENT_REPLIES_PROFESIONAL1
                                        translation={translation} swaMsg={swaMsg} globals={globals}
                                        currentItem={currentItem}
                                    />


                                    {_checkForOutputDocs()
                                        ? <>
                                            <legend className="my-2 px-3 text-uppercase bg-warning" id="pqrs_info_1">
                                                <label className="app-p lead fw-normal text-uppercase">DOCUMENTOS ANEXADOS POR PROFESIONAL(ES)</label>
                                            </legend>
                                            <PQRS_COMPONENT_ATTACH_PROFESIONAL
                                                translation={translation} swaMsg={swaMsg} globals={globals}
                                                currentItem={currentItem}
                                            />
                                        </> : ""}

                                    {currentItem.pqrs_info.reply
                                        ? <>
                                        <hr></hr>
                                            <h4 className="px-4"><b>2.2. RESPUESTA AL PETICIONARIO <i class="fas fa-reply-all"></i></b></h4>
                                            <PQRS_COMPONENT_REPLIES_TOSOLICITOR2
                                                translation={translation} swaMsg={swaMsg} globals={globals}
                                                currentItem={currentItem}
                                            />
                                        </> : ""}
                                </fieldset></> : ""}


                            <div className="row p-0 x-0">
                                <div className="col-16 p-0 x-0">
                                    <fieldset className="p-3 border border-info mb-2">
                                    <h2 className=" px-4 app-p lead fw-normal text-uppercase"><b>3. CONTROL DE TIEMPOS  <i class="fas fa-calendar-check"></i></b></h2>
                                        <PQRS_COMPONENT_CLOCKS
                                            translation={translation} swaMsg={swaMsg} globals={globals}
                                            currentItem={currentItem}
                                        />
                                    </fieldset>
                                </div>
                                <div className="col-16 p-0 x-0">
                                    {currentItem.pqrs_fun ?
                                        <fieldset className="p-3 border border-info mb-2">
                                            <h2 className=" px-4 app-p lead fw-normal text-uppercase"><b>4. LA PQRS ESTÁ RELACIONADA CON ALGUNA ACTUACIÓN Y/O SOLICITUD URBANÍSTICA  <i class="fas fa-bookmark"></i></b></h2>
                                            <div className='px-4'>
                                            <PQRS_COMPONENT_LICENCE
                                                translation={translation} swaMsg={swaMsg} globals={globals}
                                                currentItem={currentItem}
                                            />
                                            </div>
                                        </fieldset>
                                        : ""}
                                </div>
                            </div>


                            <fieldset className="p-3 border border-info mb-2">
                            <h2 className=" px-4 app-p lead fw-normal text-uppercase"><b>5. CONTACTO DE PETICIONARIO(S) PARA NOTIFICACIONES <i class="fas fa-bell"></i> </b></h2>
                                <PQRS_COMPONENT_SOLICITORS
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    currentItem={currentItem}
                                />
                                <hr></hr>
                                <h5 className=" px-4"><b>5.1. CONTACTO DE PETICIONARIO(S) <i class="fas fa-address-card"></i> </b> </h5>
                                <PQRS_COMPONENT_CONTACTS
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    currentItem={currentItem}
                                />
                            </fieldset>

                          

                            <fieldset className="p-3 border border-info mb-2">
                            <h2 className=" px-4 app-p lead fw-normal text-uppercase"><b>6. ANEXOS <i class="fas fa-file-medical"></i> </b></h2>
                                <PQRS_COMPONENT_ATTACHS
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    currentItem={currentItem}
                                    add
                                    retrieveItem={this.retrieveItem}
                                />
                            </fieldset>

                            <fieldset  className="p-3 border border-info mb-2">
                                <h2 className=" px-4 app-p lead fw-normal text-uppercase"><b>7. DOCUMENTOS DE VENTANILLA ÚNICA <i class="fas fa-folder"></i> </b></h2>

                                <SUBMIT_SINGLE_VIEW
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    id_related={currentItem.id_publico}
                                />
                            </fieldset>

                            <fieldset  className="p-3 border border-info mb-2">
                                <PQRS_COMPONENT_ATTACH_SPECIAL
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    currentItem={currentItem}
                                />
                            </fieldset>

                        </div>
                    </div>  </> : <fieldset className="p-3 border border-info mb-2" id="fung_0">
                        <div className="text-center"> <h3 className="fw-bold text-danger">NO HA SIDO POSIBLE CARGAR LA INFORMACIÓN, INTÉNTELO NUEVAMENTE</h3></div>
                    </fieldset>}
                </> : <fieldset className="p-3 border border-info mb-2" id="fung_0">
                    <div className="text-center"> <h3 className="fw-bold ">CARGANDO INFORMACIÓN...</h3></div>
                </fieldset>}

                <PQRS_MODULE_NAV
                    translation={translation}
                    currentItem={currentItem}
                    FROM={"general"}
                    NAVIGATION={this.props.NAVIGATION}
                />
            </div>
        );
    }
}

export default PQRSINFO;