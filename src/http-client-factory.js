import axios from "axios";
import { captureDovelaHttpError } from "@/app/utils/errorReporting";

// Shared factory for Dovela axios clients. Every client reports errors to
// telemetry. `attachAuth` marks a client as belonging to the main API's trust
// domain: it gates both sending the app JWT (leaking it to a third-party host
// would expose the session) and reacting to a 401 by tearing the session down
// (a third-party host's 401 says nothing about this app's session).
export function createDovelaHttpClient({ baseURL, headers, attachAuth = true } = {}) {
  const http = axios.create({ baseURL, headers });

  if (attachAuth) {
    // Request interceptor: attach JWT token to every request
    http.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("dovela_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  // Response interceptor: handle 401 (session dead). A 401 from the main API
  // means "must re-authenticate" EXCEPT the login endpoint itself, which
  // returns 401 for wrong credentials — that's a form-validation error, not a
  // dead session, and must stay on the login page so the user sees it.
  http.interceptors.response.use(
    (response) => response,
    (error) => {
      if (!error?.config?.skipDovelaErrorCapture) {
        captureDovelaHttpError(error);
      }
      const isLoginRequest = (error?.config?.url || '').replace(/^\/+/, '') === 'login';
      if (attachAuth && error.response && error.response.status === 401 && !isLoginRequest) {
        localStorage.removeItem("dovela_token");
        localStorage.removeItem("dovela_user");
        window.user = null;
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );

  return http;
}
