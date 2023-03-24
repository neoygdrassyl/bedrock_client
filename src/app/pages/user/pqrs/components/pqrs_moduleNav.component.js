import React, { Component } from 'react';
import { MDBCard, MDBCardBody, MDBTooltip } from 'mdb-react-ui-kit';

class PQRS_MODULE_NAV extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const { translation, currentItem, FROM } = this.props;

        let _GET_WORKER_VAR = (worker_id) => {
            let _WORKERS = currentItem.pqrs_workers;
            for (var i = 0; i < _WORKERS.length; i++) {
                if ((_WORKERS[i].worker_id == worker_id) || window.user.roleId == 1) {
                    return {
                        id: _WORKERS[i].id,
                        id_master: currentItem.id,
                        id_public: currentItem.id_publico,
                    }
                }
            }
            return false
        }

        let _GET_LOCK_FOR_WORKER = () => {
            if (window.user.roleId == 1 || window.user.roleId == 5) return true;
            for (var i = 0; i < currentItem.pqrs_workers.length; i++) {
                if (currentItem.pqrs_workers[i].worker_id == window.user.id) return true
            }
            return false
        }

        let _GET_WORKERS_REPLY = () => {
            var _COMPONENT = [];
            let _WORKERS = currentItem.pqrs_workers;
            for (var i = 0; i < _WORKERS.length; i++) {
                if ((_WORKERS[i].worker_id == window.user.id && !_WORKERS[i].date_reply) || window.user.roleId == 1) {
                    _COMPONENT.push(<>
                        {FROM == "informal"
                            ? <div className="row mx-2 mb-1">
                                <button className="btn btn-sm btn-light m-0 p-2 shadow-none">
                                    <i class="far fa-comment-dots fa-2x" ></i> <label className="fs-6 align-top">RTA. {_WORKERS[i].name}</label></button>
                            </div>
                            : <div className="row mx-2 mb-1">
                                <button className="btn btn-sm btn-secondary m-0 p-2 shadow-none" onClick={() => this.props.NAVIGATION(_GET_WORKER_VAR(window.user.id), "informal", FROM)}>
                                    <i class="far fa-comment-dots fa-2x" ></i> <label className="fs-6 align-top">RTA. {_WORKERS[i].name}</label></button>
                            </div>}
                    </>)
                }
            }

            return <>{_COMPONENT}</>

        }

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
                                        ?
                                        <div className="row mx-2 mb-1">
                                            <button className="btn btn-light m-0 p-2 shadow-none">
                                                <i class="far fa-eye fa-2x fa-2x" ></i> <label className="fs-6 align-top">DETALLES</label></button>
                                        </div>
                                        : <div className="row mx-2 mb-1">
                                            <button className="btn btn-info m-0 p-2 shadow-none" onClick={() => this.props.NAVIGATION(currentItem, "general", FROM)}>
                                                <i class="far fa-eye fa-2x fa-2x" ></i> <label className="fs-6 align-top">DETALLES</label></button>
                                        </div>}



                                    {currentItem.status == 1
                                        ? <>
                                            {FROM == "editable"
                                                ?
                                                <div className="row mx-2 mb-1">
                                                    <button className="btn btn-light m-0 p-2 shadow-none">
                                                        <i class="fas fa-edit fa-2x fa-2x"></i> <label className="fs-6 align-top">EDITAR</label></button>
                                                </div>
                                                : <div className="row mx-2 mb-1">
                                                    <button className="btn btn-secondary m-0 p-2 shadow-none" onClick={() => this.props.NAVIGATION(currentItem, "editable", FROM)}>
                                                        <i class="fas fa-edit fa-2x fa-2x"></i> <label className="fs-6 align-top">EDITAR</label></button>
                                                </div>} </> : ""
                                    }
                                    {currentItem.status == 0
                                        ? <>
                                            {window.user.roleId == 5 || window.user.roleId == 1
                                                ? <>
                                                    {FROM == "manage"
                                                        ? <div className="row mx-2 mb-1">
                                                            <button className="btn btn-sm btn-light m-0 p-2 shadow-none">
                                                                <i class="fas fa-cog fa-2x" ></i> <label className="fs-6 align-top">GESTIONAR</label></button>
                                                        </div>
                                                        : <div className="row mx-2 mb-1">
                                                            <button className="btn btn-sm btn-success m-0 p-2 shadow-none" onClick={() => this.props.NAVIGATION(currentItem, "manage", FROM)}>
                                                                <i class="fas fa-cog fa-2x" ></i> <label className="fs-6 align-top">GESTIONAR</label></button>
                                                        </div>}
                                                </> : ""}
                                        </>
                                        : ""}


                                </div>
                            </MDBCardBody>
                        </MDBCard>
                    </div>
                </div>
                : ""} </>
        );
    }
}

export default PQRS_MODULE_NAV;