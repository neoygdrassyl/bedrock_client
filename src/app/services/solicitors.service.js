import http from "../../http-common";

const route = "solicitors"

class Solicitors_service {
  getAll() {
    return http.get(`/${route}/getAll`);
  }
  create(data) {
    return http.post(`/${route}/create`, data);
  }

//   update(id, data) {
//     return http.put(`/${route}/${id}`, data);
//   }

//   delete(id) {
//     return http.delete(`/${route}/${id}`);
//   }
}

export default new Solicitors_service();