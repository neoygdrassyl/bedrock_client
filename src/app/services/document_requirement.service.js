import http from '../../http-common';

const ROUTE = 'document-requirements';

function buildStatusQuery(status) {
  if (!status) return '';
  return `?status=${encodeURIComponent(status)}`;
}

class DocumentRequirementService {
  getConfig(status = 'published') {
    return http.get(`/${ROUTE}/config${buildStatusQuery(status)}`);
  }

  getPublishedConfig() {
    return this.getConfig('published');
  }

  getDraftConfig() {
    return this.getConfig('draft');
  }

  saveDraft(configJson) {
    return http.put(`/${ROUTE}/config/draft`, { configJson });
  }

  publishConfig() {
    return http.post(`/${ROUTE}/config/publish`);
  }
}

export default new DocumentRequirementService();
