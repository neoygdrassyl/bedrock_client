
const timesForPQRS = {
    "Petición": 15,
    "Queja": 15,
    "Reclamo": 15,
    "Sugerencia": 0,
    "Denuncia": 15,
    "Consulta": 10
};
const petitionToTime = (petition) => {
    return timesForPQRS[petition];
}
export default petitionToTime;

