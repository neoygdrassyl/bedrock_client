import { useState, useEffect } from "react";
import { getManagementSteps } from "../utils/helpers/steps";
import UserslDataService from "../../../../../services/users.service";

const useProcessControl = (initialData) => {
  const [control, setControl] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await UserslDataService.getAll();
        if (res?.data?.length > 0) {
          setUsers(res.data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (initialData && Array.isArray(initialData)) {
      setControl(processPqrsControlData(initialData));
    } else {
      setControl(processPqrsControlData([]));
    }
  }, [initialData]);

  const processPqrsControlData = (newPqrsControls) => {
    console.log(newPqrsControls)
    return getManagementSteps().flatMap((step, sectionIndex) =>
      step.actividades.map((actividad) => {
        const pqrsItem = newPqrsControls.find((item) => item.activity === actividad) || {};
        if (pqrsItem) {
          return {
            id:pqrsItem.id,
            paso: sectionIndex,
            activity: actividad,
            responsable: pqrsItem.responsable || "",
            responsable_2: pqrsItem.responsable_2 || "",
            init_time: pqrsItem.init_time || null,
            time_1: pqrsItem.time_1 || null,
            final_time: pqrsItem.final_time || null,
            cumple: isOnTime(pqrsItem) ? "Sí" : "No",
          };
        }
      })
    );
  };

  const isOnTime = (pqrsItem) => {
    const fechaInicial = pqrsItem.init_time ? new Date(pqrsItem.init_time) : null;
    const fecha1 = pqrsItem.time_1 ? new Date(pqrsItem.time_1) : null;
    const fechaFinal = pqrsItem.final_time ? new Date(pqrsItem.final_time) : null;

    let fechaInicio = fecha1 || fechaInicial;
    return fechaInicio && fechaFinal ? (fechaFinal - fechaInicio) / (1000 * 60 * 60 * 24) <= 10 : false;
  };

  const handleControlChange = (e, actividad) => {
    const { name, value } = e.target;
    console.log(name, value , actividad);

    setControl((prev) =>
      prev.map((item) =>
        item.activity === actividad ? { ...item, [name]: value } : item
      )
    );
  };

  return { control, users, handleControlChange };
};

export default useProcessControl;
