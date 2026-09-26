import { pathToFileURL } from 'node:url';

const DEFAULT_URL = 'http://127.0.0.1:3001/health/ready';

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
  const url = process.env.DOVELA_BACKEND_READY_URL || DEFAULT_URL;
  const timeoutMs = Number(process.env.DOVELA_BACKEND_READY_TIMEOUT_MS || 120000);
  process.stdout.write(`Waiting for backend readiness at ${url}...\n`);
  await waitForBackend({ url, timeoutMs });
  process.stdout.write('Backend is ready.\n');
}
