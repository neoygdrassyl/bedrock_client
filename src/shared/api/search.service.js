import http from './http-common';

// Universal search used by the command palette (GET /api/search, additive route).
// Older backends answer 404: callers must treat that as "endpoint unavailable" and
// fall back, so the HTTP client does not log the failure.
class SearchService {
  search(query, { limit = 8, signal } = {}) {
    return http.get('/search', {
      params: { q: query, limit },
      signal,
      skipErrorLog: true,
    });
  }
}

export default new SearchService();
