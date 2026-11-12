import { createDovelaHttpClient } from "@/shared/api/http-client-factory";
import { professionalsApiUrl } from "./professionalsRegistry";

// Third-party host (professionals registry) — different origin from the main
// API (VITE_API_URL). The app JWT must not be attached here; only the shared
// error/401 handling applies. The base URL is empty (registry disabled) unless
// configured: see professionalsRegistry.js.
export default createDovelaHttpClient({
  baseURL: professionalsApiUrl() || undefined,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  },
  attachAuth: false,
});
