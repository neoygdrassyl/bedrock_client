import http from "./http-emails";

const route = "emails"

class EmailsService {
  getAll(compnay, process, id_public) {
    return http.get(`/${route}/all/${compnay}&${process}&${id_public}`);
  }

  get(id) {
    return http.get(`/${route}/one/${id}`);
  }

  getDoc(docUrl) {
    return http.get(`/${route}/doc/${docUrl}`);
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
}

export default new EmailsService();