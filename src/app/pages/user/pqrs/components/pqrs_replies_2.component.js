import React, { Component } from 'react';
import { dateParser, dateParser_dateDiff } from '../../../../components/customClasses/typeParse'

class PQRS_COMPONENT_REPLIES_TOSOLICITOR extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { translation, swaMsg, globals, currentItem } = this.props;
        const { } = this.state;

        // COMPONENTS JSX
        let _REPLIY_TO_SOLICITOR_COMPONENT = () => {
            var _COMPONENT = [];
            _COMPONENT.push(<>
                <div className="row m-2">
                    <div className="col-6">
                        <div className="row">
                            <div className="col-6">
                                <lavel>Fecha de Respuesta</lavel>
                            </div>
                            <div className="col-6">
                                <lavel className="fw-bold">{currentItem.pqrs_time.reply_formal
                                    ? dateParser(currentItem.pqrs_time.reply_formal)
                                    : <label className="text-danger fw-bold">NO SE HA DADO RESPUESTA FORMAL</label>}</lavel>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-6">
                                <lavel>Tiempo en dar Respuesta</lavel>
                            </div>
                            <div className="col-6">
                                <label className="fw-bold">{currentItem.pqrs_time.reply_formal
                                    ? dateParser_dateDiff(currentItem.pqrs_time.legal, currentItem.pqrs_time.reply_formal) + " Dia(s) habiles"
                                    : ""}</label>
                            </div>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="row">
                            <label className="fw-bold">Respuesta</label>
                        </div>
                        <div className="row">
                            <label>{currentItem.pqrs_info.reply}</label>
                        </div>
                    </div>
                </div>
            </>)
            return <>{_COMPONENT}</>;
        }

        return (
            <div>
                {_REPLIY_TO_SOLICITOR_COMPONENT()}
            </div>
        );
    }
}

export default PQRS_COMPONENT_REPLIES_TOSOLICITOR;