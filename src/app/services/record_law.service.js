import http from "../../http-common";

const route = "recordlaw"

class RecordLawService {
  getAll() {
    return http.get(`/${route}`);
  }
  get(id) {
    return http.get(`/${route}/${id}`);
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
  create_law_gem(data) {
    return http.post(`/${route}/creategen`, data);
  }
  create_law_doc(data) {
    return http.post(`/${route}/createdoc`, data);
  }
  create_law_review(data) {
    return http.post(`/${route}/createreview`, data);
  }
  create_law_11liberty(data) {
    return http.post(`/${route}/create11liberty`, data);
  }
  create_law_11tax(data) {
    return http.post(`/${route}/create11tax`, data);
  }
  create_law_licence(data) {
    return http.post(`/${route}/createlicence`, data);
  }
  new_record(data) {
    return http.post(`/${route}/newrecord`, data);
  }
  create_step(data) {
    return http.post(`/${route}/createStep`, data);
  }
 
 

  update(id, data) {
    return http.put(`/${route}/${id}`, data);
  }
  update_law_gen(id, data) {
    return http.put(`/${route}/updategen/${id}`, data);
  }
  update_law_doc(id, data) {
    return http.put(`/${route}/updatedoc/${id}`, data);
  }
  update_law_review(id, data) {
    return http.put(`/${route}/updatereview/${id}`, data);
  }
  update_law_11liberty(id, data) {
    return http.put(`/${route}/update11liberty/${id}`, data);
  }
  update_law_11tax(id, data) {
    return http.put(`/${route}/update11tax/${id}`, data);
  }
  update_law_licence(id, data) {
    return http.put(`/${route}/updatelicence/${id}`, data);
  }
  update_step(id, data) {
    return http.put(`/${route}/updateStep/${id}`, data);
  }

  delete(id) {
    return http.delete(`/${route}/${id}`);
  }
  delete_law_11liberty(id) {
    return http.delete(`/${route}/delete11liberty/${id}`);
  }
  delete_law_11tax(id) {
    return http.delete(`/${route}/delete11tax/${id}`);
  }
  delete_law_gen(id) {
    return http.delete(`/${route}/deletegen/${id}`);
  }
  delete_law_licence(id) {
    return http.delete(`/${route}/deletelicence/${id}`);
  }
  

  deleteAll() {
    return http.delete(`/${route}`);
  }
}

export default new RecordLawService();