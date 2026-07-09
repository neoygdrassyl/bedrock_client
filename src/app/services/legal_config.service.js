import http from '../../http-common';

const ROUTE = 'legal-config';

class LegalConfigService {
  listActuationTypes(params = {}) {
    return http.get(`/${ROUTE}/actuation-types`, { params });
  }

  listDocumentCodes(params = {}) {
    return http.get(`/${ROUTE}/document-codes`, { params });
  }

  createDocumentCode(payload = {}) {
    return http.post(`/${ROUTE}/document-codes`, payload);
  }

  createDocumentDefinition(payload = {}) {
    return http.post(`/${ROUTE}/documents`, payload);
  }

  updateDocumentDefinition(id, payload = {}) {
    return http.put(`/${ROUTE}/documents/${encodeURIComponent(id)}`, payload);
  }

  listConfigurationLabels(params = {}) {
    return http.get(`/${ROUTE}/labels`, { params });
  }

  listDocumentDefinitions(params = {}) {
    return http.get(`/${ROUTE}/documents`, { params });
  }

  listLegalTexts(params = {}) {
    return http.get(`/${ROUTE}/legal-texts`, { params });
  }

  listReadContracts(params = {}) {
    return http.get(`/${ROUTE}/read-contracts`, { params });
  }

  listAssertions(params = {}) {
    return http.get(`/${ROUTE}/assertions`, { params });
  }

  listRules(params = {}) {
    return http.get(`/${ROUTE}/rules`, { params });
  }

  createActuationType(payload = {}) {
    return http.post(`/${ROUTE}/actuation-types`, payload);
  }

  updateActuationType(id, payload = {}) {
    return http.put(`/${ROUTE}/actuation-types/${encodeURIComponent(id)}`, payload);
  }

  createActuationDocumentRule(payload = {}) {
    return http.post(`/${ROUTE}/rules/actuation-documents`, payload);
  }

  createActuationTextRule(payload = {}) {
    return http.post(`/${ROUTE}/rules/actuation-texts`, payload);
  }

  createActuationDocumentsByLabelRule(payload = {}) {
    return http.post(`/${ROUTE}/rules/actuation-documents-by-labels`, payload);
  }

  createActuationTextsByLabelRule(payload = {}) {
    return http.post(`/${ROUTE}/rules/actuation-texts-by-labels`, payload);
  }

  deleteRule(type, id) {
    return http.delete(`/${ROUTE}/rules/${encodeURIComponent(type)}/${encodeURIComponent(id)}`);
  }

  createCaseActuationUnit(caseCode, payload = {}) {
    return http.post(`/${ROUTE}/cases/${encodeURIComponent(caseCode)}/actuations`, payload);
  }

  assignPrimaryActuationToCase(caseCode, actuationTypeId) {
    return this.createCaseActuationUnit(caseCode, {
      actuation_type_id: actuationTypeId,
      is_primary: true,
    });
  }

  generateCaseConfiguration(caseCode, payload = { run_type: 'full' }) {
    return http.post(`/${ROUTE}/cases/${encodeURIComponent(caseCode)}/generate`, payload);
  }

  generateFullConfiguration(caseCode) {
    return this.generateCaseConfiguration(caseCode, { run_type: 'full' });
  }

  listCaseRuns(caseCode) {
    return http.get(`/${ROUTE}/cases/${encodeURIComponent(caseCode)}/runs`);
  }
}

export default new LegalConfigService();
