import http from '../../http-common';

const ROUTE = 'legal-config';
class LegalConfigService {
  workspace() { return http.get(`/${ROUTE}/workspace`); }
  documentReviews() { return http.get(`/${ROUTE}/workspace/document-reviews`); }
  updateDocumentReviews(id, payload) { return http.put(`/${ROUTE}/workspace/document-reviews/${encodeURIComponent(id)}`, payload, { headers: { 'Content-Type': 'application/json' } }); }
  create(catalogue, payload) { return http.post(`/${ROUTE}/workspace/${catalogue}`, payload); }
  update(catalogue, id, payload) { return http.put(`/${ROUTE}/workspace/${catalogue}/${encodeURIComponent(id)}`, payload); }
  saveAssociations(id, payload) { return http.put(`/${ROUTE}/workspace/actuations/${encodeURIComponent(id)}/associations`, payload); }
  effectiveDocuments(id) { return http.get(`/${ROUTE}/workspace/actuations/${encodeURIComponent(id)}/effective-documents`); }
}
export default new LegalConfigService();
