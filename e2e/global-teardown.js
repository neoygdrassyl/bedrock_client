// e2e/global-teardown.js
import { cleanupPlaywrightTmp } from '../src/__playwright/config.js';

export default async function globalTeardown() {
  await cleanupPlaywrightTmp();
}
