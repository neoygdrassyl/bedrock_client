import http from "../../http-common";

const route = "recordph"

class RecordPhService {
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
  create_blueprint(data) {
    return http.post(`/${route}/createblueprint`, data);
  }
  create_floor(data) {
    return http.post(`/${route}/createfloor`, data);
  }
  create_building(data) {
    return http.post(`/${route}/createbuilding`, data);
  }
  create_step(data) {
    return http.post(`/${route}/create_step`, data);
  }
 
 

  update(id, data) {
    return http.put(`/${route}/${id}`, data);
  }
  update_blueprint(id, data) {
    return http.put(`/${route}/updateblueprint/${id}`, data);
  }
  update_floor(id, data) {
    return http.put(`/${route}/updatefloor/${id}`, data);
  }
  update_building(id, data) {
    return http.put(`/${route}/updatebuilding/${id}`, data);
  }
  update_step(id, data) {
    return http.put(`/${route}/update_step/${id}`, data);
  }


  delete(id) {
    return http.delete(`/${route}/${id}`);
  }
  delete_blueprint(id) {
    return http.delete(`/${route}/deleteblueprint/${id}`);
  }
  delete_floor(id) {
    return http.delete(`/${route}/deletefloor/${id}`);
  }
  delete_building(id) {
    return http.delete(`/${route}/deletebuilding/${id}`);
  }
  

  gen_doc_ph(data) {
    return http.post(`/${route}/gendoc/ph`, data);
  }

  gen_doc_not(data) {
    return http.post(`/${route}/gendoc/not`, data);
  }
  deleteAll() {
    return http.delete(`/${route}`);
  }
}

export default new RecordPhService();