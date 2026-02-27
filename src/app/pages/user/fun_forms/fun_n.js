import { useState, useEffect } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { MDBCard, MDBCardBody } from '../../../components/ui';
import { MDBTypography } from '../../../components/ui';

// FUN FAMILY
import FUNN1 from './fun_n_1'
import FUNN2 from './fun_n_2'
import FUNN3 from './fun_n_3'
import FUNN4 from './fun_n_4'
import FUNN51 from './fun_n_51'
import FUNN52 from './fun_n_52'
import FUNN53 from './fun_n_53'
import FUN_MODULE_NAV from './components/fun_moduleNav';
import FUN_VERSION_NAV from './components/fun_versionNav';
import FUN_0_RECIPE from './components/fun_0_recipe';
import FUN_PDF from './components/fun_pdf';

import FUN_SERVICE from '../../../services/fun.service';
import FUN_ARCHIVE from './components/fun_archive.component';
import FUN_ANEX from './fun_anex';
import ARCHIVE_FUN_VIEW from '../archive/arcXfun_view.component';

const MySwal = withReactContent(Swal);
function FUNN({ translation, swaMsg, globals, currentVersion, currentId, requesRefresh, NAVIGATION, NAVIGATION_VERSION }) {
    const [currentItem, setCurrentItem] = useState(null);
    const [pqrsxfun, setPqrsxfun] = useState(false);

    const requestUpdate = (id) => {
        retrieveItem(id);
        requesRefresh();
    };
    const retrieveItem = (id) => {
        FUN_SERVICE.get(id)
            .then(response => {
                setCurrentItem(response.data);
                retrievePQRSxFUN(response.data.id_public);
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
    };
    const retrievePQRSxFUN = (id_public) => {
        FUN_SERVICE.loadPQRSxFUN(id_public)
            .then(response => {
                setPqrsxfun(response.data);
            })
            .catch(e => {
                console.log(e);
            });
    };

    useEffect(() => {
        retrieveItem(currentId);
    }, []);

        return (
            <div className="py-3">
                {currentItem != null ? <>
                    <MDBTypography note noteColor='info'>
                        <h3 className="text-justify text-dark">RECOMENDACIONES GENERALES PARA LA FORMULACIÓN DE SOLICITUDES</h3>
                        <ul>
                            <li>Cedulas de Ciudadanía y documentos de identificación, usar punto cada 3 números. (x.xxx.xxx.xxx)</li>
                            <li>Direcciones, usar la nomenclatura completa, y usar el símbolo ° para el numero (Carrera, Calle, Diagonal, Transversal, Avenida, N° ) </li>
                            <li>Números de Celular y Contacto: Usar espacios para su separación (xxx xxx xxxx)</li>
                            <li>Numero de Matricula Inmobiliaria, comenzar el valor con 300- (300-xxxxx)</li>
                            <li>Numero de Identificación Catastral, usar - para su separación (xx-xx-xxxx-xxx-xxx)</li>
                        </ul>
                    </MDBTypography>
                    {currentItem != null ? <>
                        <h2 className="text-center">ACTUALIZAR RADICACIÓN</h2>

                        <fieldset className="p-3">
                            <legend className="my-2 px-3 text-uppercase bg-success" id="fun_0">
                                <label className="app-p lead fw-normal text-uppercase text-light">0. Metadatos de la Solicitud</label>
                            </legend>
                            <FUN_0_RECIPE
                                translation={translation}
                                swaMsg={swaMsg}
                                globals={globals}
                                currentItem={currentItem}
                                currentVersion={currentVersion}
                                requestUpdate={requestUpdate} />

                            <legend className="my-2 px-3 text-uppercase bg-light" id="fun_arch">
                                <label className="app-p lead fw-normal text-uppercase">ARCHIVO</label>
                            </legend>
                            <ARCHIVE_FUN_VIEW
                                translation={translation}
                                swaMsg={swaMsg}
                                globals={globals}
                                currentItem={currentItem}
                            />

                        </fieldset>

                        <FUNN1
                            translation={translation}
                            swaMsg={swaMsg}
                            globals={globals}
                            currentItem={currentItem}
                            currentVersion={currentVersion}
                            requestUpdate={requestUpdate} />


                        <FUNN2
                            translation={translation}
                            swaMsg={swaMsg}
                            globals={globals}
                            currentItem={currentItem}
                            currentVersion={currentVersion}
                            requestUpdate={requestUpdate} />

                        <FUNN3
                            translation={translation}
                            swaMsg={swaMsg}
                            globals={globals}
                            currentItem={currentItem}
                            currentVersion={currentVersion}
                            requestUpdate={requestUpdate} />

                        <FUNN4
                            translation={translation}
                            swaMsg={swaMsg}
                            globals={globals}
                            currentItem={currentItem}
                            currentVersion={currentVersion}
                            requestUpdate={requestUpdate} />


                        <legend className="my-2 px-3 text-uppercase Collapsible">
                            <label>5 Titulares y profesionales responsables </label>
                        </legend>

                        <FUNN51
                            translation={translation}
                            swaMsg={swaMsg}
                            globals={globals}
                            currentItem={currentItem}
                            currentVersion={currentVersion}
                            requestUpdate={requestUpdate} />

                        <FUNN52
                            translation={translation}
                            swaMsg={swaMsg}
                            globals={globals}
                            currentItem={currentItem}
                            currentVersion={currentVersion}
                            requestUpdate={requestUpdate} />

                        <FUNN53
                            translation={translation}
                            swaMsg={swaMsg}
                            globals={globals}
                            currentItem={currentItem}
                            currentVersion={currentVersion}
                            requestUpdate={requestUpdate} />

                        {/* <NAV_FUNN /> */}
                        <FUN_MODULE_NAV
                            translation={translation}
                            currentItem={currentItem}
                            currentVersion={currentVersion}
                            FROM={"edit"}
                            NAVIGATION={NAVIGATION}
                            pqrsxfun={pqrsxfun}

                        />
                        <FUN_VERSION_NAV
                            translation={translation}
                            currentItem={currentItem}
                            currentVersion={currentVersion}
                            NAVIGATION_VERSION={NAVIGATION_VERSION}
                            ON
                        />
                    </> : ""}

                    {currentItem.model >= 2022 ?
                        <FUN_ANEX
                            translation={translation}
                            swaMsg={swaMsg}
                            globals={globals}
                            currentItem={currentItem}
                            currentVersion={currentVersion}
                            requestUpdate={requestUpdate} />
                        : ''}


                    <fieldset className="p-3">
                        <legend className="my-2 px-3 text-uppercase bg-danger" id="fun_pdf">
                            <label className="app-p lead fw-normal text-uppercase text-light">DESCARGAR PDF</label>
                        </legend>
                        <FUN_PDF
                            translation={translation}
                            swaMsg={swaMsg}
                            globals={globals}
                            currentItem={currentItem}
                            currentVersion={currentVersion}
                        />
                    </fieldset>
                </> : <fieldset className="p-3" id="fung_0">
                    <div className="text-center"> <h3 className="fw-bold ">CARGANDO INFORMACIÓN...</h3></div>
                </fieldset>}
            </div>
        );
}

// const NAV_FUNN = () => {
//     return (
//         <div className="btn-navpqrs">
//             <MDBCard className="container-primary" border='dark'>
//                 <MDBCardBody className="p-1">

//                     <legend className="px-3 pt-2 text-uppercase bg-light text-center">
//                         <h6>Menu de Navegación</h6>
//                     </legend>
//                     <br />
//                     <a href="#fun_0">
//                         <legend className="px-3 text-uppercase btn-success">
//                             <h6>0. Meta datos</h6>
//                         </legend>
//                     </a>
//                     <br />
//                     <a href="#funn_1">
//                         <legend className="px-3 text-uppercase btn-info">
//                             <h6>1. Identificación de la Solicitud</h6>
//                         </legend>
//                     </a>
//                     <br />
//                     <a href="#funn_2">
//                         <legend className="px-3 text-uppercase btn-info">
//                             <h6>2. Información del Predio</h6>
//                         </legend>
//                     </a>
//                     <br />
//                     <a href="#funn_3">
//                         <legend className="px-3 text-uppercase btn-info">
//                             <h6>3. Información de Vecinos Colindante</h6>
//                         </legend>
//                     </a>
//                     <br />
//                     <a href="#funn_4">
//                         <legend className="px-3 text-uppercase btn-info">
//                             <h6>4. Linderos, Dimensiones y Áreas</h6>
//                         </legend>
//                     </a>
//                     <br />
//                     <a href="#funn_51">
//                         <legend className="px-3 text-uppercase btn-info">
//                             <h6>5.1 Titular(es) de la Licencia</h6>
//                         </legend>
//                     </a>
//                     <br />
//                     <a href="#funn_52">
//                         <legend className="px-3 text-uppercase btn-info">
//                             <h6>5.2 Profesionales Responsables</h6>
//                         </legend>
//                     </a>
//                     <br />
//                     <a href="#funn_53">
//                         <legend className="px-3 text-uppercase btn-info">
//                             <h6>5.3 Responsable de la Solicitud</h6>
//                         </legend>
//                     </a>
//                     <br />
//                     <a href="#fun_pdf">
//                         <legend className="px-3 text-uppercase btn-danger">
//                             <h6>DESCARGAR PDF</h6>
//                         </legend>
//                     </a>
//                 </MDBCardBody>
//             </MDBCard>
//         </div>
//     );
// }

export default FUNN;