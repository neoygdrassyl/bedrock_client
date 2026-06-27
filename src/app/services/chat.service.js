import http from "../../http-common";

const ROUTE = "internal-chat";

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value == null || value === "") return;
    query.set(key, String(value));
  });
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

class ChatService {
  users() {
    return http.get(`/${ROUTE}/users`);
  }

  inbox(config = {}) {
    return http.get(`/${ROUTE}/inbox`, config);
  }

  messages(withUserId, params = {}) {
    return http.get(`/${ROUTE}/messages${buildQuery({ ...params, withUserId })}`);
  }

  send(receiverId, body) {
    return http.post(`/${ROUTE}/messages`, { receiverId, body });
  }

  markThreadRead(withUserId) {
    return http.put(`/${ROUTE}/threads/${withUserId}/read`);
  }
}

export default new ChatService();
