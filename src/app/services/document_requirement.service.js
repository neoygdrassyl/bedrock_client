import http from '../../http-common';

const ROUTE = 'document-requirements';

class DocumentRequirementService {
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
}

export default new DocumentRequirementService();
