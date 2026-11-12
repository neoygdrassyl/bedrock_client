import http from "./http-profs";
import { isProfessionalsRegistryEnabled, PROFESSIONALS_REGISTRY_DISABLED_MESSAGE } from "./professionalsRegistry";

// Without a configured registry nothing is sent: lookups answer empty, find-or-create is skipped and
// changes to the registry itself fail with an explicit message.
const enabled = () => isProfessionalsRegistryEnabled();
const empty = (data) => Promise.resolve({ data, skipped: true });
const disabled = () => Promise.reject(new Error(PROFESSIONALS_REGISTRY_DISABLED_MESSAGE));

const route = "profesionals"

const headers = () => {
  return { user: window.user ? String(window.user.role_short + ' ' + window.user.name_full).toLowerCase() : 'no user' }
}


class ProfesionalsService {
  getAll() {
    if (!enabled()) return empty([]);
    return http.get(`/${route}/`);
  }
  get(id) {
    if (!enabled()) return empty(null);
    return http.get(`/${route}/${id}`);
  }
  
  getByName(name) {
    if (!enabled()) return empty([]);
    return http.get(`/${route}/other/${name}`);
  }

  getByDoc(id, reg) {
    if (!enabled()) return empty([]);
    return http.get(`/${route}/other/${id}&${reg}`);
  }

  create(data) {
    if (!enabled()) return disabled();
    return http.post(`/${route}`, data, { headers: headers() });
  }

  createOrFind(data) {
    if (!enabled()) return empty(null);
    return http.post(`/${route}/other/findorcreate`, data, { headers:  headers() });
  }

  update(id, data) {
    if (!enabled()) return disabled();
    return http.put(`/${route}/${id}`, data, { headers:  headers() });
  }

  delete(id) {
    if (!enabled()) return disabled();
    return http.delete(`/${route}/${id}`, { headers:  headers() });
  }

  download(folder, file) {
    if (!enabled()) return disabled();
    return http.get(`/${route}/doc/${folder}&${file}`);
  }

}

export default new ProfesionalsService();