import { getFinalTime, getTimeDiff } from "./useTimes";

export const defaultTableData = (initialData, time, day_seted, day_done, FINAL) => {
    const baseData = [
        {
            action: "CRAD",
            repeat: "",
            directedTo: "Peticionario",
            day_available: "",
            date_set: null,
            useAction: true,
            cub: "",
            date_end: null,
            day_end: "",
            isSentVerified: false,
            terminoResolver: "Fecha de inicio",
            processIndicator: day_seted,
        },
        {
            action: "ACLP",
            repeat: "",
            directedTo: "Peticionario",
            day_available: "",
            date_set: null,
            useAction: false,
            cub: "",
            date_end: null,
            day_end: "",
            isSentVerified: true,
            terminoResolver: "Fecha máxima",
            processIndicator: FINAL ?? "",
        },
        {
            action: "TPCO",
            repeat: "",
            directedTo: "Entidades",
            day_available: "",
            date_set: null,
            useAction: false,
            cub: "",
            date_end: null,
            day_end: "",
            isSentVerified: true,
            terminoResolver: "Fecha envió respuesta",
            processIndicator: day_done,
        },
        {
            action: "CTPC",
            repeat: "",
            directedTo: "Entidades",
            day_available: "",
            date_set: null,
            useAction: false,
            cub: "",
            date_end: null,
            day_end: "",
            isSentVerified: true,
            terminoResolver: "Número de días",
            processIndicator: "",
        },
        {
            action: "AMPT",
            repeat: "",
            directedTo: "Peticionario",
            day_available: "",
            date_set: null,
            useAction: false,
            cub: "",
            date_end: null,
            day_end: "",
            isSentVerified: false,
            terminoResolver: "Eficiencia",
            processIndicator: (getTimeDiff(day_seted, day_done) / (time?.days ?? 1)).toFixed(2),
        },
        {
            action: "REPT",
            repeat: "",
            directedTo: "Peticionario",
            day_available: "",
            date_set: null,
            useAction: true,
            cub: "",
            date_end: null,
            day_end: "",
            isSentVerified: false,
            terminoResolver: "EFICIENTE",
            processIndicator: (getTimeDiff(day_seted, day_done) / (time?.days ?? 1)) <= 1 ? "SI" : "NO",
        },
    ];
    return initialData
    ? baseData.map((defaultItem) => {
        const foundItem = initialData?.find(item => item.action === defaultItem.action) || {};
        
        const updatedDateSet = time && time[defaultItem.action] 
          ? getFinalTime(day_seted, time[defaultItem.action]) 
          : defaultItem.date_set;
          
        const updatedDateEnd = foundItem.date_end ?? defaultItem.date_end;
        return {
          ...defaultItem,
          ...foundItem,
          day_available: time && time[defaultItem.action] ? time[defaultItem.action] : defaultItem.day_available,
          date_set: updatedDateSet,
          date_end: updatedDateEnd,
          processIndicator: defaultItem.terminoResolver === "Número de días" ? getTimeDiff(day_seted, day_done) : defaultItem.processIndicator,
        };
      })
    : baseData;
  
}   