import http from "../../http-common";

const route = "seals"

class SealsDataService {
  getAll() {
    return http.get(`/${route}`);
  }

  get(id) {
    return http.get(`/${route}/${id}`);
  }

  getParent(id_public) {
    return http.get(`/${route}/findfamily/${id_public}`);
  }

  getSearch(field, string) {
    return http.get(`/${route}/getsearch/${field}&${string}`);
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

export default new SealsDataService();
