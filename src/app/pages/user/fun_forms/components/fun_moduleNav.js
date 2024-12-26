import React, { Component } from 'react';
import { MDBBadge, MDBCard, MDBCardBody, MDBTooltip } from 'mdb-react-ui-kit';
import { formsParser1 } from '../../../../components/customClasses/typeParse';
import { regexChecker_isOA_2 } from '../../../../components/customClasses/typeParse'

class FUN_MODULE_NAV extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const { translation, currentItem, currentVersion, FROM } = this.props;

        let _REGEX_MATCH_PH = (_string) => {
            let regex0 = /p\.\s+h/i;
            let regex1 = /p\.h/i;
            let regex2 = /PROPIEDAD\s+HORIZONTAL/i;
            let regex3 = /p\s+h/i;
            if (regex0.test(_string) || regex2.test(_string) || regex1.test(_string) || regex3.test(_string)) return true;
            return false
        }
        let version = currentItem.version
        let fun1 = currentItem.fun_1s[version - 1];
        let type = "";
        if (fun1) type = formsParser1(fun1)

        const isPH = _REGEX_MATCH_PH(type)
        const isOA = regexChecker_isOA_2(fun1)
        const rules = currentItem.rules ? currentItem.rules.split(';') : [];
        return (<>
            {currentItem
                ? <div className="btn-nav_module position-fixed start-0 top-50 translate-middle-y">
                    <div className="">
                        <MDBCard className="container-primary m-1" border='dark' >
                            <MDBCardBody className="p-1">
                                <div className="m-1 text-center">
                                    <div className="d-flex flex-column">
                                        <div className="mb-1 row  mx-2">
                                            <a onClick={() => this.props.NAVIGATION(currentItem, "close", FROM)} className="btn btn-info m-0  shadow-none">
                                                <i className="fas fa-times-circle fa-2x" ></i> <label className="fs-6 d-none d-md-inline align-top">CERRAR</label>
                                            </a>
                                        </div>

                                        <div className="mb-1 row  mx-2">
                                            <a className={`btn btn-sm ${FROM == "general" ? "btn-light" : "btn-info"} m-0 p-2 shadow-none`} 
                                               onClick={() => FROM != "general" && this.props.NAVIGATION(currentItem, "general", FROM)}>
                                                <i className="far fa-folder-open fa-2x" ></i> <label className="fs-6 d-none d-md-inline align-top">DETALLES</label>
                                            </a>
                                        </div>

                                        <div className="mb-1 row  mx-2">
                                            <a className={`btn btn-sm ${FROM == "clock" ? "btn-light" : "btn-info"} m-0 p-2 shadow-none`}
                                               onClick={() => FROM != "clock" && this.props.NAVIGATION(currentItem, "clock", FROM)}>
                                                <i className="far fa-clock fa-2x" ></i> <label className="fs-6 d-none d-md-inline align-top">TIEMPOS</label>
                                            </a>
                                        </div>

                                        <div className="mb-1 row  mx-2">
                                            <a className={`btn btn-sm ${FROM == "archive" ? "btn-light" : "btn-secondary"} m-0 p-2 shadow-none`}
                                               onClick={() => FROM != "archive" && this.props.NAVIGATION(currentItem, "archive", FROM)}>
                                                <i className="fas fa-archive fa-2x" ></i> <label className="fs-6 d-none d-md-inline align-top">DOCUMENTOS</label>
                                            </a>
                                        </div>

                                        {currentItem.state != 101 && currentItem.state <= 200 && (
                                            <>
                                                <div className="mb-1 row  mx-2">
                                                    <a className={`btn btn-sm ${FROM == "edit" ? "btn-light" : "btn-secondary"} m-0 p-2 shadow-none`}
                                                       onClick={() => FROM != "edit" && this.props.NAVIGATION(currentItem, "edit", FROM)}>
                                                        <i className="far fa-folder-open fa-2x" ></i> <label className="fs-6 d-none d-md-inline align-top">ACTUALIZAR</label>
                                                    </a>
                                                </div>

                                                <div className="mb-1 row  mx-2">
                                                    <a className={`btn btn-sm ${FROM == "check" ? "btn-light" : "btn-warning"} m-0 p-2 shadow-none`}
                                                       onClick={() => FROM != "check" && this.props.NAVIGATION(currentItem, "check", FROM)}>
                                                        <i className="far fa-check-square fa-2x" ></i> <label className="fs-6 d-none d-md-inline align-top">CHEKEO</label>
                                                    </a>
                                                </div>

                                                {!isPH ? (
                                                    <>
                                                        {!isOA && rules[0] != 1 && (
                                                            <div className="mb-1 row  mx-2">
                                                                <a className={`btn btn-sm ${FROM == "alert" ? "btn-light" : "btn-warning"} m-0 p-2 shadow-none`}
                                                                   onClick={() => FROM != "alert" && this.props.NAVIGATION(currentItem, "alert", FROM)}>
                                                                    <i className="fas fa-sign fa-2x" ></i> <label className="fs-6 d-none d-md-inline align-top">PUBLICIDAD {this.props.pqrsxfun.length ? <MDBBadge color="primary">PQRS</MDBBadge> : ''}</label>
                                                                </a>
                                                            </div>
                                                        )}

                                                        <div className="mb-1 row  mx-2">
                                                            <a className={`btn btn-sm ${FROM == "record_law" ? "btn-light" : "btn-warning"} m-0 p-2 shadow-none`}
                                                               onClick={() => FROM != "record_law" && this.props.NAVIGATION(currentItem, "record_law", FROM)}>
                                                                <i className="fas fa-balance-scale fa-2x" ></i> <label className="fs-6 d-none d-md-inline align-top">INF. JURÍDICO</label>
                                                            </a>
                                                        </div>

                                                        {!isOA && (
                                                            <>
                                                                <div className="mb-1 row  mx-2">
                                                                    <a className={`btn btn-sm ${FROM == "record_arc" ? "btn-light" : "btn-warning"} m-0 p-2 shadow-none`}
                                                                       onClick={() => FROM != "record_arc" && this.props.NAVIGATION(currentItem, "record_arc", FROM)}>
                                                                        <i className="far fa-building fa-2x" ></i> <label className="fs-6 d-none d-md-inline align-top">INF. ARQ.</label>
                                                                    </a>
                                                                </div>

                                                                {rules[1] != 1 && (
                                                                    <div className="mb-1 row  mx-2">
                                                                        <a className={`btn btn-sm ${FROM == "record_eng" ? "btn-light" : "btn-warning"} m-0 p-2 shadow-none`}
                                                                           onClick={() => FROM != "record_eng" && this.props.NAVIGATION(currentItem, "record_eng", FROM)}>
                                                                            <i className="fas fa-cogs fa-2x" ></i> <label className="fs-6 d-none d-md-inline align-top">INF. ESTRUCT.</label>
                                                                        </a>
                                                                    </div>
                                                                )}

                                                                <div className="mb-1 row  mx-2">
                                                                    <a className={`btn btn-sm ${FROM == "record_review" ? "btn-light" : "btn-warning"} m-0 p-2 shadow-none`}
                                                                       onClick={() => FROM != "record_review" && this.props.NAVIGATION(currentItem, "record_review", FROM)}>
                                                                        <i className="fas fa-file-contract fa-2x" ></i> <label className="fs-6 d-none d-md-inline align-top">ACTA</label>
                                                                    </a>
                                                                </div>
                                                            </>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="mb-1 row  mx-2">
                                                        <a className={`btn btn-sm ${FROM == "record_ph" ? "btn-light" : "btn-warning"} m-0 p-2 shadow-none`}
                                                           onClick={() => FROM != "record_ph" && this.props.NAVIGATION(currentItem, "record_ph", FROM)}>
                                                            <i className="fas fa-pencil-ruler fa-2x" ></i> <label className="fs-6 d-none d-md-inline align-top">INFORME P.H.</label>
                                                        </a>
                                                    </div>
                                                )}
                                                
                                                <div className="mb-1 row  mx-2">
                                                    <a className={`btn btn-sm ${FROM == "expedition" ? "btn-light" : "btn-warning"} m-0 p-2 shadow-none`}
                                                       onClick={() => FROM != "expedition" && this.props.NAVIGATION(currentItem, "expedition", FROM)}>
                                                        <i className="far fa-file-alt fa-2x" ></i> <label className="fs-6 d-none d-md-inline align-top">EXPEDICIÓN</label>
                                                    </a>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </MDBCardBody>
                        </MDBCard>
                    </div>
                </div>
                : ""
            } </>
        );
    }
}

export default FUN_MODULE_NAV;