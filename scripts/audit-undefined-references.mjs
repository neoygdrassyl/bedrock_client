#!/usr/bin/env node

/**
 * Reports identifiers that are read but never bound in any enclosing scope.
 *
 * The bundler cannot catch these: an unbound identifier is a runtime
 * ReferenceError, not a resolution error, so the build stays green and the
 * crash only shows up when a user reaches that line. The case that motivated
 * this check was `setSnapshotInfo(null)` surviving in fun_newversion.js after
 * the useState it belonged to was deleted, which broke saving a FUN version.
 *
 * Each identifier is reported once per file, at its first unbound reference;
 * the same name may be read from several call sites in that file.
 *
 * Run with --strict to exit non-zero on findings.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';

const traverse = traverseModule.default ?? traverseModule;

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
  'test-results',
]);

const STRICT_MODE = process.argv.includes('--strict');

// Language builtins. Anything here is legitimately unbound in module scope.
const LANGUAGE_GLOBALS = new Set([
  'Array', 'ArrayBuffer', 'BigInt', 'Boolean', 'DataView', 'Date', 'Error',
  'EvalError', 'Float32Array', 'Float64Array', 'Function', 'Infinity',
  'Int8Array', 'Int16Array', 'Int32Array', 'Intl', 'JSON', 'Map', 'Math',
  'NaN', 'Number', 'Object', 'Promise', 'Proxy', 'RangeError',
  'ReferenceError', 'Reflect', 'RegExp', 'Set', 'String', 'Symbol',
  'SyntaxError', 'TypeError', 'URIError', 'Uint8Array', 'Uint8ClampedArray',
  'Uint16Array', 'Uint32Array', 'WeakMap', 'WeakRef', 'WeakSet',
  'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent',
  'globalThis', 'isFinite', 'isNaN', 'parseFloat', 'parseInt', 'undefined',
]);

// Browser and platform surface this app actually uses.
const BROWSER_GLOBALS = new Set([
  'AbortController', 'AbortSignal', 'Audio', 'Blob', 'CSS', 'CustomEvent',
  'DOMParser', 'Element', 'Event', 'EventSource', 'File', 'FileReader',
  'FormData', 'Headers', 'HTMLAnchorElement', 'HTMLElement', 'Image',
  'IntersectionObserver', 'MutationObserver', 'Node', 'NodeList',
  'Notification', 'ReadableStream', 'Request', 'ResizeObserver', 'Response',
  'Storage', 'TextDecoder', 'TextEncoder', 'URL', 'URLSearchParams',
  'WebSocket', 'Worker', 'XMLHttpRequest',
  'alert', 'atob', 'btoa', 'cancelAnimationFrame', 'clearInterval',
  'clearTimeout', 'confirm', 'console', 'crypto', 'document', 'fetch',
  'getComputedStyle', 'history', 'localStorage', 'location', 'matchMedia',
  'navigator', 'performance', 'prompt', 'queueMicrotask',
  'requestAnimationFrame', 'requestIdleCallback', 'screen', 'scrollTo',
  'sessionStorage', 'setInterval', 'setTimeout', 'structuredClone',
  'visualViewport', 'window',
]);

// Node/bundler surface that reaches source through the build.
const BUILD_GLOBALS = new Set([
  'Buffer', '__dirname', '__filename', 'exports', 'global', 'module',
  'process', 'require',
]);

// Vitest injects these when `globals: true`; only honoured for test files.
const TEST_GLOBALS = new Set([
  'afterAll', 'afterEach', 'beforeAll', 'beforeEach', 'describe', 'expect',
  'it', 'suite', 'test', 'vi', 'vitest',
]);

const BASE_ALLOWED = new Set([
  ...LANGUAGE_GLOBALS,
  ...BROWSER_GLOBALS,
  ...BUILD_GLOBALS,
]);

function isTestFile(filePath) {
  return /\.(test|spec)\.[jt]sx?$/.test(filePath)
    || filePath.includes(`${path.sep}__tests__${path.sep}`)
    || filePath.includes(`${path.sep}__mocks__${path.sep}`);
}

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

    if (!entry.isFile()) continue;

    if (ALLOWED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
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
    errorRecovery: false,
  });
}

/**
 * Babel records every reference it could not bind on the Program scope, which
 * is exactly the set an undefined-variable rule reports.
 */
function findUnboundReferences(ast, allowed) {
  const findings = [];

  traverse(ast, {
    Program(programPath) {
      for (const [name, node] of Object.entries(programPath.scope.globals)) {
        if (allowed.has(name)) continue;
        findings.push({
          name,
          line: node.loc?.start.line ?? 0,
          column: (node.loc?.start.column ?? 0) + 1,
        });
      }
      programPath.stop();
    },
  });

  return findings.sort((a, b) => a.line - b.line || a.column - b.column);
}

async function audit() {
  const files = [];
  for (const dir of SOURCE_DIRS) {
    const fullDir = path.join(ROOT, dir);
    if (await exists(fullDir)) await collectFiles(fullDir, files);
  }

  let checkedFiles = 0;
  let parseErrors = 0;
  let totalFindings = 0;
  const findingsByFile = [];

  for (const file of files.sort()) {
    const relative = path.relative(ROOT, file);
    const source = await fs.readFile(file, 'utf8');

    let ast;
    try {
      ast = parseFile(source, relative);
    } catch (error) {
      parseErrors += 1;
      console.error(`[audit:undefined] Parse error in ${relative}: ${error?.message ?? error}`);
      continue;
    }

    checkedFiles += 1;

    const allowed = isTestFile(file)
      ? new Set([...BASE_ALLOWED, ...TEST_GLOBALS])
      : BASE_ALLOWED;

    const findings = findUnboundReferences(ast, allowed);
    if (findings.length) {
      totalFindings += findings.length;
      findingsByFile.push({ file: relative, findings });
    }
  }

  console.log(`[audit:undefined] Checked ${checkedFiles} files. Unbound references: ${totalFindings}. Parse errors: ${parseErrors}.`);

  for (const group of findingsByFile) {
    console.log(`\n${group.file}`);
    for (const finding of group.findings) {
      console.log(`  - ${finding.line}:${finding.column} ${finding.name}`);
    }
  }

  if (parseErrors > 0) process.exit(1);
  if (STRICT_MODE && totalFindings > 0) process.exit(1);

  // Soft by default, matching the other audits in this folder.
  process.exit(0);
}

audit().catch((err) => {
  console.error('[audit:undefined] Unexpected error:', err?.message ?? err);
  process.exit(1);
});
