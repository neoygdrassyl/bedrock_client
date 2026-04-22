import { useState, useEffect } from 'react';
import PQRS_Service from '../../../services/pqrs_main.service';
import PQRS_EDIT_SOLICITORS from './components/pqrs_manage_solicitors.component';
import PQRS_EDIT_CONTACT from './components/pqrs_manage_contact.component';
import PQRS_EDIT_FUN from './components/pqrs_manage_fun.component';
import PQRS_EDIT_ATTACH from './components/pqrs_manage_attachs.component';
import PQRS_EDIT_INFO from './components/pqrs_manage_info.component';
import PQRS_MODULE_NAV from './components/pqrs_moduleNav.component';
import { swalError } from '@/app/utils/swalAdapter';

function PQRS_EDIT({ translation, swaMsg, globals, translation_form, currentId, refreshList: refreshListProp, NAVIGATION }) {
    const [currentItem, setCurrentItem] = useState(null);
    const [load, setLoad] = useState(false);

    useEffect(() => {
        retrieveItem(currentId);
    }, []);

    const retrieveItem = (id) => {
        PQRS_Service.get(id)
            .then(response => {
                setCurrentItem(response.data);
                setLoad(true);
            })
            .catch(e => {
                console.log(e);
                swalError({ title: "ERROR AL CARGAR", text: "No ha sido posible cargar este ítem, intentelo nuevamente." });
                setLoad(false);
            });
    };

    const refreshList = () => {
        refreshListProp();
    };

        return (
            <div>
                {currentItem != null ? <>
                    {load ? <>
                        <label className="app-p lead text-start fw-bold">1. PETICIONARIOS</label>
                        <PQRS_EDIT_SOLICITORS
                            translation={translation} swaMsg={swaMsg} globals={globals}
                            currentItem={currentItem}
                            refreshCurrentItem={retrieveItem}
                        />
                        <hr />
                        <label className="app-p lead text-start fw-bold">2. CONTACTOS</label>
                        <PQRS_EDIT_CONTACT
                            translation={translation} swaMsg={swaMsg} globals={globals}
                            currentItem={currentItem}
                            refreshCurrentItem={retrieveItem}
                        />
                        <hr />
                        <label className="app-p lead text-start fw-bold">3. CASOS DE ACTUACIONES Y LICENCIAS</label>
                        <PQRS_EDIT_FUN
                            translation={translation} swaMsg={swaMsg} globals={globals}
                            currentItem={currentItem}
                            refreshCurrentItem={retrieveItem}
                        />
                        <hr />
                        <label className="app-p lead text-start fw-bold">4. DESCRIPCIÓN DE LA SOLICITUD</label>
                        <PQRS_EDIT_INFO
                            translation={translation} swaMsg={swaMsg} globals={globals}
                            translation_form={translation_form}
                            currentItem={currentItem}
                            refreshCurrentItem={retrieveItem}
                            refreshList={refreshList}
                        />
                        <hr />
                        <label className="app-p lead text-start fw-bold">5. DOCUMENTOS ANEXOS</label>
                        <PQRS_EDIT_ATTACH
                            translation={translation} swaMsg={swaMsg} globals={globals}
                            currentItem={currentItem}
                            refreshCurrentItem={retrieveItem}
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
                    NAVIGATION={NAVIGATION}
                />
            </div>
        );
}

export default PQRS_EDIT;