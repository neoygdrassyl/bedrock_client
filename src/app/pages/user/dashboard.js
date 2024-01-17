import React, { Component } from 'react';
import { MDBCol, MDBCard, MDBCardBody, MDBBreadcrumb, MDBBreadcrumbItem } from 'mdb-react-ui-kit';
import { Link } from "react-router-dom";
import { DashBoardCard } from '../../components/dashBoardCards/dashBoardCard.js';

import LOGO_LIGHT_THEME from '../../img/beckrock/Grises_logo.png'
import LOGO_DARK_THEME from '../../img/beckrock/Claros_logo.png'
var pjson = require('../../../../package.json')
const _GLOBAL_ID = process.env.REACT_APP_GLOBAL_ID;

class Dashboard extends Component {

    render() {
        const { translation, breadCrums } = this.props;
        return (
            <div className="Dashboard container">

                <div className="row my-4 d-flex justify-content-center">
                    <MDBBreadcrumb className="mx-5">
                        <MDBBreadcrumbItem>
                            <Link to={'/home'}><i class="fas fa-home"></i> <label className="text-uppercase">{breadCrums.bc_01}</label></Link>
                        </MDBBreadcrumbItem>
                        <MDBBreadcrumbItem active><i class="far fa-bookmark"></i> <label className="text-uppercase">{breadCrums.bc_u1}</label></MDBBreadcrumbItem>
                    </MDBBreadcrumb>

                    <div className="row d-flex justify-content-center">
                        <div className="col-6 text-end">
                            {this.props.theme == 'light'
                                ? <img src={LOGO_LIGHT_THEME} class="d-block w-100" alt="..." />
                                : <img src={LOGO_DARK_THEME} class="d-block w-100" alt="..." />}
                            <sup className="me-5">Beta {pjson.version}</sup>
                        </div>

                    </div>

                    <div className="col-lg-6 col-md-8">
                        <h1 className="text-center my-4">Panel de Control</h1>
                        <hr />
                        <h2 className="text-start my-4">Módulos de Trabajo</h2>
                        <div className="d-flex justify-content-around py-3">
                            <MDBCol md="4" className="px-2">
                                <DashBoardCard title="Buzon de Mensajes" image="fas fa-envelope-open-text fa-3x" link={"/mail"} imageColor=" Crimson" />

                            </MDBCol>
                            <MDBCol md="4" className="px-2">
                                <DashBoardCard title="Calendario de Citas" image="fas fa-calendar-alt fa-3x" link={"/appointments"} imageColor=" MediumSeaGreen" />

                            </MDBCol>

                            <MDBCol md="4" className="px-2">
                                <DashBoardCard title="Ventanilla Única" image="fas fa-file-import fa-3x" link={"/submit"} imageColor=" Khaki" />
                            </MDBCol>
                            <MDBCol md="4" className="px-2">
                                <DashBoardCard title="Publicaciones" image="fas fa-newspaper fa-3x" link={"/publish"} imageColor=" LightSalmon" />
                            </MDBCol>
                            <MDBCol md="4" className="px-2">
                                <DashBoardCard title="Peticiones PQRS" image="fas fa-file-invoice fa-3x" link={"/pqrsadmin"} imageColor=" MediumPurple" />
                            </MDBCol>
                        </div>
                        <div className="d-flex justify-content-around py-3">

                            <MDBCol md="4" className="px-2">
                                <DashBoardCard title="Nomenclaturas" image="fas fa-signature fa-3x" link={"/nomenclature"} imageColor=" Plum" />

                            </MDBCol>

                            <MDBCol md="4" className="px-2">
                                <DashBoardCard title="Archivo" image="fas fa-folder-open fa-3x" link={"/archive"} imageColor=" LightSeaGreen" />

                            </MDBCol>
                            <MDBCol md="4" className="px-2">
                                <DashBoardCard title="Radicar Licencias" image="fas fa-file-alt fa-3x" link={"/fun"} imageColor=" DodgerBlue" />
                            </MDBCol>
                            <MDBCol md="4" className="px-2">
                                <DashBoardCard title="Gestionar Licencias" image="fas fa-folder fa-3x" link={"/funmanage"} imageColor=" DodgerBlue" />
                            </MDBCol>
                            <MDBCol md="4" className="px-2">
                                {_GLOBAL_ID == "cb1" ?
                                    <DashBoardCard title="Normas Urbanas" image="fas fa-home fa-3x" link={"/norms"} imageColor=" darkcyan" />
                                    : null}
                            </MDBCol>   
                        </div>

                        <div className="d-flex justify-content-around">
                        </div>

                        {/* <div className="d-flex justify-content-around my-3">
                            <MDBCol md="4" className="px-3">
                            </MDBCol>

                            <MDBCol md="4" className="px-3">
                            </MDBCol>
                        </div> */}

                        <hr />
                        <h2 className="text-start my-4">Utilidades y Documentación</h2>
                        <div className="d-flex justify-content-around py-3">
                            <MDBCol md="4" className="px-3">
                                <MDBCard className="bg-card">
                                    <MDBCardBody>
                                        <div className="text-center">
                                            <i class="far fa-file-alt fa-4x" style={{ "color": "Crimson" }}></i>
                                        </div>
                                        <div className="text-center">
                                            <Link to={'/osha'}>
                                                <button className="btn-info btn my-3"><h3>DOCUMENTOS</h3></button>
                                            </Link>
                                        </div>
                                    </MDBCardBody>
                                </MDBCard>
                            </MDBCol>
                            <MDBCol md="4" className="px-3">
                                <MDBCard className="bg-card">
                                    <MDBCardBody>
                                        <div className="text-center">
                                            <i class="fas fa-calculator fa-4x" style={{ "color": "Midnightblue" }}></i>
                                        </div>
                                        <div className="text-center">
                                            <Link to={'/calculator'}>
                                                <button className="btn-info btn my-3"><h3>CALCULADORA DE EXPENSAS</h3></button>
                                            </Link>
                                        </div>
                                    </MDBCardBody>
                                </MDBCard>
                            </MDBCol>
                            <MDBCol md="4" className="px-3">
                                <MDBCard className="bg-card">
                                    <MDBCardBody>
                                        <div className="text-center">
                                            <i class="fas fa-book fa-4x" style={{ "color": "darkgrey" }}></i>
                                        </div>
                                        <div className="text-center">
                                            <Link to={'/dictionary'}>
                                                <button className="btn-info btn my-3"><h3>DICCIONARIO DE CONSECUTIVOS</h3></button>
                                            </Link>
                                        </div>
                                    </MDBCardBody>
                                </MDBCard>
                            </MDBCol>
                        </div>

                        <div className="d-flex justify-content-around py-3">
                            <MDBCol md="4" className="px-3">
                                <MDBCard className="bg-card">
                                    <MDBCardBody>
                                        <div className="text-center">
                                            <i class="fas fa-atlas fa-4x" style={{ "color": "Brown" }}></i>
                                        </div>
                                        <div className="text-center">
                                            <Link to={'/guide_user'}>
                                                <button className="btn-info btn my-3"><h3>MANUAL DE USUARIO</h3></button>
                                            </Link>
                                        </div>
                                    </MDBCardBody>
                                </MDBCard>
                            </MDBCol>
                            <MDBCol md="4" className="px-3">
                                <MDBCard className="bg-card">
                                    <MDBCardBody>
                                        <div className="text-center">
                                            <i class="fas fa-hard-hat fa-4x" style={{ "color": "Black" }}></i>
                                        </div>
                                        <div className="text-center">
                                            <Link to={'/profesionals'}>
                                                <button className="btn-info btn my-3"><h3>BASE DE DATOS PROFESIONALES</h3></button>
                                            </Link>
                                        </div>
                                    </MDBCardBody>
                                </MDBCard>
                            </MDBCol>
                            <MDBCol md="4" className="px-3">
                                <MDBCard className="bg-card">
                                    <MDBCardBody>
                                        <div className="text-center">
                                            <i class="fas fa-address-book fa-4x" style={{ "color": "MediumSeaGreen" }}></i>
                                        </div>
                                        <div className="text-center">
                                            <Link to={'/certs'}>
                                                <button className="btn-info btn my-3"><h3>HISTORIAL PROFESIONALES</h3></button>
                                            </Link>
                                        </div>
                                    </MDBCardBody>
                                </MDBCard>
                            </MDBCol>
                        </div>
                    </div>
                </div>
            </div >
        );
    }
}

export default Dashboard;