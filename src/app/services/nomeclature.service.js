import http from "../../http-common";

const route = "nomenclature"

class Nomeclature_Service {
  getAll() {
    return http.get(`/${route}`);
  }

  getAll_public() {
    return http.get(`/${route}/getall/public`);
  }

  get(id) {
    return http.get(`/${route}/${id}`);
  }

  getSearch(field, string) {
    return http.get(`/${route}/getsearch/${field}&${string}`);
  }

  getExcellData(start_date, end_date) {
    return http.get(`/${route}/getexceldata/${start_date}&${end_date}`);
  }

  getlastid() {
    return http.get(`/${route}/getid/lastid`);
  }

  create(data) {
    return http.post(`/${route}`, data);
  }

  create_anex(data) {
    return http.post(`/${route}/anex/`, data);
  }

  update(id, data) {
    return http.put(`/${route}/${id}`, data);
  }

  
  update_anex(id, data) {
    return http.put(`/${route}/anex/${id}`, data);
  }

  delete(id) {
    return http.delete(`/${route}/${id}`);
  }

  deleteAll() {
    return http.delete(`/${route}`);
  }

  gen_doc_nomenclature(data) {
    return http.post(`/${route}/gendoc/nomenclature`, data);
  }

}

export default new Nomeclature_Service();