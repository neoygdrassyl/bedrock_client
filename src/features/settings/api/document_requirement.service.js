import http from '../../../shared/api/http-common';

const ROUTE = 'document-requirements';
const JSON_HEADERS = { headers: { 'Content-Type': 'application/json' } };

class DocumentRequirementService {
  getCentralReleases() {
    return http.get(`/${ROUTE}/central/releases`);
  }

  setCurrentCentralRelease(releaseId) {
    return http.put(`/${ROUTE}/central/releases/${encodeURIComponent(releaseId)}/current`, {}, JSON_HEADERS);
  }

  syncCentralRelease({ sourceUrl, makeCurrent } = {}) {
    return http.post(`/${ROUTE}/central/releases/sync`, {
      ...(sourceUrl === undefined ? {} : { sourceUrl }),
      ...(makeCurrent === undefined ? {} : { makeCurrent }),
    }, JSON_HEADERS);
  }
}

export default new DocumentRequirementService();
