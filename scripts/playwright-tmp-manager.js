#!/usr/bin/env node

/**
 * Playwright Temp Directory Manager
 *
 * Quick utilities for Copilot agents using Playwright in debugging sessions.
 * 
 * Usage (in Node.js scripts or Copilot agent prompts):
 *   import { init, cleanup, getTmp } from './scripts/playwright-tmp-manager.js';
 *   
 *   await init();  // Set up temp directory
 *   console.log(`Artifacts here: ${getTmp()}`);
 *   // Use browser/tests
 *   await cleanup();  // Clean up when done
 */

import os from 'os';
import path from 'path';
import { promises as fs } from 'fs';

const getTmp = () => {
  const sessionState = process.env.COPILOT_SESSION_STATE;
  if (sessionState) {
    return path.join(sessionState, 'playwright-tmp');
  }
  return path.join(os.tmpdir(), 'dovela-playwright');
};

const init = async () => {
  const tmpDir = getTmp();
  try {
    await fs.mkdir(tmpDir, { recursive: true });
    console.log(`✓ Playwright temp initialized: ${tmpDir}`);
    return tmpDir;
  } catch (err) {
    console.warn(`⚠ Failed to init temp: ${err.message}`);
    return tmpDir;
  }
};

const cleanup = async () => {
  const tmpDir = getTmp();
  try {
    await fs.rm(tmpDir, { recursive: true, force: true });
    console.log(`✓ Playwright temp cleaned: ${tmpDir}`);
  } catch (err) {
    console.warn(`⚠ Failed to cleanup: ${err.message}`);
  }
};

const list = async () => {
  const tmpDir = getTmp();
  try {
    const items = await fs.readdir(tmpDir, { recursive: true });
    if (items.length === 0) {
      console.log(`✓ Temp directory is clean (${tmpDir})`);
    } else {
      console.log(`Found ${items.length} artifacts in ${tmpDir}:`);
      items.forEach(item => console.log(`  ${item}`));
    }
  } catch (err) {
    console.log(`✓ Temp directory does not exist (${tmpDir})`);
  }
};

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const cmd = process.argv[2];
  
  switch (cmd) {
    case 'init':
      await init();
      break;
    case 'cleanup':
      await cleanup();
      break;
    case 'ls':
    case 'list':
      await list();
      break;
    case 'path':
      console.log(getTmp());
      break;
    default:
      console.log(`
Playwright Temp Manager

Usage:
  node scripts/playwright-tmp-manager.js init     # Create temp directory
  node scripts/playwright-tmp-manager.js cleanup  # Remove all artifacts
  node scripts/playwright-tmp-manager.js ls       # List artifacts
  node scripts/playwright-tmp-manager.js path     # Print temp path

Temp location: ${getTmp()}
`);
  }
}

export { init, cleanup, list, getTmp };
