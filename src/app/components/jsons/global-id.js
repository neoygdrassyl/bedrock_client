const DEFAULT_GLOBAL_ID = 'cb1';
const VALID_GLOBAL_IDS = new Set(['cb1', 'cp1', 'fl2', 'lbj1']);

export const GLOBAL_ID = VALID_GLOBAL_IDS.has(import.meta.env.VITE_GLOBAL_ID)
  ? import.meta.env.VITE_GLOBAL_ID
  : DEFAULT_GLOBAL_ID;

if (import.meta.env.VITE_GLOBAL_ID !== GLOBAL_ID) {
  import.meta.env.VITE_GLOBAL_ID = GLOBAL_ID;
}

export { DEFAULT_GLOBAL_ID };
