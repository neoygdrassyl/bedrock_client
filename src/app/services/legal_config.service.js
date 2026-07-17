import http from '../../http-common';

const ROUTE = 'legal-config';
const JSON_REQUEST = { headers: { 'Content-Type': 'application/json' } };

class LegalConfigService {
  workspace() { return http.get(`/${ROUTE}/workspace`); }
  documentReviews() { return http.get(`/${ROUTE}/workspace/document-reviews`); }
  updateDocumentReviews(id, payload) { return http.put(`/${ROUTE}/workspace/document-reviews/${encodeURIComponent(id)}`, payload, { headers: { 'Content-Type': 'application/json' }, skipDovelaErrorCapture: true }); }
  create(catalogue, payload) { return http.post(`/${ROUTE}/workspace/${catalogue}`, payload, JSON_REQUEST); }
  update(catalogue, id, payload) { return http.put(`/${ROUTE}/workspace/${catalogue}/${encodeURIComponent(id)}`, payload, JSON_REQUEST); }
  saveAssociations(id, payload) { return http.put(`/${ROUTE}/workspace/actuations/${encodeURIComponent(id)}/associations`, payload, JSON_REQUEST); }
  effectiveDocuments(id) { return http.get(`/${ROUTE}/workspace/actuations/${encodeURIComponent(id)}/effective-documents`); }
}
export default new LegalConfigService();
