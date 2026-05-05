import http from "../../http-common";
import { sha256 } from "js-sha256";

class CustomlDataService {
  appLogin(data) {
    return http.post(`/login`, data);
  }

  buildLoginFormData(email, password) {
    const formData = new FormData();
    formData.set("email", email);
    formData.set("password", password);
    return formData;
  }

  isRecognizedLoginResponse(data) {
    if (!data) return false;
    if (data.token && data.user) return true;
    return Array.isArray(data) && data.length === 1;
  }

  async appLoginCompatible({ email, password }) {
    const safeEmail = (email || "").trim();
    const safePassword = password || "";

    // Intenta primero con contraseña plana (backend nuevo)
    const plainPayload = this.buildLoginFormData(safeEmail, safePassword);
    try {
      const response = await this.appLogin(plainPayload);
      if (this.isRecognizedLoginResponse(response.data)) {
        return response;
      }
    } catch (error) {
      if (!error.response || ![400, 401, 422, 500].includes(error.response.status)) {
        throw error;
      }
    }

    // Fallback con SHA256 (backend legado)
    const legacyPayload = this.buildLoginFormData(safeEmail, sha256(safePassword));
    return this.appLogin(legacyPayload);
  }

  getMe() {
    return http.get(`/me`);
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

  loadDictionary_cub_id(id) {
    return http.get(`/consult/consult_cubDictionary/${id}`);
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