const PetitionerComponent = ({ formData, onChange }) => {

    return (
        <div className="mb-4">
            <h4 className="p-2 border-bottom" >DATOS DEL PETICIONARIO / NOTIFICACION</h4>

            <div className="row mb-3">
                <div className="col-md-5">
                    <label className="form-label">Nombre</label>
                    <input
                        type="text"
                        name="name"
                        className="form-control"
                        defaultValue={formData.name}
                        onBlur={onChange}
                    />
                </div>


                <div className="col-md-3">
                    <label className="form-label">Tipo</label>
                    <select
                        name="document_type"
                        className="form-select"
                        defaultValue={formData.document_type}
                        onBlur={onChange}
                    >
                        <option>C.C.</option>
                        <option>C.E.</option>
                        <option>Pasaporte</option>
                    </select>
                </div>
                <div className="col-md-4">
                    <label className="form-label">Número</label>
                    <input
                        type="text"
                        name="document_number"
                        className="form-control"
                        defaultValue={formData.document_number}
                        onBlur={onChange}
                        placeholder="Sin dato"
                    />
                </div>
            </div>
            <div className="row mb-3">
                <div className="col-md-4">
                    <label className="form-label">Teléfono</label>
                    <input
                        type="tel"
                        name="phone"
                        className="form-control"
                        defaultValue={formData.phone}
                        onBlur={onChange}
                        placeholder="Sin dato"
                    />
                </div>
                <div className="col-md-4">
                    <label className="form-label">Correo electrónico</label>
                    <input
                        type="email"
                        name="email"
                        className="form-control"
                        defaultValue={formData.email}
                        onBlur={onChange}
                    />
                </div>
                <div className="col-md-4">
                    <label className="form-label">Dirección Física</label>
                    <input
                        type="text"
                        name="address"
                        className="form-control"
                        defaultValue={formData.address}
                        onBlur={onChange}
                    />
                </div>
            </div>

            <div className="mb-3">
                <div className="form-check">
                    <input
                        type="checkbox"
                        name="legally_identified"
                        className="form-check-input"
                        id="identified"
                        defaultChecked={formData.legally_identified}
                        onChange={onChange}
                    />
                    <label className="form-check-label" htmlFor="identified">
                        El peticionario está debidamente identificado. Art16/1755/2015.
                    </label>
                </div>
                <div className="form-check">
                    <input
                        type="checkbox"
                        name="anonymous"
                        className="form-check-input"
                        id="anonymous"
                        defaultChecked={formData.anonymous}
                        onChange={onChange}
                    />
                    <label className="form-check-label" htmlFor="anonymous">
                        Es una petición anónima
                    </label>
                </div>
            </div>
        </div>
    );
};

export default PetitionerComponent;
