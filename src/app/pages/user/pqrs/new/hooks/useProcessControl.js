import { useState } from "react";
import { getManagementSteps } from "../utils/helpers/steps";

const useProcessControl = () => {
  const [control, setControl] = useState({});

  const handleControlChange = (e) => {
    const { name, value, type, checked } = e.target;
    setControl((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const processControlData = () => {
    let data = [];
    const activities = getManagementSteps();
    console.log(activities);
    for (let sectionIndex = 0; sectionIndex < 4; sectionIndex++) {
      for (let actividadIndex = 0; actividadIndex < 10; actividadIndex++) {
        const active = control[`responsable_${sectionIndex}_${actividadIndex}`] || '';
        console.log(active);
        if (active) {
          data.push({
            activity: activities[sectionIndex].actividades[actividadIndex],
            responsable: control[`responsable_${sectionIndex}_${actividadIndex}`] || '',
            responsable_2: control[`responsable_2_${sectionIndex}_${actividadIndex}`] || '',
            init_time: control[`fechaInicial_${sectionIndex}_${actividadIndex}`] || null,
            time_1: control[`fecha1_${sectionIndex}_${actividadIndex}`] || null,
            final_time: control[`fechaFinal_${sectionIndex}_${actividadIndex}`] || null,
          });
        }
      }
    }
    console.log(data)
    return data;
  };

  return { control, handleControlChange, processControlData };
};

export default useProcessControl;
