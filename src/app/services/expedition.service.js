import http from "../../http-common";

const route = "expedition"

class ExpeditionService {
  getAll() {
    return http.get(`/${route}`);
  }
  get(id) {
    return http.get(`/${route}/${id}`);
  }
  getRecord(id) {
    return http.get(`/${route}/findrecord/${id}`);
  }

  
  create(data) {
    return http.post(`/${route}`, data);
  }
 
  
  create_exp_area(data) {
    return http.post(`/${route}/create_exp_area`, data);
  }
 

  update(id, data) {
    return http.put(`/${route}/${id}`, data);
  }

  update_exp_area(id, data) {
    return http.put(`/${route}/update_exp_area/${id}`, data);
  }


  delete(id) {
    return http.delete(`/${route}/${id}`);
  }
  delete_exp_area(id) {
    return http.delete(`/${route}/delete_exp_area/${id}`);
  }


  
  gen_doc_1(data) {
    return http.post(`/${route}/gen_doc_1`, data);
  }
  gen_doc_2(data) {
    return http.post(`/${route}/gen_doc_2`, data);
  }
  gen_doc_3(data) {
    return http.post(`/${route}/gen_doc_3`, data);
  }
  gen_doc_4(data) {
    return http.post(`/${route}/gen_doc_4`, data);
  }
  gen_doc_5(data) {
    return http.post(`/${route}/gen_doc_5`, data);
  }
  gen_doc_6(data) {
    return http.post(`/${route}/gen_doc_6`, data);
  }
  gen_doc_7(data) {
    return http.post(`/${route}/gen_doc_7`, data);
  }
  gen_doc_eje(data) {
    return http.post(`/${route}/gen_doc_eje`, data);
  }

  gen_doc_res(data) {
    return http.post(`/${route}/gen_doc_res`, data);
  }
  gen_doc_final_not(data) {
    return http.post(`/${route}/gen_doc_final_not`, data);
  }
  
}

export default new ExpeditionService();