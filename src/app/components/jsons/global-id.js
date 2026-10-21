const DEFAULT_GLOBAL_ID = 'cb1';
const VALID_GLOBAL_IDS = new Set(['cb1', 'cp1', 'fl2', 'lbj']);

// Single source of truth for the tenant id. Vite replaces
// `import.meta.env.VITE_GLOBAL_ID` statically at build time, so mutating
// `import.meta.env` at runtime cannot provide a fallback: every module must
// read the tenant through this constant instead.
export const GLOBAL_ID = VALID_GLOBAL_IDS.has(import.meta.env.VITE_GLOBAL_ID)
  ? import.meta.env.VITE_GLOBAL_ID
  : DEFAULT_GLOBAL_ID;

export { DEFAULT_GLOBAL_ID };
