import http from "../../http-common";

const route = "solicitors"

class Solicitors_service {
  getAll() {
    return http.get(`/${route}/getAll`);
  }
  create(data) {    
    return http.post(`/${route}/create`, data);
  }
  getById(id_) {
    return http.get(`/${route}/getById/${id_}`);
  }
  addReason(data){
    return http.post(`/${route}/addReason`, data);
  }
//   update(id, data) {
//     return http.put(`/${route}/${id}`, data);
//   }

//   delete(id) {
//     return http.delete(`/${route}/${id}`);
//   }
}

export default new Solicitors_service();