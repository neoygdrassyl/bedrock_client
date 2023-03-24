import http from "../../http-common";

const route = "users"

class UserslDataService {
  getAll() {
    return http.get(`/${route}`);
  }

  getAllWorkers() {
    return http.get(`/${route}/get/workers`);
  }

  getCertificate(id, pass) {
    return http.get(`/${route}/get/certificate/${id}&${pass}`);
  }

  get(id) {
    return http.get(`/${route}/${id}`);
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

  deleteAll() {
    return http.delete(`/${route}`);
  }

  findByTitle(title) {
    return http.get(`/${route}?title=${title}`);
  }
}

export default new UserslDataService();