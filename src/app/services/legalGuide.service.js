import http from "../../http-common";

const ROUTE = "legal-guide";

class LegalGuideService {
  getByPhase(fase) {
    return http.get(`/${ROUTE}/${encodeURIComponent(fase)}`);
  }
}

export default new LegalGuideService();
