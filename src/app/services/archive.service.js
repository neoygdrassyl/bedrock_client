import http from "../../http-common";

const route = "archive"

class PublishService {
  getAll() {
    return http.get(`/${route}`);
  }

  get(id) {
    return http.get(`/${route}/${id}`);
  }

  get_fun(id) {
    return http.get(`/${route}/get/fun/${id}`);
  }

  get_box(id) {
    return http.get(`/${route}/get/box/${id}`);
  }

  get_x_list(id) {
    return http.get(`/${route}/get/xlist/${id}`);
  }

  create(data) {
    return http.post(`/${route}`, data);
  }

  create_x(data) {
    return http.post(`/${route}/x`, data);
  }

  update(id, data) {
    return http.put(`/${route}/${id}`, data);
  }

  update_x(idFun, idBox, data) {
    return http.put(`/${route}/x/${idFun}&${idBox}`, data);
  }

  delete(id) {
    return http.delete(`/${route}/${id}`);
  }

  delete_x(idFun, idBox, folder) {
    return http.delete(`/${route}/x/${idFun}&${idBox}&&${folder}`);
  }

  deleteAll() {
    return http.delete(`/${route}`);
  }
}

export default new PublishService();