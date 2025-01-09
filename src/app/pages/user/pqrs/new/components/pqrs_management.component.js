export default function ProcessControl({formData,onChange}) {
  return (
    <div className="container-fluid p-2">
      {/* Process Management Control Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-sm">
          <thead>
            <tr>
              <th colSpan={7} className="bg-warning bg-opacity-25 text-center small">CONTROL AL PROCESO DE GESTION DE LA RESPUESTA A LA PQRS</th>
            </tr>
            <tr className="text-center small">
              <th style={{width: '50px'}}>Pasos</th>
              <th style={{width: '300px'}}>Actividad</th>
              <th style={{width: '150px'}}>Responsable</th>
              <th colSpan={4} className="text-center">Control Fechas</th>
            </tr>
            <tr className="text-center small">
              <th></th>
              <th></th>
              <th></th>
              <th>Inicial</th>
              <th>ReasignaciónVal</th>
              <th>Final</th>
              <th>Cumple</th>
            </tr>
          </thead>
          <tbody className="small">
            {[
              { paso: '1.', actividades: [
                'Recepción diaria por lo canales autorizados. Verificación',
                'Creación de la PQRS en dovela y generación de VR',
                'Digitalización de documentos'
              ]},
              { paso: '2.', actividades: [
                'Direccionamiento',
                'Clasificación y asignación de términos',
                'Asignación de responsables CUB1 para apoyar respuesta',
                'a. Verificación en base de datos de CUB1',
                'b. Aspectos jurídicos',
                'c. Aspecto arquitectónico'
              ]},
              { paso: '3', actividades: [
                'Preparación de respuesta',
                'Inventario de anexos a entregar: Digital y Análogo.',
                'Envío respuesta por canal autorizado'
              ]},
              { paso: '4.', actividades: [
                'Digitalización de la respuesta',
                'Cierre de la solicitud',
                'Verificación en Comité de PQRS'
              ]}
            ].map((section, sectionIndex) => (
              section.actividades.map((actividad, actividadIndex) => (
                <tr key={`${sectionIndex}-${actividadIndex}`}>
                  {actividadIndex === 0 && <td rowSpan={section.actividades.length} className="text-center">{section.paso}</td>}
                  <td>{actividad}</td>
                  <td><input type="text" className="form-control form-control-sm" name={`responsable_${sectionIndex}_${actividadIndex}`} value={formData[`responsable_${sectionIndex}_${actividadIndex}`] || ''} onChange={onChange} /></td>
                  <td><input type="date" className="form-control form-control-sm" name={`fechaInicial_${sectionIndex}_${actividadIndex}`} value={formData[`fechaInicial_${sectionIndex}_${actividadIndex}`] || ''} onChange={onChange} /></td>
                  <td><input type="date" className="form-control form-control-sm" name={`fecha1_${sectionIndex}_${actividadIndex}`} value={formData[`fecha1_${sectionIndex}_${actividadIndex}`] || ''} onChange={onChange} /></td>
                  <td><input type="date" className="form-control form-control-sm" name={`fechaFinal_${sectionIndex}_${actividadIndex}`} value={formData[`fechaFinal_${sectionIndex}_${actividadIndex}`] || ''} onChange={onChange} /></td>
                  <td>
                    <select className="form-select form-select-sm" name={`cumple_${sectionIndex}_${actividadIndex}`} value={formData[`cumple_${sectionIndex}_${actividadIndex}`] || ''} onChange={onChange}>
                      <option value="">Seleccionar</option>
                      <option value="Si">Si</option>
                      <option value="No">No</option>
                    </select>
                  </td>
                </tr>
              ))
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

