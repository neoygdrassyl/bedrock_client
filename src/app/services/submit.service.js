import http from "../../http-common";

const route = "submit"

class Submit_Service {

  getAll() {
    return http.get(`/${route}`);
  }
  get(id) {
    return http.get(`/${route}/${id}`);
  }
  getSearch(field, string) {
    return http.get(`/${route}/getsearch/${field}&${string}`);
  }
  getlastid() {
    return http.get(`/${route}/getid/lastid`);
  }
  verifyid(id) {
    return http.get(`/${route}/getid/verifyid/${id}`);
  }
  getIdRelated(id_related) {
    return http.get(`/${route}/getlist/${id_related}`);
  }

  create(data) {
    return http.post(`/${route}`, data);
  }
  create_list(data) {
    return http.post(`/${route}/create_list`, data);
  } 
  create_anex(data) {
    return http.post(`/${route}/anex/`, data);
  }

  update(id, data) {
    return http.put(`/${route}/${id}`, data);
  }
  update_list(id, data) {
    return http.put(`/${route}/update_list/${id}`, data);
  }
  update_anex(id, data) {
    return http.put(`/${route}/anex/${id}`, data);
  }


  delete(id) {
    return http.delete(`/${route}/${id}`);
  }
  delete_list(id) {
    return http.delete(`/${route}/delete_list/${id}`);
  }

  deleteAll() {
    return http.delete(`/${route}`);
  } 

  gen_doc_submit(data) {
    return http.post(`/${route}/gendoc/submit`, data);
  }

}

export default new Submit_Service();