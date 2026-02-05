import http from "../../http-common";

const route = "zone_use"

class Zone_Use_Service {
    getAll() { return http.get(`/${route}/`) }
    get(id) { return http.get(`/${route}/${id}`) }
    search(search) { return http.get(`/${route}/search${search}`) }

    create(data) { return http.post(`/${route}/`, data) }
    update(id, data) { return http.put(`/${route}/${id}`, data) }
    delete(id) { return http.delete(`/${route}/${id}`) }


    // PDF GENERATION
    gen_pdf(data) { return http.post(`/${route}/pdf`, data) }
}

export default new Zone_Use_Service();