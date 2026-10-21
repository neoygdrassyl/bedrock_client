function PQRS_COMPONENT_SOLICITORS({ translation, swaMsg, globals, translation_form, currentItem }) {

        let _SOLICITORS_COMPONENT = () => {
            var _COMPONENT = [];
            _COMPONENT.push(<div key="pqrs-solicitors-header" className="row mx-2 py-2 border">
                    <div className="col-3">
                        <label className="fw-bold">Nombre</label>
                    </div>
                    <div className="col-3">
                        <label className="fw-bold">Tipo Solicitante</label>
                    </div>
                    <div className="col-3">
                        <label className="fw-bold">Tipo Documento</label>
                    </div>
                    <div className="col-3">
                        <label className="fw-bold">Número Documento</label>
                    </div>
                </div>)


            for (var i = 0; i < currentItem.pqrs_solocitors.length; i++) {
                _COMPONENT.push(<div key={i} className="row mx-2 py-2 border text-break">
                    <div className="col-3">
                        <label>{currentItem.pqrs_solocitors[i].name}</label>
                    </div>
                    <div className="col-3">
                        <label>{currentItem.pqrs_solocitors[i].type}</label>
                    </div>
                    <div className="col-3">
                        <label>{currentItem.pqrs_solocitors[i].type_id}</label>
                    </div>
                    <div className="col-3">
                        <label>{currentItem.pqrs_solocitors[i].id_number}</label>
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

export default PQRS_COMPONENT_SOLICITORS;
