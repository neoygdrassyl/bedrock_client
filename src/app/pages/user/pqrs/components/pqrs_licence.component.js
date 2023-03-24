import React, { Component } from 'react';

class PQRS_COMPONENT_LICENCE extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { translation, swaMsg, globals, translation_form, currentItem } = this.props;
        const { } = this.state;

        let _LICENCE_COMPONENT = () => {
            return <>
                <div className="row">
                    <div className="col-6">
                        <lavel>Numero de Radicación</lavel>
                    </div>
                    <div className="col-6">
                        <lavel className="fw-bold">{currentItem.pqrs_fun.id_public}</lavel>
                    </div>
                </div>
                <div className="row">
                    <div className="col-6">
                        <lavel>Clase de Solicitante</lavel>
                    </div>
                    <div className="col-6">
                        <label className="fw-bold">{currentItem.pqrs_fun.person}</label>
                    </div>
                </div>
                <div className="row">
                    <div className="col-6">
                        <lavel>Numero de Predio</lavel>
                    </div>
                    <div className="col-6">
                        <label className="fw-bold">{currentItem.pqrs_fun.catastral}</label>
                    </div>
                </div>
            </>
        }

        return (
            <div>
                {_LICENCE_COMPONENT()}
            </div>
        );
    }
}

export default PQRS_COMPONENT_LICENCE;