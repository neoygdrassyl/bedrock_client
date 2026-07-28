import axios from "axios";
import { captureDovelaHttpError } from "@/app/utils/errorReporting";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});

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

// Response interceptor: handle 401 (session dead). Every 401 in this API
// means "must re-authenticate" EXCEPT the login endpoint itself, which
// returns 401 for wrong credentials — that's a form-validation error, not a
// dead session, and must stay on the login page so the user sees it.
// Previously only `expired: true` triggered logout, so an invalid/malformed
// token (e.g. after a secret rotation) or the "no autenticado" defense-in-depth
// checks in chat/bookmark controllers left the app silently failing forever
// on every background poll instead of logging out.
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error?.config?.skipDovelaErrorCapture) {
      captureDovelaHttpError(error);
    }
    if (error.response?.status === 401) {
      error.response.data = await parseBinaryJson(error.response.data);
    }
    const isLoginRequest = (error?.config?.url || '').replace(/^\/+/, '') === 'login';
    if (error.response && error.response.status === 401 && !isLoginRequest) {
      localStorage.removeItem("dovela_token");
      localStorage.removeItem("dovela_user");
      window.user = null;
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default http;
