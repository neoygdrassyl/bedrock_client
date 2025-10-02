import React, { Component } from 'react';
import { MDBCol, MDBCard, MDBCardBody, MDBBreadcrumb, MDBBreadcrumbItem } from 'mdb-react-ui-kit';
import { Link, Route } from "react-router-dom";
import { DashBoardCard } from '../../components/dashBoardCards/dashBoardCard.js';
import Title from '../../components/title';

import { withTranslation } from "react-i18next";

import LOGO_LIGHT_THEME from '../../img/beckrock/Grises_logo.png'
import LOGO_DARK_THEME from '../../img/beckrock/Claros_logo.png'
var pjson = require('../../../../package.json')
const _GLOBAL_ID = process.env.REACT_APP_GLOBAL_ID;
const classnameCards = "px-3 d-flex justify-content-center";

class Dashboard extends Component {

    render() {
        const { translation, breadCrums } = this.props;
        const { t } = this.props;
        return (
            <div className="Dashboard container container-fluid p-0">

                <div className="col-12 d-flex justify-content-start p-0">
                    <MDBBreadcrumb className="">
                        <MDBBreadcrumbItem>
                            <Link to={'/home'}><i class="fas fa-home"></i> <label className="text-uppercase">{breadCrums.bc_01}</label></Link>
                        </MDBBreadcrumbItem>
                        <MDBBreadcrumbItem active><i class="far fa-bookmark"></i> <label className="text-uppercase">{breadCrums.bc_u1}</label></MDBBreadcrumbItem>
                    </MDBBreadcrumb>
                </div>

                <div className="row mb-2 d-flex justify-content-center">

                    <div className="col-lg-10 col-md-12">
                        <h1 className="text-center my-4">Panel de Control</h1>
                        <hr />
                        <h2 className="text-start my-4">Módulos de Trabajo</h2>
                        <div className="d-flex justify-content-around py-3">
                            <MDBCol className={classnameCards}>
                                <DashBoardCard title="Buzón de Mensajes" image="fas fa-envelope-open-text fa-3x" link={"/mail"} imageColor=" Crimson" />

                            </MDBCol>
                            <MDBCol className={classnameCards}>
                                <DashBoardCard title="Calendario de Citas" image="fas fa-calendar-alt fa-3x" link={"/appointments"} imageColor=" MediumSeaGreen" />

                            </MDBCol>

                            <MDBCol className={classnameCards}>
                                <DashBoardCard title="Ventanilla Única" image="fas fa-file-import fa-3x" link={"/submit"} imageColor=" Khaki" />
                            </MDBCol>
                            <MDBCol className={classnameCards}>
                                <DashBoardCard title="Publicaciones" image="fas fa-newspaper fa-3x" link={"/publish"} imageColor=" LightSalmon" />
                            </MDBCol>
                            <MDBCol className={classnameCards}>
                                <DashBoardCard title="Peticiones PQRS" image="fas fa-file-invoice fa-3x" link={"/pqrsadmin"} imageColor=" MediumPurple" />
                            </MDBCol>
                        </div>
                        <div className="d-flex justify-content-around py-3">

                            <MDBCol className={classnameCards}>
                                <DashBoardCard title="Nomenclaturas" image="fas fa-signature fa-3x" link={"/nomenclature"} imageColor=" Plum" />
                            </MDBCol>

                            <MDBCol className={classnameCards}>
                                <DashBoardCard title="Archivo" image="fas fa-folder-open fa-3x" link={"/archive"} imageColor=" LightSeaGreen" />

                            </MDBCol>
                            <MDBCol className={classnameCards}>
                                <DashBoardCard title="Radicar Licencias" image="fas fa-file-alt fa-3x" link={"/fun"} imageColor=" DodgerBlue" />
                            </MDBCol>
                            <MDBCol className={classnameCards}>
                                <DashBoardCard title="Gestionar Licencias" image="fas fa-folder fa-3x" link={"/funmanage"} imageColor=" DodgerBlue" />
                            </MDBCol>
                            <MDBCol className={classnameCards}>
                                {_GLOBAL_ID == "cb1" ?
                                    <DashBoardCard title="Normas Urbanas" image="fas fa-home fa-3x" link={"/norms"} imageColor=" darkcyan" />
                                    : null}
                            </MDBCol>
                        </div>

                        <div className="d-flex justify-content-around">
                        </div>

                        <hr />
                        <h2 className="text-start my-4">Utilidades y Documentación</h2>
                        <div className="d-flex justify-content-center py-3">
                            <MDBCol className={classnameCards}>
                                <DashBoardCard title="Documentos" image="far fa-file-alt fa-3x" link={"/osha"} imageColor=" Crimson" />
                            </MDBCol>
                            <MDBCol className={classnameCards}>
                                <DashBoardCard title="Calculadora de Expensas" image="fas fa-calculator fa-3x" link={"/calculator"} imageColor=" Midnightblue" />
                            </MDBCol>
                            <MDBCol className={classnameCards}>
                                <DashBoardCard title="Diccionario de Consecutivos" image="fas fa-book fa-3x" link={"/dictionary"} imageColor=" darkgrey" />
                            </MDBCol>


                            <MDBCol className={classnameCards}>
                                <DashBoardCard title="Manual de Usuario" image="fas fa-atlas fa-3x" link={"/guide_user"} imageColor=" Brown" />
                            </MDBCol>
                            <MDBCol className={classnameCards}>
                                <DashBoardCard title="Base de Datos Profesionales" image="fas fa-hard-hat fa-3x" link={"/profesionals"} imageColor=" Black" />
                            </MDBCol>
                        </div>
                        <div className="d-flex justify-content-center py-3"
                            lassName="px-3">
                            <MDBCol className={classnameCards}>
                                <DashBoardCard title="Historial de Profesionales" image="fas fa-address-book fa-4x" link={"/certs"} imageColor=" MediumSeaGreen" />
                            </MDBCol>
                        </div>
                    </div >
                </div >
            </div >
        );
    }
}

export default withTranslation()(Dashboard);