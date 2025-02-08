import moment from "moment";

const timesForPQRS = {
    "Petición": {
        "days": 15,
        "CRAD": 1,
        "ACLP": 5,
        "TPCO": 5,
        "CTPC": 5,
        "AMPT": 10,
        "REPT": 15
    },
    "Queja": {
        "days": 15,
        "CRAD": 1,
        "ACLP": 5,
        "TPCO": 5,
        "CTPC": 5,
        "AMPT": 10,
        "REPT": 15
    },
    "Reclamo": {
        "days": 15,
        "CRAD": 1,
        "ACLP": 5,
        "TPCO": 5,
        "CTPC": 5,
        "AMPT": 10,
        "REPT": 15
    },
    "Sugerencia": {
        "days": 0,
        "CRAD": 0,
        "ACLP": 0,
        "TPCO": 0,
        "CTPC": 0,
        "AMPT": 0,
        "REPT": 0
    },
    "Denuncia": {
        "days": 15,
        "CRAD": 1,
        "ACLP": 5,
        "TPCO": 5,
        "CTPC": 5,
        "AMPT": 10,
        "REPT": 15
    },
    "Consulta": {
        "days": 10,
        "CRAD": 1,
        "ACLP": 5,
        "TPCO": 5,
        "CTPC": 5,
        "AMPT": 10,
        "REPT": 20
    }
}
const petitionToTime = (petition) => {
    return timesForPQRS[petition];
}
const getFinalTime = (initTime, daysToAdd) => {
    return moment(initTime).add(daysToAdd, 'days').format("YYYY-MM-DD");

}

const getTimeDiff = (fechaInicio, fechaEnvioRespuesta) => {
    console.log(fechaInicio);
    console.log(fechaEnvioRespuesta);    
    let numeroDeDias = "";
    if (fechaInicio && fechaEnvioRespuesta) {
        numeroDeDias = moment(fechaEnvioRespuesta).diff(moment(fechaInicio), "days");
    }
    return numeroDeDias;

}
export { petitionToTime, getFinalTime , getTimeDiff};


