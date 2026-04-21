import http from "../../http-common";

const ROUTE = "funmanage/alarms";

class AlarmService {
  getConfig() {
    return http.get(`/${ROUTE}/config`);
  }

  updateConfig(configJson) {
    return http.put(`/${ROUTE}/config`, { configJson });
  }

  list(params = {}) {
    const query = new URLSearchParams();
    if (params.severity) query.set("severity", params.severity);
    if (params.includeAttended) query.set("includeAttended", "true");
    if (params.includeHidden) query.set("includeHidden", "true");
    if (params.limit) query.set("limit", params.limit);
    const qs = query.toString();
    return http.get(`/${ROUTE}${qs ? `?${qs}` : ""}`);
  }

  attend(id) {
    return http.put(`/${ROUTE}/${id}/attend`);
  }

  hide(id) {
    return http.put(`/${ROUTE}/${id}/hide`);
  }
}

export default new AlarmService();
