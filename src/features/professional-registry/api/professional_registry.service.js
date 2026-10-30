import http from '../../../shared/api/http-common';

const ROUTE = 'professional-registry';
// Search terms and bodies carry cédulas and emails: keep them out of the HTTP error telemetry.
const QUIET = { skipDovelaErrorCapture: true };
const JSON_REQUEST = { ...QUIET, headers: { 'Content-Type': 'application/json' } };

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== false) query.set(key, value);
  });
  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

class ProfessionalRegistryService {
  catalog() { return http.get(`/${ROUTE}/catalog`, QUIET); }
  list(params) { return http.get(`/${ROUTE}${buildQuery(params)}`, QUIET); }
  get(id) { return http.get(`/${ROUTE}/${id}`, QUIET); }
  create(body) { return http.post(`/${ROUTE}`, body, JSON_REQUEST); }
  update(id, body) { return http.put(`/${ROUTE}/${id}`, body, JSON_REQUEST); }
  setCanonicalName(id, body) { return http.put(`/${ROUTE}/${id}/canonical-name`, body, JSON_REQUEST); }
  setSpecificExperience(id, roleCode, body) { return http.put(`/${ROUTE}/${id}/roles/${encodeURIComponent(roleCode)}/specific-experience`, body, JSON_REQUEST); }
  remove(id, body) { return http.delete(`/${ROUTE}/${id}`, { ...JSON_REQUEST, data: body }); }
  restore(id, body) { return http.post(`/${ROUTE}/${id}/restore`, body, JSON_REQUEST); }
  merge(id, body) { return http.post(`/${ROUTE}/${id}/merge`, body, JSON_REQUEST); }
  relink(id, participationId, body) { return http.post(`/${ROUTE}/${id}/participations/${participationId}/relink`, body, JSON_REQUEST); }
  reviewSummary() { return http.get(`/${ROUTE}/review/summary`, QUIET); }
  review(params) { return http.get(`/${ROUTE}/review${buildQuery(params)}`, QUIET); }
  resolve(body) { return http.post(`/${ROUTE}/review/resolve`, body, JSON_REQUEST); }
  consolidate(body) { return http.post(`/${ROUTE}/consolidate`, body, JSON_REQUEST); }
}

export default new ProfessionalRegistryService();
