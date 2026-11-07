import http from '../../../shared/api/http-common';
import { downloadProtectedFile } from '../../../shared/utils/pdfDownload';

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
  // FUN 5.2 search box. The caller handles failures (an older backend answers 404) and may cancel with `signal`.
  lookup(q, { limit, signal } = {}) {
    return http.get(`/${ROUTE}/lookup${buildQuery({ q, limit })}`, { ...QUIET, skipErrorLog: true, signal });
  }
  // FUN 5.2 role picker. The caller falls back to the single-role form on any failure and may cancel with `signal`.
  roleEligibility(id, { signal } = {}) {
    return http.get(`/${ROUTE}/${id}/role-eligibility`, { ...QUIET, skipErrorLog: true, signal });
  }
  create(body) { return http.post(`/${ROUTE}`, body, JSON_REQUEST); }
  update(id, body) { return http.put(`/${ROUTE}/${id}`, body, JSON_REQUEST); }
  setCanonicalName(id, body) { return http.put(`/${ROUTE}/${id}/canonical-name`, body, JSON_REQUEST); }
  remove(id, body) { return http.delete(`/${ROUTE}/${id}`, { ...JSON_REQUEST, data: body }); }
  restore(id, body) { return http.post(`/${ROUTE}/${id}/restore`, body, JSON_REQUEST); }
  merge(id, body) { return http.post(`/${ROUTE}/${id}/merge`, body, JSON_REQUEST); }
  relink(id, participationId, body) { return http.post(`/${ROUTE}/${id}/participations/${participationId}/relink`, body, JSON_REQUEST); }
  // Certified work experiences ("Experiencia" tab). The create form is FormData (fields + optional `file`): the browser
  // sets the multipart boundary.
  listExperienceCertificates(id) { return http.get(`/${ROUTE}/${id}/experience-certificates`, QUIET); }
  createExperienceCertificate(id, formData) { return http.post(`/${ROUTE}/${id}/experience-certificates`, formData, QUIET); }
  deleteExperienceCertificate(id, certificateId, body) {
    return http.delete(`/${ROUTE}/${id}/experience-certificates/${certificateId}`, { ...JSON_REQUEST, data: body });
  }
  experienceCertificateFilePath(id, certificateId) { return `/${ROUTE}/${id}/experience-certificates/${certificateId}/file`; }
  // Downloads the support with the session token (the same helper as the other protected files of the app).
  downloadExperienceCertificateFile(id, certificateId, filename) {
    return downloadProtectedFile(this.experienceCertificateFilePath(id, certificateId), filename || 'soporte', QUIET);
  }
  // Registration validity certificates ("Cert. Vigencia" tab). The create form is FormData (code, issueDate,
  // expectedVersion and the required PDF `file`).
  listValidityCertificates(id) { return http.get(`/${ROUTE}/${id}/validity-certificates`, QUIET); }
  createValidityCertificate(id, formData) { return http.post(`/${ROUTE}/${id}/validity-certificates`, formData, QUIET); }
  deleteValidityCertificate(id, certificateId, body) {
    return http.delete(`/${ROUTE}/${id}/validity-certificates/${certificateId}`, { ...JSON_REQUEST, data: body });
  }
  validityCertificateFilePath(id, certificateId) { return `/${ROUTE}/${id}/validity-certificates/${certificateId}/file`; }
  downloadValidityCertificateFile(id, certificateId, filename) {
    return downloadProtectedFile(this.validityCertificateFilePath(id, certificateId), filename || 'certificado-vigencia.pdf', QUIET);
  }
  reviewSummary() { return http.get(`/${ROUTE}/review/summary`, QUIET); }
  review(params) { return http.get(`/${ROUTE}/review${buildQuery(params)}`, QUIET); }
  resolve(body) { return http.post(`/${ROUTE}/review/resolve`, body, JSON_REQUEST); }
  consolidate(body) { return http.post(`/${ROUTE}/consolidate`, body, JSON_REQUEST); }
}

export default new ProfessionalRegistryService();
