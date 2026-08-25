import { createDovelaHttpClient } from "@/http-client-factory";

// Main API host. Every 401 here means "must re-authenticate" EXCEPT the
// login endpoint itself, which returns 401 for wrong credentials — that's a
// form-validation error, not a dead session, and must stay on the login
// page so the user sees it. Previously only `expired: true` triggered
// logout, so an invalid/malformed token (e.g. after a secret rotation) or
// the "no autenticado" defense-in-depth checks in chat/bookmark controllers
// left the app silently failing forever on every background poll instead of
// logging out. See http-client-factory.js for the shared implementation.
export default createDovelaHttpClient({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-type": 'multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbT'
  },
  attachAuth: true,
});
