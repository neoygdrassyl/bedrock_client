import http from "./http-profs";

const route = "profesionals"

const headers = () => {
  return { user: window.user ? String(window.user.role_short + ' ' + window.user.name_full).toLowerCase() : 'no user' }
}


class ProfesionalsService {
  getAll() {
    return http.get(`/${route}/`);
  }
  get(id) {
    return http.get(`/${route}/${id}`);
  }
  
  getByName(name) {
    return http.get(`/${route}/other/${name}`);
  }

  getByDoc(id, reg) {
    return http.get(`/${route}/other/${id}&${reg}`);
  }

  sentEmail(email) {
    return http.get(`/${route}/email/${email}`);
  }

  create(data) {
    return http.post(`/${route}`, data, { headers: headers() });
  }

  createOrFind(data) {
    return http.post(`/${route}/other/findorcreate`, data, { headers:  headers() });
  }

  update(id, data) {
    return http.put(`/${route}/${id}`, data, { headers:  headers() });
  }
  
  updatePublic(data) {
    return http.post(`/${route}/other/updatepublic`, data, { headers:  headers() });
  }

  delete(id) {
    return http.delete(`/${route}/${id}`, { headers:  headers() });
  }

  download(folder, file) {
    return http.get(`/${route}/doc/${folder}&${file}`);
  }

}

export default new ProfesionalsService();