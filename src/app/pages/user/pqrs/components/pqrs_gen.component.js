import React, { Component } from 'react';

class PQRS_COMPONENT_INFO extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { translation, swaMsg, globals, translation_form, currentItem } = this.props;
        const { } = this.state;

        // COMPONENTS JSX
        let _INFO_COMPONENT = () => {

            return <>
                <div className="row m-2">
                    <div className="col-6">
                        <div className="row">
                            <div className="col-6">
                                <lavel>Consecutivo de Entrada</lavel>
                            </div>
                            <div className="col-6">
                                <lavel className="fw-bold">{currentItem.id_publico}</lavel>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-6">
                                <lavel>Estado</lavel>
                            </div>
                            <div className="col-6">
                                <label className="fw-bold">{_STATUS_COMPONENT()}</label>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-6">
                                <lavel>Tipo de solicitud</lavel>
                            </div>
                            <div className="col-6">
                                <label className="fw-bold">{currentItem.type}</label>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-6">
                                <lavel>Radicación Original</lavel>
                            </div>
                            <div className="col-6">
                                <label className="fw-bold">{currentItem.pqrs_info ? currentItem.pqrs_info.radication_channel : ''}</label>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-6">
                                <lavel>Consecutivo de Salida</lavel>
                            </div>
                            <div className="col-6">
                                <label className="fw-bold">{currentItem.id_reply}</label>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-6">
                                <lavel>Guiá de Correspondencia</lavel>
                            </div>
                            <div className="col-6">
                                <label className="fw-bold">{currentItem.id_correspondency}</label>
                            </div>
                        </div>

                    </div>
                    <div className="col-6">
                        <div className="row">
                            <label className="fw-bold">Contenido de la PQRS</label>
                        </div>
                        <div className="row">
                            <label>{currentItem.content}</label>
                        </div>
                    </div>
                </div>
            </>

        }

        // DATA CONVERTERS
        let _STATUS_COMPONENT = () => {
            switch (currentItem.status) {
                case 0:
                    return <label className="text-danger">ACTIVO</label>
                case 1:
                    return <label className="text-success">CERRADO</label>
                case 2:
                    return <label className="text-primary">ARCHIVADO</label>
                case 3:
                    return <label className="text-secondary">TRASLADADO</label>
                default:
                    break;
            }
        }

        return (
            <div>
                {_INFO_COMPONENT()}
            </div>
        );
    }
}

export default PQRS_COMPONENT_INFO;