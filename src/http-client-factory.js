import axios from "axios";
import { captureDovelaHttpError } from "@/app/utils/errorReporting";

// Binary requests (blob/arraybuffer) receive their error body undecoded; turn
// a JSON payload back into an object so callers can read the server message.
async function parseBinaryJson(data) {
  try {
    let text = '';
    const isArrayBuffer = data instanceof ArrayBuffer
      || Object.prototype.toString.call(data) === '[object ArrayBuffer]';
    if (isArrayBuffer) {
      text = new TextDecoder().decode(data);
    } else if (data instanceof Blob) {
      text = typeof data.text === 'function'
        ? await data.text()
        : await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ''));
            reader.onerror = () => reject(reader.error);
            reader.readAsText(data);
          });
    }
    return text ? JSON.parse(text) : data;
  } catch {
    return data;
  }
}

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
    async (error) => {
      const isCanceledRequest = axios.isCancel(error) || error?.code === 'ERR_CANCELED';
      if (!isCanceledRequest && !error?.config?.skipDovelaErrorCapture) {
        captureDovelaHttpError(error);
      }
      if (error?.response?.status === 401) {
        error.response.data = await parseBinaryJson(error.response.data);
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
