import http from "../../http-common";

const ROUTE = "funmanage/dashboard";

/**
 * Service para consumir los endpoints BFF del dashboard de gestión.
 *
 * Endpoints consumidos:
 *   GET /api/funmanage/dashboard/kpis
 *   GET /api/funmanage/dashboard/chart-data
 *   GET /api/funmanage/dashboard/grid?page=&limit=&status=&phase=&search=&sort=&order=
 */
class FunManageDashboardService {
  /**
   * KPIs agregados: { total, en_riesgo, listos, correcciones }
   */
  getKPIs() {
    return http.get(`/${ROUTE}/kpis`);
  }

  /**
   * Datos para gráfico scatter:
   * Array<{ x, y, status, radicado, fase, maxDays, tramite, categoria }>
   * @param {{ status?: string, phase?: string }} [params]
   */
  getChartData(params = {}) {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.phase)  query.set("phase",  params.phase);
    const qs = query.toString();
    return http.get(`/${ROUTE}/chart-data${qs ? `?${qs}` : ''}`);
  }

  /**
   * Grilla paginada server-side.
   * @param {Object} params
   * @param {number} [params.page=1]
   * @param {number} [params.limit=20]
   * @param {string} [params.status]  - "OPTIMAL" | "AVERAGE" | "LIMIT"
   * @param {string} [params.phase]   - Nombre de fase (e.g. "Revisión Legal")
   * @param {string} [params.search]  - Filtro por número de radicado
   * @param {string} [params.sort]    - Campo de ordenamiento
   * @param {string} [params.order]   - "ASC" | "DESC"
   * @returns {{ data: Array, total: number, page: number, limit: number }}
   */
  getGrid(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page);
    if (params.limit) query.set("limit", params.limit);
    if (params.status) query.set("status", params.status);
    if (params.phase) query.set("phase", params.phase);
    if (params.search) query.set("search", params.search);
    if (params.sort) query.set("sort", params.sort);
    if (params.order) query.set("order", params.order);
    return http.get(`/${ROUTE}/grid?${query.toString()}`);
  }
}

export default new FunManageDashboardService();
