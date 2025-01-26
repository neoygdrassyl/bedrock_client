import { useMemo } from "react";
import { getManagementSteps } from "../../utils/helpers/steps";

export default function ProcessControl({ initialData, formData, onChange }) {

  const mapNewPqrsToControl = (newPqrsControls) => {
    let control = {};
    getManagementSteps().forEach((step, sectionIndex) => {
      step.actividades.forEach((actividad, actividadIndex) => {
        const pqrsItem = newPqrsControls.find((item) => item.activity === actividad);

        if (pqrsItem) {
          control[`responsable_${sectionIndex}_${actividadIndex}`] = pqrsItem.responsable || '';
          control[`responsable_2_${sectionIndex}_${actividadIndex}`] = pqrsItem.responsable_2 || '';
          control[`fechaInicial_${sectionIndex}_${actividadIndex}`] = pqrsItem.init_time || '';
          control[`fecha1_${sectionIndex}_${actividadIndex}`] = pqrsItem.time_1 || '';
          control[`fechaFinal_${sectionIndex}_${actividadIndex}`] = pqrsItem.final_time || '';
          control[`cumple_${sectionIndex}_${actividadIndex}`] = isOnTime(pqrsItem) ? 'Sí' : 'No';


        }
      });
    });
    console.log(control)
    return control;
  };
  const isOnTime = (pqrsItem) => {
    const fechaInicial = pqrsItem.init_time ? new Date(pqrsItem.init_time) : null;
    const fecha1 = pqrsItem.time_1 ? new Date(pqrsItem.time_1) : null;
    const fechaFinal = pqrsItem.final_time ? new Date(pqrsItem.final_time) : null;
    // Determinar la fecha de inicio
    let fechaInicio = fecha1 || fechaInicial;

    // Verificar si las fechas son válidas antes de calcular
    let cumple = false;
    if (fechaInicio && fechaFinal) {
      const diferenciaDias = (fechaFinal - fechaInicio) / (1000 * 60 * 60 * 24);
      cumple = diferenciaDias <= 10;
    }
    return cumple;
  }
  const data = useMemo(() => initialData ? mapNewPqrsToControl(initialData) : {}, [initialData]);

  return (
    <div className="container-fluid p-2">
      {/* Process Management Control Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-sm">
          <thead>
            <tr>
              <th colSpan={8} className="bg-warning bg-opacity-25 text-center small">CONTROL AL PROCESO DE GESTION DE LA RESPUESTA A LA PQRS</th>
            </tr>
            <tr className="text-center small">
              <th style={{ width: '50px' }}>Pasos</th>
              <th style={{ width: '300px' }}>Actividad</th>
              <th style={{ width: '150px' }}>Responsable</th>
              <th style={{ width: '150px' }}>Responsable 2</th>
              <th colSpan={4} className="text-center">Control Fechas</th>
            </tr>
            <tr className="text-center small">
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th>Inicial</th>
              <th>Reasignación</th>
              <th>Final</th>
              <th>Cumple</th>
            </tr>
          </thead>
          <tbody className="small">
            {getManagementSteps().map((section, sectionIndex) => (
              section.actividades.map((actividad, actividadIndex) => (
                <tr key={`${sectionIndex}-${actividadIndex}`}>
                  {actividadIndex === 0 && <td rowSpan={section.actividades.length} className="text-center">{section.paso}</td>}
                  <td>{actividad}</td>
                  <td><input type="text" className="form-control form-control-sm" name={`responsable_${sectionIndex}_${actividadIndex}`} defaultValue={data[`responsable_${sectionIndex}_${actividadIndex}`] || (formData[`responsable_${sectionIndex}_${actividadIndex}`] || '')} onChange={onChange} /></td>
                  <td><input type="text" className="form-control form-control-sm" name={`responsable_2_${sectionIndex}_${actividadIndex}`} defaultValue={data[`responsable_2_${sectionIndex}_${actividadIndex}`] || (formData[`responsable_2_${sectionIndex}_${actividadIndex}`] || '')} onChange={onChange} /></td>
                  <td><input type="date" className="form-control form-control-sm" name={`fechaInicial_${sectionIndex}_${actividadIndex}`} defaultValue={data[`fechaInicial_${sectionIndex}_${actividadIndex}`] || (formData[`fechaInicial_${sectionIndex}_${actividadIndex}`] || '')} onChange={onChange} /></td>
                  <td><input type="date" className="form-control form-control-sm" name={`fecha1_${sectionIndex}_${actividadIndex}`} defaultValue={data[`fecha1_${sectionIndex}_${actividadIndex}`] || (formData[`fecha1_${sectionIndex}_${actividadIndex}`] || '')} onChange={onChange} /></td>
                  <td><input type="date" className="form-control form-control-sm" name={`fechaFinal_${sectionIndex}_${actividadIndex}`} defaultValue={data[`fechaFinal_${sectionIndex}_${actividadIndex}`] || (formData[`fechaFinal_${sectionIndex}_${actividadIndex}`] || '')} onChange={onChange} /></td>
                  <td className={`${data[`cumple_${sectionIndex}_${actividadIndex}`] === "Sí" ? "text-success" : "text-danger"}`}>
                    <p className="text-center">
                      {data[`cumple_${sectionIndex}_${actividadIndex}`] || 'NO APLICA'}
                    </p>
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

