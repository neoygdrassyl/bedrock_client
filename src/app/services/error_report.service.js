import http from '../../http-common';

const ROUTE = 'error-reports';
const SKIP_ERROR_CAPTURE = { skipDovelaErrorCapture: true };
const JSON_REQUEST = {
  ...SKIP_ERROR_CAPTURE,
  headers: { 'Content-Type': 'application/json' },
};

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  });
  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

class ErrorReportService {
  create(report) {
    return http.post(`/${ROUTE}`, {
      source: report.source,
      severity: report.userInput?.severity || report.severity,
      module: report.module,
      path: report.location?.pathname || report.location?.href,
      message: report.lastError?.error?.message || report.userInput?.details || report.userInput?.attemptedAction,
      expediente: report.userInput?.expediente || report.expediente?.radicado,
      userName: report.user?.name || report.user?.email,
      userRole: report.user?.role,
      payloadJson: JSON.stringify(report),
    }, JSON_REQUEST);
  }

  list(params = {}) {
    return http.get(`/${ROUTE}${buildQuery(params)}`, SKIP_ERROR_CAPTURE);
  }

  get(id) {
    return http.get(`/${ROUTE}/${id}`, SKIP_ERROR_CAPTURE);
  }

  updateReport(id, data = {}) {
    return http.patch(`/${ROUTE}/${id}`, data, JSON_REQUEST);
  }

  updateStatus(id, status) {
    return this.updateReport(id, { status });
  }
}

export default new ErrorReportService();