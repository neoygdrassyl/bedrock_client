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
                ? <div className="btn-nav_module">
                    <div className="">
                        <MDBCard className="container-primary m-1" border='dark' >
                            <MDBCardBody className="p-1">
                                <div className="m-1 text-center">

                                    <div className="row mx-2 mb-1">
                                        <a onClick={() => this.props.NAVIGATION(currentItem, "close", FROM)} className="btn btn-info m-0 p-2 shadow-none">
                                            <i class="fas fa-times-circle fa-2x" ></i> <label className="fs-6 align-top">CERRAR</label>
                                        </a>
                                    </div>


                                    {FROM == "general"
                                        ? <div className="row mx-2 mb-1">
                                            <a className="btn btn-sm btn-light m-0 p-2 shadow-none">
                                                <i class="far fa-folder-open fa-2x" ></i> <label className="fs-6 align-top">DETALLES</label>
                                            </a>
                                        </div>
                                        : <div className="row mx-2 mb-1">
                                            <a className="btn btn-sm btn-info m-0 p-2 shadow-none" onClick={() => this.props.NAVIGATION(currentItem, "general", FROM)}>
                                                <i class="far fa-folder-open fa-2x" ></i> <label className="fs-6 align-top">DETALLES</label>
                                            </a>
                                        </div>}

                                    {FROM == "clock"
                                        ? <div className="row mx-2 mb-1">
                                            <a className="btn btn-sm btn-light m-0 p-2 shadow-none">
                                                <i class="far fa-clock fa-2x" ></i> <label className="fs-6 align-top">TIEMPOS</label>
                                            </a>
                                        </div>
                                        :
                                        <div className="row mx-2 mb-1">
                                            <a className="btn btn-sm btn-info m-0 p-2 shadow-none" onClick={() => this.props.NAVIGATION(currentItem, "clock", FROM)}>
                                                <i class="far fa-clock fa-2x" ></i> <label className="fs-6 align-top">TIEMPOS</label>
                                            </a>
                                        </div>}

                                    {FROM == "archive"
                                        ? <div className="row mx-2 mb-1">
                                            <a className="btn btn-sm btn-light m-0 p-2 shadow-none">
                                                <i class="fas fa-archive fa-2x" ></i> <label className="fs-6 align-top">DOCUMENTOS</label>
                                            </a>
                                        </div>
                                        : <div className="row mx-2 mb-1">
                                            <a className="btn btn-sm btn-secondary m-0 p-2 shadow-none" onClick={() => this.props.NAVIGATION(currentItem, "archive", FROM)}>
                                                <i class="fas fa-archive fa-2x" ></i> <label className="fs-6 align-top">DOCUMENTOS</label>
                                            </a>
                                        </div>}
                                    {currentItem.state != 101 && currentItem.state <= 200
                                        ? <>
                                            {FROM == "edit"
                                                ? <div className="row mx-2 mb-1">
                                                    <a className="btn btn-sm btn-light m-0 p-2 shadow-none">
                                                        <i class="far fa-folder-open fa-2x" ></i> <label className="fs-6 align-top">ACTUALIZAR</label>
                                                    </a>
                                                </div>
                                                : <div className="row mx-2 mb-1">
                                                    <a className="btn btn-sm btn-secondary m-0 p-2 shadow-none" onClick={() => this.props.NAVIGATION(currentItem, "edit", FROM)}>
                                                        <i class="far fa-folder-open fa-2x" ></i> <label className="fs-6 align-top">ACTUALIZAR</label>
                                                    </a>
                                                </div>}




                                            {FROM == "check"
                                                ? <div className="row mx-2 mb-1">
                                                    <a className="btn btn-sm btn-light m-0 p-2 shadow-none">
                                                        <i class="far fa-check-square fa-2x" ></i> <label className="fs-6 align-top">CHEKEO</label>
                                                    </a>
                                                </div>
                                                : <div className="row mx-2 mb-1">
                                                    <a className="btn btn-sm btn-warning m-0 p-2 shadow-none" onClick={() => this.props.NAVIGATION(currentItem, "check", FROM)}>
                                                        <i class="far fa-check-square fa-2x" ></i> <label className="fs-6 align-top">CHEKEO</label>
                                                    </a>
                                                </div>}

                                            {!isPH
                                                ? <>
                                                    {!isOA && rules[0] != 1 ? <>
                                                        {FROM == "alert"
                                                            ? <div className="row mx-2 mb-1">
                                                                <a className="btn btn-sm btn-light m-0 p-2 shadow-none">
                                                                    <i class="fas fa-sign fa-2x" ></i> <label className="fs-6 align-top">PUBLICIDAD  {this.props.pqrsxfun.length ? <MDBBadge color="primary">PQRS</MDBBadge> : ''}</label>
                                                                </a>
                                                            </div>
                                                            : <div className="row mx-2 mb-1">
                                                                <a className="btn btn-sm btn-warning m-0 p-2 shadow-none" onClick={() => this.props.NAVIGATION(currentItem, "alert", FROM)}>
                                                                    <i class="fas fa-sign fa-2x" ></i> <label className="fs-6 align-top">PUBLICIDAD  {this.props.pqrsxfun.length ? <MDBBadge color="primary">PQRS</MDBBadge> : ''}</label>
                                                                </a>
                                                            </div>}
                                                    </> : ''}



                                                    {FROM == "record_law"
                                                        ? <div className="row mx-2 mb-1">
                                                            <a className="btn btn-sm btn-light m-0 p-2 shadow-none">
                                                                <i class="fas fa-balance-scale fa-2x" ></i> <label className="fs-6 align-top">INF. JURÍDICO</label>
                                                            </a>
                                                        </div>
                                                        : <div className="row mx-2 mb-1">
                                                            <a className="btn btn-sm btn-warning m-0 p-2 shadow-none" onClick={() => this.props.NAVIGATION(currentItem, "record_law", FROM)}>
                                                                <i class="fas fa-balance-scale fa-2x" ></i> <label className="fs-6 align-top">INF. JURÍDICO</label>
                                                            </a>
                                                        </div>}

                                                    {!isOA ? <>

                                                        {FROM == "record_arc"
                                                            ? <div className="row mx-2 mb-1">
                                                                <a className="btn btn-sm btn-light m-0 p-2 shadow-none">
                                                                    <i class="far fa-building fa-2x" ></i> <label className="fs-6 align-top">INF. ARQ.</label>
                                                                </a>
                                                            </div>
                                                            : <div className="row mx-2 mb-1">
                                                                <a className="btn btn-sm btn-warning m-0 p-2 shadow-none" onClick={() => this.props.NAVIGATION(currentItem, "record_arc", FROM)}>
                                                                    <i class="far fa-building fa-2x" ></i> <label className="fs-6 align-top">INF. ARQ.</label>
                                                                </a>
                                                            </div>}

                                                        {rules[1] != 1 ? <>
                                                            {FROM == "record_eng"
                                                                ? <div className="row mx-2 mb-1">
                                                                    <a className="btn btn-sm btn-light m-0 p-2 shadow-none">
                                                                        <i class="fas fa-cogs fa-2x" ></i> <label className="fs-6 align-top">INF. ESTRUCT.</label>
                                                                    </a>
                                                                </div>
                                                                : <div className="row mx-2 mb-1">
                                                                    <a className="btn btn-sm btn-warning m-0 p-2 shadow-none" onClick={() => this.props.NAVIGATION(currentItem, "record_eng", FROM)}>
                                                                        <i class="fas fa-cogs fa-2x" ></i> <label className="fs-6 align-top">INF. ESTRUCT.</label>
                                                                    </a>
                                                                </div>}

                                                        </> : ''}


                                                        {FROM == "record_review"
                                                            ? <div className="row mx-2 mb-1">
                                                                <a className="btn btn-sm btn-light m-0 p-2 shadow-none">
                                                                    <i class="fas fa-file-contract fa-2x" ></i> <label className="fs-6 align-top">ACTA</label>
                                                                </a>
                                                            </div>
                                                            : <div className="row mx-2 mb-1">
                                                                <a className="btn btn-sm btn-warning m-0 p-2 shadow-none" onClick={() => this.props.NAVIGATION(currentItem, "record_review", FROM)}>
                                                                    <i class="fas fa-file-contract fa-2x" ></i> <label className="fs-6 align-top">ACTA</label>
                                                                </a>
                                                            </div>}

                                                    </> : ''}

                                                   
                                                </>
                                                : <>
                                                    {FROM == "record_ph"
                                                        ? <div className="row mx-2 mb-1">
                                                            <a className="btn btn-sm btn-light m-0 p-2 shadow-none">
                                                                <i class="fas fa-pencil-ruler fa-2x" ></i> <label className="fs-6 align-top">INFORME P.H.</label>
                                                            </a>
                                                        </div>
                                                        : <div className="row mx-2 mb-1">
                                                            <a className="btn btn-sm btn-warning m-0 p-2 shadow-none" onClick={() => this.props.NAVIGATION(currentItem, "record_ph", FROM)}>
                                                                <i class="fas fa-pencil-ruler fa-2x" ></i> <label className="fs-6 align-top">INFORME P.H.</label>
                                                            </a>
                                                        </div>}
                                                </>}
                                                
                                                {FROM == "expedition"
                                                        ? <div className="row mx-2 mb-1">
                                                            <a className="btn btn-sm btn-light m-0 p-2 shadow-none">
                                                                <i class="far fa-file-alt fa-2x" ></i> <label className="fs-6 align-top">EXPEDICIÓN</label>
                                                            </a>
                                                        </div>
                                                        : <div className="row mx-2 mb-1">
                                                            <a className="btn btn-sm btn-warning m-0 p-2 shadow-none" onClick={() => this.props.NAVIGATION(currentItem, "expedition", FROM)}>
                                                                <i class="far fa-file-alt fa-2x" ></i> <label className="fs-6 align-top">EXPEDICIÓN</label>
                                                            </a>
                                                        </div>}
                                        </>
                                        : ""}

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