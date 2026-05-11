#!/usr/bin/env node

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const REACT_DOCTOR_VERSION = '0.1.6';

function parseArgs(argv) {
  const args = { out: '.sisyphus/evidence/react-doctor/latest' };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--out') {
      args.out = argv[index + 1];
      index += 1;
    }
  }
  return args;
}

function extractJson(text) {
  const trimmed = text.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    const firstArray = trimmed.indexOf('[');
    const firstObject = trimmed.indexOf('{');
    const starts = [firstArray, firstObject].filter((value) => value >= 0).sort((a, b) => a - b);
    for (const start of starts) {
      try {
        return JSON.parse(trimmed.slice(start));
      } catch {
        // Keep looking; React Doctor may print non-JSON status lines before JSON.
      }
    }
  }

  return null;
}

function normalizeDiagnostics(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.issues)) return payload.issues;
  if (Array.isArray(payload?.diagnostics)) return payload.diagnostics;
  return [];
}

const args = parseArgs(process.argv.slice(2));
mkdirSync(args.out, { recursive: true });

const result = spawnSync(
  'npx',
  ['--yes', `react-doctor@${REACT_DOCTOR_VERSION}`, '.', '--verbose', '--json'],
  { encoding: 'utf8', maxBuffer: 1024 * 1024 * 200 },
);

writeFileSync(join(args.out, 'stdout.log'), result.stdout || '');
writeFileSync(join(args.out, 'stderr.log'), result.stderr || '');
writeFileSync(
  join(args.out, 'metadata.json'),
  `${JSON.stringify({
    command: `npx --yes react-doctor@${REACT_DOCTOR_VERSION} . --verbose --json`,
    status: result.status,
    signal: result.signal,
    error: result.error ? String(result.error.message || result.error) : null,
  }, null, 2)}\n`,
);

if (result.error) {
  console.error(result.error.message || result.error);
  process.exit(1);
}

const parsed = extractJson(result.stdout || '');
if (!parsed) {
  console.error('React Doctor did not produce parseable JSON output. See stdout.log and stderr.log.');
  process.exit(1);
}

const diagnostics = normalizeDiagnostics(parsed);
writeFileSync(join(args.out, 'diagnostics.json'), `${JSON.stringify(diagnostics, null, 2)}\n`);

const severityCounts = diagnostics.reduce((counts, issue) => {
  const severity = issue.severity || 'unknown';
  counts[severity] = (counts[severity] || 0) + 1;
  return counts;
}, {});

console.log(`React Doctor ${REACT_DOCTOR_VERSION}: ${diagnostics.length} issues`);
console.log(JSON.stringify(severityCounts, null, 2));
