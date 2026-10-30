import { pathToFileURL } from 'node:url';

const DEFAULT_GATE_URL = 'http://127.0.0.1:3001';
const READY_PATH = '/health/ready';
const DEFAULT_URL = new URL(READY_PATH, DEFAULT_GATE_URL).href;

// Derive the readiness URL from BACKOFFICE_GATE_URL, the same backend origin
// the Vite dev proxy targets. Env files are read with Vite's own loadEnv so
// the precedence matches `vite --mode development`; shell variables win.
export function resolveReadyUrl(env = {}) {
  try {
    const gate = new URL(env.BACKOFFICE_GATE_URL);
    if (gate.protocol === 'http:' || gate.protocol === 'https:') {
      return new URL(READY_PATH, gate.origin).href;
    }
  } catch {
    // Missing or invalid value: fall back to the local backend default.
  }
  return DEFAULT_URL;
}

export async function waitForBackend({
  url = DEFAULT_URL,
  fetchReady = targetUrl => fetch(targetUrl),
  sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)),
  timeoutMs = 120000,
  retryMs = 500,
  now = Date.now,
} = {}) {
  const startedAt = now();
  let attempts = 0;

  while (now() - startedAt < timeoutMs) {
    attempts += 1;
    try {
      const response = await fetchReady(url);
      if (response.ok) return { attempts };
      if (response.status === 404) {
        const fallbackUrl = new URL('/', url).href;
        if (fallbackUrl !== url) {
          const fallbackResponse = await fetchReady(fallbackUrl);
          if (fallbackResponse.ok) return { attempts };
        }
      }
    } catch {
      // Connection failures are expected while the backend container starts.
    }
    await sleep(retryMs);
  }

  throw new Error(`Backend readiness timed out after ${timeoutMs}ms (${url})`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  // Loaded only when run as a script: importing Vite (and esbuild) at module
  // level breaks the unit tests, which run under jsdom.
  const { loadEnv } = await import('vite');
  const env = loadEnv('development', process.cwd(), '');
  const url = process.env.DOVELA_BACKEND_READY_URL || resolveReadyUrl(env);
  const timeoutMs = Number(process.env.DOVELA_BACKEND_READY_TIMEOUT_MS || 120000);
  process.stdout.write(`Waiting for backend readiness at ${url}...\n`);
  await waitForBackend({ url, timeoutMs });
  process.stdout.write('Backend is ready.\n');
}
