import React, { Component } from 'react';
import { MDBCard, MDBCardBody } from 'mdb-react-ui-kit';

class FUND_NAV extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion } = this.props;
        return (
            <div className="btn-navpqrs">
                <div className="fung_nav">
                    <MDBCard className="container-primary" border='dark'>
                        <MDBCardBody className="p-1">
                            <legend className="px-3 pt-2 text-uppercase bg-light text-center">
                                <h6>Menu de Navegación</h6>
                            </legend>
                            <br />
                            <a href="#fund_1">
                                <legend className="px-3 text-uppercase btn-info">
                                    <h6>1. GESTIÓN DOCUMENTAL</h6>
                                </legend>
                            </a>
                            <br />
                            <a href="#fund_11">
                                <legend className="px-3 text-uppercase btn-light">
                                    <h6>1.1 DOCUMENTOS DIGITALIZADOS</h6>
                                </legend>
                            </a>
                            <br />
                            <a href="#fund_12">
                                <legend className="px-3 text-uppercase btn-light">
                                    <h6>1.2 DOCUMENTOS DE VENTANILLA ÚNICA</h6>
                                </legend>
                            </a>
                            <br />
                            <a href="#fund_2">
                                <legend className="px-3 text-uppercase btn-info">
                                    <h6>2. ANEXAR DOCUMENTOS</h6>
                                </legend>
                            </a>
                            {currentItem.state >= 5
                                ? <>
                                    <br />
                                    <a href="#fund_3" >
                                        <legend className="px-3 text-uppercase btn-info">
                                            <h6>3. LISTA DE CHEQUEO</h6>
                                        </legend>
                                    </a>
                                </> : ""}
                            {currentItem.state >= 5
                                ? <>
                                    <br />
                                    <a href="#fund_4">
                                        <legend className="px-3 text-uppercase btn-info">
                                            <h6>4. GENERAR DOCUMENTOS AUTOMÁTICOS</h6>
                                        </legend>
                                    </a>
                                </> : ""}
                            <br />
                            <a href="#fund_pdf" >
                                <legend className="px-3 text-uppercase btn-danger">
                                    <h6>PDF Formulario Único Nacional</h6>
                                </legend>
                            </a>
                            <br />
                            <a href="#fund_pdf2" >
                                <legend className="px-3 text-uppercase btn-danger">
                                    <h6>PDF Formulario Lista Checkeo</h6>
                                </legend>
                            </a>
                            {currentItem.state >= 5
                                ? <>
                                    <br />
                                    <a href="#fund_21" >
                                        <legend className="px-3 text-uppercase btn-success">
                                            <h6>Documento de Confirmación</h6>
                                        </legend>
                                    </a>
                                    <br />
                                    <a href="#fund_sign" >
                                        <legend className="px-3 text-uppercase btn-success">
                                            <h6>Valla</h6>
                                        </legend>
                                    </a>
                                </> : ""}
                            <br />
                            <a href="#fund_seal" >
                                <legend className="px-3 text-uppercase btn-success">
                                    <h6>Sello</h6>
                                </legend>
                            </a>
                            <br />
                            <a href="#fund_22" >
                                <legend className="px-3 text-uppercase btn-success">
                                    <h6>DOCUMENTOS DE CITACIÓN</h6>
                                </legend>
                            </a>
                            {currentItem.state >= 5
                                ? <>
                                    <br />
                                    <a href="#fund_doc_control" >
                                        <legend className="px-3 text-uppercase btn-success">
                                            <h6>Control Documental</h6>
                                        </legend>
                                    </a>
                                </> : ""}
                            <br />
                            <a href="#fund_5">
                                <legend className="px-3 text-uppercase btn-info">
                                    <h6>5. CONTROL DE DOCUMENTACIÓN ESPECIAL </h6>
                                </legend>
                            </a>


                            <br />
                            <a href="#fund_23" >
                                <legend className="px-3 text-uppercase btn-success">
                                    <h6>CONTROL DE REPORTE DE PLANEACIÓN</h6>
                                </legend>
                            </a>

                        </MDBCardBody>
                    </MDBCard>
                </div>
            </div>
        );
    }
}

export default FUND_NAV;