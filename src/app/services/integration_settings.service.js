import http from '../../http-common';

const ROUTE = 'integration-settings';
const JSON_HEADERS = { headers: { 'Content-Type': 'application/json' } };

class IntegrationSettingsService {
  getOverview() {
    return http.get(`/${ROUTE}`);
  }

  updateCentral({ apiUrl, apiToken } = {}) {
    return http.put(`/${ROUTE}/central`, {
      ...(apiUrl === undefined ? {} : { apiUrl }),
      ...(apiToken === undefined ? {} : { apiToken }),
    }, JSON_HEADERS);
  }

  testCentral({ apiUrl, apiToken } = {}) {
    return http.post(`/${ROUTE}/central/test`, { apiUrl, apiToken }, JSON_HEADERS);
  }

  updateFrontoffice({ apiToken, generate } = {}) {
    return http.put(`/${ROUTE}/frontoffice`, generate ? { generate: true } : { apiToken }, JSON_HEADERS);
  }
}

export default new IntegrationSettingsService();
