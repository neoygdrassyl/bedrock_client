import { useEffect, useState } from "react";

const ClasificationComponent = ({ initialData, setTime, onChange }) => {
    // useState for the checkbox
    const [isTrue, setIsTrue] = useState(initialData && initialData ? initialData.aforegoing : '');
    useEffect(() => {
        if (initialData) {
            setTime(initialData?.petition_type || "");
        }
    }, [initialData, setTime]);
    const handleRadioChange = (e) => {
        const { value } = e.target;
        setIsTrue(value === "true");
        onChange(e);
    };

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
                            <th>Identificar Número</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <select
                                    type="text"
                                    className="form-select form-select-sm"
                                    name="petition_type"
                                    defaultValue={initialData && initialData ? initialData?.petition_type: ""}
                                    onChange={(e) => {
                                        setTime(e.target.value);
                                        onChange(e);
                                    }
                                    }
                                >
                                    <option value="" disabled>Seleccione una opción</option>
                                    <option value="Petición">Petición</option>
                                    <option value="Queja">Queja</option>
                                    <option value="Reclamo">Reclamo</option>
                                    <option value="Sugerencia">Sugerencia</option>
                                    <option value="Denuncia">Denuncia</option>
                                    <option value="Consulta">Solicitud De Documentos y/o información</option>
                                </select>
                            </td>
                            <td>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    name="modality"
                                    defaultValue={initialData && initialData ? initialData.modality : ''}
                                    onChange={onChange}
                                />
                            </td>
                            <td className="text-center">
                                <input
                                    type="radio"
                                    className="form-check-input"
                                    name="aforegoing"
                                    value="false"
                                    checked={isTrue === false}
                                    onChange={handleRadioChange}
                                />
                            </td>
                            <td className="text-center">
                                <input
                                    type="radio"
                                    className="form-check-input"
                                    name="aforegoing"
                                    value="true"
                                    checked={isTrue === true}
                                    onChange={handleRadioChange}
                                />
                            </td>
                            <td className="text-center">
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    name="id_publico"
                                    defaultValue={initialData && initialData ? initialData.id_public : ''}
                                    onChange={onChange}
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div >
    );
};

export default ClasificationComponent;
