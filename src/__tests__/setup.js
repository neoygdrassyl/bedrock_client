/**
 * Vitest global setup — replaces CRA's built-in Jest setup.
 * Sets up @testing-library/jest-dom matchers and env vars for tests.
 */
import '@testing-library/jest-dom/vitest';

// Set default env vars for tests (equivalent to old process.env.REACT_APP_*)
// These can be overridden in individual test files via import.meta.env
if (!import.meta.env.VITE_API_URL) {
  // @ts-ignore — vitest allows writing to import.meta.env
  import.meta.env.VITE_API_URL = 'http://localhost/dovela-backend/public';
}
if (!import.meta.env.VITE_GLOBAL_ID) {
  // @ts-ignore
  import.meta.env.VITE_GLOBAL_ID = '1';
}
if (!import.meta.env.VITE_GOOGLE_CAPTCHA_HTML) {
  // @ts-ignore
  import.meta.env.VITE_GOOGLE_CAPTCHA_HTML = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';
}
