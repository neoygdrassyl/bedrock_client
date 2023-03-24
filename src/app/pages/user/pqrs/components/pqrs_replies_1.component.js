import React, { Component } from 'react';
import { dateParser, dateParser_finalDate } from '../../../../components/customClasses/typeParse'

const moment = require('moment');
const momentB = require('moment-business-days');
class PQRS_COMPONENT_REPLIES_PROFESIONAL extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { translation, swaMsg, globals, currentItem } = this.props;
        const { } = this.state;

        // COMPONENTS JSX
        let _REPLIES_COMPONENT = () => {
            var _COMPONENT = [];
            for (var i = 0; i < currentItem.pqrs_workers.length; i++) {
                if ((currentItem.pqrs_workers[i].reply && currentItem.pqrs_workers[i].roleId == window.user.roleId) || (window.user.roleId == 1 && currentItem.pqrs_workers[i].reply)) {
                    _COMPONENT.push(<>
                        <div className="row m-2">
                            <div className="col-6">
                                <div className="row">
                                    <div className="col-6">
                                        <lavel>Profesional</lavel>
                                    </div>
                                    <div className="col-6">
                                        <lavel className="fw-bold">{currentItem.pqrs_workers[i].name}</lavel>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-6">
                                        <lavel>Competencia</lavel>
                                    </div>
                                    <div className="col-6">
                                        <label className="fw-bold">{currentItem.pqrs_workers[i].competence}</label>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-6">
                                        <lavel>Fecha de Asignación</lavel>
                                    </div>
                                    <div className="col-6">
                                        <label className="fw-bold">{dateParser(currentItem.pqrs_workers[i].asign)}</label>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-6">
                                        <lavel>Fecha Respuesta Esperada</lavel>
                                    </div>
                                    <div className="col-6">
                                        <label className="fw-bold">{dateParser(dateParser_finalDate(currentItem.pqrs_workers[i].asign, 5))}</label>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-6">
                                        <lavel>Fecha Respuesta Real</lavel>
                                    </div>
                                    <div className="col-6">
                                        <label className="fw-bold">{dateParser(currentItem.pqrs_workers[i].date_reply)}</label>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-6">
                                        <lavel>Tiempo de Respuesta</lavel>
                                    </div>
                                    <div className="col-6">
                                        <label className="fw-bold">{momentB(currentItem.pqrs_workers[i].asign, 'YYYY-MM-DD').businessDiff(moment(currentItem.pqrs_workers[i].date_reply, 'YYYY-MM-DD')) + " dia(s) habiles"}</label>
                                    </div>
                                </div>
                                
                            </div>
                            <div className="col-6">
                                <div className="row">
                                    <label className="fw-bold">Respuesta</label>
                                </div>
                                <div className="row">
                                    <label className="">{currentItem.pqrs_workers[i].reply}</label>
                                </div>
                            </div>
                        </div>
                    </>)
                }

            }
            return <>{_COMPONENT}</>;
        }
    

        return (
            <div>
                {_REPLIES_COMPONENT()}
            </div>
        );
    }
}

export default PQRS_COMPONENT_REPLIES_PROFESIONAL;