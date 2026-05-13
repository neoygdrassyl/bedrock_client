#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';

const [, , modeArg = 'production', ...flags] = process.argv;
const validModes = new Set(['development', 'production']);

if (!validModes.has(modeArg)) {
  console.error(`Invalid Vite build mode "${modeArg}". Use "development" or "production".`);
  process.exit(1);
}

const require = createRequire(import.meta.url);
const vitePackageJson = require.resolve('vite/package.json');
const viteBin = path.join(path.dirname(vitePackageJson), 'bin/vite.js');
const shouldAnalyze = flags.includes('--analyze');
const env = {
  ...process.env,
  NODE_OPTIONS: withBuildHeap(process.env.NODE_OPTIONS),
};

if (shouldAnalyze) {
  env.VITE_BUILD_ANALYZE = 'true';
} else if (env.VITE_BUILD_ANALYZE === undefined) {
  env.VITE_BUILD_ANALYZE = 'false';
}

const result = spawnSync(
  process.execPath,
  [viteBin, 'build', '--mode', modeArg],
  {
    env,
    stdio: 'inherit',
  },
);

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);

function withBuildHeap(currentOptions = '') {
  const heapOption = '--max-old-space-size=4096';
  const options = currentOptions.split(/\s+/).filter(Boolean);

  if (options.some((option) => option.startsWith('--max-old-space-size='))) {
    return options.join(' ');
  }

  return [...options, heapOption].join(' ');
}
