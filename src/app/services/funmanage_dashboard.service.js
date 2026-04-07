import http from "../../http-common";

const ROUTE = "funmanage/dashboard";

/**
 * Service para consumir el endpoint BFF del dashboard de gestión de licencias.
 *
 * Endpoint consumido:
 *   GET /api/funmanage/dashboard/expedientes?page=&limit=&fase=&status=&responsable=&search=&sort=&order=
 *
 * Retorna: { kpis, data, total, page, limit }
 */
class FunManageDashboardService {
  /**
   * Obtiene expedientes con KPIs, filtros y paginación.
   *
   * @param {Object} params
   * @param {number} [params.page=1]
   * @param {number} [params.limit=50]
   * @param {string} [params.fase]         - "RAD"|"EST"|"NOT_OBS"|"CORR"|"VIA"|"NOT_VIA"|"PAG"|"RES"|"NOT_RES"|"EJEC"|"ENT"
   * @param {string} [params.status]       - "OPTIMO"|"PROMEDIO"|"EN_RIESGO"|"VENCIDO"
   * @param {string} [params.responsable]  - "curaduria"|"solicitante"
   * @param {string} [params.search]       - Búsqueda por radicado
   * @param {string} [params.sort]         - Campo de ordenamiento
   * @param {string} [params.order]        - "ASC"|"DESC"
   * @returns {Promise<{ data: { kpis, data: Array, total, page, limit } }>}
   */
  getExpedientes(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page);
    if (params.limit) query.set("limit", params.limit);
    if (params.fase) query.set("fase", params.fase);
    if (params.status) query.set("status", params.status);
    if (params.responsable) query.set("responsable", params.responsable);
    if (params.search) query.set("search", params.search);
    if (params.sort) query.set("sort", params.sort);
    if (params.order) query.set("order", params.order);
    const qs = query.toString();
    return http.get(`/${ROUTE}/expedientes${qs ? `?${qs}` : ""}`);
  }
}

export default new FunManageDashboardService();
