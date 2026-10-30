import http from './http-common';

const ROUTE = 'branding';
const JSON_HEADERS = { 'Content-Type': 'application/json' };

// Curaduría branding (logo shown in the sidebar). Lives in shared/api because the
// shell (sidebar, brand mark) reads it and the settings feature writes it.
// Callers handle failures themselves (older backends answer 404), so errors are not
// logged by the HTTP client.
class BrandingService {
  getBranding() {
    return http.get(`/${ROUTE}`, { skipErrorLog: true });
  }

  updateLogo(logo) {
    return http.put(`/${ROUTE}/logo`, { logo: logo || null }, { headers: JSON_HEADERS, skipErrorLog: true });
  }
}

export default new BrandingService();
