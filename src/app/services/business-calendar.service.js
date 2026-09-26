import http from '../../http-common';

const REQUEST_TIMEOUT_MS = 10000;
const bootstrapRequests = new Map();

class BusinessCalendarService {
  getBootstrap(startYear, endYear) {
    const key = `${startYear}:${endYear}`;
    if (!bootstrapRequests.has(key)) {
      const request = this.fetchBootstrap(startYear, endYear);
      bootstrapRequests.set(key, request);
      request.then(
        () => { if (bootstrapRequests.get(key) === request) bootstrapRequests.delete(key); },
        () => { if (bootstrapRequests.get(key) === request) bootstrapRequests.delete(key); },
      );
    }
    return bootstrapRequests.get(key);
  }

  async fetchBootstrap(startYear, endYear) {
    try {
      return await http.get(
        `/business-calendar/bootstrap?startYear=${encodeURIComponent(startYear)}&endYear=${encodeURIComponent(endYear)}`,
        { timeout: REQUEST_TIMEOUT_MS, skipDovelaErrorCapture: true },
      );
    } catch (error) {
      if (error?.response?.status !== 404) throw error;
      return this.getLegacyBootstrap(startYear, endYear);
    }
  }

  async getLegacyBootstrap(startYear, endYear) {
    const years = Array.from({ length: endYear - startYear + 1 }, (_, index) => startYear + index);
    const silentConfig = { skipDovelaErrorCapture: true };
    const [officialResults, customResponses] = await Promise.all([
      Promise.allSettled(years.map(year => this.getYear(year, silentConfig))),
      Promise.all(years.map(year => this.getCustomYear(year, silentConfig))),
    ]);
    const unexpectedFailure = officialResults.find(result => (
      result.status === 'rejected' && result.reason?.response?.status !== 404
    ));
    if (unexpectedFailure) throw unexpectedFailure.reason;
    return {
      data: {
        startYear,
        endYear,
        years: officialResults.flatMap((result, index) => result.status === 'fulfilled'
          ? [{ year: years[index], ...result.value.data }]
          : []),
        customDays: customResponses.flatMap(response => response.data.customDays),
      },
    };
  }

  clearBootstrapCache() {
    bootstrapRequests.clear();
  }

  getYear(year, config = {}) {
    return http.get(`/business-calendar?year=${encodeURIComponent(year)}`, { timeout: REQUEST_TIMEOUT_MS, ...config });
  }

  async getCustomYear(year, config = {}) {
    try {
      return await http.get(`/business-calendar/custom-days?year=${encodeURIComponent(year)}`, { timeout: REQUEST_TIMEOUT_MS, ...config });
    } catch (error) {
      if (error?.response?.status === 404) return { data: { year, customDays: [] } };
      throw error;
    }
  }

  createCustomDay(payload) {
    return http.post('/business-calendar/custom-days', payload, {
      timeout: REQUEST_TIMEOUT_MS,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  deleteCustomDay(date) {
    return http.delete(`/business-calendar/custom-days/${encodeURIComponent(date)}`, { timeout: REQUEST_TIMEOUT_MS });
  }
}

export default new BusinessCalendarService();
