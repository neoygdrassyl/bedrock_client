// e2e/global-teardown.js
import { cleanupPlaywrightTmp } from './config.js';

export default async function globalTeardown() {
  await cleanupPlaywrightTmp();
}
