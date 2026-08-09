import { createDovelaHttpClient } from "@/http-client-factory";

// Third-party host (emails.dovela-services.com) — different origin from
// the main API (VITE_API_URL). The app JWT must not be attached here;
// only the shared error/401 handling applies.
export default createDovelaHttpClient({
  baseURL: import.meta.env.VITE_API_EMAIL_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  },
  attachAuth: false,
});
