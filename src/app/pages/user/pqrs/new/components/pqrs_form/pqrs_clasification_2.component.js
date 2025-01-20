import React, { useState } from "react";

const ClasificationTermComponent = () => {
    const [tableData, setTableData] = useState([
        {
            accion: "CRAD",
            vez: "1",
            dirigida: "Peticionario",
            diaHabil: "1",
            fecha: "2024/11/27",
            usarAccion: "SI",
            cub: "CUB24-0000",
            seguimientoFecha: "",
            seguimientoDiaHabil: "1",
            envioVerificado: "NO",
            indicadorProceso: "",
            terminoResolver: "Fecha de inicio",
            fechaResolver: "2024/11/27",
        },
        {
            accion: "ACLP",
            vez: "",
            dirigida: "Peticionario",
            diaHabil: "5",
            fecha: "2024/12/02",
            usarAccion: "NO",
            cub: "CUB24-0000",
            seguimientoFecha: "",
            seguimientoDiaHabil: "",
            envioVerificado: "",
            indicadorProceso: "",
            terminoResolver: "Fecha máxima",
            fechaResolver: "2024/12/11",
        },
        {
            accion: "TPCO",
            vez: "1",
            dirigida: "Entidades",
            diaHabil: "5",
            fecha: "2024/12/02",
            usarAccion: "NO",
            cub: "CUB24-0000",
            seguimientoFecha: "",
            seguimientoDiaHabil: "",
            envioVerificado: "",
            indicadorProceso: "",
            terminoResolver: "Fecha envió respuesta",
            fechaResolver: "",
        },
        {
            accion: "CTPC",
            vez: "",
            dirigida: "Entidades",
            diaHabil: "5",
            fecha: "2024/12/02",
            usarAccion: "NO",
            cub: "CUB24-0000",
            seguimientoFecha: "",
            seguimientoDiaHabil: "",
            envioVerificado: "",
            indicadorProceso: "",
            terminoResolver: "Número de días",
            fechaResolver: "",
        },
        {
            accion: "AMPT",
            vez: "",
            dirigida: "Peticionario",
            diaHabil: "10",
            fecha: "2024/12/12",
            usarAccion: "NO",
            cub: "CUB24-0000",
            seguimientoFecha: "",
            seguimientoDiaHabil: "",
            envioVerificado: "",
            indicadorProceso: "",
            terminoResolver: "Eficiencia",
            fechaResolver: "0,80<1",
        },
        {
            accion: "REPT",
            vez: "1",
            dirigida: "Peticionario",
            diaHabil: "15",
            fecha: "2024/12/11",
            usarAccion: "SI",
            cub: "CUB24-0000",
            seguimientoFecha: "",
            seguimientoDiaHabil: "15",
            envioVerificado: "",
            indicadorProceso: "ABIERTA",
            terminoResolver: "EFICIENTE",
            fechaResolver: "",
        },
    ]);

    // Función para actualizar un campo específico
    const handleInputChange = (index, field, value) => {
        const newData = [...tableData];
        newData[index] = { ...newData[index], [field]: value };
        setTableData(newData);
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
                                <td>{row.accion}</td>
                                <td><input type="text" value={row.vez} onChange={(e) => handleInputChange(index, "vez", e.target.value)} className="form-control" /></td>
                                <td><input type="text" value={row.dirigida} onChange={(e) => handleInputChange(index, "dirigida", e.target.value)} className="form-control" /></td>
                                <td><input type="number" value={row.diaHabil} onChange={(e) => handleInputChange(index, "diaHabil", e.target.value)} className="form-control" /></td>
                                <td><input type="date" value={row.fecha} onChange={(e) => handleInputChange(index, "fecha", e.target.value)} className="form-control" /></td>
                                <td>
                                    <select value={row.usarAccion} onChange={(e) => handleInputChange(index, "usarAccion", e.target.value)} className="form-control">
                                        <option value="SI">SI</option>
                                        <option value="NO">NO</option>
                                    </select>
                                </td>
                                <td><input type="text" value={row.cub} onChange={(e) => handleInputChange(index, "cub", e.target.value)} className="form-control" /></td>
                                <td><input type="date" value={row.seguimientoFecha} onChange={(e) => handleInputChange(index, "seguimientoFecha", e.target.value)} className="form-control" /></td>
                                <td><input type="number" value={row.seguimientoDiaHabil} onChange={(e) => handleInputChange(index, "seguimientoDiaHabil", e.target.value)} className="form-control" /></td>
                                <td>
                                    <select value={row.envioVerificado} onChange={(e) => handleInputChange(index, "envioVerificado", e.target.value)} className="form-control">
                                        <option value="SI">SI</option>
                                        <option value="NO">NO</option>
                                    </select>
                                </td>
                                <td><input type="text" value={row.indicadorProceso} onChange={(e) => handleInputChange(index, "indicadorProceso", e.target.value)} className="form-control" /></td>
                                <td>{row.terminoResolver}</td>
                                <td>
                                    <input type="date" value={row.fechaResolver} onChange={(e) => handleInputChange(index, "fechaResolver", e.target.value)} className="form-control" style={{ backgroundColor: "#ffa500" }} />
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
