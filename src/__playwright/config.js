/**
 * Playwright Standardized Configuration
 *
 * Centralizes screenshot/trace/artifact storage and cleanup.
 * All Playwright tests (E2E + MCP) use this single point of configuration.
 *
 * Usage:
 *   import { PLAYWRIGHT_TMP, initPlaywrightTmp, cleanupPlaywrightTmp } from 'src/__playwright/config.js';
 *
 *   // In test setup:
 *   await initPlaywrightTmp();
 *
 *   // In test teardown:
 *   await cleanupPlaywrightTmp();
 */

import os from 'os';
import path from 'path';
import { promises as fs } from 'fs';

/**
 * Standardized temp directory for all Playwright artifacts.
 * Uses ~/.copilot/session-state/playwright-tmp if available (persistent across agent runs),
 * otherwise falls back to OS temp directory.
 */
const getPlaywrightTmpDir = () => {
  const sessionState = process.env.COPILOT_SESSION_STATE;
  if (sessionState) {
    return path.join(sessionState, 'playwright-tmp');
  }
  return path.join(os.tmpdir(), 'dovela-playwright');
};

export const PLAYWRIGHT_TMP = getPlaywrightTmpDir();

/**
 * Initialize Playwright temp directory.
 * Safe to call multiple times; creates if missing, warns on error but doesn't throw.
 */
export const initPlaywrightTmp = async () => {
  try {
    await fs.mkdir(PLAYWRIGHT_TMP, { recursive: true });
    console.log(`[Playwright] Temp directory initialized: ${PLAYWRIGHT_TMP}`);
    return PLAYWRIGHT_TMP;
  } catch (err) {
    console.warn(`[Playwright] Failed to initialize temp directory: ${err.message}`);
    return PLAYWRIGHT_TMP;
  }
};

/**
 * Clean up Playwright temp directory after tests.
 * Removes ALL artifacts (screenshots, traces, videos, etc).
 * Safe to call multiple times; fails silently.
 */
export const cleanupPlaywrightTmp = async () => {
  try {
    await fs.rm(PLAYWRIGHT_TMP, { recursive: true, force: true });
    console.log(`[Playwright] Cleanup complete: ${PLAYWRIGHT_TMP}`);
  } catch (err) {
    console.warn(`[Playwright] Failed to cleanup: ${err.message}`);
  }
};

/**
 * Get path for a specific artifact type within the temp directory.
 * Useful for organizing screenshots, traces, etc.
 *
 * @param {string} artifactType - 'screenshots', 'traces', 'videos', etc.
 * @returns {string} Full path to artifact subdirectory
 */
export const getArtifactPath = (artifactType = 'screenshots') => {
  return path.join(PLAYWRIGHT_TMP, artifactType);
};

/**
 * Register cleanup on process exit (for CLI/Node.js environments).
 * Call this once at startup to ensure cleanup even if tests crash.
 */
export const registerCleanupOnExit = () => {
  process.on('exit', async () => {
    await cleanupPlaywrightTmp();
  });
};
