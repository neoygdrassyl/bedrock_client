import React, { useState, useEffect, useCallback, useMemo } from "react";
import { defaultTableData } from "../../utils/helpers/generateTableData";
import { getFinalTime, getTimeDiff, petitionToTime } from "../../utils/helpers/useTimes";
import { infoCud } from "../../../../../../components/jsons/vars";

const ClasificationTermComponent = ({ day_seted, petition, initalData, setFormData }) => {
    const [day_done, setDay_Done] = useState(initalData?.[2]?.processIndicator ?? "");

    // tableData 
    const memoizedTableData = useMemo(() => {
        const timeData = petitionToTime(petition) || {};
        return defaultTableData(initalData || [], timeData, day_seted, day_done, getFinalTime(day_seted, timeData?.days));
    }, [initalData, petition, day_seted, day_done]);

    const [tableData, setTableData] = useState(memoizedTableData);

    // useEffect for table data change
    useEffect(() => {
        const newData = defaultTableData(initalData || [], petitionToTime(petition) || {}, day_seted, day_done, getFinalTime(day_seted, petitionToTime(petition)?.days));
        setTableData(newData);
    }, [day_seted, initalData, petition, day_done]);

    // useEffect for formData when tableData changes
    useEffect(() => {
        setFormData(tableData);
    }, [tableData, setFormData]);

    // input changes
    const handleInputChange = useCallback((index, field, value) => {
        setTableData(prevData => {
            const newData = [...prevData];
            newData[index] = { ...newData[index], [field]: value };
            if (field === "date_end" && newData[index].date_set) {
                newData[index].day_end = getTimeDiff(newData[index].date_set, value)+1;
            }
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
                                Programación y control de proceso de Respuesta. Se programa para un ciclo de {petitionToTime(petition)?.days || '"x"'} días hábiles
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
                            <th className="text-center">{infoCud.serials.end} No.</th>
                            <th className="text-center">Fecha</th>
                            <th className="text-center">Día Hábil</th>
                            <th className="text-center">Envió verificado</th>
                            <th className="text-center">Días Hábiles ({infoCud.pqrs_config.time_reply})</th>
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
                                        value={row.repeat}
                                        onChange={(e) => handleInputChange(index, "repeat", e.target.value)}
                                        className="form-control form-control-sm"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={row.directedTo}
                                        onChange={(e) => handleInputChange(index, "directedTo", e.target.value)}
                                        className="form-control form-control-sm"
                                    />
                                </td>
                                <td>{row.day_available}</td>
                                <td>
                                    <input
                                        type="date"
                                        value={row.date_set}
                                        onChange={(e) => handleInputChange(index, "date_set", e.target.value)}
                                        className="form-control form-control-sm"
                                    />
                                </td>
                                <td>
                                    <select
                                        value={row.useAction}
                                        onChange={(e) => handleInputChange(index, "useAction", e.target.value)}
                                        className="form-control form-control-sm"
                                    >
                                        <option value={true}>SI</option>
                                        <option value={false}>NO</option>
                                    </select>
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={row.cub}
                                        onChange={(e) => handleInputChange(index, "cub", e.target.value)}
                                        className="form-control form-control-sm"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="date"
                                        value={row.date_end}
                                        onChange={(e) => handleInputChange(index, "date_end", e.target.value)}
                                        className="form-control form-control-sm"
                                    />
                                </td>
                                <td>
                                    {row.day_end}
                                </td>
                                <td>
                                    <select
                                        value={row.isSentVerified}
                                        onChange={(e) => handleInputChange(index, "isSentVerified", e.target.value)}
                                        className="form-control form-control-sm"
                                    >
                                        <option value={true}>SI</option>
                                        <option value={false}>NO</option>
                                    </select>
                                </td>
                                <td>{row.terminoResolver}</td>
                                {/*  */}
                                {["Fecha de inicio", "Fecha máxima"].includes(row.terminoResolver) && (
                                    <td><input type="date" value={row.processIndicator} onChange={(e) => handleInputChange(index, "processIndicator", e.target.value)} className="form-control form-control-sm" /></td>
                                )}
                                {row.terminoResolver === "Fecha envió respuesta" && (
                                    <td><input type="date" value={row.processIndicator} onChange={(e) => setDay_Done(e.target.value)} className="form-control form-control-sm" /></td>
                                )}
                                {["Número de días", "Eficiencia", "EFICIENTE"].includes(row.terminoResolver) && (
                                    <td>{row.processIndicator}</td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ClasificationTermComponent;
