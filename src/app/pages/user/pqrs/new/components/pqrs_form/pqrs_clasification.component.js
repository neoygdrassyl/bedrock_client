const ClasificationComponent = ({ formData, onChange }) => {
    return (
        <div className="mb-4">
            <h4 className="border-bottom p-2">CLASIFICACION Y TERMINO PARA RESOLVER DE LA PQRS</h4>
            <div className="table-responsive">
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>Tipo de petición</th>
                            <th>Modalidad</th>
                            <th colSpan={2}>Antecedente</th>
                            <th colSpan={2}>Asociada a una actuación urbanística</th>
                        </tr>
                        <tr>
                            <th></th>
                            <th></th>
                            <th>Nueva</th>
                            <th>Reitera</th>
                            <th>Identificar</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <select
                                    type="text"
                                    className="form-select form-select-sm"
                                    name="petition_type"
                                    value={formData.petition_type}
                                    onChange={onChange}
                                    defaultValue={""}
                                >
                                    <option value="" disabled>Seleccione una opción</option>
                                    <option value="Petición">Petición</option>
                                    <option value="Queja">Queja</option>
                                    <option value="Reclamo">Reclamo</option>
                                    <option value="Sugerencia">Sugerencia</option>
                                    <option value="Denuncia">Denuncia</option>
                                    <option value="Consulta">Solicitud De Documentos y/o información</option>
                                    <option value="Consulta">Solicitud De Documentos y/o información</option>

                                </select >
                            </td>
                            <td>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    name="modality"
                                    value={formData.modality}
                                    onChange={onChange}
                                />
                            </td>
                            <td className="text-center">
                                <input
                                    type="radio"
                                    className="form-check-input"
                                    name="aforegoing"
                                    value={"false"}
                                    checked={formData.aforegoing === "false"}
                                    onChange={onChange}
                                />
                            </td>
                            <td className="text-center">
                                <input
                                    type="radio"
                                    className="form-check-input"
                                    name="aforegoing"
                                    value={"true"}
                                    checked={formData.aforegoing === "true"}
                                    onChange={onChange}
                                />
                            </td>
                            <td className="text-center">
                                <select
                                    className="form-select form-select-sm"
                                    name="actuacionIdentificar"
                                    value={formData.actuacionIdentificar || "no"}
                                    onChange={onChange}
                                >
                                    <option value="si">Sí</option>
                                    <option value="no">No</option>
                                </select>
                            </td>
                            <td className="text-center">
                                <select
                                    className="form-select form-select-sm"
                                    name="actuacionEstado"
                                    value={formData.actuacionEstado || "no"}
                                    onChange={onChange}
                                >
                                    <option value="si">Sí</option>
                                    <option value="no">No</option>
                                </select>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ClasificationComponent;
