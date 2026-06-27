import axios from "axios";
import { captureDovelaHttpError } from "@/app/utils/errorReporting";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  }
});

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

// Response interceptor: handle 401 expired token
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error?.config?.skipDovelaErrorCapture) {
      captureDovelaHttpError(error);
    }
    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data &&
      error.response.data.expired === true
    ) {
      localStorage.removeItem("dovela_token");
      localStorage.removeItem("dovela_user");
      window.user = null;
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default http;
