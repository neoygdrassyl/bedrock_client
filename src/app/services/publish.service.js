import http from "../../http-common";

const route = "publications"

class PublishService {
  getAll() {
    return http.get(`/${route}`);
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
}

export default new PublishService();