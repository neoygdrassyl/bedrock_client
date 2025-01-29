import React, { useState, useEffect, useCallback } from "react";
import { defaultTableData } from "../../utils/helpers/times";
import petitionToTime from "../../utils/helpers/setPQRSTime";

const ClasificationTermComponent = ({ time, initalData, setFormData }) => {
    // eficency will be the number of days delayed 
    // divided by the number of days setted before
    const [tableData, setTableData] = useState(initalData || defaultTableData);

    // Actualiza setFormData solo cuando tableData cambia
    useEffect(() => {
        setFormData(tableData);
    }, [tableData, setFormData]);

    // useCallBack to avoid re-renders
    const handleInputChange = useCallback((index, field, value) => {
        setTableData(prevData => {
            const newData = [...prevData];
            newData[index] = { ...newData[index], [field]: value };
            return newData;
        });
    }, []);

    return (
        <div className="container-fluid p-2">
            <div className="table-responsive mb-2">
                <table className="table table-bordered table-sm">
                    <thead>
                        <tr>
                            <th colSpan={7} className="text-center" style={{ backgroundColor: "#f5f5f5" }}>
                                Programación y control de proceso de Respuesta. Se programa para un ciclo de {petitionToTime(time)} días hábiles
                            </th>
                            <th colSpan={3} className="text-center">Seguimiento/ Cumplimiento</th>
                            <th className="text-center"></th>
                            <th colSpan={2} className="text-center" style={{ backgroundColor: "#ffa500" }}>
                                Término para Resolver
                            </th>
                        </tr>
                        <tr>
                            <th className="text-center">Acción CUB1</th>
                            <th className="text-center">1,2 vez</th>
                            <th className="text-center">Dirigida</th>
                            <th className="text-center">Día Hábil</th>
                            <th className="text-center">Fecha</th>
                            <th className="text-center">Usar Acción</th>
                            <th className="text-center">CUB No.</th>
                            <th className="text-center">Fecha</th>
                            <th className="text-center">Día Hábil</th>
                            <th className="text-center">Envió verificado</th>
                            <th className="text-center">Indicador Proceso</th>
                            <th className="text-center">Días Hábiles (10)</th>
                            <th className="text-center">Hábiles desde radicación</th>
                        </tr>
                    </thead>
                    <tbody className="text-center align-middle">
                        {tableData.map((row, index) => (
                            <tr key={index}>
                                <td>{row.action}</td>
                                <td>
                                    <input
                                        type="text"
                                        defaultValue={row.repeat}
                                        onBlur={(e) => handleInputChange(index, "repeat", e.target.value)}
                                        className="form-control form-control-sm"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        defaultValue={row.directedTo}
                                        onBlur={(e) => handleInputChange(index, "directedTo", e.target.value)}
                                        className="form-control form-control-sm"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="date"
                                        defaultValue={row.day_available}
                                        onBlur={(e) => handleInputChange(index, "day_available", e.target.value)}
                                        className="form-control form-control-sm"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="date"
                                        defaultValue={row.date_set}
                                        onBlur={(e) => handleInputChange(index, "date_set", e.target.value)}
                                        className="form-control form-control-sm"
                                    />
                                </td>
                                <td>
                                    <select
                                        defaultValue={row.useAction}
                                        onBlur={(e) => handleInputChange(index, "useAction", e.target.value)}
                                        className="form-control form-control-sm"
                                    >
                                        <option value={true}>SI</option>
                                        <option value={false}>NO</option>
                                    </select>
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        defaultValue={row.cub}
                                        onBlur={(e) => handleInputChange(index, "cub", e.target.value)}
                                        className="form-control form-control-sm"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        defaultValue={row.date_end}
                                        onBlur={(e) => handleInputChange(index, "date_end", e.target.value)}
                                        className="form-control form-control-sm"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        defaultValue={row.day_end}
                                        onBlur={(e) => handleInputChange(index, "day_end", e.target.value)}
                                        className="form-control form-control-sm"
                                    />
                                </td>
                                <td>
                                    <select
                                        defaultValue={row.isSentVerified}
                                        onBlur={(e) => handleInputChange(index, "isSentVerified", e.target.value)}
                                        className="form-control form-control-sm"
                                    >
                                        <option value={true}>SI</option>
                                        <option value={false}>NO</option>
                                    </select>
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        defaultValue={row.indicadorProceso}
                                        onBlur={(e) => handleInputChange(index, "indicadorProceso", e.target.value)}
                                        className="form-control form-control-sm"
                                    />
                                </td>
                                <td>{row.terminoResolver}</td>
                                <td>
                                    <input
                                        type="date"
                                        defaultValue={row.date_setResolver}
                                        onBlur={(e) => handleInputChange(index, "date_setResolver", e.target.value)}
                                        className="form-control form-control-sm"
                                        style={{ backgroundColor: "#ffa500" }}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ClasificationTermComponent;
