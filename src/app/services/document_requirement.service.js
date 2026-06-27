import http from '../../http-common';

const ROUTE = 'document-requirements';
const READABLE_PREVIEW_STATUSES = new Set(['published', 'draft']);

function buildStatusQuery(status) {
  if (!status) return '';
  return `?status=${encodeURIComponent(status)}`;
}

function getPreviewStatus(payload = {}, options = {}) {
  const requestedStatus = options.status || payload?.configStatus || payload?.status || 'published';
  return READABLE_PREVIEW_STATUSES.has(requestedStatus) ? requestedStatus : 'published';
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

  previewRequirements(payload = {}, options = {}) {
    const status = getPreviewStatus(payload, options);
    return http.post(`/${ROUTE}/preview${buildStatusQuery(status)}`, {
      ...payload,
      configStatus: status,
    });
  }
}

export default new DocumentRequirementService();
