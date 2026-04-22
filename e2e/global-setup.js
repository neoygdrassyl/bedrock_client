// e2e/global-setup.js
import { initPlaywrightTmp } from '../src/__playwright/config.js';

export default async function globalSetup() {
  await initPlaywrightTmp();
}
