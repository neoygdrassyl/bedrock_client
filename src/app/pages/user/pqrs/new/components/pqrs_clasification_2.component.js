const ClasificationTermComponent = () => {
    return (

        <div className="container-fluid p-2">
            <div className="table-responsive mb-2">
                <table className="table table-bordered table-sm">
                    <thead>
                        <tr>
                            <th colSpan={7} className="text-center" style={{ backgroundColor: '#f5f5f5' }}>Programación y control de proceso de Respuesta. Se programa para un ciclo de 10 días hábiles</th>
                            <th colSpan={3} className="text-center">Seguimiento/ Cumplimiento</th>
                            <th className="text-center"></th>
                            <th colSpan={2} className="text-center" style={{ backgroundColor: '#ffa500' }}>Termino para Resolver</th>
                        </tr>
                        <tr>
                            <th className="text-center">Acción CUB1</th>
                            <th className="text-center">1,2 vez</th>
                            <th className="text-center">Dirigida</th>
                            <th className="text-center">Día Hábil</th>
                            <th className="text-center">Fecha</th>
                            <th className="text-center">Usar</th>
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
                        <tr>
                            <td>CRAD</td>
                            <td>1</td>
                            <td>Peticionario</td>
                            <td>1</td>
                            <td>2024/11/27</td>
                            <td>SI</td>
                            <td>CUB24-0000</td>
                            <td></td>
                            <td>1</td>
                            <td>NO</td>
                            <td></td>
                            <td>Fecha de inicio</td>
                            <td style={{ backgroundColor: '#ffa500' }}>2024/11/27</td>
                        </tr>
                        <tr>
                            <td>ACLP</td>
                            <td></td>
                            <td>Peticionario</td>
                            <td>5</td>
                            <td>2024/12/02</td>
                            <td>NO</td>
                            <td>CUB24-0000</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>Fecha máxima</td>
                            <td style={{ backgroundColor: '#ffa500' }}>2024/12/11</td>
                        </tr>
                        <tr>
                            <td>TPCO</td>
                            <td>1</td>
                            <td>Entidades</td>
                            <td>5</td>
                            <td>2024/12/02</td>
                            <td>NO</td>
                            <td>CUB24-0000</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>Fecha envió respuesta </td>
                            <td style={{ backgroundColor: '#ffa500' }}></td>
                        </tr>
                        <tr>
                            <td>CTPC</td>
                            <td></td>
                            <td>Entidades</td>
                            <td>5</td>
                            <td>2024/12/02</td>
                            <td>NO</td>
                            <td>CUB24-0000</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>Número de días</td>
                            <td style={{ backgroundColor: '#ffa500' }}></td>
                        </tr>
                        <tr>
                            <td>AMPT</td>
                            <td></td>
                            <td>Peticionario</td>
                            <td>10</td>
                            <td>2024/12/12</td>
                            <td>NO</td>
                            <td>CUB24-0000</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>Eficiencia</td>
                            <td style={{ backgroundColor: '#ffa500' }}>0,80{'<'}1</td>
                        </tr>
                        <tr>
                            <td>REPT</td>
                            <td>1</td>
                            <td>Peticionario</td>
                            <td>15</td>
                            <td style={{ backgroundColor: '#ffa500' }}>2024/12/11</td>
                            <td>SI</td>
                            <td>CUB24-0000</td>
                            <td></td>
                            <td>15</td>
                            <td></td>
                            <td></td>
                            <td style={{ backgroundColor: '#000080', color: 'white' }}>ABIERTA</td>
                            <td style={{ backgroundColor: '#000080', color: 'white' }}>EFICIENTE</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="small text-muted mb-2">
                Confirmación de radicación -CRAD-, Aclaración a la petición-ACLP- Traslado por Competencia-TPCO-, Comunicación Traslado por Competencia -CTPCO- Ampliación del Termino-AMPT-, Resolución Petición-REPET-
            </div>
        </div>
    )
}

export default ClasificationTermComponent;