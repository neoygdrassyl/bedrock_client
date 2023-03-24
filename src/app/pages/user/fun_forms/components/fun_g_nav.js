import React, { Component } from 'react';
import { MDBCard, MDBCardBody } from 'mdb-react-ui-kit';

class FUNG_NAV extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion } = this.props;
        return (
            <div className="btn-navpqrs">
                <div className="fung_nav">
                    <MDBCard className="container-primary" border='dark' >
                        <MDBCardBody className="p-1">

                            <legend className="px-3 pt-2 text-uppercase bg-light text-center">
                                <h6>Menu de Navegación</h6>
                            </legend>
                            <br />
                            <a href="#fung_0">
                                <legend className="px-3 text-uppercase btn-success">
                                    <h6>0. Recibo de pago de Expensas Fijas</h6>
                                </legend>
                            </a>
                            <br />
                            <a href="#fung_1">
                                <legend className="px-3 text-uppercase btn-info">
                                    <h6>1. Identificación de la Solicitud</h6>
                                </legend>
                            </a>
                            <br />
                            <a href="#fung_2">
                                <legend className="px-3 text-uppercase btn-info">
                                    <h6>2. Información del Predio</h6>
                                </legend>
                            </a>
                            <br />
                            <a href="#fung_3">
                                <legend className="px-3 text-uppercase btn-info">
                                    <h6>3. Información de Vecinos Colindante</h6>
                                </legend>
                            </a>
                            <br />
                            <a href="#fung_4">
                                <legend className="px-3 text-uppercase btn-info">
                                    <h6>4. Linderos, Dimensiones y Áreas</h6>
                                </legend>
                            </a>
                            <br />
                            <a href="#fung_51">
                                <legend className="px-3 text-uppercase btn-info">
                                    <h6>5.1 Titular(es) de la Licencia</h6>
                                </legend>
                            </a>
                            <br />
                            <a href="#fung_52">
                                <legend className="px-3 text-uppercase btn-info">
                                    <h6>5.2 Profesionales Responsables</h6>
                                </legend>
                            </a>
                            <br />
                            <a href="#fung_53">
                                <legend className="px-3 text-uppercase btn-info">
                                    <h6>5.3 Responsable de la Solicitud</h6>
                                </legend>
                            </a>
                            <br />
                            <a href="#fung_c" >
                                <legend className="px-3 text-uppercase btn-success">
                                    <h6>C. LISTA DE CHECKEO</h6>
                                </legend>
                            </a>
                            <br />
                            <a href="#fung_c1">
                                <legend className="px-3 text-uppercase btn-light">
                                    <h6>C.1 ENCARGADO DE LA REVISION</h6>
                                </legend>
                            </a>
                            <br />
                            <a href="#fung_c2">
                                <legend className="px-3 text-uppercase btn-light">
                                    <h6>C.2 CONDICIÓN DE LA RADICACIÓN</h6>
                                </legend>
                            </a>
                            <br />
                            <a href="#fung_c3">
                                <legend className="px-3 text-uppercase btn-info">
                                    <h6>6. LISTA DE CHEQUEO DE DOCUMENTOS</h6>
                                </legend>
                            </a>
                            <br />
                            <a href="#fung_c4">
                                <legend className="px-3 text-uppercase btn-info">
                                    <h6>7. GESTIÓN DOCUMENTAL</h6>
                                </legend>
                            </a>
                            <br />
                            <a href="#fung_mix" >
                                <legend className="px-3 text-uppercase btn-info">
                                    <h6>8. DATOS VARIOS</h6>
                                </legend>
                            </a>
                            <br />
                            <a href="#fung_mix_sign">
                                <legend className="px-3 text-uppercase btn-light">
                                    <h6>8.1 PUBLICIDAD</h6>
                                </legend>
                            </a>
                            <br />
                            <a href="#fung_mix_report">
                                <legend className="px-3 text-uppercase btn-light">
                                    <h6>8.2 REPORTE DE PLANEACIÓN</h6>
                                </legend>
                            </a>

                            <a href="#fung_report" >
                                <legend className="px-3 text-uppercase btn-info">
                                    <h6>9. INFORMES</h6>
                                </legend>
                            </a>
                            <br />
                            <a href="#fung_report_jur">
                                <legend className="px-3 text-uppercase btn-light">
                                    <h6>9.1 INFORME JURÍDICO</h6>
                                </legend>
                            </a>
                            <br />
                            <a href="#fung_repor_arc">
                                <legend className="px-3 text-uppercase btn-light">
                                    <h6>9.2 INFORME ARQUITECTÓNICO</h6>
                                </legend>
                            </a>
                            <br />
                            <a href="#fung_repor_eng">
                                <legend className="px-3 text-uppercase btn-light">
                                    <h6>9.3 INFORME ESTRUCTURAL</h6>
                                </legend>
                            </a>
                        </MDBCardBody>
                    </MDBCard>
                </div>
            </div>
        );
    }
}

export default FUNG_NAV;