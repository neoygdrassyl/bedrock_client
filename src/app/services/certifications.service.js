import http from "../../http-common";

const route = "certification"

class SERVICE_CERTIFICATIONS {
  getAll() {
    return http.get(`/${route}`);
  }

  get_id(id) {
    return http.get(`/${route}/get/ID/${id}`);
  }

  get_oc(id_public) {
    return http.get(`/${route}/get/OC/${id_public}`);
  }

  get_re(id_related, related) {
    return http.get(`/${route}/get/RE/${id_related}&${related}`);
  }

  create(data) {
    return http.post(`/${route}`, data);
  }

  update(id, data) {
    return http.put(`/${route}/${id}`, data);
  }

  delete(id) {
    return http.delete(`/${route}/${id}`);
  }

  gendoc_cert_fun(data) {
    return http.post(`/${route}/gendoc_cert_fun/`, data);
  }

}

export default new SERVICE_CERTIFICATIONS();