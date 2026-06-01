import http from '@/http-common';

class ChecklistService {
  getIntelligentChecklist(funIdPublic, version) {
    const query = version ? `?version=${encodeURIComponent(version)}` : '';
    return http.get(`/fun/checklist/intelligent/${encodeURIComponent(funIdPublic)}${query}`);
  }

  updateRequirementEvaluation(funIdPublic, requirementCode, payload) {
    return http.put(`/fun/checklist/evaluation/${encodeURIComponent(funIdPublic)}/${encodeURIComponent(requirementCode)}`, payload);
  }

  linkDocumentToRequirement(payload) {
    return http.post('/fun/checklist/link-document', payload);
  }

  unlinkDocumentFromRequirement(linkId, payload = {}) {
    return http.put(`/fun/checklist/unlink-document/${encodeURIComponent(linkId)}`, payload);
  }

  refreshChecklistCache(funIdPublic, payload = {}) {
    return http.post(`/fun/checklist/refresh-cache/${encodeURIComponent(funIdPublic)}`, payload);
  }
}

export default new ChecklistService();
