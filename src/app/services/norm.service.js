import http from "../../http-common";

const route = "norms"

class Norms_Service {
    // NORM SERVICE
    getAll_norm() { return http.get(`/${route}/norm/`) }
    get_norm(id) { return http.get(`/${route}/norm/${id}`) }
    get_norm_img(url) { return http.get(`/${route}/norm/img/${url}`) }
    create_norm(data) { return http.post(`/${route}/norm/`, data) }
    update_norm(id, data) { return http.put(`/${route}/norm/${id}`, data) }
    delete_norm(id) { return http.delete(`/${route}/norm/${id}`) }

    // PREDIO SERVICE
    getAll_predio(id) { return http.get(`/${route}/predio/all/${id}`) }
    get_predio(id) { return http.get(`/${route}/predio/one/${id}`) }
    create_predio(data) { return http.post(`/${route}/predio`, data) }
    update_predio(id, data) { return http.put(`/${route}/predio/${id}`, data) }
    delete_predio(id) { return http.delete(`/${route}/predio/${id}`) }

    // NEIGHBOR SERVICE
    getAll_neighbor(id) { return http.get(`/${route}/neighbor/all/${id}`) }
    get_neighbor(id) { return http.get(`/${route}/neighbor/one/${id}`) }
    create_neighbor(data) { return http.post(`/${route}/neighbor`, data) }
    update_neighbor(id, data) { return http.put(`/${route}/neighbor/${id}`, data) }
    delete_neighbor(id) { return http.delete(`/${route}/neighbor/${id}`) }

    // PERFIL SERVICE
    getAll_perfil(id) { return http.get(`/${route}/prefil/all/${id}`) }
    get_perfil(id) { return http.get(`/${route}/prefil/one/${id}`) }
    create_perfil(data) { return http.post(`/${route}/prefil`, data) }
    update_perfil(id, data) { return http.put(`/${route}/prefil/${id}`, data) }
    delete_perfil(id) { return http.delete(`/${route}/prefil/${id}`) }

    // PERFIL ELEMENT SERVICE
    getAll_element(id) { return http.get(`/${route}/element/all/${id}`) }
    get_element(id) { return http.get(`/${route}/element/one/${id}`) }
    create_element(data) { return http.post(`/${route}/element`, data) }
    update_element(id, data) { return http.put(`/${route}/element/${id}`, data) }
    delete_element(id) { return http.delete(`/${route}/element/${id}`) }
}

export default new Norms_Service();