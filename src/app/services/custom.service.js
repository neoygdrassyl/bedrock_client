import http from "../../http-common";

class CustomlDataService {
  appLogin(data) {
    return http.post(`/login`, data);
  }

  searchDate(date) {
    return http.get(`/searchdate/${date}`);
  }

  generate(data) {
    return http.post(`/generate/seal`, data);
  }

  seal(name) {
    return http.get(`/seal/${name}`);
  }

  getRepositoryList(name) {
    return http.get(`/repository/list`);
  }

  checkStatus_Jur(id) {
    return http.get(`/checkstatus/jur/${id}`);
  }

  checkStatus_Nr(id) {
    return http.get(`/checkstatus/nr/${id}`);
  }

  checkStatus_Lc(id) {
    return http.get(`/checkstatus/lc/${id}`);
  }
  checkStatus_In(id) {
    return http.get(`/checkstatus/in/${id}`);
  }
  checkStatus_vr(id) {
    return http.get(`/checkstatus/vr/${id}`);
  }

  loadDictionary_vr() {
    return http.get(`/consult/consult_vrDictionary`);
  }

  loadDictionary_cub() {
    return http.get(`/consult/consult_cubDictionary`);
  }

  loadDictionary_fun() {
    return http.get(`/consult/consult_funDictionary`);
  }
  loadDictionary_prof() {
    return http.get(`/consult/consult_Profesionals`);
  }
  loadDictionary_out() {
    return http.get(`/consult/consult_OutDictionary`);
  }
  loadDictionary_oc() {
    return http.get(`/consult/consult_OcDictionary`);
  }

}

export default new CustomlDataService();