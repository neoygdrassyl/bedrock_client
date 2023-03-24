import React, { Component } from 'react';
import { MDBBreadcrumb, MDBBreadcrumbItem } from 'mdb-react-ui-kit';
import { Link } from "react-router-dom";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal);
class OSHA extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { translation, swaMsg, breadCrums } = this.props;
        const { } = this.state;
        const HOMEPATH = '//www.curaduria1bucaramanga.com/public_docs/OTHERS/osha/';
        const HOMEPATH2 = '//www.curaduria1bucaramanga.com/public_docs/OTHERS/intranet/';
        const HOMEPATH3 = '//www.curaduria1bucaramanga.com/public_docs/OTHERS/tutorials/';
        // THIS CONTAINS THE PATH AND NAME OF THE OSHA DOCS, THEY ARE NOT GOING TO BE UPDATED IN THE FORSEABLE FUTURE, ONLY OCATIONALLY
        let _DOCS_INFO = {
            "0": { path: "1. Recursos", name: "SST-FT-01 Presupuesto Sistema de seguridad SST 2021", ext: "xlsx" },
            
            "1": { path: "2. Politicas SG-SST", name: "SST-FT-02 Politica SG-SST(1)", ext: "docx" },
            "2": { path: "2. Politicas SG-SST", name: "SST-FT-02 Politica SG-SST", ext: "docx" },
            "3": { path: "2. Politicas SG-SST", name: "SST-FT-03 Politica de no alcohol y sustancias psicoactivas", ext: "docx" },
            "4": { path: "2. Politicas SG-SST", name: "SST-FT-04 Politica de acoso laboral", ext: "docx" },

            "5": { path: "3. Responsable SG-SST", name: "SST-FT-05 Representante por la direccion", ext: "docx" },

            "6": { path: "4. Objetivos SST", name: "SST-FT-06 OBJETIVOS DEL SGSST", ext: "docx" },

            "7": { path: "5. Evaluaciones iniciales", name: "Estandares Minimo SST - Resolucion 312 de 2019", ext: "xlsx" },

            "8": { path: "6. Reglamentos", name: "SST-MN-01 REGLAMENTO DE TRABAJO", ext: "docx" },
            "9": { path: "6. Reglamentos", name: "SST-MN-02 REGLAMENTO DE HIGIENE Y SEGURIDAD INDUSTRIAL", ext: "doc" },

            "10": { path: "7. Comites SST/COMITE DE CONVIVENCIA LABORAL", name: "Acoso Laboral", ext: "pdf" },
            "11": { path: "7. Comites SST/COMITE DE CONVIVENCIA LABORAL", name: "Acta de conformacion de Comite de convivencia", ext: "docx" },
            "12": { path: "7. Comites SST/COMITE DE CONVIVENCIA LABORAL", name: "SST-FT-07 Acta de reunion CCL 01", ext: "doc" },
            "13": { path: "7. Comites SST/COMITE DE CONVIVENCIA LABORAL", name: "SST-FT-08 Quejas de comite de convivencia laboral", ext: "docx" },
            "14": { path: "7. Comites SST/COMITE DE CONVIVENCIA LABORAL", name: "SST-MN-05 Reglamento Comite de convivencia laboral", ext: "doc" },
            "15": { path: "7. Comites SST/VIGIA -SST", name: "Acta de convocatoria y eleccion VIGIA SST", ext: "doc" },
            "16": { path: "7. Comites SST/VIGIA -SST", name: "SST-FT-07 Acta de reunion CO 01-2021", ext: "docx" },

            "17": { path: "8. Identificacion de peligros", name: "SST-FT-12 MATRIZ DE IDENTIFICACION DE PELIGRO Y VALORACION DEL RIESGO", ext: "xls" },
            "18": { path: "8. Identificacion de peligros", name: "SST-PR-01 Procedimiento Identificacion y valoracion del riesgo", ext: "doc" },

            "19": { path: "9. Requisitos legales", name: "SST-FT-18 Matriz de requisitos legales", ext: "xlsx" },
            "20": { path: "9. Requisitos legales", name: "SST-PR-02 Procedimiento Requisitos legales y otros SST", ext: "doc" },

            "21": { path: "10. Induccion de personal", name: "DATOS PARA EL PERFIL SOCIODEMOGRAFICO", ext: "xlsx" },
            "22": { path: "10. Induccion de personal", name: "SST-FT-11 Perfil sociodemografico", ext: "xlsx" },
            "23": { path: "10. Induccion de personal", name: "SST-FT-13 Entrega de dotacion", ext: "xlsx" },
            "24": { path: "10. Induccion de personal", name: "SST-FT-27 Matriz de EPP", ext: "xlsx" },
            "25": { path: "10. Induccion de personal", name: "SST-FT-28 Induccion y reinduccion de personal", ext: "docx" },
            "26": { path: "10. Induccion de personal", name: "SST-FT-29 Evaluacion de desempeno", ext: "doc" },
            "27": { path: "10. Induccion de personal", name: "SST-MN-04 Manual de induccion", ext: "docx" },
            "28": { path: "10. Induccion de personal", name: "SST-PR-03 Procedimiento Seleccion, contratacion e induccion", ext: "doc" },
            "29": { path: "10. Induccion de personal", name: "SST-PR-04 Procedimiento Suministro y entrenamiento en EPP", ext: "doc" },

            "30": { path: "11. Manual de funciones", name: "SST-FT-30 Roles y responsabilidades", ext: "docx" },
            "31": { path: "11. Manual de funciones", name: "SST-MN-03 MANUAL DE FUNCIONES Y RESPONSABILIDADES", ext: "docx" },

            "32": { path: "12. Examenes medicos ocupacionales", name: "Carta de recomendaciones examenes medicos", ext: "docx" },
            "33": { path: "12. Examenes medicos ocupacionales", name: "Informe de condiciones de salud 2021", ext: "pdf" },
            "34": { path: "12. Examenes medicos ocupacionales", name: "SST-FT-31 Seguimiento a examenes ocupacionales", ext: "xls" },
            "35": { path: "12. Examenes medicos ocupacionales", name: "SST-FT-32 Profesiograma", ext: "xlsx" },
            "36": { path: "12. Examenes medicos ocupacionales", name: "SST-PR-05 PROCEDIMIENTO EXAMENES MEDICOS OCUPACIONALES", ext: "doc" },
            "37": { path: "12. Examenes medicos ocupacionales", name: "SST-PR-06 PROCEDIMIENTO REUBICACION PERSONAL", ext: "doc" },

            "38": { path: "13. Plan de Capacitacion", name: "SST-FT-14 Listado de asistencia", ext: "doc" },
            "40": { path: "13. Plan de Capacitacion", name: "SST-FT-35 Plan de formacion", ext: "xlsx" },

            "41": { path: "14. Plan de trabajo anual", name: "SST-FT-09 Plan de trabajo anual 2021", ext: "xlsx" },

            "42": { path: "15. Gestion del Cambio", name: "SST-FT-37 Reporte de cambios", ext: "xlsx" },
            "43": { path: "15. Gestion del Cambio", name: "SST-PR-07 Procedimiento Gestion del cambio", ext: "doc" },

            "44": { path: "16. Control de documentos", name: "SST-FT-10 Listado de documentos y registros", ext: "xlsx" },
            "45": { path: "16. Control de documentos", name: "SST-PR-08 Procedimiento Control de Documentos y registros ", ext: "doc" },

            "46": { path: "17. Acciones Correctivas y mejora", name: "SST-FT-38 Reporte de accion correctiva y preventiva ", ext: "docx" },
            "47": { path: "17. Acciones Correctivas y mejora", name: "SST-PR-09 Procedimiento Acciones correctivas y preventivas", ext: "docx" },

            "48": { path: "18. Investigacion de AT", name: "SST-FT-40 Responsable de investigacion de accidente o", ext: "docx" },
            "49": { path: "18. Investigacion de AT", name: "SST-FT-41 Formato Investigacion de accidentes", ext: "xlsx" },
            "50": { path: "18. Investigacion de AT", name: "SST-FT-42 Autoreporte ", ext: "docx" },
            "51": { path: "18. Investigacion de AT", name: "SST-FT-43 Permiso laboral", ext: "docx" },
            "52": { path: "18. Investigacion de AT", name: "SST-PR-10 Investigacion de incidentes y accidentes", ext: "docx" },

            "53": { path: "19. Mantenimiento de Equipos e Infraestructura", name: "SST-FT-44 Cronograma de mantenimiento", ext: "xls" },
            "54": { path: "19. Mantenimiento de Equipos e Infraestructura", name: "SST-FT-45 Ficha y reporte de equipos", ext: "xlsx" },
            "55": { path: "19. Mantenimiento de Equipos e Infraestructura", name: "SST-PR-11 Procedimiento Mantenimiento Infraestructura.", ext: "doc" },

            "56": { path: "22. Inspecciones", name: "SST-FT 15 Inspeccion Control Botiquin ", ext: "docx" },
            "57": { path: "22. Inspecciones", name: "SST-FT 16 Inspeccion a extintores", ext: "docx" },
            "58": { path: "22. Inspecciones", name: "SST-FT-17 Inspeccion Elementos de proteccion personal", ext: "doc" },
            "59": { path: "22. Inspecciones", name: "SST-FT-19 Inspeccion puesto de trabajo", ext: "doc" },
            "60": { path: "22. Inspecciones", name: "SST-FT-20 Cronograma de inspecciones", ext: "xlsx" },
            "61": { path: "22. Inspecciones", name: "SST-PR-14 Programa de inspecciones SST", ext: "doc" },

            "62": { path: "26. Rendicion de cuentas", name: "SST-PR-16 Procedimiento rendicion de cuentas", ext: "docx" },

            "63": { path: "27. Revision por la Direccion", name: "SST-FT-25 Matriz de Comunicaciones", ext: "doc" },
            "64": { path: "27. Revision por la Direccion", name: "SST-FT-26 Acta de revision por la direccion", ext: "doc" },
            "65": { path: "27. Revision por la Direccion", name: "SST-PR-15 Procedimiento Revision por la direccion", ext: "doc" }
        }

        let _DOCS_2_INFO = [
            { category: "1. Documento de Intranet", name: "PROCESO DE REVISION DEL EXPEDIENTE DEL PROYECTO 2022 APROBADO 01.10.2022", ext: "pdf" },
        ]

        let _DOCS_3_INFO = [
            { category: "1. Manual de la Pagina Principal", name: "Manual pagina principal", ext: "pdf" },
        ]
        let _GET_EXT_ICON = (_ext) => {
            switch (_ext) {
                case "docx":
                    return <><i class="far fa-file-word fa-2x" style={{ "color": "DodgerBlue" }}></i></>
                case "doc":
                    return <><i class="far fa-file-word fa-2x" style={{ "color": "DeepSkyBlue" }}></i></>
                case "xls":
                    return <><i class="far fa-file-excel fa-2x" style={{ "color": "ForestGreen" }}></i></>
                case "xlsx":
                    return <><i class="far fa-file-excel fa-2x" style={{ "color": "DarkGreen" }}></i></>
                case "pdf":
                    return <><i class="far fa-file-pdf fa-2x" style={{ "color": "Crimson" }}></i></>
                default:
                    return "";
            }
        }
        let _TABLE_COMPONENT_OSHA = () => {
            var _COMPONENT = [];
            console.log(_DOCS_INFO.length)
            for (const i in _DOCS_INFO) {
                _COMPONENT.push(<>
                    <tr>
                        <td><label className="">{_DOCS_INFO[i].path}</label></td>
                        <td><label className="fw-bold">{_DOCS_INFO[i].name}</label></td>
                        <td><a href={HOMEPATH + _DOCS_INFO[i].path + "/" + _DOCS_INFO[i].name + "." + _DOCS_INFO[i].ext} target="_blank">{_GET_EXT_ICON(_DOCS_INFO[i].ext)}</a>
                        </td>
                    </tr>
                </>)
            }
            return <>{_COMPONENT}</>
        }
        let _TABLE_COMPONENT_INTRANET = () => {
            return _DOCS_2_INFO.map(doc => {
                return <tr>
                    <td><label className="">{doc.category}</label></td>
                    <td><label className="fw-bold">{doc.name}</label></td>
                    <td><a href={HOMEPATH2 + doc.name + "." + doc.ext} target="_blank">{_GET_EXT_ICON(doc.ext)}</a>
                    </td>
                </tr>
            })
        }
        let _TABLE_COMPONENT_TUTORIALS = () => {
            return _DOCS_3_INFO.map(doc => {
                return <tr>
                    <td><label className="">{doc.category}</label></td>
                    <td><label className="fw-bold">{doc.name}</label></td>
                    <td><a href={HOMEPATH3 + doc.name + "." + doc.ext} target="_blank">{_GET_EXT_ICON(doc.ext)}</a>
                    </td>
                </tr>
            })
        }

        return (

            <div className="osha container">
                <div className="row my-4 d-flex justify-content-center">
                    <MDBBreadcrumb className="mx-5">
                        <MDBBreadcrumbItem>
                            <Link to={'/home'}><i class="fas fa-home"></i> <label className="text-uppercase">{breadCrums.bc_01}</label></Link>
                        </MDBBreadcrumbItem>
                        <MDBBreadcrumbItem>
                            <Link to={'/dashboard'}><i class="far fa-bookmark"></i> <label className="text-uppercase">{breadCrums.bc_u1}</label></Link>
                        </MDBBreadcrumbItem>
                        <MDBBreadcrumbItem active><i class="fas fa-file-alt"></i>  <label className="text-uppercase">{breadCrums.bc_u8}</label></MDBBreadcrumbItem>
                    </MDBBreadcrumb>
                    <div className="col-lg-8 col-md-10">
                        <h1 className="text-center my-4">DOCUMENTACION INTRANET</h1>
                        <hr />
                        <table className="table table-bordered table-sm table-hover text-start">
                            <tbody>
                                {_TABLE_COMPONENT_INTRANET()}
                            </tbody>
                        </table>
                    </div>

                    <div className="col-lg-8 col-md-10">
                        <h1 className="text-center my-4">DOCUMENTACION DE TUTORALES Y MANUALES</h1>
                        <hr />
                        <table className="table table-bordered table-sm table-hover text-start">
                            <tbody>
                                {_TABLE_COMPONENT_TUTORIALS()}
                            </tbody>
                        </table>
                    </div>

                    <div className="col-lg-8 col-md-10">
                        <h1 className="text-center my-4">DOCUMENTACION SALUD OCUPACIONAL</h1>
                        <hr />
                        <table className="table table-bordered table-sm table-hover text-start">
                            <tbody>
                                {_TABLE_COMPONENT_OSHA()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div >
        );
    }
}

export default OSHA;