import http from "../../http-common";

const route = "subdivision-qgis";

class SubdivisionQgisService {
  getSchema() {
    return http.get(`/${route}/schema`);
  }

  getExpediente(idPublic, version = 1) {
    return http.get(`/${route}/expediente/${encodeURIComponent(idPublic)}?version=${encodeURIComponent(version)}`);
  }

  importSnapshot(payload, config = {}) {
    return http.post(`/${route}/import`, payload, {
      headers: { "Content-Type": "application/json", ...(config.headers || {}) },
      ...config,
    });
  }

  getLatestImport(idPublic, version = 1, filters = {}) {
    const query = filters.approval_status ? `?approval_status=${encodeURIComponent(filters.approval_status)}` : '';
    return http.get(`/${route}/import/${encodeURIComponent(idPublic)}/${encodeURIComponent(version)}/latest${query}`);
  }

  approveImport(importId, data = {}) {
    return http.post(`/${route}/import/${encodeURIComponent(importId)}/approve`, data);
  }

  rejectImport(importId, data = {}) {
    return http.post(`/${route}/import/${encodeURIComponent(importId)}/reject`, data);
  }
}

export default new SubdivisionQgisService();
