import React, { Component } from 'react';

class PQRS_COMPONENT_SOLICITORS extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { translation, swaMsg, globals, translation_form, currentItem } = this.props;
        const { } = this.state;

        let _SOLICITORS_COMPONENT = () => {
            var _COMPONENT = [];
            _COMPONENT.push(<>
                <div className="row mx-2 py-2 border">
                    <div className="col-3">
                        <lavel className="fw-bold">Nombre</lavel>
                    </div>
                    <div className="col-3">
                        <lavel className="fw-bold">Tipo Solicitante</lavel>
                    </div>
                    <div className="col-3">
                        <lavel className="fw-bold">Tipo Documento</lavel>
                    </div>
                    <div className="col-3">
                        <lavel className="fw-bold">Numero Documento</lavel>
                    </div>
                </div>
            </>)


            for (var i = 0; i < currentItem.pqrs_solocitors.length; i++) {
                _COMPONENT.push(<div className="row mx-2 py-2 border text-break">
                    <div className="col-3">
                        <lavel>{currentItem.pqrs_solocitors[i].name}</lavel>
                    </div>
                    <div className="col-3">
                        <lavel>{currentItem.pqrs_solocitors[i].type}</lavel>
                    </div>
                    <div className="col-3">
                        <lavel>{currentItem.pqrs_solocitors[i].type_id}</lavel>
                    </div>
                    <div className="col-3">
                        <lavel>{currentItem.pqrs_solocitors[i].id_number}</lavel>
                    </div>
                </div>)
            }
            return <>{_COMPONENT}</>;
        }

        return (
            <div>
                {_SOLICITORS_COMPONENT()}

            </div>
        );
    }
}

export default PQRS_COMPONENT_SOLICITORS;