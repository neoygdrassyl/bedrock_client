const roles = [
    { id: 2, name: "Curador", field: "response_curator" },
    { id: 5, name: "Abogada", field: "response_legal" },
    { id: 6, name: "Arquitecta", field: "response_arquitecture" },
    { id: 7, name: "Secretaria", field: "response_structure" },
    { id: 3, name: "Administrador", field: "response_archive" }
];
export const getRole = (userId) => {
    return roles.find(role => role.id === userId ? role : null)
}