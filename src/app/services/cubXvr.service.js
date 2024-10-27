import http from "../../http-common";

const route = "cubXVr";

class CubXVrDataService {
    getByCUB(id) {
        return http.get(`/${route}/getByCUB/${id}`);
    }

    getByVR(id) {
        return http.get(`/${route}/getByVR/${id}`);
    }

    getByFUN(id) {
        return http.get(`/${route}/getByFUN/${id}`);
    }

    getByPQRS(id) {
        return http.get(`/${route}/getByPQRS/${id}`);
    }

    getAllCubXVr() {
        return http.get(`/${route}/getAllCubXvr`);
    }

    getByProcess(process) {
        return http.get(`/${route}/getByProcess/${process}`);
    }

    createCubXVr(data) {
        return http.post(`/${route}/createCubXVr`, data);
    }

    updateCubVr(id, data) {
        return http.put(`/${route}/updateCubVr/${id}`, data);
    }
}

export default new CubXVrDataService();
