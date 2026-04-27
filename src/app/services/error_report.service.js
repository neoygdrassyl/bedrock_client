import http from '../../http-common';

const ROUTE = 'error-reports';

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
    });
  }

  list(params = {}) {
    return http.get(`/${ROUTE}${buildQuery(params)}`);
  }

  get(id) {
    return http.get(`/${ROUTE}/${id}`);
  }

  updateStatus(id, status) {
    return http.patch(`/${ROUTE}/${id}`, { status });
  }
}

export default new ErrorReportService();