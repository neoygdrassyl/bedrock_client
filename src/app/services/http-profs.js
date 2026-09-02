import { createDovelaHttpClient } from "@/http-client-factory";

// Third-party host (server.prof.curaduria1bucaramanga.com) — different
// origin from the main API (VITE_API_URL). The app JWT must not be
// attached here; only the shared error/401 handling applies.
export default createDovelaHttpClient({
  baseURL: import.meta.env.VITE_API_PROF_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  },
  attachAuth: false,
});
