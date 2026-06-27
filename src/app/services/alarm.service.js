import http from "../../http-common";

const ROUTE = "funmanage/alarms";

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value == null || value === "" || value === false) return;
    if (Array.isArray(value)) {
      value.forEach((v) => query.append(key, v));
    } else {
      query.set(key, String(value));
    }
  });
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

class AlarmService {
  // ---- Config ----
  getConfig() {
    return http.get(`/${ROUTE}/config`);
  }

  updateConfig(configJson) {
    return http.put(`/${ROUTE}/config`, { configJson });
  }

  // ---- Listado general ----
  // Acepta: severity, level, actor, action, phaseCode, includeAttended,
  //        includeHidden, includeArchived, assignedOnly, limit
  list(params = {}) {
    return http.get(`/${ROUTE}${buildQuery(params)}`);
  }

  // ---- Campana de perfil (show_alarm + actor=CUR; assignedOnly opcional) ----
  bell(params = {}) {
    return http.get(`/${ROUTE}/bell${buildQuery(params)}`);
  }

  // ---- Acciones sobre una alarma ----
  attend(id) {
    return http.put(`/${ROUTE}/${id}/attend`);
  }

  hide(id) {
    return http.put(`/${ROUTE}/${id}/hide`);
  }

  markRead(id) {
    return http.put(`/${ROUTE}/${id}/read`);
  }

  archive(id) {
    return http.put(`/${ROUTE}/${id}/archive`);
  }

  // ---- Refresh manual del scheduler ----
  refresh() {
    return http.post(`/${ROUTE}/refresh`);
  }
}

export default new AlarmService();
