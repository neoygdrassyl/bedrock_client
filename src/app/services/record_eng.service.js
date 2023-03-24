import http from "../../http-common";

const route = "recordeng"

class RecordEngService {
    getAll() {
        return http.get(`/${route}`);
    }
    get(id) {
        return http.get(`/${route}/${id}`);
    }
    findIdRelated(id) {
        return http.get(`/${route}/findIdRelated/${id}`);
    }
    getRecord(id) {
        return http.get(`/${route}/findrecord/${id}`);
      }
    
    pdfgen(data) {
        return http.post(`/${route}/pdfgen`, data);
      }


    create(data) {
        return http.post(`/${route}`, data);
    }
    create_sis(data) {
        return http.post(`/${route}/create_sis`, data);
    }
    create_step(data) {
        return http.post(`/${route}/create_step`, data);
    }
    create_review(data) {
        return http.post(`/${route}/create_review`, data);
    }
create_xsis(data) {
        return http.post(`/${route}/create_xsis`, data);
    }

    update(id, data) {
        return http.put(`/${route}/${id}`, data);
    }
    update_step(id, data) {
        return http.put(`/${route}/update_step/${id}`, data);
    }
    update_sis(id, data) {
        return http.put(`/${route}/update_sis/${id}`, data);
    }
    update_review(id, data) {
        return http.put(`/${route}/update_review/${id}`, data);
    }



    delete(id) {
        return http.delete(`/${route}/${id}`);
    }
    delete_sis(id, sort, recordEngId) {
        return http.delete(`/${route}/delete_sis/${id}&${sort}&${recordEngId}`);
    }


    deleteAll() {
        return http.delete(`/${route}`);
    }
}

export default new RecordEngService();