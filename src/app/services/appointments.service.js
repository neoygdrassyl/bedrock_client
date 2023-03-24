import http from "../../http-common";

const route = "appointments"

class UserslDataService {
  getAll() {
    return http.get(`/${route}`);
  }

  get(id) {
    return http.get(`/${route}/${id}`);
  }

  create(data) {
    return http.post(`/${route}`, data);
  }

  checkforAvilAbleDate(data) {
    return http.post(`/${route}/search/aviailabledate/`, data);
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
    return http.get(`/${route}?date=${title}`);
  }
}

export default new UserslDataService();