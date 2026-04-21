import http from "../../http-common";

const ROUTE = "funmanage/dashboard";

function buildQuery(params) {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (typeof value === "boolean") query.set(key, value ? "true" : "false");
    else query.set(key, String(value));
  });
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

class FunManageDashboardService {
  getKpis(params = {}) {
    return http.get(`/${ROUTE}/kpis${buildQuery(params)}`);
  }

  getChartData(params = {}) {
    return http.get(`/${ROUTE}/chart-data${buildQuery(params)}`);
  }

  getTable(params = {}) {
    return http.get(`/${ROUTE}/table${buildQuery(params)}`);
  }

  getExpedientes(params = {}) {
    return http.get(`/${ROUTE}/expedientes${buildQuery(params)}`);
  }
}

export default new FunManageDashboardService();
