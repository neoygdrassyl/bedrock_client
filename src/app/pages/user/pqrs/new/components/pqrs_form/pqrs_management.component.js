import { getManagementSteps } from "../../utils/helpers/steps";

export default function ProcessControl({ control, users, handleControlChange }) {
  return (
    <div className="container-fluid p-2">
      <div className="table-responsive">
        <table className="table table-bordered table-sm">
          <thead>
            <tr>
              <th colSpan={8} className="bg-warning bg-opacity-25 text-center small">
                CONTROL AL PROCESO DE GESTION DE LA RESPUESTA A LA PQRS
              </th>
            </tr>
            <tr className="text-center small">
              <th style={{ width: '50px' }}>Pasos</th>
              <th style={{ width: '300px' }}>Actividad</th>
              <th style={{ width: '200px' }}>Responsable</th>
              <th style={{ width: '200px' }}>Responsable 2</th>
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
            {getManagementSteps().map((section, sectionIndex) =>
              section.actividades.map((actividad, actividadIndex) => {
                const currentControl = control.find(
                  (item) => item.paso === sectionIndex && item.activity === actividad
                ) || {};

                return (
                  <tr key={`${sectionIndex}-${actividadIndex}`}>
                    {actividadIndex === 0 && (
                      <td rowSpan={section.actividades.length} className="text-center">
                        {section.paso}
                      </td>
                    )}
                    <td>{actividad}</td>
                    <td>
                      {users.length > 0 && (
                        <select
                          className="form-select form-select-sm"
                          name="responsable"
                          value={currentControl?.responsable || ""}
                          onChange={(e) => handleControlChange(e, actividad)}
                        >
                          <option value="" disabled>Seleccione una opción</option>
                          {users.map((user) => (
                            <option key={user.id} value={`${user.name} ${user.surname}`}>
                              {user.name} {user.surname}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td>
                      {users.length > 0 && (
                        <select
                          className="form-select form-select-sm"
                          name="responsable_2"
                          value={currentControl?.responsable_2 || ""}
                          onChange={(e) => handleControlChange(e, actividad)}
                        >
                          <option value="" disabled>Seleccione una opción</option>
                          {users.map((user) => (
                            <option key={user.id} value={`${user.name} ${user.surname}`}>
                              {user.name} {user.surname}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        name="init_time"
                        value={currentControl?.init_time || ""}
                        onChange={(e) => handleControlChange(e, actividad)}
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        name="time_1"
                        value={currentControl?.time_1 || ""}
                        onChange={(e) => handleControlChange(e, actividad)}
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        name="final_time"
                        value={currentControl?.final_time || ""}
                        onChange={(e) => handleControlChange(e, actividad)}
                      />
                    </td>
                    <td className={currentControl?.cumple === "Sí" ? "text-success" : "text-danger"}>
                      <p className="text-center">{currentControl?.cumple || "NO APLICA"}</p>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
