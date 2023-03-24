import http from "../../http-common";

const route = "recordr"

class RecordReviewService {
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
  gen_doc_incomplete_act(data) {
    return http.post(`/${route}/gendoc/confirmact`, data);
  }
  gen_doc_incomplete_act_2(data) {
    return http.post(`/${route}/gendoc/confirmact2`, data);
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

  newVersion(data) {
    return http.post(`/${route}/newVersion/`, data);
  }

  gen_doc(data) {
    //return http.post(`/${route}/gendoc/ph`, data);
  }

}

export default new RecordReviewService();