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

  previewRequirements(payload = {}, options = {}) {
    const status = getPreviewStatus(payload, options);
    const requestConfig = options.signal ? { signal: options.signal } : undefined;
    return http.post(`/${ROUTE}/preview${buildStatusQuery(status)}`, {
      ...payload,
      configStatus: status,
    }, requestConfig);
  }

  getCentralConfigurations() {
    return http.get(`/${ROUTE}/central/configurations`);
  }

  setCurrentCentralConfiguration(configurationId) {
    return http.put(`/${ROUTE}/central/configurations/${encodeURIComponent(configurationId)}/current`, {}, { headers: { "Content-Type": "application/json" } });
  }

  getCentralProfiles() {
    return http.get(`/${ROUTE}/central/profiles`);
  }

  getCentralProfile(profileId) {
    return http.get(`/${ROUTE}/central/profiles/${encodeURIComponent(profileId)}`);
  }

  syncCentralProfile({ name, sourceUrl, setDefault = false, makeCurrent } = {}) {
    return http.post(`/${ROUTE}/central/profiles/sync`, {
      name,
      sourceUrl,
      setDefault,
      ...(makeCurrent === undefined ? {} : { makeCurrent }),
    }, { headers: { 'Content-Type': 'application/json' } });
  }

  setDefaultCentralProfile(profileId) {
    return http.put(`/${ROUTE}/central/profiles/${encodeURIComponent(profileId)}/default`);
  }

  getProjectCentralConfiguration(idPublic) {
    return http.get(`/${ROUTE}/central/projects/${encodeURIComponent(idPublic)}`);
  }

  getCentralProject(idPublic) {
    return this.getProjectCentralConfiguration(idPublic);
  }

  updateProjectCentralConfiguration(idPublic, { profileId, typologySelections = {} }) {
    return http.put(`/${ROUTE}/central/projects/${encodeURIComponent(idPublic)}`, {
      profileId,
      typologySelections,
    });
  }

  saveCentralProjectLegalFormReview(idPublic, review) {
    return http.put(`/${ROUTE}/central/projects/${encodeURIComponent(idPublic)}/legal-form/reviews`, review);
  }

  updateCentralProjectLegalForm(idPublic, selection) {
    const vrIdPublic = typeof selection === 'object' && selection !== null
      ? selection.vrIdPublic
      : selection;
    return http.put(`/${ROUTE}/central/projects/${encodeURIComponent(idPublic)}/legal-form`, {
      vrIdPublic,
    });
  }
}

export default new DocumentRequirementService();
