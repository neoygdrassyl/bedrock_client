// e2e/global-setup.js
import { initPlaywrightTmp } from './config.js';

export default async function globalSetup() {
  await initPlaywrightTmp();
}
