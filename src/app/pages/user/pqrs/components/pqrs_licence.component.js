function PQRS_COMPONENT_LICENCE({ translation, swaMsg, globals, translation_form, currentItem }) {

        let _LICENCE_COMPONENT = () => {
            return <>
                <div className="row">
                    <div className="col-6">
                        <label>Numero de Radicación</label>
                    </div>
                    <div className="col-6">
                        <label className="fw-bold">{currentItem.pqrs_fun.id_public}</label>
                    </div>
                </div>
                <div className="row">
                    <div className="col-6">
                        <label>Clase de Solicitante</label>
                    </div>
                    <div className="col-6">
                        <label className="fw-bold">{currentItem.pqrs_fun.person}</label>
                    </div>
                </div>
                <div className="row">
                    <div className="col-6">
                        <label>Numero de Predio</label>
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

export default PQRS_COMPONENT_LICENCE;
