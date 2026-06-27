import http from "../../http-common";

const ROUTE = "funmanage/bookmarks";

class BookmarkService {
  list(params = {}) {
    const query = new URLSearchParams();
    if (params.scope) query.set("scope", params.scope);
    if (params.fun0Id) query.set("fun0Id", params.fun0Id);
    const qs = query.toString();
    return http.get(`/${ROUTE}${qs ? `?${qs}` : ""}`);
  }

  create(fun0Id, scope) {
    return http.post(`/${ROUTE}`, { fun0Id, scope });
  }

  remove(fun0Id, scope) {
    return http.delete(`/${ROUTE}/${fun0Id}/${scope}`);
  }
}

export default new BookmarkService();
