import axios from "axios";
import { logHttpError, newRequestId, REQUEST_ID_HEADER } from "@/shared/observability/logger";

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

function readRequestIdHeader(headers) {
  if (!headers) return null;
  if (typeof headers.get === "function") return headers.get(REQUEST_ID_HEADER) || null;
  return headers[REQUEST_ID_HEADER] || headers["X-Dovela-Request-Id"] || null;
}

// Shared factory for Dovela axios clients. Every client logs failed requests
// (`http_error`, see shared/observability/logger.js) unless the request sets
// `skipErrorLog: true` because the caller handles or logs the failure itself.
// `attachAuth` marks a client as belonging to the main API's trust domain: it
// gates sending the app JWT (leaking it to a third-party host would expose the
// session), the `x-dovela-request-id` correlation header (a third-party host's
// CORS policy may reject unknown headers) and reacting to a 401 by tearing the
// session down (a third-party host's 401 says nothing about this app's session).
export function createDovelaHttpClient({ baseURL, headers, attachAuth = true } = {}) {
  const http = axios.create({ baseURL, headers });

  if (attachAuth) {
    // Request interceptor: attach the JWT and a request id the backend echoes
    // and writes to its logs, so a failure can be traced end to end.
    http.interceptors.request.use(
      (config) => {
        config.headers = config.headers || {};
        const token = localStorage.getItem("dovela_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        const requestId = readRequestIdHeader(config.headers) || newRequestId();
        config.headers[REQUEST_ID_HEADER] = requestId;
        config.dovelaRequestId = requestId;
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
      const isCanceledRequest = axios.isCancel?.(error) || error?.code === 'ERR_CANCELED';
      if (!isCanceledRequest && !error?.config?.skipErrorLog) {
        logHttpError(error);
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
