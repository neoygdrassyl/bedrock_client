import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import PQRS_Service from '../../../services/pqrs_main.service';
import PQRS_EDIT_SOLICITORS from './components/pqrs_manage_solicitors.component';
import PQRS_EDIT_CONTACT from './components/pqrs_manage_contact.component';
import PQRS_EDIT_FUN from './components/pqrs_manage_fun.component';
import PQRS_EDIT_ATTACH from './components/pqrs_manage_attachs.component';
import PQRS_EDIT_INFO from './components/pqrs_manage_info.component';
import PQRS_MODULE_NAV from './components/pqrs_moduleNav.component';

const MySwal = withReactContent(Swal);
class PQRS_EDIT extends Component {
    constructor(props) {
        super(props);
        this.retrieveItem = this.retrieveItem.bind(this);
        this.refreshList = this.refreshList.bind(this);
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
                    text: "No ha sido posible cargar este ítem, intentelo nuevamente.",
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
    render() {
        const { translation, swaMsg, globals, translation_form, } = this.props;
        const { currentItem, load } = this.state;

        return (
            <div>
                {currentItem != null ? <>
                    {load ? <>
                        <label className="app-p lead text-start fw-bold text-uppercase">1. PETICIONARIOS</label>
                        <PQRS_EDIT_SOLICITORS
                            translation={translation} swaMsg={swaMsg} globals={globals}
                            currentItem={currentItem}
                            refreshCurrentItem={this.retrieveItem}
                        />
                        <hr />
                        <label className="app-p lead text-start fw-bold text-uppercase">2. CONTACTOS</label>
                        <PQRS_EDIT_CONTACT
                            translation={translation} swaMsg={swaMsg} globals={globals}
                            currentItem={currentItem}
                            refreshCurrentItem={this.retrieveItem}
                        />
                        <hr />
                        <label className="app-p lead text-start fw-bold text-uppercase">3. CASOS DE ACTUACIONES Y LICENCIAS</label>
                        <PQRS_EDIT_FUN
                            translation={translation} swaMsg={swaMsg} globals={globals}
                            currentItem={currentItem}
                            refreshCurrentItem={this.retrieveItem}
                        />
                        <hr />
                        <label className="app-p lead text-start fw-bold text-uppercase">4. DESCRIPCIÓN DE LA SOLICITUD</label>
                        <PQRS_EDIT_INFO
                            translation={translation} swaMsg={swaMsg} globals={globals}
                            translation_form={translation_form}
                            currentItem={currentItem}
                            refreshCurrentItem={this.retrieveItem}
                            refreshList={this.refreshList}
                        />
                        <hr />
                        <label className="app-p lead text-start fw-bold text-uppercase">5. DOCUMENTOS ANEXOS</label>
                        <PQRS_EDIT_ATTACH
                            translation={translation} swaMsg={swaMsg} globals={globals}
                            currentItem={currentItem}
                            refreshCurrentItem={this.retrieveItem}
                        />
                        <hr />
                    </> : <fieldset className="p-3" id="fung_0">
                        <div className="text-center"> <h3 className="fw-bold text-danger">NO HA SIDO POSIBLE CARGAR LA INFORMACIÓN, INTÉNTELO NUEVAMENTE</h3></div>
                    </fieldset>}
                </> : <fieldset className="p-3" id="fung_0">
                    <div className="text-center"> <h3 className="fw-bold ">CARGANDO INFORMACIÓN...</h3></div>
                </fieldset>}
                <PQRS_MODULE_NAV
                    translation={translation}
                    currentItem={currentItem}
                    FROM={"edit"}
                    NAVIGATION={this.props.NAVIGATION}
                />
            </div>
        );
    }
}

export default PQRS_EDIT;