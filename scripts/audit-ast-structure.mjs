#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { parse } from '@babel/parser';

const ROOT = process.cwd();
const SOURCE_DIRS = ['src'];
const ALLOWED_EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.cjs']);
const EXCLUDED_DIRS = new Set([
  '.git',
  'node_modules',
  'build',
  'dist',
  'coverage',
  'playwright-report',
  'test-results'
]);

async function exists(dirPath) {
  try {
    await fs.access(dirPath);
    return true;
  } catch {
    return false;
  }
}

async function collectFiles(startDir, files = []) {
  const entries = await fs.readdir(startDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(startDir, entry.name);

    if (entry.isDirectory()) {
      if (!EXCLUDED_DIRS.has(entry.name)) {
        await collectFiles(fullPath, files);
      }
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (ALLOWED_EXTENSIONS.has(ext)) {
      files.push(fullPath);
    }
  }

  return files;
}

function parseFile(source, filename) {
  return parse(source, {
    sourceType: 'unambiguous',
    sourceFilename: filename,
    plugins: ['jsx'],
    errorRecovery: false
  });
}

function formatError(err) {
  const line = err?.loc?.line ?? '?';
  const column = err?.loc?.column ?? '?';
  const message = err?.message ?? 'Unknown parser error';
  return `line ${line}, col ${column} -> ${message}`;
}

async function audit() {
  const missingDirs = [];
  const targetDirs = [];

  for (const dir of SOURCE_DIRS) {
    const abs = path.join(ROOT, dir);
    if (await exists(abs)) {
      targetDirs.push(abs);
    } else {
      missingDirs.push(dir);
    }
  }

  if (targetDirs.length === 0) {
    console.error('[audit:ast] No source directories found.');
    if (missingDirs.length > 0) {
      console.error(`[audit:ast] Checked: ${missingDirs.join(', ')}`);
    }
    process.exit(1);
  }

  const fileListNested = await Promise.all(targetDirs.map((dir) => collectFiles(dir)));
  const files = fileListNested.flat().sort();

  let checked = 0;
  const failures = [];

  for (const file of files) {
    checked += 1;
    const rel = path.relative(ROOT, file);

    try {
      const source = await fs.readFile(file, 'utf8');
      parseFile(source, rel);
    } catch (err) {
      failures.push({ file: rel, details: formatError(err) });
    }
  }

  if (failures.length === 0) {
    console.log(`[audit:ast] OK. Parsed ${checked} files with no syntax/structure errors.`);
    process.exit(0);
  }

  console.error(`[audit:ast] FAIL. Found ${failures.length} file(s) with parse errors out of ${checked} checked.`);
  for (const failure of failures) {
    console.error(`- ${failure.file}: ${failure.details}`);
  }

  process.exit(1);
}

audit().catch((err) => {
  console.error('[audit:ast] Unexpected error:', err?.message ?? err);
  process.exit(1);
});
