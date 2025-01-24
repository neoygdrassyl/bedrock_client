import React, { useEffect, useState } from "react";
import { defaultTableData } from "../../utils/helpers/times";

const ClasificationTermComponent = ({ initalData, setFormData }) => {
    // eficency will be the number of days delayed 
    // divided by the number of days setted before

    useEffect(() => {
        if (initalData) {
            setTableData(initalData);
        }else {
            setTableData(defaultTableData)
        }
    }, [initalData])

    const [tableData, setTableData] = useState([])

    // Función para actualizar un campo específico
    const handleInputChange = (index, field, value) => {
        const newData = [...tableData];
        newData[index] = { ...newData[index], [field]: value };
        setTableData(newData);
        setFormData(newData)
        console.log(tableData)
    };

    return (
        <div className="container-fluid p-2">
            <div className="table-responsive mb-2">
                <table className="table table-bordered table-sm">
                    <thead>
                        <tr>
                            <th colSpan={7} className="text-center" style={{ backgroundColor: "#f5f5f5" }}>
                                Programación y control de proceso de Respuesta. Se programa para un ciclo de 10 días hábiles
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
                                <td><input type="text" value={row.repeat} onChange={(e) => handleInputChange(index, "repeat", e.target.value)} className="form-control form-control-sm" /></td>
                                <td><input type="text" value={row.directedTo} onChange={(e) => handleInputChange(index, "directedTo", e.target.value)} className="form-control form-control-sm" /></td>
                                <td><input type="number" value={row.day_available} onChange={(e) => handleInputChange(index, "day_available", e.target.value)} className="form-control form-control-sm" /></td>
                                <td><input type="date" value={row.date_set} onChange={(e) => handleInputChange(index, "date_set", e.target.value)} className="form-control form-control-sm" /></td>
                                <td>
                                    <select value={row.useAction} onChange={(e) => handleInputChange(index, "useAction", e.target.value)} className="form-control form-control-sm">
                                        <option value={true}>SI</option>
                                        <option value={false}>NO</option>
                                    </select>
                                </td>
                                <td><input type="text" value={row.cub} onChange={(e) => handleInputChange(index, "cub", e.target.value)} className="form-control form-control-sm" /></td>
                                <td><input type="date" value={row.date_end} onChange={(e) => handleInputChange(index, "date_end", e.target.value)} className="form-control form-control-sm" /></td>
                                <td><input type="number" value={row.day_end} onChange={(e) => handleInputChange(index, "day_end", e.target.value)} className="form-control form-control-sm" /></td>
                                <td>
                                    <select value={row.isSentVerified} onChange={(e) => handleInputChange(index, "isSentVerified", e.target.value)} className="form-control form-control-sm">
                                        <option value={true}>SI</option>
                                        <option value={false}>NO</option>
                                    </select>
                                </td>
                                <td><input type="text" value={row.indicadorProceso} onChange={(e) => handleInputChange(index, "indicadorProceso", e.target.value)} className="form-control form-control-sm" /></td>
                                <td>{row.terminoResolver}</td>
                                <td>
                                    <input type="date" value={row.date_setResolver} onChange={(e) => handleInputChange(index, "date_setResolver", e.target.value)} className="form-control form-control-sm" style={{ backgroundColor: "#ffa500" }} />
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
