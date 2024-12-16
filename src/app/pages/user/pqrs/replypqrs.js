import React, { Component } from 'react';
import { MDBTypography } from 'mdb-react-ui-kit';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import PQRS_Service from '../../../services/pqrs_main.service';
import PQRS_COMPONENT_INFO from './components/pqrs_gen.component';
import PQRS_COMPONENT_CLOCKS from './components/pqrs_clock.component';
import PQRS_COMPONENT_LICENCE from './components/pqrs_licence.component';
import PQRS_COMPONENT_REPLIES_PROFESIONAL_2 from './components/pqrs_replies_3.component';
import PQRS_MODULE_NAV from './components/pqrs_moduleNav.component';
import PQRS_SET_REPLY from './components/pqrs_setReply.component';

const MySwal = withReactContent(Swal);
class PQRSREPLY extends Component {
    constructor(props) {
        super(props);
        this.retrieveItem = this.retrieveItem.bind(this);
        this.refreshList = this.refreshList.bind(this);
        this.closeModa = this.closeModa.bind(this);
        this.state = {
        };
    }
    clearForm() {
        document.getElementById("app-formReply").reset()
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
    closeModa() {
        this.props.closeModal();
    }
    render() {
        const { translation, swaMsg, globals, translation_form, } = this.props;
        const { currentItem, load } = this.state;

        let _REPLIES_COUNTER_COMPONENT = () => {
            var counter = 0;
            for (var i = 0; i < currentItem.pqrs_workers.length; i++) {
                if (currentItem.pqrs_workers[i].reply) {
                    counter++;
                }
            }
            return counter;
        }

        return (
            <div>
                {currentItem != null ? <>
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

                        <fieldset className="p-3">
                            <legend className="my-2 px-3 text-uppercase bg-warning" id="pqrs_info_1">
                                <label className="app-p lead fw-normal text-uppercase">INFORMACIÓN DE RESPUESTAS</label>
                            </legend>
                            <PQRS_COMPONENT_REPLIES_PROFESIONAL_2
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
                            <div className="col-6 p-0 x-0">
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

                        {currentItem.pqrs_workers.length == _REPLIES_COUNTER_COMPONENT()
                            ? <>


                                <hr />
                                <div className="text-start lead fw-bold m-3">
                                    <MDBTypography note noteColor={currentItem.pqrs_workers.length == _REPLIES_COUNTER_COMPONENT() ? 'success' : 'danger'}> NUMERO DE RESPUESTA(S) {_REPLIES_COUNTER_COMPONENT()} DE {currentItem.pqrs_workers.length} TOTAL(ES)</MDBTypography>

                                </div>
                                <div className="text-center lead fw-bold m-3">
                                    <label className="app-p">DEFINIR RESPUESTA AL PETICIONARIO</label>

                                </div>
                                <p className="app-p">GUIÁ PARA DEFINIR LA RESPUESTA AL PETICIONARIO</p>
                                <ul>
                                    <li className="app-p">Argumente el cuerpo del oficio unicamente.</li>
                                    <li className="app-p">Especifique el CUB o Consecutivo de Salida.</li>
                                    <li className="app-p">Especifique la fecha en la cual se genera la respuesta.</li>
                                </ul>
                                {currentItem.id_reply
                                    ? <label className="app-p text-warning fw-bold">YA SE HA GENERADO UN OFICIO PARA ESTA SOLICITUD, GENERAR EL OFICIO OTRA VEZ REEMPLAZARÁ EL OFICIO ANTERIOR.</label>
                                    : <label className="app-p text-secondary fw-bold">EL OFICIO PARA ESTA SOLICITUD NO SE HA GENERADO TODAVÍA.</label>}

                                <PQRS_SET_REPLY
                                    translation={translation} swaMsg={swaMsg} globals={globals}
                                    currentItem={currentItem}
                                    retrieveItem={this.retrieveItem}
                                    refreshList={this.refreshList}
                                    closeModal={this.closeModa}
                                    hardReset
                                />


                            </> : <label className="app-p fw-bold text-danger text-center">SE DEBEN DE DAR TODAS LAS RESPUESTAS DE LOS PROFESIONALES PARA PODER RESPONDER AL SOLICITANTE</label>}
                    </> : <fieldset className="p-3" id="fung_0">
                        <div className="text-center"> <h3 className="fw-bold text-danger">NO HA SIDO POSIBLE CARGAR LA INFORMACIÓN, INTÉNTELO NUEVAMENTE</h3></div>
                    </fieldset>}
                </> : <fieldset className="p-3" id="fung_0">
                    <div className="text-center"> <h3 className="fw-bold ">CARGANDO INFORMACIÓN...</h3></div>
                </fieldset>}
                <PQRS_MODULE_NAV
                    translation={translation}
                    currentItem={currentItem}
                    FROM={"formal"}
                    NAVIGATION={this.props.NAVIGATION}
                />
            </div>
        );
    }
}

export default PQRSREPLY;