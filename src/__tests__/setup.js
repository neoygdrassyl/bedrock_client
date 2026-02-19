/**
 * Vitest global setup — replaces CRA's built-in Jest setup.
 * Sets up @testing-library/jest-dom matchers and env vars for tests.
 */
import '@testing-library/jest-dom/vitest';

// styled-components v6 CJS bundle expects React in global scope
import React from 'react';
globalThis.React = React;

/**
 * Global mock: mdb-react-ui-kit
 *
 * mdb-react-ui-kit 1.0.0-beta3 uses `defaultProps` on forwardRef components.
 * React 19's JSX runtime no longer applies `defaultProps` for function/forwardRef
 * components, causing "Element type is invalid: undefined" when the `tag` prop is
 * not explicitly provided.  This global mock replaces all MDB components with
 * simple HTML-element stubs.
 * TODO: Remove when mdb-react-ui-kit is replaced (Fase 7).
 */
vi.mock('mdb-react-ui-kit');

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
